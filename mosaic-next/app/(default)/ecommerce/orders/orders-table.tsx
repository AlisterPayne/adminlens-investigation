"use client";

import type { Row } from "@tanstack/react-table";
import { StaticImageData } from "next/image";

import DataTable from "@/components/data-table/data-table";

import { columns } from "./orders-columns";

export interface Order {
  id: number;
  image: StaticImageData;
  order: string;
  date: string;
  customer: string;
  total: string;
  status: string;
  items: string;
  location: string;
  type: string;
  description: string;
}

function renderSubRow(row: Row<Order>, colSpan: number) {
  return (
    <tr role="region">
      <td colSpan={colSpan} className="px-2 py-3 first:pl-5 last:pr-5">
        <div className="-mt-3 flex items-center bg-gray-50 p-3 dark:bg-gray-950/[0.15] dark:text-gray-400">
          <svg className="mr-2 shrink-0 fill-current text-gray-400 dark:text-gray-500" width="16" height="16">
            <path d="M1 16h3c.3 0 .5-.1.7-.3l11-11c.4-.4.4-1 0-1.4l-3-3c-.4-.4-1-.4-1.4 0l-11 11c-.2.2-.3.4-.3.7v3c0 .6.4 1 1 1zm1-3.6l10-10L13.6 4l-10 10H2v-1.6z" />
          </svg>
          <div className="italic">{row.original.description}</div>
        </div>
      </td>
    </tr>
  );
}

export default function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <DataTable
      data={orders}
      columns={columns}
      title="All Orders"
      count={442}
      dateColumnId="date"
      getRowCanExpand={() => true}
      renderSubRow={renderSubRow}
    />
  );
}
