## Session 26-06-2026 | 13:00 → 14:30 IST

### Changes Made:
- `CLAUDE.md`: Updated to reflect actual project state
- `src/App.tsx`: Full rewrite — desktop sidebar, responsive layout
- `src/components/LogTab.tsx`: dark/onToggleDark as props, mobile header hidden on desktop
- `src/index.css`: Lexend font added globally

### New Features:
- Desktop sidebar navigation (220px fixed, md+ screens)
- Desktop header with theme toggle and avatar
- Responsive layout (mobile bottom nav / desktop sidebar)
- Lexend font globally applied

### Current Status:
- Auth ✅ | Daily Log ✅ | Dashboard 🔲 | Config 🔲 | Firestore 🔲 | PWA manifest 🔲

### Next Steps:
- Firestore sync
- Dashboard tab
- PWA manifest + icons
- Workbox offline support

---

## Session 26-06-2026 | 14:30 → 15:00 IST

### Changes Made:
- `src/components/LogTab.tsx`: Moved Log Activity button inline above Quick Log, replaced with two instant-start buttons (Main/Parallel), removed fixed bottom bar, adjusted content and toast padding

### New Features:
- Instant activity start — tapping "+ Main Activity" or "+ Parallel Activity" immediately creates a running activity (no form)
- Log Activity button moved inline above Quick Log chips (no longer fixed at screen bottom)

### Current Status:
- Auth ✅ | Daily Log ✅ | Dashboard 🔲 | Config 🔲 | Firestore 🔲 | PWA manifest 🔲

### Next Steps:
- Test instant activity start flow
- Firestore sync
- Dashboard tab
- PWA manifest + icons
- Workbox offline support

---

## Session 26-06-2026 | 15:00 → 16:30 IST

### Changes Made:
- `src/store/activityStore.ts`: Added `notesStatus?: 'undecided' | 'none' | 'has-notes'` to LocalActivity interface
- `src/components/LogTab.tsx`: Multiple features added (see below)

### New Features:
- **Removed "Repeat last" button** from list header
- **Fixed ⋮ menu Edit** — dropdown now rendered as `position:fixed` outside `overflow:hidden` swipe container (was clipped, clicks never reached Edit button)
- **Notes 3-state system** — `undecided` 🟡 (default for instant-log) / `none` 🔴 / `has-notes` (textarea); new activities start as undecided
- **Drag-to-reorder cards** — HTML5 drag API with ⠿ handle; groups drag as unit; activityNumbers renumbered after drop; sort now by activityNumber desc (was startMs)
- **Floating timer widget** — amber FAB shows running count; expands to list with live durations; dock/undock modes; draggable in free mode; toggle in mobile header
- **Calendar date picker** — click date text → month grid popup; month nav arrows; today highlighted blue; dots on days with activities; click day to navigate

### Current Status:
- Auth ✅ | Daily Log ✅ | Dashboard 🔲 | Config 🔲 | Firestore 🔲 | PWA manifest 🔲

### Next Steps:
- Firestore sync
- Dashboard tab
- PWA manifest + icons
- Workbox offline support

---

## Session 26-06-2026 | 16:30 → 16:45 IST

### Changes Made:
- `src/components/LogTab.tsx`: Two UI-only changes to the date bar and calendar popup

### New Features:
- **Month/Year selects in calendar** — replaced static "Month YYYY" label with two inline `<select>` dropdowns (month + year ±5 years); prev/next arrows preserved; uses existing `T.select` theme token for dark/light compatibility
- **"Today" text color** — changed from `text-blue-500` to `#f7ef00` (yellow); date text unchanged

### Current Status:
- Auth ✅ | Daily Log ✅ | Dashboard 🔲 | Config 🔲 | Firestore 🔲 | PWA manifest 🔲

### Next Steps:
- Firestore sync
- Dashboard tab
- PWA manifest + icons
- Workbox offline support

---

## Session 26-06-2026 | 16:45 → 17:00 IST

### Changes Made:
- `src/components/LogTab.tsx`: Improved calendar day cell hover states

