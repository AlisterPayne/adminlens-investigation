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
  },

  // Additional In-Use Scopes (Admin SDK, Chrome, Cloud Identity, Chat, Classroom, GCP, Drive, Contacts)
  {
    scope_url: "https://www.googleapis.com/auth/admin.directory.orgunit.readonly",
    service_name: "Admin SDK",
    google_tier: "Sensitive",
    admin_score: 3,
    admin_color: "Yellow",
    rationale: "Organizational Unit Structure Reconnaissance",
    threat_impact: "Read-only enumeration of tenant organizational structure and department hierarchy."
  },
  {
    scope_url: "https://www.googleapis.com/auth/admin.directory.domain.readonly",
    service_name: "Admin SDK",
    google_tier: "Sensitive",
    admin_score: 3,
    admin_color: "Yellow",
    rationale: "Domain Name & Alias Reconnaissance",
    threat_impact: "View domain names, domain aliases, and primary/secondary tenant domain configurations."
  },
  {
    scope_url: "https://www.googleapis.com/auth/admin.directory.customer",
    service_name: "Admin SDK",
    google_tier: "Restricted",
    admin_score: 4,
    admin_color: "Orange",
    rationale: "Customer Account Profile Administration",
    threat_impact: "Manage customer domain account details, technical contacts, and postal addresses."
  },
  {
    scope_url: "https://www.googleapis.com/auth/admin.directory.userschema",
    service_name: "Admin SDK",
    google_tier: "Restricted",
    admin_score: 4,
    admin_color: "Orange",
    rationale: "Custom Directory Schema Tampering",
    threat_impact: "Define and modify custom attributes for domain user accounts (often storing internal employee IDs or clearance levels)."
  },
  {
    scope_url: "https://www.googleapis.com/auth/admin.directory.user.security",
    service_name: "Admin SDK",
    google_tier: "Restricted",
    admin_score: 5,
    admin_color: "Red",
    rationale: "User Security & 2SV Credential Manipulation",
    threat_impact: "Manage user MFA/2-step verification, security keys, backup codes, and session cookies. High privilege takeover."
  },
  {
    scope_url: "https://www.googleapis.com/auth/admin.directory.resource.calendar",
    service_name: "Admin SDK",
    google_tier: "Sensitive",
    admin_score: 3,
    admin_color: "Yellow",
    rationale: "Calendar Resource Administration",
    threat_impact: "Manage conference rooms, video hardware resources, and physical domain facilities."
  },
  {
    scope_url: "https://www.googleapis.com/auth/admin.directory.device.mobile",
    service_name: "Admin SDK",
    google_tier: "Restricted",
    admin_score: 4,
    admin_color: "Orange",
    rationale: "Mobile Device Management & Remote Wipe",
    threat_impact: "Enumerate, approve, block, or remotely wipe corporate mobile devices carrying enterprise email and files."
  },
  {
    scope_url: "https://www.googleapis.com/auth/admin.directory.device.chromebrowsers",
    service_name: "Admin SDK",
    google_tier: "Sensitive",
    admin_score: 3,
    admin_color: "Yellow",
    rationale: "Enrolled Chrome Browser Fleet Inspection",
    threat_impact: "View enrolled Chrome browser instances, OS versions, and enterprise policies."
  },
  {
    scope_url: "https://www.googleapis.com/auth/admin.datatransfer",
    service_name: "Admin SDK",
    google_tier: "Restricted",
    admin_score: 5,
    admin_color: "Red",
    rationale: "Cross-Account Bulk Data Transfer",
    threat_impact: "Transfer ownership of entire Drive files and Calendar events between domain users during de-provisioning. Extreme egress potential."
  },
  {
    scope_url: "https://www.googleapis.com/auth/admin.contact.delegation",
    service_name: "Admin SDK",
    google_tier: "Restricted",
    admin_score: 4,
    admin_color: "Orange",
    rationale: "Domain Contact Delegation Control",
    threat_impact: "Manage shared external contacts and delegated address book access across tenant users."
  },
  {
    scope_url: "https://www.googleapis.com/auth/admin.chrome.printers",
    service_name: "Admin SDK",
    google_tier: "Sensitive",
    admin_score: 2,
    admin_color: "Green",
    rationale: "Enterprise Printer Infrastructure Administration",
    threat_impact: "Configure native printers and print server endpoints for ChromeOS devices."
  },
  {
    scope_url: "https://www.googleapis.com/auth/apps.groups.migration",
    service_name: "Admin SDK",
    google_tier: "Restricted",
    admin_score: 4,
    admin_color: "Orange",
    rationale: "Google Groups Message Ingestion / Migration",
    threat_impact: "Inject and archive historical messages into Google Groups mailing lists."
  },
  {
    scope_url: "https://www.googleapis.com/auth/apps.groups.settings",
    service_name: "Admin SDK",
    google_tier: "Restricted",
    admin_score: 4,
    admin_color: "Orange",
    rationale: "Google Groups Security Configuration",
    threat_impact: "Modify group security settings, including allowing external participants, public web postings, or collaborative inbox access."
  },
  {
    scope_url: "https://www.googleapis.com/auth/apps.licensing",
    service_name: "Admin SDK",
    google_tier: "Restricted",
    admin_score: 3,
    admin_color: "Yellow",
    rationale: "Workspace SKU License Assignment",
    threat_impact: "Assign or revoke Google Workspace and Google Cloud licenses for domain users."
  },
  {
    scope_url: "https://www.googleapis.com/auth/apps_genai",
    service_name: "Admin SDK",
    google_tier: "Sensitive",
    admin_score: 3,
    admin_color: "Yellow",
    rationale: "Workspace Generative AI & Gemini Configuration",
    threat_impact: "Manage administrative configurations and policies for generative AI features in Google Workspace."
  },
  {
    scope_url: "https://www.googleapis.com/auth/chrome.management.policy",
    service_name: "Admin SDK",
    google_tier: "Restricted",
    admin_score: 4,
    admin_color: "Orange",
    rationale: "Chrome Browser Policy Administration",
    threat_impact: "Enforce or alter enterprise Chrome browser policies, extension blocklists, and network proxy rules."
  },
  {
    scope_url: "https://www.googleapis.com/auth/chrome.management.profiles",
    service_name: "Admin SDK",
    google_tier: "Sensitive",
    admin_score: 3,
    admin_color: "Yellow",
    rationale: "Managed Chrome Browser Profile Administration",
    threat_impact: "View and manage enterprise-managed user profiles within Chrome browsers."
  },
  {
    scope_url: "https://www.googleapis.com/auth/chrome.management.reports.readonly",
    service_name: "Admin SDK",
    google_tier: "Sensitive",
    admin_score: 2,
    admin_color: "Green",
    rationale: "Chrome Management Reporting",
    threat_impact: "View telemetry reports regarding browser versions, security events, and installed extensions."
  },
  {
    scope_url: "https://www.googleapis.com/auth/chrome.management.telemetry.readonly",
    service_name: "Admin SDK",
    google_tier: "Sensitive",
    admin_score: 2,
    admin_color: "Green",
    rationale: "Chrome Device Telemetry Readout",
    threat_impact: "Read hardware diagnostic telemetry, network metrics, and CPU usage on ChromeOS devices."
  },
  {
    scope_url: "https://www.googleapis.com/auth/chrome.management.appdetails.readonly",
    service_name: "Admin SDK",
    google_tier: "Non-Sensitive",
    admin_score: 1,
    admin_color: "Blue",
    rationale: "Chrome Web Store App Metadata Inspection",
    threat_impact: "Read public and private app details for Chrome extensions installed across the domain."
  },
  {
    scope_url: "https://www.googleapis.com/auth/cloud-identity.groups",
    service_name: "Admin SDK",
    google_tier: "Restricted",
    admin_score: 4,
    admin_color: "Orange",
    rationale: "Cloud Identity Security Groups Management",
    threat_impact: "Full CRUD control over Cloud Identity groups, security labels, dynamic memberships, and IAM group bindings."
  },
  {
    scope_url: "https://www.googleapis.com/auth/cloud-identity.inboundsso",
    service_name: "Admin SDK",
    google_tier: "Restricted",
    admin_score: 5,
    admin_color: "Red",
    rationale: "Inbound SAML/OIDC SSO Configuration",
    threat_impact: "Modify third-party identity provider SSO profiles, SAML certificates, and redirect URLs. Massive authentication hijack vector."
  },
  {
    scope_url: "https://www.googleapis.com/auth/cloud-identity.orgunits",
    service_name: "Admin SDK",
    google_tier: "Restricted",
    admin_score: 4,
    admin_color: "Orange",
    rationale: "Cloud Identity Organizational Units Management",
    threat_impact: "Create, move, and delete Cloud Identity organizational units and root domain hierarchy."
  },
  {
    scope_url: "https://www.googleapis.com/auth/cloud-identity.policies",
    service_name: "Admin SDK",
    google_tier: "Restricted",
    admin_score: 5,
    admin_color: "Red",
    rationale: "Cloud Identity Security Policies Administration",
    threat_impact: "Define and enforce domain-wide identity policies, password complexity rules, and session controls."
  },
  {
    scope_url: "https://www.googleapis.com/auth/cloud-identity.policies.readonly",
    service_name: "Admin SDK",
    google_tier: "Sensitive",
    admin_score: 3,
    admin_color: "Yellow",
    rationale: "Cloud Identity Security Policies Inspection",
    threat_impact: "Audit security policies, 2SV enforcement rules, and context-aware session policies."
  },
  {
    scope_url: "https://www.googleapis.com/auth/cloud-identity.userinvitations",
    service_name: "Admin SDK",
    google_tier: "Sensitive",
    admin_score: 3,
    admin_color: "Yellow",
    rationale: "Unmanaged User Account Invitations",
    threat_impact: "Send and manage invitations to unmanaged personal Google accounts to migrate into the corporate domain."
  },
  {
    scope_url: "https://www.googleapis.com/auth/ediscovery",
    service_name: "Admin SDK",
    google_tier: "Restricted",
    admin_score: 5,
    admin_color: "Red",
    rationale: "Google Vault Legal Holds & eDiscovery Exfiltration",
    threat_impact: "Access Google Vault matters, legal holds, export queries, and litigation audits covering all historical domain emails and files."
  },
  {
    scope_url: "https://www.googleapis.com/auth/cloud-platform",
    service_name: "Admin SDK",
    google_tier: "Restricted",
    admin_score: 5,
    admin_color: "Red",
    rationale: "Full Google Cloud Platform Infrastructure Control",
    threat_impact: "Full administrative access to all GCP projects, IAM roles, compute instances, BigQuery databases, and storage buckets."
  },
  {
    scope_url: "https://www.googleapis.com/auth/drive.appfolder",
    service_name: "Google Drive & Docs",
    google_tier: "Sensitive",
    admin_score: 2,
    admin_color: "Green",
    rationale: "Application Dedicated Folder Access",
    threat_impact: "Read and write files solely within the application-specific Drive directory."
  },
  {
    scope_url: "https://www.googleapis.com/auth/spreadsheets.currentonly",
    service_name: "Google Drive & Docs",
    google_tier: "Sensitive",
    admin_score: 2,
    admin_color: "Green",
    rationale: "Active Google Spreadsheet Scoped Access",
    threat_impact: "Accesses only the specific Google Spreadsheet document where the add-on is currently running."
  },
  {
    scope_url: "https://spreadsheets.google.com/feeds",
    service_name: "Google Drive & Docs",
    google_tier: "Restricted",
    admin_score: 4,
    admin_color: "Orange",
    rationale: "Legacy Google Sheets GData Feed Access",
    threat_impact: "Full read/write access to user Google Sheets via legacy XML feed protocol."
  },
  {
    scope_url: "https://www.googleapis.com/auth/forms",
    service_name: "Google Drive & Docs",
    google_tier: "Sensitive",
    admin_score: 3,
    admin_color: "Yellow",
    rationale: "Google Forms Management & Survey Responses",
    threat_impact: "View, edit, and export corporate surveys, quizzes, and respondent submissions."
  },
  {
    scope_url: "https://www.googleapis.com/auth/carddav",
    service_name: "Google Contacts",
    google_tier: "Sensitive",
    admin_score: 3,
    admin_color: "Yellow",
    rationale: "CardDAV Contact Synchronization",
    threat_impact: "Synchronize user address books via CardDAV protocol across external clients."
  },
  {
    scope_url: "https://www.google.com/m8/feeds",
    service_name: "Google Contacts",
    google_tier: "Sensitive",
    admin_score: 4,
    admin_color: "Orange",
    rationale: "Legacy Google Contacts GData Feed Access",
    threat_impact: "Full read/write access to personal and shared domain contacts via legacy API."
  },
  {
    scope_url: "https://www.googleapis.com/auth/chat.messages.create",
    service_name: "Google Chat & Classroom",
    google_tier: "Sensitive",
    admin_score: 3,
    admin_color: "Yellow",
    rationale: "Send Google Chat Messages",
    threat_impact: "Send messages into Google Chat spaces and direct messages as an authenticated user or bot."
  },
  {
    scope_url: "https://www.googleapis.com/auth/chat.messages.readonly",
    service_name: "Google Chat & Classroom",
    google_tier: "Restricted",
    admin_score: 4,
    admin_color: "Orange",
    rationale: "Bulk Chat Message Surveillance",
    threat_impact: "Read-only access to all message histories, private discussions, and file attachments in Google Chat."
  },
  {
    scope_url: "https://www.googleapis.com/auth/chat.memberships",
    service_name: "Google Chat & Classroom",
    google_tier: "Sensitive",
    admin_score: 3,
    admin_color: "Yellow",
    rationale: "Chat Space Membership Management",
    threat_impact: "Add, remove, and list members in Google Chat spaces."
  },
  {
    scope_url: "https://www.googleapis.com/auth/chat.memberships.app",
    service_name: "Google Chat & Classroom",
    google_tier: "Non-Sensitive",
    admin_score: 2,
    admin_color: "Green",
    rationale: "Chat App Space Membership Integration",
    threat_impact: "Allows the Chat app to view its own membership status in a room without user eavesdropping."
  },
  {
    scope_url: "https://www.googleapis.com/auth/chat.users.readstate",
    service_name: "Google Chat & Classroom",
    google_tier: "Sensitive",
    admin_score: 2,
    admin_color: "Green",
    rationale: "Chat Read State & Activity Status",
    threat_impact: "View message read receipts and presence state for users in Google Chat."
  },
  {
    scope_url: "https://www.googleapis.com/auth/classroom.announcements",
    service_name: "Google Chat & Classroom",
    google_tier: "Sensitive",
    admin_score: 3,
    admin_color: "Yellow",
    rationale: "Classroom Announcements Posting & Editing",
    threat_impact: "Create, view, and modify student announcements across all enrolled classes."
  },
  {
    scope_url: "https://www.googleapis.com/auth/classroom.courseworkmaterials",
    service_name: "Google Chat & Classroom",
    google_tier: "Sensitive",
    admin_score: 3,
    admin_color: "Yellow",
    rationale: "Coursework Teaching Materials Management",
    threat_impact: "Manage instructional documents, links, and study materials published to students."
  },
  {
    scope_url: "https://www.googleapis.com/auth/classroom.guardianlinks.students",
    service_name: "Google Chat & Classroom",
    google_tier: "Sensitive",
    admin_score: 3,
    admin_color: "Yellow",
    rationale: "Parent & Guardian Student Linkage",
    threat_impact: "Access and modify parent/guardian email invitations and contact links for student accounts."
  },
  {
    scope_url: "https://www.googleapis.com/auth/classroom.profile.emails",
    service_name: "Google Chat & Classroom",
    google_tier: "Non-Sensitive",
    admin_score: 2,
    admin_color: "Green",
    rationale: "Student & Teacher Email Lookup",
    threat_impact: "View the email addresses of people in Google Classroom classes."
  },
  {
    scope_url: "https://www.googleapis.com/auth/classroom.profile.photos",
    service_name: "Google Chat & Classroom",
    google_tier: "Non-Sensitive",
    admin_score: 1,
    admin_color: "Blue",
    rationale: "Classroom User Profile Photos",
    threat_impact: "View profile photos of teachers and students in Google Classroom."
  },
  {
    scope_url: "https://www.googleapis.com/auth/classroom.topics",
    service_name: "Google Chat & Classroom",
    google_tier: "Sensitive",
    admin_score: 2,
    admin_color: "Green",
    rationale: "Classroom Course Topics Management",
    threat_impact: "Create and organize subject module topics within Google Classroom."
  },
  {
    scope_url: "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly",
    service_name: "Google Chat & Classroom",
    google_tier: "Sensitive",
    admin_score: 3,
    admin_color: "Yellow",
    rationale: "Student Assignment Submissions Read-Only",
    threat_impact: "Read-only access to homework submissions and student coursework drafts."
  },
  {
    scope_url: "https://www.googleapis.com/auth/workspace.workflows.trigger",
    service_name: "Google Apps Script",
    google_tier: "Sensitive",
    admin_score: 3,
    admin_color: "Yellow",
    rationale: "Google Workspace Workflow Execution",
    threat_impact: "Trigger and invoke enterprise automated workflows across Google Workspace services."
  },
  {
    scope_url: "https://www.googleapis.com/auth/flexible-api",
    service_name: "Google Apps Script",
    google_tier: "Sensitive",
    admin_score: 3,
    admin_color: "Yellow",
    rationale: "Flexible Integration API Access",
    threat_impact: "Programmatic gateway execution for third-party automated add-on integrations."
  },
  {
    scope_url: "https://www.googleapis.com/auth/user.organization.read",
    service_name: "Identity & SSO",
    google_tier: "Non-Sensitive",
    admin_score: 1,
    admin_color: "Blue",
    rationale: "User Organization & Job Title Read-Only",
    threat_impact: "View the user's employer, department, and job title from their profile."
  },
  {
    scope_url: "https://www.googleapis.com/auth/user.phonenumbers.read",
    service_name: "Identity & SSO",
    google_tier: "Sensitive",
    admin_score: 2,
    admin_color: "Green",
    rationale: "User Phone Number Read-Only",
    threat_impact: "View the user's personal and work phone numbers registered in their Google profile."
  },
  {
    scope_url: "https://www.googleapis.com/auth/plus.me",
    service_name: "Identity & SSO",
    google_tier: "Non-Sensitive",
    admin_score: 1,
    admin_color: "Blue",
    rationale: "Legacy Google+ Identity Verification",
    threat_impact: "Legacy user identity token equivalent to basic user profile."
  },
  {
    scope_url: "https://www.google.com/accounts/OAuthLogin",
    service_name: "Identity & SSO",
    google_tier: "Restricted",
    admin_score: 4,
    admin_color: "Orange",
    rationale: "Legacy Master ClientLogin / OAuth Session Login",
    threat_impact: "Legacy full-account session login token for Google services with broad scope implications."
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
