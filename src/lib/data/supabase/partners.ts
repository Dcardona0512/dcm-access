import "server-only";

import { createAdminClient, isSupabaseWritable } from "@/lib/supabase/server";

/* ============================================================================
   PARTNERS, DESDE EL PANEL
   ----------------------------------------------------------------------------
   Aquí SÍ se usa la clave secreta, y es lo correcto: el panel necesita ver las
   fichas de todos los partners, incluidas las que no están verificadas, y
   escribir el rol de otra persona. Ninguna de las dos cosas puede hacerlas la
   sesión de nadie, ni siquiera la del administrador, porque las políticas de
   la base no conceden poder sobre filas ajenas.

   La autorización, por tanto, tiene que estar resuelta ANTES de llamar aquí:
   lo hace `requireRole(TEAM_ROLES)` en la página y en cada acción.
   ========================================================================== */

export type PartnerStatus = "pending" | "in_review" | "verified" | "rejected" | "suspended";

export type PartnerDelPanel = {
  readonly id: string;
  readonly ownerId: string;
  readonly companyName: string;
  readonly email: string | null;
  readonly website: string | null;
  readonly country: string | null;
  readonly city: string | null;
  readonly category: string | null;
  readonly description: string | null;
  readonly status: PartnerStatus;
  readonly createdAt: string;
  readonly verifiedAt: string | null;
};

type Fila = {
  id: string;
  owner_id: string;
  company_name: string;
  website: string | null;
  country: string | null;
  city: string | null;
  category: string | null;
  description: string | null;
  status: PartnerStatus;
  created_at: string;
  verified_at: string | null;
  profiles: { email: string | null } | null;
};

const COLUMNAS =
  "id, owner_id, company_name, website, country, city, category, description, status, created_at, verified_at, profiles!partners_owner_id_fkey(email)";

export async function partnersDelPanel(): Promise<readonly PartnerDelPanel[]> {
  if (!isSupabaseWritable()) return [];

  const { data, error } = await createAdminClient()
    .from("partners")
    .select(COLUMNAS)
    .order("created_at", { ascending: false })
    .returns<Fila[]>();

  if (error) throw new Error(`No se pudieron leer los partners: ${error.message}`);

  return (data ?? []).map((fila) => ({
    id: fila.id,
    ownerId: fila.owner_id,
    companyName: fila.company_name,
    email: fila.profiles?.email ?? null,
    website: fila.website,
    country: fila.country,
    city: fila.city,
    category: fila.category,
    description: fila.description,
    status: fila.status,
    createdAt: fila.created_at,
    verifiedAt: fila.verified_at,
  }));
}

/**
 * Cambia el estado de verificación y, con él, lo que esa cuenta puede hacer.
 *
 * VERIFICAR NO ES SOLO PONER UNA ETIQUETA: es el momento en que la intención
 * declarada al registrarse se convierte en rol. Hasta aquí la persona era
 * `client` aunque dijera ser partner; a partir de aquí lo es de verdad y sus
 * fichas empiezan a existir para la base.
 *
 * Al retirar la verificación se retira también el rol. Un partner suspendido
 * que conservara el rol seguiría viendo leads que ya no le corresponden.
 */
export async function cambiarEstadoPartner(
  partnerId: string,
  status: PartnerStatus,
  actor: { readonly userId: string; readonly role: string; readonly email: string },
  nota?: string,
): Promise<void> {
  if (!isSupabaseWritable()) {
    throw new Error("Falta SUPABASE_SECRET_KEY: no se puede verificar.");
  }

  const supabase = createAdminClient();

  const { data: partner, error: lectura } = await supabase
    .from("partners")
    .select("id, owner_id")
    .eq("id", partnerId)
    .single<{ id: string; owner_id: string }>();

  if (lectura || !partner) throw new Error("Ese partner no existe.");

  const { error } = await supabase
    .from("partners")
    .update({
      status,
      verified_at: status === "verified" ? new Date().toISOString() : null,
    })
    .eq("id", partnerId);

  if (error) throw new Error(`No se pudo cambiar el estado: ${error.message}`);

  const { error: rol } = await supabase
    .from("profiles")
    .update({ role: status === "verified" ? "partner" : "client" })
    .eq("id", partner.owner_id);

  if (rol) throw new Error(`No se pudo ajustar el rol: ${rol.message}`);

  /*
    Dos rastros, y cada uno responde a una pregunta distinta: la revisión dice
    POR QUÉ se decidió —la lee quien atienda a ese partner mañana— y la
    auditoría dice QUIÉN lo decidió y cuándo, que es lo que hace falta el día
    que alguien pregunte por qué su ficha dejó de estar verificada.
  */
  await supabase.from("partner_reviews").insert({
    partner_id: partnerId,
    reviewer_id: actor.userId,
    status,
    note: nota ?? null,
  });

  await supabase.from("audit_logs").insert({
    actor_id: actor.userId,
    actor_role: actor.role,
    action: `partner.${status}`,
    entity_type: "partner",
    entity_id: partnerId,
    metadata: { by: actor.email, note: nota ?? null },
  });
}
