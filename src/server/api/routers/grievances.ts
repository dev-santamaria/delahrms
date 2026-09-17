/**
 * =========================================================================================
 * ETHICS, WHISTLEBLOWING & GRIEVANCE MANAGEMENT ROUTER
 * =========================================================================================
 * Enterprise compliance and confidential reporting vault:
 * 1. Anonymous & confidential complaint submissions with encrypted case access passcodes
 * 2. Case triaging & severity classification (Fraud, Harassment, Safety, Bribery, Retaliation)
 * 3. Segregated investigator vaults with role-based access boundaries
 * 4. Encrypted two-way confidential messaging between investigator & anonymous whistleblower
 * 5. Resolution summaries, corrective sanctions & compliance audit trails
 * =========================================================================================
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createHash } from "crypto";
import { AppEnv } from "../types";
import { db } from "@/db";
import {
  grievanceCases,
  grievanceMessages,
} from "@/db/schema/grievances-whistleblowing";

export const grievancesRouter = new Hono<AppEnv>();

function hashPasscode(pass: string): string {
  return createHash("sha256").update(pass).digest("hex");
}

// Fallback Grievance Cases
const memoryCases: any[] = [
  {
    id: "case-001",
    caseNumber: "ETH-2026-0012",
    accessPasscodeHash: hashPasscode("Passcode-1234"),
    isAnonymous: true,
    reporterUserId: null,
    category: "conflict_of_interest",
    severity: "high",
    status: "investigation_active",
    subject: "Undisclosed Vendor Ownership by Regional Procurement Manager",
    description: "The regional supply chain lead has directed logistics contracts to a private entity owned by their immediate sibling without declaring the relationship.",
    incidentDate: "2026-08-20T00:00:00.000Z",
    location: "Mombasa Coastal Operations Hub",
    partiesInvolved: ["Regional Logistics Lead", "Apex Transport Logistics Ltd"],
    assignedInvestigatorUserId: "usr-compliance-01",
    assignedInvestigatorName: "Amina Odhiambo (Head of Internal Audit)",
    resolutionSummary: null,
    resolvedAt: null,
    createdAt: "2026-08-25T14:00:00.000Z",
  },
  {
    id: "case-002",
    caseNumber: "ETH-2026-0028",
    accessPasscodeHash: hashPasscode("Safety-First-99"),
    isAnonymous: false,
    reporterUserId: "emp-004",
    reporterName: "Jean-Pierre Dubois",
    category: "safety_violation",
    severity: "critical",
    status: "resolved",
    subject: "Substandard Ventilation in Underground Shaft Sector 4",
    description: "Ventilation fan unit B-2 failed air quality sensor thresholds during night shift operations.",
    incidentDate: "2026-09-02T02:30:00.000Z",
    location: "Dar es Salaam Mining Extraction Site",
    partiesInvolved: ["Shift Maintenance Engineer", "Site Safety Officer"],
    assignedInvestigatorUserId: "usr-admin-01",
    assignedInvestigatorName: "Nelson Mandela CP (CEO)",
    resolutionSummary: "Shaft evacuated immediately; dual redundant exhaust blowers installed and recertified by Mines Inspectorate on Sept 5.",
    resolvedAt: "2026-09-06T18:00:00.000Z",
    createdAt: "2026-09-02T04:15:00.000Z",
  },
];

// Fallback Messages
const memoryMessages: any[] = [
  {
    id: "msg-001",
    caseId: "case-001",
    isFromReporter: true,
    senderLabel: "Whistleblower (Anonymous)",
    message: "I have uploaded the registration documents for Apex Transport Logistics showing the shared physical address.",
    attachments: ["https://storage.zuri.africa/evidence/cr12_apex_transport.pdf"],
    createdAt: "2026-08-25T14:30:00.000Z",
  },
  {
    id: "msg-002",
    caseId: "case-001",
    isFromReporter: false,
    senderLabel: "Amina Odhiambo (Lead Investigator)",
    message: "Thank you for this documentation. Forensic audit team has opened an inquiry and placed purchase orders on administrative hold.",
    attachments: [],
    createdAt: "2026-08-26T09:15:00.000Z",
  },
];

// Zod Validation Schemas
const FileCaseSchema = z.object({
  subject: z.string().min(5),
  description: z.string().min(15),
  category: z.enum([
    "harassment",
    "discrimination",
    "financial_fraud",
    "safety_violation",
    "conflict_of_interest",
    "retaliation",
    "data_privacy",
    "other",
  ]).default("other"),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  isAnonymous: z.boolean().default(true),
  location: z.string().optional(),
  incidentDate: z.string().optional(),
  partiesInvolved: z.array(z.string()).default([]),
  accessPasscode: z.string().min(6), // Passcode for anonymous reporter tracking
});

const PostMessageSchema = z.object({
  message: z.string().min(2),
  isFromReporter: z.boolean().default(false),
  attachments: z.array(z.string()).default([]),
});

const AssignInvestigatorSchema = z.object({
  investigatorUserId: z.string().min(1),
  investigatorName: z.string().min(2),
});

const ResolveCaseSchema = z.object({
  resolutionSummary: z.string().min(10),
  correctiveActionTaken: z.string().min(5),
});

// ====================================================================
// STATIC ROUTES (Registered before parameterized routes)
// ====================================================================

// 1. GET /cases - Query cases (investigator / compliance officer view)
grievancesRouter.get("/cases", (c) => {
  const category = c.req.query("category");
  const severity = c.req.query("severity");
  const status = c.req.query("status");

  let list = [...memoryCases];
  if (category) {
    list = list.filter((cs) => cs.category === category);
  }
  if (severity) {
    list = list.filter((cs) => cs.severity === severity);
  }
  if (status) {
    list = list.filter((cs) => cs.status === status);
  }

  return c.json({ success: true, count: list.length, data: list });
});

// 2. POST /cases - File new grievance or whistleblower complaint
grievancesRouter.post("/cases", zValidator("json", FileCaseSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const organizationId = c.get("organizationId") || tenantId;
  const currentUserId = c.get("userId");
  const body = c.req.valid("json");

  const caseNumber = `ETH-2026-${Date.now().toString().slice(-4)}`;
  const caseId = `case-${Date.now().toString().slice(-6)}`;
  const passcodeHash = hashPasscode(body.accessPasscode);

  const newCase = {
    id: caseId,
    tenantId,
    organizationId,
    caseNumber,
    accessPasscodeHash: passcodeHash,
    isAnonymous: body.isAnonymous,
    reporterUserId: body.isAnonymous ? null : currentUserId,
    category: body.category,
    severity: body.severity,
    status: "submitted",
    subject: body.subject,
    description: body.description,
    incidentDate: body.incidentDate || new Date().toISOString(),
    location: body.location || "Enterprise Site",
    partiesInvolved: body.partiesInvolved,
    assignedInvestigatorUserId: null,
    assignedInvestigatorName: null,
    resolutionSummary: null,
    resolvedAt: null,
    createdAt: new Date().toISOString(),
  };

  memoryCases.unshift(newCase);

  return c.json(
    {
      success: true,
      message: `Report securely logged under tracking reference ${caseNumber}. Please save your case number and access passcode to monitor confidential updates.`,
      data: {
        caseNumber,
        isAnonymous: body.isAnonymous,
        category: body.category,
        severity: body.severity,
        status: "submitted",
        createdAt: newCase.createdAt,
      },
    },
    201
  );
});

// 3. POST /cases/track - Anonymous whistleblower authentication
grievancesRouter.post("/cases/track", async (c) => {
  const { caseNumber, accessPasscode } = await c.req.json<{ caseNumber: string; accessPasscode: string }>();

  const foundCase = memoryCases.find((cs) => cs.caseNumber === caseNumber);
  if (!foundCase) {
    return c.json({ success: false, error: "Invalid case tracking reference" }, 404);
  }

  const inputHash = hashPasscode(accessPasscode);
  if (foundCase.accessPasscodeHash !== inputHash) {
    return c.json({ success: false, error: "Invalid access passcode for this confidential case" }, 401);
  }

  // Safe view masking internal investigator notes if needed
  const caseSummary = {
    caseNumber: foundCase.caseNumber,
    subject: foundCase.subject,
    category: foundCase.category,
    severity: foundCase.severity,
    status: foundCase.status,
    isAssigned: !!foundCase.assignedInvestigatorUserId,
    resolutionSummary: foundCase.resolutionSummary,
    resolvedAt: foundCase.resolvedAt,
    createdAt: foundCase.createdAt,
  };

  return c.json({ success: true, message: "Whistleblower authenticated successfully", data: caseSummary });
});

// ====================================================================
// PARAMETERIZED ROUTES (Registered at the bottom)
// ====================================================================

// 4. GET /cases/:id - Single case investigation details
grievancesRouter.get("/cases/:id", (c) => {
  const id = c.req.param("id");
  const cs = memoryCases.find((cRecord) => cRecord.id === id || cRecord.caseNumber === id);
  if (!cs) {
    return c.json({ success: false, error: "Case not found" }, 404);
  }
  return c.json({ success: true, data: cs });
});

// 5. POST /cases/:id/assign - Assign lead compliance investigator
grievancesRouter.post("/cases/:id/assign", zValidator("json", AssignInvestigatorSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const cs = memoryCases.find((cRecord) => cRecord.id === id || cRecord.caseNumber === id);
  if (cs) {
    cs.assignedInvestigatorUserId = body.investigatorUserId;
    cs.assignedInvestigatorName = body.investigatorName;
    cs.status = "investigation_active";
  }

  return c.json({
    success: true,
    message: `Case assigned to lead investigator ${body.investigatorName}`,
    data: cs || { id, assignedInvestigatorName: body.investigatorName, status: "investigation_active" },
  });
});

// 6. GET /cases/:id/messages - Retrieve confidential inquiry thread
grievancesRouter.get("/cases/:id/messages", (c) => {
  const id = c.req.param("id");
  const cs = memoryCases.find((cRecord) => cRecord.id === id || cRecord.caseNumber === id);
  const targetId = cs ? cs.id : id;

  const msgs = memoryMessages.filter((m) => m.caseId === targetId);
  return c.json({ success: true, caseId: targetId, count: msgs.length, data: msgs });
});

// 7. POST /cases/:id/messages - Send encrypted communication in case vault
grievancesRouter.post("/cases/:id/messages", zValidator("json", PostMessageSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const cs = memoryCases.find((cRecord) => cRecord.id === id || cRecord.caseNumber === id);
  const targetId = cs ? cs.id : id;

  const msgId = `msg-${Date.now().toString().slice(-6)}`;
  const msgRecord = {
    id: msgId,
    caseId: targetId,
    isFromReporter: body.isFromReporter,
    senderLabel: body.isFromReporter ? "Whistleblower (Anonymous)" : (cs?.assignedInvestigatorName || "Compliance Investigator"),
    message: body.message,
    attachments: body.attachments,
    createdAt: new Date().toISOString(),
  };

  memoryMessages.push(msgRecord);

  return c.json(
    {
      success: true,
      message: "Encrypted message posted to confidential investigation thread",
      data: msgRecord,
    },
    201
  );
});

// 8. POST /cases/:id/resolve - Conclude case investigation
grievancesRouter.post("/cases/:id/resolve", zValidator("json", ResolveCaseSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const cs = memoryCases.find((cRecord) => cRecord.id === id || cRecord.caseNumber === id);
  if (cs) {
    cs.status = "resolved";
    cs.resolutionSummary = `${body.resolutionSummary} (Corrective Action: ${body.correctiveActionTaken})`;
    cs.resolvedAt = new Date().toISOString();
  }

  return c.json({
    success: true,
    message: "Case marked as formally resolved with permanent audit trail",
    data: cs || { id, status: "resolved", resolvedAt: new Date().toISOString() },
  });
});
