# @florence/feedback-widget

A standalone bug tracking and feedback widget with screenshot capture, annotation tools, and admin dashboard capabilities. Originally built for BAYADA College of Nursing's Florence LMS.

## Features

- **Screenshot Capture**: Three capture modes - Full Frame, Snippet (region selection), and Draw & Annotate
- **Annotation Tools**: Draw on screenshots with pen, shapes, arrows, and text in multiple colors
- **Feedback Widget**: Floating button that opens a feedback form with type selection, priority, and screenshot attachment
- **Server API**: Express.js routes for storing and managing feedback reports
- **Database Schema**: Drizzle ORM schema for PostgreSQL with all necessary tables

## Installation

```bash
npm install @florence/feedback-widget
# or
yarn add @florence/feedback-widget
# or
pnpm add @florence/feedback-widget
```

## Quick Start

### Frontend (React)

```tsx
import { FeedbackWidget } from '@florence/feedback-widget';

function App() {
  return (
    <div>
      <YourApp />
      
      <FeedbackWidget
        config={{
          apiEndpoint: '/api/feedback',
          user: {
            id: 'user-123',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'admin',
          },
          position: 'bottom-right',
          primaryColor: '#3b82f6',
          enableScreenshots: true,
          reportTypes: ['bug', 'feature_request', 'enhancement'],
        }}
      />
    </div>
  );
}
```

### Backend (Express.js with Drizzle)

```typescript
import express from 'express';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { createFeedbackRouter } from '@florence/feedback-widget/server';

const app = express();
app.use(express.json());

// Database connection
const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

// Mount the feedback routes
app.use('/api/feedback', createFeedbackRouter({
  db,
  adminMiddleware: requireAdminAuth, // Your auth middleware
  onReportCreated: (report) => {
    console.log('New feedback report:', report);
    // Send notifications, etc.
  },
}));

app.listen(3000);
```

### Database Setup

Run the Drizzle migrations or use the schema directly:

```typescript
import { feedbackReports, feedbackReportComments, feedbackReportEvents, feedbackReportUpvotes } from '@florence/feedback-widget/server';

// Add these tables to your Drizzle schema
export { feedbackReports, feedbackReportComments, feedbackReportEvents, feedbackReportUpvotes };
```

Then run your database push:

```bash
npx drizzle-kit push
```

## Components

### FeedbackWidget

The main floating feedback button and form.

```tsx
<FeedbackWidget
  config={{
    apiEndpoint: string;           // Required: API endpoint base URL
    projectId?: string;            // Optional: Project identifier
    user?: {
      id?: string;
      name?: string;
      email?: string;
      role?: string;
    };
    theme?: 'light' | 'dark' | 'auto';
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    primaryColor?: string;         // CSS color for branding
    enableScreenshots?: boolean;   // Default: true
    enableAnnotations?: boolean;   // Default: true
    reportTypes?: ReportType[];    // Which types to show
    onSubmit?: (report) => void;   // Callback after successful submission
    onError?: (error) => void;     // Callback on error
  }}
/>
```

### ScreenshotCapture

Standalone screenshot capture component.

```tsx
import { ScreenshotCapture, CapturedScreenshot } from '@florence/feedback-widget';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [screenshots, setScreenshots] = useState<CapturedScreenshot[]>([]);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Capture Screenshot</button>
      
      <ScreenshotCapture
        isOpen={isOpen}
        onCapture={(screenshot) => {
          setScreenshots(prev => [...prev, screenshot]);
          setIsOpen(false);
        }}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
```

### ScreenshotGallery

Display and manage captured screenshots.

```tsx
import { ScreenshotGallery } from '@florence/feedback-widget';

<ScreenshotGallery
  screenshots={screenshots}
  onRemove={(id) => setScreenshots(prev => prev.filter(s => s.id !== id))}
  maxHeight="200px"
  isEditable={true}
/>
```

## API Routes

The server package provides these routes:

| Method | Path | Description |
|--------|------|-------------|
| POST | /reports | Create a new feedback report |
| GET | /reports | List reports (with pagination, filtering) |
| GET | /reports/:id | Get a single report with comments/events |
| PATCH | /reports/:id | Update a report |
| DELETE | /reports/:id | Delete a report |
| POST | /reports/:id/comments | Add a comment |
| POST | /reports/:id/upvote | Toggle upvote |
| GET | /stats | Get statistics |

## Types

```typescript
import type {
  CapturedScreenshot,
  CaptureMode,
  FeedbackReport,
  FeedbackWidgetConfig,
  ReportType,
  Priority,
  Status,
} from '@florence/feedback-widget';
```

## Styling

The widget uses Tailwind CSS classes. You can include the base styles or use your own Tailwind setup:

```css
/* In your main CSS file */
@import '@florence/feedback-widget/styles';
```

Or import directly in JavaScript/TypeScript:

```typescript
import '@florence/feedback-widget/styles';
```

Or configure Tailwind to include the package:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@florence/feedback-widget/dist/**/*.js',
  ],
  // ...
};
```

## Customization

### Custom Styling

Pass className props to customize appearance:

```tsx
<FeedbackWidget
  config={config}
  className="custom-widget-container"
/>
```

### Custom Report Types

```tsx
<FeedbackWidget
  config={{
    ...config,
    reportTypes: ['bug', 'feature_request'], // Only show these types
  }}
/>
```

### Theming

```tsx
<FeedbackWidget
  config={{
    ...config,
    primaryColor: '#8b5cf6', // Purple theme
    theme: 'dark',
  }}
/>
```

## Security

- Screenshots are captured client-side using `html-to-image` (no browser permissions required)
- Elements with `data-screenshot-exclude` attribute are automatically hidden from captures
- Server routes support middleware for authentication/authorization
- All inputs are validated with Zod schemas

## License

MIT License - See LICENSE file for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.
