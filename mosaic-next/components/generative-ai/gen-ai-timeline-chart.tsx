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
  height?: number;
  onRemove?: () => void;
}

export default function GenAiTimelineChart({ timeline = [], height = 280, onRemove }: GenAiTimelineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [metricView, setMetricView] = useState<"execution" | "platform">("execution");
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

    if (metricView === "execution") {
      return {
        labels,
        datasets: [
          {
            label: "User-Initiated",
            data: timeline.map((d) => d.userInitiated),
            borderColor: "#3b82f6", // Blue 500
            backgroundColor: "rgba(59, 130, 246, 0.12)",
            fill: true,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointBackgroundColor: "#3b82f6",
            pointHoverBackgroundColor: "#2563eb",
            tension: 0.3,
          },
          {
            label: "Autonomous / Agentic",
            data: timeline.map((d) => d.agentic),
            borderColor: "#f59e0b", // Amber 500
            backgroundColor: "rgba(245, 158, 11, 0.16)",
            fill: true,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointBackgroundColor: "#f59e0b",
            pointHoverBackgroundColor: "#d97706",
            tension: 0.3,
          },
        ],
      };
    }

    // Platform view: Workspace Apps vs NotebookLM
    return {
      labels,
      datasets: [
        {
          label: "Workspace Apps",
          data: timeline.map((d) => d.workspace),
          borderColor: "#6366f1", // Indigo 500
          backgroundColor: "rgba(99, 102, 241, 0.12)",
          fill: true,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointBackgroundColor: "#6366f1",
          pointHoverBackgroundColor: "#4f46e5",
          tension: 0.3,
        },
        {
          label: "NotebookLM",
          data: timeline.map((d) => d.notebook),
          borderColor: "#10b981", // Emerald 500
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          fill: true,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointBackgroundColor: "#10b981",
          pointHoverBackgroundColor: "#059669",
          tension: 0.3,
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
    <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/60 shadow-xs p-5">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700/60">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Generative AI Activity Trend
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              Telemetry
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Daily event activity volume across the domain (Apr – Oct 2026).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Switcher Controls */}
          <div className="flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-gray-700/70 rounded-lg self-start sm:self-auto">
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
            <button
              type="button"
              onClick={() => setMetricView("platform")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                metricView === "platform"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-2xs"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              Workspace vs NotebookLM
            </button>
          </div>

          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="Remove this graph from view"
              aria-label="Remove this graph"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
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
                NotebookLM
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
      <div className="grow" style={{ height: `${height}px` }}>
        <canvas ref={canvasRef} className="w-full h-full"></canvas>
      </div>
    </div>
  );
}
