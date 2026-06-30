import { Mail, MapPin, Phone } from "lucide-react";
import type { BlockProps } from "../../../config/types";

interface ContactConfig {
  email?: string;
  phone?: string;
  address?: string;
}

export function ContactBlock({ config, t, blockId }: BlockProps) {
  const { email, phone, address } = config as ContactConfig;
  const hasDetails = email || phone || address;

  return (
    <section id={blockId} className="py-20 sm:py-28 px-6 bg-secondary/40">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <span aria-hidden className="block h-1 w-12 rounded-full bg-primary mb-6" />
          {t.title && (
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {t.title}
            </h2>
          )}
          {t.description && (
            <p
              className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {t.description}
            </p>
          )}
        </div>

        {hasDetails && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {email && (
              <ContactCard
                icon={<Mail className="h-5 w-5" />}
                label="Email"
                href={`mailto:${email}`}
                value={email}
              />
            )}
            {phone && (
              <ContactCard
                icon={<Phone className="h-5 w-5" />}
                label="Phone"
                href={`tel:${phone}`}
                value={phone}
              />
            )}
            {address && (
              <ContactCard
                icon={<MapPin className="h-5 w-5" />}
                label="Address"
                value={address}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function ContactCard({
  icon,
  label,
  href,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  value: string;
}) {
  return (
    <div className="group flex flex-col items-center gap-3 rounded-[var(--radius)] border border-border bg-card p-8 text-center transition-shadow hover:shadow-md">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          className="text-sm font-medium text-card-foreground hover:text-primary transition-colors break-words"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm font-medium text-card-foreground">{value}</p>
      )}
    </div>
  );
}
