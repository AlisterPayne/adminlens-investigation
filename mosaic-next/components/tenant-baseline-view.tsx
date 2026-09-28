"use client";

import React, { useState } from "react";
import { GoogleAdminIcon } from "@/components/google-icons";

export default function TenantBaselineView() {
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);
  const [copiedAgeUrl, setCopiedAgeUrl] = useState(false);

  const appSettingsUrl = "https://admin.google.com/ac/owl/settings#:~:text=%EE%8F%89-,Unconfigured%20third%2Dparty%20apps";
  const ageSettingsUrl = "https://admin.google.com/ac/managedsettings/453172576738/age_based_access";

  const copy = (url: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(url);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            <span>🏛️</span>
            <span>Google Workspace Core Baseline</span>
          </div>
          <h2 className="text-xl font-black text-gray-900">
            Institutional Data Protection Baseline
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Schools are legally responsible for student data. Two settings must be configured correctly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={ageSettingsUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <GoogleAdminIcon className="w-3.5 h-3.5 text-indigo-700" />
            <span>1. Age Labels ↗</span>
          </a>
          <a
            href={appSettingsUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-1.5"
          >
            <GoogleAdminIcon className="w-3.5 h-3.5 text-white" />
            <span>2. App Policy ↗</span>
          </a>
        </div>
      </div>

      {/* Step 1: Age Settings */}
      <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="font-extrabold text-sm text-gray-900">
              Prerequisite: OU Age-Based Access Labels
            </h3>
          </div>
          <a
            href={ageSettingsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
          >
            <span>Open in Admin Console</span>
            <span>↗</span>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <div className="font-extrabold text-emerald-950 flex items-center justify-between">
              <span>Student OUs</span>
              <span className="text-[10px] text-emerald-700 font-bold uppercase">Required</span>
            </div>
            <div className="font-bold text-emerald-900">
              ● Some or all users in this group or org unit are under 18
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
            <div className="font-extrabold text-blue-950 flex items-center justify-between">
              <span>Staff &amp; Faculty OUs</span>
              <span className="text-[10px] text-blue-700 font-bold uppercase">Required</span>
            </div>
            <div className="font-bold text-blue-900">
              ● All users in this group or org unit are 18 or older
            </div>
          </div>
        </div>

        <div className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center gap-2">
          <span>⚠️</span>
          <span><strong>Critical:</strong> If student OUs are mislabeled as 18+, the under-18 app block is completely bypassed.</span>
        </div>
      </div>

      {/* Step 2: Unconfigured Apps Settings */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="font-extrabold text-sm text-gray-900">
              Unconfigured Third-Party Apps Policy
            </h3>
          </div>
          <a
            href={appSettingsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
          >
            <span>Open in Admin Console</span>
            <span>↗</span>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Under 18 */}
          <div className="p-4 rounded-xl border border-emerald-300 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-900 text-xs">Settings for users under 18</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                Students
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 font-bold text-emerald-950">
              ● (Default) Don't allow users to access any third-party apps
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Blocks unvetted tools. When approving apps for students, always select <strong>"Specific Google Data"</strong> (never "Trusted").
            </p>
          </div>

          {/* 18 and older */}
          <div className="p-4 rounded-xl border border-blue-200 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-blue-900 text-xs">Settings for users 18 and older</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                Staff / Faculty
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 font-bold text-blue-950">
              ● (Default) Allow users to access any third-party apps
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Preserves teacher agility. Monitor staff apps in AdminLens to safeguard student data accessible via Classroom and Drive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
