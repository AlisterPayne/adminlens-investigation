export const metadata = {
  title: "Transactions - Mosaic",
  description: "Page description",
};

import { FlyoutProvider } from "@/app/flyout-context";
import { DataTableProvider } from "@/components/data-table/data-table-context";
import DataTableSearch from "@/components/data-table/data-table-search";
import DataTableTabs from "@/components/data-table/data-table-tabs";
import DeleteButton from "@/components/delete-button";
import { transactions } from "@/data/transactions-data";

import { TransactionDetailProvider } from "./transaction-context";
import TransactionDropdown from "./transaction-dropdown";
import TransactionPanel from "./transaction-panel";
import TransactionsTable from "./transactions-table";

const statusTabs = [
  { label: "View All", value: null },
  { label: "Completed", value: "Completed" },
  { label: "Pending", value: "Pending" },
  { label: "Canceled", value: "Canceled" },
];

function Transactions() {
  return (
    <div className="relative h-full bg-white dark:bg-gray-900">
      <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-4 sm:flex sm:items-center sm:justify-between md:mb-2">
          {/* Left: Title */}
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">$47,347.09</h1>
          </div>

          {/* Right: Actions */}
          <div className="grid grid-flow-col justify-start gap-2 sm:auto-cols-max sm:justify-end">
            {/* Delete button */}
            <DeleteButton />

            {/* Search form */}
            <div className="hidden sm:block">
              <DataTableSearch />
            </div>

            {/* Export button */}
            <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
              Export Transactions
            </button>
          </div>
        </div>

        <div className="mb-5">
          <span>Transactions from </span>
          <TransactionDropdown />
        </div>

        {/* Filters */}
        <div className="mb-5">
          <DataTableTabs columnId="status" tabs={statusTabs} />
        </div>

        {/* Table */}
        <TransactionsTable transactions={transactions} />
      </div>

      <TransactionPanel />
    </div>
  );
}

export default function Orders() {
  return (
    <DataTableProvider>
      <FlyoutProvider>
        <TransactionDetailProvider>
          <Transactions />
        </TransactionDetailProvider>
      </FlyoutProvider>
    </DataTableProvider>
  );
}
