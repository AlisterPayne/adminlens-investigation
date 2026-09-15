"use client";

import "./types";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Fragment, useEffect, useMemo, useState } from "react";

import { useDataTableContext } from "./data-table-context";
import DataTablePagination from "./data-table-pagination";
import { parseDMY } from "./sorting";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  title?: string;
  count?: string | number;
  pageSize?: number;
  variant?: "card" | "flush";
  wrapperClassName?: string;
  tableClassName?: string;
  theadClassName?: string;
  tbodyClassName?: string;
  dateColumnId?: string;
  getRowCanExpand?: (row: Row<T>) => boolean;
  renderSubRow?: (row: Row<T>, colSpan: number) => React.ReactNode;
}

function SortIndicator({ sort }: { sort: false | "asc" | "desc" }) {
  return (
    <svg
      className={`ml-1 shrink-0 fill-current ${sort ? "text-gray-500 dark:text-gray-300" : "text-gray-300 dark:text-gray-600"}`}
      width="8"
      height="10"
      viewBox="0 0 8 10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 0L0 4h8L4 0z" className={sort === "desc" ? "opacity-30" : ""} />
      <path d="M4 10l4-4H0l4 4z" className={sort === "asc" ? "opacity-30" : ""} />
    </svg>
  );
}

export default function DataTable<T extends { id: number | string }>({
  data: initialData,
  columns,
  title,
  count,
  pageSize = 8,
  variant = "card",
  wrapperClassName,
  tableClassName,
  theadClassName,
  tbodyClassName,
  dateColumnId,
  getRowCanExpand,
  renderSubRow,
}: DataTableProps<T>) {
  const {
    rowSelection,
    setRowSelection,
    globalFilter,
    setGlobalFilter,
    columnFilters,
    setColumnFilters,
    dateWindow,
    registerDeleteHandler,
  } = useDataTableContext();
  const [data, setData] = useState<T[]>(initialData);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Date window filter (relative to the most recent date in the dataset so it
  // stays meaningful regardless of when the sample data was authored).
  const dateFilteredData = useMemo(() => {
    if (!dateColumnId || dateWindow === "all") return data;
    const timestamps = data
      .map((row) => parseDMY((row as Record<string, unknown>)[dateColumnId]))
      .filter((value) => value > 0);
    if (timestamps.length === 0) return data;
    const maxDate = Math.max(...timestamps);
    const threshold = maxDate - dateWindow * 24 * 60 * 60 * 1000;
    return data.filter((row) => {
      const value = parseDMY((row as Record<string, unknown>)[dateColumnId]);
      return value === 0 || value >= threshold;
    });
  }, [data, dateColumnId, dateWindow]);

  const table = useReactTable({
    data: dateFilteredData,
    columns,
    state: { rowSelection, sorting, globalFilter, columnFilters },
    getRowId: (row) => String(row.id),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getRowCanExpand,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    initialState: { pagination: { pageSize } },
    meta: {
      deleteRow: (id) => setData((prev) => prev.filter((row) => String(row.id) !== String(id))),
    },
  });

  // Let the header's Delete button remove the currently selected rows.
  useEffect(() => {
    registerDeleteHandler(() => {
      setData((prev) => prev.filter((row) => !rowSelection[String(row.id)]));
      setRowSelection({});
    });
  }, [rowSelection, registerDeleteHandler, setRowSelection]);

  const resolvedWrapper =
    wrapperClassName ??
    (variant === "flush" ? "bg-white dark:bg-gray-900" : "bg-white dark:bg-gray-800 shadow-sm rounded-xl relative");

  const resolvedThead =
    theadClassName ??
    (variant === "flush"
      ? "text-xs font-semibold uppercase text-gray-500 border-t border-b border-gray-200 dark:border-gray-700/60"
      : "text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-t border-b border-gray-100 dark:border-gray-700/60");

  const resolvedTbody =
    tbodyClassName ??
    (variant === "flush"
      ? "text-sm divide-y divide-gray-100 dark:divide-gray-700/60 border-b border-gray-200 dark:border-gray-700/60"
      : "text-sm divide-y divide-gray-100 dark:divide-gray-700/60");

  const leafColumnCount = table.getVisibleLeafColumns().length;

  return (
    <>
      <div className={resolvedWrapper}>
        {title !== undefined && (
          <header className="px-5 py-4">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">
              {title}{" "}
              {count !== undefined && <span className="font-medium text-gray-400 dark:text-gray-500">{count}</span>}
            </h2>
          </header>
        )}
        <div>
          <div className="overflow-x-auto">
            <table className={`w-full table-auto dark:text-gray-300 ${tableClassName ?? ""}`}>
              <thead className={resolvedThead}>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const meta = header.column.columnDef.meta;
                      return (
                        <th
                          key={header.id}
                          className={`px-2 py-3 text-left whitespace-nowrap first:pl-5 last:pr-5 ${meta?.cellClassName ?? ""}`}
                        >
                          {header.isPlaceholder ? null : header.column.getCanSort() ? (
                            <button
                              type="button"
                              className={`group inline-flex items-center ${meta?.headerClassName ?? "text-left font-semibold"}`}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                              <SortIndicator sort={header.column.getIsSorted()} />
                            </button>
                          ) : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className={resolvedTbody}>
                {table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <tr>
                      {row.getVisibleCells().map((cell) => {
                        const meta = cell.column.columnDef.meta;
                        return (
                          <td
                            key={cell.id}
                            className={`px-2 py-3 whitespace-nowrap first:pl-5 last:pr-5 ${meta?.cellClassName ?? ""}`}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </tr>
                    {row.getIsExpanded() && renderSubRow && renderSubRow(row, leafColumnCount)}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <DataTablePagination table={table} />
      </div>
    </>
  );
}
