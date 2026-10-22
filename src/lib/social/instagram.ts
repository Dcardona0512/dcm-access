import "server-only";

/* ============================================================================
   INSTAGRAM — PUBLICAR UN REEL
   ----------------------------------------------------------------------------
   Se usa «Instagram API with Instagram Login», no la vía antigua por Página de
   Facebook. La diferencia no es de gusto: esa vía NO exige tener una Página
   vinculada, y aquí no hay ninguna ni tiene sentido crearla.

   Lo que hace viable todo esto está en una frase de la documentación de Meta:
   para publicar en UNA CUENTA PROPIA, añadida a la aplicación en el panel, el
   acceso estándar basta. Ni revisión de la aplicación, ni verificación de
   negocio. El día que se quiera publicar en la cuenta de un tercero —un socio,
   un cliente— eso deja de ser cierto y hay que pasar por las dos.

   PUBLICAR SON TRES PASOS Y NO UNO, y el de en medio manda sobre el diseño de
   la pantalla:

     1. Se crea un CONTENEDOR con la dirección del vídeo. Instagram no recibe
        el archivo: lo descarga él de donde se le diga, y por eso el bucket es
        público.
     2. Instagram PROCESA, y puede tardar minutos. Hay que preguntar por el
        estado hasta que termine; Meta recomienda una vez por minuto y no más
        de cinco. El contenedor caduca a las 24 horas.
     3. Solo entonces se PUBLICA, con el identificador del contenedor.

   Nada de esto cabe en una sola petición, y de ahí que el estado viva en la
   base de datos y no en memoria.
   ========================================================================== */

const API = "https://graph.instagram.com/v23.0";

/** Lo que Instagram responde al preguntar por un contenedor. */
export type EstadoContenedor = "EXPIRED" | "ERROR" | "FINISHED" | "IN_PROGRESS" | "PUBLISHED";

export type ErrorDeInstagram = {
  readonly mensaje: string;
  /**
   * Si reintentar tiene sentido.
   *
   * Un vídeo que Instagram rechaza por su formato no mejora reintentándolo, y
   * ofrecer el botón sería mentir. Un corte de red, sí.
   */
  readonly reintentable: boolean;
};

export class FalloDeInstagram extends Error {
  readonly reintentable: boolean;

  constructor({ mensaje, reintentable }: ErrorDeInstagram) {
    super(mensaje);
    this.name = "FalloDeInstagram";
    this.reintentable = reintentable;
  }
}

/**
 * Una llamada a la API, con el error traducido a algo que se pueda enseñar.
 *
 * Meta devuelve 200 con un cuerpo de error más veces de las que devuelve un
 * código de fallo, así que no vale mirar solo `response.ok`: hay que mirar si
 * viene `error` en el cuerpo.
 */
async function llamar(url: string, init: RequestInit): Promise<Record<string, unknown>> {
  let respuesta: Response;

  try {
    respuesta = await fetch(url, { ...init, cache: "no-store" });
  } catch {
    // Ni siquiera se llegó a hablar con Meta: esto sí se reintenta.
    throw new FalloDeInstagram({
      mensaje: "No se pudo contactar con Instagram.",
      reintentable: true,
    });
  }

  const cuerpo = (await respuesta.json().catch(() => ({}))) as Record<string, unknown>;
  const error = cuerpo.error as { message?: string; code?: number } | undefined;

  if (!respuesta.ok || error) {
    const mensaje = error?.message ?? `Instagram respondió ${respuesta.status}.`;
    /*
      El 190 es «token caducado o revocado» y es el fallo que más va a doler
      aquí, así que se nombra en lugar de dejar el texto críptico de Meta.
    */
    if (error?.code === 190) {
      throw new FalloDeInstagram({
        mensaje: "El acceso a Instagram caducó. Vuelva a conectar la cuenta.",
        reintentable: false,
      });
    }

    throw new FalloDeInstagram({ mensaje, reintentable: respuesta.status >= 500 });
  }

  return cuerpo;
}

/** Quién es el dueño de un token, para guardar su identificador y su nombre. */
export async function cuentaDelToken(
  token: string,
): Promise<{ readonly id: string; readonly username: string | null }> {
  const url = `${API}/me?fields=user_id,username&access_token=${encodeURIComponent(token)}`;
  const cuerpo = await llamar(url, { method: "GET" });

  /*
    `user_id` es el identificador de la cuenta profesional y `id` el del
    usuario de la aplicación. El que sirve para publicar es el primero, pero
    no todas las respuestas lo traen, así que se acepta el segundo como
    repuesto antes que fallar.
  */
  const id = (cuerpo.user_id ?? cuerpo.id) as string | undefined;
  if (!id) {
    throw new FalloDeInstagram({
      mensaje: "Instagram no devolvió el identificador de la cuenta.",
      reintentable: false,
    });
  }

  return { id: String(id), username: (cuerpo.username as string | undefined) ?? null };
}

