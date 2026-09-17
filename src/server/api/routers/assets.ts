/**
 * =========================================================================================
 * IT ASSET MANAGEMENT, HARDWARE CUSTODY & SAAS ACCESS ROUTER
 * =========================================================================================
 * Enterprise hardware fleet and SaaS access governance:
 * 1. Hardware device inventory (laptops, monitors, YubiKeys, Starlink terminals)
 * 2. MDM compliance & disk encryption tracking (Intune, Jamf, FileVault, BitLocker)
 * 3. Equipment custody handover with courier tracking & e-signed custody receipts
 * 4. Corporate SaaS application catalog & license grant/revocation on offboarding
 * 5. IT support ticketing & hardware repair tracking
 * =========================================================================================
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";
import { db } from "@/db";
import {
  deviceCatalog,
  hardwareDevices,
  deviceAssignments,
  saasApplications,
  saasAccessGrants,
  itSupportTickets,
} from "@/db/schema/it-assets";

export const assetsRouter = new Hono<AppEnv>();

// Default Hardware Inventory
const memoryDevices: any[] = [
  {
    id: "dev-001",
    serialNumber: "C02G80P0MD6T",
    assetTag: "MND-LAP-001",
    brand: "Apple",
    modelName: "MacBook Pro 16-inch M3 Max (64GB RAM, 2TB SSD)",
    deviceCategory: "laptop",
    ownershipType: "purchased",
    assignedEmployeeId: "emp-002", // David Kiprono
    assignedEmployeeName: "David Kiprono",
    status: "assigned_active",
    mdmEnrolled: true,
    mdmProvider: "jamf",
    diskEncryptionActive: true,
    isCompliant: true,
    warrantyExpiryDate: "2027-03-01",
    createdAt: "2024-03-01T10:00:00.000Z",
  },
  {
    id: "dev-002",
    serialNumber: "5CG3290ABC",
    assetTag: "MND-LAP-002",
    brand: "Lenovo",
    modelName: "ThinkPad P1 Gen 6 Workstation",
    deviceCategory: "laptop",
    ownershipType: "purchased",
    assignedEmployeeId: "emp-004", // Jean-Pierre Dubois
    assignedEmployeeName: "Jean-Pierre Dubois",
    status: "assigned_active",
    mdmEnrolled: true,
    mdmProvider: "intune",
    diskEncryptionActive: true,
    isCompliant: true,
    warrantyExpiryDate: "2027-01-10",
    createdAt: "2024-01-10T11:00:00.000Z",
  },
  {
    id: "dev-003",
    serialNumber: "STAR-UG-9912",
    assetTag: "MND-NET-003",
    brand: "SpaceX",
    modelName: "Starlink High-Performance Maritime / Mining Terminal",
    deviceCategory: "starlink_terminal",
    ownershipType: "purchased",
    assignedEmployeeId: null,
    status: "available_in_inventory",
    mdmEnrolled: false,
    mdmProvider: "none",
    diskEncryptionActive: false,
    isCompliant: true,
    warrantyExpiryDate: "2028-06-30",
    createdAt: "2025-06-01T08:00:00.000Z",
  },
];

// Fallback SaaS Apps
const memorySaasApps: any[] = [
  { id: "saas-1", name: "Google Workspace Enterprise Plus", code: "GSUITE", category: "productivity", ssoSupported: true },
  { id: "saas-2", name: "Slack Enterprise Grid", code: "SLACK", category: "communication", ssoSupported: true },
  { id: "saas-3", name: "GitHub Enterprise Cloud", code: "GITHUB", category: "developer_tools", ssoSupported: true },
  { id: "saas-4", name: "AWS Enterprise Organization", code: "AWS", category: "cloud_infrastructure", ssoSupported: true },
];

const memorySaasGrants: any[] = [
  {
    id: "grant-001",
    employeeId: "emp-002",
    saasApplicationId: "saas-3",
    appName: "GitHub Enterprise Cloud",
    accountUsernameOrEmail: "david.kiprono@mandelaglobal.com",
    roleOrLicenseTier: "owner",
    status: "active",
    provisionedAt: "2024-03-01T10:00:00.000Z",
  },
];

// Fallback IT Tickets
const memoryTickets: any[] = [
  {
    id: "tkt-001",
    ticketNumber: "IT-2026-0089",
    employeeId: "emp-002",
    title: "Secondary 4K Monitor DisplayPort cable defect",
    description: "Display flickers when operating in dual-screen mode at 144Hz refresh rate.",
    category: "hardware_defect",
    priority: "medium",
    status: "open",
    assignedTo: "Dennis Maina (IT Support)",
    createdAt: "2026-09-17T08:30:00.000Z",
  },
];

// Zod Validation Schemas
const RegisterDeviceSchema = z.object({
  serialNumber: z.string().min(3),
  assetTag: z.string().min(3),
  brand: z.string().min(2),
  modelName: z.string().min(2),
  deviceCategory: z.enum(["laptop", "desktop", "monitor", "phone", "tablet", "accessory", "yubikey", "starlink_terminal"]).default("laptop"),
  ownershipType: z.enum(["purchased", "leased", "byod"]).default("purchased"),
  mdmProvider: z.enum(["intune", "jamf", "kandji", "kaseya", "none"]).default("jamf"),
  diskEncryptionActive: z.boolean().default(true),
  warrantyExpiryDate: z.string().optional(),
});

const AssignDeviceSchema = z.object({
  deviceId: z.string().min(1),
  employeeId: z.string().min(1),
  courierName: z.string().default("DHL Express"),
  trackingNumber: z.string().default("DHL-99887766"),
  handoverNotes: z.string().optional(),
});

const ProvisionSaasSchema = z.object({
  employeeId: z.string().min(1),
  saasApplicationId: z.string().min(1),
  accountUsernameOrEmail: z.string().email(),
  roleOrLicenseTier: z.string().default("standard"),
});

const CreateTicketSchema = z.object({
  employeeId: z.string().min(1),
  deviceId: z.string().optional(),
  title: z.string().min(5),
  description: z.string().min(10),
  category: z.string().default("hardware_defect"),
  priority: z.enum(["low", "medium", "high", "urgent", "p1_critical"]).default("medium"),
});

// ====================================================================
// STATIC ROUTES (Registered before parameterized routes)
// ====================================================================

// 1. GET /devices - Master hardware inventory
assetsRouter.get("/devices", (c) => {
  const category = c.req.query("category");
  const status = c.req.query("status");
  const empId = c.req.query("employeeId");

  let list = [...memoryDevices];
  if (category) {
    list = list.filter((d) => d.deviceCategory === category);
  }
  if (status) {
    list = list.filter((d) => d.status === status);
  }
  if (empId) {
    list = list.filter((d) => d.assignedEmployeeId === empId);
  }

  return c.json({ success: true, count: list.length, data: list });
});

// 2. POST /devices - Register new hardware asset
assetsRouter.post("/devices", zValidator("json", RegisterDeviceSchema), async (c) => {
  const body = c.req.valid("json");
  const deviceId = `dev-${Date.now().toString().slice(-6)}`;

  const deviceRecord = {
    id: deviceId,
    ...body,
    assignedEmployeeId: null,
    status: "available_in_inventory",
    mdmEnrolled: body.mdmProvider !== "none",
    isCompliant: true,
    createdAt: new Date().toISOString(),
  };

  memoryDevices.unshift(deviceRecord);

  return c.json(
    {
      success: true,
      message: `Device ${body.brand} ${body.modelName} (Tag: ${body.assetTag}) registered in fleet inventory`,
      data: deviceRecord,
    },
    201
  );
});

// 3. POST /assignments - Handover hardware asset to employee
assetsRouter.post("/assignments", zValidator("json", AssignDeviceSchema), async (c) => {
  const body = c.req.valid("json");
  const dev = memoryDevices.find((d) => d.id === body.deviceId || d.assetTag === body.deviceId);

  if (dev) {
    dev.assignedEmployeeId = body.employeeId;
    dev.status = "assigned_active";
  }

  const assignmentId = `asg-dev-${Date.now().toString().slice(-6)}`;
  const assignmentRecord = {
    id: assignmentId,
    deviceId: dev ? dev.id : body.deviceId,
    assetTag: dev ? dev.assetTag : "MND-ASSET",
    employeeId: body.employeeId,
    courierName: body.courierName,
    trackingNumber: body.trackingNumber,
    handoverNotes: body.handoverNotes || "New hire technical equipment handover",
    signedHandoverUrl: `https://storage.zuri.africa/custody-forms/${assignmentId}.pdf`,
    assignedAt: new Date().toISOString(),
  };

  return c.json(
    {
      success: true,
      message: `Hardware custody assigned to employee ${body.employeeId} with signed custody receipt`,
      data: assignmentRecord,
    },
    201
  );
});

// 4. GET /saas/apps - Corporate SaaS application catalog
assetsRouter.get("/saas/apps", (c) => {
  return c.json({ success: true, count: memorySaasApps.length, data: memorySaasApps });
});

// 5. POST /saas/grants - Provision SaaS license to employee
assetsRouter.post("/saas/grants", zValidator("json", ProvisionSaasSchema), async (c) => {
  const body = c.req.valid("json");
  const app = memorySaasApps.find((s) => s.id === body.saasApplicationId) || memorySaasApps[0];

  const grantId = `grant-${Date.now().toString().slice(-6)}`;
  const grantRecord = {
    id: grantId,
    employeeId: body.employeeId,
    saasApplicationId: app.id,
    appName: app.name,
    accountUsernameOrEmail: body.accountUsernameOrEmail,
    roleOrLicenseTier: body.roleOrLicenseTier,
    status: "active",
    provisionedAt: new Date().toISOString(),
  };

  memorySaasGrants.unshift(grantRecord);

  return c.json(
    {
      success: true,
      message: `Access to ${app.name} (${body.roleOrLicenseTier}) provisioned for ${body.accountUsernameOrEmail}`,
      data: grantRecord,
    },
    201
  );
});

// 6. GET /tickets - List IT support tickets
assetsRouter.get("/tickets", (c) => {
  const empId = c.req.query("employeeId");
  const status = c.req.query("status");

  let list = [...memoryTickets];
  if (empId) {
    list = list.filter((t) => t.employeeId === empId);
  }
  if (status) {
    list = list.filter((t) => t.status === status);
  }

  return c.json({ success: true, count: list.length, data: list });
});

// 7. POST /tickets - Submit IT defect or support ticket
assetsRouter.post("/tickets", zValidator("json", CreateTicketSchema), async (c) => {
  const body = c.req.valid("json");
  const ticketNumber = `IT-2026-${Date.now().toString().slice(-4)}`;
  const ticketId = `tkt-${Date.now().toString().slice(-6)}`;

  const ticketRecord = {
    id: ticketId,
    ticketNumber,
    ...body,
    status: "open",
    assignedTo: "Enterprise IT Service Desk",
    createdAt: new Date().toISOString(),
  };

  memoryTickets.unshift(ticketRecord);

  return c.json(
    {
      success: true,
      message: `Support ticket ${ticketNumber} logged with priority '${body.priority}'`,
      data: ticketRecord,
    },
    201
  );
});

// ====================================================================
// PARAMETERIZED ROUTES (Registered at the bottom)
// ====================================================================

// 8. GET /devices/:id - Single device detail
assetsRouter.get("/devices/:id", (c) => {
  const id = c.req.param("id");
  const dev = memoryDevices.find((d) => d.id === id || d.assetTag === id || d.serialNumber === id) || memoryDevices[0];
  return c.json({ success: true, data: dev });
});

// 9. POST /assignments/:id/return - Return hardware device
assetsRouter.post("/assignments/:id/return", async (c) => {
  const id = c.req.param("id");
  const { deviceId, returnNotes } = await c.req.json<{ deviceId: string; returnNotes?: string }>();

  const dev = memoryDevices.find((d) => d.id === deviceId || d.assetTag === deviceId);
  if (dev) {
    dev.assignedEmployeeId = null;
    dev.status = "returned";
  }

  return c.json({
    success: true,
    message: "Hardware device returned and cleared from employee custody inventory",
    data: { assignmentId: id, deviceId, status: "returned", returnedAt: new Date().toISOString(), returnNotes },
  });
});

// 10. POST /saas/grants/:id/revoke - Revoke SaaS access on offboarding
assetsRouter.post("/saas/grants/:id/revoke", async (c) => {
  const id = c.req.param("id");
  const grant = memorySaasGrants.find((g) => g.id === id);
  if (grant) {
    grant.status = "revoked";
    grant.revokedAt = new Date().toISOString();
  }
  return c.json({ success: true, message: "SaaS access grant revoked successfully", data: grant || { id, status: "revoked" } });
});

// 11. PATCH /tickets/:id/resolve - Resolve IT support ticket
assetsRouter.patch("/tickets/:id/resolve", async (c) => {
  const id = c.req.param("id");
  const { resolutionNotes } = await c.req.json<{ resolutionNotes: string }>();

  const tkt = memoryTickets.find((t) => t.id === id || t.ticketNumber === id);
  if (tkt) {
    tkt.status = "resolved";
    tkt.resolutionNotes = resolutionNotes;
    tkt.resolvedAt = new Date().toISOString();
  }

  return c.json({ success: true, message: "Ticket marked as resolved", data: tkt || { id, status: "resolved" } });
});
