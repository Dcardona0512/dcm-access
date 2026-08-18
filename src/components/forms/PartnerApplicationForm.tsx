"use client";

import { useActionState } from "react";

import {
  CheckboxField,
  CheckboxGroup,
  Honeypot,
  TextAreaField,
  TextField,
} from "@/components/ui/Field";
import { Eyebrow } from "@/components/ui/Section";
import type { Dictionary } from "@/content/types";
import { verticals } from "@/lib/domain/types";
import { submitPartnerApplication } from "@/lib/forms/actions";
import { initialFormState } from "@/lib/forms/state";
import type { Locale } from "@/lib/i18n/config";

import { FormError, FormSuccess, SubmitButton } from "./FormParts";

/**
 * Postulación de partner (§18).
 *
 * Los catorce campos del documento, agrupados en tres bloques legibles en una
 * sola página. Se descartó el asistente por pasos: obliga a mantener estado en
 * el cliente, rompe el autocompletado del navegador y esconde cuánto queda —
 * y quien postula es una empresa, que prefiere ver el alcance completo.
 */
export function PartnerApplicationForm({
  locale,
  dict,
}: {
  readonly locale: Locale;
  readonly dict: Dictionary;
}) {
  const [state, action] = useActionState(submitPartnerApplication, initialFormState);
  const copy = dict.partnerApply;

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

      <fieldset className="flex flex-col gap-6">
        <Eyebrow tone="muted">{copy.steps[0]}</Eyebrow>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="company"
            label={copy.fields.company.label}
            autoComplete="organization"
            required
            error={state.errors?.company}
            className="sm:col-span-2"
          />
          <TextField
            name="country"
            label={copy.fields.country.label}
            autoComplete="country-name"
            required
            error={state.errors?.country}
          />
          <TextField
            name="city"
            label={copy.fields.city.label}
            autoComplete="address-level2"
            optional
            optionalLabel={dict.common.optional}
            error={state.errors?.city}
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
          <TextField
            name="website"
            type="url"
            inputMode="url"
            label={copy.fields.website.label}
            placeholder="https://"
            optional
            optionalLabel={dict.common.optional}
            error={state.errors?.website}
            className="sm:col-span-2"
          />
        </div>

        <TextAreaField
          name="description"
          label={copy.fields.description.label}
          placeholder={copy.fields.description.placeholder}
          rows={4}
          required
          error={state.errors?.description}
        />
      </fieldset>

      <fieldset className="border-line flex flex-col gap-6 border-t pt-12">
        <Eyebrow tone="muted">{copy.steps[1]}</Eyebrow>

        <CheckboxGroup
          name="verticals"
          label={copy.fields.verticals.label}
          options={verticals.map((vertical) => ({
            value: vertical,
            label: dict.verticals[vertical].eyebrow,
          }))}
          error={state.errors?.verticals}
        />

        <TextAreaField
          name="services"
          label={copy.fields.services.label}
          placeholder={copy.fields.services.placeholder}
          rows={2}
          required
          error={state.errors?.services}
        />

        <TextAreaField
          name="operatingAreas"
          label={copy.fields.operatingAreas.label}
          placeholder={copy.fields.operatingAreas.placeholder}
          rows={2}
          required
          error={state.errors?.operatingAreas}
        />

        <TextAreaField
          name="commercialInfo"
          label={copy.fields.commercialInfo.label}
          placeholder={copy.fields.commercialInfo.placeholder}
          rows={3}
          optional
          optionalLabel={dict.common.optional}
          error={state.errors?.commercialInfo}
        />
      </fieldset>

      <fieldset className="border-line flex flex-col gap-6 border-t pt-12">
        <Eyebrow tone="muted">{copy.steps[2]}</Eyebrow>

        <TextAreaField
          name="certifications"
          label={copy.fields.certifications.label}
          placeholder={copy.fields.certifications.placeholder}
          hint={copy.fields.certifications.hint}
          rows={2}
          optional
          optionalLabel={dict.common.optional}
          error={state.errors?.certifications}
        />

        <TextAreaField
          name="licences"
          label={copy.fields.licences.label}
          hint={copy.fields.licences.hint}
          rows={2}
          optional
          optionalLabel={dict.common.optional}
          error={state.errors?.licences}
        />

        <TextAreaField
          name="documentation"
          label={copy.fields.documentation.label}
          hint={copy.fields.documentation.hint}
          rows={2}
          optional
          optionalLabel={dict.common.optional}
          error={state.errors?.documentation}
        />
      </fieldset>

      <div className="border-line flex flex-col gap-6 border-t pt-8">
        <p className="border-accent/25 bg-accent/[0.04] text-fg-muted rounded-(--radius-card) border px-4 py-3 text-sm text-pretty">
          {copy.reviewNotice}
        </p>

        <CheckboxField
          name="consent"
          label={dict.privateRequest.consent}
          error={state.errors?.consent}
        />

        <div>
          <SubmitButton label={copy.submit} pendingLabel={dict.common.submitting} />
        </div>
      </div>
    </form>
  );
}
