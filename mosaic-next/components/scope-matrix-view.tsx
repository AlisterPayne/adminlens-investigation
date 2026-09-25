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
              Critical
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

export interface ScopeAppInfo {
  id: string;
  clientId?: string;
  displayName: string;
  iconUrl?: string;
  publisherDomain?: string;
  category?: string;
  appType?: string;
  riskLevel?: string;
  riskScore?: number;
  totalUsersCount?: number;
  adminAccessLevel?: string;
  rawApp?: any;
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
  active_apps?: ScopeAppInfo[];
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

function TenantAppsBadgePopover({
  scopeUrl,
  apps,
  count,
  onSelectApp,
}: {
  scopeUrl: string;
  apps: ScopeAppInfo[];
  count: number;
  onSelectApp?: (app: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return apps;
    const q = searchQuery.toLowerCase().trim();
    return apps.filter(
      (a) =>
        a.displayName.toLowerCase().includes(q) ||
        (a.category && a.category.toLowerCase().includes(q)) ||
        (a.publisherDomain && a.publisherDomain.toLowerCase().includes(q))
    );
  }, [apps, searchQuery]);

  const getRiskBadgeMini = (level?: string, score?: number) => {
    const formattedScore = score !== undefined ? `${score.toFixed(1)}` : null;
    switch (level?.toUpperCase()) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
            <span className="w-1 h-1 rounded-full bg-red-600"></span>
            <span>Critical</span>
            {formattedScore && <span className="font-mono text-[9px] bg-red-200/60 px-1 rounded">{formattedScore}</span>}
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1 h-1 rounded-full bg-amber-600"></span>
            <span>High</span>
            {formattedScore && <span className="font-mono text-[9px] bg-amber-200/60 px-1 rounded">{formattedScore}</span>}
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-yellow-50 text-yellow-800 border border-yellow-200">
            <span className="w-1 h-1 rounded-full bg-yellow-500"></span>
            <span>Med</span>
            {formattedScore && <span className="font-mono text-[9px] bg-yellow-200/60 px-1 rounded">{formattedScore}</span>}
          </span>
        );
      case "LOW":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1 h-1 rounded-full bg-blue-500"></span>
            <span>Low</span>
            {formattedScore && <span className="font-mono text-[9px] bg-blue-200/60 px-1 rounded">{formattedScore}</span>}
          </span>
        );
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100/90 hover:border-emerald-300 hover:shadow-2xs active:scale-95 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-emerald-500/25 select-none"
          title={`Click to view ${count} application${count > 1 ? "s" : ""} utilizing this scope`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
          <span>
            {count} App{count > 1 ? "s" : ""}
          </span>
          <svg
            className={`w-3 h-3 text-emerald-600/70 group-hover:text-emerald-800 transition-transform duration-150 ${
              open ? "rotate-180" : ""
            }`}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M2.5 4.5l3.5 3.5 3.5-3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={6}
        className="w-84 sm:w-96 p-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden outline-none pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                🏢
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-900">
                    Tenant Applications
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {count}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider shrink-0">
              OAuth Access
            </span>
          </div>

          <div
            className="mt-2 px-2.5 py-1 rounded-md bg-gray-100/80 border border-gray-200/60 font-mono text-[11px] text-gray-700 truncate select-all"
            title={scopeUrl}
          >
            {scopeUrl}
          </div>
        </div>

        {/* Optional Search if more than 3 apps */}
        {apps.length > 3 && (
          <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/50">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search apps in list..."
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        )}

        {/* App List */}
        <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 p-1.5">
          {apps.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-500 px-4">
              <div className="font-semibold text-gray-700">Audit telemetry detected {count} app{count > 1 ? "s" : ""}</div>
              <p className="text-[11px] text-gray-400 mt-1">Detailed application profiles are being indexed.</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-400">
              No matching applications found.
            </div>
          ) : (
            filteredApps.map((app) => (
              <div
                key={app.id}
                onClick={() => {
                  if (onSelectApp) {
                    onSelectApp(app.rawApp || app);
                    setOpen(false);
                  }
                }}
                className={`w-full text-left p-2.5 rounded-lg transition-colors flex items-center justify-between gap-3 ${
                  onSelectApp
                    ? "hover:bg-blue-50/60 cursor-pointer group"
                    : "hover:bg-gray-50/60"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* App Icon or Avatar */}
                  <div className="w-8 h-8 rounded-lg border border-gray-200 bg-white p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    {app.iconUrl ? (
                      <img
                        src={app.iconUrl}
                        alt={app.displayName}
                        className="w-full h-full object-contain rounded"
                        onError={(e) => {
                          const target = e.target as HTMLElement;
                          target.style.display = "none";
                          if (target.parentElement) {
                            target.parentElement.innerHTML = `<span class="text-xs font-bold text-gray-600">${app.displayName.charAt(0).toUpperCase()}</span>`;
                          }
                        }}
                      />
                    ) : (
                      <span className="text-xs font-bold text-gray-600">
                        {app.displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {app.displayName}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 truncate flex items-center gap-1.5 mt-0.5">
                      {app.publisherDomain ? (
                        <>
                          <span className="text-gray-600 font-medium">{app.publisherDomain}</span>
                          <span className="text-gray-300">•</span>
                        </>
                      ) : null}
                      <span className="text-gray-500 truncate">
                        {app.category || app.appType || "Application"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Risk Badge & Users Count & Inspect icon */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-end gap-1">
                    {getRiskBadgeMini(app.riskLevel, app.riskScore)}
                    <span className="text-[10px] text-gray-400 font-medium">
                      {app.totalUsersCount ?? 1} user{(app.totalUsersCount ?? 1) === 1 ? "" : "s"}
                    </span>
                  </div>
                  {onSelectApp && (
                    <svg
                      className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-3.5 py-2 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Active tenant authorization</span>
          </span>
          {onSelectApp && (
            <span className="text-[10px] font-semibold text-blue-600 hover:text-blue-700">
              Click app to inspect →
            </span>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function ScopeMatrixView({
  scopes = [],
  metrics,
  apps = [],
  onSelectApp,
  isBackend = false,
}: {
  scopes: ScopeReferenceItem[];
  metrics?: ScopeMetrics | null;
  apps?: any[];
  onSelectApp?: (app: any) => void;
  isBackend?: boolean;
}) {
  const [viewMode, setViewMode] = useState<"grouped" | "table">("grouped");
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [scoreFilter, setScoreFilter] = useState("ALL");
  const [activeOnly, setActiveOnly] = useState(false);
  const [inspectingApp, setInspectingApp] = useState<any | null>(null);
  const [collapsedServices, setCollapsedServices] = useState<Set<string>>(new Set());

  const toggleServiceCollapse = (serviceName: string) => {
    setCollapsedServices((prev) => {
      const next = new Set(prev);
      if (next.has(serviceName)) {
        next.delete(serviceName);
      } else {
        next.add(serviceName);
      }
      return next;
    });
  };

  const expandAll = () => setCollapsedServices(new Set());
  const collapseAll = () => {
    const all = new Set(groupedByService.map((g) => g.serviceName));
    setCollapsedServices(all);
  };

  // Derive distinct services if not provided
  // Pre-index apps by scope URL
  const appsByScope = useMemo(() => {
    const map = new Map<string, ScopeAppInfo[]>();
    if (apps && apps.length > 0) {
      for (const app of apps) {
        for (const s of (app.scopes || [])) {
          const url = typeof s === "string" ? s : (s.scope || s.scope_url);
          if (!url) continue;
          if (!map.has(url)) map.set(url, []);
          map.get(url)!.push({
            id: app.id,
            clientId: app.clientId || app.id,
            displayName: app.displayName,
            iconUrl: app.iconUrl,
            publisherDomain: app.publisherDomain,
            category: app.category,
            appType: app.appType,
            riskLevel: app.riskLevel,
            riskScore: app.riskScore,
            totalUsersCount: app.totalUsersCount,
            adminAccessLevel: app.adminAccessLevel,
            rawApp: app,
          });
        }
      }
    }
    return map;
  }, [apps]);

  // Compute applications count per Google Service strictly from workspace apps
  const serviceActiveAppCounts = useMemo(() => {
    const serviceMap = new Map<string, Set<string>>();
    scopes.forEach((s) => {
      if (!serviceMap.has(s.service_name)) {
        serviceMap.set(s.service_name, new Set<string>());
      }
      const set = serviceMap.get(s.service_name)!;
      const appList = appsByScope.get(s.scope_url) || [];
      appList.forEach((a) => set.add(a.id));
    });

    const counts = new Map<string, number>();
    serviceMap.forEach((appSet, srv) => {
      counts.set(srv, appSet.size);
    });
    return counts;
  }, [scopes, appsByScope]);

  // Available Services (ranked by most scopes/APIs to least)
  const availableServices = useMemo(() => {
    const rawServices = metrics?.services && metrics.services.length > 0
      ? metrics.services
      : Array.from(new Set(scopes.map((s) => s.service_name)));

    const scopeCountMap = new Map<string, number>();
    scopes.forEach((s) => {
      scopeCountMap.set(s.service_name, (scopeCountMap.get(s.service_name) || 0) + 1);
    });
    return [...rawServices].sort((a, b) => {
      const countDiff = (scopeCountMap.get(b) || 0) - (scopeCountMap.get(a) || 0);
      if (countDiff !== 0) return countDiff;
      return a.localeCompare(b);
    });
  }, [scopes, metrics]);

  // Filtering
  const filteredScopes = useMemo(() => {
    const q = search.toLowerCase().trim();
    const result = scopes.filter((s) => {
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
      const matchesActive = isBackend || !activeOnly || (appsByScope.get(s.scope_url) || []).length > 0;

      return (
        matchesQuery &&
        matchesService &&
        matchesTier &&
        matchesScore &&
        matchesActive
      );
    });

    // Rank by service with most scopes/APIs first, then service name, then scope URL
    const scopeCountMap = new Map<string, number>();
    scopes.forEach((s) => {
      scopeCountMap.set(s.service_name, (scopeCountMap.get(s.service_name) || 0) + 1);
    });
    return result.sort((a, b) => {
      const countDiff = (scopeCountMap.get(b.service_name) || 0) - (scopeCountMap.get(a.service_name) || 0);
      if (countDiff !== 0) return countDiff;
      if (a.service_name !== b.service_name) {
        return a.service_name.localeCompare(b.service_name);
      }
      return a.scope_url.localeCompare(b.scope_url);
    });
  }, [scopes, search, serviceFilter, tierFilter, scoreFilter, activeOnly, appsByScope, isBackend]);

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
      
      const activeApps = serviceActiveAppCounts.get(serviceName) || 0;

      // Scopes inside the service group are sorted alphabetically
      const sortedItems = [...items].sort((a, b) => a.scope_url.localeCompare(b.scope_url));

      return {
        serviceName,
        items: sortedItems,
        total,
        avgScore,
        maxScore,
        criticalCount,
        restricted,
        sensitive,
        nonSensitive,
        activeApps,
      };
    }).sort((a, b) => {
      // Rank from the service that has the most APIs/scopes to the least
      if (b.total !== a.total) {
        return b.total - a.total;
      }
      const avgDiff = parseFloat(b.avgScore) - parseFloat(a.avgScore);
      if (Math.abs(avgDiff) > 0.001) {
        return avgDiff;
      }
      return a.serviceName.localeCompare(b.serviceName);
    });
  }, [filteredScopes, serviceActiveAppCounts]);

  // Helper to resolve apps for a given scope strictly from client workspace applications
  const getScopeApps = (s: ScopeReferenceItem): ScopeAppInfo[] => {
    return appsByScope.get(s.scope_url) || [];
  };

  const handleAppClick = (app: any) => {
    if (onSelectApp) {
      onSelectApp(app.rawApp || app);
    } else {
      setInspectingApp(app.rawApp || app);
    }
  };


  const getServiceIcon = (service: string, className = "w-5 h-5 flex-shrink-0") => {
    return <GoogleProductIcon service={service} className={className} />;
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
            🔴 Critical
          </span>
        );
      case 4:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs whitespace-nowrap">
            🟠 High
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-yellow-100 text-yellow-900 border border-yellow-200 shadow-2xs whitespace-nowrap">
            🟡 Moderate
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs whitespace-nowrap">
            🟢 Minor
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs whitespace-nowrap">
            🔵 Low
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
      activeInDomain: filteredScopes.filter((s) => (appsByScope.get(s.scope_url) || []).length > 0).length,
    };
  }, [filteredScopes, appsByScope]);

  return (
    <div className="space-y-6">
      {/* KPI Cards (Non-clickable stat displays) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* All Scopes */}
        <div className={`text-left p-4 rounded-xl border shadow-2xs ${isBackend ? "bg-emerald-50/40 border-emerald-200" : "bg-blue-50/40 border-blue-200"}`}>
          <div className={`text-xs font-semibold ${isBackend ? "text-emerald-800" : "text-gray-500"}`}>Cataloged Scopes</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {kpiCounts.total}
          </div>
          <div className={`text-[11px] mt-0.5 ${isBackend ? "text-emerald-700 font-medium" : "text-gray-500"}`}>
            {isBackend ? "Master reference catalog" : "Verified definitions"}
          </div>
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
                  ? isBackend ? "bg-white text-emerald-800 shadow-xs border border-emerald-200" : "bg-white text-blue-600 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span>📁</span> Group by Service
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === "table"
                  ? isBackend ? "bg-white text-emerald-800 shadow-xs border border-emerald-200" : "bg-white text-blue-600 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>List View</span>
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder={isBackend ? "Search 158 global scopes..." : "Search scope, rationale, or impact..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full bg-gray-50 border border-gray-300 rounded-lg pl-3 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none ${
                isBackend ? "focus:border-emerald-500" : "focus:border-blue-500"
              } focus:bg-white transition-colors`}
            />
          </div>
        </div>

        {/* Right: Granular Filters */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          {(serviceFilter !== "ALL" || tierFilter !== "ALL" || scoreFilter !== "ALL" || (!isBackend && activeOnly) || search.trim() !== "") && (
            <button
              type="button"
              onClick={() => {
                setServiceFilter("ALL");
                setTierFilter("ALL");
                setScoreFilter("ALL");
                setActiveOnly(false);
                setSearch("");
              }}
              className={`text-xs font-semibold ${isBackend ? "text-emerald-700 hover:text-emerald-900" : "text-blue-600 hover:text-blue-800"} hover:underline cursor-pointer mr-1`}
            >
              Reset filters
            </button>
          )}

          {/* Service Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 font-semibold">Service:</label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className={`bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none ${
                isBackend ? "focus:border-emerald-500" : "focus:border-blue-500"
              }`}
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
              className={`bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none ${
                isBackend ? "focus:border-emerald-500" : "focus:border-blue-500"
              }`}
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
              className={`bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none ${
                isBackend ? "focus:border-emerald-500" : "focus:border-blue-500"
              }`}
            >
              <option value="ALL">All Scores</option>
              <option value="5">🔴 Critical</option>
              <option value="4">🟠 High</option>
              <option value="3">🟡 Moderate</option>
              <option value="2">🟢 Minor</option>
              <option value="1">🔵 Low</option>
            </select>
          </div>

          {/* Active Apps Only (Tenant specific - only shown in client mode) */}
          {!isBackend && (
            <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer ml-1 select-none font-medium">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(e) => setActiveOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Active Apps</span>
            </label>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* VIEW 1: GROUPED BY SERVICE                                       */}
      {/* ================================================================ */}
      {viewMode === "grouped" && (
        <div className="space-y-4">
          {/* Grouped View Global Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="text-xs text-gray-500 font-medium flex items-center gap-2">
              <span>Showing <strong className="text-gray-900">{groupedByService.length}</strong> Google Services</span>
              <span>•</span>
              <span className="text-gray-500">
                Ranked by accessing applications &amp; average threat score
              </span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={expandAll}
                className="text-xs font-semibold text-gray-600 hover:text-blue-600 px-2.5 py-1 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 shadow-2xs transition-colors flex items-center gap-1.5"
                title="Expand all service groups"
              >
                <span>➕</span> Expand All
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="text-xs font-semibold text-gray-600 hover:text-blue-600 px-2.5 py-1 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 shadow-2xs transition-colors flex items-center gap-1.5"
                title="Collapse all service groups"
              >
                <span>➖</span> Collapse All
              </button>
            </div>
          </div>

          {groupedByService.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400 font-medium">
              No services match the selected filter criteria.
            </div>
          ) : (
            groupedByService.map((grp) => {
              const isCollapsed = collapsedServices.has(grp.serviceName);
              return (
                <div
                  key={grp.serviceName}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs transition-all"
                >
                  {/* Service Header Strip (Collapsible) */}
                  <div
                    onClick={() => toggleServiceCollapse(grp.serviceName)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleServiceCollapse(grp.serviceName);
                      }
                    }}
                    className={`p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/40 cursor-pointer hover:bg-gray-50/90 transition-colors select-none ${
                      !isCollapsed ? "border-b border-gray-200" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-2xs flex-shrink-0">
                        {getServiceIcon(grp.serviceName, "w-6 h-6 flex-shrink-0")}
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-base font-bold text-gray-900">
                            {grp.serviceName}
                          </h3>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${isBackend ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-gray-100 text-gray-700 border-gray-200"}`}>
                            {grp.total} Scope{grp.total > 1 ? "s" : ""}
                          </span>
                          {!isBackend && grp.activeApps > 0 && (
                            <span
                              className="text-xs px-2.5 py-0.5 rounded-full font-bold border bg-blue-50 text-blue-700 border-blue-200"
                              title={`${grp.activeApps} applications currently request or access permissions in ${grp.serviceName}`}
                            >
                              {grp.activeApps} Accessing App{grp.activeApps === 1 ? "" : "s"}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 max-w-xl">
                          {grp.serviceName.includes("Google") ? grp.serviceName : `Google Workspace ${grp.serviceName}`} Service
                        </p>
                      </div>
                    </div>

                    {/* Service Controls: Threat Info Popover & Chevron */}
                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <div onClick={(e) => e.stopPropagation()}>
                        <ServiceThreatInfoPopover
                          serviceName={grp.serviceName}
                          avgScore={grp.avgScore}
                          criticalCount={grp.criticalCount}
                          maxScore={grp.maxScore}
                        />
                      </div>

                      <div
                        className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 shadow-2xs hover:bg-gray-50 transition-colors"
                        title={isCollapsed ? `Expand ${grp.serviceName} scopes` : `Collapse ${grp.serviceName} scopes`}
                      >
                        <svg
                          className={`w-4 h-4 fill-current transform transition-transform duration-200 ${
                            isCollapsed ? "-rotate-90 text-gray-400" : "rotate-0 text-gray-700"
                          }`}
                          viewBox="0 0 16 16"
                        >
                          <path d="M4.293 5.293a1 1 0 011.414 0L8 7.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Service Scope Table */}
                  {!isCollapsed && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-gray-700 table-fixed min-w-[960px]">
                        <colgroup>
                          <col style={{ width: isBackend ? "40%" : "35%" }} />
                          <col style={{ width: "140px" }} />
                          <col style={{ width: "160px" }} />
                          <col />
                          {!isBackend && <col style={{ width: "120px" }} />}
                        </colgroup>
                        <thead className="bg-gray-50/60 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200 font-semibold">
                          <tr>
                            <th className="py-2.5 px-4" style={{ width: isBackend ? "40%" : "35%" }}>OAuth Scope URI</th>
                            <th className="py-2.5 px-4" style={{ width: "140px" }}>Google Tier</th>
                            <th className="py-2.5 px-4" style={{ width: "160px" }}>Admin Score</th>
                            <th className="py-2.5 px-4">Threat Rationale &amp; Exploit Impact</th>
                            {!isBackend && <th className="py-2.5 px-4 text-center" style={{ width: "120px" }}>Tenant Apps</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {grp.items.map((s) => {
                            const tenantApps = getScopeApps(s);
                            const isActive = !isBackend && tenantApps.length > 0;
                            return (
                              <tr
                                key={s.scope_url}
                                className="hover:bg-gray-50/80 transition-colors"
                              >
                                {/* Scope URI */}
                                <td className="py-3 px-4">
                                  <span className="font-mono text-xs text-gray-900 font-semibold break-all select-all">
                                    {s.scope_url}
                                  </span>
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

                                {/* Tenant Footprint (Client mode only) */}
                                {!isBackend && (
                                  <td className="py-3 px-4 text-center whitespace-nowrap">
                                    {isActive ? (
                                      <TenantAppsBadgePopover
                                        scopeUrl={s.scope_url}
                                        apps={tenantApps}
                                        count={tenantApps.length}
                                        onSelectApp={handleAppClick}
                                      />
                                    ) : (
                                      <span className="text-xs text-gray-400 font-mono">
                                        0 apps
                                      </span>
                                    )}
                                  </td>
                                )}
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
                <th className="py-3 px-4">Threat Rationale &amp; Technical Impact</th>
                {!isBackend && <th className="py-3 px-4 text-center">Tenant Footprint</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredScopes.length === 0 ? (
                <tr>
                  <td
                    colSpan={isBackend ? 5 : 6}
                    className="py-12 text-center text-gray-400 font-medium"
                  >
                    No OAuth scopes match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredScopes.map((s) => {
                  const tenantApps = getScopeApps(s);
                  const isActive = !isBackend && tenantApps.length > 0;
                  return (
                    <tr
                      key={s.scope_url}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      {/* Scope URI */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs text-gray-900 font-semibold break-all select-all">
                          {s.scope_url}
                        </span>
                      </td>

                      {/* Service */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                          {getServiceIcon(s.service_name, "w-4 h-4 flex-shrink-0")}
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

                      {/* Tenant Footprint (Client mode only) */}
                      {!isBackend && (
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {isActive ? (
                            <TenantAppsBadgePopover
                              scopeUrl={s.scope_url}
                              apps={tenantApps}
                              count={tenantApps.length}
                              onSelectApp={handleAppClick}
                            />
                          ) : (
                            <span className="text-xs text-gray-400 font-mono">
                              0 apps
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Application Quick Inspection Modal (Fallback when client mode & standalone / onSelectApp not wired) */}
      {!isBackend && inspectingApp && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setInspectingApp(null)}
        >
          <div
            className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-start justify-between bg-gradient-to-r from-gray-50 via-white to-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl border border-gray-200 bg-white p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                  {inspectingApp.iconUrl ? (
                    <img
                      src={inspectingApp.iconUrl}
                      alt={inspectingApp.displayName}
                      className="w-full h-full object-contain rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.display = "none";
                        if (target.parentElement) {
                          target.parentElement.innerHTML = `<span class="text-base font-bold text-gray-700">${inspectingApp.displayName?.charAt(0) || "A"}</span>`;
                        }
                      }}
                    />
                  ) : (
                    <span className="text-base font-bold text-gray-700">
                      {inspectingApp.displayName?.charAt(0) || "A"}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">
                      {inspectingApp.displayName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                    {inspectingApp.publisherDomain && (
                      <span className="text-gray-600 font-medium">🌐 {inspectingApp.publisherDomain}</span>
                    )}
                    {inspectingApp.publisherDomain && <span>•</span>}
                    <span>{inspectingApp.category || inspectingApp.appType || "Application"}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setInspectingApp(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16">
                  <path d="M7.95 6.536l4.242-4.243a1 1 0 111.415 1.414L9.364 7.95l4.243 4.242a1 1 0 11-1.415 1.415L7.95 9.364l-4.243 4.243a1 1 0 01-1.414-1.415L6.536 7.95 2.293 3.707a1 1 0 011.414-1.414L7.95 6.536z" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 text-xs text-gray-700 max-h-[60vh] overflow-y-auto">
              {/* Stat Grid */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">Risk Level</div>
                  <div className="mt-1 font-bold text-gray-900">{inspectingApp.riskLevel || "MODERATE"}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">Risk Score</div>
                  <div className="mt-1 font-bold text-gray-900">
                    {inspectingApp.riskScore !== undefined ? `${Number(inspectingApp.riskScore).toFixed(1)} / 5.0` : "N/A"}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">Active Users</div>
                  <div className="mt-1 font-bold text-gray-900">
                    {inspectingApp.totalUsersCount ?? 1} User{(inspectingApp.totalUsersCount ?? 1) === 1 ? "" : "s"}
                  </div>
                </div>
              </div>

              {/* Client ID */}
              {inspectingApp.clientId && (
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">OAuth Client ID</div>
                  <div className="font-mono text-[11px] text-gray-800 break-all select-all">
                    {inspectingApp.clientId}
                  </div>
                </div>
              )}

              {/* Access Policy */}
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-blue-700 font-semibold uppercase">Workspace Access Policy</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-blue-800 border border-blue-200">
                    {inspectingApp.adminAccessLevel || "UNCONFIGURED"}
                  </span>
                </div>
                <p className="text-[11px] text-blue-950/80 leading-relaxed">
                  {inspectingApp.adminAccessLevel === "TRUSTED"
                    ? "This app is explicitly trusted by domain administrators and has access to requested Google Workspace APIs."
                    : inspectingApp.adminAccessLevel === "BLOCKED"
                    ? "This application is blocked from authenticating or accessing workspace resources."
                    : inspectingApp.adminAccessLevel === "LIMITED"
                    ? "Limited access policy applied to restrict access strictly to non-sensitive scopes."
                    : "This application has not yet been configured or reviewed in Google Workspace Admin Console."}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <a
                href="/?tab=apps"
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline"
              >
                View in Application Catalog →
              </a>
              <button
                type="button"
                onClick={() => setInspectingApp(null)}
                className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-900 text-white font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
