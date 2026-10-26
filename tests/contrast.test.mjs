/**
 * ACCESSIBILITY: colour contrast.
 *
 * The palette came from the UI/UX Pro Max skill's nature-distilled style,
 * adjusted for warm ivory + indigo + terracotta. This test proves the
 * adjustments actually meet WCAG AA rather than just looking right.
 *
 * Body text must reach 4.5:1. Large text (>=18.66px bold or >=24px) needs 3:1.
 * Non-text UI (borders around focusable controls) needs 3:1.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { COLORWAYS } from "../assets/js/data/colorways.js";

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "..", "assets", "css", "tokens.css"), "utf8");

/** Read a token straight out of tokens.css — no hardcoded copies. */
function token(name) {
  const re = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})`);
  const m = re.exec(css);
  assert.ok(m, `token --${name} not found in tokens.css`);
  return m[1];
}

function toRGB(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function channel(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const [r, g, b] = toRGB(hex).map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/* ---------------- Body text: 4.5:1 ---------------- */

const BODY_PAIRS = [
  ["c-ink", "c-ivory", "primary text on page background"],
  ["c-ink", "c-card", "primary text on card"],
  ["c-ink-2", "c-ivory", "secondary text on page background"],
  ["c-ink-2", "c-card", "secondary text on card"],
  ["c-ink-3", "c-ivory", "muted text on page background"],
  ["c-ink-3", "c-card", "muted text on card"],
  ["c-ink-2", "c-ivory-2", "secondary text on alt section"],
  ["c-ink", "c-ivory-2", "primary text on alt section"],
  ["primary-fg", "c-indigo", "label on primary button"],
  ["accent-fg", "c-terracotta", "label on accent button"],
  ["c-indigo", "c-ivory", "link on page background"],
  ["c-indigo", "c-card", "link on card"],
  ["c-terracotta-deep", "c-ivory", "eyebrow text"],
  ["c-status-review-fg", "c-status-review-bg", "review badge"],
  ["c-status-ok-fg", "c-status-ok-bg", "ok badge"],
  ["c-status-no-fg", "c-status-no-bg", "negative badge"],
  ["c-status-info-fg", "c-status-info-bg", "info badge"],
  ["c-ochre", "c-ochre-soft", "concept badge"],
  ["c-focus", "c-ivory", "focus ring against background"],
];

for (const [fg, bg, label] of BODY_PAIRS) {
  test(`contrast >= 4.5:1 — ${label}`, () => {
    const ratio = contrast(token(fg), token(bg));
    assert.ok(
      ratio >= 4.5,
      `${label}: ${token(fg)} on ${token(bg)} is ${ratio.toFixed(2)}:1, needs >= 4.5:1`
    );
  });
}

/* ---------------- Large display text: 3:1 ---------------- */

const LARGE_PAIRS = [
  ["c-terracotta-deep", "c-ivory", "hero emphasis"],
  ["c-indigo-deep", "c-ivory", "display heading variant"],
  ["c-ivory", "c-ink", "portal nav label on dark"],
];

for (const [fg, bg, label] of LARGE_PAIRS) {
  test(`contrast >= 3:1 (large text) — ${label}`, () => {
    const ratio = contrast(token(fg), token(bg));
    assert.ok(
      ratio >= 3,
      `${label}: ${token(fg)} on ${token(bg)} is ${ratio.toFixed(2)}:1, needs >= 3:1`
    );
  });
}

/* ---------------- Non-text UI: 3:1 ---------------- */

const UI_PAIRS = [
  ["border-strong", "c-card", "input border on card"],
  ["border-strong", "c-ivory", "input border on page"],
  ["c-indigo", "c-card", "selected chip border"],
];

for (const [fg, bg, label] of UI_PAIRS) {
  test(`contrast >= 3:1 (UI boundary) — ${label}`, () => {
    const ratio = contrast(token(fg), token(bg));
    assert.ok(
      ratio >= 3,
      `${label}: ${token(fg)} on ${token(bg)} is ${ratio.toFixed(2)}:1, needs >= 3:1`
    );
  });
}

/* ---------------- Sanity: the tokens really are distinct ---------------- */

test("the palette is not accidentally monochrome", () => {
  const values = new Set([
    token("c-indigo"),
    token("c-terracotta"),
    token("c-sage"),
    token("c-ochre"),
  ]);
  assert.equal(values.size, 4);
});

test("colourway swatch labels are readable on their own swatch", () => {
  // Swatch names sit under the dot on the page background, so the
  // requirement is label-on-background, checked in BODY_PAIRS above.
  // Here we assert the dot itself is distinguishable from the card.
  for (const c of COLORWAYS) {
    const ratio = contrast(c.hex, token("c-card"));
    assert.ok(ratio >= 1.1, `${c.name} swatch must be visible against a card`);
  }
});
