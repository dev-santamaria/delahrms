"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Calendar, Clock, ArrowRight, Sparkles, Tag } from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

export default function BlogPage() {
  const posts = [
    {
      title: "Mastering Cross-Border Payroll Compliance Across Multiple Jurisdictions",
      category: "Global Payroll",
      date: "September 14, 2026",
      readTime: "6 min read",
      excerpt:
        "How international enterprises manage localized statutory deductions, multi-currency payouts, and tax authority filing schedules without multiplying administrative headcount.",
    },
    {
      title: "Preventing Worker Fatigue in 24/7 Continuous Shift & Mining Environments",
      category: "Workforce Operations",
      date: "September 02, 2026",
      readTime: "8 min read",
      excerpt:
        "A practical guide to Continental 3-shift rotations, 14/14 FIFO rosters, and automated rest interval enforcement to protect employee well-being and safety.",
    },
    {
      title: "Scale-Rate Per Diem vs. Itemized Receipts: Streamlining Corporate Travel",
      category: "Finance & Expenses",
      date: "August 24, 2026",
      readTime: "5 min read",
      excerpt:
        "Why leading organizations are eliminating meal receipt collection in favor of standardized scale-rate per diem allowances with pre-trip mobile cash advances.",
    },
    {
      title: "The Death of Paper Forms: Legal Digital E-Signatures in Enterprise HR",
      category: "Digital Transformation",
      date: "August 12, 2026",
      readTime: "7 min read",
      excerpt:
        "How cryptographic audit seals, immutable event logs, and dynamic form builders replace printed paperwork and manual scans across distributed teams.",
    },
    {
      title: "Planning Automated Corporate Holiday Shutdowns Without Administrative Chaos",
      category: "Leave Management",
      date: "July 29, 2026",
      readTime: "4 min read",
      excerpt:
        "Step-by-step framework for 1-click company-wide year-end holiday closures, advance leave carryovers, and maintaining departmental skeleton coverage.",
    },
    {
      title: "Why Anonymous Pulse Surveys Drive Authentic Organizational Intelligence",
      category: "People & Culture",
      date: "July 15, 2026",
      readTime: "6 min read",
      excerpt:
        "Exploring how database-level anonymity guarantees psychological safety and unlocks honest employee feedback on management, workload, and culture.",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--cool-gray)] text-[var(--gray-text)] font-sans flex flex-col">
      <SiteHeader />

      <section className="bg-white border-b border-[var(--gray-border)] py-14">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-xs font-semibold text-[var(--emerald-deep)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
            <span>DelaHR Insights & Industry Research</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--gray-text)]">
            Articles, Guides & Workforce Leadership
          </h1>

          <p className="text-sm sm:text-base text-[var(--gray-muted)] max-w-3xl leading-relaxed">
            Expert perspectives on international labor compliance, continuous shift rostering, travel advance policies, and modern enterprise people operations.
          </p>
        </div>
      </section>

      <section className="py-12 flex-1">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <article
                key={index}
                className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4 flex flex-col justify-between hover:border-[var(--emerald-mint)] transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--emerald-deep)] px-2.5 py-0.5 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)]">
                      {post.category}
                    </span>
                    <span className="text-[var(--gray-muted)] font-mono">{post.readTime}</span>
                  </div>

                  <h2 className="text-base font-bold text-[var(--gray-text)] leading-snug hover:text-[var(--emerald-deep)] transition">
                    {post.title}
                  </h2>

                  <p className="text-xs text-[var(--gray-muted)] leading-relaxed">{post.excerpt}</p>
                </div>

                <div className="pt-4 border-t border-[var(--gray-border)] flex items-center justify-between text-xs">
                  <span className="text-[var(--gray-muted)]">{post.date}</span>
                  <Link
                    href="/book-demo"
                    className="font-bold text-[var(--emerald-deep)] hover:underline flex items-center gap-1"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
