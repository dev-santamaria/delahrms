"use client";

import React from "react";
import Link from "next/link";
import { Handshake, CheckCircle2, ArrowRight, Sparkles, Building2, Coins, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

export default function PartnersPage() {
  const partnerTracks = [
    {
      title: "Accounting & Certified Advisory Firms",
      icon: Coins,
      desc: "Provide your corporate clients with unified multi-country payroll, automated statutory return filings, and double-entry general ledger reconciliation.",
      benefits: [
        "Dedicated Multi-Tenant Partner Console to manage all clients in one view",
        "Generous revenue share and co-marketing opportunities",
        "Direct access to DelaHR senior compliance and tax specialists",
      ],
    },
    {
      title: "Enterprise Systems Integrators",
      icon: Building2,
      desc: "Implement DelaHR alongside enterprise resource planning, banking rails, and corporate directory infrastructures.",
      benefits: [
        "Robust API access, webhooks, and sandbox environments",
        "Certified implementation engineer training program",
        "Joint customer enterprise proposals and bid support",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--cool-gray)] text-[var(--gray-text)] font-sans flex flex-col">
      <SiteHeader />

      <section className="bg-white border-b border-[var(--gray-border)] py-14">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-xs font-semibold text-[var(--emerald-deep)]">
            <Handshake className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
            <span>DelaHR Global Partner Ecosystem</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--gray-text)]">
            Grow your advisory practice with DelaHR.
          </h1>

          <p className="text-sm sm:text-base text-[var(--gray-muted)] max-w-3xl leading-relaxed">
            Partner with DelaHR to deliver world-class workforce, payroll, and 24/7 operational scheduling software to your corporate clients.
          </p>
        </div>
      </section>

      <section className="py-12 flex-1">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {partnerTracks.map((track, i) => {
              const IconComp = track.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-xl bg-[var(--emerald-light)] text-[var(--emerald-deep)] flex items-center justify-center">
                      <IconComp className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-[var(--gray-text)]">{track.title}</h2>
                    <p className="text-xs text-[var(--gray-muted)] leading-relaxed">{track.desc}</p>
                    <div className="pt-2 space-y-2 border-t border-[var(--gray-border)]">
                      {track.benefits.map((b, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-[var(--gray-text)]">
                          <CheckCircle2 className="h-4 w-4 text-[var(--emerald-mint)] mt-0.5 shrink-0" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link
                      href="/contact"
                      className="px-5 py-2.5 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <span>Apply for Partnership</span>
                      <ArrowRight className="h-3.5 w-3.5" />
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
