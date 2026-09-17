"use client";

import React from "react";
import Link from "next/link";
import { Users, ShieldCheck, Globe2, Sparkles, Target, Award, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

export default function AboutPage() {
  const values = [
    {
      title: "Built for Operational Reality",
      desc: "We build software that handles real-world complexity: continuous shifts, irregular roster changes, remote site hardship allowances, and multiple legal jurisdictions.",
      icon: Target,
    },
    {
      title: "Radical Compliance & Integrity",
      desc: "Zero tolerance for calculation discrepancies. From statutory tax brackets to balanced accounting entries, precision is in our DNA.",
      icon: ShieldCheck,
    },
    {
      title: "Employee-First Simplicity",
      desc: "Sophisticated enterprise rules under the hood, presented with effortless, beautiful, and intuitive clarity for employees and managers.",
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--cool-gray)] text-[var(--gray-text)] font-sans flex flex-col">
      <SiteHeader />

      <section className="bg-white border-b border-[var(--gray-border)] py-14">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-xs font-semibold text-[var(--emerald-deep)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
            <span>Our Mission & Origin</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--gray-text)]">
            Unifying workforce operations for global enterprises.
          </h1>

          <p className="text-sm sm:text-base text-[var(--gray-muted)] leading-relaxed">
            DelaHR was born from a fundamental observation: global enterprises operating across borders were forced to stitch together 10 different legacy tools for payroll, shift scheduling, expense advances, and statutory compliance. We built DelaHR to be the single, unified operating system for people operations.
          </p>
        </div>
      </section>

      <section className="py-12 flex-1">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-10">
          <div>
            <h2 className="text-xl font-bold text-[var(--gray-text)]">Core Principles</h2>
            <p className="text-xs text-[var(--gray-muted)]">The standards guiding our product design and engineering</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => {
              const IconComp = v.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3"
                >
                  <div className="h-10 w-10 rounded-xl bg-[var(--emerald-light)] text-[var(--emerald-deep)] flex items-center justify-center">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--gray-text)]">{v.title}</h3>
                  <p className="text-xs text-[var(--gray-muted)] leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Regional Hubs Coverage */}
          <div className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[var(--gray-text)]">
                Local Presence, Worldwide Standards
              </h3>
              <p className="text-xs text-[var(--gray-muted)] max-w-xl leading-relaxed">
                With operational and engineering presence across multiple continents, DelaHR supports enterprise workforces wherever work happens.
              </p>
            </div>
            <Link
              href="/book-demo"
              className="px-5 py-2.5 rounded-lg bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition shrink-0"
            >
              Get in Touch with our Leadership
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
