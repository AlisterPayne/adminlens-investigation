import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { ENRICHED_VENDOR_REGISTRY, enrichApplicationRecord } from './app_enrichment_service.mjs';

const DB_PATH = './adminlens.db';
const CATALOG_PATHS = [
  './standardized_catalog/applications_catalog.json',
  './mosaic-next/data/applications_catalog.json',
  './public/standardized_catalog.json'
];

// Expanded comprehensive registry of well-known SaaS vendors & domains
const EXTENDED_REGISTRY = {
  'openai': {
    vendor: 'OpenAI, LLC',
    domain: 'openai.com',
    category: 'AI & Machine Learning',
    compliance: ['SOC 2 Type II', 'GDPR', 'CCPA'],
    dataHosting: 'USA (Microsoft Azure)',
    breachHistory: '1 incident (March 2023 - Payment data bug)',
    description: 'Pioneering artificial intelligence research lab and creator of ChatGPT and GPT models.',
  },
  'chatgpt': {
    vendor: 'OpenAI, LLC',
    domain: 'openai.com',
    category: 'AI & Machine Learning',
    compliance: ['SOC 2 Type II', 'GDPR'],
    dataHosting: 'USA (Microsoft Azure)',
    description: 'Conversational generative AI assistant by OpenAI.',
  },
  'zoom': {
    vendor: 'Zoom Video Communications, Inc.',
    domain: 'zoom.us',
    category: 'Communication & Collaboration',
    compliance: ['SOC 2 Type II', 'ISO 27001', 'GDPR', 'HIPAA', 'FERPA'],
    dataHosting: 'Global / USA',
    breachHistory: '1 incident (April 2020 - Credential stuffing)',
    description: 'Video conferencing, cloud meetings, team chat, and unified communications platform.',
  },
  'facebook': {
    vendor: 'Meta Platforms, Inc.',
    domain: 'facebook.com',
    category: 'Communication & Social',
    compliance: ['ISO 27001', 'GDPR'],
    dataHosting: 'Global / USA',
    breachHistory: '1 incident (April 2021 - 533M phone numbers scraped)',
    description: 'Social networking and communication service by Meta Platforms.',
  },
  'instagram': {
    vendor: 'Meta Platforms, Inc.',
    domain: 'instagram.com',
    category: 'Communication & Social',
    compliance: ['ISO 27001', 'GDPR'],
    dataHosting: 'Global / USA',
    description: 'Visual media sharing, messaging, and content creation platform by Meta.',
  },
  'whatsapp': {
    vendor: 'Meta Platforms, Inc.',
    domain: 'whatsapp.com',
    category: 'Communication & Social',
    compliance: ['ISO 27001', 'GDPR'],
    dataHosting: 'Global / USA',
    description: 'End-to-end encrypted messaging, voice, and group communications platform.',
  },
  'linkedin': {
    vendor: 'LinkedIn Corporation (Microsoft)',
    domain: 'linkedin.com',
    category: 'Communication & Social',
    compliance: ['SOC 2 Type II', 'ISO 27001', 'GDPR'],
    dataHosting: 'USA',
    breachHistory: '1 incident (2012 / 2016 - 117M credentials)',
    description: 'Professional social network and career development platform.',
  },
  'cursor': {
    vendor: 'Anysphere Inc.',
    domain: 'cursor.com',
    category: 'AI & Developer Tools',
    compliance: ['SOC 2 Type II', 'GDPR'],
    dataHosting: 'USA',
    description: 'AI-first code editor and IDE designed for pair programming with large language models.',
  },
  'github': {
    vendor: 'GitHub, Inc. (Microsoft)',
    domain: 'github.com',
    category: 'Developer & Cloud Infrastructure',
    compliance: ['SOC 1 Type II', 'SOC 2 Type II', 'ISO 27001', 'GDPR'],
    dataHosting: 'USA',
    description: 'World-leading developer platform for version control, collaboration, and CI/CD pipelines.',
  },
  'xai': {
    vendor: 'xAI Corp.',
    domain: 'x.ai',
    category: 'AI & Machine Learning',
    compliance: ['Standard Terms'],
    dataHosting: 'USA',
    description: 'Artificial intelligence company accelerating human scientific discovery and Grok models.',
  },
  'scribd': {
    vendor: 'Scribd, Inc.',
    domain: 'scribd.com',
    category: 'Education & EdTech',
    compliance: ['GDPR', 'COPPA'],
    dataHosting: 'USA',
    description: 'Digital library and subscription service for e-books, audiobooks, and academic documents.',
  },
  'perplexity': {
    vendor: 'Perplexity AI, Inc.',
    domain: 'perplexity.ai',
    category: 'AI & Machine Learning',
    compliance: ['SOC 2', 'GDPR'],
    dataHosting: 'USA',
    description: 'Conversational search engine and conversational AI research engine.',
  },
  'overleaf': {
    vendor: 'Digital Science (Overleaf)',
    domain: 'overleaf.com',
    category: 'Education & EdTech',
    compliance: ['GDPR', 'ISO 27001'],
    dataHosting: 'EU / UK',
    description: 'Collaborative cloud-based LaTeX editor for scientific publishing and academic research.',
  },
  'academia.edu': {
    vendor: 'Academia Inc.',
    domain: 'academia.edu',
    category: 'Education & EdTech',
    compliance: ['GDPR'],
    dataHosting: 'USA',
    description: 'Platform for academics to share research papers and collaborate globally.',
  },
  'apple': {
    vendor: 'Apple Inc.',
    domain: 'apple.com',
    category: 'Mobile & Endpoint OS',
    compliance: ['ISO 27001', 'SOC 2', 'GDPR', 'HIPAA'],
    dataHosting: 'USA / Global',
    description: 'Apple ecosystem device integration, iOS, and macOS Workspace accounts.',
  },
  'ios': {
    vendor: 'Apple Inc.',
    domain: 'apple.com',
    category: 'Mobile & Endpoint OS',
    compliance: ['ISO 27001', 'GDPR'],
    dataHosting: 'USA / Global',
    description: 'Apple iOS native system account sync for Mail, Contacts, and Calendar.',
  },
  'macos': {
    vendor: 'Apple Inc.',
    domain: 'apple.com',
    category: 'Mobile & Endpoint OS',
    compliance: ['ISO 27001', 'GDPR'],
    dataHosting: 'USA / Global',
    description: 'Apple macOS native system synchronization for Workspace accounts.',
  },
  'notion': {
    vendor: 'Notion Labs, Inc.',
    domain: 'notion.so',
    category: 'Productivity & Collaboration',
    compliance: ['SOC 2 Type II', 'ISO 27001', 'GDPR', 'HIPAA'],
    dataHosting: 'USA (AWS)',
    description: 'Connected workspace for wiki, docs, notes, and project management.',
  },
  'slack': {
    vendor: 'Slack Technologies (Salesforce)',
    domain: 'slack.com',
    category: 'Communication & Collaboration',
    compliance: ['SOC 2 Type II', 'SOC 3', 'ISO 27001', 'GDPR', 'HIPAA', 'FERPA'],
    dataHosting: 'USA / AWS',
    breachHistory: '1 incident (March 2015 - User database compromised)',
    description: 'Enterprise team messaging, channels, workflow automation, and collaboration platform.',
  },
  'trello': {
    vendor: 'Atlassian Pty Ltd',
    domain: 'trello.com',
    category: 'Productivity & Collaboration',
    compliance: ['SOC 2 Type II', 'ISO 27001', 'GDPR'],
    dataHosting: 'USA (AWS)',
    description: 'Visual collaboration tool for tracking tasks and agile workflows using Kanban boards.',
  },
  'asana': {
    vendor: 'Asana, Inc.',
    domain: 'asana.com',
    category: 'Productivity & Collaboration',
    compliance: ['SOC 2 Type II', 'ISO 27001', 'GDPR', 'HIPAA', 'FERPA'],
    dataHosting: 'USA / EU',
    description: 'Enterprise work and project management platform to coordinate team tasks and roadmaps.',
  },
  'airtable': {
    vendor: 'Formagrid, Inc. (Airtable)',
    domain: 'airtable.com',
    category: 'Productivity & Collaboration',
    compliance: ['SOC 2 Type II', 'ISO 27001', 'GDPR', 'FERPA'],
    dataHosting: 'USA (AWS)',
    description: 'Relational database and low-code app builder for team workflows.',
  },
  'grammarly': {
    vendor: 'Grammarly, Inc.',
    domain: 'grammarly.com',
    category: 'Productivity & Writing',
    compliance: ['SOC 2 Type II', 'ISO 27001', 'GDPR', 'FERPA', 'HIPAA'],
    dataHosting: 'USA (AWS)',
    description: 'AI-enabled communication and writing assistant for clear, error-free text.',
  },
  'kahoot': {
    vendor: 'Kahoot! AS',
    domain: 'kahoot.com',
    category: 'Education & EdTech',
    compliance: ['GDPR', 'FERPA', 'COPPA'],
    dataHosting: 'EU / Norway',
    description: 'Game-based learning platform used as educational technology in schools and companies.',
  },
  'quizlet': {
    vendor: 'Quizlet Inc.',
    domain: 'quizlet.com',
    category: 'Education & EdTech',
    compliance: ['GDPR', 'FERPA', 'COPPA'],
    dataHosting: 'USA',
    description: 'Digital flashcards, practice tests, and study games for students and teachers.',
  },
  'edpuzzle': {
    vendor: 'EDpuzzle, Inc.',
    domain: 'edpuzzle.com',
    category: 'Education & EdTech',
    compliance: ['FERPA', 'COPPA', 'GDPR'],
    dataHosting: 'USA',
    description: 'Interactive video lesson platform for educators and classroom engagement.',
  },
  'padlet': {
    vendor: 'Wallwisher, Inc. (Padlet)',
    domain: 'padlet.com',
    category: 'Education & EdTech',
    compliance: ['FERPA', 'COPPA', 'GDPR'],
    dataHosting: 'USA',
    description: 'Digital collaborative canvas for teachers and students to post multimedia content.',
  },
  'duolingo': {
    vendor: 'Duolingo, Inc.',
    domain: 'duolingo.com',
    category: 'Education & EdTech',
    compliance: ['GDPR', 'COPPA'],
    dataHosting: 'USA',
    description: 'Language-learning platform and mobile education app.',
  },
  'coursera': {
    vendor: 'Coursera, Inc.',
    domain: 'coursera.org',
    category: 'Education & EdTech',
    compliance: ['SOC 2 Type II', 'GDPR', 'FERPA'],
    dataHosting: 'USA',
    description: 'Online learning platform offering massive open online courses and university degrees.',
  },
  'dropbox': {
    vendor: 'Dropbox, Inc.',
    domain: 'dropbox.com',
    category: 'Productivity & Storage',
    compliance: ['SOC 1', 'SOC 2 Type II', 'ISO 27001', 'GDPR', 'HIPAA'],
    dataHosting: 'USA',
    breachHistory: '1 incident (2012 / 2016 - 68M hashed passwords)',
    description: 'Cloud storage, file synchronization, personal cloud, and client software.',
  },
  'spotify': {
    vendor: 'Spotify AB',
    domain: 'spotify.com',
    category: 'Media & Entertainment',
    compliance: ['GDPR', 'ISO 27001'],
    dataHosting: 'EU / USA (Google Cloud)',
    description: 'Digital music, podcast, and video streaming service.',
  },
  'stripe': {
    vendor: 'Stripe, Inc.',
    domain: 'stripe.com',
    category: 'Finance & Payments',
    compliance: ['PCI-DSS Level 1', 'SOC 1', 'SOC 2 Type II', 'GDPR'],
    dataHosting: 'USA / Global',
    description: 'Financial infrastructure platform and payment processing engine for the internet.',
  },
  'zapier': {
    vendor: 'Zapier Inc.',
    domain: 'zapier.com',
    category: 'Integration & Automation',
    compliance: ['SOC 2 Type II', 'SOC 3', 'GDPR'],
    dataHosting: 'USA (AWS)',
    description: 'No-code integration platform connecting over 6,000 SaaS web applications.',
  },
  'postman': {
    vendor: 'Postman, Inc.',
    domain: 'postman.com',
    category: 'Developer & Cloud Infrastructure',
    compliance: ['SOC 2 Type II', 'ISO 27001', 'GDPR'],
    dataHosting: 'USA',
    description: 'API development, testing, collaboration, and mocking platform.',
  },
  'hubspot': {
    vendor: 'HubSpot, Inc.',
    domain: 'hubspot.com',
    category: 'Sales, Marketing & CRM',
    compliance: ['SOC 2 Type II', 'ISO 27001', 'GDPR', 'HIPAA'],
    dataHosting: 'USA / EU',
    description: 'Customer relationship management, inbound marketing, sales, and service software.',
  },
  'salesforce': {
    vendor: 'Salesforce, Inc.',
    domain: 'salesforce.com',
    category: 'Sales, Marketing & CRM',
    compliance: ['SOC 1', 'SOC 2 Type II', 'ISO 27001', 'GDPR', 'HIPAA'],
    dataHosting: 'USA / Global',
    description: 'Global enterprise cloud CRM and enterprise application ecosystem.',
  }
};

