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

async function countAdminEvents() {
  const auth = await authenticate();
  const reports = google.admin({ version: 'reports_v1', auth });
  const startTime = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();

  let pageToken;
  let totalAdmin = 0;
  const appRelated = [];

  const APP_EVENT_NAMES = new Set([
    'ADD_TO_TRUSTED_OAUTH2_APPS',
    'ADD_TO_BLOCKED_OAUTH2_APPS',
    'ADD_TO_LIMITED_OAUTH2_APPS',
    'ADD_TO_TRUSTED_BY_OAUTH_SCOPE_OAUTH2_APPS',
    'CHANGE_APP_ACCESS',
    'UNTRUST_DOMAIN_OWNED_OAUTH2_APPS',
    'REVOKE_3LO_TOKEN',
    'ADD_MOBILE_APPLICATION_TO_WHITELIST',
    'CHANGE_APPLICATION_SETTING',
    'CREATE_APPLICATION_SETTING'
  ]);

  do {
    const res = await reports.activities.list({
      userKey: 'all',
      applicationName: 'admin',
      startTime,
      maxResults: 100,
      pageToken,
    });
    const items = res.data.items || [];
    totalAdmin += items.length;
    for (const item of items) {
      for (const ev of (item.events || [])) {
        if (APP_EVENT_NAMES.has(ev.name)) {
          appRelated.push({
            id: item.id,
            actor: item.actor,
            ipAddress: item.ipAddress,
            event: ev
          });
        }
      }
    }
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  console.log(`Total Admin events in 180 days: ${totalAdmin}`);
  console.log(`Total App-related Admin events: ${appRelated.length}`);
  if (appRelated.length > 0) {
    console.log('Sample App Admin events:', JSON.stringify(appRelated.slice(0, 3), null, 2));
  }
}

countAdminEvents();
