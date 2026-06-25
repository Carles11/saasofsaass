# 🧭 AI Usage Guide — how to drive Claude Code & OpenCode here

A goal-oriented cheat sheet for the AI tooling in this repo. "I want to **X** →
do **Y**." The shared rules live in [`AGENTS.md`](../../../../AGENTS.md)
(§ "🤝 Working Protocol & AI Agent Routing"); this file is just the operator's
quick reference.

> **Invocation legend**
> - **Command** → type `/name` (both Claude Code and OpenCode).
> - **Agent** → say "use the *name* agent" (Claude) / "use the *name* subagent" or `@name` (OpenCode).
> - **Skill** → Claude only; ask for it by name ("run a release-check").

---

## What's automatic (no action needed)

- **AGENTS.md rules** load every session (Claude via `CLAUDE.md` `@import`,
  OpenCode natively). Staged execution, green gate, no hardcoded strings, FSD,
  schema-push gating are always in effect.
- Agents and skills are **auto-discovered**. They may trigger on their own, but
  naming them explicitly is more reliable (and gets the token savings).

---

## Goals → what to run

### 🔍 "Find where something lives / how a feature is wired"
- **Use the `explorer` agent** (read-only, cheap/Haiku in Claude).
- Example: *"use the explorer agent to find where custom-domain verification is handled."*

### 🧱 "Add a new tenant block"
End-to-end assembly line:
1. `/plan-block <name>` → produces the plan (storage pattern, FSD, schema diff,
   translation keys, SEO/GEO). **Stops for your approval.**
2. `/approve-stage` → approve and restate the standing rules.
3. **Use the `block-builder` agent** (Sonnet) to implement it.
4. `/audit-translations <name>` → confirm no hardcoded strings / seed gaps.
5. Ask for an **`seo-geo-audit`** (skill) on the block.
6. `/verify-gate` → must be green before you call it done.

### 🌍 "Check translations are complete"
- `/audit-translations <block or feature>` → reports hardcoded strings, missing
  seed entries (per locale), namespace/naming issues. Reports only — won't fix
  without approval.

### 🔎 "Check SEO / AI-crawler legibility"
- Ask for the **`seo-geo-audit`** skill (Claude) on a tenant-facing block/page.
  Covers semantic HTML, JSON-LD, alt text, crawlable links.

### ✅ "Is the build OK?"
- `/verify-gate` → runs `npx tsc --noEmit` + `npm run lint`; reports GREEN or the
  exact failing lines. Zero errors = pass (warnings OK).

### 🗄️ "Apply a schema change safely"
- `/safe-db-push` → runs `db:generate`, shows the SQL, summarizes what changes
  (flags destructive ops), **waits for your confirmation**, then pushes.
- Never let the AI push schema automatically.

### 🚢 "Am I ready to deploy?"
- Ask for the **`release-check`** skill (Claude) → GO/NO-GO sweep: build gate,
  uncommitted work, migration drift, `<img>`/hardcoded-string spot checks, env
  readiness (e.g. Stripe price IDs).

### 📝 "Update docs / README / comments"
- **Use the `docs-writer` agent** (Haiku, cheap). Docs only — never changes
  runtime logic.

### 🧠 "Plan a non-trivial feature (not a block)"
- Just ask for a plan first and `/approve-stage` when ready. AGENTS.md already
  requires plan-before-code for non-trivial work.

---

## Commands reference

| Command | Does | Tool |
| --- | --- | --- |
| `/plan-block <name>` | Plan a new block, stop for approval | both |
| `/approve-stage` | Approve current stage + restate rules | both |
| `/audit-translations <x>` | Hardcoded-string & seed audit (report only) | both |
| `/verify-gate` | tsc + lint, report green/red | both |
| `/safe-db-push` | generate → show SQL → confirm → push | both |

## Agents reference

| Agent | Model (Claude) | Use for |
| --- | --- | --- |
| `explorer` | Haiku | read-only search / "where is X" |
| `block-builder` | Sonnet | implement a tenant block |
| `docs-writer` | Haiku | docs, comments, commit bodies |

In **OpenCode** these agents inherit your session model (no per-agent slug), so
set the session model to control cost there.

## Skills reference (Claude only)

| Skill | Use for |
| --- | --- |
| `seo-geo-audit` | AGENTS §5 crawler-legibility audit of tenant output |
| `release-check` | pre-deploy GO/NO-GO readiness sweep |

---

## Token economy (the point of all this)

- **Delegate grunt work** to cheap agents: lookups → `explorer`, docs →
  `docs-writer` (both Haiku in Claude). Don't burn Opus on a README.
- **Main session model is your per-session choice** — `/fast` for fast Opus, or
  the model picker for Sonnet on routine work. The routing table only
  auto-applies to subagents.
- Knowledge lives in `AGENTS.md` (loaded once), not duplicated per chat — keep it
  tight.

## Keeping both tools aligned

Put any **new shared rule/standard in `AGENTS.md`** (both tools read it). Only add
tool-specific wrappers in `.claude/` or `.opencode/` when you need a new command
or agent — and mirror commands/agents in both. Claude-only **skills** are a
convenience; their content is invisible to OpenCode, so don't put
must-be-shared knowledge there.
