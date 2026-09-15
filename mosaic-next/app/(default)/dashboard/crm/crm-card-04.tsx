"use client";

import BarChart02 from "@/components/charts/bar-chart-02";
// Import utilities
import { getCssVariable } from "@/components/utils/utils";

export default function CrmCard04() {
  const chartData = {
    labels: ["12-01-2022", "01-01-2023", "02-01-2023", "03-01-2023", "04-01-2023", "05-01-2023"],
    datasets: [
      {
        label: "Lead",
        data: [420, 380, 450, 410, 390, 460],
        backgroundColor: getCssVariable("--color-violet-200"),
        hoverBackgroundColor: getCssVariable("--color-violet-300"),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
      {
        label: "Qualified",
        data: [280, 310, 290, 320, 340, 300],
        backgroundColor: getCssVariable("--color-sky-500"),
        hoverBackgroundColor: getCssVariable("--color-sky-600"),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
      {
        label: "Proposal",
        data: [180, 200, 190, 210, 220, 195],
        backgroundColor: getCssVariable("--color-violet-500"),
        hoverBackgroundColor: getCssVariable("--color-violet-600"),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
      {
        label: "Won",
        data: [95, 110, 105, 120, 115, 130],
        backgroundColor: getCssVariable("--color-green-500"),
        hoverBackgroundColor: getCssVariable("--color-green-600"),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="col-span-full flex flex-col rounded-xl bg-white shadow-sm sm:col-span-6 dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Pipeline by Stage</h2>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <div className="grow">
        <BarChart02 data={chartData} width={595} height={248} />
      </div>
    </div>
  );
}
