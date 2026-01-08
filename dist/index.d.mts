import * as react_jsx_runtime from 'react/jsx-runtime';
import { z } from 'zod';
import { ClassValue } from 'clsx';

type CaptureMode = 'full' | 'snippet' | 'draw';
interface CapturedScreenshot {
    id: string;
    dataUrl: string;
    thumbnail: string;
    captureMode: CaptureMode;
    timestamp: Date;
    annotations?: string;
}
type ReportType = 'bug' | 'feature_request' | 'enhancement' | 'general_feedback';
type Priority = 'low' | 'medium' | 'high' | 'critical';
type Status = 'new' | 'in_review' | 'planned' | 'in_progress' | 'resolved' | 'closed';
interface FeedbackReport {
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
interface FeedbackReportComment {
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
interface FeedbackReportEvent {
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
declare const insertFeedbackReportSchema: z.ZodObject<{
    reportType: z.ZodDefault<z.ZodEnum<["bug", "feature_request", "enhancement", "general_feedback"]>>;
    priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    status: z.ZodDefault<z.ZodEnum<["new", "in_review", "planned", "in_progress", "resolved", "closed"]>>;
    title: z.ZodString;
    description: z.ZodString;
    stepsToReproduce: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    expectedBehavior: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    actualBehavior: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    pageUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    pageTitle: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    browserInfo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    screenResolution: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    screenshotUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    annotationsJson: z.ZodNullable<z.ZodOptional<z.ZodAny>>;
    reporterId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    reporterName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    reporterEmail: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    reporterRole: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    reportType: "bug" | "feature_request" | "enhancement" | "general_feedback";
    priority: "low" | "medium" | "high" | "critical";
    status: "new" | "in_review" | "planned" | "in_progress" | "resolved" | "closed";
    description: string;
    stepsToReproduce?: string | null | undefined;
    expectedBehavior?: string | null | undefined;
    actualBehavior?: string | null | undefined;
    pageUrl?: string | null | undefined;
    pageTitle?: string | null | undefined;
    browserInfo?: string | null | undefined;
    screenResolution?: string | null | undefined;
    screenshotUrl?: string | null | undefined;
    annotationsJson?: any;
    reporterId?: string | null | undefined;
    reporterName?: string | null | undefined;
    reporterEmail?: string | null | undefined;
    reporterRole?: string | null | undefined;
}, {
    title: string;
    description: string;
    reportType?: "bug" | "feature_request" | "enhancement" | "general_feedback" | undefined;
    priority?: "low" | "medium" | "high" | "critical" | undefined;
    status?: "new" | "in_review" | "planned" | "in_progress" | "resolved" | "closed" | undefined;
    stepsToReproduce?: string | null | undefined;
    expectedBehavior?: string | null | undefined;
    actualBehavior?: string | null | undefined;
    pageUrl?: string | null | undefined;
    pageTitle?: string | null | undefined;
    browserInfo?: string | null | undefined;
    screenResolution?: string | null | undefined;
    screenshotUrl?: string | null | undefined;
    annotationsJson?: any;
    reporterId?: string | null | undefined;
    reporterName?: string | null | undefined;
    reporterEmail?: string | null | undefined;
    reporterRole?: string | null | undefined;
}>;
type InsertFeedbackReport = z.infer<typeof insertFeedbackReportSchema>;
declare const insertFeedbackCommentSchema: z.ZodObject<{
    reportId: z.ZodString;
    content: z.ZodString;
    isInternal: z.ZodDefault<z.ZodBoolean>;
    authorId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    authorName: z.ZodString;
    authorRole: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    parentCommentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    reportId: string;
    content: string;
    isInternal: boolean;
    authorName: string;
    authorId?: string | null | undefined;
    authorRole?: string | null | undefined;
    parentCommentId?: string | null | undefined;
}, {
    reportId: string;
    content: string;
    authorName: string;
    isInternal?: boolean | undefined;
    authorId?: string | null | undefined;
    authorRole?: string | null | undefined;
    parentCommentId?: string | null | undefined;
}>;
type InsertFeedbackComment = z.infer<typeof insertFeedbackCommentSchema>;
interface FeedbackWidgetConfig {
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

interface ScreenshotCaptureProps {
    onCapture: (screenshot: CapturedScreenshot) => void;
    onClose: () => void;
    isOpen: boolean;
    buttonClassName?: string;
    dialogClassName?: string;
}
declare function ScreenshotCapture({ onCapture, onClose, isOpen, buttonClassName, dialogClassName, }: ScreenshotCaptureProps): react_jsx_runtime.JSX.Element | null;

interface ScreenshotGalleryProps {
    screenshots: CapturedScreenshot[];
    onRemove: (id: string) => void;
    maxHeight?: string;
    isEditable?: boolean;
    className?: string;
}
declare function ScreenshotGallery({ screenshots, onRemove, maxHeight, isEditable, className, }: ScreenshotGalleryProps): react_jsx_runtime.JSX.Element | null;

interface FeedbackWidgetProps {
    config: FeedbackWidgetConfig;
    className?: string;
}
declare function FeedbackWidget({ config, className }: FeedbackWidgetProps): react_jsx_runtime.JSX.Element;

declare function cn(...inputs: ClassValue[]): string;
declare function generateId(): string;
declare function clearTextSelection(): void;
declare function createThumbnail(dataUrl: string, maxSize?: number): Promise<string>;
declare function getBrowserInfo(): string;
declare function getScreenResolution(): string;
declare function formatDate(date: Date | string): string;
declare const PRIORITY_COLORS: Record<string, string>;
declare const STATUS_COLORS: Record<string, string>;
declare const REPORT_TYPE_LABELS: Record<string, string>;

export { type CaptureMode, type CapturedScreenshot, type FeedbackReport, type FeedbackReportComment, type FeedbackReportEvent, FeedbackWidget, type FeedbackWidgetConfig, type InsertFeedbackComment, type InsertFeedbackReport, PRIORITY_COLORS, type Priority, REPORT_TYPE_LABELS, type ReportType, STATUS_COLORS, ScreenshotCapture, ScreenshotGallery, type Status, clearTextSelection, cn, createThumbnail, formatDate, generateId, getBrowserInfo, getScreenResolution, insertFeedbackCommentSchema, insertFeedbackReportSchema };
