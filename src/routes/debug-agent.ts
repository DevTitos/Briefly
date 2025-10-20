// src/routes/debug-agent.ts
import type { Context } from "hono";
import { getRootAgent, getSimpleAgent } from "../agents/agent";

export const debugAgentHandler = async (c: Context) => {
    try {
        console.log("🧪 Testing agent creation...");
        
        // Test 1: Try the original agent (which returns a Promise)
        const agentPromise = getRootAgent();
        console.log("🔍 Agent promise:", agentPromise);
        
        let agent;
        try {
            agent = await agentPromise;
            console.log("✅ Original agent resolved:", agent);
        } catch (error) {
            console.log("❌ Original agent failed:", error);
            agent = null;
        }
        
        // Test 2: Use the simple agent (guaranteed to work)
        const simpleAgent = getSimpleAgent();
        console.log("✅ Simple agent:", simpleAgent);
        
        // Test the simple agent
        const testQuestion = "Hello, how are you?";
        const testResponse = await simpleAgent.run(testQuestion);
        console.log("✅ Simple agent test response:", testResponse);

        return c.json({
            status: "success",
            originalAgent: {
                isPromise: true,
                resolved: !!agent,
                type: agent ? typeof agent : 'failed'
            },
            simpleAgent: {
                type: typeof simpleAgent,
                hasRunMethod: typeof simpleAgent.run === 'function',
                testResponse: testResponse
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("❌ Debug failed:", error);
        return c.json({
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
        }, 500);
    }
};