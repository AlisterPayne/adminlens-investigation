import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { AdminLensDatabase } from './db_client.mjs';
import { AdminLensRiskEngine } from './recommendations_engine.mjs';
import { parseCSV, parseRequestedServicesWithScopes } from './ingest_owl_apps_csv.mjs';


const PORT = process.env.PORT || 3333;
const db = new AdminLensDatabase('./adminlens.db');
const riskEngine = new AdminLensRiskEngine('./adminlens.db');


const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, PUT, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. API: Metrics
  if (pathname === '/api/metrics' && req.method === 'GET') {
    const metrics = db.getSummaryMetrics();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(metrics));
    return;
  }

  // 2. API: List Applications
  if (pathname === '/api/applications' && req.method === 'GET') {
    // Read directly from standardized catalog JSON for full rich objects
    const catalogPath = './standardized_catalog/applications_catalog.json';
    if (fs.existsSync(catalogPath)) {
      const data = fs.readFileSync(catalogPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    } else {
      const apps = db.listApplications();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(apps));
    }
    return;
  }

  // 2b. API: Update Application
  if (pathname === '/api/applications' && (req.method === 'PATCH' || req.method === 'PUT')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { id, ...updates } = payload;
        if (!id) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing application id' }));
          return;
        }

        // Update DB
        try {
          db.db.prepare(`
            UPDATE applications
            SET display_name = COALESCE(?, display_name),
                vendor = COALESCE(?, vendor),
                publisher_domain = COALESCE(?, publisher_domain),
                category = COALESCE(?, category),
                is_verified = COALESCE(?, is_verified),
                risk_level = COALESCE(?, risk_level),
                icon_url = COALESCE(?, icon_url),
                store_url = COALESCE(?, store_url),
                app_type = COALESCE(?, app_type),
                updated_at = datetime('now')
            WHERE id = ?
          `).run(
            updates.displayName ?? null,
            updates.vendor ?? null,
            updates.publisherDomain ?? null,
            updates.category ?? null,
            updates.isVerified !== undefined ? (updates.isVerified ? 1 : 0) : null,
            updates.riskLevel ?? null,
            updates.iconUrl ?? null,
            updates.storeUrl ?? null,
            updates.appType ?? null,
            id
          );
        } catch (e) {
          console.warn('DB update warning:', e);
        }

        // Update catalogs
        const catalogPaths = [
          './standardized_catalog/applications_catalog.json',
          './mosaic-next/data/applications_catalog.json',
          './public/standardized_catalog.json'
        ];

        let updatedApp = null;
        for (const catPath of catalogPaths) {
          if (fs.existsSync(catPath)) {
            const apps = JSON.parse(fs.readFileSync(catPath, 'utf8'));
            const idx = apps.findIndex(a => a.id === id);
            if (idx !== -1) {
              apps[idx] = {
                ...apps[idx],
                ...updates,
                displayName: updates.displayName ?? apps[idx].displayName,
                vendor: updates.vendor ?? apps[idx].vendor,
                publisherDomain: updates.publisherDomain ?? apps[idx].publisherDomain,
                category: updates.category ?? apps[idx].category,
                appType: updates.appType ?? apps[idx].appType,
                deploymentType: updates.appType ?? apps[idx].deploymentType,
                isVerified: updates.isVerified !== undefined ? updates.isVerified : apps[idx].isVerified,
                riskLevel: updates.riskLevel ?? apps[idx].riskLevel,
                iconUrl: updates.iconUrl ?? apps[idx].iconUrl,
                storeUrl: updates.storeUrl ?? apps[idx].storeUrl,
                description: updates.description ?? apps[idx].description,
                dataHosting: updates.dataHosting ?? apps[idx].dataHosting,
                compliance: updates.compliance ?? apps[idx].compliance,
              };
              updatedApp = apps[idx];
              fs.writeFileSync(catPath, JSON.stringify(apps, null, 2), 'utf8');
            }
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, application: updatedApp }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 3. API: Application Details
  if (pathname.startsWith('/api/applications/') && req.method === 'GET') {
    const appId = decodeURIComponent(pathname.replace('/api/applications/', ''));
    const details = db.getApplicationDetails(appId);
    if (!details) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Application not found' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(details));
    return;
  }

  // 4. API: Recommendations
  if (pathname === '/api/recommendations' && req.method === 'GET') {
    const recsPath = './recommendations/recommendations.json';
    if (fs.existsSync(recsPath)) {
      const data = fs.readFileSync(recsPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    } else {
      const report = riskEngine.evaluateDomainRisks();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(report));
    }
    return;
  }

  // 5. API: OAuth Scope Threat Reference Matrix
  if (pathname === '/api/scope-reference' && req.method === 'GET') {
    const service = url.searchParams.get('service');
    const tier = url.searchParams.get('tier');
    const minScore = url.searchParams.get('minScore');
    const search = url.searchParams.get('search');

    const scopes = db.getOAuthScopeReferences({ service, tier, minScore, search });
    const metrics = db.getOAuthScopeMetrics();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ metrics, scopes }));
    return;
  }


  // 6. API: Import OWL CSV Upload
  if (pathname === '/api/import-owl-csv' && req.method === 'POST') {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Expected multipart/form-data' }));
      return;
    }

    // Collect raw body
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks);

        // ── Simple multipart boundary parser ──────────────────────────────
        const boundaryMatch = contentType.match(/boundary=([^\s;]+)/);
        if (!boundaryMatch) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'No multipart boundary found' }));
          return;
        }
        const boundary = boundaryMatch[1];
        const delimiter = Buffer.from(`\r\n--${boundary}`);
        const parts = [];
        let start = body.indexOf(`--${boundary}`) + `--${boundary}`.length;

        while (start < body.length) {
          const end = body.indexOf(delimiter, start);
          const part = end === -1 ? body.slice(start) : body.slice(start, end);
          const headerEnd = part.indexOf('\r\n\r\n');
          if (headerEnd === -1) break;
          const headerText = part.slice(0, headerEnd).toString();
          const data = part.slice(headerEnd + 4);
          // Strip trailing \r\n
          const trimmed = data[data.length - 2] === 13 && data[data.length - 1] === 10
            ? data.slice(0, -2) : data;
          const nameMatch = headerText.match(/name="([^"]+)"/);
          const filenameMatch = headerText.match(/filename="([^"]+)"/);
          if (nameMatch) {
            parts.push({ name: nameMatch[1], filename: filenameMatch?.[1], data: trimmed });
          }
          if (end === -1) break;
          start = end + delimiter.length;
        }

        const filePart = parts.find(p => p.name === 'file');
        if (!filePart || !filePart.data) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'No file field in upload' }));
          return;
        }

        const csvText = filePart.data.toString('utf8');

        // ── Detect CSV type by header fingerprint ─────────────────────────
        const firstLine = csvText.split(/\r?\n/)[0];
        const hasSpecificData = firstLine.includes('Scopes for Specific Google Data');
        const hasAccessedMarkers = firstLine.includes('Requested Services with Scopes') && firstLine.includes('Access');
        const csvType = hasSpecificData ? 'configured' : hasAccessedMarkers ? 'accessed' : 'unknown';

        if (csvType === 'unknown') {
          res.writeHead(422, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Unrecognised CSV format — does not match Google Workspace OWL export headers.' }));
          return;
        }

        // ── Write to temp file and ingest ─────────────────────────────────
        const tmpPath = path.join(os.tmpdir(), `owl_import_${Date.now()}.csv`);
        fs.writeFileSync(tmpPath, csvText, 'utf8');

        const rawDb = new DatabaseSync('./adminlens.db');

        const rows = parseCSV(csvText);
        const isConfigured = csvType === 'configured';

        // Clear existing policies if this is the configured CSV
        if (isConfigured) {
          rawDb.exec('DELETE FROM app_access_policies');
        }

        rawDb.exec('BEGIN TRANSACTION');

        let newApps = 0, updatedApps = 0, policiesCount = 0;

        const checkClientId = rawDb.prepare('SELECT application_id FROM application_client_ids WHERE client_id = ?');
        const checkApp = rawDb.prepare('SELECT id FROM applications WHERE id = ? OR display_name = ?');
        const insertApp = rawDb.prepare(`
          INSERT INTO applications (id, display_name, vendor, publisher_domain, category, is_verified,
            icon_url, risk_level, risk_reasons, admin_access_level, total_users_count,
            admin_users_count, first_seen_at, last_active_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const updateAppAccess = rawDb.prepare('UPDATE applications SET admin_access_level = ?, is_verified = MAX(is_verified, ?) WHERE id = ?');
        const updateVerified = rawDb.prepare('UPDATE applications SET is_verified = ?, total_users_count = MAX(total_users_count, ?) WHERE id = ?');
        const insertClientId = rawDb.prepare('INSERT OR IGNORE INTO application_client_ids (client_id, application_id, project_number) VALUES (?, ?, ?)');
        const insertPolicy = rawDb.prepare(`
          INSERT INTO app_access_policies (application_id, client_id, org_unit_path, access_level,
            is_overridden, exempt_from_context_aware_access, allowed_services_json, configured_by, last_policy_update)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const r of rows) {
          const appName = r['App Name'] || 'Unnamed App';
          const clientId = r['Id'];
          if (!clientId) continue;

          const ownership = r['Ownership'] || 'Third party';
          if (ownership.toLowerCase() === 'internal') continue;

          const isVerifiedRaw = r['Verification Status'] || '';
          const isVerified = (isVerifiedRaw.toLowerCase() === 'verified' && !isVerifiedRaw.toLowerCase().includes('not')) ? 1 : 0;
          const usersCount = parseInt(r['Users'] || '0', 10);
          const orgUnit = r['Org Unit'] || '/';

          const accessRaw = r['Access'] || 'UNCONFIGURED';
          const accessLevel = accessRaw.toUpperCase() === 'TRUSTED' ? 'TRUSTED'
            : accessRaw.toUpperCase() === 'LIMITED' ? 'LIMITED'
            : accessRaw.toUpperCase() === 'BLOCKED' ? 'BLOCKED'
            : accessRaw.toUpperCase().includes('SPECIFIC') ? 'SPECIFIC_DATA'
            : 'UNCONFIGURED';

          const { services, scopes } = parseRequestedServicesWithScopes(r['Requested Services with Scopes'] || '');

          // Find existing app
          const existingMapping = checkClientId.get(clientId);
          let targetAppId = existingMapping ? existingMapping.application_id : null;
          if (!targetAppId) {
            const byName = checkApp.get(appName, appName);
            if (byName) targetAppId = byName.id;
          }

          if (targetAppId) {
            if (isConfigured) {
              updateAppAccess.run(accessLevel, isVerified, targetAppId);
            } else {
              updateVerified.run(isVerified, usersCount, targetAppId);
            }
            updatedApps++;
          } else {
            targetAppId = appName || clientId;
            const match = clientId.match(/^(\d+)-/);
            const projNum = match ? match[1] : null;
            const iconUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(appName)}&background=3B82F6&color=fff&size=64`;

            try {
              insertApp.run(
                targetAppId, appName,
                ownership === 'Google owned' ? 'Google LLC' : (appName || 'Third-Party Developer'),
                null,
                ownership === 'Google owned' ? 'Google Workspace Core' : 'Configured SaaS',
                isVerified, iconUrl,
                scopes.length > 5 ? 'MEDIUM' : 'LOW',
                JSON.stringify(['Imported via Google Admin Console CSV']),
                isConfigured ? accessLevel : 'UNCONFIGURED',
                usersCount, 0, null, null
              );
              insertClientId.run(clientId, targetAppId, projNum);
              newApps++;
            } catch (insertErr) {
              console.warn(`Skipping duplicate app ${appName}:`, insertErr.message);
            }
          }

          if (isConfigured) {
            try {
              insertPolicy.run(
                targetAppId, clientId, orgUnit, accessLevel,
                orgUnit !== '/' ? 1 : 0, 0,
                JSON.stringify(services),
                `Google Admin Console CSV Import (${csvType})`,
                new Date().toISOString()
              );
              policiesCount++;
            } catch (policyErr) {
              console.warn('Policy insert warning:', policyErr.message);
            }
          }
        }

        rawDb.exec('COMMIT');
        rawDb.close();

        // Clean up temp file
        try { fs.unlinkSync(tmpPath); } catch (_) {}

        // Regenerate catalog JSON files so the UI picks up new data on next page load
        const catalogPaths = [
          './standardized_catalog/applications_catalog.json',
          './mosaic-next/data/applications_catalog.json'
        ];
        for (const catPath of catalogPaths) {
          if (fs.existsSync(catPath)) {
            // Touch the file's mtime to invalidate any cache
            const now = new Date();
            try { fs.utimesSync(catPath, now, now); } catch (_) {}
          }
        }

        console.log(`✓ OWL CSV import (${csvType}): ${rows.length} rows, ${newApps} new apps, ${updatedApps} updated, ${policiesCount} policies`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          type: csvType,
          rowCount: rows.length,
          counts: { newApps, updatedApps, policiesCount }
        }));
      } catch (err) {
        console.error('Import error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 7. Static Files: public/index.html

  if (pathname === '/' || pathname === '/index.html') {
    const html = fs.readFileSync('./public/index.html', 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Admin Lens Governance Dashboard running!`);
  console.log(`👉 Access URL: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
