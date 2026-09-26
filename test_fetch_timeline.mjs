import { google } from 'googleapis';
import fs from 'fs';

const SERVICE_ACCOUNT_FILE = './gam-project-83tkn-bccbdf540703.json';
const ADMIN_USER = 'alister@gafe.co.za';

async function authenticate() {
  const keyData = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf8'));
  const auth = new google.auth.JWT({
    email: keyData.client_email,
    key: keyData.private_key,
    scopes: [
      'https://www.googleapis.com/auth/admin.reports.audit.readonly',
      'https://www.googleapis.com/auth/admin.directory.user.readonly'
    ],
    subject: ADMIN_USER,
  });
  await auth.authorize();
  return auth;
}

async function testFetch() {
  try {
    const auth = await authenticate();
    const reports = google.admin({ version: 'reports_v1', auth });

    const startTime = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
    console.log(`Querying Reports API starting from 180 days ago: ${startTime}`);

    // 1. Admin activity (app access controls, trust/block settings)
    console.log('\n--- Checking Admin audit events ---');
    try {
      const adminRes = await reports.activities.list({
        userKey: 'all',
        applicationName: 'admin',
        startTime,
        maxResults: 100,
      });
      const adminItems = adminRes.data.items || [];
      console.log(`Admin events returned: ${adminItems.length}`);
      if (adminItems.length > 0) {
        console.log('Sample event names in Admin:');
        const eventNames = new Set();
        adminItems.forEach(item => {
          (item.events || []).forEach(e => eventNames.add(e.name));
        });
        console.log(Array.from(eventNames));
        console.log('First Admin Event:', JSON.stringify(adminItems[0], null, 2));
      }
    } catch (e) {
      console.error('Error fetching admin activities:', e.message);
    }

    // 2. Token activity (OAuth grants, authorizations, revokes)
    console.log('\n--- Checking Token audit events ---');
    try {
      const tokenRes = await reports.activities.list({
        userKey: 'all',
        applicationName: 'token',
        startTime,
        maxResults: 50,
      });
      const tokenItems = tokenRes.data.items || [];
      console.log(`Token events returned: ${tokenItems.length}`);
      if (tokenItems.length > 0) {
        console.log('Sample event names in Token:');
        const eventNames = new Set();
        tokenItems.forEach(item => {
          (item.events || []).forEach(e => eventNames.add(e.name));
        });
        console.log(Array.from(eventNames));
        console.log('First Token Event:', JSON.stringify(tokenItems[0], null, 2));
      }
    } catch (e) {
      console.error('Error fetching token activities:', e.message);
    }

  } catch (err) {
    console.error('Fatal error:', err);
  }
}

testFetch();
