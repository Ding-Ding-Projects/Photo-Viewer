# Handoff

## Current state (2026-07-24)

Repository initialized and published to GitHub: `DingDingChae/Photo-Viewer`.

**Done:**
- README.md, ROADMAP.md, HANDOFF.md, .gitignore committed and pushed to `main`.
- GitHub Discussions enabled; rolling progress thread opened in `General`.
- Changelog Announcement posted and pinned for the initial push.
- GitHub Project created, linked to the repo, with one task item moved to `In Progress`.
- Vite + React + TypeScript app scaffolded; lint and production build pass; dev server smoke-tested (HTTP 200).
- Milestone 1 follow-ups landed in the scaffold: M3 Expressive theming with runtime controls (light/dark, seed color, density, font + scale), language system (English / HK Cantonese / bilingual + funny-level slider; errors stay clear), non-blocking snackbar notifications with Undo, and regex builder on the search bar (plain-text default).
- Photo grid + viewer with zoom, drag-pan, keyboard navigation, filmstrip, and EXIF side sheet running against `public/sample-library/` (8 CC-licensed sample photos).
- Folder picker wired to the File System Access API: Settings → Choose folder recursively scans a device folder, subfolders become albums, photos load via session object URLs, and favorites persist across library switches. Chromium-only; unsupported browsers get a clear toast. Folder persistence + rescan remain Milestone 2.

**Next up:**
1. Add CI workflow (trigger: `push` + `workflow_dispatch`) that tests first, then creates one uniquely tagged non-draft release on success.
2. Design the persistent AI index schema before writing indexing code.
3. Plan the self-hosting architecture early (backend + frontend in one Docker image, volume-mounted library, original-file download endpoint) so the Milestone 1 scaffold doesn't box it in.

**Blockers / notes:**
- None. CI/release automation is next; the scaffold build is green.
- License not yet chosen (`TBD` in README).
