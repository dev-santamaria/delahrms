"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Globe2,
  Users,
  Clock,
  CalendarDays,
  Receipt,
  FileCheck2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Laptop,
  Coins,
  ChevronRight,
  TrendingUp,
  Award,
  Lock,
} from "lucide-react";

import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { ImageHeroSlider } from "@/components/landing/image-hero-slider";
import { InteractivePreview } from "@/components/landing/interactive-preview";
import { WorkflowDemo } from "@/components/landing/workflow-demo";
import { MobileAppPreview } from "@/components/landing/mobile-app-preview";
import { SurveyPreview } from "@/components/landing/survey-preview";

export default function Home() {
  // Active Hero Slide (0 = Core People & Global Payroll, 1 = 24/7 Shifts, 2 = Travel Advances, 3 = Digital E-Sign)
  const [heroSlide, setHeroSlide] = useState<number>(0);

  // Selected Region in the Global Multi-Jurisdiction Engine
  const [activeRegion, setActiveRegion] = useState<string>("africa_emerging");
  const [simulatorGross, setSimulatorGross] = useState<number>(7500);

  // Dynamic Content synchronized across all 4 Carousel slides
  const heroSlideData = [
    {
      badge: "DelaHR Unified Enterprise Operating System",
      icon: Sparkles,
      title: "The Global People & Payroll Operating System.",
      description:
        "Run global multi-currency payroll, 24/7 continuous industrial shifts, corporate holiday shutdowns, and instant travel advances in one elegant platform with zero calculation discrepancy.",
      metrics: [
        { value: "150+", label: "Currencies Handled" },
        { value: "0.00", label: "Cent Math Variance" },
        { value: "24/7", label: "Continuous Rosters" },
      ],
      primaryCta: { text: "Book a Personalized Demo", href: "/book-demo" },
      secondaryCta: { text: "Explore Solutions Suite", href: "/solutions" },
    },
    {
      badge: "Continuous Industrial Shift Intelligence",
      icon: Clock,
      title: "Zero Fatigue, Maximum Uptime for 24/7 Plants.",
      description:
        "Automate Continental 3-shift rotations, mining FIFO 14/14 rosters, and strict 12-hour mandatory rest guardrails that prevent worker fatigue, burnout, and costly operational accidents.",
      metrics: [
        { value: "12h", label: "Mandatory Rest Enforced" },
        { value: "+25%", label: "Night Shift Differential" },
        { value: "100%", label: "Roster Compliance" },
      ],
      primaryCta: { text: "Explore 24/7 Rosters", href: "/solutions#shifts" },
      secondaryCta: { text: "View Shift Safeguards", href: "/solutions" },
    },
    {
      badge: "Frictionless Travel & Field Cash Rails",
      icon: Receipt,
      title: "Instant Advances & Clearances Outside Payroll.",
      description:
        "Disburse pre-trip cash advances straight to employee mobile wallets or bank accounts within 60 seconds. Enforce scale-rate per diem allowances with zero receipt friction.",
      metrics: [
        { value: "< 60s", label: "Direct Wallet Disbursal" },
        { value: "Scale-Rate", label: "Zero-Receipt Per Diem" },
        { value: "1-Click", label: "Discrepancy Close" },
      ],
      primaryCta: { text: "See Expense Engine", href: "/solutions#claims" },
      secondaryCta: { text: "Calculate Scale Per Diem", href: "/solutions" },
    },
    {
      badge: "Tamper-Evident Digital Compliance",
      icon: FileCheck2,
      title: "Paperless Onboarding & Verified E-Signatures.",
      description:
        "Eliminate paper forms, physical signatures, and scanned PDFs. Employees submit bank modifications, travel requests, and contracts with cryptographic SHA-256 audit seals.",
      metrics: [
        { value: "24h", label: "Onboarding Turnaround" },
        { value: "SHA-256", label: "Cryptographic Audit Seal" },
        { value: "100%", label: "Paperless Governance" },
      ],
      primaryCta: { text: "Test Digital Forms", href: "/solutions#forms" },
      secondaryCta: { text: "Review Security Architecture", href: "/solutions" },
    },
  ];

  const currentHero = heroSlideData[heroSlide] || heroSlideData[0];
  const HeroIcon = currentHero.icon;

  // Global Jurisdictions Dataset (Worldwide Multi-Regional Scope)
  const globalRegions = [
    {
      id: "africa_emerging",
      name: "Africa & Emerging Markets",
      tag: "150+ Currencies & Real-Time Rails",
      taxRate: 0.22,
      healthRate: 0.0275,
      pensionRate: 0.06,
      employerRate: 0.06,
      taxName: "Statutory PAYE Income Tax",
      healthName: "Social Health Fund (SHIF / SHA)",
      pensionName: "Tier I & II National Pension",
      statutoryFiling: "Universal statutory income tax schedules, health insurance funds, and national pensions",
      fiscalValidation: "Electronic tax invoice validation with instant QR and control code clearance",
      disbursalRails: "Real-time Mobile Money wallets (M-Pesa, MTN MoMo, Airtel) and inter-bank PesaLink / EFT",
      shiftPolicy: "Continuous 3-shift industrial rotations and mining FIFO 14/14 hardship allowance rosters",
      perDiemPolicy: "Scale-rate allowance policy (zero receipt collection required for daily meals)",
    },
    {
      id: "emea_uk",
      name: "Europe, UK & Middle East",
      tag: "SEPA, BACS & Real-Time FPS",
      taxRate: 0.24,
      healthRate: 0.08,
      pensionRate: 0.05,
      employerRate: 0.138,
      taxName: "HMRC PAYE Withholding",
      healthName: "National Insurance Contribution",
      pensionName: "Workplace Pension Auto-Enrolment",
      statutoryFiling: "RTI PAYE schedules, National Insurance withholdings, Workplace Pension auto-enrolment",
      fiscalValidation: "Electronic VAT receipting and digital invoicing archiving",
      disbursalRails: "Automated SEPA Credit Transfer, BACS, Faster Payments, and CHAPS payout batches",
      shiftPolicy: "Working Time Directive 48h opt-out rules, flexible hybrid rosters, and continuous medical shifts",
      perDiemPolicy: "Standard international scale-rate subsistence allowances for meals and incidentals",
    },
    {
      id: "americas",
      name: "Americas & North America",
      tag: "ACH, Wire & Multi-State",
      taxRate: 0.21,
      healthRate: 0.0765,
      pensionRate: 0.04,
      employerRate: 0.0765,
      taxName: "Federal & State Tax Withholding",
      healthName: "FICA Social Security & Medicare",
      pensionName: "401(k) Pre-Tax Retirement",
      statutoryFiling: "Federal, State & Local income tax withholding schedules, FICA & 401(k) deductions",
      fiscalValidation: "W-2 and 1099-compliant digital receipt archives",
      disbursalRails: "Automated NACHA Direct Deposit ACH and Same-Day domestic wires",
      shiftPolicy: "FLSA overtime tracking (1.5x over 40 weekly hours) and flexible remote work contracts",
      perDiemPolicy: "Federal GSA scale-rate travel per diem standards with automatic lodging calculation",
    },
    {
      id: "asia_pacific",
      name: "Asia-Pacific & Oceania",
      tag: "Multi-Currency Cross-Border",
      taxRate: 0.18,
      healthRate: 0.04,
      pensionRate: 0.08,
      employerRate: 0.17,
      taxName: "Regional Income Withholding Tax",
      healthName: "MediShield & National Health",
      pensionName: "Central Provident Fund (CPF)",
      statutoryFiling: "Provident funds, social health levies, and regional withholding tax schedules",
      fiscalValidation: "Electronic clearance invoices and localized commercial tax documentation",
      disbursalRails: "Instant national fast-payment rails and cross-border SWIFT treasury settlement",
      shiftPolicy: "Manufacturing shift rotations, flexible tech rosters, and remote distributed teams",
      perDiemPolicy: "Regional scale-rate travel allowances for cross-border engineering assignments",
    },
  ];

  const currentRegionData =
    globalRegions.find((r) => r.id === activeRegion) || globalRegions[0];

  // Dynamic calculations for the statutory simulator
  const calculatedTax = simulatorGross * currentRegionData.taxRate;
  const calculatedHealth = simulatorGross * currentRegionData.healthRate;
  const calculatedPension = simulatorGross * currentRegionData.pensionRate;
  const calculatedDeductions = calculatedTax + calculatedHealth + calculatedPension;
  const calculatedNet = simulatorGross - calculatedDeductions;
  const calculatedEmployerCost = simulatorGross * currentRegionData.employerRate;

  return (
    <div className="min-h-screen bg-[var(--cool-gray)] text-[var(--gray-text)] font-sans antialiased flex flex-col selection:bg-[var(--emerald-light)] selection:text-[var(--emerald-deep)]">
      {/* Universal Enterprise Navbar */}
      <SiteHeader />

      <main className="flex-1 space-y-16 pb-20">
        {/* ================================================================= */}
        {/* HERO SECTION: SYNCHRONIZED AUTO-MOVING CAROUSEL & DYNAMIC COPY */}
        {/* ================================================================= */}
        <section className="pt-6 pb-12 bg-white border-b border-[var(--gray-border)]">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-6">
            
            {/* Slide Navigation Indicator Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { idx: 0, label: "01 Workforce & Global Payroll" },
                { idx: 1, label: "02 24/7 Shift Rosters" },
                { idx: 2, label: "03 Travel Advances & Per Diem" },
                { idx: 3, label: "04 Paperless E-Sign & Forms" },
              ].map((pill) => (
                <button
                  key={pill.idx}
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setHeroSlide(pill.idx)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                    heroSlide === pill.idx
                      ? "bg-[var(--emerald-deep)] text-white shadow-xs"
                      : "bg-[var(--cool-gray)] text-[var(--gray-muted)] hover:text-[var(--gray-text)] border border-[var(--gray-border)]"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Dynamically Synchronized Value Proposition & CTAs */}
              <div key={heroSlide} className="lg:col-span-6 space-y-6 animate-in fade-in-50 duration-300">
                {/* Dynamic Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-xs font-semibold text-[var(--emerald-deep)]">
                  <HeroIcon className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
                  <span>{currentHero.badge}</span>
                </div>

                {/* Dynamic Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--gray-text)] leading-[1.12]">
                  {currentHero.title}
                </h1>

                {/* Dynamic Subtitle */}
                <p className="text-sm sm:text-base text-[var(--gray-muted)] leading-relaxed max-w-xl">
                  {currentHero.description}
                </p>

                {/* Dynamic Key Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-1 border-y border-[var(--gray-border)] py-3">
                  {currentHero.metrics.map((m, i) => (
                    <div key={i}>
                      <p className="text-xl sm:text-2xl font-extrabold font-mono text-[var(--emerald-deep)]">
                        {m.value}
                      </p>
                      <p className="text-[11px] text-[var(--gray-muted)] font-medium">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    href={currentHero.primaryCta.href}
                    className="px-6 py-3 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
                  >
                    <span>{currentHero.primaryCta.text}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={currentHero.secondaryCta.href}
                    className="px-6 py-3 rounded-xl bg-white hover:bg-[var(--cool-gray)] text-[var(--gray-text)] text-xs font-bold border border-[var(--gray-border)] transition flex items-center gap-2"
                  >
                    <span>{currentHero.secondaryCta.text}</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Auto-Advancing Image Carousel Slider */}
              <div className="lg:col-span-6 w-full">
                <ImageHeroSlider currentSlide={heroSlide} onSlideChange={setHeroSlide} />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* INTERACTIVE DUMMY DASHBOARD SHOWCASE (LEAVE, CLAIMS, PAYROLL) */}
        {/* ================================================================= */}
        <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--gray-text)] tracking-tight">
                Designed for Everyday People & Operations Workflows
              </h2>
              <p className="text-xs sm:text-sm text-[var(--gray-muted)]">
                Experience the live interactive preview below for leave planning, expense advances, and payroll reconciliation.
              </p>
            </div>
            <Link
              href="/solutions"
              className="text-xs font-bold text-[var(--emerald-deep)] hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Explore all enterprise modules</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <InteractivePreview />
        </section>

        {/* ================================================================= */}
        {/* BODY FEATURE STORY 1: PEOPLE LEADERSHIP & EMPOWERMENT (land-img1.jpg) */}
        {/* ================================================================= */}
        <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Image Showcase with Floating Insight Badges */}
              <div className="lg:col-span-6 relative">
                <div className="relative h-72 sm:h-96 lg:h-[460px] w-full rounded-2xl overflow-hidden border border-[var(--gray-border)] shadow-md group">
                  <Image
                    src="/images/land-img1.jpg"
                    alt="People leadership and employee empowerment with DelaHR"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Floating Card 1 (Bottom Left) */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-[var(--gray-border)] shadow-lg space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--emerald-mint)]" />
                      <span className="text-xs font-bold text-[var(--gray-text)]">
                        98% Positive Employee eNPS
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--gray-muted)]">
                      Transparent benefits, instant pay advances, and honest feedback
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Text Content */}
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-xs font-semibold text-[var(--emerald-deep)]">
                  <Award className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
                  <span>People Culture & Leadership Experience</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--gray-text)] tracking-tight leading-tight">
                  Empower modern HR leaders with clarity, speed, and trust.
                </h2>

                <p className="text-xs sm:text-sm text-[var(--gray-muted)] leading-relaxed">
                  DelaHR removes the repetitive friction that exhausts people teams. Employees enjoy transparent self-service balances, fast travel advance approvals, and paperless digital onboarding, while HR directors get consolidated visibility across every team.
                </p>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[var(--emerald-mint)] mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-[var(--gray-text)]">100% Digital Onboarding in Under 24 Hours:</span>{" "}
                      <span className="text-[var(--gray-muted)]">
                        Automate contracts, bank details, emergency contacts, and tax disclosures.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[var(--emerald-mint)] mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-[var(--gray-text)]">Corporate Holiday Shutdowns:</span>{" "}
                      <span className="text-[var(--gray-muted)]">
                        Schedule year-end company closures with 1-click bulk leave debits.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[var(--emerald-mint)] mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-[var(--gray-text)]">Transparent Growth & Retention:</span>{" "}
                      <span className="text-[var(--gray-muted)]">
                        Track employee certifications, automated retraining, and internal career development.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/solutions#workforce"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[var(--emerald-deep)] hover:underline"
                  >
                    <span>Learn more about Core HR & People Leadership</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* INTERACTIVE WORKFLOW DEMONSTRATION (BANK ACCOUNT CHANGE) */}
        {/* ================================================================= */}
        <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <WorkflowDemo />
        </section>

        {/* ================================================================= */}
        {/* BODY FEATURE STORY 2: INDUSTRIAL CONTINUOUS SHIFTS & FIELD (land-img.jpg) */}
        {/* ================================================================= */}
        <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Text Content */}
              <div className="lg:col-span-6 space-y-5 order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-xs font-semibold text-[var(--emerald-deep)]">
                  <Clock className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
                  <span>Heavy Operations & Continuous Logistics</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--gray-text)] tracking-tight leading-tight">
                  Built for the harsh reality of 24/7 plants, mining, and field sites.
                </h2>

                <p className="text-xs sm:text-sm text-[var(--gray-muted)] leading-relaxed">
                  While standard software only caters to 9-to-5 office workers, DelaHR was purpose-built for round-the-clock operations. Configure Continental 3-shift rotations, mining FIFO rosters (14/14, 28/28), and mandatory 12-hour rest guardrails that prevent worker fatigue and costly accidents.
                </p>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[var(--emerald-mint)] mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-[var(--gray-text)]">Fatigue & Safety Rest Enforcement:</span>{" "}
                      <span className="text-[var(--gray-muted)]">
                        Intelligent algorithms block supervisor attempts to schedule back-to-back night shifts.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[var(--emerald-mint)] mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-[var(--gray-text)]">Automatic Shift Premiums & Hardship Allowances:</span>{" "}
                      <span className="text-[var(--gray-muted)]">
                        Night differentials (+25%) and remote site hardship bonuses automatically calculate into gross pay.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[var(--emerald-mint)] mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-[var(--gray-text)]">Instant Pre-Trip Field Cash Advances:</span>{" "}
                      <span className="text-[var(--gray-muted)]">
                        Disburse travel advance funds immediately to mobile money or bank accounts outside payroll.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/solutions#shifts"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[var(--emerald-deep)] hover:underline"
                  >
                    <span>Explore 24/7 Shift Rosters & Mining Solutions</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Image Showcase with Floating Badges */}
              <div className="lg:col-span-6 relative order-1 lg:order-2">
                <div className="relative h-72 sm:h-96 lg:h-[460px] w-full rounded-2xl overflow-hidden border border-[var(--gray-border)] shadow-md group">
                  <Image
                    src="/images/land-img.jpg"
                    alt="Industrial operations, 24/7 continuous shift scheduling and mining field management"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Floating Card 2 (Bottom Right) */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:right-6 sm:left-auto bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-[var(--gray-border)] shadow-lg space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--emerald-mint)]" />
                      <span className="text-xs font-bold text-[var(--gray-text)]">
                        Continuous 24/7 Rostering Active
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--gray-muted)]">
                      12h mandatory rest verified • Remote site hardship active
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* EMPLOYEE SELF-SERVICE MOBILE EXPERIENCE SHOWCASE */}
        {/* ================================================================= */}
        <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs">
            <MobileAppPreview />
          </div>
        </section>

        {/* ================================================================= */}
        {/* CONTINUOUS WORKFORCE INTELLIGENCE & PULSE SURVEYS */}
        {/* ================================================================= */}
        <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <SurveyPreview />
        </section>

        {/* ================================================================= */}
        {/* TRULY GLOBAL MULTI-JURISDICTION COMPLIANCE & STATUTORY SIMULATOR */}
        {/* ================================================================= */}
        <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--emerald-mint)]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--emerald-deep)]">
                  Live Statutory & Clearance Simulator
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--gray-text)] tracking-tight">
                Global Multi-Jurisdiction Statutory Engine
              </h2>
              <p className="text-xs sm:text-sm text-[var(--gray-muted)]">
                Select an operational economic corridor and adjust the gross salary slider to see how DelaHR automates withholdings, tax filings, and banking rails in real time.
              </p>
            </div>
            <span className="text-xs font-semibold text-[var(--emerald-deep)] bg-[var(--emerald-light)] border border-[var(--emerald-border)] px-3 py-1.5 rounded-full self-start sm:self-auto font-mono">
              150+ Currencies • 0.00 Cent Discrepancy
            </span>
          </div>

          {/* Region Selector Pills */}
          <div className="flex space-x-2 overflow-x-auto pb-1">
            {globalRegions.map((region) => {
              const isActive = activeRegion === region.id;
              return (
                <button
                  key={region.id}
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setActiveRegion(region.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    isActive
                      ? "bg-[var(--emerald-deep)] text-white shadow-xs"
                      : "bg-white text-[var(--gray-muted)] hover:text-[var(--gray-text)] border border-[var(--gray-border)]"
                  }`}
                >
                  <Globe2 className="h-3.5 w-3.5" />
                  <span>{region.name}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Simulator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Interactive Gross-to-Net Calculator */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--gray-muted)]">
                    Interactive Monthly Gross Pay
                  </span>
                  <p className="text-2xl font-extrabold font-mono text-[var(--gray-text)]">
                    ${simulatorGross.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[var(--emerald-deep)]">
                    Net Take-Home Pay
                  </span>
                  <p className="text-2xl font-extrabold font-mono text-[var(--emerald-deep)]">
                    ${calculatedNet.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Slider Control */}
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] text-[var(--gray-muted)] font-mono">
                  <span>Min: $2,500</span>
                  <span className="font-bold text-[var(--emerald-deep)]">Drag to simulate compensation</span>
                  <span>Max: $20,000</span>
                </div>
                <input
                  type="range"
                  min={2500}
                  max={20000}
                  step={250}
                  value={simulatorGross}
                  onChange={(e) => setSimulatorGross(Number(e.target.value))}
                  className="w-full accent-[var(--emerald-deep)] cursor-pointer"
                />
              </div>

              {/* Itemized Statutory Breakdown */}
              <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--gray-border)] text-[10px] font-bold uppercase text-[var(--gray-muted)]">
                  <span>Statutory Item ({currentRegionData.name})</span>
                  <span className="font-mono">Calculated Deduction</span>
                </div>

                <div className="flex justify-between items-center text-rose-600 font-mono">
                  <span className="font-sans text-[var(--gray-text)]">{currentRegionData.taxName}:</span>
                  <span>-${calculatedTax.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between items-center text-rose-600 font-mono">
                  <span className="font-sans text-[var(--gray-text)]">{currentRegionData.healthName}:</span>
                  <span>-${calculatedHealth.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between items-center text-rose-600 font-mono">
                  <span className="font-sans text-[var(--gray-text)]">{currentRegionData.pensionName}:</span>
                  <span>-${calculatedPension.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="pt-2 border-t border-[var(--gray-border)] flex justify-between items-center text-zinc-600 font-mono">
                  <span className="font-sans text-[var(--gray-muted)]">Employer Statutory On-Cost:</span>
                  <span>+${calculatedEmployerCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[var(--emerald-deep)] font-semibold pt-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[var(--emerald-mint)]" />
                  <span>0.00 Cent Variance Guarantee</span>
                </span>
                <span className="font-mono">Tiered Rules Verified</span>
              </div>
            </div>

            {/* Right: Automated Compliance & Clearance Pipeline */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-5 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--gray-muted)]">
                  Automated Clearance Pipeline
                </span>
                <h3 className="text-base font-bold text-[var(--gray-text)]">
                  How DelaHR Processes {currentRegionData.name}
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Pipeline Step 1 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--cool-gray)] border border-[var(--gray-border)]">
                  <div className="h-6 w-6 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-bold font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-[var(--gray-text)]">Declarative Statutory Engine</p>
                    <p className="text-[11px] text-[var(--gray-muted)] leading-snug mt-0.5">
                      {currentRegionData.statutoryFiling}
                    </p>
                  </div>
                </div>

                {/* Pipeline Step 2 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--cool-gray)] border border-[var(--gray-border)]">
                  <div className="h-6 w-6 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-bold font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-[var(--gray-text)]">Fiscal Invoice & QR Clearance</p>
                    <p className="text-[11px] text-[var(--gray-muted)] leading-snug mt-0.5">
                      {currentRegionData.fiscalValidation}
                    </p>
                  </div>
                </div>

                {/* Pipeline Step 3 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--cool-gray)] border border-[var(--gray-border)]">
                  <div className="h-6 w-6 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-bold font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-[var(--gray-text)]">Automated Disbursal Rails</p>
                    <p className="text-[11px] text-[var(--gray-muted)] leading-snug mt-0.5">
                      {currentRegionData.disbursalRails}
                    </p>
                  </div>
                </div>

                {/* Pipeline Step 4 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--cool-gray)] border border-[var(--gray-border)]">
                  <div className="h-6 w-6 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-bold font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <p className="font-bold text-[var(--gray-text)]">Scale-Rate Per Diem & Return Schedules</p>
                    <p className="text-[11px] text-[var(--gray-muted)] leading-snug mt-0.5">
                      {currentRegionData.perDiemPolicy}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--gray-border)] flex items-center justify-between text-xs">
                <span className="text-[var(--gray-muted)]">Need custom tax presets for another country?</span>
                <Link
                  href="/contact"
                  className="font-bold text-[var(--emerald-deep)] hover:underline flex items-center gap-1"
                >
                  <span>Request Jurisdiction Preset</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* CORE PLATFORM PILLARS GRID */}
        {/* ================================================================= */}
        <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--gray-text)] tracking-tight">
              Enterprise Features Built for Growth & Productivity
            </h2>
            <p className="text-xs sm:text-sm text-[var(--gray-muted)]">
              Engineered for continuous operations, financial reconciliation, and employee satisfaction
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-[var(--emerald-light)] text-[var(--emerald-deep)] flex items-center justify-center">
                    <Coins className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--gray-text)]">
                    Accurate Multi-Currency Payroll
                  </h3>
                </div>
                <p className="text-xs text-[var(--gray-muted)] leading-relaxed">
                  Automated gross-to-net payroll runs with localized statutory deductions, voluntary benefits, and instant payslip generation with zero math discrepancies.
                </p>
              </div>
              <div className="pt-3 border-t border-[var(--gray-border)] text-[11px] font-mono text-[var(--emerald-deep)] font-bold flex items-center justify-between">
                <span>Calculation Discrepancy:</span>
                <span>0.00 Cent Precision</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-[var(--emerald-light)] text-[var(--emerald-deep)] flex items-center justify-center">
                    <Clock className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--gray-text)]">
                    24/7 Shift Rosters & Rest Safety
                  </h3>
                </div>
                <p className="text-xs text-[var(--gray-muted)] leading-relaxed">
                  Continental 3-shift continuous rotations and mining FIFO schedules with automatic 12-hour rest enforcement to prevent worker fatigue and overtime violations.
                </p>
              </div>
              <div className="pt-3 border-t border-[var(--gray-border)] text-[11px] font-mono text-[var(--emerald-deep)] font-bold flex items-center justify-between">
                <span>Fatigue Guardrail:</span>
                <span>12h Rest Guaranteed</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-[var(--emerald-light)] text-[var(--emerald-deep)] flex items-center justify-center">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--gray-text)]">
                    Travel Advances & Scale-Rate Per Diem
                  </h3>
                </div>
                <p className="text-xs text-[var(--gray-muted)] leading-relaxed">
                  Pre-trip cash advances disbursed directly to mobile money or bank accounts outside payroll. Automatic settlement variance calculation upon return.
                </p>
              </div>
              <div className="pt-3 border-t border-[var(--gray-border)] text-[11px] font-mono text-[var(--emerald-deep)] font-bold flex items-center justify-between">
                <span>Disbursal Route:</span>
                <span>Direct Instant Mobile/Bank</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-[var(--emerald-light)] text-[var(--emerald-deep)] flex items-center justify-center">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--gray-text)]">
                    Corporate Shutdowns & Leave Ledger
                  </h3>
                </div>
                <p className="text-xs text-[var(--gray-muted)] leading-relaxed">
                  1-Click automated bulk debit for corporate Christmas and year-end closures. Formal advance carryover approvals and transparent self-service balances.
                </p>
              </div>
              <div className="pt-3 border-t border-[var(--gray-border)] text-[11px] font-mono text-[var(--emerald-deep)] font-bold flex items-center justify-between">
                <span>Company Shutdown:</span>
                <span>1-Click Bulk Debit</span>
              </div>
            </div>

            {/* Pillar 5 */}
            <div className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-[var(--emerald-light)] text-[var(--emerald-deep)] flex items-center justify-center">
                    <FileCheck2 className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--gray-text)]">
                    Paperless Forms & E-Signatures
                  </h3>
                </div>
                <p className="text-xs text-[var(--gray-muted)] leading-relaxed">
                  Eliminate printed paper and manual scans. Drag-and-drop form schemas with verified digital signatures and tamper-evident cryptographic audit seals.
                </p>
              </div>
              <div className="pt-3 border-t border-[var(--gray-border)] text-[11px] font-mono text-[var(--emerald-deep)] font-bold flex items-center justify-between">
                <span>Audit Trail:</span>
                <span>Tamper-Evident Sealed</span>
              </div>
            </div>

            {/* Pillar 6 */}
            <div className="p-6 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-[var(--emerald-light)] text-[var(--emerald-deep)] flex items-center justify-center">
                    <Laptop className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--gray-text)]">
                    Workforce IT Fleet & Device Logistics
                  </h3>
                </div>
                <p className="text-xs text-[var(--gray-muted)] leading-relaxed">
                  Laptop and equipment procurement, device disk encryption telemetry, automated software access on hire, and remote access revocation on exit.
                </p>
              </div>
              <div className="pt-3 border-t border-[var(--gray-border)] text-[11px] font-mono text-[var(--emerald-deep)] font-bold flex items-center justify-between">
                <span>Device Compliance:</span>
                <span>Encrypted & Verified</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* CLOSING HIGH-IMPACT CTA */}
        {/* ================================================================= */}
        <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[var(--gray-border)] shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--emerald-mint)]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--emerald-deep)]">
                  Take the Next Step
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--gray-text)]">
                Ready to simplify your global people and payroll operations?
              </h3>
              <p className="text-xs sm:text-sm text-[var(--gray-muted)] leading-relaxed">
                Join forward-thinking enterprises worldwide who trust DelaHR to streamline complex operations, keep workers safe, and ensure accurate payouts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/book-demo"
                className="px-7 py-3.5 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
              >
                <span>Book a Live Demo</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-[var(--cool-gray)] text-[var(--gray-text)] text-xs font-bold border border-[var(--gray-border)] transition"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Universal Footer */}
      <SiteFooter />
    </div>
  );
}
