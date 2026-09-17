/**
 * =========================================================================================
 * DIGITAL FORMS, PAPERLESS WORKFLOWS & NATIVE E-SIGNATURES MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Completely eliminates physical printing, scanning, and emailing of paper documents.
 * Enables HR to author dynamic electronic forms, publish them to employees to fill digitally,
 * and capture legally binding e-signatures with comprehensive cryptographic audit trails.
 * 
 * CORE ENTITIES:
 * 1. form_templates:
 *    - Reusable digital forms (e.g., Direct Deposit Bank Mandate Change, Emergency Contact,
 *      Remote Work Agreement, Equipment Custody Handover, Non-Disclosure & IP Assignment).
 *    - Configurable JSON schema defining inputs, dropdown choices, validation, and signature fields.
 * 
 * 2. form_submissions:
 *    - Workforce responses containing validated form data payloads.
 *    - State machine: draft -> submitted -> signed_by_employee -> countersigned -> completed.
 * 
 * 3. form_signatures:
 *    - Tamper-evident electronic signatures compliant with international e-signature statutes
 *      (US ESIGN Act, EU eIDAS, Kenya Electronic Transactions Act).
 *    - Captures signer identity, timestamp, IP address, User-Agent, signature image/vector,
 *      and a cryptographic SHA-256 document fingerprint.
 * =========================================================================================
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  date,
  timestamp,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants, organizations, users } from "./auth-tenancy";
import { employees } from "./core-hr";

// State Machine Invariants
export const formSubmissionStatusEnum = pgEnum("form_submission_status", [
  "draft",
  "submitted",
  "signed_by_employee",
  "countersigned",
  "rejected",
  "archived",
]);

export const signatureTypeEnum = pgEnum("form_signature_type", [
  "drawn", // Canvas drawn stroke
  "typed", // Font rendered stylized signature
  "certificate", // Cryptographic token
]);

export type StandardSignerRole =
  | "employee"
  | "manager"
  | "hr_admin"
  | "legal_counsel"
  | "cfo"
  | "witness"
  | "board_director"
  | "trustee"
  | (string & {});

// Open Extensible Taxonomies (Dynamic via reference_lookups)
export type StandardFormCategory =
  | "financial_banking"
  | "hr_employment"
  | "it_security"
  | "compliance_legal"
  | "health_safety"
  | "policy_acknowledgment"
  | (string & {});

/**
 * 1. FORM TEMPLATES
 * Master digital forms library.
 */
export const formTemplates = pgTable(
  "form_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    
    title: varchar("title", { length: 255 }).notNull(), // e.g. "Direct Deposit & Bank Mandate Change Form"
    code: varchar("code", { length: 50 }).notNull(), // e.g. "FORM-FIN-001", "FORM-HR-002"
    category: varchar("category", { length: 100 }).default("hr_employment").notNull(),
    description: text("description"),
    
    // JSON Schema defining the fields: [{ id: "bank_name", type: "text", label: "Bank Name", required: true }]
    fieldsSchema: jsonb("fields_schema").notNull(),
    
    // Signature Requirements
    requiresSignature: boolean("requires_signature").default(true).notNull(),
    requiresCountersign: boolean("requires_countersign").default(false).notNull(),
    primarySignerRole: varchar("primary_signer_role", { length: 50 }).default("employee").notNull(),
    countersignerRole: varchar("countersigner_role", { length: 50 }).default("hr_admin").notNull(),
    
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("ft_tenant_idx").on(table.tenantId),
    index("ft_org_idx").on(table.organizationId),
    uniqueIndex("ft_org_code_idx").on(table.organizationId, table.code),
  ]
);

/**
 * 2. FORM SUBMISSIONS
 * Filled electronic form instances submitted by employees.
 */
export const formSubmissions = pgTable(
  "form_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    templateId: uuid("template_id")
      .references(() => formTemplates.id, { onDelete: "cascade" })
      .notNull(),
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),
    submissionNumber: varchar("submission_number", { length: 50 }).notNull(),
    
    // Form Key-Value Data Payload
    formData: jsonb("form_data").notNull(),
    
    status: formSubmissionStatusEnum("status").default("draft").notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    
    // Rendered PDF Artifact
    pdfDocumentUrl: text("pdf_document_url"),
    
    // Review Notes
    reviewerNotes: text("reviewer_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("fsub_tenant_idx").on(table.tenantId),
    index("fsub_emp_idx").on(table.employeeId),
    index("fsub_template_idx").on(table.templateId),
    uniqueIndex("fsub_org_number_idx").on(table.organizationId, table.submissionNumber),
  ]
);

/**
 * 3. FORM SIGNATURES
 * Tamper-evident electronic signatures and cryptographic audit certificates.
 */
