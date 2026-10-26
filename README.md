# Odrakriti

**Craft heritage, connected to today's style.**

A software-first demonstration prototype built for a Class 12 OSFIC project about making
Odisha's traditional handloom crafts appealing to Gen-Z and modern consumers — while
preserving cultural identity, authenticity, and artisan value.

> **Odrakriti** (pronounced *oh-drah-KRI-tee*) is a **working name for this school-project
> prototype only**. Its open-web screen was preliminary and the official trademark-register
> search did not produce usable records. Nothing here claims the name is legally available,
> registered, or cleared. No ® or ™ is used, and no trademark clearance is claimed.

---

## What it is

A digital marketplace **and** design-request platform prototype. A buyer explores curated,
source-checked textile references, chooses a garment and a styling direction, and sends a
customisation request to an artisan. The artisan reviews feasibility and only then returns a
price and delivery estimate.

The whole prototype is built around one rule:

> **The buyer never sees a price or a delivery date before an artisan has reviewed the
> request and explicitly returned a quote.**

That rule is enforced in one place — `assets/js/lib/requests.js` — through `canSubmitQuote()`
and `buyerFacingQuote()`, and it is covered by unit and end-to-end tests.

---

## Run it

No build step. Any static file server works.

```bash
# Option A — Python (no dependencies at all)
python3 -m http.server 8000 --bind 0.0.0.0
# then open http://localhost:8000

# Option B — npm
npm start
```

There are **no external fonts, scripts, image CDNs, or network calls**. The app runs fully
offline from local files.

### Run the tests

```bash
npm test           # all 118 tests
npm run test:unit  # logic, provenance, contrast
npm run test:e2e   # full buyer + artisan flows in a real DOM (jsdom)
```

