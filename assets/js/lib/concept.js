/**
 * Odrakriti — AI-assisted concept variations (DEMO LOGIC, NO LIVE MODEL).
 * ------------------------------------------------------------------
 * WHAT THIS IS
 *   A transparent, deterministic, rule-based generator. There is no model
 *   call, no network request, and no trained component. It is labelled as
 *   a demo everywhere it appears in the UI.
 *
 * WHAT IT IS ALLOWED TO DO
 *   - Arrange assets that already exist in the supplied approved library.
 *   - Vary permitted styling choices: silhouette, placement, colourway,
 *     scale of the placement panel.
 *
 * WHAT IT MUST NEVER DO
 *   - Invent, alter, approximate, or reproduce a heritage motif.
 *   - Emit an asset id that was not passed in.
 *
 * `assertNoInventedAssets()` enforces the last point and is covered by a
 * unit test (tests/concept.test.mjs).
 */

export const ENGINE = {
  id: "demo-rule-based-v1",
  kind: "simulated",
  live: false,
  description:
    "Simulated concept engine. Deterministic rules only — no live AI model is running, and no motif is generated.",
};

export const CONCEPT_LABEL = "Concept only — artisan review required.";

const PANEL_SCALES = ["small", "medium", "large"];

const CONCEPT_NOTES = {
  casual:
    "Everyday silhouette: relaxed body, panel kept mid-scale so the garment reads as daily wear.",
  streetwear:
    "Streetwear reading: dropped shoulder, panel pushed large, contrast rib suggested at cuff and neck.",
  minimal:
    "Minimal reading: panel reduced to a single restrained accent, tonal trim, no contrast rib.",
};

/**
 * Generate concept variations.
 *
 * @param {object}   cfg
 * @param {Array}    cfg.approvedAssets  Assets the artisan/library has cleared for use.
 * @param {string}   cfg.garmentId
 * @param {string}   cfg.styleId
 * @param {string[]} [cfg.colourwayIds]  Permitted colourways.
 * @param {string[]} [cfg.placementIds]  Permitted placements.
 * @param {number}   [cfg.limit]
 * @returns {Array}  Concept descriptors. Each carries `approvalRequired: true`.
 */
export function generateConcepts({
  approvedAssets = [],
  garmentId,
  styleId,
  colourwayIds = [],
  placementIds = [],
  limit = 3,
} = {}) {
  if (!Array.isArray(approvedAssets) || approvedAssets.length === 0) {
    return [];
  }
  if (!garmentId || !styleId) return [];

  const ids = approvedAssets.map((a) => a && a.id).filter(Boolean);
  const concepts = [];

  // Deterministic interleaving: walk assets, placements, colourways, scales
  // on independent strides so combinations differ without any randomness.
  for (let i = 0; i < Math.max(limit, 1); i += 1) {
    const assetId = ids[i % ids.length];
    const placementId = placementIds.length ? placementIds[(i * 1) % placementIds.length] : null;
    const colourwayId = colourwayIds.length ? colourwayIds[(i * 2) % colourwayIds.length] : null;
    const panelScale = PANEL_SCALES[(i + strideFor(styleId)) % PANEL_SCALES.length];

    concepts.push({
      id: `CONCEPT-${garmentId}-${i + 1}`,
      engine: ENGINE.id,
      engineKind: ENGINE.kind,
      approvalRequired: true,
      warning: CONCEPT_LABEL,
      assetId,
      garmentId,
      styleId,
      placementId,
      colourwayId,
      panelScale,
      motifInvented: false,
      rationale: CONCEPT_NOTES[styleId] || CONCEPT_NOTES.casual,
      arrangementNote:
        "Arranges an existing library asset. No motif was drawn, altered, or generated.",
    });
  }
  return concepts;
}

function strideFor(styleId) {
  if (styleId === "streetwear") return 2;
  if (styleId === "minimal") return 1;
  return 0;
}

/**
 * Guard rail: every asset referenced by a concept must exist in the
 * approved list. If this ever returns violations, the UI must refuse to
 * show the concept.
 */
export function assertNoInventedAssets(concepts, approvedAssets) {
  const allowed = new Set((approvedAssets || []).map((a) => a && a.id).filter(Boolean));
  const violations = [];
  for (const c of concepts || []) {
    if (c.assetId && !allowed.has(c.assetId)) violations.push(c.assetId);
  }
  return violations;
}

/**
 * Honest capability statement rendered next to the concept controls, so
 * nobody mistakes the demo for a live generative model.
 */
export function engineDisclosure(approvedAssetCount) {
  return {
    live: false,
    summary:
      "Simulated concept engine — deterministic rules, no live AI model, no network calls.",
    capability:
      "It can only re-arrange assets already cleared for use, and vary silhouette, placement, colourway, and panel scale.",
    restriction:
      "It cannot invent, alter, or copy a heritage motif. If the approved library is empty, it returns nothing.",
    approvedAssetCount,
  };
}
