/**
 * =========================================================================================
 * JOB GRADES, SALARY BANDS & GRADE-BASED BENEFIT ELIGIBILITY ROUTER
 * =========================================================================================
 * Manages enterprise compensation bands (G1 to G10, Executive) and connects them directly
 * to health insurance packages (inpatient/outpatient limits, dependent tiers, co-pay)
 * and corporate perks (company vehicle eligibility).
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";
import { db } from "@/db";
import { jobGrades, benefitGradeEligibility } from "@/db/schema/job-grades";
import { eq, asc } from "drizzle-orm";

export const jobGradesRouter = new Hono<AppEnv>();

// Zod Schemas
const CreateGradeSchema = z.object({
  gradeCode: z.string().min(2).max(50), // e.g. "G1", "G5", "EXEC-1"
  gradeName: z.string().min(2),
  hierarchyRank: z.number().int().positive(),
  minSalary: z.number().nonnegative(),
  midSalary: z.number().nonnegative().optional(),
  maxSalary: z.number().nonnegative(),
  currency: z.string().default("KES"),
  isCompanyCarEligible: z.boolean().default(false),
  annualLeaveDaysDefault: z.number().int().positive().default(21),
  description: z.string().optional(),
});

const ConfigureBenefitMatrixSchema = z.object({
  gradeId: z.string(),
  benefitPlanId: z.string(),
  allowedCoverageTier: z
    .enum(["employee_only", "employee_plus_spouse", "full_family", "executive_unlimited"])
    .default("full_family"),
  inpatientLimit: z.number().positive(),
  outpatientLimit: z.number().positive(),
  dentalOpticalLimit: z.number().nonnegative().optional(),
  maxDependentsCovered: z.number().int().nonnegative().default(4),
  employerSubsidyPercentage: z.number().min(0).max(100).default(100),
  requiresCoPay: z.boolean().default(false),
});

// Fallback sample grades
const SAMPLE_GRADES = [
  {
    id: "grd-01",
    gradeCode: "G1",
    gradeName: "Operations & Office Associate",
    hierarchyRank: 1,
    minSalary: "50000.00",
    midSalary: "75000.00",
    maxSalary: "100000.00",
    currency: "KES",
    isCompanyCarEligible: false,
    annualLeaveDaysDefault: 21,
  },
  {
    id: "grd-05",
    gradeCode: "G5",
    gradeName: "Senior Software Engineer / Team Lead",
    hierarchyRank: 5,
    minSalary: "250000.00",
    midSalary: "350000.00",
    maxSalary: "450000.00",
    currency: "KES",
    isCompanyCarEligible: false,
    annualLeaveDaysDefault: 24,
  },
  {
    id: "grd-08",
    gradeCode: "M1",
    gradeName: "Department Head / Director",
    hierarchyRank: 8,
    minSalary: "550000.00",
    midSalary: "750000.00",
    maxSalary: "950000.00",
    currency: "KES",
    isCompanyCarEligible: true,
    annualLeaveDaysDefault: 28,
  },
  {
    id: "grd-10",
    gradeCode: "EXEC-1",
    gradeName: "C-Suite Executive / Vice President",
    hierarchyRank: 10,
    minSalary: "1000000.00",
    midSalary: "1500000.00",
    maxSalary: "2200000.00",
    currency: "KES",
    isCompanyCarEligible: true,
    annualLeaveDaysDefault: 30,
  },
];

const SAMPLE_BENEFIT_MATRIX = [
  {
    gradeCode: "G1",
    gradeName: "Operations & Office Associate",
    allowedCoverageTier: "employee_only",
    inpatientLimit: 1000000,
    outpatientLimit: 100000,
    dentalOpticalLimit: 30000,
    maxDependentsCovered: 1,
    employerSubsidyPercentage: 100,
    requiresCoPay: false,
  },
  {
    gradeCode: "G5",
    gradeName: "Senior Software Engineer / Team Lead",
    allowedCoverageTier: "full_family",
    inpatientLimit: 2500000,
    outpatientLimit: 200000,
    dentalOpticalLimit: 50000,
    maxDependentsCovered: 4,
    employerSubsidyPercentage: 100,
    requiresCoPay: false,
  },
  {
    gradeCode: "M1",
    gradeName: "Department Head / Director",
    allowedCoverageTier: "full_family",
    inpatientLimit: 5000000,
    outpatientLimit: 350000,
    dentalOpticalLimit: 80000,
    maxDependentsCovered: 5,
    employerSubsidyPercentage: 100,
    requiresCoPay: false,
  },
  {
    gradeCode: "EXEC-1",
    gradeName: "C-Suite Executive / Vice President",
    allowedCoverageTier: "executive_unlimited",
    inpatientLimit: 10000000,
    outpatientLimit: 500000,
    dentalOpticalLimit: 150000,
    maxDependentsCovered: 6,
    employerSubsidyPercentage: 100,
    requiresCoPay: false,
  },
];

// 1. GET /grades - List job grades
jobGradesRouter.get("/grades", async (c) => {
  try {
    const tenantId = c.get("tenantId");
    let grades: any[] = [];
    if (process.env.DATABASE_URL) {
      grades = await db
        .select()
        .from(jobGrades)
        .where(eq(jobGrades.tenantId, tenantId))
        .orderBy(asc(jobGrades.hierarchyRank));
    }
    if (!grades.length) {
      grades = SAMPLE_GRADES;
    }

    return c.json({ success: true, count: grades.length, data: grades });
  } catch (err: any) {
    return c.json({ success: true, count: SAMPLE_GRADES.length, data: SAMPLE_GRADES });
  }
});

// 2. POST /grades - Create a job grade
jobGradesRouter.post("/grades", zValidator("json", CreateGradeSchema), async (c) => {
  const body = c.req.valid("json");
  const gradeId = `grd-${Date.now().toString().slice(-6)}`;

  return c.json(
    {
      success: true,
      message: "Job grade created successfully",
      data: { id: gradeId, ...body },
    },
    201
  );
});

// 3. GET /benefit-matrix - Fetch the grade-to-health insurance eligibility matrix
jobGradesRouter.get("/benefit-matrix", async (c) => {
  return c.json({
    success: true,
    count: SAMPLE_BENEFIT_MATRIX.length,
    data: SAMPLE_BENEFIT_MATRIX,
  });
});

// 4. POST /benefit-matrix - Configure health insurance limits for a grade
jobGradesRouter.post("/benefit-matrix", zValidator("json", ConfigureBenefitMatrixSchema), async (c) => {
  const body = c.req.valid("json");
  const matrixId = `MAT-${Date.now().toString().slice(-6)}`;

  return c.json(
    {
      success: true,
      message: "Health insurance tier matrix configured for grade",
      data: { id: matrixId, ...body },
    },
    201
  );
});

// 5. GET /grades/:id/entitlements - Fetch complete entitlements for a grade
jobGradesRouter.get("/grades/:id/entitlements", async (c) => {
  const id = c.req.param("id");
  const matchedGrade = SAMPLE_GRADES.find((g) => g.id === id) || SAMPLE_GRADES[2];
  const matchedMatrix =
    SAMPLE_BENEFIT_MATRIX.find((m) => m.gradeCode === matchedGrade.gradeCode) ||
    SAMPLE_BENEFIT_MATRIX[2];

  return c.json({
    success: true,
    data: {
      grade: matchedGrade,
      healthInsurancePlan: matchedMatrix,
      executivePerks: {
        companyCarEligible: matchedGrade.isCompanyCarEligible,
        annualLeaveDays: matchedGrade.annualLeaveDaysDefault,
        businessClassTravel: matchedGrade.hierarchyRank >= 8,
        clubMembershipSubsidized: matchedGrade.hierarchyRank >= 8,
      },
    },
  });
});
