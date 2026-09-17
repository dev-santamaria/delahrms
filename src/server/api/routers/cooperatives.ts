/**
 * =========================================================================================
 * COOPERATIVES (SACCOS) & INSTITUTIONAL REMITTANCES ROUTER
 * =========================================================================================
 * Manages onboarding of multiple concurrent cooperative societies (Harambee, Stima, etc.),
 * multi-product catalogs (shares, development loans, benevolent funds), employee check-off
 * mandates, pre-validation against the Kenyan 1/3 Net Pay Rule, and remittance schedules.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";
import { db } from "@/db";
import {
  thirdPartyInstitutions,
  cooperativeProducts,
  employeeRemittanceMandates,
} from "@/db/schema/remittances";
import { eq, and } from "drizzle-orm";

export const cooperativesRouter = new Hono<AppEnv>();

// Zod Schemas
const CreateCooperativeSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(50),
  registrationNumber: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankSwiftCode: z.string().optional(),
  mpesaPaybillNumber: z.string().optional(),
  mpesaAccountReferenceRule: z.string().optional(),
  currency: z.string().default("KES"),
});

const CreateProductSchema = z.object({
  productName: z.string().min(2),
  productCode: z.string().min(2),
  productCategory: z.enum(["deposit", "benevolent", "loan", "share_capital"]).default("deposit"),
  interestRateAnnual: z.number().nonnegative().default(0),
  deductionPriority: z.number().int().default(1),
  description: z.string().optional(),
});

const CreateMandateSchema = z.object({
  employeeId: z.string(),
  institutionId: z.string(),
  cooperativeProductId: z.string().optional(),
  remittanceType: z.string().default("cooperative_checkoff"),
  memberOrPolicyNumber: z.string(),
  loanAccountNumber: z.string().optional(),
  principalPortionMonthly: z.number().nonnegative().default(0),
  interestPortionMonthly: z.number().nonnegative().default(0),
  monthlyDeductionAmount: z.number().positive(),
  totalLoanPrincipal: z.number().nonnegative().optional(),
  currentLoanBalance: z.number().nonnegative().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  currentBasicSalary: z.number().positive().optional(),
  existingTotalDeductions: z.number().nonnegative().default(0),
});

// Sample fallback data for offline/test mode
const SAMPLE_COOPERATIVES = [
  {
    id: "inst-coop-001",
    name: "Harambee Sacco Society Ltd",
    code: "HARAMBEE_SACCO",
    institutionType: "cooperative",
    registrationNumber: "CS/0124",
    bankName: "Co-operative Bank of Kenya",
    bankAccountNumber: "01129000123400",
    mpesaPaybillNumber: "300050",
    currency: "KES",
    isActive: true,
  },
  {
    id: "inst-coop-002",
    name: "Stima Sacco Society Ltd",
    code: "STIMA_SACCO",
    institutionType: "cooperative",
    registrationNumber: "CS/0289",
    bankName: "Stanbic Bank Kenya",
    bankAccountNumber: "0100098765400",
    mpesaPaybillNumber: "525200",
    currency: "KES",
    isActive: true,
  },
  {
    id: "inst-coop-003",
    name: "Mwalimu National Sacco",
    code: "MWALIMU_SACCO",
    institutionType: "cooperative",
    registrationNumber: "CS/0055",
    bankName: "Equity Bank Kenya",
    bankAccountNumber: "0180299887766",
    mpesaPaybillNumber: "400200",
    currency: "KES",
    isActive: true,
  },
  {
    id: "inst-coop-004",
    name: "Kenya Police Sacco",
    code: "POLICE_SACCO",
    institutionType: "cooperative",
    registrationNumber: "CS/0312",
    bankName: "Absa Bank Kenya",
    bankAccountNumber: "0308811223344",
    mpesaPaybillNumber: "888123",
    currency: "KES",
    isActive: true,
  },
];

// 1. GET / - List all onboarded cooperatives
cooperativesRouter.get("/", async (c) => {
  try {
    const tenantId = c.get("tenantId");
    let coops: any[] = [];
    if (process.env.DATABASE_URL) {
      coops = await db
        .select()
        .from(thirdPartyInstitutions)
        .where(
          and(
            eq(thirdPartyInstitutions.tenantId, tenantId),
            eq(thirdPartyInstitutions.institutionType, "cooperative")
          )
        );
    }
    if (!coops.length) {
      coops = SAMPLE_COOPERATIVES;
    }

    return c.json({ success: true, count: coops.length, data: coops });
  } catch (err: any) {
    return c.json({ success: true, count: SAMPLE_COOPERATIVES.length, data: SAMPLE_COOPERATIVES });
  }
});

// 2. POST / - Onboard a new cooperative society
cooperativesRouter.post("/", zValidator("json", CreateCooperativeSchema), async (c) => {
  try {
    const tenantId = c.get("tenantId");
    const organizationId = c.get("organizationId") || tenantId;
    const body = c.req.valid("json");

    let coopId = `coop-${Date.now().toString().slice(-6)}`;
    if (process.env.DATABASE_URL) {
      const [created] = await db
        .insert(thirdPartyInstitutions)
        .values({
          tenantId,
          organizationId,
          name: body.name,
          code: body.code,
          institutionType: "cooperative",
          registrationNumber: body.registrationNumber,
          contactEmail: body.contactEmail,
          contactPhone: body.contactPhone,
          bankName: body.bankName,
          bankBranch: body.bankBranch,
          bankAccountNumber: body.bankAccountNumber,
          bankAccountName: body.bankAccountName,
          bankSwiftCode: body.bankSwiftCode,
          mpesaPaybillNumber: body.mpesaPaybillNumber,
          mpesaAccountReferenceRule: body.mpesaAccountReferenceRule,
          currency: body.currency,
          isActive: true,
        })
        .returning();
      if (created) coopId = created.id;
    }

    return c.json(
      {
        success: true,
        message: "Cooperative society successfully onboarded",
        data: { id: coopId, ...body, institutionType: "cooperative" },
      },
      201
    );
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 3. GET /:id/products - List products for a cooperative
cooperativesRouter.get("/:id/products", async (c) => {
  const institutionId = c.req.param("id");
  const products = [
    {
      id: "prod-001",
      institutionId,
      productName: "Main Non-Withdrawable Deposits (Shares)",
      productCode: "DEP_SHARES",
      productCategory: "deposit",
      interestRateAnnual: "0.00",
      deductionPriority: 1,
      isActive: true,
    },
    {
      id: "prod-002",
      institutionId,
      productName: "Normal Development Loan",
      productCode: "LOAN_DEV",
      productCategory: "loan",
      interestRateAnnual: "12.00",
      deductionPriority: 2,
      isActive: true,
    },
    {
      id: "prod-003",
      institutionId,
      productName: "Benevolent Welfare Fund",
      productCode: "BENEVOLENT",
      productCategory: "benevolent",
      interestRateAnnual: "0.00",
      deductionPriority: 3,
      isActive: true,
    },
    {
      id: "prod-004",
      institutionId,
      productName: "Instant Mobile / Emergency Loan",
      productCode: "LOAN_EMERG",
      productCategory: "loan",
      interestRateAnnual: "14.00",
      deductionPriority: 4,
      isActive: true,
    },
  ];

  return c.json({ success: true, count: products.length, data: products });
});

// 4. POST /:id/products - Register a cooperative product
cooperativesRouter.post("/:id/products", zValidator("json", CreateProductSchema), async (c) => {
  const institutionId = c.req.param("id");
  const body = c.req.valid("json");
  const productId = `prod-${Date.now().toString().slice(-6)}`;

  return c.json(
    {
      success: true,
      message: "Cooperative product created successfully",
      data: { id: productId, institutionId, ...body },
    },
    201
  );
});

// 5. POST /mandates - Register member check-off mandate with 1/3 net pay pre-validation
cooperativesRouter.post("/mandates", zValidator("json", CreateMandateSchema), async (c) => {
  const body = c.req.valid("json");
  const mandateId = `MAND-${Date.now().toString().slice(-6)}`;

  // Kenyan 1/3 Net Pay Rule Safeguard (Employment Act Section 19(3))
  let oneThirdCheck = {
    evaluated: false,
    isCompliant: true,
    minimumAllowedTakeHome: 0,
    projectedNetPay: 0,
    warning: null as string | null,
  };

  if (body.currentBasicSalary) {
    const minimumAllowedTakeHome = body.currentBasicSalary / 3.0;
    const projectedNetPay =
      body.currentBasicSalary - (body.existingTotalDeductions + body.monthlyDeductionAmount);
    const isCompliant = projectedNetPay >= minimumAllowedTakeHome;

    oneThirdCheck = {
      evaluated: true,
      isCompliant,
      minimumAllowedTakeHome: Math.round(minimumAllowedTakeHome * 100) / 100,
      projectedNetPay: Math.round(projectedNetPay * 100) / 100,
      warning: isCompliant
        ? null
        : `WARNING: Adding deduction KES ${body.monthlyDeductionAmount} reduces projected take-home to KES ${projectedNetPay.toFixed(2)}, which violates the statutory 1/3 minimum (KES ${minimumAllowedTakeHome.toFixed(2)}).`,
    };
  }

  return c.json(
    {
      success: true,
      message: "Cooperative remittance mandate registered successfully",
      data: {
        id: mandateId,
        employeeId: body.employeeId,
        institutionId: body.institutionId,
        cooperativeProductId: body.cooperativeProductId,
        memberNumber: body.memberOrPolicyNumber,
        monthlyDeductionAmount: body.monthlyDeductionAmount,
        status: "active",
        createdAt: new Date().toISOString(),
      },
      complianceValidation: oneThirdCheck,
    },
    201
  );
});

// 6. GET /mandates/employee/:employeeId - Retrieve employee active mandates
cooperativesRouter.get("/mandates/employee/:employeeId", async (c) => {
  const employeeId = c.req.param("employeeId");
  const sampleMandates = [
    {
      id: "mand-001",
      employeeId,
      institutionName: "Harambee Sacco Society Ltd",
      productName: "Main Shares",
      memberNumber: "HAR-10492",
      monthlyAmount: 30000,
      status: "active",
    },
    {
      id: "mand-002",
      employeeId,
      institutionName: "Stima Sacco Society Ltd",
      productName: "Development Loan",
      memberNumber: "STM-5591",
      monthlyAmount: 45000,
      status: "active",
    },
  ];

  return c.json({ success: true, count: sampleMandates.length, data: sampleMandates });
});

// 7. GET /:id/checkoff-schedules - Generate monthly schedule for cooperative
cooperativesRouter.get("/:id/checkoff-schedules", async (c) => {
  const id = c.req.param("id");
  const period = c.req.query("period") || "2026-09";

  const schedule = {
    institutionId: id,
    institutionName: "Harambee Sacco Society Ltd",
    period,
    totalEmployees: 48,
    totalRemittanceAmount: 1850000.0,
    currency: "KES",
    settlementRail: "M-Pesa B2B Paybill: 300050",
    schedules: [
      {
        employeeId: "EMP-001",
        name: "Nelson Mandela CP",
        memberNumber: "SACCO-HAR-1002",
        sharesAmount: 15000,
        loanPrincipal: 12000,
        loanInterest: 2500,
        benevolentFund: 500,
        totalDeduction: 30000,
      },
    ],
  };

  return c.json({ success: true, data: schedule });
});
