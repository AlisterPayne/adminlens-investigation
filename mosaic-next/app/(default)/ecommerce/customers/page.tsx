export const metadata = {
  title: "Customers - Mosaic",
  description: "Page description",
};

import Link from "next/link";

import { DataTableProvider } from "@/components/data-table/data-table-context";
import DataTableDateSelect from "@/components/data-table/data-table-date-select";
import DataTableFilter from "@/components/data-table/data-table-filter";
import DeleteButton from "@/components/delete-button";
import { customers } from "@/data/customers-data";

import CustomersTable from "./customers-table";

const locationOptions = [
  { label: "🇬🇧 London, UK", value: "🇬🇧 London, UK" },
  { label: "🇩🇪 Dortmund, DE", value: "🇩🇪 Dortmund, DE" },
  { label: "🇫🇷 Paris, FR", value: "🇫🇷 Paris, FR" },
  { label: "🇮🇹 Bologna, IT", value: "🇮🇹 Bologna, IT" },
  { label: "🇮🇹 Milan, IT", value: "🇮🇹 Milan, IT" },
  { label: "🇫🇷 Marseille, FR", value: "🇫🇷 Marseille, FR" },
  { label: "🇯🇵 Tokio, JP", value: "🇯🇵 Tokio, JP" },
  { label: "🇨🇳 Shanghai, CN", value: "🇨🇳 Shanghai, CN" },
];

function CustomersContent() {
  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Customers</h1>
        </div>

        {/* Right: Actions */}
        <div className="grid grid-flow-col justify-start gap-2 sm:auto-cols-max sm:justify-end">
          {/* Delete button */}
          <DeleteButton />

          {/* Dropdown */}
          <DataTableDateSelect />

          {/* Filter button */}
          <DataTableFilter columnId="location" options={locationOptions} align="right" />

          {/* Add customer button */}
          <Link
            href="/ecommerce/customers/new"
            className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white"
          >
            <svg className="xs:hidden shrink-0 fill-current" width="16" height="16" viewBox="0 0 16 16">
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
            <span className="max-xs:sr-only">Add Customer</span>
          </Link>
        </div>
      </div>

      {/* Table */}
      <CustomersTable customers={customers} />
    </div>
  );
}

export default function Customers() {
  return (
    <DataTableProvider>
      <CustomersContent />
    </DataTableProvider>
  );
}
