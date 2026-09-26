"use client";

import { usePathname } from "next/navigation";

import { useAppProvider } from "@/app/app-provider";

export default function Header({ variant = "default" }: { variant?: string }) {
  const { sidebarOpen, setSidebarOpen } = useAppProvider();
  const pathname = usePathname() || "";
  const isCentralDb = pathname.includes("central-database");
  const isScopes = pathname.includes("scopes");

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          
          {/* Left: Mobile hamburger & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              className="text-gray-500 hover:text-gray-600 lg:hidden"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={() => {
                setSidebarOpen(!sidebarOpen);
              }}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="5" width="16" height="2" />
                <rect x="4" y="11" width="16" height="2" />
                <rect x="4" y="17" width="16" height="2" />
              </svg>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-gray-500">
              <span className="font-semibold text-gray-800">Admin Lens</span>
              <span className="text-gray-300">/</span>
              {isCentralDb ? (
                <>
                  <span className="text-emerald-700 font-medium">Central Catalog</span>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-800 font-semibold">Application Repository</span>
                </>
              ) : isScopes ? (
                <>
                  <span className="text-emerald-700 font-medium">Central Catalog</span>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-800 font-semibold">Services &amp; Scopes</span>
                </>
              ) : (
                <>
                  <span className="text-blue-700 font-medium">Workspace</span>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-800 font-semibold">gafe.co.za</span>
                </>
              )}
            </div>
          </div>

          {/* Right: Environment / Tenant Context Badge */}
          <div className="flex items-center gap-3">
            {isCentralDb || isScopes ? (
              <div className="hidden md:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Global Master Catalog</span>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>Workspace: gafe.co.za</span>
              </div>
            )}
            <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-700">
              AL
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
