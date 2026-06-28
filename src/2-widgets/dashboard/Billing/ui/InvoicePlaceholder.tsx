import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface InvoicePlaceholderProps {
  translations?: TranslationDict;
}

export function InvoicePlaceholder({ translations }: InvoicePlaceholderProps) {
  const title = resolveTranslation(translations, "invoices.title", "Invoices");
  const emptyState = resolveTranslation(
    translations,
    "invoices.empty-state",
    "Your invoices will appear here once you have a paid subscription.",
  );
  const colDate = resolveTranslation(translations, "invoices.col-date", "Date");
  const colDescription = resolveTranslation(translations, "invoices.col-description", "Description");
  const colAmount = resolveTranslation(translations, "invoices.col-amount", "Amount");
  const colStatus = resolveTranslation(translations, "invoices.col-status", "Status");
  const colReceipt = resolveTranslation(translations, "invoices.col-receipt", "Receipt");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-medium text-muted-foreground pb-3 pr-4">{colDate}</th>
                <th className="text-left font-medium text-muted-foreground pb-3 pr-4">{colDescription}</th>
                <th className="text-right font-medium text-muted-foreground pb-3 pr-4">{colAmount}</th>
                <th className="text-left font-medium text-muted-foreground pb-3 pr-4">{colStatus}</th>
                <th className="text-center font-medium text-muted-foreground pb-3">{colReceipt}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="pt-12 pb-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-muted size-12 flex items-center justify-center mb-3">
                      <svg
                        className="size-6 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      {emptyState}
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