// Clean application name to extract base brand
function cleanAppName(rawName) {
  if (!rawName) return '';
  let name = rawName.trim();
  // Remove trailing platform notes like (Web Application), (Android), etc.
  name = name.replace(/\s*\([^)]*\)$/, '').trim();
  // Remove company suffixes if isolated
  return name;
}

// Extract domain if app name or id contains one
function extractExplicitDomain(str) {
  if (!str) return null;
  const match = str.match(/([a-zA-Z0-9-]+\.(?:com|org|io|net|edu|ai|co|app|us|tv|dev|cloud|so|me|gg|tech|info|co\.uk|co\.za))/i);
  return match ? match[1].toLowerCase() : null;
}

// Primary intelligent enrichment resolver
export function resolveApplicationMetadata(app) {
  const displayName = app.displayName || app.display_name || app.appName || app.id || 'Unnamed App';
  const cleanName = cleanAppName(displayName);
  const lowerName = cleanName.toLowerCase();
  const lowerId = (app.id || '').toLowerCase();
  const isGoogle = Boolean(app.is_google_service || app.isGoogleService || lowerName.includes('google') || lowerId.includes('google.com'));

  // 1. Check existing ENRICHED_VENDOR_REGISTRY in app_enrichment_service.mjs
  for (const [key, info] of Object.entries(ENRICHED_VENDOR_REGISTRY)) {
    if (lowerName === key || lowerName.startsWith(key + ' ') || lowerName.includes(key)) {
      return {
        vendor: info.vendor,
        publisherDomain: info.domain,
        category: info.category,
        compliance: info.compliance || ['GDPR', 'SOC 2'],
        dataHosting: info.dataHosting || 'USA',
        breachHistory: info.breachHistory || null,
        description: info.description || `${info.vendor} cloud software integration.`,
        storeUrl: `https://${info.domain}`,
        iconUrl: info.iconUrl || `https://www.google.com/s2/favicons?domain=${info.domain}&sz=128`,
        isVerified: info.verified ?? (app.is_verified ?? app.isVerified ?? false)
      };
    }
  }

  // 2. Check EXTENDED_REGISTRY
  for (const [key, info] of Object.entries(EXTENDED_REGISTRY)) {
    if (lowerName === key || lowerName.startsWith(key + ' ') || lowerName.includes(key)) {
      return {
        vendor: info.vendor,
        publisherDomain: info.domain,
        category: info.category,
        compliance: info.compliance || ['GDPR', 'SOC 2'],
        dataHosting: info.dataHosting || 'USA',
        breachHistory: info.breachHistory || null,
        description: info.description || `${info.vendor} official application.`,
        storeUrl: `https://${info.domain}`,
        iconUrl: `https://www.google.com/s2/favicons?domain=${info.domain}&sz=128`,
        isVerified: true
      };
    }
  }

  // 3. Google First-Party & Core Services
  if (isGoogle) {
    let subService = 'Workspace & Cloud';
    if (lowerName.includes('drive')) subService = 'Drive & Cloud Storage';
    else if (lowerName.includes('calendar')) subService = 'Calendar & Scheduling';
    else if (lowerName.includes('chat') || lowerName.includes('meet')) subService = 'Video & Chat Collaboration';
    else if (lowerName.includes('classroom')) subService = 'Education & Classroom';
    else if (lowerName.includes('appsheet')) subService = 'No-Code Application Development';
    else if (lowerName.includes('chrome')) subService = 'Browser & Endpoint Management';
    else if (lowerName.includes('device') || lowerName.includes('mdm')) subService = 'MDM & Device Management';

    let category = 'Productivity & Collaboration';
    if (lowerName.includes('drive')) category = 'Productivity & Storage';
    else if (lowerName.includes('calendar')) category = 'Productivity & Calendar Sync';
    else if (lowerName.includes('chat') || lowerName.includes('meet')) category = 'Communication & Collaboration';
    else if (lowerName.includes('classroom')) category = 'Education & EdTech';
    else if (lowerName.includes('appsheet')) category = 'Developer & Cloud Infrastructure';
    else if (lowerName.includes('chrome') || lowerName.includes('device') || lowerName.includes('mdm')) category = 'Endpoint & Device Management';
    else if (lowerName.includes('tv') || lowerName.includes('cast') || lowerName.includes('youtube')) category = 'Media & Entertainment';

    return {
      vendor: 'Google LLC',
      publisherDomain: 'google.com',
      category: category,
      compliance: ['SOC 2', 'SOC 3', 'ISO 27001', 'GDPR', 'FERPA', 'HIPAA'],
      dataHosting: 'Google Cloud / Global',
      breachHistory: null,
      description: `Official Google Workspace first-party service providing enterprise ${subService}.`,
      storeUrl: 'https://workspace.google.com',
      iconUrl: 'https://www.google.com/s2/favicons?domain=google.com&sz=128',
      isVerified: true
    };
  }

  // 4. Domain Name in Application Title (e.g., adminlens.io, academia.edu)
  const explicitDomain = extractExplicitDomain(cleanName) || extractExplicitDomain(displayName);
  if (explicitDomain) {
    const brandName = explicitDomain.split('.')[0];
    const capitalizedBrand = brandName.charAt(0).toUpperCase() + brandName.slice(1);
    return {
      vendor: capitalizedBrand,
      publisherDomain: explicitDomain,
      category: 'Configured SaaS',
      compliance: ['GDPR', 'Standard Terms'],
      dataHosting: 'USA',
      breachHistory: null,
      description: `Cloud SaaS application and services provided via ${explicitDomain}.`,
      storeUrl: `https://${explicitDomain}`,
      iconUrl: `https://www.google.com/s2/favicons?domain=${explicitDomain}&sz=128`,
      isVerified: Boolean(app.is_verified || app.isVerified)
    };
  }

  // 5. Chrome Extension (32-char extension hash)
  if (/^[a-z]{32}$/.test(cleanName)) {
    return {
      vendor: 'Chrome Web Store Developer',
      publisherDomain: 'chromewebstore.google.com',
      category: 'Browser Extension',
      compliance: ['Chrome Web Store Policies'],
      dataHosting: 'Local Browser Process',
      breachHistory: null,
      description: 'Chrome browser extension installed from the Chrome Web Store.',
      storeUrl: `https://chromewebstore.google.com/detail/${cleanName}`,
      iconUrl: `https://clients2.googleusercontent.com/service/update2/crx?response=redirect&prodversion=100.0&x=id%3D${cleanName}%26installsource%3Dondemand%26uc`,
      isVerified: false
    };
  }

  // 6. Generic SaaS / Developer Resolution Heuristic
  // Derive potential domain if clean word
  let candidateDomain = null;
  const words = cleanName.split(/\s+/).filter(w => !['inc', 'inc.', 'llc', 'ltd', 'corp', 'corporation', 'app', 'mobile', 'software', 'charts'].includes(w.toLowerCase()));
  if (words.length > 0 && words.length <= 2 && /^[a-zA-Z0-9]+$/.test(words[0])) {
    candidateDomain = `${words.join('').toLowerCase()}.com`;
  }

  // Category determination heuristics
  let derivedCategory = 'Configured SaaS';
  if (/learn|edu|school|class|math|read|book|study|academy|tutor/i.test(cleanName)) {
    derivedCategory = 'Education & EdTech';
  } else if (/ai|bot|gpt|intelligence|copilot|model/i.test(cleanName)) {
    derivedCategory = 'AI & Machine Learning';
  } else if (/chart|draw|design|canvas|visual|photo|video|media|audio/i.test(cleanName)) {
    derivedCategory = 'Design & Creative';
  } else if (/sync|task|doc|sheet|note|project|board|kanban|calendar/i.test(cleanName)) {
    derivedCategory = 'Productivity & Collaboration';
  } else if (/mail|chat|meet|message|social|call|conference/i.test(cleanName)) {
    derivedCategory = 'Communication & Social';
  } else if (/code|dev|git|api|cloud|stack|deploy|build|test|ci/i.test(cleanName)) {
    derivedCategory = 'Developer & Cloud Infrastructure';
  } else if (/auth|security|admin|policy|protect|shield|lock|pass/i.test(cleanName)) {
    derivedCategory = 'Security & Compliance';
  } else if (/pay|bill|invoice|money|finance|card|bank/i.test(cleanName)) {
    derivedCategory = 'Finance & Payments';
  }

  const iconUrl = candidateDomain 
    ? `https://www.google.com/s2/favicons?domain=${candidateDomain}&sz=128`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=3B82F6&color=fff&size=128&rounded=true`;

  const compliance = derivedCategory === 'Education & EdTech'
    ? ['FERPA', 'COPPA', 'GDPR']
    : ['SOC 2', 'GDPR'];

  return {
    vendor: cleanName || 'Third-Party Developer',
    publisherDomain: candidateDomain || '',
    category: derivedCategory,
    compliance,
    dataHosting: 'USA',
    breachHistory: null,
    description: `${cleanName} enterprise cloud software and workflow integration.`,
    storeUrl: candidateDomain ? `https://${candidateDomain}` : null,
    iconUrl,
    isVerified: Boolean(app.is_verified || app.isVerified)
  };
}

