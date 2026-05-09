import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile, cp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { canonicalJson, readJson, rootDir } from "./catalog-lib.mjs";

const execFileAsync = promisify(execFile);
const checkOnly = process.argv.includes("--check");
const defaultDistBase = "https://raw.githubusercontent.com/basilisk-labs/agentplane-blueprints/main/dist";
const distBaseUrl = (process.env.AGENTPLANE_BLUEPRINTS_DIST_BASE_URL ?? defaultDistBase).replace(/\/$/, "");

async function sha256File(filePath) {
  const hash = createHash("sha256");
  hash.update(await readFile(filePath));
  return hash.digest("hex");
}

async function makeArchive(sourceDir, id, version) {
  const distDir = path.join(rootDir, "dist");
  await mkdir(distDir, { recursive: true });
  const archiveName = `${id}-${version}.tar.gz`;
  const archivePath = path.join(distDir, archiveName);
  const tmpRoot = await mkdtemp(path.join(os.tmpdir(), "agentplane-blueprint-package-"));
  const packageRoot = path.join(tmpRoot, id);
  await cp(sourceDir, packageRoot, { recursive: true });
  await rm(archivePath, { force: true });
  try {
    await execFileAsync("tar", ["-czf", archivePath, "-C", tmpRoot, id]);
  } finally {
    await rm(tmpRoot, { recursive: true, force: true });
  }
  return { archiveName, archivePath, sha256: await sha256File(archivePath) };
}

function latestVersion(manifest) {
  return {
    version: manifest.version,
    min_agentplane_version: manifest.agentplane?.min_version,
    tags: manifest.tags ?? [],
  };
}

const publication = await readJson("catalog.json");
if (publication.schema_version !== 1 || !Array.isArray(publication.blueprints) || !Array.isArray(publication.packs)) {
  throw new Error("catalog.json must contain schema_version=1, blueprints[], and packs[]");
}

const sourceIndex = await readJson("catalog/index.json");
const sourceBlueprints = new Map(sourceIndex.blueprints.map((entry) => [entry.id, entry]));
const sourcePacks = new Map(sourceIndex.packs.map((entry) => [entry.id, entry]));

const blueprints = [];
for (const id of publication.blueprints) {
  const sourceEntry = sourceBlueprints.get(id);
  if (!sourceEntry) throw new Error(`catalog.json blueprint is not listed in catalog/index.json: ${id}`);
  const manifest = await readJson(sourceEntry.path);
  if (manifest.id !== id) throw new Error(`Blueprint id mismatch for ${sourceEntry.path}`);
  const packageDir = path.join(rootDir, path.dirname(sourceEntry.path));
  const archiveName = `${manifest.id}-${manifest.version}.tar.gz`;
  const archivePath = path.join(rootDir, "dist", archiveName);
  const packageArtifact = checkOnly
    ? { archiveName, sha256: await sha256File(archivePath) }
    : await makeArchive(packageDir, manifest.id, manifest.version);
  const version = latestVersion(manifest);
  blueprints.push({
    id: manifest.id,
    name: manifest.name,
    summary: manifest.summary,
    tags: manifest.tags ?? [],
    activation: manifest.activation,
    versions: [
      {
        ...version,
        url: `${distBaseUrl}/${packageArtifact.archiveName}`,
        sha256: packageArtifact.sha256,
      },
    ],
  });
}

const packs = [];
for (const id of publication.packs) {
  const sourceEntry = sourcePacks.get(id);
  if (!sourceEntry) throw new Error(`catalog.json pack is not listed in catalog/index.json: ${id}`);
  const manifest = await readJson(sourceEntry.path);
  if (manifest.id !== id) throw new Error(`Pack id mismatch for ${sourceEntry.path}`);
  packs.push({
    id: manifest.id,
    name: manifest.name,
    version: manifest.version,
    summary: manifest.summary,
    blueprints: manifest.blueprints,
    activation: manifest.activation,
  });
}

const releaseIndex = {
  schema_version: 1,
  catalog_id: sourceIndex.catalog_id,
  name: sourceIndex.name,
  description: sourceIndex.description,
  generated_from: "catalog.json",
  blueprints,
  packs,
};

const releaseText = canonicalJson(releaseIndex);
const targets = [path.join(rootDir, "index.json"), path.join(rootDir, "dist", "index.json")];

if (checkOnly) {
  for (const target of targets) {
    let current = "";
    try {
      current = await readFile(target, "utf8");
    } catch {
      console.error(`${path.relative(rootDir, target)} is missing. Run npm run build.`);
      process.exit(1);
    }
    if (current !== releaseText) {
      console.error(`${path.relative(rootDir, target)} is stale. Run npm run build.`);
      process.exit(1);
    }
  }
  console.log("release indexes and packages are current.");
} else {
  for (const target of targets) {
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, releaseText, "utf8");
  }
  console.log(`Wrote index.json, dist/index.json, and ${blueprints.length} blueprint package(s).`);
}
