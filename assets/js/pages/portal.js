/**
 * Odrakriti — Artisan portal (demo).
 *
 * A separate, deliberately plain workspace view. Mock data only: no real
 * orders and no named artisan is implied to be participating.
 *
 * The quote form is gated by canSubmitQuote(). Until the artisan records a
 * decision of "feasible", the price and delivery fields stay disabled and
 * the reason is printed next to them.
 */

import { icon } from "../lib/icons.js";
import { esc, announce, focusElement } from "../lib/dom.js";
import { loadRequests, getRequest, upsertRequest, loadRole, saveRole, ROLES } from "../lib/store.js";
import { getTextile } from "../data/textiles.js";
import { getGarment, getStyle, getPlacement } from "../data/garments.js";
import { getColorway } from "../data/colorways.js";
import { getAsset, ASSET_KIND } from "../data/assets.js";
import {
  STATUS,
  FEASIBILITY,
  STATUS_META,
  openForReview,
  recordFeasibility,
  submitQuote,
  canSubmitQuote,
  artisanNote,
  queueCounts,
  RequestError,
} from "../lib/requests.js";
import { decisionLabel, formatINR, formatWindow, formatDate, formatDateTime } from "../lib/format.js";
import { badge, statusBadge, fabricationBadge, permissionBadge, callout, conceptBadge } from "../components/ui.js";
import { garmentSVG, placeholderTileSVG } from "../lib/silhouettes.js";
import { ENGINE } from "../lib/concept.js";

function portalShell(active, body) {
  // Every href is a real destination: a route, a route+query filter, or a
  // route+fragment that has a matching id on that route. No placeholders.
  const items = [
    { key: "queue", href: "#/portal", label: "Queue", icon: "inbox" },
    { key: "needs", href: "#/portal?tab=needs", label: "Needs attention", icon: "alert" },
    { key: "about", href: "#/portal#about-portal", label: "About this portal", icon: "info" },
  ];
  return `<section class="section">
    <div class="container">
      <div class="portal-shell">
        <nav class="portal-nav" aria-label="Artisan portal">
          <p class="portal-nav__title">${icon("handHeart", { size: 14 })} Artisan portal</p>
          <ul>
            ${items
              .map(
                (item) =>
                  `<li><a href="${item.href}"
                    ${active === item.key ? 'aria-current="page"' : ""}>${icon(item.icon, { size: 18 })} ${esc(item.label)}</a></li>`
              )
              .join("")}
          </ul>
          <div class="divider" style="border-color:rgba(255,255,255,.18);margin-block:var(--sp-4)"></div>
          <p class="portal-nav__title">View as</p>
          <ul>
            <li><a href="#/portal" data-role="artisan" ${loadRole() === ROLES.ARTISAN ? 'aria-current="page"' : ""}>${icon("handHeart", { size: 18 })} Artisan</a></li>
            <li><a href="#/" data-role="buyer">${icon("user", { size: 18 })} Buyer site</a></li>
          </ul>
          <p class="tiny" style="color:#c9bda9;margin-top:var(--sp-4)">
            Simulated sign-in. No account is created and no data leaves this browser.
          </p>
        </nav>
        <div>${body}</div>
      </div>
    </div>
  </section>`;
}

/* ---------------- Dashboard ---------------- */

