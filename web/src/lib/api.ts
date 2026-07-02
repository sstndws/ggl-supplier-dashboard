import type {
  DashboardData,
  InitialData,
  LoginResponse,
  SupplierRecord,
  TableFilters,
} from '@/types';
import { getToken, setSession } from '@/lib/auth';

const GAS_URL = (import.meta.env.VITE_GAS_URL || '').replace(/\/$/, '');
const USE_GAS = Boolean(GAS_URL);

let sessionPromise: Promise<void> | null = null;

async function parseGasResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    const data = JSON.parse(text) as T & { error?: string };
    if (data && typeof data === 'object' && 'error' in data && data.error) {
      throw new Error(data.error);
    }
    return data;
  } catch (err) {
    if (err instanceof Error && err.message !== 'Unexpected token') throw err;
    throw new Error('API tidak merespons JSON. Cek deploy Apps Script (Anyone) dan URL VITE_GAS_URL.');
  }
}

async function gasPost<T>(route: string, payload: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route, ...payload }),
    redirect: 'follow',
  });
  return parseGasResponse<T>(res);
}

async function ensureSession(): Promise<void> {
  if (!USE_GAS || getToken()) return;

  const email = import.meta.env.VITE_GAS_EMAIL as string | undefined;
  const password = import.meta.env.VITE_GAS_PASSWORD as string | undefined;
  if (!email || !password) {
    throw new Error('VITE_GAS_EMAIL dan VITE_GAS_PASSWORD belum diset di Vercel.');
  }

  const data = await gasPost<LoginResponse>('/api/login', { email, password });
  setSession(data.token, data.user);
}

async function requestLocal<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

async function requestGas<T>(route: string, init?: RequestInit): Promise<T> {
  if (!sessionPromise) sessionPromise = ensureSession();
  await sessionPromise;

  const body = init?.body ? (JSON.parse(init.body as string) as Record<string, unknown>) : {};
  return gasPost<T>(route, { token: getToken(), ...body });
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  if (USE_GAS) return requestGas<T>(url, init);
  return requestLocal<T>(url, init);
}

export const api = {
  async bootstrap() {
    if (USE_GAS) {
      sessionPromise = ensureSession();
      await sessionPromise;
    }
  },

  getInitial() {
    return request<InitialData>('/api/initial');
  },

  getDashboard(site: string, year: string, filters: TableFilters) {
    return request<DashboardData>('/api/dashboard', {
      method: 'POST',
      body: JSON.stringify({ site, year, filters }),
    });
  },

  saveRecord(record: SupplierRecord) {
    return request<SupplierRecord>('/api/save', {
      method: 'POST',
      body: JSON.stringify({ record }),
    });
  },

  deleteRecord(id: string) {
    return request<{ deleted: boolean }>('/api/delete', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  },

  addSite(id: string, name: string) {
    return request<{ id: string; name: string }>('/api/add-site', {
      method: 'POST',
      body: JSON.stringify({ id, name }),
    });
  },

  exportCsvUrl(site: string, year: string, filters: TableFilters) {
    if (USE_GAS) {
      const url = new URL(GAS_URL);
      url.searchParams.set('route', '/api/export-csv');
      url.searchParams.set('site', site);
      url.searchParams.set('year', year);
      url.searchParams.set('search', filters.search || '');
      url.searchParams.set('certFilter', filters.certFilter || '');
      url.searchParams.set('supplierFilter', filters.supplierFilter || '');
      const token = getToken();
      if (token) url.searchParams.set('token', token);
      return url.toString();
    }
    const params = new URLSearchParams({ site, year, ...filters });
    return `/api/export-csv?${params.toString()}`;
  },
};
