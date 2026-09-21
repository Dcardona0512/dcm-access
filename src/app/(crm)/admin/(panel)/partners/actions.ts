"use server";

import { revalidatePath } from "next/cache";

import { can, TEAM_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { crearInvitacion } from "@/lib/data/supabase/invites";
import { cambiarEstadoPartner, type PartnerStatus } from "@/lib/data/supabase/partners";

const ESTADOS: readonly PartnerStatus[] = [
  "pending",
  "in_review",
  "verified",
  "rejected",
  "suspended",
];

/**
 * Verificar, rechazar o suspender un socio.
 *
 * Dos comprobaciones antes de tocar nada: el rol entra al panel y ese rol
 * puede aprobar. Un gestor de contenido pasa la primera y no la segunda, que
 * es justo la diferencia entre entrar y decidir.
 */
export async function setPartnerStatus(formData: FormData): Promise<void> {
  const session = await requireRole(TEAM_ROLES);

  if (!can(session.role, "approve", "providers")) {
    throw new Error("Sin permiso para verificar socios.");
  }

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const nota = String(formData.get("note") ?? "").trim();

  if (!id) throw new Error("Falta el socio.");
  if (!ESTADOS.includes(status as PartnerStatus)) throw new Error("Estado no válido.");

  await cambiarEstadoPartner(
    id,
    status as PartnerStatus,
    { userId: session.userId, role: session.role, email: session.email },
    nota || undefined,
  );

  revalidatePath("/admin/partners");
  revalidatePath("/admin");
}

/** Genera un código nuevo. El enlace se copia de la pantalla y se envía. */
export async function nuevoSocio(formData: FormData): Promise<void> {
  const session = await requireRole(TEAM_ROLES);

  if (!can(session.role, "create", "providers")) {
    throw new Error("Sin permiso para invitar socios.");
  }

  const nota = String(formData.get("note") ?? "").trim();
  await crearInvitacion(session.userId, nota || undefined);

  revalidatePath("/admin/partners");
}
