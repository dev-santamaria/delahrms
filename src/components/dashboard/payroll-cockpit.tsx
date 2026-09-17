"use client";

import React, { useState } from "react";
import {
  DollarSign,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldAlert,
  Send,
  Eye,
  RefreshCw,
} from "lucide-react";
import { CalculatedPayrollResult } from "@/server/engines/payroll/engine";
import { PayslipModal } from "./payslip-modal";

interface PayrollCockpitProps {
  results: CalculatedPayrollResult[];
  organizationName: string;
  currency: string;
  onGenerateReturns: () => void;
  isGeneratingReturns: boolean;
  onExportCsv: (type: "kra" | "shif" | "nssf" | "housing") => void;
}

export function PayrollCockpit({
  results,
  organizationName,
  currency,
  onGenerateReturns,
  isGeneratingReturns,
  onExportCsv,
}: PayrollCockpitProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<CalculatedPayrollResult | null>(null);

  // Aggregations
  const totalGross = results.reduce((acc, r) => acc + r.grossPay, 0);
  const totalNet = results.reduce((acc, r) => acc + r.netPay, 0);
  const totalPaye = results.reduce((acc, r) => acc + r.payeTax, 0);
  const totalShif = results.reduce((acc, r) => acc + r.shifEmployee, 0);
  const totalNssf = results.reduce((acc, r) => acc + r.nssfEmployee + r.nssfEmployer, 0);
  const totalHousing = results.reduce((acc, r) => acc + r.housingLevyEmployee + r.housingLevyEmployer, 0);
  const totalRemittances = results.reduce((acc, r) => acc + r.totalThirdPartyRemittances, 0);
  const totalLoans = results.reduce((acc, r) => acc + r.totalLoanRepayments, 0);
  const totalReimbursements = results.reduce((acc, r) => acc + r.totalReimbursements, 0);
  const totalCtc = results.reduce((acc, r) => acc + r.costToCompany, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner: Cycle Status & Action Header */}
      <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-lg font-bold text-white tracking-tight">Active Payroll Run: September 2026</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Ready for Settlement
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Entity: <span className="text-zinc-200 font-medium">{organizationName}</span> • Standard Kenya Statutory Engine Active
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onGenerateReturns}
            disabled={isGeneratingReturns}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition border border-zinc-700 shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isGeneratingReturns ? "animate-spin" : ""}`} />
            <span>Recalculate Anomalies</span>
          </button>

          <button
            onClick={() => onExportCsv("kra")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-lg shadow-indigo-500/20"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Export KRA iTax CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Gross Pay */}
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
          <p className="text-xs font-medium text-zinc-400">Total Gross Workforce Pay</p>
          <p className="text-2xl font-black text-white mt-1 font-mono">{currency} {totalGross.toLocaleString()}</p>
          <p className="text-[10px] text-zinc-400 mt-1">3 Active Employees on Payroll</p>
        </div>

        {/* Net Disbursable Pay */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/30 to-zinc-900/50 border border-emerald-500/30">
          <p className="text-xs font-medium text-emerald-400">Net Disbursable Salaries</p>
          <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">{currency} {totalNet.toLocaleString()}</p>
          <p className="text-[10px] text-zinc-400 mt-1">ACH Central Bank Batch Ready</p>
        </div>

        {/* Total PAYE Income Tax */}
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
          <p className="text-xs font-medium text-zinc-400">KRA PAYE Withheld</p>
          <p className="text-2xl font-black text-white mt-1 font-mono">{currency} {totalPaye.toLocaleString()}</p>
          <p className="text-[10px] text-zinc-400 mt-1">Due to KRA by 9th October</p>
        </div>

        {/* Cost to Company */}
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
          <p className="text-xs font-medium text-zinc-400">Total Cost to Company (CTC)</p>
          <p className="text-2xl font-black text-indigo-400 mt-1 font-mono">{currency} {totalCtc.toLocaleString()}</p>
          <p className="text-[10px] text-zinc-400 mt-1">Includes ER NSSF + AHL contributions</p>
        </div>
      </div>

      {/* Statutory & Third-Party Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-xs">
        <div>
          <span className="text-zinc-400 text-[10px] uppercase">SHIF (2.75%)</span>
          <p className="font-semibold text-zinc-200 font-mono">{currency} {totalShif.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-zinc-400 text-[10px] uppercase">NSSF (EE + ER)</span>
          <p className="font-semibold text-zinc-200 font-mono">{currency} {totalNssf.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-zinc-400 text-[10px] uppercase">Housing Levy (EE + ER)</span>
          <p className="font-semibold text-zinc-200 font-mono">{currency} {totalHousing.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-zinc-400 text-[10px] uppercase">Staff Loans Recovered</span>
          <p className="font-semibold text-amber-300 font-mono">{currency} {totalLoans.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-zinc-400 text-[10px] uppercase">Third-Party Remittances</span>
          <p className="font-semibold text-indigo-300 font-mono">{currency} {totalRemittances.toLocaleString()}</p>
        </div>
      </div>

      {/* Official Government Return Files Download Bar */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-900 via-indigo-950/20 to-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-200">Statutory Agency Filing Files (1-Click Portal Upload)</h4>
            <p className="text-[11px] text-zinc-400">
              Compliant CSV exports for Kenya KRA iTax, SHIF / SHA Portal, NSSF e-Service, and Housing Levy
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onExportCsv("kra")}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-medium text-zinc-200 border border-zinc-700 transition flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            <span>KRA iTax</span>
          </button>
          <button
            onClick={() => onExportCsv("shif")}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-medium text-zinc-200 border border-zinc-700 transition flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            <span>SHIF / SHA</span>
          </button>
          <button
            onClick={() => onExportCsv("nssf")}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-medium text-zinc-200 border border-zinc-700 transition flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            <span>NSSF e-Service</span>
          </button>
          <button
            onClick={() => onExportCsv("housing")}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-medium text-zinc-200 border border-zinc-700 transition flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            <span>Housing Levy</span>
          </button>
        </div>
      </div>

      {/* Workforce Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Workforce Payroll Breakdown ({results.length} Employees)
          </h3>
          <span className="text-[11px] text-zinc-400">Click &quot;View Payslip&quot; for detailed breakdown</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 text-zinc-400 text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-3">Gross Salary</th>
                <th className="py-3 px-3">KRA PAYE</th>
                <th className="py-3 px-3">SHIF</th>
                <th className="py-3 px-3">NSSF</th>
                <th className="py-3 px-3">AHL</th>
                <th className="py-3 px-3">Loans / Remittances</th>
                <th className="py-3 px-3">Reimbursements</th>
                <th className="py-3 px-3">Net Disbursable</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {results.map((emp) => (
                <tr key={emp.employeeId} className="hover:bg-zinc-800/30 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-zinc-200">{emp.employeeName}</div>
                    <div className="text-[11px] text-zinc-400 font-mono">{emp.employeeId}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-medium text-zinc-200">
                    {currency} {emp.grossPay.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-zinc-300">
                    {currency} {emp.payeTax.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-zinc-300">
                    {currency} {emp.shifEmployee.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-zinc-300">
                    {currency} {emp.nssfEmployee.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-zinc-300">
                    {currency} {emp.housingLevyEmployee.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    {emp.totalLoanRepayments > 0 || emp.totalThirdPartyRemittances > 0 ? (
                      <span className="text-amber-300">
                        -{currency} {(emp.totalLoanRepayments + emp.totalThirdPartyRemittances).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    {emp.totalReimbursements > 0 ? (
                      <span className="text-emerald-400 font-semibold">
                        +{currency} {emp.totalReimbursements.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                    {currency} {emp.netPay.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedEmployee(emp)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition border border-zinc-700 flex items-center gap-1.5 ml-auto"
                    >
                      <Eye className="h-3 w-3 text-zinc-400" />
                      <span>View Payslip</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Modal */}
      {selectedEmployee && (
        <PayslipModal
          isOpen={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          employeeData={selectedEmployee}
          organizationName={organizationName}
          currency={currency}
          payPeriod="September 2026"
        />
      )}
    </div>
  );
}
