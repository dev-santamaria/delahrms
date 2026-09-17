"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Sparkles, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");

  const plans = [
    {
      name: "Starter",
      description: "Essential workforce records, automated leave tracking, and single-entity payroll.",
      priceMonthly: "$4",
      priceAnnual: "$3",
      unit: "per employee / month",
      featured: false,
      features: [
        "Up to 50 active employees",
        "Single country payroll & tax schedules",
        "Employee self-service leave requests",
        "Digital employee document storage",
        "Standard email & ticket support",
      ],
      ctaText: "Get Started",
      ctaLink: "/book-demo",
    },
    {
      name: "Growth",
      description: "Engineered for expanding enterprises with multi-subsidiary operations and complex shifts.",
      priceMonthly: "$8",
      priceAnnual: "$6",
      unit: "per employee / month",
      featured: true,
      badge: "Most Popular",
      features: [
        "Unlimited employees & subsidiaries",
        "Multi-country statutory filings (KRA, URA, TRA, RRA)",
        "24/7 continuous shift rosters & fatigue safeguards",
        "Travel pre-trip advances & scale-rate per diem",
        "Corporate holiday shutdown bulk debits",
        "Digital forms builder with verified e-signatures",
        "Priority 24/7 dedicated support",
      ],
      ctaText: "Start Growth Plan",
      ctaLink: "/book-demo",
    },
    {
      name: "Enterprise Global",
      description: "Tailored for multinational corporations requiring custom general ledger sync, IT fleet management, and dedicated SLAs.",
      priceMonthly: "Custom",
      priceAnnual: "Custom",
      unit: "tailored billing",
      featured: false,
      features: [
        "Everything in Growth",
        "Automated general ledger double-entry voucher sync",
        "IT hardware fleet tracking & MDM posture telemetry",
        "Global mobility, visa tracking & 183-day tax alert monitor",
        "Dedicated Account Executive & implementation engineer",
        "99.99% uptime SLA & custom security reviews",
      ],
      ctaText: "Speak with Sales",
      ctaLink: "/contact",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--cool-gray)] text-[var(--gray-text)] font-sans flex flex-col">
      <SiteHeader />

      <section className="bg-white border-b border-[var(--gray-border)] py-14 text-center">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-xs font-semibold text-[var(--emerald-deep)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
            <span>Transparent, Scalable Investment</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--gray-text)]">
            Predictable pricing built to scale with your team.
          </h1>

          <p className="text-sm sm:text-base text-[var(--gray-muted)] max-w-2xl mx-auto leading-relaxed">
            No surprise fees or hidden implementation costs. Choose the tier that matches your workforce scale.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <div className="bg-[var(--cool-gray)] p-1 rounded-xl border border-[var(--gray-border)] inline-flex items-center text-xs font-semibold">
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-1.5 rounded-lg transition ${
                  billingCycle === "annual"
                    ? "bg-white text-[var(--emerald-deep)] shadow-xs font-bold"
                    : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
                }`}
              >
                Annual Billing (Save 25%)
              </button>
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-lg transition ${
                  billingCycle === "monthly"
                    ? "bg-white text-[var(--emerald-deep)] shadow-xs font-bold"
                    : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
                }`}
              >
                Monthly Billing
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 flex-1">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.map((p, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl bg-white border flex flex-col justify-between transition-all ${
                  p.featured
                    ? "border-[var(--emerald-mint)] shadow-md relative ring-2 ring-[var(--emerald-mint)]/20"
                    : "border-[var(--gray-border)] shadow-xs"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[var(--gray-text)]">{p.name}</h3>
                    {p.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)] border border-[var(--emerald-border)]">
                        {p.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[var(--gray-muted)] leading-relaxed">{p.description}</p>

                  <div className="pt-2">
                    <span className="text-3xl font-extrabold font-mono text-[var(--gray-text)]">
                      {billingCycle === "annual" ? p.priceAnnual : p.priceMonthly}
                    </span>
                    <span className="text-xs text-[var(--gray-muted)] ml-1.5">{p.unit}</span>
                  </div>

                  <div className="pt-4 border-t border-[var(--gray-border)] space-y-2.5 text-xs text-[var(--gray-text)]">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">
                      Included Capabilities
                    </p>
                    {p.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[var(--emerald-mint)] mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    href={p.ctaLink}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      p.featured
                        ? "bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white shadow-xs"
                        : "bg-[var(--cool-gray)] hover:bg-white text-[var(--gray-text)] border border-[var(--gray-border)]"
                    }`}
                  >
                    <span>{p.ctaText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
