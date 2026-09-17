"use client";

import React, { useState } from "react";
import {
  Calendar,
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  Receipt,
  FileCheck2,
  DollarSign,
  TrendingUp,
  Download,
  Send,
  Sparkles,
  Plane,
  ShieldCheck,
  User,
  ChevronRight,
  Filter,
  Plus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function InteractivePreview() {
  const [activeTab, setActiveTab] = useState<"leave" | "claims" | "payroll">("leave");
  const [isLoading, setIsLoading] = useState(false);
  const [leaveRequested, setLeaveRequested] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);

  const handleTabSwitch = (tab: "leave" | "claims" | "payroll") => {
    if (tab === activeTab) return;
    setIsLoading(true);
    setActiveTab(tab);
    setTimeout(() => {
      setIsLoading(false);
    }, 350);
  };

  return (
    <div className="rounded-2xl border border-[var(--gray-border)] bg-white shadow-sm overflow-hidden">
      {/* Header bar with tabs */}
      <div className="border-b border-[var(--gray-border)] bg-[var(--cool-gray)] px-4 py-3 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-[var(--emerald-mint)]" />
          <span className="text-xs font-bold text-[var(--gray-text)]">
            Live Product Experience: See DelaHR in Action
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-white p-1 rounded-lg border border-[var(--gray-border)] shadow-xs">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => handleTabSwitch("leave")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === "leave"
                ? "bg-[var(--emerald-deep)] text-white shadow-xs"
                : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
            }`}
          >
            Leave & Shutdowns
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => handleTabSwitch("claims")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === "claims"
                ? "bg-[var(--emerald-deep)] text-white shadow-xs"
                : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
            }`}
          >
            Claims & Travel
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => handleTabSwitch("payroll")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === "payroll"
                ? "bg-[var(--emerald-deep)] text-white shadow-xs"
                : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
            }`}
          >
            Payroll Summary
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-6">
        {isLoading ? (
          <div className="space-y-4 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Skeleton className="h-24 w-full rounded-xl bg-[var(--cool-gray)]" />
              <Skeleton className="h-24 w-full rounded-xl bg-[var(--cool-gray)]" />
              <Skeleton className="h-24 w-full rounded-xl bg-[var(--cool-gray)]" />
            </div>
            <Skeleton className="h-44 w-full rounded-xl bg-[var(--cool-gray)]" />
          </div>
        ) : (
          <>
            {/* 1. LEAVE MANAGEMENT TAB */}
            {activeTab === "leave" && (
              <div className="space-y-4 text-xs">
                {/* Balance Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-[var(--gray-border)] bg-[var(--cool-gray)] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">
                      Annual Leave Balance
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-bold font-mono text-[var(--gray-text)]">
                        {leaveRequested ? "15.0" : "18.0"}{" "}
                        <span className="text-xs font-normal text-[var(--gray-muted)]">days left</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-semibold border border-[var(--emerald-border)]">
                        Accruing
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--gray-muted)]">3 days pending supervisor sign-off</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[var(--gray-border)] bg-[var(--cool-gray)] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">
                      Sick & Compassionate Leave
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-bold font-mono text-[var(--gray-text)]">
                        10.0 <span className="text-xs font-normal text-[var(--gray-muted)]">days left</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                        Paid
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--gray-muted)]">Medical documentation auto-routed</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[var(--emerald-border)] bg-[var(--emerald-light)] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--emerald-deep)]">
                      Corporate Holiday Shutdown
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-bold text-[var(--emerald-deep)]">
                        Dec 24 – Jan 2 (6 Days)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white text-[var(--emerald-deep)] font-bold border border-[var(--emerald-border)]">
                        Scheduled
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--emerald-deep)]">
                      1-Click automated company-wide calendar debit
                    </p>
                  </div>
                </div>

                {/* Team Leave List & Action Simulator */}
                <div className="p-4 rounded-xl border border-[var(--gray-border)] bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[var(--gray-text)]">Recent Leave Requests & Approvals</h4>
                      <p className="text-[11px] text-[var(--gray-muted)]">
                        Instant policy verification against department coverage rules
                      </p>
                    </div>
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setLeaveRequested(!leaveRequested)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>{leaveRequested ? "Reset Demo" : "Request 3 Days"}</span>
                    </button>
                  </div>

                  <div className="divide-y divide-[var(--gray-border)]">
                    <div className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)] flex items-center justify-center font-bold text-xs">
                          AM
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--gray-text)]">Amina Odhiambo</p>
                          <p className="text-[11px] text-[var(--gray-muted)]">Annual Leave • Oct 14 – Oct 18 (5 days)</p>
                        </div>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-medium border border-[var(--emerald-border)] flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-[var(--emerald-mint)]" />
                        Approved
                      </span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                          DK
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--gray-text)]">David Kiprono</p>
                          <p className="text-[11px] text-[var(--gray-muted)]">Training Workshop • Oct 21 – Oct 22 (2 days)</p>
                        </div>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-medium border border-[var(--emerald-border)] flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-[var(--emerald-mint)]" />
                        Approved
                      </span>
                    </div>

                    {leaveRequested && (
                      <div className="py-2.5 flex items-center justify-between bg-[var(--emerald-light)] px-2 rounded-lg transition-all">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-full bg-[var(--emerald-deep)] text-white flex items-center justify-center font-bold text-xs">
                            YOU
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--emerald-deep)]">Your Leave Request</p>
                            <p className="text-[11px] text-[var(--emerald-deep)]">Personal Leave • Nov 4 – Nov 6 (3 days)</p>
                          </div>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-[var(--emerald-deep)] font-bold border border-[var(--emerald-border)] flex items-center gap-1">
                          <Clock className="h-3 w-3 text-amber-500" />
                          Auto-Approved by Policy
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. CLAIMS & TRAVEL TAB */}
            {activeTab === "claims" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-[var(--gray-border)] bg-[var(--cool-gray)] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">
                      Pre-Trip Cash Advance
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-bold font-mono text-[var(--gray-text)]">
                        $1,450.00
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-semibold border border-[var(--emerald-border)]">
                        Disbursed
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--gray-muted)]">Sent via instant global wire rail</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[var(--gray-border)] bg-[var(--cool-gray)] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">
                      Reconciled Expenses
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-bold font-mono text-[var(--gray-text)]">
                        {claimSubmitted ? "$1,365.50" : "$1,120.00"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                        Receipted
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--gray-muted)]">Automated tax clearance verified</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[var(--gray-border)] bg-[var(--cool-gray)] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">
                      Settlement Variance
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-bold font-mono text-[var(--emerald-deep)]">
                        {claimSubmitted ? "$84.50" : "$330.00"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-bold border border-[var(--emerald-border)]">
                        Balanced
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--gray-muted)]">Ready for 1-click accounting close</p>
                  </div>
                </div>

                {/* Claim Items Table */}
                <div className="p-4 rounded-xl border border-[var(--gray-border)] bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[var(--gray-text)]">Field Audit & Global Travel Expenses</h4>
                      <p className="text-[11px] text-[var(--gray-muted)]">
                        Mobile receipt attachments with automated control number & tax invoice validation
                      </p>
                    </div>
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setClaimSubmitted(!claimSubmitted)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>{claimSubmitted ? "Reset Demo" : "Upload Receipt"}</span>
                    </button>
                  </div>

                  <div className="divide-y divide-[var(--gray-border)]">
                    <div className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[var(--cool-gray)] text-[var(--gray-text)]">
                          <Receipt className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--gray-text)]">International Flight Ticket</p>
                          <p className="text-[11px] text-[var(--gray-muted)]">Global Airways • Flight GA-409 • Oct 12</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-mono text-[var(--gray-text)]">$520.00</p>
                        <span className="text-[10px] text-[var(--emerald-deep)] font-semibold">Verified</span>
                      </div>
                    </div>

                    <div className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[var(--cool-gray)] text-[var(--gray-text)]">
                          <Receipt className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--gray-text)]">Hotel & Corporate Lodging (3 Nights)</p>
                          <p className="text-[11px] text-[var(--gray-muted)]">Standard Scale-Rate Allowance</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-mono text-[var(--gray-text)]">$600.00</p>
                        <span className="text-[10px] text-[var(--emerald-deep)] font-semibold">Scale-Rate</span>
                      </div>
                    </div>

                    {claimSubmitted && (
                      <div className="py-2.5 flex items-center justify-between bg-[var(--emerald-light)] px-2 rounded-lg transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[var(--emerald-deep)] text-white">
                            <Receipt className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--emerald-deep)]">Client Working Lunch</p>
                            <p className="text-[11px] text-[var(--emerald-deep)]">Receipt #REC-99402 • Verified Instantly</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold font-mono text-[var(--emerald-deep)]">$245.50</p>
                          <span className="text-[10px] bg-white text-[var(--emerald-deep)] px-1.5 py-0.5 rounded font-bold border border-[var(--emerald-border)]">
                            Auto-Approved
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. PAYROLL SUMMARY TAB */}
            {activeTab === "payroll" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-[var(--gray-border)] bg-[var(--cool-gray)] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">
                      Total Gross Payroll
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-bold font-mono text-[var(--gray-text)]">
                        $284,500
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-semibold border border-[var(--emerald-border)]">
                        Balanced
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--gray-muted)]">Basic pay + allowances + cross-border mobility</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[var(--gray-border)] bg-[var(--cool-gray)] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">
                      Statutory Withholdings
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-bold font-mono text-[var(--gray-text)]">
                        $58,320
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                        1-Click File
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--gray-muted)]">Multi-country income tax, healthcare & pensions</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[var(--emerald-border)] bg-[var(--emerald-light)] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--emerald-deep)]">
                      Net Direct Payout
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-bold font-mono text-[var(--emerald-deep)]">
                        $226,180
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white text-[var(--emerald-deep)] font-bold border border-[var(--emerald-border)]">
                        Ready
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--emerald-deep)]">SWIFT, SEPA & local clearing pre-verified</p>
                  </div>
                </div>

                {/* Sample Payroll Breakdown */}
                <div className="p-4 rounded-xl border border-[var(--gray-border)] bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[var(--gray-text)]">Monthly Settlement Roster</h4>
                      <p className="text-[11px] text-[var(--gray-muted)]">
                        Auto-generated payslips and institutional remittance schedules
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-[var(--emerald-deep)] font-bold bg-[var(--emerald-light)] px-2.5 py-1 rounded border border-[var(--emerald-border)]">
                      0.00 Discrepancy • Verified
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[var(--gray-border)] text-[10px] uppercase text-[var(--gray-muted)]">
                          <th className="pb-2 font-bold">Employee</th>
                          <th className="pb-2 font-bold font-mono">Gross Pay</th>
                          <th className="pb-2 font-bold font-mono">Tax & Health</th>
                          <th className="pb-2 font-bold font-mono">Pension</th>
                          <th className="pb-2 font-bold font-mono">Net Payout</th>
                          <th className="pb-2 font-bold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--gray-border)] font-mono">
                        <tr>
                          <td className="py-2.5 font-sans font-medium text-[var(--gray-text)]">
                            Nelson Mandela CP
                          </td>
                          <td className="py-2.5">$9,500.00</td>
                          <td className="py-2.5 text-rose-600">$2,140.00</td>
                          <td className="py-2.5 text-rose-600">$475.00</td>
                          <td className="py-2.5 font-bold text-[var(--emerald-deep)]">$6,885.00</td>
                          <td className="py-2.5 text-right font-sans">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-semibold border border-[var(--emerald-border)]">
                              Approved
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-sans font-medium text-[var(--gray-text)]">
                            Elena Rostova
                          </td>
                          <td className="py-2.5">$8,200.00</td>
                          <td className="py-2.5 text-rose-600">$1,850.00</td>
                          <td className="py-2.5 text-rose-600">$410.00</td>
                          <td className="py-2.5 font-bold text-[var(--emerald-deep)]">$5,940.00</td>
                          <td className="py-2.5 text-right font-sans">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-semibold border border-[var(--emerald-border)]">
                              Approved
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-sans font-medium text-[var(--gray-text)]">
                            Marcus Chen
                          </td>
                          <td className="py-2.5">$7,400.00</td>
                          <td className="py-2.5 text-rose-600">$1,670.00</td>
                          <td className="py-2.5 text-rose-600">$370.00</td>
                          <td className="py-2.5 font-bold text-[var(--emerald-deep)]">$5,360.00</td>
                          <td className="py-2.5 text-right font-sans">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-semibold border border-[var(--emerald-border)]">
                              Approved
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
