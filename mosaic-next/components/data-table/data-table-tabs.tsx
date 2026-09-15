"use client";

import { useDataTableContext } from "./data-table-context";

interface Tab {
  label: string;
  // null represents the "All" tab (clears the filter).
  value: string | null;
}

export default function DataTableTabs({ columnId, tabs }: { columnId: string; tabs: Tab[] }) {
  const { getColumnFilter, setColumnFilter } = useDataTableContext();
  const current = getColumnFilter(columnId);

  const isActive = (value: string | null) =>
    value === null ? current.length === 0 : current.length === 1 && current[0] === value;

  return (
    <ul className="-m-1 flex flex-wrap">
      {tabs.map((tab) => {
        const active = isActive(tab.value);
        return (
          <li key={tab.label} className="m-1">
            <button
              onClick={() => setColumnFilter(columnId, tab.value === null ? [] : [tab.value])}
              className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-sm leading-5 font-medium shadow-sm transition ${
                active
                  ? "border-transparent bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-800"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600"
              }`}
            >
              {tab.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
