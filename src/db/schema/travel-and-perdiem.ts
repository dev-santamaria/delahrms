/**
 * =========================================================================================
 * PRE-TRIP TRAVEL LOGISTICS, PER DIEM & CASH ADVANCE RECONCILIATION MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Managing corporate travel across domestic, regional (e.g. Kenya, Uganda, Tanzania, Rwanda),
 * and international destinations requires a comprehensive pre-trip to post-trip lifecycle:
 * 
 * 1. Pre-Trip Travel Authorization:
 *    - Employee submits a travel plan with itinerary, business justification, and destination.
 *    - Automated calculation of daily Per Diem allowances based on destination tier.
 * 
 * 2. Cash Advance Disbursement (Non-Payroll Payout):
 *    - Upon approval, the cash advance is disbursed immediately via direct banking or mobile money,
 *      completely bypassing payroll.
 * 
 * 3. Post-Trip Reconciliation & Fiscal Verification:
 *    - Upon return, the employee submits actual expenses and verified tax invoices/receipts.
 *    - Supports jurisdictions with Scale-Rate Per Diems (e.g. US IRS, UK HMRC, UN DSA) where
 *      receipts are legally not required.
 *    - Calculates the net settlement variance (advance balance refund vs company payout).
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

// State Machine Invariants
export const travelRequestStatusEnum = pgEnum("travel_request_status", [
  "draft",
  "submitted",
  "approved",
  "advance_disbursed",
  "in_travel",
  "reconciliation_pending",
  "settled",
  "rejected",
  "cancelled",
]);

export const travelReconciliationStatusEnum = pgEnum("travel_reconciliation_status", [
  "draft",
  "submitted",
  "under_audit",
  "approved",
  "settled",
  "rejected",
]);

// 1. Per Diem Policies (Configurable by Destination Country & City Tier)
export const perDiemPolicies = pgTable(
  "per_diem_policies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
    
    countryCode: varchar("country_code", { length: 3 }).notNull(), // e.g. "KEN", "UGA", "TZA", "RWA", "USA", "GBR"
    cityTier: varchar("city_tier", { length: 50 }).default("tier_1_capital").notNull(), // 'tier_1_capital', 'tier_2_secondary', 'rural_field'
    cityName: varchar("cityName", { length: 100 }), // Optional specific city override (e.g. "Nairobi", "Kigali", "Dar es Salaam", "London")
    
    currency: varchar("currency", { length: 3 }).notNull(), // Currency of allowance
    
    dailyMealsAllowance: numeric("daily_meals_allowance", { precision: 12, scale: 2 }).default("0.00").notNull(),
    dailyLodgingAllowance: numeric("daily_lodging_allowance", { precision: 12, scale: 2 }).default("0.00").notNull(),
    dailyIncidentalsAllowance: numeric("daily_incidentals_allowance", { precision: 12, scale: 2 }).default("0.00").notNull(),
    
    // Receipt Enforcement Policy:
    // 'scale_rate_no_receipt': Fixed scale rate per diem (IRS/HMRC standard) - NO receipts legally required
    // 'actuals_with_receipt': Receipts mandatory for full reimbursement
    // 'threshold_based': Receipts only required for single expenses exceeding threshold
    receiptPolicy: varchar("receipt_policy", { length: 50 }).default("scale_rate_no_receipt").notNull(),
    receiptThresholdAmount: numeric("receipt_threshold_amount", { precision: 12, scale: 2 }),
    
    effectiveFrom: date("effective_from").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("per_diem_tenant_id_idx").on(table.tenantId),
    index("per_diem_country_idx").on(table.countryCode),
    uniqueIndex("per_diem_org_country_tier_idx").on(
      table.organizationId,
      table.countryCode,
      table.cityTier
    ),
  ]
);

// 2. Travel Requests (Pre-Trip Authorizations)
export const travelRequests = pgTable(
  "travel_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
    employeeId: uuid("employee_id").references(() => employees.id, { onDelete: "cascade" }).notNull(),
    
    travelNumber: varchar("travel_number", { length: 50 }).notNull(), // e.g. "TRV-2026-0042"
    title: varchar("title", { length: 255 }).notNull(), // "East Africa Regional Technical Summit"
    businessPurpose: text("business_purpose").notNull(),
    
    tripType: varchar("trip_type", { length: 50 }).default("regional_cross_border").notNull(), // 'domestic_local', 'regional_cross_border', 'international'
    
    originCountryCode: varchar("origin_country_code", { length: 3 }).notNull(),
    originCity: varchar("origin_city", { length: 100 }).notNull(),
    destinationCountryCode: varchar("destination_country_code", { length: 3 }).notNull(),
    destinationCity: varchar("destination_city", { length: 100 }).notNull(),
    
    departureDate: date("departure_date").notNull(),
    returnDate: date("return_date").notNull(),
    totalDays: integer("total_days").notNull(),
    
    currency: varchar("currency", { length: 3 }).notNull(),
    
    // Budget Breakdown
    estimatedPerDiemAmount: numeric("estimated_per_diem_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
    estimatedFlightAmount: numeric("estimated_flight_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
    estimatedHotelAmount: numeric("estimated_hotel_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
    estimatedOtherAmount: numeric("estimated_other_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
    totalEstimatedBudget: numeric("total_estimated_budget", { precision: 12, scale: 2 }).notNull(),
    
    // Pre-Trip Cash Advance
    isCashAdvanceRequested: boolean("is_cash_advance_requested").default(true).notNull(),
    cashAdvanceAmount: numeric("cash_advance_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
    advanceDisbursedAmount: numeric("advance_disbursed_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
    advanceDisbursedAt: timestamp("advance_disbursed_at", { withTimezone: true }),
    advanceDisbursementMethod: varchar("advance_disbursement_method", { length: 50 }), // 'bank_eft', 'mpesa_b2c', 'airtel_money', 'cash'
    advanceDisbursementReference: varchar("advance_disbursement_reference", { length: 100 }),
    
    status: travelRequestStatusEnum("status").default("draft").notNull(),
    
    approvedByUserId: uuid("approved_by_user_id").references(() => users.id, { onDelete: "set null" }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("travel_req_tenant_id_idx").on(table.tenantId),
    index("travel_req_employee_id_idx").on(table.employeeId),
    index("travel_req_status_idx").on(table.status),
    uniqueIndex("travel_req_org_num_idx").on(table.organizationId, table.travelNumber),
  ]
);

// 3. Post-Trip Travel Reconciliations (Advance Settlement & Expense Matching)
export const travelReconciliations = pgTable(
  "travel_reconciliations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
    travelRequestId: uuid("travel_request_id").references(() => travelRequests.id, { onDelete: "cascade" }).notNull(),
    employeeId: uuid("employee_id").references(() => employees.id, { onDelete: "cascade" }).notNull(),
    
    reconciliationNumber: varchar("reconciliation_number", { length: 50 }).notNull(), // e.g. "REC-2026-0042"
    
    totalAdvanceReceived: numeric("total_advance_received", { precision: 12, scale: 2 }).default("0.00").notNull(),
    totalAllowablePerDiem: numeric("total_allowable_per_diem", { precision: 12, scale: 2 }).default("0.00").notNull(),
    totalActualVerifiedExpenses: numeric("total_actual_verified_expenses", { precision: 12, scale: 2 }).default("0.00").notNull(),
    
    // Net Settlement Calculation:
    // Positive = Company owes employee (reimbursement due)
    // Negative = Employee owes company (unspent advance refund due)
    netSettlementVariance: numeric("net_settlement_variance", { precision: 12, scale: 2 }).default("0.00").notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    
    status: travelReconciliationStatusEnum("status").default("draft").notNull(),
    
    settlementRoute: varchar("settlement_route", { length: 50 }).default("direct_disbursement").notNull(), // 'direct_disbursement', 'payroll_deduction_or_credit'
    settledAt: timestamp("settled_at", { withTimezone: true }),
    settlementReference: varchar("settlement_reference", { length: 100 }),
    
    auditedByUserId: uuid("audited_by_user_id").references(() => users.id, { onDelete: "set null" }),
    auditedAt: timestamp("audited_at", { withTimezone: true }),
    auditNotes: text("audit_notes"),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("travel_rec_tenant_id_idx").on(table.tenantId),
    index("travel_rec_req_id_idx").on(table.travelRequestId),
    index("travel_rec_employee_id_idx").on(table.employeeId),
    uniqueIndex("travel_rec_num_idx").on(table.organizationId, table.reconciliationNumber),
  ]
);
