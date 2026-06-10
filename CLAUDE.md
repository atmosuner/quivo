# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # local dev server (Vite)
npm run build        # TypeScript check + production build + PWA assets
npm run preview      # serve dist/
npm test             # run all tests once (Vitest)
npm run test:watch   # Vitest in watch mode
npm run icons        # regenerate PNG icons from SVG source (PowerShell script)
```

Run a single test file:
```bash
npx vitest run tests/engines/approvals.test.ts
```

## Architecture

Quivo is a mobile-first PWA (React 19 + TypeScript + Vite 6) with no backend. All data persists in `localStorage` through a `DataRepository` abstraction.

### Layers

```
src/
  types/          Domain entities (domain.ts), gamification types (gamification.ts),
                  navigation types, storage envelope
  data/           Bundled: seed family, achievement definitions, category list
  engines/        Pure domain logic — no I/O, no side effects
  services/       Async orchestration: repo.load → engine → persistFamily
  lib/storage/    DataRepository interface + localStorage adapter + migrations + seed
  stores/         Zustand stores (see below)
  screens/        Child tabs + detail stack + parent flows
  components/     Design-system UI: atoms → molecules → organisms
  styles/         CSS custom properties (tokens.css), shared layout classes
```

### Stores

| Store | Responsibility |
|-------|---------------|
| `appStore` | Navigation state: `mode` (child/parent), `activeTab`, `childStack` array, `parentScreen` |
| `familyStore` | Owns the `AppSnapshot`, all action methods, loading/error state, `DataRepository` ref |
| `sessionStore` | Ephemeral `GrantEffect` queue → drives `Celebration` overlay |
| `parentGateStore` | PIN session validity (in-memory only, no persistence) |
| `bootstrap.ts` | Kicks off daily reset + `familyStore.bootstrap()` on app load |

### Data flow

1. A screen calls an action on `familyStore` (e.g. `submitTaskCompletion`).
2. The action calls the matching service function, passing `get().repo`.
3. The service calls `repo.load()`, passes family data to the engine, calls `persistFamily` (which calls `repo.save()`).
4. Service returns `{ snapshot, effects }`. Store sets `snapshot` and calls `sessionStore.enqueueEffects(effects)`.
5. `sessionStore` drives the `Celebration` overlay sequentially.

### Navigation

There is no React Router. Navigation state lives entirely in `appStore`:
- **Child mode**: `activeTab` selects the visible tab screen; `childStack` is a push-down array of `ChildStackEntry` objects rendered as a full-screen overlay by `ChildShell`.
- **Parent mode**: `parentScreen` selects which parent screen renders inside `ParentShell`.
- Switching to parent mode requires a valid PIN session in `parentGateStore`.

### Engines

Engines are pure functions: `(family, input) → { family, effects }`. They never call I/O or access stores. The `GrantEffect[]` they return is ephemeral — never persisted. Key engines: `tasks.ts`, `approvals.ts`, `reading.ts`, `gamification.ts`, `achievements.ts`, `streak.ts`.

### CSS conventions

Design tokens are CSS custom properties in `src/styles/tokens.css` (colors, radius, spacing). Layout classes use `q-` prefix (`q-app`, `q-main`, `q-body`, `q-scroll`). Typography uses `t-` prefix. Category-specific colors use `--cat-<name>` tokens.

### Testing

Tests live in `tests/` mirroring the `src/` structure. Engines and services have unit tests; `tests/stores/` tests store actions via a `MemoryRepository` (in `tests/services/memoryRepository.ts`). `tests/qa/releaseFlows.test.ts` is the end-to-end smoke suite.

### Deployment

Deployed to GitHub Pages at `https://atmosuner.github.io/quivo/`. The Vite `base` is `/quivo/` — all asset paths and the PWA `start_url`/`scope` use this prefix.

### Parent PIN

The parent PIN is stored as a salted SHA-256 hash in `localStorage` (key `quivo.app.snapshot.v1`). On first launch the seed has no PIN (`parentPinHash: null`), so the parent area shows PIN setup. There is no recovery path — reset via Settings → Reset local data or delete the localStorage key in DevTools.
