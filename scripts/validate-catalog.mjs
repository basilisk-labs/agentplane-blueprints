import { access } from "node:fs/promises";
import path from "node:path";

import {
  assert,
  assertArray,
  assertId,
  assertString,
  listDirectories,
  loadCatalog,
  readJson,
  relativeChildPath,
  rootDir,
  unique,
} from "./catalog-lib.mjs";

const BUILTIN_BLUEPRINT_IDS = new Set([
  "analysis.light",
  "content.light",
  "docs.change",
  "code.direct",
  "code.branch_pr",
  "release.strict",
  "ops.approval",
]);

const NODE_KINDS = new Set([
  "intake",
  "scope",
  "context_resolve",
  "approval_gate",
  "worktree_start",
  "work_unit",
  "deterministic_check",
  "fast_local_checks",
  "artifact_write",
  "pr_artifact",
  "hosted_checks",
  "publish_or_integrate",
  "verify_record",
  "handoff",
  "finish",
]);

async function pathExists(relativePath) {
  try {
    await access(path.join(rootDir, relativePath));
    return true;
  } catch {
    return false;
  }
}

function validateIndex(index, errors) {
  assert(index.schema_version === 1, "catalog/index.json schema_version must be 1", errors);
  assertId(index.catalog_id, "catalog.catalog_id", errors);
  assertString(index.name, "catalog.name", errors);
  assertArray(index.recipes, "catalog.recipes", errors);
  assertArray(index.packs, "catalog.packs", errors);

  const recipeIds = (index.recipes ?? []).map((entry) => entry.id);
  const packIds = (index.packs ?? []).map((entry) => entry.id);
  for (const [indexNumber, entry] of (index.recipes ?? []).entries()) {
    assertId(entry.id, `catalog.recipes[${indexNumber}].id`, errors);
    assertString(entry.path, `catalog.recipes[${indexNumber}].path`, errors);
  }
  for (const [indexNumber, entry] of (index.packs ?? []).entries()) {
    assertId(entry.id, `catalog.packs[${indexNumber}].id`, errors);
    assertString(entry.path, `catalog.packs[${indexNumber}].path`, errors);
  }
  assert(unique(recipeIds).length === recipeIds.length, "catalog recipe ids must be unique", errors);
  assert(unique(packIds).length === packIds.length, "catalog pack ids must be unique", errors);
}

async function validateBlueprint(recipeEntry, blueprintEntry, errors) {
  const blueprintPath = relativeChildPath(recipeEntry.path, blueprintEntry.path);
  const blueprint = await readJson(blueprintPath);
  assert(blueprint.id === blueprintEntry.id, `${blueprintPath} id must match recipe entry`, errors);
  assert(!BUILTIN_BLUEPRINT_IDS.has(blueprint.id), `${blueprintPath} must not shadow built-in blueprint id`, errors);
  assert(blueprint.version === 1, `${blueprintPath} version must be 1`, errors);
  assertString(blueprint.title, `${blueprintPath}.title`, errors);
  assertArray(blueprint.nodes, `${blueprintPath}.nodes`, errors);
  assertArray(blueprint.edges, `${blueprintPath}.edges`, errors);
  assertArray(blueprint.requiredEvidence, `${blueprintPath}.requiredEvidence`, errors);
  assertArray(blueprint.stopRules, `${blueprintPath}.stopRules`, errors);

  const nodeIds = new Set();
  const nodeKinds = new Set();
  for (const [indexNumber, node] of (blueprint.nodes ?? []).entries()) {
    assertString(node.id, `${blueprintPath}.nodes[${indexNumber}].id`, errors);
    assert(NODE_KINDS.has(node.kind), `${blueprintPath}.nodes[${indexNumber}] has unknown kind ${node.kind}`, errors);
    nodeIds.add(node.id);
    nodeKinds.add(node.kind);
  }
  for (const requiredKind of ["intake", "scope", "context_resolve", "work_unit", "verify_record", "finish"]) {
    assert(nodeKinds.has(requiredKind), `${blueprintPath} missing required node kind ${requiredKind}`, errors);
  }
  for (const [indexNumber, edge] of (blueprint.edges ?? []).entries()) {
    assert(nodeIds.has(edge.from), `${blueprintPath}.edges[${indexNumber}].from references unknown node`, errors);
    assert(nodeIds.has(edge.to), `${blueprintPath}.edges[${indexNumber}].to references unknown node`, errors);
  }
  for (const [indexNumber, evidence] of (blueprint.requiredEvidence ?? []).entries()) {
    assertString(evidence.id, `${blueprintPath}.requiredEvidence[${indexNumber}].id`, errors);
    assert(nodeKinds.has(evidence.producedBy), `${blueprintPath}.requiredEvidence[${indexNumber}].producedBy references inactive node kind`, errors);
  }
}

