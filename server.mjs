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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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
