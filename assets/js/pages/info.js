/**
 * Odrakriti — How it works, and About / limitations.
 */

import { icon } from "../lib/icons.js";
import { esc } from "../lib/dom.js";
import { TEXTILES, SOURCE_PDF, SCOPE_LOCKED } from "../data/textiles.js";
import { PROTOTYPE_CALLOUT, callout, badge } from "../components/ui.js";
import { ENGINE } from "../lib/concept.js";

export function howPage() {
  const steps = [
    {
      icon: "search",
      title: "1. Explore curated, source-checked designs",
      body:
        "Browse the pilot catalog. Every entry names its textile, its region where a source supports it, and the technique described in the cited entry. Each card also states its permission status, so nothing looks approved when it is not.",
    },
    {
      icon: "scissors",
      title: "2. Choose a garment and a styling direction",
      body:
        "Kurti, shirt, T-shirt or trousers, read as casual, streetwear or minimal. These are contemporary styling choices, not claims about traditional garment forms.",
    },
    {
      icon: "sparkles",
      title: "3. Pick a design path",
      body:
        "Either choose a curated asset from the demo library, or ask the simulated concept engine to arrange approved assets into variations. The engine cannot invent a motif — if the approved list is empty it returns nothing.",
    },
    {
      icon: "ruler",
      title: "4. Size and customisation",
      body:
        "Use the size chart for the selected garment, or send custom measurements. Demo measurements are labelled illustrative. Add colourway, placement, fabric preference and notes.",
    },
    {
      icon: "handHeart",
      title: "5. Send for artisan review",
      body:
        "The request goes to the artisan portal. The buyer sees 'Request sent for artisan review' — and no price, no delivery date, no promise.",
    },
    {
      icon: "eye",
      title: "6. The artisan decides",
      body:
        "The artisan marks the request feasible, not feasible, or needing clarification. Only a request marked feasible can be given a price and an estimated delivery window.",
    },
    {
      icon: "tag",
      title: "7. The quote comes back to the buyer",
      body:
        "The buyer's tracking page reveals the price and estimated window only once a quote exists. Until then the price is explicitly shown as hidden.",
    },
    {
      icon: "printer",
      title: "8. A print-ready technical brief",
      body:
        "Every request can be opened as a one-page technical brief and printed or saved as PDF from the browser. It carries the design reference, the fabrication distinction, and the concept and permission warnings.",
    },
  ];

  return `<section class="section">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">How it works</p>
        <h1>From browsing to a quote, in eight steps</h1>
        <p class="lede">
          The whole flow is built around one rule: the artisan decides, and nothing is promised
          before they do.
        </p>
      </div>

      <div class="feature-grid">
        ${steps
          .map(
            (s) => `<article class="feature">
              <span class="feature__icon">${icon(s.icon, { size: 22 })}</span>
              <h3>${esc(s.title)}</h3>
              <p>${esc(s.body)}</p>
            </article>`
          )
          .join("")}
      </div>

      <div class="divider"></div>

      <div class="grid" style="grid-template-columns:1fr">
        ${callout(
          "warn",
          "lock",
          "Why there is no price on the first screen",
          `<p class="small">A marketplace that shows a price before a maker has looked at the work
          is making a promise it cannot keep. Handloom production depends on yarn availability,
          dye lots, loom capacity and the maker's own judgement about a design. So this prototype
          refuses to show a number until the artisan has reviewed the request and sent one back.</p>`
        )}

        ${callout(
          "concept",
          "sparkles",
          "What the concept engine is, exactly",
          `<p class="small"><strong>Engine:</strong> ${esc(ENGINE.id)} — ${esc(ENGINE.kind)}.
          ${esc(ENGINE.description)}</p>
          <p class="small">It may only re-arrange assets already in the approved library and vary
          permitted styling choices: silhouette, placement, colourway, panel scale. It cannot
          invent, alter or copy a heritage motif. Every output is labelled
          <strong>“Concept only — artisan review required.”</strong></p>`
        )}

        ${PROTOTYPE_CALLOUT}
      </div>

      <p style="margin-top:var(--sp-6)">
        <a class="btn btn--accent" href="#/explore">${icon("search", { size: 18 })} Explore designs</a>
        <a class="btn btn--ghost" href="#/portal">${icon("handHeart", { size: 18 })} Open the artisan portal</a>
      </p>
    </div>
  </section>`;
}

