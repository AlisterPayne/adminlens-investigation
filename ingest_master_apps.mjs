import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { OAUTH_SCOPES_DATA } from './seed_scope_reference.mjs';
import { 
  enrichApplicationRecord, 
  calculateInherentRisk, 
  calculateBreachPenalty 
} from './app_enrichment_service.mjs';

const MASTER_CSV_PATH = fs.existsSync('./master_apps2.csv') ? './master_apps2.csv' : './master_apps.csv';
const DB_PATH = './adminlens.db';
const CATALOG_PATHS = [
  './standardized_catalog/applications_catalog.json',
  './mosaic-next/data/applications_catalog.json',
  './public/standardized_catalog.json'
];

export function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] !== undefined ? values[idx].trim() : '');
    });
    rows.push(row);
  }
  return rows;
}

export function parseRequestedServicesWithScopes(rawStr) {
  if (!rawStr || !rawStr.includes(':')) return { services: {}, scopes: [] };

  const services = {};
  const allScopes = [];

  let clean = rawStr.trim();
  if (clean.startsWith('[') && clean.endsWith(']')) {
    clean = clean.slice(1, -1);
  }

  const parts = clean.split('|');
  for (const part of parts) {
    const colonIdx = part.indexOf(':');
    if (colonIdx === -1) continue;
    const serviceName = part.slice(0, colonIdx).trim();
    let scopesPart = part.slice(colonIdx + 1).trim();
    if (scopesPart.startsWith('[') && scopesPart.endsWith(']')) {
      scopesPart = scopesPart.slice(1, -1);
    }
    const scopes = scopesPart.split(',').map(s => s.trim()).filter(Boolean);
    services[serviceName] = scopes;
    allScopes.push(...scopes);
  }

  return { services, scopes: Array.from(new Set(allScopes)) };
}

export function parseServicesList(rawStr) {
  if (!rawStr) return [];
  let clean = rawStr.trim();
  if (clean.startsWith('[') && clean.endsWith(']')) {
    clean = clean.slice(1, -1);
  }
  return clean.split(',').map(s => s.trim()).filter(Boolean);
}

export function checkIsVerified(status) {
  if (!status) return false;
  const s = status.trim().toLowerCase();
  return s === 'verified' || (s.includes('verified') && !s.includes('not verified') && !s.includes('unverified'));
}

export function getProjectNumber(clientId) {
  if (!clientId) return null;
  const match = clientId.match(/^(\d+)-/);
  return match ? match[1] : null;
}

export function buildScopeReferenceMap(db) {
  const map = new Map();
  // Load from seed constant first
  for (const s of OAUTH_SCOPES_DATA) {
    map.set(s.scope_url, {
      scope_url: s.scope_url,
      service_name: s.service_name,
      google_tier: s.google_tier,
      admin_score: s.admin_score,
      admin_color: s.admin_color,
      rationale: s.rationale,
      threat_impact: s.threat_impact,
      risk_level: s.admin_score >= 5 ? 'CRITICAL' : (s.admin_score === 4 ? 'HIGH' : (s.admin_score === 3 ? 'MEDIUM' : 'LOW'))
    });
  }

  // Also query existing DB records
  try {
    const dbScopes = db.prepare('SELECT * FROM oauth_scope_reference').all();
    for (const s of dbScopes) {
      map.set(s.scope_url, {
        scope_url: s.scope_url,
        service_name: s.service_name,
        google_tier: s.google_tier,
        admin_score: s.admin_score,
        admin_color: s.admin_color,
        rationale: s.rationale,
        threat_impact: s.threat_impact,
        risk_level: s.admin_score >= 5 ? 'CRITICAL' : (s.admin_score === 4 ? 'HIGH' : (s.admin_score === 3 ? 'MEDIUM' : 'LOW'))
      });
    }
  } catch (err) {
    // Ignore if table not ready
  }

  return map;
}

