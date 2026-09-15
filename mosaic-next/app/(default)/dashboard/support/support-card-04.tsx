"use client";

import BarChart01 from "@/components/charts/bar-chart-01";
// Import utilities
import { getCssVariable } from "@/components/utils/utils";

export default function SupportCard04() {
  const chartData = {
    labels: ["12-01-2022", "01-01-2023", "02-01-2023", "03-01-2023", "04-01-2023", "05-01-2023"],
    datasets: [
      {
        label: "Created",
        data: [86, 92, 78, 104, 98, 64],
        backgroundColor: getCssVariable("--color-sky-500"),
        hoverBackgroundColor: getCssVariable("--color-sky-600"),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
      {
        label: "Resolved",
        data: [72, 88, 82, 96, 102, 58],
        backgroundColor: getCssVariable("--color-violet-500"),
        hoverBackgroundColor: getCssVariable("--color-violet-600"),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="col-span-full flex flex-col rounded-xl bg-white shadow-sm sm:col-span-6 dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Created vs Resolved</h2>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <BarChart01 data={chartData} width={595} height={248} />
    </div>
  );
}
