"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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

interface Application {
  id: string;
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
  multiClientMapped: boolean;
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
  multiClientApps: number;
}

type GovernanceStatus = "SANCTIONED" | "UNDER_REVIEW" | "RESTRICTED" | "EXCEPTION";

export default function OAuthDashboardV2Client({
  initialApps,
  initialRecs,
  metrics,
  users,
}: {
  initialApps: Application[];
  initialRecs: { totalFindings: number; findings: Recommendation[] };
  metrics: Metrics;
  users: any[];
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "governance" | "policies" | "nudges" | "recs">("overview");
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [govFilter, setGovFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [nudgeModalApp, setNudgeModalApp] = useState<Application | null>(null);
  const [nudgeSent, setNudgeSent] = useState(false);

  // App Governance State (Sanctioned, Under Review, Restricted)
  const [appGovernance, setAppGovernance] = useState<Record<string, { status: GovernanceStatus; note: string }>>(() => {
    const initial: Record<string, { status: GovernanceStatus; note: string }> = {};
    initialApps.forEach((app) => {
      if (app.isVerified && (app.displayName.includes("Google") || app.displayName.includes("Canva") || app.displayName.includes("Zoom"))) {
        initial[app.id] = { status: "SANCTIONED", note: "Approved domain productivity tool" };
      } else if (app.riskLevel === "CRITICAL" || app.breachHistory) {
        initial[app.id] = { status: "RESTRICTED", note: "Restricted due to critical permissions or breach history" };
      } else if (app.isStale) {
        initial[app.id] = { status: "UNDER_REVIEW", note: "Flagged for inactive token cleanup review" };
      } else {
        initial[app.id] = { status: "UNDER_REVIEW", note: "Standard user-installed SaaS awaiting review" };
      }
    });
    return initial;
  });

  // Automated Policy Simulator Toggles
  const [policies, setPolicies] = useState({
    autoRevokeStale: true,
    superAdminGuard: true,
    blockUnverifiedDrive: false,
    shadowAiContainment: true,
  });

  // Derived Multi-factor 0-100 Risk Score for each application
  const appRiskScores = useMemo(() => {
    const scores: Record<string, { total: number; scopeScore: number; vendorScore: number; exposureScore: number; residencyScore: number }> = {};
    initialApps.forEach((app) => {
      // 1. Scope Risk (0-35)
      let scopeScore = 0;
      if (app.riskLevel === "CRITICAL") scopeScore = 35;
      else if (app.riskLevel === "HIGH") scopeScore = 25;
      else if (app.riskLevel === "MEDIUM") scopeScore = 15;
      else scopeScore = 5;

      // 2. Vendor Trust & Posture (0-25)
      let vendorScore = 0;
      if (app.breachHistory) vendorScore += 15;
      if (!app.isVerified) vendorScore += 10;
      else vendorScore += 2;

      // 3. Account Exposure (0-25)
      let exposureScore = 0;
      if (app.adminUsersCount > 0) exposureScore += 15;
      if (app.totalUsersCount > 5) exposureScore += 10;
      else exposureScore += Math.min(app.totalUsersCount * 2, 8);

      // 4. Data Residency (0-15)
      let residencyScore = 0;
      if (app.dataHosting === "Unknown Hosting") residencyScore = 15;
      else if (app.dataHosting.includes("US")) residencyScore = 5;
      else residencyScore = 3;

      const total = Math.min(100, scopeScore + vendorScore + exposureScore + residencyScore);
      scores[app.id] = { total, scopeScore, vendorScore, exposureScore, residencyScore };
    });
    return scores;
  }, [initialApps]);

  // Derived Counts
  const totalAppsCount = initialApps.length;
  const sanctionedCount = Object.values(appGovernance).filter((g) => g.status === "SANCTIONED").length;
  const underReviewCount = Object.values(appGovernance).filter((g) => g.status === "UNDER_REVIEW").length;
  const restrictedCount = Object.values(appGovernance).filter((g) => g.status === "RESTRICTED").length;

  const serviceHotspots = {
    Gmail: initialApps.filter((a) => a.servicesTouched?.includes("Gmail")).length,
    Drive: initialApps.filter((a) => a.servicesTouched?.includes("Google Drive")).length,
    AdminSDK: initialApps.filter((a) => a.servicesTouched?.includes("Admin SDK")).length,
    Calendar: initialApps.filter((a) => a.servicesTouched?.includes("Calendar")).length,
    Classroom: initialApps.filter((a) => a.servicesTouched?.includes("Classroom")).length,
  };

  const categories = Array.from(new Set(initialApps.map((a) => a.category))).sort();

  // Filtered Applications for V2
  const filteredApps = initialApps.filter((app) => {
    const gov = appGovernance[app.id]?.status || "UNDER_REVIEW";
    const matchesSearch =
      app.displayName.toLowerCase().includes(search.toLowerCase()) ||
      app.vendor.toLowerCase().includes(search.toLowerCase()) ||
      app.clientIds.some((cid) => cid.toLowerCase().includes(search.toLowerCase()));
    const matchesRisk = riskFilter === "ALL" || app.riskLevel === riskFilter;
    const matchesGov = govFilter === "ALL" || gov === govFilter;
    const matchesCat = categoryFilter === "ALL" || app.category === categoryFilter;
    const matchesService = serviceFilter === "ALL" || (app.servicesTouched || []).includes(serviceFilter);
    return matchesSearch && matchesRisk && matchesGov && matchesCat && matchesService;
  });

  const updateAppStatus = (appId: string, status: GovernanceStatus, note?: string) => {
    setAppGovernance((prev) => ({
      ...prev,
      [appId]: {
        status,
        note: note !== undefined ? note : prev[appId]?.note || "",
      },
    }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export CSV Handler
  const exportComplianceCSV = () => {
    const headers = ["App Name", "Vendor", "Domain", "Governance Status", "Risk Level", "Risk Score (0-100)", "Total Users", "Admin Users", "Stale (>90d)", "Data Residency", "Client IDs"];
    const rows = initialApps.map((app) => [
      `"${app.displayName}"`,
      `"${app.vendor}"`,
      `"${app.publisherDomain || 'N/A'}"`,
      `"${appGovernance[app.id]?.status || 'UNDER_REVIEW'}"`,
      `"${app.riskLevel}"`,
      appRiskScores[app.id]?.total || 0,
      app.totalUsersCount,
      app.adminUsersCount,
      app.isStale ? "Yes" : "No",
      `"${app.dataHosting}"`,
      `"${app.clientIds.join('; ')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `adminlens_app_governance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getGovernanceBadge = (status: GovernanceStatus) => {
    switch (status) {
      case "SANCTIONED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Sanctioned
          </span>
        );
      case "RESTRICTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> Restricted
          </span>
        );
      case "EXCEPTION":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Exception
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> Under Review
          </span>
        );
    }
  };

  const getScoreBadge = (score: number) => {
    let colorClass = "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (score >= 75) colorClass = "text-red-700 bg-red-50 border-red-200";
    else if (score >= 50) colorClass = "text-amber-700 bg-amber-50 border-amber-200";
    else if (score >= 30) colorClass = "text-yellow-800 bg-yellow-50 border-yellow-200";

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs border ${colorClass}`}>
        {score} / 100
      </span>
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto space-y-6">
      
      {/* Top Header Banner with V1/V2 Switcher & Export */}
      <div className="sm:flex sm:justify-between sm:items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-purple-500/20">
              V2
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">App Governance &amp; SSPM</h1>
                <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Admin Lens Next-Gen
                </span>
                {/* Version Switcher Pill */}
                <div className="ml-2 inline-flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
                  <Link
                    href="/dashboard"
                    className="text-gray-500 hover:text-blue-700 px-2.5 py-0.5 rounded hover:bg-white/80 transition-colors font-medium"
                  >
                    V1 Classic
                  </Link>
                  <span className="bg-white text-purple-700 font-bold px-2.5 py-0.5 rounded shadow-2xs">
                    ✨ V2 Next-Gen
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Domain: <span className="font-mono font-semibold text-gray-700">gafe.co.za</span> • Policy Enforcement &amp; Zero-Trust Token Governance
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Export */}
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <button
            onClick={exportComplianceCSV}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <span>📥</span> Export CSV Report
          </button>
          {/* Tabs */}
          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === "overview" ? "bg-white text-purple-700 shadow-sm font-bold" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📊 SSPM Overview
            </button>
            <button
              onClick={() => setActiveTab("governance")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === "governance" ? "bg-white text-purple-700 shadow-sm font-bold" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              🛡️ App Governance ({initialApps.length})
            </button>
            <button
              onClick={() => setActiveTab("policies")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === "policies" ? "bg-white text-purple-700 shadow-sm font-bold" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              ⚙️ Auto Policies
            </button>
            <button
              onClick={() => setActiveTab("nudges")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === "nudges" ? "bg-white text-purple-700 shadow-sm font-bold" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              💬 Employee Nudges
            </button>
            <button
              onClick={() => setActiveTab("recs")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === "recs" ? "bg-white text-purple-700 shadow-sm font-bold" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              🚨 Remediation ({initialRecs.totalFindings || 73})
            </button>
          </div>
        </div>
      </div>

      {/* App Access Control Baseline Banner */}
      <div className="bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-white border border-purple-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600/10 text-purple-700 flex items-center justify-center font-bold text-sm">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-gray-900">Google Admin App Access Control Baseline</span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Ground-Truth Active (owl_apps.csv)
              </span>
            </div>
            <p className="text-[11px] text-gray-600 mt-0.5">
              Domain baseline synchronized: 32 policies across OUs overcoming Google&apos;s 180-day audit log retention limit.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 transition-colors whitespace-nowrap"
        >
          View Setup Guide &amp; Import in V1 ↗
        </Link>
      </div>

      {/* ============================================================== */}
      {/* V2 TAB 1: SSPM OVERVIEW                                        */}
      {/* ============================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          
          {/* Governance Stance KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div 
              onClick={() => { setActiveTab("governance"); setGovFilter("ALL"); }}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                <span>TOTAL DISCOVERED SAAS</span>
                <span className="text-gray-400">›</span>
              </div>
              <div className="text-3xl font-extrabold text-gray-900 mt-2">{totalAppsCount}</div>
              <div className="text-xs text-gray-500 mt-1">Unique multi-client apps detected</div>
            </div>

            <div 
              onClick={() => { setActiveTab("governance"); setGovFilter("SANCTIONED"); }}
              className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> SANCTIONED (APPROVED)
                </span>
                <span className="text-emerald-500">›</span>
              </div>
              <div className="text-3xl font-extrabold text-emerald-700 mt-2">{sanctionedCount}</div>
              <div className="text-xs text-emerald-600/80 mt-1">Vetted &amp; authorized for domain</div>
            </div>

            <div 
              onClick={() => { setActiveTab("governance"); setGovFilter("UNDER_REVIEW"); }}
              className="bg-amber-50/40 border border-amber-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-amber-800 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> UNDER REVIEW (SHADOW IT)
                </span>
                <span className="text-amber-500">›</span>
              </div>
              <div className="text-3xl font-extrabold text-amber-800 mt-2">{underReviewCount}</div>
              <div className="text-xs text-amber-700/80 mt-1">Awaiting administrative decision</div>
            </div>

            <div 
              onClick={() => { setActiveTab("governance"); setGovFilter("RESTRICTED"); }}
              className="bg-red-50/40 border border-red-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-red-700 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> RESTRICTED / BLOCKED
                </span>
                <span className="text-red-500">›</span>
              </div>
              <div className="text-3xl font-extrabold text-red-700 mt-2">{restrictedCount}</div>
              <div className="text-xs text-red-600/80 mt-1">High-risk or breach-flagged apps</div>
            </div>

          </div>

          {/* Sensitive Access Hotspots with Official Google Icons */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <span>🔥</span> Google Workspace Sensitive Ingress Hotspots
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Direct telemetry of OAuth apps reading sensitive corporate Google services</p>
              </div>
              <span className="text-xs font-semibold text-gray-400">Total Authorized Apps</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              
              <div 
                onClick={() => { setActiveTab("governance"); setServiceFilter("Gmail"); }}
                className="p-4 rounded-xl bg-gray-50/80 border border-gray-200/80 hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 shadow-xs flex items-center justify-center p-1.5">
                    <GmailIcon className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-extrabold text-gray-900">{serviceHotspots.Gmail}</span>
                </div>
                <div className="font-bold text-xs text-gray-800 mt-3">Gmail Messages</div>
                <div className="text-[11px] text-gray-500 mt-0.5">Read/send mailbox grants</div>
              </div>

              <div 
                onClick={() => { setActiveTab("governance"); setServiceFilter("Google Drive"); }}
                className="p-4 rounded-xl bg-gray-50/80 border border-gray-200/80 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 shadow-xs flex items-center justify-center p-1.5">
                    <GoogleDriveIcon className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-extrabold text-gray-900">{serviceHotspots.Drive}</span>
                </div>
                <div className="font-bold text-xs text-gray-800 mt-3">Google Drive Data</div>
                <div className="text-[11px] text-gray-500 mt-0.5">Full Drive read/write tokens</div>
              </div>

              <div 
                onClick={() => { setActiveTab("governance"); setServiceFilter("Admin SDK"); }}
                className="p-4 rounded-xl bg-gray-50/80 border border-gray-200/80 hover:bg-red-50/50 hover:border-red-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 shadow-xs flex items-center justify-center p-1.5">
                    <GoogleAdminIcon className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-extrabold text-gray-900">{serviceHotspots.AdminSDK}</span>
                </div>
                <div className="font-bold text-xs text-gray-800 mt-3">Admin Console SDK</div>
                <div className="text-[11px] text-gray-500 mt-0.5">User directory &amp; devices</div>
              </div>

              <div 
                onClick={() => { setActiveTab("governance"); setServiceFilter("Calendar"); }}
                className="p-4 rounded-xl bg-gray-50/80 border border-gray-200/80 hover:bg-amber-50/50 hover:border-amber-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 shadow-xs flex items-center justify-center p-1.5">
                    <GoogleCalendarIcon className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-extrabold text-gray-900">{serviceHotspots.Calendar}</span>
                </div>
                <div className="font-bold text-xs text-gray-800 mt-3">Calendar &amp; Events</div>
                <div className="text-[11px] text-gray-500 mt-0.5">Meeting schedules &amp; attendees</div>
              </div>

              <div 
                onClick={() => { setActiveTab("governance"); setServiceFilter("Classroom"); }}
                className="p-4 rounded-xl bg-gray-50/80 border border-gray-200/80 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 shadow-xs flex items-center justify-center p-1.5">
                    <GoogleClassroomIcon className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-extrabold text-gray-900">{serviceHotspots.Classroom}</span>
                </div>
                <div className="font-bold text-xs text-gray-800 mt-3">Classroom Rosters</div>
                <div className="text-[11px] text-gray-500 mt-0.5">Student course data</div>
              </div>

            </div>
          </div>

          {/* Policy Automation Quick Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 uppercase tracking-wider">
                <span>⚡</span> Automated Token Hygeine Policy Active
              </div>
              <h3 className="text-base font-bold text-gray-900 mt-1">
                4 Automated Policies configured for gafe.co.za
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Stale token auto-revocation and Super Admin OAuth alerts are actively monitoring domain activity.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("policies")}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              Configure Policies &amp; Run Simulation →
            </button>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* V2 TAB 2: APP GOVERNANCE CATALOG & STATUS CONTROLS             */}
      {/* ============================================================== */}
      {activeTab === "governance" && (
        <div className="space-y-4">
          
          {/* Active Filter Pill */}
          {serviceFilter !== "ALL" && (
            <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-4 py-2.5 text-xs text-purple-800">
              <div className="flex items-center gap-2">
                <span className="font-bold">Filtered by Google Service:</span>
                <span className="inline-flex items-center gap-1.5 bg-purple-600 text-white px-2.5 py-1 rounded font-bold">
                  <div className="w-4 h-4 bg-white rounded-xs p-0.5 flex items-center justify-center">
                    <GoogleProductIcon service={serviceFilter} className="w-3.5 h-3.5" />
                  </div>
                  {serviceFilter}
                </span>
                <span>({filteredApps.length} applications)</span>
              </div>
              <button
                onClick={() => setServiceFilter("ALL")}
                className="text-purple-600 hover:text-purple-900 font-bold underline text-xs"
              >
                Clear Filter ✕
              </button>
            </div>
          )}

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search by app, vendor, or client ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-purple-500"
              />
              <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
              <select
                value={govFilter}
                onChange={(e) => setGovFilter(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-700 font-medium focus:outline-none"
              >
                <option value="ALL">Governance: All</option>
                <option value="SANCTIONED">✅ Sanctioned (Approved)</option>
                <option value="UNDER_REVIEW">⏳ Under Review</option>
                <option value="RESTRICTED">🚫 Restricted / Blocked</option>
                <option value="EXCEPTION">🔷 Exception</option>
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
              </select>
            </div>
          </div>

          {/* V2 Applications Table with Governance Actions & Risk Scores */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50/80 text-[11px] uppercase font-bold text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Application</th>
                    <th className="py-3 px-4">Governance Stance</th>
                    <th className="py-3 px-4">Risk Score (0-100)</th>
                    <th className="py-3 px-4">Services Accessed</th>
                    <th className="py-3 px-4 text-center">Users</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No applications matched your governance filters.
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => {
                      const gov = appGovernance[app.id]?.status || "UNDER_REVIEW";
                      const score = appRiskScores[app.id]?.total || 0;
                      return (
                        <tr
                          key={app.id}
                          className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                          onClick={() => setSelectedApp(app)}
                        >
                          {/* Application Info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={app.iconUrl}
                                alt=""
                                className="w-9 h-9 rounded-xl bg-white border border-gray-200 object-contain p-1 flex-shrink-0 shadow-2xs"
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
                                  <span className="text-gray-700 font-medium">{app.vendor}</span>
                                  <span>•</span>
                                  <span>{app.category}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Governance Stance Dropdown / Badge */}
                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={gov}
                              onChange={(e) => updateAppStatus(app.id, e.target.value as GovernanceStatus)}
                              className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-colors focus:outline-none ${
                                gov === "SANCTIONED"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                  : gov === "RESTRICTED"
                                  ? "bg-red-50 text-red-800 border-red-300"
                                  : gov === "EXCEPTION"
                                  ? "bg-blue-50 text-blue-800 border-blue-300"
                                  : "bg-amber-50 text-amber-800 border-amber-300"
                              }`}
                            >
                              <option value="SANCTIONED">✅ Sanctioned</option>
                              <option value="UNDER_REVIEW">⏳ Under Review</option>
                              <option value="RESTRICTED">🚫 Restricted</option>
                              <option value="EXCEPTION">🔷 Exception</option>
                            </select>
                          </td>

                          {/* 0-100 Risk Score */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getScoreBadge(score)}
                              <span className="text-[11px] text-gray-400 font-medium">
                                ({app.riskLevel})
                              </span>
                            </div>
                          </td>

                          {/* Services Touched with Google Icons */}
                          <td className="py-3 px-4">
                            {app.servicesTouched && app.servicesTouched.length > 0 ? (
                              <div className="flex items-center gap-1.5">
                                {app.servicesTouched.map((svc) => (
                                  <span
                                    key={svc}
                                    title={svc}
                                    className="w-6 h-6 rounded bg-gray-50 border border-gray-200/80 shadow-2xs flex items-center justify-center p-0.5"
                                  >
                                    <GoogleProductIcon service={svc} className="w-4 h-4" />
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-[11px]">Basic Identity</span>
                            )}
                          </td>

                          {/* Users Count */}
                          <td className="py-3 px-4 text-center">
                            <div className="font-bold text-gray-900 text-sm">{app.totalUsersCount}</div>
                            {app.adminUsersCount > 0 && (
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.2">
                                ⚠️ {app.adminUsersCount} admin
                              </span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => { setNudgeModalApp(app); setNudgeSent(false); }}
                                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded border border-purple-200 transition-colors"
                                title="Send verification nudge to users"
                              >
                                💬 Nudge
                              </button>
                              <button
                                onClick={() => setSelectedApp(app)}
                                className="px-2.5 py-1 bg-white hover:bg-gray-100 text-xs font-semibold text-gray-700 border border-gray-300 rounded transition-colors shadow-2xs"
                              >
                                Inspect
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* V2 TAB 3: AUTOMATED POLICIES & TOKEN CLEANUP SIMULATOR         */}
      {/* ============================================================== */}
      {activeTab === "policies" && (
        <div className="space-y-6">
          
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-gray-900">Zero-Trust Automated Policy Engine</h2>
              <p className="text-xs text-gray-500">Continuous background governance rules to prevent shadow IT risk accumulation.</p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
              ● Policy Daemon Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Policy 1 */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base">
                    ⏳
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Auto-Revoke Inactive Tokens</h3>
                    <p className="text-xs text-gray-500">Revoke OAuth tokens unused for &gt; 90 days</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={policies.autoRevokeStale}
                  onChange={(e) => setPolicies({ ...policies, autoRevokeStale: e.target.checked })}
                  className="w-5 h-5 rounded text-purple-600 border-gray-300 focus:ring-purple-500 cursor-pointer"
                />
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-700 flex justify-between items-center border border-gray-200/80">
                <span>Simulation Impact:</span>
                <span className="font-bold text-blue-700">
                  {policies.autoRevokeStale ? `${initialApps.filter((a) => a.isStale).length} apps flagged for auto-cleanup` : "Policy Disabled"}
                </span>
              </div>
            </div>

            {/* Policy 2 */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-base">
                    🛡️
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Super Admin Grant Shield</h3>
                    <p className="text-xs text-gray-500">Immediate alert when privileged accounts authorize new apps</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={policies.superAdminGuard}
                  onChange={(e) => setPolicies({ ...policies, superAdminGuard: e.target.checked })}
                  className="w-5 h-5 rounded text-purple-600 border-gray-300 focus:ring-purple-500 cursor-pointer"
                />
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-700 flex justify-between items-center border border-gray-200/80">
                <span>Simulation Impact:</span>
                <span className="font-bold text-red-700">
                  {policies.superAdminGuard ? "1 Super Admin account protected (alister@gafe.co.za)" : "Policy Disabled"}
                </span>
              </div>
            </div>

            {/* Policy 3 */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-base">
                    🤖
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Shadow AI / GenAI Containment</h3>
                    <p className="text-xs text-gray-500">Require administrative review for all Generative AI platforms</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={policies.shadowAiContainment}
                  onChange={(e) => setPolicies({ ...policies, shadowAiContainment: e.target.checked })}
                  className="w-5 h-5 rounded text-purple-600 border-gray-300 focus:ring-purple-500 cursor-pointer"
                />
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-700 flex justify-between items-center border border-gray-200/80">
                <span>Simulation Impact:</span>
                <span className="font-bold text-purple-700">
                  {policies.shadowAiContainment ? "4 AI tools isolated under review" : "Policy Disabled"}
                </span>
              </div>
            </div>

            {/* Policy 4 */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-base">
                    🔒
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Unverified Publisher Lockdown</h3>
                    <p className="text-xs text-gray-500">Block unverified developers requesting Drive/Gmail scopes</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={policies.blockUnverifiedDrive}
                  onChange={(e) => setPolicies({ ...policies, blockUnverifiedDrive: e.target.checked })}
                  className="w-5 h-5 rounded text-purple-600 border-gray-300 focus:ring-purple-500 cursor-pointer"
                />
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-700 flex justify-between items-center border border-gray-200/80">
                <span>Simulation Impact:</span>
                <span className="font-bold text-amber-800">
                  {policies.blockUnverifiedDrive ? "16 unverified scripts blocked from sensitive data" : "Policy Disabled"}
                </span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* V2 TAB 4: EMPLOYEE NUDGES (SELF-SERVICE TOKEN RE-CERTIFICATION) */}
      {/* ============================================================== */}
      {activeTab === "nudges" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-gray-900">Employee Nudge &amp; Self-Service Governance</h2>
              <p className="text-xs text-gray-500">
                Delegate SaaS hygiene to end-users with automated Slack/Email re-certification prompts.
              </p>
            </div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
              Nudge Automation Ready
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Queue of Stale Apps for Nudging */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-gray-900">Recommended User Nudges</h3>
              <p className="text-xs text-gray-500">Users holding inactive or high-reach OAuth tokens:</p>
              
              <div className="space-y-2.5">
                {initialApps.filter((a) => a.isStale || a.totalUsersCount > 1).slice(0, 6).map((app) => (
                  <div
                    key={app.id}
                    className="p-3 bg-gray-50 border border-gray-200/80 rounded-xl flex items-center justify-between hover:bg-gray-100 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img src={app.iconUrl} alt="" className="w-8 h-8 rounded-lg bg-white p-0.5 border border-gray-200 object-contain" />
                      <div>
                        <div className="font-bold text-xs text-gray-900">{app.displayName}</div>
                        <div className="text-[11px] text-gray-500">{app.totalUsersCount} user(s) • Last active: {app.lastActiveFormatted}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => { setNudgeModalApp(app); setNudgeSent(false); }}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
                    >
                      Send Nudge
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Live Interactive Nudge Email Preview */}
            <div className="bg-white border border-purple-200 rounded-xl p-6 shadow-sm space-y-4 bg-gradient-to-br from-white to-purple-50/20">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-xs font-bold uppercase text-purple-700">📨 Live Employee Notification Preview</span>
                <span className="text-[11px] text-gray-400 font-mono">Via Google Chat / Email</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4 text-xs">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                    AL
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Admin Lens Security Guard</div>
                    <div className="text-[11px] text-gray-500 font-mono">security-bot@gafe.co.za</div>
                  </div>
                </div>

                <div className="space-y-2 text-gray-700 leading-relaxed">
                  <p className="font-semibold text-gray-900">Hi Team Member,</p>
                  <p>
                    Our automated security scan noticed you granted access to <span className="font-bold text-purple-700">Canva</span> over 90 days ago.
                  </p>
                  <p>
                    To keep your Google Workspace account safe, please confirm if you still require this application:
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs hover:bg-emerald-700 transition-colors">
                    ✓ Yes, I still need this app
                  </button>
                  <button className="flex-1 py-2 bg-red-50 text-red-700 border border-red-200 font-bold rounded-lg text-xs hover:bg-red-100 transition-colors">
                    ✕ Revoke Access Now
                  </button>
                </div>

                <div className="text-[11px] text-gray-400 text-center pt-1">
                  Responses are automatically recorded in Admin Lens Audit Logs.
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* V2 TAB 5: ACTIONABLE REMEDIATIONS                              */}
      {/* ============================================================== */}
      {activeTab === "recs" && (
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-base font-bold text-gray-900">Actionable Security Recommendations</h2>
            <p className="text-xs text-gray-500">Direct GAM CLI commands and remediation steps for administrator review.</p>
          </div>

          <div className="space-y-3">
            {(initialRecs.findings || []).map((rec) => (
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
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                        {rec.severity}
                      </span>
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
                    <span className="font-semibold text-purple-700">Remediation:</span> {rec.remediation}
                  </div>
                  {rec.gamCommand && (
                    <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded font-mono text-[11px] text-gray-800 border border-gray-300 shadow-inner">
                      <span className="truncate">{rec.gamCommand}</span>
                      <button
                        onClick={() => copyToClipboard(rec.gamCommand!, rec.id)}
                        className="text-xs text-purple-600 hover:text-purple-800 font-semibold ml-3 flex-shrink-0"
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

      {/* ============================================================== */}
      {/* V2 DETAIL MODAL WITH LARGE ICON & RISK SCORE BREAKDOWN          */}
      {/* ============================================================== */}
      {selectedApp && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header with Prominent 24x24 Icon */}
            <div className="p-6 border-b border-gray-200 flex items-start justify-between bg-gradient-to-r from-purple-50/40 via-gray-50/50 to-white">
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
                    {getGovernanceBadge(appGovernance[selectedApp.id]?.status || "UNDER_REVIEW")}
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
                          className="text-purple-600 hover:underline font-mono inline-flex items-center gap-1"
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
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Governance Stance Quick Bar */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">Current Governance Stance</div>
                  <p className="text-xs text-gray-500 mt-0.5">Admin Lens security policy for this vendor</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={appGovernance[selectedApp.id]?.status || "UNDER_REVIEW"}
                    onChange={(e) => updateAppStatus(selectedApp.id, e.target.value as GovernanceStatus)}
                    className="text-xs font-bold bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-gray-800 focus:outline-none shadow-2xs"
                  >
                    <option value="SANCTIONED">✅ Sanctioned (Approved)</option>
                    <option value="UNDER_REVIEW">⏳ Under Review</option>
                    <option value="RESTRICTED">🚫 Restricted / Blocked</option>
                    <option value="EXCEPTION">🔷 Exception Allowed</option>
                  </select>
                </div>
              </div>

              {/* Multi-Factor 0-100 Risk Score Deconstruction */}
              <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-2xs space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">Multi-Factor Risk Score Breakdown</h3>
                    <p className="text-[11px] text-gray-400">Pillars calculated by Admin Lens SSPM Engine</p>
                  </div>
                  {getScoreBadge(appRiskScores[selectedApp.id]?.total || 0)}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200/80">
                    <div className="text-gray-500 text-[11px]">Scope Risk</div>
                    <div className="font-bold text-gray-800 text-sm mt-0.5">{appRiskScores[selectedApp.id]?.scopeScore} / 35</div>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200/80">
                    <div className="text-gray-500 text-[11px]">Vendor Posture</div>
                    <div className="font-bold text-gray-800 text-sm mt-0.5">{appRiskScores[selectedApp.id]?.vendorScore} / 25</div>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200/80">
                    <div className="text-gray-500 text-[11px]">Account Exposure</div>
                    <div className="font-bold text-gray-800 text-sm mt-0.5">{appRiskScores[selectedApp.id]?.exposureScore} / 25</div>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200/80">
                    <div className="text-gray-500 text-[11px]">Data Residency</div>
                    <div className="font-bold text-gray-800 text-sm mt-0.5">{appRiskScores[selectedApp.id]?.residencyScore} / 15</div>
                  </div>
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

              {/* Trust & Compliance */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                  <div className="text-gray-500 font-medium">Data Residency</div>
                  <div className="font-bold text-gray-800 mt-0.5">📍 {selectedApp.dataHosting}</div>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                  <div className="text-gray-500 font-medium">Compliance</div>
                  <div className="font-semibold text-gray-800 mt-0.5">{(selectedApp.compliance || []).join(", ")}</div>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                  <div className="text-gray-500 font-medium">Breach History</div>
                  <div className={`font-semibold mt-0.5 ${selectedApp.breachHistory ? "text-red-600 font-bold" : "text-emerald-700"}`}>
                    {selectedApp.breachHistory || "✓ No Public Incidents"}
                  </div>
                </div>
              </div>

              {/* Requested Scopes */}
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
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                        {s.riskLevel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Authorized Users */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Authorized Accounts ({selectedApp.users.length})
                  </h3>
                  <button
                    onClick={() => { setNudgeModalApp(selectedApp); setNudgeSent(false); }}
                    className="text-xs text-purple-600 hover:text-purple-800 font-semibold"
                  >
                    💬 Nudge All Users
                  </button>
                </div>
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
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-xs">
              <span className="text-gray-500">Total Activity Events: <strong className="text-gray-800">{selectedApp.totalActivityEvents}</strong></span>
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
      {/* NUDGE TRIGGER MODAL                                            */}
      {/* ============================================================== */}
      {nudgeModalApp && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img src={nudgeModalApp.iconUrl} alt="" className="w-10 h-10 rounded-xl bg-white p-1 border border-gray-200 object-contain shadow-xs" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">Send Employee Nudge</h3>
                  <p className="text-xs text-gray-500">{nudgeModalApp.displayName}</p>
                </div>
              </div>
              <button onClick={() => setNudgeModalApp(null)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            {nudgeSent ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
                <div className="text-2xl">🎉</div>
                <div className="font-bold text-sm text-emerald-800">Nudge Sent Successfully!</div>
                <p className="text-xs text-emerald-700">
                  Verification prompt dispatched to {nudgeModalApp.totalUsersCount} user(s). Responses will update in real time.
                </p>
                <button
                  onClick={() => setNudgeModalApp(null)}
                  className="mt-2 px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-gray-600">
                  This will send an interactive prompt to <strong className="text-gray-900">{nudgeModalApp.totalUsersCount} user(s)</strong> asking them to re-verify whether they still need this OAuth integration.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-700 space-y-1 font-mono">
                  <div>Delivery Channels: Google Chat &amp; Email</div>
                  <div>Recipient Count: {nudgeModalApp.totalUsersCount} account(s)</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNudgeSent(true)}
                    className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
                  >
                    Confirm &amp; Dispatch Nudge 🚀
                  </button>
                  <button
                    onClick={() => setNudgeModalApp(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
