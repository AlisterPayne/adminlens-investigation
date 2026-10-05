import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const WORKSPACE_DIR = '/home/alister/MCP-servers/adminlens-investigation';
const DB_PATH = path.join(WORKSPACE_DIR, 'adminlens.db');
const JSON_OUT_PATH = path.join(WORKSPACE_DIR, 'mosaic-next', 'data', 'generative_ai_data.json');
const KEY_PATH = path.join(WORKSPACE_DIR, 'gam-project-83tkn-bccbdf540703.json');

const keyData = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));

const auth = new google.auth.JWT({
  email: keyData.client_email,
  key: keyData.private_key,
  scopes: ['https://www.googleapis.com/auth/admin.reports.audit.readonly'],
  subject: 'alister@gafe.co.za',
});

const reports = google.admin({ version: 'reports_v1', auth });
const db = new DatabaseSync(DB_PATH);

function initTables() {
  console.log('Initializing SQLite tables for Generative AI...');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS gemini_workspace_events (
      id TEXT PRIMARY KEY,
      event_time TEXT NOT NULL,
      unique_qualifier TEXT,
      customer_id TEXT,
      user_email TEXT NOT NULL,
      user_profile_id TEXT,
      caller_type TEXT,
      client_app_name TEXT,
      client_id TEXT,
      is_agentic_action INTEGER DEFAULT 0,
      event_name TEXT NOT NULL,
      event_type TEXT NOT NULL,
      app_name TEXT,
      feature_source TEXT,
      action TEXT,
      event_category TEXT,
      raw_json TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS gemini_notebook_events (
      id TEXT PRIMARY KEY,
      event_time TEXT NOT NULL,
      unique_qualifier TEXT,
      customer_id TEXT,
      user_email TEXT NOT NULL,
      user_profile_id TEXT,
      caller_type TEXT,
      ip_address TEXT,
      country_code TEXT,
      region_code TEXT,
      is_agentic_action INTEGER DEFAULT 0,
      event_name TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_status TEXT,
      notebook_id TEXT,
      notebook_title TEXT,
      notebook_visibility TEXT,
      ai_plan_tier TEXT,
      source_id TEXT,
      source_name TEXT,
      source_type TEXT,
      source_url TEXT,
      studio_artifact_id TEXT,
      studio_artifact_name TEXT,
      studio_artifact_type TEXT,
      raw_json TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_genai_ws_time ON gemini_workspace_events(event_time);
    CREATE INDEX IF NOT EXISTS idx_genai_ws_user ON gemini_workspace_events(user_email);
    CREATE INDEX IF NOT EXISTS idx_genai_ws_app ON gemini_workspace_events(app_name);
    CREATE INDEX IF NOT EXISTS idx_genai_ws_action ON gemini_workspace_events(action);
    CREATE INDEX IF NOT EXISTS idx_genai_ws_agentic ON gemini_workspace_events(is_agentic_action);

    CREATE INDEX IF NOT EXISTS idx_genai_nb_time ON gemini_notebook_events(event_time);
    CREATE INDEX IF NOT EXISTS idx_genai_nb_user ON gemini_notebook_events(user_email);
    CREATE INDEX IF NOT EXISTS idx_genai_nb_notebook ON gemini_notebook_events(notebook_id);
    CREATE INDEX IF NOT EXISTS idx_genai_nb_event ON gemini_notebook_events(event_name);
  `);
}

async function fetchAllEvents(applicationName) {
  console.log(`Fetching all audit activities for ${applicationName}...`);
  let pageToken = undefined;
  const items = [];
  do {
    const params = {
      userKey: 'all',
      applicationName: applicationName,
      maxResults: 100,
    };
    if (pageToken) params.pageToken = pageToken;
    const res = await reports.activities.list(params);
    if (res.data.items) {
      items.push(...res.data.items);
    }
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  console.log(`✓ Fetched ${items.length} records for ${applicationName}`);
  return items;
}

export async function ingestGenerativeAIData() {
  initTables();

  const wsItems = await fetchAllEvents('gemini_in_workspace_apps');
  const nbItems = await fetchAllEvents('gemini_notebook');

  const insertWs = db.prepare(`
    INSERT OR REPLACE INTO gemini_workspace_events (
      id, event_time, unique_qualifier, customer_id, user_email, user_profile_id,
      caller_type, client_app_name, client_id, is_agentic_action, event_name,
      event_type, app_name, feature_source, action, event_category, raw_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertNb = db.prepare(`
    INSERT OR REPLACE INTO gemini_notebook_events (
      id, event_time, unique_qualifier, customer_id, user_email, user_profile_id,
      caller_type, ip_address, country_code, region_code, is_agentic_action,
      event_name, event_type, event_status, notebook_id, notebook_title,
      notebook_visibility, ai_plan_tier, source_id, source_name, source_type,
      source_url, studio_artifact_id, studio_artifact_name, studio_artifact_type, raw_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Ingest Workspace events
  console.log('Writing gemini_in_workspace_apps into database...');
  for (const item of wsItems) {
    const eventTime = item.id?.time;
    const uniqueQualifier = item.id?.uniqueQualifier;
    const customerId = item.id?.customerId;
    const userEmail = item.actor?.email || 'unknown';
    const userProfileId = item.actor?.profileId;
    const callerType = item.actor?.callerType;
    const clientAppName = item.actor?.applicationInfo?.applicationName || null;
    const clientId = item.actor?.applicationInfo?.oauthClientId || null;
    const isAgenticAction = item.isAgenticAction ? 1 : 0;

    for (let idx = 0; idx < (item.events || []).length; idx++) {
      const ev = item.events[idx];
      const eventId = `${uniqueQualifier}_${idx}`;
      let appName = null;
      let featureSource = null;
      let action = null;
      let eventCategory = null;

      for (const p of ev.parameters || []) {
        if (p.name === 'app_name') appName = p.value;
        if (p.name === 'feature_source') featureSource = p.value;
        if (p.name === 'action') action = p.value;
        if (p.name === 'event_category') eventCategory = p.value;
      }

      insertWs.run(
        eventId,
        eventTime,
        uniqueQualifier,
        customerId,
        userEmail,
        userProfileId,
        callerType,
        clientAppName,
        clientId,
        isAgenticAction,
        ev.name,
        ev.type,
        appName,
        featureSource,
        action,
        eventCategory,
        JSON.stringify(item)
      );
    }
  }

  // Ingest Notebook events
  console.log('Writing gemini_notebook into database...');
  for (const item of nbItems) {
    const eventTime = item.id?.time;
    const uniqueQualifier = item.id?.uniqueQualifier;
    const customerId = item.id?.customerId;
    const userEmail = item.actor?.email || 'unknown';
    const userProfileId = item.actor?.profileId;
    const callerType = item.actor?.callerType;
    const ipAddress = item.ipAddress || null;
    const countryCode = item.networkInfo?.regionCode || null;
    const regionCode = item.networkInfo?.subdivisionCode || null;
    const isAgenticAction = item.isAgenticAction ? 1 : 0;

    const resource = item.resourceDetails?.[0];
    const notebookId = resource?.id || item.resourceIds?.[0] || null;
    const notebookTitle = resource?.title || null;

    for (let idx = 0; idx < (item.events || []).length; idx++) {
      const ev = item.events[idx];
      const eventId = `${uniqueQualifier}_${idx}`;
      const eventStatus = ev.status?.eventStatus || null;

      let visibility = null;
      let aiPlanTier = null;
      let sourceId = null;
      let sourceName = null;
      let sourceType = null;
      let sourceUrl = null;
      let studioArtifactId = null;
      let studioArtifactName = null;
      let studioArtifactType = null;

      for (const p of ev.parameters || []) {
        if (p.name === 'visibility') visibility = p.value;
        if (p.name === 'ai_plan_tier') aiPlanTier = p.value;
        if (p.name === 'source_id') sourceId = p.value;
        if (p.name === 'source_name') sourceName = p.value;
        if (p.name === 'source_type') sourceType = p.value;
        if (p.name === 'source_url') sourceUrl = p.value;
        if (p.name === 'studio_artifact_id') studioArtifactId = p.value;
        if (p.name === 'studio_artifact_name') studioArtifactName = p.value;
        if (p.name === 'studio_artifact_type') studioArtifactType = p.value;
      }

      insertNb.run(
        eventId,
        eventTime,
        uniqueQualifier,
        customerId,
        userEmail,
        userProfileId,
        callerType,
        ipAddress,
        countryCode,
        regionCode,
        isAgenticAction,
        ev.name,
        ev.type,
        eventStatus,
        notebookId,
        notebookTitle,
        visibility,
        aiPlanTier,
        sourceId,
        sourceName,
        sourceType,
        sourceUrl,
        studioArtifactId,
        studioArtifactName,
        studioArtifactType,
        JSON.stringify(item)
      );
    }
  }

  console.log('✓ Successfully stored all Generative AI events in SQLite database.');

  // Now build aggregated dataset for frontend
  console.log('Building consolidated data payload for UI...');
  const wsEvents = db.prepare('SELECT * FROM gemini_workspace_events ORDER BY event_time DESC').all();
  const nbEvents = db.prepare('SELECT * FROM gemini_notebook_events ORDER BY event_time DESC').all();

  const totalWorkspaceEvents = wsEvents.length;
  const totalNotebookEvents = nbEvents.length;
  const totalEvents = totalWorkspaceEvents + totalNotebookEvents;

  const allUsers = new Set();
  wsEvents.forEach(e => allUsers.add(e.user_email));
  nbEvents.forEach(e => allUsers.add(e.user_email));

  // Apps breakdown
  const appCounts = {};
  const actionCounts = {};
  const categoryCounts = {};
  let agenticCount = 0;
  let userInitiatedCount = 0;

  wsEvents.forEach(e => {
    if (e.app_name) appCounts[e.app_name] = (appCounts[e.app_name] || 0) + 1;
    if (e.action) actionCounts[e.action] = (actionCounts[e.action] || 0) + 1;
    if (e.event_category) categoryCounts[e.event_category] = (categoryCounts[e.event_category] || 0) + 1;
    if (e.is_agentic_action === 1) agenticCount++;
    else userInitiatedCount++;
  });

  nbEvents.forEach(e => {
    if (e.is_agentic_action === 1) agenticCount++;
    else userInitiatedCount++;
  });

  // Notebooks Aggregation
  const notebookMap = new Map();
  const artifactsList = [];
  const sourcesList = [];

  nbEvents.forEach(e => {
    const nid = e.notebook_id || 'unknown';
    if (!notebookMap.has(nid)) {
      notebookMap.set(nid, {
        id: nid,
        title: e.notebook_title || 'Untitled notebook',
        ownerEmail: e.user_email,
        visibility: e.notebook_visibility || 'private',
        aiPlanTier: e.ai_plan_tier || 'plus',
        firstSeen: e.event_time,
        lastActive: e.event_time,
        eventCount: 0,
        actions: {},
        artifacts: [],
        sources: []
      });
    }
    const nb = notebookMap.get(nid);
    nb.eventCount++;
    if (e.notebook_title && nb.title === 'Untitled notebook') {
      nb.title = e.notebook_title;
    }
    if (e.notebook_visibility) nb.visibility = e.notebook_visibility;
    if (new Date(e.event_time) < new Date(nb.firstSeen)) nb.firstSeen = e.event_time;
    if (new Date(e.event_time) > new Date(nb.lastActive)) nb.lastActive = e.event_time;
    nb.actions[e.event_name] = (nb.actions[e.event_name] || 0) + 1;

    if (e.studio_artifact_id || e.studio_artifact_type) {
      const art = {
        artifactId: e.studio_artifact_id,
        name: e.studio_artifact_name || 'Studio Artifact',
        type: e.studio_artifact_type || 'artifact',
        notebookId: nid,
        notebookTitle: nb.title,
        createdTime: e.event_time,
        userEmail: e.user_email,
        visibility: e.notebook_visibility
      };
      nb.artifacts.push(art);
      artifactsList.push(art);
    }

    if (e.source_name || e.source_url) {
      const src = {
        sourceId: e.source_id,
        name: e.source_name || 'Uploaded Source',
        type: e.source_type || 'url',
        url: e.source_url,
        notebookId: nid,
        notebookTitle: nb.title,
        addedTime: e.event_time,
        userEmail: e.user_email
      };
      nb.sources.push(src);
      sourcesList.push(src);
    }
  });

  // User adoption leaderboard
  const userStats = {};
  allUsers.forEach(u => {
    userStats[u] = {
      email: u,
      workspaceEvents: 0,
      notebookEvents: 0,
      totalEvents: 0,
      agenticEvents: 0,
      appsUsed: new Set(),
      lastActive: null
    };
  });

  wsEvents.forEach(e => {
    const s = userStats[e.user_email];
    if (s) {
      s.workspaceEvents++;
      s.totalEvents++;
      if (e.is_agentic_action === 1) s.agenticEvents++;
      if (e.app_name) s.appsUsed.add(e.app_name);
      if (!s.lastActive || new Date(e.event_time) > new Date(s.lastActive)) {
        s.lastActive = e.event_time;
      }
    }
  });

  nbEvents.forEach(e => {
    const s = userStats[e.user_email];
    if (s) {
      s.notebookEvents++;
      s.totalEvents++;
      if (e.is_agentic_action === 1) s.agenticEvents++;
      s.appsUsed.add('notebooklm');
      if (!s.lastActive || new Date(e.event_time) > new Date(s.lastActive)) {
        s.lastActive = e.event_time;
      }
    }
  });

  const userLeaderboard = Object.values(userStats)
    .map(u => ({ ...u, appsUsed: Array.from(u.appsUsed) }))
    .sort((a, b) => b.totalEvents - a.totalEvents);

  // Daily timeline aggregation (last 90 days)
  const dailyTimelineMap = {};
  [...wsEvents, ...nbEvents].forEach(e => {
    const dateKey = (e.event_time || '').split('T')[0];
    if (dateKey) {
      if (!dailyTimelineMap[dateKey]) {
        dailyTimelineMap[dateKey] = {
          date: dateKey,
          total: 0,
          workspace: 0,
          notebook: 0,
          agentic: 0,
          userInitiated: 0
        };
      }
      dailyTimelineMap[dateKey].total++;
      if (e.notebook_id !== undefined) {
        dailyTimelineMap[dateKey].notebook++;
      } else {
        dailyTimelineMap[dateKey].workspace++;
      }
      if (e.is_agentic_action === 1) {
        dailyTimelineMap[dateKey].agentic++;
      } else {
        dailyTimelineMap[dateKey].userInitiated++;
      }
    }
  });

  const dailyTimeline = Object.values(dailyTimelineMap).sort((a, b) => a.date.localeCompare(b.date));

  const payload = {
    updatedAt: new Date().toISOString(),
    metrics: {
      totalEvents,
      totalWorkspaceEvents,
      totalNotebookEvents,
      totalActiveUsers: allUsers.size,
      agenticEventsCount: agenticCount,
      userInitiatedCount: userInitiatedCount,
      uniqueAppsCount: Object.keys(appCounts).length,
      notebooksCount: notebookMap.size,
      artifactsCount: artifactsList.length,
      sourcesIngestedCount: sourcesList.length
    },
    appCounts,
    actionCounts,
    categoryCounts,
    dailyTimeline,
    userLeaderboard,
    notebooks: Array.from(notebookMap.values()),
    artifacts: artifactsList,
    sources: sourcesList,
    recentWorkspaceEvents: wsEvents.slice(0, 200).map(e => ({
      id: e.id,
      time: e.event_time,
      userEmail: e.user_email,
      appName: e.app_name,
      action: e.action,
      category: e.event_category,
      featureSource: e.feature_source,
      clientAppName: e.client_app_name,
      isAgenticAction: Boolean(e.is_agentic_action)
    })),
    recentNotebookEvents: nbEvents.slice(0, 100).map(e => ({
      id: e.id,
      time: e.event_time,
      userEmail: e.user_email,
      eventName: e.event_name,
      notebookTitle: e.notebook_title || 'Untitled notebook',
      visibility: e.notebook_visibility,
      artifactType: e.studio_artifact_type,
      artifactName: e.studio_artifact_name,
      sourceName: e.source_name,
      sourceType: e.source_type,
      sourceUrl: e.source_url,
      ipAddress: e.ip_address,
      country: e.country_code
    }))
  };

  fs.writeFileSync(JSON_OUT_PATH, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`✓ Generated UI data payload at ${JSON_OUT_PATH}`);
  return payload;
}

if (process.argv[1] && process.argv[1].endsWith('ingest_generative_ai.mjs')) {
  ingestGenerativeAIData()
    .then(data => {
      console.log('Generative AI Ingestion Completed successfully!');
      console.log(`Metrics: Total Events: ${data.metrics.totalEvents} | Users: ${data.metrics.totalActiveUsers} | Notebooks: ${data.metrics.notebooksCount}`);
    })
    .catch(err => {
      console.error('Fatal error during ingestion:', err);
      process.exit(1);
    });
}
