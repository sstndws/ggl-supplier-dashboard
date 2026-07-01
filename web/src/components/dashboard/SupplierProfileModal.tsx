import { CertBadge, SupplierTypeBadge, renderSupplierCell } from '@/components/registry/RegistryBadges';
import type { FieldSchema, SupplierRecord } from '@/types';
import { getSupplierType } from '@/lib/utils';
import { ChevronDown, Trash2, X } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState, type ReactNode } from 'react';

const HEADER_KEYS = new Set([
  'company_name',
  'pks_mill_internal_name',
  'address',
  'location',
  'sustainability_certificate',
  'supplier_lama_baru',
  'supplier_lama_supplier_baru',
  'jenis_supplier',
]);

const SECTIONS: { title: string; keys: string[] }[] = [
  {
    title: 'Supplier Identity',
    keys: ['no', 'stockpile'],
  },
  {
    title: 'Production & Delivery',
    keys: [
      'ann_est_production_palm_shell_in_mt',
      'qty_terkirim_kg',
      'qty_pengiriman_kg',
      'qty_kirim_kg',
      'type_of_processing',
      'status',
    ],
  },
  {
    title: 'Certification',
    keys: ['certificate_no', 'certificate_validity_start', 'certificate_validity_end'],
  },
  {
    title: 'Logistics & Contact',
    keys: [
      'distance_to_collectorstockpile_km',
      'distance_to',
      'nearest_airport',
      'travel_time_and_distance_to_airport_est',
      'person_in_charge',
      'email',
      'ghg_transport',
      'sampel_audit',
    ],
  },
];

const FULL_WIDTH_KEYS = new Set([
  'address',
  'location',
  'person_in_charge',
  'nearest_airport',
  'travel_time_and_distance_to_airport_est',
  'email',
]);

const EDIT_SECTIONS: { title: string; keys: string[] }[] = [
  {
    title: 'Supplier Identity',
    keys: ['no', 'company_name', 'pks_mill_internal_name', 'address', 'location', 'stockpile'],
  },
  {
    title: 'Production & Delivery',
    keys: [
      'ann_est_production_palm_shell_in_mt',
      'qty_terkirim_kg',
      'qty_pengiriman_kg',
      'qty_kirim_kg',
      'type_of_processing',
      'supplier_lama_baru',
      'supplier_lama_supplier_baru',
      'jenis_supplier',
      'status',
    ],
  },
  {
    title: 'Certification',
    keys: [
      'sustainability_certificate',
      'certificate_no',
      'certificate_validity_start',
      'certificate_validity_end',
    ],
  },
  {
    title: 'Logistics & Contact',
    keys: [
      'distance_to_collectorstockpile_km',
      'distance_to',
      'nearest_airport',
      'travel_time_and_distance_to_airport_est',
      'person_in_charge',
      'email',
      'ghg_transport',
      'sampel_audit',
    ],
  },
];

function fieldSpanClass(key: string, index: number, total: number): string {
  if (FULL_WIDTH_KEYS.has(key)) return ' full';
  const remainder = total % 3;
  if (remainder === 1 && index === total - 1) return ' full';
  if (remainder === 2 && index === total - 1) return ' wide';
  return '';
}

function fieldsByKeys(allFields: FieldSchema[], keys: string[]) {
  const order = new Map(keys.map((k, i) => [k, i]));
  return allFields
    .filter((f) => keys.includes(f.key))
    .sort((a, b) => (order.get(a.key) ?? 99) - (order.get(b.key) ?? 99));
}

function hasValue(record: SupplierRecord, form: Record<string, string>, key: string) {
  return Boolean((record[key] || form[key] || '').trim());
}

