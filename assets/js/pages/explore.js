/**
 * Odrakriti — Browse catalog.
 *
 * Filter state lives entirely in the URL query so filters are
 * deep-linkable, survive refresh, and need no extra state layer.
 */

import { icon } from "../lib/icons.js";
import { esc } from "../lib/dom.js";
import { CATALOG, applyFilters, FACET_LABELS, offeringLabel } from "../data/catalog.js";
import { getGarment, getStyle } from "../data/garments.js";
import { getTextile } from "../data/textiles.js";
import { getAsset, ASSET_KIND } from "../data/assets.js";
import { PILOT_CALLOUT, badge, fabricationBadge, permissionBadge } from "../components/ui.js";
import { garmentSVG, placeholderTileSVG } from "../lib/silhouettes.js";
import { COLORWAYS } from "../data/colorways.js";

const FACETS = ["textile", "garment", "style", "offering"];

function readFilters(query) {
  const filters = {};
  for (const facet of FACETS) {
    const raw = query[facet];
    filters[facet] = raw ? String(raw).split(",").filter(Boolean) : [];
  }
  return filters;
}

function writeQuery(query, facet, value) {
  const current = query[facet] ? String(query[facet]).split(",").filter(Boolean) : [];
  const next = current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
  const params = new URLSearchParams();
  for (const f of FACETS) {
    let list = query[f] ? String(query[f]).split(",").filter(Boolean) : [];
    if (f === facet) list = next;
    if (list.length) params.set(f, list.join(","));
  }
  if (query.q) params.set("q", String(query.q));
  const qs = params.toString();
  return `#/explore${qs ? `?${qs}` : ""}`;
}

function clearHref(query) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", String(query.q));
  const qs = params.toString();
  return `#/explore${qs ? `?${qs}` : ""}`;
}

function facetLabel(facet, value) {
  if (facet === "textile") return getTextile(value)?.name || value;
  if (facet === "garment") return getGarment(value)?.name || value;
  if (facet === "style") return getStyle(value)?.name || value;
  if (facet === "offering") return offeringLabel(value);
  return value;
}

function facetValues(facet) {
  const seen = new Set();
  for (const e of CATALOG) {
    const key =
      facet === "textile"
        ? "textileId"
        : facet === "garment"
          ? "garmentId"
          : facet === "style"
            ? "styleId"
            : "offering";
    seen.add(e[key]);
  }
  return Array.from(seen);
}

function countFor(facet, value, filters, query) {
  const probe = { ...filters, [facet]: [value] };
  // Count without the facet's own constraint, so counts stay useful.
  const relaxed = { ...filters, [facet]: [] };
  const withThis = applyFilters(CATALOG, { ...relaxed, [facet]: [value] }, query.q || "");
  void probe;
  return withThis.length;
}

function entryCard(entry) {
  const textile = getTextile(entry.textileId);
  const garment = getGarment(entry.garmentId);
  const style = getStyle(entry.styleId);
  const asset = getAsset(entry.assetId);
  const isPlaceholder = asset && asset.kind === ASSET_KIND.PLACEHOLDER;
  const cw = COLORWAYS[(entry.order ?? 0) % COLORWAYS.length];

  const art = isPlaceholder
    ? placeholderTileSVG("Design asset withheld pending permission")
    : garmentSVG({
        silhouette: garment?.silhouette || "tunic",
        fill: cw.hex,
        placement: entry.offering === "custom-concept" ? "panel-front" : null,
        title: `${textile?.name || "Textile"} — ${garment?.name || "garment"} demo silhouette. No motif shown.`,
      });

  return `<a class="card card--link" href="#/design/${esc(entry.textileId)}?item=${esc(entry.id)}">
    <span class="card__media">${art}</span>
    <span class="card__body">
      <span class="badge-row">
        ${badge("neutral", "leaf", "Candidate")}
        ${badge(
          entry.offering === "ready-made" ? "ok" : "concept",
          entry.offering === "ready-made" ? "checkCircle" : "sparkles",
          offeringLabel(entry.offering)
        )}
        ${fabricationBadge(entry.fabrication)}
        ${permissionBadge(entry.permissionStatus)}
      </span>
      <span class="card__title">${esc(textile?.name || "Textile")}</span>
      <span class="card__meta">${esc(garment?.name || "")} · ${esc(style?.name || "")}</span>
      <span class="card__meta">${esc(asset ? asset.approvalLabel : "No asset")}</span>
    </span>
  </a>`;
}

export function explorePage(_params, query = {}) {
  const filters = readFilters(query);
  const results = applyFilters(CATALOG, filters, query.q || "");
  const activeCount = FACETS.reduce((n, f) => n + filters[f].length, 0) + (query.q ? 1 : 0);

  return `
  <section class="section">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">Explore designs</p>
        <h1>Browse the pilot catalog</h1>
        <p class="lede">
          Every card states what it is: a candidate textile reference, a garment and style
          direction, the fabrication method, and the permission status of the design asset.
        </p>
      </div>

      ${PILOT_CALLOUT}

      <div class="catalog" style="margin-top:var(--sp-6)">
        <form class="filters" role="search" data-explore-form aria-label="Catalog filters">
          <div class="filters__group">
            <p class="filters__legend"><label for="catalog-q">Search</label></p>
            <input class="input" id="catalog-q" name="q" type="search"
              value="${esc(query.q || "")}" placeholder="e.g. kurti, minimal, Kotpad"
              autocomplete="off" />
          </div>

          ${FACETS.map(
            (facet) => `
            <fieldset class="filters__group" data-facet="${esc(facet)}">
              <legend>${esc(FACET_LABELS[facet])}</legend>
              <ul class="chip-list">
                ${facetValues(facet)
                  .map((value) => {
                    const on = filters[facet].includes(value);
                    const n = countFor(facet, value, filters, query);
                    return `<li><a class="chip" href="${esc(writeQuery(query, facet, value))}"
                      aria-pressed="${on ? "true" : "false"}">
                      <span>${esc(facetLabel(facet, value))}</span>
                      <span class="chip__count">${n}</span>
                    </a></li>`;
                  })
                  .join("")}
              </ul>
            </fieldset>`
          ).join("")}

          <div class="filters__group">
            <a class="btn btn--ghost btn--sm btn--block" href="${esc(clearHref(query))}">
              ${icon("refresh", { size: 16 })} Clear all filters
            </a>
          </div>
        </form>

        <div>
          <div class="catalog__bar">
            <p class="catalog__count" data-result-count aria-live="polite">
              ${results.length} design${results.length === 1 ? "" : "s"} shown
              ${activeCount ? ` · ${activeCount} filter${activeCount === 1 ? "" : "s"} active` : ""}
            </p>
            ${
              activeCount
                ? `<a class="btn btn--quiet btn--sm" href="${esc(clearHref(query))}">${icon("x", { size: 16 })} Reset</a>`
                : ""
            }
          </div>

          ${
            results.length
              ? `<div class="catalog__grid">${results.map(entryCard).join("")}</div>`
              : `<div class="empty">
                  <p><strong>${icon("search", { size: 18 })} No designs match these filters.</strong></p>
                  <p class="small muted">The pilot catalog is intentionally small. Try removing a filter, or
                  search for “kurti”, “minimal”, or a textile name.</p>
                  <p><a class="btn btn--ghost btn--sm" href="#/explore">${icon("refresh", { size: 16 })} Show all designs</a></p>
                </div>`
          }
        </div>
      </div>
    </div>
  </section>`;
}
