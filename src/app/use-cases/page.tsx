"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  HardHat,
  Rocket,
  ShoppingBag,
  Globe2,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

export default function UseCasesPage() {
  const industries = [
    {
      title: "Multi-Subsidiary Regional Enterprises",
      icon: Building2,
      tag: "Cross-Border Groups",
      description:
        "Manage parent companies and diverse subsidiaries across multiple countries with consolidated reporting, multi-currency payroll, and localized statutory compliance.",
      highlights: [
        "Consolidated group-level headcount and payroll dashboards",
        "Independent local subsidiary tax and labor compliance rules",
        "Inter-company employee transfers and promotions",
        "Unified general ledger posting across entities",
      ],
    },
    {
      title: "Mining, Construction & 24/7 Manufacturing",
      icon: HardHat,
      tag: "Continuous Operations",
      description:
        "Engineered for heavy operations requiring Continental 3-shift 24/7 rotations, FIFO 14/14 rosters, and mandatory worker rest enforcement.",
      highlights: [
        "Automated fatigue monitoring preventing back-to-back shift assignments",
        "Hazardous environment and remote site hardship allowance calculation",
        "Real-time crew muster roll tracking and emergency contact logs",
        "Seamless integration with biometric turnstiles and geofenced clocks",
      ],
    },
    {
      title: "High-Growth Distributed & Remote Tech Teams",
      icon: Rocket,
      tag: "Modern Workforce",
      description:
        "Scale your remote team quickly without legal headaches. Automate digital employment contracts, hardware procurement, and instant mobile payouts.",
      highlights: [
        "100% paperless digital onboarding with verified e-signatures",
        "Zero-touch laptop shipment and device security verification",
        "Instant travel cash advances and scale-rate per diem allowances",
        "Automated software access provisioning on day one",
      ],
    },
    {
      title: "Retail Chains, Hospitality & Field Services",
      icon: ShoppingBag,
      tag: "High-Turnover & Shifts",
      description:
        "Handle distributed retail outlets, fluctuating shift rosters, overtime premiums, and fast seasonal employee onboarding.",
      highlights: [
        "Self-service mobile time clock with verified GPS perimeter check",
        "Automatic overtime calculation compliant with regional labor laws",
        "Fast bulk hiring and digital documentation upload",
        "Direct salary advances and employee loan recovery via payroll",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--cool-gray)] text-[var(--gray-text)] font-sans flex flex-col">
      <SiteHeader />

      <section className="bg-white border-b border-[var(--gray-border)] py-14">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-xs font-semibold text-[var(--emerald-deep)]">
            <Globe2 className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
            <span>Tailored Industry Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--gray-text)] max-w-3xl">
            Built to adapt to the reality of your operations.
          </h1>

          <p className="text-sm sm:text-base text-[var(--gray-muted)] max-w-2xl leading-relaxed">
            Whether running complex 24/7 continuous mining rosters or expanding multi-subsidiary enterprises across borders, DelaHR delivers industry-tested reliability.
          </p>
        </div>
      </section>

      <section className="py-12 flex-1">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {industries.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-[var(--emerald-light)] text-[var(--emerald-deep)] flex items-center justify-center">
                        <IconComp className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--cool-gray)] text-[var(--gray-muted)] border border-[var(--gray-border)]">
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[var(--gray-text)]">{item.title}</h3>
                    <p className="text-xs text-[var(--gray-muted)] leading-relaxed">{item.description}</p>

                    <div className="pt-3 space-y-2 border-t border-[var(--gray-border)]">
                      {item.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-[var(--gray-text)]">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--emerald-mint)] mt-0.5 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link
                      href="/book-demo"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--emerald-deep)] hover:underline"
                    >
                      <span>Discuss your industry use case</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
