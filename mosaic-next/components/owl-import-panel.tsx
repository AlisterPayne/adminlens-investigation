"use client";

import React, { useCallback, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CsvType = "accessed" | "configured" | "unknown";

interface UploadResult {
  type: CsvType;
  rowCount: number;
  counts: {
    newApps: number;
    updatedApps: number;
    policiesCount: number;
  };
}

interface UploadState {
  accessed: UploadResult | null;
  configured: UploadResult | null;
  completedAt?: string | null;
}

interface OWLImportPanelProps {
  onNavigateToApps?: () => void;
  currentApps?: any[];
  onAppsImported?: (newApps: any[], metricsUpdate: any) => void;
  onEventLogged?: (event: any) => void;
}

// ─── CSV Parsing Helpers ─────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function parseFullCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = vals[idx] !== undefined ? vals[idx].trim() : "";
    });
    rows.push(row);
  }
  return rows;
}

function parseRequestedServicesWithScopes(rawStr: string): {
  services: Record<string, number>;
  scopes: string[];
} {
  if (!rawStr || !rawStr.includes(":")) return { services: {}, scopes: [] };

  const services: Record<string, number> = {};
  const allScopes: string[] = [];

  let clean = rawStr.trim();
  if (clean.startsWith("[") && clean.endsWith("]")) {
    clean = clean.slice(1, -1);
  }

  const parts = clean.split("|");
  for (const part of parts) {
    const colonIdx = part.indexOf(":");
    if (colonIdx === -1) continue;
    const serviceName = part.slice(0, colonIdx).trim();
    let scopesPart = part.slice(colonIdx + 1).trim();
    if (scopesPart.startsWith("[") && scopesPart.endsWith("]")) {
      scopesPart = scopesPart.slice(1, -1);
    }
    const scopes = scopesPart
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    services[serviceName] = scopes.length;
    allScopes.push(...scopes);
  }

  return { services, scopes: Array.from(new Set(allScopes)) };
}

function detectCsvTypeLocal(headerLine: string): CsvType {
  if (headerLine.includes("Scopes for Specific Google Data")) return "configured";
  if (headerLine.includes("Requested Services with Scopes") && headerLine.includes("Access")) return "accessed";
  if (headerLine.includes("App Name") && headerLine.includes("Id") && headerLine.includes("Access")) {
    return headerLine.includes("Specific") ? "configured" : "accessed";
  }
  return "unknown";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { label: "Upload CSV 1", num: 1 },
    { label: "Upload CSV 2", num: 2 },
    { label: "Complete", num: 3 },
  ];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((s, i) => (
        <React.Fragment key={s.num}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                step > s.num
                  ? "bg-emerald-500 text-white"
                  : step === s.num
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "bg-gray-100 text-gray-400 border border-gray-200"
              }`}
            >
              {step > s.num ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                s.num
              )}
            </div>
            <span
              className={`mt-1.5 text-[11px] font-medium whitespace-nowrap ${
                step === s.num ? "text-blue-600" : step > s.num ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 mt-[-14px] transition-all duration-500 ${
                step > s.num ? "bg-emerald-400" : "bg-gray-200"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function ChecklistItem({
  label,
  description,
  url,
  done,
  active,
}: {
  label: string;
  description: string;
  url: string;
  done: boolean;
  active: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
        done
          ? "bg-emerald-50 border-emerald-200"
          : active
          ? "bg-blue-50 border-blue-200 shadow-sm"
          : "bg-gray-50 border-gray-200 opacity-60"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
          done ? "bg-emerald-500" : active ? "bg-blue-100 border-2 border-blue-400" : "bg-gray-200"
        }`}
      >
        {done ? (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        ) : active ? (
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
        ) : (
          <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold ${done ? "text-emerald-800" : active ? "text-blue-900" : "text-gray-600"}`}>
          {label}
        </div>
        <div className={`text-xs mt-0.5 ${done ? "text-emerald-600" : active ? "text-blue-600" : "text-gray-400"}`}>
          {description}
        </div>
      </div>

      {!done && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
            active
              ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
              : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
          }`}
        >
          Get it
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
      {done && (
        <span className="shrink-0 text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">
          ✓ Done
        </span>
      )}
    </div>
  );
}

function DropZone({
  onFile,
  uploading,
  prompt,
  disabled,
}: {
  onFile: (file: File) => void;
  uploading: boolean;
  prompt: string;
  disabled: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled || uploading) return;
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [disabled, uploading, onFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = "";
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled && !uploading) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && !uploading && inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 select-none ${
        disabled
          ? "opacity-40 cursor-not-allowed border-gray-200 bg-gray-50"
          : uploading
          ? "border-blue-300 bg-blue-50 cursor-wait"
          : dragging
          ? "border-blue-400 bg-blue-50 scale-[1.01]"
          : "border-gray-300 bg-gray-50/80 hover:border-blue-300 hover:bg-blue-50/40"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleChange}
        disabled={disabled || uploading}
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-blue-700">Analysing CSV…</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              dragging ? "bg-blue-100" : "bg-white border border-gray-200"
            }`}
          >
            <svg
              className={`w-7 h-7 transition-colors ${dragging ? "text-blue-500" : "text-gray-400"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">{prompt}</p>
            <p className="text-xs text-gray-400 mt-1">Drop a .csv file here, or click to browse</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Toast({ message, type }: { message: string; type: "success" | "error" | "info" }) {
  const colors = {
    success: "bg-emerald-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-blue-600 text-white",
  };
  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };
  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-semibold animate-slide-in-right ${colors[type]}`}
      style={{ animation: "slideInRight 0.3s ease-out" }}
    >
      <span className="text-lg">{icons[type]}</span>
      {message}
    </div>
  );
}

