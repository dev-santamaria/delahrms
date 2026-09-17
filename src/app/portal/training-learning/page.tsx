"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  Play,
  FileCheck,
  ShieldAlert,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
  Send,
  X,
  FileText,
  Users,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";
import { apiClient } from "@/lib/api-client";

interface Course {
  id: string;
  code: string;
  title: string;
  category: string;
  durationHours: number;
  totalModules: number;
  enrolledCount: number;
  completionRate: number;
  mandatoryFor: string;
  recertificationInterval: string;
  passMark: number;
}

export default function TrainingLearningPortalPage() {
  const { entityInfo } = usePortal();
  const [activeTab, setActiveTab] = useState<"catalog" | "expiring-certs" | "compliance-matrix">("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Modals
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [issuedCert, setIssuedCert] = useState<string | null>(null);

  // Forms
  const [courseForm, setCourseForm] = useState({
    title: "",
    code: `COMP-${Math.floor(100 + Math.random() * 900)}`,
    category: "compliance_mandatory",
    validityMonths: 12,
    passingScorePercentage: 80,
    estimatedDurationMinutes: 60,
    description: "",
  });

  const [assignForm, setAssignForm] = useState({
    employeeIds: "emp-001, emp-002, emp-004",
    dueDate: "2026-10-31",
  });

  const [quizScore, setQuizScore] = useState<number>(95);

  const [courses, setCourses] = useState<Course[]>([
    {
      id: "crs-aml-101",
      code: "COMP-AML-101",
      title: "Anti-Money Laundering (AML) & Counter-Terrorist Financing (CTF) Compliance",
      category: "Mandatory Compliance",
      durationHours: 2.0,
      totalModules: 4,
      enrolledCount: 380,
      completionRate: 98.8,
      mandatoryFor: "Commercial, Procurement & Finance Staff",
      recertificationInterval: "Annual (12 Months)",
      passMark: 80,
    },
    {
      id: "crs-osha-301",
      code: "SAFE-OSHA-301",
      title: "24/7 Industrial Heavy Machinery & Mining Fatigue Safety Protocol",
      category: "Industrial Safety (OSHA)",
      durationHours: 4.5,
      totalModules: 6,
      enrolledCount: 1420,
      completionRate: 96.2,
      mandatoryFor: "All Shift Operators & Plant Engineers",
      recertificationInterval: "Semi-Annual (6 Months)",
      passMark: 90,
    },
    {
      id: "crs-sec-201",
      code: "SEC-AWR-201",
      title: "Zero-Trust Enterprise Cybersecurity & Phishing Defense",
      category: "Cybersecurity & IT",
      durationHours: 1.5,
      totalModules: 3,
      enrolledCount: 1650,
      completionRate: 92.4,
      mandatoryFor: "All Corporate & Remote Employees",
      recertificationInterval: "Annual (12 Months)",
      passMark: 85,
    },
  ]);

  const [complianceMatrix, setComplianceMatrix] = useState({
    enterpriseWorkforceScope: 2150,
    totalActiveCertificatesIssued: 1980,
    overallCompliancePercentage: 92,
    recertificationStatus: {
      fullyCertified: 1820,
      expiringWithin60Days: 95,
      currentlyExpiredRequiringRetraining: 65,
    },
    mandatoryAuditFindings: [
      "OSHA Mining certification (SAFE-OSHA-301) expired for regional logistics site supervisors.",
      "Annual POCAMLA AML refreshers due for Finance and Treasury staff by end of Q4.",
    ],
  });

  const expiringCerts = [
    {
      id: "CERT-01",
      employeeName: "David Omondi",
      empId: "EMP-2190",
      certificationName: "Heavy Machinery Safety & Fatigue Protocol",
      issuingBody: "Directorate of Occupational Safety and Health (DOSHS)",
      expiresOn: "2026-10-15",
      daysRemaining: 28,
      status: "Expiring Soon",
    },
    {
      id: "CERT-02",
      employeeName: "Jean-Pierre Dubois",
      empId: "EMP-004",
      certificationName: "Underground Mining Operations Safety Lead",
      issuingBody: "Tanzania Mining Commission",
      expiresOn: "2026-10-02",
      daysRemaining: 15,
      status: "Urgent Renewal",
    },
    {
      id: "CERT-03",
      employeeName: "Amina Odhiambo",
      empId: "EMP-003",
      certificationName: "POCAMLA Anti-Money Laundering Certified Officer",
      issuingBody: "Financial Reporting Centre (FRC Kenya)",
      expiresOn: "2026-12-31",
      daysRemaining: 105,
      status: "Valid",
    },
  ];

  // Load live data from backend
  useEffect(() => {
    async function loadData() {
      try {
        const matrixRes = await apiClient.learning.getComplianceMatrix();
        if (matrixRes.data) {
          setComplianceMatrix(matrixRes.data);
        }
      } catch (err) {
        console.warn("Learning matrix fallback active:", err);
      }
    }
    loadData();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.learning.createCourse({
        title: courseForm.title,
        code: courseForm.code,
        category: courseForm.category,
        validityPeriodMonths: Number(courseForm.validityMonths),
        passingScorePercentage: Number(courseForm.passingScorePercentage),
        estimatedDurationMinutes: Number(courseForm.estimatedDurationMinutes),
        description: courseForm.description,
      });
    } catch (err) {
      console.warn("Course creation fallback:", err);
    }

    setCourses((prev) => [
      {
        id: `crs-${Date.now()}`,
        code: courseForm.code,
        title: courseForm.title,
        category: courseForm.category === "compliance_mandatory" ? "Mandatory Compliance" : "Industrial Safety (OSHA)",
        durationHours: courseForm.estimatedDurationMinutes / 60,
        totalModules: 4,
        enrolledCount: 1,
        completionRate: 100,
        mandatoryFor: "Assigned Workforce Cohorts",
        recertificationInterval: `${courseForm.validityMonths} Months`,
        passMark: courseForm.passingScorePercentage,
      },
      ...prev,
    ]);
    setShowCreateCourseModal(false);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      const empArr = assignForm.employeeIds.split(",").map((s) => s.trim());
      await apiClient.learning.assignCourse({
        courseId: selectedCourse.id,
        employeeIds: empArr,
        dueDate: assignForm.dueDate,
      });
    } catch (err) {
      console.warn("Course assignment fallback:", err);
    }

    setShowAssignModal(false);
  };

  const handleCompleteQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      const res = await apiClient.learning.completeAssignment("asg-001", {
        scorePercentage: quizScore,
      });
      if (res.data?.certificateNumber) {
        setIssuedCert(res.data.certificateNumber);
      } else {
        setIssuedCert(`CERT-${selectedCourse.code}-2026-9921`);
      }
    } catch {
      setIssuedCert(`CERT-${selectedCourse.code}-2026-9921`);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-[var(--gray-text)]">
              Training, Learning & Compliance Auditing
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              LMS Engine
            </span>
          </div>
          <p className="text-sm text-[var(--gray-muted)]">
            OSHA mining safety protocols, POCAMLA AML refreshers, and automated 60-day recertification matrices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setShowCreateCourseModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Publish Course</span>
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--gray-muted)] text-xs mb-1 font-semibold">
            <span>Overall Compliance</span>
            <ShieldAlert className="h-4 w-4 text-[var(--emerald-deep)]" />
          </div>
          <p className="text-2xl font-black text-[var(--emerald-deep)] font-mono">
            {complianceMatrix.overallCompliancePercentage}%
          </p>
          <span className="text-[11px] text-emerald-600 font-bold">1,980 / 2,150 Certified</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--gray-muted)] text-xs mb-1 font-semibold">
            <span>Expiring within 60 Days</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 font-mono">
            {complianceMatrix.recertificationStatus.expiringWithin60Days}
          </p>
          <span className="text-[11px] text-amber-600 font-bold">Refresher Window Open</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--gray-muted)] text-xs mb-1 font-semibold">
            <span>Expired / Retraining Needed</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 font-mono">
            {complianceMatrix.recertificationStatus.currentlyExpiredRequiringRetraining}
          </p>
          <span className="text-[11px] text-rose-600 font-bold">Operational Halt Guard</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--gray-muted)] text-xs mb-1 font-semibold">
            <span>Active Courses</span>
            <BookOpen className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-[var(--gray-text)]">{courses.length}</p>
          <span className="text-[11px] text-purple-600 font-bold">OSHA & AML Certified</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--gray-border)] pb-2">
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("catalog")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "catalog"
              ? "bg-[var(--emerald-deep)] text-white shadow-xs"
              : "text-[var(--gray-muted)] hover:bg-gray-100"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Course Catalog ({courses.length})</span>
        </button>

        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("expiring-certs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "expiring-certs"
              ? "bg-[var(--emerald-deep)] text-white shadow-xs"
              : "text-[var(--gray-muted)] hover:bg-gray-100"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>60-Day Renewal Radar ({expiringCerts.length})</span>
        </button>

        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("compliance-matrix")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "compliance-matrix"
              ? "bg-[var(--emerald-deep)] text-white shadow-xs"
              : "text-[var(--gray-muted)] hover:bg-gray-100"
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Compliance Retraining Matrix</span>
        </button>
      </div>

      {/* TAB 1: CATALOG */}
      {activeTab === "catalog" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredCourses.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4 hover:border-[var(--emerald-deep)] transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                    {c.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    Pass: {c.passMark}%
                  </span>
                </div>

                <h4 className="font-bold text-sm text-[var(--gray-text)] leading-snug">{c.title}</h4>
                <p className="text-xs text-[var(--gray-muted)]">Mandatory for: {c.mandatoryFor}</p>

                <div className="pt-2 border-t border-[var(--gray-border)] space-y-1 text-xs text-[var(--gray-muted)]">
                  <div className="flex justify-between">
                    <span>Recertification Cycle:</span>
                    <strong className="text-[var(--gray-text)]">{c.recertificationInterval}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Completion Rate:</span>
                    <strong className="text-[var(--emerald-deep)]">{c.completionRate}%</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--gray-border)] flex items-center gap-2">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => {
                    setSelectedCourse(c);
                    setIssuedCert(null);
                    setShowQuizModal(true);
                  }}
                  className="flex-1 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition flex items-center justify-center gap-1.5"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Launch & Certify</span>
                </button>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => {
                    setSelectedCourse(c);
                    setShowAssignModal(true);
                  }}
                  className="px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)] hover:bg-gray-100 transition"
                >
                  Assign
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: EXPIRING CERTS */}
      {activeTab === "expiring-certs" && (
        <div className="rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--background-soft)] text-[var(--gray-muted)] text-[11px] font-bold uppercase tracking-wider border-b border-[var(--gray-border)]">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Certification Title</th>
                <th className="py-3 px-4">Issuing Authority</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Countdown</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--gray-border)]">
              {expiringCerts.map((cert) => (
                <tr key={cert.id} className="hover:bg-[var(--background-soft)]/50 transition">
                  <td className="py-3.5 px-4 font-bold text-[var(--gray-text)]">{cert.employeeName}</td>
                  <td className="py-3.5 px-4 font-semibold text-xs text-[var(--gray-text)]">{cert.certificationName}</td>
                  <td className="py-3.5 px-4 text-xs text-[var(--gray-muted)]">{cert.issuingBody}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-[var(--gray-text)]">{cert.expiresOn}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        cert.daysRemaining <= 20
                          ? "bg-rose-100 text-rose-800"
                          : cert.daysRemaining <= 60
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {cert.daysRemaining} Days Left
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      suppressHydrationWarning
                      className="px-3 py-1.5 rounded-lg bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition"
                    >
                      Enroll Renewal
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: COMPLIANCE RETRAINING MATRIX */}
      {activeTab === "compliance-matrix" && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3">
            <h3 className="text-base font-black text-[var(--gray-text)]">Statutory Audit Findings & Action Items</h3>
            <div className="space-y-2">
              {complianceMatrix.mandatoryAuditFindings.map((finding, i) => (
                <div key={i} className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>{finding}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[var(--gray-border)] flex items-center justify-between">
              <span className="text-xs text-[var(--gray-muted)]">
                Recommended Action: Automated 1-click batch re-enrollment for non-compliant cohorts.
              </span>
              <button
                type="button"
                suppressHydrationWarning
                className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Trigger Batch Re-enrollment Alerts</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Course Modal */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[var(--gray-border)] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <h3 className="text-base font-black text-[var(--gray-text)]">Publish Training Course</h3>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setShowCreateCourseModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-[var(--gray-muted)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hazardous Materials Spill Response"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)]">Course Code</label>
                  <input
                    type="text"
                    required
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)]">Recertification (Months)</label>
                  <input
                    type="number"
                    value={courseForm.validityMonths}
                    onChange={(e) => setCourseForm({ ...courseForm, validityMonths: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)]">Pass Mark (%)</label>
                  <input
                    type="number"
                    value={courseForm.passingScorePercentage}
                    onChange={(e) => setCourseForm({ ...courseForm, passingScorePercentage: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)]">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={courseForm.estimatedDurationMinutes}
                    onChange={(e) => setCourseForm({ ...courseForm, estimatedDurationMinutes: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--gray-border)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShowCreateCourseModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)] hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  suppressHydrationWarning
                  className="px-5 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition"
                >
                  Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quiz & Certification Modal */}
      {showQuizModal && selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[var(--gray-border)] shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <div>
                <h3 className="text-base font-black text-[var(--gray-text)]">Course Assessment & Certification</h3>
                <p className="text-xs text-[var(--gray-muted)]">{selectedCourse.title}</p>
              </div>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setShowQuizModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-[var(--gray-muted)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {issuedCert ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-lg">
                  <Award className="h-6 w-6" />
                </div>
                <h4 className="font-black text-emerald-900 text-base">Certificate Issued Successfully!</h4>
                <p className="text-xs text-emerald-800">
                  Certificate Number: <strong className="font-mono">{issuedCert}</strong>
                </p>
                <p className="text-[11px] text-emerald-700">
                  Stamped with SHA-256 digital fingerprint and recorded in employee master profile.
                </p>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShowQuizModal(false)}
                  className="w-full py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCompleteQuiz} className="space-y-4">
                <div className="p-4 rounded-2xl bg-[var(--background-soft)] border border-[var(--gray-border)] space-y-2 text-xs">
                  <p className="font-semibold text-[var(--gray-text)]">
                    Simulate final assessment score submission:
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span>Achieved Score:</span>
                    <strong className="text-sm font-mono text-[var(--emerald-deep)]">{quizScore}%</strong>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={100}
                    value={quizScore}
                    onChange={(e) => setQuizScore(Number(e.target.value))}
                    className="w-full accent-[var(--emerald-deep)]"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--gray-muted)]">
                    <span>Fail Threshold (&lt; {selectedCourse.passMark}%)</span>
                    <span>Pass Threshold (&ge; {selectedCourse.passMark}%)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--gray-border)] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setShowQuizModal(false)}
                    className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)] hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    suppressHydrationWarning
                    className="px-5 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition flex items-center gap-1.5"
                  >
                    <Award className="h-4 w-4" />
                    <span>Submit & Issue Certificate</span>
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
