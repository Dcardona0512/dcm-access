"use server";

import { revalidatePath } from "next/cache";

import { TEAM_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { cambiarEstado } from "@/lib/data/supabase/panel";

/* ============================================================================
   VENDER Y REABRIR
   ----------------------------------------------------------------------------
   Marcar vendida NO borra la ficha: la saca del catálogo público y la deja en
   el panel. Es el historial del negocio, y además una venta se puede caer.
   ========================================================================== */

async function exigirSesion(): Promise<void> {
  // El layout ya guarda el panel, pero una server action es una URL a la que
  // se puede llamar directamente: la comprobación se repite aquí porque este
  // es el sitio donde de verdad se escribe.
  await requireRole(TEAM_ROLES);
}

function refrescar(vertical: string, slug: string): void {
  // El resumen de la barra vive en el layout del panel, y el catálogo público
  // y la ficha tienen que dejar de mostrarla —o volver a mostrarla— ya.
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/opportunities");
  revalidatePath(`/es/${vertical}`);
  revalidatePath(`/en/${vertical}`);
  revalidatePath(`/es/${vertical}/${slug}`);
  revalidatePath(`/en/${vertical}/${slug}`);
}

export async function marcarVendida(formData: FormData): Promise<void> {
  await exigirSesion();

  const id = String(formData.get("id") ?? "");
  const vertical = String(formData.get("vertical") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!id) return;

  await cambiarEstado(id, "closed");
  refrescar(vertical, slug);
}

export async function reabrir(formData: FormData): Promise<void> {
  await exigirSesion();

  const id = String(formData.get("id") ?? "");
  const vertical = String(formData.get("vertical") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!id) return;

  await cambiarEstado(id, "published");
  refrescar(vertical, slug);
}
