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
