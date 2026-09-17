/**
 * =========================================================================================
 * ENTERPRISE POSITION MANAGEMENT & HEADCOUNT BUDGETING MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Differentiates enterprise platforms (Workday, SAP SuccessFactors) from small-business HR tools:
 * 1. Position-Driven Architecture vs Person-Driven:
 *    - In enterprise companies, employees do not exist in a vacuum; they are assigned to an
 *      approved, budgeted "Position" (e.g., POS-ENG-0042: Senior Backend Engineer, FTE 1.0).
 *    - Positions persist when an employee resigns, instantly creating an approved vacancy
 *      requisition for the recruitment pipeline without waiting for budget re-approval.
 * 2. Headcount Budgeting & FTE Control:
 *    - Full-Time Equivalent (FTE) tracking (e.g. 1.0 for full-time, 0.5 for half-time).
 *    - Strict CFO budget caps per department and fiscal year (Budgeted FTE vs Actual FTE).
 * 3. Position Hierarchy Tree:
 *    - Recursive hierarchy (`parent_position_id`) defining structural reporting lines independent
 *      of the individuals temporarily occupying the seats.
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
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";
import { tenants, organizations, departments, costCenters, branches } from "./auth-tenancy";
import { designations } from "./core-hr";

// State Machine Invariant: Position Lifecycle Status
export const positionStatusEnum = pgEnum("position_status", [
  "vacant",        // Approved and open for recruitment
  "occupied",      // Currently filled by an active employee
  "frozen",        // Hiring freeze / temporarily on hold
  "eliminated",    // Redundant or retired position
]);

/**
 * 1. Positions Master Registry
 * Approved corporate positions with budgeted compensation ranges and reporting tree.
 */
export const positions = pgTable(
  "positions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),

    positionCode: varchar("position_code", { length: 50 }).notNull(), // e.g., 'POS-ENG-042', 'POS-FIN-012'
    title: varchar("title", { length: 255 }).notNull(), // e.g. "Senior Cloud Infrastructure Architect"

    departmentId: uuid("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    designationId: uuid("designation_id").references(() => designations.id, {
      onDelete: "set null",
    }),
    costCenterId: uuid("cost_center_id").references(() => costCenters.id, {
      onDelete: "set null",
    }),
    branchId: uuid("branch_id").references(() => branches.id, {
      onDelete: "set null",
    }),

    // Position Hierarchy (Self-referencing for position-based org chart)
    parentPositionId: uuid("parent_position_id"), // Reports to Position X

    // FTE (Full Time Equivalent) & Capacity
    fte: numeric("fte", { precision: 4, scale: 2 }).default("1.00").notNull(), // 1.00 = 100% full time, 0.50 = half time
    maxHeadcountCapacity: integer("max_headcount_capacity").default(1).notNull(), // 1 for individual contributor, >1 for pooled positions (e.g. Call Center Rep)

    status: positionStatusEnum("status").default("vacant").notNull(),

    // Compensation Planning & Budget Bands
    budgetedSalaryMin: numeric("budgeted_salary_min", { precision: 15, scale: 2 }),
    budgetedSalaryMax: numeric("budgeted_salary_max", { precision: 15, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),

    // Current Incumbent (Points to current employee occupying the position)
    currentEmployeeId: uuid("current_employee_id"), // Soft link to employees.id

    isCriticalPosition: boolean("is_critical_position").default(false).notNull(), // Key person succession risk flag
    description: text("description"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("positions_tenant_idx").on(table.tenantId),
    index("positions_org_idx").on(table.organizationId),
    index("positions_dept_idx").on(table.departmentId),
    index("positions_status_idx").on(table.status),
    uniqueIndex("positions_org_code_idx").on(table.organizationId, table.positionCode),
  ]
);

/**
 * 2. Headcount & Personnel Budgets
 * Fiscal year workforce planning caps established by HR and Finance.
 */
export const headcountBudgets = pgTable(
  "headcount_budgets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),

    departmentId: uuid("department_id").references(() => departments.id, {
      onDelete: "cascade",
    }),
    fiscalYear: integer("fiscal_year").notNull(), // e.g. 2026

    approvedFteLimit: numeric("approved_fte_limit", { precision: 6, scale: 2 }).notNull(), // e.g. 45.50 FTEs
    approvedPersonnelBudget: numeric("approved_personnel_budget", { precision: 15, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),

    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("hc_budgets_tenant_idx").on(table.tenantId),
    index("hc_budgets_org_year_idx").on(table.organizationId, table.fiscalYear),
    uniqueIndex("hc_budgets_dept_year_idx").on(
      table.organizationId,
      table.departmentId,
      table.fiscalYear
    ),
  ]
);
