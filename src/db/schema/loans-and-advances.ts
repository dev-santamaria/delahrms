/**
 * =========================================================================================
 * COMPANY LOANS, SALARY ADVANCES & AMORTIZATION SCHEDULE MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * This module manages employer-sponsored financial facilities:
 * 1. Company Loans: Multi-month facilities with customizable interest types (flat rate, reducing
 *    balance, zero interest / staff concession) and automated amortization schedules.
 * 2. Salary Advances: Short-term liquidity advances scheduled for automatic 100% recovery against
 *    the employee's upcoming net salary pay period.
 * 
 * CORE ENTITIES & HIERARCHY:
 * 1. employee_loans:
 *    - Master loan record tracking principal, interest rate, term, disbursed amount, outstanding
 *      balance, and total interest accrued.
 *    - State machine: requested -> approved -> active -> paused -> fully_paid (or defaulted / written_off).
 * 
 * 2. loan_amortization_schedules:
 *    - Per-installment schedule specifying due date, principal component, interest component, and
 *      total installment amount.
 *    - Tracks payroll run link (`deducted_in_payroll_run_id`) upon successful pay-slip recovery.
 * 
 * 3. salary_advances:
 *    - Short-term advances with fee handling, disbursement methods, and automated single-cycle deduction.
 * 
 * ACCOUNTING SUB-LEDGER INTEGRATION:
 * - Loan Disbursement:
 *   Debit: Employee Loans Receivable (Asset)
 *   Credit: Bank Clearing / Cash Account (Asset)
 * - Payroll Deduction Recovery:
 *   Debit: Payroll Net Clearing
 *   Credit: Employee Loans Receivable (Principal)
 *   Credit: Interest Income on Staff Loans (Revenue)
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
import { tenants, organizations, users } from "./auth-tenancy";
import { employees } from "./core-hr";
import { payrollRuns } from "./payroll";

// State Machine Invariants
export const loanStatusEnum = pgEnum("loan_status", [
  "requested",
  "approved",
  "active",
  "paused",
  "fully_paid",
  "rejected",
  "written_off",
]);

// Open TypeScript Types for dynamic loan calculation taxonomies
export type StandardInterestType =
  | "zero_interest"
  | "flat_rate"
  | "reducing_balance"
  | "compound_interest"
  | "islamic_murabaha"
  | "islamic_qard_hasan"
  | "custom_amortization"
  | (string & {});

// 1. Loan Types (Configurable company loan products)
export const loanTypes = pgTable(
  "loan_types",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 150 }).notNull(), // Emergency Loan, Salary Advance, Car Loan, School Fees Advance
    code: varchar("code", { length: 50 }).notNull(),
    interestType: varchar("interest_type", { length: 50 }).default("zero_interest").notNull(),
    annualInterestRate: numeric("annual_interest_rate", { precision: 5, scale: 2 }).default("0.00").notNull(),
    maxTenureMonths: integer("max_tenure_months").default(12).notNull(),
    maxPrincipalAmount: numeric("max_principal_amount", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("loan_types_tenant_id_idx").on(table.tenantId),
    index("loan_types_org_id_idx").on(table.organizationId),
    uniqueIndex("loan_types_org_code_idx").on(table.organizationId, table.code),
  ]
);

// 2. Employee Loans (Active agreements with running balance)
export const employeeLoans = pgTable(
  "employee_loans",
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
    loanTypeId: uuid("loan_type_id")
      .references(() => loanTypes.id, { onDelete: "restrict" })
      .notNull(),
    loanNumber: varchar("loan_number", { length: 50 }).notNull(), // e.g. "LN-2026-0012"
    principalAmount: numeric("principal_amount", { precision: 12, scale: 2 }).notNull(),
    interestRate: numeric("interest_rate", { precision: 5, scale: 2 }).default("0.00").notNull(),
    totalInterestAmount: numeric("total_interest_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
    totalRepayableAmount: numeric("total_repayable_amount", { precision: 12, scale: 2 }).notNull(),
    monthlyInstallmentAmount: numeric("monthly_installment_amount", { precision: 12, scale: 2 }).notNull(),
    tenureMonths: integer("tenure_months").notNull(),
    remainingBalanceAmount: numeric("remaining_balance_amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    status: loanStatusEnum("status").default("requested").notNull(),
    disbursedAt: timestamp("disbursed_at", { withTimezone: true }),
    disbursementReference: varchar("disbursement_reference", { length: 100 }), // Bank UTR or M-Pesa ID
    approvedByUserId: uuid("approved_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("emp_loans_tenant_id_idx").on(table.tenantId),
    index("emp_loans_employee_id_idx").on(table.employeeId),
    index("emp_loans_status_idx").on(table.status),
    uniqueIndex("emp_loans_org_num_idx").on(table.organizationId, table.loanNumber),
  ]
);

// 3. Loan Repayment Amortization Schedules (Detailed installments linked to payroll runs)
export const loanRepaymentSchedules = pgTable(
  "loan_repayment_schedules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    loanId: uuid("loan_id")
      .references(() => employeeLoans.id, { onDelete: "cascade" })
      .notNull(),
    installmentNumber: integer("installment_number").notNull(), // 1, 2, ... tenureMonths
    dueDate: date("due_date").notNull(),
    principalDue: numeric("principal_due", { precision: 12, scale: 2 }).notNull(),
    interestDue: numeric("interest_due", { precision: 12, scale: 2 }).default("0.00").notNull(),
    totalDue: numeric("total_due", { precision: 12, scale: 2 }).notNull(),
    amountPaid: numeric("amount_paid", { precision: 12, scale: 2 }).default("0.00").notNull(),
    status: varchar("status", { length: 30 }).default("pending").notNull(), // 'pending', 'paid', 'skipped'
    paidAt: timestamp("paid_at", { withTimezone: true }),
    deductedInPayrollRunId: uuid("deducted_in_payroll_run_id").references(
      () => payrollRuns.id,
      { onDelete: "set null" }
    ),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("loan_sched_tenant_id_idx").on(table.tenantId),
    index("loan_sched_loan_id_idx").on(table.loanId),
    index("loan_sched_payroll_idx").on(table.deductedInPayrollRunId),
  ]
);
