export interface UserPreferences {
    location?: string;
    interests?: string[];
    newsCategories?: string[];
    readingTime?: number; // in minutes
    preferredSources?: string[];
    excludedTopics?: string[];
}

export interface NewsItem {
    title: string;
    description: string;
    category: string;
    source: string;
    publishedAt: string;
    url: string;
    relevance?: number;
    imageUrl?: string;
}

export interface NewsBriefing {
    items: NewsItem[];
    summary: string;
    generatedAt: string;
    source: string;
    readingTime?: number;
}

export interface NewsAgentConfig {
    maxStories: number;
    includeLocal: boolean;
    categories: string[];
    style: 'concise' | 'detailed' | 'motivational';
}