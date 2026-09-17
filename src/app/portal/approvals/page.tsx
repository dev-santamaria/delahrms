"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  CalendarDays,
  Receipt,
  Clock,
  Repeat,
  Plane,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  ChevronRight,
  ShieldCheck,
  User,
  ArrowRight,
  Check,
  X,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";

interface ApprovalItem {
  id: string;
  category: "leave" | "expense" | "timesheet" | "shift_swap" | "travel";
  title: string;
  applicantName: string;
  applicantCode: string;
  applicantDept: string;
  amountOrDuration: string;
  submittedAt: string;
  details: string;
  policyCheck: string;
  status: "pending" | "approved" | "rejected";
  auditNotes?: string;
  receiptUrl?: string;
}

export default function ApprovalsPage() {
  const { entityInfo, personaInfo } = usePortal();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const [items, setItems] = useState<ApprovalItem[]>([
    {
      id: "app-lev-101",
      category: "leave",
      title: "Annual Leave Application (4 Days)",
      applicantName: "David Omondi",
      applicantCode: "EMP-2190",
      applicantDept: "Plant Logistics & FIFO Crew",
      amountOrDuration: "4 Business Days (Oct 12 - Oct 15)",
      submittedAt: "Today, 08:30 AM",
      details: "Family emergency travel to Kisumu. Handover checklist completed with Shift B Supervisor.",
      policyCheck: "Accrued balance: 18 days remaining. Satisfies 7-day advance notice window.",
      status: "pending",
    },
    {
      id: "app-exp-202",
      category: "expense",
      title: "Emergency Boiler Valve Replacement (Fiscal eTIMS)",
      applicantName: "Sarah Jenkins",
      applicantCode: "EMP-3104",
      applicantDept: "Industrial Maintenance",
      amountOrDuration: "KES 68,500.00 • Electronic Tax Invoice",
      submittedAt: "Today, 09:15 AM",
      details: "Emergency purchase of high-pressure gasket from authorised supplier to prevent plant line halt.",
      policyCheck: "Valid KRA eTIMS QR-code fiscal invoice attached. Pre-approved emergency envelope.",
      status: "pending",
      receiptUrl: "https://example.com/receipt-etims-1049.pdf",
    },
    {
      id: "app-trv-303",
      category: "travel",
      title: "Regional Plant Audit Per Diem Advance",
      applicantName: "Kennedy Omondi",
      applicantCode: "EMP-008",
      applicantDept: "Operations Leadership",
      amountOrDuration: "KES 54,000.00 • M-Pesa Disbursal",
      submittedAt: "Yesterday, 04:00 PM",
      details: "4-day technical audit trip between Kisumu Depot and Nairobi Industrial Plant.",
      policyCheck: "Complies with Tier 2 regional travel policy (KES 13,500/day lodging & meals).",
      status: "pending",
    },
    {
      id: "app-swp-404",
      category: "shift_swap",
      title: "Mutual 24/7 Shift Swap (Night to Afternoon)",
      applicantName: "Grace Muthoni ⇄ John Mwangi",
      applicantCode: "EMP-5011 / EMP-5019",
      applicantDept: "Continuous 3-Shift Plant Crew",
      amountOrDuration: "Night (22:00-06:00) ⇄ Afternoon (14:00-22:00)",
      submittedAt: "Yesterday, 02:45 PM",
      details: "Mutual exchange agreed for Friday shift rotation. Both operators fully certified on Line 2.",
      policyCheck: "12-Hour Rest Guard verified: 14.5 hours rest before next scheduled shift.",
      status: "pending",
    },
    {
      id: "app-tme-505",
      category: "timesheet",
      title: "Overtime Authorization (6 Hours)",
      applicantName: "Engineer Alex Kiprop",
      applicantCode: "EMP-4102",
      applicantDept: "Electrical Engineering",
      amountOrDuration: "6.0 Hours (1.5x Regular Hourly Rate)",
      submittedAt: "Sep 15, 11:20 AM",
      details: "Turbine maintenance shutdown overrun during scheduled weekend grid maintenance.",
      policyCheck: "Biometric kiosk timestamps match geofenced plant records. Within monthly 20hr cap.",
      status: "pending",
    },
  ]);

  const handleApprove = (id: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, status: "approved", auditNotes: "Approved by Line Manager with SHA-256 signature seal" }
          : it
      )
    );
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const handleRejectConfirm = () => {
    if (!selectedItem) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === selectedItem.id
          ? { ...it, status: "rejected", auditNotes: `Rejected: ${rejectionReason || "Criteria not met"}` }
          : it
      )
    );
    setRejectModalOpen(false);
    setSelectedItem(null);
    setRejectionReason("");
  };

  const handleBatchApproveAll = () => {
    setItems((prev) =>
      prev.map((it) =>
        it.status === "pending"
          ? { ...it, status: "approved", auditNotes: "Batch approved via Manager Queue" }
          : it
      )
    );
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.applicantCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const pendingCount = items.filter((i) => i.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Line Manager Cockpit
            </span>
            <span className="text-xs font-mono text-[var(--gray-muted)]">
              Delegation of Authority: Active ($5,000 Cap)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--gray-text)] mt-1">
            Universal Approvals Hub
          </h1>
          <p className="text-xs text-[var(--gray-muted)] mt-0.5">
            Multi-tier workflow authorizations for leave, fiscal expense claims, travel advances, shift swaps, and overtime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <button
              type="button"
              onClick={handleBatchApproveAll}
              className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] shadow-xs transition flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Approve All Pending ({pendingCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Category Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--gray-border)] pb-2 overflow-x-auto">
        {[
          { key: "all", label: "All Items", icon: CheckSquare, count: items.filter((i) => i.status === "pending").length },
          { key: "leave", label: "Leave Requests", icon: CalendarDays, count: items.filter((i) => i.category === "leave" && i.status === "pending").length },
          { key: "expense", label: "Expense Claims", icon: Receipt, count: items.filter((i) => i.category === "expense" && i.status === "pending").length },
          { key: "travel", label: "Travel Advances", icon: Plane, count: items.filter((i) => i.category === "travel" && i.status === "pending").length },
          { key: "shift_swap", label: "Shift Swaps", icon: Repeat, count: items.filter((i) => i.category === "shift_swap" && i.status === "pending").length },
          { key: "timesheet", label: "Timesheets & OT", icon: Clock, count: items.filter((i) => i.category === "timesheet" && i.status === "pending").length },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeCategory === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveCategory(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "bg-white text-[var(--emerald-deep)] border border-[var(--gray-border)] shadow-xs"
                  : "text-[var(--gray-muted)] hover:text-[var(--gray-text)] hover:bg-gray-100/60"
              }`}
            >
              <IconComp className={`h-3.5 w-3.5 ${isActive ? "text-[var(--emerald-deep)]" : ""}`} />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive ? "bg-[var(--emerald-light)] text-[var(--emerald-deep)]" : "bg-gray-100 text-gray-700"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-[var(--gray-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by employee name, code (EMP-...), or request title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[var(--gray-border)] text-xs text-[var(--gray-text)] placeholder:text-[var(--gray-muted)] focus:outline-none focus:border-[var(--emerald-deep)] shadow-2xs"
          />
        </div>
      </div>

      {/* 4. Approvals List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-[var(--gray-border)] text-center space-y-2">
            <CheckCircle2 className="h-10 w-10 text-[var(--emerald-mint)] mx-auto" />
            <h3 className="text-sm font-bold text-[var(--gray-text)]">All Clear! No Pending Approvals</h3>
            <p className="text-xs text-[var(--gray-muted)] max-w-sm mx-auto">
              There are no pending requests matching your current filter criteria.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isApproved = item.status === "approved";
            const isRejected = item.status === "rejected";

            return (
              <div
                key={item.id}
                className={`p-5 rounded-3xl bg-white border transition shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  isApproved
                    ? "border-emerald-200 bg-emerald-50/20"
                    : isRejected
                    ? "border-rose-200 bg-rose-50/20"
                    : "border-[var(--gray-border)] hover:border-zinc-300"
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="h-11 w-11 rounded-2xl bg-[var(--cool-gray)] text-[var(--emerald-deep)] border border-[var(--gray-border)] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {item.applicantName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-[var(--gray-text)]">{item.title}</h3>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 uppercase">
                        {item.category.replace("_", " ")}
                      </span>
                      {isApproved && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Approved
                        </span>
                      )}
                      {isRejected && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                          Rejected
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-[var(--gray-muted)] flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-zinc-700">{item.applicantName}</span>
                      <span>({item.applicantCode})</span>
                      <span>•</span>
                      <span>{item.applicantDept}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px] font-bold text-[var(--emerald-deep)]">{item.amountOrDuration}</span>
                    </div>

                    <p className="text-[11px] text-zinc-600 line-clamp-1">{item.details}</p>

                    <div className="pt-1 flex items-center gap-2 text-[10px] text-emerald-800">
                      <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                      <span className="font-medium">{item.policyCheck}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-text)] hover:bg-gray-50 transition shadow-2xs"
                  >
                    View Details
                  </button>

                  {item.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedItem(item);
                          setRejectModalOpen(true);
                        }}
                        className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                        title="Reject Request"
                      >
                        <X className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApprove(item.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Item Detail Modal */}
      {selectedItem && !rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-[var(--gray-border)] shadow-2xl p-6 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-[var(--emerald-deep)]" />
                <h3 className="text-base font-bold text-[var(--gray-text)]">
                  Approval Request Review
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[var(--emerald-deep)] text-white flex items-center justify-center font-bold text-sm">
                {selectedItem.applicantName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--gray-text)]">{selectedItem.applicantName}</p>
                <p className="text-xs text-[var(--gray-muted)]">{selectedItem.applicantDept} • {selectedItem.applicantCode}</p>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Submitted {selectedItem.submittedAt}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--gray-muted)]">Request Subject</span>
                <p className="text-sm font-bold text-[var(--gray-text)]">{selectedItem.title}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--gray-muted)]">Amount / Duration</span>
                <p className="text-base font-mono font-extrabold text-[var(--emerald-deep)]">{selectedItem.amountOrDuration}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--gray-muted)]">Applicant Justification Statement</span>
                <p className="text-xs text-zinc-700 p-3 rounded-xl bg-gray-50 border border-gray-100 leading-relaxed">
                  {selectedItem.details}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-bold text-emerald-900 uppercase">Policy Adherence Engine</span>
                <p className="text-xs text-emerald-800 font-medium">{selectedItem.policyCheck}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)] hover:bg-gray-100"
              >
                Close
              </button>

              {selectedItem.status === "pending" && (
                <>
                  <button
                    type="button"
                    onClick={() => setRejectModalOpen(true)}
                    className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold"
                  >
                    Reject...
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedItem.id)}
                    className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs"
                  >
                    Approve & Sign Digitally
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Rejection Reason Modal */}
      {rejectModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[var(--gray-border)] shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-rose-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Reject Authorization Request</span>
            </h3>
            <p className="text-xs text-[var(--gray-muted)]">
              Please state the formal operational reason for rejecting this request. This will be recorded in the audit trail and emailed to the applicant.
            </p>

            <textarea
              rows={3}
              required
              placeholder="e.g. Schedule conflicts with mandatory turnaround or missing supporting fiscal receipt..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-[var(--gray-border)] focus:outline-none focus:border-rose-500 bg-gray-50"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)] hover:bg-gray-100"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
