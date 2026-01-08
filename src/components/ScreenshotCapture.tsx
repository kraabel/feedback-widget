import { useState, useCallback, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import {
  Camera,
  Crop,
  Pencil,
  X,
  Check,
  Undo2,
  Trash2,
  Square,
  Circle as CircleIcon,
  ArrowRight,
  Loader2,
  Monitor,
  Scissors,
  Paintbrush,
} from 'lucide-react';
import { cn, generateId, createThumbnail, clearTextSelection } from '../utils';
import type { CapturedScreenshot, CaptureMode } from '../types';

async function captureDOM(): Promise<string> {
  clearTextSelection();
  const target = document.body;

  const dataUrl = await toPng(target, {
    quality: 0.95,
    pixelRatio: window.devicePixelRatio || 1,
    cacheBust: true,
    skipAutoScale: true,
    filter: (node) => {
      if (node instanceof Element) {
        const tagName = node.tagName?.toLowerCase();
        if (tagName === 'script' || tagName === 'noscript') return false;
        if (node.hasAttribute('data-screenshot-exclude')) return false;
        if (node.closest('[data-screenshot-exclude]')) return false;
      }
      return true;
    },
  });

  return dataUrl;
}

type DrawTool = 'pen' | 'rectangle' | 'circle' | 'arrow';

const COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#000000',
  '#ffffff',
];

interface ScreenshotCaptureProps {
  onCapture: (screenshot: CapturedScreenshot) => void;
  onClose: () => void;
  isOpen: boolean;
  buttonClassName?: string;
  dialogClassName?: string;
}

