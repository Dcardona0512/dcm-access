"use client";

import { useActionState } from "react";

import { Honeypot, TextAreaField, TextField } from "@/components/ui/Field";
import type { Dictionary } from "@/content/types";
import { submitContact } from "@/lib/forms/actions";
import { initialFormState } from "@/lib/forms/state";
import type { Locale } from "@/lib/i18n/config";

import { FormError, FormSuccess, SubmitButton } from "./FormParts";

export function ContactForm({
  locale,
  dict,
}: {
  readonly locale: Locale;
  readonly dict: Dictionary;
}) {
  const [state, action] = useActionState(submitContact, initialFormState);

  if (state.status === "success") {
    return (
      <FormSuccess
        heading={dict.contact.successHeading}
        body={dict.contact.successBody}
        reference={state.reference}
        dict={dict}
      />
    );
  }

  return (
    <form action={action} className="relative flex flex-col gap-5">
      <input type="hidden" name="locale" value={locale} />
      <Honeypot />

      <FormError state={state} />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="name"
          label={dict.contact.fields.name.label}
          autoComplete="name"
          required
          error={state.errors?.name}
        />
        <TextField
          name="email"
          type="email"
          inputMode="email"
          label={dict.contact.fields.email.label}
          autoComplete="email"
          required
          error={state.errors?.email}
        />
        <TextField
          name="phone"
          type="tel"
          inputMode="tel"
          label={dict.contact.fields.phone.label}
          autoComplete="tel"
          optional
          optionalLabel={dict.common.optional}
          error={state.errors?.phone}
        />
        <TextField
          name="subject"
          label={dict.contact.fields.subject.label}
          required
          error={state.errors?.subject}
        />
      </div>

      <TextAreaField
        name="message"
        label={dict.contact.fields.message.label}
        required
        error={state.errors?.message}
      />

      <div>
        <SubmitButton label={dict.contact.submit} pendingLabel={dict.common.submitting} />
      </div>
    </form>
  );
}
