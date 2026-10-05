"use client";

import type { ChartData } from "chart.js";
import { BarController, BarElement, CategoryScale, Chart, Legend, LinearScale, Tooltip } from "chart.js";
import { useTheme } from "next-themes";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { chartColors } from "@/components/charts/chartjs-config";

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend);

interface GenAiCapabilitiesBarProps {
  actionCounts?: Record<string, number>;
  notebookEventsCount?: number;
  height?: number;
  onRemove?: () => void;
}

interface CapabilityItem {
  key: string;
  label: string;
  category: string;
  count: number;
  color: string;
  hoverColor: string;
}

export default function GenAiCapabilitiesBarChart({
  actionCounts = {},
  notebookEventsCount = 31,
  height = 300,
  onRemove,
}: GenAiCapabilitiesBarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [viewMode, setViewMode] = useState<"pillars" | "granular">("pillars");
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const { textColor, gridColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor, tooltipTitleColor } =
    chartColors;

  // Grouped Pillars Calculation
  const pillarData: CapabilityItem[] = useMemo(() => {
    // 1. Conversational Reasoning & Chat
    const chatCount =
      (actionCounts.classic_use_case_gemini_app || 0) +
      (actionCounts.conversation || 0);

    // 2. Automated Studio Flows & Logic
    const automationCount =
      (actionCounts.classic_use_case_workspace_studio_flow_execution || 0) +
      (actionCounts.evaluate_natural_language_condition || 0);

    // 3. Proactive Summaries & Triage
    const summaryCount =
      (actionCounts.summarize_proactive || 0) +
      (actionCounts.summarize_unreads || 0);

    // 4. Curriculum & Instructional Generation
    const eduCount =
      (actionCounts.classic_use_case_generate_questions || 0) +
      (actionCounts.classic_use_case_generate_story || 0) +
      (actionCounts.classic_use_case_generate_choice_board || 0) +
      (actionCounts.classic_use_case_generate_rubric || 0) +
      (actionCounts.classic_use_case_generate_lesson_plan || 0) +
      (actionCounts.classic_use_case_generate_vocab_list || 0) +
      (actionCounts.classic_use_case_generate_audio_lesson || 0) +
      (actionCounts.classic_use_case_generate_informative_articles || 0);

    // 5. Multimodal Creative & Video Studio
    const mediaCount =
      (actionCounts.slide_as_image || 0) +
      (actionCounts.generate_videos_from_image || 0) +
      (actionCounts.edit_image || 0) +
      (actionCounts.classic_use_case_preset_voiceover || 0) +
      (actionCounts.infographic || 0) +
      (actionCounts.generate_avatar_video || 0) +
      (actionCounts.generate_recording_scripts || 0);

    // 6. Proactive Suggestions
    const suggestionCount = actionCounts.proactive_suggestions || 0;

    // 7. Audio & Speech AI
    const audioCount =
      (actionCounts.classic_use_case_meet_studio_sound || 0) +
      (actionCounts.text_to_speech || 0);

    // 8. Grounded Research & NotebookLM
    const notebookCount = notebookEventsCount;

    // 9. Prompt Starters & Formulation
    const promptCount = actionCounts.generate_starter_tile_prompts || 0;

    return [
      {
        key: "conversational",
        label: "Conversational Reasoning & Chat",
        category: "Interactive",
        count: chatCount,
        color: "#3b82f6", // Blue 500
        hoverColor: "#2563eb",
      },
      {
        key: "automation",
        label: "Autonomous Studio & Decision Flows",
        category: "Agentic",
        count: automationCount,
        color: "#f59e0b", // Amber 500
        hoverColor: "#d97706",
      },
      {
        key: "summarization",
        label: "Smart Summarization & Inbox Triage",
        category: "Assistance",
        count: summaryCount,
        color: "#10b981", // Emerald 500
        hoverColor: "#059669",
      },
      {
        key: "education",
        label: "Curriculum & Educational Generators",
        category: "Content Creation",
        count: eduCount,
        color: "#8b5cf6", // Violet 500
        hoverColor: "#7c3aed",
      },
      {
        key: "multimodal",
        label: "Creative Multimodal Media & Video",
        category: "Visual Studio",
        count: mediaCount,
        color: "#ec4899", // Pink 500
        hoverColor: "#db2777",
      },
      {
        key: "suggestions",
        label: "Proactive Workflow Suggestions",
        category: "Assistance",
        count: suggestionCount,
        color: "#06b6d4", // Cyan 500
        hoverColor: "#0891b2",
      },
      {
        key: "audio",
        label: "Audio & Speech Enhancement",
        category: "Media",
        count: audioCount,
        color: "#f97316", // Orange 500
        hoverColor: "#ea580c",
      },
      {
        key: "research",
        label: "Grounded NotebookLM Research",
        category: "Synthesis",
        count: notebookCount,
        color: "#14b8a6", // Teal 500
        hoverColor: "#0d9488",
      },
      {
        key: "prompts",
        label: "Prompt Starters & Ideation",
        category: "Interactive",
        count: promptCount,
        color: "#64748b", // Slate 500
        hoverColor: "#475569",
      },
    ].sort((a, b) => b.count - a.count);
  }, [actionCounts, notebookEventsCount]);

  // Granular Actions (Top 10 raw actions)
  const granularData: CapabilityItem[] = useMemo(() => {
    const formatName = (k: string) => {
      return k
        .replace(/^classic_use_case_/, "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const list: CapabilityItem[] = Object.entries(actionCounts).map(([k, count]) => {
      let color = "#3b82f6";
      let hoverColor = "#2563eb";
      if (k.includes("flow") || k.includes("condition")) {
        color = "#f59e0b";
        hoverColor = "#d97706";
      } else if (k.includes("summarize")) {
        color = "#10b981";
        hoverColor = "#059669";
      } else if (k.includes("generate_") || k.includes("rubric") || k.includes("lesson")) {
        color = "#8b5cf6";
        hoverColor = "#7c3aed";
      } else if (k.includes("video") || k.includes("image") || k.includes("voiceover")) {
        color = "#ec4899";
        hoverColor = "#db2777";
      }

      return {
        key: k,
        label: formatName(k),
        category: "Action",
        count,
        color,
        hoverColor,
      };
    });

    if (notebookEventsCount > 0) {
      list.push({
        key: "notebooklm_events",
        label: "NotebookLM Synthesis & Query",
        category: "Notebook",
        count: notebookEventsCount,
        color: "#14b8a6",
        hoverColor: "#0d9488",
      });
    }

    return list.sort((a, b) => b.count - a.count).slice(0, 8);
  }, [actionCounts, notebookEventsCount]);

  const activeItems = viewMode === "pillars" ? pillarData : granularData;
  const totalTracked = useMemo(() => activeItems.reduce((acc, i) => acc + i.count, 0), [activeItems]);

  const chartData: ChartData<"bar"> = useMemo(() => {
    return {
      labels: activeItems.map((i) => i.label),
      datasets: [
        {
          label: "Events",
          data: activeItems.map((i) => i.count),
          backgroundColor: activeItems.map((i) => i.color),
          hoverBackgroundColor: activeItems.map((i) => i.hoverColor),
          borderRadius: 6,
          barPercentage: 0.65,
          categoryPercentage: 0.85,
        },
      ],
    };
  }, [activeItems]);

  useEffect(() => {
    const ctx = canvasRef.current;
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const newChart = new Chart(ctx, {
      type: "bar",
      data: chartData,
      options: {
        indexAxis: "y",
        layout: {
          padding: {
            top: 4,
            bottom: 4,
            left: 8,
            right: 24,
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            border: { display: false },
            grid: {
              color: darkMode ? gridColor.dark : gridColor.light,
            },
            ticks: {
              maxTicksLimit: 6,
              color: darkMode ? textColor.dark : textColor.light,
              font: { size: 10 },
            },
          },
          y: {
            border: { display: false },
            grid: { display: false },
            ticks: {
              color: darkMode ? "#cbd5e1" : "#334155",
              font: { size: 11, weight: 500 },
              callback: function (val: any, index: number) {
                const label = this.getLabelForValue(index);
                if (label.length > 24) {
                  return `${label.slice(0, 22)}…`;
                }
                return label;
              },
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            titleColor: darkMode ? tooltipTitleColor.dark : tooltipTitleColor.light,
            bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
            backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
            borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (context) => {
                const val = context.parsed.x ?? 0;
                const pct = totalTracked > 0 ? ((val / totalTracked) * 100).toFixed(1) : "0";
                return ` Volume: ${val} events (${pct}% of analyzed workload)`;
              },
            },
          },
        },
        maintainAspectRatio: false,
        resizeDelay: 200,
      },
    });

    chartInstance.current = newChart;
    return () => newChart.destroy();
  }, [chartData, totalTracked, darkMode]);

  // Handle Dark Mode dynamic updates
  useEffect(() => {
    const c = chartInstance.current;
    if (!c) return;
    if (c.options.scales?.x?.grid) {
      c.options.scales.x.grid.color = darkMode ? gridColor.dark : gridColor.light;
    }
    if (c.options.scales?.x?.ticks) {
      c.options.scales.x.ticks.color = darkMode ? textColor.dark : textColor.light;
    }
    c.update("none");
  }, [theme, darkMode]);

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/60 shadow-xs p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700/60">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              AI Capabilities & Functional Use Cases
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
              Workload Split
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            What tasks employees and automated agents are delegating to Generative AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-gray-700/70 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode("pillars")}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                viewMode === "pillars"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-2xs"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              }`}
            >
              Core Pillars
            </button>
            <button
              type="button"
              onClick={() => setViewMode("granular")}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                viewMode === "granular"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-2xs"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              }`}
            >
              Top Actions
            </button>
          </div>

          {/* Remove / Chop Button */}
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

      {/* Quick Summary Pill Bar */}
      <div className="flex flex-wrap items-center gap-2 py-2.5 border-b border-gray-100 dark:border-gray-700/60 text-xs text-gray-600 dark:text-gray-300">
        <span className="font-semibold text-gray-900 dark:text-gray-100">Top Driver:</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[11px] font-medium">
          Conversational Reasoning (46.1%)
        </span>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <span className="font-semibold text-gray-900 dark:text-gray-100">Autonomous Automation:</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[11px] font-medium">
          99 Studio Actions (13.9%)
        </span>
      </div>

      {/* Canvas */}
      <div className="grow mt-2" style={{ height: `${height}px` }}>
        <canvas ref={canvasRef} className="w-full h-full"></canvas>
      </div>
    </div>
  );
}
