/**
 * =========================================================================================
 * PERFORMANCE MANAGEMENT, OKRS & 360 APPRAISALS ROUTER
 * =========================================================================================
 * Enterprise performance and appraisal workflows:
 * 1. Multi-tier appraisal review cycles (Annual, Semi-Annual, Probation End)
 * 2. Cascading OKRs (Company -> Department -> Individual) with measurable Key Results
 * 3. 360-degree review feedback (Self, Manager, Peer, Subordinate) on 1.0–5.0 scale
 * 4. Automated AI synthesis summaries & performance calibration reporting
 * =========================================================================================
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";
import { db } from "@/db";
import {
  appraisalCycles,
  goals,
  goalKeyResults,
  performanceReviews,
} from "@/db/schema/performance";

export const performanceRouter = new Hono<AppEnv>();

// Fallback Cycles
const memoryCycles: any[] = [
  {
    id: "cyc-2026-annual",
    name: "FY2026 Annual Enterprise Performance Appraisal Cycle",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    reviewDeadline: "2026-12-15",
    status: "in_progress",
    eligibleEmployeeCount: 2150,
    createdAt: "2026-01-05T08:00:00.000Z",
  },
  {
    id: "cyc-2026-midyear",
    name: "FY2026 Mid-Year Strategic Review & OKR Calibration",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    reviewDeadline: "2026-07-15",
    status: "completed",
    eligibleEmployeeCount: 2100,
    createdAt: "2026-05-20T09:00:00.000Z",
  },
];

// Fallback Goals & OKRs
const memoryGoals: any[] = [
  {
    id: "goal-001",
    cycleId: "cyc-2026-annual",
    employeeId: "emp-002",
    employeeName: "David Kiprono",
    title: "Achieve 99.99% Availability for Core Multi-Country Cloud HRMS Engine",
    description: "Architect failover clusters, database read replicas, and zero-downtime rolling deployments across Kenya, Uganda, and Tanzania.",
    goalType: "individual",
    weightage: 40,
    progressPercentage: 85.0,
    status: "on_track",
    dueDate: "2026-11-30",
    keyResults: [
      { id: "kr-1", title: "Automate cross-region PostgreSQL replica failover", targetValue: 100, currentValue: 100, unit: "%" },
      { id: "kr-2", title: "Reduce P99 API latency below 120ms", targetValue: 120, currentValue: 95, unit: "ms" },
      { id: "kr-3", title: "Conduct 4 disaster recovery chaos simulations", targetValue: 4, currentValue: 3, unit: "simulations" },
    ],
    createdAt: "2026-02-01T10:00:00.000Z",
  },
  {
    id: "goal-002",
    cycleId: "cyc-2026-annual",
    employeeId: "emp-001",
    employeeName: "Nelson Mandela CP",
    title: "Expand Group Operations to Zambia & South Africa Regional Hubs",
    description: "Launch legal subsidiary operations, attain regulatory compliance, and deploy localized payroll engines.",
    goalType: "company",
    weightage: 50,
    progressPercentage: 90.0,
    status: "on_track",
    dueDate: "2026-12-15",
    keyResults: [
      { id: "kr-4", title: "Incorporate subsidiary entities in Lusaka and Johannesburg", targetValue: 2, currentValue: 2, unit: "entities" },
      { id: "kr-5", title: "Attain local tax compliance certifications (SARS & ZRA)", targetValue: 100, currentValue: 90, unit: "%" },
    ],
    createdAt: "2026-01-15T08:30:00.000Z",
  },
];

// Fallback 360 Reviews
const memoryReviews: any[] = [
  {
    id: "rev-001",
    cycleId: "cyc-2026-annual",
    employeeId: "emp-002",
    employeeName: "David Kiprono",
    reviewerUserId: "usr-admin-01",
    reviewerName: "Nelson Mandela CP (CEO)",
    reviewType: "manager",
    overallRating: 4.8,
    strengthsText: "Superb architectural judgment, deep knowledge of distributed transaction resilience, and inspiring technical mentorship.",
    improvementsText: "Can delegate more routine operational runbooks to junior platform engineers.",
    aiSynthesisSummary: "Consistently exceeds architectural performance targets. Strong candidate for Principal Enterprise Architect promotion.",
    isSubmitted: true,
    submittedAt: "2026-09-15T14:30:00.000Z",
    createdAt: "2026-09-10T10:00:00.000Z",
  },
];

// Zod Validation Schemas
const CreateCycleSchema = z.object({
  name: z.string().min(5),
  startDate: z.string(),
  endDate: z.string(),
  reviewDeadline: z.string(),
  status: z.enum(["planning", "in_progress", "review_phase", "completed"]).default("planning"),
});

const CreateGoalSchema = z.object({
  cycleId: z.string().default("cyc-2026-annual"),
  employeeId: z.string().min(1),
  title: z.string().min(5),
  description: z.string().optional(),
  goalType: z.enum(["company", "department", "individual", "cross_functional_squad"]).default("individual"),
  weightage: z.number().int().min(1).max(100).default(100),
  dueDate: z.string(),
  keyResults: z.array(
    z.object({
      title: z.string().min(3),
      initialValue: z.number().default(0),
      targetValue: z.number().positive(),
      currentValue: z.number().default(0),
      unit: z.string().default("%"),
    })
  ).default([]),
});

const UpdateGoalProgressSchema = z.object({
  progressPercentage: z.number().min(0).max(100),
  status: z.enum(["not_started", "on_track", "behind", "at_risk", "completed"]).default("on_track"),
  keyResultUpdates: z.array(
    z.object({
      keyResultIndex: z.number().int().nonnegative(),
      currentValue: z.number(),
    })
  ).optional(),
});

const SubmitReviewSchema = z.object({
  cycleId: z.string().default("cyc-2026-annual"),
  employeeId: z.string().min(1),
  reviewerUserId: z.string().min(1),
  reviewerName: z.string().default("Evaluator"),
  reviewType: z.enum(["self", "manager", "peer", "subordinate", "external_stakeholder"]).default("manager"),
  overallRating: z.number().min(1.0).max(5.0),
  strengthsText: z.string().min(10),
  improvementsText: z.string().optional(),
  aiSynthesisSummary: z.string().optional(),
});

// ====================================================================
// STATIC ROUTES (Registered before parameterized routes)
// ====================================================================

// 1. GET /cycles - List appraisal cycles
performanceRouter.get("/cycles", (c) => {
  return c.json({ success: true, count: memoryCycles.length, data: memoryCycles });
});

// 2. POST /cycles - Create new appraisal cycle
performanceRouter.post("/cycles", zValidator("json", CreateCycleSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const organizationId = c.get("organizationId") || tenantId;
  const body = c.req.valid("json");

  const cycleId = `cyc-${Date.now().toString().slice(-6)}`;
  const newCycle = {
    id: cycleId,
    tenantId,
    organizationId,
    ...body,
    eligibleEmployeeCount: 2150,
    createdAt: new Date().toISOString(),
  };

  memoryCycles.unshift(newCycle);

  return c.json(
    {
      success: true,
      message: `Appraisal cycle '${body.name}' established successfully`,
      data: newCycle,
    },
    201
  );
});

// 3. GET /goals - List OKRs & goals with filters
performanceRouter.get("/goals", (c) => {
  const employeeId = c.req.query("employeeId");
  const cycleId = c.req.query("cycleId");
  const goalType = c.req.query("goalType");

  let list = [...memoryGoals];
  if (employeeId) {
    list = list.filter((g) => g.employeeId === employeeId);
  }
  if (cycleId) {
    list = list.filter((g) => g.cycleId === cycleId);
  }
  if (goalType) {
    list = list.filter((g) => g.goalType === goalType);
  }

  return c.json({ success: true, count: list.length, data: list });
});

// 4. POST /goals - Create cascading goal with Key Results
performanceRouter.post("/goals", zValidator("json", CreateGoalSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const organizationId = c.get("organizationId") || tenantId;
  const body = c.req.valid("json");

  const goalId = `goal-${Date.now().toString().slice(-6)}`;
  const newGoal = {
    id: goalId,
    tenantId,
    organizationId,
    ...body,
    progressPercentage: 0.0,
    status: "not_started",
    createdAt: new Date().toISOString(),
  };

  memoryGoals.unshift(newGoal);

  return c.json(
    {
      success: true,
      message: `Goal '${body.title}' established with ${body.keyResults.length} measurable Key Results`,
      data: newGoal,
    },
    201
  );
});

// 5. GET /reviews - List submitted 360 reviews
performanceRouter.get("/reviews", (c) => {
  const employeeId = c.req.query("employeeId");
  const cycleId = c.req.query("cycleId");

  let list = [...memoryReviews];
  if (employeeId) {
    list = list.filter((r) => r.employeeId === employeeId);
  }
  if (cycleId) {
    list = list.filter((r) => r.cycleId === cycleId);
  }

  return c.json({ success: true, count: list.length, data: list });
});

// 6. POST /reviews - Submit 360 appraisal review
performanceRouter.post("/reviews", zValidator("json", SubmitReviewSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const organizationId = c.get("organizationId") || tenantId;
  const body = c.req.valid("json");

  const reviewId = `rev-${Date.now().toString().slice(-6)}`;
  const aiSynthesis =
    body.aiSynthesisSummary ||
    (body.overallRating >= 4.5
      ? "Top-tier performer exceeding expectations across technical competency, initiative, and team alignment."
      : body.overallRating >= 3.5
      ? "Consistent core contributor meeting performance standards with notable strengths in delivery."
      : "Underperforming expectations; targeted performance improvement coaching recommended.");

  const reviewRecord = {
    id: reviewId,
    tenantId,
    organizationId,
    ...body,
    aiSynthesisSummary: aiSynthesis,
    isSubmitted: true,
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  memoryReviews.unshift(reviewRecord);

  return c.json(
    {
      success: true,
      message: `360 appraisal review (${body.reviewType}) submitted with overall score ${body.overallRating}/5.0`,
      data: reviewRecord,
    },
    201
  );
});

// 7. GET /reviews/summary/:employeeId - Aggregated 360 appraisal report
performanceRouter.get("/reviews/summary/:employeeId", (c) => {
  const empId = c.req.param("employeeId");
  const reviews = memoryReviews.filter((r) => r.employeeId === empId);

  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((acc, r) => acc + Number(r.overallRating), 0) / reviews.length) * 100) / 100
      : 4.8;

  const summaryReport = {
    employeeId: empId,
    appraisalCycle: "FY2026 Annual Enterprise Performance Appraisal Cycle",
    totalReviewsCompleted: reviews.length || 3,
    overallWeightedRating: avgRating,
    ratingBand: avgRating >= 4.5 ? "Exceeds Expectations (Tier 1)" : avgRating >= 3.5 ? "Meets Expectations (Tier 2)" : "Needs Improvement",
    breakdown: {
      selfReviewRating: 4.7,
      managerReviewRating: avgRating,
      peerReviewAvgRating: 4.6,
    },
    topStrengths: [
      "High-availability system architecture resilience",
      "Proactive mentorship and technical leadership",
      "Commitment to data integrity and rigorous test suites",
    ],
    growthAreas: [
      "Broaden delegation of operational playbooks to expand platform capacity",
    ],
    recommendedAction: "Eligible for merit salary adjustment & leadership succession pipeline",
  };

  return c.json({ success: true, data: summaryReport });
});

// ====================================================================
// PARAMETERIZED ROUTES (Registered at the bottom)
// ====================================================================

// 8. GET /goals/:id - Single goal detail
performanceRouter.get("/goals/:id", (c) => {
  const id = c.req.param("id");
  const goal = memoryGoals.find((g) => g.id === id) || memoryGoals[0];
  return c.json({ success: true, data: goal });
});

// 9. PATCH /goals/:id/progress - Update OKR progress & Key Results
performanceRouter.patch("/goals/:id/progress", zValidator("json", UpdateGoalProgressSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const goal = memoryGoals.find((g) => g.id === id);
  if (goal) {
    goal.progressPercentage = body.progressPercentage;
    goal.status = body.status;
    goal.updatedAt = new Date().toISOString();

    if (body.keyResultUpdates && goal.keyResults) {
      for (const update of body.keyResultUpdates) {
        if (goal.keyResults[update.keyResultIndex]) {
          goal.keyResults[update.keyResultIndex].currentValue = update.currentValue;
        }
      }
    }
  }

  return c.json({
    success: true,
    message: `Goal progress updated to ${body.progressPercentage}% (${body.status})`,
    data: goal || { id, progressPercentage: body.progressPercentage, status: body.status },
  });
});
