import { pgTable, varchar, text, boolean, timestamp, jsonb, index, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { z } from 'zod';

export const feedbackReports = pgTable('feedback_reports', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  
  reportType: text('report_type').notNull().default('bug'),
  priority: text('priority').notNull().default('medium'),
  status: text('status').notNull().default('new'),
  
  title: text('title').notNull(),
  description: text('description').notNull(),
  stepsToReproduce: text('steps_to_reproduce'),
  expectedBehavior: text('expected_behavior'),
  actualBehavior: text('actual_behavior'),
  
  pageUrl: text('page_url'),
  pageTitle: text('page_title'),
  browserInfo: text('browser_info'),
  screenResolution: text('screen_resolution'),
  
  screenshotUrl: text('screenshot_url'),
  annotationsJson: jsonb('annotations_json'),
  
  reporterId: varchar('reporter_id'),
  reporterName: text('reporter_name'),
  reporterEmail: text('reporter_email'),
  reporterRole: text('reporter_role'),
  
  assignedTo: varchar('assigned_to'),
  assignedToName: text('assigned_to_name'),
  
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: varchar('resolved_by'),
  resolutionNotes: text('resolution_notes'),
  
  linkedProjectId: varchar('linked_project_id'),
  
  aiSummary: text('ai_summary'),
  aiSuggestedPriority: text('ai_suggested_priority'),
  aiSimilarityGroup: varchar('ai_similarity_group'),
  
  upvoteCount: integer('upvote_count').default(0).notNull(),
  commentCount: integer('comment_count').default(0).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('feedback_reports_type_idx').on(table.reportType),
  index('feedback_reports_status_idx').on(table.status),
  index('feedback_reports_priority_idx').on(table.priority),
  index('feedback_reports_reporter_idx').on(table.reporterId),
  index('feedback_reports_assigned_idx').on(table.assignedTo),
  index('feedback_reports_created_at_idx').on(table.createdAt),
]);

export const feedbackReportComments = pgTable('feedback_report_comments', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar('report_id').notNull().references(() => feedbackReports.id, { onDelete: 'cascade' }),
  
  content: text('content').notNull(),
  isInternal: boolean('is_internal').default(false),
  
  authorId: varchar('author_id'),
  authorName: text('author_name').notNull(),
  authorRole: text('author_role'),
  
  parentCommentId: varchar('parent_comment_id'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('feedback_comments_report_idx').on(table.reportId),
  index('feedback_comments_author_idx').on(table.authorId),
]);

export const feedbackReportEvents = pgTable('feedback_report_events', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar('report_id').notNull().references(() => feedbackReports.id, { onDelete: 'cascade' }),
  
  eventType: text('event_type').notNull(),
  previousValue: text('previous_value'),
  newValue: text('new_value'),
  description: text('description'),
  
  actorId: varchar('actor_id'),
  actorName: text('actor_name'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('feedback_events_report_idx').on(table.reportId),
  index('feedback_events_type_idx').on(table.eventType),
]);

export const feedbackReportUpvotes = pgTable('feedback_report_upvotes', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar('report_id').notNull().references(() => feedbackReports.id, { onDelete: 'cascade' }),
  userId: varchar('user_id').notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('feedback_upvotes_report_idx').on(table.reportId),
  index('feedback_upvotes_user_idx').on(table.userId),
]);

export const insertFeedbackReportSchema = z.object({
  reportType: z.enum(['bug', 'feature_request', 'enhancement', 'general_feedback']).default('bug'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  status: z.enum(['new', 'in_review', 'planned', 'in_progress', 'resolved', 'closed']).default('new'),
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
  aiSimilarityGroup: z.string().nullable().optional(),
});

export const insertFeedbackCommentSchema = z.object({
  reportId: z.string(),
  content: z.string().min(1),
  isInternal: z.boolean().default(false),
  authorId: z.string().nullable().optional(),
  authorName: z.string(),
  authorRole: z.string().nullable().optional(),
  parentCommentId: z.string().nullable().optional(),
});

export const insertFeedbackEventSchema = z.object({
  reportId: z.string(),
  eventType: z.string(),
  previousValue: z.string().nullable().optional(),
  newValue: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  actorId: z.string().nullable().optional(),
  actorName: z.string().nullable().optional(),
});

export type InsertFeedbackReport = z.infer<typeof insertFeedbackReportSchema>;
export type InsertFeedbackComment = z.infer<typeof insertFeedbackCommentSchema>;
export type InsertFeedbackEvent = z.infer<typeof insertFeedbackEventSchema>;

export type FeedbackReport = typeof feedbackReports.$inferSelect;
export type FeedbackComment = typeof feedbackReportComments.$inferSelect;
export type FeedbackEvent = typeof feedbackReportEvents.$inferSelect;
export type FeedbackUpvote = typeof feedbackReportUpvotes.$inferSelect;
