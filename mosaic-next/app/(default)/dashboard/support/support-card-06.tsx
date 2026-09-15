"use client";

import DoughnutChart from "@/components/charts/doughnut-chart";
// Import utilities
import { getCssVariable } from "@/components/utils/utils";

export default function SupportCard06() {
  const chartData = {
    labels: ["Billing", "Technical", "Account", "Other"],
    datasets: [
      {
        label: "Tickets by Category",
        data: [28, 42, 18, 12],
        backgroundColor: [
          getCssVariable("--color-violet-500"),
          getCssVariable("--color-sky-500"),
          getCssVariable("--color-green-500"),
          getCssVariable("--color-violet-800"),
        ],
        hoverBackgroundColor: [
          getCssVariable("--color-violet-600"),
          getCssVariable("--color-sky-600"),
          getCssVariable("--color-green-600"),
          getCssVariable("--color-violet-900"),
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="col-span-full flex flex-col rounded-xl bg-white shadow-sm sm:col-span-6 dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Tickets by Category</h2>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <DoughnutChart data={chartData} width={595} height={260} />
    </div>
  );
}
