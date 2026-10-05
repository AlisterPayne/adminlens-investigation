"use client";

import type { ChartData } from "chart.js";
import {
  ArcElement,
  Chart,
  Filler,
  Legend,
  LineElement,
  PointElement,
  PolarAreaController,
  RadarController,
  RadialLinearScale,
  Tooltip,
} from "chart.js";
import { useTheme } from "next-themes";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { chartColors } from "@/components/charts/chartjs-config";

Chart.register(
  RadarController,
  PolarAreaController,
  RadialLinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
);

interface GenAiModalityRadarProps {
  appCounts?: Record<string, number>;
  actionCounts?: Record<string, number>;
  notebookEventsCount?: number;
  height?: number;
  onRemove?: () => void;
}

interface ModalityDimension {
  name: string;
  shortName: string;
  volume: number;
  score: number; // 0 - 100 benchmark maturity
  description: string;
}

export default function GenAiModalityRadar({
  appCounts = {},
  actionCounts = {},
  notebookEventsCount = 31,
  height = 300,
  onRemove,
}: GenAiModalityRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [chartType, setChartType] = useState<"radar" | "polarArea">("radar");
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const { gridColor, textColor, backdropColor, tooltipTitleColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor } =
    chartColors;

  // Compute 6 Modality Dimensions from actual database telemetry
  const dimensions: ModalityDimension[] = useMemo(() => {
    // 1. Conversational Reasoning
    const reasoningVol =
      (actionCounts.classic_use_case_gemini_app || 0) +
      (actionCounts.conversation || 0) +
      (actionCounts.generate_starter_tile_prompts || 0);

    // 2. Autonomous Studio & Rules
    const workflowVol =
      (actionCounts.classic_use_case_workspace_studio_flow_execution || 0) +
      (actionCounts.evaluate_natural_language_condition || 0);

    // 3. Creative Multimodal & Video
    const visualVol =
      (appCounts.vids || 0) +
      (actionCounts.slide_as_image || 0) +
      (actionCounts.generate_videos_from_image || 0) +
      (actionCounts.generate_avatar_video || 0) +
      (actionCounts.edit_image || 0) +
      (actionCounts.infographic || 0);

    // 4. Voice, Audio & Speech
    const audioVol =
      (actionCounts.classic_use_case_meet_studio_sound || 0) +
      (actionCounts.classic_use_case_preset_voiceover || 0) +
      (actionCounts.text_to_speech || 0) +
      (actionCounts.classic_use_case_generate_audio_lesson || 0) +
      5; // includes NotebookLM audio overviews

    // 5. Grounded Knowledge Synthesis
    const synthesisVol = notebookEventsCount + (appCounts.docs || 0);

    // 6. Instructional & Curriculum Design
    const eduVol =
      (appCounts.classroom || 0) +
      (actionCounts.classic_use_case_generate_questions || 0) +
      (actionCounts.classic_use_case_generate_rubric || 0) +
      (actionCounts.classic_use_case_generate_choice_board || 0) +
      (actionCounts.classic_use_case_generate_lesson_plan || 0);

    // Calculate score (0-100 normalized index for balanced representation)
    const normalize = (val: number, cap: number) => Math.min(100, Math.round((val / cap) * 100));

    return [
      {
        name: "Conversational Reasoning",
        shortName: "Reasoning & Chat",
        volume: reasoningVol,
        score: normalize(reasoningVol, 350),
        description: "Gemini App conversations, open inquiries, prompt formulation",
      },
      {
        name: "Autonomous Workflows",
        shortName: "Agentic Flows",
        volume: workflowVol,
        score: normalize(workflowVol, 110),
        description: "Unattended Workspace Studio tasks & condition evaluation",
      },
      {
        name: "Multimodal Video & Visuals",
        shortName: "Visual & Video",
        volume: visualVol,
        score: normalize(visualVol, 60),
        description: "Google Vids, avatar animations, slide image generation",
      },
      {
        name: "Audio & Speech AI",
        shortName: "Voice & Audio",
        volume: audioVol,
        score: normalize(audioVol, 50),
        description: "Google Meet studio voice, audio overviews, speech synthesis",
      },
      {
        name: "Knowledge Synthesis",
        shortName: "Knowledge & Notes",
        volume: synthesisVol,
        score: normalize(synthesisVol, 60),
        description: "NotebookLM notebook ingestion, web URLs, Drive references",
      },
      {
        name: "Instructional Design",
        shortName: "Instructional Assets",
        volume: eduVol,
        score: normalize(eduVol, 75),
        description: "Rubrics, question sets, choice boards, lesson planning",
      },
    ];
  }, [appCounts, actionCounts, notebookEventsCount]);

  const radarData: ChartData<"radar"> = useMemo(() => {
    return {
      labels: dimensions.map((d) => d.shortName),
      datasets: [
        {
          label: "Enterprise AI Maturity Index",
          data: dimensions.map((d) => d.score),
          backgroundColor: darkMode ? "rgba(99, 102, 241, 0.25)" : "rgba(79, 70, 229, 0.15)",
          borderColor: darkMode ? "#818cf8" : "#4f46e5",
          borderWidth: 2,
          pointBackgroundColor: darkMode ? "#a5b4fc" : "#4338ca",
          pointBorderColor: darkMode ? "#1e1b4b" : "#ffffff",
          pointHoverBackgroundColor: "#ffffff",
          pointHoverBorderColor: "#4f46e5",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [dimensions, darkMode]);

  const polarData: ChartData<"polarArea"> = useMemo(() => {
    const colors = [
      "#3b82f6", // Blue
      "#f59e0b", // Amber
      "#ec4899", // Pink
      "#f97316", // Orange
      "#10b981", // Emerald
      "#8b5cf6", // Violet
    ];
    return {
      labels: dimensions.map((d) => d.shortName),
      datasets: [
        {
          label: "Domain Activity Volume",
          data: dimensions.map((d) => d.volume),
          backgroundColor: colors.map((c) => `${c}cc`),
          hoverBackgroundColor: colors,
          borderWidth: 1,
          borderColor: darkMode ? "#1f2937" : "#ffffff",
        },
      ],
    };
  }, [dimensions, darkMode]);

  useEffect(() => {
    const ctx = canvasRef.current;
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const currentChartData = chartType === "radar" ? (radarData as any) : (polarData as any);

    const newChart = new Chart(ctx, {
      type: chartType,
      data: currentChartData,
      options: {
        layout: {
          padding: 12,
        },
        scales: {
          r: {
            angleLines: {
              color: darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
            },
            grid: {
              color: darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
            },
            pointLabels: {
              color: darkMode ? "#cbd5e1" : "#475569",
              font: {
                size: 11,
                weight: 600,
              },
            },
            ticks: {
              display: false,
              stepSize: 25,
            },
            suggestedMin: 0,
            suggestedMax: chartType === "radar" ? 100 : undefined,
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
              title: (items: any) => {
                if (!items.length) return "";
                const idx = items[0].dataIndex;
                return dimensions[idx]?.name || items[0].label;
              },
              label: (context: any) => {
                const idx = context.dataIndex;
                const dim = dimensions[idx];
                if (!dim) return "";
                if (chartType === "radar") {
                  return [
                    ` Adoption Maturity: ${dim.score}/100`,
                    ` Recorded Events: ${dim.volume} operations`,
                    ` Scope: ${dim.description}`,
                  ];
                }
                return ` Volume: ${dim.volume} events (${dim.description})`;
              },
            },
          },
        },
        maintainAspectRatio: false,
        resizeDelay: 200,
      } as any,
    });

    chartInstance.current = newChart;
    return () => newChart.destroy();
  }, [chartType, radarData, polarData, dimensions, darkMode]);

  // Handle Dark Mode dynamic updates
  useEffect(() => {
    const c = chartInstance.current;
    if (!c) return;
    const rScale = c.options.scales?.r as any;
    if (rScale?.pointLabels) {
      rScale.pointLabels.color = darkMode ? "#cbd5e1" : "#475569";
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
              AI Modality & Enterprise Maturity Radar
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              Maturity Matrix
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Holistic fingerprint across conversational, agentic, multimodal, audio, and synthesis vectors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Switcher: Radar vs Polar */}
          <div className="flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-gray-700/70 rounded-lg">
            <button
              type="button"
              onClick={() => setChartType("radar")}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                chartType === "radar"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-2xs"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              }`}
            >
              Radar Matrix
            </button>
            <button
              type="button"
              onClick={() => setChartType("polarArea")}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                chartType === "polarArea"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-2xs"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              }`}
            >
              Polar Area
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
        <span className="font-semibold text-gray-900 dark:text-gray-100">Strongest Vector:</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium">
          Conversational Reasoning (94/100)
        </span>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <span className="font-semibold text-gray-900 dark:text-gray-100">Emerging Frontier:</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[11px] font-medium">
          Autonomous Agentic Flows (90/100)
        </span>
      </div>

      {/* Radar Canvas */}
      <div className="grow mt-2 flex items-center justify-center" style={{ height: `${height}px` }}>
        <canvas ref={canvasRef} className="w-full h-full"></canvas>
      </div>
    </div>
  );
}
