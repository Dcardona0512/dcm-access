import Link from "next/link";

import { AdminButton, AdminHeading, Panel } from "@/components/admin/AdminUI";
import { Eyebrow } from "@/components/ui/Section";
import { Tag } from "@/components/ui/Tag";
import { getRepositories } from "@/lib/data";
import type { ListingSubmission } from "@/lib/data/repositories";
import { localized } from "@/lib/domain/types";
import { formatDateShort, formatLocation, formatPrice } from "@/lib/format";

import { approveSubmission, rejectSubmission } from "../actions";

/** La cola cambia en ejecución, así que no puede prerenderizarse. */
export const dynamic = "force-dynamic";

/**
 * Cola de solicitudes de venta.
 *
 * Es la contrapartida del formulario público: nada de lo que llega por ahí
 * aparece en el mercado hasta que alguien lo aprueba aquí. La pantalla separa
 * lo pendiente de lo resuelto para que la bandeja se pueda vaciar, igual que
 * la de proveedores.
 */
export default async function AdminSubmissionsPage() {
  const { submissions } = getRepositories();
  const all = await submissions.list();

  const pending = all.filter(
    (row) => row.status === "received" || row.status === "in_review",
  );
  const resolved = all.filter(
    (row) => row.status !== "received" && row.status !== "in_review",
  );

  return (
    <>
      <AdminHeading
        eyebrow="Mercado"
        title="Solicitudes de venta"
        lede="Lo que llega por el formulario público no se publica solo. Aprobar crea la ficha en el catálogo; rechazar la archiva."
      />

      <section className="mb-10 flex flex-col gap-4">
        <Eyebrow tone="muted">Pendientes · {pending.length}</Eyebrow>

        {pending.length === 0 ? (
          <Panel>
            <p className="text-fg-muted/50 py-4 text-center text-sm">La bandeja está vacía.</p>
          </Panel>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {pending.map((row) => (
              <SubmissionCard key={row.id} submission={row} />
            ))}
          </div>
        )}
      </section>

      {resolved.length > 0 ? (
        <section className="flex flex-col gap-4">
          <Eyebrow tone="muted">Resueltas · {resolved.length}</Eyebrow>
          <div className="grid gap-4 lg:grid-cols-2">
            {resolved.map((row) => (
              <SubmissionCard key={row.id} submission={row} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

const statusLabels: Record<ListingSubmission["status"], string> = {
  received: "Recibida",
  in_review: "En revisión",
  approved: "Publicada",
  rejected: "Rechazada",
};

function SubmissionCard({ submission }: { readonly submission: ListingSubmission }) {
  const open = submission.status === "received" || submission.status === "in_review";
  const price = formatPrice(submission.price, "es", {
    onRequest: "A consultar",
    from: "Desde",
  });

  const photos = submission.media.filter((item) => item.kind === "image").length;
  const videos = submission.media.filter((item) => item.kind === "video").length;

  return (
    <Panel className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-lg">{localized(submission.title, "es")}</h3>
          <span className="text-fg-muted/60 text-xs">
            {formatLocation(submission.location, "es")} · {formatDateShort(submission.createdAt, "es")}
          </span>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <Tag tone={submission.status === "approved" ? "verified" : "neutral"}>
            {statusLabels[submission.status]}
          </Tag>
          {/*
            Un correo perdido es invisible si no se registra. Esta etiqueta es
            la razón de que `notifiedAt` se persista en lugar de enviar el
            aviso en segundo plano y olvidarse.
          */}
          {open && !submission.notifiedAt ? <Tag tone="pending">Sin notificar</Tag> : null}
        </div>
      </div>

      <dl className="text-fg-muted grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
        <Field label="Referencia" value={submission.reference} numeric />
        <Field label="Precio" value={price.onRequest ? price.value : `${price.value}`} numeric />
        <Field label="Vendedor" value={submission.seller.name} />
        <Field label="Contacto" value={submission.seller.email} />
        {submission.seller.phone ? <Field label="Teléfono" value={submission.seller.phone} /> : null}
        <Field label="Medios" value={`${photos} fotos · ${videos} vídeos`} numeric />
      </dl>

      {submission.notifyError ? (
        <p className="border-danger/40 bg-danger/5 text-danger rounded-(--radius-card) border px-3 py-2 text-xs">
          Fallo al notificar: {submission.notifyError}
        </p>
      ) : null}

      {submission.publishedOpportunityId ? (
        <Link
          href="/admin/opportunities"
          className="eyebrow text-accent text-[0.5rem] transition-opacity hover:opacity-80"
        >
          Ver en el catálogo
        </Link>
      ) : null}

      {open ? (
        <div className="border-line-soft flex items-center gap-2 border-t pt-4">
          <form action={approveSubmission}>
            <input type="hidden" name="id" value={submission.id} />
            <AdminButton tone="accent">Aprobar y publicar</AdminButton>
          </form>
          <form action={rejectSubmission}>
            <input type="hidden" name="id" value={submission.id} />
            <AdminButton tone="danger">Rechazar</AdminButton>
          </form>
        </div>
      ) : null}
    </Panel>
  );
}

function Field({
  label,
  value,
  numeric = false,
}: {
  readonly label: string;
  readonly value: string;
  readonly numeric?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="eyebrow text-fg-muted/50 text-[0.5rem]">{label}</dt>
      <dd className="text-fg/90" data-numeric={numeric || undefined}>
        {value}
      </dd>
    </div>
  );
}
