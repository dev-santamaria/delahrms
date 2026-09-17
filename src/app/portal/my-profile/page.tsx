"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  Calendar,
  CreditCard,
  FileText,
  Shield,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Save,
  X,
  Copy,
  ExternalLink,
  Lock,
  Download,
  Clock,
  Sparkles,
  QrCode,
  Building2,
  DollarSign,
  HeartHandshake,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";

export default function MyProfilePage() {
  const { entityInfo, personaInfo } = usePortal();

  const [activeTab, setActiveTab] = useState<"general" | "statutory" | "banking" | "contract" | "emergency">("general");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [bankUpdateSubmitted, setBankUpdateSubmitted] = useState(false);

  // Form state for dual-key bank modification
  const [newBankName, setNewBankName] = useState("Citibank Kenya Ltd");
  const [newAccountNo, setNewAccountNo] = useState("0192837465");
  const [newBranch, setNewBranch] = useState("Upper Hill Branch (003)");
  const [changeReason, setChangeReason] = useState("Salary direct deposit account update");

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBankUpdateSubmitted(true);
    setTimeout(() => {
      setBankModalOpen(false);
      setBankUpdateSubmitted(false);
    }, 2200);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-[var(--emerald-deep)] text-white flex items-center justify-center font-extrabold text-2xl shadow-sm">
            NM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[var(--gray-text)] tracking-tight">
                Nelson Mandela CP
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)]">
                Active Staff
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                EMP-4091
              </span>
            </div>
            <p className="text-xs text-[var(--gray-muted)] mt-0.5">
              Principal Operations Engineer • Plant Logistics & Continuous 24/7 Operations
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[var(--gray-muted)]">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-[var(--emerald-deep)]" />
                <span>Nairobi Industrial Plant (PLT-NRB-02)</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-[var(--emerald-deep)]" />
                <span>Joined Oct 15, 2021 (4.9 yrs)</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBankModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] shadow-xs transition flex items-center gap-1.5"
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Request Payout Account Change</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--gray-border)] pb-1 overflow-x-auto">
        {[
          { key: "general", label: "Profile 360", icon: User },
          { key: "statutory", label: "Statutory IDs & Tax", icon: Shield },
          { key: "banking", label: "Banking & Mobile Money", icon: CreditCard },
          { key: "contract", label: "Contract & Grade", icon: Briefcase },
          { key: "emergency", label: "Emergency & Next of Kin", icon: HeartHandshake },
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
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: General Profile 360 */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-6">
            <h2 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
              <User className="h-4 w-4 text-[var(--emerald-deep)]" />
              <span>Personal Identity & Contact Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--gray-muted)]">Official Full Name</span>
                <p className="text-sm font-bold text-[var(--gray-text)]">Nelson Mandela CP</p>
                <span className="text-[10px] text-zinc-400">Matches National Identity Document</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--gray-muted)]">Corporate Email</span>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-[var(--gray-text)] truncate">nmandela@delahr.africa</p>
                  <button
                    type="button"
                    onClick={() => copyToClipboard("nmandela@delahr.africa", "email")}
                    className="p-1 hover:bg-white rounded text-gray-400 hover:text-gray-700 transition"
                  >
                    {copiedField === "email" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--gray-muted)]">Verified Mobile / WhatsApp</span>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-[var(--gray-text)]">+254 712 345 678</p>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">OTP Verified</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--gray-muted)]">Date of Birth & Gender</span>
                <p className="text-sm font-bold text-[var(--gray-text)]">July 18, 1990 (36 yrs) • Male</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1 sm:col-span-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--gray-muted)]">Physical Residential Address</span>
                <p className="text-sm font-bold text-[var(--gray-text)]">Kilimani Ridge Estate, Apartment 4B, Wood Avenue, Nairobi, Kenya</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--gray-border)]">
              <h3 className="text-xs font-bold text-[var(--gray-text)] mb-3">Line Management & Reporting Line</h3>
              <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                    SW
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--gray-text)]">Sarah Wanjiku</p>
                    <p className="text-[11px] text-[var(--gray-muted)]">VP of Engineering & Industrial Operations</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-1 rounded bg-white border border-[var(--gray-border)] text-gray-700">
                  Direct Supervisor
                </span>
              </div>
            </div>
          </div>

          {/* Quick Summary Right Card */}
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">Security & Biometrics</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--gray-text)]">Two-Factor Auth (2FA):</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Enforced</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--gray-text)]">Biometric Kiosk ID:</span>
                  <span className="font-mono text-xs font-bold text-zinc-700">FP-BIO-9921</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--gray-text)]">GPS Geofence Clocking:</span>
                  <span className="font-bold text-[var(--emerald-deep)]">150m Radius Authorized</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--emerald-light)] border border-[var(--emerald-border)] space-y-3">
              <div className="flex items-center gap-2 text-[var(--emerald-deep)] font-bold text-xs">
                <Sparkles className="h-4 w-4" />
                <span>Quick Actions</span>
              </div>
              <div className="space-y-1.5">
                <Link
                  href="/portal/claims-advances"
                  className="block w-full text-center py-2 px-3 rounded-xl bg-white border border-[var(--emerald-border)] text-xs font-bold text-[var(--emerald-deep)] hover:bg-emerald-50 transition"
                >
                  Submit Travel Advance Claim
                </Link>
                <Link
                  href="/portal/leave-shutdowns"
                  className="block w-full text-center py-2 px-3 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition"
                >
                  Book Annual Leave
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Statutory IDs & Tax */}
      {activeTab === "statutory" && (
        <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
              <Shield className="h-4 w-4 text-[var(--emerald-deep)]" />
              <span>National Statutory Registrations & Tax Compliance ({entityInfo.name})</span>
            </h2>
            <p className="text-xs text-[var(--gray-muted)] mt-0.5">
              Verified statutory numbers utilized in monthly KRA iTax, SHIF, NSSF, and Housing Levy CSV returns.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">KRA PIN Number</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">Verified</span>
              </div>
              <p className="text-base font-mono font-extrabold text-[var(--gray-text)]">A009182734Z</p>
              <p className="text-[10px] text-zinc-500">Tax exemption certificates: None</p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">NSSF Number (Tier 1 & 2)</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">Active Checkoff</span>
              </div>
              <p className="text-base font-mono font-extrabold text-[var(--gray-text)]">4810293847</p>
              <p className="text-[10px] text-zinc-500">Deduction: KES 2,160.00 / month</p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">SHIF (Social Health) No.</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">2.75% Gross</span>
              </div>
              <p className="text-base font-mono font-extrabold text-[var(--gray-text)]">SHIF-9912048</p>
              <p className="text-[10px] text-zinc-500">Includes registered dependents</p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">National ID / Passport</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">Republic of Kenya</span>
              </div>
              <p className="text-base font-mono font-extrabold text-[var(--gray-text)]">ID-28374619</p>
              <p className="text-[10px] text-zinc-500">Scanned bio-page encrypted in vault</p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">Affordable Housing Levy</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">1.5% Matched</span>
              </div>
              <p className="text-base font-mono font-extrabold text-[var(--gray-text)]">BOMA-KEN-0941</p>
              <p className="text-[10px] text-zinc-500">Employer 1.5% + Employee 1.5%</p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">NITA Levy</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">KSh 50.00</span>
              </div>
              <p className="text-base font-mono font-extrabold text-[var(--gray-text)]">Employer Covered</p>
              <p className="text-[10px] text-zinc-500">Industrial training levy satisfied</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Banking & Mobile Money */}
      {activeTab === "banking" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[var(--emerald-deep)]" />
                <span>Primary Bank Direct Deposit</span>
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Current Active Rail
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono tracking-widest text-slate-400">SALARY PAYOUT VAULT</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/10 text-emerald-400">RTGS / EFT Enabled</span>
              </div>
              <div>
                <p className="text-lg font-mono font-extrabold tracking-wider">•••• •••• 9281</p>
                <p className="text-xs text-slate-300 mt-1 font-semibold">Nelson Mandela CP</p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700/60 font-mono">
                <span>Standard Chartered Bank Kenya</span>
                <span>Branch: Chiromo (02)</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[var(--gray-muted)]">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span>Account Currency:</span>
                <span className="font-bold text-[var(--gray-text)]">KES (Kenyan Shillings)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span>SWIFT / BIC Code:</span>
                <span className="font-mono font-bold text-[var(--gray-text)]">SCBLKENX</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span>Dual-Key Sign-off Status:</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Verified & Sealed</span>
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[var(--emerald-deep)]" />
                <span>Mobile Money Secondary Rails</span>
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Field Advance Ready
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">M-Pesa Corporate B2C Pay Rail</span>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">
                  Instant (15s)
                </span>
              </div>
              <p className="text-xl font-mono font-extrabold text-emerald-950">+254 712 345 678</p>
              <p className="text-[11px] text-emerald-800">
                Non-payroll travel per diems, emergency field allowances, and advance reimbursements disburse here.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-2">
              <p className="text-xs font-bold text-[var(--gray-text)]">Need to update payout details?</p>
              <p className="text-[11px] text-[var(--gray-muted)] leading-relaxed">
                Anti-fraud protocols require dual-key verification by the Finance Director before bank modifications become active.
              </p>
              <button
                type="button"
                onClick={() => setBankModalOpen(true)}
                className="mt-1 px-3 py-1.5 rounded-xl bg-white border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-text)] hover:bg-gray-100 transition shadow-2xs"
              >
                Submit Modification Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Contract & Grade */}
      {activeTab === "contract" && (
        <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-6">
          <h2 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-[var(--emerald-deep)]" />
            <span>Contract Terms, Grade & Station Assignment</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--gray-muted)]">Employment Category</span>
              <p className="text-sm font-bold text-[var(--gray-text)]">Full-Time Permanent (FTE)</p>
              <span className="text-[10px] text-zinc-500">Indefinite Contract</span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--gray-muted)]">Job Grade Level</span>
              <p className="text-sm font-bold text-[var(--gray-text)]">Grade G7 (Principal)</p>
              <span className="text-[10px] text-zinc-500">Tier 1 Benefits Matrix</span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--gray-muted)]">Working Schedule</span>
              <p className="text-sm font-bold text-[var(--gray-text)]">40 Hours / Week</p>
              <span className="text-[10px] text-emerald-700 font-semibold">12h Fatigue Guard Active</span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--gray-muted)]">Station Enclave</span>
              <p className="text-sm font-bold text-[var(--gray-text)]">Nairobi Industrial Plant</p>
              <span className="text-[10px] text-zinc-500">Prior: Kisumu Depot</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-[var(--gray-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-rose-500" />
              <div>
                <p className="text-xs font-bold text-[var(--gray-text)]">
                  Signed Employment Contract (Revision 2024-C)
                </p>
                <p className="text-[10px] text-[var(--gray-muted)]">
                  Cryptographically stamped with SHA-256 digital signature • 2.4 MB PDF
                </p>
              </div>
            </div>
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl bg-white border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-text)] hover:bg-gray-100 transition flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Signed Copy</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: Emergency & Next of Kin */}
      {activeTab === "emergency" && (
        <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-6">
          <h2 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-[var(--emerald-deep)]" />
            <span>Emergency Contacts & Next of Kin (Group Insurance Beneficiary)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--gray-text)]">Primary Next of Kin</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">100% Beneficiary</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-[var(--gray-text)] text-sm">Winnie Achieng Mandela</p>
                <p className="text-[var(--gray-muted)]">Relationship: Spouse</p>
                <p className="text-[var(--gray-muted)]">Primary Mobile: +254 722 987 654</p>
                <p className="text-[var(--gray-muted)]">Email: winnie.m@example.com</p>
                <p className="text-[var(--gray-muted)]">Address: Wood Avenue, Kilimani, Nairobi</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--gray-text)]">Secondary Emergency Contact</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-700">Workplace Backup</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-[var(--gray-text)] text-sm">David Omondi Otieno</p>
                <p className="text-[var(--gray-muted)]">Relationship: Brother</p>
                <p className="text-[var(--gray-muted)]">Primary Mobile: +254 733 456 789</p>
                <p className="text-[var(--gray-muted)]">City: Kisumu, Kenya</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Bank Payout Modification Modal */}
      {bankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[var(--gray-border)] shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[var(--emerald-deep)]" />
                <h3 className="text-base font-bold text-[var(--gray-text)]">
                  Request Payout Bank Change
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBankModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {bankUpdateSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-[var(--emerald-deep)] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-[var(--gray-text)]">
                  Change Request Queued (#HR-BNK-2026)
                </h4>
                <p className="text-xs text-[var(--gray-muted)] max-w-sm mx-auto">
                  Dual-key security notification dispatched to Finance Controller and HR Operations for cryptographic sign-off.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBankSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--gray-text)]">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-deep)] bg-gray-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--gray-text)]">Account Number</label>
                    <input
                      type="text"
                      required
                      value={newAccountNo}
                      onChange={(e) => setNewAccountNo(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-deep)] bg-gray-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--gray-text)]">Branch Code</label>
                    <input
                      type="text"
                      required
                      value={newBranch}
                      onChange={(e) => setNewBranch(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-deep)] bg-gray-50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--gray-text)]">Reason for Change</label>
                  <input
                    type="text"
                    required
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-deep)] bg-gray-50"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                  <Lock className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
                  <span>
                    For payroll security, account modifications cannot be processed within 48 hours of the monthly cut-off date (25th of each month).
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setBankModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)] hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition"
                  >
                    Submit for Dual-Key Verification
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
