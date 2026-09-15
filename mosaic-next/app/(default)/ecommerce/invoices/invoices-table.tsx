"use client";

import DataTable from "@/components/data-table/data-table";

import { columns } from "./invoices-columns";

export interface Invoice {
  id: number;
  invoice: string;
  total: string;
  status: string;
  customer: string;
  issueddate: string;
  paiddate: string;
  type: string;
}

export default function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
  return <DataTable data={invoices} columns={columns} title="Invoices" count={67} dateColumnId="issueddate" />;
}
