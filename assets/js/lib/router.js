/**
 * Odrakriti — tiny hash router. No build step, no framework.
 *
 * Routes are declared as patterns: "/design/:id".
 * Handlers receive (params, query) and return an HTML string.
 */

export class Router {
  constructor({ root, onNavigate, notFound }) {
    this.root = root;
    this.routes = [];
    this.onNavigate = onNavigate || (() => {});
    this.notFound = notFound || (() => "<p>Page not found.</p>");
    this.current = null;
    this._onHash = () => this.resolve();
  }

  add(pattern, handler, meta = {}) {
    const keys = [];
    const regex = new RegExp(
      "^" +
        pattern
          .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
          .replace(/\/:([A-Za-z0-9_]+)/g, (_m, key) => {
            keys.push(key);
            return "/([^/]+)";
          }) +
        "$"
    );
    this.routes.push({ pattern, regex, keys, handler, meta });
    return this;
  }

  parse(hash) {
    const raw = String(hash || "").replace(/^#/, "");
    const [beforeQuery, queryString = ""] = raw.split("?");
    // A trailing in-page fragment ("#/about#simulated") is not part of the
    // route. Split it off so the route still matches, then scroll to it.
    const [path, fragment = ""] = beforeQuery.split("#");
    const query = Object.fromEntries(new URLSearchParams(queryString));
    return { path: path || "/", query, fragment };
  }

  resolve() {
    const { path, query, fragment } = this.parse(window.location.hash);
    for (const route of this.routes) {
      const match = route.regex.exec(path);
      if (!match) continue;
      const params = {};
      route.keys.forEach((key, i) => {
        params[key] = decodeURIComponent(match[i + 1]);
      });
      this.current = {
        path,
        pattern: route.pattern,
        meta: route.meta,
        params,
        query,
        fragment,
      };
      const markup = route.handler(params, query);
      this.root.innerHTML = markup;
      this.onNavigate(this.current);
      this.scrollToFragment(fragment);
      return this.current;
    }
    this.current = { path, pattern: null, meta: {}, params: {}, query, fragment };
    this.root.innerHTML = this.notFound(path);
    this.onNavigate(this.current);
    return this.current;
  }

  /** Honour an in-page fragment after the route has rendered. */
  scrollToFragment(fragment) {
    if (!fragment) return;
    const target = document.getElementById(fragment);
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.scrollIntoView({ block: "start" });
  }

  start() {
    window.addEventListener("hashchange", this._onHash);
    if (!window.location.hash) window.location.hash = "#/";
    return this.resolve();
  }

  stop() {
    window.removeEventListener("hashchange", this._onHash);
  }
}

export function navigate(path) {
  const target = path.startsWith("#") ? path : `#${path}`;
  if (window.location.hash === target) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } else {
    window.location.hash = target;
  }
}
