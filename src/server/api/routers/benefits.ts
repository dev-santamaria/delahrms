/**
 * =========================================================================================
 * FLEXIBLE BENEFITS, HEALTH PLANS & EARNED WAGE ACCESS (EWA) ROUTER
 * =========================================================================================
 * Comprehensive workforce benefits administration and on-demand liquidity:
 * 1. Benefit insurance providers catalog (AAR, Jubilee, Britam, Sanlam)
 * 2. Benefit plans with tiered pricing (Employee Only, Employee + Family)
 * 3. Employee enrollment & family dependent registrations
 * 4. Earned Wage Access (EWA) / on-demand wage drawdowns with payroll auto-deductions
 * =========================================================================================
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";
import { db } from "@/db";
import {
  benefitProviders,
  benefitPlans,
  employeeBenefitEnrollments,
  benefitDependents,
  earnedWageAdvances,
} from "@/db/schema/benefits";

export const benefitsRouter = new Hono<AppEnv>();

// Default in-memory seed records
const memoryProviders: any[] = [
  { id: "prov-aar", code: "AAR_HEALTH", name: "AAR Insurance East Africa", countryCode: "KEN", supportEmail: "corporate@aar.co.ke", isActive: true },
  { id: "prov-jubilee", code: "JUBILEE_ALLIANZ", name: "Jubilee Allianz General Insurance", countryCode: "KEN", supportEmail: "medical@jubileekenya.com", isActive: true },
  { id: "prov-britam", code: "BRITAM_LIFE", name: "Britam Life Assurance Ltd", countryCode: "KEN", supportEmail: "contact@britam.com", isActive: true },
];

const memoryPlans: any[] = [
  {
    id: "plan-exec-health",
    providerId: "prov-jubilee",
    providerName: "Jubilee Allianz General Insurance",
    name: "Executive Comprehensive Health Cover",
    code: "HLTH-EXEC-VIP",
    category: "health_insurance",
    currency: "KES",
    tierPricing: {
      employee_only: 65000,
      employee_plus_spouse: 110000,
      full_family: 180000,
    },
    employerContributionPercentage: "100.00",
    isPreTaxDeduction: true,
    isActive: true,
  },
  {
    id: "plan-wellness-stipend",
    providerId: null,
    providerName: "Internal Corporate Program",
    name: "Monthly Gym & Mental Wellness Stipend",
    code: "WELL-GYM-101",
    category: "wellness_stipend",
    currency: "KES",
    tierPricing: { employee_only: 5000 },
    employerContributionPercentage: "100.00",
    isPreTaxDeduction: false,
    isActive: true,
  },
];

const memoryEnrollments: any[] = [
  {
    id: "ben-enr-001",
    tenantId: "tenant-default",
    organizationId: "org-ke",
    employeeId: "emp-001",
    benefitPlanId: "plan-exec-health",
    planName: "Executive Comprehensive Health Cover",
    coverageTier: "full_family",
    monthlyEmployeeCost: "0.00",
    monthlyEmployerCost: "15000.00",
    policyMembershipNumber: "JUB-MED-994812",
    status: "active",
    effectiveStartDate: "2026-01-01",
    effectiveEndDate: null,
    dependents: [
      { id: "dep-01", firstName: "Fatima", lastName: "Mensah", relationship: "spouse", dateOfBirth: "1988-06-14" },
      { id: "dep-02", firstName: "Kofi", lastName: "Mensah", relationship: "child", dateOfBirth: "2016-11-20" },
    ],
    createdAt: new Date("2026-01-01T00:00:00Z"),
  },
];

const memoryEwaAdvances: any[] = [
  {
    id: "ewa-adv-001",
    tenantId: "tenant-default",
    organizationId: "org-ke",
    employeeId: "emp-002",
    requestedAmount: "25000.00",
    feeAmount: "625.00", // 2.5% convenience fee
    totalRepaymentAmount: "25625.00",
    currency: "KES",
    payoutDestination: "+254712345678 (M-Pesa B2C)",
    payoutReference: "QEJ78194KL",
    status: "disbursed",
    requestedAt: new Date("2026-09-10T14:00:00Z"),
    disbursedAt: new Date("2026-09-10T14:02:00Z"),
  },
];

// 1. GET /providers - List benefit providers
benefitsRouter.get("/providers", async (c) => {
  try {
    const list = await db?.select().from(benefitProviders);
    if (list && list.length > 0) {
      return c.json({ success: true, count: list.length, data: list });
    }
  } catch (err) {
    // fallback
  }

  return c.json({ success: true, count: memoryProviders.length, data: memoryProviders });
});

// 2. GET /plans - List benefit plans
benefitsRouter.get("/plans", async (c) => {
  try {
    const list = await db?.select().from(benefitPlans);
    if (list && list.length > 0) {
      return c.json({ success: true, count: list.length, data: list });
    }
  } catch (err) {
    // fallback
  }

  return c.json({ success: true, count: memoryPlans.length, data: memoryPlans });
});

// 3. POST /plans - Register new plan
const createPlanSchema = z.object({
  providerId: z.string().optional(),
  name: z.string().min(1),
  code: z.string().min(1),
  category: z.string().default("health_insurance"),
  currency: z.string().length(3).default("KES"),
  tierPricing: z.record(z.string(), z.number()),
  employerContributionPercentage: z.number().min(0).max(100).default(100),
  isPreTaxDeduction: z.boolean().default(true),
});

benefitsRouter.post("/plans", zValidator("json", createPlanSchema), async (c) => {
  const body = c.req.valid("json");
  const prov = memoryProviders.find((p) => p.id === body.providerId);

  const newPlan = {
    id: `plan-${Date.now()}`,
    providerId: body.providerId || null,
    providerName: prov ? prov.name : "Internal Program",
    name: body.name,
    code: body.code.toUpperCase(),
    category: body.category,
    currency: body.currency,
    tierPricing: body.tierPricing,
    employerContributionPercentage: String(body.employerContributionPercentage),
    isPreTaxDeduction: body.isPreTaxDeduction,
    isActive: true,
  };

  memoryPlans.push(newPlan);
  return c.json({ success: true, message: "Benefit plan registered", data: newPlan }, 201);
});

// 4. GET /enrollments/:employeeId - List employee enrollments
benefitsRouter.get("/enrollments/:employeeId", async (c) => {
  const employeeId = c.req.param("employeeId");
  const filtered = memoryEnrollments.filter((e) => e.employeeId === employeeId);
  return c.json({ success: true, count: filtered.length, data: filtered });
});

// 5. POST /enrollments - Enroll employee in plan
const createEnrollmentSchema = z.object({
  employeeId: z.string().min(1),
  benefitPlanId: z.string().min(1),
  coverageTier: z.string().default("employee_only"),
  monthlyEmployeeCost: z.number().nonnegative().default(0),
  monthlyEmployerCost: z.number().nonnegative().default(0),
  effectiveStartDate: z.string(), // YYYY-MM-DD
  policyMembershipNumber: z.string().optional(),
});

benefitsRouter.post("/enrollments", zValidator("json", createEnrollmentSchema), async (c) => {
  const body = c.req.valid("json");
  const plan = memoryPlans.find((p) => p.id === body.benefitPlanId);

  const newEnr = {
    id: `ben-enr-${Date.now()}`,
    tenantId: c.get("tenantId") || "default-tenant",
    organizationId: null,
    employeeId: body.employeeId,
    benefitPlanId: body.benefitPlanId,
    planName: plan ? plan.name : "Benefit Plan",
    coverageTier: body.coverageTier,
    monthlyEmployeeCost: String(body.monthlyEmployeeCost),
    monthlyEmployerCost: String(body.monthlyEmployerCost),
    policyMembershipNumber: body.policyMembershipNumber || `POL-${Date.now().toString().slice(-6)}`,
    status: "active",
    effectiveStartDate: body.effectiveStartDate,
    effectiveEndDate: null,
    dependents: [],
    createdAt: new Date(),
  };

  memoryEnrollments.push(newEnr);

  return c.json({ success: true, message: "Employee enrolled in benefit plan", data: newEnr }, 201);
});

// 6. POST /enrollments/:id/dependents - Add sponsored dependent
const addDependentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  relationship: z.enum(["spouse", "child", "parent", "other"]),
  dateOfBirth: z.string(), // YYYY-MM-DD
  nationalId: z.string().optional(),
});

benefitsRouter.post("/enrollments/:id/dependents", zValidator("json", addDependentSchema), async (c) => {
  const enrollmentId = c.req.param("id");
  const body = c.req.valid("json");
  const enr = memoryEnrollments.find((e) => e.id === enrollmentId);

  if (!enr) {
    return c.json({ success: false, message: "Enrollment not found" }, 404);
  }

  const newDep = {
    id: `dep-${Date.now()}`,
    firstName: body.firstName,
    lastName: body.lastName,
    relationship: body.relationship,
    dateOfBirth: body.dateOfBirth,
    nationalId: body.nationalId || null,
  };

  enr.dependents.push(newDep);

  return c.json({ success: true, message: "Dependent attached to benefit enrollment", data: newDep }, 201);
});

// 7. GET /ewa/advances - List EWA advances
benefitsRouter.get("/ewa/advances", async (c) => {
  const employeeId = c.req.query("employeeId");
  let filtered = [...memoryEwaAdvances];
  if (employeeId) filtered = filtered.filter((a) => a.employeeId === employeeId);
  return c.json({ success: true, count: filtered.length, data: filtered });
});

// 8. POST /ewa/request - Request on-demand wage advance
const requestEwaSchema = z.object({
  employeeId: z.string().min(1),
  requestedAmount: z.number().positive(),
  payoutDestination: z.string().min(1), // e.g. "+254712345678"
  currency: z.string().length(3).default("KES"),
});

benefitsRouter.post("/ewa/request", zValidator("json", requestEwaSchema), async (c) => {
  const body = c.req.valid("json");
  const fee = Math.round(body.requestedAmount * 0.025 * 100) / 100; // 2.5% fee
  const totalRepayment = body.requestedAmount + fee;

  const newAdvance = {
    id: `ewa-adv-${Date.now()}`,
    tenantId: c.get("tenantId") || "default-tenant",
    organizationId: null,
    employeeId: body.employeeId,
    requestedAmount: body.requestedAmount.toFixed(2),
    feeAmount: fee.toFixed(2),
    totalRepaymentAmount: totalRepayment.toFixed(2),
    currency: body.currency,
    payoutDestination: body.payoutDestination,
    payoutReference: null,
    status: "requested",
    requestedAt: new Date(),
    disbursedAt: null,
  };

  memoryEwaAdvances.unshift(newAdvance);

  return c.json({
    success: true,
    message: "Earned Wage Access advance requested",
    data: newAdvance,
  }, 201);
});

// 9. POST /ewa/:id/disburse - Disburse EWA payment
benefitsRouter.post("/ewa/:id/disburse", async (c) => {
  const id = c.req.param("id");
  const advance = memoryEwaAdvances.find((a) => a.id === id);

  if (!advance) {
    return c.json({ success: false, message: "EWA advance request not found" }, 404);
  }

  advance.status = "disbursed";
  advance.disbursedAt = new Date();
  advance.payoutReference = `MPESA-B2C-${Date.now().toString().slice(-8)}`;

  return c.json({
    success: true,
    message: `EWA advance of ${advance.currency} ${advance.requestedAmount} disbursed via M-Pesa B2C (Ref: ${advance.payoutReference})`,
    data: advance,
  });
});
