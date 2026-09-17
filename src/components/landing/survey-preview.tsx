"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Smile,
  Meh,
  Frown,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  Send,
  Users,
} from "lucide-react";

export function SurveyPreview() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [enpsScore, setEnpsScore] = useState<number>(9);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([
    "Fair Shift Rosters",
    "Transparent Pay",
  ]);
  const [restRating, setRestRating] = useState<string>("consistently_rested");
  const [submitted, setSubmitted] = useState(false);

  // Toggle drivers
  const toggleDriver = (driver: string) => {
    if (selectedDrivers.includes(driver)) {
      setSelectedDrivers(selectedDrivers.filter((d) => d !== driver));
    } else {
      setSelectedDrivers([...selectedDrivers, driver]);
    }
  };

  // Live dynamic sentiment stats
  const promoterCount = enpsScore >= 9 ? 74 : enpsScore >= 7 ? 62 : 45;
  const passiveCount = enpsScore >= 7 && enpsScore < 9 ? 28 : 18;
  const detractorCount = 100 - promoterCount - passiveCount;
  const computedNps = promoterCount - detractorCount;

  return (
    <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--gray-border)] pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--emerald-mint)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--emerald-deep)]">
              Continuous Workforce Voice & Intelligence
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--gray-text)] tracking-tight">
            Employee Engagement & Authentic eNPS Surveys
          </h3>
          <p className="text-xs sm:text-sm text-[var(--gray-muted)]">
            Empower teams with 100% anonymous pulses that highlight shift fatigue and employee sentiment in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-xs font-bold text-[var(--emerald-deep)] shrink-0 self-start sm:self-auto">
          <Lock className="h-3.5 w-3.5" />
          <span>Zero-Knowledge Cryptographic Anonymity</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Multi-Step Questionnaire */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-2xl border border-[var(--gray-border)] bg-[var(--cool-gray)] space-y-5">
            {/* Step & Progress Bar */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--emerald-deep)]">
                Q3 Enterprise Pulse • Shift Crew 4
              </span>
              <span className="font-mono text-[var(--gray-muted)] font-semibold">
                Step {currentStep} of 3
              </span>
            </div>

            <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[var(--emerald-deep)] h-full transition-all duration-500"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>

            {/* STEP 1: eNPS & Key Drivers */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[var(--gray-text)]">
                    1. How likely are you to recommend DelaHR and your operational team as a great place to work?
                  </h4>
                  <p className="text-xs text-[var(--gray-muted)]">
                    Select a rating from 1 (Detractor) to 10 (World-Class Promoter).
                  </p>
                </div>

                {/* 1-10 Buttons */}
                <div className="grid grid-cols-10 gap-1 sm:gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                    const isSelected = enpsScore === score;
                    return (
                      <button
                        key={score}
                        type="button"
                        suppressHydrationWarning
                        onClick={() => setEnpsScore(score)}
                        className={`h-10 rounded-xl font-bold font-mono text-xs transition-all ${
                          isSelected
                            ? "bg-[var(--emerald-deep)] text-white shadow-md scale-105"
                            : "bg-white text-[var(--gray-text)] border border-[var(--gray-border)] hover:border-[var(--emerald-mint)]"
                        }`}
                      >
                        {score}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[10px] text-[var(--gray-muted)] font-semibold px-1">
                  <span>1 - Extremely Unlikely</span>
                  <span>10 - Extremely Likely</span>
                </div>

                {/* Driver Tags */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-[var(--gray-text)]">
                    What primarily drives your rating? (Select all that apply)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Fair Shift Rosters",
                      "Transparent Pay",
                      "Mental Health & Rest",
                      "Leadership Clarity",
                      "Modern Tooling",
                      "Fast Expense Payouts",
                    ].map((driver) => {
                      const active = selectedDrivers.includes(driver);
                      return (
                        <button
                          key={driver}
                          type="button"
                          suppressHydrationWarning
                          onClick={() => toggleDriver(driver)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                            active
                              ? "bg-[var(--emerald-deep)] text-white shadow-xs"
                              : "bg-white text-[var(--gray-muted)] border border-[var(--gray-border)] hover:text-[var(--gray-text)]"
                          }`}
                        >
                          {active && <Check className="h-3 w-3" />}
                          <span>{driver}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <span>Next: Shift Safety</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Shift Rest & Operational Safety */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[var(--gray-text)]">
                    2. How consistently are the 12-hour mandatory rest guardrails observed on your rotation?
                  </h4>
                  <p className="text-xs text-[var(--gray-muted)]">
                    We enforce strict anti-fatigue safeguards across all 24/7 operating schedules.
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  {[
                    {
                      id: "consistently_rested",
                      title: "Fully Observed & Well Rested",
                      desc: "I always receive 12+ consecutive hours between shifts without emergency call-backs.",
                    },
                    {
                      id: "minor_fatigue",
                      title: "Generally Observed (Occasional Overtime)",
                      desc: "Rest periods are respected, but night-to-day turnarounds can occasionally feel tight.",
                    },
                    {
                      id: "fatigue_alert",
                      title: "Needs Improvement / Fatigue Risk",
                      desc: "Back-to-back shifts or last-minute shift changes have caused fatigue on my crew.",
                    },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setRestRating(option.id)}
                      className={`w-full p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                        restRating === option.id
                          ? "bg-[var(--emerald-light)] border-[var(--emerald-border)] shadow-xs"
                          : "bg-white border-[var(--gray-border)] hover:border-zinc-300"
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                          restRating === option.id
                            ? "border-[var(--emerald-deep)] bg-[var(--emerald-deep)] text-white"
                            : "border-zinc-300 bg-white"
                        }`}
                      >
                        {restRating === option.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--gray-text)]">{option.title}</p>
                        <p className="text-[11px] text-[var(--gray-muted)] leading-snug mt-0.5">
                          {option.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3">
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 rounded-xl bg-white border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-text)] hover:bg-gray-100 transition flex items-center gap-1.5"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <span>Next: Open Voice</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Actionable Employee Voice & Submission */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[var(--gray-text)]">
                    3. What can HR Operations and plant leadership do to make your work better?
                  </h4>
                  <p className="text-xs text-[var(--gray-muted)]">
                    Your response is detached from user IDs and stored with zero metadata.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[var(--gray-border)] space-y-2">
                  <textarea
                    rows={3}
                    defaultValue="The new mobile receipt scanner and instant advances have saved our field team hours of manual paperwork. Keep shift rotations predictable."
                    className="w-full text-xs text-[var(--gray-text)] border-0 focus:outline-none resize-none bg-transparent"
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--gray-border)] text-[10px] text-[var(--emerald-deep)] font-semibold">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Zero-Knowledge Identity Vault</span>
                    </span>
                    <span className="font-mono">Anonymity: 100%</span>
                  </div>
                </div>

                {submitted ? (
                  <div className="p-4 rounded-xl bg-[var(--emerald-light)] border border-[var(--emerald-border)] text-center space-y-1.5">
                    <p className="font-bold text-xs text-[var(--emerald-deep)] flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-[var(--emerald-mint)]" />
                      <span>Thank You! Anonymous Feedback Recorded</span>
                    </p>
                    <p className="text-[11px] text-[var(--emerald-deep)]">
                      Your response has been aggregated into live operational dashboards.
                    </p>
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => {
                        setSubmitted(false);
                        setCurrentStep(1);
                      }}
                      className="mt-2 text-[10px] text-[var(--emerald-deep)] underline font-bold"
                    >
                      Reset Questionnaire
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-3">
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 rounded-xl bg-white border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-text)] hover:bg-gray-100 transition flex items-center gap-1.5"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setSubmitted(true)}
                      className="px-6 py-2.5 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit Anonymous Response</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Aggregated Executive Analytics Cockpit */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--gray-text)]">Live Executive Pulse Cockpit</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-bold">
                Live Dynamic Feed
              </span>
            </div>

            {/* Score Metric Card */}
            <div className="p-4 rounded-xl bg-white border border-[var(--gray-border)] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--gray-muted)]">
                Net Promoter Score (eNPS)
              </span>
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-extrabold font-mono text-[var(--emerald-deep)]">
                  +{computedNps}
                </p>
                <span className="text-xs font-bold text-[var(--emerald-deep)] bg-[var(--emerald-light)] px-2 py-0.5 rounded">
                  Top 5% Global Benchmark
                </span>
              </div>
              <p className="text-[11px] text-[var(--gray-muted)]">
                Calculated from 1,240 responses across all regional subsidiaries.
              </p>
            </div>

            {/* Sentiment Breakdown Bars */}
            <div className="p-4 rounded-xl bg-white border border-[var(--gray-border)] space-y-3">
              <span className="text-[10px] uppercase font-bold text-[var(--gray-muted)]">
                Sentiment Distribution
              </span>

              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-[var(--emerald-deep)]">Promoters (Score 9-10)</span>
                    <span className="font-mono font-bold">{promoterCount}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[var(--emerald-mint)] h-full transition-all duration-500"
                      style={{ width: `${promoterCount}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-amber-700">Passives (Score 7-8)</span>
                    <span className="font-mono font-bold">{passiveCount}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full transition-all duration-500"
                      style={{ width: `${passiveCount}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-rose-600">Detractors (Score 1-6)</span>
                    <span className="font-mono font-bold">{detractorCount}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-400 h-full transition-all duration-500"
                      style={{ width: `${detractorCount}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Drivers Breakdown */}
            <div className="p-4 rounded-xl bg-white border border-[var(--gray-border)] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[var(--gray-muted)]">
                Top Correlated Employee Drivers
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedDrivers.map((driver) => (
                  <span
                    key={driver}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-semibold border border-[var(--emerald-border)]"
                  >
                    {driver}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
