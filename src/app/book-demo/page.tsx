"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Users,
  Globe2,
  ArrowRight,
} from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

export default function BookDemoPage() {
  const [confirmed, setConfirmed] = useState(false);
  const [selectedTime, setSelectedTime] = useState("10:00 AM EAT");

  const times = [
    "09:00 AM EAT",
    "10:00 AM EAT",
    "11:30 AM EAT",
    "02:00 PM EAT",
    "03:30 PM EAT",
    "05:00 PM EAT",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmed(true);
  };

  return (
    <div className="min-h-screen bg-[var(--cool-gray)] text-[var(--gray-text)] font-sans flex flex-col">
      <SiteHeader />

      <section className="py-12 flex-1">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Left Value Column */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-xs font-semibold text-[var(--emerald-deep)]">
                <Sparkles className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
                <span>Personalized 1-on-1 Product Walkthrough</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--gray-text)] leading-tight">
                Experience how DelaHR automates your people operations.
              </h1>

              <p className="text-sm text-[var(--gray-muted)] leading-relaxed">
                In this 30-minute tailored session, an enterprise specialist will show you how DelaHR handles cross-border statutory filings, 24/7 continuous industrial rosters, non-payroll travel advances, and digital e-signatures.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)] mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--gray-text)]">Tailored to your operating jurisdictions</p>
                    <p className="text-[11px] text-[var(--gray-muted)]">
                      Explore statutory presets for your specific countries across Africa, EMEA, the Americas, and APAC.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)] mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--gray-text)]">Live payroll calculation review</p>
                    <p className="text-[11px] text-[var(--gray-muted)]">
                      See instant gross-to-net math verified to 0.00 discrepancy with direct payout rail simulation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)] mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--gray-text)]">Answers to your technical questions</p>
                    <p className="text-[11px] text-[var(--gray-muted)]">
                      Discuss custom approval chains, general ledger sync, and data migration timelines.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Booking Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[var(--gray-border)] shadow-sm">
              {confirmed ? (
                <div className="py-10 text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)] mx-auto flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--gray-text)]">Demo Session Confirmed!</h3>
                  <p className="text-xs text-[var(--gray-muted)] max-w-sm mx-auto leading-relaxed">
                    We have sent a calendar invite with Google Meet / Zoom access details to your email for <strong>{selectedTime}</strong>.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/"
                      className="px-5 py-2.5 rounded-lg bg-[var(--emerald-deep)] text-white text-xs font-bold shadow-xs inline-block"
                    >
                      Return to Homepage
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <h3 className="text-base font-bold text-[var(--gray-text)]">Schedule Your Session</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--gray-text)]">First Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Nelson"
                        className="w-full px-3 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--gray-text)]">Last Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Mandela"
                        className="w-full px-3 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--gray-text)]">Work Email</label>
                    <input
                      type="email"
                      required
                      placeholder="nelson@enterprise.com"
                      className="w-full px-3 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--gray-text)]">Company Size</label>
                      <select className="w-full px-3 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)]">
                        <option>10 – 50 Employees</option>
                        <option>51 – 200 Employees</option>
                        <option>201 – 1,000 Employees</option>
                        <option>1,000+ Employees</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--gray-text)]">Primary Focus</label>
                      <select className="w-full px-3 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)]">
                        <option>Multi-Country Payroll</option>
                        <option>24/7 Shift Rosters</option>
                        <option>Leave & Shutdowns</option>
                        <option>Claims & Advances</option>
                        <option>Complete Suite</option>
                      </select>
                    </div>
                  </div>

                  {/* Preferred Time Slot */}
                  <div className="space-y-1.5 pt-1">
                    <label className="font-semibold text-[var(--gray-text)]">Select Time Slot (Tomorrow)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {times.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectedTime(t)}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition ${
                            selectedTime === t
                              ? "bg-[var(--emerald-light)] text-[var(--emerald-deep)] border-[var(--emerald-border)] font-bold"
                              : "border-[var(--gray-border)] text-[var(--gray-muted)] hover:bg-[var(--cool-gray)]"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Confirm 30-Min Demo</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
