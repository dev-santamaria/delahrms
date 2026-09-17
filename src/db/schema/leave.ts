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

// State Machine Invariants
export const leaveApplicationStatusEnum = pgEnum("leave_application_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "withdrawn",
]);

// Accrual frequencies are dynamically managed via reference_lookups (category = 'leave_accrual_frequency')
// (e.g., 'monthly', 'yearly_upfront', 'bi_weekly', 'per_hour_worked', 'quarterly', 'none').

// 1. Leave Types (Configurable categories)
export const leaveTypes = pgTable(
  "leave_types",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    description: text("description"),
    isPaid: boolean("is_paid").default(true).notNull(),
    colorCode: varchar("color_code", { length: 20 }).default("#10b981").notNull(),
    requiresAttachment: boolean("requires_attachment").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("leave_types_tenant_id_idx").on(table.tenantId),
    index("leave_types_org_id_idx").on(table.organizationId),
    uniqueIndex("leave_types_org_code_idx").on(table.organizationId, table.code),
  ]
);

// 2. Leave Policies
export const leavePolicies = pgTable(
  "leave_policies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    leaveTypeId: uuid("leave_type_id")
      .references(() => leaveTypes.id, { onDelete: "cascade" })
      .notNull(),
    annualEntitlementDays: numeric("annual_entitlement_days", { precision: 5, scale: 2 }).notNull(),
    accrualFrequency: varchar("accrual_frequency", { length: 50 }).default("yearly_upfront").notNull(),
    maxCarryoverDays: numeric("max_carryover_days", { precision: 5, scale: 2 }).default("0.00").notNull(),
    carryoverExpiryMonths: integer("carryover_expiry_months").default(3).notNull(),
    probationRestrictionDays: integer("probation_restriction_days").default(0).notNull(),
    minNoticeDays: integer("min_notice_days").default(2).notNull(),
    applicableGender: varchar("applicable_gender", { length: 50 }),
    canBeNegative: boolean("can_be_negative").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("leave_policies_tenant_id_idx").on(table.tenantId),
    index("leave_policies_org_id_idx").on(table.organizationId),
  ]
);

// 3. Leave Balances
export const leaveBalances = pgTable(
  "leave_balances",
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
    leaveTypeId: uuid("leave_type_id")
      .references(() => leaveTypes.id, { onDelete: "cascade" })
      .notNull(),
    year: integer("year").notNull(),
    allocatedDays: numeric("allocated_days", { precision: 5, scale: 2 }).default("0.00").notNull(),
    carriedOverDays: numeric("carried_over_days", { precision: 5, scale: 2 }).default("0.00").notNull(),
    usedDays: numeric("used_days", { precision: 5, scale: 2 }).default("0.00").notNull(),
    pendingDays: numeric("pending_days", { precision: 5, scale: 2 }).default("0.00").notNull(),
    remainingDays: numeric("remaining_days", { precision: 5, scale: 2 }).default("0.00").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("leave_balances_tenant_id_idx").on(table.tenantId),
    index("leave_balances_employee_id_idx").on(table.employeeId),
    uniqueIndex("leave_balances_emp_type_year_idx").on(
      table.employeeId,
      table.leaveTypeId,
      table.year
    ),
  ]
);

// 4. Leave Applications
export const leaveApplications = pgTable(
  "leave_applications",
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
    applicationNumber: varchar("application_number", { length: 50 }).notNull(),
    leaveTypeId: uuid("leave_type_id")
      .references(() => leaveTypes.id, { onDelete: "cascade" })
      .notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    totalDays: numeric("total_days", { precision: 5, scale: 2 }).notNull(),
    isHalfDay: boolean("is_half_day").default(false).notNull(),
    reason: text("reason").notNull(),
    attachmentUrl: text("attachment_url"),
    status: leaveApplicationStatusEnum("status").default("pending").notNull(),
    rejectionReason: text("rejection_reason"),
    approvedByUserId: uuid("approved_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("leave_apps_tenant_id_idx").on(table.tenantId),
    index("leave_apps_employee_id_idx").on(table.employeeId),
    index("leave_apps_status_idx").on(table.status),
    uniqueIndex("leave_apps_org_number_idx").on(table.organizationId, table.applicationNumber),
  ]
);

// 5. Leave Encashments
export const leaveEncashments = pgTable(
  "leave_encashments",
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
    leaveTypeId: uuid("leave_type_id")
      .references(() => leaveTypes.id, { onDelete: "cascade" })
      .notNull(),
    daysToEncash: numeric("days_to_encash", { precision: 5, scale: 2 }).notNull(),
    encashmentAmount: numeric("encashment_amount", { precision: 15, scale: 2 }).notNull(),
    payrollRunId: uuid("payroll_run_id"),
    status: leaveApplicationStatusEnum("status").default("pending").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("leave_encash_tenant_id_idx").on(table.tenantId),
    index("leave_encash_employee_id_idx").on(table.employeeId),
  ]
);
