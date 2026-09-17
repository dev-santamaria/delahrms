import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  numeric,
  time,
  date,
  timestamp,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants, organizations, branches, users } from "./auth-tenancy";
import { employees } from "./core-hr";

// State Machine Invariants
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "late",
  "half_day",
  "absent",
  "on_leave",
  "holiday",
  "rest_day",
]);

export const overtimeStatusEnum = pgEnum("overtime_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);

// Attendance capture sources and clock event types are dynamically tracked via reference_lookups
// (category = 'attendance_source' and 'clock_event_type'), allowing integration of any hardware/vendor.

// 1. Shift Templates
export const shiftTemplates = pgTable(
  "shift_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    gracePeriodMinutes: integer("grace_period_minutes").default(15).notNull(),
    breakDurationMinutes: integer("break_duration_minutes").default(60).notNull(),
    isOvernight: boolean("is_overnight").default(false).notNull(),
    colorCode: varchar("color_code", { length: 20 }).default("#3b82f6").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("shifts_tenant_id_idx").on(table.tenantId),
    index("shifts_org_id_idx").on(table.organizationId),
    uniqueIndex("shifts_org_code_idx").on(table.organizationId, table.code),
  ]
);

// 2. Geofences
export const geofences = pgTable(
  "geofences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    branchId: uuid("branch_id").references(() => branches.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 255 }).notNull(),
    latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
    longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
    radiusMeters: integer("radius_meters").default(150).notNull(),
    polygonCoordinates: jsonb("polygon_coordinates"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("geofences_tenant_id_idx").on(table.tenantId),
    index("geofences_org_id_idx").on(table.organizationId),
  ]
);

// 3. Shift Rosters / Schedules
export const shiftSchedules = pgTable(
  "shift_schedules",
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
    shiftTemplateId: uuid("shift_template_id").references(
      () => shiftTemplates.id,
      { onDelete: "cascade" }
    ),
    scheduleDate: date("schedule_date").notNull(),
    isRestDay: boolean("is_rest_day").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("schedules_tenant_id_idx").on(table.tenantId),
    index("schedules_employee_id_idx").on(table.employeeId),
    uniqueIndex("schedules_emp_date_idx").on(table.employeeId, table.scheduleDate),
  ]
);

// 4. Attendance Raw Logs
export const attendanceLogs = pgTable(
  "attendance_logs",
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
    clockType: varchar("clock_type", { length: 50 }).default("clock_in").notNull(), // 'clock_in', 'clock_out', 'break_start', 'break_end'
    clockTime: timestamp("clock_time", { withTimezone: true }).notNull(),
    source: varchar("source", { length: 50 }).default("mobile_gps").notNull(), // 'mobile_gps', 'biometric_device', 'kiosk_qr'
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    isInsideGeofence: boolean("is_inside_geofence").default(true).notNull(),
    selfiePhotoUrl: text("selfie_photo_url"),
    deviceIdentifier: varchar("device_identifier", { length: 100 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("att_logs_tenant_id_idx").on(table.tenantId),
    index("att_logs_employee_id_idx").on(table.employeeId),
    index("att_logs_clock_time_idx").on(table.clockTime),
  ]
);

// 5. Timesheets
export const timesheets = pgTable(
  "timesheets",
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
    date: date("date").notNull(),
    shiftTemplateId: uuid("shift_template_id").references(
      () => shiftTemplates.id,
      { onDelete: "set null" }
    ),
    firstClockIn: timestamp("first_clock_in", { withTimezone: true }),
    lastClockOut: timestamp("last_clock_out", { withTimezone: true }),
    totalWorkedMinutes: integer("total_worked_minutes").default(0).notNull(),
    regularHours: numeric("regular_hours", { precision: 5, scale: 2 }).default("0.00").notNull(),
    overtimeHours: numeric("overtime_hours", { precision: 5, scale: 2 }).default("0.00").notNull(),
    lateMinutes: integer("late_minutes").default(0).notNull(),
    earlyDepartureMinutes: integer("early_departure_minutes").default(0).notNull(),
    status: attendanceStatusEnum("status").default("present").notNull(),
    customStatusCode: varchar("custom_status_code", { length: 50 }), // Dynamic lookup code e.g. 'WFH', 'CLIENT_VISIT', 'COMP_OFF', 'FIELD_DUTY'
    isVerified: boolean("is_verified").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("timesheets_tenant_id_idx").on(table.tenantId),
    index("timesheets_employee_id_idx").on(table.employeeId),
    uniqueIndex("timesheets_emp_date_idx").on(table.employeeId, table.date),
  ]
);

// 6. Overtime Requests
export const overtimeRequests = pgTable(
  "overtime_requests",
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
    date: date("date").notNull(),
    requestedHours: numeric("requested_hours", { precision: 5, scale: 2 }).notNull(),
    approvedHours: numeric("approved_hours", { precision: 5, scale: 2 }).default("0.00"),
    reason: text("reason").notNull(),
    status: overtimeStatusEnum("status").default("pending").notNull(),
    approvedByUserId: uuid("approved_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("ot_requests_tenant_id_idx").on(table.tenantId),
    index("ot_requests_employee_id_idx").on(table.employeeId),
  ]
);
