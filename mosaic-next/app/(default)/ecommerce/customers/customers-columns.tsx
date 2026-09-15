"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";

import { rowActionsColumn } from "@/components/data-table/row-actions-column";
import { selectColumn } from "@/components/data-table/select-column";
import {
  currencySortingFn,
  dateSortingFn,
  multiSelectFilterFn,
  numberSortingFn,
} from "@/components/data-table/sorting";

import type { Customer } from "./customers-table";

export const columns: ColumnDef<Customer, any>[] = [
  selectColumn<Customer>(),
  {
    id: "fav",
    enableSorting: false,
    meta: { cellClassName: "w-px" },
    header: () => <span className="sr-only">Favourite</span>,
    cell: ({ row }) => (
      <div className="relative flex items-center">
        <button>
          <svg
            className={`shrink-0 fill-current ${row.original.fav ? "text-yellow-500" : "text-gray-300 dark:text-gray-600"}`}
            width="16"
            height="16"
            viewBox="0 0 16 16"
          >
            <path d="M8 0L6 5.934H0l4.89 3.954L2.968 16 8 12.223 13.032 16 11.11 9.888 16 5.934h-6L8 0z" />
          </svg>
        </button>
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link className="group flex items-center" href={`/ecommerce/customers/${row.original.id}`}>
        <div className="mr-2 h-10 w-10 shrink-0 sm:mr-3">
          <Image className="rounded-full" src={row.original.image} width={40} height={40} alt={row.original.name} />
        </div>
        <div className="font-medium text-gray-800 group-hover:text-violet-500 dark:text-gray-100">
          {row.original.name}
        </div>
      </Link>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
  },
  {
    accessorKey: "location",
    header: "Location",
    filterFn: multiSelectFilterFn,
    cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
  },
  {
    accessorKey: "orders",
    header: "Orders",
    sortingFn: numberSortingFn,
    meta: { headerClassName: "font-semibold" },
    cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
  },
  {
    accessorKey: "lastOrder",
    header: "Last order",
    cell: ({ getValue }) => <div className="text-left font-medium text-sky-600">{getValue()}</div>,
  },
  {
    accessorKey: "spent",
    header: "Total spent",
    sortingFn: currencySortingFn,
    cell: ({ getValue }) => <div className="text-left font-medium text-green-600">{getValue()}</div>,
  },
  {
    accessorKey: "refunds",
    header: "Refunds",
    sortingFn: numberSortingFn,
    meta: { headerClassName: "font-semibold" },
    cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
  },
  {
    accessorKey: "createdAt",
    header: "Created on",
    sortingFn: dateSortingFn,
    cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
  },
  rowActionsColumn<Customer>((customer) => `/ecommerce/customers/${customer.id}`, "Customer Detail"),
];
