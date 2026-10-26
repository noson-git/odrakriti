/**
 * Odrakriti — shared UI components (return HTML strings).
 *
 * Every status is expressed with icon + text. Colour is never the only
 * signal, per the accessibility checklist.
 */

import { icon } from "../lib/icons.js";
import { esc } from "../lib/dom.js";
import { TEXTILES, SOURCE_PDF } from "../data/textiles.js";
import { ASSET_KIND, getAsset } from "../data/assets.js";
import { garmentSVG, placeholderTileSVG } from "../lib/silhouettes.js";
import { getColorway } from "../data/colorways.js";
import { STATUS_META } from "../lib/requests.js";

/* ---------------- Badges ---------------- */

export function badge(tone, iconName, text) {
  const tones = ["review", "ok", "no", "info", "neutral", "concept"];
  const safe = tones.includes(tone) ? tone : "neutral";
  return `<span class="badge badge--${safe}">${icon(iconName, { size: 14 })}<span>${esc(text)}</span></span>`;
}

export function statusBadge(status) {
  const meta = STATUS_META[status] || STATUS_META.submitted;
  return badge(meta.tone, meta.icon, meta.label);
}

export function conceptBadge() {
  return badge("concept", "sparkles", "Concept only — artisan review required");
}

export function permissionBadge(status) {
  if (status === "pending") return badge("review", "lock", "Permission pending");
  if (status === "granted") return badge("ok", "checkCircle", "Permission granted");
  return badge("neutral", "lock", "Permission status unknown");
}

export function fabricationBadge(kind) {
  if (kind === "handwoven") return badge("info", "layers", "Handwoven fabric");
  if (kind === "printed") return badge("concept", "printer", "Printed adaptation — not handwoven");
  if (kind === "plain") return badge("neutral", "layers", "Plain fabric — no motif");
  return badge("review", "question", "Fabric method not confirmed");
}

/* ---------------- Callouts ---------------- */

export function callout(tone, iconName, title, bodyHtml) {
  return `<div class="callout callout--${tone}" role="note">
    <span class="callout__icon">${icon(iconName, { size: 20 })}</span>
    <div class="callout__body">
      <h4>${esc(title)}</h4>
      ${bodyHtml}
    </div>
  </div>`;
}

export const CONCEPT_CALLOUT = callout(
  "concept",
  "sparkles",
  "Concept only — artisan review required",
  `<p class="small">This design was produced by a <strong>simulated</strong> concept engine (deterministic demo rules — no live AI model). It only re-arranges assets already in the demo library and varies styling choices. An artisan must approve, revise, or reject feasibility before any price is shown.</p>`
);

export const PILOT_CALLOUT = callout(
  "review",
  "alert",
  "Pilot demo catalog — final textile selection is not locked",
  `<p class="small">The project scope is two or three handloom traditions. All entries below are recorded as <strong>candidates</strong>. Nothing here is a confirmed product line, and no artisan partnership is claimed.</p>`
);

export const PERMISSION_CALLOUT = callout(
  "warn",
  "lock",
  "Photographs withheld — permission not confirmed",
  `<p class="small">A source-matched citation from a government database is <strong>not</strong> authentication and <strong>not</strong> a reuse licence. No photograph from the source PDF is reproduced in this prototype. Imagery shown here is a neutral demo silhouette.</p>`
);

export const PROTOTYPE_CALLOUT = callout(
  "info",
  "info",
  "Demonstration prototype",
  `<p class="small">This is a Class 12 OSFIC demonstration prototype. There are no real orders, no payments, no production scheduling, and no verified artisan partnerships. Prices and delivery windows shown anywhere are demo values returned by the simulated artisan flow.</p>`
);

/* ---------------- Textile media ---------------- */

export function textileThumb(textile, opts = {}) {
  const silhouette = opts.silhouette || "tunic";
  const fill = opts.fill || "#efe7d8";
  const svg = garmentSVG({
    silhouette,
    fill,
    title: `${textile.name} — neutral demo silhouette. No motif is shown because no motif asset has been approved for use.`,
  });
  return svg;
}

export function placeholderThumb() {
  return placeholderTileSVG("Design asset withheld pending permission");
}

/* ---------------- Cards ---------------- */

export function textileCard(textile, { silhouette = "tunic", fill = "#efe7d8" } = {}) {
  return `<a class="card card--link" href="#/design/${esc(textile.id)}">
    <span class="card__media">${textileThumb(textile, { silhouette, fill })}</span>
    <span class="card__body">
      <span class="badge-row">
        ${badge("neutral", "leaf", "Candidate")}
        ${permissionBadge(textile.permission.status)}
      </span>
      <span class="card__title">${esc(textile.name)}</span>
      <span class="card__meta">${esc(textile.region)}</span>
      <span class="card__meta">${esc(textile.fibre)}</span>
    </span>
  </a>`;
}

/* ---------------- Provenance panel ---------------- */