export function resolveScopeMetadata(scopeUrl, serviceNameHint, scopeRefMap) {
  if (scopeRefMap.has(scopeUrl)) {
    return scopeRefMap.get(scopeUrl);
  }

  const s = scopeUrl.toLowerCase();
  let admin_score = 1;
  let admin_color = 'Blue';
  let risk_level = 'LOW';
  let google_tier = 'Non-Sensitive';
  let rationale = 'Basic API / SSO Access';
  let threat_impact = 'Accesses basic endpoint user data.';
  let service_name = serviceNameHint || 'Google Services';

  if (s.includes('mail.google.com') || s.includes('gmail.modify') || s.includes('admin.') || s.includes('directory.')) {
    admin_score = 5;
    admin_color = 'Red';
    risk_level = 'CRITICAL';
    google_tier = 'Restricted';
    rationale = 'Administrative or Direct Mail Access';
    threat_impact = 'Full control over domain administration or communications.';
    service_name = s.includes('gmail') || s.includes('mail') ? 'Gmail' : 'Google Workspace Admin';
  } else if ((s.includes('drive') && !s.includes('readonly') && !s.includes('file') && !s.includes('appdata') && !s.includes('metadata')) || s.includes('gmail') || s.includes('classroom.coursework.students')) {
    admin_score = 4;
    admin_color = 'Orange';
    risk_level = 'HIGH';
    google_tier = 'Restricted';
    rationale = 'Full Storage or Operational Access';
    threat_impact = 'Read and write across user files and sensitive assets.';
    service_name = s.includes('drive') ? 'Google Drive' : (s.includes('gmail') ? 'Gmail' : 'Classroom');
  } else if (s.includes('calendar') || s.includes('contacts') || s.includes('carddav') || s.includes('spreadsheets') || s.includes('drive.file') || s.includes('drive.readonly')) {
    admin_score = 3;
    admin_color = 'Yellow';
    risk_level = 'MEDIUM';
    google_tier = 'Sensitive';
    rationale = 'Collaboration & Resource Modification';
    threat_impact = 'Accesses calendar, contacts, spreadsheets, or application-specific files.';
    service_name = s.includes('calendar') ? 'Google Calendar' : (s.includes('contact') || s.includes('carddav') ? 'Contacts' : (s.includes('sheet') ? 'Google Sheets' : 'Google Drive'));
  } else if (s.includes('readonly') || s.includes('addons') || s.includes('metadata') || s.includes('birthday') || s.includes('profile.')) {
    admin_score = 2;
    admin_color = 'Green';
    risk_level = 'LOW';
    google_tier = 'Sensitive';
    rationale = 'Read-Only Service Permissions';
    threat_impact = 'Read-only access to selected user data or service extensions.';
  } else {
    admin_score = 1;
    admin_color = 'Blue';
    risk_level = 'LOW';
    google_tier = 'Non-Sensitive';
    rationale = 'Identity & Basic Sign-in';
    threat_impact = 'Basic authentication and identity verification.';
    service_name = 'Google Sign-in';
  }

  const meta = {
    scope_url: scopeUrl,
    service_name,
    google_tier,
    admin_score,
    admin_color,
    risk_level,
    rationale,
    threat_impact
  };

  scopeRefMap.set(scopeUrl, meta);
  return meta;
}

export function calculateApplicationRisk(scopesList, options = {}) {
  const {
    isVerified = true,
    breaches = [],
    appType = 'Web Application',
    referenceDate = new Date()
  } = options;

  return calculateInherentRisk({
    scopesList,
    isVerified,
    breaches,
    appType,
    referenceDate
  });
}

