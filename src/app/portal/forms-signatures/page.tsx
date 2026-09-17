"use client";

import React, { useState } from "react";
import {
  FileCheck2,
  PenTool,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle2,
  FileText,
  Lock,
  Download,
  Eye,
  AlertCircle,
  Copy,
  Hash,
  Sparkles,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";

interface DigitalForm {
  id: string;
  formType: "Bank Detail Change" | "Equipment Handover" | "NDA & Confidentiality" | "Tax Relief & Insurance Declaration" | "Expat Relocation Agreement";
  title: string;
  employeeName: string;
  empId: string;
  department: string;
  submittedDate: string;
  status: "Completed & Signed" | "Awaiting Employee Signature" | "Pending HR Review" | "Under Legal Audit";
  sha256Hash: string;
  ipAddress: string;
  signerEmail: string;
  fields: { label: string; value: string }[];
}

export default function FormsSignaturesPortalPage() {
  const { entityInfo, personaInfo } = usePortal();
  const [activeTab, setActiveTab] = useState<"documents" | "templates" | "sign-modal">("documents");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedForm, setSelectedForm] = useState<DigitalForm | null>(null);
  const [signedSuccess, setSignedSuccess] = useState(false);
  const [signatureText, setSignatureText] = useState("");

  const mockForms: DigitalForm[] = [
    {
      id: "DOC-2026-0901",
      formType: "Bank Detail Change",
      title: "Salary Account Change — Standard Chartered to NCBA",
      employeeName: "Nelson Mandela CP",
      empId: "EMP-001",
      department: "Executive & Engineering",
      submittedDate: "Sep 15, 2026 14:22 UTC",
      status: "Completed & Signed",
      sha256Hash: "8f7e3d2a1b9c4f5e6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f",
      ipAddress: "197.232.14.88 (Nairobi, KE)",
      signerEmail: "mandela@delahr.com",
      fields: [
        { label: "Old Bank Name", value: "Standard Chartered Bank (Account ...4410)" },
        { label: "New Bank Name", value: "NCBA Bank Kenya (Account ...8921)" },
        { label: "Branch / Swift Code", value: "NCBAKENA / Upper Hill Branch" },
        { label: "Maker-Checker Verification", value: "Verified via Voided Cheque Copy (Etims/KRA Matched)" },
      ],
    },
    {
      id: "DOC-2026-0902",
      formType: "Equipment Handover",
      title: "MacBook Pro M3 Max & 4K Monitor Asset Agreement",
      employeeName: "Mercy Cherono",
      empId: "EMP-312",
      department: "Commercial & Sales",
      submittedDate: "Sep 12, 2026 09:10 UTC",
      status: "Completed & Signed",
      sha256Hash: "3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c",
      ipAddress: "197.248.60.12 (Nairobi, KE)",
      signerEmail: "mercy.c@delahr.com",
      fields: [
        { label: "Hardware Model", value: "Apple MacBook Pro 16-inch M3 Max" },
        { label: "Serial Number", value: "C02XYZ890PLK" },
        { label: "Asset Tag", value: "DELA-IT-2026-0044" },
        { label: "Return Condition Policy", value: "Standard Care Agreement (Deduction on Loss Cleared)" },
      ],
    },
    {
      id: "DOC-2026-0903",
      formType: "Tax Relief & Insurance Declaration",
      title: "Third-Party Sacco & Britam Education Policy Auto-Deduction",
      employeeName: "David Kimani",
      empId: "EMP-204",
      department: "Plant Operations",
      submittedDate: "Sep 10, 2026 11:45 UTC",
      status: "Completed & Signed",
      sha256Hash: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      ipAddress: "102.134.88.90 (Mombasa, KE)",
      signerEmail: "david.k@delahr.com",
      fields: [
        { label: "Sacco Name", value: "Harambee Sacco Society (2,000/mo)" },
        { label: "Policy Reference", value: "BRITAM-EDU-POL-992140" },
        { label: "Statutory Tax Relief Claim", value: "15% Insurance Relief Applied to KRA PAYE" },
      ],
    },
    {
      id: "DOC-2026-0904",
      formType: "Expat Relocation Agreement",
      title: "Expatriate Housing & Schooling Allowance Grant",
      employeeName: "Sarah Jenkins",
      empId: "EXP-088",
      department: "Corporate Strategy",
      submittedDate: "Sep 05, 2026 16:30 UTC",
      status: "Awaiting Employee Signature",
      sha256Hash: "e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5",
      ipAddress: "Pending Client Signature",
      signerEmail: "s.jenkins@delahr.com",
      fields: [
        { label: "Duty Station", value: "Nairobi Hub (Regional Lead)" },
        { label: "Expat Housing Allowance", value: "USD 2,500 / Month (Net)" },
        { label: "Class G Work Permit", value: "Approved & Valid until Aug 2028" },
      ],
    },
  ];

  const filteredForms = mockForms.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.sha256Hash.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || f.formType === filterType;
    return matchesSearch && matchesType;
  });

  const activeDoc = selectedForm || mockForms[0];

  const handleSimulateSign = () => {
    setSignedSuccess(true);
    setTimeout(() => {
      setSignedSuccess(false);
      setActiveTab("documents");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-[var(--emerald-deep)]" />
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--gray-text)]">
              Forms & Cryptographic E-Signatures
            </h1>
          </div>
          <p className="text-xs text-[var(--gray-muted)] mt-0.5">
            100% paperless HR workflows, maker-checker bank account modifications, and legally binding SHA-256 digital seals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab("templates")}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border bg-white text-[var(--gray-text)] border-[var(--gray-border)] hover:bg-[var(--cool-gray)] shadow-2xs"
          >
            <FileText className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
            <span>Form Templates</span>
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab("sign-modal")}
            className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
          >
            <PenTool className="h-4 w-4" />
            <span>Sign Pending Document</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">
              Cryptographic Integrity
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-100 text-[var(--emerald-deep)]">
              <ShieldCheck className="h-4 w-4 text-[var(--emerald-mint)]" />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--emerald-deep)]">
            SHA-256 Sealed
          </p>
          <p className="text-[11px] text-[var(--gray-muted)]">
            Every signature timestamped with immutable hash
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">
              Signed This Month
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-[var(--emerald-deep)]">
              <FileCheck2 className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--gray-text)]">
            184 Agreements
          </p>
          <p className="text-[11px] text-[var(--emerald-deep)] font-semibold">
            Zero physical paper used
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">
              Maker-Checker Security
            </span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Lock className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-blue-700">Dual-Key Auth</p>
          <p className="text-[11px] text-[var(--gray-muted)]">
            Bank changes require HR + Employee OTP confirmation
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">
              Awaiting Signatures
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--gray-text)]">
            1 Document
          </p>
          <p className="text-[11px] text-amber-700 font-semibold">
            Expat relocation grant pending
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--gray-border)] pb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveTab("documents")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "documents"
                  ? "bg-[var(--emerald-deep)] text-white shadow-xs"
                  : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
              }`}
            >
              Signed Document Repository ({mockForms.length})
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveTab("templates")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "templates"
                  ? "bg-[var(--emerald-deep)] text-white shadow-xs"
                  : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
              }`}
            >
              Template Library
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveTab("sign-modal")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "sign-modal"
                  ? "bg-[var(--emerald-deep)] text-white shadow-xs"
                  : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
              }`}
            >
              <PenTool className="h-3.5 w-3.5" />
              <span>Simulate E-Signature Pad</span>
            </button>
          </div>

          {activeTab === "documents" && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-[var(--gray-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search hash, document, person..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-[var(--gray-border)] text-xs bg-white text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)] w-48 sm:w-64"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[var(--gray-border)] text-xs bg-white text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)]"
              >
                <option value="all">All Form Categories</option>
                <option value="Bank Detail Change">Bank Detail Change</option>
                <option value="Equipment Handover">Equipment Handover</option>
                <option value="Tax Relief & Insurance Declaration">Tax Relief & Insurance</option>
                <option value="Expat Relocation Agreement">Expat Relocation</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Signed Document Explorer */}
        {activeTab === "documents" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left list */}
            <div className="lg:col-span-5 space-y-2">
              {filteredForms.map((form) => {
                const isSelected = activeDoc.id === form.id;
                return (
                  <div
                    key={form.id}
                    onClick={() => setSelectedForm(form)}
                    className={`p-4 rounded-2xl border transition cursor-pointer select-none space-y-2 ${
                      isSelected
                        ? "bg-white border-[var(--emerald-deep)] ring-2 ring-[var(--emerald-deep)]/10 shadow-sm"
                        : "bg-white border-[var(--gray-border)] hover:border-zinc-300 hover:shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-[var(--gray-text)]">
                        {form.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          form.status === "Completed & Signed"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {form.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[var(--gray-text)]">{form.title}</p>
                      <p className="text-[11px] text-[var(--gray-muted)]">
                        {form.employeeName} ({form.empId}) • {form.department}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[var(--gray-border)] text-[10px] text-[var(--gray-muted)]">
                      <span>Submitted: {form.submittedDate}</span>
                      <span className="font-mono truncate max-w-[120px]">{form.sha256Hash}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Document Preview Pane */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--gray-border)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-[var(--gray-text)]">
                        {activeDoc.title}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[var(--emerald-deep)] border border-emerald-200">
                        {activeDoc.formType}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--gray-muted)] mt-1">
                      Signer: <strong>{activeDoc.employeeName}</strong> &lt;{activeDoc.signerEmail}&gt;
                    </p>
                  </div>

                  <button
                    type="button"
                    suppressHydrationWarning
                    className="px-3 py-1.5 rounded-xl border border-[var(--gray-border)] hover:bg-gray-50 text-xs font-bold text-[var(--gray-text)] transition flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Download className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
                    <span>Download PDF Certificate</span>
                  </button>
                </div>

                {/* Form Fields Table */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)] block">
                    Form Data & Maker-Checker Attributes
                  </span>

                  <div className="rounded-xl border border-[var(--gray-border)] overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <tbody className="divide-y divide-[var(--gray-border)]">
                        {activeDoc.fields.map((f, idx) => (
                          <tr key={idx} className="hover:bg-[var(--cool-gray)]/50">
                            <td className="p-3 w-1/3 font-semibold text-[var(--gray-muted)] bg-[var(--cool-gray)]/50">
                              {f.label}
                            </td>
                            <td className="p-3 font-semibold text-[var(--gray-text)]">
                              {f.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Cryptographic Proof Certificate Box */}
                <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[var(--emerald-deep)]" />
                      <span className="text-xs font-bold text-[var(--gray-text)]">
                        Immutable SHA-256 Audit Trail
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[var(--emerald-deep)] bg-[var(--emerald-light)] px-2 py-0.5 rounded-md">
                      Verified On-Chain / HSM
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-[var(--gray-muted)] uppercase block">
                        SHA-256 Digest Hash
                      </span>
                      <code className="text-[11px] font-mono text-[var(--emerald-deep)] font-bold break-all bg-white p-2 rounded-lg border border-[var(--gray-border)] block">
                        {activeDoc.sha256Hash}
                      </code>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[var(--gray-muted)] pt-1">
                      <p>
                        Timestamp: <strong>{activeDoc.submittedDate}</strong>
                      </p>
                      <p>
                        Client IP / Geolocation: <strong>{activeDoc.ipAddress}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Template Library */}
        {activeTab === "templates" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Bank Account Modification Notice",
                desc: "Dual-authorization form requiring photo ID, cancelled check, and biometric confirmation before payroll updating.",
                category: "Financial Compliance",
                fieldsCount: 8,
              },
              {
                title: "Hardware Equipment Handover Agreement",
                desc: "Asset assignment document recording serial numbers, condition rating, and damage recovery deduction consent.",
                category: "IT Fleet",
                fieldsCount: 12,
              },
              {
                title: "Confidentiality & Non-Disclosure (NDA)",
                desc: "Standard corporate proprietary information protection for full-time employees and external contractors.",
                category: "Legal & Governance",
                fieldsCount: 6,
              },
              {
                title: "Third-Party Sacco Auto-Deduction Mandate",
                desc: "Authorizes DelaHR payroll to disburse monthly savings directly to designated Sacco treasury accounts.",
                category: "Employee Benefits",
                fieldsCount: 7,
              },
              {
                title: "Expatriate Housing & Mobility Policy",
                desc: "Cross-border contract detailing flight allowances, housing subsidies, and visa sponsorship covenants.",
                category: "Global Mobility",
                fieldsCount: 15,
              },
              {
                title: "Mandatory Overtime Consent & Fatigue Waiver",
                desc: "Shift worker consent form acknowledging 12-hour continuous rest interval enforcement.",
                category: "Shift Operations",
                fieldsCount: 5,
              },
            ].map((tmpl, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[var(--emerald-deep)] border border-emerald-200">
                      {tmpl.category}
                    </span>
                    <span className="text-[10px] text-[var(--gray-muted)]">
                      {tmpl.fieldsCount} Fields
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--gray-text)]">{tmpl.title}</h4>
                  <p className="text-xs text-[var(--gray-muted)] leading-relaxed">{tmpl.desc}</p>
                </div>

                <div className="pt-3 border-t border-[var(--gray-border)] flex items-center justify-between">
                  <button
                    type="button"
                    suppressHydrationWarning
                    className="text-xs font-bold text-[var(--emerald-deep)] hover:underline flex items-center gap-1"
                  >
                    <span>Preview Template</span>
                  </button>
                  <button
                    type="button"
                    suppressHydrationWarning
                    className="px-3 py-1.5 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition"
                  >
                    Dispatch to Staff
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Simulate E-Signature Pad */}
        {activeTab === "sign-modal" && (
          <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs max-w-2xl mx-auto space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-[var(--emerald-deep)]" />
                <h3 className="text-lg font-bold text-[var(--gray-text)]">
                  Cryptographic E-Signature Terminal
                </h3>
              </div>
              <p className="text-xs text-[var(--gray-muted)] mt-1">
                Draw or type your signature to generate a legally binding, SHA-256 timestamped compliance certificate.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--gray-text)] block mb-1">
                  Signatory Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nelson Mandela CP"
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-text)] bg-white focus:outline-none focus:border-[var(--emerald-deep)]"
                />
              </div>

              {/* Digital Canvas Drawing Simulator */}
              <div>
                <label className="text-xs font-semibold text-[var(--gray-text)] block mb-1">
                  Signature Canvas Preview
                </label>
                <div className="h-32 bg-white rounded-xl border-2 border-dashed border-[var(--gray-border)] flex flex-col items-center justify-center p-4 relative">
                  {signatureText ? (
                    <span className="font-serif italic text-3xl text-[var(--emerald-deep)] tracking-wider">
                      {signatureText}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--gray-muted)]">
                      Type your name above or draw signature with stylus/mouse
                    </span>
                  )}
                  <span className="absolute bottom-2 right-3 text-[9px] font-mono text-[var(--gray-muted)]">
                    SHA-256 Integrity Verified
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-900 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <ShieldCheck className="h-4 w-4 text-[var(--emerald-deep)] shrink-0" />
                <span>
                  By signing, you agree that this cryptographic record satisfies global digital signature acts (ESIGN &amp; eIDAS compliant).
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setActiveTab("documents")}
                className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-text)] hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={handleSimulateSign}
                disabled={!signatureText}
                className="px-5 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition disabled:opacity-50 flex items-center gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{signedSuccess ? "Document Signed & Hash Generated!" : "Sign & Seal Document"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
