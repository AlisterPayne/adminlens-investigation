# AdminLens Application Risk Scoring Methodology & Interview Guide

> **Document Version**: 1.0.0  
> **Target Audience**: Security Leadership, Executive Reviewers, Technical Interviewers  
> **Last Updated**: September 2026  

---

## 1. Executive Summary (The 30-Second Elevator Pitch)

> *"Most SaaS security tools evaluate risk purely on OAuth scopes—treating every application requesting Google Drive access as an identical threat. In AdminLens, we recognized that **Scope $\neq$ Risk**.*  
>
> *A tool like GAM has critical domain scopes, but it is legitimate IT administration tooling operated by verified domain engineers. Conversely, an unverified third-party app with moderate scopes authorized by a Super Admin creates a catastrophic breach path.*  
>
> *To solve this, AdminLens computes a dynamic **0–100 Composite Risk Score** across four distinct pillars: **Scope Sensitivity**, **Blast Radius & Privilege Exposure**, **Vendor Security Posture**, and **Data Residency & Policy Alignment**."*

---

## 2. Architectural Philosophy: Why "Scope Only" Fails

## 2. Architectural Philosophy: Inherent Risk vs. Tenant Context

Traditional SaaS security tools conflate global knowledge with customer-specific telemetry:
* **The Central Repository Principle**: In a global SaaS catalog, an application exists *in the abstract*. We cannot evaluate whether a Super Admin consented to it or how many users have installed it, nor does GDPR compliance matter to a US customer. Those factors only exist once client tenant telemetry is ingested.
* **Separation of Layers**:
  1. **Layer 1: Scope & Service Threat Scale (1–5)**: Technical authorization rating of individual OAuth scopes.
  2. **Layer 2: Central Repository Inherent Application Risk (1.00–5.00 Scale)**: Inherent risk evaluated globally across Scope Sensitivity, Publisher Verification, and Time-Ring-fenced Breach History.
  3. **Layer 3: Tenant Operational Risk & Contextual Exposure**: Calculated dynamically when ingested into a specific client tenant (incorporating Super Admin Privilege, Lateral Blast Radius, and Customer Jurisdictional Data Residency).

---

## 3. Layer 2: Central Repository Inherent Risk Model (1.00 – 5.00 Scale)

In the central repository, every application receives an **Inherent Risk Score** on a **1.00 to 5.00 scale**, maintaining exact cognitive and visual symmetry with individual scopes and services:

```
+-----------------------------------------------------------------------------------+
|               CENTRAL REPOSITORY INHERENT APPLICATION RISK (1.00 - 5.00)          |
+------------------------------------+--------------------------+-------------------+
| 1. Scope Sensitivity (Option B)    | 2. Publisher Verification| 3. Breach Recency |
|    Base Floor + Breadth Surcharge  |    Additive (+0.00/+0.35)|    Ring-Fenced    |
|    (1.00 - 5.00 Base)              |                          |    (+0.00 - +1.00)|
+------------------------------------+--------------------------+-------------------+
```

### Mathematical Formulation:
$$R_{\text{inherent}} = \min\Big(5.00, \; \max\big(1.00, \; S_{\text{scope}} + \Delta_{\text{verification}} + \Delta_{\text{breach}}\big)\Big)$$

### Factor 1: Scope Sensitivity ($S_{\text{scope}} \in [1.00, 5.00]$)
Evaluates **what data the token has technical authorization to access or manipulate**. Individual OAuth scopes are cataloged on an **Enterprise Threat Scale (1 to 5)** and aggregated using a **Non-Compensatory Floor Model (Option B)**:
* **Scope Threat Ratings (1–5)**:
  * **Level 5 — Critical (Red)**: Administrative or Direct Mail Access (`mail.google.com`, `gmail.modify`, `admin.directory.user`).
  * **Level 4 — High (Orange)**: Full Google Drive Read/Write/Delete access (`drive`, `drive.file`).
  * **Level 3 — Medium (Yellow)**: Directory metadata, calendar, and contacts (`calendar`, `contacts`, `spreadsheets`).
  * **Level 2 — Minor (Green)**: Read-only educational or operational tools (`classroom.courses.readonly`).
  * **Level 1 — Low (Blue)**: Basic authentication & profile assertion (`openid`, `email`, `profile`).

