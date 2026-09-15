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

  let scopes = [];
  let metrics = null;

  if (fs.existsSync(scopeDataPath)) {
    const data = JSON.parse(fs.readFileSync(scopeDataPath, "utf8"));
    scopes = data.scopes || [];
    metrics = data.metrics || null;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto space-y-6">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-semibold">Scope Threat Matrix</span>
        </div>
        <Link
          href="/"
          className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors flex items-center gap-1.5"
        >
          <span>←</span> Back to Dashboard
        </Link>
      </div>

      {/* Embedded Full Scope Matrix Component */}
      <ScopeMatrixView scopes={scopes} metrics={metrics} />
    </div>
  );
}
