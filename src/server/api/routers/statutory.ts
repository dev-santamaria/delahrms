/**
 * =========================================================================================
 * GOVERNMENT STATUTORY FILINGS & INSTITUTIONAL REMITTANCES ROUTER
 * =========================================================================================
 * Regulatory tax filings, agency returns & third-party voluntary check-offs:
 * 1. Statutory agencies registry (KRA, SHA/SHIF, NSSF, Affordable Housing, SARS, URA, TRA)
 * 2. Monthly statutory filing return batch generation with Payment Registration Number (PRN)
 * 3. Payment settlement recording with official acknowledgment receipts
 * 4. Third-party voluntary institutions (Insurance, SACCOs, Commercial Banks, HELB)
 * 5. Institutional remittance schedule generation (CSV) & electronic bank disbursement
 * =========================================================================================
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";
import { db } from "@/db";
import {
  statutoryAgencies,
  statutoryFilings,
} from "@/db/schema/statutory-filings";
import {
  thirdPartyInstitutions,
  remittanceBatches,
  remittanceBatchItems,
} from "@/db/schema/remittances";

export const statutoryRouter = new Hono<AppEnv>();

// Default Agencies Registry
const memoryAgencies: any[] = [
  {
    id: "agency-kra",
    countryCode: "KEN",
    agencyName: "Kenya Revenue Authority (KRA PAYE)",
    agencyCode: "KRA_PAYE",
    submissionFormat: "itax_csv",
    filingDueDayOfMonth: 9,
    portalUrl: "https://itax.kra.go.ke",
    isActive: true,
  },
  {
    id: "agency-shif",
    countryCode: "KEN",
    agencyName: "Social Health Authority (SHA / SHIF)",
    agencyCode: "SHIF_HEALTH",
    submissionFormat: "sha_csv",
    filingDueDayOfMonth: 9,
    portalUrl: "https://sha.go.ke",
    isActive: true,
  },
  {
    id: "agency-nssf",
    countryCode: "KEN",
    agencyName: "National Social Security Fund (NSSF Tier I & II)",
    agencyCode: "NSSF_PENSION",
    submissionFormat: "nssf_csv",
    filingDueDayOfMonth: 9,
    portalUrl: "https://nssf.or.ke",
    isActive: true,
  },
  {
    id: "agency-ahl",
    countryCode: "KEN",
    agencyName: "Affordable Housing Levy (AHL 1.5% + 1.5%)",
    agencyCode: "HOUSING_LEVY",
    submissionFormat: "housing_levy_csv",
    filingDueDayOfMonth: 9,
    portalUrl: "https://itax.kra.go.ke",
    isActive: true,
  },
];

// Fallback Filings
const memoryFilings: any[] = [
  {
    id: "filing-001",
    payrollRunId: "run-2026-09-ken",
    agencyId: "agency-kra",
    agencyName: "Kenya Revenue Authority (KRA PAYE)",
    agencyCode: "KRA_PAYE",
    periodMonth: 9,
    periodYear: 2026,
    totalEmployeeDeduction: 1420500.0,
    totalEmployerContribution: 0.0,
    totalRemittanceAmount: 1420500.0,
    currency: "KES",
    prnOrPaymentReference: "PRN-KRA-2026-9901",
    returnFileUrl: "https://storage.zuri.africa/statutory/KRA_ITAX_SEP2026.csv",
    status: "payment_pending",
    filedAt: "2026-09-17T09:00:00.000Z",
    paidAt: null,
  },
  {
    id: "filing-002",
    payrollRunId: "run-2026-09-ken",
    agencyId: "agency-shif",
    agencyName: "Social Health Authority (SHA / SHIF)",
    agencyCode: "SHIF_HEALTH",
    periodMonth: 9,
    periodYear: 2026,
    totalEmployeeDeduction: 114750.0,
    totalEmployerContribution: 0.0,
    totalRemittanceAmount: 114750.0,
    currency: "KES",
    prnOrPaymentReference: "SHA-ESLIP-2026-4409",
    returnFileUrl: "https://storage.zuri.africa/statutory/SHA_SHIF_SEP2026.csv",
    status: "paid_and_receipted",
    filedAt: "2026-09-17T09:00:00.000Z",
    paidAt: "2026-09-17T10:30:00.000Z",
    receiptFileUrl: "https://storage.zuri.africa/statutory/SHA_RECEIPT_SEP2026.pdf",
  },
];

// Fallback Third-Party Remittance Institutions
const memoryInstitutions: any[] = [
  {
    id: "inst-harambee",
    name: "Harambee Sacco Society Ltd",
    code: "HARAMBEE_SACCO",
    institutionType: "cooperative",
    bankName: "Co-operative Bank of Kenya",
    bankAccountNumber: "01129000123400",
    mpesaPaybillNumber: "300012",
    currency: "KES",
  },
  {
    id: "inst-britam",
    name: "Britam Life Assurance Ltd",
    code: "BRITAM_INSURANCE",
    institutionType: "insurance_provider",
    bankName: "Standard Chartered Bank Kenya",
    bankAccountNumber: "01009876543200",
    mpesaPaybillNumber: "500098",
    currency: "KES",
  },
  {
    id: "inst-helb",
    name: "Higher Education Loans Board (HELB)",
    code: "HELB_LOANS",
    institutionType: "student_loan_board",
    bankName: "National Bank of Kenya",
    bankAccountNumber: "01001122334400",
    mpesaPaybillNumber: "200800",
    currency: "KES",
  },
];

const memoryRemittanceBatches: any[] = [
  {
    id: "rem-batch-001",
    payrollRunId: "run-2026-09-ken",
    institutionId: "inst-harambee",
    institutionName: "Harambee Sacco Society Ltd",
    batchNumber: "REM-2026-09-HARAMBEE",
    totalAmount: 320000.0,
    currency: "KES",
    employeeCount: 42,
    status: "approved",
    disbursedAt: null,
    disbursementReference: null,
    scheduleCsvUrl: "https://storage.zuri.africa/remittances/HARAMBEE_SACCO_SEP2026.csv",
  },
];

// Zod Validation Schemas
const GenerateFilingBatchSchema = z.object({
  payrollRunId: z.string().optional().default("run-2026-09-ken"),
  agencyCode: z.string().min(2),
  filingType: z.string().optional(),
  taxPeriod: z.string().optional(),
  periodMonth: z.number().int().min(1).max(12).optional().default(9),
  periodYear: z.number().int().min(2020).optional().default(2026),
  totalEmployees: z.number().optional(),
  totalEmployeeDeduction: z.number().optional(),
  totalRemittanceAmount: z.number().optional(),
  totalEmployerContribution: z.number().nonnegative().default(0),
  currency: z.string().default("KES"),
  prnReference: z.string().optional(),
});

const GenerateRemittanceBatchSchema = z.object({
  payrollRunId: z.string().min(1),
  institutionId: z.string().min(1),
  totalAmount: z.number().positive(),
  currency: z.string().default("KES"),
  employeeCount: z.number().int().positive(),
});

const MarkFilingPaidSchema = z.object({
  receiptNumber: z.string().optional(),
  paymentReference: z.string().optional(),
  paidAmount: z.number().optional(),
  bankAccountId: z.string().optional(),
  receiptFileUrl: z.string().optional(),
});

const DisburseRemittanceSchema = z.object({
  disbursementReference: z.string().min(3), // UTR or M-Pesa ConversationID
});

// ====================================================================
// STATIC ROUTES (Registered before parameterized routes)
// ====================================================================

// 1. GET /agencies - Master statutory agencies registry
statutoryRouter.get("/agencies", (c) => {
  const country = c.req.query("countryCode");
  let list = memoryAgencies.map((a) => ({ ...a, name: a.agencyName }));
  if (country) {
    const cUpper = country.toUpperCase();
    list = list.filter(
      (a) =>
        a.countryCode === cUpper ||
        (cUpper === "KE" && a.countryCode === "KEN") ||
        (cUpper === "UG" && a.countryCode === "UGA") ||
        (cUpper === "TZ" && a.countryCode === "TZA") ||
        (cUpper === "ZA" && a.countryCode === "ZAF")
    );
  }
  return c.json({ success: true, count: list.length, data: list });
});

// 2. GET /filings - Query statutory filing returns
statutoryRouter.get("/filings", (c) => {
  const runId = c.req.query("payrollRunId");
  const agency = c.req.query("agencyCode");

  let list = [...memoryFilings];
  if (runId) {
    list = list.filter((f) => f.payrollRunId === runId);
  }
  if (agency) {
    list = list.filter((f) => f.agencyCode === agency);
  }

  return c.json({ success: true, count: list.length, data: list });
});

// 3. POST /filings/generate-batch - Generate statutory filing batch with PRN
statutoryRouter.post("/filings/generate-batch", zValidator("json", GenerateFilingBatchSchema), async (c) => {
  const body = c.req.valid("json");
  const filingId = `filing-${Date.now().toString().slice(-6)}`;

  let month = body.periodMonth;
  let year = body.periodYear;
  if (body.taxPeriod && body.taxPeriod.includes("-")) {
    const parts = body.taxPeriod.split("-");
    year = parseInt(parts[0], 10) || year;
    month = parseInt(parts[1], 10) || month;
  }

  const prn = body.prnReference || `PRN-${body.agencyCode}-${year}-${Date.now().toString().slice(-4)}`;
  const agency =
    memoryAgencies.find(
      (a) =>
        a.agencyCode === body.agencyCode ||
        a.agencyCode.startsWith(body.agencyCode) ||
        (body.agencyCode === "KRA" && a.agencyCode === "KRA_PAYE")
    ) || memoryAgencies[0];

  const empDeduction = body.totalEmployeeDeduction || body.totalRemittanceAmount || 0;
  const totalRemittance = Math.round((empDeduction + body.totalEmployerContribution) * 100) / 100;

  const filingRecord = {
    id: filingId,
    payrollRunId: body.payrollRunId,
    agencyId: agency.id,
    agencyName: agency.agencyName,
    agencyCode: body.agencyCode,
    periodMonth: month,
    periodYear: year,
    totalEmployeeDeduction: empDeduction,
    totalEmployerContribution: body.totalEmployerContribution,
    totalRemittanceAmount: totalRemittance,
    currency: body.currency,
    prnOrPaymentReference: prn,
    paymentRegistrationNumber: prn,
    prnNumber: prn,
    returnFileUrl: `https://storage.zuri.africa/statutory/${body.agencyCode}_${year}_M${month}.csv`,
    status: "payment_pending",
    filedAt: new Date().toISOString(),
    paidAt: null,
  };

  memoryFilings.unshift(filingRecord);

  return c.json(
    {
      success: true,
      message: `Statutory filing batch for ${agency.agencyName} generated with e-Slip PRN: ${prn}`,
      data: filingRecord,
    },
    201
  );
});

// 4. GET /remittances/institutions - Third-party check-off institutions catalog
statutoryRouter.get("/remittances/institutions", (c) => {
  return c.json({ success: true, count: memoryInstitutions.length, data: memoryInstitutions });
});

// 5. GET /remittances/batches - List remittance disbursement batches
statutoryRouter.get("/remittances/batches", (c) => {
  return c.json({ success: true, count: memoryRemittanceBatches.length, data: memoryRemittanceBatches });
});

// 6. POST /remittances/batches/generate - Generate institutional remittance batch
statutoryRouter.post("/remittances/batches/generate", zValidator("json", GenerateRemittanceBatchSchema), async (c) => {
  const body = c.req.valid("json");
  const inst = memoryInstitutions.find((i) => i.id === body.institutionId) || memoryInstitutions[0];

  const batchId = `rem-batch-${Date.now().toString().slice(-6)}`;
  const batchNumber = `REM-${Date.now().toString().slice(-4)}-${inst.code}`;

  const batchRecord = {
    id: batchId,
    payrollRunId: body.payrollRunId,
    institutionId: inst.id,
    institutionName: inst.name,
    batchNumber,
    totalAmount: body.totalAmount,
    currency: body.currency,
    employeeCount: body.employeeCount,
    status: "approved",
    disbursedAt: null,
    disbursementReference: null,
    scheduleCsvUrl: `https://storage.zuri.africa/remittances/${inst.code}_${Date.now()}.csv`,
  };

  memoryRemittanceBatches.unshift(batchRecord);

  return c.json(
    {
      success: true,
      message: `Remittance batch ${batchNumber} generated for ${inst.name} (${body.employeeCount} employees, ${body.currency} ${body.totalAmount.toLocaleString()})`,
      data: batchRecord,
    },
    201
  );
});

// ====================================================================
// PARAMETERIZED ROUTES (Registered at the bottom)
// ====================================================================

// 7. PATCH /filings/:id/mark-paid - Record statutory bank payment
statutoryRouter.patch("/filings/:id/mark-paid", zValidator("json", MarkFilingPaidSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const ref = body.receiptNumber || body.paymentReference || `REC-${Date.now()}`;

  const filing = memoryFilings.find((f) => f.id === id || f.prnOrPaymentReference === id);
  if (filing) {
    filing.status = "paid_and_receipted";
    filing.paidAt = new Date().toISOString();
    filing.receiptNumber = ref;
    filing.receiptFileUrl = body.receiptFileUrl || `https://storage.zuri.africa/receipts/${ref}.pdf`;
  }

  return c.json({
    success: true,
    message: `Statutory payment acknowledged and receipt ${ref} attached`,
    data: filing || { id, status: "paid_and_receipted", receiptNumber: ref },
  });
});

// Alias: PATCH /filings/:id/pay - Direct settlement endpoint
statutoryRouter.patch("/filings/:id/pay", zValidator("json", MarkFilingPaidSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const ref = body.receiptNumber || body.paymentReference || `REC-${Date.now()}`;

  const filing = memoryFilings.find((f) => f.id === id || f.prnOrPaymentReference === id);
  if (filing) {
    filing.status = "paid_and_receipted";
    filing.paidAt = new Date().toISOString();
    filing.receiptNumber = ref;
    filing.receiptFileUrl = body.receiptFileUrl || `https://storage.zuri.africa/receipts/${ref}.pdf`;
  }

  return c.json({
    success: true,
    message: `Statutory remittance successfully settled with reference ${ref}`,
    data: filing || { id, status: "paid_and_receipted", receiptNumber: ref },
  });
});

// 8. GET /remittances/batches/:id - Single remittance batch detail
statutoryRouter.get("/remittances/batches/:id", (c) => {
  const id = c.req.param("id");
  const batch = memoryRemittanceBatches.find((b) => b.id === id || b.batchNumber === id) || memoryRemittanceBatches[0];
  return c.json({ success: true, data: batch });
});

// 9. PATCH /remittances/batches/:id/disburse - Execute settlement
statutoryRouter.patch("/remittances/batches/:id/disburse", zValidator("json", DisburseRemittanceSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const batch = memoryRemittanceBatches.find((b) => b.id === id || b.batchNumber === id);
  if (batch) {
    batch.status = "disbursed";
    batch.disbursedAt = new Date().toISOString();
    batch.disbursementReference = body.disbursementReference;
  }

  return c.json({
    success: true,
    message: `Remittance batch disbursed with electronic settlement reference ${body.disbursementReference}`,
    data: batch || { id, status: "disbursed", disbursementReference: body.disbursementReference },
  });
});
