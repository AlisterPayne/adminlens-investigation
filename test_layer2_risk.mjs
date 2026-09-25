import assert from 'node:assert';
import { 
  calculateInherentRisk, 
  calculateBreachPenalty 
} from './app_enrichment_service.mjs';

console.log('=== RUNNING LAYER 2 INHERENT RISK UNIT TESTS ===\n');

const REFERENCE_DATE = new Date('2026-09-25T12:00:00Z');

// Test 1: Active Breach (<= 90 days / <= 3 months) - Low scope additive (+1.00)
{
  const activeBreachDate = new Date(REFERENCE_DATE.getTime() - (45 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10);
  const result = calculateInherentRisk({
    scopesList: [
      { adminScore: 2 }, // Peak Level 2 -> BaseFloor = 1.00
      { adminScore: 1 }, // Breadth +0.01 -> Scope Score = 1.01
    ],
    isVerified: true,
    breaches: [
      { incidentDate: activeBreachDate, title: 'Active Token Leak', severity: 'CRITICAL' }
    ],
    appType: 'Web Application',
    referenceDate: REFERENCE_DATE
  });

  console.log('Test 1 (Active Breach <= 3m Additive):', result.riskScore, 'Tier:', result.riskLevel);
  assert.strictEqual(result.breachPenalty, 1.00, 'Breach penalty must be +1.00 for active breach');
  assert.strictEqual(result.breachBracket, 'ACTIVE_3M');
  assert.strictEqual(result.riskScore, 2.01, 'Risk score must be 1.01 + 1.00 = 2.01 (No hard floor override)');
  assert.strictEqual(result.riskLevel, 'MEDIUM');
  assert.strictEqual(result.riskScoreColor, 'Yellow');
  console.log('✓ Passed: Additive breach penalty correctly applied without forcing hard floor.');
}

// Test 2: Recent Breach (91 - 180 days / 3 - 6 months) -> +0.60
{
  const recentBreachDate = new Date(REFERENCE_DATE.getTime() - (120 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10);
  const result = calculateInherentRisk({
    scopesList: [{ adminScore: 1 }],
    isVerified: true,
    breaches: [{ incidentDate: recentBreachDate, title: 'Credential Spill' }],
    referenceDate: REFERENCE_DATE
  });

  console.log('\nTest 2 (Recent Breach 3-6m):', result.riskScore, 'Tier:', result.riskLevel);
  assert.strictEqual(result.breachPenalty, 0.60);
  assert.strictEqual(result.breachBracket, 'RECENT_6M');
  assert.strictEqual(result.riskScore, 1.60);
  console.log('✓ Passed: Recent breach penalty +0.60 applied.');
}

// Test 3: Probationary Breach (181 - 365 days / 6 - 12 months) -> +0.30
{
  const probBreachDate = new Date(REFERENCE_DATE.getTime() - (250 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10);
  const result = calculateInherentRisk({
    scopesList: [{ adminScore: 1 }],
    isVerified: true,
    breaches: [{ incidentDate: probBreachDate, title: 'Historical Audit Remediation' }],
    referenceDate: REFERENCE_DATE
  });

  console.log('\nTest 3 (Probationary Breach 6-12m):', result.riskScore, 'Tier:', result.riskLevel);
  assert.strictEqual(result.breachPenalty, 0.30);
  assert.strictEqual(result.breachBracket, 'PROBATION_12M');
  assert.strictEqual(result.riskScore, 1.30);
  console.log('✓ Passed: Probationary breach penalty +0.30 applied.');
}

// Test 4: Historical Breach (> 365 days / > 12 months) -> +0.10
{
  const histBreachDate = new Date(REFERENCE_DATE.getTime() - (800 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10);
  const result = calculateInherentRisk({
    scopesList: [{ adminScore: 1 }],
    isVerified: true,
    breaches: [{ incidentDate: histBreachDate, title: 'Legacy incident' }],
    referenceDate: REFERENCE_DATE
  });

  console.log('\nTest 4 (Historical Breach >12m):', result.riskScore, 'Tier:', result.riskLevel);
  assert.strictEqual(result.breachPenalty, 0.10);
  assert.strictEqual(result.breachBracket, 'HISTORICAL');
  assert.strictEqual(result.riskScore, 1.10);
  console.log('✓ Passed: Historical breach penalty +0.10 applied.');
}

// Test 5: Unverified Publisher (+0.35) with Critical Scope (4.00)
{
  const result = calculateInherentRisk({
    scopesList: [{ adminScore: 5 }], // Peak 5 -> Base floor 4.00
    isVerified: false,
    breaches: [],
    appType: 'Web Application',
    referenceDate: REFERENCE_DATE
  });

  console.log('\nTest 5 (Unverified Publisher + Critical Scope):', result.riskScore, 'Tier:', result.riskLevel);
  assert.strictEqual(result.verificationPenalty, 0.35);
  assert.strictEqual(result.riskScore, 4.35);
  assert.strictEqual(result.riskLevel, 'CRITICAL');
  assert.strictEqual(result.riskScoreColor, 'Red');
  console.log('✓ Passed: Unverified publisher penalty +0.35 applied without arbitrary jump to 5.00.');
}

// Test 6: Unverified Google Apps Script (+0.15)
{
  const result = calculateInherentRisk({
    scopesList: [{ adminScore: 3 }], // Peak 3 -> Base floor 2.00
    isVerified: false,
    breaches: [],
    appType: 'Google Apps Script',
    referenceDate: REFERENCE_DATE
  });

  console.log('\nTest 6 (Unverified Apps Script):', result.riskScore);
  assert.strictEqual(result.verificationPenalty, 0.15);
  assert.strictEqual(result.riskScore, 2.15);
  console.log('✓ Passed: Google Apps Script receives +0.15 internal modifier.');
}

// Test 7: Clamping at 5.00 Maximum
{
  const activeBreachDate = new Date(REFERENCE_DATE.getTime() - (10 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10);
  const result = calculateInherentRisk({
    scopesList: [
      { adminScore: 5 },
      { adminScore: 5 },
      { adminScore: 5 }
    ], // Base floor 4.00 + 0.30 breadth = 4.30
    isVerified: false, // +0.35 -> 4.65
    breaches: [{ incidentDate: activeBreachDate }], // +1.00 -> 5.65 -> clamped to 5.00
    referenceDate: REFERENCE_DATE
  });

  console.log('\nTest 7 (Clamping to 5.00):', result.riskScore);
  assert.strictEqual(result.riskScore, 5.00, 'Score must be clamped at 5.00 max');
  assert.strictEqual(result.riskLevel, 'CRITICAL');
  console.log('✓ Passed: Clamped cleanly at 5.00.');
}

console.log('\n=============================================');
console.log('ALL 7 LAYER 2 INHERENT RISK TESTS PASSED SUCCESSFULLY! ✓');
console.log('=============================================');
