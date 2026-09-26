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

async function collectOAuthAndAppEvents() {
  const auth = await authenticate();
  const reports = google.admin({ version: 'reports_v1', auth });

  const startTime = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
  console.log(`Starting 180-day audit collection from: ${startTime}`);

  // 1. Fetch all Token events (User authorizations, token grants, revokes)
  console.log('\n--- Fetching Token audit events (180 days) ---');
  let tokenEvents = [];
  let pageToken;
  let pageCount = 0;
  do {
    try {
      const res = await reports.activities.list({
        userKey: 'all',
        applicationName: 'token',
        startTime,
        maxResults: 100,
        pageToken,
      });
      const items = res.data.items || [];
      tokenEvents.push(...items);
      pageToken = res.data.nextPageToken;
      pageCount++;
      process.stdout.write(`Fetched ${tokenEvents.length} token events (page ${pageCount})...\r`);
    } catch (e) {
      console.error('\nError fetching token page:', e.message);
      break;
    }
  } while (pageToken);
  console.log(`\nTotal token events collected: ${tokenEvents.length}`);

  // 2. Fetch all Admin events
  console.log('\n--- Fetching Admin audit events (180 days) ---');
  let adminEvents = [];
  pageToken = undefined;
  pageCount = 0;
  do {
    try {
      const res = await reports.activities.list({
        userKey: 'all',
        applicationName: 'admin',
        startTime,
        maxResults: 100,
        pageToken,
      });
      const items = res.data.items || [];
      adminEvents.push(...items);
      pageToken = res.data.nextPageToken;
      pageCount++;
      process.stdout.write(`Fetched ${adminEvents.length} admin events (page ${pageCount})...\r`);
    } catch (e) {
      console.error('\nError fetching admin page:', e.message);
      break;
    }
  } while (pageToken);
  console.log(`\nTotal admin events collected: ${adminEvents.length}`);

  // Analyze distinct event names in Admin
  const adminEventCounts = {};
  adminEvents.forEach(item => {
    (item.events || []).forEach(ev => {
      adminEventCounts[ev.name] = (adminEventCounts[ev.name] || 0) + 1;
    });
  });
  console.log('\nAdmin Event breakdown:', adminEventCounts);

  // Analyze distinct event names in Token
  const tokenEventCounts = {};
  tokenEvents.forEach(item => {
    (item.events || []).forEach(ev => {
      tokenEventCounts[ev.name] = (tokenEventCounts[ev.name] || 0) + 1;
    });
  });
  console.log('\nToken Event breakdown:', tokenEventCounts);
}

collectOAuthAndAppEvents();
