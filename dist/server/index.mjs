// src/server/schema.ts
import { pgTable, varchar, text, boolean, timestamp, jsonb, index, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { z } from "zod";
var feedbackReports = pgTable("feedback_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportType: text("report_type").notNull().default("bug"),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("new"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  stepsToReproduce: text("steps_to_reproduce"),
  expectedBehavior: text("expected_behavior"),
  actualBehavior: text("actual_behavior"),
  pageUrl: text("page_url"),
  pageTitle: text("page_title"),
  browserInfo: text("browser_info"),
  screenResolution: text("screen_resolution"),
  screenshotUrl: text("screenshot_url"),
  annotationsJson: jsonb("annotations_json"),
  reporterId: varchar("reporter_id"),
  reporterName: text("reporter_name"),
  reporterEmail: text("reporter_email"),
  reporterRole: text("reporter_role"),
  assignedTo: varchar("assigned_to"),
  assignedToName: text("assigned_to_name"),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by"),
  resolutionNotes: text("resolution_notes"),
  linkedProjectId: varchar("linked_project_id"),
  aiSummary: text("ai_summary"),
  aiSuggestedPriority: text("ai_suggested_priority"),
  aiSimilarityGroup: varchar("ai_similarity_group"),
  upvoteCount: integer("upvote_count").default(0).notNull(),
  commentCount: integer("comment_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => [
  index("feedback_reports_type_idx").on(table.reportType),
  index("feedback_reports_status_idx").on(table.status),
  index("feedback_reports_priority_idx").on(table.priority),
  index("feedback_reports_reporter_idx").on(table.reporterId),
  index("feedback_reports_assigned_idx").on(table.assignedTo),
  index("feedback_reports_created_at_idx").on(table.createdAt)
]);
var feedbackReportComments = pgTable("feedback_report_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar("report_id").notNull().references(() => feedbackReports.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").default(false),
  authorId: varchar("author_id"),
  authorName: text("author_name").notNull(),
  authorRole: text("author_role"),
  parentCommentId: varchar("parent_comment_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => [
  index("feedback_comments_report_idx").on(table.reportId),
  index("feedback_comments_author_idx").on(table.authorId)
]);
var feedbackReportEvents = pgTable("feedback_report_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar("report_id").notNull().references(() => feedbackReports.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  description: text("description"),
  actorId: varchar("actor_id"),
  actorName: text("actor_name"),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => [
  index("feedback_events_report_idx").on(table.reportId),
  index("feedback_events_type_idx").on(table.eventType)
]);
var feedbackReportUpvotes = pgTable("feedback_report_upvotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar("report_id").notNull().references(() => feedbackReports.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => [
  index("feedback_upvotes_report_idx").on(table.reportId),
  index("feedback_upvotes_user_idx").on(table.userId)
]);
var insertFeedbackReportSchema = z.object({
  reportType: z.enum(["bug", "feature_request", "enhancement", "general_feedback"]).default("bug"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  status: z.enum(["new", "in_review", "planned", "in_progress", "resolved", "closed"]).default("new"),
  title: z.string().min(1),
  description: z.string().min(1),
  stepsToReproduce: z.string().nullable().optional(),
  expectedBehavior: z.string().nullable().optional(),
  actualBehavior: z.string().nullable().optional(),
  pageUrl: z.string().nullable().optional(),
  pageTitle: z.string().nullable().optional(),
  browserInfo: z.string().nullable().optional(),
  screenResolution: z.string().nullable().optional(),
  screenshotUrl: z.string().nullable().optional(),
  annotationsJson: z.any().nullable().optional(),
  reporterId: z.string().nullable().optional(),
  reporterName: z.string().nullable().optional(),
  reporterEmail: z.string().nullable().optional(),
  reporterRole: z.string().nullable().optional(),
  assignedTo: z.string().nullable().optional(),
  assignedToName: z.string().nullable().optional(),
  resolvedBy: z.string().nullable().optional(),
  resolutionNotes: z.string().nullable().optional(),
  linkedProjectId: z.string().nullable().optional(),
  aiSummary: z.string().nullable().optional(),
  aiSuggestedPriority: z.string().nullable().optional(),
  aiSimilarityGroup: z.string().nullable().optional()
});
var insertFeedbackCommentSchema = z.object({
  reportId: z.string(),
  content: z.string().min(1),
  isInternal: z.boolean().default(false),
  authorId: z.string().nullable().optional(),
  authorName: z.string(),
  authorRole: z.string().nullable().optional(),
  parentCommentId: z.string().nullable().optional()
});
var insertFeedbackEventSchema = z.object({
  reportId: z.string(),
  eventType: z.string(),
  previousValue: z.string().nullable().optional(),
  newValue: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  actorId: z.string().nullable().optional(),
  actorName: z.string().nullable().optional()
});

// src/server/routes.ts
import { Router } from "express";
import { eq, desc, and, sql as sql2 } from "drizzle-orm";
function createFeedbackRouter(options) {
  const router = Router();
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
      if (status) conditions.push(eq(feedbackReports.status, status));
      if (reportType) conditions.push(eq(feedbackReports.reportType, reportType));
      if (priority) conditions.push(eq(feedbackReports.priority, priority));
      if (search) {
        conditions.push(
          sql2`(${feedbackReports.title} ILIKE ${`%${search}%`} OR ${feedbackReports.description} ILIKE ${`%${search}%`})`
        );
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
      const [reports, countResult] = await Promise.all([
        db.select().from(feedbackReports).where(whereClause).orderBy(desc(feedbackReports.createdAt)).limit(limitNum).offset(offset),
        db.select({ count: sql2`count(*)` }).from(feedbackReports).where(whereClause)
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
      const [report] = await db.select().from(feedbackReports).where(eq(feedbackReports.id, req.params.id)).limit(1);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      const [comments, events] = await Promise.all([
        db.select().from(feedbackReportComments).where(eq(feedbackReportComments.reportId, report.id)).orderBy(desc(feedbackReportComments.createdAt)),
        db.select().from(feedbackReportEvents).where(eq(feedbackReportEvents.reportId, report.id)).orderBy(desc(feedbackReportEvents.createdAt))
      ]);
      res.json({ ...report, comments, events });
    } catch (error) {
      console.error("Error fetching feedback report:", error);
      res.status(500).json({ error: "Failed to fetch feedback report" });
    }
  });
  router.patch("/reports/:id", requireAdmin, async (req, res) => {
    try {
      const [existing] = await db.select().from(feedbackReports).where(eq(feedbackReports.id, req.params.id)).limit(1);
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
      const [updated] = await db.update(feedbackReports).set(updates).where(eq(feedbackReports.id, req.params.id)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Error updating feedback report:", error);
      res.status(500).json({ error: "Failed to update feedback report" });
    }
  });
  router.delete("/reports/:id", requireAdmin, async (req, res) => {
    try {
      const [deleted] = await db.delete(feedbackReports).where(eq(feedbackReports.id, req.params.id)).returning();
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
        commentCount: sql2`${feedbackReports.commentCount} + 1`,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(feedbackReports.id, req.params.id));
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
        and(
          eq(feedbackReportUpvotes.reportId, req.params.id),
          eq(feedbackReportUpvotes.userId, userId)
        )
      ).limit(1);
      if (existing) {
        await db.delete(feedbackReportUpvotes).where(eq(feedbackReportUpvotes.id, existing.id));
        await db.update(feedbackReports).set({ upvoteCount: sql2`GREATEST(0, ${feedbackReports.upvoteCount} - 1)` }).where(eq(feedbackReports.id, req.params.id));
        return res.json({ upvoted: false });
      }
      await db.insert(feedbackReportUpvotes).values({
        reportId: req.params.id,
        userId
      });
      await db.update(feedbackReports).set({ upvoteCount: sql2`${feedbackReports.upvoteCount} + 1` }).where(eq(feedbackReports.id, req.params.id));
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
        db.select({ count: sql2`count(*)` }).from(feedbackReports),
        db.select({
          status: feedbackReports.status,
          count: sql2`count(*)`
        }).from(feedbackReports).groupBy(feedbackReports.status),
        db.select({
          reportType: feedbackReports.reportType,
          count: sql2`count(*)`
        }).from(feedbackReports).groupBy(feedbackReports.reportType),
        db.select({
          priority: feedbackReports.priority,
          count: sql2`count(*)`
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
export {
  createFeedbackRouter,
  feedbackReportComments,
  feedbackReportEvents,
  feedbackReportUpvotes,
  feedbackReports,
  insertFeedbackCommentSchema,
  insertFeedbackEventSchema,
  insertFeedbackReportSchema
};
//# sourceMappingURL=index.mjs.map