"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";

import { useFlyoutContext } from "@/app/flyout-context";
import { rowActionsColumn } from "@/components/data-table/row-actions-column";
import { selectColumn } from "@/components/data-table/select-column";
import { currencySortingFn, dateSortingFn, multiSelectFilterFn } from "@/components/data-table/sorting";

import { useTransactionDetail } from "./transaction-context";
import { amountColor, statusColor } from "./transactions-properties";
import type { Transaction } from "./transactions-table";

function TransactionNameCell({ transaction }: { transaction: Transaction }) {
  const { setFlyoutOpen } = useFlyoutContext();
  const { setTransaction } = useTransactionDetail();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setFlyoutOpen(true);
    setTransaction(transaction);
  };

  return (
    <div className="flex items-center">
      <div className="mr-2 h-9 w-9 shrink-0 sm:mr-3">
        <button onClick={handleClick} tabIndex={-1} title="Quick view">
          <Image className="rounded-full" src={transaction.image} width={36} height={36} alt={transaction.name} />
        </button>
      </div>
      <Link
        className="font-medium text-gray-800 hover:text-violet-500 dark:text-gray-100"
        href={`/finance/transactions/${transaction.id}`}
      >
        {transaction.name}
      </Link>
    </div>
  );
}

export const columns: ColumnDef<Transaction, any>[] = [
  selectColumn<Transaction>(),
  {
    accessorKey: "name",
    header: "Counterparty",
    meta: { cellClassName: "md:w-1/2" },
    cell: ({ row }) => <TransactionNameCell transaction={row.original} />,
  },
  {
    accessorKey: "date",
    header: "Payment Date",
    sortingFn: dateSortingFn,
    cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    filterFn: multiSelectFilterFn,
    cell: ({ getValue }) => (
      <div className="text-left">
        <div
          className={`inline-flex rounded-full px-2.5 py-1 text-center text-xs font-medium ${statusColor(getValue())}`}
        >
          {getValue()}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    sortingFn: currencySortingFn,
    meta: { cellClassName: "w-px" },
    cell: ({ getValue }) => <div className={`text-right font-medium ${amountColor(getValue())}`}>{getValue()}</div>,
  },
  rowActionsColumn<Transaction>((transaction) => `/finance/transactions/${transaction.id}`, "Transaction Detail"),
];
