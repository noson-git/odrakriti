/**
 * Odrakriti — Design asset library (demo placeholders only).
 * ------------------------------------------------------------------
 * WHY THIS FILE IS NEARLY EMPTY OF "MOTIFS"
 *
 * A curated design must come from a *permitted, artisan-approved* design
 * library. This project has no such library yet: no permission has been
 * obtained from any artisan, cooperative, or rights holder, and no
 * photograph from the Ministry of Textiles source PDF may be reused.
 *
 * So the demo library deliberately contains ONLY:
 *   1. Plain / undyed / solid fabric fields — these claim no motif at all,
 *      so they need no heritage permission.
 *   2. Explicit "placeholder" slots that stand in for where a real,
 *      approved motif asset would sit once permission is confirmed.
 *
 * No heritage motif is drawn, generated, or approximated anywhere in this
 * prototype. Nothing here may be described as authentic handloom output.
 */

export const ASSET_KIND = {
  PLAIN: "plain", // a real, unambiguous option: fabric with no motif
  PLACEHOLDER: "placeholder", // stands in for an approved motif asset that does not exist yet
};

export const DESIGN_ASSETS = [
  {
    id: "ASSET-PLAIN-01",
    name: "Plain undyed cotton field",
    kind: ASSET_KIND.PLAIN,
    textileId: null,
    motifClaim: "none",
    approval: "not-required",
    approvalLabel: "No heritage motif used",
    note: "Plain fabric field. Makes no claim about any textile tradition.",
    render: "plain",
    swatch: "#efe7d8",
  },
  {
    id: "ASSET-PLAIN-02",
    name: "Solid single-colour field",
    kind: ASSET_KIND.PLAIN,
    textileId: null,
    motifClaim: "none",
    approval: "not-required",
    approvalLabel: "No heritage motif used",
    note: "Solid field in the chosen styling colourway. Makes no claim about any textile tradition.",
    render: "solid",
    swatch: "#2c3c66",
  },
  {
    id: "ASSET-PH-SAMB-01",
    name: "Placeholder — Sambalpuri Ikat motif asset (withheld)",
    kind: ASSET_KIND.PLACEHOLDER,
    textileId: "sambalpuri-ikat",
    motifClaim: "pending",
    approval: "pending",
    approvalLabel: "Permission pending — asset withheld",
    note:
      "Placeholder slot only. The real motif asset cannot be shown until the artisan, cooperative, or rights holder grants permission. This tile intentionally displays no motif.",
    render: "placeholder",
    swatch: "#d8cfc0",
  },
  {
    id: "ASSET-PH-BOMKAI-01",
    name: "Placeholder — Bomkai motif asset (withheld)",
    kind: ASSET_KIND.PLACEHOLDER,
    textileId: "bomkai-sonepuri",
    motifClaim: "pending",
    approval: "pending",
    approvalLabel: "Permission pending — asset withheld",
    note:
      "Placeholder slot only. Displays no motif. Requires permission before any imagery is used.",
    render: "placeholder",
    swatch: "#d8cfc0",
  },
  {
    id: "ASSET-PH-KOTPAD-01",
    name: "Placeholder — Kotpad motif asset (withheld)",
    kind: ASSET_KIND.PLACEHOLDER,
    textileId: "kotpad",
    motifClaim: "pending",
    approval: "pending",
    approvalLabel: "Permission pending — asset withheld",
    note:
      "Placeholder slot only. Displays no motif. Requires permission before any imagery is used.",
    render: "placeholder",
    swatch: "#d8cfc0",
  },
  {
    id: "ASSET-PH-PATTA-01",
    name: "Placeholder — Berhampur Patta motif asset (withheld)",
    kind: ASSET_KIND.PLACEHOLDER,
    textileId: "berhampur-patta",
    motifClaim: "pending",
    approval: "pending",
    approvalLabel: "Permission pending — asset withheld",
    note:
      "Placeholder slot only. Displays no motif. Requires permission before any imagery is used.",
    render: "placeholder",
    swatch: "#d8cfc0",
  },
];

export function getAsset(id) {
  return DESIGN_ASSETS.find((a) => a.id === id) || null;
}

/** Assets usable by the buyer-facing design picker for a given textile. */
export function assetsForTextile(textileId) {
  return DESIGN_ASSETS.filter(
    (a) => a.textileId === null || a.textileId === textileId
  );
}

/** Only plain fields may be described as production-ready without permission. */
export function isPlainAsset(asset) {
  return !!asset && asset.kind === ASSET_KIND.PLAIN;
}

export const CONCEPT_WARNING =
  "Concept only — artisan review required.";

export const PLACEHOLDER_WARNING =
  "This tile is a placeholder. No heritage motif is shown, because no motif asset has been approved for public use.";