export const formSignatures = pgTable(
  "form_signatures",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    submissionId: uuid("submission_id")
      .references(() => formSubmissions.id, { onDelete: "cascade" })
      .notNull(),
    
    signerRole: varchar("signer_role", { length: 50 }).default("employee").notNull(),
    signerUserId: uuid("signer_user_id")
      .references(() => users.id, { onDelete: "set null" }),
    signerName: varchar("signer_name", { length: 255 }).notNull(),
    signerEmail: varchar("signer_email", { length: 255 }).notNull(),
    
    // Signature Visual Representation
    signatureType: signatureTypeEnum("signature_type").default("drawn").notNull(),
    signatureData: text("signature_data").notNull(), // Base64 canvas stroke or stylized signature
    
    // Cryptographic Evidence & Tamper Seal (eIDAS / ESIGN Compliance)
    signedAt: timestamp("signed_at", { withTimezone: true }).defaultNow().notNull(),
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: text("user_agent"),
    documentHash: varchar("document_hash", { length: 128 }).notNull(), // SHA-256 fingerprint
  },
  (table) => [
    index("fsig_submission_idx").on(table.submissionId),
  ]
);

// State Machine Invariants for Campaigns & Review Workflows
export const formCampaignStatusEnum = pgEnum("form_campaign_status", [
  "draft",
  "active",
  "completed",
  "cancelled",
  "archived",
]);

export const formReviewStatusEnum = pgEnum("form_review_status", [
  "pending_review",
  "mitigation_approved",
  "escalated",
  "cleared",
  "rejected",
]);

/**
 * 4. UNIVERSAL FORM CAMPAIGNS
 * Generic broadcast distribution engine for ANY form template (COI, Code of Conduct, NDAs, Handover).
 */
export const formCampaigns = pgTable(
  "form_campaigns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    templateId: uuid("template_id")
      .references(() => formTemplates.id, { onDelete: "cascade" })
      .notNull(),
    campaignNumber: varchar("campaign_number", { length: 50 }).notNull(), // e.g. "CMP-2026-001"
    title: varchar("title", { length: 255 }).notNull(), // e.g. "Annual Conflict of Interest Declaration", "Code of Conduct Signoff"
    description: text("description"),
    
    // Targeted audience
    targetScope: varchar("target_scope", { length: 50 }).default("all_company").notNull(), // 'all_company', 'subsidiary', 'department', 'job_grade'
    startDate: date("start_date").notNull(),
    deadlineDate: date("deadline_date").notNull(),
    reminderCadenceDays: integer("reminder_cadence_days").default(3).notNull(), // Automated nudge interval
    
    status: formCampaignStatusEnum("status").default("draft").notNull(),
    totalTargetCount: integer("total_target_count").default(0).notNull(),
    completedCount: integer("completed_count").default(0).notNull(),
    flaggedReviewsCount: integer("flagged_reviews_count").default(0).notNull(),

    launchedByUserId: uuid("launched_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("form_camp_tenant_idx").on(table.tenantId),
    index("form_camp_org_idx").on(table.organizationId),
    uniqueIndex("form_camp_org_num_idx").on(table.organizationId, table.campaignNumber),
  ]
);

/**
 * 5. FORM CAMPAIGN ASSIGNMENTS
 * Tracks individual employee completion status and automated reminder history.
 */
export const formCampaignAssignments = pgTable(
  "form_campaign_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    campaignId: uuid("campaign_id")
      .references(() => formCampaigns.id, { onDelete: "cascade" })
      .notNull(),
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),
    submissionId: uuid("submission_id").references(() => formSubmissions.id, {
      onDelete: "set null",
    }),

    isCompleted: boolean("is_completed").default(false).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    hasFlaggedResponse: boolean("has_flagged_response").default(false).notNull(),
    lastRemindedAt: timestamp("last_reminded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("camp_assign_tenant_idx").on(table.tenantId),
    index("camp_assign_camp_idx").on(table.campaignId),
    index("camp_assign_emp_idx").on(table.employeeId),
    uniqueIndex("camp_assign_camp_emp_idx").on(table.campaignId, table.employeeId),
  ]
);

/**
 * 6. FORM SUBMISSION REVIEWS & ESCALATION WORKFLOWS
 * Universal condition-based secondary authorization and compliance clearance router.
 */
export const formSubmissionReviews = pgTable(
  "form_submission_reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    submissionId: uuid("submission_id")
      .references(() => formSubmissions.id, { onDelete: "cascade" })
      .notNull(),
    
    reviewType: varchar("review_type", { length: 50 }).notNull(), // 'conflict_of_interest', 'policy_exception', 'asset_custody'
    triggerField: varchar("100", { length: 100 }).notNull(), // e.g. "has_outside_commercial_interest"
    triggerValue: text("trigger_value").notNull(), // e.g. "YES: Owns 20% in vendor ABC Logistics"
    
    reviewerRole: varchar("reviewer_role", { length: 50 }).default("compliance_officer").notNull(),
    assignedReviewerUserId: uuid("assigned_reviewer_user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    reviewStatus: formReviewStatusEnum("review_status").default("pending_review").notNull(),
    mitigationActionPlan: text("mitigation_action_plan"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewerNotes: text("reviewer_notes"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("fsub_rev_tenant_idx").on(table.tenantId),
    index("fsub_rev_submission_idx").on(table.submissionId),
    index("fsub_rev_status_idx").on(table.reviewStatus),
  ]
);

