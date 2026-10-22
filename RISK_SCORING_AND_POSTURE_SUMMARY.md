# AdminLens — Risk Scoring & Posture Summary (Single-Page Reference)

## 1. Individual Application Risk Score (`1.00 – 5.00`)

Implemented in `calculateInherentRisk` (`app_enrichment_service.mjs`), each application deployment is scored using an **additive, non-compensatory formula** clamped between `1.00` and `5.00`:

```text
Inherent Risk = Clamp( ScopeScore + VerificationPenalty + BreachPenalty, 1.00, 5.00 )
```

### A. Scope Sensitivity (`ScopeScore`) — Non-Compensatory Floor + Breadth Surcharge
* **Individual Scope Scale (`1` to `5`):** Every OAuth scope is rated in `seed_scope_reference.mjs`:
  * **Score 5 (Critical):** Full Mail (`mail.google.com`, `gmail.modify`), Full Drive (`drive`), or Admin Directory control (`admin.directory.user`).
  * **Score 4 (High):** Mail Read/Compose/Settings (`gmail.readonly`, `gmail.compose`, `gmail.settings.basic`).
  * **Score 3 (Medium):** Direct Mail Send (`gmail.send`), Calendars, Contacts, and Spreadsheets read/write.
  * **Score 2 (Minor):** Read-only educational or operational scopes (`classroom.courses.readonly`).
  * **Score 1 (Low):** Basic authentication and identity (`openid`, `profile`, `email`).
* **Base Floor:** To prevent benign scopes from averaging down a dangerous scope (the *Dilution Paradox*), the highest-risk scope sets a non-dilutable floor:
  ```text
  BaseFloor = max(0, PeakScopeScore - 1)
  ```
* **Breadth Surcharge:** Every additional (non-peak) scope adds a small surcharge based on its severity (`+0.15` for Score 5, `+0.08` for Score 4, `+0.04` for Score 3, `+0.02` for Score 2, `+0.01` for Score 1), capped at `+0.99` (`+1.00` if Peak is 5).
* **Final Scope Score:** `ScopeScore = max(1.00, BaseFloor + BreadthScore)`

### B. Publisher Verification Penalty (`VerificationPenalty`)
* **Verified Publisher** (Google OAuth / CASA verified): **`+0.00`**
* **Internal Google Apps Script**: **`+0.15`**
* **Unverified Third-Party Publisher**: **`+0.35`**

### C. Time-Decayed Breach Recency Penalty (`BreachPenalty`)
* **Active Crisis (`<= 90 days` / `<= 3 mos`):** **`+1.00`**
* **Recent Breach (`91 – 180 days` / `3 – 6 mos`):** **`+0.60`**
* **Probationary (`181 – 365 days` / `6 – 12 mos`):** **`+0.30`**
* **Historical / Remediated (`> 365 days`):** **`+0.10`** *(e.g., Canva 2019, Bitly 2014)*
* **Clean Baseline (No known breach):** **`+0.00`**

---

## 2. Application Rating & Measurement Scale

Both individual OAuth scopes and final application risk scores map onto a symmetrical **1.00 to 5.00 scale**:

| Score Range | Risk Tier | Badge Color | Typical Profile |
| :--- | :--- | :--- | :--- |
| **`4.00 – 5.00`** | **CRITICAL** | 🔴 **Red** | Peak Scope 5 (Full Mail/Drive/Admin), or Scope 4 + Unverified/Breach penalties |
| **`3.00 – 3.99`** | **HIGH** | 🟠 **Orange** | Peak Scope 4 (Mail Read/Modify), or Scope 3 + Unverified + Recent Breach |
| **`2.00 – 2.99`** | **MEDIUM** | 🟡 **Yellow** | Peak Scope 3 (Calendars, Contacts, Sheets), or Scope 2 + Unverified/Breach |
| **`1.50 – 1.99`** | **LOW (Minor)** | 🟢 **Green** | Read-only operational scopes or basic scopes with unverified publisher (`+0.35`) |
| **`1.00 – 1.49`** | **LOW** | 🔵 **Blue** | Verified SSO-only apps (`openid`, `email`, `profile`) with clean or historical record |

---

## 3. Overall Risk Posture Score — How It Works in Detail

### The Core Philosophy: Inherent App Risk vs. Domain Governance Posture
* An **Individual App Risk Score (`1.00 – 5.00`)** measures *how dangerous an app's permissions and vendor are in the abstract*.
* The **Overall Risk Posture Score** measures *how well your Google Workspace admin policies govern and contain those apps across your domain*.
* Even a `5.00 CRITICAL` app poses zero active threat if your admin policy sets it to **`BLOCKED`** or locks it down to **`SPECIFIC_DATA`**. Conversely, a `3.50 HIGH` app left **`UNCONFIGURED`** (Shadow IT) or given a blanket **`TRUSTED`** bypass leaves the domain exposed.

---

### Part A: The Headline "3rd-Party Risk Posture Score" (`0% – 100%` Hardened)
Implemented in `MainDashboardView` (`mosaic-next/components/main-dashboard-view.tsx`), this is a **positive governance score** where **`100%` = Fully Hardened** (all third-party apps are under explicit, verified least-privilege control).

