import type { Context } from "hono";
import { getEnhancedDailyDigestAgent, getSimpleDailyDigestAgent } from "../agents/daily-digest-agent/agent";
import { successTracker } from "../agents/agent";

export const digestHandler = async (c: Context) => {
    try {
        console.log(`📊 Generating success-enhanced daily digest...`);

        // Get user context
        const userContext = await getUserContext(c);
        
        // Use the enhanced digest agent
        const digestAgent = getEnhancedDailyDigestAgent();
        const digest = await digestAgent.run(userContext);

        // Generate stats
        const stats = await generateDigestStats(userContext);

        console.log(`✅ Success-enhanced digest generated`);

        return c.json({
            digest,
            stats,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("❌ Enhanced digest failed, using basic:", error);
        return await basicDigestHandler(c);
    }
};

// Success-specific endpoints
export const setGoalHandler = async (c: Context) => {
    try {
        const body = await c.req.json();
        const { goal, deadline, userId = 'default-user' } = body;

        if (!goal) {
            return c.json({ error: "Goal is required" }, 400);
        }

        successTracker.setGoal(userId, goal, deadline);

        return c.json({
            success: true,
            message: "Goal set successfully!",
            goal,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return c.json({ error: "Failed to set goal" }, 500);
    }
};

export const logProgressHandler = async (c: Context) => {
    try {
        const body = await c.req.json();
        const { achievement, userId = 'default-user' } = body;

        if (!achievement) {
            return c.json({ error: "Achievement description is required" }, 400);
        }

        successTracker.logProgress(userId, achievement);

        return c.json({
            success: true,
            message: "Progress logged successfully!",
            achievement,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return c.json({ error: "Failed to log progress" }, 500);
    }
};

export const getSuccessInsightsHandler = async (c: Context) => {
    try {
        const userId = c.req.query('userId') || 'default-user';
        const calendarEvents = []; // Mock for now

        const insights = successTracker.getSuccessInsights(userId, calendarEvents);

        return c.json({
            success: true,
            insights,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return c.json({ error: "Failed to get insights" }, 500);
    }
};

// Helper functions
async function getUserContext(c: Context): Promise<any> {
    return {
        userId: 'default-user',
        calendarEvents: [], // Mock for now
        location: await getUserLocation(c)
    };
}

async function getUserLocation(c: Context): Promise<any> {
    return { city: "Unknown City" };
}

async function generateDigestStats(userContext: any) {
    const insights = successTracker.getSuccessInsights(
        userContext.userId, 
        userContext.calendarEvents
    );

    return {
        events: userContext.calendarEvents?.length || 0,
        temperature: "22°C",
        news: 5,
        condition: "sunny",
        success: {
            hasGoal: insights.hasGoal,
            progressToday: insights.progressToday,
            motivation: insights.motivationLevel,
            productiveHours: insights.productiveHours
        }
    };
}

// Basic digest fallback
export const basicDigestHandler = async (c: Context) => {
    try {
        const digestAgent = getSimpleDailyDigestAgent();
        const digest = await digestAgent.run();

        const stats = {
            events: 0,
            temperature: "--°C",
            news: 0,
            condition: "unknown",
            success: {
                hasGoal: false,
                progressToday: 0,
                motivation: "unknown",
                productiveHours: 0
            }
        };

        return c.json({
            digest,
            stats,
            timestamp: new Date().toISOString(),
            note: "Basic digest (enhanced version unavailable)"
        });
    } catch (error) {
        return c.json({ error: "Failed to generate digest" }, 500);
    }
};