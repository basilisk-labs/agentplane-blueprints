# AgentPlane Blueprints

Installable blueprints and lightweight packs for AgentPlane.

This repository is a catalog source, not the AgentPlane core runtime. Core AgentPlane should keep
the seven built-in blueprints small and stable. This repository is where organization-specific
routes can live without bloating the core product.

## Concept

- A catalog blueprint is an installable unit that provides exactly one AgentPlane blueprint
  definition plus optional policy notes, evidence templates, and activation guidance.
- A pack is only a lightweight wrapper: it names a coherent set of blueprints that should be
  installed together.
- Installation and activation are separate. Installing copies blueprints into the local cache or
  project. Activation explicitly allows selected blueprint ids in the project trust config.
- Basic AgentPlane initialization should use the built-in seven blueprints. Blueprint catalog
  selection belongs in advanced initialization or explicit post-init setup.

## Repository Layout

```text
catalog.json                       publication allowlist
catalog/index.json                 source catalog metadata for current CLI compatibility
index.json                         generated signed-index payload for public installation
index.json.sig                     optional Ed25519 signature envelope
blueprints/<id>/blueprint.json      atomic installable blueprint manifest
blueprints/<id>/blueprints/*.json   AgentPlane project-local blueprint definition
packs/<id>/pack.json                lightweight blueprint collection wrapper
schemas/                           JSON schemas for catalog consumers
scripts/                           dependency-free validation, packaging, and signing scripts
dist/<id>-<version>.tar.gz          versioned blueprint packages
dist/index.json                    generated copy of the public release index
docs/                       design, development plan, and concept assessment
```

## Development

```bash
npm run validate
npm run build
npm run check
```

The scripts intentionally avoid third-party dependencies so the catalog can be validated in a fresh
checkout and by release automation before publication.

## Release Model

Blueprint distribution follows the same shape as AgentPlane recipes:

1. `catalog.json` is the explicit publication allowlist.
2. `npm run build` creates `dist/<id>-<version>.tar.gz` packages.
3. `index.json` and `dist/index.json` list package URLs and SHA-256 checksums.
4. `npm run sign:index` writes `index.json.sig` when the signing key is provided in the environment.
5. Consumers should install selected packages, verify checksums, vendor them into the project, and activate blueprint ids explicitly.

The legacy source catalog at `catalog/index.json` remains available for current CLI compatibility while the public install contract moves to versioned packages.

## Advanced Install Model

The intended AgentPlane integration is:

1. Sync this catalog index into an AgentPlane user cache.
2. During advanced `agentplane init`, offer blueprints or packs after the built-in route
   explanation.
3. Install selected blueprints into the project.
4. Write or update `.agentplane/blueprints/config.json` with explicit allowlist activation only for
   selected blueprint ids.
5. Keep base mode unchanged: if no advanced selection is made, the project uses the built-in seven
   blueprints.

## Install Targets

The install surface has two first-class target types:

- `blueprint`: install one catalog blueprint, for example `performance-benchmark`.
- `pack`: expand a catalog pack into several blueprint installs, for example `enterprise-baseline`.

A pack is optional convenience, not the primary artifact model. Users must be able to install a
single blueprint without installing a pack:

```bash
agentplane blueprints install performance-benchmark
```

Pack install uses the same underlying blueprint install path after expansion:

```bash
agentplane blueprints install enterprise-baseline
```

If a catalog ever contains the same id for a blueprint and a pack, AgentPlane must require an
explicit kind selector such as `--kind blueprint` or `--kind pack`.

## Current Examples

- `performance-benchmark`: benchmark route for baseline/comparison work.
- `quality-regression`: regression route for CI, lint, test, and coverage failures.
- `runner-execution`: runner route for bundle, trace, replay, and result-manifest work.
- `enterprise-baseline`: pack that installs the three blueprints above together.

## Non-goals

- No automatic remote execution.
- No automatic activation after install.
- No replacement for AgentPlane built-in blueprints.
- No shadowing of built-in blueprint ids.
- No broad workflow engine semantics in this catalog.
