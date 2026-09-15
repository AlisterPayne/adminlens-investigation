export const metadata = {
  title: "Ecommerce - Mosaic",
  description: "Page description",
};

import Datepicker from "@/components/datepicker";
import FilterButton from "@/components/dropdown-filter";

import EcommerceCard01 from "./ecommerce-card-01";
import EcommerceCard02 from "./ecommerce-card-02";
import EcommerceCard03 from "./ecommerce-card-03";
import EcommerceCard04 from "./ecommerce-card-04";
import EcommerceCard05 from "./ecommerce-card-05";
import EcommerceCard06 from "./ecommerce-card-06";
import EcommerceCard07 from "./ecommerce-card-07";
import EcommerceCard08 from "./ecommerce-card-08";
import EcommerceCard09 from "./ecommerce-card-09";
import EcommerceCard10 from "./ecommerce-card-10";

export default function Ecommerce() {
  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
      {/* Dashboard actions */}
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Ecommerce</h1>
        </div>
        {/* Right: Actions */}
        <div className="grid grid-flow-col justify-start gap-2 sm:auto-cols-max sm:justify-end">
          {/* Filter button */}
          <FilterButton align="right" />
          {/* Datepicker built with React Day Picker */}
          <Datepicker />
          {/* Add view button */}
          <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
            <svg className="xs:hidden shrink-0 fill-current" width="16" height="16" viewBox="0 0 16 16">
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
            <span className="max-xs:sr-only">Add View</span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-12 gap-6">
        {/* Total Revenue */}
        <EcommerceCard01 />
        {/* Total Orders */}
        <EcommerceCard02 />
        {/* Average Order Value */}
        <EcommerceCard03 />
        {/* Revenue vs Refunds */}
        <EcommerceCard04 />
        {/* Sales Over Time */}
        <EcommerceCard05 />
        {/* Sales by Category */}
        <EcommerceCard06 />
        {/* Conversion Funnel */}
        <EcommerceCard07 />
        {/* Traffic Sources */}
        <EcommerceCard08 />
        {/* Top Products */}
        <EcommerceCard09 />
        {/* Recent Orders */}
        <EcommerceCard10 />
      </div>
    </div>
  );
}
