/**
 * =========================================================================================
 * ENTERPRISE DOCUMENT NAMING SERIES & AUTO-NUMBERING ENGINE MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Enterprise grade auto-numbering engine supporting:
 * 1. Multi-Tenant & Subsidiary Scoping:
 *    - Each tenant and individual operating subsidiary can define customized prefix series
 *      (e.g., Kenya subsidiary: EMP-KE-2026-0001, US subsidiary: EMP-US-2026-0001).
 * 2. Tokenized Dynamic Pattern Replacement:
 *    - {ORG}      -> Subsidiary legal entity code
 *    - {DEPT}     -> Department code
 *    - {YYYY}     -> 4-digit current year
 *    - {YY}       -> 2-digit current year
 *    - {MM}       -> 2-digit current month
 *    - {DD}       -> 2-digit current day
 *    - {FY}       -> Fiscal year (e.g. FY26)
 *    - {#####}    -> Minimum zero-padding determined by number of '#' characters
 * 3. Reset Cycle Rules:
 *    - 'never', 'yearly', 'fiscal_yearly', 'monthly', 'daily'
 * 4. Regulatory Audit Trail:
 *    - Immutable audit log of every generated sequence number, counter value, and manual overrides.
 * =========================================================================================
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";
import { tenants, organizations, users } from "./auth-tenancy";

// State Machine Invariant: Naming Series Counter Reset Schedule
export const seriesResetFrequencyEnum = pgEnum("series_reset_frequency", [
  "never",
  "yearly",
  "fiscal_yearly",
  "monthly",
  "daily",
]);

/**
 * 1. Naming Series Definitions
 * Master configuration per document type, tenant, and legal entity.
 */
export const namingSeriesDefinitions = pgTable(
  "naming_series_definitions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }), // NULL = Tenant default, non-null = Subsidiary override

    documentType: varchar("document_type", { length: 50 }).notNull(),
    // Standard Document Keys:
    // 'EMPLOYEE', 'PAYROLL_RUN', 'PAYSLIP', 'PAYOUT_BATCH', 'EXPENSE_CLAIM',
    // 'LEAVE_APPLICATION', 'TRAVEL_REQUEST', 'LOAN_APPLICATION', 'JOB_OPENING',
    // 'JOB_OFFER', 'IT_ASSET', 'IMMIGRATION_CASE', 'GRIEVANCE_CASE',
    // 'FORM_SUBMISSION', 'JOURNAL_ENTRY', 'TRAINING_CERTIFICATE'

    seriesCode: varchar("series_code", { length: 50 }).notNull(), // Unique series identifier e.g. 'EMP_GLOBAL', 'EXP_KE'
    description: text("description"),

    /**
     * Pattern Examples:
     * "EMP/{ORG}/{YYYY}/{#####}"        -> EMP/KEN/2026/00042
     * "PAY/{YYYY}/{MM}/{######}"        -> PAY/2026/09/000128
     * "EXP-{ORG}-{YYYY}-{####}"         -> EXP-KEN-2026-0034
     * "LV-{YYYY}-{#####}"               -> LV-2026-00089
     * "AST-{ORG}-{######}"              -> AST-HQ-000452
     * "ETH-{YYYY}-{####}"               -> ETH-2026-0009
     * "JV/{ORG}/{YYYY}/{MM}/{#####}"    -> JV/KEN/2026/09/00012
     */
    pattern: varchar("pattern", { length: 150 }).notNull(),

    currentCounter: integer("current_counter").default(0).notNull(),
    stepValue: integer("step_value").default(1).notNull(),
    resetFrequency: seriesResetFrequencyEnum("reset_frequency").default("never").notNull(),

    lastResetDate: timestamp("last_reset_date", { withTimezone: true }),
    lastGeneratedNumber: varchar("last_generated_number", { length: 100 }),

    // Governance & Compliance
    isDefault: boolean("is_default").default(true).notNull(),
    allowManualOverride: boolean("allow_manual_override").default(false).notNull(),
    isStrictGapless: boolean("is_strict_gapless").default(true).notNull(), // Mandated for financial/tax docs
    isActive: boolean("is_active").default(true).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("naming_series_tenant_idx").on(table.tenantId),
    index("naming_series_lookup_idx").on(table.tenantId, table.documentType, table.isActive),
    uniqueIndex("naming_series_unique_code_idx").on(table.tenantId, table.seriesCode),
  ]
);

/**
 * 2. Naming Series Audit Logs
 * Immutable audit trail of every generated document number across all modules.
 */
export const namingSeriesAuditLogs = pgTable(
  "naming_series_audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    seriesDefinitionId: uuid("series_definition_id")
      .references(() => namingSeriesDefinitions.id, { onDelete: "restrict" })
      .notNull(),
    
    documentType: varchar("document_type", { length: 50 }).notNull(),
    generatedNumber: varchar("generated_number", { length: 100 }).notNull(),
    counterValue: integer("counter_value").notNull(),
    entityId: varchar("entity_id", { length: 100 }).notNull(), // Target database record ID
    
    generatedByUserId: uuid("generated_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    wasManuallyOverridden: boolean("was_manually_overridden").default(false).notNull(),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("naming_audit_tenant_idx").on(table.tenantId),
    index("naming_audit_series_idx").on(table.seriesDefinitionId),
    index("naming_audit_doc_idx").on(table.tenantId, table.documentType),
    uniqueIndex("naming_audit_num_idx").on(table.tenantId, table.generatedNumber),
  ]
);
