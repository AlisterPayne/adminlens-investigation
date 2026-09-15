"use client";

import { useAppProvider } from "@/app/app-provider";

export default function Header({ variant = "default" }: { variant?: string }) {
  const { sidebarOpen, setSidebarOpen } = useAppProvider();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Left: Mobile hamburger */}
          <div className="flex items-center">
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
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <span className="font-semibold text-gray-800">Admin Lens</span>
              <span>/</span>
              <span>Google Workspace Governance</span>
            </div>
          </div>

          {/* Right: User & Domain Details */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Live Sync: gafe.co.za
            </div>

            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-gray-800">Super Admin</div>
                <div className="text-[11px] font-mono text-gray-500">alister@gafe.co.za</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-700">
                AG
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
