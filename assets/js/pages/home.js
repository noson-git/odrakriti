/**
 * Odrakriti — Home page.
 */

import { icon } from "../lib/icons.js";
import { esc } from "../lib/dom.js";
import { pilotTextiles, SCOPE_LOCKED } from "../data/textiles.js";
import { textileCard, PILOT_CALLOUT, PROTOTYPE_CALLOUT } from "../components/ui.js";
import { garmentSVG } from "../lib/silhouettes.js";

export function homePage() {
  const textiles = pilotTextiles();
  const scopeNote = SCOPE_LOCKED
    ? ""
    : `<p class="tiny muted">${icon("alert", { size: 13 })} Final textile scope is not locked — the catalog is a pilot demo.</p>`;

  return `
  <section class="hero">
    <div class="container">
      <div class="hero__grid">
        <div>
          <p class="eyebrow">Odrakriti — Class 12 OSFIC prototype</p>
          <h1 class="hero__title">Craft heritage, <em>connected</em> to today's style.</h1>
          <p class="lede">
            Odisha's handloom traditions carry extraordinary technique. Young buyers often
            cannot find them in the cuts they actually wear. Odrakriti lets a buyer explore
            source-checked textile references, choose a garment and a styling direction, and
            send a customisation request to an artisan — who reviews feasibility and returns
            a price and delivery estimate.
          </p>
          <div class="hero__cta">
            <a class="btn btn--accent" href="#/explore">${icon("search", { size: 18 })} Explore designs</a>
            <a class="btn btn--ghost" href="#/how">${icon("route", { size: 18 })} How it works</a>
          </div>
          <div class="divider"></div>
          ${scopeNote}
        </div>

        <div class="hero__art">
          <div class="hero__art-inner">
            ${heroFigure("tunic", "Kurti silhouette")}
            ${heroFigure("shirt", "Shirt silhouette")}
            ${heroFigure("tee", "T-shirt silhouette")}
            ${heroFigure("trousers", "Trousers silhouette")}
          </div>
          <p class="hero__caption">
            ${icon("lock", { size: 13 })} Neutral demo silhouettes. No heritage motif is drawn,
            and no photograph from the source database is reproduced.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--alt">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">The problem</p>
        <h2>Traditional craft is hard to discover — and harder to wear.</h2>
        <p class="lede">
          Handloom and traditional textile design can feel distant from a young wardrobe.
          Buyers meet it in sarees and stoles, rarely in the kurtis, shirts, tees and
          trousers they wear every day. And when they do want something made, there is no
          simple way to describe what they want and hear back from the person who would
          actually make it.
        </p>
      </div>

      <div class="feature-grid">
        ${feature("search", "Discover", "Curated, source-checked textile references with provenance you can actually read — not vague labels.")}
        ${feature("scissors", "Choose your cut", "Pick a garment and a styling direction: kurti, shirt, tee or trousers, in a casual, streetwear or minimal reading.")}
        ${feature("sparkles", "Design path", "Use a curated design, or ask the simulated concept engine to arrange approved assets into variations.")}
        ${feature("ruler", "Your size", "Size charts for each garment, or send your own measurements. Demo measurements are labelled as illustrative.")}
        ${feature("handHeart", "Artisan decides", "The artisan reviews feasibility, then returns a price and delivery estimate. Nothing is promised before that.")}
        ${feature("doc", "Technical brief", "Every request produces a print-ready brief — garment, size, asset reference, colourway, placement, warnings.")}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head row row--between">
        <div>
          <p class="eyebrow">Pilot catalog</p>
          <h2>Four candidate traditions</h2>
          <p class="lede">
            Each entry carries a source-matched citation and an explicit permission status.
            These are references for study and design direction — not confirmed products.
          </p>
        </div>
        <a class="btn btn--ghost btn--sm" href="#/explore">Open catalog ${icon("arrowRight", { size: 16 })}</a>
      </div>

      ${PILOT_CALLOUT}

      <div class="catalog__grid" style="margin-top:var(--sp-5)">
        ${textiles.map((t) => textileCard(t)).join("")}
      </div>
    </div>
  </section>

  <section class="section section--alt">
    <div class="container container--narrow">
      ${PROTOTYPE_CALLOUT}
      <div class="panel panel--lead" style="margin-top:var(--sp-5)">
        <h3 style="font-size:var(--text-md)">What this project deliberately does not do</h3>
        <ul class="small">
          <li>No payments, no checkout, no real orders.</li>
          <li>No claim of real artisan partnerships, official certification, or trademark clearance.</li>
          <li>No price or delivery date before an artisan has reviewed the request.</li>
          <li>No fabricated heritage motifs, and no reused photographs.</li>
          <li>No live AI model — the concept engine is transparent demo logic.</li>
        </ul>
      </div>
    </div>
  </section>`;
}

function heroFigure(silhouette, label) {
  return `<div class="hero__figure">
    ${garmentSVG({
      silhouette,
      fill: "#efe7d8",
      title: `${label} — neutral demo silhouette, no motif shown`,
    })}
  </div>`;
}

function feature(iconName, title, body) {
  return `<article class="feature">
    <span class="feature__icon">${icon(iconName, { size: 22 })}</span>
    <h3>${esc(title)}</h3>
    <p>${esc(body)}</p>
  </article>`;
}
