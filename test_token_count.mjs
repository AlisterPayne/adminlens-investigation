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

async function countTokenAuthAndRevoke() {
  const auth = await authenticate();
  const reports = google.admin({ version: 'reports_v1', auth });
  const startTime = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();

  // Authorize count
  let authCount = 0;
  let pageToken;
  do {
    const res = await reports.activities.list({
      userKey: 'all',
      applicationName: 'token',
      eventName: 'authorize',
      startTime,
      maxResults: 100,
      pageToken,
    });
    authCount += (res.data.items || []).length;
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  console.log(`Token Authorize events (180 days): ${authCount}`);

  // Revoke count
  let revokeCount = 0;
  pageToken = undefined;
  do {
    const res = await reports.activities.list({
      userKey: 'all',
      applicationName: 'token',
      eventName: 'revoke',
      startTime,
      maxResults: 100,
      pageToken,
    });
    revokeCount += (res.data.items || []).length;
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  console.log(`Token Revoke events (180 days): ${revokeCount}`);
}

countTokenAuthAndRevoke();
