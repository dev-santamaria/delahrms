/**
 * =========================================================================================
 * THIRD-PARTY VOLUNTARY DEDUCTIONS & INSTITUTIONAL REMITTANCES MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * This module manages voluntary payroll check-off mandates where employees instruct their employer
 * to withhold recurring monthly funds from their net salary and remit them to external 3rd-party entities:
 * - Cooperative Saccos (shares, welfare funds, development deposits, loan repayments)
 * - Insurance Providers (life policies, education endowment policies, e.g. Britam, Jubilee, ICEA)
 * - Commercial Banks (mortgages, personal credit lines)
 * - Microfinance & Employee Welfare Funds
 * 
 * CORE ENTITIES & HIERARCHY:
 * 1. remittance_institutions:
 *    - Master catalog of verified destination financial institutions with settlement details
 *      (bank account numbers, SWIFT codes, M-Pesa Paybills, disbursement schedules).
 * 
 * 2. employee_remittance_mandates:
 *    - The standing instruction signed by the employee authorizing recurring monthly payroll deduction.
 *    - Captures the policy/member number, monthly amount, deduction type, and active date window.
 * 
 * 3. remittance_disbursement_batches:
 *    - Monthly grouping of all deducted remittances across the workforce ready for settlement.
 *    - Tracks bank EFT / API disbursement status, settlement reference, and confirmation receipts.
 * 
 * 4. remittance_batch_items:
 *    - Line-item breakdown per employee and policy linking directly to the deduction record.
 * 
 * ACCOUNTING SUB-LEDGER INTEGRATION:
 * - Payroll Run Processing:
 *   Debit: Payroll Net Clearing
 *   Credit: Third-Party Remittances Payable (Liability per institution)
 * - Disbursement Settlement:
 *   Debit: Third-Party Remittances Payable
 *   Credit: Bank Disbursement Account
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
  date,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants, organizations } from "./auth-tenancy";
import { employees } from "./core-hr";
import { payrollRuns } from "./payroll";

// State Machine Invariants
export const mandateStatusEnum = pgEnum("remittance_mandate_status", [
  "active",
  "suspended",
  "cancelled",
  "completed",
]);

export const remittanceBatchStatusEnum = pgEnum("remittance_batch_status", [
  "draft",
  "approved",
  "processing_disbursal",
  "disbursed",
  "reconciled",
]);

// Open TypeScript Types
export type StandardInstitutionType =
  | "insurance_provider"
  | "cooperative"
  | "sacco"
  | "pension_administrator"
  | "bank"
  | "student_loan_board"
  | "trade_union"
  | "charity_fund"
  | "court_garnishment"
  | (string & {});

// 1. Third-Party Institutions (Insurance Companies, Cooperatives/SACCOs, Pension Admins, Loan Boards, Unions)
export const thirdPartyInstitutions = pgTable(
  "third_party_institutions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(), // e.g. "Harambee Sacco", "Stima Sacco", "Britam Insurance", "HELB"
    code: varchar("code", { length: 50 }).notNull(),
    institutionType: varchar("institution_type", { length: 50 }).default("cooperative").notNull(),
    registrationNumber: varchar("registration_number", { length: 100 }), // e.g. CS/1234 for Cooperatives
    contactEmail: varchar("contact_email", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 50 }),
    
    // Banking Settlement Rails
    bankName: varchar("bank_name", { length: 100 }),
    bankBranch: varchar("bank_branch", { length: 100 }),
    bankAccountNumber: varchar("bank_account_number", { length: 100 }),
    bankAccountName: varchar("bank_account_name", { length: 255 }),
    bankSwiftCode: varchar("bank_swift_code", { length: 50 }),
    
    // Mobile Money Settlement Rails (M-Pesa B2B / B2C to Paybill)
    mpesaPaybillNumber: varchar("mpesa_paybill_number", { length: 50 }),
    mpesaAccountReferenceRule: varchar("mpesa_account_reference_rule", { length: 100 }), // e.g. "{policy_number}" or "{member_number}"
    
    currency: varchar("currency", { length: 3 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("inst_tenant_id_idx").on(table.tenantId),
    index("inst_org_id_idx").on(table.organizationId),
    uniqueIndex("inst_org_code_idx").on(table.organizationId, table.code),
  ]
);

// 2. Cooperative Products Master (Multi-Product Catalog per Cooperative Society)
export const cooperativeProducts = pgTable(
  "cooperative_products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    institutionId: uuid("institution_id")
      .references(() => thirdPartyInstitutions.id, { onDelete: "cascade" })
      .notNull(),
    productName: varchar("product_name", { length: 150 }).notNull(), // e.g. "Main Non-Withdrawable Deposits", "Normal Development Loan", "Benevolent Fund"
    productCode: varchar("product_code", { length: 50 }).notNull(), // e.g. "DEP_SHARES", "LOAN_DEV", "BENEVOLENT"
    productCategory: varchar("product_category", { length: 50 }).default("deposit").notNull(), // 'deposit', 'benevolent', 'loan', 'share_capital'
    interestRateAnnual: numeric("interest_rate_annual", { precision: 5, scale: 2 }).default("0.00").notNull(),
    deductionPriority: integer("deduction_priority").default(1).notNull(), // Lower number = higher priority for 1/3 rule sorting
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("coop_prod_tenant_idx").on(table.tenantId),
    index("coop_prod_inst_idx").on(table.institutionId),
    uniqueIndex("coop_prod_inst_code_idx").on(table.institutionId, table.productCode),
  ]
);

// 3. Employee Remittance Mandates (Standing voluntary/statutory deduction instructions)
export const employeeRemittanceMandates = pgTable(
  "employee_remittance_mandates",
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
    institutionId: uuid("institution_id")
      .references(() => thirdPartyInstitutions.id, { onDelete: "cascade" })
      .notNull(),
    cooperativeProductId: uuid("cooperative_product_id").references(() => cooperativeProducts.id, {
      onDelete: "set null",
    }),
    remittanceType: varchar("remittance_type", { length: 50 }).notNull(), // 'cooperative_deposit', 'cooperative_loan', 'insurance_premium', 'union_due', 'student_loan'
    memberOrPolicyNumber: varchar("member_or_policy_number", { length: 100 }).notNull(), // e.g. "SACCO-MEM-409", "EDU-POL-9921"
    loanAccountNumber: varchar("loan_account_number", { length: 100 }), // If loan product
    
    // Monetary breakdowns
    monthlyAmount: numeric("monthly_amount", { precision: 12, scale: 2 }).notNull(),
    principalAmount: numeric("principal_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
    interestAmount: numeric("interest_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
    outstandingBalance: numeric("outstanding_balance", { precision: 12, scale: 2 }).default("0.00").notNull(),

    currency: varchar("currency", { length: 3 }).notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"), // Null if ongoing
    isOngoing: boolean("is_ongoing").default(true).notNull(),
    isTaxReliefEligible: boolean("is_tax_relief_eligible").default(false).notNull(), // e.g. Life & Education insurance gets 15% tax relief in Kenya!
    status: mandateStatusEnum("status").default("active").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("mandates_tenant_id_idx").on(table.tenantId),
    index("mandates_employee_id_idx").on(table.employeeId),
    index("mandates_institution_id_idx").on(table.institutionId),
  ]
);

// 4. Remittance Batches (Group payments and remittance schedules generated per payroll run)
export const remittanceBatches = pgTable(
  "remittance_batches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    payrollRunId: uuid("payroll_run_id")
      .references(() => payrollRuns.id, { onDelete: "cascade" })
      .notNull(),
    institutionId: uuid("institution_id")
      .references(() => thirdPartyInstitutions.id, { onDelete: "cascade" })
      .notNull(),
    batchNumber: varchar("batch_number", { length: 50 }).notNull(), // e.g. "REM-2026-09-HARAMBEE"
    totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    employeeCount: integer("employee_count").notNull(),
    status: remittanceBatchStatusEnum("status").default("draft").notNull(),
    disbursedAt: timestamp("disbursed_at", { withTimezone: true }),
    disbursementReference: varchar("disbursement_reference", { length: 100 }), // M-Pesa ConversationID or Bank UTR
    scheduleCsvUrl: text("schedule_csv_url"), // Generated remittance report for the institution
    schedulePdfUrl: text("schedule_pdf_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("rem_batch_tenant_id_idx").on(table.tenantId),
    index("rem_batch_payroll_run_idx").on(table.payrollRunId),
    index("rem_batch_institution_idx").on(table.institutionId),
  ]
);

// 5. Remittance Batch Items (Detailed employee schedule rows)
export const remittanceBatchItems = pgTable(
  "remittance_batch_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    batchId: uuid("batch_id")
      .references(() => remittanceBatches.id, { onDelete: "cascade" })
      .notNull(),
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),
    memberOrPolicyNumber: varchar("member_or_policy_number", { length: 100 }).notNull(),
    loanAccountNumber: varchar("loan_account_number", { length: 100 }),
    productName: varchar("product_name", { length: 150 }),
    employeeName: varchar("employee_name", { length: 255 }).notNull(),
    nationalId: varchar("national_id", { length: 100 }),
    deductedAmount: numeric("deducted_amount", { precision: 12, scale: 2 }).notNull(),
    principalPortion: numeric("principal_portion", { precision: 12, scale: 2 }).default("0.00").notNull(),
    interestPortion: numeric("interest_portion", { precision: 12, scale: 2 }).default("0.00").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("rem_items_tenant_id_idx").on(table.tenantId),
    index("rem_items_batch_id_idx").on(table.batchId),
  ]
);
