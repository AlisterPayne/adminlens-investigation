"use client";

import React, { useState, useMemo } from "react";
import { GoogleAdminIcon, GoogleProductIcon } from "@/components/google-icons";

export interface TimelineEvent {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorName?: string;
  eventType: string; // e.g. "CHANGE_APPLICATION_SETTING", "AUTHORIZE_APPLICATION", "BLOCK_APPLICATION"
  actionName: string;
  appName: string;
  appId?: string;
  clientId?: string;
  appIconUrl?: string;
  oldPolicy?: string;
  newPolicy?: string;
  orgUnit?: string;
  details?: string;
  rawParameters?: any[];
}

interface AccessTimelineViewProps {
  events?: TimelineEvent[];
  domainName?: string;
  onRefresh?: () => void;
}

export default function AccessTimelineView({
  events = [],
  domainName = "gafe.co.za",
  onRefresh,
}: AccessTimelineViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("ALL");
  const [selectedAdmin, setSelectedAdmin] = useState<string>("ALL");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("ALL");
  const [expandedEventIds, setExpandedEventIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedEventIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Extract unique admins for filter
  const uniqueAdmins = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.actorEmail) set.add(e.actorEmail);
    });
    return Array.from(set).sort();
  }, [events]);

  // Extract unique action types
  const uniqueActions = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.newPolicy) set.add(e.newPolicy);
      if (e.eventType) set.add(e.eventType);
    });
    return Array.from(set).sort();
  }, [events]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        ev.appName?.toLowerCase().includes(term) ||
        ev.actorEmail?.toLowerCase().includes(term) ||
        ev.clientId?.toLowerCase().includes(term) ||
        ev.details?.toLowerCase().includes(term);

      const matchesAdmin = selectedAdmin === "ALL" || ev.actorEmail === selectedAdmin;

      const matchesAction =
        selectedAction === "ALL" ||
        ev.newPolicy === selectedAction ||
        ev.eventType === selectedAction;

      let matchesTime = true;
      if (selectedTimeRange !== "ALL" && ev.timestamp) {
        const evDate = new Date(ev.timestamp).getTime();
        const now = Date.now();
        const days = (now - evDate) / (1000 * 60 * 60 * 24);
        if (selectedTimeRange === "7D") matchesTime = days <= 7;
        else if (selectedTimeRange === "30D") matchesTime = days <= 30;
        else if (selectedTimeRange === "90D") matchesTime = days <= 90;
        else if (selectedTimeRange === "180D") matchesTime = days <= 180;
      }

      return matchesSearch && matchesAdmin && matchesAction && matchesTime;
    });
  }, [events, searchTerm, selectedAdmin, selectedAction, selectedTimeRange]);

  // KPI Metrics
  const metrics = useMemo(() => {
    const totalEvents = events.length;
    const uniqueApps = new Set(events.map((e) => e.appId || e.clientId || e.appName).filter(Boolean)).size;
    const policyBlocks = events.filter((e) => e.newPolicy?.toUpperCase() === "BLOCKED").length;
    const policyTrusted = events.filter((e) => e.newPolicy?.toUpperCase() === "TRUSTED").length;
    const adminCount = uniqueAdmins.length;
    return { totalEvents, uniqueApps, policyBlocks, policyTrusted, adminCount };
  }, [events, uniqueAdmins]);

  // Group events by Relative Date (Today, Yesterday, Date header)
  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: TimelineEvent[] } = {};
    const sorted = [...filteredEvents].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    sorted.forEach((e) => {
      const date = new Date(e.timestamp);
      let dateKey = "Earlier";
      if (!isNaN(date.getTime())) {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
          dateKey = "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
          dateKey = "Yesterday";
        } else {
          dateKey = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        }
      }
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(e);
    });

    return groups;
  }, [filteredEvents]);

  const getPolicyBadge = (policy?: string) => {
    switch (policy?.toUpperCase()) {
      case "BLOCKED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Blocked
          </span>
        );
      case "TRUSTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Trusted
          </span>
        );
      case "LIMITED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Limited
          </span>
        );
      case "UNCONFIGURED":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
            {policy || "Unconfigured"}
          </span>
        );
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return ts;
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return ts;
    }
  };

  const getRelativeTime = (ts: string) => {
    try {
      const d = new Date(ts).getTime();
      const now = Date.now();
      const diffSec = Math.floor((now - d) / 1000);
      if (diffSec < 60) return "just now";
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      const diffDays = Math.floor(diffHr / 24);
      return `${diffDays}d ago`;
    } catch {
      return "";
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Informational Sub-header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50/60 via-slate-50 to-white p-4.5 rounded-2xl border border-blue-200/80 shadow-2xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">
                Continuous Access Policy &amp; Audit Timeline
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                180-Day Lookback + Permanent Retention
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Tracks administrative App Access Control decisions, policy changes (Trusted, Blocked, Limited), and OAuth grant lifecycles for <strong className="font-mono text-gray-700">{domainName}</strong>.
            </p>
          </div>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg shadow-2xs transition-colors shrink-0"
          >
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync Audit Logs
          </button>
        )}
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold uppercase text-gray-400">Total Audit Events</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalEvents.toLocaleString()}</div>
          <div className="text-[11px] text-gray-500 mt-1">Archived in database</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold uppercase text-emerald-700">Trusted Authorizations</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{metrics.policyTrusted.toLocaleString()}</div>
          <div className="text-[11px] text-gray-500 mt-1">Access permitted</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold uppercase text-rose-700">Blocked Policy Actions</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{metrics.policyBlocks.toLocaleString()}</div>
          <div className="text-[11px] text-gray-500 mt-1">Restricted or revoked</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold uppercase text-purple-700">Active Admins</div>
          <div className="text-2xl font-bold text-purple-700 mt-1">{metrics.adminCount}</div>
          <div className="text-[11px] text-gray-500 mt-1">Policy decision makers</div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <input
              type="text"
              placeholder="Search by app name, admin email, client ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Action Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full py-2 px-3 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Policy Actions</option>
              <option value="TRUSTED">🛡️ Trusted</option>
              <option value="BLOCKED">🚫 Blocked</option>
              <option value="LIMITED">🔹 Limited</option>
              <option value="CHANGE_APPLICATION_SETTING">⚙️ Setting Changed</option>
            </select>
          </div>

          {/* Admin Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedAdmin}
              onChange={(e) => setSelectedAdmin(e.target.value)}
              className="w-full py-2 px-3 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Administrators</option>
              {uniqueAdmins.map((adm) => (
                <option key={adm} value={adm}>
                  {adm}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="w-full py-2 px-3 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All History</option>
              <option value="7D">Last 7 Days</option>
              <option value="30D">Last 30 Days</option>
              <option value="90D">Last 90 Days</option>
              <option value="180D">180-Day API Window</option>
            </select>
          </div>
        </div>

        {/* Filter Reset */}
        {(searchTerm || selectedAction !== "ALL" || selectedAdmin !== "ALL" || selectedTimeRange !== "ALL") && (
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>
              Showing <strong>{filteredEvents.length}</strong> matching timeline records
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedAction("ALL");
                setSelectedAdmin("ALL");
                setSelectedTimeRange("ALL");
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Main Timeline Stream */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto mb-3.5 shadow-2xs">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900">
            No Historical Access Changes Recorded Yet
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 leading-relaxed">
            Once the Google Workspace Admin Reports API extraction runs, up to 180 days of administrative access policy changes (Trusted, Blocked, Limited) and token grant events will be automatically ingested and archived here permanently.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([dateLabel, dateEvents]) => (
            <div key={dateLabel} className="space-y-3">
              {/* Date Group Heading */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
                  📅 {dateLabel}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[11px] font-mono text-gray-400">
                  {dateEvents.length} {dateEvents.length === 1 ? "event" : "events"}
                </span>
              </div>

              {/* Timeline Items */}
              <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {dateEvents.map((ev) => {
                  const isExpanded = expandedEventIds.has(ev.id);
                  const isBlock = ev.newPolicy?.toUpperCase() === "BLOCKED";
                  const isTrust = ev.newPolicy?.toUpperCase() === "TRUSTED";

                  return (
                    <div
                      key={ev.id}
                      className="relative bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs hover:border-gray-300 transition-all group"
                    >
                      {/* Timeline node icon */}
                      <div
                        className={`absolute -left-6 sm:-left-8 top-5 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center shrink-0 -translate-x-1/2 ${
                          isBlock
                            ? "border-rose-500 text-rose-600 ring-4 ring-rose-50"
                            : isTrust
                            ? "border-emerald-500 text-emerald-600 ring-4 ring-emerald-50"
                            : "border-blue-500 text-blue-600 ring-4 ring-blue-50"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            isBlock
                              ? "bg-rose-500"
                              : isTrust
                              ? "bg-emerald-500"
                              : "bg-blue-500"
                          }`}
                        />
                      </div>

                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              ev.appIconUrl ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                ev.appName || "App"
                              )}&background=3B82F6&color=fff&size=64`
                            }
                            alt=""
                            className="w-8 h-8 rounded-lg object-contain bg-white border border-gray-200 p-0.5 shrink-0"
                            onError={(e: any) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                ev.appName || "App"
                              )}&background=3B82F6&color=fff&size=64`;
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 text-sm">
                                {ev.appName || "Unnamed Application"}
                              </span>
                              {ev.newPolicy && getPolicyBadge(ev.newPolicy)}
                            </div>
                            <div className="text-[11px] font-mono text-gray-400 truncate max-w-xs sm:max-w-md">
                              {ev.clientId || ev.appId || "—"}
                            </div>
                          </div>
                        </div>

                        {/* Timestamp & Relative Badge */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between text-right">
                          <span className="text-xs font-semibold text-gray-700 font-mono">
                            {formatTimestamp(ev.timestamp)}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {getRelativeTime(ev.timestamp)}
                          </span>
                        </div>
                      </div>

                      {/* Content Row: Transition & Actor */}
                      <div className="pt-3 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                        {/* Policy Transition Details */}
                        <div className="sm:col-span-7 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-gray-500 font-medium">Policy Transition:</span>
                            {ev.oldPolicy ? (
                              <>
                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                  {ev.oldPolicy}
                                </span>
                                <span className="text-gray-400 font-bold select-none">➔</span>
                              </>
                            ) : null}
                            {getPolicyBadge(ev.newPolicy || "MODIFIED")}
                          </div>

                          {ev.orgUnit && (
                            <div className="text-[11px] text-gray-500">
                              Applied Scope: <span className="font-mono text-gray-700 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">{ev.orgUnit}</span>
                            </div>
                          )}

                          {ev.details && (
                            <div className="text-[11px] text-gray-600 mt-1 leading-snug">
                              {ev.details}
                            </div>
                          )}
                        </div>

                        {/* Administrator / Actor */}
                        <div className="sm:col-span-5 sm:border-l sm:border-gray-100 sm:pl-4 flex flex-col justify-center">
                          <div className="text-[11px] text-gray-400 uppercase font-semibold">
                            Modified By Admin
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                              {ev.actorEmail?.charAt(0).toUpperCase() || "A"}
                            </div>
                            <span className="text-xs font-mono font-semibold text-gray-800 truncate" title={ev.actorEmail}>
                              {ev.actorEmail || "Google Workspace Admin"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Technical Details Toggle */}
                      {ev.rawParameters && ev.rawParameters.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => toggleExpand(ev.id)}
                            className="text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <span>{isExpanded ? "Hide Audit Parameters ▲" : "View Raw Event Parameters ▼"}</span>
                          </button>

                          {isExpanded && (
                            <pre className="mt-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-mono text-gray-700 overflow-x-auto">
                              {JSON.stringify(ev.rawParameters, null, 2)}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
