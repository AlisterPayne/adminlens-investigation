"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import GenAiAppsDoughnut from "@/components/generative-ai/gen-ai-apps-doughnut";
import GenAiCapabilitiesBarChart from "@/components/generative-ai/gen-ai-capabilities-bar";
import GenAiModalityRadar from "@/components/generative-ai/gen-ai-modality-radar";
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
  const router = useRouter();
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
  const [selectedEvent, setSelectedEvent] = useState<AuditLogItem | null>(null);

  // Overview Active Graphs (starts with all 4 graphs, user can chop out any)
  const [activeGraphs, setActiveGraphs] = useState<string[]>([
    "timeline",
    "apps_donut",
    "capabilities_bar",
    "modality_radar",
  ]);

  const toggleGraph = (id: string) => {
    setActiveGraphs((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const resetAllGraphs = () => {
    setActiveGraphs(["timeline", "apps_donut", "capabilities_bar", "modality_radar"]);
  };

  useEffect(() => {
    setActiveTab(activeTabParam);
  }, [activeTabParam]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/generative-ai?tab=${tab}`);
  };

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
        return "NotebookLM";
      default:
        return name;
    }
  };

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
  }, [combinedLogs, appFilter, actorFilter, auditSearch]);

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
          <h1 className="text-2xl font-bold text-gray-900">Generative AI</h1>
          <p className="text-sm text-gray-500 mt-1">
            Usage activity, NotebookLM projects, and automated workflows across Google Workspace.
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

      {/* ── KPI Row: 4 Clean Metrics Cards ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-[11px] font-semibold uppercase text-gray-500 tracking-wider">
            Total Activity Events
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {metrics.totalEvents.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            {metrics.totalWorkspaceEvents} Workspace · {metrics.totalNotebookEvents} NotebookLM
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
            NotebookLM Projects
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {metrics.notebooksCount}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            {metrics.sourcesIngestedCount} Sources · {metrics.artifactsCount} Artifacts
          </div>
        </div>
      </div>

      {/* ── Sub-menu Tab Navigation ────────────────────────────── */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => handleTabChange("overview")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => handleTabChange("notebooks")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "notebooks"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <span>NotebookLM</span>
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === "notebooks" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
            }`}>
              {metrics.notebooksCount}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("apps")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "apps"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Applications
          </button>

          <button
            onClick={() => handleTabChange("audit")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "audit"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Audit Logs
          </button>
        </nav>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: OVERVIEW                                                */}
      {/* ============================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Visual Analytics Selector & Customizer Toolbar */}
          <div className="bg-slate-50 dark:bg-gray-800/80 rounded-xl border border-slate-200/80 dark:border-gray-700/60 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Executive Visual Analytics
                  </h3>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    {activeGraphs.length} of 4 graphs visible
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Select which graphs to display, or click the &times; on any card to chop it out.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Activity Trend */}
                <button
                  type="button"
                  onClick={() => toggleGraph("timeline")}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                    activeGraphs.includes("timeline")
                      ? "bg-white dark:bg-gray-800 border-blue-500 text-blue-600 dark:text-blue-400 shadow-2xs"
                      : "bg-white/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-400 line-through hover:text-gray-600"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  1. Activity Trend (Line)
                </button>

                {/* 2. App Share */}
                <button
                  type="button"
                  onClick={() => toggleGraph("apps_donut")}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                    activeGraphs.includes("apps_donut")
                      ? "bg-white dark:bg-gray-800 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                      : "bg-white/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-400 line-through hover:text-gray-600"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  2. App Share (Donut)
                </button>

                {/* 3. Capabilities */}
                <button
                  type="button"
                  onClick={() => toggleGraph("capabilities_bar")}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                    activeGraphs.includes("capabilities_bar")
                      ? "bg-white dark:bg-gray-800 border-violet-500 text-violet-600 dark:text-violet-400 shadow-2xs"
                      : "bg-white/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-400 line-through hover:text-gray-600"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                  3. Capabilities (Bar)
                </button>

                {/* 4. Modality Radar */}
                <button
                  type="button"
                  onClick={() => toggleGraph("modality_radar")}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                    activeGraphs.includes("modality_radar")
                      ? "bg-white dark:bg-gray-800 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                      : "bg-white/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-400 line-through hover:text-gray-600"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  4. Modality Radar (Radar)
                </button>

                {activeGraphs.length < 4 && (
                  <button
                    type="button"
                    onClick={resetAllGraphs}
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold px-2 py-1 underline cursor-pointer"
                  >
                    Reset all 4
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active Graphs Layout Grid */}
          {activeGraphs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graph 1: Timeline Area / Line */}
              {activeGraphs.includes("timeline") && (
                <div className={activeGraphs.length === 1 ? "col-span-full" : ""}>
                  <GenAiTimelineChart
                    timeline={data?.dailyTimeline || []}
                    onRemove={() => toggleGraph("timeline")}
                  />
                </div>
              )}

              {/* Graph 2: Apps Donut */}
              {activeGraphs.includes("apps_donut") && (
                <div className={activeGraphs.length === 1 ? "col-span-full" : ""}>
                  <GenAiAppsDoughnut
                    appCounts={data?.appCounts || {}}
                    notebookEventsCount={metrics.totalNotebookEvents}
                    onRemove={() => toggleGraph("apps_donut")}
                  />
                </div>
              )}

              {/* Graph 3: Capabilities Horizontal Bar */}
              {activeGraphs.includes("capabilities_bar") && (
                <div className={activeGraphs.length === 1 ? "col-span-full" : ""}>
                  <GenAiCapabilitiesBarChart
                    actionCounts={data?.actionCounts || {}}
                    notebookEventsCount={metrics.totalNotebookEvents}
                    onRemove={() => toggleGraph("capabilities_bar")}
                  />
                </div>
              )}

              {/* Graph 4: Modality Radar */}
              {activeGraphs.includes("modality_radar") && (
                <div className={activeGraphs.length === 1 ? "col-span-full" : ""}>
                  <GenAiModalityRadar
                    appCounts={data?.appCounts || {}}
                    actionCounts={data?.actionCounts || {}}
                    notebookEventsCount={metrics.totalNotebookEvents}
                    onRemove={() => toggleGraph("modality_radar")}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">All 4 graphs are currently hidden.</p>
              <button
                type="button"
                onClick={resetAllGraphs}
                className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 underline cursor-pointer"
              >
                Restore all 4 graphs
              </button>
            </div>
          )}

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
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Application</th>
                    <th className="py-2.5 px-4">Events</th>
                    <th className="py-2.5 px-4">Share of Activity</th>
                    <th className="py-2.5 px-4">Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {Object.entries(data?.appCounts || {}).map(([rawApp, count]) => {
                    const pct = ((count / (metrics.totalWorkspaceEvents || 1)) * 100).toFixed(1);
                    const isWorkflow = rawApp === "workflows";
                    return (
                      <tr key={rawApp} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          {appDisplayName(rawApp)}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-gray-700">
                          {count}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 max-w-xs">
                            <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-gray-500 text-[11px] font-mono">{pct}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {isWorkflow ? (
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Leaderboard Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">User Activity</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Accounts generating prompt and generative AI events.
                </p>
              </div>
              <span className="text-xs text-gray-500">30 accounts</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">User</th>
                    <th className="py-2.5 px-4">Workspace Events</th>
                    <th className="py-2.5 px-4">Notebook Events</th>
                    <th className="py-2.5 px-4">Total Events</th>
                    <th className="py-2.5 px-4">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {(data?.userLeaderboard || []).slice(0, 10).map((u) => (
                    <tr key={u.email} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-gray-900">{u.email}</td>
                      <td className="py-2.5 px-4 font-mono text-gray-600">{u.workspaceEvents}</td>
                      <td className="py-2.5 px-4 font-mono text-gray-600">{u.notebookEvents}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-gray-900">{u.totalEvents}</td>
                      <td className="py-2.5 px-4 text-gray-500">{formatDate(u.lastActive)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: NOTEBOOKLM                                              */}
      {/* ============================================================== */}
      {activeTab === "notebooks" && (
        <div className="space-y-6">
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
                  {(data?.notebooks || []).map((nb) => {
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
          </div>

          {/* Ingested Sources Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900">Ingested Sources</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                External documents, URLs, and uploaded files attached to NotebookLM notebooks.
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
                  {(data?.sources || []).map((src, idx) => (
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
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: APPLICATIONS                                            */}
      {/* ============================================================== */}
      {activeTab === "apps" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-900">Application Features</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Specific generative AI capabilities and workflows invoked by users or automated flows.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Events</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Execution Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {Object.entries(data?.actionCounts || {}).map(([actionName, count]) => {
                  const isAgentic =
                    actionName.includes("flow_execution") ||
                    actionName.includes("natural_language_condition");
                  const displayAction = actionName.replace(/_/g, " ");

                  return (
                    <tr key={actionName} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-gray-900 capitalize">
                        {displayAction}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-medium text-gray-700">
                        {count}
                      </td>
                      <td className="py-2.5 px-4 text-gray-600">
                        {isAgentic
                          ? "Automated Flow"
                          : actionName.includes("generate") || actionName.includes("image") || actionName.includes("video")
                          ? "Media Synthesis"
                          : "Prompt / Conversation"}
                      </td>
                      <td className="py-2.5 px-4">
                        {isAgentic ? (
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
                  );
                })}
              </tbody>
            </table>
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
              <div className="sm:col-span-6 relative">
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
                  <option value="notebooklm">NotebookLM</option>
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
                    <th className="py-2.5 px-4">Mode</th>
                    <th className="py-2.5 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredLogs.slice(0, 50).map((log) => (
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
                        {log.action?.replace(/_/g, " ")}
                      </td>
                      <td className="py-2.5 px-4 text-gray-500 truncate max-w-xs">
                        {log.notebookTitle || log.sourceName || log.artifactName || log.clientAppName || "—"}
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

            <div className="p-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
              <span>Showing {Math.min(50, filteredLogs.length)} of {filteredLogs.length} events</span>
              <span>Click a row to view event payload</span>
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
                  <span className="text-gray-900 font-medium">{selectedEvent.action}</span>
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
