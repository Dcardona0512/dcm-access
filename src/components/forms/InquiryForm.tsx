"use client";

import { useActionState } from "react";

import { Honeypot, TextAreaField, TextField } from "@/components/ui/Field";
import type { Dictionary } from "@/content/types";
import type { Vertical } from "@/lib/domain/types";
import { submitInquiry } from "@/lib/forms/actions";
import { initialFormState } from "@/lib/forms/state";
import type { Locale } from "@/lib/i18n/config";

import { FormError, FormSuccess, SubmitButton } from "./FormParts";

/**
 * Consulta desde la ficha de una oportunidad (§15).
 * Cuatro campos: pedir más aquí cuesta conversiones y no aporta al broker.
 */
export function InquiryForm({
  locale,
  dict,
  opportunityId,
  vertical,
}: {
  readonly locale: Locale;
  readonly dict: Dictionary;
  readonly opportunityId?: string;
  readonly vertical?: Vertical;
}) {
  const [state, action] = useActionState(submitInquiry, initialFormState);

  if (state.status === "success") {
    return (
      <FormSuccess
        heading={dict.inquiry.successHeading}
        body={dict.inquiry.successBody}
        reference={state.reference}
        dict={dict}
      />
    );
  }

  return (
    <form action={action} className="relative flex flex-col gap-5">
      <input type="hidden" name="locale" value={locale} />
      {opportunityId ? <input type="hidden" name="opportunityId" value={opportunityId} /> : null}
      {vertical ? <input type="hidden" name="vertical" value={vertical} /> : null}
      <Honeypot />

      <FormError state={state} />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="name"
          label={dict.inquiry.fields.name.label}
          autoComplete="name"
          required
          error={state.errors?.name}
        />
        <TextField
          name="email"
          type="email"
          inputMode="email"
          label={dict.inquiry.fields.email.label}
          autoComplete="email"
          required
          error={state.errors?.email}
        />
      </div>

      <TextField
        name="phone"
        type="tel"
        inputMode="tel"
        label={dict.inquiry.fields.phone.label}
        autoComplete="tel"
        optional
        optionalLabel={dict.common.optional}
        error={state.errors?.phone}
      />

      <TextAreaField
        name="message"
        label={dict.inquiry.fields.message.label}
        placeholder={dict.inquiry.fields.message.placeholder}
        required
        rows={4}
        error={state.errors?.message}
      />

      <SubmitButton label={dict.inquiry.submit} pendingLabel={dict.common.submitting} />
    </form>
  );
}
