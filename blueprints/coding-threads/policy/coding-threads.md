# Coding Threads Policy

Use this route only after coding work has a traceable finished state.

Required inputs:

- source task README, ACR, PR, or commit evidence;
- exact status boundary: local-only, merged, released, deployed, or draft-only;
- marketing/editorial materials, preferably from a project `marketing` submodule;
- public-value score and risk review;
- human approval for the exact Threads post text before external publishing.

Default behavior is draft-only. Publishing is allowed only through a project-approved Threads publisher adapter or by recording a manual Threads permalink after human action.

Editorial rules:

- turn internal code work into a public product or engineering signal;
- prefer concrete evidence over launchy claims;
- keep each Threads post at or under 500 characters unless the project adapter proves a different current limit;
- do not say shipped, released, deployed, faster, safer, adopted, or production unless evidence proves it;
- do not expose private paths, customer context, secrets, unreleased security details, or unsupported metrics;
- if the marketing/editorial source is unavailable, stale, or ambiguous, write drafts but block publish.

Recommended project structure:

```text
marketing/EDITORIAL.md
marketing/docs/editorial/EDITORIAL.md
marketing/VOICE.md
marketing/launch/threads.md
.agentplane/tasks/<task-id>/social/threads-draft.md
.agentplane/tasks/<task-id>/social/threads-decision.json
```

Extension command model:

- expose optional commands under a blueprint/extension namespace, not the AgentPlane core command surface;
- the top-level extension command should list installed extension namespaces and available actions;
- recommended commands are `ap ext list`, `ap ext coding-threads draft <task-id>`, and `ap ext coding-threads publish <task-id>`;
- `draft` writes local artifacts only;
- `publish` requires exact-text approval and a project-approved Threads publisher adapter or recorded manual permalink.
