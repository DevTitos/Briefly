import type { Context } from "hono";
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { 
  initializeDatabase,
  createSession,
  validateSession,
  deleteSession,
  getUserByEmail,
  createUser,
  getUserPreferences,
  updateUserPreferences
} from '../db';

export const indexHandler = async (c: Context) => {
  const user = c.get('user');
  const acceptHeader = c.req.header('accept') || '';
  
  if (acceptHeader.includes('text/html') || !acceptHeader.includes('application/json')) {
    return renderDashboard(c);
  }

  return c.json({
    message: "🤖 Briefly - Your AI Daily Assistant",
    version: "2.0.0",
    user: user ? { id: user.id, email: user.email, name: user.name } : null,
    endpoints: {
      digest: "GET /digest - Get your daily digest",
      ask: "POST /ask - Ask the AI agent a question",
      health: "GET /health - Health check",
      location: "POST /location - Save user location",
      auth: {
        login: "POST /auth/login - User login",
        logout: "POST /auth/logout - User logout",
        register: "POST /auth/register - User registration",
      },
      calendar: {
        auth: "GET /calendar/auth - Start calendar OAuth flow",
        callback: "GET /calendar/callback - OAuth callback",
        status: "GET /calendar/status - Check calendar connection status"
      }
    },
    description: "AI-powered daily briefing that aggregates your calendar, weather, news, and success coaching",
  });
};

