import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const SPECIFIC_MAP = {
  // AI & Machine Learning
  '296758037454-ssrceub8i8moppipckhk61mk8go2kk6t.apps.googleusercontent.com': 'AI & Machine Learning', // Gemini for Workspace Studio
  '823511539352-ojaretejk1s95sdvkic0te923pt7knpu.apps.googleusercontent.com': 'AI & Machine Learning', // Google AI Studio
  '280951542138-r7h1ksj23kps66ri9j7dpc1cfks39ggv.apps.googleusercontent.com': 'AI & Machine Learning', // Kaggle
  '1014160490159-lajj2nh8obnt8kl8dpalef44ejkdn3n9.apps.googleusercontent.com': 'AI & Machine Learning', // Google Colaboratory
  '702630899118-pcadrocbc46vpjv2jeunv3jmjrhjctrn.apps.googleusercontent.com': 'AI & Machine Learning', // Meshy Google Auth

  // Education & EdTech
  '99790332366-7jbqgn7andc12kui6o7810gk03le7asr.apps.googleusercontent.com': 'Education & EdTech', // Edu Launchpad
  '1023251155897-tb54g624q9e77gtsrnemgv4c2ihekurv.apps.googleusercontent.com': 'Education & EdTech', // Google Skills
  '531246522847-cpii92d27guqb6mrvgtc8skipar03g1f.apps.googleusercontent.com': 'Education & EdTech', // Grasshopper

  // Developer & Cloud Infrastructure
  '953348912797-h2fo9tmk42mnrkk0kc6gula9i8ipv3re.apps.googleusercontent.com': 'Developer & Cloud Infrastructure', // Google AppSheet
  '985492994664-l10dkp3quk8rf0h0v96cfjmifikhqp81.apps.googleusercontent.com': 'Developer & Cloud Infrastructure', // jlcpcb-google-login
  '724256043927-qqf2lu66l75hjqeg5po2mopuprg9ee0e.apps.googleusercontent.com': 'Developer & Cloud Infrastructure', // Google I/O
  '764086051850-6qr4p6gpi6hn506pt8ejuq83di341hur.apps.googleusercontent.com': 'Developer & Cloud Infrastructure', // Google Auth Library
  '979392134394-q5ua43jp9hlv3lpt6kh7dm3o4v5gkddh.apps.googleusercontent.com': 'Developer & Cloud Infrastructure', // Cloud Onramp
  '710754565101-1ivtb6hsfjci3c006vtik3jmkviirgei.apps.googleusercontent.com': 'Developer & Cloud Infrastructure', // Google YOLO
  '829156766036-606hj7h5l4q58ehbrc2ltcnuib4fbp8l.apps.googleusercontent.com': 'Developer & Cloud Infrastructure', // Google Play Android Developer

  // Productivity & Calendar Sync
  '469390422673-r0p2tar3lgjlnhtsv4t4uonq4bi2svf8.apps.googleusercontent.com': 'Productivity & Calendar Sync', // Google Calendar for Workspace Studio
  '74919836968-1vv8gkse5mjv8ppr8qnjdms2hd6ot4sv.apps.googleusercontent.com': 'Productivity & Calendar Sync', // Checker Plus for Google Calendar
  '122167620338-e2r14b8fmjf9qumel5d7n9d916j6tsb6.apps.googleusercontent.com': 'Productivity & Calendar Sync', // Events with Google

  // Communication & Collaboration
  '873507009103-gi4ff8nkju6ggaurt6ebbiqrfmr0c79j.apps.googleusercontent.com': 'Communication & Collaboration', // Google Chat for Workspace Studio

  // Endpoint & Device Management
  '77185425430.apps.googleusercontent.com': 'Endpoint & Device Management', // Google Chrome
  '472234446753-42vl6rishfssq4peb9oq1utn7e09lstl.apps.googleusercontent.com': 'Endpoint & Device Management', // Google Device Management
  'com.google.DevicePolicy': 'Endpoint & Device Management', // Google Device Policy

  // Operating System Sync
  '899041083010-d9l71rq1omp8sj53qo1v0sjb9n6aqpu8.apps.googleusercontent.com': 'Operating System Sync', // CloudReady Home Edition

  // Productivity & Storage
  '947318989803-6bn6qk8qdgf4n4g3pfee6491hc0brc4i.apps.googleusercontent.com': 'Productivity & Storage', // Google Drive for desktop
  '947318989803-rvmefmc9rok273go8589cmo21dkvjb2q.apps.googleusercontent.com': 'Productivity & Storage', // Google Drive for desktop
  '1008750134848-6cqqtblpu42bbnohgeemhhetgc5tqish.apps.googleusercontent.com': 'Productivity & Storage', // Video Player for Google Drive

  // Document Management
  '222339878061-13uqre19u268oo9pdapuaifklbu8d6js.apps.googleusercontent.com': 'Document Management', // Zotero Google Docs Integration

  // Communication & Social
  '957889341671-vuc4bj4orhssrnjl6hs27m86sq8vfmcp.apps.googleusercontent.com': 'Communication & Social', // Ginger Google Plus

  // Media & Entertainment
  '188889564271-tnp5bieu9dh8pt9l2guo8i8ls68c8287.apps.googleusercontent.com': 'Media & Entertainment', // Skyworth TV shibuya
  '18972546450-666crn8r2d54glecckppqug4d1344u8o.apps.googleusercontent.com': 'Media & Entertainment', // Sony TV BRAVIA-VH2
  '334615908356-ni3qplf6hb1gtv9narsv5vfr3mhrkc5h.apps.googleusercontent.com': 'Media & Entertainment', // Chromecast & Assistant on Android TV
  '528702816550-hgi855ambgtjcik719mendp1j6j65gkr.apps.googleusercontent.com': 'Media & Entertainment', // Changhong TV ikebukuro
  '803032764244-of4uqk5hueah02js7qoiapqgqe54j9gv.apps.googleusercontent.com': 'Media & Entertainment', // Chromecast & Assistant on Android TV
  '9121908727-guq9hgcv5q3phft9176ukhik6e15opsb.apps.googleusercontent.com': 'Media & Entertainment', // YouTube Apple TV
  '293071437640-so4kujpqd0tj8b9vlln0e1e46egddqvc.apps.googleusercontent.com': 'Media & Entertainment', // Sing Google
  '1001902910251.apps.googleusercontent.com': 'Media & Entertainment', // YouTube on Xbox Live
  '1013212990023-o58vlp4r0ubgseg43i35tgruu6hnq4js.apps.googleusercontent.com': 'Media & Entertainment', // Xiaomi TV Oneday Cast Video Device
  '498579633514-r1l76sb3mvcvji3tu45vd5elrkkvjehl.apps.googleusercontent.com': 'Media & Entertainment', // Chromecast
};

