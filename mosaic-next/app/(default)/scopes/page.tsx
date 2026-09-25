import fs from "fs";
import path from "path";
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
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Services &amp; Scopes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Catalog of Google Workspace OAuth permissions and threat assessments.
        </p>
      </div>

      {/* Embedded Full Scope Matrix Component (Admin Backend Mode - zero client/app data) */}
      <ScopeMatrixView scopes={scopes} metrics={metrics} isBackend={true} />
    </div>
  );
}
