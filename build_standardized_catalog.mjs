import fs from 'fs';
import path from 'path';
import { lookupChromeExtension } from './chrome_webstore_search.mjs';
import { 
  enrichApplicationRecord, 
  calculateInherentRisk, 
  calculateBreachPenalty 
} from './app_enrichment_service.mjs';
import { OAUTH_SCOPES_DATA } from './seed_scope_reference.mjs';

// Build OAuth Scope Reference lookup map
const SCOPE_REFERENCE_MAP = new Map();
for (const s of OAUTH_SCOPES_DATA) {
  SCOPE_REFERENCE_MAP.set(s.scope_url, s);
}

const activeTokens = JSON.parse(fs.readFileSync('./extracted_data/active_tokens.json', 'utf8'));
const auditEvents = JSON.parse(fs.readFileSync('./extracted_data/token_audit_events.json', 'utf8'));
const adminAuditEvents = fs.existsSync('./extracted_data/admin_audit_events.json')
  ? JSON.parse(fs.readFileSync('./extracted_data/admin_audit_events.json', 'utf8'))
  : [];
const users = JSON.parse(fs.readFileSync('./extracted_data/users.json', 'utf8'));

// Build user lookup map for fast details
const userMap = new Map();
for (const u of users) {
  userMap.set(u.primaryEmail, {
    id: u.id,
    email: u.primaryEmail,
    name: u.name?.fullName || u.primaryEmail,
    orgUnit: u.orgUnitPath,
    isAdmin: Boolean(u.isAdmin || u.isDelegatedAdmin),
  });
}

function getProjectNumber(clientId) {
  if (!clientId) return 'unknown';
  const match = clientId.match(/^(\d+)-/);
  return match ? match[1] : clientId;
}

function detectServiceBucket(scope) {
  const s = scope.toLowerCase();
  if (s.includes('mail.google.com') || s.includes('gmail') || s.includes('script.send_mail')) return 'Gmail';
  if (s.includes('drive')) return 'Google Drive';
  if (s.includes('admin.') || s.includes('directory.')) return 'Admin SDK';
  if (s.includes('calendar')) return 'Calendar';
  if (s.includes('classroom')) return 'Classroom';
  if (s.includes('spreadsheets')) return 'Spreadsheets';
  if (s.includes('contacts') || s.includes('carddav')) return 'Contacts';
  return null;
}

function checkIsVerified(status) {
  if (!status) return false;
  const s = status.trim().toLowerCase();
  return s === 'verified' || (s.includes('verified') && !s.includes('not verified') && !s.includes('unverified'));
}

function assessScopeRisk(scope) {
  const s = scope.toLowerCase();
  if (s.includes('admin.') || s.includes('mail.google.com') || s.includes('script.send_mail')) {
    return { level: 'CRITICAL', reason: 'Administrative or Direct Mail Access' };
  }
  if (s.includes('drive') && !s.includes('readonly') && !s.includes('file')) {
    return { level: 'HIGH', reason: 'Full Google Drive Read/Write Access' };
  }
  if (s.includes('directory') || s.includes('calendar') || s.includes('contacts') || s.includes('spreadsheets') || s.includes('carddav')) {
    return { level: 'MEDIUM', reason: 'Access to Domain Directory, Files, or Calendars' };
  }
  return { level: 'LOW', reason: 'Basic Authentication / Profile Scopes' };
}

function isDescriptiveAppName(name) {
  if (!name || typeof name !== 'string') return false;
  const t = name.trim();
  if (!t) return false;
  if (t.includes('.apps.googleusercontent.com')) return false;
  if (/^\d{6,}-[a-z0-9_]+/.test(t)) return false;
  if (t === 'Unnamed App' || t === 'Accessed Third-Party App' || t === 'Configured Third-Party App' || t === 'Third-Party Software') return false;
  return true;
}

// -------------------------------------------------------------
// Pre-scan all CSV uploads/baselines to build Client ID -> Metadata lookup
// If an application name is present in CSV uploads and the IDs match,
// the CSV name MUST override what is pulled from the Google API.
// -------------------------------------------------------------
const parseCsvLines = (csvPath) => {
  if (!csvPath || !fs.existsSync(csvPath)) return [];
  const owlText = fs.readFileSync(csvPath, 'utf8');
  const lines = owlText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const parseLine = (line) => {
    const res = [];
    let cur = '';
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (q && line[i+1] === '"') { cur += '"'; i++; }
        else { q = !q; }
      } else if (c === ',' && !q) {
        res.push(cur);
        cur = '';
      } else {
        cur += c;
      }
    }
    res.push(cur);
    return res;
  };

  const headers = parseLine(lines[0]).map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = parseLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => row[h] = vals[idx] ? vals[idx].trim() : '');
    rows.push(row);
  }
  return rows;
};

const accessedCsvPath = fs.existsSync('./owl_apps_accessed_apps.csv') 
  ? './owl_apps_accessed_apps.csv' 
  : (fs.existsSync('./gafe_co_za_owl_apps_accessed.csv') ? './gafe_co_za_owl_apps_accessed.csv' : null);
const configuredCsvPath = fs.existsSync('./owl_apps_configured_apps.csv') 
  ? './owl_apps_configured_apps.csv' 
  : (fs.existsSync('./gafe_co_za_owl_apps_configured.csv') 
    ? './gafe_co_za_owl_apps_configured.csv' 
    : (fs.existsSync('./owl_apps.csv') ? './owl_apps.csv' : null));
const masterCsvPath = fs.existsSync('./master_apps2.csv')
  ? './master_apps2.csv'
  : (fs.existsSync('./master_apps.csv') ? './master_apps.csv' : null);

const csvAppMap = new Map();
for (const csvFile of [masterCsvPath, configuredCsvPath, accessedCsvPath].filter(Boolean)) {
  const rows = parseCsvLines(csvFile);
  for (const r of rows) {
    const cid = r['Id'] || r['id'] || r['Client ID'] || r['clientId'];
    const name = r['App Name'] || r['appName'] || r['Name'] || r['name'];
    if (cid && isDescriptiveAppName(name)) {
      csvAppMap.set(cid.trim(), {
        appName: name.trim(),
        rawType: r['Type'] || r['type'] || 'Web Application',
        verificationStatus: r['Verification Status'] || r['verificationStatus'],
        ownership: r['Ownership'] || r['ownership'],
        sourceCsv: path.basename(csvFile)
      });
    }
  }
}

// -------------------------------------------------------------
// Aggregation Map: Keyed by DISTINCT DEPLOYMENT (clientId)
// -------------------------------------------------------------
const catalog = new Map();

