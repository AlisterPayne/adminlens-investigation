import fs from 'fs';
import path from 'path';

const activeTokens = JSON.parse(fs.readFileSync('./extracted_data/active_tokens.json', 'utf8'));
const auditEvents = JSON.parse(fs.readFileSync('./extracted_data/token_audit_events.json', 'utf8'));
const users = JSON.parse(fs.readFileSync('./extracted_data/users.json', 'utf8'));

// Known vendor database for automatic classification and icon resolution
const KNOWN_VENDORS = {
  'claude': { vendor: 'Anthropic', domain: 'anthropic.com', category: 'AI & Machine Learning', verified: true },
  'figma': { vendor: 'Figma, Inc.', domain: 'figma.com', category: 'Design & Creative', verified: true },
  'canva': { vendor: 'Canva Pty Ltd', domain: 'canva.com', category: 'Design & Creative', verified: true },
  'padlet': { vendor: 'Wallwisher, Inc. (Padlet)', domain: 'padlet.com', category: 'Education & Collaboration', verified: true },
  'bitly': { vendor: 'Bitly, Inc.', domain: 'bitly.com', category: 'Productivity & Utilities', verified: true },
  'suno': { vendor: 'Suno, Inc.', domain: 'suno.com', category: 'AI & Media', verified: true },
  'wayground': { vendor: 'Wayground (Quizizz Inc.)', domain: 'wayground.com', category: 'Education & LMS', verified: true },
  'quizizz': { vendor: 'Quizizz Inc.', domain: 'quizizz.com', category: 'Education & LMS', verified: true },
  'exceedlms': { vendor: 'Intellum (Exceed LMS)', domain: 'intellum.com', category: 'Education & LMS', verified: true },
  'google skills': { vendor: 'Google LLC', domain: 'cloud.google.com', category: 'Training & Certification', verified: true },
  'google appsheet': { vendor: 'Google LLC', domain: 'appsheet.com', category: 'No-Code / Low-Code', verified: true },
  'cloudready': { vendor: 'Google LLC (Neverware)', domain: 'cloudready.com', category: 'Operating System', verified: true },
  'gam': { vendor: 'Open Source (GAM)', domain: 'github.com/GAM-team/GAM', category: 'Admin & Automation', verified: true },
  'gam7': { vendor: 'Open Source (GAM)', domain: 'github.com/GAM-team/GAM', category: 'Admin & Automation', verified: true },
  'pdfsimpli': { vendor: 'WorkSimpli Software LLC', domain: 'pdfsimpli.com', category: 'Document Management', verified: true },
  'bulksignature': { vendor: 'BulkSignature', domain: 'bulksignature.com', category: 'Email & Productivity', verified: false },
  'linkhms': { vendor: 'LinkHMS Hospitality', domain: 'linkhms.com', category: 'Hospitality Management', verified: false },
  'edu launchpad': { vendor: 'Edu Launchpad', domain: 'edulaunchpad.com', category: 'Education & Portals', verified: false },
  'howdou': { vendor: 'Howdou', domain: 'howdou.com', category: 'Education & Tutorials', verified: false },
  'mylogin': { vendor: 'Wonde Ltd (MyLogin)', domain: 'mylogin.com', category: 'Identity & Single Sign-On', verified: true },
  'adminlens': { vendor: 'Admin Lens', domain: 'adminlens.io', category: 'Cloud Security & Governance', verified: true },
  'dev.adminlens': { vendor: 'Admin Lens', domain: 'adminlens.io', category: 'Cloud Security & Governance', verified: true },
  'ios': { vendor: 'Apple Inc.', domain: 'apple.com', category: 'Mobile OS / Sync', verified: true },
};

