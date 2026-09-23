"use client";

import React, { useMemo,useState } from "react";

import {
  GmailIcon,
  GoogleAccountIcon,
  GoogleAdminIcon,
  GoogleAppsScriptIcon,
  GoogleCalendarIcon,
  GoogleClassroomIcon,
  GoogleContactsIcon,
  GoogleDriveIcon,
  GoogleProductIcon,
} from "@/components/google-icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function ServiceThreatInfoPopover({
  serviceName,
  avgScore,
  criticalCount,
  maxScore,
}: {
  serviceName: string;
  avgScore: string;
  criticalCount: number;
  maxScore: number;
}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 180);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-800 shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          aria-label={`Threat metrics for ${serviceName}`}
          title="Service Threat Metrics"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16">
            <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 12H7V7h2v5zM8 6c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        sideOffset={6}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-auto min-w-[280px] p-3.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 pointer-events-auto"
      >
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 pb-2 mb-2.5 border-b border-gray-100">
          <svg className="w-3.5 h-3.5 fill-current text-blue-500" viewBox="0 0 16 16">
            <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 12H7V7h2v5zM8 6c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" />
          </svg>
          <span>{serviceName} Threat Metrics</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Average Threat Score */}
          <div className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-center min-w-[85px]">
            <div className="text-[10px] text-gray-500 font-medium">
              Avg Service Threat
            </div>
            <div className="text-xs font-bold text-gray-900 mt-0.5">
              {avgScore} pts
            </div>
          </div>

          {/* Critical Scopes Count (Score 5) */}
          <div
            className={`px-3 py-1.5 rounded-lg border text-center min-w-[85px] ${
              criticalCount > 0
                ? "bg-red-50 border-red-200 text-red-900"
                : "bg-gray-50 border-gray-200 text-gray-400"
            }`}
          >
            <div
              className={`text-[10px] font-medium ${
                criticalCount > 0 ? "text-red-700" : "text-gray-500"
              }`}
            >
              Critical (5)
            </div>
            <div
              className={`text-xs font-bold mt-0.5 ${
                criticalCount > 0 ? "text-red-900" : "text-gray-600"
              }`}
            >
              {criticalCount} Scope{criticalCount === 1 ? "" : "s"}
            </div>
          </div>

          {/* Peak Scope */}
          <div className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-center min-w-[85px]">
            <div className="text-[10px] text-indigo-700 font-medium">
              Peak Scope
            </div>
            <div className="text-xs font-bold text-indigo-900 mt-0.5">
              Score {maxScore}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export interface ScopeReferenceItem {
  scope_url: string;
  service_name: string;
  google_tier: "Restricted" | "Sensitive" | "Non-Sensitive" | string;
  admin_score: number;
  admin_color: "Red" | "Orange" | "Yellow" | "Green" | "Blue" | string;
  rationale: string;
  threat_impact: string;
  active_apps_count?: number;
}

export interface ScopeMetrics {
  total: number;
  restricted: number;
  sensitive: number;
  nonSensitive: number;
  scores: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    minimal: number;
  };
  services: string[];
}

