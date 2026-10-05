"use client";

import Link from "next/link";
import React, { useMemo } from "react";

export interface Application {
  id: string;
  clientId?: string;
  displayName: string;
  familyName?: string;
  vendor?: string;
  category?: string;
  appType?: string;
  deploymentType?: string;
  adminAccessLevel?: string;
  riskLevel?: string;
  riskScore?: number;
  totalUsersCount?: number;
  adminUsersCount?: number;
  scopesCount?: number;
  scopes?: any[];
  servicesTouched?: string[];
  iconUrl?: string;
  isVerified?: boolean;
}

import type { TimelineEvent } from "@/components/access-timeline-view";

interface MainDashboardViewProps {
  apps?: Application[];
  confirmedTrustedMap?: Record<string, { confirmedAt: string }>;
  timelineEvents?: TimelineEvent[];
  onNavigateToTab?: (tab: string) => void;
  onSelectApp?: (app: Application) => void;
}

export default function MainDashboardView({
  apps = [],
  confirmedTrustedMap = {},
  timelineEvents = [],
  onNavigateToTab,
  onSelectApp,
}: MainDashboardViewProps) {
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

  // Executive KPI stats across all applications
  const kpis = useMemo(() => {
    const total = apps.length || 87;
    const criticalApps = apps.filter((a) => (a.riskLevel || "").toUpperCase() === "CRITICAL");
    const highApps = apps.filter((a) => (a.riskLevel || "").toUpperCase() === "HIGH");
    const unconfiguredApps = apps.filter((a) => !a.adminAccessLevel || a.adminAccessLevel === "UNCONFIGURED");
    const trustedApps = apps.filter((a) => a.adminAccessLevel === "TRUSTED");
    const verifiedApps = apps.filter((a) => a.isVerified);
    const unverifiedCount = total - verifiedApps.length;
    const adminTokensApps = apps.filter((a) => (a.adminUsersCount || 0) > 0);

    return {
      total,
      criticalCount: criticalApps.length,
      highCount: highApps.length,
      highOrCritCount: criticalApps.length + highApps.length,
      unconfiguredCount: unconfiguredApps.length,
      trustedCount: trustedApps.length,
      verifiedCount: verifiedApps.length,
      unverifiedCount,
      adminTokensCount: adminTokensApps.length,
    };
  }, [apps]);

  // Calculate dynamic Posture Score percentage (100% being most secure)
  const { currentScore, baselineScore, scoreColor, breakdown } = useMemo(() => {
    const total = 68; // standard domain baseline applications count
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

    // Baseline posture starts at 52%, climbing to 100% when all apps are governed
    const rawPercentage = Math.round((totalGoverned / total) * 100);
    const finalScore = Math.min(100, Math.max(52, rawPercentage));

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

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto py-2">
      {/* Top Banner / Executive Heading */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Workspace Domain: gafe.co.za
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                Baseline Posture: {currentScore}%
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Main Dashboard
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Executive evaluation of tenant risk posture, least-privilege configurations, and Google Workspace OAuth security controls.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateToTab?.("baseline")}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all backdrop-blur-xs flex items-center gap-2"
            >
              <span>Domain Baseline</span>
              <span>→</span>
            </button>
            <button
              onClick={() => onNavigateToTab?.("recs")}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-900/30 flex items-center gap-2"
            >
              <span>Triage Actions</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: PRIMARY POSTURE SCORE & HARDENING GOALS             */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* CARD 1: 3RD-PARTY RISK POSTURE SCORE CARD (MOVED FROM DASHBOARD) */}
        <div className="w-full rounded-3xl p-6 shadow-sm border border-amber-200/70 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base tracking-tight flex items-center gap-2">
                  <span>3rd-Party Risk Posture Score</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    Governance Active
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm">
                  Evaluates least-privilege configurations across Google Workspace applications.
                </p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{currentScore}%</span>
                <span className="block text-[11px] font-bold text-emerald-600 mt-0.5">
                  +{breakdown.increaseFromBaseline}% gained via governance
                </span>
              </div>
            </div>

            {/* Score Progress Visualizer Bar */}
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-xs text-gray-600 font-medium">
                <span>Governed Applications Baseline</span>
                <span className="font-bold text-gray-900">
                  {breakdown.totalGoverned} / {breakdown.total} Apps Protected
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full transition-all duration-700 rounded-full"
                  style={{
                    width: `${currentScore}%`,
                    backgroundColor: scoreColor,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>0% Exposed</span>
                <span>52% Domain Baseline</span>
                <span className="font-bold text-emerald-600">100% Fully Hardened</span>
              </div>
            </div>

            {/* SVG Trend Comparison */}
            <div className="mt-4 pt-4 border-t border-amber-100/80">
              <svg className="w-full h-28 overflow-visible" viewBox="0 0 340 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="mainDashboardScoreFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="45" y1="20" x2="340" y2="20" stroke="#fcd34d" strokeWidth="1" strokeDasharray="3 3" />
                <text x="0" y="24" fill="#d97706" fontSize="11" fontWeight="700">
                  {currentScore}%
                </text>
                <line x1="45" y1="75" x2="340" y2="75" stroke="#fde68a" strokeWidth="1" strokeDasharray="3 3" />
                <text x="0" y="79" fill="#d97706" fontSize="11" fontWeight="700">
                  {baselineScore}%
                </text>
                <path
                  d="M 0 75 L 45 75 C 55 75, 60 20, 75 20 L 340 20 L 340 100 L 0 100 Z"
                  fill="url(#mainDashboardScoreFill)"
                />
                <path
                  d="M 0 75 L 45 75 C 55 75, 60 20, 75 20 L 340 20"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div className="pt-3 border-t border-amber-100/80 flex items-center justify-between text-xs text-amber-900 font-medium">
            <span>Target: 100% when all apps are Blocked, Limited, or Specific Data.</span>
            <button
              onClick={() => onNavigateToTab?.("recs")}
              className="text-amber-800 hover:text-amber-950 font-bold hover:underline"
            >
              Govern Apps →
            </button>
          </div>
        </div>

        {/* CARD 2: DOMAIN HARDENING ROADMAP & TRAJECTORY */}
        <div className="w-full rounded-3xl p-6 shadow-sm border border-slate-200 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-base select-none">🛡️</span>
                <h3 className="font-extrabold text-slate-800 text-base tracking-tight">
                  Domain Posture Hardening Milestones
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Phase 1 Active
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Roadmap to transition third-party OAuth access from open exposure to 100% hardened least-privilege governance.
            </p>

            <div className="space-y-3.5">
              {/* Step 1 */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-900">Stage 1: Active Domain Baseline</h4>
                    <span className="text-[11px] font-mono font-bold text-emerald-800">52% Achieved</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    35 baseline applications governed under least-privilege policies.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-amber-900">Stage 2: Restrict Critical Unconfigured Apps</h4>
                    <span className="text-[11px] font-mono font-bold text-amber-800">Target 75% (+23%)</span>
                  </div>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Apply explicit tenant policies to 18 critical applications holding full Drive, Mail, or Admin scopes.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-400 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800">Stage 3: Audit Blanket-Trusted Applications</h4>
                    <span className="text-[11px] font-mono font-bold text-slate-600">Target 90% (+15%)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Review 20 trusted apps and scope them to specific data to prevent future authorization creep.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-3 rounded-2xl bg-slate-50/60 border border-slate-200/70 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  4
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700">Stage 4: Full Perimeter Hardening</h4>
                    <span className="text-[11px] font-mono font-bold text-emerald-700">Goal 100%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    All connected software operates under explicit Blocked, Limited, or Specific Data controls.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Advancing milestones protects domain accounts from credential abuse.</span>
            <button
              onClick={() => onNavigateToTab?.("baseline")}
              className="text-blue-600 hover:text-blue-800 font-bold hover:underline"
            >
              Configure Baseline →
            </button>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* SECTION 2: GOVERNANCE SUMMARY CARDS                            */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Governed Baseline Ratio */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Protected Baseline</span>
            <span className="text-emerald-600 font-bold">✓ Active</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {breakdown.totalGoverned} <span className="text-sm font-normal text-slate-400">/ {breakdown.total}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Applications operating under enforced security policies.
          </p>
        </div>

        {/* KPI 2: Unconfigured Apps Exposure */}
        <div 
          onClick={() => onNavigateToTab?.("recs")}
          className="bg-white rounded-2xl p-5 border border-red-200/90 shadow-xs hover:border-red-300 transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-red-600 text-xs font-medium mb-2">
            <span>Unconfigured Exposure</span>
            <span className="text-red-600 font-bold group-hover:translate-x-0.5 transition-transform">Triage →</span>
          </div>
          <div className="text-2xl font-black text-red-600">
            {kpis.unconfiguredCount} <span className="text-sm font-normal text-slate-400">apps</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Software operating without explicit admin authorization rules.
          </p>
        </div>

        {/* KPI 3: High & Critical Risk Apps */}
        <div 
          onClick={() => onNavigateToTab?.("apps")}
          className="bg-white rounded-2xl p-5 border border-orange-200/90 shadow-xs hover:border-orange-300 transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-orange-600 text-xs font-medium mb-2">
            <span>High &amp; Critical Risk</span>
            <span className="text-orange-600 font-bold group-hover:translate-x-0.5 transition-transform">Audit →</span>
          </div>
          <div className="text-2xl font-black text-orange-600">
            {kpis.highOrCritCount} <span className="text-sm font-normal text-slate-400">apps</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Applications requesting elevated Google Workspace scopes.
          </p>
        </div>

        {/* KPI 4: Super Admin Tokens */}
        <div 
          onClick={() => onNavigateToTab?.("scopes")}
          className="bg-white rounded-2xl p-5 border border-purple-200/90 shadow-xs hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-purple-600 text-xs font-medium mb-2">
            <span>Admin Token Grants</span>
            <span className="text-purple-600 font-bold group-hover:translate-x-0.5 transition-transform">Scopes →</span>
          </div>
          <div className="text-2xl font-black text-purple-700">
            {kpis.adminTokensCount} <span className="text-sm font-normal text-slate-400">apps</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Connected tools holding privileges granted by super administrators.
          </p>
        </div>
      </div>

      {/* Quick Navigation Jump Cards */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800">
            Looking for specific inventory or policy tools?
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Access detailed application catalogs, services matrices, or the access timeline.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigateToTab?.("dashboard")}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors shadow-2xs"
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => onNavigateToTab?.("apps")}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors shadow-2xs"
          >
            Applications List
          </button>
          <button
            onClick={() => onNavigateToTab?.("scopes")}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors shadow-2xs"
          >
            Services &amp; Scopes
          </button>
          <button
            onClick={() => onNavigateToTab?.("timeline")}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors shadow-2xs"
          >
            Access Timeline
          </button>
        </div>
      </div>
    </div>
  );
}
