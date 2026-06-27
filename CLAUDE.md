# Daily Activity Logger PWA

## Project Overview
A Progressive Web App (PWA) for logging daily activities, syncing with Google Sheets via Firebase Firestore. Built as a companion to an existing Google Sheets-based activity logging system.

## Owner
Ravindra Mevada

## Repository
https://github.com/ravindravmevada/daily-activity-pwa

## Tech Stack (exact versions from package.json)
- **Frontend:** React 19.2.7 + TypeScript 6.0.2 + Vite 8.1.0
- **Styling:** Tailwind CSS v4.3.1 (CSS-first config via `@theme {}` in `index.css` — NO `tailwind.config.js`)
- **Charts:** Recharts 3.9.0 (PieChart + BarChart in DashboardTab)
- **Database:** Firebase 12.15.0 (Firestore — not yet wired to UI)
- **Auth:** Firebase Auth (Google Sign-In via popup — working end-to-end)
- **State:** Zustand 5.0.14
- **Font:** Lexend (Google Fonts, loaded via `index.css` @import)
- **Offline:** Workbox — NOT yet implemented
- **Hosting:** Firebase Hosting (projectId: `daily-activity-log-project`)
- **CI/CD:** GitHub Actions (Firebase Hosting deploy on push to main)

## Project Goals
1. Log daily activities from any device (Android, PC, tablet)
2. View activity history and basic analytics
3. Offline support — log without internet, auto-sync when back online
4. Sync with Google Sheets (via Apps Script trigger on Firestore)
5. Future: AI features via Vertex AI on activity data

## Data Structure (Firestore)
```
users/
  {userId}/
    activities/
      {activityId}/
        date: string             // "26-06-2026" (DD-MM-YYYY)
        activityNumber: number   // sequential number e.g. 43
        subNumber: string        // e.g. "43.1", "43.2" for grouped rows
        category: string         // "Water Intake", "Sleep", etc.
        subcategory: string      // specific sub-activity
        activityType: string     // "Main" | "Parallel"
        isGrouped: boolean       // true if part of a merged group
        groupId: string          // links rows in same merged group
        hasStartTimestamp: boolean
        startTimestamp: timestamp | null
        hasEndTimestamp: boolean
        endTimestamp: timestamp | null
        status: string           // "Yes" | "No"
        hasNotes: boolean
        notes: string
        createdAt: timestamp
        updatedAt: timestamp
        syncedToSheet: boolean   // false until Apps Script confirms sync
```

## Google Sheets Integration
- **Sheet:** Daily Activity Log (Google Sheets)
- **Sync direction:** PWA → Firestore → Apps Script → Sheet (every 5 min via time trigger)
- **Reverse sync:** Sheet edits → Apps Script → Firestore (on edit trigger)
- **Conflict resolution:** Last write wins, with updatedAt timestamp

## Actual Folder Structure (as-built)
```
daily-activity-pwa/
├── public/                    # Static assets (PWA manifest/icons NOT yet added)
├── src/
│   ├── assets/                # react.svg, vite.svg, hero.png (scaffold leftovers — not used)
│   ├── components/
│   │   ├── LogTab.tsx         # PRIMARY: full-featured daily log UI (~1280 lines)
│   │   ├── DashboardTab.tsx   # Analytics dashboard — 8 sections with Recharts
│   │   ├── ConfigTab.tsx      # Placeholder: sign-out + coming-soon list (hardcoded dark only)
│   │   ├── Dashboard.tsx      # ORPHANED — old standalone prototype, not imported anywhere
│   │   └── AddActivityForm.tsx # ORPHANED — old form component, not imported anywhere
│   ├── firebase/
│   │   ├── config.ts          # Firebase init (reads VITE_FIREBASE_* env vars)
│   │   └── auth.ts            # signInWithGoogle, signOutUser, onAuthChange
│   ├── store/
│   │   ├── authStore.ts       # Zustand: Firebase auth state (user, loading, initialize)
│   │   └── activityStore.ts   # Zustand: LocalActivity CRUD + grouping
│   ├── types/
│   │   ├── activity.ts        # Activity + DailyLog interfaces (Firestore schema — not yet used by UI)
│   │   └── categories.ts      # CATEGORIES, ACTIVITY_DONE_AT, ACTIVITY_LOGGED_FROM/VIA, ACTIVITY_TYPES
│   ├── utils/
│   │   └── helpers.ts         # todayKey, dkey, keyToDate, fmtTS, fmtClock, fmtDur, uid, DOW, MON, pad
│   ├── App.tsx                # Root: auth gate, LogErrorBoundary, collapsible sidebar, mobile drawer + bottom nav
│   ├── main.tsx               # createRoot entry point (StrictMode)
│   ├── index.css              # Tailwind v4 @import, Lexend font, @theme { --font-sans }
│   └── App.css                # UNUSED — Vite scaffold leftover (safe to delete)
├── .github/
│   └── workflows/
│       ├── firebase-hosting-merge.yml
│       └── firebase-hosting-pull-request.yml
├── CLAUDE.md                  # This file — AI context
├── README.md
├── SESSION_LOG.md             # Session history
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json          # noUnusedLocals: true, noUnusedParameters: true
└── package.json
```

