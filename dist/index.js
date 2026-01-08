"use client";
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  FeedbackWidget: () => FeedbackWidget,
  PRIORITY_COLORS: () => PRIORITY_COLORS,
  REPORT_TYPE_LABELS: () => REPORT_TYPE_LABELS,
  STATUS_COLORS: () => STATUS_COLORS,
  ScreenshotCapture: () => ScreenshotCapture,
  ScreenshotGallery: () => ScreenshotGallery,
  clearTextSelection: () => clearTextSelection,
  cn: () => cn,
  createThumbnail: () => createThumbnail,
  formatDate: () => formatDate,
  generateId: () => generateId,
  getBrowserInfo: () => getBrowserInfo,
  getScreenResolution: () => getScreenResolution,
  insertFeedbackCommentSchema: () => insertFeedbackCommentSchema,
  insertFeedbackReportSchema: () => insertFeedbackReportSchema
});
module.exports = __toCommonJS(index_exports);

// src/components/ScreenshotCapture.tsx
var import_react = require("react");
var import_html_to_image = require("html-to-image");
var import_lucide_react = require("lucide-react");

// src/utils/index.ts
var import_clsx = require("clsx");
var import_tailwind_merge = require("tailwind-merge");
function cn(...inputs) {
  return (0, import_tailwind_merge.twMerge)((0, import_clsx.clsx)(inputs));
}
function generateId() {
  return `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
function clearTextSelection() {
  if (window.getSelection) {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  }
}
function createThumbnail(dataUrl, maxSize = 150) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ratio = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } else {
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
}
function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  if (ua.includes("Firefox/")) {
    browser = "Firefox " + ua.split("Firefox/")[1].split(" ")[0];
  } else if (ua.includes("Chrome/") && !ua.includes("Edg/")) {
    browser = "Chrome " + ua.split("Chrome/")[1].split(" ")[0];
  } else if (ua.includes("Safari/") && !ua.includes("Chrome/")) {
    browser = "Safari " + ua.split("Version/")[1]?.split(" ")[0] || "";
  } else if (ua.includes("Edg/")) {
    browser = "Edge " + ua.split("Edg/")[1].split(" ")[0];
  }
  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  return `${browser} on ${os}`;
}
function getScreenResolution() {
  return `${window.screen.width}x${window.screen.height}`;
}
function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
var PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800"
};
var STATUS_COLORS = {
  new: "bg-purple-100 text-purple-800",
  in_review: "bg-yellow-100 text-yellow-800",
  planned: "bg-cyan-100 text-cyan-800",
  in_progress: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800"
};
var REPORT_TYPE_LABELS = {
  bug: "Bug",
  feature_request: "Feature Request",
  enhancement: "Enhancement",
  general_feedback: "General Feedback"
};

// src/components/ScreenshotCapture.tsx
var import_jsx_runtime = require("react/jsx-runtime");
async function captureDOM() {
  clearTextSelection();
  const target = document.body;
  const dataUrl = await (0, import_html_to_image.toPng)(target, {
    quality: 0.95,
    pixelRatio: window.devicePixelRatio || 1,
    cacheBust: true,
    skipAutoScale: true,
    filter: (node) => {
      if (node instanceof Element) {
        const tagName = node.tagName?.toLowerCase();
        if (tagName === "script" || tagName === "noscript") return false;
        if (node.hasAttribute("data-screenshot-exclude")) return false;
        if (node.closest("[data-screenshot-exclude]")) return false;
      }
      return true;
    }
  });
  return dataUrl;
}
var COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#000000",
  "#ffffff"
];
function ScreenshotCapture({
  onCapture,
  onClose,
  isOpen,
  buttonClassName,
  dialogClassName
}) {
  const [mode, setMode] = (0, import_react.useState)(null);
  const [isCapturing, setIsCapturing] = (0, import_react.useState)(false);
  const [capturedImage, setCapturedImage] = (0, import_react.useState)(null);
  const [isAnnotating, setIsAnnotating] = (0, import_react.useState)(false);
  const [snippetStart, setSnippetStart] = (0, import_react.useState)(null);
  const [snippetEnd, setSnippetEnd] = (0, import_react.useState)(null);
  const [isSelectingSnippet, setIsSelectingSnippet] = (0, import_react.useState)(false);
  const [drawTool, setDrawTool] = (0, import_react.useState)("pen");
  const [drawColor, setDrawColor] = (0, import_react.useState)("#ef4444");
  const [brushSize, setBrushSize] = (0, import_react.useState)(3);
  const [isDrawing, setIsDrawing] = (0, import_react.useState)(false);
  const [drawHistory, setDrawHistory] = (0, import_react.useState)([]);
  const canvasRef = (0, import_react.useRef)(null);
  const overlayRef = (0, import_react.useRef)(null);
  const lastPointRef = (0, import_react.useRef)(null);
  const reset = (0, import_react.useCallback)(() => {
    setMode(null);
    setCapturedImage(null);
    setIsAnnotating(false);
    setSnippetStart(null);
    setSnippetEnd(null);
    setIsSelectingSnippet(false);
    setDrawHistory([]);
    lastPointRef.current = null;
  }, []);
  const handleClose = (0, import_react.useCallback)(() => {
    reset();
    onClose();
  }, [reset, onClose]);
  const captureFullFrame = (0, import_react.useCallback)(async () => {
    setIsCapturing(true);
    handleClose();
    clearTextSelection();
    await new Promise((resolve) => setTimeout(resolve, 100));
    try {
      const dataUrl = await captureDOM();
      const thumbnail = await createThumbnail(dataUrl);
      const screenshot = {
        id: generateId(),
        dataUrl,
        thumbnail,
        captureMode: "full",
        timestamp: /* @__PURE__ */ new Date()
      };
      onCapture(screenshot);
    } catch (error) {
      console.error("Full frame capture error:", error);
    } finally {
      setIsCapturing(false);
      reset();
    }
  }, [handleClose, onCapture, reset]);
  const startSnippetCapture = (0, import_react.useCallback)(async () => {
    setIsCapturing(true);
    onClose();
    clearTextSelection();
    await new Promise((resolve) => setTimeout(resolve, 100));
    setMode("snippet");
    setIsSelectingSnippet(true);
    setIsCapturing(false);
  }, [onClose]);
  const handleSnippetMouseDown = (0, import_react.useCallback)(
    (e) => {
      if (!isSelectingSnippet) return;
      const target = e.target;
      if (target.closest("[data-snippet-cancel]")) {
        return;
      }
      e.preventDefault();
      clearTextSelection();
      setSnippetStart({ x: e.clientX, y: e.clientY });
      setSnippetEnd({ x: e.clientX, y: e.clientY });
    },
    [isSelectingSnippet]
  );
  const handleSnippetMouseMove = (0, import_react.useCallback)(
    (e) => {
      if (!isSelectingSnippet || !snippetStart) return;
      e.preventDefault();
      setSnippetEnd({ x: e.clientX, y: e.clientY });
    },
    [isSelectingSnippet, snippetStart]
  );
  const handleSnippetMouseUp = (0, import_react.useCallback)(async () => {
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
      await new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load captured image"));
        img.src = fullDataUrl;
      });
      const scaleX = img.width / window.innerWidth;
      const scaleY = img.height / window.innerHeight;
      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = width * scaleX;
      cropCanvas.height = height * scaleY;
      const cropCtx = cropCanvas.getContext("2d");
      if (!cropCtx) throw new Error("Canvas context error");
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
      const croppedDataUrl = cropCanvas.toDataURL("image/png", 0.95);
      const thumbnail = await createThumbnail(croppedDataUrl);
      const screenshot = {
        id: generateId(),
        dataUrl: croppedDataUrl,
        thumbnail,
        captureMode: "snippet",
        timestamp: /* @__PURE__ */ new Date()
      };
      onCapture(screenshot);
    } catch (error) {
      console.error("Snippet capture error:", error);
    } finally {
      setIsCapturing(false);
      reset();
    }
  }, [isSelectingSnippet, snippetStart, snippetEnd, onCapture, reset]);
  const cancelSnippetSelection = (0, import_react.useCallback)(() => {
    setIsSelectingSnippet(false);
    reset();
  }, [reset]);
  (0, import_react.useEffect)(() => {
    if (isSelectingSnippet) {
      const handleEscape = (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          cancelSnippetSelection();
        }
      };
      window.addEventListener("mousedown", handleSnippetMouseDown);
      window.addEventListener("mousemove", handleSnippetMouseMove);
      window.addEventListener("mouseup", handleSnippetMouseUp);
      window.addEventListener("keydown", handleEscape, true);
      return () => {
        window.removeEventListener("mousedown", handleSnippetMouseDown);
        window.removeEventListener("mousemove", handleSnippetMouseMove);
        window.removeEventListener("mouseup", handleSnippetMouseUp);
        window.removeEventListener("keydown", handleEscape, true);
      };
    }
  }, [
    isSelectingSnippet,
    handleSnippetMouseDown,
    handleSnippetMouseMove,
    handleSnippetMouseUp,
    cancelSnippetSelection
  ]);
  const startDrawCapture = (0, import_react.useCallback)(async () => {
    setIsCapturing(true);
    onClose();
    await new Promise((resolve) => setTimeout(resolve, 100));
    try {
      const dataUrl = await captureDOM();
      setCapturedImage(dataUrl);
      setMode("draw");
      setIsAnnotating(true);
    } catch (error) {
      console.error("Draw capture error:", error);
      reset();
    } finally {
      setIsCapturing(false);
    }
  }, [onClose, reset]);
  (0, import_react.useEffect)(() => {
    if (isAnnotating && capturedImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
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
          displayHeight = displayHeight * maxDisplayWidth / displayWidth;
          displayWidth = maxDisplayWidth;
        }
        if (displayHeight > maxDisplayHeight) {
          displayWidth = displayWidth * maxDisplayHeight / displayHeight;
          displayHeight = maxDisplayHeight;
        }
        const scale = originalWidth / displayWidth;
        canvas.width = originalWidth;
        canvas.height = originalHeight;
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;
        canvas._scale = scale;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, originalWidth, originalHeight);
        const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setDrawHistory([initialState]);
      };
      img.src = capturedImage;
    }
  }, [isAnnotating, capturedImage]);
  const getCanvasPoint = (0, import_react.useCallback)((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scale = canvas._scale || 1;
    return {
      x: (e.clientX - rect.left) * scale,
      y: (e.clientY - rect.top) * scale
    };
  }, []);
  const saveCanvasState = (0, import_react.useCallback)(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setDrawHistory((prev) => [...prev, imageData]);
  }, []);
  const handleCanvasMouseDown = (0, import_react.useCallback)(
    (e) => {
      const point = getCanvasPoint(e);
      if (!point) return;
      setIsDrawing(true);
      lastPointRef.current = point;
      if (drawTool === "pen") {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (ctx && canvas) {
          const scale = canvas._scale || 1;
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
  const handleCanvasMouseMove = (0, import_react.useCallback)(
    (e) => {
      if (!isDrawing) return;
      const point = getCanvasPoint(e);
      if (!point || !lastPointRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;
      const scale = canvas._scale || 1;
      const scaledBrushSize = brushSize * scale;
      if (drawTool === "pen") {
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(point.x, point.y);
        ctx.strokeStyle = drawColor;
        ctx.lineWidth = scaledBrushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
        lastPointRef.current = point;
      }
    },
    [isDrawing, getCanvasPoint, drawTool, drawColor, brushSize]
  );
  const handleCanvasMouseUp = (0, import_react.useCallback)(
    (e) => {
      if (!isDrawing) return;
      const point = getCanvasPoint(e);
      if (!point || !lastPointRef.current) {
        setIsDrawing(false);
        return;
      }
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) {
        setIsDrawing(false);
        return;
      }
      const scale = canvas._scale || 1;
      const scaledBrushSize = brushSize * scale;
      const startPoint = lastPointRef.current;
      switch (drawTool) {
        case "rectangle":
          ctx.strokeStyle = drawColor;
          ctx.lineWidth = scaledBrushSize;
          ctx.strokeRect(startPoint.x, startPoint.y, point.x - startPoint.x, point.y - startPoint.y);
          break;
        case "circle":
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
        case "arrow":
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
  const handleUndo = (0, import_react.useCallback)(() => {
    if (drawHistory.length <= 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const newHistory = drawHistory.slice(0, -1);
    const prevState = newHistory[newHistory.length - 1];
    ctx.putImageData(prevState, 0, 0);
    setDrawHistory(newHistory);
  }, [drawHistory]);
  const handleClearAnnotations = (0, import_react.useCallback)(() => {
    if (drawHistory.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const originalState = drawHistory[0];
    ctx.putImageData(originalState, 0, 0);
    setDrawHistory([originalState]);
  }, [drawHistory]);
  const handleSaveAnnotations = (0, import_react.useCallback)(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png", 0.95);
    const thumbnail = await createThumbnail(dataUrl);
    const screenshot = {
      id: generateId(),
      dataUrl,
      thumbnail,
      captureMode: "draw",
      timestamp: /* @__PURE__ */ new Date(),
      annotations: "User annotations applied"
    };
    onCapture(screenshot);
    reset();
  }, [onCapture, reset]);
  if (isSelectingSnippet) {
    const selectionRect = snippetStart && snippetEnd ? {
      left: Math.min(snippetStart.x, snippetEnd.x),
      top: Math.min(snippetStart.y, snippetEnd.y),
      width: Math.abs(snippetEnd.x - snippetStart.x),
      height: Math.abs(snippetEnd.y - snippetStart.y)
    } : null;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "div",
      {
        ref: overlayRef,
        className: "fixed inset-0 z-[9999] cursor-crosshair select-none",
        style: {
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          userSelect: "none",
          WebkitUserSelect: "none"
        },
        "data-testid": "snippet-overlay",
        "data-screenshot-exclude": true,
        onMouseDown: (e) => e.preventDefault(),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              className: "absolute top-4 right-4 z-[10000] p-2 bg-white rounded-md hover:bg-gray-100",
              onClick: cancelSnippetSelection,
              "data-snippet-cancel": true,
              "data-testid": "button-cancel-snippet",
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.X, { className: "h-4 w-4" })
            }
          ),
          !snippetStart && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/75 text-white px-6 py-3 rounded-lg text-lg font-medium", children: "Click and drag to select a region" }),
          selectionRect && selectionRect.width > 0 && selectionRect.height > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "div",
            {
              className: "absolute border-2 border-blue-500 bg-blue-500/10",
              style: {
                left: selectionRect.left,
                top: selectionRect.top,
                width: selectionRect.width,
                height: selectionRect.height
              }
            }
          )
        ]
      }
    );
  }
  if (isAnnotating && capturedImage) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fixed inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center p-4", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-full max-h-full overflow-hidden flex flex-col", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between p-3 border-b gap-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center gap-1 border-r pr-2", children: [
            { tool: "pen", icon: import_lucide_react.Pencil, label: "Pen" },
            { tool: "rectangle", icon: import_lucide_react.Square, label: "Rectangle" },
            { tool: "circle", icon: import_lucide_react.Circle, label: "Circle" },
            { tool: "arrow", icon: import_lucide_react.ArrowRight, label: "Arrow" }
          ].map(({ tool, icon: Icon, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              className: cn(
                "p-2 rounded-md",
                drawTool === tool ? "bg-blue-500 text-white" : "hover:bg-gray-100"
              ),
              onClick: () => setDrawTool(tool),
              title: label,
              "data-testid": `button-tool-${tool}`,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
            },
            tool
          )) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center gap-1 border-r pr-2", children: COLORS.map((color) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              className: cn(
                "w-6 h-6 rounded-full border-2 transition-all",
                drawColor === color ? "border-blue-500 scale-110" : "border-transparent"
              ),
              style: { backgroundColor: color },
              onClick: () => setDrawColor(color),
              "data-testid": `button-color-${color.replace("#", "")}`
            },
            color
          )) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2 w-24", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-xs", children: "Size" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "range",
                min: 1,
                max: 20,
                value: brushSize,
                onChange: (e) => setBrushSize(Number(e.target.value)),
                className: "w-full",
                "data-testid": "slider-brush-size"
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-1 border-l pl-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                className: "p-2 rounded-md hover:bg-gray-100 disabled:opacity-50",
                onClick: handleUndo,
                disabled: drawHistory.length <= 1,
                title: "Undo",
                "data-testid": "button-undo",
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Undo2, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                className: "p-2 rounded-md hover:bg-gray-100",
                onClick: handleClearAnnotations,
                title: "Clear All",
                "data-testid": "button-clear",
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Trash2, { className: "h-4 w-4" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              className: "p-2 rounded-md hover:bg-gray-100",
              onClick: reset,
              "data-testid": "button-cancel-annotations",
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.X, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              className: "px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2",
              onClick: handleSaveAnnotations,
              "data-testid": "button-save-annotations",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Check, { className: "h-4 w-4" }),
                "Save"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 overflow-auto p-4 flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "canvas",
        {
          ref: canvasRef,
          className: "cursor-crosshair max-w-full max-h-full",
          onMouseDown: handleCanvasMouseDown,
          onMouseMove: handleCanvasMouseMove,
          onMouseUp: handleCanvasMouseUp,
          onMouseLeave: () => setIsDrawing(false),
          "data-testid": "canvas-annotations"
        }
      ) })
    ] }) });
  }
  if (!isOpen) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      className: cn(
        "fixed inset-0 z-[9998] bg-black/50 flex items-center justify-center",
        dialogClassName
      ),
      "data-screenshot-exclude": true,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 max-w-md w-full mx-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-lg font-semibold", children: "Capture Screenshot" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              className: "p-2 rounded-md hover:bg-gray-100",
              onClick: handleClose,
              "data-testid": "button-close-capture",
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.X, { className: "h-4 w-4" })
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm text-gray-500 mb-4", children: "Choose how you want to capture your screen" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              className: cn(
                "w-full p-4 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center gap-3 text-left",
                buttonClassName
              ),
              onClick: captureFullFrame,
              disabled: isCapturing,
              "data-testid": "button-capture-full",
              children: [
                isCapturing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Loader2, { className: "h-5 w-5 animate-spin text-blue-500" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Monitor, { className: "h-5 w-5 text-blue-500" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "font-medium", children: "Full Frame" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm text-gray-500", children: "Capture entire visible page" })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              className: cn(
                "w-full p-4 rounded-lg border hover:border-green-500 hover:bg-green-50 transition-colors flex items-center gap-3 text-left",
                buttonClassName
              ),
              onClick: startSnippetCapture,
              disabled: isCapturing,
              "data-testid": "button-capture-snippet",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Scissors, { className: "h-5 w-5 text-green-500" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "font-medium", children: "Snippet" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm text-gray-500", children: "Select a region to capture" })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              className: cn(
                "w-full p-4 rounded-lg border hover:border-purple-500 hover:bg-purple-50 transition-colors flex items-center gap-3 text-left",
                buttonClassName
              ),
              onClick: startDrawCapture,
              disabled: isCapturing,
              "data-testid": "button-capture-draw",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Paintbrush, { className: "h-5 w-5 text-purple-500" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "font-medium", children: "Draw & Annotate" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm text-gray-500", children: "Capture and add annotations" })
                ] })
              ]
            }
          )
        ] })
      ] })
    }
  );
}

// src/components/ScreenshotGallery.tsx
var import_react2 = require("react");
var import_lucide_react2 = require("lucide-react");
var import_jsx_runtime2 = require("react/jsx-runtime");
var modeConfig = {
  full: { icon: import_lucide_react2.Monitor, label: "Full Frame", color: "bg-blue-500" },
  snippet: { icon: import_lucide_react2.Scissors, label: "Snippet", color: "bg-green-500" },
  draw: { icon: import_lucide_react2.Paintbrush, label: "Annotated", color: "bg-purple-500" }
};
function ScreenshotGallery({
  screenshots,
  onRemove,
  maxHeight = "200px",
  isEditable = true,
  className
}) {
  const [selectedScreenshot, setSelectedScreenshot] = (0, import_react2.useState)(null);
  const handleDownload = (screenshot) => {
    const link = document.createElement("a");
    link.href = screenshot.dataUrl;
    const timestamp = screenshot.timestamp instanceof Date ? screenshot.timestamp : new Date(screenshot.timestamp);
    link.download = `screenshot_${timestamp.toISOString().replace(/[:.]/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  if (screenshots.length === 0) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: cn("space-y-2", className), children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "text-sm font-medium", children: [
        "Screenshots (",
        screenshots.length,
        ")"
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "div",
        {
          style: { maxHeight },
          className: "overflow-auto rounded-md border p-2",
          children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "grid grid-cols-2 gap-2", children: screenshots.map((screenshot) => {
            const ModeIcon = modeConfig[screenshot.captureMode].icon;
            return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
              "div",
              {
                className: "relative group rounded-md overflow-hidden border bg-gray-50",
                "data-testid": `screenshot-item-${screenshot.id}`,
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                    "img",
                    {
                      src: screenshot.thumbnail,
                      alt: `Screenshot`,
                      className: "w-full h-20 object-cover cursor-pointer",
                      onClick: () => setSelectedScreenshot(screenshot),
                      "data-testid": `img-thumbnail-${screenshot.id}`
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                      "button",
                      {
                        className: "h-7 w-7 flex items-center justify-center text-white hover:bg-white/20 rounded",
                        onClick: (e) => {
                          e.stopPropagation();
                          setSelectedScreenshot(screenshot);
                        },
                        "data-testid": `button-view-${screenshot.id}`,
                        children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_lucide_react2.ZoomIn, { className: "h-4 w-4" })
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                      "button",
                      {
                        className: "h-7 w-7 flex items-center justify-center text-white hover:bg-white/20 rounded",
                        onClick: (e) => {
                          e.stopPropagation();
                          handleDownload(screenshot);
                        },
                        "data-testid": `button-download-${screenshot.id}`,
                        children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_lucide_react2.Download, { className: "h-4 w-4" })
                      }
                    ),
                    isEditable && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                      "button",
                      {
                        className: "h-7 w-7 flex items-center justify-center text-white hover:text-red-400 hover:bg-white/20 rounded",
                        onClick: (e) => {
                          e.stopPropagation();
                          onRemove(screenshot.id);
                        },
                        "data-testid": `button-remove-${screenshot.id}`,
                        children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_lucide_react2.Trash2, { className: "h-4 w-4" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
                    "span",
                    {
                      className: `absolute bottom-1 left-1 ${modeConfig[screenshot.captureMode].color} text-white text-[10px] px-1 py-0.5 rounded flex items-center gap-0.5`,
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ModeIcon, { className: "h-2.5 w-2.5" }),
                        modeConfig[screenshot.captureMode].label
                      ]
                    }
                  )
                ]
              },
              screenshot.id
            );
          }) })
        }
      )
    ] }),
    selectedScreenshot && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "div",
      {
        className: "fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4",
        onClick: () => setSelectedScreenshot(null),
        children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
          "div",
          {
            className: "bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center justify-between p-4 border-b", children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { className: "font-semibold", children: "Screenshot Preview" }),
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                    "span",
                    {
                      className: `${modeConfig[selectedScreenshot.captureMode].color} text-white text-xs px-2 py-0.5 rounded`,
                      children: modeConfig[selectedScreenshot.captureMode].label
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  "button",
                  {
                    className: "p-2 rounded hover:bg-gray-100",
                    onClick: () => setSelectedScreenshot(null),
                    children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_lucide_react2.X, { className: "h-4 w-4" })
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "p-4 space-y-4", children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "overflow-auto max-h-[60vh] rounded-lg border", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  "img",
                  {
                    src: selectedScreenshot.dataUrl,
                    alt: "Screenshot full view",
                    className: "w-full h-auto",
                    "data-testid": "img-screenshot-full"
                  }
                ) }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center justify-between flex-wrap gap-2 text-sm text-gray-500", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
                    "Captured: ",
                    formatDate(selectedScreenshot.timestamp)
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
                      "button",
                      {
                        className: "px-3 py-1.5 border rounded hover:bg-gray-50 flex items-center gap-1",
                        onClick: () => handleDownload(selectedScreenshot),
                        "data-testid": "button-download-full",
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_lucide_react2.Download, { className: "h-4 w-4" }),
                          "Download"
                        ]
                      }
                    ),
                    isEditable && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
                      "button",
                      {
                        className: "px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1",
                        onClick: () => {
                          onRemove(selectedScreenshot.id);
                          setSelectedScreenshot(null);
                        },
                        "data-testid": "button-remove-full",
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_lucide_react2.Trash2, { className: "h-4 w-4" }),
                          "Remove"
                        ]
                      }
                    )
                  ] })
                ] })
              ] })
            ]
          }
        )
      }
    )
  ] });
}

