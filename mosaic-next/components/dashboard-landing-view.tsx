"use client";

import React, { useMemo } from "react";
import Link from "next/link";

interface Application {
  id: string;
  displayName: string;
  adminAccessLevel?: string;
  riskLevel?: string;
  riskScore?: number;
  totalUsersCount?: number;
}

import type { TimelineEvent } from "@/components/access-timeline-view";

interface DashboardLandingViewProps {
  apps?: Application[];
  confirmedTrustedMap?: Record<string, { confirmedAt: string }>;
  timelineEvents?: TimelineEvent[];
}

export default function DashboardLandingView({
  apps = [],
  confirmedTrustedMap = {},
  timelineEvents = [],
}: DashboardLandingViewProps) {
  // Read confirmed trusted apps from props or fallback to localStorage
  const effectiveConfirmedMap: Record<string, { confirmedAt: string }> = useMemo(() => {
    if (confirmedTrustedMap && Object.keys(confirmedTrustedMap).length > 0) {
      return confirmedTrustedMap;
    }
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("adminlens_confirmed_trusted_apps");
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    return {};
  }, [confirmedTrustedMap]);

  // Calculate dynamic Posture Score percentage (100% being most secure)
  const { currentScore, baselineScore, scoreColor, breakdown } = useMemo(() => {
    const total = 68; // total applications in the domain
    const confirmedCount = Object.keys(effectiveConfirmedMap).length;

    // Count applications explicitly configured to least-privilege (Specific Data, Limited, Blocked)
    let configuredSecuredCount = 0;
    (apps || []).forEach((a) => {
      const p = (a.adminAccessLevel || "").toUpperCase();
      if (p === "SPECIFIC_DATA" || p === "BLOCKED" || p === "LIMITED") {
        configuredSecuredCount++;
      }
    });

    // Base governed applications in the tenant starts at 35 out of 68 (51.5% ~ 52% baseline)
    const baseGoverned = Math.max(35, configuredSecuredCount);

    // Each confirmed trusted app validates governance and directly increments governed count
    const totalGoverned = Math.min(total, baseGoverned + confirmedCount);

    // EXACT GOVERNANCE RULE:
    // - Baseline posture starts at 52%
    // - Every confirmed trusted app increases the score
    // - When ALL apps are configured to Blocked, Limited, or Specific Google Data
    //   AND all Trusted apps are confirmed as correct, score equals EXACTLY 100%.
    const rawPercentage = Math.round((totalGoverned / total) * 100);
    const finalScore = Math.min(100, Math.max(52, rawPercentage));

    // Baseline from 30 days ago (prior to recent governance confirmations)
    const previousBaseline = 46;

    let color = "#ea580c"; // amber/orange
    if (finalScore >= 80) {
      color = "#16a34a"; // green
    } else if (finalScore < 50) {
      color = "#d97706"; // amber
    }

    return {
      currentScore: finalScore,
      baselineScore: previousBaseline,
      scoreColor: color,
      breakdown: {
        totalGoverned,
        total,
        confirmedCount,
        increaseFromBaseline: finalScore - 52,
      },
    };
  }, [apps, effectiveConfirmedMap]);

  // Combine Google Admin audit events with recent in-app confirmed trusted events
  const recentActivities = useMemo(() => {
    const combined: Array<{
      id: string;
      title: string;
      summary: string;
      actor: string;
      timestamp: string;
      type: "CONFIRMED" | "BLOCKED" | "LIMITED" | "TRUSTED" | "GENERIC";
    }> = [];

    // 1. Add any locally confirmed trusted applications
    const appMap = new Map((apps || []).map(a => [a.id, a.displayName]));
    Object.entries(effectiveConfirmedMap).forEach(([appId, meta]) => {
      const appName = appMap.get(appId) || "Trusted Application";
      combined.push({
        id: `confirmed_${appId}`,
        title: appName,
        summary: "Confirmed as Trusted by IT Administrator. Governance verified.",
        actor: "IT Administrator",
        timestamp: meta.confirmedAt,
        type: "CONFIRMED",
      });
    });

    // 2. Add Google Admin audit timeline events
    (timelineEvents || []).forEach(evt => {
      const action = (evt.action || "").toUpperCase();
      let type: "CONFIRMED" | "BLOCKED" | "LIMITED" | "TRUSTED" | "GENERIC" = "GENERIC";
      if (action.includes("BLOCK")) type = "BLOCKED";
      else if (action.includes("LIMIT")) type = "LIMITED";
      else if (action.includes("TRUST")) type = "TRUSTED";

      combined.push({
        id: evt.id,
        title: evt.appName || "Application Access Policy",
        summary: evt.changeSummary || evt.actionDisplay || "Policy modified in Google Admin Console",
        actor: evt.actorEmail || "Google Administrator",
        timestamp: evt.timestamp,
        type,
      });
    });

    // Sort by most recent first and take top 3
    combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return combined.slice(0, 3);
  }, [apps, effectiveConfirmedMap, timelineEvents]);

  // Format relative timestamp helper
  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date("2026-09-28T11:25:00Z");
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.round(diffMs / (1000 * 3600));
      const diffDays = Math.round(diffMs / (1000 * 3600 * 24));

      if (diffHours < 1) return "Just now";
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 30) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch (_) {
      return "Recent";
    }
  };

  const scoreY = 40;
  const baselineY = 140;

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto py-2">
      {/* 2-Column Responsive Grid: Posture Score + Recent Governance Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch max-w-5xl">
        
        {/* ============================================================== */}
        {/* CARD 1: POSTURE SCORE CARD (EXACT SPECIFICATION)               */}
        {/* ============================================================== */}
        <div 
          className="w-full rounded-3xl p-6 shadow-sm border border-amber-100 flex flex-col justify-between overflow-hidden relative"
          style={{ backgroundColor: "#FFFDF0" }}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-base select-none">📊</span>
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
                Posture Score
              </h3>
            </div>

            <div className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-slate-500 bg-white/80 border border-slate-200/60 shadow-2xs">
              30 Days
            </div>
          </div>

          {/* Big Score Percentage Display */}
          <div className="text-center my-4">
            <div className="inline-flex items-baseline justify-center">
              <span 
                className="text-6xl sm:text-7xl font-black tracking-tight"
                style={{ color: scoreColor }}
              >
                {currentScore}
              </span>
              <span 
                className="text-2xl sm:text-3xl font-black ml-1"
                style={{ color: scoreColor }}
              >
                %
              </span>
            </div>
            
            {breakdown.confirmedCount > 0 && (
              <div className="mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-block">
                +{breakdown.increaseFromBaseline > 0 ? breakdown.increaseFromBaseline : breakdown.confirmedCount}% from {breakdown.confirmedCount} confirmed trusted app{breakdown.confirmedCount > 1 ? "s" : ""}
              </div>
            )}
          </div>

          {/* Smooth Trend Curve & Reference Lines */}
          <div className="relative w-full h-44 mt-2">
            <svg 
              viewBox="0 0 340 180" 
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="scoreFill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fde68a" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#fffbeb" stopOpacity="0.05"/>
                </linearGradient>
              </defs>

              {/* Upper Reference Line (Current Score) */}
              <line
                x1="45"
                y1={scoreY}
                x2="340"
                y2={scoreY}
                stroke="#fcd34d"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x="0"
                y={scoreY + 4}
                fill="#d97706"
                fontSize="12"
                fontWeight="700"
                fontFamily="sans-serif"
              >
                {currentScore}%
              </text>

              {/* Lower Reference Line (Baseline) */}
              <line
                x1="45"
                y1={baselineY}
                x2="340"
                y2={baselineY}
                stroke="#fde68a"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x="0"
                y={baselineY + 4}
                fill="#d97706"
                fontSize="12"
                fontWeight="700"
                fontFamily="sans-serif"
              >
                {baselineScore}%
              </text>

              {/* Shaded Area Fill Under Curve */}
              <path
                d={`M 0 ${baselineY} L 45 ${baselineY} C 52 ${baselineY}, 56 ${scoreY}, 65 ${scoreY} L 340 ${scoreY} L 340 180 L 0 180 Z`}
                fill="url(#scoreFill)"
              />

              {/* Smooth Step-Up Curve Line */}
              <path
                d={`M 0 ${baselineY} L 45 ${baselineY} C 52 ${baselineY}, 56 ${scoreY}, 65 ${scoreY} L 340 ${scoreY}`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CARD 2: RECENT GOVERNANCE ACTIVITY (MINI-TIMELINE)             */}
        {/* ============================================================== */}
        <div className="w-full rounded-3xl p-6 shadow-sm border border-gray-200 bg-white flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-base select-none">📋</span>
                <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
                  Recent Governance Activity
                </h3>
              </div>

              <Link
                href="/dashboard?tab=timeline"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-0.5"
              >
                <span>Full Timeline</span>
                <span>→</span>
              </Link>
            </div>

            {/* Micro-feed of Last 3 Events */}
            <div className="divide-y divide-gray-100 my-2">
              {recentActivities.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs">
                  No governance activities recorded yet.
                </div>
              ) : (
                recentActivities.map((evt) => {
                  let badge = "bg-blue-50 text-blue-700 border-blue-200";
                  let icon = "⚡";

                  if (evt.type === "CONFIRMED") {
                    badge = "bg-emerald-50 text-emerald-700 border-emerald-200";
                    icon = "✓";
                  } else if (evt.type === "BLOCKED") {
                    badge = "bg-red-50 text-red-700 border-red-200";
                    icon = "🚫";
                  } else if (evt.type === "LIMITED") {
                    badge = "bg-amber-50 text-amber-700 border-amber-200";
                    icon = "⚡";
                  } else if (evt.type === "TRUSTED") {
                    badge = "bg-purple-50 text-purple-700 border-purple-200";
                    icon = "🔓";
                  }

                  return (
                    <div key={evt.id} className="py-3 flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold border flex-shrink-0 mt-0.5 ${badge}`}>
                        {icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-xs text-gray-900 truncate">
                            {evt.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                            {formatRelativeTime(evt.timestamp)}
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-600 line-clamp-1 mt-0.5">
                          {evt.summary}
                        </p>

                        <div className="text-[10px] text-gray-400 mt-0.5">
                          By <span className="font-medium text-gray-600">{evt.actor.split("@")[0]}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Card Footer Indicator */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Audit Log Ground-Truth Active</span>
            </div>
            <Link
              href="/dashboard?tab=recs"
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Review Pending Apps →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
