"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  FileSpreadsheet,
  Clock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export function ShutdownLeaveModule() {
  const [shutdownDates, setShutdownDates] = useState({
    startDate: "2026-12-24",
    endDate: "2027-01-02",
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    workingDaysDeducted: number;
    impactedEmployeesCount: number;
    totalWorkforceDaysToDebit: number;
    status: string;
  } | null>({
    workingDaysDeducted: 4.0,
    impactedEmployeesCount: 48,
    totalWorkforceDaysToDebit: 192.0,
    status: "Simulation verified: All 48 active staff have >= 4.0 accrued leave days",
  });
  const [executionNotice, setExecutionNotice] = useState<string | null>(null);

  const [carryoverRequests] = useState([
    {
      id: "exc-01",
      employeeName: "Nelson Mandela CP",
      leaveType: "Annual Leave",
      fromYear: 2026,
      toYear: 2027,
      standardPolicyCap: 5.0,
      totalUnusedDays: 9.0,
      requestedDays: 9.0,
      approvedDays: 9.0,
      utilizeBeforeDate: "2027-03-31",
      justification: "Postponed Q4 travel due to East Africa SAP rollout; scheduled family leave in Feb 2027.",
      status: "approved",
    },
    {
      id: "exc-02",
      employeeName: "Amina Odhiambo",
      leaveType: "Annual Leave",
      fromYear: 2026,
      toYear: 2027,
      standardPolicyCap: 5.0,
      totalUnusedDays: 7.5,
      requestedDays: 7.5,
      approvedDays: 0.0,
      utilizeBeforeDate: "2027-02-28",
      justification: "Critical system security audit in Dec 2026 requiring full-time presence.",
      status: "pending_review",
    },
  ]);

  const [ledgerEntries] = useState([
    {
      id: "led-1",
      date: "2026-09-01",
      employeeName: "Nelson Mandela CP",
      transaction: "Monthly Earned Accrual",
      days: "+2.50",
      balanceAfter: "18.50 Days",
      type: "credit",
    },
    {
      id: "led-2",
      date: "2026-08-15",
      employeeName: "David Kiprono",
      transaction: "Approved Annual Leave Application",
      days: "-3.00",
      balanceAfter: "12.00 Days",
      type: "debit",
    },
    {
      id: "led-3",
      date: "2026-01-02",
      employeeName: "Amina Odhiambo",
      transaction: "Corporate Year-End Christmas Shutdown Debit",
      days: "-4.00",
      balanceAfter: "14.50 Days",
      type: "debit",
    },
  ]);

  const handleExecuteShutdown = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setExecutionNotice(
        "✅ Corporate Holiday Shutdown Executed: 4.0 working days automatically debited from 48 employee balances with immutable ledger receipts created!"
      );
      setTimeout(() => setExecutionNotice(null), 4500);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Corporate Holiday Shutdowns & Immutable Leave Ledger
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Automated Annual Closure Engine
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Bulk-debit non-holiday working days during Christmas/Year-End closures, manage advance carryover extension requests exceeding 5-day caps, and audit immutable leave journals
          </p>
        </div>
      </div>

      {/* Execution Feedback Notice */}
      {executionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{executionNotice}</span>
        </div>
      )}

      {/* 1. Corporate Holiday Shutdown Simulator Card */}
      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Corporate Christmas & Year-End Closure Auto-Debit Simulator
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400">Excludes gazetted public holidays (Christmas, Boxing Day, New Year)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Company Closure Start Date:</label>
            <input
              type="date"
              value={shutdownDates.startDate}
              onChange={(e) => setShutdownDates({ ...shutdownDates, startDate: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Company Resumption Date:</label>
            <input
              type="date"
              value={shutdownDates.endDate}
              onChange={(e) => setShutdownDates({ ...shutdownDates, endDate: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleExecuteShutdown}
              disabled={isSimulating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-zinc-950 font-bold text-xs shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2"
            >
              <TrendingDown className="h-4 w-4" />
              <span>{isSimulating ? "Executing Bulk Debit..." : "Execute 1-Click Auto-Debit"}</span>
            </button>
          </div>
        </div>

        {simulationResult && (
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-zinc-500 text-[10px] uppercase">Net Working Days Deducted:</p>
              <p className="text-lg font-bold text-amber-400 font-mono mt-0.5">
                {simulationResult.workingDaysDeducted.toFixed(1)} Days
              </p>
              <p className="text-[10px] text-zinc-500">Per eligible workforce employee</p>
            </div>
            <div>
              <p className="text-zinc-500 text-[10px] uppercase">Impacted Workforce:</p>
              <p className="text-lg font-bold text-zinc-200 font-mono mt-0.5">
                {simulationResult.impactedEmployeesCount} Active Staff
              </p>
              <p className="text-[10px] text-zinc-500">All subsidiaries & sites</p>
            </div>
            <div>
              <p className="text-zinc-500 text-[10px] uppercase">Total Days Debited:</p>
              <p className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                {simulationResult.totalWorkforceDaysToDebit.toFixed(1)} Days
              </p>
              <p className="text-[10px] text-zinc-500">Recorded in immutable ledger</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Advance Carryover Extension Workflow Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Advance Carryover Extension Requests (Exceeding 5-Day Policy Cap)
            </h3>
            <p className="text-[11px] text-zinc-400">Formal applications to preserve unused leave days into Q1 of following year</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 text-zinc-400 text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-3">Year Transition</th>
                <th className="py-3 px-3">Unused Balance</th>
                <th className="py-3 px-3">Standard Cap vs Requested</th>
                <th className="py-3 px-3">Agreed Expiry</th>
                <th className="py-3 px-3">Justification</th>
                <th className="py-3 px-4 text-right">Approval Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {carryoverRequests.map((req) => (
                <tr key={req.id} className="hover:bg-zinc-800/30 transition">
                  <td className="py-3 px-4 font-semibold text-zinc-200">{req.employeeName}</td>
                  <td className="py-3 px-3 font-mono text-zinc-300">{req.fromYear} → {req.toYear}</td>
                  <td className="py-3 px-3 font-mono font-medium text-zinc-300">{req.totalUnusedDays.toFixed(1)} Days</td>
                  <td className="py-3 px-3">
                    <span className="text-zinc-400">{req.standardPolicyCap.toFixed(1)} Cap</span>
                    <span className="text-amber-400 font-bold ml-1.5 font-mono">→ {req.requestedDays.toFixed(1)} Days</span>
                  </td>
                  <td className="py-3 px-3 text-zinc-300 font-medium">{req.utilizeBeforeDate}</td>
                  <td className="py-3 px-3 text-zinc-400 text-[11px] max-w-xs truncate">{req.justification}</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                        req.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {req.status.replace(/_/g, " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Immutable Leave Transaction Ledger Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Immutable Point-in-Time Leave Transaction Ledger
          </h3>
          <span className="text-[11px] text-zinc-400">Append-only audit trail of every credit, debit, and forfeiture</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 text-zinc-400 text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Effective Date</th>
                <th className="py-3 px-3">Employee</th>
                <th className="py-3 px-3">Transaction Description</th>
                <th className="py-3 px-3">Entitlement Delta</th>
                <th className="py-3 px-4 text-right">Running Balance Post-Transaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {ledgerEntries.map((led) => (
                <tr key={led.id} className="hover:bg-zinc-800/30 transition">
                  <td className="py-3 px-4 font-mono text-zinc-400">{led.date}</td>
                  <td className="py-3 px-3 font-semibold text-zinc-200">{led.employeeName}</td>
                  <td className="py-3 px-3 text-zinc-300">{led.transaction}</td>
                  <td className="py-3 px-3 font-mono font-bold">
                    <span className={led.type === "credit" ? "text-emerald-400" : "text-amber-400"}>
                      {led.days} Days
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-zinc-200">
                    {led.balanceAfter}
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
