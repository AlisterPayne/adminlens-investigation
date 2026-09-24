import fs from "fs";
import path from "path";
import Link from "next/link";
import ScopeMatrixView from "@/components/scope-matrix-view";

export const metadata = {
  title: "OAuth Scope Threat Matrix — Admin Lens",
  description: "Comprehensive database of Google Workspace OAuth permissions, Google Tiers, and AdminLens Threat Scores",
};

export default function ScopesPage() {
  const dataDir = path.join(process.cwd(), "data");
  const scopeDataPath = path.join(dataDir, "scope_reference.json");
  const appsDataPath = path.join(dataDir, "applications_catalog.json");

  let scopes = [];
  let metrics = null;
  let apps = [];

  if (fs.existsSync(scopeDataPath)) {
    const data = JSON.parse(fs.readFileSync(scopeDataPath, "utf8"));
    scopes = data.scopes || [];
    metrics = data.metrics || null;
  }

  if (fs.existsSync(appsDataPath)) {
    apps = JSON.parse(fs.readFileSync(appsDataPath, "utf8"));
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto space-y-6">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <span>⚙️</span> Admin Back-End
          </span>
          <span>/</span>
          <span className="text-gray-800 font-semibold">Services & Scopes</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/central-database"
            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-800 border border-emerald-200 transition-colors flex items-center gap-1.5"
          >
            <span>🗄️</span> Application Repository
          </Link>
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-700 border border-blue-200 transition-colors flex items-center gap-1.5"
          >
            <span>🏢</span> Client Workspace (gafe.co.za)
          </Link>
        </div>
      </div>


      {/* Embedded Full Scope Matrix Component */}
      <ScopeMatrixView scopes={scopes} metrics={metrics} apps={apps} />
    </div>
  );
}
