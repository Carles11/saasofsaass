import { Resend } from "resend";
import { appInviteUrl } from "@/5-shared/lib/auth/auth-urls";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@mail.saasofsaass.com";

function interpolate(str: string, vars: Record<string, string>): string {
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? k);
}

// ── Team invitation email (workspace-level, token-based accept link) ──────────
// Localised copy for the team/invitations flow. Refined per-locale by the
// translation pass; English is the canonical source.
const teamInviteI18n: Record<
  string,
  {
    subject: string;
    heading: string;
    greeting: string;
    body: string;
    cta: string;
    footer: string;
    roleLabel: Record<string, string>;
  }
> = {
  en: {
    subject: "{inviter} invited you to collaborate on SaaSofSaaS",
    heading: "You've been invited",
    greeting: "Hi {name},",
    body: "{inviter} has invited you as a {role} on SaaSofSaaS. Click below to view the invitation and get started.",
    cta: "View invitation",
    footer: "If you don't have an account yet, create one with this email at the same link. This invitation expires in 7 days.",
    roleLabel: { webmaster: "site manager", editor: "editor" },
  },
  es: {
    subject: "{inviter} te ha invitado a colaborar en SaaSofSaaS",
    heading: "Has sido invitado",
    greeting: "Hola {name}:",
    body: "{inviter} te ha invitado como {role} en SaaSofSaaS. Haz clic abajo para ver la invitación y empezar.",
    cta: "Ver invitación",
    footer: "Si aún no tienes cuenta, crea una con este correo en el mismo enlace. Esta invitación caduca en 7 días.",
    roleLabel: { webmaster: "gestor del sitio", editor: "editor" },
  },
  ca: {
    subject: "{inviter} t'ha convidat a col·laborar a SaaSofSaaS",
    heading: "Has estat convidat",
    greeting: "Hola {name}:",
    body: "{inviter} t'ha convidat com a {role} a SaaSofSaaS. Fes clic a sota per veure la invitació i començar.",
    cta: "Veure invitació",
    footer: "Si encara no tens compte, crea'n una amb aquest correu al mateix enllaç. Aquesta invitació caduca en 7 dies.",
    roleLabel: { webmaster: "gestor del lloc", editor: "editor" },
  },
  fr: {
    subject: "{inviter} vous a invité à collaborer sur SaaSofSaaS",
    heading: "Vous avez été invité",
    greeting: "Bonjour {name},",
    body: "{inviter} vous a invité en tant que {role} sur SaaSofSaaS. Cliquez ci-dessous pour voir l'invitation et commencer.",
    cta: "Voir l'invitation",
    footer: "Si vous n'avez pas encore de compte, créez-en un avec cet e-mail au même lien. Cette invitation expire dans 7 jours.",
    roleLabel: { webmaster: "gestionnaire du site", editor: "éditeur" },
  },
  de: {
    subject: "{inviter} hat Sie zur Zusammenarbeit auf SaaSofSaaS eingeladen",
    heading: "Sie wurden eingeladen",
    greeting: "Hallo {name},",
    body: "{inviter} hat Sie als {role} auf SaaSofSaaS eingeladen. Klicken Sie unten, um die Einladung anzusehen und loszulegen.",
    cta: "Einladung ansehen",
    footer: "Falls Sie noch kein Konto haben, erstellen Sie eines mit dieser E-Mail über denselben Link. Diese Einladung läuft in 7 Tagen ab.",
    roleLabel: { webmaster: "Site-Manager", editor: "Editor" },
  },
  it: {
    subject: "{inviter} ti ha invitato a collaborare su SaaSofSaaS",
    heading: "Sei stato invitato",
    greeting: "Ciao {name},",
    body: "{inviter} ti ha invitato come {role} su SaaSofSaaS. Clicca qui sotto per vedere l'invito e iniziare.",
    cta: "Vedi invito",
    footer: "Se non hai ancora un account, creane uno con questa email allo stesso link. Questo invito scade tra 7 giorni.",
    roleLabel: { webmaster: "gestore del sito", editor: "editor" },
  },
  eu: {
    subject: "{inviter}-ek SaaSofSaaS-en kolaboratzera gonbidatu zaitu",
    heading: "Gonbidatua izan zara",
    greeting: "Kaixo {name}:",
    body: "{inviter}-ek {role} gisa gonbidatu zaitu SaaSofSaaS-en. Egin klik behean gonbidapena ikusi eta hasteko.",
    cta: "Ikusi gonbidapena",
    footer: "Konturik ez baduzu oraindik, sortu bat posta honekin esteka berean. Gonbidapen hau 7 egunetan iraungiko da.",
    roleLabel: { webmaster: "gunearen kudeatzailea", editor: "editorea" },
  },
  ga: {
    subject: "Thug {inviter} cuireadh duit comhoibriú ar SaaSofSaaS",
    heading: "Tugadh cuireadh duit",
    greeting: "Dia duit {name},",
    body: "Thug {inviter} cuireadh duit mar {role} ar SaaSofSaaS. Cliceáil thíos chun an cuireadh a fheiceáil agus tosú.",
    cta: "Féach ar an gcuireadh",
    footer: "Mura bhfuil cuntas agat fós, cruthaigh ceann leis an ríomhphost seo ag an nasc céanna. Rachaidh an cuireadh seo in éag i gceann 7 lá.",
    roleLabel: { webmaster: "bainisteoir an tsuímh", editor: "eagarthóir" },
  },
};

interface TeamInviteEmailParams {
  to: string;
  invitedName?: string | null;
  inviterName: string;
  role: "webmaster" | "editor";
  locale: string;
  token: string;
}

export async function sendTeamInviteEmail({
  to,
  invitedName,
  inviterName,
  role,
  locale,
  token,
}: TeamInviteEmailParams) {
  const strings = teamInviteI18n[locale] ?? teamInviteI18n["en"];
  const acceptUrl = appInviteUrl(token, locale);
  const roleLabel = strings.roleLabel[role] ?? role;
  const vars = { inviter: inviterName, role: roleLabel, name: invitedName ?? "" };

  const greetingHtml = invitedName
    ? `<p style="margin:0 0 12px;color:#444">${interpolate(strings.greeting, vars)}</p>`
    : "";

  await resend.emails.send({
    from: FROM,
    to,
    subject: interpolate(strings.subject, vars),
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 16px">${interpolate(strings.heading, vars)}</h2>
        ${greetingHtml}
        <p style="margin:0 0 24px;color:#444">${interpolate(strings.body, vars)}</p>
        <a href="${acceptUrl}" style="display:inline-block;background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
          ${strings.cta}
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#999">${strings.footer}</p>
      </div>
    `,
  });
}
