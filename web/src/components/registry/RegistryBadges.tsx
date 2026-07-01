import { getSupplierType, formatProfileDate, formatProfileNumber } from '@/lib/utils';

function GlossyPill({ tier, label }: { tier: string; label: string }) {
  return (
    <span className={`mill-rrl mill-rrl--${tier}`}>
      <span className="mill-rrl-pill">
        <span className="mill-rrl-pill__sheen" aria-hidden />
        <span className="mill-rrl-pill__lbl">{label}</span>
      </span>
    </span>
  );
}

export function CertBadge({ value }: { value?: string }) {
  const raw = (value || '').trim();
  if (!raw || raw === '-') return <span className="mill-rrl--empty">—</span>;

  const lower = raw.toLowerCase();
  if (lower.includes('none') || lower === 'no data') {
    return <span className="status-badge s-danger">NO CERT</span>;
  }
  if (lower.includes('rspo') || lower.includes('ispo') || lower.includes('mspo')) {
    return <span className="status-badge s-active">{raw}</span>;
  }
  return <span className="status-badge s-review">{raw}</span>;
}

export function SupplierTypeBadge({ value }: { value?: string }) {
  if (!value) return <span style={{ color: '#ccc' }}>—</span>;
  const lower = value.toLowerCase();
  if (lower.includes('baru')) {
    return <span className="status-badge s-review">{value}</span>;
  }
  return <span className="status-badge s-active">{value}</span>;
}

export function StatusBadge({ value }: { value?: string }) {
  if (!value) return <span style={{ color: '#ccc' }}>—</span>;
  const lower = value.toLowerCase();
  let cls = 's-pending';
  if (lower.includes('sudah') || lower.includes('active') || lower.includes('compliant')) cls = 's-active';
  else if (lower.includes('review') || lower.includes('proses')) cls = 's-review';
  return <span className={`status-badge ${cls}`}>{value}</span>;
}

export function CertTierPill({ value }: { value?: string }) {
  const raw = (value || '').trim();
  if (!raw) return <span className="mill-rrl--empty">—</span>;

  const lower = raw.toLowerCase();
  if (lower.includes('none') || lower === 'no data') {
    return <GlossyPill tier="high" label="NO CERT" />;
  }
  if (lower.includes('rspo') || lower.includes('ispo') || lower.includes('mspo')) {
    return <GlossyPill tier="low" label={raw.length > 12 ? raw.slice(0, 12) + '…' : raw} />;
  }
  return <GlossyPill tier="medium" label={raw.length > 14 ? raw.slice(0, 14) + '…' : raw} />;
}

export function CellWrap({ value, title }: { value?: string; title?: string }) {
  const display = (value || '').trim() || '—';
  return (
    <span className="mill-cell-wrap" title={title || (display !== '—' ? display : undefined)}>
      {display}
    </span>
  );
}

export function MillNameCell({ name, sub }: { name?: string; sub?: string }) {
  return (
    <div>
      <span className="mill-name">{name || '—'}</span>
      {sub && <div className="mill-id">{sub}</div>}
    </div>
  );
}

export function renderSupplierCell(key: string, record: Record<string, string>) {
  const value = record[key] || '';

  switch (key) {
    case 'company_name':
      return <MillNameCell name={value} sub={record.no ? `#${record.no}` : undefined} />;
    case 'pks_mill_internal_name':
      return <MillNameCell name={value} />;
    case 'address':
    case 'location':
    case 'person_in_charge':
    case 'nearest_airport':
    case 'travel_time_and_distance_to_airport_est':
    case 'distance_to_collectorstockpile_km':
    case 'distance_to':
      return <CellWrap value={value} />;
    case 'sustainability_certificate':
      return <CertBadge value={value} />;
    case 'supplier_lama_baru':
    case 'supplier_lama_supplier_baru':
    case 'jenis_supplier':
      return <SupplierTypeBadge value={getSupplierType(record)} />;
    case 'status':
      return <StatusBadge value={value} />;
    case 'qty_terkirim_kg':
    case 'qty_pengiriman_kg':
    case 'qty_kirim_kg':
    case 'ghg_transport':
    case 'transport_of_residue_g_co2eq':
    case 'ann_est_production_palm_shell_in_mt':
      return (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {value ? formatProfileNumber(value) : '—'}
        </span>
      );
    case 'certificate_validity_start':
    case 'certificate_validity_end':
      return <span>{formatProfileDate(value)}</span>;
    default:
      return value ? <CellWrap value={value} /> : <span style={{ color: '#ccc' }}>—</span>;
  }
}

export function columnClassForKey(key: string): string {
  const map: Record<string, string> = {
    no: 'stock',
    company_name: 'company',
    pks_mill_internal_name: 'mill',
    stockpile: 'stock',
    supplier_lama_baru: 'supplier',
    supplier_lama_supplier_baru: 'supplier',
    jenis_supplier: 'supplier',
    status: 'status',
    sustainability_certificate: 'cert',
    type_of_processing: 'text',
    ann_est_production_palm_shell_in_mt: 'qty',
    qty_terkirim_kg: 'qty',
    qty_pengiriman_kg: 'qty',
    qty_kirim_kg: 'qty',
    ghg_transport: 'qty',
    address: 'wide',
    location: 'wide',
    person_in_charge: 'text',
    email: 'text',
    certificate_no: 'text',
    certificate_validity_start: 'text',
    certificate_validity_end: 'text',
  };
  return `mill-th--${map[key] || 'text'}`;
}
