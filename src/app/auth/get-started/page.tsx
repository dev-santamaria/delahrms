"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  Globe,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Clock,
  Sparkles,
  Eye,
  EyeOff,
  ChevronRight,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function GetStartedPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    legalName: "",
    tradingName: "",
    slug: "",
    taxPin: "",
    countryCode: "KEN",
    currency: "KES",
    industry: "Financial & Corporate Services",
    companySize: "10-50",
    companyEmail: "",
    phone: "",
    address: "",
    // Administrator
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPassword: "",
    adminPhone: "",
    adminJobTitle: "Head of Operations",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    referenceCode: string;
    companyName: string;
    submittedAt: string;
    slug: string;
    adminEmail: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-generate slug from company name
  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setFormData((prev) => ({
      ...prev,
      companyName: val,
      legalName: prev.legalName || val,
      slug: prev.slug === "" || prev.slug === generatedSlug.slice(0, -1) ? generatedSlug : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await apiClient.auth.registerTenant(formData);

      if (res.success && res.data) {
        setSubmissionResult({
          referenceCode: res.data.referenceCode,
          companyName: res.data.companyName,
          submittedAt: res.data.submittedAt,
          slug: res.data.slug,
          adminEmail: res.data.adminEmail,
        });
      } else {
        setErrorMessage(res.error || "Failed to submit registration. Please verify details.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const copyRefCode = () => {
    if (submissionResult?.referenceCode) {
      navigator.clipboard.writeText(submissionResult.referenceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--cool-gray)] text-[var(--gray-text)] font-sans flex flex-col justify-between">
      {/* Top Header */}
      <header className="py-4 px-6 border-b border-[var(--gray-border)] bg-white sticky top-0 z-20">
        <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl tracking-tight leading-none">
              <strong className="font-extrabold text-[var(--emerald-deep)]">Dela</strong>
              <span className="font-light text-[var(--gray-muted)]">HR</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-[var(--emerald-deep)] border border-emerald-200">
              Tenant Onboarding
            </span>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-[var(--gray-muted)] hidden sm:inline">Already registered?</span>
            <Link
              href="/auth/login"
              className="px-3 py-1.5 rounded-lg border border-[var(--gray-border)] hover:bg-slate-50 font-semibold text-[var(--gray-text)] transition"
            >
              Sign In to Workspace
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl">
          {submissionResult ? (
            /* =========================================================================
             * AWAITING APPROVAL CONFIRMATION SCREEN
             * ========================================================================= */
            <div className="p-8 md:p-10 rounded-2xl bg-white border border-[var(--gray-border)] shadow-sm space-y-6 text-center animate-in fade-in duration-300">
              <div className="h-16 w-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center shadow-xs">
                <Clock className="h-8 w-8 animate-pulse" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 text-amber-900 text-xs font-bold">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  Application Submitted • Under Review
                </div>
                <h2 className="text-2xl font-black text-[var(--gray-text)] tracking-tight">
                  Awaiting Platform Approval
                </h2>
                <p className="text-xs text-[var(--gray-muted)] leading-relaxed">
                  Thank you for submitting your organization profile for{" "}
                  <strong className="text-[var(--gray-text)]">{submissionResult.companyName}</strong>.
                  Your tenant workspace is currently undergoing compliance vetting by the Platform Super Administrator.
                </p>
              </div>

              {/* Reference Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--gray-muted)] font-medium">Application Reference:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-300">
                      {submissionResult.referenceCode}
                    </span>
                    <button
                      onClick={copyRefCode}
                      className="p-1 rounded hover:bg-slate-200 text-slate-600 transition"
                      title="Copy reference code"
                    >
                      {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                  <span className="text-[var(--gray-muted)]">Workspace Subdomain:</span>
                  <span className="font-mono font-semibold text-[var(--emerald-deep)]">
                    {submissionResult.slug}.delahr.com
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                  <span className="text-[var(--gray-muted)]">Administrator Account:</span>
                  <span className="font-medium text-slate-700">{submissionResult.adminEmail}</span>
                </div>
              </div>

              {/* Compliance Timeline */}
              <div className="max-w-md mx-auto py-2 text-left">
                <div className="text-[11px] font-bold text-[var(--gray-muted)] uppercase tracking-wider mb-2">
                  Vetting Stages & Next Steps
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2.5 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">Company & Admin Credentials Registered</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-amber-700">
                    <Clock className="h-4 w-4 flex-shrink-0 animate-spin" />
                    <span className="font-medium">Platform Super Administrator Compliance Review</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <Building2 className="h-4 w-4 flex-shrink-0" />
                    <span>Company Organization Spin-Up & Account Unlock</span>
                  </div>
                </div>
              </div>

              {/* Notice Banner */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs text-left flex items-start gap-2.5 max-w-md mx-auto">
                <ShieldCheck className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="leading-snug">
                  If you attempt to sign in right now with your new credentials, you will see an{" "}
                  <strong>Account Under Review</strong> blocker. Once the Super Admin approves your tenant, your login will activate automatically.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/auth/login"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Go to Sign In Page</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="mailto:info@delahr.com"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[var(--gray-border)] hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
                >
                  Contact Platform Support
                </a>
              </div>
            </div>
          ) : (
            /* =========================================================================
             * GET STARTED REGISTRATION FORM
             * ========================================================================= */
            <div className="p-6 md:p-8 rounded-2xl bg-white border border-[var(--gray-border)] shadow-sm space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[var(--emerald-deep)] text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" />
                  <span>Enterprise Multi-Tenant Provisioning</span>
                </div>
                <h1 className="text-2xl font-black text-[var(--gray-text)] tracking-tight">
                  Get Started with DelaHR
                </h1>
                <p className="text-xs text-[var(--gray-muted)]">
                  Register your company and configure your initial tenant administrator account. All registrations undergo Super Administrator vetting prior to tenant activation.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 text-xs">
                {/* Section 1: Company Profile */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-[var(--gray-border)]">
                    <Building2 className="h-4 w-4 text-[var(--emerald-deep)]" />
                    <h3 className="font-bold text-[var(--gray-text)] text-sm">1. Company Profile</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--gray-text)]">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={handleCompanyNameChange}
                        placeholder="e.g. Acme Africa Group"
                        className="w-full px-3 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)] font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--gray-text)]">
                        Workspace Slug / Subdomain <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center">
                        <input
                          type="text"
                          required
                          value={formData.slug}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                            })
                          }
                          placeholder="acme-group"
                          className="w-full px-3 py-2 rounded-l-lg border border-r-0 border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)] font-mono text-xs"
                        />
                        <span className="px-3 py-2 bg-slate-100 border border-[var(--gray-border)] rounded-r-lg text-slate-500 text-xs font-mono select-none">
                          .delahr.com
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--gray-text)]">
                        Tax PIN (e.g. KRA PIN, TIN, EIN) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.taxPin}
                        onChange={(e) => setFormData({ ...formData, taxPin: e.target.value })}
                        placeholder="P051234567Z"
                        className="w-full px-3 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)] font-mono uppercase"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--gray-text)]">
                        Country Headquarters <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.countryCode}
                        onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)] font-medium"
                      >
                        <option value="KEN">Kenya (KEN - KES)</option>
                        <option value="UGA">Uganda (UGA - UGX)</option>
                        <option value="TZA">Tanzania (TZA - TZS)</option>
                        <option value="RWA">Rwanda (RWA - RWF)</option>
                        <option value="ZAF">South Africa (ZAF - ZAR)</option>
                        <option value="NGA">Nigeria (NGA - NGN)</option>
                        <option value="USA">United States (USA - USD)</option>
                        <option value="GBR">United Kingdom (GBR - GBP)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--gray-text)]">
                        Corporate Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[var(--gray-muted)]" />
                        <input
                          type="email"
                          required
                          value={formData.companyEmail}
                          onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                          placeholder="info@acme-group.com"
                          className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--gray-text)]">
                        Company Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-[var(--gray-muted)]" />
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+254 700 000 000"
                          className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--gray-text)]">Industry Sector</label>
                      <select
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)]"
                      >
                        <option value="Financial & Corporate Services">Financial & Corporate Services</option>
                        <option value="Manufacturing & Plant Operations">Manufacturing & Plant Operations</option>
                        <option value="Logistics, Transport & Supply Chain">Logistics, Transport & Supply Chain</option>
                        <option value="Agriculture & Agribusiness">Agriculture & Agribusiness</option>
                        <option value="Hospitality & Tourism">Hospitality & Tourism</option>
                        <option value="Technology & Telecoms">Technology & Telecoms</option>
                        <option value="Healthcare & Pharmaceuticals">Healthcare & Pharmaceuticals</option>
                        <option value="Non-Governmental (NGO / Development)">Non-Governmental (NGO / Development)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--gray-text)]">Current Headcount</label>
                      <select
                        value={formData.companySize}
                        onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)]"
                      >
                        <option value="1-10">1 - 10 Employees</option>
                        <option value="10-50">10 - 50 Employees</option>
                        <option value="50-250">50 - 250 Employees</option>
                        <option value="250-1000">250 - 1,000 Employees</option>
                        <option value="1000+">1,000+ Enterprise</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Tenant Administrator Details */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-[var(--gray-border)]">
                    <User className="h-4 w-4 text-[var(--emerald-deep)]" />
                    <h3 className="font-bold text-[var(--gray-text)] text-sm">2. Initial Tenant Administrator</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--gray-text)]">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.adminFirstName}
                        onChange={(e) => setFormData({ ...formData, adminFirstName: e.target.value })}
                        placeholder="Sarah"
                        className="w-full px-3 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)] font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--gray-text)]">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.adminLastName}
                        onChange={(e) => setFormData({ ...formData, adminLastName: e.target.value })}
                        placeholder="Wanjiku"
                        className="w-full px-3 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)] font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--gray-text)]">
                        Administrator Work Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[var(--gray-muted)]" />
                        <input
                          type="email"
                          required
                          value={formData.adminEmail}
                          onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                          placeholder="sarah.wanjiku@acme-group.com"
                          className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)]"
                        />
                      </div>
                      <span className="text-[10px] text-[var(--gray-muted)]">This will be your sign-in email.</span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--gray-text)]">
                        Account Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[var(--gray-muted)]" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={formData.adminPassword}
                          onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                          placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                          className="w-full pl-9 pr-10 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-[var(--gray-muted)] hover:text-slate-700"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--gray-text)]">Job Title / Designation</label>
                      <input
                        type="text"
                        value={formData.adminJobTitle}
                        onChange={(e) => setFormData({ ...formData, adminJobTitle: e.target.value })}
                        placeholder="Head of People & Operations"
                        className="w-full px-3 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[var(--gray-text)]">Admin Mobile Phone</label>
                      <input
                        type="tel"
                        value={formData.adminPhone}
                        onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                        placeholder="+254 711 000 000"
                        className="w-full px-3 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Compliance Statement */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] space-y-1">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-[var(--emerald-deep)]" />
                    Regulatory Compliance & Platform Security
                  </div>
                  <p>
                    By submitting this registration, you certify that you are authorized to represent this legal entity. All company registrations are subject to vetting by the Platform Super Administrator before the workspace and tenant database are spun up.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] disabled:opacity-60 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      <span>Submitting Registration & Generating Reference...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Registration for Approval</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-[var(--gray-muted)] border-t border-[var(--gray-border)] bg-white">
        © {new Date().getFullYear()} DelaHR Inc. Universal Multi-Tenant Enterprise HRMS & Payroll.
      </footer>
    </div>
  );
}
