/**
 * =========================================================================================
 * WORKFORCE SOCIAL COLLABORATION, CHAT, COMMENTS & KUDOS ROUTER
 * =========================================================================================
 * Unified social fabric for the enterprise:
 * 1. Real-time In-App Chat & Channels (Direct 1-on-1, #engineering, #general)
 * 2. Universal Polymorphic Comments across ANY entity with visibility scopes
 * 3. Peer-to-Peer Recognition Kudos with company value badges & emoji cheer reactions
 * 4. Enterprise Bulletin Board Announcements with read receipts
 * =========================================================================================
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";
import { db } from "@/db";
import {
  conversations,
  chatMessages,
  conversationParticipants,
  chatReactions,
  chatMentions,
} from "@/db/schema/chat-and-inbox";
import {
  comments,
  commentMentions,
  commentReactions,
} from "@/db/schema/comments-and-mentions";
import { kudosAwards, kudosReactions } from "@/db/schema/recognition-kudos";
import { announcements, announcementReads } from "@/db/schema/calendar-comms";

export const socialRouter = new Hono<AppEnv>();

// Default in-memory seed records
const memoryConversations: any[] = [
  {
    id: "conv-eng-channel",
    name: "#engineering-all-hands",
    type: "channel",
    description: "East Africa engineering team sync & architectural updates",
    isActive: true,
    unreadCount: 2,
    createdAt: new Date("2026-08-01T10:00:00Z"),
  },
  {
    id: "conv-dm-01",
    name: "Direct: Sarah Jenkins & Kwame Mensah",
    type: "direct",
    description: null,
    isActive: true,
    unreadCount: 0,
    createdAt: new Date("2026-09-01T14:00:00Z"),
  },
];

const memoryMessages: any[] = [
  {
    id: "msg-01",
    conversationId: "conv-eng-channel",
    senderUserId: "emp-001",
    senderName: "Kwame Mensah",
    messageType: "text",
    content: "Team, Phase 5 enterprise automation backend is fully deployed with zero regression.",
    createdAt: new Date("2026-09-17T10:00:00Z"),
  },
  {
    id: "msg-02",
    conversationId: "conv-eng-channel",
    senderUserId: "usr-lead-002",
    senderName: "David Ochieng",
    messageType: "text",
    content: "Phenomenal work! Running integration test checks now.",
    createdAt: new Date("2026-09-17T10:02:00Z"),
  },
];

const memoryComments: any[] = [
  {
    id: "cmt-01",
    entityType: "candidate",
    entityId: "cand-001",
    authorUserId: "usr-mgr-001",
    authorName: "Sarah Jenkins",
    content: "Outstanding technical interview performance on distributed systems design. Strong hire recommendation.",
    visibility: "internal_hr_only",
    mentions: ["usr-recruiter-01"],
    createdAt: new Date("2026-09-16T16:00:00Z"),
  },
];

const memoryKudos: any[] = [
  {
    id: "kudos-001",
    senderUserId: "emp-002",
    senderName: "Faith Kipchoge",
    receiverUserId: "emp-001",
    receiverName: "Kwame Mensah",
    coreValueTag: "#ExtremeOwnership",
    message: "Huge shoutout to Kwame for leading the cross-border payroll engine integration across 5 countries!",
    points: 100,
    isPublic: true,
    reactions: [
      { id: "kr-01", userId: "usr-ceo-001", emoji: "🏆" },
      { id: "kr-02", userId: "usr-lead-002", emoji: "👏" },
    ],
    createdAt: new Date("2026-09-17T09:30:00Z"),
  },
];

const memoryAnnouncements: any[] = [
  {
    id: "ann-01",
    title: "FY26 Mid-Year Company Town Hall & Strategy Update",
    content: "Join us this Friday at 3:00 PM EAT for our pan-African town hall broadcast from Nairobi HQ.",
    priority: "high",
    targetScope: "all_company",
    authorUserId: "usr-ceo-001",
    isPinned: true,
    publishedAt: new Date("2026-09-15T08:00:00Z"),
    expiresAt: new Date("2026-09-25T18:00:00Z"),
  },
];

const memoryAnnouncementReads: any[] = [];

// ====================================================================
// 1. IN-APP CHAT & CONVERSATIONS
// ====================================================================

socialRouter.get("/conversations", async (c) => {
  return c.json({ success: true, count: memoryConversations.length, data: memoryConversations });
});

const createConvSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["direct", "group", "channel"]).default("channel"),
  description: z.string().optional(),
});

socialRouter.post("/conversations", zValidator("json", createConvSchema), async (c) => {
  const body = c.req.valid("json");
  const newConv = {
    id: `conv-${Date.now()}`,
    name: body.name,
    type: body.type,
    description: body.description || null,
    isActive: true,
    unreadCount: 0,
    createdAt: new Date(),
  };
  memoryConversations.unshift(newConv);
  return c.json({ success: true, message: "Conversation created", data: newConv }, 201);
});

socialRouter.get("/conversations/:id/messages", async (c) => {
  const id = c.req.param("id");
  const msgs = memoryMessages.filter((m) => m.conversationId === id);
  return c.json({ success: true, count: msgs.length, data: msgs });
});

const postMessageSchema = z.object({
  senderUserId: z.string().min(1),
  senderName: z.string().optional(),
  content: z.string().min(1),
  messageType: z.enum(["text", "file", "system_event"]).default("text"),
});

socialRouter.post("/conversations/:id/messages", zValidator("json", postMessageSchema), async (c) => {
  const conversationId = c.req.param("id");
  const body = c.req.valid("json");

  const newMsg = {
    id: `msg-${Date.now()}`,
    conversationId,
    senderUserId: body.senderUserId,
    senderName: body.senderName || "Workforce Member",
    messageType: body.messageType,
    content: body.content,
    createdAt: new Date(),
  };

  memoryMessages.push(newMsg);
  return c.json({ success: true, message: "Message posted", data: newMsg }, 201);
});

// ====================================================================
// 2. UNIVERSAL POLYMORPHIC COMMENTS
// ====================================================================

socialRouter.get("/comments", async (c) => {
  const entityType = c.req.query("entityType");
  const entityId = c.req.query("entityId");

  let filtered = [...memoryComments];
  if (entityType) filtered = filtered.filter((cm) => cm.entityType === entityType);
  if (entityId) filtered = filtered.filter((cm) => cm.entityId === entityId);

  return c.json({ success: true, count: filtered.length, data: filtered });
});

const postCommentSchema = z.object({
  entityType: z.string().min(1), // 'candidate', 'expense_claim', 'leave_application', 'goal', 'employee'
  entityId: z.string().min(1),
  authorUserId: z.string().min(1),
  authorName: z.string().optional(),
  content: z.string().min(1),
  visibility: z.enum(["public", "internal_hr_only", "manager_only"]).default("public"),
  mentions: z.array(z.string()).default([]),
});

socialRouter.post("/comments", zValidator("json", postCommentSchema), async (c) => {
  const body = c.req.valid("json");

  const newComment = {
    id: `cmt-${Date.now()}`,
    entityType: body.entityType,
    entityId: body.entityId,
    authorUserId: body.authorUserId,
    authorName: body.authorName || "Colleague",
    content: body.content,
    visibility: body.visibility,
    mentions: body.mentions,
    createdAt: new Date(),
  };

  memoryComments.unshift(newComment);
  return c.json({ success: true, message: "Comment posted", data: newComment }, 201);
});

// ====================================================================
// 3. RECOGNITION KUDOS WALL
// ====================================================================

socialRouter.get("/kudos", async (c) => {
  return c.json({ success: true, count: memoryKudos.length, data: memoryKudos });
});

const awardKudosSchema = z.object({
  senderUserId: z.string().min(1),
  senderName: z.string().optional(),
  receiverUserId: z.string().min(1),
  receiverName: z.string().optional(),
  coreValueTag: z.string().min(1), // e.g. '#ExtremeOwnership', '#DeliverExcellence'
  message: z.string().min(1),
  points: z.number().int().nonnegative().default(50),
});

socialRouter.post("/kudos", zValidator("json", awardKudosSchema), async (c) => {
  const body = c.req.valid("json");

  const newKudos = {
    id: `kudos-${Date.now()}`,
    senderUserId: body.senderUserId,
    senderName: body.senderName || "Sender",
    receiverUserId: body.receiverUserId,
    receiverName: body.receiverName || "Receiver",
    coreValueTag: body.coreValueTag.startsWith("#") ? body.coreValueTag : `#${body.coreValueTag}`,
    message: body.message,
    points: body.points,
    isPublic: true,
    reactions: [],
    createdAt: new Date(),
  };

  memoryKudos.unshift(newKudos);
  return c.json({ success: true, message: "Kudos awarded and posted to wall", data: newKudos }, 201);
});

const reactKudosSchema = z.object({
  userId: z.string().min(1),
  emoji: z.string().default("👏"),
});

socialRouter.post("/kudos/:id/react", zValidator("json", reactKudosSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const kudos = memoryKudos.find((k) => k.id === id);

  if (!kudos) {
    return c.json({ success: false, message: "Kudos award not found" }, 404);
  }

  const newReact = {
    id: `kr-${Date.now()}`,
    userId: body.userId,
    emoji: body.emoji,
  };

  kudos.reactions.push(newReact);
  return c.json({ success: true, message: "Reaction added", data: kudos });
});

// ====================================================================
// 4. ENTERPRISE ANNOUNCEMENTS
// ====================================================================

socialRouter.get("/announcements", async (c) => {
  return c.json({ success: true, count: memoryAnnouncements.length, data: memoryAnnouncements });
});

const createAnnouncementSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  targetScope: z.string().default("all_company"),
  isPinned: z.boolean().default(false),
  authorUserId: z.string().optional(),
});

socialRouter.post("/announcements", zValidator("json", createAnnouncementSchema), async (c) => {
  const body = c.req.valid("json");

  const newAnn = {
    id: `ann-${Date.now()}`,
    title: body.title,
    content: body.content,
    priority: body.priority,
    targetScope: body.targetScope,
    authorUserId: body.authorUserId || "usr-admin-01",
    isPinned: body.isPinned,
    publishedAt: new Date(),
    expiresAt: null,
  };

  memoryAnnouncements.unshift(newAnn);
  return c.json({ success: true, message: "Announcement broadcasted", data: newAnn }, 201);
});

socialRouter.post("/announcements/:id/read", async (c) => {
  const id = c.req.param("id");
  const userId = c.get("userId") || "usr-emp-001";

  const readRecord = {
    id: `read-${Date.now()}`,
    announcementId: id,
    userId,
    readAt: new Date(),
  };

  memoryAnnouncementReads.push(readRecord);
  return c.json({ success: true, message: "Read receipt recorded", data: readRecord });
});
