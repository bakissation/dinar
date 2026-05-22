import { describe, it, expect } from 'vitest';
import { parseDinar, MoneyError } from '../src/index.js';

describe('parseDinar', () => {
  it('parses plain integers and decimals', () => {
    expect(parseDinar('5000')).toBe(500000);
    expect(parseDinar('806.5')).toBe(80650);
    expect(parseDinar('806.50')).toBe(80650);
    expect(parseDinar('0.99')).toBe(99);
    expect(parseDinar('.5')).toBe(50);
  });

  it('treats a lone comma as the decimal point', () => {
    expect(parseDinar('806,5')).toBe(80650);
  });

  it('treats spaces as thousands separators', () => {
    expect(parseDinar('1 234,56')).toBe(123456);
    expect(parseDinar('1 234,56')).toBe(123456);
  });

  it('resolves both separators (last one is decimal)', () => {
    expect(parseDinar('1.234,56')).toBe(123456);
    expect(parseDinar('1,234.56')).toBe(123456);
  });

  it('tolerates currency tokens', () => {
    expect(parseDinar('5000 DA')).toBe(500000);
    expect(parseDinar('5000 DZD')).toBe(500000);
    expect(parseDinar('806,5 دج')).toBe(80650);
  });

  it('normalizes Arabic-Indic digits and separators', () => {
    expect(parseDinar('٨٠٦٫٥')).toBe(80650);
    expect(parseDinar('٥٠٠٠')).toBe(500000);
  });

  it('handles signs', () => {
    expect(parseDinar('-806,5')).toBe(-80650);
    expect(parseDinar('+5000')).toBe(500000);
  });

  it('rounds beyond two decimals (half-up)', () => {
    expect(parseDinar('806.555')).toBe(80656);
    expect(parseDinar('806.554')).toBe(80655);
  });

  it('rejects empty and malformed input', () => {
    expect(() => parseDinar('')).toThrow(MoneyError);
    expect(() => parseDinar('   ')).toThrow(MoneyError);
    expect(() => parseDinar('abc')).toThrow(MoneyError);
    expect(() => parseDinar('1.2.x')).toThrow(MoneyError);
  });

  it('rejects unsafe magnitudes', () => {
    expect(() => parseDinar('9'.repeat(20))).toThrow(MoneyError);
  });
});