function getOrCreateDeploymentRecord(appName, clientId, owlType = null, verifiedStatus = null) {
  const deploymentKey = clientId || appName || 'unknown-deployment';
  const projNum = getProjectNumber(clientId);
  const dummyApp = { displayName: appName, clientIds: [clientId] };
  const enriched = enrichApplicationRecord(dummyApp);

  // 1. Resolve Canonical Product Family
  let familyId = 'unclassified';
  let familyName = appName || enriched.vendor || 'Third-Party Software';

  if (projNum === '779010036194' || (appName && appName.toLowerCase().includes('canva'))) {
    familyId = 'canva';
    familyName = 'Canva';
  } else if (projNum === '243341882805' || (appName && appName.toLowerCase().includes('orbit'))) {
    familyId = 'texthelp-orbitnote';
    familyName = 'OrbitNote';
  } else if (['72867247940', '65294736900', '307432799489', '585538275436', '458969862783', '297408095146', '521549528509'].includes(projNum) || (appName && appName.toLowerCase().includes('gam'))) {
    familyId = 'gam';
    familyName = 'GAM (Google Apps Manager)';
  } else if (projNum === '58172892053' || (appName && (appName.toLowerCase().includes('quizizz') || appName.toLowerCase().includes('wayground')))) {
    familyId = 'quizizz';
    familyName = 'Quizizz / Wayground';
  } else if (projNum === '438402517869' || (appName && appName.toLowerCase().includes('mylogin'))) {
    familyId = 'wonde-mylogin';
    familyName = 'Wonde MyLogin';
  } else if (projNum === '224054973946' || (appName && (appName.toLowerCase().includes('mailsuite') || appName.toLowerCase().includes('mailtrack')))) {
    familyId = 'mailsuite';
    familyName = 'Mailsuite / Mailtrack';
  } else if (projNum === '821073268825' || (appName && appName.toLowerCase().includes('apple business'))) {
    familyId = 'apple-business-manager';
    familyName = 'Apple Business Manager';
  } else if (appName && (appName.toLowerCase().includes('wedo') || appName.toLowerCase().includes('spike') || appName.toLowerCase().includes('lego'))) {
    familyId = 'lego-education';
    familyName = 'LEGO Education';
  } else if (appName && appName.toLowerCase().includes('gemini')) {
    familyId = 'gemini-enterprise';
    familyName = 'Gemini Enterprise';
  } else if (appName && appName.toLowerCase().includes('devicepolicy')) {
    familyId = 'google-device-policy';
    familyName = 'Google Device Policy';
  } else if (enriched.vendor && enriched.vendor !== 'Third-Party Developer') {
    familyId = enriched.vendor.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    familyName = enriched.vendor;
  } else {
    familyId = projNum !== 'unknown' ? `gcp_proj_${projNum}` : (appName || 'unclassified');
    familyName = appName || 'Third-Party Tool';
  }

  // 2. Resolve Distinct Deployment Type
  let deploymentType = owlType || 'Web Application';
  const lowerName = (appName || '').toLowerCase();
  const lowerId = (clientId || '').toLowerCase();
  if (lowerName.includes('extension') || lowerName.includes('chrome') || (lowerId.length === 32 && !lowerId.includes('.'))) {
    deploymentType = 'Chrome Extension';
  } else if (lowerName.includes('android') || lowerId.includes('android') || lowerId.startsWith('com.') || lowerId.includes('enterprise.webapp')) {
    deploymentType = 'Android App';
  } else if (lowerName.includes('ios') || (lowerName.includes('apple') && lowerName.includes('app'))) {
    deploymentType = 'iOS App';
  } else if (lowerName.includes('demo') || lowerName.includes('test') || lowerName.includes('staging') || lowerName.includes('dev') || (!appName && verifiedStatus === 'Not verified')) {
    deploymentType = 'Staging / Dev';
  } else if (lowerName.includes('script') || lowerId.includes('project-') || lowerName.includes('untitled')) {
    deploymentType = 'Google Apps Script';
  }

  // 3. Format Distinct Display Title
  let variantTitle = appName;
  if (!variantTitle || variantTitle === 'Configured Third-Party App') {
    if (deploymentType === 'Staging / Dev') {
      variantTitle = `${familyName} (Staging / Dev)`;
    } else {
      const shortId = clientId ? clientId.slice(0, 8) : 'id';
      variantTitle = `${familyName} (${deploymentType} - ${shortId})`;
    }
  } else if (!variantTitle.toLowerCase().includes(deploymentType.toLowerCase()) && !variantTitle.includes('(')) {
    variantTitle = `${variantTitle} (${deploymentType})`;
  }

  if (!catalog.has(deploymentKey)) {
    catalog.set(deploymentKey, {
      id: deploymentKey,
      clientId: clientId,
      familyId: familyId,
      familyName: familyName,
      displayName: variantTitle,
      vendor: enriched.vendor,
      publisherDomain: enriched.publisherDomain || '',
      category: enriched.category || 'Unclassified SaaS',
      appType: deploymentType,
      deploymentType: deploymentType,
      compliance: enriched.compliance || ['Standard Terms'],
      dataHosting: enriched.dataHosting || 'USA',
      breachHistory: enriched.breachHistory || null,
      breaches: enriched.breaches || [],
      isVerified: Boolean(checkIsVerified(verifiedStatus) || (verifiedStatus === null && enriched.isVerified)),
      iconUrl: enriched.iconUrl,
      storeUrl: enriched.storeUrl || null,
      description: enriched.description || '',
      clientIds: new Set(clientId ? [clientId] : []),
      projectNumbers: new Set(projNum !== 'unknown' ? [projNum] : []),
      users: new Map(),
      scopes: new Map(),
      scopeMeta: new Map(),
      newlyRequestedScopes: new Set(),
      scopeExpansionHistory: [],
      servicesTouched: new Set(),
      maxRisk: 'LOW',
      riskReasons: new Set(),
      isNativeApp: deploymentType === 'Android App' || deploymentType === 'iOS App',
      isAnonymous: false,
      firstSeen: null,
      lastActive: null,
      totalActivityEvents: 0,
    });
  } else {
    // If the record exists, but was previously named with a raw client ID or placeholder,
    // and the incoming appName is descriptive (e.g. from CSV upload), override it!
    const existing = catalog.get(deploymentKey);
    const existingIsRaw = !existing.displayName || 
      existing.displayName.includes('.apps.googleusercontent.com') ||
      existing.displayName.startsWith('Accessed Third-Party') ||
      existing.displayName.startsWith('Configured Third-Party');

    const incomingIsBetter = isDescriptiveAppName(appName);

    if (incomingIsBetter && (existingIsRaw || (appName && appName !== existing.familyName))) {
      existing.displayName = variantTitle;
      existing.familyName = familyName;
      existing.familyId = familyId;
      existing.deploymentType = deploymentType;
      existing.appType = deploymentType;
      if (enriched.vendor && enriched.vendor !== 'Third-Party Developer') {
        existing.vendor = enriched.vendor;
      }
      if (enriched.category && enriched.category !== 'Unclassified SaaS') {
        existing.category = enriched.category;
      }
      if (enriched.iconUrl && !enriched.iconUrl.includes('ui-avatars')) {
        existing.iconUrl = enriched.iconUrl;
      }
      if (enriched.description) {
        existing.description = enriched.description;
      }
      if (enriched.publisherDomain) {
        existing.publisherDomain = enriched.publisherDomain;
      }
      if (enriched.compliance && enriched.compliance.length > 0) {
        existing.compliance = enriched.compliance;
      }
    }
  }

  const record = catalog.get(deploymentKey);
  if (clientId) record.clientIds.add(clientId);
  if (projNum !== 'unknown') record.projectNumbers.add(projNum);
  if (checkIsVerified(verifiedStatus)) {
    record.isVerified = true;
  }
  return record;
}

