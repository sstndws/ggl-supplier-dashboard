# GGL Dashboard — TypeScript (React + Vite)

Frontend modern dengan **React 19 + TypeScript + Tailwind CSS v4**.

## Quick Start

Butuh **2 terminal**:

### Terminal 1 — API backend (data dari Excel)
```bash
cd ~/Desktop/supplier-dashboard/local
python3 server.py
```

### Terminal 2 — Frontend TypeScript
```bash
cd ~/Desktop/supplier-dashboard/web
npm install   # pertama kali saja
npm run dev
```

Buka: **http://localhost:5173**

Login: `admin@ggl.com` / `Ggl@2026`

## Stack

| Layer | Tech |
|-------|------|
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Table | TanStack React Table |
| Icons | Lucide React |
| Build | Vite 6 |
| API | Python server.py (port 8080) |

## Struktur

```
web/
├── src/
│   ├── pages/          LoginPage, DashboardPage
│   ├── components/     UI + dashboard components
│   ├── lib/            api, auth, utils
│   └── types.ts        Type definitions
├── package.json
└── vite.config.ts      proxy /api → localhost:8080
```

## Production (Vercel + Apps Script)

Buat `web/.env`:

```env
VITE_GAS_URL=https://script.google.com/macros/s/AKfycbz9neQrC4sG-F-yuTmdho0gyrJRtBbIjq5IPLgByrDSynZsRogtXAFVOeCpFH6T7rdgsg/exec
VITE_GAS_EMAIL=admin@ggl.com
VITE_GAS_PASSWORD=Ggl@2026
```

Di **Vercel → Project Settings → Environment Variables**, set ketiga variable di atas lalu **Redeploy**.

Tidak ada halaman login — session dibuat otomatis di background.

## Apps Script

Folder `../` (`GGL_Dashboard.gs`) untuk backend Google Sheets.
