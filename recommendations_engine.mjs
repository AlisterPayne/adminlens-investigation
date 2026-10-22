import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

export class AdminLensRiskEngine {
  constructor(dbPath = './adminlens.db') {
    this.db = new DatabaseSync(dbPath);
  }

  evaluateDomainRisks() {
    const findings = [];

    let catalogApps = [];
    const catalogPaths = [
      './mosaic-next/data/applications_catalog.json',
      './standardized_catalog/applications_catalog.json',
      './public/standardized_catalog.json',
    ];
    for (const cp of catalogPaths) {
      if (fs.existsSync(cp)) {
        try {
          catalogApps = JSON.parse(fs.readFileSync(cp, 'utf8'));
          break;
        } catch (_) {}
      }
    }

    const REF_NOW_MS = new Date('2026-09-26T00:00:00Z').getTime();
    const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;
    const nowMs = Date.now();

    // -------------------------------------------------------------
    // BRANCH B: UNCONFIGURED APPLICATIONS (Gates U1 ➔ U2 / U3 ➔ Tiers 1–4)
    // - Recommended Policy across ALL 4 Tiers: "Specific Google Data (The Holy Grail)"
    // - "Blocked": Reserved ONLY in Tier 1 for the very few apps with extreme risk & known school issue
    // - "Trusted": NEVER recommended
    // - "Limited": Case-by-case only (never recommended by default)
    // -------------------------------------------------------------
    const unconfiguredApps = catalogApps.filter(
      a => (a.adminAccessLevel || 'UNCONFIGURED').toUpperCase() === 'UNCONFIGURED'
    );

    for (const u of unconfiguredApps) {
      const score = typeof u.riskScore === 'number' ? u.riskScore : 1.0;
      const isHighOrCrit = u.riskLevel === 'CRITICAL' || u.riskLevel === 'HIGH' || score > 3.0;
      const lastActiveMs = u.lastActive ? new Date(u.lastActive).getTime() : null;
      const isRecent30d = lastActiveMs !== null
        ? (REF_NOW_MS - lastActiveMs) <= 30 * 24 * 60 * 60 * 1000
        : !u.isStale;
      const totalUsers = u.totalUsersCount || (u.users ? u.users.length : 0);
      const adminUsers = u.adminUsersCount || (u.users ? u.users.filter(usr => usr.isAdmin).length : 0);
      const hasSprawl = totalUsers > 1 || adminUsers > 0;
      const userEmails = (u.users || []).map(usr => usr.email);
      const userDisplay = userEmails.length === 0
        ? `${totalUsers} domain user(s)`
        : userEmails.length <= 3
        ? userEmails.join(', ')
        : `${totalUsers} users (including ${userEmails.slice(0, 3).join(', ')}...)`;

      if (isHighOrCrit && (!u.isVerified || !isRecent30d || totalUsers <= 1)) {
        // TIER 1: Gate U1 (Score 4–5) ➔ Gate U2 (Unverified, Single-User ≤1, or Dormant >30d)
        const contextTriggers = [
          !u.isVerified ? 'Unverified' : null,
          totalUsers <= 1 ? 'Single-User (≤1)' : null,
          !isRecent30d ? 'Dormant (>30d)' : null,
        ].filter(Boolean).join(' / ');
        const gatePath = `Gate U1 (Score ${score.toFixed(1)} High/Crit) ➔ Gate U2 (${contextTriggers}) ➔ Tier 1`;

        findings.push({
          id: `REC-TIER1-UNCONFIGURED-${u.id}`,
          rule: 'UNVERIFIED_UNCONFIGURED_HIGH_RISK',
          triageTier: 'TIER_1',
          gatePath,
          title: `Tier 1 Critical Review: "${u.displayName}" (${contextTriggers})`,
          severity: 'CRITICAL',
          application: u.displayName,
          vendor: u.vendor || 'Third-Party Developer',
          affectedAccount: userDisplay,
          clientId: u.clientId || u.id,
          details: `${gatePath}: "${u.displayName}" holds ${u.riskLevel} scope permissions (Score ${score.toFixed(1)} / 5.0) and is unconfigured in Google Workspace API Controls.`,
          remediation: `Recommended Action: Configure "${u.displayName}" to "Specific Google data" (The Holy Grail) if validated for school use. Reserve "Blocked" ONLY for the very few apps with extreme risk and a known issue for the school environment. Never set to "Trusted".`,
          actionType: 'SPECIFIC_GOOGLE_DATA',
          adminConsolePath: 'Security > Access and data control > API controls > App access control',
        });
      } else if (isHighOrCrit && hasSprawl && isRecent30d) {
        // TIER 2: Gate U1 (Score 4–5) ➔ Gate U2 (Google-Verified & Active ≤30d across multiple users)
        const gatePath = `Gate U1 (Score ${score.toFixed(1)} High/Crit) ➔ Gate U2 (Verified & Active ≤30d, ${totalUsers} Users) ➔ Tier 2`;

        findings.push({
          id: `REC-TIER2-UNCONFIGURED-${u.id}`,
          rule: 'UNCONFIGURED_SHADOW_IT_RISK',
          triageTier: 'TIER_2',
          gatePath,
          title: `Tier 2 High-Risk Sprawl: "${u.displayName}" (${totalUsers} Active Users)`,
          severity: 'HIGH',
          application: u.displayName,
          vendor: u.vendor || 'Third-Party Developer',
          affectedAccount: userDisplay,
          clientId: u.clientId || u.id,
          details: `${gatePath}: "${u.displayName}" is a Google-verified application actively used across ${totalUsers} accounts with ${u.riskLevel} scopes (Score ${score.toFixed(1)}), operating without an explicit tenant policy.`,
          remediation: `Recommended Action: Configure "${u.displayName}" in Google Admin Console to "Specific Google data" (The Holy Grail) to approve exact current scopes while blocking future scope escalation. (Never set to "Trusted"; "Limited" is case-by-case only.)`,
          actionType: 'SPECIFIC_GOOGLE_DATA',
          adminConsolePath: 'Security > Access and data control > API controls > App access control',
        });
      } else if (isRecent30d && totalUsers > 0) {
        // TIER 3: Gate U1 (Score 1–3) ➔ Gate U3 (Active ≤30d)
        const gatePath = `Gate U1 (Score ${score.toFixed(1)} Mod/Low) ➔ Gate U3 (Active ≤30d, ${totalUsers} Users) ➔ Tier 3`;

        findings.push({
          id: `REC-TIER3-UNCONFIGURED-${u.id}`,
          rule: 'TIER3_MODERATE_LOW_SPRAWL',
          triageTier: 'TIER_3',
          gatePath,
          title: `Tier 3 Moderate/Low Sprawl: "${u.displayName}"`,
          severity: 'MEDIUM',
          application: u.displayName,
          vendor: u.vendor || 'Third-Party Developer',
          affectedAccount: userDisplay,
          clientId: u.clientId || u.id,
          details: `${gatePath}: "${u.displayName}" is actively used (≤30 days) with Moderate/Low risk scopes (Score ${score.toFixed(1)}) and remains unconfigured.`,
          remediation: `Recommended Action: Configure "${u.displayName}" to "Specific Google data" (The Holy Grail) to lock its current scope footprint. ("Limited" is applied on a case-by-case basis only; never recommend "Trusted".)`,
          actionType: 'SPECIFIC_GOOGLE_DATA',
          adminConsolePath: 'Security > Access and data control > API controls > App access control',
        });
      } else {
        // TIER 4: Gate U1 (Score 1–3) ➔ Gate U3 (Dormant >30d)
        const gatePath = `Gate U1 (Score ${score.toFixed(1)} Mod/Low) ➔ Gate U3 (Dormant >30d) ➔ Tier 4`;

        findings.push({
          id: `REC-TIER4-UNCONFIGURED-${u.id}`,
          rule: 'TIER4_DORMANT_SHADOW_IT',
          triageTier: 'TIER_4',
          gatePath,
          title: `Tier 4 Dormant Shadow IT: "${u.displayName}"`,
          severity: 'LOW',
          application: u.displayName,
          vendor: u.vendor || 'Third-Party Developer',
          affectedAccount: userDisplay,
          clientId: u.clientId || u.id,
          details: `${gatePath}: "${u.displayName}" has been inactive for >30 days (Score ${score.toFixed(1)}) and remains unconfigured in Google Workspace.`,
          remediation: `Recommended Action: Review "${u.displayName}" in Google Admin Console and configure to "Specific Google data" (The Holy Grail) to lock its baseline scope footprint. (Never set to "Trusted"; "Limited" is case-by-case only.)`,
          actionType: 'SPECIFIC_GOOGLE_DATA',
          adminConsolePath: 'Security > Access and data control > API controls > App access control',
        });
      }
    }

    // -------------------------------------------------------------
    // BRANCH A: TRUSTED APPLICATION GOVERNANCE (Gates T1 ➔ T2 ➔ T3 ➔ T4)
    // - Gate T1: New Scope Requested?
    //   • YES ➔ Gate T2 (Google Scope Category: Restricted=CRITICAL, Sensitive=HIGH, Non-Sensitive=MEDIUM)
    //   • NO ➔ Gate T3 (Last Reviewed < 6 Months? ≤180d = No Recommendation)
    //          ➔ If ≥ 6 Months (or unreviewed) ➔ Gate T4 (App Risk Score):
    //             • Critical (4.0–5.0) or High (3.0–4.0) ➔ Recommendation: Review Again
    //             • Score 1, 2, or 3 (≤ 3.0) ➔ Fine (No Recommendation)
    // -------------------------------------------------------------
    const trustedAppsFromCatalog = catalogApps.filter(
      a => (a.adminAccessLevel || '').toUpperCase() === 'TRUSTED'
    );

    for (const t of trustedAppsFromCatalog) {
      const hasNewScopes = Boolean(t.hasNewScopes && (t.newlyRequestedScopesCount || 0) > 0);
      const orgUnit = t.accessPolicy?.orgUnitPath || '/';

      if (hasNewScopes) {
        // GATE T1 = YES ➔ Proceed to GATE T2: Google Scope Criteria / Category
        const newScopeObjs = (t.scopes || []).filter(
          s => s.isNewlyRequested || (t.newlyRequestedScopes || []).includes(s.scope)
        );
        const hasRestricted = newScopeObjs.some(s => s.googleTier === 'Restricted');
        const hasSensitive = newScopeObjs.some(s => s.googleTier === 'Sensitive');

        let severity = 'MEDIUM';
        let googleCategory = 'Non-Sensitive';
        let remediationDirective = `Audit incremental Non-Sensitive scope expansion for "${t.displayName}" in Google Admin Console (Security > API Controls > App Access Control) and transition policy from "Trusted" to "Specific Google data" (The Holy Grail).`;

        if (hasRestricted) {
          severity = 'CRITICAL';
          googleCategory = 'Restricted';
          remediationDirective = `CRITICAL: "${t.displayName}" requested new Restricted Google scope(s) while holding blanket Trusted access. Immediately transition policy from "Trusted" to "Specific Google data" (The Holy Grail) — or "Blocked" ONLY if there is a known school security issue.`;
        } else if (hasSensitive) {
          severity = 'HIGH';
          googleCategory = 'Sensitive';
          remediationDirective = `HIGH: "${t.displayName}" requested new Sensitive Google scope(s) while holding blanket Trusted access. Review scope expansion and transition policy from "Trusted" to "Specific Google data" (The Holy Grail).`;
        }

        const gatePath = `Gate T1 (New Scope: YES) ➔ Gate T2 (Google '${googleCategory}' Criteria) ➔ ${severity} Recommendation`;
        findings.push({
          id: `REC-TRUSTED-NEW-SCOPE-${t.id}`,
          rule: 'TRUSTED_POLICY_LEAST_PRIVILEGE',
          triageTier: 'TRUSTED',
          gatePath,
          title: `Trusted App New ${googleCategory} Scope Requested: "${t.displayName}"`,
          severity,
          application: t.displayName,
          vendor: t.vendor || 'Third-Party Developer',
          affectedAccount: `Domain OU: ${orgUnit}`,
          clientId: t.clientId || t.id,
          details: `${gatePath}: "${t.displayName}" is configured as "Trusted" and requested ${t.newlyRequestedScopesCount || newScopeObjs.length} new OAuth scope(s) categorized under Google's "${googleCategory}" criteria.`,
          remediation: remediationDirective,
          actionType: 'SPECIFIC_GOOGLE_DATA',
          adminConsolePath: 'Security > Access and data control > API controls > App access control',
        });
      } else {
        // GATE T1 = NO ➔ Proceed to GATE T3: Time-Based Last Reviewed Check (< 6 Months / 180 Days)
        const lastReviewedStr = t.lastReviewedAt || null;
        const reviewedWithinSixMonths = lastReviewedStr
          ? (nowMs - new Date(lastReviewedStr).getTime()) <= SIX_MONTHS_MS
          : false;

        if (!reviewedWithinSixMonths) {
          // GATE T3 = ≥ 6 Months (or unreviewed) ➔ Proceed to GATE T4: Risk Score Dependency
          const score = typeof t.riskScore === 'number' ? t.riskScore : 1.0;
          const isCritOrHighRisk = score > 3.0 || t.riskLevel === 'CRITICAL' || t.riskLevel === 'HIGH';

          if (isCritOrHighRisk) {
            // Score between 3–4 (High) or 4–5 (Critical) ➔ Must be reviewed again
            const severity = (score >= 4.0 || t.riskLevel === 'CRITICAL') ? 'CRITICAL' : 'HIGH';
            const gatePath = `Gate T1 (No New Scopes) ➔ Gate T3 (≥ 6 Months) ➔ Gate T4 (${t.riskLevel} Risk, Score ${score.toFixed(1)}) ➔ Review Again`;
            findings.push({
              id: `REC-TRUSTED-SIX-MONTH-REVIEW-${t.id}`,
              rule: 'TRUSTED_POLICY_LEAST_PRIVILEGE',
              triageTier: 'TRUSTED',
              gatePath,
              title: `Trusted App 6-Month Re-Review Required (${t.riskLevel} Risk, Score ${score.toFixed(1)}): "${t.displayName}"`,
              severity,
              application: t.displayName,
              vendor: t.vendor || 'Third-Party Developer',
              affectedAccount: `Domain OU: ${orgUnit}`,
              clientId: t.clientId || t.id,
              details: `${gatePath}: "${t.displayName}" is configured as "Trusted", has not been reviewed within the last 6 months, and carries a ${t.riskLevel} risk score (${score.toFixed(1)} / 5.0).`,
              remediation: `Re-review "${t.displayName}" in Google Admin Console (Security > API Controls > App Access Control). Recommended Action: Transition from blanket "Trusted" to "Specific Google data" (The Holy Grail) — we never recommend keeping blanket Trusted access.`,
              actionType: 'SPECIFIC_GOOGLE_DATA',
              adminConsolePath: 'Security > Access and data control > API controls > App access control',
            });
          }
          // If score is 1, 2, or 3 (score <= 3.0) ➔ Fine, no recommendation generated!
        }
        // If reviewed within the last 6 months ➔ No recommendation generated!
      }
    }

    // -------------------------------------------------------------
    // SUPER ADMIN ACCOUNT EXPOSURE (Informational Review in Google Admin Console)
    // -------------------------------------------------------------
    const adminRisks = this.db.prepare(`
      SELECT 
        a.id as app_id,
        a.display_name,
        a.vendor,
        a.risk_level,
        u.primary_email as admin_email,
        g.client_id,
        g.scopes_json
      FROM applications a
      JOIN grants g ON a.id = g.application_id
      JOIN users u ON g.user_email = u.primary_email
      WHERE u.is_admin = 1 AND a.risk_level IN ('CRITICAL', 'HIGH')
        AND NOT (a.is_verified = 0 AND a.admin_access_level = 'UNCONFIGURED')
    `).all();

    for (const r of adminRisks) {
      const scopes = JSON.parse(r.scopes_json || '[]');
      findings.push({
        id: `REC-ADMIN-EXP-${r.app_id}-${r.admin_email.split('@')[0]}`,
        rule: 'ADMIN_PRIVILEGE_EXPOSURE',
        triageTier: 'SUPER_ADMIN',
        gatePath: 'Super Admin Privilege Review ➔ High/Critical OAuth Grant',
        title: `Super Admin Access Review: "${r.display_name}"`,
        severity: 'CRITICAL',
        application: r.display_name,
        vendor: r.vendor,
        affectedAccount: r.admin_email,
        clientId: r.client_id,
        details: `Super Admin "${r.admin_email}" has authorized "${r.display_name}" with high-privilege scopes (${scopes.length} scopes). High-privilege grants on Super Admin accounts carry elevated tenant-wide exposure.`,
        remediation: `Review this application in Google Admin Console (Security > Access and data control > API controls > App access control) to confirm whether "${r.admin_email}" requires this third-party integration and ensure the application is locked to "Specific Google data" (The Holy Grail).`,
        actionType: 'SPECIFIC_GOOGLE_DATA',
        adminConsolePath: 'Security > Access and data control > API controls > App access control',
      });
    }

    // Load product families if available to map client IDs to canonical families
    let familyMap = new Map();
    let clientToFamily = new Map();
    const familyPaths = ['./mosaic-next/data/product_families.json', './public/product_families.json'];
    for (const fp of familyPaths) {
      if (fs.existsSync(fp)) {
        try {
          const families = JSON.parse(fs.readFileSync(fp, 'utf8'));
          for (const fam of families) {
            familyMap.set(fam.familyId, fam);
            for (const depId of (fam.deploymentIds || [])) {
              clientToFamily.set(depId, fam);
            }
          }
          break;
        } catch (e) {
          // Ignore parse errors and proceed
        }
      }
    }

    // Deduplicate findings by ID
    const uniqueFindings = Array.from(new Map(findings.map(f => [f.id, f])).values());

    // Enrich each finding with product family metadata (Strictly informational -> Google Admin Console)
    for (const f of uniqueFindings) {
      const fam = clientToFamily.get(f.clientId) || clientToFamily.get(f.id.split('-').pop());
      if (fam) {
        f.familyId = fam.familyId;
        f.familyName = fam.familyName;
        f.familyVendor = fam.vendor;
        f.familyIconUrl = fam.iconUrl;
      } else {
        // Fallback normalization
        f.familyId = f.application.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        f.familyName = f.application;
        f.familyVendor = f.vendor;
        f.familyIconUrl = null;
      }
      f.actionChannel = 'GOOGLE_ADMIN_CONSOLE';
    }

    // Sort by severity (CRITICAL -> HIGH -> MEDIUM -> LOW)
    const severityWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    uniqueFindings.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]);

    // -------------------------------------------------------------
    // SUPER ADMIN PRIVILEGE EXPOSURE GROUPING (INFORMATIONAL ONLY)
    // -------------------------------------------------------------
    const adminExpFindings = uniqueFindings.filter(f => f.rule === 'ADMIN_PRIVILEGE_EXPOSURE');
    const adminGroupsMap = new Map();
    for (const f of adminExpFindings) {
      const email = f.affectedAccount;
      if (!adminGroupsMap.has(email)) {
        adminGroupsMap.set(email, {
          adminEmail: email,
          tokenCount: 0,
          items: []
        });
      }
      const group = adminGroupsMap.get(email);
      group.tokenCount++;
      group.items.push(f);
    }

    const adminGroups = Array.from(adminGroupsMap.values()).sort((a, b) => b.tokenCount - a.tokenCount);

    // Helper to group findings by family
    const groupFindingsByFamily = (items) => {
      const famMap = new Map();
      for (const item of items) {
        const fId = item.familyId || item.application;
        if (!famMap.has(fId)) {
          famMap.set(fId, {
            familyId: fId,
            familyName: item.familyName || item.application,
            vendor: item.familyVendor || item.vendor,
            iconUrl: item.familyIconUrl || null,
            highestSeverity: item.severity,
            findingsCount: 0,
            affectedAccounts: new Set(),
            clientIds: new Set(),
            items: []
          });
        }
        const target = famMap.get(fId);
        target.findingsCount++;
        if (severityWeight[item.severity] > (severityWeight[target.highestSeverity] || 0)) {
          target.highestSeverity = item.severity;
        }
        if (item.affectedAccount) target.affectedAccounts.add(item.affectedAccount);
        if (item.clientId) target.clientIds.add(item.clientId);
        target.items.push(item);
      }
      return Array.from(famMap.values()).map(t => ({
        ...t,
        affectedAccounts: Array.from(t.affectedAccounts),
        clientIds: Array.from(t.clientIds),
      })).sort((a, b) => b.findingsCount - a.findingsCount);
    };

    // -------------------------------------------------------------
    // ASSEMBLE THE 6 DECISION TREE INFORMATIONAL PLAYBOOKS
    // -------------------------------------------------------------
    const playbooks = [
      {
        id: 'PLAYBOOK-TIER1-UNCONFIGURED',
        rule: 'UNVERIFIED_UNCONFIGURED_HIGH_RISK',
        title: 'Tier 1: Unconfigured High/Critical — Unverified, Single-User, or Dormant',
        subtitle: 'Gate U1 (Score 4–5) ➔ Gate U2: Critically review first in Google Admin Console. Set validated apps to Specific Google Data (The Holy Grail); Block ONLY if known school safety issue.',
        severity: 'CRITICAL',
        actionChannel: 'GOOGLE_ADMIN_CONSOLE',
        actionType: 'SPECIFIC_GOOGLE_DATA',
        adminConsolePath: 'Security > Access and data control > API controls > App access control',
        remediationSummary: 'In Google Admin Console, configure validated school apps to "Specific Google data" (The Holy Grail). Reserve "Blocked" ONLY for the very few extremely high-risk apps with a known issue for the school environment. Never set to "Trusted".',
        metrics: {
          totalFindings: uniqueFindings.filter(f => f.rule === 'UNVERIFIED_UNCONFIGURED_HIGH_RISK').length,
          distinctFamilies: groupFindingsByFamily(uniqueFindings.filter(f => f.rule === 'UNVERIFIED_UNCONFIGURED_HIGH_RISK')).length,
        },
        familyTargets: groupFindingsByFamily(uniqueFindings.filter(f => f.rule === 'UNVERIFIED_UNCONFIGURED_HIGH_RISK')),
      },
      {
        id: 'PLAYBOOK-TIER2-HIGH-RISK-SPRAWL',
        rule: 'UNCONFIGURED_SHADOW_IT_RISK',
        title: 'Tier 2: High Risk Sprawl (Verified Active Business Tools)',
        subtitle: 'Gate U1 (Score 4–5) ➔ Gate U2 (Verified & Active ≤30d): High-privilege scopes across multiple school accounts.',
        severity: 'HIGH',
        actionChannel: 'GOOGLE_ADMIN_CONSOLE',
        actionType: 'SPECIFIC_GOOGLE_DATA',
        adminConsolePath: 'Security > Access and data control > API controls > App access control',
        remediationSummary: 'In Google Admin Console, configure to "Specific Google data" (The Holy Grail) to approve exact current scopes while blocking future scope escalation. Never set to "Trusted".',
        metrics: {
          totalFindings: uniqueFindings.filter(f => f.rule === 'UNCONFIGURED_SHADOW_IT_RISK').length,
          distinctFamilies: groupFindingsByFamily(uniqueFindings.filter(f => f.rule === 'UNCONFIGURED_SHADOW_IT_RISK')).length,
        },
        familyTargets: groupFindingsByFamily(uniqueFindings.filter(f => f.rule === 'UNCONFIGURED_SHADOW_IT_RISK')),
      },
      {
        id: 'PLAYBOOK-TIER3-MODERATE-LOW-SPRAWL',
        rule: 'TIER3_MODERATE_LOW_SPRAWL',
        title: 'Tier 3: Moderate / Low Scope Sprawl (Active ≤30 Days)',
        subtitle: 'Gate U1 (Score 1–3) ➔ Gate U3 (Active ≤30d): Active applications with moderate or low-sensitivity scopes.',
        severity: 'MEDIUM',
        actionChannel: 'GOOGLE_ADMIN_CONSOLE',
        actionType: 'SPECIFIC_GOOGLE_DATA',
        adminConsolePath: 'Security > Access and data control > API controls > App access control',
        remediationSummary: 'In Google Admin Console, configure to "Specific Google data" (The Holy Grail) to lock current scope footprint. ("Limited" is case-by-case only; never set to "Trusted".)',
        metrics: {
          totalFindings: uniqueFindings.filter(f => f.rule === 'TIER3_MODERATE_LOW_SPRAWL').length,
          distinctFamilies: groupFindingsByFamily(uniqueFindings.filter(f => f.rule === 'TIER3_MODERATE_LOW_SPRAWL')).length,
        },
        familyTargets: groupFindingsByFamily(uniqueFindings.filter(f => f.rule === 'TIER3_MODERATE_LOW_SPRAWL')),
      },
      {
        id: 'PLAYBOOK-TIER4-DORMANT-SHADOW-IT',
        rule: 'TIER4_DORMANT_SHADOW_IT',
        title: 'Tier 4: Dormant Shadow IT (>30 Days Inactive)',
        subtitle: 'Gate U1 (Score 1–3) ➔ Gate U3 (Dormant >30d): Inactive unconfigured applications in the domain.',
        severity: 'LOW',
        actionChannel: 'GOOGLE_ADMIN_CONSOLE',
        actionType: 'SPECIFIC_GOOGLE_DATA',
        adminConsolePath: 'Security > Access and data control > API controls > App access control',
        remediationSummary: 'In Google Admin Console, configure to "Specific Google data" (The Holy Grail) to lock the baseline scope footprint.',
        metrics: {
          totalFindings: uniqueFindings.filter(f => f.rule === 'TIER4_DORMANT_SHADOW_IT').length,
          distinctFamilies: groupFindingsByFamily(uniqueFindings.filter(f => f.rule === 'TIER4_DORMANT_SHADOW_IT')).length,
        },
        familyTargets: groupFindingsByFamily(uniqueFindings.filter(f => f.rule === 'TIER4_DORMANT_SHADOW_IT')),
      },
      {
        id: 'PLAYBOOK-TRUSTED-LEAST-PRIVILEGE',
        rule: 'TRUSTED_POLICY_LEAST_PRIVILEGE',
        title: 'Trusted Application Governance (Gates T1–T4: New Scope Tier & 6-Month Review)',
        subtitle: 'Audit Trusted applications requesting new OAuth scopes (Restricted=Critical, Sensitive=High, Non-Sensitive=Medium) or exceeding the 6-month review window with High/Critical risk scores (3.0–5.0).',
        severity: 'HIGH',
        actionChannel: 'GOOGLE_ADMIN_CONSOLE',
        actionType: 'SPECIFIC_GOOGLE_DATA',
        adminConsolePath: 'Security > Access and data control > API controls > App access control',
        remediationSummary: 'In Google Admin Console, transition actionable Trusted apps to "Specific Google data" (The Holy Grail) — we never recommend keeping blanket Trusted access.',
        metrics: {
          totalFindings: uniqueFindings.filter(f => f.rule === 'TRUSTED_POLICY_LEAST_PRIVILEGE').length,
          distinctFamilies: groupFindingsByFamily(uniqueFindings.filter(f => f.rule === 'TRUSTED_POLICY_LEAST_PRIVILEGE')).length,
        },
        familyTargets: groupFindingsByFamily(uniqueFindings.filter(f => f.rule === 'TRUSTED_POLICY_LEAST_PRIVILEGE')),
      },
      {
        id: 'PLAYBOOK-SUPER-ADMIN-EXPOSURE',
        rule: 'ADMIN_PRIVILEGE_EXPOSURE',
        title: 'Super Admin Authorization Review',
        subtitle: 'Informational visibility into high-privilege third-party applications authorized by Super Administrators for review in Google Admin Console.',
        severity: 'CRITICAL',
        actionChannel: 'GOOGLE_ADMIN_CONSOLE',
        actionType: 'SPECIFIC_GOOGLE_DATA',
        adminConsolePath: 'Security > Access and data control > API controls > App access control',
        remediationSummary: 'Review Super Admin application authorizations in Google Admin Console and ensure approved tools are locked to "Specific Google data" (The Holy Grail).',
        metrics: {
          totalFindings: adminExpFindings.length,
          distinctAdmins: adminGroups.length,
          distinctFamilies: groupFindingsByFamily(adminExpFindings).length,
        },
        adminBreakdown: adminGroups,
        familyTargets: groupFindingsByFamily(adminExpFindings),
      }
    ];

    // -------------------------------------------------------------
    // ASSEMBLE ASSET-CENTRIC (BY PRODUCT FAMILY) INDEX
    // -------------------------------------------------------------
    const allFamilyTargetsMap = new Map();
    for (const f of uniqueFindings) {
      const fId = f.familyId || f.application;
      if (!allFamilyTargetsMap.has(fId)) {
        allFamilyTargetsMap.set(fId, {
          familyId: fId,
          familyName: f.familyName || f.application,
          vendor: f.familyVendor || f.vendor,
          iconUrl: f.familyIconUrl || null,
          highestSeverity: f.severity,
          rulesTriggered: new Set(),
          actionChannels: new Set(),
          findingsCount: 0,
          clientIds: new Set(),
          affectedAccounts: new Set(),
          findings: []
        });
      }
      const fam = allFamilyTargetsMap.get(fId);
      fam.findingsCount++;
      fam.rulesTriggered.add(f.rule);
      fam.actionChannels.add(f.actionChannel);
      if (severityWeight[f.severity] > (severityWeight[fam.highestSeverity] || 0)) {
        fam.highestSeverity = f.severity;
      }
      if (f.clientId) fam.clientIds.add(f.clientId);
      if (f.affectedAccount) fam.affectedAccounts.add(f.affectedAccount);
      fam.findings.push(f);
    }

    const byFamily = Array.from(allFamilyTargetsMap.values()).map(fam => ({
      ...fam,
      rulesTriggered: Array.from(fam.rulesTriggered),
      actionChannels: Array.from(fam.actionChannels),
      clientIds: Array.from(fam.clientIds),
      affectedAccounts: Array.from(fam.affectedAccounts),
    })).sort((a, b) => {
      const diff = (severityWeight[b.highestSeverity] || 0) - (severityWeight[a.highestSeverity] || 0);
      if (diff !== 0) return diff;
      return b.findingsCount - a.findingsCount;
    });

    // -------------------------------------------------------------
    // ASSEMBLE ADMIN-CENTRIC (BY SUPER ADMIN) INDEX
    // -------------------------------------------------------------
    const byAdmin = adminGroups;

    return {
      summary: {
        totalFindings: uniqueFindings.length,
        totalPlaybooks: playbooks.length,
        totalFamiliesAffected: byFamily.length,
        totalAdminsAffected: byAdmin.length,
        criticalCount: uniqueFindings.filter(f => f.severity === 'CRITICAL').length,
        highCount: uniqueFindings.filter(f => f.severity === 'HIGH').length,
        mediumCount: uniqueFindings.filter(f => f.severity === 'MEDIUM').length,
        actionChannels: {
          GOOGLE_ADMIN_CONSOLE: uniqueFindings.length,
        }
      },
      // Backwards-compatibility fields
      totalFindings: uniqueFindings.length,
      criticalCount: uniqueFindings.filter(f => f.severity === 'CRITICAL').length,
      highCount: uniqueFindings.filter(f => f.severity === 'HIGH').length,
      mediumCount: uniqueFindings.filter(f => f.severity === 'MEDIUM').length,
      playbooks,
      byFamily,
      byAdmin,
      findings: uniqueFindings,
    };
  }
}

