"use client";

import React, { useState } from "react";
import {
  Receipt,
  Plane,
  Plus,
  CheckCircle2,
  Download,
  ShieldCheck,
  Camera,
  FileCheck2,
  DollarSign,
  ArrowRight,
  Filter,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";

export default function ClaimsAdvancesPage() {
  const { entityInfo } = usePortal();
  const [activeTab, setActiveTab] = useState<"advances" | "claims" | "perdiem">("advances");

  const [advances, setAdvances] = useState([
    {
      id: "ADV-8891",
      employee: "Sarah Jenkins (EMP-3104)",
      destination: "Mombasa Regional Site Survey",
      amount: `${entityInfo.symbol} 450.00`,
      disbursalChannel: "Mobile Money (M-Pesa) • Instant",
      tripDates: "Sep 18 - Sep 21, 2026",
      status: "Disbursed (Awaiting Post-Trip Receipts)",
    },
    {
      id: "ADV-8894",
      employee: "David Omondi (EMP-2190)",
      destination: "Dar es Salaam Port Logistics Audit",
      amount: `${entityInfo.symbol} 600.00`,
      disbursalChannel: "Direct Bank Transfer (EFT)",
      tripDates: "Sep 24 - Sep 28, 2026",
      status: "Approved for Disbursal",
    },
    {
      id: "ADV-8882",
      employee: "Nelson Mandela CP (EMP-4091)",
      destination: "Kigali Data Center Expansion Review",
      amount: `${entityInfo.symbol} 850.00`,
      disbursalChannel: "Direct Bank Transfer (EFT)",
      tripDates: "Aug 28 - Sep 02, 2026",
      status: "Reconciled & Closed (0.00 Variance)",
    },
  ]);

  const [claims, setClaims] = useState([
    {
      id: "CLM-9012",
      employee: "Nelson Mandela CP",
      category: "Client Technical Dinner & Strategy",
      amount: `${entityInfo.symbol} 125.40`,
      receiptAttached: "REC-9821-INV.pdf (Tax Invoice Cleared)",
      status: "Approved",
    },
    {
      id: "CLM-9015",
      employee: "Amina Mugisha",
      category: "Regional Data SIM & Fiber Roaming",
      amount: `${entityInfo.symbol} 45.00`,
      receiptAttached: "MTN-ROAM-881.jpg (Cleared)",
      status: "Approved",
    },
    {
      id: "CLM-9019",
      employee: "Dr. Sarah Jenkins",
      category: "Field Vehicle Emergency Fuel & Repair",
      amount: `${entityInfo.symbol} 180.00`,
      receiptAttached: "TOTAL-FUEL-441.pdf (Cleared)",
      status: "Under Review",
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-[var(--emerald-deep)]" />
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--gray-text)]">
              Travel Cash Advances & Expense Reconciliation
            </h1>
          </div>
          <p className="text-xs text-[var(--gray-muted)] mt-0.5">
            Pre-trip instant cash disbursals (outside payroll), scale-rate per diem, and OCR fiscal receipt reconciliation.
          </p>
        </div>

        <button
          type="button"
          suppressHydrationWarning
          className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Travel Advance Request</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-white p-1 rounded-xl border border-[var(--gray-border)] shadow-xs w-fit">
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("advances")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === "advances"
              ? "bg-[var(--emerald-deep)] text-white shadow-xs"
              : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
          }`}
        >
          Pre-Trip Cash Advances
        </button>
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("claims")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === "claims"
              ? "bg-[var(--emerald-deep)] text-white shadow-xs"
              : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
          }`}
        >
          Post-Trip Receipts & Reimbursements
        </button>
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("perdiem")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === "perdiem"
              ? "bg-[var(--emerald-deep)] text-white shadow-xs"
              : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
          }`}
        >
          Scale-Rate Per Diem Tables
        </button>
      </div>

      {/* Tab 1: Pre-Trip Advances */}
      {activeTab === "advances" && (
        <div className="rounded-2xl border border-[var(--gray-border)] bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[var(--gray-border)] bg-[var(--cool-gray)] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[var(--gray-text)] uppercase tracking-wider">
                Out-of-Payroll Advance Disbursals ({entityInfo.name})
              </h3>
              <p className="text-[11px] text-[var(--gray-muted)]">
                Direct mobile money & bank payouts before travel departure
              </p>
            </div>
            <span className="text-xs font-bold text-[var(--emerald-deep)] bg-[var(--emerald-light)] px-2.5 py-1 rounded-full">
              Real-Time Settlement
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-white border-b border-[var(--gray-border)] text-[11px] font-bold text-[var(--gray-muted)]">
                <tr>
                  <th className="py-3 px-4">Advance ID & Staff</th>
                  <th className="py-3 px-4">Destination & Purpose</th>
                  <th className="py-3 px-4">Advance Amount</th>
                  <th className="py-3 px-4">Disbursal Channel</th>
                  <th className="py-3 px-4">Travel Dates</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {advances.map((adv) => (
                  <tr key={adv.id} className="hover:bg-[var(--cool-gray)] transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-[var(--gray-text)]">{adv.employee}</p>
                      <p className="text-[10px] font-mono text-[var(--gray-muted)]">{adv.id}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-700">{adv.destination}</td>
                    <td className="py-3 px-4 font-bold font-mono text-sm text-[var(--emerald-deep)]">{adv.amount}</td>
                    <td className="py-3 px-4 text-[11px] text-[var(--gray-muted)]">{adv.disbursalChannel}</td>
                    <td className="py-3 px-4 text-[11px] text-[var(--gray-muted)]">{adv.tripDates}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          adv.status.includes("Reconciled")
                            ? "bg-[var(--emerald-light)] text-[var(--emerald-deep)]"
                            : "bg-blue-50 text-blue-800"
                        }`}
                      >
                        {adv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Claims & Receipts */}
      {activeTab === "claims" && (
        <div className="rounded-2xl border border-[var(--gray-border)] bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[var(--gray-border)] bg-[var(--cool-gray)] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[var(--gray-text)] uppercase tracking-wider">
                OCR Fiscal Receipt Clearance & Out-of-Pocket Claims
              </h3>
              <p className="text-[11px] text-[var(--gray-muted)]">
                Validated against tax authority control numbers
              </p>
            </div>
            <button
              type="button"
              suppressHydrationWarning
              className="px-3 py-1 rounded-lg bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition flex items-center gap-1"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Upload Receipt</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-white border-b border-[var(--gray-border)] text-[11px] font-bold text-[var(--gray-muted)]">
                <tr>
                  <th className="py-3 px-4">Claim ID & Employee</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Attached Tax Invoice</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {claims.map((clm) => (
                  <tr key={clm.id} className="hover:bg-[var(--cool-gray)] transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-[var(--gray-text)]">{clm.employee}</p>
                      <p className="text-[10px] font-mono text-[var(--gray-muted)]">{clm.id}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-700">{clm.category}</td>
                    <td className="py-3 px-4 font-bold font-mono text-sm text-[var(--gray-text)]">{clm.amount}</td>
                    <td className="py-3 px-4 text-[11px] text-[var(--emerald-deep)] font-semibold flex items-center gap-1 mt-2">
                      <CheckCircle2 className="h-3 w-3 text-[var(--emerald-mint)]" />
                      <span>{clm.receiptAttached}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--emerald-light)] text-[var(--emerald-deep)]">
                        {clm.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Per Diem Scale Rates */}
      {activeTab === "perdiem" && (
        <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-[var(--gray-text)]">
              Official Scale-Rate Per Diem Allowance Matrix
            </h3>
            <p className="text-xs text-[var(--gray-muted)]">
              When traveling on approved business, employees receive scale-rate daily per diem without collecting meal receipts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-2">
              <p className="text-xs font-bold text-[var(--gray-text)]">Domestic City Travel</p>
              <p className="text-xl font-extrabold text-[var(--emerald-deep)] font-mono">$75.00 / day</p>
              <p className="text-[11px] text-[var(--gray-muted)]">Breakfast, lunch, dinner & local transit.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-2">
              <p className="text-xs font-bold text-[var(--gray-text)]">Remote Mine / Plant Site</p>
              <p className="text-xl font-extrabold text-[var(--emerald-deep)] font-mono">$120.00 / day</p>
              <p className="text-[11px] text-[var(--gray-muted)]">Includes remote site hardship component.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-2">
              <p className="text-xs font-bold text-[var(--gray-text)]">International Cross-Border</p>
              <p className="text-xl font-extrabold text-[var(--emerald-deep)] font-mono">$220.00 / day</p>
              <p className="text-[11px] text-[var(--gray-muted)]">Standard international travel scale rate.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
