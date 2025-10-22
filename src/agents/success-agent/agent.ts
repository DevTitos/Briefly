import { AgentBuilder } from "@iqai/adk";
import { env } from "../../env";

// Success resources
export const SUCCESS_RESOURCES = {
    quotes: [
        "The future depends on what you do today.",
        "Don't watch the clock; do what it does. Keep going.",
        "The way to get started is to quit talking and begin doing.",
        "It's not whether you get knocked down, it's whether you get up.",
        "Your time is limited, don't waste it living someone else's life."
    ],
    tips: [
        "Break large goals into small, daily actions",
        "Celebrate small wins to maintain motivation",
        "Review your progress at the end of each day",
        "Stay consistent - daily effort compounds over time",
        "Focus on progress, not perfection"
    ]
};

// Success tracker class
export class SuccessTracker {
    private userGoals: Map<string, { goal: string; deadline?: Date }> = new Map();
    private userProgress: Map<string, Array<{ achievement: string; timestamp: Date }>> = new Map();

    setGoal(userId: string, goal: string, deadline?: Date) {
        this.userGoals.set(userId, { goal, deadline });
    }

    logProgress(userId: string, achievement: string) {
        if (!this.userProgress.has(userId)) {
            this.userProgress.set(userId, []);
        }
        this.userProgress.get(userId)!.push({
            achievement,
            timestamp: new Date()
        });
    }

    getSuccessInsights(userId: string, calendarEvents: any[] = []) {
        const userGoal = this.userGoals.get(userId);
        const userProgress = this.userProgress.get(userId) || [];
        
        // Calculate productive hours from calendar events
        const productiveHours = this.calculateProductiveHours(calendarEvents);
        
        // Calculate today's progress
        const today = new Date().toDateString();
        const progressToday = userProgress.filter(p => 
            new Date(p.timestamp).toDateString() === today
        ).length;

        // Determine motivation level
        let motivationLevel = "Ready to start!";
        if (progressToday >= 3) motivationLevel = "Crushing it! 🚀";
        else if (progressToday >= 1) motivationLevel = "Making progress! 👍";
        else if (userGoal) motivationLevel = "Ready to begin! 💪";

        // Generate suggestions
        const suggestions = this.generateSuggestions(userGoal, progressToday, productiveHours);

        return {
            hasGoal: !!userGoal,
            goalText: userGoal?.goal || "",
            progressToday,
            motivationLevel,
            productiveHours,
            suggestions,
            totalAchievements: userProgress.length
        };
    }

    private calculateProductiveHours(calendarEvents: any[]): number {
        if (!calendarEvents || calendarEvents.length === 0) {
            return 2; // Default assumption
        }
        
        // Simple calculation - count events as productive time
        return Math.min(calendarEvents.length, 8);
    }

    private generateSuggestions(userGoal: any, progressToday: number, productiveHours: number): string[] {
        const suggestions: string[] = [];
        
        if (!userGoal) {
            suggestions.push("Set a specific goal for today to get started");
        } else if (progressToday === 0) {
            suggestions.push("Take the first step toward your goal today");
        } else if (progressToday < 2) {
            suggestions.push("Build on your early progress with another small win");
        } else {
            suggestions.push("Maintain your momentum with consistent action");
        }

        if (productiveHours < 3) {
            suggestions.push("Schedule focused work blocks in your calendar");
        } else if (productiveHours > 6) {
            suggestions.push("Remember to take breaks to maintain energy");
        }

        suggestions.push("Review your progress and adjust your approach as needed");

        return suggestions;
    }
}

// Create global instance
export const successTracker = new SuccessTracker();

// Success agent
export const getSuccessAgent = async () => {
    return AgentBuilder.create("success_agent")
        .withDescription("Success coaching and goal tracking agent")
        .withInstruction(`
            You are a success coach and goal achievement specialist. Help users:
            - Set meaningful goals
            - Track progress
            - Stay motivated
            - Overcome obstacles
            - Celebrate achievements

            Always be encouraging, practical, and focused on action.
        `)
        .withModel(env.LLM_MODEL)
        .withTools([
            {
                name: "setGoal",
                description: "Set or update a user's goal",
                parameters: {
                    type: "object",
                    properties: {
                        userId: { type: "string" },
                        goal: { type: "string" },
                        deadline: { type: "string" }
                    },
                    required: ["userId", "goal"]
                },
                execute: async (args: any) => {
                    successTracker.setGoal(args.userId, args.goal, args.deadline ? new Date(args.deadline) : undefined);
                    return { success: true, message: "Goal set successfully!" };
                }
            },
            {
                name: "logProgress",
                description: "Log progress towards a goal",
                parameters: {
                    type: "object",
                    properties: {
                        userId: { type: "string" },
                        achievement: { type: "string" }
                    },
                    required: ["userId", "achievement"]
                },
                execute: async (args: any) => {
                    successTracker.logProgress(args.userId, args.achievement);
                    return { success: true, message: "Progress logged successfully!" };
                }
            },
            {
                name: "getSuccessInsights",
                description: "Get insights about user's success journey",
                parameters: {
                    type: "object",
                    properties: {
                        userId: { type: "string" },
                        calendarEvents: { type: "array" }
                    },
                    required: ["userId"]
                },
                execute: async (args: any) => {
                    return successTracker.getSuccessInsights(args.userId, args.calendarEvents);
                }
            }
        ])
        .build();
};