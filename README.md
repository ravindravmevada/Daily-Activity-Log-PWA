# Daily Activity Logger PWA

A Progressive Web App for logging and viewing daily activities, syncing with Google Sheets via Firebase Firestore.

## Features
- 📝 Log activities from any device
- 📊 View activity history and analytics
- 📶 Works offline — syncs when back online
- 🔄 Two-way sync with Google Sheets
- 🔐 Google Sign-In authentication

## Tech Stack
React + TypeScript + Vite + Tailwind CSS + Firebase + Workbox

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project (see setup below)

### Installation
```bash
git clone https://github.com/ravindravmevada/daily-activity-pwa
cd daily-activity-pwa
npm install
npm run dev
```

### Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore and Authentication (Google provider)
3. Copy your Firebase config to `src/firebase/config.ts`

### Deploy
Push to `main` branch — GitHub Actions auto-deploys to GitHub Pages.

## Related
- Google Sheets system: https://github.com/ravindravmevada/Daily-Activity-Log