// CLI Execution & Report Generation
if (process.argv[1]?.endsWith('recommendations_engine.mjs')) {
  const engine = new AdminLensRiskEngine();
  const report = engine.evaluateDomainRisks();

  const outputDir = './recommendations';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const recsJson = JSON.stringify(report, null, 2);
  fs.writeFileSync(path.join(outputDir, 'recommendations.json'), recsJson);

  // Sync to mosaic-next/data if present
  const mosaicDataDir = './mosaic-next/data';
  if (fs.existsSync(mosaicDataDir)) {
    fs.writeFileSync(path.join(mosaicDataDir, 'recommendations.json'), recsJson);
  }

  console.log('=== ADMIN LENS INFORMATIONAL RECOMMENDATIONS ENGINE ===');
  console.log(`Total Informational Findings: ${report.summary.totalFindings}`);
  console.log(` - Governance Playbooks: ${report.summary.totalPlaybooks}`);
  console.log(` - Distinct Product Families: ${report.summary.totalFamiliesAffected}`);
  console.log(` - Distinct Super Admins Reviewed: ${report.summary.totalAdminsAffected}`);
  console.log(` - Severities: CRITICAL=${report.summary.criticalCount}, HIGH=${report.summary.highCount}, MEDIUM=${report.summary.mediumCount}`);
  console.log(` - Destination: GOOGLE_ADMIN_CONSOLE (${report.summary.actionChannels.GOOGLE_ADMIN_CONSOLE} findings)`);
  console.log(`Report written to ${outputDir}/recommendations.json and synced to ${mosaicDataDir}/recommendations.json\n`);

  console.log('Governance Playbooks Overview:');
  report.playbooks.forEach((p, idx) => {
    console.log(`\n[Playbook ${idx + 1}] [${p.severity}] ${p.title} (${p.actionChannel})`);
    console.log(`    Subtitle: ${p.subtitle}`);
    console.log(`    Scope: ${p.metrics.totalFindings} findings across ${p.metrics.distinctFamilies} families`);
  });
}