## Key Conventions

### TypeScript
- `noUnusedLocals: true` and `noUnusedParameters: true` in `tsconfig.app.json`
- Unused destructured params: rename in destructure — `{ prop: _prop }` (keeps the public type, changes only the local binding)
- React 19 + Vite 8: JSX transform is automatic — no `import React` needed in `.tsx` files
- Class components only appear in `LogErrorBoundary` (App.tsx) — import `Component` from 'react' there

### Date format
- Always DD-MM-YYYY — matching Google Sheet tab names
- `dkey(date: Date)` in helpers.ts for formatting, `keyToDate(key: string)` for parsing
- NEVER use YYYY-MM-DD or MM-DD-YYYY anywhere

### Two activity types in codebase
- `LocalActivity` (in `activityStore.ts`) — what the UI uses; timestamps as epoch ms (`startMs`/`endMs`)
- `Activity` (in `types/activity.ts`) — Firestore schema shape; timestamps as `Date | null` — not yet used by UI

### LocalActivity interface
```ts
export interface LocalActivity {
  id: string
  startMs: number           // epoch ms from Date.now()
  endMs: number | null      // null while running, set when ended
  category: string
  subcategory: string
  activityDoneAt: string
  activityType: 'Main' | 'Parallel'
  hasStartTimestamp: boolean
  hasNotes: boolean
  notes: string
  loggedFrom: string
  loggedVia: string
  groupId: string | null
  activityNumber: number
  subIndex: number | null
  notesStatus?: 'undecided' | 'none' | 'has-notes'
}
type DayData = Record<string, LocalActivity[]>
```

### Theme tokens (T object pattern)
Every component that supports dark/light receives `dark: boolean` as a prop and computes a `T` object:
```tsx
const T = dark ? {
  bg: 'bg-[#0D1117]', surface: 'bg-[#151B23]', surfaceHov: 'hover:bg-[#1B2330]',
  card: 'bg-[#151B23]', cardInner: 'bg-[#1B2330]', border: 'border-[#2A3340]',
  text: 'text-[#E6EDF3]', textSub: 'text-[#8B98A9]', textFaint: 'text-[#5C6878]',
  // DashboardTab also has: pageBg: '#0D1117' (raw hex, for badge cut-out boxShadow only)
  // ... many more tokens
} : { bg: 'bg-[#F4F6F9]', ... }
```
- Do NOT use template literals to compose Tailwind classes — `hover:${T.text}` is NOT picked up by the JIT scanner; use explicit conditional class strings instead.
- `pageBg` (raw hex) exists in DashboardTab's T object only — used exclusively in `style={{ boxShadow }}` for the floating badge cut-out ring effect.
- **ConfigTab does NOT use the T pattern** — it has hardcoded dark-only styling (`bg-gray-950`). This is a known limitation; ConfigTab is a placeholder.

