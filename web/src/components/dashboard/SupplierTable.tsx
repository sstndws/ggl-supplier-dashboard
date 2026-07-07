import {
  columnClassForKey,
  renderSupplierCell,
} from '@/components/registry/RegistryBadges';
import type { FieldSchema, SupplierRecord } from '@/types';
import { useMemo } from 'react';

function tdClass(key: string) {
  return columnClassForKey(key).replace('mill-th', 'mill-td');
}

export default function SupplierTable({
  records,
  schema,
  visibleKeys,
  onRowClick,
  isFiltered = false,
}: {
  records: SupplierRecord[];
  schema: FieldSchema[];
  visibleKeys: Set<string>;
  onRowClick: (record: SupplierRecord) => void;
  isFiltered?: boolean;
}) {
  const fields = useMemo(
    () =>
      schema.filter(
        (f) =>
          !['id', 'site', 'year', 'updated_at'].includes(f.key) &&
          visibleKeys.has(f.key),
      ),
    [schema, visibleKeys],
  );

  if (!fields.length) {
    return <div className="registry-empty">Pilih kolom untuk ditampilkan.</div>;
  }

  return (
    <div className="registry-table-scroll">
      <table className="supplier-registry-table">
        <thead>
          <tr>
            {fields.map((field) => (
              <th key={field.key} className={`mill-th ${columnClassForKey(field.key)}`} scope="col">
                <div className="mill-th-inner">
                  <span className="mill-th-label">{field.label}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan={fields.length} className="registry-empty">
                {isFiltered
                  ? 'Tidak ada supplier yang cocok dengan filter ini.'
                  : 'Tidak ada data supplier.'}
              </td>
            </tr>
          ) : (
            records.map((record) => (
              <tr
                key={record.id}
                className="mill-row-clickable"
                onClick={() => onRowClick(record)}
                title="Klik untuk lihat detail"
              >
                {fields.map((field) => (
                  <td key={field.key} className={`mill-td ${tdClass(field.key)}`}>
                    {renderSupplierCell(field.key, record)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
