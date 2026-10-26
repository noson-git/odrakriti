/**
 * Odrakriti — Customisation request state machine (pure, no DOM).
 * ------------------------------------------------------------------
 * THE CENTRAL RULE OF THIS PROTOTYPE
 *
 *   A buyer must never see a price or a delivery date before an artisan
 *   has reviewed the request and explicitly returned a quote.
 *
 * That rule is enforced here, in one place, by `canSubmitQuote()` and
 * `buyerFacingQuote()`. Every UI path reads through these functions;
 * nothing renders a price directly off the raw record.
 *
 * These functions are pure and immutable so they can be unit-tested in
 * Node without a browser (see tests/requests.test.mjs).
 */

export const STATUS = {
  SUBMITTED: "submitted",
  IN_REVIEW: "in_review",
  NEEDS_CLARIFICATION: "needs_clarification",
  QUOTED: "quoted",
  NOT_FEASIBLE: "not_feasible",
};

export const FEASIBILITY = {
  FEASIBLE: "feasible",
  NOT_FEASIBLE: "not_feasible",
  NEEDS_CLARIFICATION: "needs_clarification",
};

export const STATUS_META = {
  [STATUS.SUBMITTED]: {
    label: "Awaiting artisan review",
    buyerMessage:
      "Request sent for artisan review. No price or delivery date can be shown yet.",
    tone: "review",
    icon: "clock",
  },
  [STATUS.IN_REVIEW]: {
    label: "In artisan review",
    buyerMessage:
      "An artisan is reviewing your request. No price or delivery date can be shown yet.",
    tone: "review",
    icon: "eye",
  },
  [STATUS.NEEDS_CLARIFICATION]: {
    label: "Artisan needs clarification",
    buyerMessage:
      "The artisan has a question before they can confirm feasibility. Reply below to continue.",
    tone: "info",
    icon: "question",
  },
  [STATUS.QUOTED]: {
    label: "Quote returned",
    buyerMessage:
      "The artisan reviewed your request and returned a price and estimated delivery window.",
    tone: "ok",
    icon: "checkCircle",
  },
  [STATUS.NOT_FEASIBLE]: {
    label: "Not feasible as requested",
    buyerMessage:
      "The artisan reviewed your request and cannot make it as specified. See their note for why, and what could change.",
    tone: "no",
    icon: "xCircle",
  },
};

export class RequestError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "RequestError";
    this.code = code;
  }
}

const REQUIRED_FIELDS = [
  ["textileId", "Choose a textile tradition."],
  ["garmentId", "Choose a garment."],
  ["styleId", "Choose a style direction."],
  ["designPath", "Choose a design path."],
  ["sizeOrMeasurement", "Choose a size, or enter custom measurements."],
  ["buyerName", "Enter a name so the artisan knows who to reply to."],
  ["buyerContact", "Enter a contact detail for the demo reply."],
];

/**
 * Validate a draft request. Returns { ok, errors } where errors is a
 * map of fieldName -> message. Used both by the form UI (inline errors)
 * and by createRequest (defence in depth).
 */
