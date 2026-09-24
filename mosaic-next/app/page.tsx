import fs from "fs";
import path from "path";
import { Suspense } from "react";
import DefaultLayout from "./(default)/layout";
import OAuthDashboardClient from "./(default)/dashboard/oauth-dashboard-client";

export const metadata = {
  title: "Admin Lens — OAuth Applications Governance",
  description: "Review and govern third-party OAuth applications in Google Workspace",
};

export default function Home() {
  const dataDir = path.join(process.cwd(), "data");
  
  const apps = JSON.parse(
    fs.readFileSync(path.join(dataDir, "applications_catalog.json"), "utf8")
  );
  const recs = JSON.parse(
    fs.readFileSync(path.join(dataDir, "recommendations.json"), "utf8")
  );
  const metrics = JSON.parse(
    fs.readFileSync(path.join(dataDir, "metrics.json"), "utf8")
  );
  const users = JSON.parse(
    fs.readFileSync(path.join(dataDir, "users.json"), "utf8")
  );
  const scopeDataPath = path.join(dataDir, "scope_reference.json");
  let scopes = [];
  let scopeMetrics = null;
  if (fs.existsSync(scopeDataPath)) {
    const data = JSON.parse(fs.readFileSync(scopeDataPath, "utf8"));
    scopes = data.scopes || [];
    scopeMetrics = data.metrics || null;
  }

  return (
    <DefaultLayout>
      <Suspense fallback={<div className="p-8 text-gray-400">Loading Client Workspace...</div>}>
        <OAuthDashboardClient
          initialApps={apps}
          initialRecs={recs}
          metrics={metrics}
          users={users}
          initialScopes={scopes}
          scopeMetrics={scopeMetrics}
        />
      </Suspense>
    </DefaultLayout>
  );
}
