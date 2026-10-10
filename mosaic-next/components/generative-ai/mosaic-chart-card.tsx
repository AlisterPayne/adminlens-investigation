"use client";

import React from "react";

import Tooltip from "@/components/tooltip";

interface MosaicChartCardProps {
  title: string;
  info: string;
  headline: string;
  headlineLabel: string;
  pill?: { text: string; tone: "green" | "red" | "violet" | "gray" };
  children: React.ReactNode;
}

const PILL_TONES = {
  green: "bg-green-500/20 text-green-700",
  red: "bg-red-500/20 text-red-700",
  violet: "bg-violet-500/20 text-violet-700 dark:text-violet-400",
  gray: "bg-gray-500/20 text-gray-600 dark:text-gray-400",
};

// Card shell matching the Mosaic dashboard cards (header + headline figure + chart body)
export default function MosaicChartCard({
  title,
  info,
  headline,
  headlineLabel,
  pill,
  children,
}: MosaicChartCardProps) {
  return (
    <div className="flex h-full flex-col rounded-xl bg-white border border-gray-200 dark:border-gray-700/60 shadow-xs dark:bg-gray-800">
      <header className="flex items-center border-b border-gray-100 px-5 py-4 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
        <Tooltip className="ml-2" size="lg">
          <div className="text-sm">{info}</div>
        </Tooltip>
      </header>
      <div className="px-5 pt-3">
        <div className="mb-1 text-xs font-semibold text-gray-400 uppercase dark:text-gray-500">{headlineLabel}</div>
        <div className="flex items-start">
          <div className="mr-2 text-3xl font-bold text-gray-800 dark:text-gray-100">{headline}</div>
          {pill && (
            <div className={`rounded-full px-1.5 text-sm font-medium ${PILL_TONES[pill.tone]}`}>{pill.text}</div>
          )}
        </div>
      </div>
      <div className="flex grow flex-col">{children}</div>
    </div>
  );
}
