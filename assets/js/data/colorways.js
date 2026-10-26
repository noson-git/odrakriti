/**
 * Odrakriti — Styling colourways (demo).
 *
 * These are STYLING colour choices offered to a buyer. They are NOT
 * claims that any of these shades are traditional, natural-dye, or
 * historically associated with a given textile. The cited source entries
 * do not enumerate shades, so none are asserted.
 */

export const COLORWAYS = [
  { id: "ivory", name: "Ivory", hex: "#efe7d8", onHex: "#241e19" },
  { id: "indigo", name: "Indigo", hex: "#2c3c66", onHex: "#ffffff" },
  { id: "terracotta", name: "Terracotta", hex: "#b4472a", onHex: "#ffffff" },
  { id: "charcoal", name: "Charcoal", hex: "#33302c", onHex: "#ffffff" },
  { id: "sage", name: "Sage", hex: "#55674f", onHex: "#ffffff" },
  { id: "ochre", name: "Ochre", hex: "#8a5b12", onHex: "#ffffff" },
];

export const COLORWAY_DISCLAIMER =
  "Styling colourway shown on a demo silhouette. Not a statement that this shade is a traditional dye or is produced by any artisan.";

export function getColorway(id) {
  return COLORWAYS.find((c) => c.id === id) || COLORWAYS[0];
}
