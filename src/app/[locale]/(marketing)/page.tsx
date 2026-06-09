import { MarketingPage } from "@/1-pages/marketing";
import { routing } from "@/5-shared/lib/i18n/routing";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";

const META: Record<string, { title: string; description: string }> = {
  en: {
    title: "SoSS Engine — Multi-Tenant Website Factory",
    description:
      "Create unlimited professional websites for your clients. No coding needed. You manage the structure, your clients edit the content.",
  },
  es: {
    title: "SoSS Engine — Fábrica de Sitios Web Multi-Inquilino",
    description:
      "Crea sitios web profesionales ilimitados para tus clientes. Sin necesidad de programar. Tú gestionas la estructura, tus clientes editan el contenido.",
  },
  ca: {
    title: "SoSS Engine — Fàbrica de Llocs Web Multi-Inquilí",
    description:
      "Crea llocs web professionals il·limitats per als teus clients. Sense necessitat de programar. Tu gestiones l'estructura, els teus clients editen el contingut.",
  },
  fr: {
    title: "SoSS Engine — Usine de Sites Web Multi-Locataire",
    description:
      "Créez des sites web professionnels illimités pour vos clients. Sans codage. Vous gérez la structure, vos clients modifient le contenu.",
  },
  de: {
    title: "SoSS Engine — Multi-Mandanten Website-Fabrik",
    description:
      "Erstellen Sie unbegrenzt professionelle Websites für Ihre Kunden. Ohne Programmierung. Sie verwalten die Struktur, Ihre Kunden bearbeiten den Inhalt.",
  },
  it: {
    title: "SoSS Engine — Fabbrica di Siti Web Multi-Tenant",
    description:
      "Crea siti web professionali illimitati per i tuoi clienti. Senza codice. Tu gestisci la struttura, i tuoi clienti modificano i contenuti.",
  },
  eu: {
    title: "SoSS Engine — Webgune Fabrika Multi-Errentari",
    description:
      "Sortu webgune profesional mugagabeak zure bezeroentzat. Koderik gabe. Zuk egitura kudeatzen duzu, zure bezeroek edukia editatzen dute.",
  },
  ga: {
    title: "SoSS Engine — Fábrica de Sitios Web Multi-Inquilino",
    description:
      "Crea sitios web profesionais ilimitados para os teus clientes. Sen necesidade de programar. Ti xestionas a estrutura, os teus clientes editan o contido.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const meta = META[locale] ?? META.en;
  const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "http://localhost:3000";

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${baseUrl}/${l}`])
      ),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${baseUrl}/${locale}`,
      siteName: "SoSS Engine",
      locale: locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}

export default function Page() {
  return <MarketingPage />;
}
