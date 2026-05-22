# @bakissation/dinar

A **type-safe Algerian Dinar (DZD) money type** for TypeScript. Amounts are stored as integer **centimes**, so arithmetic never drifts into floating-point error — and it ships with **zero runtime dependencies**.

[![npm](https://img.shields.io/npm/v/@bakissation/dinar?label=npm&color=cb3837)](https://www.npmjs.com/package/@bakissation/dinar)
[![CI](https://github.com/bakissation/dinar/actions/workflows/ci.yml/badge.svg)](https://github.com/bakissation/dinar/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

- 🪙 **Integer-precise** — every amount is an integer number of centimes; no `0.1 + 0.2` surprises.
- ➗ **Remainder-free allocation** — split a total across shares without creating or losing a centime.
- 🧮 **Money-correct rounding** — `half-up` (default), `half-even`, `floor`, `ceil` for VAT/percentage math.
- 🌍 **fr / ar formatting & parsing** — render `1 234,56 DA` / `1 234,56 دج`; parse messy human and CSV input.
- 🧩 **Zero dependencies, ESM + CommonJS, strict types.**

## Install

```bash
npm install @bakissation/dinar
```

Requires **Node.js ≥ 18**. No runtime dependencies.

## Quick start

```typescript
import { Dinar } from '@bakissation/dinar';

const price = Dinar.fromDinars(1500);               // 1 500,00 DA
const total = price.add(price.percentage(19));      // + 19% VAT
console.log(total.format());                        // "1 785,00 DA"

// Split a bill three ways — no lost centime
Dinar.fromCentimes(100).allocate([1, 1, 1]);        // 34 + 33 + 33

// Minor units, exactly what the SATIM gateway expects
price.toCentimes();                                 // 150000

// Parse messy human / CSV input
Dinar.fromString('1 234,56 DA').centimes;           // 123456
```

## Why centimes?

Money in floating point is a bug waiting to happen (`0.1 + 0.2 !== 0.3`). `Dinar` keeps every value as an integer count of centimes (1 DA = 100 centimes) and only converts to a decimal for display. That single invariant is what makes totals, taxes, and splits trustworthy. See **[docs/overview](./docs/overview.md)**.

## Documentation

Full docs live in **[`docs/`](./docs/)**:

| | |
|---|---|
| [Overview & concepts](./docs/overview.md) | Why a money type, the centimes invariant, rounding, glossary |
| [Getting started](./docs/getting-started.md) | Install, construct, the common recipes |
| [API reference](./docs/api-reference.md) | Every constructor, method, and option on `Dinar` |
| [Architecture](./docs/architecture.md) | Internals: the integer invariant, the allocation algorithm, parsing & formatting |

## A foundation for Algerian fintech

`dinar` is a foundational money primitive for open, direct-integration TypeScript tooling around Algerian payments and fiscal workflows. Because every amount is integer centimes, `toCentimes()` returns exactly the minor-units value payment gateways expect.

## Contributing

Issues and PRs welcome — read [CONTRIBUTING.md](./CONTRIBUTING.md) and the [Code of Conduct](./CODE_OF_CONDUCT.md). Releases are automated from [Conventional Commits](https://www.conventionalcommits.org/) via semantic-release; **don't bump the version or edit the changelog by hand**.

## Credits

Built and maintained by **Abdelbaki Berkati** — [berkati.xyz](https://berkati.xyz) · [@bakissation](https://github.com/bakissation).

## License

[MIT](./LICENSE)