function addScopeToRecord(record, scopeUrl, source = 'ACTIVE_TOKEN', timestamp = null, actorEmail = null) {
  if (!scopeUrl || typeof scopeUrl !== 'string') return;
  const s = scopeUrl.trim();
  if (!s) return;

  const risk = assessScopeRisk(s);
  record.scopes.set(s, risk);
  record.riskReasons.add(risk.reason);

  const srv = detectServiceBucket(s);
  if (srv) record.servicesTouched.add(srv);

  const order = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  if (order[risk.level] > order[record.maxRisk]) {
    record.maxRisk = risk.level;
  }

  if (!record.scopeMeta.has(s)) {
    record.scopeMeta.set(s, {
      sources: new Set([source]),
      firstSeenAt: timestamp || null,
      lastAuthorizedAt: timestamp || null,
      authorizedBy: actorEmail || null,
    });
  } else {
    const meta = record.scopeMeta.get(s);
    meta.sources.add(source);
    if (timestamp) {
      if (!meta.firstSeenAt || timestamp < meta.firstSeenAt) meta.firstSeenAt = timestamp;
      if (!meta.lastAuthorizedAt || timestamp >= meta.lastAuthorizedAt) {
        meta.lastAuthorizedAt = timestamp;
        if (actorEmail) meta.authorizedBy = actorEmail;
      }
    }
  }
}

// 1. Ingest Active Tokens (Directory API)
for (const token of activeTokens) {
  // If the name is mentioned in the CSV uploads and the IDs match, the CSV name MUST override what is in the database from the API pull
  const csvMatch = csvAppMap.get(token.clientId);
  const effectiveName = (csvMatch && isDescriptiveAppName(csvMatch.appName))
    ? csvMatch.appName
    : token.displayText;
  const effectiveType = csvMatch?.rawType || null;
  const effectiveVerified = csvMatch?.verificationStatus || null;

  const record = getOrCreateDeploymentRecord(effectiveName, token.clientId, effectiveType, effectiveVerified);
  if (token.nativeApp) record.isNativeApp = true;
  if (token.anonymous) record.isAnonymous = true;

  const userDetail = userMap.get(token.userEmail) || {
    id: token.userId,
    email: token.userEmail,
    name: token.userEmail,
    orgUnit: token.userOrgUnit || '/',
    isAdmin: token.isUserAdmin || false,
  };

  if (!record.users.has(token.userEmail)) {
    record.users.set(token.userEmail, {
      ...userDetail,
      grantedScopes: new Set(token.scopes || []),
    });
  } else {
    const existing = record.users.get(token.userEmail);
    (token.scopes || []).forEach(s => existing.grantedScopes.add(s));
  }

  for (const s of (token.scopes || [])) {
    addScopeToRecord(record, s, 'ACTIVE_TOKEN', null, token.userEmail);
  }
}

// 2. Ingest Audit Activity & Scope Authorizations (Reports API: token & admin logs)
const chronologicalScopeEvents = [];

for (const event of auditEvents) {
  for (const e of (event.events || [])) {
    let cid = null;
    let appName = null;
    const eventScopes = new Set();

    for (const p of (e.parameters || [])) {
      if (p.name === 'client_id') cid = p.value;
      if (p.name === 'app_name') appName = p.value;
      if (p.name === 'scope') {
        if (Array.isArray(p.multiValue)) p.multiValue.forEach(s => eventScopes.add(s));
        else if (p.value) eventScopes.add(p.value);
      }
      if (p.name === 'scope_data' && Array.isArray(p.multiMessageValue)) {
        for (const msg of p.multiMessageValue) {
          for (const inner of (msg.parameter || [])) {
            if (inner.name === 'scope_name' && inner.value) {
              eventScopes.add(inner.value);
            }
          }
        }
      }
    }

    if (cid || appName) {
      const csvMatch = cid ? csvAppMap.get(cid) : null;
      const effectiveName = (csvMatch && isDescriptiveAppName(csvMatch.appName)) ? csvMatch.appName : appName;
      const record = getOrCreateDeploymentRecord(effectiveName, cid, csvMatch?.rawType || null, csvMatch?.verificationStatus || null);
      record.totalActivityEvents++;
      const time = event.id?.time;
      const actorEmail = event.actor?.email;
      if (time) {
        if (!record.firstSeen || time < record.firstSeen) record.firstSeen = time;
        if (!record.lastActive || time > record.lastActive) record.lastActive = time;
      }
      if (actorEmail) {
        if (!record.users.has(actorEmail)) {
          const u = userMap.get(actorEmail) || {
            id: 'unknown',
            email: actorEmail,
            name: actorEmail,
            orgUnit: '/',
            isAdmin: false,
          };
          record.users.set(actorEmail, {
            ...u,
            grantedScopes: new Set(),
          });
        }
        const userEntry = record.users.get(actorEmail);
        for (const s of eventScopes) {
          userEntry.grantedScopes.add(s);
        }
      }

      if (eventScopes.size > 0) {
        const scopesArr = Array.from(eventScopes);
        for (const s of scopesArr) {
          addScopeToRecord(record, s, 'AUDIT_LOG_AUTHORIZE', time, actorEmail);
        }
        if (e.name === 'authorize') {
          chronologicalScopeEvents.push({
            id: `${event.id?.uniqueQualifier || Date.now()}_token_auth`,
            time: time || new Date().toISOString(),
            source: 'TOKEN_AUDIT_LOG',
            eventName: 'auth:authorize',
            actorEmail: actorEmail || 'unknown',
            clientId: cid || record.id,
            deploymentKey: record.id,
            appName: record.displayName || effectiveName || cid,
            scopes: scopesArr,
            ipAddress: event.ipAddress || null,
          });
        }
      }
    }
  }
}

// 2b. Ingest Admin Audit Logs for Domain-Wide Delegation Scope Grants (AUTHORIZE_API_CLIENT_ACCESS)
for (const event of adminAuditEvents) {
  for (const e of (event.events || [])) {
    if (e.name !== 'AUTHORIZE_API_CLIENT_ACCESS') continue;
    let cid = null;
    let appName = null;
    let apiScopesStr = '';
    for (const p of (e.parameters || [])) {
      if (p.name === 'API_CLIENT_NAME') cid = p.value;
      if (p.name === 'DOMAIN_NAME') appName = p.value;
      if (p.name === 'API_SCOPES') apiScopesStr = p.value || (p.multiValue || []).join(',');
    }
    const scopesArr = apiScopesStr.split(',').map(s => s.trim()).filter(Boolean);
    if ((cid || appName) && scopesArr.length > 0) {
      const csvMatch = cid ? csvAppMap.get(cid) : null;
      const effectiveName = (csvMatch && isDescriptiveAppName(csvMatch.appName)) ? csvMatch.appName : appName;
      const record = getOrCreateDeploymentRecord(effectiveName, cid, csvMatch?.rawType || null, csvMatch?.verificationStatus || null);
      const time = event.id?.time;
      const actorEmail = event.actor?.email;
      if (time) {
        if (!record.firstSeen || time < record.firstSeen) record.firstSeen = time;
        if (!record.lastActive || time > record.lastActive) record.lastActive = time;
      }
      for (const s of scopesArr) {
        addScopeToRecord(record, s, 'DOMAIN_WIDE_DELEGATION', time, actorEmail);
      }
      chronologicalScopeEvents.push({
        id: `${event.id?.uniqueQualifier || Date.now()}_dwd_auth`,
        time: time || new Date().toISOString(),
        source: 'ADMIN_AUDIT_LOG',
        eventName: 'DOMAIN_SETTINGS:AUTHORIZE_API_CLIENT_ACCESS',
        actorEmail: actorEmail || 'admin@gafe.co.za',
        clientId: cid || record.id,
        deploymentKey: record.id,
        appName: record.displayName || effectiveName || cid,
        scopes: scopesArr,
        ipAddress: event.ipAddress || null,
      });
    }
  }
}

// 2c. Analyze Chronological Scope Progression to Detect Newly Requested / Incremental Scopes
chronologicalScopeEvents.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
const seenScopesPerDeployment = new Map();
const scopeExpansionEvents = [];

