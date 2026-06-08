# Quivo MVP — Manual QA Checklist

Use this checklist before a demo or release candidate. Run on a **mobile viewport** (375×812 or similar) unless noted.

## Release candidate results (June 2026)

Legend: **Pass** · **Fail** · **N/A** · **Needs real device**

| # | Item | Result | Notes |
|---|------|--------|-------|
| **Setup** |
| 1 | `npm run build` succeeds | **Pass** | Verified in Step 14 |
| 2 | `npm test` passes | **Pass** | 11 files, 51 tests |
| 3 | Preview loads without console errors | **Pass** | `npm run preview` HTTP 200; manual console check recommended |
| **Child — Tasks** |
| 4 | Home shows greeting, level ring, quests | **Pass** | Code + seed review |
| 5 | Tap task row → detail | **Pass** | Stack navigation wired |
| 6 | Complete open task | **Pass** | `releaseFlows.test.ts` + stores test |
| 7 | Approval-required task → pending → parent sees | **Pass** | `services.test.ts` + `releaseFlows.test.ts` |
| 8 | Completed task state / no re-complete | **Pass** | Engine `isTaskActionable` guards |
| 9 | Quests category filters | **Pass** | `QuestsScreen` chip filter |
| 10 | Empty state (no tasks) | **Pass** | `EmptyState` on Home + Quests |
| **Child — Reading** |
| 11 | Open Reading tracker | **Pass** | Home + Profile navigation |
| 12 | Stats (streak, pages, books) | **Pass** | Selectors + seed data |
| 13 | Add book | **Pass** | `addBook` store action |
| 14 | Book detail progress bar | **Pass** | `BookScreen` |
| 15 | Approval-required log stays pending | **Pass** | `releaseFlows.test.ts` |
| 16 | Parent approves reading log | **Pass** | `services.test.ts` |
| 17 | Instant log when approval off | **Pass** | `readingService` branch (not seed default) |
| 18 | Finished books section | **Pass** | `ReadingScreen` done filter |
| 19 | Empty states (no books) | **Pass** | `EmptyState` + inline copy |
| **Child — Rewards** |
| 20 | Grid shows cost / affordability | **Pass** | `RewardsScreen` |
| 21 | Tap reward → detail | **Pass** | Stack push |
| 22 | Redeem → coinsPending escrow | **Pass** | `releaseFlows.test.ts` |
| 23 | Insufficient coins disabled | **Pass** | Button `disabled={!can}` |
| 24 | Pending redemption label | **Pass** | Seed has pending reward |
| 25 | Empty rewards state | **Pass** | `EmptyState` wired |
| **Child — Achievements** |
| 26 | Earned + in-progress lists | **Pass** | Seed has both |
| 27 | Tap → detail | **Pass** | Stack push |
| 28 | All-unlocked messaging | **Pass** | `AchievementsScreen` |
| **Child — Settings** |
| 29 | Switch child | **Pass** | Seed has Mia + Leo; segmented control in Settings |
| 30 | Export JSON | **Pass** | `downloadSnapshotJson` |
| 31 | Reset double confirm | **Pass** | `SettingsScreen` |
| 32 | Install hint modal | **Pass** | `InstallHint` component |
| 33 | Parent area → PIN gate | **Pass** | `setMode('parent')` |
| 34 | Change parent PIN | **Pass** | `pinChangeMode` flow in `ParentGate` |
| **Parent** |
| 35 | First visit PIN setup | **Pass** | Gate `setup` → `confirm` |
| 36 | Wrong PIN + cooldown | **Pass** | `parentPin.test.ts` + gate store |
| 37 | Correct PIN → dashboard | **Pass** | Gate unlock |
| 38 | Approve/decline all types | **Pass** | `services.test.ts` |
| 39 | Empty approvals | **Pass** | `ApprovalScreen` `EmptyState` |
| 40 | Add task persists | **Pass** | `services.test.ts` |
| 41 | Session 15 min expiry | **Needs real device** | Timer in `ParentShell`; wait or mock |
| **PWA & offline** |
| 42 | Manifest name/icons/colors | **Pass** | `dist/manifest.webmanifest` verified |
| 43 | Favicon + apple-touch-icon | **Pass** | HTTP 200 on preview |
| 44 | Offline reload after first visit | **Pass** | SW precaches `index.html` + assets; confirm in DevTools offline |
| 45 | Install hint accuracy | **Needs real device** | iOS/Android steps need on-device check |
| **Accessibility & polish** |
| 46 | Icon-only `aria-label` | **Pass** | Back, add book, profile, tab bar |
| 47 | Disabled buttons | **Pass** | `.btn:disabled`, reward/book guards |
| 48 | Reduced-motion celebration | **Pass** | `Celebration` + CSS |
| 49 | Bootstrap error retry/reset | **Pass** | `BootstrapError` |
| 50 | Corrupt storage recovery | **Pass** | `localStorage` backup + banner |
| 51 | Invalid detail dataId | **Pass** | `DetailNotFound` |

