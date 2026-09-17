"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  ArrowRight,
  Sparkles,
  Filter,
  X,
  Copy,
  Clock,
  RefreshCw,
  Power,
  Mail,
  ExternalLink,
  Shield,
  Layers,
  Lock,
  Send,
  Webhook,
  UserCheck,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";
import { apiClient } from "@/lib/api-client";

interface TeamUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "SUPER_ADMIN" | "HR_MANAGER" | "FINANCE_CONTROLLER" | "STATION_SUPERVISOR" | "EMPLOYEE";
  roleName: string;
  organizationId: string;
  organizationName: string;
  isTenantOwner: boolean;
  isActive: boolean;
  supabaseSynced: boolean;
  lastLoginAt: string;
  createdAt: string;
}

interface UserInvitation {
  id: string;
  email: string;
  roleSlug: string;
  organizationName: string;
  inviteToken: string;
  supabaseMagicLink: string;
  expiresAt: string;
  status: "pending" | "accepted" | "expired";
  createdAt: string;
}

export default function TeamAccessPortalPage() {
  const { entityInfo } = usePortal();
  const [activeTab, setActiveTab] = useState<"users" | "invitations" | "sync">("users");
  const [usersList, setUsersList] = useState<TeamUser[]>([]);
  const [invitationsList, setInvitationsList] = useState<UserInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TeamUser | null>(null);
  const [newRole, setNewRole] = useState<string>("EMPLOYEE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Invite Form
  const [inviteForm, setInviteForm] = useState({
    email: "",
    roleSlug: "EMPLOYEE" as "SUPER_ADMIN" | "HR_MANAGER" | "FINANCE_CONTROLLER" | "STATION_SUPERVISOR" | "EMPLOYEE",
    organizationName: "Mandela Kenya Ltd",
    expiresInDays: 7,
  });

  const [generatedInviteResult, setGeneratedInviteResult] = useState<any | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Webhook Simulator Form
  const [syncEvent, setSyncEvent] = useState({
    event: "user.created" as "user.created" | "user.updated",
    supabaseUserId: `b${Date.now().toString().slice(-8)}-3333-4444-5555-666666666661`,
    email: "new.engineer@mandela.co.ke",
    firstName: "Kennedy",
    lastName: "Omondi",
    role: "STATION_SUPERVISOR" as any,
    organizationName: "Nairobi Industrial Plant",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, invRes] = await Promise.all([
        apiClient.users.getUsers(),
        apiClient.users.getInvitations(),
      ]);

      if (usersRes && usersRes.success && Array.isArray(usersRes.data)) {
        setUsersList(usersRes.data);
      } else {
        setUsersList([
          {
            id: "a1111111-2222-3333-4444-555555555551",
            email: "admin@mandela.co.ke",
            firstName: "Amara",
            lastName: "Diallo",
            role: "SUPER_ADMIN",
            roleName: "Enterprise Super Administrator",
            organizationId: "org-mandela-kenya",
            organizationName: "Mandela Kenya Ltd",
            isTenantOwner: true,
            isActive: true,
            supabaseSynced: true,
            lastLoginAt: "2026-09-17T08:15:00.000Z",
            createdAt: "2026-01-01T10:00:00.000Z",
          },
          {
            id: "a1111111-2222-3333-4444-555555555552",
            email: "hr.ops@mandela.co.ke",
            firstName: "Sarah",
            lastName: "Wanjiku",
            role: "HR_MANAGER",
            roleName: "People & Culture Operations Manager",
            organizationId: "org-mandela-kenya",
            organizationName: "Mandela Kenya Ltd",
            isTenantOwner: false,
            isActive: true,
            supabaseSynced: true,
            lastLoginAt: "2026-09-16T17:40:00.000Z",
            createdAt: "2026-01-15T09:30:00.000Z",
          },
          {
            id: "a1111111-2222-3333-4444-555555555553",
            email: "finance@mandela.co.ke",
            firstName: "Fatima",
            lastName: "Al-Mansoor",
            role: "FINANCE_CONTROLLER",
            roleName: "Finance & Subledger Controller",
            organizationId: "org-mandela-kenya",
            organizationName: "Mandela Kenya Ltd",
            isTenantOwner: false,
            isActive: true,
            supabaseSynced: true,
            lastLoginAt: "2026-09-17T07:22:00.000Z",
            createdAt: "2026-02-01T11:00:00.000Z",
          },
        ]);
      }

      if (invRes && invRes.success && Array.isArray(invRes.data)) {
        setInvitationsList(invRes.data);
      }
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && u.isActive) ||
      (statusFilter === "suspended" && !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle Invite User
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiClient.users.inviteUser(inviteForm);
      if (res && res.success) {
        setGeneratedInviteResult(res.data);
        setFeedbackBanner({
          type: "success",
          message: `Invitation generated for ${inviteForm.email} with role ${inviteForm.roleSlug}!`,
        });
        loadData();
      } else {
        setFeedbackBanner({ type: "error", message: res.error || "Failed to issue invitation" });
      }
    } catch (err: any) {
      setFeedbackBanner({ type: "error", message: err.message || "Invite error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Update Role
  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const res = await apiClient.users.updateRole(selectedUser.id, newRole);
      if (res && res.success) {
        setFeedbackBanner({
          type: "success",
          message: `User ${selectedUser.email} role updated to ${newRole}!`,
        });
        setShowRoleModal(false);
        loadData();
      } else {
        setFeedbackBanner({ type: "error", message: res.error || "Role update failed" });
      }
    } catch (err: any) {
      setFeedbackBanner({ type: "error", message: err.message || "Role update failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Toggle Status
  const handleToggleStatus = async (user: TeamUser) => {
    try {
      const newStatus = !user.isActive;
      const res = await apiClient.users.updateStatus(user.id, newStatus);
      if (res && res.success) {
        setFeedbackBanner({
          type: "success",
          message: `Account for ${user.email} ${newStatus ? "reactivated" : "suspended"} successfully!`,
        });
        loadData();
      }
    } catch (err: any) {
      setFeedbackBanner({ type: "error", message: err.message || "Status toggle failed" });
    }
  };

  // Handle Supabase Webhook Sync Simulation
  const handleSimulateSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiClient.users.syncSupabaseUser({
        event: syncEvent.event,
        supabaseUserId: syncEvent.supabaseUserId,
        email: syncEvent.email,
        userMetadata: {
          first_name: syncEvent.firstName,
          last_name: syncEvent.lastName,
          role: syncEvent.role,
          organization_name: syncEvent.organizationName,
        },
      });

      if (res && res.success) {
        setFeedbackBanner({
          type: "success",
          message: `Supabase webhook (${syncEvent.event}) processed! User ${syncEvent.email} synchronized to database.`,
        });
        loadData();
        setActiveTab("users");
      } else {
        setFeedbackBanner({ type: "error", message: res.error || "Webhook processing failed" });
      }
    } catch (err: any) {
      setFeedbackBanner({ type: "error", message: err.message || "Webhook error" });
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 uppercase tracking-wider">
              Supabase Auth & RBAC Mesh
            </span>
            <span className="text-xs text-[var(--gray-muted)]">• Bi-directional Identity Sync</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--gray-text)] mt-1">
            Enterprise Team & User Access Control
          </h1>
          <p className="text-sm text-[var(--gray-muted)]">
            Manage granular persona permissions, invite team members via Supabase Auth magic links, and synchronize OAuth profiles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab("sync")}
            className="px-4 py-2 rounded-xl border border-[var(--gray-border)] bg-white text-xs font-bold text-[var(--gray-text)] hover:bg-gray-50 flex items-center gap-2 shadow-xs transition"
          >
            <Webhook className="h-4 w-4 text-purple-600" />
            Webhook Sync Tool
          </button>
          <button
            onClick={() => {
              setGeneratedInviteResult(null);
              setShowInviteModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            Send Magic Link Invitation
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)] uppercase tracking-wider">
              Team Members
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[var(--gray-text)]">{usersList.length}</span>
            <span className="text-xs text-emerald-600 font-bold ml-2">Active</span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)] mt-1">Across 3 regional operating entities</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)] uppercase tracking-wider">
              Supabase Auth Sync
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-[var(--emerald-deep)] flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[var(--emerald-deep)]">100%</span>
            <span className="text-xs text-emerald-600 font-bold ml-2">Synced</span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)] mt-1">Direct token authentication</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)] uppercase tracking-wider">
              RBAC Role Classes
            </span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Key className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[var(--gray-text)]">5</span>
            <span className="text-xs text-[var(--gray-muted)] font-medium ml-2">Enterprise Tiers</span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)] mt-1">Super Admin down to ESS Staff</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)] uppercase tracking-wider">
              Pending Invitations
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[var(--gray-text)]">
              {invitationsList.filter((i) => i.status === "pending").length}
            </span>
            <span className="text-xs text-amber-600 font-bold ml-2">Expiring 7d</span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)] mt-1">Magic link onboarding queue</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--gray-border)]">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition ${
            activeTab === "users"
              ? "border-[var(--emerald-deep)] text-[var(--emerald-deep)]"
              : "border-transparent text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
          }`}
        >
          Active Team Roster ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab("invitations")}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition ${
            activeTab === "invitations"
              ? "border-[var(--emerald-deep)] text-[var(--emerald-deep)]"
              : "border-transparent text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
          }`}
        >
          Pending Invitations ({invitationsList.length})
        </button>
        <button
          onClick={() => setActiveTab("sync")}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition ${
            activeTab === "sync"
              ? "border-[var(--emerald-deep)] text-[var(--emerald-deep)]"
              : "border-transparent text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
          }`}
        >
          Supabase Webhook Synchronizer
        </button>
      </div>

      {/* Tab Content 1: Active Users */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl border border-[var(--gray-border)] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[var(--gray-border)] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--cool-gray)]/40">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gray-muted)]" />
                <input
                  type="text"
                  placeholder="Search user by name, email, or RBAC role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--gray-border)] rounded-xl text-xs text-[var(--gray-text)] focus:outline-none focus:border-[var(--emerald-deep)] transition"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-[var(--gray-muted)]" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-[var(--gray-border)] rounded-xl text-xs font-medium text-[var(--gray-text)] focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="SUPER_ADMIN">Super Administrator</option>
                  <option value="HR_MANAGER">HR Manager</option>
                  <option value="FINANCE_CONTROLLER">Finance Controller</option>
                  <option value="STATION_SUPERVISOR">Station Supervisor</option>
                  <option value="EMPLOYEE">Employee (ESS)</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-[var(--gray-border)] rounded-xl text-xs font-medium text-[var(--gray-text)] focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Accounts</option>
                  <option value="suspended">Suspended Accounts</option>
                </select>
              </div>
            </div>

            <button
              onClick={loadData}
              className="p-2 border border-[var(--gray-border)] bg-white rounded-xl text-[var(--gray-muted)] hover:text-[var(--gray-text)] hover:bg-gray-50 transition shrink-0"
              title="Reload Users"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-[var(--emerald-deep)]" : ""}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--cool-gray)] text-[var(--gray-muted)] font-bold uppercase tracking-wider border-b border-[var(--gray-border)]">
                <tr>
                  <th className="py-3.5 px-4">User Identity</th>
                  <th className="py-3.5 px-4">Assigned Role</th>
                  <th className="py-3.5 px-4">Entity Scope</th>
                  <th className="py-3.5 px-4">Supabase Sync</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Last Login</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--gray-border)]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-[var(--gray-muted)]">
                      No team members found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    return (
                      <tr key={u.id} className="hover:bg-gray-50/70 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center shrink-0">
                              {u.firstName?.[0]}
                              {u.lastName?.[0]}
                            </div>
                            <div>
                              <div className="font-extrabold text-[var(--gray-text)]">
                                {u.firstName} {u.lastName}
                                {u.isTenantOwner && (
                                  <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                                    Owner
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[var(--gray-muted)] font-mono">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                              u.role === "SUPER_ADMIN"
                                ? "bg-purple-100 text-purple-800"
                                : u.role === "HR_MANAGER"
                                ? "bg-blue-100 text-blue-800"
                                : u.role === "FINANCE_CONTROLLER"
                                ? "bg-emerald-100 text-emerald-800"
                                : u.role === "STATION_SUPERVISOR"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[11px] font-bold text-[var(--gray-text)]">
                            {u.organizationName || "Global Group"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            Supabase Synced
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {u.isActive ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              Suspended
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--gray-muted)]">
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setNewRole(u.role);
                                setShowRoleModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg border border-[var(--gray-border)] text-[11px] font-bold text-[var(--gray-text)] hover:bg-gray-100 transition"
                            >
                              Edit Role
                            </button>
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                                u.isActive
                                  ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              }`}
                            >
                              {u.isActive ? "Suspend" : "Activate"}
                            </button>
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
      )}

      {/* Tab Content 2: Pending Invitations */}
      {activeTab === "invitations" && (
        <div className="bg-white rounded-2xl border border-[var(--gray-border)] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[var(--gray-border)] bg-[var(--cool-gray)]/40 flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-text)]">
              Pending Security Invitations ({invitationsList.length})
            </span>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3 py-1.5 bg-[var(--emerald-deep)] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              New Invitation
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--cool-gray)] text-[var(--gray-muted)] font-bold uppercase tracking-wider border-b border-[var(--gray-border)]">
                <tr>
                  <th className="py-3.5 px-4">Invitee Email</th>
                  <th className="py-3.5 px-4">Target Role</th>
                  <th className="py-3.5 px-4">Assigned Entity</th>
                  <th className="py-3.5 px-4">Expires At</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Magic Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--gray-border)]">
                {invitationsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-[var(--gray-muted)]">
                      No pending invitations recorded.
                    </td>
                  </tr>
                ) : (
                  invitationsList.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3.5 px-4 font-extrabold text-[var(--gray-text)]">
                        {inv.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          {inv.roleSlug}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[var(--gray-muted)]">
                        {inv.organizationName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--gray-muted)]">
                        {new Date(inv.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(inv.supabaseMagicLink);
                            setFeedbackBanner({
                              type: "success",
                              message: `Magic link copied for ${inv.email}!`,
                            });
                          }}
                          className="px-2.5 py-1 rounded-lg border border-[var(--gray-border)] text-[11px] font-bold text-blue-600 hover:bg-blue-50 transition inline-flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          Copy Link
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 3: Webhook Synchronizer */}
      {activeTab === "sync" && (
        <div className="bg-white rounded-2xl border border-[var(--gray-border)] p-6 shadow-xs max-w-2xl">
          <div className="flex items-center gap-3 pb-4 border-b border-[var(--gray-border)]">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Webhook className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--gray-text)]">
                Supabase Auth Webhook Simulator
              </h3>
              <p className="text-xs text-[var(--gray-muted)]">
                Simulate inbound real-time identity webhook events (`user.created` / `user.updated`) from Supabase Auth.
              </p>
            </div>
          </div>

          <form onSubmit={handleSimulateSync} className="space-y-4 pt-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[var(--gray-text)] block mb-1">Webhook Event</label>
                <select
                  value={syncEvent.event}
                  onChange={(e: any) => setSyncEvent({ ...syncEvent, event: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs bg-white font-bold"
                >
                  <option value="user.created">user.created</option>
                  <option value="user.updated">user.updated</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-[var(--gray-text)] block mb-1">Supabase Auth User ID</label>
                <input
                  type="text"
                  required
                  value={syncEvent.supabaseUserId}
                  onChange={(e) => setSyncEvent({ ...syncEvent, supabaseUserId: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[var(--gray-text)] block mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={syncEvent.firstName}
                  onChange={(e) => setSyncEvent({ ...syncEvent, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-[var(--gray-text)] block mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={syncEvent.lastName}
                  onChange={(e) => setSyncEvent({ ...syncEvent, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[var(--gray-text)] block mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={syncEvent.email}
                  onChange={(e) => setSyncEvent({ ...syncEvent, email: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-[var(--gray-text)] block mb-1">Assigned RBAC Role</label>
                <select
                  value={syncEvent.role}
                  onChange={(e: any) => setSyncEvent({ ...syncEvent, role: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs bg-white font-bold"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="HR_MANAGER">HR_MANAGER</option>
                  <option value="FINANCE_CONTROLLER">FINANCE_CONTROLLER</option>
                  <option value="STATION_SUPERVISOR">STATION_SUPERVISOR</option>
                  <option value="EMPLOYEE">EMPLOYEE</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-sm flex items-center gap-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Dispatch Inbound Supabase Webhook
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Send Team Invitation Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[var(--gray-border)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-[var(--emerald-deep)]" />
                <h3 className="font-extrabold text-[var(--gray-text)] text-sm">
                  Send Magic Link Invitation
                </h3>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 rounded-lg text-[var(--gray-muted)] hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {generatedInviteResult ? (
              <div className="space-y-4 pt-4 text-xs">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="font-bold text-emerald-900 block mb-1">
                    Invitation Generated Successfully!
                  </span>
                  <p className="text-[11px] text-emerald-800">
                    Recipient: <strong>{generatedInviteResult.email}</strong>
                  </p>
                  <p className="text-[11px] text-emerald-800">
                    Token: <span className="font-mono">{generatedInviteResult.inviteToken}</span>
                  </p>
                </div>

                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">
                    Supabase Auth Magic Link
                  </label>
                  <div className="p-2.5 bg-gray-50 border border-[var(--gray-border)] rounded-xl font-mono text-[10px] break-all text-blue-700">
                    {generatedInviteResult.supabaseMagicLink}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedInviteResult.supabaseMagicLink);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="flex-1 py-2 bg-[var(--emerald-deep)] hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition"
                  >
                    <Copy className="h-4 w-4" />
                    {copiedLink ? "Copied Link!" : "Copy Magic Link"}
                  </button>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 border border-[var(--gray-border)] rounded-xl font-bold text-[var(--gray-text)]"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} className="space-y-3 pt-3 text-xs">
                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">Colleague Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs focus:border-[var(--emerald-deep)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">Assign RBAC Role</label>
                  <select
                    value={inviteForm.roleSlug}
                    onChange={(e: any) => setInviteForm({ ...inviteForm, roleSlug: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs bg-white font-bold"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Tenant Owner)</option>
                    <option value="HR_MANAGER">HR_MANAGER (People & Culture)</option>
                    <option value="FINANCE_CONTROLLER">FINANCE_CONTROLLER (Subledger)</option>
                    <option value="STATION_SUPERVISOR">STATION_SUPERVISOR (Plant & FIFO)</option>
                    <option value="EMPLOYEE">EMPLOYEE (Standard Staff / ESS)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">Target Organization</label>
                  <input
                    type="text"
                    value={inviteForm.organizationName}
                    onChange={(e) => setInviteForm({ ...inviteForm, organizationName: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
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
                    Issue Invitation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Role Update Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[var(--gray-border)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <h3 className="font-extrabold text-[var(--gray-text)] text-sm">
                Elevate Role: {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="p-1 rounded-lg text-[var(--gray-muted)] hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRoleSubmit} className="space-y-4 pt-3 text-xs">
              <div>
                <label className="font-bold text-[var(--gray-text)] block mb-1">Select New RBAC Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs bg-white font-bold"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="HR_MANAGER">HR_MANAGER</option>
                  <option value="FINANCE_CONTROLLER">FINANCE_CONTROLLER</option>
                  <option value="STATION_SUPERVISOR">STATION_SUPERVISOR</option>
                  <option value="EMPLOYEE">EMPLOYEE</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
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
                  Confirm Role Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
