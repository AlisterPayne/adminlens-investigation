-- ==========================================================
-- Admin Lens: Third-Party OAuth Applications Database Schema
-- ==========================================================

CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    vendor TEXT NOT NULL,
    publisher_domain TEXT,
    category TEXT NOT NULL,
    is_verified INTEGER DEFAULT 0,
    icon_url TEXT,
    store_url TEXT,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    risk_score REAL DEFAULT 1.0,
    risk_score_color TEXT DEFAULT 'Green',
    scope_risk_score REAL DEFAULT 1.0,
    verification_penalty REAL DEFAULT 0.0,
    breach_penalty REAL DEFAULT 0.0,
    breach_bracket TEXT DEFAULT 'NONE',
    breaches_json TEXT,
    peak_scope_score INTEGER DEFAULT 1,
    breadth_score REAL DEFAULT 0.0,
    avg_scope_score REAL DEFAULT 1.0,
    risk_reasons TEXT, -- JSON array of risk descriptions
    admin_access_level TEXT DEFAULT 'UNCONFIGURED' CHECK (admin_access_level IN ('TRUSTED', 'LIMITED', 'SPECIFIC_DATA', 'BLOCKED', 'UNCONFIGURED')),
    is_google_service INTEGER DEFAULT 0,
    app_type TEXT DEFAULT 'Third-Party',
    total_users_count INTEGER DEFAULT 0,
    admin_users_count INTEGER DEFAULT 0,
    first_seen_at TEXT,
    last_active_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS app_access_policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    org_unit_path TEXT DEFAULT '/',
    access_level TEXT NOT NULL CHECK (access_level IN ('TRUSTED', 'LIMITED', 'SPECIFIC_DATA', 'BLOCKED', 'UNCONFIGURED')),
    is_overridden INTEGER DEFAULT 0,
    exempt_from_context_aware_access INTEGER DEFAULT 0,
    allowed_services_json TEXT, -- JSON object e.g. {"Google Workspace Admin": 4, "Google Sign-in": 3}
    configured_by TEXT,         -- Admin who made the policy decision
    last_policy_update TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS application_client_ids (
    client_id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL,
    project_number TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    primary_email TEXT UNIQUE NOT NULL,
    name TEXT,
    org_unit_path TEXT DEFAULT '/',
    is_admin INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS grants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    scopes_json TEXT NOT NULL, -- JSON array of granted scopes
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED')),
    is_native_app INTEGER DEFAULT 0,
    is_anonymous INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_email) REFERENCES users(primary_email) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS application_scopes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id TEXT NOT NULL,
    scope_url TEXT NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    admin_score INTEGER DEFAULT 1,
    admin_color TEXT DEFAULT 'Blue',
    description TEXT,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    UNIQUE(application_id, scope_url)
);

CREATE TABLE IF NOT EXISTS audit_events (
    event_id TEXT PRIMARY KEY,
    application_id TEXT,
    client_id TEXT,
    user_email TEXT,
    event_type TEXT NOT NULL, -- 'auth:authorize', 'auth:revoke', 'auth:activity', 'admin:policy_change'
    method_name TEXT,
    ip_address TEXT,
    country_code TEXT,
    region_code TEXT,
    event_time TEXT NOT NULL,
    raw_event_json TEXT,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_apps_risk ON applications(risk_level);
CREATE INDEX IF NOT EXISTS idx_apps_category ON applications(category);
CREATE INDEX IF NOT EXISTS idx_apps_access_level ON applications(admin_access_level);
CREATE INDEX IF NOT EXISTS idx_policy_app ON app_access_policies(application_id);
CREATE INDEX IF NOT EXISTS idx_policy_client ON app_access_policies(client_id);
CREATE INDEX IF NOT EXISTS idx_client_app ON application_client_ids(application_id);
CREATE INDEX IF NOT EXISTS idx_grants_user ON grants(user_email);
CREATE INDEX IF NOT EXISTS idx_grants_app ON grants(application_id);
CREATE INDEX IF NOT EXISTS idx_audit_app ON audit_events(application_id);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_events(event_time);

-- ==========================================================
-- OAuth Scope Threat Reference Matrix
-- ==========================================================
CREATE TABLE IF NOT EXISTS oauth_scope_reference (
    scope_url TEXT PRIMARY KEY,
    service_name TEXT NOT NULL,
    google_tier TEXT NOT NULL CHECK (google_tier IN ('Restricted', 'Sensitive', 'Non-Sensitive')),
    admin_score INTEGER NOT NULL CHECK (admin_score IN (1, 2, 3, 4, 5)),
    admin_color TEXT NOT NULL CHECK (admin_color IN ('Blue', 'Green', 'Yellow', 'Orange', 'Red')),
    rationale TEXT NOT NULL,
    threat_impact TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_scope_ref_service ON oauth_scope_reference(service_name);
CREATE INDEX IF NOT EXISTS idx_scope_ref_score ON oauth_scope_reference(admin_score);
CREATE INDEX IF NOT EXISTS idx_scope_ref_tier ON oauth_scope_reference(google_tier);

-- ==========================================================
-- Google Services (Canonical 18 Services in Google Admin Console)
-- ==========================================================
CREATE TABLE IF NOT EXISTS google_services (
    id TEXT PRIMARY KEY,
    service_name TEXT NOT NULL UNIQUE,
    access_setting TEXT NOT NULL DEFAULT 'Unrestricted' CHECK (access_setting IN ('Unrestricted', 'Restricted')),
    is_restricted INTEGER DEFAULT 0,
    allow_non_high_risk_scopes INTEGER DEFAULT 0,
    description TEXT,
    icon_name TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_google_services_name ON google_services(service_name);
CREATE INDEX IF NOT EXISTS idx_google_services_access ON google_services(access_setting);
