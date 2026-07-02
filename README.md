# Supplier Cangkang Dashboard – Google Apps Script

Dashboard web untuk menampilkan, mengedit, menambah, dan mengekspor data supplier cangkang per **site** (EUP, RSB, dll) dan **tahun** (2024, 2025, 2026). Tampilan mengikuti Sustainability Dashboard dengan tema maroon.

## Fitur

- **Login page** – halaman sign in GGL Dashboard (mirip GHG Calculator)
- **Multi-site** – EUP, RSB, dan bisa tambah site baru
- **Filter tahun** – 2024, 2025, 2026 (kolom berbeda per tahun)
- **Analytics** – Total Suppliers, Stockpiles, Uncertified, New Suppliers
- **CRUD** – Add, Edit, Delete supplier
- **Search & filter** – Cari teks, filter sertifikat & tipe supplier
- **Export** – CSV download & PDF (print dialog)
- **Import** – Seed data 627 baris dari file Excel Anda

## Struktur Data

Data disimpan di Google Spreadsheet dengan 3 sheet:

| Sheet | Isi |
|-------|-----|
| `_Sites` | Daftar site (id, name, description) |
| `_Schema` | Kolom per site+tahun |
| `_Data` | Semua record supplier |
| `_Users` | Akun login (email, password hash, name, role) |

### Akun default

| Email | Password |
|-------|----------|
| `admin@ggl.com` | `Ggl@2026` |

> Tambah user baru lewat function `addUser(token, email, password, name, role)` di Apps Script.

Kolom mengikuti file Excel Anda:
- **EUP 2024**: Company, Address, Supplier Lama/Baru, PKS/Mill, Qty Pengiriman, Sertifikat, dll
- **EUP 2025/2026**: + Sampel Audit, GHG Transport, Person in Charge, No USI
- **RSB 2024–2026**: Jenis Supplier, Status, Transport Residue, Tanggal Verifikasi

## Cara Deploy (Step by Step)

> **Panduan lengkap:** lihat [APPS_SCRIPT.md](./APPS_SCRIPT.md)

### Cara tercepat

1. Buat Google Spreadsheet baru
2. **Extensions → Apps Script** → upload semua file `.gs` dan `.html`
3. Simpan → kembali ke spreadsheet
4. Menu **GGL Dashboard → ① Install lengkap**
5. **Deploy → New deployment → Web app → Anyone → Deploy**

### 1. Buat Google Spreadsheet baru

1. Buka [Google Sheets](https://sheets.google.com) → **Blank spreadsheet**
2. Rename menjadi `Supplier Cangkang Dashboard`

### 2. Buka Apps Script Editor

1. Di spreadsheet: **Extensions → Apps Script**
2. Hapus file `Code.gs` default

### 3. Upload semua file project

Copy-paste isi file dari folder ini ke Apps Script:

| File lokal | Buat di Apps Script |
|------------|---------------------|
| `Code.gs` | Script → Code.gs |
| `Schema.gs` | + → Script → Schema.gs |
| `DataService.gs` | + → Script → DataService.gs |
| `Auth.gs` | + → Script → Auth.gs |
| `SeedData.gs` | + → Script → SeedData.gs |
| `Login.html` | + → HTML → Login |
| `Index.html` | + → HTML → Index |
| `Styles.html` | + → HTML → Styles |
| `App.html` | + → HTML → App |
| `appsscript.json` | ⚙️ Project Settings → lihat manifest (opsional) |

> **SeedData.gs** berisi 627 record dari Excel EUP & RSB Anda.

### 4. Setup spreadsheet

Di Apps Script Editor, pilih function **`setupSpreadsheet`** → klik **Run**.

- Izinkan permission saat diminta
- Ini membuat sheet `_Sites`, `_Schema`, `_Data`

### 5. Import data Excel

Jalankan function **`runSeedImport`** → Run.

Atau dari web app: klik ikon 📥 → **Load Built-in Seed (627 rows)**

### 6. Deploy Web App

1. **Deploy → New deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone** (atau sesuai kebutuhan)
5. Klik **Deploy** → copy URL

Buka URL → halaman **Login** muncul. Setelah sign in, redirect ke dashboard (`?page=app`).

## Opsi: Deploy dengan clasp (CLI)

```bash
npm install -g @google/clasp
clasp login
cd ~/Desktop/supplier-dashboard
clasp create --type sheets --title "Supplier Cangkang Dashboard"
clasp push
```

Lalu buka spreadsheet yang dibuat, jalankan `setupSpreadsheet` dan `runSeedImport`.

## Menambah Site Baru

1. Klik ikon 🏭 di sidebar, atau tombol tab site
2. Isi Site ID (mis. `ISCC`), nama, deskripsi
3. Tambah data via **+ Add Supplier** atau import JSON

Format JSON import:

```json
{
  "sites": [{"id": "EUP", "name": "EUP - Cangkang", "description": "..."}],
  "schemas": {
    "EUP_2026": [{"key": "company_name", "label": "Company Name", "type": "text"}]
  },
  "data": {
    "EUP_2026": [{"company_name": "PT Example", "stockpile": "Kumai"}]
  }
}
```

## File Excel Sumber

Data awal diambil dari:
- `Daftar Supplier Cangkang EUP 2026.xlsx` (sheet 2024, 2025, 2026)
- `Daftar Supplier Cangkang RSB 2026.xlsx` (sheet 2024, 2025, 2026)

| Site | Tahun | Jumlah record |
|------|-------|---------------|
| EUP | 2024 | 95 |
| EUP | 2025 | 159 |
| EUP | 2026 | 162 |
| RSB | 2024 | 49 |
| RSB | 2025 | 81 |
| RSB | 2026 | 81 |

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `SPREADSHEET_ID belum diset` | Jalankan `setupSpreadsheet()` dulu |
| Tabel kosong | Jalankan `runSeedImport()` |
| Permission denied | Re-run dan approve OAuth |
| Kolom tidak muncul | Cek sheet `_Schema` untuk site+tahun |

## Struktur Folder

```
supplier-dashboard/
├── Code.gs          # Entry point web app (doGet + halaman HTML)
├── Api.gs           # REST API (doPost) untuk React / fetch
├── Setup.gs         # Menu spreadsheet & install satu klik
├── Auth.gs          # Login, session, users
├── Schema.gs        # Definisi kolom & opsi dropdown
├── DataService.gs   # CRUD, analytics, export
├── SeedData.gs      # Data 627 baris (embedded)
├── Login.html       # Halaman sign in
├── Index.html       # UI dashboard
├── Styles.html      # CSS
├── App.html         # JavaScript frontend
├── appsscript.json  # Manifest
├── APPS_SCRIPT.md   # Panduan deploy lengkap
├── seed_data.json   # JSON mentah (untuk re-import)
└── README.md
```
