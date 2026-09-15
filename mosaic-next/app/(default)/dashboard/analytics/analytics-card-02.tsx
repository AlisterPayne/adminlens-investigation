"use client";

import Link from "next/link";

import { chartAreaGradient } from "@/components/charts/chartjs-config";
import LineChart04 from "@/components/charts/line-chart-04";
// Import utilities
import { adjustColorOpacity, getCssVariable } from "@/components/utils/utils";

export default function AnalyticsCard02() {
  const chartData = {
    labels: [
      "12-01-2022",
      "01-01-2023",
      "02-01-2023",
      "03-01-2023",
      "04-01-2023",
      "05-01-2023",
      "06-01-2023",
      "07-01-2023",
      "08-01-2023",
      "09-01-2023",
      "10-01-2023",
      "11-01-2023",
      "12-01-2023",
      "01-01-2024",
      "02-01-2024",
      "03-01-2024",
      "04-01-2024",
      "05-01-2024",
      "06-01-2024",
      "07-01-2024",
      "08-01-2024",
      "09-01-2024",
      "10-01-2024",
      "11-01-2024",
      "12-01-2024",
      "01-01-2025",
    ],
    datasets: [
      // Indigo line
      {
        data: [
          732, 610, 610, 504, 504, 504, 349, 349, 504, 342, 504, 610, 391, 192, 154, 273, 191, 191, 126, 263, 349, 252,
          423, 622, 470, 532,
        ],
        fill: true,
        backgroundColor: function (context: any) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          const gradientOrColor = chartAreaGradient(ctx, chartArea, [
            { stop: 0, color: adjustColorOpacity(getCssVariable("--color-violet-500"), 0) },
            { stop: 1, color: adjustColorOpacity(getCssVariable("--color-violet-500"), 0.2) },
          ]);
          return gradientOrColor || "transparent";
        },
        borderColor: getCssVariable("--color-violet-500"),
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: getCssVariable("--color-violet-500"),
        pointHoverBackgroundColor: getCssVariable("--color-violet-500"),
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        clip: 20,
        tension: 0.2,
      },
    ],
  };

  return (
    <div className="col-span-full flex flex-col rounded-xl bg-white shadow-sm xl:col-span-4 dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Active Users Right Now</h2>
      </header>
      {/* Card content */}
      <div className="flex h-full flex-col">
        {/* Live visitors number */}
        <div className="px-5 py-3">
          <div className="flex items-center">
            {/* Red dot */}
            <div className="relative mr-3 flex h-3 w-3 items-center justify-center" aria-hidden="true">
              <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-50"></div>
              <div className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500"></div>
            </div>
            {/* Vistors number */}
            <div>
              <div className="mr-2 text-3xl font-bold text-gray-800 dark:text-gray-100">347</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Live visitors</div>
            </div>
          </div>
        </div>

        {/* Chart built with Chart.js 3 */}
        <div>
          {/* Change the height attribute to adjust the chart height */}
          <LineChart04 data={chartData} width={389} height={70} />
        </div>

        {/* Table */}
        <div className="grow px-5 pt-3 pb-1">
          <div className="overflow-x-auto">
            <table className="w-full table-auto dark:text-gray-300">
              {/* Table header */}
              <thead className="text-xs text-gray-400 uppercase dark:text-gray-500">
                <tr>
                  <th className="py-2">
                    <div className="text-left font-semibold">Top pages</div>
                  </th>
                  <th className="py-2">
                    <div className="text-right font-semibold">Active users</div>
                  </th>
                </tr>
              </thead>
              {/* Table body */}
              <tbody className="divide-y divide-gray-100 text-sm dark:divide-gray-700/60">
                {/* Row */}
                <tr>
                  <td className="py-2">
                    <div className="text-left">preview.cruip.com/open-pro/</div>
                  </td>
                  <td className="py-2">
                    <div className="text-right font-medium text-gray-800">94</div>
                  </td>
                </tr>
                {/* Row */}
                <tr>
                  <td className="py-2">
                    <div className="text-left">preview.cruip.com/simple/</div>
                  </td>
                  <td className="py-2">
                    <div className="text-right font-medium text-gray-800">42</div>
                  </td>
                </tr>
                {/* Row */}
                <tr>
                  <td className="py-2">
                    <div className="text-left">cruip.com/unlimited/</div>
                  </td>
                  <td className="py-2">
                    <div className="text-right font-medium text-gray-800">12</div>
                  </td>
                </tr>
                {/* Row */}
                <tr>
                  <td className="py-2">
                    <div className="text-left">preview.cruip.com/twist/</div>
                  </td>
                  <td className="py-2">
                    <div className="text-right font-medium text-gray-800">4</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Card footer */}
        <div className="px-5 pb-4 text-right">
          <Link
            className="text-sm font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
            href="#0"
          >
            Real-Time Report -&gt;
          </Link>
        </div>
      </div>
    </div>
  );
}
