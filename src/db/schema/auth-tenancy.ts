/**
 * =========================================================================================
 * MULTI-TENANCY, SUBSIDIARY ENTITIES, AUTH & SYSTEM AUDITING MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * This module establishes the foundational multi-tenant hierarchy and security model for Zuri HRMS:
 * 1. Tenants: Root holding company or enterprise group account (e.g. Mandela Global Group).
 * 2. Organizations: Individual legal operating subsidiaries (e.g. Mandela Kenya Ltd, Mandela Nigeria Ltd,
 *    Mandela UK Ltd, Mandela Technologies Inc).
 * 3. Users: Authenticated actors with granular RBAC roles, tenant memberships, and MFA settings.
 * 4. Reference Taxonomies (Lookups): Extensible, database-backed lookup tables that eliminate rigid
 *    hardcoded enums across countries.
 * 5. Audit Logs: Append-only compliance trail recording actor IDs, IP addresses, user-agents,
 *    and exact JSON before/after state diffs.
 * 
 * ROW-LEVEL SECURITY (RLS) INVARIANTS:
 * - Every core operational record in downstream modules references `tenant_id` and `organization_id`.
 * - PostgreSQL RLS policies restrict queries using `current_setting('app.current_tenant_id')`
 *   to ensure total data isolation between enterprise clients and legal entities.
 * =========================================================================================
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Pure Invariant State Machines
export const tenantStatusEnum = pgEnum("tenant_status", [
  "active",
  "suspended",
  "trial",
  "cancelled",
  "pending_approval",
  "under_review",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "create",
  "update",
  "delete",
  "login",
  "logout",
  "export",
  "payroll_run",
  "approval",
  "rejection",
  "sync",
]);

// 1. Tenants (Root Group / Enterprise Account)
export const tenants = pgTable(
  "tenants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    domain: varchar("domain", { length: 255 }),
    status: tenantStatusEnum("status").default("active").notNull(),
    tier: varchar("tier", { length: 50 }).default("enterprise").notNull(),
    logoUrl: text("logo_url"),
    settings: jsonb("settings").default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("tenants_slug_idx").on(table.slug),
  ]
);

// 2. Organizations / Subsidiaries (Legal entities e.g., Acme Kenya Ltd, Acme Nigeria Ltd)
export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    countryCode: varchar("country_code", { length: 3 }).notNull(), // ISO-3166-1 alpha-3: KEN, NGA, ZAF, GBR, USA
    currency: varchar("currency", { length: 3 }).notNull(), // KES, NGN, ZAR, USD, GBP, EUR
    taxId: varchar("tax_id", { length: 100 }), // KRA PIN, TIN, EIN
    registrationNumber: varchar("registration_number", { length: 100 }),
    fiscalYearStartMonth: integer("fiscal_year_start_month").default(1).notNull(), // 1 = Jan
    parentOrgId: uuid("parent_org_id"), // For holding/subsidiary hierarchy
    isHoldingCompany: boolean("is_holding_company").default(false).notNull(),
    timezone: varchar("timezone", { length: 100 }).default("UTC").notNull(),
    address: jsonb("address").default({}).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("orgs_tenant_id_idx").on(table.tenantId),
    uniqueIndex("orgs_tenant_code_idx").on(table.tenantId, table.code),
  ]
);

// 3. Branches / Physical Locations
export const branches = pgTable(
  "branches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    city: varchar("city", { length: 100 }),
    stateOrCounty: varchar("state_or_county", { length: 100 }),
    countryCode: varchar("country_code", { length: 3 }),
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    geofenceRadiusMeters: integer("geofence_radius_meters").default(150).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("branches_tenant_id_idx").on(table.tenantId),
    index("branches_org_id_idx").on(table.organizationId),
  ]
);

// 4. Cost Centers
export const costCenters = pgTable(
  "cost_centers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    budgetAmount: numeric("budget_amount", { precision: 15, scale: 2 }).default("0.00"),
    currency: varchar("currency", { length: 3 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("cost_centers_tenant_id_idx").on(table.tenantId),
    index("cost_centers_org_id_idx").on(table.organizationId),
    uniqueIndex("cost_centers_org_code_idx").on(table.organizationId, table.code),
  ]
);

// 5. Departments
export const departments = pgTable(
  "departments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    parentDepartmentId: uuid("parent_department_id"),
    costCenterId: uuid("cost_center_id").references(() => costCenters.id, {
      onDelete: "set null",
    }),
    headOfDepartmentId: uuid("head_of_department_id"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("departments_tenant_id_idx").on(table.tenantId),
    index("departments_org_id_idx").on(table.organizationId),
    uniqueIndex("departments_org_code_idx").on(table.organizationId, table.code),
  ]
);

// 6. Users (System users - maps to Supabase auth.users.id)
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(), // Matches auth.users.id from Supabase
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    avatarUrl: text("avatar_url"),
    phone: varchar("phone", { length: 50 }),
    isTenantOwner: boolean("is_tenant_owner").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    status: varchar("status", { length: 50 }).default("active").notNull(),
    passwordHash: text("password_hash"),
    mfaEnabled: boolean("mfa_enabled").default(false).notNull(),
    mfaSecret: text("mfa_secret"),
    mfaBackupCodes: jsonb("mfa_backup_codes").default([]).notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("users_tenant_id_idx").on(table.tenantId),
    uniqueIndex("users_tenant_email_idx").on(table.tenantId, table.email),
  ]
);

// 7. Roles (Configurable granular roles per tenant)
export const roles = pgTable(
  "roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    description: text("description"),
    isSystem: boolean("is_system").default(false).notNull(),
    permissions: jsonb("permissions").default([]).notNull(), // Array of scope strings e.g. ["payroll:read", "payroll:run"]
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("roles_tenant_id_idx").on(table.tenantId),
    uniqueIndex("roles_tenant_slug_idx").on(table.tenantId, table.slug),
  ]
);

// 8. User Roles (RBAC assignments with optional organization/subsidiary scope)
export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    roleId: uuid("role_id")
      .references(() => roles.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("user_roles_tenant_id_idx").on(table.tenantId),
    index("user_roles_user_id_idx").on(table.userId),
  ]
);

// ====================================================================
// 9. DYNAMIC REFERENCE DATA & LOOKUPS (Enterprise Global Extensibility Core)
// ====================================================================
/**
 * Replaces hardcoded database enums for all business taxonomies:
 * - benefit_category (health, dental, gym, remote_stipend, etc.)
 * - coverage_tier (employee_only, family, executive, etc.)
 * - device_category (laptop, yubikey, starlink, vr_headset, etc.)
 * - visa_category (skilled_worker, digital_nomad, golden_visa, etc.)
 * - employment_type (full_time, contractor, b2b, intern, etc.)
 * - document_type (national_id, passport, kra_pin, alien_card, etc.)
 * 
 * Pre-seeded with global defaults (tenant_id = null, is_system = true),
 * but allows any tenant/subsidiary to add custom options without code changes!
 */