### Floating badge stat card pattern
Used in both LogTab and DashboardTab:
```tsx
<div className="pt-5">
  <div className="grid grid-cols-4 gap-2">
    {cards.map(s => (
      <div key={s.label} className={`relative border rounded-2xl px-1.5 pt-9 pb-3 flex flex-col items-center gap-1.5 ${T.shadow} ${s.cardCls}`}>
        <div
          className={`absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white ${s.badgeCls}`}
          style={{ boxShadow: `0 0 0 3px ${dark ? '#0D1117' : '#F4F6F9'}, 0 4px 14px ${s.glow}` }}
        >
          {s.icon}
        </div>
        <div className={`font-mono text-2xl font-bold leading-none tabular-nums ${s.numCls}`}>{s.value}</div>
        <div className={`text-[8.5px] font-bold tracking-[0.8px] uppercase leading-tight text-center ${s.lblCls}`}>{s.label}</div>
      </div>
    ))}
  </div>
</div>
```
The `boxShadow` inline style is intentional — Tailwind can't compose the cut-out ring dynamically.

### Storage keys
- `dal-activities-v1` — localStorage, JSON of `DayData = Record<string, LocalActivity[]>`
- `dal-theme` — localStorage, `'dark'` or `'light'`
- `dal-sidebar` — localStorage, `'expanded'` or `'collapsed'` (desktop sidebar state)

### State architecture
- `useAuthStore` (Zustand) — `user: User | null`, `loading: boolean`, `initialized: boolean`, `initialize()`
- `useActivityStore` (Zustand) — `days: DayData`, plus `addActivity`, `endActivity`, `updateActivity`, `groupActivities`, `deleteActivity`, `setDays`
- Activities persist to localStorage in LogTab via two `useEffect`s: load on mount, save whenever `days` changes

### Collapsible sidebar (App.tsx)
- `SIDEBAR_KEY = 'dal-sidebar'` — localStorage key
- `sidebarExpanded: boolean` — persisted via useEffect
- `mobileOpen: boolean` — controls off-canvas drawer on mobile (never persisted)
- Width classes: `sideWCls = sidebarExpanded ? 'w-[220px]' : 'w-16'`
- Header offset: `headerMlCls = sidebarExpanded ? 'ml-[220px]' : 'ml-16'`
- Content offset: `contentMlCls = sidebarExpanded ? 'md:ml-[220px]' : 'md:ml-16'`
- Sidebar uses `transition-[width] duration-300 ease-in-out`; header/content use `transition-[margin-left] duration-300 ease-in-out`
- Tooltip pattern: sibling `<div>` with `group/tip` named group, `absolute left-full`, `opacity-0 group-hover/tip:opacity-100` — only shown when sidebar collapsed
- `overflow-hidden` is on the `<aside>` (clips button text during transition), NOT on `<nav>` (which would clip tooltips)
- Mobile drawer: `translate-x-0` ↔ `-translate-x-full` + `transition-transform duration-300 ease-in-out`
- Mobile overlay: always rendered, `opacity-0 pointer-events-none` ↔ `opacity-100 pointer-events-auto`
- Resize handler: `setMobileOpen(false)` when `window.innerWidth >= 768`

### Module-level sub-components (CRITICAL pattern for 1s-tick safety)
LogTab has a 1-second `setInterval` that causes the component to re-render every second. Sub-components defined **inside** `LogTab` get a new function reference on every render — React treats this as a new component type, unmounting and remounting the child. For components that contain native `<select>` elements, this closes the browser's dropdown every second, making them unusable.

**Rule:** Any sub-component that renders a `<select>` and needs to stay mounted across parent re-renders MUST be defined at **module level** (outside `LogTab`), not inside it. React identifies module-level components by stable reference and re-renders them in-place instead of unmounting.

Affected components (both defined at module level before `LogTab`):
- `InlineCatEdit` — inline category/subcategory editor; uses `inlineCat`/`setInlineCat` from parent state (not its own state) so values survive re-renders
- `GroupAddPicker` — subcategory picker for Create Group / Add Activity; uses `GroupAddState` from parent state

Sub-components defined **inside** `LogTab` (no `<select>`, so safe to remount):
- `TypeChips` — Main/Parallel toggle buttons
- `InlineNote` — 3-state notes UI (textarea only, value in parent state)
- `FormFields` — full form fields for Log/Edit sheets

