import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@mail.saasofsaass.com";

function getSignInUrl(locale: string): string {
  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "app.localhost";
  const isLocal = domain.includes("localhost");
  const base = isLocal ? `http://${domain}:3000` : `https://${domain}`;
  return `${base}/${locale}/auth/sign-in`;
}

// Minimal email strings per locale — keeps the email self-contained without DB queries
const i18n: Record<string, { subject: string; heading: string; body: string; cta: string; footer: string; roleLabel: Record<string, string> }> = {
  en: {
    subject: "You've been invited to manage {site}",
    heading: "You've been invited",
    body: "{inviter} has invited you as a {role} for {site} on SaaSofSaaS.",
    cta: "Sign in to get started",
    footer: "If you don't have an account yet, you can create one at the same link.",
    roleLabel: { owner: "site manager", editor: "editor" },
  },
  es: {
    subject: "Te han invitado a gestionar {site}",
    heading: "Has sido invitado",
    body: "{inviter} te ha invitado como {role} de {site} en SaaSofSaaS.",
    cta: "Inicia sesión para empezar",
    footer: "Si aún no tienes cuenta, puedes crearla en el mismo enlace.",
    roleLabel: { owner: "administrador", editor: "editor" },
  },
  ca: {
    subject: "T'han convidat a gestionar {site}",
    heading: "Has estat convidat",
    body: "{inviter} t'ha convidat com a {role} de {site} a SaaSofSaaS.",
    cta: "Inicia sessió per començar",
    footer: "Si encara no tens compte, pots crear-ne un al mateix enllaç.",
    roleLabel: { owner: "administrador", editor: "editor" },
  },
  fr: {
    subject: "Vous avez été invité à gérer {site}",
    heading: "Vous avez été invité",
    body: "{inviter} vous a invité en tant que {role} pour {site} sur SaaSofSaaS.",
    cta: "Se connecter pour commencer",
    footer: "Si vous n'avez pas encore de compte, vous pouvez en créer un au même lien.",
    roleLabel: { owner: "administrateur", editor: "éditeur" },
  },
  de: {
    subject: "Sie wurden eingeladen, {site} zu verwalten",
    heading: "Sie wurden eingeladen",
    body: "{inviter} hat Sie als {role} für {site} auf SaaSofSaaS eingeladen.",
    cta: "Anmelden um loszulegen",
    footer: "Falls Sie noch kein Konto haben, können Sie eines über denselben Link erstellen.",
    roleLabel: { owner: "Administrator", editor: "Editor" },
  },
  it: {
    subject: "Sei stato invitato a gestire {site}",
    heading: "Sei stato invitato",
    body: "{inviter} ti ha invitato come {role} per {site} su SaaSofSaaS.",
    cta: "Accedi per iniziare",
    footer: "Se non hai ancora un account, puoi crearne uno allo stesso link.",
    roleLabel: { owner: "amministratore", editor: "editor" },
  },
  eu: {
    subject: "{site} kudeatzen laguntzera gonbidatu zaituzte",
    heading: "Gonbidatua izan zara",
    body: "{inviter}-ek {role} gisa gonbidatu zaitu {site}-rako SaaSofSaaS-en.",
    cta: "Hasi saioa hasteko",
    footer: "Konturik ez baduzu oraindik, esteka berean sor dezakezu.",
    roleLabel: { owner: "administratzailea", editor: "editorea" },
  },
  ga: {
    subject: "Tugadh cuireadh duit {site} a bhainistiú",
    heading: "Tugadh cuireadh duit",
    body: "Thug {inviter} cuireadh duit mar {role} do {site} ar SaaSofSaaS.",
    cta: "Sínigh isteach le tosú",
    footer: "Mura bhfuil cuntas agat fós, is féidir leat ceann a chruthú ag an nasc céanna.",
    roleLabel: { owner: "riarthóir", editor: "eagarthóir" },
  },
};

function t(locale: string): typeof i18n["en"] {
  return i18n[locale] ?? i18n["en"];
}

function interpolate(str: string, vars: Record<string, string>): string {
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? k);
}

interface InviteEmailParams {
  to: string;
  tenantName: string;
  inviterName: string;
  role: "owner" | "editor";
  locale: string;
}

export async function sendInviteEmail({ to, tenantName, inviterName, role, locale }: InviteEmailParams) {
  const strings = t(locale);
  const signInUrl = getSignInUrl(locale);
  const roleLabel = strings.roleLabel[role] ?? role;

  const vars = { site: tenantName, inviter: inviterName, role: roleLabel };

  await resend.emails.send({
    from: FROM,
    to,
    subject: interpolate(strings.subject, vars),
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 16px">${interpolate(strings.heading, vars)}</h2>
        <p style="margin:0 0 24px;color:#444">${interpolate(strings.body, vars)}</p>
        <a href="${signInUrl}" style="display:inline-block;background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
          ${strings.cta}
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#999">${strings.footer}</p>
      </div>
    `,
  });
}
