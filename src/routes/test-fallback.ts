import type { Context } from "hono";
import { getFallbackAgent } from "../agents/fallback-agent";

export const testFallbackHandler = async (c: Context) => {
    const testQuestions = [
        "How is the weather?",
        "Tell me a joke",
        "What are my goals?",
        "What's on my calendar?",
        "Any news today?",
        "Hello!",
        "How can I be more productive?"
    ];

    const fallbackAgent = getFallbackAgent();
    const results = [];

    for (const question of testQuestions) {
        const response = await fallbackAgent.run(question);
        results.push({
            question,
            response: response.substring(0, 100) + '...',
            length: response.length
        });
    }

    return c.json({
        status: "success",
        message: "Fallback agent working correctly",
        results,
        timestamp: new Date().toISOString()
    });
};