### Inline category editing (LogTab.tsx)
State:
- `inlineCatId: string | null` — which activity card is showing the editor
- `inlineCat: string` — currently selected category in the editor (in parent state, not component state)

Behavior:
- Click category text → `openInlineCat(a)`: sets `inlineCatId = a.id`, `inlineCat = a.category`
- Category `<select>` shown; choosing a category with a single subcategory auto-commits immediately
- Choosing a multi-subcategory category shows a second `<select>`; selecting subcategory commits
- Commit: `updateActivity(viewDate, a.id, { category, subcategory })` + toast
- Outside click / Escape: `document.mousedown` + `keydown` handlers inside `InlineCatEdit` call `onClose`
- Pencil hint (`✎`) appears on `group-hover` of the category button
- Rendered in both solo card row 2 AND group member row category area
- Opening `InlineCatEdit` calls `setGroupAddState(null)`; opening `GroupAddPicker` calls `setInlineCatId(null)`

### Group creation and add-to-group (LogTab.tsx)
```ts
type GroupAddState = {
  triggerId: string      // id of the card showing the picker
  mode: 'create' | 'add'
  cat: string            // inherited category
  groupId: string        // new groupId (create) or existing groupId (add)
  activityNumber: number
  nextSubIndex: number   // subIndex to assign the new activity
} | null
```

State: `groupAddState: GroupAddState` in LogTab.

**"Group" button (solo cards, row 1):** purple pill `[⧉ Group]` between detach button and ⋮ menu → `handleCreateGroup(a)`:
- Sets `groupAddState = { mode: 'create', triggerId: a.id, cat: a.category, groupId: uid(), activityNumber: a.activityNumber, nextSubIndex: 2 }`
- `GroupAddPicker` renders inline in the solo card
- On subcategory select: `updateActivity(viewDate, triggerId, { groupId, subIndex: 1 })` + `addActivity(viewDate, newActivity)` — original becomes #X.1, new becomes #X.2

**"Add" button (group member rows, row 1):** purple pill `[+ Add]` between timer and ⋮ → `handleAddToGroup(a)`:
- Reads `maxSubIndex` from all group members at click time
- Sets `groupAddState = { mode: 'add', triggerId: a.id, cat: a.category, groupId: a.groupId!, activityNumber: a.activityNumber, nextSubIndex: maxSub + 1 }`
- On subcategory select: `addActivity(viewDate, newActivity)` with correct groupId and subIndex

Both buttons use: `border-purple-500/40 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20` (dark) / `border-purple-300 text-purple-600 bg-purple-50 hover:bg-purple-100` (light).

**"Select to Group"** remains in the ⋮ menu for manually grouping two existing activities via long-press multi-select.

### Desktop-only features (hidden on mobile)
These features use `hidden md:flex` or `hidden md:block` to hide on touch devices:
- Detach/floating timer buttons in running banners and activity cards
- Popup window (`window.open()`) + BroadcastChannel for detached timers

HTML5 drag-and-drop (for reorder) is desktop-only in practice — the drag handle renders everywhere but touch events don't fire `onDragStart`.

### Swipe gesture safety (CRITICAL — prior mobile crash root cause)
React 18 batches state updates; updaters run AFTER the event handler returns. A ref nulled inside a handler will be null when the updater runs.

```tsx
// WRONG — swipeRef.current may be null when React runs the updater:
setSwipeOffset(p => ({...p, [swipeRef.current!.id]: value}))
swipeRef.current = null

// CORRECT — capture locals BEFORE nulling the ref, BEFORE calling the setter:
const { id, currentX, startX } = swipeRef.current
swipeRef.current = null
setSwipeOffset(p => ({...p, [id]: value}))
```

### BroadcastChannel guard
Not supported on iOS Safari < 15.4. Always guard before instantiation:
```tsx
if (typeof BroadcastChannel !== 'undefined') {
  const ch = new BroadcastChannel(`dal-timer-${a.id}`)
  // ...
}
```

