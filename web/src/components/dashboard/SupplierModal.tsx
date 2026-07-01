import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import type { FieldSchema, SupplierRecord } from '@/types';
import { FormEvent } from 'react';

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
  const fields = schema.filter(
    (f) => !['id', 'site', 'year', 'updated_at'].includes(f.key),
  );

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
    <Modal
      open={open}
      onClose={onClose}
      title={record ? 'Edit Supplier' : 'Add Supplier'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {fields.map((field) => {
            const value = record?.[field.key] || '';
            const isLong = ['address', 'person_in_charge', 'location'].includes(field.key);

            return (
              <div key={field.key} className={isLong ? 'md:col-span-2' : ''}>
                <label className="mb-1.5 block text-xs font-semibold text-ink-2">
                  {field.label}
                </label>
                {field.type === 'select' && field.options ? (
                  <select
                    name={field.key}
                    defaultValue={value}
                    className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-maroon-500/40 focus:ring-4 focus:ring-maroon-600/8"
                  >
                    <option value="">—</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : isLong ? (
                  <textarea
                    name={field.key}
                    defaultValue={value}
                    rows={3}
                    className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-maroon-500/40 focus:ring-4 focus:ring-maroon-600/8"
                  />
                ) : (
                  <Input name={field.key} defaultValue={value} />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex justify-end gap-2 border-t border-line pt-5">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Supplier</Button>
        </div>
      </form>
    </Modal>
  );
}
