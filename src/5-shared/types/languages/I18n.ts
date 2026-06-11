export interface I18nSlice {
  locale: string;
  dictionary: Record<string, string>;
  isRTL: boolean;
  setI18n: (locale: string, dictionary: Record<string, string>, isRTL?: boolean) => void;
}
