import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const FILE = resolve(ROOT, "src/5-shared/lib/db/seed-platform-translations.ts");

// ── Legal entry definitions ──────────────────────────────────────────────────
// All entries with only English text (need AI translation)
// Format: [namespace, key, enText]

const entries = [
  // ── Marketing: Footer (already translated) ──
  ...([
    ["marketing.footer", "production", "Live Production", "Producción en vivo", "Producció en viu", "Production en direct", "Live-Produktion", "Produzione live", "Zuzeneko ekoizpena", "Produción en vivo"],
    ["marketing.footer", "resources", "Resources", "Recursos", "Recursos", "Ressources", "Ressourcen", "Risorse", "Baliabideak", "Recursos"],
    ["marketing.footer", "legal", "Legal", "Legal", "Legal", "Mentions légales", "Rechtliches", "Note legali", "Legea", "Legal"],
    ["marketing.footer", "languages", "Global Reach", "Alcance global", "Abast global", "Portée mondiale", "Globale Reichweite", "Copertura globale", "Eskura globala", "Alcance global"],
    ["marketing.footer", "feature-structured", "Structured vs AI Websites", "Sitios web estructurados vs IA", "Llocs web estructurats vs IA", "Sites structurés vs IA", "Strukturierte vs KI-Websites", "Siti strutturati vs IA", "Webgune egituratuak vs AI", "Sitios web estruturados vs IA"],
    ["marketing.footer", "at_a_glance.title", "Platform Entity Data", "Datos de la entidad de la plataforma", "Dades de l'entitat de la plataforma", "Données de l'entité de la plateforme", "Plattformentitätsdaten", "Dati dell'entità della piattaforma", "Plataforma-entitatearen datuak", "Datos da entidade da plataforma"],
    ["marketing.footer", "made_with_love", "Built by", "Creado por", "Creat per", "Créé par", "Erstellt von", "Creato da", "Sortzailea", "Creado por"],
    ["marketing.footer", "env_label", "ENV", "ENTORNO", "ENTORN", "ENV", "UMGEBUNG", "AMBIENTE", "INGURUNEA", "AMB"],
    ["marketing.footer", "author", "Carles del Río", "Carles del Río", "Carles del Río", "Carles del Río", "Carles del Río", "Carles del Río", "Carles del Río", "Carles del Río"],
    ["marketing.footer", "link.terms-of-service", "Terms of Service", "Términos del servicio", "Termes del servei", "Conditions d'utilisation", "Nutzungsbedingungen", "Termini di servizio", "Zerbitzu-baldintzak", "Termos do servizo"],
    ["marketing.footer", "link.privacy-policy", "Privacy Policy", "Política de privacidad", "Política de privacitat", "Politique de confidentialité", "Datenschutzrichtlinie", "Informativa sulla privacy", "Pribatutasun-politika", "Política de privacidade"],
    ["marketing.footer", "link.cookie-policy", "Cookie Policy", "Política de cookies", "Política de cookies", "Politique des cookies", "Cookie-Richtlinie", "Informativa sui cookie", "Cookie politika", "Política de cookies"],
  ]).map(([ns, k, en, es, ca, fr, de, it, eu, ga]) => ({ ns, k, translations: { en, es, ca, fr, de, it, eu, ga } })),

  // ── Marketing: Footer (English only) ──
  { ns: "marketing.footer", k: "at_a_glance.body",             translations: { en: "SoSS Engine is a 2026-native, multilingual SaaS for creating multi-tenant websites. Supporting {count} languages ({list}), it enables professionals to build and manage client sites with AI-powered translations, custom domains, and role-based access." } },

  // ── Marketing: Legal Meta (English only) ──
  { ns: "marketing.meta", k: "terms.title",                     translations: { en: "Terms of Service | SoSS Engine" } },
  { ns: "marketing.meta", k: "terms.description",               translations: { en: "These Terms of Service govern your use of the SoSS Engine multi-tenant website builder platform." } },
  { ns: "marketing.meta", k: "privacy.title",                   translations: { en: "Privacy Policy | SoSS Engine" } },
  { ns: "marketing.meta", k: "privacy.description",             translations: { en: "This policy describes how SoSS Engine protects your personal information. We are committed to transparency and global compliance." } },
  { ns: "marketing.meta", k: "cookie.title",                    translations: { en: "Cookie Policy | SoSS Engine" } },
  { ns: "marketing.meta", k: "cookie.description",              translations: { en: "This policy explains how SoSS Engine uses cookies and similar technologies to improve your experience." } },

  // ── Marketing: Legal Terms of Service (English only) ──
  { ns: "marketing.legal.terms", k: "meta.title",               translations: { en: "Terms of Service | SoSS Engine" } },
  { ns: "marketing.legal.terms", k: "meta.description",         translations: { en: "These Terms of Service govern your use of the SoSS Engine multi-tenant website builder platform." } },
  { ns: "marketing.legal.terms", k: "title",                    translations: { en: "Terms of Service" } },
  { ns: "marketing.legal.terms", k: "version",                  translations: { en: "Last updated on " } },
  { ns: "marketing.legal.terms", k: "intro",                    translations: { en: "These Terms of Service govern your use of the SoSS Engine platform." } },
  { ns: "marketing.legal.terms", k: "navigation",               translations: { en: "Table of Contents" } },
  { ns: "marketing.legal.terms", k: "use.title",                translations: { en: "1. Use of Service" } },
  { ns: "marketing.legal.terms", k: "use.desc",                 translations: { en: "You agree to use the SoSS Engine platform only for lawful purposes related to creating and managing websites for your clients. The platform is intended for professionals and agencies building multi-tenant websites." } },
  { ns: "marketing.legal.terms", k: "account.title",            translations: { en: "2. Account Registration" } },
  { ns: "marketing.legal.terms", k: "account.desc",             translations: { en: "You are responsible for maintaining the confidentiality of your account credentials and all activities under your account. We use Neon Auth for secure authentication." } },
  { ns: "marketing.legal.terms", k: "billing.title",            translations: { en: "3. Payments & Subscriptions" } },
  { ns: "marketing.legal.terms", k: "billing.desc",             translations: { en: "Payments are processed securely via Stripe. All plans are billed monthly. You may upgrade, downgrade, or cancel your subscription at any time. Downgrading may affect access to certain features tied to your plan tier." } },
  { ns: "marketing.legal.terms", k: "content.title",            translations: { en: "4. Intellectual Property" } },
  { ns: "marketing.legal.terms", k: "content.desc",             translations: { en: "All platform software, design, templates, and infrastructure — including the multi-tenant engine, block system, AI translation pipeline, and branding tools — are owned by SoSS Engine. You may not copy, modify, or redistribute the platform itself." } },
  { ns: "marketing.legal.terms", k: "user_content.title",       translations: { en: "5. User Content" } },
  { ns: "marketing.legal.terms", k: "user_content.desc",        translations: { en: "You retain full ownership of all content you upload — including text, images, and branding — for your client websites. By using SoSS Engine, you grant us a limited license to host, store, and display this content specifically to provide our website-building services." } },
  { ns: "marketing.legal.terms", k: "prohibited.title",         translations: { en: "6. Prohibited Conduct" } },
  { ns: "marketing.legal.terms", k: "prohibited.laws",          translations: { en: "Violating any local or international laws" } },
  { ns: "marketing.legal.terms", k: "prohibited.ip",            translations: { en: "Uploading content that infringes on third-party intellectual property" } },
  { ns: "marketing.legal.terms", k: "prohibited.malicious",     translations: { en: "Attempting to reverse engineer, scrape, or interfere with platform infrastructure" } },
  { ns: "marketing.legal.terms", k: "prohibited.access",        translations: { en: "Unauthorized access to other users' tenant sites or data" } },
  { ns: "marketing.legal.terms", k: "prohibited.domain_abuse",  translations: { en: "Circumventing site, domain, or plan limits — for example, by creating multiple accounts to exceed plan caps" } },
  { ns: "marketing.legal.terms", k: "termination.title",        translations: { en: "7. Termination" } },
  { ns: "marketing.legal.terms", k: "termination.desc",         translations: { en: "We reserve the right to suspend or terminate accounts that violate these Terms or negatively impact platform stability. Upon termination, your client sites may be taken offline after a grace period." } },
  { ns: "marketing.legal.terms", k: "disclaimer.title",         translations: { en: "8. Disclaimers & Liability" } },
  { ns: "marketing.legal.terms", k: "disclaimer.desc",          translations: { en: `SoSS Engine is provided "as is". We are not liable for third-party content, server downtime, or loss of data beyond the subscription fees paid in the 30 days prior to the claim.` } },
  { ns: "marketing.legal.terms", k: "changes.title",            translations: { en: "9. Changes to Terms" } },
  { ns: "marketing.legal.terms", k: "changes.desc",             translations: { en: "We update these terms as our platform evolves. The 'Last Updated' date will be updated accordingly. Continued use after changes constitutes acceptance." } },
  { ns: "marketing.legal.terms", k: "contact.title",            translations: { en: "10. Contact" } },
  { ns: "marketing.legal.terms", k: "contact.desc",             translations: { en: "For questions about these Terms, contact:" } },

  // ── Marketing: Legal Privacy Policy (English only) ──
  { ns: "marketing.legal.privacy", k: "meta.title",             translations: { en: "Privacy Policy | SoSS Engine" } },
  { ns: "marketing.legal.privacy", k: "meta.description",       translations: { en: "This policy describes how SoSS Engine protects your personal information. We are committed to transparency and global compliance." } },
  { ns: "marketing.legal.privacy", k: "badge",                  translations: { en: "Privacy First" } },
  { ns: "marketing.legal.privacy", k: "title",                  translations: { en: "Privacy Policy" } },
  { ns: "marketing.legal.privacy", k: "version",                translations: { en: "Last updated on " } },
  { ns: "marketing.legal.privacy", k: "intro",                  translations: { en: "This policy describes how SoSS Engine protects your personal information. We are committed to transparency and global compliance." } },
  { ns: "marketing.legal.privacy", k: "navigation",             translations: { en: "Sections" } },
  { ns: "marketing.legal.privacy", k: "collect.title",          translations: { en: "1. Information We Collect" } },
  { ns: "marketing.legal.privacy", k: "collect.account",        translations: { en: "Account & Profile Data" } },
  { ns: "marketing.legal.privacy", k: "collect.account_desc",   translations: { en: "Name, email, and preferred language provided during registration via Neon Auth." } },
  { ns: "marketing.legal.privacy", k: "collect.usage",          translations: { en: "Usage & Analytical Data" } },
  { ns: "marketing.legal.privacy", k: "collect.usage_desc",     translations: { en: "Interactions with our builder, feature usage, and page views tracked via Google Analytics 4 (GA4)." } },
  { ns: "marketing.legal.privacy", k: "collect.payment",        translations: { en: "Transaction Data" } },
  { ns: "marketing.legal.privacy", k: "collect.payment_desc",   translations: { en: "Payment status and plan selection processed by Stripe. We do not store credit card details on our servers." } },
  { ns: "marketing.legal.privacy", k: "collect.cookies",        translations: { en: "Cookies & Identifiers:" } },
  { ns: "marketing.legal.privacy", k: "collect.cookies_desc",   translations: { en: "We use functional and analytical cookies. See our " } },
  { ns: "marketing.legal.privacy", k: "collect.cookies_link",   translations: { en: "Cookie Policy" } },
  { ns: "marketing.legal.privacy", k: "collect.cookies_desc2",  translations: { en: "for granular details." } },
  { ns: "marketing.legal.privacy", k: "use.title",              translations: { en: "2. How We Use Your Data" } },
  { ns: "marketing.legal.privacy", k: "use.improve",            translations: { en: "Optimizing platform performance and features" } },
  { ns: "marketing.legal.privacy", k: "use.communicate",        translations: { en: "Sending transactional emails about your account" } },
  { ns: "marketing.legal.privacy", k: "use.legal",              translations: { en: "Processing subscription payments via Stripe" } },
  { ns: "marketing.legal.privacy", k: "use.security",           translations: { en: "Preventing fraud and unauthorized access" } },
  { ns: "marketing.legal.privacy", k: "sharing.title",          translations: { en: "3. Third-Party Service Providers" } },
  { ns: "marketing.legal.privacy", k: "sharing.desc",           translations: { en: "We share limited data with essential partners: Neon (Database), Stripe (Payments), AWS S3 & CloudFront (Image Hosting), Google Analytics (Analytics), and Google Gemini (AI Translations). These partners are GDPR compliant where applicable." } },
  { ns: "marketing.legal.privacy", k: "transfers.title",        translations: { en: "4. International Data Transfers" } },
  { ns: "marketing.legal.privacy", k: "transfers.desc",         translations: { en: "As we use services like Google (Cloud/Gemini), AWS, and Neon, your data may be processed in the United States and other regions. We ensure Standard Contractual Clauses are in place to protect your information." } },
  { ns: "marketing.legal.privacy", k: "rights.title",           translations: { en: "5. Your Privacy Rights" } },
  { ns: "marketing.legal.privacy", k: "rights.access",          translations: { en: "Right to access and export your data" } },
  { ns: "marketing.legal.privacy", k: "rights.object",          translations: { en: "Right to object to analytical tracking" } },
  { ns: "marketing.legal.privacy", k: "rights.withdraw",        translations: { en: "Right to delete your account and all associated sites" } },
  { ns: "marketing.legal.privacy", k: "rights.contact",         translations: { en: "Contact us to exercise these rights" } },
  { ns: "marketing.legal.privacy", k: "security.title",         translations: { en: "6. Data Security" } },
  { ns: "marketing.legal.privacy", k: "security.desc",          translations: { en: "We use industry-standard encryption (SSL/TLS) and secure database protocols provided by Neon to protect your data at rest and in transit. Images are served via CloudFront with signed URLs where applicable." } },
  { ns: "marketing.legal.privacy", k: "retention.title",        translations: { en: "7. Data Retention" } },
  { ns: "marketing.legal.privacy", k: "retention.desc",         translations: { en: "We retain your data as long as your account is active. Upon cancellation, your data is retained for 30 days before permanent deletion. Inactive free accounts may be archived after 6 months." } },
  { ns: "marketing.legal.privacy", k: "updates.title",          translations: { en: "8. Policy Updates" } },
  { ns: "marketing.legal.privacy", k: "updates.desc",           translations: { en: "We may update this policy to reflect changes in our infrastructure or features. Significant changes will be notified via email." } },
  { ns: "marketing.legal.privacy", k: "contact.title",          translations: { en: "9. Privacy Contact" } },
  { ns: "marketing.legal.privacy", k: "contact.desc1",          translations: { en: "For privacy-related requests (Data Access, Deletion, or GDPR inquiries), contact:" } },

  // ── Marketing: Legal Cookie Policy (English only) ──
  { ns: "marketing.legal.cookie", k: "meta.title",              translations: { en: "Cookie Policy | SoSS Engine" } },
  { ns: "marketing.legal.cookie", k: "meta.description",        translations: { en: "This policy explains how SoSS Engine uses cookies and similar technologies to improve your experience." } },
  { ns: "marketing.legal.cookie", k: "title",                   translations: { en: "Cookie Policy" } },
  { ns: "marketing.legal.cookie", k: "version",                 translations: { en: "Last updated on " } },
  { ns: "marketing.legal.cookie", k: "intro",                   translations: { en: "This policy explains how SoSS Engine uses cookies and similar technologies to improve your experience." } },
  { ns: "marketing.legal.cookie", k: "navigation",              translations: { en: "Navigation" } },
  { ns: "marketing.legal.cookie", k: "what_are_cookies.title",  translations: { en: "1. What Are Cookies?" } },
  { ns: "marketing.legal.cookie", k: "what_are_cookies.desc",   translations: { en: "Cookies are small text files stored on your device. They allow us to recognize your session, secure your payments, and analyze platform performance to improve the service." } },
  { ns: "marketing.legal.cookie", k: "types.title",             translations: { en: "2. Specific Cookies We Use" } },
  { ns: "marketing.legal.cookie", k: "types.essential",         translations: { en: "Essential Cookies" } },
  { ns: "marketing.legal.cookie", k: "types.essential_desc",    translations: { en: "Required for authentication (Neon Auth) and secure payment processing (Stripe). The service cannot function without these." } },
  { ns: "marketing.legal.cookie", k: "types.analytics",         translations: { en: "Analytical Cookies" } },
  { ns: "marketing.legal.cookie", k: "types.analytics_desc",    translations: { en: "Provided by Google Analytics 4 (GA4). These help us understand how you use the builder and which features are most valuable." } },
  { ns: "marketing.legal.cookie", k: "types.preference",        translations: { en: "Preference Cookies" } },
  { ns: "marketing.legal.cookie", k: "types.preference_desc",   translations: { en: "Used to remember your UI settings, such as your preferred language and theme preferences." } },
  { ns: "marketing.legal.cookie", k: "usage.title",             translations: { en: "3. Our Usage Policy" } },
  { ns: "marketing.legal.cookie", k: "usage.current",           translations: { en: "We use cookies to maintain your session via Neon Auth, process payments via Stripe, and understand platform usage via Google Analytics. Analytical cookies are only activated if you provide explicit consent through our cookie banner." } },
  { ns: "marketing.legal.cookie", k: "manage.title",            translations: { en: "4. Managing Your Preferences" } },
  { ns: "marketing.legal.cookie", k: "manage.current",          translations: { en: "You can withdraw your consent for analytical cookies at any time via the settings icon. Essential cookies required for security and account access cannot be disabled through our settings." } },
  { ns: "marketing.legal.cookie", k: "third_party.title",       translations: { en: "5. Third-Party Cookies" } },
  { ns: "marketing.legal.cookie", k: "third_party.current",     translations: { en: "We use Google Analytics (Google LLC) and Stripe (Stripe, Inc.) for analytics and payment security. These third parties may set cookies according to their own privacy policies. We do not use third-party advertising cookies." } },
  { ns: "marketing.legal.cookie", k: "updates.title",           translations: { en: "6. Policy Updates" } },
  { ns: "marketing.legal.cookie", k: "updates.desc",            translations: { en: "As we introduce new features, our use of cookies may evolve. Significant changes will be posted here." } },
  { ns: "marketing.legal.cookie", k: "contact.title",           translations: { en: "7. Cookie Inquiries" } },
  { ns: "marketing.legal.cookie", k: "contact.desc",            translations: { en: "For specific questions regarding our use of cookies, please contact:" } },
];

