"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { GoogleProductIcon, GoogleAdminIcon } from "@/components/google-icons";

export interface ApplicationScope {
  scope: string;
  riskLevel?: string;
  description?: string;
  threatImpact?: string;
  adminScore?: number;
  adminColor?: string;
  googleTier?: string;
  service?: string;
}

export interface ApplicationItem {
  id: string;
  clientId?: string;
  familyId?: string;
  familyName?: string;
  displayName: string;
  vendor: string;
  publisherDomain: string;
  category: string;
  appType: string;
  ownership?: string;
  deploymentType?: string;
  compliance: string[] | string;
  dataHosting: string;
  breachHistory: string | null;
  isVerified: boolean;
  iconUrl: string;
  storeUrl: string | null;
  description?: string;
  riskLevel: string;
  riskScore?: number;
  riskScoreColor?: string;
  peakScopeScore?: number;
  avgScopeScore?: number;
  breadthScore?: number;
  riskReasons?: string[];
  clientIds?: string[];
  clientIdsCount?: number;
  familyDeploymentsCount?: number;
  siblingDeployments?: ApplicationItem[];
  allPlatformTypes?: string[];
  servicesTouched?: string[];
  scopesCount?: number;
  scopes?: ApplicationScope[];
  totalUsersCount?: number;
  adminUsersCount?: number;
  adminAccessLevel?: string;
  accessPolicy?: string;
  adminConsoleUrl?: string;
  users?: any[];
}

export interface ApplicationsViewProps {
  initialApps: ApplicationItem[];
  isBackend?: boolean;
  title?: string;
  hideTitle?: boolean;
}

