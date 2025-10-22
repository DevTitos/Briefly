import { UserPreferences, NewsItem, NewsBriefing } from "./types";

export class NewsService {
    private readonly NEWS_API_KEY = process.env.NEWS_API_KEY;
    private readonly CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

    // Mock news data for when API is not available
    private mockNews: { [category: string]: NewsItem[] } = {
        technology: [
            {
                title: "AI Assistants Becoming More Context-Aware",
                description: "New language models can maintain context over longer conversations, making AI assistants more helpful for daily planning.",
                category: "technology",
                source: "Tech Insights",
                publishedAt: new Date().toISOString(),
                url: "#",
                relevance: 0.9
            },
            {
                title: "Productivity Apps Integrate AI Features",
                description: "Popular productivity tools are adding AI-powered summarization and planning features to help users manage their time better.",
                category: "technology",
                source: "Productivity Weekly",
                publishedAt: new Date().toISOString(),
                url: "#",
                relevance: 0.8
            }
        ],
        health: [
            {
                title: "Morning Sunlight Boosts Productivity",
                description: "Research confirms that 10-15 minutes of morning sunlight can significantly improve focus and energy levels throughout the day.",
                category: "health",
                source: "Wellness Daily",
                publishedAt: new Date().toISOString(),
                url: "#",
                relevance: 0.7
            },
            {
                title: "Digital Detox Improves Sleep Quality",
                description: "Studies show that avoiding screens 1 hour before bed can improve sleep quality by 30%.",
                category: "health",
                source: "Sleep Science",
                publishedAt: new Date().toISOString(),
                url: "#",
                relevance: 0.6
            }
        ],
        productivity: [
            {
                title: "Time-Blocking Gains Popularity",
                description: "More professionals are adopting time-blocking techniques to manage their schedules more effectively.",
                category: "productivity",
                source: "Work Smart",
                publishedAt: new Date().toISOString(),
                url: "#",
                relevance: 0.9
            },
            {
                title: "The 2-Minute Rule for Task Management",
                description: "If a task takes less than 2 minutes, do it immediately. This simple rule is helping people reduce procrastination.",
                category: "productivity",
                source: "Efficiency Tips",
                publishedAt: new Date().toISOString(),
                url: "#",
                relevance: 0.8
            }
        ],
        local: [
            {
                title: "Local Tech Meetup This Weekend",
                description: "Monthly tech community gathering focused on AI and productivity tools.",
                category: "local",
                source: "Community Events",
                publishedAt: new Date().toISOString(),
                url: "#",
                relevance: 0.5
            }
        ]
    };

    async getPersonalizedBriefing(preferences: UserPreferences, style: string = "concise"): Promise<NewsBriefing> {
        try {
            // Try to get real news first
            const realNews = await this.fetchRealNews(preferences);
            if (realNews && realNews.items.length > 0) {
                return this.formatBriefing(realNews, preferences, style);
            }

            // Fallback to mock news
            return this.getMockBriefing(preferences, style);
        } catch (error) {
            console.error('Error fetching personalized news:', error);
            return this.getMockBriefing(preferences, style);
        }
    }

    async getNewsByCategory(categories: string[], maxStories: number = 5): Promise<NewsBriefing> {
        const allItems: NewsItem[] = [];
        
        categories.forEach(category => {
            const categoryNews = this.mockNews[category.toLowerCase()] || [];
            allItems.push(...categoryNews.slice(0, Math.ceil(maxStories / categories.length)));
        });

        return {
            items: allItems.slice(0, maxStories),
            summary: `Latest updates in ${categories.join(', ')}`,
            generatedAt: new Date().toISOString(),
            source: "Briefly News"
        };
    }

    async getLocalNews(location: string, radius: number = 50): Promise<NewsBriefing> {
        // Mock local news based on location
        const localItems: NewsItem[] = [
            {
                title: `${location} Tech Community Growing`,
                description: `Local developers and entrepreneurs in ${location} are forming new collaborations and startups.`,
                category: "local",
                source: "Local Tech News",
                publishedAt: new Date().toISOString(),
                url: "#",
                relevance: 0.7
            },
            {
                title: `Weather Perfect for Outdoor Meetings in ${location}`,
                description: "Clear skies and comfortable temperatures make this a great week for walking meetings.",
                category: "local",
                source: "Local Weather",
                publishedAt: new Date().toISOString(),
                url: "#",
                relevance: 0.6
            }
        ];

        return {
            items: localItems,
            summary: `What's happening in and around ${location}`,
            generatedAt: new Date().toISOString(),
            source: "Briefly Local"
        };
    }

    private async fetchRealNews(preferences: UserPreferences): Promise<NewsBriefing | null> {
        if (!this.NEWS_API_KEY) {
            return null; // No API key, use mock data
        }

        try {
            // This would integrate with a real news API like NewsAPI, GNews, etc.
            // For now, return null to use mock data
            return null;
        } catch (error) {
            console.error('Error fetching real news:', error);
            return null;
        }
    }

    private getMockBriefing(preferences: UserPreferences, style: string): NewsBriefing {
        const categories = this.getRelevantCategories(preferences);
        const allItems: NewsItem[] = [];

        categories.forEach(category => {
            const categoryNews = this.mockNews[category] || [];
            // Add location context to news items if available
            const contextualizedNews = categoryNews.map(item => ({
                ...item,
                title: preferences.location ? 
                    item.title.replace(/Local/g, preferences.location) : item.title,
                relevance: this.calculateRelevance(item, preferences)
            }));
            allItems.push(...contextualizedNews);
        });

        // Sort by relevance and take top stories
        const topStories = allItems
            .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
            .slice(0, style === "detailed" ? 8 : 5);

        return {
            items: topStories,
            summary: this.generateSummary(topStories, preferences, style),
            generatedAt: new Date().toISOString(),
            source: "Briefly News Network"
        };
    }

    private getRelevantCategories(preferences: UserPreferences): string[] {
        const baseCategories = ['technology', 'productivity', 'health'];
        
        if (preferences.location) {
            baseCategories.push('local');
        }

        if (preferences.interests) {
            preferences.interests.forEach(interest => {
                if (!baseCategories.includes(interest.toLowerCase())) {
                    baseCategories.push(interest.toLowerCase());
                }
            });
        }

        return baseCategories;
    }

    private calculateRelevance(item: NewsItem, preferences: UserPreferences): number {
        let relevance = item.relevance || 0.5;

        // Boost relevance if matches user interests
        if (preferences.interests && preferences.interests.some(interest => 
            item.title.toLowerCase().includes(interest.toLowerCase()) ||
            item.description.toLowerCase().includes(interest.toLowerCase())
        )) {
            relevance += 0.3;
        }

        // Boost relevance for local news if location matches
        if (preferences.location && item.category === 'local') {
            relevance += 0.2;
        }

        return Math.min(relevance, 1.0);
    }

    private generateSummary(items: NewsItem[], preferences: UserPreferences, style: string): string {
        const storyCount = items.length;
        const primaryCategories = [...new Set(items.map(item => item.category))];
        
        if (style === "concise") {
            return `Your ${storyCount} most relevant news stories today.`;
        } else if (style === "motivational") {
            return `Stay informed and inspired with ${storyCount} carefully selected updates!`;
        } else {
            return `Today's briefing includes ${storyCount} stories across ${primaryCategories.join(', ')}.`;
        }
    }
}