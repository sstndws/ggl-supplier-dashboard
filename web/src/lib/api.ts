import type {
  DashboardData,
  InitialData,
  SupplierRecord,
  TableFilters,
} from '@/types';

const DEFAULT_GAS_URL =
  'https://script.google.com/macros/s/AKfycbySQt20CiIRiSMYI4IpYWiJmtdI52B44_5gFyc_86gPoSnnu3Y5d2_rx4-3PjFJq4Vsxg/exec';

const GAS_URL = (import.meta.env.VITE_GAS_URL || DEFAULT_GAS_URL).replace(/\/$/, '');
/** Production: same-origin proxy avoids Apps Script CORS. Dev: local Python or direct GAS. */
const GAS_ENDPOINT = import.meta.env.PROD ? '/api/gas' : import.meta.env.VITE_GAS_URL ? GAS_URL : '';
const USE_GAS = Boolean(GAS_ENDPOINT);

async function parseGasResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    const data = JSON.parse(text) as T & { error?: string };
    if (data && typeof data === 'object' && 'error' in data && data.error) {
      throw new Error(data.error);
    }
    return data;
  } catch (err) {
    if (err instanceof Error && !err.message.includes('JSON') && !err.message.includes('API')) {
      throw err;
    }
    throw new Error(
      text.slice(0, 120).includes('<')
        ? 'Apps Script mengembalikan HTML. Pastikan deploy Web App = Anyone, lalu New version deploy.'
        : `API error: ${text.slice(0, 160)}`,
    );
  }
}

async function gasPost<T>(route: string, payload: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(GAS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route, ...payload }),
    redirect: 'follow',
  });
  return parseGasResponse<T>(res);
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
  const body = init?.body ? (JSON.parse(init.body as string) as Record<string, unknown>) : {};
  return gasPost<T>(route, body);
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  if (USE_GAS) return requestGas<T>(url, init);
  return requestLocal<T>(url, init);
}

export const api = {
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
      const params = new URLSearchParams({
        route: '/api/export-csv',
        site,
        year,
        search: filters.search || '',
        certFilter: filters.certFilter || '',
        supplierFilter: filters.supplierFilter || '',
      });
      return `/api/gas?${params.toString()}`;
    }
    const params = new URLSearchParams({ site, year, ...filters });
    return `/api/export-csv?${params.toString()}`;
  },
};
