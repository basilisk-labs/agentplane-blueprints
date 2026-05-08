# Architecture

## Problem

AgentPlane core has a small built-in blueprint registry. That is correct for the base product, but
organizations need narrower route contracts for their own evidence, approvals, audit trails, and
change-control habits.

This repository provides those organization-specific routes without adding them to AgentPlane core.

## Terms

- Built-in blueprint: shipped in AgentPlane core.
- Blueprint recipe: installable unit containing one or more project-local blueprint definitions and
  optional supporting materials.
- Pack: lightweight wrapper that references multiple blueprint recipes for simultaneous install.
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
  recipes
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
3. No external blueprint recipes are installed.

Advanced mode:

1. AgentPlane refreshes the blueprint catalog index into a user cache.
2. User selects recipes or packs.
3. AgentPlane vendors selected recipes into the project.
4. AgentPlane writes project-local blueprint files.
5. AgentPlane writes `.agentplane/blueprints/config.json` with explicit allowlist activation.
6. Resolver can use only trusted and compatible ids.

## Why Packs Are Lightweight

Packs must not define lifecycle behavior directly. A pack should only group recipes:

```json
{
  "id": "enterprise-baseline",
  "recipes": [{ "id": "performance-benchmark" }]
}
```

This keeps the trust decision inspectable. The actual blueprint definitions remain in recipes, and
activation still happens at blueprint id level.

## Cache Model

The intended cache mirrors recipe catalog behavior:

```text
~/.agentplane/blueprints/
  indexes/
  recipes/
  packs/
```

The project should not depend on the cache at runtime. Installed recipes are vendored into the
project so CI and agents can resolve the same route without network access.

## Security Model

Blueprint recipes are stronger than normal recipes because they define evidence and approval
routes. Therefore:

- install is not activation;
- activation is explicit allowlist;
- built-in ids cannot be shadowed;
- invalid trust config fails closed;
- pack membership does not imply trust;
- automatic selection must be disabled until project policy opts in.

## Compatibility

Every recipe declares:

- recipe schema version;
- AgentPlane minimum version;
- blueprint schema version;
- blueprint ids;
- local file paths.

Future catalog signing should cover both source index and generated dist index.
