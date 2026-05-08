import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { canonicalJson, loadCatalog, readJson, relativeChildPath, rootDir } from "./catalog-lib.mjs";

const checkOnly = process.argv.includes("--check");
const catalog = await loadCatalog();

const blueprints = [];
for (const { entry, blueprint } of catalog.blueprints) {
  blueprints.push({
    ...blueprint,
    source_path: entry.path,
    definition: {
      ...blueprint.definition,
      content: await readJson(relativeChildPath(entry.path, blueprint.definition.path)),
    },
  });
}

const packs = catalog.packs.map(({ entry, pack }) => ({
  ...pack,
  source_path: entry.path,
}));

const output = {
  schema_version: 1,
  catalog_id: catalog.index.catalog_id,
  name: catalog.index.name,
  description: catalog.index.description,
  generated_from: "catalog/index.json",
  blueprints,
  packs,
};

const outputPath = path.join(rootDir, "dist/index.json");
const next = canonicalJson(output);

if (checkOnly) {
  let current = "";
  try {
    current = await readFile(outputPath, "utf8");
  } catch {
    console.error("dist/index.json is missing. Run npm run build.");
    process.exit(1);
  }
  if (current !== next) {
    console.error("dist/index.json is stale. Run npm run build.");
    process.exit(1);
  }
  console.log("dist/index.json is current.");
} else {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, next, "utf8");
  console.log("Wrote dist/index.json.");
}
