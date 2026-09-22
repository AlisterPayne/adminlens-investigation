import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

export class AdminLensRiskEngine {
  constructor(dbPath = './adminlens.db') {
    this.db = new DatabaseSync(dbPath);
  }

  evaluateDomainRisks() {
    const findings = [];

    // -------------------------------------------------------------
    // RULE 1: Unverified + Unconfigured + High/Critical Risk (CRITICAL - NO GAM COMMAND)
    // "If an application is a risk - Critical or High - and the application is unverified
    // by Google - And the application has not been configured by the administrator.
    // Then this is a critical. Do not include a gam command for the remediation.
    // The remediation: urgently review the app and contact users to build/verify use case.
    // Recommendation: if strong use case -> only allow specific data; if not -> block."
    // -------------------------------------------------------------
    const unverifiedUnconfigured = this.db.prepare(`
      SELECT 
        a.id as app_id,
        a.display_name,
        a.vendor,
        a.risk_level,
        a.total_users_count,
        GROUP_CONCAT(DISTINCT g.user_email) as user_emails,
        g.client_id
      FROM applications a
      JOIN grants g ON a.id = g.application_id
      WHERE a.risk_level IN ('CRITICAL', 'HIGH')
        AND a.is_verified = 0
        AND a.admin_access_level = 'UNCONFIGURED'
      GROUP BY a.id
    `).all();

    for (const u of unverifiedUnconfigured) {
      const users = (u.user_emails || '').split(',');
      const userDisplay = users.length <= 3 
        ? users.join(', ') 
        : `${u.total_users_count} users (including ${users.slice(0, 3).join(', ')}...)`;

      findings.push({
        id: `REC-UNVERIFIED-UNCONFIGURED-${u.app_id}`,
        rule: 'UNVERIFIED_UNCONFIGURED_HIGH_RISK',
        title: `Critical Governance Review: "${u.display_name}" (Unverified & Unconfigured)`,
        severity: 'CRITICAL',
        application: u.display_name,
        vendor: u.vendor,
        affectedAccount: userDisplay,
        clientId: u.client_id || u.app_id,
        details: `"${u.display_name}" carries a ${u.risk_level} risk rating, is unverified by Google, and has not been configured or reviewed by an administrator in Google Workspace API Access Control.`,
        remediation: `Urgently review this application and contact the user(s) using the application (${userDisplay}) to confirm if access was intended and ensure they build or establish a legitimate business use case. Recommendation: If the user has a strong, validated use case, configure the application in Google Admin Console (Security > Access and data control > API controls > App access control) to only allow "Specific Google data". If there is no good or approved use case, block the application immediately.`,
        actionType: 'SPECIFIC_DATA_OR_BLOCK',
        adminConsolePath: 'Security > Access and data control > API controls > App access control',
        // Note: No GAM command is included for unverified unconfigured high/critical apps
      });
    }

    // -------------------------------------------------------------
    // RULE 2: Super Admin Account Exposure (Verified / Configured Apps)
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
        title: `Super Admin Token Exposure: "${r.display_name}"`,
        severity: 'CRITICAL',
        application: r.display_name,
        vendor: r.vendor,
        affectedAccount: r.admin_email,
        clientId: r.client_id,
        details: `Super Admin "${r.admin_email}" authorized "${r.display_name}" with high-privilege scopes (${scopes.length} scopes). If this token is abused, it poses a full tenant compromise risk.`,
        remediation: `Review whether this admin account requires this third-party tool. If not required for administration, revoke the token and require the app to run under a dedicated least-privilege service account.`,
        actionType: 'REVOKE_OR_RESTRICT',
        gamCommand: `gam user ${r.admin_email} delete token clientid ${r.client_id}`,
      });
    }

    // -------------------------------------------------------------
    // RULE 3: Overprivileged Full Google Drive Scopes (Excluding unverified unconfigured apps)
    // -------------------------------------------------------------
    const broadDriveApps = this.db.prepare(`
      SELECT 
        a.id as app_id,
        a.display_name,
        a.vendor,
        a.total_users_count,
        GROUP_CONCAT(DISTINCT g.user_email) as user_emails,
        g.client_id
      FROM applications a
      JOIN grants g ON a.id = g.application_id
      JOIN application_scopes s ON a.id = s.application_id
      WHERE s.scope_url = 'https://www.googleapis.com/auth/drive'
        AND NOT (a.is_verified = 0 AND a.admin_access_level = 'UNCONFIGURED')
      GROUP BY a.id
    `).all();

    for (const d of broadDriveApps) {
      const users = (d.user_emails || '').split(',');
      const userDisplay = users.length <= 3 ? users.join(', ') : `${d.total_users_count} users (${users.slice(0, 2).join(', ')}...)`;
      findings.push({
        id: `REC-BROAD-DRIVE-${d.app_id}`,
        rule: 'OVERPRIVILEGED_DRIVE_ACCESS',
        title: `Overprivileged Full Google Drive Access: "${d.display_name}"`,
        severity: 'HIGH',
        application: d.display_name,
        vendor: d.vendor,
        affectedAccount: userDisplay,
        clientId: d.client_id,
        details: `"${d.display_name}" holds the full Drive scope ('.../auth/drive'), allowing complete read, write, and deletion access to all files in the user's Google Drive and Shared Drives.`,
        remediation: `Evaluate if the application can function with restricted scopes (such as 'drive.file' for user-selected files or 'drive.readonly'). In Google Admin Console, set this app to 'Limited' or 'Blocked' in API Controls.`,
        actionType: 'RESTRICT_SCOPE',
        adminConsolePath: 'Security > Access and data control > API controls > App access control',
      });
    }

    // -------------------------------------------------------------
    // RULE 4: Unverified Third-Party Publisher Apps (Low/Medium Risk or Configured)
    // -------------------------------------------------------------
    const unverifiedApps = this.db.prepare(`
      SELECT 
        a.id as app_id,
        a.display_name,
        a.vendor,
        a.category,
        a.total_users_count,
        GROUP_CONCAT(DISTINCT g.user_email) as user_emails,
        g.client_id,
        a.risk_level
      FROM applications a
      JOIN grants g ON a.id = g.application_id
      WHERE a.is_verified = 0
        AND NOT (a.risk_level IN ('CRITICAL', 'HIGH') AND a.admin_access_level = 'UNCONFIGURED')
        AND a.vendor NOT LIKE '%Apps Script%'
      GROUP BY a.id
    `).all();

    for (const u of unverifiedApps) {
      const users = (u.user_emails || '').split(',');
      const userDisplay = users.length <= 3 ? users.join(', ') : `${u.total_users_count} users (${users.slice(0, 2).join(', ')}...)`;
      findings.push({
        id: `REC-UNVERIFIED-APP-${u.app_id}`,
        rule: 'UNVERIFIED_PUBLISHER_APP',
        title: `Unverified Third-Party Publisher: "${u.display_name}"`,
        severity: 'MEDIUM',
        application: u.display_name,
        vendor: u.vendor,
        affectedAccount: userDisplay,
        clientId: u.client_id,
        details: `"${u.display_name}" is an unverified third-party app with data access scopes granted in your domain. Unverified apps have not completed Google's OAuth verification process.`,
        remediation: `Block or place this unverified app into Restricted status in Workspace API Controls until vendor due diligence is complete.`,
        actionType: 'BLOCK_OR_ALLOWLIST',
        adminConsolePath: 'Security > Access and data control > API controls > App access control',
      });
    }

    // -------------------------------------------------------------
    // RULE 5: Trusted Policy Least Privilege Review
    // -------------------------------------------------------------
    const trustedLowAdoption = this.db.prepare(`
      SELECT 
        a.id as app_id,
        a.display_name,
        a.vendor,
        a.total_users_count,
        a.admin_access_level,
        p.org_unit_path
      FROM applications a
      JOIN app_access_policies p ON a.id = p.application_id
      WHERE a.admin_access_level = 'TRUSTED' AND a.total_users_count <= 1
    `).all();

    for (const t of trustedLowAdoption) {
      findings.push({
        id: `REC-TRUSTED-LEAST-PRIVILEGE-${t.app_id}`,
        rule: 'TRUSTED_POLICY_LEAST_PRIVILEGE',
        title: `Trusted Access Policy Review: "${t.display_name}"`,
        severity: 'MEDIUM',
        application: t.display_name,
        vendor: t.vendor,
        affectedAccount: `Domain OU: ${t.org_unit_path}`,
        clientId: t.app_id,
        details: `"${t.display_name}" is marked as "Trusted" in Google Admin Console (allowing access to all Google data), but only ${t.total_users_count} active user is currently utilizing it. Setting broad "Trusted" status increases potential blast radius if client credentials are compromised.`,
        remediation: `Review this app in Google Admin Console (Security > API Controls > App Access Control). Consider scoping access down from "Trusted" to "Specific Google data" or restricting the policy to specific organizational units.`,
        actionType: 'RESTRICT_SCOPE',
        adminConsolePath: 'Security > Access and data control > API controls > App access control',
      });
    }

    // -------------------------------------------------------------
    // RULE 6: Verified Shadow IT Apps with High-Risk that remain Unconfigured
    // -------------------------------------------------------------
    const verifiedUnconfigured = this.db.prepare(`
      SELECT 
        a.id as app_id,
        a.display_name,
        a.vendor,
        a.risk_level,
        a.total_users_count,
        GROUP_CONCAT(DISTINCT g.user_email) as user_emails,
        g.client_id
      FROM applications a
      JOIN grants g ON a.id = g.application_id
      WHERE a.admin_access_level = 'UNCONFIGURED' 
        AND a.risk_level IN ('CRITICAL', 'HIGH')
        AND a.is_verified = 1
      GROUP BY a.id
    `).all();

    for (const u of verifiedUnconfigured) {
      const users = (u.user_emails || '').split(',');
      const userDisplay = users.length <= 3 ? users.join(', ') : `${u.total_users_count} users (${users.slice(0, 2).join(', ')}...)`;
      findings.push({
        id: `REC-UNCONFIGURED-HIGH-RISK-${u.app_id}`,
        rule: 'UNCONFIGURED_SHADOW_IT_RISK',
        title: `Unreviewed High-Risk App: "${u.display_name}"`,
        severity: u.risk_level === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
        application: u.display_name,
        vendor: u.vendor,
        affectedAccount: userDisplay,
        clientId: u.client_id,
        details: `"${u.display_name}" holds ${u.risk_level} privilege scopes but has no explicit policy set in Google Workspace API Access Control (Status: Unconfigured / Default).`,
        remediation: `Audit this application in Google Admin Console. Explicitly configure its access policy to "Limited", "Specific data", or "Blocked" to prevent unauthorized escalation.`,
        actionType: 'BLOCK_OR_ALLOWLIST',
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

    // Enrich each finding with product family metadata
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
      f.actionChannel = f.gamCommand ? 'GAM_CLI' : 'GOOGLE_ADMIN_CONSOLE';
    }

    // Sort by severity (CRITICAL -> HIGH -> MEDIUM -> LOW)
    const severityWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    uniqueFindings.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]);

    // -------------------------------------------------------------
    // PLAYBOOK 1: SUPER ADMIN PRIVILEGE EXPOSURE
    // -------------------------------------------------------------
    const adminExpFindings = uniqueFindings.filter(f => f.rule === 'ADMIN_PRIVILEGE_EXPOSURE');
    const adminGroupsMap = new Map();
    for (const f of adminExpFindings) {
      const email = f.affectedAccount;
      if (!adminGroupsMap.has(email)) {
        adminGroupsMap.set(email, {
          adminEmail: email,
          tokenCount: 0,
          gamCommands: [],
          items: []
        });
      }
      const group = adminGroupsMap.get(email);
      group.tokenCount++;
      if (f.gamCommand) group.gamCommands.push(f.gamCommand);
      group.items.push(f);
    }

    const adminGroups = Array.from(adminGroupsMap.values()).map(g => ({
      ...g,
      batchGamScript: [
        `# ========================================================`,
        `# Admin Token Cleanup for: ${g.adminEmail} (${g.tokenCount} tokens)`,
        `# Generated by AdminLens Risk Engine`,
        `# ========================================================`,
        ...g.gamCommands
      ].join('\n')
    })).sort((a, b) => b.tokenCount - a.tokenCount);

    const allAdminGamCommands = adminExpFindings.map(f => f.gamCommand).filter(Boolean);
    const superAdminBatchScript = [
      `#!/bin/bash`,
      `# ========================================================`,
      `# ADMINLENS BATCH REMEDIATION: SUPER ADMIN TOKEN CLEANUP`,
      `# Total Tokens to Revoke: ${allAdminGamCommands.length}`,
      `# Impacted Admins: ${adminGroups.length} Super Administrators`,
      `# ========================================================`,
      ...adminGroups.flatMap(g => [
        `\n# --- Tokens for ${g.adminEmail} (${g.tokenCount} tokens) ---`,
        ...g.gamCommands
      ]),
      `\necho "✓ All ${allAdminGamCommands.length} high-privilege Super Admin tokens revoked."`
    ].join('\n');

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
            gamCommands: [],
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
        if (item.gamCommand) target.gamCommands.push(item.gamCommand);
        target.items.push(item);
      }
      return Array.from(famMap.values()).map(t => ({
        ...t,
        affectedAccounts: Array.from(t.affectedAccounts),
        clientIds: Array.from(t.clientIds),
      })).sort((a, b) => b.findingsCount - a.findingsCount);
    };

    // -------------------------------------------------------------
    // ASSEMBLE THE 6 ACTION PLAYBOOKS (CAMPAIGNS)
    // -------------------------------------------------------------
    const playbooks = [
      {
        id: 'PLAYBOOK-SUPER-ADMIN-EXPOSURE',
        rule: 'ADMIN_PRIVILEGE_EXPOSURE',
        title: 'Super Admin Token Hygiene & Revocation',
        subtitle: 'Revoke unused, high-privilege third-party tokens granted by Super Administrators to eliminate full-tenant compromise vectors.',
        severity: 'CRITICAL',
        actionChannel: 'GAM_CLI',
        actionType: 'REVOKE_OR_RESTRICT',
        adminConsolePath: 'Security > Access and data control > API controls > App access control',
        remediationSummary: 'Execute GAM batch command to delete authorized OAuth tokens for Super Admin accounts, or migrate the tools to run under dedicated least-privilege service accounts.',
        batchGamScript: superAdminBatchScript,
        metrics: {
          totalFindings: adminExpFindings.length,
          distinctAdmins: adminGroups.length,
          distinctFamilies: groupFindingsByFamily(adminExpFindings).length,
        },
        adminBreakdown: adminGroups,
        familyTargets: groupFindingsByFamily(adminExpFindings),
      },
      {
        id: 'PLAYBOOK-UNVERIFIED-UNCONFIGURED',
        rule: 'UNVERIFIED_UNCONFIGURED_HIGH_RISK',
        title: 'Rogue Unverified & Unconfigured High-Risk Apps',
        subtitle: 'Urgently review unverified applications and internal Google Apps Scripts holding Critical/High permissions with no tenant policy.',
        severity: 'CRITICAL',
        actionChannel: 'GOOGLE_ADMIN_CONSOLE',
        actionType: 'SPECIFIC_DATA_OR_BLOCK',
        adminConsolePath: 'Security > Access and data control > API controls > App access control',
        remediationSummary: 'In Google Admin Console, configure apps with strong validated business need to "Specific Google data". If no approved use case exists, block the application immediately.',
        metrics: {
          totalFindings: uniqueFindings.filter(f => f.rule === 'UNVERIFIED_UNCONFIGURED_HIGH_RISK').length,
          distinctFamilies: groupFindingsByFamily(uniqueFindings.filter(f => f.rule === 'UNVERIFIED_UNCONFIGURED_HIGH_RISK')).length,
        },
        familyTargets: groupFindingsByFamily(uniqueFindings.filter(f => f.rule === 'UNVERIFIED_UNCONFIGURED_HIGH_RISK')),
      },
      {
        id: 'PLAYBOOK-OVERPRIVILEGED-DRIVE',
        rule: 'OVERPRIVILEGED_DRIVE_ACCESS',
        title: 'Broad Google Drive Full Access Scope Minimization',
        subtitle: 'Restrict third-party tools holding full read/write/delete Drive scope (".../auth/drive") down to least-privilege alternatives.',
        severity: 'HIGH',
        actionChannel: 'GOOGLE_ADMIN_CONSOLE',
        actionType: 'RESTRICT_SCOPE',
        adminConsolePath: 'Security > Access and data control > API controls > App access control',
        remediationSummary: 'In Google Admin Console, set application status to "Limited" or "Blocked", and evaluate if apps can migrate to scoped access ("drive.file" or "drive.readonly").',
        metrics: {
          totalFindings: uniqueFindings.filter(f => f.rule === 'OVERPRIVILEGED_DRIVE_ACCESS').length,
          distinctFamilies: groupFindingsByFamily(uniqueFindings.filter(f => f.rule === 'OVERPRIVILEGED_DRIVE_ACCESS')).length,
        },
        familyTargets: groupFindingsByFamily(uniqueFindings.filter(f => f.rule === 'OVERPRIVILEGED_DRIVE_ACCESS')),
      },
      {
        id: 'PLAYBOOK-UNCONFIGURED-SHADOW-IT',
        rule: 'UNCONFIGURED_SHADOW_IT_RISK',
        title: 'Unconfigured High-Risk Shadow IT Policy Enforcement',
        subtitle: 'Set explicit access policies for verified high-risk applications operating under default unconfigured tenant access.',
        severity: 'HIGH',
        actionChannel: 'GOOGLE_ADMIN_CONSOLE',
        actionType: 'BLOCK_OR_ALLOWLIST',
        adminConsolePath: 'Security > Access and data control > API controls > App access control',
        remediationSummary: 'In Google Admin Console, explicitly configure access policy to "Limited", "Specific data", or "Blocked" to prevent unauthorized data escalation.',
        metrics: {
          totalFindings: uniqueFindings.filter(f => f.rule === 'UNCONFIGURED_SHADOW_IT_RISK').length,
          distinctFamilies: groupFindingsByFamily(uniqueFindings.filter(f => f.rule === 'UNCONFIGURED_SHADOW_IT_RISK')).length,
        },
        familyTargets: groupFindingsByFamily(uniqueFindings.filter(f => f.rule === 'UNCONFIGURED_SHADOW_IT_RISK')),
      },
      {
        id: 'PLAYBOOK-TRUSTED-LEAST-PRIVILEGE',
        rule: 'TRUSTED_POLICY_LEAST_PRIVILEGE',
        title: 'Dormant "Trusted" App Blast Radius Downgrade',
        subtitle: 'Downgrade tenant-wide "Trusted" applications with 0-1 active users to "Limited" or "Specific Data" to reduce compromise surface.',
        severity: 'MEDIUM',
        actionChannel: 'GOOGLE_ADMIN_CONSOLE',
        actionType: 'RESTRICT_SCOPE',
        adminConsolePath: 'Security > Access and data control > API controls > App access control',
        remediationSummary: 'In Google Admin Console, downgrade access from "Trusted" to "Specific Google data" or restrict the policy to specific organizational units.',
        metrics: {
          totalFindings: uniqueFindings.filter(f => f.rule === 'TRUSTED_POLICY_LEAST_PRIVILEGE').length,
          distinctFamilies: groupFindingsByFamily(uniqueFindings.filter(f => f.rule === 'TRUSTED_POLICY_LEAST_PRIVILEGE')).length,
        },
        familyTargets: groupFindingsByFamily(uniqueFindings.filter(f => f.rule === 'TRUSTED_POLICY_LEAST_PRIVILEGE')),
      },
      {
        id: 'PLAYBOOK-UNVERIFIED-PUBLISHER',
        rule: 'UNVERIFIED_PUBLISHER_APP',
        title: 'Unverified Third-Party Publisher Due Diligence',
        subtitle: 'Audit and restrict unverified third-party vendors accessing domain workspace data until security review is completed.',
        severity: 'MEDIUM',
        actionChannel: 'GOOGLE_ADMIN_CONSOLE',
        actionType: 'BLOCK_OR_ALLOWLIST',
        adminConsolePath: 'Security > Access and data control > API controls > App access control',
        remediationSummary: 'Block or place unverified apps into "Restricted" status in Workspace API Controls until vendor due diligence is complete.',
        metrics: {
          totalFindings: uniqueFindings.filter(f => f.rule === 'UNVERIFIED_PUBLISHER_APP').length,
          distinctFamilies: groupFindingsByFamily(uniqueFindings.filter(f => f.rule === 'UNVERIFIED_PUBLISHER_APP')).length,
        },
        familyTargets: groupFindingsByFamily(uniqueFindings.filter(f => f.rule === 'UNVERIFIED_PUBLISHER_APP')),
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
          gamCommands: [],
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
      if (f.gamCommand) fam.gamCommands.push(f.gamCommand);
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
          GAM_CLI: uniqueFindings.filter(f => f.actionChannel === 'GAM_CLI').length,
          GOOGLE_ADMIN_CONSOLE: uniqueFindings.filter(f => f.actionChannel === 'GOOGLE_ADMIN_CONSOLE').length,
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

  console.log('=== ADMIN LENS SECURITY RECOMMENDATIONS ENGINE ===');
  console.log(`Total Actionable Security Findings: ${report.summary.totalFindings}`);
  console.log(` - Action Playbooks (Campaigns): ${report.summary.totalPlaybooks}`);
  console.log(` - Distinct Product Families: ${report.summary.totalFamiliesAffected}`);
  console.log(` - Distinct Super Admins Affected: ${report.summary.totalAdminsAffected}`);
  console.log(` - Severities: CRITICAL=${report.summary.criticalCount}, HIGH=${report.summary.highCount}, MEDIUM=${report.summary.mediumCount}`);
  console.log(` - Action Channels: GAM_CLI=${report.summary.actionChannels.GAM_CLI}, ADMIN_CONSOLE=${report.summary.actionChannels.GOOGLE_ADMIN_CONSOLE}`);
  console.log(`Report written to ${outputDir}/recommendations.json and synced to ${mosaicDataDir}/recommendations.json\n`);

  console.log('Action Playbooks Overview:');
  report.playbooks.forEach((p, idx) => {
    console.log(`\n[Playbook ${idx + 1}] [${p.severity}] ${p.title} (${p.actionChannel})`);
    console.log(`    Subtitle: ${p.subtitle}`);
    console.log(`    Scope: ${p.metrics.totalFindings} findings across ${p.metrics.distinctFamilies} families`);
    if (p.batchGamScript) {
      console.log(`    Batch CLI: Pre-composed GAM script ready (${p.adminBreakdown?.length} admins)`);
    }
  });
}

