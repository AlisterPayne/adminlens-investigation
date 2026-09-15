import { google } from 'googleapis';
import fs from 'fs';

const keyData = JSON.parse(fs.readFileSync('./gam-project-83tkn-bccbdf540703.json', 'utf8'));

const auth = new google.auth.JWT({
  email: keyData.client_email,
  key: keyData.private_key,
  scopes: [
    'https://www.googleapis.com/auth/admin.directory.user.readonly',
    'https://www.googleapis.com/auth/admin.directory.user.security',
    'https://www.googleapis.com/auth/admin.reports.audit.readonly',
  ],
  subject: 'alister@gafe.co.za',
});

console.log('Client Email:', keyData.client_email);
console.log('Attempting authorize...');
await auth.authorize();
console.log('Successfully authorized!');
