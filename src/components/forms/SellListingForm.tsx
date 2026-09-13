"use client";

import { useActionState, useState } from "react";

import {
  CheckboxField,
  Honeypot,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/ui/Field";
import { Eyebrow } from "@/components/ui/Section";
import type { Dictionary } from "@/content/types";
import { currencies } from "@/lib/domain/types";
import { submitSellRequest } from "@/lib/forms/sell-actions";
import { initialFormState } from "@/lib/forms/state";
import type { Locale } from "@/lib/i18n/config";

import { FormError, FormSuccess, SubmitButton } from "./FormParts";

/* ============================================================================
   SOLICITUD DE VENTA
   ----------------------------------------------------------------------------
   Sigue el mismo camino que los otros cuatro formularios del sitio:
   `useActionState`, campo trampa, errores por campo y pantalla de éxito con
   referencia. Lo que cambia es lo que dice: aquí se avisa ANTES de enviar de
   que esto no publica nada, porque descubrirlo después sería una sorpresa
   desagradable para quien acaba de subir su carro.

   Las opciones de los desplegables llegan desde el esquema de atributos de la
   categoría, no desde el diccionario: si estuvieran en los dos sitios,
   "Gasolina" y "Petrol" acabarían divergiendo del catálogo.
   ========================================================================== */

export type SelectOptions = readonly { readonly value: string; readonly label: string }[];

export function SellListingForm({
  locale,
  dict,
  categories,
  fuels,
  transmissions,
  conditions,
  countries,
}: {
  readonly locale: Locale;
  readonly dict: Dictionary;
  readonly categories: SelectOptions;
  readonly fuels: SelectOptions;
  readonly transmissions: SelectOptions;
  readonly conditions: SelectOptions;
  readonly countries: SelectOptions;
}) {
  const [state, action] = useActionState(submitSellRequest, initialFormState);
  const copy = dict.motorsMarket.sell;

  /**
   * El importe se oculta cuando el precio es "a consultar". Es el único
   * estado de cliente del formulario, y sigue funcionando sin él: el servidor
   * ignora el importe cuando el modo es `on_request`.
   */
  const [priceMode, setPriceMode] = useState<"fixed" | "on_request">("fixed");

  if (state.status === "success") {
    return (
      <FormSuccess
        heading={copy.successHeading}
        body={copy.successBody}
        reference={state.reference}
        dict={dict}
      />
    );
  }

  return (
    <form action={action} className="relative flex flex-col gap-12">
      <input type="hidden" name="locale" value={locale} />
      <Honeypot />

      <FormError state={state} />

      <Fieldset legend={copy.sections.vehicle}>
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            name="categoryId"
            label={copy.fields.category.label}
            options={categories}
            required
            error={state.errors?.categoryId}
          />
          <TextField
            name="make"
            label={copy.fields.make.label}
            placeholder={copy.fields.make.placeholder}
            required
            error={state.errors?.make}
          />
          <TextField
            name="model"
            label={copy.fields.model.label}
            placeholder={copy.fields.model.placeholder}
            required
            error={state.errors?.model}
          />
          <TextField
            name="year"
            type="number"
            inputMode="numeric"
            label={copy.fields.year.label}
            placeholder={copy.fields.year.placeholder}
            required
            error={state.errors?.year}
          />
          <TextField
            name="mileage"
            type="number"
            inputMode="numeric"
            label={copy.fields.mileage.label}
            placeholder={copy.fields.mileage.placeholder}
            hint={copy.fields.mileage.hint}
            optional
            optionalLabel={dict.common.optional}
            error={state.errors?.mileage}
          />
          <SelectField
            name="fuel"
            label={copy.fields.fuel.label}
            options={fuels}
            required
            error={state.errors?.fuel}
          />
          <SelectField
            name="transmission"
            label={copy.fields.transmission.label}
            options={transmissions}
            required
            error={state.errors?.transmission}
          />
          <SelectField
            name="condition"
            label={copy.fields.condition.label}
            options={conditions}
            defaultValue="excellent"
            error={state.errors?.condition}
          />
        </div>
      </Fieldset>

      <Fieldset legend={copy.sections.price}>
        <div className="grid gap-5 sm:grid-cols-3">
          <SelectField
            name="priceMode"
            label={copy.fields.priceMode.label}
            defaultValue="fixed"
            options={[
              { value: "fixed", label: copy.priceModes.fixed },
              { value: "on_request", label: copy.priceModes.onRequest },
            ]}
            onChange={(value) => setPriceMode(value === "on_request" ? "on_request" : "fixed")}
            error={state.errors?.priceMode}
          />

          {priceMode === "fixed" ? (
            <TextField
              name="priceAmount"
              inputMode="numeric"
              label={copy.fields.priceAmount.label}
              placeholder={copy.fields.priceAmount.placeholder}
              required
              error={state.errors?.priceAmount}
            />
          ) : null}

          <SelectField
            name="currency"
            label={copy.fields.currency.label}
            defaultValue="USD"
            options={currencies.map((code) => ({ value: code, label: code }))}
            error={state.errors?.currency}
          />
        </div>
      </Fieldset>

      <Fieldset legend={copy.sections.place}>
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            name="country"
            label={copy.fields.country.label}
            options={countries}
            required
            error={state.errors?.country}
          />
          <TextField
            name="city"
            label={copy.fields.city.label}
            placeholder={copy.fields.city.placeholder}
            required
            error={state.errors?.city}
          />
        </div>

        <TextAreaField
          name="description"
          label={copy.fields.description.label}
          placeholder={copy.fields.description.placeholder}
          hint={copy.fields.description.hint}
          rows={5}
          required
          error={state.errors?.description}
        />
      </Fieldset>

      <Fieldset legend={copy.sections.seller}>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="name"
            label={copy.fields.name.label}
            autoComplete="name"
            required
            error={state.errors?.name}
          />
          <TextField
            name="email"
            type="email"
            inputMode="email"
            label={copy.fields.email.label}
            autoComplete="email"
            required
            error={state.errors?.email}
          />
        </div>

        <TextField
          name="phone"
          type="tel"
          inputMode="tel"
          label={copy.fields.phone.label}
          placeholder={copy.fields.phone.placeholder}
          autoComplete="tel"
          optional
          optionalLabel={dict.common.optional}
          error={state.errors?.phone}
        />

        <CheckboxField name="consent" label={copy.consent} error={state.errors?.consent} />
      </Fieldset>

      <div className="flex flex-col gap-5">
        <p className="border-accent/25 bg-accent/[0.03] text-fg-muted rounded-(--radius-card) border px-5 py-4 text-sm text-pretty">
          {copy.reviewNote}
        </p>
        <SubmitButton label={copy.submit} pendingLabel={dict.common.submitting} variant="solid" />
      </div>
    </form>
  );
}

function Fieldset({
  legend,
  children,
}: {
  readonly legend: string;
  readonly children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-6">
      <legend className="mb-2">
        <Eyebrow>{legend}</Eyebrow>
      </legend>
      {children}
    </fieldset>
  );
}
