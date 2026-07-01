import type {
  DashboardData,
  InitialData,
  LoginResponse,
  SupplierRecord,
  TableFilters,
} from '@/types';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

export const api = {
  login(email: string, password: string) {
    return request<LoginResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
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
    const params = new URLSearchParams({ site, year, ...filters });
    return `/api/export-csv?${params.toString()}`;
  },
};
