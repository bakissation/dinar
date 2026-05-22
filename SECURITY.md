# Security Policy

## Supported versions

This project follows semantic versioning. Security fixes are applied to the **latest released minor version** only. Please upgrade before reporting.

## Reporting a vulnerability

**Do not open a public issue or pull request for security vulnerabilities.**

Report privately via GitHub's **Private Vulnerability Reporting**:

1. Go to the [Security tab](https://github.com/bakissation/dinar/security) of this repository.
2. Click **Report a vulnerability**.
3. Describe the issue, affected version, and reproduction steps.

You'll get an acknowledgement and can track the fix in the private advisory. Once a fix ships, the advisory is published with credit (unless you prefer to remain anonymous).

## Why this matters here

`dinar` does monetary arithmetic that downstream code uses to **charge, refund, and invoice real money**. The library has no network, filesystem, or credential surface, so the security-relevant risks are about **correctness of value handling**:

- **Precision / rounding bugs** that cause an amount to be over- or under-counted (e.g. a lost or duplicated centime in `allocate`, or incorrect rounding in `multiply`/`percentage`).
- **Parsing ambiguity** in `fromString` / `parseDinar` that turns a given input into the wrong amount.
- **Silent overflow** past `Number.MAX_SAFE_INTEGER` producing an incorrect value instead of throwing.

If you can produce an input that yields a wrong monetary result, that's in scope.

## Out of scope

- Issues requiring an already-compromised machine.
- Advisories in **dev-only** dependencies (build/test/release toolchain) that are not reachable at runtime — the published package has **zero runtime dependencies**.
