import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('./adminlens.db');

const newScopes = [
  // Apps Script API
  {
    scope_url: 'https://www.googleapis.com/auth/script.projects',
    service_name: 'Apps Script API',
    google_tier: 'Restricted',
    admin_score: 5,
    admin_color: 'Red',
    rationale: 'Apps Script Code Takeover',
    threat_impact: 'Create, modify, and delete Google Apps Script project code and deploy automated execution routines.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/script.projects.readonly',
    service_name: 'Apps Script API',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Codebase & Business Logic Inspection',
    threat_impact: 'Read Apps Script project code, functions, and embedded business automation workflows.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/script.deployments',
    service_name: 'Apps Script API',
    google_tier: 'Restricted',
    admin_score: 4,
    admin_color: 'Orange',
    rationale: 'Deployment & Version Lifecycle Manipulation',
    threat_impact: 'Publish and modify Apps Script versions, web app endpoints, and trigger handlers.'
  },
  // Cloud Billing
  {
    scope_url: 'https://www.googleapis.com/auth/cloud-billing',
    service_name: 'Cloud Billing',
    google_tier: 'Restricted',
    admin_score: 4,
    admin_color: 'Orange',
    rationale: 'Billing Account & Budget Alteration',
    threat_impact: 'Manage Google Cloud billing accounts, link projects to billing accounts, and modify budget alerts.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/cloud-billing.readonly',
    service_name: 'Cloud Billing',
    google_tier: 'Sensitive',
    admin_score: 2,
    admin_color: 'Green',
    rationale: 'Financial Spend & Invoicing Reconnaissance',
    threat_impact: 'View cloud billing accounts, monthly costs, and invoicing metadata without change rights.'
  },
  // Cloud Machine Learning
  {
    scope_url: 'https://www.googleapis.com/auth/cloud-platform.predict',
    service_name: 'Cloud Machine Learning',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'AI Model Inference Execution',
    threat_impact: 'Send input payloads and invoke predictions against deployed Google Cloud ML / Vertex AI models.'
  },
  // Cloud Search
  {
    scope_url: 'https://www.googleapis.com/auth/cloud_search',
    service_name: 'Cloud Search',
    google_tier: 'Restricted',
    admin_score: 4,
    admin_color: 'Orange',
    rationale: 'Enterprise Search Indexing & Exfiltration',
    threat_impact: 'Index, query, and manipulate organization-wide search data repositories and cross-service content.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/cloud_search.query',
    service_name: 'Cloud Search',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Enterprise-Wide Search Query Surveillance',
    threat_impact: "Execute search queries across the domain's entire indexed enterprise data repositories."
  },
  // Meet
  {
    scope_url: 'https://www.googleapis.com/auth/meetings.space.created',
    service_name: 'Meet',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Video Conference Room Provisioning',
    threat_impact: 'Create and configure Google Meet virtual meeting spaces, dial-in settings, and access codes.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/meetings.space.readonly',
    service_name: 'Meet',
    google_tier: 'Sensitive',
    admin_score: 2,
    admin_color: 'Green',
    rationale: 'Meeting Attendance & Space Surveillance',
    threat_impact: 'Read Google Meet space configurations, participant attendance artifacts, and meeting history.'
  }
];

const insertSql = "INSERT OR REPLACE INTO oauth_scope_reference (scope_url, service_name, google_tier, admin_score, admin_color, rationale, threat_impact, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))";
const insertStmt = db.prepare(insertSql);

db.exec('BEGIN TRANSACTION');
for (const s of newScopes) {
  insertStmt.run(s.scope_url, s.service_name, s.google_tier, s.admin_score, s.admin_color, s.rationale, s.threat_impact);
}
db.exec('COMMIT');

console.log('Inserted scopes for remaining 5 services in adminlens.db');

// Sync to scope_reference.json
const allDbScopes = db.prepare('SELECT * FROM oauth_scope_reference ORDER BY scope_url').all();
const jsonPath = './mosaic-next/data/scope_reference.json';
const currentJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Build lookup of current items to preserve active_apps
const currentMap = new Map((currentJson.scopes || []).map(s => [s.scope_url, s]));

const updatedScopesList = allDbScopes.map(s => {
  const existing = currentMap.get(s.scope_url);
  return {
    scope_url: s.scope_url,
    service_name: s.service_name,
    google_tier: s.google_tier,
    admin_score: s.admin_score,
    admin_color: s.admin_color,
    rationale: s.rationale,
    threat_impact: s.threat_impact,
    active_apps_count: existing?.active_apps_count || 0,
    active_apps: existing?.active_apps || []
  };
});

const distinctServices = [...new Set(updatedScopesList.map(s => s.service_name))].sort();

// Recalculate metrics
const restrictedCount = updatedScopesList.filter(s => s.google_tier === 'Restricted').length;
const sensitiveCount = updatedScopesList.filter(s => s.google_tier === 'Sensitive').length;
const nonSensitiveCount = updatedScopesList.filter(s => s.google_tier === 'Non-Sensitive').length;

const scoresBreakdown = {
  critical: updatedScopesList.filter(s => s.admin_score === 5).length,
  high: updatedScopesList.filter(s => s.admin_score === 4).length,
  medium: updatedScopesList.filter(s => s.admin_score === 3).length,
  low: updatedScopesList.filter(s => s.admin_score === 2).length,
  minimal: updatedScopesList.filter(s => s.admin_score === 1).length,
};

const updatedData = {
  metrics: {
    total: updatedScopesList.length,
    restricted: restrictedCount,
    sensitive: sensitiveCount,
    nonSensitive: nonSensitiveCount,
    scores: scoresBreakdown,
    services: distinctServices
  },
  scopes: updatedScopesList
};

fs.writeFileSync(jsonPath, JSON.stringify(updatedData, null, 2), 'utf8');
console.log('Updated mosaic-next/data/scope_reference.json');
console.log('Total scopes now:', updatedScopesList.length);
console.log('Total services now:', distinctServices.length);
console.log('Services list (18):', distinctServices);
