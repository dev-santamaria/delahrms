"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  Clock,
  Download,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";

export default function LeaveShutdownsPage() {
  const { entityInfo } = usePortal();
  const [shutdownExecuted, setShutdownExecuted] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState("annual");

  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: "LEV-302",
      employee: "David Omondi",
      type: "Annual Leave",
      days: 4,
      period: "Sep 22, 2026 - Sep 25, 2026",
      reason: "Family wedding & rest",
      status: "Approved",
      coverage: "Covered by Grace Muthoni",
    },
    {
      id: "LEV-305",
      employee: "Elena Rostova",
      type: "Expat Home Leave",
      days: 10,
      period: "Oct 01, 2026 - Oct 12, 2026",
      reason: "Annual expatriate home visit flight",
      status: "Under Review",
      coverage: "Covered by Dr. Sarah Jenkins",
    },
    {
      id: "LEV-309",
      employee: "Amina Mugisha",
      type: "Compassionate Leave",
      days: 3,
      period: "Sep 28, 2026 - Sep 30, 2026",
      reason: "Family bereavement",
      status: "Approved",
      coverage: "Covered by Finance team",
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[var(--emerald-deep)]" />
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--gray-text)]">
              Leave & Corporate Holiday Shutdowns
            </h1>
          </div>
          <p className="text-xs text-[var(--gray-muted)] mt-0.5">
            Manage individual leave accruals, department coverage verification, and company-wide corporate holiday shutdowns.
          </p>
        </div>

        <button
          type="button"
          suppressHydrationWarning
          className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Apply for Time Off</span>
        </button>
      </div>

      {/* Corporate Holiday Shutdown Scheduler Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950 via-[var(--emerald-deep)] to-emerald-900 text-white space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
              <span>1-Click Corporate Shutdown Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Year-End Corporate Holiday Closure (Dec 24, 2026 — Jan 02, 2027)
            </h2>
            <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed">
              When scheduled, DelaHR automatically calculates official working business days (excluding public holidays & weekends) and bulk-debits each employee’s statutory annual leave balance company-wide.
            </p>
          </div>

          <div className="shrink-0">
            {shutdownExecuted ? (
              <div className="px-5 py-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-center space-y-1">
                <p className="text-xs font-bold text-white flex items-center gap-1.5 justify-center">
                  <CheckCircle2 className="h-4 w-4 text-[var(--emerald-mint)]" />
                  <span>Shutdown Executed</span>
                </p>
                <p className="text-[10px] text-emerald-200">
                  5 Business Days debited across 1,420 staff
                </p>
              </div>
            ) : (
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setShutdownExecuted(true)}
                className="px-6 py-3 rounded-2xl bg-[var(--emerald-mint)] hover:bg-emerald-400 text-emerald-950 font-extrabold text-xs shadow-lg transition flex items-center gap-2"
              >
                <span>Execute 1-Click Bulk Debit</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Breakdown of Days in Shutdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/15 text-xs">
          <div className="p-3 rounded-xl bg-white/10">
            <p className="text-emerald-200 text-[10px]">Total Calendar Days</p>
            <p className="font-bold font-mono text-base">10 Days</p>
          </div>
          <div className="p-3 rounded-xl bg-white/10">
            <p className="text-emerald-200 text-[10px]">Official Public Holidays</p>
            <p className="font-bold font-mono text-base">3 Days (Exempt)</p>
          </div>
          <div className="p-3 rounded-xl bg-white/10">
            <p className="text-emerald-200 text-[10px]">Weekend Days</p>
            <p className="font-bold font-mono text-base">2 Days (Exempt)</p>
          </div>
          <div className="p-3 rounded-xl bg-white/10">
            <p className="text-emerald-200 text-[10px]">Net Annual Leave Debited</p>
            <p className="font-bold font-mono text-base text-[var(--emerald-mint)]">5 Business Days</p>
          </div>
        </div>
      </div>

      {/* Policy Balances & Active Leave Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <p className="text-xs font-bold text-[var(--gray-muted)]">Annual Leave Balance</p>
          <p className="text-xl font-extrabold text-[var(--gray-text)] font-mono">18 / 24 Days</p>
          <p className="text-[10px] text-[var(--emerald-deep)] font-semibold">Accruing 2.0 days/mo</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <p className="text-xs font-bold text-[var(--gray-muted)]">Sick & Medical Leave</p>
          <p className="text-xl font-extrabold text-[var(--gray-text)] font-mono">14 / 14 Days</p>
          <p className="text-[10px] text-zinc-500 font-semibold">Doctor cert required &gt; 2 days</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <p className="text-xs font-bold text-[var(--gray-muted)]">Expat Home Leave</p>
          <p className="text-xl font-extrabold text-[var(--gray-text)] font-mono">10 / 15 Days</p>
          <p className="text-[10px] text-blue-600 font-semibold">Includes flight ticket grant</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <p className="text-xs font-bold text-[var(--gray-muted)]">Compassionate Leave</p>
          <p className="text-xl font-extrabold text-[var(--gray-text)] font-mono">5 / 5 Days</p>
          <p className="text-[10px] text-zinc-500 font-semibold">Full pay guaranteed</p>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="rounded-2xl border border-[var(--gray-border)] bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[var(--gray-border)] bg-[var(--cool-gray)] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[var(--gray-text)] uppercase tracking-wider">
            {entityInfo.name} • Recent Time Off Requests
          </h3>
          <span className="text-[11px] text-[var(--gray-muted)]">
            3 Active Requests This Month
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--gray-text)]">
            <thead className="bg-white border-b border-[var(--gray-border)] text-[11px] font-bold text-[var(--gray-muted)]">
              <tr>
                <th className="py-3 px-4">Request ID & Staff</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Coverage Verification</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaveRequests.map((req) => (
                <tr key={req.id} className="hover:bg-[var(--cool-gray)] transition">
                  <td className="py-3 px-4">
                    <p className="font-bold text-[var(--gray-text)]">{req.employee}</p>
                    <p className="text-[10px] font-mono text-[var(--gray-muted)]">{req.id}</p>
                  </td>
                  <td className="py-3 px-4 font-semibold">{req.type}</td>
                  <td className="py-3 px-4 font-mono font-bold">{req.days} Days</td>
                  <td className="py-3 px-4 text-[11px] text-[var(--gray-muted)]">{req.period}</td>
                  <td className="py-3 px-4 text-[11px]">
                    <span className="text-[var(--emerald-deep)] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-[var(--emerald-mint)]" />
                      <span>{req.coverage}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === "Approved"
                          ? "bg-[var(--emerald-light)] text-[var(--emerald-deep)]"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {req.status}
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
