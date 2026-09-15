import { DatabaseSync } from 'node:sqlite';

export const OAUTH_SCOPES_DATA = [
  // 1. Gmail
  {
    scope_url: 'https://mail.google.com/',
    service_name: 'Gmail',
    google_tier: 'Restricted',
    admin_score: 5,
    admin_color: 'Red',
    rationale: 'Full Mailbox Takeover',
    threat_impact: 'Read, compose, permanently delete emails, and modify forwarding/POP/IMAP settings. Total communication takeover.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/gmail.modify',
    service_name: 'Gmail',
    google_tier: 'Restricted',
    admin_score: 5,
    admin_color: 'Red',
    rationale: 'Message Manipulation & Exfiltration',
    threat_impact: 'Read, compose, modify labels, and move messages to trash. Enables silent email interception and manipulation.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/gmail.settings.sharing',
    service_name: 'Gmail',
    google_tier: 'Restricted',
    admin_score: 5,
    admin_color: 'Red',
    rationale: 'Silent Forwarding Rules',
    threat_impact: 'Allows setting up automatic outbound forwarding and send-as aliases to adversary mailboxes without user awareness.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/gmail.settings.basic',
    service_name: 'Gmail',
    google_tier: 'Restricted',
    admin_score: 4,
    admin_color: 'Orange',
    rationale: 'Mail Routing & Signature Tampering',
    threat_impact: 'Manage vacation responder, signatures, and filters. Frequently weaponized in business email compromise (BEC) and phishing.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/gmail.readonly',
    service_name: 'Gmail',
    google_tier: 'Restricted',
    admin_score: 4,
    admin_color: 'Orange',
    rationale: 'Bulk Email Exfiltration',
    threat_impact: 'Read all historical messages, sensitive corporate contracts, passwords, and reset links without edit rights.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/gmail.compose',
    service_name: 'Gmail',
    google_tier: 'Restricted',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Email Impersonation',
    threat_impact: 'Draft and send new emails directly as the authenticated employee. High risk for targeted spear phishing.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/gmail.insert',
    service_name: 'Gmail',
    google_tier: 'Restricted',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Mailbox Evidence Planting',
    threat_impact: 'Injects emails directly into mailbox. Can plant false correspondence or spoof received messages.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/gmail.send',
    service_name: 'Gmail',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Direct Mail Transmission',
    threat_impact: 'Send messages on the user\'s behalf without read access to existing email history.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/gmail.labels',
    service_name: 'Gmail',
    google_tier: 'Restricted',
    admin_score: 2,
    admin_color: 'Green',
    rationale: 'Label Organization',
    threat_impact: 'Manage label hierarchy and tags; cannot read email message bodies or attachments.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/gmail.metadata',
    service_name: 'Gmail',
    google_tier: 'Restricted',
    admin_score: 2,
    admin_color: 'Green',
    rationale: 'Header Reconnaissance',
    threat_impact: 'View message headers (To, From, Subject, Date) and labels; cannot read email message body content.'
  },

  // 2. Google Drive & Editors
  {
    scope_url: 'https://www.googleapis.com/auth/drive',
    service_name: 'Google Drive & Docs',
    google_tier: 'Restricted',
    admin_score: 5,
    admin_color: 'Red',
    rationale: 'Full Cloud Storage Compromise',
    threat_impact: 'Read, edit, create, and permanently delete all files in My Drive and Shared Drives. Severe ransomware and wipeout risk.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/drive.scripts',
    service_name: 'Google Drive & Docs',
    google_tier: 'Restricted',
    admin_score: 5,
    admin_color: 'Red',
    rationale: 'Script Modification & Code Injection',
    threat_impact: 'Read and write Google Apps Scripts. Can inject malicious backdoor triggers into documents and sheets.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/drive.readonly',
    service_name: 'Google Drive & Docs',
    google_tier: 'Restricted',
    admin_score: 4,
    admin_color: 'Orange',
    rationale: 'Mass Document Exfiltration',
    threat_impact: 'Bulk read and download of all corporate documents, spreadsheets, presentations, and stored assets.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/documents',
    service_name: 'Google Drive & Docs',
    google_tier: 'Sensitive',
    admin_score: 4,
    admin_color: 'Orange',
    rationale: 'Document Manipulation & Espionage',
    threat_impact: 'Read and write access to all Google Docs files (confidential reports, policies, legal contracts).'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/spreadsheets',
    service_name: 'Google Drive & Docs',
    google_tier: 'Sensitive',
    admin_score: 4,
    admin_color: 'Orange',
    rationale: 'Financial & Tabular Data Access',
    threat_impact: 'Read and write access to all Google Sheets (financial models, customer lists, HR payroll, and analytics).'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/presentations',
    service_name: 'Google Drive & Docs',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Presentation Content Access',
    threat_impact: 'Read and write access to all Google Slides presentations containing strategic plans and roadmaps.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/drive.file',
    service_name: 'Google Drive & Docs',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Scoped File Access (Least Privilege)',
    threat_impact: 'Only accesses files created by the app or explicitly opened with it via the Google picker. Safe enterprise pattern.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/documents.readonly',
    service_name: 'Google Drive & Docs',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Document Read Reconnaissance',
    threat_impact: 'Read-only access to all Google Docs without edit or modification rights.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    service_name: 'Google Drive & Docs',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Sheet Read Reconnaissance',
    threat_impact: 'Read-only access to all Google Sheets data without edit or deletion capabilities.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/presentations.readonly',
    service_name: 'Google Drive & Docs',
    google_tier: 'Sensitive',
    admin_score: 2,
    admin_color: 'Green',
    rationale: 'Slides Read-Only',
    threat_impact: 'Read-only access to Google Slides presentations.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/drive.appdata',
    service_name: 'Google Drive & Docs',
    google_tier: 'Sensitive',
    admin_score: 2,
    admin_color: 'Green',
    rationale: 'Isolated App Configuration Storage',
    threat_impact: 'Accesses only a dedicated hidden app folder. Cannot touch or see regular corporate user files.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/drive.metadata',
    service_name: 'Google Drive & Docs',
    google_tier: 'Restricted',
    admin_score: 2,
    admin_color: 'Green',
    rationale: 'File Metadata Modification',
    threat_impact: 'View and modify file and folder names and hierarchy; cannot read document content.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/drive.metadata.readonly',
    service_name: 'Google Drive & Docs',
    google_tier: 'Restricted',
    admin_score: 2,
    admin_color: 'Green',
    rationale: 'Drive Structure Enumeration',
    threat_impact: 'Read-only directory tree structure and filenames. Used for corporate file reconnaissance.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/drive.photos.readonly',
    service_name: 'Google Drive & Docs',
    google_tier: 'Sensitive',
    admin_score: 2,
    admin_color: 'Green',
    rationale: 'Photos Read-Only',
    threat_impact: 'Read-only access to Google Photos image library.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/drive.install',
    service_name: 'Google Drive & Docs',
    google_tier: 'Non-Sensitive',
    admin_score: 1,
    admin_color: 'Blue',
    rationale: 'App Extension Registration',
    threat_impact: 'Registers the application in the Google Drive "Open With" menu. Carries no data access privileges.'
  },

  // 3. Google Workspace Admin SDK
  {
    scope_url: 'https://www.googleapis.com/auth/admin.directory.rolemanagement',
    service_name: 'Admin SDK',
    google_tier: 'Restricted',
    admin_score: 5,
    admin_color: 'Red',
    rationale: 'Domain Privilege Escalation',
    threat_impact: 'Can create and assign Super Admin roles to rogue accounts. Ultimate domain takeover vector.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/admin.directory.user',
    service_name: 'Admin SDK',
    google_tier: 'Restricted',
    admin_score: 5,
    admin_color: 'Red',
    rationale: 'Total Account Administration',
    threat_impact: 'Create, reset passwords, suspend, or delete any domain user account, including administrators.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/admin.directory.domain',
    service_name: 'Admin SDK',
    google_tier: 'Restricted',
    admin_score: 5,
    admin_color: 'Red',
    rationale: 'Domain Architecture Control',
    threat_impact: 'Modify DNS, secondary domain aliases, and domain ownership configurations.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/admin.directory.group',
    service_name: 'Admin SDK',
    google_tier: 'Sensitive',
    admin_score: 4,
    admin_color: 'Orange',
    rationale: 'Group Membership Tampering',
    threat_impact: 'Add accounts to high-privilege distribution groups, security groups, or restricted mailing lists.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/admin.directory.orgunit',
    service_name: 'Admin SDK',
    google_tier: 'Sensitive',
    admin_score: 4,
    admin_color: 'Orange',
    rationale: 'OU Policy Bypass',
    threat_impact: 'Move users between Organizational Units, potentially bypassing 2SV mandates or restricted app policies.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/admin.reports.audit.readonly',
    service_name: 'Admin SDK',
    google_tier: 'Sensitive',
    admin_score: 4,
    admin_color: 'Orange',
    rationale: 'Security Audit Log Surveillance',
    threat_impact: 'Read tenant security audit logs, monitoring detection mechanisms and tracking admin investigation activities.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/admin.directory.device.chromeos',
    service_name: 'Admin SDK',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Fleet Device Management',
    threat_impact: 'Remote control, wipe, reboot, or de-provision managed Chromebook devices across the fleet.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/admin.directory.user.readonly',
    service_name: 'Admin SDK',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Organizational Directory Harvesting',
    threat_impact: 'Enumerate all employee emails, titles, managers, phone numbers, and physical office locations.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/admin.directory.group.readonly',
    service_name: 'Admin SDK',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Security Group Enumeration',
    threat_impact: 'Enumerate all internal distribution groups and discover administrative mailing lists.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/admin.reports.usage.readonly',
    service_name: 'Admin SDK',
    google_tier: 'Non-Sensitive',
    admin_score: 2,
    admin_color: 'Green',
    rationale: 'Aggregate Usage Metrics',
    threat_impact: 'Read aggregate domain usage reports and service adoption statistics without individual PII.'
  },

  // 4. Google Calendar
  {
    scope_url: 'https://www.googleapis.com/auth/calendar',
    service_name: 'Google Calendar',
    google_tier: 'Sensitive',
    admin_score: 4,
    admin_color: 'Orange',
    rationale: 'Full Calendar Compromise',
    threat_impact: 'Full read/write to all calendars. Can delete schedules, plant fraudulent meeting invites, and read meeting attachments.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/calendar.events',
    service_name: 'Google Calendar',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Meeting Creation & Alteration',
    threat_impact: 'Create, edit, and delete calendar meetings on the user\'s schedule.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/calendar.readonly',
    service_name: 'Google Calendar',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Executive Calendar Surveillance',
    threat_impact: 'Read entire schedule, attendees, location, video conference links, and meeting notes.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/calendar.events.readonly',
    service_name: 'Google Calendar',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Event Metadata Reconnaissance',
    threat_impact: 'View meeting metadata, guest lists, and event descriptions without edit capabilities.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/calendar.freebusy',
    service_name: 'Google Calendar',
    google_tier: 'Non-Sensitive',
    admin_score: 2,
    admin_color: 'Green',
    rationale: 'Availability Inspection',
    threat_impact: 'Only views availability blocks (busy/free) without meeting titles, attendees, or descriptions.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/calendar.settings.readonly',
    service_name: 'Google Calendar',
    google_tier: 'Non-Sensitive',
    admin_score: 1,
    admin_color: 'Blue',
    rationale: 'Calendar Preferences',
    threat_impact: 'View user timezone, default reminder formats, and working hours.'
  },

  // 5. Google Contacts / People API
  {
    scope_url: 'https://www.googleapis.com/auth/contacts',
    service_name: 'Google Contacts',
    google_tier: 'Sensitive',
    admin_score: 4,
    admin_color: 'Orange',
    rationale: 'Full Address Book Tampering',
    threat_impact: 'Full read/write to personal and corporate contact lists. Can overwrite or poison phone numbers and addresses.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/contacts.readonly',
    service_name: 'Google Contacts',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Address Book Exfiltration',
    threat_impact: 'Bulk export of contact names, private phone numbers, personal emails, and company notes.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/contacts.other.readonly',
    service_name: 'Google Contacts',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Auto-Saved Contact Surveillance',
    threat_impact: 'Access auto-saved email interaction history, exposing sensitive external vendor and partner relationships.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/directory.readonly',
    service_name: 'Google Contacts',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Global Address List Harvesting',
    threat_impact: 'View internal company Global Address List (GAL) directory.'
  },

  // 6. Google Chat & Classroom
  {
    scope_url: 'https://www.googleapis.com/auth/chat.messages',
    service_name: 'Google Chat & Classroom',
    google_tier: 'Restricted',
    admin_score: 5,
    admin_color: 'Red',
    rationale: 'Private Chat Surveillance & Impersonation',
    threat_impact: 'Read and send direct chat messages in spaces; access private real-time internal communications.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/chat.spaces',
    service_name: 'Google Chat & Classroom',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Chat Space Management',
    threat_impact: 'Create and modify internal Google Chat rooms and spaces.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/classroom.rosters',
    service_name: 'Google Chat & Classroom',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Student & Teacher Roster Exposure',
    threat_impact: 'Access teacher and student roster directories (FERPA/COPPA student privacy compliance exposure).'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/classroom.coursework.students',
    service_name: 'Google Chat & Classroom',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Student Work & Grade Access',
    threat_impact: 'View student grades, submissions, and assignment feedback.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/classroom.courses',
    service_name: 'Google Chat & Classroom',
    google_tier: 'Sensitive',
    admin_score: 2,
    admin_color: 'Green',
    rationale: 'Course Directory Listing',
    threat_impact: 'View course titles, descriptions, and schedules.'
  },

  // 7. Google Apps Script Execution & Utilities
  {
    scope_url: 'https://www.googleapis.com/auth/script.send_mail',
    service_name: 'Google Apps Script',
    google_tier: 'Restricted',
    admin_score: 5,
    admin_color: 'Red',
    rationale: 'Programmatic Email Exfiltration & Phishing',
    threat_impact: 'Direct background programmatic email sending from Apps Script. Top vector for automated internal spear-phishing.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/script.external_request',
    service_name: 'Google Apps Script',
    google_tier: 'Sensitive',
    admin_score: 4,
    admin_color: 'Orange',
    rationale: 'Arbitrary Data Egress / Webhooks',
    threat_impact: 'Script can issue external HTTP/REST calls (UrlFetchApp) to transmit internal company data to external servers.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/script.scriptapp',
    service_name: 'Google Apps Script',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Persistent Trigger Execution',
    threat_impact: 'Install automatic time-driven or event-driven background triggers.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/tasks',
    service_name: 'Google Apps Script',
    google_tier: 'Sensitive',
    admin_score: 3,
    admin_color: 'Yellow',
    rationale: 'Task Manipulation',
    threat_impact: 'Read and write personal and shared tasks.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/tasks.readonly',
    service_name: 'Google Apps Script',
    google_tier: 'Sensitive',
    admin_score: 2,
    admin_color: 'Green',
    rationale: 'Task Read-Only',
    threat_impact: 'Read-only access to user tasks and to-do lists.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/script.container.ui',
    service_name: 'Google Apps Script',
    google_tier: 'Non-Sensitive',
    admin_score: 1,
    admin_color: 'Blue',
    rationale: 'UI Dialog Display',
    threat_impact: 'Render custom sidebars or modal dialogs inside Docs/Sheets without data extraction capabilities.'
  },

  // 8. Identity & SSO Core
  {
    scope_url: 'openid',
    service_name: 'Identity & SSO',
    google_tier: 'Non-Sensitive',
    admin_score: 1,
    admin_color: 'Blue',
    rationale: 'OpenID Identity Assertion',
    threat_impact: 'Standard OpenID Connect token for user authentication assertion.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/userinfo.email',
    service_name: 'Identity & SSO',
    google_tier: 'Non-Sensitive',
    admin_score: 1,
    admin_color: 'Blue',
    rationale: 'Primary Email Verification',
    threat_impact: 'View the user\'s primary email address for SSO sign-in.'
  },
  {
    scope_url: 'https://www.googleapis.com/auth/userinfo.profile',
    service_name: 'Identity & SSO',
    google_tier: 'Non-Sensitive',
    admin_score: 1,
    admin_color: 'Blue',
    rationale: 'Basic Profile Assertion',
    threat_impact: 'View the user\'s display name and profile avatar URL.'
  }
];

