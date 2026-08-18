"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { can, type Resource } from "@/lib/auth/roles";
import type { Role } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

/**
 * Menú del CRM.
 *
 * Cada entrada declara el recurso que representa y se filtra con `can()`: la
 * política de autorización no es decorativa, decide de verdad lo que se ve.
 * Cuando llegue Supabase, la misma matriz pasa a ser RLS y esto no cambia.
 */
const ENTRIES: readonly { href: string; label: string; resource: Resource }[] = [
  { href: "/admin", label: "Resumen", resource: "leads" },
  { href: "/admin/leads", label: "Leads", resource: "leads" },
  { href: "/admin/deals", label: "Operaciones", resource: "deals" },
  { href: "/admin/opportunities", label: "Oportunidades", resource: "opportunities" },
  { href: "/admin/providers", label: "Proveedores", resource: "providers" },
  { href: "/admin/commissions", label: "Comisiones", resource: "commissions" },
];

export function AdminNav({ role }: { readonly role: Role }) {
  const pathname = usePathname();
  const visible = ENTRIES.filter((entry) => can(role, "read", entry.resource));

  return (
    <nav aria-label="Navegación del panel">
      <ul className="flex flex-wrap gap-1 lg:flex-col">
        {visible.map((entry) => {
          const active = pathname === entry.href;

          return (
            <li key={entry.href}>
              <Link
                href={entry.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "eyebrow block rounded-(--radius-card) px-3 py-2.5 text-[0.5625rem] transition-colors",
                  active ? "bg-surface-sunken text-accent" : "text-fg-muted hover:text-fg",
                )}
              >
                {entry.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
