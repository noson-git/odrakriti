/**
 * Odrakriti — Garment silhouettes, style directions, size charts.
 *
 * These are STYLING choices for a contemporary buyer. They are not claims
 * about traditional garment forms.
 *
 * All size numbers are illustrative demo measurements only.
 */

export const GARMENTS = [
  {
    id: "kurti",
    name: "Kurti",
    blurb: "Straight-cut tunic, hip length",
    silhouette: "tunic",
    chartId: "top-women",
  },
  {
    id: "shirt",
    name: "Shirt",
    blurb: "Full-sleeve camp collar shirt",
    silhouette: "shirt",
    chartId: "top-men",
  },
  {
    id: "tshirt",
    name: "T-shirt",
    blurb: "Relaxed crew neck",
    silhouette: "tee",
    chartId: "top-unisex",
  },
  {
    id: "trousers",
    name: "Trousers / Pajama",
    blurb: "Tapered drawstring bottom",
    silhouette: "trousers",
    chartId: "bottom-unisex",
  },
];

export const STYLE_DIRECTIONS = [
  {
    id: "casual",
    name: "Casual",
    blurb: "Everyday wear, relaxed fit, minimal trim",
  },
  {
    id: "streetwear",
    name: "Streetwear",
    blurb: "Oversized drop shoulder, contrast rib, bold placement",
  },
  {
    id: "minimal",
    name: "Minimal",
    blurb: "Clean lines, small accent panel, tonal finish",
  },
];

export const PLACEMENTS = [
  { id: "panel-front", name: "Front panel", blurb: "Centred panel across the chest" },
  { id: "yoke", name: "Shoulder yoke", blurb: "Across the upper back and shoulders" },
  { id: "hem-border", name: "Hem border", blurb: "Strip along the lower hem" },
  { id: "full-garment", name: "Full garment", blurb: "Fabric used for the whole garment" },
  { id: "pocket-detail", name: "Pocket / placket detail", blurb: "Small accent only" },
];

/**
 * Illustrative demo measurements ONLY.
 * Every value is a placeholder for demonstration; nothing here is a
 * standard, a certification, or an artisan's real measurement set.
 */
export const SIZE_CHARTS = {
  "top-women": {
    id: "top-women",
    label: "Kurti / women's top — illustrative demo measurements",
    unit: "inches",
    columns: ["Size", "Chest", "Waist", "Length", "Sleeve"],
    rows: [
      ["XS", "32", "26", "28", "21"],
      ["S", "34", "28", "29", "21.5"],
      ["M", "36", "30", "30", "22"],
      ["L", "38", "32", "31", "22.5"],
      ["XL", "40", "34", "32", "23"],
      ["XXL", "42", "36", "33", "23.5"],
    ],
    disclaimer:
      "Illustrative demo measurements — confirm with the artisan.",
  },
  "top-men": {
    id: "top-men",
    label: "Shirt — illustrative demo measurements",
    unit: "inches",
    columns: ["Size", "Chest", "Shoulder", "Length", "Sleeve"],
    rows: [
      ["S", "38", "17", "28", "23.5"],
      ["M", "40", "17.5", "29", "24"],
      ["L", "42", "18", "30", "24.5"],
      ["XL", "44", "18.5", "31", "25"],
      ["XXL", "46", "19", "32", "25.5"],
    ],
    disclaimer:
      "Illustrative demo measurements — confirm with the artisan.",
  },
  "top-unisex": {
    id: "top-unisex",
    label: "T-shirt (unisex) — illustrative demo measurements",
    unit: "inches",
    columns: ["Size", "Chest", "Length", "Shoulder"],
    rows: [
      ["XS", "34", "25", "15"],
      ["S", "36", "26", "16"],
      ["M", "40", "28", "17.5"],
      ["L", "44", "29", "19"],
      ["XL", "48", "30", "20.5"],
      ["XXL", "52", "31", "22"],
    ],
    disclaimer:
      "Illustrative demo measurements — confirm with the artisan.",
  },
  "bottom-unisex": {
    id: "bottom-unisex",
    label: "Trousers / pajama — illustrative demo measurements",
    unit: "inches",
    columns: ["Size", "Waist", "Hip", "Length"],
    rows: [
      ["XS", "26", "36", "37"],
      ["S", "28", "38", "38"],
      ["M", "30", "40", "39"],
      ["L", "32", "42", "40"],
      ["XL", "34", "44", "41"],
      ["XXL", "36", "46", "42"],
    ],
    disclaimer:
      "Illustrative demo measurements — confirm with the artisan.",
  },
};

export function getGarment(id) {
  return GARMENTS.find((g) => g.id === id) || null;
}

export function getStyle(id) {
  return STYLE_DIRECTIONS.find((s) => s.id === id) || null;
}

export function getPlacement(id) {
  return PLACEMENTS.find((p) => p.id === id) || null;
}

export function getChart(id) {
  return SIZE_CHARTS[id] || null;
}
