/**
 * PROVENANCE & PERMISSION HONESTY.
 *
 * These tests exist because an earlier image gallery was rejected for
 * textiles not matching their names. They assert that the data layer never
 * over-claims: no permission granted, no community invented, no technique
 * generalised, and no colour asserted as traditional.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { TEXTILES, pilotTextiles, SOURCE_PDF, PILOT_NOTICE } from "../assets/js/data/textiles.js";
import { GARMENTS, SIZE_CHARTS } from "../assets/js/data/garments.js";
import { COLORWAYS, COLORWAY_DISCLAIMER } from "../assets/js/data/colorways.js";

const EXPECTED = ["sambalpuri-ikat", "bomkai-sonepuri", "kotpad", "berhampur-patta"];

test("the four researched traditions are all present and all marked candidate", () => {
  assert.deepEqual(TEXTILES.map((t) => t.id).sort(), [...EXPECTED].sort());
  for (const t of TEXTILES) {
    assert.equal(t.candidate, true, `${t.id} must be marked a candidate while scope is open`);
  }
});

test("no textile claims permission has been granted", () => {
  for (const t of TEXTILES) {
    assert.equal(t.permission.status, "pending", `${t.id} must not claim granted permission`);
    assert.match(t.permission.label, /not confirmed/i);
    assert.match(t.permission.detail, /no permission has been obtained/i);
  }
});

test("every citation names the verified page and entry", () => {
  const pages = { "sambalpuri-ikat": 12, "bomkai-sonepuri": 14, kotpad: 15, "berhampur-patta": 19 };
  for (const t of TEXTILES) {
    assert.equal(t.citation.page, pages[t.id], `${t.id} page reference`);
    assert.ok(t.citation.entry, `${t.id} must cite an entry`);
  }
});

test("the source PDF is flagged as not re-verified in this build", () => {
  assert.equal(SOURCE_PDF.reVerifiedInBuild, false);
  assert.match(SOURCE_PDF.reVerifyNote, /not independently re-opened/i);
  assert.match(SOURCE_PDF.url, /handlooms\.nic\.in/);
});

test("no community is invented where the cited entry is silent", () => {
  for (const t of TEXTILES) {
    assert.equal(
      t.community,
      null,
      `${t.id} must not assert a community that the cited entry does not state`
    );
    assert.match(t.communityNote, /not asserted|not named/i);
  }
});

test("no colour is claimed as traditional", () => {
  for (const t of TEXTILES) {
    assert.equal(t.colorways, null, `${t.id} must not enumerate traditional colours`);
    assert.match(t.colorwayNote, /not stated|does not enumerate|no .* claimed/i);
  }
  assert.match(COLORWAY_DISCLAIMER, /not a statement that this shade is a traditional dye/i);
});

test("technique descriptions stay specific to the cited example", () => {
  const byId = Object.fromEntries(TEXTILES.map((t) => [t.id, t]));
  assert.match(byId["sambalpuri-ikat"].technique, /double ikat/i);
  assert.match(byId["sambalpuri-ikat"].motifs, /Bichitrapuri/);
  assert.match(byId["bomkai-sonepuri"].technique, /extra-warp border/i);
  assert.match(byId["bomkai-sonepuri"].technique, /extra-weft/i);
  assert.match(byId.kotpad.technique, /Aal-root/i);
  assert.match(byId["berhampur-patta"].technique, /Phoda Kumbha/i);
  assert.match(byId["berhampur-patta"].technique, /Salari/i);
});

test("each textile warns against generalising its motifs", () => {
  for (const t of TEXTILES) {
    assert.ok(t.motifCaveat.length > 20, `${t.id} needs a motif caveat`);
    assert.match(t.motifCaveat, /not generalis|only|no individual motifs/i);
  }
});

test("Bomkai explicitly warns that variants differ", () => {
  const bomkai = TEXTILES.find((t) => t.id === "bomkai-sonepuri");
  assert.match(bomkai.motifCaveat, /do not assume every Bomkai looks the same/i);
});

test("Kotpad warns against vague 'tribal' labelling", () => {
  const kotpad = TEXTILES.find((t) => t.id === "kotpad");
  assert.match(kotpad.communityNote, /tribal pattern/i);
});

test("the pilot notice explains that the selection is not final", () => {
  assert.match(PILOT_NOTICE, /not locked/i);
  assert.match(PILOT_NOTICE, /two or three/i);
  assert.ok(pilotTextiles().length >= 2 && pilotTextiles().length <= 4);
});

test("size charts are labelled illustrative and never authoritative", () => {
  for (const chart of Object.values(SIZE_CHARTS)) {
    assert.match(chart.label, /illustrative demo measurements/i);
    assert.match(chart.disclaimer, /confirm with the artisan/i);
    assert.equal(chart.unit, "inches");
    assert.ok(chart.rows.length >= 5);
    // Every row must have a value for every column.
    for (const row of chart.rows) {
      assert.equal(row.length, chart.columns.length, `${chart.id} row width mismatch`);
      for (const cell of row) assert.ok(String(cell).length > 0);
    }
  }
});

test("every garment points at a real size chart", () => {
  for (const g of GARMENTS) {
    assert.ok(SIZE_CHARTS[g.chartId], `${g.id} references a missing chart`);
  }
});

test("colourways are styling choices with usable contrast metadata", () => {
  for (const c of COLORWAYS) {
    assert.match(c.hex, /^#[0-9a-f]{6}$/i);
    assert.match(c.onHex, /^#[0-9a-f]{6}$/i);
  }
});
