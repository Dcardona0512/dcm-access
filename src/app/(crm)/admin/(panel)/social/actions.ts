"use server";

import { revalidatePath } from "next/cache";

import { can, TEAM_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import {
  borrarPublicacion,
  crearPublicacion,
  guardarCuenta,
  marcarDestino,
  olvidarCuenta,
  recalcularEstado,
  type Red,
} from "@/lib/data/supabase/social";
import { createAdminClient } from "@/lib/supabase/server";
import {
  createUploadSlots,
  removeMedia,
  SOCIAL_BUCKET,
  SOCIAL_VIDEO_MAX_BYTES,
  verifyUploads,
} from "@/lib/media/storage";
import { cuentaDelToken } from "@/lib/social/instagram";
import { avanzar, type Paso } from "@/lib/social/flujo";

/* ============================================================================
   ACCIONES DE REDES
   ----------------------------------------------------------------------------
   Todas empiezan igual, y no es ceremonia: una server action es una URL a la
   que se puede llamar directamente, así que la comprobación de quién entra y
   de qué puede hacer va aquí y no en la pantalla.

   El recurso es `content`: lo tienen el administrador y el gestor de
   contenido. Comercial y broker quedan fuera a propósito —publicar en las
   cuentas de la casa no es trabajo de ventas—.
   ========================================================================== */

async function exigirPermiso(accion: "read" | "create" | "update" | "delete") {
  const sesion = await requireRole(TEAM_ROLES);
  if (!can(sesion.role, accion, "content")) {
    throw new Error("Sin permiso para gestionar las redes.");
  }
  return sesion;
}

export type EstadoDeFormulario = {
  readonly status: "idle" | "success" | "error";
  readonly message?: string;
};

/* --- Conectar la cuenta ------------------------------------------------------ */

/**
 * Guarda el token de Instagram.
 *
 * Se pega a mano en lugar de construir todo el baile de OAuth, y es una
 * decisión de tamaño: mientras haya UNA cuenta por red, OAuth sería un
 * aeropuerto para un solo vuelo. El token lo genera el panel de Meta, dura
 * sesenta días y a partir de ahí se renueva solo.
 *
 * Lo primero que se hace con él es preguntarle a Instagram de quién es: así se
 * guarda ya el identificador con el que se publica, y un token mal copiado se
 * rechaza en el momento en lugar de fallar al primer vídeo.
 */
export async function conectarInstagram(
  _previo: EstadoDeFormulario,
  formData: FormData,
): Promise<EstadoDeFormulario> {
  const sesion = await exigirPermiso("create");

  const token = String(formData.get("token") ?? "").trim();
  if (token.length < 20) {
    return { status: "error", message: "Ese token no parece válido." };
  }

  try {
    const cuenta = await cuentaDelToken(token);

    await guardarCuenta({
      network: "instagram",
      externalId: cuenta.id,
      username: cuenta.username,
      accessToken: token,
      /*
        Sesenta días es lo que dura el token de larga duración de Instagram. No
        se pregunta porque la API no lo dice al validarlo; se asume el máximo y
        la renovación oportunista corrige la fecha en cuanto ocurre.
      */
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      connectedBy: sesion.userId,
    });

    revalidatePath("/admin/social");
    return { status: "success", message: `Conectada la cuenta ${cuenta.username ?? cuenta.id}.` };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "No se pudo conectar la cuenta.",
    };
  }
}

export async function desconectar(formData: FormData): Promise<void> {
  await exigirPermiso("delete");
  const red = String(formData.get("red") ?? "") as Red;
  if (red !== "instagram" && red !== "tiktok") throw new Error("Red no válida.");

  await olvidarCuenta(red);
  revalidatePath("/admin/social");
}

/* --- Subir el vídeo ---------------------------------------------------------- */

export async function pedirHuecoDeSubida(
  postId: string,
  archivo: { readonly mimeType: string; readonly bytes: number },
): Promise<{ ok: true; slot: { path: string; token: string } } | { ok: false; message: string }> {
  await exigirPermiso("create");

  try {
    const [slot] = await createUploadSlots(postId, [archivo], {
      bucket: SOCIAL_BUCKET,
      maxFiles: 1,
      maxVideoBytes: SOCIAL_VIDEO_MAX_BYTES,
    });

    return { ok: true, slot: { path: slot.path, token: slot.token } };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo preparar la subida.",
    };
  }
}

