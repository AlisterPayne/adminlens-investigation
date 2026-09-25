"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAppProvider } from "@/app/app-provider";
import { useWindowWidth } from "@/components/utils/use-window-width";

import Logo from "./logo";
import SidebarLink from "./sidebar-link";

export default function Sidebar({ variant = "default" }: { variant?: string }) {
  const sidebar = useRef<HTMLDivElement>(null);
  const { sidebarOpen, setSidebarOpen, sidebarExpanded, setSidebarExpanded } = useAppProvider();
  const segments = useSelectedLayoutSegments();
  const [currentTab, setCurrentTab] = useState("apps");

  useEffect(() => {
    const syncTab = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        setCurrentTab(params.get("tab") || "apps");
      }
    };
    syncTab();

    window.addEventListener("popstate", syncTab);
    return () => {
      window.removeEventListener("popstate", syncTab);
    };
  }, [segments]);

  const isClientWorkspace =
    (segments.length === 0 || segments.includes("dashboard")) &&
    !segments.includes("scopes") &&
    !segments.includes("central-database");

  const isApplicationsActive =
    isClientWorkspace && (currentTab === "apps" || currentTab === "dashboard");
  const isClientScopesActive = isClientWorkspace && currentTab === "scopes";
  const isClientRecsActive = isClientWorkspace && currentTab === "recs";
  const isClientTimelineActive = isClientWorkspace && currentTab === "timeline";

  const isAdminScopesActive = segments.includes("scopes");
  const isAdminRepoActive = segments.includes("central-database");
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
        <div className="flex justify-between mb-8 pr-3 sm:px-2">
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
        <div className="space-y-6">
          {/* Section 1: Workspace */}
          <div>
            <div className="pl-3 pr-2 mb-2">
              <h3 className="text-xs uppercase text-gray-400 font-bold tracking-wider">
                Workspace
              </h3>
            </div>
            <ul className="space-y-1">
              
              {/* Applications */}
              <li className={`px-2.5 py-2 rounded-lg transition-colors ${isApplicationsActive ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-gray-100 text-gray-700"}`}>
                <SidebarLink href="/dashboard?tab=apps" onClick={() => setCurrentTab("apps")}>
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
                <SidebarLink href="/dashboard?tab=scopes" onClick={() => setCurrentTab("scopes")}>
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
                <SidebarLink href="/dashboard?tab=recs" onClick={() => setCurrentTab("recs")}>
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
                <SidebarLink href="/dashboard?tab=timeline" onClick={() => setCurrentTab("timeline")}>
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
