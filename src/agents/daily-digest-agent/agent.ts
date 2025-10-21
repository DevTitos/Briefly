import { successTracker, SUCCESS_RESOURCES } from "../success-agent/agent";

export const getEnhancedDailyDigestAgent = () => {
    return {
        run: async (userContext: any = {}): Promise<string> => {
            const userId = userContext.userId || 'default-user';
            
            // Get success insights
            const successInsights = successTracker.getSuccessInsights(
                userId, 
                userContext.calendarEvents || []
            );

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
🌅 **Good ${timeOfDay}! Happy ${dayName}!** 🌅

Here's your comprehensive daily briefing from Briefly:

🎯 **SUCCESS TRACKING**
${successInsights.hasGoal ? 
    `Goal: "${successInsights.goalText}"\nProgress Today: ${successInsights.progressToday} achievements\nMotivation Level: ${successInsights.motivationLevel}` :
    "No goal set yet. Set a goal to start tracking your success journey!"
}

📊 **PRODUCTIVITY METRICS**
Productive Hours Scheduled: ${successInsights.productiveHours}
${successInsights.productiveHours < 3 ? "💡 Tip: Try to schedule more focused work time" : "🎉 Great job on scheduling productive time!"}

💪 **SUCCESS SUGGESTIONS**
${successInsights.suggestions.map((suggestion: string, index: number) => 
    `${index + 1}. ${suggestion}`
).join('\n')}

🌟 **DAILY SUCCESS TIP**
${randomTip}

📖 **MOTIVATIONAL QUOTE**
"${randomQuote}"

🚀 **TODAY'S CHALLENGE**
Complete at least one action that moves you toward your goals today!

Remember: Small, consistent actions lead to big achievements. You've got this! 💫
            `;
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

🎯 **SUCCESS REMINDER**
Today is a new opportunity to make progress toward your goals!

💡 **PRODUCTIVITY TIP**
Start with your most important task to build momentum.

🌟 **DAILY MOTIVATION**
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