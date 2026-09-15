import type { FilterFn, Row, SortingFn } from "@tanstack/react-table";

// Parse a currency-like display string (e.g. "+$2,179.36", "-$1,299.22", "$129.00")
// into a comparable number. Non-numeric values fall back to 0.
export function parseCurrency(value: unknown): number {
  if (typeof value !== "string") return 0;
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}

// Parse a plain numeric display string (e.g. "24", "-"). Non-numeric falls back to 0.
export function parseNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;
  const parsed = parseFloat(value.replace(/[^0-9.-]/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
}

// Parse a "dd/mm/yyyy" display string into a timestamp. Placeholder values
// (like "-") sort to the very beginning.
export function parseDMY(value: unknown): number {
  if (typeof value !== "string") return 0;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return 0;
  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
}

export const currencySortingFn: SortingFn<any> = (rowA: Row<any>, rowB: Row<any>, columnId: string) => {
  return parseCurrency(rowA.getValue(columnId)) - parseCurrency(rowB.getValue(columnId));
};

export const numberSortingFn: SortingFn<any> = (rowA: Row<any>, rowB: Row<any>, columnId: string) => {
  return parseNumber(rowA.getValue(columnId)) - parseNumber(rowB.getValue(columnId));
};

export const dateSortingFn: SortingFn<any> = (rowA: Row<any>, rowB: Row<any>, columnId: string) => {
  return parseDMY(rowA.getValue(columnId)) - parseDMY(rowB.getValue(columnId));
};

// Keeps a row when its column value is one of the selected filter values.
// An empty selection means "no filter" (all rows pass).
export const multiSelectFilterFn: FilterFn<any> = (row: Row<any>, columnId: string, filterValue: string[]) => {
  if (!filterValue || filterValue.length === 0) return true;
  return filterValue.includes(row.getValue(columnId));
};
