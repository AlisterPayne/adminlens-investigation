"use client";

import React, { useState } from "react";
import { GoogleAdminIcon } from "@/components/google-icons";

export default function TenantBaselineView() {
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);
  const [copiedAgeUrl, setCopiedAgeUrl] = useState(false);

  const appSettingsUrl = "https://admin.google.com/ac/owl/settings#:~:text=%EE%8F%89-,Unconfigured%20third%2Dparty%20apps";
  const ageSettingsUrl = "https://admin.google.com/ac/managedsettings/453172576738/age_based_access";

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ============================================================== */}
      {/* 1. EXECUTIVE HEADER                                            */}
      {/* ============================================================== */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-base">🏛️</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Google Workspace Root Baseline
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Institutional Data Protection Baseline
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            The school or organization is the legal Data Controller responsible for student and staff data. A secure tenant requires two connected baselines: assigning <strong>Age-Based Access Labels</strong> to your Organizational Units, and setting the <strong>Unconfigured Apps Policy</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={ageSettingsUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <GoogleAdminIcon className="w-3.5 h-3.5 text-indigo-700" />
            <span>1. Age Labels ↗</span>
          </a>

          <a
            href={appSettingsUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-1.5"
          >
            <GoogleAdminIcon className="w-3.5 h-3.5 text-white" />
            <span>2. App Access ↗</span>
          </a>
        </div>
      </div>

      {/* ============================================================== */}
      {/* STEP 1: PREREQUISITE - AGE-BASED ACCESS LABELS                 */}
      {/* ============================================================== */}
      <div className="bg-white border-2 border-indigo-300 rounded-2xl p-6 shadow-xs space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 font-black flex items-center justify-center text-sm border border-indigo-200">
              1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-gray-900">
                  Prerequisite: Organizational Unit Age-Based Access Labels
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Must Check First
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Google uses these labels to decide whether a user is evaluated under the "Under 18" or "18 and older" policy.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={ageSettingsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
            >
              <GoogleAdminIcon className="w-3.5 h-3.5 text-white" />
              <span>Configure Age Settings ↗</span>
            </a>
            <button
              onClick={() => copyToClipboard(ageSettingsUrl, setCopiedAgeUrl)}
              className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-xs font-medium"
            >
              {copiedAgeUrl ? "✓ Copied" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* Warning callout if student OUs are mislabeled */}
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
          <span className="text-base">⚠️</span>
          <div>
            <strong className="font-bold">Critical Audit Check for IT Admins:</strong> If your student Organizational Units (e.g., <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">/Students</code> or <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">/Grade 1-12</code>) are incorrectly labeled as <em>"All users in this group or org unit are 18 or older"</em>, Google treats those students as adults. <strong>This completely bypasses the under-18 app block!</strong>
          </div>
        </div>

        {/* Two OU Setting Targets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
          {/* Student OUs */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-950">Student Organizational Units</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Target Setting</span>
            </div>
            <div className="flex items-start gap-2 text-emerald-900">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 bg-white">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              </span>
              <div>
                <strong>Some or all users in this group or org unit are under 18</strong>
                <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                  Applies to all learner accounts. Restricts age-inappropriate Google services and enables the under-18 third-party app block.
                </p>
              </div>
            </div>
          </div>

          {/* Staff OUs */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-blue-950">Staff &amp; Faculty Organizational Units</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Target Setting</span>
            </div>
            <div className="flex items-start gap-2 text-blue-900">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 bg-white">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              </span>
              <div>
                <strong>All users in this group or org unit are 18 or older</strong>
                <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                  Applies to teachers, administrators, and adult employees. Enables standard adult operational services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* STEP 2: UNCONFIGURED THIRD-PARTY APPS POLICY                   */}
      {/* ============================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 font-black flex items-center justify-center text-sm border border-blue-200">
              2
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                Unconfigured Third-Party Apps Policy
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Once OUs have the correct age labels, configure what happens when users try to access unconfigured third-party applications.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={appSettingsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
            >
              <GoogleAdminIcon className="w-3.5 h-3.5 text-white" />
              <span>Configure App Access ↗</span>
            </a>
            <button
              onClick={() => copyToClipboard(appSettingsUrl, setCopiedAppUrl)}
              className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-xs font-medium"
            >
              {copiedAppUrl ? "✓ Copied" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* Side-by-Side App Policy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* CARD A: UNDER 18 (STUDENTS) */}
          <div className="bg-white border border-emerald-300 rounded-2xl p-6 shadow-xs flex flex-col justify-between relative">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Students (Under 18)
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Recommended Default
                </span>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-gray-900">
                  Settings for users under 18
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Applied to all OUs labeled as under 18.
                </p>
              </div>

              {/* Radio Mockup */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3">
                <span className="w-4 h-4 rounded-full border-2 border-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 bg-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                </span>
                <div className="text-xs">
                  <span className="font-extrabold text-emerald-950 block">
                    (Default) Don't allow users to access any third-party apps
                  </span>
                  <span className="text-emerald-800 mt-1 block leading-relaxed">
                    Users under 18 can't access any apps until access settings are configured for the apps. Users will be able to request access so you can configure settings as needed for each app.
                  </span>
                </div>
              </div>

              {/* Guidance points */}
              <div className="space-y-2 text-xs text-gray-600 pt-1">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Zero-Trust Student Protection</strong>: Blocks unvetted games, quizzes, and unauthorized social AI tools.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Mandatory IT Gate</strong>: Any EdTech app needed in class must be explicitly reviewed by IT before pupils can sign in.</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-emerald-100 text-xs text-emerald-900 bg-emerald-50/40 -mx-6 -mb-6 p-4 rounded-b-2xl">
              <strong>⚠️ Golden Rule:</strong> When approving an app for students, configure it as <strong>"Specific Google data"</strong>. Never click "Trusted".
            </div>
          </div>

          {/* CARD B: 18 AND OLDER (STAFF / TEACHERS) */}
          <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between relative">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                  Staff &amp; Faculty (18+)
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  Recommended Default
                </span>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-gray-900">
                  Settings for users 18 and older
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Applied to all OUs labeled as 18 or older.
                </p>
              </div>

              {/* Radio Mockup */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
                <span className="w-4 h-4 rounded-full border-2 border-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 bg-white">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                </span>
                <div className="text-xs">
                  <span className="font-extrabold text-blue-950 block">
                    (Default) Allow users to access any third-party apps
                  </span>
                  <span className="text-blue-800 mt-1 block leading-relaxed">
                    Apps that users access with their account can ask for unrestricted Google data for the user.
                  </span>
                </div>
              </div>

              {/* Guidance points */}
              <div className="space-y-2 text-xs text-gray-600 pt-1">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span><strong>Educational Agility</strong>: Allows teachers to trial lesson plans and tools without submitting IT tickets for every login.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">⚠️</span>
                  <span><strong>Secondary Student Risk Vector</strong>: Teachers have access to Classroom rosters, student submissions, and Drive. Staff tokens can touch student data.</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-blue-100 text-xs text-blue-900 bg-blue-50/40 -mx-6 -mb-6 p-4 rounded-b-2xl">
              <strong>💡 Role of AdminLens:</strong> Monitor unconfigured staff apps in the <strong>Recommendations</strong> tab to audit any tool touching classroom or student data.
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. QUICK SUMMARY BANNER                                        */}
      {/* ============================================================== */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-bold text-slate-900">Summary:</span> 1. Verify student OUs are labeled <em>Under 18</em>. 2. Enforce <em>Don't allow</em> for Under 18. 3. Configure approved student apps as <em>Specific Google Data</em>.
        </div>
        <div className="flex items-center gap-3 whitespace-nowrap">
          <a
            href={ageSettingsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-600 hover:text-indigo-800 font-bold text-xs"
          >
            Age Settings ↗
          </a>
          <span className="text-slate-300">•</span>
          <a
            href={appSettingsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:text-blue-800 font-bold text-xs"
          >
            App Settings ↗
          </a>
        </div>
      </div>
    </div>
  );
}
