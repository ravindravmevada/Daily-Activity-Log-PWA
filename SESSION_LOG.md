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

---

## Session 26-06-2026 | 21:30 → 22:30 IST

### Changes Made:
- `CLAUDE.md`: Complete replacement — accurate versions from package.json, actual folder structure, all conventions, full feature list, orphaned file list, pitfall notes

### New Features:
- N/A — documentation-only session

### Audit Findings:
- Exact versions confirmed: React 19.2.7, TypeScript 6.0.2, Vite 8.1.0, Firebase 12.15.0, Zustand 5.0.14, Recharts 3.9.0, Tailwind 4.3.1
- `Dashboard.tsx` and `AddActivityForm.tsx` are orphaned (not imported anywhere) — safe to delete
- `App.css` is orphaned (not imported anywhere) — safe to delete
- `src/assets/*` (hero.png, react.svg, vite.svg) are unused scaffold leftovers
- `ACTIVITY_LOGGED_FROM` / `ACTIVITY_LOGGED_VIA` are the correct export names (not LOGGED_FROM/VIA)
- `npx tsc --noEmit` passes with zero errors

### Current Status:
- Auth ✅ | Daily Log ✅ | Dashboard ✅ | Config 🔲 | Firestore 🔲 | PWA manifest 🔲

### Next Steps:
- Firestore sync (LocalActivity → Firestore on add/edit/delete)
- Config tab (categories, sync settings, export)
- PWA manifest + icons (192×192, 512×512)
- Workbox offline support
- Delete orphaned files: Dashboard.tsx, AddActivityForm.tsx, App.css, src/assets/*

---

## Session 27-06-2026 | 00:00 → 00:30 IST

### Changes Made:
- `src/App.tsx`: Collapsible desktop sidebar + mobile off-canvas drawer

### New Features:
- **Desktop collapsible sidebar**: toggle button (← chevron when expanded / ☰ hamburger when collapsed) in sidebar header; width animates between 220px and 64px via `transition-[width] duration-300 ease-in-out`; state persisted to `dal-sidebar` localStorage key
- **Collapsed desktop sidebar**: icon-only mode — app name, nav labels, user email, and Sign Out text are hidden; icons remain visible and centered; active item shown with background tint (no border-l in collapsed mode)
- **Tooltips on hover (desktop collapsed)**: custom Tailwind group-hover tooltips (`group/tip`) positioned `absolute left-full` next to each nav icon and the Sign Out icon; dark-themed (`bg-gray-900 text-white`), no native `title` delay
- **Desktop header + content area**: margin-left transitions in sync with sidebar via `transition-[margin-left] duration-300 ease-in-out`; toggles between `ml-[220px]`/`md:ml-[220px]` and `ml-16`/`md:ml-16`
- **Mobile off-canvas drawer**: slide-in from left (`-translate-x-full` → `translate-x-0`), 260px wide, full expanded layout (logo, nav labels, user + sign out); `transition-transform duration-300 ease-in-out`; backdrop overlay (`bg-black/50 backdrop-blur-sm`) closes on tap outside
- **Mobile top bar**: new sticky `h-12` header (`md:hidden`) with hamburger (opens drawer), page title, and theme toggle; main content gets `pt-12 md:pt-0` to clear it
- Mobile bottom nav preserved for quick tab switching without opening the drawer
- Added `IcoMenu` (hamburger), `IcoChevronLeft`, `IcoX` (close) SVG icon components

### Current Status:
- Auth ✅ | Daily Log ✅ | Dashboard ✅ | Config 🔲 | Firestore 🔲 | PWA manifest 🔲 | Collapsible sidebar ✅

### Next Steps:
- Firestore sync (LocalActivity → Firestore on add/edit/delete)
- Config tab (categories, sync settings, export)
- PWA manifest + icons (192×192, 512×512)
- Workbox offline support

---

## Session 27-06-2026 | 00:30 → 01:00 IST

### Changes Made:
- `src/components/LogTab.tsx`: Inline category/subcategory editing on activity cards

### New Features:
- **Clickable category title**: clicking the category/subcategory text on any activity card (solo or grouped) activates an inline editor directly within the card — no modal or edit form needed
- **Category dropdown**: replaces the title text; pre-selected to the current category; uses existing `CATEGORIES` data source and `T.select` theme token
- **Auto-commit for single-subcategory categories** (Food Intake, Room Tidying, etc.): selecting a category with only 'No Status' commits immediately with zero extra clicks
- **Dependent subcategory dropdown**: appears only when the selected category has multiple subcategory options (9 categories total); selecting a subcategory commits and closes the editor instantly
- **Pencil hint** (`✎`): appears on hover next to the category text via `group-hover:opacity-70`; invisible otherwise
- **Outside click / Escape**: `InlineCatEdit` mounts a `mousedown` + `touchstart` + `keydown` handler on `document`; clicking outside or pressing Escape closes the editor without saving
- **1s tick safety**: `InlineCatEdit` is defined at module level (not inside `LogTab`) so React identifies it by stable reference and re-renders in-place rather than unmounting/remounting it every second — the native `<select>` dropdown stays open across tick re-renders
- **`inlineCat` in parent state**: the selected-category value lives in `LogTab` state (`inlineCat`/`setInlineCat`), not in the child component — survives parent re-renders without resetting
- Inline editor closes when the ⋮ context menu opens, and when the Edit Activity sheet opens
- All interactions use `stopPropagation` to prevent swipe, long-press, and drag from triggering during editing
- Dark/light theme compatible via `inlineSelCls` (computed from `T.select`)

### Current Status:
- Auth ✅ | Daily Log ✅ | Dashboard ✅ | Config 🔲 | Firestore 🔲 | PWA manifest 🔲 | Collapsible sidebar ✅ | Inline cat edit ✅

### Next Steps:
- Firestore sync (LocalActivity → Firestore on add/edit/delete)
- Config tab (categories, sync settings, export)
- PWA manifest + icons (192×192, 512×512)
- Workbox offline support

---

## Session 27-06-2026 | 01:00 → 01:30 IST

### Changes Made:
- `src/components/LogTab.tsx`: Contextual group actions ("Create Group" / "Add Activity") on activity cards

### New Features:
- **"Create Group" in ⋮ menu (solo activities):** clicking "Create Group" on a non-grouped activity opens an inline `GroupAddPicker` directly inside that card; the user selects a subcategory for the new companion activity and both are saved together — the original becomes #X.1 and the new one becomes #X.2, sharing a fresh `groupId`
- **"Add Activity" in ⋮ menu (grouped activities):** clicking "Add Activity" on any group member opens the same `GroupAddPicker`; the new activity is appended as the next sub-number (#X.3, #X.4, …) by reading `maxSubIndex` across all current group members at the time of click
- **`GroupAddPicker` module-level component:** defined outside `LogTab` (same reason as `InlineCatEdit`) so React re-renders it in-place on the parent's 1s-tick — the native `<select>` dropdown stays open across tick re-renders
- **Category inheritance:** the new activity automatically inherits `category` from the triggering card; the user selects only subcategory — minimal clicks, no form required
- **"Select to Group"** (multi-select manual grouping) is preserved alongside "Create Group" for solo cards
- **`GroupAddState` type** holds: `triggerId`, `mode ('create'|'add')`, `cat`, `groupId`, `activityNumber`, `nextSubIndex` — computed once on open, stable for the lifetime of the picker
- Outside click / Escape closes the picker without saving (same `document.mousedown` + `keydown` pattern as `InlineCatEdit`)
- Opening `GroupAddPicker` closes `InlineCatEdit` and vice versa; opening the edit sheet closes both
- Purple accent label (`↳ #X.Y · Category`) matches existing group card color scheme; adapts to dark/light via `dark` prop

### Current Status:
- Auth ✅ | Daily Log ✅ | Dashboard ✅ | Config 🔲 | Firestore 🔲 | PWA manifest 🔲 | Collapsible sidebar ✅ | Inline cat edit ✅ | Group create/add ✅

### Next Steps:
- Firestore sync (LocalActivity → Firestore on add/edit/delete)
- Config tab (categories, sync settings, export)
- PWA manifest + icons (192×192, 512×512)
- Workbox offline support

---

## Session 27-06-2026 | 01:30 → 02:00 IST

### Changes Made:
- `src/components/LogTab.tsx`: Promoted group actions from overflow menu to primary quick buttons on activity cards

### New Features:
- **"Group" button on solo cards (row 1):** a compact purple pill (`[⧉] Group`, `h-7 px-2.5 rounded-lg`) sits between the detach button and the ⋮ menu at the right edge of the card — always visible, single tap, no menu required; calls `handleCreateGroup(a)` directly
- **"Add" button on group member rows (row 1):** a slightly smaller purple pill (`[+] Add`, `h-6 px-2`) in the same position inside each group member — single tap creates the next activity in the group; calls `handleAddToGroup(a)` directly
- **`IcoGroup` icon:** clean 2-layer stack SVG (`w-3.5 h-3.5`) added for the "Group" button; "Add" button reuses existing `IcoPlus`
- **Removed from ⋮ menu:** "Create Group" and "Add Activity" are no longer in the overflow menu — "Select to Group" (multi-select manual grouping) is preserved there
- Both buttons hidden in select mode (inside the `{!selectMode && (<>...</>)}` fragment guard)
- Dark/light adaptive: purple token classes (`border-purple-500/40 text-purple-400 bg-purple-500/10` dark / `border-purple-300 text-purple-600 bg-purple-50` light) match existing group card accent color

### Current Status:
- Auth ✅ | Daily Log ✅ | Dashboard ✅ | Config 🔲 | Firestore 🔲 | PWA manifest 🔲 | Collapsible sidebar ✅ | Inline cat edit ✅ | Group create/add ✅ (primary quick action)

### Next Steps:
- Firestore sync (LocalActivity → Firestore on add/edit/delete)
- Config tab (categories, sync settings, export)
- PWA manifest + icons (192×192, 512×512)
- Workbox offline support

---

## Session 27-06-2026 | 02:00 → 02:45 IST — Final Audit & CLAUDE.md Rewrite

### Files Audited (full read):
- `src/main.tsx` — StrictMode + createRoot, no changes needed
- `src/index.css` — Tailwind v4 @import + Lexend font + @theme, no changes needed
- `src/firebase/config.ts` — env-var-based Firebase init, exports `db`, `auth`, `app`
- `src/firebase/auth.ts` — `signInWithGoogle`, `signOutUser`, `onAuthChange`
- `src/store/authStore.ts` — Zustand: user/loading/initialized + initialize()
- `src/store/activityStore.ts` — Zustand: days CRUD + groupActivities
- `src/types/activity.ts` — `Activity` + `DailyLog` interfaces (Firestore schema, not yet used by UI)
- `src/types/categories.ts` — CATEGORIES (9 keys), ACTIVITY_DONE_AT, ACTIVITY_LOGGED_FROM, ACTIVITY_LOGGED_VIA, ACTIVITY_TYPES
- `src/utils/helpers.ts` — todayKey, dkey, keyToDate, fmtTS, fmtClock, fmtDur, uid, DOW, MON, pad
- `src/components/ConfigTab.tsx` — placeholder; confirmed hardcoded dark-only styling (no `dark` prop, no T tokens)
- `src/App.tsx` — collapsible sidebar + mobile drawer + bottom nav + auth gate + LogErrorBoundary
- `src/components/LogTab.tsx` — full audit (~1280 lines): all inline features confirmed as built

### TypeScript check:
`npx tsc --noEmit` → **✅ Zero errors**

### CLAUDE.md Rewrite — What Changed:
- Added **Collapsible sidebar** section: SIDEBAR_KEY, sidebarExpanded, mobileOpen, width/margin classes, tooltip pattern, overflow-hidden placement, mobile overlay/drawer
- Added **Module-level sub-components (1s-tick safety)** section — the critical pattern explaining WHY InlineCatEdit and GroupAddPicker must be defined outside LogTab
- Added **Inline category editing** section: state, behavior, auto-commit logic, mutual-exclusion with GroupAddPicker
- Added **Group creation and add-to-group** section: GroupAddState type, "Group" button on solo cards, "Add" button on group member rows, commit logic for both modes
- Added **JSX fragment rule** pitfall
- Added **1s-tick sub-component rule** and **GroupAddState snapshot** to Common pitfalls
- Updated storage keys to include `dal-sidebar`
- Updated folder structure: LogTab now ~1280 lines; App.tsx description updated
- Corrected `pageBg` raw hex — it is in DashboardTab's T object only, not LogTab's
- Noted ConfigTab known limitation (hardcoded dark-only, no T tokens)
- Updated Completed ✅ list: collapsible sidebar, inline cat edit, Create Group, Add Activity quick actions
- Updated Pending 🔲 list: added Config tab full rewrite note
- Updated feature list in Daily Log section: inline category editing, Create Group / Add Activity quick actions documented

### All Features Built (complete summary):

**Auth & Shell:**
- Google Sign-In via Firebase popup ✅
- Auth gate (login screen until signed in) ✅
- LogErrorBoundary with "Try Again" fallback ✅
- Collapsible desktop sidebar (220px ↔ 64px icon-only, `dal-sidebar` persisted) ✅
- Sidebar tooltips when collapsed (named group pattern `group/tip`) ✅
- Mobile off-canvas drawer (260px, backdrop overlay, resize-close) ✅
- Mobile top bar + bottom nav (3 tabs) ✅
- Dark/light theme toggle (`dal-theme` persisted) ✅

**Daily Log (LogTab.tsx):**
- Date navigation: prev/next arrows, calendar popup, Today button ✅
- Instant log: +Main Activity, +Parallel Activity (running immediately) ✅
- Quick Log chips: 6 most-used categories, one-tap ✅
- Full log form bottom-sheet: all fields ✅
- Activity cards: drag handle, number badge, Main/Parallel type chips (tappable), timer/duration ✅
- Running banners with live clock ✅
- Swipe-left: End + Delete revealed (mobile) ✅
- Inline category editing: click category text → select+select, auto-commit for single-subcategory ✅
- Notes 3-state system: undecided → has-notes / none ✅
- Create Group quick action: [⧉ Group] button on solo cards → #X.1 + #X.2 with subcategory picker ✅
- Add Activity quick action: [+ Add] button on group member rows → appends #X.N ✅
- Legacy multi-select grouping: long-press → select → Group (still available via "Select to Group" in ⋮ menu) ✅
- Group cards: collapsed/expanded, total duration (Main only), running amber glow ✅
- Drag-and-drop reorder (desktop) with activityNumber renumbering ✅
- Floating timer popup (desktop only): window.open, BroadcastChannel restore, compact mode ✅
- Stats cards: Logged / Running / Completed / Groups ✅
- Toast notifications (2s/4s) with Undo for delete ✅
- localStorage persistence (`dal-activities-v1`) ✅

**Dashboard (DashboardTab.tsx):**
- 8 sections: Hero, Live Activities, Donut Chart, Timeline Bar Chart, Category Table, 7-Day Heatmap, Records, Recent Feed ✅

**Config (ConfigTab.tsx):**
- Email display + sign-out + coming-soon placeholder ✅ (known: dark-only styling, needs rewrite)

**Infrastructure:**
- GitHub Actions CI/CD → Firebase Hosting (auto-deploy on push to main) ✅
- Firebase Hosting (projectId: daily-activity-log-project) ✅

### Next Steps:
- Firestore sync (LocalActivity → Firestore on add/edit/delete)
- Config tab full rewrite with dark/light theme + categories management + sync settings
- PWA manifest + icons (192×192, 512×512)
- Workbox offline support (service worker + IndexedDB queue)
- Apps Script sync (Sheet ↔ Firestore)
- Clean up orphaned files: Dashboard.tsx, AddActivityForm.tsx, App.css, src/assets/*
