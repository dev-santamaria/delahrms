"use client";

import React from "react";
import Link from "next/link";
import { Smartphone, Laptop, CheckCircle2, ArrowLeft, Shield, FileCheck } from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

export default function EulaPage() {
  return (
    <div className="min-h-screen bg-[var(--cool-gray)] text-[var(--gray-text)] font-sans antialiased flex flex-col">
      <SiteHeader />

      <main className="flex-1 py-12">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[var(--gray-muted)]">
            <Link href="/" className="hover:text-[var(--emerald-deep)] flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-[var(--gray-text)]">End User License Agreement</span>
          </div>

          {/* Header */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-xs font-semibold text-[var(--emerald-deep)]">
              <Smartphone className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
              <span>Mobile & Client Application Licensing</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--gray-text)] tracking-tight">
              End User License Agreement (EULA)
            </h1>
            <p className="text-xs sm:text-sm text-[var(--gray-muted)] max-w-3xl leading-relaxed">
              Last updated: September 16, 2026. This End User License Agreement governs your download, installation, and usage of DelaHR mobile applications (iOS and Android) and web portal clients.
            </p>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8 text-xs sm:text-sm leading-relaxed text-[var(--gray-text)]">
              <section className="p-6 sm:p-8 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-[var(--gray-text)] flex items-center gap-2">
                  <Laptop className="h-4 w-4 text-[var(--emerald-deep)]" />
                  <span>1. Scope of Mobile & Web License</span>
                </h2>
                <p className="text-[var(--gray-muted)]">
                  DelaHR grants you a revocable, non-transferable, non-exclusive license to use the mobile application on authorized devices solely for lawful workforce self-service activities authorized by your employer.
                </p>
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--emerald-mint)] mt-0.5 shrink-0" />
                    <span>GPS geofenced clock-in functionality is used strictly for duty shift verification when within authorized company perimeter.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--emerald-mint)] mt-0.5 shrink-0" />
                    <span>Expense camera capture uses on-device OCR preprocessing to verify receipt legitimacy without accessing unrelated private device photos.</span>
                  </div>
                </div>
              </section>

              <section className="p-6 sm:p-8 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-[var(--gray-text)] flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[var(--emerald-deep)]" />
                  <span>2. Restrictions on Reverse Engineering</span>
                </h2>
                <p className="text-[var(--gray-muted)]">
                  Users agree not to decompile, reverse engineer, disassemble, decrypt, or extract source code from the DelaHR applications, nor attempt to bypass biometric authentication barriers or cryptographic signatures.
                </p>
              </section>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3 text-xs">
                <h3 className="font-bold text-[var(--gray-text)]">App Store Compliance</h3>
                <p className="text-[var(--gray-muted)]">
                  DelaHR complies with Apple App Store Review Guidelines and Google Play Developer Distribution Agreements.
                </p>
                <div className="p-3 rounded-xl bg-[var(--cool-gray)] border border-[var(--gray-border)] text-[11px] font-mono">
                  <p className="font-bold">Build: v2.4.0 (Enterprise)</p>
                  <p className="text-[var(--emerald-deep)]">Encrypted Biometrics Active</p>
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
