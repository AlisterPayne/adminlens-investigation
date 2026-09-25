/**
 * AdminLens 24-Hour Automated Data Breach Monitoring Engine
 *
 * Runs daily to re-evaluate vendor security posture, time-decayed breach recency
 * brackets (<=3m, 3-6m, 6-12m, >12m), and update Layer 2 Inherent Risk Scores
 * across the SQLite database and catalog JSON files.
 *
 * Usage:
 *   - Direct Run (One-shot / Cron): node breach_monitoring_service.mjs
 *   - Continuous Daemon:            node breach_monitoring_service.mjs --daemon
 */

import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { 
  calculateInherentRisk, 
  calculateBreachPenalty, 
  enrichApplicationRecord 
} from './app_enrichment_service.mjs';

const DB_PATH = './adminlens.db';
const CATALOG_PATHS = [
  './mosaic-next/data/applications_catalog.json',
  './standardized_catalog/applications_catalog.json',
  './public/standardized_catalog.json'
];

export async function runBreachMonitoringEngine(options = {}) {
  const referenceDate = options.referenceDate || new Date();
  console.log(`\n[BREACH ENGINE] Running Daily Automated Scan at ${referenceDate.toISOString()}...`);

  let db = null;
  if (fs.existsSync(DB_PATH)) {
    db = new DatabaseSync(DB_PATH);
  }

  // Find primary catalog
  let primaryCatalogPath = CATALOG_PATHS.find(p => fs.existsSync(p));
  if (!primaryCatalogPath) {
    throw new Error('No application catalog JSON found to evaluate.');
  }

  const catalog = JSON.parse(fs.readFileSync(primaryCatalogPath, 'utf8'));
  console.log(`[BREACH ENGINE] Ingested ${catalog.length} applications from ${primaryCatalogPath}`);

  let updatedCount = 0;
  let transitionsCount = 0;
  const bracketCounts = {
    ACTIVE_3M: 0,
    RECENT_6M: 0,
    PROBATION_12M: 0,
    HISTORICAL: 0,
    NONE: 0
  };

  const updateDbStmt = db ? db.prepare(`
    UPDATE applications
    SET risk_score = ?,
        risk_level = ?,
        risk_score_color = ?,
        scope_risk_score = ?,
        verification_penalty = ?,
        breach_penalty = ?,
        breach_bracket = ?,
        risk_reasons = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `) : null;

  for (const app of catalog) {
    const previousBracket = app.breachBracket || 'NONE';
    const previousScore = app.riskScore;

    // Resolve breaches
    const enriched = enrichApplicationRecord({
      displayName: app.displayName,
      name: app.displayName,
      isVerified: app.isVerified,
      appType: app.deploymentType || app.appType
    });

    const breaches = (app.breaches && app.breaches.length > 0) 
      ? app.breaches 
      : (enriched.breaches || []);

    const effectiveVerified = Boolean(app.isVerified || enriched.isVerified);

    // Compute Inherent Risk with current reference date
    const inherent = calculateInherentRisk({
      scopesList: app.scopes || [],
      isVerified: effectiveVerified,
      breaches,
      appType: app.deploymentType || app.appType,
      referenceDate
    });

    bracketCounts[inherent.breachBracket] = (bracketCounts[inherent.breachBracket] || 0) + 1;

    // Detect bracket or score change
    if (previousBracket !== inherent.breachBracket || previousScore !== inherent.riskScore) {
      transitionsCount++;
      console.log(`[TRANSITION] ${app.displayName}: ` +
        `Score: ${previousScore} -> ${inherent.riskScore} | ` +
        `Bracket: ${previousBracket} -> ${inherent.breachBracket} | ` +
        `Penalty: +${inherent.breachPenalty.toFixed(2)}`);
    }

    // Update catalog item
    app.riskScore = inherent.riskScore;
    app.riskLevel = inherent.riskLevel;
    app.riskScoreColor = inherent.riskScoreColor;
    app.scopeRiskScore = inherent.scopeRiskScore;
    app.verificationPenalty = inherent.verificationPenalty;
    app.breachPenalty = inherent.breachPenalty;
    app.breachBracket = inherent.breachBracket;
    app.breachDaysElapsed = inherent.breachDaysElapsed;
    app.breaches = breaches;
    app.riskReasons = Array.from(new Set([
      ...inherent.riskReasons,
      ...(app.riskReasons || [])
    ]));

    // Update database row if available
    if (updateDbStmt) {
      try {
        updateDbStmt.run(
          inherent.riskScore,
          inherent.riskLevel,
          inherent.riskScoreColor,
          inherent.scopeRiskScore,
          inherent.verificationPenalty,
          inherent.breachPenalty,
          inherent.breachBracket,
          JSON.stringify(app.riskReasons),
          app.id
        );
      } catch (err) {
        // Silently skip if ID format differs
      }
    }

    updatedCount++;
  }

  // Persist updated catalog across all configured paths
  for (const p of CATALOG_PATHS) {
    if (fs.existsSync(path.dirname(p))) {
      fs.writeFileSync(p, JSON.stringify(catalog, null, 2), 'utf8');
      console.log(`[BREACH ENGINE] ✓ Saved updated catalog to ${p}`);
    }
  }

  const summary = {
    scannedAt: referenceDate.toISOString(),
    totalApplications: updatedCount,
    transitionsDetected: transitionsCount,
    bracketDistribution: bracketCounts
  };

  console.log('\n=== 24-HOUR BREACH MONITORING SCAN COMPLETE ===');
  console.log(JSON.stringify(summary, null, 2));

  return summary;
}

// Execution Entrypoint
const isDaemon = process.argv.includes('--daemon');

if (isDaemon) {
  console.log('[BREACH ENGINE] Starting 24-Hour Daemon Service...');
  // Run once immediately on start
  runBreachMonitoringEngine().catch(console.error);

  // Then schedule to repeat every 24 hours (86,400,000 ms)
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
  setInterval(() => {
    runBreachMonitoringEngine().catch(console.error);
  }, TWENTY_FOUR_HOURS_MS);
} else {
  // One-shot execution (cli or cron)
  runBreachMonitoringEngine().catch(err => {
    console.error('[BREACH ENGINE ERROR]:', err);
    process.exit(1);
  });
}
