"use client";

import React, { useState } from "react";
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Users,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Plus,
  ArrowRight,
  Filter,
  Check,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";

interface ShiftCell {
  crew: "Crew A (Morning)" | "Crew B (Afternoon)" | "Crew C (Night FIFO)";
  time: string;
  lead: string;
  count: number;
  fatigueCompliant: boolean;
  restHours: number;
}

export default function TimeShiftsPage() {
  const { entityInfo } = usePortal();
  const [selectedPattern, setSelectedPattern] = useState<"continental" | "fifo" | "four_on_four_off">("continental");
  const [fatigueSimulated, setFatigueSimulated] = useState(false);
  const [swapApproved, setSwapApproved] = useState(false);

  const days = ["Mon, Sep 14", "Tue, Sep 15", "Wed, Sep 16", "Thu, Sep 17", "Fri, Sep 18", "Sat, Sep 19", "Sun, Sep 20"];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[var(--emerald-deep)]" />
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--gray-text)]">
              24/7 Continuous Shift Rosters & Fatigue Guard
            </h1>
          </div>
          <p className="text-xs text-[var(--gray-muted)] mt-0.5">
            Industrial-grade shift rotations (Continental 3-Shift, FIFO 14/14, 4-on-4-off) with strict 12-hour rest interval verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setFatigueSimulated(!fatigueSimulated)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              fatigueSimulated
                ? "bg-rose-50 text-rose-700 border-rose-300"
                : "bg-white text-[var(--gray-text)] border-[var(--gray-border)] hover:bg-[var(--cool-gray)] shadow-2xs"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span>{fatigueSimulated ? "Reset Safe Roster" : "Simulate Fatigue Breach"}</span>
          </button>

          <button
            type="button"
            suppressHydrationWarning
            className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Assign New Roster</span>
          </button>
        </div>
      </div>

      {/* Roster Pattern Selector Tabs & Fatigue Warning Alert */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center bg-white p-1 rounded-xl border border-[var(--gray-border)] shadow-xs">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setSelectedPattern("continental")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedPattern === "continental"
                  ? "bg-[var(--emerald-deep)] text-white shadow-xs"
                  : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
              }`}
            >
              Continental 3-Shift (24/7)
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setSelectedPattern("fifo")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedPattern === "fifo"
                  ? "bg-[var(--emerald-deep)] text-white shadow-xs"
                  : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
              }`}
            >
              Mining FIFO (14/14 Rotation)
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setSelectedPattern("four_on_four_off")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedPattern === "four_on_four_off"
                  ? "bg-[var(--emerald-deep)] text-white shadow-xs"
                  : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
              }`}
            >
              4-On / 4-Off Continuous
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--emerald-deep)] bg-[var(--emerald-light)] px-3 py-1.5 rounded-xl border border-[var(--emerald-border)]">
            <ShieldCheck className="h-4 w-4 text-[var(--emerald-mint)]" />
            <span>Mandatory Rest Policy: 12h Minimum Between Shifts</span>
          </div>
        </div>

        {/* Fatigue Alert Notification when simulated */}
        {fatigueSimulated && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 flex items-start gap-3 text-xs text-rose-900 animate-in fade-in-50">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <p className="font-bold text-rose-900">
                FATIGUE SAFETY VIOLATION DETECTED: Operator #402 Assigned with only 8h Rest Interval
              </p>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                David Omondi finished Crew B Afternoon shift at 22:00 and was scheduled for Crew A Morning shift at 06:00 (8h gap). Statutory labor standards require at least 12 continuous rest hours. Automatic roster lock is active.
              </p>
            </div>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setFatigueSimulated(false)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
            >
              Auto-Resolve
            </button>
          </div>
        )}
      </div>

      {/* Shift Matrix Grid */}
      <div className="rounded-2xl border border-[var(--gray-border)] bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[var(--gray-border)] bg-[var(--cool-gray)] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-[var(--gray-text)] uppercase tracking-wider">
              {entityInfo.name} • Active Plant Operational Roster
            </h3>
            <p className="text-[11px] text-[var(--gray-muted)]">
              Real-time shift coverage & GPS-verified punch attendance
            </p>
          </div>
          <span className="text-[11px] font-mono text-[var(--emerald-deep)] font-bold">
            3 Shifts / 24h Non-Stop
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white border-b border-[var(--gray-border)] text-[11px] font-bold text-[var(--gray-muted)]">
                <th className="p-3 w-44 border-r border-[var(--gray-border)]">Shift Tier</th>
                {days.map((d, i) => (
                  <th key={i} className="p-3 text-center border-r border-[var(--gray-border)] min-w-[130px]">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--gray-border)]">
              {/* Morning Shift */}
              <tr>
                <td className="p-3 bg-[var(--cool-gray)] border-r border-[var(--gray-border)] font-semibold">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-[var(--gray-text)]">Shift 1 (Morning)</p>
                    <p className="text-[10px] text-[var(--gray-muted)]">06:00 - 14:00 (8h)</p>
                  </div>
                </td>
                {days.map((_, i) => (
                  <td key={i} className="p-2 border-r border-[var(--gray-border)] text-center">
                    <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                      <p className="text-[11px] font-bold text-emerald-900">Crew A</p>
                      <p className="text-[10px] text-emerald-700">120 Staff • On-Site</p>
                      <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-800">
                        16h Rest Cleared
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Afternoon Shift */}
              <tr>
                <td className="p-3 bg-[var(--cool-gray)] border-r border-[var(--gray-border)] font-semibold">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-[var(--emerald-deep)]">Shift 2 (Afternoon)</p>
                    <p className="text-[10px] text-[var(--gray-muted)]">14:00 - 22:00 (8h)</p>
                    <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-[var(--emerald-deep)] text-white">
                      Active Now
                    </span>
                  </div>
                </td>
                {days.map((_, i) => (
                  <td key={i} className="p-2 border-r border-[var(--gray-border)] text-center">
                    <div
                      className={`p-2 rounded-xl border space-y-1 ${
                        fatigueSimulated && i === 2
                          ? "bg-rose-50 border-rose-300 animate-pulse"
                          : "bg-blue-50/70 border-blue-200"
                      }`}
                    >
                      <p className="text-[11px] font-bold text-blue-900">
                        {fatigueSimulated && i === 2 ? "Crew B (Conflict)" : "Crew B"}
                      </p>
                      <p className="text-[10px] text-blue-700">118 Staff</p>
                      <span
                        className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          fatigueSimulated && i === 2
                            ? "bg-rose-200 text-rose-900 font-extrabold"
                            : "bg-blue-200 text-blue-800"
                        }`}
                      >
                        {fatigueSimulated && i === 2 ? "⚠ 8h Rest (Breach)" : "16h Rest Cleared"}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Night Shift */}
              <tr>
                <td className="p-3 bg-[var(--cool-gray)] border-r border-[var(--gray-border)] font-semibold">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-[var(--gray-text)]">Shift 3 (Night FIFO)</p>
                    <p className="text-[10px] text-[var(--gray-muted)]">22:00 - 06:00 (8h)</p>
                    <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                      Hazard + Night Allowance
                    </span>
                  </div>
                </td>
                {days.map((_, i) => (
                  <td key={i} className="p-2 border-r border-[var(--gray-border)] text-center">
                    <div className="p-2 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1">
                      <p className="text-[11px] font-bold text-purple-900">Crew C</p>
                      <p className="text-[10px] text-purple-700">95 Staff</p>
                      <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-200 text-purple-800">
                        14h Rest Cleared
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Shift Swap Pipeline */}
      <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--gray-text)]">
              Peer-to-Peer Shift Swap Approvals
            </h3>
            <p className="text-xs text-[var(--gray-muted)]">
              Employees can swap continuous shifts provided both parties meet the 12h mandatory rest safeguard.
            </p>
          </div>
          <span className="text-xs font-bold text-[var(--emerald-deep)] px-2.5 py-1 rounded-full bg-[var(--emerald-light)]">
            1 Pending Swap
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              ⇄
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--gray-text)]">
                Grace Muthoni (Crew A Morning) ⇄ John Mwangi (Crew C Night)
              </p>
              <p className="text-[11px] text-[var(--gray-muted)]">
                Target Date: Wednesday, Sep 16 • Rest gap check: <strong>14.5 hours (Passed)</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {swapApproved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--emerald-light)] text-[var(--emerald-deep)] text-xs font-bold">
                <Check className="h-3.5 w-3.5" />
                <span>Swap Approved & Roster Synced</span>
              </span>
            ) : (
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setSwapApproved(true)}
                className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition"
              >
                Approve Swap
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
