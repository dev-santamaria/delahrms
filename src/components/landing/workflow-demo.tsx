"use client";

import React, { useState } from "react";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileCheck2,
  UserCheck,
  Lock,
  RefreshCw,
  FileText,
  FileBadge2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export function WorkflowDemo() {
  // 1 = Employee Submitted, 2 = HR Approved, 3 = Finance Dual-Approved & Sealed
  const [approvalStage, setApprovalStage] = useState<1 | 2 | 3>(1);

  return (
    <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--gray-border)] pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--emerald-mint)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--emerald-deep)]">
              Automated Digital Governance
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--gray-text)] tracking-tight">
            Employee Bank Account Change Request Workflow
          </h3>
          <p className="text-xs sm:text-sm text-[var(--gray-muted)]">
            Review the live employee form submission and follow its automated multi-tier approval through HR compliance and Finance Treasury sign-off.
          </p>
        </div>

        {/* Simulator Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {approvalStage === 1 && (
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setApprovalStage(2)}
              className="px-4 py-2.5 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
            >
              <UserCheck className="h-4 w-4" />
              <span>Step 1: Approve as HR Operations</span>
            </button>
          )}

          {approvalStage === 2 && (
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setApprovalStage(3)}
              className="px-4 py-2.5 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              <span>Step 2: Sign-Off as Finance Treasury</span>
            </button>
          )}

          {approvalStage === 3 && (
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setApprovalStage(1)}
              className="px-4 py-2 rounded-xl bg-[var(--cool-gray)] text-[var(--gray-text)] hover:bg-gray-200 text-xs font-bold transition flex items-center gap-1.5 border border-[var(--gray-border)]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Replay Form Workflow</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Stepper Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl border bg-[var(--emerald-light)] border-[var(--emerald-border)] text-[var(--emerald-deep)]">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="h-4 w-4 text-[var(--emerald-mint)]" />
            <span>1. Form Submitted by Employee</span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)] mt-1 font-normal">
            Nelson Mandela CP • Sep 16, 2026, 14:22 UTC
          </p>
        </div>

        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            approvalStage >= 2
              ? "bg-[var(--emerald-light)] border-[var(--emerald-border)] text-[var(--emerald-deep)]"
              : "bg-[var(--cool-gray)] border-[var(--gray-border)] text-[var(--gray-muted)]"
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {approvalStage >= 2 ? (
              <CheckCircle2 className="h-4 w-4 text-[var(--emerald-mint)]" />
            ) : (
              <Clock className="h-4 w-4 text-[var(--gray-muted)]" />
            )}
            <span>2. HR Compliance Review</span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)] mt-1 font-normal">
            {approvalStage >= 2 ? "Verified by Sarah Jenkins (HR Director)" : "Awaiting HR verification"}
          </p>
        </div>

        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            approvalStage === 3
              ? "bg-[var(--emerald-light)] border-[var(--emerald-border)] text-[var(--emerald-deep)]"
              : "bg-[var(--cool-gray)] border-[var(--gray-border)] text-[var(--gray-muted)]"
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {approvalStage === 3 ? (
              <CheckCircle2 className="h-4 w-4 text-[var(--emerald-mint)]" />
            ) : (
              <Clock className="h-4 w-4 text-[var(--gray-muted)]" />
            )}
            <span>3. Finance Dual-Sign & Ledger Lock</span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)] mt-1 font-normal">
            {approvalStage === 3 ? "Cryptographically Sealed (SHA-256)" : "Awaiting Treasury dual-key approval"}
          </p>
        </div>
      </div>

      {/* Realistic Digital Form Document Preview */}
      <div className="rounded-2xl border border-[var(--gray-border)] bg-[var(--cool-gray)] p-5 sm:p-7 space-y-6">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--gray-border)] bg-white p-4 rounded-xl shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--emerald-light)] text-[var(--emerald-deep)]">
              <FileBadge2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-[var(--gray-text)]">
                  FORM HR-BNK-2026: Bank Payout Account Modification
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[var(--cool-gray)] border border-[var(--gray-border)]">
                  DOC-ID: #BNK-8841
                </span>
              </div>
              <p className="text-[11px] text-[var(--gray-muted)]">
                DelaHR Enterprise Secure Payroll Disbursement Records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {approvalStage === 1 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Pending HR Review</span>
              </span>
            )}
            {approvalStage === 2 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <UserCheck className="h-3 w-3" />
                <span>HR Verified • Pending Finance</span>
              </span>
            )}
            {approvalStage === 3 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--emerald-light)] text-[var(--emerald-deep)] border border-[var(--emerald-border)] flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-[var(--emerald-mint)]" />
                <span>Fully Authorized & Sealed</span>
              </span>
            )}
          </div>
        </div>

        {/* Employee Info Header */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs bg-white p-4 rounded-xl border border-[var(--gray-border)]">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--gray-muted)]">Employee Name</span>
            <p className="font-bold text-[var(--gray-text)]">Nelson Mandela CP</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--gray-muted)]">Staff Identification</span>
            <p className="font-mono font-semibold text-[var(--gray-text)]">EMP-4091</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--gray-muted)]">Department & Role</span>
            <p className="text-[var(--gray-text)]">Engineering Director</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--gray-muted)]">Work Jurisdiction</span>
            <p className="text-[var(--emerald-deep)] font-semibold">Global Remote • Core Roster</p>
          </div>
        </div>

        {/* Side-by-Side Account Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Current Old Account */}
          <div className="p-4 rounded-xl bg-white border border-[var(--gray-border)] space-y-2 opacity-75">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">
              Current Active Account (To Be Replaced)
            </span>
            <div className="space-y-1 font-mono text-[11px]">
              <p className="font-bold text-[var(--gray-text)]">Standard Chartered Global</p>
              <p className="text-[var(--gray-muted)]">Account Number: ••••••••8821</p>
              <p className="text-[var(--gray-muted)]">SWIFT / BIC: SCBLUS33</p>
              <p className="text-[var(--gray-muted)]">Currency: USD</p>
            </div>
            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
              Will be archived upon completion
            </span>
          </div>

          {/* New Account Entered by Employee */}
          <div className="p-4 rounded-xl bg-white border-2 border-[var(--emerald-border)] space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--emerald-deep)]">
                New Requested Payout Account
              </span>
              <span className="text-[10px] font-bold text-[var(--emerald-deep)] bg-[var(--emerald-light)] px-2 py-0.5 rounded">
                Verified Format
              </span>
            </div>
            <div className="space-y-1 font-mono text-[11px]">
              <p className="font-bold text-[var(--gray-text)]">Citibank International N.A.</p>
              <p className="text-[var(--gray-text)]">IBAN / Account: US44CITI00012938472199</p>
              <p className="text-[var(--gray-text)]">SWIFT / BIC: CITIUS33XXX</p>
              <p className="text-[var(--gray-text)]">Currency: USD (Direct Wire Cleared)</p>
            </div>
            <p className="text-[11px] text-[var(--gray-muted)] pt-1">
              Reason: &ldquo;Consolidation of primary salary disbursements to corporate international account&rdquo;
            </p>
          </div>
        </div>

        {/* Uploaded Supporting Document & Cryptographic Seal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Document Attachment */}
          <div className="p-4 rounded-xl bg-white border border-[var(--gray-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50 text-rose-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-[var(--gray-text)]">Bank_Account_Confirmation.pdf</p>
                <p className="text-[11px] text-[var(--gray-muted)]">1.4 MB • Official Bank Letterhead Verified</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-1 rounded bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-bold">
              OCR Matched
            </span>
          </div>

          {/* Cryptographic Signature Box */}
          <div className="p-4 rounded-xl bg-white border border-[var(--gray-border)] space-y-1 text-[11px]">
            <span className="text-[10px] font-bold uppercase text-[var(--gray-muted)]">
              Audit Seal & Blockchain Hash
            </span>
            <p className="font-mono text-[var(--emerald-deep)] font-bold truncate">
              {approvalStage === 3
                ? "SHA256: 0x7a89bc214d0019fa8832e091176b5c3d4e8a"
                : "Awaiting final dual-key signature generation..."}
            </p>
            <p className="text-[10px] text-[var(--gray-muted)]">
              Compliant with US ESIGN Act, EU eIDAS & international electronic signature laws.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
