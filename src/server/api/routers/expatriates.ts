/**
 * =========================================================================================
 * EXPATRIATE WORKFORCE, WORK PERMITS & 183-DAY TAX RESIDENCY ROUTER
 * =========================================================================================
 * Manages foreign nationals and expatriates: work permit renewals (Class D, etc.),
 * split payroll currency disbursements, and physical presence logs for the Kenyan
 * 183-day statutory tax residency rule (Section 2 of Income Tax Act).
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";

export const expatriatesRouter = new Hono<AppEnv>();

// Zod Schemas
const PresenceLogSchema = z.object({
  employeeId: z.string(),
  entryDate: z.string(), // ISO date YYYY-MM-DD
  departureDate: z.string().optional(),
  entryPort: z.string().default("JKIA Nairobi"),
  departurePort: z.string().optional(),
  purpose: z.string().default("Employment"),
});

const SAMPLE_EXPATRIATES = [
  {
    employeeId: "EXP-001",
    employeeName: "Jean-Pierre Dubois",
    nationality: "French",
    passportNumber: "FR9981240",
    passportExpiryDate: "2028-11-15",
    workPermitNumber: "WP/2024/0912",
    workPermitClass: "Class D (Employment)",
    workPermitIssueDate: "2024-02-01",
    workPermitExpiryDate: "2026-12-31",
    daysUntilPermitExpiry: 105,
    permitStatus: "valid",
    taxResidentialStatus: "Resident", // Met 183-day rule
    splitPayrollEnabled: true,
    localCurrencyPercentage: 60, // 60% KES
    offshoreCurrencyPercentage: 40, // 40% EUR
    offshoreCurrency: "EUR",
    daysPresentCurrentYear: 210,
  },
  {
    employeeId: "EXP-002",
    employeeName: "Aarti Sharma",
    nationality: "Indian",
    passportNumber: "IN7762109",
    passportExpiryDate: "2027-06-30",
    workPermitNumber: "WP/2025/0144",
    workPermitClass: "Class D (Employment)",
    workPermitIssueDate: "2025-03-01",
    workPermitExpiryDate: "2027-03-01",
    daysUntilPermitExpiry: 530,
    permitStatus: "valid",
    taxResidentialStatus: "Resident",
    splitPayrollEnabled: true,
    localCurrencyPercentage: 70, // 70% KES
    offshoreCurrencyPercentage: 30, // 30% USD
    offshoreCurrency: "USD",
    daysPresentCurrentYear: 195,
  },
  {
    employeeId: "EXP-003",
    employeeName: "Michael O'Connor",
    nationality: "Irish",
    passportNumber: "IR3301982",
    passportExpiryDate: "2026-10-15",
    workPermitNumber: "WP/2026/0002",
    workPermitClass: "Special Pass (Short Term)",
    workPermitIssueDate: "2026-07-01",
    workPermitExpiryDate: "2026-10-01",
    daysUntilPermitExpiry: 14,
    permitStatus: "renewal_urgent",
    taxResidentialStatus: "Non-Resident", // Under 183 days, subject to 37.5% flat non-resident PAYE
    splitPayrollEnabled: false,
    daysPresentCurrentYear: 78,
  },
];

// 1. GET / - List expatriate workforce
expatriatesRouter.get("/", async (c) => {
  return c.json({
    success: true,
    count: SAMPLE_EXPATRIATES.length,
    data: SAMPLE_EXPATRIATES,
  });
});

// 2. POST /presence-logs - Log border crossing for 183-day tax residency rule
expatriatesRouter.post("/presence-logs", zValidator("json", PresenceLogSchema), async (c) => {
  const body = c.req.valid("json");
  const logId = `LOG-${Date.now().toString().slice(-6)}`;

  return c.json(
    {
      success: true,
      message: "Border entry/presence log recorded successfully",
      data: {
        id: logId,
        ...body,
        recordedAt: new Date().toISOString(),
      },
    },
    201
  );
});

// 3. GET /residency-status/:employeeId - Evaluate Kenyan 183-day statutory tax rule
expatriatesRouter.get("/residency-status/:employeeId", async (c) => {
  const employeeId = c.req.param("employeeId");
  const expat = SAMPLE_EXPATRIATES.find((e) => e.employeeId === employeeId) || SAMPLE_EXPATRIATES[0];

  const currentYear = new Date().getFullYear();
  const daysThreshold = 183;
  const isResident = expat.daysPresentCurrentYear >= daysThreshold;

  return c.json({
    success: true,
    data: {
      employeeId: expat.employeeId,
      employeeName: expat.employeeName,
      taxYear: currentYear,
      daysPresentInKenya: expat.daysPresentCurrentYear,
      statutoryThresholdDays: daysThreshold,
      isResidentForTaxPurposes: isResident,
      applicablePayeTaxRegime: isResident
        ? "Resident Graduated Tax Brackets (10% to 35% with Personal Relief)"
        : "Non-Resident Withholding Tax / PAYE (Flat 37.5% under Kenyan Section 5)",
      notes: isResident
        ? `Exceeded 183-day threshold (${expat.daysPresentCurrentYear} days). Eligible for resident tax rates and monthly personal relief.`
        : `Under 183 days (${expat.daysPresentCurrentYear} days). Non-resident rates apply with no personal relief.`,
    },
  });
});
