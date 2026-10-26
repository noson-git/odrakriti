/**
 * Odrakriti — Customisation request wizard (buyer).
 *
 * Four steps, a live preview, and a draft that survives a refresh.
 * Submitting creates a request in the demo store and hands it to the
 * artisan portal. No price is ever produced on this side.
 */

import { icon } from "../lib/icons.js";
import { esc, $, $$, announce, focusElement } from "../lib/dom.js";
import { navigate } from "../lib/router.js";
import { getTextile } from "../data/textiles.js";
import {
  GARMENTS,
  STYLE_DIRECTIONS,
  PLACEMENTS,
  getGarment,
  getStyle,
  getPlacement,
  getChart,
} from "../data/garments.js";
import { COLORWAYS, getColorway, COLORWAY_DISCLAIMER } from "../data/colorways.js";
import { assetsForTextile, getAsset, ASSET_KIND, CONCEPT_WARNING } from "../data/assets.js";
import {
  createRequest,
  validateRequestInput,
  RequestError,
} from "../lib/requests.js";
import {
  generateConcepts,
  assertNoInventedAssets,
  engineDisclosure,
  ENGINE,
  CONCEPT_LABEL,
} from "../lib/concept.js";
import {
  badge,
  conceptBadge,
  fabricationBadge,
  permissionBadge,
  sizeChartTable,
  swatchButtons,
  callout,
  CONCEPT_CALLOUT,
} from "../components/ui.js";
import { garmentSVG, placeholderTileSVG } from "../lib/silhouettes.js";
import { upsertRequest } from "../lib/store.js";

const STEPS = [
  { n: 1, id: "garment", label: "Garment & style" },
  { n: 2, id: "design", label: "Design path" },
  { n: 3, id: "size", label: "Size & customisation" },
  { n: 4, id: "review", label: "Review & send" },
];

const DRAFT_KEY = (textileId) => `odrakriti.draft.${textileId}.v1`;

function loadDraft(textileId) {
  try {
    const raw = localStorage.getItem(DRAFT_KEY(textileId));
    if (raw) return JSON.parse(raw);
  } catch {
    /* storage unavailable — fall through to defaults */
  }
  return {
    textileId,
    step: 1,
    garmentId: null,
    styleId: null,
    designPath: null,
    assetId: null,
    conceptId: null,
    colourwayId: "ivory",
    placementId: null,
    fabricPreference: null,
    sizeOrMeasurement: "chart",
    size: null,
    measurements: { chest: "", waist: "", length: "", sleeve: "" },
    buyerName: "",
    buyerContact: "",
    notes: "",
  };
}

function saveDraft(draft) {
  try {
    localStorage.setItem(DRAFT_KEY(draft.textileId), JSON.stringify(draft));
  } catch {
    /* ignore */
  }
}

