/**
 * =========================================================================================
 * COMPANY FLEET, VEHICLE ASSIGNMENTS & STATUTORY CAR BENEFIT MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Manages corporate motor vehicles, pool fleet, and individual employee vehicle custody.
 * Integrates directly with the payroll and statutory filing engines for East African taxation:
 * - Kenya: Section 5(4) of Income Tax Act Cap 470 (Car Benefit Tax & Fuel Benefit)
 * - Tanzania / Uganda: Prescribed company car fringe benefits
 * 
 * Invariants:
 * - A vehicle assigned for private use automatically computes non-cash taxable benefit.
 * - Under Kenyan law, car benefit is the HIGHER of 2% per month of vehicle initial capital cost
 *   OR the Commissioner's prescribed rates based on engine CC capacity.
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
export const vehicleOwnershipEnum = pgEnum("vehicle_ownership_type", [
  "purchased",
  "leased",
  "rented",
]);

export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "active",
  "maintenance",
  "grounded",
  "decommissioned",
  "returned_to_lessor",
]);

export const vehicleAssignmentStatusEnum = pgEnum("vehicle_assignment_status", [
  "active",
  "completed",
  "revoked",
]);

// 1. Company Fleet Vehicles Master
export const companyVehicles = pgTable(
  "company_vehicles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),

    registrationNumber: varchar("registration_number", { length: 50 }).notNull(), // e.g. "KDF 123A"
    make: varchar("make", { length: 100 }).notNull(), // e.g. "Toyota", "Isuzu", "Subaru"
    model: varchar("model", { length: 100 }).notNull(), // e.g. "Land Cruiser Prado", "D-Max"
    yearOfManufacture: integer("year_of_manufacture").notNull(),
    engineCapacityCc: integer("engine_capacity_cc").notNull(), // e.g. 1498, 1998, 2755, 2982
    bodyType: varchar("body_type", { length: 50 }).default("suv").notNull(), // 'suv', 'pickup', 'sedan', 'van'

    ownershipType: vehicleOwnershipEnum("ownership_type").default("purchased").notNull(),
    initialCost: numeric("initial_cost", { precision: 15, scale: 2 }).default("0.00").notNull(),
    monthlyLeaseCost: numeric("monthly_lease_cost", { precision: 15, scale: 2 }).default("0.00").notNull(),
    currency: varchar("currency", { length: 3 }).default("KES").notNull(),

    // Operational & Fleet tracking
    fuelCardNumber: varchar("fuel_card_number", { length: 50 }),
    providesFuel: boolean("provides_fuel").default(true).notNull(),
    
    // Tax Invariant: Private Use Availability
    isAvailableForPrivateUse: boolean("is_available_for_private_use").default(true).notNull(),

    // Assigned Custodian / Driver
    assignedEmployeeId: uuid("assigned_employee_id").references(() => employees.id, {
      onDelete: "set null",
    }),
    assignedDriverEmployeeId: uuid("assigned_driver_employee_id").references(() => employees.id, {
      onDelete: "set null",
    }),

    // Compliance, Insurance & Roadworthiness
    insuranceCompany: varchar("insurance_company", { length: 150 }),
    insurancePolicyNumber: varchar("insurance_policy_number", { length: 100 }),
    insuranceExpiryDate: date("insurance_expiry_date"),
    inspectionExpiryDate: date("inspection_expiry_date"),
    speedGovernorCertExpiry: date("speed_governor_cert_expiry"),
    logbookNumber: varchar("logbook_number", { length: 100 }),
    logbookDocumentUrl: text("logbook_document_url"),
    
    currentMileageKm: integer("current_mileage_km").default(0).notNull(),
    status: vehicleStatusEnum("status").default("active").notNull(),
    customFields: jsonb("custom_fields").default({}).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("fleet_tenant_idx").on(table.tenantId),
    index("fleet_org_idx").on(table.organizationId),
    index("fleet_emp_idx").on(table.assignedEmployeeId),
    uniqueIndex("fleet_org_reg_idx").on(table.organizationId, table.registrationNumber),
  ]
);

// 2. Vehicle Custody & Assignment History
export const vehicleAssignments = pgTable(
  "vehicle_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    vehicleId: uuid("vehicle_id")
      .references(() => companyVehicles.id, { onDelete: "cascade" })
      .notNull(),
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),

    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    startMileageKm: integer("start_mileage_km").notNull(),
    returnMileageKm: integer("return_mileage_km"),
    privateUseAllowed: boolean("private_use_allowed").default(true).notNull(),

    handoverConditionNotes: text("handover_condition_notes"),
    returnConditionNotes: text("return_condition_notes"),
    status: vehicleAssignmentStatusEnum("status").default("active").notNull(),

    approvedByUserId: uuid("approved_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("veh_assign_tenant_idx").on(table.tenantId),
    index("veh_assign_veh_idx").on(table.vehicleId),
    index("veh_assign_emp_idx").on(table.employeeId),
  ]
);

/**
 * Statutory Helper: Calculates monthly KRA Section 5(4) Car Benefit Tax
 * 
 * Rules:
 * Higher of:
 * 1. 2% of initial vehicle capital cost per month (purchased) OR actual lease cost per month (leased)
 * 2. Commissioner prescribed CC rates:
 *    - Up to 1500 cc: KES 3,600
 *    - 1501 to 1750 cc: KES 4,200
 *    - 1751 to 2000 cc: KES 5,800
 *    - 2001 to 3000 cc: KES 7,200
 *    - Over 3000 cc: KES 8,600
 */
