/**
 * Foundry does not know what language it speaks when `init` fires.
 *
 * `game.i18n.lang` holds the *server's* default until Foundry loads the client's
 * own choice, and it only does that between `init` and `i18nInit`. A module that
 * asks "are we Russian?" from an init-time hook is therefore asking too early:
 * on a server whose default is English the answer is "no" even for a client set
 * to Russian, and every Russian-only registration is silently skipped.
 *
 * This replays that order — English at `init`, Russian from `i18nInit` on — and
 * asserts the three registrations that have to survive it.
 */

import test from "node:test";
import assert from "node:assert/strict";

/* ---------------------------------------------------------------- Foundry ---- */

class Collection extends Map {
  some(fn) { return [...this.values()].some(fn); }
  filter(fn) { return [...this.values()].filter(fn); }
}

function makeHooks() {
  const listeners = { once: new Map(), on: new Map() };
  return {
    once(name, fn) { (listeners.once.get(name) ?? listeners.once.set(name, []).get(name)).push(fn); },
    on(name, fn) { (listeners.on.get(name) ?? listeners.on.set(name, []).get(name)).push(fn); },
    callAll(name, ...args) {
      for (const fn of listeners.on.get(name) ?? []) fn(...args);
      const single = listeners.once.get(name) ?? [];
      listeners.once.set(name, []);
      for (const fn of single) fn(...args);
    },
  };
}

const deepClone = value => (value === null || typeof value !== "object")
  ? value
  : Array.isArray(value) ? value.map(deepClone)
  : Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepClone(v)]));

function mergeObject(target, source = {}, { inplace = true } = {}) {
  const out = inplace ? target : deepClone(target);
  for (const [k, v] of Object.entries(source)) {
    out[k] = (v && typeof v === "object" && !Array.isArray(v) && out[k] && typeof out[k] === "object")
      ? mergeObject(out[k], v, { inplace: true })
      : deepClone(v);
  }
  return out;
}

/**
 * Anything the module graph touches that this test does not care about. Calls
 * return a class, because half of what Foundry exposes is a mixin the sheets
 * extend, and `class X extends {}` is a load-time crash.
 */
const inert = () => new Proxy(function () {}, {
  get: () => inert(),
  apply: () => class {},
  construct: () => ({}),
});

function installFoundry({ serverLanguage = "en" } = {}) {
  const registered = [];
  const settings = new Map();

  globalThis.Hooks = makeHooks();
  globalThis.CONFIG = { Item: { dataModels: {} }, Actor: { dataModels: {} }, statusEffects: [], debug: {} };
  globalThis.CONST = new Proxy({}, { get: () => ({}) });
  globalThis.ui = { notifications: { warn() {} } };
  globalThis.Handlebars = { registerHelper() {}, registerPartial() {} };
  for (const name of ["Dialog", "Application", "FormApplication", "ItemSheet", "ActorSheet", "Item", "Actor", "Roll", "ChatMessage", "Token"]) {
    globalThis[name] = class {};
  }
  globalThis.canvas = {};
  globalThis.document = {
    body: { classList: { toggle() {}, add() {}, remove() {} } },
    createElement: () => ({ style: {}, classList: { add() {}, toggle() {} }, appendChild() {}, setAttribute() {} }),
    head: { appendChild() {} },
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
  };
  globalThis.TextEditor = { enrichHTML: async () => "" };
  globalThis.loadTemplates = async () => {};
  globalThis.fromUuid = async () => null;
  globalThis.renderTemplate = async () => "";

  globalThis.foundry = new Proxy({ utils: { mergeObject, deepClone, isEmpty: o => !o || !Object.keys(o).length } }, {
    get: (target, prop) => (prop in target ? target[prop] : inert()),
  });

  const modules = new Collection();
  modules.set("babele", { id: "babele", active: true, languages: [] });
  modules.set("navis-apexialis", { id: "navis-apexialis", active: true, languages: [{ lang: "ru" }] });
  // A second Russian translation, which is what the book-terminology pass exists for.
  modules.set("ru-ru", { id: "ru-ru", active: true, languages: [{ lang: "ru" }] });

  globalThis.game = {
    ready: false,
    system: { id: "impmal" },
    modules,
    user: { isGM: true },
    i18n: {
      // Foundry starts on the server's default and only learns the client's
      // choice after `init` — that is the whole point of this test.
      lang: serverLanguage,
      translations: {},
      localize: key => key,
      format: key => key,
      has: () => false,
    },
    settings: {
      register: (namespace, key, data) => settings.set(`${namespace}.${key}`, data.default),
      registerMenu() {},
      get: (namespace, key) => settings.get(`${namespace}.${key}`),
      set: (namespace, key, value) => settings.set(`${namespace}.${key}`, value),
    },
    impmal: {
      config: {
        speeds: {}, disciplines: {}, npcRoles: {}, factions: {}, vehicleActions: {},
        effectScripts: {},
      },
    },
  };

  const babele = { register: registration => registered.push(registration) };
  return { registered, babele };
}

/** Drive Foundry's real order: init, then the language, then i18nInit and setup. */
function boot({ babele, clientLanguage = "ru" }) {
  Hooks.callAll("init");
  Hooks.callAll("babele.init", babele);

  game.i18n.lang = clientLanguage;
  Hooks.callAll("i18nInit");
  Hooks.callAll("setup");
}

/* ------------------------------------------------------------------ tests ---- */

const state = installFoundry({ serverLanguage: "en" });
await import("../module/navis-apexialis.js");
const { RU_TERMS } = await import("../lang/ru-terms.mjs");
boot({ babele: state.babele });

test("the compendium translations reach Babele on an English-default server", () => {
  assert.deepEqual(state.registered, [
    { module: "navis-apexialis", lang: "ru", dir: "compendium" },
  ]);
});

test("the book terminology is applied on an English-default server", () => {
  const sample = Object.keys(RU_TERMS)[0];
  assert.equal(game.i18n.translations[sample], RU_TERMS[sample]);
});
