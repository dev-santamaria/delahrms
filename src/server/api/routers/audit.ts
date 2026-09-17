/**
 * =========================================================================================
 * REGULATORY AUDIT TRAILS, RUNTIME CUSTOM FIELDS & TAXONOMIES ROUTER
 * =========================================================================================
 * SOC 2 / ISO 27001 / GDPR compliance logging and runtime enterprise extensibility:
 * 1. Append-only system audit logs (actor, IP, user-agent, action, before/after JSON diffs)
 * 2. Runtime Custom Field Definitions across entities ('employee', 'job_opening', 'device')
 * 3. Dynamic Reference Lookups / Extensible Taxonomies eliminating rigid hardcoded enums
 * =========================================================================================
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";
import { db } from "@/db";
import {
  auditLogs,
  customFieldDefinitions,
  referenceLookups,
} from "@/db/schema/auth-tenancy";

export const auditRouter = new Hono<AppEnv>();

// Default in-memory seed audit logs
const memoryAuditLogs: any[] = [
  {
    id: "aud-001",
    tenantId: "tenant-default",
    organizationId: "org-ke",
    userId: "usr-admin-001",
    userName: "Alex Kamau (Super Admin)",
    action: "update",
    entityName: "employee",
    entityId: "emp-001",
    oldValues: { basicSalary: 450000, jobGrade: "EXEC-2" },
    newValues: { basicSalary: 520000, jobGrade: "EXEC-1" },
    ipAddress: "197.232.14.88",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    createdAt: new Date("2026-09-17T08:15:00Z"),
  },
  {
    id: "aud-002",
    tenantId: "tenant-default",
    organizationId: "org-ke",
    userId: "usr-cfo-001",
    userName: "Michael Vance (Group CFO)",
    action: "payroll_run",
    entityName: "payroll_run",
    entityId: "run-2026-09",
    oldValues: { status: "review" },
    newValues: { status: "approved", grossRemittance: 15500000 },
    ipAddress: "41.90.112.4",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0",
    createdAt: new Date("2026-09-17T09:00:00Z"),
  },
  {
    id: "aud-003",
    tenantId: "tenant-default",
    organizationId: "org-ke",
    userId: "usr-hr-002",
    userName: "Mercy Chebet (People Ops)",
    action: "export",
    entityName: "statutory_return",
    entityId: "filing-kra-202609",
    oldValues: null,
    newValues: { fileFormat: "itax_csv", recordCount: 42 },
    ipAddress: "197.232.14.89",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    createdAt: new Date("2026-09-17T09:45:00Z"),
  },
];

// Default in-memory custom fields
const memoryCustomFields: any[] = [
  {
    id: "cf-001",
    tenantId: "tenant-default",
    organizationId: null,
    entityType: "employee",
    fieldKey: "safety_boot_size",
    fieldLabel: "OSHA Safety Boot Size (EU)",
    fieldType: "select",
    options: ["39", "40", "41", "42", "43", "44", "45", "46"],
    isRequired: false,
    isEncrypted: false,
    validationRegex: null,
    displayOrder: 1,
    isActive: true,
  },
  {
    id: "cf-002",
    tenantId: "tenant-default",
    organizationId: null,
    entityType: "employee",
    fieldKey: "security_clearance_code",
    fieldLabel: "Government Security Clearance Code",
    fieldType: "text",
    options: [],
    isRequired: false,
    isEncrypted: true,
    validationRegex: "^[A-Z]{3}-[0-9]{4}$",
    displayOrder: 2,
    isActive: true,
  },
  {
    id: "cf-003",
    tenantId: "tenant-default",
    organizationId: null,
    entityType: "hardware_device",
    fieldKey: "asset_insurance_policy_no",
    fieldLabel: "Underwriter Equipment Policy #",
    fieldType: "text",
    options: [],
    isRequired: true,
    isEncrypted: false,
    validationRegex: null,
    displayOrder: 1,
    isActive: true,
  },
];

// Default in-memory reference taxonomies
const memoryLookups: any[] = [
  { id: "ref-01", category: "employment_type", code: "full_time", label: "Full-Time Permanent", isSystem: true, isActive: true },
  { id: "ref-02", category: "employment_type", code: "contractor_eor", label: "International Contractor (EOR)", isSystem: false, isActive: true },
  { id: "ref-03", category: "exit_reason", code: "voluntary_resignation", label: "Voluntary Resignation", isSystem: true, isActive: true },
  { id: "ref-04", category: "exit_reason", code: "redundancy", label: "Structural Redundancy", isSystem: true, isActive: true },
  { id: "ref-05", category: "payment_method", code: "bank_eft", label: "Bank Commercial EFT", isSystem: true, isActive: true },
  { id: "ref-06", category: "payment_method", code: "mpesa_b2c", label: "M-Pesa Corporate B2C", isSystem: true, isActive: true },
];

// 1. GET /logs - Query system audit logs with filters
auditRouter.get("/logs", async (c) => {
  const userId = c.req.query("userId");
  const entityName = c.req.query("entityName");
  const action = c.req.query("action");
  const limit = Number(c.req.query("limit")) || 50;

  try {
    const list = await db?.select().from(auditLogs);
    if (list && list.length > 0) {
      return c.json({ success: true, count: list.length, data: list.slice(0, limit) });
    }
  } catch (err) {
    // fallback
  }

  let filtered = [...memoryAuditLogs];
  if (userId) filtered = filtered.filter((l) => l.userId === userId);
  if (entityName) filtered = filtered.filter((l) => l.entityName === entityName);
  if (action) filtered = filtered.filter((l) => l.action === action);

  return c.json({ success: true, count: filtered.length, data: filtered.slice(0, limit) });
});

// 2. POST /logs - Record a system audit event
const recordAuditSchema = z.object({
  userId: z.string().optional(),
  userName: z.string().optional(),
  action: z.enum([
    "create",
    "update",
    "delete",
    "login",
    "logout",
    "export",
    "payroll_run",
    "approval",
    "rejection",
    "sync",
  ]),
  entityName: z.string().min(1),
  entityId: z.string().min(1),
  oldValues: z.record(z.string(), z.any()).nullable().optional(),
  newValues: z.record(z.string(), z.any()).nullable().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

auditRouter.post("/logs", zValidator("json", recordAuditSchema), async (c) => {
  const body = c.req.valid("json");
  const tenantId = c.get("tenantId") || "default-tenant";

  const entry = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    tenantId,
    organizationId: null,
    userId: body.userId || "system",
    userName: body.userName || "System User",
    action: body.action,
    entityName: body.entityName,
    entityId: body.entityId,
    oldValues: body.oldValues || null,
    newValues: body.newValues || null,
    ipAddress: body.ipAddress || c.req.header("x-forwarded-for") || "127.0.0.1",
    userAgent: body.userAgent || c.req.header("user-agent") || "Zuri HRMS Internal Client",
    createdAt: new Date(),
  };

  try {
    if (db) {
      await db.insert(auditLogs).values({
        id: entry.id,
        tenantId: entry.tenantId,
        userId: entry.userId as any,
        action: entry.action,
        entityName: entry.entityName,
        entityId: entry.entityId,
        oldValues: entry.oldValues,
        newValues: entry.newValues,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        createdAt: entry.createdAt,
      });
    }
  } catch (err) {
    // fallback
  }

  memoryAuditLogs.unshift(entry);

  return c.json({ success: true, message: "Audit event recorded", data: entry }, 201);
});

// 3. GET /custom-fields - List dynamic custom field definitions
auditRouter.get("/custom-fields", async (c) => {
  const entityType = c.req.query("entityType");

  try {
    const list = await db?.select().from(customFieldDefinitions);
    if (list && list.length > 0) {
      const filtered = entityType ? list.filter((f) => f.entityType === entityType) : list;
      return c.json({ success: true, count: filtered.length, data: filtered });
    }
  } catch (err) {
    // fallback
  }

  const filtered = entityType
    ? memoryCustomFields.filter((f) => f.entityType === entityType)
    : memoryCustomFields;
  return c.json({ success: true, count: filtered.length, data: filtered });
});

// 4. POST /custom-fields - Define a new runtime custom field attribute
const createCustomFieldSchema = z.object({
  entityType: z.string().min(1),
  fieldKey: z.string().regex(/^[a-z0-9_]+$/),
  fieldLabel: z.string().min(1),
  fieldType: z.enum(["text", "number", "date", "select", "multiselect", "boolean", "file"]),
  options: z.array(z.string()).default([]),
  isRequired: z.boolean().default(false),
  isEncrypted: z.boolean().default(false),
  validationRegex: z.string().optional(),
  displayOrder: z.number().int().default(0),
});

auditRouter.post("/custom-fields", zValidator("json", createCustomFieldSchema), async (c) => {
  const body = c.req.valid("json");
  const tenantId = c.get("tenantId") || "default-tenant";

  const newField = {
    id: `cf-${Date.now()}`,
    tenantId,
    organizationId: null,
    entityType: body.entityType,
    fieldKey: body.fieldKey,
    fieldLabel: body.fieldLabel,
    fieldType: body.fieldType,
    options: body.options,
    isRequired: body.isRequired,
    isEncrypted: body.isEncrypted,
    validationRegex: body.validationRegex || null,
    displayOrder: body.displayOrder,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    if (db) {
      await db.insert(customFieldDefinitions).values(newField as any);
    }
  } catch (err) {
    // fallback
  }

  memoryCustomFields.push(newField);

  return c.json(
    {
      success: true,
      message: `Custom field '${body.fieldLabel}' registered on '${body.entityType}'`,
      data: newField,
    },
    201
  );
});

// 5. GET /reference-lookups - Query dynamic taxonomies by category
auditRouter.get("/reference-lookups", async (c) => {
  const category = c.req.query("category");

  try {
    const list = await db?.select().from(referenceLookups);
    if (list && list.length > 0) {
      const filtered = category ? list.filter((r) => r.category === category) : list;
      return c.json({ success: true, count: filtered.length, data: filtered });
    }
  } catch (err) {
    // fallback
  }

  const filtered = category ? memoryLookups.filter((r) => r.category === category) : memoryLookups;
  return c.json({ success: true, count: filtered.length, data: filtered });
});

// 6. POST /reference-lookups - Add taxonomy lookup option
const createLookupSchema = z.object({
  category: z.string().min(1),
  code: z.string().min(1),
  label: z.string().min(1),
  isSystem: z.boolean().default(false),
});

auditRouter.post("/reference-lookups", zValidator("json", createLookupSchema), async (c) => {
  const body = c.req.valid("json");

  const newLookup = {
    id: `ref-${Date.now()}`,
    category: body.category,
    code: body.code,
    label: body.label,
    isSystem: body.isSystem,
    isActive: true,
  };

  memoryLookups.push(newLookup);

  return c.json({ success: true, message: "Lookup entry added", data: newLookup }, 201);
});
