import Link from "next/link";

import { AdminHeading } from "@/components/admin/AdminUI";
import { verticalLabels } from "@/lib/domain/labels";
import { localized, verticals, type Vertical } from "@/lib/domain/types";

export const dynamic = "force-dynamic";

/* ============================================================================
   ELEGIR QUÉ PUBLICAR
   ----------------------------------------------------------------------------
   El panel arranca preguntando una sola cosa: en qué sección va lo que se va a
   publicar. Antes abría con un resumen de comisiones proyectadas —útil el día
   que haya operaciones que resumir, prematuro mientras el trabajo real es
   llenar el catálogo—.

   Elegir aquí y no dentro del formulario tiene una razón: la sección decide
   qué campos aparecen después, así que es la primera decisión de verdad y
   merece una pantalla, no un desplegable enterrado entre otros doce.
   ========================================================================== */

/** Una frase por sección: qué cabe dentro, en palabras de quien publica. */
const hints: Record<Vertical, string> = {
  "real-estate": "Casas, apartamentos, fincas, locales y lotes.",
  motors: "Autos, motos, embarcaciones, remolques y maquinaria rodante.",
  aviation: "Aeronaves, chárter y operación ejecutiva.",
  servicios: "Transporte, concierge, logística y protección.",
  negocios: "Maquinaria, activos, participaciones y alianzas.",
};

export default function AdminHomePage() {
  return (
    <>
      <AdminHeading
        eyebrow="Catálogo"
        title="Crear publicación"
        lede="Elija dónde va lo que quiere publicar. Cada sección pide sus propios datos."
      />

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {verticals.map((vertical) => (
          <li key={vertical}>
            <Link
              href={`/admin/opportunities/new?vertical=${vertical}`}
              className="border-line bg-surface-raised hover:border-accent/60 group flex h-full flex-col gap-3 rounded-(--radius-card) border p-6 transition-colors"
            >
              <span className="font-display group-hover:text-accent text-xl transition-colors">
                {localized(verticalLabels[vertical], "es")}
              </span>
              <span className="text-fg-muted/70 text-sm text-pretty">{hints[vertical]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