/**
 * Paso 1: el contenedor.
 *
 * `video_url` tiene que ser alcanzable por Instagram EN ESE MOMENTO y sin
 * redirecciones. Es la razón de que el bucket de vídeos sea público.
 */
export async function crearContenedor(
  cuentaId: string,
  token: string,
  { videoUrl, caption }: { readonly videoUrl: string; readonly caption: string },
): Promise<string> {
  const parametros = new URLSearchParams({
    media_type: "REELS",
    video_url: videoUrl,
    caption,
    // Que salga también en el perfil y no solo en la pestaña de Reels. Lo
    // contrario esconde el vídeo de quien entra a la cuenta a mirar.
    share_to_feed: "true",
    access_token: token,
  });

  const cuerpo = await llamar(`${API}/${cuentaId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: parametros.toString(),
  });

  const id = cuerpo.id as string | undefined;
  if (!id) {
    throw new FalloDeInstagram({
      mensaje: "Instagram no devolvió el contenedor del vídeo.",
      reintentable: true,
    });
  }

  return id;
}

/** Paso 2: en qué punto va el procesado. */
export async function estadoDelContenedor(
  contenedorId: string,
  token: string,
): Promise<{ readonly estado: EstadoContenedor; readonly detalle: string | null }> {
  const url =
    `${API}/${contenedorId}?fields=status_code,status&access_token=` + encodeURIComponent(token);

  const cuerpo = await llamar(url, { method: "GET" });

  return {
    estado: (cuerpo.status_code as EstadoContenedor | undefined) ?? "IN_PROGRESS",
    // `status` trae el porqué cuando el estado es ERROR. Es lo único que
    // explica un rechazo, así que se conserva tal cual para enseñarlo.
    detalle: (cuerpo.status as string | undefined) ?? null,
  };
}

/** Paso 3: publicar. Devuelve el identificador del Reel ya publicado. */
export async function publicarContenedor(
  cuentaId: string,
  contenedorId: string,
  token: string,
): Promise<string> {
  const cuerpo = await llamar(`${API}/${cuentaId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ creation_id: contenedorId, access_token: token }).toString(),
  });

  const id = cuerpo.id as string | undefined;
  if (!id) {
    throw new FalloDeInstagram({
      mensaje: "Instagram aceptó la publicación pero no devolvió su identificador.",
      reintentable: false,
    });
  }

  return id;
}

/** El enlace público de un Reel ya publicado, para poder ir a verlo. */
export async function enlaceDelMedio(medioId: string, token: string): Promise<string | null> {
  try {
    const url = `${API}/${medioId}?fields=permalink&access_token=${encodeURIComponent(token)}`;
    const cuerpo = await llamar(url, { method: "GET" });
    return (cuerpo.permalink as string | undefined) ?? null;
  } catch {
    // Que no se pueda leer el enlace no invalida una publicación que ya salió.
    return null;
  }
}

/**
 * Renueva el token de larga duración.
 *
 * El de Instagram dura sesenta días y se puede renovar en cualquier momento a
 * partir de las primeras veinticuatro horas. Pero si se dejan pasar los
 * sesenta, MUERE PARA SIEMPRE: no hay renovación posible y hay que volver a
 * conectar la cuenta a mano. Por eso el panel lo renueva solo en cuanto le
 * quedan pocos días, en lugar de esperar al final.
 */
export async function renovarToken(
  token: string,
): Promise<{ readonly token: string; readonly expiraEn: Date }> {
  const url =
    `${API.replace("/v23.0", "")}/refresh_access_token?grant_type=ig_refresh_token` +
    `&access_token=${encodeURIComponent(token)}`;

  const cuerpo = await llamar(url, { method: "GET" });

  const nuevo = cuerpo.access_token as string | undefined;
  const segundos = Number(cuerpo.expires_in ?? 0);

  if (!nuevo || !Number.isFinite(segundos) || segundos <= 0) {
    throw new FalloDeInstagram({
      mensaje: "Instagram no renovó el acceso.",
      reintentable: false,
    });
  }

  return { token: nuevo, expiraEn: new Date(Date.now() + segundos * 1000) };
}
