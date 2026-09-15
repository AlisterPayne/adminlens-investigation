"use client";

import LineChart03 from "@/components/charts/line-chart-03";
// Import utilities
import { getCssVariable } from "@/components/utils/utils";

export default function SaasCard05() {
  const chartData = {
    labels: ["08-01-2024", "09-01-2024", "10-01-2024", "11-01-2024", "12-01-2024", "01-01-2025"],
    datasets: [
      {
        label: "Churn Rate",
        data: [4.8, 4.2, 3.9, 3.4, 2.8, 2.1],
        borderColor: getCssVariable("--color-red-500"),
        fill: false,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: getCssVariable("--color-red-500"),
        pointHoverBackgroundColor: getCssVariable("--color-red-500"),
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        clip: 20,
        tension: 0.2,
      },
    ],
  };

  return (
    <div className="col-span-full flex flex-col rounded-xl bg-white shadow-sm sm:col-span-6 dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Churn Rate</h2>
      </header>
      <div className="px-5 py-3">
        <div className="flex items-start">
          <div className="mr-2 text-3xl font-bold text-gray-800 dark:text-gray-100">2.1%</div>
          <div className="rounded-full bg-green-500/20 px-1.5 text-sm font-medium text-green-700">-56%</div>
        </div>
      </div>
      {/* Chart built with Chart.js 3 */}
      <div className="grow">
        <LineChart03 data={chartData} width={595} height={248} />
      </div>
    </div>
  );
}