### Bugs found & fixed in Step 14

| Issue | Severity | Fix |
|-------|----------|-----|
| Store `error` blocked entire child/parent UI | **Critical** | Non-blocking `ActionErrorBanner` + `clearError` |
| Stack overlay could not scroll tall detail content | **High** | Flex column + `min-height: 0` on `.q-scroll` |
| Celebration/install dialogs overflow narrow viewports | **Medium** | `min()` width + `max-height` on `.celebration-card` |

---

## Checklist (blank template)

### Setup

- [ ] `npm run build` succeeds
- [ ] `npm test` passes
- [ ] `npm run preview` (or deployed build) loads without console errors

### Child — Tasks

- [ ] Home shows greeting, level ring, and today’s quests
- [ ] Tap a task row → task detail opens
- [ ] Complete an open task from Home or detail
- [ ] Task with approval required → status becomes pending; parent sees approval
- [ ] Completed task shows completed state; cannot complete again today
- [ ] Quests tab filters by category
- [ ] Empty state shows when child has no tasks (after parent removes all or fresh child)

### Child — Reading

- [ ] Open Reading tracker from Home or Profile
- [ ] Stats show streak, pages/month, books/year, lifetime count
- [ ] Add book with title, author, total pages
- [ ] Open book detail; progress bar reflects pages read
- [ ] Log pages with stepper; approval-required log stays pending (pages unchanged)
- [ ] Parent approves reading log → pages and rewards apply
- [ ] With approval off (if toggled in seed/settings readout), instant log grants XP/coins
- [ ] Finished book shows in Finished section
- [ ] Empty states: no books, no in-progress books

### Child — Rewards

- [ ] Rewards grid shows cost and affordability
- [ ] Tap reward → detail screen
- [ ] Redeem affordable reward → coins move to escrow (`coinsPending`)
- [ ] Insufficient coins → redeem disabled + friendly error if forced
- [ ] Pending redemption shows “Awaiting parent”
- [ ] Empty state when no rewards configured

### Child — Achievements

- [ ] Earned badges grid and in-progress list
- [ ] Tap badge → achievement detail (locked/unlocked, progress, tier)
- [ ] Empty / all-unlocked messaging renders without crash

### Child — Settings

- [ ] Switch child (when multiple children exist)
- [ ] Export local data downloads JSON file
- [ ] Reset local data: double confirm → demo family restored
- [ ] Install app hint opens instructions modal
- [ ] Parent area entry opens PIN gate
- [ ] Change parent PIN: verify current → set new → returns to child view

### Parent

- [ ] First parent visit prompts PIN setup (4 digits, confirm)
- [ ] Wrong PIN shows error; 5 failures triggers cooldown
- [ ] Correct PIN opens parent dashboard
- [ ] Approvals screen: approve/decline task, reading, reward redemption
- [ ] Empty approvals shows “All caught up”
- [ ] Add task persists and appears for child
- [ ] Session expires after 15 minutes → PIN required again

### PWA & offline

- [ ] Manifest lists name, icons (192 + 512), theme/background colors
- [ ] Favicon and apple-touch-icon load
- [ ] After first load, offline reload shows cached app shell (may need prior visit)
- [ ] Install hint instructions match target device

### Accessibility & polish

- [ ] Icon-only buttons have `aria-label` (back, add book, profile, etc.)
- [ ] Proper button disabled states
- [ ] Focusable controls
- [ ] Celebration respects `prefers-reduced-motion` (no confetti)
- [ ] Bootstrap error screen offers retry and reset
- [ ] Corrupt localStorage auto-recovers with dismissible banner
- [ ] Invalid detail `dataId` shows not-found screen with back action

### Known limitations (expected)

- Local-only data; no sync across devices
- No push notifications
- No reports or advanced reward rules
- Temporary PNG icons (see `public/icons/README.md`)
- `/design` prototype is visual reference only; not shipped
