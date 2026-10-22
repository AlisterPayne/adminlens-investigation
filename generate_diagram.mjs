import fs from 'fs';
import { execSync } from 'child_process';

// Helper to render crisp 3px orthogonal connectors with arrowheads in both SVG and PNG
function conn(pts, color) {
  const segs = [];
  const t = 3;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    if (y1 === y2) {
      const rx = Math.min(x1, x2);
      const rw = Math.abs(x2 - x1);
      segs.push(`<rect x="${rx}" y="${y1 - t / 2}" width="${rw}" height="${t}" fill="${color}" />`);
    } else if (x1 === x2) {
      const ry = Math.min(y1, y2);
      const rh = Math.abs(y2 - y1);
      segs.push(`<rect x="${x1 - t / 2}" y="${ry}" width="${t}" height="${rh}" fill="${color}" />`);
    }
  }
  const [lx1, ly1] = pts[pts.length - 2];
  const [lx2, ly2] = pts[pts.length - 1];
  if (ly1 === ly2 && lx2 > lx1) {
    segs.push(`<polygon points="${lx2 + 7},${ly2} ${lx2 - 3},${ly2 - 5} ${lx2 - 3},${ly2 + 5}" fill="${color}"/>`);
  } else if (lx1 === lx2 && ly2 > ly1) {
    segs.push(`<polygon points="${lx2},${ly2 + 7} ${lx2 - 5},${ly2 - 3} ${lx2 + 5},${ly2 - 3}" fill="${color}"/>`);
  } else if (lx1 === lx2 && ly2 < ly1) {
    segs.push(`<polygon points="${lx2},${ly2 - 7} ${lx2 - 5},${ly2 + 3} ${lx2 + 5},${ly2 + 3}" fill="${color}"/>`);
  }
  return segs.join('\n  ');
}

