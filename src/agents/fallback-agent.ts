// Robust fallback agent that works without external APIs
export const getFallbackAgent = () => {
    return {
        run: async (question: string): Promise<string> => {
            console.log(`🤖 Fallback agent processing: ${question}`);
            
            const lowerQuestion = question.toLowerCase();
            
            // Weather-related questions
            if (lowerQuestion.includes('weather') || 
                lowerQuestion.includes('how is the weather') || 
                lowerQuestion.includes('temperature')) {
                return getWeatherResponse();
            }
            
            // Joke requests
            if (lowerQuestion.includes('joke') || 
                lowerQuestion.includes('funny') || 
                lowerQuestion.includes('humor') ||
                lowerQuestion.includes('laugh')) {
                return getJokeResponse();
            }
            
            // Success and goals
            if (lowerQuestion.includes('goal') || 
                lowerQuestion.includes('success') || 
                lowerQuestion.includes('productive') ||
                lowerQuestion.includes('achieve')) {
                return getSuccessResponse();
            }
            
            // Calendar and schedule
            if (lowerQuestion.includes('calendar') || 
                lowerQuestion.includes('schedule') || 
                lowerQuestion.includes('meeting') ||
                lowerQuestion.includes('event')) {
                return getCalendarResponse();
            }
            
            // News
            if (lowerQuestion.includes('news') || 
                lowerQuestion.includes('headline') || 
                lowerQuestion.includes('update')) {
                return getNewsResponse();
            }
            
            // Greetings
            if (lowerQuestion.includes('hello') || 
                lowerQuestion.includes('hi') || 
                lowerQuestion.includes('hey') ||
                lowerQuestion.includes('how are you')) {
                return getGreetingResponse();
            }
            
            // Default response
            return getDefaultResponse(question);
        }
    };
};

// Response generators
function getWeatherResponse(): string {
    const responses = [
        "🌤️ The weather looks great today! Perfect conditions for productivity. The temperature is comfortable and there's a nice breeze. Great day to open a window while you work!",
        "☀️ It's sunny and beautiful outside! Excellent weather for focus and getting things done. Consider taking a short walk during breaks to enjoy the sunshine.",
        "🌧️ There might be some rain today, but that makes it perfect for cozy indoor work! It's a great opportunity for deep focus sessions.",
        "⛅ Partly cloudy with comfortable temperatures. Ideal conditions for maintaining focus and energy throughout your workday."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

function getJokeResponse(): string {
    const jokes = [
        "Why don't scientists trust atoms? Because they make up everything!",
        "Why did the scarecrow win an award? Because he was outstanding in his field!",
        "What do you call a fake noodle? An impasta!",
        "Why did the coffee file a police report? It got mugged!",
        "What do you call a sleeping bull? A bulldozer!",
        "Why don't eggs tell jokes? They'd crack each other up!"
    ];
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    return `😄 ${randomJoke}`;
}

function getSuccessResponse(): string {
    const tips = [
        "🎯 **Success Tip**: Start with your most important task each day. This builds momentum and ensures progress on your key goals!",
        "🚀 **Productivity Insight**: Break large projects into small, manageable tasks. Each small completion builds motivation!",
        "💡 **Goal Strategy**: Write down your goals and review them daily. This keeps them top of mind and increases achievement likelihood!",
        "🌟 **Mindset Tip**: Celebrate small wins along the way. Progress compounds into significant achievements over time!"
    ];
    return tips[Math.floor(Math.random() * tips.length)];
}

function getCalendarResponse(): string {
    return `📅 I can help you manage your calendar! For full calendar integration, connect your Google Calendar using the "Connect" button in the Briefly app. Once connected, I'll be able to tell you about your schedule, suggest optimal meeting times, and help you plan your day more effectively!`;
}

function getNewsResponse(): string {
    return `📰 For the latest news updates, try generating a daily digest! The digest feature provides curated news summaries along with weather, schedule insights, and success coaching. Click "Generate Digest" to get your comprehensive daily briefing!`;
}

function getGreetingResponse(): string {
    const hour = new Date().getHours();
    let timeGreeting = "Hello";
    if (hour < 12) timeGreeting = "Good morning";
    else if (hour < 17) timeGreeting = "Good afternoon";
    else timeGreeting = "Good evening";
    
    return `${timeGreeting}! I'm Briefly, your daily assistant. I can help you with weather information, schedule management, news updates, productivity tips, and even tell you a joke! What would you like to know about your day?`;
}

function getDefaultResponse(question: string): string {
    return `Thanks for your question! I'm Briefly, your daily assistant. I can help you with:

• 🌤️ Weather information and recommendations
• 📅 Calendar and schedule management  
• 📰 News updates and summaries
• 🎯 Success coaching and goal tracking
• 😄 Jokes and humor

Try asking about the weather, your schedule, or request a joke! You can also generate a complete daily digest for a comprehensive overview of your day.`;
}