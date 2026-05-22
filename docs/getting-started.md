# Getting started

## Install

```bash
npm install @bakissation/dinar
```

Requires **Node.js ≥ 18**. Ships ESM + CommonJS with bundled types; zero runtime dependencies.

## Creating amounts

```typescript
import { Dinar } from '@bakissation/dinar';

Dinar.fromDinars(1500);        // 1 500,00 DA  (from a dinar amount)
Dinar.fromCentimes(150000);    // 1 500,00 DA  (from integer centimes / minor units)
Dinar.fromString('1 234,56');  // 1 234,56 DA  (from human / CSV text)
Dinar.zero();                  // 0,00 DA
```

`Dinar` is immutable — every operation returns a new instance, so an amount can be shared freely without defensive copying.

## Common recipes

### Add a VAT line

```typescript
const ht = Dinar.fromDinars(1000);          // amount excl. tax
const vat = ht.percentage(19);              // 190,00 DA
const ttc = ht.add(vat);                    // 1 190,00 DA
```

### Split a total without losing a centime

```typescript
const [a, b, c] = Dinar.fromDinars(100).allocate([1, 1, 1]);
// a=34c implied? -> centimes: 3334, 3333, 3333; sums back to 10000
```

### Compare and guard

```typescript
if (balance.lessThan(price)) throw new Error('insufficient funds');
amount.isNegative();   // refund?
amount.isZero();
```

### Talk to a payment gateway (minor units)

```typescript
const amount = Dinar.fromDinars(806.5);
gateway.register({ amount: amount.toCentimes() });   // 80650
```

### Parse messy input

`fromString` tolerates spaces as thousands separators, either `.` or `,` as the decimal point, currency tokens, and Arabic-Indic digits:

```typescript
Dinar.fromString('1 234,56 DA').centimes;   // 123456
Dinar.fromString('1,234.56').centimes;      // 123456
Dinar.fromString('٨٠٦٫٥').centimes;          // 80650
```

### Display

```typescript
Dinar.fromDinars(1234.56).format();                  // "1 234,56 DA"
Dinar.fromDinars(1234.56).format({ locale: 'ar' });  // "1 234,56 دج"
Dinar.fromDinars(1234.56).format({ symbol: false }); // "1 234,56"
```

### Persist

`toJSON()` serializes to integer centimes, so storage round-trips cleanly:

```typescript
const json = JSON.stringify({ price: Dinar.fromDinars(1500) }); // {"price":150000}
const price = Dinar.fromCentimes(JSON.parse(json).price);
```

## Errors

Invalid input throws a `MoneyError` with a stable `code` (`NOT_INTEGER`, `NOT_FINITE`, `OVERFLOW`, `PARSE_ERROR`, `INVALID_INPUT`) — branch on `code`, not the message. Full list in the [API reference](./api-reference.md).
