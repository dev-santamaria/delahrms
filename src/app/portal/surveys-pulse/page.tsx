"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Smile,
  Meh,
  Frown,
  Users,
  CheckCircle2,
  BarChart3,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Shield,
  Search,
  Filter,
  ArrowUpRight,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";

interface PulseSurvey {
  id: string;
  title: string;
  category: "Shift Well-Being" | "Workplace Culture" | "Expat Integration" | "Tools & Fleet";
  responseRate: number;
  totalResponses: number;
  targetAudience: string;
  enpsScore: number;
  status: "Live & Collecting" | "Scheduled" | "Closed & Analyzed";
  deadline: string;
  topTopics: { text: string; sentiment: "positive" | "neutral" | "negative" }[];
}

export default function SurveysPulsePortalPage() {
  const { entityInfo, personaInfo } = usePortal();
  const [activeTab, setActiveTab] = useState<"analytics" | "campaigns" | "participate">("analytics");
  const [selectedRating, setSelectedRating] = useState<number | null>(9);
  const [feedbackText, setFeedbackText] = useState("");
  const [submittedFeedback, setSubmittedFeedback] = useState(false);

  const mockSurveys: PulseSurvey[] = [
    {
      id: "SURV-2026-Q3",
      title: "24/7 Shift Fatigue & Industrial Well-being Pulse",
      category: "Shift Well-Being",
      responseRate: 88.4,
      totalResponses: 1255,
      targetAudience: "All Industrial & Plant Shift Workers",
      enpsScore: 52,
      status: "Live & Collecting",
      deadline: "Sep 30, 2026",
      topTopics: [
        { text: "12h Mandatory Rest Intervals", sentiment: "positive" },
        { text: "Night Shift Meal Subsidy", sentiment: "positive" },
        { text: "Shift Swap Approval Speed", sentiment: "neutral" },
      ],
    },
    {
      id: "SURV-2026-EXP",
      title: "Global Mobility & Expatriate Relocation Experience",
      category: "Expat Integration",
      responseRate: 94.2,
      totalResponses: 48,
      targetAudience: "Cross-Border Expatriates & Dependents",
      enpsScore: 68,
      status: "Live & Collecting",
      deadline: "Oct 15, 2026",
      topTopics: [
        { text: "Class G Visa Expedited Processing", sentiment: "positive" },
        { text: "Schooling Tuition Direct Disbursal", sentiment: "positive" },
        { text: "Local Banking Account Setup", sentiment: "neutral" },
      ],
    },
    {
      id: "SURV-2026-IT",
      title: "Hardware Fleet & Digital Workplace Tools Satisfaction",
      category: "Tools & Fleet",
      responseRate: 76.0,
      totalResponses: 1080,
      targetAudience: "All Global Staff",
      enpsScore: 44,
      status: "Closed & Analyzed",
      deadline: "Aug 31, 2026",
      topTopics: [
        { text: "M3 Max Laptop Performance", sentiment: "positive" },
        { text: "Instant Travel Advance Processing", sentiment: "positive" },
        { text: "Offboarding Hardware Recovery Courier", sentiment: "negative" },
      ],
    },
  ];

  const handleSendFeedback = () => {
    setSubmittedFeedback(true);
    setTimeout(() => {
      setSubmittedFeedback(false);
      setFeedbackText("");
      setSelectedRating(9);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[var(--emerald-deep)]" />
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--gray-text)]">
              Pulse Surveys &amp; Employee Net Promoter (eNPS)
            </h1>
          </div>
          <p className="text-xs text-[var(--gray-muted)] mt-0.5">
            Real-time organizational sentiment, anonymous feedback channels, and continuous shift team morale tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab("participate")}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border bg-white text-[var(--gray-text)] border-[var(--gray-border)] hover:bg-[var(--cool-gray)] shadow-2xs"
          >
            <MessageSquare className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
            <span>ESS Pulse Check</span>
          </button>
          <button
            type="button"
            suppressHydrationWarning
            className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Launch Anonymous Pulse</span>
          </button>
        </div>
      </div>

      {/* eNPS Gauge & High-Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">
              Global eNPS Score
            </span>
            <span className="p-1 rounded-full bg-emerald-100 text-[var(--emerald-deep)]">
              <Smile className="h-4 w-4 text-[var(--emerald-mint)]" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[var(--emerald-deep)] font-mono">
              +54
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
              Top Quartile
            </span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)]">
            Promoters (68%) • Passives (18%) • Detractors (14%)
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">
              Active Participation
            </span>
            <span className="p-1 rounded-full bg-blue-100 text-blue-700">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[var(--gray-text)] font-mono">
              88.4%
            </span>
            <span className="text-xs font-semibold text-blue-700">1,383 Responses</span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)]">Across 7 operating jurisdictions</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">
              Shift Team Morale
            </span>
            <span className="p-1 rounded-full bg-purple-100 text-purple-700">
              <BarChart3 className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-purple-700 font-mono">
              4.6 / 5.0
            </span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)]">
            Fatigue guard praised by 94% of plant crew
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">
              Anonymity Seal
            </span>
            <span className="p-1 rounded-full bg-emerald-50 text-[var(--emerald-deep)]">
              <Shield className="h-4 w-4 text-[var(--emerald-mint)]" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-[var(--emerald-deep)]">
              K-Anonymity (k=5)
            </span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)]">
            Individual responses mathematically blinded
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--gray-border)] pb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "analytics"
                  ? "bg-[var(--emerald-deep)] text-white shadow-xs"
                  : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
              }`}
            >
              Campaigns &amp; Sentiment Analytics
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveTab("participate")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "participate"
                  ? "bg-[var(--emerald-deep)] text-white shadow-xs"
                  : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
              }`}
            >
              <Smile className="h-3.5 w-3.5" />
              <span>Employee Pulse Check Simulator</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Sentiment & Campaign Analytics */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {mockSurveys.map((survey) => (
                <div
                  key={survey.id}
                  className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[var(--emerald-deep)] border border-emerald-200">
                        {survey.category}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        eNPS +{survey.enpsScore}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[var(--gray-text)]">{survey.title}</h3>
                    <p className="text-xs text-[var(--gray-muted)]">{survey.targetAudience}</p>

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-[var(--gray-muted)]">
                        <span>Response Rate</span>
                        <span className="font-mono text-[var(--gray-text)] font-bold">
                          {survey.responseRate}% ({survey.totalResponses} staff)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--emerald-deep)] rounded-full"
                          style={{ width: `${survey.responseRate}%` }}
                        />
                      </div>
                    </div>

                    {/* AI Sentiment Extraction */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)] flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-[var(--emerald-mint)]" />
                        <span>Key Sentiment Topics</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {survey.topTopics.map((topic, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                              topic.sentiment === "positive"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : topic.sentiment === "negative"
                                ? "bg-rose-50 text-rose-800 border-rose-200"
                                : "bg-gray-100 text-gray-700 border-gray-200"
                            }`}
                          >
                            {topic.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--gray-border)] flex items-center justify-between text-xs">
                    <span className="text-[var(--gray-muted)]">Closes: {survey.deadline}</span>
                    <button
                      type="button"
                      suppressHydrationWarning
                      className="font-bold text-[var(--emerald-deep)] hover:underline flex items-center gap-1"
                    >
                      <span>Deep Dive</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Participate Simulator */}
        {activeTab === "participate" && (
          <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs max-w-2xl mx-auto space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Smile className="h-5 w-5 text-[var(--emerald-deep)]" />
                <h3 className="text-lg font-bold text-[var(--gray-text)]">
                  Employee Anonymous Sentiment Check
                </h3>
              </div>
              <p className="text-xs text-[var(--gray-muted)] mt-1">
                Your feedback is cryptographically anonymized. Line managers and HR only see aggregate group trends (k &gt;= 5).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-5">
              <div>
                <label className="text-xs font-bold text-[var(--gray-text)] block mb-2">
                  How likely are you to recommend DelaHR as a great place to work to a colleague? (0 = Not likely, 10 = Extremely likely)
                </label>

                <div className="grid grid-cols-11 gap-1 sm:gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setSelectedRating(num)}
                      className={`h-10 rounded-xl font-bold font-mono text-xs transition-all ${
                        selectedRating === num
                          ? "bg-[var(--emerald-deep)] text-white scale-105 shadow-xs"
                          : "bg-white text-[var(--gray-text)] border border-[var(--gray-border)] hover:bg-gray-50"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between text-[10px] text-[var(--gray-muted)] mt-1.5 px-1 font-semibold">
                  <span>0 — Detractor</span>
                  <span>7-8 — Passive</span>
                  <span>9-10 — Promoter</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--gray-text)] block mb-1">
                  What is the primary factor behind your rating today? (Optional &amp; Anonymized)
                </label>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="e.g. Love the new 12h rest interval safeguard for FIFO shifts, makes recovery much easier!"
                  className="w-full p-3 rounded-xl border border-[var(--gray-border)] text-xs text-[var(--gray-text)] bg-white focus:outline-none focus:border-[var(--emerald-deep)]"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-900 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <Shield className="h-4 w-4 text-[var(--emerald-deep)] shrink-0" />
                <span>
                  Protected by DelaHR Zero-Knowledge Anonymous Anonymizer. Zero employee metadata sent with response.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setActiveTab("analytics")}
                className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-text)] hover:bg-gray-50 transition"
              >
                Back to Analytics
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={handleSendFeedback}
                className="px-5 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span>{submittedFeedback ? "Response Anonymously Recorded!" : "Submit Pulse Response"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
