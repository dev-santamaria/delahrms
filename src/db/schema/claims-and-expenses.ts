/**
 * =========================================================================================
 * CLAIMS, EXPENSE REIMBURSEMENTS & RECEIPT AUDIT TRAIL MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * This module manages end-to-end employee expense reimbursement, receipt digital archiving,
 * mileage allowances, multi-tier supervisory approval workflows, and automated payout routing.
 * 
 * CORE ENTITIES & HIERARCHY:
 * 1. expense_categories:
 *    - Tenant and subsidiary level categorization of reimbursable expenditures (e.g., Travel, Meals,
 *      Client Entertainment, Training & Certifications, Home Office Stipend, Mileage).
 *    - Configurable ceiling limits, receipt requirement flags, and default General Ledger (GL) accounts.
 * 
 * 2. expense_claims:
 *    - The header container for an employee's reimbursement submission.
 *    - State machine: draft -> submitted -> under_review -> approved -> paid (or rejected / cancelled).
 *    - Payout routing:
 *      * via_payroll: Added as a non-taxable reimbursement line item on the employee's monthly payslip.
 *      * direct_payout: Disbursed immediately via direct banking or mobile money (e.g., M-Pesa B2C).
 * 
 * 3. expense_claim_items:
 *    - Line-item breakdown of individual expenses within a claim, with merchant names, tax breakdowns,
 *      and mileage calculations.
 * 
 * 4. expense_claim_attachments:
 *    - Cryptographically verified, immutable digital receipts (PDF/JPEG/PNG) stored in object storage
 *      with MIME type and byte size validation to comply with statutory tax audit standards.
 * 
 * DOUBLE-ENTRY ACCOUNTING & PAYROLL INTEGRATION:
 * - Approved expense claims seamlessly bridge to the Payroll Engine as non-taxable reimbursements.
 * - When posted to the Accounting Sub-Ledger:
 *   Debit: Operating Expense Account (by category)
 *   Credit: Payroll Net Clearing / Cash Disbursement Account
 * =========================================================================================
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
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
import { payrollRuns } from "./payroll";

// State Machine Invariants
export const claimStatusEnum = pgEnum("expense_claim_status", [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "paid",
  "rejected",
  "cancelled",
]);

// Open TypeScript Types for dynamic taxonomies
export type StandardClaimPayoutRoute =
  | "via_payroll"
  | "direct_payout"
  | "petty_cash"
  | "corporate_card_offset"
  | "accounts_payable_voucher"
  | (string & {});

// 1. Expense Categories
export const expenseCategories = pgTable(
  "expense_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 150 }).notNull(), // Travel, Meals, Training, Client Entertainment, Home Office, Mileage
    code: varchar("code", { length: 50 }).notNull(),
    isReceiptRequired: boolean("is_receipt_required").default(true).notNull(),
    maxLimitAmount: numeric("max_limit_amount", { precision: 12, scale: 2 }),
    isMileageRate: boolean("is_mileage_rate").default(false).notNull(),
    mileageRatePerKm: numeric("mileage_rate_per_km", { precision: 8, scale: 2 }),
    currency: varchar("currency", { length: 3 }).notNull(),
    glExpenseAccountId: uuid("gl_expense_account_id"), // Linked to chart_of_accounts
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("exp_cat_tenant_id_idx").on(table.tenantId),
    index("exp_cat_org_id_idx").on(table.organizationId),
    uniqueIndex("exp_cat_org_code_idx").on(table.organizationId, table.code),
  ]
);

// 2. Expense Claims (Claim container report)
export const expenseClaims = pgTable(
  "expense_claims",
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
    claimNumber: varchar("claim_number", { length: 50 }).notNull(), // e.g. "EXP-2026-0034"
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    status: claimStatusEnum("status").default("draft").notNull(),
    payoutRoute: varchar("payout_route", { length: 50 }).default("via_payroll").notNull(),
    approvedByUserId: uuid("approved_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    paidInPayrollRunId: uuid("paid_in_payroll_run_id").references(
      () => payrollRuns.id,
      { onDelete: "set null" }
    ),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("claims_tenant_id_idx").on(table.tenantId),
    index("claims_employee_id_idx").on(table.employeeId),
    index("claims_status_idx").on(table.status),
    uniqueIndex("claims_org_num_idx").on(table.organizationId, table.claimNumber),
  ]
);

// 3. Expense Items (Itemized line entries with receipt uploads and OCR extraction)
export const expenseItems = pgTable(
  "expense_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    claimId: uuid("claim_id")
      .references(() => expenseClaims.id, { onDelete: "cascade" })
      .notNull(),
    expenseCategoryId: uuid("expense_category_id")
      .references(() => expenseCategories.id, { onDelete: "restrict" })
      .notNull(),
    spentDate: date("spent_date").notNull(),
    merchantName: varchar("merchant_name", { length: 255 }).notNull(), // e.g. "Uber Kenya", "Java House", "Safaricom"
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0.00"), // VAT
    currency: varchar("currency", { length: 3 }).notNull(),
    receiptUrl: text("receipt_url"), // Uploaded receipt image or PDF
    ocrData: jsonb("ocr_data"), // AI OCR metadata: { detectedTotal, detectedMerchant, confidenceScore }
    description: text("description"),
    isBillableToClient: boolean("is_billable_to_client").default(false).notNull(),
    
    // Universal Fiscal Compliance & Tax Authority Verification
    // Supports Kenya ETIMS, Tanzania VFD, Rwanda EBM, Uganda EFRIS, Saudi ZATCA, European Peppol, etc.
    fiscalRegime: varchar("fiscal_regime", { length: 50 }).default("standard_receipt").notNull(), // 'etims_ke', 'vfd_tz', 'ebm_rw', 'efris_ug', 'zatca_sa', 'peppol_eu', 'scale_rate_per_diem', 'standard_receipt'
    fiscalInvoiceNumber: varchar("fiscal_invoice_number", { length: 100 }), // Fiscal / Tax Invoice Number
    fiscalControlUnitNumber: varchar("fiscal_control_unit_number", { length: 100 }), // Device / CU / ESD / VFD serial
    merchantTaxPin: varchar("merchant_tax_pin", { length: 50 }), // Tax Identification Number (KRA PIN, TIN, VAT ID)
    fiscalQrCodeUrl: text("fiscal_qr_code_url"), // URL from fiscal receipt QR code
    isFiscalVerified: boolean("is_fiscal_verified").default(false).notNull(),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("exp_items_tenant_id_idx").on(table.tenantId),
    index("exp_items_claim_id_idx").on(table.claimId),
    index("exp_items_fiscal_num_idx").on(table.fiscalInvoiceNumber),
  ]
);
