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

import { statusColor, typeIcon } from "./orders-properties";
import type { Order } from "./orders-table";

export const columns: ColumnDef<Order, any>[] = [
  selectColumn<Order>(),
  {
    accessorKey: "order",
    header: "Order",
    cell: ({ row }) => (
      <Link className="group flex items-center text-gray-800" href={`/ecommerce/orders/${row.original.id}`}>
        <div className="mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 sm:mr-3 dark:bg-gray-700">
          <Image className="ml-1" src={row.original.image} width={20} height={20} alt={row.original.order} />
        </div>
        <div className="font-medium text-sky-600 group-hover:underline">{row.original.order}</div>
      </Link>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    sortingFn: dateSortingFn,
    cell: ({ getValue }) => <div>{getValue()}</div>,
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ getValue }) => <div className="font-medium text-gray-800 dark:text-gray-100">{getValue()}</div>,
  },
  {
    accessorKey: "total",
    header: "Total",
    sortingFn: currencySortingFn,
    cell: ({ getValue }) => <div className="text-left font-medium text-green-600">{getValue()}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    filterFn: multiSelectFilterFn,
    cell: ({ getValue }) => (
      <div className={`inline-flex rounded-full px-2.5 py-0.5 text-center font-medium ${statusColor(getValue())}`}>
        {getValue()}
      </div>
    ),
  },
  {
    accessorKey: "items",
    header: "Items",
    sortingFn: numberSortingFn,
    meta: { headerClassName: "font-semibold" },
    cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
  },
  {
    accessorKey: "type",
    header: "Payment type",
    cell: ({ getValue }) => (
      <div className="flex items-center">
        {typeIcon(getValue())}
        <div>{getValue()}</div>
      </div>
    ),
  },
  rowActionsColumn<Order>((order) => `/ecommerce/orders/${order.id}`, "Order Detail"),
  {
    id: "expander",
    enableSorting: false,
    meta: { cellClassName: "w-px" },
    header: () => <span className="sr-only">Details</span>,
    cell: ({ row }) => (
      <div className="flex items-center">
        <button
          className={`text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 ${row.getIsExpanded() && "rotate-180"}`}
          aria-expanded={row.getIsExpanded()}
          onClick={row.getToggleExpandedHandler()}
        >
          <span className="sr-only">Details</span>
          <svg className="h-8 w-8 fill-current" viewBox="0 0 32 32">
            <path d="M16 20l-5.4-5.4 1.4-1.4 4 4 4-4 1.4 1.4z" />
          </svg>
        </button>
      </div>
    ),
  },
];
