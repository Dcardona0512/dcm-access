"use server";

import { revalidatePath } from "next/cache";

import { getRepositories } from "@/lib/data";
import { can, getDemoUser } from "@/lib/auth/roles";
import { dealStages, leadStatuses, type DealStage, type LeadStatus } from "@/lib/domain/types";

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
  const user = getDemoUser();
  assert(can(user.role, "update", "leads"), "Sin permiso para actualizar leads.");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  assert(leadStatuses.includes(status as LeadStatus), "Estado de lead no válido.");

  const { leads } = getRepositories();
  await leads.updateStatus(id, status as LeadStatus, `Actualizado por ${user.name}`);

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function moveDeal(formData: FormData) {
  const user = getDemoUser();
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

export async function decideProvider(formData: FormData) {
  const user = getDemoUser();
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