export function executeFullEnrichment() {
  console.log('[1] Connecting to SQLite database...');
  const db = new DatabaseSync(DB_PATH);

  const apps = db.prepare('SELECT * FROM applications').all();
  console.log(`✓ Found ${apps.length} total applications to enrich in database.`);

  const updateStmt = db.prepare(`
    UPDATE applications
    SET vendor = ?,
        publisher_domain = ?,
        category = ?,
        icon_url = ?,
        store_url = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `);

  let enrichedCount = 0;
  let domainsResolvedCount = 0;
  let customIconsAssigned = 0;

  db.exec('BEGIN TRANSACTION');

  for (const app of apps) {
    const meta = resolveApplicationMetadata(app);

    // Keep existing high quality icon if already set and not ui-avatars
    const finalIcon = (app.icon_url && !app.icon_url.includes('ui-avatars'))
      ? app.icon_url
      : meta.iconUrl;

    const finalDomain = app.publisher_domain || meta.publisherDomain || null;
    const finalVendor = (app.vendor && app.vendor !== 'Third-Party Developer' && app.vendor !== app.id)
      ? app.vendor
      : meta.vendor;
    const finalCategory = (app.category && app.category !== 'Configured SaaS' && app.category !== 'Unclassified SaaS')
      ? app.category
      : meta.category;
    const finalStore = app.store_url || meta.storeUrl || null;

    updateStmt.run(
      finalVendor,
      finalDomain,
      finalCategory,
      finalIcon,
      finalStore,
      app.id
    );

    enrichedCount++;
    if (finalDomain) domainsResolvedCount++;
    if (finalIcon && !finalIcon.includes('ui-avatars')) customIconsAssigned++;
  }

  db.exec('COMMIT');

  console.log(`✓ SQLite Database Enriched:`);
  console.log(`  - Total Applications Enriched: ${enrichedCount}`);
  console.log(`  - Domains Resolved: ${domainsResolvedCount}`);
  console.log(`  - Brand Icons Assigned: ${customIconsAssigned}`);

  // [2] Synchronize applications_catalog.json across all target directories
  console.log('[2] Synchronizing enriched JSON catalogs...');
  const primaryCatalogPath = CATALOG_PATHS[0];
  let catalogApps = [];
  if (fs.existsSync(primaryCatalogPath)) {
    catalogApps = JSON.parse(fs.readFileSync(primaryCatalogPath, 'utf8'));
  }

  const updatedCatalog = catalogApps.map(app => {
    const meta = resolveApplicationMetadata(app);
    return {
      ...app,
      vendor: (app.vendor && app.vendor !== 'Third-Party Developer' && app.vendor !== app.id) ? app.vendor : meta.vendor,
      publisherDomain: app.publisherDomain || meta.publisherDomain || '',
      category: (app.category && app.category !== 'Configured SaaS' && app.category !== 'Unclassified SaaS') ? app.category : meta.category,
      compliance: (app.compliance && app.compliance.length > 0 && app.compliance[0] !== 'Standard SaaS') ? app.compliance : meta.compliance,
      dataHosting: (app.dataHosting && app.dataHosting !== 'USA') ? app.dataHosting : meta.dataHosting,
      breachHistory: app.breachHistory || meta.breachHistory,
      description: (app.description && !app.description.includes('Imported from Google Workspace Master Apps Catalog')) ? app.description : meta.description,
      storeUrl: app.storeUrl || meta.storeUrl,
      iconUrl: (app.iconUrl && !app.iconUrl.includes('ui-avatars')) ? app.iconUrl : meta.iconUrl,
    };
  });

  for (const catPath of CATALOG_PATHS) {
    if (fs.existsSync(path.dirname(catPath))) {
      fs.writeFileSync(catPath, JSON.stringify(updatedCatalog, null, 2), 'utf8');
      console.log(`✓ Updated catalog: ${catPath} (${updatedCatalog.length} apps)`);
    }
  }

  return {
    totalEnriched: enrichedCount,
    domainsResolved: domainsResolvedCount,
    brandIconsAssigned: customIconsAssigned,
    totalCatalogApps: updatedCatalog.length
  };
}

if (process.argv[1]?.endsWith('enrich_all_applications.mjs')) {
  const res = executeFullEnrichment();
  console.log('\nEnrichment Summary:');
  console.log(JSON.stringify(res, null, 2));
}