#### 1. How Every App in the Domain Is Categorized by Policy
Google Admin Console assigns every app one of 5 access states, which AdminLens groups into **3 Governance Buckets**:
1. **🏆 Secured Baseline (`SPECIFIC_DATA`, `LIMITED`, or `BLOCKED`):**
   * The app has been explicitly reviewed and locked down to least-privilege (or blocked outright).
   * **Counts as Governed (`+1` toward Posture Score).**
2. **🔓 Blanket `TRUSTED` (`TRUSTED`):**
   * Grants the app unrestricted access to *all current and future Google Workspace scopes*, bypassing future consent checks.
   * **Does NOT count as Governed by default.** It only counts once an admin reviews its risk score/scopes in AdminLens and clicks **"Confirm Trusted Setting"** (`confirmedCount`).
3. **⚠️ Shadow IT (`UNCONFIGURED`):**
   * Employees or students authorized the app without any admin policy in place.
   * **Does NOT count as Governed** until the admin configures it in Google Admin Console.

#### 2. The Exact Formula
Across the domain's **`68` baseline third-party applications**:
```text
Total Governed Apps = Base Governed Apps (35) + Confirmed Trusted Apps
Overall Posture Score (%) = round( (Total Governed Apps / 68) * 100 )
```
* **Historical Pre-Audit Baseline (`46%`):** Where the tenant started before baseline hygiene.
* **Current Active Baseline (`52%`):** `35` out of `68` apps are currently configured to `SPECIFIC_DATA`, `LIMITED`, or `BLOCKED` (`35 / 68 = 51.5% -> 52%`).
* **Dynamic Progression (`+1.5%` per app):** Every time you confirm a reviewed `TRUSTED` app or lock down an `UNCONFIGURED` app to `SPECIFIC_DATA` / `LIMITED` / `BLOCKED`, `Total Governed Apps` goes up by `1` and the score climbs toward `100%` (turning **Green** at `>= 80%`).

#### 3. The 4-Stage Hardening Roadmap (`52% -> 100%`)
The individual `1.00 – 5.00` app risk scores determine **the order in which you harden the remaining `33` ungoverned apps** to reach `100%`:
* **Stage 1 (`52%` Achieved — Active Domain Baseline):** `35 / 68` apps already governed under least-privilege policies.
* **Stage 2 (`75%` Target — `+23%` gain):** Triage and lock down the **`18` Critical & High-Risk `UNCONFIGURED` apps** (apps with individual risk scores `>= 3.00` holding Drive, Mail, or Admin scopes).
* **Stage 3 (`90%` Target — `+15%` gain):** Audit the **`20` blanket-`TRUSTED` apps**—either downgrade them to `SPECIFIC_DATA` in Admin Console or explicitly confirm them in AdminLens.
* **Stage 4 (`100%` Goal — Full Perimeter Hardening):** All `68 / 68` apps operate under explicit `BLOCKED`, `LIMITED`, `SPECIFIC_DATA`, or verified `TRUSTED` controls.

---

### Part B: How Individual App Risk Scores Drive the Triage Tiers & Exposure Penalty (`0 – 100`)
In `RecommendationsView` (`mosaic-next/components/recommendations-view.tsx`), AdminLens uses each app's **Individual Risk Score (`1.00 – 5.00`)** combined with **Tenant Telemetry** (User Sprawl, Super Admin grants, and 30-day activity) to rank unconfigured apps into **4 Triage Tiers** and compute a live **Domain Exposure Penalty (`0 – 100`, where lower is better)**:

```text
Raw Exposure Penalty = (Tier1 * 25) + (Tier2 * 12) + (Tier3 * 4) + (Tier4 * 1) + (UnconfirmedTrusted * 8)
Domain Exposure Score = Clamp( Raw Exposure Penalty, 8, 100 )
```

| Triage Bucket | How Individual App Risk + Telemetry Places an App Here | Penalty Weight | Required Action |
| :--- | :--- | :--- | :--- |
| **🚨 Tier 1: Critical Emergency** | `UNCONFIGURED` + **Critical/High Risk (`>= 3.00`)** + **Sprawl** (`>1` user or Super Admin) + **Active Breach (`<= 90d`)** | **`25 pts` / app** | Block immediately or restrict to *Specific Google Data* |
| **🟠 Tier 2: High-Risk Sprawl** | `UNCONFIGURED` + **Critical/High Risk (`>= 3.00`)** + (**Active `< 30d`** OR **Sprawl**) | **`12 pts` / app** | Configure to *Specific Google Data* or Block *(Stage 2 focus)* |
| **🔓 Pending `TRUSTED` Apps** | Configured as `TRUSTED` in Admin Console, **not yet confirmed** by admin | **`8 pts` / app** | Downgrade to *Specific Google Data* or click *Confirm Trusted* *(Stage 3 focus)* |
| **🟡 Tier 3: Moderate Sprawl** | `UNCONFIGURED` + **Medium/Low Risk (`< 3.00`)** + **Active `< 30d`** | **`4 pts` / app** | Audit business case; set to *Limited* or *Specific Google Data* |
| **⚪ Tier 4: Dormant Shadow IT** | `UNCONFIGURED` + **Inactive `> 30d`** (`0` recent events) | **`1 pt` / app** | Revoke stale user tokens to clean up attack surface |
| **🏆 Secured / Confirmed** | Configured to `SPECIFIC_DATA`, `LIMITED`, `BLOCKED`, or **Confirmed `TRUSTED`** | **`0 pts` / app** | Fully governed — increases the **Main Dashboard Posture Score (`%`)** |
