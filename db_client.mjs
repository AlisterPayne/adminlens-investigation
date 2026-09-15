import { DatabaseSync } from 'node:sqlite';

export class AdminLensDatabase {
  constructor(dbPath = './adminlens.db') {
    this.db = new DatabaseSync(dbPath);
  }

  getSummaryMetrics() {
    const totalApps = this.db.prepare('SELECT COUNT(*) as count FROM applications').get().count;
    const totalUsers = this.db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalGrants = this.db.prepare("SELECT COUNT(*) as count FROM grants WHERE status = 'ACTIVE'").get().count;
    const criticalApps = this.db.prepare("SELECT COUNT(*) as count FROM applications WHERE risk_level = 'CRITICAL'").get().count;
    const highRiskApps = this.db.prepare("SELECT COUNT(*) as count FROM applications WHERE risk_level = 'HIGH'").get().count;
    const trustedApps = this.db.prepare("SELECT COUNT(*) as count FROM applications WHERE admin_access_level = 'TRUSTED'").get().count;
    const blockedApps = this.db.prepare("SELECT COUNT(*) as count FROM applications WHERE admin_access_level = 'BLOCKED'").get().count;
    const specificApps = this.db.prepare("SELECT COUNT(*) as count FROM applications WHERE admin_access_level = 'SPECIFIC_DATA'").get().count;
    const unconfiguredApps = this.db.prepare("SELECT COUNT(*) as count FROM applications WHERE admin_access_level = 'UNCONFIGURED'").get().count;
    const multiClientApps = this.db.prepare(`
      SELECT COUNT(DISTINCT application_id) as count 
      FROM application_client_ids 
      GROUP BY application_id 
      HAVING COUNT(client_id) > 1
    `).all().length;

    return {
      totalApplications: totalApps,
      totalDomainUsers: totalUsers,
      totalActiveGrants: totalGrants,
      criticalRiskApps: criticalApps,
      highRiskApps: highRiskApps,
      trustedAppsCount: trustedApps,
      blockedAppsCount: blockedApps,
      specificDataAppsCount: specificApps,
      unconfiguredAppsCount: unconfiguredApps,
      multiClientApps: multiClientApps,
    };
  }

  listApplications({ riskLevel, category, accessLevel, limit = 50, offset = 0 } = {}) {
    let sql = 'SELECT * FROM applications WHERE 1=1';
    const params = [];

    if (riskLevel) {
      sql += ' AND risk_level = ?';
      params.push(riskLevel);
    }
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (accessLevel) {
      sql += ' AND admin_access_level = ?';
      params.push(accessLevel);
    }

    sql += ' ORDER BY CASE risk_level WHEN "CRITICAL" THEN 1 WHEN "HIGH" THEN 2 WHEN "MEDIUM" THEN 3 ELSE 4 END, total_users_count DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const apps = this.db.prepare(sql).all(...params);
    return apps.map(app => ({
      ...app,
      risk_reasons: JSON.parse(app.risk_reasons || '[]'),
      is_verified: Boolean(app.is_verified),
    }));
  }

  getApplicationDetails(appId) {
    const app = this.db.prepare('SELECT * FROM applications WHERE id = ?').get(appId);
    if (!app) return null;

    const clientIds = this.db.prepare('SELECT client_id, project_number FROM application_client_ids WHERE application_id = ?').all(appId);
    const scopes = this.db.prepare(`
      SELECT s.scope_url, s.risk_level, s.description,
             r.admin_score, r.admin_color, r.google_tier, r.rationale, r.threat_impact, r.service_name
      FROM application_scopes s
      LEFT JOIN oauth_scope_reference r ON s.scope_url = r.scope_url
      WHERE s.application_id = ?
    `).all(appId);
    const policy = this.db.prepare('SELECT * FROM app_access_policies WHERE application_id = ? LIMIT 1').get(appId);
    const grants = this.db.prepare(`
      SELECT g.id, g.client_id, g.user_email, g.scopes_json, u.name as user_name, u.org_unit_path, u.is_admin
      FROM grants g
      JOIN users u ON g.user_email = u.primary_email
      WHERE g.application_id = ? AND g.status = 'ACTIVE'
    `).all(appId);

    const auditCount = this.db.prepare('SELECT COUNT(*) as count FROM audit_events WHERE application_id = ?').get(appId)?.count || 0;

    return {
      ...app,
      risk_reasons: JSON.parse(app.risk_reasons || '[]'),
      is_verified: Boolean(app.is_verified),
      clientIds,
      scopes,
      accessPolicy: policy ? {
        ...policy,
        is_overridden: Boolean(policy.is_overridden),
        exempt_from_context_aware_access: Boolean(policy.exempt_from_context_aware_access),
        allowed_services: JSON.parse(policy.allowed_services_json || '{}')
      } : null,
      grants: grants.map(g => ({
        ...g,
        scopes: JSON.parse(g.scopes_json),
        is_admin: Boolean(g.is_admin),
      })),
      totalAuditEvents: auditCount,
    };
  }

