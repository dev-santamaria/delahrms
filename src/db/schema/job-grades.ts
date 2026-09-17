/**
 * =========================================================================================
 * JOB GRADES, SALARY STRUCTURES & GRADE-BASED BENEFIT ELIGIBILITY MATRIX
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Differentiates enterprise compensation architecture from simple flat-pay models.
 * Establishes formal corporate grade bands (e.g. G1 through G10 / Executive Band) and
 * connects them directly to:
 * 1. Budgeted compensation ranges (min, midpoint, max base salary)
 * 2. Automated health insurance package tiers (Inpatient/Outpatient limits according to grade)
 * 3. Executive perks (Company vehicle eligibility, club memberships, travel classes)
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
} from "drizzle-orm/pg-core";
import { tenants, organizations } from "./auth-tenancy";
import { benefitPlans } from "./benefits";

// 1. Job Grades Master
export const jobGrades = pgTable(
  "job_grades",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),

    gradeCode: varchar("grade_code", { length: 50 }).notNull(), // e.g. "G1", "G2", "M1", "EXEC-1"
    gradeName: varchar("grade_name", { length: 150 }).notNull(), // e.g. "Operations Associate", "Manager", "C-Suite Executive"
    hierarchyRank: integer("hierarchy_rank").notNull(), // Numeric hierarchy ordering (e.g. 1 to 10)

    // Budgeted Compensation Band
    minSalary: numeric("min_salary", { precision: 15, scale: 2 }).default("0.00").notNull(),
    midSalary: numeric("mid_salary", { precision: 15, scale: 2 }),
    maxSalary: numeric("max_salary", { precision: 15, scale: 2 }).default("0.00").notNull(),
    currency: varchar("currency", { length: 3 }).default("KES").notNull(),

    // Grade Entitlements / Perks Eligibility
    isCompanyCarEligible: boolean("is_company_car_eligible").default(false).notNull(),
    annualLeaveDaysDefault: integer("annual_leave_days_default").default(21).notNull(),
    description: text("description"),

    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("job_grades_tenant_idx").on(table.tenantId),
    index("job_grades_org_idx").on(table.organizationId),
    uniqueIndex("job_grades_org_code_idx").on(table.organizationId, table.gradeCode),
  ]
);

// 2. Benefit Grade Eligibility Matrix (Health insurance tier mapping per Grade)
export const benefitGradeEligibility = pgTable(
  "benefit_grade_eligibility",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    gradeId: uuid("grade_id")
      .references(() => jobGrades.id, { onDelete: "cascade" })
      .notNull(),
    benefitPlanId: uuid("benefit_plan_id")
      .references(() => benefitPlans.id, { onDelete: "cascade" })
      .notNull(),

    // Allowed Coverage Tier according to grade
    allowedCoverageTier: varchar("allowed_coverage_tier", { length: 50 }).default("full_family").notNull(),
    
    // Explicit grade-level policy limits
    inpatientLimit: numeric("inpatient_limit", { precision: 15, scale: 2 }), // e.g. KES 5,000,000 for Exec, KES 1,500,000 for Associate
    outpatientLimit: numeric("outpatient_limit", { precision: 15, scale: 2 }), // e.g. KES 300,000 for Exec, KES 100,000 for Associate
    dentalOpticalLimit: numeric("dental_optical_limit", { precision: 15, scale: 2 }),
    maxDependentsCovered: integer("max_dependents_covered").default(4).notNull(), // e.g. M+4 or M+2

    // Subsidy rules
    employerSubsidyPercentage: numeric("employer_subsidy_percentage", { precision: 5, scale: 2 }).default("100.00").notNull(), // 100% employer paid or co-pay
    requiresCoPay: boolean("requires_co_pay").default(false).notNull(),

    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("bge_tenant_idx").on(table.tenantId),
    index("bge_grade_idx").on(table.gradeId),
    index("bge_plan_idx").on(table.benefitPlanId),
    uniqueIndex("bge_grade_plan_idx").on(table.gradeId, table.benefitPlanId),
  ]
);
