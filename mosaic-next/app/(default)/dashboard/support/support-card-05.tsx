"use client";

import LineChart02 from "@/components/charts/line-chart-02";
// Import utilities
import { getCssVariable } from "@/components/utils/utils";

export default function SupportCard05() {
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
      "10-01-2023",
      "11-01-2023",
      "12-01-2023",
      "01-01-2024",
      "02-01-2024",
      "03-01-2024",
      "04-01-2024",
      "05-01-2024",
      "06-01-2024",
      "07-01-2024",
      "08-01-2024",
      "09-01-2024",
      "10-01-2024",
      "11-01-2024",
      "12-01-2024",
      "01-01-2025",
    ],
    datasets: [
      {
        label: "Current",
        data: [
          320, 342, 358, 372, 388, 402, 418, 432, 448, 462, 478, 492, 508, 522, 538, 552, 568, 582, 598, 612, 628, 642,
          658, 672, 688, 704,
        ],
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
        label: "Previous",
        data: [
          280, 298, 312, 328, 342, 356, 368, 382, 396, 408, 422, 436, 448, 462, 476, 488, 502, 516, 528, 542, 556, 568,
          582, 596, 608, 622,
        ],
        borderColor: getCssVariable("--color-sky-500"),
        fill: false,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: getCssVariable("--color-sky-500"),
        pointHoverBackgroundColor: getCssVariable("--color-sky-500"),
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        clip: 20,
        tension: 0.2,
      },
    ],
  };

  return (
    <div className="col-span-full flex flex-col rounded-xl bg-white shadow-sm sm:col-span-6 dark:bg-gray-800">
      <header className="flex items-center border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Ticket Volume Over Time</h2>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <LineChart02 data={chartData} width={595} height={248} />
    </div>
  );
}
