"use server";

import { revalidatePath } from "next/cache";

import { getRepositories } from "@/lib/data";
import { can, TEAM_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { dealStages, leadStatuses, type DealStage, type LeadStatus } from "@/lib/domain/types";
import { locales } from "@/lib/i18n/config";

/* ============================================================================
   ACCIONES DEL CRM (§22, §23)
   ----------------------------------------------------------------------------
   Cada acción comprueba el permiso con la misma función `can()` que decide el
   menú. Comprobarlo solo en la interfaz sería teatro: la puerta está en el
   servidor.
   ========================================================================== */

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

export async function advanceLead(formData: FormData) {
  const user = await requireRole(TEAM_ROLES);
  assert(can(user.role, "update", "leads"), "Sin permiso para actualizar leads.");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  assert(leadStatuses.includes(status as LeadStatus), "Estado de lead no válido.");

  const { leads } = getRepositories();
  await leads.updateStatus(id, status as LeadStatus, `Actualizado por ${user.email}`);

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function moveDeal(formData: FormData) {
  const user = await requireRole(TEAM_ROLES);
  assert(can(user.role, "update", "deals"), "Sin permiso para actualizar operaciones.");

  const id = String(formData.get("id") ?? "");
  const stage = String(formData.get("stage") ?? "");
  assert(dealStages.includes(stage as DealStage), "Etapa no válida.");

  const { deals } = getRepositories();
  await deals.updateStage(id, stage as DealStage);

  revalidatePath("/admin/deals");
  revalidatePath("/admin/commissions");
  revalidatePath("/admin");
}

/**
 * Aprobar una solicitud es el ÚNICO camino que publica una oportunidad.
 *
 * Por eso pide permiso de `create` sobre oportunidades y no de `update`: lo
 * que ocurre aquí no es cambiar un estado, es crear una ficha de catálogo a
 * partir de lo que mandó un tercero.
 */
export async function approveSubmission(formData: FormData) {
  const user = await requireRole(TEAM_ROLES);
  assert(can(user.role, "create", "opportunities"), "Sin permiso para publicar oportunidades.");

  const id = String(formData.get("id") ?? "");
  assert(id.length > 0, "Solicitud no válida.");

  const { submissions } = getRepositories();
  const opportunity = await submissions.approve(id);

  revalidatePath("/admin/submissions");
  revalidatePath("/admin/opportunities");

  /**
   * La parrilla Y la ficha. La ficha está prerenderizada por
   * `generateStaticParams`, así que sin revalidarla el vehículo aparece en el
   * listado pero su página da 404 hasta el siguiente despliegue. Nada en el
   * build avisa de esto.
   */
  for (const locale of locales) {
    revalidatePath(`/${locale}/${opportunity.vertical}`);
    revalidatePath(`/${locale}/${opportunity.vertical}/${opportunity.slug}`);
  }
}

export async function rejectSubmission(formData: FormData) {
  const user = await requireRole(TEAM_ROLES);
  assert(can(user.role, "create", "opportunities"), "Sin permiso para gestionar solicitudes.");

  const id = String(formData.get("id") ?? "");
  assert(id.length > 0, "Solicitud no válida.");

  const { submissions } = getRepositories();
  await submissions.reject(id);

  revalidatePath("/admin/submissions");
}

export async function decideProvider(formData: FormData) {
  const user = await requireRole(TEAM_ROLES);
  assert(can(user.role, "approve", "providers"), "Sin permiso para aprobar proveedores.");

  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  assert(
    ["approved", "in_review", "rejected", "suspended"].includes(decision),
    "Decisión no válida.",
  );

  const { providers } = getRepositories();
  await providers.updateStatus(id, decision as "approved" | "in_review" | "rejected" | "suspended");

  revalidatePath("/admin/providers");
  revalidatePath("/admin");
}
