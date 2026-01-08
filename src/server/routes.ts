import { Router } from 'express';
import { eq, desc, and, ilike, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  feedbackReports,
  feedbackReportComments,
  feedbackReportEvents,
  feedbackReportUpvotes,
  insertFeedbackReportSchema,
  insertFeedbackCommentSchema,
} from './schema';

export interface FeedbackRouterOptions {
  db: PostgresJsDatabase<any>;
  authMiddleware?: (req: any, res: any, next: any) => void;
  adminMiddleware?: (req: any, res: any, next: any) => void;
  onReportCreated?: (report: any) => void;
  onStatusChanged?: (report: any, oldStatus: string, newStatus: string) => void;
}

export function createFeedbackRouter(options: FeedbackRouterOptions): Router {
  const router = Router();
  const { db, authMiddleware, adminMiddleware, onReportCreated, onStatusChanged } = options;

  const optionalAuth = authMiddleware || ((req: any, res: any, next: any) => next());
  const requireAdmin = adminMiddleware || ((req: any, res: any, next: any) => next());

  router.post('/reports', optionalAuth, async (req, res) => {
    try {
      const parsed = insertFeedbackReportSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request body', details: parsed.error.errors });
      }

      const [report] = await db.insert(feedbackReports).values(parsed.data).returning();
      
      onReportCreated?.(report);
      
      res.status(201).json(report);
    } catch (error) {
      console.error('Error creating feedback report:', error);
      res.status(500).json({ error: 'Failed to create feedback report' });
    }
  });

  router.get('/reports', requireAdmin, async (req, res) => {
    try {
      const {
        status,
        reportType,
        priority,
        search,
        page = '1',
        limit = '20',
      } = req.query as Record<string, string>;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;

      const conditions = [];
      if (status) conditions.push(eq(feedbackReports.status, status));
      if (reportType) conditions.push(eq(feedbackReports.reportType, reportType));
      if (priority) conditions.push(eq(feedbackReports.priority, priority));
      if (search) {
        conditions.push(
          sql`(${feedbackReports.title} ILIKE ${`%${search}%`} OR ${feedbackReports.description} ILIKE ${`%${search}%`})`
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [reports, countResult] = await Promise.all([
        db
          .select()
          .from(feedbackReports)
          .where(whereClause)
          .orderBy(desc(feedbackReports.createdAt))
          .limit(limitNum)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(feedbackReports)
          .where(whereClause),
      ]);

      const total = Number(countResult[0]?.count || 0);

      res.json({
        reports,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      console.error('Error fetching feedback reports:', error);
      res.status(500).json({ error: 'Failed to fetch feedback reports' });
    }
  });

  router.get('/reports/:id', requireAdmin, async (req, res) => {
    try {
      const [report] = await db
        .select()
        .from(feedbackReports)
        .where(eq(feedbackReports.id, req.params.id))
        .limit(1);

      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      const [comments, events] = await Promise.all([
        db
          .select()
          .from(feedbackReportComments)
          .where(eq(feedbackReportComments.reportId, report.id))
          .orderBy(desc(feedbackReportComments.createdAt)),
        db
          .select()
          .from(feedbackReportEvents)
          .where(eq(feedbackReportEvents.reportId, report.id))
          .orderBy(desc(feedbackReportEvents.createdAt)),
      ]);

      res.json({ ...report, comments, events });
    } catch (error) {
      console.error('Error fetching feedback report:', error);
      res.status(500).json({ error: 'Failed to fetch feedback report' });
    }
  });

  router.patch('/reports/:id', requireAdmin, async (req, res) => {
    try {
      const [existing] = await db
        .select()
        .from(feedbackReports)
        .where(eq(feedbackReports.id, req.params.id))
        .limit(1);

      if (!existing) {
        return res.status(404).json({ error: 'Report not found' });
      }

      const { status, priority, assignedTo, assignedToName, resolutionNotes, ...otherUpdates } = req.body;

      const updates: any = { ...otherUpdates, updatedAt: new Date() };

      if (status && status !== existing.status) {
        updates.status = status;
        if (status === 'resolved') {
          updates.resolvedAt = new Date();
        }

        await db.insert(feedbackReportEvents).values({
          reportId: existing.id,
          eventType: 'status_change',
          previousValue: existing.status,
          newValue: status,
          actorName: req.body.actorName || 'System',
        });

        onStatusChanged?.(existing, existing.status, status);
      }

      if (priority !== undefined) updates.priority = priority;
      if (assignedTo !== undefined) updates.assignedTo = assignedTo;
      if (assignedToName !== undefined) updates.assignedToName = assignedToName;
      if (resolutionNotes !== undefined) updates.resolutionNotes = resolutionNotes;

      const [updated] = await db
        .update(feedbackReports)
        .set(updates)
        .where(eq(feedbackReports.id, req.params.id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error('Error updating feedback report:', error);
      res.status(500).json({ error: 'Failed to update feedback report' });
    }
  });

  router.delete('/reports/:id', requireAdmin, async (req, res) => {
    try {
      const [deleted] = await db
        .delete(feedbackReports)
        .where(eq(feedbackReports.id, req.params.id))
        .returning();

      if (!deleted) {
        return res.status(404).json({ error: 'Report not found' });
      }

      res.json({ success: true, deleted });
    } catch (error) {
      console.error('Error deleting feedback report:', error);
      res.status(500).json({ error: 'Failed to delete feedback report' });
    }
  });

  router.post('/reports/:id/comments', optionalAuth, async (req, res) => {
    try {
      const parsed = insertFeedbackCommentSchema.safeParse({
        ...req.body,
        reportId: req.params.id,
      });

      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request body', details: parsed.error.errors });
      }

      const [comment] = await db.insert(feedbackReportComments).values(parsed.data).returning();

      await db
        .update(feedbackReports)
        .set({ 
          commentCount: sql`${feedbackReports.commentCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(feedbackReports.id, req.params.id));

      res.status(201).json(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  });

  router.post('/reports/:id/upvote', optionalAuth, async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const [existing] = await db
        .select()
        .from(feedbackReportUpvotes)
        .where(
          and(
            eq(feedbackReportUpvotes.reportId, req.params.id),
            eq(feedbackReportUpvotes.userId, userId)
          )
        )
        .limit(1);

      if (existing) {
        await db.delete(feedbackReportUpvotes).where(eq(feedbackReportUpvotes.id, existing.id));
        await db
          .update(feedbackReports)
          .set({ upvoteCount: sql`GREATEST(0, ${feedbackReports.upvoteCount} - 1)` })
          .where(eq(feedbackReports.id, req.params.id));
        return res.json({ upvoted: false });
      }

      await db.insert(feedbackReportUpvotes).values({
        reportId: req.params.id,
        userId,
      });
      await db
        .update(feedbackReports)
        .set({ upvoteCount: sql`${feedbackReports.upvoteCount} + 1` })
        .where(eq(feedbackReports.id, req.params.id));

      res.json({ upvoted: true });
    } catch (error) {
      console.error('Error toggling upvote:', error);
      res.status(500).json({ error: 'Failed to toggle upvote' });
    }
  });

  router.get('/stats', requireAdmin, async (req, res) => {
    try {
      const [
        totalResult,
        byStatusResult,
        byTypeResult,
        byPriorityResult,
      ] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(feedbackReports),
        db
          .select({
            status: feedbackReports.status,
            count: sql<number>`count(*)`,
          })
          .from(feedbackReports)
          .groupBy(feedbackReports.status),
        db
          .select({
            reportType: feedbackReports.reportType,
            count: sql<number>`count(*)`,
          })
          .from(feedbackReports)
          .groupBy(feedbackReports.reportType),
        db
          .select({
            priority: feedbackReports.priority,
            count: sql<number>`count(*)`,
          })
          .from(feedbackReports)
          .groupBy(feedbackReports.priority),
      ]);

      res.json({
        total: Number(totalResult[0]?.count || 0),
        byStatus: byStatusResult.reduce((acc, row) => {
          acc[row.status] = Number(row.count);
          return acc;
        }, {} as Record<string, number>),
        byType: byTypeResult.reduce((acc, row) => {
          acc[row.reportType] = Number(row.count);
          return acc;
        }, {} as Record<string, number>),
        byPriority: byPriorityResult.reduce((acc, row) => {
          acc[row.priority] = Number(row.count);
          return acc;
        }, {} as Record<string, number>),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  return router;
}
