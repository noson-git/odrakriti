/**
 * Odrakriti — small DOM helpers (no framework).
 */

/** Escape untrusted text for insertion into HTML. */
export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Create an element from a trusted HTML string. */
export function html(strings, ...values) {
  // Tagged-template convenience: values are NOT auto-escaped.
  // Callers must pass esc()-ed data. Kept explicit on purpose so that
  // escaping is visible at every call site.
  let out = String(strings[0]);
  for (let i = 0; i < values.length; i += 1) {
    out += String(values[i] ?? "") + String(strings[i + 1] ?? "");
  }
  return out;
}

/** Parse an HTML string into a DocumentFragment. */
export function fragment(markup) {
  const tpl = document.createElement("template");
  tpl.innerHTML = markup.trim();
  return tpl.content;
}

/** Render markup into a container, replacing its contents. */
export function render(container, markup) {
  container.replaceChildren(fragment(markup));
  return container;
}

export function $(selector, root = document) {
  return root.querySelector(selector);
}

export function $$(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

/** Delegated event binding. Returns an unbind function. */
export function on(root, type, selector, handler) {
  const listener = (event) => {
    const target = event.target instanceof Element ? event.target.closest(selector) : null;
    if (target && root.contains(target)) handler(event, target);
  };
  root.addEventListener(type, listener);
  return () => root.removeEventListener(type, listener);
}

/** Move focus to an element, creating it focusable if needed. */
export function focusElement(el) {
  if (!el) return;
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: false });
}

/** Announce a message to assistive technology. */
let liveRegion = null;
export function announce(message, politeness = "polite") {
  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.setAttribute("role", "status");
    liveRegion.setAttribute("aria-live", politeness);
    liveRegion.className = "sr-only";
    document.body.appendChild(liveRegion);
  }
  liveRegion.setAttribute("aria-live", politeness);
  liveRegion.textContent = "";
  // Reset so identical consecutive messages are still announced.
  window.setTimeout(() => {
    liveRegion.textContent = message;
  }, 60);
}
