import { execSync, fork } from 'child_process';
import fs from 'fs';
import path from 'path';

const WORKSPACE_DIR = '/home/alister/MCP-servers/adminlens-investigation';
const SYNC_STATUS_FILE = path.join(WORKSPACE_DIR, 'mosaic-next', 'data', 'sync_status.json');
const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

console.log('=== ADMINLENS 24-HOUR DATA PULL BACKGROUND DAEMON INITIALIZED ===');
console.log(`Working Directory: ${WORKSPACE_DIR}`);
console.log(`Cadence: Every 24 hours (${INTERVAL_MS / 1000 / 60 / 60}h)`);

function executePull() {
  console.log(`[${new Date().toISOString()}] Triggering scheduled 24-hour data pull execution...`);
  try {
    execSync('/usr/bin/node run_daily_data_pull.mjs', { cwd: WORKSPACE_DIR, stdio: 'inherit' });
    console.log(`[${new Date().toISOString()}] Scheduled 24-hour data pull completed successfully.`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Scheduled data pull error:`, err.message);
  }
}

// Check last run time
function checkAndRun() {
  if (fs.existsSync(SYNC_STATUS_FILE)) {
    try {
      const status = JSON.parse(fs.readFileSync(SYNC_STATUS_FILE, 'utf8'));
      if (status.lastRunTimestamp) {
        const lastRun = new Date(status.lastRunTimestamp).getTime();
        const now = Date.now();
        const diff = now - lastRun;
        if (diff < INTERVAL_MS) {
          const remainingHours = ((INTERVAL_MS - diff) / 1000 / 60 / 60).toFixed(1);
          console.log(`[${new Date().toISOString()}] Last pull was recent (${new Date(lastRun).toLocaleString()}). Next pull scheduled in ~${remainingHours} hours.`);
          return;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // If never run or > 24 hours ago, run now
  executePull();
}

// Initial check
checkAndRun();

// Set 24 hour interval loop
setInterval(() => {
  executePull();
}, INTERVAL_MS);
