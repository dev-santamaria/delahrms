/**
 * =========================================================================================
 * GOVERNMENT STATUTORY FILINGS & REGULATORY COMPLIANCE MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * This module tracks monthly and annual compliance returns mandated by governmental tax authorities
 * and social security agencies worldwide:
 * - Kenya: KRA PAYE (iTax), Social Health Insurance Fund (SHIF / SHA), NSSF Tier I & II, Affordable Housing Levy (AHL)
 * - Nigeria: FIRS, State Internal Revenue Service (PAYE), National Housing Fund (NHF), PenCom Pension
 * - South Africa: SARS PAYE, Unemployment Insurance Fund (UIF), Skills Development Levy (SDL)
 * - United Kingdom: HMRC Real Time Information (RTI) Full Payment Submission (FPS), National Insurance, Pension
 * - United States: IRS Form 941, State Withholding, FICA, State Unemployment Insurance (SUI)
 * 
 * CORE ENTITIES:
 * 1. statutory_filing_batches:
 *    - Records monthly return generations per agency, tracking total employee count, aggregate tax/levy
 *      disbursable, submission confirmation codes (e.g. KRA e-Slip PRN), payment receipts, and penalty warnings.
 *    - State machine: draft -> file_generated -> submitted_to_agency -> payment_pending -> paid_and_receipted.
 * 
 * STATUTORY FILE ARTIFACT INTEGRATION:
 * - Automatically produces exact CSV/Excel layouts matching government portal specifications
 *   for 1-click drag-and-drop submission.
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
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants, organizations } from "./auth-tenancy";
import { payrollRuns } from "./payroll";

// State Machine Invariants
export const statutoryFilingStatusEnum = pgEnum("statutory_filing_status", [
  "draft",
  "file_generated",
  "submitted_to_agency",
  "payment_pending",
  "paid_and_receipted",
  "overdue",
]);

// 1. Statutory Agencies Registry (Configurable per Country & Tenant)
export const statutoryAgencies = pgTable(
  "statutory_agencies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }), // NULL = Global catalog default, non-null = Tenant custom agency
    countryCode: varchar("country_code", { length: 3 }).notNull(), // KEN, NGA, ZAF, GBR, USA
    agencyName: varchar("agency_name", { length: 255 }).notNull(), // "Kenya Revenue Authority (KRA)", "Social Health Authority (SHA/SHIF)", "NSSF Kenya", "FIRS Nigeria"
    agencyCode: varchar("agency_code", { length: 50 }).notNull(), // KRA_PAYE, SHIF, NSSF, HOUSING_LEVY, NITA, LIRS, SARS
    filingFrequency: varchar("filing_frequency", { length: 50 }).default("monthly").notNull(),
    submissionFormat: varchar("submission_format", { length: 50 }).notNull(), // 'itax_csv', 'sha_csv', 'nssf_csv', 'housing_levy_csv', 'rti_xml'
    filingDueDayOfMonth: integer("filing_due_day_of_month").default(9).notNull(), // e.g. 9th of following month in Kenya
    portalUrl: text("portal_url"),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("stat_agencies_tenant_idx").on(table.tenantId),
    index("stat_agencies_country_idx").on(table.countryCode, table.agencyCode),
  ]
);

// 2. Statutory Filing Records (Returns generated per payroll cycle)
export const statutoryFilings = pgTable(
  "statutory_filings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    payrollRunId: uuid("payroll_run_id")
      .references(() => payrollRuns.id, { onDelete: "cascade" })
      .notNull(),
    agencyId: uuid("agency_id")
      .references(() => statutoryAgencies.id, { onDelete: "restrict" })
      .notNull(),
    periodMonth: integer("period_month").notNull(),
    periodYear: integer("period_year").notNull(),
    totalEmployeeDeduction: numeric("total_employee_deduction", { precision: 15, scale: 2 }).notNull(),
    totalEmployerContribution: numeric("total_employer_contribution", { precision: 15, scale: 2 }).default("0.00").notNull(),
    totalRemittanceAmount: numeric("total_remittance_amount", { precision: 15, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    prnOrPaymentReference: varchar("prn_or_payment_reference", { length: 100 }), // KRA Payment Registration Number (PRN) or SHA e-slip
    returnFileUrl: text("return_file_url"), // Generated official submission CSV / Excel file
    receiptFileUrl: text("receipt_file_url"), // Uploaded bank / KRA payment acknowledgment receipt
    status: statutoryFilingStatusEnum("status").default("draft").notNull(),
    filedAt: timestamp("filed_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("stat_filings_tenant_id_idx").on(table.tenantId),
    index("stat_filings_payroll_idx").on(table.payrollRunId),
    index("stat_filings_agency_idx").on(table.agencyId),
    uniqueIndex("stat_filings_run_agency_idx").on(table.payrollRunId, table.agencyId),
  ]
);
