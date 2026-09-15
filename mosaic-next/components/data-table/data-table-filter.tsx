"use client";

import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";

import { useDataTableContext } from "./data-table-context";

interface FilterOption {
  label: string;
  value: string;
}

export default function DataTableFilter({
  columnId,
  options,
  align,
}: {
  columnId: string;
  options: FilterOption[];
  align?: "left" | "right";
}) {
  const { getColumnFilter, setColumnFilter } = useDataTableContext();
  const selected = getColumnFilter(columnId);

  // Toggling a checkbox applies the filter instantly.
  const toggle = (value: string, checked: boolean) => {
    const next = checked ? [...selected, value] : selected.filter((item) => item !== value);
    setColumnFilter(columnId, next);
  };

  return (
    <Popover className="relative inline-flex">
      <PopoverButton className="btn border-gray-200 bg-white px-2.5 text-gray-400 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:text-gray-500 dark:hover:border-gray-600">
        <span className="sr-only">Filter</span>
        <wbr />
        <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16">
          <path d="M0 3a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1ZM3 8a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1ZM7 12a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H7Z" />
        </svg>
      </PopoverButton>
      <Transition
        as="div"
        className={`absolute top-full right-auto left-0 z-10 mt-1 min-w-[14rem] origin-top-right overflow-hidden rounded-lg border border-gray-200 bg-white pt-1.5 shadow-lg dark:border-gray-700/60 dark:bg-gray-800 ${
          align === "right" ? "md:right-0 md:left-auto" : "md:right-auto md:left-0"
        }`}
        enter="transition ease-out duration-200 transform"
        enterFrom="opacity-0 -translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <PopoverPanel>
          <div className="px-3 pt-1.5 pb-2 text-xs font-semibold text-gray-400 uppercase dark:text-gray-500">
            Filters
          </div>
          <ul className="mb-4">
            {options.map((option) => (
              <li key={option.value} className="px-3 py-1">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={selected.includes(option.value)}
                    onChange={(e) => toggle(option.value, e.target.checked)}
                  />
                  <span className="ml-2 text-sm font-medium">{option.label}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700/60 dark:bg-gray-700/20">
            <button
              className="btn-xs w-full border-gray-200 bg-white text-red-500 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-gray-600"
              disabled={selected.length === 0}
              onClick={() => setColumnFilter(columnId, [])}
            >
              Clear filters
            </button>
          </div>
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}
