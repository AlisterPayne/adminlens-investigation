import fs from "fs";
import path from "path";
import CentralDatabaseClient from "./central-database-client";

export const metadata = {
  title: "Central Application Database — AdminLens",
  description: "Global master database of all Google Workspace third-party, mobile, and SaaS applications with full editing capabilities.",
};

export default function CentralDatabasePage() {
  const masterPath = path.join(process.cwd(), "data", "master_applications_catalog.json");
  const dataPath = fs.existsSync(masterPath) ? masterPath : path.join(process.cwd(), "data", "applications_catalog.json");
  let apps = [];

  if (fs.existsSync(dataPath)) {
    try {
      apps = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    } catch (err) {
      console.error("Error reading applications catalog:", err);
    }
  }

  // Defensively ensure only Google Owned, Third Party, and Unknown apps remain (exclude internal)
  const sanitizedApps = apps.filter((a: any) => {
    const isInternal =
      a.ownership === "Internal" ||
      (a.vendor && a.vendor.toLowerCase().includes("internal")) ||
      (a.category && a.category.toLowerCase().includes("internal")) ||
      (a.description && a.description.toLowerCase().includes("internal domain tool")) ||
      (a.description && a.description.toLowerCase().includes("custom google apps script")) ||
      (Array.isArray(a.compliance) && a.compliance.includes("Internal Tenant Only"));
    return !isInternal;
  });

  return <CentralDatabaseClient initialApps={sanitizedApps} />;
}
