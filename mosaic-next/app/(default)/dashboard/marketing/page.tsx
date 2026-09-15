export const metadata = {
  title: "Marketing - Mosaic",
  description: "Page description",
};

import Datepicker from "@/components/datepicker";
import FilterButton from "@/components/dropdown-filter";

import MarketingCard01 from "./marketing-card-01";
import MarketingCard02 from "./marketing-card-02";
import MarketingCard03 from "./marketing-card-03";
import MarketingCard04 from "./marketing-card-04";
import MarketingCard05 from "./marketing-card-05";
import MarketingCard06 from "./marketing-card-06";
import MarketingCard07 from "./marketing-card-07";
import MarketingCard08 from "./marketing-card-08";
import MarketingCard09 from "./marketing-card-09";
import MarketingCard10 from "./marketing-card-10";

export default function Marketing() {
  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
      {/* Dashboard actions */}
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Marketing</h1>
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
        {/* Line chart (Ad Spend) */}
        <MarketingCard01 />
        {/* Line chart (Conversions) */}
        <MarketingCard02 />
        {/* Line chart (ROAS) */}
        <MarketingCard03 />
        {/* Bar chart (Spend vs Conversions by Channel) */}
        <MarketingCard04 />
        {/* Line chart (CPA Trend) */}
        <MarketingCard05 />
        {/* Doughnut chart (Channel Mix) */}
        <MarketingCard06 />
        {/* Bar chart (Email Open & Click Rates) */}
        <MarketingCard07 />
        {/* Line chart (Campaign Performance) */}
        <MarketingCard08 />
        {/* Polar chart (Audience by Device) */}
        <MarketingCard09 />
        {/* Table (Top Campaigns) */}
        <MarketingCard10 />
      </div>
    </div>
  );
}
