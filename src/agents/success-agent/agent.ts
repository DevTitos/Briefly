import { AgentBuilder } from "@iqai/adk";
import { env } from "../../env";

export const getSuccessAgent = async () => {
    return AgentBuilder.create("success_coach_agent")
        .withDescription("AI success coach for goal tracking and productivity optimization")
        .withInstruction(`
            You are a professional success coach. Help users achieve their goals through:
            
            1. **Goal Setting & Tracking** - Break down big goals into daily actions
            2. **Habit Formation** - Guide consistent daily routines
            3. **Productivity Optimization** - Suggest efficiency improvements
            4. **Motivational Support** - Provide encouragement and mindset tips
            
            Be practical, encouraging, and focus on actionable advice.
        `)
        .withModel(env.LLM_MODEL)
        .build();
};

// Simple success tracking system
export class SuccessTracker {
    private userGoals: Map<string, any> = new Map();
    private dailyProgress: Map<string, any> = new Map();

    setGoal(userId: string, goal: string, deadline: string) {
        this.userGoals.set(userId, { goal, deadline, createdAt: new Date() });
    }

    logProgress(userId: string, achievement: string) {
        const progress = this.dailyProgress.get(userId) || [];
        progress.push({
            achievement,
            date: new Date(),
            timestamp: Date.now()
        });
        this.dailyProgress.set(userId, progress);
    }

    getSuccessInsights(userId: string, calendarEvents: any[] = []) {
        const goal = this.userGoals.get(userId);
        const progress = this.dailyProgress.get(userId) || [];
        
        // Calculate productivity metrics
        const productiveHours = calendarEvents.filter(event => 
            event.title?.toLowerCase().includes('focus') || 
            event.title?.toLowerCase().includes('work') ||
            event.title?.toLowerCase().includes('meeting')
        ).length;

        const recentProgress = progress.filter((p: any) => {
            const progressDate = new Date(p.date);
            const today = new Date();
            return progressDate.toDateString() === today.toDateString();
        });

        return {
            hasGoal: !!goal,
            goalText: goal?.goal || "No goal set yet",
            progressToday: recentProgress.length,
            productiveHours,
            motivationLevel: this.calculateMotivationLevel(progress.length, productiveHours),
            suggestions: this.generateSuccessSuggestions(goal, productiveHours)
        };
    }

    private calculateMotivationLevel(progressCount: number, productiveHours: number): string {
        const score = progressCount + productiveHours;
        if (score >= 5) return "high";
        if (score >= 2) return "medium";
        return "needs boost";
    }

    private generateSuccessSuggestions(goal: any, productiveHours: number): string[] {
        const suggestions = [];
        
        if (!goal) {
            suggestions.push("Set a clear goal to focus your daily efforts");
        }
        
        if (productiveHours < 2) {
            suggestions.push("Schedule at least 2 hours of focused work today");
        }
        
        if (productiveHours >= 6) {
            suggestions.push("Great productivity! Remember to take breaks and hydrate");
        }
        
        suggestions.push("Review your progress at the end of the day");
        
        return suggestions;
    }
}

// Success quotes and tips database
export const SUCCESS_RESOURCES = {
    quotes: [
        "The only way to do great work is to love what you do. - Steve Jobs",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
        "The future depends on what you do today. - Mahatma Gandhi",
        "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
        "The way to get started is to quit talking and begin doing. - Walt Disney"
    ],
    
    tips: [
        "Start your day with your most important task",
        "Break large goals into small, manageable steps",
        "Track your progress daily to maintain momentum",
        "Celebrate small wins along the way",
        "Learn from setbacks rather than being discouraged by them"
    ]
};