export function initAndSeedScopeReference(dbPath = './adminlens.db') {
  const db = new DatabaseSync(dbPath);

  // 1. Create table DDL
  db.exec(`
    CREATE TABLE IF NOT EXISTS oauth_scope_reference (
      scope_url TEXT PRIMARY KEY,
      service_name TEXT NOT NULL,
      google_tier TEXT NOT NULL CHECK (google_tier IN ('Restricted', 'Sensitive', 'Non-Sensitive')),
      admin_score INTEGER NOT NULL CHECK (admin_score BETWEEN 1 AND 5),
      admin_color TEXT NOT NULL CHECK (admin_color IN ('Blue', 'Green', 'Yellow', 'Orange', 'Red')),
      rationale TEXT NOT NULL,
      threat_impact TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_scope_ref_service ON oauth_scope_reference(service_name);
    CREATE INDEX IF NOT EXISTS idx_scope_ref_score ON oauth_scope_reference(admin_score);
    CREATE INDEX IF NOT EXISTS idx_scope_ref_tier ON oauth_scope_reference(google_tier);
  `);

  // 2. Prepare UPSERT statement
  const upsert = db.prepare(`
    INSERT INTO oauth_scope_reference (
      scope_url, service_name, google_tier, admin_score, admin_color, rationale, threat_impact, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(scope_url) DO UPDATE SET
      service_name = excluded.service_name,
      google_tier = excluded.google_tier,
      admin_score = excluded.admin_score,
      admin_color = excluded.admin_color,
      rationale = excluded.rationale,
      threat_impact = excluded.threat_impact,
      updated_at = datetime('now')
  `);

  db.exec('BEGIN TRANSACTION');
  for (const s of OAUTH_SCOPES_DATA) {
    upsert.run(
      s.scope_url,
      s.service_name,
      s.google_tier,
      s.admin_score,
      s.admin_color,
      s.rationale,
      s.threat_impact
    );
  }
  db.exec('COMMIT');

  const count = db.prepare('SELECT COUNT(*) as count FROM oauth_scope_reference').get().count;
  console.log(`✓ Seeded ${count} Google Workspace OAuth scopes into 'oauth_scope_reference'.`);
  return count;
}

if (process.argv[1]?.endsWith('seed_scope_reference.mjs')) {
  initAndSeedScopeReference();
}
