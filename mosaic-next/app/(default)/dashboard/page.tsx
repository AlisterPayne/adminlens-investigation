import fs from "fs";
import path from "path";
import { Suspense } from "react";

import OAuthDashboardClient from "./oauth-dashboard-client";

export const metadata = {
  title: "Admin Lens — OAuth Applications Governance",
  description: "Review and govern third-party OAuth applications in Google Workspace",
};

export default function Dashboard() {
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

  const timelinePath = path.join(dataDir, "audit_timeline.json");
  let timelineEvents = [];
  if (fs.existsSync(timelinePath)) {
    try {
      timelineEvents = JSON.parse(fs.readFileSync(timelinePath, "utf8"));
    } catch (e) {
      console.error("Error reading audit_timeline.json:", e);
    }
  }

  const syncStatusPath = path.join(dataDir, "sync_status.json");
  let syncStatus = null;
  if (fs.existsSync(syncStatusPath)) {
    try {
      syncStatus = JSON.parse(fs.readFileSync(syncStatusPath, "utf8"));
    } catch (e) {
      console.error("Error reading sync_status.json:", e);
    }
  }

  return (
    <Suspense fallback={<div className="p-8 text-gray-400">Loading Client Workspace...</div>}>
      <OAuthDashboardClient
        initialApps={apps}
        initialRecs={recs}
        metrics={metrics}
        users={users}
        initialScopes={scopes}
        scopeMetrics={scopeMetrics}
        initialTimelineEvents={timelineEvents}
        syncStatus={syncStatus}
      />
    </Suspense>
  );
}
