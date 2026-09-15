export const metadata = {
  title: "Support - Mosaic",
  description: "Page description",
};

import Datepicker from "@/components/datepicker";
import FilterButton from "@/components/dropdown-filter";

import SupportCard01 from "./support-card-01";
import SupportCard02 from "./support-card-02";
import SupportCard03 from "./support-card-03";
import SupportCard04 from "./support-card-04";
import SupportCard05 from "./support-card-05";
import SupportCard06 from "./support-card-06";
import SupportCard07 from "./support-card-07";
import SupportCard08 from "./support-card-08";
import SupportCard09 from "./support-card-09";
import SupportCard10 from "./support-card-10";
import SupportCard11 from "./support-card-11";

export default function Support() {
  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
      {/* Support actions */}
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Support</h1>
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
        <SupportCard01 />
        <SupportCard02 />
        <SupportCard03 />
        <SupportCard04 />
        <SupportCard05 />
        <SupportCard06 />
        <SupportCard07 />
        <SupportCard08 />
        <SupportCard09 />
        <SupportCard10 />
        <SupportCard11 />
      </div>
    </div>
  );
}
