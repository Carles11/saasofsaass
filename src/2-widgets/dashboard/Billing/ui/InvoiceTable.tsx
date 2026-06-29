import type { WorkspaceInvoice } from "@/3-features/manage-billing/actions/billingActions";
import {
  resolveTranslation,
  type TranslationDict,
} from "@/5-shared/lib/translations/resolve";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InvoiceTableProps {
  invoices: WorkspaceInvoice[];
  translations?: TranslationDict;
}

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  paid: "default",
  open: "secondary",
  void: "outline",
  uncollectible: "destructive",
  draft: "outline",
};

function formatAmount(
  amountInSmallestUnit: number,
  currency: string,
  locale?: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountInSmallestUnit / 100);
}

function formatDate(unixSeconds: number, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(unixSeconds * 1000));
}

export function InvoiceTable({ invoices, translations }: InvoiceTableProps) {
  const title = resolveTranslation(translations, "invoices.title", "Invoices");
  const emptyState = resolveTranslation(
    translations,
    "invoices.empty-state",
    "Your invoices will appear here once you have a paid subscription.",
  );
  const colDate = resolveTranslation(translations, "invoices.col-date", "Date");
  const colDescription = resolveTranslation(
    translations,
    "invoices.col-description",
    "Description",
  );
  const colAmount = resolveTranslation(
    translations,
    "invoices.col-amount",
    "Amount",
  );
  const colStatus = resolveTranslation(
    translations,
    "invoices.col-status",
    "Status",
  );
  const colReceipt = resolveTranslation(
    translations,
    "invoices.col-receipt",
    "Receipt",
  );
  const linkView = resolveTranslation(
    translations,
    "invoices.link-view",
    "View",
  );
  const linkPdf = resolveTranslation(translations, "invoices.link-pdf", "PDF");

  function statusLabel(status: string): string {
    const labels: Record<string, string> = {
      paid: resolveTranslation(translations, "invoices.status-paid", "Paid"),
      open: resolveTranslation(translations, "invoices.status-open", "Open"),
      void: resolveTranslation(translations, "invoices.status-void", "Void"),
      uncollectible: resolveTranslation(
        translations,
        "invoices.status-uncollectible",
        "Uncollectible",
      ),
      draft: resolveTranslation(translations, "invoices.status-draft", "Draft"),
    };
    return labels[status] ?? status;
  }

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
                <th className="text-left font-medium text-muted-foreground pb-3 pr-4">
                  {colDate}
                </th>
                <th className="text-left font-medium text-muted-foreground pb-3 pr-4">
                  {colDescription}
                </th>
                <th className="text-right font-medium text-muted-foreground pb-3 pr-4">
                  {colAmount}
                </th>
                <th className="text-left font-medium text-muted-foreground pb-3 pr-4">
                  {colStatus}
                </th>
                <th className="text-center font-medium text-muted-foreground pb-3">
                  {colReceipt}
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
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
              ) : (
                invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-3 pr-4 whitespace-nowrap text-foreground">
                      {formatDate(invoice.date)}
                    </td>
                    <td className="py-3 pr-4 text-foreground">
                      {invoice.description}
                    </td>
                    <td className="py-3 pr-4 text-right whitespace-nowrap text-foreground">
                      {formatAmount(invoice.amount, invoice.currency)}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        variant={STATUS_VARIANT[invoice.status] ?? "outline"}
                      >
                        {statusLabel(invoice.status)}
                      </Badge>
                    </td>
                    <td className="py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-3">
                        {invoice.hostedInvoiceUrl ? (
                          <a
                            href={invoice.hostedInvoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {linkView}
                          </a>
                        ) : null}
                        {invoice.invoicePdf ? (
                          <a
                            href={invoice.invoicePdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {linkPdf}
                          </a>
                        ) : null}
                        {!invoice.hostedInvoiceUrl && !invoice.invoicePdf ? (
                          <span className="text-muted-foreground">—</span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
