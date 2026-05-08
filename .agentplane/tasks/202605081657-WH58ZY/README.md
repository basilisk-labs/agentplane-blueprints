---
id: "202605081657-WH58ZY"
title: "Clarify single blueprint install target"
status: "DOING"
priority: "med"
owner: "DOCS"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "docs"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-05-08T16:57:43.751Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-05-08T16:59:04.752Z"
  updated_by: "DOCS"
  note: "Docs verification passed for explicit individual blueprint and pack install target clarification."
commit: null
comments:
  -
    author: "DOCS"
    body: "Start: Clarifying the blueprint catalog installation contract so individual blueprints and packs are both first-class install targets while preserving explicit activation and docs-only scope."
events:
  -
    type: "status"
    at: "2026-05-08T16:57:51.106Z"
    author: "DOCS"
    from: "TODO"
    to: "DOING"
    note: "Start: Clarifying the blueprint catalog installation contract so individual blueprints and packs are both first-class install targets while preserving explicit activation and docs-only scope."
  -
    type: "verify"
    at: "2026-05-08T16:59:04.752Z"
    author: "DOCS"
    state: "ok"
    note: "Docs verification passed for explicit individual blueprint and pack install target clarification."
doc_version: 3
doc_updated_at: "2026-05-08T16:59:04.774Z"
doc_updated_by: "DOCS"
description: "Document that the blueprint catalog installer supports both individual blueprint installation and pack installation, with packs expanding to multiple blueprint installs."
sections:
  Summary: |-
    Clarify single blueprint install target
    
    Document that the blueprint catalog installer supports both individual blueprint installation and pack installation, with packs expanding to multiple blueprint installs.
  Scope: |-
    - In scope: Document that the blueprint catalog installer supports both individual blueprint installation and pack installation, with packs expanding to multiple blueprint installs.
    - Out of scope: unrelated refactors not required for "Clarify single blueprint install target".
  Plan: "1. Clarify README install target model: individual blueprint and pack are both installable catalog entries. 2. Clarify install model with separate single-blueprint and pack examples, including pack expansion. 3. Update development acceptance criteria and open decisions so AgentPlane core work covers both target kinds. 4. Verify docs-only change with catalog check, routing check, doctor, and git diff sanity."
  Verify Steps: |-
    1. Review the requested outcome for "Clarify single blueprint install target". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-05-08T16:59:04.752Z — VERIFY — ok
    
    By: DOCS
    
    Note: Docs verification passed for explicit individual blueprint and pack install target clarification.
    
    VerifyStepsRef: doc_version=3, doc_updated_at=2026-05-08T16:57:51.106Z, excerpt_hash=sha256:2e53415c4d2bd97d4982081bd454f99f5b0d0b3af89222ccb8444a1d603200ce
    
    Details:
    
    Command: npm run check; Result: pass; Evidence: catalog validation passed for 3 catalog blueprints, 1 pack, 3 route definitions and dist/index.json is current. Command: node .agentplane/policy/check-routing.mjs; Result: pass; Evidence: policy routing OK. Command: PATH=/Users/densmirnov/.nvm/versions/node/v24.11.1/bin:/Users/densmirnov/.local/share/solana/install/active_release/bin:/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/System/Cryptexes/App/usr/bin:/usr/bin:/bin:/usr/sbin:/sbin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/local/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/appleinternal/bin:/opt/pkg/env/active/bin:/opt/pmk/env/global/bin:/Library/Apple/usr/bin:/Library/TeX/texbin:/Users/densmirnov/.codex/tmp/arg0/codex-arg0KCPSwr:/Users/densmirnov/Downloads/google-cloud-sdk/bin:/Users/densmirnov/.cargo/bin:/Users/densmirnov/.local/share/solana/install/active_release/bin:/Users/densmirnov/.bun/bin:/Users/densmirnov/.local/bin:/opt/homebrew/opt/rustup/bin:/Users/densmirnov/.antigravity/antigravity/bin:/Users/densmirnov/.codeium/windsurf/bin:/Users/densmirnov/.orbstack/bin:/opt/homebrew/opt/python@3.12/libexec/bin:/Users/densmirnov/.nvm/versions/node/v24.11.1/bin:/Users/densmirnov/.foundry/bin:/Applications/Obsidian.app/Contents/MacOS:/Applications/Codex.app/Contents/Resources:/Users/densmirnov/.orbstack/bin:/Applications/Obsidian.app/Contents/MacOS ap doctor; Result: pass; Evidence: doctor OK with errors=0 warnings=0. Command: git diff --check; Result: pass; Evidence: no whitespace errors. Scope: README.md, docs/INSTALL_MODEL.md, docs/DEVELOPMENT_PLAN.md, docs/ARCHITECTURE.md, docs/CONCEPT_ASSESSMENT.md.
    
    BlueprintSnapshotRef:
    - state: current
    - path: /Users/densmirnov/Github/agentplane-blueprints/.agentplane/tasks/202605081657-WH58ZY/blueprint/resolved-snapshot.json
    - old_digest: ad44c25b3f7937510ffe3a8406378ffb147a58fcaaab4987490d5ea052bd55c3
    - current_digest: ad44c25b3f7937510ffe3a8406378ffb147a58fcaaab4987490d5ea052bd55c3
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202605081657-WH58ZY
    
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
