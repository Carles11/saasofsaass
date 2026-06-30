import {
  Playfair_Display,
  Cormorant_Garamond,
  Montserrat,
  Cinzel,
  DM_Serif_Display,
  Lora,
  Libre_Baskerville,
  EB_Garamond,
  Fraunces,
  Spectral,
  Bodoni_Moda,
  Plus_Jakarta_Sans,
  Lato,
  Source_Sans_3,
  Work_Sans,
  Nunito_Sans,
  Mulish,
  Karla,
  IBM_Plex_Sans,
  Manrope,
  Rubik,
} from "next/font/google";

// ── Heading fonts ──────────────────────────────────────────────────────────
export const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair-display" });
export const cormorantGaramond = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-cormorant-garamond", weight: ["400", "500", "600", "700"] });
export const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
export const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
export const dmSerifDisplay = DM_Serif_Display({ subsets: ["latin"], variable: "--font-dm-serif-display", weight: ["400"] });
export const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
export const libreBaskerville = Libre_Baskerville({ subsets: ["latin"], variable: "--font-libre-baskerville", weight: ["400", "700"] });
export const ebGaramond = EB_Garamond({ subsets: ["latin"], variable: "--font-eb-garamond" });
export const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
export const spectral = Spectral({ subsets: ["latin"], variable: "--font-spectral", weight: ["400", "500", "600", "700"] });
export const bodoniModa = Bodoni_Moda({ subsets: ["latin"], variable: "--font-bodoni-moda", weight: ["400", "500", "600", "700"] });

// ── Body fonts ─────────────────────────────────────────────────────────────
export const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta-sans" });
export const lato = Lato({ subsets: ["latin"], variable: "--font-lato", weight: ["400", "700"] });
export const sourceSans3 = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans-3" });
export const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans" });
export const nunitoSans = Nunito_Sans({ subsets: ["latin"], variable: "--font-nunito-sans" });
export const mulish = Mulish({ subsets: ["latin"], variable: "--font-mulish" });
export const karla = Karla({ subsets: ["latin"], variable: "--font-karla" });
export const ibmPlexSans = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-ibm-plex-sans", weight: ["400", "500", "600", "700"] });
export const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
export const rubik = Rubik({ subsets: ["latin"], variable: "--font-rubik" });

export const fontVariables = [
  // headings
  playfair.variable,
  cormorantGaramond.variable,
  montserrat.variable,
  cinzel.variable,
  dmSerifDisplay.variable,
  lora.variable,
  libreBaskerville.variable,
  ebGaramond.variable,
  fraunces.variable,
  spectral.variable,
  bodoniModa.variable,
  // body
  plusJakartaSans.variable,
  lato.variable,
  sourceSans3.variable,
  workSans.variable,
  nunitoSans.variable,
  mulish.variable,
  karla.variable,
  ibmPlexSans.variable,
  manrope.variable,
  rubik.variable,
].join(" ");
