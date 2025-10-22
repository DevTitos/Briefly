import { AgentBuilder } from "@iqai/adk";
import { env } from "../../env";
import { NewsService } from "./service";
import { UserPreferences } from "./types";

export const getNewsAgent = async () => {
    const newsService = new NewsService();

    return AgentBuilder.create("news_agent")
        .withDescription("Personalized news briefing agent that provides relevant news based on user preferences and location")
        .withInstruction(`
            You are Briefly's News Briefing Agent. Your role is to provide personalized, relevant news updates based on user preferences, location, and interests.

            KEY RESPONSIBILITIES:
            1. Provide concise, relevant news briefings (3-5 key stories)
            2. Personalize content based on user location and preferences
            3. Focus on technology, productivity, health, and personal development
            4. Include local news when location data is available
            5. Keep summaries brief but informative

            FORMATTING GUIDELINES:
            - Start with a friendly greeting
            - Group news by category (Tech, Health, Local, etc.)
            - Use emojis to make it engaging
            - Keep each story to 1-2 sentences
            - End with a positive note or call to action

            PERSONALIZATION RULES:
            - If user has location: include local weather-impacting news
            - If user has goals: include relevant motivational/news
            - Always prioritize tech and productivity news
            - Include 1-2 surprising/interesting facts when possible

            FALLBACK STRATEGY:
            If you can't fetch real news, provide curated interesting updates about:
            - Latest AI and tech developments
            - Productivity research and tips
            - Health and wellness findings
            - Local community updates (if location known)

            Remember: You're part of Briefly - the friendly, helpful daily assistant!
        `)
        .withModel(env.LLM_MODEL)
        .withTools([
            {
                name: "getPersonalizedNews",
                description: "Get personalized news briefing based on user preferences and location",
                parameters: {
                    type: "object",
                    properties: {
                        userPreferences: {
                            type: "object",
                            properties: {
                                location: { type: "string" },
                                interests: { type: "array", items: { type: "string" } },
                                newsCategories: { type: "array", items: { type: "string" } }
                            }
                        },
                        briefingStyle: {
                            type: "string",
                            enum: ["concise", "detailed", "motivational"],
                            description: "Style of news briefing to deliver"
                        }
                    },
                    required: ["userPreferences"]
                },
                execute: async (args: any) => {
                    return await newsService.getPersonalizedBriefing(args.userPreferences, args.briefingStyle);
                }
            },
            {
                name: "getNewsByCategory",
                description: "Get news for specific categories",
                parameters: {
                    type: "object",
                    properties: {
                        categories: {
                            type: "array",
                            items: { type: "string" },
                            description: "News categories to include"
                        },
                        maxStories: { type: "number", description: "Maximum number of stories" }
                    },
                    required: ["categories"]
                },
                execute: async (args: any) => {
                    return await newsService.getNewsByCategory(args.categories, args.maxStories || 5);
                }
            },
            {
                name: "getLocalNews",
                description: "Get local news based on user location",
                parameters: {
                    type: "object",
                    properties: {
                        location: { type: "string", description: "City or region name" },
                        radius: { type: "number", description: "Radius in km for local news" }
                    },
                    required: ["location"]
                },
                execute: async (args: any) => {
                    return await newsService.getLocalNews(args.location, args.radius || 50);
                }
            }
        ])
        .build();
};

// Simple news agent for fallback
export const getSimpleNewsAgent = () => {
    return AgentBuilder.create("simple_news_agent")
        .withDescription("Basic news agent that provides general updates")
        .withInstruction(`
            Provide a friendly news briefing with 3-5 interesting updates about technology, productivity, and wellness.
            Keep it positive and engaging!
        `)
        .withModel(env.LLM_MODEL)
        .build();
};