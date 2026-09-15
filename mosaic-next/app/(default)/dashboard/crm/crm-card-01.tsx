"use client";

import { chartAreaGradient } from "@/components/charts/chartjs-config";
import LineChart01 from "@/components/charts/line-chart-01";
import EditMenu from "@/components/edit-menu";
// Import utilities
import { adjustColorOpacity, getCssVariable } from "@/components/utils/utils";

export default function CrmCard01() {
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
          420, 380, 410, 390, 450, 480, 520, 510, 540, 560, 590, 620, 640, 680, 710, 730, 760, 790, 820, 850, 880, 910,
          940, 970, 1020, 1080,
        ],
        fill: true,
        backgroundColor: function (context: any) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          const gradientOrColor = chartAreaGradient(ctx, chartArea, [
            { stop: 0, color: adjustColorOpacity(getCssVariable("--color-violet-500"), 0) },
            { stop: 1, color: adjustColorOpacity(getCssVariable("--color-violet-500"), 0.2) },
          ]);
          return gradientOrColor || "transparent";
        },
        borderColor: getCssVariable("--color-violet-500"),
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
        data: [
          380, 360, 370, 350, 390, 410, 430, 420, 440, 460, 480, 500, 520, 540, 560, 580, 600, 620, 640, 660, 680, 700,
          720, 740, 760, 780,
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
          <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">Total Revenue</h2>
          {/* Menu button */}
          <EditMenu align="right" />
        </header>
        <div className="mb-1 text-xs font-semibold text-gray-400 uppercase dark:text-gray-500">This Quarter</div>
        <div className="flex items-start">
          <div className="mr-2 text-3xl font-bold text-gray-800 dark:text-gray-100">$1.24M</div>
          <div className="rounded-full bg-green-500/20 px-1.5 text-sm font-medium text-green-700">+18%</div>
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