### New Features:
- **Calendar day hover** — regular dates now show `hover:bg-gray-100 hover:border-gray-200 hover:text-gray-900` (light) / `hover:bg-[#1B2330] hover:border-[#2A3340] hover:text-[#E6EDF3]` (dark) with a transparent starting border so layout does not shift; smooth `transition-all`
- **Today cell hover** — also upgraded from `opacity-80` to a stronger background + border tint on hover
- Selected date styling unchanged

### Current Status:
- Auth ✅ | Daily Log ✅ | Dashboard 🔲 | Config 🔲 | Firestore 🔲 | PWA manifest 🔲

### Next Steps:
- Firestore sync
- Dashboard tab
- PWA manifest + icons
- Workbox offline support

---

## Session 26-06-2026 | 17:00 → 17:15 IST

### Changes Made:
- `src/components/LogTab.tsx`: Redesigned four summary stat cards (Activities, Running, Completed, Groups)

### Improvements:
- **Number**: added `leading-none tabular-nums` — prevents layout shift, cleaner digit rendering
- **Label**: `text-[9px]` → `text-[10px]`, `mt-0.5` → `mt-2`, tracking `wider` → `[1.5px]`; color now uses the card accent family (blue/amber/green/purple) instead of flat `T.textFaint`
- **Subtitle**: `text-[8px]` → `text-[9px]`, `mt-1`, `opacity-60` → `opacity-70`
- **Padding**: `p-3` → `px-2 py-4` — more vertical breathing room, tighter horizontal (4-col grid is narrow)
- **Background tint**: `/10` → `/15` opacity — more richness without being heavy
- **Border**: `/20` → `/30` opacity — clearer card boundary
- **Running (inactive)**: kept neutral surface/border when count is 0, accent only when active
- Dark/light theme compatibility preserved; no new packages; grid layout unchanged

### Current Status:
- Auth ✅ | Daily Log ✅ | Dashboard 🔲 | Config 🔲 | Firestore 🔲 | PWA manifest 🔲

### Next Steps:
- Firestore sync
- Dashboard tab
- PWA manifest + icons
- Workbox offline support

---

## Session 26-06-2026 | 17:15 → 17:30 IST

### Changes Made:
- `src/components/LogTab.tsx`: Redesigned stat card content hierarchy and labels

### New Features:
- **Labels updated**: Activities → Logged Activities, Running → Running Activities, Completed → Completed Activities, Groups → Activity Groups
- **Content order**: icon (top) → large number (center) → label (bottom); secondary subtitle row removed entirely
- **Icons added**: clipboard-list (Logged), clock (Running), check-circle (Completed), grid-4 (Activity Groups); each inherits the card's accent color via `numCls`
- **Layout**: `text-center` → `flex flex-col items-center gap-1.5`; `px-2 py-4` → `px-1.5 py-3.5` to balance the taller icon+number+label stack
- **Label type**: `text-[10px] tracking-[1.5px]` → `text-[8.5px] tracking-[0.8px]` to fit two-word labels in the narrow 4-column grid without overflow
- All colors, card backgrounds, borders, dark/light tokens, and grid layout unchanged

### Current Status:
- Auth ✅ | Daily Log ✅ | Dashboard 🔲 | Config 🔲 | Firestore 🔲 | PWA manifest 🔲

### Next Steps:
- Firestore sync
- Dashboard tab
- PWA manifest + icons
- Workbox offline support

---

## Session 26-06-2026 | 17:30 → 17:45 IST

### Changes Made:
- `src/components/LogTab.tsx`: Floating badge icon effect on stat cards

