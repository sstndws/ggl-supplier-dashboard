import SupplierFormField from '@/components/dashboard/SupplierFormField';
import { supplierFormFieldSpanClass } from '@/lib/supplierFormLayout';
import { resolveSupplierSchema } from '@/lib/defaultSchema';
import type { FieldSchema, SupplierRecord } from '@/types';
import { X } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

export default function SupplierModal({
  open,
  onClose,
  schema,
  record,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  schema: FieldSchema[];
  record: SupplierRecord | null;
  onSave: (data: Record<string, string>) => Promise<void>;
}) {
  const resolvedSchema = useMemo(() => resolveSupplierSchema(schema), [schema]);
  const fields = resolvedSchema.filter(
    (f) => !['id', 'site', 'year', 'updated_at'].includes(f.key),
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSaving(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    const form = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    fields.forEach((f) => {
      data[f.key] = String(form.get(f.key) || '');
    });
    setSaving(true);
    try {
      await onSave(data);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="supplier-profile-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={record ? 'Edit supplier' : 'Add supplier'}
    >
      <div className="add-site-modal supplier-add-modal">
        <div className="add-site-modal__head">
          <div>
            <h2>{record ? 'Edit Supplier' : 'Add Supplier'}</h2>
            <p>Fill in supplier data for the active site and year.</p>
          </div>
          <button type="button" className="supplier-profile-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <form className="supplier-add-form" onSubmit={handleSubmit}>
          <div className="sp-edit-grid">
            {fields.map((field) => (
              <div
                key={field.key}
                className={`sp-form-field${supplierFormFieldSpanClass(field.key)}`}
              >
                <label htmlFor={`add-${field.key}`}>{field.label}</label>
                <SupplierFormField
                  field={field}
                  id={`add-${field.key}`}
                  name={field.key}
                  defaultValue={record?.[field.key] || ''}
                />
              </div>
            ))}
          </div>

          <div className="add-site-modal__actions">
            <button type="button" className="sp-btn sp-btn-ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="sp-btn sp-btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
