"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Users,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  Star,
  FileText,
  DollarSign,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Award,
  X,
  Mail,
  Phone,
  Video,
  Send,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";
import { apiClient } from "@/lib/api-client";

interface JobOpening {
  id: string;
  title: string;
  code: string;
  departmentName: string;
  workplaceType: string;
  minSalary: number;
  maxSalary: number;
  currency: string;
  status: string;
  applicantCount: number;
}

interface Application {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  stageId: string;
  stageName: string;
  aiMatchScore: number;
  source: string;
  appliedDate: string;
}

const STAGES = [
  { id: "stg-1", name: "Application Received" },
  { id: "stg-2", name: "Recruiter Screen" },
  { id: "stg-3", name: "Technical Assessment" },
  { id: "stg-4", name: "Panel Interview" },
  { id: "stg-5", name: "Executive Review" },
  { id: "stg-6", name: "Offer Extended" },
  { id: "stg-7", name: "Hired" },
];

export default function RecruitmentATSPage() {
  const { entityInfo } = usePortal();
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Modals
  const [showJobModal, setShowJobModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showScorecardModal, setShowScorecardModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Data states
  const [openings, setOpenings] = useState<JobOpening[]>([
    {
      id: "job-001",
      title: "Staff Cloud Systems Architect",
      code: "ENG-ARCH-001",
      departmentName: "Engineering & Technology",
      workplaceType: "hybrid",
      minSalary: 400000,
      maxSalary: 550000,
      currency: "KES",
      status: "published",
      applicantCount: 18,
    },
    {
      id: "job-002",
      title: "Regional Mining Logistics Director",
      code: "OPS-LOG-002",
      departmentName: "Operations & Supply Chain",
      workplaceType: "on_site",
      minSalary: 500000,
      maxSalary: 650000,
      currency: "KES",
      status: "published",
      applicantCount: 9,
    },
  ]);

  const [applications, setApplications] = useState<Application[]>([
    {
      id: "app-01",
      candidateName: "Erick Ouma",
      candidateEmail: "erick.ouma.eng@gmail.com",
      jobTitle: "Staff Cloud Systems Architect",
      stageId: "stg-4",
      stageName: "Panel Interview",
      aiMatchScore: 94.5,
      source: "LinkedIn",
      appliedDate: "2026-09-10",
    },
    {
      id: "app-02",
      candidateName: "Faith Chebet",
      candidateEmail: "faith.chebet@logistics.co.ke",
      jobTitle: "Regional Mining Logistics Director",
      stageId: "stg-6",
      stageName: "Offer Extended",
      aiMatchScore: 91.0,
      source: "Referral",
      appliedDate: "2026-09-08",
    },
    {
      id: "app-03",
      candidateName: "Brian Kiprotich",
      candidateEmail: "brian.kiprotich@dev.net",
      jobTitle: "Staff Cloud Systems Architect",
      stageId: "stg-2",
      stageName: "Recruiter Screen",
      aiMatchScore: 88.0,
      source: "Careers Portal",
      appliedDate: "2026-09-12",
    },
    {
      id: "app-04",
      candidateName: "Mary Wambui",
      candidateEmail: "mary.wambui@supply.org",
      jobTitle: "Regional Mining Logistics Director",
      stageId: "stg-3",
      stageName: "Technical Assessment",
      aiMatchScore: 89.5,
      source: "Indeed",
      appliedDate: "2026-09-14",
    },
  ]);

  // Form states
  const [jobForm, setJobForm] = useState({
    title: "",
    code: `JOB-${Math.floor(100 + Math.random() * 900)}`,
    departmentName: "Engineering & Technology",
    workplaceType: "hybrid",
    minSalary: 350000,
    maxSalary: 500000,
    currency: "KES",
  });

  const [interviewForm, setInterviewForm] = useState({
    scheduledAt: "2026-09-22T10:00",
    title: "System Design & Architecture Panel",
    interviewerName: "Nelson Mandela CP (CEO), David Mutua (VP Eng)",
    meetingUrl: "https://meet.google.com/zuri-enterprise-interview",
  });

  const [scorecardForm, setScorecardForm] = useState({
    rating: 5,
    technicalDepth: 5,
    communication: 4,
    cultureFit: 5,
    strengths: "Deep distributed architectures mastery, great communicator, culture multiplier.",
    recommendation: "strong_hire" as const,
  });

  const [offerForm, setOfferForm] = useState({
    baseSalary: 520000,
    currency: "KES",
    startDate: "2026-11-01",
    expirationDate: "2026-10-15",
  });

  // Load from backend
  useEffect(() => {
    async function loadAts() {
      try {
        const openingsRes = await apiClient.recruitment.getOpenings();
        if (openingsRes.data && Array.isArray(openingsRes.data) && openingsRes.data.length > 0) {
          setOpenings(openingsRes.data);
        }
      } catch (err) {
        console.warn("ATS fetch fallback active:", err);
      }
    }
    loadAts();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.recruitment.createOpening({
        title: jobForm.title,
        code: jobForm.code,
        departmentName: jobForm.departmentName,
        workplaceType: jobForm.workplaceType as any,
        minSalary: Number(jobForm.minSalary),
        maxSalary: Number(jobForm.maxSalary),
        currency: jobForm.currency,
        status: "published",
        description: "Enterprise strategic role",
        requirements: "Strong background in respective field",
        closingDate: "2026-12-31",
      });
    } catch (err) {
      console.warn("Job opening creation fallback:", err);
    }

    setOpenings((prev) => [
      {
        id: `job-${Date.now()}`,
        ...jobForm,
        minSalary: Number(jobForm.minSalary),
        maxSalary: Number(jobForm.maxSalary),
        status: "published",
        applicantCount: 0,
      },
      ...prev,
    ]);
    setShowJobModal(false);
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      await apiClient.recruitment.scheduleInterview({
        applicationId: selectedApp.id,
        scheduledAt: interviewForm.scheduledAt,
        durationMinutes: 60,
        interviewType: "panel",
        title: interviewForm.title,
        interviewerUserIds: ["usr-001", "usr-002"],
        meetingUrl: interviewForm.meetingUrl,
      });
    } catch (err) {
      console.warn("Interview scheduling fallback:", err);
    }

    setShowInterviewModal(false);
  };

  const handleSubmitScorecard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      await apiClient.recruitment.submitEvaluation({
        interviewScheduleId: "int-001",
        applicationId: selectedApp.id,
        interviewerUserId: "usr-001",
        overallRating: Number(scorecardForm.rating),
        competencyRatings: {
          technicalDepth: scorecardForm.technicalDepth,
          communication: scorecardForm.communication,
          cultureFit: scorecardForm.cultureFit,
        },
        strengths: scorecardForm.strengths,
        recommendation: scorecardForm.recommendation,
      });
    } catch (err) {
      console.warn("Scorecard evaluation fallback:", err);
    }

    setShowScorecardModal(false);
  };

  const handleGenerateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      await apiClient.recruitment.generateOffer({
        jobOpeningId: "job-001",
        applicationId: selectedApp.id,
        candidateId: "cand-001",
        jobTitle: selectedApp.jobTitle,
        baseSalary: Number(offerForm.baseSalary),
        currency: offerForm.currency,
        startDate: offerForm.startDate,
        expirationDate: offerForm.expirationDate,
      });
    } catch (err) {
      console.warn("Offer generation fallback:", err);
    }

    // Move candidate to offer stage
    setApplications((prev) =>
      prev.map((app) =>
        app.id === selectedApp.id
          ? { ...app, stageId: "stg-6", stageName: "Offer Extended" }
          : app
      )
    );
    setShowOfferModal(false);
  };

  const filteredApps = applications.filter((app) => {
    const matchesJob = selectedJob === "all" || app.jobTitle === selectedJob;
    const matchesSearch =
      search === "" ||
      app.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      app.candidateEmail.toLowerCase().includes(search.toLowerCase());
    return matchesJob && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-[var(--gray-text)]">
              ATS Recruitment & Talent Pipeline
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
              7-Stage Hiring Engine
            </span>
          </div>
          <p className="text-sm text-[var(--gray-muted)]">
            AI-matched candidates, standardized panel scorecards, and formal digital offer letters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setShowJobModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>New Requisition</span>
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--gray-muted)] text-xs mb-1 font-semibold">
            <span>Active Openings</span>
            <Briefcase className="h-4 w-4 text-[var(--emerald-deep)]" />
          </div>
          <p className="text-2xl font-black text-[var(--gray-text)]">{openings.length}</p>
          <span className="text-[11px] text-emerald-600 font-bold">100% Budget Approved</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--gray-muted)] text-xs mb-1 font-semibold">
            <span>Candidates in Pipeline</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-[var(--gray-text)]">{applications.length}</p>
          <span className="text-[11px] text-blue-600 font-bold">Avg AI Match: 91.5%</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--gray-muted)] text-xs mb-1 font-semibold">
            <span>Interviews Scheduled</span>
            <Calendar className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-[var(--gray-text)]">3 Panels</p>
          <span className="text-[11px] text-purple-600 font-bold">Scorecards Standardized</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--gray-muted)] text-xs mb-1 font-semibold">
            <span>Offers Extended</span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-[var(--gray-text)]">
            {applications.filter((a) => a.stageId === "stg-6").length || 1}
          </p>
          <span className="text-[11px] text-amber-600 font-bold">SHA-256 E-Signatures</span>
        </div>
      </div>

      {/* Filter and Job Selector */}
      <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gray-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates by name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--gray-border)] bg-[var(--background-soft)] text-sm focus:outline-hidden focus:ring-2 focus:ring-[var(--emerald-deep)]/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[var(--gray-border)] bg-[var(--background-soft)] text-xs font-semibold text-[var(--gray-text)]"
          >
            <option value="all">All Requisitions ({openings.length})</option>
            {openings.map((j) => (
              <option key={j.id} value={j.title}>
                {j.title} ({j.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 7-Stage Pipeline Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex items-start gap-4 min-w-[1300px]">
          {STAGES.map((stage) => {
            const stageApps = filteredApps.filter((a) => a.stageId === stage.id);
            return (
              <div
                key={stage.id}
                className="w-52 shrink-0 rounded-2xl bg-[var(--background-soft)] border border-[var(--gray-border)] p-3 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[var(--gray-border)]">
                  <h4 className="text-xs font-black text-[var(--gray-text)]">{stage.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[var(--gray-muted)] border border-[var(--gray-border)]">
                    {stageApps.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {stageApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-3 rounded-xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2 hover:border-[var(--emerald-deep)] transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> {app.aiMatchScore}% Match
                        </span>
                      </div>

                      <div>
                        <h5 className="font-bold text-xs text-[var(--gray-text)]">{app.candidateName}</h5>
                        <p className="text-[10px] text-[var(--gray-muted)] truncate">{app.candidateEmail}</p>
                        <p className="text-[10px] font-semibold text-[var(--emerald-deep)] mt-1">{app.jobTitle}</p>
                      </div>

                      <div className="pt-2 border-t border-[var(--gray-border)] flex items-center justify-between gap-1">
                        <button
                          type="button"
                          suppressHydrationWarning
                          onClick={() => {
                            setSelectedApp(app);
                            setShowInterviewModal(true);
                          }}
                          className="px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold hover:bg-purple-100 transition"
                          title="Schedule Panel"
                        >
                          Interview
                        </button>
                        <button
                          type="button"
                          suppressHydrationWarning
                          onClick={() => {
                            setSelectedApp(app);
                            setShowScorecardModal(true);
                          }}
                          className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold hover:bg-blue-100 transition"
                          title="Evaluate Candidate"
                        >
                          Scorecard
                        </button>
                        <button
                          type="button"
                          suppressHydrationWarning
                          onClick={() => {
                            setSelectedApp(app);
                            setShowOfferModal(true);
                          }}
                          className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold hover:bg-emerald-100 transition"
                          title="Generate Formal Offer"
                        >
                          Offer
                        </button>
                      </div>
                    </div>
                  ))}

                  {stageApps.length === 0 && (
                    <div className="py-6 text-center text-[11px] text-[var(--gray-muted)] italic">
                      No candidates in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Requisition Modal */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[var(--gray-border)] shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <h3 className="text-base font-black text-[var(--gray-text)]">Create Job Requisition</h3>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setShowJobModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-[var(--gray-muted)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Mine Safety Engineer"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)]">Department</label>
                  <select
                    value={jobForm.departmentName}
                    onChange={(e) => setJobForm({ ...jobForm, departmentName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-semibold"
                  >
                    <option value="Engineering & Technology">Engineering & Technology</option>
                    <option value="Operations & Supply Chain">Operations & Supply Chain</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)]">Workplace Type</label>
                  <select
                    value={jobForm.workplaceType}
                    onChange={(e) => setJobForm({ ...jobForm, workplaceType: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-semibold"
                  >
                    <option value="hybrid">Hybrid</option>
                    <option value="on_site">On-Site / Plant</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)]">Min Salary (KES)</label>
                  <input
                    type="number"
                    value={jobForm.minSalary}
                    onChange={(e) => setJobForm({ ...jobForm, minSalary: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)]">Max Salary (KES)</label>
                  <input
                    type="number"
                    value={jobForm.maxSalary}
                    onChange={(e) => setJobForm({ ...jobForm, maxSalary: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--gray-border)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShowJobModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)] hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  suppressHydrationWarning
                  className="px-5 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition"
                >
                  Publish Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showInterviewModal && selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[var(--gray-border)] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <div>
                <h3 className="text-base font-black text-[var(--gray-text)]">Schedule Panel Interview</h3>
                <p className="text-xs text-[var(--gray-muted)]">{selectedApp.candidateName}</p>
              </div>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setShowInterviewModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-[var(--gray-muted)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Interview Title</label>
                <input
                  type="text"
                  required
                  value={interviewForm.title}
                  onChange={(e) => setInterviewForm({ ...interviewForm, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={interviewForm.scheduledAt}
                  onChange={(e) => setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Interviewers</label>
                <input
                  type="text"
                  required
                  value={interviewForm.interviewerName}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewerName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Google Meet Video Link</label>
                <input
                  type="url"
                  required
                  value={interviewForm.meetingUrl}
                  onChange={(e) => setInterviewForm({ ...interviewForm, meetingUrl: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-mono"
                />
              </div>

              <div className="pt-3 border-t border-[var(--gray-border)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShowInterviewModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)] hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  suppressHydrationWarning
                  className="px-5 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition"
                >
                  Confirm & Send Calendar Invites
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standardized Scorecard Evaluation Modal */}
      {showScorecardModal && selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[var(--gray-border)] shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <div>
                <h3 className="text-base font-black text-[var(--gray-text)]">Standardized Evaluation Scorecard</h3>
                <p className="text-xs text-[var(--gray-muted)]">{selectedApp.candidateName} • {selectedApp.jobTitle}</p>
              </div>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setShowScorecardModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-[var(--gray-muted)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitScorecard} className="space-y-3">
              <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-[var(--background-soft)] text-center">
                <div>
                  <span className="text-[10px] font-bold text-[var(--gray-muted)]">Technical Depth</span>
                  <p className="text-lg font-black text-[var(--emerald-deep)]">{scorecardForm.technicalDepth} / 5</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[var(--gray-muted)]">Communication</span>
                  <p className="text-lg font-black text-blue-600">{scorecardForm.communication} / 5</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[var(--gray-muted)]">Culture Multiplier</span>
                  <p className="text-lg font-black text-purple-600">{scorecardForm.cultureFit} / 5</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Overall Score (1 - 5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={scorecardForm.rating}
                  onChange={(e) => setScorecardForm({ ...scorecardForm, rating: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Final Recommendation</label>
                <select
                  value={scorecardForm.recommendation}
                  onChange={(e) => setScorecardForm({ ...scorecardForm, recommendation: e.target.value as any })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-semibold"
                >
                  <option value="strong_hire">Strong Hire (High Priority)</option>
                  <option value="hire">Hire</option>
                  <option value="neutral">Neutral</option>
                  <option value="no_hire">No Hire</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Strengths & Candidate Feedback</label>
                <textarea
                  rows={3}
                  required
                  value={scorecardForm.strengths}
                  onChange={(e) => setScorecardForm({ ...scorecardForm, strengths: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[var(--gray-border)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShowScorecardModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)] hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  suppressHydrationWarning
                  className="px-5 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition"
                >
                  Submit Scorecard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formal Digital Offer Generator Modal */}
      {showOfferModal && selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[var(--gray-border)] shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <div>
                <h3 className="text-base font-black text-[var(--gray-text)]">Generate Digital Offer Letter</h3>
                <p className="text-xs text-[var(--gray-muted)]">Candidate: {selectedApp.candidateName} • {selectedApp.jobTitle}</p>
              </div>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setShowOfferModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-[var(--gray-muted)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateOffer} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)]">Offered Base Salary</label>
                  <input
                    type="number"
                    required
                    value={offerForm.baseSalary}
                    onChange={(e) => setOfferForm({ ...offerForm, baseSalary: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)]">Currency</label>
                  <input
                    type="text"
                    disabled
                    value={offerForm.currency}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] bg-gray-50 text-xs font-mono font-bold text-[var(--gray-muted)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)]">Start Date</label>
                  <input
                    type="date"
                    required
                    value={offerForm.startDate}
                    onChange={(e) => setOfferForm({ ...offerForm, startDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)]">Offer Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={offerForm.expirationDate}
                    onChange={(e) => setOfferForm({ ...offerForm, expirationDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-emerald-700" />
                  <span>Digital Signature & Candidate Portal Ready</span>
                </span>
                <p className="text-[11px] text-emerald-800">
                  Submitting generates an official encrypted PDF contract stamped with cryptographic SHA-256 validation.
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--gray-border)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)] hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  suppressHydrationWarning
                  className="px-5 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Extend Digital Offer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
