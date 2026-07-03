# Elite Vendor & Procurement Command

A white, black, and `#f4af00` gold procurement-operations workspace for **Elite Era Development L.L.C.** It controls purchase requests, budget exposure, vendor risk, approvals, quote comparisons, purchase orders, delivery and invoice matching, contract renewals, and cost-savings planning.

## Workflow

```text
Purchase request
→ Budget check
→ Three-vendor comparison
→ Project Manager / Finance / Founder / Security approval
→ Purchase order release
→ Delivery and invoice matching
→ Vendor scorecard
→ Contract renewal or renegotiation
```

## What it calculates

- Vendor risk from delivery reliability, quality, security controls, payment terms, contract expiry, and spend concentration
- Best total-value quote using price, vendor risk, and delivery lead time
- Budget capacity and request fit
- Required approval route based on purchase value, vendor risk, and security category
- Purchase-order, delivery, and invoice three-way match status
- Contract-expiry exposure
- Portfolio savings potential and configurable negotiation target

## Features

- Founder procurement command center
- Purchase-request workspace with new-request intake
- Three-vendor quote comparison and selection
- Project Manager, Finance, Founder, and Security approval controls
- Purchase-order release once approvals and budget fit are complete
- Delivery and invoice matching controls
- Vendor intelligence scorecards and contract-renewal radar
- Cost-savings simulator
- Finance action plan for risky vendors, incomplete approvals, and matching exceptions
- TXT, JSON, and print/PDF exports
- Local browser persistence and saved governance snapshots
- Responsive Elite Era design
- Node test suite and GitHub Actions verification

## Run locally

This is a self-contained browser app with no package installation required.

```bash
python -m http.server 5173
```

Then open `http://localhost:5173` in your browser.

On Windows, `py -m http.server 5173` may be used instead.

## Run checks

```bash
node --test engine.test.mjs
node --check app.js
node --check engine.mjs
```

## Production note

This is a functional browser prototype. A production deployment should add authenticated access, server-enforced role permissions, a vendor master database, supplier document storage, accounting and ERP integrations, invoice ingestion, contract alerts, audit trails, and approval signatures.

---

Made by **Hira Khyzer** for **Elite Era Development L.L.C.**
