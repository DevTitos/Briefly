import { AgentBuilder } from "@iqai/adk";
import { env } from "../env";
import { getJokeAgent } from "./joke-agent/agent";
import { getWeatherAgent } from "./weather-agent/agent";
import { getSuccessAgent, SuccessTracker } from "./success-agent/agent";
import { getFallbackAgent } from "./fallback-agent";

// Global success tracker instance
export const successTracker = new SuccessTracker();

// Enhanced agent with fallback
export const getRootAgent = async () => {
    try {
        const jokeAgent = await getJokeAgent();
        const weatherAgent = await getWeatherAgent();
        const successAgent = await getSuccessAgent();

        return AgentBuilder.create("root_agent")
            .withDescription("Root agent that coordinates jokes, weather, and success coaching")
            .withInstruction(`
                You are Briefly, a comprehensive daily assistant. Coordinate between specialized agents.
                If any sub-agent fails, provide helpful fallback responses.
            `)
            .withModel(env.LLM_MODEL)
            .withSubAgents([jokeAgent, weatherAgent, successAgent])
            .build();
    } catch (error) {
        console.error('❌ Failed to create main agent, using fallback:', error);
        return getFallbackAgent();
    }
};

// Simple direct agent for guaranteed responses
export const getReliableAgent = () => {
    return getFallbackAgent();
};