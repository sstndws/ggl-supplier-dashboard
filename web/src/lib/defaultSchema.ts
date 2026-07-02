import type { FieldSchema } from '@/types';

export const CERT_OPTIONS = [
  'MSPO',
  'ISCC JapanFIT',
  'RSPO P&C',
  'RSB',
  'ISPO',
  'EU-ISCC',
  'None of the list',
  'NO Data',
];

export const SUPPLIER_TYPE_OPTIONS = [
  'Supplier Lama',
  'Supplier Baru',
  'Supplier Lama/ Supplier Baru',
];

export const STATUS_OPTIONS = [
  'Sudah Dikunjungi Surv 1',
  'Belum Dikunjungi',
  'Dalam Proses',
  '-',
];

/** Fallback schema when site/year has no _Schema rows yet (e.g. after Add Site). */
export const DEFAULT_SUPPLIER_SCHEMA: FieldSchema[] = [
  { key: 'no', label: 'No.', type: 'text' },
  { key: 'company_name', label: 'Company Name', type: 'text' },
  { key: 'pks_mill_internal_name', label: 'PKS / Mill Internal Name', type: 'text' },
  { key: 'address', label: 'Address', type: 'text' },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'stockpile', label: 'Stockpile', type: 'text' },
  {
    key: 'supplier_lama_supplier_baru',
    label: 'Supplier Lama / Supplier Baru',
    type: 'select',
    options: SUPPLIER_TYPE_OPTIONS,
  },
  { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS },
  { key: 'ann_est_production_palm_shell_in_mt', label: 'Ann Est Production (MT)', type: 'text' },
  { key: 'qty_terkirim_kg', label: 'Qty. Terkirim (kg)', type: 'number' },
  { key: 'qty_pengiriman_kg', label: 'Qty. Pengiriman (kg)', type: 'number' },
  { key: 'person_in_charge', label: 'Person in Charge', type: 'text' },
  { key: 'ghg_transport', label: 'GHG Transport', type: 'number' },
  { key: 'sustainability_certificate', label: 'Sustainability Certificate', type: 'text' },
  { key: 'certificate_no', label: 'Certificate No.', type: 'text' },
  { key: 'certificate_validity_start', label: 'Certificate Validity Start', type: 'date' },
  { key: 'certificate_validity_end', label: 'Certificate Validity End', type: 'date' },
  { key: 'email', label: 'Email', type: 'email' },
  {
    key: 'distance_to_collectorstockpile_km',
    label: 'Distance to Collector/Stockpile (KM)',
    type: 'text',
  },
  { key: 'nearest_airport', label: 'Nearest Airport', type: 'text' },
  {
    key: 'travel_time_and_distance_to_airport_est',
    label: 'Travel Time to Airport',
    type: 'text',
  },
  { key: 'type_of_processing', label: 'Type of Processing', type: 'text' },
  { key: 'sampel_audit', label: 'Sampel Audit', type: 'text' },
  { key: 'date_of_internal_verification_for_ggl1d_by_the_first_collect', label: 'Internal Verification Date', type: 'date' },
  { key: 'no_usi', label: 'No USI', type: 'text' },
];

export function resolveSupplierSchema(schema: FieldSchema[]): FieldSchema[] {
  if (schema?.length) return schema;
  return DEFAULT_SUPPLIER_SCHEMA;
}
