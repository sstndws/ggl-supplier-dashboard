import type { Analytics } from '@/types';

const items = [
  { key: 'totalSuppliers' as const, label: 'Total Suppliers' },
  { key: 'stockpiles' as const, label: 'Stockpiles' },
  { key: 'uncertified' as const, label: 'Uncertified' },
  { key: 'newSuppliers' as const, label: 'New Suppliers' },
];

export default function StatCards({ data }: { data: Analytics }) {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.key}
          className="rounded-2xl border p-5"
          style={{
            background: '#fff',
            borderColor: 'rgba(139,26,26,0.09)',
            boxShadow: '0 2px 16px rgba(139,26,26,0.06)',
          }}
        >
          <div
            className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em]"
            style={{ color: '#9c8a8a' }}
          >
            {item.label}
          </div>
          <div
            className="text-[2.5rem] font-bold leading-none tabular-nums"
            style={{ color: '#8B1A1A' }}
          >
            {data[item.key]}
          </div>
        </div>
      ))}
    </div>
  );
}
