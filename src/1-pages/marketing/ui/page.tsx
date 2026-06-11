import { MarketingHeader } from "./sections/MarketingHeader";
import { HeroSection } from "./sections/HeroSection";
import { HowItWorksSection } from "./sections/HowItWorksSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { PricingSection } from "./sections/PricingSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { FaqSection } from "./sections/FaqSection";
import { CtaSection } from "./sections/CtaSection";
import { FooterSection } from "./sections/FooterSection";
import { getPlatformTranslationsByNamespaces } from "@/5-shared/lib/db/platform-translations";
import { getLocale } from "next-intl/server";

export async function MarketingPage() {
  const locale = await getLocale();
  const translations = await getPlatformTranslationsByNamespaces(
    [
      "marketing.header",
      "marketing.hero",
      "marketing.howitworks",
      "marketing.features",
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
      <MarketingHeader translations={translations["marketing.header"]} />
      <main>
        <HeroSection translations={translations["marketing.hero"]} locale={locale} />
        <HowItWorksSection translations={translations["marketing.howitworks"]} />
        <FeaturesSection translations={translations["marketing.features"]} />
        <PricingSection translations={translations["marketing.pricing"]} />
        <TestimonialsSection translations={translations["marketing.testimonials"]} />
        <FaqSection translations={translations["marketing.faq"]} />
        <CtaSection translations={translations["marketing.cta"]} />
      </main>
      <FooterSection translations={translations["marketing.footer"]} />
    </div>
  );
}
