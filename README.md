# Photo-Viewer

A **super advanced** photo & video viewer built with **React + TypeScript** and **Material Design 3 (M3 Expressive)** — featuring **persistent AI indexing** so your library is analyzed once, saved, and searchable forever.

> 🚧 **Status:** Repository freshly initialized — app scaffolding is the next milestone. See [ROADMAP.md](ROADMAP.md).

## Vision

Your entire photo & video library, understood by AI, indexed once, and searchable instantly — organized automatically the way you'd actually think about it.

## Planned Features

### 🤖 AI Indexing (persistent)
- Automatic AI analysis of photos and videos on import: objects, scenes, faces, text (OCR), dominant colors, and more.
- Indexes are **saved locally** — search them later without re-processing a single file.
- Search across saved AI indexes, filenames, EXIF metadata, dates, and locations.

### 🗂️ Auto-Organization
- Automatic sorting & grouping by **date taken**, **GPS location**, media type, and more.
- Smart **categories** and albums that build themselves.

### 🎬 Videos
- First-class video support: playback, thumbnails, timeline scrubbing.

### 🎨 Material Design 3
- Full M3 Expressive UI: tokens, typography, shape, elevation, motion.
- Runtime appearance controls: light/dark theme, density, seed color, full font customization.

### 🗣️ Languages
- English, playful Hong Kong-style Cantonese, and a compact bilingual mode.
- Per-language funny-level slider (1 = fully serious, 5 = maximum playfulness) — errors stay clear at every level.

### 🔍 Search done right
- Every search bar ships with a full-featured **regex builder** (guided construction, live matches, capture groups, flags) alongside plain-text search as the default.

### 🔔 Non-blocking everything
- Informational messages appear as corner toasts, never modal interruptions.

## Tech Stack (planned)

| Area | Choice |
|---|---|
| Framework | React + TypeScript (Vite) |
| UI | Material Design 3 (M3 Expressive) |
| AI | On-device inference (no cloud uploads of your library) |
| Index storage | Persistent local database (IndexedDB / SQLite-class) |
| Metadata | EXIF / GPS extraction for date & location sorting |

## Privacy

Your library never leaves your machine. AI indexing runs on-device and the saved indexes stay local.

## Roadmap

See [ROADMAP.md](ROADMAP.md) for milestones and [HANDOFF.md](HANDOFF.md) for the current state of work.

## License

TBD
