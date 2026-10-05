"use client";

import { useSearchParams,useSelectedLayoutSegments } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

import { useAppProvider } from "@/app/app-provider";
import { useWindowWidth } from "@/components/utils/use-window-width";

import Logo from "./logo";
import SidebarLink from "./sidebar-link";

function SidebarContent({ variant = "default" }: { variant?: string }) {
  const sidebar = useRef<HTMLDivElement>(null);
  const { sidebarOpen, setSidebarOpen, sidebarExpanded, setSidebarExpanded } = useAppProvider();
  const segments = useSelectedLayoutSegments();
  const searchParams = useSearchParams();
  const tabFromQuery = searchParams.get("tab");

  const isClientWorkspace =
    (segments.length === 0 || segments.includes("dashboard")) &&
    !segments.includes("scopes") &&
    !segments.includes("central-database") &&
    !segments.includes("generative-ai");

  const workspaceTab = tabFromQuery || "dashboard";
  const isMainDashboardActive =
    isClientWorkspace && workspaceTab === "main-dashboard";
  const isDashboardActive =
    isClientWorkspace && workspaceTab === "dashboard";
  const isApplicationsActive =
    isClientWorkspace && (workspaceTab === "apps" || workspaceTab === "internal");
  const isClientScopesActive = isClientWorkspace && workspaceTab === "scopes";
  const isClientRecsActive = isClientWorkspace && workspaceTab === "recs";
  const isClientTimelineActive = isClientWorkspace && workspaceTab === "timeline";
  const isDataImportActive = isClientWorkspace && workspaceTab === "import";
  const isClientBaselineActive = isClientWorkspace && workspaceTab === "baseline";

  const isAdminScopesActive = segments.includes("scopes");
  const isAdminRepoActive = segments.includes("central-database");

  // Generative AI section
  const isGenAI = segments.includes("generative-ai");
  const genAiTab = tabFromQuery || "overview";
  const isGenAIOverviewActive = isGenAI && genAiTab === "overview";
  const isGenAINotebooksActive = isGenAI && genAiTab === "notebooks";
  const isGenAIAppsActive = isGenAI && genAiTab === "apps";
  const isGenAIAuditActive = isGenAI && genAiTab === "audit";
  const breakpoint = useWindowWidth();
  const expandOnly = !sidebarExpanded && breakpoint && breakpoint >= 1024 && breakpoint < 1536;

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: { target: EventTarget | null }): void => {
      if (!sidebar.current) return;
      if (!sidebarOpen || sidebar.current.contains(target as Node)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }): void => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <div className={`min-w-fit ${sidebarExpanded ? "sidebar-expanded" : ""}`}>
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 z-40 bg-gray-900/30 transition-opacity duration-200 lg:hidden lg:z-auto ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`fixed left-0 top-0 z-40 flex h-[100dvh] w-64 shrink-0 flex-col overflow-y-auto bg-white border-r border-gray-200 p-4 transition-all duration-200 ease-in-out lg:static lg:left-auto lg:top-auto lg:h-[100dvh] lg:w-64 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64 lg:translate-x-0"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex justify-between mb-4 pr-3 sm:px-2">
          {/* Close button */}
          <button
            className="text-gray-500 hover:text-gray-400 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          {/* Logo */}
          <Logo />
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-16">
          {/* Main Dashboard (Standalone Top Item) */}
          <ul className="space-y-1">
            <li className={`px-2.5 py-2 rounded-lg transition-colors ${isMainDashboardActive ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-gray-100 text-gray-700"}`}>
              <SidebarLink href="/dashboard?tab=main-dashboard">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <svg className={`shrink-0 h-4.5 w-4.5 ${isMainDashboardActive ? "text-blue-600" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm ml-2.5 font-medium">
                      Main Dashboard
                    </span>
                  </div>
                </div>
              </SidebarLink>
            </li>
          </ul>

          {/* Section 1: App Access Control */}
          <div>
            <div className="pl-3 pr-2 mb-2">
              <h3 className="text-xs uppercase text-gray-400 font-bold tracking-wider">
                App Access Control
              </h3>
            </div>
            <ul className="space-y-1">
              {/* Dashboard (2nd Item - Initial Landing Page) */}
              <li className={`px-2.5 py-2 rounded-lg transition-colors ${isDashboardActive ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-gray-100 text-gray-700"}`}>
                <SidebarLink href="/dashboard?tab=dashboard">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <svg className={`shrink-0 h-4.5 w-4.5 ${isDashboardActive ? "text-blue-600" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="text-sm ml-2.5 font-medium">
                        Dashboard
                      </span>
                    </div>
                  </div>
                </SidebarLink>
              </li>

              {/* Applications */}
              <li className={`px-2.5 py-2 rounded-lg transition-colors ${isApplicationsActive ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-gray-100 text-gray-700"}`}>
                <SidebarLink href="/dashboard?tab=apps">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <svg className={`shrink-0 h-4.5 w-4.5 ${isApplicationsActive ? "text-blue-600" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      <span className="text-sm ml-2.5 font-medium">
                        Applications
                      </span>
                    </div>
                  </div>
                </SidebarLink>
              </li>


              {/* Services & Scopes */}
              <li className={`px-2.5 py-2 rounded-lg transition-colors ${isClientScopesActive ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-gray-100 text-gray-700"}`}>
                <SidebarLink href="/dashboard?tab=scopes">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <svg className={`shrink-0 h-4.5 w-4.5 ${isClientScopesActive ? "text-blue-600" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      <span className="text-sm ml-2.5 font-medium">
                        Services &amp; Scopes
                      </span>
                    </div>
                  </div>
                </SidebarLink>
              </li>

              {/* Recommendations */}
              <li className={`px-2.5 py-2 rounded-lg transition-colors ${isClientRecsActive ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-gray-100 text-gray-700"}`}>
                <SidebarLink href="/dashboard?tab=recs">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <svg className={`shrink-0 h-4.5 w-4.5 ${isClientRecsActive ? "text-blue-600" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-sm ml-2.5 font-medium">
                        Recommendations
                      </span>
                    </div>
                  </div>
                </SidebarLink>
              </li>

              {/* Access Timeline (4th Item) */}
              <li className={`px-2.5 py-2 rounded-lg transition-colors ${isClientTimelineActive ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-gray-100 text-gray-700"}`}>
                <SidebarLink href="/dashboard?tab=timeline">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <svg className={`shrink-0 h-4.5 w-4.5 ${isClientTimelineActive ? "text-blue-600" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm ml-2.5 font-medium">
                        Access Timeline
                      </span>
                    </div>
                  </div>
                </SidebarLink>
              </li>

              {/* Data Import (5th Item) */}
              <li className={`px-2.5 py-2 rounded-lg transition-colors ${isDataImportActive ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-gray-100 text-gray-700"}`}>
                <SidebarLink href="/dashboard?tab=import">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <svg className={`shrink-0 h-4.5 w-4.5 ${isDataImportActive ? "text-blue-600" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span className="text-sm ml-2.5 font-medium">
                        Data Import
                      </span>
                    </div>
                    <span className="ml-1.5 flex h-2 w-2 shrink-0 rounded-full bg-blue-400 opacity-80" title="Import CSV data" />
                  </div>
                </SidebarLink>
              </li>

              {/* Domain Baseline Settings (6th Item) */}
              <li className={`px-2.5 py-2 rounded-lg transition-colors ${isClientBaselineActive ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-gray-100 text-gray-700"}`}>
                <SidebarLink href="/dashboard?tab=baseline">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <svg className={`shrink-0 h-4.5 w-4.5 ${isClientBaselineActive ? "text-blue-600" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-sm ml-2.5 font-medium">
                        Domain Baseline
                      </span>
                    </div>
                  </div>
                </SidebarLink>
              </li>

            </ul>
          </div>

          {/* Section 2: Central Catalog */}
          <div className="pt-2 border-t border-gray-200">
            <div className="pl-3 pr-2 mb-2">
              <h3 className="text-xs uppercase text-gray-400 font-bold tracking-wider">
                Central Catalog
              </h3>
            </div>
            
            {/* Standalone Sub-menu Group */}
            <ul className="space-y-1 bg-emerald-50/40 p-1 rounded-xl border border-emerald-100/80">

              {/* Sub-menu 1: Application Repository */}
              <li className={`px-2.5 py-2 rounded-lg transition-colors ${isAdminRepoActive ? "bg-white text-emerald-900 font-bold shadow-xs border border-emerald-200" : "hover:bg-white/80 text-gray-700"}`}>
                <SidebarLink href="/central-database">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <svg className={`shrink-0 h-4.5 w-4.5 ${isAdminRepoActive ? "text-emerald-700" : "text-emerald-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                      </svg>
                      <span className="text-sm ml-2.5 font-medium">
                        Application Repository
                      </span>
                    </div>
                  </div>
                </SidebarLink>
              </li>

              {/* Sub-menu 2: Services & Scopes */}
              <li className={`px-2.5 py-2 rounded-lg transition-colors ${isAdminScopesActive ? "bg-white text-emerald-900 font-bold shadow-xs border border-emerald-200" : "hover:bg-white/80 text-gray-700"}`}>
                <SidebarLink href="/scopes">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <svg className={`shrink-0 h-4.5 w-4.5 ${isAdminScopesActive ? "text-emerald-700" : "text-emerald-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="text-sm ml-2.5 font-medium">
                        Services &amp; Scopes
                      </span>
                    </div>
                  </div>
                </SidebarLink>
              </li>

            </ul>
          </div>

          {/* Section 3: Generative AI */}
          <div className="pt-2 border-t border-gray-200">
            <div className="pl-3 pr-2 mb-2">
              <h3 className="text-xs uppercase text-gray-400 font-bold tracking-wider">
                Generative AI
              </h3>
            </div>
            
            {/* Standalone Sub-menu Group */}
            <ul className="space-y-1 bg-slate-50/70 p-1.5 rounded-xl border border-slate-200/80">

              {/* Sub-menu 1: Overview */}
              <li className={`px-3 py-1.5 rounded-lg transition-colors ${isGenAIOverviewActive ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200" : "hover:bg-white/80 text-gray-600 hover:text-gray-900"}`}>
                <SidebarLink href="/generative-ai?tab=overview">
                  <span className="text-sm">
                    Overview
                  </span>
                </SidebarLink>
              </li>

              {/* Sub-menu 2: NotebookLM */}
              <li className={`px-3 py-1.5 rounded-lg transition-colors ${isGenAINotebooksActive ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200" : "hover:bg-white/80 text-gray-600 hover:text-gray-900"}`}>
                <SidebarLink href="/generative-ai?tab=notebooks">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm">
                      NotebookLM
                    </span>
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                      9
                    </span>
                  </div>
                </SidebarLink>
              </li>

              {/* Sub-menu 3: Applications */}
              <li className={`px-3 py-1.5 rounded-lg transition-colors ${isGenAIAppsActive ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200" : "hover:bg-white/80 text-gray-600 hover:text-gray-900"}`}>
                <SidebarLink href="/generative-ai?tab=apps">
                  <span className="text-sm">
                    Applications
                  </span>
                </SidebarLink>
              </li>

              {/* Sub-menu 4: Audit Logs */}
              <li className={`px-3 py-1.5 rounded-lg transition-colors ${isGenAIAuditActive ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200" : "hover:bg-white/80 text-gray-600 hover:text-gray-900"}`}>
                <SidebarLink href="/generative-ai?tab=audit">
                  <span className="text-sm">
                    Audit Logs
                  </span>
                </SidebarLink>
              </li>

            </ul>
          </div>

        </div>

        {/* Expand / collapse button */}
        <div className="mt-auto hidden justify-end pt-3 lg:inline-flex 2xl:hidden">
          <div className="w-12 py-2 pr-3 pl-4">
            <button
              className="text-gray-400 hover:text-gray-500"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
            >
              <span className="sr-only">Expand / collapse sidebar</span>
              <svg
                className="sidebar-expanded:rotate-180 shrink-0 fill-current text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
              >
                <path d="M15 16a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v14a1 1 0 0 1-1 1ZM8.586 7H1a1 1 0 1 0 0 2h7.586l-2.793 2.793a1 1 0 1 0 1.414 1.414l4.5-4.5A.997.997 0 0 0 12 8.01M11.924 7.617a.997.997 0 0 0-.217-.324l-4.5-4.5a1 1 0 0 0-1.414 1.414L8.586 7M12 7.99a.996.996 0 0 0-.076-.373Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar(props: { variant?: string }) {
  return (
    <Suspense fallback={null}>
      <SidebarContent {...props} />
    </Suspense>
  );
}