### Improvements:
- **Floating badge**: each card now has a `w-10 h-10 rounded-full` icon circle positioned `absolute -top-5 left-1/2 -translate-x-1/2` — sits exactly half above / half inside the card top border
- **Cut-out ring**: `box-shadow: 0 0 0 3px <pageBg>` traces the page background color around the badge, making it appear to float over and cut through the card's top border; `pageBg` is `#0D1117` (dark) or `#F4F6F9` (light)
- **Accent glow**: second shadow layer `0 4px 14px <accentRgba>` adds a coloured drop shadow beneath each badge (blue / amber / green / purple at 45% opacity)
- **Card padding**: changed `py-3.5` → `pt-9 pb-3` to leave clearance below the badge bottom edge before the number
- **Grid wrapper**: wrapped in `<div class="pt-5">` to give the badges headroom in the document flow without overlapping the element above
- **Running inactive state**: badge falls back to neutral grey (`bg-[#1B2330]` / `bg-gray-300`) with no glow when count is 0
- **Content hierarchy preserved**: badge icon → large number → label; all colors, functionality, and responsive grid unchanged

### Current Status:
- Auth ✅ | Daily Log ✅ | Dashboard 🔲 | Config 🔲 | Firestore 🔲 | PWA manifest 🔲

### Next Steps:
- Firestore sync
- Dashboard tab
- PWA manifest + icons
- Workbox offline support

---

## Session 26-06-2026 | 17:45 → 18:30 IST

### Changes Made:
- `src/components/LogTab.tsx`: Detachable floating timer system

### New Features:
- **`IcoDetach` icon** — expand/collapse arrow SVG (↗↙) used as detach/restore toggle
- **`detached` state** — `Record<id, {x,y,width,compact}>` persisted to `dal-detached-timers` localStorage key; initial values are viewport-clamped on load
- **Auto-cleanup `useEffect`** — removes stale detached entries when activities are ended or deleted (watches `days`)
- **`detachTimer(a)`** — initialises floating widget at top-right, stacked 110px apart for multiple simultaneous timers
- **`restoreTimer(id)`** — removes entry from `detached`, collapses widget back into card
- **`startFloatDrag(e, id)` / `startFloatDragTouch(e, id)`** — mouse + touch drag for each widget independently; viewport-clamped on every move
- **`startResizeDrag(e, id)`** — horizontal resize via right-edge drag handle (80–360px); auto-switches to compact mode when width < 100px
- **Detach button in card row 1** — appears only for running activities; shows `IcoDetach` icon; active state (blue tint) when already detached; click toggles detach/restore; timer span shows `floating ↗` text when detached
- **Floating timer widget** — `fixed z-[9000]`, accent-coloured glow shadow, drag handle header (cursor-grab), live timer (`fmtClock`), category label, start time (HH:MM AM/PM), `↩ Restore` button, right-edge resize handle, compact/expand toggle (`⊞`/`⊟`)
- Compact mode: 80px wide, shows only timer + toggle + restore button
- Multiple timers supported simultaneously; each draggable and resizable independently
- All dark/light theme variants wired via existing `T.*` tokens and inline color values

### Current Status:
- Auth ✅ | Daily Log ✅ | Dashboard 🔲 | Config 🔲 | Firestore 🔲 | PWA manifest 🔲

### Next Steps:
- Firestore sync
- Dashboard tab
- PWA manifest + icons
- Workbox offline support

---

## Session 26-06-2026 | 18:30 → 19:15 IST

### Changes Made:
- `src/components/LogTab.tsx`: Rebuilt floating timer as real OS popup window; added float button to running banners

### What Changed:
- **Popup approach (replaces CSS widget):** `window.open()` creates a real browser popup window — draggable to another monitor, stays visible when browser is minimized, independent of the browser tab
- **`buildPopupHtml(actId, isDark)`** (module-level): generates self-contained HTML+JS popup; reads localStorage `dal-activities-v1` directly every 1s; BroadcastChannel signals restore/close; compact toggle via `window.resizeTo()`; dark/light theme baked in at open time
- **State refactor:** removed `detached` (CSS widget state); replaced with `floatingIds: Set<string>` + 3 refs: `winRefs` (popup Window refs), `chanRefs` (BroadcastChannels), `closedCheckers` (500ms closed-poll intervals)
- **`restoreTimer(id)`:** closes popup via BroadcastChannel 'close' message, clears interval, closes channel, removes id from `floatingIds`
- **`detachTimer(a)`:** opens popup, writes HTML, stores refs, sets up BroadcastChannel listener for 'restore', starts closed-poller
- **`useEffect([days])`:** auto-closes popups when activities are ended or deleted
- **Running banners:** added `IcoDetach` float button (↗↙); timer display shows 'floating ↗' text while detached; click toggles open/restore
- **Card row 1:** same float button already present; updated to use `floatingIds.has()` instead of old `detached[id]` check
- Removed all CSS widget render code (floating div with drag/resize handles)

