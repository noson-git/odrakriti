/**
 * Odrakriti — formatting helpers (pure).
 */

/**
 * Format a demo price in Indian rupees.
 * Uses plain string formatting rather than Intl so the output is
 * identical in every browser and in the printed brief.
 */
export function formatINR(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  const rounded = Math.round(n * 100) / 100;
  const [intPart, decPart] = String(rounded.toFixed(2)).split(".");
  const withCommas = groupIndian(intPart);
  const decimals = decPart === "00" ? "" : `.${decPart}`;
  return `₹${withCommas}${decimals}`;
}

/** Indian digit grouping: last three, then pairs (1,23,45,678). */
export function groupIndian(intStr) {
  const s = String(intStr);
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  return `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${last3}`;
}

/** "3–4 weeks" style window from a day count. Always an estimate. */
export function formatWindow(days) {
  const n = Number(days);
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n < 7) return `about ${Math.round(n)} day${Math.round(n) === 1 ? "" : "s"} (estimate)`;
  const low = Math.floor(n / 7);
  const high = Math.ceil((n * 1.15) / 7);
  if (low === high) return `about ${low} week${low === 1 ? "" : "s"} (estimate)`;
  return `about ${low}–${high} weeks (estimate)`;
}

export function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${formatDate(iso)}, ${d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

/** Human label for a feasibility decision. */
export function decisionLabel(decision) {
  switch (decision) {
    case "feasible":
      return "Feasible — can be made";
    case "not_feasible":
      return "Not feasible as requested";
    case "needs_clarification":
      return "Needs clarification";
    default:
      return "Not yet reviewed";
  }
}
