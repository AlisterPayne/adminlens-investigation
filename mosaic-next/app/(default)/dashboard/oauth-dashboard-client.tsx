"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  GmailIcon,
  GoogleDriveIcon,
  GoogleAdminIcon,
  GoogleCalendarIcon,
  GoogleClassroomIcon,
  GoogleContactsIcon,
  GoogleProductIcon,
} from "@/components/google-icons";
import ScopeMatrixView, { ScopeReferenceItem, ScopeMetrics } from "@/components/scope-matrix-view";

interface ScopeItem {
  scope: string;
  riskLevel: string;
  description: string;
  service?: string;
}

interface UserGrant {
  email: string;
  name: string;
  orgUnit: string;
  isAdmin: boolean;
  grantedScopes: string[];
}

interface SiblingDeployment {
  id: string;
  displayName: string;
  deploymentType: string;
  clientId: string;
  adminAccessLevel: string;
  totalUsersCount: number;
  maxRisk: string;
}

interface Application {
  id: string;
  clientId?: string;
  familyId?: string;
  familyName?: string;
  deploymentType?: string;
  displayName: string;
  vendor: string;
  publisherDomain: string;
  category: string;
  appType: string;
  compliance: string[];
  dataHosting: string;
  breachHistory: string | null;
  isVerified: boolean;
  iconUrl: string;
  storeUrl: string | null;
  description?: string;
  riskLevel: string;
  riskReasons: string[];
  adminAccessLevel?: string;
  accessPolicy?: {
    accessLevel: string;
    orgUnitPath: string;
    domainName?: string;
    isOverridden?: boolean;
    exemptFromContextAwareAccess?: boolean;
    allowedServices?: Record<string, number>;
    configuredBy?: string;
    lastPolicyUpdate?: string;
  };
  multiClientMapped: boolean;
  familyDeploymentsCount?: number;
  siblingDeployments?: SiblingDeployment[];
  clientIdsCount: number;
  clientIds: string[];
  projectNumbers: string[];
  totalUsersCount: number;
  adminUsersCount: number;
  scopesCount: number;
  scopes: ScopeItem[];
  servicesTouched?: string[];
  users: UserGrant[];
  totalActivityEvents: number;
  lastActiveFormatted: string;
  isStale: boolean;
  isNew: boolean;
}

interface Recommendation {
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
  gamCommand?: string;
}

interface Metrics {
  totalApplications: number;
  totalDomainUsers: number;
  totalActiveGrants: number;
  criticalRiskApps: number;
  highRiskApps: number;
  trustedAppsCount?: number;
  blockedAppsCount?: number;
  specificDataAppsCount?: number;
  unconfiguredAppsCount?: number;
  multiClientApps: number;
  baselineSource?: string | null;
  baselinePolicyCount?: number;
  baselineLoadedAt?: string | null;
}