export function provenancePanel(textile) {
  const c = textile.citation;
  const attributed = c.attributedTo
    ? `<p class="tiny muted">${esc(c.attributedTo)} — cited from a public government database as a source reference only. This is not a partnership, an endorsement, or confirmation of participation in this project.</p>`
    : `<p class="tiny muted">No individual is named in the cited entry, so none is named here.</p>`;

  return `<section class="provenance" aria-labelledby="prov-${esc(textile.id)}">
    <h3 id="prov-${esc(textile.id)}">${icon("shield", { size: 18 })} Provenance &amp; permissions</h3>
    <dl class="dl">
      <dt>Textile</dt><dd>${esc(textile.name)}</dd>
      <dt>Region</dt><dd>${esc(textile.region)}</dd>
      <dt>Community</dt><dd>${esc(textile.community || "Not stated in the cited entry — not asserted.")}</dd>
      <dt>Fibre</dt><dd>${esc(textile.fibre)}</dd>
      <dt>Technique</dt><dd>${esc(textile.technique)}</dd>
      <dt>Motifs</dt><dd>${esc(textile.motifs)}</dd>
      <dt>Colourways</dt><dd>${esc(textile.colorwayNote)}</dd>
      <dt>Source</dt>
      <dd>
        ${esc(SOURCE_PDF.publisher)} — <em>${esc(SOURCE_PDF.title)}</em>,
        p.&nbsp;${esc(String(c.page))}, ${esc(c.entry)}.
        <div class="citation">${esc(SOURCE_PDF.url)}</div>
      </dd>
      <dt>Permission</dt>
      <dd>
        ${permissionBadge(textile.permission.status)}
        <p class="small" style="margin-top:.4rem">${esc(textile.permission.detail)}</p>
      </dd>
    </dl>
    <div class="divider"></div>
    <p class="small"><strong>Technique detail (this example only):</strong> ${esc(textile.techniqueDetail)}</p>
    <p class="small muted">${esc(textile.motifCaveat)}</p>
    <p class="small muted">${esc(textile.communityNote)}</p>
    ${attributed}
    <p class="tiny muted">${esc(SOURCE_PDF.reVerifyNote)}</p>
  </section>`;
}

/* ---------------- Asset tiles ---------------- */

export function assetTile(asset, { selected = false, nameAttr = "assetId" } = {}) {
  const isPlaceholder = asset.kind === ASSET_KIND.PLACEHOLDER;
  const art = isPlaceholder ? placeholderTileSVG(`${asset.name} — withheld`) : "";
  const thumb = isPlaceholder
    ? art
    : garmentSVG({
        silhouette: "tee",
        fill: asset.swatch,
        title: `${asset.name} — plain fabric field, no motif`,
      });
  const tone = isPlaceholder ? "review" : "ok";
  const icon2 = isPlaceholder ? "lock" : "checkCircle";

  return `<button type="button" class="choice" role="radio" aria-checked="${selected ? "true" : "false"}"
      data-asset="${esc(asset.id)}" data-name="${esc(nameAttr)}">
    <span class="choice__thumb">${thumb}</span>
    <span>${esc(asset.name)}</span>
    <span class="choice__note">${badge(tone, icon2, asset.approvalLabel)}</span>
    <span class="choice__check">${icon("check", { size: 18 })}</span>
  </button>`;
}

/* ---------------- Size chart ---------------- */

export function sizeChartTable(chart) {
  if (!chart) return "";
  const head = chart.columns.map((c) => `<th scope="col">${esc(c)}</th>`).join("");
  const body = chart.rows
    .map(
      (row, i) =>
        `<tr>${row
          .map(
            (cell, j) =>
              j === 0
                ? `<th scope="row">${esc(cell)}</th>`
                : `<td>${esc(cell)}</td>`
          )
          .join("")}</tr>`
    )
    .join("");

  return `<div class="table-wrap">
    <table>
      <caption>${esc(chart.label)} (${esc(chart.unit)})</caption>
      <thead><tr>${head}</tr></thead>
      <tbody>${body}</tbody>
    </table>
  </div>
  <p class="tiny muted" style="margin-top:.5rem">${icon("alert", { size: 13 })} ${esc(chart.disclaimer)}</p>`;
}

/* ---------------- Summary list ---------------- */

export function summaryList(items) {
  return `<dl class="dl">${items
    .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`)
    .join("")}</dl>`;
}

/** Colourway swatch buttons. */
export function swatchButtons(colourways, selectedId) {
  return `<div class="swatch-list" role="radiogroup" aria-label="Styling colourway">
    ${colourways
      .map(
        (c) => `<button type="button" class="swatch" role="radio"
          aria-checked="${c.id === selectedId ? "true" : "false"}" data-colourway="${esc(c.id)}">
          <span class="swatch__dot" style="background:${esc(c.hex)}"></span>
          <span>${esc(c.name)}</span>
        </button>`
      )
      .join("")}
  </div>`;
}

export function textileOptions(selectedId) {
  return TEXTILES.map(
    (t) =>
      `<option value="${esc(t.id)}"${t.id === selectedId ? " selected" : ""}>${esc(t.name)}${
        t.candidate ? " (candidate)" : ""
      }</option>`
  ).join("");
}

export function assetOptionsForRequest(assetId) {
  const a = getAsset(assetId);
  return a ? `${esc(a.id)} — ${esc(a.name)}` : "—";
}

export function previewArt({ garment, colourwayId, placementId, placeholder }) {
  const cw = getColorway(colourwayId);
  return garmentSVG({
    silhouette: garment?.silhouette || "tunic",
    fill: cw.hex,
    placement: placementId || null,
    placeholder: !!placeholder,
    title: `Demo preview — ${garment?.name || "garment"} in ${cw.name} colourway. Neutral silhouette; no heritage motif is shown.`,
  });
}