### Categories
`CATEGORIES` in `src/types/categories.ts` is `Record<string, string[]>` — keys are category names, values are subcategory arrays.
- Use `Object.keys(CATEGORIES)` to iterate category names — NOT `CATEGORIES` itself as an iterable
- 9 categories: `'No Status'`, `'Water Intake'`, `'Food Intake'`, `'Toilet Visit'`, `'Sleep'`, `'Wake Up'`, `'Room Tidying'`, `'Device Interaction'`, `'Urinal Visit'`
- `ACTIVITY_LOGGED_FROM` (not `LOGGED_FROM`) and `ACTIVITY_LOGGED_VIA` (not `LOGGED_VIA`) are the correct export names
- Single-subcategory categories (only `'No Status'`): `Food Intake`, `Room Tidying`, `Device Interaction`, `Urinal Visit`, `No Status`

### Timestamps / display
- All display timestamps in IST (UTC+5:30)
- `fmtTS(ms)` — full date+time string for start/end display
- `fmtClock(ms)` — `HH:MM:SS` elapsed for running timers
- `fmtDur(ms)` — human-readable `Xh Ym` / `Xm Ys` / `Xs`

### Recharts inline styles exception
`contentStyle` on Recharts `<Tooltip>` components must be a raw CSS object (no Tailwind) — this is the only accepted inline-style exception besides `boxShadow` for badge cut-out rings.

### JSX fragment rule
When a `{condition && (...)}` block needs to render multiple sibling elements, wrap them in `<>...</>`:
```tsx
{!selectMode && (<>
  <button ...>Group</button>
  <div className="relative flex-shrink-0">
    <button ...><IcoDots/></button>
  </div>
</>)}
```
A `{condition && (...)}` with multiple siblings (no fragment) is a JSX parse error.

## Complete Feature List (as built)

### Auth & App Shell (App.tsx)
- Firebase Auth Google Sign-In (popup) — working end-to-end
- Auth-gated UI (login screen until signed in)
- `LogErrorBoundary` class component wraps LogTab — shows friendly fallback + "Try Again" on crash
- **Desktop: collapsible left sidebar** — 220px expanded / 64px icon-only collapsed; toggle button (hamburger/chevron) at top; nav labels hidden when collapsed; tooltips on hover for icon-only nav items; persisted to `dal-sidebar` localStorage; smooth `transition-[width] duration-300`
- Desktop: sticky header with page title + dark/light toggle + avatar; slides with sidebar via `transition-[margin-left]`
- **Mobile: slide-in off-canvas drawer** — 260px wide, opens via hamburger in fixed top bar, backdrop overlay, closes on outside tap or resize to ≥768px; preserves full nav + user email + sign-out
- Mobile: fixed top bar (h-12) with hamburger + page title + theme toggle
- Mobile: bottom nav bar with 3 tabs (Dashboard / Daily Log / Config)
- Dark/light theme toggle persisted to `dal-theme` localStorage

### Daily Log (LogTab.tsx)

**Navigation:**
- Date prev/next arrows
- Calendar popup (click date text) — month/year selects, activity dots, today highlighted blue
- "Today" button when viewing another date
- Date text turns yellow (`#f7ef00`) when viewing today

**Activity creation:**
- "+ Main Activity" and "+ Parallel Activity" instant-start buttons (creates running activity immediately)
- "+ Log Activity" full bottom-sheet form with all fields (category, subcategory, location, device, notes, timestamps)
- Quick Log chips — 6 most-used categories, one-tap instant log

**Activity display:**
- Sorted by `activityNumber` descending (drag-reorder renumbers)
- Running banner row for each active activity (amber glow, live clock)
- Activity cards: ⠿ drag handle, number badge, Main/Parallel chips (tap to toggle), live timer / duration
- Swipe-left reveals End + Delete action buttons (touch devices)
- "End Activity" button in card when running
- Start/end timestamps in IST; inline notes section per card

**Inline category editing:**
- Click the category text on any card (solo or group member) → inline `<select>` replaces text
- Dependent subcategory picker appears after category selection (when multiple options)
- Single-subcategory categories auto-commit on category selection (no second step)
- Hover shows `✎` pencil hint; outside click / Escape cancels
- Renders in both solo cards and group member rows
- `InlineCatEdit` is module-level to survive parent's 1s re-renders

**Notes (3-state system):**
- `undecided` (default for instant-log) — shows "Notes? + Add / None" prompt
- `none` — shows "No notes" with "Change" link
- `has-notes` — shows note text with "Edit" link and textarea

