import fs from "fs";
import path from "path";
import CentralDatabaseClient from "./central-database-client";

export const metadata = {
  title: "Central Application Database — AdminLens",
  description: "Global master database of all Google Workspace third-party, mobile, and SaaS applications with full editing capabilities.",
};

export default function CentralDatabasePage() {
  const dataPath = path.join(process.cwd(), "data", "applications_catalog.json");
  let apps = [];

  if (fs.existsSync(dataPath)) {
    try {
      apps = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    } catch (err) {
      console.error("Error reading applications catalog:", err);
    }
  }

  return <CentralDatabaseClient initialApps={apps} />;
}
