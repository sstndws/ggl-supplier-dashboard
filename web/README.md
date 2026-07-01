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

## Apps Script

Folder `../` (Code.gs, Index.html, dll) tetap untuk deploy Google Apps Script.
Frontend TypeScript ini untuk development & preview lokal yang lebih bagus.