function SuccessCard({
  uploaded,
  onViewApps,
  onReset,
}: {
  uploaded: UploadState;
  onViewApps: () => void;
  onReset: () => void;
}) {
  const accessedRows = uploaded.accessed?.rowCount ?? 0;
  const configuredRows = uploaded.configured?.rowCount ?? 0;
  const newApps = (uploaded.accessed?.counts.newApps ?? 0) + (uploaded.configured?.counts.newApps ?? 0);
  const policies = uploaded.configured?.counts.policiesCount ?? 0;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-8 text-center">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-1">Import Complete!</h3>
      <p className="text-sm text-gray-500 mb-6">
        Your Google Workspace app data has been imported successfully.
        {uploaded.completedAt && (
          <span className="block text-xs text-emerald-700/80 font-medium mt-1">
            Status: Active &bull; Imported {uploaded.completedAt}
          </span>
        )}
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <div className="text-2xl font-bold text-gray-900">{accessedRows}</div>
          <div className="text-xs text-gray-500 mt-0.5">Apps accessed</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <div className="text-2xl font-bold text-gray-900">{configuredRows || policies}</div>
          <div className="text-xs text-gray-500 mt-0.5">Configured policies</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <div className="text-2xl font-bold text-emerald-600">{newApps}</div>
          <div className="text-xs text-gray-500 mt-0.5">New apps added</div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6 text-left">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Data precedence applied.</span> Configured CSV data takes priority over
            Accessed CSV. The next 24-hour API sync will be the most accurate source.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onViewApps}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          View Applications →
        </button>
        <button
          onClick={onReset}
          className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors cursor-pointer"
        >
          Import Again
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ACCESSED_URL = "https://admin.google.com/ac/owl/list?tab=apps";
const CONFIGURED_URL = "https://admin.google.com/ac/owl/list?tab=configuredApps";

