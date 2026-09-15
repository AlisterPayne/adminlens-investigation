"use client";

import LineChart02 from "@/components/charts/line-chart-02";
// Import utilities
import { getCssVariable } from "@/components/utils/utils";

export default function MarketingCard08() {
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
        label: "Impressions",
        data: [
          124000, 132000, 141000, 148000, 156000, 164000, 172000, 181000, 189000, 198000, 206000, 215000, 224000,
          233000, 242000, 251000, 260000, 269000, 278000, 287000, 296000, 305000, 314000, 323000, 332000, 341000,
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
        label: "Clicks",
        data: [
          4200, 4480, 4760, 5020, 5280, 5540, 5820, 6120, 6420, 6720, 7020, 7340, 7660, 7980, 8320, 8660, 9000, 9360,
          9720, 10080, 10460, 10840, 11240, 11660, 12080, 12520,
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
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Campaign Performance</h2>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <LineChart02 data={chartData} width={595} height={248} />
    </div>
  );
}
