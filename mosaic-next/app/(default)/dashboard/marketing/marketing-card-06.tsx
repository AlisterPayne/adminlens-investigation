"use client";

import DoughnutChart from "@/components/charts/doughnut-chart";
// Import utilities
import { getCssVariable } from "@/components/utils/utils";

export default function MarketingCard06() {
  const chartData = {
    labels: ["Paid Search", "Social", "Email", "Display", "Referral"],
    datasets: [
      {
        label: "Channel Mix",
        data: [38, 28, 14, 12, 8],
        backgroundColor: [
          getCssVariable("--color-violet-500"),
          getCssVariable("--color-sky-500"),
          getCssVariable("--color-green-500"),
          getCssVariable("--color-violet-300"),
          getCssVariable("--color-violet-800"),
        ],
        hoverBackgroundColor: [
          getCssVariable("--color-violet-600"),
          getCssVariable("--color-sky-600"),
          getCssVariable("--color-green-600"),
          getCssVariable("--color-violet-400"),
          getCssVariable("--color-violet-900"),
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="col-span-full flex flex-col rounded-xl bg-white shadow-sm sm:col-span-6 dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Channel Mix</h2>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <DoughnutChart data={chartData} width={389} height={260} />
    </div>
  );
}
