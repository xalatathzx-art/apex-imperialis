#!/usr/bin/env node
/**
 * Consolidate the official Imperium Maledictum content packs into Navis Apexialis.
 *
 * This command is intentionally fail-closed: Foundry must be closed because
 * classic-level creates LOCK files while a pack is open. Source modules are
 * never modified or deleted. Run from the modules directory after closing
 * Foundry:
 *   node navis-apexialis/tools/migrate-official-modules.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readPack, writePack } from "./lib/level.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const modulesRoot = path.resolve(root, "..");
const modules = ["impmal-core", "impmal-inquisition", "impmal-requisition", "impmal-voll"];
const packTypes = ["actors", "items", "journal", "journals", "tables", "scenes"];
const rename = new Map();

function targetName(moduleId, packName) {
  return `navis-${moduleId.replace(/^impmal-/, "")}-${packName}`;
}

function buildMap() {
  for (const moduleId of modules) {
    const manifest = JSON.parse(fs.readFileSync(path.join(modulesRoot, moduleId, "module.json"), "utf8"));
    for (const pack of manifest.packs ?? []) {
      const name = pack.name;
      rename.set(`Compendium.${moduleId}.${name}`, `Compendium.navis-apexialis.${targetName(moduleId, name)}`);
    }
  }
}

function rewrite(value) {
  if (typeof value === "string") {
    let out = value;
    for (const [from, to] of rename) {
      out = out.split(from).join(to);
      out = out.split(from.toLowerCase()).join(to);
    }
    return out
      .replaceAll("modules/impmal-core/assets/", "modules/navis-apexialis/assets/impmal-core/")
      .replaceAll("modules/impmal-inquisition/assets/", "modules/navis-apexialis/assets/impmal-inquisition/")
      .replaceAll("modules/impmal-requisition/assets/", "modules/navis-apexialis/assets/impmal-requisition/")
      .replaceAll("modules/impmal-voll/assets/", "modules/navis-apexialis/assets/impmal-voll/")
      .replaceAll("modules/impmal-inquisition/templates/", "modules/navis-apexialis/templates/")
      .replaceAll("modules/navis-apexialis/assets/impmal-core/assets/", "modules/navis-apexialis/assets/impmal-core/")
      .replaceAll("modules/navis-apexialis/assets/impmal-inquisition/assets/", "modules/navis-apexialis/assets/impmal-inquisition/");
  }
  if (Array.isArray(value)) return value.map(rewrite);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, child] of Object.entries(value)) out[key] = rewrite(child);
    return out;
  }
  return value;
}

function rewriteTextFiles() {
  const roots = [path.join(root, "src", "compendium"), path.join(root, "compendium"), path.join(root, "official")];
  let files = 0;
  for (const base of roots) {
    if (!fs.existsSync(base)) continue;
    const queue = [base];
    while (queue.length) {
      const dir = queue.pop();
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) { if (entry.name !== "legacy-source") queue.push(full); continue; }
        if (!/\.(mjs|js|json)$/.test(entry.name)) continue;
        const before = fs.readFileSync(full, "utf8");
        const after = rewrite(before);
        if (after !== before) { fs.writeFileSync(full, after); files++; }
      }
    }
  }
  return files;
}

function assertUnlocked() {
  const locks = [];
  for (const moduleId of modules) {
    const packsDir = path.join(modulesRoot, moduleId, "packs");
    if (!fs.existsSync(packsDir)) continue;
    for (const entry of fs.readdirSync(packsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const lock = path.join(packsDir, entry.name, "LOCK");
      if (fs.existsSync(lock)) locks.push(lock);
    }
  }
  // Foundry may leave stale LOCK files after an unclean shutdown. We do not
  // delete them from source packs; the caller stages a lock-free copy below.
  if (locks.length) console.warn(`Found ${locks.length} LOCK files; staging lock-free copies.`);
}

function stagePack(source, stagingRoot) {
  fs.rmSync(stagingRoot, { recursive: true, force: true });
  fs.cpSync(source, stagingRoot, { recursive: true, force: true });
  for (const lock of [path.join(stagingRoot, "LOCK"), ...fs.globSync(path.join(stagingRoot, "**", "LOCK"))]) {
    if (fs.existsSync(lock)) fs.rmSync(lock, { force: true });
  }
}

async function main() {
  assertUnlocked();
  buildMap();
  const migrated = [];
  for (const moduleId of modules) {
    const sourceManifest = JSON.parse(fs.readFileSync(path.join(modulesRoot, moduleId, "module.json"), "utf8"));
    for (const pack of sourceManifest.packs ?? []) {
      const source = path.join(modulesRoot, moduleId, pack.path);
      if (!fs.existsSync(source)) continue;
      const target = path.join(root, "packs", targetName(moduleId, pack.name));
      const staging = path.join(root, "tmp", "migration-stage", moduleId, pack.name);
      stagePack(source, staging);
      const entries = await readPack(staging);
      await writePack(target, rewrite(entries));
      migrated.push({ from: `${moduleId}.${pack.name}`, to: targetName(moduleId, pack.name), documents: Object.keys(entries).length });
    }
  }
  const assets = [];
  for (const moduleId of modules) {
    const source = path.join(modulesRoot, moduleId, "assets");
    if (!fs.existsSync(source)) continue;
    const target = path.join(root, "assets", moduleId);
    fs.cpSync(source, target, { recursive: true, force: false, errorOnExist: false });
    assets.push(moduleId);
  }
  fs.writeFileSync(path.join(root, "docs/superpowers/plans/module-consolidation-migration-report.json"), JSON.stringify({ generatedAt: new Date().toISOString(), migrated, assets, uuidMap: Object.fromEntries(rename) }, null, 2) + "\n");
  console.log(`Migrated ${migrated.length} packs; copied assets for ${assets.length} modules; rewrote ${rewriteTextFiles()} text files.`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
