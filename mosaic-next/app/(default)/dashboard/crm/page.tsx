export const metadata = {
  title: "CRM - Mosaic",
  description: "Page description",
};

import Datepicker from "@/components/datepicker";
import FilterButton from "@/components/dropdown-filter";

import CrmCard01 from "./crm-card-01";
import CrmCard02 from "./crm-card-02";
import CrmCard03 from "./crm-card-03";
import CrmCard04 from "./crm-card-04";
import CrmCard05 from "./crm-card-05";
import CrmCard06 from "./crm-card-06";
import CrmCard07 from "./crm-card-07";
import CrmCard08 from "./crm-card-08";
import CrmCard09 from "./crm-card-09";
import CrmCard10 from "./crm-card-10";

export default function Crm() {
  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
      {/* Dashboard actions */}
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">CRM</h1>
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
        <CrmCard01 />
        <CrmCard02 />
        <CrmCard03 />
        <CrmCard04 />
        <CrmCard05 />
        <CrmCard06 />
        <CrmCard07 />
        <CrmCard08 />
        <CrmCard09 />
        <CrmCard10 />
      </div>
    </div>
  );
}
