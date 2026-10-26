/**
 * THE QUOTE GATE.
 *
 * The single most important rule in this prototype: a buyer must never see
 * a price or a delivery date before an artisan has reviewed the request and
 * explicitly returned a quote.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  createRequest,
  validateRequestInput,
  openForReview,
  recordFeasibility,
  submitQuote,
  canSubmitQuote,
  buyerFacingQuote,
  buyerReply,
  hasBeenReviewed,
  queueCounts,
  FEASIBILITY,
  STATUS,
  RequestError,
} from "../assets/js/lib/requests.js";

const base = {
  textileId: "kotpad",
  garmentId: "kurti",
  styleId: "minimal",
  designPath: "curated",
  assetId: "ASSET-PLAIN-01",
  colourwayId: "ivory",
  placementId: "hem-border",
  fabricPreference: "artisan-to-advise",
  sizeOrMeasurement: "chart",
  size: "M",
  buyerName: "Test Buyer",
  buyerContact: "buyer@example.invalid",
  notes: "Testing the gate.",
};

test("validation rejects an incomplete request", () => {
  const { ok, errors } = validateRequestInput({ textileId: "kotpad" });
  assert.equal(ok, false);
  assert.ok(errors.garmentId, "garment error reported");
  assert.ok(errors.buyerName, "buyer name error reported");
});

test("validation rejects a malformed contact detail", () => {
  const { ok, errors } = validateRequestInput({ ...base, buyerContact: "not-a-contact" });
  assert.equal(ok, false);
  assert.ok(errors.buyerContact);
});

test("validation accepts a phone-shaped contact", () => {
  const { ok } = validateRequestInput({ ...base, buyerContact: "+91 98765 43210" });
  assert.equal(ok, true);
});

test("validation requires at least one custom measurement in custom mode", () => {
  const { ok, errors } = validateRequestInput({
    ...base,
    sizeOrMeasurement: "custom",
    measurements: { chest: "", waist: "", length: "", sleeve: "" },
  });
  assert.equal(ok, false);
  assert.ok(errors.measurements);
});

test("createRequest starts in SUBMITTED with no quote", () => {
  const r = createRequest(base);
  assert.equal(r.status, STATUS.SUBMITTED);
  assert.equal(r.quote, null);
  assert.equal(r.review, null);
  assert.match(r.id, /^ODK-/);
});

test("createRequest refuses invalid input", () => {
  assert.throws(() => createRequest({ textileId: "kotpad" }), RequestError);
});

test("GATE: no quote is visible on a fresh request", () => {
  const r = createRequest(base);
  assert.equal(buyerFacingQuote(r), null, "buyer must not see a quote yet");
});

test("GATE: a quote cannot be submitted before any review", () => {
  const r = createRequest(base);
  const gate = canSubmitQuote(r);
  assert.equal(gate.ok, false);
  assert.match(gate.reason, /feasibility decision first/i);
  assert.throws(() => submitQuote(r, { priceINR: 2500, deliveryWindowDays: 21 }), RequestError);
  assert.equal(buyerFacingQuote(r), null);
});

test("GATE: marking feasible does NOT reveal a price", () => {
  let r = createRequest(base);
  r = openForReview(r);
  r = recordFeasibility(r, { decision: FEASIBILITY.FEASIBLE, notes: "Can be made." });
  assert.equal(hasBeenReviewed(r), true);
  assert.equal(r.quote, null, "decision alone must not create a quote");
  assert.equal(buyerFacingQuote(r), null, "buyer still sees no price");
});

test("GATE: a not-feasible decision can never be quoted", () => {
  let r = createRequest(base);
  r = recordFeasibility(r, { decision: FEASIBILITY.NOT_FEASIBLE, notes: "Yarn unavailable." });
  assert.equal(r.status, STATUS.NOT_FEASIBLE);
  assert.equal(canSubmitQuote(r).ok, false);
  assert.throws(() => submitQuote(r, { priceINR: 100, deliveryWindowDays: 5 }), RequestError);
});

test("GATE: needs-clarification can never be quoted until resolved", () => {
  let r = createRequest(base);
  r = recordFeasibility(r, { decision: FEASIBILITY.NEEDS_CLARIFICATION, notes: "Which length?" });
  assert.equal(r.status, STATUS.NEEDS_CLARIFICATION);
  assert.equal(canSubmitQuote(r).ok, false);
  assert.equal(buyerFacingQuote(r), null);
});

test("buyer reply returns the request to review, still without a quote", () => {
  let r = createRequest(base);
  r = recordFeasibility(r, { decision: FEASIBILITY.NEEDS_CLARIFICATION, notes: "Which length?" });
  r = buyerReply(r, "Knee length, please.");
  assert.equal(r.status, STATUS.IN_REVIEW);
  assert.equal(r.thread.length, 1);
  assert.equal(r.thread[0].from, "buyer");
  assert.equal(buyerFacingQuote(r), null);
});

test("quote only becomes visible after an explicit submitQuote", () => {
  let r = createRequest(base);
  r = openForReview(r);
  r = recordFeasibility(r, { decision: FEASIBILITY.FEASIBLE, notes: "Feasible in cotton." });
  r = submitQuote(r, { priceINR: 2450, deliveryWindowDays: 21, artisanNotes: "Includes stitching." });

  assert.equal(r.status, STATUS.QUOTED);
  const quote = buyerFacingQuote(r);
  assert.ok(quote, "quote now exists");
  assert.equal(quote.priceINR, 2450);
  assert.equal(quote.deliveryWindowDays, 21);
  assert.equal(quote.isEstimate, true);
});

test("quote validation rejects zero, negative, and non-numeric values", () => {
  let r = createRequest(base);
  r = recordFeasibility(r, { decision: FEASIBILITY.FEASIBLE });

  assert.throws(() => submitQuote(r, { priceINR: 0, deliveryWindowDays: 21 }), RequestError);
  assert.throws(() => submitQuote(r, { priceINR: -5, deliveryWindowDays: 21 }), RequestError);
  assert.throws(() => submitQuote(r, { priceINR: "abc", deliveryWindowDays: 21 }), RequestError);
  assert.throws(() => submitQuote(r, { priceINR: 100, deliveryWindowDays: 0 }), RequestError);
  assert.equal(buyerFacingQuote(r), null, "still no quote after rejected attempts");
});

test("a second quote cannot be sent over an existing one", () => {
  let r = createRequest(base);
  r = recordFeasibility(r, { decision: FEASIBILITY.FEASIBLE });
  r = submitQuote(r, { priceINR: 2450, deliveryWindowDays: 21 });
  assert.equal(canSubmitQuote(r).ok, false);
  assert.throws(() => submitQuote(r, { priceINR: 9999, deliveryWindowDays: 1 }), RequestError);
  assert.equal(buyerFacingQuote(r).priceINR, 2450, "original quote preserved");
});

test("feasibility cannot be changed after a quote without reopening", () => {
  let r = createRequest(base);
  r = recordFeasibility(r, { decision: FEASIBILITY.FEASIBLE });
  r = submitQuote(r, { priceINR: 2450, deliveryWindowDays: 21 });
  assert.throws(
    () => recordFeasibility(r, { decision: FEASIBILITY.NOT_FEASIBLE }),
    RequestError
  );
});

test("unknown feasibility decisions are refused", () => {
  const r = createRequest(base);
  assert.throws(() => recordFeasibility(r, { decision: "maybe" }), RequestError);
});

test("queueCounts buckets requests correctly", () => {
  let a = createRequest(base, { id: "ODK-TEST-1" });
  const b = recordFeasibility(createRequest(base, { id: "ODK-TEST-2" }), {
    decision: FEASIBILITY.NEEDS_CLARIFICATION,
  });
  let c = recordFeasibility(createRequest(base, { id: "ODK-TEST-3" }), {
    decision: FEASIBILITY.FEASIBLE,
  });
  c = submitQuote(c, { priceINR: 100, deliveryWindowDays: 7 });
  const d = recordFeasibility(createRequest(base, { id: "ODK-TEST-4" }), {
    decision: FEASIBILITY.NOT_FEASIBLE,
  });
  a = openForReview(a);

  const counts = queueCounts([a, b, c, d]);
  assert.equal(counts.all, 4);
  assert.equal(counts.awaiting, 1);
  assert.equal(counts.needsClarification, 1);
  assert.equal(counts.quoted, 1);
  assert.equal(counts.notFeasible, 1);
});

test("handlers are pure — the original record is never mutated", () => {
  const original = createRequest(base);
  const frozen = JSON.stringify(original);
  const reviewed = recordFeasibility(original, { decision: FEASIBILITY.FEASIBLE });
  assert.equal(JSON.stringify(original), frozen, "original unchanged");
  assert.notEqual(reviewed, original);
});
