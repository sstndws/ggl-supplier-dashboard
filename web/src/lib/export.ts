import type { FieldSchema, SupplierRecord, TableFilters } from '@/types';
import { escapeHtml, formatDateValue, isDateField } from '@/lib/utils';

const SKIP_KEYS = new Set(['id', 'site', 'year', 'updated_at']);

export function exportableFields(schema: FieldSchema[]) {
  return schema.filter((f) => !SKIP_KEYS.has(f.key));
}

function sanitizeSheetName(name: string): string {
  const cleaned = name.replace(/[\\/?*[\]:]/g, ' ').trim();
  return (cleaned || 'Registry').slice(0, 31);
}

function isNumericValue(value: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(value.trim());
}

export async function downloadExcel({
  records,
  columns,
  filename,
  sheetName,
}: {
  records: SupplierRecord[];
  columns: FieldSchema[];
  filename: string;
  sheetName: string;
}) {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'GGL Dashboard';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(sanitizeSheetName(sheetName), {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  sheet.columns = columns.map((c) => {
    const headerLen = c.label.length;
    const dataLen = records.reduce(
      (max, r) => Math.max(max, String(r[c.key] ?? '').length),
      0,
    );
    const width = Math.min(48, Math.max(12, Math.max(headerLen, dataLen) + 2));
    return { key: c.key, width };
  });

  const headerRow = sheet.getRow(1);
  headerRow.values = columns.map((c) => c.label);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF8B1A1A' },
    };
    cell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF6D1414' } },
      bottom: { style: 'thin', color: { argb: 'FF6D1414' } },
      left: { style: 'thin', color: { argb: 'FF6D1414' } },
      right: { style: 'thin', color: { argb: 'FF6D1414' } },
    };
  });

  records.forEach((record, index) => {
    const row = sheet.addRow(
      columns.map((c) => {
        const raw = String(record[c.key] ?? '').trim();
        if (!raw) return '';
        if (isDateField(c)) {
          const formatted = formatDateValue(raw);
          return formatted === '—' ? '' : formatted;
        }
        if (c.type === 'number' && isNumericValue(raw)) return Number(raw);
        return raw;
      }),
    );
    row.height = 18;
    const zebra = index % 2 === 1;
    row.eachCell((cell) => {
      if (zebra) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFBF6F6' },
        };
      }
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF2A1010' } };
      cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: false };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFECE0E0' } },
        right: { style: 'thin', color: { argb: 'FFF2EAEA' } },
      };
    });
  });

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function cellText(record: SupplierRecord, column: FieldSchema): string {
  const raw = (record[column.key] || '').trim();
  if (!raw) return '—';
  if (isDateField(column)) return formatDateValue(raw);
  return raw;
}

function filterSummary(filters: TableFilters): string {
  const parts: string[] = [];
  if (filters.search) parts.push(`Search: "${filters.search}"`);
  if (filters.certFilter === 'certified') parts.push('Certified only');
  if (filters.certFilter === 'uncertified') parts.push('Uncertified only');
  if (filters.supplierFilter === 'baru') parts.push('Supplier Baru');
  if (filters.supplierFilter === 'lama') parts.push('Supplier Lama');
  return parts.length ? parts.join(' · ') : 'All records (no filters)';
}