/**
 * Guarda el vídeo subido y sus redes, sin publicar todavía.
 *
 * Publicar es un paso aparte y a propósito: entre subir y publicar se relee el
 * pie, y una acción que hiciera las dos cosas convertiría cada error de
 * escritura en una publicación que hay que borrar de la red.
 */
export async function guardarVideo(
  _previo: EstadoDeFormulario,
  formData: FormData,
): Promise<EstadoDeFormulario> {
  const sesion = await exigirPermiso("create");

  const postId = String(formData.get("postId") ?? "");
  const caption = String(formData.get("caption") ?? "").trim();
  const path = String(formData.get("mediaPath") ?? "");
  const redes: Red[] = [];
  if (formData.get("instagram") === "on") redes.push("instagram");
  if (formData.get("tiktok") === "on") redes.push("tiktok");

  if (!path) return { status: "error", message: "Falta el vídeo." };
  if (redes.length === 0) return { status: "error", message: "Elija al menos una red." };
  if (caption.length > 2200) {
    return { status: "error", message: "El pie no puede pasar de 2.200 caracteres." };
  }

  try {
    // Nunca se cree al cliente: que el archivo esté de verdad en el bucket, y
    // su tamaño y su tipo, se leen del almacenamiento.
    const [archivo] = await verifyUploads(postId, [path], SOCIAL_BUCKET);
    if (!archivo) return { status: "error", message: "El vídeo no llegó a subirse." };

    await crearPublicacion({
      id: postId,
      caption,
      path: archivo.path,
      mimeType: archivo.mimeType,
      bytes: archivo.bytes,
      redes,
      createdBy: sesion.userId,
    });

    await createAdminClient()
      .from("audit_logs")
      .insert({
        actor_id: sesion.userId,
        actor_role: sesion.role,
        action: "social.create",
        entity_type: "social_post",
        entity_id: postId,
        metadata: { by: sesion.email, redes },
      });

    revalidatePath("/admin/social");
    return { status: "success", message: "Vídeo guardado." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "No se pudo guardar el vídeo.",
    };
  }
}

/* --- Publicar ---------------------------------------------------------------- */

/**
 * Da UN paso de la publicación y vuelve.
 *
 * La pantalla la llama en bucle mientras `sigue` sea cierto. El porqué de este
 * diseño está escrito en `src/lib/social/flujo.ts`.
 */
export async function avanzarPublicacion(postId: string): Promise<Paso> {
  await exigirPermiso("update");
  return avanzar(postId);
}

/** Da por hecho lo que se publicó a mano, para que deje de pedir atención. */
export async function marcarPublicadoAMano(formData: FormData): Promise<void> {
  const sesion = await exigirPermiso("update");

  const postId = String(formData.get("postId") ?? "");
  const red = String(formData.get("red") ?? "") as Red;
  if (!postId || (red !== "tiktok" && red !== "instagram")) throw new Error("Datos no válidos.");

  await marcarDestino(postId, red, { status: "published", error: null });
  await recalcularEstado(postId);

  await createAdminClient()
    .from("audit_logs")
    .insert({
      actor_id: sesion.userId,
      actor_role: sesion.role,
      action: "social.manual",
      entity_type: "social_post",
      entity_id: postId,
      metadata: { by: sesion.email, red },
    });

  revalidatePath("/admin/social");
}

export async function borrar(formData: FormData): Promise<void> {
  const sesion = await exigirPermiso("delete");

  const postId = String(formData.get("postId") ?? "");
  if (!postId) throw new Error("Publicación no válida.");

  /*
    Se borra de la base y del almacenamiento, en ese orden. Al revés quedaría
    una fila apuntando a un archivo que ya no está, que es peor que un archivo
    huérfano: la pantalla enseñaría un vídeo roto.

    Lo que ya salió en Instagram NO se retira: esto es la copia de trabajo, no
    la publicación de la red.
  */
  const path = await borrarPublicacion(postId);
  if (path) await removeMedia([path], SOCIAL_BUCKET);

  await createAdminClient()
    .from("audit_logs")
    .insert({
      actor_id: sesion.userId,
      actor_role: sesion.role,
      action: "social.delete",
      entity_type: "social_post",
      entity_id: postId,
      metadata: { by: sesion.email },
    });

  revalidatePath("/admin/social");
}
