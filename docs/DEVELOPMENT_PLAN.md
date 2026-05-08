# Development Plan

## Goal

Finish a production-ready AgentPlane blueprint catalog that uses recipe-like sync/install/cache
mechanics, stays a separate blueprint artifact type, and can be optionally added during advanced
`agentplane init`.

## Current State

Implemented in this repository:

- catalog source index;
- atomic blueprint manifests;
- lightweight pack manifest;
- three initial blueprint examples;
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
   - `agentplane blueprints install <id>` for both blueprint ids and pack ids;
   - resolve `<id>` as either an individual blueprint or a pack;
   - require `--kind blueprint|pack` when ids are ambiguous;
   - support local path, URL, and catalog id for individual blueprints;
   - support catalog id for packs, with optional local path support if the pack manifest is present;
   - vendor files into project;
   - never activate implicitly.

4. Add activation commands.
   - `agentplane blueprints activate <blueprint-id>`;
   - `agentplane blueprints deactivate <blueprint-id>`;
   - update `.agentplane/blueprints/config.json`;
   - run `agentplane blueprint validate --project`.

5. Add advanced init integration.
   - base profile: no external blueprints;
   - advanced profile: select individual blueprints, packs, or both;
   - show activation preview before writing;
   - preserve offline project reproducibility.

6. Add signing and provenance.
   - sign catalog index;
   - verify blueprint archive digests;
   - record source, version, digest, installed_at, and activated_by in project metadata.

## Required Catalog Work

1. Replace dependency-free structural checks with full JSON Schema validation or generate schemas
   from AgentPlane core types.
2. Add archive packaging.
3. Add signed index generation.
4. Add fixture projects that install every blueprint.
5. Add compatibility matrix against supported AgentPlane versions.
6. Add more blueprints only after task-history evidence justifies them.

## Acceptance Criteria

- `npm run check` validates source files and generated index freshness.
- AgentPlane can install one blueprint by id into a fresh project.
- AgentPlane can install one pack and expand it into blueprint installs.
- Advanced init can offer individual blueprints and packs in the same selection flow.
- Activation remains explicit and visible through `agentplane blueprint list --trusted`.
- A project can run without network access after installation.
- Base initialization path still uses only built-in blueprints.

## Open Decisions

- Whether catalog commands should live under `agentplane blueprint` or `agentplane blueprints`.
- Whether pack ids and blueprint ids share one namespace or require kind-qualified commands.
- Whether pack install should allow optional blueprints.
- Whether org policy can enable automatic selection, or only explicit blueprint requests.
- Whether blueprints and recipes should share one signed catalog protocol implementation while
  keeping separate artifact schemas.
