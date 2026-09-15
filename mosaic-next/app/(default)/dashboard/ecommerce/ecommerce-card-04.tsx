"use client";

import BarChart01 from "@/components/charts/bar-chart-01";
// Import utilities
import { getCssVariable } from "@/components/utils/utils";

export default function EcommerceCard04() {
  const chartData = {
    labels: ["08-01-2024", "09-01-2024", "10-01-2024", "11-01-2024", "12-01-2024", "01-01-2025"],
    datasets: [
      {
        label: "Revenue",
        data: [98400, 101200, 104800, 108200, 112600, 115900],
        backgroundColor: getCssVariable("--color-violet-500"),
        hoverBackgroundColor: getCssVariable("--color-violet-600"),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
      {
        label: "Refunds",
        data: [4200, 3800, 5100, 4600, 5400, 4900],
        backgroundColor: getCssVariable("--color-red-500"),
        hoverBackgroundColor: getCssVariable("--color-red-600"),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="col-span-full flex flex-col rounded-xl bg-white shadow-sm sm:col-span-6 dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Revenue vs Refunds</h2>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <BarChart01 data={chartData} width={595} height={248} />
    </div>
  );
}
