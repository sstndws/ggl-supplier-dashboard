import SupplierFormField from '@/components/dashboard/SupplierFormField';
import { supplierFormFieldSpanClass } from '@/lib/supplierFormLayout';
import { resolveSupplierSchema } from '@/lib/defaultSchema';
import type { FieldSchema, SupplierRecord } from '@/types';
import { X } from 'lucide-react';
import { FormEvent, useEffect, useMemo } from 'react';

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

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    fields.forEach((f) => {
      data[f.key] = String(form.get(f.key) || '');
    });
    await onSave(data);
  }

  return (
    <div
      className="supplier-profile-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={record ? 'Edit supplier' : 'Tambah supplier'}
    >
      <div className="add-site-modal supplier-add-modal">
        <div className="add-site-modal__head">
          <div>
            <h2>{record ? 'Edit Supplier' : 'Add Supplier'}</h2>
            <p>Isi data supplier untuk registry site dan tahun aktif.</p>
          </div>
          <button type="button" className="supplier-profile-close" onClick={onClose} aria-label="Tutup">
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
            <button type="button" className="sp-btn sp-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sp-btn sp-btn-primary">
              Save Supplier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
