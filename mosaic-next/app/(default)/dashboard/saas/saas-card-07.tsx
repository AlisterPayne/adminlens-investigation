"use client";

import BarChart03 from "@/components/charts/bar-chart-03";
// Import utilities
import { getCssVariable } from "@/components/utils/utils";

export default function SaasCard07() {
  const chartData = {
    labels: ["08-01-2024", "09-01-2024", "10-01-2024", "11-01-2024", "12-01-2024", "01-01-2025"],
    datasets: [
      {
        label: "Pro",
        data: [18400, 19200, 20100, 21400, 22800, 24200],
        backgroundColor: getCssVariable("--color-violet-500"),
        hoverBackgroundColor: getCssVariable("--color-violet-600"),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
      {
        label: "Enterprise",
        data: [24600, 25800, 27200, 28900, 30400, 32100],
        backgroundColor: getCssVariable("--color-sky-500"),
        hoverBackgroundColor: getCssVariable("--color-sky-600"),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
      {
        label: "Add-ons",
        data: [4200, 4600, 5100, 5800, 6200, 6800],
        backgroundColor: getCssVariable("--color-green-500"),
        hoverBackgroundColor: getCssVariable("--color-green-600"),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="col-span-full flex flex-col rounded-xl bg-white shadow-sm xl:col-span-8 dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Revenue by Plan</h2>
      </header>
      {/* Chart built with Chart.js 3 */}
      <BarChart03 data={chartData} width={800} height={248} />
    </div>
  );
}
