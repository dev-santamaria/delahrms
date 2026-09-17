/**
 * =========================================================================================
 * GENERIC RETIREMENT PENSION & OCCUPATIONAL BENEFIT SCHEMES MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Zero-hardcoding, universal retirement benefits administration module.
 * Accommodates onboarding of any external or in-house pension scheme:
 * - Approved Umbrella Retirement Schemes (e.g. Octagon, ICEA Lion, Britam, Zamara, Enwealth)
 * - Corporate Occupational Defined Contribution / Defined Benefit Trusts
 * - Individual Pension Plans (IPPs) and Provident Funds
 * 
 * Invariants & Regulatory Precision (Kenya RBA Cap 197 & Income Tax Act Cap 470):
 * - Employee contributions to approved schemes are tax-deductible up to KES 20,000/month (KES 240,000/yr).
 * - The KES 20,000 statutory limit is SHARED between NSSF Tier I/II and the private pension scheme.
 * - Any employee contribution beyond the remaining allowable limit is deducted post-tax.
 * - Employer contributions up to KES 20,000/month are non-taxable fringe benefits to the employee.
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
import { tenants, organizations } from "./auth-tenancy";
import { employees } from "./core-hr";

// State Machine Invariants
export const pensionSchemeTypeEnum = pgEnum("pension_scheme_type", [
  "umbrella_scheme",
  "occupational_scheme",
  "individual_pension_plan",
  "provident_fund",
  "gratuity_scheme",
]);

export const pensionMatchingTypeEnum = pgEnum("pension_matching_type", [
  "one_to_one_match",   // Employer matches 100% of employee rate
  "fixed_percentage",   // Employer contributes fixed rate regardless of employee
  "tiered_tenure",      // Scales with years of service
  "discretionary",      // Employer custom contribution
]);

export const pensionEnrollmentStatusEnum = pgEnum("pension_enrollment_status", [
  "active",
  "suspended",
  "withdrawn",
  "retired",
]);

// 1. Pension & Retirement Schemes Master
export const pensionSchemes = pgTable(
  "pension_schemes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),

    schemeName: varchar("scheme_name", { length: 255 }).notNull(), // e.g. "Octagon Umbrella Retirement Scheme", "Mandela DC Staff Scheme"
    schemeCode: varchar("scheme_code", { length: 50 }).notNull(), // e.g. "OCTAGON_UMBRELLA", "ICEA_DC"
    schemeType: pensionSchemeTypeEnum("scheme_type").default("umbrella_scheme").notNull(),
    
    // Administrator, Trustee & Custodian Details (Onboard any provider dynamically)
    administratorName: varchar("administrator_name", { length: 255 }).notNull(), // e.g. "Octagon Africa", "ICEA Lion", "Zamara"
    trusteeName: varchar("trustee_name", { length: 255 }),
    custodianBankName: varchar("custodian_bank_name", { length: 150 }),

    // Statutory Regulatory Credentials
    rbaRegistrationNumber: varchar("rba_registration_number", { length: 100 }), // Retirement Benefits Authority (RBA) ID
    kraTaxExemptionPin: varchar("kra_tax_exemption_pin", { length: 50 }),
    countryCode: varchar("country_code", { length: 3 }).default("KEN").notNull(),

    // Default Contribution Formula
    defaultEmployeeRate: numeric("default_employee_rate", { precision: 5, scale: 2 }).default("5.00").notNull(), // 5.00%
    employerMatchingType: pensionMatchingTypeEnum("employer_matching_type").default("one_to_one_match").notNull(),
    defaultEmployerRate: numeric("default_employer_rate", { precision: 5, scale: 2 }).default("5.00").notNull(), // 5.00%
    allowAdditionalVoluntaryContribution: boolean("allow_avc").default(true).notNull(), // AVC allowed

    // Tax Deduction Rules
    isTaxDeductible: boolean("is_tax_deductible").default(true).notNull(),
    statutoryTaxExemptCapMonthly: numeric("statutory_tax_exempt_cap_monthly", { precision: 12, scale: 2 }).default("20000.00").notNull(), // KES 20,000 in Kenya
    sharesCapWithNssf: boolean("shares_cap_with_nssf").default(true).notNull(), // Under KRA rules, NSSF Tier I/II reduces available exemption

    // Banking & Settlement for Remittances
    bankAccountNumber: varchar("bank_account_number", { length: 100 }),
    bankName: varchar("bank_name", { length: 100 }),
    bankSwiftCode: varchar("bank_swift_code", { length: 50 }),
    remittanceDueDayOfMonth: integer("remittance_due_day_of_month").default(10).notNull(),

    currency: varchar("currency", { length: 3 }).default("KES").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("pension_schemes_tenant_idx").on(table.tenantId),
    index("pension_schemes_org_idx").on(table.organizationId),
    uniqueIndex("pension_schemes_org_code_idx").on(table.organizationId, table.schemeCode),
  ]
);

// 2. Employee Pension Scheme Enrollments
export const employeePensionEnrollments = pgTable(
  "employee_pension_enrollments",
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
    pensionSchemeId: uuid("pension_scheme_id")
      .references(() => pensionSchemes.id, { onDelete: "cascade" })
      .notNull(),

    memberNumber: varchar("member_number", { length: 100 }).notNull(), // Scheme member number
    
    // Contribution overrides (if customized from scheme defaults)
    employeeContributionRate: numeric("employee_contribution_rate", { precision: 5, scale: 2 }), // Percentage (e.g. 5.00%)
    employeeFixedAmount: numeric("employee_fixed_amount", { precision: 12, scale: 2 }), // Fixed amount alternative
    voluntaryAvcAmount: numeric("voluntary_avc_amount", { precision: 12, scale: 2 }).default("0.00").notNull(), // Additional voluntary contribution
    employerContributionRate: numeric("employer_contribution_rate", { precision: 5, scale: 2 }),

    status: pensionEnrollmentStatusEnum("status").default("active").notNull(),
    effectiveStartDate: date("effective_start_date").notNull(),
    effectiveEndDate: date("effective_end_date"),

    // RBA Legal Mandate: Beneficiary Nominee Schedule (JSON array of { fullName, relationship, percentage, nationalId })
    beneficiaryNominees: jsonb("beneficiary_nominees").default([]).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("pen_enroll_tenant_idx").on(table.tenantId),
    index("pen_enroll_emp_idx").on(table.employeeId),
    index("pen_enroll_scheme_idx").on(table.pensionSchemeId),
    uniqueIndex("pen_enroll_emp_scheme_idx").on(table.employeeId, table.pensionSchemeId),
  ]
);
