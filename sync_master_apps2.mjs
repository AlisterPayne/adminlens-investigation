import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

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

const csvPath = path.resolve('master_apps2.csv');
const csvText = fs.readFileSync(csvPath, 'utf-8');
const rows = parseCSV(csvText);

// Map by ID
const csvMap = new Map();
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  const appName = r[0];
  const type = r[1];
  const id = r[2];
  const verification = r[3];
  const reqServices = r[4];
  const reqServicesWithScopes = r[5];
  const ownership = r[6];

  if (!csvMap.has(id)) {
    csvMap.set(id, {
      appName,
      type,
      id,
      isVerified: verification === 'Verified',
      ownership
    });
  }
}

console.log(`Loaded ${csvMap.size} unique apps from master_apps2.csv.`);

const ALLOWED_TYPES = new Set(['Web Application', 'Android', 'iOS', 'Unknown Application Type']);
const ALLOWED_OWNERSHIP = new Set(['Third party', 'Google owned', 'Unknown']);

function normalizeType(dep, appT) {
  const combined = `${dep || ''} ${appT || ''}`.toLowerCase();
  if (combined.includes('android')) return 'Android';
  if (combined.includes('ios') || combined.includes('apple')) return 'iOS';
  if (combined.includes('web') || combined.includes('chrome') || combined.includes('cloud') || combined.includes('service') || combined.includes('tool') || combined.includes('portal') || combined.includes('add-on') || combined.includes('extension')) return 'Web Application';
  return 'Unknown Application Type';
}

function normalizeOwnership(own) {
  if (!own) return 'Unknown';
  const o = own.toLowerCase();
  if (o.includes('google')) return 'Google owned';
  if (o.includes('third')) return 'Third party';
  return 'Unknown';
}

function cleanDisplayName(name, newType) {
  if (!name) return name;
  let cleaned = name
    .replace(/\(Android App\)/g, '(Android)')
    .replace(/\(iOS App\)/g, '(iOS)')
    .replace(/\(Chrome Extension\)/g, `(${newType})`)
    .replace(/\(Staging \/ Dev\)/g, `(${newType})`);
  return cleaned;
}

const jsonFiles = [
  './mosaic-next/data/applications_catalog.json',
  './standardized_catalog/applications_catalog.json',
  './public/standardized_catalog.json'
];

let stats = {
  typeUpdates: 0,
  ownershipUpdates: 0,
  verifiedUpdates: 0,
  displayNameUpdates: 0
};

for (const relPath of jsonFiles) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) continue;

  const apps = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));

  for (const app of apps) {
    const csvEntry = csvMap.get(app.id);

    let targetType = csvEntry ? csvEntry.type : normalizeType(app.deploymentType, app.appType);
    if (!ALLOWED_TYPES.has(targetType)) targetType = normalizeType(targetType, '');

    let targetOwnership = csvEntry ? csvEntry.ownership : normalizeOwnership(app.ownership);
    if (!ALLOWED_OWNERSHIP.has(targetOwnership)) targetOwnership = normalizeOwnership(targetOwnership);

    if (app.deploymentType !== targetType || app.appType !== targetType) {
      app.deploymentType = targetType;
      app.appType = targetType;
      stats.typeUpdates++;
    }

    if (app.ownership !== targetOwnership) {
      app.ownership = targetOwnership;
      stats.ownershipUpdates++;
    }

    // Verification
    if (csvEntry && Boolean(app.isVerified) !== csvEntry.isVerified) {
      app.isVerified = csvEntry.isVerified;
      stats.verifiedUpdates++;
    }

    // Google provenance flag
    app.isGoogleService = targetOwnership.toLowerCase() === 'google owned';

    // Clean display name suffixes if mismatched
    const updatedName = cleanDisplayName(app.displayName, targetType);
    if (updatedName !== app.displayName) {
      app.displayName = updatedName;
      stats.displayNameUpdates++;
    }

    // Also sanitize sibling deployments
    if (Array.isArray(app.siblingDeployments)) {
      for (const sib of app.siblingDeployments) {
        const sibCsv = csvMap.get(sib.id);
        const sibType = sibCsv ? sibCsv.type : normalizeType(sib.deploymentType, '');
        sib.deploymentType = sibType;
        sib.displayName = cleanDisplayName(sib.displayName, sibType);
      }
    }
  }

  fs.writeFileSync(fullPath, JSON.stringify(apps, null, 2), 'utf-8');
  console.log(`Updated JSON file: ${relPath}`);
}

// Update adminlens.db
const dbPath = path.resolve('adminlens.db');
if (fs.existsSync(dbPath)) {
  const db = new DatabaseSync(dbPath);
  const apps = db.prepare('SELECT id, app_type, ownership, is_verified, display_name FROM applications').all();

  const updateStmt = db.prepare(`
    UPDATE applications
    SET app_type = ?,
        ownership = ?,
        is_verified = ?,
        is_google_service = ?,
        display_name = ?
    WHERE id = ?
  `);

  let dbUpdated = 0;
  for (const app of apps) {
    const csvEntry = csvMap.get(app.id);

    let targetType = csvEntry ? csvEntry.type : normalizeType(app.app_type, '');
    if (!ALLOWED_TYPES.has(targetType)) targetType = normalizeType(targetType, '');

    let targetOwnership = csvEntry ? csvEntry.ownership : normalizeOwnership(app.ownership);
    if (!ALLOWED_OWNERSHIP.has(targetOwnership)) targetOwnership = normalizeOwnership(targetOwnership);

    const isVerified = csvEntry ? (csvEntry.isVerified ? 1 : 0) : app.is_verified;
    const isGoogleService = targetOwnership.toLowerCase() === 'google owned' ? 1 : 0;
    const updatedName = cleanDisplayName(app.display_name, targetType);

    updateStmt.run(targetType, targetOwnership, isVerified, isGoogleService, updatedName, app.id);
    dbUpdated++;
  }
  console.log(`Updated ${dbUpdated} applications in adminlens.db.`);
}

console.log('Sync complete with stats:', stats);
