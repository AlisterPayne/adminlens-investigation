"use client";

import BarChart02 from "@/components/charts/bar-chart-02";
// Import utilities
import { getCssVariable } from "@/components/utils/utils";

export default function SaasCard09() {
  const chartData = {
    labels: ["08-01-2024", "09-01-2024", "10-01-2024", "11-01-2024", "12-01-2024", "01-01-2025"],
    datasets: [
      {
        label: "Expansion",
        data: [8200, 9400, 8800, 10200, 9600, 11400],
        backgroundColor: getCssVariable("--color-green-500"),
        hoverBackgroundColor: getCssVariable("--color-green-600"),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
      {
        label: "Contraction",
        data: [-3200, -2800, -3600, -2400, -3100, -2200],
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
      <header className="flex items-center border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">MRR Movement</h2>
      </header>
      <div className="px-5 py-3">
        <div className="flex items-start">
          <div className="mr-2 text-3xl font-bold text-gray-800 dark:text-gray-100">+$9,200</div>
          <div className="rounded-full bg-green-500/20 px-1.5 text-sm font-medium text-green-700">+18%</div>
        </div>
      </div>
      {/* Chart built with Chart.js 3 */}
      <div className="grow">
        <BarChart02 data={chartData} width={595} height={248} />
      </div>
    </div>
  );
}
