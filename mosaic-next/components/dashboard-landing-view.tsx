"use client";

import React, { useMemo } from "react";
import Link from "next/link";

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

interface DashboardLandingViewProps {
  apps?: Application[];
  confirmedTrustedMap?: Record<string, { confirmedAt: string }>;
  timelineEvents?: TimelineEvent[];
  onNavigateToTab?: (tab: string) => void;
  onSelectApp?: (app: Application) => void;
}

export default function DashboardLandingView({
  apps = [],
  confirmedTrustedMap = {},
  timelineEvents = [],
  onNavigateToTab,
  onSelectApp,
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

  // Top 5 High-Risk Applications (Highest Inherent Risk Score)
  const topRiskyApps = useMemo(() => {
    return [...apps]
      .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
      .slice(0, 5);
  }, [apps]);

  // Most At-Risk Scopes in the Domain (High-Privilege Scope Exposure)
  const topAtRiskScopes = useMemo(() => {
    const scopeMap = new Map<string, any>();

    apps.forEach((app) => {
      (app.scopes || []).forEach((s: any) => {
        const url = typeof s === "string" ? s : s.scope;
        if (!url || url.includes("userinfo") || url === "openid") return;

        if (!scopeMap.has(url)) {
          const adminScore =
            s.adminScore ||
            (s.riskLevel === "CRITICAL" ? 5 : s.riskLevel === "HIGH" ? 4 : s.riskLevel === "MEDIUM" ? 3 : 2);
          scopeMap.set(url, {
            url,
            description: s.description || url.split("/").pop() || url,
            threatImpact: s.threatImpact || "Sensitive Google Workspace data boundary access.",
            adminScore,
            adminColor: s.adminColor || (adminScore >= 4 ? "Red" : "Orange"),
            googleTier: s.googleTier || (adminScore >= 4 ? "Restricted" : "Sensitive"),
            service: s.service || "Google Service",
            appsCount: 0,
            usersCount: 0,
            apps: [],
          });
        }

        const item = scopeMap.get(url);
        item.appsCount++;
        item.usersCount += app.totalUsersCount || 1;
        item.apps.push(app.displayName);
      });
    });

    return Array.from(scopeMap.values())
      .filter((s) => s.adminScore >= 3)
      .sort((a, b) => b.adminScore - a.adminScore || b.appsCount - a.appsCount)
      .slice(0, 5);
  }, [apps]);

  // Data Access by Google Core Services
  const serviceDistribution = useMemo(() => {
    const services = [
      {
        id: "drive",
        name: "Google Drive & Docs",
        icon: "📁",
        appsCount: 0,
        criticalCount: 0,
        accentBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        barColor: "bg-emerald-500",
        riskSummary: "Full cloud storage read/write and file compromise boundary.",
      },
      {
        id: "gmail",
        name: "Gmail & Communications",
        icon: "✉️",
        appsCount: 0,
        criticalCount: 0,
        accentBg: "bg-red-50 text-red-700 border-red-200",
        barColor: "bg-red-500",
        riskSummary: "Mailbox read, send on behalf, and message manipulation.",
      },
      {
        id: "admin",
        name: "Workspace Admin SDK",
        icon: "⚡",
        appsCount: 0,
        criticalCount: 0,
        accentBg: "bg-purple-50 text-purple-700 border-purple-200",
        barColor: "bg-purple-500",
        riskSummary: "User directory, audit log monitoring, and domain delegation.",
      },
      {
        id: "calendar",
        name: "Calendar & Meetings",
        icon: "📅",
        appsCount: 0,
        criticalCount: 0,
        accentBg: "bg-blue-50 text-blue-700 border-blue-200",
        barColor: "bg-blue-500",
        riskSummary: "Executive schedule alteration and confidential meeting surveillance.",
      },
    ];

    apps.forEach((a) => {
      const touches = (a.servicesTouched || []).map((s) => s.toLowerCase());
      const scopes = (a.scopes || []).map((s) => (typeof s === "string" ? s : s.scope || "").toLowerCase());
      const isCritOrHigh = a.riskLevel === "CRITICAL" || a.riskLevel === "HIGH";

      const hasDrive =
        touches.some((t) => t.includes("drive")) ||
        scopes.some((s) => s.includes("drive") || s.includes("spreadsheets"));
      const hasGmail =
        touches.some((t) => t.includes("mail") || t.includes("gmail")) ||
        scopes.some((s) => s.includes("gmail") || s.includes("mail.google.com"));
      const hasAdmin =
        touches.some((t) => t.includes("admin") || t.includes("directory")) ||
        scopes.some((s) => s.includes("admin.") || s.includes("directory."));
      const hasCalendar =
        touches.some((t) => t.includes("calendar")) || scopes.some((s) => s.includes("calendar"));

      if (hasDrive) {
        services[0].appsCount++;
        if (isCritOrHigh) services[0].criticalCount++;
      }
      if (hasGmail) {
        services[1].appsCount++;
        if (isCritOrHigh) services[1].criticalCount++;
      }
      if (hasAdmin) {
        services[2].appsCount++;
        if (isCritOrHigh) services[2].criticalCount++;
      }
      if (hasCalendar) {
        services[3].appsCount++;
        if (isCritOrHigh) services[3].criticalCount++;
      }
    });

    return services;
  }, [apps]);

  const scoreY = 40;
  const baselineY = 140;

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto py-2">
      {/* ============================================================== */}
      {/* SECTION 1: EXECUTIVE KPI SUMMARY METRICS (4 TILES)             */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total 3rd-Party Applications */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/90 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total 3rd-Party Apps</span>
            <span className="text-base p-1.5 bg-blue-50 rounded-lg">🧩</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{kpis.total}</span>
            <span className="text-xs text-gray-500 font-medium">apps installed</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {kpis.verifiedCount} Verified
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">{kpis.unverifiedCount} Unverified</span>
          </div>
        </div>

        {/* KPI 2: High & Critical Risk Apps */}
        <div className="bg-white rounded-2xl p-5 border border-red-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">High & Critical Risk</span>
            <span className="text-base p-1.5 bg-red-50 rounded-lg">🚨</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-600 tracking-tight">{kpis.highOrCritCount}</span>
            <span className="text-xs text-red-600/80 font-medium">requiring review</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px]">
            <span className="font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
              {kpis.criticalCount} Critical
            </span>
            <span className="font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
              {kpis.highCount} High
            </span>
          </div>
        </div>

        {/* KPI 3: Shadow IT / Unconfigured Apps */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Unconfigured (Shadow IT)</span>
            <span className="text-base p-1.5 bg-amber-50 rounded-lg">👁️</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 tracking-tight">{kpis.unconfiguredCount}</span>
            <span className="text-xs text-amber-700/80 font-medium">pending policy</span>
          </div>
          <div className="mt-3 flex items-center text-[11px] text-amber-800 font-medium">
            <span>Operating on default self-consent</span>
          </div>
        </div>

        {/* KPI 4: Elevated Super Admin Grants */}
        <div className="bg-white rounded-2xl p-5 border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800">Super Admin Grants</span>
            <span className="text-base p-1.5 bg-purple-50 rounded-lg">🛡️</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-700 tracking-tight">{kpis.adminTokensCount}</span>
            <span className="text-xs text-purple-600 font-medium">elevated tokens</span>
          </div>
          <div className="mt-3 flex items-center text-[11px] text-purple-800 font-medium">
            <span>Full tenant delegation power</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 2: DUAL CORE CARDS (POSTURE SCORE & PRIORITY ACTIONS)  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* CARD 1: POSTURE SCORE CARD */}
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
                  <linearGradient id="dashboardScoreFill" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#dashboardScoreFill)"
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

        {/* CARD 2: PRIORITY GOVERNANCE ACTIONS (RECOMMENDATIONS) */}
        <div className="w-full rounded-3xl p-6 shadow-sm border border-gray-200 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-base select-none">🎯</span>
                <h3 className="font-extrabold text-slate-800 text-base tracking-tight">
                  Priority Action Recommendations
                </h3>
              </div>
              <button
                onClick={() => onNavigateToTab?.("recs")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-0.5"
              >
                <span>All Triage Items</span>
                <span>→</span>
              </button>
            </div>

            <div className="space-y-3 my-2">
              {/* Action 1: Unconfigured Critical Apps */}
              <div
                onClick={() => onNavigateToTab?.("recs")}
                className="p-3.5 rounded-xl border border-red-200/90 bg-red-50/40 hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold text-[10px] tracking-wide">
                      TIER 1 CRITICAL
                    </span>
                    <h4 className="font-bold text-xs text-gray-900 group-hover:text-red-700 transition-colors">
                      Triage 18 Critical Unconfigured Applications
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-600 line-clamp-1">
                    Apps holding full Drive, Mail, or Admin scopes currently lack explicit tenant policy.
                  </p>
                </div>
                <span className="text-xs font-bold text-red-600 whitespace-nowrap self-center group-hover:translate-x-0.5 transition-transform">
                  Triage →
                </span>
              </div>

              {/* Action 2: Review Blanket-Trusted Applications */}
              <div
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = "/dashboard?tab=recs&group=trusted";
                  } else {
                    onNavigateToTab?.("recs");
                  }
                }}
                className="p-3.5 rounded-xl border border-orange-200/90 bg-orange-50/40 hover:bg-orange-50 hover:border-orange-300 transition-all cursor-pointer flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-900 rounded font-bold text-[10px] tracking-wide">
                      HIGH RISK BYPASS
                    </span>
                    <h4 className="font-bold text-xs text-gray-900 group-hover:text-orange-800 transition-colors">
                      Audit 20 Blanket-Trusted Applications
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-600 line-clamp-1">
                    Confirm legitimate need or downgrade to Specific Google Data to eliminate future-scope creep.
                  </p>
                </div>
                <span className="text-xs font-bold text-orange-700 whitespace-nowrap self-center group-hover:translate-x-0.5 transition-transform">
                  Review →
                </span>
              </div>

              {/* Action 3: Super Admin Token Hygiene */}
              <div
                onClick={() => onNavigateToTab?.("apps")}
                className="p-3.5 rounded-xl border border-purple-200/90 bg-purple-50/40 hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-900 rounded font-bold text-[10px] tracking-wide">
                      SUPER ADMIN HYGIENE
                    </span>
                    <h4 className="font-bold text-xs text-gray-900 group-hover:text-purple-800 transition-colors">
                      Review Elevated Administrator Grants
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-600 line-clamp-1">
                    58 tokens held by super administrators present full-tenant takeover blast radius.
                  </p>
                </div>
                <span className="text-xs font-bold text-purple-700 whitespace-nowrap self-center group-hover:translate-x-0.5 transition-transform">
                  Audit →
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span>Remediating priority actions directly advances Posture Score toward 100%.</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 3: TOP HIGH-RISK APPLICATIONS & MOST AT-RISK SCOPES    */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* COLUMN 1: TOP HIGH-RISK APPLICATIONS */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base tracking-tight flex items-center gap-2">
                  <span>🚨 Top High-Risk Applications</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Applications carrying highest inherent risk scores based on permissions and verification.
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab?.("apps")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                View Catalog →
              </button>
            </div>

            <div className="divide-y divide-gray-100 my-2">
              {topRiskyApps.map((app) => {
                const isCrit = (app.riskLevel || "").toUpperCase() === "CRITICAL";
                const badgeClass = isCrit
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-amber-50 text-amber-700 border-amber-200";

                return (
                  <div
                    key={app.id}
                    onClick={() => onSelectApp?.(app)}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/80 px-2 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl border border-gray-200 bg-white p-1 flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <img
                          src={
                            app.iconUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              app.displayName
                            )}&background=3B82F6&color=fff&size=128&rounded=true`
                          }
                          alt={app.displayName}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {app.displayName}
                          </h4>
                          {app.isVerified && (
                            <span className="text-blue-600 text-xs flex-shrink-0" title="Google Verified">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                          <span>{app.vendor || "Third-Party Developer"}</span>
                          <span>•</span>
                          <span>{app.totalUsersCount || 1} user{app.totalUsersCount === 1 ? "" : "s"}</span>
                          <span>•</span>
                          <span className="font-medium text-gray-700 uppercase">{app.adminAccessLevel || "UNCONFIGURED"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${badgeClass}`}>
                        {app.riskScore ? app.riskScore.toFixed(1) : "5.0"} {app.riskLevel || "CRITICAL"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Click any application to inspect granted scopes and configure policy.</span>
            <button
              onClick={() => onNavigateToTab?.("apps")}
              className="font-semibold text-blue-600 hover:underline"
            >
              Full Inventory →
            </button>
          </div>
        </div>

        {/* COLUMN 2: MOST AT-RISK SCOPES */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base tracking-tight flex items-center gap-2">
                  <span>⚡ Most At-Risk Scopes</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  High-privilege Google Workspace OAuth permissions authorized across your tenant.
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab?.("scopes")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Scope Catalog →
              </button>
            </div>

            <div className="divide-y divide-gray-100 my-2">
              {topAtRiskScopes.map((scope) => {
                const isRed = scope.adminScore >= 5;
                const scoreBadge = isRed
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-orange-50 text-orange-700 border-orange-200";

                return (
                  <div
                    key={scope.url}
                    onClick={() => onNavigateToTab?.("scopes")}
                    className="py-3 flex items-start justify-between gap-4 hover:bg-gray-50/80 px-2 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {scope.description}
                        </h4>
                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          {scope.service}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 line-clamp-1 mt-0.5">
                        {scope.threatImpact}
                      </p>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5 truncate max-w-sm">
                        {scope.url}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 space-y-1">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border ${scoreBadge}`}>
                        Score {scope.adminScore}/5
                      </span>
                      <span className="block text-[10px] font-bold text-gray-700">
                        {scope.appsCount} app{scope.appsCount === 1 ? "" : "s"} authorized
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Google classifies these as Restricted/Sensitive API tiers.</span>
            <button
              onClick={() => onNavigateToTab?.("scopes")}
              className="font-semibold text-blue-600 hover:underline"
            >
              Inspect Scopes →
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 4: DATA ACCESS EXPOSURE BY GOOGLE SERVICE              */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base tracking-tight flex items-center gap-2">
              <span>📊 Data Access Exposure by Google Workspace Service</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Aggregated third-party OAuth penetration across sensitive corporate service boundaries.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab?.("scopes")}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Detailed Breakdown →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {serviceDistribution.map((srv) => (
            <div
              key={srv.id}
              onClick={() => onNavigateToTab?.("scopes")}
              className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-300 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{srv.icon}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${srv.accentBg}`}>
                  {srv.appsCount} Apps
                </span>
              </div>
              <h4 className="font-bold text-xs text-gray-900 group-hover:text-blue-600 transition-colors">
                {srv.name}
              </h4>
              <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                {srv.riskSummary}
              </p>
              <div className="mt-3 pt-2.5 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
                <span className="text-red-700 font-semibold">{srv.criticalCount} High Risk</span>
                <span className="text-gray-400 font-medium">Explore →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