* **Option B Non-Compensatory Floor Aggregation**:
  To prevent the "Dilution Paradox" (where adding benign scopes dilutes severe permissions), the application's **Peak Scope establishes a non-dilutable Base Floor**:
  $$\text{BaseFloor} = \max(0, \text{PeakScopeScore} - 1)$$
  - **Level 5 Peak** $\to$ Base Floor **4.00** $\implies$ Tier: **CRITICAL [4.00 – 5.00]** (Red)
  - **Level 4 Peak** $\to$ Base Floor **3.00** $\implies$ Final Tier: **HIGH [3.00 – 3.99]** (Orange)
  - **Level 3 Peak** $\to$ Base Floor **2.00** $\implies$ Final Tier: **MEDIUM [2.00 – 2.99]** (Yellow)
  - **Level 2 Peak** $\to$ Base Floor **1.00** $\implies$ Final Tier: **MINOR [1.00 – 1.99]** (Green)
  - **Level 1 Peak** $\to$ Base Floor **0.00** $\implies$ Final Tier: **LOW [0.00 – 0.99]** (Blue)

  Secondary scopes contribute an additive **Attack Surface Breadth Surcharge** (Extra Scope 5: +0.15, Extra Scope 4: +0.08, Extra Scope 3: +0.04, Extra Scope 2: +0.02, Extra Scope 1: +0.01; capped within tier headroom), ensuring strict monotonicity.

### Factor 2: Publisher Verification Modifier ($\Delta_{\text{verification}}$)
* **Verified Publisher (+0.00)**: Completed Google OAuth App Verification / CASA security assessment with verified domain ownership.
* **Unverified Publisher (+0.35 additive)**: Has not completed Google verification, representing elevated risk of unvetted third-party code.
* **Internal Domain Script (+0.15 additive)**: Internal Google Apps Script executing on tenant domain.

### Factor 3: Time-Decayed Breach Recency Ring-Fencing ($\Delta_{\text{breach}}$)
Rather than treating a decade-old incident identically to an active compromise, breach records are formalized as structured date objects and ring-fenced by time elapsed:
* **$\le 90$ Days ($\le 3$ Months) — Active Crisis / High Alert**: **+1.00 additive penalty**. Uncontained tokens, actively circulating dark-web credentials, incomplete remediation.
* **91 – 180 Days (3 – 6 Months) — Recent Compromise**: **+0.60 additive penalty**. Remediations deployed; ongoing credential rotation and audit probation.
* **181 – 365 Days (6 – 12 Months) — Probationary Monitoring**: **+0.30 additive penalty**. Vendor post-mortems published; operational stability monitoring.
* **$> 365$ Days ($> 12$ Months) — Historical / Remediated**: **+0.10 additive penalty**. Known legacy incident (e.g. Canva 2019, Bitly 2014); clean track record since.
* **No Known Breach**: **+0.00**.

---

## 4. 24-Hour Automated Breach Monitoring Engine

AdminLens executes an automated breach monitoring engine (`breach_monitoring_service.mjs`) on a continuous **24-hour cycle**:
* **Automated Daily Scan**: Evaluates the current calendar date against all vendor breach records.
* **Dynamic Recency Decay**: As incidents age past 90, 180, or 365 days, penalties automatically decay, updating risk scores without manual intervention.
* **Transition Logging & Catalog Sync**: Detects bracket transitions and synchronizes `adminlens.db` and frontend catalog JSON artifacts.
* **Operational Modes**: Runs as a daily cron job or continuous background daemon (`--daemon`).

---

## 5. Layer 3: Tenant Operational Risk & Contextual Overlay

When client data is connected (via `users.json`, `active_tokens.json`, `token_audit_events.json`, `owl_apps.csv`), AdminLens calculates the dynamic tenant-specific operational exposure:
* **Super Admin Privilege Exposure**: Triggered if `adminUsersCount > 0` (domain takeover path).
* **Lateral Blast Radius**: Scaled by user count and cross-OU spread.
* **Jurisdictional Data Alignment**: Evaluates **Customer Jurisdiction Profile vs. Vendor Data Hosting** (e.g. EU customer facing GDPR transfer exposure vs. US customer with zero GDPR liability).
* **Policy Baseline Reconciliation**:
  * **Dormant Trusted App**: Set to `TRUSTED` in Google Admin Console with $\le 1$ active user.
  * **Shadow IT Discovery**: High/Critical scope apps authorized without central IT policy review.
  * **Unmanaged Script Proliferation**: Custom Apps Scripts accessing sensitive services without source control.

