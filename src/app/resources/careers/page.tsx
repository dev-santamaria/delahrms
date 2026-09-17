"use client";

import React from "react";
import Link from "next/link";
import { Briefcase, MapPin, Sparkles, ArrowRight, Heart, Globe2, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

export default function CareersPage() {
  const openings = [
    {
      role: "Senior Global Payroll Systems Engineer",
      dept: "Core Financial Engineering",
      location: "Remote / Hybrid Hub",
      type: "Full-Time",
    },
    {
      role: "Enterprise Implementation Specialist",
      dept: "Customer Operations",
      location: "East Africa & EMEA",
      type: "Full-Time",
    },
    {
      role: "Product Designer (Design Systems & Workflows)",
      dept: "Product Experience",
      location: "Remote Worldwide",
      type: "Full-Time",
    },
    {
      role: "Statutory Tax & Labor Compliance Analyst",
      dept: "Legal & Regulatory",
      location: "London / Nairobi / Delaware",
      type: "Full-Time",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--cool-gray)] text-[var(--gray-text)] font-sans flex flex-col">
      <SiteHeader />

      <section className="bg-white border-b border-[var(--gray-border)] py-14">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-xs font-semibold text-[var(--emerald-deep)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
            <span>Join Our Global Distributed Team</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--gray-text)]">
            Help us build the unified People OS for modern enterprises.
          </h1>

          <p className="text-sm sm:text-base text-[var(--gray-muted)] max-w-3xl leading-relaxed">
            We are solving hard, real-world problems: cross-border labor compliance, continuous 24/7 industrial shift safety, and instant multi-currency treasury disbursals.
          </p>
        </div>
      </section>

      <section className="py-12 flex-1">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-6">
          <h2 className="text-xl font-bold text-[var(--gray-text)]">Open Positions</h2>

          <div className="space-y-3">
            {openings.map((op, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-white border border-[var(--gray-border)] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[var(--emerald-mint)] transition"
              >
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[var(--gray-text)]">{op.role}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--gray-muted)]">
                    <span>{op.dept}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-[var(--emerald-deep)]" />
                      {op.location}
                    </span>
                    <span>•</span>
                    <span>{op.type}</span>
                  </div>
                </div>

                <Link
                  href="/contact"
                  className="px-4 py-2 rounded-lg bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