// Known / Ingested Google Workspace App Access Control Policies (from Admin Console / Reports API)
const DOMAIN_ACCESS_POLICIES = {
  // MyLogin (from Google Admin Console screenshot)
  '188883250313-8nmnraov1542echfae84q33gmdi5k54g.apps.googleusercontent.com': {
    accessLevel: 'TRUSTED',
    orgUnitPath: '/',
    domainName: 'gafe.co.za',
    isOverridden: true,
    exemptFromContextAwareAccess: false,
    allowedServices: {
      'Google Workspace Admin': 4,
      'Other': 1,
      'Google Sign-in': 3
    },
    configuredBy: 'alister@gafe.co.za',
    lastPolicyUpdate: '2026-09-01T10:00:00Z'
  },
  // GAM Admin automation client
  '101367350966766396496': {
    accessLevel: 'TRUSTED',
    orgUnitPath: '/',
    domainName: 'gafe.co.za',
    isOverridden: false,
    exemptFromContextAwareAccess: true,
    allowedServices: {
      'Google Workspace Admin': 8,
      'Google Reports': 2
    },
    configuredBy: 'alister@gafe.co.za',
    lastPolicyUpdate: '2026-08-15T12:00:00Z'
  }
};

function getProjectNumber(clientId) {
  if (!clientId) return 'unknown';
  const match = clientId.match(/^(\d+)-/);
  return match ? match[1] : clientId;
}

function classifyApp(name, clientId) {
  const lowerName = (name || '').toLowerCase().trim();
  
  for (const [key, info] of Object.entries(KNOWN_VENDORS)) {
    if (lowerName.includes(key) || (clientId && clientId.toLowerCase().includes(key))) {
      return info;
    }
  }

  // Detect Google Apps Script / Custom Scripts
  if (lowerName.includes('untitled project') || lowerName.includes('leave') || lowerName.includes('script') || lowerName.includes('addon')) {
    return {
      vendor: 'Internal / Google Apps Script',
      domain: 'script.google.com',
      category: 'Custom Internal Automation',
      verified: false
    };
  }

  return {
    vendor: name || 'Third-Party Developer',
    domain: '',
    category: 'Unclassified SaaS',
    verified: false
  };
}

function getIconUrl(domain, clientId) {
  // If Chrome extension ID (32 chars)
  if (clientId && /^[a-z]{32}$/.test(clientId)) {
    return `https://clients2.googleusercontent.com/service/update2/crx?response=redirect&prodversion=100.0&x=id%3D${clientId}%26installsource%3Dondemand%26uc`;
  }
  // High-res Google Favicon API
  if (domain) {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }
  return 'https://www.gstatic.com/images/branding/product/1x/avatar_square_grey_54dp.png';
}

function assessScopeRisk(scope) {
  const s = scope.toLowerCase();
  if (s.includes('admin.') || s.includes('mail.google.com') || s.includes('script.send_mail')) {
    return 'CRITICAL';
  }
  if (s.includes('drive') && !s.includes('readonly') && !s.includes('file')) {
    return 'HIGH';
  }
  if (s.includes('directory') || s.includes('calendar') || s.includes('contacts') || s.includes('spreadsheets')) {
    return 'MEDIUM';
  }
  return 'LOW';
}

// 1. Group active tokens and reports events by Application Identity
const appsMap = new Map();

// Helper to get or create app group
function getOrCreateAppRecord(name, clientId) {
  const normName = (name || 'Unnamed Application').trim();
  const projNumber = getProjectNumber(clientId);
  
  // Group key: Use normalized vendor name if known, or Project Number if multi-client, or client ID
  const classification = classifyApp(normName, clientId);
  const groupKey = classification.vendor !== 'Third-Party Developer' 
    ? classification.vendor 
    : (projNumber !== 'unknown' ? `gcp_proj_${projNumber}` : clientId);

  if (!appsMap.has(groupKey)) {
    appsMap.set(groupKey, {
      id: groupKey,
      displayName: normName,
      vendor: classification.vendor,
      domain: classification.domain,
      category: classification.category,
      isVerified: classification.verified,
      iconUrl: getIconUrl(classification.domain, clientId),
      clientIds: new Set(),
      projectNumbers: new Set(),
      users: new Map(), // email -> { scopes, isUserAdmin, orgUnit }
      allScopes: new Set(),
      maxRisk: 'LOW',
      nativeApp: false,
      anonymous: false,
      firstSeen: null,
      lastActive: null,
      sources: new Set()
    });
  }

  const app = appsMap.get(groupKey);
  if (clientId) app.clientIds.add(clientId);
  if (projNumber !== 'unknown') app.projectNumbers.add(projNumber);
  return app;
}

