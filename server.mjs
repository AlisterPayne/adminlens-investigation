import http from 'http';
import fs from 'fs';
import path from 'path';
import { AdminLensDatabase } from './db_client.mjs';
import { AdminLensRiskEngine } from './recommendations_engine.mjs';

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

  // 6. Static Files: public/index.html
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
