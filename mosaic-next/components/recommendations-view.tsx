"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import GoogleVerifiedBadge from "@/components/google-verified-badge";
import { GoogleAdminIcon } from "@/components/google-icons";

export interface ScopeItem {
  scope: string;
  riskLevel: string;
  description: string;
  threatImpact?: string;
  adminScore?: number;
  adminColor?: string;
  googleTier?: string;
  service?: string;
}

export interface UserGrant {
  email: string;
  name: string;
  orgUnit: string;
  isAdmin: boolean;
  grantedScopes: string[];
}

export interface Application {
  id: string;
  clientId?: string;
  familyId?: string;
  familyName?: string;
  displayName: string;
  vendor: string;
  publisherDomain?: string;
  category?: string;
  appType?: string;
  compliance?: string[];
  dataHosting?: string;
  breachHistory?: string | null;
  isVerified: boolean;
  iconUrl: string;
  storeUrl?: string | null;
  adminConsoleUrl?: string;
  description?: string;
  riskScore?: number;
  riskLevel: string;
  adminAccessLevel?: string;
  totalUsersCount: number;
  adminUsersCount: number;
  scopesCount?: number;
  scopes?: ScopeItem[];
  users?: UserGrant[];
  lastActive?: string | null;
  lastActiveFormatted?: string;
  isStale?: boolean;
}

export interface RecommendationFinding {
  id: string;
  rule: string;
  title: string;
  severity: string;
  application: string;
  vendor: string;
  affectedAccount: string;
  clientId: string;
  details: string;
  remediation: string;
  actionType: string;
  adminConsolePath?: string;
}

export interface AdminGroup {
  adminEmail: string;
  tokenCount: number;
  items: RecommendationFinding[];
}

interface RecommendationsViewProps {
  apps: Application[];
  initialRecs?: {
    summary?: any;
    playbooks?: any[];
    byFamily?: any[];
    byAdmin?: AdminGroup[];
    findings?: RecommendationFinding[];
  };
}

