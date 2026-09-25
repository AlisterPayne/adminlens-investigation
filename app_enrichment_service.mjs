/**
 * Admin Lens: Automated Application Enrichment & Discovery Service
 * Enriches OAuth applications with Vendor info, Compliance, Data Residency,
 * Breach History, and App Types.
 */

export const ENRICHED_VENDOR_REGISTRY = {
  // AI & GenAI Tools
  'claude': {
    vendor: 'Anthropic',
    domain: 'anthropic.com',
    category: 'AI & Machine Learning',
    appType: 'Web Application',
    compliance: ['SOC 2', 'GDPR', 'HIPAA'],
    dataHosting: 'USA',
    verified: true,
    description: 'Next-generation AI assistant built by Anthropic.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128'
  },
  'suno': {
    vendor: 'Suno, Inc.',
    domain: 'suno.com',
    category: 'AI & Audio Generation',
    appType: 'Web Application',
    compliance: ['GDPR'],
    dataHosting: 'USA',
    verified: true,
    description: 'AI-powered music and audio generation platform.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=suno.com&sz=128'
  },
  'google ai studio': {
    vendor: 'Google LLC',
    domain: 'aistudio.google.com',
    category: 'AI & Developer Tools',
    appType: 'Web Application',
    compliance: ['SOC 2', 'SOC 3', 'ISO 27001', 'GDPR', 'HIPAA'],
    dataHosting: 'USA / Global',
    verified: true,
    description: 'Fast prototyping environment for Gemini models and generative AI APIs.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=google.com&sz=128'
  },
  'gemini for workspace studio': {
    vendor: 'Google LLC',
    domain: 'workspace.google.com',
    category: 'AI & Collaboration',
    appType: 'Workspace Add-on',
    compliance: ['SOC 2', 'SOC 3', 'ISO 27001', 'GDPR', 'FERPA'],
    dataHosting: 'USA / Global',
    verified: true,
    description: 'Google Workspace generative AI integration for Docs, Sheets, and Gmail.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=google.com&sz=128'
  },
  'gemini-enterprise': {
    vendor: 'Google LLC',
    domain: 'cloud.google.com',
    category: 'AI & Enterprise Cloud',
    appType: 'Enterprise Cloud Service',
    compliance: ['SOC 2', 'ISO 27001', 'GDPR'],
    dataHosting: 'USA / Global',
    verified: true,
    description: 'Google Cloud Gemini Enterprise AI deployment and management.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=cloud.google.com&sz=128'
  },

  // Design & Creative
  'canva': {
    vendor: 'Canva Pty Ltd',
    domain: 'canva.com',
    category: 'Design & Creative',
    appType: 'Web Application',
    compliance: ['SOC 2', 'GDPR', 'ISO 27001', 'FERPA'],
    dataHosting: 'USA / Australia',
    verified: true,
    breaches: [
      {
        incidentDate: '2019-05-24',
        title: 'Canva Account Database Exposure',
        recordsImpacted: '139M accounts',
        severity: 'HIGH',
        cve: null,
        remediated: true,
        details: 'Customer credentials compromised; salted and hashed passwords.'
      }
    ],
    breachHistory: '1 incident (May 2019 - 139M accounts)',
    description: 'Visual communication platform and graphic design suite.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=canva.com&sz=128'
  },
  'figma': {
    vendor: 'Figma, Inc.',
    domain: 'figma.com',
    category: 'Design & Creative',
    appType: 'Web Application',
    compliance: ['SOC 2', 'SOC 3', 'ISO 27001', 'GDPR'],
    dataHosting: 'USA',
    verified: true,
    description: 'Collaborative web-based interface design and prototyping tool.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=figma.com&sz=128'
  },

  // Productivity & Utilities
  'bitly': {
    vendor: 'Bitly, Inc.',
    domain: 'bitly.com',
    category: 'Productivity & Marketing',
    appType: 'Web Application',
    compliance: ['SOC 2', 'GDPR'],
    dataHosting: 'USA',
    verified: true,
    breaches: [
      {
        incidentDate: '2014-05-08',
        title: 'Bitly Account Credential Compromise',
        recordsImpacted: 'OAuth credentials and API tokens',
        severity: 'HIGH',
        cve: null,
        remediated: true,
        details: 'Adversary accessed credentials; Bitly revoked all Facebook/Twitter OAuth tokens.'
      }
    ],
    breachHistory: '1 incident (May 2014 - Account credentials)',
    description: 'Link management and URL shortening service.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=bitly.com&sz=128'
  },
  'grammarly': {
    vendor: 'Grammarly, Inc.',
    domain: 'grammarly.com',
    category: 'Productivity & AI Writing',
    appType: 'Chrome Extension / Web App',
    compliance: ['SOC 2', 'ISO 27001', 'GDPR', 'HIPAA'],
    dataHosting: 'USA',
    verified: true,
    description: 'Cloud-based typing assistant and generative writing enhancement platform.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=grammarly.com&sz=128'
  },
  'pdfsimpli': {
    vendor: 'WorkSimpli Software LLC',
    domain: 'pdfsimpli.com',
    category: 'Document Management',
    appType: 'Web Application',
    compliance: ['GDPR'],
    dataHosting: 'USA',
    verified: true,
    description: 'Online PDF editor and document conversion SaaS.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=pdfsimpli.com&sz=128'
  },
  'mylogin': {
    vendor: 'Wonde Ltd (MyLogin)',
    domain: 'mylogin.com',
    category: 'Identity & Single Sign-On',
    appType: 'Single Sign-On / Identity Portal',
    compliance: ['SOC 2', 'ISO 27001', 'GDPR', 'FERPA', 'Cyber Essentials Plus'],
    dataHosting: 'UK / EU / Global',
    verified: true,
    description: 'School and enterprise single sign-on, identity federation, and multi-factor authentication portal.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=mylogin.com&sz=128'
  },
  'bulksignature': {
    vendor: 'BulkSignature',
    domain: 'bulksignature.com',
    category: 'Email Signature Management',
    appType: 'Web Application',
    compliance: ['GDPR'],
    dataHosting: 'EU',
    verified: false,
    description: 'Centralized Gmail email signature management tool.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=bulksignature.com&sz=128'
  },

  // Education & LMS
  'wayground': {
    vendor: 'Wayground (Quizizz Inc.)',
    domain: 'wayground.com',
    category: 'Education & LMS',
    appType: 'Web Application',
    compliance: ['SOC 2', 'FERPA', 'COPPA', 'GDPR'],
    dataHosting: 'USA',
    verified: true,
    description: 'Interactive gamified student assessment platform.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=wayground.com&sz=128'
  },
  'quizizz': {
    vendor: 'Quizizz Inc.',
    domain: 'quizizz.com',
    category: 'Education & LMS',
    appType: 'Web Application',
    compliance: ['SOC 2', 'FERPA', 'COPPA', 'GDPR'],
    dataHosting: 'USA',
    verified: true,
    description: 'Student quiz and engagement learning software.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=quizizz.com&sz=128'
  },
  'padlet': {
    vendor: 'Wallwisher, Inc. (Padlet)',
    domain: 'padlet.com',
    category: 'Education & Collaboration',
    appType: 'Web Application',
    compliance: ['SOC 2', 'FERPA', 'COPPA', 'GDPR'],
    dataHosting: 'USA',
    verified: true,
    description: 'Online collaborative noticeboard and classroom curation tool.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=padlet.com&sz=128'
  },
  'wonde school portal': {
    vendor: 'Wonde Ltd',
    domain: 'wonde.com',
    category: 'Education & Identity Management',
    appType: 'School SSO Portal',
    compliance: ['ISO 27001', 'GDPR', 'FERPA'],
    dataHosting: 'UK / EU',
    verified: true,
    description: 'Single sign-on and student information system (SIS) data synchronization portal.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=wonde.com&sz=128'
  },
  'mylogin': {
    vendor: 'Wonde Ltd (MyLogin)',
    domain: 'mylogin.com',
    category: 'Education & Identity Management',
    appType: 'School SSO Portal',
    compliance: ['ISO 27001', 'GDPR', 'FERPA'],
    dataHosting: 'UK / EU',
    verified: true,
    description: 'K-12 Single Sign-On and QR badge login system for classroom devices.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=mylogin.com&sz=128'
  },
  'bark for schools': {
    vendor: 'Bark Technologies, Inc.',
    domain: 'bark.us',
    category: 'Student Safety & Threat Detection',
    appType: 'Monitoring Service',
    compliance: ['FERPA', 'COPPA', 'GDPR', 'SOC 2'],
    dataHosting: 'USA',
    verified: true,
    description: 'AI-powered student safety monitoring and content filtering for Google Workspace accounts.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=bark.us&sz=128'
  },
  'exceedlms': {
    vendor: 'Intellum (Exceed LMS)',
    domain: 'intellum.com',
    category: 'Education & LMS',
    appType: 'Web Application',
    compliance: ['SOC 2', 'GDPR'],
    dataHosting: 'USA',
    verified: true,
    description: 'Enterprise and customer education learning management system.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=intellum.com&sz=128'
  },
  'google skills': {
    vendor: 'Google LLC',
    domain: 'cloud.google.com',
    category: 'Training & Certification',
    appType: 'Web Application',
    compliance: ['SOC 2', 'GDPR', 'ISO 27001'],
    dataHosting: 'USA',
    verified: true,
    description: 'Google Cloud official technical learning and certification portal.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=google.com&sz=128'
  },

  // Device & Fleet Management
  'chromebook getter': {
    vendor: 'Chromebook Getter (CDW / Amplified IT)',
    domain: 'chromebookgetter.com',
    category: 'Endpoint & Device Management',
    appType: 'Google Sheets Add-on',
    compliance: ['FERPA', 'COPPA', 'GDPR'],
    dataHosting: 'USA',
    verified: true,
    description: 'Bulk Chromebook inventory management and ChromeOS provisioning tool for Google Sheets.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=chromebookgetter.com&sz=128'
  },
  'apple business manager': {
    vendor: 'Apple Inc.',
    domain: 'business.apple.com',
    category: 'MDM & Enterprise Deployment',
    appType: 'Enterprise Cloud Service',
    compliance: ['ISO 27001', 'ISO 27018', 'GDPR', 'SOC 2'],
    dataHosting: 'USA / Global',
    verified: true,
    description: 'Apple device enrollment and volume app distribution service.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=apple.com&sz=128'
  },
  'ios account manager': {
    vendor: 'Apple Inc.',
    domain: 'apple.com',
    category: 'Mobile OS Sync',
    appType: 'Native Mobile Sync',
    compliance: ['ISO 27001', 'GDPR'],
    dataHosting: 'USA / Device',
    verified: true,
    description: 'Native Apple iOS account sync for Google Mail, Calendar, and Contacts.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=apple.com&sz=128'
  },
  'macos': {
    vendor: 'Apple Inc.',
    domain: 'apple.com',
    category: 'Operating System Sync',
    appType: 'Native Desktop Sync',
    compliance: ['ISO 27001', 'GDPR'],
    dataHosting: 'USA / Device',
    verified: true,
    description: 'Native Apple macOS account sync for Google Mail, Calendar, and Contacts.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=apple.com&sz=128'
  },

  // Admin & Security
  'adminlens': {
    vendor: 'Admin Lens',
    domain: 'adminlens.io',
    category: 'Cloud Security & Governance',
    appType: 'Security Application',
    compliance: ['SOC 2 (In-Progress)', 'GDPR', 'POPIA'],
    dataHosting: 'South Africa / EU',
    verified: false,
    description: 'Google Workspace security auditing, posture management, and recommendation platform.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=adminlens.io&sz=128'
  },
  'gam project creation': {
    vendor: 'GAM Open Source',
    domain: 'github.com/GAM-team/GAM',
    category: 'IT Admin & Automation',
    appType: 'Command-Line IT Tool',
    compliance: ['Open Source Audited'],
    dataHosting: 'Local / Tenant Only',
    verified: true,
    description: 'Command-line management tool for Google Workspace domain administration.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=128'
  },
  'gam': {
    vendor: 'GAM Open Source',
    domain: 'github.com/GAM-team/GAM',
    category: 'IT Admin & Automation',
    appType: 'Command-Line IT Tool',
    compliance: ['Open Source Audited'],
    dataHosting: 'Local / Tenant Only',
    verified: true,
    description: 'Command-line management tool for Google Workspace domain administration.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=128'
  },

  // Sales & Lead Intelligence
  'lusha': {
    vendor: 'Lusha Systems Inc.',
    domain: 'lusha.com',
    category: 'Sales & Contact Intelligence',
    appType: 'Chrome Extension / Web App',
    compliance: ['SOC 2', 'ISO 27701', 'GDPR', 'CCPA'],
    dataHosting: 'USA',
    verified: true,
    description: 'B2B data enrichment and prospect contact information tool.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=lusha.com&sz=128'
  },
  'apollo': {
    vendor: 'Apollo.io (ZenProspect, Inc.)',
    domain: 'apollo.io',
    category: 'Sales & Marketing Automation',
    appType: 'Chrome Extension / Web App',
    compliance: ['SOC 2', 'GDPR', 'ISO 27001'],
    dataHosting: 'USA',
    verified: true,
    description: 'B2B sales intelligence and email sequence automation platform.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=apollo.io&sz=128'
  },

  // Education & Productivity Additions from Console Baseline
  'orbitnote': {
    vendor: 'Texthelp Ltd.',
    domain: 'texthelp.com',
    category: 'Education & Accessibility',
    appType: 'Chrome Extension / Web App',
    compliance: ['FERPA', 'COPPA', 'GDPR', 'SOC 2'],
    dataHosting: 'USA / EU',
    verified: true,
    description: 'PDF reader and digital annotation toolbar for Google Drive and Classroom.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=texthelp.com&sz=128'
  },
  'mailsuite': {
    vendor: 'Mailtrack / Mailsuite, S.L.',
    domain: 'mailsuite.com',
    category: 'Productivity & Email Tracking',
    appType: 'Gmail Add-on / Extension',
    compliance: ['GDPR', 'ISO 27001'],
    dataHosting: 'EU',
    verified: true,
    description: 'Email read tracking and document analytics for Gmail.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=mailsuite.com&sz=128'
  },
  'wedo': {
    vendor: 'LEGO System A/S (LEGO Education)',
    domain: 'education.lego.com',
    category: 'STEM & Robotics',
    appType: 'Mobile & Desktop App',
    compliance: ['COPPA', 'GDPR'],
    dataHosting: 'EU / Local',
    verified: true,
    description: 'Robotics and coding software for LEGO Education WeDo 2.0 classroom kits.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=lego.com&sz=128'
  },
  'spike': {
    vendor: 'LEGO System A/S (LEGO Education)',
    domain: 'education.lego.com',
    category: 'STEM & Robotics',
    appType: 'Mobile & Desktop App',
    compliance: ['COPPA', 'GDPR'],
    dataHosting: 'EU / Local',
    verified: true,
    description: 'STEAM learning app for LEGO Education SPIKE Prime and Essential.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=lego.com&sz=128'
  },
  'zoho': {
    vendor: 'Zoho Corporation',
    domain: 'zoho.com',
    category: 'Productivity & Calendar Sync',
    appType: 'Mobile Sync App',
    compliance: ['SOC 2', 'ISO 27001', 'GDPR', 'HIPAA'],
    dataHosting: 'Global / USA',
    verified: true,
    description: 'Calendar synchronization between Google Workspace and Zoho apps.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=zoho.com&sz=128'
  },
  'grasshopper': {
    vendor: 'Google LLC',
    domain: 'grasshopper.app',
    category: 'Education & Coding',
    appType: 'Web Application',
    compliance: ['Google Privacy & Security'],
    dataHosting: 'USA',
    verified: true,
    description: 'Coding and beginner JavaScript learning platform by Google.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=google.com&sz=128'
  },
  'google device policy': {
    vendor: 'Google LLC',
    domain: 'google.com',
    category: 'MDM & Endpoint Security',
    appType: 'Mobile Device Agent',
    compliance: ['SOC 2', 'SOC 3', 'ISO 27001', 'GDPR'],
    dataHosting: 'Google Cloud',
    verified: true,
    description: 'Enforces security policies and management on mobile devices accessing domain data.',
    iconUrl: 'https://www.google.com/s2/favicons?domain=google.com&sz=128'
  }
};

