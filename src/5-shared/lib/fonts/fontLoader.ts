import {
  Playfair_Display,
  Cormorant_Garamond,
  Montserrat,
  Cinzel,
  DM_Serif_Display,
  Plus_Jakarta_Sans,
  Lato,
  Source_Sans_3,
} from "next/font/google";

export const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
});

export const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant-garamond",
  weight: ["400", "500", "600", "700"],
});

export const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
});

export const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-dm-serif-display",
  weight: ["400"],
});

export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

export const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  weight: ["400", "700"],
});

export const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans-3",
});

export const fontVariables = [
  playfair.variable,
  cormorantGaramond.variable,
  montserrat.variable,
  cinzel.variable,
  dmSerifDisplay.variable,
  plusJakartaSans.variable,
  lato.variable,
  sourceSans3.variable,
].join(" ");
