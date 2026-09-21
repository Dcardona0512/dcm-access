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
 */
/**
 * Tres entradas, y en este orden.
 *
 * El panel tenía siete —leads, operaciones, oportunidades, solicitudes,
 * proveedores, comisiones— y ninguna resolvía el trabajo real de este
 * momento. Las pantallas siguen existiendo y se alcanzan por URL; lo que se
 * quitó es el menú que invitaba a perderse entre ellas.
 *
 * El resumen abre el panel porque responde a lo único que se pregunta al
 * entrar: qué hay publicado y qué lleva tiempo parado. Después el catálogo,
 * para mirar lo subido. Publicar va al final, porque es una decisión que ya
 * se trae tomada de casa.
 */
const ENTRIES: readonly { href: string; label: string; resource: Resource }[] = [
  { href: "/admin", label: "Resumen", resource: "opportunities" },
  { href: "/admin/catalog", label: "Catálogo", resource: "opportunities" },
  { href: "/admin/publish", label: "Crear publicación", resource: "opportunities" },
  // Entra al menú porque ahora hay solicitudes de verdad esperando respuesta:
  // un partner sin revisar es un partner que no puede publicar.
  { href: "/admin/partners", label: "Partners", resource: "providers" },
  // Lo que hay que preguntarle a quien quiere vender. Entra al menú porque se
  // usa en cada conversación, no una vez al mes.
  { href: "/admin/questionnaires", label: "Cuestionarios", resource: "opportunities" },
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
                  "eyebrow block rounded-(--radius-card) px-3 py-2.5 text-[0.8rem] transition-colors",
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
