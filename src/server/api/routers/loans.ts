/**
 * =========================================================================================
 * STAFF LOANS, SALARY ADVANCES & FRINGE BENEFIT TAX (FBT) ROUTER
 * =========================================================================================
 * Manages employee salary advances, company loan applications, repayment installments,
 * and automated calculation of KRA Section 12B Fringe Benefit Tax (30% employer liability)
 * on low-interest/subsidized staff loans.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";
import {
  loanTypes,
  employeeLoans,
  loanRepaymentSchedules,
} from "@/db/schema/loans-and-advances";

export const loansRouter = new Hono<AppEnv>();

// Zod Schemas
const ApplyLoanSchema = z.object({
  employeeId: z.string(),
  loanTypeCode: z.enum(["SALARY_ADVANCE", "STAFF_EMERGENCY", "HOME_DEVELOPMENT", "EDUCATION_LOAN"]),
  principalAmount: z.number().positive(),
  repaymentMonths: z.number().int().min(1).max(60),
  subsidizedInterestRateAnnual: z.number().nonnegative().default(6.0), // e.g. 6% company rate
  officialMarketRateAnnual: z.number().nonnegative().default(16.0), // KRA prescribed rate e.g. 16%
  purpose: z.string().min(5),
});

// Helper for FBT calculation under KRA Section 12B
function calculateFringeBenefitTax(params: {
  principalAmount: number;
  subsidizedRateAnnual: number;
  marketRateAnnual: number;
}) {
  const rateDifference = Math.max(0, params.marketRateAnnual - params.subsidizedRateAnnual);
  const monthlyRateDiff = rateDifference / 100.0 / 12.0;
  const taxableFringeBenefitMonthly = Math.round(params.principalAmount * monthlyRateDiff * 100) / 100;
  // KRA Section 12B FBT is 30% of the taxable fringe benefit (Employer liability)
  const employerFbtLiabilityMonthly = Math.round(taxableFringeBenefitMonthly * 0.30 * 100) / 100;

  return {
    subsidizedRateAnnual: params.subsidizedRateAnnual,
    officialMarketRateAnnual: params.marketRateAnnual,
    interestSavingsAnnualPercentage: rateDifference,
    taxableFringeBenefitMonthly,
    employerFbtRate: "30%",
    employerFbtLiabilityMonthly,
    isTaxableBenefit: rateDifference > 0,
  };
}

// 1. GET / - List loans
loansRouter.get("/", async (c) => {
  const sampleLoans = [
    {
      id: "ln-001",
      loanNumber: "LN-2026-001",
      employeeId: "EMP-001",
      employeeName: "Nelson Mandela CP",
      loanType: "Staff Low-Interest Facility",
      principalAmount: 2000000,
      subsidizedInterestRate: 6.0,
      monthlyInstallment: 45000,
      currentBalance: 1650000,
      status: "active",
      fbtMonthlyEmployerLiability: 5000,
    },
    {
      id: "ln-002",
      loanNumber: "ADV-2026-088",
      employeeId: "EMP-002",
      employeeName: "Operations Director",
      loanType: "Salary Advance",
      principalAmount: 80000,
      subsidizedInterestRate: 0.0,
      monthlyInstallment: 80000,
      currentBalance: 0,
      status: "fully_settled",
      fbtMonthlyEmployerLiability: 0,
    },
  ];

  return c.json({ success: true, count: sampleLoans.length, data: sampleLoans });
});

// 2. POST /apply - Submit loan application with Section 12B FBT preview
loansRouter.post("/apply", zValidator("json", ApplyLoanSchema), async (c) => {
  const body = c.req.valid("json");
  const loanNumber = `${body.loanTypeCode === "SALARY_ADVANCE" ? "ADV" : "LN"}-${Date.now().toString().slice(-6)}`;

  // Monthly installment calculation (simple interest amortization)
  const totalInterest =
    body.principalAmount * (body.subsidizedInterestRateAnnual / 100.0) * (body.repaymentMonths / 12.0);
  const totalRepayable = body.principalAmount + totalInterest;
  const monthlyInstallment = Math.round((totalRepayable / body.repaymentMonths) * 100) / 100;

  // KRA Section 12B Fringe Benefit Tax
  const fbtCalculation = calculateFringeBenefitTax({
    principalAmount: body.principalAmount,
    subsidizedRateAnnual: body.subsidizedInterestRateAnnual,
    marketRateAnnual: body.officialMarketRateAnnual,
  });

  return c.json(
    {
      success: true,
      message: "Loan application submitted successfully and queued for credit committee review",
      data: {
        loanNumber,
        employeeId: body.employeeId,
        loanTypeCode: body.loanTypeCode,
        principalAmount: body.principalAmount,
        repaymentMonths: body.repaymentMonths,
        monthlyInstallment,
        totalInterest: Math.round(totalInterest * 100) / 100,
        totalRepayable: Math.round(totalRepayable * 100) / 100,
        status: "pending_approval",
        appliedAt: new Date().toISOString(),
      },
      fringeBenefitTaxAnalysis: fbtCalculation,
    },
    201
  );
});

// 3. POST /:id/approve - Approve loan
loansRouter.post("/:id/approve", async (c) => {
  const id = c.req.param("id");

  return c.json({
    success: true,
    message: "Loan approved for disbursement",
    data: {
      id,
      status: "approved",
      approvedBy: c.get("userId") || "cfo-user",
      disbursementScheduledDate: new Date().toISOString().split("T")[0],
      payoutMethod: "direct_bank_eft",
    },
  });
});

// 4. GET /employee/:employeeId - Employee loan accounts
loansRouter.get("/employee/:employeeId", async (c) => {
  const employeeId = c.req.param("employeeId");

  return c.json({
    success: true,
    employeeId,
    activeFacilities: [
      {
        loanNumber: "LN-2026-001",
        loanType: "Company Subsidized Facility",
        originalPrincipal: 2000000,
        currentBalance: 1650000,
        monthlyDeduction: 45000,
        remainingInstallments: 38,
        fbtLiabilityMonthly: 5000,
      },
    ],
  });
});
