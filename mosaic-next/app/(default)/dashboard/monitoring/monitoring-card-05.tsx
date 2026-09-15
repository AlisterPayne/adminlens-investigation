"use client";

import { useEffect, useState } from "react";

import { chartAreaGradient } from "@/components/charts/chartjs-config";
import RealtimeChart from "@/components/charts/realtime-chart";
import Tooltip from "@/components/tooltip";
// Import utilities
import { adjustColorOpacity, getCssVariable } from "@/components/utils/utils";

export default function MonitoringCard05() {
  // IMPORTANT:
  // Code below is for demo purpose only, and it's not covered by support.
  // If you need to replace dummy data with real data,
  // refer to Chart.js documentation: https://www.chartjs.org/docs/latest

  // Fake real-time data
  const [counter, setCounter] = useState(0);
  const [increment, setIncrement] = useState(0);
  const [range, setRange] = useState(35);

  // Dummy memory usage data (%)
  const data = [
    61.2, 62.8, 63.5, 64.1, 65.4, 64.9, 63.7, 65.8, 67.2, 66.5, 65.1, 67.8, 68.4, 67.9, 69.3, 68.7, 70.1, 71.5, 72.0,
    70.8, 69.4, 68.2, 67.0, 68.6, 70.2, 71.6, 70.3, 68.9, 67.5, 66.3, 65.0, 63.6, 62.4, 64.2, 66.9, 68.5, 70.0, 69.2,
    67.6, 66.0, 64.6, 66.3, 68.8, 70.4, 71.9, 73.2, 72.5, 70.9, 69.2, 67.6, 66.1, 64.9, 63.5, 65.7, 68.0, 69.6, 71.1,
    70.3, 68.7,
  ];

  const [slicedData, setSlicedData] = useState(data.slice(0, range));

  // Generate fake dates from now to back in time
  const generateDates = (): Date[] => {
    const now: Date = new Date();
    const dates: Date[] = [];

    data.forEach((v: any, i: number) => {
      dates.push(new Date(now.getTime() - 2000 - i * 2000));
    });

    return dates;
  };

  const [slicedLabels, setSlicedLabels] = useState(generateDates().slice(0, range).reverse());

  // Fake update every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(counter + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [counter]);

  // Loop through data array and update
  useEffect(() => {
    setIncrement(increment + 1);
    if (increment + range < data.length) {
      setSlicedData(([x, ...slicedData]) => [...slicedData, data[increment + range]]);
    } else {
      setIncrement(0);
      setRange(0);
    }
    setSlicedLabels(([x, ...slicedLabels]) => [...slicedLabels, new Date()]);
    return () => setIncrement(0);
  }, [counter]);

  const chartData = {
    labels: slicedLabels,
    datasets: [
      {
        data: slicedData,
        fill: true,
        backgroundColor: function (context: any) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          const gradientOrColor = chartAreaGradient(ctx, chartArea, [
            { stop: 0, color: adjustColorOpacity(getCssVariable("--color-sky-500"), 0) },
            { stop: 1, color: adjustColorOpacity(getCssVariable("--color-sky-500"), 0.2) },
          ]);
          return gradientOrColor || "transparent";
        },
        borderColor: getCssVariable("--color-sky-500"),
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
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Memory Usage</h2>
        <Tooltip className="ml-2">
          <div className="text-center text-xs whitespace-nowrap">Heap + cache across cluster</div>
        </Tooltip>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <RealtimeChart data={chartData} width={595} height={248} />
    </div>
  );
}
