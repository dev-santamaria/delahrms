"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BookOpen,
  Users,
  Building,
  RefreshCw,
  Search,
  Plus,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface Course {
  id: string;
  code: string;
  title: string;
  category: string;
  department: string;
  isMandatory: boolean;
  validityPeriodMonths: number | null;
  passingScore: number;
  durationMinutes: number;
  enrolledCount: number;
  completedCount: number;
}

interface ComplianceMatrixItem {
  employeeId: string;
  employeeName: string;
  department: string;
  courseTitle: string;
  courseCode: string;
  status: "completed" | "in_progress" | "overdue" | "retraining_due";
  completionDate: string | null;
  validUntil: string | null;
  daysRemaining: number | null;
}

export function TrainingModule() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [retrainFeedback, setRetrainFeedback] = useState<string | null>(null);

  const [courses] = useState<Course[]>([
    {
      id: "crs-001",
      code: "SEC-101",
      title: "Workplace Cybersecurity & Phishing Defense",
      category: "IT & Security",
      department: "Information Security",
      isMandatory: true,
      validityPeriodMonths: 12,
      passingScore: 85,
      durationMinutes: 45,
      enrolledCount: 50,
      completedCount: 47,
    },
    {
      id: "crs-002",
      code: "SVC-201",
      title: "Up Your Service: Client Excellence Standard",
      category: "Customer Service",
      department: "People & Culture",
      isMandatory: true,
      validityPeriodMonths: 12,
      passingScore: 80,
      durationMinutes: 60,
      enrolledCount: 50,
      completedCount: 45,
    },
    {
      id: "crs-003",
      code: "COMP-301",
      title: "Global Anti-Money Laundering (AML) & Sanctions",
      category: "Compliance & Legal",
      department: "Legal & Regulatory",
      isMandatory: true,
      validityPeriodMonths: 12,
      passingScore: 90,
      durationMinutes: 50,
      enrolledCount: 50,
      completedCount: 48,
    },
    {
      id: "crs-004",
      code: "PROD-401",
      title: "Q3 Product Architecture & GTM Playbook",
      category: "Product Enablement",
      department: "Product Management",
      isMandatory: false,
      validityPeriodMonths: null,
      passingScore: 75,
      durationMinutes: 90,
      enrolledCount: 28,
      completedCount: 22,
    },
  ]);

  const [matrix, setMatrix] = useState<ComplianceMatrixItem[]>([
    {
      employeeId: "EMP-001",
      employeeName: "Nelson Mandela CP",
      department: "Executive",
      courseTitle: "Up Your Service: Client Excellence Standard",
      courseCode: "SVC-201",
      status: "completed",
      completionDate: "2026-09-10",
      validUntil: "2027-09-10",
      daysRemaining: 359,
    },
    {
      employeeId: "EMP-001",
      employeeName: "Nelson Mandela CP",
      department: "Executive",
      courseTitle: "Workplace Cybersecurity & Phishing Defense",
      courseCode: "SEC-101",
      status: "completed",
      completionDate: "2026-09-05",
      validUntil: "2027-09-05",
      daysRemaining: 354,
    },
    {
      employeeId: "EMP-002",
      employeeName: "Amina Odhiambo",
      department: "Engineering",
      courseTitle: "Workplace Cybersecurity & Phishing Defense",
      courseCode: "SEC-101",
      status: "completed",
      completionDate: "2025-10-01",
      validUntil: "2026-10-01",
      daysRemaining: 15,
    },
    {
      employeeId: "EMP-002",
      employeeName: "Amina Odhiambo",
      department: "Engineering",
      courseTitle: "Up Your Service: Client Excellence Standard",
      courseCode: "SVC-201",
      status: "retraining_due",
      completionDate: "2025-09-01",
      validUntil: "2026-09-01",
      daysRemaining: -15,
    },
    {
      employeeId: "EMP-003",
      employeeName: "David Kiprono",
      department: "Operations",
      courseTitle: "Global Anti-Money Laundering (AML) & Sanctions",
      courseCode: "COMP-301",
      status: "in_progress",
      completionDate: null,
      validUntil: null,
      daysRemaining: null,
    },
  ]);

  const handleRetrain = (item: ComplianceMatrixItem) => {
    setRetrainFeedback(`Refresher course [${item.courseCode}] assigned to ${item.employeeName} with 14-day completion SLA.`);
    setMatrix((prev) =>
      prev.map((m) =>
        m.employeeId === item.employeeId && m.courseCode === item.courseCode
          ? { ...m, status: "in_progress", daysRemaining: 14 }
          : m
      )
    );
    setTimeout(() => setRetrainFeedback(null), 3500);
  };

  const filteredCourses = activeCategory === "all"
    ? courses
    : courses.filter((c) => c.category.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Workforce Learning, Mandatory Training & Retraining Hub
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
              Annual Compliance Tracking Active
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Track onboarding orientation, mandatory regulatory certifications, departmental upskilling, and automated re-certification deadlines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs flex items-center gap-2">
            <span className="text-zinc-400">Workforce Compliance Rate:</span>
            <span className="font-bold text-emerald-400 font-mono">94.2%</span>
          </div>
        </div>
      </div>

      {/* Retrain Alert Notification */}
      {retrainFeedback && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{retrainFeedback}</span>
        </div>
      )}

      {/* Mandatory Retraining Compliance Matrix Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              Compliance Re-Certification & Retraining Matrix
            </h3>
            <p className="text-[11px] text-zinc-400">Identifies who has trained, who is overdue, and who requires refresher retraining</p>
          </div>
          <span className="text-xs font-mono text-zinc-400">1 Employee Requires Retraining</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 text-zinc-400 text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Course / Certification</th>
                <th className="py-3 px-3">Last Completed</th>
                <th className="py-3 px-3">Validity Expiry</th>
                <th className="py-3 px-3">Audit Status</th>
                <th className="py-3 px-4 text-right">Retraining Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {matrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-zinc-800/30 transition">
                  <td className="py-3.5 px-4 font-semibold text-zinc-200">{item.employeeName}</td>
                  <td className="py-3.5 px-3 text-zinc-400">{item.department}</td>
                  <td className="py-3.5 px-3">
                    <div className="font-medium text-zinc-200">{item.courseTitle}</div>
                    <div className="text-[10px] text-indigo-400 font-mono">{item.courseCode}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-zinc-300">
                    {item.completionDate || <span className="text-zinc-500">Not Completed</span>}
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    {item.validUntil ? (
                      <span className={item.daysRemaining !== null && item.daysRemaining < 30 ? "text-amber-400 font-bold" : "text-zinc-300"}>
                        {item.validUntil}
                        {item.daysRemaining !== null && item.daysRemaining < 30 && item.daysRemaining >= 0 && (
                          <span className="text-[10px] text-amber-400 block font-sans">({item.daysRemaining} days left)</span>
                        )}
                        {item.daysRemaining !== null && item.daysRemaining < 0 && (
                          <span className="text-[10px] text-rose-400 block font-sans">(Expired)</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-zinc-500">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-semibold capitalize ${
                        item.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : item.status === "in_progress"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : item.status === "retraining_due"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {item.status === "completed"
                        ? "Certified & Valid"
                        : item.status === "retraining_due"
                        ? "Needs Retraining"
                        : item.status === "in_progress"
                        ? "In Progress"
                        : "Overdue"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {item.status === "retraining_due" ? (
                      <button
                        onClick={() => handleRetrain(item)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition shadow-sm flex items-center gap-1 ml-auto"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Trigger Retraining</span>
                      </button>
                    ) : (
                      <span className="text-zinc-500 text-[11px]">Compliant</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Course Catalog Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              Organizational Training Catalog & Departmental Enablement
            </h3>
            <p className="text-xs text-zinc-400">Courses published across HR, Product, Marketing, IT, and Legal</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
            {["all", "Security", "Service", "Compliance", "Product"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-lg font-medium capitalize transition ${
                  activeCategory === cat ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {cat === "all" ? "All Courses" : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCourses.map((c) => (
            <div key={c.id} className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400">{c.code}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        c.isMandatory
                          ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                          : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                      }`}
                    >
                      {c.isMandatory ? "Mandatory Compliance" : "Recommended Enablement"}
                    </span>
                  </div>
                  <h4 className="font-bold text-zinc-100 text-sm mt-1">{c.title}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                    <Building className="h-3 w-3 text-zinc-500" />
                    Published by: <span className="text-zinc-300 font-medium">{c.department}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-y border-zinc-800/80 text-[11px]">
                <div>
                  <span className="text-zinc-500 block text-[10px]">Duration</span>
                  <span className="font-mono text-zinc-200 font-medium">{c.durationMinutes} Mins</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Pass Mark</span>
                  <span className="font-mono text-zinc-200 font-medium">{c.passingScore}%</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Recurrence</span>
                  <span className="font-mono text-zinc-200 font-medium">
                    {c.validityPeriodMonths ? `Every ${c.validityPeriodMonths} Mos` : "One-Time"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-zinc-400 text-[11px]">
                  {c.completedCount} of {c.enrolledCount} workforce members completed
                </span>
                <button
                  onClick={() => setRetrainFeedback(`Enrolled all new hires into [${c.title}] successfully.`)}
                  className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition flex items-center gap-1"
                >
                  <span>Assign to Cohort</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
