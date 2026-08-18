import type { Role, User } from "@/lib/domain/types";

/* ============================================================================
   ROLES Y POLÍTICA DE ACCESO (§22, §40)
   ----------------------------------------------------------------------------
   La autenticación real todavía no está conectada, pero la AUTORIZACIÓN sí
   está modelada: una matriz explícita de permisos y una única función `can()`
   que el CRM consulta de verdad para decidir qué menú y qué acciones muestra.

   Está escrita para traducirse casi literalmente a políticas RLS de Supabase
   cuando llegue el momento: cada fila de la matriz es una política.
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
  super_admin: {
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
  /** El proveedor solo ve lo suyo; el filtrado por `providerId` lo aplica quien consulta. */
  provider: {
    opportunities: ["read", "create", "update"],
    leads: ["read"],
  },
  customer: {
    opportunities: ["read"],
    leads: ["create"],
  },
};

export function can(role: Role, action: Action, resource: Resource): boolean {
  return permissions[role][resource]?.includes(action) ?? false;
}

/** Recursos que un rol puede al menos leer. Alimenta el menú del CRM. */
export function readableResources(role: Role): readonly Resource[] {
  return resources.filter((resource) => can(role, "read", resource));
}

export const roleLabels: Record<Role, { es: string; en: string }> = {
  super_admin: { es: "Super Admin", en: "Super Admin" },
  broker: { es: "Broker", en: "Broker" },
  sales: { es: "Comercial", en: "Sales" },
  content_manager: { es: "Gestor de contenido", en: "Content Manager" },
  provider: { es: "Proveedor", en: "Provider" },
  customer: { es: "Cliente", en: "Customer" },
};

/**
 * Sesión de demostración.
 *
 * NO es autenticación y no pretende serlo: es un usuario fijo para poder
 * recorrer el CRM. Toda la interfaz que lo usa lo declara abiertamente (§48).
 * Cuando entre Supabase Auth, esta función se sustituye por la lectura de la
 * sesión real y `can()` sigue funcionando sin cambios.
 */
export function getDemoUser(): User {
  return {
    id: "usr-demo-admin",
    name: "Sesión de demostración",
    email: "demo@dcm-access.local",
    role: "super_admin",
    isDemo: true,
  };
}