for (const ev of chronologicalScopeEvents) {
  const key = ev.deploymentKey;
  const record = catalog.get(key);
  if (!seenScopesPerDeployment.has(key)) {
    seenScopesPerDeployment.set(key, new Set(ev.scopes));
    const entry = {
      ...ev,
      changeType: 'INITIAL_SCOPE_GRANT',
      newScopes: ev.scopes,
      previousScopesCount: 0,
      totalScopesCount: ev.scopes.length,
    };
    scopeExpansionEvents.push(entry);
    if (record) record.scopeExpansionHistory.push(entry);
  } else {
    const known = seenScopesPerDeployment.get(key);
    const added = ev.scopes.filter(s => !known.has(s));
    if (added.length > 0) {
      const prevCount = known.size;
      added.forEach(s => {
        known.add(s);
        if (record) record.newlyRequestedScopes.add(s);
      });
      const entry = {
        ...ev,
        changeType: 'NEW_SCOPE_REQUESTED',
        newScopes: added,
        previousScopesCount: prevCount,
        totalScopesCount: known.size,
      };
      scopeExpansionEvents.push(entry);
      if (record) record.scopeExpansionHistory.push(entry);
    }
  }
}

// 3. Ingest Google Workspace App Access Control Baseline (owl_apps.csv)
const DOMAIN_ACCESS_POLICIES = {};
let baselineCsvLoaded = false;
let baselinePolicyCount = 0;

function parseServicesWithScopes(rawStr) {
  if (!rawStr || !rawStr.includes(':')) return { services: {}, scopes: [] };
  const services = {};
  const allScopes = [];
  let clean = rawStr.trim();
  if (clean.startsWith('[') && clean.endsWith(']')) clean = clean.slice(1, -1);
  const parts = clean.split('|');
  for (const part of parts) {
    const colonIdx = part.indexOf(':');
    if (colonIdx === -1) continue;
    const serviceName = part.slice(0, colonIdx).trim();
    let scopesPart = part.slice(colonIdx + 1).trim();
    if (scopesPart.startsWith('[') && scopesPart.endsWith(']')) scopesPart = scopesPart.slice(1, -1);
    const scopes = scopesPart.split(',').map(s => s.trim()).filter(Boolean);
    services[serviceName] = scopes.length;
    allScopes.push(...scopes);
  }
  return { services, scopes: Array.from(new Set(allScopes)) };
}


// 3a. Ingest Accessed Apps Baseline (if available) to capture baseline verification and scopes
if (accessedCsvPath) {
  const accessedRows = parseCsvLines(accessedCsvPath);
  for (const row of accessedRows) {
    const cid = row['Id'];
    if (row['Ownership']?.toLowerCase() === 'internal' && !catalog.has(cid)) continue;
    let appName = row['App Name'] ? row['App Name'].trim() : '';
    const rawType = row['Type'] || 'Web Application';

    if (!appName && cid) {
      if (cid.startsWith('779010036194-')) appName = 'Canva';
      else if (cid.startsWith('585538275436-')) appName = 'GAM';
      else if (cid.includes('DevicePolicy')) appName = 'Google Device Policy';
      else appName = 'Accessed Third-Party App';
    }

    if (cid) {
      const { services, scopes } = parseServicesWithScopes(row['Requested Services with Scopes']);
      const record = getOrCreateDeploymentRecord(appName, cid, rawType, row['Verification Status']);
      if (checkIsVerified(row['Verification Status'])) {
        record.isVerified = true;
      }
      if (row['Ownership'] === 'Google owned') {
        record.vendor = 'Google LLC';
        record.category = 'Google Workspace Core';
      }

      for (const s of scopes) {
        addScopeToRecord(record, s, 'ADMIN_CSV');
      }
    }
  }
}

// 3b. Ingest Configured Apps Baseline (Admin Console policies take precedence)
const baselineCsvPath = configuredCsvPath || accessedCsvPath;
if (configuredCsvPath) {
  const configuredRows = parseCsvLines(configuredCsvPath);
  if (configuredRows.length > 0) {
    baselineCsvLoaded = true;
    for (const row of configuredRows) {
      if (row['Ownership']?.toLowerCase() === 'internal') continue;
      let appName = row['App Name'] ? row['App Name'].trim() : '';
      const cid = row['Id'];
      const rawType = row['Type'] || 'Web Application';

      if (!appName && cid) {
        if (cid.startsWith('779010036194-')) appName = 'Canva';
        else if (cid.startsWith('585538275436-')) appName = 'GAM';
        else if (cid.includes('DevicePolicy')) appName = 'Google Device Policy';
        else appName = 'Configured Third-Party App';
      }

      if (cid) {
        baselinePolicyCount++;
        const accessRaw = (row['Access'] || '').toUpperCase();
        const accessLevel = accessRaw === 'TRUSTED' ? 'TRUSTED' :
                           (accessRaw === 'LIMITED' ? 'LIMITED' :
                           (accessRaw === 'BLOCKED' ? 'BLOCKED' :
                           (accessRaw.includes('SPECIFIC') ? 'SPECIFIC_DATA' : 'UNCONFIGURED')));
        
        const { services, scopes } = parseServicesWithScopes(row['Requested Services with Scopes']);

        DOMAIN_ACCESS_POLICIES[cid] = {
          accessLevel,
          orgUnitPath: row['Org Unit'] || '/',
          domainName: 'gafe.co.za',
          isOverridden: row['Org Unit'] && row['Org Unit'] !== '/',
          exemptFromContextAwareAccess: accessLevel === 'TRUSTED',
          allowedServices: services,
          configuredBy: `Admin Console Baseline (${path.basename(configuredCsvPath)})`,
          lastPolicyUpdate: '2026-09-13T18:00:00Z'
        };

        const record = getOrCreateDeploymentRecord(appName, cid, rawType, row['Verification Status']);
        if (checkIsVerified(row['Verification Status'])) {
          record.isVerified = true;
        }
        if (row['Ownership'] === 'Google owned') {
          record.vendor = 'Google LLC';
          record.category = 'Google Workspace Core';
        }

        for (const s of scopes) {
          addScopeToRecord(record, s, 'ADMIN_CSV');
        }
      }
    }
  }
}

// 4. Group by Product Families and Link Siblings
const familyMap = new Map();
for (const [id, dep] of catalog.entries()) {
  if (!familyMap.has(dep.familyId)) {
    familyMap.set(dep.familyId, {
      familyId: dep.familyId,
      familyName: dep.familyName,
      vendor: dep.vendor,
      iconUrl: dep.iconUrl,
      deployments: [],
    });
  }
  familyMap.get(dep.familyId).deployments.push(dep);
}

