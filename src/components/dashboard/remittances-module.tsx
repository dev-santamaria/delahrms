"use client";

import React, { useState } from "react";
import {
  Building2,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  CreditCard,
  Send,
  ShieldCheck,
  Users,
  Smartphone,
  Check,
} from "lucide-react";

interface Mandate {
  id: string;
  employeeName: string;
  institutionName: string;
  institutionCode: string;
  policyOrMemberNumber: string;
  remittanceType: string;
  monthlyAmount: number;
  currency: string;
  bankDetails: string;
  status: "active" | "paused";
}

interface RemittanceBatch {
  institutionCode: string;
  institutionName: string;
  remittanceType: string;
  employeeCount: number;
  totalAmount: number;
  currency: string;
  bankName: string;
  bankAccount: string;
  disbursalStatus: "ready_to_disburse" | "disbursed";
}

export function RemittancesModule() {
  const [mandates] = useState<Mandate[]>([
    {
      id: "mand-001",
      employeeName: "Nelson Mandela CP",
      institutionName: "Britam Life Assurance Ltd",
      institutionCode: "BRITAM",
      policyOrMemberNumber: "ED-88491-00",
      remittanceType: "Education Policy Monthly Premium",
      monthlyAmount: 2000,
      currency: "KES",
      bankDetails: "KCB Bank Kenya • Acc: 1109283741",
      status: "active",
    },
    {
      id: "mand-002",
      employeeName: "Nelson Mandela CP",
      institutionName: "Harambee SACCO Society",
      institutionCode: "HARAMBEE",
      policyOrMemberNumber: "SACCO-11029",
      remittanceType: "SACCO Monthly Shares & Loan Repayment",
      monthlyAmount: 5000,
      currency: "KES",
      bankDetails: "Cooperative Bank • Acc: 0112938475",
      status: "active",
    },
    {
      id: "mand-003",
      employeeName: "Amina Odhiambo",
      institutionName: "Higher Education Loans Board (HELB)",
      institutionCode: "HELB",
      policyOrMemberNumber: "HELB-28391029",
      remittanceType: "HELB University Loan Deduction",
      monthlyAmount: 4000,
      currency: "KES",
      bankDetails: "National Bank of Kenya • Acc: 0100123984",
      status: "active",
    },
  ]);

  const [batches, setBatches] = useState<RemittanceBatch[]>([
    {
      institutionCode: "BRITAM",
      institutionName: "Britam Life Assurance Ltd",
      remittanceType: "Education Policy",
      employeeCount: 1,
      totalAmount: 2000,
      currency: "KES",
      bankName: "KCB Bank Kenya",
      bankAccount: "1109283741",
      disbursalStatus: "ready_to_disburse",
    },
    {
      institutionCode: "HARAMBEE",
      institutionName: "Harambee SACCO Society",
      remittanceType: "SACCO Shares & Loans",
      employeeCount: 1,
      totalAmount: 5000,
      currency: "KES",
      bankName: "Cooperative Bank of Kenya",
      bankAccount: "0112938475",
      disbursalStatus: "ready_to_disburse",
    },
    {
      institutionCode: "HELB",
      institutionName: "Higher Education Loans Board",
      remittanceType: "HELB Graduate Loan",
      employeeCount: 1,
      totalAmount: 4000,
      currency: "KES",
      bankName: "National Bank of Kenya",
      bankAccount: "0100123984",
      disbursalStatus: "ready_to_disburse",
    },
  ]);

  const [disbursingCode, setDisbursingCode] = useState<string | null>(null);

  const handleDisburse = (code: string) => {
    setDisbursingCode(code);
    setTimeout(() => {
      setBatches((prev) =>
        prev.map((b) => (b.institutionCode === code ? { ...b, disbursalStatus: "disbursed" } : b))
      );
      setDisbursingCode(null);
    }, 1000);
  };

  const handleDownloadCsv = (batch: RemittanceBatch) => {
    const csv = [
      `# Institutional Check-off Remittance Schedule: ${batch.institutionName}`,
      `# Period: September 2026`,
      `# Total Remittance: ${batch.currency} ${batch.totalAmount.toFixed(2)}`,
      `# Bank Account: ${batch.bankName} - ${batch.bankAccount}`,
      `Employee Full Name,National ID,Member / Policy Number,Remittance Amount (KES)`,
      `"Nelson Mandela CP","33891024","${batch.institutionCode === "BRITAM" ? "ED-88491-00" : "SACCO-11029"}",${batch.totalAmount.toFixed(2)}`,
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${batch.institutionCode.toLowerCase()}_checkoff_schedule_sep_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Third-Party Standing Mandates & Check-off Disbursals
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Automated Bank EFT / M-Pesa Disbursals
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Automated payroll deduction and monthly remittance to insurance policies (Britam), SACCOs (Harambee), and HELB
          </p>
        </div>
      </div>

      {/* Disbursal Batches Card */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Institutional Remittance Disbursal Batches (September 2026)
            </h3>
            <p className="text-[11px] text-zinc-400">
              Funds withheld from employee salaries ready for direct institutional payout
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-300">
            Total Withheld: KES {batches.reduce((acc, b) => acc + b.totalAmount, 0).toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {batches.map((batch) => (
            <div
              key={batch.institutionCode}
              className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400">{batch.institutionCode}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      batch.disbursalStatus === "disbursed"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {batch.disbursalStatus === "disbursed" ? "Disbursed to Bank" : "Pending Disbursal"}
                  </span>
                </div>
                <h4 className="font-semibold text-zinc-100 text-sm mt-1">{batch.institutionName}</h4>
                <p className="text-[11px] text-zinc-400">{batch.remittanceType}</p>
                <p className="text-[10px] text-zinc-400 mt-1 font-mono">{batch.bankName} • {batch.bankAccount}</p>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase">Total Amount</p>
                  <p className="text-base font-bold text-white font-mono">
                    {batch.currency} {batch.totalAmount.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDownloadCsv(batch)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition"
                    title="Download Check-off Schedule CSV"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => handleDisburse(batch.institutionCode)}
                    disabled={batch.disbursalStatus === "disbursed" || disbursingCode === batch.institutionCode}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      batch.disbursalStatus === "disbursed"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-default"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                    }`}
                  >
                    {batch.disbursalStatus === "disbursed" ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Done</span>
                      </>
                    ) : disbursingCode === batch.institutionCode ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="h-3 w-3" />
                        <span>Disburse</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Employee Standing Mandates Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Employee Standing Deduction Mandates ({mandates.length})
          </h3>
          <span className="text-[11px] text-zinc-400">Fixed check-off amounts deducted every payroll cycle</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 text-zinc-400 text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-3">Third-Party Entity</th>
                <th className="py-3 px-3">Mandate Purpose</th>
                <th className="py-3 px-3">Policy / Member ID</th>
                <th className="py-3 px-3">Settlement Rails</th>
                <th className="py-3 px-3 text-right">Monthly Deduction</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {mandates.map((m) => (
                <tr key={m.id} className="hover:bg-zinc-800/30 transition">
                  <td className="py-3.5 px-4 font-semibold text-zinc-200">{m.employeeName}</td>
                  <td className="py-3.5 px-3">
                    <div className="font-medium text-zinc-200">{m.institutionName}</div>
                    <div className="text-[10px] text-indigo-400 font-mono">{m.institutionCode}</div>
                  </td>
                  <td className="py-3.5 px-3 text-zinc-300">{m.remittanceType}</td>
                  <td className="py-3.5 px-3 font-mono text-zinc-200 font-medium">{m.policyOrMemberNumber}</td>
                  <td className="py-3.5 px-3 text-zinc-400 text-[11px]">{m.bankDetails}</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-amber-300">
                    {m.currency} {m.monthlyAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
