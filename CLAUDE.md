# Daily Activity Logger PWA

## Project Overview
A Progressive Web App (PWA) for logging daily activities, syncing with Google Sheets via Firebase Firestore. Built as a companion to an existing Google Sheets-based activity logging system.

## Owner
Ravindra Mevada

## Repository
https://github.com/ravindravmevada/daily-activity-pwa

## Tech Stack
- **Frontend:** React 19 + TypeScript 6 + Vite 8
- **Styling:** Tailwind CSS v4
- **Database:** Firebase Firestore (Firebase 12)
- **Auth:** Firebase Auth (Google Sign-In)
- **State:** Zustand 5
- **Offline:** Workbox (service worker, IndexedDB queue) — not yet implemented
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
        date: string             // "24-06-2026" (DD-MM-YYYY)
        activityNumber: number   // sequential number e.g. 43
        subNumber: string        // e.g. "43.1", "43.2" for grouped rows
        category: string         // "Work", "Health", etc.
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

## Folder Structure
```
daily-activity-pwa/
├── public/                    # Static assets (PWA manifest/icons not yet added)
├── src/
│   ├── assets/                # Images and SVGs (react.svg, vite.svg, hero.png)
│   ├── components/
│   │   ├── LogTab.tsx         # Main activity logging UI (full-featured)
│   │   ├── DashboardTab.tsx   # Placeholder — coming soon
│   │   ├── ConfigTab.tsx      # Sign-out + coming-soon settings
│   │   ├── AddActivityForm.tsx
│   │   └── Dashboard.tsx
│   ├── firebase/
│   │   ├── config.ts          # Firebase init (reads VITE_FIREBASE_* env vars)
│   │   └── auth.ts            # signInWithGoogle, signOutUser, onAuthChange
│   ├── store/
│   │   ├── authStore.ts       # Zustand: Firebase auth state
│   │   └── activityStore.ts   # Zustand: LocalActivity CRUD + grouping
│   ├── types/
│   │   ├── activity.ts        # Activity interface (Firestore schema shape)
│   │   └── categories.ts      # CATEGORIES, ACTIVITY_DONE_AT, LOGGED_FROM/VIA lists
│   ├── utils/
│   │   └── helpers.ts         # todayKey, dkey, keyToDate, fmtTS, fmtDur, uid, etc.
│   ├── App.tsx                # Tab shell: Dashboard | Log | Config
│   ├── main.tsx
│   ├── index.css
│   └── App.css
├── .github/
│   └── workflows/
│       ├── firebase-hosting-merge.yml      # Deploy to live channel on push to main
│       └── firebase-hosting-pull-request.yml
├── CLAUDE.md                  # This file — AI context
├── README.md
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Key Conventions
- **Date format:** Always DD-MM-YYYY (matching Google Sheet tab names) — see `dkey()` in `utils/helpers.ts`
- **Activity numbering:** Sequential integers per day; sub-numbers as `subIndex` integers in store, rendered as "43.1" strings
- **Two activity types in codebase:**
  - `LocalActivity` (in `activityStore.ts`) — what the UI uses; timestamps as epoch ms (`startMs`/`endMs`)
  - `Activity` (in `types/activity.ts`) — Firestore schema shape; timestamps as `Date | null`
- **Grouped activities:** Share same `groupId` (uid string); `subIndex` indicates ordering within group
- **Parallel activities:** `activityType = "Parallel"`, excluded from group duration total
- **Status:** "Yes" = completed, "No" = not completed (not yet used in UI; Firestore field only)
- **Timestamps:** `LocalActivity` uses epoch ms; Firestore schema uses Firestore Timestamps, displayed in IST (UTC+5:30)
- **localStorage key:** `dal-activities-v1` — activities persist locally; Firestore sync not yet implemented
- **Theme:** Dark/light toggle persisted to `dal-theme` in localStorage

## Current Status
### Completed
- [x] Repo setup, CLAUDE.md, README
- [x] React 19 + Vite 8 + TypeScript 6 + Tailwind v4 scaffolding
- [x] Firebase project setup (env-var-based config)
- [x] Firebase Auth — Google Sign-In working end-to-end
- [x] Zustand stores — `authStore` (auth state) + `activityStore` (CRUD + grouping)
- [x] Type definitions — `Activity` (Firestore schema) + `LocalActivity` (UI/store)
- [x] Category/subcategory lists — `CATEGORIES`, `ACTIVITY_DONE_AT`, `LOGGED_FROM`, `LOGGED_VIA`
- [x] Helper utilities — date formatting, duration, uid, clock
- [x] Activity logging form (bottom sheet) with all fields
- [x] Activity list with live elapsed timers (1 s tick)
- [x] Running activity banners with live clock
- [x] Stats cards (total, running, completed, groups)
- [x] Quick Log chips (one-tap log by category)
- [x] "Repeat last activity" shortcut
- [x] Inline notes (add/edit per activity)
- [x] Edit activity bottom sheet
- [x] Delete with undo toast
- [x] Long-press → multi-select → group activities
- [x] Swipe-left → End / Delete actions (touch)
- [x] Activity grouping UI (collapsed/expanded group cards)
- [x] Date navigation (prev/next day, jump to today)
- [x] Dark / light theme toggle (persisted to localStorage)
- [x] localStorage persistence (`dal-activities-v1`)
- [x] GitHub Actions CI/CD → Firebase Hosting (auto-deploy on push to main)
- [x] Firebase Hosting deploy (projectId: `daily-activity-log-project`)

### In Progress
- [ ] Nothing actively in progress

### Pending
- [ ] Firestore read/write (activities currently stored in localStorage only)
- [ ] Sync `LocalActivity` → Firestore on auth and on add/edit/delete
- [ ] Offline support (Workbox service worker + IndexedDB queue)
- [ ] Dashboard tab — daily stats, category breakdown, timeline view
- [ ] Config tab — manage categories, sync settings, export, notifications
- [ ] PWA manifest + app icons (192×192, 512×512)
- [ ] Apps Script sync (Sheet ↔ Firestore)
- [ ] `syncedToSheet` flag handling in UI

## Apps Script Sync (Google Sheets side)
- Located in: https://github.com/ravindravmevada/Daily-Activity-Log
- Sync trigger: Time-based (every 5 min) + onEdit installable trigger
- Reads new/updated Firestore docs → writes to correct date Sheet tab
- Sheet edits → pushes to Firestore with updatedAt timestamp

## Notes for AI Assistants
- Always use TypeScript — no plain .js files in src/
- Always use Tailwind for styling — no inline styles or separate CSS files
- Firebase config is in src/firebase/config.ts — never hardcode credentials
- All Firestore operations go through src/firebase/ helpers — never call Firestore directly from components
- Date format is always DD-MM-YYYY — never YYYY-MM-DD or MM-DD-YYYY
- IST timezone (UTC+5:30) for all timestamp displays
- The Sheet has complex merge structures — always check CLAUDE.md before modifying sync logic

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
