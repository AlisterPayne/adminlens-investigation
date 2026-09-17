import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const CSV_PATH = fs.existsSync('./owl_apps_configured_apps.csv') 
  ? './owl_apps_configured_apps.csv' 
  : './owl_apps.csv';
const DB_PATH = './adminlens.db';

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

function parseCSVLine(line) {
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
    services[serviceName] = scopes.length;
    allScopes.push(...scopes);
  }

  return { services, scopes: Array.from(new Set(allScopes)) };
}

export function ingestOwlAppsCsv(csvPath = CSV_PATH, dbPath = DB_PATH) {
  if (!fs.existsSync(csvPath)) {
    console.error(`File not found: ${csvPath}`);
    return null;
  }

  console.log(`[1] Parsing ${csvPath}...`);
  const rawText = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(rawText);
  console.log(`✓ Parsed ${rows.length} policy rows from CSV.`);

  const db = new DatabaseSync(dbPath);

  const checkApp = db.prepare('SELECT * FROM applications WHERE id = ?');
  const checkClientId = db.prepare('SELECT application_id FROM application_client_ids WHERE client_id = ?');

  const insertApp = db.prepare(`
    INSERT INTO applications (
      id, display_name, vendor, publisher_domain, category, is_verified,
      icon_url, risk_level, risk_reasons, admin_access_level, total_users_count,
      admin_users_count, first_seen_at, last_active_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const updateAppAccess = db.prepare(`
    UPDATE applications SET admin_access_level = ? WHERE id = ?
  `);

  const insertClientId = db.prepare(`
    INSERT OR IGNORE INTO application_client_ids (client_id, application_id, project_number)
    VALUES (?, ?, ?)
  `);

  const insertPolicy = db.prepare(`
    INSERT INTO app_access_policies (
      application_id, client_id, org_unit_path, access_level,
      is_overridden, exempt_from_context_aware_access, allowed_services_json,
      configured_by, last_policy_update
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const clearExistingPolicies = db.prepare('DELETE FROM app_access_policies');
  clearExistingPolicies.run();

  let newAppsCount = 0;
  let updatedAppsCount = 0;
  let policiesCount = 0;

  db.exec('BEGIN TRANSACTION');

  for (const r of rows) {
    const appName = r['App Name'] || 'Unnamed App';
    const clientId = r['Id'];
    if (!clientId) continue;

    const accessRaw = r['Access'] || 'UNCONFIGURED';
    const accessLevel = accessRaw.toUpperCase() === 'TRUSTED' ? 'TRUSTED' :
                       (accessRaw.toUpperCase() === 'LIMITED' ? 'LIMITED' :
                       (accessRaw.toUpperCase() === 'BLOCKED' ? 'BLOCKED' :
                       (accessRaw.toUpperCase().includes('SPECIFIC') ? 'SPECIFIC_DATA' : 'UNCONFIGURED')));

    const orgUnit = r['Org Unit'] || '/';
    const isOverridden = orgUnit !== '/';
    const usersCount = parseInt(r['Users'] || '0', 10);
    const isVerified = (r['Verification Status'] || '').toLowerCase().includes('verified') ? 1 : 0;
    const ownership = r['Ownership'] || 'Third party';

    const { services, scopes } = parseRequestedServicesWithScopes(r['Requested Services with Scopes']);

    const existingMapping = checkClientId.get(clientId);
    let targetAppId = existingMapping ? existingMapping.application_id : null;

    if (!targetAppId) {
      const byId = checkApp.get(appName);
      if (byId) {
        targetAppId = byId.id;
      }
    }

    if (targetAppId) {
      updateAppAccess.run(accessLevel, targetAppId);
      updatedAppsCount++;
    } else {
      targetAppId = appName || clientId;
      const match = clientId.match(/^(\d+)-/);
      const projNum = match ? match[1] : null;

      insertApp.run(
        targetAppId,
        appName,
        ownership === 'Internal' ? 'Internal Domain Tool' : (appName || 'Third-Party Developer'),
        null,
        ownership === 'Internal' ? 'Admin & Automation' : 'Configured SaaS',
        isVerified,
        'https://ui-avatars.com/api/?name=' + encodeURIComponent(appName) + '&background=3B82F6&color=fff',
        scopes.length > 5 ? 'MEDIUM' : 'LOW',
        JSON.stringify(['Configured via Google Admin Console App Access Control']),
        accessLevel,
        usersCount,
        0,
        null,
        null
      );

      insertClientId.run(clientId, targetAppId, projNum);
      newAppsCount++;
    }

    insertPolicy.run(
      targetAppId,
      clientId,
      orgUnit,
      accessLevel,
      isOverridden ? 1 : 0,
      0,
      JSON.stringify(services),
      `Google Admin Console Export (${path.basename(csvPath)})`,
      new Date().toISOString()
    );
    policiesCount++;
  }

  db.exec('COMMIT');

  console.log(`✓ Successfully ingested App Access Control baseline:`);
  console.log(`  - Total Policies Recorded: ${policiesCount}`);
  console.log(`  - Existing Apps Updated: ${updatedAppsCount}`);
  console.log(`  - Pre-Configured Apps Added: ${newAppsCount}`);

  return { policiesCount, updatedAppsCount, newAppsCount };
}

if (process.argv[1]?.endsWith('ingest_owl_apps_csv.mjs')) {
  ingestOwlAppsCsv();
}
