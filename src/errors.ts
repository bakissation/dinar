/**
 * Stable, machine-readable error codes thrown by this package.
 */
export type MoneyErrorCode =
  | 'NOT_FINITE'
  | 'NOT_INTEGER'
  | 'OVERFLOW'
  | 'PARSE_ERROR'
  | 'INVALID_INPUT';

/**
 * The single error type thrown by `@bakissation/dinar`.
 * Carries a stable `code` so callers can branch without string-matching messages.
 */
export class MoneyError extends Error {
  readonly code: MoneyErrorCode;

  constructor(message: string, code: MoneyErrorCode) {
    super(message);
    this.name = 'MoneyError';
    this.code = code;
    // Restore the prototype chain when compiled down to ES5-era targets.
    Object.setPrototypeOf(this, MoneyError.prototype);
  }
}
