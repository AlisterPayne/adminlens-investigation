import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { resolveApplicationMetadata } from './enrich_all_applications.mjs';
import { calculateInherentRisk } from './app_enrichment_service.mjs';

const MASTER_CATALOG_PATH = path.resolve('mosaic-next/data/master_applications_catalog.json');
const DB_PATH = path.resolve('adminlens.db');

console.log('=== ENRICHING BACKEND MASTER APPLICATION REPOSITORY ===\n');

if (!fs.existsSync(MASTER_CATALOG_PATH)) {
  console.error(`Master catalog not found at ${MASTER_CATALOG_PATH}`);
  process.exit(1);
}

const masterApps = JSON.parse(fs.readFileSync(MASTER_CATALOG_PATH, 'utf-8'));
console.log(`Loaded ${masterApps.length} master family entries to enrich.`);

let db = null;
if (fs.existsSync(DB_PATH)) {
  db = new DatabaseSync(DB_PATH);
}

let enrichedVendors = 0;
let resolvedDomains = 0;
let brandIconsAssigned = 0;
let categoriesUpdated = 0;

const updateDbStmt = db ? db.prepare(`
  UPDATE applications
  SET vendor = ?,
      publisher_domain = ?,
      category = ?,
      icon_url = ?,
      store_url = ?,
      updated_at = datetime('now')
  WHERE id = ?
`) : null;

if (db) db.exec('BEGIN TRANSACTION');

const enrichedCatalog = masterApps.map(app => {
  const meta = resolveApplicationMetadata(app);

  const finalVendor = (meta.vendor && meta.vendor !== 'Third-Party Developer' && meta.vendor !== app.id)
    ? meta.vendor
    : (app.vendor && app.vendor !== 'Third-Party Developer' ? app.vendor : meta.vendor);

  const finalDomain = meta.publisherDomain || app.publisherDomain || '';
  const finalCategory = meta.category || app.category || 'Configured SaaS';
  const finalCompliance = (meta.compliance && meta.compliance.length > 0) ? meta.compliance : (app.compliance || ['Standard Terms']);
  const finalDataHosting = meta.dataHosting || app.dataHosting || 'USA';
  const finalBreachHistory = meta.breachHistory || app.breachHistory || null;
  const finalStoreUrl = meta.storeUrl || app.storeUrl || (finalDomain ? `https://${finalDomain}` : null);
  const finalDescription = meta.description || app.description;

  // Use high-resolution favicon from Google CDN if domain exists or if icon is ui-avatars
  let finalIcon = app.iconUrl;
  if (finalDomain) {
    finalIcon = `https://www.google.com/s2/favicons?domain=${finalDomain}&sz=128`;
  } else if (!finalIcon || finalIcon.includes('ui-avatars')) {
    finalIcon = meta.iconUrl || finalIcon;
  }

  if (finalDomain) resolvedDomains++;
  if (finalIcon && !finalIcon.includes('ui-avatars')) brandIconsAssigned++;
  if (finalVendor && finalVendor !== 'Third-Party Developer') enrichedVendors++;
  if (finalCategory && finalCategory !== 'Unclassified SaaS') categoriesUpdated++;

  // Update primary app in SQLite
  if (updateDbStmt) {
    updateDbStmt.run(
      finalVendor,
      finalDomain || null,
      finalCategory,
      finalIcon,
      finalStoreUrl,
      app.id
    );
  }

  // Also enrich sibling deployments
  const enrichedSiblings = (app.siblingDeployments || []).map(child => {
    const childMeta = resolveApplicationMetadata(child);
    const childDomain = childMeta.publisherDomain || finalDomain || '';
    const childVendor = childMeta.vendor || finalVendor;
    const childCategory = childMeta.category || finalCategory;
    let childIcon = child.iconUrl;
    if (childDomain) {
      childIcon = `https://www.google.com/s2/favicons?domain=${childDomain}&sz=128`;
    } else if (!childIcon || childIcon.includes('ui-avatars')) {
      childIcon = childMeta.iconUrl || finalIcon;
    }

    if (updateDbStmt && child.id) {
      updateDbStmt.run(
        childVendor,
        childDomain || null,
        childCategory,
        childIcon,
        childMeta.storeUrl || finalStoreUrl,
        child.id
      );
    }

    return {
      ...child,
      vendor: childVendor,
      category: childCategory,
      publisherDomain: childDomain,
      iconUrl: childIcon,
      storeUrl: childMeta.storeUrl || finalStoreUrl
    };
  });

  return {
    ...app,
    vendor: finalVendor,
    publisherDomain: finalDomain,
    category: finalCategory,
    compliance: finalCompliance,
    dataHosting: finalDataHosting,
    breachHistory: finalBreachHistory,
    description: finalDescription,
    storeUrl: finalStoreUrl,
    iconUrl: finalIcon,
    siblingDeployments: enrichedSiblings
  };
});

if (db) {
  db.exec('COMMIT');
  console.log('✓ SQLite database updated with enriched metadata.');
}

fs.writeFileSync(MASTER_CATALOG_PATH, JSON.stringify(enrichedCatalog, null, 2), 'utf-8');
console.log(`✓ Master catalog written to ${MASTER_CATALOG_PATH}.`);

console.log('\n================ ENRICHMENT RESULTS ================');
console.log(`Total Master Applications:     ${enrichedCatalog.length}`);
console.log(`Vendors Enriched:              ${enrichedVendors}`);
console.log(`Domains Resolved:              ${resolvedDomains}`);
console.log(`Brand CDN Icons Assigned:      ${brandIconsAssigned}`);
console.log(`Categories Normalized:         ${categoriesUpdated}`);
console.log('====================================================\n');
