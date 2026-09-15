import type { ColumnDef } from "@tanstack/react-table";

// Shared checkbox column (select-all in header, per-row select in body) that
// matches Mosaic's existing table markup.
export function selectColumn<T>(): ColumnDef<T, unknown> {
  return {
    id: "select",
    enableSorting: false,
    meta: { cellClassName: "w-px" },
    header: ({ table }) => (
      <div className="flex items-center">
        <label className="inline-flex">
          <span className="sr-only">Select all</span>
          <input
            className="form-checkbox"
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        </label>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center">
        <label className="inline-flex">
          <span className="sr-only">Select</span>
          <input
            className="form-checkbox"
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        </label>
      </div>
    ),
  };
}
