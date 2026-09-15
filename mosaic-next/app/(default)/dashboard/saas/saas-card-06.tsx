"use client";

import DoughnutChart from "@/components/charts/doughnut-chart";
// Import utilities
import { getCssVariable } from "@/components/utils/utils";

export default function SaasCard06() {
  const chartData = {
    labels: ["Free", "Pro", "Enterprise"],
    datasets: [
      {
        label: "Plan Distribution",
        data: [45, 35, 20],
        backgroundColor: [
          getCssVariable("--color-gray-400"),
          getCssVariable("--color-violet-500"),
          getCssVariable("--color-sky-500"),
        ],
        hoverBackgroundColor: [
          getCssVariable("--color-gray-500"),
          getCssVariable("--color-violet-600"),
          getCssVariable("--color-sky-600"),
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="col-span-full flex flex-col rounded-xl bg-white shadow-sm sm:col-span-6 xl:col-span-4 dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Plan Distribution</h2>
      </header>
      {/* Chart built with Chart.js 3 */}
      <DoughnutChart data={chartData} width={389} height={260} />
    </div>
  );
}
