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
      {/* SECTION 2: PRIORITY GOVERNANCE ACTIONS (RECOMMENDATIONS)       */}
      {/* ============================================================== */}
      <div className="w-full">
        {/* CARD: PRIORITY GOVERNANCE ACTIONS (RECOMMENDATIONS) */}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-2">
              {/* Action 1: Unconfigured Critical Apps */}
              <div
                onClick={() => onNavigateToTab?.("recs")}
                className="p-4 rounded-xl border border-red-200/90 bg-red-50/40 hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold text-[10px] tracking-wide">
                      TIER 1 CRITICAL
                    </span>
                    <span className="text-xs font-bold text-red-600 whitespace-nowrap group-hover:translate-x-0.5 transition-transform">
                      Triage →
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-gray-900 group-hover:text-red-700 transition-colors">
                    Triage 18 Critical Unconfigured Applications
                  </h4>
                  <p className="text-[11px] text-gray-600 line-clamp-2">
                    Apps holding full Drive, Mail, or Admin scopes currently lack explicit tenant policy.
                  </p>
                </div>
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
                className="p-4 rounded-xl border border-orange-200/90 bg-orange-50/40 hover:bg-orange-50 hover:border-orange-300 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-900 rounded font-bold text-[10px] tracking-wide">
                      HIGH RISK BYPASS
                    </span>
                    <span className="text-xs font-bold text-orange-700 whitespace-nowrap group-hover:translate-x-0.5 transition-transform">
                      Review →
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-gray-900 group-hover:text-orange-800 transition-colors">
                    Audit 20 Blanket-Trusted Applications
                  </h4>
                  <p className="text-[11px] text-gray-600 line-clamp-2">
                    Confirm legitimate need or downgrade to Specific Google Data to eliminate future-scope creep.
                  </p>
                </div>
              </div>

              {/* Action 3: Super Admin Token Hygiene */}
              <div
                onClick={() => onNavigateToTab?.("apps")}
                className="p-4 rounded-xl border border-purple-200/90 bg-purple-50/40 hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-900 rounded font-bold text-[10px] tracking-wide">
                      SUPER ADMIN HYGIENE
                    </span>
                    <span className="text-xs font-bold text-purple-700 whitespace-nowrap group-hover:translate-x-0.5 transition-transform">
                      Audit →
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-gray-900 group-hover:text-purple-800 transition-colors">
                    Review Elevated Administrator Grants
                  </h4>
                  <p className="text-[11px] text-gray-600 line-clamp-2">
                    58 tokens held by super administrators present full-tenant takeover blast radius.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 mt-2">
            <span>Remediating priority actions directly hardens tenant perimeter and eliminates attack vectors.</span>
            <button
              onClick={() => onNavigateToTab?.("recs")}
              className="text-blue-600 font-semibold hover:underline"
            >
              Open Full Recommendations Playbook →
            </button>
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