export const referenceLookups = pgTable(
  "reference_lookups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }), // NULL = Global system default
    category: varchar("category", { length: 50 }).notNull(), // 'benefit_category', 'device_category', etc.
    code: varchar("code", { length: 50 }).notNull(), // 'HEALTH_HMO', 'LAPTOP', 'CONTRACTOR_B2B'
    label: varchar("label", { length: 150 }).notNull(), // Human-readable display label
    description: text("description"),
    metadata: jsonb("metadata").default({}).notNull(), // Custom carrier codes, tax rules, icons
    isSystem: boolean("is_system").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    displayOrder: integer("display_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("ref_lookups_cat_idx").on(table.tenantId, table.category),
    uniqueIndex("ref_lookups_code_idx").on(table.tenantId, table.category, table.code),
  ]
);

// ====================================================================
// 10. UNIVERSAL CUSTOM FIELDS DEFINITIONS (Enterprise Metadata Extension)
// ====================================================================
/**
 * Allows HR Admins to attach custom attributes to any entity
 * (employees, jobs, devices, benefits) without altering database tables.
 */
export const customFieldDefinitions = pgTable(
  "custom_field_definitions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    entityType: varchar("entity_type", { length: 50 }).notNull(), // 'employee', 'job_opening', 'hardware_device', 'benefit_plan'
    fieldKey: varchar("field_key", { length: 50 }).notNull(), // e.g. 'shoe_size', 'security_clearance', 'car_reg'
    fieldLabel: varchar("field_label", { length: 150 }).notNull(),
    fieldType: varchar("field_type", { length: 30 }).notNull(), // 'text', 'number', 'date', 'select', 'multiselect', 'boolean', 'file'
    options: jsonb("options").default([]).notNull(), // Select option choices
    isRequired: boolean("is_required").default(false).notNull(),
    isEncrypted: boolean("is_encrypted").default(false).notNull(),
    validationRegex: text("validation_regex"),
    displayOrder: integer("display_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("custom_fields_entity_idx").on(table.tenantId, table.entityType),
    uniqueIndex("custom_fields_key_idx").on(table.tenantId, table.entityType, table.fieldKey),
  ]
);

// 11. Audit Logs (Immutable compliance trail)
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id"),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: auditActionEnum("action").notNull(),
    entityName: varchar("entity_name", { length: 100 }).notNull(),
    entityId: varchar("entity_id", { length: 100 }),
    oldValues: jsonb("old_values"),
    newValues: jsonb("new_values"),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_tenant_id_idx").on(table.tenantId),
    index("audit_logs_entity_idx").on(table.entityName, table.entityId),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ]
);
