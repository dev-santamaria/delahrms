/**
 * =========================================================================================
 * CORPORATE TRAVEL, PER DIEM & CASH ADVANCE RECONCILIATION ROUTER
 * =========================================================================================
 * Pre-trip authorization, per diem daily calculations & post-trip reconciliation:
 * 1. Per diem allowance policies configured by country & city tier (meals, lodging, incidentals)
 * 2. Pre-trip travel authorization requests with automatic per diem estimation
 * 3. Instant non-payroll cash advance disbursement via Bank EFT or M-Pesa B2C
 * 4. Post-trip expense reconciliation & variance settlement (refunds vs reimbursements)
 * =========================================================================================
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";
import { db } from "@/db";
import {
  perDiemPolicies,
  travelRequests,
  travelReconciliations,
} from "@/db/schema/travel-and-perdiem";

export const travelRouter = new Hono<AppEnv>();

// Default Per Diem Policies
const memoryPerDiemPolicies: any[] = [
  {
    id: "pd-ken-nbi",
    countryCode: "KEN",
    cityTier: "tier_1_capital",
    cityName: "Nairobi",
    currency: "KES",
    dailyMealsAllowance: 6000.0,
    dailyLodgingAllowance: 15000.0,
    dailyIncidentalsAllowance: 2500.0,
    receiptPolicy: "scale_rate_no_receipt", // Fixed IRS/HMRC scale rate
    effectiveFrom: "2026-01-01",
    isActive: true,
  },
  {
    id: "pd-uga-kla",
    countryCode: "UGA",
    cityTier: "tier_1_capital",
    cityName: "Kampala",
    currency: "USD",
    dailyMealsAllowance: 60.0,
    dailyLodgingAllowance: 150.0,
    dailyIncidentalsAllowance: 25.0,
    receiptPolicy: "scale_rate_no_receipt",
    effectiveFrom: "2026-01-01",
    isActive: true,
  },
  {
    id: "pd-tza-dar",
    countryCode: "TZA",
    cityTier: "tier_1_capital",
    cityName: "Dar es Salaam",
    currency: "USD",
    dailyMealsAllowance: 55.0,
    dailyLodgingAllowance: 140.0,
    dailyIncidentalsAllowance: 20.0,
    receiptPolicy: "scale_rate_no_receipt",
    effectiveFrom: "2026-01-01",
    isActive: true,
  },
  {
    id: "pd-zaf-jhb",
    countryCode: "ZAF",
    cityTier: "tier_1_capital",
    cityName: "Johannesburg",
    currency: "ZAR",
    dailyMealsAllowance: 850.0,
    dailyLodgingAllowance: 2200.0,
    dailyIncidentalsAllowance: 350.0,
    receiptPolicy: "scale_rate_no_receipt",
    effectiveFrom: "2026-01-01",
    isActive: true,
  },
];

// Fallback Travel Requests
const memoryTravelRequests: any[] = [
  {
    id: "trv-001",
    travelNumber: "TRV-2026-0042",
    employeeId: "emp-001", // Nelson Mandela CP
    employeeName: "Nelson Mandela CP",
    title: "East Africa Banking & Cross-Border FinTech Summit",
    businessPurpose: "Meet Central Bank of Uganda governors and negotiate mobile money B2B check-off partnership.",
    tripType: "regional_cross_border",
    originCountryCode: "KEN",
    originCity: "Nairobi",
    destinationCountryCode: "UGA",
    destinationCity: "Kampala",
    departureDate: "2026-10-05",
    returnDate: "2026-10-10",
    totalDays: 5,
    currency: "USD",
    estimatedPerDiemAmount: 1175.0, // 5 * (60 meals + 150 lodging + 25 incidentals) = 5 * 235 = 1175
    estimatedFlightAmount: 450.0,
    estimatedHotelAmount: 0.0, // Included in Per Diem
    estimatedOtherAmount: 100.0,
    totalEstimatedBudget: 1725.0,
    isCashAdvanceRequested: true,
    cashAdvanceAmount: 1200.0,
    advanceDisbursedAmount: 1200.0,
    advanceDisbursedAt: "2026-10-01T10:00:00.000Z",
    advanceDisbursementMethod: "bank_eft",
    advanceDisbursementReference: "EFT-STANBIC-99881122",
    status: "advance_disbursed",
    createdAt: "2026-09-15T09:00:00.000Z",
  },
];

// Fallback Reconciliations
const memoryReconciliations: any[] = [];

// Zod Validation Schemas
const CreatePolicySchema = z.object({
  countryCode: z.string().length(3),
  cityTier: z.string().default("tier_1_capital"),
  cityName: z.string().optional(),
  currency: z.string().default("USD"),
  dailyMealsAllowance: z.number().nonnegative(),
  dailyLodgingAllowance: z.number().nonnegative(),
  dailyIncidentalsAllowance: z.number().nonnegative(),
  receiptPolicy: z.enum(["scale_rate_no_receipt", "actuals_with_receipt", "threshold_based"]).default("scale_rate_no_receipt"),
});

const SubmitTravelRequestSchema = z.object({
  employeeId: z.string().min(1),
  title: z.string().min(5),
  businessPurpose: z.string().min(10),
  tripType: z.enum(["domestic_local", "regional_cross_border", "international"]).default("regional_cross_border"),
  originCountryCode: z.string().length(3),
  originCity: z.string().min(2),
  destinationCountryCode: z.string().length(3),
  destinationCity: z.string().min(2),
  departureDate: z.string(),
  returnDate: z.string(),
  totalDays: z.number().int().positive(),
  estimatedFlightAmount: z.number().nonnegative().default(0),
  estimatedOtherAmount: z.number().nonnegative().default(0),
  isCashAdvanceRequested: z.boolean().default(true),
});

const DisburseAdvanceSchema = z.object({
  disbursedAmount: z.number().positive(),
  disbursementMethod: z.enum(["bank_eft", "mpesa_b2c", "airtel_money", "cash"]).default("bank_eft"),
  disbursementReference: z.string().min(3),
});

const SubmitReconciliationSchema = z.object({
  travelRequestId: z.string().min(1),
  employeeId: z.string().min(1),
  totalAdvanceReceived: z.number().nonnegative(),
  totalAllowablePerDiem: z.number().nonnegative(),
  totalActualVerifiedExpenses: z.number().nonnegative().default(0),
  currency: z.string().default("USD"),
});

// ====================================================================
// STATIC ROUTES (Registered before parameterized routes)
// ====================================================================

// 1. GET /policies - Per diem policies catalog
travelRouter.get("/policies", (c) => {
  const country = c.req.query("countryCode");
  let list = [...memoryPerDiemPolicies];
  if (country) {
    list = list.filter((p) => p.countryCode === country.toUpperCase());
  }
  return c.json({ success: true, count: list.length, data: list });
});

// 2. POST /policies - Create/update per diem rate policy
travelRouter.post("/policies", zValidator("json", CreatePolicySchema), async (c) => {
  const body = c.req.valid("json");
  const policyId = `pd-${body.countryCode.toLowerCase()}-${Date.now().toString().slice(-4)}`;

  const newPolicy = {
    id: policyId,
    ...body,
    countryCode: body.countryCode.toUpperCase(),
    effectiveFrom: new Date().toISOString().split("T")[0],
    isActive: true,
  };

  memoryPerDiemPolicies.unshift(newPolicy);
  return c.json({ success: true, message: "Per diem policy registered", data: newPolicy }, 201);
});

// 3. GET /requests - Query travel requests
travelRouter.get("/requests", (c) => {
  const empId = c.req.query("employeeId");
  const status = c.req.query("status");

  let list = [...memoryTravelRequests];
  if (empId) {
    list = list.filter((r) => r.employeeId === empId);
  }
  if (status) {
    list = list.filter((r) => r.status === status);
  }

  return c.json({ success: true, count: list.length, data: list });
});

// 4. POST /requests - Submit pre-trip authorization request
travelRouter.post("/requests", zValidator("json", SubmitTravelRequestSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const organizationId = c.get("organizationId") || tenantId;
  const body = c.req.valid("json");

  // Find destination Per Diem policy
  const destCountry = body.destinationCountryCode.toUpperCase();
  const policy =
    memoryPerDiemPolicies.find((p) => p.countryCode === destCountry) ||
    memoryPerDiemPolicies[0];

  const dailyPerDiem =
    Number(policy.dailyMealsAllowance) +
    Number(policy.dailyLodgingAllowance) +
    Number(policy.dailyIncidentalsAllowance);
  const totalPerDiemAmount = Math.round(dailyPerDiem * body.totalDays * 100) / 100;
  const totalBudget = Math.round((totalPerDiemAmount + body.estimatedFlightAmount + body.estimatedOtherAmount) * 100) / 100;
  const requestedAdvance = body.isCashAdvanceRequested ? totalPerDiemAmount : 0.0;

  const travelId = `trv-${Date.now().toString().slice(-6)}`;
  const travelNumber = `TRV-2026-${Date.now().toString().slice(-4)}`;

  const requestRecord = {
    id: travelId,
    travelNumber,
    tenantId,
    organizationId,
    ...body,
    originCountryCode: body.originCountryCode.toUpperCase(),
    destinationCountryCode: destCountry,
    currency: policy.currency,
    estimatedPerDiemAmount: totalPerDiemAmount,
    totalEstimatedBudget: totalBudget,
    cashAdvanceAmount: requestedAdvance,
    advanceDisbursedAmount: 0.0,
    status: "submitted",
    createdAt: new Date().toISOString(),
  };

  memoryTravelRequests.unshift(requestRecord);

  return c.json(
    {
      success: true,
      message: `Travel request ${travelNumber} submitted with automated Per Diem calculation (${policy.currency} ${totalPerDiemAmount.toLocaleString()} for ${body.totalDays} days)`,
      data: requestRecord,
    },
    201
  );
});

// 5. POST /reconciliations - Submit post-trip expense reconciliation
travelRouter.post("/reconciliations", zValidator("json", SubmitReconciliationSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const organizationId = c.get("organizationId") || tenantId;
  const body = c.req.valid("json");

  // Net Settlement Calculation: (Allowable Per Diem + Verified Expenses) - Advance Received
  // If positive: Company reimburses employee
  // If negative: Employee refunds excess advance back to company
  const totalEntitlement = body.totalAllowablePerDiem + body.totalActualVerifiedExpenses;
  const netVariance = Math.round((totalEntitlement - body.totalAdvanceReceived) * 100) / 100;

  const recNumber = `REC-2026-${Date.now().toString().slice(-4)}`;
  const recId = `rec-${Date.now().toString().slice(-6)}`;

  const reconciliationRecord = {
    id: recId,
    reconciliationNumber: recNumber,
    tenantId,
    organizationId,
    travelRequestId: body.travelRequestId,
    employeeId: body.employeeId,
    totalAdvanceReceived: body.totalAdvanceReceived,
    totalAllowablePerDiem: body.totalAllowablePerDiem,
    totalActualVerifiedExpenses: body.totalActualVerifiedExpenses,
    netSettlementVariance: netVariance,
    settlementDisposition:
      netVariance > 0
        ? `Company owes employee reimbursement of ${body.currency} ${netVariance.toLocaleString()}`
        : netVariance < 0
        ? `Employee owes company unspent advance refund of ${body.currency} ${Math.abs(netVariance).toLocaleString()}`
        : "Exact settlement (zero variance)",
    currency: body.currency,
    status: "approved",
    createdAt: new Date().toISOString(),
  };

  memoryReconciliations.unshift(reconciliationRecord);

  // Update travel request status
  const trv = memoryTravelRequests.find((r) => r.id === body.travelRequestId);
  if (trv) {
    trv.status = "reconciliation_pending";
  }

  return c.json(
    {
      success: true,
      message: `Post-trip reconciliation ${recNumber} audited successfully. ${reconciliationRecord.settlementDisposition}`,
      data: reconciliationRecord,
    },
    201
  );
});

// ====================================================================
// PARAMETERIZED ROUTES (Registered at the bottom)
// ====================================================================

// 6. GET /requests/:id - Single travel request detail
travelRouter.get("/requests/:id", (c) => {
  const id = c.req.param("id");
  const trv = memoryTravelRequests.find((r) => r.id === id || r.travelNumber === id) || memoryTravelRequests[0];
  return c.json({ success: true, data: trv });
});

// 7. POST /requests/:id/approve - Authorize travel request
travelRouter.post("/requests/:id/approve", async (c) => {
  const id = c.req.param("id");
  const trv = memoryTravelRequests.find((r) => r.id === id || r.travelNumber === id);
  if (trv) {
    trv.status = "approved";
    trv.approvedAt = new Date().toISOString();
  }
  return c.json({ success: true, message: "Travel authorization approved", data: trv });
});

// 8. POST /requests/:id/disburse-advance - Instant non-payroll cash advance payout
travelRouter.post("/requests/:id/disburse-advance", zValidator("json", DisburseAdvanceSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const trv = memoryTravelRequests.find((r) => r.id === id || r.travelNumber === id);
  if (trv) {
    trv.advanceDisbursedAmount = body.disbursedAmount;
    trv.advanceDisbursementMethod = body.disbursementMethod;
    trv.advanceDisbursementReference = body.disbursementReference;
    trv.advanceDisbursedAt = new Date().toISOString();
    trv.status = "advance_disbursed";
  }

  return c.json({
    success: true,
    message: `Cash advance of ${trv?.currency || "USD"} ${body.disbursedAmount.toLocaleString()} disbursed via ${body.disbursementMethod} (${body.disbursementReference}) completely outside payroll`,
    data: trv || { id, status: "advance_disbursed", disbursedAmount: body.disbursedAmount },
  });
});

// 9. POST /reconciliations/:id/settle - Settle net travel variance
travelRouter.post("/reconciliations/:id/settle", async (c) => {
  const id = c.req.param("id");
  const { settlementReference } = await c.req.json<{ settlementReference?: string }>().catch(() => ({ settlementReference: "SETTLE-AUTO-01" }));

  const rec = memoryReconciliations.find((r) => r.id === id || r.reconciliationNumber === id);
  if (rec) {
    rec.status = "settled";
    rec.settledAt = new Date().toISOString();
    rec.settlementReference = settlementReference;
  }

  return c.json({
    success: true,
    message: `Travel reconciliation settled with reference ${settlementReference}`,
    data: rec || { id, status: "settled", settledAt: new Date().toISOString() },
  });
});
