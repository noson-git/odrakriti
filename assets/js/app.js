/**
 * Odrakriti — application entry point.
 *
 * No framework, no build step. ES modules served as static files.
 * Run with any static server (see README).
 */

import { Router } from "./lib/router.js";
import { $, $$, announce } from "./lib/dom.js";
import { icon } from "./lib/icons.js";
import { seedIfEmpty, storageMode } from "./lib/store.js";
import { makeDemoSeed } from "./lib/seed.js";

import { homePage } from "./pages/home.js";
import { explorePage } from "./pages/explore.js";
import { detailPage } from "./pages/detail.js";
import { requestPage, mountWizard } from "./pages/wizard.js";
import { sentPage, trackPage, mountTrack } from "./pages/track.js";
import { howPage, aboutPage } from "./pages/info.js";
import { portalPage, portalRequestPage, mountPortal } from "./pages/portal.js";
import { briefPage, mountBrief } from "./pages/brief.js";

const NAV = [
  ["#/", "Home", /^\/$/],
  ["#/explore", "Explore designs", /^\/explore/],
  ["#/how", "How it works", /^\/how/],
  ["#/about", "About", /^\/about/],
  ["#/portal", "Artisan portal", /^\/portal/],
];

function notFoundPage(path) {
  return `<section class="section"><div class="container container--narrow">
    <div class="empty">
      <p><strong>${icon("search", { size: 20 })} No page at ${path}</strong></p>
      <p class="small muted">That route does not exist in this prototype.</p>
      <p>
        <a class="btn btn--accent" href="#/">${icon("arrowLeft", { size: 16 })} Go home</a>
        <a class="btn btn--ghost" href="#/explore">${icon("search", { size: 16 })} Explore designs</a>
      </p>
    </div>
  </div></section>`;
}

function updateActiveNav(path) {
  for (const [href, , pattern] of NAV) {
    const links = $$(`a[href="${href}"]`);
    const active = pattern.test(path);
    for (const link of links) {
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
  }
}

function closeDrawer() {
  const drawer = $("#nav-drawer");
  const toggle = $("#nav-toggle");
  if (drawer) drawer.dataset.open = "false";
  if (toggle) toggle.setAttribute("aria-expanded", "false");
}

function wireChrome() {
  const toggle = $("#nav-toggle");
  const drawer = $("#nav-drawer");

  if (toggle && drawer) {
    toggle.addEventListener("click", () => {
      const open = drawer.dataset.open === "true";
      drawer.dataset.open = open ? "false" : "true";
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
    });
  }

  // Close the drawer when a link inside it is chosen.
  if (drawer) {
    drawer.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeDrawer();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDrawer();
  });

  // The explore search field submits by rewriting the query string.
  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-explore-form]");
    if (!form) return;
    event.preventDefault();
    const value = form.querySelector("#catalog-q")?.value || "";
    const params = new URLSearchParams(window.location.hash.split("?")[1] || "");
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    const qs = params.toString();
    window.location.hash = `#/explore${qs ? `?${qs}` : ""}`;
  });
}

function onNavigate(current) {
  updateActiveNav(current.path);
  closeDrawer();

  // Move focus to the main heading so screen-reader users get oriented.
  const main = $("#main");
  const heading = main?.querySelector("h1");
  if (heading) {
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  }
  window.scrollTo({ top: 0, behavior: "auto" });

  const { pattern, params } = current;
  if (pattern === "/request/:textileId") mountWizard(params);
  if (pattern === "/track/:id") mountTrack(params);
  if (pattern === "/portal" || pattern === "/portal/request/:id") mountPortal(params);
  if (pattern === "/portal/request/:id/brief") mountBrief();

  announce(pageTitle(current.path));
}

function pageTitle(path) {
  const match = NAV.find(([, , pattern]) => pattern.test(path));
  return match ? `Odrakriti — ${match[1]}` : "Odrakriti";
}

function boot() {
  seedIfEmpty(makeDemoSeed);

  const root = $("#main");
  const router = new Router({ root, onNavigate, notFound: notFoundPage });

  router
    .add("/", homePage, { title: "Home" })
    .add("/explore", explorePage, { title: "Explore designs" })
    .add("/design/:id", detailPage, { title: "Textile detail" })
    .add("/request/:textileId", requestPage, { title: "Customisation request" })
    .add("/sent/:id", sentPage, { title: "Request sent" })
    .add("/track/:id", trackPage, { title: "Track request" })
    .add("/how", howPage, { title: "How it works" })
    .add("/about", aboutPage, { title: "About" })
    .add("/portal", portalPage, { title: "Artisan portal" })
    .add("/portal/request/:id", portalRequestPage, { title: "Review request" })
    .add("/portal/request/:id/brief", briefPage, { title: "Technical brief" });

  wireChrome();
  router.start();

  // Surface the storage mode in the footer so a demo never silently lies
  // about persistence.
  const modeEl = $("#storage-mode");
  if (modeEl) {
    modeEl.textContent =
      storageMode() === "memory"
        ? "in-memory only (local storage unavailable in this browser)"
        : "your browser's local storage";
  }

  window.__odrakriti = { router, storageMode: storageMode() };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
