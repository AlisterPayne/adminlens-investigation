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

Traditional security assessments look at OAuth permissions in isolation:
* **Flaw 1: Ignores User Context (Blast Radius)**  
  A single OAuth token granted by a Super Admin can compromise the entire tenant, whereas the same scope granted by a standard student or temporary contractor is confined to individual data.
* **Flaw 2: Ignores Vendor Posture & Provenance**  
  An unverified publisher script created yesterday with Drive access presents a far higher risk than an enterprise vendor with SOC2 Type II, ISO 27001, and Google Partner verification.
* **Flaw 3: Ignores Tenant Access Control State**  
  An application marked `TRUSTED` in the Google Admin Console has an explicit bypass for API access restrictions. If that app is dormant or unmaintained, it represents a silent backdoor into corporate data.

---

## 3. The 4-Pillar Composite Risk Model (0–100 Scale)

AdminLens computes a composite risk score between **0 and 100** by evaluating four weighted vectors:

```
+-----------------------------------------------------------------------------------+
|                        ADMINLENS COMPOSITE RISK SCORE (0 - 100)                   |
+-------------------------+-------------------------+---------------+---------------+
| 1. Scope Sensitivity    | 2. Blast Radius         | 3. Vendor     | 4. Data       |
|    (0 - 35 pts)         |    (0 - 25 pts)         |    Posture    |    Residency  |
|                         |                         |  (0 - 25 pts) |  (0 - 15 pts) |
+-------------------------+-------------------------+---------------+---------------+
```

### Pillar 1: Scope Sensitivity (Weight: 0–35 Points / 1.00–5.00 Base Scale)
Evaluates **what data the token has technical authorization to access or manipulate**. Individual OAuth scopes are cataloged on an **Enterprise Threat Scale (1 to 5)** and aggregated using a **Non-Compensatory Floor Model (Option B)**:

* **Scope Threat Ratings (1–5)**:
  * **Level 5 — Critical (35 pts)**: Administrative or Direct Mail Access (`mail.google.com`, `gmail.modify`, `admin.directory.user`).
  * **Level 4 — High (25 pts)**: Full Google Drive Read/Write/Delete access (`drive`, `drive.file`).
  * **Level 3 — Medium (15 pts)**: Directory metadata, calendar, and contacts (`calendar`, `contacts`, `spreadsheets`).
  * **Level 2 — Minor (10 pts)**: Read-only educational or operational tools (`classroom.courses.readonly`).
  * **Level 1 — Low (5 pts)**: Basic authentication & profile assertion (`openid`, `email`, `profile`).

* **Option B Non-Compensatory Floor Aggregation**:
  To prevent the "Dilution Paradox" (where adding benign scopes dilutes severe permissions), the application's **Peak Scope establishes a non-dilutable Base Floor** (Level 5 $\to$ 4.50, Level 4 $\to$ 3.50, Level 3 $\to$ 2.50, Level 2 $\to$ 1.50, Level 1 $\to$ 1.00). Secondary scopes contribute an additive **Attack Surface Breadth Surcharge** (capped within tier headroom), ensuring strict monotonicity and preventing severe risks from ever being averaged away.

---

### Pillar 2: Blast Radius & Privilege Exposure (Weight: 0–25 Points)
Evaluates **whose credentials authorized the app and how widely it has spread**.

* **Super Admin Privilege (+15 pts)**:
  * Trigger: `adminUsersCount > 0`.
  * *Rationale*: If a Super Admin authorizes an application, any vulnerability in that application (or leak of its client secrets/refresh tokens) allows an adversary to pivot into full domain administration.
* **Organizational Reach (+10 pts)**:
  * Calculated as $\min(10, \text{totalUsersCount} \times 2)$.
  * Any application adopted by $> 5$ domain users automatically receives the maximum $+10$ points due to expanded lateral movement surface.

---

### Pillar 3: Vendor Security Posture & Verification (Weight: 0–25 Points)
Evaluates **who operates the software and their demonstrated security record**.

* **Public Breach History (+15 pts)**:
  * Cross-referenced against CVE, security advisories, and breach records (e.g. historical token leaks or credential exposure).
* **Unverified Publisher (+10 pts)**:
  * The application has **not** completed Google OAuth App Verification (`isVerified === false`), or is an unvetted script masquerading under an arbitrary name.
* **Verified Publisher (+2 pts baseline)**:
  * Google Workspace Marketplace vetted vendor with published privacy policies and verified domain ownership.

---

### Pillar 4: Data Residency & Jurisdictional Compliance (Weight: 0–15 Points)
Evaluates **where customer data flows and legal exposure under POPIA / GDPR**.

* **Undisclosed / Unknown Hosting (+15 pts)**:
  * The vendor fails to declare infrastructure residency, creating compliance liability under privacy regulations.
* **Foreign Cloud (+5 pts)**:
  * Hosted outside domestic/sovereign boundaries (e.g., US-only hosting for South African or EU corporate data) without standard contractual clauses or DPA agreements.
* **Local / Sovereign / Tenant-Internal (+3 pts)**:
  * Hosted locally or executed entirely within Google's cloud perimeter (e.g., internal Apps Scripts restricted to domain execution).

---

## 4. Contextual Policy Overlay (Google Admin Console Ground Truth)

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