**Grouping:**
- **Create Group quick action:** `[⧉ Group]` button on every solo activity card (row 1, before ⋮) — single tap opens `GroupAddPicker` inline; inherits category, user picks subcategory only; original becomes #X.1, new activity becomes #X.2
- **Add Activity quick action:** `[+ Add]` button on every group member row (row 1, before ⋮) — single tap opens `GroupAddPicker` inline; creates #X.3, #X.4, etc.
- Long-press (500ms) → multi-select mode → "Group" button — groups two or more existing activities (legacy flow, still available via "Select to Group" in ⋮ menu)
- Group cards: collapsed/expanded toggle, shows total duration (Parallel activities excluded from total)
- `GroupAddPicker` is module-level (same reason as `InlineCatEdit`)

**Reorder:**
- HTML5 drag-and-drop by ⠿ handle (desktop only)
- Drop reorders and renumbers all `activityNumber` values

**Stats cards (4, floating badge style):**
- Logged Activities (blue), Running Activities (amber), Completed Activities (green), Activity Groups (purple)

**Floating timer (desktop only, `hidden md:flex`):**
- Detach button on running banner + activity card
- `window.open()` creates a real OS popup — draggable, resizable, persists across tab minimize
- Popup reads localStorage directly every 1s; BroadcastChannel for restore/close signals
- Closed-poll interval auto-restores when popup is closed by user

**Toasts:**
- Auto-dismiss after 2s (or 4s with Undo)
- Undo for delete operations

**Persistence:**
- All activities stored in `localStorage` under `dal-activities-v1`
- Firestore sync NOT yet implemented

### Dashboard (DashboardTab.tsx) — 8 sections
1. **Hero Header** — gradient card, greeting by hour, floating badge stat cards (2×2 mobile / 4×1 desktop)
2. **Live Activities** — amber glow banners, only when activities are running
3. **Donut Chart** — Recharts PieChart, today's time by category, center total overlay
4. **Timeline Bar Chart** — 24-hour x-axis, bars colored by dominant category per hour
5. **Category Table** — sortable by Count / Total Time / Avg; progress bar column
6. **7-Day Heatmap** — last 7 days, color intensity by count, today = blue tint
7. **Records** — streak, longest activity, top category, all-time duration
8. **Recent Feed** — last 10 activities across all days

### Config (ConfigTab.tsx) — placeholder
- Shows signed-in email
- Sign out button
- "Coming Soon" list (categories, sync, export, notifications)
- **Known limitation:** uses hardcoded dark-only Tailwind classes (`bg-gray-950`, `bg-gray-900`); does not accept `dark` prop or use T tokens. Will need a full rewrite when Config is properly built.

## Current Status

