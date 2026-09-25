import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { OAUTH_SCOPES_DATA } from './seed_scope_reference.mjs';
import { 
  enrichApplicationRecord, 
  calculateInherentRisk 
} from './app_enrichment_service.mjs';

const CSV_FILE = path.resolve('master_apps.csv');
const DB_FILE = path.resolve('adminlens.db');
const MASTER_CATALOG_JSON = path.resolve('mosaic-next/data/master_applications_catalog.json');

console.log('=== ADMINLENS BACKEND MASTER APPLICATION REPOSITORY INGESTION ===\n');

if (!fs.existsSync(CSV_FILE)) {
  console.error(`Error: CSV file not found at ${CSV_FILE}`);
  process.exit(1);
}

// 1. Robust CSV Parsing
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let inQuotes = false;
  let currentVal = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      currentVal += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentVal.trim());
      if (currentRow.length > 1 || currentRow[0] !== '') {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    rows.push(currentRow);
  }
  return rows;
}

function parseRequestedServicesWithScopes(rawStr) {
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

function parseServicesList(rawStr) {
  if (!rawStr) return [];
  let clean = rawStr.trim();
  if (clean.startsWith('[') && clean.endsWith(']')) {
    clean = clean.slice(1, -1);
  }
  return clean.split(',').map(s => s.trim()).filter(Boolean);
}

function checkIsVerified(status) {
  if (!status) return false;
  const s = status.trim().toLowerCase();
  return s === 'verified' || (s.includes('verified') && !s.includes('not verified') && !s.includes('unverified'));
}

function getProjectNumber(clientId) {
  if (!clientId) return null;
  const match = clientId.match(/^(\d+)-/);
  return match ? match[1] : null;
}

function normalizeType(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('android')) return 'Android';
  if (t.includes('ios') || t.includes('apple')) return 'iOS';
  if (t.includes('web') || t.includes('chrome') || t.includes('cloud') || t.includes('saas')) return 'Web Application';
  return 'Unknown Application Type';
}

function normalizeOwnership(own) {
  const o = (own || '').toLowerCase();
  if (o.includes('google')) return 'Google owned';
  if (o.includes('third')) return 'Third party';
  return 'Unknown';
}

function buildScopeReferenceMap(db) {
  const map = new Map();
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
    // Ignore if table not yet initialized
  }

  return map;
}

function resolveScopeMetadata(scopeUrl, serviceNameHint, scopeRefMap) {
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

// 2. Read and Parse master_apps.csv
console.log('Reading master_apps.csv...');
const csvText = fs.readFileSync(CSV_FILE, 'utf-8');
const rows = parseCSV(csvText);
console.log(`Parsed ${rows.length} total rows (including header).`);

// Row index 0 is header:
// App Name, Type, Id, Verification Status, Requested Services, Requested Services with Scopes, Ownership
const rawAppsMap = new Map();
let internalSkipped = 0;

for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  const appName = (r[0] || '').trim();
  const rawType = (r[1] || '').trim();
  const id = (r[2] || '').trim();
  const verificationStr = (r[3] || '').trim();
  const rawReqServices = (r[4] || '').trim();
  const rawReqServicesWithScopes = (r[5] || '').trim();
  const rawOwnership = (r[6] || '').trim();

  if (!id) continue;

  if (rawOwnership.toLowerCase() === 'internal') {
    internalSkipped++;
    continue;
  }

  const isVerified = checkIsVerified(verificationStr);
  const type = normalizeType(rawType);
  const ownership = normalizeOwnership(rawOwnership);
  const { services: servicesWithScopes, scopes } = parseRequestedServicesWithScopes(rawReqServicesWithScopes);
  const servicesList = parseServicesList(rawReqServices);

  if (rawAppsMap.has(id)) {
    const existing = rawAppsMap.get(id);
    if (isVerified) existing.isVerified = true;
    if (appName.length > existing.appName.length && !existing.appName.includes(appName)) {
      existing.appName = appName;
    }
    if (existing.type === 'Unknown Application Type' && type !== 'Unknown Application Type') {
      existing.type = type;
    }
    scopes.forEach(s => existing.scopesSet.add(s));
    servicesList.forEach(s => existing.servicesSet.add(s));
    for (const [srv, scps] of Object.entries(servicesWithScopes)) {
      existing.servicesSet.add(srv);
      if (!existing.serviceScopesMap[srv]) existing.serviceScopesMap[srv] = new Set();
      scps.forEach(s => existing.serviceScopesMap[srv].add(s));
    }
  } else {
    const scopesSet = new Set(scopes);
    const servicesSet = new Set(servicesList);
    const serviceScopesMap = {};
    for (const [srv, scps] of Object.entries(servicesWithScopes)) {
      servicesSet.add(srv);
      serviceScopesMap[srv] = new Set(scps);
    }

    rawAppsMap.set(id, {
      id,
      appName: appName || id,
      type,
      ownership,
      isVerified,
      scopesSet,
      servicesSet,
      serviceScopesMap
    });
  }
}

