/* ============================================================================
   RATE LIMITING (§40)
   ----------------------------------------------------------------------------
   Ventana deslizante en memoria. Suficiente para frenar el envío repetido de
   formularios en una instancia, y honesto sobre su límite: en despliegue
   distribuido cada instancia tiene su propio contador, así que antes de
   producción esto debe respaldarse en un store compartido (Redis, Upstash o
   una tabla de Supabase).

   La interfaz ya está pensada para ese cambio: sustituir la implementación de
   `check` no obliga a tocar ninguna server action.
   ========================================================================== */

type Bucket = {
  timestamps: number[];
};

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  readonly allowed: boolean;
  readonly remaining: number;
  /** Segundos que faltan para que se libere un hueco. */
  readonly retryAfter: number;
};

export type RateLimitOptions = {
  /** Envíos permitidos dentro de la ventana. */
  readonly limit?: number;
  /** Tamaño de la ventana en milisegundos. */
  readonly windowMs?: number;
};

export function checkRateLimit(
  key: string,
  { limit = 5, windowMs = 10 * 60 * 1000 }: RateLimitOptions = {},
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };

  // Descarta lo que ya salió de la ventana.
  bucket.timestamps = bucket.timestamps.filter((at) => now - at < windowMs);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0];
    buckets.set(key, bucket);
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((windowMs - (now - oldest)) / 1000),
    };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);

  // Poda perezosa: evita que el mapa crezca sin límite en procesos largos.
  if (buckets.size > 5000) {
    for (const [existingKey, existing] of buckets) {
      if (existing.timestamps.every((at) => now - at >= windowMs)) buckets.delete(existingKey);
    }
  }

  return { allowed: true, remaining: limit - bucket.timestamps.length, retryAfter: 0 };
}

/**
 * Campo trampa. Un bot rellena todo lo que encuentra; una persona no ve este
 * campo porque está oculto para la vista y para los lectores de pantalla.
 */
export const HONEYPOT_FIELD = "dcm_company_website";

export function isHoneypotTripped(formData: FormData): boolean {
  const value = formData.get(HONEYPOT_FIELD);
  return typeof value === "string" && value.trim().length > 0;
}