### Behavior:
- Float button available in both the running banner (under date bar) AND the activity card row 1
- Popup auto-closes if activity is ended; shows current elapsed time in title bar
- Popup compact mode: `⊟` button shrinks window to 190×52px showing only the clock
- `↩ Restore` in popup or clicking the button again in the card restores the timer

### Current Status:
- Auth ✅ | Daily Log ✅ | Dashboard 🔲 | Config 🔲 | Firestore 🔲 | PWA manifest 🔲

### Next Steps:
- Firestore sync
- Dashboard tab
- PWA manifest + icons
- Workbox offline support

---

## Session 26-06-2026 | 19:15 → 19:20 IST

### Bug Fix: Build errors fixed

- Deleted `src/src/App.tsx` (stray duplicate) and removed the empty `src/src/` directory
- `src/components/Dashboard.tsx`: removed unused `Activity` type import; renamed `tick` → `_tick`; removed unused `now` in `handleLogSubmit`; fixed `BottomSheet` destructuring (`dark: _dark`, `panelInner: _panelInner`, `selectCls: _selectCls`); fixed `ActivityFormFields` destructuring (`panelInner: _panelInner`)
- `src/components/DashboardTab.tsx`: renamed `userEmail` → `userEmail: _userEmail` in destructuring
- `src/components/LogTab.tsx`: removed unused `IcoCopy` icon; renamed `onSignOut` → `onSignOut: _onSignOut`; removed unused `logSameAsLast` function
- `npx tsc --noEmit` passes with zero errors

---

## Session 26-06-2026 | 19:20 → 20:30 IST

### Changes Made:
- `src/components/DashboardTab.tsx`: Full rewrite — complete maximalist dashboard with 8 sections
- `src/App.tsx`: Added `dark={dark} onToggleDark={toggleDark}` props to DashboardTab

### New Features:
- **S1 Hero Header**: gradient background (dark: navy-to-indigo, light: white-to-blue/purple), greeting by time of day ("Good morning/afternoon/evening, Ravindra"), today's long date, 4 floating badge stat cards (Activities Today, Time Logged Today, Currently Running, Days Logged Total) in the exact badge cut-out ring pattern from LogTab; 2×2 mobile / 4×1 desktop
- **S2 Live Activities**: amber glow banner section, only rendered when `running.length > 0`; live elapsed clock via 1s tick; Main/Parallel chip; matching LogTab running-banner styles
- **S3 Donut Chart**: Recharts PieChart with `innerRadius=65 outerRadius=100`, time distribution by category, custom palette (8 colors via `getCategoryColor`), center overlay showing total duration, legend with duration + % per category, custom styled tooltip
- **S4 Timeline Bar Chart**: 24-hour x-axis (12AM→11PM), duration in minutes y-axis, each bar colored by most-frequent category in that hour, dark/light themed CartesianGrid + axes + tooltip
- **S5 Category Table**: sortable columns (Count / Total Time / Avg) with ↑↓ indicators; color dot per category; progress bar in Total Time column; alternating row stripes
- **S6 7-Day Heatmap**: last 7 days as card grid, color intensity (grey → light/mid/dark green) by activity count, today highlighted with blue tint + "Today" label, activity count badge per day
- **S7 Records**: streak (🔥 days), longest activity (trophy icon + duration + category), top category (tag icon + count), all-time duration (database icon); each in accent-colored pill background
- **S8 Recent Feed**: last 10 activities across all days, date key + category + subcategory + type chip + duration, alternating stripes, "Switch to Log tab" footer
- **Mobile header**: sticky, shows "Dashboard" title + dark/light toggle button (hidden on desktop)
- Installs recharts (already installed from prior session); zero TypeScript errors after implementation

