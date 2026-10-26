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
    const [path, queryString = ""] = raw.split("?");
    const query = Object.fromEntries(new URLSearchParams(queryString));
    return { path: path || "/", query };
  }

  resolve() {
    const { path, query } = this.parse(window.location.hash);
    for (const route of this.routes) {
      const match = route.regex.exec(path);
      if (!match) continue;
      const params = {};
      route.keys.forEach((key, i) => {
        params[key] = decodeURIComponent(match[i + 1]);
      });
      this.current = { path, pattern: route.pattern, meta: route.meta, params, query };
      const markup = route.handler(params, query);
      this.root.innerHTML = markup;
      this.onNavigate(this.current);
      return this.current;
    }
    this.current = { path, pattern: null, meta: {}, params: {}, query };
    this.root.innerHTML = this.notFound(path);
    this.onNavigate(this.current);
    return this.current;
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
