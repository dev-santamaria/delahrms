"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  HelpCircle,
  Briefcase,
  Handshake,
  Sparkles,
  ChevronDown,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

export default function ResourcesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const articles = [
    {
      title: "How to Automate Statutory Payroll Returns Across East Africa",
      category: "Compliance Guide",
      date: "September 2026",
      readTime: "5 min read",
    },
    {
      title: "Managing 24/7 Shift Rosters and Rest Periods in Mining & Manufacturing",
      category: "Operations",
      date: "August 2026",
      readTime: "7 min read",
    },
    {
      title: "Scale-Rate Per Diem vs Receipt Reimbursements: Tax Implications",
      category: "Finance & Travel",
      date: "August 2026",
      readTime: "4 min read",
    },
  ];

  const events = [
    {
      title: "Mastering Cross-Border Payroll & Statutory Deductions",
      date: "October 15, 2026",
      time: "2:00 PM EAT",
      type: "Live Webinar",
    },
    {
      title: "Enterprise Shift Scheduling: Reducing Worker Fatigue & Overtime Waste",
      date: "November 5, 2026",
      time: "3:30 PM EAT",
      type: "Panel Discussion",
    },
  ];

  const faqs = [
    {
      q: "Can DelaHR manage employees across multiple legal entities and currencies?",
      a: "Yes. DelaHR is architected natively for multi-subsidiary enterprises. You can configure individual legal entities with their own local statutory tax rules, currencies (150+ global currencies), and bank payout rails while retaining centralized group-level executive reporting.",
    },
    {
      q: "How does DelaHR handle travel advances and scale-rate per diem?",
      a: "DelaHR separates pre-trip cash advances from payroll, allowing instant disbursals to employees via mobile money or bank transfer. Post-trip, employees upload receipts with automated tax clearance validation or submit scale-rate daily per diem without collecting meal receipts.",
    },
    {
      q: "How does the corporate holiday shutdown feature work?",
      a: "Administrators can schedule corporate year-end or public closures (such as December 24 to January 2). With 1-click, the system calculates working business days excluding official public holidays and bulk-debits annual leave balances company-wide.",
    },
    {
      q: "Does DelaHR support fatigue management for industrial shift rotations?",
      a: "Yes. DelaHR enforces mandatory rest intervals (e.g. 12 hours between consecutive shifts) and prevents illegal roster assignments. Shift differentials, night allowances, and hazardous environment bonuses are calculated automatically.",
    },
    {
      q: "How secure is employee personal data and payroll information?",
      a: "All records are protected by enterprise-grade encryption at rest and in transit, strict row-level security isolation per tenant, and tamper-evident audit logging for every change.",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--cool-gray)] text-[var(--gray-text)] font-sans flex flex-col">
      <SiteHeader />

      <section className="bg-white border-b border-[var(--gray-border)] py-14">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-xs font-semibold text-[var(--emerald-deep)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
            <span>Knowledge Hub & Community</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--gray-text)]">
            Resources, Guides & Answers
          </h1>

          <p className="text-sm sm:text-base text-[var(--gray-muted)] leading-relaxed">
            Everything you need to master cross-border workforce operations, stay compliant with evolving labor laws, and get the most out of DelaHR.
          </p>
        </div>
      </section>

      <div className="py-12 flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-12">
        {/* Section 1: Blog & Articles */}
        <section id="blog" className="space-y-4 scroll-mt-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[var(--emerald-deep)]" />
              <h2 className="text-lg font-bold text-[var(--gray-text)]">Latest Articles & Guides</h2>
            </div>
            <Link
              href="/resources/blog"
              className="text-xs font-bold text-[var(--emerald-deep)] hover:underline flex items-center gap-1"
            >
              <span>View all articles</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((art, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--emerald-deep)] px-2 py-0.5 rounded bg-[var(--emerald-light)] border border-[var(--emerald-border)]">
                    {art.category}
                  </span>
                  <h3 className="text-sm font-bold text-[var(--gray-text)] leading-snug">{art.title}</h3>
                </div>
                <div className="pt-2 border-t border-[var(--gray-border)] flex items-center justify-between text-[11px] text-[var(--gray-muted)]">
                  <span>{art.date}</span>
                  <Link href="/resources/blog" className="font-bold text-[var(--emerald-deep)] hover:underline">
                    Read →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Events & Webinars */}
        <section id="events" className="space-y-4 scroll-mt-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[var(--emerald-deep)]" />
              <h2 className="text-lg font-bold text-[var(--gray-text)]">Upcoming Events & Webinars</h2>
            </div>
            <Link
              href="/resources/events"
              className="text-xs font-bold text-[var(--emerald-deep)] hover:underline flex items-center gap-1"
            >
              <span>View all events</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((ev, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                    {ev.type}
                  </span>
                  <span className="text-xs font-mono text-[var(--gray-muted)]">{ev.date}</span>
                </div>
                <h3 className="text-sm font-bold text-[var(--gray-text)]">{ev.title}</h3>
                <p className="text-xs text-[var(--gray-muted)]">Time: {ev.time}</p>
                <Link
                  href="/resources/events"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--emerald-deep)] hover:underline"
                >
                  <span>Reserve Free Seat</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Help Center & Partnerships & Careers */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div id="help" className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3 scroll-mt-20">
            <div className="h-9 w-9 rounded-xl bg-[var(--emerald-light)] text-[var(--emerald-deep)] flex items-center justify-center">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--gray-text)]">Help Center & Docs</h3>
            <p className="text-xs text-[var(--gray-muted)] leading-relaxed">
              Step-by-step documentation, user permissions, and configuration guides for HR managers.
            </p>
            <Link href="/resources/help" className="text-xs font-bold text-[var(--emerald-deep)] hover:underline block pt-1">
              Browse Knowledgebase →
            </Link>
          </div>

          <div id="careers" className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3 scroll-mt-20">
            <div className="h-9 w-9 rounded-xl bg-[var(--emerald-light)] text-[var(--emerald-deep)] flex items-center justify-center">
              <Briefcase className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--gray-text)]">Careers at DelaHR</h3>
            <p className="text-xs text-[var(--gray-muted)] leading-relaxed">
              We are building the future of cross-border enterprise workforce technology. Join our distributed team.
            </p>
            <Link href="/resources/careers" className="text-xs font-bold text-[var(--emerald-deep)] hover:underline block pt-1">
              View Open Positions →
            </Link>
          </div>

          <div id="partners" className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3 scroll-mt-20">
            <div className="h-9 w-9 rounded-xl bg-[var(--emerald-light)] text-[var(--emerald-deep)] flex items-center justify-center">
              <Handshake className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--gray-text)]">Partner Program</h3>
            <p className="text-xs text-[var(--gray-muted)] leading-relaxed">
              Partner with DelaHR to bring modern payroll and workforce automation to your client organizations.
            </p>
            <Link href="/resources/partners" className="text-xs font-bold text-[var(--emerald-deep)] hover:underline block pt-1">
              Apply as Partner →
            </Link>
          </div>
        </section>

        {/* Section 4: FAQ */}
        <section id="faq" className="space-y-4 scroll-mt-20">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[var(--gray-text)]">Frequently Asked Questions</h2>
              <p className="text-xs text-[var(--gray-muted)]">Quick answers to common questions about DelaHR</p>
            </div>
            <Link
              href="/resources/faq"
              className="text-xs font-bold text-[var(--emerald-deep)] hover:underline flex items-center gap-1"
            >
              <span>View complete FAQ</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-[var(--gray-border)] bg-white overflow-hidden shadow-xs transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-5 py-3.5 text-left flex items-center justify-between gap-4 font-semibold text-xs text-[var(--gray-text)]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-[var(--gray-muted)] transition-transform ${
                        isOpen ? "rotate-180 text-[var(--emerald-deep)]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs text-[var(--gray-muted)] leading-relaxed border-t border-[var(--gray-border)]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
