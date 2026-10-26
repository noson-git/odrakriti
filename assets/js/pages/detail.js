/**
 * Odrakriti — Textile / design detail.
 */

import { icon } from "../lib/icons.js";
import { esc } from "../lib/dom.js";
import { getTextile, pilotTextiles, SOURCE_PDF } from "../data/textiles.js";
import { CATALOG, getCatalogEntry, offeringLabel } from "../data/catalog.js";
import { getGarment, getStyle } from "../data/garments.js";
import { getAsset, ASSET_KIND } from "../data/assets.js";
import { COLORWAYS } from "../data/colorways.js";
import {
  provenancePanel,
  badge,
  fabricationBadge,
  permissionBadge,
  PILOT_CALLOUT,
  PERMISSION_CALLOUT,
} from "../components/ui.js";
import { garmentSVG, placeholderTileSVG } from "../lib/silhouettes.js";

export function detailPage(params, query = {}) {
  const textile = getTextile(params.id);

  if (!textile) {
    return `<section class="section"><div class="container container--narrow">
      <div class="empty">
        <p><strong>Textile reference not found.</strong></p>
        <p class="small muted">It may not be part of this pilot catalog.</p>
        <p><a class="btn btn--ghost" href="#/explore">${icon("arrowLeft", { size: 16 })} Back to catalog</a></p>
      </div>
    </div></section>`;
  }

  const entries = CATALOG.filter((e) => e.textileId === textile.id);
  const focusEntry = query.item ? getCatalogEntry(query.item) : entries[0];
  const garment = getGarment(focusEntry?.garmentId);
  const style = getStyle(focusEntry?.styleId);
  const asset = getAsset(focusEntry?.assetId);
  const isPlaceholder = asset && asset.kind === ASSET_KIND.PLACEHOLDER;
  const cw = COLORWAYS[(focusEntry?.order ?? 0) % COLORWAYS.length];

  const art = isPlaceholder
    ? placeholderTileSVG("Design asset withheld pending permission")
    : garmentSVG({
        silhouette: garment?.silhouette || "tunic",
        fill: cw.hex,
        placement: focusEntry?.offering === "custom-concept" ? "panel-front" : null,
        title: `${textile.name} — neutral demo silhouette in ${cw.name} colourway. No heritage motif is shown.`,
      });

  const siblings = entries
    .map(
      (e) => `<a class="chip" href="#/design/${esc(textile.id)}?item=${esc(e.id)}"
        aria-pressed="${e.id === focusEntry?.id ? "true" : "false"}">
        ${esc(getGarment(e.garmentId)?.name || e.garmentId)} · ${esc(getStyle(e.styleId)?.name || e.styleId)}
      </a>`
    )
    .join("");

  return `
  <section class="section">
    <div class="container">
      <nav aria-label="Breadcrumb" class="small" style="margin-bottom:var(--sp-5)">
        <a href="#/">Home</a> <span aria-hidden="true">/</span>
        <a href="#/explore">Explore designs</a> <span aria-hidden="true">/</span>
        <span aria-current="page">${esc(textile.shortName)}</span>
      </nav>

      <div class="detail">
        <div>
          <div class="detail__media">
            ${art}
            <p class="media-note">
              ${icon("lock", { size: 13 })} Neutral demo silhouette — not a photograph, and not evidence of a handwoven product.
            </p>
          </div>

          <div class="panel" style="margin-top:var(--sp-5)">
            <h3 style="font-size:var(--text-md)">${icon("grid", { size: 18 })} Available demo directions</h3>
            <ul class="chip-list" style="margin-top:var(--sp-3)">${siblings}</ul>
            <p class="tiny muted" style="margin-top:var(--sp-4)">
              Garment and style are styling choices for a contemporary buyer. They are not
              claims about traditional garment forms.
            </p>
          </div>
        </div>

        <div class="stack-lg">
          <div>
            <div class="badge-row" style="margin-bottom:var(--sp-4)">
              ${badge("neutral", "leaf", textile.candidate ? "Candidate — scope not locked" : "Pilot")}
              ${focusEntry ? badge(
                focusEntry.offering === "ready-made" ? "ok" : "concept",
                focusEntry.offering === "ready-made" ? "checkCircle" : "sparkles",
                offeringLabel(focusEntry.offering)
              ) : ""}
              ${focusEntry ? fabricationBadge(focusEntry.fabrication) : ""}
              ${permissionBadge(textile.permission.status)}
            </div>

            <h1>${esc(textile.name)}</h1>
            <p class="lede">${esc(textile.techniqueDetail)}</p>

            <div class="row row--tight" style="margin-top:var(--sp-5)">
              <a class="btn btn--accent" href="#/request/${esc(textile.id)}">
                ${icon("scissors", { size: 18 })} Start a customisation request
              </a>
              <a class="btn btn--ghost" href="#/how">${icon("route", { size: 18 })} How it works</a>
            </div>

            <p class="tiny muted" style="margin-top:var(--sp-4)">
              Sending a request does not produce a price. An artisan must review feasibility first.
            </p>
          </div>

          <div class="stack">
            <div class="panel panel--alt">
              <h4 style="font-size:var(--text-sm);font-family:var(--font-body);text-transform:uppercase;letter-spacing:var(--tracking-wide);color:var(--fg-muted)">
                ${icon("doc", { size: 16 })} What this entry actually is
              </h4>
              <dl class="dl" style="margin-top:var(--sp-3)">
                <dt>Offering</dt><dd>${esc(focusEntry ? offeringLabel(focusEntry.offering) : "—")}</dd>
                <dt>Fabrication</dt>
                <dd>${
                  focusEntry?.fabrication === "plain"
                    ? "Plain fabric field — carries no motif, so it makes no heritage claim."
                    : "Method not confirmed. A motif reference exists for this tradition but no motif asset has been approved, so nothing is drawn and no method is claimed."
                }</dd>
                <dt>Design asset</dt>
                <dd>${asset ? `<span class="mono">${esc(asset.id)}</span> — ${esc(asset.name)}` : "—"}</dd>
                <dt>Asset status</dt><dd>${asset ? esc(asset.approvalLabel) : "—"}</dd>
                <dt>Colourway</dt>
                <dd>${esc(cw.name)} <span class="tiny muted">(styling choice, not a claimed traditional dye)</span></dd>
              </dl>
              ${asset ? `<p class="small" style="margin-top:var(--sp-4)">${esc(asset.note)}</p>` : ""}
            </div>

            ${PERMISSION_CALLOUT}
          </div>

          ${provenancePanel(textile)}
        </div>
      </div>
    </div>
  </section>

  <section class="section section--alt">
    <div class="container container--narrow">
      ${PILOT_CALLOUT}
      <div class="panel" style="margin-top:var(--sp-5)">
        <h3 style="font-size:var(--text-md)">${icon("info", { size: 18 })} How to read the citation</h3>
        <p class="small">
          This entry is matched to <strong>${esc(SOURCE_PDF.title)}</strong>, published by
          ${esc(SOURCE_PDF.publisher)}, at page ${esc(String(textile.citation.page))},
          ${esc(textile.citation.entry)}.
        </p>
        <p class="small">
          A source-matched citation tells you where a description came from. It is
          <strong>not</strong> an authentication of any specific cloth, and it is
          <strong>not</strong> a licence to reuse photographs or designs. Permission from the
          artisan, cooperative, or rights holder is a separate step that has not happened here.
        </p>
        <p class="citation">${esc(SOURCE_PDF.url)}</p>
        <p class="tiny muted">${esc(SOURCE_PDF.reVerifyNote)}</p>
      </div>

      <p style="margin-top:var(--sp-5)">
        <a class="btn btn--ghost" href="#/explore">${icon("arrowLeft", { size: 16 })} Back to catalog</a>
      </p>

      <p class="tiny muted">
        Other candidate traditions in this pilot:
        ${pilotTextiles()
          .filter((t) => t.id !== textile.id)
          .map((t) => `<a href="#/design/${esc(t.id)}">${esc(t.name)}</a>`)
          .join(" · ") || "none"}
      </p>
    </div>
  </section>`;
}
