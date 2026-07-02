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

export function formatProfileDate(value?: string): string {
  const raw = (value || '').trim();
  if (!raw || raw === '—') return '—';
  const normalized = raw.includes(' ') && !raw.includes('T') ? raw.replace(' ', 'T') : raw;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
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
  const isoMatch = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];
  const normalized = raw.includes(' ') && !raw.includes('T') ? raw.replace(' ', 'T') : raw;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