export function ingestMasterApps() {
  console.log(`[1] Reading and parsing ${MASTER_CSV_PATH}...`);
  if (!fs.existsSync(MASTER_CSV_PATH)) {
    throw new Error(`CSV file ${MASTER_CSV_PATH} not found.`);
  }

  const csvContent = fs.readFileSync(MASTER_CSV_PATH, 'utf8');
  const rawRows = parseCSV(csvContent);
  const totalRowsRead = rawRows.length;

  let skippedInternalCount = 0;
  let deduplicatedCount = 0;

  // Key: application/client ID
  const groupedApps = new Map();

  for (const r of rawRows) {
    const rawOwnership = r['Ownership'] ? r['Ownership'].trim() : 'Unknown';
    if (rawOwnership.toLowerCase() === 'internal') {
      skippedInternalCount++;
      continue;
    }

    const id = r['Id']?.trim();
    if (!id) continue;

    const isVerified = checkIsVerified(r['Verification Status']);
    const appName = r['App Name']?.trim() || id;
    const clientType = r['Type']?.trim() || 'Web Application';
    const { services, scopes } = parseRequestedServicesWithScopes(r['Requested Services with Scopes']);
    const servicesList = parseServicesList(r['Requested Services']);

    if (groupedApps.has(id)) {
      deduplicatedCount++;
      const existing = groupedApps.get(id);

      // Merge verified flag (true if any row is verified)
      if (isVerified) existing.isVerified = true;

      // Prefer longest / most descriptive app name
      if (appName.length > existing.appName.length && !existing.appName.includes(appName)) {
        existing.appName = appName;
      }

      // Merge client type if existing is unknown
      if ((!existing.clientType || existing.clientType.includes('Unknown')) && clientType) {
        existing.clientType = clientType;
      }

      // Merge scopes
      scopes.forEach(s => existing.scopesSet.add(s));

      // Merge services
      servicesList.forEach(s => existing.servicesSet.add(s));
      for (const [srv, scps] of Object.entries(services)) {
        existing.servicesSet.add(srv);
        if (!existing.serviceScopesMap[srv]) existing.serviceScopesMap[srv] = new Set();
        scps.forEach(s => existing.serviceScopesMap[srv].add(s));
      }
    } else {
      const scopesSet = new Set(scopes);
      const servicesSet = new Set(servicesList);
      const serviceScopesMap = {};
      for (const [srv, scps] of Object.entries(services)) {
        servicesSet.add(srv);
        serviceScopesMap[srv] = new Set(scps);
      }

      groupedApps.set(id, {
        id,
        appName,
        clientType,
        ownership: rawOwnership || 'Unknown',
        isVerified,
        scopesSet,
        servicesSet,
        serviceScopesMap
      });
    }
  }

  console.log(`✓ Read ${totalRowsRead} rows.`);
  console.log(`  - Excluded Internal: ${skippedInternalCount}`);
  console.log(`  - Duplicate rows merged: ${deduplicatedCount}`);
  console.log(`  - Unique applications to ingest: ${groupedApps.size}`);

  console.log('[2] Connecting to SQLite database...');
  const db = new DatabaseSync(DB_PATH);
  const scopeRefMap = buildScopeReferenceMap(db);

  // Prepared statements for adminlens.db
  const checkAppStmt = db.prepare('SELECT * FROM applications WHERE id = ?');
  const updateAppStmt = db.prepare(`
    UPDATE applications 
    SET is_verified = MAX(is_verified, ?),
        risk_score = ?,
        risk_level = ?,
        risk_score_color = ?,
        scope_risk_score = ?,
        verification_penalty = ?,
        breach_penalty = ?,
        breach_bracket = ?,
        breaches_json = ?,
        peak_scope_score = ?,
        breadth_score = ?,
        avg_scope_score = ?,
        risk_reasons = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `);

  const insertAppStmt = db.prepare(`
    INSERT INTO applications (
      id, display_name, vendor, publisher_domain, category, is_verified,
      icon_url, store_url, risk_level, risk_score, risk_score_color,
      scope_risk_score, verification_penalty, breach_penalty, breach_bracket, breaches_json,
      peak_scope_score, breadth_score, avg_scope_score,
      risk_reasons, admin_access_level, is_google_service, app_type,
      total_users_count, admin_users_count, first_seen_at, last_active_at,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      datetime('now'), datetime('now')
    )
  `);

  const insertClientIdStmt = db.prepare(`
    INSERT OR IGNORE INTO application_client_ids (client_id, application_id, project_number, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `);

  const insertScopeStmt = db.prepare(`
    INSERT OR IGNORE INTO application_scopes (application_id, scope_url, risk_level, admin_score, admin_color, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertScopeRefStmt = db.prepare(`
    INSERT OR IGNORE INTO oauth_scope_reference (
      scope_url, service_name, google_tier, admin_score, admin_color, rationale, threat_impact
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  let newAppsCount = 0;
  let updatedAppsCount = 0;
  let totalScopesInserted = 0;
  let newScopeRefsCount = 0;

  const typeBreakdown = {};
  const ownershipBreakdown = {};
  const riskBreakdown = {};

  db.exec('BEGIN TRANSACTION');

  for (const [id, item] of groupedApps) {
    const isGoogle = item.ownership.toLowerCase() === 'google owned';
    const enriched = enrichApplicationRecord({
      displayName: item.appName,
      name: item.appName,
      isVerified: item.isVerified,
      appType: item.clientType
    });

    const vendor = isGoogle ? 'Google LLC' : (enriched.vendor || item.appName || 'Third-Party Developer');
    const category = isGoogle ? 'Productivity & Collaboration' : (enriched.category || 'Configured SaaS');
    const appType = enriched.appType || item.clientType || 'Web Application';
    const projectNumber = getProjectNumber(id);
    const publisherDomain = enriched.publisherDomain || '';
    const breaches = enriched.breaches || [];

    // Resolve all scope metadata
    const resolvedScopes = Array.from(item.scopesSet).map(s => {
      let serviceHint = null;
      for (const [srv, setOfS] of Object.entries(item.serviceScopesMap)) {
        if (setOfS.has(s)) {
          serviceHint = srv;
          break;
        }
      }
      const meta = resolveScopeMetadata(s, serviceHint, scopeRefMap);
      return meta;
    });

    // Inherent Risk Scoring (Layer 2)
    const isVerifiedEffective = item.isVerified || enriched.isVerified;
    const risk = calculateApplicationRisk(resolvedScopes, {
      isVerified: isVerifiedEffective,
      breaches,
      appType
    });

    // Track statistics
    typeBreakdown[item.clientType] = (typeBreakdown[item.clientType] || 0) + 1;
    ownershipBreakdown[item.ownership] = (ownershipBreakdown[item.ownership] || 0) + 1;
    riskBreakdown[risk.riskLevel] = (riskBreakdown[risk.riskLevel] || 0) + 1;

    // Check if app exists in DB
    const existing = checkAppStmt.get(id);

    if (existing) {
      // Update existing record without overwriting admin policies or custom metadata
      updateAppStmt.run(
        isVerifiedEffective ? 1 : 0,
        risk.riskScore,
        risk.riskLevel,
        risk.riskScoreColor,
        risk.scopeRiskScore,
        risk.verificationPenalty,
        risk.breachPenalty,
        risk.breachBracket,
        JSON.stringify(breaches),
        risk.peakScopeScore,
        risk.breadthScore,
        risk.avgScopeScore,
        JSON.stringify(risk.riskReasons),
        id
      );
      updatedAppsCount++;
    } else {
      // Insert new application
      const iconUrl = enriched.iconUrl || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(item.appName) + '&background=3B82F6&color=fff&size=128&rounded=true');
      insertAppStmt.run(
        id,
        item.appName,
        vendor,
        publisherDomain,
        category,
        isVerifiedEffective ? 1 : 0,
        iconUrl,
        enriched.storeUrl || null,
        risk.riskLevel,
        risk.riskScore,
        risk.riskScoreColor,
        risk.scopeRiskScore,
        risk.verificationPenalty,
        risk.breachPenalty,
        risk.breachBracket,
        JSON.stringify(breaches),
        risk.peakScopeScore,
        risk.breadthScore,
        risk.avgScopeScore,
        JSON.stringify(risk.riskReasons),
        'UNCONFIGURED',
        isGoogle ? 1 : 0,
        appType,
        0,
        0,
        null,
        null
      );
      newAppsCount++;
    }

    // Ensure Client ID is linked
    insertClientIdStmt.run(id, id, projectNumber);

    // Ensure all scopes and references are recorded
    for (const scp of resolvedScopes) {
      insertScopeStmt.run(
        id,
        scp.scope_url,
        scp.risk_level,
        scp.admin_score,
        scp.admin_color,
        scp.rationale
      );
      totalScopesInserted++;

      // Enrich oauth_scope_reference if new
      try {
        const changesBefore = db.prepare('SELECT count(*) as c FROM oauth_scope_reference').get().c;
        insertScopeRefStmt.run(
          scp.scope_url,
          scp.service_name,
          scp.google_tier,
          scp.admin_score,
          scp.admin_color,
          scp.rationale,
          scp.threat_impact
        );
        const changesAfter = db.prepare('SELECT count(*) as c FROM oauth_scope_reference').get().c;
        if (changesAfter > changesBefore) newScopeRefsCount++;
      } catch (err) {
        // Ignore duplicate insert errors
      }
    }
  }

  db.exec('COMMIT');

  console.log(`✓ Database ingestion complete:`);
  console.log(`  - New applications added: ${newAppsCount}`);
  console.log(`  - Existing applications updated: ${updatedAppsCount}`);
  console.log(`  - Total scopes processed/linked: ${totalScopesInserted}`);
  console.log(`  - New scope references added: ${newScopeRefsCount}`);

  // [3] Synchronize applications_catalog.json for UI / APIs
  console.log('[3] Synchronizing standardized JSON catalog files...');
  let catalogApps = [];
  const primaryCatalogPath = CATALOG_PATHS[0];
  if (fs.existsSync(primaryCatalogPath)) {
    catalogApps = JSON.parse(fs.readFileSync(primaryCatalogPath, 'utf8'));
  }

  const catalogMap = new Map();
  for (const app of catalogApps) {
    catalogMap.set(app.id, app);
  }

  for (const [id, item] of groupedApps) {
    const isGoogle = item.ownership.toLowerCase() === 'google owned';
    const enriched = enrichApplicationRecord({
      displayName: item.appName,
      name: item.appName,
      isVerified: item.isVerified,
      appType: item.clientType
    });

    const vendor = isGoogle ? 'Google LLC' : (enriched.vendor || item.appName || 'Third-Party Developer');
    const category = isGoogle ? 'Productivity & Collaboration' : (enriched.category || 'Configured SaaS');
    const appType = enriched.appType || item.clientType || 'Web Application';
    const projectNumber = getProjectNumber(id);
    const breaches = enriched.breaches || [];

    const resolvedScopes = Array.from(item.scopesSet).map(s => {
      let serviceHint = null;
      for (const [srv, setOfS] of Object.entries(item.serviceScopesMap)) {
        if (setOfS.has(s)) {
          serviceHint = srv;
          break;
        }
      }
      return resolveScopeMetadata(s, serviceHint, scopeRefMap);
    });

    const isVerifiedEffective = item.isVerified || enriched.isVerified;
    const risk = calculateApplicationRisk(resolvedScopes, {
      isVerified: isVerifiedEffective,
      breaches,
      appType
    });

    if (catalogMap.has(id)) {
      const existing = catalogMap.get(id);
      existing.isVerified = existing.isVerified || isVerifiedEffective;
      existing.vendor = existing.vendor || vendor;
      existing.breaches = breaches;
      existing.breachPenalty = risk.breachPenalty;
      existing.breachBracket = risk.breachBracket;
      existing.verificationPenalty = risk.verificationPenalty;
      existing.scopeRiskScore = risk.scopeRiskScore;

      if (resolvedScopes.length > (existing.scopes?.length || 0)) {
        existing.scopes = resolvedScopes.map(s => ({
          scope: s.scope_url,
          riskLevel: s.risk_level,
          description: s.rationale,
          threatImpact: s.threat_impact,
          adminScore: s.admin_score,
          adminColor: s.admin_color,
          googleTier: s.google_tier,
          service: s.service_name
        }));
        existing.scopesCount = existing.scopes.length;
        existing.riskScore = risk.riskScore;
        existing.peakScopeScore = risk.peakScopeScore;
        existing.breadthScore = risk.breadthScore;
        existing.avgScopeScore = risk.avgScopeScore;
        existing.riskLevel = risk.riskLevel;
        existing.riskScoreColor = risk.riskScoreColor;
        existing.riskReasons = risk.riskReasons;
      }
    } else {
      const newEntry = {
        id,
        clientId: id,
        familyId: projectNumber ? `gcp_proj_${projectNumber}` : `app_family_${id}`,
        familyName: item.appName,
        displayName: item.appName,
        publisherDomain: enriched.publisherDomain || '',
        category,
        appType,
        deploymentType: item.clientType,
        compliance: enriched.compliance || ['Standard SaaS'],
        dataHosting: enriched.dataHosting || 'USA',
        breachHistory: enriched.breachHistory || null,
        breaches,
        isVerified: isVerifiedEffective,
        iconUrl: enriched.iconUrl || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(item.appName) + '&background=3B82F6&color=fff&size=128&rounded=true'),
        storeUrl: enriched.storeUrl || null,
        description: enriched.description || `Imported from Google Workspace Master Apps Catalog (${item.ownership}).`,
        riskScore: risk.riskScore,
        scopeRiskScore: risk.scopeRiskScore,
        verificationPenalty: risk.verificationPenalty,
        breachPenalty: risk.breachPenalty,
        breachBracket: risk.breachBracket,
        peakScopeScore: risk.peakScopeScore,
        breadthScore: risk.breadthScore,
        avgScopeScore: risk.avgScopeScore,
        riskLevel: risk.riskLevel,
        riskScoreColor: risk.riskScoreColor,
        rawMaxRisk: risk.riskLevel,
        riskReasons: risk.riskReasons,
        adminAccessLevel: 'UNCONFIGURED',
        accessPolicy: null,
        multiClientMapped: false,
        familyDeploymentsCount: 1,
        siblingDeployments: [],
        clientIdsCount: 1,
        clientIds: [id],
        projectNumbers: projectNumber ? [projectNumber] : [],
        totalUsersCount: 0,
        adminUsersCount: 0,
        scopesCount: resolvedScopes.length,
        scopes: resolvedScopes.map(s => ({
          scope: s.scope_url,
          riskLevel: s.risk_level,
          description: s.rationale,
          threatImpact: s.threat_impact,
          adminScore: s.admin_score,
          adminColor: s.admin_color,
          googleTier: s.google_tier,
          service: s.service_name
        })),
        servicesTouched: Array.from(item.servicesSet),
        users: [],
        firstSeen: null,
        lastActive: null,
        lastActiveFormatted: 'N/A',
        isStale: true,
        isNew: true,
        totalActivityEvents: 0,
        isGoogleService: isGoogle,
        vendor
      };
      catalogMap.set(id, newEntry);
    }
  }

  const updatedCatalogList = Array.from(catalogMap.values());
  for (const catPath of CATALOG_PATHS) {
    if (fs.existsSync(path.dirname(catPath))) {
      fs.writeFileSync(catPath, JSON.stringify(updatedCatalogList, null, 2), 'utf8');
      console.log(`✓ Updated catalog file: ${catPath} (${updatedCatalogList.length} applications)`);
    }
  }

  const report = {
    totalRowsRead,
    skippedInternalCount,
    deduplicatedCount,
    totalUniqueApps: groupedApps.size,
    newAppsCount,
    updatedAppsCount,
    totalScopesInserted,
    newScopeRefsAdded: newScopeRefsCount,
    totalDatabaseAppsNow: db.prepare('SELECT count(*) as c FROM applications').get().c,
    typeBreakdown,
    ownershipBreakdown,
    riskBreakdown
  };

  return report;
}

if (process.argv[1]?.endsWith('ingest_master_apps.mjs')) {
  const report = ingestMasterApps();
  console.log('\n========================================');
  console.log('       INGESTION EXECUTION REPORT       ');
  console.log('========================================');
  console.log(JSON.stringify(report, null, 2));
}
