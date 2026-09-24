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

      {/* Admin Back-End Distinction Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-gray-900 text-white p-5 rounded-2xl border border-emerald-500/30 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500 text-gray-950 flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-950 animate-pulse"></span>
                Admin Back-End
              </span>
              <span className="text-xs text-emerald-400 font-mono">Global Knowledge Base</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Google Services & OAuth Scope Directory
            </h1>
            <p className="text-xs md:text-sm text-gray-300 mt-1 max-w-3xl leading-relaxed">
              Global reference catalog of Google Workspace services (Drive, Gmail, Classroom, Admin SDK, GCP, Vault) and <strong>158+ OAuth permissions</strong>. This database establishes baseline threat scores and sensitivity tiers across all client domains without mixing in tenant-specific user telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/central-database"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <span>🗄️</span>
              <span>Application Repository</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Embedded Full Scope Matrix Component */}
      <ScopeMatrixView scopes={scopes} metrics={metrics} apps={apps} />
    </div>
  );
}
