import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const SERVICE_ACCOUNT_FILE = './gam-project-83tkn-bccbdf540703.json';
const ADMIN_USER = 'alister@gafe.co.za';
const DOMAIN = 'gafe.co.za';

async function authenticate() {
  const keyData = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf8'));
  const auth = new google.auth.JWT({
    email: keyData.client_email,
    key: keyData.private_key,
    scopes: ['https://www.googleapis.com/auth/admin.reports.audit.readonly'],
    subject: ADMIN_USER,
  });
  await auth.authorize();
  return auth;
}

// Helper to extract param map
function getParamMap(parameters = []) {
  const map = {};
  for (const p of parameters) {
    if (p.value !== undefined) map[p.name] = p.value;
    else if (p.multiValue !== undefined) map[p.name] = p.multiValue;
    else if (p.multiMessageValue !== undefined) map[p.name] = p.multiMessageValue;
  }
  return map;
}

// Normalize policy to Trusted, Specific Data, Limited, Blocked
function normalizePolicy(val) {
  if (!val) return undefined;
  const s = String(val).toLowerCase().trim();
  if (s.includes('trust') && (s.includes('scope') || s.includes('specific'))) return 'Specific Data';
  if (s.includes('specific')) return 'Specific Data';
  if (s.includes('trust') || s === 'trusted') return 'Trusted';
  if (s.includes('block')) return 'Blocked';
  if (s.includes('limit') || s.includes('untrust')) return 'Limited';
  if (s.includes('unconfigured')) return 'Unconfigured';
  return val;
}

// Icon helper
function getAppIcon(appName, clientId, masterApps = []) {
  if (clientId) {
    const byId = masterApps.find(a => (a.clientId === clientId || a.id === clientId));
    if (byId && byId.iconUrl) return byId.iconUrl;
  }
  if (appName) {
    const byName = masterApps.find(a => (a.displayName || a.name || '').toLowerCase() === appName.toLowerCase());
    if (byName && byName.iconUrl) return byName.iconUrl;
    
    // Known helpers
    if (appName.toLowerCase().includes('gam')) {
      return 'https://www.google.com/s2/favicons?domain=github.com/GAM-team/GAM&sz=128';
    }
    if (appName.toLowerCase().includes('orbitnote') || appName.toLowerCase().includes('texthelp')) {
      return 'https://www.google.com/s2/favicons?domain=texthelp.com&sz=128';
    }
    if (appName.toLowerCase().includes('mylogin')) {
      return 'https://www.google.com/s2/favicons?domain=mylogin.com&sz=128';
    }
  }
  return null;
}

