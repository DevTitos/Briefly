// src/agents/working-agent.ts
export const getWorkingAgent = () => {
    return {
        run: async (input: string): Promise<string> => {
            console.log(`🤖 Processing: ${input}`);
            
            const lowerInput = input.toLowerCase();
            
            if (lowerInput.includes('weather')) {
                return "I'd love to give you weather information! Please enable location services in the Briefly app for personalized weather updates. Right now, I can tell you it's a beautiful day to use Briefly! ☀️";
            }
            
            if (lowerInput.includes('joke')) {
                const jokes = [
                    "Why don't scientists trust atoms? Because they make up everything!",
                    "Why did the scarecrow win an award? Because he was outstanding in his field!",
                    "What do you call a fake noodle? An impasta!",
                    "Why did the coffee file a police report? It got mugged!"
                ];
                return jokes[Math.floor(Math.random() * jokes.length)];
            }
            
            if (lowerInput.includes('calendar')) {
                return "I can help you with your calendar schedule! Connect your Google Calendar using the 'Connect' button to see your upcoming events and meetings.";
            }
            
            if (lowerInput.includes('news')) {
                return "Stay updated with the latest news! The news integration works best when you generate a full daily digest. Try the 'Generate Digest' button!";
            }
            
            if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
                return "Hello! I'm Briefly, your daily assistant. I can help you with weather, calendar, news, and even tell you jokes! What would you like to know?";
            }
            
            return `Thanks for your message! I'm Briefly, here to help you with:
• Weather information 🌤️
• Calendar and scheduling 📅
• News updates 📰
• Jokes and humor 😄

What can I assist you with today?`;
        }
    };
};