console.log(`Unique applications after ID deduplication: ${rawAppsMap.size}`);
console.log(`Skipped internal apps: ${internalSkipped}`);

// 3. Connect to SQLite database for scope reference and master table sync
const db = new DatabaseSync(DB_FILE);
const scopeRefMap = buildScopeReferenceMap(db);

// 4. Form Product Families (Group by Project Number or App Name)
console.log('Grouping applications into Product Families...');
const familyMap = new Map(); // familyKey -> array of app items

for (const [id, item] of rawAppsMap.entries()) {
  const projectNumber = getProjectNumber(id);
  // Normalize app name for family grouping (remove "(Android)", "(iOS)", trailing qualifiers)
  const cleanName = item.appName
    .replace(/\s*\((Android|iOS|Web Application|Chrome Extension|Add-on)\)/gi, '')
    .trim();

  let familyKey;
  if (projectNumber) {
    familyKey = `proj_${projectNumber}`;
  } else if (cleanName) {
    familyKey = `name_${cleanName.toLowerCase()}`;
  } else {
    familyKey = `app_${id}`;
  }

  if (!familyMap.has(familyKey)) {
    familyMap.set(familyKey, {
      familyId: familyKey,
      familyName: cleanName || item.appName,
      items: []
    });
  }
  familyMap.get(familyKey).items.push(item);
}

console.log(`Total Product Families formed: ${familyMap.size}`);

// 5. Build Final Standardized Application Objects for Master Catalog
const masterCatalog = [];
const dbApps = [];
const dbScopesToInsert = [];

