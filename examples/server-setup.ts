/**
 * Server Setup Example
 * 
 * This example shows how to set up the feedback API routes in an Express.js server.
 */

import express from 'express';
import cors from 'cors';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { createFeedbackRouter } from '@florence/feedback-widget/server';

// Database connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow large payloads for screenshots

// Example authentication middleware
function requireAuth(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Verify token and attach user to request
  try {
    // Your token verification logic here
    // req.user = verifyToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Example admin-only middleware
function requireAdmin(req: any, res: any, next: any) {
  // First run auth check
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

// Mount feedback routes
app.use('/api/feedback', createFeedbackRouter({
  db,
  
  // Optional: Require auth for creating reports (set to undefined for public submissions)
  authMiddleware: undefined, // Anyone can submit feedback
  
  // Require admin for viewing/managing reports
  adminMiddleware: requireAdmin,
  
  // Callback when a new report is created
  onReportCreated: async (report) => {
    console.log('New feedback report created:', report.id, report.title);
    
    // Example: Send Slack notification
    // await sendSlackNotification({
    //   channel: '#feedback',
    //   text: `New ${report.reportType}: ${report.title}`,
    // });
    
    // Example: Send email to support team
    // await sendEmail({
    //   to: 'support@example.com',
    //   subject: `[${report.priority}] ${report.title}`,
    //   body: report.description,
    // });
  },
  
  // Callback when status changes
  onStatusChanged: async (report, oldStatus, newStatus) => {
    console.log(`Report ${report.id} status changed: ${oldStatus} -> ${newStatus}`);
    
    // Example: Notify the reporter
    // if (report.reporterEmail && newStatus === 'resolved') {
    //   await sendEmail({
    //     to: report.reporterEmail,
    //     subject: `Your feedback has been resolved`,
    //     body: `Your report "${report.title}" has been resolved.`,
    //   });
    // }
  },
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/**
 * Database Schema Setup
 * 
 * Make sure to add the feedback tables to your Drizzle schema and run migrations:
 * 
 * 1. Add to your schema file:
 * 
 *    import { 
 *      feedbackReports, 
 *      feedbackReportComments, 
 *      feedbackReportEvents, 
 *      feedbackReportUpvotes 
 *    } from '@florence/feedback-widget/server';
 *    
 *    export { 
 *      feedbackReports, 
 *      feedbackReportComments, 
 *      feedbackReportEvents, 
 *      feedbackReportUpvotes 
 *    };
 * 
 * 2. Run migrations:
 *    
 *    npx drizzle-kit push
 * 
 * That's it! The tables will be created automatically.
 */
