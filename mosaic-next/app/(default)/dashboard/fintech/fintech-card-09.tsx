"use client";

import PieChart from "@/components/charts/pie-chart";
// Import utilities
import { getCssVariable } from "@/components/utils/utils";

export default function FintechCard09() {
  const chartData = {
    labels: ["Cash", "Commodities", "Bonds", "Stock"],
    datasets: [
      {
        label: "Sessions By Device",
        data: [12, 13, 10, 65],
        backgroundColor: [
          getCssVariable("--color-green-400"),
          getCssVariable("--color-yellow-400"),
          getCssVariable("--color-sky-500"),
          getCssVariable("--color-violet-500"),
        ],
        hoverBackgroundColor: [
          getCssVariable("--color-green-500"),
          getCssVariable("--color-yellow-500"),
          getCssVariable("--color-sky-600"),
          getCssVariable("--color-violet-600"),
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="col-span-full flex flex-col rounded-xl bg-white shadow-sm sm:col-span-6 xl:col-span-4 dark:bg-gray-800">
      <header className="flex items-center border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Portfolio Value</h2>
      </header>
      <div className="px-5 py-3">
        <div className="mb-2 text-sm italic">Hey Mark, here is the value of your portfolio:</div>
        <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">$224,807.27</div>
      </div>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <PieChart data={chartData} width={389} height={220} />
    </div>
  );
}
