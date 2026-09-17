import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  date,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants, organizations, users } from "./auth-tenancy";
import { employees } from "./core-hr";

// Enums
export const documentStatusEnum = pgEnum("document_status", [
  "draft",
  "pending_signature",
  "signed",
  "expired",
  "archived",
]);

export const signerStatusEnum = pgEnum("signer_status", [
  "pending",
  "viewed",
  "signed",
  "declined",
]);

// 1. Document Categories
export const documentCategories = pgTable(
  "document_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(), // Contracts, Identification, Visas, Certifications, Disciplinary
    code: varchar("code", { length: 50 }).notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("doc_cat_tenant_id_idx").on(table.tenantId),
    uniqueIndex("doc_cat_code_idx").on(table.tenantId, table.code),
  ]
);

// 2. Employee Documents (With expiry alert tracking)
export const employeeDocuments = pgTable(
  "employee_documents",
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
    categoryId: uuid("category_id")
      .references(() => documentCategories.id, { onDelete: "restrict" })
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileUrl: text("file_url").notNull(),
    fileSizeBytes: integer("file_size_bytes"),
    mimeType: varchar("mime_type", { length: 100 }),
    expiryDate: date("expiry_date"), // For passports, visas, professional licenses
    isVerified: boolean("is_verified").default(false).notNull(),
    verifiedByUserId: uuid("verified_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("emp_docs_tenant_id_idx").on(table.tenantId),
    index("emp_docs_employee_id_idx").on(table.employeeId),
    index("emp_docs_expiry_idx").on(table.expiryDate),
  ]
);

// 3. Company Policies & Handbooks
export const companyPolicies = pgTable(
  "company_policies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    version: varchar("version", { length: 50 }).default("1.0").notNull(),
    content: text("content"),
    fileUrl: text("file_url"),
    requiresAcknowledgement: boolean("requires_acknowledgement").default(true).notNull(),
    effectiveDate: date("effective_date").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("policies_tenant_id_idx").on(table.tenantId),
    index("policies_org_id_idx").on(table.organizationId),
  ]
);

// 4. Policy Acknowledgements (Proof of compliance)
export const policyAcknowledgements = pgTable(
  "policy_acknowledgements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    policyId: uuid("policy_id")
      .references(() => companyPolicies.id, { onDelete: "cascade" })
      .notNull(),
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }).defaultNow().notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
  },
  (table) => [
    index("policy_ack_tenant_id_idx").on(table.tenantId),
    uniqueIndex("policy_ack_emp_idx").on(table.policyId, table.employeeId),
  ]
);

// 5. Electronic Signatures
export const documentSignatures = pgTable(
  "document_signatures",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    documentTitle: varchar("document_title", { length: 255 }).notNull(),
    documentUrl: text("document_url").notNull(),
    signerUserId: uuid("signer_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    signerEmail: varchar("signer_email", { length: 255 }).notNull(),
    signerName: varchar("signer_name", { length: 255 }).notNull(),
    status: signerStatusEnum("status").default("pending").notNull(),
    signatureHash: text("signature_hash"), // Cryptographic signature record
    signedAt: timestamp("signed_at", { withTimezone: true }),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("signatures_tenant_id_idx").on(table.tenantId),
    index("signatures_user_id_idx").on(table.signerUserId),
  ]
);