### Current Status:
- Auth ✅ | Daily Log ✅ | Dashboard ✅ | Config 🔲 | Firestore 🔲 | PWA manifest 🔲

### Next Steps:
- Firestore sync (LocalActivity → Firestore on add/edit/delete)
- Config tab (categories, sync settings, export)
- PWA manifest + icons
- Workbox offline support

---

## Session 26-06-2026 | 20:30 → 21:00 IST

### Changes Made:
- `src/components/LogTab.tsx`: Refined detachable timer for cross-platform behavior

### What Changed:
- **Removed floating yellow timer bubble** — entire `FLOATING TIMER WIDGET` block deleted (yellow FAB + expandable panel with Dock/Undock); `timerOpen`, `timerDocked`, `timerFreePos`, `timerDragRef` state/refs removed
- **Removed mobile header clock button** — the amber clock icon with running count badge that toggled the widget is gone
- **Detach buttons hidden on touch/mobile** — both the running banner detach button and activity card detach button now use `hidden md:flex` so they only render on ≥768px (desktop) screens
- **Desktop popup timer unchanged** — `buildPopupHtml`, `detachTimer`, `restoreTimer`, `floatingIds`, popup lifecycle (BroadcastChannel + closed-poll interval) all preserved exactly; still triggered only by explicit button click

### Current Status:
- Auth ✅ | Daily Log ✅ | Dashboard ✅ | Config 🔲 | Firestore 🔲 | PWA manifest 🔲

### Next Steps:
- Firestore sync (LocalActivity → Firestore on add/edit/delete)
- Config tab (categories, sync settings, export)
- PWA manifest + icons
- Workbox offline support

---

## Session 26-06-2026 | 21:00 → 21:30 IST

### Bug Fix: White screen crash on mobile (LogTab swipe)

#### Root Cause
`onSwipeEnd` queued a React state updater that closed over `swipeRef` (a ref object), then **immediately nulled `swipeRef.current`** before the updater ran. React 18 batches state updates and flushes the batch *after* the event handler returns — by that point `swipeRef.current` was `null`, so `swipeRef.current!.id` inside the updater threw `TypeError: Cannot read properties of null (reading 'id')`. With no error boundary, the React tree unmounted and left a white screen.

The same unsafe ref-in-updater pattern existed in `onSwipeMove` (lower-risk but still defensive to fix).

#### Files Changed
- `src/components/LogTab.tsx`
  - **`onSwipeEnd`**: destructure `{ id, currentX, startX }` from `swipeRef.current` into local variables *before* nulling the ref and *before* calling `setSwipeOffset` — the updater now closes over stable local values, not a ref that may be null when the updater runs
  - **`onSwipeMove`**: same defensive pattern — capture `{ id, startX }` before the updater closure
  - **`detachTimer`**: wrap `new BroadcastChannel(...)` in a `typeof BroadcastChannel !== 'undefined'` guard so iOS Safari < 15.4 (which lacks BroadcastChannel) doesn't throw if the code path is ever reached
- `src/App.tsx`
  - Added `LogErrorBoundary` class component (React error boundary) that catches render-cycle errors from `<LogTab>`, logs to console, and shows a "Try Again" fallback UI instead of a blank screen
  - Wrapped `<LogTab>` with `<LogErrorBoundary>` in the main content area

#### Not Changed
- All existing swipe, long-press, drag, detach, and popup timer functionality unchanged
- All Tailwind/theme conventions preserved
- No new packages installed

### Current Status
- Auth ✅ | Daily Log ✅ | Dashboard ✅ | Config 🔲 | Firestore 🔲 | PWA manifest 🔲

### Next Steps
- Firestore sync (LocalActivity → Firestore on add/edit/delete)
- Config tab (categories, sync settings, export)
- PWA manifest + icons
- Workbox offline support
