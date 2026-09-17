/**
 * =========================================================================================
 * CORPORATE HOLIDAY SHUTDOWNS, CARRYOVER EXCEPTIONS & IMMUTABLE LEAVE LEDGER
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * High-scale global enterprises manage leave beyond simple static balances:
 * 
 * 1. Mandatory Corporate Block Leave / Company Shutdowns:
 *    - Example: Annual Christmas / New Year corporate shutdown (e.g. close Dec 23, resume Jan 3).
 *    - The system calculates the non-holiday working days within the shutdown window (e.g. 3 or 4 days)
 *      and provides an automated 1-click engine for HR to bulk-debit them from active employees' annual leave.
 * 
 * 2. Advance Carryover Extension Requests:
 *    - Standard policy enforces a ceiling (e.g., maximum 5 days carry-forward to the next calendar year).
 *    - If an employee has excess days (e.g., 9 days), they can formally submit an Advance Carryover
 *      Utilization Request before year-end, earmarking the days for approved use in Q1 of the new year.
 * 
 * 3. Immutable Append-Only Leave Transaction Ledger:
 *    - Financial accounting grade double-entry tracking of all leave entitlements:
 *      * 'monthly_accrual': Monthly earned leave (e.g. +2.50 days).
 *      * 'application_debit': Approved employee leave (-3.00 days).
 *      * 'company_shutdown_debit': Auto-deducted corporate Christmas closure (-4.00 days).
 *      * 'carryover_credit': Carried over from prior year.
 *      * 'carryover_forfeiture': Lapsed days post-expiry date.
 *      * 'encashment_debit': Paid out in cash on payroll.
 *      * 'manual_adjustment': HR administrative correction with reason.
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
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants, organizations, users } from "./auth-tenancy";
import { employees } from "./core-hr";
import { leaveTypes } from "./leave";

// State Machine Invariants
export const shutdownExecutionStatusEnum = pgEnum("shutdown_execution_status", [
  "planned",
  "simulated",
  "executed",
  "cancelled",
]);

export const carryoverExceptionStatusEnum = pgEnum("carryover_exception_status", [
  "pending",
  "approved",
  "rejected",
  "expired",
]);

// 1. Company Leave Shutdowns (Corporate Mandatory Block Leave Events)
export const companyLeaveShutdowns = pgTable(
  "company_leave_shutdowns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
    
    name: varchar("name", { length: 150 }).notNull(), // e.g. "2026 Year-End Corporate Christmas Shutdown"
    description: text("description"),
    
    startDate: date("start_date").notNull(), // e.g. "2026-12-24"
    endDate: date("end_date").notNull(), // e.g. "2027-01-02"
    
    workingDaysDeducted: numeric("working_days_deducted", { precision: 5, scale: 2 }).notNull(), // e.g. 4.00 working days (excluding public holidays & weekends)
    leaveTypeId: uuid("leave_type_id").references(() => leaveTypes.id, { onDelete: "restrict" }).notNull(), // Usually Annual Leave
    
    applicableBranchIds: jsonb("applicable_branch_ids").default([]).notNull(), // Empty = All branches/sites
    applicableDepartmentIds: jsonb("applicable_department_ids").default([]).notNull(), // Empty = All departments
    
    status: shutdownExecutionStatusEnum("status").default("planned").notNull(),
    
    totalEmployeesImpacted: integer("total_employees_impacted").default(0).notNull(),
    totalDaysDeducted: numeric("total_days_deducted", { precision: 10, scale: 2 }).default("0.00").notNull(),
    
    executedByUserId: uuid("executed_by_user_id").references(() => users.id, { onDelete: "set null" }),
    executedAt: timestamp("executed_at", { withTimezone: true }),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("shutdown_tenant_id_idx").on(table.tenantId),
    index("shutdown_org_id_idx").on(table.organizationId),
    index("shutdown_status_idx").on(table.status),
  ]
);

// 2. Advance Carryover Extension Requests (Overcoming the 5-Day Cap)
export const leaveCarryoverExceptions = pgTable(
  "leave_carryover_exceptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
    employeeId: uuid("employee_id").references(() => employees.id, { onDelete: "cascade" }).notNull(),
    leaveTypeId: uuid("leave_type_id").references(() => leaveTypes.id, { onDelete: "cascade" }).notNull(),
    
    fromYear: integer("from_year").notNull(), // e.g. 2026
    toYear: integer("to_year").notNull(), // e.g. 2027
    
    standardPolicyCapDays: numeric("standard_policy_cap_days", { precision: 5, scale: 2 }).default("5.00").notNull(),
    totalUnusedDaysAvailable: numeric("total_unused_days_available", { precision: 5, scale: 2 }).notNull(), // e.g. 9.00 days
    requestedCarryoverDays: numeric("requested_carryover_days", { precision: 5, scale: 2 }).notNull(), // e.g. 9.00 days (asking for 4 days above cap)
    approvedCarryoverDays: numeric("approved_carryover_days", { precision: 5, scale: 2 }).default("0.00"),
    
    utilizeBeforeDate: date("utilize_before_date").notNull(), // Agreed expiry date in the new year (e.g. "2027-03-31")
    businessJustification: text("business_justification").notNull(),
    
    status: carryoverExceptionStatusEnum("status").default("pending").notNull(),
    approvedByUserId: uuid("approved_by_user_id").references(() => users.id, { onDelete: "set null" }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("carryover_exc_tenant_id_idx").on(table.tenantId),
    index("carryover_exc_employee_id_idx").on(table.employeeId),
    index("carryover_exc_status_idx").on(table.status),
    uniqueIndex("carryover_exc_emp_year_idx").on(
      table.employeeId,
      table.leaveTypeId,
      table.fromYear,
      table.toYear
    ),
  ]
);

// 3. Immutable Leave Transaction Ledger (Audit Trail of Every Point-in-Time Leave Movement)
export const leaveLedgerEntries = pgTable(
  "leave_ledger_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
    employeeId: uuid("employee_id").references(() => employees.id, { onDelete: "cascade" }).notNull(),
    leaveTypeId: uuid("leave_type_id").references(() => leaveTypes.id, { onDelete: "restrict" }).notNull(),
    
    transactionType: varchar("transaction_type", { length: 50 }).notNull(), // 'monthly_accrual', 'application_debit', 'company_shutdown_debit', 'carryover_credit', 'carryover_forfeiture', 'encashment_debit', 'manual_adjustment'
    
    days: numeric("days", { precision: 5, scale: 2 }).notNull(), // Positive for credits (+2.50), Negative for debits (-4.00)
    balanceAfter: numeric("balance_after", { precision: 5, scale: 2 }).notNull(), // Running point-in-time balance
    
    effectiveDate: date("effective_date").notNull(),
    
    referenceId: varchar("reference_id", { length: 100 }), // Linked leave application ID, shutdown ID, or payroll run ID
    notes: text("notes"),
    
    recordedByUserId: uuid("recorded_by_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("leave_ledger_tenant_id_idx").on(table.tenantId),
    index("leave_ledger_employee_id_idx").on(table.employeeId),
    index("leave_ledger_emp_type_date_idx").on(
      table.employeeId,
      table.leaveTypeId,
      table.effectiveDate
    ),
  ]
);
