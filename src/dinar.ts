import { MoneyError } from './errors.js';
import { parseDinar } from './parse.js';
import { formatDinar, type FormatOptions } from './format.js';
import type { RoundingMode } from './types.js';

function assertCentimes(centimes: number): number {
  if (!Number.isFinite(centimes)) {
    throw new MoneyError('Centimes must be a finite number', 'NOT_FINITE');
  }
  if (!Number.isInteger(centimes)) {
    throw new MoneyError('Centimes must be a whole number (no fractional centime)', 'NOT_INTEGER');
  }
  if (!Number.isSafeInteger(centimes)) {
    throw new MoneyError('Amount is too large to represent safely', 'OVERFLOW');
  }
  return centimes;
}

function round(value: number, mode: RoundingMode): number {
  switch (mode) {
    case 'floor':
      return Math.floor(value);
    case 'ceil':
      return Math.ceil(value);
    case 'half-even': {
      const floor = Math.floor(value);
      const diff = value - floor;
      if (diff < 0.5) return floor;
      if (diff > 0.5) return floor + 1;
      return floor % 2 === 0 ? floor : floor + 1;
    }
    case 'half-up':
    default:
      // Round half away from zero, symmetric for positive and negative amounts.
      return Math.sign(value) * Math.round(Math.abs(value));
  }
}

/**
 * An immutable Algerian Dinar (DZD) amount, stored as an integer number of
 * centimes (1 DA = 100 centimes). All arithmetic stays in integer space, so it
 * never accumulates floating-point error. Single-currency by design — no FX.
 */
export class Dinar {
  readonly #centimes: number;

  private constructor(centimes: number) {
    this.#centimes = centimes;
  }

  /** Build from an integer number of centimes (1 DA = 100 centimes). */
  static fromCentimes(centimes: number): Dinar {
    return new Dinar(assertCentimes(centimes));
  }

  /** Build from an amount in dinars (e.g. `5000`, `806.5`). Float-safe. */
  static fromDinars(dinars: number): Dinar {
    if (!Number.isFinite(dinars)) {
      throw new MoneyError('Amount must be a finite number', 'NOT_FINITE');
    }
    return new Dinar(parseDinar(dinars.toString()));
  }

  /** Parse a human-written amount (`"1 234,56"`, `"5000 DA"`, …). */
  static fromString(value: string): Dinar {
    return new Dinar(parseDinar(value));
  }

  /** A zero amount. */
  static zero(): Dinar {
    return new Dinar(0);
  }

  /** Sum a list of amounts; an empty list yields zero. */
  static sum(amounts: Dinar[]): Dinar {
    return amounts.reduce((total, amount) => total.add(amount), Dinar.zero());
  }

  /** Integer centimes — also exactly the minor-units value SATIM expects. */
  get centimes(): number {
    return this.#centimes;
  }

  /** Integer centimes (alias of {@link Dinar.centimes}). */
  toCentimes(): number {
    return this.#centimes;
  }

  /** Decimal dinars (lossy `number`; use for display/interop only). */
  toDinars(): number {
    return this.#centimes / 100;
  }

  add(other: Dinar): Dinar {
    return Dinar.fromCentimes(this.#centimes + other.#centimes);
  }

  subtract(other: Dinar): Dinar {
    return Dinar.fromCentimes(this.#centimes - other.#centimes);
  }

  /** Multiply by a scalar, rounding any fractional centime (default `half-up`). */
  multiply(factor: number, rounding: RoundingMode = 'half-up'): Dinar {
    if (!Number.isFinite(factor)) {
      throw new MoneyError('Factor must be a finite number', 'INVALID_INPUT');
    }
    return Dinar.fromCentimes(round(this.#centimes * factor, rounding));
  }

  /** Take a percentage of this amount, e.g. `.percentage(19)` for 19% VAT. */
  percentage(percent: number, rounding: RoundingMode = 'half-up'): Dinar {
    return this.multiply(percent / 100, rounding);
  }

  /**
   * Split this amount across `weights`, distributing the leftover centime(s)
   * so the parts sum back to exactly the original — no money is created or lost.
   *
   * @example
   * Dinar.fromCentimes(100).allocate([1, 1, 1]) // 34 + 33 + 33 centimes
   */
  allocate(weights: number[]): Dinar[] {
    if (weights.length === 0) {
      throw new MoneyError('allocate requires at least one weight', 'INVALID_INPUT');
    }
    let total = 0;
    for (const w of weights) {
      if (!Number.isFinite(w) || w < 0) {
        throw new MoneyError('weights must be non-negative finite numbers', 'INVALID_INPUT');
      }
      total += w;
    }
    if (total <= 0) {
      throw new MoneyError('weights must sum to a positive value', 'INVALID_INPUT');
    }

    const shares = weights.map((w) => Math.trunc((this.#centimes * w) / total));
    let remainder = this.#centimes - shares.reduce((a, b) => a + b, 0);
    const step = remainder >= 0 ? 1 : -1;
    for (let i = 0; remainder !== 0; i++) {
      shares[i % shares.length]! += step;
      remainder -= step;
    }
    return shares.map((c) => Dinar.fromCentimes(c));
  }

  /** Split into `parts` equal shares, distributing any remainder so they sum back exactly. */
  split(parts: number): Dinar[] {
    if (!Number.isInteger(parts) || parts < 1) {
      throw new MoneyError('split requires a positive integer number of parts', 'INVALID_INPUT');
    }
    return this.allocate(new Array(parts).fill(1));
  }

  negate(): Dinar {
    return Dinar.fromCentimes(-this.#centimes);
  }

  abs(): Dinar {
    return Dinar.fromCentimes(Math.abs(this.#centimes));
  }

  /** `-1` if less, `0` if equal, `1` if greater. */
  compare(other: Dinar): -1 | 0 | 1 {
    if (this.#centimes < other.#centimes) return -1;
    if (this.#centimes > other.#centimes) return 1;
    return 0;
  }

  equals(other: Dinar): boolean {
    return this.#centimes === other.#centimes;
  }

  greaterThan(other: Dinar): boolean {
    return this.#centimes > other.#centimes;
  }

  greaterThanOrEqual(other: Dinar): boolean {
    return this.#centimes >= other.#centimes;
  }

  lessThan(other: Dinar): boolean {
    return this.#centimes < other.#centimes;
  }

  lessThanOrEqual(other: Dinar): boolean {
    return this.#centimes <= other.#centimes;
  }

  isZero(): boolean {
    return this.#centimes === 0;
  }

  isPositive(): boolean {
    return this.#centimes > 0;
  }

  isNegative(): boolean {
    return this.#centimes < 0;
  }

  /** Localized string, e.g. `"1 234,56 DA"`. */
  format(options?: FormatOptions): string {
    return formatDinar(this.#centimes, options);
  }

  toString(): string {
    return this.format();
  }

  /** Serializes as integer centimes, so `JSON.parse` round-trips via `fromCentimes`. */
  toJSON(): number {
    return this.#centimes;
  }
}
