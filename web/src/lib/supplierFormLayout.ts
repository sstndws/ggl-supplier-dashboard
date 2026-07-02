/** Multi-line text fields — rendered as textarea, full row width. */
export const SUPPLIER_TEXTAREA_KEYS = new Set([
  'address',
  'location',
  'travel_time_and_distance_to_airport_est',
]);

export function isSupplierTextareaField(key: string): boolean {
  return SUPPLIER_TEXTAREA_KEYS.has(key);
}

export function supplierFormFieldSpanClass(key: string): string {
  return isSupplierTextareaField(key) ? ' full' : '';
}

export function supplierViewFieldSpanClass(key: string): string {
  return isSupplierTextareaField(key) ? ' full' : '';
}