// Auth handlers
export const registerHandler = async (c: Context) => {
  const { email, name } = await c.req.json();
  
  if (!email) {
    return c.json({ error: 'Email is required' }, 400);
  }

  try {
    // Check if user exists
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return c.json({ error: 'User already exists' }, 400);
    }

    // Create user
    const userId = crypto.randomUUID();
    await createUser(userId, email, name || email.split('@')[0]);

    // Create session
    const sessionId = await createSession(
      userId, 
      c.req.header('User-Agent'), 
      c.req.header('CF-Connecting-IP')
    );
    
    setCookie(c, 'session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return c.json({ 
      success: true, 
      message: 'User registered successfully',
      user: { id: userId, email, name: name || email.split('@')[0] }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
};

export const loginHandler = async (c: Context) => {
  const { email } = await c.req.json();
  
  if (!email) {
    return c.json({ error: 'Email is required' }, 400);
  }

  try {
    // Use simple DB functions
    let user = await getUserByEmail(email);

    if (!user) {
      // Auto-create user for demo
      const userId = crypto.randomUUID();
      await createUser(userId, email, email.split('@')[0]);
      user = { id: userId, email, name: email.split('@')[0] };
    }

    // Create session
    const sessionId = await createSession(
      user.id, 
      c.req.header('User-Agent'), 
      c.req.header('CF-Connecting-IP')
    );
    
    setCookie(c, 'session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    // Load user preferences
    const preferences = await getUserPreferences(user.id);

    return c.json({ 
      success: true, 
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name },
      preferences
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed. Please try again.' }, 500);
  }
};

export const logoutHandler = async (c: Context) => {
  const sessionId = getCookie(c, 'session_id');
  
  if (sessionId) {
    await deleteSession(sessionId);
    deleteCookie(c, 'session_id');
  }

  return c.json({ success: true, message: 'Logged out successfully' });
};

// Enhanced handlers with user context
export const locationHandler = async (c: Context) => {
  const user = c.get('user');
  const location = await c.req.json();
  
  if (!user) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  try {
    await updateUserPreferences(user.id, { location: JSON.stringify(location) });
    return c.json({ success: true, message: 'Location saved successfully' });
  } catch (error) {
    console.error('Error saving location:', error);
    return c.json({ error: 'Failed to save location' }, 500);
  }
};

export const digestHandler = async (c: Context) => {
  const user = c.get('user');
  
  // Load user preferences for personalized digest
  let preferences = null;
  if (user) {
    preferences = await getUserPreferences(user.id);
  }

  const location = preferences?.location ? JSON.parse(preferences.location) : null;
  const goals = preferences?.goals ? JSON.parse(preferences.goals) : [];
  const progress = preferences?.progress ? JSON.parse(preferences.progress) : [];

  // Generate personalized digest
  const mockDigest = {
    digest: generatePersonalizedDigest(location, goals, progress),
    stats: {
      events: Math.floor(Math.random() * 8) + 1,
      temperature: "22°C",
      news: Math.floor(Math.random() * 12) + 3,
      condition: "sunny",
      productivity: `${Math.floor(Math.random() * 40) + 60}%`
    },
    user: user ? { name: user.name } : null
  };

  return c.json(mockDigest);
};

// In your src/routes/index.ts - update the askHandler
export const askHandler = async (c: Context) => {
  const user = c.get('user');
  const { question } = await c.req.json();
  
  // Load user context for personalized responses
  let preferences = null;
  if (user) {
    preferences = await getUserPreferences(user.id);
  }

  const response = await generatePersonalizedResponse(question, preferences, user);
  return c.json({ response });
};

// Enhanced response generator with news support
async function generatePersonalizedResponse(question: string, preferences: any, user: any) {
  const lowerQuestion = question.toLowerCase();
  
  // Check if this is a news-related query
  const newsKeywords = ['news', 'headlines', 'updates', 'what\'s happening', 'current events', 'latest'];
  const isNewsQuery = newsKeywords.some(keyword => lowerQuestion.includes(keyword));
  
  if (isNewsQuery) {
    return await getNewsBriefing(preferences, user);
  }
  
  // Existing response logic for other queries
  const location = preferences?.location ? JSON.parse(preferences.location) : null;
  const goals = preferences?.goals ? JSON.parse(preferences.goals) : [];
  const progress = preferences?.progress ? JSON.parse(preferences.progress) : [];
  
  if (lowerQuestion.includes('weather')) {
    const city = location?.city || 'your area';
    return `🌤️ Based on your location in ${city}, I'd expect comfortable temperatures around 22°C with mostly sunny conditions. Perfect weather for productivity!`;
  }
  
  if (lowerQuestion.includes('goal')) {
    const currentGoal = goals && goals.length > 0 ? goals[goals.length - 1] : null;
    return currentGoal ? 
      `🎯 Your current goal is "${currentGoal.goal}". You've made progress with ${progress ? progress.length : 0} total achievements!` :
      "You haven't set any goals yet. Use the 'Set Goal' button to get started!";
  }
  
  if (lowerQuestion.includes('schedule') || lowerQuestion.includes('calendar')) {
    return `📅 Today you have 4 events scheduled:\n• 9:00 AM - Team Standup\n• 11:00 AM - Project Review\n• 2:00 PM - Deep Work Session\n• 4:00 PM - Client Call`;
  }
  
  if (lowerQuestion.includes('joke') || lowerQuestion.includes('funny')) {
    const jokes = [
      "Why don't scientists trust atoms? Because they make up everything!",
      "Why did the scarecrow win an award? Because he was outstanding in his field!",
      "What do you call a fake noodle? An impasta!",
      "Why did the coffee file a police report? It got mugged!"
    ];
    return `😄 ${jokes[Math.floor(Math.random() * jokes.length)]}`;
  }
  
  // Use the AI agent for complex queries
  return await getAIResponse(question, preferences, user);
}

// New function to get news briefing
async function getNewsBriefing(preferences: any, user: any) {
  try {
    // Try to use the AI agent with news capabilities
    const response = await getAIResponse(
      "Give me today's news briefing with 4-5 key stories about technology, productivity, and health. Include local news if location is available.",
      preferences,
      user
    );
    return response;
  } catch (error) {
    console.error('Error getting news briefing:', error);
    // Fallback news briefing
    return getFallbackNewsBriefing(preferences);
  }
}

// Fallback news briefing
function getFallbackNewsBriefing(preferences: any) {
  const location = preferences?.location ? JSON.parse(preferences.location) : null;
  const city = location?.city || 'your area';
  
  return `📰 **Your Daily News Briefing** 📰

Here are today's key updates:

🤖 **Technology & AI**
• New AI assistants are becoming more context-aware and helpful for daily planning
• Productivity apps are integrating advanced scheduling features

💪 **Health & Wellness** 
• Research shows morning sunlight can boost productivity by 25%
• Digital detox before bed improves sleep quality significantly

📈 **Productivity**
• Time-blocking techniques are gaining popularity among professionals
• The 2-minute rule helps reduce procrastination for small tasks

${location ? `🏠 **Local News - ${city}**
• Local tech community is hosting events this week
• Perfect weather conditions for outdoor meetings` : ''}

Stay informed and have a productive day! 🚀`;
}

// Function to get AI response using your agent
async function getAIResponse(question: string, preferences: any, user: any) {
  // This would integrate with your actual AI agent
  // For now, return a smart response
  return `I understand you're asking about "${question}". As your Briefly AI assistant, I'm here to help with news, weather, goals, and productivity. What specific information would you like?`;
}

export const healthHandler = (c: Context) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
};


function generatePersonalizedDigest(location: any, goals: any[], progress: any[]) {
    const city = location?.city || 'your location';
    const currentGoal = goals && goals.length > 0 ? goals[goals.length - 1] : null;
    const todayProgress = progress ? progress.filter((p: any) => new Date(p.timestamp).toDateString() === new Date().toDateString()) : [];

    return `🌅 Good morning! Happy ${new Date().toLocaleDateString('en', { weekday: 'long' })}!

Here's your personalized daily briefing from Briefly:

🎯 SUCCESS TRACKING
${currentGoal ? 
    `Goal: "${currentGoal.goal}"\nProgress Today: ${todayProgress.length} achievements` :
    "No goal set yet. Set a goal to start tracking your success journey!"
}

🌤️ WEATHER IN ${city.toUpperCase()}
Beautiful day ahead with comfortable temperatures around 22°C. Perfect conditions for productivity!

📰 NEWS BRIEFING
${getNewsBriefingSummary(location)}

💡 PRODUCTIVITY TIP
"Start with your most important task when your energy is highest."

🚀 TODAY'S CHALLENGE
Complete at least one action that moves you toward your goals today!`;
}

function getNewsBriefingSummary(location: any) {
    const baseNews = [
        "• AI assistants are becoming more context-aware and helpful",
        "• New research shows morning routines boost productivity by 40%",
        "• Local tech communities are growing rapidly"
    ];
    
    if (location?.city) {
        baseNews[2] = `• ${location.city} tech community hosting events this week`;
    }
    
    return baseNews.join('\n');
}

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
          <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
        </head>
        <body class="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
          <div class="max-w-md w-full">
            <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 text-center">
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