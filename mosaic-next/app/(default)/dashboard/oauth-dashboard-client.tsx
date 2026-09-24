"use client";

import Link from "next/link";
import React, { useMemo,useState } from "react";

import {
  GmailIcon,
  GoogleAdminIcon,
  GoogleAppsScriptIcon,
  GoogleCalendarIcon,
  GoogleClassroomIcon,
  GoogleContactsIcon,
  GoogleDriveIcon,
  GoogleProductIcon,
} from "@/components/google-icons";
import ScopeMatrixView, { ScopeMetrics,ScopeReferenceItem } from "@/components/scope-matrix-view";

interface ScopeItem {
  scope: string;
  riskLevel: string;
  description: string;
  threatImpact?: string;
  adminScore?: number;
  adminColor?: string;
  googleTier?: string;
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
  adminConsoleUrl?: string;
  description?: string;
  riskScore?: number;
  peakScopeScore?: number;
  breadthScore?: number;
  avgScopeScore?: number;
  riskScoreColor?: string;
  rawMaxRisk?: string;
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
  adminConsolePath?: string;
  familyId?: string;
  familyName?: string;
  actionChannel?: string;
}

interface PlaybookTarget {
  familyId: string;
  familyName: string;
  vendor: string;
  iconUrl?: string | null;
  highestSeverity: string;
  findingsCount: number;
  affectedAccounts: string[];
  clientIds: string[];
  gamCommands?: string[];
  items: Recommendation[];
}

interface AdminGroup {
  adminEmail: string;
  tokenCount: number;
  gamCommands: string[];
  batchGamScript: string;
  items: Recommendation[];
}

interface Playbook {
  id: string;
  rule: string;
  title: string;
  subtitle: string;
  severity: string;
  actionChannel: string;
  actionType: string;
  adminConsolePath?: string;
  remediationSummary: string;
  batchGamScript?: string;
  metrics: {
    totalFindings: number;
    distinctAdmins?: number;
    distinctFamilies: number;
  };
  adminBreakdown?: AdminGroup[];
  familyTargets: PlaybookTarget[];
}

interface ByFamilyItem {
  familyId: string;
  familyName: string;
  vendor: string;
  iconUrl?: string | null;
  highestSeverity: string;
  rulesTriggered: string[];
  actionChannels: string[];
  findingsCount: number;
  clientIds: string[];
  affectedAccounts: string[];
  gamCommands?: string[];
  findings: Recommendation[];
}

interface InitialRecsData {
  summary?: {
    totalFindings: number;
    totalPlaybooks: number;
    totalFamiliesAffected: number;
    totalAdminsAffected: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    actionChannels: { GAM_CLI: number; GOOGLE_ADMIN_CONSOLE: number };
  };
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  playbooks?: Playbook[];
  byFamily?: ByFamilyItem[];
  byAdmin?: AdminGroup[];
  findings: Recommendation[];
}

interface Metrics {
  totalApplications: number;
  totalDomainUsers: number;
  totalActiveGrants: number;
  criticalRiskApps: number;
  highRiskApps: number;
  configuredAppsCount?: number;
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
  initialRecs: InitialRecsData;
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
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [riskyScopesOnly, setRiskyScopesOnly] = useState(false);
  const [multiOnly, setMultiOnly] = useState(false);
  const [recSeverityFilter, setRecSeverityFilter] = useState("ALL");
  const [recViewMode, setRecViewMode] = useState<"playbooks" | "families" | "admins" | "all">("playbooks");
  const [recChannelFilter, setRecChannelFilter] = useState("ALL");
  const [recSearch, setRecSearch] = useState("");
  const [expandedPlaybooks, setExpandedPlaybooks] = useState<Record<string, boolean>>({
    "PLAYBOOK-SUPER-ADMIN-EXPOSURE": true,
    "PLAYBOOK-UNVERIFIED-UNCONFIGURED": true,
    "PLAYBOOK-OVERPRIVILEGED-DRIVE": true,
    "PLAYBOOK-UNCONFIGURED-SHADOW-IT": false,
    "PLAYBOOK-TRUSTED-LEAST-PRIVILEGE": false,
    "PLAYBOOK-UNVERIFIED-PUBLISHER": false,
  });
  const [expandedFamilies, setExpandedFamilies] = useState<Record<string, boolean>>({});
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [uploadToast, setUploadToast] = useState<string | null>(null);
  const [groupByFamily, setGroupByFamily] = useState(true);
  const [showBaselineBanner, setShowBaselineBanner] = useState(false);
  const [showRiskCalc, setShowRiskCalc] = useState(false);

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
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
            <GoogleAppsScriptIcon className="w-3.5 h-3.5 flex-shrink-0" /> Apps Script
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

  // Google Workspace Admin Console Deep-Linking Resolver
  const getAdminConsoleLink = (app: Application) => {
    // 1. Direct deep link if available on the app record
    if (app.adminConsoleUrl) {
      return {
        url: app.adminConsoleUrl,
        label: "Open in Google Admin (Direct)",
        tabName: "Direct Application Settings",
        isDirect: true,
        isConfigured: true,
      };
    }
    // 2. Canva direct link provided by administrator
    if (
      app.familyId === "canva" ||
      app.id?.includes("779010036194") ||
      app.displayName?.toLowerCase().includes("canva")
    ) {
      return {
        url: "https://admin.google.com/ac/owl/list/hVrYyRghrieM9HomrljskXNClraS54Jv5m7GJc1xdn7zBsUIDYT6HKFkNAAvzZm-pcOMsVDHItchukWBaoKt1GmjmG1XBia22rOL8wmcr3o",
        label: "Open in Google Admin (Canva Direct)",
        tabName: "Canva App Settings",
        isDirect: true,
        isConfigured: true,
      };
    }
    // 3. Configured apps vs Unconfigured apps
    const isConfigured = Boolean(app.adminAccessLevel && app.adminAccessLevel !== "UNCONFIGURED");
    if (isConfigured) {
      return {
        url: "https://admin.google.com/ac/owl/list?tab=configuredApps",
        label: "Open in Google Admin (Configured Apps)",
        tabName: "Configured Apps",
        isDirect: false,
        isConfigured: true,
      };
    }
    // 4. Unconfigured apps -> Accessed apps
    return {
      url: "https://admin.google.com/ac/owl/list?tab=apps",
      label: "Open in Google Admin (Accessed Apps)",
      tabName: "Accessed Apps",
      isDirect: false,
      isConfigured: false,
    };
  };

  // Derived Calculations
  const totalAppsCount = currentApps.length;
  const highRiskAppsCount = currentApps.filter(a => (a.riskScore !== undefined ? a.riskScore >= 4.0 : a.riskLevel === 'CRITICAL')).length;
  const staleAppsCount = currentApps.filter(a => a.isStale).length;
  const newAppsCount = currentApps.filter(a => a.isNew).length;
  const configuredAppsCount = currentMetrics.configuredAppsCount ?? currentApps.filter(a => a.adminAccessLevel && a.adminAccessLevel !== 'UNCONFIGURED').length;
  const trustedAppsCount = currentMetrics.trustedAppsCount || currentApps.filter(a => a.adminAccessLevel === 'TRUSTED').length;