// 5. Finalize Distinct Deployments
const finalizedApps = [];
for (const [id, app] of catalog.entries()) {
  const clientIdsArr = Array.from(app.clientIds);

  const usersList = Array.from(app.users.values()).map(u => ({
    email: u.email,
    name: u.name,
    orgUnit: u.orgUnit,
    isAdmin: u.isAdmin,
    grantedScopes: Array.from(u.grantedScopes),
  }));

  const scopesList = Array.from(app.scopes.entries()).map(([scope, risk]) => {
    const ref = SCOPE_REFERENCE_MAP.get(scope);
    const adminScore = ref ? ref.admin_score : 1;
    const adminColor = ref ? ref.admin_color : 'Blue';
    const googleTier = ref ? ref.google_tier : 'Non-Sensitive';
    const meta = app.scopeMeta.get(scope);
    const isNewlyRequested = app.newlyRequestedScopes.has(scope);
    return {
      scope,
      riskLevel: risk.level,
      description: ref ? ref.rationale : risk.reason,
      threatImpact: ref ? ref.threat_impact : '',
      adminScore,
      adminColor,
      googleTier,
      service: ref ? ref.service_name : detectServiceBucket(scope),
      isNewlyRequested,
      sources: meta ? Array.from(meta.sources) : ['ACTIVE_TOKEN'],
      firstSeenAt: meta?.firstSeenAt || null,
      lastAuthorizedAt: meta?.lastAuthorizedAt || null,
      authorizedBy: meta?.authorizedBy || null,
    };
  });

  // Pre-enrich application metadata for publisher verification & structured breaches
  const enrichedMeta = enrichApplicationRecord({
    displayName: app.displayName,
    name: app.displayName,
    isVerified: app.isVerified,
    appType: app.deploymentType || app.appType
  });

  const effectiveVerified = Boolean(app.isVerified || enrichedMeta.isVerified);
  const breaches = (app.breaches && app.breaches.length > 0) ? app.breaches : (enrichedMeta.breaches || []);

  // Calculate Inherent Risk Score: Layer 2 Model
  // Scope Sensitivity (Option B Floor + Breadth) + Additive Verification Penalty + Additive Breach Penalty
  const inherentRisk = calculateInherentRisk({
    scopesList,
    isVerified: effectiveVerified,
    breaches,
    appType: app.deploymentType || app.appType,
    referenceDate: new Date()
  });

  const calculatedRiskScore = inherentRisk.riskScore;
  const calculatedRiskLevel = inherentRisk.riskLevel;
  const calculatedRiskColor = inherentRisk.riskScoreColor;
  const peakScopeScore = inherentRisk.peakScopeScore;
  const breadthScore = inherentRisk.breadthScore;
  const avgScopeScore = inherentRisk.avgScopeScore;

  const isStale = app.totalActivityEvents === 0;
  const activityDateFormatted = app.lastActive 
    ? new Date(app.lastActive).toLocaleDateString('en-GB') 
    : (app.firstSeen ? new Date(app.firstSeen).toLocaleDateString('en-GB') : '12/09/2026');

  // Policy lookup for this specific deployment
  let appPolicy = null;
  let adminAccessLevel = 'UNCONFIGURED';
  if (app.clientId && DOMAIN_ACCESS_POLICIES[app.clientId]) {
    appPolicy = DOMAIN_ACCESS_POLICIES[app.clientId];
    adminAccessLevel = appPolicy.accessLevel;
  } else {
    for (const cid of clientIdsArr) {
      if (DOMAIN_ACCESS_POLICIES[cid]) {
        appPolicy = DOMAIN_ACCESS_POLICIES[cid];
        adminAccessLevel = appPolicy.accessLevel;
        break;
      }
    }
  }

  // Sibling deployments in the same product family
  const familyGroup = familyMap.get(app.familyId);
  const siblingDeployments = (familyGroup?.deployments || [])
    .filter(d => d.id !== app.id)
    .map(d => ({
      id: d.id,
      displayName: d.displayName,
      deploymentType: d.deploymentType,
      clientId: d.clientId,
      adminAccessLevel: DOMAIN_ACCESS_POLICIES[d.clientId]?.accessLevel || 'UNCONFIGURED',
      totalUsersCount: d.users.size,
      maxRisk: d.maxRisk
    }));

  const newlyRequestedArr = Array.from(app.newlyRequestedScopes);
  const scopeExpansionReasons = newlyRequestedArr.length > 0
    ? [`Incremental Scope Expansion: ${newlyRequestedArr.length} new scope(s) requested (${newlyRequestedArr.map(s => s.split('/').pop()).join(', ')})`]
    : [];

  const combinedRiskReasons = Array.from(new Set([
    ...inherentRisk.riskReasons,
    ...Array.from(app.riskReasons),
    ...scopeExpansionReasons
  ]));

  // -------------------------------------------------------------------------
  // ADMINLENS GOVERNANCE DECISION TREE EVALUATION
  // Standardized Naming Convention across all tracks:
  //   - TIER_1 (Critical Priority)
  //   - TIER_2 (High Priority)
  //   - TIER_3 (Medium Priority)
  //   - TIER_4 (Low Priority)
  //   - COMPLIANT (No Action Needed)
  // Actions:
  //   - Google-Owned Track: TRUSTED (or BLOCKED)
  //   - 3rd-Party Track: BLOCKED | SPECIFIC_DATA | LIMITED | NONE
  // -------------------------------------------------------------------------
  const REF_NOW_MS = new Date('2026-09-26T00:00:00Z').getTime();
  const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;
  const lastActiveMs = app.lastActive ? new Date(app.lastActive).getTime() : null;
  const isRecent30d = lastActiveMs !== null
    ? (REF_NOW_MS - lastActiveMs) <= 30 * 24 * 60 * 60 * 1000
    : !isStale;

  const policyUpper = (adminAccessLevel || 'UNCONFIGURED').toUpperCase();
  const isGoogleOwned = app.vendor === 'Google LLC' || app.category === 'Google Workspace Core' || (app.publisherDomain && app.publisherDomain.endsWith('google.com') && app.appType !== 'Google Apps Script');
  const isSecuredPolicy = policyUpper === 'SPECIFIC_DATA' || policyUpper === 'BLOCKED' || policyUpper === 'LIMITED';
  const isTrustedPolicy = policyUpper === 'TRUSTED';
  const hasActiveBreach = inherentRisk.breachBracket === 'ACTIVE_CRISIS' || (inherentRisk.breachDaysElapsed !== null && inherentRisk.breachDaysElapsed <= 90);
  const isHighOrCritRisk = calculatedRiskLevel === 'CRITICAL' || calculatedRiskLevel === 'HIGH' || calculatedRiskScore >= 4.0;
  const isModerateRisk = !isHighOrCritRisk && calculatedRiskScore >= 2.5;
  const totalUsersCountVal = usersList.length;
  const adminUsersCountVal = usersList.filter(u => u.isAdmin).length;
  const hasSprawlVal = totalUsersCountVal > 1 || adminUsersCountVal > 0;
  const hasNewScopesVal = newlyRequestedArr.length > 0;

  let decisionTree = {
    branch: 'UNCONFIGURED',
    triageTier: 'TIER_4',
    triageBadge: 'Tier 4 (Low) — Action: LIMITED',
    gatePath: 'Gate 0 (3rd-Party) ➔ Gate 1 (Unconfigured) ➔ Gate U2 (Score 1–2 Low/SSO) ➔ Tier 4',
    recommendedPolicy: 'LIMITED',
    recommendedPolicyLabel: 'Limited (Unrestricted Data Only)',
    recommendationSeverity: 'LOW',
    needsAction: true,
    directive: "Tier 4 (Low): Configure to 'Limited' so the app can only access unrestricted/non-sensitive SSO scopes while restricted scopes are automatically blocked.",
    trustedGateReason: null,
    trustedScopeCategory: null,
  };

  // GATE 0: Google-Owned Applications (Only support TRUSTED or BLOCKED in Admin Console)
  if (isGoogleOwned) {
    if (isTrustedPolicy) {
      decisionTree = {
        branch: 'GOOGLE_OWNED',
        triageTier: 'SECURED',
        triageBadge: 'Compliant — No Action Needed (Google-Owned Trusted)',
        gatePath: 'Gate 0 (Google-Owned: YES) ➔ Gate G1 (Already TRUSTED) ➔ Compliant',
        recommendedPolicy: 'NONE',
        recommendedPolicyLabel: 'Compliant (Google-Owned Trusted)',
        recommendationSeverity: 'NONE',
        needsAction: false,
        directive: 'Compliant. Google-owned first-party application is already set to TRUSTED.',
        trustedGateReason: 'Google-Owned First-Party Service',
        trustedScopeCategory: null,
      };
    } else {
      decisionTree = {
        branch: 'GOOGLE_OWNED',
        triageTier: 'TIER_3',
        triageBadge: 'Tier 3 (Medium) — Action: TRUSTED',
        gatePath: `Gate 0 (Google-Owned: YES) ➔ Gate G1 (${policyUpper}) ➔ Tier 3 (Action: TRUSTED)`,
        recommendedPolicy: 'TRUSTED',
        recommendedPolicyLabel: 'Trusted (Standard for Google-Owned Apps)',
        recommendationSeverity: 'MEDIUM',
        needsAction: true,
        directive: "Tier 3 (Medium): Google-owned applications only support TRUSTED or BLOCKED in Google Workspace API Controls. Recommended Action: Configure to 'Trusted'.",
        trustedGateReason: null,
        trustedScopeCategory: null,
      };
    }
  } else if (isSecuredPolicy) {
    // GATE 1: 3rd-Party Already Hardened (SPECIFIC_DATA, LIMITED, or BLOCKED)
    decisionTree = {
      branch: 'SECURED',
      triageTier: 'SECURED',
      triageBadge: `Compliant — No Action Needed (${policyUpper})`,
      gatePath: `Gate 0 (3rd-Party) ➔ Gate 1 (${policyUpper}) ➔ Compliant`,
      recommendedPolicy: 'NONE',
      recommendedPolicyLabel: 'Compliant (Already Configured)',
      recommendationSeverity: 'NONE',
      needsAction: false,
      directive: `Compliant. 3rd-party application is already locked to ${policyUpper}. Zero recommendations generated.`,
      trustedGateReason: null,
      trustedScopeCategory: null,
    };
  } else if (isTrustedPolicy) {
    // BRANCH A: 3rd-Party TRUSTED Policy Governance (Gates T1 ➔ T2 ➔ T3)
    const newScopeObjs = scopesList.filter(s => s.isNewlyRequested || newlyRequestedArr.includes(s.scope));
    const lastReviewedStr = app.lastReviewedAt || null;
    const reviewedWithinSixMonths = lastReviewedStr
      ? (REF_NOW_MS - new Date(lastReviewedStr).getTime()) <= SIX_MONTHS_MS
      : false;

    if (hasActiveBreach) {
      const reason = `Gate T1 (Exception: Active Vendor Breach) ➔ Tier 1 (Critical) — Action: BLOCK`;
      decisionTree = {
        branch: 'TRUSTED',
        triageTier: 'TIER_1',
        triageBadge: 'Tier 1 (Critical) — Action: BLOCK',
        gatePath: reason,
        recommendedPolicy: 'BLOCKED',
        recommendedPolicyLabel: 'Block (Active Vendor Breach)',
        recommendationSeverity: 'CRITICAL',
        needsAction: true,
        directive: `Tier 1 (Critical): Trusted vendor has an active security breach. Recommended Action: Set policy to 'Blocked' immediately to sever active tokens.`,
        trustedGateReason: reason,
        trustedScopeCategory: 'Restricted',
      };
    } else if (hasNewScopesVal) {
      const hasRestricted = newScopeObjs.some(s => s.googleTier === 'Restricted');
      const hasSensitive = newScopeObjs.some(s => s.googleTier === 'Sensitive');
      const cat = hasRestricted ? 'Restricted' : (hasSensitive ? 'Sensitive' : 'Non-Sensitive');
      const targetPolicy = (cat === 'Non-Sensitive' && calculatedRiskScore < 3.0) ? 'LIMITED' : 'SPECIFIC_DATA';
      const targetLabel = targetPolicy === 'LIMITED' ? 'Limited' : 'Specific Google Data';
      const reason = `Gate T1 (Exception: ${newScopeObjs.length} New ${cat} Scope) ➔ Tier 1 (Critical) — Action: ${targetLabel.toUpperCase()}`;
      decisionTree = {
        branch: 'TRUSTED',
        triageTier: 'TIER_1',
        triageBadge: `Tier 1 (Critical) — Action: ${targetLabel.toUpperCase()}`,
        gatePath: reason,
        recommendedPolicy: targetPolicy,
        recommendedPolicyLabel: targetLabel,
        recommendationSeverity: 'CRITICAL',
        needsAction: true,
        directive: `Tier 1 (Critical): Trusted app requested ${newScopeObjs.length} new ${cat} scope(s). Recommended Action: Downgrade from blanket 'Trusted' to '${targetLabel}' to lock approved scopes and block unapproved scope escalation.`,
        trustedGateReason: reason,
        trustedScopeCategory: cat,
      };
    } else if (!isHighOrCritRisk) {
      // Gate T2: Score 1, 2, 3 (< 4.00) -> Low risk, No Recommendation
      const reason = `Gate T1 (No Exception) ➔ Gate T2 (Score ${calculatedRiskScore.toFixed(1)} [1–3 Low/Mod]) ➔ Compliant`;
      decisionTree = {
        branch: 'TRUSTED',
        triageTier: 'SECURED',
        triageBadge: 'Compliant — No Action Needed (Trusted Score 1–3)',
        gatePath: reason,
        recommendedPolicy: 'NONE',
        recommendedPolicyLabel: 'Compliant (Trusted Score 1–3)',
        recommendationSeverity: 'NONE',
        needsAction: false,
        directive: 'Compliant. Trusted app has a low/moderate risk score (1–3) and no breach or new scope exception.',
        trustedGateReason: reason,
        trustedScopeCategory: null,
      };
    } else if (reviewedWithinSixMonths) {
      // Gate T3: Score 4, 5 reviewed within last 6 months (<= 180d) -> No Recommendation
      const reason = `Gate T1 (No Exception) ➔ Gate T2 (Score ${calculatedRiskScore.toFixed(1)} [4–5]) ➔ Gate T3 (Reviewed ≤ 6 Mo) ➔ Compliant`;
      decisionTree = {
        branch: 'TRUSTED',
        triageTier: 'SECURED',
        triageBadge: 'Compliant — No Action Needed (Reviewed ≤ 6 Mo)',
        gatePath: reason,
        recommendedPolicy: 'NONE',
        recommendedPolicyLabel: 'Compliant (Reviewed ≤ 6 Months)',
        recommendationSeverity: 'NONE',
        needsAction: false,
        directive: 'Compliant. High-risk Trusted app (Score 4–5) was explicitly reviewed and approved within the last 6 months.',
        trustedGateReason: reason,
        trustedScopeCategory: null,
      };
    } else {
      // Gate T3: Score 4, 5 NOT reviewed in last 6 months (> 180d) -> Tier 2 (High)
      const reason = `Gate T1 (No Exception) ➔ Gate T2 (Score ${calculatedRiskScore.toFixed(1)} [4–5]) ➔ Gate T3 (> 6 Months) ➔ Tier 2 (High)`;
      decisionTree = {
        branch: 'TRUSTED',
        triageTier: 'TIER_2',
        triageBadge: 'Tier 2 (High) — Action: SPECIFIC GOOGLE DATA',
        gatePath: reason,
        recommendedPolicy: 'SPECIFIC_DATA',
        recommendedPolicyLabel: 'Specific Google Data (or Re-Confirm 6-Mo Schedule)',
        recommendationSeverity: 'HIGH',
        needsAction: true,
        directive: `Tier 2 (High): High-risk Trusted app (Score ${calculatedRiskScore.toFixed(1)}) has not been reviewed in > 6 months. Recommended Action: Downgrade to 'Specific Google Data' to lock current scopes, or re-confirm Trusted to reset the 6-month timer.`,
        trustedGateReason: reason,
        trustedScopeCategory: null,
      };
    }
  } else {
    // BRANCH B: 3rd-Party UNCONFIGURED (Shadow IT) Sifting (Gates U1 ➔ U2 ➔ Tiers 1–4)
    if (hasActiveBreach) {
      decisionTree = {
        branch: 'UNCONFIGURED',
        triageTier: 'TIER_1',
        triageBadge: 'Tier 1 (Critical) — Action: BLOCK',
        gatePath: `Gate U1 (Active Breach ≤ 90d) ➔ Tier 1 (Critical) — Action: BLOCK`,
        recommendedPolicy: 'BLOCKED',
        recommendedPolicyLabel: 'Block (Active Vendor Breach)',
        recommendationSeverity: 'CRITICAL',
        needsAction: true,
        directive: "Tier 1 (Critical): Unconfigured app with a recent vendor security breach (≤ 90d). Recommended Action: Set to 'Blocked' immediately.",
        trustedGateReason: null,
        trustedScopeCategory: null,
      };
    } else if (isHighOrCritRisk && (!effectiveVerified || !isRecent30d || totalUsersCountVal <= 1)) {
      const contextTriggers = [
        !effectiveVerified ? 'Unverified' : null,
        totalUsersCountVal <= 1 ? 'Single-User (≤1)' : null,
        !isRecent30d ? 'Dormant (>30d)' : null,
      ].filter(Boolean).join(' / ');
      decisionTree = {
        branch: 'UNCONFIGURED',
        triageTier: 'TIER_1',
        triageBadge: 'Tier 1 (Critical) — Action: BLOCK',
        gatePath: `Gate U1 (No Breach) ➔ Gate U2 (Score ${calculatedRiskScore.toFixed(1)} [4–5], ${contextTriggers}) ➔ Tier 1 (Critical)`,
        recommendedPolicy: 'BLOCKED',
        recommendedPolicyLabel: 'Block (High/Critical Unverified or Dormant)',
        recommendationSeverity: 'CRITICAL',
        needsAction: true,
        directive: `Tier 1 (Critical): Score 4–5 app (${contextTriggers}) holding high/critical scopes without verified multi-user adoption. Recommended Action: Set to 'Blocked' (or 'Specific Google Data' only if explicitly validated).`,
        trustedGateReason: null,
        trustedScopeCategory: null,
      };
    } else if (isHighOrCritRisk && hasSprawlVal && isRecent30d) {
      decisionTree = {
        branch: 'UNCONFIGURED',
        triageTier: 'TIER_2',
        triageBadge: 'Tier 2 (High) — Action: SPECIFIC GOOGLE DATA',
        gatePath: `Gate U1 (No Breach) ➔ Gate U2 (Score ${calculatedRiskScore.toFixed(1)} [4–5], Verified & Active, ${totalUsersCountVal} Users) ➔ Tier 2 (High)`,
        recommendedPolicy: 'SPECIFIC_DATA',
        recommendedPolicyLabel: 'Specific Google Data',
        recommendationSeverity: 'HIGH',
        needsAction: true,
        directive: "Tier 2 (High): Verified, actively used business app with Score 4–5 scopes. Recommended Action: Configure to 'Specific Google Data' to lock approved scopes and block silent scope escalation.",
        trustedGateReason: null,
        trustedScopeCategory: null,
      };
    } else if (isModerateRisk) {
      const useSpecificData = effectiveVerified && isRecent30d && totalUsersCountVal > 0;
      const targetPol = useSpecificData ? 'SPECIFIC_DATA' : 'LIMITED';
      const targetLbl = useSpecificData ? 'Specific Google Data' : 'Limited';
      decisionTree = {
        branch: 'UNCONFIGURED',
        triageTier: 'TIER_3',
        triageBadge: `Tier 3 (Medium) — Action: ${targetLbl.toUpperCase()}`,
        gatePath: `Gate U1 (No Breach) ➔ Gate U2 (Score ${calculatedRiskScore.toFixed(1)} [3 Mod], ${useSpecificData ? 'Verified Active' : 'Unverified/Dormant'}) ➔ Tier 3 (Medium)`,
        recommendedPolicy: targetPol,
        recommendedPolicyLabel: targetLbl,
        recommendationSeverity: 'MEDIUM',
        needsAction: true,
        directive: useSpecificData
          ? "Tier 3 (Medium): Verified, active app with moderate scopes. Recommended Action: Configure to 'Specific Google Data' to approve current scopes."
          : "Tier 3 (Medium): Unverified or dormant app with moderate scopes. Recommended Action: Configure to 'Limited' to allow only unrestricted Google data and block restricted scopes.",
        trustedGateReason: null,
        trustedScopeCategory: null,
      };
    } else {
      decisionTree = {
        branch: 'UNCONFIGURED',
        triageTier: 'TIER_4',
        triageBadge: 'Tier 4 (Low) — Action: LIMITED',
        gatePath: `Gate U1 (No Breach) ➔ Gate U2 (Score ${calculatedRiskScore.toFixed(1)} [1–2 Low/SSO]) ➔ Tier 4 (Low)`,
        recommendedPolicy: 'LIMITED',
        recommendedPolicyLabel: 'Limited (Unrestricted Data Only)',
        recommendationSeverity: 'LOW',
        needsAction: true,
        directive: "Tier 4 (Low): Low-risk / SSO-only application (Score 1–2). Recommended Action: Bulk-configure to 'Limited' to allow unrestricted login scopes while automatically blocking restricted scopes.",
        trustedGateReason: null,
        trustedScopeCategory: null,
      };
    }
  }

  const finalApp = enrichApplicationRecord({
    id: app.id,
    clientId: app.clientId,
    familyId: app.familyId,
    familyName: app.familyName,
    displayName: app.displayName,
    vendor: app.vendor,
    publisherDomain: app.publisherDomain,
    category: app.category,
    appType: app.appType,
    deploymentType: app.deploymentType,
    compliance: app.compliance,
    dataHosting: app.dataHosting,
    breachHistory: enrichedMeta.breachHistory || app.breachHistory,
    breaches,
    breachPenalty: inherentRisk.breachPenalty,
    breachBracket: inherentRisk.breachBracket,
    breachDaysElapsed: inherentRisk.breachDaysElapsed,
    verificationPenalty: inherentRisk.verificationPenalty,
    scopeRiskScore: inherentRisk.scopeRiskScore,
    isVerified: effectiveVerified,
    iconUrl: app.iconUrl,
    storeUrl: app.storeUrl,
    description: app.description,
    riskScore: calculatedRiskScore,
    peakScopeScore: peakScopeScore,
    breadthScore: breadthScore,
    avgScopeScore: Number(avgScopeScore.toFixed(2)),
    riskLevel: calculatedRiskLevel,
    riskScoreColor: calculatedRiskColor,
    rawMaxRisk: app.maxRisk,
    riskReasons: combinedRiskReasons,
    adminAccessLevel: adminAccessLevel,
    accessPolicy: appPolicy,
    decisionTree,
    triageTier: decisionTree.triageTier,
    triageBadge: decisionTree.triageBadge,
    triageDirective: decisionTree.directive,
    gatePath: decisionTree.gatePath,
    multiClientMapped: siblingDeployments.length > 0,
    familyDeploymentsCount: (familyGroup?.deployments.length) || 1,
    siblingDeployments: siblingDeployments,
    clientIdsCount: clientIdsArr.length,
    clientIds: clientIdsArr,
    projectNumbers: Array.from(app.projectNumbers),
    totalUsersCount: usersList.length,
    adminUsersCount: usersList.filter(u => u.isAdmin).length,
    scopesCount: scopesList.length,
    scopes: scopesList,
    hasNewScopes: newlyRequestedArr.length > 0,
    newlyRequestedScopesCount: newlyRequestedArr.length,
    newlyRequestedScopes: newlyRequestedArr,
    scopeExpansionHistory: app.scopeExpansionHistory,
    servicesTouched: Array.from(app.servicesTouched),
    users: usersList,
    firstSeen: app.firstSeen,
    lastActive: app.lastActive,
    lastActiveFormatted: activityDateFormatted,
    isStale: isStale,
    isNew: !isStale && usersList.length <= 3,
    totalActivityEvents: app.totalActivityEvents,
  });

  finalizedApps.push(finalApp);
}

