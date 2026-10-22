import "server-only";

import { SOCIAL_BUCKET } from "@/lib/media/storage";
import { createAdminClient, isSupabaseWritable, SUPABASE_URL } from "@/lib/supabase/server";

/* ============================================================================
   REDES SOCIALES, DESDE EL PANEL
   ----------------------------------------------------------------------------
   Todo con la clave SECRETA, y aquí no hay matiz posible: en `social_accounts`
   viven tokens de publicación. Quien lea esa fila puede publicar en nombre de
   la casa. Las tres tablas tienen RLS activo y ninguna política, así que la
   clave que viaja al navegador no las ve ni aunque alguien la copie.

   La autorización se resuelve ANTES de llamar aquí, en las acciones, con
   `requireRole(TEAM_ROLES)` y `can(rol, …, "content")`.
   ========================================================================== */

export type Red = "instagram" | "tiktok";

export type EstadoDeRed =
  | "pending"
  | "creating"
  | "processing"
  | "published"
  | "failed"
  /** TikTok mientras se publica a mano. No es un fallo: es el camino de hoy. */
  | "manual";

export type Cuenta = {
  readonly id: string;
  readonly network: Red;
  readonly externalId: string;
  readonly username: string | null;
  readonly accessToken: string;
  readonly tokenExpiresAt: string | null;
};

export type Destino = {
  readonly network: Red;
  readonly status: EstadoDeRed;
  readonly externalId: string | null;
  readonly permalink: string | null;
  readonly error: string | null;
  readonly startedAt: string | null;
};

export type Publicacion = {
  readonly id: string;
  readonly caption: string;
  /** La dirección pública del vídeo. Se compone al leer, no se guarda. */
  readonly videoUrl: string;
  readonly path: string;
  readonly bytes: number;
  readonly status: "draft" | "publishing" | "done" | "failed";
  readonly createdAt: string;
  readonly publishedAt: string | null;
  readonly destinos: readonly Destino[];
};

/**
 * La dirección pública de un archivo del bucket.
 *
 * Misma fórmula que el catálogo. Importa que sea DIRECTA y sin redirecciones:
 * Instagram descarga el vídeo de aquí, y una redirección rompería la descarga.
 */
