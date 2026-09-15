"use client";

import { chartAreaGradient } from "@/components/charts/chartjs-config";
import LineChart01 from "@/components/charts/line-chart-01";
// Import utilities
import { adjustColorOpacity, getCssVariable } from "@/components/utils/utils";

export default function ProjectsCard09() {
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
          6.5, 7.2, 8.0, 7.5, 6.0, 7.8, 8.5, 8.2, 7.9, 6.5, 8.0, 8.8, 9.2, 8.5, 7.0, 8.5, 9.0, 9.5, 8.8, 7.5, 9.0, 9.5,
          10.0, 9.2, 8.0, 9.8,
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
    ],
  };

  return (
    <div className="col-span-full flex flex-col rounded-xl bg-white shadow-sm sm:col-span-6 dark:bg-gray-800">
      <header className="border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Hours Logged</h2>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <div className="grow">
        <LineChart01 data={chartData} width={595} height={248} />
      </div>
    </div>
  );
}
