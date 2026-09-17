"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  DollarSign,
  Clock,
  CalendarDays,
  Plane,
  Receipt,
  FileCheck2,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Plus,
  ArrowRight,
  Building2,
  Lock,
  Sparkles,
  ChevronRight,
  Filter,
  Wallet,
  Zap,
  Award,
  MessageSquare,
  Check,
  User,
  Heart,
  Factory,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";

export default function PortalDashboardPage() {
  const { entity, entityInfo, persona, personaInfo } = usePortal();

  // Interactive state for approval actions
  const [approvals, setApprovals] = useState([
    {
      id: "app-1",
      title: "Bank Account Payout Modification (#HR-BNK-2026)",
      employee: "Nelson Mandela CP (EMP-4091)",
      dept: "Operations & Infrastructure",
      amount: "Payout Route: Citibank",
      type: "bank",
      date: "Today, 09:30 AM",
      status: "pending",
      icon: FileCheck2,
      color: "text-blue-600 bg-blue-50",
    },
    {
      id: "app-2",
      title: "Non-Payroll Field Travel Advance (#ADV-8891)",
      employee: "Sarah Jenkins (EMP-3104)",
      dept: "Geological Survey & Exploration",
      amount: `${entityInfo.symbol} 450.00 • Mobile Money / EFT`,
      type: "advance",
      date: "Today, 10:15 AM",
      status: "pending",
      icon: Receipt,
      color: "text-[var(--emerald-deep)] bg-[var(--emerald-light)]",
    },
    {
      id: "app-3",
      title: "Annual Leave Application (#LEV-302)",
      employee: "David Omondi (EMP-2190)",
      dept: "Plant Logistics & FIFO Crew",
      amount: "4 Business Days (Approved Policy Limit)",
      type: "leave",
      date: "Yesterday, 04:45 PM",
      status: "pending",
      icon: CalendarDays,
      color: "text-amber-600 bg-amber-50",
    },
    {
      id: "app-4",
      title: "Shift Swap Request (#SWP-104)",
      employee: "Grace Muthoni ⇄ John Mwangi",
      dept: "Continental 3-Shift Plant Crew",
      amount: "Day Shift (06:00-14:00) ⇄ Night Shift",
      type: "shift",
      date: "Yesterday, 02:20 PM",
      status: "pending",
      icon: Clock,
      color: "text-purple-600 bg-purple-50",
    },
  ]);

  const [clockedIn, setClockedIn] = useState(true);

  const handleApprove = (id: string) => {
    setApprovals((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "approved" } : item))
    );
  };

  // Entity-scaled KPI numbers
  const headcountMap: Record<string, { total: number; expats: number; local: number; cost: string }> = {
    all: { total: 1420, expats: 184, local: 1236, cost: "$1,842,500" },
    kenya: { total: 480, expats: 42, local: 438, cost: "KSh 64,800,000" },
    uganda: { total: 240, expats: 18, local: 222, cost: "USh 980,000,000" },
    tanzania: { total: 360, expats: 65, local: 295, cost: "TSh 1,420,000,000" },
    rwanda: { total: 140, expats: 12, local: 128, cost: "FRw 410,000,000" },
    uk: { total: 80, expats: 22, local: 58, cost: "£295,000" },
    us: { total: 120, expats: 25, local: 95, cost: "$580,000" },
  };

  const metrics = headcountMap[entity] || headcountMap.kenya;

  // Render Employee Self-Service (ESS) Specific Dashboard
  if (persona === "employee") {
    return (
      <div className="space-y-6">
        {/* ESS Header Banner */}
        <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">{entityInfo.flag}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)]">
                {entityInfo.name}
              </span>
              <span className="text-xs font-mono text-[var(--gray-muted)]">
                • Self-Service (ESS)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--gray-text)]">
              Welcome back, Nelson Mandela
            </h1>
            <p className="text-xs text-[var(--gray-muted)]">
              Principal Operations Engineer • Station: Nairobi Industrial Plant (PLT-NRB-02)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setClockedIn(!clockedIn)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2 ${
                clockedIn
                  ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                  : "bg-[var(--emerald-deep)] text-white hover:bg-[var(--emerald-deep-hover)]"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>{clockedIn ? "Punch Duty Rest (Clock Out)" : "Punch In (GPS Verified)"}</span>
            </button>

            <Link
              href="/portal/benefits"
              className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition flex items-center gap-1.5 shadow-xs"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Cashout Wage (EWA)</span>
            </Link>
          </div>
        </div>

        {/* ESS 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Leave Balance */}
          <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--gray-muted)]">Annual Leave Balance</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-[var(--emerald-deep)] flex items-center justify-center">
                <CalendarDays className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-[var(--gray-text)] font-mono">18.0 Days</h3>
              <p className="text-[11px] text-[var(--gray-muted)]">Accrued this year (21 days annual allowance)</p>
            </div>
            <Link href="/portal/leave-shutdowns" className="text-[11px] font-bold text-[var(--emerald-deep)] hover:underline inline-block pt-1">
              Apply for Leave →
            </Link>
          </div>

          {/* Card 2: Next Payday */}
          <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--gray-muted)]">Next Payday Countdown</span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-[var(--gray-text)] font-mono">11 Days Left</h3>
              <p className="text-[11px] text-[var(--gray-muted)]">Disbursal: Sep 28, 2026 • Citibank Kenya</p>
            </div>
            <Link href="/portal/payroll" className="text-[11px] font-bold text-blue-600 hover:underline inline-block pt-1">
              View Payslip Archive →
            </Link>
          </div>

          {/* Card 3: Earned Wage Available */}
          <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--gray-muted)]">On-Demand Wage (EWA)</span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-[var(--gray-text)] font-mono">KES 42,500</h3>
              <p className="text-[11px] text-emerald-700 font-semibold">Available for instant M-Pesa cashout</p>
            </div>
            <Link href="/portal/benefits" className="text-[11px] font-bold text-amber-700 hover:underline inline-block pt-1">
              Transfer to Wallet →
            </Link>
          </div>

          {/* Card 4: Document Expiry Alert */}
          <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--gray-muted)]">Vault Action Items</span>
              <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <FileCheck2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-rose-600 font-mono">1 Unsigned</h3>
              <p className="text-[11px] text-[var(--gray-muted)]">Anti-Bribery Policy v2026.2 awaiting signature</p>
            </div>
            <Link href="/portal/my-documents" className="text-[11px] font-bold text-rose-600 hover:underline inline-block pt-1">
              Sign Policy Now →
            </Link>
          </div>
        </div>

        {/* ESS Shortcuts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[var(--gray-text)] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--emerald-deep)]" />
              <span>Shift Group & Duty Status</span>
            </h3>
            <p className="text-xs text-[var(--gray-muted)]">
              Assigned to <strong>Shift B (14:00 - 22:00)</strong> at Nairobi Industrial Plant. 12-hour mandatory rest interval verified before start.
            </p>
            <div className="p-3 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] flex items-center justify-between text-xs">
              <span>Next Shift: Tomorrow 14:00</span>
              <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Rest Guard OK</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[var(--gray-text)] flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[var(--emerald-deep)]" />
              <span>Recent Expense Claim</span>
            </h3>
            <p className="text-xs text-[var(--gray-muted)]">
              Claim <strong>#CLM-2026-091</strong> (KES 68,500 for Emergency Boiler Valve) is currently under review by Sarah Wanjiku.
            </p>
            <div className="p-3 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] flex items-center justify-between text-xs">
              <span>Status: In Verification Queue</span>
              <Link href="/portal/claims-advances" className="font-bold text-[var(--emerald-deep)] hover:underline">
                View →
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[var(--gray-text)] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--emerald-deep)]" />
              <span>Workplace Kudos Cheer</span>
            </h3>
            <p className="text-xs text-[var(--gray-muted)]">
              You received 19 cheers from Kennedy Omondi for &quot;Zero Hazard handover checklist on Kisumu Depot relocation&quot;.
            </p>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-950">Safety Champion 🛡️</span>
              <Link href="/portal/social" className="font-bold text-[var(--emerald-deep)] hover:underline">
                Kudos Wall →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Line Manager (MSS) Specific Dashboard
  if (persona === "manager") {
    return (
      <div className="space-y-6">
        {/* Manager Header Banner */}
        <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">{entityInfo.flag}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Line Manager & Supervisor Hub
              </span>
              <span className="text-xs font-mono text-[var(--gray-muted)]">
                • Operations & Logistics
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--gray-text)]">
              Department Operations Cockpit
            </h1>
            <p className="text-xs text-[var(--gray-muted)]">
              5 Direct Reports • Continuous 24/7 Shift Adherence • Delegation of Authority Active ($5,000 Cap)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/portal/approvals"
              className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] shadow-xs transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Approvals Queue ({approvals.filter((a) => a.status === "pending").length})</span>
            </Link>
            <Link
              href="/portal/team"
              className="px-4 py-2 rounded-xl bg-white border border-[var(--gray-border)] hover:bg-[var(--cool-gray)] text-xs font-bold text-[var(--gray-text)] transition shadow-2xs"
            >
              My Team Roster
            </Link>
          </div>
        </div>

        {/* Manager 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
            <span className="text-xs font-bold text-[var(--gray-muted)]">Pending Approvals</span>
            <h3 className="text-2xl font-extrabold text-amber-700 font-mono">
              {approvals.filter((a) => a.status === "pending").length} Items
            </h3>
            <p className="text-[11px] text-[var(--gray-muted)]">Leave, Expenses, Advances & Swaps</p>
            <Link href="/portal/approvals" className="text-[11px] font-bold text-[var(--emerald-deep)] hover:underline inline-block pt-1">
              Review Queue →
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
            <span className="text-xs font-bold text-[var(--gray-muted)]">Team On-Duty Status</span>
            <h3 className="text-2xl font-extrabold text-[var(--emerald-deep)] font-mono">3 / 5 Active</h3>
            <p className="text-[11px] text-[var(--gray-muted)]">2 On-Site • 1 12h Rest • 1 On Leave</p>
            <Link href="/portal/team" className="text-[11px] font-bold text-[var(--emerald-deep)] hover:underline inline-block pt-1">
              Department Roster →
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
            <span className="text-xs font-bold text-[var(--gray-muted)]">12-Hour Rest Fatigue Guard</span>
            <h3 className="text-2xl font-extrabold text-[var(--emerald-deep)] font-mono">0 Violations</h3>
            <p className="text-[11px] text-emerald-700 font-semibold">100% Shift Rest Compliance</p>
            <span className="text-[10px] text-zinc-400">Automated Roster Interlock</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
            <span className="text-xs font-bold text-[var(--gray-muted)]">Delegation Proxy (DoA)</span>
            <h3 className="text-lg font-extrabold text-[var(--gray-text)]">Sarah Jenkins</h3>
            <p className="text-[11px] text-[var(--gray-muted)]">Scheduled: Oct 10 - Oct 18 ($5k Cap)</p>
            <Link href="/portal/team#delegation" className="text-[11px] font-bold text-purple-700 hover:underline inline-block pt-1">
              Manage Rules →
            </Link>
          </div>
        </div>

        {/* Approvals Action Queue List */}
        <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--gray-text)]">
              Action Items Requiring Your Signature
            </h2>
            <Link href="/portal/approvals" className="text-xs font-bold text-[var(--emerald-deep)] hover:underline">
              View Full Hub →
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {approvals.map((item) => {
              const IconComp = item.icon;
              const isDone = item.status === "approved";

              return (
                <div key={item.id} className="py-3 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                      <IconComp className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-[var(--gray-text)] truncate">{item.title}</p>
                      <p className="text-[11px] text-[var(--gray-muted)] truncate">
                        {item.employee} • <span className="font-semibold text-zinc-700">{item.amount}</span>
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isDone ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                        Approved
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApprove(item.id)}
                        className="px-3 py-1 rounded-lg bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Default: Executive & Super Admin Cockpit
  return (
    <div className="space-y-6">
      {/* 1. Page Header & Welcome Banner */}
      <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{entityInfo.flag}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)]">
              {entityInfo.name}
            </span>
            <span className="text-xs font-mono text-[var(--gray-muted)]">
              • Mode: {personaInfo.title}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--gray-text)]">
            Executive & Operational Cockpit
          </h1>
          <p className="text-xs text-[var(--gray-muted)]">
            Continuous 24/7 workforce operations, multi-currency payroll, and instant out-of-payroll disbursals.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setClockedIn(!clockedIn)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2 ${
              clockedIn
                ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                : "bg-[var(--emerald-deep)] text-white hover:bg-[var(--emerald-deep-hover)]"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>{clockedIn ? "Punch Clock (Duty Rest)" : "Punch Clock In"}</span>
          </button>

          <Link
            href="/portal/claims-advances"
            className="px-3.5 py-2 rounded-xl bg-white border border-[var(--gray-border)] hover:bg-[var(--cool-gray)] text-xs font-bold text-[var(--gray-text)] transition flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5 text-[var(--emerald-deep)]" />
            <span>Travel Advance</span>
          </Link>

          <Link
            href="/portal/leave-shutdowns"
            className="px-3.5 py-2 rounded-xl bg-white border border-[var(--gray-border)] hover:bg-[var(--cool-gray)] text-xs font-bold text-[var(--gray-text)] transition flex items-center gap-1.5 shadow-2xs"
          >
            <CalendarDays className="h-3.5 w-3.5 text-[var(--emerald-deep)]" />
            <span>Request Leave</span>
          </Link>

          <Link
            href="/portal/payroll"
            className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            <span>Pay Run Cockpit</span>
          </Link>
        </div>
      </div>

      {/* 2. 4 Glanceable KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Workforce */}
        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)]">Active Workforce</span>
            <div className="h-8 w-8 rounded-lg bg-[var(--emerald-light)] text-[var(--emerald-deep)] flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-[var(--gray-text)] font-mono">
              {metrics.total.toLocaleString()}
            </h3>
            <p className="text-[11px] text-[var(--gray-muted)] mt-0.5">
              {metrics.local} Local Staff • {metrics.expats} Expatriates
            </p>
          </div>
          <div className="pt-2 border-t border-[var(--gray-border)] flex items-center justify-between text-[11px]">
            <span className="text-[var(--emerald-deep)] font-bold flex items-center gap-0.5">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+3.8% MoM</span>
            </span>
            <Link href="/portal/workforce" className="text-[var(--gray-muted)] hover:text-[var(--emerald-deep)] font-semibold">
              Directory →
            </Link>
          </div>
        </div>

        {/* Card 2: Monthly Payroll & Cost */}
        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)]">Monthly Gross Payroll</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-[var(--gray-text)] font-mono">
              {metrics.cost}
            </h3>
            <p className="text-[11px] text-[var(--emerald-deep)] font-semibold mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
              <span>0.00 Cent Variance • Draft Open</span>
            </p>
          </div>
          <div className="pt-2 border-t border-[var(--gray-border)] flex items-center justify-between text-[11px]">
            <span className="text-zinc-500 font-mono">Cut-off: 25th</span>
            <Link href="/portal/payroll" className="text-[var(--gray-muted)] hover:text-[var(--emerald-deep)] font-semibold">
              Review Run →
            </Link>
          </div>
        </div>

        {/* Card 3: 24/7 Continuous Shift Status */}
        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)]">24/7 Operations Radar</span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-[var(--gray-text)]">
              Shift B • On Duty
            </h3>
            <p className="text-[11px] text-[var(--gray-muted)] mt-0.5">
              Afternoon Crew (14:00 - 22:00) • 98.4% Presence
            </p>
          </div>
          <div className="pt-2 border-t border-[var(--gray-border)] flex items-center justify-between text-[11px]">
            <span className="text-[var(--emerald-deep)] font-bold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>12h Rest Compliant</span>
            </span>
            <Link href="/portal/time-shifts" className="text-[var(--gray-muted)] hover:text-[var(--emerald-deep)] font-semibold">
              Roster →
            </Link>
          </div>
        </div>

        {/* Card 4: Action Inbox */}
        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)]">Pending Approvals</span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileCheck2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-[var(--gray-text)] font-mono">
              {approvals.filter((a) => a.status === "pending").length} Items
            </h3>
            <p className="text-[11px] text-[var(--gray-muted)] mt-0.5">
              Advances, Leave & Bank Payout Sign-offs
            </p>
          </div>
          <div className="pt-2 border-t border-[var(--gray-border)] flex items-center justify-between text-[11px]">
            <span className="text-amber-600 font-bold">Dual-Key Required</span>
            <span className="text-[10px] font-mono text-zinc-400">SHA-256 Vault</span>
          </div>
        </div>
      </div>

      {/* 3. Action Items Queue & 24/7 Shift Monitor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Approvals Queue (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--gray-text)]">
                Action Items & Verification Queue
              </h2>
              <p className="text-xs text-[var(--gray-muted)]">
                Fast-track approvals with cryptographic audit trail
              </p>
            </div>
            <span className="text-xs font-bold text-[var(--emerald-deep)] px-2.5 py-1 rounded-full bg-[var(--emerald-light)]">
              {approvals.filter((a) => a.status === "pending").length} Pending
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {approvals.map((item) => {
              const IconComp = item.icon;
              const isDone = item.status === "approved";

              return (
                <div
                  key={item.id}
                  className="py-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${item.color}`}
                    >
                      <IconComp className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-bold text-[var(--gray-text)] truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[var(--gray-muted)] truncate">
                        {item.employee} • <span className="font-semibold text-zinc-700">{item.amount}</span>
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono">{item.date}</p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                    {isDone ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--emerald-light)] text-[var(--emerald-deep)] text-xs font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
                        <span>Signed & Sealed</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => handleApprove(item.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: 24/7 Shift Radar & Corporate Shutdown Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Shift Radar Box */}
          <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-[var(--gray-text)]">
                  Continuous 24/7 Operations
                </h3>
                <p className="text-xs text-[var(--gray-muted)]">
                  Plant & Mining FIFO Shift Adherence
                </p>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--emerald-mint)] animate-pulse" />
            </div>

            <div className="space-y-3">
              {/* Shift 1 */}
              <div className="p-3 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--gray-text)]">
                    Crew A • Morning Shift (06:00 - 14:00)
                  </p>
                  <p className="text-[11px] text-[var(--gray-muted)]">
                    120 Operators • Completed (Handover Cleared)
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                  Off Duty
                </span>
              </div>

              {/* Shift 2 (Active) */}
              <div className="p-3 rounded-2xl bg-[var(--emerald-light)] border border-[var(--emerald-border)] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--emerald-deep)]">
                    Crew B • Afternoon Shift (14:00 - 22:00)
                  </p>
                  <p className="text-[11px] text-[var(--emerald-deep)]">
                    118 Operators On-Site • GPS Verified Punch
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--emerald-deep)] text-white">
                  Active Now
                </span>
              </div>

              {/* Shift 3 (Upcoming) */}
              <div className="p-3 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--gray-text)]">
                    Crew C • Night Shift FIFO (22:00 - 06:00)
                  </p>
                  <p className="text-[11px] text-[var(--gray-muted)]">
                    95 Operators • Mandatory 12h Rest Confirmed
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Queued
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-[var(--gray-muted)]">Fatigue Safeguard:</span>
              <span className="font-bold text-[var(--emerald-deep)] flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-[var(--emerald-mint)]" />
                <span>100% Zero Violations</span>
              </span>
            </div>
          </div>

          {/* Quick Module Access Shortcuts */}
          <div className="p-5 rounded-3xl bg-[var(--cool-gray)] border border-[var(--gray-border)] flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[var(--gray-text)]">
                Corporate Holiday Shutdown
              </p>
              <p className="text-[11px] text-[var(--gray-muted)]">
                Dec 24 - Jan 2 Auto-Debit scheduled
              </p>
            </div>
            <Link
              href="/portal/leave-shutdowns"
              className="px-3 py-1.5 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition"
            >
              Manage
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Financial Disbursals, Statutory & Remittance Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-[var(--emerald-deep)] font-bold text-xs">
            <Receipt className="h-4 w-4" />
            <span>Non-Payroll Travel Advances</span>
          </div>
          <p className="text-xl font-extrabold text-[var(--gray-text)] font-mono">
            {entityInfo.symbol} 24,850.00
          </p>
          <p className="text-[11px] text-[var(--gray-muted)]">
            Disbursed directly via bank EFT & mobile money outside payroll.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
            <Building2 className="h-4 w-4" />
            <span>Sacco & Insurance Remittances</span>
          </div>
          <p className="text-xl font-extrabold text-[var(--gray-text)] font-mono">
            {entityInfo.symbol} 48,200.00
          </p>
          <p className="text-[11px] text-[var(--gray-muted)]">
            Automated third-party disbursal (Sacco loans, deposits, education policies).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-purple-600 font-bold text-xs">
            <ShieldCheck className="h-4 w-4" />
            <span>Balanced General Ledger Sync</span>
          </div>
          <p className="text-xl font-extrabold text-[var(--gray-text)] font-mono">
            Debits = Credits
          </p>
          <p className="text-[11px] text-[var(--gray-muted)]">
            Subledger double-entry vouchers verified to the exact cent.
          </p>
        </div>
      </div>
    </div>
  );
}
