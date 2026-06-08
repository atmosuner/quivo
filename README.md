# Quivo

Mobile-first PWA that helps kids build positive habits through quests, reading, rewards, and achievements — with a parent approval layer.

**MVP status:** v0.1.0-rc — local-only release candidate. No backend, auth, or cloud sync.

See [RELEASE_NOTES.md](./RELEASE_NOTES.md) for demo script and scope.

## Tech stack

| Layer | Choice |
|-------|--------|
| UI | React 19, TypeScript, Vite 6 |
| State | Zustand |
| Persistence | `localStorage` via `DataRepository` |
| PWA | `vite-plugin-pwa` + Workbox |
| Tests | Vitest |

Visual source of truth: `/design` (prototype — not modified by app code).

## Commands

```bash
npm install
npm run dev          # local dev server
npm run build        # production build + PWA assets
npm run preview      # serve dist/
npm test             # unit tests
npm run icons        # regenerate temporary PNG icons
```

## Architecture (summary)

```
src/
  components/     Design-system UI (atoms → organisms)
  screens/        Child tabs, detail stack, parent flows
  stores/         Zustand: app, family, session, parentGate
  services/       Thin orchestration over engines + repository
  engines/        Pure domain logic (tasks, reading, approvals, XP)
  lib/storage/    localStorage adapter, migrations, seed
  data/           Seed family, categories, achievement defs
```

**Data flow:** Screens → `familyStore` actions → services → engines → `DataRepository.save`. Celebrations queue through `sessionStore`.

**Navigation:** Child tabs + `childStack` overlay (no React Router). Parent mode behind PIN gate.

## MVP scope

Included:

- Child experience: Home, Quests, Rewards, Achievements, Profile
- Detail screens: task, reward, achievement, reading, book, add book, settings
- Parent area: PIN setup/login, dashboard, approvals, add task
- Approval flows for tasks, reading logs, reward redemptions (coin escrow)
- Daily reset, achievements, celebrations
- Export JSON backup, reset to seed, corrupt-data recovery
- PWA manifest, service worker, temporary brand icons

Not included (backlog):

- Supabase / backend / multi-device sync
- Push notifications
- Reports and analytics
- Advanced reward scheduling or inventory
- Real cover image uploads
- Production brand assets (icons marked temporary)

## Parent PIN (demo / developer notes)

**First launch (no saved data):** Opening Parent area shows **PIN setup** — choose a 4-digit PIN, then confirm it. The demo seed does not include a parent PIN (`parentPinHash` and `parentPinSalt` are `null` in `src/data/seed.ts`).

**Return visits:** If you already set a PIN in this browser, Parent area shows **PIN entry** instead. The PIN is stored only as a salted SHA-256 hash in `localStorage` (key: `quivo.app.snapshot.v1`). There is **no demo PIN** and no way to recover a forgotten PIN without resetting data.

**Forgot PIN / reset to fresh demo:**

1. Child **Settings → Reset local data** (double confirmation), or
2. DevTools → Application → Local Storage → remove `quivo.app.snapshot.v1` for the site origin, then reload.

Reset restores the seed family and clears the parent PIN, so Parent area will show setup again.

**Demo presenters:** Use a private/incognito window for a guaranteed first-launch setup flow, or reset local data before the demo.

## Data safety

- **Export:** Settings → Export local data (JSON download)
- **Reset:** Settings → Reset local data (double confirmation)
- **Recovery:** Invalid or unsupported `localStorage` is backed up, then seed data is restored with a one-time banner

## QA

See [QA_CHECKLIST.md](./QA_CHECKLIST.md) for the full manual test plan (includes June 2026 RC results).

Automated release smoke tests: `tests/qa/releaseFlows.test.ts`

## Known limitations

- All data lives in this browser only
- Parent PIN is stored as salted hash locally (not true auth)
- Settings rows for notifications/appearance are placeholders
- Offline support caches the app shell; fresh data still requires prior successful load

## Next backlog

1. Final brand icons and splash screens
2. Parent settings: toggle `requireApprovalDefault`, manage rewards
3. Optional import from exported JSON
4. Backend sync (Supabase) when ready
5. Push notifications for approvals
