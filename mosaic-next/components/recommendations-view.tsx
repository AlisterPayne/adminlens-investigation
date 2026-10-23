"use client";

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
  isNewlyRequested?: boolean;
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
  accessPolicy?: {
    accessLevel?: string;
    orgUnitPath?: string;
    configuredBy?: string;
    lastPolicyUpdate?: string | null;
  };
  lastReviewedAt?: string | null;
  hasNewScopes?: boolean;
  newlyRequestedScopesCount?: number;
  newlyRequestedScopes?: string[];
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

  // Tier 1 & Tier 2 expanded by default; Tier 3 & Tier 4 collapsed
  const [collapsedTiers, setCollapsedTiers] = useState<Record<string, boolean>>({
    TIER_1: false,
    TIER_2: false,
    TIER_3: true,
    TIER_4: true,
  });

  const toggleTier = (tier: string) => {
    setCollapsedTiers((prev) => ({ ...prev, [tier]: !prev[tier] }));
  };

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

    setToastMessage(`"${appName}" marked as reviewed for 6 months.`);
    setTimeout(() => setToastMessage(null), 3500);
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

    setToastMessage(`"${appName}" restored to pending review.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleExpand = (id: string) => {
    setExpandedAppIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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

  // Classify and Triage All Applications using the AdminLens Governance Decision Tree
  const analyzedApps = useMemo(() => {
    const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;
    const nowMs = Date.now();

    return apps.map((app) => {
      const policy = (app.adminAccessLevel || "UNCONFIGURED").toUpperCase();
      const isSecured = policy === "SPECIFIC_DATA" || policy === "BLOCKED" || policy === "LIMITED";
      const isTrusted = policy === "TRUSTED";
      const isUnconfigured = policy === "UNCONFIGURED";

      const isRecent = isAccessedInLast30Days(app);
      const totalUsers = app.totalUsersCount || app.users?.length || 0;
      const adminUsers = app.adminUsersCount || app.users?.filter((u) => u.isAdmin)?.length || 0;
      const hasSprawl = totalUsers > 1 || adminUsers > 0;
      const riskScore = typeof app.riskScore === "number" ? app.riskScore : 1.0;
      const isHighOrCrit = app.riskLevel === "CRITICAL" || app.riskLevel === "HIGH" || riskScore > 3.0;
      const isCritRisk = app.riskLevel === "CRITICAL" || riskScore >= 4.0;

      const confirmRecord = confirmedTrustedMap[app.id] || (app.clientId ? confirmedTrustedMap[app.clientId] : undefined);
      const lastReviewedStr = confirmRecord?.confirmedAt || (app as any).lastReviewedAt || null;
      const reviewedWithinSixMonths = lastReviewedStr
        ? nowMs - new Date(lastReviewedStr).getTime() <= SIX_MONTHS_MS
        : false;

      // Gate T1: New Scope Requested?
      const hasNewScopes = Boolean(app.hasNewScopes && (app.newlyRequestedScopesCount || 0) > 0);
      const newScopeObjs = (app.scopes || []).filter(
        (s: any) => s.isNewlyRequested || (app.newlyRequestedScopes || []).includes(s.scope)
      );

      let trustedNeedsReview = false;
      let trustedSeverity: "CRITICAL" | "HIGH" | "MEDIUM" | "NONE" = "NONE";
      let trustedGateReason = "";
      let trustedScopeCategory: "Restricted" | "Sensitive" | "Non-Sensitive" | null = null;

      if (isTrusted) {
        if (hasNewScopes) {
          trustedNeedsReview = true;
          const hasRestricted = newScopeObjs.some((s: any) => s.googleTier === "Restricted");
          const hasSensitive = newScopeObjs.some((s: any) => s.googleTier === "Sensitive");
          if (hasRestricted) {
            trustedSeverity = "CRITICAL";
            trustedScopeCategory = "Restricted";
            trustedGateReason = `New Restricted scope (${newScopeObjs.length}) requested`;
          } else if (hasSensitive) {
            trustedSeverity = "HIGH";
            trustedScopeCategory = "Sensitive";
            trustedGateReason = `New Sensitive scope (${newScopeObjs.length}) requested`;
          } else {
            trustedSeverity = "MEDIUM";
            trustedScopeCategory = "Non-Sensitive";
            trustedGateReason = `New Non-Sensitive scope (${newScopeObjs.length}) requested`;
          }
        } else if (reviewedWithinSixMonths) {
          trustedNeedsReview = false;
          trustedSeverity = "NONE";
          trustedGateReason = `Reviewed ${new Date(lastReviewedStr!).toLocaleDateString()} (< 6 mo)`;
        } else {
          if (isHighOrCrit) {
            trustedNeedsReview = true;
            trustedSeverity = isCritRisk ? "CRITICAL" : "HIGH";
            trustedGateReason = `Last review ≥ 6 mo • ${app.riskLevel} risk (${riskScore.toFixed(1)})`;
          } else {
            trustedNeedsReview = false;
            trustedSeverity = "NONE";
            trustedGateReason = `Score ${riskScore.toFixed(1)} (1–3 Low/Mod risk)`;
          }
        }
      }

      let triageTier: "TIER_1" | "TIER_2" | "TIER_3" | "TIER_4" | "SECURED" | "TRUSTED" = "TIER_4";
      let triggerSummary = "";
      let recommendedPolicy = "Specific Google Data";
      let policyNote = "Lock current scopes";

      if (isSecured) {
        triageTier = "SECURED";
        triggerSummary = "Configured baseline";
      } else if (isTrusted) {
        triageTier = "TRUSTED";
        triggerSummary = trustedGateReason;
      } else if (isHighOrCrit && (!app.isVerified || !isRecent || totalUsers <= 1)) {
        const triggers = [
          !app.isVerified ? "Unverified" : null,
          totalUsers <= 1 ? "Single user" : null,
          !isRecent ? "Dormant >30d" : null,
        ]
          .filter(Boolean)
          .join(" · ");
        triageTier = "TIER_1";
        triggerSummary = triggers || "High/Critical risk";
        policyNote = "Or Block only if known school risk";
      } else if (isHighOrCrit && hasSprawl && isRecent) {
        triageTier = "TIER_2";
        triggerSummary = `Verified · Active sprawl (${totalUsers} users)`;
        policyNote = "Prevent silent scope escalation";
      } else if (isRecent && totalUsers > 0) {
        triageTier = "TIER_3";
        triggerSummary = `Active ≤30d · Mod/Low risk`;
        policyNote = "Lock baseline scopes";
      } else {
        triageTier = "TIER_4";
        triggerSummary = "Dormant >30d · Mod/Low risk";
        policyNote = "Lock baseline scopes";
      }

      return {
        ...app,
        policy,
        isSecured,
        isTrusted,
        isUnconfigured,
        isRecent,
        totalUsers,
        adminUsers,
        hasSprawl,
        riskScore,
        trustedNeedsReview,
        trustedSeverity,
        trustedGateReason,
        trustedScopeCategory,
        reviewedWithinSixMonths,
        lastReviewedStr,
        triageTier,
        triggerSummary,
        recommendedPolicy,
        policyNote,
      };
    });
  }, [apps, confirmedTrustedMap]);

  const securedApps = useMemo(() => analyzedApps.filter((a) => a.isSecured), [analyzedApps]);
  const unconfiguredApps = useMemo(() => analyzedApps.filter((a) => a.isUnconfigured), [analyzedApps]);
  const trustedApps = useMemo(() => analyzedApps.filter((a) => a.isTrusted), [analyzedApps]);
  const pendingTrustedApps = useMemo(() => trustedApps.filter((a) => a.trustedNeedsReview), [trustedApps]);
  const confirmedTrustedApps = useMemo(() => trustedApps.filter((a) => !a.trustedNeedsReview), [trustedApps]);
  const superAdminGroups = useMemo(() => initialRecs?.byAdmin || [], [initialRecs]);

  const tier1Count = useMemo(() => unconfiguredApps.filter((a) => a.triageTier === "TIER_1").length, [unconfiguredApps]);
  const tier2Count = useMemo(() => unconfiguredApps.filter((a) => a.triageTier === "TIER_2").length, [unconfiguredApps]);
  const tier3Count = useMemo(() => unconfiguredApps.filter((a) => a.triageTier === "TIER_3").length, [unconfiguredApps]);
  const tier4Count = useMemo(() => unconfiguredApps.filter((a) => a.triageTier === "TIER_4").length, [unconfiguredApps]);

  const displayedUnconfigured = useMemo(() => {
    let list = [...unconfiguredApps];
    const tierWeight = { TIER_1: 4, TIER_2: 3, TIER_3: 2, TIER_4: 1 };
    list.sort(
      (a, b) =>
        (tierWeight[b.triageTier as keyof typeof tierWeight] || 0) -
        (tierWeight[a.triageTier as keyof typeof tierWeight] || 0)
    );

    if (tierFilter !== "ALL") {
      list = list.filter((a) => a.triageTier === tierFilter);
    }
    if (severityFilter !== "ALL") {
      list = list.filter((a) => a.riskLevel === severityFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.displayName.toLowerCase().includes(q) ||
          (a.vendor && a.vendor.toLowerCase().includes(q)) ||
          (a.clientId && a.clientId.toLowerCase().includes(q))
      );
    }
    return list;
  }, [unconfiguredApps, tierFilter, severityFilter, searchQuery]);

  const displayedTrusted = useMemo(() => {
    let list = showConfirmedTrusted ? confirmedTrustedApps : pendingTrustedApps;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.displayName.toLowerCase().includes(q) ||
          (a.vendor && a.vendor.toLowerCase().includes(q)) ||
          (a.clientId && a.clientId.toLowerCase().includes(q))
      );
    }
    return list;
  }, [showConfirmedTrusted, confirmedTrustedApps, pendingTrustedApps, searchQuery]);

  const renderRiskBadge = (riskLevel: string, riskScore?: number) => {
    const scoreStr = typeof riskScore === "number" ? ` (${riskScore.toFixed(1)})` : "";
    if (riskLevel === "CRITICAL") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          Critical{scoreStr}
        </span>
      );
    }
    if (riskLevel === "HIGH") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          High{scoreStr}
        </span>
      );
    }
    if (riskLevel === "MEDIUM") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
          Medium{scoreStr}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Low{scoreStr}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium flex items-center gap-2">
          <span className="text-emerald-400">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top KPI Cards — matching applications-view.tsx */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold uppercase text-gray-400">Unconfigured Apps</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{unconfiguredApps.length}</div>
          <div className="text-xs text-gray-500 mt-1">
            <span className="text-rose-600 font-semibold">{tier1Count} Tier 1</span> ·{" "}
            <span className="text-amber-600 font-semibold">{tier2Count} Tier 2</span> ·{" "}
            <span>{tier3Count + tier4Count} Tier 3–4</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold uppercase text-gray-400">Tier 1 Critical Review</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{tier1Count}</div>
          <div className="text-xs text-gray-500 mt-1">High/Critical unverified, single-user, or dormant</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold uppercase text-gray-400">Trusted App Reviews</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{pendingTrustedApps.length}</div>
          <div className="text-xs text-gray-500 mt-1">
            {confirmedTrustedApps.length} compliant (&lt;6 mo or low risk)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold uppercase text-gray-400">Secured Baseline</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{securedApps.length}</div>
          <div className="text-xs text-gray-500 mt-1">Specific Google Data, Limited, or Blocked</div>
        </div>
      </div>

      {/* Controls & Filter Bar — matching applications-view.tsx */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-4">
        {/* Underline Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveGroup("unconfigured")}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeGroup === "unconfigured"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>Unconfigured Apps ({unconfiguredApps.length})</span>
            {tier1Count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                {tier1Count} Tier 1
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveGroup("trusted")}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeGroup === "trusted"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Trusted Reviews ({pendingTrustedApps.length})</span>
          </button>

          <button
            onClick={() => setActiveGroup("admins")}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeGroup === "admins"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span>Super Admin Grants ({superAdminGroups.length})</span>
          </button>
        </div>

        {/* Search & Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="flex-1 min-w-[240px] max-w-md relative">
              <input
                type="text"
                placeholder="Search application, vendor, or Client ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
              <svg
                className="w-4 h-4 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {activeGroup === "unconfigured" && (
              <>
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="py-2 px-3 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                >
                  <option value="ALL">All Tiers ({unconfiguredApps.length})</option>
                  <option value="TIER_1">Tier 1: Critical Review ({tier1Count})</option>
                  <option value="TIER_2">Tier 2: High Risk Sprawl ({tier2Count})</option>
                  <option value="TIER_3">Tier 3: Moderate / Low ({tier3Count})</option>
                  <option value="TIER_4">Tier 4: Dormant ({tier4Count})</option>
                </select>

                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="py-2 px-3 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="CRITICAL">Critical Risk</option>
                  <option value="HIGH">High Risk</option>
                  <option value="MEDIUM">Medium Risk</option>
                  <option value="LOW">Low Risk</option>
                </select>
              </>
            )}

            {activeGroup === "trusted" && (
              <button
                onClick={() => setShowConfirmedTrusted(!showConfirmedTrusted)}
                className="py-2 px-3 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-2xs"
              >
                {showConfirmedTrusted
                  ? `Show Actionable Reviews (${pendingTrustedApps.length})`
                  : `Show Compliant Trusted (${confirmedTrustedApps.length})`}
              </button>
            )}
          </div>

          {(searchQuery || tierFilter !== "ALL" || severityFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setTierFilter("ALL");
                setSeverityFilter("ALL");
              }}
              className="text-xs text-emerald-600 hover:text-emerald-800 font-medium hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: UNCONFIGURED APPLICATIONS (GROUPED BY TIER) */}
      {activeGroup === "unconfigured" && (() => {
        const tiersConfig = [
          {
            id: "TIER_1",
            name: "Tier 1 — High & Critical Risk (Unverified, Single-User, or Dormant)",
            dotColor: "bg-rose-500",
            badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
            subtitle: "Set validated apps to Specific Google Data. Block only if known school safety risk.",
            apps: displayedUnconfigured.filter((a) => a.triageTier === "TIER_1"),
          },
          {
            id: "TIER_2",
            name: "Tier 2 — High Risk Sprawl (Verified & Active)",
            dotColor: "bg-amber-500",
            badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
            subtitle: "Set to Specific Google Data to approve current scopes and prevent silent escalation.",
            apps: displayedUnconfigured.filter((a) => a.triageTier === "TIER_2"),
          },
          {
            id: "TIER_3",
            name: "Tier 3 — Moderate & Low Risk Sprawl (Active ≤30d)",
            dotColor: "bg-yellow-500",
            badgeColor: "bg-yellow-50 text-yellow-700 border-yellow-200",
            subtitle: "Set to Specific Google Data to lock the baseline scope footprint.",
            apps: displayedUnconfigured.filter((a) => a.triageTier === "TIER_3"),
          },
          {
            id: "TIER_4",
            name: "Tier 4 — Dormant Applications (>30d Inactive)",
            dotColor: "bg-gray-400",
            badgeColor: "bg-gray-100 text-gray-700 border-gray-200",
            subtitle: "Review in Google Admin Console and lock to Specific Google Data.",
            apps: displayedUnconfigured.filter((a) => a.triageTier === "TIER_4"),
          },
        ];

        if (displayedUnconfigured.length === 0) {
          return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs py-12 text-center text-gray-400 text-sm">
              No unconfigured applications matched your search or filters.
            </div>
          );
        }

        return (
          <div className="space-y-4">
            {tiersConfig.map((tier) => {
              if (tier.apps.length === 0) return null;
              const isCollapsed = Boolean(collapsedTiers[tier.id]);

              return (
                <div
                  key={tier.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden"
                >
                  {/* Clean Tier Header */}
                  <div
                    onClick={() => toggleTier(tier.id)}
                    className="px-4 py-3 bg-gray-50/80 hover:bg-gray-100/70 border-b border-gray-200 flex items-center justify-between gap-4 cursor-pointer select-none transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${tier.dotColor}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-gray-900">{tier.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${tier.badgeColor}`}>
                            {tier.apps.length}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{tier.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-xs text-gray-500 font-medium">
                      <span>{isCollapsed ? "Expand" : "Collapse"}</span>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? "" : "rotate-180"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Clean Table Inside Tier */}
                  {!isCollapsed && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white border-b border-gray-100 text-[11px] font-semibold uppercase text-gray-400 tracking-wider">
                            <th className="py-2.5 px-4">Application</th>
                            <th className="py-2.5 px-4">Triage Reason</th>
                            <th className="py-2.5 px-4">Risk Level</th>
                            <th className="py-2.5 px-4">Recommended Policy</th>
                            <th className="py-2.5 px-4 text-center">Users</th>
                            <th className="py-2.5 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                          {tier.apps.map((app) => {
                            const isExpanded = !!expandedAppIds[app.id];
                            return (
                              <React.Fragment key={app.id}>
                                <tr className="hover:bg-gray-50/70 transition-colors">
                                  {/* Application */}
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2.5">
                                      <img
                                        src={
                                          app.iconUrl ||
                                          `https://ui-avatars.com/api/?name=${encodeURIComponent(app.displayName)}&background=3B82F6&color=fff&size=64`
                                        }
                                        alt={app.displayName}
                                        className="w-9 h-9 rounded-lg object-contain bg-white border border-gray-200 shrink-0 p-0.5"
                                        onError={(e: any) => {
                                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.displayName)}&background=3B82F6&color=fff&size=64`;
                                        }}
                                      />
                                      <div className="min-w-0 max-w-xs">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-semibold text-gray-900 truncate" title={app.displayName}>
                                            {app.displayName}
                                          </span>
                                          {app.isVerified && <GoogleVerifiedBadge size="sm" className="shrink-0" />}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                          {app.publisherDomain || app.vendor || "Third-Party Developer"}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Triage Reason */}
                                  <td className="py-3 px-4 text-xs text-gray-600">
                                    <div>{app.triggerSummary}</div>
                                    {app.adminUsers > 0 && (
                                      <span className="inline-block mt-0.5 text-[11px] font-semibold text-purple-700">
                                        {app.adminUsers} Super Admin{app.adminUsers > 1 ? "s" : ""}
                                      </span>
                                    )}
                                  </td>

                                  {/* Risk Level */}
                                  <td className="py-3 px-4">{renderRiskBadge(app.riskLevel, app.riskScore)}</td>

                                  {/* Recommended Policy */}
                                  <td className="py-3 px-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      {app.recommendedPolicy}
                                    </span>
                                    <div className="text-[11px] text-gray-400 mt-0.5">{app.policyNote}</div>
                                  </td>

                                  {/* Users */}
                                  <td className="py-3 px-4 text-center">
                                    <div className="text-xs font-semibold text-gray-800">{app.totalUsers}</div>
                                    <div className="text-[11px] text-gray-400">
                                      {app.isRecent ? "Active ≤30d" : "Dormant"}
                                    </div>
                                  </td>

                                  {/* Actions */}
                                  <td className="py-3 px-4 text-right whitespace-nowrap">
                                    <div className="inline-flex items-center gap-2">
                                      <button
                                        onClick={() => toggleExpand(app.id)}
                                        className="px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                      >
                                        {isExpanded ? "Hide" : "Scopes"} ({app.scopes?.length || 0})
                                      </button>
                                      <a
                                        href="https://admin.google.com/ac/owl/list?tab=apps"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                                      >
                                        <GoogleAdminIcon className="w-3.5 h-3.5 text-blue-600" />
                                        <span>Admin Console ↗</span>
                                      </a>
                                    </div>
                                  </td>
                                </tr>

                                {isExpanded && (
                                  <tr className="bg-gray-50/60">
                                    <td colSpan={6} className="px-4 py-3">
                                      <div className="text-xs space-y-2">
                                        <div className="flex items-center justify-between text-gray-500">
                                          <span className="font-semibold text-gray-700">
                                            Granted OAuth Scopes ({app.scopes?.length || 0})
                                          </span>
                                          <span className="font-mono text-[11px]">
                                            Client ID: {app.clientId || app.id}
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                                          {(app.scopes || []).map((s: any, idx: number) => (
                                            <div
                                              key={idx}
                                              className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] font-mono"
                                            >
                                              <span className="truncate text-gray-700" title={s.scope}>
                                                {s.scope}
                                              </span>
                                              <span
                                                className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold shrink-0 ${
                                                  s.riskLevel === "CRITICAL"
                                                    ? "bg-rose-50 text-rose-700"
                                                    : s.riskLevel === "HIGH"
                                                    ? "bg-amber-50 text-amber-700"
                                                    : "bg-gray-100 text-gray-600"
                                                }`}
                                              >
                                                {s.riskLevel || "LOW"}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* TAB 2: TRUSTED APPLICATION REVIEWS */}
      {activeGroup === "trusted" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-900">
                {showConfirmedTrusted
                  ? `Compliant Trusted Applications (${confirmedTrustedApps.length})`
                  : `Trusted Applications Requiring Review (${pendingTrustedApps.length})`}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Triggered when a new OAuth scope is requested or when a High/Critical risk app has not been reviewed in 6 months.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-[11px] font-semibold uppercase text-gray-400 tracking-wider">
                  <th className="py-2.5 px-4">Application</th>
                  <th className="py-2.5 px-4">Review Trigger</th>
                  <th className="py-2.5 px-4">Risk Level</th>
                  <th className="py-2.5 px-4">Recommended Policy</th>
                  <th className="py-2.5 px-4 text-center">Users</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {displayedTrusted.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">
                      {showConfirmedTrusted
                        ? "No compliant trusted applications found."
                        : "All trusted applications are compliant."}
                    </td>
                  </tr>
                ) : (
                  displayedTrusted.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              app.iconUrl ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(app.displayName)}&background=3B82F6&color=fff&size=64`
                            }
                            alt={app.displayName}
                            className="w-9 h-9 rounded-lg object-contain bg-white border border-gray-200 shrink-0 p-0.5"
                            onError={(e: any) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.displayName)}&background=3B82F6&color=fff&size=64`;
                            }}
                          />
                          <div className="min-w-0 max-w-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-gray-900 truncate">{app.displayName}</span>
                              {app.isVerified && <GoogleVerifiedBadge size="sm" className="shrink-0" />}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {app.publisherDomain || app.vendor || "Third-Party Developer"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs text-gray-600">
                        <div className="font-medium text-gray-800">{app.trustedGateReason}</div>
                        {app.hasNewScopes && (
                          <span className="inline-block mt-0.5 text-[11px] font-semibold text-rose-600">
                            New {app.trustedScopeCategory || "OAuth"} scope
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">{renderRiskBadge(app.riskLevel, app.riskScore)}</td>

                      <td className="py-3 px-4">
                        {app.trustedNeedsReview ? (
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Specific Google Data
                            </span>
                            <div className="text-[11px] text-gray-400 mt-0.5">Replace blanket Trusted</div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                            No action needed
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center text-xs font-semibold text-gray-800">
                        {app.totalUsers}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          {app.trustedNeedsReview ? (
                            <button
                              onClick={() => handleConfirmTrusted(app.id, app.displayName)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                            >
                              Mark Reviewed
                            </button>
                          ) : confirmedTrustedMap[app.id] ? (
                            <button
                              onClick={() => handleUndoConfirmTrusted(app.id, app.displayName)}
                              className="px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              Undo
                            </button>
                          ) : null}

                          <a
                            href="https://admin.google.com/ac/owl/list?tab=apps"
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                          >
                            <GoogleAdminIcon className="w-3.5 h-3.5 text-blue-600" />
                            <span>Admin Console ↗</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUPER ADMIN GRANTS */}
      {activeGroup === "admins" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-900">
                Super Administrator OAuth Authorizations ({superAdminGroups.length})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Applications authorized by Super Admin accounts. Confirm these are locked to Specific Google Data in the Admin Console.
              </p>
            </div>
            <a
              href="https://admin.google.com/ac/owl/list?tab=apps"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-2xs shrink-0"
            >
              <GoogleAdminIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin Console ↗</span>
            </a>
          </div>

          <div className="divide-y divide-gray-100">
            {superAdminGroups.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                No Super Administrator token grants found.
              </div>
            ) : (
              superAdminGroups.map((adm) => (
                <div key={adm.adminEmail} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 font-bold flex items-center justify-center text-xs border border-purple-200">
                        {adm.adminEmail[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{adm.adminEmail}</div>
                        <div className="text-xs text-gray-500">Super Administrator</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                      {adm.tokenCount} authorized apps
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {adm.items.map((item) => (
                      <div
                        key={item.id}
                        className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50/50 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-800 truncate">{item.application}</div>
                          <div className="text-[11px] font-mono text-gray-400 truncate">{item.clientId}</div>
                        </div>
                        <a
                          href="https://admin.google.com/ac/owl/list?tab=apps"
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 hover:text-emerald-800 font-semibold shrink-0"
                        >
                          Review ↗
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
