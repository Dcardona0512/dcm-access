import type { Role } from "@/lib/domain/types";

/* ============================================================================
   ROLES Y POLÍTICA DE ACCESO (§22, §40)
   ----------------------------------------------------------------------------
   La matriz decide qué PUEDE PEDIR cada rol: qué menú se pinta y qué acciones
   se aceptan. Es la primera de dos capas.

   La segunda vive en la base, en las políticas de RLS, y es la que de verdad
   protege: esta se puede rodear llamando a una server action a mano, aquella
   no se puede rodear de ninguna manera porque decide lo que la base devuelve.
   Cada fila de esta matriz tiene su política al otro lado.
   ========================================================================== */

export const resources = [
  "opportunities",
  "providers",
  "leads",
  "deals",
  "commissions",
  "content",
  "users",
] as const;

export type Resource = (typeof resources)[number];

export type Action = "read" | "create" | "update" | "delete" | "approve";

type Matrix = Readonly<Record<Role, Readonly<Partial<Record<Resource, readonly Action[]>>>>>;

const ALL: readonly Action[] = ["read", "create", "update", "delete", "approve"];

const permissions: Matrix = {
  admin: {
    opportunities: ALL,
    providers: ALL,
    leads: ALL,
    deals: ALL,
    commissions: ALL,
    content: ALL,
    users: ALL,
  },
  broker: {
    opportunities: ["read", "create", "update"],
    providers: ["read"],
    leads: ["read", "create", "update"],
    deals: ["read", "create", "update"],
    commissions: ["read"],
  },
  sales: {
    opportunities: ["read"],
    providers: ["read"],
    leads: ["read", "create", "update"],
    deals: ["read"],
  },
  content_manager: {
    opportunities: ["read", "update"],
    providers: ["read"],
    content: ["read", "create", "update", "delete"],
  },
  /** El partner solo ve lo suyo; el filtrado lo aplica RLS en la base. */
  partner: {
    opportunities: ["read", "create", "update"],
    leads: ["read"],
  },
  client: {
    opportunities: ["read"],
    leads: ["create"],
  },
};

/**
 * Los roles que trabajan DENTRO de la plataforma.
 *
 * Es la lista que guarda la puerta del CRM. Cliente y partner quedan fuera a
 * propósito: tienen sus propios paneles y no pintan nada aquí, por mucho que
 * acierten la dirección.
 */
export const TEAM_ROLES: readonly Role[] = ["admin", "broker", "sales", "content_manager"];

export function can(role: Role, action: Action, resource: Resource): boolean {
  return permissions[role][resource]?.includes(action) ?? false;
}

/** Recursos que un rol puede al menos leer. Alimenta el menú del CRM. */
export function readableResources(role: Role): readonly Resource[] {
  return resources.filter((resource) => can(role, "read", resource));
}

export const roleLabels: Record<Role, { es: string; en: string }> = {
  admin: { es: "Administrador", en: "Admin" },
  broker: { es: "Broker", en: "Broker" },
  sales: { es: "Comercial", en: "Sales" },
  content_manager: { es: "Gestor de contenido", en: "Content Manager" },
  partner: { es: "Partner", en: "Partner" },
  client: { es: "Cliente", en: "Client" },
};