export default function ScopeMatrixView({
  scopes = [],
  metrics,
}: {
  scopes: ScopeReferenceItem[];
  metrics?: ScopeMetrics | null;
}) {
  const [viewMode, setViewMode] = useState<"grouped" | "table">("grouped");
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [scoreFilter, setScoreFilter] = useState("ALL");
  const [activeOnly, setActiveOnly] = useState(false);
  const [copiedScope, setCopiedScope] = useState<string | null>(null);
  const [showInfoBanner, setShowInfoBanner] = useState(false);

  // Derive distinct services if not provided
  const availableServices = useMemo(() => {
    if (metrics?.services && metrics.services.length > 0) {
      return metrics.services;
    }
    return Array.from(new Set(scopes.map((s) => s.service_name))).sort();
  }, [scopes, metrics]);

  // Filtering
  const filteredScopes = useMemo(() => {
    const q = search.toLowerCase().trim();
    return scopes.filter((s) => {
      const matchesQuery =
        !q ||
        s.scope_url.toLowerCase().includes(q) ||
        s.rationale.toLowerCase().includes(q) ||
        s.threat_impact.toLowerCase().includes(q) ||
        s.service_name.toLowerCase().includes(q);

      const matchesService =
        serviceFilter === "ALL" || s.service_name === serviceFilter;
      const matchesTier =
        tierFilter === "ALL" || s.google_tier === tierFilter;
      const matchesScore =
        scoreFilter === "ALL" || s.admin_score.toString() === scoreFilter;
      const matchesActive = !activeOnly || (s.active_apps_count || 0) > 0;

      return (
        matchesQuery &&
        matchesService &&
        matchesTier &&
        matchesScore &&
        matchesActive
      );
    });
  }, [scopes, search, serviceFilter, tierFilter, scoreFilter, activeOnly]);

  // Group filtered scopes by Service Name
  const groupedByService = useMemo(() => {
    const groups = new Map<string, ScopeReferenceItem[]>();

    filteredScopes.forEach((s) => {
      if (!groups.has(s.service_name)) {
        groups.set(s.service_name, []);
      }
      groups.get(s.service_name)!.push(s);
    });

    return Array.from(groups.entries()).map(([serviceName, items]) => {
      const total = items.length;
      const sumScores = items.reduce((acc, curr) => acc + curr.admin_score, 0);
      const avgScore = total > 0 ? (sumScores / total).toFixed(1) : "0.0";
      const maxScore = Math.max(...items.map((i) => i.admin_score), 1);
      const criticalCount = items.filter((i) => i.admin_score === 5).length;
      const restricted = items.filter((i) => i.google_tier === "Restricted").length;
      const sensitive = items.filter((i) => i.google_tier === "Sensitive").length;
      const nonSensitive = items.filter((i) => i.google_tier === "Non-Sensitive").length;
      const activeApps = items.reduce((acc, curr) => acc + (curr.active_apps_count || 0), 0);

      return {
        serviceName,
        items,
        total,
        avgScore,
        maxScore,
        criticalCount,
        restricted,
        sensitive,
        nonSensitive,
        activeApps,
      };
    }).sort((a, b) => parseFloat(b.avgScore) - parseFloat(a.avgScore));
  }, [filteredScopes]);

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedScope(url);
      setTimeout(() => setCopiedScope(null), 1800);
    });
  };

  const getServiceIcon = (service: string) => {
    if (service.includes("Gmail")) {
      return <GmailIcon className="w-5 h-5 flex-shrink-0" />;
    }
    if (service.includes("Drive")) {
      return <GoogleDriveIcon className="w-5 h-5 flex-shrink-0" />;
    }
    if (service.includes("Admin")) {
      return <GoogleAdminIcon className="w-5 h-5 flex-shrink-0" />;
    }
    if (service.includes("Calendar")) {
      return <GoogleCalendarIcon className="w-5 h-5 flex-shrink-0" />;
    }
    if (service.includes("Contacts")) {
      return <GoogleContactsIcon className="w-5 h-5 flex-shrink-0" />;
    }
    if (service.includes("Classroom") || service.includes("Chat")) {
      return <GoogleClassroomIcon className="w-5 h-5 flex-shrink-0" />;
    }
    if (service.includes("Script") || service.includes("Apps Script")) {
      return <GoogleAppsScriptIcon className="w-5 h-5 flex-shrink-0" />;
    }
    if (service.includes("Identity") || service.includes("SSO") || service.includes("Account")) {
      return <GoogleAccountIcon className="w-5 h-5 flex-shrink-0" />;
    }
    return <GoogleProductIcon service={service} className="w-5 h-5 flex-shrink-0" />;
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "Restricted":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Restricted
          </span>
        );
      case "Sensitive":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Sensitive
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Non-Sensitive
          </span>
        );
    }
  };

  const getScoreBadge = (score: number) => {
    switch (score) {
      case 5:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 border border-red-200 shadow-2xs whitespace-nowrap">
            🔴 5 (Critical)
          </span>
        );
      case 4:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs whitespace-nowrap">
            🟠 4 (High)
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-yellow-100 text-yellow-900 border border-yellow-200 shadow-2xs whitespace-nowrap">
            🟡 3 (Moderate)
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs whitespace-nowrap">
            🟢 2 (Minor)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs whitespace-nowrap">
            🔵 1 (Low)
          </span>
        );
    }
  };

  // KPI counts dynamically reflecting dropdown menu and search filters
  const kpiCounts = useMemo(() => {
    return {
      total: filteredScopes.length,
      restricted: filteredScopes.filter((s) => s.google_tier === "Restricted").length,
      sensitive: filteredScopes.filter((s) => s.google_tier === "Sensitive").length,
      nonSensitive: filteredScopes.filter((s) => s.google_tier === "Non-Sensitive").length,
      activeInDomain: filteredScopes.filter((s) => (s.active_apps_count || 0) > 0).length,
    };
  }, [filteredScopes]);

  return (
    <div className="space-y-6">
      {/* Header & Overview Card (Note to Developers - Kept Collapsed by Default) */}
      {!showInfoBanner ? (
        <div 
          onClick={() => setShowInfoBanner(true)}
          className="flex items-center justify-between py-1.5 px-3 bg-amber-50/50 hover:bg-amber-100/60 border border-amber-200/80 hover:border-amber-300 rounded-lg text-xs text-amber-900 cursor-pointer transition-all select-none shadow-2xs"
          title="Click to expand Note to Developers (Internal specification, not for end users)"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-amber-600 font-bold">▶</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
              <span>🛠️</span> NOTE TO DEVELOPERS
            </span>
            <span className="font-bold text-gray-800 text-xs">
              Google Workspace OAuth Scope Threat Matrix Specification
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-[11px] text-amber-800/80 italic font-medium">Internal Reference (Not for End Users)</span>
          </div>
          <span className="text-[11px] text-amber-800 font-semibold hover:underline flex items-center gap-1">
            Show developer note ▾
          </span>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-50 to-white border-2 border-dashed border-amber-300 rounded-xl p-5 shadow-xs transition-all animate-fade-in">
          {/* Note to Developers Banner */}
          <div className="flex items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-amber-200 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-400 tracking-wide shadow-2xs">
                <span>🛠️</span> NOTE TO DEVELOPERS
              </span>
              <span className="text-amber-900 font-semibold text-xs">
                Internal reference &amp; design specification — <strong>not to be included in the application to users</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowInfoBanner(false)}
              className="text-xs font-bold text-amber-900 hover:text-amber-950 underline px-2 py-0.5"
            >
              ▲ Collapse Developer Note
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1.5 flex-1 cursor-pointer select-none" onClick={() => setShowInfoBanner(false)}>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="p-2 rounded-lg bg-blue-600 text-white shadow-xs text-sm">
                  🛡️
                </span>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                  Google Workspace OAuth Scope Threat Matrix
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  Service-Grouped Risk Intelligence
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                  Internal Reference
                </span>
              </div>
              <p className="text-xs text-gray-600 max-w-3xl leading-relaxed">
                Ground-truth reference catalog of Google Workspace OAuth
                permissions mapped to Google's official{" "}
                <strong className="text-gray-900">API User Data Policy Tiers</strong>{" "}
                and the <strong className="text-gray-900">Enterprise Threat Scale (1 to 5)</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowInfoBanner(false)}
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-gray-50 border border-amber-300 text-xs font-bold text-amber-900 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <span>▲ Hide / Collapse</span>
              </button>
              <a
                href="https://support.google.com/cloud/answer/9110914"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-700 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <span>📄</span> Google OAuth FAQ ↗
              </a>
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-700 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <span>⚖️</span> User Data Policy ↗
              </a>
            </div>
          </div>

          {/* Scope Classification Legend Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-4 border-t border-blue-200/80 text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50/70 border border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-500 mt-1 flex-shrink-0"></span>
              <div>
                <span className="font-bold text-red-900">
                  Restricted Scopes (Google Tier)
                </span>
                <p className="text-red-700/80 text-[11px] mt-0.5 leading-snug">
                  Scores 4 or 5. Requires mandatory annual CASA Tier 2 independent audits
                  ($3k–$15k/yr). Full mailbox or cloud drive control.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50/70 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 flex-shrink-0"></span>
              <div>
                <span className="font-bold text-amber-900">
                  Sensitive Scopes (Google Tier)
                </span>
                <p className="text-amber-700/80 text-[11px] mt-0.5 leading-snug">
                  Scores 2, 3, or 4. Accesses private personal/corporate data (calendars, contacts,
                  drive.file). Requires Google Trust & Safety verification.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/70 border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0"></span>
              <div>
                <span className="font-bold text-blue-900">
                  Non-Sensitive Scopes (Google Tier)
                </span>
                <p className="text-blue-700/80 text-[11px] mt-0.5 leading-snug">
                  Scores 1 or 2. Basic identity (openid, email, profile) or read-only operational
                  metadata with minimal exfiltration surface.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards (Non-clickable stat displays) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* All Scopes */}
        <div className="text-left p-4 rounded-xl border bg-blue-50/40 border-blue-200 shadow-2xs">
          <div className="text-gray-500 text-xs font-semibold">Cataloged Scopes</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {kpiCounts.total}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">Verified definitions</div>
        </div>

        {/* Restricted Tiers */}
        <div className="text-left p-4 rounded-xl border bg-red-50/40 border-red-200 shadow-2xs">
          <div className="text-red-700 text-xs font-semibold flex items-center gap-1">
            <span>🛡️</span> Restricted Tiers
          </div>
          <div className="text-2xl font-bold text-red-900 mt-1">
            {kpiCounts.restricted}
          </div>
          <div className="text-[11px] text-red-600 mt-0.5">CASA Tier 2 audit</div>
        </div>

        {/* Sensitive Tiers */}
        <div className="text-left p-4 rounded-xl border bg-amber-50/40 border-amber-200 shadow-2xs">
          <div className="text-amber-700 text-xs font-semibold flex items-center gap-1">
            <span>👁️</span> Sensitive Tiers
          </div>
          <div className="text-2xl font-bold text-amber-900 mt-1">
            {kpiCounts.sensitive}
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">Google reviewed</div>
        </div>

        {/* Non-Sensitive */}
        <div className="text-left p-4 rounded-xl border bg-blue-50/40 border-blue-200 shadow-2xs">
          <div className="text-blue-700 text-xs font-semibold flex items-center gap-1">
            <span>✓</span> Non-Sensitive
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            {kpiCounts.nonSensitive}
          </div>
          <div className="text-[11px] text-blue-600 mt-0.5">Basic identity / SSO</div>
        </div>
      </div>

      {/* Filter & View Mode Toolbar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-2xs">
        
        {/* Left: View Mode Toggle & Search */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 flex-shrink-0">
            <button
              onClick={() => setViewMode("grouped")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === "grouped"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span>📁</span> Grouped
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === "table"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span>📋</span> List View
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search scope, rationale, or impact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-3 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Right: Granular Filters */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          {/* Service Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 font-semibold">Service:</label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Services</option>
              {availableServices.map((svc) => (
                <option key={svc} value={svc}>
                  {svc}
                </option>
              ))}
            </select>
          </div>

          {/* Google Tier Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 font-semibold">Tier:</label>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Tiers</option>
              <option value="Restricted">Restricted</option>
              <option value="Sensitive">Sensitive</option>
              <option value="Non-Sensitive">Non-Sensitive</option>
            </select>
          </div>

          {/* Threat Score Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 font-semibold">Threat Score:</label>
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Scores</option>
              <option value="5">🔴 5 — Critical</option>
              <option value="4">🟠 4 — High</option>
              <option value="3">🟡 3 — Moderate</option>
              <option value="2">🟢 2 — Minor</option>
              <option value="1">🔵 1 — Low</option>
            </select>
          </div>

          {/* Active Apps Only */}
          <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer ml-1 select-none font-medium">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Active Apps</span>
          </label>

          {(serviceFilter !== "ALL" || tierFilter !== "ALL" || scoreFilter !== "ALL" || activeOnly || search.trim() !== "") && (
            <button
              type="button"
              onClick={() => {
                setServiceFilter("ALL");
                setTierFilter("ALL");
                setScoreFilter("ALL");
                setActiveOnly(false);
                setSearch("");
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer ml-2"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* VIEW 1: GROUPED BY SERVICE                                       */}
      {/* ================================================================ */}
      {viewMode === "grouped" && (
        <div className="space-y-4">
          {groupedByService.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400 font-medium">
              No services match the selected filter criteria.
            </div>
          ) : (
            groupedByService.map((grp) => {
              return (
                <div
                  key={grp.serviceName}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs transition-all"
                >
                  {/* Service Header Strip */}
                  <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/40 border-b border-gray-200">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-2xs">
                        {getServiceIcon(grp.serviceName)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-base font-bold text-gray-900">
                            {grp.serviceName}
                          </h3>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-bold border border-gray-200">
                            {grp.total} Scope{grp.total > 1 ? "s" : ""}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 max-w-xl">
                          Google Workspace {grp.serviceName} API and permissions
                        </p>
                      </div>
                    </div>

                    {/* Service Controls: Threat Info Popover */}
                    <div className="flex items-center gap-2">
                      <ServiceThreatInfoPopover
                        serviceName={grp.serviceName}
                        avgScore={grp.avgScore}
                        criticalCount={grp.criticalCount}
                        maxScore={grp.maxScore}
                      />
                    </div>
                  </div>

                  {/* Service Scope Table */}
                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-gray-700 table-fixed min-w-[960px]">
                        <colgroup>
                          <col style={{ width: "35%" }} />
                          <col style={{ width: "140px" }} />
                          <col style={{ width: "160px" }} />
                          <col />
                          <col style={{ width: "120px" }} />
                        </colgroup>
                        <thead className="bg-gray-50/60 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200 font-semibold">
                          <tr>
                            <th className="py-2.5 px-4" style={{ width: "35%" }}>OAuth Scope URI</th>
                            <th className="py-2.5 px-4" style={{ width: "140px" }}>Google Tier</th>
                            <th className="py-2.5 px-4" style={{ width: "160px" }}>Admin Score</th>
                            <th className="py-2.5 px-4">Threat Rationale & Exploit Impact</th>
                            <th className="py-2.5 px-4 text-center" style={{ width: "120px" }}>Tenant Apps</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {grp.items.map((s) => {
                            const isActive = (s.active_apps_count || 0) > 0;
                            return (
                              <tr
                                key={s.scope_url}
                                className="hover:bg-gray-50/80 transition-colors"
                              >
                                {/* Scope URI */}
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-gray-900 font-semibold break-all select-all">
                                      {s.scope_url}
                                    </span>
                                    <button
                                      onClick={() => copyToClipboard(s.scope_url)}
                                      title="Copy Scope URI"
                                      className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-gray-100 transition-colors flex-shrink-0 text-xs"
                                    >
                                      {copiedScope === s.scope_url ? (
                                        <span className="text-emerald-600 font-bold">✓</span>
                                      ) : (
                                        <span>📋</span>
                                      )}
                                    </button>
                                  </div>
                                </td>

                                {/* Google Tier */}
                                <td className="py-3 px-4 whitespace-nowrap">
                                  {getTierBadge(s.google_tier)}
                                </td>

                                {/* Admin Threat Score */}
                                <td className="py-3 px-4 whitespace-nowrap">
                                  {getScoreBadge(s.admin_score)}
                                </td>

                                {/* Threat Rationale & Impact */}
                                <td className="py-3 px-4">
                                  <div className="font-bold text-gray-900 text-xs">
                                    {s.rationale}
                                  </div>
                                  <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                                    {s.threat_impact}
                                  </div>
                                </td>

                                {/* Tenant Footprint */}
                                <td className="py-3 px-4 text-center whitespace-nowrap">
                                  {isActive ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                      {s.active_apps_count} App
                                      {(s.active_apps_count || 0) > 1 ? "s" : ""}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-400 font-mono">
                                      0 apps
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* VIEW 2: FLAT EXHAUSTIVE TABLE                                     */}
      {/* ================================================================ */}
      {viewMode === "table" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200 font-semibold">
              <tr>
                <th className="py-3 px-4">OAuth Scope URI</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Google Tier</th>
                <th className="py-3 px-4">Admin Score</th>
                <th className="py-3 px-4">Threat Rationale & Technical Impact</th>
                <th className="py-3 px-4 text-center">Tenant Footprint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredScopes.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-gray-400 font-medium"
                  >
                    No OAuth scopes match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredScopes.map((s) => {
                  const isActive = (s.active_apps_count || 0) > 0;
                  return (
                    <tr
                      key={s.scope_url}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      {/* Scope URI */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-900 font-semibold break-all select-all">
                            {s.scope_url}
                          </span>
                          <button
                            onClick={() => copyToClipboard(s.scope_url)}
                            title="Copy Scope URI"
                            className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-gray-100 transition-colors flex-shrink-0 text-xs"
                          >
                            {copiedScope === s.scope_url ? (
                              <span className="text-emerald-600 font-bold">✓</span>
                            ) : (
                              <span>📋</span>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Service */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                          {getServiceIcon(s.service_name)}
                          <span>{s.service_name}</span>
                        </div>
                      </td>

                      {/* Google Tier */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getTierBadge(s.google_tier)}
                      </td>

                      {/* Admin Score */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getScoreBadge(s.admin_score)}
                      </td>

                      {/* Threat Rationale & Technical Impact */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="font-bold text-gray-900 text-xs">
                          {s.rationale}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                          {s.threat_impact}
                        </div>
                      </td>

                      {/* Tenant Footprint */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {s.active_apps_count} App
                            {(s.active_apps_count || 0) > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 font-mono">
                            0 apps
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
