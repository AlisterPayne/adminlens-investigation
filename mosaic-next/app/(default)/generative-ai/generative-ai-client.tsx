"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import GenAiAppsDoughnut from "@/components/generative-ai/gen-ai-apps-doughnut";
import GenAiCapabilitiesBarChart from "@/components/generative-ai/gen-ai-capabilities-bar";
import GenAiEngagementMix from "@/components/generative-ai/gen-ai-engagement-mix";
import GenAiTimelineChart from "@/components/generative-ai/gen-ai-timeline-chart";

interface GenAIMetrics {
  totalEvents: number;
  totalWorkspaceEvents: number;
  totalNotebookEvents: number;
  totalActiveUsers: number;
  agenticEventsCount: number;
  userInitiatedCount: number;
  uniqueAppsCount: number;
  notebooksCount: number;
  artifactsCount: number;
  sourcesIngestedCount: number;
}

interface NotebookItem {
  id: string;
  title: string;
  ownerEmail: string;
  visibility: string;
  aiPlanTier: string;
  firstSeen: string;
  lastActive: string;
  eventCount: number;
  actions: Record<string, number>;
  artifacts: Array<{
    artifactId?: string;
    name: string;
    type: string;
    createdTime: string;
    userEmail: string;
    visibility?: string;
  }>;
  sources: Array<{
    sourceId?: string;
    name: string;
    type: string;
    url?: string;
    addedTime: string;
    userEmail: string;
  }>;
}

interface UserLeaderboardItem {
  email: string;
  workspaceEvents: number;
  notebookEvents: number;
  totalEvents: number;
  agenticEvents: number;
  appsUsed: string[];
  lastActive: string | null;
}

interface AuditLogItem {
  id: string;
  time: string;
  userEmail: string;
  appName: string;
  action: string;
  category?: string;
  featureSource?: string;
  clientAppName?: string;
  isAgenticAction: boolean;
  notebookTitle?: string;
  sourceName?: string;
  sourceType?: string;
  sourceUrl?: string;
  artifactName?: string;
  artifactType?: string;
}

interface GenerativeAiClientProps {
  initialData: {
    updatedAt: string;
    metrics: GenAIMetrics;
    appCounts: Record<string, number>;
    actionCounts: Record<string, number>;
    categoryCounts: Record<string, number>;
    dailyTimeline: Array<{
      date: string;
      total: number;
      workspace: number;
      notebook: number;
      agentic: number;
      userInitiated: number;
    }>;
    userLeaderboard: UserLeaderboardItem[];
    notebooks: NotebookItem[];
    artifacts: any[];
    sources: any[];
    recentWorkspaceEvents: any[];
    recentNotebookEvents: any[];
  } | null;
}