export default function RecommendationsView({ apps, initialRecs }: RecommendationsViewProps) {
  const [activeCategory, setActiveCategory] = useState<"urgent" | "unconfigured" | "trusted" | "admins" | "secured">("urgent");
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [expandedAppIds, setExpandedAppIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedAppIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper to parse dates and check 30-day recency
  const isAccessedInLast30Days = (app: Application): boolean => {
    const now = new Date("2026-09-26T00:00:00Z");
    if (app.lastActive) {
      const diffDays = (now.getTime() - new Date(app.lastActive).getTime()) / (1000 * 3600 * 24);
      return diffDays <= 30;
    }
    if (app.lastActiveFormatted) {
      const [d, m, y] = app.lastActiveFormatted.split("/");
      if (d && m && y) {
        const date = new Date(`${y}-${m}-${d}T00:00:00Z`);
        const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 30;
      }
    }
    return !app.isStale;
  };

  // Map of raw findings by clientId for quick enrichment
  const findingsByClientId = useMemo(() => {
    const map = new Map<string, RecommendationFinding[]>();
    for (const f of initialRecs?.findings || []) {
      if (!map.has(f.clientId)) map.set(f.clientId, []);
      map.get(f.clientId)!.push(f);
    }
    return map;
  }, [initialRecs]);

  // Enriched Classified App Recommendations
  const classifiedApps = useMemo(() => {
    return apps.map((app) => {
      const isRecent = isAccessedInLast30Days(app);
      const totalUsers = app.totalUsersCount || app.users?.length || 0;
      const adminUsers = app.adminUsersCount || app.users?.filter(u => u.isAdmin)?.length || 0;
      const isHighOrCrit = app.riskLevel === "CRITICAL" || app.riskLevel === "HIGH" || (app.riskScore ?? 0) >= 4.0;
      const policy = (app.adminAccessLevel || "UNCONFIGURED").toUpperCase();
      const isVerified = Boolean(app.isVerified);
      const findings = findingsByClientId.get(app.clientId || app.id) || [];

      // Classification Logic based on user criteria:
      // - Risk score & breach history
      // - Breadth (totalUsers)
      // - Depth (adminUsers)
      // - Recency (last 30 days)
      // - Google verification
      // - Configuration: UNCONFIGURED (blindspot) vs TRUSTED (blanket pass for current+future scopes) vs SPECIFIC_DATA (Holy Grail)
      
      const isSecured = policy === "SPECIFIC_DATA" || policy === "BLOCKED" || policy === "LIMITED";
      const isTrusted = policy === "TRUSTED";
      const isUnconfigured = policy === "UNCONFIGURED";

      let isUrgent = false;
      let primaryAction = "";
      let actionType: "CONSOLE" | "SECURED" = "CONSOLE";
      let actionReason = "";

      if (isSecured) {
        primaryAction = policy === "SPECIFIC_DATA"
          ? "Secured with Specific Google Data (Holy Grail least-privilege)"
          : `Protected: Application policy set to ${policy}`;
        actionType = "SECURED";
        actionReason = "Application adheres to zero-trust Google Workspace security baseline.";
      } else if (isRecent && adminUsers > 0 && isHighOrCrit) {
        isUrgent = true;
        primaryAction = `Revoke ${adminUsers} Super Admin token(s) and restrict in Admin Console`;
        actionType = "CONSOLE";
        actionReason = `Super Admin privilege exposure on active ${app.riskLevel} risk application. Compromise gives tenant-wide delegation.`;
      } else if (isRecent && isUnconfigured && isHighOrCrit && !isVerified) {
        isUrgent = true;
        primaryAction = "Configure policy in Admin Console: Restrict to 'Specific Google Data' or Block";
        actionType = "CONSOLE";
        actionReason = `Unverified by Google and unconfigured in Workspace. Actively used by ${totalUsers} user(s).`;
      } else if (isRecent && isTrusted && isHighOrCrit) {
        isUrgent = true;
        primaryAction = "Downgrade from 'Trusted' to 'Specific Google Data' in Admin Console";
        actionType = "CONSOLE";
        actionReason = `'Trusted' grants blanket access to ALL current and future scopes without admin consent.`;
      } else if (isTrusted) {
        primaryAction = "Downgrade from 'Trusted' to 'Specific Google Data'";
        actionType = "CONSOLE";
        actionReason = `Application has full access to all scopes. Downgrade to 'Specific Google Data' prevents future unauthorized scope expansion.`;
      } else if (isUnconfigured && totalUsers > 0) {
        primaryAction = "Review user business case: Configure to 'Specific Google Data' or Block";
        actionType = "CONSOLE";
        actionReason = `Shadow IT: App has no administrative access policy. ${totalUsers} active domain user(s).`;
      } else {
        primaryAction = "Hygiene audit: Verify necessity or revoke unused authorization";
        actionType = "CONSOLE";
        actionReason = `Application has low/medium exposure or dormant access.`;
      }

      return {
        ...app,
        isRecent,
        totalUsers,
        adminUsers,
        policy,
        isVerified,
        isSecured,
        isTrusted,
        isUnconfigured,
        isUrgent,
        primaryAction,
        actionType,
        actionReason,
        findings,
      };
    });
  }, [apps, findingsByClientId]);

  // Aggregate Lists
  const urgentApps = useMemo(() => classifiedApps.filter(a => a.isUrgent), [classifiedApps]);
  const unconfiguredApps = useMemo(() => classifiedApps.filter(a => a.isUnconfigured && a.totalUsers > 0), [classifiedApps]);
  const trustedApps = useMemo(() => classifiedApps.filter(a => a.isTrusted), [classifiedApps]);
  const securedApps = useMemo(() => classifiedApps.filter(a => a.isSecured), [classifiedApps]);
  const superAdminGroups = useMemo(() => initialRecs?.byAdmin || [], [initialRecs]);

  // Currently Active List based on Tab
  const displayedApps = useMemo(() => {
    let list = activeCategory === "urgent"
      ? urgentApps
      : activeCategory === "unconfigured"
      ? unconfiguredApps
      : activeCategory === "trusted"
      ? trustedApps
      : activeCategory === "secured"
      ? securedApps
      : [];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a =>
        a.displayName.toLowerCase().includes(q) ||
        (a.vendor && a.vendor.toLowerCase().includes(q)) ||
        (a.clientId && a.clientId.toLowerCase().includes(q))
      );
    }

    if (severityFilter !== "ALL") {
      list = list.filter(a => a.riskLevel === severityFilter);
    }

    return list;
  }, [activeCategory, urgentApps, unconfiguredApps, trustedApps, securedApps, searchQuery, severityFilter]);

  const getRiskBadge = (level: string, score?: number) => {
    switch (level?.toUpperCase()) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
            Critical {score ? `(${score.toFixed(1)})` : ""}
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            High {score ? `(${score.toFixed(1)})` : ""}
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-600"></span>
            Medium {score ? `(${score.toFixed(1)})` : ""}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Low {score ? `(${score.toFixed(1)})` : ""}
          </span>
        );
    }
  };

  const getPolicyBadge = (policy: string) => {
    switch (policy) {
      case "SPECIFIC_DATA":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span>🏆</span>
            <span>Specific Google Data (Holy Grail)</span>
          </span>
        );
      case "BLOCKED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <span>🚫</span>
            <span>Blocked</span>
          </span>
        );
      case "LIMITED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <span>🔒</span>
            <span>Limited</span>
          </span>
        );
      case "TRUSTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200" title="Grants unconditional access to all scopes, including future ones">
            <span>🔓</span>
            <span>Trusted (All Scopes)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span>⚠️</span>
            <span>Unconfigured</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 0. ROOT TENANT SECURITY BASELINE CALLOUT                       */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/60 rounded-2xl p-5 shadow-sm text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                🏛️ Domain Baseline Setting
              </span>
              <span className="text-xs text-slate-400 font-semibold">• Google Workspace Default Policy</span>
            </div>
            <h3 className="text-base font-extrabold text-white">
              Unconfigured Third-Party Apps: Mandatory Student Protection Baseline
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Schools are legally responsible for student data access. Verify your domain defaults: 
              <span className="text-emerald-300 font-bold ml-1">Under 18 (Students)</span> should be set to <em>"Don't allow users to access any third-party apps"</em>, while <span className="text-blue-300 font-bold">18 and older (Staff)</span> remains <em>"Allow users to access any third-party apps"</em>.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0 self-start lg:self-center">
            <a
              href="https://admin.google.com/ac/owl/settings#:~:text=%EE%8F%89-,Unconfigured%20third%2Dparty%20apps"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all inline-flex items-center gap-1.5"
            >
              <GoogleAdminIcon className="w-3.5 h-3.5 text-white" />
              <span>Configure in Admin Console ↗</span>
            </a>

            <Link
              href="/dashboard?tab=baseline"
              className="px-3 py-2 bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1"
            >
              <span>Full Guidance Guide →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. EXECUTIVE POSTURE BAR                                       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Urgent Actions */}
        <div 
          onClick={() => setActiveCategory("urgent")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            activeCategory === "urgent"
              ? "bg-gradient-to-br from-red-500/10 to-white border-red-400 ring-2 ring-red-400/30"
              : "bg-white border-gray-200 hover:border-red-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">Immediate Action</span>
            <span className="text-xl">🚨</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{urgentApps.length}</span>
            <span className="text-xs text-gray-500 font-medium">Critical / Escalated</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-600 line-clamp-1">
            Active in last 30d with Super Admin depth or unverified risk.
          </p>
        </div>

        {/* Unconfigured Blindspots */}
        <div 
          onClick={() => setActiveCategory("unconfigured")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            activeCategory === "unconfigured"
              ? "bg-gradient-to-br from-amber-500/10 to-white border-amber-400 ring-2 ring-amber-400/30"
              : "bg-white border-gray-200 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Policy Blindspots</span>
            <span className="text-xl">⚠️</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{unconfiguredApps.length}</span>
            <span className="text-xs text-gray-500 font-medium">Unconfigured Apps</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-600 line-clamp-1">
            Active apps with zero policy in Google Workspace.
          </p>
        </div>

        {/* Overprivileged "Trusted" Apps */}
        <div 
          onClick={() => setActiveCategory("trusted")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            activeCategory === "trusted"
              ? "bg-gradient-to-br from-orange-500/10 to-white border-orange-400 ring-2 ring-orange-400/30"
              : "bg-white border-gray-200 hover:border-orange-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">"Trusted" Overprivilege</span>
            <span className="text-xl">🔓</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{trustedApps.length}</span>
            <span className="text-xs text-gray-500 font-medium">Blanket Trust Apps</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-600 line-clamp-1">
            Grants access to ALL scopes, including future ones.
          </p>
        </div>

        {/* Secured Benchmark ("Holy Grail") */}
        <div 
          onClick={() => setActiveCategory("secured")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            activeCategory === "secured"
              ? "bg-gradient-to-br from-emerald-500/10 to-white border-emerald-400 ring-2 ring-emerald-400/30"
              : "bg-white border-gray-200 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Hardened Baseline</span>
            <span className="text-xl">🏆</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-800">{securedApps.length}</span>
            <span className="text-xs text-emerald-600 font-medium">Holy Grail / Blocked</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-600 line-clamp-1">
            Strict Zero-Trust policy: restricted to Specific Data.
          </p>
        </div>
      </div>


      {/* ============================================================== */}
      {/* 3. SIMPLIFIED NAVIGATION TABS & FILTERS                         */}
      {/* ============================================================== */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Navigation Tabs */}
        <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveCategory("urgent")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeCategory === "urgent" ? "bg-white text-red-600 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>🔥</span>
            <span>Immediate Actions ({urgentApps.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory("unconfigured")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeCategory === "unconfigured" ? "bg-white text-amber-600 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>⚠️</span>
            <span>Unconfigured Apps ({unconfiguredApps.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory("trusted")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeCategory === "trusted" ? "bg-white text-orange-600 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>🔓</span>
            <span>"Trusted" Downgrades ({trustedApps.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory("admins")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeCategory === "admins" ? "bg-white text-purple-600 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>👤</span>
            <span>Super Admin Tokens ({superAdminGroups.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory("secured")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeCategory === "secured" ? "bg-white text-emerald-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>🏆</span>
            <span>Secured ({securedApps.length})</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 sm:w-60">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search application or vendor..."
              className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-2.5 top-2 text-xs text-gray-400">🔍</span>
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600 text-xs">
                ✕
              </button>
            )}
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 font-medium"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">🔴 Critical Only</option>
            <option value="HIGH">🟠 High Only</option>
            <option value="MEDIUM">🟡 Medium Only</option>
          </select>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. RECOMMENDATION CARDS LIST                                   */}
      {/* ============================================================== */}
      {activeCategory !== "admins" ? (
        <div className="space-y-3.5">
          {displayedApps.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
              <span className="text-3xl block mb-2">🎉</span>
              <p className="font-bold text-sm text-gray-800">No applications matching this category or filter.</p>
              <p className="text-xs text-gray-500 mt-1">Try adjusting your search query or severity filter.</p>
            </div>
          ) : (
            displayedApps.map((app) => {
              const isExpanded = !!expandedAppIds[app.id];
              const isCritical = app.riskLevel === "CRITICAL";
              const isHigh = app.riskLevel === "HIGH";

              return (
                <div
                  key={app.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs transition-all ${
                    isCritical
                      ? "border-red-200 hover:border-red-300"
                      : isHigh
                      ? "border-amber-200 hover:border-amber-300"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* App Title & Identity */}
                    <div className="flex items-start gap-3.5">
                      {app.iconUrl ? (
                        <img
                          src={app.iconUrl}
                          alt=""
                          className="w-10 h-10 rounded-xl border border-gray-200 p-0.5 bg-white flex-shrink-0 mt-0.5 shadow-2xs"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-base font-bold text-gray-600 flex-shrink-0 mt-0.5">
                          📦
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-sm text-gray-900">{app.displayName}</h4>
                          {app.isVerified && <GoogleVerifiedBadge size="xs" />}
                          <span className="text-xs text-gray-500">• {app.vendor || "Third-Party Developer"}</span>
                        </div>

                        {/* Multi-Dimensional Badges */}
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          {getRiskBadge(app.riskLevel, app.riskScore)}
                          {getPolicyBadge(app.policy)}

                          {/* Depth: Super Admins */}
                          {app.adminUsers > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-red-50 text-red-700 border border-red-200">
                              <span>👤</span>
                              <span>{app.adminUsers} Super Admin{app.adminUsers > 1 ? "s" : ""}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                              <span>👤</span>
                              <span>0 Admins</span>
                            </span>
                          )}

                          {/* Breadth: Total Users */}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                            <span>👥</span>
                            <span>{app.totalUsers} User{app.totalUsers > 1 ? "s" : ""}</span>
                          </span>

                          {/* Recency */}
                          {app.isRecent ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              <span>Active (Last 30d)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                              <span>💤</span>
                              <span>Dormant (&gt;30d)</span>
                            </span>
                          )}

                          {/* Breach Context if available */}
                          {app.breachHistory && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              <span>⚠️</span>
                              <span>Breach History</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Direct Action Area */}
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <a
                        href="https://admin.google.com/ac/owl/list?tab=apps"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                      >
                        <GoogleAdminIcon className="w-3.5 h-3.5 text-blue-700" />
                        <span>Admin Console ↗</span>
                      </a>

                      <button
                        onClick={() => toggleExpand(app.id)}
                        className="px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                      >
                        {isExpanded ? "Hide Details ▲" : "Details ▾"}
                      </button>
                    </div>
                  </div>

                  {/* Recommendation Directive Bar */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 flex items-center gap-1">
                        <span className="text-blue-600">👉</span> Recommendation:
                      </span>
                      <span className="text-gray-700 font-medium">{app.primaryAction}</span>
                    </div>

                    <div className="text-[11px] text-gray-500 italic">
                      {app.actionReason}
                    </div>
                  </div>

                  {/* Expandable Technical Context Drawer */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3 bg-gray-50/70 -mx-5 -mb-5 p-5 rounded-b-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Governance Analysis */}
                        <div className="space-y-1.5 bg-white p-3 rounded-xl border border-gray-200">
                          <span className="font-bold text-gray-800 uppercase text-[10px] tracking-wider block">
                            Governance Assessment
                          </span>
                          <p className="text-gray-600 leading-relaxed text-xs">
                            {app.description || app.actionReason}
                          </p>
                          <div className="pt-1 text-[11px] text-gray-500">
                            <strong>OAuth Client ID:</strong>{" "}
                            <span className="font-mono text-gray-700">{app.clientId || app.id}</span>
                          </div>
                        </div>

                        {/* Scopes & Permissions */}
                        <div className="space-y-1.5 bg-white p-3 rounded-xl border border-gray-200">
                          <span className="font-bold text-gray-800 uppercase text-[10px] tracking-wider block">
                            Granted OAuth Scopes ({app.scopes?.length || 0})
                          </span>
                          <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                            {(app.scopes || []).map((s, idx) => (
                              <div key={idx} className="flex items-center justify-between text-[11px] font-mono bg-gray-50 p-1 rounded border border-gray-100">
                                <span className="truncate text-gray-700" title={s.scope}>{s.scope}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ml-2 ${
                                  s.riskLevel === "CRITICAL" ? "bg-red-100 text-red-800" :
                                  s.riskLevel === "HIGH" ? "bg-amber-100 text-amber-800" :
                                  "bg-gray-100 text-gray-700"
                                }`}>
                                  {s.riskLevel || "INFO"}
                                </span>
                              </div>
                            ))}
                            {(!app.scopes || app.scopes.length === 0) && (
                              <span className="text-gray-400 text-xs italic">No high-risk sensitive scopes recorded.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ============================================================== */
        /* 5. SUPER ADMIN TOKEN CLEANUPS VIEW                             */
        /* ============================================================== */
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-xs text-purple-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold">Super Admin Privilege Exposure:</span> In Google Workspace, third-party tokens authorized by Super Admins inherit tenant-wide administrative power. Revoking unnecessary tokens directly in the Admin Console minimizes tenant compromise risk.
            </div>
            <a
              href="https://admin.google.com/ac/owl/list?tab=apps"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-sm whitespace-nowrap self-start sm:self-auto inline-flex items-center gap-1.5"
            >
              <GoogleAdminIcon className="w-3.5 h-3.5 text-white" />
              <span>Review Apps in Admin Console ↗</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {superAdminGroups.map((adm) => (
              <div
                key={adm.adminEmail}
                className="bg-white border border-purple-200 rounded-2xl p-5 shadow-xs space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-sm border border-purple-200">
                        {adm.adminEmail[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-gray-900">{adm.adminEmail}</div>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 uppercase">
                          Super Administrator
                        </span>
                      </div>
                    </div>
                    <span className="font-extrabold text-xs text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                      {adm.tokenCount} Tokens
                    </span>
                  </div>

                  {/* List of Authorized Apps for this Admin */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 text-xs bg-gray-50/50">
                    {adm.items.map((item) => (
                      <div key={item.id} className="p-2.5 flex items-center justify-between gap-2 hover:bg-white transition-colors">
                        <div className="truncate">
                          <div className="font-bold text-gray-900 truncate">{item.application}</div>
                          <div className="text-[10px] font-mono text-gray-500 truncate">{item.clientId}</div>
                        </div>
                        <a
                          href="https://admin.google.com/ac/owl/list?tab=apps"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 px-2 py-0.5 rounded hover:bg-blue-50 transition-colors flex-shrink-0 inline-flex items-center gap-1"
                        >
                          <span>Review ↗</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Admin Console Action Link */}
                <a
                  href="https://admin.google.com/ac/owl/list?tab=apps"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-center px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold shadow-xs transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <GoogleAdminIcon className="w-3.5 h-3.5 text-purple-700" />
                  <span>Review Grants for {adm.adminEmail.split("@")[0]} in Admin Console ↗</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