// ── Generate code ────────────────────────────────────────────────────────────
function escape(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function genEntry(e) {
  const locales = Object.keys(e.translations);
  if (locales.length === 1) {
    return `  {\n    namespace: "${e.ns}",\n    key: "${e.k}",\n    translations: t({ en: "${escape(e.translations.en)}" }),\n  },`;
  }
  const lines = locales.map(l => `      ${l}: "${escape(e.translations[l])}"`);
  return `  {\n    namespace: "${e.ns}",\n    key: "${e.k}",\n    translations: t({\n${lines.join(",\n")},\n    }),\n  },`;
}

// ── Insert into SEEDS array ─────────────────────────────────────────────────
const text = readFileSync(FILE, "utf-8");
const lines = text.split("\n");
// Find SEEDS array start and its closing ];
const seedsLine = lines.findIndex(l => l.trim().startsWith("const SEEDS:"));
const seedsCloseIdx = lines.findIndex((l, i) => i > seedsLine && l.trim() === "];");
if (seedsCloseIdx < 0) throw new Error("Could not find SEEDS ];");

const before = lines.slice(0, seedsCloseIdx).join("\n");
const after = lines.slice(seedsCloseIdx).join("\n");
const inserted = entries.map(genEntry).join("\n\n");

writeFileSync(FILE, before + "\n" + inserted + "\n" + after, "utf-8");

console.log(`✅ Added ${entries.length} legal entries to ${FILE}`);