function clearDraft(draft) {
  try {
    localStorage.removeItem(DRAFT_KEY(draft.textileId));
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/* Render                                                              */
/* ------------------------------------------------------------------ */

export function requestPage(params, query = {}) {
  const textile = getTextile(params.textileId);
  if (!textile) {
    return `<section class="section"><div class="container container--narrow">
      <div class="empty"><p><strong>Textile reference not found.</strong></p>
      <p><a class="btn btn--ghost" href="#/explore">${icon("arrowLeft", { size: 16 })} Back to catalog</a></p></div>
    </div></section>`;
  }

  const draft = loadDraft(textile.id);
  if (query.step) draft.step = clampStep(Number(query.step));
  const step = draft.step;

  return `
  <section class="section">
    <div class="container">
      <nav aria-label="Breadcrumb" class="small" style="margin-bottom:var(--sp-5)">
        <a href="#/">Home</a> <span aria-hidden="true">/</span>
        <a href="#/design/${esc(textile.id)}">${esc(textile.shortName)}</a>
        <span aria-hidden="true">/</span> <span aria-current="page">Customisation request</span>
      </nav>

      <header style="margin-bottom:var(--sp-6)">
        <p class="eyebrow">Customisation request</p>
        <h1 style="font-size:var(--text-2xl)">Build your request for ${esc(textile.name)}</h1>
        <p class="lede">
          Step ${step} of ${STEPS.length} — ${esc(STEPS[step - 1].label)}. Nothing here produces a
          price. Your request goes to the artisan portal for feasibility review first.
        </p>
      </header>

      <ol class="steps" aria-label="Request progress">
        ${STEPS.map(
          (s) =>
            `<li ${s.n === step ? 'aria-current="step"' : ""} ${
              s.n < step ? 'data-done="true"' : ""
            }>${esc(s.label)}</li>`
        ).join("")}
      </ol>

      <div class="wizard">
        <div>
          <div data-error-summary></div>
          <form id="wizard-form" novalidate data-wizard data-step="${step}">
            ${
              step === 1
                ? stepGarment(draft, textile)
                : step === 2
                  ? stepDesign(draft, textile)
                  : step === 3
                    ? stepSize(draft, textile)
                    : stepReview(draft, textile)
            }
          </form>
        </div>

        <aside class="preview-sticky">
          <div class="preview" aria-label="Live preview">
            <div class="preview__stage" data-preview-stage>${previewArt(draft)}</div>
            <div class="preview__body" data-preview-body>${previewSummary(draft, textile)}</div>
          </div>
        </aside>
      </div>
    </div>
  </section>`;
}

function clampStep(n) {
  return Math.min(STEPS.length, Math.max(1, Number.isFinite(n) ? n : 1));
}

function previewArt(draft) {
  const garment = getGarment(draft.garmentId);
  const cw = getColorway(draft.colourwayId);
  const asset = getAsset(draft.assetId);
  const placeholder = asset && asset.kind === ASSET_KIND.PLACEHOLDER;
  return garmentSVG({
    silhouette: garment?.silhouette || "tunic",
    fill: cw.hex,
    placement: draft.placementId || null,
    placeholder,
    title: placeholder
      ? `Demo preview — ${garment?.name || "garment"} in ${cw.name}. The design asset is withheld pending permission, so no motif is shown.`
      : `Demo preview — ${garment?.name || "garment"} in ${cw.name}. Neutral silhouette; no heritage motif is shown.`,
  });
}

function previewSummary(draft, textile) {
  const garment = getGarment(draft.garmentId);
  const style = getStyle(draft.styleId);
  const cw = getColorway(draft.colourwayId);
  const placement = getPlacement(draft.placementId);
  const asset = getAsset(draft.assetId);

  const fabrication =
    draft.fabricPreference === "handwoven"
      ? fabricationBadge("handwoven")
      : draft.fabricPreference === "printed"
        ? fabricationBadge("printed")
        : fabricationBadge("unconfirmed");

  return `
    <div class="badge-row">
      ${badge("neutral", "leaf", textile.shortName)}
      ${draft.designPath === "concept" ? conceptBadge() : ""}
      ${fabrication}
    </div>
    <dl class="dl">
      <dt>Garment</dt><dd>${esc(garment?.name || "Not chosen yet")}</dd>
      <dt>Style</dt><dd>${esc(style?.name || "Not chosen yet")}</dd>
      <dt>Path</dt><dd>${
        draft.designPath === "curated"
          ? "Curated design"
          : draft.designPath === "concept"
            ? "AI-assisted concept (simulated)"
            : "Not chosen yet"
      }</dd>
      <dt>Asset</dt><dd>${asset ? `<span class="mono">${esc(asset.id)}</span>` : "—"}</dd>
      <dt>Colourway</dt><dd>${esc(cw.name)}</dd>
      <dt>Placement</dt><dd>${esc(placement?.name || "Not chosen yet")}</dd>
      <dt>Size</dt><dd>${
        draft.sizeOrMeasurement === "custom"
          ? "Custom measurements"
          : esc(draft.size || "Not chosen yet")
      }</dd>
    </dl>
    <p class="tiny muted">${esc(COLORWAY_DISCLAIMER)}</p>`;
}

/* ---------------- Step 1: garment & style ---------------- */

function stepGarment(draft) {
  return `
    <fieldset data-step-panel="1">
      <legend>1. Choose a garment</legend>
      <p class="field__hint">Styling choices for a contemporary buyer — not claims about traditional garment forms.</p>
      <div class="choice-grid" role="radiogroup" aria-label="Garment" style="margin-top:var(--sp-4)">
        ${GARMENTS.map(
          (g) => `<button type="button" class="choice" role="radio"
            aria-checked="${draft.garmentId === g.id ? "true" : "false"}"
            data-set="garmentId" data-value="${esc(g.id)}">
            <span class="choice__thumb">${garmentSVG({
              silhouette: g.silhouette,
              fill: "#efe7d8",
              title: `${g.name} silhouette`,
            })}</span>
            <span>${esc(g.name)}</span>
            <span class="choice__note">${esc(g.blurb)}</span>
            <span class="choice__check">${icon("check", { size: 18 })}</span>
          </button>`
        ).join("")}
      </div>
    </fieldset>

    <fieldset data-step-panel="1">
      <legend>2. Choose a style direction</legend>
      <div class="choice-grid" role="radiogroup" aria-label="Style direction" style="margin-top:var(--sp-3)">
        ${STYLE_DIRECTIONS.map(
          (s) => `<button type="button" class="choice" role="radio"
            aria-checked="${draft.styleId === s.id ? "true" : "false"}"
            data-set="styleId" data-value="${esc(s.id)}">
            <span>${icon("sparkles", { size: 20 })} ${esc(s.name)}</span>
            <span class="choice__note">${esc(s.blurb)}</span>
            <span class="choice__check">${icon("check", { size: 18 })}</span>
          </button>`
        ).join("")}
      </div>
    </fieldset>

    ${navButtons(draft, 1)}`;
}

/* ---------------- Step 2: design path ---------------- */

function stepDesign(draft, textile) {
  const assets = assetsForTextile(textile.id);
  const disclosure = engineDisclosure(assets.length);

  const concepts =
    draft.designPath === "concept"
      ? generateConcepts({
          approvedAssets: assets,
          garmentId: draft.garmentId || "kurti",
          styleId: draft.styleId || "casual",
          colourwayIds: COLORWAYS.map((c) => c.id),
          placementIds: PLACEMENTS.map((p) => p.id),
          limit: 3,
        })
      : [];

  const violations = assertNoInventedAssets(concepts, assets);
  const conceptSafe = violations.length === 0;

  return `
    <fieldset>
      <legend>1. Choose a design path</legend>
      <div class="choice-grid" role="radiogroup" aria-label="Design path" style="margin-top:var(--sp-3)">
        <button type="button" class="choice" role="radio"
          aria-checked="${draft.designPath === "curated" ? "true" : "false"}"
          data-set="designPath" data-value="curated">
          <span>${icon("grid", { size: 20 })} Curated design</span>
          <span class="choice__note">Pick an asset from the demo library directly.</span>
          <span class="choice__check">${icon("check", { size: 18 })}</span>
        </button>
        <button type="button" class="choice" role="radio"
          aria-checked="${draft.designPath === "concept" ? "true" : "false"}"
          data-set="designPath" data-value="concept">
          <span>${icon("sparkles", { size: 20 })} AI-assisted concept</span>
          <span class="choice__note">Simulated engine arranges approved assets into variations.</span>
          <span class="choice__check">${icon("check", { size: 18 })}</span>
        </button>
      </div>
    </fieldset>

    ${
      draft.designPath === "curated"
        ? `<fieldset>
            <legend>2. Pick a design asset</legend>
            <div class="choice-grid" role="radiogroup" aria-label="Design asset" style="margin-top:var(--sp-3)">
              ${assets
                .map((a) => {
                  const isPh = a.kind === ASSET_KIND.PLACEHOLDER;
                  const thumb = isPh
                    ? placeholderTileSVG(`${a.name} — withheld`)
                    : garmentSVG({ silhouette: "tee", fill: a.swatch, title: a.name });
                  return `<button type="button" class="choice" role="radio"
                    aria-checked="${draft.assetId === a.id ? "true" : "false"}"
                    data-set="assetId" data-value="${esc(a.id)}">
                    <span class="choice__thumb">${thumb}</span>
                    <span>${esc(a.name)}</span>
                    <span class="choice__note">${badge(
                      isPh ? "review" : "ok",
                      isPh ? "lock" : "checkCircle",
                      a.approvalLabel
                    )}</span>
                    <span class="choice__check">${icon("check", { size: 18 })}</span>
                  </button>`;
                })
                .join("")}
            </div>
            <p class="tiny muted" style="margin-top:var(--sp-4)">
              ${icon("info", { size: 13 })} A placeholder tile displays no motif. It marks where a real,
              permitted asset would sit once permission is confirmed.
            </p>
          </fieldset>`
        : ""
    }

    ${
      draft.designPath === "concept"
        ? `<fieldset>
            <legend>2. Pick a concept variation</legend>
            <div style="margin-bottom:var(--sp-4)">${CONCEPT_CALLOUT}</div>
            <div class="panel panel--alt" style="margin-bottom:var(--sp-4)">
              <p class="small"><strong>Engine:</strong> ${esc(disclosure.summary)}</p>
              <p class="small"><strong>What it can do:</strong> ${esc(disclosure.capability)}</p>
              <p class="small"><strong>What it cannot do:</strong> ${esc(disclosure.restriction)}</p>
              <p class="tiny muted">Approved assets available to it: ${esc(String(disclosure.approvedAssetCount))}.</p>
            </div>
            ${
              conceptSafe && concepts.length
                ? `<div class="choice-grid" role="radiogroup" aria-label="Concept variation">
                    ${concepts
                      .map((c) => {
                        const cw = getColorway(c.colourwayId);
                        const a = getAsset(c.assetId);
                        const isPh = a && a.kind === ASSET_KIND.PLACEHOLDER;
                        return `<button type="button" class="choice" role="radio"
                          aria-checked="${draft.conceptId === c.id ? "true" : "false"}"
                          data-concept="${esc(c.id)}"
                          data-concept-asset="${esc(c.assetId)}"
                          data-concept-colourway="${esc(c.colourwayId || "")}"
                          data-concept-placement="${esc(c.placementId || "")}">
                          <span class="choice__thumb">${garmentSVG({
                            silhouette: getGarment(draft.garmentId)?.silhouette || "tunic",
                            fill: cw.hex,
                            placement: c.placementId || null,
                            placeholder: isPh,
                            title: `${c.id} — concept preview, panel scale ${c.panelScale}`,
                          })}</span>
                          <span>${esc(c.id)}</span>
                          <span class="choice__note">
                            ${esc(cw.name)} · ${esc(getPlacement(c.placementId)?.name || "no placement")} · ${esc(c.panelScale)} panel
                          </span>
                          <span class="choice__note">${badge("concept", "sparkles", "Concept only")}</span>
                          <span class="choice__check">${icon("check", { size: 18 })}</span>
                        </button>`;
                      })
                      .join("")}
                  </div>
                  <p class="tiny muted" style="margin-top:var(--sp-4)">
                    Each variation re-arranges an existing library asset. Rationale for the selected
                    variation is shown in the preview panel.
                  </p>`
                : `<p class="small"><strong>No concept variations available.</strong> The approved
                    asset list for this textile is empty, so the engine returns nothing rather than
                    inventing a motif.</p>`
            }
          </fieldset>`
        : ""
    }

    ${draft.designPath ? stepStyling(draft) : ""}

    ${navButtons(draft, 2)}`;
}

function stepStyling(draft) {
  return `
    <fieldset>
      <legend>${draft.designPath === "concept" ? "3" : "3"}. Colourway &amp; placement</legend>
      <p class="field__hint">${esc(COLORWAY_DISCLAIMER)}</p>
      <div style="margin-top:var(--sp-3)">${swatchButtons(COLORWAYS, draft.colourwayId)}</div>

      <p class="filters__legend" style="margin-top:var(--sp-5)">Placement</p>
      <div class="choice-grid" role="radiogroup" aria-label="Placement">
        ${PLACEMENTS.map(
          (p) => `<button type="button" class="choice" role="radio"
            aria-checked="${draft.placementId === p.id ? "true" : "false"}"
            data-set="placementId" data-value="${esc(p.id)}">
            <span>${esc(p.name)}</span>
            <span class="choice__note">${esc(p.blurb)}</span>
            <span class="choice__check">${icon("check", { size: 18 })}</span>
          </button>`
        ).join("")}
      </div>
    </fieldset>

    <fieldset>
      <legend>4. Fabric / production preference</legend>
      <p class="field__hint">
        Handwoven and printed adaptation are different things. This preference is a request,
        not a confirmation — the artisan decides what is actually possible.
      </p>
      <div class="field" style="margin-top:var(--sp-3)">
        <label for="fabricPreference">Preferred production method</label>
        <select id="fabricPreference" name="fabricPreference" data-set="fabricPreference">
          <option value=""${!draft.fabricPreference ? " selected" : ""}>Let the artisan advise</option>
          <option value="handwoven"${draft.fabricPreference === "handwoven" ? " selected" : ""}>Handwoven fabric (subject to artisan confirmation)</option>
          <option value="printed"${draft.fabricPreference === "printed" ? " selected" : ""}>Printed adaptation — not handwoven</option>
        </select>
        <p class="field__hint">
          A concept variation is treated as a printed adaptation unless an artisan confirms a real handwoven production method.
        </p>
      </div>
    </fieldset>`;
}

/* ---------------- Step 3: size & customisation ---------------- */

function stepSize(draft, textile) {
  const garment = getGarment(draft.garmentId);
  const chart = getChart(garment?.chartId);

  return `
    <fieldset>
      <legend>1. Size</legend>
      <div class="row" style="margin-bottom:var(--sp-4)">
        <label class="check"><input type="radio" name="sizeMode" value="chart"
          data-set="sizeOrMeasurement" ${draft.sizeOrMeasurement === "chart" ? "checked" : ""}/>
          <span>Use a chart size</span></label>
        <label class="check"><input type="radio" name="sizeMode" value="custom"
          data-set="sizeOrMeasurement" ${draft.sizeOrMeasurement === "custom" ? "checked" : ""}/>
          <span>Send custom measurements</span></label>
      </div>

      ${sizeChartTable(chart)}

      ${
        draft.sizeOrMeasurement === "chart"
          ? `<div class="choice-grid" role="radiogroup" aria-label="Chart size" style="margin-top:var(--sp-4)">
              ${(chart?.rows || []).map(
                (row) => `<button type="button" class="choice" role="radio"
                  aria-checked="${draft.size === row[0] ? "true" : "false"}"
                  data-set="size" data-value="${esc(row[0])}">
                  <span>Size ${esc(row[0])}</span>
                  <span class="choice__note">${esc(row.slice(1).join(" / "))}</span>
                  <span class="choice__check">${icon("check", { size: 18 })}</span>
                </button>`
              ).join("")}
            </div>`
          : `<div class="form-grid" data-custom-measurements>
              ${["chest", "waist", "length", "sleeve"]
                .map(
                  (k) => `<div class="field">
                    <label for="m-${esc(k)}">${esc(k.charAt(0).toUpperCase() + k.slice(1))} (inches)</label>
                    <input class="input" id="m-${esc(k)}" name="m-${esc(k)}" type="number"
                      inputmode="decimal" min="0" step="0.25"
                      value="${esc(draft.measurements?.[k] || "")}" data-measure="${esc(k)}" />
                  </div>`
                )
                .join("")}
              <p class="tiny muted">${icon("alert", { size: 13 })} Illustrative demo measurements — confirm with the artisan.</p>
            </div>`
      }
    </fieldset>

    <fieldset>
      <legend>2. Notes for the artisan</legend>
      <div class="field">
        <label for="notes">Anything the artisan should know</label>
        <textarea id="notes" name="notes" data-set="notes"
          placeholder="Fit preference, occasion, deadline you are hoping for, questions about the technique…">${esc(draft.notes)}</textarea>
        <p class="field__hint">Optional. The artisan reads this before deciding feasibility.</p>
      </div>
    </fieldset>

    ${callout(
      "info",
      "info",
      "What happens next",
      `<p class="small">After you send this, the request appears in the demo artisan portal. An artisan marks it feasible, not feasible, or needing clarification — and only then can a price and delivery window be returned.</p>`
    )}

    ${navButtons(draft, 3)}`;
}

/* ---------------- Step 4: review & send ---------------- */

function stepReview(draft, textile) {
  const garment = getGarment(draft.garmentId);
  const style = getStyle(draft.styleId);
  const asset = getAsset(draft.assetId);
  const cw = getColorway(draft.colourwayId);
  const placement = getPlacement(draft.placementId);
  const isConcept = draft.designPath === "concept";

  return `
    <fieldset>
      <legend>Review your request</legend>
      <dl class="dl">
        <dt>Textile</dt><dd>${esc(textile.name)} ${badge("neutral", "leaf", "candidate")}</dd>
        <dt>Garment</dt><dd>${esc(garment?.name || "—")}</dd>
        <dt>Style</dt><dd>${esc(style?.name || "—")}</dd>
        <dt>Design path</dt><dd>${isConcept ? "AI-assisted concept (simulated)" : "Curated design"}</dd>
        <dt>Design asset</dt>
        <dd>${asset ? `<span class="mono">${esc(asset.id)}</span> — ${esc(asset.name)}<br/>${esc(asset.approvalLabel)}` : "—"}</dd>
        <dt>Concept</dt><dd>${isConcept ? `<span class="mono">${esc(draft.conceptId || "—")}</span> — ${esc(CONCEPT_WARNING)}` : "Not applicable"}</dd>
        <dt>Colourway</dt><dd>${esc(cw.name)} <span class="tiny muted">(styling choice)</span></dd>
        <dt>Placement</dt><dd>${esc(placement?.name || "—")}</dd>
        <dt>Fabrication</dt>
        <dd>${
          draft.fabricPreference === "handwoven"
            ? "Requested handwoven — subject to artisan confirmation"
            : draft.fabricPreference === "printed"
              ? "Printed adaptation — not handwoven"
              : "Artisan to advise"
        }</dd>
        <dt>Size</dt>
        <dd>${
          draft.sizeOrMeasurement === "custom"
            ? `Custom measurements: ${esc(measurementSummary(draft))}`
            : esc(draft.size ? `Size ${draft.size} (illustrative demo chart)` : "—")
        }</dd>
        <dt>Notes</dt><dd>${draft.notes ? esc(draft.notes) : "<span class='muted'>None</span>"}</dd>
      </dl>

      <div style="margin-top:var(--sp-5)">
        ${isConcept ? CONCEPT_CALLOUT : ""}
        ${permissionBadge(textile.permission.status)}
      </div>
    </fieldset>

    <fieldset>
      <legend>Your details (demo only)</legend>
      <p class="field__hint">No account is created and nothing is transmitted anywhere. This is stored in your browser for the demo.</p>
      <div class="form-grid">
        <div class="field" data-field="buyerName">
          <label for="buyerName">Name</label>
          <input class="input" id="buyerName" name="buyerName" type="text" autocomplete="name"
            value="${esc(draft.buyerName)}" data-set="buyerName" aria-describedby="buyerName-error" />
          <p class="field__error" id="buyerName-error">${icon("alert", { size: 15 })} <span data-error-text></span></p>
        </div>
        <div class="field" data-field="buyerContact">
          <label for="buyerContact">Email or phone</label>
          <input class="input" id="buyerContact" name="buyerContact" type="text"
            value="${esc(draft.buyerContact)}" data-set="buyerContact" aria-describedby="buyerContact-error" />
          <p class="field__error" id="buyerContact-error">${icon("alert", { size: 15 })} <span data-error-text></span></p>
        </div>
      </div>
      <p class="tiny muted">${icon("lock", { size: 13 })} Simulated contact details. No real message is sent.</p>
    </fieldset>

    ${callout(
      "warn",
      "alert",
      "No price yet — by design",
      `<p class="small">Submitting sends your request for artisan review. A price and an estimated delivery window can only appear after the artisan has reviewed feasibility and returned a quote.</p>`
    )}

    ${navButtons(draft, 4)}`;
}

function measurementSummary(draft) {
  const m = draft.measurements || {};
  const parts = Object.entries(m)
    .filter(([, v]) => String(v).trim() !== "")
    .map(([k, v]) => `${k} ${v}"`);
  return parts.length ? parts.join(", ") : "not entered";
}

function navButtons(draft, step) {
  const back =
    step > 1
      ? `<a class="btn btn--ghost" href="#/request/${esc(draft.textileId)}?step=${step - 1}">${icon("arrowLeft", { size: 16 })} Back</a>`
      : `<a class="btn btn--ghost" href="#/design/${esc(draft.textileId)}">${icon("arrowLeft", { size: 16 })} Cancel</a>`;

  const next =
    step < STEPS.length
      ? `<button type="submit" class="btn btn--accent" data-next>${icon("arrowRight", { size: 16 })} Continue</button>`
      : `<button type="submit" class="btn btn--accent" data-send>${icon("handHeart", { size: 16 })} Send for artisan review</button>`;

  return `<div class="btn-group" style="margin-top:var(--sp-5);justify-content:space-between">${back}${next}</div>`;
}

/* ------------------------------------------------------------------ */
/* Mount: wire up interactions                                         */
/* ------------------------------------------------------------------ */

export function mountWizard(params) {
  const textile = getTextile(params.textileId);
  const form = $("[data-wizard]");
  if (!textile || !form) return;

  const draft = loadDraft(textile.id);

  function persist(patch = {}) {
    Object.assign(draft, patch);
    saveDraft(draft);
  }

  function refreshPreview() {
    const stage = $("[data-preview-stage]");
    const body = $("[data-preview-body]");
    if (stage) stage.innerHTML = previewArt(draft);
    if (body) body.innerHTML = previewSummary(draft, textile);
  }

  function gotoStep(n) {
    const next = clampStep(n);
    persist({ step: next });
    navigate(`/request/${textile.id}?step=${next}`);
  }

  function showErrors(errors) {
    const holder = $("[data-error-summary]");
    const keys = Object.keys(errors);
    if (!holder) return;
    if (!keys.length) {
      holder.innerHTML = "";
      $$(".field.has-error", form).forEach((f) => f.classList.remove("has-error"));
      return;
    }
    holder.innerHTML = `<div class="error-summary" role="alert" tabindex="-1" aria-labelledby="err-title">
      <h4 id="err-title">${icon("alert", { size: 18 })} There is a problem</h4>
      <ul>${keys
        .map(
          (k) =>
            `<li><a href="#${esc(k)}" data-error-link="${esc(k)}">${esc(errors[k])}</a></li>`
        )
        .join("")}</ul>
    </div>`;
    for (const key of keys) {
      const field = form.querySelector(`[data-field="${key}"]`);
      if (field) {
        field.classList.add("has-error");
        const slot = field.querySelector("[data-error-text]");
        if (slot) slot.textContent = errors[key];
      }
    }
    const summary = holder.firstElementChild;
    focusElement(summary);
    announce(`There is a problem. ${keys.length} field${keys.length === 1 ? "" : "s"} need attention.`, "assertive");
  }

  /* --- choice buttons (radiogroup semantics) --- */
  form.addEventListener("click", (event) => {
    const conceptBtn = event.target.closest("[data-concept]");
    if (conceptBtn) {
      const group = conceptBtn.closest('[role="radiogroup"]');
      $$('[role="radio"]', group).forEach((b) => b.setAttribute("aria-checked", "false"));
      conceptBtn.setAttribute("aria-checked", "true");
      persist({
        designPath: "concept",
        conceptId: conceptBtn.dataset.concept,
        assetId: conceptBtn.dataset.conceptAsset || null,
        colourwayId: conceptBtn.dataset.conceptColourway || draft.colourwayId,
        placementId: conceptBtn.dataset.conceptPlacement || draft.placementId,
      });
      refreshPreview();
      const chosen = generateConcepts({
        approvedAssets: assetsForTextile(textile.id),
        garmentId: draft.garmentId || "kurti",
        styleId: draft.styleId || "casual",
        colourwayIds: COLORWAYS.map((c) => c.id),
        placementIds: PLACEMENTS.map((p) => p.id),
        limit: 3,
      }).find((c) => c.id === draft.conceptId);
      if (chosen) announce(`${chosen.id} selected. ${chosen.rationale} ${CONCEPT_WARNING}`);
      return;
    }

    const btn = event.target.closest("[data-set]");
    if (!btn || btn.tagName !== "BUTTON") return;
    const key = btn.dataset.set;
    const value = btn.dataset.value;
    const group = btn.closest('[role="radiogroup"]');
    if (group) {
      $$('[role="radio"]', group).forEach((b) => b.setAttribute("aria-checked", "false"));
    }
    btn.setAttribute("aria-checked", "true");

    const patch = { [key]: value };
    // Choosing a garment invalidates a previously chosen chart size.
    if (key === "garmentId") {
      patch.size = null;
    }
    if (key === "designPath") {
      patch.assetId = null;
      patch.conceptId = null;
    }
    persist(patch);

    // Design-path change needs a re-render to reveal/hide the picker.
    if (key === "designPath") {
      saveDraft(draft);
      navigate(`/request/${textile.id}?step=2&r=${Date.now()}`);
      return;
    }
    refreshPreview();
  });

  /* --- inputs, selects, textareas --- */
  form.addEventListener("input", (event) => {
    const el = event.target;
    if (el.dataset.measure) {
      draft.measurements = { ...draft.measurements, [el.dataset.measure]: el.value };
      saveDraft(draft);
      refreshPreview();
      return;
    }
    if (el.dataset.set) {
      persist({ [el.dataset.set]: el.value });
      refreshPreview();
    }
  });

  form.addEventListener("change", (event) => {
    const el = event.target;
    if (el.dataset.set === "sizeOrMeasurement" || el.dataset.set === "fabricPreference") {
      persist({ [el.dataset.set]: el.value });
      saveDraft(draft);
      navigate(`/request/${textile.id}?step=${draft.step}&r=${Date.now()}`);
    }
    if (el.dataset.colourway) {
      persist({ colourwayId: el.dataset.colourway });
      refreshPreview();
    }
  });

  /* --- swatches --- */
  form.addEventListener("click", (event) => {
    const sw = event.target.closest("[data-colourway]");
    if (!sw) return;
    $$("[data-colourway]", form).forEach((b) => b.setAttribute("aria-checked", "false"));
    sw.setAttribute("aria-checked", "true");
    persist({ colourwayId: sw.dataset.colourway });
    refreshPreview();
  });

  /* --- error-summary links jump to the offending field --- */
  form.addEventListener("click", (event) => {
    const link = event.target.closest("[data-error-link]");
    if (!link) return;
    event.preventDefault();
    const key = link.dataset.errorLink;
    const target = form.querySelector(`#${key}`);
    if (target) {
      focusElement(target);
    } else if (key === "measurements") {
      const first = form.querySelector("[data-measure]");
      if (first) focusElement(first);
    }
  });

  /* --- submit --- */
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const step = Number(form.dataset.step);

    const stepErrors = validateStep(draft, step);
    if (Object.keys(stepErrors).length) {
      showErrors(stepErrors);
      return;
    }
    showErrors({});

    if (step < STEPS.length) {
      gotoStep(step + 1);
      return;
    }

    // Final submit.
    try {
      const request = createRequest(buildRequestInput(draft));
      upsertRequest(request);
      clearDraft(draft);
      navigate(`/sent/${request.id}`);
    } catch (err) {
      if (err instanceof RequestError) {
        showErrors({ buyerName: err.message });
      } else {
        throw err;
      }
    }
  });

  refreshPreview();
}

