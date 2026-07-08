import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function getSupplierType(record: Record<string, string>): string {
  return (
    record.supplier_lama_baru ||
    record.supplier_lama_supplier_baru ||
    record.jenis_supplier ||
    ''
  );
}

const EN_SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MONTH_INDEX: Record<string, number> = {
  januari: 0, jan: 0, january: 0,
  februari: 1, feb: 1, february: 1,
  maret: 2, mar: 2, march: 2,
  april: 3, apr: 3,
  mei: 4, may: 4,
  juni: 5, jun: 5, june: 5,
  juli: 6, jul: 6, july: 6,
  agustus: 7, agu: 7, aug: 7, august: 7,
  september: 8, sep: 8, sept: 8,
  oktober: 9, okt: 9, oct: 9, october: 9,
  november: 10, nov: 10,
  desember: 11, des: 11, dec: 11, december: 11,
};

interface ParsedDate {
  y: number;
  m: number;
  d: number;
  hasDay: boolean;
}

/** Parse the many date shapes coming from Sheets (ISO, JS Date string, Indonesian text). */
function parseSupplierDate(raw: string): ParsedDate | null {
  const s = raw.trim();
  if (!s) return null;

  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    const m = Number(iso[2]) - 1;
    if (m >= 0 && m < 12) {
      return { y: Number(iso[1]), m, d: Number(iso[3]), hasDay: true };
    }
  }

  const named = s.match(/^(?:(\d{1,2})\s+)?([A-Za-z]+)\.?\s+(\d{4})$/);
  if (named) {
    const mi = MONTH_INDEX[named[2].toLowerCase()];
    if (mi !== undefined) {
      return {
        y: Number(named[3]),
        m: mi,
        d: named[1] ? Number(named[1]) : 1,
        hasDay: Boolean(named[1]),
      };
    }
  }

  if (/[A-Za-z]/.test(s) || s.includes('/')) {
    const dt = new Date(s);
    if (!Number.isNaN(dt.getTime())) {
      return { y: dt.getFullYear(), m: dt.getMonth(), d: dt.getDate(), hasDay: true };
    }
  }

  return null;
}

/** Format any supplier date into a clean, date-only English string (no time). */
export function formatDateValue(value?: string): string {
  const raw = (value || '').trim();
  if (!raw || raw === '—' || raw === '-') return '—';
  const p = parseSupplierDate(raw);
  if (!p) return raw;
  return p.hasDay
    ? `${p.d} ${EN_SHORT_MONTHS[p.m]} ${p.y}`
    : `${EN_SHORT_MONTHS[p.m]} ${p.y}`;
}

export function formatProfileDate(value?: string): string {
  return formatDateValue(value);
}

export function formatProfileNumber(value?: string): string {
  const raw = (value || '').trim();
  if (!raw) return '—';
  const numMatch = raw.match(/^[\d.,\s-]+/);
  if (!numMatch) return raw;
  const suffix = raw.slice(numMatch[0].length).trim();
  const digits = numMatch[0].replace(/\./g, '').replace(',', '.');
  const num = Number.parseFloat(digits);
  if (Number.isNaN(num)) return raw;
  const formatted = num.toLocaleString('id-ID');
  return suffix ? `${formatted} ${suffix}` : formatted;
}

export function isUncertified(cert?: string): boolean {
  const value = (cert || '').toLowerCase();
  return !value || value.includes('none') || value === 'no data' || value === '-';
}

export function isDateField(field: { key: string; type?: string }): boolean {
  if (field.type === 'date') return true;
  return /date|validity|tanggal_verifikasi/i.test(field.key);
}

/** Normalize stored values to `YYYY-MM-DD` for `<input type="date">`. */
export function toDateInputValue(value?: string): string {
  const raw = (value || '').trim();
  if (!raw || raw === '—') return '';
  const p = parseSupplierDate(raw);
  if (!p) return '';
  const m = String(p.m + 1).padStart(2, '0');
  const d = String(p.d).padStart(2, '0');
  return `${p.y}-${m}-${d}`;
}
