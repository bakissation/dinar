import { MoneyError } from './errors.js';

// Eastern Arabic (٠-٩) and Persian (۰-۹) digit ranges, normalized to ASCII.
function normalizeDigits(input: string): string {
  return input
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/**
 * Parse a human-written Dinar amount into an integer count of centimes,
 * without ever going through floating-point multiplication.
 *
 * Rules (documented contract):
 * - Whitespace (incl. NBSP / narrow / thin spaces) is always a thousands separator.
 * - `.` and `,` are accepted; the **last** one in the string is the decimal point,
 *   any earlier ones are thousands separators.
 * - Currency tokens (`DA`, `DZD`, `دج`, `دينار`) and Arabic separators (٫ ٬) are tolerated.
 * - More than two decimal places are rounded half-up to the centime.
 *
 * @example
 * parseDinar('806,5')      // 80650
 * parseDinar('1 234,56')   // 123456
 * parseDinar('1,234.56')   // 123456
 * parseDinar('5000 DA')    // 500000
 */
export function parseDinar(input: string): number {
  if (typeof input !== 'string') {
    throw new MoneyError('Amount to parse must be a string', 'PARSE_ERROR');
  }

  let s = normalizeDigits(input.trim());
  if (s === '') {
    throw new MoneyError('Amount cannot be empty', 'PARSE_ERROR');
  }

  // Strip currency tokens and normalize Arabic separators (٫ decimal, ٬ thousands).
  s = s
    .replace(/dzd|dinars?|دينار|دج|da/gi, '')
    .replace(/٫/g, ',')
    .replace(/٬/g, ' ')
    // Drop every flavour of space (JS \s covers NBSP / narrow / thin); all are thousands separators.
    .replace(/\s/g, '');

  let sign = 1;
  if (s.startsWith('-')) {
    sign = -1;
    s = s.slice(1);
  } else if (s.startsWith('+')) {
    s = s.slice(1);
  }

  // The last '.' or ',' is the decimal point; everything before it is integer.
  const lastSep = Math.max(s.lastIndexOf('.'), s.lastIndexOf(','));
  let intDigits: string;
  let decDigits: string;
  if (lastSep === -1) {
    intDigits = s;
    decDigits = '';
  } else {
    intDigits = s.slice(0, lastSep).replace(/[.,]/g, '') || '0';
    decDigits = s.slice(lastSep + 1);
  }

  if (!/^\d+$/.test(intDigits) || (decDigits !== '' && !/^\d+$/.test(decDigits))) {
    throw new MoneyError(`Cannot parse "${input}" as a Dinar amount`, 'PARSE_ERROR');
  }

  let centimes: number;
  if (decDigits.length <= 2) {
    centimes = Number(intDigits) * 100 + Number(decDigits.padEnd(2, '0') || '0');
  } else {
    // Round half-up using the third decimal digit.
    let base = Number(intDigits) * 100 + Number(decDigits.slice(0, 2));
    if (decDigits.charCodeAt(2) - 48 >= 5) base += 1;
    centimes = base;
  }

  if (!Number.isSafeInteger(centimes)) {
    throw new MoneyError(`Amount "${input}" is too large to represent safely`, 'OVERFLOW');
  }

  return sign * centimes;
}