/**
 * Enriches an application record by matching against known registry,
 * domain heuristics, or developer signatures.
 */
export function enrichApplicationRecord(app) {
  const normName = (app.displayName || app.name || '').toLowerCase().trim();
  
  // 1. Direct registry match
  for (const [key, info] of Object.entries(ENRICHED_VENDOR_REGISTRY)) {
    if (normName === key || normName.includes(key)) {
      return {
        ...app,
        vendor: info.vendor,
        publisherDomain: info.domain,
        category: info.category,
        appType: info.appType || 'Web Application',
        compliance: info.compliance || ['GDPR'],
        dataHosting: info.dataHosting || 'USA',
        breachHistory: info.breachHistory || null,
        breaches: info.breaches || [],
        isVerified: info.verified,
        iconUrl: info.iconUrl,
        storeUrl: `https://${info.domain}`,
        description: info.description,
      };
    }
  }

  // 2. Internal / Developer custom Apps Scripts
  if (normName.includes("'s apps") || normName.includes('script') || normName.includes('project-') || normName.includes('untitled') || normName.includes('leave')) {
    const isOwnerAdmin = normName.includes('gafe.co.za') || normName.includes('cloudedu');
    return {
      ...app,
      vendor: isOwnerAdmin ? 'Internal / Domain Developer' : 'Internal / Google Apps Script',
      publisherDomain: 'script.google.com',
      category: 'Internal Custom Automation',
      appType: 'Google Apps Script',
      compliance: ['Internal Tenant Only'],
      dataHosting: 'Google Cloud (Tenant)',
      breachHistory: null,
      breaches: [],
      isVerified: false,
      iconUrl: 'https://www.google.com/s2/favicons?domain=script.google.com&sz=128',
      storeUrl: 'https://script.google.com',
      description: 'Custom Google Apps Script or Cloud Project automation.',
    };
  }

  // 3. Fallback: Clean high-res SVG letter avatar
  const fallbackSvg = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.displayName || 'App')}&background=3B82F6&color=fff&size=128&rounded=true`;

  return {
    ...app,
    appType: app.appType || (app.isNativeApp ? 'Native Mobile Sync' : 'Web Application'),
    compliance: app.compliance || ['Standard Terms'],
    dataHosting: app.dataHosting || 'USA',
    breachHistory: null,
    breaches: [],
    iconUrl: app.iconUrl && !app.iconUrl.includes('avatar_square_grey') ? app.iconUrl : fallbackSvg,
  };
}

/**
 * Evaluates dynamic breach recency brackets and returns additive penalty.
 * Brackets:
 *  - <= 90 days  (<= 3 months):  +1.00 pts (Active crisis)
 *  - 91-180 days (3 - 6 months):  +0.60 pts (Recent compromise)
 *  - 181-365 days (6 - 12 months): +0.30 pts (Probationary)
 *  - > 365 days  (> 12 months):  +0.10 pts (Historical / Remediated)
 */
export function calculateBreachPenalty(breaches, referenceDate = new Date()) {
  if (!breaches || !Array.isArray(breaches) || breaches.length === 0) {
    return {
      penalty: 0.0,
      bracket: 'NONE',
      mostRecentDate: null,
      daysElapsed: null,
      breachCount: 0
    };
  }

  let minDays = Infinity;
  let mostRecent = null;

  for (const b of breaches) {
    if (!b.incidentDate) continue;
    const bDate = new Date(b.incidentDate);
    const diffMs = referenceDate.getTime() - bDate.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days >= 0 && days < minDays) {
      minDays = days;
      mostRecent = b;
    }
  }

  if (!mostRecent || minDays === Infinity) {
    return {
      penalty: 0.0,
      bracket: 'NONE',
      mostRecentDate: null,
      daysElapsed: null,
      breachCount: breaches.length
    };
  }

  if (minDays <= 90) {
    return {
      penalty: 1.00,
      bracket: 'ACTIVE_3M',
      label: 'Active Breach (≤ 3 months)',
      mostRecentDate: mostRecent.incidentDate,
      daysElapsed: minDays,
      breachCount: breaches.length
    };
  } else if (minDays <= 180) {
    return {
      penalty: 0.60,
      bracket: 'RECENT_6M',
      label: 'Recent Breach (3–6 months)',
      mostRecentDate: mostRecent.incidentDate,
      daysElapsed: minDays,
      breachCount: breaches.length
    };
  } else if (minDays <= 365) {
    return {
      penalty: 0.30,
      bracket: 'PROBATION_12M',
      label: 'Probationary Breach (6–12 months)',
      mostRecentDate: mostRecent.incidentDate,
      daysElapsed: minDays,
      breachCount: breaches.length
    };
  } else {
    return {
      penalty: 0.10,
      bracket: 'HISTORICAL',
      label: 'Historical Breach (> 12 months)',
      mostRecentDate: mostRecent.incidentDate,
      daysElapsed: minDays,
      breachCount: breaches.length
    };
  }
}

/**
 * Calculates Central Repository Inherent Application Risk (1.00 to 5.00 Scale).
 *
 * Formula:
 *  InherentRisk = Clamp( ScopeScore + VerificationPenalty + BreachPenalty, 1.00, 5.00 )
 */
export function calculateInherentRisk({
  scopesList = [],
  isVerified = false,
  breaches = [],
  appType = 'Web Application',
  referenceDate = new Date()
}) {
  // 1. Calculate Option B Scope Sensitivity
  const scores = (scopesList || []).map(s => s.admin_score || s.adminScore || 1);
  const peakScopeScore = scores.length > 0 ? Math.max(...scores) : 1;
  const sumScores = scores.reduce((sum, v) => sum + v, 0);
  const avgScopeScore = scores.length > 0 ? Number((sumScores / scores.length).toFixed(2)) : 1.0;

  const baseFloor = Math.max(0, peakScopeScore - 1);
  const nonPeakScores = scores.slice();
  if (nonPeakScores.length > 0) {
    nonPeakScores.splice(nonPeakScores.indexOf(peakScopeScore), 1);
  }

  const surcharge = nonPeakScores.reduce((acc, score) => {
    if (score === 5) return acc + 0.15;
    if (score === 4) return acc + 0.08;
    if (score === 3) return acc + 0.04;
    if (score === 2) return acc + 0.02;
    return acc + 0.01;
  }, 0);

  const maxHeadroom = peakScopeScore === 5 ? 1.00 : 0.99;
  const breadthScore = Number(Math.min(maxHeadroom, surcharge).toFixed(2));
  const scopeRiskScore = Number(Math.max(1.0, (baseFloor + breadthScore)).toFixed(2));

  // 2. Additive Verification Penalty (+0.35 if unverified, +0.15 if internal script)
  let verificationPenalty = 0.0;
  if (!isVerified) {
    if (appType === 'Google Apps Script' || (appType && appType.toLowerCase().includes('script'))) {
      verificationPenalty = 0.15;
    } else {
      verificationPenalty = 0.35;
    }
  }

  // 3. Additive Breach Penalty (Dynamic recency decay)
  const breachInfo = calculateBreachPenalty(breaches, referenceDate);
  const breachPenalty = breachInfo.penalty;

  // 4. Inherent Risk Score: Additive combination, clamped [1.00, 5.00]
  const rawComposite = scopeRiskScore + verificationPenalty + breachPenalty;
  const inherentRiskScore = Number(Math.min(5.00, Math.max(1.00, rawComposite)).toFixed(2));

  // 5. Tier & Color Mapping (Symmetrical 1 - 5)
  let riskLevel = 'LOW';
  let riskScoreColor = 'Blue';

  if (inherentRiskScore >= 4.00) {
    riskLevel = 'CRITICAL';
    riskScoreColor = 'Red';
  } else if (inherentRiskScore >= 3.00) {
    riskLevel = 'HIGH';
    riskScoreColor = 'Orange';
  } else if (inherentRiskScore >= 2.00) {
    riskLevel = 'MEDIUM';
    riskScoreColor = 'Yellow';
  } else if (inherentRiskScore >= 1.50) {
    riskLevel = 'LOW';
    riskScoreColor = 'Green';
  } else {
    riskLevel = 'LOW';
    riskScoreColor = 'Blue';
  }

  // 6. Descriptive Security Reasons
  const riskReasons = [];
  if (scores.some(s => s === 5)) {
    riskReasons.push('Critical Administrative or Direct Mail Access');
  }
  if (scores.some(s => s === 4)) {
    riskReasons.push('Full Google Drive Read/Write Access or Mail Modification');
  }
  if (scores.some(s => s === 3)) {
    riskReasons.push('Access to Domain Directory, Files, or Calendars');
  }
  if (verificationPenalty > 0) {
    riskReasons.push(`Unverified Publisher (+${verificationPenalty.toFixed(2)} Inherent Risk)`);
  }
  if (breachPenalty > 0) {
    riskReasons.push(`Vendor Breach Exposure: ${breachInfo.label} (+${breachPenalty.toFixed(2)})`);
  }
  if (riskReasons.length === 0) {
    riskReasons.push('Standard SaaS Integration');
  }

  return {
    riskScore: inherentRiskScore,
    riskLevel,
    riskScoreColor,
    scopeRiskScore,
    peakScopeScore,
    breadthScore,
    avgScopeScore,
    verificationPenalty,
    breachPenalty,
    breachBracket: breachInfo.bracket,
    breachDaysElapsed: breachInfo.daysElapsed,
    breaches: breaches || [],
    riskReasons
  };
}

