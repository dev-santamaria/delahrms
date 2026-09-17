import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  numeric,
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
export const caseStatusEnum = pgEnum("immigration_case_status", [
  "eligibility_assessment",
  "document_collection",
  "legal_review",
  "embassy_submission",
  "in_processing",
  "approved",
  "stamping_and_entry",
  "rejected",
  "closed",
]);

export const caseDocStatusEnum = pgEnum("case_doc_status", [
  "pending",
  "uploaded",
  "under_review",
  "verified",
  "expired",
  "rejected",
]);

// Open TypeScript Types
export type StandardVisaCategory =
  | "skilled_worker"
  | "digital_nomad"
  | "intra_company_transfer"
  | "business_visitor"
  | "permanent_residence"
  | "founder_startup"
  | "student_intern"
  | "golden_visa"
  | (string & {});

export type StandardDependentRelation =
  | "spouse"
  | "child"
  | "parent"
  | "domestic_partner"
  | "other"
  | (string & {});

// 1. Visa Types Catalog (Across 100+ countries)
export const visaTypes = pgTable(
  "visa_types",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }), // NULL = Global default catalog, non-null = Tenant custom sponsorship visa
    destinationCountryCode: varchar("destination_country_code", { length: 3 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    category: varchar("category", { length: 50 }).default("skilled_worker").notNull(), // dynamic visa category lookup
    validityMonths: integer("validity_months").default(24).notNull(),
    standardProcessingDays: integer("standard_processing_days").default(45).notNull(),
    estimatedGovernmentFee: numeric("estimated_government_fee", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    eligibilityCriteria: jsonb("eligibility_criteria").notNull(),
    requiredDocumentsList: jsonb("required_documents_list").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("visa_types_tenant_idx").on(table.tenantId),
    index("visa_types_country_idx").on(table.destinationCountryCode, table.category),
  ]
);

// 2. Immigration & Relocation Cases
export const immigrationCases = pgTable(
  "immigration_cases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),
    visaTypeId: uuid("visa_type_id")
      .references(() => visaTypes.id, { onDelete: "restrict" })
      .notNull(),
    caseNumber: varchar("case_number", { length: 50 }).notNull(),
    status: caseStatusEnum("status").default("eligibility_assessment").notNull(),
    originCountryCode: varchar("origin_country_code", { length: 3 }).notNull(),
    destinationCountryCode: varchar("destination_country_code", { length: 3 }).notNull(),
    targetRelocationDate: date("target_relocation_date"),
    sponsoringEntityName: varchar("sponsoring_entity_name", { length: 255 }).notNull(),
    assignedLegalCounsel: varchar("assigned_legal_counsel", { length: 255 }),
    submissionDate: date("submission_date"),
    approvalDate: date("approval_date"),
    visaExpiryDate: date("visa_expiry_date"),
    aiEligibilityScore: numeric("ai_eligibility_score", { precision: 5, scale: 2 }),
    aiAssessmentSummary: text("ai_assessment_summary"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("imm_cases_tenant_id_idx").on(table.tenantId),
    index("imm_cases_emp_idx").on(table.employeeId),
    index("imm_cases_status_idx").on(table.status),
    uniqueIndex("imm_cases_org_case_idx").on(table.organizationId, table.caseNumber),
  ]
);

// 3. Case Legal Documents Checklist
export const caseDocuments = pgTable(
  "case_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    caseId: uuid("case_id")
      .references(() => immigrationCases.id, { onDelete: "cascade" })
      .notNull(),
    documentType: varchar("document_type", { length: 100 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    fileUrl: text("file_url"),
    status: caseDocStatusEnum("status").default("pending").notNull(),
    expiryDate: date("expiry_date"),
    rejectionReason: text("rejection_reason"),
    verifiedByUserId: uuid("verified_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("case_docs_tenant_id_idx").on(table.tenantId),
    index("case_docs_case_id_idx").on(table.caseId),
  ]
);

// 4. Case Relocating Dependents
export const caseDependents = pgTable(
  "case_dependents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    caseId: uuid("case_id")
      .references(() => immigrationCases.id, { onDelete: "cascade" })
      .notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    relationship: varchar("relationship", { length: 50 }).default("spouse").notNull(),
    dateOfBirth: date("date_of_birth").notNull(),
    passportNumber: varchar("passport_number", { length: 100 }),
    passportExpiryDate: date("passport_expiry_date"),
    visaGranted: boolean("visa_granted").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("case_dep_tenant_id_idx").on(table.tenantId),
    index("case_dep_case_id_idx").on(table.caseId),
  ]
);

// 5. Physical Presence Logs (183-Day International Tax Residency Tracker)
export const physicalPresenceLogs = pgTable(
  "physical_presence_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),
    countryCode: varchar("country_code", { length: 3 }).notNull(),
    entryDate: date("entry_date").notNull(),
    exitDate: date("exit_date"),
    daysSpent: integer("days_spent").default(0).notNull(),
    isTaxResidencyTriggered: boolean("is_tax_residency_triggered").default(false).notNull(),
    isPermanentEstablishmentRisk: boolean("is_permanent_establishment_risk").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("presence_tenant_id_idx").on(table.tenantId),
    index("presence_emp_country_idx").on(table.employeeId, table.countryCode),
  ]
);