async function validateRecipe(entry, recipe, errors) {
  assert(entry.id === recipe.id, `${entry.path} id must match catalog entry`, errors);
  assert(recipe.schema_version === 1, `${entry.path} schema_version must be 1`, errors);
  assertId(recipe.id, `${entry.path}.id`, errors);
  assertString(recipe.name, `${entry.path}.name`, errors);
  assertString(recipe.version, `${entry.path}.version`, errors);
  assertString(recipe.summary, `${entry.path}.summary`, errors);
  assertArray(recipe.blueprints, `${entry.path}.blueprints`, errors);

  for (const [indexNumber, blueprintEntry] of (recipe.blueprints ?? []).entries()) {
    assertId(blueprintEntry.id, `${entry.path}.blueprints[${indexNumber}].id`, errors);
    assertString(blueprintEntry.path, `${entry.path}.blueprints[${indexNumber}].path`, errors);
    await validateBlueprint(entry, blueprintEntry, errors);
  }
  for (const policyPath of recipe.policy ?? []) {
    const relativePath = relativeChildPath(entry.path, policyPath);
    assert(await pathExists(relativePath), `${entry.path} policy file missing: ${policyPath}`, errors);
  }
  for (const templatePath of recipe.evidence_templates ?? []) {
    const relativePath = relativeChildPath(entry.path, templatePath);
    assert(await pathExists(relativePath), `${entry.path} evidence template missing: ${templatePath}`, errors);
  }
}

function validatePack(entry, pack, recipeIds, blueprintIds, errors) {
  assert(entry.id === pack.id, `${entry.path} id must match catalog entry`, errors);
  assert(pack.schema_version === 1, `${entry.path} schema_version must be 1`, errors);
  assertId(pack.id, `${entry.path}.id`, errors);
  assertString(pack.name, `${entry.path}.name`, errors);
  assertString(pack.version, `${entry.path}.version`, errors);
  assertArray(pack.recipes, `${entry.path}.recipes`, errors);

  for (const [indexNumber, recipeRef] of (pack.recipes ?? []).entries()) {
    assert(recipeIds.has(recipeRef.id), `${entry.path}.recipes[${indexNumber}] references unknown recipe ${recipeRef.id}`, errors);
  }
  for (const blueprintId of pack.activation?.recommended_allowed_ids ?? []) {
    assert(blueprintIds.has(blueprintId), `${entry.path} activation references unknown blueprint ${blueprintId}`, errors);
  }
}

async function validateDirectoryCoverage(index, errors) {
  const indexedRecipes = new Set((index.recipes ?? []).map((entry) => entry.id));
  const indexedPacks = new Set((index.packs ?? []).map((entry) => entry.id));
  for (const directory of await listDirectories("recipes")) {
    assert(indexedRecipes.has(directory), `recipes/${directory} is not listed in catalog/index.json`, errors);
  }
  for (const directory of await listDirectories("packs")) {
    assert(indexedPacks.has(directory), `packs/${directory} is not listed in catalog/index.json`, errors);
  }
}

const errors = [];
const catalog = await loadCatalog();
validateIndex(catalog.index, errors);
await validateDirectoryCoverage(catalog.index, errors);

const recipeIds = new Set();
const blueprintIds = new Set();
for (const { entry, recipe } of catalog.recipes) {
  recipeIds.add(recipe.id);
  for (const blueprint of recipe.blueprints ?? []) blueprintIds.add(blueprint.id);
  await validateRecipe(entry, recipe, errors);
}
for (const { entry, pack } of catalog.packs) {
  validatePack(entry, pack, recipeIds, blueprintIds, errors);
}

if (errors.length > 0) {
  console.error("Catalog validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Catalog validation passed: ${recipeIds.size} recipes, ${catalog.packs.length} packs, ${blueprintIds.size} blueprints.`);