export function portalPage(_params, query = {}) {
  const requests = loadRequests();
  const counts = queueCounts(requests);
  const tab = query.tab || "all";

  const visible = requests.filter((r) => {
    if (tab === "awaiting") return r.status === STATUS.SUBMITTED || r.status === STATUS.IN_REVIEW;
    if (tab === "needs") return r.status === STATUS.NEEDS_CLARIFICATION;
    if (tab === "done") return r.status === STATUS.QUOTED || r.status === STATUS.NOT_FEASIBLE;
    return true;
  });

  const tabs = [
    ["all", "All", counts.all],
    ["awaiting", "Awaiting review", counts.awaiting],
    ["needs", "Needs clarification", counts.needsClarification],
    ["done", "Closed", counts.quoted + counts.notFeasible],
  ];

  const body = `
    <header style="margin-bottom:var(--sp-6)">
      <p class="eyebrow">Demo artisan workspace</p>
      <h1 style="font-size:var(--text-2xl)">Customisation requests</h1>
      <p class="lede">
        Review each request, decide whether it can be made, and only then send a price and an
        estimated delivery window.
      </p>
    </header>

    ${callout(
      "info",
      "info",
      "Demo data only",
      `<p class="small">This portal shows demonstration requests stored in this browser. There are
      no real orders, and no named artisan is participating in this project. Requests marked as
      demo seed data are labelled as such.</p>`
    )}

    <div class="stat-grid" style="margin-top:var(--sp-5)">
      ${stat(counts.awaiting, "Awaiting review", "clock")}
      ${stat(counts.needsClarification, "Needs clarification", "question")}
      ${stat(counts.quoted, "Quoted", "checkCircle")}
      ${stat(counts.notFeasible, "Not feasible", "xCircle")}
    </div>

    <div class="tabs" role="tablist" aria-label="Filter requests by status">
      ${tabs
        .map(
          ([id, label, n]) => `<a class="tab" role="tab" href="#/portal?tab=${esc(id)}"
            aria-selected="${tab === id ? "true" : "false"}">${esc(label)}
            <span class="chip__count">${n}</span></a>`
        )
        .join("")}
    </div>

    <div style="margin-top:var(--sp-5)">
      ${
        visible.length
          ? `<div class="table-wrap">
              <table>
                <caption class="sr-only">Customisation requests</caption>
                <thead><tr>
                  <th scope="col">Request</th>
                  <th scope="col">Textile</th>
                  <th scope="col">Garment</th>
                  <th scope="col">Path</th>
                  <th scope="col">Status</th>
                  <th scope="col">Price</th>
                  <th scope="col"><span class="sr-only">Actions</span></th>
                </tr></thead>
                <tbody>
                  ${visible
                    .map((r) => {
                      const textile = getTextile(r.textileId);
                      const garment = getGarment(r.garmentId);
                      const hasQuote = r.status === STATUS.QUOTED && r.quote;
                      return `<tr>
                        <td>
                          <strong class="mono">${esc(r.id)}</strong>
                          <div class="tiny muted">${esc(formatDate(r.createdAt))} · ${esc(r.buyerName)}</div>
                          ${r.demoSeed ? badge("neutral", "info", "Demo seed data") : ""}
                        </td>
                        <td>${esc(textile?.shortName || r.textileId)}</td>
                        <td>${esc(garment?.name || r.garmentId)}</td>
                        <td>${
                          r.designPath === "concept"
                            ? badge("concept", "sparkles", "Concept")
                            : badge("neutral", "grid", "Curated")
                        }</td>
                        <td>${statusBadge(r.status)}</td>
                        <td>${hasQuote ? `<strong>${esc(formatINR(r.quote.priceINR))}</strong>` : `<span class="muted">${icon("lock", { size: 14 })} Not quoted</span>`}</td>
                        <td><a class="btn btn--ghost btn--sm" href="#/portal/request/${esc(r.id)}">Open ${icon("arrowRight", { size: 14 })}</a></td>
                      </tr>`;
                    })
                    .join("")}
                </tbody>
              </table>
            </div>`
          : `<div class="empty">
              <p><strong>${icon("inbox", { size: 20 })} No requests here.</strong></p>
              <p class="small muted">Send one from the buyer side, or reset the demo data.</p>
              <p><a class="btn btn--ghost btn--sm" href="#/explore">${icon("arrowLeft", { size: 16 })} Go to the buyer catalog</a>
              <button type="button" class="btn btn--quiet btn--sm" data-reset-demo>${icon("refresh", { size: 16 })} Reset demo data</button></p>
            </div>`
      }
    </div>

    <div class="panel" id="about-portal" style="margin-top:var(--sp-6)">
      <h3 style="font-size:var(--text-md)">${icon("info", { size: 18 })} About this portal</h3>
      <p class="small">
        This is the artisan-facing half of the prototype. It is deliberately plain: the work here
        is reading a brief and making a judgement, not browsing.
      </p>
      <ul class="small">
        <li>Open a request to see the garment, size, approved design asset and buyer notes.</li>
        <li>Mark it <strong>feasible</strong>, <strong>not feasible</strong>, or <strong>needing clarification</strong>.</li>
        <li>Price and delivery fields stay locked until the decision is <strong>feasible</strong>.</li>
        <li>Open the technical brief to print or save as PDF.</li>
      </ul>
      <p class="tiny muted">${icon("alert", { size: 13 })} Nothing here implies a real order or a real partnership.</p>
    </div>`;

  return portalShell(tab === "needs" ? "needs" : "queue", body);
}

