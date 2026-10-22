import "server-only";

import { createAdminClient } from "@/lib/supabase/server";

/* ============================================================================
   ALMACENAMIENTO DE MEDIOS
   ----------------------------------------------------------------------------
   Los archivos NO viajan por una server action: en Next 16 el cuerpo de una
   acción está limitado a 1 MB por defecto, y una foto de un carro son varios.
   Aquí se acuñan URLs de subida firmadas y el navegador sube directo al
   almacenamiento, sin pasar por el servidor de la aplicación.

   La extensión se deriva del tipo MIME de la lista blanca, nunca del nombre
   que manda el cliente: así no hay forma de colar `../` ni de guardar un
   `.html` que luego se sirva desde el mismo dominio.

   DOS DESTINOS, UN SOLO MECANISMO. Esto nació para las fotos de una ficha y
   ahora lo usa también el vídeo que se publica en redes, que vive en otro
   bucket y con otros topes. En lugar de copiar el archivo entero —y heredar
   dos veces cada fallo que se arregle— el bucket y los límites son parámetros,
   con los de las fichas como valor por defecto para no tocar lo que ya
   funciona.
   ========================================================================== */

export const BUCKET = "listing-media";

/**
 * Los vídeos de las redes, en su propio bucket.
 *
 * PÚBLICO, y no por descuido: Instagram no recibe el archivo, lo DESCARGA de
 * una dirección, así que tiene que poder alcanzarla sin credenciales. La
 * consecuencia conviene tenerla presente: entre que se sube y se publica,
 * quien conozca la ruta exacta puede ver el vídeo.
 */
export const SOCIAL_BUCKET = "social-media";

export const MEDIA_LIMITS = {
  /** Mismo tope que muestra el formulario. Se comprueba también aquí porque el
   *  formulario es una comodidad y esto es la frontera de confianza. */
  maxFiles: 20,
  maxImageBytes: 10 * 1024 * 1024,
  maxVideoBytes: 100 * 1024 * 1024,
} as const;

/** Lo que admite un Reel: 300 MB. Es el tope de Instagram, no uno nuestro. */
export const SOCIAL_VIDEO_MAX_BYTES = 300 * 1024 * 1024;

export type OpcionesDeSubida = {
  readonly bucket?: string;
  readonly maxFiles?: number;
  readonly maxVideoBytes?: number;
};

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
};

export function isImage(mime: string): boolean {
  return mime.startsWith("image/") && mime in EXTENSIONS;
}

export function isVideo(mime: string): boolean {
  return mime.startsWith("video/") && mime in EXTENSIONS;
}

export function isAllowedType(mime: string): boolean {
  return mime in EXTENSIONS;
}

export function maxBytesFor(mime: string, maxVideoBytes = MEDIA_LIMITS.maxVideoBytes): number {
  return isVideo(mime) ? maxVideoBytes : MEDIA_LIMITS.maxImageBytes;
}

export type UploadSlot = {
  readonly path: string;
  readonly token: string;
  readonly kind: "image" | "video";
  readonly mimeType: string;
};

/**
 * Acuña una URL firmada por archivo dentro de una carpeta.
 *
 * La carpeta es el identificador de la ficha, o el de la publicación cuando lo
 * que se sube es un vídeo para las redes. El prefijo ordinal mantiene el orden
 * natural al listar el bucket, y el identificador aleatorio evita que dos
 * subidas del mismo nombre se pisen.
 */
export async function createUploadSlots(
  carpeta: string,
  files: readonly { readonly mimeType: string; readonly bytes: number }[],
  opciones: OpcionesDeSubida = {},
): Promise<readonly UploadSlot[]> {
  const bucket = opciones.bucket ?? BUCKET;
  const maxFiles = opciones.maxFiles ?? MEDIA_LIMITS.maxFiles;

  if (files.length > maxFiles) {
    throw new Error(`No se pueden subir más de ${maxFiles} archivos.`);
  }

  const storage = createAdminClient().storage.from(bucket);
  const slots: UploadSlot[] = [];

  for (const [index, file] of files.entries()) {
    if (!isAllowedType(file.mimeType)) {
      throw new Error(`Tipo de archivo no permitido: ${file.mimeType}`);
    }
    if (file.bytes > maxBytesFor(file.mimeType, opciones.maxVideoBytes)) {
      throw new Error("El archivo supera el tamaño máximo permitido.");
    }

    const extension = EXTENSIONS[file.mimeType];
    const ordinal = String(index + 1).padStart(2, "0");
    const path = `${carpeta}/${ordinal}-${crypto.randomUUID().slice(0, 8)}.${extension}`;

    const { data, error } = await storage.createSignedUploadUrl(path);
    if (error || !data) throw new Error(`No se pudo preparar la subida: ${error?.message}`);

    slots.push({
      path: data.path,
      token: data.token,
      kind: isVideo(file.mimeType) ? "video" : "image",
      mimeType: file.mimeType,
    });
  }

  return slots;
}

/**
 * Comprueba contra el almacenamiento que los archivos declarados existen.
 *
 * Nunca se cree al cliente: el manifiesto que llega con el formulario dice qué
 * se subió, y esto confirma qué se subió de verdad. El tamaño y el tipo se
 * leen de los metadatos del objeto, no del navegador.
 */
export async function verifyUploads(
  carpeta: string,
  declared: readonly string[],
  bucket: string = BUCKET,
): Promise<readonly { path: string; mimeType: string; bytes: number }[]> {
  if (declared.length === 0) return [];

  const storage = createAdminClient().storage.from(bucket);
  const { data, error } = await storage.list(carpeta, { limit: 100 });
  if (error) throw new Error(`No se pudo leer el almacenamiento: ${error.message}`);

  const present = new Map(
    (data ?? []).map((entry) => [
      `${carpeta}/${entry.name}`,
      {
        mimeType: (entry.metadata?.mimetype as string) ?? "application/octet-stream",
        bytes: (entry.metadata?.size as number) ?? 0,
      },
    ]),
  );

  return (
    declared
      // Toda ruta declarada tiene que vivir dentro de ESTA carpeta: si no,
      // alguien podría reclamar los archivos de otra ficha o de otro vídeo.
      .filter((path) => path.startsWith(`${carpeta}/`) && present.has(path))
      .map((path) => ({ path, ...present.get(path)! }))
  );
}

export async function removeMedia(
  paths: readonly string[],
  bucket: string = BUCKET,
): Promise<void> {
  if (paths.length === 0) return;
  await createAdminClient()
    .storage.from(bucket)
    .remove([...paths]);
}
