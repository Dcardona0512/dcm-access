"use client";

import { useActionState } from "react";

import {
  CheckboxField,
  Honeypot,
  RadioCards,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/ui/Field";
import type { Dictionary } from "@/content/types";
import { currencies, verticals } from "@/lib/domain/types";
import { submitPrivateRequest } from "@/lib/forms/actions";
import { initialFormState } from "@/lib/forms/state";
import type { Locale } from "@/lib/i18n/config";

import { FormError, FormSuccess, SubmitButton } from "./FormParts";

/**
 * Búsqueda privada (§21).
 *
 * El campo que diferencia este formulario de cualquier "contáctanos" es el
 * nivel de confidencialidad: el cliente decide de entrada cuánto puede
 * circular su requerimiento por la red, y esa elección viaja con el lead.
 */
export function PrivateRequestForm({
  locale,
  dict,
  defaultVertical,
}: {
  readonly locale: Locale;
  readonly dict: Dictionary;
  readonly defaultVertical?: string;
}) {
  const [state, action] = useActionState(submitPrivateRequest, initialFormState);
  const copy = dict.privateRequest;

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
    <form action={action} className="relative flex flex-col gap-8">
      <input type="hidden" name="locale" value={locale} />
      <Honeypot />

      <FormError state={state} />

      <TextAreaField
        name="what"
        label={copy.fields.what.label}
        placeholder={copy.fields.what.placeholder}
        hint={copy.fields.what.hint}
        rows={4}
        required
        error={state.errors?.what}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField
          name="vertical"
          label={copy.fields.vertical.label}
          emptyLabel={dict.home.search.anyCategory}
          defaultValue={defaultVertical}
          options={verticals.map((vertical) => ({
            value: vertical,
            label: dict.verticals[vertical].eyebrow,
          }))}
          error={state.errors?.vertical}
        />

        <TextField
          name="location"
          label={copy.fields.location.label}
          placeholder={copy.fields.location.placeholder}
          optional
          optionalLabel={dict.common.optional}
          error={state.errors?.location}
        />

        <SelectField
          name="timeline"
          label={copy.fields.timeline.label}
          emptyLabel={dict.catalog.facets.any}
          options={copy.timelineOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          error={state.errors?.timeline}
        />

        <TextField
          name="budget"
          inputMode="numeric"
          label={copy.fields.budget.label}
          placeholder={copy.fields.budget.placeholder}
          optional
          optionalLabel={dict.common.optional}
          error={state.errors?.budget}
        />

        <SelectField
          name="currency"
          label={copy.fields.currency.label}
          defaultValue="USD"
          options={currencies.map((currency) => ({ value: currency, label: currency }))}
          error={state.errors?.currency}
        />

        <SelectField
          name="contactMethod"
          label={copy.fields.contactMethod.label}
          defaultValue="email"
          options={copy.contactOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          error={state.errors?.contactMethod}
        />
      </div>

      <TextAreaField
        name="requirements"
        label={copy.fields.requirements.label}
        placeholder={copy.fields.requirements.placeholder}
        rows={3}
        optional
        optionalLabel={dict.common.optional}
        error={state.errors?.requirements}
      />

      <RadioCards
        name="confidentiality"
        label={copy.fields.confidentiality.label}
        defaultValue="standard"
        options={copy.confidentialityOptions}
        error={state.errors?.confidentiality}
      />

      <div className="border-line grid gap-5 border-t pt-8 sm:grid-cols-3">
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
        <TextField
          name="phone"
          type="tel"
          inputMode="tel"
          label={copy.fields.phone.label}
          autoComplete="tel"
          optional
          optionalLabel={dict.common.optional}
          error={state.errors?.phone}
        />
      </div>

      <CheckboxField name="consent" label={copy.consent} error={state.errors?.consent} />

      <div>
        <SubmitButton label={copy.submit} pendingLabel={dict.common.submitting} />
      </div>
    </form>
  );
}
