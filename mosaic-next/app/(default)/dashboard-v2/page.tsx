import fs from "fs";
import path from "path";
import OAuthDashboardV2Client from "./oauth-dashboard-v2-client";

export const metadata = {
  title: "Admin Lens V2 — Next-Gen SaaS Security & App Governance",
  description: "Advanced Google Workspace third-party application governance, SSPM risk scoring, policy automation, and employee re-certification",
};

export default function DashboardV2Page() {
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

  return (
    <OAuthDashboardV2Client
      initialApps={apps}
      initialRecs={recs}
      metrics={metrics}
      users={users}
    />
  );
}
