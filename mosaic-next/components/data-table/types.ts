import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // Per-column presentational hooks so the generic DataTable can reproduce
  // Mosaic's exact table markup without hardcoding column-specific classes.
  interface ColumnMeta<TData extends unknown, TValue> {
    // Extra classes for the <th>/<td> wrapper (e.g. "w-px" for narrow columns).
    cellClassName?: string;
    // Classes for the header label wrapper (e.g. "font-semibold text-left").
    headerClassName?: string;
  }

  // Table-level helpers shared with cell renderers (e.g. row delete actions).
  interface TableMeta<TData extends unknown> {
    deleteRow: (id: number | string) => void;
  }
}
