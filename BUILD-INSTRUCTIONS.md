# Build Instructions (for Qwen)

Step-by-step guide to scaffold the app, build it, and push to GitHub.
Target: Windows + PowerShell. Run all commands from the repo root:
`C:\Users\cntow\Documents\GitHub\Photo-Viewer`

---

## Step 0 — Verify prerequisites

```powershell
node --version   # must be v18 or newer
npm --version    # must be v9 or newer
git status       # must show a clean working tree on branch `main`
```

If `git status` shows uncommitted changes, STOP and ask the user before continuing.

---

## Step 1 — Scaffold Vite + React + TypeScript

The repo root already contains docs (README.md, ROADMAP.md, HANDOFF.md, .gitignore), so scaffold into a **temp folder** and copy files in — never scaffold directly over the repo.

```powershell
# 1a. Scaffold into a temp folder (non-interactive)
npm create vite@latest "$env:TEMP\photo-viewer-scaffold" -- --template react-ts

# 1b. Copy everything into the repo root, EXCEPT these (keep the repo's versions):
#     - README.md      (repo's README is authoritative)
#     - .gitignore     (repo's .gitignore already covers node_modules/ and dist/)
#     - .git           (never touch)
Get-ChildItem -LiteralPath "$env:TEMP\photo-viewer-scaffold" -Force |
  Where-Object { $_.Name -notin @('README.md', '.gitignore', '.git') } |
  Copy-Item -Destination . -Recurse -Force

# 1c. Clean up the temp folder
Remove-Item -LiteralPath "$env:TEMP\photo-viewer-scaffold" -Recurse -Force
```

**Checkpoint:** `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `src\`, and `public\` now exist in the repo root.

---

## Step 2 — Install dependencies

```powershell
npm install
```

**Checkpoint:** command exits with code 0 and `node_modules\` exists.

---

## Step 3 — Lint

```powershell
npm run lint
```

**Checkpoint:** exits with code 0. If it fails, fix the reported errors in `src\` and re-run until clean. Do not push with lint errors.

---

## Step 4 — Build

```powershell
npm run build
```

**Checkpoint:** exits with code 0 and `dist\` is produced (contains `index.html` and `assets\`). If `tsc` reports type errors, fix them and re-run. Do not push a failing build.

---

## Step 5 — Smoke-test the dev server

```powershell
# Start dev server in the background, then verify it responds
$dev = Start-Process -PassThru -NoNewWindow npm -ArgumentList 'run','dev'
Start-Sleep -Seconds 5
(Invoke-WebRequest -Uri 'http://localhost:5173' -UseBasicParsing).StatusCode   # expect 200
Stop-Process -Id $dev.Id -Force
```

**Checkpoint:** HTTP 200 from `http://localhost:5173`, then the process is stopped. Do not leave the dev server running.

---

## Step 6 — Update HANDOFF.md

Edit `HANDOFF.md`:

- Change the "Current state" date to today's date.
- Under **Done:**, add a line: `Vite + React + TypeScript app scaffolded; lint and production build pass.`
- Under **Next up:**, remove item 1 (scaffold is done) and renumber.

---

## Step 7 — Commit

```powershell
git status                                  # review what changed
git add -A
git status                                  # confirm only intended files are staged
git commit -m "Scaffold Vite + React + TypeScript app"
```

**Rules:**
- NEVER commit `node_modules\` or `dist\` (already covered by `.gitignore` — verify with `git status`).
- NEVER commit secrets or `.env` files.
- Do NOT amend existing commits; always create a new commit.

---

## Step 8 — Push to GitHub

```powershell
git push origin main
```

**Checkpoint:** exits with code 0. Verify:

```powershell
git log origin/main --oneline -1   # shows the new scaffold commit
```

If push is rejected (non-fast-forward), run `git pull --rebase origin main`, re-run Steps 3–4, then push again. If auth fails, STOP and ask the user (GitHub CLI `gh auth login` or a credential prompt may be required).

---

## Done criteria (all must be true)

- [ ] `npm run lint` passes
- [ ] `npm run build` passes and `dist\` exists
- [ ] Dev server returns HTTP 200 on port 5173
- [ ] `HANDOFF.md` updated
- [ ] New commit exists on `origin/main`
- [ ] Repo docs (README.md, ROADMAP.md, HANDOFF.md, .gitignore) were not overwritten

## Out of scope for this task (do NOT do these yet)

- CI workflow / release automation (ROADMAP Milestone 0, separate task)
- M3 theming, language system, notifications (Milestone 1 follow-ups)
- Any `git reset`, `git rebase -i`, force-push, or branch creation
