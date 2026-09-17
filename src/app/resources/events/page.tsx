"use client";

import React from "react";
import Link from "next/link";
import { Calendar, Clock, Video, Users, ArrowRight, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

export default function EventsPage() {
  const events = [
    {
      title: "Global Payroll & Cross-Border Statutory Architecture: 2026 Masterclass",
      date: "October 15, 2026",
      time: "2:00 PM – 3:30 PM (UTC / GMT)",
      type: "Virtual Masterclass",
      speaker: "International Tax & Labor Policy Specialists",
      description:
        "Deep dive into multi-subsidiary payroll reconciliation, currency volatility hedging, and automated 1-click statutory returns for distributed workforces.",
    },
    {
      title: "24/7 Shift Rostering: Eliminating Fatigue Violations & Reducing Overtime Costs",
      date: "November 5, 2026",
      time: "3:00 PM – 4:00 PM (UTC / GMT)",
      type: "Operations Roundtable",
      speaker: "Plant Managers & Industrial Safety Directors",
      description:
        "Learn how mining, manufacturing, and healthcare leaders configure Continental 3-shift rotations and automated 12-hour rest period guardrails.",
    },
    {
      title: "Paperless People Operations: Implementing Cryptographic E-Signatures & Audit Seals",
      date: "November 20, 2026",
      time: "1:00 PM – 2:00 PM (UTC / GMT)",
      type: "Executive Tech Briefing",
      speaker: "Enterprise Security & Compliance Team",
      description:
        "Discover how to replace paper onboarding documents, policy forms, and bank change requests with tamper-evident digital signature workflows.",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--cool-gray)] text-[var(--gray-text)] font-sans flex flex-col">
      <SiteHeader />

      <section className="bg-white border-b border-[var(--gray-border)] py-14">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-xs font-semibold text-[var(--emerald-deep)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
            <span>Interactive Learning & Community</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--gray-text)]">
            Events, Webinars & Masterclasses
          </h1>

          <p className="text-sm sm:text-base text-[var(--gray-muted)] max-w-3xl leading-relaxed">
            Connect directly with global HR directors, labor attorneys, and enterprise operations leaders in live interactive workshops.
          </p>
        </div>
      </section>

      <section className="py-12 flex-1">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-6">
          {events.map((event, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-[var(--emerald-mint)] transition"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-bold text-[var(--emerald-deep)] px-2.5 py-0.5 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)]">
                    {event.type}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[var(--gray-muted)]">
                    <Calendar className="h-3.5 w-3.5 text-[var(--emerald-deep)]" />
                    {event.date}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[var(--gray-muted)]">
                    <Clock className="h-3.5 w-3.5 text-[var(--emerald-deep)]" />
                    {event.time}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-[var(--gray-text)]">{event.title}</h2>
                <p className="text-xs text-[var(--gray-muted)] leading-relaxed">{event.description}</p>
                <p className="text-xs font-semibold text-[var(--gray-text)]">Panel: {event.speaker}</p>
              </div>

              <Link
                href="/book-demo"
                className="px-6 py-2.5 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-2 shrink-0"
              >
                <Video className="h-4 w-4" />
                <span>Reserve Free Seat</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
