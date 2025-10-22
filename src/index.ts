import { env } from "node:process";
import { serve } from "@hono/node-server";
import * as dotenv from "dotenv";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { sessionMiddleware } from './middleware/session';

import { askHandler } from "./routes/ask";
import { healthHandler } from "./routes/health";
import { locationRouter } from './routes/location';
import { calendarRouter } from './routes/calendar';
import { debugAgentHandler } from "./routes/debug-agent";
import { testFallbackHandler } from "./routes/test-fallback";
import { 
  digestHandler, 
  basicDigestHandler, 
  setGoalHandler, 
  logProgressHandler, 
  getSuccessInsightsHandler 
} from "./routes/digest";
import { 
  indexHandler, 
  locationHandler,
  registerHandler,
  loginHandler,
  logoutHandler,
  saveGoalsHandler,
  saveProgressHandler
} from './routes/index';

import { initializeDatabase } from './db';



dotenv.config();


/**
 * Hono Server with AI Agent
 *
 * A web server using Hono framework that exposes AI agent functionality via REST API.
 */

const app = new Hono();

// Initialize database on first request
let dbInitialized = false;

app.use('*', async (c, next) => {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
  return next();
});

// Middleware
app.use("*", cors());
app.use("*", logger());
app.use("*", prettyJSON());
app.use('*', sessionMiddleware);

// Routes
app.get("/", indexHandler);
app.get("/health", healthHandler);
app.post("/ask", askHandler);
app.route('/location', locationRouter);
app.route('/calendar', calendarRouter);
app.get("/debug-agent", debugAgentHandler);
// Register the routes
app.get("/digest", digestHandler);
app.get("/digest/basic", basicDigestHandler);
app.post("/digest/set-goal", setGoalHandler);
app.post("/digest/log-progress", logProgressHandler);
app.get("/digest/success-insights", getSuccessInsightsHandler);
app.get("/test-fallback", testFallbackHandler);

// Auth routes
app.post('/auth/register', registerHandler);
app.post('/auth/login', loginHandler);
app.post('/auth/logout', logoutHandler);

// Data persistence routes
app.post('/goals/save', saveGoalsHandler);
app.post('/progress/save', saveProgressHandler);

const port = Number(env.PORT) || 3000;

console.log(`🚀 Started Hono server on port ${port}`);
console.log(`👉 Visit http://localhost:${port} to see the server in action`);

/**
 * Start the Hono server with the configured app and port.
 * The server exposes AI agent functionality through REST endpoints.
 */
serve({
	fetch: app.fetch,
	port,
});