// src/components/FeedbackWidget.tsx
var import_react3 = require("react");
var import_lucide_react3 = require("lucide-react");
var import_jsx_runtime3 = require("react/jsx-runtime");
var REPORT_TYPE_CONFIG = {
  bug: {
    icon: import_lucide_react3.Bug,
    label: "Bug Report",
    color: "text-red-500",
    description: "Something is not working correctly"
  },
  feature_request: {
    icon: import_lucide_react3.Lightbulb,
    label: "Feature Request",
    color: "text-yellow-500",
    description: "Suggest a new feature or improvement"
  },
  enhancement: {
    icon: import_lucide_react3.HelpCircle,
    label: "Enhancement",
    color: "text-blue-500",
    description: "Improve an existing feature"
  },
  general_feedback: {
    icon: import_lucide_react3.MessageSquare,
    label: "General Feedback",
    color: "text-green-500",
    description: "Share your thoughts or comments"
  }
};
var PRIORITY_OPTIONS = [
  { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
  { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-800" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-800" }
];
function FeedbackWidget({ config, className }) {
  const [isOpen, setIsOpen] = (0, import_react3.useState)(false);
  const [showCaptureDialog, setShowCaptureDialog] = (0, import_react3.useState)(false);
  const [isSubmitting, setIsSubmitting] = (0, import_react3.useState)(false);
  const [showSuccess, setShowSuccess] = (0, import_react3.useState)(false);
  const [reportType, setReportType] = (0, import_react3.useState)("bug");
  const [priority, setPriority] = (0, import_react3.useState)("medium");
  const [title, setTitle] = (0, import_react3.useState)("");
  const [description, setDescription] = (0, import_react3.useState)("");
  const [stepsToReproduce, setStepsToReproduce] = (0, import_react3.useState)("");
  const [screenshots, setScreenshots] = (0, import_react3.useState)([]);
  const enabledReportTypes = config.reportTypes || ["bug", "feature_request", "enhancement", "general_feedback"];
  const handleScreenshotCapture = (0, import_react3.useCallback)((screenshot) => {
    setScreenshots((prev) => [...prev, screenshot]);
    setShowCaptureDialog(false);
  }, []);
  const handleRemoveScreenshot = (0, import_react3.useCallback)((id) => {
    setScreenshots((prev) => prev.filter((s) => s.id !== id));
  }, []);
  const resetForm = (0, import_react3.useCallback)(() => {
    setReportType("bug");
    setPriority("medium");
    setTitle("");
    setDescription("");
    setStepsToReproduce("");
    setScreenshots([]);
  }, []);
  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const report = {
        reportType,
        priority,
        status: "new",
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
        annotationsJson: screenshots.length > 0 ? screenshots : null
      };
      const response = await fetch(`${config.apiEndpoint}/feedback/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(report)
      });
      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }
      const createdReport = await response.json();
      config.onSubmit?.(createdReport);
      setShowSuccess(true);
      resetForm();
      setTimeout(() => {
        setShowSuccess(false);
        setIsOpen(false);
      }, 2e3);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      config.onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const position = config.position || "bottom-right";
  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4"
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
      "div",
      {
        className: cn("fixed z-[100]", positionClasses[position], className),
        "data-screenshot-exclude": true,
        children: [
          !isOpen && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            "button",
            {
              className: cn(
                "flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all",
                "bg-blue-500 hover:bg-blue-600 text-white"
              ),
              style: config.primaryColor ? { backgroundColor: config.primaryColor } : void 0,
              onClick: () => setIsOpen(true),
              "data-testid": "button-open-feedback",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.MessageSquare, { className: "h-5 w-5" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-medium", children: "Feedback" })
              ]
            }
          ),
          isOpen && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "w-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl border overflow-hidden", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
              "div",
              {
                className: "flex items-center justify-between p-4 border-b",
                style: config.primaryColor ? { backgroundColor: config.primaryColor, color: "white" } : { backgroundColor: "#3b82f6", color: "white" },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { className: "font-semibold", children: "Send Feedback" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                    "button",
                    {
                      className: "p-1 rounded hover:bg-white/20",
                      onClick: () => setIsOpen(false),
                      "data-testid": "button-close-feedback",
                      children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.X, { className: "h-4 w-4" })
                    }
                  )
                ]
              }
            ),
            showSuccess ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-8 text-center", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.MessageSquare, { className: "h-8 w-8 text-green-500" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h4", { className: "text-lg font-semibold mb-2", children: "Thank You!" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "text-gray-500", children: "Your feedback has been submitted successfully." })
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-4 space-y-4 max-h-[60vh] overflow-y-auto", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "block text-sm font-medium mb-2", children: "Type" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "grid grid-cols-2 gap-2", children: enabledReportTypes.map((type) => {
                  const typeConfig = REPORT_TYPE_CONFIG[type];
                  const Icon = typeConfig.icon;
                  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
                    "button",
                    {
                      className: cn(
                        "p-3 rounded-lg border text-left transition-colors",
                        reportType === type ? "border-blue-500 bg-blue-50" : "hover:border-gray-300"
                      ),
                      onClick: () => setReportType(type),
                      "data-testid": `button-type-${type}`,
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { className: cn("h-5 w-5 mb-1", typeConfig.color) }),
                        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "text-sm font-medium", children: typeConfig.label })
                      ]
                    },
                    type
                  );
                }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "block text-sm font-medium mb-2", children: "Priority" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "flex gap-2", children: PRIORITY_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "button",
                  {
                    className: cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                      priority === option.value ? option.color + " ring-2 ring-offset-1 ring-blue-500" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    ),
                    onClick: () => setPriority(option.value),
                    "data-testid": `button-priority-${option.value}`,
                    children: option.label
                  },
                  option.value
                )) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "block text-sm font-medium mb-2", children: "Title *" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "input",
                  {
                    type: "text",
                    className: "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                    placeholder: "Brief summary of the issue or feedback",
                    value: title,
                    onChange: (e) => setTitle(e.target.value),
                    "data-testid": "input-title"
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "block text-sm font-medium mb-2", children: "Description *" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "textarea",
                  {
                    className: "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y",
                    placeholder: "Provide more details about your feedback...",
                    value: description,
                    onChange: (e) => setDescription(e.target.value),
                    "data-testid": "input-description"
                  }
                )
              ] }),
              reportType === "bug" && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "block text-sm font-medium mb-2", children: "Steps to Reproduce" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "textarea",
                  {
                    className: "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y",
                    placeholder: "1. Go to...\n2. Click on...\n3. See error",
                    value: stepsToReproduce,
                    onChange: (e) => setStepsToReproduce(e.target.value),
                    "data-testid": "input-steps"
                  }
                )
              ] }),
              config.enableScreenshots !== false && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "text-sm font-medium", children: "Screenshots" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
                    "button",
                    {
                      className: "flex items-center gap-1 px-2 py-1 text-sm text-blue-500 hover:bg-blue-50 rounded",
                      onClick: () => setShowCaptureDialog(true),
                      "data-testid": "button-add-screenshot",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Camera, { className: "h-4 w-4" }),
                        "Add Screenshot"
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  ScreenshotGallery,
                  {
                    screenshots,
                    onRemove: handleRemoveScreenshot,
                    maxHeight: "150px"
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                "button",
                {
                  className: cn(
                    "w-full py-2.5 rounded-md font-medium flex items-center justify-center gap-2 transition-colors",
                    "bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  ),
                  style: config.primaryColor ? { backgroundColor: config.primaryColor } : void 0,
                  onClick: handleSubmit,
                  disabled: isSubmitting || !title.trim() || !description.trim(),
                  "data-testid": "button-submit-feedback",
                  children: isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Loader2, { className: "h-4 w-4 animate-spin" }),
                    "Submitting..."
                  ] }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Send, { className: "h-4 w-4" }),
                    "Submit Feedback"
                  ] })
                }
              )
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      ScreenshotCapture,
      {
        isOpen: showCaptureDialog,
        onCapture: handleScreenshotCapture,
        onClose: () => setShowCaptureDialog(false)
      }
    )
  ] });
}

// src/types/index.ts
var import_zod = require("zod");
var insertFeedbackReportSchema = import_zod.z.object({
  reportType: import_zod.z.enum(["bug", "feature_request", "enhancement", "general_feedback"]).default("bug"),
  priority: import_zod.z.enum(["low", "medium", "high", "critical"]).default("medium"),
  status: import_zod.z.enum(["new", "in_review", "planned", "in_progress", "resolved", "closed"]).default("new"),
  title: import_zod.z.string().min(1, "Title is required").max(200),
  description: import_zod.z.string().min(1, "Description is required"),
  stepsToReproduce: import_zod.z.string().optional().nullable(),
  expectedBehavior: import_zod.z.string().optional().nullable(),
  actualBehavior: import_zod.z.string().optional().nullable(),
  pageUrl: import_zod.z.string().optional().nullable(),
  pageTitle: import_zod.z.string().optional().nullable(),
  browserInfo: import_zod.z.string().optional().nullable(),
  screenResolution: import_zod.z.string().optional().nullable(),
  screenshotUrl: import_zod.z.string().optional().nullable(),
  annotationsJson: import_zod.z.any().optional().nullable(),
  reporterId: import_zod.z.string().optional().nullable(),
  reporterName: import_zod.z.string().optional().nullable(),
  reporterEmail: import_zod.z.string().email().optional().nullable(),
  reporterRole: import_zod.z.string().optional().nullable()
});
var insertFeedbackCommentSchema = import_zod.z.object({
  reportId: import_zod.z.string(),
  content: import_zod.z.string().min(1, "Comment content is required"),
  isInternal: import_zod.z.boolean().default(false),
  authorId: import_zod.z.string().optional().nullable(),
  authorName: import_zod.z.string().min(1, "Author name is required"),
  authorRole: import_zod.z.string().optional().nullable(),
  parentCommentId: import_zod.z.string().optional().nullable()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FeedbackWidget,
  PRIORITY_COLORS,
  REPORT_TYPE_LABELS,
  STATUS_COLORS,
  ScreenshotCapture,
  ScreenshotGallery,
  clearTextSelection,
  cn,
  createThumbnail,
  formatDate,
  generateId,
  getBrowserInfo,
  getScreenResolution,
  insertFeedbackCommentSchema,
  insertFeedbackReportSchema
});
//# sourceMappingURL=index.js.map