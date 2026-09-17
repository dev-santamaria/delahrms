/**
 * =========================================================================================
 * 24/7 CONTINUOUS SHIFT ROTATIONS, MINING ROSTERS & FATIGUE MANAGEMENT MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Heavy industrial operations (mining, metal processing, oil & gas, healthcare, manufacturing)
 * run continuous 24/7 operations requiring recurring multi-week rotation patterns:
 * 
 * Continuous Shift Patterns Supported:
 * 1. Continental 3-Shift 24/7:
 *    - 7 Days Morning (00:00–08:00) -> 2 Days Rest -> 7 Days Afternoon (08:00–16:00) -> 2 Days Rest
 *      -> 7 Days Night (16:00–00:00) -> 3 Days Rest (28-day cycle across 4 rotating crews).
 * 2. Mining FIFO (Fly-In / Fly-Out):
 *    - 14 Days on-site 12-hour continuous shifts -> 14 Days off-site rest / leave.
 * 3. 4-On / 4-Off Continuous:
 *    - 2 Day Shifts (12h) -> 2 Night Shifts (12h) -> 4 Rest Days.
 * 4. DuPont 12-Hour Continuous Cycle:
 *    - 4 consecutive night shifts -> 3 days off -> 3 day shifts -> 1 day off -> 3 night shifts
 *      -> 3 days off -> 4 day shifts -> 7 consecutive rest days.
 * 
 * CAPABILITIES:
 * - Algorithmic roster generation populating `shift_schedules` automatically.
 * - Shift Differential Premiums (e.g., Night Shift 1.25x, Weekend 1.5x, Underground Hazard allowance).
 * - Fatigue compliance: Enforces minimum 11 hours rest between shifts and max consecutive night shifts.
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
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants, organizations } from "./auth-tenancy";
import { shiftTemplates } from "./time-attendance";

// 1. Shift Rotation Patterns (Recurring Master Cycles)
export const shiftRotationPatterns = pgTable(
  "shift_rotation_patterns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
    
    name: varchar("name", { length: 150 }).notNull(), // e.g. "Continental 24/7 3-Shift", "Mining FIFO 14/14"
    code: varchar("code", { length: 50 }).notNull(),
    description: text("description"),
    
    cycleLengthDays: integer("cycle_length_days").notNull(), // e.g. 7, 14, 21, 28 days
    patternCategory: varchar("pattern_category", { length: 50 }).default("continuous_24_7").notNull(), // 'continuous_24_7', 'mining_fifo', 'manufacturing_twelve_hour', 'flexible_office'
    
    // Safety & Labor Law Constraints
    maxConsecutiveWorkDays: integer("max_consecutive_work_days").default(7).notNull(),
    maxConsecutiveNightShifts: integer("max_consecutive_night_shifts").default(4).notNull(),
    minRestHoursBetweenShifts: integer("min_rest_hours_between_shifts").default(11).notNull(),
    
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("shift_pat_tenant_id_idx").on(table.tenantId),
    index("shift_pat_org_id_idx").on(table.organizationId),
    uniqueIndex("shift_pat_org_code_idx").on(table.organizationId, table.code),
  ]
);

// 2. Rotation Pattern Steps (Day-by-Day Definition of the Cycle)
export const rotationPatternSteps = pgTable(
  "rotation_pattern_steps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    patternId: uuid("pattern_id")
      .references(() => shiftRotationPatterns.id, { onDelete: "cascade" })
      .notNull(),
    
    stepDayNumber: integer("step_day_number").notNull(), // 1 to cycleLengthDays
    
    isRestDay: boolean("is_rest_day").default(false).notNull(),
    shiftTemplateId: uuid("shift_template_id").references(() => shiftTemplates.id, {
      onDelete: "set null",
    }),
    
    // Premium Multipliers for Payroll Differential Calculation
    shiftDifferentialMultiplier: numeric("shift_differential_multiplier", { precision: 4, scale: 2 }).default("1.00").notNull(), // e.g. 1.25 for night, 1.50 for weekend
    hazardAllowanceDailyAmount: numeric("hazard_allowance_daily_amount", { precision: 10, scale: 2 }).default("0.00").notNull(), // e.g. Underground mining hazard stipend
    
    notes: varchar("notes", { length: 100 }), // e.g. "Day Shift", "Night Shift", "Mandatory Off"
  },
  (table) => [
    index("rot_step_pat_id_idx").on(table.patternId),
    uniqueIndex("rot_step_pat_day_idx").on(table.patternId, table.stepDayNumber),
  ]
);

// 3. Crew Rosters (Workforce Cohorts Assigned to a Rotation Pattern)
export const crewRosters = pgTable(
  "crew_rosters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
    
    name: varchar("name", { length: 150 }).notNull(), // e.g. "Crew A - Alpha Shift", "Crew B - Bravo Shift"
    code: varchar("code", { length: 50 }).notNull(),
    
    patternId: uuid("pattern_id")
      .references(() => shiftRotationPatterns.id, { onDelete: "restrict" })
      .notNull(),
    
    cycleAnchorDate: date("cycle_anchor_date").notNull(), // Date on which Day 1 of the cycle begins for this crew
    colorCode: varchar("color_code", { length: 20 }).default("#f59e0b").notNull(),
    
    assignedEmployeeIds: jsonb("assigned_employee_ids").default([]).notNull(), // Array of employee UUIDs assigned to this crew
    
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("crew_rosters_tenant_id_idx").on(table.tenantId),
    index("crew_rosters_org_id_idx").on(table.organizationId),
    uniqueIndex("crew_rosters_org_code_idx").on(table.organizationId, table.code),
  ]
);
