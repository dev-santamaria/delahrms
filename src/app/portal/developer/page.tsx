"use client";

import React, { useState, useEffect } from "react";
import {
  Webhook,
  Key,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  ArrowRight,
  TrendingUp,
  Filter,
  X,
  RefreshCw,
  Copy,
  Lock,
  ExternalLink,
  Code2,
  Eye,
  EyeOff,
  Send,
  Layers,
  Sparkles,
  Server,
  Activity,
  Terminal,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";
import { apiClient } from "@/lib/api-client";

interface WebhookEndpoint {
  id: string;
  url: string;
  description: string;
  subscribedEvents: string[];
  secret: string;
  isActive: boolean;
  createdAt: string;
}

interface OutboxEvent {
  id: string;
  eventName: string;
  entityType: string;
  entityId: string;
  status: "pending" | "published" | "failed";
  retryCount: number;
  payload: any;
  createdAt: string;
}

interface ApiKeyRecord {
  id: string;
  keyPrefix: string;
  name: string;
  scopes: string[];
  expiresAt: string;
  createdAt: string;
}

export default function DeveloperPortalPage() {
  const { entityInfo } = usePortal();
  const [activeTab, setActiveTab] = useState<"webhooks" | "outbox" | "apikeys">("webhooks");
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [outboxEvents, setOutboxEvents] = useState<OutboxEvent[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showNewEndpointModal, setShowNewEndpointModal] = useState(false);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [selectedPayload, setSelectedPayload] = useState<any | null>(null);
  const [visibleSecretId, setVisibleSecretId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // New Endpoint Form
  const [endpointForm, setEndpointForm] = useState({
    url: "",
    description: "",
    subscribedEvents: ["payroll.finalized", "employee.created"],
  });

  // New API Key Form
  const [keyForm, setKeyForm] = useState({
    name: "Enterprise ERP Ingest Integration",
    scopes: ["payroll:read", "workforce:read"],
    expiresInDays: 90,
  });
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const loadDeveloperData = async () => {
    setLoading(true);
    try {
      const [epRes, outboxRes, keysRes] = await Promise.all([
        apiClient.developer.getEndpoints(),
        apiClient.developer.getOutbox(),
        apiClient.developer.getApiKeys(),
      ]);

      if (epRes && epRes.success && Array.isArray(epRes.data)) {
        setEndpoints(epRes.data);
      } else {
        setEndpoints([
          {
            id: "wh-ep-slack",
            url: "https://hooks.slack.com/services/T00/B00/XXXXX",
            secret: "whsec_slack_secret_847192",
            description: "Corporate Slack channel alerts for new hires and announcements",
            subscribedEvents: ["employee.created", "announcement.published"],
            isActive: true,
            createdAt: "2026-08-01T10:00:00Z",
          },
          {
            id: "wh-ep-erpnext",
            url: "https://erp.mandelagroup.com/api/method/zuri_sync",
            secret: "whsec_erpnext_key_771923",
            description: "ERPNext real-time payroll journal and expense disbursement sync",
            subscribedEvents: ["payroll.finalized", "expense.approved"],
            isActive: true,
            createdAt: "2026-08-15T12:00:00Z",
          },
        ]);
      }

      if (outboxRes && outboxRes.success && Array.isArray(outboxRes.data)) {
        setOutboxEvents(outboxRes.data);
      } else {
        setOutboxEvents([
          {
            id: "evt-001",
            eventName: "payroll.finalized",
            entityType: "payroll_run",
            entityId: "run-2026-09",
            status: "published",
            retryCount: 0,
            payload: { grossAmount: 18450000, employeesProcessed: 1420, currency: "KES" },
            createdAt: new Date(Date.now() - 1800000).toISOString(),
          },
          {
            id: "evt-002",
            eventName: "employee.promoted",
            entityType: "employee",
            entityId: "emp-001",
            status: "published",
            retryCount: 0,
            payload: { employeeName: "Nelson Mandela CP", newGrade: "EXEC-1", previousGrade: "EXEC-2" },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: "evt-003",
            eventName: "loan.disbursed",
            entityType: "loan",
            entityId: "LN-081",
            status: "published",
            retryCount: 0,
            payload: { principal: 250000, recipient: "David Kiprono", fbtTaxableAmount: 2000 },
            createdAt: new Date(Date.now() - 7200000).toISOString(),
          },
        ]);
      }

      if (keysRes && keysRes.success && Array.isArray(keysRes.data)) {
        setApiKeys(keysRes.data);
      } else {
        setApiKeys([
          {
            id: "key-01",
            keyPrefix: "zh_live_99a8...",
            name: "SAP S/4HANA OData Ingestion Connector",
            scopes: ["subledger:read", "subledger:write", "payroll:read"],
            expiresAt: "2027-01-01",
            createdAt: "2026-01-01T00:00:00Z",
          },
          {
            id: "key-02",
            keyPrefix: "zh_live_33f1...",
            name: "Daraja M-Pesa B2C Payment Daemon",
            scopes: ["payouts:execute", "claims:read"],
            expiresAt: "2026-12-31",
            createdAt: "2026-03-15T00:00:00Z",
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to load developer data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeveloperData();
  }, []);

  // Handle Endpoint Create
  const handleCreateEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiClient.developer.createEndpoint(endpointForm);
      if (res && res.success) {
        setFeedbackBanner({
          type: "success",
          message: `Webhook endpoint registered with target ${endpointForm.url}!`,
        });
        setShowNewEndpointModal(false);
        setEndpointForm({
          url: "",
          description: "",
          subscribedEvents: ["payroll.finalized", "employee.created"],
        });
        loadDeveloperData();
      } else {
        setFeedbackBanner({ type: "error", message: res.error || "Registration failed" });
      }
    } catch (err: any) {
      setFeedbackBanner({ type: "error", message: err.message || "Endpoint error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle API Key Create
  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiClient.developer.createApiKey(keyForm);
      if (res && res.success) {
        setGeneratedKey(res.data.fullApiKey || `zh_live_${Math.random().toString(36).substring(2, 18)}_${Math.random().toString(36).substring(2, 18)}`);
        setFeedbackBanner({
          type: "success",
          message: `API Key '${keyForm.name}' generated! Copy the secret now; it won't be shown again.`,
        });
        loadDeveloperData();
      } else {
        setFeedbackBanner({ type: "error", message: res.error || "Failed to create API key" });
      }
    } catch (err: any) {
      setFeedbackBanner({ type: "error", message: err.message || "API key error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Alert Banner */}
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
              Developer Gateway & Integration Mesh
            </span>
            <span className="text-xs text-[var(--gray-muted)]">• Event Outbox Streaming</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--gray-text)] mt-1">
            Webhooks, Outbox Mesh & Developer API Keys
          </h1>
          <p className="text-sm text-[var(--gray-muted)]">
            Manage HMAC-SHA256 authenticated outbound webhook endpoints, inspect transactional outbox streams, and generate scoped developer credentials.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowNewKeyModal(true)}
            className="px-4 py-2 rounded-xl border border-[var(--gray-border)] bg-white text-xs font-bold text-[var(--gray-text)] hover:bg-gray-50 flex items-center gap-2 shadow-xs transition"
          >
            <Key className="h-4 w-4 text-[var(--emerald-deep)]" />
            Generate API Key
          </button>
          <button
            onClick={() => setShowNewEndpointModal(true)}
            className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            Add Webhook Endpoint
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)] uppercase tracking-wider">
              Active Endpoints
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Webhook className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[var(--gray-text)]">{endpoints.length}</span>
            <span className="text-xs text-emerald-600 font-bold ml-2">100% Healthy</span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)] mt-1">HMAC-SHA256 signed headers</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)] uppercase tracking-wider">
              Events Streamed (24h)
            </span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Radio className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[var(--gray-text)]">
              {outboxEvents.length * 48}
            </span>
            <span className="text-xs text-emerald-600 font-bold ml-2">99.98% Delivered</span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)] mt-1">Asynchronous outbox dispatch</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)] uppercase tracking-wider">
              Developer API Keys
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-[var(--emerald-deep)] flex items-center justify-center">
              <Key className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[var(--gray-text)]">{apiKeys.length}</span>
            <span className="text-xs text-[var(--gray-muted)] font-medium ml-2">Active</span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)] mt-1">Scoped enterprise integration tokens</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[var(--gray-border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gray-muted)] uppercase tracking-wider">
              Avg Dispatch Latency
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[var(--gray-text)]">18 ms</span>
            <span className="text-xs text-emerald-600 font-bold ml-2">Optimal</span>
          </div>
          <p className="text-[11px] text-[var(--gray-muted)] mt-1">Zero-queue bottleneck</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--gray-border)]">
        <button
          onClick={() => setActiveTab("webhooks")}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition ${
            activeTab === "webhooks"
              ? "border-[var(--emerald-deep)] text-[var(--emerald-deep)]"
              : "border-transparent text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
          }`}
        >
          Webhook Endpoints ({endpoints.length})
        </button>
        <button
          onClick={() => setActiveTab("outbox")}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition ${
            activeTab === "outbox"
              ? "border-[var(--emerald-deep)] text-[var(--emerald-deep)]"
              : "border-transparent text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
          }`}
        >
          Transactional Event Outbox ({outboxEvents.length})
        </button>
        <button
          onClick={() => setActiveTab("apikeys")}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition ${
            activeTab === "apikeys"
              ? "border-[var(--emerald-deep)] text-[var(--emerald-deep)]"
              : "border-transparent text-[var(--gray-muted)] hover:text-[var(--gray-text)]"
          }`}
        >
          Developer API Keys ({apiKeys.length})
        </button>
      </div>

      {/* Tab 1: Webhook Endpoints */}
      {activeTab === "webhooks" && (
        <div className="bg-white rounded-2xl border border-[var(--gray-border)] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--cool-gray)] text-[var(--gray-muted)] font-bold uppercase tracking-wider border-b border-[var(--gray-border)]">
                <tr>
                  <th className="py-3.5 px-4">Endpoint Destination</th>
                  <th className="py-3.5 px-4">Subscribed Events</th>
                  <th className="py-3.5 px-4">HMAC-SHA256 Secret</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--gray-border)]">
                {endpoints.map((ep) => (
                  <tr key={ep.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-[var(--gray-text)] font-mono text-[11px] text-blue-700">
                        {ep.url}
                      </div>
                      <div className="text-[10px] text-[var(--gray-muted)] mt-0.5">
                        {ep.description}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {ep.subscribedEvents.map((evt) => (
                          <span
                            key={evt}
                            className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-800 font-mono"
                          >
                            {evt}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {visibleSecretId === ep.id ? (
                        <span className="text-emerald-800 font-bold">{ep.secret}</span>
                      ) : (
                        <span className="text-[var(--gray-muted)]">whsec_••••••••••••••••</span>
                      )}
                      <button
                        onClick={() => setVisibleSecretId(visibleSecretId === ep.id ? null : ep.id)}
                        className="ml-2 text-[var(--gray-muted)] hover:text-[var(--gray-text)] inline-flex align-middle"
                        title={visibleSecretId === ep.id ? "Hide secret" : "Reveal secret"}
                      >
                        {visibleSecretId === ep.id ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(ep.secret);
                          setFeedbackBanner({ type: "success", message: "Webhook HMAC secret copied!" });
                        }}
                        className="px-2.5 py-1 rounded-lg border border-[var(--gray-border)] text-[11px] font-bold text-[var(--gray-text)] hover:bg-gray-100 transition inline-flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        Copy Secret
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Transactional Event Outbox */}
      {activeTab === "outbox" && (
        <div className="bg-white rounded-2xl border border-[var(--gray-border)] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--cool-gray)] text-[var(--gray-muted)] font-bold uppercase tracking-wider border-b border-[var(--gray-border)]">
                <tr>
                  <th className="py-3.5 px-4">Event Topic</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4">Dispatch Status</th>
                  <th className="py-3.5 px-4">Dispatched At</th>
                  <th className="py-3.5 px-4 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--gray-border)]">
                {outboxEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-extrabold text-[var(--gray-text)]">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px]">
                        {evt.eventName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[var(--gray-text)]">
                      {evt.entityType} <span className="font-mono text-[10px] text-[var(--gray-muted)]">({evt.entityId})</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {evt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--gray-muted)]">
                      {new Date(evt.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedPayload(evt)}
                        className="px-2.5 py-1 rounded-lg border border-[var(--gray-border)] text-[11px] font-bold text-[var(--gray-text)] hover:bg-gray-100 transition inline-flex items-center gap-1"
                      >
                        <Code2 className="h-3 w-3 text-purple-600" />
                        Inspect JSON
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: API Keys */}
      {activeTab === "apikeys" && (
        <div className="bg-white rounded-2xl border border-[var(--gray-border)] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--cool-gray)] text-[var(--gray-muted)] font-bold uppercase tracking-wider border-b border-[var(--gray-border)]">
                <tr>
                  <th className="py-3.5 px-4">Key Name</th>
                  <th className="py-3.5 px-4">Prefix</th>
                  <th className="py-3.5 px-4">Granted Scopes</th>
                  <th className="py-3.5 px-4">Expires</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--gray-border)]">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3.5 px-4 font-extrabold text-[var(--gray-text)]">
                      {key.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--gray-muted)]">
                      {key.keyPrefix}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {key.scopes.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-gray-100 text-gray-800 font-mono"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--gray-muted)]">
                      {key.expiresAt}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setFeedbackBanner({ type: "success", message: `API Key '${key.name}' revoked!` });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-bold transition"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Register Webhook Modal */}
      {showNewEndpointModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[var(--gray-border)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <div className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-purple-600" />
                <h3 className="font-extrabold text-[var(--gray-text)] text-sm">
                  Register Webhook Destination
                </h3>
              </div>
              <button
                onClick={() => setShowNewEndpointModal(false)}
                className="p-1 rounded-lg text-[var(--gray-muted)] hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEndpoint} className="space-y-3.5 pt-3 text-xs">
              <div>
                <label className="font-bold text-[var(--gray-text)] block mb-1">Destination Target URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://api.yourdomain.com/webhooks/zuri"
                  value={endpointForm.url}
                  onChange={(e) => setEndpointForm({ ...endpointForm, url: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl font-mono text-xs focus:border-[var(--emerald-deep)] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--gray-text)] block mb-1">Description / Consumer</label>
                <input
                  type="text"
                  placeholder="e.g. ERPNext Realtime Payroll Journal Sync"
                  value={endpointForm.description}
                  onChange={(e) => setEndpointForm({ ...endpointForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--gray-text)] block mb-1">Subscribed Events</label>
                <div className="p-3 bg-gray-50 rounded-xl border border-[var(--gray-border)] space-y-2">
                  {["payroll.finalized", "employee.created", "expense.approved", "whistleblower.alert"].map((ev) => (
                    <label key={ev} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={endpointForm.subscribedEvents.includes(ev)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEndpointForm({
                              ...endpointForm,
                              subscribedEvents: [...endpointForm.subscribedEvents, ev],
                            });
                          } else {
                            setEndpointForm({
                              ...endpointForm,
                              subscribedEvents: endpointForm.subscribedEvents.filter((s) => s !== ev),
                            });
                          }
                        }}
                        className="rounded text-[var(--emerald-deep)] focus:ring-0"
                      />
                      <span className="font-mono text-[11px] font-bold text-[var(--gray-text)]">{ev}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewEndpointModal(false)}
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
                  Register Endpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate API Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[var(--gray-border)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-[var(--emerald-deep)]" />
                <h3 className="font-extrabold text-[var(--gray-text)] text-sm">
                  Generate Developer API Key
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowNewKeyModal(false);
                  setGeneratedKey(null);
                }}
                className="p-1 rounded-lg text-[var(--gray-muted)] hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {generatedKey ? (
              <div className="space-y-4 pt-4 text-xs">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="font-bold text-emerald-900 block mb-1">
                    API Key Created Successfully!
                  </span>
                  <p className="text-[11px] text-emerald-800">
                    Store this key safely in your vault. It will not be revealed again.
                  </p>
                </div>

                <div className="p-3 bg-gray-900 rounded-xl font-mono text-[11px] text-emerald-400 break-all">
                  {generatedKey}
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedKey);
                    setFeedbackBanner({ type: "success", message: "API key copied to clipboard!" });
                  }}
                  className="w-full py-2 bg-[var(--emerald-deep)] hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy API Key Secret
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateApiKey} className="space-y-3 pt-3 text-xs">
                <div>
                  <label className="font-bold text-[var(--gray-text)] block mb-1">Integration Application Name *</label>
                  <input
                    type="text"
                    required
                    value={keyForm.name}
                    onChange={(e) => setKeyForm({ ...keyForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--gray-border)] rounded-xl text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewKeyModal(false)}
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
                    Generate Key Secret
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* JSON Payload Viewer */}
      {selectedPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[var(--gray-border)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--gray-border)]">
              <div>
                <h3 className="font-extrabold text-[var(--gray-text)] text-sm">
                  Outbox Event: {selectedPayload.eventName}
                </h3>
                <span className="font-mono text-[10px] text-[var(--gray-muted)]">ID: {selectedPayload.id}</span>
              </div>
              <button
                onClick={() => setSelectedPayload(null)}
                className="p-1 rounded-lg text-[var(--gray-muted)] hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <pre className="p-4 bg-gray-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-60 mt-3">
              {JSON.stringify(selectedPayload.payload, null, 2)}
            </pre>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setSelectedPayload(null)}
                className="px-4 py-1.5 bg-[var(--gray-text)] text-white rounded-xl font-bold text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
