import { downloadCsv, exportableFields, openCorporatePdf } from '@/lib/export';
import type { FieldSchema, SupplierRecord, TableFilters } from '@/types';
import { Download, FileText, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function ExportModal({
  open,
  mode,
  onClose,
  schema,
  records,
  siteName,
  siteId,
  year,
  filters,
  initialKeys,
}: {
  open: boolean;
  mode: 'pdf' | 'csv';
  onClose: () => void;
  schema: FieldSchema[];
  records: SupplierRecord[];
  siteName: string;
  siteId: string;
  year: string;
  filters: TableFilters;
  initialKeys: Set<string>;
}) {
  const fields = useMemo(() => exportableFields(schema), [schema]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(initialKeys));

  useEffect(() => {
    if (!open) return;
    setSelected(new Set(initialKeys));
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, initialKeys]);

  if (!open) return null;

  const selectedFields = fields.filter((f) => selected.has(f.key));
  const allSelected = fields.every((f) => selected.has(f.key));
  const noneSelected = selectedFields.length === 0;

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('ggl_session_user') || '{}').email || 'GGL Dashboard';
    } catch {
      return 'GGL Dashboard';
    }
  })();

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(fields.map((f) => f.key)) : new Set());
  }

  function toggleKey(key: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function handleExport() {
    if (!selectedFields.length) return;
    const stamp = new Date().toISOString().slice(0, 10);
    const safeSite = siteId.replace(/[^a-zA-Z0-9_-]/g, '');

    if (mode === 'csv') {
      downloadCsv(
        records,
        selectedFields,
        `GGL_Supplier_Registry_${safeSite}_${year}_${stamp}.csv`,
      );
    } else {
      openCorporatePdf({
        records,
        columns: selectedFields,
        siteName,
        siteId,
        year,
        filters,
        generatedBy: user,
      });
    }
    onClose();
  }

  return (
    <div
      className="supplier-profile-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Export registry"
    >
      <div className="export-modal">
        <div className="export-modal__head">
          <div>
            <h2>{mode === 'pdf' ? 'Export PDF' : 'Export CSV'}</h2>
            <p>
              Pilih kolom yang ingin disertakan · {records.length} baris · {siteName} {year}
            </p>
          </div>
          <button type="button" className="supplier-profile-close" onClick={onClose} aria-label="Tutup">
            <X size={16} />
          </button>
        </div>

        <div className="export-modal__toolbar">
          <button type="button" className="export-chip" onClick={() => toggleAll(true)} disabled={allSelected}>
            Pilih semua
          </button>
          <button type="button" className="export-chip" onClick={() => toggleAll(false)} disabled={noneSelected}>
            Kosongkan
          </button>
          <span className="export-modal__count">
            {selectedFields.length} / {fields.length} kolom dipilih
          </span>
        </div>

        <div className="export-modal__columns">
          {fields.map((f) => (
            <label key={f.key} className={`export-col-item${selected.has(f.key) ? ' is-on' : ''}`}>
              <input
                type="checkbox"
                checked={selected.has(f.key)}
                onChange={(e) => toggleKey(f.key, e.target.checked)}
              />
              <span>{f.label}</span>
            </label>
          ))}
        </div>

        <div className="export-modal__actions">
          <button type="button" className="sp-btn sp-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="sp-btn sp-btn-primary"
            disabled={noneSelected}
            onClick={handleExport}
          >
            {mode === 'pdf' ? <FileText size={15} /> : <Download size={15} />}
            {mode === 'pdf' ? 'Generate PDF' : 'Download CSV'}
          </button>
        </div>
      </div>
    </div>
  );
}
