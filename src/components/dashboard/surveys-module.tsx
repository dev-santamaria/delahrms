"use client";

import React, { useState } from "react";
import {
  MessageSquareHeart,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Users,
  Star,
  Send,
  Lock,
  Plus,
  BarChart3,
  Calendar,
} from "lucide-react";

interface SurveyCampaign {
  id: string;
  title: string;
  surveyType: string;
  description: string;
  isAnonymous: boolean;
  totalTarget: number;
  responseCount: number;
  enpsScore: number;
  averageRating: number;
  status: "active" | "closed";
  endDate: string;
}

export function SurveysModule() {
  const [campaigns, setBatches] = useState<SurveyCampaign[]>([
    {
      id: "srv-001",
      title: "Q3 2026 Workforce Engagement & eNPS Pulse",
      surveyType: "eNPS Pulse",
      description: "Confidential quarterly sentiment tracking workplace satisfaction and leadership trust",
      isAnonymous: true,
      totalTarget: 50,
      responseCount: 38,
      enpsScore: 68,
      averageRating: 4.75,
      status: "active",
      endDate: "Oct 15, 2026",
    },
    {
      id: "srv-002",
      title: "30-Day New Hire Onboarding Experience Survey",
      surveyType: "Onboarding Pulse",
      description: "Anonymous feedback on recruitment, hardware arrival, and team orientation",
      isAnonymous: true,
      totalTarget: 15,
      responseCount: 12,
      enpsScore: 75,
      averageRating: 4.85,
      status: "active",
      endDate: "Dec 31, 2026",
    },
  ]);

  // Interactive Survey Taking State
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyCampaign | null>(null);
  const [npsScore, setNpsScore] = useState<number>(9);
  const [likertScore, setLikertScore] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmitSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      if (selectedSurvey) {
        setBatches((prev) =>
          prev.map((c) =>
            c.id === selectedSurvey.id
              ? { ...c, responseCount: c.responseCount + 1 }
              : c
          )
        );
      }
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setSelectedSurvey(null);
        setFeedbackText("");
      }, 1500);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareHeart className="h-5 w-5 text-rose-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Workforce Surveys, Culture Pulses & eNPS Analytics
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
              100% Anonymous & Encrypted
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Create and track employee Net Promoter Score (eNPS), onboarding feedback, and culture climate surveys with verified psychological safety
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="text-xs text-zinc-400">Global eNPS Score:</span>
            <span className="text-sm font-black text-emerald-400 font-mono">+68</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">(World Class)</span>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map((camp) => {
          const participationRate = Math.round((camp.responseCount / camp.totalTarget) * 100);
          return (
            <div
              key={camp.id}
              className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    {camp.surveyType}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                    <Lock className="h-3 w-3 text-emerald-400" />
                    Anonymous Responses
                  </span>
                </div>

                <h3 className="font-bold text-white text-base mt-2">{camp.title}</h3>
                <p className="text-xs text-zinc-400 mt-1">{camp.description}</p>
              </div>

              {/* Progress & Metrics */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-zinc-400">Response Participation Rate:</span>
                  <span className="font-mono text-zinc-200">
                    {camp.responseCount} of {camp.totalTarget} ({participationRate}%)
                  </span>
                </div>

                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${participationRate}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 block text-[10px] uppercase">Campaign eNPS</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">+{camp.enpsScore}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 block text-[10px] uppercase">Average Satisfaction</span>
                    <span className="text-base font-bold text-amber-400 font-mono">{camp.averageRating} / 5.0</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-zinc-500 text-[11px] flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Closes on: {camp.endDate}
                </span>

                <button
                  onClick={() => setSelectedSurvey(camp)}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                >
                  <Send className="h-3 w-3" />
                  <span>Take Survey</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Survey Taking Modal */}
      {selectedSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 space-y-5">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <Lock className="h-3.5 w-3.5" />
                <span>Strictly Confidential & Anonymous • No User Tracking</span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight mt-1">{selectedSurvey.title}</h3>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                <p className="font-bold text-white text-sm">Response Recorded Anonymously!</p>
                <p className="text-xs text-zinc-400">Thank you for contributing to our workforce culture.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitSurvey} className="space-y-4 text-xs">
                {/* Question 1: eNPS Rating (0-10) */}
                <div className="space-y-2">
                  <label className="block text-zinc-200 font-semibold">
                    1. On a scale of 0 to 10, how likely are you to recommend Mandela Group as a great place to work?
                  </label>
                  <div className="flex gap-1 justify-between">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setNpsScore(score)}
                        className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold border transition ${
                          npsScore === score
                            ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>0 - Not At All Likely</span>
                    <span>10 - Extremely Likely</span>
                  </div>
                </div>

                {/* Question 2: Likert Rating (1-5) */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <label className="block text-zinc-200 font-semibold">
                    2. I have the resources, clarity, and leadership support needed to excel in my role.
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { val: 1, label: "Strongly Disagree" },
                      { val: 2, label: "Disagree" },
                      { val: 3, label: "Neutral" },
                      { val: 4, label: "Agree" },
                      { val: 5, label: "Strongly Agree" },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setLikertScore(opt.val)}
                        className={`p-2 rounded-lg text-[10px] font-medium border text-center transition ${
                          likertScore === opt.val
                            ? "bg-amber-500/20 text-amber-300 border-amber-500"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                        }`}
                      >
                        <span className="block font-bold text-xs">{opt.val}</span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 3: Qualitative Comment */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                  <label className="block text-zinc-200 font-semibold">
                    3. What is one thing the company or your manager could do to improve your daily experience?
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Your feedback is completely anonymous..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setSelectedSurvey(null)}
                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-600/20"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Confidential Response"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