// Ingest Active Tokens
for (const token of activeTokens) {
  const app = getOrCreateAppRecord(token.displayText, token.clientId);
  app.sources.add('directory_tokens');
  if (token.nativeApp) app.nativeApp = true;
  if (token.anonymous) app.anonymous = true;

  if (!app.users.has(token.userEmail)) {
    app.users.set(token.userEmail, {
      email: token.userEmail,
      orgUnit: token.userOrgUnit,
      isAdmin: token.isUserAdmin,
      scopes: new Set(token.scopes || [])
    });
  } else {
    const u = app.users.get(token.userEmail);
    (token.scopes || []).forEach(s => u.scopes.add(s));
  }

  for (const s of (token.scopes || [])) {
    app.allScopes.add(s);
    const risk = assessScopeRisk(s);
    if (risk === 'CRITICAL') app.maxRisk = 'CRITICAL';
    else if (risk === 'HIGH' && app.maxRisk !== 'CRITICAL') app.maxRisk = 'HIGH';
    else if (risk === 'MEDIUM' && (app.maxRisk === 'LOW')) app.maxRisk = 'MEDIUM';
  }
}

// Ingest Audit Events
for (const event of auditEvents) {
  for (const e of (event.events || [])) {
    let cid = null;
    let appName = null;
    for (const p of (e.parameters || [])) {
      if (p.name === 'client_id') cid = p.value;
      if (p.name === 'app_name') appName = p.value;
    }
    if (cid || appName) {
      const app = getOrCreateAppRecord(appName || 'Unknown App', cid);
      app.sources.add('reports_audit');
      const time = event.id?.time;
      if (time) {
        if (!app.firstSeen || time < app.firstSeen) app.firstSeen = time;
        if (!app.lastActive || time > app.lastActive) app.lastActive = time;
      }
      if (event.actor?.email && !app.users.has(event.actor.email)) {
        app.users.set(event.actor.email, {
          email: event.actor.email,
          orgUnit: 'unknown',
          isAdmin: false,
          scopes: new Set()
        });
      }
    }
  }
}

// Convert to standardized format
const standardizedCatalog = Array.from(appsMap.values()).map(app => {
  // Check for configured access policy
  let appPolicy = null;
  let adminAccessLevel = 'UNCONFIGURED';

  for (const cid of app.clientIds) {
    if (DOMAIN_ACCESS_POLICIES[cid]) {
      appPolicy = DOMAIN_ACCESS_POLICIES[cid];
      adminAccessLevel = appPolicy.accessLevel;
      break;
    }
  }

  return {
    id: app.id,
    displayName: app.displayName,
    vendor: app.vendor,
    domain: app.domain,
    category: app.category,
    isVerified: app.isVerified,
    iconUrl: app.iconUrl,
    riskLevel: app.maxRisk,
    adminAccessLevel: adminAccessLevel,
    accessPolicy: appPolicy,
    totalUsersCount: app.users.size,
    adminUsersCount: Array.from(app.users.values()).filter(u => u.isAdmin).length,
    clientIdsCount: app.clientIds.size,
    clientIds: Array.from(app.clientIds),
    projectNumbers: Array.from(app.projectNumbers),
    scopesCount: app.allScopes.size,
    scopes: Array.from(app.allScopes),
    firstSeen: app.firstSeen,
    lastActive: app.lastActive,
    isNativeApp: app.nativeApp,
    isAnonymous: app.anonymous,
    users: Array.from(app.users.values()).map(u => ({
      email: u.email,
      orgUnit: u.orgUnit,
      isAdmin: u.isAdmin,
      scopes: Array.from(u.scopes)
    }))
  };
}).sort((a, b) => {
  // Sort by risk priority, then by total users count
  const riskOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  if (riskOrder[b.riskLevel] !== riskOrder[a.riskLevel]) {
    return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
  }
  return b.totalUsersCount - a.totalUsersCount;
});

const outputDir = './standardized_catalog';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, 'applications_catalog.json'), JSON.stringify(standardizedCatalog, null, 2));

console.log(`✓ Processed & Standardized ${standardizedCatalog.length} unique application vendor entities.`);
console.log(`Saved standardized catalog to: ${outputDir}/applications_catalog.json`);
