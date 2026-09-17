"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Coins,
  CalendarDays,
  Clock,
  Receipt,
  FileCheck2,
  Laptop,
  Briefcase,
  HelpCircle,
  Calendar,
  Handshake,
  BookOpen,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[var(--gray-border)]">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 h-16 flex items-center justify-between">
        {/* Brand Logo: Dela(bold)HR(faint thin) */}
        <Link href="/" className="flex items-center group">
          <span className="text-2xl tracking-tight leading-none">
            <strong className="font-extrabold text-[var(--emerald-deep)]">Dela</strong>
            <span className="font-light text-[var(--gray-muted)]">HR</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          <NavigationMenu>
            <NavigationMenuList className="space-x-1">
              {/* 1. Solutions Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-xs font-semibold text-[var(--gray-text)] hover:text-[var(--emerald-deep)] hover:bg-[var(--emerald-light)] data-[state=open]:bg-[var(--emerald-light)] data-[state=open]:text-[var(--emerald-deep)]">
                  Solutions
                </NavigationMenuTrigger>
                <NavigationMenuContent className="p-4 w-[540px] bg-white border border-[var(--gray-border)] shadow-xl rounded-xl">
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/solutions#workforce"
                      className="p-2.5 rounded-lg hover:bg-[var(--cool-gray)] transition group flex items-start gap-3"
                    >
                      <div className="p-1.5 rounded-md bg-[var(--emerald-light)] text-[var(--emerald-deep)] group-hover:bg-[var(--emerald-deep)] group-hover:text-white transition">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--gray-text)] group-hover:text-[var(--emerald-deep)]">
                          Global Workforce & Core HR
                        </p>
                        <p className="text-[11px] text-[var(--gray-muted)] leading-snug">
                          Multi-entity organization charts, employee records & contracts.
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/solutions#payroll"
                      className="p-2.5 rounded-lg hover:bg-[var(--cool-gray)] transition group flex items-start gap-3"
                    >
                      <div className="p-1.5 rounded-md bg-[var(--emerald-light)] text-[var(--emerald-deep)] group-hover:bg-[var(--emerald-deep)] group-hover:text-white transition">
                        <Coins className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--gray-text)] group-hover:text-[var(--emerald-deep)]">
                          Payroll & Statutory Filings
                        </p>
                        <p className="text-[11px] text-[var(--gray-muted)] leading-snug">
                          Automated gross-to-net, tax schedules & instant disbursals.
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/solutions#shifts"
                      className="p-2.5 rounded-lg hover:bg-[var(--cool-gray)] transition group flex items-start gap-3"
                    >
                      <div className="p-1.5 rounded-md bg-[var(--emerald-light)] text-[var(--emerald-deep)] group-hover:bg-[var(--emerald-deep)] group-hover:text-white transition">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--gray-text)] group-hover:text-[var(--emerald-deep)]">
                          24/7 Shifts & Rostering
                        </p>
                        <p className="text-[11px] text-[var(--gray-muted)] leading-snug">
                          Continuous rotations, mining FIFO schedules & rest enforcement.
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/solutions#leave"
                      className="p-2.5 rounded-lg hover:bg-[var(--cool-gray)] transition group flex items-start gap-3"
                    >
                      <div className="p-1.5 rounded-md bg-[var(--emerald-light)] text-[var(--emerald-deep)] group-hover:bg-[var(--emerald-deep)] group-hover:text-white transition">
                        <CalendarDays className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--gray-text)] group-hover:text-[var(--emerald-deep)]">
                          Leave & Corporate Shutdowns
                        </p>
                        <p className="text-[11px] text-[var(--gray-muted)] leading-snug">
                          Annual accruals, carryovers & bulk holiday auto-deductions.
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/solutions#claims"
                      className="p-2.5 rounded-lg hover:bg-[var(--cool-gray)] transition group flex items-start gap-3"
                    >
                      <div className="p-1.5 rounded-md bg-[var(--emerald-light)] text-[var(--emerald-deep)] group-hover:bg-[var(--emerald-deep)] group-hover:text-white transition">
                        <Receipt className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--gray-text)] group-hover:text-[var(--emerald-deep)]">
                          Expense Claims & Travel Per Diem
                        </p>
                        <p className="text-[11px] text-[var(--gray-muted)] leading-snug">
                          Non-payroll pre-trip advances, scale rates & receipt validation.
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/solutions#forms"
                      className="p-2.5 rounded-lg hover:bg-[var(--cool-gray)] transition group flex items-start gap-3"
                    >
                      <div className="p-1.5 rounded-md bg-[var(--emerald-light)] text-[var(--emerald-deep)] group-hover:bg-[var(--emerald-deep)] group-hover:text-white transition">
                        <FileCheck2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--gray-text)] group-hover:text-[var(--emerald-deep)]">
                          Digital Forms & E-Signatures
                        </p>
                        <p className="text-[11px] text-[var(--gray-muted)] leading-snug">
                          Paperless workflows, verified signatures & tamper-evident seals.
                        </p>
                      </div>
                    </Link>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[var(--gray-border)] flex items-center justify-between text-xs">
                    <span className="text-[var(--gray-muted)]">Looking for the complete suite?</span>
                    <Link
                      href="/solutions"
                      className="font-bold text-[var(--emerald-deep)] hover:underline flex items-center gap-1"
                    >
                      <span>Explore all Solutions</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* 2. Use Cases / Who We Serve */}
              <NavigationMenuItem>
                <Link
                  href="/use-cases"
                  className="px-3 py-2 text-xs font-semibold text-[var(--gray-text)] hover:text-[var(--emerald-deep)] hover:bg-[var(--emerald-light)] rounded-lg transition"
                >
                  Who We Serve
                </Link>
              </NavigationMenuItem>

              {/* 3. Pricing */}
              <NavigationMenuItem>
                <Link
                  href="/pricing"
                  className="px-3 py-2 text-xs font-semibold text-[var(--gray-text)] hover:text-[var(--emerald-deep)] hover:bg-[var(--emerald-light)] rounded-lg transition"
                >
                  Pricing
                </Link>
              </NavigationMenuItem>

              {/* 4. Resources Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-xs font-semibold text-[var(--gray-text)] hover:text-[var(--emerald-deep)] hover:bg-[var(--emerald-light)] data-[state=open]:bg-[var(--emerald-light)] data-[state=open]:text-[var(--emerald-deep)]">
                  Resources
                </NavigationMenuTrigger>
                <NavigationMenuContent className="p-3 w-[360px] bg-white border border-[var(--gray-border)] shadow-xl rounded-xl space-y-1">
                  <Link
                    href="/resources/blog"
                    className="p-2 rounded-lg hover:bg-[var(--cool-gray)] transition flex items-center gap-3 text-xs"
                  >
                    <BookOpen className="h-4 w-4 text-[var(--emerald-deep)]" />
                    <div>
                      <p className="font-bold text-[var(--gray-text)]">Blog & Articles</p>
                      <p className="text-[11px] text-[var(--gray-muted)]">Labor compliance, payroll guides & leadership</p>
                    </div>
                  </Link>

                  <Link
                    href="/resources/events"
                    className="p-2 rounded-lg hover:bg-[var(--cool-gray)] transition flex items-center gap-3 text-xs"
                  >
                    <Calendar className="h-4 w-4 text-[var(--emerald-deep)]" />
                    <div>
                      <p className="font-bold text-[var(--gray-text)]">Events & Webinars</p>
                      <p className="text-[11px] text-[var(--gray-muted)]">Live sessions with global HR specialists</p>
                    </div>
                  </Link>

                  <Link
                    href="/resources/help"
                    className="p-2 rounded-lg hover:bg-[var(--cool-gray)] transition flex items-center gap-3 text-xs"
                  >
                    <HelpCircle className="h-4 w-4 text-[var(--emerald-deep)]" />
                    <div>
                      <p className="font-bold text-[var(--gray-text)]">Help Center</p>
                      <p className="text-[11px] text-[var(--gray-muted)]">Guides, tutorials & setup documentation</p>
                    </div>
                  </Link>

                  <Link
                    href="/resources/careers"
                    className="p-2 rounded-lg hover:bg-[var(--cool-gray)] transition flex items-center gap-3 text-xs"
                  >
                    <Briefcase className="h-4 w-4 text-[var(--emerald-deep)]" />
                    <div>
                      <p className="font-bold text-[var(--gray-text)]">Careers</p>
                      <p className="text-[11px] text-[var(--gray-muted)]">Join our mission to reshape global work</p>
                    </div>
                  </Link>

                  <Link
                    href="/resources/partners"
                    className="p-2 rounded-lg hover:bg-[var(--cool-gray)] transition flex items-center gap-3 text-xs"
                  >
                    <Handshake className="h-4 w-4 text-[var(--emerald-deep)]" />
                    <div>
                      <p className="font-bold text-[var(--gray-text)]">Partnerships</p>
                      <p className="text-[11px] text-[var(--gray-muted)]">Accountants, advisors & technology partners</p>
                    </div>
                  </Link>

                  <Link
                    href="/resources/faq"
                    className="p-2 rounded-lg hover:bg-[var(--cool-gray)] transition flex items-center gap-3 text-xs"
                  >
                    <Sparkles className="h-4 w-4 text-[var(--emerald-deep)]" />
                    <div>
                      <p className="font-bold text-[var(--gray-text)]">Frequently Asked Questions</p>
                      <p className="text-[11px] text-[var(--gray-muted)]">Quick answers on onboarding, security & billing</p>
                    </div>
                  </Link>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* 5. About */}
              <NavigationMenuItem>
                <Link
                  href="/about"
                  className="px-3 py-2 text-xs font-semibold text-[var(--gray-text)] hover:text-[var(--emerald-deep)] hover:bg-[var(--emerald-light)] rounded-lg transition"
                >
                  About Us
                </Link>
              </NavigationMenuItem>

              {/* 6. Contact */}
              <NavigationMenuItem>
                <Link
                  href="/contact"
                  className="px-3 py-2 text-xs font-semibold text-[var(--gray-text)] hover:text-[var(--emerald-deep)] hover:bg-[var(--emerald-light)] rounded-lg transition"
                >
                  Contact Support
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Action Buttons: Login + Book Demo */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link
            href="/auth/login"
            className="px-3.5 py-2 rounded-lg text-xs font-bold text-[var(--gray-text)] hover:text-[var(--emerald-deep)] hover:bg-[var(--cool-gray)] transition"
          >
            Login
          </Link>
          <Link
            href="/book-demo"
            className="px-4 py-2 rounded-lg bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <span>Book Demo</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/book-demo"
            className="px-3 py-1.5 rounded-lg bg-[var(--emerald-deep)] text-white text-xs font-bold"
          >
            Demo
          </Link>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg border border-[var(--gray-border)] text-[var(--gray-text)]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-[var(--gray-border)] bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-semibold text-[var(--gray-text)]">
            <Link
              href="/solutions"
              onClick={() => setMobileOpen(false)}
              className="py-1.5 hover:text-[var(--emerald-deep)]"
            >
              Solutions
            </Link>
            <Link
              href="/use-cases"
              onClick={() => setMobileOpen(false)}
              className="py-1.5 hover:text-[var(--emerald-deep)]"
            >
              Who We Serve
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileOpen(false)}
              className="py-1.5 hover:text-[var(--emerald-deep)]"
            >
              Pricing
            </Link>
            <Link
              href="/resources/blog"
              onClick={() => setMobileOpen(false)}
              className="py-1.5 hover:text-[var(--emerald-deep)]"
            >
              Blog & Articles
            </Link>
            <Link
              href="/resources/events"
              onClick={() => setMobileOpen(false)}
              className="py-1.5 hover:text-[var(--emerald-deep)]"
            >
              Events & Webinars
            </Link>
            <Link
              href="/resources/help"
              onClick={() => setMobileOpen(false)}
              className="py-1.5 hover:text-[var(--emerald-deep)]"
            >
              Help Center
            </Link>
            <Link
              href="/resources/careers"
              onClick={() => setMobileOpen(false)}
              className="py-1.5 hover:text-[var(--emerald-deep)]"
            >
              Careers
            </Link>
            <Link
              href="/resources/partners"
              onClick={() => setMobileOpen(false)}
              className="py-1.5 hover:text-[var(--emerald-deep)]"
            >
              Partnerships
            </Link>
            <Link
              href="/resources/faq"
              onClick={() => setMobileOpen(false)}
              className="py-1.5 hover:text-[var(--emerald-deep)]"
            >
              FAQ
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className="py-1.5 hover:text-[var(--emerald-deep)]"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="py-1.5 hover:text-[var(--emerald-deep)]"
            >
              Contact Support
            </Link>
          </div>

          <div className="pt-3 border-t border-[var(--gray-border)] flex flex-col gap-2">
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="w-full py-2 text-center rounded-lg border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-text)]"
            >
              Login to DelaHR
            </Link>
            <Link
              href="/book-demo"
              onClick={() => setMobileOpen(false)}
              className="w-full py-2 text-center rounded-lg bg-[var(--emerald-deep)] text-white text-xs font-bold"
            >
              Book a Personalized Demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
