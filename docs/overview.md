# Overview & concepts

## Why a money type at all?

Representing money as a plain `number` is a latent bug. Floating-point can't hold most decimal fractions exactly, so `0.1 + 0.2 === 0.30000000000000004`. Accumulate that across a cart, a tax line, and a three-way split, and totals stop reconciling. `Dinar` removes the entire class of bug by never storing a fractional amount.

## The centimes invariant

A `Dinar` holds an **integer number of centimes** (1 DA = 100 centimes). `1 500,00 DA` is the integer `150000`. Every operation stays in integer space; the only time a value becomes a decimal is when you ask for `toDinars()` or `format()` for display.

This is also why the type maps cleanly onto payment gateways: **`toCentimes()` is exactly the "minor units" amount** that payment gateways and card networks expect.

## Rounding

Some operations (`multiply`, `percentage`) can produce a fractional centime — e.g. 19% VAT on an odd amount. Rather than silently truncating, `Dinar` rounds to a whole centime using an explicit `RoundingMode`:

| Mode | Behaviour | Use it for |
|---|---|---|
| `half-up` *(default)* | round half **away from zero** (`1.5 → 2`, `-1.5 → -2`) | most invoice/tax math |
| `half-even` | banker's rounding; ties to the nearest even | reducing cumulative bias over many roundings |
| `floor` | toward −∞ | never over-charging |
| `ceil` | toward +∞ | never under-charging |

## Splitting money: `allocate`

Dividing money is not division. `100` centimes split three ways can't be `33.33` each — that loses a centime. `allocate` distributes the remainder one centime at a time so the parts **always sum back to the original**: `[34, 33, 33]`. Weights let you split unevenly (e.g. `[1, 3]` → 25% / 75%).

## Single currency by design

This package is **DZD only** — there is no currency field, no FX, no multi-currency arithmetic. That keeps the type tiny and impossible to misuse (you can't accidentally add dinars to euros). Multi-currency is a different problem and explicitly out of scope.

## Glossary

- **Centime** — the minor unit of the Algerian Dinar. 1 DA = 100 centimes. The unit `Dinar` stores internally.
- **Minor units** — a payment-gateway term for the integer amount in the smallest currency unit; for DZD that's centimes. Equals `Dinar.toCentimes()`.
- **DA / دج** — the common written symbols for the Algerian Dinar (ISO 4217 code **DZD**).
- **Allocation** — splitting a total into parts without losing or creating value.

## Where it fits

`dinar` is a foundational money primitive for Algerian-fintech TypeScript tooling. It has no dependencies and is useful entirely on its own, and it's designed to be a shared money type, so amounts never drift between the packages that depend on it.
