/**
 * Odrakriti — demo persistence layer.
 *
 * localStorage only. No server, no accounts, no network.
 * If storage is unavailable (private mode, blocked cookies) the store
 * degrades to an in-memory copy so the demo still runs end to end.
 */

const KEY_REQUESTS = "odrakriti.requests.v1";
const KEY_ROLE = "odrakriti.role.v1";
const KEY_SEEDED = "odrakriti.seeded.v1";

let memoryFallback = { requests: [], role: null, seeded: false };
let usingMemory = false;

function probeStorage() {
  try {
    const probe = "__odrakriti_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    usingMemory = true;
    return null;
  }
}

const storage = typeof window === "undefined" ? null : probeStorage();

function read(key, fallbackValue) {
  if (!storage) return memoryFallback[key] ?? fallbackValue;
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function write(key, value) {
  if (!storage) {
    memoryFallback[key] = value;
    return false;
  }
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    memoryFallback[key] = value;
    usingMemory = true;
    return false;
  }
}

export function storageMode() {
  return usingMemory || !storage ? "memory" : "localStorage";
}

/* ---------------- Requests ---------------- */

export function loadRequests() {
  const list = read(KEY_REQUESTS, []);
  return Array.isArray(list) ? list : [];
}

export function saveRequests(requests) {
  write(KEY_REQUESTS, requests);
  return requests;
}

export function getRequest(id) {
  return loadRequests().find((r) => r.id === id) || null;
}

export function upsertRequest(request) {
  const all = loadRequests();
  const idx = all.findIndex((r) => r.id === request.id);
  if (idx >= 0) all[idx] = request;
  else all.push(request);
  // Newest first for the dashboard.
  all.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  saveRequests(all);
  return request;
}

export function clearRequests() {
  saveRequests([]);
}

/* ---------------- Role (simulated sign-in) ---------------- */

export const ROLES = {
  BUYER: "buyer",
  ARTISAN: "artisan",
};

export function loadRole() {
  return read(KEY_ROLE, null);
}

export function saveRole(role) {
  write(KEY_ROLE, role);
  return role;
}

/* ---------------- Seed data (clearly marked demo) ---------------- */

/**
 * One seeded demo request so the artisan portal is never an empty screen.
 * It is labelled demo data and carries no price until the artisan acts.
 */
export function seedIfEmpty(factory) {
  if (read(KEY_SEEDED, false)) return false;
  write(KEY_SEEDED, true);
  const demo = factory();
  if (demo) upsertRequest(demo);
  return true;
}

export function resetSeedFlag() {
  write(KEY_SEEDED, false);
}

export function hasSeeded() {
  return !!read(KEY_SEEDED, false);
}
