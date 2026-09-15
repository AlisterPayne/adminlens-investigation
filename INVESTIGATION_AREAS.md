# Admin Lens: Third-Party OAuth App Investigation Areas

---

### **1. Data Ingestion & Extraction**
* **Reports API vs Directory API**: Pulling raw event audit logs via Admin SDK Reports API (`applicationName=token`) vs querying active point-in-time token snapshots via Admin SDK Directory API (`users.tokens.list`), or combining both for complete coverage.
* **Polling, Rate Limits & Quotas**: Managing API consumption, pagination, incremental syncs, and backoff handling for large Workspace domains.
* **Event Lifecycle Tracking**: Handling grant (`authorize`), update, and revocation (`revoke`) events over time.

---

### **2. Application Identity & Cataloging**
* **Unique Client Identification**: Normalizing apps across `clientId`, handling multiple client IDs belonging to the same vendor/platform.
* **Metadata & Display Names**: Mapping `displayText` / app names, icons, publisher details, and developer domain verification status.
* **Marketplace vs Custom / Unverified Apps**: Identifying Google Workspace Marketplace installed apps vs self-authorized shadow IT apps.

---

### **3. Database Schema Design**
* **Entity Relationships**: Modeling Applications, User Authorizations (Grants), Individual Scopes, and Historical Events.
* **State Management**: Distinguishing active grants from revoked grants and tracking first-seen/last-seen timestamps.
* **Multi-Tenancy**: Supporting multiple Google Workspace customer domains/tenants cleanly.

---

### **4. Risk & Scope Analysis**
* **Scope Classification**: Categorizing high-risk vs low-risk OAuth scopes (e.g., full Gmail/Drive read/write vs basic openid/profile).
* **Risk Scoring Model**: Defining security metrics based on permissions, data sensitivity, user count, verified publisher status, and data egress potential.
* **Policy & Recommendation Engine**: Generating actionable recommendations (e.g., revoke unused tokens, block high-risk unapproved apps, enforce domain-wide controls).

---
