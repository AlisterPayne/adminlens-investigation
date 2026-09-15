"use client";

import { useDataTableContext } from "./data-table-context";

export default function DataTableSearch({ placeholder = "Search…" }: { placeholder?: string }) {
  const { globalFilter, setGlobalFilter } = useDataTableContext();
  return (
    <div className="relative">
      <label htmlFor="table-search" className="sr-only">
        Search
      </label>
      <input
        id="table-search"
        className="form-input bg-white pl-9 dark:bg-gray-800"
        type="search"
        placeholder={placeholder}
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
      />
      <div className="pointer-events-none absolute inset-0 right-auto flex items-center">
        <svg
          className="mr-2 ml-3 shrink-0 fill-current text-gray-400 dark:text-gray-500"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
          <path d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
        </svg>
      </div>
    </div>
  );
}