export function aboutPage() {
  return `<section class="section">
    <div class="container container--narrow">
      <div class="section-head">
        <p class="eyebrow">About this project</p>
        <h1>Scope, sources and honest limits</h1>
        <p class="lede">
          Odrakriti is a Class 12 OSFIC demonstration prototype about making Odisha's
          traditional crafts legible to younger consumers without flattening them into a
          generic aesthetic.
        </p>
      </div>

      ${PROTOTYPE_CALLOUT}

      <div class="panel" style="margin-top:var(--sp-5)">
        <h3 style="font-size:var(--text-md)">${icon("tag", { size: 18 })} About the name</h3>
        <p class="small">
          <strong>Odrakriti</strong> (pronounced <em>oh-drah-KRI-tee</em>) is a
          <strong>working name for this school-project prototype only</strong>. Its open-web
          screen was preliminary, and an official trademark-register search did not produce
          usable records. Nothing here should be read as a claim that the name is legally
          available, registered, or cleared. No ® or ™ is used anywhere in this project, and no
          trademark clearance is claimed.
        </p>
      </div>

      <div class="panel" style="margin-top:var(--sp-5)">
        <h3 style="font-size:var(--text-md)">${icon("doc", { size: 18 })} Sources</h3>
        <p class="small">
          Textile descriptions are matched to a single public source:
        </p>
        <p class="citation">${esc(SOURCE_PDF.url)}</p>
        <p class="small">${esc(SOURCE_PDF.publisher)} — <em>${esc(SOURCE_PDF.title)}</em>.</p>
        <p class="small">${esc(SOURCE_PDF.reVerifyNote)}</p>
        ${callout(
          "warn",
          "lock",
          "A citation is not a licence",
          `<p class="small">Matching a description to a page in a government database tells you
          where the description came from. It is not an authentication of any specific cloth, and
          it is not permission to reuse photographs or designs. Permission from the artisan,
          cooperative, or rights holder is a separate step, and it has not been obtained for
          anything in this prototype.</p>`
        )}
      </div>

      <div class="panel" style="margin-top:var(--sp-5)">
        <h3 style="font-size:var(--text-md)">${icon("grid", { size: 18 })} Textile scope</h3>
        <p class="small">
          The project intends to feature two or three handloom traditions. That selection is
          <strong>${SCOPE_LOCKED ? "locked" : "not yet locked"}</strong>, so all four researched
          traditions are carried in the catalog as <strong>candidates</strong> and the catalog is
          marked as a pilot demo.
        </p>
        <ul class="small">
          ${TEXTILES.map(
            (t) => `<li><a href="#/design/${esc(t.id)}">${esc(t.name)}</a> —
              ${badge("neutral", "leaf", "candidate")}
              <span class="tiny muted">p.&nbsp;${esc(String(t.citation.page))}, ${esc(t.citation.entry)}</span></li>`
          ).join("")}
        </ul>
      </div>

      <div class="panel" style="margin-top:var(--sp-5)">
        <h3 style="font-size:var(--text-md)">${icon("alert", { size: 18 })} What this prototype does not claim</h3>
        <ul class="small">
          <li>No real artisan partnerships, and no named artisan is participating.</li>
          <li>No real orders, no payments, no production scheduling.</li>
          <li>No real pricing and no confirmed delivery dates.</li>
          <li>No official certification and no trademark clearance.</li>
          <li>No live AI model — the concept engine is transparent demo logic.</li>
          <li>No reproduced photographs from the source database.</li>
          <li>No fabricated heritage motifs presented as authentic.</li>
        </ul>
      </div>

      <div class="panel" id="simulated" style="margin-top:var(--sp-5)">
        <h3 style="font-size:var(--text-md)">${icon("bolt", { size: 18 })} What is simulated</h3>
        <dl class="dl">
          <dt>Sign-in</dt><dd>Role switching only (buyer / artisan). No accounts, no passwords, no server.</dd>
          <dt>Data</dt><dd>Browser local storage. Clearing site data clears the demo.</dd>
          <dt>Quotes</dt><dd>Entered by hand in the artisan portal. Nothing is calculated automatically.</dd>
          <dt>Concepts</dt><dd>${esc(ENGINE.description)}</dd>
          <dt>Imagery</dt><dd>Neutral SVG garment silhouettes drawn by this project.</dd>
          <dt>Notifications</dt><dd>None. The buyer re-opens the tracking page to see a quote.</dd>
        </dl>
      </div>

      <p style="margin-top:var(--sp-6)">
        <a class="btn btn--ghost" href="#/">${icon("arrowLeft", { size: 16 })} Back to home</a>
      </p>
    </div>
  </section>`;
}
