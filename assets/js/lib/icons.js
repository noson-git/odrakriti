/**
 * Odrakriti — Inline SVG icon set.
 *
 * Hand-written 24x24 stroke icons in a single consistent family
 * (2px stroke, round caps/joins). No emoji are used anywhere as icons.
 * No external icon CDN is loaded.
 *
 * Usage: icon('check', { class: 'x', label: 'Done' })
 *   - label omitted  -> aria-hidden="true" (decorative, text sits beside it)
 *   - label provided -> role="img" + <title> (meaningful on its own)
 */

const P = {
  spool: '<path d="M6 3h12M6 21h12M7 3v18M17 3v18M7 8h10M7 16h10"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>',
  check: '<path d="M4.5 12.5l5 5 10-11"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="M8 12.4l2.7 2.7L16 9.6"/>',
  xCircle: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
  alert: '<path d="M12 4.5L2.8 20h18.4L12 4.5z"/><path d="M12 10v4.2M12 17.2v.2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8v.2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.4l3.4 2"/>',
  scissors: '<circle cx="6.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/><path d="M8.6 15.9L18 4M15.4 15.9L6 4"/>',
  ruler: '<rect x="2.5" y="8" width="19" height="8" rx="1.5"/><path d="M7 8v3M11 8v4.5M15 8v3M19 8v4.5"/>',
  tag: '<path d="M3.5 11.3V4.5a1 1 0 011-1h6.8a1 1 0 01.7.3l8.2 8.2a1 1 0 010 1.4l-6.8 6.8a1 1 0 01-1.4 0L3.8 12a1 1 0 01-.3-.7z"/><circle cx="8" cy="8" r="1.4"/>',
  doc: '<path d="M6 2.8h7.5L19 8.3V21a.8.8 0 01-.8.8H6a.8.8 0 01-.8-.8V3.6a.8.8 0 01.8-.8z"/><path d="M13.2 3v5.4H19M8.4 13h7M8.4 16.6h7"/>',
  printer: '<path d="M7 8.5V3.5h10v5"/><rect x="3.5" y="8.5" width="17" height="7.5" rx="1.5"/><path d="M7 13.5h10v7H7z"/><path d="M17.4 11.2v.2"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20.2a7.4 7.4 0 0114.4 0"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M2.8 19.6a6.4 6.4 0 0112.4 0"/><path d="M16 5.2a3.2 3.2 0 010 5.9M17.6 14.4a6.4 6.4 0 013.6 5.2"/>',
  sparkles: '<path d="M12 3.5l1.7 4.4 4.4 1.7-4.4 1.7L12 15.7l-1.7-4.4L5.9 9.6l4.4-1.7L12 3.5z"/><path d="M18.4 15.2l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/>',
  layers: '<path d="M12 3.2l8.4 4.3L12 11.8 3.6 7.5 12 3.2z"/><path d="M3.6 12.2L12 16.5l8.4-4.3M3.6 16.6L12 20.9l8.4-4.3"/>',
  shield: '<path d="M12 3.2l7 2.6v5.4c0 4.3-2.9 7.6-7 9.6-4.1-2-7-5.3-7-9.6V5.8l7-2.6z"/><path d="M9.2 12.2l2 2 3.6-4"/>',
  route: '<circle cx="6" cy="18" r="2.6"/><circle cx="18" cy="6" r="2.6"/><path d="M15.4 6H10a3.4 3.4 0 000 6.8h4a3.4 3.4 0 010 6.8H8.6"/>',
  inbox: '<path d="M3.5 13.5h4l1.4 2.6h6.2l1.4-2.6h4"/><path d="M5.6 4.5h12.8l2.1 9v5a1 1 0 01-1 1H4.5a1 1 0 01-1-1v-5l2.1-9z"/>',
  chat: '<path d="M20.5 12a7.6 7.6 0 01-8 7.6 8.6 8.6 0 01-3.2-.6L4 20.5l1.3-3.6A7.4 7.4 0 013.5 12 7.6 7.6 0 0111.5 4.4 7.6 7.6 0 0120.5 12z"/>',
  arrowRight: '<path d="M4.5 12h14M13 6.5l5.5 5.5L13 17.5"/>',
  arrowLeft: '<path d="M19.5 12h-14M11 6.5L5.5 12 11 17.5"/>',
  chevronDown: '<path d="M6 9.5l6 6 6-6"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  filter: '<path d="M3.5 5.5h17l-6.6 7.6v5.6l-3.8 2v-7.6L3.5 5.5z"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="1.6"/><circle cx="8.6" cy="9.6" r="1.6"/><path d="M4.4 17.4l4.8-4.6 3.4 3.2 2.8-2.4 4.2 3.8"/>',
  eye: '<path d="M2.6 12S6 5.8 12 5.8 21.4 12 21.4 12 18 18.2 12 18.2 2.6 12 2.6 12z"/><circle cx="12" cy="12" r="2.8"/>',
  eyeOff: '<path d="M4 4l16 16"/><path d="M9.6 5.9A9.6 9.6 0 0112 5.8c6 0 9.4 6.2 9.4 6.2a17 17 0 01-2.6 3.4M6.6 7.7A17 17 0 002.6 12s3.4 6.2 9.4 6.2a9.4 9.4 0 003.3-.6"/><path d="M10.2 10.3a2.8 2.8 0 003.6 3.7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4.5 6.5h15M9.5 6.5V4.8a1 1 0 011-1h3a1 1 0 011 1v1.7M6.5 6.5l.9 13a1 1 0 001 .9h7.2a1 1 0 001-.9l.9-13"/>',
  refresh: '<path d="M20 11.5A8 8 0 006.3 6.6L4 9"/><path d="M4 12.5a8 8 0 0013.7 4.9L20 15"/><path d="M4 4.5V9h4.5M20 19.5V15h-4.5"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="1.6"/><path d="M8 10.5V7.8a4 4 0 018 0v2.7"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3.2 9.8h17.6M3.2 14.2h17.6"/><path d="M12 3a15 15 0 010 18 15 15 0 010-18z"/>',
  handHeart: '<path d="M11.6 6.6l-.9.9-.9-.9a2.4 2.4 0 00-3.4 3.4l4.3 4.2 4.3-4.2a2.4 2.4 0 00-3.4-3.4z"/><path d="M4 16.5h4.5l2 1.6h5.6a1.6 1.6 0 000-3.2h-2.4"/>',
  palette: '<path d="M12 3.4a8.6 8.6 0 000 17.2c1.3 0 2-.9 2-1.8 0-1.5-1.4-1.6-1.4-2.9 0-.9.8-1.6 1.8-1.6h1.6a4.6 4.6 0 004.6-4.6c0-3.6-3.8-6.3-8.6-6.3z"/><circle cx="8" cy="10" r="1.1"/><circle cx="12" cy="7.6" r="1.1"/><circle cx="16" cy="10" r="1.1"/>',
  truck: '<path d="M3 6.5h11v10H3z"/><path d="M14 10h3.6l2.9 3v3.5H14z"/><circle cx="7" cy="18.4" r="1.9"/><circle cx="17" cy="18.4" r="1.9"/>',
  rupee: '<path d="M7 4.5h10M7 9h10M7 4.5c5 0 6.5 2.2 6.5 4.6 0 2.7-2.2 4.4-6.5 4.4l7 6"/>',
  bolt: '<path d="M13.2 3L5.5 13.4h5.3L10.2 21l7.7-10.4h-5.3L13.2 3z"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 014.9.6c0 1.7-2.5 2-2.5 3.6"/><path d="M12 17.2v.2"/>',
  leaf: '<path d="M20 4.5c0 8-4.6 12.4-10.4 12.4A5.6 5.6 0 014 11.3C4 6 9.6 4.5 20 4.5z"/><path d="M4.6 19.4C7 14 11 10.6 16 8.6"/>',
};

const NAMES = Object.keys(P);

export function icon(name, opts = {}) {
  const path = P[name];
  if (!path) {
    // Fail loudly in dev rather than silently rendering nothing.
    console.warn(`[odrakriti] unknown icon "${name}". Available: ${NAMES.join(", ")}`);
    return "";
  }
  const size = opts.size || 20;
  const cls = opts.class ? ` class="${opts.class}"` : "";
  const a11y = opts.label
    ? ` role="img" aria-label="${escapeAttr(opts.label)}"`
    : ' aria-hidden="true" focusable="false"';
  return `<svg${cls} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${a11y}>${path}</svg>`;
}

export function escapeAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const ICON_NAMES = NAMES;
