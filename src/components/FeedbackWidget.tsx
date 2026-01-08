import { useState, useCallback } from 'react';
import {
  MessageSquare,
  Bug,
  Lightbulb,
  HelpCircle,
  Camera,
  Send,
  X,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { cn, generateId, getBrowserInfo, getScreenResolution } from '../utils';
import { ScreenshotCapture } from './ScreenshotCapture';
import { ScreenshotGallery } from './ScreenshotGallery';
import type {
  FeedbackWidgetConfig,
  CapturedScreenshot,
  ReportType,
  Priority,
  InsertFeedbackReport,
} from '../types';

const REPORT_TYPE_CONFIG: Record<
  ReportType,
  { icon: any; label: string; color: string; description: string }
> = {
  bug: {
    icon: Bug,
    label: 'Bug Report',
    color: 'text-red-500',
    description: 'Something is not working correctly',
  },
  feature_request: {
    icon: Lightbulb,
    label: 'Feature Request',
    color: 'text-yellow-500',
    description: 'Suggest a new feature or improvement',
  },
  enhancement: {
    icon: HelpCircle,
    label: 'Enhancement',
    color: 'text-blue-500',
    description: 'Improve an existing feature',
  },
  general_feedback: {
    icon: MessageSquare,
    label: 'General Feedback',
    color: 'text-green-500',
    description: 'Share your thoughts or comments',
  },
};

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
];

interface FeedbackWidgetProps {
  config: FeedbackWidgetConfig;
  className?: string;
}

export function FeedbackWidget({ config, className }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCaptureDialog, setShowCaptureDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [reportType, setReportType] = useState<ReportType>('bug');
  const [priority, setPriority] = useState<Priority>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [screenshots, setScreenshots] = useState<CapturedScreenshot[]>([]);

  const enabledReportTypes = config.reportTypes || ['bug', 'feature_request', 'enhancement', 'general_feedback'];

  const handleScreenshotCapture = useCallback((screenshot: CapturedScreenshot) => {
    setScreenshots((prev) => [...prev, screenshot]);
    setShowCaptureDialog(false);
  }, []);

  const handleRemoveScreenshot = useCallback((id: string) => {
    setScreenshots((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const resetForm = useCallback(() => {
    setReportType('bug');
    setPriority('medium');
    setTitle('');
    setDescription('');
    setStepsToReproduce('');
    setScreenshots([]);
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const report: InsertFeedbackReport = {
        reportType,
        priority,
        status: 'new',
        title: title.trim(),
        description: description.trim(),
        stepsToReproduce: stepsToReproduce.trim() || null,
        pageUrl: window.location.href,
        pageTitle: document.title,
        browserInfo: getBrowserInfo(),
        screenResolution: getScreenResolution(),
        reporterId: config.user?.id || null,
        reporterName: config.user?.name || null,
        reporterEmail: config.user?.email || null,
        reporterRole: config.user?.role || null,
        annotationsJson: screenshots.length > 0 ? screenshots : null,
      };

      const response = await fetch(`${config.apiEndpoint}/feedback/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      const createdReport = await response.json();

      config.onSubmit?.(createdReport);
      setShowSuccess(true);
      resetForm();

      setTimeout(() => {
        setShowSuccess(false);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      config.onError?.(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const position = config.position || 'bottom-right';
  const positionClasses: Record<string, string> = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  return (
    <>
      <div
        className={cn('fixed z-[100]', positionClasses[position], className)}
        data-screenshot-exclude
      >
        {!isOpen && (
          <button
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all',
              'bg-blue-500 hover:bg-blue-600 text-white'
            )}
            style={config.primaryColor ? { backgroundColor: config.primaryColor } : undefined}
            onClick={() => setIsOpen(true)}
            data-testid="button-open-feedback"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="font-medium">Feedback</span>
          </button>
        )}

        {isOpen && (
          <div className="w-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl border overflow-hidden">
            <div
              className="flex items-center justify-between p-4 border-b"
              style={config.primaryColor ? { backgroundColor: config.primaryColor, color: 'white' } : { backgroundColor: '#3b82f6', color: 'white' }}
            >
              <h3 className="font-semibold">Send Feedback</h3>
              <button
                className="p-1 rounded hover:bg-white/20"
                onClick={() => setIsOpen(false)}
                data-testid="button-close-feedback"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {showSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-green-500" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Thank You!</h4>
                <p className="text-gray-500">Your feedback has been submitted successfully.</p>
              </div>
            ) : (
              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {enabledReportTypes.map((type) => {
                      const typeConfig = REPORT_TYPE_CONFIG[type];
                      const Icon = typeConfig.icon;
                      return (
                        <button
                          key={type}
                          className={cn(
                            'p-3 rounded-lg border text-left transition-colors',
                            reportType === type
                              ? 'border-blue-500 bg-blue-50'
                              : 'hover:border-gray-300'
                          )}
                          onClick={() => setReportType(type)}
                          data-testid={`button-type-${type}`}
                        >
                          <Icon className={cn('h-5 w-5 mb-1', typeConfig.color)} />
                          <p className="text-sm font-medium">{typeConfig.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <div className="flex gap-2">
                    {PRIORITY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                          priority === option.value
                            ? option.color + ' ring-2 ring-offset-1 ring-blue-500'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                        onClick={() => setPriority(option.value)}
                        data-testid={`button-priority-${option.value}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief summary of the issue or feedback"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    data-testid="input-title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y"
                    placeholder="Provide more details about your feedback..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    data-testid="input-description"
                  />
                </div>

                {reportType === 'bug' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Steps to Reproduce</label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y"
                      placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
                      value={stepsToReproduce}
                      onChange={(e) => setStepsToReproduce(e.target.value)}
                      data-testid="input-steps"
                    />
                  </div>
                )}

                {config.enableScreenshots !== false && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Screenshots</label>
                      <button
                        className="flex items-center gap-1 px-2 py-1 text-sm text-blue-500 hover:bg-blue-50 rounded"
                        onClick={() => setShowCaptureDialog(true)}
                        data-testid="button-add-screenshot"
                      >
                        <Camera className="h-4 w-4" />
                        Add Screenshot
                      </button>
                    </div>
                    <ScreenshotGallery
                      screenshots={screenshots}
                      onRemove={handleRemoveScreenshot}
                      maxHeight="150px"
                    />
                  </div>
                )}

                <button
                  className={cn(
                    'w-full py-2.5 rounded-md font-medium flex items-center justify-center gap-2 transition-colors',
                    'bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                  style={config.primaryColor ? { backgroundColor: config.primaryColor } : undefined}
                  onClick={handleSubmit}
                  disabled={isSubmitting || !title.trim() || !description.trim()}
                  data-testid="button-submit-feedback"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Feedback
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <ScreenshotCapture
        isOpen={showCaptureDialog}
        onCapture={handleScreenshotCapture}
        onClose={() => setShowCaptureDialog(false)}
      />
    </>
  );
}
