/**
 * Odrakriti — Buyer: submission confirmation and request tracking.
 *
 * This is where the quote gate is enforced on the buyer side. The price
 * and delivery window are rendered ONLY through buyerFacingQuote(), which
 * returns null until an artisan has actually sent a quote.
 */

import { icon } from "../lib/icons.js";
import { esc } from "../lib/dom.js";
import { getRequest, upsertRequest } from "../lib/store.js";
import { getTextile } from "../data/textiles.js";
import { getGarment, getStyle, getPlacement, getChart } from "../data/garments.js";
import { getColorway } from "../data/colorways.js";
import { getAsset, ASSET_KIND } from "../data/assets.js";
import {
  buyerFacingQuote,
  STATUS_META,
  FEASIBILITY,
  buyerReply,
  hasBeenReviewed,
  RequestError,
} from "../lib/requests.js";
import { decisionLabel, formatINR, formatWindow, formatDateTime } from "../lib/format.js";
import {
  badge,
  statusBadge,
  conceptBadge,
  fabricationBadge,
  permissionBadge,
  callout,
} from "../components/ui.js";
import { garmentSVG, placeholderTileSVG } from "../lib/silhouettes.js";
import { ENGINE } from "../lib/concept.js";

function notFound(id) {
  return `<section class="section"><div class="container container--narrow">
    <div class="empty">
      <p><strong>${icon("xCircle", { size: 20 })} Request ${esc(id)} not found.</strong></p>
      <p class="small muted">Demo requests live in this browser's local storage. If you cleared
      storage, or opened this on another device, the request will not be here.</p>
      <p><a class="btn btn--ghost" href="#/explore">${icon("arrowLeft", { size: 16 })} Back to catalog</a></p>
    </div>
  </div></section>`;
}

/* ---------------- Confirmation ---------------- */

export function sentPage(params) {
  const request = getRequest(params.id);
  if (!request) return notFound(params.id);

  const meta = STATUS_META[request.status] || STATUS_META.submitted;

  return `<section class="section">
    <div class="container container--narrow">
      <div class="panel" style="text-align:center;padding-block:var(--sp-7)">
        <span style="display:inline-grid;place-items:center;width:64px;height:64px;border-radius:50%;background:var(--c-sage-soft);color:var(--c-sage);margin-bottom:var(--sp-4)">
          ${icon("checkCircle", { size: 34 })}
        </span>
        <h1 style="font-size:var(--text-2xl)">Request sent for artisan review</h1>
        <p class="lede" style="margin-inline:auto">
          Your customisation request is now in the demo artisan portal. An artisan will review
          feasibility before anything else happens.
        </p>
        <p style="margin-top:var(--sp-4)">
          <span class="pill-note">${icon("tag", { size: 14 })} Request ID
            <strong class="mono">${esc(request.id)}</strong></span>
        </p>
      </div>

      ${callout(
        "warn",
        "alert",
        "No price or delivery date yet",
        `<p class="small">This is deliberate. A price and an estimated delivery window can only
        appear after the artisan has reviewed the request and returned a quote. Nothing on this
        page promises a cost or a date.</p>`
      )}

      <div class="panel" style="margin-top:var(--sp-5)">
        <h3 style="font-size:var(--text-md)">${icon("route", { size: 18 })} What happens next</h3>
        <ol class="small">
          <li>An artisan opens your request and reads the garment, size, design asset and notes.</li>
          <li>They mark it <strong>feasible</strong>, <strong>not feasible</strong>, or <strong>needing clarification</strong>.</li>
          <li>Only if it is feasible can they enter a price and an estimated delivery window.</li>
          <li>You see the quote here, on this page.</li>
        </ol>
      </div>

      <div class="btn-group" style="margin-top:var(--sp-5);justify-content:center">
        <a class="btn btn--accent" href="#/track/${esc(request.id)}">${icon("eye", { size: 18 })} Track this request</a>
        <a class="btn btn--ghost" href="#/portal">${icon("handHeart", { size: 18 })} Open the demo artisan portal</a>
      </div>

      <p class="tiny muted center" style="margin-top:var(--sp-5)">
        ${icon("info", { size: 13 })} For a classroom demo you can play both sides: submit a request
        here, then open the artisan portal in the same browser and return a quote.
      </p>
    </div>
  </section>`;
}

/* ---------------- Tracking ---------------- */

