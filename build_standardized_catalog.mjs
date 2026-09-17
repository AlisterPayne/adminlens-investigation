import fs from 'fs';
import path from 'path';
import { lookupChromeExtension } from './chrome_webstore_search.mjs';
import { enrichApplicationRecord } from './app_enrichment_service.mjs';
import { OAUTH_SCOPES_DATA } from './seed_scope_reference.mjs';

// Build OAuth Scope Reference lookup map
const SCOPE_REFERENCE_MAP = new Map();
for (const s of OAUTH_SCOPES_DATA) {
  SCOPE_REFERENCE_MAP.set(s.scope_url, s);
}

const activeTokens = JSON.parse(fs.readFileSync('./extracted_data/active_tokens.json', 'utf8'));
const auditEvents = JSON.parse(fs.readFileSync('./extracted_data/token_audit_events.json', 'utf8'));
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
      isVerified: Boolean(enriched.isVerified || (verifiedStatus && verifiedStatus.toLowerCase().includes('verified'))),
      iconUrl: enriched.iconUrl,
      storeUrl: enriched.storeUrl || null,
      description: enriched.description || '',
      clientIds: new Set(clientId ? [clientId] : []),
      projectNumbers: new Set(projNum !== 'unknown' ? [projNum] : []),
      users: new Map(),
      scopes: new Map(),
      servicesTouched: new Set(),
      maxRisk: 'LOW',
      riskReasons: new Set(),
      isNativeApp: deploymentType === 'Android App' || deploymentType === 'iOS App',
      isAnonymous: false,
      firstSeen: null,
      lastActive: null,
      totalActivityEvents: 0,
    });
  }

  const record = catalog.get(deploymentKey);
  if (clientId) record.clientIds.add(clientId);
  if (projNum !== 'unknown') record.projectNumbers.add(projNum);
  if (verifiedStatus && verifiedStatus.toLowerCase().includes('verified')) {
    record.isVerified = true;
  }
  return record;
}

// 1. Ingest Active Tokens (Directory API)
for (const token of activeTokens) {
  const record = getOrCreateDeploymentRecord(token.displayText, token.clientId);
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
    const risk = assessScopeRisk(s);
    record.scopes.set(s, risk);
    record.riskReasons.add(risk.reason);

    const srv = detectServiceBucket(s);
    if (srv) record.servicesTouched.add(srv);

    const order = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    if (order[risk.level] > order[record.maxRisk]) {
      record.maxRisk = risk.level;
    }
  }
}

