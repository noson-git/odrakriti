/**
 * jsdom boot helper for the end-to-end test.
 *
 * This runs the REAL app modules — the same app.js, router, pages and
 * store that the browser runs — against a real DOM implementation, so the
 * e2e test exercises shipped code rather than a re-implementation.
 */

import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const indexHtml = readFileSync(join(here, "..", "..", "index.html"), "utf8");

let bootedWindow = null;

/**
 * Boot the app ONCE and reuse the window for every test.
 *
 * store.js probes window.localStorage at module load, so a fresh jsdom
 * window per test would leave the app writing to the first window's
 * storage and leak state between tests. Reusing one window keeps the app
 * and the storage it captured in sync; resetApp() gives each test a clean
 * slate instead.
 */
export async function bootApp() {
  if (bootedWindow) {
    await resetApp(bootedWindow);
    return bootedWindow;
  }

  const dom = new JSDOM(indexHtml, {
    url: "http://localhost:8000/",
    pretendToBeVisual: true,
  });

  const { window } = dom;

  // jsdom leaves these unimplemented; the app calls them during navigation.
  window.scrollTo = () => {};
  window.print = () => {
    window.__printed = (window.__printed || 0) + 1;
  };
  if (!window.HashChangeEvent) {
    window.HashChangeEvent = class HashChangeEvent extends window.Event {
      constructor(type, init = {}) {
        super(type, init);
      }
    };
  }

  // Publish the jsdom globals before importing, because store.js probes
  // window.localStorage at module load time.
  // Node 22 defines some of these as getter-only, so use defineProperty.
  const define = (name, value) => {
    Object.defineProperty(global, name, {
      value,
      writable: true,
      configurable: true,
    });
  };

  define("window", window);
  define("document", window.document);
  define("localStorage", window.localStorage);
  define("navigator", window.navigator);
  define("HTMLElement", window.HTMLElement);
  define("Element", window.Element);
  define("Node", window.Node);
  define("Event", window.Event);
  define("CustomEvent", window.CustomEvent);
  define("HashChangeEvent", window.HashChangeEvent);
  define("getComputedStyle", window.getComputedStyle.bind(window));

  window.localStorage.clear();

  await import("../../assets/js/app.js");
  await tick();

  bootedWindow = window;
  return window;
}

/** Clear every demo record and re-seed, then return to the home route. */
export async function resetApp(window) {
  const store = await import("../../assets/js/lib/store.js");
  const { makeDemoSeed } = await import("../../assets/js/lib/seed.js");

  window.localStorage.clear();
  store.resetSeedFlag();
  store.seedIfEmpty(makeDemoSeed);

  window.location.hash = "#/";
  window.dispatchEvent(new window.Event("hashchange"));
  await tick(12);
  return window;
}

export function tick(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Navigate by hash and let the router re-render. */
export async function go(window, hash) {
  const target = hash.startsWith("#") ? hash : `#${hash}`;
  window.location.hash = target;
  window.dispatchEvent(new window.Event("hashchange"));
  await tick(10);
  return window.document;
}

export function q(window, selector) {
  return window.document.querySelector(selector);
}

export function qq(window, selector) {
  return Array.from(window.document.querySelectorAll(selector));
}

export function text(window, selector) {
  const el = q(window, selector);
  return el ? el.textContent.replace(/\s+/g, " ").trim() : null;
}

export function bodyText(window) {
  return window.document.body.textContent.replace(/\s+/g, " ").trim();
}

/**
 * Real click, bubbling, so delegated handlers fire.
 * Async: handlers may change location.hash, and the router re-renders on
 * the following hashchange, so callers must await before querying the DOM.
 */
export async function click(window, element) {
  element.dispatchEvent(
    new window.MouseEvent("click", { bubbles: true, cancelable: true, view: window })
  );
  await tick(12);
}

export async function clickSelector(window, selector) {
  const el = q(window, selector);
  if (!el) throw new Error(`no element for selector: ${selector}`);
  await click(window, el);
}

export async function setValue(window, element, value) {
  element.value = value;
  element.dispatchEvent(new window.Event("input", { bubbles: true }));
  element.dispatchEvent(new window.Event("change", { bubbles: true }));
  await tick(8);
}

export async function checkRadio(window, selector) {
  const el = q(window, selector);
  if (!el) throw new Error(`no radio for selector: ${selector}`);
  el.checked = true;
  el.dispatchEvent(new window.Event("change", { bubbles: true }));
  await tick(8);
}

export async function submitForm(window, selector) {
  const form = q(window, selector);
  if (!form) throw new Error(`no form for selector: ${selector}`);
  form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
  await tick(20);
}
