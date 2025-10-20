// src/debug/agent-test.ts
import { getRootAgent } from "../agents/agent";

async function testAgent() {
    try {
        console.log("🔧 Testing agent...");
        const { runner, hasAI } = await getRootAgent();
        
        console.log("✅ Agent created, hasAI:", hasAI);
        console.log("🔍 Checking runner type:", typeof runner.ask);
        console.log("🔍 Runner methods:", Object.keys(runner));
        
        // Test the ask method
        const testQuestion = "Hello, are you working?";
        console.log("📝 Sending question:", testQuestion);
        
        const result = runner.ask(testQuestion);
        console.log("🔍 Raw result:", result);
        console.log("🔍 Result type:", typeof result);
        console.log("🔍 Is Promise?", result instanceof Promise);
        
        if (result instanceof Promise) {
            const awaitedResult = await result;
            console.log("✅ Awaited result:", awaitedResult);
        } else {
            console.log("✅ Direct result:", result);
        }
        
    } catch (error) {
        console.error("❌ Test failed:", error);
    }
}

// Run the test
testAgent();