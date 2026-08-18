import type { Currency, Deal, Localized, Vertical } from "@/lib/domain/types";

/* ============================================================================
   MOTOR DE COMISIONES (§24)
   ----------------------------------------------------------------------------
   El documento es explícito: "no asumir una única forma de cobrar" y "diseña
   la arquitectura de manera que estos modelos puedan agregarse sin tener que
   reconstruir toda la plataforma".

   La respuesta es un registro de manejadores indexado por tipo de regla.
   Añadir un modelo de monetización nuevo son exactamente dos cosas:

     1. un miembro más en la unión `CommissionRule`
     2. una entrada más en `handlers`

   TypeScript obliga a lo segundo en cuanto haces lo primero: `handlers` es un
   tipo mapeado sobre `CommissionRule["type"]`, así que olvidarse del manejador
   es un error de compilación, no un bug en producción. Ni la UI, ni las rutas,
   ni el esquema de datos se enteran.
   ========================================================================== */

/** Dónde aplica una regla. Permite planes generales y excepciones puntuales. */
export type CommissionScope =
  | { readonly kind: "global" }
  | { readonly kind: "vertical"; readonly vertical: Vertical }
  | { readonly kind: "category"; readonly categoryId: string }
  | { readonly kind: "provider"; readonly providerId: string }
  | { readonly kind: "opportunity"; readonly opportunityId: string };

type RuleBase = {
  readonly id: string;
  readonly label: Localized;
  readonly scope: CommissionScope;
  /** Orden de aplicación. Menor se calcula antes; importa para topes. */
  readonly priority?: number;
};

export type CommissionRule =
  /** Fee cerrado por operación, independiente del valor. */
  | (RuleBase & {
      readonly type: "flat";
      readonly amount: number;
      readonly currency: Currency;
    })
  /** Comisión de intermediación clásica sobre el valor de la operación. */
  | (RuleBase & {
      readonly type: "percentage";
      readonly rate: number;
      readonly minAmount?: number;
      readonly maxAmount?: number;
    })
  /** Comisión por referido: porcentaje sobre el valor, reconocido a un tercero. */
  | (RuleBase & {
      readonly type: "referral_fee";
      readonly rate: number;
      readonly referrerId?: string;
    })
  /** Cobro por lead calificado entregado a un proveedor. */
  | (RuleBase & {
      readonly type: "lead_fee";
      readonly amountPerLead: number;
      readonly currency: Currency;
    })
  /** Participación en ingresos recurrentes durante la vigencia del acuerdo. */
  | (RuleBase & {
      readonly type: "revenue_share";
      readonly rate: number;
      readonly termMonths?: number;
    })
  /** Membresía o suscripción de empresa. */
  | (RuleBase & {
      readonly type: "subscription";
      readonly amountPerMonth: number;
      readonly currency: Currency;
      readonly months?: number;
    })
  /** Publicación destacada / posicionamiento. */
  | (RuleBase & {
      readonly type: "featured_placement";
      readonly amount: number;
      readonly currency: Currency;
      readonly slots?: number;
    });

export type CommissionRuleType = CommissionRule["type"];

export type CommissionPlan = {
  readonly id: string;
  readonly name: Localized;
  readonly currency: Currency;
  readonly rules: readonly CommissionRule[];
  readonly isDemo: boolean;
};

/* --- Conversión de moneda -------------------------------------------------- */

/**
 * Tabla de cambio relativa a USD. Es un punto de inyección, no un dato:
 * hoy la alimenta una constante de demostración y mañana un proveedor de FX
 * real, sin tocar el motor.
 */
export type RateTable = Readonly<Record<Currency, number>>;

export function convert(
  amount: number,
  from: Currency,
  to: Currency,
  rates: RateTable,
): number {
  if (from === to) return amount;
  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate) return amount;
  return (amount / fromRate) * toRate;
}

/* --- Contexto y resultado -------------------------------------------------- */

export type CommissionContext = {
  readonly deal: Deal;
  readonly categoryId?: string;
  readonly rates: RateTable;
  /** Moneda en la que se quiere el desglose. Por defecto, la del deal. */
  readonly currency?: Currency;
};

export type CommissionLine = {
  readonly ruleId: string;
  readonly type: CommissionRuleType;
  readonly label: Localized;
  readonly amount: number;
  readonly currency: Currency;
  /** Explicación legible de cómo salió la cifra, para mostrar en el CRM. */
  readonly basis: string;
};

export type CommissionBreakdown = {
  readonly currency: Currency;
  readonly lines: readonly CommissionLine[];
  readonly total: number;
  /** Reglas que no aplicaron y por qué; útil para depurar un plan. */
  readonly skipped: readonly { readonly ruleId: string; readonly reason: string }[];
};

/* --- Aplicabilidad ---------------------------------------------------------- */

function appliesTo(scope: CommissionScope, ctx: CommissionContext): boolean {
  switch (scope.kind) {
    case "global":
      return true;
    case "vertical":
      return ctx.deal.vertical === scope.vertical;
    case "category":
      return ctx.categoryId === scope.categoryId;
    case "provider":
      return ctx.deal.providerId === scope.providerId;
    case "opportunity":
      return ctx.deal.opportunityId === scope.opportunityId;
  }
}

/* --- Manejadores ------------------------------------------------------------ */

