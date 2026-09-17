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
import { tenants, organizations, departments, users } from "./auth-tenancy";
import { employees } from "./core-hr";

// State Machine Invariants
export const cycleStatusEnum = pgEnum("cycle_status", [
  "planning",
  "in_progress",
  "review_phase",
  "completed",
  "archived",
]);

export const goalStatusEnum = pgEnum("goal_status", [
  "not_started",
  "on_track",
  "behind",
  "at_risk",
  "completed",
]);

// Open TypeScript Types
export type StandardGoalType =
  | "company"
  | "department"
  | "individual"
  | "cross_functional_squad"
  | (string & {});

export type StandardReviewType =
  | "self"
  | "manager"
  | "peer"
  | "subordinate"
  | "external_stakeholder"
  | (string & {});

// 1. Appraisal Cycles
export const appraisalCycles = pgTable(
  "appraisal_cycles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    reviewDeadline: date("review_deadline").notNull(),
    status: cycleStatusEnum("status").default("planning").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("appraisal_cycles_tenant_id_idx").on(table.tenantId),
    index("appraisal_cycles_org_id_idx").on(table.organizationId),
  ]
);

// 2. Goals & OKRs
export const goals = pgTable(
  "goals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    cycleId: uuid("cycle_id").references(() => appraisalCycles.id, {
      onDelete: "set null",
    }),
    departmentId: uuid("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    employeeId: uuid("employee_id").references(() => employees.id, {
      onDelete: "cascade",
    }),
    parentGoalId: uuid("parent_goal_id"),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    goalType: varchar("goal_type", { length: 50 }).default("individual").notNull(),
    progressPercentage: numeric("progress_percentage", { precision: 5, scale: 2 }).default("0.00").notNull(),
    status: goalStatusEnum("status").default("not_started").notNull(),
    weightage: integer("weightage").default(100).notNull(),
    dueDate: date("due_date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("goals_tenant_id_idx").on(table.tenantId),
    index("goals_employee_id_idx").on(table.employeeId),
  ]
);

// 3. Goal Key Results
export const goalKeyResults = pgTable(
  "goal_key_results",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    goalId: uuid("goal_id")
      .references(() => goals.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    initialValue: numeric("initial_value", { precision: 15, scale: 2 }).default("0.00").notNull(),
    targetValue: numeric("target_value", { precision: 15, scale: 2 }).notNull(),
    currentValue: numeric("current_value", { precision: 15, scale: 2 }).default("0.00").notNull(),
    unit: varchar("unit", { length: 50 }).default("%").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("key_results_tenant_id_idx").on(table.tenantId),
    index("key_results_goal_id_idx").on(table.goalId),
  ]
);

// 4. Performance Reviews (360 Appraisals)
export const performanceReviews = pgTable(
  "performance_reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    cycleId: uuid("cycle_id")
      .references(() => appraisalCycles.id, { onDelete: "cascade" })
      .notNull(),
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),
    reviewerUserId: uuid("reviewer_user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    reviewType: varchar("review_type", { length: 50 }).default("manager").notNull(),
    overallRating: numeric("overall_rating", { precision: 3, scale: 2 }),
    strengthsText: text("strengths_text"),
    improvementsText: text("improvements_text"),
    aiSynthesisSummary: text("ai_synthesis_summary"),
    isSubmitted: boolean("is_submitted").default(false).notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("perf_reviews_tenant_id_idx").on(table.tenantId),
    index("perf_reviews_cycle_id_idx").on(table.cycleId),
    index("perf_reviews_employee_id_idx").on(table.employeeId),
    uniqueIndex("perf_reviews_unique_idx").on(
      table.cycleId,
      table.employeeId,
      table.reviewerUserId,
      table.reviewType
    ),
  ]
);
