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

async function inspectAdminAppEvents() {
  const auth = await authenticate();
  const reports = google.admin({ version: 'reports_v1', auth });

  const startTime = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
  let pageToken;
  const matchedEvents = [];

  do {
    const res = await reports.activities.list({
      userKey: 'all',
      applicationName: 'admin',
      startTime,
      maxResults: 100,
      pageToken,
    });
    const items = res.data.items || [];
    for (const item of items) {
      for (const ev of (item.events || [])) {
        if (
          ev.name.includes('OAUTH') ||
          ev.name.includes('APP') ||
          ev.name.includes('3LO') ||
          ev.name.includes('APPLICATION')
        ) {
          matchedEvents.push({
            id: item.id,
            actor: item.actor,
            eventName: ev.name,
            type: ev.type,
            parameters: ev.parameters,
          });
        }
      }
    }
    pageToken = res.data.nextPageToken;
    // Let's cap page fetch for test
    if (matchedEvents.length > 50) break;
  } while (pageToken);

  console.log(`Matched App/OAuth admin events: ${matchedEvents.length}`);
  if (matchedEvents.length > 0) {
    console.log('Sample matched events:', JSON.stringify(matchedEvents.slice(0, 5), null, 2));
  }
}

inspectAdminAppEvents();
