/**
 * =========================================================================================
 * STATUTORY TAX RELIEFS, EXEMPTIONS & EMPLOYEE WITHHOLDING CODES MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Multinational payrolls require individual employee declarations that adjust gross taxable pay,
 * taxable benefits, or final tax liability:
 * 
 * Multi-Country Tax Adjustment Mechanisms:
 * - Kenya:
 *   * Personal Relief (Fixed statutory credit: KES 2,400/month)
 *   * Insurance Relief (15% of premiums for life/health/education policies, capped at KES 5,000/month)
 *   * Housing Relief (15% of Affordable Housing Levy paid)
 *   * Mortgage Interest Deduction (up to KES 25,000/month for owner-occupied residence)
 *   * Persons with Disabilities (PWD) Tax Exemption (First KES 150,000/month tax-free via NCPWD certificate)
 * - United Kingdom:
 *   * PAYE Tax Codes: '1257L' (Standard personal allowance), 'BR' (Basic rate all pay), '0T' (No allowance), 'K codes'
 * - United States:
 *   * IRS Form W-4: Dependent credits, multiple jobs checkbox, additional withholding per pay period
 * - South Africa:
 *   * Primary, Secondary (65+), and Tertiary (75+) Age Rebates, Medical Scheme Fees Tax Credits
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
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants, organizations, users } from "./auth-tenancy";
import { employees } from "./core-hr";

// Open TypeScript Types for Tax Relief Categories
export type StandardTaxReliefType =
  | "personal_relief"
  | "insurance_relief"
  | "mortgage_interest_relief"
  | "housing_relief"
  | "disability_exemption"
  | "pension_contribution_relief"
  | "medical_scheme_credit"
  | "uk_tax_code"
  | "us_w4_dependent_credit"
  | "custom_statutory_deduction"
  | (string & {});

/**
 * 1. Employee Tax Reliefs & Statutory Exemptions
 */
export const employeeTaxReliefs = pgTable(
  "employee_tax_reliefs",
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

    countryCode: varchar("country_code", { length: 3 }).notNull(), // ISO-3166-1 alpha-3
    reliefType: varchar("relief_type", { length: 50 }).notNull(), // standard or custom relief key
    
    // Official Tax Code identifier if applicable (e.g. UK "1257L", "BR", "D0", Kenya "PWD-NCPWD-9941")
    taxCodeValue: varchar("tax_code_value", { length: 50 }),

    // Relief Quantities
    monthlyReliefAmount: numeric("monthly_relief_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
    annualReliefAmount: numeric("annual_relief_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
    percentageRate: numeric("percentage_rate", { precision: 5, scale: 2 }), // e.g. 15.00 for 15% insurance relief

    // Statutory Evidence & Verification
    certificateNumber: varchar("certificate_number", { length: 100 }), // e.g. Tax Exemption Certificate Number
    certificateDocumentUrl: text("certificate_document_url"),
    isVerified: boolean("is_verified").default(false).notNull(),
    verifiedByUserId: uuid("verified_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    effectiveFrom: date("effective_from").notNull(),
    effectiveTo: date("effective_to"), // null = indefinite
    isActive: boolean("is_active").default(true).notNull(),

    // Flexible metadata for specific national formulas (e.g., W-4 step 4(a) other income, step 4(c) extra withholding)
    metadata: jsonb("metadata").default({}).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("tax_relief_tenant_idx").on(table.tenantId),
    index("tax_relief_emp_idx").on(table.employeeId),
    index("tax_relief_type_idx").on(table.tenantId, table.reliefType),
  ]
);