for (const [familyKey, family] of familyMap.entries()) {
  const items = family.items;

  // Determine primary application in family:
  // Preference order: Web Application > iOS > Android > other
  // Within same type, prefer Verified, then highest scope count
  const sortedItems = [...items].sort((a, b) => {
    const typeRank = (t) => t === 'Web Application' ? 3 : (t === 'iOS' ? 2 : (t === 'Android' ? 1 : 0));
    const rankDiff = typeRank(b.type) - typeRank(a.type);
    if (rankDiff !== 0) return rankDiff;
    if (b.isVerified !== a.isVerified) return b.isVerified ? 1 : -1;
    return b.scopesSet.size - a.scopesSet.size;
  });

  const primaryItem = sortedItems[0];
  const siblingItems = sortedItems.slice(1);

  // Process all items in this family to compute their individual metadata & risk
  const processedFamilyItems = sortedItems.map(item => {
    const isGoogle = item.ownership.toLowerCase() === 'google owned';
    const enriched = enrichApplicationRecord({
      displayName: item.appName,
      name: item.appName,
      isVerified: item.isVerified,
      appType: item.type
    });

    const vendor = isGoogle ? 'Google LLC' : (enriched.vendor || item.appName || 'Third-Party Developer');
    const category = isGoogle ? 'Productivity & Collaboration' : (enriched.category || 'Configured SaaS');
    const appType = enriched.appType || item.type || 'Web Application';
    const projectNumber = getProjectNumber(item.id);
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
    const risk = calculateInherentRisk({
      scopesList: resolvedScopes,
      isVerified: isVerifiedEffective,
      breaches,
      appType,
      referenceDate: new Date('2026-09-25T12:00:00Z')
    });

    return {
      rawItem: item,
      id: item.id,
      displayName: item.appName,
      vendor,
      publisherDomain: enriched.publisherDomain || '',
      category,
      appType,
      deploymentType: item.type,
      compliance: enriched.compliance || ['Standard Terms'],
      dataHosting: enriched.dataHosting || 'USA',
      breachHistory: enriched.breachHistory || null,
      breaches,
      isVerified: isVerifiedEffective,
      iconUrl: enriched.iconUrl || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(item.appName) + '&background=10B981&color=fff&size=128&rounded=true'),
      storeUrl: enriched.storeUrl || null,
      description: enriched.description || `Global catalog master application entry (${item.ownership}).`,
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
      isGoogleService: isGoogle,
      ownership: item.ownership,
      projectNumber,
      resolvedScopes,
      servicesTouched: Array.from(item.servicesSet)
    };
  });

  const primaryProcessed = processedFamilyItems[0];
  const siblingDeployments = processedFamilyItems.slice(1).map(p => ({
    id: p.id,
    displayName: p.displayName,
    deploymentType: p.deploymentType,
    appType: p.appType,
    isVerified: p.isVerified,
    riskLevel: p.riskLevel,
    riskScore: p.riskScore,
    scopesCount: p.resolvedScopes.length,
    iconUrl: p.iconUrl,
    vendor: p.vendor,
    category: p.category,
    scopes: p.resolvedScopes.map(s => ({
      scope: s.scope_url,
      riskLevel: s.risk_level,
      description: s.rationale,
      threatImpact: s.threat_impact,
      adminScore: s.admin_score,
      adminColor: s.admin_color,
      googleTier: s.google_tier,
      service: s.service_name
    }))
  }));

  const allPlatformTypes = Array.from(new Set(processedFamilyItems.map(p => p.appType)));
  const clientIdsArr = processedFamilyItems.map(p => p.id);
  const projectNumbersArr = Array.from(new Set(processedFamilyItems.map(p => p.projectNumber).filter(Boolean)));

  const masterAppEntry = {
    id: primaryProcessed.id,
    clientId: primaryProcessed.id,
    familyId: familyKey,
    familyName: family.familyName,
    displayName: primaryProcessed.displayName,
    vendor: primaryProcessed.vendor,
    publisherDomain: primaryProcessed.publisherDomain,
    category: primaryProcessed.category,
    appType: primaryProcessed.appType,
    deploymentType: primaryProcessed.deploymentType,
    compliance: primaryProcessed.compliance,
    dataHosting: primaryProcessed.dataHosting,
    breachHistory: primaryProcessed.breachHistory,
    breaches: primaryProcessed.breaches,
    breachPenalty: primaryProcessed.breachPenalty,
    breachBracket: primaryProcessed.breachBracket,
    verificationPenalty: primaryProcessed.verificationPenalty,
    scopeRiskScore: primaryProcessed.scopeRiskScore,
    isVerified: primaryProcessed.isVerified,
    iconUrl: primaryProcessed.iconUrl,
    storeUrl: primaryProcessed.storeUrl,
    description: primaryProcessed.description,
    riskScore: primaryProcessed.riskScore,
    peakScopeScore: primaryProcessed.peakScopeScore,
    breadthScore: primaryProcessed.breadthScore,
    avgScopeScore: primaryProcessed.avgScopeScore,
    riskLevel: primaryProcessed.riskLevel,
    riskScoreColor: primaryProcessed.riskScoreColor,
    rawMaxRisk: primaryProcessed.rawMaxRisk,
    riskReasons: primaryProcessed.riskReasons,
    adminAccessLevel: 'UNCONFIGURED',
    accessPolicy: null,
    multiClientMapped: siblingDeployments.length > 0,
    familyDeploymentsCount: processedFamilyItems.length,
    siblingDeployments: siblingDeployments,
    allPlatformTypes: allPlatformTypes,
    clientIdsCount: clientIdsArr.length,
    clientIds: clientIdsArr,
    projectNumbers: projectNumbersArr,
    totalUsersCount: 0,
    adminUsersCount: 0,
    scopesCount: primaryProcessed.resolvedScopes.length,
    scopes: primaryProcessed.resolvedScopes.map(s => ({
      scope: s.scope_url,
      riskLevel: s.risk_level,
      description: s.rationale,
      threatImpact: s.threat_impact,
      adminScore: s.admin_score,
      adminColor: s.admin_color,
      googleTier: s.google_tier,
      service: s.service_name
    })),
    servicesTouched: primaryProcessed.servicesTouched,
    users: [],
    firstSeen: null,
    lastActive: null,
    lastActiveFormatted: 'N/A',
    isStale: true,
    isNew: false,
    totalActivityEvents: 0,
    isGoogleService: primaryProcessed.isGoogleService,
    ownership: primaryProcessed.ownership
  };

  masterCatalog.push(masterAppEntry);

  // Prepare SQLite rows for every processed application (both primary and siblings)
  for (const p of processedFamilyItems) {
    dbApps.push(p);
    for (const scp of p.resolvedScopes) {
      dbScopesToInsert.push({
        appId: p.id,
        scopeUrl: scp.scope_url,
        riskLevel: scp.risk_level,
        adminScore: scp.admin_score,
        adminColor: scp.admin_color,
        description: scp.rationale
      });
    }
  }
}

console.log(`\nGenerated ${masterCatalog.length} master family entries for Master Application Repository.`);
console.log(`Total underlying application client deployments: ${dbApps.length}`);

