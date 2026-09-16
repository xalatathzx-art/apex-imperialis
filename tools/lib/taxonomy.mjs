/**
 * Turns a taxonomy declaration (src/taxonomy/*.json) into real Foundry folder
 * documents, and routes content into them.
 *
 * Folder ids are derived from pack + path rather than random, so rebuilding the
 * packs keeps the same ids and anything that pointed at a folder still does.
 */

import crypto from "node:crypto";

const ID_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** A stable 16-character Foundry-style id for a given string. */
export function stableId(seed) {
  const hash = crypto.createHash("sha256").update(seed).digest();
  let id = "";
  for (let i = 0; i < 16; i++) id += ID_ALPHABET[hash[i] % ID_ALPHABET.length];
  return id;
}

/**
 * Walk a taxonomy tree and produce flat folder documents plus routing tables.
 *
 * @returns {{folders: object[], byKey: Map<string,string>, byMatch: object[], fallback: string|null, pathOf: Map<string,string>}}
 */
export function buildFolders(taxonomy) {
  const folders = [];
  const byKey = new Map();     // source folder name -> folder id
  const byName = new Map();    // document name -> folder id (explicit overrides)
  const byMatch = [];          // {match, id} for field-based routing
  const pathOf = new Map();    // folder id -> "Parent/Child" display path
  let fallback = null;

  const walk = (nodes, parentId, parentPath) => {
    for (const node of nodes) {
      const path = parentPath ? `${parentPath}/${node.name}` : node.name;
      const id = stableId(`${taxonomy.pack}:${path}`);

      folders.push({
        _id: id,
        name: node.name,
        type: taxonomy.documentType,
        folder: parentId,
        description: "",
        color: node.color ?? null,
        sorting: "a",
        sort: node.sort ?? 0,
        flags: {},
        _stats: { systemId: "impmal", systemVersion: "3.3.0", coreVersion: "13.348" }
      });

      pathOf.set(id, path);
      for (const key of node.keys ?? []) byKey.set(key, id);
      for (const name of node.names ?? []) byName.set(name, id);
      if (node.match) byMatch.push({ match: node.match, id });
      if (node.fallback) fallback = id;

      if (node.children) walk(node.children, id, path);
    }
  };

  walk(taxonomy.folders, null, "");
  return { folders, byKey, byName, byMatch, fallback, pathOf };
}

/**
 * Decide which folder a document belongs in.
 *
 * Routing is by, in order: an explicit document name (`names`), the name of the
 * folder it sat in upstream (`keys`), or matching fields on system data
 * (`match`). Anything that matches none of the three goes to the fallback
 * folder, which is what makes unroutable content visible rather than silently
 * scattered.
 */
export function route(doc, sourceFolderName, { byKey, byName, byMatch, fallback }) {
  if (byName?.has(doc.name)) return byName.get(doc.name);
  if (sourceFolderName && byKey.has(sourceFolderName)) return byKey.get(sourceFolderName);

  for (const { match, id } of byMatch) {
    if (Object.entries(match).every(([field, value]) => doc.system?.[field] === value)) return id;
  }

  return fallback;
}