export default function OAuthDashboardClient({
  initialApps,
  initialRecs,
  metrics,
  users,
  initialScopes = [],
  scopeMetrics = null,
}: {
  initialApps: Application[];
  initialRecs: { totalFindings: number; findings: Recommendation[] };
  metrics: Metrics;
  users: any[];
  initialScopes?: ScopeReferenceItem[];
  scopeMetrics?: ScopeMetrics | null;
}) {
  const [currentApps, setCurrentApps] = useState<Application[]>(initialApps);
  const [currentMetrics, setCurrentMetrics] = useState<Metrics>(metrics);
  const [activeTab, setActiveTab] = useState<"dashboard" | "apps" | "recs" | "scopes">("dashboard");
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [policyFilter, setPolicyFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [multiOnly, setMultiOnly] = useState(false);
  const [recSeverityFilter, setRecSeverityFilter] = useState("ALL");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [uploadToast, setUploadToast] = useState<string | null>(null);
  const [groupByFamily, setGroupByFamily] = useState(true);

  const getDeploymentTypeBadge = (type: string = "Web Application") => {
    switch (type) {
      case "Chrome Extension":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
            <span>🧩</span> Extension
          </span>
        );
      case "Android App":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <span>📱</span> Android
          </span>
        );
      case "iOS App":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
            <span>🍎</span> iOS
          </span>
        );
      case "Staging / Dev":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
            <span>⚠️</span> Staging/Dev
          </span>
        );
      case "Google Apps Script":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
            <span>⚙️</span> Apps Script
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
            <span>🌐</span> Web App
          </span>
        );
    }
  };

  // Derived Calculations
  const totalAppsCount = currentApps.length;
  const highRiskAppsCount = currentApps.filter(a => a.riskLevel === 'CRITICAL' || a.riskLevel === 'HIGH').length;
  const staleAppsCount = currentApps.filter(a => a.isStale).length;
  const newAppsCount = currentApps.filter(a => a.isNew).length;
  const trustedAppsCount = currentMetrics.trustedAppsCount || currentApps.filter(a => a.adminAccessLevel === 'TRUSTED').length;

  // Sensitive Services Hotspots
  const serviceHotspots = {
    Gmail: currentApps.filter(a => a.servicesTouched?.includes('Gmail')).length,
    Drive: currentApps.filter(a => a.servicesTouched?.includes('Google Drive')).length,
    AdminSDK: currentApps.filter(a => a.servicesTouched?.includes('Admin SDK')).length,
    Calendar: currentApps.filter(a => a.servicesTouched?.includes('Calendar')).length,
    Classroom: currentApps.filter(a => a.servicesTouched?.includes('Classroom')).length,
    Contacts: currentApps.filter(a => a.servicesTouched?.includes('Contacts')).length,
  };

  // Click-through to filtered apps list
  const filterByServiceAndNavigate = (serviceName: string) => {
    setServiceFilter(serviceName);
    setRiskFilter("ALL");
    setPolicyFilter("ALL");
    setCategoryFilter("ALL");
    setTypeFilter("ALL");
    setSearch("");
    setActiveTab("apps");
  };

  // Top AI Tools
  const aiTools = currentApps.filter(a => 
    a.category.toLowerCase().includes('ai') || 
    ['claude', 'suno', 'google ai studio', 'gemini-enterprise', 'gemini for workspace studio'].some(k => a.displayName.toLowerCase().includes(k))
  );

  // Breach History Apps
  const breachApps = currentApps.filter(a => a.breachHistory);

  // Top Apps by Reach
  const topReachApps = [...currentApps].sort((a, b) => b.totalUsersCount - a.totalUsersCount).slice(0, 5);

  // Top New Apps
  const topNewApps = currentApps.filter(a => a.isNew).slice(0, 4);

  // Most Frequent Risky Scopes
  const scopeMap = new Map<string, number>();
  currentApps.forEach(a => {
    a.scopes.forEach(s => {
      if (s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH') {
        scopeMap.set(s.description, (scopeMap.get(s.description) || 0) + 1);
      }
    });
  });
  const frequentScopes = Array.from(scopeMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const categories = Array.from(new Set(currentApps.map((a) => a.category))).sort();
  const appTypes = Array.from(new Set(currentApps.map((a) => a.appType || 'Web Application'))).sort();

  const filteredApps = currentApps.filter((app) => {
    const matchesSearch =
      app.displayName.toLowerCase().includes(search.toLowerCase()) ||
      app.vendor.toLowerCase().includes(search.toLowerCase()) ||
      (app.familyName && app.familyName.toLowerCase().includes(search.toLowerCase())) ||
      app.clientIds.some((cid) => cid.toLowerCase().includes(search.toLowerCase()));
    const matchesRisk = riskFilter === "ALL" || app.riskLevel === riskFilter;
    const policyLevel = app.adminAccessLevel || "UNCONFIGURED";
    const matchesPolicy = policyFilter === "ALL" || policyLevel === policyFilter;
    const matchesCat = categoryFilter === "ALL" || app.category === categoryFilter;
    const matchesType = typeFilter === "ALL" || app.appType === typeFilter;
    const matchesService = serviceFilter === "ALL" || (app.servicesTouched || []).includes(serviceFilter);
    const matchesMulti = !multiOnly || app.multiClientMapped;
    return matchesSearch && matchesRisk && matchesPolicy && matchesCat && matchesType && matchesService && matchesMulti;
  });

  // Group filtered apps by Product Family
  const groupedFamilies = useMemo(() => {
    const map = new Map<string, { familyId: string; familyName: string; vendor: string; iconUrl: string; items: Application[] }>();
    filteredApps.forEach((app) => {
      const fId = app.familyId || app.vendor || "unclassified";
      const fName = app.familyName || app.vendor;
      if (!map.has(fId)) {
        map.set(fId, {
          familyId: fId,
          familyName: fName,
          vendor: app.vendor,
          iconUrl: app.iconUrl,
          items: [],
        });
      }
      map.get(fId)!.items.push(app);
    });
    return Array.from(map.values());
  }, [filteredApps]);

  const filteredRecs = (initialRecs.findings || []).filter(
    (f) => recSeverityFilter === "ALL" || f.severity === recSeverityFilter
  );

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCsvUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      try {
        const parseLine = (line: string) => {
          const res: string[] = [];
          let cur = '';
          let q = false;
          for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (c === '"') {
              if (q && line[i+1] === '"') { cur += '"'; i++; }
              else { q = !q; }
            } else if (c === ',' && !q) {
              res.push(cur);
              cur = '';
            } else {
              cur += c;
            }
          }
          res.push(cur);
          return res;
        };

        const lines = text.trim().split(/\r?\n/);
        if (lines.length < 2) return;
        const headers = parseLine(lines[0]).map(h => h.trim());
        const policyMap = new Map<string, any>();

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const vals = parseLine(lines[i]);
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => row[h] = vals[idx] ? vals[idx].trim() : '');
          const cid = row['Id'];
          if (cid) {
            const rawAccess = (row['Access'] || '').toUpperCase();
            const accessLevel = rawAccess === 'TRUSTED' ? 'TRUSTED' :
                               (rawAccess === 'LIMITED' ? 'LIMITED' :
                               (rawAccess === 'BLOCKED' ? 'BLOCKED' :
                               (rawAccess.includes('SPECIFIC') ? 'SPECIFIC_DATA' : 'UNCONFIGURED')));
            policyMap.set(cid, {
              accessLevel,
              orgUnitPath: row['Org Unit'] || '/',
              isOverridden: row['Org Unit'] && row['Org Unit'] !== '/',
              appName: row['App Name']
            });
          }
        }

        const newApps = currentApps.map(app => {
          let matchedPolicy = null;
          for (const cid of app.clientIds) {
            if (policyMap.has(cid)) {
              matchedPolicy = policyMap.get(cid);
              break;
            }
          }
          if (matchedPolicy) {
            return {
              ...app,
              adminAccessLevel: matchedPolicy.accessLevel,
              accessPolicy: {
                accessLevel: matchedPolicy.accessLevel,
                orgUnitPath: matchedPolicy.orgUnitPath,
                isOverridden: matchedPolicy.isOverridden,
                domainName: 'gafe.co.za',
                configuredBy: `Uploaded CSV (${file.name})`,
                lastPolicyUpdate: new Date().toISOString()
              }
            };
          }
          return app;
        });

        setCurrentApps(newApps);
        const trusted = newApps.filter(a => a.adminAccessLevel === 'TRUSTED').length;
        setCurrentMetrics(prev => ({
          ...prev,
          trustedAppsCount: trusted,
          baselineSource: file.name,
          baselinePolicyCount: policyMap.size,
          baselineLoadedAt: new Date().toISOString()
        }));
        setUploadToast(`✓ Ingested ${policyMap.size} policies from "${file.name}"! Updated domain trust baseline (${trusted} Trusted apps).`);
        setShowSetupModal(false);
        setTimeout(() => setUploadToast(null), 6000);
      } catch (err: any) {
        alert('Failed to parse CSV: ' + err?.message);
      }
    };
    reader.readAsText(file);
  };

  const getPolicyBadge = (policyLevel?: string) => {
    switch (policyLevel) {
      case 'TRUSTED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span> 🛡️ Trusted
          </span>
        );
      case 'LIMITED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span> Limited
          </span>
        );
      case 'SPECIFIC_DATA':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span> Specific Data
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span> Blocked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-500 border border-gray-200">
            Unconfigured
          </span>
        );
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span> Critical
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span> High
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-semibold text-yellow-800 border border-yellow-200">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-600"></span> Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span> Low
          </span>
        );
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto space-y-6">
      
      {/* Top Header Banner */}
      <div className="sm:flex sm:justify-between sm:items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              AL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Third-Party Apps</h1>
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  Admin Lens
                </span>
                {/* Version Switcher Pill */}
                <div className="ml-2 inline-flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
                  <span className="bg-white text-blue-600 font-bold px-2 py-0.5 rounded shadow-2xs">
                    V1 Classic
                  </span>
                  <Link
                    href="/dashboard-v2"
                    className="text-gray-500 hover:text-purple-700 px-2 py-0.5 rounded hover:bg-white/80 transition-colors font-medium flex items-center gap-1"
                  >
                    <span>✨ Switch to V2</span>
                  </Link>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Workspace Domain: <span className="font-mono font-semibold text-gray-700">gafe.co.za</span> • Super Admin: <span className="font-mono text-gray-700">alister@gafe.co.za</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-4 sm:mt-0 flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "dashboard" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab("apps")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "apps" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📑 All Applications ({initialApps.length})
          </button>
          <button
            onClick={() => setActiveTab("recs")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "recs" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            🚨 Recommendations ({initialRecs.totalFindings || 73})
          </button>
          <button
            onClick={() => setActiveTab("scopes")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "scopes" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            🛡️ Scope Threat Matrix ({initialScopes.length || 59})
          </button>
        </div>
      </div>

      {/* Upload Toast Alert */}
      {uploadToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>{uploadToast}</span>
          </div>
          <button onClick={() => setUploadToast(null)} className="text-emerald-600 hover:text-emerald-900 text-xs font-bold">
            ✕
          </button>
        </div>
      )}

      {/* App Access Control Baseline Banner */}
      <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/5 to-white border border-blue-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0 shadow-xs">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-sm text-gray-900 tracking-tight">
                Google Workspace App Access Control Baseline
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Ground-Truth Active ({currentMetrics.baselineSource || 'owl_apps.csv'})
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              <span className="font-semibold text-emerald-700">{currentMetrics.baselinePolicyCount || 32} domain policies synchronized</span> across Organizational Units. Overcomes Google&apos;s 180-day audit log expiration to reveal dormant, pre-sanctioned, and restricted third-party applications.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-shrink-0">
          <button
            onClick={() => setShowSetupModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shadow-blue-500/20"
          >
            <span>📖</span> Setup Instructions
          </button>
          <label className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-gray-300 cursor-pointer shadow-2xs">
            <span>📥</span> Update CSV
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleCsvUpload(f);
              }}
            />
          </label>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: EXECUTIVE DASHBOARD VIEW                               */}
      {/* ============================================================== */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          
          {/* Top 5 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Total Apps */}
            <div 
              onClick={() => { setActiveTab("apps"); setRiskFilter("ALL"); setPolicyFilter("ALL"); setServiceFilter("ALL"); }}
              className="bg-white border border-blue-200/80 rounded-xl p-5 shadow-sm relative overflow-hidden bg-gradient-to-br from-blue-50/40 to-white hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="text-blue-600 text-sm">⚡</span> TOTAL APPS
                </span>
                <span className="text-gray-400">›</span>
              </div>
              <div className="text-3xl font-extrabold text-gray-900 mt-2">{totalAppsCount}</div>
              <div className="text-xs text-gray-500 mt-1">Unique apps authorized</div>
            </div>

            {/* Trusted by Admin */}
            <div 
              onClick={() => { setActiveTab("apps"); setPolicyFilter("TRUSTED"); setRiskFilter("ALL"); setServiceFilter("ALL"); }}
              className="bg-white border border-emerald-200 rounded-xl p-5 shadow-sm relative overflow-hidden bg-gradient-to-br from-emerald-50/40 to-white hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-600 text-sm">🛡️</span> TRUSTED BY ADMIN
                </span>
                <span className="text-emerald-400">›</span>
              </div>
              <div className="text-3xl font-extrabold text-emerald-700 mt-2">{trustedAppsCount}</div>
              <div className="text-xs text-emerald-600/80 mt-1">Admin sanctioned in Console</div>
            </div>

            {/* High Risk Apps */}
            <div 
              onClick={() => { setActiveTab("apps"); setRiskFilter("CRITICAL"); setPolicyFilter("ALL"); setServiceFilter("ALL"); }}
              className="bg-white border border-red-200 rounded-xl p-5 shadow-sm relative overflow-hidden bg-gradient-to-br from-red-50/40 to-white hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-red-600 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="text-red-600 text-sm">⚠️</span> HIGH-RISK APPS
                </span>
                <span className="text-red-400">›</span>
              </div>
              <div className="text-3xl font-extrabold text-red-600 mt-2">{highRiskAppsCount}</div>
              <div className="text-xs text-red-600/80 mt-1">Require immediate review</div>
            </div>

            {/* Stale Apps */}
            <div 
              onClick={() => { setActiveTab("apps"); }}
              className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm relative overflow-hidden bg-gradient-to-br from-amber-50/40 to-white hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-amber-700 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-600 text-sm">⏳</span> STALE APPS
                </span>
                <span className="text-amber-400">›</span>
              </div>
              <div className="text-3xl font-extrabold text-amber-700 mt-2">{staleAppsCount}</div>
              <div className="text-xs text-amber-600/80 mt-1">Inactive for &gt;90 days</div>
            </div>

            {/* New Apps */}
            <div 
              onClick={() => { setActiveTab("apps"); }}
              className="bg-white border border-indigo-200 rounded-xl p-5 shadow-sm relative overflow-hidden bg-gradient-to-br from-indigo-50/40 to-white hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-indigo-700 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="text-indigo-600 text-sm">🚀</span> NEW APPS
                </span>
                <span className="text-indigo-400">›</span>
              </div>
              <div className="text-3xl font-extrabold text-indigo-700 mt-2">{newAppsCount}</div>
              <div className="text-xs text-indigo-600/80 mt-1">Detected in last 30 days</div>
            </div>

          </div>

          {/* Row 2: Sensitive Access Hotspots & Frequent Risky Scopes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Sensitive Access Hotspots (Interactive Drill-Down) */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <span>🔥</span> Sensitive Access Hotspots
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Click any service to view authorized apps</p>
                </div>
                <span className="text-xs font-semibold text-gray-400">App Count</span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Gmail */}
                <div 
                  onClick={() => filterByServiceAndNavigate("Gmail")}
                  className="group flex items-center justify-between p-3 rounded-lg bg-gray-50/90 border border-gray-100 hover:bg-blue-50/60 hover:border-blue-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 font-semibold text-gray-800 group-hover:text-blue-700">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200/80 shadow-xs flex items-center justify-center p-1.5 flex-shrink-0">
                      <GmailIcon className="w-5 h-5" />
                    </div>
                    <span>Gmail Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white font-bold px-2.5 py-0.5 rounded-full text-xs shadow-xs">{serviceHotspots.Gmail}</span>
                    <span className="text-gray-300 group-hover:text-blue-500 font-bold">›</span>
                  </div>
                </div>

                {/* Google Drive */}
                <div 
                  onClick={() => filterByServiceAndNavigate("Google Drive")}
                  className="group flex items-center justify-between p-3 rounded-lg bg-gray-50/90 border border-gray-100 hover:bg-emerald-50/60 hover:border-emerald-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 font-semibold text-gray-800 group-hover:text-emerald-700">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200/80 shadow-xs flex items-center justify-center p-1.5 flex-shrink-0">
                      <GoogleDriveIcon className="w-5 h-5" />
                    </div>
                    <span>Google Drive (Full Data Access)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-full text-xs shadow-xs">{serviceHotspots.Drive}</span>
                    <span className="text-gray-300 group-hover:text-emerald-500 font-bold">›</span>
                  </div>
                </div>

                {/* Admin SDK */}
                <div 
                  onClick={() => filterByServiceAndNavigate("Admin SDK")}
                  className="group flex items-center justify-between p-3 rounded-lg bg-gray-50/90 border border-gray-100 hover:bg-red-50/60 hover:border-red-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 font-semibold text-gray-800 group-hover:text-red-700">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200/80 shadow-xs flex items-center justify-center p-1.5 flex-shrink-0">
                      <GoogleAdminIcon className="w-5 h-5" />
                    </div>
                    <span>Admin SDK / Directory &amp; Devices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-red-600 text-white font-bold px-2.5 py-0.5 rounded-full text-xs shadow-xs">{serviceHotspots.AdminSDK}</span>
                    <span className="text-gray-300 group-hover:text-red-500 font-bold">›</span>
                  </div>
                </div>

                {/* Calendar */}
                <div 
                  onClick={() => filterByServiceAndNavigate("Calendar")}
                  className="group flex items-center justify-between p-3 rounded-lg bg-gray-50/90 border border-gray-100 hover:bg-amber-50/60 hover:border-amber-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 font-semibold text-gray-800 group-hover:text-amber-700">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200/80 shadow-xs flex items-center justify-center p-1.5 flex-shrink-0">
                      <GoogleCalendarIcon className="w-5 h-5" />
                    </div>
                    <span>Calendar &amp; Scheduling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-600 text-white font-bold px-2.5 py-0.5 rounded-full text-xs shadow-xs">{serviceHotspots.Calendar}</span>
                    <span className="text-gray-300 group-hover:text-amber-500 font-bold">›</span>
                  </div>
                </div>

                {/* Google Classroom */}
                <div 
                  onClick={() => filterByServiceAndNavigate("Classroom")}
                  className="group flex items-center justify-between p-3 rounded-lg bg-gray-50/90 border border-gray-100 hover:bg-indigo-50/60 hover:border-indigo-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 font-semibold text-gray-800 group-hover:text-indigo-700">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200/80 shadow-xs flex items-center justify-center p-1.5 flex-shrink-0">
                      <GoogleClassroomIcon className="w-5 h-5" />
                    </div>
                    <span>Google Classroom &amp; Rosters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-600 text-white font-bold px-2.5 py-0.5 rounded-full text-xs shadow-xs">{serviceHotspots.Classroom}</span>
                    <span className="text-gray-300 group-hover:text-indigo-500 font-bold">›</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Most Frequent Risky Scopes */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <span>⚠️</span> Most Frequent Risky Scopes
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Permissions requiring administrative oversight</p>
                </div>
                <span className="text-xs font-semibold text-gray-400">Grants</span>
              </div>

              <div className="space-y-2 text-xs">
                {frequentScopes.map(([desc, count], i) => (
                  <div 
                    key={i} 
                    onClick={() => { setActiveTab("apps"); setSearch(desc.split(" ")[0]); }}
                    className="group flex items-center justify-between p-3 rounded-lg bg-gray-50/90 border border-gray-100 hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    <div className="truncate font-semibold text-gray-800 pr-2 group-hover:text-blue-700">
                      {desc}
                    </div>
                    <span className="bg-red-50 text-red-700 font-bold px-2.5 py-0.5 rounded-full text-xs border border-red-200 flex-shrink-0">
                      {count} apps
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Row 3: Shadow AI Tools & Security Incident History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top AI Tools */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <span>🤖</span> Shadow AI &amp; Generative AI Tools
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Active AI platforms &amp; developer tools</p>
                </div>
                <span className="text-xs text-purple-600 font-bold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  {aiTools.length} Detected
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {aiTools.map((ai) => (
                  <div
                    key={ai.id}
                    onClick={() => setSelectedApp(ai)}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-purple-50/40 hover:border-purple-200 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img src={ai.iconUrl} alt="" className="w-8 h-8 rounded-lg bg-white border border-gray-200 object-contain p-0.5" />
                      <div>
                        <div className="font-bold text-gray-900">{ai.displayName}</div>
                        <div className="text-[11px] text-gray-500">{ai.vendor} • {ai.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-md">
                        {ai.totalUsersCount} user(s)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Breach History Alert Widget */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <span>🛡️</span> Apps with Vendor Breach History
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Public breach records for authorized vendors</p>
                </div>
                <span className="text-xs text-red-600 font-bold bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                  {breachApps.length} Flagged
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {breachApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="flex items-center justify-between p-3 rounded-lg bg-red-50/30 border border-red-200/60 hover:bg-red-50/80 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img src={app.iconUrl} alt="" className="w-8 h-8 rounded-lg bg-white border border-gray-200 object-contain p-0.5" />
                      <div>
                        <div className="font-bold text-gray-900">{app.displayName}</div>
                        <div className="text-[11px] text-red-700 font-semibold">{app.breachHistory}</div>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-red-700 bg-red-100 border border-red-200 px-2.5 py-1 rounded-full">
                        {app.totalUsersCount} exposed user(s)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: ALL APPLICATIONS CATALOG (PRESERVED & ENRICHED)         */}
      {/* ============================================================== */}
      {activeTab === "apps" && (
        <div className="space-y-4">
          
          {/* Active Filter Pill (if coming from Hotspot click) */}
          {serviceFilter !== "ALL" && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-xs text-blue-800">
              <div className="flex items-center gap-2">
                <span className="font-bold">Filtering by Service:</span>
                <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-2.5 py-1 rounded font-bold">
                  <div className="w-4 h-4 bg-white rounded-xs p-0.5 flex items-center justify-center">
                    <GoogleProductIcon service={serviceFilter} className="w-3.5 h-3.5" />
                  </div>
                  {serviceFilter}
                </span>
                <span>({filteredApps.length} matching applications)</span>
              </div>
              <button
                onClick={() => setServiceFilter("ALL")}
                className="text-blue-600 hover:text-blue-900 font-bold underline text-xs"
              >
                Clear Service Filter ✕
              </button>
            </div>
          )}

          {/* Top KPI Header Cards for All Applications */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">TOTAL APPS</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{totalAppsCount}</div>
              <div className="text-xs text-gray-500 mt-0.5">Unique apps authorized</div>
            </div>
            <div 
              onClick={() => setPolicyFilter(policyFilter === "TRUSTED" ? "ALL" : "TRUSTED")}
              className={`border rounded-xl p-4 shadow-sm cursor-pointer transition-all ${
                policyFilter === "TRUSTED" ? "bg-emerald-100/70 border-emerald-500 ring-2 ring-emerald-500/20" : "bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50"
              }`}
            >
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">TRUSTED BY ADMIN</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">{trustedAppsCount}</div>
              <div className="text-xs text-emerald-600/80 mt-0.5">Console allowlisted</div>
            </div>
            <div className="bg-red-50/50 border border-red-200 rounded-xl p-4 shadow-sm">
              <div className="text-xs font-bold text-red-600 uppercase tracking-wider">HIGH-RISK APPS</div>
              <div className="text-2xl font-bold text-red-700 mt-1">{highRiskAppsCount}</div>
              <div className="text-xs text-red-600/80 mt-0.5">Require immediate review</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">SENSITIVE ACCESS</div>
              <div className="flex items-center gap-4 mt-2 text-xs">
                <span className="inline-flex items-center gap-1.5 text-gray-800 font-semibold">
                  <GmailIcon className="w-4 h-4" /> Gmail: <span className="text-blue-600 font-bold">{serviceHotspots.Gmail}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-gray-800 font-semibold">
                  <GoogleDriveIcon className="w-4 h-4" /> Drive: <span className="text-emerald-600 font-bold">{serviceHotspots.Drive}</span>
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Data egress risks</div>
            </div>
            <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 shadow-sm">
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">RISKY SCOPES</div>
              <div className="text-2xl font-bold text-amber-800 mt-1">{scopeMap.size}</div>
              <div className="text-xs text-amber-700/80 mt-0.5">Unique dangerous permissions</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search apps, vendors, client IDs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500"
              />
              <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
              {/* Access Policy Filter */}
              <select
                value={policyFilter}
                onChange={(e) => setPolicyFilter(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none font-medium"
              >
                <option value="ALL">Policy: All</option>
                <option value="TRUSTED">🛡️ Trusted</option>
                <option value="LIMITED">🔹 Limited</option>
                <option value="SPECIFIC_DATA">🔸 Specific Data</option>
                <option value="BLOCKED">🚫 Blocked</option>
                <option value="UNCONFIGURED">⚪ Unconfigured</option>
              </select>

              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none"
              >
                <option value="ALL">Risk: All</option>
                <option value="CRITICAL">🔴 Critical</option>
                <option value="HIGH">🟠 High</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="LOW">🟢 Low</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none"
              >
                <option value="ALL">Category: All</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none"
              >
                <option value="ALL">Type: All</option>
                {appTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none"
              >
                <option value="ALL">Service: All</option>
                <option value="Gmail">Gmail</option>
                <option value="Google Drive">Google Drive</option>
                <option value="Admin SDK">Admin SDK</option>
                <option value="Calendar">Calendar</option>
                <option value="Classroom">Classroom</option>
                <option value="Contacts">Contacts</option>
              </select>

              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-pointer bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={multiOnly}
                  onChange={(e) => setMultiOnly(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-0"
                />
                Multi-Deployment Only
              </label>

              <button
                onClick={() => setGroupByFamily(!groupByFamily)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                  groupByFamily
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs font-bold"
                    : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
                title="Toggle between hierarchical Product Family view and flat deployments list"
              >
                <span>🏢</span>
                <span>{groupByFamily ? "Grouped by Product Family" : "Flat View (All Deployments)"}</span>
              </button>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50/80 text-[11px] uppercase font-bold text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Application &amp; Platform Deployment</th>
                    <th className="py-3 px-4">Activity ⓘ</th>
                    <th className="py-3 px-4">Access Policy ⓘ</th>
                    <th className="py-3 px-4">Trust &amp; Compliance ⓘ</th>
                    <th className="py-3 px-4">Risk Level ⓘ</th>
                    <th className="py-3 px-4 text-center">Users ▼</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        No applications matched the filter criteria.
                      </td>
                    </tr>
                  ) : groupByFamily ? (
                    groupedFamilies.map((group) => (
                      <React.Fragment key={group.familyId}>
                        {/* Family Section Header */}
                        <tr className="bg-gradient-to-r from-slate-100/90 to-slate-50 border-t-2 border-slate-300">
                          <td colSpan={7} className="py-2.5 px-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={group.iconUrl}
                                  alt=""
                                  className="w-5 h-5 rounded-md bg-white border border-slate-200 object-contain p-0.5"
                                />
                                <span className="font-extrabold text-slate-900 text-xs tracking-tight">
                                  {group.familyName}
                                </span>
                                <span className="text-[11px] text-slate-500 font-medium">
                                  by {group.vendor}
                                </span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-800 border border-slate-300/60">
                                  {group.items.length} {group.items.length === 1 ? 'Distinct Deployment' : 'Distinct Deployments'}
                                </span>
                                <span className="text-[11px] text-slate-600 font-semibold">
                                  {group.items.reduce((acc, it) => acc + it.totalUsersCount, 0)} total users
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Distinct Deployments in this Family */}
                        {group.items.map((app) => (
                          <tr
                            key={app.id}
                            className="hover:bg-indigo-50/20 transition-colors cursor-pointer bg-white"
                            onClick={() => setSelectedApp(app)}
                          >
                            {/* Application & Variant Column */}
                            <td className="py-3 px-4 pl-7">
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex-shrink-0">
                                  {getDeploymentTypeBadge(app.deploymentType || app.appType)}
                                </div>
                                <div className="truncate max-w-[270px]">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-gray-900 truncate text-xs">{app.displayName}</span>
                                    {app.isVerified && (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold border border-blue-200">
                                        Verified
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono mt-0.5">
                                    <span className="truncate">{app.clientId || app.id}</span>
                                  </div>
                                  {app.servicesTouched && app.servicesTouched.length > 0 && (
                                    <div className="flex items-center gap-1 mt-1.5">
                                      {app.servicesTouched.map((svc) => (
                                        <span 
                                          key={svc} 
                                          title={svc} 
                                          className="inline-flex items-center p-0.5 rounded bg-gray-50 border border-gray-200/80 shadow-2xs hover:bg-gray-100"
                                        >
                                          <GoogleProductIcon service={svc} className="w-3.5 h-3.5" />
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Activity Column */}
                            <td className="py-3 px-4">
                              {app.isStale ? (
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600 border border-gray-200">
                                    ⏳ Stale (&gt;90d)
                                  </span>
                                  <div className="text-[10px] text-gray-400">No active calls</div>
                                </div>
                              ) : (
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                                  </span>
                                  <div className="text-[10px] font-mono text-gray-500">{app.lastActiveFormatted}</div>
                                </div>
                              )}
                            </td>

                            {/* Access Policy Column */}
                            <td className="py-3 px-4">
                              {getPolicyBadge(app.adminAccessLevel)}
                            </td>

                            {/* Trust & Compliance Column */}
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                <div className="text-[11px] font-medium text-gray-700 flex items-center gap-1">
                                  <span>📍</span> {app.dataHosting}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {(app.compliance || []).slice(0, 3).map((comp, idx) => (
                                    <span key={idx} className="bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-mono px-1.5 py-0.2 rounded">
                                      {comp}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </td>

                            {/* Risk Level Column */}
                            <td className="py-3 px-4">{getRiskBadge(app.riskLevel)}</td>

                            {/* Users Column */}
                            <td className="py-3 px-4 text-center">
                              <div className="font-bold text-gray-900 text-sm">{app.totalUsersCount}</div>
                              {app.adminUsersCount > 0 && (
                                <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.2">
                                  ⚠️ {app.adminUsersCount} admin
                                </span>
                              )}
                            </td>

                            {/* Action Column */}
                            <td className="py-3 px-4 text-right">
                              <button className="px-3 py-1 bg-white hover:bg-gray-100 text-xs font-semibold text-gray-700 border border-gray-300 rounded-md transition-colors shadow-sm">
                                Inspect
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))
                  ) : (
                    filteredApps.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                        onClick={() => setSelectedApp(app)}
                      >
                        {/* Application Column */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={app.iconUrl}
                              alt=""
                              className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 object-contain p-0.5 flex-shrink-0"
                            />
                            <div className="truncate max-w-[240px]">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-gray-900 truncate">{app.displayName}</span>
                                {app.isVerified && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold border border-blue-200">
                                    Verified
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                                <span className="bg-gray-100 px-1.5 py-0.2 rounded text-gray-600">{app.category}</span>
                                <span>•</span>
                                <span>{getDeploymentTypeBadge(app.deploymentType || app.appType)}</span>
                              </div>
                              {app.servicesTouched && app.servicesTouched.length > 0 && (
                                <div className="flex items-center gap-1 mt-1.5">
                                  {app.servicesTouched.map((svc) => (
                                    <span 
                                      key={svc} 
                                      title={svc} 
                                      className="inline-flex items-center p-0.5 rounded bg-gray-50 border border-gray-200/80 shadow-2xs hover:bg-gray-100"
                                    >
                                      <GoogleProductIcon service={svc} className="w-3.5 h-3.5" />
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Activity Column */}
                        <td className="py-3 px-4">
                          {app.isStale ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600 border border-gray-200">
                                ⏳ Stale (&gt;90d)
                              </span>
                              <div className="text-[10px] text-gray-400">No active calls</div>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                              </span>
                              <div className="text-[10px] font-mono text-gray-500">{app.lastActiveFormatted}</div>
                            </div>
                          )}
                        </td>

                        {/* Access Policy Column */}
                        <td className="py-3 px-4">
                          {getPolicyBadge(app.adminAccessLevel)}
                        </td>

                        {/* Trust & Compliance Column */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="text-[11px] font-medium text-gray-700 flex items-center gap-1">
                              <span>📍</span> {app.dataHosting}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {(app.compliance || []).slice(0, 3).map((comp, idx) => (
                                <span key={idx} className="bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-mono px-1.5 py-0.2 rounded">
                                  {comp}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>

                        {/* Risk Level Column */}
                        <td className="py-3 px-4">{getRiskBadge(app.riskLevel)}</td>

                        {/* Users Column */}
                        <td className="py-3 px-4 text-center">
                          <div className="font-bold text-gray-900 text-sm">{app.totalUsersCount}</div>
                          {app.adminUsersCount > 0 && (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.2">
                              ⚠️ {app.adminUsersCount} admin
                            </span>
                          )}
                        </td>

                        {/* Action Column */}
                        <td className="py-3 px-4 text-right">
                          <button className="px-3 py-1 bg-white hover:bg-gray-100 text-xs font-semibold text-gray-700 border border-gray-300 rounded-md transition-colors shadow-sm">
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 3: RECOMMENDATIONS                                        */}
      {/* ============================================================== */}
      {activeTab === "recs" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Actionable Security Recommendations</h2>
              <p className="text-xs text-gray-500">Prioritized governance actions to mitigate third-party token and script risk.</p>
            </div>
            <select
              value={recSeverityFilter}
              onChange={(e) => setRecSeverityFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">🔴 Critical Only</option>
              <option value="HIGH">🟠 High Only</option>
              <option value="MEDIUM">🟡 Medium Only</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredRecs.map((rec) => (
              <div
                key={rec.id}
                className={`bg-white border rounded-xl p-5 shadow-sm space-y-3 ${
                  rec.severity === "CRITICAL"
                    ? "border-red-300 bg-red-50/20"
                    : rec.severity === "HIGH"
                    ? "border-amber-300 bg-amber-50/20"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getRiskBadge(rec.severity)}
                      <h3 className="font-bold text-sm text-gray-900">{rec.title}</h3>
                    </div>
                    <p className="text-xs text-gray-600">{rec.details}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500 flex-shrink-0">
                    User: <span className="font-mono font-medium text-gray-800">{rec.affectedAccount}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2 text-xs">
                  <div className="text-gray-700">
                    <span className="font-semibold text-blue-700">Remediation:</span> {rec.remediation}
                  </div>
                  {rec.gamCommand && (
                    <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded font-mono text-[11px] text-gray-800 border border-gray-300 shadow-inner">
                      <span className="truncate">{rec.gamCommand}</span>
                      <button
                        onClick={() => copyToClipboard(rec.gamCommand!, rec.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold ml-3 flex-shrink-0"
                      >
                        {copiedId === rec.id ? "Copied! ✓" : "Copy Command"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scope Threat Matrix Tab View */}
      {activeTab === "scopes" && (
        <ScopeMatrixView scopes={initialScopes} metrics={scopeMetrics} />
      )}

      {/* ============================================================== */}
      {/* APPLICATION DETAIL MODAL / DRAWER                              */}
      {/* ============================================================== */}
      {selectedApp && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-start justify-between bg-gradient-to-r from-gray-50/80 to-white">
              <div className="flex items-start sm:items-center gap-5">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-gray-200 bg-white p-2.5 shadow-sm flex items-center justify-center flex-shrink-0">
                  <img
                    src={selectedApp.iconUrl}
                    alt={selectedApp.displayName}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{selectedApp.displayName}</h2>
                    {selectedApp.isVerified && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                        Verified
                      </span>
                    )}
                    {getRiskBadge(selectedApp.riskLevel)}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500 mt-1.5">
                    <span className="font-semibold text-gray-800">{selectedApp.vendor}</span>
                    <span>•</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">{selectedApp.category}</span>
                    <span>•</span>
                    <span>{selectedApp.appType}</span>
                    {selectedApp.publisherDomain && (
                      <>
                        <span>•</span>
                        <a
                          href={`https://${selectedApp.publisherDomain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline font-mono inline-flex items-center gap-1"
                        >
                          🌐 {selectedApp.publisherDomain}
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors -mr-2 -mt-2"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Trust, Compliance & Breach History */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                  <div className="text-gray-500 font-medium">Data Residency</div>
                  <div className="font-bold text-gray-800 mt-0.5">📍 {selectedApp.dataHosting}</div>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                  <div className="text-gray-500 font-medium">Compliance</div>
                  <div className="font-semibold text-gray-800 mt-0.5">{(selectedApp.compliance || []).join(', ')}</div>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                  <div className="text-gray-500 font-medium">Breach History</div>
                  <div className={`font-semibold mt-0.5 ${selectedApp.breachHistory ? 'text-red-600 font-bold' : 'text-emerald-700'}`}>
                    {selectedApp.breachHistory || '✓ No Public Incidents'}
                  </div>
                </div>
              </div>

              {/* Google Admin Access Control Policy Visualizer */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <GoogleAdminIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Access to Google Data</h4>
                      <p className="text-[11px] text-gray-500">Google Admin Console API Access Control</p>
                    </div>
                  </div>
                  <div>
                    {getPolicyBadge(selectedApp.adminAccessLevel)}
                  </div>
                </div>

                {/* Policy Options Radios / Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                    selectedApp.adminAccessLevel === 'TRUSTED' ? 'border-emerald-400 bg-emerald-50/60 shadow-2xs font-semibold text-emerald-900' : 'border-gray-200 bg-white text-gray-400 opacity-60'
                  }`}>
                    <span className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedApp.adminAccessLevel === 'TRUSTED' ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'}`}>
                      {selectedApp.adminAccessLevel === 'TRUSTED' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </span>
                    <div>
                      <div className="text-xs">Trusted</div>
                      <div className="text-[11px] text-gray-500 font-normal">Can request access to all Google data</div>
                      {selectedApp.accessPolicy?.exemptFromContextAwareAccess && (
                        <div className="text-[10px] text-emerald-700 font-normal mt-0.5">✓ Exempt from Context-Aware Access</div>
                      )}
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                    selectedApp.adminAccessLevel === 'LIMITED' ? 'border-blue-400 bg-blue-50/60 shadow-2xs font-semibold text-blue-900' : 'border-gray-200 bg-white text-gray-400 opacity-60'
                  }`}>
                    <span className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedApp.adminAccessLevel === 'LIMITED' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                      {selectedApp.adminAccessLevel === 'LIMITED' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </span>
                    <div>
                      <div className="text-xs">Limited</div>
                      <div className="text-[11px] text-gray-500 font-normal">Can request unrestricted data only</div>
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                    selectedApp.adminAccessLevel === 'SPECIFIC_DATA' ? 'border-amber-400 bg-amber-50/60 shadow-2xs font-semibold text-amber-900' : 'border-gray-200 bg-white text-gray-400 opacity-60'
                  }`}>
                    <span className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedApp.adminAccessLevel === 'SPECIFIC_DATA' ? 'border-amber-600 bg-amber-600' : 'border-gray-300'}`}>
                      {selectedApp.adminAccessLevel === 'SPECIFIC_DATA' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </span>
                    <div>
                      <div className="text-xs">Specific Google data</div>
                      <div className="text-[11px] text-gray-500 font-normal">Restricted to specified services &amp; scopes</div>
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                    selectedApp.adminAccessLevel === 'BLOCKED' ? 'border-red-400 bg-red-50/60 shadow-2xs font-semibold text-red-900' : 'border-gray-200 bg-white text-gray-400 opacity-60'
                  }`}>
                    <span className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedApp.adminAccessLevel === 'BLOCKED' ? 'border-red-600 bg-red-600' : 'border-gray-300'}`}>
                      {selectedApp.adminAccessLevel === 'BLOCKED' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </span>
                    <div>
                      <div className="text-xs">Blocked</div>
                      <div className="text-[11px] text-gray-500 font-normal">Blocked from accessing any Google data</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-gray-500 pt-1 border-t border-slate-200">
                  <span>Organizational Unit: <span className="font-mono font-medium text-gray-700">{selectedApp.accessPolicy?.orgUnitPath || '/'}</span></span>
                  <span>{selectedApp.accessPolicy?.isOverridden ? 'Direct OU Override' : 'Inherited from Domain Root'}</span>
                </div>
              </div>

              {/* Connected Google Workspace Services */}
              {selectedApp.servicesTouched && selectedApp.servicesTouched.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Google Workspace Services Accessed
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.servicesTouched.map((svc) => (
                      <span
                        key={svc}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 shadow-2xs"
                      >
                        <div className="w-5 h-5 bg-white rounded p-0.5 border border-gray-200/60 flex items-center justify-center">
                          <GoogleProductIcon service={svc} className="w-4 h-4" />
                        </div>
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Evaluation */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Security Evaluation</h3>
                {selectedApp.riskReasons.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedApp.riskReasons.map((r, i) => (
                      <div key={i} className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
                        <span>⚠️</span> {r}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    No elevated security risks detected for this application.
                  </div>
                )}
              </div>

              {/* Sibling Deployments in this Product Family */}
              {selectedApp.siblingDeployments && selectedApp.siblingDeployments.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-50/70 to-slate-50 border border-indigo-200/80 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🏢</span>
                      <div>
                        <h4 className="text-xs font-bold text-indigo-950">
                          Sibling Platform Deployments ({selectedApp.siblingDeployments.length})
                        </h4>
                        <p className="text-[11px] text-indigo-700/80">
                          Other components of {selectedApp.familyName || selectedApp.vendor} active in this tenant
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      Family: {selectedApp.familyName || selectedApp.vendor}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedApp.siblingDeployments.map((sib) => (
                      <div
                        key={sib.id}
                        onClick={() => {
                          const target = currentApps.find(a => a.id === sib.id);
                          if (target) setSelectedApp(target);
                        }}
                        className="bg-white border border-indigo-100 rounded-lg p-2.5 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="truncate">
                            <div className="font-bold text-gray-900 truncate text-xs">{sib.displayName}</div>
                            <div className="text-[10px] font-mono text-gray-400 truncate">{sib.clientId}</div>
                          </div>
                          {getDeploymentTypeBadge(sib.deploymentType)}
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-[11px]">
                          <div>{getPolicyBadge(sib.adminAccessLevel)}</div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-500 font-semibold">{sib.totalUsersCount} users</span>
                            {getRiskBadge(sib.maxRisk)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exact Deployment Client ID */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Deployment Client ID
                  </h3>
                  <span className="text-[11px] text-gray-500 font-medium">Exact OAuth Credential String</span>
                </div>
                <div className="space-y-1.5 font-mono text-xs">
                  {selectedApp.clientIds.map((cid, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex justify-between items-center">
                      <span className="truncate text-gray-700">{cid}</span>
                      <button
                        onClick={() => copyToClipboard(cid, cid)}
                        className="text-blue-600 hover:text-blue-800 font-semibold ml-2 flex-shrink-0"
                      >
                        {copiedId === cid ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scopes */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Requested Scopes ({selectedApp.scopesCount})
                </h3>
                <div className="space-y-2 text-xs">
                  {selectedApp.scopes.map((s, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 flex justify-between items-center gap-3">
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-5 h-5 bg-white rounded p-0.5 border border-gray-200/60 flex items-center justify-center flex-shrink-0">
                          <GoogleProductIcon service={s.service || s.scope} className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate font-mono text-gray-800">{s.scope}</span>
                      </div>
                      <div className="flex-shrink-0">{getRiskBadge(s.riskLevel)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Users */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Authorized Accounts ({selectedApp.users.length})
                </h3>
                <div className="max-h-48 overflow-y-auto divide-y divide-gray-200 bg-gray-50 rounded-lg border border-gray-200">
                  {selectedApp.users.map((u, i) => (
                    <div key={i} className="p-2.5 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-semibold text-gray-900">{u.name || u.email}</div>
                        <div className="text-gray-500 font-mono text-[11px]">{u.email}</div>
                      </div>
                      <div>
                        {u.isAdmin ? (
                          <span className="rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-[10px] font-bold border border-red-200">
                            Super Admin
                          </span>
                        ) : (
                          <span className="text-gray-400">User</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-xs text-gray-500">
              <div>Total Activity Events: <span className="font-bold text-gray-800">{selectedApp.totalActivityEvents}</span></div>
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SETUP & EXPORT GUIDE MODAL                                      */}
      {/* ============================================================== */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-start justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shadow-xs">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    App Access Control Baseline Setup
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                      Required for 100% Accuracy
                    </span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Establishing Ground Truth for Pre-Configured &amp; Sanctioned Third-Party Applications
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSetupModal(false)}
                className="text-gray-400 hover:text-gray-700 p-2 rounded-lg hover:bg-white/80 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              
              {/* Context Alert: The 180-Day Limitation */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3.5 items-start">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold">⚠️</span>
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-amber-900 text-sm">Why is this CSV export necessary?</div>
                  <p className="text-amber-950/80 leading-relaxed text-xs">
                    Google&apos;s Directory API only returns applications with <strong className="text-amber-950 font-bold">currently active user tokens</strong>, and the Reports API automatically purges audit logs after <strong className="text-amber-950 font-bold">180 days</strong>. Furthermore, Google does not expose a public Admin SDK endpoint for the App Access Control table—meaning even automation tools like <strong className="text-amber-950 font-bold">GAM 7</strong> cannot query this data directly.
                  </p>
                  <p className="text-amber-900 leading-relaxed text-xs">
                    Exporting the list from the Google Admin Console provides the permanent domain baseline, allowing Admin Lens to discover dormant sanctioned apps, OU-level trust overrides, and restricted scopes that would otherwise be completely invisible.
                  </p>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-3.5">
                <div className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                  Step-by-Step Export Instructions
                </div>

                {/* Step 1 */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    1
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="font-semibold text-gray-900 flex items-center justify-between">
                      <span>Navigate to App Access Control in Google Admin Console</span>
                      <a
                        href="https://admin.google.com/ac/owl/list?tab=apps"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                      >
                        Open Console ↗
                      </a>
                    </div>
                    <p className="text-gray-500 text-xs">
                      Sign in to <span className="font-mono font-medium text-gray-700">admin.google.com</span> as Super Admin. In the left navigation, go to:
                    </p>
                    <div className="font-mono text-[11px] bg-white px-2.5 py-1 rounded border border-gray-200 text-gray-700 inline-block mt-1">
                      Security &gt; Access and data control &gt; API controls &gt; App access control &gt; Apps tab
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    2
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="font-semibold text-gray-900">Download the Application List as CSV</div>
                    <p className="text-gray-500 text-xs">
                      In the upper right corner of the applications table, click the <strong className="text-gray-800">Download list</strong> icon (📥) and choose <strong className="text-emerald-700">Comma-separated values (.csv)</strong>.
                    </p>
                    <div className="text-[11px] text-gray-400 italic">
                      Google will compile a file containing App Name, Client IDs, Verification Status, Access (Trusted/Limited/Blocked), and Scope lists.
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    3
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="font-semibold text-gray-900">Import into Admin Lens</div>
                    <p className="text-gray-500 text-xs">
                      Save the file as <span className="font-mono font-semibold text-gray-700">owl_apps.csv</span> in your project directory, or upload / drop the CSV directly below to update the live dashboard immediately.
                    </p>
                  </div>
                </div>

              </div>

              {/* Interactive Drag & Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleCsvUpload(f);
                }}
                className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-6 bg-gray-50/50 hover:bg-blue-50/20 text-center transition-all cursor-pointer group"
                onClick={() => {
                  const input = document.getElementById('modal-csv-upload-input');
                  if (input) input.click();
                }}
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="font-bold text-gray-800 text-sm">Drop your exported Google Admin CSV here</div>
                <p className="text-gray-500 text-[11px] mt-1">or click to browse your computer (<span className="font-mono text-gray-600">owl_apps.csv</span>)</p>
                <input
                  type="file"
                  id="modal-csv-upload-input"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleCsvUpload(f);
                  }}
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-xs">
              <div className="text-gray-500">
                Current Baseline: <span className="font-semibold text-emerald-700 font-mono">{currentMetrics.baselineSource || 'owl_apps.csv'} active</span>
              </div>
              <button
                onClick={() => setShowSetupModal(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors"
              >
                Dismiss
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