function validateStep(draft, step) {
  const errors = {};
  if (step === 1) {
    if (!draft.garmentId) errors.garmentId = "Choose a garment.";
    if (!draft.styleId) errors.styleId = "Choose a style direction.";
  }
  if (step === 2) {
    if (!draft.designPath) errors.designPath = "Choose a design path.";
    if (draft.designPath === "curated" && !draft.assetId) {
      errors.assetId = "Pick a design asset.";
    }
    if (draft.designPath === "concept" && !draft.conceptId) {
      errors.conceptId = "Pick a concept variation.";
    }
    if (!draft.placementId) errors.placementId = "Choose a placement.";
  }
  if (step === 3) {
    if (draft.sizeOrMeasurement === "chart" && !draft.size) {
      errors.size = "Choose a size from the chart.";
    }
    if (draft.sizeOrMeasurement === "custom") {
      const m = draft.measurements || {};
      if (!String(m.chest || "").trim() && !String(m.waist || "").trim()) {
        errors.measurements = "Enter at least chest or waist.";
      }
    }
  }
  if (step === 4) {
    const { errors: e } = validateRequestInput(buildRequestInput(draft, true));
    Object.assign(errors, e);
  }
  return errors;
}

function buildRequestInput(draft, partial = false) {
  return {
    textileId: draft.textileId,
    garmentId: draft.garmentId || (partial ? " " : draft.garmentId),
    styleId: draft.styleId,
    designPath: draft.designPath,
    assetId: draft.assetId,
    concept: draft.conceptId
      ? {
          id: draft.conceptId,
          engine: ENGINE.id,
          engineKind: ENGINE.kind,
          warning: CONCEPT_WARNING,
          approvalRequired: true,
        }
      : null,
    colourwayId: draft.colourwayId,
    placementId: draft.placementId,
    fabricPreference: draft.fabricPreference || "artisan-to-advise",
    sizeOrMeasurement: draft.sizeOrMeasurement,
    size: draft.size,
    measurements:
      draft.sizeOrMeasurement === "custom" ? draft.measurements : null,
    buyerName: draft.buyerName,
    buyerContact: draft.buyerContact,
    notes: draft.notes,
  };
}
