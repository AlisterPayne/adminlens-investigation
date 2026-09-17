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

    // Deduplicate findings by ID
    const uniqueFindings = Array.from(new Map(findings.map(f => [f.id, f])).values());

    // Sort by severity (CRITICAL -> HIGH -> MEDIUM -> LOW)
    const severityWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    uniqueFindings.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity]);

    return {
      totalFindings: uniqueFindings.length,
      criticalCount: uniqueFindings.filter(f => f.severity === 'CRITICAL').length,
      highCount: uniqueFindings.filter(f => f.severity === 'HIGH').length,
      mediumCount: uniqueFindings.filter(f => f.severity === 'MEDIUM').length,
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

  fs.writeFileSync(path.join(outputDir, 'recommendations.json'), JSON.stringify(report, null, 2));

  console.log('=== ADMIN LENS SECURITY RECOMMENDATIONS ENGINE ===');
  console.log(`Total Actionable Security Findings: ${report.totalFindings}`);
  console.log(` - CRITICAL: ${report.criticalCount}`);
  console.log(` - HIGH: ${report.highCount}`);
  console.log(` - MEDIUM: ${report.mediumCount}`);
  console.log(`Report written to ${outputDir}/recommendations.json\n`);

  console.log('Top 5 Critical Findings:');
  report.findings.slice(0, 5).forEach((f, idx) => {
    console.log(`\n[${idx + 1}] [${f.severity}] ${f.title}`);
    console.log(`    User: ${f.affectedAccount} | App: ${f.application}`);
    console.log(`    Issue: ${f.details}`);
    console.log(`    Fix: ${f.remediation}`);
    if (f.gamCommand) console.log(`    CLI Action: ${f.gamCommand}`);
  });
}
