// src/agents/agent.ts
import { AgentBuilder } from "@iqai/adk";
import { env } from "../env";
import { getJokeAgent } from "./joke-agent/agent";
import { getWeatherAgent } from "./weather-agent/agent";
import { getSuccessAgent, successTracker, SUCCESS_RESOURCES } from "./success-agent/agent";
import { getNewsAgent, getSimpleNewsAgent } from "./news-agent/agent";
import { getFallbackAgent } from "./fallback-agent";

// Re-export success tracker for other modules to use
export { successTracker, SUCCESS_RESOURCES };

// Enhanced agent with fallback
export const getRootAgent = async () => {
    try {
        const jokeAgent = await getJokeAgent();
        const weatherAgent = await getWeatherAgent();
        const successAgent = await getSuccessAgent();
        const newsAgent = await getNewsAgent();

        return AgentBuilder.create("root_agent")
            .withDescription("Root agent that coordinates jokes, weather, success coaching, and news briefing")
            .withInstruction(`
                You are Briefly, a comprehensive daily assistant. Coordinate between specialized agents for jokes, weather, success coaching, and news.

                NEWS BRIEFING COORDINATION:
                - Use the news agent for any news-related queries like "news", "updates", "headlines", "what's happening"
                - Provide personalized news based on user preferences and location
                - Include local news when location data is available
                - Keep news briefings concise and relevant (3-5 key stories)
                - Focus on technology, productivity, health, and personal development

                RESPONSE FORMAT FOR NEWS:
                - Start with a friendly greeting
                - Group news by category (Tech, Health, Local, etc.)
                - Use emojis to make it engaging
                - Keep each story to 1-2 sentences
                - End with a positive note or call to action

                If any sub-agent fails, provide helpful fallback responses.
            `)
            .withModel(env.LLM_MODEL)
            .withSubAgents([jokeAgent, weatherAgent, successAgent, newsAgent])
            .build();
    } catch (error) {
        console.error('❌ Failed to create main agent, using fallback:', error);
        return getFallbackAgent();
    }
};

// Enhanced reliable agent with news
export const getReliableAgent = () => {
    try {
        return AgentBuilder.create("reliable_agent")
            .withDescription("Reliable agent with built-in news briefing capabilities")
            .withInstruction(`
                You are Briefly's reliable assistant. Provide helpful responses including:
                - Weather information
                - Success coaching and motivation
                - News briefings (tech, productivity, health)
                - Jokes and positive content

                For news queries, provide 3-5 relevant updates about:
                - Technology and AI advancements
                - Productivity research and tips  
                - Health and wellness findings
                - Local community updates (if location known)

                Always personalize based on user context when possible.
            `)
            .withModel(env.LLM_MODEL)
            .build();
    } catch (error) {
        return getFallbackAgent();
    }
};