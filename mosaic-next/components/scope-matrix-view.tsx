"use client";

import React, { useState, useMemo } from "react";
import {
  GmailIcon,
  GoogleDriveIcon,
  GoogleAdminIcon,
  GoogleCalendarIcon,
  GoogleClassroomIcon,
  GoogleContactsIcon,
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
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [scoreFilter, setScoreFilter] = useState("ALL");
  const [activeOnly, setActiveOnly] = useState(false);
  const [copiedScope, setCopiedScope] = useState<string | null>(null);

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

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedScope(url);
      setTimeout(() => setCopiedScope(null), 1800);
    });
  };

  const getServiceIcon = (service: string) => {
    if (service.includes("Gmail")) {
      return <GmailIcon className="w-4 h-4 flex-shrink-0" />;
    }
    if (service.includes("Drive")) {
      return <GoogleDriveIcon className="w-4 h-4 flex-shrink-0" />;
    }
    if (service.includes("Admin")) {
      return <GoogleAdminIcon className="w-4 h-4 flex-shrink-0" />;
    }
    if (service.includes("Calendar")) {
      return <GoogleCalendarIcon className="w-4 h-4 flex-shrink-0" />;
    }
    if (service.includes("Contacts")) {
      return <GoogleContactsIcon className="w-4 h-4 flex-shrink-0" />;
    }
    if (service.includes("Classroom") || service.includes("Chat")) {
      return <GoogleClassroomIcon className="w-4 h-4 flex-shrink-0" />;
    }
    return <GoogleProductIcon service={service} className="w-4 h-4 flex-shrink-0" />;
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
            🔴 5 (Red - Critical)
          </span>
        );
      case 4:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs whitespace-nowrap">
            🟠 4 (Orange - High)
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-yellow-100 text-yellow-900 border border-yellow-200 shadow-2xs whitespace-nowrap">
            🟡 3 (Yellow - Med)
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs whitespace-nowrap">
            🟢 2 (Green - Low)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs whitespace-nowrap">
            🔵 1 (Blue - Minimal)
          </span>
        );
    }
  };

  const activeInDomainCount = useMemo(() => {
    return scopes.filter((s) => (s.active_apps_count || 0) > 0).length;
  }, [scopes]);

  return (
    <div className="space-y-6">
      {/* Header & Overview Card */}
      <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/5 to-white border border-blue-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-blue-600 text-white shadow-xs">
                🛡️
              </span>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                Google Workspace OAuth Scope Threat Matrix
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                Database Reference
              </span>
            </div>
            <p className="text-xs text-gray-600 max-w-3xl leading-relaxed">
              Ground-truth reference catalog of Google Workspace OAuth
              permissions mapped to Google's official{" "}
              <strong className="text-gray-900">API User Data Policy Tiers</strong>{" "}
              (Restricted, Sensitive, Non-Sensitive) and the{" "}
              <strong className="text-gray-900">AdminLens 5-Point Threat Scale</strong>{" "}
              (1=Blue, 2=Green, 3=Yellow, 4=Orange, 5=Red). Active domain
              authorizations are cross-referenced from live tenant tokens.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="https://support.google.com/cloud/answer/9110914"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-700 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <span>📄</span> Google OAuth FAQ ↗
            </a>
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-700 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <span>⚖️</span> User Data Policy ↗
            </a>
          </div>
        </div>

        {/* Scope Classification Legend Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-200 text-xs">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50/70 border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500 mt-1 flex-shrink-0"></span>
            <div>
              <span className="font-bold text-red-900">
                Restricted Scopes (Google Tier)
              </span>
              <p className="text-red-700/80 text-[11px] mt-0.5 leading-snug">
                Requires mandatory annual CASA Tier 2 independent audits
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
                Accesses private personal/corporate data (calendars, contacts,
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
                Basic identity (openid, email, profile) or read-only operational
                metadata with minimal exfiltration surface.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
          <div className="text-gray-500 text-xs font-semibold">Cataloged Scopes</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {metrics?.total || scopes.length}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">Verified definitions</div>
        </div>

        <div className="bg-red-50/40 border border-red-200 rounded-xl p-4 shadow-2xs">
          <div className="text-red-700 text-xs font-semibold flex items-center gap-1">
            <span>🛡️</span> Restricted Tiers
          </div>
          <div className="text-2xl font-bold text-red-900 mt-1">
            {metrics?.restricted ??
              scopes.filter((s) => s.google_tier === "Restricted").length}
          </div>
          <div className="text-[11px] text-red-600 mt-0.5">CASA Tier 2 audit</div>
        </div>

        <div className="bg-amber-50/40 border border-amber-200 rounded-xl p-4 shadow-2xs">
          <div className="text-amber-700 text-xs font-semibold flex items-center gap-1">
            <span>👁️</span> Sensitive Tiers
          </div>
          <div className="text-2xl font-bold text-amber-900 mt-1">
            {metrics?.sensitive ??
              scopes.filter((s) => s.google_tier === "Sensitive").length}
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">Google reviewed</div>
        </div>

        <div className="bg-blue-50/40 border border-blue-200 rounded-xl p-4 shadow-2xs">
          <div className="text-blue-700 text-xs font-semibold flex items-center gap-1">
            <span>✓</span> Non-Sensitive
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            {metrics?.nonSensitive ??
              scopes.filter((s) => s.google_tier === "Non-Sensitive").length}
          </div>
          <div className="text-[11px] text-blue-600 mt-0.5">Basic identity / SSO</div>
        </div>

        <div className="bg-purple-50/40 border border-purple-200 rounded-xl p-4 shadow-2xs">
          <div className="text-purple-700 text-xs font-semibold flex items-center gap-1">
            <span>🔥</span> Critical Threats
          </div>
          <div className="text-2xl font-bold text-purple-900 mt-1">
            {metrics?.scores
              ? metrics.scores.critical + metrics.scores.high
              : scopes.filter((s) => s.admin_score >= 4).length}
          </div>
          <div className="text-[11px] text-purple-600 mt-0.5">Score 4 & 5</div>
        </div>

        <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-4 shadow-2xs">
          <div className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
            <span>📡</span> Active in Domain
          </div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">
            {activeInDomainCount}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Granted to apps</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-2xs">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search scope URL, rationale, or impact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-3 pr-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

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
            <label className="text-xs text-gray-500 font-semibold">Google Tier:</label>
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
              <option value="5">🔴 5 — Critical (Red)</option>
              <option value="4">🟠 4 — High (Orange)</option>
              <option value="3">🟡 3 — Medium (Yellow)</option>
              <option value="2">🟢 2 — Low (Green)</option>
              <option value="1">🔵 1 — Minimal (Blue)</option>
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

      {/* Scope Table */}
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
    </div>
  );
}
