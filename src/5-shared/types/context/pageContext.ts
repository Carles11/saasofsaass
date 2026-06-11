import { SupportedLocaleType } from "../languages";

export interface PageContextTypes {
  domain: string;
  tenant: string;
  locale: SupportedLocaleType;
  isSubdomain: boolean;
}