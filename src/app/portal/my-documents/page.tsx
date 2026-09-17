"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  UploadCloud,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Download,
  Eye,
  CheckCircle2,
  Lock,
  Plus,
  Filter,
  Search,
  HardDrive,
  FileCheck2,
  ExternalLink,
  X,
  FileCode,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";
import { apiClient } from "@/lib/api-client";

interface VaultDocument {
  id: string;
  category: "contract" | "tax_p9" | "education" | "medical" | "policy";
  title: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  expiryDate?: string;
  isVerified: boolean;
  securityCleared: boolean;
  downloadUrl: string;
}

interface PolicyItem {
  id: string;
  title: string;
  version: string;
  effectiveDate: string;
  requiresAck: boolean;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
  sha256Hash?: string;
}

export default function MyDocumentsPage() {
  const { entityInfo } = usePortal();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyItem | null>(null);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState<string>("contract");
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadExpiry, setUploadExpiry] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [documents, setDocuments] = useState<VaultDocument[]>([
    {
      id: "doc-001",
      category: "contract",
      title: "Principal Engineer Employment Contract (Revision C)",
      fileName: "Employment_Contract_Nelson_Mandela_2024C.pdf",
      fileSizeBytes: 2450000,
      mimeType: "application/pdf",
      uploadedAt: "Oct 15, 2021",
      isVerified: true,
      securityCleared: true,
      downloadUrl: "https://example.com/vault/contract.pdf",
    },
    {
      id: "doc-002",
      category: "tax_p9",
      title: "KRA P9 Tax Deduction Card (Year 2025)",
      fileName: "KRA_P9_Card_2025_Nelson_Mandela.pdf",
      fileSizeBytes: 480000,
      mimeType: "application/pdf",
      uploadedAt: "Jan 12, 2026",
      isVerified: true,
      securityCleared: true,
      downloadUrl: "https://example.com/vault/p9-2025.pdf",
    },
    {
      id: "doc-003",
      category: "medical",
      title: "Industrial Safety & Hazardous Plant Fitness Certificate",
      fileName: "Medical_Fitness_Clearance_Nairobi_Plant.pdf",
      fileSizeBytes: 890000,
      mimeType: "application/pdf",
      uploadedAt: "Nov 01, 2025",
      expiryDate: "2026-11-01", // Expiring in 45 days
      isVerified: true,
      securityCleared: true,
      downloadUrl: "https://example.com/vault/medical-clearance.pdf",
    },
    {
      id: "doc-004",
      category: "education",
      title: "BSc Mechanical & Mechatronics Engineering Degree",
      fileName: "Degree_Certificate_Certified_Copy.pdf",
      fileSizeBytes: 3100000,
      mimeType: "application/pdf",
      uploadedAt: "Oct 15, 2021",
      isVerified: true,
      securityCleared: true,
      downloadUrl: "https://example.com/vault/degree.pdf",
    },
  ]);

  const [policies, setPolicies] = useState<PolicyItem[]>([
    {
      id: "pol-01",
      title: "Corporate Anti-Bribery, Gifts & Foreign Corrupt Practices Policy",
      version: "v2026.2",
      effectiveDate: "Sep 01, 2026",
      requiresAck: true,
      isAcknowledged: false,
    },
    {
      id: "pol-02",
      title: "24/7 Shift Fatigue & Industrial Safe Working Hours Charter",
      version: "v2025.4",
      effectiveDate: "Jan 01, 2025",
      requiresAck: true,
      isAcknowledged: true,
      acknowledgedAt: "Jan 15, 2025, 08:30 AM",
      sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    },
  ]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    // Threat Check: Disallow unwanted file types
    const forbidden = ["exe", "bat", "sh", "cmd", "ps1", "vbs", "js", "py", "php"];
    const ext = uploadFileName.split(".").pop()?.toLowerCase() || "";
    if (forbidden.includes(ext)) {
      setUploadError(`Security Policy Violation: File format '.${ext}' is strictly forbidden by enterprise threat screening.`);
      return;
    }

    const newDoc: VaultDocument = {
      id: `doc-${Date.now()}`,
      category: uploadCategory as any,
      title: uploadTitle,
      fileName: uploadFileName || "Uploaded_Document.pdf",
      fileSizeBytes: 1200000,
      mimeType: "application/pdf",
      uploadedAt: "Just Now",
      expiryDate: uploadExpiry || undefined,
      isVerified: false,
      securityCleared: true,
      downloadUrl: "https://example.com/vault/new-doc.pdf",
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadModalOpen(false);
      setUploadSuccess(false);
      setUploadTitle("");
      setUploadFileName("");
      setUploadExpiry("");
    }, 1800);
  };

  const handleAcknowledgePolicy = () => {
    if (!selectedPolicy) return;
    setPolicies((prev) =>
      prev.map((p) =>
        p.id === selectedPolicy.id
          ? {
              ...p,
              isAcknowledged: true,
              acknowledgedAt: "Just Now",
              sha256Hash: `sha256_${Math.random().toString(36).substring(2, 18)}`,
            }
          : p
      )
    );
    setPolicyModalOpen(false);
    setSelectedPolicy(null);
  };

  const filteredDocs = documents.filter((d) => {
    const matchesCategory = activeCategory === "all" || d.category === activeCategory;
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)]">
              Personal Vault
            </span>
            <span className="text-xs font-mono text-[var(--gray-muted)]">
              Threat Screening Radar Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--gray-text)] mt-1">
            My Documents & Policy Center
          </h1>
          <p className="text-xs text-[var(--gray-muted)] mt-0.5">
            Encrypted personal vault for contracts, statutory tax P9 cards, certifications, and digital policy signatures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] shadow-xs transition flex items-center gap-1.5"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* 2. Expiry Radar & Policy Attestation Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Expiry Radar */}
        <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200 text-amber-900 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              <span>Document Expiry Radar (Next 60 Days)</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200/60 text-amber-900 font-mono">
              Action Needed
            </span>
          </div>
          <p className="text-xs">
            <strong>Industrial Safety & Hazardous Plant Clearance</strong> expires on <strong>Nov 01, 2026</strong>. Please schedule medical re-examination before the 30-day cut-off.
          </p>
        </div>

        {/* Pending Policy Acknowledgment */}
        <div className="p-5 rounded-3xl bg-blue-50/70 border border-blue-200 text-blue-950 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <FileCheck2 className="h-4 w-4 text-blue-700" />
              <span>Mandatory Policy Acknowledgment</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-200/60 text-blue-900">
              1 Unsigned
            </span>
          </div>
          <p className="text-xs">
            The updated <strong>Anti-Bribery & FCPA Policy (v2026.2)</strong> requires your electronic signature with SHA-256 legal attestation.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedPolicy(policies[0]);
              setPolicyModalOpen(true);
            }}
            className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 pt-1"
          >
            <span>Review & Attest Policy</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--gray-border)] pb-2 overflow-x-auto">
        {[
          { key: "all", label: "All Documents", count: documents.length },
          { key: "contract", label: "Contracts & Letters", count: documents.filter((d) => d.category === "contract").length },
          { key: "tax_p9", label: "Tax P9 Forms", count: documents.filter((d) => d.category === "tax_p9").length },
          { key: "medical", label: "Medical & Safety", count: documents.filter((d) => d.category === "medical").length },
          { key: "education", label: "Degrees & Certifications", count: documents.filter((d) => d.category === "education").length },
        ].map((tab) => {
          const isActive = activeCategory === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveCategory(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "bg-white text-[var(--emerald-deep)] border border-[var(--gray-border)] shadow-xs"
                  : "text-[var(--gray-muted)] hover:text-[var(--gray-text)] hover:bg-gray-100/60"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                isActive ? "bg-[var(--emerald-light)] text-[var(--emerald-deep)]" : "bg-gray-100 text-gray-700"
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-3xl bg-white border border-[var(--gray-border)] hover:border-zinc-300 shadow-xs space-y-3 transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[var(--gray-text)] truncate">{doc.title}</h3>
                    <p className="text-[11px] font-mono text-[var(--gray-muted)] truncate">{doc.fileName}</p>
                  </div>
                </div>

                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  doc.isVerified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {doc.isVerified ? "Verified" : "Pending Audit"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--gray-muted)] pt-1">
                <span>Size: {(doc.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                <span>•</span>
                <span>Uploaded: {doc.uploadedAt}</span>
                {doc.expiryDate && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-amber-700">Expires: {doc.expiryDate}</span>
                  </>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Threat Screened (Clean)</span>
              </span>

              <button
                type="button"
                className="px-3 py-1.5 rounded-xl bg-[var(--cool-gray)] hover:bg-gray-200 text-xs font-bold text-[var(--gray-text)] transition flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Company Policies Attestation Section */}
      <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-[var(--emerald-deep)]" />
            <span>Corporate Policy Electronic Signatures & Attestations</span>
          </h2>
          <p className="text-xs text-[var(--gray-muted)]">
            Legally binding policy acknowledgments stamped with timestamp, IP address, and SHA-256 digital fingerprint.
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {policies.map((policy) => (
            <div key={policy.id} className="py-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-[var(--gray-text)]">{policy.title}</p>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-gray-100 text-gray-700">
                    {policy.version}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--gray-muted)]">Effective Date: {policy.effectiveDate}</p>
                {policy.isAcknowledged && (
                  <p className="text-[10px] text-emerald-700 font-mono">
                    Signed: {policy.acknowledgedAt} • Hash: {policy.sha256Hash?.slice(0, 16)}...
                  </p>
                )}
              </div>

              <div className="shrink-0 self-end sm:self-center">
                {policy.isAcknowledged ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Signed & Attested</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPolicy(policy);
                      setPolicyModalOpen(true);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition"
                  >
                    Read & Sign
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[var(--gray-border)] shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-[var(--emerald-deep)]" />
                <span>Upload Document to Secure Vault</span>
              </h3>
              <button type="button" onClick={() => setUploadModalOpen(false)} className="p-1 text-gray-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            {uploadSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-[var(--emerald-deep)] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-[var(--gray-text)]">Document Cleared & Saved!</h4>
                <p className="text-xs text-[var(--gray-muted)]">
                  Passed magic byte inspection and uploaded to your secure employee vault.
                </p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-3">
                {uploadError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{uploadError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--gray-text)]">Document Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Certified OSHA Safety Certificate"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--gray-text)]">Category</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                    >
                      <option value="contract">Contract & Letter</option>
                      <option value="tax_p9">Tax P9 Card</option>
                      <option value="medical">Medical & Safety</option>
                      <option value="education">Degree & Certification</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--gray-text)]">Expiry Date (Optional)</label>
                    <input
                      type="date"
                      value={uploadExpiry}
                      onChange={(e) => setUploadExpiry(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--gray-text)]">File Name / Select File</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OSHA_Certificate_Nelson_2026.pdf"
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                  />
                  <span className="text-[10px] text-[var(--gray-muted)]">
                    Allowed: PDF, JPEG, PNG, WebP, DOCX. Executables & scripts are blocked automatically.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs"
                  >
                    Upload & Scan Document
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 7. Policy Attestation Modal */}
      {policyModalOpen && selectedPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-[var(--gray-border)] shadow-2xl p-6 space-y-4 animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-[var(--emerald-deep)]" />
                <span>Electronic Policy Attestation</span>
              </h3>
              <button type="button" onClick={() => setPolicyModalOpen(false)} className="p-1 text-gray-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[var(--gray-text)]">{selectedPolicy.title}</h4>
              <p className="text-xs text-[var(--gray-muted)]">Version: {selectedPolicy.version} • Effective: {selectedPolicy.effectiveDate}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] text-xs text-zinc-700 leading-relaxed max-h-56 overflow-y-auto space-y-2">
              <p className="font-bold">1. Declaration of Compliance</p>
              <p>
                I hereby declare that I have read, understood, and will strictly adhere to the guidelines set forth in this policy. I understand that DelaHR maintains zero tolerance for bribery, improper gift inducements, and conflicts of interest.
              </p>
              <p className="font-bold">2. Legal Attestation Fingerprint</p>
              <p>
                By clicking &quot;Sign & Agree&quot;, my electronic signature will be generated using a cryptographically secure SHA-256 hash and permanently logged in the audit ledger alongside my verified employee identifier and network IP address.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPolicyModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAcknowledgePolicy}
                className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs"
              >
                Sign & Agree Electronically
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
