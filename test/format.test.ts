import { describe, it, expect } from 'vitest';
import { Dinar, formatDinar } from '../src/index.js';

// Separators come from the platform's Intl/ICU data, so assertions check
// structure (digits, decimals, symbol) rather than exact separator glyphs.

describe('formatDinar', () => {
  it('renders two decimals and the DA symbol by default', () => {
    const s = formatDinar(123456);
    expect(s).toMatch(/234/);
    expect(s).toMatch(/56/);
    expect(s).toContain('DA');
  });

  it('can omit the symbol', () => {
    const s = formatDinar(123456, { symbol: false });
    expect(s).not.toContain('DA');
    expect(s).toMatch(/56/);
  });

  it('uses the Arabic symbol for the ar locale', () => {
    const s = formatDinar(123456, { locale: 'ar' });
    expect(s).toContain('دج');
  });

  it('always shows two fraction digits', () => {
    expect(formatDinar(500000, { symbol: false })).toMatch(/00$/);
    expect(formatDinar(50, { symbol: false })).toMatch(/50$/);
  });

  it('keeps the sign on negative amounts', () => {
    expect(formatDinar(-5000)).toMatch(/-|−/);
  });
});

describe('Dinar.format / toString', () => {
  it('formats via the instance', () => {
    expect(Dinar.fromDinars(1234.56).format()).toContain('DA');
  });

  it('toString uses the default format', () => {
    expect(Dinar.fromDinars(1234.56).toString()).toBe(Dinar.fromDinars(1234.56).format());
  });
});