// Default for all other 23 Google first-party workspace client apps is 'Productivity & Collaboration'
const DEFAULT_CATEGORY = 'Productivity & Collaboration';

function getNewCategory(appId) {
  return SPECIFIC_MAP[appId] || DEFAULT_CATEGORY;
}

const jsonFiles = [
  './mosaic-next/data/applications_catalog.json',
  './standardized_catalog/applications_catalog.json',
  './public/standardized_catalog.json'
];

let totalReclassified = 0;

for (const filePath of jsonFiles) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${fullPath}`);
    continue;
  }
  const apps = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  let fileCount = 0;
  for (const app of apps) {
    if (app.category === 'Google Services') {
      app.category = getNewCategory(app.id);
      fileCount++;
    }
  }
  fs.writeFileSync(fullPath, JSON.stringify(apps, null, 2), 'utf-8');
  console.log(`Updated ${filePath}: reclassified ${fileCount} apps.`);
  totalReclassified = fileCount;
}

// Update adminlens.db
const dbPath = path.resolve('./adminlens.db');
if (fs.existsSync(dbPath)) {
  const db = new DatabaseSync(dbPath);
  const selectStmt = db.prepare("SELECT id FROM applications WHERE category = 'Google Services'");
  const rows = selectStmt.all();
  console.log(`Found ${rows.length} apps in adminlens.db with category 'Google Services'.`);

  const updateStmt = db.prepare("UPDATE applications SET category = ? WHERE id = ?");
  for (const row of rows) {
    const newCat = getNewCategory(row.id);
    updateStmt.run(newCat, row.id);
  }
  console.log(`Updated adminlens.db: reclassified ${rows.length} apps.`);
}

console.log('Reclassification complete!');
