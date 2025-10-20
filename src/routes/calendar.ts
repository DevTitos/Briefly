// src/routes/calendar.ts
import { Hono } from 'hono';

export const calendarRouter = new Hono();

// Start OAuth flow
calendarRouter.get('/auth', async (c) => {
  // Generate Google OAuth URL
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.BASE_URL}/calendar/callback`,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    access_type: 'offline',
    prompt: 'consent'
  })}`;
  
  return c.json({ authUrl });
});

// OAuth callback
calendarRouter.get('/callback', async (c) => {
  const code = c.req.query('code');
  
  if (!code) {
    return c.json({ error: 'No authorization code received' }, 400);
  }
  
  // Exchange code for tokens and store them
  // This is a simplified version - you'd implement the full OAuth flow
  
  return c.json({ success: true, message: 'Calendar connected successfully' });
});

// Check connection status
calendarRouter.get('/status', async (c) => {
  // Check if user has valid calendar tokens
  const connected = false; // Implement actual check
  
  return c.json({ 
    connected,
    events: connected ? [] : null // Fetch actual events if connected
  });
});

// Disconnect calendar
calendarRouter.post('/disconnect', async (c) => {
  // Clear stored tokens
  return c.json({ success: true, message: 'Calendar disconnected' });
});