`npm test` requires `npm install` first, because the e2e suite uses
[jsdom](https://github.com/jsdom/jsdom) as a **dev** dependency. The website itself has no
runtime dependencies.

---

## Demo routes

| Route | What it is |
| --- | --- |
| `#/` | Home — problem, solution, pilot catalog |
| `#/explore` | Browse catalog with working filters and search |
| `#/explore?garment=kurti&q=kotpad` | Filtered catalog (filters live in the URL) |
| `#/design/:textileId` | Textile detail + provenance panel |
| `#/request/:textileId` | Four-step customisation wizard with live preview |
| `#/sent/:requestId` | Confirmation — "Request sent for artisan review" |
| `#/track/:requestId` | Buyer tracking; reveals the quote only after review |
| `#/how` | How it works, step by step |
| `#/about` | Scope, sources, and honest limits |
| `#/portal` | **Demo artisan portal** — request queue |
| `#/portal/request/:id` | Artisan review: feasibility, then gated quote |
| `#/portal/request/:id/brief` | **Print-ready technical brief** (Print / Save as PDF) |

### Suggested demo walkthrough (5 minutes)

1. `#/` — read the problem and the pilot notice.
2. `#/explore` — filter by garment and textile; show the permission badges.
3. `#/design/kotpad` — open the provenance panel and the citation.
4. `#/request/kotpad` — walk all four steps; try the **AI-assisted concept** path.
5. `#/sent/…` — note that there is **no price**.
6. `#/track/…` — note that price is explicitly *hidden*, not just absent.
7. `#/portal` → open the request → the price fields are **disabled**.
8. Mark **feasible**, save → price unlocks. Enter a price and window, send.
9. Back to `#/track/…` → the quote now appears, labelled an estimate.
10. `#/portal/request/…/brief` → print or save as PDF.

Also worth showing: choose **needs clarification** instead — the buyer gets a question and can
reply; or **not feasible** — the request closes and still never shows a price.

---

## What is implemented

**Buyer**

- Home page explaining the project in plain language.
- Catalog with filters for verified craft, garment type, style, and offering, plus text
  search. Filter state lives in the URL, so filtered views are shareable and survive refresh.
- Textile detail with a full provenance panel: verified name, region, technique, motifs,
  source citation, and permission status.
- Four-step request wizard: garment and style → design path → size and customisation →
  review and send, with a live preview and a step indicator.
- Size charts per garment, or custom measurements.
- Both design paths: a curated design from the demo library, or AI-assisted concept
  variations.
- Request confirmation and a tracking page.

**Artisan**

- Request queue with status tabs and counts.
- Full request view: garment, size or measurements, design asset reference, colourway,
  placement, buyer notes.
- Feasibility decision: feasible / not feasible / needs clarification.
- Price and delivery window fields that stay **locked** until the decision is feasible, with
  the reason printed beside them.
- A conversation thread for clarification.
- A print-ready technical brief.

**Cross-cutting**

- Consistent inline SVG icon set — no emoji icons anywhere.
- Keyboard-navigable, visible focus rings, accessible labels, `aria-live` announcements.
- Status conveyed by icon **and** text, never colour alone.
- `prefers-reduced-motion` honoured globally.
- Responsive at 375px, 768px, 1024px, and 1440px.
- Inline validation with a focusable error summary linked to each invalid field.

---

## Craft accuracy, provenance, and permissions

### Sources

Every textile description is matched to a single public source:

> Government of India, Ministry of Textiles — *Weavers Database — Odisha*
> `https://handlooms.nic.in/assets/img/Weavers%20Database/Odisha637322660372253324.pdf`

| Tradition | Citation |
| --- | --- |
| Sambalpuri Ikat (Bandha) | p. 12, Entry 3, Shri Rajendra Meher |
| Bomkai / Sonepuri | p. 14, "Bomkai Silk Saree" section |
| Kotpad | p. 15, Shri Gobardhan Panika |
| Berhampur Patta | p. 19, Entry 13 |

**These page references were supplied to this project as source-matched citations and are
recorded as supplied.** `handlooms.nic.in` was unreachable from the build environment
(connection failed), so they were **not** independently re-opened during the build. The data
file flags this explicitly (`SOURCE_PDF.reVerifiedInBuild === false`), and the UI prints the
same caveat.

**A source-matched citation is not an authentication and not a reuse licence.** Obtain
permission from the artisan, cooperative, or rights holder before using any photograph or
design asset publicly.

### Images

**No photograph from the source PDF is reproduced anywhere in this prototype.** The four
workspace reference images named in the project brief were not present in the workspace, and
none were downloaded.

All imagery is **neutral garment silhouettes drawn by this project** as inline SVG. No
heritage motif is drawn, approximated, or generated. Where a motif asset would eventually
sit, a clearly labelled hatched placeholder reading **WITHHELD** is shown instead.

### Textile scope

The project intends to feature **two or three** handloom traditions. That selection is
**not yet locked**, so:

- All four researched traditions are carried in the data as `candidate: true`.
- The catalog renders a permanent **pilot demo** notice saying the selection is not final.
- Narrowing the scope is a one-line change — see below.

Nothing has silently expanded the scope, and the catalog is never presented as a final
product list.

### What is never claimed

- No real artisan partnerships; no named artisan is participating.
- No real orders, payments, or production scheduling.
- No real pricing or confirmed delivery dates.
- No official certification or trademark clearance.
- No fabricated heritage motifs presented as authentic.
- No vague labels such as "tribal pattern" — where the cited entry does not name a community,
  the UI says so rather than guessing.

---

## The all-over T-shirt direction

The `sambalpuri-all-over-tee.png` concept is **not rendered in the buyer UI**, by decision.
It is noted here only, as instructed.

If it is added later, it must be labelled a **printed adaptation concept**, not a handwoven
product, unless an artisan confirms a real handwoven production method. The prototype already
carries the machinery for this: the `fabricPreference` field and `fabricationBadge()`
distinguish *handwoven*, *printed adaptation — not handwoven*, and *method not confirmed*,
and the technical brief prints that distinction explicitly.

---

## The concept engine

`assets/js/lib/concept.js` is a **simulated, deterministic, rule-based** generator. There is
no model, no network call, and no trained component. The UI says so wherever it appears.

It may only:

- re-arrange assets already in the approved library, and
- vary permitted styling choices: silhouette, placement, colourway, panel scale.

It may **never** invent, alter, or copy a heritage motif. `assertNoInventedAssets()` enforces
this and is unit-tested. If the approved library is empty, it returns nothing rather than
inventing a motif.

Every output is labelled **"Concept only — artisan review required."**

Because no motif asset has been approved, the demo library deliberately contains only plain
fabric fields (which claim no motif at all) and explicit withheld-placeholder slots.

---

## Narrowing the textile scope

The catalog is **derived** from the textile list, so it never drifts out of sync. To lock the
final two or three traditions, edit `assets/js/data/textiles.js`:

```js
featuredInPilot: false,   // on the tradition you are dropping
```

and set:

```js
export const SCOPE_LOCKED = true;
```

The catalog, the filters, the home page, and the pilot notice all follow automatically. Two
tests fail on purpose if the catalog ever contains a textile outside the pilot list.

---

## What is simulated

| Area | Reality |
| --- | --- |
| Sign-in / roles | Role switch only. No accounts, no passwords, no server. |
| Data | Browser `localStorage`. Falls back to memory if storage is blocked. |
| Quotes | Typed by hand in the artisan portal. Nothing is calculated. |
| Concept engine | Deterministic demo rules. No live AI model. |
| Imagery | Neutral SVG silhouettes drawn by this project. |
| Notifications | None. The buyer re-opens the tracking page. |
| Payments | None. Not built, deliberately. |

---

## Tech stack

Deliberately minimal so a Class 12 student can explain every part:

- **Vanilla HTML, CSS, and ES modules.** No framework, no bundler, no build step.
- A ~90-line hash router (`assets/js/lib/router.js`).
- Pure logic modules (`requests.js`, `concept.js`, `catalog.js`, `format.js`) that run in
  Node as well as the browser, which is what makes them testable.
- CSS custom properties for the whole design system (`assets/css/tokens.css`).
- `localStorage` for demo persistence.
- Node's built-in test runner, plus jsdom for the e2e suite.

```
assets/css/    tokens, base, components, pages
assets/js/
  data/        textiles, catalog, garments, colorways, assets  (all modular)
  lib/         requests, concept, router, store, silhouettes, icons, format, dom, seed
  components/  ui.js — shared badges, callouts, panels, cards
  pages/       home, explore, detail, wizard, track, info, portal, brief
  app.js       entry point
tests/         118 tests: quote gate, concept guard rails, scope, provenance,
               WCAG contrast, and full e2e flows
docs/          DESIGN-SYSTEM.md
```

---

## Design system

The visual system was derived at design time from the
[UI/UX Pro Max skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) using its
documented design-system generator, then adapted for this project. See
[`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) for what was taken, what was rejected, and
why. The skill is a **design-time reference only** — it is not a dependency of the website.

---

## Known limitations

- **No verified textile scope.** Two or three traditions are intended; four are carried as
  candidates and flagged.
- **No permission for any imagery.** Nothing is published as a product photograph.
- **No live AI.** The concept engine is transparent demo logic.
- **Page citations not re-verified in this build.** The source PDF was unreachable here.
- **Quotes are hand-typed.** No costing model, no material availability logic.
- **No notification.** The buyer must re-open the tracking page to see a quote.
- **Single-browser demo.** Data lives in one browser's local storage; the buyer and artisan
  sides are the same browser session.
- **Size charts are illustrative.** Every measurement is labelled
  "illustrative demo measurements — confirm with the artisan."
- **No dark mode.** Light only; contrast is verified for light surfaces.

---

## Accessibility checklist

Verified by tests and by construction:

- [x] No emoji used as icons — consistent inline SVG set
- [x] Colour contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text and UI boundaries
      (machine-checked against `tokens.css` in `tests/contrast.test.mjs`)
- [x] Visible focus states; skip link to main content
- [x] Accessible labels on every form control
- [x] Informative alt text on every meaningful SVG; decorative icons `aria-hidden`
- [x] Status conveyed by icon and text, never colour alone
- [x] `prefers-reduced-motion` respected globally
- [x] 44px minimum touch targets
- [x] Chips wrap rather than clip at narrow widths and browser zoom
- [x] Responsive at 375 / 768 / 1024 / 1440px
- [x] Inline field errors plus a focusable error summary linked to each field