### Completed ✅
- [x] Repo setup, CLAUDE.md, README
- [x] React 19 + Vite 8 + TypeScript 6 + Tailwind v4 scaffolding
- [x] Firebase project setup (env-var-based config)
- [x] Firebase Auth — Google Sign-In working end-to-end
- [x] Zustand stores — `authStore` + `activityStore`
- [x] Type definitions — `Activity` (Firestore schema) + `LocalActivity` (UI/store)
- [x] Category/subcategory/location/device lists (`categories.ts`)
- [x] Helper utilities — date formatting, duration, uid, clock (`helpers.ts`)
- [x] Full activity logging UI (LogTab) — all features listed above
- [x] Dashboard tab — 8-section analytics with Recharts (DashboardTab)
- [x] Collapsible desktop sidebar + mobile off-canvas drawer (App.tsx)
- [x] Mobile top bar + bottom nav layout
- [x] Dark/light theme toggle (persisted to localStorage)
- [x] localStorage persistence (`dal-activities-v1`)
- [x] LogErrorBoundary in App.tsx (friendly crash fallback for LogTab)
- [x] Mobile swipe crash fix (React 18 batching + ref safety)
- [x] BroadcastChannel availability guard (iOS Safari)
- [x] GitHub Actions CI/CD → Firebase Hosting (auto-deploy on push to main)
- [x] Firebase Hosting deploy (projectId: `daily-activity-log-project`)
- [x] Inline category/subcategory editing on activity cards
- [x] Create Group quick action (solo cards → #X.1 + #X.2 with subcategory picker)
- [x] Add Activity quick action (group member rows → appends #X.N)
- [x] `npx tsc --noEmit` passes with zero errors

### Pending 🔲
- [ ] Firestore read/write (activities currently stored in localStorage only)
- [ ] Sync `LocalActivity` → Firestore on auth and on add/edit/delete
- [ ] Offline support (Workbox service worker + IndexedDB queue)
- [ ] Config tab — manage categories, sync settings, export, notifications (full rewrite with dark/light theme)
- [ ] PWA manifest + app icons (192×192, 512×512)
- [ ] Apps Script sync (Sheet ↔ Firestore)
- [ ] `syncedToSheet` flag handling in UI
- [ ] Clean up orphaned files: `Dashboard.tsx`, `AddActivityForm.tsx`, `App.css`, `src/assets/*`

## Orphaned Files (safe to delete, not imported anywhere)
- `src/components/Dashboard.tsx` — old standalone prototype with duplicated helpers
- `src/components/AddActivityForm.tsx` — old form component superseded by LogTab's inline form
- `src/App.css` — Vite scaffold CSS leftover (`.counter`, `.hero`, `#center`, etc.)
- `src/assets/hero.png`, `src/assets/react.svg`, `src/assets/vite.svg` — scaffold assets

## Apps Script Sync (Google Sheets side)
- Located in: https://github.com/ravindravmevada/Daily-Activity-Log
- Sync trigger: Time-based (every 5 min) + onEdit installable trigger
- Reads new/updated Firestore docs → writes to correct date Sheet tab
- Sheet edits → pushes to Firestore with updatedAt timestamp

## Notes for AI Assistants

### Always
- Use TypeScript — no plain `.js` files in `src/`
- Use Tailwind for styling — no separate CSS files, no inline styles (exceptions: `boxShadow` for badge cut-out ring, Recharts `contentStyle`)
- Firebase config is in `src/firebase/config.ts` — never hardcode credentials
- Route all Firestore operations through `src/firebase/` helpers — never call Firestore directly from components
- Date format is always DD-MM-YYYY — never YYYY-MM-DD or MM-DD-YYYY
- Display timestamps in IST (UTC+5:30)
- Check CLAUDE.md before modifying sync logic (Sheet has complex merge structures)

### Common pitfalls
- `CATEGORIES` is `Record<string, string[]>` — use `Object.keys(CATEGORIES)`, not `Object.entries` or direct iteration
- `noUnusedLocals/Parameters: true` — use `_` prefix for intentionally unused; use `{ prop: _prop }` destructure rename
- Do NOT use Tailwind template literals like `` `hover:${T.text}` `` — JIT scanner won't pick them up
- React state updaters + refs: capture ref values into locals BEFORE calling the setter (see Swipe gesture safety above)
- `BroadcastChannel` unavailable on iOS Safari < 15.4 — always guard with `typeof BroadcastChannel !== 'undefined'`
- Desktop-only features (detach timer, popup window) must be `hidden md:flex` — never reachable from touch-only paths
- **1s-tick sub-component rule:** Never define a sub-component containing `<select>` inside `LogTab` — define it at module level instead. LogTab re-renders every second; inside-defined components get new function references, causing unmount+remount and closing native dropdowns.
- **Fragment rule:** `{condition && (<>...</>)}` when returning multiple siblings — JSX requires a single root; use `<>...</>` fragment, not a bare tuple.
- **`GroupAddState`:** `nextSubIndex` is computed at the moment the picker opens (snapshot of `maxSubIndex`). Always read from `groupAddState.nextSubIndex`, not re-derive from current store state inside the picker (component is module-level and doesn't re-mount on every tick).

## Session Log Instructions
At the start of each Claude Code session, note the time.
At the end, append to SESSION_LOG.md using this format:

```
## Session DD-MM-YYYY | HH:MM → HH:MM IST
### Changes Made:
- `file`: what changed
### New Features:
- feature: description
### Current Status:
- Feature ✅/🔲
### Next Steps:
- what to do next
```
