/**
 * Odrakriti — PDF-ready technical brief for one request.
 *
 * This is a plain, print-first HTML page. The browser's own
 * "Print / Save as PDF" produces the document — there is no PDF server.
 * A dedicated @media print block in pages.css strips the app chrome.
 *
 * It always carries the concept and permission warnings, and always
 * states whether the item is handwoven or a printed adaptation.
 */

import { icon } from "../lib/icons.js";
import { esc } from "../lib/dom.js";
import { getRequest } from "../lib/store.js";
import { getTextile, SOURCE_PDF } from "../data/textiles.js";
import { getGarment, getStyle, getPlacement, getChart } from "../data/garments.js";
import { getColorway } from "../data/colorways.js";
import { getAsset, ASSET_KIND } from "../data/assets.js";
import { buyerFacingQuote, STATUS_META } from "../lib/requests.js";
import { decisionLabel, formatINR, formatWindow, formatDateTime } from "../lib/format.js";
import { ENGINE } from "../lib/concept.js";
import { garmentSVG, placeholderTileSVG } from "../lib/silhouettes.js";

function fabricationStatement(request) {
  if (request.fabricPreference === "printed") {
    return {
      label: "Printed adaptation — not handwoven",
      detail:
        "The buyer has asked for a printed adaptation. This is not a handwoven product and must not be described as handloom-made.",
    };
  }
  if (request.fabricPreference === "handwoven") {
    return {
      label: "Handwoven requested — not yet confirmed",
      detail:
        "The buyer has asked for handwoven fabric. This is a request only. It becomes a handwoven item solely if the artisan confirms a real handwoven production method.",
    };
  }
  return {
    label: "Production method not confirmed",
    detail:
      "No production method has been confirmed. Nothing on this brief may be described as handwoven until the artisan confirms it.",
  };
}

