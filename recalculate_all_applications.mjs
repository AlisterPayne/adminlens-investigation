/**
 * AdminLens: Comprehensive Application Risk Recalculator
 *
 * Applies the Layer 2 Central Repository Inherent Risk Model across ALL applications
 * in adminlens.db (2,000+ entries) and synchronizes the frontend catalogs.
 *
 * Formula:
 *   Inherent Risk = Clamp( ScopeScore + VerificationPenalty + BreachPenalty, 1.00, 5.00 )
 */

import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';
import { 
  calculateInherentRisk, 
  enrichApplicationRecord 
} from './app_enrichment_service.mjs';
import { runBreachMonitoringEngine } from './breach_monitoring_service.mjs';

const DB_PATH = './adminlens.db';

export function recalculateAllApplications(referenceDate = new Date()) {
  console.log(`\n============================================================`);
  console.log(`[RECALCULATE] Starting Complete Inherent Risk Recalculation`);
  console.log(`[RECALCULATE] Reference Date: ${referenceDate.toISOString()}`);
  console.log(`============================================================\n`);

  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Database ${DB_PATH} not found.`);
  }

  const db = new DatabaseSync(DB_PATH);

  // 1. Pre-fetch all scopes grouped by application_id for high performance
  console.log('[1/4] Loading application scopes from database...');
  const allScopesRows = db.prepare('SELECT application_id, scope_url, admin_score, risk_level, description FROM application_scopes').all();
  const appScopesMap = new Map();

  for (const row of allScopesRows) {
    if (!appScopesMap.has(row.application_id)) {
      appScopesMap.set(row.application_id, []);
    }
    appScopesMap.get(row.application_id).push({
      scope: row.scope_url,
      adminScore: row.admin_score || 1,
      riskLevel: row.risk_level || 'LOW',
      description: row.description
    });
  }
  console.log(`✓ Cached ${allScopesRows.length} scopes across ${appScopesMap.size} applications.`);

  // 2. Load all applications
  console.log('[2/4] Fetching all applications from database...');
  const applications = db.prepare('SELECT * FROM applications').all();
  console.log(`✓ Found ${applications.length} applications to recalculate.`);

  // 3. Prepare bulk update statement
  const updateStmt = db.prepare(`
    UPDATE applications
    SET risk_score = ?,
        risk_level = ?,
        risk_score_color = ?,
        scope_risk_score = ?,
        verification_penalty = ?,
        breach_penalty = ?,
        breach_bracket = ?,
        breaches_json = ?,
        peak_scope_score = ?,
        breadth_score = ?,
        avg_scope_score = ?,
        risk_reasons = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `);

  console.log('[3/4] Recalculating scores and updating database records...');

  const stats = {
    total: applications.length,
    byLevel: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, MINOR: 0 },
    byColor: { Red: 0, Orange: 0, Yellow: 0, Green: 0, Blue: 0 },
    verifiedCount: 0,
    unverifiedCount: 0,
    breachPenalties: {
      ACTIVE_3M: 0,
      RECENT_6M: 0,
      PROBATION_12M: 0,
      HISTORICAL: 0,
      NONE: 0
    }
  };

  db.exec('BEGIN TRANSACTION');

  for (const app of applications) {
    const scopesList = appScopesMap.get(app.id) || [];

    // Pre-enrich metadata
    const enriched = enrichApplicationRecord({
      displayName: app.display_name,
      name: app.display_name,
      isVerified: Boolean(app.is_verified),
      appType: app.app_type
    });

    const isVerifiedEffective = Boolean(app.is_verified || enriched.isVerified);
    const breaches = (enriched.breaches && enriched.breaches.length > 0) ? enriched.breaches : [];

    // Calculate Layer 2 Inherent Risk
    const inherent = calculateInherentRisk({
      scopesList,
      isVerified: isVerifiedEffective,
      breaches,
      appType: app.app_type,
      referenceDate
    });

    // Update database row
    updateStmt.run(
      inherent.riskScore,
      inherent.riskLevel,
      inherent.riskScoreColor,
      inherent.scopeRiskScore,
      inherent.verificationPenalty,
      inherent.breachPenalty,
      inherent.breachBracket,
      JSON.stringify(breaches),
      inherent.peakScopeScore,
      inherent.breadthScore,
      inherent.avgScopeScore,
      JSON.stringify(inherent.riskReasons),
      app.id
    );

    // Track statistics
    if (isVerifiedEffective) {
      stats.verifiedCount++;
    } else {
      stats.unverifiedCount++;
    }

    stats.byLevel[inherent.riskLevel] = (stats.byLevel[inherent.riskLevel] || 0) + 1;
    stats.byColor[inherent.riskScoreColor] = (stats.byColor[inherent.riskScoreColor] || 0) + 1;
    stats.breachPenalties[inherent.breachBracket] = (stats.breachPenalties[inherent.breachBracket] || 0) + 1;
  }

  db.exec('COMMIT');
  console.log('✓ Database transaction committed successfully.');

  // 4. Synchronize catalog files and re-evaluate
  console.log('\n[4/4] Synchronizing standardized catalog and frontend data...');
  runBreachMonitoringEngine({ referenceDate });

  console.log('\n============================================================');
  console.log('RECALCULATION COMPLETE - SUMMARY REPORT');
  console.log('============================================================');
  console.log(`Total Applications Recalculated: ${stats.total}`);
  console.log(`\nRisk Level Distribution (1.00 - 5.00 Scale):`);
  console.log(`  - CRITICAL (Red)    [4.00 - 5.00]: ${stats.byLevel.CRITICAL}`);
  console.log(`  - HIGH     (Orange) [3.00 - 3.99]: ${stats.byLevel.HIGH}`);
  console.log(`  - MEDIUM   (Yellow) [2.00 - 2.99]: ${stats.byLevel.MEDIUM}`);
  console.log(`  - LOW      (Green/Blue) [< 2.00]: ${stats.byLevel.LOW + (stats.byLevel.MINOR || 0)}`);
  console.log(`\nPublisher Verification Breakdown:`);
  console.log(`  - Verified Publishers (+0.00):   ${stats.verifiedCount}`);
  console.log(`  - Unverified Publishers (+0.35): ${stats.unverifiedCount}`);
  console.log(`\nBreach Recency Ring-Fencing Breakdown:`);
  console.log(`  - Active (<= 3 months)  (+1.00): ${stats.breachPenalties.ACTIVE_3M}`);
  console.log(`  - Recent (3 - 6 months) (+0.60): ${stats.breachPenalties.RECENT_6M}`);
  console.log(`  - Probation (6 - 12 mo) (+0.30): ${stats.breachPenalties.PROBATION_12M}`);
  console.log(`  - Historical (> 12 mo)  (+0.10): ${stats.breachPenalties.HISTORICAL}`);
  console.log(`  - Clean Baseline        (+0.00): ${stats.breachPenalties.NONE}`);
  console.log('============================================================\n');

  return stats;
}

// Auto-run if executed directly
recalculateAllApplications();
