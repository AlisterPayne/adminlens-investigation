"use client";

import "@/components/charts/chartjs-config";

import { BarController, BarElement, CategoryScale, Chart, Legend, LinearScale, Tooltip } from "chart.js";
import { useTheme } from "next-themes";
import React, { useEffect, useMemo, useRef } from "react";

import MosaicChartCard from "@/components/generative-ai/mosaic-chart-card";
import { htmlLegend, mosaic, themeColors } from "@/components/generative-ai/mosaic-chart-theme";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Props {
  categoryCounts: Record<string, number>;
  userInitiatedCount: number;
  agenticEventsCount: number;
}

const ROWS = ["Engagement", "Initiated by"];

export default function GenAiEngagementMix({ categoryCounts, userInitiatedCount, agenticEventsCount }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const legend = useRef<HTMLUListElement>(null);
  const { forcedTheme, resolvedTheme } = useTheme();
  const darkMode = (forcedTheme ?? resolvedTheme) === "dark";

  // Each segment lives on one row only; values are shares of that row's total
  const segments = useMemo(() => {
    const engagement = [
      { label: "Conversations", value: categoryCounts.active_conversations ?? 0, color: "violet-500" },
      { label: "Content generation", value: categoryCounts.active_generate ?? 0, color: "sky-500" },
      { label: "Passive / background", value: categoryCounts.inactive ?? 0, color: "gray-300" },
    ];
    const initiator = [
      { label: "People", value: userInitiatedCount, color: "green-500" },
      { label: "Agents", value: agenticEventsCount, color: "yellow-500" },
    ];
    const toShares = (list: typeof engagement, row: number) => {
      const total = list.reduce((s, x) => s + x.value, 0) || 1;
      return list.map((x) => ({ ...x, row, pct: (x.value / total) * 100 }));
    };
    return [...toShares(engagement, 0), ...toShares(initiator, 1)];
  }, [categoryCounts, userInitiatedCount, agenticEventsCount]);

  const engagementTotal = segments.filter((s) => s.row === 0).reduce((t, s) => t + s.value, 0);
  const activeShare = engagementTotal
    ? Math.round(((engagementTotal - (categoryCounts.inactive ?? 0)) / engagementTotal) * 100)
    : 0;

  useEffect(() => {
    const ctx = canvas.current;
    if (!ctx) return;
    const c = themeColors(darkMode);

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ROWS,
        datasets: segments.map((s) => ({
          label: s.label,
          data: ROWS.map((_, i) => (i === s.row ? s.pct : null)),
          backgroundColor: mosaic(s.color),
          hoverBackgroundColor: mosaic(s.color),
          barPercentage: 0.75,
          categoryPercentage: 0.9,
          borderWidth: { right: 2 },
          borderColor: c.backdrop,
          borderSkipped: false,
        })),
      },
      options: {
        indexAxis: "y",
        layout: { padding: { top: 4, bottom: 16, left: 20, right: 20 } },
        scales: {
          x: {
            stacked: true,
            min: 0,
            max: 100,
            border: { display: false },
            ticks: { maxTicksLimit: 5, color: c.text, callback: (v) => `${v}%` },
            grid: { color: c.grid },
          },
          y: {
            stacked: true,
            border: { display: false },
            grid: { display: false },
            ticks: { color: c.text },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...c.tooltip,
            callbacks: {
              title: () => "",
              label: (item) => {
                const s = segments[item.datasetIndex];
                return `${s.label}: ${s.value.toLocaleString()} events (${s.pct.toFixed(1)}%)`;
              },
            },
          },
        },
        interaction: { intersect: true, mode: "nearest" },
        animation: { duration: 500 },
        maintainAspectRatio: false,
        resizeDelay: 200,
      },
      plugins: [htmlLegend(() => legend.current, (_, i) => `${Math.round(segments[i].pct)}%`)],
    });
    return () => chart.destroy();
  }, [segments, darkMode]);

  return (
    <MosaicChartCard
      title="How AI Is Used"
      info="Top bar: whether AI events were chats with Gemini, content being generated, or passive/background features (e.g. proactive summaries, Meet studio sound). Bottom bar: whether a person or an automated agent triggered the action."
      headlineLabel="Actively driven by users"
      headline={`${activeShare}%`}
      pill={{ text: `${(engagementTotal - (categoryCounts.inactive ?? 0)).toLocaleString()} events`, tone: "violet" }}
    >
      <div className="px-5 pt-3">
        <ul ref={legend} className="flex flex-wrap gap-x-4 gap-y-1"></ul>
      </div>
      <div className="grow" style={{ minHeight: 170 }}>
        <canvas ref={canvas} width={595} height={170}></canvas>
      </div>
      <div className="mx-5 mb-5 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
        Passive features run without a deliberate prompt — high passive share can mean AI is switched on but not yet
        adopted.
      </div>
    </MosaicChartCard>
  );
}