  getAdminPrivilegedApps() {
    const apps = this.db.prepare(`
      SELECT DISTINCT a.* 
      FROM applications a
      JOIN grants g ON a.id = g.application_id
      JOIN users u ON g.user_email = u.primary_email
      WHERE u.is_admin = 1 AND a.risk_level IN ('CRITICAL', 'HIGH')
      ORDER BY a.risk_level, a.total_users_count DESC
    `).all();

    return apps.map(a => ({
      ...a,
      risk_reasons: JSON.parse(a.risk_reasons || '[]'),
    }));
  }

  getOAuthScopeReferences({ service, tier, minScore, search } = {}) {
    let sql = `
      SELECT 
        r.scope_url,
        r.service_name,
        r.google_tier,
        r.admin_score,
        r.admin_color,
        r.rationale,
        r.threat_impact,
        COALESCE(COUNT(DISTINCT s.application_id), 0) AS active_apps_count
      FROM oauth_scope_reference r
      LEFT JOIN application_scopes s ON r.scope_url = s.scope_url
      WHERE 1=1
    `;
    const params = [];

    if (service && service !== 'ALL') {
      sql += ' AND r.service_name = ?';
      params.push(service);
    }
    if (tier && tier !== 'ALL') {
      sql += ' AND r.google_tier = ?';
      params.push(tier);
    }
    if (minScore) {
      sql += ' AND r.admin_score >= ?';
      params.push(Number(minScore));
    }
    if (search) {
      sql += ' AND (r.scope_url LIKE ? OR r.rationale LIKE ? OR r.threat_impact LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += `
      GROUP BY r.scope_url
      ORDER BY r.admin_score DESC, r.service_name ASC, r.scope_url ASC
    `;

    return this.db.prepare(sql).all(...params);
  }

  getOAuthScopeMetrics() {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM oauth_scope_reference').get().count;
    const restricted = this.db.prepare("SELECT COUNT(*) as count FROM oauth_scope_reference WHERE google_tier = 'Restricted'").get().count;
    const sensitive = this.db.prepare("SELECT COUNT(*) as count FROM oauth_scope_reference WHERE google_tier = 'Sensitive'").get().count;
    const nonSensitive = this.db.prepare("SELECT COUNT(*) as count FROM oauth_scope_reference WHERE google_tier = 'Non-Sensitive'").get().count;

    const criticalCount = this.db.prepare("SELECT COUNT(*) as count FROM oauth_scope_reference WHERE admin_score = 5").get().count;
    const highCount = this.db.prepare("SELECT COUNT(*) as count FROM oauth_scope_reference WHERE admin_score = 4").get().count;
    const mediumCount = this.db.prepare("SELECT COUNT(*) as count FROM oauth_scope_reference WHERE admin_score = 3").get().count;
    const lowCount = this.db.prepare("SELECT COUNT(*) as count FROM oauth_scope_reference WHERE admin_score = 2").get().count;
    const minimalCount = this.db.prepare("SELECT COUNT(*) as count FROM oauth_scope_reference WHERE admin_score = 1").get().count;

    const services = this.db.prepare("SELECT DISTINCT service_name FROM oauth_scope_reference ORDER BY service_name").all().map(r => r.service_name);

    return {
      total,
      restricted,
      sensitive,
      nonSensitive,
      scores: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
        minimal: minimalCount
      },
      services
    };
  }
}

// CLI test
if (process.argv[1]?.endsWith('db_client.mjs')) {
  const dbClient = new AdminLensDatabase();
  console.log('Metrics:', dbClient.getSummaryMetrics());
  console.log('\nCritical / High Risk Apps Authorized by Admins:');
  const adminApps = dbClient.getAdminPrivilegedApps();
  adminApps.forEach(a => console.log(` - [${a.risk_level}] ${a.display_name} (${a.vendor}) - ${a.total_users_count} user(s)`));
}