export default function ApplicationsView({
  initialApps,
  isBackend = true,
  title,
  hideTitle = false,
}: ApplicationsViewProps) {
  const [apps, setApps] = useState<ApplicationItem[]>(initialApps);
  const [viewMode, setViewMode] = useState<"family" | "list">("family");
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());

  // Sync state if initialApps prop changes
  React.useEffect(() => {
    setApps(initialApps);
  }, [initialApps]);

  const toggleExpandFamily = (familyKey: string) => {
    setExpandedFamilies(prev => {
      const next = new Set(prev);
      if (next.has(familyKey)) {
        next.delete(familyKey);
      } else {
        next.add(familyKey);
      }
      return next;
    });
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOwnership, setSelectedOwnership] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedRisk, setSelectedRisk] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedVerified, setSelectedVerified] = useState("ALL");
  const [catalogFilter, setCatalogFilter] = useState<"ALL" | "VERIFIED" | "COMPLIANT" | "HIGH_RISK">("ALL");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Edit & Add Modal State (Catalog mode only)
  const [editingApp, setEditingApp] = useState<ApplicationItem | null>(null);
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenEditFromModal = (app: ApplicationItem) => {
    if (!isBackend) return;
    setSelectedApp(null);
    handleOpenEdit(app);
  };

  const getAdminConsoleLink = (app: ApplicationItem) => {
    if (app.adminConsoleUrl) {
      return {
        url: app.adminConsoleUrl,
        label: "Open in Google Admin (Direct)",
        tabName: "Direct Application Settings",
      };
    }
    if (
      app.familyId === "canva" ||
      app.id?.includes("779010036194") ||
      app.displayName?.toLowerCase().includes("canva")
    ) {
      return {
        url: "https://admin.google.com/ac/owl/list/hVrYyRghrieM9HomrljskXNClraS54Jv5m7GJc1xdn7zBsUIDYT6HKFkNAAvzZm-pcOMsVDHItchukWBaoKt1GmjmG1XBia22rOL8wmcr3o",
        label: "Open in Google Admin (Canva)",
        tabName: "Canva App Settings",
      };
    }
    return {
      url: "https://admin.google.com/ac/owl/list?tab=apps",
      label: "Open in Google Admin (Accessed Apps)",
      tabName: "Accessed Apps",
    };
  };

  const getRiskBadge = (level: string) => {
    switch (level?.toUpperCase()) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span>
            <span>Critical</span>
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
            <span>High</span>
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-semibold text-yellow-800 border border-yellow-200">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-600"></span>
            <span>Moderate</span>
          </span>
        );
      case "MINOR":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
            <span>Minor</span>
          </span>
        );
      case "LOW":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
            <span>Low</span>
          </span>
        );
    }
  };

  const getOwnershipBadge = (ownership?: string) => {
    const own = ownership || "Third party";
    const isGoogle = own.toLowerCase() === "google owned";
    const isThirdParty = own.toLowerCase() === "third party";
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          isGoogle
            ? "bg-blue-50 text-blue-700 border-blue-200"
            : isThirdParty
            ? "bg-purple-50 text-purple-700 border-purple-200"
            : "bg-gray-100 text-gray-700 border-gray-200"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isGoogle
              ? "bg-blue-500"
              : isThirdParty
              ? "bg-purple-500"
              : "bg-gray-400"
          }`}
        />
        {isGoogle ? "Google owned" : isThirdParty ? "Third party" : "Unknown"}
      </span>
    );
  };

  const renderTypeIcon = (type?: string) => {
    const norm = (type || "").toLowerCase();
    if (norm.includes("android")) {
      return (
        <div className="inline-flex items-center" title="Android">
          <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4116 13.8533 8.08 12 8.08s-3.5902.3316-5.1368.8707L4.8409 5.4477a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
          </svg>
        </div>
      );
    }
    if (norm.includes("ios") || norm.includes("apple")) {
      return (
        <div className="inline-flex items-center" title="iOS">
          <svg className="w-5 h-5 text-gray-800" viewBox="0 0 170 170" fill="currentColor">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.8-11.96-14.28-5.86-8.79-10.38-19.16-13.56-31.13-3.18-11.96-4.77-23.23-4.77-33.8 0-14.12 3.69-25.96 11.08-35.53 7.38-9.57 16.59-14.48 27.62-14.73 4.58 0 9.87 1.24 15.87 3.71 6 2.47 10.15 3.77 12.44 3.89 2.07-.12 6.51-1.54 13.31-4.25 6.8-2.72 12.39-3.95 16.78-3.7 12.98.74 23.36 5.68 31.13 14.82-11.23 6.77-16.71 16.14-16.44 28.11.27 9.86 4.13 18.08 11.58 24.66 7.45 6.58 16.29 10.3 26.52 11.16-2.58 7.82-5.77 15.82-9.57 24.01zM119.22 31.97c0-7.28 2.66-14.18 7.99-20.71 5.32-6.53 11.89-10.74 19.7-12.63.13 1.13.2 2.14.2 3.03 0 7.27-2.73 14.18-8.19 20.73-5.46 6.55-12.06 10.75-19.8 12.6-0.12-1.01-.19-2.02-.19-3.02z" />
          </svg>
        </div>
      );
    }
    if (norm.includes("web")) {
      return (
        <div className="inline-flex items-center" title="Web Application">
          <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center" title="Unknown Application Type">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-500 font-bold text-xs border border-gray-300">
          ?
        </span>
      </div>
    );
  };

  const renderTypeIcons = (app: ApplicationItem) => {
    if (viewMode === "family" && app.allPlatformTypes && app.allPlatformTypes.length > 1) {
      return (
        <div className="flex items-center gap-1.5 flex-wrap" title={`Deployments: ${app.allPlatformTypes.join(", ")}`}>
          {app.allPlatformTypes.map((t, idx) => (
            <span key={idx} title={t}>
              {renderTypeIcon(t)}
            </span>
          ))}
        </div>
      );
    }
    return renderTypeIcon(app.appType || app.deploymentType);
  };

  const canonicalServiceName = (raw?: string): string | null => {
    if (!raw) return null;
    const s = raw.toLowerCase().trim();
    if (s === "other" || !s) return null;
    if (s.includes("calendar")) return "Calendar";
    if (s.includes("gmail") || s.includes("mail")) return "Gmail";
    if (s.includes("drive") || s.includes("docs") || s.includes("sheets") || s.includes("slides") || s.includes("spreadsheet")) return "Drive";
    if (s.includes("contact") || s.includes("people") || s.includes("carddav")) return "Contacts";
    if (s.includes("classroom") || s.includes("course") || s.includes("roster")) return "Classroom";
    if (s.includes("chat")) return "Chat";
    if (s.includes("meet")) return "Meet";
    if (s.includes("task")) return "Tasks";
    if (s.includes("vault") || s.includes("ediscovery")) return "Vault";
    if (s.includes("admin") || s.includes("directory") || s.includes("gsuite admin") || s.includes("workspace admin")) return "Google Workspace Admin";
    if (s.includes("apps script") || s.includes("script")) return "Apps Script Runtime";
    if (s.includes("group")) return "Groups";
    if (s.includes("cloud search")) return "Cloud Search";
    if (s.includes("cloud billing") || s.includes("billing")) return "Cloud Billing";
    if (s.includes("cloud platform") || s.includes("gcp") || s.includes("cloud")) return "Cloud Platform";
    if (s.includes("sign-in") || s.includes("signin") || s.includes("identity") || s.includes("sso") || s.includes("openid") || s.includes("userinfo") || s.includes("profile")) return "Google sign-in";
    return raw;
  };

  const getAppServices = (app: ApplicationItem): string[] => {
    const set = new Set<string>();

    const process = (item: ApplicationItem) => {
      (item.servicesTouched || []).forEach(s => {
        const canonical = canonicalServiceName(s);
        if (canonical) set.add(canonical);
      });
      (item.scopes || []).forEach(sc => {
        const canonical = canonicalServiceName(sc.service || sc.scope);
        if (canonical) set.add(canonical);
      });
    };

    process(app);

    if (viewMode === "family" && app.siblingDeployments && app.siblingDeployments.length > 0) {
      app.siblingDeployments.forEach(process);
    }

    if (set.size > 1 && set.has("Google sign-in")) {
      set.delete("Google sign-in");
    }

    return Array.from(set);
  };

  const getTierBadge = (tier?: string) => {
    switch (tier?.toLowerCase()) {
      case "restricted":
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border bg-red-50 text-red-700 border-red-200">
            Restricted
          </span>
        );
      case "sensitive":
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border bg-amber-50 text-amber-800 border-amber-200">
            Sensitive
          </span>
        );
      default:
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border bg-gray-50 text-gray-600 border-gray-200">
            {tier || "Non-Sensitive"}
          </span>
        );
    }
  };

  const getScoreBadge = (score?: number) => {
    switch (score) {
      case 5:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">
            🔴 Critical
          </span>
        );
      case 4:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-200">
            🟠 High
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border bg-yellow-50 text-yellow-850 border-yellow-200">
            🟡 Moderate
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
            🟢 Minor
          </span>
        );
      case 1:
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-800 border-blue-200">
            🔵 Low
          </span>
        );
    }
  };

  // Form State for editing or adding (Backend Catalog mode only)
  const [formData, setFormData] = useState({
    id: "",
    displayName: "",
    vendor: "",
    publisherDomain: "",
    ownership: "Third party",
    category: "Configured SaaS",
    appType: "Web Application",
    riskLevel: "LOW",
    isVerified: false,
    iconUrl: "",
    storeUrl: "",
    dataHosting: "USA",
    compliance: "SOC 2, GDPR",
    description: ""
  });

  // Extract unique categories for filter dropdown
  const categories = useMemo(() => {
    const set = new Set<string>();
    apps.forEach(a => {
      if (a.category) set.add(a.category);
    });
    return Array.from(set).sort();
  }, [apps]);

  // Group applications by Application Family
  const familyGroupedApps = useMemo(() => {
    const familyMap = new Map<string, ApplicationItem[]>();
    apps.forEach(app => {
      const fId = app.familyId || app.id;
      if (!familyMap.has(fId)) {
        familyMap.set(fId, []);
      }
      familyMap.get(fId)!.push(app);
    });

    const grouped: ApplicationItem[] = [];
    familyMap.forEach(members => {
      // Sort members: highest totalUsersCount, then isVerified === true, then most scopes
      const sorted = [...members].sort((a, b) => {
        const uA = a.totalUsersCount || 0;
        const uB = b.totalUsersCount || 0;
        if (uB !== uA) return uB - uA;
        if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
        const sA = a.scopes?.length || a.scopesCount || 0;
        const sB = b.scopes?.length || b.scopesCount || 0;
        return sB - sA;
      });

      const primary = sorted[0];
      const allPlatformTypes = Array.from(
        new Set(members.map(m => m.appType || m.deploymentType).filter(Boolean) as string[])
      );
      const siblingDeployments = sorted.slice(1);

      const allServicesTouched = Array.from(
        new Set(
          members.flatMap(m => {
            const list: string[] = [...(m.servicesTouched || [])];
            (m.scopes || []).forEach(sc => {
              if (sc.service) list.push(sc.service);
            });
            return list;
          })
        )
      );

      grouped.push({
        ...primary,
        familyDeploymentsCount: members.length,
        siblingDeployments: siblingDeployments,
        allPlatformTypes: allPlatformTypes,
        servicesTouched: allServicesTouched,
      });
    });

    return grouped;
  }, [apps]);

  // Active dataset driven by viewMode
  const activeDataset = useMemo(() => {
    return viewMode === "family" ? familyGroupedApps : apps;
  }, [viewMode, familyGroupedApps, apps]);

  // Metrics summary (strictly excluding any internal applications)
  const metrics = useMemo(() => {
    const nonInternal = activeDataset.filter(a => {
      const isInternal =
        a.ownership === "Internal" ||
        (a.vendor && a.vendor.toLowerCase().includes("internal")) ||
        (a.category && a.category.toLowerCase().includes("internal")) ||
        (a.description && a.description.toLowerCase().includes("internal domain tool")) ||
        (a.description && a.description.toLowerCase().includes("custom google apps script")) ||
        (Array.isArray(a.compliance) && a.compliance.includes("Internal Tenant Only"));
      return !isInternal;
    });

    const total = nonInternal.length;
    const verified = nonInternal.filter(a => a.isVerified).length;
    const googleOwned = nonInternal.filter(a => a.ownership?.toLowerCase() === "google owned").length;
    const thirdParty = nonInternal.filter(a => a.ownership?.toLowerCase() === "third party").length;
    const unknownOwnership = nonInternal.filter(a => a.ownership?.toLowerCase() === "unknown").length;
    const highCritical = nonInternal.filter(a => a.riskLevel === "CRITICAL" || a.riskLevel === "HIGH").length;
    const compliant = nonInternal.filter(a => a.compliance && (Array.isArray(a.compliance) ? a.compliance.length > 0 : Boolean(a.compliance))).length;
    return { total, verified, googleOwned, thirdParty, unknownOwnership, highCritical, compliant };
  }, [activeDataset]);

  // Filtering
  const filteredApps = useMemo(() => {
    return activeDataset.filter(app => {
      // Exclude any internal apps
      const isInternal =
        app.ownership === "Internal" ||
        (app.vendor && app.vendor.toLowerCase().includes("internal")) ||
        (app.category && app.category.toLowerCase().includes("internal")) ||
        (app.description && app.description.toLowerCase().includes("internal domain tool")) ||
        (app.description && app.description.toLowerCase().includes("custom google apps script")) ||
        (Array.isArray(app.compliance) && app.compliance.includes("Internal Tenant Only"));
      if (isInternal) return false;

      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        app.displayName.toLowerCase().includes(term) ||
        (app.vendor && app.vendor.toLowerCase().includes(term)) ||
        (app.publisherDomain && app.publisherDomain.toLowerCase().includes(term)) ||
        app.id.toLowerCase().includes(term) ||
        (app.category && app.category.toLowerCase().includes(term)) ||
        (app.ownership && app.ownership.toLowerCase().includes(term));

      const matchesOwnership = selectedOwnership === "ALL" || app.ownership?.toLowerCase() === selectedOwnership.toLowerCase();
      const matchesCat = selectedCategory === "ALL" || app.category === selectedCategory;
      const matchesRisk = selectedRisk === "ALL" || app.riskLevel === selectedRisk;
      const matchesType =
        selectedType === "ALL" ||
        app.appType === selectedType ||
        app.deploymentType === selectedType ||
        (app.allPlatformTypes && app.allPlatformTypes.includes(selectedType));
      const matchesVerified =
        selectedVerified === "ALL" ||
        (selectedVerified === "VERIFIED" && app.isVerified) ||
        (selectedVerified === "UNVERIFIED" && !app.isVerified);

      const hasCompliance = app.compliance && (Array.isArray(app.compliance) ? app.compliance.length > 0 : Boolean(app.compliance));
      const isHighRisk = app.riskLevel === "CRITICAL" || app.riskLevel === "HIGH";

      const matchesTab =
        catalogFilter === "ALL" ||
        (catalogFilter === "VERIFIED" && app.isVerified) ||
        (catalogFilter === "COMPLIANT" && hasCompliance) ||
        (catalogFilter === "HIGH_RISK" && isHighRisk);

      return matchesSearch && matchesOwnership && matchesCat && matchesRisk && matchesType && matchesVerified && matchesTab;
    });
  }, [activeDataset, searchTerm, selectedOwnership, selectedCategory, selectedRisk, selectedType, selectedVerified, catalogFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredApps.length / pageSize) || 1;
  const paginatedApps = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredApps.slice(start, start + pageSize);
  }, [filteredApps, currentPage, pageSize]);

  // Open Edit Modal (Backend only)
  const handleOpenEdit = (app: ApplicationItem) => {
    if (!isBackend) return;
    setEditingApp(app);
    setIsAddingNew(false);
    setFormData({
      id: app.id,
      displayName: app.displayName || "",
      vendor: app.vendor || "",
      publisherDomain: app.publisherDomain || "",
      ownership: app.ownership || "Third party",
      category: app.category || "Configured SaaS",
      appType: app.appType || app.deploymentType || "Web Application",
      riskLevel: app.riskLevel || "LOW",
      isVerified: Boolean(app.isVerified),
      iconUrl: app.iconUrl || "",
      storeUrl: app.storeUrl || "",
      dataHosting: app.dataHosting || "USA",
      compliance: Array.isArray(app.compliance) ? app.compliance.join(", ") : "",
      description: app.description || ""
    });
  };

  // Open Add New Modal (Backend only)
  const handleOpenAdd = () => {
    if (!isBackend) return;
    setEditingApp(null);
    setIsAddingNew(true);
    setFormData({
      id: "",
      displayName: "",
      vendor: "",
      publisherDomain: "",
      ownership: "Third party",
      category: "AI & Machine Learning",
      appType: "Web Application",
      riskLevel: "LOW",
      isVerified: true,
      iconUrl: "",
      storeUrl: "",
      dataHosting: "USA",
      compliance: "SOC 2 Type II, GDPR",
      description: ""
    });
  };

  // Close Edit/Add Modal
  const handleCloseModal = () => {
    setEditingApp(null);
    setIsAddingNew(false);
  };

  // Save changes (Backend only)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBackend) return;
    setIsSaving(true);

    const complianceArray = formData.compliance
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      id: isAddingNew ? formData.id.trim() : editingApp!.id,
      displayName: formData.displayName.trim(),
      vendor: formData.vendor.trim() || formData.displayName.trim(),
      publisherDomain: formData.publisherDomain.trim().toLowerCase(),
      ownership: formData.ownership || "Third party",
      category: formData.category,
      appType: formData.appType,
      riskLevel: formData.riskLevel,
      isVerified: formData.isVerified,
      iconUrl: formData.iconUrl.trim() || (formData.publisherDomain ? `https://www.google.com/s2/favicons?domain=${formData.publisherDomain.trim().toLowerCase()}&sz=128` : `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.displayName)}&background=3B82F6&color=fff&size=64`),
      storeUrl: formData.storeUrl.trim() || null,
      dataHosting: formData.dataHosting,
      compliance: complianceArray,
      description: formData.description
    };

    if (isAddingNew && !payload.id) {
      alert("Application ID is required.");
      setIsSaving(false);
      return;
    }

    try {
      if (isAddingNew) {
        const newAppItem: ApplicationItem = {
          ...payload,
          breachHistory: null,
          riskScore: payload.riskLevel === "CRITICAL" ? 4.5 : payload.riskLevel === "HIGH" ? 3.5 : payload.riskLevel === "MEDIUM" ? 2.5 : 1.0,
          riskScoreColor: payload.riskLevel === "CRITICAL" ? "Red" : payload.riskLevel === "HIGH" ? "Orange" : payload.riskLevel === "MEDIUM" ? "Yellow" : "Green",
          scopesCount: 1,
          totalUsersCount: 0,
          adminUsersCount: 0,
          adminAccessLevel: "UNCONFIGURED"
        };
        setApps(prev => [newAppItem, ...prev]);
        setToastMessage(`✓ Successfully added "${payload.displayName}" to Database`);
      } else {
        setApps(prev =>
          prev.map(item => (item.id === editingApp!.id ? { ...item, ...payload } : item))
        );
        setToastMessage(`✓ Successfully updated "${payload.displayName}"`);
      }

      fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(() => {});

      setTimeout(() => setToastMessage(null), 4000);
      handleCloseModal();
    } catch (err: any) {
      alert(`Error saving application: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const baseHeaders = ["App Name", "Vendor", "Domain", "Ownership", "Category", "Type", "Risk Level", "Verified", "Id"];
    const headers = isBackend ? baseHeaders : [...baseHeaders, "Users"];
    const rows = apps.map(a => {
      const row = [
        `"${(a.displayName || "").replace(/"/g, '""')}"`,
        `"${(a.vendor || "").replace(/"/g, '""')}"`,
        `"${(a.publisherDomain || "").replace(/"/g, '""')}"`,
        `"${(a.ownership || "Third party").replace(/"/g, '""')}"`,
        `"${(a.category || "").replace(/"/g, '""')}"`,
        `"${(a.appType || a.deploymentType || "").replace(/"/g, '""')}"`,
        `"${(a.riskLevel || "").replace(/"/g, '""')}"`,
        a.isVerified ? "Verified" : "Unverified",
        `"${(a.id || "").replace(/"/g, '""')}"`
      ];
      if (!isBackend) {
        row.push(String(a.totalUsersCount || (a.users ? a.users.length : 0)));
      }
      return row;
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const filename = isBackend ? `adminlens_central_catalog_${new Date().toISOString().slice(0, 10)}.csv` : `adminlens_client_apps_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const headerTitle = title || (isBackend ? "Application Repository" : "Applications");

  return (
    <div className="w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-gray-700 animate-slide-up">
          <svg className="w-5 h-5 text-emerald-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      {!hideTitle && (
        <div className="sm:flex sm:justify-between sm:items-center mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">
              {headerTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {isBackend && (
              <button
                onClick={handleOpenAdd}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 16 16">
                  <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                </svg>
                <span>Add Global App</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold uppercase text-gray-400">
            {isBackend ? "Total Global Catalog" : "Total Applications"}
          </div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{metrics.total.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 truncate">
            <span className="text-blue-600 font-semibold">{metrics.googleOwned} Google</span> ·{" "}
            <span className="text-purple-600 font-semibold">{metrics.thirdParty} Third Party</span> ·{" "}
            <span className="text-gray-500 font-semibold">{metrics.unknownOwnership} Unknown</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold uppercase text-gray-400">Google Verified Apps</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{metrics.verified.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics.total > 0 ? ((metrics.verified / metrics.total) * 100).toFixed(1) : "0.0"}% marketplace certified
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold uppercase text-gray-400">Enterprise Compliant</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{metrics.compliant.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">SOC 2, ISO 27001, GDPR audited</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold uppercase text-gray-400">High &amp; Critical Threat</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{metrics.highCritical.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Risk matrix assessment</div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs mb-6 space-y-4">
        {/* Scope Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => { setCatalogFilter("ALL"); setCurrentPage(1); }}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              catalogFilter === "ALL"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            All Applications ({metrics.total.toLocaleString()})
          </button>
          <button
            onClick={() => { setCatalogFilter("VERIFIED"); setCurrentPage(1); }}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              catalogFilter === "VERIFIED"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Google Verified ({metrics.verified.toLocaleString()})
          </button>
          <button
            onClick={() => { setCatalogFilter("COMPLIANT"); setCurrentPage(1); }}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              catalogFilter === "COMPLIANT"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Enterprise Compliant ({metrics.compliant.toLocaleString()})
          </button>
          <button
            onClick={() => { setCatalogFilter("HIGH_RISK"); setCurrentPage(1); }}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              catalogFilter === "HIGH_RISK"
                ? "border-rose-600 text-rose-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            High &amp; Critical Risk ({metrics.highCritical.toLocaleString()})
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 pt-1">
          {/* Search Input */}
          <div className="md:col-span-3 relative">
            <input
              type="text"
              placeholder="Search name, vendor, domain, or Client ID..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Ownership Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedOwnership}
              onChange={e => {
                setSelectedOwnership(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Ownership ({metrics.total.toLocaleString()})</option>
              <option value="Google owned">Google owned ({metrics.googleOwned.toLocaleString()})</option>
              <option value="Third party">Third party ({metrics.thirdParty.toLocaleString()})</option>
              <option value="Unknown">Unknown ({metrics.unknownOwnership.toLocaleString()})</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Risk Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedRisk}
              onChange={e => {
                setSelectedRisk(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">🔴 Critical Risk</option>
              <option value="HIGH">🟠 High Risk</option>
              <option value="MEDIUM">🟡 Medium Risk</option>
              <option value="LOW">🔵 Low Risk</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedType}
              onChange={e => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All App Types</option>
              <option value="Web Application">Web Application</option>
              <option value="Android">Android</option>
              <option value="iOS">iOS</option>
              <option value="Unknown Application Type">Unknown Application Type</option>
            </select>
          </div>

          {/* Verification Status */}
          <div className="md:col-span-1">
            <select
              value={selectedVerified}
              onChange={e => {
                setSelectedVerified(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-2 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Verified?</option>
              <option value="VERIFIED">Verified</option>
              <option value="UNVERIFIED">Unverified</option>
            </select>
          </div>
        </div>

        {/* Results summary, View Mode Switcher, and Active filters reset */}
        <div className="flex flex-wrap justify-between items-center gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-gray-800">{filteredApps.length.toLocaleString()}</strong> matching {viewMode === "family" ? "application families" : "client deployments"}
              {searchTerm && ` for "${searchTerm}"`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle Switcher */}
            <div className="inline-flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 shadow-2xs">
              <button
                type="button"
                onClick={() => { setViewMode("family"); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  viewMode === "family"
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Group by App Family
              </button>
              <button
                type="button"
                onClick={() => { setViewMode("list"); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  viewMode === "list"
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                List View
              </button>
            </div>

            {(searchTerm || selectedOwnership !== "ALL" || selectedCategory !== "ALL" || selectedRisk !== "ALL" || selectedType !== "ALL" || selectedVerified !== "ALL" || catalogFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedOwnership("ALL");
                  setSelectedCategory("ALL");
                  setSelectedRisk("ALL");
                  setSelectedType("ALL");
                  setSelectedVerified("ALL");
                  setCatalogFilter("ALL");
                  setCurrentPage(1);
                }}
                className="text-emerald-600 hover:text-emerald-800 font-medium hover:underline"
              >
                Reset all filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-semibold uppercase text-gray-500 tracking-wider">
                <th className="py-3 px-4">Application</th>
                <th className="py-3 px-4">Vendor &amp; Domain</th>
                <th className="py-3 px-4">Ownership</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Compliance &amp; Hosting</th>
                <th className="py-3 px-4">Risk Level</th>
                {!isBackend && <th className="py-3 px-4 text-center">Users</th>}
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {paginatedApps.length === 0 ? (
                <tr>
                  <td colSpan={isBackend ? 7 : 8} className="py-12 text-center text-gray-400">
                    {apps.length === 0
                      ? isBackend
                        ? "No applications found in the central database."
                        : "No applications found in client workspace."
                      : "No applications matched your search or filters."}
                  </td>
                </tr>
              ) : (
                paginatedApps.map(app => {
                  const familyKey = app.familyId || app.id;
                  const hasDeployments = viewMode === "family" && Boolean(app.siblingDeployments && app.siblingDeployments.length > 0);
                  const isExpanded = hasDeployments && expandedFamilies.has(familyKey);
                  const usersCount = app.totalUsersCount || (app.users ? app.users.length : 0);

                  return (
                    <React.Fragment key={app.id}>
                      <tr
                        key={app.id}
                        onClick={() => setSelectedApp(app)}
                        className={`hover:bg-emerald-50/40 transition-colors cursor-pointer group ${isExpanded ? "bg-emerald-50/15" : ""}`}
                      >
                        {/* Application Info */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            {/* Collapse / Expand Arrow Pointer for Multi-Deployment Families */}
                            {hasDeployments ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpandFamily(familyKey);
                                }}
                                className="w-6 h-6 flex items-center justify-center rounded-md text-gray-500 hover:text-emerald-700 hover:bg-emerald-100/80 transition-all shrink-0 focus:outline-hidden"
                                title={isExpanded ? "Collapse child deployments" : `Unpack ${app.familyDeploymentsCount} deployments in table`}
                              >
                                <svg
                                  className={`w-4.5 h-4.5 transition-transform duration-200 ${isExpanded ? "rotate-90 text-emerald-700" : ""}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            ) : (
                              <span className="w-6 shrink-0" />
                            )}

                            <img
                              src={app.iconUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.displayName)}&background=3B82F6&color=fff&size=64`}
                              alt={app.displayName}
                              className="w-9 h-9 rounded-lg object-contain bg-white border border-gray-200 shrink-0 p-0.5"
                              onError={(e: any) => {
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.displayName)}&background=3B82F6&color=fff&size=64`;
                              }}
                            />
                            <div className="min-w-0 max-w-sm sm:max-w-md">
                              <div className="flex items-center gap-2 whitespace-nowrap">
                                <span className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors truncate" title={app.displayName}>
                                  {app.displayName}
                                </span>
                                {app.isVerified && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full shrink-0" title="Google Workspace Verified">
                                    <svg className="w-3 h-3 text-blue-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Verified
                                  </span>
                                )}
                                {hasDeployments && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleExpandFamily(familyKey);
                                    }}
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 transition-colors cursor-pointer ${
                                      isExpanded
                                        ? "bg-emerald-600 text-white border-emerald-700 shadow-2xs"
                                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    }`}
                                    title={isExpanded ? "Collapse child deployments" : `Click to unpack ${app.familyDeploymentsCount} child deployments in table`}
                                  >
                                    <span>{app.familyDeploymentsCount} Deployments</span>
                                    <svg className={`w-2.5 h-2.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-gray-400 truncate" title={app.id}>
                                {app.id}
                              </div>
                              {/* Accessed Google Services Icons */}
                              {getAppServices(app).length > 0 && (
                                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                                  {getAppServices(app).map((svc) => (
                                    <span
                                      key={svc}
                                      title={svc}
                                      className="inline-flex items-center justify-center p-0.5 rounded-md bg-white border border-gray-200 shadow-2xs hover:border-gray-300 transition-colors"
                                    >
                                      <GoogleProductIcon service={svc} className="w-3.5 h-3.5" />
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Vendor & Domain */}
                        <td className="py-3 px-4">
                          <div className="text-gray-800 font-medium truncate max-w-[180px]" title={app.vendor}>
                            {app.vendor || "—"}
                          </div>
                          {app.publisherDomain ? (
                            <a
                              href={`https://${app.publisherDomain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                              {app.publisherDomain}
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">Unspecified domain</span>
                          )}
                        </td>

                        {/* Ownership */}
                        <td className="py-3 px-4">
                          {getOwnershipBadge(app.ownership)}
                        </td>

                        {/* Type */}
                        <td className="py-3 px-4">
                          {renderTypeIcons(app)}
                        </td>

                        {/* Compliance & Hosting */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap items-center gap-1.5 max-w-[220px]">
                            {app.compliance && (Array.isArray(app.compliance) ? app.compliance.length > 0 : Boolean(app.compliance)) ? (
                              <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                {Array.isArray(app.compliance) ? app.compliance[0] : String(app.compliance).split(",")[0]}
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-400">Standard</span>
                            )}
                            {app.dataHosting && (
                              <span className="text-[10px] text-gray-500 font-mono">
                                {app.dataHosting}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Risk Level */}
                        <td className="py-3 px-4">
                          {getRiskBadge(app.riskLevel)}
                        </td>

                        {/* Users Footprint (Client mode only) */}
                        {!isBackend && (
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {usersCount > 0 ? (
                              <div className="flex flex-col items-center justify-center">
                                <span className="font-bold text-gray-900 text-xs">
                                  {usersCount.toLocaleString()} {usersCount === 1 ? "user" : "users"}
                                </span>
                                {app.adminUsersCount && app.adminUsersCount > 0 ? (
                                  <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.2 mt-0.5">
                                    ⚠️ {app.adminUsersCount} admin
                                  </span>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 font-mono">
                                0 users
                              </span>
                            )}
                          </td>
                        )}

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          {isBackend ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(app);
                              }}
                              className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-gray-100 text-emerald-700 border border-gray-200 rounded-lg shadow-2xs transition-colors"
                            >
                              Edit
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedApp(app);
                              }}
                              className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg shadow-2xs transition-colors"
                            >
                              Inspect
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Unpacked Child Deployments */}
                      {isExpanded && app.siblingDeployments?.map((child, childIdx) => {
                        const childUsersCount = child.totalUsersCount || (child.users ? child.users.length : 0);
                        return (
                          <tr
                            key={child.id || `${app.id}-child-${childIdx}`}
                            onClick={() => setSelectedApp(child)}
                            className="bg-emerald-50/20 hover:bg-emerald-50/50 transition-colors cursor-pointer border-l-4 border-l-emerald-500 border-b border-gray-100/90 group"
                          >
                            {/* Child Application Info (Indented with branch connector) */}
                            <td className="py-2.5 px-4 pl-10">
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-500 font-mono text-sm select-none" title="Child Deployment">
                                  ↳
                                </span>
                                <img
                                  src={child.iconUrl || app.iconUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(child.displayName)}&background=3B82F6&color=fff&size=64`}
                                  alt={child.displayName}
                                  className="w-7 h-7 rounded-md object-contain bg-white border border-gray-200 shrink-0 p-0.5"
                                  onError={(e: any) => {
                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(child.displayName)}&background=3B82F6&color=fff&size=64`;
                                  }}
                                />
                                <div className="min-w-0 max-w-sm sm:max-w-md">
                                  <div className="flex items-center gap-2 whitespace-nowrap">
                                    <span className="font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors text-xs truncate" title={child.displayName}>
                                      {child.displayName}
                                    </span>
                                    {child.isVerified && (
                                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-full shrink-0" title="Google Workspace Verified">
                                        <svg className="w-2.5 h-2.5 text-blue-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Verified
                                      </span>
                                    )}
                                    <span className="text-[10px] text-gray-400 font-medium">
                                      (Deployment #{childIdx + 2})
                                    </span>
                                  </div>
                                  <div className="text-[10px] font-mono text-gray-400 truncate" title={child.id}>
                                    {child.id}
                                  </div>
                                  {/* Child Services Icons */}
                                  {getAppServices(child).length > 0 && (
                                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                                      {getAppServices(child).map((svc) => (
                                        <span
                                          key={svc}
                                          title={svc}
                                          className="inline-flex items-center justify-center p-0.5 rounded bg-white border border-gray-200 shadow-2xs hover:border-gray-300 transition-colors"
                                        >
                                          <GoogleProductIcon service={svc} className="w-3 h-3" />
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Vendor & Domain */}
                            <td className="py-2.5 px-4 text-xs">
                              <div className="text-gray-700 truncate max-w-[180px]" title={child.vendor || app.vendor}>
                                {child.vendor || app.vendor || "—"}
                              </div>
                              {(child.publisherDomain || app.publisherDomain) && (
                                <span className="text-[11px] text-gray-400 font-mono">
                                  {child.publisherDomain || app.publisherDomain}
                                </span>
                              )}
                            </td>

                            {/* Ownership */}
                            <td className="py-2.5 px-4 text-xs">
                              {getOwnershipBadge(child.ownership || app.ownership)}
                            </td>

                            {/* Type */}
                            <td className="py-2.5 px-4">
                              {renderTypeIcon(child.appType || child.deploymentType)}
                            </td>

                            {/* Compliance & Hosting */}
                            <td className="py-2.5 px-4 text-xs">
                              <div className="flex flex-wrap items-center gap-1.5 max-w-[220px]">
                                {child.compliance && (Array.isArray(child.compliance) ? child.compliance.length > 0 : Boolean(child.compliance)) ? (
                                  <span className="inline-flex items-center text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded">
                                    {Array.isArray(child.compliance) ? child.compliance[0] : String(child.compliance).split(",")[0]}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-gray-400">Standard</span>
                                )}
                                {(child.dataHosting || app.dataHosting) && (
                                  <span className="text-[9px] text-gray-500 font-mono">
                                    {child.dataHosting || app.dataHosting}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Risk Level */}
                            <td className="py-2.5 px-4">
                              {getRiskBadge(child.riskLevel)}
                            </td>

                            {/* Child Users Footprint (Client mode only) */}
                            {!isBackend && (
                              <td className="py-2.5 px-4 text-center whitespace-nowrap">
                                {childUsersCount > 0 ? (
                                  <span className="font-semibold text-gray-800 text-xs">
                                    {childUsersCount.toLocaleString()} {childUsersCount === 1 ? "user" : "users"}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400 font-mono">
                                    0 users
                                  </span>
                                )}
                              </td>
                            )}

                            {/* Actions */}
                            <td className="py-2.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedApp(child);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md shadow-2xs transition-colors"
                              >
                                Inspect
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="py-1 px-2 border border-gray-200 rounded text-xs text-gray-700"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>per page</span>
            <span className="ml-2 font-mono text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* APPLICATION INSPECTION POP-UP MODAL (READ-ONLY IN CLIENT MODE) */}
      {/* ============================================================== */}
      {selectedApp && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedApp(null)}
        >
          <div 
            className="bg-white border border-gray-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-start justify-between bg-gradient-to-r from-gray-50/80 to-white">
              <div className="flex items-start sm:items-center gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-gray-200 bg-white p-2 shadow-xs flex items-center justify-center shrink-0">
                  <img
                    src={selectedApp.iconUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedApp.displayName)}&background=3B82F6&color=fff&size=64`}
                    alt={selectedApp.displayName}
                    className="w-full h-full object-contain rounded-xl"
                    onError={(e: any) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedApp.displayName)}&background=3B82F6&color=fff&size=64`;
                    }}
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                      {selectedApp.displayName}
                    </h2>
                    <div className="inline-flex items-center" title={`Application Type: ${selectedApp.appType || selectedApp.deploymentType || "Web Application"}`}>
                      {renderTypeIcon(selectedApp.appType || selectedApp.deploymentType)}
                    </div>
                    {getOwnershipBadge(selectedApp.ownership)}
                    {selectedApp.isVerified ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold inline-flex items-center gap-1">
                        <svg className="w-3 h-3 text-blue-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 font-medium">
                        Unverified
                      </span>
                    )}
                    {getRiskBadge(selectedApp.riskLevel)}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500 mt-2">
                    <span className="font-semibold text-gray-800">{selectedApp.vendor || "Unknown Vendor"}</span>
                    <span>•</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">{selectedApp.category || "Unclassified"}</span>
                    {selectedApp.publisherDomain && (
                      <>
                        <span>•</span>
                        <a
                          href={`https://${selectedApp.publisherDomain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline font-mono inline-flex items-center gap-1"
                        >
                          🌐 {selectedApp.publisherDomain}
                        </a>
                      </>
                    )}
                    {selectedApp.storeUrl && (
                      <>
                        <span>•</span>
                        <a
                          href={selectedApp.storeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 hover:underline inline-flex items-center gap-1 font-medium"
                        >
                          🛒 Store Listing ↗
                        </a>
                      </>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <a
                      href={getAdminConsoleLink(selectedApp).url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border shadow-xs transition-all bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 ring-2 ring-emerald-500/20"
                      title={getAdminConsoleLink(selectedApp).label}
                    >
                      <GoogleAdminIcon className="w-4 h-4 text-white" />
                      <span>{getAdminConsoleLink(selectedApp).label} ↗</span>
                    </a>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors -mr-2 -mt-2 text-base"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Trust, Compliance & Security Posture */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                  <div className="text-gray-500 font-medium">Ownership</div>
                  <div className="font-semibold text-gray-800 mt-0.5 truncate">
                    {selectedApp.ownership || "Third party"}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                  <div className="text-gray-500 font-medium">Data Residency</div>
                  <div className="font-bold text-gray-800 mt-0.5 truncate">
                    📍 {selectedApp.dataHosting || "Global / Unspecified"}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                  <div className="text-gray-500 font-medium">Compliance</div>
                  <div className="font-semibold text-gray-800 mt-0.5 truncate">
                    {Array.isArray(selectedApp.compliance)
                      ? selectedApp.compliance.join(", ") || "Standard Terms"
                      : selectedApp.compliance || "Standard Terms"}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                  <div className="text-gray-500 font-medium">Breach History</div>
                  <div className={`font-semibold mt-0.5 truncate ${selectedApp.breachHistory ? 'text-red-600 font-bold' : 'text-emerald-700'}`}>
                    {selectedApp.breachHistory || '✓ No Public Incidents'}
                  </div>
                </div>
              </div>

              {/* Requested Scopes */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Requested Scopes ({selectedApp.scopes?.length || selectedApp.scopesCount || 0})
                  </h3>
                  <span className="text-[11px] text-gray-500 font-medium">Google Workspace OAuth Permissions</span>
                </div>
                
                {selectedApp.scopes && selectedApp.scopes.length > 0 ? (
                  <div className="space-y-2 text-xs">
                    {selectedApp.scopes.map((s, i) => (
                      <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1.5">
                        <div className="flex justify-between items-center gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 bg-white rounded p-0.5 border border-gray-200/60 flex items-center justify-center shrink-0">
                              <GoogleProductIcon service={s.service || s.scope} className="w-4 h-4" />
                            </div>
                            <span className="truncate font-mono text-gray-800 font-semibold">{s.scope}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {getTierBadge(s.googleTier)}
                            {getScoreBadge(s.adminScore)}
                          </div>
                        </div>
                        {s.description && (
                          <div className="text-[11px] text-gray-600 pl-8">
                            <span className="font-semibold text-gray-700">{s.description}:</span> {s.threatImpact || ''}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500 text-center">
                    No elevated or sensitive Google Workspace OAuth scopes registered for this application.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-xs text-gray-500">
              <div>
                ID: <span className="font-mono text-gray-700 truncate max-w-xs inline-block align-bottom">{selectedApp.id}</span>
              </div>
              <div className="flex items-center gap-2">
                {isBackend && (
                  <button
                    type="button"
                    onClick={() => handleOpenEditFromModal(selectedApp)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors shadow-2xs text-xs"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Application
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Application Modal (Backend Catalog mode only) */}
      {isBackend && (editingApp || isAddingNew) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <img
                  src={formData.iconUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.displayName || 'App')}&background=10B981&color=fff&size=64`}
                  alt="Icon Preview"
                  className="w-10 h-10 rounded-xl border border-gray-200 p-0.5 object-contain bg-white"
                  onError={(e: any) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.displayName || 'App')}&background=10B981&color=fff&size=64`;
                  }}
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {isAddingNew ? "Register New Global Application" : "Edit Global Application Details"}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono truncate max-w-sm">
                    {isAddingNew ? "Adding to Central Knowledge Base" : editingApp?.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Application ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isAddingNew}
                    value={formData.id}
                    onChange={e => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono disabled:bg-gray-100"
                    placeholder="e.g. 123456789.apps.googleusercontent.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Display Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold"
                    placeholder="e.g. Slack, Zoom, HubSpot"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Vendor / Developer
                  </label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    placeholder="e.g. Slack Technologies LLC"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Publisher Domain
                  </label>
                  <input
                    type="text"
                    value={formData.publisherDomain}
                    onChange={e => setFormData({ ...formData, publisherDomain: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono"
                    placeholder="e.g. slack.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Ownership
                  </label>
                  <select
                    value={formData.ownership}
                    onChange={e => setFormData({ ...formData, ownership: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                  >
                    <option value="Google owned">Google owned</option>
                    <option value="Third party">Third party</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                  >
                    <option value="Productivity & Collaboration">Productivity &amp; Collaboration</option>
                    <option value="Communication & Messaging">Communication &amp; Messaging</option>
                    <option value="Developer & Cloud Infrastructure">Developer &amp; Cloud Infrastructure</option>
                    <option value="Security & Compliance">Security &amp; Compliance</option>
                    <option value="Analytics & BI">Analytics &amp; BI</option>
                    <option value="AI & Machine Learning">AI &amp; Machine Learning</option>
                    <option value="Sales & CRM">Sales &amp; CRM</option>
                    <option value="Education & Learning">Education &amp; Learning</option>
                    <option value="Design & Media">Design &amp; Media</option>
                    <option value="Google Workspace Built-in">Google Workspace Built-in</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Application Type
                  </label>
                  <select
                    value={formData.appType}
                    onChange={e => setFormData({ ...formData, appType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                  >
                    <option value="Web Application">Web Application</option>
                    <option value="Android">Android</option>
                    <option value="iOS">iOS</option>
                    <option value="Unknown Application Type">Unknown Application Type</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Risk Level
                  </label>
                  <select
                    value={formData.riskLevel}
                    onChange={e => setFormData({ ...formData, riskLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="LOW">🔵 Low</option>
                    <option value="MINOR">🟢 Minor</option>
                    <option value="MEDIUM">🟡 Moderate</option>
                    <option value="HIGH">🟠 High</option>
                    <option value="CRITICAL">🔴 Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Data Hosting
                  </label>
                  <input
                    type="text"
                    value={formData.dataHosting}
                    onChange={e => setFormData({ ...formData, dataHosting: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    placeholder="USA, EU, Global"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                    <input
                      type="checkbox"
                      checked={formData.isVerified}
                      onChange={e => setFormData({ ...formData, isVerified: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span>Google Verified</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Compliance Certifications
                </label>
                <input
                  type="text"
                  value={formData.compliance}
                  onChange={e => setFormData({ ...formData, compliance: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                  placeholder="e.g. SOC 2 Type II, ISO 27001, GDPR, HIPAA"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Icon URL
                  </label>
                  <input
                    type="text"
                    value={formData.iconUrl}
                    onChange={e => setFormData({ ...formData, iconUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Store Listing URL
                  </label>
                  <input
                    type="text"
                    value={formData.storeUrl}
                    onChange={e => setFormData({ ...formData, storeUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono"
                    placeholder="https://workspace.google.com/marketplace/app/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Description / Threat Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                  placeholder="Brief application function and security rationale..."
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : isAddingNew ? "Register Application" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
