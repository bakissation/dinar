# API reference

All exports come from the package root:

```typescript
import {
  Dinar,
  parseDinar,
  formatDinar,
  MoneyError,
  type MoneyErrorCode,
  type RoundingMode,
  type FormatOptions,
} from '@bakissation/dinar';
```

## `Dinar`

Immutable Algerian Dinar amount, stored as integer centimes (1 DA = 100 centimes).

### Constructors (static)

| Method | Description |
|---|---|
| `Dinar.fromCentimes(centimes: number)` | From an integer number of centimes. Throws if not a safe integer. |
| `Dinar.fromDinars(dinars: number)` | From a dinar amount (`5000`, `806.5`). Float-safe (parsed via string). |
| `Dinar.fromString(value: string)` | From human/CSV text. See [`parseDinar`](#parsedinar) for the accepted grammar. |
| `Dinar.zero()` | A zero amount. |
| `Dinar.sum(amounts: Dinar[])` | Sum a list of amounts (empty list → zero). |

### Accessors

| Member | Returns | Description |
|---|---|---|
| `.centimes` | `number` | Integer centimes. |
| `.toCentimes()` | `number` | Integer centimes — the minor-units value gateways expect. |
| `.toDinars()` | `number` | Decimal dinars (lossy `number`; display/interop only). |

### Arithmetic

| Method | Description |
|---|---|
| `.add(other)` | Sum of two amounts. |
| `.subtract(other)` | Difference. |
| `.multiply(factor, rounding?)` | Multiply by a scalar; rounds a fractional centime (default `half-up`). |
| `.percentage(percent, rounding?)` | `percent`% of the amount, e.g. `.percentage(19)` for 19% VAT. |
| `.allocate(weights)` | Split into parts proportional to `weights`, distributing the remainder so the parts sum back exactly. Returns `Dinar[]`. |
| `.split(parts)` | Split into `parts` equal shares (remainder-free). Returns `Dinar[]`. |
| `.negate()` | Sign-flipped amount. |
| `.abs()` | Absolute value. |

### Comparison & predicates

| Method | Returns |
|---|---|
| `.compare(other)` | `-1` \| `0` \| `1` |
| `.equals(other)` | `boolean` |
| `.greaterThan` / `.greaterThanOrEqual` / `.lessThan` / `.lessThanOrEqual` | `boolean` |
| `.isZero()` / `.isPositive()` / `.isNegative()` | `boolean` |

### Output

| Method | Description |
|---|---|
| `.format(options?)` | Localized string, e.g. `"1 234,56 DA"`. See [`FormatOptions`](#formatoptions). |
| `.toString()` | Default `format()`. |
| `.toJSON()` | Integer centimes — round-trips via `fromCentimes`. |

## `RoundingMode`

`'half-up'` (default) · `'half-even'` · `'floor'` · `'ceil'`. See [overview → Rounding](./overview.md#rounding).

## `parseDinar`

```typescript
parseDinar(input: string): number   // → integer centimes
```

Float-safe parser. Grammar:

- **Whitespace** (incl. NBSP / narrow / thin) is always a **thousands** separator.
- `.` and `,` are accepted; the **last** one is the **decimal point**, earlier ones are thousands separators (`"1.234,56"` and `"1,234.56"` both → `123456`).
- A **lone** `,` or `.` is the decimal point (`"806,5"` → `80650`).
- Currency tokens (`DA`, `DZD`, `دج`, `دينار`) and Arabic separators (`٫` `٬`) are tolerated; Arabic-Indic/Persian digits are normalized.
- More than two decimals are rounded **half-up** to the centime.

Throws `MoneyError` (`PARSE_ERROR` or `OVERFLOW`) on empty/malformed/too-large input.

## `formatDinar`

```typescript
formatDinar(centimes: number, options?: FormatOptions): string
```

Formats integer centimes as a localized string via `Intl.NumberFormat`.

### `FormatOptions`

| Option | Type | Default | Description |
|---|---|---|---|
| `locale` | `'fr'` \| `'ar'` | `'fr'` | `fr-DZ` or `ar-DZ`. Both use Western digits (Algerian convention); only separators and symbol differ. |
| `symbol` | `boolean` | `true` | Append the currency symbol (`DA` / `دج`). |

> Exact grouping/decimal glyphs come from the platform's `Intl`/ICU data, so don't hard-code separator characters in assertions.

## `MoneyError`

```typescript
class MoneyError extends Error {
  readonly code: MoneyErrorCode;
}
```

`MoneyErrorCode` = `'NOT_FINITE'` | `'NOT_INTEGER'` | `'OVERFLOW'` | `'PARSE_ERROR'` | `'INVALID_INPUT'`. Branch on `code`, not the message.
