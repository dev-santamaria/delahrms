"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  EyeOff,
  Building2,
  Sparkles,
  KeyRound,
  XCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface ReviewBlockerData {
  companyName: string;
  referenceCode: string;
  submittedAt?: string;
  supportEmail?: string;
  message: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reviewBlocker, setReviewBlocker] = useState<ReviewBlockerData | null>(null);
  const [success, setSuccess] = useState(false);
  const [successRole, setSuccessRole] = useState("super_admin");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setReviewBlocker(null);
    setLoading(true);

    try {
      const res = await apiClient.auth.login({ email, password });

      // Check if blocked by approval gate
      if (res.status === 403 || res.code === "ACCOUNT_UNDER_REVIEW") {
        setReviewBlocker({
          companyName: res.companyName || "Your Registered Organization",
          referenceCode: res.referenceCode || "DELA-REG-PENDING",
          submittedAt: res.submittedAt,
          supportEmail: res.supportEmail || "info@delahr.com",
          message:
            res.message ||
            "Account Under Review: Your company registration is currently undergoing compliance vetting by the Platform Super Administrator. You will gain access immediately upon approval.",
        });
        setLoading(false);
        return;
      }

      // Check if MFA is required
      if (res.requiresMfa) {
        router.push(
          `/auth/mfa/verify?email=${encodeURIComponent(email)}&challengeId=${encodeURIComponent(
            res.challengeId || ""
          )}`
        );
        return;
      }

      if (res.success && res.token) {
        // Save session in local storage for portal
        if (typeof window !== "undefined") {
          localStorage.setItem("delahr_auth_token", res.token);
          localStorage.setItem("delahr_auth_user", JSON.stringify(res.user));
          if (res.user?.role) {
            const portalPersona = res.user.role === "super_admin" ? "super_admin" : "employee";
            localStorage.setItem("delahr_portal_persona", portalPersona);
            apiClient.setContext({
              userId: res.user.id,
              userRole: portalPersona,
              tenantId: res.user.tenantId,
              organizationId: res.user.organizationId,
            });
          }
        }

        setSuccessRole(res.user?.role || "super_admin");
        setSuccess(true);

        setTimeout(() => {
          if (res.user?.role === "super_admin") {
            router.push("/portal/saas");
          } else {
            router.push("/portal/dashboard");
          }
        }, 1200);
      } else {
        setErrorMessage(res.error || "Authentication failed. Please verify your credentials.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Unable to connect to DelaHR authentication service.");
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (eMail: string, pass: string) => {
    setEmail(eMail);
    setPassword(pass);
    setErrorMessage(null);
    setReviewBlocker(null);
  };

  return (
    <div className="min-h-screen bg-[var(--cool-gray)] text-[var(--gray-text)] font-sans flex flex-col justify-between">
      {/* Top Bar */}
      <header className="py-4 px-6 border-b border-[var(--gray-border)] bg-white sticky top-0 z-20">
        <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl tracking-tight leading-none">
              <strong className="font-extrabold text-[var(--emerald-deep)]">Dela</strong>
              <span className="font-light text-[var(--gray-muted)]">HR</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--gray-muted)] hidden sm:inline">New company?</span>
            <Link
              href="/auth/get-started"
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[var(--emerald-deep)] border border-emerald-200 transition"
            >
              Get Started • Register Tenant
            </Link>
          </div>
        </div>
      </header>

      {/* Center Card Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-4">
          {/* =========================================================================
           * ACCOUNT UNDER REVIEW BLOCKER SCREEN
           * ========================================================================= */}
          {reviewBlocker ? (
            <div className="p-6 md:p-8 rounded-2xl bg-white border border-amber-300 shadow-md space-y-5 animate-in fade-in duration-200">
              <div className="h-14 w-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center shadow-xs">
                <AlertTriangle className="h-7 w-7 animate-pulse" />
              </div>

              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                  <Clock className="h-3 w-3" />
                  Access Gated • Account Under Review
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Account Under Compliance Review
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed px-2">
                  {reviewBlocker.message}
                </p>
              </div>

              {/* Dossier Snapshot */}
              <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500 font-medium">Organization:</span>
                  <span className="font-bold text-slate-900">{reviewBlocker.companyName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 border-t border-amber-200/60 pt-1.5">
                  <span className="text-slate-500 font-medium">Reference Code:</span>
                  <span className="font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                    {reviewBlocker.referenceCode}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-700 border-t border-amber-200/60 pt-1.5">
                  <span className="text-slate-500 font-medium">Current Status:</span>
                  <span className="font-semibold text-amber-700">Pending Super Admin Vetting</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-600 flex items-start gap-2">
                <Building2 className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <p>
                  As soon as the Platform Super Administrator reviews and clicks <strong>"Approve Tenant"</strong>, your company workspace will be spun up and credentials unlocked immediately.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => setReviewBlocker(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
                >
                  Return to Sign In
                </button>
                <a
                  href={`mailto:${reviewBlocker.supportEmail}?subject=Status Inquiry - ${reviewBlocker.referenceCode}`}
                  className="block text-center py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
                >
                  Inquire with Support ({reviewBlocker.supportEmail})
                </a>
              </div>
            </div>
          ) : (
            /* =========================================================================
             * STANDARD LOGIN FORM
             * ========================================================================= */
            <div className="p-8 rounded-2xl bg-white border border-[var(--gray-border)] shadow-sm space-y-6">
              <div className="space-y-1 text-center">
                <div className="h-10 w-10 rounded-xl bg-[var(--emerald-light)] text-[var(--emerald-deep)] mx-auto flex items-center justify-center shadow-xs">
                  <Lock className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-[var(--gray-text)] tracking-tight">
                  Sign in to DelaHR
                </h2>
                <p className="text-xs text-[var(--gray-muted)]">
                  Enter your enterprise credentials to access your workforce portal
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <XCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {success ? (
                <div className="py-6 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 text-[var(--emerald-deep)] mx-auto flex items-center justify-center animate-bounce">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[var(--emerald-deep)]">
                      Authentication Successful!
                    </p>
                    <p className="text-xs text-slate-500">
                      Redirecting to {successRole === "super_admin" ? "Executive SaaS Hub..." : "Workforce Cockpit..."}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-[var(--gray-text)]">Work Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[var(--gray-muted)]" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@delahr.com"
                        className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-[var(--gray-border)] focus:outline-none focus:border-[var(--emerald-mint)] bg-white text-[var(--gray-text)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-[var(--gray-text)]">Password</label>
                      <Link href="/auth/mfa/setup" className="text-[11px] text-[var(--emerald-deep)] hover:underline">
                        Setup MFA?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[var(--gray-muted)]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Clock className="h-4 w-4 animate-spin" />
                        <span>Verifying Credentials & Gating...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Workspace</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  {/* Fast Credential Switcher for Development / Verification */}
                  <div className="pt-2 border-t border-[var(--gray-border)] space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-muted)] block text-center">
                      Quick Demonstration Credentials
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      <button
                        type="button"
                        onClick={() => fillQuickCredentials("admin@delahr.com", "DelaHR2026?")}
                        className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 text-[11px] font-semibold text-left flex items-center justify-between transition"
                      >
                        <span>👑 Super Administrator (Dela HR)</span>
                        <span className="text-[10px] font-mono text-emerald-700">DelaHR2026?</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fillQuickCredentials("admin@kilimasafari.com", "Safari2026!")}
                        className="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-900 text-[11px] font-semibold text-left flex items-center justify-between transition"
                      >
                        <span>⏳ Staged Tenant (Pending Approval)</span>
                        <span className="text-[10px] font-mono text-amber-700">Safari2026!</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-1 text-center">
                    <span className="text-[11px] text-[var(--gray-muted)]">
                      Protected by Enterprise SAML 2.0 / SCIM & Two-Factor Authentication
                    </span>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-[var(--gray-muted)] border-t border-[var(--gray-border)] bg-white">
        © {new Date().getFullYear()} DelaHR Inc. All rights reserved.
      </footer>
    </div>
  );
}
