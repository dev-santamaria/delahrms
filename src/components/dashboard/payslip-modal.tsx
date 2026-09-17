"use client";

import React from "react";
import { X, Printer, Download, ShieldCheck, CheckCircle2 } from "lucide-react";
import { CalculatedPayrollResult } from "@/server/engines/payroll/engine";

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeData: CalculatedPayrollResult;
  organizationName: string;
  currency: string;
  payPeriod: string;
}

export function PayslipModal({
  isOpen,
  onClose,
  employeeData,
  organizationName,
  currency,
  payPeriod,
}: PayslipModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-zinc-100">Official Digital Payslip</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified & Finalized
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              title="Print Payslip"
            >
              <Printer className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Payslip Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-zinc-300">
          {/* Company & Employee Overview Header */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-white tracking-tight">{organizationName}</p>
              <p className="text-zinc-400">PIN: P051234567Z • Registration: CPR/2026/89124</p>
              <p className="text-zinc-400">Upper Hill Commercial Center, Nairobi, Kenya</p>
            </div>
            <div className="sm:text-right">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Pay Period: {payPeriod}
              </span>
              <p className="text-zinc-400 mt-1 font-mono">Payslip Ref: PS-2026-09-{employeeData.employeeId.slice(-4)}</p>
            </div>
          </div>

          {/* Employee Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
            <div>
              <p className="text-zinc-400 text-[10px] uppercase">Employee Name</p>
              <p className="font-semibold text-zinc-200">{employeeData.employeeName}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-[10px] uppercase">Employee ID</p>
              <p className="font-semibold text-zinc-200">{employeeData.employeeId}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-[10px] uppercase">KRA PIN / SHA</p>
              <p className="font-semibold text-zinc-200">A015829104K</p>
            </div>
            <div>
              <p className="text-zinc-400 text-[10px] uppercase">Bank Account</p>
              <p className="font-semibold text-zinc-200">KCB Bank •••• 4912</p>
            </div>
          </div>

          {/* Earnings & Deductions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings Column */}
            <div className="space-y-3">
              <h3 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-800 pb-1.5">
                <span className="text-emerald-400">●</span> Gross Earnings
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between py-1">
                  <span className="text-zinc-300">Basic Salary</span>
                  <span className="font-mono text-zinc-200">{currency} {employeeData.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-300">Housing Allowance</span>
                  <span className="font-mono text-zinc-200">{currency} {employeeData.totalAllowances.toLocaleString()}</span>
                </div>
                {employeeData.totalReimbursements > 0 && (
                  <div className="flex justify-between py-1 text-emerald-400 bg-emerald-500/5 px-2 rounded border border-emerald-500/10">
                    <span>Approved Expense Reimbursement (Tax-Free)</span>
                    <span className="font-mono font-medium">+{currency} {employeeData.totalReimbursements.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-t border-zinc-800 font-semibold text-zinc-100">
                  <span>Total Gross Earnings</span>
                  <span className="font-mono text-emerald-400">{currency} {employeeData.grossPay.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="space-y-3">
              <h3 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-800 pb-1.5">
                <span className="text-rose-400">●</span> Statutory & Voluntary Deductions
              </h3>
              <div className="space-y-1.5">
                <div className="flex justify-between py-0.5">
                  <span className="text-zinc-300">KRA PAYE Income Tax</span>
                  <span className="font-mono text-zinc-200">{currency} {employeeData.payeTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-zinc-300">NSSF Pension (Tier I + II)</span>
                  <span className="font-mono text-zinc-200">{currency} {employeeData.nssfEmployee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-zinc-300">SHIF Social Health Insurance (2.75%)</span>
                  <span className="font-mono text-zinc-200">{currency} {employeeData.shifEmployee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-zinc-300">Affordable Housing Levy (1.5%)</span>
                  <span className="font-mono text-zinc-200">{currency} {employeeData.housingLevyEmployee.toLocaleString()}</span>
                </div>

                {employeeData.totalLoanRepayments > 0 && (
                  <div className="flex justify-between py-0.5 text-amber-300 bg-amber-500/5 px-1.5 rounded">
                    <span>Company Staff Loan Deduction</span>
                    <span className="font-mono">-{currency} {employeeData.totalLoanRepayments.toLocaleString()}</span>
                  </div>
                )}

                {employeeData.totalThirdPartyRemittances > 0 && (
                  <div className="flex justify-between py-0.5 text-indigo-300 bg-indigo-500/5 px-1.5 rounded">
                    <span>Third-Party Check-offs (Britam + SACCO)</span>
                    <span className="font-mono">-{currency} {employeeData.totalThirdPartyRemittances.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between py-2 border-t border-zinc-800 font-semibold text-zinc-100">
                  <span>Total Deductions</span>
                  <span className="font-mono text-rose-400">-{currency} {employeeData.totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tax Relief Footnote */}
          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/60 text-[11px] text-zinc-400 space-y-1">
            <p className="font-medium text-zinc-300">Statutory Tax Reliefs Applied:</p>
            <p>• Monthly Personal Relief: <span className="font-mono text-zinc-200">{currency} {employeeData.personalRelief.toLocaleString()}</span></p>
            <p>• Insurance / SHIF Relief (15%): <span className="font-mono text-zinc-200">{currency} {employeeData.insuranceRelief.toLocaleString()}</span></p>
          </div>

          {/* Net Pay Callout */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-zinc-400 text-xs font-medium">Net Disbursable Pay to Employee</p>
              <p className="text-2xl font-black text-emerald-400 tracking-tight font-mono">
                {currency} {employeeData.netPay.toLocaleString()}
              </p>
              <p className="text-[11px] text-zinc-400">Direct Deposit scheduled to KCB Bank • Settlement via Central Bank ACH</p>
            </div>
            <div className="text-right">
              <p className="text-zinc-400 text-xs">Total Cost to Company (CTC)</p>
              <p className="text-lg font-bold text-zinc-200 font-mono">
                {currency} {employeeData.costToCompany.toLocaleString()}
              </p>
              <p className="text-[10px] text-zinc-400">Includes ER NSSF ({currency} {employeeData.nssfEmployer}) + ER Housing Levy ({currency} {employeeData.housingLevyEmployer})</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/50 flex justify-between items-center text-xs">
          <span className="text-zinc-400 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Digitally certified by Mandela Payroll Engine v2.6
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
