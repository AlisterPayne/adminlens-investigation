import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

const DB_PATH = './adminlens.db';
const SCHEMA_FILE = './schema.sql';

// Read extracted / standardized data
const catalog = JSON.parse(fs.readFileSync('./standardized_catalog/applications_catalog.json', 'utf8'));
const users = JSON.parse(fs.readFileSync('./extracted_data/users.json', 'utf8'));
const activeTokens = JSON.parse(fs.readFileSync('./extracted_data/active_tokens.json', 'utf8'));
const auditEvents = JSON.parse(fs.readFileSync('./extracted_data/token_audit_events.json', 'utf8'));

// Delete existing DB if rebuilding
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
}

const db = new DatabaseSync(DB_PATH);

console.log('[1] Executing schema DDL...');
const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf8');
db.exec(schemaSql);
console.log('✓ Tables and indexes created successfully.');

// Map Client ID -> Application ID for foreign key lookups
const clientToAppMap = new Map();
for (const app of catalog) {
  for (const cid of (app.clientIds || [])) {
    clientToAppMap.set(cid, app.id);
  }
}

// 2. Seed Users
console.log('[2] Seeding Users table...');
const insertUser = db.prepare(`
  INSERT OR REPLACE INTO users (id, primary_email, name, org_unit_path, is_admin)
  VALUES (?, ?, ?, ?, ?)
`);

db.exec('BEGIN TRANSACTION');
for (const u of users) {
  insertUser.run(
    u.id,
    u.primaryEmail,
    u.name?.fullName || u.primaryEmail,
    u.orgUnitPath || '/',
    Boolean(u.isAdmin || u.isDelegatedAdmin) ? 1 : 0
  );
}
db.exec('COMMIT');
console.log(`✓ Seeded ${users.length} users.`);