const connectorsSvg = [
  // Ingest -> Root Gate
  conn([[215, 520], [248, 520]], '#0284c7'),
  // Root Gate -> Secured Baseline (Top)
  conn([[357, 455], [357, 173], [1233, 173]], '#059669'),
  // Root Gate -> Branch A: TRUSTED Gate T1
  conn([[460, 495], [485, 495], [485, 435], [508, 435]], '#7c3aed'),
  // Root Gate -> Branch B: UNCONFIGURED Gate U1
  conn([[357, 585], [357, 985], [508, 985]], '#ea580c'),

  // TRUSTED Branch Connectors
  // T1 (YES: New Scope Requested) -> Gate T2 (Google Scope Category)
  conn([[620, 380], [620, 335], [768, 335]], '#dc2626'),
  // Gate T2 -> Restricted (CRITICAL)
  conn([[1010, 300], [1233, 300]], '#dc2626'),
  // Gate T2 -> Sensitive (HIGH)
  conn([[1010, 335], [1125, 335], [1125, 374], [1233, 374]], '#ea580c'),
  // Gate T2 -> Non-Sensitive (MEDIUM)
  conn([[1010, 370], [1100, 370], [1100, 448], [1233, 448]], '#d97706'),

  // T1 (NO: No New Scope) -> Gate T3 (When Last Reviewed?)
  conn([[620, 490], [620, 580], [693, 580]], '#7c3aed'),
  // Gate T3 (YES: <= 6 Months) -> Outcome T-B (No Recommendation)
  conn([[915, 550], [1140, 550], [1140, 524], [1233, 524]], '#059669'),
  // Gate T3 (NO: >= 6 Months & Beyond) -> Gate T4 (Risk Score Check)
  conn([[915, 605], [973, 605]], '#ea580c'),
  // Gate T4 (Critical 4-5 or High 3-4) -> Outcome T-C (Review Again)
  conn([[1195, 595], [1233, 595]], '#ea580c'),
  // Gate T4 (Score 1, 2, or 3) -> Outcome T-D (No Recommendation)
  conn([[1195, 645], [1215, 645], [1215, 690], [1233, 690]], '#059669'),

  // =========================================================================
  // UNCONFIGURED Branch Connectors (Gate U1 -> Gate U2 / Gate U3 -> Tiers 1-4)
  // =========================================================================
  // Gate U1 (Score 4-5 High/Critical) -> Gate U2 (Verification, Users & Recency)
  conn([[725, 950], [755, 950], [755, 895], [788, 895]], '#dc2626'),
  // Gate U1 (Score 1-3 Low/Moderate) -> Gate U3 (30-Day Activity Check)
  conn([[725, 1020], [755, 1020], [755, 1082], [788, 1082]], '#d97706'),

  // Gate U2 (Unverified, <= 1 User, or Dormant > 30d) -> TIER 1
  conn([[1065, 868], [1145, 868], [1145, 850], [1233, 850]], '#dc2626'),
  // Gate U2 (Google-Verified + Multi-User + Active <= 30d) -> TIER 2
  conn([[1065, 922], [1145, 922], [1145, 944], [1233, 944]], '#ea580c'),

  // Gate U3 (Active <= 30d) -> TIER 3
  conn([[1065, 1055], [1145, 1055], [1145, 1036], [1233, 1036]], '#eab308'),
  // Gate U3 (Dormant > 30d Inactive) -> TIER 4
  conn([[1065, 1110], [1145, 1110], [1145, 1126], [1233, 1126]], '#64748b'),
].join('\n  ');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1820 1240" width="1820" height="1240" style="background:#ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <defs>
    <!-- Subtle Print-Friendly Drop Shadow -->
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Explicit White Background for Printing -->
  <rect width="1820" height="1240" fill="#ffffff" />

  <!-- ==================== HEADER ==================== -->
  <g transform="translate(45, 28)">
    <rect x="0" y="0" width="1730" height="76" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
    <text x="28" y="34" fill="#0f172a" font-size="22" font-weight="900" letter-spacing="0.5">ADMINLENS GOVERNANCE DECISION TREE</text>
    <text x="28" y="57" fill="#475569" font-size="12" font-weight="600">Holy Grail: SPECIFIC GOOGLE DATA • BLOCK Only for Rare High-Risk School Issues • NEVER Recommend TRUSTED • LIMITED Case-by-Case</text>

    <!-- Action Legend Pills -->
    <g transform="translate(975, 22)">
      <rect x="0" y="0" width="238" height="32" rx="8" fill="#ecfdf5" stroke="#059669" stroke-width="1.5"/>
      <circle cx="15" cy="16" r="5" fill="#059669"/>
      <text x="27" y="20" fill="#065f46" font-size="10" font-weight="900">HOLY GRAIL: SPECIFIC GOOGLE DATA</text>

      <rect x="248" y="0" width="172" height="32" rx="8" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5"/>
      <circle cx="263" cy="16" r="5" fill="#dc2626"/>
      <text x="275" y="20" fill="#991b1b" font-size="10" font-weight="800">BLOCK (RARE KNOWN ISSUE)</text>

      <rect x="430" y="0" width="150" height="32" rx="8" fill="#f8fafc" stroke="#64748b" stroke-dasharray="3 2" stroke-width="1.5"/>
      <circle cx="445" cy="16" r="5" fill="#64748b"/>
      <text x="457" y="20" fill="#334155" font-size="10" font-weight="800">LIMITED (CASE-BY-CASE)</text>

      <rect x="590" y="0" width="142" height="32" rx="8" fill="#faf5ff" stroke="#9333ea" stroke-width="1.5"/>
      <circle cx="605" cy="16" r="5" fill="#9333ea"/>
      <text x="617" y="20" fill="#6b21a8" font-size="10" font-weight="900">NEVER TRUSTED</text>
    </g>
  </g>

  <!-- ==================== SECTION BACKGROUNDS ==================== -->
  <!-- Branch A: TRUSTED Section Container -->
  <rect x="495" y="235" width="1280" height="510" rx="18" fill="#faf5ff" stroke="#9333ea" stroke-dasharray="6 4" stroke-width="1.5"/>
  <text x="515" y="258" fill="#6b21a8" font-size="11.5" font-weight="900" letter-spacing="1">BRANCH A — EXISTING TRUSTED APPS GOVERNANCE (WE NEVER RECOMMEND TRUSTED • DOWNGRADE TO SPECIFIC GOOGLE DATA)</text>

  <!-- Branch B: UNCONFIGURED Section Container -->
  <rect x="495" y="770" width="1280" height="430" rx="18" fill="#fff7ed" stroke="#ea580c" stroke-dasharray="6 4" stroke-width="1.5"/>
  <text x="515" y="793" fill="#9a3412" font-size="11.5" font-weight="900" letter-spacing="1">BRANCH B — HOW UNCONFIGURED APPS FLOW INTO THE 4 TIERS (GATE U1 → GATE U2 / U3 → PRIORITY TIER &amp; RECOMMENDED ACTION)</text>

  <!-- ==================== FLOW CONNECTORS & ARROWHEADS ==================== -->
  ${connectorsSvg}

  <!-- ==================== 1. INGESTION NODE ==================== -->
  <g transform="translate(45, 455)">
    <rect width="170" height="130" rx="14" fill="#f0f9ff" stroke="#0284c7" stroke-width="2"/>
    <rect x="12" y="12" width="28" height="28" rx="6" fill="#0284c7"/>
    <text x="26" y="30" fill="#ffffff" font-size="12" text-anchor="middle" font-weight="900">IN</text>
    <text x="48" y="26" fill="#0f172a" font-size="13" font-weight="800">App Ingested</text>
    <text x="48" y="40" fill="#0369a1" font-size="10" font-weight="700">Domain Telemetry</text>

    <line x1="12" y1="50" x2="158" y2="50" stroke="#bae6fd" stroke-width="1.2"/>
    <text x="14" y="68" fill="#334155" font-size="10" font-weight="600">• Risk Score (1.0–5.0)</text>
    <text x="14" y="84" fill="#334155" font-size="10" font-weight="600">• Admin Policy State</text>
    <text x="14" y="100" fill="#334155" font-size="10" font-weight="600">• New Scope Diff &amp; Tier</text>
    <text x="14" y="116" fill="#334155" font-size="10" font-weight="600">• 6-Mo Review Timestamp</text>
  </g>

  <!-- ==================== 2. ROOT GATE: WORKSPACE POLICY ==================== -->
  <g transform="translate(255, 455)">
    <rect width="205" height="130" rx="14" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
    <text x="102" y="26" fill="#0284c7" font-size="11" font-weight="900" text-anchor="middle" letter-spacing="0.5">ROOT GATE</text>
    <text x="102" y="46" fill="#0f172a" font-size="14" font-weight="800" text-anchor="middle">Workspace Policy?</text>
    <line x1="16" y1="56" x2="189" y2="56" stroke="#cbd5e1" stroke-width="1.2"/>
    <text x="102" y="76" fill="#334155" font-size="11" font-weight="600" text-anchor="middle">Splits into 3 tracks by</text>
    <text x="102" y="92" fill="#0369a1" font-size="11" font-weight="800" text-anchor="middle">adminAccessLevel</text>
    <text x="102" y="112" fill="#475569" font-size="9.5" font-weight="600" text-anchor="middle">Configured vs Trusted vs Unconfigured</text>
  </g>

  <!-- Path Labels from Root Gate -->
  <g transform="translate(372, 148)">
    <rect width="215" height="22" rx="6" fill="#ecfdf5" stroke="#059669" stroke-width="1.5"/>
    <text x="107" y="15" fill="#065f46" font-size="10" font-weight="800" text-anchor="middle">SPECIFIC_DATA / LIMITED / BLOCKED</text>
  </g>

  <g transform="translate(390, 410)">
    <rect width="84" height="22" rx="6" fill="#f3e8ff" stroke="#7c3aed" stroke-width="1.5"/>
    <text x="42" y="15" fill="#5b21b6" font-size="10" font-weight="800" text-anchor="middle">TRUSTED</text>
  </g>

  <g transform="translate(372, 955)">
    <rect width="115" height="22" rx="6" fill="#ffedd5" stroke="#ea580c" stroke-width="1.5"/>
    <text x="57" y="15" fill="#9a3412" font-size="10" font-weight="800" text-anchor="middle">UNCONFIGURED</text>
  </g>

  <!-- ========================================================================= -->
  <!-- ==================== TOP OUTCOME: SECURED BASELINE ====================== -->
  <!-- ========================================================================= -->
  <g transform="translate(1240, 128)">
    <rect width="510" height="88" rx="14" fill="#ecfdf5" stroke="#059669" stroke-width="2"/>
    <rect x="14" y="12" width="120" height="22" rx="5" fill="#059669"/>
    <text x="74" y="27" fill="#ffffff" font-size="10" font-weight="900" text-anchor="middle">NO ACTION NEEDED</text>
    <text x="146" y="28" fill="#064e3b" font-size="13" font-weight="800">Hardened Baseline ("The Holy Grail")</text>
    <line x1="14" y1="42" x2="496" y2="42" stroke="#a7f3d0" stroke-width="1.2"/>
    <text x="14" y="60" fill="#065f46" font-size="10.5" font-weight="700">Policy locked to SPECIFIC GOOGLE DATA (or BLOCKED / case-by-case LIMITED).</text>
    <text x="14" y="76" fill="#047857" font-size="10" font-style="italic" font-weight="600">Zero recommendations generated — counts toward 100% domain posture.</text>
  </g>

  <!-- ========================================================================= -->
  <!-- ==================== BRANCH A: TRUSTED POLICY GATES ===================== -->
  <!-- ========================================================================= -->

  <!-- GATE T1: NEW SCOPE REQUESTED ONLY -->
  <g transform="translate(515, 380)">
    <rect width="210" height="110" rx="14" fill="#ffffff" stroke="#7c3aed" stroke-width="2"/>
    <text x="105" y="23" fill="#6d28d9" font-size="10.5" font-weight="900" text-anchor="middle" letter-spacing="0.5">GATE T1: SCOPE CHECK</text>
    <text x="105" y="43" fill="#0f172a" font-size="13" font-weight="800" text-anchor="middle">New Scope Requested?</text>
    <line x1="14" y1="53" x2="196" y2="53" stroke="#e9d5ff" stroke-width="1.2"/>
    <text x="105" y="72" fill="#b45309" font-size="10" font-weight="800" text-anchor="middle">Audit log incremental scope grant</text>
    <text x="105" y="88" fill="#475569" font-size="9.5" font-weight="600" text-anchor="middle">• YES → Go to Gate T2 (Scope Tier)</text>
    <text x="105" y="102" fill="#475569" font-size="9.5" font-weight="600" text-anchor="middle">• NO → Go to Gate T3 (Last Reviewed)</text>
  </g>

  <!-- Path label T1 -> YES (New Scope) -->
  <g transform="translate(632, 311)">
    <rect width="128" height="20" rx="5" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5"/>
    <text x="64" y="14" fill="#991b1b" font-size="9.5" font-weight="800" text-anchor="middle">YES (New Scope)</text>
  </g>

  <!-- Path label T1 -> NO (No New Scope) -->
  <g transform="translate(534, 525)">
    <rect width="76" height="20" rx="5" fill="#f1f5f9" stroke="#64748b" stroke-width="1.5"/>
    <text x="38" y="14" fill="#334155" font-size="9.5" font-weight="800" text-anchor="middle">NO</text>
  </g>

  <!-- GATE T2: GOOGLE SCOPE CATEGORY / CRITERIA -->
  <g transform="translate(775, 275)">
    <rect width="235" height="120" rx="14" fill="#ffffff" stroke="#dc2626" stroke-width="2"/>
    <text x="117" y="22" fill="#b91c1c" font-size="10" font-weight="900" text-anchor="middle" letter-spacing="0.5">GATE T2: GOOGLE SCOPE CRITERIA</text>
    <text x="117" y="41" fill="#0f172a" font-size="12.5" font-weight="800" text-anchor="middle">Google Scope Category?</text>
    <line x1="14" y1="50" x2="221" y2="50" stroke="#fecaca" stroke-width="1.2"/>
    <text x="117" y="69" fill="#b91c1c" font-size="10" font-weight="800" text-anchor="middle">• Restricted → CRITICAL Rec</text>
    <text x="117" y="87" fill="#c2410c" font-size="10" font-weight="800" text-anchor="middle">• Sensitive → HIGH Rec</text>
    <text x="117" y="105" fill="#b45309" font-size="10" font-weight="800" text-anchor="middle">• Non-Sensitive → MEDIUM Rec</text>
  </g>

  <!-- Path labels from Gate T2 -->
  <g transform="translate(1022, 277)">
    <rect width="92" height="19" rx="4" fill="#fef2f2" stroke="#dc2626" stroke-width="1.2"/>
    <text x="46" y="13" fill="#991b1b" font-size="9" font-weight="800" text-anchor="middle">RESTRICTED</text>
  </g>
  <g transform="translate(1134, 351)">
    <rect width="88" height="19" rx="4" fill="#fff7ed" stroke="#ea580c" stroke-width="1.2"/>
    <text x="44" y="13" fill="#9a3412" font-size="9" font-weight="800" text-anchor="middle">SENSITIVE</text>
  </g>
  <g transform="translate(1110, 425)">
    <rect width="105" height="19" rx="4" fill="#fffbeb" stroke="#d97706" stroke-width="1.2"/>
    <text x="52" y="13" fill="#92400e" font-size="9" font-weight="800" text-anchor="middle">NON-SENSITIVE</text>
  </g>

  <!-- GATE T3: TIME-BASED WHEN LAST REVIEWED -->
  <g transform="translate(700, 525)">
    <rect width="215" height="110" rx="14" fill="#ffffff" stroke="#7c3aed" stroke-width="2"/>
    <text x="107" y="23" fill="#6d28d9" font-size="10" font-weight="900" text-anchor="middle" letter-spacing="0.5">GATE T3: LAST REVIEWED</text>
    <text x="107" y="42" fill="#0f172a" font-size="12.5" font-weight="800" text-anchor="middle">Reviewed &lt; 6 Months?</text>
    <line x1="14" y1="52" x2="201" y2="52" stroke="#e9d5ff" stroke-width="1.2"/>
    <text x="107" y="71" fill="#047857" font-size="10" font-weight="700" text-anchor="middle">• &lt; 6 Mos: No Recommendation</text>
    <text x="107" y="89" fill="#c2410c" font-size="10" font-weight="700" text-anchor="middle">• ≥ 6 Mos &amp; Beyond: Check Score</text>
    <text x="107" y="103" fill="#475569" font-size="9" font-weight="600" text-anchor="middle">Time since last admin review</text>
  </g>

  <!-- Path label T3 -> YES (< 6m) -->
  <g transform="translate(930, 526)">
    <rect width="108" height="20" rx="5" fill="#ecfdf5" stroke="#059669" stroke-width="1.5"/>
    <text x="54" y="14" fill="#065f46" font-size="9" font-weight="800" text-anchor="middle">YES (&lt; 6 Months)</text>
  </g>

  <!-- Path label T3 -> NO (>= 6m) -->
  <g transform="translate(918, 612)">
    <rect width="60" height="19" rx="4" fill="#fff7ed" stroke="#ea580c" stroke-width="1.2"/>
    <text x="30" y="13" fill="#9a3412" font-size="8.5" font-weight="800" text-anchor="middle">≥ 6 Mos</text>
  </g>

  <!-- GATE T4: RISK SCORE DEPENDENCY (WHEN >= 6 MONTHS) -->
  <g transform="translate(980, 550)">
    <rect width="215" height="125" rx="14" fill="#ffffff" stroke="#ea580c" stroke-width="2"/>
    <text x="107" y="22" fill="#c2410c" font-size="10" font-weight="900" text-anchor="middle" letter-spacing="0.5">GATE T4: RISK SCORE TIER</text>
    <text x="107" y="41" fill="#0f172a" font-size="12.5" font-weight="800" text-anchor="middle">App Risk Score?</text>
    <line x1="14" y1="50" x2="201" y2="50" stroke="#fed7aa" stroke-width="1.2"/>
    <text x="107" y="69" fill="#b91c1c" font-size="9.5" font-weight="800" text-anchor="middle">• Critical (4–5) or High (3–4)</text>
    <text x="107" y="83" fill="#c2410c" font-size="9" font-weight="700" text-anchor="middle">→ Must Be Reviewed Again</text>
    <text x="107" y="102" fill="#047857" font-size="9.5" font-weight="800" text-anchor="middle">• Score 1, 2, or 3 (Low/Mod)</text>
    <text x="107" y="116" fill="#065f46" font-size="9" font-weight="700" text-anchor="middle">→ Fine (No Recommendation)</text>
  </g>

  <!-- ==================== TRUSTED BRANCH OUTCOME CARDS ==================== -->

  <!-- OUTCOME T-A1: NEW RESTRICTED SCOPE -> CRITICAL -->
  <g transform="translate(1240, 268)">
    <rect width="510" height="64" rx="10" fill="#fef2f2" stroke="#dc2626" stroke-width="2"/>
    <rect x="12" y="10" width="168" height="20" rx="4" fill="#dc2626"/>
    <text x="96" y="24" fill="#ffffff" font-size="9.5" font-weight="900" text-anchor="middle">CRITICAL RECOMMENDATION</text>
    <text x="190" y="24" fill="#7f1d1d" font-size="11.5" font-weight="800">New Restricted Scope Requested on Trusted App</text>
    <text x="14" y="48" fill="#991b1b" font-size="10" font-weight="700">Google Category: Restricted → Action: Set to SPECIFIC GOOGLE DATA (or BLOCK if school risk).</text>
  </g>

  <!-- OUTCOME T-A2: NEW SENSITIVE SCOPE -> HIGH -->
  <g transform="translate(1240, 342)">
    <rect width="510" height="64" rx="10" fill="#fff7ed" stroke="#ea580c" stroke-width="2"/>
    <rect x="12" y="10" width="150" height="20" rx="4" fill="#ea580c"/>
    <text x="87" y="24" fill="#ffffff" font-size="9.5" font-weight="900" text-anchor="middle">HIGH RECOMMENDATION</text>
    <text x="172" y="24" fill="#9a3412" font-size="11.5" font-weight="800">New Sensitive Scope Requested on Trusted App</text>
    <text x="14" y="48" fill="#9a3412" font-size="10" font-weight="700">Google Category: Sensitive → Action: Downgrade from Trusted to SPECIFIC GOOGLE DATA.</text>
  </g>

  <!-- OUTCOME T-A3: NEW NON-SENSITIVE SCOPE -> MEDIUM -->
  <g transform="translate(1240, 416)">
    <rect width="510" height="64" rx="10" fill="#fffbeb" stroke="#d97706" stroke-width="2"/>
    <rect x="12" y="10" width="160" height="20" rx="4" fill="#d97706"/>
    <text x="92" y="24" fill="#ffffff" font-size="9.5" font-weight="900" text-anchor="middle">MEDIUM RECOMMENDATION</text>
    <text x="182" y="24" fill="#92400e" font-size="11.5" font-weight="800">New Non-Sensitive Scope Requested on Trusted App</text>
    <text x="14" y="48" fill="#92400e" font-size="10" font-weight="700">Google Category: Non-Sensitive → Action: Audit scope &amp; set to SPECIFIC GOOGLE DATA.</text>
  </g>

  <!-- OUTCOME T-B: REVIEWED < 6 MONTHS -> NO RECOMMENDATION -->
  <g transform="translate(1240, 492)">
    <rect width="510" height="64" rx="10" fill="#ecfdf5" stroke="#059669" stroke-width="1.5"/>
    <rect x="12" y="10" width="135" height="20" rx="4" fill="#059669"/>
    <text x="79" y="24" fill="#ffffff" font-size="9.5" font-weight="900" text-anchor="middle">NO RECOMMENDATION</text>
    <text x="157" y="24" fill="#064e3b" font-size="11.5" font-weight="800">Reviewed Within the Last 6 Months (≤ 180 Days)</text>
    <text x="14" y="48" fill="#065f46" font-size="10" font-weight="600">No new scopes requested and administrator review is current (≤ 6 months).</text>
  </g>

  <!-- OUTCOME T-C: UNREVIEWED >= 6 MONTHS + SCORE 3-4 OR 4-5 -> REVIEW AGAIN -->
  <g transform="translate(1240, 568)">
    <rect width="510" height="76" rx="10" fill="#ffffff" stroke="#ea580c" stroke-width="2"/>
    <rect x="12" y="10" width="195" height="20" rx="4" fill="#ea580c"/>
    <text x="109" y="24" fill="#ffffff" font-size="9.5" font-weight="900" text-anchor="middle">RECOMMENDATION: REVIEW AGAIN</text>
    <text x="217" y="24" fill="#9a3412" font-size="11.5" font-weight="800">Reviewed ≥ 6 Mos Ago • Critical (4–5) or High (3–4)</text>
    <text x="14" y="46" fill="#334155" font-size="9.5" font-weight="600">Trusted app with High (3.0–4.0) or Critical (4.0–5.0) risk score not reviewed in ≥ 6 months.</text>
    <text x="14" y="63" fill="#065f46" font-size="9.5" font-weight="800">Action: Re-review application — transition to SPECIFIC GOOGLE DATA (never recommend Trusted).</text>
  </g>

  <!-- OUTCOME T-D: UNREVIEWED >= 6 MONTHS + SCORE 1, 2, OR 3 -> NO RECOMMENDATION -->
  <g transform="translate(1240, 656)">
    <rect width="510" height="68" rx="10" fill="#ecfdf5" stroke="#059669" stroke-width="1.5"/>
    <rect x="12" y="10" width="135" height="20" rx="4" fill="#059669"/>
    <text x="79" y="24" fill="#ffffff" font-size="9.5" font-weight="900" text-anchor="middle">NO RECOMMENDATION</text>
    <text x="157" y="24" fill="#064e3b" font-size="11.5" font-weight="800">Reviewed ≥ 6 Mos Ago • Score 1, 2, or 3 (Low / Mod Risk)</text>
    <text x="14" y="48" fill="#065f46" font-size="10" font-weight="600">Risk score is 1, 2, or 3 with no new scopes requested — fine even if last reviewed ≥ 6 months ago.</text>
  </g>

  <!-- ========================================================================= -->
  <!-- ==================== BRANCH B: UNCONFIGURED (SHADOW IT) ================= -->
  <!-- ========================================================================= -->

  <!-- GATE U1: RISK SCORE SPLIT -->
  <g transform="translate(515, 912)">
    <rect width="210" height="145" rx="14" fill="#ffffff" stroke="#ea580c" stroke-width="2"/>
    <text x="105" y="22" fill="#c2410c" font-size="10" font-weight="900" text-anchor="middle" letter-spacing="0.5">GATE U1: RISK SCORE</text>
    <text x="105" y="41" fill="#0f172a" font-size="13" font-weight="800" text-anchor="middle">Scope Risk Tier?</text>
    <line x1="14" y1="50" x2="196" y2="50" stroke="#fed7aa" stroke-width="1.2"/>
    <text x="105" y="69" fill="#b91c1c" font-size="9.5" font-weight="800" text-anchor="middle">• Score 4–5 (High / Critical)</text>
    <text x="105" y="83" fill="#475569" font-size="8.5" font-weight="600" text-anchor="middle">→ Go to Gate U2 (Tiers 1 &amp; 2)</text>
    <text x="105" y="104" fill="#b45309" font-size="9.5" font-weight="800" text-anchor="middle">• Score 1–3 (Moderate / Low)</text>
    <text x="105" y="118" fill="#475569" font-size="8.5" font-weight="600" text-anchor="middle">→ Go to Gate U3 (Tiers 3 &amp; 4)</text>
    <text x="105" y="136" fill="#6b21a8" font-size="8" font-weight="900" text-anchor="middle">NEVER Recommend TRUSTED</text>
  </g>

  <!-- GATE U2: HIGH/CRITICAL RISK CONTEXT (SIFTS INTO TIER 1 vs TIER 2) -->
  <g transform="translate(795, 825)">
    <rect width="270" height="140" rx="14" fill="#ffffff" stroke="#dc2626" stroke-width="2"/>
    <text x="135" y="21" fill="#b91c1c" font-size="9" font-weight="900" text-anchor="middle" letter-spacing="0.3">GATE U2: HIGH/CRITICAL CONTEXT (SCORE 4–5)</text>
    <text x="135" y="39" fill="#0f172a" font-size="12" font-weight="800" text-anchor="middle">Verified &amp; Active Multi-User?</text>
    <line x1="14" y1="48" x2="256" y2="48" stroke="#fecaca" stroke-width="1.2"/>
    <text x="135" y="66" fill="#b91c1c" font-size="9.5" font-weight="800" text-anchor="middle">• Unverified, Single-User (≤ 1), or</text>
    <text x="135" y="80" fill="#b91c1c" font-size="9.5" font-weight="800" text-anchor="middle">Dormant (&gt; 30d) → Priority Tier 1</text>
    <line x1="24" y1="90" x2="246" y2="90" stroke="#fee2e2" stroke-width="1"/>
    <text x="135" y="107" fill="#c2410c" font-size="9.5" font-weight="800" text-anchor="middle">• Google-Verified &amp; Actively Used (≤ 30d)</text>
    <text x="135" y="121" fill="#c2410c" font-size="9.5" font-weight="800" text-anchor="middle">across multiple users → Priority Tier 2</text>
  </g>

  <!-- GATE U3: MODERATE/LOW RISK ACTIVITY (SIFTS INTO TIER 3 vs TIER 4) -->
  <g transform="translate(795, 1015)">
    <rect width="270" height="135" rx="14" fill="#ffffff" stroke="#d97706" stroke-width="2"/>
    <text x="135" y="21" fill="#b45309" font-size="9" font-weight="900" text-anchor="middle" letter-spacing="0.3">GATE U3: USAGE RECENCY (SCORE 1–3)</text>
    <text x="135" y="39" fill="#0f172a" font-size="12" font-weight="800" text-anchor="middle">Actively Used in Last 30 Days?</text>
    <line x1="14" y1="48" x2="256" y2="48" stroke="#fde68a" stroke-width="1.2"/>
    <text x="135" y="68" fill="#b45309" font-size="9.5" font-weight="800" text-anchor="middle">• Actively Used (≤ 30 days) with</text>
    <text x="135" y="82" fill="#b45309" font-size="9.5" font-weight="800" text-anchor="middle">Moderate/Low scopes → Priority Tier 3</text>
    <line x1="24" y1="92" x2="246" y2="92" stroke="#fef3c7" stroke-width="1"/>
    <text x="135" y="109" fill="#475569" font-size="9.5" font-weight="800" text-anchor="middle">• Dormant Shadow IT (&gt; 30 days</text>
    <text x="135" y="123" fill="#475569" font-size="9.5" font-weight="800" text-anchor="middle">inactive) → Priority Tier 4</text>
  </g>

  <!-- Path Badges into Tiers 1-4 -->
  <g transform="translate(1152, 826)">
    <rect width="72" height="19" rx="4" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5"/>
    <text x="36" y="13" fill="#991b1b" font-size="9" font-weight="900" text-anchor="middle">TIER 1</text>
  </g>
  <g transform="translate(1152, 920)">
    <rect width="72" height="19" rx="4" fill="#fff7ed" stroke="#ea580c" stroke-width="1.5"/>
    <text x="36" y="13" fill="#9a3412" font-size="9" font-weight="900" text-anchor="middle">TIER 2</text>
  </g>
  <g transform="translate(1152, 1012)">
    <rect width="72" height="19" rx="4" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
    <text x="36" y="13" fill="#854d0e" font-size="9" font-weight="900" text-anchor="middle">TIER 3</text>
  </g>
  <g transform="translate(1152, 1102)">
    <rect width="72" height="19" rx="4" fill="#f8fafc" stroke="#64748b" stroke-width="1.5"/>
    <text x="36" y="13" fill="#334155" font-size="9" font-weight="900" text-anchor="middle">TIER 4</text>
  </g>

  <!-- ==================== UNCONFIGURED 4-TIER OUTCOME CARDS ==================== -->

  <!-- TIER 1: HIGH/CRITICAL RISK UNVERIFIED, SINGLE-USER, OR DORMANT -->
  <g transform="translate(1240, 810)">
    <rect width="510" height="80" rx="12" fill="#fef2f2" stroke="#dc2626" stroke-width="2"/>
    <rect x="12" y="10" width="76" height="20" rx="4" fill="#dc2626"/>
    <text x="50" y="24" fill="#ffffff" font-size="9.5" font-weight="900" text-anchor="middle">TIER 1</text>
    <text x="98" y="24" fill="#7f1d1d" font-size="10.2" font-weight="800">High/Critical Risk (Score 4–5): Unverified, Single-User (≤ 1), or Dormant (&gt; 30d)</text>
    <line x1="12" y1="35" x2="498" y2="35" stroke="#fecaca" stroke-width="1"/>
    <text x="14" y="51" fill="#065f46" font-size="9.5" font-weight="800">Recommended Action: SPECIFIC GOOGLE DATA (if validated for school use) —</text>
    <text x="14" y="67" fill="#991b1b" font-size="9.5" font-weight="800">or BLOCK only for the very few apps with extreme risk and a known issue for the school.</text>
  </g>

  <!-- TIER 2: HIGH RISK SPRAWL VERIFIED & ACTIVELY USED -->
  <g transform="translate(1240, 904)">
    <rect width="510" height="80" rx="12" fill="#ecfdf5" stroke="#059669" stroke-width="2"/>
    <rect x="12" y="10" width="76" height="20" rx="4" fill="#ea580c"/>
    <text x="50" y="24" fill="#ffffff" font-size="9.5" font-weight="900" text-anchor="middle">TIER 2</text>
    <text x="98" y="24" fill="#064e3b" font-size="10.2" font-weight="800">High Risk Sprawl (Score 4–5): Google-Verified &amp; Actively Used (≤ 30d) Multi-User</text>
    <line x1="12" y1="35" x2="498" y2="35" stroke="#a7f3d0" stroke-width="1"/>
    <text x="14" y="51" fill="#065f46" font-size="9.5" font-weight="800">Recommended Action: SPECIFIC GOOGLE DATA (The Holy Grail)</text>
    <text x="14" y="67" fill="#047857" font-size="9.5" font-weight="600">(Approves exact current scopes across users; blocks any future silent scope escalation).</text>
  </g>

  <!-- TIER 3: MODERATE / LOW SCOPE SPRAWL ACTIVE -->
  <g transform="translate(1240, 998)">
    <rect width="510" height="76" rx="12" fill="#ecfdf5" stroke="#059669" stroke-width="2"/>
    <rect x="12" y="10" width="76" height="20" rx="4" fill="#eab308"/>
    <text x="50" y="24" fill="#ffffff" font-size="9.5" font-weight="900" text-anchor="middle">TIER 3</text>
    <text x="98" y="24" fill="#064e3b" font-size="10.2" font-weight="800">Moderate / Low Scope Sprawl (Score 1–3): Actively Used Within Last 30 Days</text>
    <line x1="12" y1="35" x2="498" y2="35" stroke="#a7f3d0" stroke-width="1"/>
    <text x="14" y="51" fill="#065f46" font-size="9.5" font-weight="800">Recommended Action: SPECIFIC GOOGLE DATA (locks current scope footprint;</text>
    <text x="14" y="66" fill="#475569" font-size="9.5" font-style="italic" font-weight="700">Limited is case-by-case only; never recommend Trusted).</text>
  </g>

  <!-- TIER 4: DORMANT SHADOW IT (> 30 DAYS INACTIVE) -->
  <g transform="translate(1240, 1088)">
    <rect width="510" height="76" rx="12" fill="#f8fafc" stroke="#059669" stroke-width="2"/>
    <rect x="12" y="10" width="76" height="20" rx="4" fill="#64748b"/>
    <text x="50" y="24" fill="#ffffff" font-size="9.5" font-weight="900" text-anchor="middle">TIER 4</text>
    <text x="98" y="24" fill="#0f172a" font-size="11" font-weight="800">Dormant Shadow IT (&gt; 30 Days Inactive)</text>
    <line x1="12" y1="35" x2="498" y2="35" stroke="#cbd5e1" stroke-width="1"/>
    <text x="14" y="51" fill="#065f46" font-size="9.5" font-weight="800">Recommended Action: Review in Google Admin Console &amp; set to SPECIFIC GOOGLE DATA</text>
    <text x="14" y="66" fill="#475569" font-size="9.5" font-style="italic" font-weight="700">(Informational guidance only — never recommend Trusted; Limited is case-by-case).</text>
  </g>

</svg>`;

// Write SVG files
fs.writeFileSync('./recommendations_decision_tree.svg', svgContent);
if (fs.existsSync('./mosaic-next/public')) {
  fs.writeFileSync('./mosaic-next/public/recommendations_decision_tree.svg', svgContent);
}
if (fs.existsSync('./public')) {
  fs.writeFileSync('./public/recommendations_decision_tree.svg', svgContent);
}

console.log('✓ SVG diagram generated successfully: recommendations_decision_tree.svg');

// Render high-res PNG using ImageMagick
try {
  execSync('magick ./recommendations_decision_tree.svg ./recommendations_decision_tree.png', { stdio: 'inherit' });
  console.log('✓ High-resolution PNG generated: recommendations_decision_tree.png');
} catch (err) {
  console.log('Note on PNG render: ' + err.message);
}
