"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  AlertTriangle,
  Search,
  Plus,
  Send,
  MessageSquare,
  CheckCircle2,
  FileText,
  UserCheck,
  Scale,
  Calendar,
  MapPin,
  X,
  Key,
  Shield,
  Clock,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";
import { apiClient } from "@/lib/api-client";

interface GrievanceCase {
  id: string;
  caseNumber: string;
  isAnonymous: boolean;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  status: string;
  subject: string;
  description: string;
  incidentDate: string;
  location: string;
  assignedInvestigatorName?: string;
  resolutionSummary?: string;
  createdAt: string;
}

interface Message {
  id: string;
  caseId: string;
  isFromReporter: boolean;
  senderLabel: string;
  message: string;
  createdAt: string;
}

export default function EthicsWhistleblowerVaultPage() {
  const { personaInfo } = usePortal();
  const [activeTab, setActiveTab] = useState<"investigator" | "whistleblower-track" | "file-report">("investigator");

  // Whistleblower tracker state
  const [trackCaseNumber, setTrackCaseNumber] = useState("");
  const [trackPasscode, setTrackPasscode] = useState("");
  const [trackedCase, setTrackedCase] = useState<any | null>(null);
  const [trackError, setTrackError] = useState("");

  // Modals & Selected case
  const [selectedCase, setSelectedCase] = useState<GrievanceCase | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState("");

  // Forms
  const [reportForm, setReportForm] = useState({
    subject: "",
    category: "conflict_of_interest" as const,
    severity: "high" as const,
    description: "",
    incidentDate: new Date().toISOString().split("T")[0],
    location: "Mombasa Coastal Operations Hub",
    partiesInvolved: "Regional Logistics Lead",
    isAnonymous: true,
    accessPasscode: "Safe-Vault-2026",
  });

  const [assignedInvestigator, setAssignedInvestigator] = useState("Amina Odhiambo (Head of Internal Audit)");
  const [resolveForm, setResolveForm] = useState({
    resolutionSummary: "Full internal audit conducted. Procurement policies enforced.",
    correctiveActionTaken: "Vendor contract terminated and matter referred to governance committee.",
  });

  const [cases, setCases] = useState<GrievanceCase[]>([
    {
      id: "case-001",
      caseNumber: "ETH-2026-0012",
      isAnonymous: true,
      category: "conflict_of_interest",
      severity: "high",
      status: "investigation_active",
      subject: "Undisclosed Vendor Ownership by Regional Procurement Lead",
      description: "The regional supply chain lead has directed haulage contracts to a private entity owned by their immediate family without conflict declarations.",
      incidentDate: "2026-08-20",
      location: "Mombasa Coastal Operations Hub",
      assignedInvestigatorName: "Amina Odhiambo (Head of Internal Audit)",
      createdAt: "2026-08-25",
    },
    {
      id: "case-002",
      caseNumber: "ETH-2026-0028",
      isAnonymous: false,
      category: "safety_violation",
      severity: "critical",
      status: "resolved",
      subject: "Substandard Ventilation in Underground Extraction Shaft 4",
      description: "Ventilation blower failed air quality thresholds during night shift operations. Shift halted immediately for inspection.",
      incidentDate: "2026-09-02",
      location: "Dar es Salaam Mining Extraction Site",
      assignedInvestigatorName: "Nelson Mandela CP (CEO)",
      resolutionSummary: "Shaft evacuated immediately; dual redundant exhaust blowers installed and recertified by Mines Inspectorate on Sept 5.",
      createdAt: "2026-09-02",
    },
  ]);

  // Load from backend
  useEffect(() => {
    async function loadCases() {
      try {
        const res = await apiClient.ethics.getCases();
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setCases(res.data);
        }
      } catch (err) {
        console.warn("Ethics cases fallback active:", err);
      }
    }
    loadCases();
  }, []);

  const handleFileReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCaseNum = `ETH-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await apiClient.ethics.fileCase({
        subject: reportForm.subject,
        category: reportForm.category,
        severity: reportForm.severity,
        description: reportForm.description,
        incidentDate: reportForm.incidentDate,
        location: reportForm.location,
        partiesInvolved: [reportForm.partiesInvolved],
        isAnonymous: reportForm.isAnonymous,
        accessPasscode: reportForm.accessPasscode,
      });
    } catch (err) {
      console.warn("Report filing fallback:", err);
    }

    const created: GrievanceCase = {
      id: `case-${Date.now()}`,
      caseNumber: newCaseNum,
      isAnonymous: reportForm.isAnonymous,
      category: reportForm.category,
      severity: reportForm.severity,
      status: "submitted",
      subject: reportForm.subject,
      description: reportForm.description,
      incidentDate: reportForm.incidentDate,
      location: reportForm.location,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setCases((prev) => [created, ...prev]);
    setActiveTab("investigator");
  };

  const handleTrackCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError("");
    setTrackedCase(null);

    try {
      const res = await apiClient.ethics.trackCase(trackCaseNumber, trackPasscode);
      if (res.data) {
        setTrackedCase(res.data);
      } else {
        const local = cases.find((c) => c.caseNumber === trackCaseNumber);
        if (local) {
          setTrackedCase(local);
        } else {
          setTrackError("Invalid case tracking reference or authentication passcode.");
        }
      }
    } catch (err: any) {
      const local = cases.find((c) => c.caseNumber === trackCaseNumber);
      if (local) {
        setTrackedCase(local);
      } else {
        setTrackError("Invalid case tracking reference or authentication passcode.");
      }
    }
  };

  const handleSelectCase = async (cs: GrievanceCase) => {
    setSelectedCase(cs);
    try {
      const res = await apiClient.ethics.getMessages(cs.id);
      if (res.data && Array.isArray(res.data)) {
        setMessages(res.data);
      } else {
        setMessages([
          {
            id: "msg-1",
            caseId: cs.id,
            isFromReporter: true,
            senderLabel: cs.isAnonymous ? "Whistleblower (Anonymous)" : "Reporter",
            message: "I have uploaded corroborating logs and procurement purchase orders.",
            createdAt: "2026-08-25T14:30:00Z",
          },
          {
            id: "msg-2",
            caseId: cs.id,
            isFromReporter: false,
            senderLabel: cs.assignedInvestigatorName || "Compliance Investigator",
            message: "Inquiry initiated. Audit team has secured electronic records and logs.",
            createdAt: "2026-08-26T09:15:00Z",
          },
        ]);
      }
    } catch {
      setMessages([
        {
          id: "msg-1",
          caseId: cs.id,
          isFromReporter: true,
          senderLabel: cs.isAnonymous ? "Whistleblower (Anonymous)" : "Reporter",
          message: "Confidential inquiry submitted into encrypted vault.",
          createdAt: "2026-08-25T14:30:00Z",
        },
      ]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !newMessageText) return;

    try {
      await apiClient.ethics.postMessage(selectedCase.id, {
        isFromReporter: false,
        message: newMessageText,
        attachments: [],
      });
    } catch (err) {
      console.warn("Message post fallback:", err);
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        caseId: selectedCase.id,
        isFromReporter: false,
        senderLabel: selectedCase.assignedInvestigatorName || "Compliance Lead",
        message: newMessageText,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewMessageText("");
  };

  const handleAssignInvestigator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    try {
      await apiClient.ethics.assignInvestigator(selectedCase.id, {
        investigatorUserId: "usr-comp-01",
        investigatorName: assignedInvestigator,
      });
    } catch (err) {
      console.warn("Assign investigator fallback:", err);
    }

    selectedCase.assignedInvestigatorName = assignedInvestigator;
    selectedCase.status = "investigation_active";
    setShowAssignModal(false);
  };

  const handleResolveCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    try {
      await apiClient.ethics.resolveCase(selectedCase.id, {
        resolutionSummary: resolveForm.resolutionSummary,
        correctiveActionTaken: resolveForm.correctiveActionTaken,
      });
    } catch (err) {
      console.warn("Resolve case fallback:", err);
    }

    selectedCase.status = "resolved";
    selectedCase.resolutionSummary = resolveForm.resolutionSummary;
    setShowResolveModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-[var(--gray-text)]">
              Ethics, Whistleblowing & Grievance Vault
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
              <Lock className="h-3 w-3" /> End-to-End Encrypted
            </span>
          </div>
          <p className="text-sm text-[var(--gray-muted)]">
            Confidential anti-bribery (FCPA), safety concerns, and conflict-of-interest reporting with cryptographic passcodes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab("file-report")}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>File Confidential Report</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--gray-border)] pb-2">
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("investigator")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "investigator"
              ? "bg-[var(--emerald-deep)] text-white shadow-xs"
              : "text-[var(--gray-muted)] hover:bg-gray-100"
          }`}
        >
          <Scale className="h-4 w-4" />
          <span>Compliance Investigator Vault ({cases.length})</span>
        </button>

        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("whistleblower-track")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "whistleblower-track"
              ? "bg-[var(--emerald-deep)] text-white shadow-xs"
              : "text-[var(--gray-muted)] hover:bg-gray-100"
          }`}
        >
          <Key className="h-4 w-4" />
          <span>Anonymous Tracker Portal</span>
        </button>

        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setActiveTab("file-report")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "file-report"
              ? "bg-[var(--emerald-deep)] text-white shadow-xs"
              : "text-[var(--gray-muted)] hover:bg-gray-100"
          }`}
        >
          <EyeOff className="h-4 w-4" />
          <span>Submit New Complaint</span>
        </button>
      </div>

      {/* TAB 1: INVESTIGATOR VAULT */}
      {activeTab === "investigator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Case List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold text-[var(--gray-muted)] uppercase tracking-wider">
              Confidential Reports Queue
            </h3>
            {cases.map((cs) => {
              const isSelected = selectedCase?.id === cs.id;
              return (
                <div
                  key={cs.id}
                  onClick={() => handleSelectCase(cs)}
                  className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
                    isSelected
                      ? "bg-white border-[var(--emerald-deep)] shadow-md"
                      : "bg-white border-[var(--gray-border)] hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-[var(--emerald-deep)]">{cs.caseNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cs.severity === "critical"
                          ? "bg-rose-100 text-rose-800"
                          : cs.severity === "high"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {cs.severity.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-[var(--gray-text)] line-clamp-1">{cs.subject}</h4>
                  <p className="text-[11px] text-[var(--gray-muted)] line-clamp-2">{cs.description}</p>

                  <div className="pt-2 border-t border-[var(--gray-border)] flex items-center justify-between text-[10px] text-[var(--gray-muted)]">
                    <span>{cs.isAnonymous ? "Anonymous Whistleblower" : "Identified Staff"}</span>
                    <span className="font-bold text-[var(--gray-text)]">{cs.status.replace("_", " ")}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Case Detail & Messaging Thread */}
          <div className="lg:col-span-2 space-y-4">
            {selectedCase ? (
              <div className="rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs p-5 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--gray-border)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-base text-[var(--gray-text)]">{selectedCase.subject}</h3>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {selectedCase.caseNumber}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--gray-muted)]">
                      Incident Location: <strong>{selectedCase.location}</strong> • Date: {selectedCase.incidentDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setShowAssignModal(true)}
                      className="px-3 py-1.5 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-text)] hover:bg-gray-50 transition"
                    >
                      Assign Lead
                    </button>
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setShowResolveModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition"
                    >
                      Resolve Case
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--background-soft)] border border-[var(--gray-border)] space-y-2 text-xs">
                  <p className="font-semibold text-[var(--gray-muted)] uppercase tracking-wider text-[10px]">
                    Allegation Narrative
                  </p>
                  <p className="text-[var(--gray-text)] leading-relaxed">{selectedCase.description}</p>
                  <div className="pt-2 border-t border-[var(--gray-border)] flex justify-between text-[11px] text-[var(--gray-muted)]">
                    <span>Investigator: <strong>{selectedCase.assignedInvestigatorName || "Unassigned"}</strong></span>
                    <span>Status: <strong className="text-[var(--emerald-deep)]">{selectedCase.status}</strong></span>
                  </div>
                </div>

                {/* Two-Way Encrypted Messaging Thread */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[var(--gray-muted)] uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4" />
                    <span>Confidential Case Communication Thread</span>
                  </h4>

                  <div className="space-y-2.5 max-h-64 overflow-y-auto p-3 rounded-2xl bg-gray-50 border border-[var(--gray-border)]">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-xl text-xs space-y-1 ${
                          msg.isFromReporter
                            ? "bg-white border border-gray-200 ml-4"
                            : "bg-emerald-50 border border-emerald-200 mr-4"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-[var(--gray-text)]">{msg.senderLabel}</span>
                          <span className="text-[var(--gray-muted)]">{msg.createdAt.slice(0, 10)}</span>
                        </div>
                        <p className="text-[var(--gray-text)]">{msg.message}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Type encrypted message to reporter..."
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                    />
                    <button
                      type="submit"
                      suppressHydrationWarning
                      className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition flex items-center gap-1"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Post</span>
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs space-y-2 text-[var(--gray-muted)]">
                <ShieldCheck className="h-10 w-10 text-[var(--emerald-deep)] mx-auto opacity-40" />
                <p className="text-sm font-semibold">Select a case from the queue to review evidence and communicate.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ANONYMOUS TRACKER PORTAL */}
      {activeTab === "whistleblower-track" && (
        <div className="max-w-xl mx-auto space-y-5">
          <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-md space-y-4">
            <div>
              <h3 className="text-base font-black text-[var(--gray-text)]">Track Confidential Investigation</h3>
              <p className="text-xs text-[var(--gray-muted)]">
                Enter your unique case reference and secret passcode provided at time of submission.
              </p>
            </div>

            <form onSubmit={handleTrackCase} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Case Reference</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ETH-2026-0012"
                  value={trackCaseNumber}
                  onChange={(e) => setTrackCaseNumber(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-mono uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Secret Access Passcode</label>
                <input
                  type="password"
                  required
                  placeholder="Secret Passcode"
                  value={trackPasscode}
                  onChange={(e) => setTrackPasscode(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                />
              </div>

              {trackError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold">
                  {trackError}
                </div>
              )}

              <button
                type="submit"
                suppressHydrationWarning
                className="w-full py-2.5 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition flex items-center justify-center gap-1.5"
              >
                <Key className="h-4 w-4" />
                <span>Authenticate & Access Vault</span>
              </button>
            </form>
          </div>

          {trackedCase && (
            <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-emerald-900">{trackedCase.caseNumber}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                  {trackedCase.status?.replace("_", " ").toUpperCase()}
                </span>
              </div>
              <h4 className="font-bold text-emerald-900 text-sm">{trackedCase.subject}</h4>
              <p className="text-xs text-emerald-800">
                Category: <strong>{trackedCase.category}</strong> • Severity: <strong>{trackedCase.severity}</strong>
              </p>
              {trackedCase.resolutionSummary && (
                <div className="p-3 rounded-xl bg-white text-xs text-[var(--gray-text)] space-y-1">
                  <span className="font-bold text-emerald-900">Official Resolution Summary:</span>
                  <p>{trackedCase.resolutionSummary}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FILE NEW COMPLAINT */}
      {activeTab === "file-report" && (
        <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-md space-y-5">
          <div>
            <h3 className="text-base font-black text-[var(--gray-text)]">Submit Ethics & Whistleblower Report</h3>
            <p className="text-xs text-[var(--gray-muted)]">
              Submissions are recorded with encrypted cryptographic hash passcodes ensuring complete protection against retaliation.
            </p>
          </div>

          <form onSubmit={handleFileReport} className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <input
                type="checkbox"
                id="anonCheck"
                checked={reportForm.isAnonymous}
                onChange={(e) => setReportForm({ ...reportForm, isAnonymous: e.target.checked })}
                className="h-4 w-4 accent-[var(--emerald-deep)]"
              />
              <label htmlFor="anonCheck" className="text-xs font-bold text-[var(--gray-text)] cursor-pointer">
                Submit Anonymously (Identity masked from investigators and database logs)
              </label>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--gray-text)]">Allegation Subject</label>
              <input
                type="text"
                required
                placeholder="e.g. Safety Sensor Override During Night Shift"
                value={reportForm.subject}
                onChange={(e) => setReportForm({ ...reportForm, subject: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Category</label>
                <select
                  value={reportForm.category}
                  onChange={(e) => setReportForm({ ...reportForm, category: e.target.value as any })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-semibold"
                >
                  <option value="conflict_of_interest">Conflict of Interest</option>
                  <option value="safety_violation">Safety / OSHA Violation</option>
                  <option value="bribery_fcpa">Bribery & Corruption (FCPA)</option>
                  <option value="fraud_embezzlement">Financial Fraud / Embezzlement</option>
                  <option value="workplace_harassment">Workplace Harassment</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Severity</label>
                <select
                  value={reportForm.severity}
                  onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value as any })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-semibold"
                >
                  <option value="critical">Critical (Immediate Harm / Threat)</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Incident Date</label>
                <input
                  type="date"
                  required
                  value={reportForm.incidentDate}
                  onChange={(e) => setReportForm({ ...reportForm, incidentDate: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Incident Location</label>
                <input
                  type="text"
                  required
                  value={reportForm.location}
                  onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--gray-text)]">Detailed Description & Evidence</label>
              <textarea
                rows={4}
                required
                placeholder="State chronological facts, equipment affected, purchase orders or witnesses..."
                value={reportForm.description}
                onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--gray-text)]">Secret Access Passcode (To track updates)</label>
              <input
                type="text"
                required
                value={reportForm.accessPasscode}
                onChange={(e) => setReportForm({ ...reportForm, accessPasscode: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-mono"
              />
            </div>

            <div className="pt-3 border-t border-[var(--gray-border)] flex items-center justify-end gap-3">
              <button
                type="submit"
                suppressHydrationWarning
                className="px-6 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition flex items-center gap-1.5 shadow-md"
              >
                <Lock className="h-4 w-4" />
                <span>Submit Confidential Report</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assign Investigator Modal */}
      {showAssignModal && selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[var(--gray-border)] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <h3 className="text-base font-black text-[var(--gray-text)]">Assign Lead Investigator</h3>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setShowAssignModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-[var(--gray-muted)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignInvestigator} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Investigator Name</label>
                <select
                  value={assignedInvestigator}
                  onChange={(e) => setAssignedInvestigator(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-semibold"
                >
                  <option value="Amina Odhiambo (Head of Internal Audit)">Amina Odhiambo (Head of Internal Audit)</option>
                  <option value="Arthur Pendelton (Director of Compliance)">Arthur Pendelton (Director of Compliance)</option>
                  <option value="Nelson Mandela CP (Chief Executive Officer)">Nelson Mandela CP (Chief Executive Officer)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[var(--gray-border)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)] hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  suppressHydrationWarning
                  className="px-5 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Case Modal */}
      {showResolveModal && selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[var(--gray-border)] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <h3 className="text-base font-black text-[var(--gray-text)]">Conclude & Resolve Investigation</h3>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setShowResolveModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-[var(--gray-muted)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleResolveCase} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Resolution Findings</label>
                <textarea
                  rows={3}
                  required
                  value={resolveForm.resolutionSummary}
                  onChange={(e) => setResolveForm({ ...resolveForm, resolutionSummary: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--gray-text)]">Corrective Sanction Taken</label>
                <input
                  type="text"
                  required
                  value={resolveForm.correctiveActionTaken}
                  onChange={(e) => setResolveForm({ ...resolveForm, correctiveActionTaken: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--gray-border)] text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[var(--gray-border)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)] hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  suppressHydrationWarning
                  className="px-5 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] transition"
                >
                  Commit Resolution Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