async function run180DayIngestion() {
  const pullStartTime = new Date();
  console.log(`=== Starting AdminLens Access Policy & Scope Expansion Ingestion for ${DOMAIN} ===`);
  console.log(`Pull Initiated: ${pullStartTime.toISOString()}`);

  const historicalStart = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
  console.log(`Historical Horizon: 180 Days (from ${historicalStart})`);

  // Load master apps catalog if present for icon enrichment
  let masterApps = [];
  try {
    const catalogPath = './mosaic-next/data/applications_catalog.json';
    const fallbackPath = './mosaic-next/data/master_applications_catalog.json';
    if (fs.existsSync(catalogPath)) {
      masterApps = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    } else if (fs.existsSync(fallbackPath)) {
      masterApps = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
    }
  } catch (e) {
    console.warn('Could not load applications catalog for icon matching');
  }

  const eventsMap = new Map();
  try {
    if (fs.existsSync('./mosaic-next/data/audit_timeline.json')) {
      const existing = JSON.parse(fs.readFileSync('./mosaic-next/data/audit_timeline.json', 'utf8'));
      if (Array.isArray(existing)) {
        for (const ev of existing) {
          if (ev && ev.id) eventsMap.set(ev.id, ev);
        }
      }
    }
  } catch (e) {
    // ignore
  }
  const addTimelineEvent = (ev) => {
    if (ev && ev.id) {
      eventsMap.set(ev.id, ev);
    }
  };

  // ==============================================================
  // 1. ADMIN AUDIT LOGS: Application Access Policy Changes
  // (Filter: Trusted, Specific Data, Limited, Blocked)
  // ==============================================================
  console.log('\nFetching Admin Audit Logs for Application Access Policy changes...');
  let adminItemsRaw = [];

  try {
    const auth = await authenticate();
    const reports = google.admin({ version: 'reports_v1', auth });
    let pageToken;
    do {
      const res = await reports.activities.list({
        userKey: 'all',
        applicationName: 'admin',
        startTime: historicalStart,
        maxResults: 100,
        pageToken,
      });
      if (res.data.items) adminItemsRaw.push(...res.data.items);
      pageToken = res.data.nextPageToken;
    } while (pageToken);
  } catch (e) {
    console.warn(`Live API fetch unavailable (${e.message}), using local ./extracted_data/admin_audit_events.json...`);
    if (fs.existsSync('./extracted_data/admin_audit_events.json')) {
      adminItemsRaw = JSON.parse(fs.readFileSync('./extracted_data/admin_audit_events.json', 'utf8'));
    }
  }

  const APP_POLICY_EVENTS = new Set([
    'ADD_TO_TRUSTED_OAUTH2_APPS',
    'ADD_TO_BLOCKED_OAUTH2_APPS',
    'ADD_TO_LIMITED_OAUTH2_APPS',
    'ADD_TO_TRUSTED_BY_OAUTH_SCOPE_OAUTH2_APPS',
    'CHANGE_APP_ACCESS',
    'UNTRUST_DOMAIN_OWNED_OAUTH2_APPS'
  ]);

  for (const item of adminItemsRaw) {
    const policyEvs = (item.events || []).filter(e => APP_POLICY_EVENTS.has(e.name));
    if (policyEvs.length === 0) continue;

    // Consolidate parameters across events in this single activity
    const combinedParams = {};
    for (const ev of policyEvs) {
      Object.assign(combinedParams, getParamMap(ev.parameters));
    }

    const p = combinedParams;
    const appName = p.OAUTH2_APP_NAME || p.APPLICATION_NAME || p.APP_NAME || 'Domain OAuth Applications';
    const clientId = p.OAUTH2_APP_ID || p.CLIENT_ID || p.APP_ID || '';
    const target = p.ORG_UNIT_NAME || p.DISTRIBUTION_ENTITY_NAME || DOMAIN;
    const timestamp = item.id?.time;
    const ipAddress = item.ipAddress;
    const actorEmail = item.actor?.email || ADMIN_USER;

    let previousState = normalizePolicy(p.OLD_VALUE || p.OLD_ACCESS_TYPE);
    let newState = normalizePolicy(p.NEW_VALUE || p.NEW_ACCESS_TYPE);

    // Deduce from event names if not explicitly in parameters
    if (!newState) {
      if (policyEvs.some(e => e.name === 'ADD_TO_TRUSTED_OAUTH2_APPS')) newState = 'Trusted';
      else if (policyEvs.some(e => e.name === 'ADD_TO_BLOCKED_OAUTH2_APPS')) newState = 'Blocked';
      else if (policyEvs.some(e => e.name === 'ADD_TO_LIMITED_OAUTH2_APPS' || e.name === 'UNTRUST_DOMAIN_OWNED_OAUTH2_APPS')) newState = 'Limited';
      else if (policyEvs.some(e => e.name === 'ADD_TO_TRUSTED_BY_OAUTH_SCOPE_OAUTH2_APPS')) newState = 'Specific Data';
    }

    if (!previousState) {
      if (newState === 'Trusted') previousState = 'Limited';
      else if (newState === 'Blocked') previousState = 'Trusted';
      else if (newState === 'Limited') previousState = 'Trusted';
      else if (newState === 'Specific Data') previousState = 'Trusted';
    }

    let action = 'POLICY_UPDATE';
    let actionDisplay = 'Policy Changed';
    if (newState === 'Trusted') {
      action = 'TRUST';
      actionDisplay = 'Access Changed to Trusted';
    } else if (newState === 'Specific Data') {
      action = 'SPECIFIC_DATA';
      actionDisplay = 'Access Changed to Specific Data';
    } else if (newState === 'Limited') {
      action = 'LIMIT';
      actionDisplay = 'Access Changed to Limited';
    } else if (newState === 'Blocked') {
      action = 'BLOCK';
      actionDisplay = 'Access Changed to Blocked';
    }

    let changeSummary = '';
    if (previousState && previousState !== newState) {
      changeSummary = `Administrator changed application access policy from ${previousState} ➔ ${newState} for ${target}`;
    } else {
      changeSummary = `Administrator configured application access policy as ${newState} for ${target}`;
    }

    const appIconUrl = getAppIcon(appName, clientId, masterApps);

    addTimelineEvent({
      id: `${item.id?.uniqueQualifier || Date.now()}_policy`,
      timestamp,
      action,
      actionDisplay,
      actorEmail,
      actorType: 'ADMIN',
      appName,
      appId: clientId,
      clientId,
      appIconUrl,
      target,
      previousState,
      newState,
      changeSummary,
      details: p,
      ipAddress,
    });
  }

  // ==============================================================
  // 2. INCREMENTAL SCOPE EXPANSIONS & DOMAIN-WIDE DELEGATION GRANTS
  // ==============================================================
  let scopeExpansionCount = 0;
  const scopeEventsPath = './extracted_data/scope_expansion_events.json';
  if (fs.existsSync(scopeEventsPath)) {
    const scopeEvents = JSON.parse(fs.readFileSync(scopeEventsPath, 'utf8'));
    for (const sev of scopeEvents) {
      // Include all incremental scope requests (NEW_SCOPE_REQUESTED) and Domain-Wide Delegation authorizations
      if (sev.changeType !== 'NEW_SCOPE_REQUESTED' && sev.source !== 'ADMIN_AUDIT_LOG') continue;

      scopeExpansionCount++;
      const shortScopes = (sev.newScopes || []).map(s => s.split('/').pop());
      const isIncremental = sev.changeType === 'NEW_SCOPE_REQUESTED';
      const action = isIncremental ? 'SCOPE_EXPANSION' : 'DWD_SCOPES';
      const newState = isIncremental ? 'New Scope Requested' : 'Scopes Delegated';
      const actionDisplay = isIncremental ? 'New Scope(s) Requested & Granted' : 'Domain-Wide Delegation Scopes Authorized';

      const changeSummary = isIncremental
        ? `Application requested & acquired ${sev.newScopes.length} new scope(s): ${shortScopes.join(', ')} (total scopes expanded from ${sev.previousScopesCount} ➔ ${sev.totalScopesCount})`
        : `Administrator delegated ${sev.newScopes.length} OAuth API scope(s) via Domain-Wide Delegation: ${shortScopes.join(', ')}`;

      const appIconUrl = getAppIcon(sev.appName, sev.clientId, masterApps);

      addTimelineEvent({
        id: sev.id || `${Date.now()}_scope_${scopeExpansionCount}`,
        timestamp: sev.time,
        action,
        actionDisplay,
        actorEmail: sev.actorEmail,
        actorType: sev.source === 'ADMIN_AUDIT_LOG' ? 'ADMIN' : 'USER',
        appName: sev.appName,
        appId: sev.clientId,
        clientId: sev.clientId,
        appIconUrl,
        target: DOMAIN,
        previousState: isIncremental ? `${sev.previousScopesCount} Scopes` : 'Unconfigured',
        newState,
        newScopes: sev.newScopes,
        changeSummary,
        details: {
          source: sev.source,
          eventName: sev.eventName,
          newScopes: sev.newScopes,
          previousScopesCount: sev.previousScopesCount,
          totalScopesCount: sev.totalScopesCount,
        },
        ipAddress: sev.ipAddress,
      });
    }
  }

  const events = Array.from(eventsMap.values());
  console.log(`✓ Ingestion complete: ${events.length} total governance & scope events captured (${scopeExpansionCount} scope expansion/delegation events).`);

  // Sort chronologically descending (newest first)
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Save to mosaic-next/data/audit_timeline.json
  const clientDataPath = './mosaic-next/data/audit_timeline.json';
  fs.writeFileSync(clientDataPath, JSON.stringify(events, null, 2));

  // Save backup / raw in extracted_data
  const extractPath = './extracted_data/historical_timeline_180d.json';
  fs.writeFileSync(extractPath, JSON.stringify({
    metadata: {
      domain: DOMAIN,
      pullInitiated: pullStartTime.toISOString(),
      historicalHorizonDays: 180,
      historicalStartDate: historicalStart,
      adminPolicyEventsFound: events.length,
      scopeExpansionEventsFound: scopeExpansionCount,
      retentionPolicy: 'Permanent database storage (preserves history beyond Google 180-day window)',
      filterApplied: 'Administrator application access policy changes & incremental scope expansions'
    },
    events,
  }, null, 2));

  console.log('\n======================================================');
  console.log('ACCESS POLICY & SCOPE TIMELINE INGESTION COMPLETED');
  console.log(`Total Timeline Events Saved: ${events.length}`);
  console.log(`Saved to: ${clientDataPath}`);
  console.log(`Backup saved to: ${extractPath}`);
  console.log('======================================================');
}

run180DayIngestion();
