import fs from 'fs';

const users = JSON.parse(fs.readFileSync('./extracted_data/users.json', 'utf8'));
const activeTokens = JSON.parse(fs.readFileSync('./extracted_data/active_tokens.json', 'utf8'));
const auditEvents = JSON.parse(fs.readFileSync('./extracted_data/token_audit_events.json', 'utf8'));

console.log('=== DATA SUMMARY ===');
console.log(`Total Users: ${users.length}`);
console.log(`Total Active Token Grants: ${activeTokens.length}`);
console.log(`Total Audit Events: ${auditEvents.length}\n`);

// 1. Unique Applications from Active Tokens
const appMap = new Map();
const scopeFreq = new Map();

for (const t of activeTokens) {
  const key = t.clientId || 'unknown_client';
  if (!appMap.has(key)) {
    appMap.set(key, {
      clientId: t.clientId,
      displayText: t.displayText,
      userCount: new Set(),
      scopes: new Set(),
      nativeApp: t.nativeApp,
      anonymous: t.anonymous,
    });
  }
  const app = appMap.get(key);
  app.userCount.add(t.userEmail);
  for (const s of t.scopes) {
    app.scopes.add(s);
    scopeFreq.set(s, (scopeFreq.get(s) || 0) + 1);
  }
}

console.log(`=== UNIQUE THIRD-PARTY APPLICATIONS (${appMap.size} found) ===`);
const sortedApps = Array.from(appMap.values())
  .sort((a, b) => b.userCount.size - a.userCount.size);

for (const app of sortedApps) {
  console.log(`App Name: "${app.displayText}"`);
  console.log(`  Client ID: ${app.clientId}`);
  console.log(`  Users Granted: ${app.userCount.size}`);
  console.log(`  Scopes Count: ${app.scopes.size}`);
  console.log(`  Scopes Sample:`, Array.from(app.scopes).slice(0, 3));
  console.log('---');
}

// 2. Audit Event Types & Parameters
console.log('\n=== AUDIT EVENT TYPES IN REPORTS API ===');
const eventNames = new Map();
const paramNames = new Set();
for (const event of auditEvents) {
  for (const e of (event.events || [])) {
    const key = `${e.type}:${e.name}`;
    eventNames.set(key, (eventNames.get(key) || 0) + 1);
    for (const p of (e.parameters || [])) {
      paramNames.add(p.name);
    }
  }
}
console.log('Event names frequency:', Object.fromEntries(eventNames));
console.log('Available event parameters:', Array.from(paramNames));

// 3. High-Risk Scopes Breakdown
const sensitiveKeywords = ['mail', 'gmail', 'drive', 'admin', 'directory', 'cloud-platform', 'contacts', 'calendar'];
const riskyScopes = Array.from(scopeFreq.entries()).filter(([s]) => 
  sensitiveKeywords.some(kw => s.toLowerCase().includes(kw))
).sort((a, b) => b[1] - a[1]);

console.log('\n=== TOP SENSITIVE / HIGH-RISK SCOPES IDENTIFIED ===');
for (const [scope, count] of riskyScopes.slice(0, 15)) {
  console.log(` - ${scope} (granted ${count} times)`);
}