export function calculateKenyanCarBenefit(params: {
  engineCapacityCc: number;
  initialCost: number;
  monthlyLeaseCost?: number;
  ownershipType: "purchased" | "leased" | "rented";
  isAvailableForPrivateUse: boolean;
  providesFuel: boolean;
}): {
  carBenefitAmount: number;
  fuelBenefitAmount: number;
  totalTaxableCarBenefit: number;
  rateApplied: string;
} {
  if (!params.isAvailableForPrivateUse) {
    return {
      carBenefitAmount: 0,
      fuelBenefitAmount: 0,
      totalTaxableCarBenefit: 0,
      rateApplied: "No private use benefit applicable",
    };
  }

  // 1. Prescribed Commissioner monthly CC rates
  let prescribedCcRate = 3600;
  if (params.engineCapacityCc > 3000) {
    prescribedCcRate = 8600;
  } else if (params.engineCapacityCc > 2000) {
    prescribedCcRate = 7200;
  } else if (params.engineCapacityCc > 1750) {
    prescribedCcRate = 5800;
  } else if (params.engineCapacityCc > 1500) {
    prescribedCcRate = 4200;
  }

  // 2. Initial cost percentage (2% per month) or lease cost
  let calculatedCostRate = 0;
  if (params.ownershipType === "leased" && (params.monthlyLeaseCost ?? 0) > 0) {
    calculatedCostRate = params.monthlyLeaseCost ?? 0;
  } else {
    calculatedCostRate = Math.round(params.initialCost * 0.02 * 100) / 100;
  }

  // Under Section 5(4), benefit is the HIGHER of the two
  const carBenefitAmount = Math.max(calculatedCostRate, prescribedCcRate);
  const rateApplied = calculatedCostRate >= prescribedCcRate
    ? `2% of Initial Cost (KES ${calculatedCostRate.toLocaleString()}) > Prescribed CC (KES ${prescribedCcRate.toLocaleString()})`
    : `Prescribed CC Rate (KES ${prescribedCcRate.toLocaleString()}) > 2% of Cost (KES ${calculatedCostRate.toLocaleString()})`;

  // Fuel benefit if employer provides fuel for private use (approx 30% of car benefit or fixed rate)
  const fuelBenefitAmount = params.providesFuel ? Math.round(carBenefitAmount * 0.3 * 100) / 100 : 0;
  const totalTaxableCarBenefit = Math.round((carBenefitAmount + fuelBenefitAmount) * 100) / 100;

  return {
    carBenefitAmount,
    fuelBenefitAmount,
    totalTaxableCarBenefit,
    rateApplied,
  };
}
