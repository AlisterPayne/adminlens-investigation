import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const SERVICE_ACCOUNT_FILE = './gam-project-83tkn-bccbdf540703.json';
const ADMIN_USER = 'alister@gafe.co.za';

const SCOPES = [
  'https://www.googleapis.com/auth/admin.directory.user.readonly',
  'https://www.googleapis.com/auth/admin.directory.user.security',
  'https://www.googleapis.com/auth/admin.reports.audit.readonly',
];

async function authenticate() {
  console.log(`[1] Authenticating as ${ADMIN_USER} using service account...`);
  const keyData = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf8'));

  const auth = new google.auth.JWT({
    email: keyData.client_email,
    key: keyData.private_key,
    scopes: SCOPES,
    subject: ADMIN_USER,
  });

  await auth.authorize();
  console.log('✓ Authentication successful!\n');
  return auth;
}

async function extractDirectoryTokens(auth) {
  console.log('[2] Querying Directory API for Users and Active Tokens...');
  const directory = google.admin({ version: 'directory_v1', auth });

  // 1. List users
  const users = [];
  let pageToken = undefined;
  do {
    const res = await directory.users.list({
      customer: 'my_customer',
      maxResults: 100,
      pageToken,
      fields: 'nextPageToken,users(id,primaryEmail,name,suspended,orgUnitPath,isAdmin,isDelegatedAdmin)',
    });
    if (res.data.users) {
      users.push(...res.data.users);
    }
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  console.log(`Found ${users.length} users in domain.`);

  // 2. For each active user, query their tokens
  const allTokens = [];
  let userCountWithTokens = 0;
  for (const user of users) {
    if (user.suspended) continue;
    try {
      const tokenRes = await directory.tokens.list({
        userKey: user.primaryEmail,
      });
      const items = tokenRes.data.items || [];
      if (items.length > 0) {
        userCountWithTokens++;
        for (const token of items) {
          allTokens.push({
            userEmail: user.primaryEmail,
            userId: user.id,
            userOrgUnit: user.orgUnitPath,
            isUserAdmin: Boolean(user.isAdmin || user.isDelegatedAdmin),
            clientId: token.clientId,
            displayText: token.displayText,
            scopes: token.scopes || [],
            nativeApp: token.nativeApp,
            anonymous: token.anonymous,
            etag: token.etag,
          });
        }
      }
    } catch (err) {
      console.warn(`  ! Could not fetch tokens for ${user.primaryEmail}: ${err.message}`);
    }
  }

  console.log(`✓ Total active tokens collected: ${allTokens.length} across ${userCountWithTokens} users.\n`);
  return { users, allTokens };
}

async function extractReportAuditLogs(auth) {
  console.log('[3] Querying Reports API for Token Audit Activity (applicationName=token)...');
  const reports = google.admin({ version: 'reports_v1', auth });

  const activities = [];
  let pageToken = undefined;
  let count = 0;

  try {
    do {
      const params = {
        userKey: 'all',
        applicationName: 'token',
        maxResults: 100,
      };
      if (pageToken) {
        params.pageToken = pageToken;
      }

      const res = await reports.activities.list(params);

      if (res.data.items) {
        activities.push(...res.data.items);
      }
      pageToken = res.data.nextPageToken;
      count += res.data.items ? res.data.items.length : 0;
      if (count >= 1000) {
        console.log(`  Fetched ${count} audit events (sample threshold reached)...`);
        break;
      }
    } while (pageToken);
  } catch (err) {
    console.error(`  ! Error querying Reports API: ${err.message}`);
  }

  console.log(`✓ Total token audit activity events collected: ${activities.length}\n`);
  return activities;
}

async function extractAdminAuditLogs(auth) {
  console.log('[4] Querying Reports API for Admin Configuration Events (applicationName=admin)...');
  const reports = google.admin({ version: 'reports_v1', auth });

  const activities = [];
  let pageToken = undefined;

  try {
    const params = {
      userKey: 'all',
      applicationName: 'admin',
      maxResults: 100,
    };
    const res = await reports.activities.list(params);
    if (res.data.items) {
      activities.push(...res.data.items);
    }
  } catch (err) {
    console.warn(`  ! Could not fetch Admin audit logs: ${err.message}`);
  }

  console.log(`✓ Total admin configuration events collected: ${activities.length}\n`);
  return activities;
}

async function main() {
  try {
    const auth = await authenticate();
    
    // Directory API
    const { users, allTokens } = await extractDirectoryTokens(auth);

    // Reports API
    const auditActivities = await extractReportAuditLogs(auth);
    const adminActivities = await extractAdminAuditLogs(auth);

    // Output results to disk for inspection
    const outputDir = './extracted_data';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(path.join(outputDir, 'users.json'), JSON.stringify(users, null, 2));
    fs.writeFileSync(path.join(outputDir, 'active_tokens.json'), JSON.stringify(allTokens, null, 2));
    fs.writeFileSync(path.join(outputDir, 'token_audit_events.json'), JSON.stringify(auditActivities, null, 2));
    fs.writeFileSync(path.join(outputDir, 'admin_audit_events.json'), JSON.stringify(adminActivities, null, 2));

    console.log('==============================================');
    console.log('EXTRACTION COMPLETE');
    console.log(`Files saved to ${outputDir}/:`);
    console.log(` - users.json (${users.length} users)`);
    console.log(` - active_tokens.json (${allTokens.length} active token grants)`);
    console.log(` - token_audit_events.json (${auditActivities.length} token audit events)`);
    console.log(` - admin_audit_events.json (${adminActivities.length} admin configuration events)`);
    console.log('==============================================');

  } catch (err) {
    console.error('\n❌ Execution failed:', err);
  }
}

main();
