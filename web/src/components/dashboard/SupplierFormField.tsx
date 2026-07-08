import type { FieldSchema } from '@/types';
import { isSupplierTextareaField } from '@/lib/supplierFormLayout';
import { isDateField, toDateInputValue } from '@/lib/utils';

type SupplierFormFieldProps = {
  field: FieldSchema;
  id: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
};

export function isSupplierLongField(key: string): boolean {
  return isSupplierTextareaField(key);
}

export default function SupplierFormField({
  field,
  id,
  name,
  value,
  defaultValue,
  onChange,
}: SupplierFormFieldProps) {
  const isControlled = value !== undefined;
  const raw = isControlled ? value : defaultValue || '';
  const isLong = isSupplierTextareaField(field.key);
  const isDate = isDateField(field);
  const isFreeTextCert = field.key === 'sustainability_certificate';

  if (field.type === 'select' && field.options && !isFreeTextCert) {
    return (
      <select
        id={id}
        name={name}
        className="sp-input sp-input-select"
        {...(isControlled
          ? { value: raw, onChange: (e) => onChange?.(e.target.value) }
          : { defaultValue: raw })}
      >
        <option value="">Select…</option>
        {field.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (isDate) {
    const dateValue = toDateInputValue(raw);
    return (
      <input
        id={id}
        name={name}
        className="sp-input sp-input-date"
        type="date"
        {...(isControlled
          ? { value: dateValue, onChange: (e) => onChange?.(e.target.value) }
          : { defaultValue: dateValue })}
      />
    );
  }

  if (isLong) {
    return (
      <textarea
        id={id}
        name={name}
        className="sp-input sp-input-textarea"
        rows={2}
        placeholder="—"
        {...(isControlled
          ? { value: raw, onChange: (e) => onChange?.(e.target.value) }
          : { defaultValue: raw })}
      />
    );
  }

  const inputType = field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text';
  const placeholder =
    field.key === 'sustainability_certificate'
      ? 'Ketik sertifikat, mis. RSPO P&C, ISPO, MSPO…'
      : '—';

  return (
    <input
      id={id}
      name={name}
      className="sp-input"
      type={inputType}
      placeholder={placeholder}
      {...(isControlled
        ? { value: raw, onChange: (e) => onChange?.(e.target.value) }
        : { defaultValue: raw })}
    />
  );
}
