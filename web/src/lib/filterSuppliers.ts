import type { Analytics, SupplierRecord, TableFilters } from '@/types';

function supplierType(record: SupplierRecord): string {
  return (
    record.supplier_lama_baru ||
    record.supplier_lama_supplier_baru ||
    record.jenis_supplier ||
    ''
  ).toLowerCase();
}

function isUncertified(record: SupplierRecord): boolean {
  const cert = (record.sustainability_certificate || '').toLowerCase();
  return !cert || cert.includes('none') || cert === 'no data' || cert === '-';
}

export function filterSupplierRecords(
  records: SupplierRecord[],
  filters: TableFilters,
): SupplierRecord[] {
  let result = records;

  const q = filters.search.trim().toLowerCase();
  if (q) {
    result = result.filter((record) =>
      Object.values(record).some((value) =>
        String(value).toLowerCase().includes(q),
      ),
    );
  }

  if (filters.certFilter === 'certified') {
    result = result.filter((record) => !isUncertified(record));
  } else if (filters.certFilter === 'uncertified') {
    result = result.filter((record) => isUncertified(record));
  }

  if (filters.supplierFilter === 'baru') {
    result = result.filter((record) => supplierType(record).includes('baru'));
  } else if (filters.supplierFilter === 'lama') {
    result = result.filter((record) => {
      const type = supplierType(record);
      return type.includes('lama') && !type.includes('baru');
    });
  }

  return result;
}

export function computeAnalytics(records: SupplierRecord[]): Analytics {
  const stockpiles = new Set<string>();
  let uncertified = 0;
  let newSuppliers = 0;

  for (const record of records) {
    if (record.stockpile) stockpiles.add(record.stockpile);
    if (isUncertified(record)) uncertified++;
    if (supplierType(record).includes('baru')) newSuppliers++;
  }

  return {
    totalSuppliers: records.length,
    stockpiles: stockpiles.size,
    uncertified,
    newSuppliers,
  };
}
