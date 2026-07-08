import { downloadExcel, exportableFields, openCorporatePdf } from '@/lib/export';
import type { FieldSchema, SupplierRecord, TableFilters } from '@/types';
import { FileSpreadsheet, FileText, X } from 'lucide-react';
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
  mode: 'pdf' | 'excel';
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
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelected(new Set(initialKeys));
    setExporting(false);
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

  async function handleExport() {
    if (!selectedFields.length || exporting) return;
    const stamp = new Date().toISOString().slice(0, 10);
    const safeSite = siteId.replace(/[^a-zA-Z0-9_-]/g, '');

    if (mode === 'excel') {
      setExporting(true);
      try {
        await downloadExcel({
          records,
          columns: selectedFields,
          filename: `GGL_Supplier_Registry_${safeSite}_${year}_${stamp}.xlsx`,
          sheetName: `${siteId} ${year}`,
        });
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to create Excel file.');
        setExporting(false);
        return;
      }
      setExporting(false);
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
            <h2>{mode === 'pdf' ? 'Export PDF' : 'Export Excel'}</h2>
            <p>
              Choose columns to include · {records.length} rows · {siteName} {year}
            </p>
          </div>
          <button type="button" className="supplier-profile-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="export-modal__toolbar">
          <button type="button" className="export-chip" onClick={() => toggleAll(true)} disabled={allSelected}>
            Select all
          </button>
          <button type="button" className="export-chip" onClick={() => toggleAll(false)} disabled={noneSelected}>
            Clear
          </button>
          <span className="export-modal__count">
            {selectedFields.length} / {fields.length} columns selected
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
            disabled={noneSelected || exporting}
            onClick={handleExport}
          >
            {mode === 'pdf' ? <FileText size={15} /> : <FileSpreadsheet size={15} />}
            {mode === 'pdf'
              ? 'Generate PDF'
              : exporting
                ? 'Preparing…'
                : 'Download Excel'}
          </button>
        </div>
      </div>
    </div>
  );
}
