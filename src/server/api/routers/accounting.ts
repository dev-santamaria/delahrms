/**
 * =========================================================================================
 * ACCOUNTING SUB-LEDGER & ERP INTEGRATION ROUTER
 * =========================================================================================
 * Generates double-entry balanced payroll journal vouchers with cost-center splits
 * and exports payloads for corporate ERPs (SAP S/4HANA BAPI & ERPNext Journal Entry).
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";
import {
  calculateEmployeePayroll,
  KENYA_STATUTORY_PRESET,
  EmployeePayrollInput,
} from "../../engines/payroll/engine";
import {
  generatePayrollJournalVoucher,
  formatSapJournalPayload,
  formatErpNextJournalPayload,
} from "../../engines/accounting/subledger";

import {
  chartOfAccounts,
  payrollAccountMappings,
  journalEntries,
  journalLines,
  erpIntegrations,
  erpSyncLogs,
} from "@/db/schema/accounting";

export const accountingRouter = new Hono<AppEnv>();

// 1. POST /generate-journal - Generate double-entry subledger journal voucher
accountingRouter.post(
  "/generate-journal",
  zValidator(
    "json",
    z.object({
      payrollRunNumber: z.string().default("PR-2026-09-001"),
      organizationName: z.string().default("Mandela Group Holding"),
      currency: z.string().default("KES"),
      postingDate: z.string().optional(),
      employees: z.array(z.any()).min(1),
    })
  ),
  async (c) => {
    try {
      const body = c.req.valid("json");
      const organizationId = c.get("organizationId") || "default-org";

      const results = body.employees.map((emp: any) => {
        const allowances = Array.isArray(emp.allowances) ? [...emp.allowances] : [];
        if (emp.housingAllowance) {
          allowances.push({ code: "HOUSE", name: "Housing Allowance", amount: Number(emp.housingAllowance), isTaxable: true });
        }
        if (emp.transportAllowance) {
          allowances.push({ code: "TRANS", name: "Transport Allowance", amount: Number(emp.transportAllowance), isTaxable: true });
        }
        return calculateEmployeePayroll(
          {
            employeeId: emp.employeeId || "EMP-001",
            employeeName: emp.employeeName || "Staff Member",
            basicSalary: Number(emp.basicSalary) || 150000,
            allowances,
            customDeductions: Array.isArray(emp.customDeductions) ? emp.customDeductions : [],
            companyCar: emp.companyCar,
            pensionEnrollment: emp.pensionEnrollment,
            thirdPartyRemittances: Array.isArray(emp.thirdPartyRemittances) ? emp.thirdPartyRemittances : [],
            companyLoanRepayments: Array.isArray(emp.companyLoanRepayments) ? emp.companyLoanRepayments : [],
            costCenter: emp.costCenter || "CC-CORP-MGMT",
          } as any,
          KENYA_STATUTORY_PRESET
        );
      });

      const voucher = generatePayrollJournalVoucher({
        organizationId,
        organizationName: body.organizationName,
        currency: body.currency,
        payrollRunNumber: body.payrollRunNumber,
        postingDate: body.postingDate || new Date().toISOString().split("T")[0],
        results,
      });

      const sapPayload = formatSapJournalPayload(voucher);
      const erpNextPayload = formatErpNextJournalPayload(voucher, body.organizationName);

      return c.json({
        success: true,
        voucher,
        erpPayloads: {
          sap: sapPayload,
          erpnext: erpNextPayload,
        },
      });
    } catch (err: any) {
      return c.json({ success: false, error: err.message || "Failed to generate journal" }, 500);
    }
  }
);

// 2. POST /export-erp - Export formatted payload for ERP
accountingRouter.post(
  "/export-erp",
  zValidator(
    "json",
    z.object({
      targetErp: z.enum(["sap_s4hana", "erpnext", "oracle_netsuite"]),
      journalVoucher: z.any(),
    })
  ),
  async (c) => {
    const { targetErp, journalVoucher } = c.req.valid("json");

    if (targetErp === "sap_s4hana") {
      const payload = formatSapJournalPayload(journalVoucher);
      return c.json({ success: true, targetErp, payload });
    } else {
      const payload = formatErpNextJournalPayload(journalVoucher, "Mandela Group Holding");
      return c.json({ success: true, targetErp, payload });
    }
  }
);

// 3. GET /chart-of-accounts - Query General Ledger chart of accounts
accountingRouter.get("/chart-of-accounts", async (c) => {
  const sampleAccounts = [
    { id: "coa-400100", accountCode: "400100", accountName: "Basic Salaries & Wages Expense", accountType: "expense", currency: "KES", isActive: true },
    { id: "coa-400200", accountCode: "400200", accountName: "Housing & Transport Allowances Expense", accountType: "expense", currency: "KES", isActive: true },
    { id: "coa-400310", accountCode: "400310", accountName: "Employer NSSF Pension Contribution", accountType: "expense", currency: "KES", isActive: true },
    { id: "coa-400320", accountCode: "400320", accountName: "Employer Housing Levy Expense", accountType: "expense", currency: "KES", isActive: true },
    { id: "coa-200100", accountCode: "200100", accountName: "PAYE Tax Liability Payable (KRA)", accountType: "liability", currency: "KES", isActive: true },
    { id: "coa-200200", accountCode: "200200", accountName: "SHIF Health Insurance Payable", accountType: "liability", currency: "KES", isActive: true },
    { id: "coa-200300", accountCode: "200300", accountName: "Net Salaries Payable Disbursal Account", accountType: "liability", currency: "KES", isActive: true },
  ];
  return c.json({ success: true, count: sampleAccounts.length, data: sampleAccounts });
});

// 4. GET /account-mappings - Query payroll component to GL account mappings
accountingRouter.get("/account-mappings", async (c) => {
  const sampleMappings = [
    { id: "map-01", payrollComponent: "basic_salary", debitAccountCode: "400100", creditAccountCode: "200300" },
    { id: "map-02", payrollComponent: "paye_tax", debitAccountCode: "400100", creditAccountCode: "200100" },
    { id: "map-03", payrollComponent: "nssf_pension", debitAccountCode: "400310", creditAccountCode: "200310" },
  ];
  return c.json({ success: true, count: sampleMappings.length, data: sampleMappings });
});

