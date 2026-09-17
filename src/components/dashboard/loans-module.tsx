"use client";

import React, { useState } from "react";
import {
  Landmark,
  Calculator,
  Percent,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingDown,
  CreditCard,
  Plus,
} from "lucide-react";

interface LoanRecord {
  id: string;
  loanNumber: string;
  employeeName: string;
  loanType: string;
  principalAmount: number;
  interestRate: number;
  monthlyInstallment: number;
  tenureMonths: number;
  paidMonths: number;
  remainingBalance: number;
  status: "active" | "fully_paid";
}

export function LoansModule() {
  const [loans] = useState<LoanRecord[]>([
    {
      id: "ln-001",
      loanNumber: "LN-2026-004",
      employeeName: "Nelson Mandela CP",
      loanType: "Company Vehicle & Asset Loan",
      principalAmount: 240000,
      interestRate: 6.0,
      monthlyInstallment: 10000,
      tenureMonths: 24,
      paidMonths: 3,
      remainingBalance: 210000,
      status: "active",
    },
    {
      id: "ln-002",
      loanNumber: "EWA-2026-012",
      employeeName: "David Kiprono",
      loanType: "Mid-Month Salary Advance (EWA)",
      principalAmount: 10000,
      interestRate: 0.0,
      monthlyInstallment: 10000,
      tenureMonths: 1,
      paidMonths: 1,
      remainingBalance: 0,
      status: "fully_paid",
    },
  ]);

  // Simulator State
  const [simPrincipal, setSimPrincipal] = useState(300000);
  const [simTenure, setSimTenure] = useState(12);
  const [simRate, setSimRate] = useState(6.0);

  // Calculated values
  const totalInterest = Math.round(simPrincipal * (simRate / 100) * (simTenure / 12));
  const totalPayable = simPrincipal + totalInterest;
  const monthlyDeduction = Math.round(totalPayable / simTenure);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Company Staff Loans & Amortization Sub-Ledger
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Automated Payroll Deduction
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Track staff loans, salary advances, reducing balance interest, and automated payroll recovery until zero balance
          </p>
        </div>
      </div>

      {/* Active Staff Loans Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Active Loan Amortization Schedules ({loans.length})
          </h3>
          <span className="text-[11px] text-zinc-400">Deducted automatically post-tax</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 text-zinc-400 text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Loan Ref</th>
                <th className="py-3 px-3">Employee</th>
                <th className="py-3 px-3">Loan Product</th>
                <th className="py-3 px-3 text-right">Original Principal</th>
                <th className="py-3 px-3 text-center">Interest</th>
                <th className="py-3 px-3 text-center">Tenure Progress</th>
                <th className="py-3 px-3 text-right">Monthly Deduction</th>
                <th className="py-3 px-3 text-right">Remaining Balance</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loans.map((loan) => (
                <tr key={loan.id} className="hover:bg-zinc-800/30 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{loan.loanNumber}</td>
                  <td className="py-3.5 px-3 font-semibold text-zinc-200">{loan.employeeName}</td>
                  <td className="py-3.5 px-3 text-zinc-300">{loan.loanType}</td>
                  <td className="py-3.5 px-3 text-right font-mono text-zinc-300">
                    KES {loan.principalAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono text-zinc-400">
                    {loan.interestRate > 0 ? `${loan.interestRate}%` : "0% (Subsidized)"}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="text-zinc-200 font-mono font-medium">
                      Inst {loan.paidMonths} of {loan.tenureMonths}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-amber-300">
                    KES {loan.monthlyInstallment.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-zinc-100">
                    KES {loan.remainingBalance.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-semibold capitalize ${
                        loan.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}
                    >
                      {loan.status === "active" ? "Active Repayment" : "Zero Balance"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Loan Amortization Calculator */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 space-y-6 shadow-xl">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
          <Calculator className="h-5 w-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Company Loan Amortization Simulator & Policy Calculator
            </h3>
            <p className="text-xs text-zinc-400">
              Calculate automated monthly deductions based on company loan policy rules
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-4 md:col-span-2">
            <div>
              <div className="flex justify-between text-xs font-medium text-zinc-300 mb-1.5">
                <span>Principal Amount</span>
                <span className="font-mono text-amber-400 font-bold">KES {simPrincipal.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={20000}
                max={1500000}
                step={10000}
                value={simPrincipal}
                onChange={(e) => setSimPrincipal(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 mt-1 font-mono">
                <span>KES 20,000</span>
                <span>KES 1,500,000</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-zinc-300 mb-1.5">
                <span>Repayment Tenure</span>
                <span className="font-mono text-indigo-400 font-bold">{simTenure} Months</span>
              </div>
              <input
                type="range"
                min={1}
                max={36}
                step={1}
                value={simTenure}
                onChange={(e) => setSimTenure(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 mt-1 font-mono">
                <span>1 Month (Salary Advance)</span>
                <span>36 Months (Vehicle / Asset Loan)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-zinc-300 mb-1.5">
                <span>Annual Subsidized Interest Rate</span>
                <span className="font-mono text-emerald-400 font-bold">{simRate}%</span>
              </div>
              <div className="flex gap-2">
                {[0, 3, 6, 9].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setSimRate(rate)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition ${
                      simRate === rate
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-zinc-800/60 text-zinc-400 border-zinc-700 hover:bg-zinc-800"
                    }`}
                  >
                    {rate === 0 ? "0% (Advance)" : `${rate}% p.a.`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
            <div className="space-y-3 text-xs">
              <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                Amortization Projection
              </p>

              <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-zinc-400">Principal Disbursed:</span>
                <span className="font-mono text-zinc-200">KES {simPrincipal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-zinc-400">Total Company Interest:</span>
                <span className="font-mono text-zinc-200">KES {totalInterest.toLocaleString()}</span>
              </div>

              <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-zinc-400">Total Repayment:</span>
                <span className="font-mono text-zinc-200 font-medium">KES {totalPayable.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800">
              <p className="text-[10px] text-zinc-400 uppercase">Monthly Payroll Deduction</p>
              <p className="text-2xl font-black text-amber-400 font-mono mt-0.5">
                KES {monthlyDeduction.toLocaleString()}
              </p>
              <p className="text-[10px] text-zinc-400 mt-1">Deducted on each 30th until balance reaches KES 0.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