export default function SupplierProfileModal({
  open,
  record,
  schema,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  record: SupplierRecord | null;
  schema: FieldSchema[];
  onClose: () => void;
  onSave: (data: Record<string, string>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(true);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fields = schema.filter((f) => !['id', 'site', 'year', 'updated_at'].includes(f.key));

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!record) return;
    const initial: Record<string, string> = {};
    fields.forEach((f) => {
      initial[f.key] = record[f.key] || '';
    });
    setForm(initial);
    setShowHint(true);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    });
  }, [record, open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const editEl = editRef.current;
    const scrollEl = scrollRef.current;
    if (!editEl || !scrollEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowHint(!entry.isIntersecting),
      { root: scrollEl, threshold: 0.15 },
    );
    observer.observe(editEl);
    return () => observer.disconnect();
  }, [open, record]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !record) return null;

  const company = record.company_name || 'Supplier';
  const mill = record.pks_mill_internal_name || '';
  const address = record.address || record.location || '';

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  function fieldsForSection(keys: string[]) {
    return fields.filter(
      (f) => keys.includes(f.key) && !HEADER_KEYS.has(f.key) && hasValue(record!, form, f.key),
    );
  }

  const usedKeys = new Set([...HEADER_KEYS, ...SECTIONS.flatMap((s) => s.keys)]);
  const extraFields = fields.filter(
    (f) => !usedKeys.has(f.key) && hasValue(record, form, f.key),
  );

  const editUsedKeys = new Set(EDIT_SECTIONS.flatMap((s) => s.keys));
  const extraEditFields = fields.filter((f) => !editUsedKeys.has(f.key));

  function renderEditField(f: FieldSchema, index: number, total: number) {
    const isLong = FULL_WIDTH_KEYS.has(f.key);
    const id = `sp-${f.key}`;
    const value = form[f.key] || '';

    let control: ReactNode;
    if (f.type === 'select' && f.options) {
      control = (
        <select
          id={id}
          className="sp-input sp-input-select"
          value={value}
          onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
        >
          <option value="">Pilih…</option>
          {f.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    } else if (isLong) {
      control = (
        <textarea
          id={id}
          className="sp-input sp-input-textarea"
          rows={3}
          placeholder="—"
          value={value}
          onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
        />
      );
    } else {
      control = (
        <input
          id={id}
          className="sp-input"
          type="text"
          placeholder="—"
          value={value}
          onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
        />
      );
    }

    return (
      <div
        key={f.key}
        className={`sp-form-field${fieldSpanClass(f.key, index, total)}`}
      >
        <label htmlFor={id}>{f.label}</label>
        {control}
      </div>
    );
  }

  return (
    <div
      className="supplier-profile-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={`Detail ${company}`}
    >
      <div className="supplier-profile-box">
        <div className="supplier-profile-head">
          <div className="supplier-profile-head-inner">
            <div className="supplier-profile-head-main">
              <div className="supplier-profile-head-left">
                <h2>{company}</h2>
                {mill && <div className="sp-loc">{mill}</div>}
                {address && <div className="sp-sub">{address}</div>}
                {record.no && <div className="sp-meta">No. {record.no}</div>}
              </div>
              <div className="supplier-profile-head-right">
                <div className="sp-head-stack">
                  <span className="sp-head-k">Certificate</span>
                  <div className="sp-head-val">
                    <CertBadge value={record.sustainability_certificate} />
                  </div>
                </div>
                <div className="sp-head-stack">
                  <span className="sp-head-k">Supplier Type</span>
                  <div className="sp-head-val">
                    <SupplierTypeBadge value={getSupplierType(record)} />
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="supplier-profile-close"
              onClick={onClose}
              aria-label="Tutup"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="supplier-profile-scroll" ref={scrollRef}>
          <div className="supplier-profile-body">
            {SECTIONS.map((section) => {
              const sectionFields = fieldsForSection(section.keys);
              if (!sectionFields.length) return null;
              return (
                <div key={section.title} className="sp-section">
                  <div className="sp-section-title">{section.title}</div>
                  <div className="sp-grid">
                    {sectionFields.map((f, i) => (
                      <div
                        key={f.key}
                        className={`sp-field${fieldSpanClass(f.key, i, sectionFields.length)}`}
                      >
                        <span className="sp-label">{f.label}</span>
                        <div className="sp-val">{renderSupplierCell(f.key, record)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {extraFields.length > 0 && (
              <div className="sp-section">
                <div className="sp-section-title">Additional Info</div>
                <div className="sp-grid">
                  {extraFields.map((f, i) => (
                    <div
                      key={f.key}
                      className={`sp-field${fieldSpanClass(f.key, i, extraFields.length)}`}
                    >
                      <span className="sp-label">{f.label}</span>
                      <div className="sp-val">{renderSupplierCell(f.key, record)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={`sp-scroll-hint${showHint ? '' : ' hidden'}`}>
            <ChevronDown size={16} />
            Scroll untuk edit data supplier
          </div>

          <div className="sp-edit-divider" ref={editRef} />

          <div className="sp-edit-panel">
            <div className="sp-edit-header">
              <h3>Edit Supplier</h3>
              <p>Ubah data per section, lalu simpan perubahan ke registry.</p>
            </div>

            <form className="sp-edit-form" onSubmit={handleSave}>
              {EDIT_SECTIONS.map((section) => {
                const sectionFields = fieldsByKeys(fields, section.keys);
                if (!sectionFields.length) return null;
                return (
                  <div key={section.title} className="sp-edit-section">
                    <div className="sp-section-title">{section.title}</div>
                    <div className="sp-edit-grid">
                      {sectionFields.map((f, i) => renderEditField(f, i, sectionFields.length))}
                    </div>
                  </div>
                );
              })}

              {extraEditFields.length > 0 && (
                <div className="sp-edit-section">
                  <div className="sp-section-title">Additional Info</div>
                  <div className="sp-edit-grid">
                    {extraEditFields.map((f, i) =>
                      renderEditField(f, i, extraEditFields.length),
                    )}
                  </div>
                </div>
              )}

              <div className="sp-edit-actions">
                <button
                  type="button"
                  className="sp-btn sp-btn-danger"
                  onClick={async () => {
                    if (!confirm('Hapus supplier ini?')) return;
                    await onDelete(record.id);
                    onClose();
                  }}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
                <button type="button" className="sp-btn sp-btn-ghost" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="sp-btn sp-btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
