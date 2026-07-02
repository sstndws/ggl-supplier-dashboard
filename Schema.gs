/**
 * Schema & field definitions for Supplier Cangkang Dashboard
 */

var CERT_OPTIONS = [
  'MSPO',
  'ISCC JapanFIT',
  'RSPO P&C',
  'RSB',
  'ISPO',
  'EU-ISCC',
  'None of the list',
  'NO Data'
];

var SUPPLIER_TYPE_OPTIONS = [
  'Supplier Lama',
  'Supplier Baru',
  'Supplier Lama/ Supplier Baru'
];

var STATUS_OPTIONS = [
  'Sudah Dikunjungi Surv 1',
  'Belum Dikunjungi',
  'Dalam Proses',
  '-'
];

var PROCESSING_OPTIONS = [
  'Palm Oil Mill',
  'Crushing plant',
  'Stockpile',
  '-'
];

/** Master field registry – union of all site/year columns */
var MASTER_FIELDS = [
  { key: 'no', label: 'No.', type: 'text', width: 60 },
  { key: 'company_name', label: 'Company Name', type: 'text', width: 220 },
  { key: 'pks_mill_internal_name', label: 'PKS / Mill Internal Name', type: 'text', width: 160 },
  { key: 'address', label: 'Address', type: 'text', width: 260 },
  { key: 'location', label: 'Location', type: 'text', width: 200 },
  { key: 'supplier_lama_baru', label: 'Supplier Type', type: 'select', options: SUPPLIER_TYPE_OPTIONS, width: 140 },
  { key: 'supplier_lama_supplier_baru', label: 'Supplier Type', type: 'select', options: SUPPLIER_TYPE_OPTIONS, width: 140 },
  { key: 'jenis_supplier', label: 'Jenis Supplier', type: 'select', options: SUPPLIER_TYPE_OPTIONS, width: 140 },
  { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, width: 160 },
  { key: 'sampel_audit', label: 'Sampel Audit', type: 'text', width: 120 },
  { key: 'ann_est_production_palm_shell_in_mt', label: 'Ann Est Production (MT)', type: 'text', width: 150 },
  { key: 'qty_pengiriman_kg', label: 'Qty Pengiriman (Kg)', type: 'number', width: 140 },
  { key: 'qty_terkirim_kg', label: 'Qty Terkirim (Kg)', type: 'number', width: 140 },
  { key: 'qty_kirim_kg', label: 'Qty Kirim (Kg)', type: 'number', width: 140 },
  { key: 'stockpile', label: 'Stockpile', type: 'text', width: 120 },
  { key: 'person_in_charge', label: 'Person in Charge', type: 'text', width: 160 },
  { key: 'ghg_transport', label: 'GHG Transport', type: 'number', width: 120 },
  { key: 'transport_of_residue_g_co2eq', label: 'Transport Residue (g CO2eq)', type: 'number', width: 160 },
  { key: 'type_of_processing', label: 'Type of Processing', type: 'select', options: PROCESSING_OPTIONS, width: 140 },
  { key: 'distance_to_collectorstockpile_km', label: 'Distance to Collector/Stockpile', type: 'text', width: 180 },
  { key: 'distance_to', label: 'Distance to Collector/Stockpile', type: 'text', width: 180 },
  { key: 'nearest_airport', label: 'Nearest Airport', type: 'text', width: 180 },
  { key: 'travel_time_and_distance_to_airport_est', label: 'Travel Time to Airport', type: 'text', width: 200 },
  { key: 'sustainability_certificate', label: 'Sustainability Certificate', type: 'text', width: 180 },
  { key: 'certificate_no', label: 'Certificate No.', type: 'text', width: 140 },
  { key: 'certificate_validity_start', label: 'Cert Validity Start', type: 'date', width: 130 },
  { key: 'certificate_validity_end', label: 'Cert Validity End', type: 'date', width: 130 },
  { key: 'email', label: 'Email', type: 'email', width: 180 },
  { key: 'date_of_internal_verification_for_ggl1d_by_the_first_collector', label: 'Internal Verification Date', type: 'date', width: 160 },
  { key: 'date_of_internal_verification_for_ggl1d_by_the_first_collect', label: 'Internal Verification Date', type: 'date', width: 160 },
  { key: 'no_usi', label: 'No USI', type: 'text', width: 100 },
  { key: 'tanggal_verifikasi_supplier', label: 'Tanggal Verifikasi Supplier', type: 'date', width: 160 }
];

var SHEET_SITES = '_Sites';
var SHEET_SCHEMA = '_Schema';
var SHEET_DATA = '_Data';

function getFieldMeta_(key) {
  for (var i = 0; i < MASTER_FIELDS.length; i++) {
    if (MASTER_FIELDS[i].key === key) return MASTER_FIELDS[i];
  }
  return { key: key, label: key, type: 'text', width: 140 };
}

function getDefaultSites_() {
  return [
    { id: 'EUP', name: 'EUP - Cangkang', description: 'Daftar Supplier Cangkang EUP' },
    { id: 'RSB', name: 'RSB - Cangkang', description: 'Daftar Supplier Cangkang RSB' }
  ];
}
