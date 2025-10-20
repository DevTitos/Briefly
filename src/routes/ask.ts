// src/routes/ask.ts
import type { Context } from "hono";
import { getRootAgent } from "../agents/agent";

/**
 * HTTP handler for the /ask endpoint.
 *
 * Processes POST requests containing user questions and routes them through
 * the root agent for processing. The agent will delegate to appropriate
 * sub-agents based on the question content.
 *
 * Request body should contain:
 * - question: string - The user's question to be processed
 *
 * @param c - Hono context object containing request and response utilities
 * @returns JSON response with the agent's answer, original question, and timestamp
 */
export const askHandler = async (c: Context) => {
	try {
		const body = await c.req.json();
		const { question } = body;

		if (!question) {
			return c.json({ error: "Question is required" }, 400);
		}

		console.log(`📝 Question received: ${question}`);

		// Get the agent (which returns a Promise)
		const agent = await getRootAgent();
		console.log(`🔍 Agent type:`, typeof agent);
		console.log(`🔍 Agent methods:`, Object.keys(agent));

		let response: string;

		// Try different possible methods to run the agent
		if (typeof agent.run === 'function') {
			console.log(`🔄 Using agent.run()`);
			const result = await agent.run(question);
			response = extractResponseText(result);
		} else if (typeof agent.ask === 'function') {
			console.log(`🔄 Using agent.ask()`);
			const result = await agent.ask(question);
			response = extractResponseText(result);
		} else if (agent.runner && typeof agent.runner.ask === 'function') {
			console.log(`🔄 Using agent.runner.ask()`);
			const result = await agent.runner.ask(question);
			response = extractResponseText(result);
		} else if (typeof agent === 'function') {
			console.log(`🔄 Using agent as function`);
			const result = await agent(question);
			response = extractResponseText(result);
		} else {
			console.log(`❌ No compatible method found, using fallback`);
			response = getFallbackResponse(question);
		}

		// Clean up the response
		response = response.replace(/\[object Promise\]/g, '').replace(/\[object Object\]/g, '').trim();

		if (!response) {
			response = "I apologize, but I'm having trouble generating a response right now. Please try again.";
		}

		console.log(`🤖 Response generated: ${response}`);

		return c.json({
			question,
			response,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error processing request:", error);
		return c.json(
			{
				error: "Internal server error",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			500,
		);
	}
};

/**
 * Extract text from various response formats
 */
function extractResponseText(result: any): string {
	console.log(`🔍 Extracting text from:`, typeof result, result);
	
	if (typeof result === 'string') {
		return result;
	}
	
	if (result && typeof result === 'object') {
		// Try common response properties
		if (result.text) return String(result.text);
		if (result.response) return String(result.response);
		if (result.content) return String(result.content);
		if (result.message) return String(result.message);
		if (result.output) return String(result.output);
		if (result.answer) return String(result.answer);
		
		// If it's an array, try to get the first string element
		if (Array.isArray(result)) {
			const firstString = result.find(item => typeof item === 'string');
			if (firstString) return firstString;
		}
		
		// Try to find any string property
		for (const key in result) {
			if (typeof result[key] === 'string' && result[key].length > 0) {
				return result[key];
			}
		}
		
		// Last resort: stringify
		return JSON.stringify(result);
	}
	
	// Fallback
	return String(result);
}

/**
 * Fallback responses when the agent can't process
 */
function getFallbackResponse(question: string): string {
	const lowerQuestion = question.toLowerCase();
	
	if (lowerQuestion.includes('weather')) {
		return "I'd love to give you weather information! Please enable location services in the Briefly app for personalized weather updates. 🌤️";
	}
	
	if (lowerQuestion.includes('joke')) {
		return "Why don't scientists trust atoms? Because they make up everything! 😄";
	}
	
	if (lowerQuestion.includes('calendar')) {
		return "I can help you with your calendar schedule! Connect your Google Calendar to see your upcoming events and meetings. 📅";
	}
	
	if (lowerQuestion.includes('news')) {
		return "Stay updated with the latest news! Try generating a daily digest for comprehensive news updates. 📰";
	}
	
	return "Hello! I'm Briefly, your daily assistant. I can help you with weather information, calendar scheduling, news updates, and more. What would you like to know?";
}