# Development Plan

## Goal

Finish a production-ready AgentPlane blueprint catalog that can be installed like recipes, cached in
the user home directory, and optionally added during advanced `agentplane init`.

## Current State

Implemented in this repository:

- catalog source index;
- atomic blueprint recipe manifests;
- lightweight pack manifest;
- three initial recipe examples;
- generated `dist/index.json`;
- dependency-free validation/build scripts;
- architecture and concept documentation.

## Required AgentPlane Core Work

1. Add blueprint catalog config to AgentPlane.
   - default catalog URL or local path;
   - cache directory;
   - disable-by-default base mode;
   - advanced init flag or interactive branch.

2. Add catalog sync commands.
   - `agentplane blueprints catalog refresh`;
   - `agentplane blueprints catalog list`;
   - `agentplane blueprints catalog info <id>`.

3. Add install commands.
   - `agentplane blueprints install <recipe-or-pack>`;
   - support local path, URL, and catalog id;
   - vendor files into project;
   - never activate implicitly.

4. Add activation commands.
   - `agentplane blueprints activate <blueprint-id>`;
   - `agentplane blueprints deactivate <blueprint-id>`;
   - update `.agentplane/blueprints/config.json`;
   - run `agentplane blueprint validate --project`.

5. Add advanced init integration.
   - base profile: no external blueprints;
   - advanced profile: select recipes or packs;
   - show activation preview before writing;
   - preserve offline project reproducibility.

6. Add signing and provenance.
   - sign catalog index;
   - verify recipe archive digests;
   - record source, version, digest, installed_at, and activated_by in project metadata.

## Required Catalog Work

1. Replace dependency-free structural checks with full JSON Schema validation or generate schemas
   from AgentPlane core types.
2. Add archive packaging.
3. Add signed index generation.
4. Add fixture projects that install every recipe.
5. Add compatibility matrix against supported AgentPlane versions.
6. Add more recipes only after task-history evidence justifies them.

## Acceptance Criteria

- `npm run check` validates source files and generated index freshness.
- AgentPlane can install one recipe by id into a fresh project.
- AgentPlane can install one pack and expand it into recipe installs.
- Activation remains explicit and visible through `agentplane blueprint list --trusted`.
- A project can run without network access after installation.
- Base initialization path still uses only built-in blueprints.

## Open Decisions

- Whether catalog commands should live under `agentplane blueprint` or `agentplane blueprints`.
- Whether pack install should allow optional recipes.
- Whether org policy can enable automatic selection, or only explicit blueprint requests.
- Whether recipes and blueprint recipes should share one signed catalog protocol.
