import "server-only";

import { createAdminClient, isSupabaseWritable } from "@/lib/supabase/server";

/* ============================================================================
   INVITACIONES DE SOCIO
   ----------------------------------------------------------------------------
   Entrar dejó de ser abierto: se entra invitado. El administrador genera un
   código, manda el enlace, y quien lo abre entra con su correo de Google y ya
   es socio.

   QUINCE MINUTOS DE VIDA. Es corto a propósito —lo pidió así— y tiene una
   consecuencia práctica que conviene conocer: el enlace se manda cuando la
   persona está al otro lado esperando, no la víspera. A cambio, un enlace
   reenviado a un tercero o que se queda olvidado en un chat no abre nada.

   Todo pasa por la clave secreta. Un código legible desde el navegador sería
   un código que cualquiera cosecha.
   ========================================================================== */

/** Cuánto vive un código, en minutos. */
export const MINUTOS_DE_VIDA = 15;

export type Invitacion = {
  readonly id: string;
  readonly code: string;
  readonly note: string | null;
  readonly expiresAt: string;
  readonly usedAt: string | null;
  readonly usedByEmail: string | null;
  readonly createdAt: string;
};

/**
 * Códigos de seis caracteres, sin vocales.
 *
 * Sin vocales no se forman palabras por casualidad —y no hay que explicarle a
 * nadie por qué su código dice algo desafortunado—. Se quitan también la O, la
 * I, el 0 y el 1: a la hora de dictarlos por teléfono son el origen de la
 * mitad de los errores.
 */
const ALFABETO = "BCDFGHJKLMNPQRSTVWXYZ23456789";

function nuevoCodigo(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return [...bytes].map((byte) => ALFABETO[byte % ALFABETO.length]).join("");
}

export async function crearInvitacion(
  creadaPor: string,
  nota?: string,
): Promise<Invitacion> {
  if (!isSupabaseWritable()) {
    throw new Error("Falta SUPABASE_SECRET_KEY: no se pueden crear invitaciones.");
  }

  const expira = new Date(Date.now() + MINUTOS_DE_VIDA * 60_000).toISOString();

  const { data, error } = await createAdminClient()
    .from("partner_invites")
    .insert({
      code: nuevoCodigo(),
      created_by: creadaPor,
      note: nota?.trim() || null,
      expires_at: expira,
    })
    .select("id, code, note, expires_at, used_at, created_at")
    .single<{
      id: string;
      code: string;
      note: string | null;
      expires_at: string;
      used_at: string | null;
      created_at: string;
    }>();

  if (error || !data) {
    throw new Error(`No se pudo crear la invitación: ${error?.message ?? "sin fila"}`);
  }

  return {
    id: data.id,
    code: data.code,
    note: data.note,
    expiresAt: data.expires_at,
    usedAt: data.used_at,
    usedByEmail: null,
    createdAt: data.created_at,
  };
}

type FilaInvitacion = {
  id: string;
  code: string;
  note: string | null;
  expires_at: string;
  used_at: string | null;
  created_at: string;
  profiles: { email: string | null } | null;
};

/** Las últimas invitaciones, para ver qué se mandó y qué se usó. */
export async function invitaciones(limite = 20): Promise<readonly Invitacion[]> {
  if (!isSupabaseWritable()) return [];

  const { data, error } = await createAdminClient()
    .from("partner_invites")
    .select(
      "id, code, note, expires_at, used_at, created_at, profiles!partner_invites_used_by_fkey(email)",
    )
    .order("created_at", { ascending: false })
    .limit(limite)
    .returns<FilaInvitacion[]>();

  if (error) throw new Error(`No se pudieron leer las invitaciones: ${error.message}`);

  return (data ?? []).map((fila) => ({
    id: fila.id,
    code: fila.code,
    note: fila.note,
    expiresAt: fila.expires_at,
    usedAt: fila.used_at,
    usedByEmail: fila.profiles?.email ?? null,
    createdAt: fila.created_at,
  }));
}

export type ResultadoCanje =
  | { readonly ok: true; readonly partnerId: string }
  | { readonly ok: false; readonly motivo: "desconocido" | "usado" | "caducado" };

/**
 * Canjea el código para una cuenta ya autenticada.
 *
 * Los cuatro cambios —marcar el código, ascender el perfil, crear la ficha de
 * socio y dejar el rastro— ocurren dentro de una función de la base, en una
 * sola transacción. Hacerlo desde aquí con cuatro consultas dejaría, el día
 * que una falle, un código gastado sin socio o un socio sin código.
 */
export async function canjearInvitacion(
  codigo: string,
  userId: string,
  empresa?: string,
): Promise<ResultadoCanje> {
  if (!isSupabaseWritable()) return { ok: false, motivo: "desconocido" };

  const { data, error } = await createAdminClient()
    .rpc("redeem_partner_invite", {
      p_code: codigo.trim().toUpperCase(),
      p_user: userId,
      p_company: empresa ?? null,
    })
    .single<{ ok: boolean; motivo: string; partner_id: string | null }>();

  if (error || !data) return { ok: false, motivo: "desconocido" };

  if (data.ok && data.partner_id) return { ok: true, partnerId: data.partner_id };

  const motivo = data.motivo === "usado" || data.motivo === "caducado" ? data.motivo : "desconocido";
  return { ok: false, motivo };
}

/** Si un código sirve, sin canjearlo. Para pintar la pantalla de bienvenida. */
export async function invitacionValida(codigo: string): Promise<boolean> {
  if (!isSupabaseWritable()) return false;

  const { data } = await createAdminClient()
    .from("partner_invites")
    .select("id, used_at, expires_at")
    .eq("code", codigo.trim().toUpperCase())
    .maybeSingle<{ id: string; used_at: string | null; expires_at: string }>();

  if (!data || data.used_at) return false;
  return new Date(data.expires_at).getTime() > Date.now();
}
