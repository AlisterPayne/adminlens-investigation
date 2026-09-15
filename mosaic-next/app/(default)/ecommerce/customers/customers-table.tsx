"use client";

import { StaticImageData } from "next/image";

import DataTable from "@/components/data-table/data-table";

import { columns } from "./customers-columns";

export interface Customer {
  id: number;
  image: StaticImageData;
  name: string;
  email: string;
  location: string;
  orders: string;
  lastOrder: string;
  spent: string;
  refunds: string;
  createdAt: string;
  fav: boolean;
}

export default function CustomersTable({ customers }: { customers: Customer[] }) {
  return <DataTable data={customers} columns={columns} title="All Customers" count={248} dateColumnId="createdAt" />;
}
