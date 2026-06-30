import { MarketingHeader } from "./sections/MarketingHeader";
import { HeroSection } from "./sections/HeroSection";
import { HowItWorksSection } from "./sections/HowItWorksSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { WhySoSSection } from "./sections/WhySoSSection";
import { PricingSection } from "./sections/PricingSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { FaqSection } from "./sections/FaqSection";
import { CtaSection } from "./sections/CtaSection";
import { FooterSection } from "./sections/FooterSection";
import { MarketingJsonLd } from "./sections/MarketingJsonLd";
import { getPlatformTranslationsByNamespaces } from "@/5-shared/lib/db/platform-translations";
import { getLocale } from "next-intl/server";
import { detectCountry } from "@/5-shared/lib/geo/detect";
import { countryToCurrency } from "@/5-shared/lib/geo/currency";

export async function MarketingPage({ ccOverride }: { ccOverride?: string }) {
  const locale = await getLocale();
  const country = await detectCountry(ccOverride ?? null);
  const currency = countryToCurrency(country);
  const translations = await getPlatformTranslationsByNamespaces(
    [
      "marketing.header",
      "marketing.hero",
      "marketing.howitworks",
      "marketing.features",
      "marketing.why-sos",
      "marketing.pricing",
      "marketing.testimonials",
      "marketing.faq",
      "marketing.cta",
      "marketing.footer",
    ],
    locale,
  );

  return (
    <div className="min-h-screen bg-background">
      <MarketingJsonLd locale={locale} />
      <MarketingHeader translations={translations["marketing.header"]} />
      <main>
        <HeroSection translations={translations["marketing.hero"]} locale={locale} />
        <HowItWorksSection translations={translations["marketing.howitworks"]} />
        <FeaturesSection translations={translations["marketing.features"]} />
        <WhySoSSection translations={translations["marketing.why-sos"]} locale={locale} />
        <PricingSection translations={translations["marketing.pricing"]} locale={locale} currency={currency} />
        <TestimonialsSection translations={translations["marketing.testimonials"]} />
        <FaqSection translations={translations["marketing.faq"]} />
        <CtaSection translations={translations["marketing.cta"]} />
      </main>
      <FooterSection translations={translations["marketing.footer"]} locale={locale} />
    </div>
  );
}
