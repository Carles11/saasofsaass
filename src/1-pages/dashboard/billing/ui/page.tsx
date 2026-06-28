import { getBillingPageData } from "../api/data";
import { PlanSection, InvoicePlaceholder } from "@/2-widgets/dashboard/Billing";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface BillingPageProps {
  locale: string;
}

export async function BillingPage({ locale }: BillingPageProps) {
  const { profile, workspace, planConfig, nextPlan, currentSites, translations } =
    await getBillingPageData(locale);

  const title = resolveTranslation(translations, "title", "Billing");
  const subtitle = resolveTranslation(translations, "subtitle", "Manage your subscription, invoices, and payment methods.");
  const tabPlan = resolveTranslation(translations, "tab.plan", "Plan & Usage");
  const tabInvoices = resolveTranslation(translations, "tab.invoices", "Invoices");

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter">{title}</h1>
          <p className="text-muted-foreground font-medium mt-2">{subtitle}</p>
        </div>

        {profile && workspace && planConfig ? (
          <Tabs defaultValue="plan">
            <TabsList>
              <TabsTrigger value="plan">{tabPlan}</TabsTrigger>
              <TabsTrigger value="invoices">{tabInvoices}</TabsTrigger>
            </TabsList>

            <TabsContent value="plan" className="mt-6">
              <PlanSection
                workspace={workspace}
                planConfig={planConfig}
                nextPlan={nextPlan}
                currentSites={currentSites}
                translations={translations}
              />
            </TabsContent>

            <TabsContent value="invoices" className="mt-6">
              <InvoicePlaceholder translations={translations} />
            </TabsContent>
          </Tabs>
        ) : (
          <p className="text-muted-foreground">
            {resolveTranslation(translations, "sign-in-required", "Please sign in to manage billing.")}
          </p>
        )}
      </div>
    </main>
  );
}
