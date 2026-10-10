"use client";

import "chartjs-adapter-moment";

import type { ChartData } from "chart.js";
import {
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  TimeScale,
  Tooltip,
} from "chart.js";
import { useTheme } from "next-themes";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { chartColors } from "@/components/charts/chartjs-config";

Chart.register(LineController, LineElement, Filler, PointElement, LinearScale, TimeScale, Tooltip, Legend);

export interface DailyTimelineItem {
  date: string;
  total: number;
  workspace: number;
  notebook: number;
  agentic: number;
  userInitiated: number;
}

interface GenAiTimelineChartProps {
  timeline: DailyTimelineItem[];
}

export default function GenAiTimelineChart({ timeline = [] }: GenAiTimelineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [metricView, setMetricView] = useState<"platform" | "execution">("platform");
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const { textColor, gridColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor, tooltipTitleColor } =
    chartColors;

  // Aggregate summary metrics
  const summary = useMemo(() => {
    let userInitiated = 0;
    let agentic = 0;
    let workspace = 0;
    let notebook = 0;
    let peak = { date: "", total: 0 };

    for (const d of timeline) {
      userInitiated += d.userInitiated || 0;
      agentic += d.agentic || 0;
      workspace += d.workspace || 0;
      notebook += d.notebook || 0;
      if (d.total > peak.total) {
        peak = { date: d.date, total: d.total };
      }
    }
    const total = userInitiated + agentic;
    return { userInitiated, agentic, workspace, notebook, total, peak };
  }, [timeline]);

  // Build ChartData
  const chartData: ChartData<"line"> = useMemo(() => {
    const labels = timeline.map((d) => d.date);

    if (metricView === "platform") {
      // Platform view: Workspace Apps vs Gemini Notebook
      return {
        labels,
        datasets: [
          {
            label: "Workspace Apps",
            data: timeline.map((d) => d.workspace),
            borderColor: "#4f46e5", // Indigo 600 (richer, more visible)
            backgroundColor: "rgba(79, 70, 229, 0.18)",
            fill: true,
            borderWidth: 2.5,
            pointRadius: 1,
            pointHoverRadius: 5,
            pointBackgroundColor: "#4f46e5",
            pointHoverBackgroundColor: "#4338ca",
            tension: 0.25,
          },
          {
            label: "Gemini Notebook",
            data: timeline.map((d) => d.notebook),
            borderColor: "#059669", // Emerald 600 (crisp contrast)
            backgroundColor: "rgba(5, 150, 105, 0.22)",
            fill: true,
            borderWidth: 2.5,
            pointRadius: 1,
            pointHoverRadius: 5,
            pointBackgroundColor: "#059669",
            pointHoverBackgroundColor: "#047857",
            tension: 0.25,
          },
        ],
      };
    }

    // Execution view: User-Initiated vs Autonomous / Agentic
    return {
      labels,
      datasets: [
        {
          label: "User-Initiated",
          data: timeline.map((d) => d.userInitiated),
          borderColor: "#2563eb", // Blue 600
          backgroundColor: "rgba(37, 99, 235, 0.16)",
          fill: true,
          borderWidth: 2.5,
          pointRadius: 1,
          pointHoverRadius: 5,
          pointBackgroundColor: "#2563eb",
          pointHoverBackgroundColor: "#1d4ed8",
          tension: 0.25,
        },
        {
          label: "Autonomous / Agentic",
          data: timeline.map((d) => d.agentic),
          borderColor: "#d97706", // Amber 600
          backgroundColor: "rgba(217, 119, 6, 0.2)",
          fill: true,
          borderWidth: 2.5,
          pointRadius: 1,
          pointHoverRadius: 5,
          pointBackgroundColor: "#d97706",
          pointHoverBackgroundColor: "#b45309",
          tension: 0.25,
        },
      ],
    };
  }, [timeline, metricView]);

  useEffect(() => {
    const ctx = canvasRef.current;
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const newChart = new Chart(ctx, {
      type: "line",
      data: chartData,
      options: {
        layout: {
          padding: {
            top: 10,
            bottom: 12,
            left: 12,
            right: 16,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            border: { display: false },
            ticks: {
              maxTicksLimit: 5,
              callback: (value) => `${value}`,
              color: darkMode ? textColor.dark : textColor.light,
              font: { size: 11 },
            },
            grid: {
              color: darkMode ? gridColor.dark : gridColor.light,
            },
          },
          x: {
            type: "time",
            time: {
              parser: "YYYY-MM-DD",
              unit: "month",
              displayFormats: {
                month: "MMM YYYY",
              },
            },
            border: { display: false },
            grid: { display: false },
            ticks: {
              autoSkipPadding: 32,
              maxRotation: 0,
              color: darkMode ? textColor.dark : textColor.light,
              font: { size: 11 },
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: "index",
            intersect: false,
            titleColor: darkMode ? tooltipTitleColor.dark : tooltipTitleColor.light,
            bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
            backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
            borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
            borderWidth: 1,
            padding: 10,
            callbacks: {
              title: (items) => {
                if (!items.length) return "";
                const rawDate = items[0].label;
                try {
                  const d = new Date(rawDate);
                  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                } catch {
                  return rawDate;
                }
              },
              label: (context) => {
                const label = context.dataset.label || "";
                const val = context.parsed.y ?? 0;
                return ` ${label}: ${val} events`;
              },
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
        maintainAspectRatio: false,
        resizeDelay: 200,
      },
    });

    chartInstance.current = newChart;
    return () => newChart.destroy();
  }, [chartData]);

  // Handle Dark Mode dynamic updates
  useEffect(() => {
    const c = chartInstance.current;
    if (!c) return;
    if (c.options.scales?.x?.ticks) {
      c.options.scales.x.ticks.color = darkMode ? textColor.dark : textColor.light;
    }
    if (c.options.scales?.y?.ticks) {
      c.options.scales.y.ticks.color = darkMode ? textColor.dark : textColor.light;
    }
    if (c.options.scales?.y?.grid) {
      c.options.scales.y.grid.color = darkMode ? gridColor.dark : gridColor.light;
    }
    if (c.options.plugins?.tooltip) {
      c.options.plugins.tooltip.titleColor = darkMode ? tooltipTitleColor.dark : tooltipTitleColor.light;
      c.options.plugins.tooltip.bodyColor = darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light;
      c.options.plugins.tooltip.backgroundColor = darkMode ? tooltipBgColor.dark : tooltipBgColor.light;
      c.options.plugins.tooltip.borderColor = darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light;
    }
    c.update("none");
  }, [theme, darkMode]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/60 shadow-xs p-5">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700/60">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Generative AI Activity
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Daily event activity across the domain.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Switcher Controls */}
          <div className="flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-gray-700/70 rounded-lg self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setMetricView("platform")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                metricView === "platform"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-2xs"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              Workspace vs Gemini Notebook
            </button>
            <button
              type="button"
              onClick={() => setMetricView("execution")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                metricView === "execution"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-2xs"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              User vs Agentic
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-3 border-b border-gray-100 dark:border-gray-700/60 mb-2">
        {metricView === "execution" ? (
          <>
            <div>
              <div className="text-[10px] uppercase font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                User-Initiated
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                {summary.userInitiated.toLocaleString()}{" "}
                <span className="text-xs font-normal text-gray-500">
                  ({((summary.userInitiated / (summary.total || 1)) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Agentic Flows
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                {summary.agentic.toLocaleString()}{" "}
                <span className="text-xs font-normal text-amber-600 dark:text-amber-400">
                  ({((summary.agentic / (summary.total || 1)) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="text-[10px] uppercase font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Workspace Apps
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                {summary.workspace.toLocaleString()}{" "}
                <span className="text-xs font-normal text-gray-500">
                  ({((summary.workspace / (summary.total || 1)) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Gemini Notebook
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                {summary.notebook.toLocaleString()}{" "}
                <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">
                  ({((summary.notebook / (summary.total || 1)) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </>
        )}

        <div className="col-span-2 sm:col-span-1">
          <div className="text-[10px] uppercase font-semibold text-gray-400 dark:text-gray-500">
            Peak Activity Day
          </div>
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">
            {summary.peak.total} events
            <span className="text-xs font-normal text-gray-500 ml-1">
              ({summary.peak.date ? new Date(summary.peak.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"})
            </span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="grow flex items-center min-h-[280px]">
        <canvas ref={canvasRef} className="w-full h-full"></canvas>
      </div>
    </div>
  );
}
