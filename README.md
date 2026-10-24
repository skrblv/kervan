# Kervan — Spec-to-Quote prototype

**Specify once, compare real quotes, produce near the buyer.**

Kervan helps small clothing brands in Kyrgyzstan and Kazakhstan turn a hoodie or sweatshirt idea into a
**Production Passport** that small Bishkek workshops can price and sew. The founder sees a cost estimate before
contacting anyone, then compares structured quotes on a like-for-like basis.

This repository is a **frontend-only prototype with demo data**, built for the Turkish Forum 2026 presentation and for
developers picking up the MVP. It follows the scope in the project file (Final Project File v2 and the Critical Rebuild):
one garment family, one city, no money handling.

## Run it

Requires Node 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests for the cost model, rules, grading, hashing and quotes
npm run build      # type-check and production build into dist/
npm run preview    # serve the production build
npm run format     # Prettier
```

The build uses relative paths and hash routing, so `dist/` can be opened from any static host or sub-path. Fonts are
bundled locally, so the demo works offline.

## The flow

| #   | Screen                      | What it does                                                                                                                                                                                                                                                                                               |
| --- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01  | **Specify** (`#/spec`)      | Six-step builder: garment and fit, fabric and colours, construction, sizes, decoration, labels. A to-scale technical drawing, live manufacturability checks and the running estimate sit beside the form. Every option shows its glossary code and what it does to the unit cost.                          |
| 02  | **Estimate** (`#/estimate`) | Unit cost by batch size on a log scale with its uncertainty band, the efficient batch, a component breakdown, the data basis and the formula.                                                                                                                                                              |
| 03  | **Passport** (`#/passport`) | The specification as a document: title block, lettered drawings, materials, construction, graded measurements with tolerances, decoration, labels, ISO 2859-1 inspection plan. Renders in Russian, Kyrgyz, Kazakh, Turkish and English. Locking a version gives it a SHA-256 hash. Prints to PDF.          |
| 04  | **Request** (`#/request`)   | Quantities by size and colour, deadline and delivery city, with a live preview of the request card workshops receive in Telegram (RU / KY).                                                                                                                                                                |
| 05  | **Compare** (`#/quotes`)    | Replies arrive; quotes are normalised (fabric and delivery added where excluded) and compared side by side. An outlier gets a clarifying question, not a "wrong" mark. A workshop question is answered against a passport field and creates the next version. Requesting a sample starts the order record. |

### Seven-minute demo script

1. Home → **Open the worked example: 80 black hoodies** (section 5.4 of the project file).
2. In **Decoration**, raise the artwork width to 40 cm: the drawing turns red and the check blocks the passport ("size S chest allows 38 cm"). Set it back to 28.
3. **Estimate**: show 30 / 50 / 100 / 200 units, the efficient batch and the data basis with its measured error.
4. **Passport**: lock v1, then switch RU → TR → KY. Codes stay the same; the text is rendered, not translated.
5. **Request**: show the card in Russian and Kyrgyz, then send it.
6. **Compare**: three quotes and one question arrive. Point out the +42% outlier and the fabric-excluded quote brought to the same basis. Answer the drawcord question (the passport becomes draft v2), then request a sample from the lowest like-for-like quote.
7. Close on the order record: sample → approval locks the version → production → in-person inspection (13 of 80).

Use **Demo data → Start over** in the header to reset. State is kept in `localStorage`, so a refresh mid-demo is safe.

## What is real and what is simulated

**Computed in the browser (real logic, unit-tested):**

- Cost model `c(q) = m·p + r + d + k + s(q) + F/q`. The reference hoodie reproduces Appendix E exactly (1 462 / 1 345 / 1 245 / 1 190 / 1 162 som at 30–300 units).
- Efficient batch (the smallest quantity where doubling saves less than 5%), uncertainty ranges, and range-only display while a product type has fewer than 10 observations.
- 15 manufacturability and completeness rules, e.g. print width against the smallest size's chest, artwork running into the pocket, screen printing on small runs, and Russian required on the care label (TR CU 017/2011).
- Size grading from base measurements with tolerances.
- Passport versioning: canonical JSON, SHA-256 (own implementation, so it also works on plain-HTTP LAN demos), and a field-level diff between versions.
- Multilingual rendering from a coded glossary.
- Quote normalisation, the 35% outlier rule, deadline and minimum-quantity checks.
- ISO 2859-1 general level II sample sizes.

**Demo data (invented, and labelled as such in the UI):**

- The four workshops, their quotes, reply timing and the question.
- The model's data basis (34 quotes, 16.3% MAPE). The pilot replaces this with measured values.
- Glossary translations. In the pilot, workshop staff review every term.

**Deliberately not built:** backend, accounts, payments or escrow, a live Telegram bot, file uploads, workshop and team
consoles. Kervan never holds order money; the UI says so wherever money is mentioned.

## Code structure

```
src/
  types/        Spec, passport, quote and order types
  data/         Catalog options, cost-model parameters, measurements, glossary (5 languages), demo workshops
  lib/          Pure logic: estimate, rules, grading, passport hashing/diff, quotes, inspection, sha256, formatting
                (*.test.ts next to the code they test)
  state/        One reducer + context, persisted to localStorage
  components/
    garment/    Parametric technical flat (geometry.ts is pure; GarmentFlat.tsx renders SVG)
    estimate/   Batch curve, breakdown table, data basis
    passport/   Passport sheet, measurement table
    request/    Size × colour matrix, Telegram request card
    quotes/     Comparison table, question card, sample dialog, order record
    layout/     Shell, route navigation, demo menu
    ui/         Buttons, fields, choice lists
  pages/        One file per screen; the builder's steps live in pages/builder/
```

Pages hold state and layout; everything that can be computed lives in `lib/` and has tests. Adding a product type means
adding catalog options, measurements, glossary terms, cost parameters and rules. No new screens are needed.

## Design notes

- **Palette:** paper and ink, with one accent — the deep turquoise of Central Asian tilework — for selection, focus and
  technical annotation. Ochre and red are reserved for warnings and errors. All text tokens meet WCAG AA.
- **Type:** Spectral for headings (editorial), IBM Plex Sans for interface and figures, IBM Plex Mono for codes and
  measurements. All three cover Cyrillic, including the Kazakh and Kyrgyz letters, and Turkish.
- **One motif:** the stitch line, which reads both as a seam and as a caravan route. It joins the five stations in the
  header, the steps on the home page and the order record.
- **A layout per job:** the builder is a workbench (steps, form, drawing board), the passport is a printed document, and the
  comparison is a ledger with one column per workshop.
- **Accessibility:** native form controls and radio groups, labelled fields with described errors, live regions for
  checks and replies, a native `<dialog>`, visible focus, `lang` attributes on every translated passage, reduced motion
  respected, and a table equivalent for the chart.
