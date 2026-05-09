---
id: "202605091859-GKN0V3"
title: "Package blueprint catalog releases"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-05-09T19:00:16.669Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-05-09T19:03:10.232Z"
  updated_by: "CODER"
  note: "Blueprint release packaging layer verified."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implementing the approved recipes-like package distribution layer for external blueprints, including generated tarballs, sha256 package metadata, optional signing support, and updated catalog checks."
events:
  -
    type: "status"
    at: "2026-05-09T19:00:34.720Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implementing the approved recipes-like package distribution layer for external blueprints, including generated tarballs, sha256 package metadata, optional signing support, and updated catalog checks."
  -
    type: "verify"
    at: "2026-05-09T19:03:10.232Z"
    author: "CODER"
    state: "ok"
    note: "Blueprint release packaging layer verified."
doc_version: 3
doc_updated_at: "2026-05-09T19:03:10.265Z"
doc_updated_by: "CODER"
description: "Move the blueprint catalog toward a recipes-like distribution contract: publication allowlist, versioned tarball packages with sha256, generated remote index, and build/check coverage while preserving source catalog compatibility."
sections:
  Summary: |-
    Package blueprint catalog releases
    
    Move the blueprint catalog toward a recipes-like distribution contract: publication allowlist, versioned tarball packages with sha256, generated remote index, and build/check coverage while preserving source catalog compatibility.
  Scope: |-
    - In scope: Move the blueprint catalog toward a recipes-like distribution contract: publication allowlist, versioned tarball packages with sha256, generated remote index, and build/check coverage while preserving source catalog compatibility.
    - Out of scope: unrelated refactors not required for "Package blueprint catalog releases".
  Plan: "Implement the first recipes-like distribution layer in agentplane-blueprints: add a publication allowlist, generate versioned blueprint package tarballs with sha256 metadata, generate a remote package index, add optional Ed25519 signing support and signature schema, update README/scripts, preserve the existing source catalog for current CLI compatibility, and verify with catalog/package checks plus AgentPlane routing/doctor."
  Verify Steps: |-
    1. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
    2. Run the most relevant validation step for the `code` task. Expected: it succeeds without unexpected regressions in touched scope.
    3. Compare the final result against the task summary and scope. Expected: any remaining follow-up is explicit in ## Findings.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-05-09T19:03:10.232Z — VERIFY — ok
    
    By: CODER
    
    Note: Blueprint release packaging layer verified.
    Attempts: 0
    
    VerifyStepsRef: doc_version=3, doc_updated_at=2026-05-09T19:00:34.720Z, excerpt_hash=sha256:0c911ba57bbda86e6b1d4b2c31f39ff10ccc1febf923fdb7f66dbb574080a0d7
    
    Details:
    
    Command: ap task verify-show 202605091859-GKN0V3. Result: pass. Evidence: code.direct route current; required evidence includes changed_paths, check_result, commit. Scope: task verification contract.
    
    Command: npm run validate && npm run check. Result: pass. Evidence: catalog validation passed with 4 catalog blueprints, 1 pack, 4 route definitions; release indexes and packages are current. Scope: source catalog, publication allowlist, generated package index, and package tarballs.
    
    Command: node .agentplane/policy/check-routing.mjs && ap doctor. Result: pass. Evidence: policy routing OK; doctor OK with errors=0 warnings=0. Scope: repository policy routing and AgentPlane workspace health.
    
    Command: tar -tzf dist/coding-twitter-0.1.0.tar.gz and index entry inspection. Result: pass. Evidence: package contains blueprint manifest, route definition, policy, and evidence template; index entry includes package URL and sha256. Scope: coding-twitter package integrity.
    
    BlueprintSnapshotRef:
    - state: current
    - path: /Users/densmirnov/Github/agentplane-blueprints/.agentplane/tasks/202605091859-GKN0V3/blueprint/resolved-snapshot.json
    - old_digest: 049a3fbf8f7de5644c33ae93bd39d6276b1367e936082d408b2b9239da46c970
    - current_digest: 049a3fbf8f7de5644c33ae93bd39d6276b1367e936082d408b2b9239da46c970
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202605091859-GKN0V3
    
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
