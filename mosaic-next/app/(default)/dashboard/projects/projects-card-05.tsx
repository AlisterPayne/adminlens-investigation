"use client";

import LineChart02 from "@/components/charts/line-chart-02";
// Import utilities
import { getCssVariable } from "@/components/utils/utils";

export default function ProjectsCard05() {
  const chartData = {
    labels: [
      "12-01-2022",
      "01-01-2023",
      "02-01-2023",
      "03-01-2023",
      "04-01-2023",
      "05-01-2023",
      "06-01-2023",
      "07-01-2023",
      "08-01-2023",
      "09-01-2023",
    ],
    datasets: [
      {
        label: "Remaining",
        data: [48, 44, 40, 38, 34, 30, 28, 24, 20, 16],
        borderColor: getCssVariable("--color-violet-500"),
        fill: false,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: getCssVariable("--color-violet-500"),
        pointHoverBackgroundColor: getCssVariable("--color-violet-500"),
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        clip: 20,
        tension: 0.2,
      },
      {
        label: "Ideal",
        data: [48, 43, 38, 33, 28, 23, 18, 13, 8, 0],
        borderColor: getCssVariable("--color-gray-400"),
        fill: false,
        borderWidth: 2,
        borderDash: [4, 4],
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: getCssVariable("--color-gray-400"),
        pointHoverBackgroundColor: getCssVariable("--color-gray-400"),
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
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Sprint Burndown</h2>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <LineChart02 data={chartData} width={595} height={248} />
    </div>
  );
}
