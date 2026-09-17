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
export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "active",
  "pending_approval",
  "suspended",
  "cancelled",
  "opted_out",
]);

export const advanceStatusEnum = pgEnum("advance_status", [
  "requested",
  "approved",
  "disbursed",
  "deducted_in_payroll",
  "rejected",
]);

// Open TypeScript Types (Extensible without DDL migrations)
export type StandardBenefitCategory =
  | "health_insurance"
  | "dental_and_vision"
  | "pension_retirement"
  | "life_insurance"
  | "wellness_stipend"
  | "remote_work_stipend"
  | "learning_stipend"
  | "commuter_meals"
  | "earned_wage_access"
  | "chama_sacco_welfare"
  | "fertility_family_planning"
  | "mental_health"
  | (string & {});

export type StandardCoverageTier =
  | "employee_only"
  | "employee_plus_spouse"
  | "employee_plus_children"
  | "full_family"
  | "employee_plus_parents"
  | "executive_tier"
  | (string & {});

// 1. Benefit Providers / Insurance Carriers
export const benefitProviders = pgTable(
  "benefit_providers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }), // NULL = Global catalog default, non-null = Tenant custom provider
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    countryCode: varchar("country_code", { length: 3 }),
    websiteUrl: text("website_url"),
    supportEmail: varchar("support_email", { length: 255 }),
    supportPhone: varchar("support_phone", { length: 50 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("benefit_providers_tenant_idx").on(table.tenantId),
    index("benefit_providers_code_idx").on(table.code),
  ]
);

// 2. Benefit Plans
export const benefitPlans = pgTable(
  "benefit_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    providerId: uuid("provider_id").references(() => benefitProviders.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    category: varchar("category", { length: 50 }).default("health_insurance").notNull(), // dynamic category lookup
    currency: varchar("currency", { length: 3 }).notNull(),
    tierPricing: jsonb("tier_pricing").notNull(),
    employerContributionPercentage: numeric("employer_contribution_percentage", { precision: 5, scale: 2 }).default("100.00").notNull(),
    isPreTaxDeduction: boolean("is_pre_tax_deduction").default(true).notNull(),
    policyDocumentUrl: text("policy_document_url"),
    description: text("description"),
    customFields: jsonb("custom_fields").default({}).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("benefit_plans_tenant_id_idx").on(table.tenantId),
    index("benefit_plans_org_id_idx").on(table.organizationId),
    uniqueIndex("benefit_plans_org_code_idx").on(table.organizationId, table.code),
  ]
);

// 3. Employee Benefit Enrollments
export const employeeBenefitEnrollments = pgTable(
  "employee_benefit_enrollments",
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
    benefitPlanId: uuid("benefit_plan_id")
      .references(() => benefitPlans.id, { onDelete: "cascade" })
      .notNull(),
    coverageTier: varchar("coverage_tier", { length: 50 }).default("employee_only").notNull(), // dynamic tier lookup
    monthlyEmployeeCost: numeric("monthly_employee_cost", { precision: 12, scale: 2 }).default("0.00").notNull(),
    monthlyEmployerCost: numeric("monthly_employer_cost", { precision: 12, scale: 2 }).default("0.00").notNull(),
    policyMembershipNumber: varchar("policy_membership_number", { length: 100 }),
    status: enrollmentStatusEnum("status").default("active").notNull(),
    effectiveStartDate: date("effective_start_date").notNull(),
    effectiveEndDate: date("effective_end_date"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("benefit_enroll_tenant_id_idx").on(table.tenantId),
    index("benefit_enroll_emp_idx").on(table.employeeId),
    index("benefit_enroll_plan_idx").on(table.benefitPlanId),
  ]
);

// 4. Benefit Dependents
export const benefitDependents = pgTable(
  "benefit_dependents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    enrollmentId: uuid("enrollment_id")
      .references(() => employeeBenefitEnrollments.id, { onDelete: "cascade" })
      .notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    relationship: varchar("relationship", { length: 50 }).notNull(),
    dateOfBirth: date("date_of_birth").notNull(),
    nationalId: varchar("national_id", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("benefit_dep_tenant_id_idx").on(table.tenantId),
    index("benefit_dep_enroll_idx").on(table.enrollmentId),
  ]
);

// 5. Earned Wage Access (EWA) & Salary Advances
export const earnedWageAdvances = pgTable(
  "earned_wage_advances",
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
    requestedAmount: numeric("requested_amount", { precision: 12, scale: 2 }).notNull(),
    feeAmount: numeric("fee_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
    totalRepaymentAmount: numeric("total_repayment_amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    payoutDestination: varchar("payout_destination", { length: 100 }).notNull(),
    payoutReference: varchar("payout_reference", { length: 100 }),
    status: advanceStatusEnum("status").default("requested").notNull(),
    requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow().notNull(),
    disbursedAt: timestamp("disbursed_at", { withTimezone: true }),
    deductedInPayrollRunId: uuid("deducted_in_payroll_run_id").references(
      () => payrollRuns.id,
      { onDelete: "set null" }
    ),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("ewa_tenant_id_idx").on(table.tenantId),
    index("ewa_emp_idx").on(table.employeeId),
    index("ewa_status_idx").on(table.status),
  ]
);
