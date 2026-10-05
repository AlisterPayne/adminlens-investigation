"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

import { GoogleAdminIcon } from "@/components/google-icons";
import GoogleVerifiedBadge from "@/components/google-verified-badge";

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
  breachBracket?: string | null;
  breachDaysElapsed?: number | null;
  breachPenalty?: number;
  breaches?: Array<{ title?: string; date?: string; daysElapsed?: number }>;
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
  confirmedTrustedMap?: Record<string, { confirmedAt: string }>;
  onConfirmTrusted?: (appId: string) => void;
  onUndoConfirmTrusted?: (appId: string) => void;
}

export default function RecommendationsView({
  apps,
  initialRecs,
  confirmedTrustedMap: propConfirmedMap,
  onConfirmTrusted,
  onUndoConfirmTrusted,
}: RecommendationsViewProps) {
  const [activeGroup, setActiveGroup] = useState<"unconfigured" | "trusted" | "admins">("unconfigured");
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [expandedAppIds, setExpandedAppIds] = useState<Record<string, boolean>>({});
  const [showConfirmedTrusted, setShowConfirmedTrusted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Collapsed Tiers State: Tier 1 & Tier 2 uncollapsed by default; Tier 3 & Tier 4 collapsed
  const [collapsedTiers, setCollapsedTiers] = useState<Record<string, boolean>>({
    TIER_1: false, // uncollapsed at top
    TIER_2: false, // uncollapsed
    TIER_3: true,  // moderate Sprawl collapsed
    TIER_4: true,  // dormant Apps collapsed
  });

  const toggleTier = (tier: string) => {
    setCollapsedTiers(prev => ({ ...prev, [tier]: !prev[tier] }));
  };

  // Confirmed Trusted Apps State (Persisted in localStorage or synced with parent)
  const [localConfirmedTrustedMap, setLocalConfirmedTrustedMap] = useState<Record<string, { confirmedAt: string }>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("adminlens_confirmed_trusted_apps");
      if (saved) {
        setLocalConfirmedTrustedMap(JSON.parse(saved));
      }
    } catch (_) {}
  }, []);

  const confirmedTrustedMap = propConfirmedMap || localConfirmedTrustedMap;

  const handleConfirmTrusted = (appId: string, appName: string) => {
    const updated = {
      ...confirmedTrustedMap,
      [appId]: { confirmedAt: new Date().toISOString() },
    };
    setLocalConfirmedTrustedMap(updated);
    try {
      localStorage.setItem("adminlens_confirmed_trusted_apps", JSON.stringify(updated));
    } catch (_) {}

    if (onConfirmTrusted) {
      onConfirmTrusted(appId);
    }

    setToastMessage(`"${appName}" confirmed as Trusted. Removed from review and governance posture score increased!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUndoConfirmTrusted = (appId: string, appName: string) => {
    const updated = { ...confirmedTrustedMap };
    delete updated[appId];
    setLocalConfirmedTrustedMap(updated);
    try {
      localStorage.setItem("adminlens_confirmed_trusted_apps", JSON.stringify(updated));
    } catch (_) {}

    if (onUndoConfirmTrusted) {
      onUndoConfirmTrusted(appId);
    }

    setToastMessage(`"${appName}" restored to pending Trusted review list.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  // Helper to detect breach within the last 3 months (<= 90 days)
  const hasRecentBreach = (app: Application): boolean => {
    if (app.breachBracket === "ACTIVE_CRISIS") return true;
    if (typeof app.breachDaysElapsed === "number" && app.breachDaysElapsed <= 90) return true;
    if (app.breaches && app.breaches.length > 0) {
      return app.breaches.some(b => typeof b.daysElapsed === "number" && b.daysElapsed <= 90);
    }
    return false;
  };

  // Classify and Triage All Applications
  const analyzedApps = useMemo(() => {
    return apps.map((app) => {
      const policy = (app.adminAccessLevel || "UNCONFIGURED").toUpperCase();
      const isSecured = policy === "SPECIFIC_DATA" || policy === "BLOCKED" || policy === "LIMITED";
      const isTrusted = policy === "TRUSTED";
      const isUnconfigured = policy === "UNCONFIGURED";
      
      const isRecent = isAccessedInLast30Days(app);
      const recentBreach = hasRecentBreach(app);
      const totalUsers = app.totalUsersCount || app.users?.length || 0;
      const adminUsers = app.adminUsersCount || app.users?.filter(u => u.isAdmin)?.length || 0;
      const hasSprawl = totalUsers > 1 || adminUsers > 0;
      const isHighOrCrit = app.riskLevel === "CRITICAL" || app.riskLevel === "HIGH" || (app.riskScore ?? 0) >= 4.0;
      const isTrustedConfirmed = Boolean(confirmedTrustedMap[app.id] || (app.clientId && confirmedTrustedMap[app.clientId]));

      // Triage Tier assignment for Unconfigured Apps
      let triageTier: "TIER_1" | "TIER_2" | "TIER_3" | "TIER_4" | "SECURED" | "TRUSTED" = "TIER_4";
      let triageBadge = "";
      let triageDirective = "";

      if (isSecured) {
        triageTier = "SECURED";
        triageBadge = "🏆 Secured Baseline";
        triageDirective = "Compliant. Reviewed and locked to least-privilege policy. No action required.";
      } else if (isTrusted) {
        triageTier = "TRUSTED";
        triageBadge = isTrustedConfirmed ? "✓ Confirmed Trusted" : "⚠️ Review Trusted App";
        triageDirective = isTrustedConfirmed
          ? "Administrator confirmed blanket trusted access. Exempted from risk penalty."
          : "Blanket access to all current and future scopes. Review necessity and confirm or downgrade.";
      } else if (isHighOrCrit && hasSprawl && recentBreach) {
        // TIER 1: Highest / Critical Emergency
        triageTier = "TIER_1";
        triageBadge = "🚨 TIER 1: CRITICAL EMERGENCY";
        triageDirective = "High-privilege sprawl with active vendor breach in the last 3 months. Urgently review: block or configure to 'Specific Google Data' immediately.";
      } else if (isHighOrCrit && (hasSprawl || isRecent)) {
        // TIER 2: High Risk Sprawl (Active Shadow IT)
        triageTier = "TIER_2";
        triageBadge = "🟠 TIER 2: HIGH RISK SPRAWL";
        triageDirective = "Active high-risk shadow IT with wide user adoption or admin access. Configure to 'Specific Google Data' or block.";
      } else if (isRecent && totalUsers > 0) {
        // TIER 3: Moderate / Low Risk Sprawl
        triageTier = "TIER_3";
        triageBadge = "🟡 TIER 3: MODERATE SPRAWL";
        triageDirective = "Moderate/low scope shadow IT in active use. Audit business need and set to Limited or Specific Google Data.";
      } else {
        // TIER 4: Dormant Unconfigured Apps
        triageTier = "TIER_4";
        triageBadge = "⚪ TIER 4: DORMANT SHADOW IT";
        triageDirective = "Dormant (>30d inactive). Revoke stale user authorization grants in Google Admin Console to reduce attack surface.";
      }

      return {
        ...app,
        policy,
        isSecured,
        isTrusted,
        isUnconfigured,
        isRecent,
        recentBreach,
        totalUsers,
        adminUsers,
        hasSprawl,
        isTrustedConfirmed,
        triageTier,
        triageBadge,
        triageDirective,
      };
    });
  }, [apps, confirmedTrustedMap]);

  // Aggregate Lists
  const securedApps = useMemo(() => analyzedApps.filter(a => a.isSecured), [analyzedApps]);
  const unconfiguredApps = useMemo(() => analyzedApps.filter(a => a.isUnconfigured), [analyzedApps]);
  const trustedApps = useMemo(() => analyzedApps.filter(a => a.isTrusted), [analyzedApps]);
  const pendingTrustedApps = useMemo(() => trustedApps.filter(a => !a.isTrustedConfirmed), [trustedApps]);
  const confirmedTrustedApps = useMemo(() => trustedApps.filter(a => a.isTrustedConfirmed), [trustedApps]);
  const superAdminGroups = useMemo(() => initialRecs?.byAdmin || [], [initialRecs]);

  // Tier Counts for Unconfigured
  const tier1Count = useMemo(() => unconfiguredApps.filter(a => a.triageTier === "TIER_1").length, [unconfiguredApps]);
  const tier2Count = useMemo(() => unconfiguredApps.filter(a => a.triageTier === "TIER_2").length, [unconfiguredApps]);
  const tier3Count = useMemo(() => unconfiguredApps.filter(a => a.triageTier === "TIER_3").length, [unconfiguredApps]);
  const tier4Count = useMemo(() => unconfiguredApps.filter(a => a.triageTier === "TIER_4").length, [unconfiguredApps]);

  // Overall Domain Third-Party Risk Score Calculation (0 - 100)
  // Dynamically recalculates as unconfigured apps are managed and trusted apps are confirmed
  const domainRiskMetrics = useMemo(() => {
    // Scoring model:
    // Tier 1 unconfigured: 25 pts each
    // Tier 2 unconfigured: 12 pts each
    // Tier 3 unconfigured: 4 pts each
    // Tier 4 unconfigured: 1 pt each
    // Unconfirmed Trusted apps: 8 pts each
    // Confirmed Trusted apps: 0 pts (exempted)
    // Secured apps: 0 pts
    const rawPenalty = 
      (tier1Count * 25) + 
      (tier2Count * 12) + 
      (tier3Count * 4) + 
      (tier4Count * 1) + 
      (pendingTrustedApps.length * 8);

    const score = Math.min(100, Math.max(8, rawPenalty));

    let level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "LOW";
    let colorClass = "text-emerald-700 bg-emerald-100 border-emerald-300";

    if (score >= 75 || tier1Count > 0) {
      level = "CRITICAL";
      colorClass = "text-red-700 bg-red-100 border-red-300";
    } else if (score >= 45 || tier2Count > 0) {
      level = "HIGH";
      colorClass = "text-amber-700 bg-amber-100 border-amber-300";
    } else if (score >= 20 || pendingTrustedApps.length > 0) {
      level = "MEDIUM";
      colorClass = "text-yellow-700 bg-yellow-100 border-yellow-300";
    }

    return { score, level, colorClass };
  }, [tier1Count, tier2Count, tier3Count, tier4Count, pendingTrustedApps]);

  // Filtered Unconfigured List
  const displayedUnconfigured = useMemo(() => {
    let list = [...unconfiguredApps];

    // Sort order: Tier 1 -> Tier 2 -> Tier 3 -> Tier 4
    const tierWeight = { TIER_1: 4, TIER_2: 3, TIER_3: 2, TIER_4: 1 };
    list.sort((a, b) => (tierWeight[b.triageTier as keyof typeof tierWeight] || 0) - (tierWeight[a.triageTier as keyof typeof tierWeight] || 0));

    if (tierFilter !== "ALL") {
      list = list.filter(a => a.triageTier === tierFilter);
    }

    if (severityFilter !== "ALL") {
      list = list.filter(a => a.riskLevel === severityFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => 
        a.displayName.toLowerCase().includes(q) ||
        (a.vendor && a.vendor.toLowerCase().includes(q)) ||
        (a.clientId && a.clientId.toLowerCase().includes(q))
      );
    }

    return list;
  }, [unconfiguredApps, tierFilter, severityFilter, searchQuery]);

  // Displayed Trusted List
  const displayedTrusted = useMemo(() => {
    let list = showConfirmedTrusted ? confirmedTrustedApps : pendingTrustedApps;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => 
        a.displayName.toLowerCase().includes(q) ||
        (a.vendor && a.vendor.toLowerCase().includes(q)) ||
        (a.clientId && a.clientId.toLowerCase().includes(q))
      );
    }
    return list;
  }, [showConfirmedTrusted, confirmedTrustedApps, pendingTrustedApps, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}



      {/* ============================================================== */}
      {/* 1. INFORMATIONAL TOP POSTURE METRIC CARDS                      */}
      {/* NOTE: Strictly informational summaries. NOT clickable/filters! */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* CARD 1: Unconfigured Apps (Needs Triage) */}
        <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs select-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Unconfigured Apps
            </span>
            <span className="text-xl">⚠️</span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">{unconfiguredApps.length}</span>
            <span className="text-xs text-amber-700 font-semibold">Need Triage</span>
          </div>
          <p className="mt-1.5 text-[11px] text-gray-500 leading-relaxed">
            <strong className="text-red-600">{tier1Count} Critical Emergency</strong> • {tier2Count} High Sprawl • {tier3Count + tier4Count} Moderate/Dormant
          </p>
        </div>

        {/* CARD 3: Review Trusted Apps */}
        <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs select-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
              Review Trusted Apps
            </span>
            <span className="text-xl">🔓</span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">{pendingTrustedApps.length}</span>
            <span className="text-xs text-orange-700 font-semibold">Pending Review</span>
          </div>
          <p className="mt-1.5 text-[11px] text-gray-500 leading-relaxed">
            Blanket bypass for all scopes. {confirmedTrustedApps.length} already confirmed by IT admin.
          </p>
        </div>

        {/* CARD 4: Hardened Baseline ("The Holy Grail") */}
        <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-xs select-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Secured Baseline
            </span>
            <span className="text-xl">🏆</span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-950">{securedApps.length}</span>
            <span className="text-xs text-emerald-700 font-bold">The Holy Grail</span>
          </div>
          <p className="mt-1.5 text-[11px] text-emerald-800 leading-relaxed">
            Configured as Specific Google Data, Limited, or Blocked. Zero recommendations generated.
          </p>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 2. DEDICATED NAVIGATION TABS & FILTERS                         */}
      {/* ============================================================== */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Navigation Tabs */}
        <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200 overflow-x-auto">
          
          {/* TAB 1: UNCONFIGURED TRIAGE (CORE FOCUS) */}
          <button
            onClick={() => setActiveGroup("unconfigured")}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeGroup === "unconfigured" ? "bg-white text-amber-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>⚠️</span>
            <span>Unconfigured Apps ({unconfiguredApps.length})</span>
            {tier1Count > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">
                {tier1Count} Critical
              </span>
            )}
          </button>

          {/* TAB 2: REVIEW TRUSTED APPLICATIONS (STANDALONE GROUP) */}
          <button
            onClick={() => setActiveGroup("trusted")}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeGroup === "trusted" ? "bg-white text-orange-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>🔓</span>
            <span>Review Trusted Apps ({pendingTrustedApps.length})</span>
          </button>

          {/* TAB 3: SUPER ADMIN TOKENS */}
          <button
            onClick={() => setActiveGroup("admins")}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeGroup === "admins" ? "bg-white text-purple-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>👤</span>
            <span>Super Admin Tokens ({superAdminGroups.length})</span>
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

          {activeGroup === "unconfigured" && (
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 font-medium"
            >
              <option value="ALL">All Triage Tiers</option>
              <option value="TIER_1">🚨 Tier 1: Critical Emergency ({tier1Count})</option>
              <option value="TIER_2">🟠 Tier 2: High Risk Sprawl ({tier2Count})</option>
              <option value="TIER_3">🟡 Tier 3: Moderate Sprawl ({tier3Count})</option>
              <option value="TIER_4">⚪ Tier 4: Dormant Apps ({tier4Count})</option>
            </select>
          )}

          {activeGroup === "unconfigured" && (
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 font-medium"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">🔴 Critical Only</option>
              <option value="HIGH">🟠 High Only</option>
              <option value="MEDIUM">🟡 Medium Only</option>
              <option value="LOW">🔵 Low Only</option>
            </select>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. GROUP A: UNCONFIGURED APPLICATIONS (GROUPED BY TIER)        */}
      {/* ============================================================== */}
      {activeGroup === "unconfigured" && (() => {
        const tiersConfig = [
          {
            id: "TIER_1",
            name: "Tier 1: Critical Emergency (Recent Breach ≤ 90d + High Risk Sprawl)",
            badgeColor: "bg-red-100 text-red-900 border-red-300",
            description: "Highest priority triage: Broad user adoption or admin access with an active vendor breach in the last 3 months.",
            icon: "🚨",
            accentBorder: "border-l-4 border-l-red-500",
            apps: displayedUnconfigured.filter(a => a.triageTier === "TIER_1"),
          },
          {
            id: "TIER_2",
            name: "Tier 2: High Risk Sprawl (Active Shadow IT)",
            badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
            description: "High-privilege Google API scopes in active use across domain users or administrators.",
            icon: "🟠",
            accentBorder: "border-l-4 border-l-amber-500",
            apps: displayedUnconfigured.filter(a => a.triageTier === "TIER_2"),
          },
          {
            id: "TIER_3",
            name: "Tier 3: Moderate Sprawl",
            badgeColor: "bg-yellow-100 text-yellow-900 border-yellow-300",
            description: "Moderate and low-sensitivity scopes in active use. Audit and assign policy as required.",
            icon: "🟡",
            accentBorder: "border-l-4 border-l-yellow-400",
            apps: displayedUnconfigured.filter(a => a.triageTier === "TIER_3"),
          },
          {
            id: "TIER_4",
            name: "Tier 4: Dormant Apps",
            badgeColor: "bg-slate-100 text-slate-700 border-slate-300",
            description: "Inactive applications (>30 days since last access). Revoke stale user authorization grants in Google Admin Console.",
            icon: "⚪",
            accentBorder: "border-l-4 border-l-slate-400",
            apps: displayedUnconfigured.filter(a => a.triageTier === "TIER_4"),
          },
        ];

        const renderAppCard = (app: any) => {
          const isExpanded = !!expandedAppIds[app.id];
          const isTier1 = app.triageTier === "TIER_1";
          const isTier2 = app.triageTier === "TIER_2";

          return (
            <div
              key={app.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs transition-all ${
                isTier1
                  ? "border-red-300 ring-1 ring-red-300/40 hover:border-red-400"
                  : isTier2
                  ? "border-amber-200 hover:border-amber-300"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* App Header & Identity */}
                <div className="flex items-start gap-3.5">
                  {app.iconUrl ? (
                    <img
                      src={app.iconUrl}
                      alt=""
                      className="w-11 h-11 rounded-xl border border-gray-200 p-0.5 bg-white flex-shrink-0 mt-0.5 shadow-2xs"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-base font-bold text-gray-600 flex-shrink-0 mt-0.5">
                      📦
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-gray-900">{app.displayName}</h4>
                      {app.isVerified && <GoogleVerifiedBadge size="xs" />}
                      <span className="text-xs text-gray-500">• {app.vendor || "Third-Party Developer"}</span>
                    </div>

                    {/* Multi-Dimensional Badges */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      {/* Triage Tier Badge */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                        isTier1 ? "bg-red-100 text-red-900 border border-red-300 animate-pulse" :
                        isTier2 ? "bg-amber-100 text-amber-900 border border-amber-300" :
                        app.triageTier === "TIER_3" ? "bg-yellow-100 text-yellow-900 border border-yellow-300" :
                        "bg-slate-100 text-slate-700 border border-slate-300"
                      }`}>
                        {app.triageBadge}
                      </span>

                      {/* Risk Level Badge */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        app.riskLevel === "CRITICAL" ? "bg-red-50 text-red-800 border border-red-200" :
                        app.riskLevel === "HIGH" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                        app.riskLevel === "MEDIUM" ? "bg-yellow-50 text-yellow-800 border border-yellow-200" :
                        "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}>
                        Risk: {app.riskLevel} {app.riskScore ? `(${app.riskScore.toFixed(1)})` : ""}
                      </span>

                      {/* Recent Breach Highlight (Tier 1 Factor) */}
                      {app.recentBreach && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                          <span>🚨</span>
                          <span>Recent Breach (≤90 Days)</span>
                        </span>
                      )}

                      {/* Historical Breach if not recent */}
                      {app.breachHistory && !app.recentBreach && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          <span>⚠️</span>
                          <span>Historical Breach</span>
                        </span>
                      )}

                      {/* Super Admin Exposure */}
                      {app.adminUsers > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300">
                          <span>👤</span>
                          <span>{app.adminUsers} Super Admin{app.adminUsers > 1 ? "s" : ""}</span>
                        </span>
                      )}

                      {/* Total Users / Sprawl */}
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
                    </div>
                  </div>
                </div>

                {/* Direct Admin Action Link & Drawer Toggle */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <a
                    href="https://admin.google.com/ac/owl/list?tab=apps"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                  >
                    <GoogleAdminIcon className="w-3.5 h-3.5 text-blue-700" />
                    <span>Configure in Admin Console ↗</span>
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
                  <span className="font-bold text-gray-900 flex items-center gap-1">
                    <span className="text-blue-600">👉</span> Directive:
                  </span>
                  <span className="text-gray-700 font-medium">{app.triageDirective}</span>
                </div>

                <div className="text-[11px] font-mono text-gray-400">
                  Client ID: {app.clientId || app.id}
                </div>
              </div>

              {/* Expandable Technical Context Drawer */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3 bg-gray-50/70 -mx-5 -mb-5 p-5 rounded-b-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5 bg-white p-3 rounded-xl border border-gray-200">
                      <span className="font-bold text-gray-800 uppercase text-[10px] tracking-wider block">
                        Governance Assessment
                      </span>
                      <p className="text-gray-600 leading-relaxed text-xs">
                        {app.description || `Application is operating in unconfigured state across ${app.totalUsers} domain accounts.`}
                      </p>
                      {app.recentBreach && (
                        <div className="mt-2 p-2 rounded bg-red-50 border border-red-200 text-red-800 text-[11px]">
                          <strong>Breach Alert:</strong> Vendor recorded a security compromise within the last 90 days. High probability of circulating tokens.
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 bg-white p-3 rounded-xl border border-gray-200">
                      <span className="font-bold text-gray-800 uppercase text-[10px] tracking-wider block">
                        Granted OAuth Scopes ({app.scopes?.length || 0})
                      </span>
                      <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                        {(app.scopes || []).map((s: any, idx: number) => (
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
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        };

        return (
          <div className="space-y-6">


            {displayedUnconfigured.length === 0 ? (
              <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
                <span className="text-3xl block mb-2">🎉</span>
                <p className="font-bold text-sm text-gray-800">No unconfigured applications matching your filters.</p>
                <p className="text-xs text-gray-500 mt-1">All applications are either configured or do not match the current search query.</p>
              </div>
            ) : (
              tiersConfig.map((tier) => {
                if (tier.apps.length === 0) return null;
                const isCollapsed = Boolean(collapsedTiers[tier.id]);

                return (
                  <div key={tier.id} className="space-y-3">
                    {/* Collapsible Tier Header */}
                    <div
                      onClick={() => toggleTier(tier.id)}
                      className={`p-4 bg-white hover:bg-gray-50/90 border border-gray-200 rounded-2xl transition-all cursor-pointer shadow-xs flex items-center justify-between gap-3 select-none ${tier.accentBorder}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl flex-shrink-0">{tier.icon}</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-extrabold text-xs sm:text-sm text-gray-900">
                              {tier.name}
                            </h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${tier.badgeColor}`}>
                              {tier.apps.length} app{tier.apps.length > 1 ? "s" : ""}
                            </span>
                            {tier.id === "TIER_1" && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white animate-pulse">
                                Immediate Action
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {tier.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-bold text-gray-500">
                          {isCollapsed ? `Expand (${tier.apps.length})` : "Collapse"}
                        </span>
                        <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 transition-transform">
                          {isCollapsed ? "▼" : "▲"}
                        </span>
                      </div>
                    </div>

                    {/* Tier Apps List (Only when not collapsed) */}
                    {!isCollapsed && (
                      <div className="space-y-3 pl-1 sm:pl-3">
                        {tier.apps.map(app => renderAppCard(app))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* 4. GROUP B: REVIEW TRUSTED APPLICATIONS (STANDALONE GROUP)     */}
      {/* ============================================================== */}
      {activeGroup === "trusted" && (
        <div className="space-y-4">
          <div className="bg-orange-50/60 border border-orange-200/80 rounded-xl px-4 py-3 text-xs text-orange-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-orange-900">Review Trusted Apps:</span>
              <span className="text-orange-850">Confirm applications that legitimately require blanket Google Workspace access.</span>
            </div>
            
            <button
              onClick={() => setShowConfirmedTrusted(!showConfirmedTrusted)}
              className="px-3 py-1.5 bg-white hover:bg-orange-100 text-orange-900 border border-orange-300 rounded-lg text-xs font-medium transition-colors whitespace-nowrap self-start sm:self-auto flex-shrink-0"
            >
              {showConfirmedTrusted ? `View Pending (${pendingTrustedApps.length})` : `View Confirmed (${confirmedTrustedApps.length})`}
            </button>
          </div>

          {displayedTrusted.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
              <span className="text-3xl block mb-2">🎉</span>
              <p className="font-bold text-sm text-gray-800">
                {showConfirmedTrusted
                  ? "No trusted applications have been confirmed yet."
                  : "All trusted applications have been reviewed and confirmed!"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {showConfirmedTrusted
                  ? "Confirm trusted apps from the pending review list to view them here."
                  : "Zero unreviewed blanket-trusted apps remain in your tenant."}
              </p>
            </div>
          ) : (
            displayedTrusted.map((app) => (
              <div
                key={app.id}
                className="bg-white border border-orange-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  {app.iconUrl ? (
                    <img
                      src={app.iconUrl}
                      alt=""
                      className="w-11 h-11 rounded-xl border border-gray-200 p-0.5 bg-white flex-shrink-0 mt-0.5 shadow-2xs"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-base font-bold text-gray-600 flex-shrink-0 mt-0.5">
                      📦
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-gray-900">{app.displayName}</h4>
                      {app.isVerified && <GoogleVerifiedBadge size="xs" />}
                      <span className="text-xs text-gray-500">• {app.vendor || "Third-Party Developer"}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-900 border border-orange-300">
                        <span>🔓</span>
                        <span>Configured as Trusted in Admin Console</span>
                      </span>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                        <span>👥</span>
                        <span>{app.totalUsers} User{app.totalUsers > 1 ? "s" : ""}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                        <span>🔑</span>
                        <span>{app.scopes?.length || 0} Scope{app.scopes?.length === 1 ? "" : "s"}</span>
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 pt-1">
                      {app.isTrustedConfirmed
                        ? `Confirmed by IT Administrator on ${new Date(confirmedTrustedMap[app.id]?.confirmedAt || Date.now()).toLocaleDateString()}. Blanket trust accepted.`
                        : "Grants unrestricted access to all current and future scopes. Confirm if this broad authorization is approved by your institution."}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 flex-shrink-0 self-start sm:self-center">
                  {!app.isTrustedConfirmed ? (
                    <button
                      onClick={() => handleConfirmTrusted(app.id, app.displayName)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>✓</span>
                      <span>Confirm Trusted Setting</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUndoConfirmTrusted(app.id, app.displayName)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Undo Confirmation
                    </button>
                  )}

                  <a
                    href="https://admin.google.com/ac/owl/list?tab=apps"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1"
                  >
                    <GoogleAdminIcon className="w-3.5 h-3.5 text-blue-700" />
                    <span>Admin Console ↗</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. GROUP C: SUPER ADMIN TOKEN HYGIENE                          */}
      {/* ============================================================== */}
      {activeGroup === "admins" && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-xs text-purple-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold">Super Admin Privilege Exposure:</span> Third-party tokens authorized by Super Admins inherit tenant-wide administrative delegation. Revoking unnecessary admin tokens directly minimizes tenant takeover exposure.
            </div>
            <a
              href="https://admin.google.com/ac/owl/list?tab=apps"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-sm whitespace-nowrap self-start sm:self-auto inline-flex items-center gap-1.5"
            >
              <GoogleAdminIcon className="w-3.5 h-3.5 text-white" />
              <span>Review in Admin Console ↗</span>
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
