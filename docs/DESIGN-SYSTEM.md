# Odrakriti — Design System

Derived at design time from the
[UI/UX Pro Max skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (v2.15.0),
using the repository's documented method:

```bash
python3 src/ui-ux-pro-max/scripts/search.py \
  "handloom craft artisan e-commerce marketplace contemporary editorial premium textiles" \
  --design-system -p "Odrakriti"
```

plus targeted `--domain` searches for `style`, `color`, `ux`, and `icons`.

**The skill is a design-time reference only.** It is not installed, imported, or depended on
by the website. Nothing below is copied from its sample screens.

---

## What the generator recommended

| Area | Recommendation | Decision |
| --- | --- | --- |
| Pattern | Feature-Rich Showcase — hero, feature grid, social proof, repeated CTA | **Adapted.** Kept hero + feature grid + catalog + CTA. Dropped "social proof / logos" — this project has no verified partners, so a logo wall would be a false claim. |
| Style | Liquid Glass (translucency, lensing, refraction) | **Rejected.** Optical glass reads as generic app chrome and fights a warm, human, textile-led subject. |
| Palette | `#1C1917` primary + `#A16207` gold accent, "premium dark + gold" | **Rejected as the base.** A dark/gold luxury scheme is wrong for a young, warm, editorial craft brand. |
| Typography | Playfair Display / Inter | **Direction accepted, source changed.** The editorial-serif-over-humanist-sans pairing is right. The actual families are local stacks, not Google Fonts, because the prototype must run without external font CDNs. |
| Effects | Lensing, refraction, fluid morph | **Rejected.** |
| Avoid | Vibrant block-based, playful colours | **Accepted.** |
| Checklist | SVG icons not emoji, cursor-pointer, 4.5:1 contrast, visible focus, reduced motion, no chip clipping, 375/768/1024/1440 | **Accepted in full.** All items are implemented and several are machine-tested. |

### The style that actually fit

A `--domain style` search for *"editorial craft commerce warm organic artisan boutique"*
returned **Nature Distilled**, which is a far better match than Liquid Glass:

> Keywords: muted earthy, skin tones, wood, soil, sand, terracotta, warmth, organic
> materials, **handmade warmth**
> Best for: wellness brands, sustainable products, **artisan goods**, home decor
> Variables: `--terracotta: #C67B5C, --sand-beige: #D4C4A8, --warm-clay: #B5651D,
> --soft-cream: #F5F0E1`
> Accessibility risk: low — requires contrast-text-4.5, keyboard, visible-focus, reduced-motion

Its guidance on effects — subtle texture, natural easing, soft shadows, grain — and its
"organic, varied" border radii shaped the final system.

The editorial grid discipline was borrowed from **Minimalism & Swiss Style**: generous
whitespace, a clear type hierarchy, and decoration only where it carries meaning.

---

## Palette

Warm ivory, deep indigo, terracotta, and charcoal, with restrained sage and ochre accents —
the direction the project brief suggested, tuned so every pair actually passes WCAG AA.

| Token | Value | Role |
| --- | --- | --- |
| `--c-ivory` | `#faf6ef` | Page background |
| `--c-ivory-2` | `#f3ecdf` | Alternate sections |
| `--c-card` | `#fffdf9` | Surfaces |
| `--c-ink` | `#241e19` | Primary text (warm charcoal, never pure black) |
| `--c-ink-2` | `#4a3f36` | Secondary text |
| `--c-ink-3` | `#6b5d51` | Muted text |
| `--c-indigo` | `#2c3c66` | Primary action |
| `--c-terracotta` | `#b4472a` | Accent action |
| `--c-sage` | `#55674f` | Restrained natural accent |
| `--c-ochre` | `#8a5b12` | "Concept" family only |
| `--c-focus` | `#1f4fa3` | Focus ring |

### Contrast is tested, not assumed

`tests/contrast.test.mjs` reads the hex values **out of `tokens.css`** — it does not keep a
second copy — and asserts:

- ≥ 4.5:1 for 19 body-text pairs
- ≥ 3:1 for 3 large-display pairs
- ≥ 3:1 for 3 UI-boundary pairs (input and control borders)

This test caught a real defect during the build: the original functional border
`#c6b6a0` measured **1.95:1** against the card surface. It was replaced with `#8a7358`
(4.42:1 on card, 4.17:1 on page, 3.82:1 on the alternate surface), computed by walking a
warm-taupe ramp until every surface cleared 3:1.

### On colour and tradition

**No colour is described as traditional anywhere in the product.** The cited source entries
do not enumerate shades, so the data layer asserts none, and every colourway carries the
disclaimer *"Styling colourway… not a statement that this shade is a traditional dye."*

---

## Typography

Local stacks only — no web fonts, no CDN, works offline:

```css
--font-display: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua",
                "Hoefler Text", Georgia, "Times New Roman", serif;
--font-body:    system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue",
                Arial, "Noto Sans", sans-serif;
--font-mono:    ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
```

- Body 16px base, `line-height: 1.6`.
- Display sizes use `clamp()` so headings scale fluidly between 375px and 1440px.
- `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs.
- Mono is reserved for request IDs, asset IDs, and citations — data, never prose.

---

## Spacing, shape, elevation

- 4px-base spacing scale, `--sp-1` … `--sp-9`.
- Container 1200px; narrow container 860px for prose.
- Varied, organic radii: 6 / 12 / 18 / 26px and a pill — following Nature Distilled's
  "organic (varied)" guidance rather than one uniform radius.
- Soft, low-opacity elevation in three steps. No hard drop shadows.

---

## Motion

- Standard 200ms, fast 120ms, slow 320ms, all on `cubic-bezier(0.2, 0.8, 0.3, 1)`
  (natural ease-out, per Nature Distilled).
- Hover lifts are 2–3px on cards, with shadow deepening.
- **`prefers-reduced-motion: reduce` collapses all animation and transition durations
  globally** and disables smooth scrolling.

---

## Components

- **Buttons** — primary (indigo), accent (terracotta), ghost, quiet. 44px minimum height.
- **Chips** — used for filters. `flex-wrap` is mandatory so labels reflow instead of
  clipping at narrow widths or high zoom; this addresses the skill's *Chip Collection
  Reflow* guideline directly.
- **Badges** — every badge pairs an **icon with text**. Colour is never the only signal.
  Families: review, ok, no, info, neutral, concept.
- **Callouts** — warn, concept, info, ok, no.
- **Choice tiles** — radiogroup semantics with `aria-checked`, used for garment, style,
  design path, placement, and size.
- **Forms** — visible labels, inline errors under the field wired with `aria-describedby`,
  and a focusable error summary at the top linking to each invalid field. This follows the
  skill's *Error Placement* and *Focusable Error Summary* guidelines.
- **Steps indicator** — a numbered progress list with `aria-current="step"`.
- **Tables** — real `<table>` with `<caption>`, scoped headers, and horizontal scroll on
  narrow screens.
- **Dialog / toast** — styled and available; the toast region is `aria-live="polite"`.

---

## Icons

A single hand-written 24×24 stroke family in `assets/js/lib/icons.js` — 2px stroke, round
caps and joins, ~50 glyphs. Consistent by construction because every icon comes from one
file.

- Decorative use → `aria-hidden="true" focusable="false"`.
- Standalone use → `role="img"` with an `aria-label`.
- **No emoji are used as icons anywhere.** An e2e test scans the rendered home page for
  emoji code points and fails if any appear.

---

## Layout and responsive behaviour

Mobile-first, verified at **375px, 768px, 1024px, 1440px**.

- Catalog: single column under 1024px, then a sticky 280px filter rail beside an
  auto-fill card grid.
- Detail and review: stacked, then two columns from 900px.
- Wizard: stacked, then form plus a sticky 380px live-preview panel from 1100px.
- Portal: stacked, then a 240px nav rail from 1024px.
- Header: full nav from 900px, hamburger drawer below.

No fixed pixel container widths, no horizontal scrolling, and zoom is never disabled.

---

## Accessibility

Beyond contrast (above):

- Skip link to `#main`; the route heading receives focus on navigation.
- `:focus-visible` ring of 3px with a 2px offset — never removed.
- 44px minimum touch targets via `--tap`.
- `aria-live` announcements for navigation and async state changes.
- Every meaningful SVG carries an accessible name; decorative ones are hidden.
- Status is always icon **plus** text.
- Reduced motion honoured globally.

---

## Print

The technical brief at `#/portal/request/:id/brief` is print-first:

- `@page { margin: 16mm }`.
- App chrome, header, footer, and controls are hidden via `.no-print`.
- Blocks use `break-inside: avoid` so warnings are never split across pages.
- Type scales to points, and shadows are dropped.

The browser's own **Print / Save as PDF** produces the document — there is no PDF server.

---

## Anti-patterns deliberately avoided

- Emoji as icons.
- Colour as the only status signal.
- Dead controls — every link, filter, tab, selector, form, and button does something.
- Decorative fake motifs added to "look Odia".
- Placeholder-only labels.
- Top-of-form-only error reporting.
- Hover-only affordances.
- Fixed pixel widths and disabled zoom.
- Instant 0ms state changes.
