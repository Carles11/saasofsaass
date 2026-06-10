import "dotenv/config";
import { db } from "./index";
import { platformTranslations } from "./schema";

type TranslationMap = Record<string, string>;

const LOCALES = ["en", "es", "ca", "eu", "ga", "fr", "it", "de"] as const;

function t(translations: TranslationMap): TranslationMap {
  // Ensure all 8 locales are present; fall back to 'en' for missing
  const result: TranslationMap = {};
  for (const locale of LOCALES) {
    result[locale] = translations[locale] ?? translations.en ?? locale;
  }
  return result;
}

const SEEDS: { namespace: string; key: string; translations: TranslationMap }[] = [

  // ── Common ──────────────────────────────────────────────────────────────
  {
    namespace: "common",
    key: "preview",
    translations: t({
      en: "Preview",
      es: "Vista previa",
      ca: "Vista prèvia",
      fr: "Aperçu",
      de: "Vorschau",
      it: "Anteprima",
      eu: "Aurrebista",
      ga: "Vista previa",
    }),
  },
  {
    namespace: "common",
    key: "save",
    translations: t({
      en: "Save",
      es: "Guardar",
      ca: "Guardar",
      fr: "Enregistrer",
      de: "Speichern",
      it: "Salva",
      eu: "Gorde",
      ga: "Gardar",
    }),
  },
  {
    namespace: "common",
    key: "cancel",
    translations: t({
      en: "Cancel",
      es: "Cancelar",
      ca: "Cancel·lar",
      fr: "Annuler",
      de: "Abbrechen",
      it: "Annulla",
      eu: "Utzi",
      ga: "Cancelar",
    }),
  },
  {
    namespace: "common",
    key: "delete",
    translations: t({
      en: "Delete",
      es: "Eliminar",
      ca: "Eliminar",
      fr: "Supprimer",
      de: "Löschen",
      it: "Elimina",
      eu: "Ezabatu",
      ga: "Eliminar",
    }),
  },
  {
    namespace: "common",
    key: "loading",
    translations: t({
      en: "Loading...",
      es: "Cargando...",
      ca: "Carregant...",
      fr: "Chargement...",
      de: "Laden...",
      it: "Caricamento...",
      eu: "Kargatzen...",
      ga: "Cargando...",
    }),
  },

  // ── Marketing: Header ───────────────────────────────────────────────────
  {
    namespace: "marketing.header",
    key: "nav.features",
    translations: t({
      en: "Features",
      es: "Características",
      ca: "Característiques",
      fr: "Fonctionnalités",
      de: "Funktionen",
      it: "Funzionalità",
      eu: "Ezaugarriak",
      ga: "Características",
    }),
  },
  {
    namespace: "marketing.header",
    key: "nav.pricing",
    translations: t({
      en: "Pricing",
      es: "Precios",
      ca: "Preus",
      fr: "Tarifs",
      de: "Preise",
      it: "Prezzi",
      eu: "Prezioak",
      ga: "Prezos",
    }),
  },
  {
    namespace: "marketing.header",
    key: "nav.testimonials",
    translations: t({
      en: "Testimonials",
      es: "Testimonios",
      ca: "Testimonis",
      fr: "Témoignages",
      de: "Erfahrungsberichte",
      it: "Testimonianze",
      eu: "Testigantzak",
      ga: "Testemuños",
    }),
  },
  {
    namespace: "marketing.header",
    key: "nav.faq",
    translations: t({
      en: "FAQ",
      es: "Preguntas frecuentes",
      ca: "Preguntes freqüents",
      fr: "FAQ",
      de: "FAQ",
      it: "FAQ",
      eu: "OHO",
      ga: "Preguntas frecuentes",
    }),
  },
  {
    namespace: "marketing.header",
    key: "sign-in",
    translations: t({
      en: "Sign In",
      es: "Iniciar sesión",
      ca: "Iniciar sessió",
      fr: "Connexion",
      de: "Anmelden",
      it: "Accedi",
      eu: "Hasi saioa",
      ga: "Iniciar sesión",
    }),
  },
  {
    namespace: "marketing.header",
    key: "get-started",
    translations: t({
      en: "Get Started",
      es: "Comenzar",
      ca: "Començar",
      fr: "Commencer",
      de: "Loslegen",
      it: "Inizia",
      eu: "Hasi",
      ga: "Comezar",
    }),
  },

  // ── Marketing: Hero ─────────────────────────────────────────────────────
  {
    namespace: "marketing.hero",
    key: "badge",
    translations: t({
      en: "Now in public beta",
      es: "Ahora en beta pública",
      ca: "Ara en beta pública",
      fr: "Maintenant en bêta publique",
      de: "Jetzt in der öffentlichen Beta",
      it: "Ora in beta pubblica",
      eu: "Orain beta publikoan",
      ga: "Agora en beta pública",
    }),
  },
  {
    namespace: "marketing.hero",
    key: "title.line1",
    translations: t({
      en: "Create Professional",
      es: "Crea sitios web",
      ca: "Crea llocs web",
      fr: "Créez des sites web",
      de: "Erstelle professionelle",
      it: "Crea siti web",
      eu: "Sortu webgune",
      ga: "Crea sitios web",
    }),
  },
  {
    namespace: "marketing.hero",
    key: "title.line2",
    translations: t({
      en: "Websites",
      es: "profesionales",
      ca: "professionals",
      fr: "professionnels",
      de: "Websites",
      it: "professionali",
      eu: "profesionalak",
      ga: "profesionais",
    }),
  },
  {
    namespace: "marketing.hero",
    key: "title.accent",
    translations: t({
      en: "For Anyone.",
      es: "Para Cualquiera.",
      ca: "Per a Qualsevol.",
      fr: "Pour Tous.",
      de: "Für Jeden.",
      it: "Per Chiunque.",
      eu: "Edozeinentzat.",
      ga: "Para Calquera.",
    }),
  },
  {
    namespace: "marketing.hero",
    key: "subtitle",
    translations: t({
      en: "You manage the structure, your clients edit the content. Launch unlimited multi-tenant sites — no coding required.",
      es: "Tú gestionas la estructura, tus clientes editan el contenido. Lanza sitios multi-inquilino ilimitados — sin necesidad de programar.",
      ca: "Tu gestiones l'estructura, els teus clients editen el contingut. Llança llocs multi-inquilí il·limitats — sense necessitat de programar.",
      fr: "Vous gérez la structure, vos clients modifient le contenu. Lancez des sites multi-locataires illimités — sans codage.",
      de: "Du verwaltest die Struktur, deine Kunden bearbeiten den Inhalt. Starte unbegrenzt Multi-Mandanten-Websites — ohne Programmierkenntnisse.",
      it: "Tu gestisci la struttura, i tuoi clienti modificano i contenuti. Lancia siti multi-tenant illimitati — senza scrivere codice.",
      eu: "Zuk egitura kudeatzen duzu, zure bezeroek edukia editatzen dute. Abiarazi webgune multi-errentari mugagabeak — koderik gabe.",
      ga: "Ti xestionas a estrutura, os teus clientes editan o contido. Lanza sitios multi-inquilino ilimitados — sen necesidade de programar.",
    }),
  },
  {
    namespace: "marketing.hero",
    key: "cta.start-building",
    translations: t({
      en: "Start Building",
      es: "Empezar a construir",
      ca: "Començar a construir",
      fr: "Commencer à créer",
      de: "Jetzt starten",
      it: "Inizia a costruire",
      eu: "Hasi eraikitzen",
      ga: "Comezar a construír",
    }),
  },
  {
    namespace: "marketing.hero",
    key: "cta.see-how",
    translations: t({
      en: "See How It Works",
      es: "Ver cómo funciona",
      ca: "Veure com funciona",
      fr: "Voir comment ça marche",
      de: "So funktioniert's",
      it: "Vedi come funziona",
      eu: "Ikusi nola funtzionatzen duen",
      ga: "Ver como funciona",
    }),
  },
  {
    namespace: "marketing.hero",
    key: "stat.sites",
    translations: t({
      en: "Sites Built",
      es: "Sitios creados",
      ca: "Llocs creats",
      fr: "Sites créés",
      de: "Websites erstellt",
      it: "Siti creati",
      eu: "Webgune sortuak",
      ga: "Sitios creados",
    }),
  },
  {
    namespace: "marketing.hero",
    key: "stat.languages",
    translations: t({
      en: "Languages",
      es: "Idiomas",
      ca: "Idiomes",
      fr: "Langues",
      de: "Sprachen",
      it: "Lingue",
      eu: "Hizkuntzak",
      ga: "Idiomas",
    }),
  },
  {
    namespace: "marketing.hero",
    key: "stat.uptime",
    translations: t({
      en: "Uptime",
      es: "Tiempo activo",
      ca: "Temps actiu",
      fr: "Disponibilité",
      de: "Verfügbarkeit",
      it: "Uptime",
      eu: "Eguneratzea",
      ga: "Tempo activo",
    }),
  },
  {
    namespace: "marketing.hero",
    key: "stat.code",
    translations: t({
      en: "Code Required",
      es: "Código necesario",
      ca: "Codi necessari",
      fr: "Code requis",
      de: "Code erforderlich",
      it: "Codice richiesto",
      eu: "Kodea behar da",
      ga: "Código necesario",
    }),
  },

  // ── Marketing: Features ────────────────────────────────────────────────
  {
    namespace: "marketing.features",
    key: "badge",
    translations: t({
      en: "Features",
      es: "Características",
      ca: "Característiques",
      fr: "Fonctionnalités",
      de: "Funktionen",
      it: "Funzionalità",
      eu: "Ezaugarriak",
      ga: "Características",
    }),
  },
  {
    namespace: "marketing.features",
    key: "title",
    translations: t({
      en: "Everything You Need",
      es: "Todo lo que necesitas",
      ca: "Tot el que necessites",
      fr: "Tout ce dont vous avez besoin",
      de: "Alles, was du brauchst",
      it: "Tutto ciò di cui hai bisogno",
      eu: "Behar duzun guztia",
      ga: "Todo o que necesitas",
    }),
  },
  {
    namespace: "marketing.features",
    key: "subtitle",
    translations: t({
      en: "From multi-tenant isolation to AI-powered translations — built for agencies and freelancers.",
      es: "Desde aislamiento multi-inquilino hasta traducciones con IA — construido para agencias y freelancers.",
      ca: "Des d'aïllament multi-inquilí fins a traduccions amb IA — construït per a agències i freelancers.",
      fr: "De l'isolement multi-locataire aux traductions par IA — conçu pour les agences et les freelances.",
      de: "Von Multi-Mandanten-Isolation bis zu KI-Übersetzungen — entwickelt für Agenturen und Freelancer.",
      it: "Dall'isolamento multi-tenant alle traduzioni con IA — pensato per agenzie e freelance.",
      eu: "Multi-errentari isolamendutik AI bidezko itzulpenetara — agentzietarako eta autonomoentzat eraikia.",
      ga: "Desde illamento multi-inquilino ata traducións con IA — construído para axencias e freelancers.",
    }),
  },
  {
    namespace: "marketing.features",
    key: "multi-tenant.title",
    translations: t({ en: "Multi-Tenant" }),
  },
  {
    namespace: "marketing.features",
    key: "multi-tenant.description",
    translations: t({
      en: "Spin up a new site for every client. Fully isolated with its own branding, content, and languages.",
    }),
  },
  {
    namespace: "marketing.features",
    key: "role-based.title",
    translations: t({ en: "Role-Based Access" }),
  },
  {
    namespace: "marketing.features",
    key: "role-based.description",
    translations: t({
      en: "You control the structure. Invite editors to manage content without touching layout or settings.",
    }),
  },
  {
    namespace: "marketing.features",
    key: "ai-translations.title",
    translations: t({ en: "AI Translations" }),
  },
  {
    namespace: "marketing.features",
    key: "ai-translations.description",
    translations: t({
      en: "One click translates your entire site. Enable any language and let Gemini handle the rest.",
    }),
  },
  {
    namespace: "marketing.features",
    key: "templates.title",
    translations: t({ en: "Template Presets" }),
  },
  {
    namespace: "marketing.features",
    key: "templates.description",
    translations: t({
      en: "Choose from a growing library of appearance presets — modern, classic, and more.",
    }),
  },
  {
    namespace: "marketing.features",
    key: "domains.title",
    translations: t({ en: "Custom Domains" }),
  },
  {
    namespace: "marketing.features",
    key: "domains.description",
    translations: t({
      en: "Every tenant gets a subdomain or a custom domain of their own. Full DNS support included.",
    }),
  },
  {
    namespace: "marketing.features",
    key: "no-code.title",
    translations: t({ en: "No Code" }),
  },
  {
    namespace: "marketing.features",
    key: "no-code.description",
    translations: t({
      en: "Your clients edit content through a clean dashboard. No coding, no confusion, no support tickets.",
    }),
  },

  // ── Marketing: Pricing ──────────────────────────────────────────────────
  {
    namespace: "marketing.pricing",
    key: "badge",
    translations: t({
      en: "Pricing",
      es: "Precios",
      ca: "Preus",
      fr: "Tarifs",
      de: "Preise",
      it: "Prezzi",
      eu: "Prezioak",
      ga: "Prezos",
    }),
  },
  {
    namespace: "marketing.pricing",
    key: "title",
    translations: t({
      en: "Simple, Transparent",
      es: "Simple, Transparente",
      ca: "Simple, Transparent",
      fr: "Simple, Transparent",
      de: "Einfach, Transparent",
      it: "Semplice, Trasparente",
      eu: "Sinplea, Gardena",
      ga: "Simple, Transparente",
    }),
  },
  {
    namespace: "marketing.pricing",
    key: "subtitle",
    translations: t({
      en: "Start free. Scale as you grow. No hidden fees.",
      es: "Empieza gratis. Escala a medida que creces. Sin tarifas ocultas.",
      ca: "Comença gratis. Escala a mesura que creixes. Sense tarifes ocultes.",
      fr: "Commencez gratuitement. Évoluez au fur et à mesure. Sans frais cachés.",
      de: "Starte kostenlos. Skaliere mit deinem Wachstum. Keine versteckten Gebühren.",
      it: "Inizia gratis. Scala man mano che cresci. Nessun costo nascosto.",
      eu: "Hasi doan. Eskalatu hazten zaren heinean. Ezkutuko kuotarik gabe.",
      ga: "Comeza gratis. Escala a medida que medras. Sen tarifas ocultas.",
    }),
  },
  {
    namespace: "marketing.pricing",
    key: "tier.starter.name",
    translations: t({ en: "Starter" }),
  },
  {
    namespace: "marketing.pricing",
    key: "tier.starter.description",
    translations: t({ en: "Perfect for testing the waters." }),
  },
  {
    namespace: "marketing.pricing",
    key: "tier.starter.feature.0",
    translations: t({ en: "Up to 3 tenant sites" }),
  },
  {
    namespace: "marketing.pricing",
    key: "tier.starter.feature.1",
    translations: t({ en: "All block types" }),
  },
  {
    namespace: "marketing.pricing",
    key: "tier.starter.feature.2",
    translations: t({ en: "AI translations" }),
  },
  {
    namespace: "marketing.pricing",
    key: "tier.starter.feature.3",
    translations: t({ en: "Basic support" }),
  },
  {
    namespace: "marketing.pricing",
    key: "tier.professional.name",
    translations: t({ en: "Professional" }),
  },
  {
    namespace: "marketing.pricing",
    key: "tier.professional.description",
    translations: t({ en: "For growing agencies." }),
  },
  {
    namespace: "marketing.pricing",
    key: "tier.professional.feature.0",
    translations: t({ en: "Up to 15 tenant sites" }),
  },
  {
    namespace: "marketing.pricing",
    key: "tier.professional.feature.1",
    translations: t({ en: "Custom domains" }),
  },
  {
    namespace: "marketing.pricing",
    key: "tier.professional.feature.2",
    translations: t({ en: "Priority support" }),
  },
  {
    namespace: "marketing.pricing",
    key: "tier.professional.feature.3",
    translations: t({ en: "Team members" }),
  },
  {
    namespace: "marketing.pricing",
    key: "tier.enterprise.name",
    translations: t({ en: "Enterprise" }),
  },
  {
    namespace: "marketing.pricing",
    key: "tier.enterprise.description",
    translations: t({ en: "For large-scale operations." }),
  },
  {
    namespace: "marketing.pricing",
    key: "tier.enterprise.feature.0",
    translations: t({ en: "Unlimited tenant sites" }),
  },
  {
    namespace: "marketing.pricing",
    key: "tier.enterprise.feature.1",
    translations: t({ en: "White-label" }),
  },
  {
    namespace: "marketing.pricing",
    key: "tier.enterprise.feature.2",
    translations: t({ en: "Dedicated support" }),
  },
  {
    namespace: "marketing.pricing",
    key: "tier.enterprise.feature.3",
    translations: t({ en: "Early access" }),
  },
  {
    namespace: "marketing.pricing",
    key: "popular-badge",
    translations: t({
      en: "Most Popular",
      es: "Más popular",
      ca: "Més popular",
      fr: "Le plus populaire",
      de: "Am beliebtesten",
      it: "Più popolare",
      eu: "Ohikoena",
      ga: "Máis popular",
    }),
  },
  {
    namespace: "marketing.pricing",
    key: "month",
    translations: t({ en: "/month" }),
  },
  {
    namespace: "marketing.pricing",
    key: "cta",
    translations: t({ en: "Choose {name}" }),
  },

  // ── Marketing: Testimonials ──────────────────────────────────────────────
  {
    namespace: "marketing.testimonials",
    key: "badge",
    translations: t({
      en: "Testimonials",
      es: "Testimonios",
      ca: "Testimonis",
      fr: "Témoignages",
      de: "Erfahrungsberichte",
      it: "Testimonianze",
      eu: "Testigantzak",
      ga: "Testemuños",
    }),
  },
  {
    namespace: "marketing.testimonials",
    key: "title",
    translations: t({
      en: "Loved by Builders",
      es: "Amado por los creadores",
      ca: "Estimat pels creadors",
      fr: "Adoré par les créateurs",
      de: "Geliebt von Entwicklern",
      it: "Amato dai creatori",
      eu: "Sortzaileek maitea",
      ga: "Amado polos creadores",
    }),
  },

  // ── Marketing: FAQ ──────────────────────────────────────────────────────
  {
    namespace: "marketing.faq",
    key: "badge",
    translations: t({
      en: "FAQ",
      es: "Preguntas frecuentes",
      ca: "Preguntes freqüents",
      fr: "FAQ",
      de: "FAQ",
      it: "FAQ",
      eu: "OHO",
      ga: "Preguntas frecuentes",
    }),
  },
  {
    namespace: "marketing.faq",
    key: "title",
    translations: t({
      en: "Frequently Asked",
      es: "Preguntas frecuentes",
      ca: "Preguntes freqüents",
      fr: "Questions fréquentes",
      de: "Häufig gefragt",
      it: "Domande frequenti",
      eu: "Maiz egindako galderak",
      ga: "Preguntas frecuentes",
    }),
  },
  {
    namespace: "marketing.faq",
    key: "q1.question",
    translations: t({ en: "What is a multi-tenant website factory?" }),
  },
  {
    namespace: "marketing.faq",
    key: "q1.answer",
    translations: t({
      en: "It means you run one platform that serves many clients. Each client gets their own branded, multilingual site — but you manage everything from a single dashboard.",
    }),
  },
  {
    namespace: "marketing.faq",
    key: "q2.question",
    translations: t({ en: "Do my clients need to code?" }),
  },
  {
    namespace: "marketing.faq",
    key: "q2.answer",
    translations: t({
      en: "No. Your clients edit content through a simple interface. They never touch code, layout, or settings.",
    }),
  },
  {
    namespace: "marketing.faq",
    key: "q3.question",
    translations: t({ en: "How do AI translations work?" }),
  },
  {
    namespace: "marketing.faq",
    key: "q3.answer",
    translations: t({
      en: "Enable a language for any tenant. Gemini 2.5 translates every block and piece of content automatically. You can review and edit before publishing.",
    }),
  },
  {
    namespace: "marketing.faq",
    key: "q4.question",
    translations: t({ en: "Can I use my own domain?" }),
  },
  {
    namespace: "marketing.faq",
    key: "q4.answer",
    translations: t({
      en: "Yes. Every tenant can have a custom domain or a subdomain. DNS setup is handled through your dashboard.",
    }),
  },
  {
    namespace: "marketing.faq",
    key: "q5.question",
    translations: t({ en: "Is there a free trial?" }),
  },
  {
    namespace: "marketing.faq",
    key: "q5.answer",
    translations: t({
      en: "Yes. Start with the Starter plan and build up to 3 sites at no cost during the trial period.",
    }),
  },

  // ── Marketing: CTA ──────────────────────────────────────────────────────
  {
    namespace: "marketing.cta",
    key: "title",
    translations: t({
      en: "Ready to Build?",
      es: "¿Listo para construir?",
      ca: "Llest per construir?",
      fr: "Prêt à créer ?",
      de: "Bereit zu starten?",
      it: "Pronto a costruire?",
      eu: "Eraikitzeko prest?",
      ga: "Listo para construír?",
    }),
  },
  {
    namespace: "marketing.cta",
    key: "subtitle",
    translations: t({
      en: "Start your first tenant site in minutes. No credit card required.",
      es: "Crea tu primer sitio multi-inquilino en minutos. Sin necesidad de tarjeta de crédito.",
      ca: "Crea el teu primer lloc multi-inquilí en minuts. Sense necessitat de targeta de crèdit.",
      fr: "Créez votre premier site multi-locataire en minutes. Aucune carte de crédit requise.",
      de: "Erstelle deine erste Multi-Mandanten-Website in Minuten. Keine Kreditkarte erforderlich.",
      it: "Crea il tuo primo sito multi-tenant in pochi minuti. Nessuna carta di credito richiesta.",
      eu: "Sortu zure lehen multi-errentari webgunea minutuetan. Kreditu-txartelik behar ez.",
      ga: "Crea o teu primeiro sitio multi-inquilino en minutos. Sen necesidade de tarxeta de crédito.",
    }),
  },
  {
    namespace: "marketing.cta",
    key: "cta.get-started",
    translations: t({
      en: "Get Started Free",
      es: "Empieza gratis",
      ca: "Comença gratis",
      fr: "Commencez gratuitement",
      de: "Kostenlos starten",
      it: "Inizia gratis",
      eu: "Hasi doan",
      ga: "Comeza gratis",
    }),
  },
  {
    namespace: "marketing.cta",
    key: "cta.talk-sales",
    translations: t({
      en: "Talk to Sales",
      es: "Hablar con ventas",
      ca: "Parlar amb vendes",
      fr: "Parler aux ventes",
      de: "Vertrieb kontaktieren",
      it: "Parla con le vendite",
      eu: "Salmentekin hitz egin",
      ga: "Falar con vendas",
    }),
  },

  // ── Marketing: Footer ───────────────────────────────────────────────────
  {
    namespace: "marketing.footer",
    key: "copyright",
    translations: t({ en: "© {year} SoSS Engine. All rights reserved." }),
  },

  // ── Dashboard: Main page ────────────────────────────────────────────────
  {
    namespace: "dashboard.page",
    key: "title",
    translations: t({ en: "Workshop" }),
  },
  {
    namespace: "dashboard.page",
    key: "tenant-count",
    translations: t({ en: "{count} tenant(s)" }),
  },
  {
    namespace: "dashboard.page",
    key: "languages-count",
    translations: t({ en: "languages" }),
  },
  {
    namespace: "dashboard.page",
    key: "role.owner",
    translations: t({ en: "owner" }),
  },
  {
    namespace: "dashboard.page",
    key: "role.editor",
    translations: t({ en: "editor" }),
  },
  {
    namespace: "dashboard.page",
    key: "empty.title",
    translations: t({ en: "No Tenants Found" }),
  },
  {
    namespace: "dashboard.page",
    key: "empty.subtitle",
    translations: t({ en: "Your workshop is initialized. Awaiting the first deployment." }),
  },

  // ── Dashboard: Team ─────────────────────────────────────────────────────
  {
    namespace: "dashboard.team",
    key: "title",
    translations: t({ en: "Team Management" }),
  },
  {
    namespace: "dashboard.team",
    key: "sign-in-required",
    translations: t({ en: "Please sign in." }),
  },
  {
    namespace: "dashboard.team",
    key: "no-tenant-access",
    translations: t({ en: "You don't have access to any tenants yet." }),
  },
  {
    namespace: "dashboard.team",
    key: "owners-only",
    translations: t({ en: "Only tenant owners can manage team members." }),
  },

  // ── Dashboard: Site Builder ─────────────────────────────────────────────
  {
    namespace: "dashboard.site-builder",
    key: "subtitle",
    translations: t({ en: "Site Builder" }),
  },
  {
    namespace: "dashboard.site-builder",
    key: "tab.blocks",
    translations: t({ en: "Blocks" }),
  },
  {
    namespace: "dashboard.site-builder",
    key: "tab.content",
    translations: t({ en: "Content" }),
  },
  {
    namespace: "dashboard.site-builder",
    key: "tab.settings",
    translations: t({ en: "Settings" }),
  },
  {
    namespace: "dashboard.site-builder",
    key: "block-not-found",
    translations: t({ en: "Block not found." }),
  },
  {
    namespace: "dashboard.site-builder",
    key: "no-content-to-manage",
    translations: t({ en: "This block has no content to manage." }),
  },
  {
    namespace: "dashboard.site-builder",
    key: "select-block",
    translations: t({ en: "Select a block to manage its content." }),
  },
  {
    namespace: "dashboard.site-builder",
    key: "settings.languages",
    translations: t({ en: "Enabled Languages" }),
  },
  {
    namespace: "dashboard.site-builder",
    key: "settings.languages-hint",
    translations: t({ en: "Click to enable/disable languages for your public site." }),
  },
  {
    namespace: "dashboard.site-builder",
    key: "settings.saving",
    translations: t({ en: "Saving..." }),
  },
  {
    namespace: "dashboard.site-builder",
    key: "settings.template",
    translations: t({ en: "Site Template" }),
  },

  // ── Dashboard: Block List ───────────────────────────────────────────────
  {
    namespace: "dashboard.blocks",
    key: "empty",
    translations: t({ en: "No blocks yet. Add your first block below." }),
  },
  {
    namespace: "dashboard.blocks",
    key: "add",
    translations: t({ en: "+ Add Block" }),
  },
  {
    namespace: "dashboard.blocks",
    key: "add-dialog.title",
    translations: t({ en: "Add a New Block" }),
  },
  {
    namespace: "dashboard.blocks",
    key: "add-dialog.select-placeholder",
    translations: t({ en: "Select block type" }),
  },
  {
    namespace: "dashboard.blocks",
    key: "add-dialog.confirm",
    translations: t({ en: "Add \"{name}\"" }),
  },

  // ── Dashboard: Block Actions ────────────────────────────────────────────
  {
    namespace: "dashboard.blocks",
    key: "action.manage-content",
    translations: t({ en: "Manage Content" }),
  },
  {
    namespace: "dashboard.blocks",
    key: "action.edit",
    translations: t({ en: "Edit" }),
  },
  {
    namespace: "dashboard.blocks",
    key: "action.delete",
    translations: t({ en: "Delete" }),
  },
  {
    namespace: "dashboard.blocks",
    key: "delete-confirm.title",
    translations: t({ en: "Delete \"{name}\" block?" }),
  },
  {
    namespace: "dashboard.blocks",
    key: "delete-confirm.warning",
    translations: t({ en: "This action cannot be undone." }),
  },
  {
    namespace: "dashboard.blocks",
    key: "delete-confirm.confirm",
    translations: t({ en: "Confirm Delete" }),
  },
  {
    namespace: "dashboard.blocks",
    key: "status.hidden",
    translations: t({ en: "hidden" }),
  },

  // ── Dashboard: Collection Manager ───────────────────────────────────────
  {
    namespace: "dashboard.collection",
    key: "new-item",
    translations: t({ en: "New Item" }),
  },
  {
    namespace: "dashboard.collection",
    key: "label.kind",
    translations: t({ en: "Kind" }),
  },
  {
    namespace: "dashboard.collection",
    key: "label.slug",
    translations: t({ en: "Slug" }),
  },
  {
    namespace: "dashboard.collection",
    key: "placeholder.slug",
    translations: t({ en: "my-first-post" }),
  },
  {
    namespace: "dashboard.collection",
    key: "create",
    translations: t({ en: "Create" }),
  },
  {
    namespace: "dashboard.collection",
    key: "empty",
    translations: t({ en: "No content yet. Create your first item above." }),
  },
  {
    namespace: "dashboard.collection",
    key: "no-translation",
    translations: t({ en: "no translation for {locale}" }),
  },
  {
    namespace: "dashboard.collection",
    key: "edit-translation",
    translations: t({ en: "Edit Translation — {locale}" }),
  },
  {
    namespace: "dashboard.collection",
    key: "label.title",
    translations: t({ en: "Title" }),
  },
  {
    namespace: "dashboard.collection",
    key: "label.excerpt",
    translations: t({ en: "Excerpt" }),
  },
  {
    namespace: "dashboard.collection",
    key: "label.description",
    translations: t({ en: "Description" }),
  },
  {
    namespace: "dashboard.collection",
    key: "label.localized-slug",
    translations: t({ en: "Localized Slug" }),
  },
  {
    namespace: "dashboard.collection",
    key: "save-translation",
    translations: t({ en: "Save Translation" }),
  },
  {
    namespace: "dashboard.collection",
    key: "status.pending",
    translations: t({ en: "pending" }),
  },
  {
    namespace: "dashboard.collection",
    key: "status.translated",
    translations: t({ en: "translated" }),
  },
  {
    namespace: "dashboard.collection",
    key: "status.failed",
    translations: t({ en: "failed" }),
  },
  {
    namespace: "dashboard.collection",
    key: "status.locked",
    translations: t({ en: "locked" }),
  },

  // ── Dashboard: Block Edit Sheet ─────────────────────────────────────────
  {
    namespace: "dashboard.block-edit",
    key: "title",
    translations: t({ en: "Edit \"{name}\" — {locale}" }),
  },
  {
    namespace: "dashboard.block-edit",
    key: "section.translations",
    translations: t({ en: "Translations" }),
  },
  {
    namespace: "dashboard.block-edit",
    key: "section.settings",
    translations: t({ en: "Settings" }),
  },
  {
    namespace: "dashboard.block-edit",
    key: "save-translations",
    translations: t({ en: "Save Translations" }),
  },
  {
    namespace: "dashboard.block-edit",
    key: "save-settings",
    translations: t({ en: "Save Settings" }),
  },
  {
    namespace: "dashboard.block-edit",
    key: "remove-image",
    translations: t({ en: "Remove image" }),
  },
  {
    namespace: "dashboard.block-edit",
    key: "no-fields",
    translations: t({ en: "This block has no editable fields. Manage its content in the Content tab." }),
  },

  // ── Dashboard: Team Manager ─────────────────────────────────────────────
  {
    namespace: "dashboard.team-manager",
    key: "title",
    translations: t({ en: "Team — {name}" }),
  },
  {
    namespace: "dashboard.team-manager",
    key: "empty",
    translations: t({ en: "No team members yet." }),
  },
  {
    namespace: "dashboard.team-manager",
    key: "label.email",
    translations: t({ en: "Email" }),
  },
  {
    namespace: "dashboard.team-manager",
    key: "label.role",
    translations: t({ en: "Role" }),
  },
  {
    namespace: "dashboard.team-manager",
    key: "placeholder.email",
    translations: t({ en: "colleague@example.com" }),
  },
  {
    namespace: "dashboard.team-manager",
    key: "invite",
    translations: t({ en: "Invite" }),
  },
  {
    namespace: "dashboard.team-manager",
    key: "remove",
    translations: t({ en: "Remove" }),
  },
  {
    namespace: "dashboard.team-manager",
    key: "role.editor",
    translations: t({ en: "Editor" }),
  },
  {
    namespace: "dashboard.team-manager",
    key: "role.owner",
    translations: t({ en: "Owner" }),
  },

  // ── Dashboard: Create Tenant Dialog ─────────────────────────────────────
  {
    namespace: "dashboard.create-tenant",
    key: "trigger",
    translations: t({ en: "+ Create Site" }),
  },
  {
    namespace: "dashboard.create-tenant",
    key: "dialog.title",
    translations: t({ en: "Create a New Site" }),
  },
  {
    namespace: "dashboard.create-tenant",
    key: "label.name",
    translations: t({ en: "Site Name" }),
  },
  {
    namespace: "dashboard.create-tenant",
    key: "placeholder.name",
    translations: t({ en: "e.g. Àgora Association" }),
  },
  {
    namespace: "dashboard.create-tenant",
    key: "label.slug",
    translations: t({ en: "Subdomain" }),
  },
  {
    namespace: "dashboard.create-tenant",
    key: "placeholder.slug",
    translations: t({ en: "agora" }),
  },
  {
    namespace: "dashboard.create-tenant",
    key: "slug-hint",
    translations: t({ en: "Lowercase letters, numbers, and hyphens only (3-63 chars)." }),
  },
  {
    namespace: "dashboard.create-tenant",
    key: "creating",
    translations: t({ en: "Creating..." }),
  },
  {
    namespace: "dashboard.create-tenant",
    key: "submit",
    translations: t({ en: "Create Site" }),
  },
];

export async function seedPlatformTranslations() {
  const values: (typeof platformTranslations.$inferInsert)[] = [];
  for (const seed of SEEDS) {
    for (const [locale, value] of Object.entries(seed.translations)) {
      values.push({
        namespace: seed.namespace,
        key: seed.key,
        locale,
        value,
      });
    }
  }

  // Batch insert all at once
  await db
    .insert(platformTranslations)
    .values(values)
    .onConflictDoNothing();

  console.log(`✓ Seeded ${SEEDS.length} keys / ${values.length} locale entries`);
}

// Allow running directly: npx tsx src/5-shared/lib/db/seed-platform-translations.ts
seedPlatformTranslations().catch(console.error);
