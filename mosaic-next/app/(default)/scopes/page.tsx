import fs from "fs";
import path from "path";
import Link from "next/link";
import ScopeMatrixView from "@/components/scope-matrix-view";

export const metadata = {
  title: "Services & Scopes Database — Admin Lens Backend",
  description: "Comprehensive global catalog of Google Workspace OAuth permissions, Google Tiers, and Admin Lens Threat Scores",
};

export default function ScopesPage() {
  const dataDir = path.join(process.cwd(), "data");
  const scopeDataPath = path.join(dataDir, "scope_reference.json");

  let scopes = [];
  let metrics = null;

  if (fs.existsSync(scopeDataPath)) {
    const data = JSON.parse(fs.readFileSync(scopeDataPath, "utf8"));
    scopes = data.scopes || [];
    metrics = data.metrics || null;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span>⚙️</span> Admin Backend
            </span>
            <span>/</span>
            <span className="text-gray-800 font-semibold">Services &amp; Scopes</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900">Services &amp; Scopes Database</h1>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Global DB
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Master global catalog of Google Workspace OAuth permissions, Google security tiers, and Admin Lens threat assessments.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/central-database"
            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-800 border border-emerald-200 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span>🗄️</span> Application Repository
          </Link>
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-700 border border-blue-200 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span>🏢</span> Client Workspace (gafe.co.za)
          </Link>
        </div>
      </div>

      {/* Embedded Full Scope Matrix Component (Admin Backend Mode - zero tenant/client data) */}
      <ScopeMatrixView scopes={scopes} metrics={metrics} isBackend={true} />
    </div>
  );
}
