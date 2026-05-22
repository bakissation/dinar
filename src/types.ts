/**
 * Rounding strategy used when an operation produces a fractional centime
 * (e.g. `multiply`, `percentage`).
 *
 * - `half-up`    — round half away from zero (1.5 → 2, -1.5 → -2). The default.
 * - `half-even`  — banker's rounding; ties go to the nearest even (0.5 → 0, 1.5 → 2).
 * - `floor`      — round toward negative infinity.
 * - `ceil`       — round toward positive infinity.
 */
export type RoundingMode = 'half-up' | 'half-even' | 'floor' | 'ceil';
