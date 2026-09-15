"use client";

import BarChart01 from "@/components/charts/bar-chart-01";
// Import utilities
import { getCssVariable } from "@/components/utils/utils";

export default function ProjectsCard04() {
  const chartData = {
    labels: ["12-01-2022", "01-01-2023", "02-01-2023", "03-01-2023", "04-01-2023", "05-01-2023"],
    datasets: [
      {
        label: "To Do",
        data: [42, 38, 35, 40, 32, 28],
        backgroundColor: getCssVariable("--color-gray-400"),
        hoverBackgroundColor: getCssVariable("--color-gray-500"),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
      {
        label: "In Progress",
        data: [28, 32, 36, 34, 38, 35],
        backgroundColor: getCssVariable("--color-sky-500"),
        hoverBackgroundColor: getCssVariable("--color-sky-600"),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
      {
        label: "Done",
        data: [18, 24, 28, 32, 36, 42],
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
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Tasks by Status</h2>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <BarChart01 data={chartData} width={595} height={248} />
    </div>
  );
}
