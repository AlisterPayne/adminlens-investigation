"use client";

import type { Table } from "@tanstack/react-table";

export default function DataTablePagination<T>({ table }: { table: Table<T> }) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;
  const firstRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <nav className="mb-4 sm:order-1 sm:mb-0" role="navigation" aria-label="Navigation">
        <ul className="flex justify-center">
          <li className="ml-3 first:ml-0">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={`btn border-gray-200 bg-white dark:border-gray-700/60 dark:bg-gray-800 ${
                table.getCanPreviousPage()
                  ? "text-gray-800 hover:border-gray-300 dark:text-gray-300 dark:hover:border-gray-600"
                  : "cursor-not-allowed text-gray-300 dark:text-gray-600"
              }`}
            >
              &lt;- Previous
            </button>
          </li>
          <li className="ml-3 first:ml-0">
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={`btn border-gray-200 bg-white dark:border-gray-700/60 dark:bg-gray-800 ${
                table.getCanNextPage()
                  ? "text-gray-800 hover:border-gray-300 dark:text-gray-300 dark:hover:border-gray-600"
                  : "cursor-not-allowed text-gray-300 dark:text-gray-600"
              }`}
            >
              Next -&gt;
            </button>
          </li>
        </ul>
      </nav>
      <div className="text-center text-sm text-gray-500 sm:text-left">
        Showing <span className="font-medium text-gray-600 dark:text-gray-300">{firstRow}</span> to{" "}
        <span className="font-medium text-gray-600 dark:text-gray-300">{lastRow}</span> of{" "}
        <span className="font-medium text-gray-600 dark:text-gray-300">{totalRows}</span> results
      </div>
    </div>
  );
}
