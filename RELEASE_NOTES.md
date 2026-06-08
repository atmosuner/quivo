# Quivo MVP — Release Notes (v0.1.0-rc)

**Release candidate:** local-first PWA demo  
**Date:** June 2026  
**Status:** Ready for guided demo on mobile viewport or installed PWA

## What works

### Child experience
- Home dashboard with level progress, today’s quests, reading shortcut
- Quests tab with category filters and task detail + completion
- Rewards store with redemption and coin escrow (`coinsPending`)
- Achievements grid and progress detail screens
- Profile, reading tracker, add/log books, settings

### Parent experience
- 4-digit PIN setup and login (salted hash, 5-attempt cooldown)
- Dashboard and approval queue (tasks, reading logs, reward redemptions)
- Add task for children
- 15-minute parent session (re-PIN after expiry)
- Change parent PIN from child settings

### Data & safety
- All data in `localStorage` (demo seed on first launch)
- Export JSON backup from Settings
- Reset to demo family (double confirmation)
- Auto-recovery from corrupt/unsupported storage with banner

### PWA
- Web manifest with PNG icons (192 + 512 + maskable)
- Service worker precaches app shell (13 assets)
- Install instructions modal (iOS / Android)
- Theme color `#6655d6`, portrait standalone display

## Intentionally not included

- Cloud sync / Supabase / multi-device
- Push notifications
- Reports and analytics
- Advanced reward rules or inventory
- JSON import
- Production brand icons (temporary placeholders)
- Parent toggles for approval settings (read-only in child settings)

## Known limitations

- Data is per-browser only; clearing site data resets progress
- Parent PIN is local obfuscation, not enterprise auth
- Offline mode serves cached shell; requires at least one online visit
- Some settings rows (notifications, appearance) are placeholders
- Session expiry and install flow need verification on physical devices

## How to run locally

```bash
npm install
npm run build
npm run preview   # http://localhost:4173
```

For development with hot reload:

```bash
npm run dev
```

Run automated checks:

```bash
npm test          # 51 tests including release flow smoke tests
```

## Recommended demo script (~8 minutes)

1. **Child home** — Show Mia’s greeting, XP ring, today’s quests. Complete one open task (or show pending if approval required).
2. **Reading** — Open Reading from Home → show stats → open a book → log pages (note pending approval if enabled).
3. **Rewards** — Open Rewards → tap a reward → redeem if affordable → show coins in escrow.
4. **Parent PIN** — Settings → Parent area → enter PIN (first time: set 4 digits).
5. **Approvals** — Approve a task, reading log, or reward redemption; return to child and show updated state.
6. **Add task** — Parent dashboard → Add task → verify it appears on child Quests tab.
7. **Settings** — Export JSON (backup) → mention reset restores demo.
8. **PWA** — Show install hint; optional: Add to Home Screen on phone.

**Demo tip:** Seed starts with pending approvals and `requireApprovalDefault: true`, so the approval queue is populated immediately.

## QA summary

Full checklist with pass/fail markers: [QA_CHECKLIST.md](./QA_CHECKLIST.md#release-candidate-results-june-2026)

Automated coverage: `npm test` (engines, services, stores, release flows).
