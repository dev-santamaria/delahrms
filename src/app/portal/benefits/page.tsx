"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Shield,
  Heart,
  Users,
  CheckCircle2,
  DollarSign,
  Plus,
  ArrowRight,
  Sparkles,
  AlertCircle,
  FileText,
  Clock,
  Send,
  Zap,
  Check,
  X,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";

interface Dependent {
  id: string;
  name: string;
  relationship: "spouse" | "child" | "parent";
  dob: string;
  nationalIdOrBirthCert: string;
  status: "verified" | "pending";
}

export default function BenefitsPage() {
  const { entityInfo } = usePortal();

  const [activeTab, setActiveTab] = useState<"ewa" | "health" | "dependents" | "wellness">("ewa");

  // EWA Interactive State
  const monthlyGrossSalary = 180000;
  const accruedEarnedWage = 85000; // Worked 17 days
  const maxAllowableCashout = 42500; // 50% cap
  const [cashoutAmount, setCashoutAmount] = useState<number>(20000);
  const [disbursalRail, setDisbursalRail] = useState<"mpesa" | "bank">("mpesa");
  const [cashoutModalOpen, setCashoutModalOpen] = useState(false);
  const [cashoutSuccess, setCashoutSuccess] = useState(false);

  // Fee calculation: 2.5% fixed convenience fee
  const fee = Math.round(cashoutAmount * 0.025);
  const netReceived = cashoutAmount - fee;

  // Dependents state
  const [dependents, setDependents] = useState<Dependent[]>([
    {
      id: "dep-1",
      name: "Winnie Achieng Mandela",
      relationship: "spouse",
      dob: "1992-05-14",
      nationalIdOrBirthCert: "ID-30192847",
      status: "verified",
    },
    {
      id: "dep-2",
      name: "Samantha Wanjiru Mandela",
      relationship: "child",
      dob: "2020-08-22",
      nationalIdOrBirthCert: "BC-2020-009182",
      status: "verified",
    },
  ]);

  const [depModalOpen, setDepModalOpen] = useState(false);
  const [depName, setDepName] = useState("");
  const [depRel, setDepRel] = useState<"spouse" | "child" | "parent">("child");
  const [depDob, setDepDob] = useState("");
  const [depDoc, setDepDoc] = useState("");

  const handleCashoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCashoutSuccess(true);
    setTimeout(() => {
      setCashoutModalOpen(false);
      setCashoutSuccess(false);
    }, 2500);
  };

  const handleAddDependent = (e: React.FormEvent) => {
    e.preventDefault();
    const newDep: Dependent = {
      id: `dep-${Date.now()}`,
      name: depName,
      relationship: depRel,
      dob: depDob,
      nationalIdOrBirthCert: depDoc,
      status: "pending",
    };
    setDependents((prev) => [...prev, newDep]);
    setDepModalOpen(false);
    setDepName("");
    setDepDob("");
    setDepDoc("");
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)]">
              Flexible Benefits & Wellbeing
            </span>
            <span className="text-xs font-mono text-[var(--gray-muted)]">
              Grade G7 (Executive Tier 1)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--gray-text)] mt-1">
            Benefits & Earned Wage Access (EWA)
          </h1>
          <p className="text-xs text-[var(--gray-muted)] mt-0.5">
            Instant on-demand earned wage cashouts, comprehensive health insurance coverage, and family dependent registration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("ewa");
              setCashoutModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] shadow-xs transition flex items-center gap-1.5"
          >
            <Zap className="h-4 w-4" />
            <span>Instant EWA Cashout</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--gray-border)] pb-2 overflow-x-auto">
        {[
          { key: "ewa", label: "Earned Wage Access (EWA)", icon: Wallet, badge: "Instant Pay" },
          { key: "health", label: "Health & Medical Cover", icon: Shield },
          { key: "dependents", label: `Dependents (${dependents.length})`, icon: Users },
          { key: "wellness", label: "Wellness & Lifestyle Perks", icon: Heart },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "bg-white text-[var(--emerald-deep)] border border-[var(--gray-border)] shadow-xs"
                  : "text-[var(--gray-muted)] hover:text-[var(--gray-text)] hover:bg-gray-100/60"
              }`}
            >
              <IconComp className={`h-3.5 w-3.5 ${isActive ? "text-[var(--emerald-deep)]" : ""}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: Earned Wage Access (EWA) */}
      {activeTab === "ewa" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* EWA Interactive Cashout Calculator (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[var(--emerald-deep)]" />
                  <span>On-Demand Earned Wage Cashout Calculator</span>
                </h2>
                <p className="text-xs text-[var(--gray-muted)]">
                  Access wages you have already earned this month before official payday without predatory loan interest.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                1/3 Net Pay Safeguard Active
              </span>
            </div>

            {/* Accrual Card */}
            <div className="p-5 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--gray-muted)]">Days Worked This Month</span>
                  <p className="text-lg font-mono font-extrabold text-[var(--gray-text)]">17 / 30 Days</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--gray-muted)]">Accrued Earned Wage</span>
                  <p className="text-lg font-mono font-extrabold text-[var(--emerald-deep)]">KES {accruedEarnedWage.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--gray-muted)]">Max Allowable (50%)</span>
                  <p className="text-lg font-mono font-extrabold text-zinc-800">KES {maxAllowableCashout.toLocaleString()}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[var(--gray-muted)]">
                  <span>Accrual Progress</span>
                  <span>56.7% of monthly cycle</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-[var(--emerald-deep)] rounded-full" style={{ width: "56.7%" }} />
                </div>
              </div>
            </div>

            {/* Interactive Amount Slider */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--gray-text)]">Select Cashout Amount</label>
                <span className="text-lg font-mono font-extrabold text-[var(--emerald-deep)]">
                  KES {cashoutAmount.toLocaleString()}
                </span>
              </div>

              <input
                type="range"
                min={2000}
                max={maxAllowableCashout}
                step={1000}
                value={cashoutAmount}
                onChange={(e) => setCashoutAmount(Number(e.target.value))}
                className="w-full accent-[var(--emerald-deep)] cursor-pointer"
              />

              <div className="flex justify-between text-[10px] font-mono text-[var(--gray-muted)]">
                <span>Min: KES 2,000</span>
                <span>Max: KES {maxAllowableCashout.toLocaleString()}</span>
              </div>
            </div>

            {/* Disbursal Rail Selection */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-[var(--gray-text)]">Payout Rail</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDisbursalRail("mpesa")}
                  className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                    disbursalRail === "mpesa"
                      ? "border-[var(--emerald-deep)] bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-bold shadow-xs"
                      : "border-[var(--gray-border)] hover:bg-gray-50 text-[var(--gray-text)]"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold">M-Pesa Instant B2C</p>
                    <p className="text-[10px] text-[var(--gray-muted)] font-mono">+254 712 345 678</p>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">15s</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDisbursalRail("bank")}
                  className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                    disbursalRail === "bank"
                      ? "border-[var(--emerald-deep)] bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-bold shadow-xs"
                      : "border-[var(--gray-border)] hover:bg-gray-50 text-[var(--gray-text)]"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold">Standard Chartered</p>
                    <p className="text-[10px] text-[var(--gray-muted)] font-mono">•••• 9281 (EFT)</p>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">2h</span>
                </button>
              </div>
            </div>

            {/* Fee & Breakdown Box */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-2">
              <div className="flex justify-between text-[var(--gray-muted)]">
                <span>Requested Wage Cashout:</span>
                <span className="font-mono font-bold text-[var(--gray-text)]">KES {cashoutAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[var(--gray-muted)]">
                <span>Flat Technology Convenience Fee (2.5%):</span>
                <span className="font-mono text-zinc-700">KES {fee.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm text-[var(--gray-text)]">
                <span>Total Net Disbursed:</span>
                <span className="font-mono text-[var(--emerald-deep)]">KES {netReceived.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCashoutModalOpen(true)}
              className="w-full py-3 rounded-2xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] shadow-xs transition flex items-center justify-center gap-2"
            >
              <Zap className="h-4 w-4" />
              <span>Confirm & Disburse KES {netReceived.toLocaleString()}</span>
            </button>
          </div>

          {/* EWA Safeguard Information Card (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-[var(--emerald-deep)] font-bold text-xs">
                <Shield className="h-4 w-4" />
                <span>Statutory 1/3 Rule Protection</span>
              </div>
              <p className="text-xs text-[var(--gray-muted)] leading-relaxed">
                In compliance with the Kenya Employment Act, DelaHR automatically ensures that total deductions (statutory taxes, loans, SACCOs, and EWA advances) never breach the mandatory <strong>one-third take-home pay threshold</strong>.
              </p>
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <p className="font-bold">Guaranteed Take-Home Pay:</p>
                <p className="font-mono font-extrabold text-base text-[var(--emerald-deep)]">
                  KES {(monthlyGrossSalary / 3).toLocaleString()}
                </p>
                <p className="text-[10px] text-emerald-800">Protected against all checkoffs.</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">Previous EWA Cashouts</h3>
              <div className="divide-y divide-gray-100 text-xs">
                <div className="py-2.5 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[var(--gray-text)]">KES 15,000.00</p>
                    <p className="text-[10px] text-[var(--gray-muted)]">Aug 18, 2026 • M-Pesa B2C</p>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Deducted in Payroll</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[var(--gray-text)]">KES 20,000.00</p>
                    <p className="text-[10px] text-[var(--gray-muted)]">Jul 12, 2026 • M-Pesa B2C</p>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Deducted in Payroll</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Health & Medical Cover */}
      {activeTab === "health" && (
        <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
                <Shield className="h-4 w-4 text-[var(--emerald-deep)]" />
                <span>Executive Tier 1 Health Cover (Jubilee / CIC Consortium)</span>
              </h2>
              <p className="text-xs text-[var(--gray-muted)] mt-0.5">
                Comprehensive inpatient, outpatient, dental, optical, and maternity coverage for employee and enrolled dependents.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 self-start sm:self-auto">
              Policy #MED-2026-G7
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">Inpatient Limit</span>
              <p className="text-lg font-mono font-extrabold text-[var(--gray-text)]">KES 5,000,000</p>
              <span className="text-[10px] text-emerald-700 font-semibold">Per Family / Year</span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">Outpatient Limit</span>
              <p className="text-lg font-mono font-extrabold text-[var(--gray-text)]">KES 250,000</p>
              <span className="text-[10px] text-emerald-700 font-semibold">Per Person / Year</span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">Dental Cover</span>
              <p className="text-lg font-mono font-extrabold text-[var(--gray-text)]">KES 50,000</p>
              <span className="text-[10px] text-zinc-500">Includes orthodontics</span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">Optical & Frames</span>
              <p className="text-lg font-mono font-extrabold text-[var(--gray-text)]">KES 40,000</p>
              <span className="text-[10px] text-zinc-500">Lenses & consultations</span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">Maternity Benefit</span>
              <p className="text-lg font-mono font-extrabold text-[var(--gray-text)]">KES 150,000</p>
              <span className="text-[10px] text-zinc-500">Normal & C-Section</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Dependents */}
      {activeTab === "dependents" && (
        <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--emerald-deep)]" />
                <span>Enrolled Dependents for Medical & Life Cover</span>
              </h2>
              <p className="text-xs text-[var(--gray-muted)]">
                Up to 1 spouse and 4 biological/legally adopted children covered under corporate group policy.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDepModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Dependent</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dependents.map((dep) => (
              <div key={dep.id} className="p-5 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[var(--gray-text)]">{dep.name}</p>
                    <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-white border border-[var(--gray-border)] uppercase text-gray-700">
                      {dep.relationship}
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    dep.status === "verified" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {dep.status === "verified" ? "Verified" : "Under Review"}
                  </span>
                </div>
                <div className="text-xs text-[var(--gray-muted)] space-y-0.5">
                  <p>Date of Birth: {dep.dob}</p>
                  <p>Statutory ID / Certificate: <span className="font-mono">{dep.nationalIdOrBirthCert}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Wellness & Perks */}
      {activeTab === "wellness" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Heart className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-[var(--gray-text)]">Gym & Fitness Subsidy</h3>
            <p className="text-xs text-[var(--gray-muted)]">
              Up to $50 (KES 6,500) per month reimbursed for verified gym, swimming, or sports club memberships.
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Enrolled • Claim via Expenses
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-[var(--gray-text)]">Employee Assistance Program (EAP)</h3>
            <p className="text-xs text-[var(--gray-muted)]">
              24/7 confidential psychological counseling, work-life balance advice, and mental health support.
            </p>
            <p className="font-mono text-xs font-bold text-[var(--emerald-deep)]">Hotline: 0800 720 000 (Toll Free)</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[var(--emerald-deep)] flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-[var(--gray-text)]">Education & Professional Development</h3>
            <p className="text-xs text-[var(--gray-muted)]">
              Annual KES 150,000 bursary for professional certifications (CPA, PMP, IEEE, OSHA).
            </p>
            <Link href="/portal/training-learning" className="text-xs font-bold text-[var(--emerald-deep)] hover:underline">
              View LMS Catalog →
            </Link>
          </div>
        </div>
      )}

      {/* 4. Cashout Confirmation Modal */}
      {cashoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[var(--gray-border)] shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
                <Zap className="h-5 w-5 text-[var(--emerald-deep)]" />
                <span>Confirm EWA Disbursal</span>
              </h3>
              <button type="button" onClick={() => setCashoutModalOpen(false)} className="p-1 text-gray-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            {cashoutSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-[var(--emerald-deep)] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-[var(--gray-text)]">Disbursal Completed!</h4>
                <p className="text-xs text-[var(--gray-muted)]">
                  KES {netReceived.toLocaleString()} sent instantly to your {disbursalRail === "mpesa" ? "M-Pesa wallet" : "bank account"}.
                </p>
                <p className="text-[10px] font-mono text-zinc-400">TxRef: EWA-{Date.now().toString().slice(-6)}</p>
              </div>
            ) : (
              <form onSubmit={handleCashoutSubmit} className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                  <span className="text-xs text-emerald-800">You will receive immediately:</span>
                  <p className="text-3xl font-mono font-extrabold text-[var(--emerald-deep)]">
                    KES {netReceived.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    To: {disbursalRail === "mpesa" ? "M-Pesa (+254 712 345 678)" : "Standard Chartered (•••• 9281)"}
                  </p>
                </div>

                <div className="text-xs text-[var(--gray-muted)] space-y-1 bg-gray-50 p-3 rounded-xl">
                  <p>• Gross advance: KES {cashoutAmount.toLocaleString()}</p>
                  <p>• Technology transaction fee: KES {fee.toLocaleString()}</p>
                  <p>• Will be reconciled as an advance deduction on Sep 28 payday.</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCashoutModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs"
                  >
                    Authorize Disbursal Now
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 5. Add Dependent Modal */}
      {depModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[var(--gray-border)] shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
                <Users className="h-5 w-5 text-[var(--emerald-deep)]" />
                <span>Register Dependent for Cover</span>
              </h3>
              <button type="button" onClick={() => setDepModalOpen(false)} className="p-1 text-gray-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddDependent} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--gray-text)]">Full Name</label>
                <input
                  type="text"
                  required
                  value={depName}
                  onChange={(e) => setDepName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--gray-text)]">Relationship</label>
                <select
                  value={depRel}
                  onChange={(e) => setDepRel(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                >
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--gray-text)]">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={depDob}
                  onChange={(e) => setDepDob(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--gray-text)]">National ID or Birth Certificate No.</label>
                <input
                  type="text"
                  required
                  value={depDoc}
                  onChange={(e) => setDepDoc(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDepModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs"
                >
                  Submit for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
