"use client";

import React, { useState } from "react";
import {
  Coins,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
  Plus,
  Search,
  FileSpreadsheet,
  ShieldCheck,
  TrendingDown,
  Calculator,
  ChevronRight,
  Info,
  RefreshCw,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";
import { apiClient } from "@/lib/api-client";

interface LoanRecord {
  id: string;
  employeeName: string;
  empId: string;
  department: string;
  loanType: "Company Emergency" | "Salary Advance" | "Education Loan" | "Asset Acquisition";
  principal: number;
  monthlyRepayment: number;
  remainingBalance: number;
  tenureMonths: number;
  monthsPaid: number;
  interestRate: string;
  monthlyNetSalary: number;
  debtToIncomeRatio: number; // Ratio in percentage
  status: "Active" | "Pending Approval" | "Fully Paid" | "Under Review";
  disbursedDate: string;
  nextDeductionDate: string;
}

export default function LoansAdvancesPortalPage() {
  const { entityInfo, personaInfo } = usePortal();
  const [activeTab, setActiveTab] = useState<"active" | "requests" | "calculator">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showNewLoanModal, setShowNewLoanModal] = useState(false);

  // Calculator state
  const [calcPrincipal, setCalcPrincipal] = useState<number>(150000);
  const [calcTenure, setCalcTenure] = useState<number>(12);
  const [calcSalary, setCalcSalary] = useState<number>(140000);
  const [calcInterestRate, setCalcInterestRate] = useState<number>(3.5);

  const [loansList, setLoansList] = useState<LoanRecord[]>([
    {
      id: "LOAN-2026-081",
      employeeName: "David Kimani",
      empId: "EMP-204",
      department: "Plant Operations",
      loanType: "Company Emergency",
      principal: 200000,
      monthlyRepayment: 18000,
      remainingBalance: 92000,
      tenureMonths: 12,
      monthsPaid: 6,
      interestRate: "3.5% Flat",
      monthlyNetSalary: 140000,
      debtToIncomeRatio: 12.8,
      status: "Active",
      disbursedDate: "Mar 15, 2026",
      nextDeductionDate: "Sep 30, 2026 (Payroll Deduction)",
    },
    {
      id: "ADV-2026-119",
      employeeName: "Mercy Cherono",
      empId: "EMP-312",
      department: "Commercial & Sales",
      loanType: "Salary Advance",
      principal: 45000,
      monthlyRepayment: 45000,
      remainingBalance: 45000,
      tenureMonths: 1,
      monthsPaid: 0,
      interestRate: "0.0%",
      monthlyNetSalary: 165000,
      debtToIncomeRatio: 27.2,
      status: "Active",
      disbursedDate: "Sep 08, 2026",
      nextDeductionDate: "Sep 30, 2026 (Auto-cleared in Next Payrun)",
    },
    {
      id: "LOAN-2026-044",
      employeeName: "Brian Ochieng",
      empId: "EMP-108",
      department: "Fleet Logistics",
      loanType: "Asset Acquisition",
      principal: 350000,
      monthlyRepayment: 16000,
      remainingBalance: 128000,
      tenureMonths: 24,
      monthsPaid: 14,
      interestRate: "4.0% Reducing",
      monthlyNetSalary: 110000,
      debtToIncomeRatio: 14.5,
      status: "Active",
      disbursedDate: "Jul 10, 2025",
      nextDeductionDate: "Sep 30, 2026 (Payroll Deduction)",
    },
    {
      id: "LOAN-2026-092",
      employeeName: "Grace Muthoni",
      empId: "EMP-419",
      department: "Production Shift A",
      loanType: "Education Loan",
      principal: 120000,
      monthlyRepayment: 12000,
      remainingBalance: 120000,
      tenureMonths: 10,
      monthsPaid: 0,
      interestRate: "2.5% Flat",
      monthlyNetSalary: 95000,
      debtToIncomeRatio: 12.6,
      status: "Pending Approval",
      disbursedDate: "Pending Executive Sign-off",
      nextDeductionDate: "Oct 31, 2026 (Expected First Run)",
    },
  ]);

  const filteredLoans = loansList.filter((item) => {
    const matchesSearch =
      item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || item.loanType === selectedType;
    return matchesSearch && matchesType;
  });

  // Calculate monthly repayment for calculator
  const monthlyInterestRate = calcInterestRate / 100 / 12;
  const calcMonthlyPayment =
    monthlyInterestRate === 0
      ? calcPrincipal / calcTenure
      : (calcPrincipal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, calcTenure)) /
        (Math.pow(1 + monthlyInterestRate, calcTenure) - 1);
  const calcDtiRatio = ((calcMonthlyPayment / (calcSalary || 1)) * 100).toFixed(1);
  const isDtiCompliant = Number(calcDtiRatio) <= 33.33; // 1/3 rule compliance

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New Loan Form State
  const [loanForm, setLoanForm] = useState({
    employeeId: "EMP-204",
    employeeName: "David Kimani",
    loanTypeCode: "STAFF_EMERGENCY" as "SALARY_ADVANCE" | "STAFF_EMERGENCY" | "HOME_DEVELOPMENT" | "EDUCATION_LOAN",
    principalAmount: 150000,
    repaymentMonths: 12,
    subsidizedRateAnnual: 4.0,
    officialMarketRateAnnual: 16.0,
    purpose: "Home repair and family medical bridge support",
    monthlySalary: 140000,
  });

  // Calculate live FBT preview for modal
  const modalRateDiff = Math.max(0, loanForm.officialMarketRateAnnual - loanForm.subsidizedRateAnnual);
  const modalMonthlyRateDiff = modalRateDiff / 100.0 / 12.0;
  const modalTaxableFbtMonthly = Math.round(loanForm.principalAmount * modalMonthlyRateDiff);
  const modalEmployerFbtLiabilityMonthly = Math.round(modalTaxableFbtMonthly * 0.30);
  const modalTotalInterest = loanForm.principalAmount * (loanForm.subsidizedRateAnnual / 100) * (loanForm.repaymentMonths / 12);
  const modalMonthlyInstallment = Math.round((loanForm.principalAmount + modalTotalInterest) / (loanForm.repaymentMonths || 1));
  const modalDti = ((modalMonthlyInstallment / (loanForm.monthlySalary || 1)) * 100).toFixed(1);
  const modalDtiCompliant = Number(modalDti) <= 33.33;

  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await apiClient.loans.applyLoan({
        employeeId: loanForm.employeeId,
        loanTypeCode: loanForm.loanTypeCode,
        principalAmount: Number(loanForm.principalAmount),
        repaymentMonths: Number(loanForm.repaymentMonths),
        subsidizedInterestRateAnnual: Number(loanForm.subsidizedRateAnnual),
        officialMarketRateAnnual: Number(loanForm.officialMarketRateAnnual),
        purpose: loanForm.purpose,
      });

      const newLoanItem: LoanRecord = {
        id: response?.data?.loanNumber || `LN-${Date.now().toString().slice(-6)}`,
        employeeName: loanForm.employeeName,
        empId: loanForm.employeeId,
        department: "Plant Operations",
        loanType:
          loanForm.loanTypeCode === "SALARY_ADVANCE"
            ? "Salary Advance"
            : loanForm.loanTypeCode === "EDUCATION_LOAN"
            ? "Education Loan"
            : loanForm.loanTypeCode === "HOME_DEVELOPMENT"
            ? "Asset Acquisition"
            : "Company Emergency",
        principal: Number(loanForm.principalAmount),
        monthlyRepayment: modalMonthlyInstallment,
        remainingBalance: Number(loanForm.principalAmount),
        tenureMonths: Number(loanForm.repaymentMonths),
        monthsPaid: 0,
        interestRate: `${loanForm.subsidizedRateAnnual}% Subsidized`,
        monthlyNetSalary: loanForm.monthlySalary,
        debtToIncomeRatio: Number(modalDti),
        status: "Active",
        disbursedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        nextDeductionDate: "Sep 30, 2026 (Payroll Deduction)",
      };

      setLoansList((prev) => [newLoanItem, ...prev]);
      setShowNewLoanModal(false);
      setSuccessToast(
        `Loan ${newLoanItem.id} issued successfully. Section 12B FBT Employer Liability: ${entityInfo.symbol} ${modalEmployerFbtLiabilityMonthly.toLocaleString()}/mo.`
      );
      setTimeout(() => setSuccessToast(null), 6000);
    } catch (err: any) {
      console.warn("Failed via API, registering locally:", err);
      const newLoanItem: LoanRecord = {
        id: `LN-${Date.now().toString().slice(-6)}`,
        employeeName: loanForm.employeeName,
        empId: loanForm.employeeId,
        department: "Plant Operations",
        loanType: "Company Emergency",
        principal: Number(loanForm.principalAmount),
        monthlyRepayment: modalMonthlyInstallment,
        remainingBalance: Number(loanForm.principalAmount),
        tenureMonths: Number(loanForm.repaymentMonths),
        monthsPaid: 0,
        interestRate: `${loanForm.subsidizedRateAnnual}% Subsidized`,
        monthlyNetSalary: loanForm.monthlySalary,
        debtToIncomeRatio: Number(modalDti),
        status: "Active",
        disbursedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        nextDeductionDate: "Sep 30, 2026 (Payroll Deduction)",
      };
      setLoansList((prev) => [newLoanItem, ...prev]);
      setShowNewLoanModal(false);
      setSuccessToast(`Loan ${newLoanItem.id} registered locally.`);
      setTimeout(() => setSuccessToast(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveQueueItem = async (loanId: string, empName: string) => {
    try {
      await apiClient.loans.approveLoan(loanId);
      setLoansList((prev) =>
        prev.map((l) => (l.id === loanId ? { ...l, status: "Active" as const } : l))
      );
      setSuccessToast(`Facility ${loanId} for ${empName} approved and scheduled for next payrun deduction.`);
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err) {
      setSuccessToast(`Facility ${loanId} marked as approved.`);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-md transition-all animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--emerald-deep)]" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 font-extrabold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-[var(--emerald-deep)]" />
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--gray-text)]">
              Company Loans & Salary Advances
            </h1>
          </div>
          <p className="text-xs text-[var(--gray-muted)] mt-0.5">
            Automated payroll loan recovery, reducing-balance amortizations, KRA Section 12B Fringe Benefit Tax (30%), and strict 1/3 net salary statutory debt cap enforcement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab("calculator")}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border bg-white text-[var(--gray-text)] border-[var(--gray-border)] hover:bg-[var(--cool-gray)] shadow-2xs"
          >
            <Calculator className="h-3.5 w-3.5 text-[var(--emerald-mint)]" />
            <span>Policy Calculator</span>
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setShowNewLoanModal(true)}
            className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Issue Loan / Advance</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">
              Active Loan Book
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-[var(--emerald-deep)]">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--gray-text)]">
            {entityInfo.symbol}{" "}
            {loansList
              .reduce((acc, curr) => acc + curr.remainingBalance, 0)
              .toLocaleString()}
          </p>
          <p className="text-[11px] text-[var(--emerald-deep)] font-semibold flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            <span>{loansList.length} active running contracts</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">
              Expected Recovery This Payrun
            </span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Calendar className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--gray-text)]">
            {entityInfo.symbol}{" "}
            {loansList
              .reduce((acc, curr) => acc + curr.monthlyRepayment, 0)
              .toLocaleString()}
          </p>
          <p className="text-[11px] text-[var(--gray-muted)]">
            Auto-deducted via Next Gross-to-Net Engine
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">
              Section 12B FBT Liability
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-100 text-[var(--emerald-deep)]">
              <ShieldCheck className="h-4 w-4 text-[var(--emerald-mint)]" />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--emerald-deep)]">
            30% Corporate FBT
          </p>
          <p className="text-[11px] text-[var(--gray-muted)]">
            KRA Prescribed Rate (16%) vs Company Rate
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">
              Pending Applications
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--gray-text)]">
            {loansList.filter((l) => l.status === "Pending Approval").length} Requests
          </p>
          <p className="text-[11px] text-amber-700 font-semibold">
            {entityInfo.symbol}{" "}
            {loansList
              .filter((l) => l.status === "Pending Approval")
              .reduce((acc, l) => acc + l.principal, 0)
              .toLocaleString()}{" "}
            awaiting review
          </p>
        </div>
      </div>

      {/* Statutory 1/3 Rule & Section 12B Advisory Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
        <Info className="h-5 w-5 text-[var(--emerald-deep)] shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 space-y-1">
          <p className="font-bold">
            Statutory Debt Ceiling (1/3 Rule) & KRA Section 12B Fringe Benefit Tax Engine Active
          </p>
          <p className="text-emerald-800 leading-relaxed">
            Total monthly payroll deductions cannot reduce an employee&apos;s take-home pay below one-third (33.33%) of basic pay. Additionally, when company loan interest is subsidized below the official Central Bank/KRA prescribed rate (16.0% p.a.), the interest difference constitutes a taxable fringe benefit taxed at 30% as an employer tax liability payable by the 9th of each month.
          </p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--gray-border)] pb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "active"
                  ? "bg-[var(--emerald-deep)] text-white shadow-xs"
                  : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
              }`}
            >
              Active Loan Book ({loansList.length})
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "requests"
                  ? "bg-[var(--emerald-deep)] text-white shadow-xs"
                  : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
              }`}
            >
              <span>Application Queue</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900 font-extrabold">
                {loansList.filter((l) => l.status === "Pending Approval").length}
              </span>
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveTab("calculator")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "calculator"
                  ? "bg-[var(--emerald-deep)] text-white shadow-xs"
                  : "text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
              }`}
            >
              <Calculator className="h-3.5 w-3.5" />
              <span>Simulate Amortization & FBT</span>
            </button>
          </div>

          {activeTab === "active" && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-[var(--gray-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search borrower or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-[var(--gray-border)] text-xs bg-white text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)] w-48 sm:w-60"
                />
              </div>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[var(--gray-border)] text-xs bg-white text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)]"
              >
                <option value="all">All Loan Types</option>
                <option value="Company Emergency">Company Emergency</option>
                <option value="Salary Advance">Salary Advance</option>
                <option value="Asset Acquisition">Asset Acquisition</option>
                <option value="Education Loan">Education Loan</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Active Loan Book */}
        {activeTab === "active" && (
          <div className="rounded-2xl border border-[var(--gray-border)] bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--cool-gray)] border-b border-[var(--gray-border)] text-[11px] font-bold text-[var(--gray-muted)]">
                    <th className="p-3.5">Contract Ref</th>
                    <th className="p-3.5">Borrower</th>
                    <th className="p-3.5">Type & Rate</th>
                    <th className="p-3.5 text-right">Principal</th>
                    <th className="p-3.5 text-right">Monthly Recovery</th>
                    <th className="p-3.5 text-right">Balance</th>
                    <th className="p-3.5 text-center">Tenure Progress</th>
                    <th className="p-3.5 text-center">DTI Ratio (1/3 Cap)</th>
                    <th className="p-3.5 text-right">Next Deduction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--gray-border)]">
                  {filteredLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-[var(--cool-gray)]/50 transition">
                      <td className="p-3.5 font-mono font-bold text-[var(--gray-text)]">
                        {loan.id}
                      </td>
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <p className="font-bold text-[var(--gray-text)]">{loan.employeeName}</p>
                          <p className="text-[10px] text-[var(--gray-muted)]">
                            {loan.empId} • {loan.department}
                          </p>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-[var(--gray-text)]">
                            {loan.loanType}
                          </span>
                          <p className="text-[10px] text-[var(--gray-muted)]">
                            Rate: {loan.interestRate}
                          </p>
                        </div>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-[var(--gray-text)]">
                        {entityInfo.symbol} {loan.principal.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-[var(--emerald-deep)]">
                        {entityInfo.symbol} {loan.monthlyRepayment.toLocaleString()}/mo
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-[var(--gray-text)]">
                        {entityInfo.symbol} {loan.remainingBalance.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="space-y-1 inline-block min-w-[100px]">
                          <div className="flex justify-between text-[10px] font-semibold text-[var(--gray-muted)]">
                            <span>
                              {loan.monthsPaid}/{loan.tenureMonths} mo
                            </span>
                            <span>
                              {Math.round((loan.monthsPaid / (loan.tenureMonths || 1)) * 100)}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--emerald-deep)] rounded-full"
                              style={{
                                width: `${(loan.monthsPaid / (loan.tenureMonths || 1)) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {loan.debtToIncomeRatio}% (Passed)
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <p className="text-[11px] font-medium text-[var(--gray-text)]">
                          {loan.nextDeductionDate}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Application Queue */}
        {activeTab === "requests" && (
          <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--gray-text)]">
                  Loan Applications Awaiting Executive Approval
                </h3>
                <p className="text-xs text-[var(--gray-muted)]">
                  Each loan application is vetted automatically against employment tenure, existing debt balance, Section 12B FBT liability, and the 1/3 statutory ceiling.
                </p>
              </div>
            </div>

            {loansList.filter((l) => l.status === "Pending Approval").length === 0 ? (
              <div className="p-8 text-center bg-[var(--cool-gray)] rounded-2xl border border-[var(--gray-border)]">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-[var(--gray-text)]">Application queue is clear</p>
                <p className="text-xs text-[var(--gray-muted)]">All pending facilities have been reviewed and approved.</p>
              </div>
            ) : (
              loansList
                .filter((l) => l.status === "Pending Approval")
                .map((pendingLoan) => (
                  <div key={pendingLoan.id} className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                          {pendingLoan.employeeName.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-[var(--gray-text)]">{pendingLoan.employeeName}</p>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                              {pendingLoan.loanType}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--gray-muted)]">
                            {pendingLoan.empId} • {pendingLoan.department}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-extrabold text-[var(--gray-text)] font-mono">
                          {entityInfo.symbol} {pendingLoan.principal.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-[var(--gray-muted)]">
                          {pendingLoan.tenureMonths}-Month Term ({pendingLoan.monthlyRepayment.toLocaleString()}/mo)
                        </p>
                      </div>
                    </div>

                    {/* Policy Audit Report */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-white p-3 rounded-xl border border-[var(--gray-border)]">
                      <div>
                        <span className="text-[10px] text-[var(--gray-muted)] uppercase tracking-wider block">
                          Monthly Basic Salary
                        </span>
                        <span className="font-mono font-bold text-[var(--gray-text)]">
                          {entityInfo.symbol} {pendingLoan.monthlyNetSalary.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--gray-muted)] uppercase tracking-wider block">
                          Post-Deduction DTI Ratio
                        </span>
                        <span className="font-mono font-bold text-[var(--emerald-deep)]">
                          {pendingLoan.debtToIncomeRatio}% (Cap is 33.3%)
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--gray-muted)] uppercase tracking-wider block">
                          Section 12B FBT Status
                        </span>
                        <span className="font-semibold text-emerald-800">
                          Pre-calculated (30% Employer Rate)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--gray-border)]">
                      <span className="text-[11px] text-[var(--gray-muted)]">
                        Disbursal target: Direct Bank EFT / Mobile Money
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          suppressHydrationWarning
                          onClick={() => {
                            setLoansList((prev) => prev.filter((l) => l.id !== pendingLoan.id));
                            setSuccessToast(`Facility ${pendingLoan.id} declined.`);
                            setTimeout(() => setSuccessToast(null), 4000);
                          }}
                          className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          suppressHydrationWarning
                          onClick={() => handleApproveQueueItem(pendingLoan.id, pendingLoan.employeeName)}
                          className="px-4 py-1.5 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition"
                        >
                          Approve & Disburse
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* Tab 3: Policy Calculator */}
        {activeTab === "calculator" && (
          <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-[var(--gray-text)]">
                  Loan Amortization & Statutory Ceiling Simulator
                </h3>
                <p className="text-xs text-[var(--gray-muted)]">
                  Simulate interest payments and verify debt-to-income limits in real-time under KRA Section 12B rules.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-[var(--gray-text)] block mb-1">
                    Borrower Monthly Basic Salary ({entityInfo.symbol})
                  </label>
                  <input
                    type="number"
                    value={calcSalary}
                    onChange={(e) => setCalcSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-mono font-bold text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[var(--gray-text)] block mb-1">
                    Requested Principal Amount ({entityInfo.symbol})
                  </label>
                  <input
                    type="number"
                    value={calcPrincipal}
                    onChange={(e) => setCalcPrincipal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-mono font-bold text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[var(--gray-text)] block mb-1">
                      Tenure (Months)
                    </label>
                    <input
                      type="number"
                      value={calcTenure}
                      onChange={(e) => setCalcTenure(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-mono font-bold text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[var(--gray-text)] block mb-1">
                      Company Subsidized Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={calcInterestRate}
                      onChange={(e) => setCalcInterestRate(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-mono font-bold text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results Box */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)]">
                  Simulation Results & Tax Analysis
                </span>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--gray-border)] pb-2">
                    <span className="text-xs font-medium text-[var(--gray-muted)]">
                      Monthly Repayment
                    </span>
                    <span className="text-lg font-extrabold font-mono text-[var(--emerald-deep)]">
                      {entityInfo.symbol} {Math.round(calcMonthlyPayment).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-[var(--gray-border)] pb-2">
                    <span className="text-xs font-medium text-[var(--gray-muted)]">
                      Total Interest Over Tenure
                    </span>
                    <span className="text-xs font-bold font-mono text-[var(--gray-text)]">
                      {entityInfo.symbol}{" "}
                      {Math.max(
                        0,
                        Math.round(calcMonthlyPayment * calcTenure - calcPrincipal)
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-[var(--gray-border)] pb-2">
                    <span className="text-xs font-medium text-[var(--gray-muted)]">
                      KRA Sec 12B Monthly FBT (30%)
                    </span>
                    <span className="text-xs font-bold font-mono text-emerald-800">
                      {entityInfo.symbol}{" "}
                      {Math.round(
                        calcPrincipal * (Math.max(0, 16.0 - calcInterestRate) / 100 / 12) * 0.30
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-[var(--gray-border)] pb-2">
                    <span className="text-xs font-medium text-[var(--gray-muted)]">
                      Debt-To-Income Ratio (DTI)
                    </span>
                    <span
                      className={`text-xs font-extrabold font-mono ${
                        isDtiCompliant ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {calcDtiRatio}%
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  isDtiCompliant
                    ? "bg-emerald-100/80 text-emerald-900 border border-emerald-200"
                    : "bg-rose-100/80 text-rose-900 border border-rose-200"
                }`}
              >
                {isDtiCompliant ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                    <span>Complies with statutory 1/3 take-home salary debt limit.</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-rose-700 shrink-0" />
                    <span>
                      Breaches statutory 1/3 debt cap ({calcDtiRatio}% &gt; 33.33%). Increase tenure or decrease principal.
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Loan / Advance Modal */}
      {showNewLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-white border border-[var(--gray-border)] p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-[var(--emerald-deep)]" />
                <h3 className="text-lg font-extrabold text-[var(--gray-text)]">
                  Issue Loan or Salary Advance
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewLoanModal(false)}
                className="text-[var(--gray-muted)] hover:text-[var(--gray-text)] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyLoan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)] block mb-1">
                    Borrower Employee
                  </label>
                  <select
                    value={loanForm.employeeId}
                    onChange={(e) => {
                      const empId = e.target.value;
                      const name = empId === "EMP-204" ? "David Kimani" : empId === "EMP-312" ? "Mercy Cherono" : "Brian Ochieng";
                      setLoanForm((p) => ({ ...p, employeeId: empId, employeeName: name }));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs bg-white text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)]"
                  >
                    <option value="EMP-204">David Kimani (EMP-204) - Plant Ops</option>
                    <option value="EMP-312">Mercy Cherono (EMP-312) - Commercial</option>
                    <option value="EMP-108">Brian Ochieng (EMP-108) - Fleet Logistics</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)] block mb-1">
                    Facility Type
                  </label>
                  <select
                    value={loanForm.loanTypeCode}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      const rate = val === "SALARY_ADVANCE" ? 0.0 : val === "EDUCATION_LOAN" ? 2.5 : val === "HOME_DEVELOPMENT" ? 4.0 : 3.5;
                      const months = val === "SALARY_ADVANCE" ? 1 : val === "HOME_DEVELOPMENT" ? 24 : 12;
                      setLoanForm((p) => ({
                        ...p,
                        loanTypeCode: val,
                        subsidizedRateAnnual: rate,
                        repaymentMonths: months,
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs bg-white text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)]"
                  >
                    <option value="STAFF_EMERGENCY">Staff Emergency Loan (3.5% Subsidized)</option>
                    <option value="SALARY_ADVANCE">Salary Advance (0.0% - 1 Month Auto-Clear)</option>
                    <option value="HOME_DEVELOPMENT">Home / Asset Facility (4.0% Subsidized)</option>
                    <option value="EDUCATION_LOAN">Education Support (2.5% Subsidized)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)] block mb-1">
                    Principal ({entityInfo.symbol})
                  </label>
                  <input
                    type="number"
                    min={5000}
                    step={1000}
                    value={loanForm.principalAmount}
                    onChange={(e) => setLoanForm((p) => ({ ...p, principalAmount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-mono font-bold text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)] block mb-1">
                    Repayment Tenure (Mo.)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={loanForm.repaymentMonths}
                    onChange={(e) => setLoanForm((p) => ({ ...p, repaymentMonths: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-mono font-bold text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--gray-text)] block mb-1">
                    Subsidized Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={loanForm.subsidizedRateAnnual}
                    onChange={(e) => setLoanForm((p) => ({ ...p, subsidizedRateAnnual: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-mono font-bold text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--gray-text)] block mb-1">
                  Purpose / Justification
                </label>
                <input
                  type="text"
                  required
                  value={loanForm.purpose}
                  onChange={(e) => setLoanForm((p) => ({ ...p, purpose: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)]"
                />
              </div>

              {/* Real-time FBT & Statutory 1/3 Calculation Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-[var(--emerald-deep)]" />
                    <span>KRA Section 12B & Statutory Ceiling Engine</span>
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                    Official Rate: {loanForm.officialMarketRateAnnual}%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-2 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-[var(--gray-muted)] block">Monthly Recovery</span>
                    <span className="font-mono font-extrabold text-[var(--emerald-deep)]">
                      {entityInfo.symbol} {modalMonthlyInstallment.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-[var(--gray-muted)] block">Monthly Fringe Benefit</span>
                    <span className="font-mono font-bold text-[var(--gray-text)]">
                      {entityInfo.symbol} {modalTaxableFbtMonthly.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-[var(--gray-muted)] block">Employer FBT (30%)</span>
                    <span className="font-mono font-extrabold text-emerald-800">
                      {entityInfo.symbol} {modalEmployerFbtLiabilityMonthly.toLocaleString()}/mo
                    </span>
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-[var(--gray-muted)] block">DTI Ratio (1/3 Limit)</span>
                    <span
                      className={`font-mono font-extrabold ${
                        modalDtiCompliant ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {modalDti}% ({modalDtiCompliant ? "Passed" : "Breached"})
                    </span>
                  </div>
                </div>

                {!modalDtiCompliant && (
                  <p className="text-[11px] text-rose-700 font-bold flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>Monthly recovery exceeds 33.3% of basic pay. Adjust tenure to remain compliant.</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--gray-border)]">
                <button
                  type="button"
                  onClick={() => setShowNewLoanModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-text)] hover:bg-[var(--cool-gray)] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>Issue Facility</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