export function validateRequestInput(input = {}) {
  const errors = {};
  for (const [field, message] of REQUIRED_FIELDS) {
    const value = input[field];
    if (value === undefined || value === null || String(value).trim() === "") {
      errors[field] = message;
    }
  }

  if (input.sizeOrMeasurement === "custom") {
    const m = input.measurements || {};
    if (!m.chest && !m.waist) {
      errors.measurements =
        "Enter at least chest or waist so the artisan has something to work from.";
    }
  }

  if (input.buyerContact) {
    const c = String(input.buyerContact).trim();
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);
    const looksLikePhone = /^[0-9+\-\s()]{8,16}$/.test(c);
    if (!looksLikeEmail && !looksLikePhone) {
      errors.buyerContact =
        "Enter a valid email address or a phone number (8–16 digits).";
    }
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

let counter = 0;

/**
 * Demo request-id generator. Deliberately simple and readable so a
 * Class 12 student can explain it on a whiteboard.
 */
export function nextRequestId(now = new Date()) {
  counter += 1;
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `ODK-${stamp}-${String(counter).padStart(4, "0")}`;
}

/** Create a new request. Throws RequestError if required fields are missing. */
export function createRequest(input, options = {}) {
  const { ok, errors } = validateRequestInput(input);
  if (!ok) {
    throw new RequestError("INVALID_INPUT", `Invalid request: ${JSON.stringify(errors)}`);
  }
  const now = (options.now || new Date()).toISOString();
  return {
    id: options.id || nextRequestId(options.now ? new Date(options.now) : undefined),
    createdAt: now,
    updatedAt: now,
    status: STATUS.SUBMITTED,
    textileId: input.textileId,
    garmentId: input.garmentId,
    styleId: input.styleId,
    designPath: input.designPath, // 'curated' | 'concept'
    assetId: input.assetId || null,
    concept: input.concept || null, // concept descriptor, if designPath === 'concept'
    colourwayId: input.colourwayId || null,
    placementId: input.placementId || null,
    fabricPreference: input.fabricPreference || null,
    sizeOrMeasurement: input.sizeOrMeasurement,
    size: input.size || null,
    measurements: input.measurements || null,
    buyerName: String(input.buyerName).trim(),
    buyerContact: String(input.buyerContact).trim(),
    notes: input.notes ? String(input.notes).trim() : "",
    /** Artisan side — stays null until reviewed. */
    review: null,
    /** Never populated except via submitQuote(). */
    quote: null,
    /** Buyer <-> artisan clarification thread (demo). */
    thread: [],
  };
}

/** Artisan opens the request. Moves it out of the untouched queue. */
export function openForReview(request, options = {}) {
  if (request.status !== STATUS.SUBMITTED) return request;
  return {
    ...request,
    status: STATUS.IN_REVIEW,
    updatedAt: (options.now || new Date()).toISOString(),
  };
}

/**
 * Artisan records a feasibility decision.
 * NOTE: recording "feasible" does NOT reveal a price. The quote is a
 * separate, explicit step.
 */
export function recordFeasibility(request, { decision, notes = "" } = {}, options = {}) {
  if (!Object.values(FEASIBILITY).includes(decision)) {
    throw new RequestError("BAD_DECISION", `Unknown feasibility decision: ${decision}`);
  }
  if (request.status === STATUS.QUOTED) {
    throw new RequestError(
      "ALREADY_QUOTED",
      "This request has already been quoted. Reopen it before changing the decision."
    );
  }

  const nextStatus =
    decision === FEASIBILITY.NOT_FEASIBLE
      ? STATUS.NOT_FEASIBLE
      : decision === FEASIBILITY.NEEDS_CLARIFICATION
        ? STATUS.NEEDS_CLARIFICATION
        : STATUS.IN_REVIEW;

  return {
    ...request,
    status: nextStatus,
    updatedAt: (options.now || new Date()).toISOString(),
    review: {
      decision,
      notes: String(notes).trim(),
      reviewedAt: (options.now || new Date()).toISOString(),
    },
  };
}

/**
 * THE GATE. A quote may only be submitted once the artisan has recorded
 * a decision of `feasible`. Everything else is refused.
 */
export function canSubmitQuote(request) {
  if (!request) return { ok: false, reason: "No request selected." };
  if (!request.review) {
    return {
      ok: false,
      reason: "Record a feasibility decision first. A quote cannot be sent before review.",
    };
  }
  if (request.review.decision !== FEASIBILITY.FEASIBLE) {
    return {
      ok: false,
      reason: `Decision is "${request.review.decision}". Only a request marked feasible can be quoted.`,
    };
  }
  if (request.quote) {
    return { ok: false, reason: "A quote has already been sent for this request." };
  }
  return { ok: true, reason: "" };
}

/** Validate quote fields without mutating anything. */
export function validateQuote({ priceINR, deliveryWindowDays } = {}) {
  const errors = {};
  const price = Number(priceINR);
  const window = Number(deliveryWindowDays);
  if (!Number.isFinite(price) || price <= 0) {
    errors.priceINR = "Enter a price greater than zero.";
  }
  if (!Number.isFinite(window) || window <= 0) {
    errors.deliveryWindowDays = "Enter an estimated window in days greater than zero.";
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

/**
 * Submit the quote. This is the ONLY way `request.quote` becomes non-null,
 * and the ONLY way the buyer-facing view will ever show a price.
 */
export function submitQuote(request, quoteInput, options = {}) {
  const gate = canSubmitQuote(request);
  if (!gate.ok) throw new RequestError("QUOTE_BLOCKED", gate.reason);

  const { ok, errors } = validateQuote(quoteInput);
  if (!ok) {
    throw new RequestError("INVALID_QUOTE", `Invalid quote: ${JSON.stringify(errors)}`);
  }

  const now = (options.now || new Date()).toISOString();
  return {
    ...request,
    status: STATUS.QUOTED,
    updatedAt: now,
    quote: {
      priceINR: Number(quoteInput.priceINR),
      deliveryWindowDays: Number(quoteInput.deliveryWindowDays),
      artisanNotes: quoteInput.artisanNotes
        ? String(quoteInput.artisanNotes).trim()
        : "",
      quotedAt: now,
      isEstimate: true,
    },
  };
}

/** Buyer replies to a clarification request. Returns it to the artisan queue. */
export function buyerReply(request, message, options = {}) {
  if (!message || !String(message).trim()) {
    throw new RequestError("EMPTY_REPLY", "Write a reply before sending.");
  }
  const now = (options.now || new Date()).toISOString();
  return {
    ...request,
    status: STATUS.IN_REVIEW,
    updatedAt: now,
    thread: [
      ...request.thread,
      { from: "buyer", at: now, text: String(message).trim() },
    ],
  };
}

/** Artisan posts a note into the thread (does not change feasibility). */
export function artisanNote(request, message, options = {}) {
  if (!message || !String(message).trim()) {
    throw new RequestError("EMPTY_NOTE", "Write a note before posting.");
  }
  const now = (options.now || new Date()).toISOString();
  return {
    ...request,
    updatedAt: now,
    thread: [
      ...request.thread,
      { from: "artisan", at: now, text: String(message).trim() },
    ],
  };
}

/**
 * THE OTHER HALF OF THE GATE.
 * Returns the quote ONLY once it exists. Otherwise returns null, and the
 * buyer UI must render the "awaiting review" state instead.
 */
export function buyerFacingQuote(request) {
  if (!request) return null;
  if (request.status !== STATUS.QUOTED) return null;
  if (!request.quote) return null;
  return request.quote;
}

/** True once the artisan has made any feasibility decision. */
export function hasBeenReviewed(request) {
  return !!request && !!request.review && !!request.review.decision;
}

/** Sorted view model for the artisan dashboard. */
export function queueCounts(requests) {
  const base = {
    all: requests.length,
    awaiting: 0,
    needsClarification: 0,
    quoted: 0,
    notFeasible: 0,
  };
  for (const r of requests) {
    if (r.status === STATUS.SUBMITTED || r.status === STATUS.IN_REVIEW) base.awaiting += 1;
    if (r.status === STATUS.NEEDS_CLARIFICATION) base.needsClarification += 1;
    if (r.status === STATUS.QUOTED) base.quoted += 1;
    if (r.status === STATUS.NOT_FEASIBLE) base.notFeasible += 1;
  }
  return base;
}