export function trackPage(params) {
  const request = getRequest(params.id);
  if (!request) return notFound(params.id);

  const quote = buyerFacingQuote(request);
  const meta = STATUS_META[request.status] || STATUS_META.submitted;
  const textile = getTextile(request.textileId);
  const garment = getGarment(request.garmentId);
  const style = getStyle(request.styleId);
  const asset = getAsset(request.assetId);
  const colourway = getColorway(request.colourwayId);
  const placement = getPlacement(request.placementId);
  const isPlaceholder = asset && asset.kind === ASSET_KIND.PLACEHOLDER;

  const art = isPlaceholder
    ? placeholderTileSVG("Design asset withheld pending permission")
    : garmentSVG({
        silhouette: garment?.silhouette || "tunic",
        fill: colourway.hex,
        placement: request.placementId || null,
        title: `Requested ${garment?.name || "garment"} in ${colourway.name}. Neutral silhouette; no motif shown.`,
      });

  return `<section class="section">
    <div class="container">
      <nav aria-label="Breadcrumb" class="small" style="margin-bottom:var(--sp-5)">
        <a href="#/">Home</a> <span aria-hidden="true">/</span>
        <span aria-current="page">Request ${esc(request.id)}</span>
      </nav>

      <header class="row row--between" style="margin-bottom:var(--sp-6)">
        <div>
          <p class="eyebrow">Your request</p>
          <h1 style="font-size:var(--text-2xl)">${esc(request.id)}</h1>
          <p class="tiny muted">Sent ${esc(formatDateTime(request.createdAt))}</p>
        </div>
        <div class="badge-row">${statusBadge(request.status)}</div>
      </header>

      <div class="detail">
        <div>
          <div class="detail__media">${art}</div>

          <div class="panel" style="margin-top:var(--sp-5)">
            <h3 style="font-size:var(--text-md)">${icon("chat", { size: 18 })} Conversation</h3>
            ${
              request.thread.length
                ? request.thread
                    .map(
                      (m) => `<div class="panel panel--alt" style="margin-top:var(--sp-3)">
                        <p class="tiny muted"><strong>${esc(m.from === "buyer" ? "You" : "Artisan")}</strong>
                        · ${esc(formatDateTime(m.at))}</p>
                        <p class="small" style="margin:0">${esc(m.text)}</p>
                      </div>`
                    )
                    .join("")
                : `<p class="small muted" style="margin-top:var(--sp-3)">No messages yet.</p>`
            }

            ${
              request.status === "needs_clarification"
                ? `<form data-reply-form style="margin-top:var(--sp-4)">
                    <div class="field" data-field="reply">
                      <label for="reply">Your reply</label>
                      <textarea id="reply" name="reply" placeholder="Answer the artisan's question…"></textarea>
                      <p class="field__error" id="reply-error">${icon("alert", { size: 15 })} <span data-error-text></span></p>
                    </div>
                    <button type="submit" class="btn btn--accent btn--sm">${icon("arrowRight", { size: 16 })} Send reply</button>
                  </form>`
                : ""
            }
          </div>
        </div>

        <div class="stack-lg">
          <div class="stack">
            ${quotePanel(request, quote)}

            <div class="panel">
              <h3 style="font-size:var(--text-md)">${icon("doc", { size: 18 })} What you asked for</h3>
              <dl class="dl" style="margin-top:var(--sp-3)">
                <dt>Textile</dt><dd>${esc(textile?.name || "—")} ${badge("neutral", "leaf", "candidate")}</dd>
                <dt>Garment</dt><dd>${esc(garment?.name || "—")}</dd>
                <dt>Style</dt><dd>${esc(style?.name || "—")}</dd>
                <dt>Design path</dt>
                <dd>${request.designPath === "concept" ? "AI-assisted concept (simulated)" : "Curated design"}</dd>
                <dt>Design asset</dt>
                <dd>${asset ? `<span class="mono">${esc(asset.id)}</span><br/>${esc(asset.name)}<br/>${esc(asset.approvalLabel)}` : "—"}</dd>
                <dt>Concept</dt>
                <dd>${
                  request.concept
                    ? `<span class="mono">${esc(request.concept.id)}</span><br/>${esc(request.concept.warning)}<br/>
                       <span class="tiny muted">Engine: ${esc(ENGINE.description)}</span>`
                    : "Not applicable"
                }</dd>
                <dt>Colourway</dt><dd>${esc(colourway.name)}</dd>
                <dt>Placement</dt><dd>${esc(placement?.name || "—")}</dd>
                <dt>Fabrication</dt>
                <dd>${
                  request.fabricPreference === "handwoven"
                    ? "Requested handwoven — subject to artisan confirmation"
                    : request.fabricPreference === "printed"
                      ? "Printed adaptation — not handwoven"
                      : "Artisan to advise"
                }</dd>
                <dt>Size</dt>
                <dd>${
                  request.sizeOrMeasurement === "custom"
                    ? `Custom measurements<br/><span class="tiny muted">${esc(customSummary(request))}</span>`
                    : esc(request.size ? `Size ${request.size}` : "—")
                }</dd>
                <dt>Your notes</dt><dd>${request.notes ? esc(request.notes) : "<span class='muted'>None</span>"}</dd>
              </dl>
            </div>

            ${textile ? `<div>${permissionBadge(textile.permission.status)}
              <p class="tiny muted" style="margin-top:var(--sp-2)">${esc(textile.permission.detail)}</p></div>` : ""}

            ${
              request.designPath === "concept"
                ? callout(
                    "concept",
                    "sparkles",
                    "Concept only — artisan review required",
                    `<p class="small">This request used the simulated concept engine. It re-arranges
                    existing demo assets; it did not invent a motif. The artisan must approve, revise,
                    or reject feasibility before this becomes anything real.</p>`
                  )
                : ""
            }
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

/**
 * THE BUYER-SIDE GATE.
 * `quote` is null until buyerFacingQuote() says otherwise.
 */
function quotePanel(request, quote) {
  if (!quote) {
    return `<div class="panel panel--lead">
      <h3 style="font-size:var(--text-md)">${icon("clock", { size: 18 })} Price &amp; delivery</h3>
      <p class="small">
        <strong>Not available yet.</strong> ${esc(STATUS_META[request.status]?.buyerMessage || "")}
      </p>
      <dl class="dl" style="margin-top:var(--sp-3)">
        <dt>Price</dt><dd>${icon("lock", { size: 14 })} Hidden until the artisan sends a quote</dd>
        <dt>Delivery</dt><dd>${icon("lock", { size: 14 })} Hidden until the artisan sends a quote</dd>
        <dt>Reviewed?</dt>
        <dd>${
          hasBeenReviewed(request)
            ? esc(decisionLabel(request.review.decision))
            : "Not yet reviewed"
        }</dd>
      </dl>
      ${
        request.review && request.review.notes
          ? `<div class="divider"></div>
             <p class="small"><strong>Artisan note:</strong> ${esc(request.review.notes)}</p>`
          : ""
      }
      ${
        request.status === "needs_clarification"
          ? callout(
              "info",
              "question",
              "The artisan needs one more detail",
              `<p class="small">Answer their question in the conversation panel and the request goes
              back for review.</p>`
            )
          : ""
      }
      ${
        request.status === "not_feasible"
          ? callout(
              "no",
              "xCircle",
              "Not feasible as requested",
              `<p class="small">You can start a new request with different choices — a different
              garment, placement, or production method.</p>
              <p><a class="btn btn--ghost btn--sm" href="#/explore">${icon("search", { size: 16 })} Browse again</a></p>`
            )
          : ""
      }
    </div>`;
  }

  return `<div class="panel panel--lead" data-quote-panel>
    <h3 style="font-size:var(--text-md)">${icon("checkCircle", { size: 18 })} Quote returned by the artisan</h3>
    <p class="small">The artisan reviewed your request and returned the following.</p>

    <dl class="dl" style="margin-top:var(--sp-3)">
      <dt>Price</dt>
      <dd style="font-family:var(--font-display);font-size:var(--text-xl);font-weight:700">
        ${esc(formatINR(quote.priceINR))}
      </dd>
      <dt>Delivery</dt>
      <dd>${esc(formatWindow(quote.deliveryWindowDays))}</dd>
      <dt>Feasibility</dt>
      <dd>${badge("ok", "checkCircle", decisionLabel(request.review?.decision))}</dd>
      <dt>Quoted on</dt><dd>${esc(formatDateTime(quote.quotedAt))}</dd>
    </dl>

    ${
      quote.artisanNotes
        ? `<div class="divider"></div><p class="small"><strong>Artisan note:</strong> ${esc(quote.artisanNotes)}</p>`
        : ""
    }

    ${callout(
      "info",
      "info",
      "This is an estimate, not an order",
      `<p class="small">Price and delivery depend on the artisan's review and on real material
      availability. There is no payment step in this prototype, and no order has been placed.</p>`
    )}

    <div class="btn-group" style="margin-top:var(--sp-4)">
      <a class="btn btn--accent" href="#/request/${esc(request.textileId)}">${icon("plus", { size: 16 })} Start another request</a>
      <a class="btn btn--ghost" href="#/portal/request/${esc(request.id)}/brief" target="_blank" rel="noopener">
        ${icon("doc", { size: 16 })} View technical brief
      </a>
    </div>
  </div>`;
}

function customSummary(request) {
  const m = request.measurements || {};
  const parts = Object.entries(m)
    .filter(([, v]) => String(v ?? "").trim() !== "")
    .map(([k, v]) => `${k} ${v}"`);
  return parts.length ? parts.join(", ") : "not entered";
}

/* ---------------- Mount: reply form ---------------- */

export function mountTrack(params) {
  const form = document.querySelector("[data-reply-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const textarea = form.querySelector("#reply");
    const field = form.querySelector('[data-field="reply"]');
    const request = getRequest(params.id);
    if (!request) return;

    try {
      const updated = buyerReply(request, textarea.value);
      upsertRequest(updated);
      field.classList.remove("has-error");
      navigateReload(params.id);
    } catch (err) {
      if (err instanceof RequestError) {
        field.classList.add("has-error");
        const slot = field.querySelector("[data-error-text]");
        if (slot) slot.textContent = err.message;
        textarea.focus();
      } else throw err;
    }
  });
}

function navigateReload(id) {
  window.location.hash = `#/track/${id}?r=${Date.now()}`;
}

export { FEASIBILITY };