// Sort by Family Name, then Risk Level, then total users
const riskWeights = { CRITICAL: 5, HIGH: 4, MEDIUM: 3, MINOR: 2, LOW: 1 };
finalizedApps.sort((a, b) => {
  if (a.familyName !== b.familyName) {
    return a.familyName.localeCompare(b.familyName);
  }
  if (riskWeights[b.riskLevel] !== riskWeights[a.riskLevel]) {
    return riskWeights[b.riskLevel] - riskWeights[a.riskLevel];
  }
  return b.totalUsersCount - a.totalUsersCount;
});

// Build Product Families summary structure for UI
const productFamiliesSummary = Array.from(familyMap.values()).map(f => {
  const familyDeployments = finalizedApps.filter(d => d.familyId === f.familyId);
  const maxRisk = familyDeployments.reduce((max, d) => {
    return (riskWeights[d.riskLevel] > riskWeights[max]) ? d.riskLevel : max;
  }, 'LOW');
  const avgRiskScore = familyDeployments.length > 0
    ? Number((familyDeployments.reduce((sum, d) => sum + (d.riskScore || 0.0), 0) / familyDeployments.length).toFixed(2))
    : 0.0;

  return {
    familyId: f.familyId,
    familyName: f.familyName,
    vendor: f.vendor,
    iconUrl: f.iconUrl,
    deploymentsCount: f.deployments.length,
    totalUsersCount: f.deployments.reduce((acc, d) => acc + d.users.size, 0),
    maxRisk: maxRisk,
    avgRiskScore: avgRiskScore,
    deploymentIds: f.deployments.map(d => d.id),
  };
});

