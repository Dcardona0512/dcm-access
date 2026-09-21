"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { createSessionClient } from "@/lib/supabase/server";

import type { PartnerState } from "./state";

/* ============================================================================
   ALTA DE PARTNER
   ----------------------------------------------------------------------------
   Quien se registró diciendo que tiene algo que ofrecer crea aquí su ficha.
   Nace SIEMPRE en `pending`, y eso no lo garantiza este archivo: lo garantiza
   la política de la base, que solo acepta la inserción si el dueño es quien
   escribe y el estado es pendiente. Este código podría equivocarse; la base no
   lo dejaría pasar.
   ========================================================================== */

const esquema = z.object({
  companyName: z.string().trim().min(2, "Escriba el nombre de la empresa.").max(160),
  website: z.string().trim().max(200).optional(),
  country: z.string().trim().length(2).optional(),
  city: z.string().trim().max(120).optional(),
  category: z.string().trim().max(120).optional(),
  description: z.string().trim().min(20, "Cuente en dos líneas a qué se dedica.").max(2000),
});

export async function createPartnerProfile(
  _previo: PartnerState,
  formData: FormData,
): Promise<PartnerState> {
  const session = await requireSession("/partner/dashboard");

  const parsed = esquema.safeParse({
    companyName: formData.get("companyName"),
    website: formData.get("website") || undefined,
    country: formData.get("country") || undefined,
    city: formData.get("city") || undefined,
    category: formData.get("category") || undefined,
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Revise los datos.",
    };
  }

  const supabase = await createSessionClient();
  const { error } = await supabase.from("partners").insert({
    owner_id: session.userId,
    company_name: parsed.data.companyName,
    website: parsed.data.website ?? null,
    country: parsed.data.country?.toUpperCase() ?? null,
    city: parsed.data.city ?? null,
    category: parsed.data.category ?? null,
    description: parsed.data.description,
    status: "pending",
  });

  if (error) {
    // El índice único por dueño es el que convierte «pulsé dos veces» en un
    // error honesto en lugar de en dos fichas peleándose por los mismos leads.
    return {
      status: "error",
      message: error.code === "23505" ? "Ya tiene una ficha de partner." : "No se pudo guardar.",
    };
  }

  revalidatePath("/partner/dashboard");
  return { status: "idle" };
}
