"use client";

import React from "react";
import Link from "next/link";
import { FileCheck2, Scale, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

export default function TermsPage() {
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
            <span className="font-semibold text-[var(--gray-text)]">Terms of Service</span>
          </div>

          {/* Header */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-xs font-semibold text-[var(--emerald-deep)]">
              <Scale className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
              <span>Legal Terms & SaaS Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--gray-text)] tracking-tight">
              DelaHR Enterprise Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-[var(--gray-muted)] max-w-3xl leading-relaxed">
              Effective Date: September 16, 2026. These Terms of Service govern access to and usage of the DelaHR workforce management and payroll platform, including our mobile applications, APIs, and cloud services.
            </p>
          </div>

          {/* Body Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8 text-xs sm:text-sm leading-relaxed text-[var(--gray-text)]">
              <section className="p-6 sm:p-8 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-[var(--gray-text)] flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-[var(--emerald-deep)]" />
                  <span>1. Subscription & License Grant</span>
                </h2>
                <p className="text-[var(--gray-muted)]">
                  Subject to these Terms and payment of the applicable subscription fees, DelaHR grants Customer a non-exclusive, non-transferable, worldwide enterprise license to access and use the platform for its internal workforce operations.
                </p>
                <div className="p-4 rounded-xl bg-[var(--cool-gray)] border border-[var(--gray-border)] text-xs space-y-2">
                  <p className="font-bold text-[var(--gray-text)]">Authorized Usage:</p>
                  <p className="text-[var(--gray-muted)]">Authorized users include Customer HR administrators, finance controllers, shift managers, and enrolled employees accessing self-service capabilities.</p>
                </div>
              </section>

              <section className="p-6 sm:p-8 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-[var(--gray-text)] flex items-center gap-2">
                  <Scale className="h-4 w-4 text-[var(--emerald-deep)]" />
                  <span>2. Payroll Accuracy & Statutory Responsibility</span>
                </h2>
                <p className="text-[var(--gray-muted)]">
                  DelaHR provides computational automation for gross-to-net calculations, tax brackets, social levies, and electronic file generation across 150+ currencies. Customer retains ultimate responsibility for reviewing and releasing disbursement batches to banking channels.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--emerald-mint)] mt-0.5 shrink-0" />
                    <span>Customer must ensure timely validation of employee bank account change requests and tax identification numbers.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--emerald-mint)] mt-0.5 shrink-0" />
                    <span>DelaHR maintains automated math variance guarantees (0.00 cent discrepancy) based on Customer-configured statutory presets.</span>
                  </div>
                </div>
              </section>

              <section className="p-6 sm:p-8 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-[var(--gray-text)] flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-[var(--emerald-deep)]" />
                  <span>3. Confidentiality & Security</span>
                </h2>
                <p className="text-[var(--gray-muted)]">
                  Both parties agree that payroll data, employee compensation figures, and business records constitute strictly confidential information. DelaHR encrypts all database volumes at rest (AES-256) and isolates tenant data at the logical application layer.
                </p>
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4 text-xs">
                <h3 className="font-bold text-[var(--gray-text)]">Legal Inquiries</h3>
                <p className="text-[var(--gray-muted)]">
                  For master service agreements (MSA), custom enterprise terms, or billing questions:
                </p>
                <div className="p-3 rounded-xl bg-[var(--cool-gray)] border border-[var(--gray-border)] font-mono text-[11px] space-y-1">
                  <p className="font-bold text-[var(--gray-text)]">DelaHR Legal Operations</p>
                  <p className="text-[var(--emerald-deep)]">legal@delahr.com</p>
                  <p className="text-[var(--gray-muted)]">enterprise-agreements@delahr.com</p>
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