productFamiliesSummary.sort((a, b) => b.deploymentsCount - a.deploymentsCount);

const metrics = {
  totalApplications: finalizedApps.length,
  totalProductFamilies: productFamiliesSummary.length,
  totalDomainUsers: users.length,
  totalActiveGrants: activeTokens.length,
  criticalRiskApps: finalizedApps.filter(a => a.riskLevel === 'CRITICAL').length,
  highRiskApps: finalizedApps.filter(a => a.riskLevel === 'HIGH').length,
  mediumRiskApps: finalizedApps.filter(a => a.riskLevel === 'MEDIUM').length,
  minorRiskApps: finalizedApps.filter(a => a.riskLevel === 'MINOR').length,
  lowRiskApps: finalizedApps.filter(a => a.riskLevel === 'LOW').length,
  appsWithNewScopesCount: finalizedApps.filter(a => a.hasNewScopes).length,
  totalScopeExpansionEvents: scopeExpansionEvents.filter(e => e.changeType === 'NEW_SCOPE_REQUESTED').length,
  configuredAppsCount: finalizedApps.filter(a => a.adminAccessLevel && a.adminAccessLevel !== 'UNCONFIGURED').length,
  trustedAppsCount: finalizedApps.filter(a => a.adminAccessLevel === 'TRUSTED').length,
  blockedAppsCount: finalizedApps.filter(a => a.adminAccessLevel === 'BLOCKED').length,
  specificDataAppsCount: finalizedApps.filter(a => a.adminAccessLevel === 'SPECIFIC_DATA').length,
  unconfiguredAppsCount: finalizedApps.filter(a => a.adminAccessLevel === 'UNCONFIGURED').length,
  multiClientFamiliesCount: productFamiliesSummary.filter(f => f.deploymentsCount > 1).length,
  baselineSource: baselineCsvLoaded && baselineCsvPath ? path.basename(baselineCsvPath) : null,
  baselinePolicyCount: baselinePolicyCount,
  baselineLoadedAt: baselineCsvLoaded ? new Date().toISOString() : null,
};

