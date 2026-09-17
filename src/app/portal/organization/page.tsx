"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Building2,
  Users,
  Network,
  Award,
  DollarSign,
  Plus,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Car,
  HeartPulse,
  Sparkles,
  MapPin,
  Globe,
  Briefcase,
  X,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";
import { apiClient } from "@/lib/api-client";

interface Subsidiary {
  name: string;
  countryCode: string;
  currency: string;
  employeeCount: number;
  departments: { name: string; code: string; headcount: number }[];
}

export default function OrganizationStructurePage() {
  const { entity, entityInfo } = usePortal();
  const [activeTab, setActiveTab] = useState<"hierarchy" | "departments" | "matrix" | "grades">("hierarchy");
  const [expandedSubsidiary, setExpandedSubsidiary] = useState<string | null>("Mandela Kenya Ltd");

  // Modals
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);

  // Data states
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([
    {
      name: "Mandela Kenya Ltd",
      countryCode: "KEN",
      currency: "KES",
      employeeCount: 1680,
      departments: [
        { name: "Engineering & Technology", code: "ENG", headcount: 48 },
        { name: "Finance & Accounting", code: "FIN", headcount: 18 },
        { name: "Operations & Supply Chain", code: "OPS", headcount: 120 },
        { name: "People, Culture & Legal", code: "HR-LEGAL", headcount: 12 },
      ],
    },
    {
      name: "Mandela Uganda Ltd",
      countryCode: "UGA",
      currency: "UGX",
      employeeCount: 210,
      departments: [
        { name: "Uganda Operations & Fleet", code: "UG-OPS", headcount: 150 },
        { name: "Uganda Commercial & Sales", code: "UG-COMM", headcount: 60 },
      ],
    },
    {
      name: "Mandela Tanzania Ltd",
      countryCode: "TZA",
      currency: "TZS",
      employeeCount: 158,
      departments: [
        { name: "Tanzania Mining Logistics", code: "TZ-MIN", headcount: 120 },
        { name: "Tanzania Finance & Admin", code: "TZ-FIN", headcount: 38 },
      ],
    },
  ]);

  const [reportingLines, setReportingLines] = useState([
    {
      id: "rep-01",
      employeeName: "Kennedy Omondi",
      employeeRole: "Senior Plant Logistics Supervisor",
      managerName: "Amara Diallo",
      managerRole: "Director of Operations",
      reportingType: "primary_direct",
      scope: "Operational Line Authority",
    },
    {
      id: "rep-02",
      employeeName: "Kennedy Omondi",
      employeeRole: "Senior Plant Logistics Supervisor",
      managerName: "David Mutua",
      managerRole: "VP Engineering",
      reportingType: "dotted_line_matrix",
      scope: "Depot Automation Strategy",
    },
    {
      id: "rep-03",
      employeeName: "Jean-Pierre Dubois",
      employeeRole: "Regional Mining Logistics Director",
      managerName: "Nelson Mandela CP",
      managerRole: "Chief Executive Officer",
      reportingType: "functional_lead",
      scope: "Cross-Border East Africa Freight",
    },
  ]);

  const [jobGrades, setJobGrades] = useState([
    {
      gradeCode: "G1",
      gradeName: "Operations & Office Associate",
      rank: 1,
      minSalary: 50000,
      midSalary: 75000,
      maxSalary: 100000,
      carEligible: false,
      leaveDays: 21,
      healthTier: "employee_only",
      inpatient: 1000000,
      outpatient: 100000,
    },
    {
      gradeCode: "G5",
      gradeName: "Senior Software Engineer / Team Lead",
      rank: 5,
      minSalary: 250000,
      midSalary: 350000,
      maxSalary: 450000,
      carEligible: false,
      leaveDays: 24,
      healthTier: "full_family",
      inpatient: 2500000,
      outpatient: 200000,
    },
    {
      gradeCode: "M1",
      gradeName: "Department Head / Director",
      rank: 8,
      minSalary: 550000,
      midSalary: 750000,
      maxSalary: 950000,
      carEligible: true,
      leaveDays: 28,
      healthTier: "full_family",
      inpatient: 5000000,
      outpatient: 350000,
    },
    {
      gradeCode: "EXEC-1",
      gradeName: "C-Suite Executive / Vice President",
      rank: 10,
      minSalary: 1000000,
      midSalary: 1500000,
      maxSalary: 2200000,
      carEligible: true,
      leaveDays: 30,
      healthTier: "executive_unlimited",
      inpatient: 10000000,
      outpatient: 500000,
    },
  ]);

  // Form states
  const [newDeptForm, setNewDeptForm] = useState({
    name: "",
    code: "",
    costCenterCode: "CC-105",
    headOfDepartment: "",
  });

  const [newMatrixForm, setNewMatrixForm] = useState({
    employeeName: "",
    managerName: "",
    reportingType: "dotted_line_matrix" as const,
    scope: "",
  });

  // Load from backend
  useEffect(() => {
    async function loadOrg() {
      try {
        const hierRes = await apiClient.organization.getHierarchy();
        if (hierRes.data?.holdingCompany?.subsidiaries) {
          setSubsidiaries(hierRes.data.holdingCompany.subsidiaries);
        }
        const gradesRes = await apiClient.jobGrades.getGrades();
        if (gradesRes.data && Array.isArray(gradesRes.data)) {
          // synced
        }
      } catch (err) {
        console.warn("Org hierarchy fallback active:", err);
      }
    }
    loadOrg();
  }, []);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.organization.createDepartment({
        name: newDeptForm.name,
        code: newDeptForm.code,
      });
    } catch (err) {
      console.warn("Create department fallback:", err);
    }

    setSubsidiaries((prev) =>
      prev.map((sub, i) =>
        i === 0
          ? {
              ...sub,
              departments: [
                ...sub.departments,
                { name: newDeptForm.name, code: newDeptForm.code, headcount: 1 },
              ],
            }
          : sub
      )
    );
    setShowDeptModal(false);
  };

  const handleAssignMatrix = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.organization.assignReportingLine({
        employeeId: "emp-new",
        managerEmployeeId: "mgr-new",
        reportingType: newMatrixForm.reportingType,
      });
    } catch (err) {
      console.warn("Assign reporting line fallback:", err);
    }

    setReportingLines((prev) => [
      {
        id: `rep-${Date.now()}`,
        employeeName: newMatrixForm.employeeName || "Alex Mwangi",
        employeeRole: "Principal Systems Engineer",
        managerName: newMatrixForm.managerName || "Sarah Wanjiku",
        managerRole: "VP of People Operations",
        reportingType: newMatrixForm.reportingType,
        scope: newMatrixForm.scope || "Functional Program Lead",
      },
      ...prev,
    ]);
    setShowMatrixModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-[var(--gray-text)]">
              Organization Structure & Job Grades
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
              Multi-Entity
            </span>
          </div>
          <p className="text-sm text-[var(--gray-muted)]">
            Pan-African entity tree, matrix dotted-line reporting lines, and Job Grade (G1–G10) compensation bands.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "departments" && (
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setShowDeptModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>New Department</span>
            </button>
          )}
          {activeTab === "matrix" && (
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setShowMatrixModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition shadow-xs"
            >
              <Network className="h-4 w-4" />
              <span>Assign Matrix Line</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--gray-border)] pb-2">
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("hierarchy")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "hierarchy"
              ? "bg-[var(--emerald-deep)] text-white shadow-xs"
              : "text-[var(--gray-muted)] hover:bg-gray-100"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Entity Tree</span>
        </button>

        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("departments")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "departments"
              ? "bg-[var(--emerald-deep)] text-white shadow-xs"
              : "text-[var(--gray-muted)] hover:bg-gray-100"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Departments & Cost Centers</span>
        </button>

        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("matrix")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "matrix"
              ? "bg-[var(--emerald-deep)] text-white shadow-xs"
              : "text-[var(--gray-muted)] hover:bg-gray-100"
          }`}
        >
          <Network className="h-4 w-4" />
          <span>Matrix & Dotted Lines</span>
        </button>

        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("grades")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "grades"
              ? "bg-[var(--emerald-deep)] text-white shadow-xs"
              : "text-[var(--gray-muted)] hover:bg-gray-100"
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Job Grades & Benefit Matrix</span>
        </button>
      </div>

      {/* TAB 1: ENTITY TREE */}
      {activeTab === "hierarchy" && (
        <div className="space-y-4">
          {/* Holding Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Mandela Global Holdings Ltd</h3>
                  <p className="text-xs text-slate-300">Parent Corporate Holding • Headquarters: Nairobi, Kenya</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Total Workforce: 2,048
                </span>
              </div>
            </div>
          </div>

          {/* Subsidiaries Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subsidiaries.map((sub) => {
              const isExpanded = expandedSubsidiary === sub.name;
              return (
                <div
                  key={sub.name}
                  className="rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs p-5 space-y-4 hover:border-[var(--emerald-deep)] transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                        {sub.countryCode} • {sub.currency}
                      </span>
                      <h4 className="font-bold text-[var(--gray-text)] text-sm mt-1">{sub.name}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-[var(--emerald-deep)] font-mono">{sub.employeeCount}</p>
                      <p className="text-[10px] text-[var(--gray-muted)]">Employees</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[var(--gray-border)]">
                    <p className="text-xs font-bold text-[var(--gray-muted)] uppercase tracking-wider">
                      Assigned Departments ({sub.departments.length})
                    </p>
                    <div className="space-y-1.5">
                      {sub.departments.map((d) => (
                        <div
                          key={d.code}
                          className="flex items-center justify-between text-xs p-2 rounded-lg bg-[var(--background-soft)]"
                        >
                          <span className="font-semibold text-[var(--gray-text)]">{d.name}</span>
                          <span className="font-mono text-[var(--gray-muted)] font-bold">{d.headcount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS & COST CENTERS */}
      {activeTab === "departments" && (
        <div className="rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--background-soft)] text-[var(--gray-muted)] text-[11px] font-bold uppercase tracking-wider border-b border-[var(--gray-border)]">
              <tr>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Cost Center</th>
                <th className="py-3 px-4">Headcount</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--gray-border)]">
              {subsidiaries[0].departments.map((dept, i) => (
                <tr key={dept.code} className="hover:bg-[var(--background-soft)]/50 transition">
                  <td className="py-3.5 px-4 font-bold text-[var(--gray-text)]">{dept.name}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-[var(--gray-muted)]">{dept.code}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                      CC-{101 + i}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[var(--emerald-deep)]">{dept.headcount} Active</td>
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Operational
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: MATRIX & DOTTED LINES */}
      {activeTab === "matrix" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-blue-600 shrink-0" />
              <span>
                Dual-reporting structure: Supports primary direct operational line managers as well as dotted-line matrix leads for cross-station projects.
              </span>
            </div>
            <span className="font-bold text-blue-700">{reportingLines.length} Matrix Assignments</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reportingLines.map((line) => (
              <div key={line.id} className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      line.reportingType === "primary_direct"
                        ? "bg-emerald-100 text-emerald-800"
                        : line.reportingType === "dotted_line_matrix"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {line.reportingType.replace(/_/g, " ").toUpperCase()}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] text-[var(--gray-muted)] font-bold uppercase">Supervised Employee</p>
                  <p className="font-bold text-[var(--gray-text)] text-sm">{line.employeeName}</p>
                  <p className="text-xs text-[var(--gray-muted)]">{line.employeeRole}</p>
                </div>

                <div className="pt-2 border-t border-[var(--gray-border)]">
                  <p className="text-[10px] text-[var(--gray-muted)] font-bold uppercase">Reporting Manager</p>
                  <p className="font-bold text-[var(--emerald-deep)] text-sm">{line.managerName}</p>
                  <p className="text-xs text-[var(--gray-muted)]">{line.managerRole}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--background-soft)] text-xs text-[var(--gray-text)] font-semibold">
                  Scope: {line.scope}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: JOB GRADES & BENEFIT MATRIX */}
      {activeTab === "grades" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[var(--gray-border)] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[var(--gray-text)]">Enterprise Salary Bands & Benefits</h3>
                <p className="text-xs text-[var(--gray-muted)]">
                  Linked directly to health cover limits, annual leave days, and executive company car eligibility.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--background-soft)] text-[var(--gray-muted)] text-[11px] font-bold uppercase tracking-wider border-b border-[var(--gray-border)]">
                  <tr>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">Salary Range (KES / mo)</th>
                    <th className="py-3 px-4">Leave Entitlement</th>
                    <th className="py-3 px-4">Company Car</th>
                    <th className="py-3 px-4">Inpatient Limit</th>
                    <th className="py-3 px-4">Outpatient Limit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--gray-border)]">
                  {jobGrades.map((g) => (
                    <tr key={g.gradeCode} className="hover:bg-[var(--background-soft)]/50 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-black text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-mono">
                          {g.gradeCode}
                        </span>
                        <p className="font-bold text-xs text-[var(--gray-text)] mt-1">{g.gradeName}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <p className="font-bold text-[var(--gray-text)]">
                          {g.minSalary.toLocaleString()} – {g.maxSalary.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-[var(--gray-muted)]">Mid: {g.midSalary.toLocaleString()}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-[var(--gray-text)]">
                        {g.leaveDays} Working Days
                      </td>
                      <td className="py-3.5 px-4">
                        {g.carEligible ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Car className="h-3 w-3" /> Eligible (Sec 5(4))
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--gray-muted)]">Standard Commuter</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-blue-700">
                        KES {g.inpatient.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-blue-700">
                        KES {g.outpatient.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[var(--gray-border)] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <h3 className="text-base font-black text-[var(--gray-text)]">Add Corporate Department</h3>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setShowDeptModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-[var(--gray-muted)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDept} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quality Assurance & Lab Diagnostics"
                  value={newDeptForm.name}
                  onChange={(e) => setNewDeptForm({ ...newDeptForm, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)]">Department Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. QA-LAB"
                    value={newDeptForm.code}
                    onChange={(e) => setNewDeptForm({ ...newDeptForm, code: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)]">Cost Center Code</label>
                  <input
                    type="text"
                    required
                    value={newDeptForm.costCenterCode}
                    onChange={(e) => setNewDeptForm({ ...newDeptForm, costCenterCode: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--gray-border)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)] hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  suppressHydrationWarning
                  className="px-5 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Matrix Modal */}
      {showMatrixModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[var(--gray-border)] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <h3 className="text-base font-black text-[var(--gray-text)]">Assign Matrix Reporting Line</h3>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setShowMatrixModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-[var(--gray-muted)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignMatrix} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Employee Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kennedy Omondi"
                  value={newMatrixForm.employeeName}
                  onChange={(e) => setNewMatrixForm({ ...newMatrixForm, employeeName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Reporting Line Manager</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Mutua (VP Engineering)"
                  value={newMatrixForm.managerName}
                  onChange={(e) => setNewMatrixForm({ ...newMatrixForm, managerName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Reporting Mode</label>
                <select
                  value={newMatrixForm.reportingType}
                  onChange={(e) => setNewMatrixForm({ ...newMatrixForm, reportingType: e.target.value as any })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-semibold"
                >
                  <option value="dotted_line_matrix">Dotted-Line Matrix Lead</option>
                  <option value="functional_lead">Functional Subject Matter Lead</option>
                  <option value="primary_direct">Primary Direct Line Manager</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Scope of Authority</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pan-African Depot Automation"
                  value={newMatrixForm.scope}
                  onChange={(e) => setNewMatrixForm({ ...newMatrixForm, scope: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[var(--gray-border)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShowMatrixModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)] hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  suppressHydrationWarning
                  className="px-5 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition"
                >
                  Assign Reporting Line
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
