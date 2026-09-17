"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Globe2, FileText, ArrowLeft, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--cool-gray)] text-[var(--gray-text)] font-sans antialiased flex flex-col">
      <SiteHeader />

      <main className="flex-1 py-12">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center gap-2 text-xs text-[var(--gray-muted)]">
            <Link href="/" className="hover:text-[var(--emerald-deep)] flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-[var(--gray-text)]">Privacy Policy</span>
          </div>

          {/* Header */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-xs font-semibold text-[var(--emerald-deep)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
              <span>Enterprise Data Governance & Protection</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--gray-text)] tracking-tight">
              DelaHR Global Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-[var(--gray-muted)] max-w-3xl leading-relaxed">
              Last updated: September 16, 2026. DelaHR Inc. (&ldquo;DelaHR&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is committed to safeguarding employee personally identifiable information (PII), banking credentials, payroll calculations, and cross-border HR documents in strict compliance with international standards (GDPR, SOC2 Type II, HIPAA, and regional privacy acts).
            </p>
          </div>

          {/* Body Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-8 text-xs sm:text-sm leading-relaxed text-[var(--gray-text)]">
              <section className="p-6 sm:p-8 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-[var(--gray-text)] flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[var(--emerald-deep)]" />
                  <span>1. Information We Collect and Process</span>
                </h2>
                <p className="text-[var(--gray-muted)]">
                  As an enterprise Human Resources and Payroll Operating System, DelaHR acts primarily as a Data Processor on behalf of employers who subscribe to our platform. We process the following categories of data:
                </p>
                <ul className="space-y-2.5 text-xs text-[var(--gray-text)]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--emerald-mint)] mt-0.5 shrink-0" />
                    <span><strong>Employee Identification:</strong> Full legal names, national tax ID numbers, passport/visa details, work permits, and residential addresses.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--emerald-mint)] mt-0.5 shrink-0" />
                    <span><strong>Financial & Disbursement Data:</strong> Bank account IBAN/numbers, SWIFT routing codes, mobile money wallet identifiers, and salary disbursement histories.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--emerald-mint)] mt-0.5 shrink-0" />
                    <span><strong>Operational & Biometric Logs:</strong> GPS geofence shift clock-in timestamps, continuous roster logs, scale-rate travel per diem receipts, and cryptographic e-signature seals.</span>
                  </li>
                </ul>
              </section>

              <section className="p-6 sm:p-8 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-[var(--gray-text)] flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-[var(--emerald-deep)]" />
                  <span>2. Cross-Border Data Transfers & Multi-Jurisdiction Compliance</span>
                </h2>
                <p className="text-[var(--gray-muted)]">
                  DelaHR supports cross-border enterprises with operations in over 150 currencies. Data residency options are available for customers requiring localized data storage within specific economic regions:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-[var(--gray-border)] bg-[var(--cool-gray)]">
                    <p className="font-bold text-[var(--gray-text)]">European Economic Area (EEA & UK)</p>
                    <p className="text-[var(--gray-muted)] text-[11px] mt-1">Full adherence to EU GDPR and UK Data Protection Act 2018 with Standard Contractual Clauses (SCCs).</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-[var(--gray-border)] bg-[var(--cool-gray)]">
                    <p className="font-bold text-[var(--gray-text)]">Americas & Global Sovereign Clouds</p>
                    <p className="text-[var(--gray-muted)] text-[11px] mt-1">SOC2 Type II audited data centers with AES-256 encryption at rest and TLS 1.3 in transit.</p>
                  </div>
                </div>
              </section>

              <section className="p-6 sm:p-8 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-[var(--gray-text)] flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[var(--emerald-deep)]" />
                  <span>3. Retention, Anonymity & Employee Rights</span>
                </h2>
                <p className="text-[var(--gray-muted)]">
                  Employees have direct self-service access to export their personal records, view verified payslip histories, and dispute incorrect operational records. Where pulse surveys are conducted, survey responses are cryptographically anonymized to protect employee voice.
                </p>
              </section>
            </div>

            {/* Sticky Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4 text-xs">
                <h3 className="font-bold text-[var(--gray-text)]">Data Protection Officer</h3>
                <p className="text-[var(--gray-muted)]">
                  For questions or requests regarding data privacy, please contact our dedicated Data Protection Office:
                </p>
                <div className="p-3 rounded-xl bg-[var(--cool-gray)] border border-[var(--gray-border)] font-mono text-[11px] space-y-1">
                  <p className="font-bold text-[var(--gray-text)]">DelaHR Compliance & Trust</p>
                  <p className="text-[var(--emerald-deep)]">privacy@delahr.com</p>
                  <p className="text-[var(--gray-muted)]">100 Enterprise Way, Suite 400</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
