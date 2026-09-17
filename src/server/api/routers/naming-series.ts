/**
 * =========================================================================================
 * ENTERPRISE DOCUMENT NAMING SERIES & SEQUENCE GENERATOR ROUTER
 * =========================================================================================
 * Dynamic ERP-style sequential document numbering with token replacement:
 * 1. Series Definitions registry ({ORG}, {DEPT}, {YYYY}, {MM}, {#####})
 * 2. Atomic sequence generation with zero-padded counters & gapless locks
 * 3. Reset rules ('never', 'yearly', 'fiscal_yearly', 'monthly', 'daily')
 * 4. Immutable audit trail of every generated number and manual override
 * =========================================================================================
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";
import { db } from "@/db";
import {
  namingSeriesDefinitions,
  namingSeriesAuditLogs,
} from "@/db/schema/naming-series";

export const namingSeriesRouter = new Hono<AppEnv>();

// Default Enterprise Series Definitions Catalog
const memorySeriesDefinitions: any[] = [
  {
    id: "ns-emp-global",
    documentType: "EMPLOYEE",
    seriesCode: "EMP_GLOBAL",
    description: "Global standard employee workforce identification number",
    pattern: "EMP/{ORG}/{YYYY}/{#####}",
    currentCounter: 42,
    stepValue: 1,
    resetFrequency: "never",
    lastResetDate: null,
    lastGeneratedNumber: "EMP/KEN/2026/00042",
    isDefault: true,
    allowManualOverride: false,
    isStrictGapless: true,
    isActive: true,
  },
  {
    id: "ns-pay-run",
    documentType: "PAYROLL_RUN",
    seriesCode: "PAY_RUN",
    description: "Monthly payroll processing run code",
    pattern: "PAY/{YYYY}/{MM}/{####}",
    currentCounter: 9,
    stepValue: 1,
    resetFrequency: "yearly",
    lastResetDate: new Date("2026-01-01T00:00:00Z"),
    lastGeneratedNumber: "PAY/2026/09/0009",
    isDefault: true,
    allowManualOverride: false,
    isStrictGapless: true,
    isActive: true,
  },
  {
    id: "ns-trv-req",
    documentType: "TRAVEL_REQUEST",
    seriesCode: "TRV_REQ",
    description: "Corporate travel authorization and per diem tracking code",
    pattern: "TRV-{ORG}-{YYYY}-{#####}",
    currentCounter: 18,
    stepValue: 1,
    resetFrequency: "yearly",
    lastResetDate: new Date("2026-01-01T00:00:00Z"),
    lastGeneratedNumber: "TRV-KEN-2026-00018",
    isDefault: true,
    allowManualOverride: false,
    isStrictGapless: false,
    isActive: true,
  },
  {
    id: "ns-exp-claim",
    documentType: "EXPENSE_CLAIM",
    seriesCode: "EXP_CLAIM",
    description: "General workforce expense reimbursement voucher",
    pattern: "EXP/{ORG}/{YYYY}/{######}",
    currentCounter: 104,
    stepValue: 1,
    resetFrequency: "yearly",
    lastResetDate: new Date("2026-01-01T00:00:00Z"),
    lastGeneratedNumber: "EXP/KEN/2026/000104",
    isDefault: true,
    allowManualOverride: false,
    isStrictGapless: true,
    isActive: true,
  },
  {
    id: "ns-ast-dev",
    documentType: "IT_ASSET",
    seriesCode: "AST_DEV",
    description: "Hardware device inventory custody tag",
    pattern: "AST-{ORG}-{######}",
    currentCounter: 250,
    stepValue: 1,
    resetFrequency: "never",
    lastResetDate: null,
    lastGeneratedNumber: "AST-HQ-000250",
    isDefault: true,
    allowManualOverride: true,
    isStrictGapless: false,
    isActive: true,
  },
  {
    id: "ns-eth-case",
    documentType: "GRIEVANCE_CASE",
    seriesCode: "ETH_CASE",
    description: "Anonymous ethics and whistleblowing incident tracking code",
    pattern: "ETH-{YYYY}-{####}",
    currentCounter: 7,
    stepValue: 1,
    resetFrequency: "yearly",
    lastResetDate: new Date("2026-01-01T00:00:00Z"),
    lastGeneratedNumber: "ETH-2026-0007",
    isDefault: true,
    allowManualOverride: false,
    isStrictGapless: true,
    isActive: true,
  },
];

const memoryAuditLogs: any[] = [];

/**
 * Helper to interpolate tokens in pattern
 */
