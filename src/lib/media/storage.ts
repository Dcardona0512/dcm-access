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
   ========================================================================== */

export const BUCKET = "listing-media";

export const MEDIA_LIMITS = {
  maxFiles: 14,
  maxImageBytes: 10 * 1024 * 1024,
  maxVideoBytes: 100 * 1024 * 1024,
} as const;

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

export function maxBytesFor(mime: string): number {
  return isVideo(mime) ? MEDIA_LIMITS.maxVideoBytes : MEDIA_LIMITS.maxImageBytes;
}

export type UploadSlot = {
  readonly path: string;
  readonly token: string;
  readonly kind: "image" | "video";
  readonly mimeType: string;
};

/**
 * Acuña una URL firmada por archivo dentro de la carpeta de una ficha.
 *
 * El prefijo ordinal mantiene el orden natural al listar el bucket, y el
 * identificador aleatorio evita que dos subidas del mismo nombre se pisen.
 */
export async function createUploadSlots(
  listingId: string,
  files: readonly { readonly mimeType: string; readonly bytes: number }[],
): Promise<readonly UploadSlot[]> {
  const storage = createAdminClient().storage.from(BUCKET);
  const slots: UploadSlot[] = [];

  for (const [index, file] of files.entries()) {
    if (!isAllowedType(file.mimeType)) {
      throw new Error(`Tipo de archivo no permitido: ${file.mimeType}`);
    }
    if (file.bytes > maxBytesFor(file.mimeType)) {
      throw new Error("El archivo supera el tamaño máximo permitido.");
    }

    const extension = EXTENSIONS[file.mimeType];
    const ordinal = String(index + 1).padStart(2, "0");
    const path = `${listingId}/${ordinal}-${crypto.randomUUID().slice(0, 8)}.${extension}`;

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
  listingId: string,
  declared: readonly string[],
): Promise<readonly { path: string; mimeType: string; bytes: number }[]> {
  if (declared.length === 0) return [];

  const storage = createAdminClient().storage.from(BUCKET);
  const { data, error } = await storage.list(listingId, { limit: 100 });
  if (error) throw new Error(`No se pudo leer el almacenamiento: ${error.message}`);

  const present = new Map(
    (data ?? []).map((entry) => [
      `${listingId}/${entry.name}`,
      {
        mimeType: (entry.metadata?.mimetype as string) ?? "application/octet-stream",
        bytes: (entry.metadata?.size as number) ?? 0,
      },
    ]),
  );

  return declared
    // Toda ruta declarada tiene que vivir dentro de la carpeta de ESTA ficha:
    // si no, alguien podría reclamar los archivos de otra.
    .filter((path) => path.startsWith(`${listingId}/`) && present.has(path))
    .map((path) => ({ path, ...present.get(path)! }));
}

export async function removeMedia(paths: readonly string[]): Promise<void> {
  if (paths.length === 0) return;
  await createAdminClient().storage.from(BUCKET).remove([...paths]);
}
