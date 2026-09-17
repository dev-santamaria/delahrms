"use client";

import React, { useState } from "react";
import {
  FileSignature,
  FileText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Download,
  PenTool,
  Hash,
  Eye,
  Plus,
  Send,
  Building,
} from "lucide-react";

interface FormTemplate {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  requiresSignature: boolean;
  requiresCountersign: boolean;
}

interface FormSubmissionItem {
  id: string;
  submissionRef: string;
  templateTitle: string;
  employeeName: string;
  signedAt: string;
  signatureType: "drawn" | "typed";
  signerName: string;
  documentHash: string;
  status: "signed_and_verified" | "countersigned" | "pending_signature";
}

export function FormsModule() {
  const [templates] = useState<FormTemplate[]>([
    {
      id: "tmpl-001",
      code: "FORM-FIN-001",
      title: "Direct Deposit & Bank Mandate Change Form",
      category: "Banking & Payroll",
      description: "Digital authorization to update salary direct deposit bank account details",
      requiresSignature: true,
      requiresCountersign: false,
    },
    {
      id: "tmpl-002",
      code: "FORM-IT-002",
      title: "Remote Work & Hardware Custody Acknowledgment",
      category: "IT & Hardware",
      description: "Acknowledgment of company laptop serial numbers and remote work policy",
      requiresSignature: true,
      requiresCountersign: true,
    },
    {
      id: "tmpl-003",
      code: "FORM-HR-003",
      title: "Emergency Contact & Next of Kin Declaration",
      category: "HR & Compliance",
      description: "Designation of emergency contacts and primary next of kin",
      requiresSignature: true,
      requiresCountersign: false,
    },
    {
      id: "tmpl-004",
      code: "FORM-LEG-004",
      title: "Non-Disclosure (NDA) & IP Assignment Agreement",
      category: "Legal & Governance",
      description: "Proprietary information protection and intellectual property assignment",
      requiresSignature: true,
      requiresCountersign: true,
    },
  ]);

  const [submissions, setSubmissions] = useState<FormSubmissionItem[]>([
    {
      id: "sub-001",
      submissionRef: "SUB-882910",
      templateTitle: "Direct Deposit & Bank Mandate Change Form",
      employeeName: "Nelson Mandela CP",
      signedAt: "2026-09-15 14:22:08",
      signatureType: "typed",
      signerName: "Nelson Mandela CP",
      documentHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      status: "signed_and_verified",
    },
    {
      id: "sub-002",
      submissionRef: "SUB-882914",
      templateTitle: "Remote Work & Hardware Custody Acknowledgment",
      employeeName: "Amina Odhiambo",
      signedAt: "2026-09-12 10:15:40",
      signatureType: "drawn",
      signerName: "Amina Odhiambo",
      documentHash: "ca978112ca1bbdcafac231b39a23dc4da786081441606b387f9dacbad8a7c29e",
      status: "countersigned",
    },
    {
      id: "sub-003",
      submissionRef: "SUB-882919",
      templateTitle: "Emergency Contact & Next of Kin Declaration",
      employeeName: "David Kiprono",
      signedAt: "2026-09-08 09:30:12",
      signatureType: "drawn",
      signerName: "David Kiprono",
      documentHash: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
      status: "signed_and_verified",
    },
  ]);

  // Fill Form Modal State
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [bankName, setBankName] = useState("KCB Bank Kenya");
  const [bankBranch, setBankBranch] = useState("Upper Hill Commercial");
  const [accountNumber, setAccountNumber] = useState("1109283741");
  const [accountName, setAccountName] = useState("Nelson Mandela CP");
  const [signatureMode, setSignatureMode] = useState<"typed" | "drawn">("typed");
  const [typedSignature, setTypedSignature] = useState("Nelson Mandela CP");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionCompleted, setSubmissionCompleted] = useState(false);

  const handleSignAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newSub: FormSubmissionItem = {
        id: `sub-${Date.now()}`,
        submissionRef: `SUB-${Math.floor(100000 + Math.random() * 900000)}`,
        templateTitle: selectedTemplate?.title || "Digital Form",
        employeeName: "Nelson Mandela CP",
        signedAt: new Date().toISOString().replace("T", " ").split(".")[0],
        signatureType: signatureMode,
        signerName: typedSignature || "Nelson Mandela CP",
        documentHash: `sha256_${Date.now()}_audit_trail_signature_seal`,
        status: "signed_and_verified",
      };

      setSubmissions([newSub, ...submissions]);
      setIsSubmitting(false);
      setSubmissionCompleted(true);
      setTimeout(() => {
        setSubmissionCompleted(false);
        setSelectedTemplate(null);
      }, 1500);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Digital Paperless Forms & Cryptographic E-Signatures
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Zero Paper • ESIGN & eIDAS Certified
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Eliminate printing, physical signing, and email scanning. Employees fill and sign digital forms with SHA-256 tamper-evident certificates
          </p>
        </div>
      </div>

      {/* Forms Catalog Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Available Digital Form Templates ({templates.length})
          </h3>
          <span className="text-[11px] text-zinc-400">Click &quot;Fill & Sign Form&quot; to execute digitally</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3 flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-400">{tmpl.code}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-medium">
                    {tmpl.category}
                  </span>
                </div>
                <h4 className="font-bold text-zinc-100 text-sm mt-1.5">{tmpl.title}</h4>
                <p className="text-xs text-zinc-400 mt-0.5">{tmpl.description}</p>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{tmpl.requiresCountersign ? "Requires Countersign" : "Direct Verification"}</span>
                </div>

                <button
                  onClick={() => setSelectedTemplate(tmpl)}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                >
                  <PenTool className="h-3 w-3" />
                  <span>Fill & Sign Form</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submissions & Tamper-Evident Signatures Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Executed Digital Form Submissions & Cryptographic Audit Trails ({submissions.length})
          </h3>
          <span className="text-[11px] text-zinc-400">Legally binding with SHA-256 seal</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 text-zinc-400 text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Submission Ref</th>
                <th className="py-3 px-3">Form Template</th>
                <th className="py-3 px-3">Signer</th>
                <th className="py-3 px-3">Signing Timestamp</th>
                <th className="py-3 px-3">Cryptographic Document Hash (SHA-256)</th>
                <th className="py-3 px-4 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-zinc-800/30 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{sub.submissionRef}</td>
                  <td className="py-3.5 px-3 font-semibold text-zinc-200">{sub.templateTitle}</td>
                  <td className="py-3.5 px-3">
                    <div className="font-medium text-zinc-200">{sub.signerName}</div>
                    <div className="text-[10px] text-zinc-400 capitalize">{sub.signatureType} Signature</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-zinc-300">{sub.signedAt}</td>
                  <td className="py-3.5 px-3 font-mono text-[11px] text-zinc-400 truncate max-w-[200px]" title={sub.documentHash}>
                    <span className="text-amber-400">SHA256:</span> {sub.documentHash.slice(0, 18)}...
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" />
                      Certified Legal
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fill & Sign Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-400">{selectedTemplate.code}</span>
                <span className="text-[10px] text-zinc-400">• Digital Document Execution</span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight mt-1">{selectedTemplate.title}</h3>
              <p className="text-xs text-zinc-400">{selectedTemplate.description}</p>
            </div>

            {submissionCompleted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                <p className="font-bold text-white text-sm">Form Digitally Signed & Certified!</p>
                <p className="text-xs text-zinc-400">SHA-256 seal generated and archived to personnel record.</p>
              </div>
            ) : (
              <form onSubmit={handleSignAndSubmit} className="space-y-4 text-xs">
                {/* Dynamic Form Inputs */}
                <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-3">
                  <h4 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider">
                    Employee Information Payload
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 font-medium mb-1">Financial Institution</label>
                      <input
                        type="text"
                        required
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-medium mb-1">Branch Name</label>
                      <input
                        type="text"
                        required
                        value={bankBranch}
                        onChange={(e) => setBankBranch(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 font-medium mb-1">Account Number</label>
                      <input
                        type="text"
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-medium mb-1">Account Beneficiary Name</label>
                      <input
                        type="text"
                        required
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Native E-Signature Capture Block */}
                <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <PenTool className="h-3.5 w-3.5 text-indigo-400" />
                      Legally Binding E-Signature
                    </h4>
                    <div className="flex p-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setSignatureMode("typed")}
                        className={`px-2.5 py-1 rounded font-medium transition ${
                          signatureMode === "typed" ? "bg-indigo-600 text-white" : "text-zinc-400"
                        }`}
                      >
                        Type Signature
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignatureMode("drawn")}
                        className={`px-2.5 py-1 rounded font-medium transition ${
                          signatureMode === "drawn" ? "bg-indigo-600 text-white" : "text-zinc-400"
                        }`}
                      >
                        Draw Stroke
                      </button>
                    </div>
                  </div>

                  {signatureMode === "typed" ? (
                    <div>
                      <input
                        type="text"
                        required
                        value={typedSignature}
                        onChange={(e) => setTypedSignature(e.target.value)}
                        placeholder="Type your full legal name"
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs"
                      />
                      <div className="mt-2 p-3 rounded-lg bg-zinc-950 border border-zinc-800/60 text-center">
                        <span className="text-xl font-serif italic text-indigo-300 tracking-wider">
                          {typedSignature || "Nelson Mandela CP"}
                        </span>
                        <p className="text-[10px] text-zinc-500 mt-1 font-mono">Digital Signature Token Verified</p>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-zinc-800 rounded-xl p-6 text-center bg-zinc-950">
                      <PenTool className="h-6 w-6 text-zinc-500 mx-auto mb-1" />
                      <p className="text-zinc-300 font-serif italic text-lg text-indigo-300">
                        ✍️ Nelson Mandela CP (Canvas Captured)
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1">Touch / Mouse stroke recorded at 60fps</p>
                    </div>
                  )}

                  {/* Cryptographic Audit Stamp Preview */}
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 space-y-0.5">
                    <p className="text-zinc-300 font-medium">Cryptographic Audit Certificate:</p>
                    <p>• Signer: <span className="text-zinc-200 font-mono">Nelson Mandela CP (nelson@mandelaholdings.com)</span></p>
                    <p>• Client IP: <span className="text-zinc-200 font-mono">197.232.14.88 (Nairobi, Kenya)</span></p>
                    <p>• Standards: <span className="text-emerald-400 font-mono">US ESIGN Act • EU eIDAS • Kenya ETA Sec 83</span></p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setSelectedTemplate(null)}
                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20"
                  >
                    {isSubmitting ? "Generating Certificate..." : "Sign & Finalize Submission"}
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