export default function OWLImportPanel({
  onNavigateToApps,
  currentApps = [],
  onAppsImported,
  onEventLogged,
}: OWLImportPanelProps) {
  const [uploaded, setUploaded] = useState<UploadState>({
    accessed: null,
    configured: null,
    completedAt: null,
  });

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("adminlens_owl_upload_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.accessed || parsed.configured)) {
          setUploaded(parsed);
        }
      }
    } catch (_) {}
  }, []);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const accessedDone = !!uploaded.accessed;
  const configuredDone = !!uploaded.configured;
  const allDone = accessedDone && configuredDone;

  const step: 1 | 2 | 3 = allDone ? 3 : accessedDone || configuredDone ? 2 : 1;

  const nextNeeded: "accessed" | "configured" | null =
    !accessedDone ? "accessed" : !configuredDone ? "configured" : null;

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const processCsvInBrowser = (text: string, detectedType: "accessed" | "configured") => {
    const rows = parseFullCSV(text);
    if (rows.length === 0) {
      throw new Error("No data rows found in CSV file.");
    }

    // Work on current apps list
    const updatedApps = [...currentApps];
    let newAppsCount = 0;
    let updatedAppsCount = 0;
    let policiesCount = 0;

    for (const r of rows) {
      const appName = (r["App Name"] || "").trim() || "Unnamed App";
      const clientId = (r["Id"] || "").trim();
      if (!clientId && !appName) continue;

      const ownership = (r["Ownership"] || "Third party").trim();
      if (ownership.toLowerCase() === "internal") continue;

      const isVerifiedRaw = (r["Verification Status"] || "").toLowerCase();
      const isVerified =
        isVerifiedRaw.includes("verified") &&
        !isVerifiedRaw.includes("not") &&
        !isVerifiedRaw.includes("unverified");

      const usersCount = parseInt(r["Users"] || "0", 10) || 0;
      const orgUnit = (r["Org Unit"] || "/").trim();
      const accessRaw = (r["Access"] || "UNCONFIGURED").trim().toUpperCase();
      const accessLevel =
        accessRaw === "TRUSTED"
          ? "TRUSTED"
          : accessRaw === "LIMITED"
          ? "LIMITED"
          : accessRaw === "BLOCKED"
          ? "BLOCKED"
          : accessRaw.includes("SPECIFIC")
          ? "SPECIFIC_DATA"
          : "UNCONFIGURED";

      const { services, scopes } = parseRequestedServicesWithScopes(
        r["Requested Services with Scopes"] || ""
      );

      // Match existing app
      const existingIdx = updatedApps.findIndex((app) => {
        if (clientId && (app.clientIds?.includes(clientId) || app.clientId === clientId || app.id === clientId)) {
          return true;
        }
        if (appName && app.displayName && app.displayName.toLowerCase().trim() === appName.toLowerCase().trim()) {
          return true;
        }
        return false;
      });

      if (existingIdx !== -1) {
        // Update existing application
        updatedAppsCount++;
        const target = { ...updatedApps[existingIdx] };

        if (detectedType === "configured") {
          target.adminAccessLevel = accessLevel;
          target.accessPolicy = {
            accessLevel,
            orgUnitPath: orgUnit,
            domainName: "gafe.co.za",
            isOverridden: orgUnit !== "/",
            configuredBy: "Google Admin Console CSV Import (configured)",
            lastPolicyUpdate: new Date().toISOString(),
          };
          if (isVerified) target.isVerified = true;
          policiesCount++;
        } else {
          // Accessed CSV
          target.totalUsersCount = Math.max(target.totalUsersCount || 0, usersCount);
          if (isVerified) target.isVerified = true;
          if (target.adminAccessLevel === "UNCONFIGURED" && accessLevel !== "UNCONFIGURED") {
            target.adminAccessLevel = accessLevel;
          }
          if (clientId && target.clientIds && !target.clientIds.includes(clientId)) {
            target.clientIds = [...target.clientIds, clientId];
            target.clientIdsCount = target.clientIds.length;
          }
          // Merge scopes if present
          if (scopes.length > 0 && target.scopes) {
            const existingScopeUrls = new Set(target.scopes.map((s: any) => s.scope));
            const newScopes = scopes
              .filter((s) => !existingScopeUrls.has(s))
              .map((s) => ({
                scope: s,
                riskLevel: s.includes("admin") || s.includes("mail") || s.includes("drive") ? "HIGH" : "LOW",
                description: s.split("/").pop() || s,
                service: Object.keys(services)[0] || "Google Service",
              }));
            if (newScopes.length > 0) {
              target.scopes = [...target.scopes, ...newScopes];
              target.scopesCount = target.scopes.length;
            }
          }
        }
        updatedApps[existingIdx] = target;
      } else {
        // Insert new application
        newAppsCount++;
        if (detectedType === "configured") {
          policiesCount++;
        }

        const match = clientId.match(/^(\d+)-/);
        const projNum = match ? match[1] : null;
        const iconUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          appName
        )}&background=3B82F6&color=fff&size=128&rounded=true`;

        const newAppItem: any = {
          id: clientId || appName,
          clientId: clientId || undefined,
          familyId: projNum ? `proj_${projNum}` : `app_${Date.now()}_${newAppsCount}`,
          familyName: appName,
          displayName: appName,
          vendor: ownership === "Google owned" ? "Google LLC" : appName || "Third-Party Developer",
          publisherDomain: "",
          category: ownership === "Google owned" ? "Google Workspace Core" : "Configured SaaS",
          appType: r["Type"] || "Web Application",
          deploymentType: r["Type"] || "Web Application",
          compliance: ["Standard Terms"],
          dataHosting: "Unknown",
          breachHistory: null,
          breaches: [],
          breachPenalty: 0,
          breachBracket: "NONE",
          breachDaysElapsed: null,
          verificationPenalty: isVerified ? 0 : 0.35,
          scopeRiskScore: scopes.length > 5 ? 3.5 : 1.5,
          isVerified,
          iconUrl,
          storeUrl: null,
          description: "",
          riskScore: scopes.length > 5 ? 3.5 : 2.0,
          peakScopeScore: scopes.length > 5 ? 4 : 2,
          breadthScore: scopes.length * 0.1,
          avgScopeScore: 2.0,
          riskLevel: scopes.length > 5 ? "MEDIUM" : "LOW",
          riskScoreColor: scopes.length > 5 ? "Amber" : "Green",
          rawMaxRisk: scopes.length > 5 ? "MEDIUM" : "LOW",
          riskReasons: ["Imported via Google Admin Console CSV"],
          adminAccessLevel: accessLevel,
          accessPolicy:
            detectedType === "configured"
              ? {
                  accessLevel,
                  orgUnitPath: orgUnit,
                  domainName: "gafe.co.za",
                  isOverridden: orgUnit !== "/",
                  configuredBy: "Google Admin Console CSV Import (configured)",
                  lastPolicyUpdate: new Date().toISOString(),
                }
              : accessLevel !== "UNCONFIGURED"
              ? {
                  accessLevel,
                  orgUnitPath: orgUnit,
                  domainName: "gafe.co.za",
                  isOverridden: false,
                  configuredBy: "Google Admin Console CSV Import (accessed)",
                  lastPolicyUpdate: new Date().toISOString(),
                }
              : undefined,
          multiClientMapped: false,
          familyDeploymentsCount: 1,
          siblingDeployments: [],
          clientIdsCount: clientId ? 1 : 0,
          clientIds: clientId ? [clientId] : [],
          projectNumbers: projNum ? [projNum] : [],
          totalUsersCount: usersCount,
          adminUsersCount: 0,
          scopesCount: scopes.length,
          scopes: scopes.map((s) => ({
            scope: s,
            riskLevel: s.includes("admin") || s.includes("mail") || s.includes("drive") ? "HIGH" : "LOW",
            description: s.split("/").pop() || s,
            service: Object.keys(services)[0] || "Google Service",
          })),
          servicesTouched: Object.keys(services),
          users: [],
        };
        updatedApps.push(newAppItem);
      }
    }

    const trusted = updatedApps.filter((a) => a.adminAccessLevel === "TRUSTED").length;
    const blocked = updatedApps.filter((a) => a.adminAccessLevel === "BLOCKED").length;
    const limited = updatedApps.filter((a) => a.adminAccessLevel === "LIMITED").length;
    const configured = updatedApps.filter(
      (a) => a.adminAccessLevel && a.adminAccessLevel !== "UNCONFIGURED"
    ).length;

    const metricsUpdate = {
      totalApplications: updatedApps.length,
      configuredAppsCount: configured,
      trustedAppsCount: trusted,
      blockedAppsCount: blocked,
      limitedAppsCount: limited,
    };

    return {
      updatedApps,
      metricsUpdate,
      rowCount: rows.length,
      counts: {
        newApps: newAppsCount,
        updatedApps: updatedAppsCount,
        policiesCount,
      },
    };
  };

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setError("Please upload a .csv file.");
        showToast("Only .csv files are supported.", "error");
        return;
      }

      setUploading(true);

      try {
        const text = await file.text();
        const firstLine = text.split(/\r?\n/)[0];
        const detectedType = detectCsvTypeLocal(firstLine);

        if (detectedType === "unknown") {
          setError(
            "This doesn't look like a Google Workspace app CSV. Please check you've downloaded the correct file from Google Admin Console."
          );
          showToast("Unrecognised CSV format — please try again.", "error");
          setUploading(false);
          return;
        }

        if (detectedType === "accessed" && accessedDone) {
          setError("You've already uploaded the Apps Accessed CSV. Please upload the Apps Configured CSV next.");
          showToast("Apps Accessed already uploaded — please upload Apps Configured.", "info");
          setUploading(false);
          return;
        }

        if (detectedType === "configured" && configuredDone) {
          setError("You've already uploaded the Apps Configured CSV. Both files are done!");
          showToast("Apps Configured already uploaded — both files are done!", "info");
          setUploading(false);
          return;
        }

        // Process data in-browser (fast, robust, runs anywhere)
        const { updatedApps, metricsUpdate, rowCount, counts } = processCsvInBrowser(text, detectedType);

        const uploadResult: UploadResult = {
          type: detectedType,
          rowCount,
          counts,
        };

        setUploaded((prev) => {
          const isBoth =
            (detectedType === "accessed" && !!prev.configured) ||
            (detectedType === "configured" && !!prev.accessed);
          const next: UploadState = {
            ...prev,
            [detectedType]: uploadResult,
            completedAt: isBoth ? new Date().toLocaleString() : prev.completedAt || new Date().toLocaleString(),
          };
          try {
            localStorage.setItem("adminlens_owl_upload_state", JSON.stringify(next));
          } catch (_) {}
          return next;
        });

        // Propagate to parent view
        onAppsImported?.(updatedApps, metricsUpdate);

        const label = detectedType === "accessed" ? "Apps Accessed" : "Apps Configured";
        showToast(`✓ ${label} CSV imported — ${rowCount} apps processed`, "success");

        // Log timeline event for this CSV upload
        const timelineEvent = {
          id: `csv_upload_${Date.now()}_${detectedType}`,
          timestamp: new Date().toISOString(),
          action: "IMPORT",
          actionDisplay: `CSV Ingested (${label})`,
          actorEmail: "admin@gafe.co.za",
          actorName: "Workspace Administrator",
          actorType: "ADMIN",
          appName: `Google Admin Console Export: ${label}`,
          appId: file.name,
          clientId: file.name,
          appIconUrl: "https://www.gstatic.com/images/branding/product/2x/admin_64dp.png",
          target: "gafe.co.za",
          previousState: "Baseline",
          newState: "CSV Ingested",
          changeSummary: `Administrator uploaded ${label} CSV (${file.name}) — ${rowCount} rows processed, ${counts.newApps} new apps, ${counts.updatedApps} updated apps, ${counts.policiesCount} policies.`,
          details: {
            "CSV Export": label,
            "File Name": file.name,
            "Total Rows Processed": rowCount,
            "New Apps Discovered": counts.newApps,
            "Existing Apps Updated": counts.updatedApps,
            "Access Policies Ingested": counts.policiesCount,
            "Ingestion Method": "Google Admin Console Export Import",
            "Domain": "gafe.co.za",
          },
        };
        onEventLogged?.(timelineEvent);

        // Best-effort background sync to backend server if reachable (does not fail if backend is down)
        try {
          const formData = new FormData();
          formData.append("file", file);
          const isLocalhost =
            typeof window !== "undefined" &&
            (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
          const backendUrl = isLocalhost ? "http://localhost:3333/api/import-owl-csv" : "/api/import-owl-csv";

          fetch(backendUrl, { method: "POST", body: formData }).catch((bgErr) => {
            console.debug("Backend sync skipped (running in client mode):", bgErr?.message);
          });
        } catch (_) {}
      } catch (err: any) {
        console.error("CSV import error:", err);
        setError(`Upload failed: ${err.message || "Unable to parse CSV file."}`);
        showToast(`Upload failed: ${err.message || "Failed to process CSV"}`, "error");
      } finally {
        setUploading(false);
      }
    },
    [accessedDone, configuredDone, currentApps, onAppsImported, onEventLogged]
  );

  const handleReset = () => {
    setUploaded({ accessed: null, configured: null, completedAt: null });
    try {
      localStorage.removeItem("adminlens_owl_upload_state");
    } catch (_) {}
    setError(null);
    setToast(null);
  };

  const dropPrompt =
    step === 1
      ? "Upload your first CSV file"
      : step === 2
      ? nextNeeded === "accessed"
        ? "Now upload the Apps Accessed CSV"
        : "Now upload the Apps Configured CSV"
      : "Both files uploaded!";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Import Google Workspace App Data</h1>
            <p className="text-sm text-gray-500">Upload 2 CSV exports from Google Admin Console</p>
          </div>
        </div>
      </div>

      <StepIndicator step={step} />

      {allDone ? (
        <SuccessCard
          uploaded={uploaded}
          onViewApps={() => onNavigateToApps?.()}
          onReset={handleReset}
        />
      ) : (
        <>
          <div className="mb-6 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">What you need</h2>

            <ChecklistItem
              label="Apps Accessed CSV"
              description="All apps that users have accessed — go to Apps tab"
              url={ACCESSED_URL}
              done={accessedDone}
              active={!accessedDone}
            />
            <ChecklistItem
              label="Apps Configured CSV"
              description="Apps with access policies (Trusted / Blocked / Limited) — go to Configured Apps tab"
              url={CONFIGURED_URL}
              done={configuredDone}
              active={accessedDone && !configuredDone}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2.5">
              <span className="text-lg shrink-0">📋</span>
              <div className="text-xs text-amber-800">
                <p className="font-semibold mb-1">How to download from Google Admin:</p>
                <ol className="list-decimal list-inside space-y-1 text-amber-700">
                  <li>
                    Click the <strong>&quot;Get it&quot;</strong> button next to the CSV you need — it opens Google Admin Console
                  </li>
                  <li>
                    In the top-right of the table, click the <strong>Download</strong> (↓) icon to export as CSV
                  </li>
                  <li>
                    Come back here and drop the downloaded file below
                  </li>
                </ol>
              </div>
            </div>
          </div>

          <DropZone
            onFile={handleFile}
            uploading={uploading}
            prompt={dropPrompt}
            disabled={allDone}
          />

          {error && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {(accessedDone || configuredDone) && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs text-blue-700 font-medium">
                {accessedDone && !configuredDone && (
                  <>
                    ✓ Apps Accessed uploaded ({uploaded.accessed!.rowCount} apps) — now upload the{" "}
                    <strong>Apps Configured CSV</strong> to add access policies.
                  </>
                )}
                {configuredDone && !accessedDone && (
                  <>
                    ✓ Apps Configured uploaded ({uploaded.configured!.rowCount} entries) — now upload the{" "}
                    <strong>Apps Accessed CSV</strong> to add usage data.
                  </>
                )}
              </p>
            </div>
          )}

          {(accessedDone || configuredDone) && (
            <div className="mt-4 text-center">
              <button
                onClick={() => onNavigateToApps?.()}
                className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Skip for now — view what&apos;s been imported
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
