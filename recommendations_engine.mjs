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
    // RULE 1: Admin Account Exposure to Critical/High-Risk Apps
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
    // RULE 2: Unmanaged / "Untitled" Google Apps Scripts with High Privileges
    // -------------------------------------------------------------
    const untitledScripts = this.db.prepare(`
      SELECT 
        a.id as app_id,
        a.display_name,
        g.user_email,
        g.client_id,
        g.scopes_json
      FROM applications a
      JOIN grants g ON a.id = g.application_id
      WHERE (a.display_name LIKE '%untitled%' OR a.vendor LIKE '%Apps Script%')
        AND a.risk_level IN ('CRITICAL', 'HIGH')
    `).all();

    for (const s of untitledScripts) {
      const scopes = JSON.parse(s.scopes_json || '[]');
      findings.push({
        id: `REC-ORPHAN-SCRIPT-${s.app_id}-${s.user_email.split('@')[0]}`,
        rule: 'UNMANAGED_APPS_SCRIPT',
        title: `Unmanaged Custom Script with Elevated Rights: "${s.display_name}"`,
        severity: 'CRITICAL',
        application: s.display_name,
        vendor: 'Internal / Google Apps Script',
        affectedAccount: s.user_email,
        clientId: s.client_id,
        details: `Custom Apps Script authorized by "${s.user_email}" has sensitive capabilities: ${scopes.join(', ')}. Unmanaged scripts lack auditing and CI/CD controls.`,
        remediation: `Audit the underlying Apps Script project. If obsolete, revoke the grant. If legitimate, rename the project, review the source code, and ensure it complies with internal security policy.`,
        actionType: 'AUDIT_OR_DELETE',
        gamCommand: `gam user ${s.user_email} delete token clientid ${s.client_id}`,
      });
    }

    // -------------------------------------------------------------
    // RULE 3: Excessive / Broad Full Google Drive Scopes
    // -------------------------------------------------------------
    const broadDriveApps = this.db.prepare(`
      SELECT 
        a.id as app_id,
        a.display_name,
        a.vendor,
        a.total_users_count,
        g.user_email,
        g.client_id
      FROM applications a
      JOIN grants g ON a.id = g.application_id
      JOIN application_scopes s ON a.id = s.application_id
      WHERE s.scope_url = 'https://www.googleapis.com/auth/drive'
    `).all();

    for (const d of broadDriveApps) {
      findings.push({
        id: `REC-BROAD-DRIVE-${d.app_id}-${d.user_email.split('@')[0]}`,
        rule: 'OVERPRIVILEGED_DRIVE_ACCESS',
        title: `Overprivileged Full Google Drive Access: "${d.display_name}"`,
        severity: 'HIGH',
        application: d.display_name,
        vendor: d.vendor,
        affectedAccount: d.user_email,
        clientId: d.client_id,
        details: `"${d.display_name}" holds the full Drive scope ('.../auth/drive'), allowing complete read, write, and deletion access to all files in the user's Google Drive and Shared Drives.`,
        remediation: `Evaluate if the application can function with restricted scopes (such as 'drive.file' for user-selected files or 'drive.readonly'). In Google Admin Console, set this app to 'Limited' or 'Blocked' in API Controls.`,
        actionType: 'RESTRICT_SCOPE',
        adminConsolePath: 'Security > Access and data control > API controls > App access control',
      });
    }

    // -------------------------------------------------------------
    // RULE 4: Unverified Third-Party Shadow IT Apps
    // -------------------------------------------------------------
    const unverifiedApps = this.db.prepare(`
      SELECT 
        a.id as app_id,
        a.display_name,
        a.vendor,
        a.category,
        a.total_users_count,
        g.user_email,
        g.client_id,
        a.risk_level
      FROM applications a
      JOIN grants g ON a.id = g.application_id
      WHERE a.is_verified = 0 AND a.risk_level IN ('MEDIUM', 'HIGH', 'CRITICAL')
        AND a.vendor NOT LIKE '%Apps Script%'
    `).all();

    for (const u of unverifiedApps) {
      findings.push({
        id: `REC-UNVERIFIED-APP-${u.app_id}-${u.user_email.split('@')[0]}`,
        rule: 'UNVERIFIED_PUBLISHER_APP',
        title: `Unverified Third-Party Publisher: "${u.display_name}"`,
        severity: u.risk_level === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
        application: u.display_name,
        vendor: u.vendor,
        affectedAccount: u.user_email,
        clientId: u.client_id,
        details: `"${u.display_name}" is an unverified third-party app with data access scopes granted by "${u.user_email}". Unverified apps have not completed Google's OAuth verification process.`,
        remediation: `Block or place this unverified app into Restricted status in Workspace API Controls until vendor due diligence is complete.`,
        actionType: 'BLOCK_OR_ALLOWLIST',
        adminConsolePath: 'Security > Access and data control > API controls > App access control',
      });
    }

    // -------------------------------------------------------------
    // RULE 5: Trusted Low-Adoption / Over-Privileged App (Least Privilege Review)
    // -------------------------------------------------------------
    const trustedLowAdoption = this.db.prepare(`
      SELECT 
        a.id as app_id,
        a.display_name,
        a.vendor,
        a.total_users_count,
        a.admin_access_level,
        p.org_unit_path,
        p.is_overridden,
        p.configured_by
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
    // RULE 6: High-Risk Unconfigured Shadow IT App
    // -------------------------------------------------------------
    const unconfiguredHighRisk = this.db.prepare(`
      SELECT 
        a.id as app_id,
        a.display_name,
        a.vendor,
        a.risk_level,
        a.total_users_count,
        g.user_email,
        g.client_id
      FROM applications a
      JOIN grants g ON a.id = g.application_id
      WHERE a.admin_access_level = 'UNCONFIGURED' AND a.risk_level IN ('CRITICAL', 'HIGH')
    `).all();

    for (const u of unconfiguredHighRisk) {
      findings.push({
        id: `REC-UNCONFIGURED-HIGH-RISK-${u.app_id}-${u.user_email.split('@')[0]}`,
        rule: 'UNCONFIGURED_SHADOW_IT_RISK',
        title: `Unreviewed High-Risk App: "${u.display_name}"`,
        severity: u.risk_level === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
        application: u.display_name,
        vendor: u.vendor,
        affectedAccount: u.user_email,
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
