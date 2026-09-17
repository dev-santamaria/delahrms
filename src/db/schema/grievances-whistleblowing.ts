/**
 * =========================================================================================
 * ENTERPRISE ETHICS, WHISTLEBLOWING & GRIEVANCE MANAGEMENT MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Mandated for large enterprises under global compliance frameworks (Sarbanes-Oxley,
 * EU Whistleblowing Directive 2019/1937, ISO 37002 Whistleblowing Management Systems):
 * 1. Anonymous & Confidential Submissions:
 *    - Allows reporters to file complaints with an encrypted unique case tracking code.
 *    - Optional identity masking where reporter user ID is shielded from investigators.
 * 2. Case Triaging & Severity Classification:
 *    - Categorization: Fraud/Embezzlement, Harassment, Discrimination, Safety, Conflict of Interest.
 * 3. Segregated Investigation Vault:
 *    - Investigator assignments with strict role-based barriers.
 *    - Confidential back-and-forth messaging between investigator and anonymous reporter.
 *    - Evidentiary document uploads and resolution audit trails.
 * =========================================================================================
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants, organizations, users } from "./auth-tenancy";

// Open TypeScript Union Types for dynamic taxonomies (backed by reference_lookups)
export type StandardGrievanceCategory =
  | "harassment"
  | "discrimination"
  | "financial_fraud"
  | "safety_violation"
  | "conflict_of_interest"
  | "retaliation"
  | "data_privacy"
  | "clinical_negligence"
  | "radiation_hazard"
  | "environmental_breach"
  | "other"
  | (string & {});

export type StandardGrievanceSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | (string & {});

// Invariant State Machine
export const grievanceStatusEnum = pgEnum("grievance_status", [
  "submitted",
  "under_triage",
  "investigation_active",
  "panel_review",
  "resolved",
  "dismissed",
]);

// 1. Grievance & Whistleblower Cases
export const grievanceCases = pgTable(
  "grievance_cases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    
    caseNumber: varchar("case_number", { length: 50 }).notNull(), // e.g., 'ETH-2026-0042'
    accessPasscodeHash: varchar("access_passcode_hash", { length: 255 }).notNull(), // Hash for anonymous reporter login
    
    isAnonymous: boolean("is_anonymous").default(true).notNull(),
    reporterUserId: uuid("reporter_user_id").references(() => users.id, {
      onDelete: "set null",
    }), // null if fully anonymous
    
    // Dynamic lookups referencing reference_lookups category 'grievance_category' and 'grievance_severity'
    category: varchar("category", { length: 50 }).notNull(),
    severity: varchar("severity", { length: 50 }).default("medium").notNull(),
    status: grievanceStatusEnum("status").default("submitted").notNull(),
    
    subject: varchar("subject", { length: 255 }).notNull(),
    description: text("description").notNull(),
    incidentDate: timestamp("incident_date", { withTimezone: true }),
    location: varchar("location", { length: 255 }),
    partiesInvolved: jsonb("parties_involved").default([]).notNull(), // names or roles mentioned
    
    assignedInvestigatorUserId: uuid("assigned_investigator_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    
    resolutionSummary: text("resolution_summary"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("grievance_tenant_id_idx").on(table.tenantId),
    uniqueIndex("grievance_case_num_idx").on(table.tenantId, table.caseNumber),
    index("grievance_status_idx").on(table.status),
    index("grievance_investigator_idx").on(table.assignedInvestigatorUserId),
  ]
);

// 2. Grievance Case Messages (Encrypted communication with anonymous whistleblower)
export const grievanceMessages = pgTable(
  "grievance_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    caseId: uuid("case_id")
      .references(() => grievanceCases.id, { onDelete: "cascade" })
      .notNull(),
    
    isFromReporter: boolean("is_from_reporter").notNull(),
    senderUserId: uuid("sender_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    
    message: text("message").notNull(),
    attachments: jsonb("attachments").default([]).notNull(),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("grievance_msg_tenant_id_idx").on(table.tenantId),
    index("grievance_msg_case_idx").on(table.caseId, table.createdAt),
  ]
);