// 6. Write strictly to mosaic-next/data/master_applications_catalog.json
console.log(`Writing to ${MASTER_CATALOG_JSON}...`);
fs.writeFileSync(MASTER_CATALOG_JSON, JSON.stringify(masterCatalog, null, 2), 'utf-8');
console.log('✓ Master applications catalog JSON written successfully.');

// 7. Update SQLite adminlens.db applications table with master records
console.log('Updating SQLite adminlens.db master applications...');
db.exec('BEGIN TRANSACTION');

const insertOrReplaceAppStmt = db.prepare(`
  INSERT INTO applications (
    id, display_name, vendor, publisher_domain, category, is_verified,
    icon_url, store_url, risk_level, risk_score, risk_score_color,
    peak_scope_score, breadth_score, avg_scope_score, risk_reasons,
    admin_access_level, total_users_count, admin_users_count,
    is_google_service, app_type, ownership, breach_penalty,
    breach_bracket, verification_penalty, breaches_json, scope_risk_score,
    created_at, updated_at
  ) VALUES (
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?,
    ?, ?, ?, ?,
    'UNCONFIGURED', 0, 0,
    ?, ?, ?, ?,
    ?, ?, ?, ?,
    datetime('now'), datetime('now')
  )
  ON CONFLICT(id) DO UPDATE SET
    display_name = excluded.display_name,
    vendor = excluded.vendor,
    publisher_domain = excluded.publisher_domain,
    category = excluded.category,
    is_verified = excluded.is_verified,
    icon_url = excluded.icon_url,
    risk_level = excluded.risk_level,
    risk_score = excluded.risk_score,
    risk_score_color = excluded.risk_score_color,
    peak_scope_score = excluded.peak_scope_score,
    breadth_score = excluded.breadth_score,
    avg_scope_score = excluded.avg_scope_score,
    risk_reasons = excluded.risk_reasons,
    is_google_service = excluded.is_google_service,
    app_type = excluded.app_type,
    ownership = excluded.ownership,
    breach_penalty = excluded.breach_penalty,
    breach_bracket = excluded.breach_bracket,
    verification_penalty = excluded.verification_penalty,
    breaches_json = excluded.breaches_json,
    scope_risk_score = excluded.scope_risk_score,
    total_users_count = 0,
    admin_users_count = 0,
    updated_at = datetime('now')
`);

for (const a of dbApps) {
  insertOrReplaceAppStmt.run(
    a.id,
    a.displayName,
    a.vendor,
    a.publisherDomain,
    a.category,
    a.isVerified ? 1 : 0,
    a.iconUrl,
    a.storeUrl,
    a.riskLevel,
    a.riskScore,
    a.riskScoreColor,
    a.peakScopeScore,
    a.breadthScore,
    a.avgScopeScore,
    JSON.stringify(a.riskReasons),
    a.isGoogleService ? 1 : 0,
    a.appType,
    a.ownership,
    a.breachPenalty,
    a.breachBracket,
    a.verificationPenalty,
    JSON.stringify(a.breaches),
    a.scopeRiskScore
  );
}

const insertScopeStmt = db.prepare(`
  INSERT OR IGNORE INTO application_scopes (application_id, scope_url, risk_level, admin_score, admin_color, description)
  VALUES (?, ?, ?, ?, ?, ?)
`);

for (const s of dbScopesToInsert) {
  insertScopeStmt.run(
    s.appId,
    s.scopeUrl,
    s.riskLevel,
    s.adminScore,
    s.adminColor,
    s.description
  );
}

// Guarantee 0 client users and 0 grants in adminlens.db (strict client isolation)
db.exec('DELETE FROM users');
db.exec('DELETE FROM grants');

db.exec('COMMIT');

console.log('✓ SQLite database transaction committed successfully.');

// 8. Verification checks
const finalDbAppCount = db.prepare('SELECT count(*) as c FROM applications').get().c;
const finalDbUsersCount = db.prepare('SELECT count(*) as c FROM users').get().c;
const clientCatalogPath = path.resolve('mosaic-next/data/applications_catalog.json');
const clientCatalogCount = fs.existsSync(clientCatalogPath) ? JSON.parse(fs.readFileSync(clientCatalogPath, 'utf8')).length : 0;

console.log('\n================ INGESTION SUMMARY ================');
console.log(`Master Catalog JSON Entries:   ${masterCatalog.length}`);
console.log(`Total DB Applications:         ${finalDbAppCount}`);
console.log(`Total DB Users (Client):       ${finalDbUsersCount} (Must be 0)`);
console.log(`Client Catalog App Count:      ${clientCatalogCount} (Untouched)`);
console.log('===================================================\n');
