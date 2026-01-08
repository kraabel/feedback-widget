/**
 * Basic Usage Example
 * 
 * This example shows how to integrate the feedback widget into a React application.
 */

import { useState } from 'react';
import { 
  FeedbackWidget, 
  ScreenshotCapture, 
  ScreenshotGallery,
  type CapturedScreenshot,
  type FeedbackWidgetConfig,
} from '@florence/feedback-widget';

// Example 1: Simple Floating Feedback Widget
export function SimpleFeedbackWidget() {
  const config: FeedbackWidgetConfig = {
    apiEndpoint: '/api/feedback',
    position: 'bottom-right',
    primaryColor: '#3b82f6',
    enableScreenshots: true,
    reportTypes: ['bug', 'feature_request', 'enhancement', 'general_feedback'],
    onSubmit: (report) => {
      console.log('Feedback submitted:', report);
    },
    onError: (error) => {
      console.error('Feedback error:', error);
    },
  };

  return <FeedbackWidget config={config} />;
}

// Example 2: Authenticated User Feedback
export function AuthenticatedFeedbackWidget({ user }: { user: { id: string; name: string; email: string } }) {
  const config: FeedbackWidgetConfig = {
    apiEndpoint: '/api/feedback',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'admin',
    },
    position: 'bottom-left',
    primaryColor: '#8b5cf6',
    enableScreenshots: true,
    reportTypes: ['bug', 'feature_request'],
  };

  return <FeedbackWidget config={config} />;
}

// Example 3: Standalone Screenshot Capture
export function StandaloneScreenshotCapture() {
  const [isOpen, setIsOpen] = useState(false);
  const [screenshots, setScreenshots] = useState<CapturedScreenshot[]>([]);

  const handleCapture = (screenshot: CapturedScreenshot) => {
    setScreenshots((prev) => [...prev, screenshot]);
    setIsOpen(false);
    console.log('Screenshot captured:', screenshot.id, screenshot.captureMode);
  };

  const handleRemove = (id: string) => {
    setScreenshots((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Screenshot Capture Demo</h2>
      
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => setIsOpen(true)}
      >
        Capture Screenshot
      </button>

      <div className="mt-4">
        <ScreenshotGallery
          screenshots={screenshots}
          onRemove={handleRemove}
          maxHeight="300px"
          isEditable={true}
        />
      </div>

      <ScreenshotCapture
        isOpen={isOpen}
        onCapture={handleCapture}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}

// Example 4: Custom Themed Widget
export function CustomThemedWidget() {
  const config: FeedbackWidgetConfig = {
    apiEndpoint: '/api/feedback',
    position: 'top-right',
    primaryColor: '#059669', // Emerald
    theme: 'dark',
    enableScreenshots: true,
    enableAnnotations: true,
    reportTypes: ['bug', 'enhancement'],
  };

  return (
    <FeedbackWidget 
      config={config} 
      className="my-custom-widget"
    />
  );
}

// Example 5: Full App Integration
export function AppWithFeedback() {
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4">
        <h1 className="text-2xl font-bold">My Application</h1>
      </header>

      <main className="p-8">
        <p>Your application content goes here...</p>
      </main>

      {/* Feedback widget always present */}
      <FeedbackWidget
        config={{
          apiEndpoint: '/api/feedback',
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
          } : undefined,
          position: 'bottom-right',
          primaryColor: '#2563eb',
          enableScreenshots: true,
        }}
      />
    </div>
  );
}
