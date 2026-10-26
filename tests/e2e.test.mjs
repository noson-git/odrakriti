/**
 * END-TO-END: the real app, in a real DOM.
 *
 * Boots assets/js/app.js via jsdom (see helpers/dom-env.mjs) and drives
 * the buyer and artisan journeys through the actual shipped code paths.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  bootApp,
  go,
  q,
  qq,
  text,
  bodyText,
  click,
  setValue,
  checkRadio,
  submitForm,
} from "./helpers/dom-env.mjs";

/* ---------------- Buyer: home ---------------- */

test("home explains the project and links to Explore and How It Works", async () => {
  const win = await bootApp();
  assert.match(bodyText(win), /Craft heritage/i);
  assert.ok(q(win, 'a[href="#/explore"]'), "Explore designs link present");
  assert.ok(q(win, 'a[href="#/how"]'), "How it works link present");
  assert.match(bodyText(win), /Demonstration prototype/i);
});

test("home marks the catalog as a pilot because scope is not locked", async () => {
  const win = await bootApp();
  assert.match(bodyText(win), /not locked/i);
  assert.match(bodyText(win), /candidate/i);
});

test("no emoji are used as icons anywhere in the rendered home page", async () => {
  const win = await bootApp();
  const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
  assert.equal(emoji.test(bodyText(win)), false, "found an emoji in the rendered output");
  assert.ok(qq(win, "svg").length > 5, "SVG icons are actually being rendered");
});

/* ---------------- Buyer: catalog + filters ---------------- */

test("catalog renders cards and the pilot notice", async () => {
  const win = await bootApp();
  const doc = await go(win, "/explore");
  assert.ok(doc.querySelectorAll(".catalog__grid .card").length > 0, "cards rendered");
  assert.match(bodyText(win), /Pilot demo catalog/i);
  assert.match(bodyText(win), /designs shown|design shown/i);
});

test("every catalog card states its permission status", async () => {
  const win = await bootApp();
  const doc = await go(win, "/explore");
  const cards = Array.from(doc.querySelectorAll(".catalog__grid .card"));
  assert.ok(cards.length >= 4);
  for (const card of cards) {
    assert.match(card.textContent, /Permission pending/i);
  }
});

test("no card claims a handwoven fabrication", async () => {
  const win = await bootApp();
  const doc = await go(win, "/explore");
  const cards = Array.from(doc.querySelectorAll(".catalog__grid .card"));
  for (const card of cards) {
    assert.doesNotMatch(card.textContent, /Handwoven fabric/i);
  }
});

test("a filter chip narrows results and is reflected in the live region", async () => {
  const win = await bootApp();
  await go(win, "/explore");
  const all = qq(win, ".catalog__grid .card").length;

  const doc = await go(win, "/explore?garment=kurti");
  const filtered = doc.querySelectorAll(".catalog__grid .card").length;
  assert.ok(filtered > 0, "filter returned results");
  assert.ok(filtered < all, "filter narrowed the list");
  assert.match(text(win, "[data-result-count]"), /filter active|filters active/i);
});

test("an impossible filter shows a helpful empty state, not a blank screen", async () => {
  const win = await bootApp();
  const doc = await go(win, "/explore?textile=nope&garment=nope");
  assert.equal(doc.querySelectorAll(".catalog__grid .card").length, 0);
  assert.match(bodyText(win), /No designs match these filters/i);
  assert.ok(q(win, 'a[href="#/explore"]'), "offers a way back");
});

test("search query filters the catalog", async () => {
  const win = await bootApp();
  const doc = await go(win, "/explore?q=kotpad");
  const cards = Array.from(doc.querySelectorAll(".catalog__grid .card"));
  assert.ok(cards.length > 0);
  for (const c of cards) assert.match(c.textContent, /Kotpad/i);
});

/* ---------------- Buyer: detail + provenance ---------------- */

test("detail page shows provenance with citation and pending permission", async () => {
  const win = await bootApp();
  const doc = await go(win, "/design/kotpad");
  assert.match(bodyText(win), /Provenance & permissions/i);
  assert.match(bodyText(win), /p\. 15/i);
  assert.match(bodyText(win), /Gobardhan Panika/i);
  assert.match(bodyText(win), /Aal-root/i);
  assert.match(bodyText(win), /Permission not confirmed/i);
  assert.match(bodyText(win), /not a reuse licence/i);
  assert.ok(doc.querySelector(".citation"), "source URL is cited");
});

