"use client";

import type { ChartData } from "chart.js";
import { ArcElement, Chart, DoughnutController, Tooltip } from "chart.js";
import { useTheme } from "next-themes";
import React, { useEffect, useMemo, useRef } from "react";

import { chartColors } from "@/components/charts/chartjs-config";

Chart.register(DoughnutController, ArcElement, Tooltip);

interface AppDataEntry {
  rawKey: string;
  name: string;
  count: number;
  color: string;
  hoverColor: string;
}

interface GenAiAppsDoughnutProps {
  appCounts: Record<string, number>;
  notebookEventsCount?: number;
}

const APP_META: Record<string, { name: string; color: string; hoverColor: string }> = {
  gemini_app: { name: "Gemini", color: "#3b82f6", hoverColor: "#2563eb" },
  workflows: { name: "Workspace Studio", color: "#f59e0b", hoverColor: "#d97706" },
  slides: { name: "Google Slides", color: "#f97316", hoverColor: "#ea580c" },
  gmail: { name: "Gmail", color: "#ef4444", hoverColor: "#dc2626" },
  classroom: { name: "Classroom", color: "#10b981", hoverColor: "#059669" },
  notebooklm: { name: "Gemini Notebook", color: "#8b5cf6", hoverColor: "#7c3aed" },
  vids: { name: "Google Vids", color: "#a855f7", hoverColor: "#9333ea" },
  meet: { name: "Google Meet", color: "#14b8a6", hoverColor: "#0d9488" },
  docs: { name: "Google Docs", color: "#0ea5e9", hoverColor: "#0284c7" },
  forms: { name: "Google Forms", color: "#64748b", hoverColor: "#475569" },
};

export default function GenAiAppsDoughnut({
  appCounts = {},
  notebookEventsCount = 31,
}: GenAiAppsDoughnutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const legendRef = useRef<HTMLUListElement>(null);
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const { tooltipTitleColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;

  // Transform and sort app entries by volume
  const entries: AppDataEntry[] = useMemo(() => {
    const list: AppDataEntry[] = [];

    // Add workspace apps
    for (const [key, count] of Object.entries(appCounts)) {
      const meta = APP_META[key.toLowerCase()] || {
        name: key.replace(/_/g, " "),
        color: "#6b7280",
        hoverColor: "#4b5563",
      };
      list.push({
        rawKey: key,
        name: meta.name,
        count,
        color: meta.color,
        hoverColor: meta.hoverColor,
      });
    }

    // Add notebooklm if not already present in appCounts
    if (notebookEventsCount > 0 && !list.some((e) => e.rawKey.toLowerCase() === "notebooklm")) {
      const meta = APP_META.notebooklm;
      list.push({
        rawKey: "notebooklm",
        name: meta.name,
        count: notebookEventsCount,
        color: meta.color,
        hoverColor: meta.hoverColor,
      });
    }

    return list.sort((a, b) => b.count - a.count);
  }, [appCounts, notebookEventsCount]);

  const totalEvents = useMemo(() => entries.reduce((sum, e) => sum + e.count, 0), [entries]);

  const chartData: ChartData<"doughnut"> = useMemo(() => {
    return {
      labels: entries.map((e) => e.name),
      datasets: [
        {
          data: entries.map((e) => e.count),
          backgroundColor: entries.map((e) => e.color),
          hoverBackgroundColor: entries.map((e) => e.hoverColor),
          borderWidth: 0,
        },
      ],
    };
  }, [entries]);

  useEffect(() => {
    const ctx = canvasRef.current;
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const newChart = new Chart(ctx, {
      type: "doughnut",
      data: chartData,
      options: {
        cutout: "74%",
        layout: {
          padding: 16,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            titleColor: darkMode ? tooltipTitleColor.dark : tooltipTitleColor.light,
            bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
            backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
            borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (context: any) => {
                const val = context.parsed;
                const pct = totalEvents > 0 ? ((val / totalEvents) * 100).toFixed(1) : "0";
                return ` ${context.label}: ${val} events (${pct}%)`;
              },
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "nearest",
        },
        maintainAspectRatio: false,
        resizeDelay: 200,
      } as any,
      plugins: [
        {
          id: "htmlLegend",
          afterUpdate(c: any) {
            const ul = legendRef.current;
            if (!ul) return;
            while (ul.firstChild) {
              ul.firstChild.remove();
            }

            const items = c.options.plugins?.legend?.labels?.generateLabels?.(c);
            items?.forEach((item: any) => {
              const entry = entries[item.index!];
              const pct = totalEvents > 0 && entry ? ((entry.count / totalEvents) * 100).toFixed(1) : "0";

              const li = document.createElement("li");
              li.className = "inline-flex items-center m-1";

              const button = document.createElement("button");
              button.type = "button";
              button.className =
                "inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition cursor-pointer";
              button.style.opacity = item.hidden ? "0.35" : "1";

              button.onclick = () => {
                c.toggleDataVisibility(item.index!);
                c.update();
              };

              const dot = document.createElement("span");
              dot.className = "w-2.5 h-2.5 rounded-full shrink-0";
              dot.style.backgroundColor = item.fillStyle as string;

              const label = document.createElement("span");
              label.className = "font-medium text-gray-700 dark:text-gray-300";
              label.textContent = item.text;

              const count = document.createElement("span");
              count.className = "text-gray-400 font-mono text-[11px]";
              count.textContent = `${entry ? entry.count : ""}`;

              button.appendChild(dot);
              button.appendChild(label);
              button.appendChild(count);
              li.appendChild(button);
              ul.appendChild(li);
            });
          },
        },
      ],
    });

    chartInstance.current = newChart;
    return () => newChart.destroy();
  }, [chartData, totalEvents, entries]);

  // Handle Dark Mode dynamic updates
  useEffect(() => {
    const c = chartInstance.current;
    if (!c) return;
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
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700/60">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            AI Activity by Application
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Generative AI events across connected Workspace tools.
          </p>
        </div>
      </div>

      {/* Relative container with Center Total Badge */}
      <div className="grow flex items-center justify-center my-3 relative min-h-[280px]">
        <canvas ref={canvasRef} className="w-full h-full max-h-[280px]"></canvas>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            {totalEvents.toLocaleString()}
          </div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Total Events
          </div>
        </div>
      </div>

      {/* Interactive Legend Pills */}
      <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 mt-auto">
        <ul ref={legendRef} className="flex flex-wrap justify-center -m-1"></ul>
      </div>
    </div>
  );
}