  // Sensitive Services Hotspots
  const serviceHotspots = {
    Gmail: currentApps.filter(a => (a.servicesTouched || []).includes('Gmail')).length,
    Drive: currentApps.filter(a => (a.servicesTouched || []).includes('Google Drive')).length,
    AdminSDK: currentApps.filter(a => (a.servicesTouched || []).some(s => s.includes('Admin'))).length,
    Calendar: currentApps.filter(a => (a.servicesTouched || []).includes('Calendar')).length,
    Classroom: currentApps.filter(a => (a.servicesTouched || []).includes('Classroom')).length,
  };

  // Quick Action stats
  const pendingConfigCount = currentApps.filter(a => a.adminAccessLevel === 'UNCONFIGURED').length;

  // Click-through to filtered apps list
  const filterByServiceAndNavigate = (serviceName: string) => {
    setServiceFilter(serviceName);
    setRiskFilter("ALL");
    setPolicyFilter("ALL");
    setCategoryFilter("ALL");
    setRiskyScopesOnly(false);
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

  // Most Frequent Risky Scopes (Rated 3-4)
  const scopeMap = new Map<string, number>();
  currentApps.forEach(a => {
    (a.scopes || []).forEach(s => {
      const score = s.adminScore ?? (s.riskLevel === 'CRITICAL' ? 5 : s.riskLevel === 'HIGH' ? 4 : s.riskLevel === 'MEDIUM' ? 3 : 1);
      if (score === 3 || score === 4) {
        scopeMap.set(s.description || s.scope, (scopeMap.get(s.description || s.scope) || 0) + 1);
      }
    });
  });
  const frequentScopes = Array.from(scopeMap.entries()).sort((b, a) => a[1] - b[1]).slice(0, 5);

  const categories = Array.from(new Set(currentApps.map((a) => a.category))).sort();

  const filteredApps = currentApps.filter((app) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query ||
      (app.displayName && app.displayName.toLowerCase().includes(query)) ||
      (app.vendor && app.vendor.toLowerCase().includes(query)) ||
      (app.familyName && app.familyName.toLowerCase().includes(query)) ||
      (app.category && app.category.toLowerCase().includes(query)) ||
      (app.id && app.id.toLowerCase().includes(query)) ||
      (app.publisherDomain && app.publisherDomain.toLowerCase().includes(query)) ||
      (app.description && app.description.toLowerCase().includes(query)) ||
      (app.appType && app.appType.toLowerCase().includes(query)) ||
      (app.deploymentType && app.deploymentType.toLowerCase().includes(query)) ||
      (app.clientIds && app.clientIds.some((cid) => cid.toLowerCase().includes(query))) ||
      (app.servicesTouched && app.servicesTouched.some((srv) => srv.toLowerCase().includes(query))) ||
      (app.scopes && app.scopes.some((s) => 
        (s.description && s.description.toLowerCase().includes(query)) || 
        (s.scope && s.scope.toLowerCase().includes(query))
      ));
    const matchesRisk = riskFilter === "ALL" || 
      (riskFilter === "HIGH_RISK" 
        ? (app.riskScore !== undefined ? app.riskScore >= 4.0 : app.riskLevel === "CRITICAL") 
        : app.riskLevel === riskFilter);
    const policyLevel = app.adminAccessLevel || "UNCONFIGURED";
    const matchesPolicy = policyFilter === "ALL" || 
      (policyFilter === "CONFIGURED" ? policyLevel !== "UNCONFIGURED" : policyLevel === policyFilter);
    const matchesCat = categoryFilter === "ALL" || app.category === categoryFilter;
    const matchesService = serviceFilter === "ALL" || 
      (serviceFilter === "SENSITIVE" 
        ? (app.servicesTouched || []).some(s => s === 'Gmail' || s === 'Google Drive')
        : (app.servicesTouched || []).includes(serviceFilter));
    const matchesMulti = !multiOnly || app.multiClientMapped;
    const matchesRiskyScopes = !riskyScopesOnly || 
      (app.scopes || []).some(s => s.adminScore === 3 || s.adminScore === 4);
    return matchesSearch && matchesRisk && matchesPolicy && matchesCat && matchesService && matchesMulti && matchesRiskyScopes;
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

  const copyScriptToClipboard = (script: string, id: string) => {
    navigator.clipboard.writeText(script);
    setCopiedScriptId(id);
    setTimeout(() => setCopiedScriptId(null), 2500);
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
        const configured = newApps.filter(a => a.adminAccessLevel && a.adminAccessLevel !== 'UNCONFIGURED').length;
        setCurrentMetrics(prev => ({
          ...prev,
          configuredAppsCount: configured,
          trustedAppsCount: trusted,
          baselineSource: file.name,
          baselinePolicyCount: policyMap.size,
          baselineLoadedAt: new Date().toISOString()
        }));
        setUploadToast(`✓ Ingested ${policyMap.size} policies from "${file.name}"! Updated domain trust baseline (${configured} Configured apps).`);
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

  const getRiskBadge = (level: string, score?: number) => {
    const formattedScore = score !== undefined ? `${score.toFixed(1)}` : null;
    switch (level) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span>
            <span>Critical</span>
            {formattedScore && (
              <span className="bg-red-200/60 text-red-800 text-[10px] font-mono px-1 py-0.2 rounded font-bold">
                {formattedScore}
              </span>
            )}
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
            <span>High</span>
            {formattedScore && (
              <span className="bg-amber-200/60 text-amber-800 text-[10px] font-mono px-1 py-0.2 rounded font-bold">
                {formattedScore}
              </span>
            )}
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-semibold text-yellow-800 border border-yellow-200">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-600"></span>
            <span>Medium</span>
            {formattedScore && (
              <span className="bg-yellow-200/60 text-yellow-900 text-[10px] font-mono px-1 py-0.2 rounded font-bold">
                {formattedScore}
              </span>
            )}
          </span>
        );
      case "MINOR":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
            <span>Minor</span>
            {formattedScore && (
              <span className="bg-emerald-200/60 text-emerald-800 text-[10px] font-mono px-1 py-0.2 rounded font-bold">
                {formattedScore}
              </span>
            )}
          </span>
        );
      case "LOW":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
            <span>Low</span>
            {formattedScore && (
              <span className="bg-blue-200/60 text-blue-800 text-[10px] font-mono px-1 py-0.2 rounded font-bold">
                {formattedScore}
              </span>
            )}
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
            🚨 Recommendations ({initialRecs.playbooks?.length ? `${initialRecs.playbooks.length} Campaigns` : (initialRecs.totalFindings || 102)})
          </button>
          <button
            onClick={() => setActiveTab("scopes")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "scopes" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            🛡️ Scope Threat Matrix ({initialScopes.length || 111})
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

      {/* ============================================================== */}
      {/* VIEW 1: EXECUTIVE DASHBOARD VIEW                               */}
      {/* ============================================================== */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* App Access Control Baseline Banner (Shown on main dashboard only) */}
          {!showBaselineBanner ? (
            <div 
              onClick={() => setShowBaselineBanner(true)}
              className="flex items-center justify-between py-1.5 px-3 bg-gray-50/70 hover:bg-blue-50/60 border border-gray-200/80 hover:border-blue-300 rounded-lg text-xs text-gray-500 hover:text-gray-700 cursor-pointer transition-all select-none shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400">▶</span>
                <span className="font-semibold text-gray-700 text-xs">Google Workspace App Access Control Baseline</span>
                <span className="text-gray-400">•</span>
                <span className="text-[11px] text-emerald-600 font-medium">Ground-Truth Active ({currentMetrics.baselinePolicyCount || 32} domain policies synchronized)</span>
              </div>
              <span className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1">
                Show baseline & tools ▾
              </span>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/5 to-white border border-blue-200 rounded-xl p-4 shadow-sm transition-all animate-fade-in">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div
                  className="flex items-center gap-3.5 cursor-pointer select-none flex-1"
                  onClick={() => setShowBaselineBanner(false)}
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 flex-shrink-0 shadow-xs">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-xs sm:text-sm text-gray-900 tracking-tight">
                        Google Workspace App Access Control Baseline
                      </h2>
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Ground-Truth Active ({currentMetrics.baselineSource || 'owl_apps.csv'})
                      </span>
                      <span className="text-[11px] text-gray-500">
                        • <strong className="text-emerald-700 font-semibold">{currentMetrics.baselinePolicyCount || 32} domain policies synchronized</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShowBaselineBanner(false)}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-blue-200 text-xs font-bold text-blue-700 transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <span>▲ Hide / Collapse</span>
                  </button>
                  <button
                    onClick={() => setShowSetupModal(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-sm shadow-blue-500/20"
                  >
                    <span>📖</span> Instructions
                  </button>
                  <label className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-gray-300 cursor-pointer shadow-2xs">
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

              {/* Expanded Explanation Section */}
              <div className="mt-3 pt-3 border-t border-blue-200/80 text-xs text-gray-600 leading-relaxed space-y-2">
                <p>
                  <strong className="text-gray-900 font-semibold">Why this baseline is required:</strong> Google Workspace only stores OAuth authorization tokens for active users within a 180-day window. By importing your <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono text-[11px]">owl_apps.csv</code> export, AdminLens gains permanent ground truth of all admin-configured policies across Organizational Units—surfacing dormant, pre-sanctioned, or restricted third-party applications even when they produce zero recent telemetry.
                </p>
                <div className="flex items-center gap-4 text-[11px] text-gray-500 pt-1">
                  <span>Status: <strong className="text-emerald-700">Synchronized</strong></span>
                  <span>•</span>
                  <span>Domain Scope: <strong className="text-gray-800">All Organizational Units</strong></span>
                  <span>•</span>
                  <span>Total Rules: <strong className="text-gray-800">{currentMetrics.baselinePolicyCount || 32} policies</strong></span>
                </div>

                {/* Quick Deep-Links to Google Admin Console */}
                <div className="pt-2 border-t border-blue-200/50 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-gray-700 flex items-center gap-1.5">
                    <GoogleAdminIcon className="w-3.5 h-3.5" /> Console Deep Links:
                  </span>
                  <a
                    href="https://admin.google.com/ac/owl/list?tab=apps"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 font-semibold rounded-md border border-gray-200 hover:border-blue-300 transition-colors shadow-2xs"
                  >
                    <span>Accessed Apps ↗</span>
                  </a>
                  <a
                    href="https://admin.google.com/ac/owl/list?tab=configuredApps"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 font-semibold rounded-md border border-gray-200 hover:border-emerald-300 transition-colors shadow-2xs"
                  >
                    <span>Configured Apps ↗</span>
                  </a>
                  <a
                    href="https://admin.google.com/ac/owl/list?tab=pendingReviewApps"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-700 font-semibold rounded-md border border-gray-200 hover:border-amber-300 transition-colors shadow-2xs"
                  >
                    <span>Apps Pending Review ↗</span>
                  </a>
                  <a
                    href="https://admin.google.com/ac/owl/list?tab=services"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-700 font-semibold rounded-md border border-gray-200 hover:border-purple-300 transition-colors shadow-2xs"
                  >
                    <span>Google Services ↗</span>
                  </a>
                </div>
              </div>
            </div>
          )}
          
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

            {/* Configured by Admin */}
            <div 
              onClick={() => { setActiveTab("apps"); setPolicyFilter("CONFIGURED"); setRiskFilter("ALL"); setServiceFilter("ALL"); }}
              className="bg-white border border-emerald-200 rounded-xl p-5 shadow-sm relative overflow-hidden bg-gradient-to-br from-emerald-50/40 to-white hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-600 text-sm">⚙️</span> CONFIGURED BY ADMIN
                </span>
                <span className="text-emerald-400">›</span>
              </div>
              <div className="text-3xl font-extrabold text-emerald-700 mt-2">{configuredAppsCount}</div>
              <div className="text-xs text-emerald-600/80 mt-1">Admin configured in Console</div>
            </div>

            {/* High Risk Apps */}
            <div 
              onClick={() => { setActiveTab("apps"); setRiskFilter("HIGH_RISK"); setPolicyFilter("ALL"); setServiceFilter("ALL"); setRiskyScopesOnly(false); }}
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
          
          {/* Active Filter Indicators */}
          <div className="space-y-2">
            {riskFilter === "HIGH_RISK" && (
              <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-xs text-red-900 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="font-bold">⚠️ Filtering by High Risk:</span>
                  <span>Critical & High Severity Applications ({filteredApps.length} matching)</span>
                </div>
                <button
                  onClick={() => setRiskFilter("ALL")}
                  className="text-red-600 hover:text-red-900 font-bold underline text-xs"
                >
                  Clear Risk Filter ✕
                </button>
              </div>
            )}

            {riskyScopesOnly && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-900 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="font-bold">🔒 Filtering by Risky Scopes:</span>
                  <span>Apps with Critical or High Permissions ({filteredApps.length} matching)</span>
                </div>
                <button
                  onClick={() => setRiskyScopesOnly(false)}
                  className="text-amber-700 hover:text-amber-950 font-bold underline text-xs"
                >
                  Clear Scope Filter ✕
                </button>
              </div>
            )}

            {serviceFilter !== "ALL" && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-blue-800 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Filtering by Service:</span>
                  <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-2 py-0.5 rounded font-bold text-xs">
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
          </div>

          {/* Top KPI Header Cards for All Applications (Informational Only) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Total Apps */}
            <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-4 shadow-2xs">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Apps
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{totalAppsCount}</div>
              <div className="text-xs text-gray-500 mt-0.5">Unique apps authorized</div>
            </div>

            {/* Configured by Admin */}
            <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 shadow-2xs">
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Configured by Admin
              </div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">{configuredAppsCount}</div>
              <div className="text-xs text-emerald-600/80 mt-0.5">Console configured & governed</div>
            </div>

            {/* High-Risk Apps (Score 4-5) */}
            <div className="border border-red-200 bg-red-50/40 rounded-xl p-4 shadow-2xs">
              <div className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                High-Risk Apps
              </div>
              <div className="text-2xl font-bold text-red-700 mt-1">{highRiskAppsCount}</div>
              <div className="text-xs text-red-600/80 mt-0.5">Score 4.0 – 5.0 (Critical)</div>
            </div>

            {/* Risky Scopes (Score 3-4) */}
            <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-4 shadow-2xs">
              <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Risky Scopes
              </div>
              <div className="text-2xl font-bold text-amber-800 mt-1">{scopeMap.size}</div>
              <div className="text-xs text-amber-700/80 mt-0.5">Unique permissions rated 3–4</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Left: View Mode Switcher & Search */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* View Mode Switcher */}
              <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setGroupByFamily(true)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${
                    groupByFamily
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>📁</span> Group by Service
                </button>
                <button
                  type="button"
                  onClick={() => setGroupByFamily(false)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${
                    !groupByFamily
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>📋</span> List View
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72 flex-shrink-0">
                <input
                  type="text"
                  placeholder="Search apps, vendors, client IDs, scopes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-9 pr-8 py-2 text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                />
                <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
                    title="Clear search"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
              {/* Access Policy Filter */}
              <select
                value={policyFilter}
                onChange={(e) => setPolicyFilter(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none font-medium"
              >
                <option value="ALL">Policy: All</option>
                <option value="CONFIGURED">⚙️ Configured by Admin</option>
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
                <option value="HIGH_RISK">⚠️ High Risk (Critical & High)</option>
                <option value="CRITICAL">🔴 Critical (4–5)</option>
                <option value="HIGH">🟠 High (3–4)</option>
                <option value="MEDIUM">🟡 Medium (2–3)</option>
                <option value="MINOR">🟢 Minor (1–2)</option>
                <option value="LOW">🔵 Low (0–1)</option>
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
                <option value="SENSITIVE">🛡️ Sensitive (Gmail & Drive)</option>
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
                  checked={riskyScopesOnly}
                  onChange={(e) => setRiskyScopesOnly(e.target.checked)}
                  className="rounded border-gray-300 text-amber-600 focus:ring-0"
                />
                Risky Scopes Only
              </label>

              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-pointer bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={multiOnly}
                  onChange={(e) => setMultiOnly(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-0"
                />
                Multi-Deployment Only
              </label>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="text-sm font-medium text-gray-700">No applications matched the criteria{search ? ` for "${search}"` : ""}.</span>
                          <span className="text-xs text-gray-400">Try adjusting your search terms or clearing active filters.</span>
                          {(search || policyFilter !== "ALL" || riskFilter !== "ALL" || serviceFilter !== "ALL" || categoryFilter !== "ALL" || riskyScopesOnly || multiOnly) && (
                            <button
                              onClick={() => {
                                setSearch("");
                                setPolicyFilter("ALL");
                                setRiskFilter("ALL");
                                setServiceFilter("ALL");
                                setCategoryFilter("ALL");
                                setRiskyScopesOnly(false);
                                setMultiOnly(false);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 font-semibold text-xs transition-colors"
                            >
                              <span>✕</span> Reset all filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : groupByFamily ? (
                    groupedFamilies.map((group) => (
                      <React.Fragment key={group.familyId}>
                        {/* Family Section Header */}
                        <tr className="bg-gradient-to-r from-slate-100/90 to-slate-50 border-t-2 border-slate-300">
                          <td colSpan={6} className="py-2.5 px-4">
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
                            <td className="py-3 px-4">{getRiskBadge(app.riskLevel, app.riskScore)}</td>

                            {/* Users Column */}
                            <td className="py-3 px-4 text-center">
                              <div className="font-bold text-gray-900 text-sm">{app.totalUsersCount}</div>
                              {app.adminUsersCount > 0 && (
                                <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.2">
                                  ⚠️ {app.adminUsersCount} admin
                                </span>
                              )}
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
                        <td className="py-3 px-4">{getRiskBadge(app.riskLevel, app.riskScore)}</td>

                        {/* Users Column */}
                        <td className="py-3 px-4 text-center">
                          <div className="font-bold text-gray-900 text-sm">{app.totalUsersCount}</div>
                          {app.adminUsersCount > 0 && (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.2">
                              ⚠️ {app.adminUsersCount} admin
                            </span>
                          )}
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
      {/* VIEW 3: RECOMMENDATIONS & GOVERNANCE PLAYBOOKS                  */}
      {/* ============================================================== */}
      {activeTab === "recs" && (() => {
        const playbooks = initialRecs.playbooks || [];
        const byFamily = initialRecs.byFamily || [];
        const byAdmin = initialRecs.byAdmin || [];
        const summary = initialRecs.summary || {
          totalFindings: initialRecs.totalFindings || 102,
          totalPlaybooks: playbooks.length || 6,
          totalFamiliesAffected: byFamily.length || 35,
          totalAdminsAffected: byAdmin.length || 7,
          criticalCount: initialRecs.criticalCount || 41,
          highCount: initialRecs.highCount || 14,
          mediumCount: initialRecs.mediumCount || 47,
          actionChannels: { GAM_CLI: 27, GOOGLE_ADMIN_CONSOLE: 75 },
        };

        // Filtered Playbooks
        const filteredPlaybooks = playbooks.filter((p) => {
          const matchesSeverity = recSeverityFilter === "ALL" || p.severity === recSeverityFilter;
          const matchesChannel = recChannelFilter === "ALL" || p.actionChannel === recChannelFilter;
          const s = recSearch.toLowerCase();
          const matchesSearch = !s || 
            p.title.toLowerCase().includes(s) || 
            p.subtitle.toLowerCase().includes(s) ||
            p.familyTargets.some(t => t.familyName.toLowerCase().includes(s) || t.affectedAccounts.some(a => a.toLowerCase().includes(s)));
          return matchesSeverity && matchesChannel && matchesSearch;
        });

        // Filtered Families
        const filteredFamilies = byFamily.filter((fam) => {
          const matchesSeverity = recSeverityFilter === "ALL" || fam.highestSeverity === recSeverityFilter;
          const matchesChannel = recChannelFilter === "ALL" || fam.actionChannels.includes(recChannelFilter);
          const s = recSearch.toLowerCase();
          const matchesSearch = !s || 
            fam.familyName.toLowerCase().includes(s) || 
            fam.vendor.toLowerCase().includes(s) ||
            fam.affectedAccounts.some(a => a.toLowerCase().includes(s));
          return matchesSeverity && matchesChannel && matchesSearch;
        });

        // Filtered Admins
        const filteredAdmins = byAdmin.filter((adm) => {
          const s = recSearch.toLowerCase();
          return !s || 
            adm.adminEmail.toLowerCase().includes(s) ||
            adm.items.some(i => i.application.toLowerCase().includes(s));
        });

        // Filtered Raw Findings
        const filteredRawFindings = (initialRecs.findings || []).filter((f) => {
          const matchesSeverity = recSeverityFilter === "ALL" || f.severity === recSeverityFilter;
          const matchesChannel = recChannelFilter === "ALL" || (f.actionChannel || (f.gamCommand ? "GAM_CLI" : "GOOGLE_ADMIN_CONSOLE")) === recChannelFilter;
          const s = recSearch.toLowerCase();
          const matchesSearch = !s || 
            f.title.toLowerCase().includes(s) || 
            f.application.toLowerCase().includes(s) ||
            f.affectedAccount.toLowerCase().includes(s) ||
            f.clientId.toLowerCase().includes(s);
          return matchesSeverity && matchesChannel && matchesSearch;
        });

        const togglePlaybook = (id: string) => {
          setExpandedPlaybooks(prev => ({ ...prev, [id]: !prev[id] }));
        };

        const toggleFamily = (id: string) => {
          setExpandedFamilies(prev => ({ ...prev, [id]: !prev[id] }));
        };

        return (
          <div className="space-y-5">
            {/* Top Metric & Governance Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/30">
                    <span>🛡️</span> Security Posture & Playbook Engine
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-white">Actionable Security Recommendations</h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    Consolidated playbooks and batch remediations. Instead of triaging 102 individual alerts, remediate third-party risk through coordinated governance campaigns and one-click GAM scripts.
                  </p>
                </div>

                {/* Quick Summary Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-center">
                    <div className="text-lg font-black text-white">{summary.totalPlaybooks}</div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Campaigns</div>
                  </div>
                  <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-center">
                    <div className="text-lg font-black text-amber-400">{summary.totalFamiliesAffected}</div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">App Families</div>
                  </div>
                  <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-center">
                    <div className="text-lg font-black text-red-400">{summary.totalAdminsAffected}</div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Super Admins</div>
                  </div>
                  <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-center">
                    <div className="text-lg font-black text-emerald-400">{summary.actionChannels.GAM_CLI}</div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">CLI Tokens</div>
                  </div>
                </div>
              </div>
            </div>

            {/* View Mode Switcher and Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              {/* Segmented View Mode Toggle */}
              <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200 self-start">
                <button
                  onClick={() => setRecViewMode("playbooks")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    recViewMode === "playbooks" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>📁</span> Action Playbooks ({playbooks.length})
                </button>
                <button
                  onClick={() => setRecViewMode("families")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    recViewMode === "families" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>📦</span> By App Family ({byFamily.length})
                </button>
                <button
                  onClick={() => setRecViewMode("admins")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    recViewMode === "admins" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>👤</span> By Super Admin ({byAdmin.length})
                </button>
                <button
                  onClick={() => setRecViewMode("all")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    recViewMode === "all" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>📋</span> All Findings ({initialRecs.findings?.length || 102})
                </button>
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                  <input
                    type="text"
                    value={recSearch}
                    onChange={(e) => setRecSearch(e.target.value)}
                    placeholder="Filter recommendations..."
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute left-2.5 top-2 text-xs text-gray-400">🔍</span>
                  {recSearch && (
                    <button onClick={() => setRecSearch("")} className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600 text-xs">✕</button>
                  )}
                </div>

                {/* Channel Filter */}
                <select
                  value={recChannelFilter}
                  onChange={(e) => setRecChannelFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 font-medium"
                >
                  <option value="ALL">All Channels</option>
                  <option value="GAM_CLI">⚡ GAM CLI (Batch Scriptable)</option>
                  <option value="GOOGLE_ADMIN_CONSOLE">🛡️ Google Admin Console</option>
                </select>

                {/* Severity Filter */}
                <select
                  value={recSeverityFilter}
                  onChange={(e) => setRecSeverityFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 font-medium"
                >
                  <option value="ALL">All Severities</option>
                  <option value="CRITICAL">🔴 Critical Only</option>
                  <option value="HIGH">🟠 High Only</option>
                  <option value="MEDIUM">🟡 Medium Only</option>
                </select>
              </div>
            </div>

            {/* ========================================================== */}
            {/* VIEW MODE 1: ACTION PLAYBOOKS (CAMPAIGNS)                   */}
            {/* ========================================================== */}
            {recViewMode === "playbooks" && (
              <div className="space-y-4">
                {filteredPlaybooks.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
                    <p className="font-semibold text-sm">No action playbooks matching the current filters.</p>
                    <button
                      onClick={() => { setRecSeverityFilter("ALL"); setRecChannelFilter("ALL"); setRecSearch(""); }}
                      className="mt-3 text-xs text-blue-600 font-bold hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  filteredPlaybooks.map((playbook) => {
                    const isExpanded = !!expandedPlaybooks[playbook.id];
                    const isCritical = playbook.severity === "CRITICAL";
                    const isHigh = playbook.severity === "HIGH";

                    return (
                      <div
                        key={playbook.id}
                        className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${
                          isCritical
                            ? "border-red-300 bg-gradient-to-b from-red-50/20 to-white"
                            : isHigh
                            ? "border-amber-300 bg-gradient-to-b from-amber-50/20 to-white"
                            : "border-gray-200"
                        }`}
                      >
                        {/* Playbook Header Accordion Bar */}
                        <div
                          onClick={() => togglePlaybook(playbook.id)}
                          className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/60 transition-colors"
                        >
                          <div className="flex items-start gap-3.5">
                            <span className="text-2xl mt-0.5">{isCritical ? "🚨" : isHigh ? "⚠️" : "🛡️"}</span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                {getRiskBadge(playbook.severity)}
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                  playbook.actionChannel === "GAM_CLI"
                                    ? "bg-purple-100 text-purple-800 border-purple-200"
                                    : "bg-blue-100 text-blue-800 border-blue-200"
                                }`}>
                                  {playbook.actionChannel === "GAM_CLI" ? "⚡ CLI Batch Scriptable" : "🛡️ Google Admin Console"}
                                </span>
                                <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                  {playbook.metrics.totalFindings} Findings
                                </span>
                                <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                  {playbook.metrics.distinctFamilies} App Families
                                </span>
                              </div>
                              <h3 className="font-extrabold text-base text-gray-900">{playbook.title}</h3>
                              <p className="text-xs text-gray-600 mt-0.5">{playbook.subtitle}</p>
                            </div>
                          </div>

                          {/* Action Buttons in Header */}
                          <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            {playbook.batchGamScript && (
                              <button
                                onClick={() => copyScriptToClipboard(playbook.batchGamScript!, playbook.id)}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
                              >
                                <span>⚡</span>
                                <span>{copiedScriptId === playbook.id ? "Copied All! ✓" : `Copy All (${playbook.metrics.totalFindings}) GAM Commands`}</span>
                              </button>
                            )}

                            {playbook.adminConsolePath && (
                              <a
                                href="https://admin.google.com/ac/owl/list?tab=apps"
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                              >
                                <GoogleAdminIcon className="w-3.5 h-3.5" />
                                <span>Admin Console ↗</span>
                              </a>
                            )}

                            <button
                              onClick={() => togglePlaybook(playbook.id)}
                              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ml-1"
                              aria-label="Toggle details"
                            >
                              <span className="inline-block transform transition-transform text-xs font-bold" style={{ transform: isExpanded ? "rotate(180deg)" : "none" }}>
                                ▼
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Expanded Playbook Details */}
                        {isExpanded && (
                          <div className="border-t border-gray-200/80 p-5 space-y-5 bg-white/70">
                            {/* Remediation Summary Box */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1.5">
                              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                <span className="text-blue-600">📌</span> Campaign Remediation Objective:
                              </div>
                              <p className="text-slate-600 leading-relaxed">{playbook.remediationSummary}</p>
                              {playbook.adminConsolePath && (
                                <div className="text-slate-500 font-mono text-[11px] pt-1">
                                  Path: <span className="font-bold text-slate-700">{playbook.adminConsolePath}</span>
                                </div>
                              )}
                            </div>

                            {/* Special Sub-Section: Super Admin Breakdown (for Super Admin Exposure Playbook) */}
                            {playbook.adminBreakdown && playbook.adminBreakdown.length > 0 && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
                                    Privileged Super Admin Breakdown ({playbook.adminBreakdown.length} Admins)
                                  </h4>
                                  <span className="text-[11px] text-gray-500">Click to copy individual cleanup scripts</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {playbook.adminBreakdown.map((adm) => (
                                    <div
                                      key={adm.adminEmail}
                                      className="border border-purple-200 bg-purple-50/40 rounded-xl p-3.5 space-y-2.5 flex flex-col justify-between"
                                    >
                                      <div>
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="font-mono font-bold text-xs text-purple-950 truncate" title={adm.adminEmail}>
                                            {adm.adminEmail}
                                          </span>
                                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                                            {adm.tokenCount} tokens
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-purple-800/80 mt-1 truncate">
                                          Apps: {adm.items.map(i => i.application).slice(0, 2).join(", ")}
                                          {adm.items.length > 2 ? ` +${adm.items.length - 2} more` : ""}
                                        </p>
                                      </div>

                                      <button
                                        onClick={() => copyScriptToClipboard(adm.batchGamScript, `adm-${adm.adminEmail}`)}
                                        className="w-full text-center px-2.5 py-1.5 bg-white hover:bg-purple-100 text-purple-700 border border-purple-300 rounded-lg text-xs font-bold transition-colors shadow-2xs"
                                      >
                                        {copiedScriptId === `adm-${adm.adminEmail}` ? "Copied Admin Script! ✓" : `Copy (${adm.tokenCount}) GAM Commands`}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Consolidated Targets Table */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
                                Consolidated Target Applications ({playbook.familyTargets.length} Application Families)
                              </h4>

                              <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                                    <tr>
                                      <th className="py-2.5 px-3">Application Family</th>
                                      <th className="py-2.5 px-3">Affected Accounts / Deployments</th>
                                      <th className="py-2.5 px-3">Primary Action</th>
                                      <th className="py-2.5 px-3 text-right">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100 bg-white">
                                    {playbook.familyTargets.map((target) => (
                                      <tr key={target.familyId} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="py-3 px-3">
                                          <div className="font-bold text-gray-900 flex items-center gap-2">
                                            {target.iconUrl ? (
                                              <img src={target.iconUrl} alt="" className="w-4 h-4 rounded-sm flex-shrink-0" />
                                            ) : (
                                              <span className="text-sm">📦</span>
                                            )}
                                            <span>{target.familyName}</span>
                                          </div>
                                          <div className="text-[11px] text-gray-500">{target.vendor}</div>
                                          {target.clientIds.length > 1 && (
                                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 inline-block mt-1">
                                              {target.clientIds.length} OAuth Client Deployments
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-3 px-3">
                                          <div className="flex flex-wrap gap-1 max-w-md">
                                            {target.affectedAccounts.slice(0, 3).map((acc) => (
                                              <span key={acc} className="font-mono text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                                {acc}
                                              </span>
                                            ))}
                                            {target.affectedAccounts.length > 3 && (
                                              <span className="text-[10px] text-gray-500 self-center">
                                                +{target.affectedAccounts.length - 3} more
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="py-3 px-3">
                                          <div className="text-gray-700 leading-snug">
                                            {target.items[0]?.remediation.slice(0, 100)}...
                                          </div>
                                        </td>
                                        <td className="py-3 px-3 text-right whitespace-nowrap">
                                          {target.gamCommands && target.gamCommands.length > 0 ? (
                                            <button
                                              onClick={() => copyScriptToClipboard(target.gamCommands!.join('\n'), `fam-${target.familyId}`)}
                                              className="text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-md transition-colors"
                                            >
                                              {copiedScriptId === `fam-${target.familyId}` ? "Copied! ✓" : `Copy (${target.gamCommands.length}) GAM`}
                                            </button>
                                          ) : (
                                            <a
                                              href="https://admin.google.com/ac/owl/list?tab=apps"
                                              target="_blank"
                                              rel="noreferrer"
                                              className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md transition-colors inline-block"
                                            >
                                              Admin Console ↗
                                            </a>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ========================================================== */}
            {/* VIEW MODE 2: BY PRODUCT FAMILY (ASSET VIEW)                 */}
            {/* ========================================================== */}
            {recViewMode === "families" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFamilies.length === 0 ? (
                  <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
                    No product families matching current filters.
                  </div>
                ) : (
                  filteredFamilies.map((fam) => {
                    const isExpanded = !!expandedFamilies[fam.familyId];
                    return (
                      <div
                        key={fam.familyId}
                        className={`bg-white border rounded-2xl p-5 shadow-sm space-y-3.5 flex flex-col justify-between ${
                          fam.highestSeverity === "CRITICAL"
                            ? "border-red-300 bg-red-50/15"
                            : fam.highestSeverity === "HIGH"
                            ? "border-amber-300 bg-amber-50/15"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="space-y-2.5">
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              {fam.iconUrl ? (
                                <img src={fam.iconUrl} alt="" className="w-8 h-8 rounded-lg border border-gray-200 p-0.5 bg-white flex-shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                                  📦
                                </div>
                              )}
                              <div>
                                <h3 className="font-bold text-sm text-gray-900">{fam.familyName}</h3>
                                <p className="text-xs text-gray-500">{fam.vendor}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {getRiskBadge(fam.highestSeverity)}
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                                {fam.findingsCount} Findings
                              </span>
                            </div>
                          </div>

                          {/* Rule Pills */}
                          <div className="flex flex-wrap gap-1">
                            {fam.rulesTriggered.map(r => (
                              <span key={r} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {r.replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>

                          {/* Deployments & Users */}
                          <div className="text-xs text-gray-600 space-y-1 bg-gray-50/80 p-2.5 rounded-lg border border-gray-200">
                            <div>
                              Deployments: <span className="font-semibold text-gray-800">{fam.clientIds.length} OAuth Client(s)</span>
                            </div>
                            <div>
                              Target Accounts: <span className="font-mono text-gray-800">{fam.affectedAccounts.slice(0, 2).join(", ")}{fam.affectedAccounts.length > 2 ? ` +${fam.affectedAccounts.length - 2} more` : ""}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Bar */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                          <button
                            onClick={() => toggleFamily(fam.familyId)}
                            className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                          >
                            {isExpanded ? "Hide Grants ▲" : `View ${fam.findings.length} Detailed Findings ▼`}
                          </button>

                          {fam.gamCommands && fam.gamCommands.length > 0 ? (
                            <button
                              onClick={() => copyScriptToClipboard(fam.gamCommands!.join('\n'), `fam-btn-${fam.familyId}`)}
                              className="text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              {copiedScriptId === `fam-btn-${fam.familyId}` ? "Copied! ✓" : `Copy (${fam.gamCommands.length}) GAM`}
                            </button>
                          ) : (
                            <a
                              href="https://admin.google.com/ac/owl/list?tab=apps"
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                            >
                              <GoogleAdminIcon className="w-3.5 h-3.5" />
                              <span>Admin Console ↗</span>
                            </a>
                          )}
                        </div>

                        {/* Expanded Findings Drawer */}
                        {isExpanded && (
                          <div className="pt-2 border-t border-gray-200 space-y-2">
                            {fam.findings.map((finding) => (
                              <div key={finding.id} className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-xs space-y-1">
                                <div className="font-bold text-gray-800 flex items-center justify-between">
                                  <span>{finding.title}</span>
                                  {getRiskBadge(finding.severity)}
                                </div>
                                <div className="text-gray-600">{finding.details}</div>
                                {finding.gamCommand && (
                                  <div className="font-mono text-[10px] text-purple-900 bg-purple-50 p-1 rounded truncate">
                                    {finding.gamCommand}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ========================================================== */}
            {/* VIEW MODE 3: BY SUPER ADMIN (IDENTITY VIEW)                */}
            {/* ========================================================== */}
            {recViewMode === "admins" && (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-xs text-purple-900 flex items-center justify-between">
                  <div>
                    <span className="font-bold">Super Admin Privilege Exposure:</span> In Google Workspace, third-party tokens authorized by Super Admins inherit tenant-wide administrative power. Revoking unnecessary tokens minimizes full tenant compromise risk.
                  </div>
                  <button
                    onClick={() => {
                      const allAdminScript = byAdmin.flatMap(a => a.gamCommands).join('\n');
                      copyScriptToClipboard(allAdminScript, "all-admins-script");
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-sm whitespace-nowrap ml-3"
                  >
                    {copiedScriptId === "all-admins-script" ? "Copied All Admins! ✓" : "Copy All 7 Admins Script"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAdmins.map((adm) => (
                    <div
                      key={adm.adminEmail}
                      className="bg-white border border-purple-200 rounded-2xl p-5 shadow-sm space-y-3.5 flex flex-col justify-between"
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
                          <span className="font-extrabold text-sm text-purple-800 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200">
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
                              <button
                                onClick={() => copyToClipboard(item.gamCommand!, item.id)}
                                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 px-2 py-0.5 rounded hover:bg-blue-50 transition-colors flex-shrink-0"
                              >
                                {copiedId === item.id ? "Copied! ✓" : "Copy"}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Admin Batch Copy Button */}
                      <button
                        onClick={() => copyScriptToClipboard(adm.batchGamScript, `adm-card-${adm.adminEmail}`)}
                        className="w-full text-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                      >
                        {copiedScriptId === `adm-card-${adm.adminEmail}` ? "Copied Script! ✓" : `⚡ Copy (${adm.tokenCount}) GAM Revoke Commands for ${adm.adminEmail.split('@')[0]}`}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* VIEW MODE 4: ALL RAW FINDINGS (LEGACY GRANULAR VIEW)       */}
            {/* ========================================================== */}
            {recViewMode === "all" && (
              <div className="space-y-3">
                <div className="text-xs text-gray-500 italic px-1">
                  Displaying {filteredRawFindings.length} granular findings across the entire domain.
                </div>

                {filteredRawFindings.map((rec) => (
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
                        <div className="flex items-center gap-2 flex-wrap">
                          {getRiskBadge(rec.severity)}
                          <h3 className="font-bold text-sm text-gray-900">{rec.title}</h3>
                          {rec.clientId && (
                            <span 
                              title={`Client ID: ${rec.clientId}`}
                              className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 truncate max-w-[280px]"
                            >
                              Client ID: {rec.clientId.length > 25 ? `${rec.clientId.slice(0, 12)}...${rec.clientId.slice(-10)}` : rec.clientId}
                            </span>
                          )}
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
                      {rec.gamCommand ? (
                        <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded font-mono text-[11px] text-gray-800 border border-gray-300 shadow-inner">
                          <span className="truncate">{rec.gamCommand}</span>
                          <button
                            onClick={() => copyToClipboard(rec.gamCommand!, rec.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold ml-3 flex-shrink-0"
                          >
                            {copiedId === rec.id ? "Copied! ✓" : "Copy Command"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded text-[11px] text-gray-700 border border-gray-200 shadow-2xs">
                          <span className="text-gray-600">Console Action: <strong className="text-gray-900">{rec.adminConsolePath || "Security > API controls > App access control"}</strong></span>
                          <a
                            href="https://admin.google.com/ac/owl/list?tab=apps"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-bold ml-3 flex-shrink-0"
                          >
                            <GoogleAdminIcon className="w-3.5 h-3.5" />
                            Open Google Admin Console ↗
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}


      {/* Scope Threat Matrix Tab View */}
      {activeTab === "scopes" && (
        <ScopeMatrixView
          scopes={initialScopes}
          metrics={scopeMetrics}
          apps={currentApps}
          onSelectApp={(app) => setSelectedApp(app)}
        />
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
                    {getRiskBadge(selectedApp.riskLevel, selectedApp.riskScore)}
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
                  
                  {/* Direct Google Admin Console Action Bar */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <a
                      href={getAdminConsoleLink(selectedApp).url}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border shadow-xs transition-all ${
                        getAdminConsoleLink(selectedApp).isConfigured
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 ring-2 ring-emerald-500/20"
                          : "bg-blue-600 hover:bg-blue-700 text-white border-blue-700 ring-2 ring-blue-500/20"
                      }`}
                      title={getAdminConsoleLink(selectedApp).label}
                    >
                      <GoogleAdminIcon className="w-4 h-4 text-white" />
                      <span>{getAdminConsoleLink(selectedApp).label} ↗</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        const targetId = selectedApp.clientId || selectedApp.id;
                        if (targetId) {
                          navigator.clipboard.writeText(targetId);
                          setCopiedId(selectedApp.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition-colors shadow-2xs"
                      title="Copy Client ID to clipboard"
                    >
                      <span>{copiedId === selectedApp.id ? "✓ Copied Client ID!" : "📋 Copy Client ID"}</span>
                    </button>
                    <span className="text-[11px] text-gray-500 font-medium">
                      Console tab: <strong className="text-gray-800">{getAdminConsoleLink(selectedApp).tabName}</strong>
                    </span>
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

              {/* Critical Governance Recommendation Banner for Unverified & Unconfigured High/Critical Apps */}
              {((selectedApp.riskLevel === 'CRITICAL' || selectedApp.riskLevel === 'HIGH' || (selectedApp.riskScore !== undefined && selectedApp.riskScore >= 3.0)) && !selectedApp.isVerified && (!selectedApp.adminAccessLevel || selectedApp.adminAccessLevel === 'UNCONFIGURED')) && (
                <div className="bg-red-50/80 border-2 border-red-300 rounded-xl p-4.5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-950 font-bold text-sm">
                      <span className="text-base">🚨</span>
                      <span>CRITICAL GOVERNANCE ACTION REQUIRED</span>
                    </div>
                    <span className="bg-red-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                      Critical Review
                    </span>
                  </div>

                  <p className="text-xs text-red-950 font-medium leading-relaxed">
                    This application holds high-privilege access ({selectedApp.riskLevel} risk), is <strong>unverified by Google</strong>, and has <strong>not been configured or reviewed by an administrator</strong> in Google Workspace.
                  </p>

                  <div className="p-3.5 bg-white/90 rounded-lg border border-red-200/90 space-y-2.5 text-xs">
                    <div>
                      <span className="font-bold text-red-900">Urgent Remediation:</span> Urgently review this application and contact the active user(s) utilizing it (<strong>{selectedApp.users?.map(u => u.email).join(', ') || 'Domain Users'}</strong>) to confirm if this access was intended, and ensure they build or establish a legitimate, documented business use case.
                    </div>
                    <div className="pt-2 border-t border-red-100 space-y-1.5">
                      <div className="font-bold text-gray-900">Security Recommendation based on Risk:</div>
                      <div className="flex items-start gap-2 text-gray-800">
                        <span className="text-emerald-700 font-bold">✓</span>
                        <span><strong>If the user has a strong, validated use case:</strong> Do not grant broad trust. In Google Admin Console API Controls, configure the policy to only allow <strong>&quot;Specific Google data&quot;</strong>.</span>
                      </div>
                      <div className="flex items-start gap-2 text-gray-800">
                        <span className="text-red-700 font-bold">✗</span>
                        <span><strong>If there is no good or approved use case:</strong> Immediately set the application policy to <strong>&quot;Blocked&quot;</strong>.</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <a
                      href={getAdminConsoleLink(selectedApp).url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-bold text-red-800 hover:text-red-950 underline"
                    >
                      <GoogleAdminIcon className="w-3.5 h-3.5" />
                      Configure Access Policy in Google Admin Console ↗
                    </a>
                    <span className="text-[11px] text-gray-500 font-mono">Status: Unconfigured Shadow IT</span>
                  </div>
                </div>
              )}

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
                  <div className="flex items-center gap-2">
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

              {/* Option B Non-Compensatory Floor Risk Model Calculation Breakdown (Collapsible & Hidden by Default) */}
              <div className="border border-slate-200/80 bg-slate-50/60 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowRiskCalc(!showRiskCalc)}
                  className="w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400 text-xs">📐</span>
                    <span className="font-semibold text-gray-700 text-xs">
                      Risk Model Calculation Details
                    </span>
                    <span className="text-[10px] text-gray-400 font-normal">
                      (Peak Scope Base Floor + Breadth Surcharge)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-blue-600 hover:text-blue-800">
                      {showRiskCalc ? "Hide ▲" : "Show details ▼"}
                    </span>
                  </div>
                </button>

                {showRiskCalc && (
                  <div className="p-4 pt-3 border-t border-slate-200/80 space-y-3 bg-white/70">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">
                          Non-Compensatory Floor Model (Option B)
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Base Severity Floor (Peak Scope − 1) + Additive Attack Surface Breadth
                        </p>
                      </div>
                      {getRiskBadge(selectedApp.riskLevel, selectedApp.riskScore)}
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 text-center text-xs pt-1">
                      <div className="bg-white border border-gray-200 rounded-lg p-2.5 shadow-2xs">
                        <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Base Floor (Peak)</div>
                        <div className="text-base font-bold text-red-700 mt-0.5">
                          {Math.max(0, (selectedApp.peakScopeScore ?? 1) - 1).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Tier {selectedApp.peakScopeScore ?? 1} Floor (Peak − 1)
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-2.5 shadow-2xs">
                        <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Breadth Surcharge</div>
                        <div className="text-base font-bold text-blue-700 mt-0.5">
                          +{(selectedApp.breadthScore !== undefined ? selectedApp.breadthScore : Math.max(0, (selectedApp.riskScore || 0) - Math.max(0, (selectedApp.peakScopeScore ?? 1) - 1))).toFixed(2)} pts
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {Math.max(0, (selectedApp.scopes?.length || 1) - 1)} secondary scope(s)
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-2.5 shadow-2xs">
                        <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Final Risk Score</div>
                        <div className="text-base font-bold text-gray-900 mt-0.5">
                          {selectedApp.riskScore !== undefined ? selectedApp.riskScore.toFixed(2) : '0.00'}
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium">
                          / 5.00 Scale
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-600 bg-slate-50 rounded-md p-2 border border-gray-200/80 leading-snug">
                      <strong>Non-Compensatory Rationale:</strong> The peak scope sets an absolute, non-dilutable security floor (Peak Score − 1: Level 5 → 4.00, Level 4 → 3.00, Level 3 → 2.00, Level 2 → 1.00, Level 1 → 0.00). Secondary scopes add breadth surcharge points within tier headroom (0–1 Low, 1–2 Minor, 2–3 Medium, 3–4 High, 4–5 Critical) without diluting peak permissions.
                    </div>
                  </div>
                )}
              </div>

              {/* Risk Evaluation */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Security Evaluation Findings</h3>
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
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1.5">
                      <div className="flex justify-between items-center gap-3">
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-6 h-6 bg-white rounded p-0.5 border border-gray-200/60 flex items-center justify-center flex-shrink-0">
                            <GoogleProductIcon service={s.service || s.scope} className="w-4 h-4" />
                          </div>
                          <span className="truncate font-mono text-gray-800 font-semibold">{s.scope}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {s.googleTier && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border bg-white text-gray-600 border-gray-200">
                              {s.googleTier}
                            </span>
                          )}
                          {s.adminScore !== undefined ? (
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                              s.adminScore === 5 ? 'bg-red-50 text-red-700 border-red-200' :
                              s.adminScore === 4 ? 'bg-amber-50 text-amber-800 border-amber-200' :
                              s.adminScore === 3 ? 'bg-yellow-50 text-yellow-850 border-yellow-200' :
                              s.adminScore === 2 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                              'bg-blue-50 text-blue-800 border-blue-200'
                            }`}>
                              {s.adminScore === 5 ? '🔴 5 Critical' :
                               s.adminScore === 4 ? '🟠 4 High' :
                               s.adminScore === 3 ? '🟡 3 Moderate' :
                               s.adminScore === 2 ? '🟢 2 Minor' :
                               '🔵 1 Low'}
                            </span>
                          ) : (
                            getRiskBadge(s.riskLevel)
                          )}
                        </div>
                      </div>
                      {s.description && (
                        <div className="text-[11px] text-gray-600 pl-8">
                          <span className="font-semibold text-gray-700">{s.description}:</span> {s.threatImpact || ''}
                        </div>
                      )}
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
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-wrap gap-2 justify-between items-center text-xs text-gray-500">
              <div>Total Activity Events: <span className="font-bold text-gray-800">{selectedApp.totalActivityEvents}</span></div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
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
                  <div className="space-y-1.5 flex-1">
                    <div className="font-semibold text-gray-900 flex items-center justify-between">
                      <span>Navigate to App Access Control in Google Admin Console</span>
                      <span className="text-[11px] text-gray-400">Direct deep links:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <a
                        href="https://admin.google.com/ac/owl/list?tab=apps"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md font-semibold"
                      >
                        Accessed Apps ↗
                      </a>
                      <a
                        href="https://admin.google.com/ac/owl/list?tab=configuredApps"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md font-semibold"
                      >
                        Configured Apps ↗
                      </a>
                      <a
                        href="https://admin.google.com/ac/owl/list?tab=pendingReviewApps"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md font-semibold"
                      >
                        Pending Review ↗
                      </a>
                      <a
                        href="https://admin.google.com/ac/owl/list?tab=services"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md font-semibold"
                      >
                        Google Services ↗
                      </a>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      Sign in to <span className="font-mono font-medium text-gray-700">admin.google.com</span> as Super Admin. In the left navigation, go to:
                    </p>
                    <div className="font-mono text-[11px] bg-white px-2.5 py-1 rounded border border-gray-200 text-gray-700 inline-block mt-0.5">
                      Security &gt; Access and data control &gt; API controls &gt; App access control
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
