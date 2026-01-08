import { useState } from 'react';
import { ZoomIn, Trash2, Download, Monitor, Scissors, Paintbrush, X } from 'lucide-react';
import { cn, formatDate } from '../utils';
import type { CapturedScreenshot, CaptureMode } from '../types';

interface ScreenshotGalleryProps {
  screenshots: CapturedScreenshot[];
  onRemove: (id: string) => void;
  maxHeight?: string;
  isEditable?: boolean;
  className?: string;
}

const modeConfig: Record<CaptureMode, { icon: any; label: string; color: string }> = {
  full: { icon: Monitor, label: 'Full Frame', color: 'bg-blue-500' },
  snippet: { icon: Scissors, label: 'Snippet', color: 'bg-green-500' },
  draw: { icon: Paintbrush, label: 'Annotated', color: 'bg-purple-500' },
};

export function ScreenshotGallery({
  screenshots,
  onRemove,
  maxHeight = '200px',
  isEditable = true,
  className,
}: ScreenshotGalleryProps) {
  const [selectedScreenshot, setSelectedScreenshot] = useState<CapturedScreenshot | null>(null);

  const handleDownload = (screenshot: CapturedScreenshot) => {
    const link = document.createElement('a');
    link.href = screenshot.dataUrl;
    const timestamp = screenshot.timestamp instanceof Date ? screenshot.timestamp : new Date(screenshot.timestamp);
    link.download = `screenshot_${timestamp.toISOString().replace(/[:.]/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (screenshots.length === 0) {
    return null;
  }

  return (
    <>
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Screenshots ({screenshots.length})</span>
        </div>
        <div
          style={{ maxHeight }}
          className="overflow-auto rounded-md border p-2"
        >
          <div className="grid grid-cols-2 gap-2">
            {screenshots.map((screenshot) => {
              const ModeIcon = modeConfig[screenshot.captureMode].icon;
              return (
                <div
                  key={screenshot.id}
                  className="relative group rounded-md overflow-hidden border bg-gray-50"
                  data-testid={`screenshot-item-${screenshot.id}`}
                >
                  <img
                    src={screenshot.thumbnail}
                    alt={`Screenshot`}
                    className="w-full h-20 object-cover cursor-pointer"
                    onClick={() => setSelectedScreenshot(screenshot)}
                    data-testid={`img-thumbnail-${screenshot.id}`}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      className="h-7 w-7 flex items-center justify-center text-white hover:bg-white/20 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedScreenshot(screenshot);
                      }}
                      data-testid={`button-view-${screenshot.id}`}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    <button
                      className="h-7 w-7 flex items-center justify-center text-white hover:bg-white/20 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(screenshot);
                      }}
                      data-testid={`button-download-${screenshot.id}`}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    {isEditable && (
                      <button
                        className="h-7 w-7 flex items-center justify-center text-white hover:text-red-400 hover:bg-white/20 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(screenshot.id);
                        }}
                        data-testid={`button-remove-${screenshot.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <span
                    className={`absolute bottom-1 left-1 ${modeConfig[screenshot.captureMode].color} text-white text-[10px] px-1 py-0.5 rounded flex items-center gap-0.5`}
                  >
                    <ModeIcon className="h-2.5 w-2.5" />
                    {modeConfig[screenshot.captureMode].label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedScreenshot && (
        <div
          className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Screenshot Preview</h3>
                <span
                  className={`${modeConfig[selectedScreenshot.captureMode].color} text-white text-xs px-2 py-0.5 rounded`}
                >
                  {modeConfig[selectedScreenshot.captureMode].label}
                </span>
              </div>
              <button
                className="p-2 rounded hover:bg-gray-100"
                onClick={() => setSelectedScreenshot(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="overflow-auto max-h-[60vh] rounded-lg border">
                <img
                  src={selectedScreenshot.dataUrl}
                  alt="Screenshot full view"
                  className="w-full h-auto"
                  data-testid="img-screenshot-full"
                />
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2 text-sm text-gray-500">
                <span>Captured: {formatDate(selectedScreenshot.timestamp)}</span>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1.5 border rounded hover:bg-gray-50 flex items-center gap-1"
                    onClick={() => handleDownload(selectedScreenshot)}
                    data-testid="button-download-full"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  {isEditable && (
                    <button
                      className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
                      onClick={() => {
                        onRemove(selectedScreenshot.id);
                        setSelectedScreenshot(null);
                      }}
                      data-testid="button-remove-full"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
