import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export const rootDir = path.resolve(new URL("..", import.meta.url).pathname);

export async function readJson(relativePath) {
  const filePath = path.join(rootDir, relativePath);
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Failed to read JSON ${relativePath}: ${error.message}`);
  }
}

export async function listDirectories(relativePath) {
  const directory = path.join(rootDir, relativePath);
  const entries = await readdir(directory, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).toSorted();
}

export function unique(values) {
  return [...new Set(values)];
}

export function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

export function assertId(value, field, errors) {
  assert(typeof value === "string" && /^[a-z0-9][a-z0-9._-]*$/.test(value), `${field} has invalid id`, errors);
}

export function assertString(value, field, errors) {
  assert(typeof value === "string" && value.trim().length > 0, `${field} must be a non-empty string`, errors);
}

export function assertArray(value, field, errors) {
  assert(Array.isArray(value), `${field} must be an array`, errors);
}

export function relativeChildPath(baseRelativePath, childRelativePath) {
  const base = path.dirname(baseRelativePath);
  const resolved = path.normalize(path.join(base, childRelativePath));
  if (resolved.startsWith("..") || path.isAbsolute(resolved)) {
    throw new Error(`Path escapes catalog root: ${childRelativePath}`);
  }
  return resolved;
}

export function canonicalJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export async function loadCatalog() {
  const index = await readJson("catalog/index.json");
  const recipes = [];
  const packs = [];

  for (const entry of index.recipes ?? []) {
    recipes.push({
      entry,
      recipe: await readJson(entry.path),
    });
  }

  for (const entry of index.packs ?? []) {
    packs.push({
      entry,
      pack: await readJson(entry.path),
    });
  }

  return { index, recipes, packs };
}
