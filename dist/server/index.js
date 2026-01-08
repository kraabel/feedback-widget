"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/server/index.ts
var index_exports = {};
__export(index_exports, {
  createFeedbackRouter: () => createFeedbackRouter,
  feedbackReportComments: () => feedbackReportComments,
  feedbackReportEvents: () => feedbackReportEvents,
  feedbackReportUpvotes: () => feedbackReportUpvotes,
  feedbackReports: () => feedbackReports,
  insertFeedbackCommentSchema: () => insertFeedbackCommentSchema,
  insertFeedbackEventSchema: () => insertFeedbackEventSchema,
  insertFeedbackReportSchema: () => insertFeedbackReportSchema
});
module.exports = __toCommonJS(index_exports);

// src/server/schema.ts
var import_pg_core = require("drizzle-orm/pg-core");
var import_drizzle_orm = require("drizzle-orm");
var import_zod = require("zod");
var feedbackReports = (0, import_pg_core.pgTable)("feedback_reports", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  reportType: (0, import_pg_core.text)("report_type").notNull().default("bug"),
  priority: (0, import_pg_core.text)("priority").notNull().default("medium"),
  status: (0, import_pg_core.text)("status").notNull().default("new"),
  title: (0, import_pg_core.text)("title").notNull(),
  description: (0, import_pg_core.text)("description").notNull(),
  stepsToReproduce: (0, import_pg_core.text)("steps_to_reproduce"),
  expectedBehavior: (0, import_pg_core.text)("expected_behavior"),
  actualBehavior: (0, import_pg_core.text)("actual_behavior"),
  pageUrl: (0, import_pg_core.text)("page_url"),
  pageTitle: (0, import_pg_core.text)("page_title"),
  browserInfo: (0, import_pg_core.text)("browser_info"),
  screenResolution: (0, import_pg_core.text)("screen_resolution"),
  screenshotUrl: (0, import_pg_core.text)("screenshot_url"),
  annotationsJson: (0, import_pg_core.jsonb)("annotations_json"),
  reporterId: (0, import_pg_core.varchar)("reporter_id"),
  reporterName: (0, import_pg_core.text)("reporter_name"),
  reporterEmail: (0, import_pg_core.text)("reporter_email"),
  reporterRole: (0, import_pg_core.text)("reporter_role"),
  assignedTo: (0, import_pg_core.varchar)("assigned_to"),
  assignedToName: (0, import_pg_core.text)("assigned_to_name"),
  resolvedAt: (0, import_pg_core.timestamp)("resolved_at"),
  resolvedBy: (0, import_pg_core.varchar)("resolved_by"),
  resolutionNotes: (0, import_pg_core.text)("resolution_notes"),
  linkedProjectId: (0, import_pg_core.varchar)("linked_project_id"),
  aiSummary: (0, import_pg_core.text)("ai_summary"),
  aiSuggestedPriority: (0, import_pg_core.text)("ai_suggested_priority"),
  aiSimilarityGroup: (0, import_pg_core.varchar)("ai_similarity_group"),
  upvoteCount: (0, import_pg_core.integer)("upvote_count").default(0).notNull(),
  commentCount: (0, import_pg_core.integer)("comment_count").default(0).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (table) => [
  (0, import_pg_core.index)("feedback_reports_type_idx").on(table.reportType),
  (0, import_pg_core.index)("feedback_reports_status_idx").on(table.status),
  (0, import_pg_core.index)("feedback_reports_priority_idx").on(table.priority),
  (0, import_pg_core.index)("feedback_reports_reporter_idx").on(table.reporterId),
  (0, import_pg_core.index)("feedback_reports_assigned_idx").on(table.assignedTo),
  (0, import_pg_core.index)("feedback_reports_created_at_idx").on(table.createdAt)
]);
var feedbackReportComments = (0, import_pg_core.pgTable)("feedback_report_comments", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  reportId: (0, import_pg_core.varchar)("report_id").notNull().references(() => feedbackReports.id, { onDelete: "cascade" }),
  content: (0, import_pg_core.text)("content").notNull(),
  isInternal: (0, import_pg_core.boolean)("is_internal").default(false),
  authorId: (0, import_pg_core.varchar)("author_id"),
  authorName: (0, import_pg_core.text)("author_name").notNull(),
  authorRole: (0, import_pg_core.text)("author_role"),
  parentCommentId: (0, import_pg_core.varchar)("parent_comment_id"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (table) => [
  (0, import_pg_core.index)("feedback_comments_report_idx").on(table.reportId),
  (0, import_pg_core.index)("feedback_comments_author_idx").on(table.authorId)
]);
var feedbackReportEvents = (0, import_pg_core.pgTable)("feedback_report_events", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  reportId: (0, import_pg_core.varchar)("report_id").notNull().references(() => feedbackReports.id, { onDelete: "cascade" }),
  eventType: (0, import_pg_core.text)("event_type").notNull(),
  previousValue: (0, import_pg_core.text)("previous_value"),
  newValue: (0, import_pg_core.text)("new_value"),
  description: (0, import_pg_core.text)("description"),
  actorId: (0, import_pg_core.varchar)("actor_id"),
  actorName: (0, import_pg_core.text)("actor_name"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (table) => [
  (0, import_pg_core.index)("feedback_events_report_idx").on(table.reportId),
  (0, import_pg_core.index)("feedback_events_type_idx").on(table.eventType)
]);
var feedbackReportUpvotes = (0, import_pg_core.pgTable)("feedback_report_upvotes", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  reportId: (0, import_pg_core.varchar)("report_id").notNull().references(() => feedbackReports.id, { onDelete: "cascade" }),
  userId: (0, import_pg_core.varchar)("user_id").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (table) => [
  (0, import_pg_core.index)("feedback_upvotes_report_idx").on(table.reportId),
  (0, import_pg_core.index)("feedback_upvotes_user_idx").on(table.userId)
]);
var insertFeedbackReportSchema = import_zod.z.object({
  reportType: import_zod.z.enum(["bug", "feature_request", "enhancement", "general_feedback"]).default("bug"),
  priority: import_zod.z.enum(["low", "medium", "high", "critical"]).default("medium"),
  status: import_zod.z.enum(["new", "in_review", "planned", "in_progress", "resolved", "closed"]).default("new"),
  title: import_zod.z.string().min(1),
  description: import_zod.z.string().min(1),
  stepsToReproduce: import_zod.z.string().nullable().optional(),
  expectedBehavior: import_zod.z.string().nullable().optional(),
  actualBehavior: import_zod.z.string().nullable().optional(),
  pageUrl: import_zod.z.string().nullable().optional(),
  pageTitle: import_zod.z.string().nullable().optional(),
  browserInfo: import_zod.z.string().nullable().optional(),
  screenResolution: import_zod.z.string().nullable().optional(),
  screenshotUrl: import_zod.z.string().nullable().optional(),
  annotationsJson: import_zod.z.any().nullable().optional(),
  reporterId: import_zod.z.string().nullable().optional(),
  reporterName: import_zod.z.string().nullable().optional(),
  reporterEmail: import_zod.z.string().nullable().optional(),
  reporterRole: import_zod.z.string().nullable().optional(),
  assignedTo: import_zod.z.string().nullable().optional(),
  assignedToName: import_zod.z.string().nullable().optional(),
  resolvedBy: import_zod.z.string().nullable().optional(),
  resolutionNotes: import_zod.z.string().nullable().optional(),
  linkedProjectId: import_zod.z.string().nullable().optional(),
  aiSummary: import_zod.z.string().nullable().optional(),
  aiSuggestedPriority: import_zod.z.string().nullable().optional(),
  aiSimilarityGroup: import_zod.z.string().nullable().optional()
});
var insertFeedbackCommentSchema = import_zod.z.object({
  reportId: import_zod.z.string(),
  content: import_zod.z.string().min(1),
  isInternal: import_zod.z.boolean().default(false),
  authorId: import_zod.z.string().nullable().optional(),
  authorName: import_zod.z.string(),
  authorRole: import_zod.z.string().nullable().optional(),
  parentCommentId: import_zod.z.string().nullable().optional()
});
var insertFeedbackEventSchema = import_zod.z.object({
  reportId: import_zod.z.string(),
  eventType: import_zod.z.string(),
  previousValue: import_zod.z.string().nullable().optional(),
  newValue: import_zod.z.string().nullable().optional(),
  description: import_zod.z.string().nullable().optional(),
  actorId: import_zod.z.string().nullable().optional(),
  actorName: import_zod.z.string().nullable().optional()
});

// src/server/routes.ts
var import_express = require("express");
var import_drizzle_orm2 = require("drizzle-orm");
function createFeedbackRouter(options) {
  const router = (0, import_express.Router)();
  const { db, authMiddleware, adminMiddleware, onReportCreated, onStatusChanged } = options;
  const optionalAuth = authMiddleware || ((req, res, next) => next());
  const requireAdmin = adminMiddleware || ((req, res, next) => next());
  router.post("/reports", optionalAuth, async (req, res) => {
    try {
      const parsed = insertFeedbackReportSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsed.error.errors });
      }
      const [report] = await db.insert(feedbackReports).values(parsed.data).returning();
      onReportCreated?.(report);
      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating feedback report:", error);
      res.status(500).json({ error: "Failed to create feedback report" });
    }
  });
  router.get("/reports", requireAdmin, async (req, res) => {
    try {
      const {
        status,
        reportType,
        priority,
        search,
        page = "1",
        limit = "20"
      } = req.query;
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;
      const conditions = [];
      if (status) conditions.push((0, import_drizzle_orm2.eq)(feedbackReports.status, status));
      if (reportType) conditions.push((0, import_drizzle_orm2.eq)(feedbackReports.reportType, reportType));
      if (priority) conditions.push((0, import_drizzle_orm2.eq)(feedbackReports.priority, priority));
      if (search) {
        conditions.push(
          import_drizzle_orm2.sql`(${feedbackReports.title} ILIKE ${`%${search}%`} OR ${feedbackReports.description} ILIKE ${`%${search}%`})`
        );
      }
      const whereClause = conditions.length > 0 ? (0, import_drizzle_orm2.and)(...conditions) : void 0;
      const [reports, countResult] = await Promise.all([
        db.select().from(feedbackReports).where(whereClause).orderBy((0, import_drizzle_orm2.desc)(feedbackReports.createdAt)).limit(limitNum).offset(offset),
        db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(feedbackReports).where(whereClause)
      ]);
      const total = Number(countResult[0]?.count || 0);
      res.json({
        reports,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error("Error fetching feedback reports:", error);
      res.status(500).json({ error: "Failed to fetch feedback reports" });
    }
  });
  router.get("/reports/:id", requireAdmin, async (req, res) => {
    try {
      const [report] = await db.select().from(feedbackReports).where((0, import_drizzle_orm2.eq)(feedbackReports.id, req.params.id)).limit(1);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      const [comments, events] = await Promise.all([
        db.select().from(feedbackReportComments).where((0, import_drizzle_orm2.eq)(feedbackReportComments.reportId, report.id)).orderBy((0, import_drizzle_orm2.desc)(feedbackReportComments.createdAt)),
        db.select().from(feedbackReportEvents).where((0, import_drizzle_orm2.eq)(feedbackReportEvents.reportId, report.id)).orderBy((0, import_drizzle_orm2.desc)(feedbackReportEvents.createdAt))
      ]);
      res.json({ ...report, comments, events });
    } catch (error) {
      console.error("Error fetching feedback report:", error);
      res.status(500).json({ error: "Failed to fetch feedback report" });
    }
  });
  router.patch("/reports/:id", requireAdmin, async (req, res) => {
    try {
      const [existing] = await db.select().from(feedbackReports).where((0, import_drizzle_orm2.eq)(feedbackReports.id, req.params.id)).limit(1);
      if (!existing) {
        return res.status(404).json({ error: "Report not found" });
      }
      const { status, priority, assignedTo, assignedToName, resolutionNotes, ...otherUpdates } = req.body;
      const updates = { ...otherUpdates, updatedAt: /* @__PURE__ */ new Date() };
      if (status && status !== existing.status) {
        updates.status = status;
        if (status === "resolved") {
          updates.resolvedAt = /* @__PURE__ */ new Date();
        }
        await db.insert(feedbackReportEvents).values({
          reportId: existing.id,
          eventType: "status_change",
          previousValue: existing.status,
          newValue: status,
          actorName: req.body.actorName || "System"
        });
        onStatusChanged?.(existing, existing.status, status);
      }
      if (priority !== void 0) updates.priority = priority;
      if (assignedTo !== void 0) updates.assignedTo = assignedTo;
      if (assignedToName !== void 0) updates.assignedToName = assignedToName;
      if (resolutionNotes !== void 0) updates.resolutionNotes = resolutionNotes;
      const [updated] = await db.update(feedbackReports).set(updates).where((0, import_drizzle_orm2.eq)(feedbackReports.id, req.params.id)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error updating feedback report:", error);
      res.status(500).json({ error: "Failed to update feedback report" });
    }
  });
  router.delete("/reports/:id", requireAdmin, async (req, res) => {
    try {
      const [deleted] = await db.delete(feedbackReports).where((0, import_drizzle_orm2.eq)(feedbackReports.id, req.params.id)).returning();
      if (!deleted) {
        return res.status(404).json({ error: "Report not found" });
      }
      res.json({ success: true, deleted });
    } catch (error) {
      console.error("Error deleting feedback report:", error);
      res.status(500).json({ error: "Failed to delete feedback report" });
    }
  });
  router.post("/reports/:id/comments", optionalAuth, async (req, res) => {
    try {
      const parsed = insertFeedbackCommentSchema.safeParse({
        ...req.body,
        reportId: req.params.id
      });
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsed.error.errors });
      }
      const [comment] = await db.insert(feedbackReportComments).values(parsed.data).returning();
      await db.update(feedbackReports).set({
        commentCount: import_drizzle_orm2.sql`${feedbackReports.commentCount} + 1`,
        updatedAt: /* @__PURE__ */ new Date()
      }).where((0, import_drizzle_orm2.eq)(feedbackReports.id, req.params.id));
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  });
  router.post("/reports/:id/upvote", optionalAuth, async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      const [existing] = await db.select().from(feedbackReportUpvotes).where(
        (0, import_drizzle_orm2.and)(
          (0, import_drizzle_orm2.eq)(feedbackReportUpvotes.reportId, req.params.id),
          (0, import_drizzle_orm2.eq)(feedbackReportUpvotes.userId, userId)
        )
      ).limit(1);
      if (existing) {
        await db.delete(feedbackReportUpvotes).where((0, import_drizzle_orm2.eq)(feedbackReportUpvotes.id, existing.id));
        await db.update(feedbackReports).set({ upvoteCount: import_drizzle_orm2.sql`GREATEST(0, ${feedbackReports.upvoteCount} - 1)` }).where((0, import_drizzle_orm2.eq)(feedbackReports.id, req.params.id));
        return res.json({ upvoted: false });
      }
      await db.insert(feedbackReportUpvotes).values({
        reportId: req.params.id,
        userId
      });
      await db.update(feedbackReports).set({ upvoteCount: import_drizzle_orm2.sql`${feedbackReports.upvoteCount} + 1` }).where((0, import_drizzle_orm2.eq)(feedbackReports.id, req.params.id));
      res.json({ upvoted: true });
    } catch (error) {
      console.error("Error toggling upvote:", error);
      res.status(500).json({ error: "Failed to toggle upvote" });
    }
  });
  router.get("/stats", requireAdmin, async (req, res) => {
    try {
      const [
        totalResult,
        byStatusResult,
        byTypeResult,
        byPriorityResult
      ] = await Promise.all([
        db.select({ count: import_drizzle_orm2.sql`count(*)` }).from(feedbackReports),
        db.select({
          status: feedbackReports.status,
          count: import_drizzle_orm2.sql`count(*)`
        }).from(feedbackReports).groupBy(feedbackReports.status),
        db.select({
          reportType: feedbackReports.reportType,
          count: import_drizzle_orm2.sql`count(*)`
        }).from(feedbackReports).groupBy(feedbackReports.reportType),
        db.select({
          priority: feedbackReports.priority,
          count: import_drizzle_orm2.sql`count(*)`
        }).from(feedbackReports).groupBy(feedbackReports.priority)
      ]);
      res.json({
        total: Number(totalResult[0]?.count || 0),
        byStatus: byStatusResult.reduce((acc, row) => {
          acc[row.status] = Number(row.count);
          return acc;
        }, {}),
        byType: byTypeResult.reduce((acc, row) => {
          acc[row.reportType] = Number(row.count);
          return acc;
        }, {}),
        byPriority: byPriorityResult.reduce((acc, row) => {
          acc[row.priority] = Number(row.count);
          return acc;
        }, {})
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });
  return router;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createFeedbackRouter,
  feedbackReportComments,
  feedbackReportEvents,
  feedbackReportUpvotes,
  feedbackReports,
  insertFeedbackCommentSchema,
  insertFeedbackEventSchema,
  insertFeedbackReportSchema
});
//# sourceMappingURL=index.js.map