test("detail page never claims a traditional community or colour", async () => {
  const win = await bootApp();
  await go(win, "/design/sambalpuri-ikat");
  assert.match(bodyText(win), /not stated in the cited entry/i);
  assert.match(bodyText(win), /not asserted/i);
  assert.doesNotMatch(bodyText(win), /tribal pattern/i);
});

/* ---------------- Buyer: wizard ---------------- */

async function walkWizard(win, textile = "kotpad") {
  await go(win, `/request/${textile}`);

  // Step 1 — garment and style.
  await click(win, q(win, '[data-set="garmentId"][data-value="kurti"]'));
  await click(win, q(win, '[data-set="styleId"][data-value="minimal"]'));
  await submitForm(win, "[data-wizard]");

  // Step 2 — curated design path, asset, placement.
  await click(win, q(win, '[data-set="designPath"][data-value="curated"]'));
  await click(win, q(win, '[data-set="assetId"]'));
  await click(win, q(win, '[data-set="placementId"][data-value="hem-border"]'));
  await submitForm(win, "[data-wizard]");

  // Step 3 — size.
  await click(win, q(win, '[data-set="size"][data-value="M"]'));
  await submitForm(win, "[data-wizard]");
}

test("wizard refuses to advance without a garment and shows why", async () => {
  const win = await bootApp();
  await go(win, "/request/kotpad");
  await submitForm(win, "[data-wizard]");
  assert.ok(q(win, ".error-summary"), "error summary rendered");
  assert.match(bodyText(win), /There is a problem/i);
  assert.equal(q(win, ".error-summary").getAttribute("tabindex"), "-1", "summary is focusable");
});

test("wizard cannot reach review with an incomplete design step", async () => {
  const win = await bootApp();
  await go(win, "/request/kotpad");
  await click(win, q(win, '[data-set="garmentId"][data-value="kurti"]'));
  await click(win, q(win, '[data-set="styleId"][data-value="minimal"]'));
  await submitForm(win, "[data-wizard]");
  // Now on step 2 with nothing chosen.
  await submitForm(win, "[data-wizard]");
  assert.match(bodyText(win), /Choose a design path/i);
});

