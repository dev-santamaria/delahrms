/**
 * =========================================================================================
 * GLOBAL WORKING CALENDARS, SHIFT SCHEDULES & PUBLIC HOLIDAYS MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Global enterprises operate across dozens of national labor jurisdictions with diverging:
 * 1. Working Day Definitions:
 *    - Western & African Standard: Monday - Friday (Days 1 to 5)
 *    - Middle Eastern Standard (e.g. UAE, Saudi Arabia): Sunday - Thursday (Days 0 to 4)
 *    - Continuous 24/7 Operations: 4-on-4-off rotating calendars
 * 2. Statutory Public Holidays:
 *    - Fixed-Date Holidays (e.g. New Year's Day, Madaraka Day, US Independence Day)
 *    - Variable/Lunar Holidays (e.g. Eid al-Fitr, Easter Monday, Diwali)
 *    - Sub-National / Regional Holidays (e.g. County holidays in Kenya, State holidays in the US/India)
 * 3. Leave & Overtime Computation Engine:
 *    - Integrates with leave balance calculations so holidays falling within leave windows
 *      are automatically excluded from consumed annual leave days.
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
import { geoAdministrativeUnits } from "./geo-hierarchy";

/**
 * 1. Working Calendars
 * Defines standard weekly schedules, working days, and baseline weekly hours.
 */
export const workingCalendars = pgTable(
  "working_calendars",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }), // NULL = Tenant default calendar, non-null = Legal subsidiary calendar

    name: varchar("name", { length: 150 }).notNull(), // e.g., 'East Africa Standard 40h', 'Middle East Sunday-Thursday 48h'
    code: varchar("code", { length: 50 }).notNull(),
    countryCode: varchar("country_code", { length: 3 }).notNull(), // ISO-3166-1 alpha-3

    // Working days of the week: Array of day integers where 0=Sunday, 1=Monday, 2=Tuesday, ... 6=Saturday
    // Standard Mon-Fri = [1, 2, 3, 4, 5]; Middle East Sun-Thu = [0, 1, 2, 3, 4]
    workingDays: jsonb("working_days").default([1, 2, 3, 4, 5]).notNull(),

    standardWeeklyHours: numeric("standard_weekly_hours", { precision: 5, scale: 2 }).default("40.00").notNull(),
    standardDailyHours: numeric("standard_daily_hours", { precision: 4, scale: 2 }).default("8.00").notNull(),
    overtimeThresholdDailyHours: numeric("overtime_threshold_daily_hours", { precision: 4, scale: 2 }).default("8.00").notNull(),

    timezone: varchar("timezone", { length: 100 }).default("UTC").notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("work_cal_tenant_idx").on(table.tenantId),
    index("work_cal_country_idx").on(table.countryCode),
    uniqueIndex("work_cal_org_code_idx").on(table.tenantId, table.code),
  ]
);

/**
 * 2. Public Holidays Registry
 * National, regional, and municipal statutory non-working public holidays.
 */
export const publicHolidays = pgTable(
  "public_holidays",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }), // NULL = Global default country calendar, non-null = Tenant override
    organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),

    countryCode: varchar("country_code", { length: 3 }).notNull(), // e.g. KEN, UGA, TZA, RWA, GBR, USA, ZAF
    administrativeUnitId: uuid("administrative_unit_id").references(
      () => geoAdministrativeUnits.id,
      { onDelete: "set null" }
    ), // Optional state/province/county regional scoping

    name: varchar("name", { length: 150 }).notNull(), // e.g. "Madaraka Day", "Mashujaa Day", "Jamhuri Day", "Boxing Day"
    holidayDate: date("holiday_date").notNull(),
    
    isRecurringAnnual: boolean("is_recurring_annual").default(false).notNull(), // True for fixed calendar dates like Jan 1st
    isHalfDay: boolean("is_half_day").default(false).notNull(),
    
    // Impact on payroll rate: 'standard_paid_holiday', 'double_time_if_worked', 'triple_time'
    remunerationRule: varchar("remuneration_rule", { length: 50 }).default("standard_paid_holiday").notNull(),
    description: text("description"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("pub_holidays_tenant_idx").on(table.tenantId),
    index("pub_holidays_country_date_idx").on(table.countryCode, table.holidayDate),
    index("pub_holidays_admin_idx").on(table.administrativeUnitId),
  ]
);
