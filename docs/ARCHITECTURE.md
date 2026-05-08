# Architecture

## Problem

AgentPlane core has a small built-in blueprint registry. That is correct for the base product, but
organizations need narrower route contracts for their own evidence, approvals, audit trails, and
change-control habits.

This repository provides those organization-specific routes without adding them to AgentPlane core.

## Terms

- Built-in blueprint: shipped in AgentPlane core.
- Catalog blueprint: installable unit containing one project-local blueprint definition and optional
  supporting materials.
- Pack: lightweight wrapper that references multiple blueprints for simultaneous install; it is not
  required when the user only needs one blueprint.
- Activation: explicit project-level trust decision that allows selected blueprint ids.
- Selection: resolver decision that chooses an activated blueprint for a task.

## Layering

```text
AgentPlane core
  built-in blueprints
  resolver
  project-local trust loader
  task lifecycle

Blueprint catalog
  index
  blueprints
  packs
  schemas
  validation and generated dist index

Project
  .agentplane/blueprints/*.json
  .agentplane/blueprints/config.json
  task metadata and blueprint_request
```

## Install Flow

Baseline mode:

1. `agentplane init` uses the built-in seven blueprints.
2. No catalog network access is required.
3. No external blueprints are installed.

Advanced mode:

1. AgentPlane refreshes the blueprint catalog index into a user cache.
2. User selects individual blueprints, packs, or both.
3. AgentPlane expands packs into blueprint ids.
4. AgentPlane vendors selected blueprints into the project.
5. AgentPlane writes project-local blueprint files.
6. AgentPlane writes `.agentplane/blueprints/config.json` with explicit allowlist activation.
7. Resolver can use only trusted and compatible ids.

## Why Packs Are Lightweight

Packs must not define lifecycle behavior directly. A pack should only group blueprints:

```json
{
  "id": "enterprise-baseline",
  "blueprints": [{ "id": "performance-benchmark" }]
}
```

This keeps the trust decision inspectable. The actual route definitions remain in blueprints, and
activation still happens at route blueprint id level.

## Cache Model

The intended cache mirrors the external catalog mechanics used by AgentPlane recipes:

```text
~/.agentplane/blueprints/
  indexes/
  blueprints/
  packs/
```

The project should not depend on the cache at runtime. Installed blueprints are vendored into the
project so CI and agents can resolve the same route without network access.

## Security Model

External blueprints are stronger than normal AgentPlane recipes because they define evidence and
approval routes. Therefore:

- install is not activation;
- activation is explicit allowlist;
- built-in ids cannot be shadowed;
- invalid trust config fails closed;
- pack membership does not imply trust;
- automatic selection must be disabled until project policy opts in.

## Compatibility

Every catalog blueprint declares:

- AgentPlane minimum version;
- blueprint schema version;
- route blueprint id;
- local file paths.

Future catalog signing should cover both source index and generated dist index.
