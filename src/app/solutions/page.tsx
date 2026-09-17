"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Coins,
  Clock,
  CalendarDays,
  Receipt,
  FileCheck2,
  Laptop,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Globe2,
} from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

export default function SolutionsPage() {
  const modules = [
    {
      id: "workforce",
      title: "Global Workforce & Multi-Entity Core HR",
      badge: "Core Platform",
      icon: Users,
      summary: "Consolidate multiple legal subsidiaries, branches, and cross-border teams under a single source of truth.",
      features: [
        "Dynamic organization charts across regional subsidiaries",
        "Employee lifecycle management from onboarding to retirement",
        "Multi-currency employment contracts and compensation terms",
        "Custom fields and dynamic business lookups with zero code changes",
      ],
    },
    {
      id: "payroll",
      title: "Automated Multi-Country Payroll & Tax Filings",
      badge: "Financial Precision",
      icon: Coins,
      summary: "End-to-end gross-to-net payroll computation with automated local statutory deductions and instant settlement schedules.",
      features: [
        "1-Click generation of official government tax return schedules",
        "Real-time payroll calculations verified to 0.00 discrepancy",
        "Direct disbursal integration via bank EFT and regional mobile money",
        "Automated institutional check-offs (pensions, insurance, and SACCOs)",
      ],
    },
    {
      id: "shifts",
      title: "24/7 Continuous Shifts & Mining Rostering",
      badge: "Operations & Safety",
      icon: Clock,
      summary: "Industrial-grade shift rotations designed for 24/7 continuous plants, mining FIFO rosters, and round-the-clock operations.",
      features: [
        "Automated Continental 3-shift and FIFO 14/14 rotation schedules",
        "Fatigue safety guardrails with mandatory 12-hour rest enforcement",
        "Automated night differentials, weekend premiums, and hazard allowances",
        "Real-time crew muster roll and shift substitution workflows",
      ],
    },
    {
      id: "leave",
      title: "Corporate Shutdowns & Smart Leave Management",
      badge: "Workforce Planning",
      icon: CalendarDays,
      summary: "Streamlined leave accruals, policy rules, and company-wide mandatory holiday closure debits.",
      features: [
        "1-Click corporate Christmas / Year-End shutdown bulk debit",
        "Advance leave carryover approval requests exceeding standard caps",
        "Departmental minimum staffing thresholds to prevent coverage shortages",
        "Transparent self-service balance tracking for employees",
      ],
    },
    {
      id: "claims",
      title: "Travel Logistics, Scale-Rate Per Diem & Advances",
      badge: "Travel & Expenses",
      icon: Receipt,
      summary: "Pre-trip travel authorizations with instant non-payroll advances and automated post-trip variance settlement.",
      features: [
        "Direct pre-trip cash advance disbursal to mobile money or bank accounts",
        "Scale-rate per diem allowances requiring zero meal receipt collection",
        "Mobile camera receipt capture with automated tax number verification",
        "Post-trip expense settlement and automated reconciliation",
      ],
    },
    {
      id: "forms",
      title: "Digital Forms & Native E-Signatures",
      badge: "Paperless Enterprise",
      icon: FileCheck2,
      summary: "Eliminate printed paperwork, physical scans, and email approvals with verified digital forms and audit trails.",
      features: [
        "Drag-and-drop form schema builder for surveys, declarations, and requests",
        "Legally recognized hand-drawn and typed digital e-signatures",
        "Cryptographic tamper-evident audit seals on every submitted form",
        "Automated notifications and supervisor sign-off queues",
      ],
    },
    {
      id: "it-fleet",
      title: "Workforce IT Fleet & Device Management",
      badge: "IT & Security",
      icon: Laptop,
      summary: "Manage laptops, mobile devices, device enrollment, and automated software access across your distributed workforce.",
      features: [
        "Company laptop procurement, assignment, and warranty tracking",
        "Automated application access provisioning on employee start dates",
        "Device disk encryption telemetry and security posture compliance",
        "1-Click access revocation and return logistics upon employee offboarding",
      ],
    },
    {
      id: "training",
      title: "Learning, Certifications & Retraining Matrix",
      badge: "Talent Development",
      icon: GraduationCap,
      summary: "Track employee training certifications, mandatory compliance modules, and automated retraining schedules.",
      features: [
        "Course catalogs for onboarding, workplace safety, and product training",
        "Automated refresher notifications before professional certifications lapse",
        "Department-level compliance matrix showing certified vs pending staff",
        "Verified digital training completion certificates",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--cool-gray)] text-[var(--gray-text)] font-sans flex flex-col">
      <SiteHeader />

      {/* Hero Header */}
      <section className="bg-white border-b border-[var(--gray-border)] py-14">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-xs font-semibold text-[var(--emerald-deep)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
            <span>Complete Enterprise Solutions Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--gray-text)] max-w-3xl">
            Everything your enterprise needs to manage, pay, and empower people across borders.
          </h1>

          <p className="text-sm sm:text-base text-[var(--gray-muted)] max-w-2xl leading-relaxed">
            DelaHR delivers an end-to-end suite of interconnected modules. From 24/7 continuous industrial rosters and cross-border payroll to travel cash advances and digital e-signatures.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/book-demo"
              className="px-5 py-2.5 rounded-lg bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
            >
              <span>Schedule a Solution Walkthrough</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="px-5 py-2.5 rounded-lg bg-white border border-[var(--gray-border)] hover:bg-[var(--cool-gray)] text-[var(--gray-text)] text-xs font-semibold transition"
            >
              View Pricing Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-12">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((m) => {
              const IconComp = m.icon;
              return (
                <div
                  key={m.id}
                  id={m.id}
                  className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4 flex flex-col justify-between scroll-mt-24"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-[var(--emerald-light)] text-[var(--emerald-deep)] flex items-center justify-center">
                        <IconComp className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)] border border-[var(--emerald-border)]">
                        {m.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[var(--gray-text)]">{m.title}</h3>
                    <p className="text-xs text-[var(--gray-muted)] leading-relaxed">{m.summary}</p>

                    <div className="pt-2 space-y-2 border-t border-[var(--gray-border)]">
                      {m.features.map((f, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-[var(--gray-text)]">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--emerald-mint)] mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3">
                    <Link
                      href="/book-demo"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--emerald-deep)] hover:underline"
                    >
                      <span>See this module in action</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-white border-t border-[var(--gray-border)] py-12 mt-auto">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[var(--gray-text)]">
              Ready to transform your people operations?
            </h3>
            <p className="text-xs text-[var(--gray-muted)]">
              Speak with a workforce specialist to customize DelaHR for your specific industry and jurisdictions.
            </p>
          </div>

          <Link
            href="/book-demo"
            className="px-6 py-3 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition shrink-0"
          >
            Book Personalized Demo
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
