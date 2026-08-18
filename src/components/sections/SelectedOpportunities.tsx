import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { ArrowEast, Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import type { Dictionary } from "@/content/types";
import { getRepositories } from "@/lib/data";
import { localizePath, type Locale } from "@/lib/i18n/config";

/**
 * Selected Opportunities (§15).
 *
 * Cinco como máximo, y la primera a doble ancho. El límite es intencional: "no
 * mostrar cientos de anuncios. La experiencia debe transmitir exclusividad."
 */
export async function SelectedOpportunities({
  locale,
  dict,
}: {
  readonly locale: Locale;
  readonly dict: Dictionary;
}) {
  const { opportunities, categories } = getRepositories();

  const [page, allCategories] = await Promise.all([
    opportunities.search({ featured: true, visibility: ["public"], sort: "newest", limit: 5 }),
    categories.list(),
  ]);

  const categoryFor = (id: string) => allCategories.find((category) => category.id === id);

  return (
    <Section id="selected" width="wide" divider>
      <SectionHeading
        eyebrow={dict.home.selected.eyebrow}
        heading={dict.home.selected.heading}
        lede={dict.home.selected.lede}
        action={
          <Button href={localizePath("/opportunities", locale)} variant="outline" size="sm">
            {dict.home.selected.cta}
            <ArrowEast />
          </Button>
        }
      />

      {page.items.length === 0 ? (
        <EmptyState
          className="mt-16"
          heading={dict.catalog.empty.heading}
          body={dict.catalog.empty.body}
          action={
            <Button href={localizePath("/private/request", locale)} variant="accent">
              {dict.catalog.empty.cta}
              <ArrowEast />
            </Button>
          }
        />
      ) : (
        <RevealGroup className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {page.items.map((opportunity, index) => (
            <RevealItem
              key={opportunity.id}
              className={index === 0 ? "sm:col-span-2" : undefined}
            >
              <OpportunityCard
                opportunity={opportunity}
                category={categoryFor(opportunity.categoryId)}
                locale={locale}
                dict={dict}
                size={index === 0 ? "feature" : "default"}
                priority={index === 0}
                className="h-full"
              />
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </Section>
  );
}
