/**
 * CONCEPT ENGINE GUARD RAILS.
 *
 * The engine may arrange approved assets and vary styling choices. It must
 * never invent, alter, or copy a heritage motif — and it must never emit an
 * asset id that was not passed in.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  generateConcepts,
  assertNoInventedAssets,
  engineDisclosure,
  ENGINE,
  CONCEPT_LABEL,
} from "../assets/js/lib/concept.js";
import { DESIGN_ASSETS, ASSET_KIND } from "../assets/js/data/assets.js";

const approved = DESIGN_ASSETS;

test("the engine is disclosed as simulated, not live", () => {
  assert.equal(ENGINE.live, false);
  assert.equal(ENGINE.kind, "simulated");
  const d = engineDisclosure(3);
  assert.equal(d.live, false);
  assert.equal(d.approvedAssetCount, 3);
});

test("an empty approved library yields nothing rather than invented motifs", () => {
  assert.deepEqual(generateConcepts({ approvedAssets: [], garmentId: "kurti", styleId: "minimal" }), []);
});

test("a missing garment or style yields nothing", () => {
  assert.deepEqual(generateConcepts({ approvedAssets: approved }), []);
  assert.deepEqual(
    generateConcepts({ approvedAssets: approved, garmentId: "kurti" }),
    []
  );
});

test("every generated concept references only a supplied asset", () => {
  const concepts = generateConcepts({
    approvedAssets: approved,
    garmentId: "tshirt",
    styleId: "streetwear",
    colourwayIds: ["ivory", "indigo", "terracotta"],
    placementIds: ["panel-front", "yoke", "hem-border"],
    limit: 6,
  });
  assert.ok(concepts.length > 0, "concepts were produced");

  const violations = assertNoInventedAssets(concepts, approved);
  assert.deepEqual(violations, [], `invented asset ids: ${violations.join(", ")}`);

  const allowed = new Set(approved.map((a) => a.id));
  for (const c of concepts) {
    assert.ok(allowed.has(c.assetId), `${c.assetId} must exist in the approved library`);
  }
});

test("the guard actually catches an invented asset id", () => {
  const bogus = [{ id: "CONCEPT-X", assetId: "ASSET-MADE-UP-999" }];
  const violations = assertNoInventedAssets(bogus, approved);
  assert.deepEqual(violations, ["ASSET-MADE-UP-999"]);
});

test("every concept is marked as requiring artisan review", () => {
  const concepts = generateConcepts({
    approvedAssets: approved,
    garmentId: "kurti",
    styleId: "minimal",
    limit: 3,
  });
  for (const c of concepts) {
    assert.equal(c.approvalRequired, true);
    assert.equal(c.warning, CONCEPT_LABEL);
    assert.equal(c.motifInvented, false);
  }
});

test("output is deterministic — no randomness between runs", () => {
  const cfg = {
    approvedAssets: approved,
    garmentId: "shirt",
    styleId: "casual",
    colourwayIds: ["ivory", "indigo", "sage"],
    placementIds: ["yoke", "panel-front"],
    limit: 3,
  };
  const a = generateConcepts(cfg);
  const b = generateConcepts(cfg);
  assert.deepEqual(a, b);
});

test("the engine only varies permitted styling choices", () => {
  const concepts = generateConcepts({
    approvedAssets: approved,
    garmentId: "tshirt",
    styleId: "streetwear",
    colourwayIds: ["indigo"],
    placementIds: ["panel-front"],
    limit: 3,
  });
  for (const c of concepts) {
    assert.equal(c.garmentId, "tshirt");
    assert.equal(c.styleId, "streetwear");
    assert.equal(c.colourwayId, "indigo", "constrained to the permitted colourway");
    assert.equal(c.placementId, "panel-front", "constrained to the permitted placement");
    assert.ok(["small", "medium", "large"].includes(c.panelScale));
  }
});

test("no asset in the library claims a fabricated motif", () => {
  for (const a of DESIGN_ASSETS) {
    assert.ok(
      a.motifClaim === "none" || a.motifClaim === "pending",
      `${a.id} must not assert a motif`
    );
    assert.ok(
      a.kind === ASSET_KIND.PLAIN || a.kind === ASSET_KIND.PLACEHOLDER,
      `${a.id} must be plain or an explicit placeholder`
    );
    if (a.kind === ASSET_KIND.PLAIN) {
      assert.equal(a.approval, "not-required");
    } else {
      assert.equal(a.approval, "pending");
    }
  }
});
