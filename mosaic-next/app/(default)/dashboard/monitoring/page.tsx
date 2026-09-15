export const metadata = {
  title: "Monitoring - Mosaic",
  description: "Page description",
};

import Datepicker from "@/components/datepicker";
import FilterButton from "@/components/dropdown-filter";

import MonitoringCard01 from "./monitoring-card-01";
import MonitoringCard02 from "./monitoring-card-02";
import MonitoringCard03 from "./monitoring-card-03";
import MonitoringCard04 from "./monitoring-card-04";
import MonitoringCard05 from "./monitoring-card-05";
import MonitoringCard06 from "./monitoring-card-06";
import MonitoringCard07 from "./monitoring-card-07";
import MonitoringCard08 from "./monitoring-card-08";
import MonitoringCard09 from "./monitoring-card-09";

export default function Monitoring() {
  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
      {/* Dashboard actions */}
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Monitoring</h1>
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
        {/* Uptime % */}
        <MonitoringCard01 />
        {/* Requests / min */}
        <MonitoringCard02 />
        {/* Error Rate % */}
        <MonitoringCard03 />
        {/* CPU Usage */}
        <MonitoringCard04 />
        {/* Memory Usage */}
        <MonitoringCard05 />
        {/* Requests by Status Code */}
        <MonitoringCard06 />
        {/* Response Latency */}
        <MonitoringCard07 />
        {/* Traffic by Region */}
        <MonitoringCard08 />
        {/* Bandwidth Usage */}
        <MonitoringCard09 />
      </div>
    </div>
  );
}
