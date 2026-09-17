"use client";

import React from "react";
import Link from "next/link";
import { Globe2, ShieldCheck, Mail, Phone, MapPin, Sparkles } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--gray-border)] bg-white text-[var(--gray-muted)] text-xs pt-12 pb-10">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 space-y-3">
            <Link href="/" className="flex items-center group inline-flex">
              <span className="text-2xl tracking-tight leading-none">
                <strong className="font-extrabold text-[var(--emerald-deep)]">Dela</strong>
                <span className="font-light text-[var(--gray-muted)]">HR</span>
              </span>
            </Link>

            <p className="text-xs text-[var(--gray-muted)] leading-relaxed max-w-sm">
              The unified workforce and payroll operating system engineered for cross-border enterprises. Automate global multi-currency payroll, 24/7 continuous rosters, employee claims, and corporate leave with total peace of mind.
            </p>

            {/* Global Reach Indicator */}
            <div className="pt-2 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--emerald-deep)] flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
                <span>Global Multi-Jurisdiction Engine • 150+ Currencies</span>
              </span>
              <p className="text-[11px] text-[var(--gray-muted)]">
                Universal compliance coverage for distributed workforces worldwide.
              </p>
            </div>
          </div>

          {/* Solutions Column */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--gray-text)]">
              Solutions
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/solutions#workforce" className="hover:text-[var(--emerald-deep)] transition">
                  Global Workforce & Core HR
                </Link>
              </li>
              <li>
                <Link href="/solutions#payroll" className="hover:text-[var(--emerald-deep)] transition">
                  Multi-Currency Payroll
                </Link>
              </li>
              <li>
                <Link href="/solutions#shifts" className="hover:text-[var(--emerald-deep)] transition">
                  24/7 Shifts & Rosters
                </Link>
              </li>
              <li>
                <Link href="/solutions#leave" className="hover:text-[var(--emerald-deep)] transition">
                  Leave & Shutdowns
                </Link>
              </li>
              <li>
                <Link href="/solutions#claims" className="hover:text-[var(--emerald-deep)] transition">
                  Expense Advances & Per Diem
                </Link>
              </li>
              <li>
                <Link href="/solutions#forms" className="hover:text-[var(--emerald-deep)] transition">
                  Digital Forms & E-Sign
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Column */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--gray-text)]">
              Platform
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/use-cases" className="hover:text-[var(--emerald-deep)] transition">
                  Who We Serve
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[var(--emerald-deep)] transition">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/book-demo" className="hover:text-[var(--emerald-deep)] transition">
                  Book a Live Demo
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-[var(--emerald-deep)] transition">
                  Customer Portal Login
                </Link>
              </li>
              <li>
                <Link href="/solutions#it-fleet" className="hover:text-[var(--emerald-deep)] transition">
                  IT Fleet Logistics
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Company */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--gray-text)]">
              Resources & Company
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/resources/blog" className="hover:text-[var(--emerald-deep)] transition">
                  Blog & Articles
                </Link>
              </li>
              <li>
                <Link href="/resources/events" className="hover:text-[var(--emerald-deep)] transition">
                  Events & Webinars
                </Link>
              </li>
              <li>
                <Link href="/resources/help" className="hover:text-[var(--emerald-deep)] transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/resources/careers" className="hover:text-[var(--emerald-deep)] transition">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/resources/partners" className="hover:text-[var(--emerald-deep)] transition">
                  Partnerships
                </Link>
              </li>
              <li>
                <Link href="/resources/faq" className="hover:text-[var(--emerald-deep)] transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[var(--emerald-deep)] transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--emerald-deep)] transition">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Security */}
        <div className="pt-6 border-t border-[var(--gray-border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>© {new Date().getFullYear()} DelaHR Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-[var(--emerald-deep)] font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Enterprise SOC2 & Data Privacy Compliant</span>
            </span>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[var(--emerald-deep)] transition">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[var(--emerald-deep)] transition">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/eula" className="hover:text-[var(--emerald-deep)] transition">
              EULA
            </Link>
            <span>•</span>
            <Link href="/sla" className="hover:text-[var(--emerald-deep)] transition">
              SLA
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
