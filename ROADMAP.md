# Roadmap

## Milestone 0 â€” Repository setup âœ…
- [x] GitHub repository created (`DingDingChae/Photo-Viewer`)
- [x] README, roadmap, and handoff docs
- [x] Discussions enabled + rolling progress thread
- [x] GitHub Project created and linked
- [x] CI workflow (push + workflow_dispatch) with test-then-release pipeline

## Milestone 1 â€” App scaffolding
- [x] Vite + React + TypeScript project
- [x] Material Design 3 (M3 Expressive) theming with runtime controls (light/dark, density, seed color, fonts)
- [x] Language system: English / HK Cantonese / bilingual + per-language funny-level slider
- [x] Non-blocking notification system (corner snackbars; notification centre still pending)

## Milestone 2 â€” Library & media
- [ ] **Browse-for-folder picker** to choose the photos/videos folder to index and view (persisted between sessions, one-click rescan)
- [ ] **Local git-backed history** â€” git-init the chosen photos folder and commit snapshots to a local git repo
- [ ] Folder import with incremental scanning
- [x] Photo grid + viewer (zoom, pan, keyboard navigation)
- [ ] Video playback, thumbnails, scrubbing
- [ ] Video splitting â€” max 1 GB per file part
- [ ] EXIF / GPS metadata extraction

## Milestone 3 â€” AI indexing
- [ ] On-device AI analysis (objects, scenes, faces, OCR, colors)
- [ ] Persistent index storage â€” indexes saved locally, searchable across sessions
- [ ] Background indexing queue with progress notifications

## Milestone 4 â€” Search & organization
- [ ] Unified search over AI indexes, filenames, metadata, dates, locations
- [ ] Full-featured regex builder accessible from every search bar (plain-text default)
- [ ] Auto-sort/group by date, location, media type
- [ ] Smart categories & albums

## Milestone 5 â€” Docker & self-hosting
- [ ] Backend server serving the library over HTTP (browse, view, stream photos & videos)
- [ ] **Original-file downloads** â€” fetch the unmodified image/video from any device
- [ ] Responsive web UI verified on phone, tablet, and desktop
- [ ] `Dockerfile` + `docker-compose.yml` â€” one container, volume-mount the photos folder
- [ ] README self-hosting guide (ports, volumes, environment variables)

## Milestone 6 â€” Polish & release
- [ ] Accessibility pass (keyboard, focus, contrast, screen reader)
- [ ] Clipping/sizing pass at 100â€“200% scale and narrow widths
- [ ] Installable release artifact via CI
- [ ] Wiki + GitHub Pages docs site


