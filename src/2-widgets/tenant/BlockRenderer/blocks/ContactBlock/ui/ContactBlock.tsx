import type { BlockProps } from "../../../config/types";

interface ContactConfig {
  email?: string;
  phone?: string;
  address?: string;
}

export function ContactBlock({ config, t }: BlockProps) {
  const { email, phone, address } = config as ContactConfig;
  const hasDetails = email || phone || address;

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {t.title && (
          <h2 className="text-3xl font-bold text-center mb-4">{t.title}</h2>
        )}
        {t.description && (
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
            {t.description}
          </p>
        )}
        {hasDetails && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {email && (
              <div className="rounded-xs border border-border bg-card p-6 text-center">
                <div className="text-2xl mb-2">✉</div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-1">
                  Email
                </h3>
                <a
                  href={`mailto:${email}`}
                  className="text-sm text-primary hover:underline break-all"
                >
                  {email}
                </a>
              </div>
            )}
            {phone && (
              <div className="rounded-xs border border-border bg-card p-6 text-center">
                <div className="text-2xl mb-2">📞</div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-1">
                  Phone
                </h3>
                <a
                  href={`tel:${phone}`}
                  className="text-sm text-primary hover:underline"
                >
                  {phone}
                </a>
              </div>
            )}
            {address && (
              <div className="rounded-xs border border-border bg-card p-6 text-center">
                <div className="text-2xl mb-2">📍</div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-1">
                  Address
                </h3>
                <p className="text-sm text-card-foreground">{address}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
