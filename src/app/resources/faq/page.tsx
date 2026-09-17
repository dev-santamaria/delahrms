"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HelpCircle, ChevronDown, Sparkles, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: "Global Capabilities & Compliance",
      questions: [
        {
          q: "How does DelaHR manage cross-border workforce compliance?",
          a: "DelaHR provides an adaptable statutory engine supporting over 150+ currencies and multi-jurisdiction tax regimes. Each subsidiary or legal entity operates with its own localized tax brackets, social security contributions, and statutory schedules while group executives enjoy unified reporting.",
        },
        {
          q: "Can DelaHR handle non-payroll travel advances and scale-rate per diem?",
          a: "Yes. DelaHR allows pre-trip cash advances to be disbursed immediately outside payroll via mobile money or bank transfer. Upon trip completion, employees can reconcile actual receipts with automated tax clearance validation or utilize approved scale-rate per diem without collecting meal receipts.",
        },
        {
          q: "Does DelaHR support 24/7 continuous industrial shifts and mining FIFO rosters?",
          a: "Yes. DelaHR includes industrial-grade shift scheduling: Continental 3-shift 24/7 rotations, mining FIFO (14/14, 28/28), and 4-on-4-off patterns. The platform enforces mandatory 12-hour rest intervals between shifts to prevent worker fatigue and overtime violations.",
        },
      ],
    },
    {
      category: "Security, Data Privacy & Audits",
      questions: [
        {
          q: "How does DelaHR protect employee financial and personal data?",
          a: "DelaHR enforces enterprise-grade encryption at rest and in transit, strict tenant data isolation, role-based access control, and SHA-256 cryptographic audit seals on all submitted forms, approvals, and bank account changes.",
        },
        {
          q: "How are employee pulse surveys guaranteed to be anonymous?",
          a: "Survey responses are detached from employee identities at the database level. Managers and HR administrators can only view aggregated sentiment distributions and thematic trends when a minimum threshold of responses is met.",
        },
      ],
    },
    {
      category: "Implementation & Migration",
      questions: [
        {
          q: "How long does it take to migrate to DelaHR?",
          a: "Most enterprises complete data import (employee records, leave balances, compensation structures) and go live within 2 to 4 weeks with the assistance of our dedicated implementation engineers.",
        },
        {
          q: "Can DelaHR integrate with our existing general ledger and banking rails?",
          a: "Yes. DelaHR exports balanced double-entry general ledger journal vouchers where debits equal credits to the cent, and provides direct settlement integrations for automated bank EFT and mobile wallet payouts.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--cool-gray)] text-[var(--gray-text)] font-sans flex flex-col">
      <SiteHeader />

      <section className="bg-white border-b border-[var(--gray-border)] py-14">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-xs font-semibold text-[var(--emerald-deep)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
            <span>DelaHR Questions & Answers</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--gray-text)]">
            Frequently Asked Questions
          </h1>

          <p className="text-sm sm:text-base text-[var(--gray-muted)] max-w-3xl leading-relaxed">
            Everything you need to know about DelaHR's global architecture, shift scheduling, payroll compliance, and security standards.
          </p>
        </div>
      </section>

      <section className="py-12 flex-1">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-10">
          {faqs.map((cat, catIdx) => (
            <div key={catIdx} className="space-y-4">
              <h2 className="text-base font-bold text-[var(--emerald-deep)] uppercase tracking-wider text-xs">
                {cat.category}
              </h2>

              <div className="space-y-3">
                {cat.questions.map((faq, qIdx) => {
                  const globalIdx = catIdx * 10 + qIdx;
                  const isOpen = openIndex === globalIdx;
                  return (
                    <div
                      key={qIdx}
                      className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs transition"
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : globalIdx)}
                        className="w-full text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[var(--gray-text)]"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`h-4 w-4 text-[var(--gray-muted)] transition-transform shrink-0 ${
                            isOpen ? "rotate-180 text-[var(--emerald-deep)]" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="pt-3 mt-3 border-t border-[var(--gray-border)] text-xs text-[var(--gray-muted)] leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--gray-text)]">Still have questions?</h3>
              <p className="text-xs text-[var(--gray-muted)]">Our product and compliance specialists are ready to help.</p>
            </div>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold transition shrink-0"
            >
              Contact Advisory Team
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
