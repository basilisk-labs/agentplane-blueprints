# Install Model

## Base Mode

Base AgentPlane initialization does not use this catalog.

```bash
agentplane init --yes
```

Result:

- built-in blueprints only;
- no catalog sync;
- no external blueprint files;
- no project-local trust config unless the user creates one.

## Advanced Mode

Advanced initialization may offer this catalog.

```bash
agentplane init --setup-profile enterprise
```

Intended prompt order:

1. Explain built-in blueprint routes.
2. Ask whether to enable advanced blueprint catalog selection.
3. Sync catalog metadata to user cache.
4. Let the user choose blueprints or packs.
5. Expand packs into blueprints.
6. Show install and activation preview.
7. Vendor blueprint files into the project.
8. Write explicit allowlist activation.

## Install Targets

The installer accepts both individual blueprints and packs as catalog targets.

Single blueprint install:

```bash
agentplane blueprints install performance-benchmark
```

Result:

- install one catalog blueprint manifest;
- vendor one route blueprint definition into the project;
- do not activate it until the trust config is explicitly updated.

Pack install:

```bash
agentplane blueprints install enterprise-baseline
```

Result:

- resolve the pack manifest;
- expand it into its referenced blueprint ids;
- install each referenced blueprint through the same install path used for a single blueprint;
- do not activate any route implicitly.

If a blueprint id and pack id collide, the command must fail closed and ask for an explicit kind,
for example `--kind blueprint` or `--kind pack`.

## Project Install Shape

```text
.agentplane/blueprints/
  performance.benchmark.json
  quality.regression.json
  runner.execution.json
  config.json
.agentplane/blueprint-catalog/
  performance-benchmark/
  quality-regression/
  runner-execution/
```

The exact target directories are an AgentPlane core decision. The invariant is that runtime route
resolution reads project-local files, not remote catalog state.

## Trust Config

```json
{
  "schema_version": 1,
  "trust_model": "explicit_allowlist",
  "enabled": true,
  "allowed_ids": [
    "performance.benchmark",
    "quality.regression",
    "runner.execution"
  ],
  "selection": "explicit_only"
}
```

## Pack Expansion

The `enterprise-baseline` pack expands to:

- `performance-benchmark`;
- `quality-regression`;
- `runner-execution`.

It does not define its own route and does not bypass activation.
