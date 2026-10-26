/**
 * CATALOG SCOPE & FILTERS.
 *
 * The catalog is derived from the textile list, so it must never silently
 * expand beyond whatever the student has selected — and nothing may claim
 * "handwoven" without artisan confirmation.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCatalog,
  applyFilters,
  CATALOG,
  getCatalogEntry,
  offeringLabel,
} from "../assets/js/data/catalog.js";
import { TEXTILES, pilotTextiles, SCOPE_LOCKED, PILOT_NOTICE } from "../assets/js/data/textiles.js";
import { GARMENTS, STYLE_DIRECTIONS } from "../assets/js/data/garments.js";

test("catalog scope is derived from the textile list, never hardcoded", () => {
  const catalog = buildCatalog();
  const textileIds = new Set(catalog.map((e) => e.textileId));
  const pilotIds = new Set(pilotTextiles().map((t) => t.id));
  assert.deepEqual(
    [...textileIds].sort(),
    [...pilotIds].sort(),
    "catalog must contain exactly the pilot textiles"
  );
});

test("no catalog entry claims handwoven fabrication", () => {
  for (const e of CATALOG) {
    assert.notEqual(
      e.fabrication,
      "handwoven",
      `${e.id} must not claim handwoven without artisan confirmation`
    );
    assert.ok(
      ["plain", "unconfirmed"].includes(e.fabrication),
      `${e.id} has an unexpected fabrication label`
    );
  }
});

test("every entry references a real garment, style and textile", () => {
  const garmentIds = new Set(GARMENTS.map((g) => g.id));
  const styleIds = new Set(STYLE_DIRECTIONS.map((s) => s.id));
  const textileIds = new Set(TEXTILES.map((t) => t.id));

  for (const e of CATALOG) {
    assert.ok(garmentIds.has(e.garmentId), `${e.id}: unknown garment`);
    assert.ok(styleIds.has(e.styleId), `${e.id}: unknown style`);
    assert.ok(textileIds.has(e.textileId), `${e.id}: unknown textile`);
    assert.ok(e.assetId, `${e.id}: missing asset reference`);
    assert.equal(typeof e.permissionStatus, "string");
  }
});

test("candidate flag propagates to every catalog entry", () => {
  for (const e of CATALOG) {
    const textile = TEXTILES.find((t) => t.id === e.textileId);
    assert.equal(e.candidate, !!textile.candidate);
  }
});

test("SCOPE_LOCKED stays false while the selection is open, and the notice says so", () => {
  assert.equal(SCOPE_LOCKED, false);
  assert.match(PILOT_NOTICE, /not locked/i);
  assert.match(PILOT_NOTICE, /pilot/i);
});

test("empty filters return the whole catalog", () => {
  assert.equal(applyFilters(CATALOG, {}).length, CATALOG.length);
  assert.equal(applyFilters(CATALOG, { textile: [], garment: [], style: [], offering: [] }).length, CATALOG.length);
});

test("a single-facet filter narrows to that facet", () => {
  const garmentId = CATALOG[0].garmentId;
  const result = applyFilters(CATALOG, { garment: [garmentId] });
  assert.ok(result.length > 0);
  for (const e of result) assert.equal(e.garmentId, garmentId);
});

test("multiple facets intersect rather than union", () => {
  const textileId = CATALOG[0].textileId;
  const garmentId = CATALOG[0].garmentId;
  const result = applyFilters(CATALOG, { textile: [textileId], garment: [garmentId] });
  for (const e of result) {
    assert.equal(e.textileId, textileId);
    assert.equal(e.garmentId, garmentId);
  }
  const single = applyFilters(CATALOG, { textile: [textileId] });
  assert.ok(result.length <= single.length, "intersection cannot exceed the single-facet count");
});

test("values within one facet union together", () => {
  const garments = [...new Set(CATALOG.map((e) => e.garmentId))];
  if (garments.length < 2) return;
  const result = applyFilters(CATALOG, { garment: garments.slice(0, 2) });
  const ids = new Set(result.map((e) => e.garmentId));
  assert.equal(ids.size, 2);
});

test("text search matches textile, garment, style and offering", () => {
  assert.ok(applyFilters(CATALOG, {}, "kurti").length > 0);
  assert.ok(applyFilters(CATALOG, {}, "minimal").length > 0);
  assert.ok(applyFilters(CATALOG, {}, "custom-concept").length > 0);
  const textileName = CATALOG[0].textileName.toLowerCase();
  assert.ok(applyFilters(CATALOG, {}, textileName).length > 0);
});

test("an impossible combination returns an empty list, not everything", () => {
  assert.deepEqual(applyFilters(CATALOG, { textile: ["no-such-textile"] }), []);
});

test("offering labels are human-readable", () => {
  assert.equal(offeringLabel("ready-made"), "Ready-made design");
  assert.equal(offeringLabel("custom-concept"), "Custom concept");
});

test("getCatalogEntry finds and misses cleanly", () => {
  assert.ok(getCatalogEntry(CATALOG[0].id));
  assert.equal(getCatalogEntry("does-not-exist"), null);
});
