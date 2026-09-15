"use client";

import { StaticImageData } from "next/image";

import DataTable from "@/components/data-table/data-table";

import { columns } from "./transactions-columns";

export interface Transaction {
  id: number;
  image: StaticImageData;
  name: string;
  date: string;
  status: string;
  amount: string;
}

export default function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  return <DataTable data={transactions} columns={columns} variant="flush" />;
}
