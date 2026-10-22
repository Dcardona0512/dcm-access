import "server-only";

import {
  actualizarToken,
  cuentaDe,
  marcarDestino,
  publicacion,
  recalcularEstado,
  type Cuenta,
} from "@/lib/data/supabase/social";

import {
  crearContenedor,
  enlaceDelMedio,
  estadoDelContenedor,
  FalloDeInstagram,
  publicarContenedor,
  renovarToken,
} from "./instagram";

/* ============================================================================
   UN PASO CADA VEZ
   ----------------------------------------------------------------------------
   Publicar en Instagram no cabe en una petición: se crea un contenedor, la red
   procesa el vídeo durante minutos y solo entonces se publica. Con un servidor
   sin cola ni tareas programadas —que es lo que hay, y lo que se decidió— eso
   deja dos opciones: esperar dentro de una función hasta que caduque, o
   avanzar de paso en paso guardando dónde se quedó.

   Esto es lo segundo. `avanzar()` da UN paso y vuelve enseguida. La pantalla
   abierta lo llama cada pocos segundos; si se cierra, no se pierde nada,
   porque el punto exacto está en `social_targets` y el botón «continuar» lo
   retoma. El coste de este diseño, dicho claro: si nadie vuelve a abrir el
   panel, el vídeo se queda a medias y el contenedor caduca a las 24 horas.

   La alternativa —una cola de verdad— exige tareas programadas, y en el plan
   gratuito de Vercel corren una vez al día.
   ========================================================================== */

export type Paso = {
  /** Si queda trabajo por hacer. La pantalla deja de preguntar cuando es falso. */
  readonly sigue: boolean;
  readonly estado: string;
  readonly mensaje: string;
};

/** Cuánto antes de caducar se renueva el acceso, en días. */
const MARGEN_DE_RENOVACION = 15;

/**
 * Renueva el token si le queda poco, y devuelve el que haya que usar.
 *
 * Es oportunista a propósito: sin tareas programadas, el único momento seguro
 * para renovar es cuando alguien está usando el panel. Mientras se publique
 * algo cada dos meses, el acceso no muere nunca.
 */
export async function tokenVigente(cuenta: Cuenta): Promise<string> {
  if (!cuenta.tokenExpiresAt) return cuenta.accessToken;

  const quedan = new Date(cuenta.tokenExpiresAt).getTime() - Date.now();
  if (quedan > MARGEN_DE_RENOVACION * 24 * 60 * 60 * 1000) return cuenta.accessToken;

  try {
    const renovado = await renovarToken(cuenta.accessToken);
    await actualizarToken(cuenta.network, renovado.token, renovado.expiraEn);
    return renovado.token;
  } catch {
    /*
      Que falle la renovación no puede impedir publicar: el token viejo
      probablemente siga sirviendo durante días. El aviso de la cuenta atrás ya
      está en la pantalla, y es ahí donde se ve venir el problema.
    */
    return cuenta.accessToken;
  }
}

/**
 * Avanza la publicación de un vídeo en Instagram.
 *
 * Cada llamada mira dónde está y da el siguiente paso, nunca dos. Devolver el
 * control enseguida es lo que permite que esto funcione sin tareas en segundo
 * plano.
 */
export async function avanzar(postId: string): Promise<Paso> {
  const ficha = await publicacion(postId);
  if (!ficha) return { sigue: false, estado: "failed", mensaje: "La publicación no existe." };

  const destino = ficha.destinos.find((d) => d.network === "instagram");
  if (!destino) return { sigue: false, estado: "manual", mensaje: "No va a Instagram." };

  if (destino.status === "published") {
    return { sigue: false, estado: "published", mensaje: "Publicado." };
  }

  const cuenta = await cuentaDe("instagram");
  if (!cuenta) {
    await marcarDestino(postId, "instagram", {
      status: "failed",
      error: "No hay ninguna cuenta de Instagram conectada.",
    });
    await recalcularEstado(postId);
    return { sigue: false, estado: "failed", mensaje: "No hay cuenta de Instagram conectada." };
  }

  const token = await tokenVigente(cuenta);

  try {
    /* --- Paso 1: crear el contenedor ------------------------------------- */
    if (destino.status === "pending" || destino.status === "failed" || !destino.externalId) {
      await marcarDestino(postId, "instagram", { status: "creating", error: null });

      const contenedor = await crearContenedor(cuenta.externalId, token, {
        videoUrl: ficha.videoUrl,
        caption: ficha.caption,
      });

      await marcarDestino(postId, "instagram", {
        status: "processing",
        externalId: contenedor,
        startedAt: new Date().toISOString(),
      });
      await recalcularEstado(postId);

      return { sigue: true, estado: "processing", mensaje: "Instagram está procesando el vídeo." };
    }

    /* --- Paso 2: esperar a que termine de procesar ------------------------ */
    const { estado, detalle } = await estadoDelContenedor(destino.externalId, token);

    if (estado === "IN_PROGRESS") {
      return { sigue: true, estado: "processing", mensaje: "Instagram está procesando el vídeo." };
    }

    if (estado === "ERROR" || estado === "EXPIRED") {
      /*
        El caso que más va a aparecer, y el que peor se explica solo: Instagram
        exige que el MP4 lleve el índice al principio del archivo y no al
        final. Si el vídeo no cumple, responde ERROR y poco más.
      */
      const motivo =
        estado === "EXPIRED"
          ? "El vídeo caducó en Instagram: pasaron más de 24 horas sin publicarlo."
          : `Instagram rechazó el vídeo${detalle ? `: ${detalle}` : "."} ` +
            "Suele ser el formato: vuelva a exportarlo como MP4 (H.264).";

      await marcarDestino(postId, "instagram", {
        status: "failed",
        error: motivo,
        externalId: null,
      });
      await recalcularEstado(postId);

      return { sigue: false, estado: "failed", mensaje: motivo };
    }

    /* --- Paso 3: publicar -------------------------------------------------- */
    const medioId = await publicarContenedor(cuenta.externalId, destino.externalId, token);
    const enlace = await enlaceDelMedio(medioId, token);

    await marcarDestino(postId, "instagram", {
      status: "published",
      externalId: medioId,
      permalink: enlace,
      error: null,
    });
    await recalcularEstado(postId);

    return { sigue: false, estado: "published", mensaje: "Publicado en Instagram." };
  } catch (error) {
    const fallo =
      error instanceof FalloDeInstagram
        ? error
        : new FalloDeInstagram({ mensaje: "Fallo inesperado al publicar.", reintentable: true });

    await marcarDestino(postId, "instagram", {
      status: "failed",
      error: fallo.message,
      // Un contenedor que ya no sirve se olvida, para que el reintento empiece
      // por crear uno nuevo en lugar de insistir sobre el roto.
      ...(fallo.reintentable ? {} : { externalId: null }),
    });
    await recalcularEstado(postId);

    return { sigue: false, estado: "failed", mensaje: fallo.message };
  }
}
