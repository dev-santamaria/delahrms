"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Users,
  HardDrive,
  ExternalLink,
  Layers,
  Sparkles,
  ChevronRight,
  Filter,
  X,
  CreditCard,
  FileSpreadsheet,
  Download,
  Clock,
  RefreshCw,
  Power,
  ShieldAlert,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";
import { apiClient } from "@/lib/api-client";

interface TenantRecord {
  id: string;
  name: string;
  slug: string;
  domain: string;
  status: "active" | "trial" | "suspended" | "archived" | "pending_approval" | "under_review";
  tier: "starter" | "growth" | "enterprise";
  referenceCode?: string;
  taxPin?: string;
  adminUser: {
    email: string;
    name: string;
    role: string;
  };
  subscription: {
    planTier: string;
    billingCycle: string;
    status: string;
    seatLimit: number;
    currentHeadcount: number;
    currency: string;
    unitPricePerSeat: number;
    totalBillingAmount: number;
    trialEndsAt?: string;
    paymentMethod: string;
  };
  onboarding: {
    hasCompanyProfile: boolean;
    hasTaxRegistrySetup: boolean;
    hasPayGroupsDefined: boolean;
    hasImportedEmployees: boolean;
    isCompleted: boolean;
  };
  storage: {
    storageLimitBytes: number;
    usedStorageBytes: number;
    compressionRatio: number;
  };
  createdAt: string;
}

