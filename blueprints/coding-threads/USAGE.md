---
schema_version: 1
id: coding-threads
blueprint_id: coding.threads
package: coding-threads
usage_version: 1
audience:
  - coding agents
  - repository maintainers
purpose: Explain how to turn finished coding work into approval-gated Meta Threads status drafts.
editorial_paths:
  preferred: marketing/EDITORIAL.md
  fallback:
    - marketing/docs/editorial/EDITORIAL.md
required_project_files:
  any_of:
    - marketing/EDITORIAL.md
    - marketing/docs/editorial/EDITORIAL.md
recommended_project_files:
  - marketing/VOICE.md
  - marketing/launch/threads.md
outputs:
  - .agentplane/tasks/<task-id>/social/threads-draft.md
  - .agentplane/tasks/<task-id>/social/threads-decision.json
commands:
  install: ap blueprints install coding-threads --index https://raw.githubusercontent.com/basilisk-labs/agentplane-blueprints/main/index.json --activate
  draft: ap ext coding-threads draft <task-id>
  publish: ap ext coding-threads publish <task-id>
default_mode: draft-only
external_side_effects:
  publish_requires_exact_text_approval: true
  publish_requires_project_publisher: true
---

# Coding Threads usage

`coding-threads` helps a coding project turn finished engineering work into useful Meta Threads status updates.

The blueprint is not a generic social-media bot. It is an evidence-first route for deciding whether a completed coding task is worth a public Threads post, drafting that post from task evidence, and blocking publication until a human approves the exact text.

## Install

```bash
ap blueprints install coding-threads \
  --index https://raw.githubusercontent.com/basilisk-labs/agentplane-blueprints/main/index.json \
  --activate
```

After install, the project should have:

```text
.agentplane/blueprints/coding.threads.json
.agentplane/blueprint-catalog/coding-threads/blueprint.json
.agentplane/blueprint-catalog/coding-threads/USAGE.md
.agentplane/blueprint-catalog/coding-threads/policy/coding-threads.md
.agentplane/blueprint-catalog/coding-threads/evidence-templates/coding-threads.md
```

## Project setup

Add marketing/editorial material to the coding repository. A submodule is the recommended shape because it keeps product voice separate from implementation code while still making it repo-visible to agents.

Recommended structure:

```text
marketing/EDITORIAL.md
marketing/VOICE.md
marketing/launch/threads.md
```

Minimum required editorial source:

```text
marketing/EDITORIAL.md
```

If the project keeps marketing docs in a nested documentation tree, this fallback is also valid:

```text
marketing/docs/editorial/EDITORIAL.md
```

Resolution order:

1. Use `marketing/EDITORIAL.md` when present.
2. Otherwise use `marketing/docs/editorial/EDITORIAL.md`.
3. If neither file exists, or the available file is stale or ambiguous, stay in draft-only mode. Do not publish.

## Threads API setup

Publishing requires a project-approved Threads publisher adapter. Do not store Meta credentials or access tokens in Git, task artifacts, blueprint files, or marketing docs. Store them in a local secret manager, CI secret store, or an untracked environment file loaded only by the publisher adapter.

For an own-account publisher using the Threads API, create or open a Meta app with Threads API access and collect:

```text
THREADS_APP_ID
THREADS_APP_SECRET
THREADS_REDIRECT_URI
THREADS_ACCESS_TOKEN
```

The access token must belong to the Threads account that will publish and must include permissions for basic profile access and content publishing. Current commonly documented scopes are:

```text
threads_basic
threads_content_publish
```

Recommended redirect URI for hosted OAuth:

```text
https://agentplane.cloud/auth/threads/callback
```

Recommended local development redirect URI when Meta accepts it for the app:

```text
http://127.0.0.1:8787/auth/threads/callback
```

Recommended local convention:

```text
.env.local
```

Recommended ignored entries:

```text
.env
.env.local
.env.*.local
```

Publishing remains blocked until:

1. the exact Threads post text is approved by a human;
2. credentials and a valid access token are available to the publisher adapter outside Git;
3. the adapter records either the Threads permalink or a failure reason in the task social artifact.

## Draft flow

Run this after a coding task is genuinely finished:

```bash
ap ext coding-threads draft <task-id>
```

The draft command should analyze:

- task README;
- Agent Change Record when present;
- commit or PR evidence;
- verification notes;
- changed-path summary;
- marketing/editorial files.

Expected output:

```text
.agentplane/tasks/<task-id>/social/threads-draft.md
.agentplane/tasks/<task-id>/social/threads-decision.json
```

The draft should include:

- post-worthiness decision;
- source evidence;
- claim limits;
- 2-4 draft variants when useful;
- length check, normally max 500 characters;
- privacy and unsupported-claim checks;
- recommendation: post, revise, skip, or weekly-digest backlog.

## Publish flow

Run only after a human approves the exact final text:

```bash
ap ext coding-threads publish <task-id>
```

Publishing is an external side effect. The command must either:

- post through a project-approved Threads publisher adapter;
- record a manually posted Threads permalink;
- or record a draft-only/skip decision.

Never auto-publish generated text without exact-text approval.

## What to post

Good candidates:

- work that strengthens AgentPlane-style evidence, ACR, verification, runner, blueprint, or workflow reliability;
- small internal refactors that clarify a larger product invariant;
- release, package, or integration work with verified public availability;
- useful engineering lessons that can be explained without private context.

Weak candidates:

- pure dependency churn;
- internal cleanup with no public product signal;
- local-only work that sounds shipped;
- benchmark or security claims without recorded evidence.

## Language rules

Use the project editorial policy first. When it is silent, prefer:

- concrete evidence over launch language;
- status clarity over hype;
- "draft", "merged", "released", or "deployed" only when that exact state is proven;
- one product lesson per post;
- no private paths, tokens, customer context, or unreleased security details;
- concise text that fits Threads' short-form conversation format.

## Agent explanation template

When a user asks how to use this blueprint, answer with:

1. what it does;
2. which marketing files it expects;
3. how to install it;
4. how to draft from a finished task;
5. where outputs are written;
6. why publish is approval-gated;
7. what remains project-specific: publisher adapter, valid Meta/Threads token flow, and editorial policy.

## Current implementation note

This package defines the route, policy, evidence template, and usage contract. The `ap ext coding-threads ...` commands are the intended extension namespace. If the installed AgentPlane CLI does not yet expose `ap ext`, an agent can still use this guide to run the workflow manually and write the same output artifacts.
