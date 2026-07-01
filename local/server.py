#!/usr/bin/env python3
"""Local preview server for GGL Dashboard (mirrors Apps Script UI)."""

import json
import copy
import uuid
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

PORT = 8080
ROOT = Path(__file__).parent
SEED_PATH = ROOT.parent / "seed_data.json"

USERS = {"admin@ggl.com": {"password": "Ggl@2026", "name": "GGL Admin", "role": "admin"}}
STORE = {"sites": [], "schemas": {}, "records": []}


def load_seed():
    with open(SEED_PATH, encoding="utf-8") as f:
        seed = json.load(f)
    STORE["sites"] = copy.deepcopy(seed["sites"])
    STORE["schemas"] = copy.deepcopy(seed["schemas"])
    records = []
    for combo, rows in seed["data"].items():
        parts = combo.rsplit("_", 1)
        year = parts[1]
        site = parts[0]
        for i, row in enumerate(rows):
            rec = dict(row)
            rec["id"] = rec.get("id") or f"{site}_{year}_{i+1}"
            rec["site"] = site
            rec["year"] = year
            records.append(rec)
    STORE["records"] = records
    print(f"Loaded {len(records)} records from seed_data.json")


def get_analytics(site, year):
    recs = [r for r in STORE["records"] if r["site"] == site and str(r["year"]) == str(year)]
    stockpiles = {r.get("stockpile") for r in recs if r.get("stockpile")}
    uncertified = new_suppliers = 0
    for r in recs:
        cert = (r.get("sustainability_certificate") or "").lower()
        if not cert or "none" in cert or cert in ("no data", "-"):
            uncertified += 1
        st = (r.get("supplier_lama_baru") or r.get("supplier_lama_supplier_baru") or r.get("jenis_supplier") or "").lower()
        if "baru" in st:
            new_suppliers += 1
    return {
        "totalSuppliers": len(recs),
        "stockpiles": len(stockpiles),
        "uncertified": uncertified,
        "newSuppliers": new_suppliers,
    }


def filter_records(site, year, filters):
    recs = [r for r in STORE["records"] if r["site"] == site and str(r["year"]) == str(year)]
    q = (filters.get("search") or "").lower()
    if q:
        recs = [r for r in recs if q in " ".join(str(v) for v in r.values()).lower()]
    cf = filters.get("certFilter")
    if cf == "certified":
        recs = [r for r in recs if (r.get("sustainability_certificate") or "").lower() not in ("", "none of the list", "no data", "-") and "none" not in (r.get("sustainability_certificate") or "").lower()]
    elif cf == "uncertified":
        recs = [r for r in recs if not r.get("sustainability_certificate") or "none" in (r.get("sustainability_certificate") or "").lower() or (r.get("sustainability_certificate") or "").lower() in ("no data", "-")]
    sf = filters.get("supplierFilter")
    if sf == "baru":
        recs = [r for r in recs if "baru" in (r.get("supplier_lama_baru") or r.get("supplier_lama_supplier_baru") or r.get("jenis_supplier") or "").lower()]
    elif sf == "lama":
        recs = [r for r in recs if "lama" in (r.get("supplier_lama_baru") or r.get("supplier_lama_supplier_baru") or r.get("jenis_supplier") or "").lower() and "baru" not in (r.get("supplier_lama_baru") or r.get("supplier_lama_supplier_baru") or r.get("jenis_supplier") or "").lower()]
    return recs


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        print(f"[{self.log_date_time_string()}] {args[0]}")

    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def read_json(self):
        length = int(self.headers.get("Content-Length", 0))
        if not length:
            return {}
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        body = self.read_json()

        if path == "/api/login":
            email = (body.get("email") or "").strip().lower()
            pw = body.get("password") or ""
            user = USERS.get(email)
            if not user or user["password"] != pw:
                self.send_json({"error": "Email atau password salah."}, 401)
                return
            token = str(uuid.uuid4())
            self.send_json({"token": token, "user": {"email": email, "name": user["name"], "role": user["role"]}})
            return

        if path == "/api/dashboard":
            site, year = body.get("site"), str(body.get("year"))
            schema = STORE["schemas"].get(f"{site}_{year}", [])
            years = sorted({str(r["year"]) for r in STORE["records"] if r["site"] == site})
            self.send_json({
                "analytics": get_analytics(site, year),
                "records": filter_records(site, year, body.get("filters") or {}),
                "schema": schema,
                "years": years,
            })
            return

        if path == "/api/save":
            rec = body.get("record") or {}
            if not rec.get("site") or not rec.get("year"):
                self.send_json({"error": "Site dan year wajib"}, 400)
                return
            if rec.get("id"):
                for i, r in enumerate(STORE["records"]):
                    if r["id"] == rec["id"]:
                        STORE["records"][i] = {**r, **rec}
                        self.send_json(rec)
                        return
            rec["id"] = str(uuid.uuid4())
            STORE["records"].append(rec)
            self.send_json(rec)
            return

        if path == "/api/delete":
            rid = body.get("id")
            STORE["records"] = [r for r in STORE["records"] if r["id"] != rid]
            self.send_json({"deleted": True})
            return

        if path == "/api/add-site":
            site = body
            sid = (site.get("id") or "").strip().upper()
            if any(s["id"] == sid for s in STORE["sites"]):
                self.send_json({"error": "Site sudah ada"}, 400)
                return
            entry = {"id": sid, "name": site.get("name") or sid, "description": site.get("description") or ""}
            STORE["sites"].append(entry)
            self.send_json(entry)
            return

        self.send_json({"error": "Not found"}, 404)

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path

        if path == "/api/initial":
            site = STORE["sites"][0]["id"] if STORE["sites"] else "EUP"
            years = sorted({str(r["year"]) for r in STORE["records"] if r["site"] == site})
            self.send_json({
                "sites": STORE["sites"],
                "years": years,
                "defaultSite": site,
                "defaultYear": years[-1] if years else "2026",
                "userEmail": "admin@ggl.com",
                "userName": "GGL Admin",
            })
            return

        if path == "/api/export-csv":
            qs = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            site = qs.get("site", ["EUP"])[0]
            year = qs.get("year", ["2026"])[0]
            schema = STORE["schemas"].get(f"{site}_{year}", [])
            recs = filter_records(site, year, {"search": qs.get("search", [""])[0], "certFilter": qs.get("certFilter", [""])[0], "supplierFilter": qs.get("supplierFilter", [""])[0]})
            lines = [",".join(f'"{f["label"]}"' for f in schema)]
            for r in recs:
                lines.append(",".join(f'"{(r.get(f["key"]) or "").replace(chr(34), chr(34)+chr(34))}"' for f in schema))
            csv = "\n".join(lines)
            self.send_response(200)
            self.send_header("Content-Type", "text/csv; charset=utf-8")
            self.send_header("Content-Disposition", f'attachment; filename="supplier_{site}_{year}.csv"')
            self.end_headers()
            self.wfile.write(csv.encode("utf-8"))
            return

        if path in ("/", ""):
            self.path = "/login.html"
        super().do_GET()


if __name__ == "__main__":
    load_seed()
    server = HTTPServer(("127.0.0.1", PORT), Handler)
    print()
    print("=" * 50)
    print("  GGL Dashboard – Local Preview")
    print("=" * 50)
    print(f"  Login:     http://localhost:{PORT}/login.html")
    print(f"  Dashboard: http://localhost:{PORT}/dashboard.html")
    print()
    print("  Email:    admin@ggl.com")
    print("  Password: Ggl@2026")
    print("=" * 50)
    print("  Ctrl+C to stop")
    print()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
