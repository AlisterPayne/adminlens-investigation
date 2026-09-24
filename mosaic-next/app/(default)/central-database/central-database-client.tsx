"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

export interface ApplicationItem {
  id: string;
  displayName: string;
  vendor: string;
  publisherDomain: string;
  category: string;
  appType: string;
  deploymentType?: string;
  compliance: string[];
  dataHosting: string;
  breachHistory: string | null;
  isVerified: boolean;
  iconUrl: string;
  storeUrl: string | null;
  description?: string;
  riskLevel: string;
  riskScore?: number;
  riskScoreColor?: string;
  scopesCount?: number;
  totalUsersCount?: number;
  adminUsersCount?: number;
  adminAccessLevel?: string;
}

interface Props {
  initialApps: ApplicationItem[];
}

export default function CentralDatabaseClient({ initialApps }: Props) {
  const [apps, setApps] = useState<ApplicationItem[]>(initialApps);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedRisk, setSelectedRisk] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedVerified, setSelectedVerified] = useState("ALL");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Edit Modal State
  const [editingApp, setEditingApp] = useState<ApplicationItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for editing
  const [formData, setFormData] = useState({
    displayName: "",
    vendor: "",
    publisherDomain: "",
    category: "",
    appType: "",
    riskLevel: "LOW",
    isVerified: false,
    iconUrl: "",
    storeUrl: "",
    dataHosting: "USA",
    compliance: "",
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

  // Metrics summary
  const metrics = useMemo(() => {
    const total = apps.length;
    const verified = apps.filter(a => a.isVerified).length;
    const highCritical = apps.filter(a => a.riskLevel === "CRITICAL" || a.riskLevel === "HIGH").length;
    const resolvedDomains = apps.filter(a => Boolean(a.publisherDomain)).length;
    return { total, verified, highCritical, resolvedDomains };
  }, [apps]);

  // Filtering
  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        app.displayName.toLowerCase().includes(term) ||
        (app.vendor && app.vendor.toLowerCase().includes(term)) ||
        (app.publisherDomain && app.publisherDomain.toLowerCase().includes(term)) ||
        app.id.toLowerCase().includes(term) ||
        (app.category && app.category.toLowerCase().includes(term));

      const matchesCat = selectedCategory === "ALL" || app.category === selectedCategory;
      const matchesRisk = selectedRisk === "ALL" || app.riskLevel === selectedRisk;
      const matchesType = selectedType === "ALL" || app.appType === selectedType || app.deploymentType === selectedType;
      const matchesVerified =
        selectedVerified === "ALL" ||
        (selectedVerified === "VERIFIED" && app.isVerified) ||
        (selectedVerified === "UNVERIFIED" && !app.isVerified);

      return matchesSearch && matchesCat && matchesRisk && matchesType && matchesVerified;
    });
  }, [apps, searchTerm, selectedCategory, selectedRisk, selectedType, selectedVerified]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredApps.length / pageSize) || 1;
  const paginatedApps = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredApps.slice(start, start + pageSize);
  }, [filteredApps, currentPage, pageSize]);

  // Open Edit Modal
  const handleOpenEdit = (app: ApplicationItem) => {
    setEditingApp(app);
    setFormData({
      displayName: app.displayName || "",
      vendor: app.vendor || "",
      publisherDomain: app.publisherDomain || "",
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

  // Close Modal
  const handleCloseEdit = () => {
    setEditingApp(null);
  };

  // Save changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    setIsSaving(true);
    const complianceArray = formData.compliance
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      id: editingApp.id,
      displayName: formData.displayName,
      vendor: formData.vendor,
      publisherDomain: formData.publisherDomain,
      category: formData.category,
      appType: formData.appType,
      riskLevel: formData.riskLevel,
      isVerified: formData.isVerified,
      iconUrl: formData.iconUrl,
      storeUrl: formData.storeUrl || null,
      dataHosting: formData.dataHosting,
      compliance: complianceArray,
      description: formData.description
    };

    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        // Update local state
        setApps(prev =>
          prev.map(item => (item.id === editingApp.id ? { ...item, ...data.application } : item))
        );
        setToastMessage(`✓ Successfully updated "${formData.displayName}"`);
        setTimeout(() => setToastMessage(null), 4000);
        handleCloseEdit();
      } else {
        alert(`Failed to save changes: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      alert(`Network error saving application: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-gray-700 animate-slide-up">
          <svg className="w-5 h-5 text-emerald-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
              Central Master Database
            </span>
            <span className="text-xs text-gray-500 font-mono">SQLite + Global Catalog</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-gray-800 font-bold">
            Central Application Repository
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse, search, and manage all {apps.length.toLocaleString()} SaaS, Mobile, and Google Workspace applications.
            Click <strong>Edit</strong> on any application to customize metadata or security classifications.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold uppercase text-gray-400">Total Applications</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{metrics.total.toLocaleString()}</div>
          <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <span>●</span> 100% Ingested & Active
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold uppercase text-gray-400">Google Verified Apps</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{metrics.verified.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">
            {((metrics.verified / metrics.total) * 100).toFixed(1)}% of total catalog
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold uppercase text-gray-400">High / Critical Risk</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{metrics.highCritical.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Require elevated scrutiny</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold uppercase text-gray-400">Enriched Domains & Icons</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{metrics.resolvedDomains.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Branded icons & publisher profiles</div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <input
              type="text"
              placeholder="Search name, vendor, domain, or Client ID..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
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

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
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
              className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
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
              className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All App Types</option>
              <option value="Web Application">Web Application</option>
              <option value="Android">Android</option>
              <option value="iOS">iOS</option>
              <option value="Chrome Extension">Chrome Extension</option>
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
              className="w-full py-2 px-2 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Verified?</option>
              <option value="VERIFIED">Verified</option>
              <option value="UNVERIFIED">Unverified</option>
            </select>
          </div>
        </div>

        {/* Results summary & Active filters reset */}
        <div className="flex flex-wrap justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div>
            Showing <strong className="text-gray-800">{filteredApps.length.toLocaleString()}</strong> matching applications
            {searchTerm && ` for "${searchTerm}"`}
          </div>

          {(searchTerm || selectedCategory !== "ALL" || selectedRisk !== "ALL" || selectedType !== "ALL" || selectedVerified !== "ALL") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("ALL");
                setSelectedRisk("ALL");
                setSelectedType("ALL");
                setSelectedVerified("ALL");
                setCurrentPage(1);
              }}
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-semibold uppercase text-gray-500 tracking-wider">
                <th className="py-3 px-4">Application</th>
                <th className="py-3 px-4">Vendor & Domain</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {paginatedApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No applications matched your search or filters.
                  </td>
                </tr>
              ) : (
                paginatedApps.map(app => {
                  const riskBadge =
                    app.riskLevel === "CRITICAL"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : app.riskLevel === "HIGH"
                      ? "bg-orange-50 text-orange-700 border-orange-200"
                      : app.riskLevel === "MEDIUM"
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : "bg-blue-50 text-blue-700 border-blue-200";

                  return (
                    <tr key={app.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Application Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={app.iconUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.displayName)}&background=3B82F6&color=fff&size=64`}
                            alt={app.displayName}
                            className="w-9 h-9 rounded-lg object-contain bg-white border border-gray-200 shrink-0 p-0.5"
                            onError={(e: any) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.displayName)}&background=3B82F6&color=fff&size=64`;
                            }}
                          />
                          <div className="min-w-0 max-w-xs">
                            <div className="font-semibold text-gray-900 truncate" title={app.displayName}>
                              {app.displayName}
                            </div>
                            <div className="text-[11px] font-mono text-gray-400 truncate" title={app.id}>
                              {app.id}
                            </div>
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

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {app.category || "Unclassified"}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4">
                        <span className="text-xs text-gray-600">
                          {app.appType || app.deploymentType || "Web App"}
                        </span>
                      </td>

                      {/* Verification Status */}
                      <td className="py-3 px-4">
                        {app.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                            Unverified
                          </span>
                        )}
                      </td>

                      {/* Risk Level */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${riskBadge}`}>
                          {app.riskLevel}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(app)}
                          className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-gray-100 text-blue-600 border border-gray-200 rounded-lg shadow-2xs transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
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

      {/* Edit Application Modal */}
      {editingApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <img
                  src={formData.iconUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.displayName)}&background=3B82F6&color=fff&size=64`}
                  alt="Icon Preview"
                  className="w-10 h-10 rounded-xl border border-gray-200 p-0.5 object-contain bg-white"
                  onError={(e: any) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.displayName)}&background=3B82F6&color=fff&size=64`;
                  }}
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Edit Application Details</h3>
                  <p className="text-xs text-gray-500 font-mono truncate max-w-sm">{editingApp.id}</p>
                </div>
              </div>
              <button
                onClick={handleCloseEdit}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Display Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Vendor */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Vendor / Publisher Name
                  </label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* Publisher Domain */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Publisher Domain
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. company.com"
                    value={formData.publisherDomain}
                    onChange={e => {
                      const dom = e.target.value.trim().toLowerCase();
                      setFormData({
                        ...formData,
                        publisherDomain: dom,
                        iconUrl: dom ? `https://www.google.com/s2/favicons?domain=${dom}&sz=128` : formData.iconUrl
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                    <option value="Productivity & Collaboration">Productivity & Collaboration</option>
                    <option value="Communication & Social">Communication & Social</option>
                    <option value="Design & Creative">Design & Creative</option>
                    <option value="Education & EdTech">Education & EdTech</option>
                    <option value="Developer & Cloud Infrastructure">Developer & Cloud Infrastructure</option>
                    <option value="Security & Compliance">Security & Compliance</option>
                    <option value="Sales, Marketing & CRM">Sales, Marketing & CRM</option>
                    <option value="Finance & Payments">Finance & Payments</option>
                    <option value="Google Services">Google Services</option>
                    <option value="Configured SaaS">Configured SaaS</option>
                  </select>
                </div>

                {/* App Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    App Type / Deployment
                  </label>
                  <select
                    value={formData.appType}
                    onChange={e => setFormData({ ...formData, appType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Web Application">Web Application</option>
                    <option value="Android">Android</option>
                    <option value="iOS">iOS</option>
                    <option value="Chrome Extension">Chrome Extension</option>
                    <option value="Google Service">Google Service</option>
                  </select>
                </div>

                {/* Risk Level */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Assigned Risk Level
                  </label>
                  <select
                    value={formData.riskLevel}
                    onChange={e => setFormData({ ...formData, riskLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold"
                  >
                    <option value="LOW">🔵 LOW Risk</option>
                    <option value="MEDIUM">🟡 MEDIUM Risk</option>
                    <option value="HIGH">🟠 HIGH Risk</option>
                    <option value="CRITICAL">🔴 CRITICAL Risk</option>
                  </select>
                </div>
              </div>

              {/* Icon URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Brand Icon URL (128x128 Favicon or PNG/SVG)
                </label>
                <input
                  type="text"
                  value={formData.iconUrl}
                  onChange={e => setFormData({ ...formData, iconUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
              </div>

              {/* Compliance & Data Hosting */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Compliance Standards (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SOC 2 Type II, ISO 27001, GDPR"
                    value={formData.compliance}
                    onChange={e => setFormData({ ...formData, compliance: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Data Hosting Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. USA, EU, Global"
                    value={formData.dataHosting}
                    onChange={e => setFormData({ ...formData, dataHosting: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Verification Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isVerifiedCheckbox"
                  checked={formData.isVerified}
                  onChange={e => setFormData({ ...formData, isVerified: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="isVerifiedCheckbox" className="text-sm font-medium text-gray-700">
                  Google Marketplace Verified Application
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Application Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving && (
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
