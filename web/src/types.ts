export interface Site {
  id: string;
  name: string;
  description?: string;
}

export interface FieldSchema {
  key: string;
  label: string;
  type: string;
  sortOrder?: number;
  options?: string[] | null;
  width?: number;
}

export interface SupplierRecord {
  id: string;
  site: string;
  year: string;
  [key: string]: string;
}

export interface Analytics {
  totalSuppliers: number;
  stockpiles: number;
  uncertified: number;
  newSuppliers: number;
}

export interface DashboardData {
  analytics: Analytics;
  records: SupplierRecord[];
  schema: FieldSchema[];
  years: string[];
}

export interface InitialData {
  sites: Site[];
  years: string[];
  defaultSite: string;
  defaultYear: string;
  userEmail: string;
  userName: string;
}

export interface AuthUser {
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export type CertFilter = '' | 'certified' | 'uncertified';
export type SupplierFilter = '' | 'baru' | 'lama';

export interface TableFilters {
  search: string;
  certFilter: CertFilter;
  supplierFilter: SupplierFilter;
}

export const DEFAULT_VISIBLE_KEYS = new Set([
  'no',
  'company_name',
  'pks_mill_internal_name',
  'stockpile',
  'supplier_lama_baru',
  'supplier_lama_supplier_baru',
  'jenis_supplier',
  'status',
  'ann_est_production_palm_shell_in_mt',
  'qty_terkirim_kg',
  'qty_pengiriman_kg',
  'qty_kirim_kg',
  'sustainability_certificate',
  'type_of_processing',
  'address',
]);
