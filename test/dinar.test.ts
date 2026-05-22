import { describe, it, expect } from 'vitest';
import { Dinar, MoneyError } from '../src/index.js';

describe('Dinar construction', () => {
  it('builds from centimes', () => {
    expect(Dinar.fromCentimes(80650).centimes).toBe(80650);
  });

  it('builds from dinars without float drift', () => {
    expect(Dinar.fromDinars(806.5).centimes).toBe(80650);
    expect(Dinar.fromDinars(5000).centimes).toBe(500000);
    expect(Dinar.fromDinars(0.1).add(Dinar.fromDinars(0.2)).centimes).toBe(30);
  });

  it('builds from strings', () => {
    expect(Dinar.fromString('1 234,56').centimes).toBe(123456);
  });

  it('exposes zero', () => {
    expect(Dinar.zero().isZero()).toBe(true);
  });

  it('rejects non-integer / non-finite centimes', () => {
    expect(() => Dinar.fromCentimes(1.5)).toThrow(MoneyError);
    expect(() => Dinar.fromCentimes(Number.NaN)).toThrow(MoneyError);
    expect(() => Dinar.fromCentimes(Number.POSITIVE_INFINITY)).toThrow(MoneyError);
    expect(() => Dinar.fromDinars(Number.NaN)).toThrow(MoneyError);
  });

  it('tags errors with a stable code', () => {
    try {
      Dinar.fromCentimes(1.5);
    } catch (e) {
      expect((e as MoneyError).code).toBe('NOT_INTEGER');
    }
  });
});

describe('Dinar conversions', () => {
  it('reports centimes and dinars', () => {
    const d = Dinar.fromDinars(806.5);
    expect(d.toCentimes()).toBe(80650);
    expect(d.toDinars()).toBe(806.5);
  });

  it('serializes to centimes via toJSON', () => {
    const d = Dinar.fromCentimes(80650);
    expect(JSON.stringify({ price: d })).toBe('{"price":80650}');
  });
});

describe('Dinar arithmetic', () => {
  it('adds and subtracts', () => {
    expect(Dinar.fromDinars(100).add(Dinar.fromDinars(50)).centimes).toBe(15000);
    expect(Dinar.fromDinars(100).subtract(Dinar.fromDinars(150)).centimes).toBe(-5000);
  });

  it('multiplies with half-up rounding by default', () => {
    expect(Dinar.fromCentimes(100).multiply(0.125).centimes).toBe(13);
    expect(Dinar.fromCentimes(-100).multiply(0.125).centimes).toBe(-13);
  });

  it('honors rounding modes', () => {
    expect(Dinar.fromCentimes(100).multiply(0.125, 'floor').centimes).toBe(12);
    expect(Dinar.fromCentimes(100).multiply(0.125, 'ceil').centimes).toBe(13);
    expect(Dinar.fromCentimes(100).multiply(0.125, 'half-even').centimes).toBe(12);
    expect(Dinar.fromCentimes(100).multiply(0.375, 'half-even').centimes).toBe(38);
  });

  it('computes percentages (VAT)', () => {
    expect(Dinar.fromDinars(1000).percentage(19).centimes).toBe(19000);
    expect(Dinar.fromDinars(1000).percentage(9).centimes).toBe(9000);
  });

  it('negates and absolutes', () => {
    expect(Dinar.fromCentimes(-500).negate().centimes).toBe(500);
    expect(Dinar.fromCentimes(-500).abs().centimes).toBe(500);
  });

  it('rejects non-finite factors', () => {
    expect(() => Dinar.fromCentimes(100).multiply(Number.NaN)).toThrow(MoneyError);
  });
});

describe('Dinar.allocate', () => {
  it('splits without losing a centime', () => {
    const parts = Dinar.fromCentimes(100).allocate([1, 1, 1]);
    expect(parts.map((p) => p.centimes)).toEqual([34, 33, 33]);
    const sum = parts.reduce((a, p) => a.add(p), Dinar.zero());
    expect(sum.centimes).toBe(100);
  });

  it('respects weights', () => {
    const parts = Dinar.fromCentimes(1000).allocate([1, 3]);
    expect(parts.map((p) => p.centimes)).toEqual([250, 750]);
  });

  it('handles negative totals', () => {
    const parts = Dinar.fromCentimes(-100).allocate([1, 1, 1]);
    expect(parts.reduce((a, p) => a + p.centimes, 0)).toBe(-100);
  });

  it('rejects bad weights', () => {
    expect(() => Dinar.fromCentimes(100).allocate([])).toThrow(MoneyError);
    expect(() => Dinar.fromCentimes(100).allocate([0, 0])).toThrow(MoneyError);
    expect(() => Dinar.fromCentimes(100).allocate([-1, 2])).toThrow(MoneyError);
  });
});

describe('Dinar comparisons', () => {
  const a = Dinar.fromCentimes(100);
  const b = Dinar.fromCentimes(200);

  it('compares', () => {
    expect(a.compare(b)).toBe(-1);
    expect(b.compare(a)).toBe(1);
    expect(a.compare(Dinar.fromCentimes(100))).toBe(0);
  });

  it('answers ordering predicates', () => {
    expect(a.lessThan(b)).toBe(true);
    expect(b.greaterThan(a)).toBe(true);
    expect(a.lessThanOrEqual(Dinar.fromCentimes(100))).toBe(true);
    expect(a.greaterThanOrEqual(Dinar.fromCentimes(100))).toBe(true);
    expect(a.equals(Dinar.fromCentimes(100))).toBe(true);
  });

  it('answers sign predicates', () => {
    expect(Dinar.fromCentimes(1).isPositive()).toBe(true);
    expect(Dinar.fromCentimes(-1).isNegative()).toBe(true);
    expect(Dinar.zero().isZero()).toBe(true);
  });
});
