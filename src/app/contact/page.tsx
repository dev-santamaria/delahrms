"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from "lucide-react";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[var(--cool-gray)] text-[var(--gray-text)] font-sans flex flex-col">
      <SiteHeader />

      <section className="bg-white border-b border-[var(--gray-border)] py-14">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--emerald-deep)]">
            Connect With Our Team
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--gray-text)]">
            We are here to support your global workforce.
          </h1>
          <p className="text-sm text-[var(--gray-muted)] leading-relaxed">
            Have questions about cross-border compliance, pricing, or custom integrations? Send us a note or call our dedicated advisory team.
          </p>
        </div>
      </section>

      <section className="py-12 flex-1">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
                <div className="flex items-center gap-2.5 text-[var(--emerald-deep)] font-bold text-xs">
                  <Mail className="h-4 w-4" />
                  <span>General & Sales Inquiries</span>
                </div>
                <p className="text-xs text-[var(--gray-muted)]">hello@delahr.com</p>
                <p className="text-xs text-[var(--gray-muted)]">enterprise@delahr.com</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
                <div className="flex items-center gap-2.5 text-[var(--emerald-deep)] font-bold text-xs">
                  <Phone className="h-4 w-4" />
                  <span>Direct Advisory Desk</span>
                </div>
                <p className="text-xs text-[var(--gray-muted)]">+254 700 000 000 (East Africa Hub)</p>
                <p className="text-xs text-[var(--gray-muted)]">+44 20 7946 0000 (UK & Europe)</p>
                <p className="text-xs text-[var(--gray-muted)]">+1 (800) 555-0199 (North America)</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
                <div className="flex items-center gap-2.5 text-[var(--emerald-deep)] font-bold text-xs">
                  <MapPin className="h-4 w-4" />
                  <span>Regional Headquarters</span>
                </div>
                <p className="text-xs text-[var(--gray-muted)]">
                  Delaware HQ: 1209 Orange St, Wilmington, DE, USA
                </p>
                <p className="text-xs text-[var(--gray-muted)]">
                  Regional Hubs: Nairobi, Kampala, London
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
              {submitted ? (
                <div className="py-12 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)] mx-auto flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--gray-text)]">Message Sent Successfully</h3>
                  <p className="text-xs text-[var(--gray-muted)] max-w-md mx-auto">
                    Thank you for reaching out. A DelaHR workforce specialist will get back to you within 2 business hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-4 py-2 rounded-lg bg-[var(--cool-gray)] text-xs font-bold text-[var(--gray-text)] hover:bg-gray-200 transition"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <h3 className="text-base font-bold text-[var(--gray-text)]">Send us a message</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--gray-text)]">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Nelson Mandela"
                        className="w-full px-3.5 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--gray-text)]">Work Email</label>
                      <input
                        type="email"
                        required
                        placeholder="nelson@company.com"
                        className="w-full px-3.5 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--gray-text)]">Company Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Mandela Holdings Ltd"
                        className="w-full px-3.5 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--gray-text)]">Global Operating Region</label>
                      <select className="w-full px-3 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)]">
                        <option>Worldwide / Multi-Jurisdiction</option>
                        <option>Americas & North America</option>
                        <option>Europe, UK & EEA</option>
                        <option>Asia-Pacific & Australasia</option>
                        <option>Africa & Emerging Markets</option>
                        <option>Middle East & Cross-Border</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--gray-text)]">How can we help?</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Tell us about your team size, payroll frequency, and specific requirements..."
                      className="w-full px-3.5 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white font-bold shadow-xs transition flex items-center gap-2"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit Inquiry</span>
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
