# Handoff

## Current state (2026-07-24)

Repository initialized and published to GitHub: `DingDingChae/Photo-Viewer`.

**Done:**
- README.md, ROADMAP.md, HANDOFF.md, .gitignore committed and pushed to `main`.
- GitHub Discussions enabled; rolling progress thread opened in `General`.
- Changelog Announcement posted and pinned for the initial push.
- GitHub Project created, linked to the repo, with one task item moved to `In Progress`.

**Next up:**
1. Scaffold the app: Vite + React + TypeScript (see ROADMAP.md Milestone 1).
2. Add CI workflow (trigger: `push` + `workflow_dispatch`) that tests first, then creates one uniquely tagged non-draft release on success.
3. Design the persistent AI index schema before writing indexing code.
4. Plan the self-hosting architecture early (backend + frontend in one Docker image, volume-mounted library, original-file download endpoint) so the Milestone 1 scaffold doesn't box it in.

**Blockers / notes:**
- None. No application code exists yet — CI/release automation lands with the app scaffold.
- License not yet chosen (`TBD` in README).
