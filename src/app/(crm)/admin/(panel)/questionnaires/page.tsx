import { AdminHeading } from "@/components/admin/AdminUI";
import { getRepositories } from "@/lib/data";
import { defaultLocale } from "@/lib/i18n/config";
import { comoTexto, cuestionarioDe } from "@/lib/whatsapp/cuestionario";

import { Copiable } from "./Copiable";

export const dynamic = "force-dynamic";

/* ============================================================================
   LOS CUESTIONARIOS, LISTOS PARA PEGAR EN WHATSAPP
   ----------------------------------------------------------------------------
   Cada categoría tiene su lista de preguntas, y no están escritas aquí: salen
   del `attributeSchema` de la categoría, el mismo del que sale el formulario
   de publicar. Añadir un campo a una categoría cambia el cuestionario sin que
   nadie tenga que acordarse de actualizarlo.

   Es la pieza de hoy: mientras el bot no exista, se copia y se pega. Cuando
   exista, hará estas mismas preguntas una a una — y seguirán saliendo de aquí.
   ========================================================================== */

export default async function QuestionnairesPage() {
  const { categories } = getRepositories();
  const todas = await categories.list();

  return (
    <>
      <AdminHeading
        title="Cuestionarios"
        lede="Lo que hay que preguntarle a quien quiere vender, por categoría. Copie y pegue en WhatsApp."
      />

      <div className="flex flex-col gap-8">
        {todas.map((categoria) => {
          const cuestionario = cuestionarioDe(categoria, defaultLocale);
          const texto = comoTexto(cuestionario, defaultLocale);

          return (
            <section
              key={categoria.id}
              className="border-line bg-surface-raised flex flex-col gap-4 rounded-(--radius-card) border p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base">{cuestionario.titulo}</h2>
                <span className="eyebrow text-fg-muted/60 text-[0.7rem]" data-numeric>
                  {cuestionario.preguntas.length} + {cuestionario.opcionales.length} opcionales
                </span>
              </div>

              <Copiable texto={texto} />
            </section>
          );
        })}
      </div>
    </>
  );
}