test("wizard validation rejects a bad contact detail on the review step", async () => {
  const win = await bootApp();
  await walkWizard(win);
  await setValue(win, q(win, "#buyerName"), "Test Buyer");
  await setValue(win, q(win, "#buyerContact"), "not-a-contact");
  await submitForm(win, "[data-wizard]");

  assert.match(bodyText(win), /valid email address or a phone number/i);
  assert.ok(q(win, '[data-field="buyerContact"].has-error'), "field flagged");
  // Still on the review step — nothing was submitted.
  assert.doesNotMatch(win.location.hash, /\/sent\//);
});

test("GATE: completing the wizard never produces a price", async () => {
  const win = await bootApp();
  await walkWizard(win);
  await setValue(win, q(win, "#buyerName"), "Test Buyer");
  await setValue(win, q(win, "#buyerContact"), "buyer@example.invalid");
  await submitForm(win, "[data-wizard]");

  assert.match(win.location.hash, /#\/sent\/ODK-/);
  assert.match(bodyText(win), /Request sent for artisan review/i);
  assert.match(bodyText(win), /No price or delivery date yet/i);
  assert.doesNotMatch(bodyText(win), /₹\s?\d/);
});

test("GATE: the buyer tracking page hides price until a quote exists", async () => {
  const win = await bootApp();
  await walkWizard(win);
  await setValue(win, q(win, "#buyerName"), "Test Buyer");
  await setValue(win, q(win, "#buyerContact"), "buyer@example.invalid");
  await submitForm(win, "[data-wizard]");

  const id = win.location.hash.match(/#\/sent\/(ODK-[^?]+)/)[1];
  await go(win, `/track/${id}`);

  assert.match(bodyText(win), /Not available yet/i);
  assert.match(bodyText(win), /Hidden until the artisan sends a quote/i);
  assert.doesNotMatch(bodyText(win), /₹\s?\d/);
});

/* ---------------- AI-assisted concept path ---------------- */

test("concept path only offers assets from the approved library and labels them concept-only", async () => {
  const win = await bootApp();
  await go(win, "/request/kotpad");
  await click(win, q(win, '[data-set="garmentId"][data-value="kurti"]'));
  await click(win, q(win, '[data-set="styleId"][data-value="minimal"]'));
  await submitForm(win, "[data-wizard]");

  await click(win, q(win, '[data-set="designPath"][data-value="concept"]'));

  assert.match(bodyText(win), /Concept only — artisan review required/i);
  assert.match(bodyText(win), /no live AI model/i);
  assert.match(bodyText(win), /cannot invent, alter, or copy a heritage motif/i);

  const conceptButtons = qq(win, "[data-concept]");
  assert.ok(conceptButtons.length > 0, "concept variations offered");

  const { DESIGN_ASSETS } = await import("../assets/js/data/assets.js?boot=concept");
  const allowed = new Set(DESIGN_ASSETS.map((a) => a.id));
  for (const btn of conceptButtons) {
    assert.ok(
      allowed.has(btn.dataset.conceptAsset),
      `concept offers an asset outside the approved library: ${btn.dataset.conceptAsset}`
    );
  }
});

test("a selected concept carries its warning into the preview", async () => {
  const win = await bootApp();
  await go(win, "/request/kotpad");
  await click(win, q(win, '[data-set="garmentId"][data-value="kurti"]'));
  await click(win, q(win, '[data-set="styleId"][data-value="minimal"]'));
  await submitForm(win, "[data-wizard]");
  await click(win, q(win, '[data-set="designPath"][data-value="concept"]'));

  await click(win, q(win, "[data-concept]"));
  assert.match(text(win, "[data-preview-body]"), /Concept only/i);
  assert.match(text(win, "[data-preview-body]"), /AI-assisted concept/i);
});

/* ---------------- Artisan portal ---------------- */

test("portal opens with the demo seed request and no price", async () => {
  const win = await bootApp();
  const doc = await go(win, "/portal");
  assert.match(bodyText(win), /Customisation requests/i);
  assert.match(bodyText(win), /ODK-DEMO-0001/i);
  assert.match(bodyText(win), /Not quoted/i);
  assert.match(bodyText(win), /Demo data only/i);
});

test("GATE: quote fields are disabled until a feasibility decision is recorded", async () => {
  const win = await bootApp();
  const doc = await go(win, "/portal/request/ODK-DEMO-0001");

  const price = doc.querySelector("#priceINR");
  const days = doc.querySelector("#deliveryWindowDays");
  const send = doc.querySelector("[data-send-quote]");

  assert.equal(price.disabled, true, "price locked");
  assert.equal(days.disabled, true, "delivery locked");
  assert.equal(send.disabled, true, "send locked");
  assert.match(bodyText(win), /Locked until you complete the review/i);
  assert.match(bodyText(win), /must never see a price before an artisan has reviewed/i);
});

test("marking feasible unlocks the quote step but still shows no buyer price", async () => {
  const win = await bootApp();
  await go(win, "/portal/request/ODK-DEMO-0001");

  await checkRadio(win, 'input[name="decision"][value="feasible"]');
  await setValue(win, q(win, "#reviewNotes"), "Can be made in cotton.");
  await submitForm(win, "[data-review-form]");

  const doc = await go(win, "/portal/request/ODK-DEMO-0001");
  assert.equal(doc.querySelector("#priceINR").disabled, false, "price unlocked");
  assert.match(bodyText(win), /Unlocked — you marked this feasible/i);

  // Buyer side must still show nothing until the quote is actually sent.
  await go(win, "/track/ODK-DEMO-0001");
  assert.match(bodyText(win), /Not available yet/i);
  assert.doesNotMatch(bodyText(win), /₹\s?\d/);
});

test("needs-clarification keeps the quote locked and asks the buyer a question", async () => {
  const win = await bootApp();
  await go(win, "/portal/request/ODK-DEMO-0001");
  await checkRadio(win, 'input[name="decision"][value="needs_clarification"]');
  await setValue(win, q(win, "#reviewNotes"), "Which length do you want?");
  await submitForm(win, "[data-review-form]");

  const doc = await go(win, "/portal/request/ODK-DEMO-0001");
  assert.equal(doc.querySelector("#priceINR").disabled, true);

  await go(win, "/track/ODK-DEMO-0001");
  assert.match(bodyText(win), /needs one more detail|needs clarification/i);
  assert.ok(q(win, "[data-reply-form]"), "buyer can reply");
});

test("not-feasible closes the request without ever offering a price", async () => {
  const win = await bootApp();
  await go(win, "/portal/request/ODK-DEMO-0001");
  await checkRadio(win, 'input[name="decision"][value="not_feasible"]');
  await setValue(win, q(win, "#reviewNotes"), "Yarn unavailable this season.");
  await submitForm(win, "[data-review-form]");

  await go(win, "/track/ODK-DEMO-0001");
  assert.match(bodyText(win), /Not feasible as requested/i);
  assert.doesNotMatch(bodyText(win), /₹\s?\d/);
});

test("the buyer's clarification reply returns the request to the artisan", async () => {
  const win = await bootApp();
  await go(win, "/portal/request/ODK-DEMO-0001");
  await checkRadio(win, 'input[name="decision"][value="needs_clarification"]');
  await setValue(win, q(win, "#reviewNotes"), "Which length?");
  await submitForm(win, "[data-review-form]");

  await go(win, "/track/ODK-DEMO-0001");
  await setValue(win, q(win, "#reply"), "Knee length, please.");
  await submitForm(win, "[data-reply-form]");

  await go(win, "/portal/request/ODK-DEMO-0001");
  assert.match(bodyText(win), /Knee length, please/i);
  assert.match(bodyText(win), /In artisan review/i);

  // The request must be back in the awaiting bucket.
  await go(win, "/portal?tab=awaiting");
  assert.match(bodyText(win), /ODK-DEMO-0001/i);
});

test("quote submission validates its inputs before accepting them", async () => {
  const win = await bootApp();
  await go(win, "/portal/request/ODK-DEMO-0001");
  await checkRadio(win, 'input[name="decision"][value="feasible"]');
  await submitForm(win, "[data-review-form]");

  await go(win, "/portal/request/ODK-DEMO-0001");
  await setValue(win, q(win, "#priceINR"), "0");
  await setValue(win, q(win, "#deliveryWindowDays"), "");
  await submitForm(win, "[data-quote-form]");

  assert.ok(q(win, '[data-field="priceINR"].has-error'), "price error shown");
  assert.ok(q(win, '[data-field="deliveryWindowDays"].has-error'), "window error shown");

  await go(win, "/track/ODK-DEMO-0001");
  assert.doesNotMatch(bodyText(win), /₹\s?\d/);
});

test("sending a quote reveals price and window on the buyer side", async () => {
  const win = await bootApp();
  await go(win, "/portal/request/ODK-DEMO-0001");
  await checkRadio(win, 'input[name="decision"][value="feasible"]');
  await setValue(win, q(win, "#reviewNotes"), "Feasible in cotton.");
  await submitForm(win, "[data-review-form]");

  await go(win, "/portal/request/ODK-DEMO-0001");
  await setValue(win, q(win, "#priceINR"), "2450");
  await setValue(win, q(win, "#deliveryWindowDays"), "21");
  await setValue(win, q(win, "#artisanNotes"), "Includes stitching.");
  await submitForm(win, "[data-quote-form]");

  await go(win, "/track/ODK-DEMO-0001");
  assert.match(bodyText(win), /Quote returned by the artisan/i);
  assert.match(bodyText(win), /₹2,450/);
  assert.match(bodyText(win), /about 3\u20134 weeks \(estimate\)/);
  assert.match(bodyText(win), /estimate, not an order/i);
});

/* ---------------- Technical brief ---------------- */

test("brief carries request details plus concept, permission and fabrication warnings", async () => {
  const win = await bootApp();
  const doc = await go(win, "/portal/request/ODK-DEMO-0001/brief");

  assert.match(bodyText(win), /Request ODK-DEMO-0001/i);
  assert.match(bodyText(win), /Technical brief/i);
  assert.match(bodyText(win), /Concept & approval warning/i);
  assert.match(bodyText(win), /Permission status/i);
  assert.match(bodyText(win), /Fabrication:/i);
  assert.match(bodyText(win), /not a production order/i);
  assert.ok(doc.querySelector("[data-print]"), "print control present");
});

test("brief states the production method is not confirmed when nothing was chosen", async () => {
  const win = await bootApp();
  await go(win, "/portal/request/ODK-DEMO-0001/brief");
  assert.match(bodyText(win), /Production method not confirmed/i);
  assert.match(bodyText(win), /may be described as handwoven until the artisan confirms/i);
});

test("brief shows 'Not quoted' before a quote and the figure after", async () => {
  const win = await bootApp();
  await go(win, "/portal/request/ODK-DEMO-0001/brief");
  assert.match(bodyText(win), /Not quoted/i);
  assert.doesNotMatch(bodyText(win), /₹\s?\d/);

  await go(win, "/portal/request/ODK-DEMO-0001");
  await checkRadio(win, 'input[name="decision"][value="feasible"]');
  await submitForm(win, "[data-review-form]");
  await go(win, "/portal/request/ODK-DEMO-0001");
  await setValue(win, q(win, "#priceINR"), "3100");
  await setValue(win, q(win, "#deliveryWindowDays"), "28");
  await submitForm(win, "[data-quote-form]");

  await go(win, "/portal/request/ODK-DEMO-0001/brief");
  assert.match(bodyText(win), /₹3,100/);
});

test("brief labels a printed-adaptation request as not handwoven", async () => {
  const win = await bootApp();
  await go(win, "/request/kotpad");
  await click(win, q(win, '[data-set="garmentId"][data-value="tshirt"]'));
  await click(win, q(win, '[data-set="styleId"][data-value="streetwear"]'));
  await submitForm(win, "[data-wizard]");
  await click(win, q(win, '[data-set="designPath"][data-value="concept"]'));
  await click(win, q(win, "[data-concept]"));
  // Fabric preference is chosen on the design step, before sizing.
  await setValue(win, q(win, "#fabricPreference"), "printed");
  await submitForm(win, "[data-wizard]");
  await click(win, q(win, '[data-set="size"]'));
  await submitForm(win, "[data-wizard]");

  await setValue(win, q(win, "#buyerName"), "Test Buyer");
  await setValue(win, q(win, "#buyerContact"), "buyer@example.invalid");
  await submitForm(win, "[data-wizard]");

  const id = win.location.hash.match(/#\/sent\/(ODK-[^?]+)/)[1];
  await go(win, `/portal/request/${id}/brief`);

  assert.match(bodyText(win), /Printed adaptation — not handwoven/i);
  assert.match(bodyText(win), /must not be described as handloom-made/i);
  assert.match(bodyText(win), /Concept only — artisan review required/i);
});

/* ---------------- Accessibility wiring ---------------- */

test("unknown routes render a helpful 404 with a way home", async () => {
  const win = await bootApp();
  await go(win, "/no-such-page");
  assert.match(bodyText(win), /No page at/i);
  assert.ok(q(win, 'a[href="#/"]'));
});

test("skip link targets the main landmark", async () => {
  const win = await bootApp();
  const skip = q(win, ".skip-link");
  assert.equal(skip.getAttribute("href"), "#main");
  assert.ok(q(win, "#main"));
});

test("mobile menu toggle is wired and reports its state", async () => {
  const win = await bootApp();
  const toggle = q(win, "#nav-toggle");
  const drawer = q(win, "#nav-drawer");
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(drawer.dataset.open, "false");

  await click(win, toggle);
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  assert.equal(drawer.dataset.open, "true");

  await click(win, toggle);
  assert.equal(drawer.dataset.open, "false");
});

test("every image-bearing SVG has an accessible name", async () => {
  const win = await bootApp();
  await go(win, "/explore");
  const svgs = qq(win, ".card__media svg");
  assert.ok(svgs.length > 0);
  for (const svg of svgs) {
    const named = svg.getAttribute("aria-label") || svg.querySelector("title");
    assert.ok(named, "SVG must have aria-label or <title>");
  }
});

test("decorative icons are hidden from assistive technology", async () => {
  const win = await bootApp();
  await go(win, "/explore");
  const badges = qq(win, ".badge svg");
  assert.ok(badges.length > 0);
  for (const svg of badges) {
    assert.equal(svg.getAttribute("aria-hidden"), "true");
  }
});

test("interactive controls meet a 44px minimum touch target", async () => {
  const win = await bootApp();
  await go(win, "/explore");
  // The rule lives in CSS as --tap: 44px; assert the token and its use.
  const { readFileSync } = await import("node:fs");
  const tokens = readFileSync(new URL("../assets/css/tokens.css", import.meta.url), "utf8");
  assert.match(tokens, /--tap:\s*44px/);
  const components = readFileSync(
    new URL("../assets/css/components.css", import.meta.url),
    "utf8"
  );
  assert.match(components, /min-height:\s*var\(--tap\)/);
});
