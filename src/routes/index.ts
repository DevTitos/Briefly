import type { Context } from "hono";
import { readFile } from 'fs/promises';
import { join } from 'path';

export const indexHandler = (c: Context) => {
  const acceptHeader = c.req.header('accept') || '';
  
  if (acceptHeader.includes('text/html') || !acceptHeader.includes('application/json')) {
    return renderDashboard(c);
  }

  return c.json({
    message: "🤖 Briefly - Your AI Daily Assistant",
    version: "2.0.0",
    endpoints: {
      digest: "GET /digest - Get your daily digest",
      ask: "POST /ask - Ask the AI agent a question",
      health: "GET /health - Health check",
      location: "POST /location - Save user location",
      calendar: {
        auth: "GET /calendar/auth - Start calendar OAuth flow",
        callback: "GET /calendar/callback - OAuth callback",
        status: "GET /calendar/status - Check calendar connection status"
      }
    },
    description: "AI-powered daily briefing that aggregates your calendar, weather, news, and success coaching",
  });
};

const renderDashboard = async (c: Context) => {
  try {
    const htmlPath = join(process.cwd(), 'src/static/dashboard.html');
    const htmlContent = await readFile(htmlPath, 'utf-8');
    return c.html(htmlContent);
  } catch (error) {
    console.error('Error loading dashboard:', error);
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Briefly - Error</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="p-8 bg-gray-50">
          <div class="max-w-md mx-auto text-center">
            <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div class="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
              </div>
              <h1 class="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h1>
              <p class="text-gray-600 mb-6">Please check if the dashboard.html file exists in the static folder.</p>
              <button onclick="location.reload()" class="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                Try Again
              </button>
            </div>
          </div>
        </body>
      </html>
    `);
  }
};