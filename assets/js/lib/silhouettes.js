/**
 * Odrakriti — neutral garment silhouettes (inline SVG).
 * ------------------------------------------------------------------
 * WHY THESE ARE PLAIN
 *
 * No photograph from the Ministry of Textiles source PDF is reproduced
 * anywhere in this prototype, and no heritage motif is drawn here. These
 * are generic garment outlines used as demo silhouettes. A placement
 * panel is shown as a plain tinted region, never as a pattern.
 *
 * If a real motif asset is ever approved, it would be dropped in as a
 * separate, clearly-credited layer — it would not be generated here.
 */

const PATHS = {
  tunic:
    "M85,50 C92,43 108,43 115,50 L140,58 L152,110 L134,116 L126,80 L131,202 L69,202 L74,80 L66,116 L48,110 L60,58 Z",
  shirt:
    "M85,48 L100,66 L115,48 L142,58 L154,112 L136,118 L128,84 L128,204 L72,204 L72,84 L64,118 L46,112 L58,58 Z",
  tee: "M86,50 C92,43 108,43 114,50 L142,62 L150,96 L132,104 L126,84 L126,196 L74,196 L74,84 L68,104 L50,96 L58,62 Z",
  trousers: "M72,38 L128,38 L135,110 L124,220 L104,220 L100,142 L96,220 L76,220 L65,110 Z",
};

/** Placement regions, expressed in the 200x240 silhouette space. */
const PLACEMENT_REGIONS = {
  "panel-front": { x: 74, y: 96, w: 52, h: 46 },
  yoke: { x: 66, y: 62, w: 68, h: 26 },
  "hem-border": { x: 69, y: 176, w: 62, h: 22 },
  "full-garment": { x: 46, y: 38, w: 108, h: 184 },
  "pocket-detail": { x: 106, y: 108, w: 18, h: 18 },
};

function shade(hex, factor) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex || "#efe7d8"));
  if (!m) return "#d8cfc0";
  const mix = (v) =>
    Math.max(0, Math.min(255, Math.round(v + (factor > 0 ? 255 - v : v) * factor)));
  const to = (v) => mix(parseInt(v, 16)).toString(16).padStart(2, "0");
  return `#${to(m[1])}${to(m[2])}${to(m[3])}`;
}

/**
 * Render a garment silhouette.
 *
 * @param {object} opts
 * @param {string} opts.silhouette  tunic | shirt | tee | trousers
 * @param {string} [opts.fill]      garment base colour
 * @param {string} [opts.placement] placement id -> plain tinted region
 * @param {boolean} [opts.placeholder] draw the "motif asset withheld" hatch
 * @param {string} [opts.title]     accessible title
 */
export function garmentSVG(opts = {}) {
  const {
    silhouette = "tunic",
    fill = "#efe7d8",
    placement = null,
    placeholder = false,
    title = "Neutral garment silhouette (demo placeholder — no motif shown)",
  } = opts;

  const d = PATHS[silhouette] || PATHS.tunic;
  const uid = `p${Math.random().toString(36).slice(2, 8)}`;
  const stroke = shade(fill, -0.45);
  const region = placement ? PLACEMENT_REGIONS[placement] : null;

  const pattern = placeholder
    ? `<pattern id="${uid}" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
         <rect width="10" height="10" fill="#e6ddd0"/>
         <line x1="0" y1="0" x2="0" y2="10" stroke="#b7a68f" stroke-width="4"/>
       </pattern>`
    : "";

  const panelFill = placeholder ? `url(#${uid})` : shade(fill, -0.12);
  const panel = region
    ? `<rect x="${region.x}" y="${region.y}" width="${region.w}" height="${region.h}" rx="3"
         fill="${panelFill}" stroke="${stroke}" stroke-width="1" opacity="${placeholder ? 1 : 0.85}"/>`
    : "";

  const details =
    silhouette === "shirt"
      ? `<path d="M85,48 L74,64 L100,66 L126,64 L115,48" fill="none" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round"/>
         <line x1="100" y1="66" x2="100" y2="204" stroke="${stroke}" stroke-width="1.2" stroke-dasharray="3 4"/>`
      : silhouette === "trousers"
        ? `<line x1="72" y1="52" x2="128" y2="52" stroke="${stroke}" stroke-width="1.4"/>`
        : `<path d="M85,50 C92,58 108,58 115,50" fill="none" stroke="${stroke}" stroke-width="1.4"/>`;

  return `<svg viewBox="0 0 200 240" role="img" aria-label="${escapeXml(title)}" xmlns="http://www.w3.org/2000/svg">
    ${pattern}
    <path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>
    ${panel}
    ${details}
  </svg>`;
}

/** A clearly non-motif placeholder tile for a withheld asset. */
export function placeholderTileSVG(label = "Motif asset withheld") {
  const uid = `h${Math.random().toString(36).slice(2, 8)}`;
  return `<svg viewBox="0 0 120 120" role="img" aria-label="${escapeXml(label)}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="${uid}" patternUnits="userSpaceOnUse" width="12" height="12" patternTransform="rotate(45)">
        <rect width="12" height="12" fill="#e6ddd0"/>
        <line x1="0" y1="0" x2="0" y2="12" stroke="#b7a68f" stroke-width="5"/>
      </pattern>
    </defs>
    <rect x="6" y="6" width="108" height="108" rx="6" fill="url(#${uid})" stroke="#a08f78" stroke-width="2"/>
    <rect x="24" y="46" width="72" height="28" rx="4" fill="#fffdf9" stroke="#a08f78" stroke-width="1"/>
    <text x="60" y="64" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#4a3f36">WITHHELD</text>
  </svg>`;
}

/** Fabric swatch (plain field only — never a motif). */
export function swatchSVG(hex, label) {
  return `<svg viewBox="0 0 60 60" role="img" aria-label="${escapeXml(label)}" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="58" height="58" rx="6" fill="${hex}" stroke="#c6b6a0" stroke-width="1.5"/>
  </svg>`;
}

function escapeXml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const SILHOUETTES = Object.keys(PATHS);
