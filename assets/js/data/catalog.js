/**
 * Odrakriti — Catalog entries (MODULAR).
 * ------------------------------------------------------------------
 * Entries are derived from the pilot textile list, so narrowing the
 * textile scope in data/textiles.js automatically narrows the catalog.
 * Nothing is hardcoded to all four traditions.
 *
 * FABRICATION HONESTY
 *   No entry claims "handwoven" by default. A plain fabric field is
 *   labelled plain; anything carrying a motif reference is
 *   "method-unconfirmed" until an artisan confirms the production method.
 *   Nothing here is a printed adaptation dressed up as handloom.
 */

import { pilotTextiles } from "./textiles.js";
import { DESIGN_ASSETS, ASSET_KIND } from "./assets.js";

/** Which garment/style pairings each tradition is demoed in. */
const OFFERINGS = [
  { garmentId: "kurti", styleId: "minimal", offering: "ready-made" },
  { garmentId: "shirt", styleId: "casual", offering: "ready-made" },
  { garmentId: "tshirt", styleId: "streetwear", offering: "custom-concept" },
  { garmentId: "trousers", styleId: "minimal", offering: "custom-concept" },
];

function assetFor(textileId, offering) {
  if (offering === "ready-made") {
    // A ready-made demo item can only use a plain field, because no motif
    // asset has been approved.
    return DESIGN_ASSETS.find((a) => a.kind === ASSET_KIND.PLAIN) || null;
  }
  return (
    DESIGN_ASSETS.find((a) => a.textileId === textileId) ||
    DESIGN_ASSETS.find((a) => a.kind === ASSET_KIND.PLAIN) ||
    null
  );
}

export function buildCatalog() {
  const textiles = pilotTextiles();
  const entries = [];
  for (const t of textiles) {
    for (const [i, o] of OFFERINGS.entries()) {
      const asset = assetFor(t.id, o.offering);
      const isPlain = asset ? asset.kind === ASSET_KIND.PLAIN : true;
      entries.push({
        id: `${t.id}-${o.garmentId}-${o.styleId}`,
        textileId: t.id,
        textileName: t.name,
        garmentId: o.garmentId,
        styleId: o.styleId,
        offering: o.offering,
        assetId: asset ? asset.id : null,
        /** 'plain' | 'unconfirmed' — never 'handwoven' without artisan sign-off. */
        fabrication: isPlain ? "plain" : "unconfirmed",
        candidate: !!t.candidate,
        permissionStatus: t.permission.status,
        order: i,
      });
    }
  }
  return entries;
}

export const CATALOG = buildCatalog();

export function getCatalogEntry(id) {
  return CATALOG.find((e) => e.id === id) || null;
}

/** Distinct filter values, derived (never hardcoded). */
export function filterFacets() {
  const by = (key) => {
    const seen = new Map();
    for (const e of CATALOG) {
      if (!seen.has(e[key])) seen.set(e[key], e[key]);
    }
    return Array.from(seen.keys());
  };
  return {
    textile: by("textileId"),
    garment: by("garmentId"),
    style: by("styleId"),
    offering: by("offering"),
  };
}

/**
 * Apply filters. Pure — unit-tested in tests/catalog.test.mjs.
 * `filters` values are arrays; an empty array means "no constraint".
 */
export function applyFilters(entries, filters = {}, query = "") {
  const q = String(query || "").trim().toLowerCase();
  return entries.filter((e) => {
    for (const key of ["textile", "garment", "style", "offering"]) {
      const active = filters[key];
      if (Array.isArray(active) && active.length && !active.includes(e[keyOf(key)])) {
        return false;
      }
    }
    if (!q) return true;
    const haystack = [e.textileName, e.garmentId, e.styleId, e.offering, e.id]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

function keyOf(facet) {
  return facet === "textile"
    ? "textileId"
    : facet === "garment"
      ? "garmentId"
      : facet === "style"
        ? "styleId"
        : "offering";
}

export const FACET_LABELS = {
  textile: "Verified craft",
  garment: "Garment type",
  style: "Style",
  offering: "Offering",
};

export const OFFERING_LABELS = {
  "ready-made": "Ready-made design",
  "custom-concept": "Custom concept",
};

export function offeringLabel(id) {
  return OFFERING_LABELS[id] || id;
}