type Handler<T extends CommissionRule> = (
  rule: T,
  ctx: CommissionContext,
  target: Currency,
) => Omit<CommissionLine, "ruleId" | "type" | "label"> | null;

type HandlerRegistry = {
  [K in CommissionRuleType]: Handler<Extract<CommissionRule, { type: K }>>;
};

const percent = (rate: number) => `${(rate * 100).toFixed(2).replace(/\.00$/, "")}%`;

const handlers: HandlerRegistry = {
  flat: (rule, ctx, target) => ({
    amount: convert(rule.amount, rule.currency, target, ctx.rates),
    currency: target,
    basis: `Fee fijo de ${rule.amount.toLocaleString()} ${rule.currency}`,
  }),

  percentage: (rule, ctx, target) => {
    const gross = convert(ctx.deal.value, ctx.deal.currency, target, ctx.rates);
    let amount = gross * rule.rate;

    if (rule.minAmount !== undefined) amount = Math.max(amount, rule.minAmount);
    if (rule.maxAmount !== undefined) amount = Math.min(amount, rule.maxAmount);

    const bounds = [
      rule.minAmount !== undefined ? `mín. ${rule.minAmount.toLocaleString()}` : null,
      rule.maxAmount !== undefined ? `máx. ${rule.maxAmount.toLocaleString()}` : null,
    ]
      .filter(Boolean)
      .join(", ");

    return {
      amount,
      currency: target,
      basis: `${percent(rule.rate)} sobre ${gross.toLocaleString()} ${target}${
        bounds ? ` (${bounds})` : ""
      }`,
    };
  },

  referral_fee: (rule, ctx, target) => {
    const gross = convert(ctx.deal.value, ctx.deal.currency, target, ctx.rates);
    return {
      amount: gross * rule.rate,
      currency: target,
      basis: `Referido ${percent(rule.rate)} sobre ${gross.toLocaleString()} ${target}`,
    };
  },

  lead_fee: (rule, ctx, target) => {
    const leads = ctx.deal.leadCount ?? 1;
    return {
      amount: convert(rule.amountPerLead * leads, rule.currency, target, ctx.rates),
      currency: target,
      basis: `${leads} lead(s) × ${rule.amountPerLead.toLocaleString()} ${rule.currency}`,
    };
  },

  revenue_share: (rule, ctx, target) => {
    const months = rule.termMonths ?? ctx.deal.termMonths ?? 1;
    const gross = convert(ctx.deal.value, ctx.deal.currency, target, ctx.rates);
    return {
      amount: gross * rule.rate * months,
      currency: target,
      basis: `${percent(rule.rate)} × ${months} mes(es) sobre ${gross.toLocaleString()} ${target}`,
    };
  },

  subscription: (rule, ctx, target) => {
    const months = rule.months ?? ctx.deal.termMonths ?? 12;
    return {
      amount: convert(rule.amountPerMonth * months, rule.currency, target, ctx.rates),
      currency: target,
      basis: `${months} mes(es) × ${rule.amountPerMonth.toLocaleString()} ${rule.currency}`,
    };
  },

  featured_placement: (rule, ctx, target) => {
    const slots = rule.slots ?? 1;
    return {
      amount: convert(rule.amount * slots, rule.currency, target, ctx.rates),
      currency: target,
      basis: `${slots} publicación(es) destacada(s) × ${rule.amount.toLocaleString()} ${rule.currency}`,
    };
  },
};

/* --- Cálculo ---------------------------------------------------------------- */

/**
 * Función pura: mismas entradas, mismo desglose. No lee de red ni de reloj,
 * así que se puede probar y auditar línea por línea desde el CRM.
 */
export function computeCommission(
  plan: CommissionPlan,
  ctx: CommissionContext,
): CommissionBreakdown {
  const target = ctx.currency ?? ctx.deal.currency;
  const lines: CommissionLine[] = [];
  const skipped: { ruleId: string; reason: string }[] = [];

  const ordered = [...plan.rules].sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));

  for (const rule of ordered) {
    if (!appliesTo(rule.scope, ctx)) {
      skipped.push({ ruleId: rule.id, reason: `Fuera de alcance (${rule.scope.kind})` });
      continue;
    }

    // El registro está indexado por `type`; el cast reconcilia la unión
    // discriminada con su manejador correspondiente.
    const handler = handlers[rule.type] as Handler<CommissionRule>;
    const result = handler(rule, ctx, target);

    if (!result || result.amount === 0) {
      skipped.push({ ruleId: rule.id, reason: "Sin importe calculable" });
      continue;
    }

    lines.push({
      ruleId: rule.id,
      type: rule.type,
      label: rule.label,
      ...result,
    });
  }

  return {
    currency: target,
    lines,
    total: lines.reduce((sum, line) => sum + line.amount, 0),
    skipped,
  };
}

/** Etiquetas cortas para el CRM. */
export const commissionTypeLabels: Record<CommissionRuleType, Localized> = {
  flat: { es: "Comisión fija", en: "Flat fee" },
  percentage: { es: "Comisión porcentual", en: "Percentage" },
  referral_fee: { es: "Fee de referido", en: "Referral fee" },
  lead_fee: { es: "Fee por lead", en: "Lead fee" },
  revenue_share: { es: "Revenue share", en: "Revenue share" },
  subscription: { es: "Suscripción", en: "Subscription" },
  featured_placement: { es: "Publicación destacada", en: "Featured placement" },
};
