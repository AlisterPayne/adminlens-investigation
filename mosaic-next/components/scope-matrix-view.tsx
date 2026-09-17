"use client";

import React, { useState, useMemo } from "react";
import {
  GmailIcon,
  GoogleDriveIcon,
  GoogleAdminIcon,
  GoogleCalendarIcon,
  GoogleClassroomIcon,
  GoogleContactsIcon,
  GoogleAppsScriptIcon,
  GoogleProductIcon,
} from "@/components/google-icons";

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
  const [collapsedServices, setCollapsedServices] = useState<Record<string, boolean>>({});
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

  const toggleServiceCollapse = (service: string) => {
    setCollapsedServices((prev) => ({
      ...prev,
      [service]: !prev[service],
    }));
  };

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

  const activeInDomainCount = useMemo(() => {
    return scopes.filter((s) => (s.active_apps_count || 0) > 0).length;
  }, [scopes]);

  return (
    <div className="space-y-6">
      {/* Header & Overview Card (Almost completely hidden by default) */}
      {!showInfoBanner ? (
        <div 
          onClick={() => setShowInfoBanner(true)}
          className="flex items-center justify-between py-1.5 px-3 bg-gray-50/70 hover:bg-blue-50/60 border border-gray-200/80 hover:border-blue-300 rounded-lg text-xs text-gray-500 hover:text-gray-700 cursor-pointer transition-all select-none shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400">▶</span>
            <span className="font-semibold text-gray-700 text-xs">Google Workspace OAuth Scope Threat Matrix</span>
            <span className="text-gray-400">•</span>
            <span className="text-[11px] text-blue-600 font-medium">Service-Grouped Risk Intelligence</span>
          </div>
          <span className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1">
            Show threat matrix info & guides ▾
          </span>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/5 to-white border border-blue-200 rounded-xl p-5 shadow-xs transition-all animate-fade-in">
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
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-gray-50 border border-blue-200 text-xs font-bold text-blue-700 transition-colors shadow-2xs flex items-center gap-1.5"
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* All Scopes */}
        <button
          type="button"
          onClick={() => {
            setTierFilter("ALL");
            setScoreFilter("ALL");
            setActiveOnly(false);
          }}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            tierFilter === "ALL" && scoreFilter === "ALL" && !activeOnly
              ? "bg-blue-50/70 border-blue-400 shadow-xs ring-2 ring-blue-400/20"
              : "bg-white border-gray-200 shadow-2xs hover:border-gray-300 hover:bg-gray-50/60"
          }`}
        >
          <div className="text-gray-500 text-xs font-semibold">Cataloged Scopes</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {metrics?.total || scopes.length}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">Verified definitions</div>
        </button>

        {/* Restricted Tiers */}
        <button
          type="button"
          onClick={() => {
            setTierFilter(tierFilter === "Restricted" ? "ALL" : "Restricted");
            setScoreFilter("ALL");
            setActiveOnly(false);
          }}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            tierFilter === "Restricted"
              ? "bg-red-100/70 border-red-500 shadow-xs ring-2 ring-red-500/20"
              : "bg-red-50/40 border-red-200 shadow-2xs hover:border-red-300 hover:bg-red-50/80"
          }`}
        >
          <div className="text-red-700 text-xs font-semibold flex items-center gap-1">
            <span>🛡️</span> Restricted Tiers
          </div>
          <div className="text-2xl font-bold text-red-900 mt-1">
            {metrics?.restricted ??
              scopes.filter((s) => s.google_tier === "Restricted").length}
          </div>
          <div className="text-[11px] text-red-600 mt-0.5">CASA Tier 2 audit</div>
        </button>

        {/* Sensitive Tiers */}
        <button
          type="button"
          onClick={() => {
            setTierFilter(tierFilter === "Sensitive" ? "ALL" : "Sensitive");
            setScoreFilter("ALL");
            setActiveOnly(false);
          }}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            tierFilter === "Sensitive"
              ? "bg-amber-100/70 border-amber-500 shadow-xs ring-2 ring-amber-500/20"
              : "bg-amber-50/40 border-amber-200 shadow-2xs hover:border-amber-300 hover:bg-amber-50/80"
          }`}
        >
          <div className="text-amber-700 text-xs font-semibold flex items-center gap-1">
            <span>👁️</span> Sensitive Tiers
          </div>
          <div className="text-2xl font-bold text-amber-900 mt-1">
            {metrics?.sensitive ??
              scopes.filter((s) => s.google_tier === "Sensitive").length}
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">Google reviewed</div>
        </button>

        {/* Non-Sensitive */}
        <button
          type="button"
          onClick={() => {
            setTierFilter(tierFilter === "Non-Sensitive" ? "ALL" : "Non-Sensitive");
            setScoreFilter("ALL");
            setActiveOnly(false);
          }}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            tierFilter === "Non-Sensitive"
              ? "bg-blue-100/70 border-blue-500 shadow-xs ring-2 ring-blue-500/20"
              : "bg-blue-50/40 border-blue-200 shadow-2xs hover:border-blue-300 hover:bg-blue-50/80"
          }`}
        >
          <div className="text-blue-700 text-xs font-semibold flex items-center gap-1">
            <span>✓</span> Non-Sensitive
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            {metrics?.nonSensitive ??
              scopes.filter((s) => s.google_tier === "Non-Sensitive").length}
          </div>
          <div className="text-[11px] text-blue-600 mt-0.5">Basic identity / SSO</div>
        </button>

        {/* Critical (5) */}
        <button
          type="button"
          onClick={() => {
            setScoreFilter(scoreFilter === "5" ? "ALL" : "5");
            setTierFilter("ALL");
            setActiveOnly(false);
          }}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            scoreFilter === "5"
              ? "bg-red-100/80 border-red-600 shadow-xs ring-2 ring-red-600/20"
              : "bg-red-50/40 border-red-200 shadow-2xs hover:border-red-300 hover:bg-red-50/80"
          }`}
        >
          <div className="text-red-700 text-xs font-semibold flex items-center gap-1">
            <span>🔥</span> Critical (5)
          </div>
          <div className="text-2xl font-bold text-red-900 mt-1">
            {metrics?.scores?.critical ??
              scopes.filter((s) => s.admin_score === 5).length}
          </div>
          <div className="text-[11px] text-red-600 mt-0.5">Score 5 (Critical)</div>
        </button>

        {/* Active in Domain */}
        <button
          type="button"
          onClick={() => {
            setActiveOnly(!activeOnly);
          }}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            activeOnly
              ? "bg-emerald-100/70 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20"
              : "bg-emerald-50/40 border-emerald-200 shadow-2xs hover:border-emerald-300 hover:bg-emerald-50/80"
          }`}
        >
          <div className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
            <span>📡</span> Active in Domain
          </div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">
            {activeInDomainCount}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Granted to apps</div>
        </button>
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
              <span>🗂️</span> Group by Service ({groupedByService.length})
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === "table"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span>📋</span> Flat Table
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

          {/* Active in Domain Only */}
          <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer ml-1 select-none font-medium">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>In Domain Only</span>
          </label>
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
              const isCollapsed = collapsedServices[grp.serviceName];

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

                    {/* Service Metric Badges & Risk Exposure */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      {/* Average Threat Score */}
                      <div className="px-3.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-center">
                        <div className="text-[10px] text-gray-500 font-medium">
                          Avg Service Threat
                        </div>
                        <div className="text-xs font-bold text-gray-900">
                          {grp.avgScore} pts
                        </div>
                      </div>

                      {/* Critical Scopes Count (Score 5) */}
                      {grp.criticalCount > 0 && (
                        <div className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-center">
                          <div className="text-[10px] text-red-700 font-medium">
                            Critical (5)
                          </div>
                          <div className="text-xs font-bold text-red-900">
                            {grp.criticalCount} Scopes
                          </div>
                        </div>
                      )}

                      {/* Max Severity */}
                      <div className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-center">
                        <div className="text-[10px] text-indigo-700 font-medium">
                          Peak Scope
                        </div>
                        <div className="text-xs font-bold text-indigo-900">
                          Score {grp.maxScore}
                        </div>
                      </div>

                      {/* Domain Footprint */}
                      <div className="px-3 py-1.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-center">
                        <div className="text-[10px] text-emerald-700 font-medium">
                          Tenant Footprint
                        </div>
                        <div className="text-xs font-bold text-emerald-800">
                          {grp.activeApps > 0 ? `${grp.activeApps} Active` : "0 Active"}
                        </div>
                      </div>

                      {/* Collapse/Expand Toggle Button */}
                      <button
                        onClick={() => toggleServiceCollapse(grp.serviceName)}
                        className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors ml-1"
                        title={isCollapsed ? "Expand Service" : "Collapse Service"}
                      >
                        {isCollapsed ? "▼ Show Scopes" : "▲ Hide Scopes"}
                      </button>
                    </div>
                  </div>

                  {/* Service Scope Table */}
                  {!isCollapsed && (
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
                  )}
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
