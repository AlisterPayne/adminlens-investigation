import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const DB_PATH = './adminlens.db';
const CATALOG_PATHS = [
  './mosaic-next/data/applications_catalog.json',
  './standardized_catalog/applications_catalog.json',
  './public/standardized_catalog.json'
];

function parseCsv(file) {
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/);
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
    const r = {};
    headers.forEach((h, idx) => r[h] = vals[idx] ? vals[idx].trim() : '');
    rows.push(r);
  }
  return rows;
}

const master = parseCsv(fs.existsSync('master_apps2.csv') ? 'master_apps2.csv' : 'master_apps.csv');
const accessed = parseCsv('owl_apps_accessed_apps.csv');
const configured = parseCsv('owl_apps_configured_apps.csv');

const ownershipById = new Map();
for (const r of master) { if (r.Id) ownershipById.set(r.Id, r.Ownership || 'Unknown'); }
for (const r of accessed) { if (r.Id) ownershipById.set(r.Id, r.Ownership || 'Unknown'); }
for (const r of configured) { if (r.Id) ownershipById.set(r.Id, r.Ownership || 'Unknown'); }

export function isInternalApplication(app) {
  const csvOwnership = (ownershipById.get(app.id) || '').toLowerCase();
  if (csvOwnership === 'internal') return true;

  const v = (app.vendor || '').toLowerCase();
  const c = (app.category || '').toLowerCase();
  const desc = (app.description || '').toLowerCase();

  if (v.includes('internal') || c.includes('internal') || desc.includes('internal domain tool') || desc.includes('custom google apps script')) {
    return true;
  }
  if (Array.isArray(app.compliance) && app.compliance.includes('Internal Tenant Only')) {
    return true;
  }
  return false;
}

export function classifyOwnership(app) {
  const csvOwnership = (ownershipById.get(app.id) || '').trim();
  const v = (app.vendor || '').toLowerCase();
  const c = (app.category || '').toLowerCase();

  if (
    csvOwnership.toLowerCase() === 'google owned' ||
    app.isGoogleService ||
    v === 'google llc' ||
    v.startsWith('google') ||
    c === 'google services' ||
    c === 'google workspace core'
  ) {
    return 'Google Owned';
  }

  if (csvOwnership.toLowerCase() === 'unknown') {
    return 'Unknown';
  }

  return 'Third Party';
}

export function removeInternalAppsAndTagOwnership() {
  console.log('=== Cleaning backend application repository: Removing Internal applications ===');

  let internalIds = new Set();

  for (const catPath of CATALOG_PATHS) {
    if (!fs.existsSync(catPath)) continue;

    const catalog = JSON.parse(fs.readFileSync(catPath, 'utf8'));
    const initialCount = catalog.length;

    const internalApps = catalog.filter(isInternalApplication);
    internalApps.forEach(a => internalIds.add(a.id));

    const remaining = catalog.filter(a => !isInternalApplication(a)).map(a => ({
      ...a,
      ownership: classifyOwnership(a)
    }));

    fs.writeFileSync(catPath, JSON.stringify(remaining, null, 2), 'utf8');

    const breakdown = {};
    remaining.forEach(a => {
      breakdown[a.ownership] = (breakdown[a.ownership] || 0) + 1;
    });

    console.log(`✓ Updated ${catPath}:`);
    console.log(`   Initial: ${initialCount} -> Remaining: ${remaining.length} (Removed ${internalApps.length} internal)`);
    console.log(`   Ownership Breakdown:`, breakdown);
  }

  // Clean SQLite database
  if (fs.existsSync(DB_PATH)) {
    const db = new DatabaseSync(DB_PATH);

    // Ensure ownership column exists
    const tableInfo = db.prepare("PRAGMA table_info(applications)").all();
    const hasOwnershipCol = tableInfo.some(col => col.name === 'ownership');
    if (!hasOwnershipCol) {
      db.exec("ALTER TABLE applications ADD COLUMN ownership TEXT DEFAULT 'Third Party'");
      console.log("✓ Added 'ownership' column to SQLite applications table.");
    }

    // Delete internal applications
    db.exec('BEGIN TRANSACTION');
    let deletedAppsCount = 0;
    for (const id of internalIds) {
      db.prepare("DELETE FROM application_scopes WHERE application_id = ?").run(id);
      db.prepare("DELETE FROM application_client_ids WHERE application_id = ?").run(id);
      db.prepare("DELETE FROM app_access_policies WHERE application_id = ?").run(id);
      db.prepare("DELETE FROM grants WHERE client_id = ?").run(id);
      db.prepare("DELETE FROM audit_events WHERE client_id = ?").run(id);
      const res = db.prepare("DELETE FROM applications WHERE id = ?").run(id);
      deletedAppsCount += res.changes;
    }

    // Update remaining applications ownership
    const remainingApps = db.prepare("SELECT id, display_name, vendor, category, is_google_service FROM applications").all();
    const updateOwnershipStmt = db.prepare("UPDATE applications SET ownership = ? WHERE id = ?");

    const dbBreakdown = {};
    for (const app of remainingApps) {
      const ownership = classifyOwnership({
        id: app.id,
        displayName: app.display_name,
        vendor: app.vendor,
        category: app.category,
        isGoogleService: Boolean(app.is_google_service)
      });
      updateOwnershipStmt.run(ownership, app.id);
      dbBreakdown[ownership] = (dbBreakdown[ownership] || 0) + 1;
    }

    db.exec('COMMIT');
    console.log(`✓ Cleaned SQLite Database (${DB_PATH}):`);
    console.log(`   Deleted internal apps: ${deletedAppsCount}`);
    console.log(`   Remaining apps in DB: ${remainingApps.length}`);
    console.log(`   DB Ownership Breakdown:`, dbBreakdown);
  }

  console.log('✓ Successfully removed all internal applications. Only Google Owned, Third Party, and Unknown apps remain.');
}

if (process.argv[1]?.endsWith('remove_internal_apps.mjs')) {
  removeInternalAppsAndTagOwnership();
}
