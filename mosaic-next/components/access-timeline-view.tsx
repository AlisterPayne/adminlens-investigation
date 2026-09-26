"use client";

import React, { useMemo,useState } from "react";

import { GoogleAdminIcon } from "@/components/google-icons";

export interface TimelineEvent {
  id: string;
  timestamp: string;
  action?: string;
  actionDisplay?: string;
  actionName?: string;
  eventType?: string;
  actorEmail: string;
  actorName?: string;
  actorType?: "ADMIN" | "USER" | "SYSTEM" | string;
  appName: string;
  appId?: string;
  clientId?: string;
  appIconUrl?: string;
  appIcon?: string;
  oldPolicy?: string;
  newPolicy?: string;
  previousState?: string;
  newState?: string;
  target?: string;
  orgUnit?: string;
  changeSummary?: string;
  details?: any;
  rawParameters?: any[];
  ipAddress?: string;
}

interface AccessTimelineViewProps {
  events?: TimelineEvent[];
  domainName?: string;
  syncStatus?: any;
  onRefresh?: () => void;
}

export default function AccessTimelineView({
  events = [],
  domainName = "gafe.co.za",
  syncStatus,
  onRefresh,
}: AccessTimelineViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState<string>("ALL");
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

  // Filter events strictly by administrator policy changes
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const term = searchTerm.toLowerCase();
      const summaryText = ev.changeSummary || (typeof ev.details === "string" ? ev.details : "");
      const matchesSearch =
        !term ||
        ev.appName?.toLowerCase().includes(term) ||
        ev.actorEmail?.toLowerCase().includes(term) ||
        ev.clientId?.toLowerCase().includes(term) ||
        summaryText.toLowerCase().includes(term) ||
        ev.target?.toLowerCase().includes(term);

      const matchesAdmin = selectedAdmin === "ALL" || ev.actorEmail === selectedAdmin;

      const eventState = (ev.newState || ev.newPolicy || ev.action || "").toUpperCase();
      let matchesPolicy = true;
      if (selectedPolicy !== "ALL") {
        if (selectedPolicy === "TRUSTED") {
          matchesPolicy = eventState.includes("TRUST");
        } else if (selectedPolicy === "SPECIFIC_DATA") {
          matchesPolicy = eventState.includes("SPECIFIC");
        } else if (selectedPolicy === "LIMITED") {
          matchesPolicy = eventState.includes("LIMIT") || eventState.includes("UNTRUST");
        } else if (selectedPolicy === "BLOCKED") {
          matchesPolicy = eventState.includes("BLOCK");
        }
      }

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

      return matchesSearch && matchesAdmin && matchesPolicy && matchesTime;
    });
  }, [events, searchTerm, selectedAdmin, selectedPolicy, selectedTimeRange]);

  // KPI Metrics focused on Access Policy changes
  const metrics = useMemo(() => {
    const totalEvents = events.length;
    const policyTrusted = events.filter(
      (e) => (e.newState || e.action)?.toUpperCase().includes("TRUST")
    ).length;
    const policySpecificData = events.filter(
      (e) => (e.newState || e.action)?.toUpperCase().includes("SPECIFIC")
    ).length;
    const policyLimited = events.filter(
      (e) =>
        (e.newState || e.action)?.toUpperCase().includes("LIMIT") ||
        (e.newState || e.action)?.toUpperCase().includes("UNTRUST")
    ).length;
    const policyBlocked = events.filter(
      (e) => (e.newState || e.action)?.toUpperCase().includes("BLOCK")
    ).length;
    const uniqueActors = uniqueAdmins.length;

    return { totalEvents, policyTrusted, policySpecificData, policyLimited, policyBlocked, uniqueActors };
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

  const getPolicyBadge = (state?: string, action?: string) => {
    const upper = (state || action || "").toUpperCase();

    if (upper.includes("BLOCK")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Blocked
        </span>
      );
    }
    if (upper.includes("SPECIFIC")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          Specific Data
        </span>
      );
    }
    if (upper.includes("TRUST") || upper === "WHITELISTED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Trusted
        </span>
      );
    }
    if (upper.includes("LIMIT") || upper.includes("UNTRUST")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Limited
        </span>
      );
    }
    if (upper.includes("IMPORT") || upper.includes("CSV") || upper.includes("INGEST")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          CSV Ingested
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
        {state || action || "Policy Updated"}
      </span>
    );
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

      {/* KPI Metrics Row: 5 Core Governance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-[11px] font-semibold uppercase text-gray-400">Total Policy Changes</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalEvents}</div>
          <div className="text-[11px] text-gray-500 mt-1">Admin policy updates</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-xs">
          <div className="text-[11px] font-semibold uppercase text-emerald-700">Trusted Status</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{metrics.policyTrusted}</div>
          <div className="text-[11px] text-gray-500 mt-1">Full API access granted</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-indigo-100 bg-indigo-50/20 shadow-xs">
          <div className="text-[11px] font-semibold uppercase text-indigo-700">Specific Data</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{metrics.policySpecificData}</div>
          <div className="text-[11px] text-gray-500 mt-1">Restricted to select scopes</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/20 shadow-xs">
          <div className="text-[11px] font-semibold uppercase text-amber-700">Limited &amp; Blocked</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {metrics.policyLimited + metrics.policyBlocked}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            {metrics.policyLimited} Limited · {metrics.policyBlocked} Blocked
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-100 bg-purple-50/20 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold uppercase text-purple-700">Active Admins</div>
          <div className="text-2xl font-bold text-purple-700 mt-1">{metrics.uniqueActors}</div>
          <div className="text-[11px] text-gray-500 mt-1">Decision makers</div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <input
              type="text"
              placeholder="Search by application name, admin email, client ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Policy Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedPolicy}
              onChange={(e) => setSelectedPolicy(e.target.value)}
              aria-label="Filter by access policy"
              className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Policies (Trusted, Specific Data, Limited, Blocked)</option>
              <option value="TRUSTED">Trusted</option>
              <option value="SPECIFIC_DATA">Specific Data</option>
              <option value="LIMITED">Limited</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>

          {/* Admin Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedAdmin}
              onChange={(e) => setSelectedAdmin(e.target.value)}
              aria-label="Filter by administrator email"
              className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 truncate"
            >
              <option value="ALL">All Admins ({uniqueAdmins.length})</option>
              {uniqueAdmins.map((admin) => (
                <option key={admin} value={admin}>
                  {admin}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              aria-label="Filter by time range"
              className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Time: All 180 Days</option>
              <option value="7D">Past 7 Days</option>
              <option value="30D">Past 30 Days</option>
              <option value="90D">Past 90 Days</option>
              <option value="180D">Past 180 Days</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        {(searchTerm || selectedPolicy !== "ALL" || selectedAdmin !== "ALL" || selectedTimeRange !== "ALL") && (
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>
              Showing <strong>{filteredEvents.length}</strong> matching policy change records
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedPolicy("ALL");
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
            No Administrator Policy Changes Matching Filters
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 leading-relaxed">
            Try adjusting your search keywords, policy filter, or date range.
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
                  {dateEvents.length} {dateEvents.length === 1 ? "policy change" : "policy changes"}
                </span>
              </div>

              {/* Timeline Items */}
              <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {dateEvents.map((ev) => {
                  const isExpanded = expandedEventIds.has(ev.id);
                  const state = (ev.newState || ev.newPolicy || ev.action || "").toUpperCase();
                  const isBlock = state.includes("BLOCK");
                  const isTrust = state.includes("TRUST") || state.includes("WHITELIST");
                  const isSpecific = state.includes("SPECIFIC");
                  const isLimit = state.includes("LIMIT") || state.includes("UNTRUST");
                  const isImport = state.includes("IMPORT") || state.includes("CSV") || state.includes("INGEST");

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
                            : isSpecific
                            ? "border-indigo-500 text-indigo-600 ring-4 ring-indigo-50"
                            : isLimit
                            ? "border-amber-500 text-amber-600 ring-4 ring-amber-50"
                            : isImport
                            ? "border-blue-500 text-blue-600 ring-4 ring-blue-50"
                            : "border-gray-400 text-gray-600 ring-4 ring-gray-50"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            isBlock
                              ? "bg-rose-500"
                              : isTrust
                              ? "bg-emerald-500"
                              : isSpecific
                              ? "bg-indigo-500"
                              : isLimit
                              ? "bg-amber-500"
                              : isImport
                              ? "bg-blue-500"
                              : "bg-gray-400"
                          }`}
                        />
                      </div>

                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              ev.appIconUrl ||
                              ev.appIcon ||
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
                                {ev.appName || "OAuth Application"}
                              </span>
                              {getPolicyBadge(ev.newState || ev.newPolicy, ev.action)}
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
                        <div className="sm:col-span-7 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-gray-500 font-medium">Access Policy:</span>
                            <span className="font-semibold text-gray-800">
                              {ev.actionDisplay || ev.action || "Policy Change"}
                            </span>
                            {(ev.previousState || ev.oldPolicy) && (
                              <>
                                <span className="text-gray-400 font-bold select-none">|</span>
                                <span className="text-gray-400">Previous:</span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200 font-mono">
                                  {ev.previousState || ev.oldPolicy}
                                </span>
                              </>
                            )}
                          </div>

                          {(ev.target || ev.orgUnit) && (
                            <div className="text-[11px] text-gray-500">
                              Applied Scope:{" "}
                              <span className="font-mono text-gray-700 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                                {ev.target || ev.orgUnit}
                              </span>
                            </div>
                          )}

                          <div className="text-[11px] text-gray-600 mt-1 leading-snug">
                            {ev.changeSummary || (typeof ev.details === "string" ? ev.details : "")}
                          </div>
                        </div>

                        {/* Administrator / Actor */}
                        <div className="sm:col-span-5 sm:border-l sm:border-gray-100 sm:pl-4 flex flex-col justify-center">
                          <div className="text-[10px] text-gray-400 uppercase font-semibold">
                            Modified By Administrator
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-6 h-6 rounded-full bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-[10px]">
                              {ev.actorEmail?.charAt(0).toUpperCase() || "A"}
                            </div>
                            <span className="text-xs font-mono font-semibold text-gray-800 truncate" title={ev.actorEmail}>
                              {ev.actorEmail || "Administrator"}
                            </span>
                          </div>
                          {ev.ipAddress && (
                            <div className="text-[10px] font-mono text-gray-400 mt-1">
                              IP: {ev.ipAddress}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Technical Details Toggle */}
                      {ev.details && typeof ev.details === "object" && Object.keys(ev.details).length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => toggleExpand(ev.id)}
                            className="text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <span>{isExpanded ? "Hide Audit Parameters ▲" : "View Audit Parameters ▼"}</span>
                          </button>

                          {isExpanded && (
                            <pre className="mt-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-mono text-gray-700 overflow-x-auto">
                              {JSON.stringify(ev.details, null, 2)}
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
