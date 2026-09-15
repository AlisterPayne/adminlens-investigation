"use client";

import { chartAreaGradient } from "@/components/charts/chartjs-config";
import LineChart01 from "@/components/charts/line-chart-01";
import EditMenu from "@/components/edit-menu";
// Import utilities
import { adjustColorOpacity, getCssVariable } from "@/components/utils/utils";

export default function EcommerceCard03() {
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
        data: [
          58.2, 59.1, 58.8, 60.4, 61.2, 60.8, 62.1, 63.4, 62.8, 64.2, 65.1, 65.8, 66.4, 65.9, 66.8, 67.4, 68.2, 67.6,
          68.9, 69.4, 70.1, 69.8, 70.6, 71.2, 72.0, 72.4,
        ],
        fill: true,
        backgroundColor: function (context: any) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          const gradientOrColor = chartAreaGradient(ctx, chartArea, [
            { stop: 0, color: adjustColorOpacity(getCssVariable("--color-green-500"), 0) },
            { stop: 1, color: adjustColorOpacity(getCssVariable("--color-green-500"), 0.2) },
          ]);
          return gradientOrColor || "transparent";
        },
        borderColor: getCssVariable("--color-green-500"),
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
      {
        data: [
          54.8, 55.2, 55.0, 56.1, 56.8, 56.4, 57.2, 57.9, 57.6, 58.4, 59.0, 59.4, 60.1, 59.8, 60.4, 60.9, 61.4, 61.1,
          61.8, 62.2, 62.8, 62.5, 63.1, 63.6, 64.2, 64.6,
        ],
        borderColor: adjustColorOpacity(getCssVariable("--color-gray-500"), 0.25),
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: adjustColorOpacity(getCssVariable("--color-gray-500"), 0.25),
        pointHoverBackgroundColor: adjustColorOpacity(getCssVariable("--color-gray-500"), 0.25),
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        clip: 20,
        tension: 0.2,
      },
    ],
  };

  return (
    <div className="col-span-full flex flex-col rounded-xl bg-white shadow-sm sm:col-span-6 xl:col-span-4 dark:bg-gray-800">
      <div className="px-5 pt-5">
        <header className="mb-2 flex items-start justify-between">
          <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">Average Order Value</h2>
          {/* Menu button */}
          <EditMenu align="right" />
        </header>
        <div className="mb-1 text-xs font-semibold text-gray-400 uppercase dark:text-gray-500">AOV</div>
        <div className="flex items-start">
          <div className="mr-2 text-3xl font-bold text-gray-800 dark:text-gray-100">$68.02</div>
          <div className="rounded-full bg-green-500/20 px-1.5 text-sm font-medium text-green-700">+4%</div>
        </div>
      </div>
      {/* Chart built with Chart.js 3 */}
      <div className="grow max-sm:max-h-[128px] xl:max-h-[128px]">
        {/* Change the height attribute to adjust the chart height */}
        <LineChart01 data={chartData} width={389} height={128} />
      </div>
    </div>
  );
}