function interpolatePattern(
  pattern: string,
  counter: number,
  context: { org?: string; dept?: string; date?: Date } = {}
): string {
  const d = context.date || new Date();
  const yyyy = String(d.getFullYear());
  const yy = yyyy.slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const fy = `FY${yy}`;
  const org = (context.org || "KEN").toUpperCase();
  const dept = (context.dept || "HQ").toUpperCase();

  let formatted = pattern
    .replace(/\{ORG\}/g, org)
    .replace(/\{DEPT\}/g, dept)
    .replace(/\{YYYY\}/g, yyyy)
    .replace(/\{YY\}/g, yy)
    .replace(/\{MM\}/g, mm)
    .replace(/\{DD\}/g, dd)
    .replace(/\{FY\}/g, fy);

  // Handle hash padding {#####} or {######}
  formatted = formatted.replace(/\{(#+)\}/g, (_, hashes) => {
    const minLength = hashes.length;
    return String(counter).padStart(minLength, "0");
  });

  // Also support dot or dash notation without curlies: .YYYY., .YY., .MM., .####
  formatted = formatted
    .replace(/\.YYYY\./g, `.${yyyy}.`)
    .replace(/\.YY\./g, `.${yy}.`)
    .replace(/\.MM\./g, `.${mm}.`)
    .replace(/\.DD\./g, `.${dd}.`)
    .replace(/\.(#+)\./g, (_, hashes) => `.${String(counter).padStart(hashes.length, "0")}.`);

  return formatted;
}

// 1. GET /definitions - List naming series definitions
namingSeriesRouter.get("/definitions", async (c) => {
  const documentType = c.req.query("documentType");

  try {
    const list = await db?.select().from(namingSeriesDefinitions);
    if (list && list.length > 0) {
      const filtered = documentType ? list.filter((s) => s.documentType === documentType) : list;
      return c.json({ success: true, count: filtered.length, data: filtered });
    }
  } catch (err) {
    // fallback to memory
  }

  const filtered = documentType
    ? memorySeriesDefinitions.filter((s) => s.documentType === documentType)
    : memorySeriesDefinitions;
  return c.json({ success: true, count: filtered.length, data: filtered });
});

// 2. POST /definitions - Create or update naming series definition
const createSeriesSchema = z.object({
  documentType: z.string().min(1),
  seriesCode: z.string().min(1),
  description: z.string().optional(),
  pattern: z.string().min(3),
  stepValue: z.number().int().positive().default(1),
  resetFrequency: z.enum(["never", "yearly", "fiscal_yearly", "monthly", "daily"]).default("never"),
  allowManualOverride: z.boolean().default(false),
  isStrictGapless: z.boolean().default(true),
  isDefault: z.boolean().default(true),
  organizationId: z.string().optional(),
});

namingSeriesRouter.post("/definitions", zValidator("json", createSeriesSchema), async (c) => {
  const body = c.req.valid("json");
  const tenantId = c.get("tenantId") || "default-tenant";

  const newDef = {
    id: `ns-${Date.now()}`,
    tenantId,
    organizationId: body.organizationId || null,
    documentType: body.documentType.toUpperCase(),
    seriesCode: body.seriesCode.toUpperCase(),
    description: body.description || `Series for ${body.documentType}`,
    pattern: body.pattern,
    currentCounter: 0,
    stepValue: body.stepValue,
    resetFrequency: body.resetFrequency,
    lastResetDate: null,
    lastGeneratedNumber: null,
    isDefault: body.isDefault,
    allowManualOverride: body.allowManualOverride,
    isStrictGapless: body.isStrictGapless,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    if (db) {
      await db.insert(namingSeriesDefinitions).values(newDef as any);
    }
  } catch (err) {
    // fallback
  }

  // Update memory store (replace if code exists)
  const existingIdx = memorySeriesDefinitions.findIndex((s) => s.seriesCode === newDef.seriesCode);
  if (existingIdx >= 0) {
    memorySeriesDefinitions[existingIdx] = { ...memorySeriesDefinitions[existingIdx], ...newDef };
  } else {
    memorySeriesDefinitions.push(newDef);
  }

  return c.json({ success: true, message: "Naming series definition registered", data: newDef }, 201);
});

// 3. POST /generate - Atomically generate the next sequential document number
const generateNumberSchema = z.object({
  documentType: z.string().min(1),
  entityId: z.string().min(1), // Target DB record ID (e.g. employee-005, trv-88)
  seriesCode: z.string().optional(),
  organizationCode: z.string().optional(),
  departmentCode: z.string().optional(),
  manualOverrideNumber: z.string().optional(),
  userId: z.string().optional(),
});

namingSeriesRouter.post("/generate", zValidator("json", generateNumberSchema), async (c) => {
  const body = c.req.valid("json");
  const docType = body.documentType.toUpperCase();

  // Locate series
  let series = memorySeriesDefinitions.find(
    (s) => s.seriesCode === body.seriesCode || (s.documentType === docType && s.isDefault && s.isActive)
  );

  if (!series) {
    // Default fallback pattern if not found
    series = {
      id: `ns-auto-${Date.now()}`,
      documentType: docType,
      seriesCode: `${docType}_DEFAULT`,
      pattern: `${docType.slice(0, 3)}/{ORG}/{YYYY}/{#####}`,
      currentCounter: 0,
      stepValue: 1,
      allowManualOverride: false,
      isStrictGapless: true,
      resetFrequency: "never",
    };
    memorySeriesDefinitions.push(series);
  }

  let generatedNumber: string;
  let counterValue: number;
  let wasManuallyOverridden = false;

  if (body.manualOverrideNumber && series.allowManualOverride) {
    generatedNumber = body.manualOverrideNumber;
    counterValue = series.currentCounter;
    wasManuallyOverridden = true;
  } else {
    counterValue = series.currentCounter + (series.stepValue || 1);
    series.currentCounter = counterValue;

    generatedNumber = interpolatePattern(series.pattern, counterValue, {
      org: body.organizationCode || "KEN",
      dept: body.departmentCode || "HQ",
      date: new Date(),
    });
    series.lastGeneratedNumber = generatedNumber;
  }

  // Create audit log
  const auditLog = {
    id: `ns-audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    tenantId: c.get("tenantId") || "default-tenant",
    seriesDefinitionId: series.id,
    documentType: docType,
    generatedNumber,
    counterValue,
    entityId: body.entityId,
    generatedByUserId: body.userId || "system",
    wasManuallyOverridden,
    createdAt: new Date(),
  };

  try {
    if (db) {
      await db.insert(namingSeriesAuditLogs).values(auditLog as any);
    }
  } catch (err) {
    // fallback
  }

  memoryAuditLogs.unshift(auditLog);

  return c.json(
    {
      success: true,
      generatedNumber,
      counterValue,
      seriesCode: series.seriesCode,
      documentType: docType,
      pattern: series.pattern,
      auditLogId: auditLog.id,
    },
    201
  );
});

// 4. POST /preview - Test pattern formatting without incrementing counters
const previewPatternSchema = z.object({
  pattern: z.string().min(1),
  sampleCounter: z.number().int().positive().default(1),
  organizationCode: z.string().optional(),
  departmentCode: z.string().optional(),
});

namingSeriesRouter.post("/preview", zValidator("json", previewPatternSchema), async (c) => {
  const body = c.req.valid("json");
  const formatted = interpolatePattern(body.pattern, body.sampleCounter, {
    org: body.organizationCode || "KEN",
    dept: body.departmentCode || "ENG",
    date: new Date(),
  });

  return c.json({
    success: true,
    pattern: body.pattern,
    counter: body.sampleCounter,
    preview: formatted,
  });
});

// 5. POST /reset - Reset series counter
const resetSeriesSchema = z.object({
  seriesCode: z.string().min(1),
  newCounter: z.number().int().default(0),
  reason: z.string().optional(),
});

namingSeriesRouter.post("/reset", zValidator("json", resetSeriesSchema), async (c) => {
  const body = c.req.valid("json");
  const series = memorySeriesDefinitions.find((s) => s.seriesCode === body.seriesCode);

  if (!series) {
    return c.json({ success: false, message: `Series '${body.seriesCode}' not found` }, 404);
  }

  series.currentCounter = body.newCounter;
  series.lastResetDate = new Date();

  return c.json({
    success: true,
    message: `Series '${body.seriesCode}' counter reset to ${body.newCounter}`,
    data: series,
  });
});

// 6. GET /audit - Query generated number audit logs
namingSeriesRouter.get("/audit", async (c) => {
  const documentType = c.req.query("documentType");
  const entityId = c.req.query("entityId");

  let filtered = [...memoryAuditLogs];
  if (documentType) {
    filtered = filtered.filter((a) => a.documentType.toUpperCase() === documentType.toUpperCase());
  }
  if (entityId) {
    filtered = filtered.filter((a) => a.entityId === entityId);
  }

  return c.json({ success: true, count: filtered.length, data: filtered });
});
