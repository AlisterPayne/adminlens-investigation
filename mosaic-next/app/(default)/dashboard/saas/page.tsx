export const metadata = {
  title: "SaaS - Mosaic",
  description: "Page description",
};

import Datepicker from "@/components/datepicker";
import FilterButton from "@/components/dropdown-filter";

import SaasCard01 from "./saas-card-01";
import SaasCard02 from "./saas-card-02";
import SaasCard03 from "./saas-card-03";
import SaasCard04 from "./saas-card-04";
import SaasCard05 from "./saas-card-05";
import SaasCard06 from "./saas-card-06";
import SaasCard07 from "./saas-card-07";
import SaasCard08 from "./saas-card-08";
import SaasCard09 from "./saas-card-09";
import SaasCard10 from "./saas-card-10";

export default function Saas() {
  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
      {/* Dashboard actions */}
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">SaaS</h1>
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
        {/* Line chart (Monthly Recurring Revenue) */}
        <SaasCard01 />
        {/* Line chart (Annual Run Rate) */}
        <SaasCard02 />
        {/* Line chart (Active Subscriptions) */}
        <SaasCard03 />
        {/* Bar chart (New vs Churned Subscribers) */}
        <SaasCard04 />
        {/* Line chart (Churn Rate) */}
        <SaasCard05 />
        {/* Doughnut chart (Plan Distribution) */}
        <SaasCard06 />
        {/* Stacked bar chart (Revenue by Plan) */}
        <SaasCard07 />
        {/* Line chart (ARPU / LTV Trend) */}
        <SaasCard08 />
        {/* Bar chart (MRR Movement) */}
        <SaasCard09 />
        {/* Table (Recent Signups) */}
        <SaasCard10 />
      </div>
    </div>
  );
}
