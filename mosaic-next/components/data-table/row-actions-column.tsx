import "./types";

import type { ColumnDef } from "@tanstack/react-table";

import RowActionsMenu from "./row-actions-menu";

// Builds a trailing "actions" column with a ⋯ menu that links to the row's
// detail page and can remove the row from the table.
export function rowActionsColumn<T extends { id: number | string }>(
  getHref: (row: T) => string,
  detailLabel: string,
): ColumnDef<T, unknown> {
  return {
    id: "actions",
    enableSorting: false,
    meta: { cellClassName: "w-px" },
    header: () => <span className="sr-only">Menu</span>,
    cell: ({ row, table }) => (
      <div className="flex items-center justify-center">
        <RowActionsMenu
          href={getHref(row.original)}
          detailLabel={detailLabel}
          onRemove={() => table.options.meta?.deleteRow(row.original.id)}
        />
      </div>
    ),
  };
}
