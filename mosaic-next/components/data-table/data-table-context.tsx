"use client";

import type { ColumnFiltersState, RowSelectionState, Updater } from "@tanstack/react-table";
import { createContext, useCallback, useContext, useRef, useState } from "react";

export type DateWindow = number | "all";

interface DataTableContextProps {
  rowSelection: RowSelectionState;
  setRowSelection: (updater: Updater<RowSelectionState>) => void;
  selectedCount: number;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  columnFilters: ColumnFiltersState;
  setColumnFilters: (updater: Updater<ColumnFiltersState>) => void;
  getColumnFilter: (columnId: string) => string[];
  setColumnFilter: (columnId: string, values: string[]) => void;
  dateWindow: DateWindow;
  setDateWindow: (value: DateWindow) => void;
  registerDeleteHandler: (fn: () => void) => void;
  deleteSelected: () => void;
}

const DataTableContext = createContext<DataTableContextProps | undefined>(undefined);

export const DataTableProvider = ({ children }: { children: React.ReactNode }) => {
  const [rowSelection, setRowSelectionState] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [columnFilters, setColumnFiltersState] = useState<ColumnFiltersState>([]);
  const [dateWindow, setDateWindow] = useState<DateWindow>("all");
  const deleteHandlerRef = useRef<() => void>(() => {});

  const setRowSelection = useCallback((updater: Updater<RowSelectionState>) => {
    setRowSelectionState((prev) => (typeof updater === "function" ? updater(prev) : updater));
  }, []);

  const setColumnFilters = useCallback((updater: Updater<ColumnFiltersState>) => {
    setColumnFiltersState((prev) => (typeof updater === "function" ? updater(prev) : updater));
  }, []);

  const getColumnFilter = useCallback(
    (columnId: string): string[] => {
      const found = columnFilters.find((filter) => filter.id === columnId);
      return (found?.value as string[]) ?? [];
    },
    [columnFilters],
  );

  const setColumnFilter = useCallback((columnId: string, values: string[]) => {
    setColumnFiltersState((prev) => {
      const rest = prev.filter((filter) => filter.id !== columnId);
      return values.length ? [...rest, { id: columnId, value: values }] : rest;
    });
  }, []);

  const registerDeleteHandler = useCallback((fn: () => void) => {
    deleteHandlerRef.current = fn;
  }, []);

  const deleteSelected = useCallback(() => {
    deleteHandlerRef.current?.();
  }, []);

  return (
    <DataTableContext.Provider
      value={{
        rowSelection,
        setRowSelection,
        selectedCount: Object.keys(rowSelection).length,
        globalFilter,
        setGlobalFilter,
        columnFilters,
        setColumnFilters,
        getColumnFilter,
        setColumnFilter,
        dateWindow,
        setDateWindow,
        registerDeleteHandler,
        deleteSelected,
      }}
    >
      {children}
    </DataTableContext.Provider>
  );
};

export const useDataTableContext = () => {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error("useDataTableContext must be used within a DataTableProvider");
  }
  return context;
};