export function urlDelVideo(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${SOCIAL_BUCKET}/${path}`;
}

/* --- Cuentas ---------------------------------------------------------------- */

type FilaCuenta = {
  id: string;
  network: Red;
  external_id: string;
  username: string | null;
  access_token: string;
  token_expires_at: string | null;
};

const COLUMNAS_CUENTA = "id, network, external_id, username, access_token, token_expires_at";

export async function cuentaDe(red: Red): Promise<Cuenta | null> {
  if (!isSupabaseWritable()) return null;

  const { data, error } = await createAdminClient()
    .from("social_accounts")
    .select(COLUMNAS_CUENTA)
    .eq("network", red)
    .maybeSingle<FilaCuenta>();

  if (error) throw new Error(`No se pudo leer la cuenta: ${error.message}`);
  if (!data) return null;

  return {
    id: data.id,
    network: data.network,
    externalId: data.external_id,
    username: data.username,
    accessToken: data.access_token,
    tokenExpiresAt: data.token_expires_at,
  };
}

/**
 * Guarda o reemplaza la cuenta de una red.
 *
 * Una sola fila por red —lo garantiza un índice único— porque dos filas de la
 * misma cuenta significarían publicar dos veces el mismo vídeo.
 */
export async function guardarCuenta(entrada: {
  readonly network: Red;
  readonly externalId: string;
  readonly username: string | null;
  readonly accessToken: string;
  readonly refreshToken?: string | null;
  readonly tokenExpiresAt: string | null;
  readonly connectedBy: string;
}): Promise<void> {
  if (!isSupabaseWritable()) throw new Error("Falta SUPABASE_SECRET_KEY.");

  const { error } = await createAdminClient()
    .from("social_accounts")
    .upsert(
      {
        network: entrada.network,
        external_id: entrada.externalId,
        username: entrada.username,
        access_token: entrada.accessToken,
        refresh_token: entrada.refreshToken ?? null,
        token_expires_at: entrada.tokenExpiresAt,
        connected_by: entrada.connectedBy,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "network" },
    );

  if (error) throw new Error(`No se pudo guardar la cuenta: ${error.message}`);
}

/** Solo el token y su caducidad: lo que cambia al renovar. */
export async function actualizarToken(red: Red, token: string, expiraEn: Date): Promise<void> {
  const { error } = await createAdminClient()
    .from("social_accounts")
    .update({
      access_token: token,
      token_expires_at: expiraEn.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("network", red);

  if (error) throw new Error(`No se pudo guardar el acceso renovado: ${error.message}`);
}

export async function olvidarCuenta(red: Red): Promise<void> {
  const { error } = await createAdminClient().from("social_accounts").delete().eq("network", red);
  if (error) throw new Error(`No se pudo desconectar la cuenta: ${error.message}`);
}

/* --- Publicaciones ----------------------------------------------------------- */

type FilaDestino = {
  network: Red;
  status: EstadoDeRed;
  external_id: string | null;
  permalink: string | null;
  error: string | null;
  started_at: string | null;
};

type FilaPublicacion = {
  id: string;
  caption: string;
  path: string;
  bytes: number;
  status: Publicacion["status"];
  created_at: string;
  published_at: string | null;
  social_targets: FilaDestino[] | null;
};

const COLUMNAS_PUBLICACION =
  "id, caption, path, bytes, status, created_at, published_at, " +
  "social_targets(network, status, external_id, permalink, error, started_at)";

function aPublicacion(fila: FilaPublicacion): Publicacion {
  return {
    id: fila.id,
    caption: fila.caption,
    videoUrl: urlDelVideo(fila.path),
    path: fila.path,
    bytes: fila.bytes,
    status: fila.status,
    createdAt: fila.created_at,
    publishedAt: fila.published_at,
    destinos: (fila.social_targets ?? []).map((destino) => ({
      network: destino.network,
      status: destino.status,
      externalId: destino.external_id,
      permalink: destino.permalink,
      error: destino.error,
      startedAt: destino.started_at,
    })),
  };
}

export async function publicaciones(limite = 30): Promise<readonly Publicacion[]> {
  if (!isSupabaseWritable()) return [];

  const { data, error } = await createAdminClient()
    .from("social_posts")
    .select(COLUMNAS_PUBLICACION)
    .order("created_at", { ascending: false })
    .limit(limite)
    .returns<FilaPublicacion[]>();

  if (error) throw new Error(`No se pudieron leer las publicaciones: ${error.message}`);
  return (data ?? []).map(aPublicacion);
}

export async function publicacion(id: string): Promise<Publicacion | null> {
  if (!isSupabaseWritable()) return null;

  const { data, error } = await createAdminClient()
    .from("social_posts")
    .select(COLUMNAS_PUBLICACION)
    .eq("id", id)
    .maybeSingle<FilaPublicacion>();

  if (error) throw new Error(`No se pudo leer la publicación: ${error.message}`);
  return data ? aPublicacion(data) : null;
}

/**
 * Crea la publicación y su fila por cada red elegida.
 *
 * Las filas de destino nacen aquí, con el vídeo, y no al publicar: así la
 * pantalla puede enseñar desde el primer momento a dónde va a ir esto, y un
 * reintento no tiene que inventarse una fila que debería existir.
 */
export async function crearPublicacion(entrada: {
  readonly id: string;
  readonly caption: string;
  readonly path: string;
  readonly mimeType: string;
  readonly bytes: number;
  readonly redes: readonly Red[];
  readonly createdBy: string;
}): Promise<void> {
  if (!isSupabaseWritable()) throw new Error("Falta SUPABASE_SECRET_KEY.");

  const supabase = createAdminClient();

  const { error } = await supabase.from("social_posts").insert({
    id: entrada.id,
    caption: entrada.caption,
    bucket: SOCIAL_BUCKET,
    path: entrada.path,
    mime_type: entrada.mimeType,
    bytes: entrada.bytes,
    created_by: entrada.createdBy,
  });

  if (error) throw new Error(`No se pudo guardar la publicación: ${error.message}`);

  const { error: fallo } = await supabase.from("social_targets").insert(
    entrada.redes.map((red) => ({
      post_id: entrada.id,
      network: red,
      // TikTok nace «a mano»: todavía no se publica por API, y decirlo desde
      // el principio es más honesto que dejarlo en «pendiente» para siempre.
      status: red === "tiktok" ? "manual" : "pending",
    })),
  );

  if (fallo) throw new Error(`No se pudieron preparar las redes: ${fallo.message}`);
}

export async function marcarDestino(
  postId: string,
  red: Red,
  cambios: {
    readonly status: EstadoDeRed;
    readonly externalId?: string | null;
    readonly permalink?: string | null;
    readonly error?: string | null;
    readonly startedAt?: string | null;
  },
): Promise<void> {
  const { error } = await createAdminClient()
    .from("social_targets")
    .update({
      status: cambios.status,
      ...(cambios.externalId !== undefined ? { external_id: cambios.externalId } : {}),
      ...(cambios.permalink !== undefined ? { permalink: cambios.permalink } : {}),
      ...(cambios.error !== undefined ? { error: cambios.error } : {}),
      ...(cambios.startedAt !== undefined ? { started_at: cambios.startedAt } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("post_id", postId)
    .eq("network", red);

  if (error) throw new Error(`No se pudo guardar el estado: ${error.message}`);
}

/**
 * Recalcula el estado de la publicación a partir del de sus redes.
 *
 * El estado de arriba es un RESUMEN, nunca una verdad propia: si se escribiera
 * a mano acabaría contradiciendo a las filas que lo originan, que es el error
 * clásico de tener el mismo dato en dos sitios.
 */
export async function recalcularEstado(postId: string): Promise<void> {
  const ficha = await publicacion(postId);
  if (!ficha) return;

  // Lo que se publica a mano no cuenta para decidir si esto terminó: si
  // contara, una publicación con TikTok pendiente jamás estaría «lista».
  const automaticos = ficha.destinos.filter((destino) => destino.status !== "manual");

  const estado: Publicacion["status"] = automaticos.some((d) => d.status === "failed")
    ? "failed"
    : automaticos.length > 0 && automaticos.every((d) => d.status === "published")
      ? "done"
      : automaticos.some((d) => d.status === "creating" || d.status === "processing")
        ? "publishing"
        : "draft";

  const publicado =
    estado === "done" && !ficha.publishedAt ? { published_at: new Date().toISOString() } : {};

  const { error } = await createAdminClient()
    .from("social_posts")
    .update({ status: estado, ...publicado })
    .eq("id", postId);

  if (error) throw new Error(`No se pudo guardar el estado: ${error.message}`);
}

export async function borrarPublicacion(id: string): Promise<string | null> {
  const ficha = await publicacion(id);
  if (!ficha) return null;

  // El borrado en cascada se lleva las filas de destino; el archivo del
  // almacenamiento no lo sabe nadie, así que su ruta se devuelve para que
  // quien llama lo retire también.
  const { error } = await createAdminClient().from("social_posts").delete().eq("id", id);
  if (error) throw new Error(`No se pudo borrar: ${error.message}`);

  return ficha.path;
}
