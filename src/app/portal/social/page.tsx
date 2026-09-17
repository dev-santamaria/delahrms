"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Award,
  Heart,
  Send,
  Sparkles,
  Smile,
  Hash,
  ShieldCheck,
  Plus,
  Users,
  Search,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react";
import { usePortal } from "@/components/portal/portal-context";

interface ChatMessage {
  id: string;
  sender: string;
  senderRole: string;
  avatar: string;
  avatarColor: string;
  time: string;
  content: string;
  likes: number;
}

interface KudosItem {
  id: string;
  sender: string;
  recipient: string;
  category: "Team Player" | "Safety Champion" | "Innovation" | "Turnaround Hero";
  message: string;
  badge: string;
  emoji: string;
  timestamp: string;
  cheersCount: number;
}

export default function SocialCommunityPage() {
  const { entityInfo } = usePortal();

  const [activeTab, setActiveTab] = useState<"kudos" | "channels">("kudos");
  const [activeChannel, setActiveChannel] = useState<string>("#nairobi-plant");

  // Chat message input
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "Sarah Wanjiku",
      senderRole: "VP Engineering",
      avatar: "SW",
      avatarColor: "bg-purple-600",
      time: "10:15 AM",
      content: "Great effort by Shift B on maintaining zero 12h rest violations this week! The continuous roster is running cleanly.",
      likes: 8,
    },
    {
      id: "msg-2",
      sender: "Engineer David Mutua",
      senderRole: "Plant Maintenance Lead",
      avatar: "DM",
      avatarColor: "bg-blue-600",
      time: "10:42 AM",
      content: "Line 2 high-pressure boiler valves replaced and calibrated. Ready for the evening turnaround.",
      likes: 5,
    },
  ]);

  // Kudos state
  const [kudosList, setKudosList] = useState<KudosItem[]>([
    {
      id: "kd-1",
      sender: "Nelson Mandela CP",
      recipient: "Sarah Jenkins",
      category: "Turnaround Hero",
      message: "Huge thank you for expediting the emergency valve procurement! Kept the continuous cycle running with zero downtime.",
      badge: "Plant Reliability",
      emoji: "🚀",
      timestamp: "2 hours ago",
      cheersCount: 14,
    },
    {
      id: "kd-2",
      sender: "Grace Muthoni",
      recipient: "John Mwangi",
      category: "Team Player",
      message: "Appreciate the quick and seamless shift swap covering the Friday night rotation. True teamwork!",
      badge: "Roster Champion",
      emoji: "🤝",
      timestamp: "5 hours ago",
      cheersCount: 9,
    },
    {
      id: "kd-3",
      sender: "Kennedy Omondi",
      recipient: "Nelson Mandela CP",
      category: "Safety Champion",
      message: "Exceptional handover checklist on the Kisumu Depot to Nairobi Plant domestic relocation package.",
      badge: "Zero Hazard",
      emoji: "🛡️",
      timestamp: "Yesterday",
      cheersCount: 19,
    },
  ]);

  const [kudosModalOpen, setKudosModalOpen] = useState(false);
  const [kudosRecipient, setKudosRecipient] = useState("Sarah Jenkins");
  const [kudosCategory, setKudosCategory] = useState<KudosItem["category"]>("Team Player");
  const [kudosMessage, setKudosMessage] = useState("");
  const [kudosSuccess, setKudosSuccess] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "Nelson Mandela CP",
      senderRole: "Principal Operations Engineer",
      avatar: "NM",
      avatarColor: "bg-[var(--emerald-deep)]",
      time: "Just Now",
      content: messageText,
      likes: 0,
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessageText("");
  };

  const handleSendKudos = (e: React.FormEvent) => {
    e.preventDefault();
    const newKudos: KudosItem = {
      id: `kd-${Date.now()}`,
      sender: "Nelson Mandela CP",
      recipient: kudosRecipient,
      category: kudosCategory,
      message: kudosMessage,
      badge: kudosCategory,
      emoji: kudosCategory === "Safety Champion" ? "🛡️" : kudosCategory === "Innovation" ? "💡" : "🎉",
      timestamp: "Just Now",
      cheersCount: 1,
    };

    setKudosList((prev) => [newKudos, ...prev]);
    setKudosSuccess(true);
    setTimeout(() => {
      setKudosModalOpen(false);
      setKudosSuccess(false);
      setKudosMessage("");
    }, 1500);
  };

  const handleCheerKudos = (id: string) => {
    setKudosList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, cheersCount: k.cheersCount + 1 } : k))
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)]">
              Workplace Community
            </span>
            <span className="text-xs font-mono text-[var(--gray-muted)]">
              DelaHR Culture & Kudos
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--gray-text)] mt-1">
            Team Channels & Kudos Cheer Wall
          </h1>
          <p className="text-xs text-[var(--gray-muted)] mt-0.5">
            Celebrate colleague accomplishments, send recognition cheer, and collaborate across plants, depots, and regional hubs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setKudosModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] text-white text-xs font-bold hover:bg-[var(--emerald-deep-hover)] shadow-xs transition flex items-center gap-1.5"
          >
            <Sparkles className="h-4 w-4" />
            <span>Give Colleague Kudos</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--gray-border)] pb-2 overflow-x-auto">
        {[
          { key: "kudos", label: "Kudos Cheer Wall", icon: Award, count: kudosList.length },
          { key: "channels", label: "Team Channels & Chat", icon: MessageSquare },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "bg-white text-[var(--emerald-deep)] border border-[var(--gray-border)] shadow-xs"
                  : "text-[var(--gray-muted)] hover:text-[var(--gray-text)] hover:bg-gray-100/60"
              }`}
            >
              <IconComp className={`h-3.5 w-3.5 ${isActive ? "text-[var(--emerald-deep)]" : ""}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: Kudos Cheer Wall */}
      {activeTab === "kudos" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kudosList.map((kudos) => (
              <div
                key={kudos.id}
                className="p-6 rounded-3xl bg-white border border-[var(--gray-border)] hover:border-zinc-300 shadow-xs space-y-4 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{kudos.emoji}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--emerald-light)] text-[var(--emerald-deep)]">
                      {kudos.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[var(--gray-text)]">
                      {kudos.recipient}
                    </h3>
                    <p className="text-[11px] text-[var(--gray-muted)]">
                      Recognized by <span className="font-semibold text-zinc-700">{kudos.sender}</span>
                    </p>
                  </div>

                  <p className="text-xs text-zinc-700 bg-[var(--cool-gray)] p-3.5 rounded-2xl leading-relaxed italic">
                    &quot;{kudos.message}&quot;
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400 font-mono">{kudos.timestamp}</span>
                  <button
                    type="button"
                    onClick={() => handleCheerKudos(kudos.id)}
                    className="px-2.5 py-1 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-gray-200 text-[11px] font-bold text-[var(--emerald-deep)] transition flex items-center gap-1.5"
                  >
                    <span>👏</span>
                    <span>{kudos.cheersCount} Cheers</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Whistleblower Safe Notice */}
          <div className="p-5 rounded-3xl bg-gray-50 border border-[var(--gray-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[var(--gray-text)] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[var(--emerald-deep)]" />
                <span>Need to report an anonymous ethics or compliance concern?</span>
              </p>
              <p className="text-[11px] text-[var(--gray-muted)]">
                Our segregated whistleblower vault encrypts your identity end-to-end with zero employee tracking.
              </p>
            </div>
            <Link
              href="/portal/ethics-vault"
              className="px-3.5 py-1.5 rounded-xl bg-white border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-text)] hover:bg-gray-100 transition shrink-0"
            >
              Open Ethics Vault →
            </Link>
          </div>
        </div>
      )}

      {/* TAB 2: Team Channels & Chat */}
      {activeTab === "channels" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Channels Sidebar (4 cols) */}
          <div className="lg:col-span-4 p-5 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--gray-muted)]">
              Operational Channels
            </h3>

            <div className="space-y-1">
              {[
                { name: "#nairobi-plant", desc: "Industrial Plant Shifts & Maintenance", unread: 2 },
                { name: "#kisumu-depot", desc: "Lake Basin Regional Depot Logistics" },
                { name: "#general-announcements", desc: "Company-Wide Broadcasts" },
                { name: "#engineering-ops", desc: "Continuous 24/7 Turnaround" },
              ].map((ch) => {
                const isActive = activeChannel === ch.name;
                return (
                  <button
                    key={ch.name}
                    type="button"
                    onClick={() => setActiveChannel(ch.name)}
                    className={`w-full p-2.5 rounded-2xl text-left transition flex items-center justify-between ${
                      isActive
                        ? "bg-[var(--emerald-light)] text-[var(--emerald-deep)] font-bold shadow-2xs"
                        : "hover:bg-[var(--cool-gray)] text-[var(--gray-text)]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Hash className="h-4 w-4 shrink-0 text-gray-400" />
                      <div className="truncate">
                        <p className="text-xs truncate font-semibold">{ch.name}</p>
                        <p className="text-[10px] text-[var(--gray-muted)] truncate">{ch.desc}</p>
                      </div>
                    </div>
                    {ch.unread && (
                      <span className="h-4 w-4 rounded-full bg-[var(--emerald-deep)] text-white text-[9px] font-bold flex items-center justify-center">
                        {ch.unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Chat Conversation (8 cols) */}
          <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-[var(--gray-border)] shadow-xs space-y-4 flex flex-col justify-between min-h-[480px]">
            <div className="space-y-4">
              <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--gray-text)] flex items-center gap-1.5">
                    <Hash className="h-4 w-4 text-[var(--emerald-deep)]" />
                    <span>{activeChannel.replace("#", "")}</span>
                  </h3>
                  <p className="text-[10px] text-[var(--gray-muted)]">Verified Enterprise Station Channel • 142 Participants</p>
                </div>
              </div>

              {/* Messages Stream */}
              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-xl ${msg.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5`}>
                      {msg.avatar}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--gray-text)]">{msg.sender}</span>
                        <span className="text-[9px] text-[var(--gray-muted)]">({msg.senderRole})</span>
                        <span className="text-[9px] text-zinc-400 font-mono">{msg.time}</span>
                      </div>
                      <p className="text-xs text-zinc-700 leading-relaxed bg-[var(--cool-gray)] p-3 rounded-2xl">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-gray-100 flex items-center gap-2">
              <input
                type="text"
                placeholder={`Message ${activeChannel}...`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-[var(--cool-gray)] border border-[var(--gray-border)] text-xs text-[var(--gray-text)] placeholder:text-[var(--gray-muted)] focus:outline-none focus:border-[var(--emerald-deep)]"
              />
              <button
                type="submit"
                className="p-2.5 rounded-2xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white shadow-xs transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Give Kudos Modal */}
      {kudosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[var(--gray-border)] shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[var(--gray-text)] flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[var(--emerald-deep)]" />
                <span>Send Colleague Kudos</span>
              </h3>
              <button type="button" onClick={() => setKudosModalOpen(false)} className="p-1 text-gray-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            {kudosSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-[var(--emerald-deep)] flex items-center justify-center mx-auto text-2xl">
                  🎉
                </div>
                <h4 className="text-base font-bold text-[var(--gray-text)]">Kudos Broadcasted!</h4>
                <p className="text-xs text-[var(--gray-muted)]">
                  Your appreciation has been pinned to the Kudos Cheer Wall for the entire organization to celebrate.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendKudos} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--gray-text)]">Recipient</label>
                  <select
                    value={kudosRecipient}
                    onChange={(e) => setKudosRecipient(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                  >
                    <option value="Sarah Jenkins">Sarah Jenkins (Maintenance Lead)</option>
                    <option value="David Omondi">David Omondi (Kisumu Depot)</option>
                    <option value="Grace Muthoni">Grace Muthoni (Plant Quality)</option>
                    <option value="John Mwangi">John Mwangi (Electrical Specialist)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--gray-text)]">Cheer Category</label>
                  <select
                    value={kudosCategory}
                    onChange={(e) => setKudosCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                  >
                    <option value="Team Player">Team Player 🤝</option>
                    <option value="Safety Champion">Safety Champion 🛡️</option>
                    <option value="Innovation">Innovation & Problem Solving 💡</option>
                    <option value="Turnaround Hero">Turnaround Hero 🚀</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--gray-text)]">Cheer Message</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Write a heartfelt cheer celebrating their contribution..."
                    value={kudosMessage}
                    onChange={(e) => setKudosMessage(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-[var(--gray-border)] bg-gray-50 focus:outline-none focus:border-[var(--emerald-deep)]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setKudosModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[var(--gray-border)] text-xs font-bold text-[var(--gray-muted)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[var(--emerald-deep)] hover:bg-[var(--emerald-deep-hover)] text-white text-xs font-bold shadow-xs"
                  >
                    Post to Cheer Wall
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
