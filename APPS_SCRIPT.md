# Deploy Apps Script – Panduan Lengkap

Dashboard supplier cangkang GGL berjalan di **Google Apps Script + Google Spreadsheet**. Data supplier disimpan di sheet, bukan hardcoded di UI.

## Isi project Apps Script

| File | Fungsi |
|------|--------|
| `Schema.gs` | Definisi kolom master (MASTER_FIELDS) |
| `Auth.gs` | Login, session token, user `_Users` |
| `DataService.gs` | CRUD, analytics, export, import |
| `SeedData.gs` | **627 baris** data EUP & RSB (embedded JSON) |
| `Api.gs` | REST API (`/api/login`, `/api/dashboard`, dll.) |
| `Setup.gs` | Menu spreadsheet + `installDashboard()` |
| `Code.gs` | Entry point Web App (`doGet`, `doPost`) |
| `Login.html` | Halaman login |
| `Index.html` | Dashboard UI |
| `App.html` | JavaScript dashboard |
| `Styles.html` | CSS dashboard |
| `appsscript.json` | Manifest (timezone, OAuth, webapp) |

## Cara deploy (manual)

### 1. Buat Spreadsheet

1. Buka [Google Sheets](https://sheets.google.com) → spreadsheet baru
2. Rename: **Supplier Cangkang Dashboard**

### 2. Buka Apps Script

**Extensions → Apps Script**

### 3. Upload semua file

Hapus `Code.gs` default, lalu buat file sesuai tabel di atas (copy-paste dari folder project).

> **Penting:** `SeedData.gs` besar (~450 KB) — wajib di-copy utuh.

### 4. Install satu klik

1. Simpan semua file (Ctrl+S)
2. Refresh spreadsheet → menu **GGL Dashboard** muncul di toolbar
3. Klik **① Install lengkap (setup + import 627 baris)**
4. Approve permission OAuth saat diminta

Ini akan:
- Membuat sheet `_Sites`, `_Schema`, `_Data`, `_Users`
- Membuat user admin
- Import 627 supplier EUP & RSB

### 5. Deploy Web App

1. **Deploy → New deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. **Deploy** → salin URL

Buka URL → halaman login muncul.

### Login default

| Email | Password |
|-------|----------|
| `admin@ggl.com` | `Ggl@2026` |

---

## Cara deploy dengan clasp (CLI)

```bash
npm install -g @google/clasp
clasp login
cd ~/Desktop/supplier-dashboard
clasp create --type sheets --title "Supplier Cangkang Dashboard"
clasp push
```

Buka spreadsheet → **GGL Dashboard → Install lengkap** → Deploy Web App.

---

## Sambungkan React (Vercel) ke Apps Script

React UI (`web/`) bisa pakai backend Apps Script:

1. Deploy Web App (langkah 5 di atas)
2. Buat file `web/.env`:

```env
VITE_GAS_URL=https://script.google.com/macros/s/AKfycbySQt20CiIRiSMYI4IpYWiJmtdI52B44_5gFyc_86gPoSnnu3Y5d2_rx4-3PjFJq4Vsxg/exec
```

3. Build & deploy:

```bash
cd web
npm run build
```

Semua request (`/api/login`, `/api/dashboard`, dll.) otomatis diarahkan ke Apps Script.

---

## Struktur data di Spreadsheet

| Sheet | Isi |
|-------|-----|
| `_Sites` | Daftar site (EUP, RSB, …) |
| `_Schema` | Kolom per site + tahun |
| `_Data` | Semua record supplier |
| `_Users` | Akun login (password di-hash) |

Edit langsung di sheet juga bisa, tapi disarankan lewat dashboard agar filter & validasi konsisten.

---

## API endpoints (Apps Script)

| Method | Route | Keterangan |
|--------|-------|------------|
| POST | `/api/login` | `{ email, password }` |
| GET | `/api/initial?token=...` | Sites & tahun default |
| POST | `/api/dashboard` | `{ token, site, year, filters }` |
| POST | `/api/save` | `{ token, record }` |
| POST | `/api/delete` | `{ token, id }` |
| POST | `/api/add-site` | `{ token, id, name }` |
| GET | `/api/export-csv?token=...&site=EUP&year=2026` | Download CSV |

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `SPREADSHEET_ID belum diset` | Jalankan **Install lengkap** atau `setupSpreadsheet()` |
| Tabel kosong | Jalankan **Import seed data** atau `runSeedImport()` |
| Menu GGL tidak muncul | Refresh spreadsheet / buka ulang |
| `SESSION_EXPIRED` | Login ulang (session 6 jam) |
| Permission denied | Re-run install & approve OAuth |
| Edit tidak tersimpan | Cek sheet `_Data` — pastikan deploy **Execute as: Me** |

---

## Function penting di editor

| Function | Kapan dipakai |
|----------|---------------|
| `installDashboard()` | Pertama kali setup |
| `setupSpreadsheet()` | Hanya buat sheet + user |
| `runSeedImport()` | Import ulang 627 baris |
| `addUser(token, email, password, name, role)` | Tambah user baru |
| `importSeedFromJson(jsonString)` | Import dari JSON custom |
