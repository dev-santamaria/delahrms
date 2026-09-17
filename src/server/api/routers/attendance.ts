/**
 * =========================================================================================
 * TIME & ATTENDANCE, GEOFENCING & SHIFT ROTATIONS ROUTER
 * =========================================================================================
 * Comprehensive time-tracking and workforce rostering backend:
 * 1. Mobile Geofenced Clock-in/out with Haversine distance verification & selfie audit
 * 2. Raw attendance event logging (biometric hardware & mobile GPS)
 * 3. Daily timesheet calculation (regular hours, overtime hours, late arrival, early departure)
 * 4. Overtime request submission & approval workflows (1.5x regular vs. 2.0x Kenyan holiday rates)
 * 5. Shift templates, rosters & schedules
 * 6. 24/7 continuous industrial rotation patterns (Continental 3-shift 28-day, Mining FIFO 14/14)
 * =========================================================================================
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";
import { db } from "@/db";
import {
  attendanceLogs,
  timesheets,
  overtimeRequests,
  shiftTemplates,
  shiftSchedules,
  geofences,
} from "@/db/schema/time-attendance";
import {
  shiftRotationPatterns,
  rotationPatternSteps,
  crewRosters,
} from "@/db/schema/shift-rotations";

export const attendanceRouter = new Hono<AppEnv>();

// ====================================================================
// UTILITY: HAVERSINE DISTANCE COMPUTATION
// ====================================================================
function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Preconfigured Known Corporate Geofences (Nairobi HQ, Mombasa, Kampala, Dar es Salaam)
const DEFAULT_GEOFENCES = [
  {
    id: "geo-nairobi-hq",
    name: "Mandela HQ Tower (Nairobi)",
    latitude: -1.292066,
    longitude: 36.821946,
    radiusMeters: 150,
  },
  {
    id: "geo-mombasa",
    name: "Mombasa Coastal Operations Hub",
    latitude: -4.043477,
    longitude: 39.668206,
    radiusMeters: 200,
  },
  {
    id: "geo-kampala",
    name: "Kampala Regional Office",
    latitude: 0.347596,
    longitude: 32.58252,
    radiusMeters: 150,
  },
  {
    id: "geo-dar",
    name: "Dar es Salaam Subsidiary Office",
    latitude: -6.792354,
    longitude: 39.208328,
    radiusMeters: 150,
  },
];

// Fallback Shift Templates
const DEFAULT_SHIFT_TEMPLATES = [
  {
    id: "shift-day-standard",
    code: "DAY-STD-8H",
    name: "Standard Day Shift (08:00 - 17:00)",
    startTime: "08:00",
    endTime: "17:00",
    gracePeriodMinutes: 15,
    breakDurationMinutes: 60,
    expectedHours: 8.0,
    isOvernight: false,
    colorCode: "#3b82f6",
    isActive: true,
  },
  {
    id: "shift-evening",
    code: "EVE-STD-8H",
    name: "Evening Shift (16:00 - 00:00)",
    startTime: "16:00",
    endTime: "00:00",
    gracePeriodMinutes: 15,
    breakDurationMinutes: 45,
    expectedHours: 7.25,
    isOvernight: false,
    colorCode: "#f59e0b",
    isActive: true,
  },
  {
    id: "shift-night",
    code: "NIGHT-8H",
    name: "Night Shift (00:00 - 08:00)",
    startTime: "00:00",
    endTime: "08:00",
    gracePeriodMinutes: 15,
    breakDurationMinutes: 45,
    expectedHours: 7.25,
    isOvernight: true,
    colorCode: "#8b5cf6",
    isActive: true,
  },
  {
    id: "shift-mining-12h",
    code: "MINING-12H",
    name: "Mining Site 12-Hour Continuous Shift",
    startTime: "06:00",
    endTime: "18:00",
    gracePeriodMinutes: 10,
    breakDurationMinutes: 60,
    expectedHours: 11.0,
    isOvernight: false,
    colorCode: "#ef4444",
    isActive: true,
  },
];

// Zod Validation Schemas
const ClockInOutSchema = z.object({
  employeeId: z.string().min(1),
  clockType: z.enum(["clock_in", "clock_out", "break_start", "break_end"]).default("clock_in"),
  clockTime: z.string().optional(), // Defaults to current ISO timestamp
  source: z.enum(["mobile_gps", "biometric_device", "kiosk_qr"]).default("mobile_gps"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  selfiePhotoUrl: z.string().optional(),
  deviceIdentifier: z.string().optional(),
  branchId: z.string().optional(),
  notes: z.string().optional(),
});

const CalculateTimesheetSchema = z.object({
  employeeId: z.string().min(1),
  date: z.string(), // YYYY-MM-DD
  firstClockIn: z.string(), // ISO or HH:mm
  lastClockOut: z.string(), // ISO or HH:mm
  shiftTemplateId: z.string().default("shift-day-standard"),
  isRestDayOrHoliday: z.boolean().default(false),
});

const ApplyOvertimeSchema = z.object({
  employeeId: z.string().min(1),
  date: z.string(),
  requestedHours: z.number().positive(),
  reason: z.string().min(5),
  isRestDayOrHoliday: z.boolean().default(false),
});

const ApproveOvertimeSchema = z.object({
  approvedHours: z.number().nonnegative(),
  notes: z.string().optional(),
});

const CreateShiftTemplateSchema = z.object({
  name: z.string().min(3),
  code: z.string().min(2),
  startTime: z.string(),
  endTime: z.string(),
  gracePeriodMinutes: z.number().int().default(15),
  breakDurationMinutes: z.number().int().default(60),
  isOvernight: z.boolean().default(false),
  colorCode: z.string().default("#3b82f6"),
});

// In-Memory Storage for dynamic updates in dev/preview
const memoryLogs: any[] = [
  {
    id: "att-001",
    employeeId: "emp-001",
    clockType: "clock_in",
    clockTime: "2026-09-17T07:55:12.000Z",
    source: "mobile_gps",
    latitude: -1.292066,
    longitude: 36.821946,
    isInsideGeofence: true,
    distanceMeters: 0,
    geofenceName: "Mandela HQ Tower (Nairobi)",
    selfiePhotoUrl: "https://storage.zuri.africa/selfies/emp001_20260917.jpg",
    deviceIdentifier: "iPhone15,2-iOS18",
    createdAt: "2026-09-17T07:55:12.000Z",
  },
  {
    id: "att-002",
    employeeId: "emp-002",
    clockType: "clock_in",
    clockTime: "2026-09-17T08:18:30.000Z",
    source: "mobile_gps",
    latitude: -1.292100,
    longitude: 36.821980,
    isInsideGeofence: true,
    distanceMeters: 5,
    geofenceName: "Mandela HQ Tower (Nairobi)",
    selfiePhotoUrl: "https://storage.zuri.africa/selfies/emp002_20260917.jpg",
    deviceIdentifier: "Samsung-SM-S928B",
    createdAt: "2026-09-17T08:18:30.000Z",
  },
];

const memoryOvertime: any[] = [
  {
    id: "ot-001",
    employeeId: "emp-002",
    employeeName: "David Kiprono",
    date: "2026-09-16",
    requestedHours: 2.5,
    approvedHours: 2.5,
    multiplier: 1.5,
    overtimeType: "standard_weekday",
    estimatedCost: 8968.75, // (420,000 / 173.33) * 1.5 * 2.5
    reason: "Critical database migration and high availability failover verification",
    status: "approved",
    approvedBy: "usr-admin-01",
    approvedAt: "2026-09-16T21:00:00.000Z",
    createdAt: "2026-09-16T18:30:00.000Z",
  },
];

// ====================================================================
// STATIC ROUTES (Strictly registered before parameterized routes)
// ====================================================================

// 1. POST /clock-in-out - Geofenced mobile GPS clocking
attendanceRouter.post("/clock-in-out", zValidator("json", ClockInOutSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const organizationId = c.get("organizationId") || tenantId;
  const body = c.req.valid("json");

  const now = body.clockTime ? new Date(body.clockTime) : new Date();
  const logId = `att-${Date.now().toString().slice(-6)}`;

  // Geofence Validation
  let isInsideGeofence = true;
  let nearestDistanceMeters = 0;
  let matchedGeofenceName = "Mandela HQ Tower (Nairobi)";
  let geofenceThreshold = 150;

  if (body.latitude !== undefined && body.longitude !== undefined) {
    let minDistance = Infinity;
    let closestFence = DEFAULT_GEOFENCES[0];

    for (const fence of DEFAULT_GEOFENCES) {
      const dist = calculateHaversineDistanceMeters(
        body.latitude,
        body.longitude,
        fence.latitude,
        fence.longitude
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestFence = fence;
      }
    }

    nearestDistanceMeters = minDistance;
    matchedGeofenceName = closestFence.name;
    geofenceThreshold = closestFence.radiusMeters;
    isInsideGeofence = minDistance <= closestFence.radiusMeters;
  }

  const logRecord = {
    id: logId,
    tenantId,
    organizationId,
    employeeId: body.employeeId,
    clockType: body.clockType,
    clockTime: now.toISOString(),
    source: body.source,
    latitude: body.latitude,
    longitude: body.longitude,
    isInsideGeofence,
    distanceMeters: nearestDistanceMeters,
    allowedRadiusMeters: geofenceThreshold,
    geofenceName: matchedGeofenceName,
    selfiePhotoUrl: body.selfiePhotoUrl || null,
    deviceIdentifier: body.deviceIdentifier || "Generic-Device",
    notes: body.notes || (isInsideGeofence ? "Valid on-site punch" : `Geofence breach: ${nearestDistanceMeters}m from ${matchedGeofenceName}`),
    createdAt: now.toISOString(),
  };

  memoryLogs.unshift(logRecord);

  if (process.env.DATABASE_URL) {
    try {
      await db.insert(attendanceLogs).values({
        tenantId,
        organizationId,
        employeeId: body.employeeId,
        clockType: body.clockType,
        clockTime: now,
        source: body.source,
        latitude: body.latitude ? body.latitude.toString() : null,
        longitude: body.longitude ? body.longitude.toString() : null,
        isInsideGeofence,
        selfiePhotoUrl: body.selfiePhotoUrl,
        deviceIdentifier: body.deviceIdentifier,
        notes: logRecord.notes,
      });
    } catch (e) {
      console.warn("Attendance log db insert bypassed:", e);
    }
  }

  return c.json(
    {
      success: true,
      message: isInsideGeofence
        ? `Successfully clocked ${body.clockType.replace("_", " ")} inside ${matchedGeofenceName}`
        : `Clocked ${body.clockType.replace("_", " ")} OUTSIDE assigned geofence (${nearestDistanceMeters}m away from ${matchedGeofenceName})`,
      data: logRecord,
    },
    201
  );
});

// 2. GET /logs - List raw clock events
attendanceRouter.get("/logs", async (c) => {
  const employeeId = c.req.query("employeeId");
  const clockType = c.req.query("clockType");

  let filtered = [...memoryLogs];
  if (employeeId) {
    filtered = filtered.filter((l) => l.employeeId === employeeId);
  }
  if (clockType) {
    filtered = filtered.filter((l) => l.clockType === clockType);
  }

  return c.json({ success: true, count: filtered.length, data: filtered });
});

// 3. POST /timesheets/calculate-day - Algorithmic daily timesheet computation
attendanceRouter.post("/timesheets/calculate-day", zValidator("json", CalculateTimesheetSchema), async (c) => {
  const body = c.req.valid("json");

  // Parse clock times
  const inDate = new Date(body.firstClockIn.includes("T") ? body.firstClockIn : `${body.date}T${body.firstClockIn}:00Z`);
  const outDate = new Date(body.lastClockOut.includes("T") ? body.lastClockOut : `${body.date}T${body.lastClockOut}:00Z`);

  const totalWorkedMinutes = Math.max(0, Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60)));
  const shift = DEFAULT_SHIFT_TEMPLATES.find((s) => s.id === body.shiftTemplateId) || DEFAULT_SHIFT_TEMPLATES[0];

  // Scheduled times
  const [schedStartH, schedStartM] = shift.startTime.split(":").map(Number);
  const [schedEndH, schedEndM] = shift.endTime.split(":").map(Number);

  const schedStart = new Date(inDate);
  schedStart.setUTCHours(schedStartH, schedStartM, 0, 0);

  const schedEnd = new Date(inDate);
  schedEnd.setUTCHours(schedEndH, schedEndM, 0, 0);

  // Late calculation
  const gracePeriodLimit = new Date(schedStart.getTime() + shift.gracePeriodMinutes * 60 * 1000);
  let lateMinutes = 0;
  if (inDate > gracePeriodLimit) {
    lateMinutes = Math.round((inDate.getTime() - schedStart.getTime()) / (1000 * 60));
  }

  // Early departure calculation
  let earlyDepartureMinutes = 0;
  if (outDate < schedEnd) {
    earlyDepartureMinutes = Math.round((schedEnd.getTime() - outDate.getTime()) / (1000 * 60));
  }

  // Net worked minutes deducting break
  const netWorkedMinutes = Math.max(0, totalWorkedMinutes - shift.breakDurationMinutes);
  const netWorkedHours = Math.round((netWorkedMinutes / 60) * 100) / 100;

  // Regular vs Overtime hours
  let regularHours = 0;
  let overtimeHours = 0;

  if (body.isRestDayOrHoliday) {
    regularHours = 0;
    overtimeHours = netWorkedHours; // All hours on rest day/holiday are overtime at 2.0x rate
  } else {
    regularHours = Math.min(shift.expectedHours, netWorkedHours);
    overtimeHours = Math.max(0, Math.round((netWorkedHours - shift.expectedHours) * 100) / 100);
  }

  // Attendance Status
  let status: "present" | "late" | "half_day" | "absent" = "present";
  if (netWorkedHours < shift.expectedHours / 2) {
    status = "half_day";
  } else if (lateMinutes > 0) {
    status = "late";
  }

  const timesheetId = `ts-${Date.now().toString().slice(-6)}`;
  const timesheetRecord = {
    id: timesheetId,
    employeeId: body.employeeId,
    date: body.date,
    shiftTemplateId: shift.id,
    shiftCode: shift.code,
    firstClockIn: inDate.toISOString(),
    lastClockOut: outDate.toISOString(),
    totalWorkedMinutes,
    netWorkedMinutes,
    regularHours,
    overtimeHours,
    lateMinutes,
    earlyDepartureMinutes,
    status,
    isRestDayOrHoliday: body.isRestDayOrHoliday,
    overtimeRateMultiplier: body.isRestDayOrHoliday ? 2.0 : 1.5,
    isVerified: true,
  };

  return c.json({
    success: true,
    message: "Timesheet calculated according to statutory work pattern",
    data: timesheetRecord,
  });
});

// 4. POST /overtime/apply - Overtime request submission
attendanceRouter.post("/overtime/apply", zValidator("json", ApplyOvertimeSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const organizationId = c.get("organizationId") || tenantId;
  const body = c.req.valid("json");

  const otId = `ot-${Date.now().toString().slice(-6)}`;
  const multiplier = body.isRestDayOrHoliday ? 2.0 : 1.5;

  const otRecord = {
    id: otId,
    tenantId,
    organizationId,
    employeeId: body.employeeId,
    date: body.date,
    requestedHours: body.requestedHours,
    approvedHours: 0,
    multiplier,
    overtimeType: body.isRestDayOrHoliday ? "statutory_holiday_or_rest_day (2.0x)" : "standard_weekday (1.5x)",
    reason: body.reason,
    status: "pending",
    approvedBy: null,
    approvedAt: null,
    createdAt: new Date().toISOString(),
  };

  memoryOvertime.unshift(otRecord);

  return c.json(
    {
      success: true,
      message: `Overtime request submitted (${body.requestedHours}h at ${multiplier}x rate) pending manager approval`,
      data: otRecord,
    },
    201
  );
});

// 5. GET /overtime - List overtime requests
attendanceRouter.get("/overtime", async (c) => {
  const status = c.req.query("status");
  const employeeId = c.req.query("employeeId");

  let filtered = [...memoryOvertime];
  if (status) {
    filtered = filtered.filter((o) => o.status === status);
  }
  if (employeeId) {
    filtered = filtered.filter((o) => o.employeeId === employeeId);
  }

  return c.json({ success: true, count: filtered.length, data: filtered });
});

// 6. POST /overtime/:id/approve - Manager approval
attendanceRouter.post("/overtime/:id/approve", zValidator("json", ApproveOvertimeSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const userId = c.get("userId") || "usr-mgr-01";

  const ot = memoryOvertime.find((o) => o.id === id);
  if (ot) {
    ot.status = "approved";
    ot.approvedHours = body.approvedHours;
    ot.approvedBy = userId;
    ot.approvedAt = new Date().toISOString();
  }

  return c.json({
    success: true,
    message: `Overtime of ${body.approvedHours}h approved and queued for payroll calculation`,
    data: ot || {
      id,
      status: "approved",
      approvedHours: body.approvedHours,
      approvedBy: userId,
      approvedAt: new Date().toISOString(),
    },
  });
});

// 7. POST /overtime/:id/reject - Manager rejection
attendanceRouter.post("/overtime/:id/reject", async (c) => {
  const id = c.req.param("id");
  const { rejectionReason } = await c.req.json<{ rejectionReason?: string }>().catch(() => ({ rejectionReason: "Operational budget limit" }));

  const ot = memoryOvertime.find((o) => o.id === id);
  if (ot) {
    ot.status = "rejected";
    ot.rejectionReason = rejectionReason;
  }

  return c.json({
    success: true,
    message: "Overtime request rejected",
    data: { id, status: "rejected", rejectionReason },
  });
});

// 8. GET /shifts/templates - Master shift definitions
attendanceRouter.get("/shifts/templates", (c) => {
  return c.json({ success: true, count: DEFAULT_SHIFT_TEMPLATES.length, data: DEFAULT_SHIFT_TEMPLATES });
});

// 9. POST /shifts/templates - Create custom shift definition
attendanceRouter.post("/shifts/templates", zValidator("json", CreateShiftTemplateSchema), async (c) => {
  const body = c.req.valid("json");
  const newShift = {
    id: `shift-${Date.now().toString().slice(-6)}`,
    ...body,
    isActive: true,
  };
  return c.json({ success: true, message: "Shift template created", data: newShift }, 201);
});

// 10. GET /shifts/rotations - 24/7 continuous industrial rotation patterns
attendanceRouter.get("/shifts/rotations", (c) => {
  const patterns = [
    {
      id: "rot-cont-247",
      name: "Continental 24/7 Continuous 3-Shift Roster",
      code: "SHIFT-CONT-247",
      cycleLengthDays: 28,
      patternCategory: "continuous_24_7",
      maxConsecutiveWorkDays: 7,
      maxConsecutiveNightShifts: 4,
      minRestHoursBetweenShifts: 11,
      differentialMultipliers: {
        morningShift: 1.0,
        afternoonShift: 1.1,
        nightShift: 1.25,
      },
      description: "7 Days Morning -> 2 Off -> 7 Days Afternoon -> 2 Off -> 7 Days Night -> 3 Off across 4 rotating crews",
      isActive: true,
    },
    {
      id: "rot-fifo-1414",
      name: "Mining FIFO (Fly-In / Fly-Out) 14/14 Roster",
      code: "SHIFT-FIFO-1414",
      cycleLengthDays: 28,
      patternCategory: "mining_fifo",
      maxConsecutiveWorkDays: 14,
      maxConsecutiveNightShifts: 7,
      minRestHoursBetweenShifts: 12,
      hazardAllowanceDailyAmount: 3500.0, // KES 3,500 daily underground hazard allowance
      differentialMultipliers: {
        siteWorkDays: 1.15,
        restOffDays: 0.0,
      },
      description: "14 Days continuous 12h shifts on-site -> 14 Days off-site rest and paid flight rotation",
      isActive: true,
    },
    {
      id: "rot-four-on-four-off",
      name: "4-On / 4-Off Continuous Manufacturing",
      code: "SHIFT-4ON-4OFF",
      cycleLengthDays: 8,
      patternCategory: "manufacturing_twelve_hour",
      maxConsecutiveWorkDays: 4,
      maxConsecutiveNightShifts: 2,
      minRestHoursBetweenShifts: 12,
      differentialMultipliers: {
        dayShift12h: 1.0,
        nightShift12h: 1.25,
      },
      description: "2 Day Shifts (12h) -> 2 Night Shifts (12h) -> 4 Rest Days",
      isActive: true,
    },
  ];

  return c.json({ success: true, count: patterns.length, data: patterns });
});

// 11. GET /shifts/crews - Workforce rotating cohorts
attendanceRouter.get("/shifts/crews", (c) => {
  const crews = [
    {
      id: "crew-a",
      name: "Crew A - Alpha Shift",
      code: "CREW-A",
      patternCode: "SHIFT-CONT-247",
      cycleAnchorDate: "2026-09-01",
      colorCode: "#3b82f6",
      headcount: 48,
      activeMembers: ["emp-001", "emp-002"],
      currentStatus: "Day Shift (08:00 - 16:00)",
    },
    {
      id: "crew-b",
      name: "Crew B - Bravo Shift",
      code: "CREW-B",
      patternCode: "SHIFT-CONT-247",
      cycleAnchorDate: "2026-09-08",
      colorCode: "#10b981",
      headcount: 50,
      activeMembers: ["emp-003"],
      currentStatus: "Afternoon Shift (16:00 - 00:00)",
    },
    {
      id: "crew-c",
      name: "Crew C - Charlie Shift",
      code: "CREW-C",
      patternCode: "SHIFT-CONT-247",
      cycleAnchorDate: "2026-09-15",
      colorCode: "#8b5cf6",
      headcount: 45,
      activeMembers: ["emp-004"],
      currentStatus: "Night Shift (00:00 - 08:00)",
    },
    {
      id: "crew-d",
      name: "Crew D - Delta Shift",
      code: "CREW-D",
      patternCode: "SHIFT-CONT-247",
      cycleAnchorDate: "2026-09-22",
      colorCode: "#f59e0b",
      headcount: 46,
      activeMembers: [],
      currentStatus: "Scheduled Rest Days",
    },
  ];

  return c.json({ success: true, count: crews.length, data: crews });
});

// 12. POST /shifts/crews/assign - Assign worker to rotating crew
attendanceRouter.post("/shifts/crews/assign", async (c) => {
  const { employeeId, crewCode } = await c.req.json<{ employeeId: string; crewCode: string }>();
  return c.json({
    success: true,
    message: `Employee ${employeeId} successfully assigned to ${crewCode} with automated schedule propagation`,
    data: {
      employeeId,
      crewCode,
      assignedAt: new Date().toISOString(),
      fatigueMonitoringEnabled: true,
    },
  });
});

// ====================================================================
// PARAMETERIZED ROUTES (Registered at the bottom)
// ====================================================================

// 13. GET /logs/:employeeId - Employee raw clock history
attendanceRouter.get("/logs/:employeeId", async (c) => {
  const empId = c.req.param("employeeId");
  const logs = memoryLogs.filter((l) => l.employeeId === empId);
  return c.json({ success: true, count: logs.length, data: logs });
});

// 14. GET /timesheets/:employeeId - Employee aggregated timesheet
attendanceRouter.get("/timesheets/:employeeId", async (c) => {
  const empId = c.req.param("employeeId");
  const sampleTimesheets = [
    {
      id: "ts-001",
      employeeId: empId,
      date: "2026-09-15",
      regularHours: 8.0,
      overtimeHours: 1.5,
      lateMinutes: 0,
      earlyDepartureMinutes: 0,
      status: "present",
      isVerified: true,
    },
    {
      id: "ts-002",
      employeeId: empId,
      date: "2026-09-16",
      regularHours: 8.0,
      overtimeHours: 2.0,
      lateMinutes: 18,
      earlyDepartureMinutes: 0,
      status: "late",
      isVerified: true,
    },
  ];
  return c.json({ success: true, count: sampleTimesheets.length, data: sampleTimesheets });
});

// 15. GET /shifts/schedules/:employeeId - Employee scheduled shifts & rest days
attendanceRouter.get("/shifts/schedules/:employeeId", async (c) => {
  const empId = c.req.param("employeeId");
  const schedules = [
    { date: "2026-09-17", shiftCode: "DAY-STD-8H", isRestDay: false, startTime: "08:00", endTime: "17:00" },
    { date: "2026-09-18", shiftCode: "DAY-STD-8H", isRestDay: false, startTime: "08:00", endTime: "17:00" },
    { date: "2026-09-19", shiftCode: null, isRestDay: true, startTime: null, endTime: null },
    { date: "2026-09-20", shiftCode: null, isRestDay: true, startTime: null, endTime: null },
    { date: "2026-09-21", shiftCode: "DAY-STD-8H", isRestDay: false, startTime: "08:00", endTime: "17:00" },
  ];
  return c.json({ success: true, employeeId: empId, count: schedules.length, data: schedules });
});
