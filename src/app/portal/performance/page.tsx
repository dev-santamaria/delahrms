"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Target,
  Award,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  Star,
  MessageSquare,
  ChevronRight,
  ArrowUpRight,
  X,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";

interface KeyResult {
  id: string;
  title: string;
  target: string;
  current: string;
  progressPercent: number;
}

interface Objective {
  id: string;
  title: string;
  weight: number;
  overallScore: number;
  keyResults: KeyResult[];
}

export default function PerformancePage() {
  const { entityInfo } = usePortal();

  const [activeTab, setActiveTab] = useState<"okrs" | "appraisal" | "peer360">("okrs");
  const [selfReviewModalOpen, setSelfReviewModalOpen] = useState(false);
  const [selfScore, setSelfScore] = useState(4.5);
  const [selfComments, setSelfComments] = useState(
    "Exceeded operational targets for continuous 24/7 turnaround with zero fatigue violations and completed boiler valve upgrade ahead of deadline."
  );
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [objectives, setObjectives] = useState<Objective[]>([
    {
      id: "obj-1",
      title: "Ensure 99.8% 24/7 Plant Uptime & Zero 12h Rest Violations",
      weight: 40,
      overallScore: 92,
      keyResults: [
        {
          id: "kr-1",
          title: "Maintain zero fatigue guard breaches across Continuous Shifts A, B & C",
          target: "0 Violations",
          current: "0 Violations",
          progressPercent: 100,
        },
        {
          id: "kr-2",
          title: "Complete overhaul of Line 2 boiler valves without emergency halt",
          target: "100% Overhaul",
          current: "85% Done",
          progressPercent: 85,
        },
      ],
    },
    {
      id: "obj-2",
      title: "Advance Regional Depot Haulage & Relocation Operations",
      weight: 35,
      overallScore: 88,
      keyResults: [
        {
          id: "kr-3",
          title: "Execute domestic transfer logistics from Kisumu Depot to Nairobi Plant",
          target: "100% Handover",
          current: "90% Completed",
          progressPercent: 90,
        },
        {
          id: "kr-4",
          title: "Optimize commercial fleet vehicle turnaround time by 15%",
          target: "15% Reduction",
          current: "12% Achieved",
          progressPercent: 80,
        },
      ],
    },
    {
      id: "obj-3",
      title: "Safety Mentorship & Mandatory LMS Compliance",
      weight: 25,
      overallScore: 78,
      keyResults: [
        {
          id: "kr-5",
          title: "Lead 4 hazardous plant safety briefings with 100% quiz pass rate",
          target: "4 Briefings",
          current: "3 Completed",
          progressPercent: 75,
        },
      ],
    },
  ]);

  const handleSubmitSelfReview = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitted(true);
    setTimeout(() => {
      setSelfReviewModalOpen(false);
      setReviewSubmitted(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              Q3 2026 Strategic Review
            </span>
            <span className="text-xs font-mono text-[var(--gray-muted)]">
              Closes Sep 30, 2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--gray-text)] mt-1">
            Performance, OKRs & 360 Feedback
          </h1>
          <p className="text-xs text-[var(--gray-muted)] mt-0.5">
            Cascading company objectives, quantifiable Key Results, competency self-evaluations, and peer endorsements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelfReviewModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] shadow-xs transition flex items-center gap-1.5"
          >
            <Star className="h-4 w-4" />
            <span>Complete Self-Appraisal</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">Weighted OKR Achievement</span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-[var(--emerald-deep)] font-mono">87.5%</h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full">Exceeding</span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)]">5 Key Results tracked across 3 strategic pillars</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">Current Appraisal Stage</span>
          <h3 className="text-xl font-extrabold text-[var(--gray-text)]">Self-Evaluation Phase</h3>
          <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>13 Days Remaining before Manager Review</span>
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">Peer 360 Feedback</span>
          <h3 className="text-xl font-extrabold text-[var(--gray-text)]">2 Received • 1 Pending</h3>
          <p className="text-[11px] text-purple-700 font-semibold">Endorsed for Operational Leadership</p>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--gray-border)] pb-2 overflow-x-auto">
        {[
          { key: "okrs", label: "My Objectives & Key Results (OKRs)", icon: Target },
          { key: "appraisal", label: "Appraisal Evaluation & Scoring", icon: Star },
          { key: "peer360", label: "360 Peer Reviews", icon: Users },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "bg-white text-[var(--emerald-deep)] border border-[var(--gray-border)] shadow-xs"
                  : "text-[var(--gray-muted)] hover:text-[var(--gray-text)] hover:bg-gray-100/60"
              }`}
            >
              <IconComp className={`h-3.5 w-3.5 ${isActive ? "text-[var(--emerald-deep)]" : ""}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab Contents */}

      {/* TAB 1: OKRs */}
      {activeTab === "okrs" && (
        <div className="space-y-4">
          {objectives.map((obj) => (
            <div key={obj.id} className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[var(--gray-text)]">{obj.title}</h3>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      Weight: {obj.weight}%
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--gray-muted)]">Department Alignment: Operations Excellence</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--gray-muted)]">Progress:</span>
                  <span className="text-sm font-mono font-extrabold text-[var(--emerald-deep)]">{obj.overallScore}%</span>
                </div>
              </div>

              {/* Key Results */}
              <div className="space-y-3">
                {obj.keyResults.map((kr) => (
                  <div key={kr.id} className="p-3.5 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[var(--gray-text)]">{kr.title}</span>
                      <span className="font-mono text-[11px] font-bold text-zinc-700">
                        {kr.current} / {kr.target}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-full bg-[var(--emerald-deep)] rounded-full transition-all duration-500"
                          style={{ width: `${kr.progressPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-end text-[10px] font-mono text-[var(--gray-muted)]">
                        <span>{kr.progressPercent}% Achieved</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Appraisal Scoring */}
      {activeTab === "appraisal" && (
        <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                <span>Competency & Core Values Evaluation Matrix</span>
              </h2>
              <p className="text-xs text-[var(--gray-muted)]">
                Scored on a 5-point standard enterprise scale (1: Unsatisfactory to 5: Role Model Exceeding Expectations).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelfReviewModalOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition"
            >
              Update Ratings
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {[
              { title: "Industrial Safety & 12h Rest Fatigue Adherence", score: 5.0, desc: "Flawlessly enforces continuous shift safety and zero rest-interval breaches." },
              { title: "Technical Leadership & Plant Problem Solving", score: 4.5, desc: "Proactively led rapid resolution of Line 2 boiler valve overhaul." },
              { title: "Cross-Station Communication (Kisumu ⇄ Nairobi)", score: 4.5, desc: "Coordinates transfer logistics and handover checklists across regional facilities." },
              { title: "Mentorship & Junior Operator Upskilling", score: 4.0, desc: "Consistently runs hazard training sessions and guides apprenticeship crew." },
            ].map((comp, idx) => (
              <div key={idx} className="py-3.5 first:pt-0 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[var(--gray-text)]">{comp.title}</p>
                  <p className="text-[11px] text-[var(--gray-muted)]">{comp.desc}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-sm font-mono font-extrabold text-[var(--emerald-deep)]">{comp.score.toFixed(1)}</span>
                  <span className="text-xs text-zinc-400">/ 5.0</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Peer 360 */}
      {activeTab === "peer360" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  SJ
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--gray-text)]">Sarah Jenkins</p>
                  <p className="text-[10px] text-[var(--gray-muted)]">Senior Maintenance Lead</p>
                </div>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">5.0 Rating</span>
            </div>
            <p className="text-xs text-zinc-700 italic leading-relaxed bg-[var(--cool-gray)] p-3 rounded-2xl">
              &quot;Nelson has been exceptional in maintaining plant discipline during our continuous shift turnaround. His dedication to zero rest violations kept the entire crew energized and safe.&quot;
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  KO
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--gray-text)]">Kennedy Omondi</p>
                  <p className="text-[10px] text-[var(--gray-muted)]">Operations Leadership (Kisumu)</p>
                </div>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">4.8 Rating</span>
            </div>
            <p className="text-xs text-zinc-700 italic leading-relaxed bg-[var(--cool-gray)] p-3 rounded-2xl">
              &quot;Seamless collaboration on the domestic transfer logistics package between Kisumu Depot and Nairobi. Highly dependable engineering professional.&quot;
            </p>
          </div>
        </div>
      )}

      {/* 5. Self-Appraisal Modal */}
      {selfReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[var(--gray-border)] shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                <span>Submit Q3 Self-Appraisal</span>
              </h3>
              <button type="button" onClick={() => setSelfReviewModalOpen(false)} className="p-1 text-gray-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            {reviewSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-[var(--emerald-deep)] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-[var(--gray-text)]">Self-Appraisal Stamped & Saved!</h4>
                <p className="text-xs text-[var(--gray-muted)]">
                  Your evaluation has been forwarded to your Line Manager (Sarah Wanjiku) for formal review and sign-off.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitSelfReview} className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-[var(--gray-text)]">Overall Self-Rating (1.0 - 5.0)</label>
                    <span className="font-mono font-extrabold text-[var(--emerald-deep)] text-base">{selfScore.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={0.1}
                    value={selfScore}
                    onChange={(e) => setSelfScore(Number(e.target.value))}
                    className="w-full accent-[var(--emerald-deep)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--gray-text)]">Key Achievements & Justification</label>
                  <textarea
                    rows={4}
                    required
                    value={selfComments}
                    onChange={(e) => setSelfComments(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)] leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelfReviewModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs"
                  >
                    Submit Self-Evaluation
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
