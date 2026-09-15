import { google } from 'googleapis';
import fs from 'fs';

const keyData = JSON.parse(fs.readFileSync('./gam-project-83tkn-bccbdf540703.json', 'utf8'));

const auth = new google.auth.JWT({
  email: keyData.client_email,
  key: keyData.private_key,
  scopes: ['https://www.googleapis.com/auth/admin.reports.audit.readonly'],
  subject: 'alister@gafe.co.za',
});

const reports = google.admin({ version: 'reports_v1', auth });

const params = {
  userKey: 'all',
  applicationName: 'token',
  maxResults: 50,
};

const res = await reports.activities.list(params);
console.log('Token Audit Events Count:', res.data.items ? res.data.items.length : 0);
if (res.data.items && res.data.items.length > 0) {
  console.log('Sample Event:', JSON.stringify(res.data.items[0], null, 2));
}
