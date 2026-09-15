"use client";

import { chartAreaGradient } from "@/components/charts/chartjs-config";
import LineChart01 from "@/components/charts/line-chart-01";
import EditMenu from "@/components/edit-menu";
// Import utilities
import { adjustColorOpacity, getCssVariable } from "@/components/utils/utils";

export default function MonitoringCard03() {
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
          0.42, 0.38, 0.35, 0.41, 0.33, 0.36, 0.39, 0.31, 0.28, 0.34, 0.3, 0.27, 0.32, 0.29, 0.35, 0.31, 0.28, 0.33,
          0.26, 0.24, 0.27, 0.23, 0.21, 0.25, 0.22, 0.18,
        ],
        fill: true,
        backgroundColor: function (context: any) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          const gradientOrColor = chartAreaGradient(ctx, chartArea, [
            { stop: 0, color: adjustColorOpacity(getCssVariable("--color-red-500"), 0) },
            { stop: 1, color: adjustColorOpacity(getCssVariable("--color-red-500"), 0.2) },
          ]);
          return gradientOrColor || "transparent";
        },
        borderColor: getCssVariable("--color-red-500"),
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: getCssVariable("--color-red-500"),
        pointHoverBackgroundColor: getCssVariable("--color-red-500"),
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        clip: 20,
        tension: 0.2,
      },
      {
        data: [
          0.58, 0.52, 0.48, 0.55, 0.47, 0.5, 0.53, 0.45, 0.42, 0.48, 0.44, 0.4, 0.46, 0.43, 0.49, 0.45, 0.41, 0.47,
          0.39, 0.36, 0.4, 0.35, 0.32, 0.38, 0.34, 0.29,
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
          <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">Error Rate</h2>
          {/* Menu button */}
          <EditMenu align="right" />
        </header>
        <div className="mb-1 text-xs font-semibold text-gray-400 uppercase dark:text-gray-500">5xx + 4xx</div>
        <div className="flex items-start">
          <div className="mr-2 text-3xl font-bold text-gray-800 dark:text-gray-100">0.18%</div>
          <div className="rounded-full bg-green-500/20 px-1.5 text-sm font-medium text-green-700">-0.04%</div>
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
