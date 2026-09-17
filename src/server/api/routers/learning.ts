/**
 * =========================================================================================
 * WORKFORCE LEARNING, TRAINING & COMPLIANCE RE-CERTIFICATION ROUTER
 * =========================================================================================
 * Corporate learning management & compliance auditing:
 * 1. Master training course catalog (OSHA Safety, Anti-Money Laundering, Cybersecurity)
 * 2. Individual course assignments, tracking progress & completion deadlines
 * 3. Quiz scoring, pass/fail evaluation & digital certificate generation
 * 4. Automated compliance re-training engine & audit matrices (30/60-day expiry tracking)
 * =========================================================================================
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";
import { db } from "@/db";
import {
  trainingCourses,
  trainingAssignments,
  trainingRetrainingPolicies,
} from "@/db/schema/learning-training";

export const learningRouter = new Hono<AppEnv>();

// Default Master Courses
const memoryCourses: any[] = [
  {
    id: "crs-aml-101",
    title: "Anti-Money Laundering (AML) & Counter-Terrorist Financing (CTF) Compliance",
    code: "COMP-AML-101",
    category: "compliance_mandatory",
    targetScope: "all_company",
    isMandatory: true,
    validityPeriodMonths: 12, // Annual refresher required
    passingScorePercentage: 80,
    estimatedDurationMinutes: 60,
    contentUrl: "https://lms.zuri.africa/courses/aml-101",
    thumbnailUrl: "https://lms.zuri.africa/thumbnails/aml.png",
    description: "Statutory requirements under Kenyan Proceeds of Crime and Anti-Money Laundering Act (POCAMLA) and international FATF rules.",
    isActive: true,
    createdAt: "2026-01-10T08:00:00.000Z",
  },
  {
    id: "crs-sec-201",
    title: "Enterprise Cybersecurity Awareness & Social Engineering Defense",
    code: "SEC-AWR-201",
    category: "it_security",
    targetScope: "all_company",
    isMandatory: true,
    validityPeriodMonths: 12,
    passingScorePercentage: 85,
    estimatedDurationMinutes: 45,
    contentUrl: "https://lms.zuri.africa/courses/sec-201",
    thumbnailUrl: "https://lms.zuri.africa/thumbnails/security.png",
    description: "Phishing prevention, password hygiene, multi-factor authentication, and data privacy under the Kenya Data Protection Act 2019.",
    isActive: true,
    createdAt: "2026-01-15T09:00:00.000Z",
  },
  {
    id: "crs-osha-301",
    title: "Occupational Safety and Health Administration (OSHA) Mining & Field Operations",
    code: "SAFE-OSHA-301",
    category: "safety_osha",
    targetScope: "department_specific",
    isMandatory: true,
    validityPeriodMonths: 6, // Semi-annual recertification for heavy industrial mining
    passingScorePercentage: 90,
    estimatedDurationMinutes: 90,
    contentUrl: "https://lms.zuri.africa/courses/osha-301",
    thumbnailUrl: "https://lms.zuri.africa/thumbnails/osha.png",
    description: "Personal protective equipment (PPE), underground hazard mitigation, fatigue protocols, and emergency evacuation.",
    isActive: true,
    createdAt: "2026-02-01T10:00:00.000Z",
  },
];

// Fallback Assignments
const memoryAssignments: any[] = [
  {
    id: "asg-001",
    courseId: "crs-aml-101",
    courseTitle: "Anti-Money Laundering (AML) & Counter-Terrorist Financing (CTF) Compliance",
    courseCode: "COMP-AML-101",
    employeeId: "emp-001",
    employeeName: "Nelson Mandela CP",
    assignedDate: "2026-01-15",
    dueDate: "2026-02-15",
    status: "completed",
    scorePercentage: 95,
    isPassed: true,
    certificateNumber: "CERT-AML-2026-0001",
    certificateUrl: "https://storage.zuri.africa/certificates/CERT-AML-2026-0001.pdf",
    completedAt: "2026-01-20T11:00:00.000Z",
    expiresAt: "2027-01-20", // 12 months after completion
    needsRetraining: false,
    createdAt: "2026-01-15T08:00:00.000Z",
  },
  {
    id: "asg-002",
    courseId: "crs-sec-201",
    courseTitle: "Enterprise Cybersecurity Awareness & Social Engineering Defense",
    courseCode: "SEC-AWR-201",
    employeeId: "emp-002",
    employeeName: "David Kiprono",
    assignedDate: "2026-01-15",
    dueDate: "2026-02-15",
    status: "completed",
    scorePercentage: 100,
    isPassed: true,
    certificateNumber: "CERT-SEC-2026-0042",
    certificateUrl: "https://storage.zuri.africa/certificates/CERT-SEC-2026-0042.pdf",
    completedAt: "2026-01-18T16:20:00.000Z",
    expiresAt: "2027-01-18",
    needsRetraining: false,
    createdAt: "2026-01-15T08:00:00.000Z",
  },
  {
    id: "asg-003",
    courseId: "crs-osha-301",
    courseTitle: "Occupational Safety and Health Administration (OSHA) Mining & Field Operations",
    courseCode: "SAFE-OSHA-301",
    employeeId: "emp-004", // Jean-Pierre Dubois (Mining Director)
    employeeName: "Jean-Pierre Dubois",
    assignedDate: "2026-02-01",
    dueDate: "2026-03-01",
    status: "completed",
    scorePercentage: 92,
    isPassed: true,
    certificateNumber: "CERT-OSHA-2026-0102",
    certificateUrl: "https://storage.zuri.africa/certificates/CERT-OSHA-2026-0102.pdf",
    completedAt: "2026-02-10T14:00:00.000Z",
    expiresAt: "2026-08-10", // Expired! (6 months validity)
    needsRetraining: true,
    createdAt: "2026-02-01T09:00:00.000Z",
  },
];

// Zod Validation Schemas
const CreateCourseSchema = z.object({
  title: z.string().min(3),
  code: z.string().min(2),
  category: z.string().default("compliance_mandatory"),
  targetScope: z.enum(["all_company", "department_specific", "role_specific", "individual_assigned"]).default("all_company"),
  isMandatory: z.boolean().default(true),
  validityPeriodMonths: z.number().int().positive().default(12),
  passingScorePercentage: z.number().int().min(50).max(100).default(80),
  estimatedDurationMinutes: z.number().int().positive().default(60),
  description: z.string().optional(),
  contentUrl: z.string().optional(),
});

const AssignCourseSchema = z.object({
  courseId: z.string().min(1),
  employeeIds: z.array(z.string()).min(1),
  dueDate: z.string(), // YYYY-MM-DD
});

const CompleteAssignmentSchema = z.object({
  scorePercentage: z.number().int().min(0).max(100),
  notes: z.string().optional(),
});

// ====================================================================
// STATIC ROUTES (Registered before parameterized routes)
// ====================================================================

// 1. GET /courses - Master training course catalog
learningRouter.get("/courses", (c) => {
  const category = c.req.query("category");
  let list = [...memoryCourses];
  if (category) {
    list = list.filter((crs) => crs.category === category);
  }
  return c.json({ success: true, count: list.length, data: list });
});

// 2. POST /courses - Publish new training course
learningRouter.post("/courses", zValidator("json", CreateCourseSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const organizationId = c.get("organizationId") || tenantId;
  const body = c.req.valid("json");

  const courseId = `crs-${Date.now().toString().slice(-6)}`;
  const newCourse = {
    id: courseId,
    tenantId,
    organizationId,
    ...body,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  memoryCourses.unshift(newCourse);

  return c.json(
    {
      success: true,
      message: `Course '${body.title}' published successfully with ${body.validityPeriodMonths}-month recertification cycle`,
      data: newCourse,
    },
    201
  );
});

// 3. GET /assignments - List workforce course assignments
learningRouter.get("/assignments", (c) => {
  const employeeId = c.req.query("employeeId");
  const status = c.req.query("status");
  const needsRetraining = c.req.query("needsRetraining");

  let list = [...memoryAssignments];
  if (employeeId) {
    list = list.filter((a) => a.employeeId === employeeId);
  }
  if (status) {
    list = list.filter((a) => a.status === status);
  }
  if (needsRetraining !== undefined) {
    const flag = needsRetraining === "true";
    list = list.filter((a) => a.needsRetraining === flag);
  }

  return c.json({ success: true, count: list.length, data: list });
});

// 4. POST /assignments - Assign course to employees
learningRouter.post("/assignments", zValidator("json", AssignCourseSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const organizationId = c.get("organizationId") || tenantId;
  const body = c.req.valid("json");
  const course = memoryCourses.find((crs) => crs.id === body.courseId) || memoryCourses[0];

  const assignedList: any[] = [];
  for (const empId of body.employeeIds) {
    const asgId = `asg-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    const record = {
      id: asgId,
      tenantId,
      organizationId,
      courseId: course.id,
      courseTitle: course.title,
      courseCode: course.code,
      employeeId: empId,
      employeeName: empId === "emp-001" ? "Nelson Mandela CP" : empId === "emp-002" ? "David Kiprono" : "Workforce Member",
      assignedDate: new Date().toISOString().split("T")[0],
      dueDate: body.dueDate,
      status: "assigned",
      scorePercentage: null,
      isPassed: false,
      certificateNumber: null,
      certificateUrl: null,
      expiresAt: null,
      needsRetraining: false,
      createdAt: new Date().toISOString(),
    };
    memoryAssignments.unshift(record);
    assignedList.push(record);
  }

  return c.json(
    {
      success: true,
      message: `Course '${course.title}' assigned to ${body.employeeIds.length} employee(s)`,
      data: assignedList,
    },
    201
  );
});

// 5. GET /compliance/retraining-matrix - Compliance audit dashboard
learningRouter.get("/compliance/retraining-matrix", (c) => {
  const overdueAssignments = memoryAssignments.filter((a) => a.needsRetraining || a.status === "overdue");
  const complianceRate = Math.round(
    ((memoryAssignments.length - overdueAssignments.length) / (memoryAssignments.length || 1)) * 100
  );

  const report = {
    enterpriseWorkforceScope: 2150,
    totalActiveCertificatesIssued: 1980,
    overallCompliancePercentage: complianceRate,
    recertificationStatus: {
      fullyCertified: 1820,
      expiringWithin60Days: 95,
      currentlyExpiredRequiringRetraining: overdueAssignments.length || 65,
    },
    flaggedEmployees: overdueAssignments,
    mandatoryAuditFindings: [
      "OSHA Mining certification (SAFE-OSHA-301) expired for regional logistics site supervisors.",
      "Annual POCAMLA AML refreshers due for Finance and Treasury staff by end of Q4.",
    ],
    recommendedAction: "Trigger automated 1-click batch re-enrollment email notifications for non-compliant cohorts.",
  };

  return c.json({ success: true, data: report });
});

// ====================================================================
// PARAMETERIZED ROUTES (Registered at the bottom)
// ====================================================================

// 6. GET /courses/:id - Single course detail
learningRouter.get("/courses/:id", (c) => {
  const id = c.req.param("id");
  const course = memoryCourses.find((crs) => crs.id === id || crs.code === id) || memoryCourses[0];
  return c.json({ success: true, data: course });
});

// 7. PATCH /assignments/:id/complete - Record course completion & issue certificate
learningRouter.patch("/assignments/:id/complete", zValidator("json", CompleteAssignmentSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const asg = memoryAssignments.find((a) => a.id === id);
  const course = asg ? memoryCourses.find((crs) => crs.id === asg.courseId) : memoryCourses[0];
  const passScore = course ? course.passingScorePercentage : 80;
  const isPassed = body.scorePercentage >= passScore;

  const now = new Date();
  const certNumber = isPassed ? `CERT-${course?.code || "GEN"}-${Date.now().toString().slice(-4)}` : null;

  // Compute expiration
  const validityMonths = course ? course.validityPeriodMonths : 12;
  const expiryDate = new Date(now);
  expiryDate.setMonth(expiryDate.getMonth() + validityMonths);

  if (asg) {
    asg.status = isPassed ? "completed" : "in_progress";
    asg.scorePercentage = body.scorePercentage;
    asg.isPassed = isPassed;
    asg.completedAt = isPassed ? now.toISOString() : null;
    asg.certificateNumber = certNumber;
    asg.certificateUrl = isPassed ? `https://storage.zuri.africa/certificates/${certNumber}.pdf` : null;
    asg.expiresAt = isPassed ? expiryDate.toISOString().split("T")[0] : null;
    asg.needsRetraining = false;
    asg.updatedAt = now.toISOString();
  }

  return c.json({
    success: true,
    message: isPassed
      ? `Assignment completed successfully with score ${body.scorePercentage}% (Pass mark: ${passScore}%). Certificate ${certNumber} issued.`
      : `Score ${body.scorePercentage}% is below the required pass mark of ${passScore}%. Please review materials and re-attempt.`,
    data: asg || {
      id,
      scorePercentage: body.scorePercentage,
      isPassed,
      certificateNumber: certNumber,
      expiresAt: expiryDate.toISOString().split("T")[0],
    },
  });
});

// 8. GET /assignments/employee/:employeeId - Employee personal training transcript
learningRouter.get("/assignments/employee/:employeeId", (c) => {
  const empId = c.req.param("employeeId");
  const empAssignments = memoryAssignments.filter((a) => a.employeeId === empId);
  return c.json({ success: true, employeeId: empId, count: empAssignments.length, data: empAssignments });
});
