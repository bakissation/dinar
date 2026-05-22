/** Options for {@link formatDinar} / `Dinar.format`. */
export interface FormatOptions {
  /**
   * Locale flavour. `'fr'` → `fr-DZ`, `'ar'` → `ar-DZ`.
   * Algeria uses Western (Latin) digits in both; only separators and the
   * currency symbol differ. Defaults to `'fr'`.
   */
  locale?: 'fr' | 'ar';
  /** Append the currency symbol (`DA` / `دج`). Defaults to `true`. */
  symbol?: boolean;
}

const SYMBOL: Record<'fr' | 'ar', string> = {
  fr: 'DA',
  ar: 'دج',
};

const NBSP = ' ';

/**
 * Format an integer centime amount as a localized Algerian Dinar string.
 *
 * @example
 * formatDinar(123456)                      // "1 234,56 DA"
 * formatDinar(123456, { symbol: false })   // "1 234,56"
 * formatDinar(123456, { locale: 'ar' })    // "1 234,56 دج"
 */
export function formatDinar(centimes: number, options: FormatOptions = {}): string {
  const { locale = 'fr', symbol = true } = options;
  const tag = locale === 'ar' ? 'ar-DZ' : 'fr-DZ';
  const number = new Intl.NumberFormat(tag, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(centimes / 100);
  return symbol ? `${number}${NBSP}${SYMBOL[locale]}` : number;
}
