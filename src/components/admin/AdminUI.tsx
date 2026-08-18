import type { ReactNode } from "react";

import { Eyebrow } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

export function AdminHeading({
  eyebrow,
  title,
  lede,
  action,
}: {
  readonly eyebrow?: string;
  readonly title: string;
  readonly lede?: string;
  readonly action?: ReactNode;
}) {
  return (
    <header className="border-line mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2.5">
        {eyebrow ? <Eyebrow tone="muted">{eyebrow}</Eyebrow> : null}
        <h1 className="font-display text-3xl text-balance">{title}</h1>
        {lede ? <p className="text-fg-muted max-w-[68ch] text-sm text-pretty">{lede}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function Panel({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <div
      className={cn(
        "border-line bg-surface-raised edge-light rounded-(--radius-card) border p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Cifra grande con su etiqueta. Se usa en el resumen del panel. */
export function Stat({
  label,
  value,
  note,
}: {
  readonly label: string;
  readonly value: string;
  readonly note?: string;
}) {
  return (
    <Panel className="flex flex-col gap-2">
      <span className="eyebrow text-fg-muted text-[0.5rem]">{label}</span>
      <span className="font-display text-3xl" data-numeric>
        {value}
      </span>
      {note ? <span className="text-fg-muted/60 text-xs text-pretty">{note}</span> : null}
    </Panel>
  );
}

/** Botón compacto para las acciones de formulario del panel. */
export function AdminButton({
  children,
  tone = "quiet",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly tone?: "quiet" | "accent" | "danger";
}) {
  return (
    <button
      {...props}
      className={cn(
        "eyebrow rounded-(--radius-card) border px-2.5 py-1.5 text-[0.5rem] transition-colors",
        tone === "accent" && "border-accent/50 text-accent hover:bg-accent/10",
        tone === "danger" && "border-danger/40 text-danger hover:bg-danger/10",
        tone === "quiet" && "border-line text-fg-muted hover:border-fg-muted/60 hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

export function DataTable({
  headers,
  children,
}: {
  readonly headers: readonly string[];
  readonly children: ReactNode;
}) {
  return (
    // El scroll horizontal vive en el contenedor de la tabla, nunca en la
    // página: el cuerpo del documento no debe desplazarse en horizontal.
    <div className="border-line overflow-x-auto rounded-(--radius-card) border">
      <table className="w-full min-w-3xl border-collapse text-sm">
        <thead>
          <tr className="border-line bg-surface-raised border-b">
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="eyebrow text-fg-muted px-4 py-3 text-left text-[0.5rem] whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Row({ children }: { readonly children: ReactNode }) {
  return <tr className="border-line-soft hover:bg-surface-raised/60 border-b last:border-0">{children}</tr>;
}

export function Cell({
  children,
  numeric = false,
  className,
}: {
  readonly children: ReactNode;
  readonly numeric?: boolean;
  readonly className?: string;
}) {
  return (
    <td
      className={cn("px-4 py-3.5 align-middle", numeric && "text-right", className)}
      data-numeric={numeric || undefined}
    >
      {children}
    </td>
  );
}