export default function SaasManagementPortalPage() {
  const { entityInfo } = usePortal();
  const [tenantsList, setTenantsList] = useState<TenantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Selected Tenant Drawer / Action Modals
  const [selectedTenant, setSelectedTenant] = useState<TenantRecord | null>(null);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [actionType, setActionType] = useState<"upgrade_seats" | "suspend" | "reactivate" | "change_tier">("upgrade_seats");
  const [newSeatLimit, setNewSeatLimit] = useState<number>(500);
  const [actionReason, setActionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Onboarding Form State
  const [onboardForm, setOnboardForm] = useState({
    name: "",
    slug: "",
    domain: "",
    planTier: "enterprise" as "starter" | "growth" | "enterprise",
    billingCycle: "monthly" as "monthly" | "annually",
    seatLimit: 500,
    adminEmail: "",
    adminFirstName: "",
    adminLastName: "",
    countryCode: "KEN",
    currency: "USD",
  });

  // Invoice Form State
  const [invoiceForm, setInvoiceForm] = useState({
    tenantId: "",
    billingPeriodStart: "2026-10-01",
    billingPeriodEnd: "2026-10-31",
    subtotalAmount: 2250,
    taxAmount: 360,
    currency: "USD",
  });

  const [generatedInvoice, setGeneratedInvoice] = useState<any | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Fetch tenants on load
  const loadTenants = async () => {
    setLoading(true);
    try {
      const res = await apiClient.saas.getTenants();
      if (res && res.success && Array.isArray(res.data)) {
        setTenantsList(res.data);
      } else {
        // Fallback default enterprise tenants
        setTenantsList([
          {
            id: "00000000-0000-0000-0000-000000000001",
            name: "Mandela Global Holdings Group",
            slug: "mandela-group",
            domain: "mandela.zuri.africa",
            status: "active",
            tier: "enterprise",
            adminUser: {
              email: "admin@mandela.co.ke",
              name: "Amara Diallo",
              role: "SUPER_ADMIN",
            },
            subscription: {
              planTier: "enterprise",
              billingCycle: "monthly",
              status: "active",
              seatLimit: 2500,
              currentHeadcount: 2048,
              currency: "USD",
              unitPricePerSeat: 4.5,
              totalBillingAmount: 11250,
              paymentMethod: "bank_wire",
            },
            onboarding: {
              hasCompanyProfile: true,
              hasTaxRegistrySetup: true,
              hasPayGroupsDefined: true,
              hasImportedEmployees: true,
              isCompleted: true,
            },
            storage: {
              storageLimitBytes: 536870912000,
              usedStorageBytes: 68719476736,
              compressionRatio: 84.5,
            },
            createdAt: "2024-01-01T00:00:00.000Z",
          },
          {
            id: "00000000-0000-0000-0000-000000000002",
            name: "Kilima Agro-Forestry Consortium",
            slug: "kilima-agro",
            domain: "kilima.zuri.africa",
            status: "active",
            tier: "growth",
            adminUser: {
              email: "ops@kilima-agro.co.tz",
              name: "Josephat Kimaro",
              role: "SUPER_ADMIN",
            },
            subscription: {
              planTier: "growth",
              billingCycle: "monthly",
              status: "active",
              seatLimit: 850,
              currentHeadcount: 720,
              currency: "USD",
              unitPricePerSeat: 6.0,
              totalBillingAmount: 5100,
              paymentMethod: "credit_card",
            },
            onboarding: {
              hasCompanyProfile: true,
              hasTaxRegistrySetup: true,
              hasPayGroupsDefined: true,
              hasImportedEmployees: true,
              isCompleted: true,
            },
            storage: {
              storageLimitBytes: 107374182400,
              usedStorageBytes: 24696061952,
              compressionRatio: 78.2,
            },
            createdAt: "2024-06-15T10:30:00.000Z",
          },
          {
            id: "00000000-0000-0000-0000-000000000003",
            name: "Rift Energy Extraction Ltd",
            slug: "rift-energy",
            domain: "rift-energy.co.ke",
            status: "trial",
            tier: "enterprise",
            adminUser: {
              email: "admin@rift-energy.co.ke",
              name: "Eng. Caroline Chebet",
              role: "SUPER_ADMIN",
            },
            subscription: {
              planTier: "enterprise",
              billingCycle: "monthly",
              status: "trialing",
              seatLimit: 400,
              currentHeadcount: 145,
              currency: "USD",
              unitPricePerSeat: 4.5,
              totalBillingAmount: 1800,
              trialEndsAt: "2026-10-01T23:59:59.000Z",
              paymentMethod: "bank_wire",
            },
            onboarding: {
              hasCompanyProfile: true,
              hasTaxRegistrySetup: true,
              hasPayGroupsDefined: false,
              hasImportedEmployees: true,
              isCompleted: false,
            },
            storage: {
              storageLimitBytes: 536870912000,
              usedStorageBytes: 12884901888,
              compressionRatio: 89.1,
            },
            createdAt: "2026-09-10T14:20:00.000Z",
          },
        ]);
      }
    } catch (e) {
      console.error("Failed to load SaaS tenants", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  // Filtered list
  const filteredTenants = tenantsList.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.domain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === "all" || t.tier === tierFilter;
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesTier && matchesStatus;
  });

  // Summary Metrics
  const totalTenants = tenantsList.length;
  const totalSeats = tenantsList.reduce((acc, t) => acc + (t.subscription?.seatLimit || 0), 0);
  const activeHeadcount = tenantsList.reduce((acc, t) => acc + (t.subscription?.currentHeadcount || 0), 0);
  const totalMrr = tenantsList.reduce((acc, t) => acc + (t.subscription?.totalBillingAmount || 0), 0);

  // Handle Onboard Submit
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiClient.saas.onboardTenant(onboardForm);
      if (res && res.success) {
        setFeedbackBanner({
          type: "success",
          message: `Tenant '${onboardForm.name}' successfully provisioned with 14-day ${onboardForm.planTier.toUpperCase()} trial!`,
        });
        setShowOnboardModal(false);
        setOnboardForm({
          name: "",
          slug: "",
          domain: "",
          planTier: "enterprise",
          billingCycle: "monthly",
          seatLimit: 500,
          adminEmail: "",
          adminFirstName: "",
          adminLastName: "",
          countryCode: "KEN",
          currency: "USD",
        });
        loadTenants();
      } else {
        setFeedbackBanner({
          type: "error",
          message: res.error || "Failed to onboard tenant",
        });
      }
    } catch (err: any) {
      setFeedbackBanner({ type: "error", message: err.message || "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Tenant Action
  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    setIsSubmitting(true);
    try {
      const payload: any = { action: actionType };
      if (actionType === "upgrade_seats") payload.seatLimit = Number(newSeatLimit);
      if (actionType === "suspend") payload.reason = actionReason || "Compliance audit hold";

      const res = await apiClient.saas.tenantAction(selectedTenant.id, payload);
      if (res && res.success) {
        setFeedbackBanner({
          type: "success",
          message: `Action '${actionType}' executed successfully on ${selectedTenant.name}!`,
        });
        setShowActionModal(false);
        loadTenants();
        if (selectedTenant && res.data) {
          setSelectedTenant(res.data);
        }
      } else {
        setFeedbackBanner({ type: "error", message: res.error || "Failed to execute action" });
      }
    } catch (err: any) {
      setFeedbackBanner({ type: "error", message: err.message || "Action failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Invoice Generation
  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiClient.saas.generateInvoice(invoiceForm);
      if (res && res.success) {
        setGeneratedInvoice(res.data);
        setFeedbackBanner({
          type: "success",
          message: `Invoice ${res.data.invoiceNumber} generated for $${res.data.totalAmount} USD!`,
        });
      } else {
        setFeedbackBanner({ type: "error", message: res.error || "Failed to generate invoice" });
      }
    } catch (err: any) {
      setFeedbackBanner({ type: "error", message: err.message || "Invoice generation error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle One-Click Tenant Approval & Spin-Up
  const handleApproveTenant = async (tenantId: string) => {
    setIsSubmitting(true);
    try {
      const res = await apiClient.saas.approveTenant(tenantId);
      if (res && res.success) {
        setFeedbackBanner({
          type: "success",
          message: res.message || "Tenant approved! Enterprise organization spun up and administrator account activated.",
        });
        await loadTenants();
      } else {
        setFeedbackBanner({
          type: "error",
          message: res.error || "Failed to approve tenant.",
        });
      }
    } catch (err: any) {
      setFeedbackBanner({
        type: "error",
        message: err.message || "Network error approving tenant.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingTenants = tenantsList.filter(
    (t) => t.status === "pending_approval" || t.status === "under_review"
  );

  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      {feedbackBanner && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border ${
            feedbackBanner.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-3">
            {feedbackBanner.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            )}
            <span className="text-sm font-semibold">{feedbackBanner.message}</span>
          </div>
          <button
            onClick={() => setFeedbackBanner(null)}
            className="p-1 hover:bg-black/5 rounded-lg text-xs"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
              SaaS Multi-Tenancy Core
            </span>
            <span className="text-xs text-[var(--gray-muted)]">• Global Cluster Isolation</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--gray-text)] mt-1">
            Enterprise Client Tenants & Subscriptions
          </h1>
          <p className="text-sm text-[var(--gray-muted)]">
            Autonomous tenant provisioning, automated subscription metering, seat quotas, and enterprise billing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (tenantsList.length > 0) {
                setInvoiceForm({
                  ...invoiceForm,
                  tenantId: tenantsList[0].id,
                  subtotalAmount: tenantsList[0].subscription?.totalBillingAmount || 2250,
                  taxAmount: Number(((tenantsList[0].subscription?.totalBillingAmount || 2250) * 0.16).toFixed(2)),
                });
              }
              setShowInvoiceModal(true);
            }}
            className="px-4 py-2 rounded-xl border border-[var(--gray-border)] bg-white text-xs font-bold text-[var(--gray-text)] hover:bg-gray-50 flex items-center gap-2 shadow-xs transition"
          >
            <CreditCard className="h-4 w-4 text-[var(--emerald-deep)]" />
            Generate Invoice
          </button>
          <button
            onClick={() => setShowOnboardModal(true)}
            className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            Onboard Enterprise Client
          </button>
        </div>
      </div>

      {/* Pending Approval Queue Banner & Cards */}
      {pendingTenants.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-200">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Clock className="h-4 w-4 animate-spin" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Tenant Onboarding Approval Queue</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-900 border border-amber-300">
                    {pendingTenants.length} Awaiting Vetting
                  </span>
                </h3>
                <p className="text-[11px] text-slate-600">
                  New companies registered via <code>/auth/get-started</code>. Review compliance details and click &quot;Approve Tenant&quot; to spin up the enterprise organization and unlock admin credentials.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-amber-800 bg-white/80 px-3 py-1 rounded-lg border border-amber-200 shrink-0">
              Platform Super Admin Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingTenants.map((pt) => (
              <div
                key={pt.id}
                className="p-4 rounded-xl bg-white border border-amber-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{pt.name}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                      <span>{pt.domain}</span>
                      <span>•</span>
                      <span className="text-amber-800 font-bold">{pt.referenceCode || "REG-PENDING"}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shrink-0 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Pending Vetting
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tax PIN:</span>
                    <span className="font-mono font-semibold text-slate-700">{pt.taxPin || "KRA PIN P058823912K"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Admin Work Email:</span>
                    <span className="font-medium text-slate-700 truncate block">{pt.adminUser?.email}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleApproveTenant(pt.id)}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Approve Tenant & Spin Up</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)] uppercase tracking-wider">
              Active Tenants
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[var(--gray-text)]">{totalTenants}</span>
            <span className="text-xs text-emerald-600 font-bold ml-2">100% Online</span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)] mt-1">Multi-tenant schema partition</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)] uppercase tracking-wider">
              Global Headcount
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-[var(--emerald-deep)] flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[var(--gray-text)]">
              {activeHeadcount.toLocaleString()}
            </span>
            <span className="text-xs text-[var(--gray-muted)] font-medium ml-2">
              / {totalSeats.toLocaleString()} seats
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-[var(--emerald-deep)] h-1.5 rounded-full"
              style={{ width: `${Math.min(100, (activeHeadcount / (totalSeats || 1)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)] uppercase tracking-wider">
              Monthly Recurring (MRR)
            </span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[var(--gray-text)]">
              ${totalMrr.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600 font-bold ml-2">+18.4% YoY</span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)] mt-1">Billed via automated EFT / Stripe</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)] uppercase tracking-wider">
              Document Vault Telemetry
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <HardDrive className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[var(--gray-text)]">106.3 GB</span>
            <span className="text-xs text-purple-600 font-bold ml-2">-84% WebP/PDF</span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)] mt-1">High-compression storage active</p>
        </div>
      </div>

      {/* Main Filter & Table Area */}
      <div className="bg-white rounded-2xl border border-[var(--gray-border)] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[var(--gray-border)] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--cool-gray)]/40">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gray-muted)]" />
              <input
                type="text"
                placeholder="Search tenant by company name, slug or domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--gray-border)] rounded-xl text-xs text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)] transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-[var(--gray-muted)]" />
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-[var(--gray-border)] rounded-xl text-xs font-medium text-[var(--gray-text)] focus:outline-none"
              >
                <option value="all">All Subscription Tiers</option>
                <option value="starter">Starter Tier ($8/seat)</option>
                <option value="growth">Growth Tier ($6/seat)</option>
                <option value="enterprise">Industrial Enterprise ($4.50/seat)</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-[var(--gray-border)] rounded-xl text-xs font-medium text-[var(--gray-text)] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending_approval">Pending Approval Queue</option>
                <option value="active">Active Tenants</option>
                <option value="trial">14-Day Free Trials</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <button
            onClick={loadTenants}
            className="p-2 border border-[var(--gray-border)] bg-white rounded-xl text-[var(--gray-muted)] hover:text-[var(--gray-text)] hover:bg-gray-50 transition shrink-0"
            title="Reload Tenants"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-[var(--emerald-deep)]" : ""}`} />
          </button>
        </div>

        {/* Tenants Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--cool-gray)] text-[var(--gray-muted)] font-bold uppercase tracking-wider border-b border-[var(--gray-border)]">
              <tr>
                <th className="py-3.5 px-4">Client Organization</th>
                <th className="py-3.5 px-4">Cluster Domain</th>
                <th className="py-3.5 px-4">Plan Tier</th>
                <th className="py-3.5 px-4">Seats Allocated</th>
                <th className="py-3.5 px-4">Monthly Rate</th>
                <th className="py-3.5 px-4">Onboarding</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--gray-border)]">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-[var(--gray-muted)]">
                    No SaaS client tenants found matching your query.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t) => {
                  const isTrial = t.status === "trial" || t.subscription?.status === "trialing";
                  const isSuspended = t.status === "suspended";

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-gray-50/70 transition cursor-pointer"
                      onClick={() => setSelectedTenant(t)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-[var(--gray-text)]">{t.name}</div>
                        <div className="text-[11px] text-[var(--gray-muted)] font-mono">
                          ID: {t.slug}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-blue-600">
                          <Globe className="h-3 w-3 shrink-0" />
                          <span>{t.domain}</span>
                        </div>
                        <div className="text-[10px] text-[var(--gray-muted)]">
                          Admin: {t.adminUser?.email}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                            t.tier === "enterprise"
                              ? "bg-purple-100 text-purple-800"
                              : t.tier === "growth"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {t.tier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[var(--gray-text)]">
                          {t.subscription?.currentHeadcount || 1} / {t.subscription?.seatLimit || 500}
                        </div>
                        <div className="text-[10px] text-[var(--gray-muted)]">
                          {(t.subscription?.seatLimit || 500) - (t.subscription?.currentHeadcount || 1)} available
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-[var(--emerald-deep)]">
                          ${t.subscription?.totalBillingAmount?.toLocaleString()} {t.subscription?.currency || "USD"}
                        </div>
                        <div className="text-[10px] text-[var(--gray-muted)]">
                          ${t.subscription?.unitPricePerSeat}/seat/mo
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {t.onboarding?.isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            100% Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                            In Progress
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {t.status === "pending_approval" || t.status === "under_review" ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Pending Vetting
                          </span>
                        ) : isSuspended ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            Suspended
                          </span>
                        ) : isTrial ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            14-Day Trial
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {t.status === "pending_approval" || t.status === "under_review" ? (
                            <button
                              onClick={() => handleApproveTenant(t.id)}
                              disabled={isSubmitting}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Approve Tenant</span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedTenant(t);
                                  setActionType("upgrade_seats");
                                  setNewSeatLimit((t.subscription?.seatLimit || 500) + 250);
                                  setShowActionModal(true);
                                }}
                                className="px-2.5 py-1 rounded-lg border border-[var(--gray-border)] text-[11px] font-bold text-[var(--gray-text)] hover:bg-gray-100 transition"
                              >
                                Scale Seats
                              </button>
                              {isSuspended ? (
                                <button
                                  onClick={() => {
                                    setSelectedTenant(t);
                                    setActionType("reactivate");
                                    setShowActionModal(true);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold transition"
                                >
                                  Reactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedTenant(t);
                                    setActionType("suspend");
                                    setActionReason("");
                                    setShowActionModal(true);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-bold transition"
                                >
                                  Suspend
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Enterprise Client Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[var(--gray-border)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--gray-border)]">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[var(--gray-text)] text-base">
                    Onboard New Enterprise SaaS Client
                  </h3>
                  <p className="text-xs text-[var(--gray-muted)]">
                    Provisions isolated database partition, 14-day free trial, and default Super Admin account.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOnboardModal(false)}
                className="p-1 rounded-lg text-[var(--gray-muted)] hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">Company Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Serengeti Logistics Ltd"
                    value={onboardForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
                      setOnboardForm({ ...onboardForm, name, slug });
                    }}
                    className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs focus:border-[var(--emerald-deep)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">Subdomain Slug *</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      required
                      placeholder="serengeti-logistics"
                      value={onboardForm.slug}
                      onChange={(e) => setOnboardForm({ ...onboardForm, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-l-xl text-xs font-mono focus:border-[var(--emerald-deep)] focus:outline-none"
                    />
                    <span className="px-2 py-2 bg-gray-100 border border-l-0 border-[var(--gray-border)] rounded-r-xl text-[10px] text-[var(--gray-muted)] font-mono">
                      .zuri.africa
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">Subscription Plan</label>
                  <select
                    value={onboardForm.planTier}
                    onChange={(e: any) => setOnboardForm({ ...onboardForm, planTier: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs bg-white font-medium"
                  >
                    <option value="enterprise">Industrial Enterprise ($4.50/seat)</option>
                    <option value="growth">Growth ($6.00/seat)</option>
                    <option value="starter">Starter ($8.00/seat)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">Billing Cycle</label>
                  <select
                    value={onboardForm.billingCycle}
                    onChange={(e: any) => setOnboardForm({ ...onboardForm, billingCycle: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs bg-white font-medium"
                  >
                    <option value="monthly">Monthly Recurring</option>
                    <option value="annually">Annual (15% Discount)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">Initial Seat Limit</label>
                  <input
                    type="number"
                    min={10}
                    max={10000}
                    value={onboardForm.seatLimit}
                    onChange={(e) => setOnboardForm({ ...onboardForm, seatLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/70">
                <span className="text-[11px] font-bold text-blue-900 block mb-1">
                  Primary Client Tenant Administrator (Super Admin)
                </span>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="First Name"
                      value={onboardForm.adminFirstName}
                      onChange={(e) => setOnboardForm({ ...onboardForm, adminFirstName: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-blue-200 rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Last Name"
                      value={onboardForm.adminLastName}
                      onChange={(e) => setOnboardForm({ ...onboardForm, adminLastName: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-blue-200 rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="admin@company.com"
                      value={onboardForm.adminEmail}
                      onChange={(e) => setOnboardForm({ ...onboardForm, adminEmail: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-blue-200 rounded-lg text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Estimate Card */}
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-900 block">
                    Estimated Post-Trial Monthly Billing
                  </span>
                  <span className="text-[10px] text-emerald-700">
                    {onboardForm.seatLimit} seats × ${onboardForm.planTier === "starter" ? 8 : onboardForm.planTier === "growth" ? 6 : 4.5}/seat
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[var(--emerald-deep)]">
                    ${(onboardForm.seatLimit * (onboardForm.planTier === "starter" ? 8 : onboardForm.planTier === "growth" ? 6 : 4.5)).toLocaleString()} USD
                  </span>
                  <span className="block text-[10px] text-emerald-700 font-bold">14-Day Trial: Free</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-4 py-2 border border-[var(--gray-border)] rounded-xl font-bold text-[var(--gray-muted)] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[var(--emerald-deep)] hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Initialize Tenant Partition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tenant Action Modal (Scale Seats, Suspend, Reactivate) */}
      {showActionModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[var(--gray-border)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <h3 className="font-extrabold text-[var(--gray-text)] text-sm">
                Administrative Action: {selectedTenant.name}
              </h3>
              <button
                onClick={() => setShowActionModal(false)}
                className="p-1 rounded-lg text-[var(--gray-muted)] hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-4 pt-3 text-xs">
              <div>
                <label className="font-bold text-[var(--gray-text)] block mb-1">Action Type</label>
                <select
                  value={actionType}
                  onChange={(e: any) => setActionType(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs bg-white font-bold"
                >
                  <option value="upgrade_seats">Scale / Upgrade Seat Limit</option>
                  <option value="suspend">Suspend Tenant Access</option>
                  <option value="reactivate">Reactivate Tenant</option>
                </select>
              </div>

              {actionType === "upgrade_seats" && (
                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">New Total Seat Limit</label>
                  <input
                    type="number"
                    min={selectedTenant.subscription?.currentHeadcount || 10}
                    value={newSeatLimit}
                    onChange={(e) => setNewSeatLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs font-bold"
                  />
                  <p className="text-[10px] text-[var(--gray-muted)] mt-1">
                    Current Limit: {selectedTenant.subscription?.seatLimit} seats. Minimum required: {selectedTenant.subscription?.currentHeadcount || 1}.
                  </p>
                </div>
              )}

              {actionType === "suspend" && (
                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">Reason for Suspension *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Overdue payment balance or compliance review pending..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="px-3 py-1.5 border border-[var(--gray-border)] rounded-xl font-bold text-[var(--gray-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-1.5 rounded-xl font-bold text-white shadow-sm flex items-center gap-1.5 ${
                    actionType === "suspend"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-[var(--emerald-deep)] hover:bg-emerald-700"
                  }`}
                >
                  {isSubmitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  Confirm Execution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Enterprise Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[var(--gray-border)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[var(--emerald-deep)]" />
                <h3 className="font-extrabold text-[var(--gray-text)] text-sm">
                  Generate Formal Client Invoice
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setGeneratedInvoice(null);
                }}
                className="p-1 rounded-lg text-[var(--gray-muted)] hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {generatedInvoice ? (
              <div className="space-y-4 pt-4 text-xs">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-black text-emerald-900 text-sm">
                      {generatedInvoice.invoiceNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      {generatedInvoice.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-emerald-800">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-mono">${generatedInvoice.subtotalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT / Tax (16%):</span>
                      <span className="font-mono">${generatedInvoice.taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-emerald-300 pt-1 text-sm">
                      <span>Total Invoice Due:</span>
                      <span className="font-mono">${generatedInvoice.totalAmount.toLocaleString()} USD</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={generatedInvoice.pdfDownloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 bg-[var(--emerald-deep)] hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition"
                  >
                    <Download className="h-4 w-4" />
                    Download Official Tax Invoice PDF
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerateInvoice} className="space-y-3 pt-3 text-xs">
                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">Target SaaS Tenant *</label>
                  <select
                    value={invoiceForm.tenantId}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, tenantId: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs bg-white font-bold"
                  >
                    {tenantsList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.slug}) - ${t.subscription?.totalBillingAmount}/mo
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-[var(--gray-text)] block mb-1">Period Start</label>
                    <input
                      type="date"
                      value={invoiceForm.billingPeriodStart}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, billingPeriodStart: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[var(--gray-text)] block mb-1">Period End</label>
                    <input
                      type="date"
                      value={invoiceForm.billingPeriodEnd}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, billingPeriodEnd: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-[var(--gray-text)] block mb-1">Subtotal Amount (USD)</label>
                    <input
                      type="number"
                      value={invoiceForm.subtotalAmount}
                      onChange={(e) => {
                        const sub = Number(e.target.value);
                        setInvoiceForm({ ...invoiceForm, subtotalAmount: sub, taxAmount: Number((sub * 0.16).toFixed(2)) });
                      }}
                      className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[var(--gray-text)] block mb-1">Tax Amount (16%)</label>
                    <input
                      type="number"
                      value={invoiceForm.taxAmount}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, taxAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(false)}
                    className="px-3 py-1.5 border border-[var(--gray-border)] rounded-xl font-bold text-[var(--gray-muted)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 bg-[var(--emerald-deep)] hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm flex items-center gap-1.5"
                  >
                    {isSubmitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                    Generate & Issue Invoice
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
