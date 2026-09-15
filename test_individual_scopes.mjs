import { google } from 'googleapis';
import fs from 'fs';

const keyData = JSON.parse(fs.readFileSync('./gam-project-83tkn-bccbdf540703.json', 'utf8'));

const testScopes = [
  'https://www.googleapis.com/auth/admin.reports.audit.readonly',
  'https://www.googleapis.com/auth/admin.reports.usage.readonly',
  'https://www.googleapis.com/auth/admin.directory.user.readonly',
  'https://www.googleapis.com/auth/admin.directory.user',
  'https://www.googleapis.com/auth/admin.directory.user.security',
  'https://www.googleapis.com/auth/admin.directory.group.readonly',
  'https://www.googleapis.com/auth/admin.directory.customer.readonly',
  'https://www.googleapis.com/auth/admin.directory.domain.readonly',
];

for (const scope of testScopes) {
  try {
    const auth = new google.auth.JWT({
      email: keyData.client_email,
      key: keyData.private_key,
      scopes: [scope],
      subject: 'alister@gafe.co.za',
    });
    await auth.authorize();
    console.log(`[ALLOWED] ${scope}`);
  } catch (err) {
    console.log(`[DENIED / UNAUTHORIZED] ${scope} (${err.response?.data?.error || err.message})`);
  }
}
