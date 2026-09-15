"use client";

import { useEffect, useState } from "react";

import { chartAreaGradient } from "@/components/charts/chartjs-config";
import RealtimeChart from "@/components/charts/realtime-chart";
import Tooltip from "@/components/tooltip";
// Import utilities
import { adjustColorOpacity, getCssVariable } from "@/components/utils/utils";

export default function MonitoringCard04() {
  // IMPORTANT:
  // Code below is for demo purpose only, and it's not covered by support.
  // If you need to replace dummy data with real data,
  // refer to Chart.js documentation: https://www.chartjs.org/docs/latest

  // Fake real-time data
  const [counter, setCounter] = useState(0);
  const [increment, setIncrement] = useState(0);
  const [range, setRange] = useState(35);

  // Dummy CPU usage data (%)
  const data = [
    42.1, 44.5, 43.2, 46.8, 48.3, 47.1, 45.6, 49.2, 51.4, 50.8, 48.9, 52.3, 54.1, 53.6, 55.2, 54.8, 56.4, 57.9, 58.3,
    56.7, 55.1, 53.8, 52.4, 54.6, 56.2, 57.5, 55.9, 54.3, 52.8, 51.6, 50.2, 48.7, 47.3, 49.1, 51.8, 53.4, 55.0, 54.2,
    52.6, 50.9, 49.5, 51.2, 53.7, 55.3, 56.8, 58.1, 57.4, 55.8, 54.1, 52.5, 51.0, 49.8, 48.4, 50.6, 52.9, 54.5, 56.0,
    55.2, 53.6,
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
      <header className="flex items-center border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">CPU Usage</h2>
        <Tooltip className="ml-2">
          <div className="text-center text-xs whitespace-nowrap">Average across all nodes</div>
        </Tooltip>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <RealtimeChart data={chartData} width={595} height={248} />
    </div>
  );
}