export function briefPage(params) {
  const request = getRequest(params.id);

  if (!request) {
    return `<section class="section"><div class="container container--narrow">
      <div class="empty">
        <p><strong>Request ${esc(params.id)} not found.</strong></p>
        <p class="small muted">Demo requests live in this browser's local storage.</p>
        <p><a class="btn btn--ghost" href="#/portal">${icon("arrowLeft", { size: 16 })} Back to portal</a></p>
      </div>
    </div></section>`;
  }

  const textile = getTextile(request.textileId);
  const garment = getGarment(request.garmentId);
  const style = getStyle(request.styleId);
  const asset = getAsset(request.assetId);
  const colourway = getColorway(request.colourwayId);
  const placement = getPlacement(request.placementId);
  const chart = getChart(garment?.chartId);
  const isPlaceholder = asset && asset.kind === ASSET_KIND.PLACEHOLDER;
  const quote = buyerFacingQuote(request);
  const fabrication = fabricationStatement(request);
  const statusMeta = STATUS_META[request.status] || STATUS_META.submitted;

  const art = isPlaceholder
    ? placeholderTileSVG("Design asset withheld pending permission")
    : garmentSVG({
        silhouette: garment?.silhouette || "tunic",
        fill: colourway.hex,
        placement: request.placementId || null,
        title: `${garment?.name || "Garment"} — neutral demo silhouette, no motif shown`,
      });

  return `
  <div class="no-print" style="border-bottom:1px solid var(--border);background:var(--c-ivory-2)">
    <div class="container">
      <div class="row row--between" style="padding-block:var(--sp-3)">
        <p class="small" style="margin:0">
          <strong>Technical brief</strong> · ${esc(request.id)} — use your browser's
          Print / Save as PDF.
        </p>
        <div class="btn-group">
          <button type="button" class="btn btn--accent btn--sm" data-print>
            ${icon("printer", { size: 16 })} Print / Save as PDF
          </button>
          <a class="btn btn--ghost btn--sm" href="#/portal/request/${esc(request.id)}">
            ${icon("arrowLeft", { size: 16 })} Back to request
          </a>
        </div>
      </div>
    </div>
  </div>

  <section class="section">
    <div class="container">
      <article class="print-doc">
        <header class="print-doc__head">
          <div class="row row--between">
            <div>
              <p class="eyebrow" style="margin-bottom:var(--sp-2)">Odrakriti — technical brief</p>
              <h1 style="margin:0;font-size:var(--text-2xl)">Request ${esc(request.id)}</h1>
            </div>
            <dl class="dl" style="min-width:220px">
              <dt>Status</dt><dd>${esc(statusMeta.label)}</dd>
              <dt>Created</dt><dd>${esc(formatDateTime(request.createdAt))}</dd>
              <dt>Updated</dt><dd>${esc(formatDateTime(request.updatedAt))}</dd>
              <dt>Source</dt><dd>${request.demoSeed ? "Demo seed data" : "Buyer submission (demo)"}</dd>
            </dl>
          </div>
        </header>

        <div class="brief-block">
          <div class="callout callout--warn" role="note">
            <span class="callout__icon">${icon("alert", { size: 20 })}</span>
            <div class="callout__body">
              <h4>Prototype document — not a production order</h4>
              <p class="small">
                This brief comes from a Class 12 demonstration prototype. It records a demo
                customisation request. There is no real order, no payment, no confirmed artisan
                partnership, and no official certification behind it.
              </p>
            </div>
          </div>
        </div>

        <div class="brief-block">
          <div class="callout callout--concept" role="note">
            <span class="callout__icon">${icon("sparkles", { size: 20 })}</span>
            <div class="callout__body">
              <h4>Concept &amp; approval warning</h4>
              <p class="small">
                ${
                  request.concept
                    ? `Design path: <strong>AI-assisted concept (simulated engine ${esc(ENGINE.id)})</strong>.
                       Concept ID <span class="mono">${esc(request.concept.id)}</span>.
                       <strong>${esc(request.concept.warning)}</strong> The engine only re-arranged
                       an existing library asset and varied styling choices; it did not invent,
                       alter or copy a heritage motif. The artisan must approve, revise or reject
                       feasibility before any quote.`
                    : `Design path: <strong>curated design</strong> from the demo library. No concept
                       was generated. The design asset's own permission status still applies.`
                }
              </p>
              <p class="small">
                <strong>Permission status:</strong> ${esc(textile?.permission.label || "Not confirmed")}.
                ${esc(
                  textile?.permission.detail ||
                    "No permission has been obtained from the artisan, cooperative, or rights holder."
                )}
              </p>
            </div>
          </div>
        </div>

        <div class="brief-block">
          <div class="callout callout--info" role="note">
            <span class="callout__icon">${icon("layers", { size: 20 })}</span>
            <div class="callout__body">
              <h4>Fabrication: ${esc(fabrication.label)}</h4>
              <p class="small">${esc(fabrication.detail)}</p>
            </div>
          </div>
        </div>

        <div class="brief-block">
          <h2>1. Preview</h2>
          <div class="row" style="align-items:flex-start;gap:var(--sp-6)">
            <div style="width:min(260px,100%)">
              <div style="border:1px solid var(--border);border-radius:var(--r-md);background:var(--c-ivory-2);padding:var(--sp-4)">
                ${art}
              </div>
              <p class="tiny muted" style="margin-top:var(--sp-2)">
                Neutral demo silhouette drawn by this project. Not a photograph, and not evidence of
                a handwoven product. No heritage motif is drawn because no motif asset has been
                approved for use.
              </p>
            </div>
            <dl class="dl" style="flex:1;min-width:220px">
              <dt>Garment</dt><dd>${esc(garment?.name || "—")}</dd>
              <dt>Style</dt><dd>${esc(style?.name || "—")}</dd>
              <dt>Colourway</dt><dd>${esc(colourway.name)} <span class="mono">${esc(colourway.hex)}</span></dd>
              <dt>Placement</dt><dd>${esc(placement?.name || "—")}</dd>
              <dt>Fabric pref.</dt><dd>${esc(fabrication.label)}</dd>
            </dl>
          </div>
        </div>

        <div class="brief-block">
          <h2>2. Design reference</h2>
          <dl class="dl">
            <dt>Asset ID</dt><dd>${asset ? `<span class="mono">${esc(asset.id)}</span>` : "—"}</dd>
            <dt>Asset name</dt><dd>${esc(asset?.name || "—")}</dd>
            <dt>Asset kind</dt>
            <dd>${
              asset?.kind === ASSET_KIND.PLACEHOLDER
                ? "Placeholder — motif asset withheld pending permission"
                : asset?.kind === ASSET_KIND.PLAIN
                  ? "Plain fabric field — carries no motif"
                  : "—"
            }</dd>
            <dt>Approval</dt><dd>${esc(asset?.approvalLabel || "—")}</dd>
            <dt>Concept ID</dt>
            <dd>${request.concept ? `<span class="mono">${esc(request.concept.id)}</span>` : "Not applicable"}</dd>
            <dt>Concept engine</dt>
            <dd>${request.concept ? esc(ENGINE.id) + " — simulated, no live model" : "Not applicable"}</dd>
          </dl>
          ${asset ? `<p class="small muted">${esc(asset.note)}</p>` : ""}
        </div>

        <div class="brief-block">
          <h2>3. Size &amp; measurements</h2>
          <dl class="dl">
            <dt>Mode</dt>
            <dd>${request.sizeOrMeasurement === "custom" ? "Custom measurements supplied by buyer" : "Chart size"}</dd>
            ${
              request.sizeOrMeasurement === "custom"
                ? Object.entries(request.measurements || {})
                    .filter(([, v]) => String(v ?? "").trim() !== "")
                    .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)} inches</dd>`)
                    .join("")
                : `<dt>Size</dt><dd>${esc(request.size || "—")}</dd>`
            }
          </dl>
          <p class="tiny muted">
            ${icon("alert", { size: 13 })}
            ${
              request.sizeOrMeasurement === "custom"
                ? "Buyer-supplied measurements are illustrative demo values — confirm with the artisan before cutting."
                : `${esc(chart?.disclaimer || "Illustrative demo measurements — confirm with the artisan.")}`
            }
          </p>
          ${
            chart && request.sizeOrMeasurement !== "custom"
              ? `<details style="margin-top:var(--sp-3)">
                  <summary class="small">Reference chart — ${esc(chart.label)}</summary>
                  <div class="table-wrap" style="margin-top:var(--sp-3)">
                    <table>
                      <thead><tr>${chart.columns.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
                      <tbody>${chart.rows
                        .map(
                          (row) =>
                            `<tr>${row
                              .map((cell, j) => (j === 0 ? `<th scope="row">${esc(cell)}</th>` : `<td>${esc(cell)}</td>`))
                              .join("")}</tr>`
                        )
                        .join("")}</tbody>
                    </table>
                  </div>
                </details>`
              : ""
          }
        </div>

        <div class="brief-block">
          <h2>4. Textile reference &amp; source</h2>
          <dl class="dl">
            <dt>Textile</dt><dd>${esc(textile?.name || request.textileId)}</dd>
            <dt>Region</dt><dd>${esc(textile?.region || "—")}</dd>
            <dt>Community</dt><dd>${esc(textile?.community || "Not stated in the cited entry — not asserted.")}</dd>
            <dt>Fibre</dt><dd>${esc(textile?.fibre || "—")}</dd>
            <dt>Technique</dt><dd>${esc(textile?.technique || "—")}</dd>
            <dt>Motifs</dt><dd>${esc(textile?.motifs || "—")}</dd>
            <dt>Citation</dt>
            <dd>${esc(SOURCE_PDF.title)}, p.&nbsp;${esc(String(textile?.citation.page ?? "—"))},
              ${esc(textile?.citation.entry || "—")}</dd>
            <dt>Source URL</dt><dd class="mono" style="font-size:var(--text-xs)">${esc(SOURCE_PDF.url)}</dd>
          </dl>
          <p class="tiny muted">
            A source-matched citation is not an authentication and not a reuse licence.
            ${esc(SOURCE_PDF.reVerifyNote)}
          </p>
        </div>

        <div class="brief-block">
          <h2>5. Buyer notes &amp; contact</h2>
          <dl class="dl">
            <dt>Buyer</dt><dd>${esc(request.buyerName)}</dd>
            <dt>Contact</dt><dd>${esc(request.buyerContact)} <span class="tiny muted">(simulated)</span></dd>
            <dt>Notes</dt><dd>${request.notes ? esc(request.notes) : "None supplied"}</dd>
          </dl>
          ${
            request.thread.length
              ? `<h3 style="font-size:var(--text-md);margin-top:var(--sp-4)">Conversation</h3>
                 ${request.thread
                   .map(
                     (m) => `<p class="small"><strong>${esc(m.from === "buyer" ? "Buyer" : "Artisan")}</strong>
                       (${esc(formatDateTime(m.at))}): ${esc(m.text)}</p>`
                   )
                   .join("")}`
              : ""
          }
        </div>

        <div class="brief-block">
          <h2>6. Artisan review</h2>
          <dl class="dl">
            <dt>Reviewed</dt>
            <dd>${request.review ? esc(formatDateTime(request.review.reviewedAt)) : "Not yet reviewed"}</dd>
            <dt>Feasibility</dt><dd>${esc(decisionLabel(request.review?.decision))}</dd>
            <dt>Notes</dt>
            <dd>${request.review?.notes ? esc(request.review.notes) : "None recorded"}</dd>
          </dl>
        </div>

        <div class="brief-block">
          <h2>7. Price &amp; delivery</h2>
          ${
            quote
              ? `<dl class="dl">
                  <dt>Price</dt><dd><strong>${esc(formatINR(quote.priceINR))}</strong></dd>
                  <dt>Delivery</dt><dd>${esc(formatWindow(quote.deliveryWindowDays))}</dd>
                  <dt>Quoted on</dt><dd>${esc(formatDateTime(quote.quotedAt))}</dd>
                  <dt>Notes</dt><dd>${quote.artisanNotes ? esc(quote.artisanNotes) : "None"}</dd>
                </dl>
                <p class="tiny muted">Estimate only. No payment is processed by this prototype and
                no order has been placed.</p>`
              : `<p class="small"><strong>Not quoted.</strong> No price or delivery window exists
                  yet. A quote can only be entered after the artisan has recorded a feasibility
                  decision of “feasible”.</p>`
          }
        </div>

        <div class="brief-block">
          <div class="callout callout--warn" role="note">
            <span class="callout__icon">${icon("lock", { size: 20 })}</span>
            <div class="callout__body">
              <h4>Before anything is made or published</h4>
              <ul class="small" style="margin-bottom:0">
                <li>Obtain permission from the artisan, cooperative, or rights holder for any motif or photograph.</li>
                <li>Confirm whether the item is handwoven or a printed adaptation, and label it accordingly.</li>
                <li>Confirm measurements against the maker's own standard.</li>
                <li>Treat the price and window as estimates until the maker commits.</li>
              </ul>
            </div>
          </div>
        </div>

        <footer class="tiny muted" style="margin-top:var(--sp-6);border-top:1px solid var(--border);padding-top:var(--sp-4)">
          Odrakriti — working name for a school-project prototype only. Not a registered or
          cleared trademark. Generated ${esc(formatDateTime(new Date().toISOString()))}.
        </footer>
      </article>
    </div>
  </section>`;
}

export function mountBrief() {
  const btn = document.querySelector("[data-print]");
  if (btn) btn.addEventListener("click", () => window.print());
}
