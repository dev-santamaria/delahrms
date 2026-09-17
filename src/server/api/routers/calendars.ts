/**
 * =========================================================================================
 * CORPORATE CALENDARS, COMPANY EVENTS & PUBLIC HOLIDAYS ROUTER
 * =========================================================================================
 * 1. Company Events (Townhalls, All-Hands, Training webinars, Board meetings)
 * 2. Working Calendars (Standard 5-day, 6-day manufacturing plant, 24/7 rotations)
 * 3. Gazetted Public Holidays across 54 African countries with observance rules
 * =========================================================================================
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";
import { db } from "@/db";
import { companyEvents } from "@/db/schema/calendar-comms";
import { workingCalendars, publicHolidays } from "@/db/schema/global-calendars";
import { eq } from "drizzle-orm";

export const calendarsRouter = new Hono<AppEnv>();

// Zod Schemas
const CreateCompanyEventSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  eventType: z.enum(["townhall", "all_hands", "webinar", "training", "board_meeting", "social"]).default("townhall"),
  startDate: z.string(),
  endDate: z.string(),
  isAllDay: z.boolean().default(false),
  location: z.string().optional(),
  meetingUrl: z.string().url().optional(),
  isMandatory: z.boolean().default(false),
});

const CreatePublicHolidaySchema = z.object({
  countryCode: z.string().length(3).default("KEN"),
  administrativeUnitId: z.string().uuid().optional(),
  name: z.string().min(2).max(150),
  holidayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isHalfDay: z.boolean().default(false),
  isRecurring: z.boolean().default(true),
  observanceRule: z.enum(["exact_day", "next_monday_if_sunday", "proclaimed_by_gazette"]).default("exact_day"),
});

// Seed Company Events
const memoryCompanyEvents: any[] = [
  {
    id: "evt-001",
    title: "Q3 2026 Pan-African All-Hands Townhall",
    description: "Executive leadership address, financial highlights & strategic OKR progress.",
    eventType: "townhall",
    startDate: "2026-09-30T09:00:00.000Z",
    endDate: "2026-09-30T11:00:00.000Z",
    location: "Mandela Tower Auditorium / Zoom Virtual Stream",
    meetingUrl: "https://zoom.us/j/9876543210",
    isMandatory: true,
    organizerName: "Executive Office",
    createdAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "evt-002",
    title: "Annual ISO 27001 Security Refresher Webinar",
    description: "Mandatory information security compliance workshop for all staff.",
    eventType: "training",
    startDate: "2026-10-15T14:00:00.000Z",
    endDate: "2026-10-15T15:30:00.000Z",
    meetingUrl: "https://teams.microsoft.com/l/meetup-join/123",
    isMandatory: true,
    organizerName: "Cybersecurity & Governance",
    createdAt: "2026-09-05T10:00:00.000Z",
  },
];

// Seed Working Calendars
const memoryWorkingCalendars: any[] = [
  {
    id: "cal-std-ken",
    name: "Standard East Africa Commercial Week",
    code: "STD-EA-40H",
    countryCode: "KEN",
    standardWeeklyHours: 40.0,
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    isDefault: true,
  },
  {
    id: "cal-plt-mfg",
    name: "Industrial Plant 6-Day Manufacturing Calendar",
    code: "PLT-MFG-48H",
    countryCode: "KEN",
    standardWeeklyHours: 48.0,
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    isDefault: false,
  },
];

// Seed Gazetted Holidays
const memoryPublicHolidays: any[] = [
  { id: "hol-01", countryCode: "KEN", name: "New Year's Day", holidayDate: "2026-01-01", observanceRule: "exact_day" },
  { id: "hol-02", countryCode: "KEN", name: "Labour Day", holidayDate: "2026-05-01", observanceRule: "exact_day" },
  { id: "hol-03", countryCode: "KEN", name: "Madaraka Day", holidayDate: "2026-06-01", observanceRule: "exact_day" },
  { id: "hol-04", countryCode: "KEN", name: "Huduma Day", holidayDate: "2026-10-10", observanceRule: "exact_day" },
  { id: "hol-05", countryCode: "KEN", name: "Mashujaa Day", holidayDate: "2026-10-20", observanceRule: "exact_day" },
  { id: "hol-06", countryCode: "KEN", name: "Jamhuri Day", holidayDate: "2026-12-12", observanceRule: "exact_day" },
  { id: "hol-07", countryCode: "KEN", name: "Christmas Day", holidayDate: "2026-12-25", observanceRule: "exact_day" },
  { id: "hol-08", countryCode: "KEN", name: "Boxing Day / Utamaduni Day", holidayDate: "2026-12-26", observanceRule: "next_monday_if_sunday" },
];

// 1. GET /events - Query company events
calendarsRouter.get("/events", async (c) => {
  const eventType = c.req.query("eventType");
  let filtered = [...memoryCompanyEvents];
  if (eventType) filtered = filtered.filter((e) => e.eventType === eventType);

  return c.json({
    success: true,
    count: filtered.length,
    data: filtered,
  });
});

// 2. POST /events - Schedule company event
calendarsRouter.post("/events", zValidator("json", CreateCompanyEventSchema), async (c) => {
  const body = c.req.valid("json");
  const newEvt = {
    id: `evt-${Date.now().toString().slice(-4)}`,
    ...body,
    createdAt: new Date().toISOString(),
  };

  memoryCompanyEvents.push(newEvt);

  return c.json({ success: true, message: `Company event '${body.title}' scheduled`, data: newEvt }, 201);
});

// 3. GET /working-calendars - List working week configurations
calendarsRouter.get("/working-calendars", async (c) => {
  return c.json({
    success: true,
    count: memoryWorkingCalendars.length,
    data: memoryWorkingCalendars,
  });
});

// 4. GET /public-holidays - Query gazetted holidays by country
calendarsRouter.get("/public-holidays", async (c) => {
  const countryCode = c.req.query("countryCode") || "KEN";
  const holidays = memoryPublicHolidays.filter((h) => h.countryCode === countryCode);

  return c.json({
    success: true,
    countryCode,
    count: holidays.length,
    data: holidays,
  });
});

// 5. POST /public-holidays - Register public holiday
calendarsRouter.post("/public-holidays", zValidator("json", CreatePublicHolidaySchema), async (c) => {
  const body = c.req.valid("json");
  const newHol = {
    id: `hol-${Date.now().toString().slice(-4)}`,
    ...body,
  };

  memoryPublicHolidays.push(newHol);

  return c.json({ success: true, message: `Public holiday '${body.name}' gazetted for ${body.holidayDate}`, data: newHol }, 201);
});
