---
id: "202605081643-VF8VNV"
title: "Align catalog model with blueprint-first terminology"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-05-08T16:43:42.065Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-05-08T16:47:13.862Z"
  updated_by: "CODER"
  note: "Command: npm run check. Result: pass. Evidence: catalog validation passed for 3 catalog blueprints, 1 pack, and 3 route definitions; dist/index.json is current. Command: ap blueprint validate for performance.benchmark, quality.regression, and runner.execution. Result: pass. Evidence: all route definition JSON files validate with AgentPlane. Command: node .agentplane/policy/check-routing.mjs && ap doctor && git diff --check. Result: pass. Evidence: policy routing OK, doctor OK with project blueprint compatibility info only, and whitespace diff check clean. Scope: blueprint-first catalog terminology, manifests, pack format, scripts, schemas, docs, and generated dist index."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Correcting the catalog repository to make blueprints the atomic installable units and packs lightweight blueprint collections."
events:
  -
    type: "status"
    at: "2026-05-08T16:43:44.058Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Correcting the catalog repository to make blueprints the atomic installable units and packs lightweight blueprint collections."
  -
    type: "verify"
    at: "2026-05-08T16:47:13.862Z"
    author: "CODER"
    state: "ok"
    note: "Command: npm run check. Result: pass. Evidence: catalog validation passed for 3 catalog blueprints, 1 pack, and 3 route definitions; dist/index.json is current. Command: ap blueprint validate for performance.benchmark, quality.regression, and runner.execution. Result: pass. Evidence: all route definition JSON files validate with AgentPlane. Command: node .agentplane/policy/check-routing.mjs && ap doctor && git diff --check. Result: pass. Evidence: policy routing OK, doctor OK with project blueprint compatibility info only, and whitespace diff check clean. Scope: blueprint-first catalog terminology, manifests, pack format, scripts, schemas, docs, and generated dist index."
doc_version: 3
doc_updated_at: "2026-05-08T16:47:13.951Z"
doc_updated_by: "CODER"
description: "Remove blueprint-recipe terminology from the catalog repository and make blueprints the atomic installable units, with packs as lightweight collections of blueprint ids."
sections:
  Summary: |-
    Align catalog model with blueprint-first terminology
    
    Remove blueprint-recipe terminology from the catalog repository and make blueprints the atomic installable units, with packs as lightweight collections of blueprint ids.
  Scope: |-
    - In scope: Remove blueprint-recipe terminology from the catalog repository and make blueprints the atomic installable units, with packs as lightweight collections of blueprint ids.
    - Out of scope: unrelated refactors not required for "Align catalog model with blueprint-first terminology".
  Plan: "Rename the catalog source model from recipe-based to blueprint-based. Scope: update directory names, manifests, schemas, validation/build scripts, pack format, generated dist index, README, and docs so the atomic installable unit is a blueprint and packs are collections of blueprint ids. Preserve the analogy to recipe mechanics only as install/cache/vendor UX, not as data model terminology. Verify with npm run check, AgentPlane blueprint validation, routing check, doctor, and clean git status."
  Verify Steps: |-
    1. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
    2. Run the most relevant validation step for the `code` task. Expected: it succeeds without unexpected regressions in touched scope.
    3. Compare the final result against the task summary and scope. Expected: any remaining follow-up is explicit in ## Findings.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-05-08T16:47:13.862Z — VERIFY — ok
    
    By: CODER
    
    Note: Command: npm run check. Result: pass. Evidence: catalog validation passed for 3 catalog blueprints, 1 pack, and 3 route definitions; dist/index.json is current. Command: ap blueprint validate for performance.benchmark, quality.regression, and runner.execution. Result: pass. Evidence: all route definition JSON files validate with AgentPlane. Command: node .agentplane/policy/check-routing.mjs && ap doctor && git diff --check. Result: pass. Evidence: policy routing OK, doctor OK with project blueprint compatibility info only, and whitespace diff check clean. Scope: blueprint-first catalog terminology, manifests, pack format, scripts, schemas, docs, and generated dist index.
    
    VerifyStepsRef: doc_version=3, doc_updated_at=2026-05-08T16:43:44.058Z, excerpt_hash=sha256:0c911ba57bbda86e6b1d4b2c31f39ff10ccc1febf923fdb7f66dbb574080a0d7
    
    Details:
    
    BlueprintSnapshotRef:
    - state: current
    - path: /Users/densmirnov/Github/agentplane-blueprints/.agentplane/tasks/202605081643-VF8VNV/blueprint/resolved-snapshot.json
    - old_digest: 47f8d8fc1e14518f31a96675e93d8d168ee4fc10ce516104e889427514c1bd2f
    - current_digest: 47f8d8fc1e14518f31a96675e93d8d168ee4fc10ce516104e889427514c1bd2f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202605081643-VF8VNV
    
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
