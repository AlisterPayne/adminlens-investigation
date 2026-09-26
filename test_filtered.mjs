import { google } from 'googleapis';
import fs from 'fs';

const SERVICE_ACCOUNT_FILE = './gam-project-83tkn-bccbdf540703.json';
const ADMIN_USER = 'alister@gafe.co.za';

async function authenticate() {
  const keyData = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf8'));
  const auth = new google.auth.JWT({
    email: keyData.client_email,
    key: keyData.private_key,
    scopes: ['https://www.googleapis.com/auth/admin.reports.audit.readonly'],
    subject: ADMIN_USER,
  });
  await auth.authorize();
  return auth;
}

async function testFiltered() {
  const auth = await authenticate();
  const reports = google.admin({ version: 'reports_v1', auth });
  const startTime = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();

  // Test token authorizations
  console.log('Testing token "authorize" events...');
  const authRes = await reports.activities.list({
    userKey: 'all',
    applicationName: 'token',
    eventName: 'authorize',
    startTime,
    maxResults: 50,
  });
  console.log(`Authorize items count: ${(authRes.data.items || []).length}`);
  if (authRes.data.items && authRes.data.items.length > 0) {
    console.log('Sample Authorize event:', JSON.stringify(authRes.data.items[0], null, 2));
  }

  // Test token revokes
  console.log('Testing token "revoke" events...');
  try {
    const revokeRes = await reports.activities.list({
      userKey: 'all',
      applicationName: 'token',
      eventName: 'revoke',
      startTime,
      maxResults: 50,
    });
    console.log(`Revoke items count: ${(revokeRes.data.items || []).length}`);
    if (revokeRes.data.items && revokeRes.data.items.length > 0) {
      console.log('Sample Revoke event:', JSON.stringify(revokeRes.data.items[0], null, 2));
    }
  } catch (e) {
    console.log('Error testing revoke:', e.message);
  }
}

testFiltered();