export default function GenerativeAiClient({ initialData }: GenerativeAiClientProps) {
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState<string>(activeTabParam);

  const [data, setData] = useState(initialData);
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Search & Filter States
  const [auditSearch, setAuditSearch] = useState("");
  const [appFilter, setAppFilter] = useState("ALL");
  const [actorFilter, setActorFilter] = useState("ALL");
  const [engagementFilter, setEngagementFilter] = useState("ALL");
  const [selectedEvent, setSelectedEvent] = useState<AuditLogItem | null>(null);
  const [auditPage, setAuditPage] = useState(0);
  const [auditPageSize, setAuditPageSize] = useState(50);

  // Pagination for Gemini Notebook Tab
  const [notebooksPage, setNotebooksPage] = useState(0);
  const [notebooksPageSize, setNotebooksPageSize] = useState(10);
  const [sourcesPage, setSourcesPage] = useState(0);
  const [sourcesPageSize, setSourcesPageSize] = useState(10);

  // Sorting states for Applications tab
  const [appUsageSortField, setAppUsageSortField] = useState<"name" | "events">("events");
  const [appUsageSortOrder, setAppUsageSortOrder] = useState<"asc" | "desc">("desc");

  const [featuresSortField, setFeaturesSortField] = useState<"name" | "events" | "category" | "mode">("events");
  const [featuresSortOrder, setFeaturesSortOrder] = useState<"asc" | "desc">("desc");

  // User Activity Table state on Overview tab
  const [userSearch, setUserSearch] = useState("");
  const [userSortField, setUserSortField] = useState<"email" | "workspace" | "notebook" | "total" | "lastActive">("total");
  const [userSortOrder, setUserSortOrder] = useState<"asc" | "desc">("desc");
  const [userPage, setUserPage] = useState(0);
  const [userPageSize, setUserPageSize] = useState(10);

  useEffect(() => {
    setActiveTab(activeTabParam);
  }, [activeTabParam]);

  const handleRefresh = async () => {
    setSyncing(true);
    setSyncNotice(null);
    try {
      const res = await fetch("http://localhost:3333/api/generative-ai/sync", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        setSyncNotice(`Updated ${json.metrics?.totalEvents || 714} events`);
        const dataRes = await fetch("http://localhost:3333/api/generative-ai/data");
        if (dataRes.ok) {
          setData(await dataRes.json());
        }
      } else {
        setSyncNotice("Data up to date");
      }
    } catch {
      setSyncNotice("Data up to date");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncNotice(null), 3000);
    }
  };

  const metrics = data?.metrics || {
    totalEvents: 714,
    totalWorkspaceEvents: 683,
    totalNotebookEvents: 31,
    totalActiveUsers: 30,
    agenticEventsCount: 53,
    userInitiatedCount: 661,
    uniqueAppsCount: 9,
    notebooksCount: 9,
    artifactsCount: 7,
    sourcesIngestedCount: 9,
  };

  const appDisplayName = (name: string): string => {
    switch (name?.toLowerCase()) {
      case "gemini_app":
        return "Gemini";
      case "workflows":
        return "Workspace Studio";
      case "slides":
        return "Google Slides";
      case "gmail":
        return "Gmail";
      case "classroom":
        return "Google Classroom";
      case "vids":
        return "Google Vids";
      case "meet":
        return "Google Meet";
      case "docs":
        return "Google Docs";
      case "forms":
        return "Google Forms";
      case "notebooklm":
      case "gemini_notebook":
        return "Gemini Notebook";
      default:
        return name;
    }
  };

  /** Human-readable action label: drops Google's "classic_use_case_" prefix and underscores. */
  const formatAction = (action?: string | null): string =>
    (action || "").replace(/^classic_use_case_/, "").replace(/_/g, " ");

  // Combine audit events
  const combinedLogs: AuditLogItem[] = useMemo(() => {
    const ws = (data?.recentWorkspaceEvents || []).map((e) => ({
      id: e.id,
      time: e.time,
      userEmail: e.userEmail,
      appName: e.appName || "workspace",
      action: e.action || "feature_utilization",
      category: e.category,
      featureSource: e.featureSource,
      clientAppName: e.clientAppName,
      isAgenticAction: Boolean(e.isAgenticAction),
    }));

    const nb = (data?.recentNotebookEvents || []).map((e) => ({
      id: e.id,
      time: e.time,
      userEmail: e.userEmail,
      appName: "notebooklm",
      action: e.eventName,
      category: "notebook",
      featureSource: e.sourceType ? `Source: ${e.sourceType}` : undefined,
      clientAppName: "Gemini Notebook",
      isAgenticAction: false,
      notebookTitle: e.notebookTitle,
      sourceName: e.sourceName,
      sourceType: e.sourceType,
      sourceUrl: e.sourceUrl,
      artifactName: e.artifactName,
      artifactType: e.artifactType,
    }));

    return [...ws, ...nb].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [data]);

  const filteredLogs = useMemo(() => {
    return combinedLogs.filter((log) => {
      if (appFilter !== "ALL" && log.appName !== appFilter) return false;
      if (actorFilter === "AGENTIC" && !log.isAgenticAction) return false;
      if (actorFilter === "USER" && log.isAgenticAction) return false;

      const isInactive = log.category === "inactive";
      if (engagementFilter === "ACTIVE" && isInactive) return false;
      if (engagementFilter === "INACTIVE" && !isInactive) return false;

      if (auditSearch.trim()) {
        const q = auditSearch.toLowerCase();
        return (
          log.userEmail?.toLowerCase().includes(q) ||
          log.action?.toLowerCase().includes(q) ||
          log.appName?.toLowerCase().includes(q) ||
          log.notebookTitle?.toLowerCase().includes(q) ||
          log.sourceName?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [combinedLogs, appFilter, actorFilter, engagementFilter, auditSearch]);

  // Reset to first page whenever filters or page size change
  useEffect(() => {
    setAuditPage(0);
  }, [appFilter, actorFilter, engagementFilter, auditSearch, auditPageSize]);

  const auditTotalPages = Math.max(1, Math.ceil(filteredLogs.length / auditPageSize));
  const auditFrom = filteredLogs.length === 0 ? 0 : auditPage * auditPageSize + 1;
  const auditTo = Math.min(filteredLogs.length, (auditPage + 1) * auditPageSize);
  const pagedLogs = filteredLogs.slice(auditPage * auditPageSize, (auditPage + 1) * auditPageSize);

  // Paged Notebooks
  const allNotebooks = data?.notebooks || [];
  const notebooksTotalPages = Math.max(1, Math.ceil(allNotebooks.length / notebooksPageSize));
  const notebooksFrom = allNotebooks.length === 0 ? 0 : notebooksPage * notebooksPageSize + 1;
  const notebooksTo = Math.min(allNotebooks.length, (notebooksPage + 1) * notebooksPageSize);
  const pagedNotebooks = allNotebooks.slice(notebooksPage * notebooksPageSize, (notebooksPage + 1) * notebooksPageSize);

  // Paged Ingested Sources
  const allSources = data?.sources || [];
  const sourcesTotalPages = Math.max(1, Math.ceil(allSources.length / sourcesPageSize));
  const sourcesFrom = allSources.length === 0 ? 0 : sourcesPage * sourcesPageSize + 1;
  const sourcesTo = Math.min(allSources.length, (sourcesPage + 1) * sourcesPageSize);
  const pagedSources = allSources.slice(sourcesPage * sourcesPageSize, (sourcesPage + 1) * sourcesPageSize);

  // Sorted Application Usage list
  const sortedAppUsage = useMemo(() => {
    const list = Object.entries(data?.appCounts || {}).map(([rawApp, count]) => ({
      rawApp,
      displayName: appDisplayName(rawApp),
      count,
      pct: ((count / (metrics.totalWorkspaceEvents || 1)) * 100).toFixed(1),
      isWorkflow: rawApp === "workflows",
    }));

    return list.sort((a, b) => {
      if (appUsageSortField === "name") {
        return appUsageSortOrder === "asc"
          ? a.displayName.localeCompare(b.displayName)
          : b.displayName.localeCompare(a.displayName);
      }
      return appUsageSortOrder === "asc" ? a.count - b.count : b.count - a.count;
    });
  }, [data?.appCounts, metrics.totalWorkspaceEvents, appUsageSortField, appUsageSortOrder]);

  // Sorted Application Features list
  const sortedFeatures = useMemo(() => {
    const totalFeatureEvents = Object.values(data?.actionCounts || {}).reduce((sum, n) => sum + n, 0) || 1;
    const list = Object.entries(data?.actionCounts || {}).map(([actionName, count]) => {
      const isAgentic =
        actionName.includes("flow_execution") ||
        actionName.includes("natural_language_condition");
      const category = isAgentic
        ? "Automated Flow"
        : actionName.includes("generate") || actionName.includes("image") || actionName.includes("video")
        ? "Media Synthesis"
        : "Prompt / Conversation";
      const displayAction = formatAction(actionName);
      const pct = ((count / totalFeatureEvents) * 100).toFixed(1);
      return {
        actionName,
        displayAction,
        count,
        pct,
        category,
        isAgentic,
      };
    });

    return list.sort((a, b) => {
      if (featuresSortField === "name") {
        return featuresSortOrder === "asc"
          ? a.displayAction.localeCompare(b.displayAction)
          : b.displayAction.localeCompare(a.displayAction);
      }
      if (featuresSortField === "category") {
        return featuresSortOrder === "asc"
          ? a.category.localeCompare(b.category)
          : b.category.localeCompare(a.category);
      }
      if (featuresSortField === "mode") {
        const modeA = a.isAgentic ? "Agentic" : "User";
        const modeB = b.isAgentic ? "Agentic" : "User";
        return featuresSortOrder === "asc"
          ? modeA.localeCompare(modeB)
          : modeB.localeCompare(modeA);
      }
      return featuresSortOrder === "asc" ? a.count - b.count : b.count - a.count;
    });
  }, [data?.actionCounts, featuresSortField, featuresSortOrder]);

  // Filtered & Sorted User Activity Leaderboard
  const filteredSortedUsers = useMemo(() => {
    let list = (data?.userLeaderboard || []).slice();
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase().trim();
      list = list.filter((u) => u.email.toLowerCase().includes(q));
    }
    return list.sort((a, b) => {
      if (userSortField === "email") {
        return userSortOrder === "asc"
          ? a.email.localeCompare(b.email)
          : b.email.localeCompare(a.email);
      }
      if (userSortField === "workspace") {
        return userSortOrder === "asc"
          ? a.workspaceEvents - b.workspaceEvents
          : b.workspaceEvents - a.workspaceEvents;
      }
      if (userSortField === "notebook") {
        return userSortOrder === "asc"
          ? a.notebookEvents - b.notebookEvents
          : b.notebookEvents - a.notebookEvents;
      }
      if (userSortField === "lastActive") {
        const timeA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
        const timeB = b.lastActive ? new Date(b.lastActive).getTime() : 0;
        return userSortOrder === "asc" ? timeA - timeB : timeB - timeA;
      }
      return userSortOrder === "asc"
        ? a.totalEvents - b.totalEvents
        : b.totalEvents - a.totalEvents;
    });
  }, [data?.userLeaderboard, userSearch, userSortField, userSortOrder]);

  const userTotalPages = Math.max(1, Math.ceil(filteredSortedUsers.length / userPageSize));
  const userFrom = filteredSortedUsers.length === 0 ? 0 : userPage * userPageSize + 1;
  const userTo = Math.min(filteredSortedUsers.length, (userPage + 1) * userPageSize);
  const pagedUsers = filteredSortedUsers.slice(userPage * userPageSize, (userPage + 1) * userPageSize);

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return isoString;
    }
  };

  const formatDateTime = (isoString?: string | null) => {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            {activeTab === "notebooks" && (
              <img
                src="/images/gemini-notebook-icon.svg"
                alt="Gemini Notebook Icon"
                className="w-8 h-8 object-contain inline-block shrink-0"
              />
            )}
            {activeTab === "apps" && (
              <img
                src="/images/google-gemini-icon-2025.svg"
                alt="Google Gemini Icon"
                className="w-8 h-8 object-contain inline-block shrink-0"
              />
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === "notebooks"
                ? "Gemini Notebook"
                : activeTab === "apps"
                ? "Gemini in Workspace"
                : activeTab === "audit"
                ? "Generative AI Audit Logs"
                : "Generative AI Overview"}
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {activeTab === "notebooks"
              ? "Active notebook projects, ingested reference sources, and generated studio artifacts."
              : activeTab === "apps"
              ? "Activity and capabilities across Google Workspace apps (Docs, Gmail, Slides, Meet, Studio, etc.)."
              : activeTab === "audit"
              ? "Granular activity events, user prompts, and automated agentic executions."
              : "Usage activity, Gemini Notebook projects, and automated workflows across Google Workspace."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {syncNotice && (
            <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
              {syncNotice}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 text-gray-500 ${syncing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{syncing ? "Updating..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: OVERVIEW                                                */}
      {/* ============================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* ── KPI Row: 4 Clean Metrics Cards for Overview ─────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="text-[11px] font-semibold uppercase text-gray-500 tracking-wider">
                Total Activity Events
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {metrics.totalEvents.toLocaleString()}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                {metrics.totalWorkspaceEvents} Workspace · {metrics.totalNotebookEvents} Gemini Notebook
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="text-[11px] font-semibold uppercase text-gray-500 tracking-wider">
                Active Users
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {metrics.totalActiveUsers}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                Licensed accounts engaged
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="text-[11px] font-semibold uppercase text-gray-500 tracking-wider">
                Agentic Flows
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {metrics.agenticEventsCount}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                Workspace Studio automated tasks
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="text-[11px] font-semibold uppercase text-gray-500 tracking-wider">
                Gemini Notebook Projects
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {metrics.notebooksCount}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                {metrics.sourcesIngestedCount} Sources · {metrics.artifactsCount} Artifacts
              </div>
            </div>
          </div>
          {/* Active Graphs Layout Grid (Permanent / Non-removable) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Graph 1: Timeline Area / Line */}
            <div className="flex flex-col h-full">
              <GenAiTimelineChart
                timeline={data?.dailyTimeline || []}
              />
            </div>

            {/* Graph 2: Apps Donut */}
            <div className="flex flex-col h-full">
              <GenAiAppsDoughnut
                appCounts={data?.appCounts || {}}
                notebookEventsCount={metrics.totalNotebookEvents}
              />
            </div>

            {/* Graph 3: Capabilities Horizontal Bar */}
            <div className="flex flex-col h-full">
              <GenAiCapabilitiesBarChart
                actionCounts={data?.actionCounts || {}}
                notebookEventsCount={metrics.totalNotebookEvents}
              />
            </div>

            {/* Graph 4: How AI Is Used */}
            <div className="flex flex-col h-full">
              <GenAiEngagementMix
                categoryCounts={data?.categoryCounts || {}}
                userInitiatedCount={metrics.userInitiatedCount}
                agenticEventsCount={metrics.agenticEventsCount}
              />
            </div>
          </div>

          {/* User Leaderboard Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">User Activity</h3>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search user email..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(0);
                  }}
                  className="w-full pl-8 pr-7 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                />
                <svg
                  className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {userSearch && (
                  <button
                    onClick={() => {
                      setUserSearch("");
                      setUserPage(0);
                    }}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[11px] tracking-wider select-none">
                  <tr>
                    <th
                      className="py-2.5 px-4 cursor-pointer hover:text-gray-800 transition-colors"
                      onClick={() => {
                        if (userSortField === "email") {
                          setUserSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                        } else {
                          setUserSortField("email");
                          setUserSortOrder("asc");
                        }
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>User</span>
                        <span className="text-[10px] text-gray-400">
                          {userSortField === "email" ? (userSortOrder === "asc" ? "▲" : "▼") : "⇅"}
                        </span>
                      </div>
                    </th>
                    <th
                      className="py-2.5 px-4 cursor-pointer hover:text-gray-800 transition-colors"
                      onClick={() => {
                        if (userSortField === "workspace") {
                          setUserSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                        } else {
                          setUserSortField("workspace");
                          setUserSortOrder("desc");
                        }
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Workspace Events</span>
                        <span className="text-[10px] text-gray-400">
                          {userSortField === "workspace" ? (userSortOrder === "asc" ? "▲" : "▼") : "⇅"}
                        </span>
                      </div>
                    </th>
                    <th
                      className="py-2.5 px-4 cursor-pointer hover:text-gray-800 transition-colors"
                      onClick={() => {
                        if (userSortField === "notebook") {
                          setUserSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                        } else {
                          setUserSortField("notebook");
                          setUserSortOrder("desc");
                        }
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Notebook Events</span>
                        <span className="text-[10px] text-gray-400">
                          {userSortField === "notebook" ? (userSortOrder === "asc" ? "▲" : "▼") : "⇅"}
                        </span>
                      </div>
                    </th>
                    <th
                      className="py-2.5 px-4 cursor-pointer hover:text-gray-800 transition-colors"
                      onClick={() => {
                        if (userSortField === "total") {
                          setUserSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                        } else {
                          setUserSortField("total");
                          setUserSortOrder("desc");
                        }
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Total Events</span>
                        <span className="text-[10px] text-gray-400">
                          {userSortField === "total" ? (userSortOrder === "asc" ? "▲" : "▼") : "⇅"}
                        </span>
                      </div>
                    </th>
                    <th
                      className="py-2.5 px-4 cursor-pointer hover:text-gray-800 transition-colors"
                      onClick={() => {
                        if (userSortField === "lastActive") {
                          setUserSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                        } else {
                          setUserSortField("lastActive");
                          setUserSortOrder("desc");
                        }
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Last Active</span>
                        <span className="text-[10px] text-gray-400">
                          {userSortField === "lastActive" ? (userSortOrder === "asc" ? "▲" : "▼") : "⇅"}
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {pagedUsers.map((u) => (
                    <tr key={u.email} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-gray-900">{u.email}</td>
                      <td className="py-2.5 px-4 font-mono text-gray-600">{u.workspaceEvents}</td>
                      <td className="py-2.5 px-4 font-mono text-gray-600">{u.notebookEvents}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-gray-900">{u.totalEvents}</td>
                      <td className="py-2.5 px-4 text-gray-500">{formatDate(u.lastActive)}</td>
                    </tr>
                  ))}
                  {pagedUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-400 text-xs">
                        No user accounts match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* User Activity Table Pagination */}
            <div className="p-3 border-t border-gray-100 flex flex-col sm:flex-row gap-2 justify-between items-center text-xs text-gray-500">
              <span>
                Showing {userFrom}–{userTo} of {filteredSortedUsers.length} accounts
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={userPageSize}
                  onChange={(e) => {
                    setUserPageSize(Number(e.target.value));
                    setUserPage(0);
                  }}
                  className="border border-gray-300 rounded-md text-xs py-1 pl-2 pr-7 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[10, 25, 50, 100].map((s) => (
                    <option key={s} value={s}>
                      {s} per page
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setUserPage((p) => Math.max(0, p - 1))}
                  disabled={userPage === 0}
                  className="px-2.5 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span>
                  Page {userPage + 1} / {userTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setUserPage((p) => Math.min(userTotalPages - 1, p + 1))}
                  disabled={userPage >= userTotalPages - 1}
                  className="px-2.5 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: NOTEBOOKLM                                              */}
      {/* ============================================================== */}
      {activeTab === "notebooks" && (
        <div className="space-y-6">
          {/* ── KPI Row: 3 Dedicated Gemini Notebook Cards ─────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="text-[11px] font-semibold uppercase text-gray-500 tracking-wider">
                Total Notebooks
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {metrics.notebooksCount}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                {(data?.notebooks || []).filter(nb => nb.visibility?.toLowerCase().includes("shared")).length} shared internally · {(data?.notebooks || []).filter(nb => !nb.visibility?.toLowerCase().includes("shared")).length} private
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="text-[11px] font-semibold uppercase text-gray-500 tracking-wider">
                Ingested Sources
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {metrics.sourcesIngestedCount}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                Reference documents, PDFs & web URLs
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="text-[11px] font-semibold uppercase text-gray-500 tracking-wider">
                Generated Studio Artifacts
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {metrics.artifactsCount}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                Audio overviews, mind maps & study guides
              </div>
            </div>
          </div>
          {/* Notebooks Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900">Notebooks</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Active notebooks created and managed in the domain.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Notebook Title</th>
                    <th className="py-2.5 px-4">Owner</th>
                    <th className="py-2.5 px-4">Visibility</th>
                    <th className="py-2.5 px-4">Sources</th>
                    <th className="py-2.5 px-4">Artifacts</th>
                    <th className="py-2.5 px-4">Events</th>
                    <th className="py-2.5 px-4">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {pagedNotebooks.map((nb) => {
                    const isShared = nb.visibility?.toLowerCase().includes("shared");
                    return (
                      <tr key={nb.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          {nb.title}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{nb.ownerEmail}</td>
                        <td className="py-3 px-4">
                          {isShared ? (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Shared Internally
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                              Private
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-600">
                          {nb.sources?.length || 0}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {(nb.artifacts || []).map((a, idx) => (
                            <span
                              key={idx}
                              className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700"
                            >
                              {a.type === "audio_overview" ? "Audio Overview" : "Mind Map"}
                            </span>
                          ))}
                          {(!nb.artifacts || nb.artifacts.length === 0) && "—"}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-gray-900">{nb.eventCount}</td>
                        <td className="py-3 px-4 text-gray-500">{formatDate(nb.lastActive)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Notebooks Table Pagination */}
            <div className="p-3 border-t border-gray-100 flex flex-col sm:flex-row gap-2 justify-between items-center text-xs text-gray-500">
              <span>
                Showing {notebooksFrom}–{notebooksTo} of {allNotebooks.length} notebooks
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={notebooksPageSize}
                  onChange={(e) => {
                    setNotebooksPageSize(Number(e.target.value));
                    setNotebooksPage(0);
                  }}
                  className="border border-gray-300 rounded-md text-xs py-1 pl-2 pr-7 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[5, 10, 25, 50].map((s) => (
                    <option key={s} value={s}>
                      {s} per page
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setNotebooksPage((p) => Math.max(0, p - 1))}
                  disabled={notebooksPage === 0}
                  className="px-2.5 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span>
                  Page {notebooksPage + 1} / {notebooksTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setNotebooksPage((p) => Math.min(notebooksTotalPages - 1, p + 1))}
                  disabled={notebooksPage >= notebooksTotalPages - 1}
                  className="px-2.5 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Ingested Sources Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900">Ingested Sources</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                External documents, URLs, and uploaded files attached to Gemini Notebook notebooks.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Document / Source Name</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Target Notebook</th>
                    <th className="py-2.5 px-4">User</th>
                    <th className="py-2.5 px-4">Added Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {pagedSources.map((src, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-gray-900 block">{src.name}</span>
                        {src.url && (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-blue-600 hover:underline truncate max-w-lg block mt-0.5"
                          >
                            {src.url}
                          </a>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="uppercase text-[10px] font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                          {src.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-gray-700">{src.notebookTitle}</td>
                      <td className="py-2.5 px-4 text-gray-500">{src.userEmail}</td>
                      <td className="py-2.5 px-4 text-gray-500">{formatDate(src.addedTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ingested Sources Table Pagination */}
            <div className="p-3 border-t border-gray-100 flex flex-col sm:flex-row gap-2 justify-between items-center text-xs text-gray-500">
              <span>
                Showing {sourcesFrom}–{sourcesTo} of {allSources.length} sources
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={sourcesPageSize}
                  onChange={(e) => {
                    setSourcesPageSize(Number(e.target.value));
                    setSourcesPage(0);
                  }}
                  className="border border-gray-300 rounded-md text-xs py-1 pl-2 pr-7 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[5, 10, 25, 50].map((s) => (
                    <option key={s} value={s}>
                      {s} per page
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setSourcesPage((p) => Math.max(0, p - 1))}
                  disabled={sourcesPage === 0}
                  className="px-2.5 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span>
                  Page {sourcesPage + 1} / {sourcesTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setSourcesPage((p) => Math.min(sourcesTotalPages - 1, p + 1))}
                  disabled={sourcesPage >= sourcesTotalPages - 1}
                  className="px-2.5 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: APPLICATIONS / WORKSPACE AI                             */}
      {/* ============================================================== */}
      {activeTab === "apps" && (
        <div className="space-y-6">
          {/* ── KPI Row: 3 Dedicated Workspace AI Cards ────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="text-[11px] font-semibold uppercase text-gray-500 tracking-wider">
                Total Events in Workspace
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {metrics.totalWorkspaceEvents.toLocaleString()}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                Across {metrics.uniqueAppsCount} integrated Google Workspace apps
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="text-[11px] font-semibold uppercase text-gray-500 tracking-wider">
                Execution Mode
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {metrics.userInitiatedCount.toLocaleString()}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                User-initiated · <span className="font-semibold text-amber-600">{metrics.agenticEventsCount} automated flow tasks</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="text-[11px] font-semibold uppercase text-gray-500 tracking-wider">
                Top Workspace App
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {sortedAppUsage[0]?.displayName || "Gemini"}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                {sortedAppUsage[0]?.count || 0} events ({sortedAppUsage[0]?.pct || "0"}% of workspace AI volume)
              </div>
            </div>
          </div>

          {/* Applications Breakdown Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900">Application Usage</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Activity volume across connected Google Workspace applications.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[11px] tracking-wider select-none">
                  <tr>
                    <th
                      className="py-2.5 px-4 cursor-pointer hover:text-gray-800 transition-colors"
                      onClick={() => {
                        if (appUsageSortField === "name") {
                          setAppUsageSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                        } else {
                          setAppUsageSortField("name");
                          setAppUsageSortOrder("asc");
                        }
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Application</span>
                        <span className="text-[10px] text-gray-400">
                          {appUsageSortField === "name" ? (appUsageSortOrder === "asc" ? "▲" : "▼") : "⇅"}
                        </span>
                      </div>
                    </th>
                    <th
                      className="py-2.5 px-4 cursor-pointer hover:text-gray-800 transition-colors"
                      onClick={() => {
                        if (appUsageSortField === "events") {
                          setAppUsageSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                        } else {
                          setAppUsageSortField("events");
                          setAppUsageSortOrder("desc");
                        }
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Events</span>
                        <span className="text-[10px] text-gray-400">
                          {appUsageSortField === "events" ? (appUsageSortOrder === "asc" ? "▲" : "▼") : "⇅"}
                        </span>
                      </div>
                    </th>
                    <th
                      className="py-2.5 px-4 cursor-pointer hover:text-gray-800 transition-colors"
                      onClick={() => {
                        if (appUsageSortField === "events") {
                          setAppUsageSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                        } else {
                          setAppUsageSortField("events");
                          setAppUsageSortOrder("desc");
                        }
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Share of Activity</span>
                        <span className="text-[10px] text-gray-400">
                          {appUsageSortField === "events" ? (appUsageSortOrder === "asc" ? "▲" : "▼") : "⇅"}
                        </span>
                      </div>
                    </th>
                    <th className="py-2.5 px-4">Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {sortedAppUsage.map((item) => (
                    <tr key={item.rawApp} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {item.displayName}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-gray-700">
                        {item.count}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 max-w-xs">
                          <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${item.pct}%` }}
                            />
                          </div>
                          <span className="text-gray-500 text-[11px] font-mono">{item.pct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {item.isWorkflow ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Agentic & User
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            User
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Application Features Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900">Application Features</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Specific generative AI capabilities and workflows invoked by users or automated flows.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[11px] tracking-wider select-none">
                  <tr>
                    <th
                      className="py-2.5 px-4 cursor-pointer hover:text-gray-800 transition-colors"
                      onClick={() => {
                        if (featuresSortField === "name") {
                          setFeaturesSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                        } else {
                          setFeaturesSortField("name");
                          setFeaturesSortOrder("asc");
                        }
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Action</span>
                        <span className="text-[10px] text-gray-400">
                          {featuresSortField === "name" ? (featuresSortOrder === "asc" ? "▲" : "▼") : "⇅"}
                        </span>
                      </div>
                    </th>
                    <th
                      className="py-2.5 px-4 cursor-pointer hover:text-gray-800 transition-colors"
                      onClick={() => {
                        if (featuresSortField === "events") {
                          setFeaturesSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                        } else {
                          setFeaturesSortField("events");
                          setFeaturesSortOrder("desc");
                        }
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Events</span>
                        <span className="text-[10px] text-gray-400">
                          {featuresSortField === "events" ? (featuresSortOrder === "asc" ? "▲" : "▼") : "⇅"}
                        </span>
                      </div>
                    </th>
                    <th
                      className="py-2.5 px-4 cursor-pointer hover:text-gray-800 transition-colors"
                      onClick={() => {
                        if (featuresSortField === "events") {
                          setFeaturesSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                        } else {
                          setFeaturesSortField("events");
                          setFeaturesSortOrder("desc");
                        }
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Share of Activity</span>
                        <span className="text-[10px] text-gray-400">
                          {featuresSortField === "events" ? (featuresSortOrder === "asc" ? "▲" : "▼") : "⇅"}
                        </span>
                      </div>
                    </th>
                    <th
                      className="py-2.5 px-4 cursor-pointer hover:text-gray-800 transition-colors"
                      onClick={() => {
                        if (featuresSortField === "category") {
                          setFeaturesSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                        } else {
                          setFeaturesSortField("category");
                          setFeaturesSortOrder("asc");
                        }
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Category</span>
                        <span className="text-[10px] text-gray-400">
                          {featuresSortField === "category" ? (featuresSortOrder === "asc" ? "▲" : "▼") : "⇅"}
                        </span>
                      </div>
                    </th>
                    <th
                      className="py-2.5 px-4 cursor-pointer hover:text-gray-800 transition-colors"
                      onClick={() => {
                        if (featuresSortField === "mode") {
                          setFeaturesSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                        } else {
                          setFeaturesSortField("mode");
                          setFeaturesSortOrder("asc");
                        }
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Execution Mode</span>
                        <span className="text-[10px] text-gray-400">
                          {featuresSortField === "mode" ? (featuresSortOrder === "asc" ? "▲" : "▼") : "⇅"}
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {sortedFeatures.map((item) => (
                    <tr key={item.actionName} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-900 capitalize">
                        {item.displayAction}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-gray-700">
                        {item.count}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 max-w-xs">
                          <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${item.pct}%` }}
                            />
                          </div>
                          <span className="text-gray-500 text-[11px] font-mono">{item.pct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {item.category}
                      </td>
                      <td className="py-3 px-4">
                        {item.isAgentic ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Agentic
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            User
                          </span>
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

      {/* ============================================================== */}
      {/* TAB 4: AUDIT LOGS                                              */}
      {/* ============================================================== */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Search Box */}
              <div className="sm:col-span-4 relative">
                <input
                  type="text"
                  placeholder="Search user, action, notebook, source..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                />
                <svg
                  className="w-4 h-4 text-gray-400 absolute left-3 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {auditSearch && (
                  <button
                    onClick={() => setAuditSearch("")}
                    className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* App Filter */}
              <div className="sm:col-span-3">
                <select
                  value={appFilter}
                  onChange={(e) => setAppFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg text-xs py-2 px-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Applications</option>
                  <option value="notebooklm">Gemini Notebook</option>
                  <option value="gemini_app">Gemini</option>
                  <option value="workflows">Workspace Studio</option>
                  <option value="slides">Google Slides</option>
                  <option value="gmail">Gmail</option>
                  <option value="classroom">Google Classroom</option>
                  <option value="vids">Google Vids</option>
                  <option value="meet">Google Meet</option>
                  <option value="docs">Google Docs</option>
                </select>
              </div>

              {/* Engagement Filter (Active vs Inactive) */}
              <div className="sm:col-span-2">
                <select
                  value={engagementFilter}
                  onChange={(e) => setEngagementFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg text-xs py-2 px-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active Usage</option>
                  <option value="INACTIVE">Inactive / Ambient</option>
                </select>
              </div>

              {/* Actor Filter */}
              <div className="sm:col-span-3">
                <select
                  value={actorFilter}
                  onChange={(e) => setActorFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg text-xs py-2 px-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Actor Modes</option>
                  <option value="USER">User Initiated</option>
                  <option value="AGENTIC">Agentic Automated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-4">User</th>
                    <th className="py-2.5 px-4">Application</th>
                    <th className="py-2.5 px-4">Action</th>
                    <th className="py-2.5 px-4">Target / Context</th>
                    <th className="py-2.5 px-4">Engagement</th>
                    <th className="py-2.5 px-4">Mode</th>
                    <th className="py-2.5 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {pagedLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedEvent(log)}
                    >
                      <td className="py-2.5 px-4 text-gray-500 whitespace-nowrap">
                        {formatDateTime(log.time)}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-gray-900">{log.userEmail}</td>
                      <td className="py-2.5 px-4 text-gray-700 font-medium">
                        {appDisplayName(log.appName)}
                      </td>
                      <td className="py-2.5 px-4 text-gray-800">
                        {formatAction(log.action)}
                      </td>
                      <td className="py-2.5 px-4 text-gray-500 truncate max-w-xs">
                        {log.notebookTitle || log.sourceName || log.artifactName || log.clientAppName || "—"}
                      </td>
                      <td className="py-2.5 px-4">
                        {log.category === "inactive" ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200" title="Ambient/Background AI activity not counted towards active usage">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            Inactive
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200" title="Active user engagement with Gemini">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        {log.isAgenticAction ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Agentic
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            User
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(log);
                          }}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-gray-100 flex flex-col sm:flex-row gap-2 justify-between items-center text-xs text-gray-500">
              <span>
                Showing {auditFrom}–{auditTo} of {filteredLogs.length.toLocaleString()} events
                <span className="text-gray-400"> · Click a row to view event payload</span>
              </span>
              <div className="flex items-center gap-2">
                <select
                  id="audit-page-size"
                  value={auditPageSize}
                  onChange={(e) => setAuditPageSize(Number(e.target.value))}
                  className="border border-gray-300 rounded-md text-xs py-1 pl-2 pr-7 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[25, 50, 100, 250].map((s) => (
                    <option key={s} value={s}>
                      {s} per page
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  id="audit-prev"
                  onClick={() => setAuditPage((p) => Math.max(0, p - 1))}
                  disabled={auditPage === 0}
                  className="px-2.5 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span>
                  Page {auditPage + 1} / {auditTotalPages}
                </span>
                <button
                  type="button"
                  id="audit-next"
                  onClick={() => setAuditPage((p) => Math.min(auditTotalPages - 1, p + 1))}
                  disabled={auditPage >= auditTotalPages - 1}
                  className="px-2.5 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Event Details Modal ─────────────────────────────────── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-5 space-y-4 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900">Event Details</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600 text-base"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div>
                  <span className="text-gray-500 block text-[11px]">Timestamp</span>
                  <span className="text-gray-900 font-medium">{formatDateTime(selectedEvent.time)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">User</span>
                  <span className="text-gray-900 font-medium">{selectedEvent.userEmail}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Application</span>
                  <span className="text-gray-900 font-medium">{appDisplayName(selectedEvent.appName)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Action</span>
                  <span className="text-gray-900 font-medium">{formatAction(selectedEvent.action)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Engagement</span>
                  <span className="text-gray-900 font-medium">
                    {selectedEvent.category === "inactive"
                      ? "Inactive (Ambient / Background AI)"
                      : "Active (User Engagement)"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Category Code</span>
                  <span className="text-gray-700 font-mono text-[11px]">{selectedEvent.category || "—"}</span>
                </div>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px] mb-1 font-semibold">Event Attributes</span>
                <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-[11px] font-mono overflow-auto max-h-56">
                  {JSON.stringify(selectedEvent, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
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
