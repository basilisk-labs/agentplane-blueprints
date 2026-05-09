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
  assertArray(index.blueprints, "catalog.blueprints", errors);
  assertArray(index.packs, "catalog.packs", errors);

  const blueprintIds = (index.blueprints ?? []).map((entry) => entry.id);
  const packIds = (index.packs ?? []).map((entry) => entry.id);
  for (const [indexNumber, entry] of (index.blueprints ?? []).entries()) {
    assertId(entry.id, `catalog.blueprints[${indexNumber}].id`, errors);
    assertString(entry.path, `catalog.blueprints[${indexNumber}].path`, errors);
  }
  for (const [indexNumber, entry] of (index.packs ?? []).entries()) {
    assertId(entry.id, `catalog.packs[${indexNumber}].id`, errors);
    assertString(entry.path, `catalog.packs[${indexNumber}].path`, errors);
  }
  assert(unique(blueprintIds).length === blueprintIds.length, "catalog blueprint ids must be unique", errors);
  assert(unique(packIds).length === packIds.length, "catalog pack ids must be unique", errors);
}

async function validateBlueprintDefinition(catalogEntry, definitionEntry, errors) {
  const blueprintPath = relativeChildPath(catalogEntry.path, definitionEntry.path);
  const definition = await readJson(blueprintPath);
  assert(definition.id === definitionEntry.id, `${blueprintPath} id must match blueprint entry`, errors);
  assert(!BUILTIN_BLUEPRINT_IDS.has(definition.id), `${blueprintPath} must not shadow built-in blueprint id`, errors);
  assert(definition.version === 1, `${blueprintPath} version must be 1`, errors);
  assertString(definition.title, `${blueprintPath}.title`, errors);
  assertArray(definition.nodes, `${blueprintPath}.nodes`, errors);
  assertArray(definition.edges, `${blueprintPath}.edges`, errors);
  assertArray(definition.requiredEvidence, `${blueprintPath}.requiredEvidence`, errors);
  assertArray(definition.stopRules, `${blueprintPath}.stopRules`, errors);

  const nodeIds = new Set();
  const nodeKinds = new Set();
  const producerEvidence = new Map();
  for (const [indexNumber, node] of (definition.nodes ?? []).entries()) {
    assertString(node.id, `${blueprintPath}.nodes[${indexNumber}].id`, errors);
    assert(NODE_KINDS.has(node.kind), `${blueprintPath}.nodes[${indexNumber}] has unknown kind ${node.kind}`, errors);
    nodeIds.add(node.id);
    nodeKinds.add(node.kind);
    producerEvidence.set(node.id, new Set(Array.isArray(node.evidence) ? node.evidence : []));
  }
  for (const requiredKind of ["intake", "scope", "context_resolve", "work_unit", "verify_record", "finish"]) {
    assert(nodeKinds.has(requiredKind), `${blueprintPath} missing required node kind ${requiredKind}`, errors);
  }
  for (const [indexNumber, edge] of (definition.edges ?? []).entries()) {
    assert(nodeIds.has(edge.from), `${blueprintPath}.edges[${indexNumber}].from references unknown node`, errors);
    assert(nodeIds.has(edge.to), `${blueprintPath}.edges[${indexNumber}].to references unknown node`, errors);
  }
  for (const [indexNumber, evidence] of (definition.requiredEvidence ?? []).entries()) {
    assertString(evidence.id, `${blueprintPath}.requiredEvidence[${indexNumber}].id`, errors);
    assert(nodeIds.has(evidence.producedBy), `${blueprintPath}.requiredEvidence[${indexNumber}].producedBy references unknown node`, errors);
    assert(
      producerEvidence.get(evidence.producedBy)?.has(evidence.kind),
      `${blueprintPath}.requiredEvidence[${indexNumber}] requires ${evidence.kind} from ${evidence.producedBy}, but the node does not produce it`,
      errors,
    );
  }
}

