"use client";

import { useDataTableContext } from "@/components/data-table/data-table-context";

export default function DeleteButton() {
  const { selectedCount, deleteSelected } = useDataTableContext();

  return (
    <div className={`${selectedCount < 1 && "hidden"}`}>
      <div className="flex items-center">
        <div className="mr-2 hidden text-sm whitespace-nowrap italic xl:block">
          <span>{selectedCount}</span> items selected
        </div>
        <button
          onClick={deleteSelected}
          className="btn border-gray-200 bg-white text-red-500 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-gray-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
