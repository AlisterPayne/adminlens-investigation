"use client";

import LineChart02 from "@/components/charts/line-chart-02";
// Import utilities
import { getCssVariable } from "@/components/utils/utils";

export default function SupportCard08() {
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
          18.4, 17.8, 17.2, 16.6, 16.0, 15.4, 14.8, 14.2, 13.6, 13.0, 12.4, 11.8, 11.2, 10.6, 10.0, 9.4, 8.8, 8.2, 7.6,
          7.0, 6.4, 5.8, 5.2, 4.6, 4.0, 3.4,
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
          22.0, 21.4, 20.8, 20.2, 19.6, 19.0, 18.4, 17.8, 17.2, 16.6, 16.0, 15.4, 14.8, 14.2, 13.6, 13.0, 12.4, 11.8,
          11.2, 10.6, 10.0, 9.4, 8.8, 8.2, 7.6, 7.0,
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
      {
        label: "Target",
        data: [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
        borderColor: getCssVariable("--color-green-500"),
        fill: false,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: getCssVariable("--color-green-500"),
        pointHoverBackgroundColor: getCssVariable("--color-green-500"),
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
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Resolution Time Trend</h2>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <LineChart02 data={chartData} width={595} height={248} />
    </div>
  );
}