// 2. Ingest Audit Activity (Reports API)
for (const event of auditEvents) {
  for (const e of (event.events || [])) {
    let cid = null;
    let appName = null;
    for (const p of (e.parameters || [])) {
      if (p.name === 'client_id') cid = p.value;
      if (p.name === 'app_name') appName = p.value;
    }

    if (cid || appName) {
      const record = getOrCreateDeploymentRecord(appName, cid);
      record.totalActivityEvents++;
      const time = event.id?.time;
      if (time) {
        if (!record.firstSeen || time < record.firstSeen) record.firstSeen = time;
        if (!record.lastActive || time > record.lastActive) record.lastActive = time;
      }
      if (event.actor?.email && !record.users.has(event.actor.email)) {
        const u = userMap.get(event.actor.email) || {
          id: 'unknown',
          email: event.actor.email,
          name: event.actor.email,
          orgUnit: '/',
          isAdmin: false,
        };
        record.users.set(event.actor.email, {
          ...u,
          grantedScopes: new Set(),
        });
      }
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

const baselineCsvPath = fs.existsSync('./owl_apps_configured_apps.csv') 
  ? './owl_apps_configured_apps.csv' 
  : (fs.existsSync('./owl_apps.csv') ? './owl_apps.csv' : null);

if (baselineCsvPath) {
  const owlText = fs.readFileSync(baselineCsvPath, 'utf8');
  const lines = owlText.trim().split(/\r?\n/);
  if (lines.length > 1) {
    baselineCsvLoaded = true;
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
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const vals = parseLine(lines[i]);
      const row = {};
      headers.forEach((h, idx) => row[h] = vals[idx] ? vals[idx].trim() : '');
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
          configuredBy: `Admin Console Baseline (${path.basename(baselineCsvPath)})`,
          lastPolicyUpdate: '2026-09-13T18:00:00Z'
        };

        const record = getOrCreateDeploymentRecord(appName, cid, rawType, row['Verification Status']);
        if (row['Verification Status'] && row['Verification Status'].toLowerCase().includes('verified')) {
          record.isVerified = true;
        }
        if (row['Ownership'] === 'Internal') {
          record.vendor = 'Internal Domain Tool';
          record.category = 'Admin & Automation';
        }

        for (const s of scopes) {
          if (!record.scopes.has(s)) {
            const risk = assessScopeRisk(s);
            record.scopes.set(s, risk);
            record.riskReasons.add(risk.reason);
            const srv = detectServiceBucket(s);
            if (srv) record.servicesTouched.add(srv);
            const order = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
            if (order[risk.level] > order[record.maxRisk]) {
              record.maxRisk = risk.level;
            }
          }
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
    return {
      scope,
      riskLevel: risk.level,
      description: ref ? ref.rationale : risk.reason,
      threatImpact: ref ? ref.threat_impact : '',
      adminScore,
      adminColor,
      googleTier,
      service: ref ? ref.service_name : detectServiceBucket(scope)
    };
  });

  // Calculate Application Risk Score: Option B Non-Compensatory Floor Model
  // Base Severity Floor (determined by Peak Scope) + Additive Attack Surface Breadth (secondary scopes)
  let calculatedRiskScore = 0.0;
  let peakScopeScore = 0;
  let breadthScore = 0.0;
  let avgScopeScore = 0.0;

  if (scopesList.length > 0) {
    peakScopeScore = Math.max(...scopesList.map(s => s.adminScore || 1));
    const sumScores = scopesList.reduce((sum, s) => sum + (s.adminScore || 1), 0);
    avgScopeScore = sumScores / scopesList.length;

    // Base tier floor based on peak scope:
    // Peak 5 -> 4.00, Peak 4 -> 3.00, Peak 3 -> 2.00, Peak 2 -> 1.00, Peak 1 -> 0.00
    const baseFloor = Math.max(0, peakScopeScore - 1);

    // Secondary scopes breadth surcharge
    const allScores = scopesList.map(s => s.adminScore || 1);
    const nonPeakScores = allScores.slice();
    nonPeakScores.splice(nonPeakScores.indexOf(peakScopeScore), 1);

    const surcharge = nonPeakScores.reduce((acc, score) => {
      if (score === 5) return acc + 0.15;
      if (score === 4) return acc + 0.08;
      if (score === 3) return acc + 0.04;
      if (score === 2) return acc + 0.02;
      return acc + 0.01;
    }, 0);

    const maxHeadroom = peakScopeScore === 5 ? 1.00 : 0.99;
    breadthScore = Number(Math.min(maxHeadroom, surcharge).toFixed(2));
    calculatedRiskScore = Number((baseFloor + breadthScore).toFixed(2));
  }

  // Derive standardized riskLevel and riskScoreColor from Option B score (0.00 - 5.00 Scale)
  // Scale: 0.00-0.99 (Low/Blue), 1.00-1.99 (Minor/Green), 2.00-2.99 (Medium/Yellow), 3.00-3.99 (High/Orange), 4.00-5.00 (Critical/Red)
  let calculatedRiskLevel = 'LOW';
  let calculatedRiskColor = 'Blue';
  if (calculatedRiskScore >= 4.00) {
    calculatedRiskLevel = 'CRITICAL';
    calculatedRiskColor = 'Red';
  } else if (calculatedRiskScore >= 3.00) {
    calculatedRiskLevel = 'HIGH';
    calculatedRiskColor = 'Orange';
  } else if (calculatedRiskScore >= 2.00) {
    calculatedRiskLevel = 'MEDIUM';
    calculatedRiskColor = 'Yellow';
  } else if (calculatedRiskScore >= 1.00) {
    calculatedRiskLevel = 'MINOR';
    calculatedRiskColor = 'Green';
  } else {
    calculatedRiskLevel = 'LOW';
    calculatedRiskColor = 'Blue';
  }

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
    breachHistory: app.breachHistory,
    isVerified: app.isVerified,
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
    riskReasons: Array.from(app.riskReasons),
    adminAccessLevel: adminAccessLevel,
    accessPolicy: appPolicy,
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

// Copy into mosaic-next/data/
const mosaicDataDir = './mosaic-next/data';
if (fs.existsSync(mosaicDataDir)) {
  fs.writeFileSync(path.join(mosaicDataDir, 'applications_catalog.json'), JSON.stringify(finalizedApps, null, 2));
  fs.writeFileSync(path.join(mosaicDataDir, 'product_families.json'), JSON.stringify(productFamiliesSummary, null, 2));
  fs.writeFileSync(path.join(mosaicDataDir, 'metrics.json'), JSON.stringify(metrics, null, 2));
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
console.log(`✓ Metrics: ${metrics.trustedAppsCount} trusted deployments, ${metrics.criticalRiskApps} critical, ${metrics.multiClientFamiliesCount} multi-deployment families.`);
console.log(`✓ Synced data files to ${mosaicDataDir}/ and public/`);