// 3. Seed Applications & Multi-Client IDs, Scopes & Policies
console.log('[3] Seeding Applications, Client IDs, Scopes, and Policies...');
const insertApp = db.prepare(`
  INSERT INTO applications (
    id, display_name, vendor, publisher_domain, category, is_verified,
    icon_url, store_url, risk_level, risk_score, risk_score_color,
    peak_scope_score, avg_scope_score,
    risk_reasons, admin_access_level,
    total_users_count, admin_users_count, first_seen_at, last_active_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertClientId = db.prepare(`
  INSERT OR REPLACE INTO application_client_ids (client_id, application_id, project_number)
  VALUES (?, ?, ?)
`);

const insertScope = db.prepare(`
  INSERT OR IGNORE INTO application_scopes (application_id, scope_url, risk_level, admin_score, admin_color, description)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertPolicy = db.prepare(`
  INSERT INTO app_access_policies (
    application_id, client_id, org_unit_path, access_level,
    is_overridden, exempt_from_context_aware_access, allowed_services_json,
    configured_by, last_policy_update
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

db.exec('BEGIN TRANSACTION');
for (const app of catalog) {
  insertApp.run(
    app.id,
    app.displayName || 'Unknown Application',
    app.vendor || 'Third-Party Developer',
    app.publisherDomain || null,
    app.category || 'Unclassified SaaS',
    app.isVerified ? 1 : 0,
    app.iconUrl || 'https://ui-avatars.com/api/?name=App&background=3B82F6&color=fff',
    app.storeUrl || null,
    app.riskLevel || 'LOW',
    app.riskScore ?? 1.0,
    app.riskScoreColor || 'Blue',
    app.peakScopeScore ?? 1,
    app.avgScopeScore ?? 1.0,
    JSON.stringify(app.riskReasons || []),
    app.adminAccessLevel || 'UNCONFIGURED',
    app.totalUsersCount || 0,
    app.adminUsersCount || 0,
    app.firstSeen || null,
    app.lastActive || null
  );

  // Client IDs
  for (const cid of (app.clientIds || [])) {
    const match = cid.match(/^(\d+)-/);
    const projNum = match ? match[1] : null;
    insertClientId.run(cid, app.id, projNum);
  }

  // Scopes
  for (const s of (app.scopes || [])) {
    const scopeUrl = typeof s === 'string' ? s : s.scope;
    const riskLevel = typeof s === 'object' && s.riskLevel ? s.riskLevel : (
      scopeUrl.includes('admin.') || scopeUrl.includes('mail.google.com') ? 'CRITICAL' :
      scopeUrl.includes('drive') && !scopeUrl.includes('readonly') && !scopeUrl.includes('file') ? 'HIGH' :
      scopeUrl.includes('directory') || scopeUrl.includes('calendar') || scopeUrl.includes('contacts') ? 'MEDIUM' : 'LOW'
    );
    const adminScore = typeof s === 'object' && s.adminScore !== undefined ? s.adminScore : 1;
    const adminColor = typeof s === 'object' && s.adminColor ? s.adminColor : 'Blue';
    const desc = typeof s === 'object' && s.description ? s.description : 'OAuth Scope';
    insertScope.run(app.id, scopeUrl, riskLevel, adminScore, adminColor, desc);
  }

  // App Access Policies
  if (app.accessPolicy) {
    for (const cid of (app.clientIds || [])) {
      insertPolicy.run(
        app.id,
        cid,
        app.accessPolicy.orgUnitPath || '/',
        app.accessPolicy.accessLevel || 'UNCONFIGURED',
        app.accessPolicy.isOverridden ? 1 : 0,
        app.accessPolicy.exemptFromContextAwareAccess ? 1 : 0,
        JSON.stringify(app.accessPolicy.allowedServices || {}),
        app.accessPolicy.configuredBy || null,
        app.accessPolicy.lastPolicyUpdate || null
      );
    }
  }
}
db.exec('COMMIT');
console.log(`✓ Seeded ${catalog.length} applications with mapped client IDs, scopes, and access policies.`);

// 4. Seed Grants
console.log('[4] Seeding Grants table...');
const insertGrant = db.prepare(`
  INSERT INTO grants (application_id, client_id, user_email, scopes_json, status, is_native_app, is_anonymous)
  VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?)
`);

db.exec('BEGIN TRANSACTION');
let grantCount = 0;
for (const token of activeTokens) {
  const appId = clientToAppMap.get(token.clientId) || token.clientId;
  insertGrant.run(
    appId,
    token.clientId,
    token.userEmail,
    JSON.stringify(token.scopes || []),
    token.nativeApp ? 1 : 0,
    token.anonymous ? 1 : 0
  );
  grantCount++;
}
db.exec('COMMIT');
console.log(`✓ Seeded ${grantCount} active user grants.`);

// 5. Seed Audit Events
console.log('[5] Seeding Audit Events table...');
const insertAudit = db.prepare(`
  INSERT OR IGNORE INTO audit_events (
    event_id, application_id, client_id, user_email, event_type,
    method_name, ip_address, country_code, region_code, event_time, raw_event_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

db.exec('BEGIN TRANSACTION');
let auditCount = 0;
for (const event of auditEvents) {
  for (const e of (event.events || [])) {
    let cid = null;
    let methodName = null;
    for (const p of (e.parameters || [])) {
      if (p.name === 'client_id') cid = p.value;
      if (p.name === 'method_name') methodName = p.value;
    }

    const eventId = `${event.id?.uniqueQualifier || ''}_${e.type}_${e.name}`;
    const appId = cid ? (clientToAppMap.get(cid) || null) : null;
    const eventType = `${e.type}:${e.name}`;

    insertAudit.run(
      eventId,
      appId,
      cid,
      event.actor?.email || null,
      eventType,
      methodName,
      event.ipAddress || null,
      event.networkInfo?.regionCode || null,
      event.networkInfo?.subdivisionCode || null,
      event.id?.time || new Date().toISOString(),
      JSON.stringify(event)
    );
    auditCount++;
  }
}
db.exec('COMMIT');
console.log(`✓ Seeded ${auditCount} audit events.`);

// 6. Seed OAuth Scope Reference Threat Matrix
console.log('[6] Seeding OAuth Scope Reference Threat Matrix...');
import('./seed_scope_reference.mjs').then(({ initAndSeedScopeReference }) => {
  initAndSeedScopeReference(DB_PATH);
  console.log('\n==============================================');
  console.log(`DATABASE CREATION & SEEDING COMPLETE: ${DB_PATH}`);
  console.log('==============================================');
});
