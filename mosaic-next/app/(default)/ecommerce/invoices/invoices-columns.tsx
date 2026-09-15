"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { selectColumn } from "@/components/data-table/select-column";
import { currencySortingFn, dateSortingFn, multiSelectFilterFn } from "@/components/data-table/sorting";

import { statusColor, totalColor, typeIcon } from "./invoices-properties";
import type { Invoice } from "./invoices-table";

export const columns: ColumnDef<Invoice, any>[] = [
  selectColumn<Invoice>(),
  {
    accessorKey: "invoice",
    header: "Invoice",
    cell: ({ row }) => (
      <Link className="font-medium text-sky-600 hover:underline" href={`/ecommerce/invoices/${row.original.id}`}>
        {row.original.invoice}
      </Link>
    ),
  },
  {
    accessorKey: "total",
    header: "Total",
    sortingFn: currencySortingFn,
    cell: ({ row }) => <div className={`font-medium ${totalColor(row.original.status)}`}>{row.original.total}</div>,
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
    accessorKey: "customer",
    header: "Customer",
    cell: ({ getValue }) => <div className="font-medium text-gray-800 dark:text-gray-100">{getValue()}</div>,
  },
  {
    accessorKey: "issueddate",
    header: "Issued on",
    sortingFn: dateSortingFn,
    cell: ({ getValue }) => <div>{getValue()}</div>,
  },
  {
    accessorKey: "paiddate",
    header: "Paid on",
    sortingFn: dateSortingFn,
    cell: ({ getValue }) => <div>{getValue()}</div>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ getValue }) => (
      <div className="flex items-center">
        {typeIcon(getValue())}
        <div>{getValue()}</div>
      </div>
    ),
  },
  {
    id: "actions",
    enableSorting: false,
    meta: { cellClassName: "w-px", headerClassName: "font-semibold text-left" },
    header: () => <div className="text-left font-semibold">Actions</div>,
    cell: ({ row, table }) => (
      <div className="space-x-1">
        <Link
          href={`/ecommerce/invoices/${row.original.id}`}
          className="rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
        >
          <span className="sr-only">View invoice detail</span>
          <svg className="h-8 w-8 fill-current" viewBox="0 0 32 32">
            <path d="M16 12c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
            <path d="M16 9c-4.8 0-8.4 3.6-9.9 6.3-.2.4-.2.9 0 1.3C7.6 19.4 11.2 23 16 23s8.4-3.6 9.9-6.3c.2-.4.2-.9 0-1.3C24.4 12.6 20.8 9 16 9zm0 12c-3.5 0-6.3-2.5-7.8-5 1.5-2.5 4.3-5 7.8-5s6.3 2.5 7.8 5c-1.5 2.5-4.3 5-7.8 5z" />
          </svg>
        </Link>
        <button className="rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
          <span className="sr-only">Edit</span>
          <svg className="h-8 w-8 fill-current" viewBox="0 0 32 32">
            <path d="M19.7 8.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM12.6 22H10v-2.6l6-6 2.6 2.6-6 6zm7.4-7.4L17.4 12l1.6-1.6 2.6 2.6-1.6 1.6z" />
          </svg>
        </button>
        <button className="rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
          <span className="sr-only">Download</span>
          <svg className="h-8 w-8 fill-current" viewBox="0 0 32 32">
            <path d="M16 20c.3 0 .5-.1.7-.3l5.7-5.7-1.4-1.4-4 4V8h-2v8.6l-4-4L9.6 14l5.7 5.7c.2.2.4.3.7.3zM9 22h14v2H9z" />
          </svg>
        </button>
        <button
          onClick={() => table.options.meta?.deleteRow(row.original.id)}
          className="rounded-full text-red-500 hover:text-red-600"
        >
          <span className="sr-only">Delete</span>
          <svg className="h-8 w-8 fill-current" viewBox="0 0 32 32">
            <path d="M13 15h2v6h-2zM17 15h2v6h-2z" />
            <path d="M20 9c0-.6-.4-1-1-1h-6c-.6 0-1 .4-1 1v2H8v2h1v10c0 .6.4 1 1 1h12c.6 0 1-.4 1-1V13h1v-2h-4V9zm-6 1h4v1h-4v-1zm7 3v9H11v-9h10z" />
          </svg>
        </button>
      </div>
    ),
  },
];
