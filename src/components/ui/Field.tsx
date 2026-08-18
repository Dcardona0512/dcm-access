"use client";

import { useId } from "react";

import { HONEYPOT_FIELD } from "@/lib/security/rate-limit";
import { cn } from "@/lib/utils";

/* ============================================================================
   CAMPOS DE FORMULARIO (§39)
   ----------------------------------------------------------------------------
   Cada campo lleva su `label` real —nunca un placeholder haciendo de etiqueta—,
   su descripción enlazada por `aria-describedby` y su error anunciado con
   `role="alert"`. El estado de error se marca además con `aria-invalid`, no
   solo con color rojo: el color no es un canal accesible por sí mismo.
   ========================================================================== */

const controlBase =
  "w-full border border-line bg-transparent px-4 text-fg placeholder:text-fg-muted/40 " +
  "rounded-(--radius-card) outline-none transition-colors hover:border-fg-muted/40 " +
  "focus-visible:border-accent aria-invalid:border-danger";

type FieldShellProps = {
  readonly label: string;
  readonly htmlFor: string;
  readonly hint?: string;
  readonly error?: string;
  readonly optional?: boolean;
  readonly optionalLabel?: string;
  readonly children: React.ReactNode;
  readonly className?: string;
};

export function FieldShell({
  label,
  htmlFor,
  hint,
  error,
  optional,
  optionalLabel,
  children,
  className,
}: FieldShellProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="eyebrow text-fg-muted text-[0.5625rem]">
        {label}
        {optional ? <span className="text-fg-muted/50 normal-case"> · {optionalLabel}</span> : null}
      </label>

      {children}

      {hint && !error ? <p className="text-fg-muted/60 text-xs text-pretty">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-danger text-xs text-pretty">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type BaseProps = {
  readonly name: string;
  readonly label: string;
  readonly hint?: string;
  readonly error?: string;
  readonly optional?: boolean;
  readonly optionalLabel?: string;
  readonly defaultValue?: string;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly className?: string;
};

export function TextField({
  type = "text",
  autoComplete,
  inputMode,
  ...props
}: BaseProps & {
  readonly type?: "text" | "email" | "tel" | "url" | "number";
  readonly autoComplete?: string;
  readonly inputMode?: "text" | "email" | "tel" | "url" | "numeric";
}) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <FieldShell
      label={props.label}
      htmlFor={id}
      hint={props.hint}
      error={props.error}
      optional={props.optional}
      optionalLabel={props.optionalLabel}
      className={props.className}
    >
      <input
        id={id}
        name={props.name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        defaultValue={props.defaultValue}
        placeholder={props.placeholder}
        required={props.required}
        aria-invalid={props.error ? true : undefined}
        aria-describedby={props.hint || props.error ? hintId : undefined}
        className={cn(controlBase, "h-12")}
      />
    </FieldShell>
  );
}

export function TextAreaField({ rows = 5, ...props }: BaseProps & { readonly rows?: number }) {
  const id = useId();

  return (
    <FieldShell
      label={props.label}
      htmlFor={id}
      hint={props.hint}
      error={props.error}
      optional={props.optional}
      optionalLabel={props.optionalLabel}
      className={props.className}
    >
      <textarea
        id={id}
        name={props.name}
        rows={rows}
        defaultValue={props.defaultValue}
        placeholder={props.placeholder}
        required={props.required}
        aria-invalid={props.error ? true : undefined}
        className={cn(controlBase, "resize-y py-3 leading-relaxed")}
      />
    </FieldShell>
  );
}

export function SelectField({
  options,
  emptyLabel,
  ...props
}: BaseProps & {
  readonly options: readonly { readonly value: string; readonly label: string }[];
  readonly emptyLabel?: string;
}) {
  const id = useId();

  return (
    <FieldShell
      label={props.label}
      htmlFor={id}
      hint={props.hint}
      error={props.error}
      optional={props.optional}
      optionalLabel={props.optionalLabel}
      className={props.className}
    >
      <select
        id={id}
        name={props.name}
        defaultValue={props.defaultValue ?? ""}
        required={props.required}
        aria-invalid={props.error ? true : undefined}
        className={cn(controlBase, "h-12 cursor-pointer appearance-none")}
      >
        {emptyLabel ? (
          <option value="" className="bg-surface-raised">
            {emptyLabel}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-surface-raised">
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

/** Grupo de radios con descripción por opción. Se usa en confidencialidad. */
export function RadioCards({
  name,
  label,
  options,
  defaultValue,
  error,
}: {
  readonly name: string;
  readonly label: string;
  readonly options: readonly {
    readonly value: string;
    readonly label: string;
    readonly description?: string;
  }[];
  readonly defaultValue?: string;
  readonly error?: string;
}) {
  const id = useId();

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="eyebrow text-fg-muted mb-1 text-[0.5625rem]">{label}</legend>

      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option) => {
          const optionId = `${id}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                "border-line hover:border-fg-muted/50 flex cursor-pointer flex-col gap-2 border p-4",
                "rounded-(--radius-card) transition-colors",
                "has-checked:border-accent has-checked:bg-accent/5",
              )}
            >
              <span className="flex items-center gap-2.5">
                <input
                  id={optionId}
                  type="radio"
                  name={name}
                  value={option.value}
                  defaultChecked={defaultValue === option.value}
                  className="accent-accent h-3.5 w-3.5"
                />
                <span className="text-fg text-sm font-medium">{option.label}</span>
              </span>
              {option.description ? (
                <span className="text-fg-muted/70 text-xs text-pretty">{option.description}</span>
              ) : null}
            </label>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="text-danger text-xs">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export function CheckboxField({
  name,
  label,
  error,
  defaultChecked,
}: {
  readonly name: string;
  readonly label: string;
  readonly error?: string;
  readonly defaultChecked?: boolean;
}) {
  const id = useId();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          defaultChecked={defaultChecked}
          aria-invalid={error ? true : undefined}
          className="accent-accent mt-0.5 h-4 w-4 shrink-0"
        />
        <label htmlFor={id} className="text-fg-muted text-sm text-pretty">
          {label}
        </label>
      </div>
      {error ? (
        <p role="alert" className="text-danger text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Casillas múltiples: verticales en la postulación de partner. */
export function CheckboxGroup({
  name,
  label,
  options,
  error,
}: {
  readonly name: string;
  readonly label: string;
  readonly options: readonly { readonly value: string; readonly label: string }[];
  readonly error?: string;
}) {
  const id = useId();

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="eyebrow text-fg-muted mb-1 text-[0.5625rem]">{label}</legend>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const optionId = `${id}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                "border-line hover:border-fg-muted/50 flex cursor-pointer items-center gap-2.5 border px-4 py-2.5",
                "rounded-(--radius-pill) text-sm transition-colors",
                "has-checked:border-accent has-checked:text-accent",
              )}
            >
              <input
                id={optionId}
                type="checkbox"
                name={name}
                value={option.value}
                className="accent-accent h-3.5 w-3.5"
              />
              {option.label}
            </label>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="text-danger text-xs">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/**
 * Campo trampa. Oculto para la vista y para los lectores de pantalla, pero
 * presente en el DOM: los bots lo rellenan, las personas no lo ven (§40).
 */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor={HONEYPOT_FIELD}>Website</label>
      <input id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
