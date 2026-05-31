# brain-dump `.claude/memory/` conventions

Project-local memory dir for brain-dump (extracted project pattern).

## What lives here

- `thread-state.md`: current workstream brief + execution log. Canonical handoff brief at the top (3-sentence status + active deliverables + open items + pointer below); append-only execution log below. **Not yet created**: brain-dump is parked / low-priority as of 2026-05-30, no active workstream.
- `capabilities-supplement.md`: brain-dump-specific capability notes that layer on top of `~/code/CODE/memory/capabilities.md`. **Not yet created**: pending reactivation.
- `threads/`: per-workstream thread-state files when more than one thread runs at once. **Not yet created**: pending reactivation.
- `threads/archived/`: closed thread-state snapshots (canonical brief rewritten to DONE on wrap-up, then archived here). **Not yet created**.
- This `README.md`: the dir conventions doc you're reading.

## Why this dir exists

brain-dump is an extracted project (own `.git`, own remote at `github.com/travisbreaks/brain-dump`, sibling to CODE not inside it). Per the per-project-memory canon at `~/code/CODE/.claude/rules/per-project-memory.md`, extracted projects keep their session memory at `~/code/<project>/.claude/memory/` so the thread state ships with the repo and is visible to anyone (specialist or otherwise) cd'd into that project.

## Status: parked

brain-dump shipped a single initial-release commit in April 2026 (`d1a52a6 Initial release: voice capture + transcription PWA`) and has not been actively developed since. There is no active workstream, no open PRs, no `thread-state.md`. The specialist file at `../agents/brain-dump-specialist.md` is a working skeleton; it documents the stack + architecture from README + source, but lacks the experience-derived gotchas a depth pass would add.

## When brain-dump reactivates

The first reactivation session should:

1. Read the specialist file (`../agents/brain-dump-specialist.md`) to bootstrap context.
2. Create `thread-state.md` per the brief-overwrite discipline at `~/code/CODE/.claude/skills/thread-protocol/SKILL.md`.
3. Verify the project still deploys clean (token sourcing per architect canon: `CLOUDFLARE_API_TOKEN=$(security find-generic-password -s CLOUDFLARE_API_TOKEN -w) npm run deploy`).
4. Confirm the D1 + R2 bindings + Whisper AI binding still resolve.
5. If new gotchas surface during reactivation work, add them to the specialist file's "Known gotchas" section and remove the `[VERIFY: needs depth pass when project is activated.]` tag.

## See also

- `../agents/brain-dump-specialist.md`: the project specialist agent file.
- `~/code/CLAUDE.md`: architect layer (Tadao Prime identity, No-Fail Gates, Thread Protocol, addressing protocol).
- `~/code/CODE/.claude/rules/per-project-memory.md`: extracted-project memory canon.
- `~/code/CODE/.claude/skills/thread-protocol/SKILL.md`: brief-overwrite discipline + canonical thread-state shape.