---

## 6. Contextual Policy Overlay (Google Admin Console Ground Truth)

In addition to the raw 0–100 score, AdminLens correlates live API tokens with the **App Access Control baseline (`owl_apps.csv`)**:

| Finding | Detection Rule | Risk Implication | Recommended Action |
| :--- | :--- | :--- | :--- |
| **Dormant Trusted App** | App is set to `TRUSTED` in Google Admin Console, but has $\le 1$ active user. | Grants permanent API bypass to an unmonitored vendor. | Downgrade status to `LIMITED` or `BLOCKED`. |
| **Shadow IT Discovery** | App has `CRITICAL` or `HIGH` scopes, but does not appear in Admin Console policies. | Users granted self-service consent to high-risk tools without IT oversight. | Block app or require formal vendor security review. |
| **Unmanaged Script Proliferation** | Application ID begins with `project-` (Google Apps Script) with full Drive/Mail access. | Custom employee scripts running uncontrolled business logic. | Migrate to audited Service Account or restrict scopes. |

---

## 5. Three Real-World Case Studies from the Tenant

Use these concrete examples during an interview to demonstrate the depth of the platform:

```
+----------------------------------------------------------------------------------------------+
| 1. Bitly (URL Shortener)                                                                     |
|    - Scope: Medium (Calendar / Profile)                                                      |
|    - Exposure: 2 Users (Non-Admin)                                                           |
|    - Vendor Posture: ⚠️ Known historical credential compromise (+15 pts)                     |
|    - Risk Score: 68 (HIGH RISK)                                                              |
|    - Key Insight: Even modest scopes become dangerous when the vendor has a breach record.   |
+----------------------------------------------------------------------------------------------+
| 2. MyLogin (SSO Identity Provider)                                                           |
|    - Scope: Low (OpenID, Email, Profile)                                                     |
|    - Exposure: Authorized by Super Admin (+15 pts)                                           |
|    - Policy Status: Explicitly configured as TRUSTED in Admin Console                        |
|    - Risk Score: 32 (MODERATE RISK)                                                          |
|    - Key Insight: Score reflects admin exposure while acknowledging verified vendor status.  |
+----------------------------------------------------------------------------------------------+
| 3. GAM 7 (Google Apps Manager)                                                               |
|    - Scope: Critical (Full Directory, Settings, and User Management)                         |
|    - Exposure: Super Admin IT Infrastructure Tool                                            |
|    - Policy Status: Sanctioned Administrative Utility                                        |
|    - Risk Score: Filtered & Classified as Critical Infrastructure                            |
|    - Key Insight: Distinguishes legitimate administrative tooling from rogue shadow IT.      |
+----------------------------------------------------------------------------------------------+
```

---

## 6. Frequently Asked Interview Questions & Model Answers

### Q1: *"Why didn't you just use Google's native risk classifications?"*
> **Answer**: *"Google's native categorization is binary and scope-centric: it only tells you whether a scope is considered 'sensitive' or 'restricted'. It has zero awareness of organizational context. It cannot tell you whether the user is a Super Admin or an intern, whether the vendor had a public security breach last quarter, or whether an app configured as `TRUSTED` has been abandoned for two years. AdminLens bridges the gap between raw permission strings and operational security intelligence."*

### Q2: *"How does AdminLens prevent alert fatigue for already overwhelmed SecOps teams?"*
> **Answer**: *"We achieve this through two mechanisms:  
> 1. **Prioritization by Blast Radius**: Low-risk apps used by a single user are de-prioritized, while high-risk apps on Super Admin accounts are escalated immediately.  
> 2. **Actionable Playbooks**: Instead of dumping 50 alerts, AdminLens generates concrete, batch-remediable recommendations—such as 'Downgrade 8 Dormant Trusted Apps to Limited'—that administrators can execute in minutes."*

### Q3: *"What technical limitation in Google's APIs did you have to engineer around?"*
> **Answer**: *"The Google Admin SDK (both Reports API and Token API) only reflects active token grants from users. Crucially, it does not expose the tenant-level App Access Control policy state—meaning you cannot tell via standard API calls whether an app is configured as `TRUSTED`, `LIMITED`, or `BLOCKED`. We solved this by creating a reconciliation pipeline that ingests Google's ground-truth export (`owl_apps.csv`), parsing both OAuth client IDs and Apps Script deployment IDs into a unified security catalog."*
