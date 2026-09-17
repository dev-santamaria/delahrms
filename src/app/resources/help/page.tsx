"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HelpCircle, Search, BookOpen, ShieldCheck, Settings, Users, Coins, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      title: "Getting Started & Organization Setup",
      icon: Settings,
      topics: [
        "Configuring legal entities and subsidiaries",
        "Setting up custom departments and cost centers",
        "Inviting employees and assigning role-based permissions",
      ],
    },
    {
      title: "Payroll & Statutory Engine",
      icon: Coins,
      topics: [
        "Running multi-currency gross-to-net calculations",
        "Exporting official government tax returns",
        "Setting up third-party remittances (SACCOs/Pensions)",
      ],
    },
    {
      title: "Shift Scheduling & Time Attendance",
      icon: Users,
      topics: [
        "Creating Continental 3-shift rotation patterns",
        "Configuring 12-hour mandatory rest guardrails",
        "Geofence mobile clock-in perimeters setup",
      ],
    },
    {
      title: "Leave & Corporate Shutdowns",
      icon: BookOpen,
      topics: [
        "Scheduling 1-click corporate holiday closures",
        "Managing carryover extensions exceeding standard caps",
        "Departmental minimum coverage rules",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--cool-gray)] text-[var(--gray-text)] font-sans flex flex-col">
      <SiteHeader />

      <section className="bg-white border-b border-[var(--gray-border)] py-14">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-xs font-semibold text-[var(--emerald-deep)]">
            <HelpCircle className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
            <span>DelaHR Knowledgebase & Documentation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--gray-text)]">
            How can we help your operations today?
          </h1>

          {/* Search Input */}
          <div className="max-w-xl relative pt-2">
            <Search className="absolute left-3.5 top-5 h-4 w-4 text-[var(--gray-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, setup tutorials, statutory workflows..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--gray-border)] bg-[var(--cool-gray)] text-xs focus:outline-none focus:border-[var(--emerald-mint)] focus:bg-white text-[var(--gray-text)]"
            />
          </div>
        </div>
      </section>

      <section className="py-12 flex-1">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-[var(--emerald-light)] text-[var(--emerald-deep)] flex items-center justify-center">
                      <IconComp className="h-4 w-4" />
                    </div>
                    <h2 className="text-base font-bold text-[var(--gray-text)]">{cat.title}</h2>
                  </div>

                  <ul className="space-y-2.5 text-xs text-[var(--gray-text)] border-t border-[var(--gray-border)] pt-3">
                    {cat.topics.map((t, i) => (
                      <li key={i} className="flex items-center justify-between group cursor-pointer">
                        <span className="group-hover:text-[var(--emerald-deep)] transition">
                          {t}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-[var(--gray-muted)] group-hover:text-[var(--emerald-deep)] group-hover:translate-x-0.5 transition" />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--gray-text)]">Need dedicated engineering or compliance support?</h3>
              <p className="text-xs text-[var(--gray-muted)]">Our enterprise operations desk is available 24/7.</p>
            </div>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold shadow-xs hover:bg-[var(--emerald-deep-hover)] transition shrink-0"
            >
              Contact Support Desk
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
