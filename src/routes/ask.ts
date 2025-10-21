import type { Context } from "hono";
import { getRootAgent } from "../agents/agent";
import { getFallbackAgent } from "../agents/fallback-agent";

export const askHandler = async (c: Context) => {
    try {
        const body = await c.req.json();
        const { question } = body;

        if (!question) {
            return c.json({ error: "Question is required" }, 400);
        }

        console.log(`📝 Question received: ${question}`);

        let response: string;

        try {
            // Try to use the main agent first
            const agent = await getRootAgent();
            console.log(`🔍 Agent type:`, typeof agent);
            console.log(`🔍 Agent methods:`, Object.keys(agent));

            // Try different methods
            if (agent.runner && typeof agent.runner.ask === 'function') {
                console.log(`🔄 Using agent.runner.ask()`);
                const result = await agent.runner.ask(question);
                response = extractResponseText(result);
            } else if (typeof agent.run === 'function') {
                console.log(`🔄 Using agent.run()`);
                const result = await agent.run(question);
                response = extractResponseText(result);
            } else {
                throw new Error('No compatible agent method found');
            }

            // Check if we got a real response or an error
            if (response.includes('Error:') || response.includes('fetch failed')) {
                throw new Error('Agent returned error response');
            }

        } catch (agentError) {
            console.log('❌ Agent failed, using fallback:', agentError);
            // Use fallback agent
            const fallbackAgent = getFallbackAgent();
            response = await fallbackAgent.run(question);
        }

        // Clean up the response
        response = response.replace(/\[object Promise\]/g, '').replace(/\[object Object\]/g, '').trim();

        if (!response) {
            response = "I apologize, but I'm having trouble generating a response right now. Please try again.";
        }

        console.log(`🤖 Response generated: ${response.substring(0, 100)}...`);

        return c.json({
            question,
            response,
            timestamp: new Date().toISOString(),
            source: response.includes('😄') || response.includes('🎯') ? 'fallback' : 'agent'
        });
    } catch (error) {
        console.error("Error processing request:", error);
        
        // Ultimate fallback
        const fallbackAgent = getFallbackAgent();
        const response = await fallbackAgent.run("help");
        
        return c.json({
            question: "Your question",
            response,
            timestamp: new Date().toISOString(),
            source: 'fallback',
            error: "Main system unavailable"
        });
    }
};

function extractResponseText(result: any): string {
    console.log(`🔍 Extracting text from:`, typeof result, result);
    
    if (typeof result === 'string') {
        return result;
    }
    
    if (result && typeof result === 'object') {
        if (result.text) return String(result.text);
        if (result.response) return String(result.response);
        if (result.content) return String(result.content);
        if (result.message) return String(result.message);
        if (result.output) return String(result.output);
        if (result.answer) return String(result.answer);
        
        return JSON.stringify(result);
    }
    
    return String(result);
}