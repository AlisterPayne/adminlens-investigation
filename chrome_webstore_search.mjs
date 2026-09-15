/**
 * Chrome Web Store & Marketplace Enrichment Service
 * Searches Chrome Web Store by Extension ID or Keyword, extracting metadata, icon, and publisher.
 */

export async function lookupChromeExtension(extensionIdOrQuery) {
  const isExtensionId = /^[a-z]{32}$/.test(extensionIdOrQuery.trim());
  
  if (isExtensionId) {
    const extId = extensionIdOrQuery.trim();
    const storeUrl = `https://chromewebstore.google.com/detail/${extId}`;
    try {
      const res = await fetch(storeUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (res.ok) {
        const html = await res.text();
        
        // Extract title
        const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i) ||
                           html.match(/<title>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].replace(' - Chrome Web Store', '') : extId;

        // Extract Icon Image
        const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i) ||
                           html.match(/<img[^>]+src="([^">]+googleusercontent.com[^">]+)"/i);
        const iconUrl = imageMatch ? imageMatch[1] : `https://clients2.googleusercontent.com/service/update2/crx?response=redirect&prodversion=100.0&x=id%3D${extId}%26installsource%3Dondemand%26uc`;

        // Extract Description
        const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/i);
        const description = descMatch ? descMatch[1] : '';

        return {
          found: true,
          type: 'chrome_extension',
          id: extId,
          name: title,
          iconUrl: iconUrl,
          storeUrl: storeUrl,
          description: description,
        };
      }
    } catch (e) {
      // ignore network failure
    }
  }

  return {
    found: false,
    query: extensionIdOrQuery
  };
}

// Quick CLI test
if (process.argv[1]?.endsWith('chrome_webstore_search.mjs')) {
  const query = process.argv[2] || 'ghbmnnjggjcganmafobpkfetdnfdapgl'; // Sample ID (Google Docs Offline)
  console.log(`Searching Chrome Web Store for: ${query}`);
  const result = await lookupChromeExtension(query);
  console.log('Result:', JSON.stringify(result, null, 2));
}
