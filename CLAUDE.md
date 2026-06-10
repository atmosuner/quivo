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

Quivo is a mobile-first PWA (React 19 + TypeScript + Vite 6). Data persists in Firestore via a `DataRepository` abstraction (`FirestoreRepository`). Parents authenticate with Google; children have no Firebase auth and are gated by an in-app PIN only.

### Layers

```
src/
  types/          Domain entities (domain.ts), gamification types (gamification.ts),
                  navigation types, storage envelope
  data/           Bundled: seed family, achievement definitions, category list
  engines/        Pure domain logic — no I/O, no side effects
  services/       Async orchestration: repo.load → engine → persistFamily
  lib/firebase/   Firebase app init, Google Auth (googleAuth.ts), Firestore user profiles
  lib/storage/    DataRepository interface + FirestoreRepository + localStorage + migrations
  lib/security/   parentPin.ts — salted SHA-256 PIN hashing (shared by parent + child PINs)
  stores/         Zustand stores (see below)
  screens/        Child tabs + detail stack + parent flows
  components/     Design-system UI: atoms → molecules → organisms
  styles/         CSS custom properties (tokens.css), shared layout classes
```

### Stores

| Store | Responsibility |
|-------|---------------|
| `appStore` | Navigation state: `mode` (child/parent/onboarding), `activeTab`, `childStack`, `parentScreen`, `childUnlocked` |
| `familyStore` | Owns the `AppSnapshot`, all action methods, loading/error state, `DataRepository` ref |
| `sessionStore` | Ephemeral `GrantEffect` queue → drives `Celebration` overlay |
| `parentGateStore` | Parent PIN session validity (in-memory only, no persistence) |
| `bootstrap.ts` | Resolves Firebase auth, loads parent profile from Firestore, calls `familyStore.bootstrap()` |

### Data flow

1. A screen calls an action on `familyStore` (e.g. `submitTaskCompletion`).
2. The action calls the matching service function, passing `get().repo`.
3. The service calls `repo.load()`, passes family data to the engine, calls `persistFamily` (which calls `repo.save()`).
4. Service returns `{ snapshot, effects }`. Store sets `snapshot` and calls `sessionStore.enqueueEffects(effects)`.
5. `sessionStore` drives the `Celebration` overlay sequentially.

### Navigation

There is no React Router. Navigation state lives entirely in `appStore`:
- **Child mode**: `activeTab` selects the visible tab screen; `childStack` is a push-down array of `ChildStackEntry` objects rendered as a full-screen overlay by `ChildShell`. `childUnlocked` must be `true`; when `false`, `ChildShell` shows `ChildSelector` (avatar list + PIN numpad) instead. `resetNavigation()` always sets `childUnlocked: false`.
- **Parent mode**: `parentScreen` selects which parent screen renders inside `ParentShell`.
- Switching to parent mode requires a valid PIN session in `parentGateStore`.
- `ChildSelector` has a "Parent area" button that calls `setMode('parent')` directly (bypassing parent PIN gate, which is then shown by `ParentGate`).

### Engines

Engines are pure functions: `(family, input) → { family, effects }`. They never call I/O or access stores. The `GrantEffect[]` they return is ephemeral — never persisted. Key engines: `tasks.ts`, `approvals.ts`, `reading.ts`, `gamification.ts`, `achievements.ts`, `streak.ts`.

### CSS conventions

Design tokens are CSS custom properties in `src/styles/tokens.css` (colors, radius, spacing). Layout classes use `q-` prefix (`q-app`, `q-main`, `q-body`, `q-scroll`). Typography uses `t-` prefix. Category-specific colors use `--cat-<name>` tokens.

### Testing

Tests live in `tests/` mirroring the `src/` structure. Engines and services have unit tests; `tests/stores/` tests store actions via a `MemoryRepository` (in `tests/services/memoryRepository.ts`). `tests/qa/releaseFlows.test.ts` is the end-to-end smoke suite.

### Authentication

- **Parents**: Google Sign-In via `signInWithPopup` (always popup-first on all platforms, redirect only if `auth/popup-blocked`). iOS standalone PWAs have isolated storage from Safari/Chrome — `signInWithRedirect` would lose the auth token, so popup is mandatory. Firebase Auth is initialised with explicit `browserLocalPersistence` (via `initializeAuth`) to avoid Safari IndexedDB failures on browser restart.
- **Children**: No Firebase auth. Gated solely by an in-app 4-digit PIN set by the parent. PIN stored as a salted SHA-256 hash (`pinHash` / `pinSalt`) on the `Child` domain object in Firestore. `familyStore.setChildPin(childId, pin | null)` manages this.
- **Firestore data model**: `families/{familyId}/data/snapshot` (full family snapshot) and `users/{uid}` (parent profile: `{ role, familyId, createdAt }`). `familyId` equals the parent's Firebase UID.
- **Security rules**: `firestore.rules` — only the authenticated parent (`request.auth.uid == familyId`) can read/write family data. Deploy with `firebase deploy --only firestore:rules`.

### Deployment

Deployed to GitHub Pages at `https://atmosuner.github.io/quivo/`. The Vite `base` is `/quivo/` — all asset paths and the PWA `start_url`/`scope` use this prefix.

Firebase config lives in `firebase.json` (Firestore rules only). Deploy rules separately from the frontend: `firebase deploy --only firestore:rules`.

### PIN System

Both parent-area and child PINs use salted SHA-256 hashing via `src/lib/security/parentPin.ts` (`generateParentPinSalt` / `hashParentPin`).

- **Parent area PIN**: `family.parentPinHash` / `family.parentPinSalt` (optional fields on `Family`). Gates the parent area in `ParentGate`. No PIN on first use → `ParentGate` shows "Create parent PIN" form inline before allowing access. Set/changed from `ParentDashboard` → Security → Parent PIN. No recovery path.
- **Child PINs**: `pinHash` / `pinSalt` on the `Child` type. Set/changed/removed from `ParentDashboard` via the "Set PIN" / "Change PIN" button on each child card. Entering the correct PIN in `ChildSelector` sets `childUnlocked: true`.