function stat(value, label, iconName) {
  return `<div class="stat">
    <div class="stat__value">${icon(iconName, { size: 18 })} ${esc(String(value))}</div>
    <div class="stat__label">${esc(label)}</div>
  </div>`;
}

/* ---------------- Request review ---------------- */

export function portalRequestPage(params) {
  const request = getRequest(params.id);
  if (!request) {
    return portalShell(
      "queue",
      `<div class="empty"><p><strong>Request ${esc(params.id)} not found.</strong></p>
        <p><a class="btn btn--ghost" href="#/portal">${icon("arrowLeft", { size: 16 })} Back to queue</a></p></div>`
    );
  }

  const textile = getTextile(request.textileId);
  const garment = getGarment(request.garmentId);
  const style = getStyle(request.styleId);
  const asset = getAsset(request.assetId);
  const colourway = getColorway(request.colourwayId);
  const placement = getPlacement(request.placementId);
  const isPlaceholder = asset && asset.kind === ASSET_KIND.PLACEHOLDER;
  const gate = canSubmitQuote(request);
  const decision = request.review?.decision || "";

  const art = isPlaceholder
    ? placeholderTileSVG("Design asset withheld pending permission")
    : garmentSVG({
        silhouette: garment?.silhouette || "tunic",
        fill: colourway.hex,
        placement: request.placementId || null,
        title: `Requested ${garment?.name || "garment"} — neutral silhouette, no motif shown`,
      });

  const body = `
    <nav aria-label="Breadcrumb" class="small" style="margin-bottom:var(--sp-5)">
      <a href="#/portal">Queue</a> <span aria-hidden="true">/</span>
      <span aria-current="page">${esc(request.id)}</span>
    </nav>

    <header class="row row--between" style="margin-bottom:var(--sp-5)">
      <div>
        <p class="eyebrow">Request review</p>
        <h1 style="font-size:var(--text-2xl)">${esc(request.id)}</h1>
        <p class="tiny muted">From ${esc(request.buyerName)} · ${esc(formatDateTime(request.createdAt))}
        ${request.demoSeed ? " · demo seed data" : ""}</p>
      </div>
      <div class="badge-row">${statusBadge(request.status)}${permissionBadge(textile?.permission.status || "pending")}</div>
    </header>

    ${request.demoSeed ? callout("info", "info", "Demo seed data", `<p class="small">This request was generated so the portal is never an empty screen. It is not a real order.</p>`) : ""}

    <div class="detail">
      <div class="stack">
        <div class="detail__media">${art}</div>

        <div class="panel">
          <h3 style="font-size:var(--text-md)">${icon("doc", { size: 18 })} Buyer's selection</h3>
          <dl class="dl" style="margin-top:var(--sp-3)">
            <dt>Textile</dt><dd>${esc(textile?.name || request.textileId)} ${badge("neutral", "leaf", "candidate")}</dd>
            <dt>Garment</dt><dd>${esc(garment?.name || "—")}</dd>
            <dt>Style</dt><dd>${esc(style?.name || "—")}</dd>
            <dt>Design path</dt>
            <dd>${request.designPath === "concept" ? "AI-assisted concept (simulated)" : "Curated design"}</dd>
            <dt>Design asset</dt>
            <dd>${asset ? `<span class="mono">${esc(asset.id)}</span><br/>${esc(asset.name)}<br/>${esc(asset.approvalLabel)}` : "—"}</dd>
            <dt>Concept</dt>
            <dd>${request.concept ? `<span class="mono">${esc(request.concept.id)}</span><br/>${esc(request.concept.warning)}` : "Not applicable"}</dd>
            <dt>Colourway</dt><dd>${esc(colourway.name)}</dd>
            <dt>Placement</dt><dd>${esc(placement?.name || "—")}</dd>
            <dt>Fabric pref.</dt>
            <dd>${
              request.fabricPreference === "handwoven"
                ? "Buyer asked for handwoven — you decide if that is possible"
                : request.fabricPreference === "printed"
                  ? "Printed adaptation — not handwoven"
                  : "Artisan to advise"
            }</dd>
            <dt>Size</dt>
            <dd>${
              request.sizeOrMeasurement === "custom"
                ? `Custom measurements<br/><span class="tiny muted">${esc(customSummary(request))}</span><br/>
                   <span class="tiny muted">Illustrative demo measurements — confirm before cutting.</span>`
                : esc(request.size ? `Chart size ${request.size}` : "—")
            }</dd>
            <dt>Buyer notes</dt><dd>${request.notes ? esc(request.notes) : "<span class='muted'>None</span>"}</dd>
            <dt>Contact</dt><dd>${esc(request.buyerContact)} <span class="tiny muted">(simulated)</span></dd>
          </dl>
        </div>

        ${
          request.designPath === "concept"
            ? callout(
                "concept",
                "sparkles",
                "This is a concept, not an approved design",
                `<p class="small">Generated by the simulated engine (${esc(ENGINE.id)}). It
                re-arranged an existing demo asset and varied styling choices. It did not invent a
                motif. You decide whether it is feasible, and you may revise it before quoting.</p>`
              )
            : ""
        }

        ${
          isPlaceholder
            ? callout(
                "warn",
                "lock",
                "Design asset withheld",
                `<p class="small">${esc(asset.note)}</p>`
              )
            : ""
        }

        <div class="panel">
          <h3 style="font-size:var(--text-md)">${icon("chat", { size: 18 })} Conversation</h3>
          ${
            request.thread.length
              ? request.thread
                  .map(
                    (m) => `<div class="panel panel--alt" style="margin-top:var(--sp-3)">
                      <p class="tiny muted"><strong>${esc(m.from === "buyer" ? "Buyer" : "Artisan")}</strong> · ${esc(formatDateTime(m.at))}</p>
                      <p class="small" style="margin:0">${esc(m.text)}</p>
                    </div>`
                  )
                  .join("")
              : `<p class="small muted" style="margin-top:var(--sp-3)">No messages yet.</p>`
          }
          <form data-note-form style="margin-top:var(--sp-4)">
            <div class="field" data-field="note">
              <label for="note">Post a note or a question</label>
              <textarea id="note" name="note" placeholder="Ask the buyer for a detail, or explain your thinking…"></textarea>
              <p class="field__error" id="note-error">${icon("alert", { size: 15 })} <span data-error-text></span></p>
            </div>
            <button type="submit" class="btn btn--ghost btn--sm">${icon("chat", { size: 16 })} Post note</button>
          </form>
        </div>
      </div>

      <div class="stack-lg">
        <form class="panel" data-review-form>
          <h3 style="font-size:var(--text-md)">${icon("eye", { size: 18 })} 1. Feasibility review</h3>
          <p class="small">Read the brief first. This decision unlocks the quote step.</p>

          <div class="field" style="margin-top:var(--sp-3)">
            <span class="field__label" id="decision-label">Your decision</span>
            <div role="radiogroup" aria-labelledby="decision-label" class="stack-sm">
              ${[
                [FEASIBILITY.FEASIBLE, "Feasible — can be made", "checkCircle"],
                [FEASIBILITY.NEEDS_CLARIFICATION, "Needs clarification", "question"],
                [FEASIBILITY.NOT_FEASIBLE, "Not feasible as requested", "xCircle"],
              ]
                .map(
                  ([value, label, ic]) => `<label class="check">
                    <input type="radio" name="decision" value="${esc(value)}"
                      ${decision === value ? "checked" : ""} />
                    <span>${icon(ic, { size: 16 })} ${esc(label)}</span>
                  </label>`
                )
                .join("")}
            </div>
          </div>

          <div class="field" data-field="reviewNotes">
            <label for="reviewNotes">Feasibility notes</label>
            <textarea id="reviewNotes" name="reviewNotes"
              placeholder="What is possible, what you would change, what material you would use…">${esc(request.review?.notes || "")}</textarea>
            <p class="field__hint">The buyer sees this. Be specific — it is the most useful part of the reply.</p>
          </div>

          <button type="submit" class="btn btn--accent btn--block" data-save-decision>
            ${icon("check", { size: 18 })} Save decision
          </button>

          ${
            request.review
              ? `<p class="tiny" style="margin-top:var(--sp-3)">${icon("clock", { size: 13 })} Last reviewed ${esc(formatDateTime(request.review.reviewedAt))}</p>`
              : ""
          }
        </form>

        <form class="panel" data-quote-form>
          <h3 style="font-size:var(--text-md)">${icon("rupee", { size: 18 })} 2. Price &amp; delivery</h3>

          ${
            gate.ok
              ? callout(
                  "ok",
                  "checkCircle",
                  "Unlocked — you marked this feasible",
                  `<p class="small">Enter the price and the window you are willing to commit to.
                  Both are estimates, and the buyer is told so.</p>`
                )
              : callout(
                  "warn",
                  "lock",
                  "Locked until you complete the review",
                  `<p class="small">${esc(gate.reason)}</p>
                  <p class="small">This is deliberate: a buyer must never see a price before an
                  artisan has reviewed the request.</p>`
                )
          }

          <div class="form-grid" style="margin-top:var(--sp-4)">
            <div class="field" data-field="priceINR">
              <label for="priceINR">Price (₹)</label>
              <input class="input" id="priceINR" name="priceINR" type="number" min="1" step="1"
                inputmode="numeric" value="${esc(request.quote?.priceINR ?? "")}"
                ${gate.ok ? "" : "disabled"} aria-describedby="priceINR-hint priceINR-error" />
              <p class="field__hint" id="priceINR-hint">Demo value. No payment is processed.</p>
              <p class="field__error" id="priceINR-error">${icon("alert", { size: 15 })} <span data-error-text></span></p>
            </div>
            <div class="field" data-field="deliveryWindowDays">
              <label for="deliveryWindowDays">Estimated window (days)</label>
              <input class="input" id="deliveryWindowDays" name="deliveryWindowDays" type="number"
                min="1" step="1" inputmode="numeric"
                value="${esc(request.quote?.deliveryWindowDays ?? "")}"
                ${gate.ok ? "" : "disabled"}
                aria-describedby="deliveryWindowDays-hint deliveryWindowDays-error" />
              <p class="field__hint" id="deliveryWindowDays-hint">
                Shown to the buyer as ${esc(request.quote ? formatWindow(request.quote.deliveryWindowDays) : "an estimated range")}.
              </p>
              <p class="field__error" id="deliveryWindowDays-error">${icon("alert", { size: 15 })} <span data-error-text></span></p>
            </div>
          </div>

          <div class="field" data-field="artisanNotes">
            <label for="artisanNotes">Notes with the quote</label>
            <textarea id="artisanNotes" name="artisanNotes" ${gate.ok ? "" : "disabled"}
              placeholder="Material, what is included, what could change the timeline…">${esc(request.quote?.artisanNotes || "")}</textarea>
          </div>

          <button type="submit" class="btn btn--accent btn--block" data-send-quote ${gate.ok ? "" : "disabled"}>
            ${icon("tag", { size: 18 })} Send quote to buyer
          </button>

          ${
            request.quote
              ? `<p class="tiny" style="margin-top:var(--sp-3)">${icon("checkCircle", { size: 13 })}
                  Quote sent ${esc(formatDateTime(request.quote.quotedAt))} —
                  ${esc(formatINR(request.quote.priceINR))} · ${esc(formatWindow(request.quote.deliveryWindowDays))}</p>`
              : ""
          }
        </form>

        <div class="panel">
          <h3 style="font-size:var(--text-md)">${icon("printer", { size: 18 })} Technical brief</h3>
          <p class="small">A one-page brief with every detail, the concept and permission warnings, and the fabrication distinction.</p>
          <a class="btn btn--ghost btn--block" href="#/portal/request/${esc(request.id)}/brief" target="_blank" rel="noopener">
            ${icon("doc", { size: 18 })} Open brief (print / save as PDF)
          </a>
        </div>
      </div>
    </div>`;

  return portalShell("queue", body);
}

