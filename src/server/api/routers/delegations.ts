/**
 * =========================================================================================
 * DELEGATION OF AUTHORITY (DoA) & OUT-OF-OFFICE PROXY ROUTER
 * =========================================================================================
 * Prevents operational bottlenecks by routing approvals to designated proxies:
 * 1. Time-bounded proxy delegation rules with scope limits
 * 2. Monetary approval thresholds (e.g. up to KES 500,000 / $5,000)
 * 3. Immediate revocation workflows
 * 4. Dual-identity audit logging (proxy actor vs principal)
 * =========================================================================================
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";
import { db } from "@/db";
import {
  delegationRules,
  delegationAuditLogs,
} from "@/db/schema/delegations";

export const delegationsRouter = new Hono<AppEnv>();

// Default in-memory seed records
const memoryDelegations: any[] = [
  {
    id: "del-rule-001",
    tenantId: "tenant-default",
    organizationId: null,
    delegatorUserId: "usr-mgr-001",
    delegatorName: "Sarah Jenkins (Engineering VP)",
    delegateeUserId: "usr-lead-002",
    delegateeName: "David Ochieng (Principal Architect)",
    scope: "leave_approvals",
    reason: "Attending AWS re:Invent in Las Vegas",
    maxMonetaryApprovalLimit: null,
    currency: "USD",
    startDate: new Date("2026-09-01T00:00:00Z"),
    endDate: new Date("2026-09-30T23:59:59Z"),
    status: "active",
    isRevoked: false,
    revokedAt: null,
    createdAt: new Date("2026-08-28T10:00:00Z"),
  },
  {
    id: "del-rule-002",
    tenantId: "tenant-default",
    organizationId: null,
    delegatorUserId: "usr-cfo-001",
    delegatorName: "Michael Vance (Group CFO)",
    delegateeUserId: "usr-ctrl-001",
    delegateeName: "Grace Wanjiku (Finance Controller)",
    scope: "expense_claims",
    reason: "Annual Board Retreat in Diani Beach",
    maxMonetaryApprovalLimit: "500000.00",
    currency: "KES",
    startDate: new Date("2026-09-10T00:00:00Z"),
    endDate: new Date("2026-09-25T23:59:59Z"),
    status: "active",
    isRevoked: false,
    revokedAt: null,
    createdAt: new Date("2026-09-05T14:30:00Z"),
  },
];

const memoryAuditLogs: any[] = [];

// 1. GET /rules - List delegation rules
delegationsRouter.get("/rules", async (c) => {
  const delegatorUserId = c.req.query("delegatorUserId");
  const delegateeUserId = c.req.query("delegateeUserId");
  const status = c.req.query("status");
  const now = new Date();

  // Refresh status based on dates
  memoryDelegations.forEach((d) => {
    if (!d.isRevoked) {
      if (now > new Date(d.endDate)) {
        d.status = "expired";
      } else if (now >= new Date(d.startDate)) {
        d.status = "active";
      } else {
        d.status = "scheduled";
      }
    }
  });

  try {
    const list = await db?.select().from(delegationRules);
    if (list && list.length > 0) {
      return c.json({ success: true, count: list.length, data: list });
    }
  } catch (err) {
    // fallback
  }

  let filtered = [...memoryDelegations];
  if (delegatorUserId) filtered = filtered.filter((d) => d.delegatorUserId === delegatorUserId);
  if (delegateeUserId) filtered = filtered.filter((d) => d.delegateeUserId === delegateeUserId);
  if (status) filtered = filtered.filter((d) => d.status === status);

  return c.json({ success: true, count: filtered.length, data: filtered });
});

// 2. POST /rules - Create delegation rule
const createRuleSchema = z.object({
  delegatorUserId: z.string().min(1),
  delegateeUserId: z.string().min(1),
  scope: z
    .enum([
      "all",
      "leave_approvals",
      "expense_claims",
      "timesheet_approvals",
      "payroll_runs",
      "job_requisitions",
      "travel_requests",
      "loan_applications",
    ])
    .default("all"),
  reason: z.string().optional(),
  maxMonetaryApprovalLimit: z.number().positive().optional(),
  currency: z.string().length(3).default("KES"),
  startDate: z.string(), // ISO string
  endDate: z.string(), // ISO string
  organizationId: z.string().optional(),
});

delegationsRouter.post("/rules", zValidator("json", createRuleSchema), async (c) => {
  const body = c.req.valid("json");
  const tenantId = c.get("tenantId") || "default-tenant";

  const start = new Date(body.startDate);
  const end = new Date(body.endDate);
  const now = new Date();

  if (start >= end) {
    return c.json({ success: false, message: "End date must be strictly after start date" }, 400);
  }

  let initialStatus: "active" | "scheduled" = "scheduled";
  if (now >= start && now <= end) {
    initialStatus = "active";
  }

  const newRule = {
    id: `del-rule-${Date.now()}`,
    tenantId,
    organizationId: body.organizationId || null,
    delegatorUserId: body.delegatorUserId,
    delegateeUserId: body.delegateeUserId,
    scope: body.scope,
    reason: body.reason || "Out of office / Leave",
    maxMonetaryApprovalLimit: body.maxMonetaryApprovalLimit ? String(body.maxMonetaryApprovalLimit) : null,
    currency: body.currency,
    startDate: start,
    endDate: end,
    status: initialStatus,
    isRevoked: false,
    revokedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    if (db) {
      await db.insert(delegationRules).values(newRule as any);
    }
  } catch (err) {
    // fallback
  }

  memoryDelegations.push(newRule);

  return c.json(
    {
      success: true,
      message: `Delegation proxy established for ${body.scope} (${initialStatus})`,
      data: newRule,
    },
    201
  );
});

// 3. POST /rules/:id/revoke - Revoke a delegation rule
delegationsRouter.post("/rules/:id/revoke", async (c) => {
  const id = c.req.param("id");
  const rule = memoryDelegations.find((d) => d.id === id);

  if (!rule) {
    return c.json({ success: false, message: "Delegation rule not found" }, 404);
  }

  rule.isRevoked = true;
  rule.revokedAt = new Date();
  rule.status = "revoked";

  return c.json({
    success: true,
    message: "Delegation proxy revoked immediately",
    data: rule,
  });
});

// 4. POST /verify - Check if an actor has valid proxy authority for a principal
const verifyProxySchema = z.object({
  actedByUserId: z.string().min(1),
  onBehalfOfUserId: z.string().min(1),
  scope: z.string().min(1),
  monetaryAmount: z.number().optional(),
});

delegationsRouter.post("/verify", zValidator("json", verifyProxySchema), async (c) => {
  const body = c.req.valid("json");
  const now = new Date();

  const matchingRule = memoryDelegations.find((d) => {
    if (d.delegateeUserId !== body.actedByUserId || d.delegatorUserId !== body.onBehalfOfUserId) {
      return false;
    }
    if (d.isRevoked || d.status === "revoked") return false;
    if (now < new Date(d.startDate) || now > new Date(d.endDate)) return false;

    // Check scope
    if (d.scope !== "all" && d.scope !== body.scope) return false;

    // Check financial limit
    if (d.maxMonetaryApprovalLimit && body.monetaryAmount) {
      if (body.monetaryAmount > Number(d.maxMonetaryApprovalLimit)) {
        return false;
      }
    }

    return true;
  });

  if (!matchingRule) {
    return c.json({
      success: false,
      isAuthorized: false,
      message: "No active delegation rule permits this proxy action",
    });
  }

  return c.json({
    success: true,
    isAuthorized: true,
    ruleId: matchingRule.id,
    scope: matchingRule.scope,
    maxLimit: matchingRule.maxMonetaryApprovalLimit,
    message: "Proxy authority verified",
  });
});

// 5. POST /execute-proxy - Execute an action on behalf of principal and record dual-identity audit log
const executeProxySchema = z.object({
  delegationRuleId: z.string().min(1),
  actedByUserId: z.string().min(1),
  onBehalfOfUserId: z.string().min(1),
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  actionTaken: z.enum(["approved", "rejected"]),
  notes: z.string().optional(),
});

delegationsRouter.post("/execute-proxy", zValidator("json", executeProxySchema), async (c) => {
  const body = c.req.valid("json");
  const tenantId = c.get("tenantId") || "default-tenant";

  const auditEntry = {
    id: `del-audit-${Date.now()}`,
    tenantId,
    delegationRuleId: body.delegationRuleId,
    actedByUserId: body.actedByUserId,
    onBehalfOfUserId: body.onBehalfOfUserId,
    entityType: body.entityType,
    entityId: body.entityId,
    actionTaken: body.actionTaken,
    notes: body.notes || "Executed via delegated authority",
    executedAt: new Date(),
  };

  try {
    if (db) {
      await db.insert(delegationAuditLogs).values(auditEntry as any);
    }
  } catch (err) {
    // fallback
  }

  memoryAuditLogs.unshift(auditEntry);

  return c.json(
    {
      success: true,
      message: `Action '${body.actionTaken}' executed on behalf of principal`,
      data: auditEntry,
    },
    201
  );
});

// 6. GET /audit - Query delegation execution audit logs
delegationsRouter.get("/audit", async (c) => {
  const actedByUserId = c.req.query("actedByUserId");
  const onBehalfOfUserId = c.req.query("onBehalfOfUserId");

  let filtered = [...memoryAuditLogs];
  if (actedByUserId) filtered = filtered.filter((a) => a.actedByUserId === actedByUserId);
  if (onBehalfOfUserId) filtered = filtered.filter((a) => a.onBehalfOfUserId === onBehalfOfUserId);

  return c.json({ success: true, count: filtered.length, data: filtered });
});
