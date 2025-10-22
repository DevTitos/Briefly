import { successTracker } from "../agent";
import { SUCCESS_RESOURCES } from "../success-agent/agent";

export const getEnhancedDailyDigestAgent = () => {
    return {
        run: async (userContext: any = {}): Promise<string> => {
            const userId = userContext.userId || 'default-user';
            
            try {
                // Get success insights with error handling
                let successInsights;
                try {
                    successInsights = successTracker.getSuccessInsights(
                        userId, 
                        userContext.calendarEvents || []
                    );
                } catch (error) {
                    console.error('Error getting success insights:', error);
                    successInsights = getFallbackSuccessInsights();
                }

                // Get news briefing
                const newsBriefing = getNewsBriefing(userContext.location);

                // Get random success quote and tip
                const randomQuote = SUCCESS_RESOURCES.quotes[
                    Math.floor(Math.random() * SUCCESS_RESOURCES.quotes.length)
                ];
                const randomTip = SUCCESS_RESOURCES.tips[
                    Math.floor(Math.random() * SUCCESS_RESOURCES.tips.length)
                ];

                // Get time context
                const now = new Date();
                const timeOfDay = getTimeOfDayGreeting(now);
                const dayName = now.toLocaleDateString('en', { weekday: 'long' });

                return `
🌅 Good ${timeOfDay}! Happy ${dayName}! 🌅

Here's your comprehensive daily briefing from Briefly:

🎯 SUCCESS TRACKING
${successInsights.hasGoal ? 
    `Goal: "${successInsights.goalText}"\nProgress Today: ${successInsights.progressToday} achievements\nMotivation Level: ${successInsights.motivationLevel}` :
    "No goal set yet. Set a goal to start tracking your success journey!"
}

📰 NEWS BRIEFING
${newsBriefing}

📊 PRODUCTIVITY METRICS
Productive Hours Scheduled: ${successInsights.productiveHours}
${successInsights.productiveHours < 3 ? "💡 Tip: Try to schedule more focused work time" : "🎉 Great job on scheduling productive time!"}

💪 SUCCESS SUGGESTIONS
${successInsights.suggestions.map((suggestion: string, index: number) => 
    `${index + 1}. ${suggestion}`
).join('\n')}

🌟 DAILY SUCCESS TIP
${randomTip}

📖 MOTIVATIONAL QUOTE
"${randomQuote}"

🚀 TODAY'S CHALLENGE
Complete at least one action that moves you toward your goals today!

Remember: Small, consistent actions lead to big achievements. You've got this! 💫
                `.trim();
            } catch (error) {
                console.error('Error in enhanced digest:', error);
                throw error;
            }
        }
    };
};

export const getSimpleDailyDigestAgent = () => {
    return {
        run: async (): Promise<string> => {
            const now = new Date();
            const timeOfDay = getTimeOfDayGreeting(now);
            const dayName = now.toLocaleDateString('en', { weekday: 'long' });
            
            return `🌅 Good ${timeOfDay}! Happy ${dayName}!

Here's your daily brief from Briefly:

🎯 SUCCESS REMINDER
Today is a new opportunity to make progress toward your goals!

📰 QUICK NEWS UPDATE
• AI tools are helping people be more productive
• New research on morning routines shows benefits
• Local communities are organizing tech events

💡 PRODUCTIVITY TIP
Start with your most important task to build momentum.

🌟 DAILY MOTIVATION
"Don't wait for opportunity. Create it."

Have a productive and successful day! 🚀`;
        }
    };
};

function getTimeOfDayGreeting(date: Date): string {
    const hour = date.getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}

function getFallbackSuccessInsights() {
    return {
        hasGoal: false,
        goalText: "",
        progressToday: 0,
        motivationLevel: "Ready to start!",
        productiveHours: 2,
        suggestions: [
            "Set a clear goal for today",
            "Break your goal into small, manageable tasks",
            "Schedule focused work time in your calendar"
        ]
    };
}

function getNewsBriefing(location: any) {
    const city = location?.city || 'your area';
    
    return `📰 **Today's Top Stories** 📰

🤖 **Technology & AI**
• New AI assistants are becoming more helpful for daily planning
• Productivity apps now feature advanced scheduling tools

💪 **Health & Wellness**
• Morning sunlight exposure shown to boost energy levels
• Digital detox before bed improves sleep quality by 30%

📈 **Productivity**
• Time-blocking techniques help professionals manage schedules
• The 2-minute rule reduces procrastination for small tasks

${location ? `🏠 **Local - ${city}**
• Tech community events happening this week
• Great weather for outdoor meetings and activities` : '🏠 **Local News**\n• Connect location services for local updates'}

Stay informed and productive! 📊`;
}