function customSummary(request) {
  const m = request.measurements || {};
  const parts = Object.entries(m)
    .filter(([, v]) => String(v ?? "").trim() !== "")
    .map(([k, v]) => `${k} ${v}"`);
  return parts.length ? parts.join(", ") : "not entered";
}

/* ---------------- Mount ---------------- */

export function mountPortal(params) {
  bindRoleSwitch();
  bindResetDemo();

  const reviewForm = document.querySelector("[data-review-form]");
  const quoteForm = document.querySelector("[data-quote-form]");
  const noteForm = document.querySelector("[data-note-form]");

  if (noteForm) {
    noteForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const field = noteForm.querySelector('[data-field="note"]');
      const textarea = noteForm.querySelector("#note");
      const request = getRequest(params.id);
      try {
        upsertRequest(artisanNote(request, textarea.value));
        reload();
      } catch (err) {
        if (err instanceof RequestError) {
          field.classList.add("has-error");
          const slot = field.querySelector("[data-error-text]");
          if (slot) slot.textContent = err.message;
          focusElement(textarea);
        } else throw err;
      }
    });
  }

  if (reviewForm) {
    reviewForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const request = getRequest(params.id);
      if (!request) return;
      const decision = reviewForm.querySelector('input[name="decision"]:checked');
      if (!decision) {
        announce("Choose a feasibility decision first.", "assertive");
        return;
      }
      const notes = reviewForm.querySelector("#reviewNotes").value;
      try {
        const updated = recordFeasibility(request, { decision: decision.value, notes });
        upsertRequest(updated);
        announce(`Decision saved: ${decisionLabel(decision.value)}.`);
        reload();
      } catch (err) {
        if (err instanceof RequestError) {
          announce(err.message, "assertive");
        } else throw err;
      }
    });
  }

  if (quoteForm) {
    quoteForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const request = getRequest(params.id);
      if (!request) return;

      clearFieldErrors(quoteForm);

      const priceField = quoteForm.querySelector('[data-field="priceINR"]');
      const windowField = quoteForm.querySelector('[data-field="deliveryWindowDays"]');
      const price = quoteForm.querySelector("#priceINR").value;
      const days = quoteForm.querySelector("#deliveryWindowDays").value;

      try {
        const updated = submitQuote(request, {
          priceINR: price,
          deliveryWindowDays: days,
          artisanNotes: quoteForm.querySelector("#artisanNotes").value,
        });
        upsertRequest(updated);
        announce("Quote sent to the buyer view.");
        reload();
      } catch (err) {
        if (err instanceof RequestError && err.code === "INVALID_QUOTE") {
          let parsed = {};
          try {
            parsed = JSON.parse(err.message.replace("Invalid quote: ", ""));
          } catch {
            parsed = {};
          }
          if (parsed.priceINR) setFieldError(priceField, parsed.priceINR);
          if (parsed.deliveryWindowDays) setFieldError(windowField, parsed.deliveryWindowDays);
          announce("There is a problem with the quote fields.", "assertive");
          focusElement(quoteForm.querySelector(".has-error input") || quoteForm);
        } else if (err instanceof RequestError) {
          announce(err.message, "assertive");
        } else throw err;
      }
    });
  }
}

function clearFieldErrors(form) {
  form.querySelectorAll(".field.has-error").forEach((f) => f.classList.remove("has-error"));
}

function setFieldError(field, message) {
  if (!field) return;
  field.classList.add("has-error");
  const slot = field.querySelector("[data-error-text]");
  if (slot) slot.textContent = message;
}

function bindRoleSwitch() {
  document.querySelectorAll("[data-role]").forEach((el) => {
    el.addEventListener("click", () => {
      saveRole(el.dataset.role === "artisan" ? ROLES.ARTISAN : ROLES.BUYER);
    });
  });
}

function bindResetDemo() {
  const btn = document.querySelector("[data-reset-demo]");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const { clearRequests, seedIfEmpty } = await import("../lib/store.js");
    const { makeDemoSeed } = await import("../lib/seed.js");
    clearRequests();
    seedIfEmpty(makeDemoSeed);
    reload();
  });
}

function reload() {
  const hash = window.location.hash;
  window.location.hash = `${hash.split("?")[0]}?r=${Date.now()}`;
}

export { openForReview };
