import { z } from 'zod';

export type CaptureMode = 'full' | 'snippet' | 'draw';

export interface CapturedScreenshot {
  id: string;
  dataUrl: string;
  thumbnail: string;
  captureMode: CaptureMode;
  timestamp: Date;
  annotations?: string;
}

export type ReportType = 'bug' | 'feature_request' | 'enhancement' | 'general_feedback';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'new' | 'in_review' | 'planned' | 'in_progress' | 'resolved' | 'closed';

export interface FeedbackReport {
  id: string;
  reportType: ReportType;
  priority: Priority;
  status: Status;
  title: string;
  description: string;
  stepsToReproduce?: string | null;
  expectedBehavior?: string | null;
  actualBehavior?: string | null;
  pageUrl?: string | null;
  pageTitle?: string | null;
  browserInfo?: string | null;
  screenResolution?: string | null;
  screenshotUrl?: string | null;
  annotationsJson?: any;
  reporterId?: string | null;
  reporterName?: string | null;
  reporterEmail?: string | null;
  reporterRole?: string | null;
  assignedTo?: string | null;
  assignedToName?: string | null;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;
  resolutionNotes?: string | null;
  linkedProjectId?: string | null;
  aiSummary?: string | null;
  aiSuggestedPriority?: string | null;
  aiSimilarityGroup?: string | null;
  upvoteCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackReportComment {
  id: string;
  reportId: string;
  content: string;
  isInternal: boolean;
  authorId?: string | null;
  authorName: string;
  authorRole?: string | null;
  parentCommentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackReportEvent {
  id: string;
  reportId: string;
  eventType: string;
  previousValue?: string | null;
  newValue?: string | null;
  description?: string | null;
  actorId?: string | null;
  actorName?: string | null;
  createdAt: Date;
}

export const insertFeedbackReportSchema = z.object({
  reportType: z.enum(['bug', 'feature_request', 'enhancement', 'general_feedback']).default('bug'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  status: z.enum(['new', 'in_review', 'planned', 'in_progress', 'resolved', 'closed']).default('new'),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  stepsToReproduce: z.string().optional().nullable(),
  expectedBehavior: z.string().optional().nullable(),
  actualBehavior: z.string().optional().nullable(),
  pageUrl: z.string().optional().nullable(),
  pageTitle: z.string().optional().nullable(),
  browserInfo: z.string().optional().nullable(),
  screenResolution: z.string().optional().nullable(),
  screenshotUrl: z.string().optional().nullable(),
  annotationsJson: z.any().optional().nullable(),
  reporterId: z.string().optional().nullable(),
  reporterName: z.string().optional().nullable(),
  reporterEmail: z.string().email().optional().nullable(),
  reporterRole: z.string().optional().nullable(),
});

export type InsertFeedbackReport = z.infer<typeof insertFeedbackReportSchema>;

export const insertFeedbackCommentSchema = z.object({
  reportId: z.string(),
  content: z.string().min(1, 'Comment content is required'),
  isInternal: z.boolean().default(false),
  authorId: z.string().optional().nullable(),
  authorName: z.string().min(1, 'Author name is required'),
  authorRole: z.string().optional().nullable(),
  parentCommentId: z.string().optional().nullable(),
});

export type InsertFeedbackComment = z.infer<typeof insertFeedbackCommentSchema>;

export interface FeedbackWidgetConfig {
  apiEndpoint: string;
  projectId?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  theme?: 'light' | 'dark' | 'auto';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor?: string;
  enableScreenshots?: boolean;
  enableAnnotations?: boolean;
  reportTypes?: ReportType[];
  customFields?: Array<{
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'select';
    options?: string[];
    required?: boolean;
  }>;
  onSubmit?: (report: FeedbackReport) => void;
  onError?: (error: Error) => void;
}
