import "server-only";

import { createSessionClient } from "@/lib/supabase/server";

/* ============================================================================
   LO QUE VE CADA QUIEN EN SU PANEL
   ----------------------------------------------------------------------------
   TODO ESTO SE LEE CON LA SESIÓN DE LA PERSONA, nunca con la clave secreta.

   No es una preferencia de estilo: es dónde vive la seguridad. Con la clave
   secreta habría que acordarse de escribir `where client_id = ...` en cada
   consulta, y el día que a alguien se le olvide, el panel de un cliente
   enseñará los datos de otro sin que nada falle ni avise. Con la sesión, ese
   filtro lo pone la base en cada consulta, y un olvido devuelve una lista
   vacía en lugar de los datos del vecino.
   ========================================================================== */

export type ConsultaPropia = {
  readonly id: string;
  readonly reference: string;
  readonly status: string;
  readonly message: string | null;
  readonly vertical: string | null;
  readonly opportunityId: string | null;
  readonly createdAt: string;
};

/** Las consultas que ha hecho quien mira. */
export async function misConsultas(): Promise<readonly ConsultaPropia[]> {
  const supabase = await createSessionClient();

  const { data } = await supabase
    .from("leads")
    .select("id, reference, status, message, vertical, opportunity_id, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []).map((fila) => ({
    id: fila.id as string,
    reference: fila.reference as string,
    status: fila.status as string,
    message: (fila.message as string | null) ?? null,
    vertical: (fila.vertical as string | null) ?? null,
    opportunityId: (fila.opportunity_id as string | null) ?? null,
    createdAt: fila.created_at as string,
  }));
}

export type FichaPartner = {
  readonly id: string;
  readonly companyName: string;
  readonly status: "pending" | "in_review" | "verified" | "rejected" | "suspended";
  readonly website: string | null;
  readonly country: string | null;
  readonly city: string | null;
  readonly category: string | null;
  readonly description: string | null;
  readonly verifiedAt: string | null;
  readonly createdAt: string;
};

/** La ficha de partner de quien mira, si ya la creó. */
export async function miPartner(): Promise<FichaPartner | null> {
  const supabase = await createSessionClient();

  const { data } = await supabase
    .from("partners")
    .select(
      "id, company_name, status, website, country, city, category, description, verified_at, created_at",
    )
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id as string,
    companyName: data.company_name as string,
    status: data.status as FichaPartner["status"],
    website: (data.website as string | null) ?? null,
    country: (data.country as string | null) ?? null,
    city: (data.city as string | null) ?? null,
    category: (data.category as string | null) ?? null,
    description: (data.description as string | null) ?? null,
    verifiedAt: (data.verified_at as string | null) ?? null,
    createdAt: data.created_at as string,
  };
}

export type FichaPropia = {
  readonly id: string;
  readonly slug: string;
  readonly reference: string;
  readonly title: string;
  readonly vertical: string;
  readonly status: string;
  readonly updatedAt: string;
};

/** Las fichas del partner de quien mira, en cualquier estado. */
export async function misFichas(): Promise<readonly FichaPropia[]> {
  const supabase = await createSessionClient();

  const { data } = await supabase
    .from("opportunities")
    .select("id, slug, reference, title, vertical, status, updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  return (data ?? []).map((fila) => {
    const titulo = fila.title as Record<string, string> | null;

    return {
      id: fila.id as string,
      slug: fila.slug as string,
      reference: fila.reference as string,
      // El título es bilingüe en la base; en el panel basta con el español.
      title: titulo?.es ?? titulo?.en ?? (fila.slug as string),
      vertical: fila.vertical as string,
      status: fila.status as string,
      updatedAt: fila.updated_at as string,
    };
  });
}