async function validateBlueprintUnit(entry, blueprint, errors) {
  assert(entry.id === blueprint.id, `${entry.path} id must match catalog entry`, errors);
  assert(blueprint.schema_version === 1, `${entry.path} schema_version must be 1`, errors);
  assertId(blueprint.id, `${entry.path}.id`, errors);
  assertString(blueprint.name, `${entry.path}.name`, errors);
  assertString(blueprint.version, `${entry.path}.version`, errors);
  assertString(blueprint.summary, `${entry.path}.summary`, errors);
  assert(blueprint.definition && typeof blueprint.definition === "object", `${entry.path}.definition must be an object`, errors);

  if (blueprint.definition && typeof blueprint.definition === "object") {
    assertId(blueprint.definition.id, `${entry.path}.definition.id`, errors);
    assertString(blueprint.definition.path, `${entry.path}.definition.path`, errors);
    await validateBlueprintDefinition(entry, blueprint.definition, errors);
  }
  for (const policyPath of blueprint.policy ?? []) {
    const relativePath = relativeChildPath(entry.path, policyPath);
    assert(await pathExists(relativePath), `${entry.path} policy file missing: ${policyPath}`, errors);
  }
  for (const templatePath of blueprint.evidence_templates ?? []) {
    const relativePath = relativeChildPath(entry.path, templatePath);
    assert(await pathExists(relativePath), `${entry.path} evidence template missing: ${templatePath}`, errors);
  }
}

function validatePack(entry, pack, catalogBlueprintIds, routeBlueprintIds, errors) {
  assert(entry.id === pack.id, `${entry.path} id must match catalog entry`, errors);
  assert(pack.schema_version === 1, `${entry.path} schema_version must be 1`, errors);
  assertId(pack.id, `${entry.path}.id`, errors);
  assertString(pack.name, `${entry.path}.name`, errors);
  assertString(pack.version, `${entry.path}.version`, errors);
  assertArray(pack.blueprints, `${entry.path}.blueprints`, errors);

  for (const [indexNumber, blueprintRef] of (pack.blueprints ?? []).entries()) {
    assert(catalogBlueprintIds.has(blueprintRef.id), `${entry.path}.blueprints[${indexNumber}] references unknown catalog blueprint ${blueprintRef.id}`, errors);
  }
  for (const blueprintId of pack.activation?.recommended_allowed_ids ?? []) {
    assert(routeBlueprintIds.has(blueprintId), `${entry.path} activation references unknown route blueprint ${blueprintId}`, errors);
  }
}

async function validateDirectoryCoverage(index, errors) {
  const indexedBlueprints = new Set((index.blueprints ?? []).map((entry) => entry.id));
  const indexedPacks = new Set((index.packs ?? []).map((entry) => entry.id));
  for (const directory of await listDirectories("blueprints")) {
    assert(indexedBlueprints.has(directory), `blueprints/${directory} is not listed in catalog/index.json`, errors);
  }
  for (const directory of await listDirectories("packs")) {
    assert(indexedPacks.has(directory), `packs/${directory} is not listed in catalog/index.json`, errors);
  }
}

const errors = [];
const catalog = await loadCatalog();
validateIndex(catalog.index, errors);
await validateDirectoryCoverage(catalog.index, errors);

const catalogBlueprintIds = new Set();
const routeBlueprintIds = new Set();
for (const { entry, blueprint } of catalog.blueprints) {
  catalogBlueprintIds.add(blueprint.id);
  if (blueprint.definition?.id) routeBlueprintIds.add(blueprint.definition.id);
  await validateBlueprintUnit(entry, blueprint, errors);
}
for (const { entry, pack } of catalog.packs) {
  validatePack(entry, pack, catalogBlueprintIds, routeBlueprintIds, errors);
}

if (errors.length > 0) {
  console.error("Catalog validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Catalog validation passed: ${catalogBlueprintIds.size} catalog blueprints, ${catalog.packs.length} packs, ${routeBlueprintIds.size} route definitions.`);