export function openCorporatePdf({
  records,
  columns,
  siteName,
  siteId,
  year,
  filters,
  generatedBy,
}: {
  records: SupplierRecord[];
  columns: FieldSchema[];
  siteName: string;
  siteId: string;
  year: string;
  filters: TableFilters;
  generatedBy?: string;
}) {
  const generatedAt = new Date().toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const colCount = columns.length;
  const fontSize = colCount > 10 ? '7pt' : colCount > 7 ? '7.5pt' : '8pt';
  const headSize = colCount > 10 ? '6.5pt' : '7pt';

  const tableHead = columns
    .map((c) => `<th scope="col">${escapeHtml(c.label)}</th>`)
    .join('');

  const tableBody = records
    .map((r, i) => {
      const cells = columns
        .map((c) => `<td>${escapeHtml(cellText(r, c))}</td>`)
        .join('');
      return `<tr class="${i % 2 === 1 ? 'alt' : ''}">${cells}</tr>`;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>GGL Supplier Registry – ${escapeHtml(siteName)} ${escapeHtml(year)}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 12mm 10mm 14mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      color: #1a0a0a;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .report {
      max-width: 100%;
    }

    .report-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #6d1414 0%, #8b1a1a 55%, #a52020 100%);
      color: #fff;
      padding: 14px 18px;
      border-radius: 10px 10px 0 0;
    }
    .report-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .report-logo {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: rgba(255,255,255,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 11px;
      letter-spacing: 0.04em;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .report-brand h1 {
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.06em;
      line-height: 1.2;
    }
    .report-brand p {
      font-size: 9px;
      opacity: 0.85;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .report-doc-type {
      text-align: right;
      font-size: 9px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      opacity: 0.9;
    }
    .report-doc-type strong {
      display: block;
      font-size: 11px;
      letter-spacing: 0.08em;
      margin-top: 3px;
    }

    .report-body {
      border: 1px solid rgba(139,26,26,0.14);
      border-top: none;
      border-radius: 0 0 10px 10px;
      padding: 16px 18px 14px;
    }

    .report-title {
      font-size: 18px;
      font-weight: 700;
      color: #1a0a0a;
      margin-bottom: 4px;
      letter-spacing: -0.02em;
    }
    .report-subtitle {
      font-size: 10px;
      color: #7a5f5f;
      margin-bottom: 14px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }
    .meta-card {
      background: #faf6f6;
      border: 1px solid rgba(139,26,26,0.1);
      border-radius: 8px;
      padding: 8px 10px;
    }
    .meta-card .k {
      font-size: 7px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #9c8080;
      margin-bottom: 3px;
    }
    .meta-card .v {
      font-size: 11px;
      font-weight: 700;
      color: #8b1a1a;
      line-height: 1.3;
      word-break: break-word;
    }
    .meta-card .v.dark { color: #1a0a0a; font-weight: 600; }

    .table-wrap {
      overflow: hidden;
      border: 1px solid rgba(139,26,26,0.12);
      border-radius: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: ${fontSize};
      line-height: 1.35;
    }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    th {
      background: #8b1a1a;
      color: #fff;
      font-size: ${headSize};
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      text-align: left;
      padding: 7px 6px;
      border-right: 1px solid rgba(255,255,255,0.12);
      vertical-align: bottom;
    }
    th:last-child { border-right: none; }
    td {
      padding: 5px 6px;
      border-bottom: 1px solid #ece4e4;
      border-right: 1px solid #f0eaea;
      vertical-align: top;
      word-break: break-word;
      color: #2a1010;
    }
    td:last-child { border-right: none; }
    tr.alt td { background: #faf7f7; }
    tbody tr:last-child td { border-bottom: none; }

    .report-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 12px;
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid rgba(139,26,26,0.1);
      font-size: 8px;
      color: #9c8080;
      line-height: 1.45;
    }
    .report-footer strong { color: #7a5f5f; }
    .confidential {
      font-size: 7.5px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #b09090;
      text-align: right;
    }

    @media print {
      body { margin: 0; }
      .report-topbar { border-radius: 0; }
      .report-body { border-radius: 0; border-left: none; border-right: none; }
    }
  </style>
</head>
<body>
  <div class="report">
    <div class="report-topbar">
      <div class="report-brand">
        <div class="report-logo">GGL</div>
        <div>
          <h1>GGL DASHBOARD</h1>
          <p>Downstream · Sustainability</p>
        </div>
      </div>
      <div class="report-doc-type">
        Official Report
        <strong>Supplier Registry Export</strong>
      </div>
    </div>

    <div class="report-body">
      <div class="report-title">Supplier Registry — ${escapeHtml(siteName)}</div>
      <div class="report-subtitle">Period ${escapeHtml(year)} · Site ID ${escapeHtml(siteId)}</div>

      <div class="meta-grid">
        <div class="meta-card">
          <div class="k">Total Records</div>
          <div class="v">${records.length}</div>
        </div>
        <div class="meta-card">
          <div class="k">Columns Exported</div>
          <div class="v">${columns.length}</div>
        </div>
        <div class="meta-card">
          <div class="k">Generated</div>
          <div class="v dark">${escapeHtml(generatedAt)}</div>
        </div>
        <div class="meta-card">
          <div class="k">Prepared By</div>
          <div class="v dark">${escapeHtml(generatedBy || 'GGL Dashboard')}</div>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead><tr>${tableHead}</tr></thead>
          <tbody>${tableBody || '<tr><td colspan="' + colCount + '">No data</td></tr>'}</tbody>
        </table>
      </div>

      <div class="report-footer">
        <div>
          <strong>Filter applied:</strong> ${escapeHtml(filterSummary(filters))}<br />
          Document generated from GGL Supplier Cangkang Registry.
        </div>
        <div class="confidential">Internal Use · Confidential</div>
      </div>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 350);
    };
  </script>
</body>
</html>`;

  const w = window.open('', '_blank');
  if (!w) {
    alert('Pop-up blocked by the browser. Please allow pop-ups to export PDF.');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
