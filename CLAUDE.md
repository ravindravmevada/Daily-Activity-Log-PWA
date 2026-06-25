# Daily Activity Logger PWA

## Project Overview
A Progressive Web App (PWA) for logging daily activities, syncing with Google Sheets via Firebase Firestore. Built as a companion to an existing Google Sheets-based activity logging system.

## Owner
Ravindra Mevada

## Repository
https://github.com/ravindravmevada/daily-activity-pwa (to be created)

## Tech Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Database:** Firebase Firestore
- **Auth:** Firebase Auth (Google Sign-In)
- **Offline:** Workbox (service worker, IndexedDB queue)
- **Hosting:** GitHub Pages
- **CI/CD:** GitHub Actions (auto-deploy on push to main)

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
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # App icons (192x192, 512x512)
├── src/
│   ├── components/            # Reusable UI components
│   ├── pages/                 # Page-level components
│   ├── hooks/                 # Custom React hooks
│   ├── firebase/              # Firebase config and helpers
│   ├── store/                 # Zustand state management
│   ├── types/                 # TypeScript interfaces and types
│   ├── utils/                 # Helper functions
│   ├── App.tsx
│   └── main.tsx
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Actions auto-deploy
├── CLAUDE.md                  # This file — AI context
├── README.md                  # Human-readable project docs
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Key Conventions
- **Date format:** Always DD-MM-YYYY (matching Google Sheet tab names)
- **Activity numbering:** Sequential integers, sub-numbers as "43.1" strings
- **Grouped activities:** Share same groupId, vertically merged in Sheet
- **Parallel activities:** activityType = "Parallel", excluded from group duration total
- **Status:** "Yes" = completed, "No" = not completed
- **Timestamps:** Stored as Firestore Timestamps, displayed in IST (India Standard Time)

## Current Status
### Completed
- [ ] Nothing yet — starting from scratch

### In Progress
- [ ] Repo setup and CLAUDE.md

### Pending
- [ ] Firebase project setup
- [ ] React + Vite + TypeScript + Tailwind scaffolding
- [ ] Firebase Auth (Google Sign-In)
- [ ] Activity logging form
- [ ] Firestore read/write
- [ ] Offline support (Workbox + IndexedDB)
- [ ] Activity list/history view
- [ ] Analytics/summary view
- [ ] GitHub Actions deploy to GitHub Pages
- [ ] Apps Script sync (Sheet ↔ Firestore)
- [ ] Merge/parallel group UI

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
