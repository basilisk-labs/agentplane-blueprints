# Concept Assessment

## Assessment

The concept is directionally strong: reuse the external-repository mechanics of AgentPlane recipes,
but keep blueprints as a fully parallel artifact type with stricter activation. It preserves a small
AgentPlane core while giving organizations a place to encode audit and evidence routes.

## What Is Good

1. Core stays small.

   The built-in seven blueprints remain a base ontology. Organization-specific routes move to a
   catalog instead of inflating AgentPlane itself.

2. Advanced users get a clear extension path.

   Advanced init can install security, compliance, migration, benchmark, or runner routes only when
   they are useful.

3. Packs are correctly lightweight.

   A pack as a wrapper over blueprints is safer than a pack as another lifecycle authority. The
   source of route behavior remains each blueprint definition, and users can still install one
   blueprint directly when a bundle is unnecessary.

4. Offline reproducibility is possible.

   Vendoring blueprints into the project means CI and agents do not need network access to understand
   route contracts.

## What Is Bad

1. Naming can confuse users if recipes leak into the model.

   Recipes are only the UX analogy for sync/install/cache mechanics. The artifact type in this
   repository is blueprint, and packs are collections of blueprints.

2. Trust risk is higher than with normal recipes.

   A malicious or sloppy blueprint can alter required evidence, approval expectations, or route
   shape. Install must not equal activation.

3. Automatic selection can become opaque.

   If advanced init enables a pack and the resolver silently starts selecting new routes, users will
   not understand why tasks changed behavior.

4. Catalog drift can break projects.

   If a project references remote catalog state instead of vendored files, old tasks can become
   unreplayable.

5. Packs can hide scope expansion.

   Installing a pack may pull in more blueprints than the user understands. Pack expansion must be
   printed before write.

## Improvements

1. Use three verbs: sync, install, activate.

   - sync: download catalog metadata to cache;
   - install: vendor blueprints into the project;
   - activate: allow specific blueprint ids in project trust config.

2. Keep activation at blueprint id level.

   Packs may recommend activation, but the final trusted list should contain blueprint ids, not pack
   ids. This keeps review precise.

3. Add an activation preview.

   Before writing trust config, show:

   - blueprints installed;
   - blueprint ids added;
   - policy files added;
   - evidence templates added;
   - routes that can now be requested;
   - routes that can be automatically selected, if that mode is ever enabled.

4. Default to explicit-only selection.

   Automatic org-specific selection should be a later capability with separate policy approval.

5. Add source provenance.

   Project metadata should record catalog id, blueprint version, digest, install mode, and activation
   timestamp.

6. Keep built-ins unshadowable.

   Organization packs should add ids like `acme.security.review`, never override `code.branch_pr`.

## Recommended Product Shape

```text
base init
  built-in seven blueprints only

advanced init
  optional catalog sync
  install selected individual blueprints or packs
  explicit activation preview
  project-local vendored files

runtime
  resolver uses built-ins plus activated local blueprints
  explain output shows source and selection reason
  runner sees resolved plan and context budget
```

## Weakest Link

The weakest link is not repository mechanics. It is resolver policy. Once external blueprints exist,
the product must prevent accidental privilege escalation: no silent publish routes, no hidden
approval bypass, no shadowed built-ins, and no auto-selection without a project-level policy switch.