const outputDir = './standardized_catalog';
fs.writeFileSync(path.join(outputDir, 'applications_catalog.json'), JSON.stringify(finalizedApps, null, 2));
fs.writeFileSync(path.join(outputDir, 'product_families.json'), JSON.stringify(productFamiliesSummary, null, 2));
fs.writeFileSync(path.join(outputDir, 'metrics.json'), JSON.stringify(metrics, null, 2));
fs.writeFileSync(path.join(outputDir, 'scope_expansion_events.json'), JSON.stringify(scopeExpansionEvents, null, 2));

if (fs.existsSync('./extracted_data')) {
  fs.writeFileSync(path.join('./extracted_data', 'scope_expansion_events.json'), JSON.stringify(scopeExpansionEvents, null, 2));
}

// Copy into mosaic-next/data/
const mosaicDataDir = './mosaic-next/data';
if (fs.existsSync(mosaicDataDir)) {
  fs.writeFileSync(path.join(mosaicDataDir, 'applications_catalog.json'), JSON.stringify(finalizedApps, null, 2));
  fs.writeFileSync(path.join(mosaicDataDir, 'product_families.json'), JSON.stringify(productFamiliesSummary, null, 2));
  fs.writeFileSync(path.join(mosaicDataDir, 'metrics.json'), JSON.stringify(metrics, null, 2));
  fs.writeFileSync(path.join(mosaicDataDir, 'scope_expansion_events.json'), JSON.stringify(scopeExpansionEvents, null, 2));
  if (fs.existsSync('./recommendations/recommendations.json')) {
    fs.copyFileSync('./recommendations/recommendations.json', path.join(mosaicDataDir, 'recommendations.json'));
  }
  if (fs.existsSync('./extracted_data/users.json')) {
    fs.copyFileSync('./extracted_data/users.json', path.join(mosaicDataDir, 'users.json'));
  }
}

// Copy to public/
if (fs.existsSync('./public')) {
  fs.writeFileSync(path.join('./public', 'standardized_catalog.json'), JSON.stringify(finalizedApps, null, 2));
  fs.writeFileSync(path.join('./public', 'product_families.json'), JSON.stringify(productFamiliesSummary, null, 2));
}

console.log(`✓ Rebuilt catalog with Hierarchical Platform Deployments: ${finalizedApps.length} distinct deployments across ${productFamiliesSummary.length} product families.`);
console.log(`✓ Scope Intelligence: ${scopeExpansionEvents.length} scope grant milestones (${metrics.totalScopeExpansionEvents} incremental scope expansions across ${metrics.appsWithNewScopesCount} apps).`);
console.log(`✓ Metrics: ${metrics.trustedAppsCount} trusted deployments, ${metrics.criticalRiskApps} critical, ${metrics.multiClientFamiliesCount} multi-deployment families.`);
console.log(`✓ Synced data files to ${mosaicDataDir}/ and public/`);