export function ScreenshotCapture({
  onCapture,
  onClose,
  isOpen,
  buttonClassName,
  dialogClassName,
}: ScreenshotCaptureProps) {
  const [mode, setMode] = useState<CaptureMode | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnnotating, setIsAnnotating] = useState(false);

  const [snippetStart, setSnippetStart] = useState<{ x: number; y: number } | null>(null);
  const [snippetEnd, setSnippetEnd] = useState<{ x: number; y: number } | null>(null);
  const [isSelectingSnippet, setIsSelectingSnippet] = useState(false);

  const [drawTool, setDrawTool] = useState<DrawTool>('pen');
  const [drawColor, setDrawColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawHistory, setDrawHistory] = useState<ImageData[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const reset = useCallback(() => {
    setMode(null);
    setCapturedImage(null);
    setIsAnnotating(false);
    setSnippetStart(null);
    setSnippetEnd(null);
    setIsSelectingSnippet(false);
    setDrawHistory([]);
    lastPointRef.current = null;
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const captureFullFrame = useCallback(async () => {
    setIsCapturing(true);
    handleClose();
    clearTextSelection();

    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const dataUrl = await captureDOM();
      const thumbnail = await createThumbnail(dataUrl);

      const screenshot: CapturedScreenshot = {
        id: generateId(),
        dataUrl,
        thumbnail,
        captureMode: 'full',
        timestamp: new Date(),
      };

      onCapture(screenshot);
    } catch (error) {
      console.error('Full frame capture error:', error);
    } finally {
      setIsCapturing(false);
      reset();
    }
  }, [handleClose, onCapture, reset]);

  const startSnippetCapture = useCallback(async () => {
    setIsCapturing(true);
    onClose();
    clearTextSelection();

    await new Promise((resolve) => setTimeout(resolve, 100));

    setMode('snippet');
    setIsSelectingSnippet(true);
    setIsCapturing(false);
  }, [onClose]);

  const handleSnippetMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!isSelectingSnippet) return;

      const target = e.target as HTMLElement;
      if (target.closest('[data-snippet-cancel]')) {
        return;
      }

      e.preventDefault();
      clearTextSelection();
      setSnippetStart({ x: e.clientX, y: e.clientY });
      setSnippetEnd({ x: e.clientX, y: e.clientY });
    },
    [isSelectingSnippet]
  );

  const handleSnippetMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isSelectingSnippet || !snippetStart) return;
      e.preventDefault();
      setSnippetEnd({ x: e.clientX, y: e.clientY });
    },
    [isSelectingSnippet, snippetStart]
  );

  const handleSnippetMouseUp = useCallback(async () => {
    if (!isSelectingSnippet || !snippetStart || !snippetEnd) return;

    const minX = Math.min(snippetStart.x, snippetEnd.x);
    const maxX = Math.max(snippetStart.x, snippetEnd.x);
    const minY = Math.min(snippetStart.y, snippetEnd.y);
    const maxY = Math.max(snippetStart.y, snippetEnd.y);
    const width = maxX - minX;
    const height = maxY - minY;

    if (width < 10 || height < 10) {
      setSnippetStart(null);
      setSnippetEnd(null);
      return;
    }

    setIsSelectingSnippet(false);
    setIsCapturing(true);

    try {
      const fullDataUrl = await captureDOM();

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load captured image'));
        img.src = fullDataUrl;
      });

      const scaleX = img.width / window.innerWidth;
      const scaleY = img.height / window.innerHeight;

      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = width * scaleX;
      cropCanvas.height = height * scaleY;
      const cropCtx = cropCanvas.getContext('2d');

      if (!cropCtx) throw new Error('Canvas context error');

      cropCtx.drawImage(
        img,
        minX * scaleX,
        minY * scaleY,
        width * scaleX,
        height * scaleY,
        0,
        0,
        cropCanvas.width,
        cropCanvas.height
      );

      const croppedDataUrl = cropCanvas.toDataURL('image/png', 0.95);
      const thumbnail = await createThumbnail(croppedDataUrl);

      const screenshot: CapturedScreenshot = {
        id: generateId(),
        dataUrl: croppedDataUrl,
        thumbnail,
        captureMode: 'snippet',
        timestamp: new Date(),
      };

      onCapture(screenshot);
    } catch (error) {
      console.error('Snippet capture error:', error);
    } finally {
      setIsCapturing(false);
      reset();
    }
  }, [isSelectingSnippet, snippetStart, snippetEnd, onCapture, reset]);

  const cancelSnippetSelection = useCallback(() => {
    setIsSelectingSnippet(false);
    reset();
  }, [reset]);

  useEffect(() => {
    if (isSelectingSnippet) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          cancelSnippetSelection();
        }
      };

      window.addEventListener('mousedown', handleSnippetMouseDown);
      window.addEventListener('mousemove', handleSnippetMouseMove);
      window.addEventListener('mouseup', handleSnippetMouseUp);
      window.addEventListener('keydown', handleEscape, true);

      return () => {
        window.removeEventListener('mousedown', handleSnippetMouseDown);
        window.removeEventListener('mousemove', handleSnippetMouseMove);
        window.removeEventListener('mouseup', handleSnippetMouseUp);
        window.removeEventListener('keydown', handleEscape, true);
      };
    }
  }, [
    isSelectingSnippet,
    handleSnippetMouseDown,
    handleSnippetMouseMove,
    handleSnippetMouseUp,
    cancelSnippetSelection,
  ]);

  const startDrawCapture = useCallback(async () => {
    setIsCapturing(true);
    onClose();

    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const dataUrl = await captureDOM();
      setCapturedImage(dataUrl);
      setMode('draw');
      setIsAnnotating(true);
    } catch (error) {
      console.error('Draw capture error:', error);
      reset();
    } finally {
      setIsCapturing(false);
    }
  }, [onClose, reset]);

  useEffect(() => {
    if (isAnnotating && capturedImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        const maxDisplayWidth = window.innerWidth * 0.85;
        const maxDisplayHeight = window.innerHeight * 0.75;

        const originalWidth = img.width;
        const originalHeight = img.height;

        let displayWidth = originalWidth;
        let displayHeight = originalHeight;

        if (displayWidth > maxDisplayWidth) {
          displayHeight = (displayHeight * maxDisplayWidth) / displayWidth;
          displayWidth = maxDisplayWidth;
        }
        if (displayHeight > maxDisplayHeight) {
          displayWidth = (displayWidth * maxDisplayHeight) / displayHeight;
          displayHeight = maxDisplayHeight;
        }

        const scale = originalWidth / displayWidth;

        canvas.width = originalWidth;
        canvas.height = originalHeight;

        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;

        (canvas as any)._scale = scale;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, originalWidth, originalHeight);

        const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setDrawHistory([initialState]);
      };
      img.src = capturedImage;
    }
  }, [isAnnotating, capturedImage]);

  const getCanvasPoint = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scale = (canvas as any)._scale || 1;
    return {
      x: (e.clientX - rect.left) * scale,
      y: (e.clientY - rect.top) * scale,
    };
  }, []);

  const saveCanvasState = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setDrawHistory((prev) => [...prev, imageData]);
  }, []);

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const point = getCanvasPoint(e);
      if (!point) return;

      setIsDrawing(true);
      lastPointRef.current = point;

      if (drawTool === 'pen') {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && canvas) {
          const scale = (canvas as any)._scale || 1;
          const scaledBrushSize = brushSize * scale;
          ctx.beginPath();
          ctx.arc(point.x, point.y, scaledBrushSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = drawColor;
          ctx.fill();
        }
      }
    },
    [getCanvasPoint, drawTool, brushSize, drawColor]
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const point = getCanvasPoint(e);
      if (!point || !lastPointRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;

      const scale = (canvas as any)._scale || 1;
      const scaledBrushSize = brushSize * scale;

      if (drawTool === 'pen') {
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(point.x, point.y);
        ctx.strokeStyle = drawColor;
        ctx.lineWidth = scaledBrushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        lastPointRef.current = point;
      }
    },
    [isDrawing, getCanvasPoint, drawTool, drawColor, brushSize]
  );

  const handleCanvasMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const point = getCanvasPoint(e);
      if (!point || !lastPointRef.current) {
        setIsDrawing(false);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) {
        setIsDrawing(false);
        return;
      }

      const scale = (canvas as any)._scale || 1;
      const scaledBrushSize = brushSize * scale;
      const startPoint = lastPointRef.current;

      switch (drawTool) {
        case 'rectangle':
          ctx.strokeStyle = drawColor;
          ctx.lineWidth = scaledBrushSize;
          ctx.strokeRect(startPoint.x, startPoint.y, point.x - startPoint.x, point.y - startPoint.y);
          break;
        case 'circle':
          const radiusX = Math.abs(point.x - startPoint.x) / 2;
          const radiusY = Math.abs(point.y - startPoint.y) / 2;
          const centerX = (startPoint.x + point.x) / 2;
          const centerY = (startPoint.y + point.y) / 2;
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
          ctx.strokeStyle = drawColor;
          ctx.lineWidth = scaledBrushSize;
          ctx.stroke();
          break;
        case 'arrow':
          ctx.beginPath();
          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.lineTo(point.x, point.y);
          ctx.strokeStyle = drawColor;
          ctx.lineWidth = scaledBrushSize;
          ctx.stroke();

          const angle = Math.atan2(point.y - startPoint.y, point.x - startPoint.x);
          const headLength = 15 * scale;
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(
            point.x - headLength * Math.cos(angle - Math.PI / 6),
            point.y - headLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(
            point.x - headLength * Math.cos(angle + Math.PI / 6),
            point.y - headLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
          break;
      }

      setIsDrawing(false);
      saveCanvasState();
    },
    [isDrawing, getCanvasPoint, drawTool, drawColor, brushSize, saveCanvasState]
  );

  const handleUndo = useCallback(() => {
    if (drawHistory.length <= 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const newHistory = drawHistory.slice(0, -1);
    const prevState = newHistory[newHistory.length - 1];
    ctx.putImageData(prevState, 0, 0);
    setDrawHistory(newHistory);
  }, [drawHistory]);

  const handleClearAnnotations = useCallback(() => {
    if (drawHistory.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const originalState = drawHistory[0];
    ctx.putImageData(originalState, 0, 0);
    setDrawHistory([originalState]);
  }, [drawHistory]);

  const handleSaveAnnotations = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png', 0.95);
    const thumbnail = await createThumbnail(dataUrl);

    const screenshot: CapturedScreenshot = {
      id: generateId(),
      dataUrl,
      thumbnail,
      captureMode: 'draw',
      timestamp: new Date(),
      annotations: 'User annotations applied',
    };

    onCapture(screenshot);
    reset();
  }, [onCapture, reset]);

  if (isSelectingSnippet) {
    const selectionRect =
      snippetStart && snippetEnd
        ? {
            left: Math.min(snippetStart.x, snippetEnd.x),
            top: Math.min(snippetStart.y, snippetEnd.y),
            width: Math.abs(snippetEnd.x - snippetStart.x),
            height: Math.abs(snippetEnd.y - snippetStart.y),
          }
        : null;

    return (
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9999] cursor-crosshair select-none"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
        data-testid="snippet-overlay"
        data-screenshot-exclude
        onMouseDown={(e) => e.preventDefault()}
      >
        <button
          className="absolute top-4 right-4 z-[10000] p-2 bg-white rounded-md hover:bg-gray-100"
          onClick={cancelSnippetSelection}
          data-snippet-cancel
          data-testid="button-cancel-snippet"
        >
          <X className="h-4 w-4" />
        </button>

        {!snippetStart && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/75 text-white px-6 py-3 rounded-lg text-lg font-medium">
            Click and drag to select a region
          </div>
        )}

        {selectionRect && selectionRect.width > 0 && selectionRect.height > 0 && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/10"
            style={{
              left: selectionRect.left,
              top: selectionRect.top,
              width: selectionRect.width,
              height: selectionRect.height,
            }}
          />
        )}
      </div>
    );
  }

  if (isAnnotating && capturedImage) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-full max-h-full overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-3 border-b gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 border-r pr-2">
                {(
                  [
                    { tool: 'pen' as const, icon: Pencil, label: 'Pen' },
                    { tool: 'rectangle' as const, icon: Square, label: 'Rectangle' },
                    { tool: 'circle' as const, icon: CircleIcon, label: 'Circle' },
                    { tool: 'arrow' as const, icon: ArrowRight, label: 'Arrow' },
                  ] as const
                ).map(({ tool, icon: Icon, label }) => (
                  <button
                    key={tool}
                    className={cn(
                      'p-2 rounded-md',
                      drawTool === tool ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                    )}
                    onClick={() => setDrawTool(tool)}
                    title={label}
                    data-testid={`button-tool-${tool}`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 border-r pr-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      'w-6 h-6 rounded-full border-2 transition-all',
                      drawColor === color ? 'border-blue-500 scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setDrawColor(color)}
                    data-testid={`button-color-${color.replace('#', '')}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2 w-24">
                <span className="text-xs">Size</span>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full"
                  data-testid="slider-brush-size"
                />
              </div>

              <div className="flex items-center gap-1 border-l pl-2">
                <button
                  className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
                  onClick={handleUndo}
                  disabled={drawHistory.length <= 1}
                  title="Undo"
                  data-testid="button-undo"
                >
                  <Undo2 className="h-4 w-4" />
                </button>
                <button
                  className="p-2 rounded-md hover:bg-gray-100"
                  onClick={handleClearAnnotations}
                  title="Clear All"
                  data-testid="button-clear"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-md hover:bg-gray-100"
                onClick={reset}
                data-testid="button-cancel-annotations"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2"
                onClick={handleSaveAnnotations}
                data-testid="button-save-annotations"
              >
                <Check className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="cursor-crosshair max-w-full max-h-full"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={() => setIsDrawing(false)}
              data-testid="canvas-annotations"
            />
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9998] bg-black/50 flex items-center justify-center',
        dialogClassName
      )}
      data-screenshot-exclude
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Capture Screenshot</h3>
          <button
            className="p-2 rounded-md hover:bg-gray-100"
            onClick={handleClose}
            data-testid="button-close-capture"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Choose how you want to capture your screen
        </p>

        <div className="space-y-2">
          <button
            className={cn(
              'w-full p-4 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center gap-3 text-left',
              buttonClassName
            )}
            onClick={captureFullFrame}
            disabled={isCapturing}
            data-testid="button-capture-full"
          >
            {isCapturing ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            ) : (
              <Monitor className="h-5 w-5 text-blue-500" />
            )}
            <div>
              <p className="font-medium">Full Frame</p>
              <p className="text-sm text-gray-500">Capture entire visible page</p>
            </div>
          </button>

          <button
            className={cn(
              'w-full p-4 rounded-lg border hover:border-green-500 hover:bg-green-50 transition-colors flex items-center gap-3 text-left',
              buttonClassName
            )}
            onClick={startSnippetCapture}
            disabled={isCapturing}
            data-testid="button-capture-snippet"
          >
            <Scissors className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">Snippet</p>
              <p className="text-sm text-gray-500">Select a region to capture</p>
            </div>
          </button>

          <button
            className={cn(
              'w-full p-4 rounded-lg border hover:border-purple-500 hover:bg-purple-50 transition-colors flex items-center gap-3 text-left',
              buttonClassName
            )}
            onClick={startDrawCapture}
            disabled={isCapturing}
            data-testid="button-capture-draw"
          >
            <Paintbrush className="h-5 w-5 text-purple-500" />
            <div>
              <p className="font-medium">Draw & Annotate</p>
              <p className="text-sm text-gray-500">Capture and add annotations</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
