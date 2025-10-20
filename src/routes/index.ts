import type { Context } from "hono";

/**
 * Root endpoint handler providing API information and web interface.
 */
export const indexHandler = (c: Context) => {
  const acceptHeader = c.req.header('accept') || '';
  
  // Check if client expects HTML
  if (acceptHeader.includes('text/html') || !acceptHeader.includes('application/json')) {
    return c.html(renderDashboard());
  }

  // JSON response for API clients
  return c.json({
    message: "🤖 Briefly - Your Daily Digest Agent",
    version: "1.0.0",
    endpoints: {
      digest: "GET /digest - Get your daily digest",
      ask: "POST /ask - Ask the AI agent a question",
      health: "GET /health - Health check",
      location: "POST /location - Save user location",
      calendar: {
        auth: "GET /calendar/auth - Start calendar OAuth flow",
        callback: "GET /calendar/callback - OAuth callback",
        status: "GET /calendar/status - Check calendar connection status"
      }
    },
    description: "AI-powered daily briefing that aggregates your calendar, weather, and news",
  });
};

const renderDashboard = () => `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Briefly - Your AI Daily Digest</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .card-hover {
            transition: all 0.3s ease;
        }
        
        .card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .fade-in {
            animation: fadeIn 0.8s ease-in;
        }
        
        .slide-up {
            animation: slideUp 0.5s ease-out;
        }
        
        .typing-indicator {
            display: inline-flex;
            align-items: center;
        }
        
        .typing-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #9CA3AF;
            margin: 0 2px;
            animation: typingAnimation 1.4s infinite ease-in-out;
        }
        
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes typingAnimation {
            0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .chat-container {
            height: 500px;
            background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
        }
        
        .message-user {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-bottom-right-radius: 4px;
        }
        
        .message-assistant {
            background: white;
            border: 1px solid #e2e8f0;
            border-bottom-left-radius: 4px;
        }
        
        .scrollbar-thin {
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 #f1f5f9;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
            width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
        }
        
        .status-connected {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
        }
        
        .status-disconnected {
            background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%);
            color: white;
        }
        
        .location-pulse {
            animation: locationPulse 2s infinite;
        }
        
        @keyframes locationPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        @media (max-width: 768px) {
            .mobile-stack {
                flex-direction: column;
            }
            
            .chat-container {
                height: 400px;
            }
        }
    </style>
</head>
<body class="min-h-screen bg-gray-50">
    <!-- Location Permission Modal -->
    <div id="locationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div class="bg-white rounded-xl p-6 mx-4 max-w-md w-full slide-up">
            <div class="text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-map-marker-alt text-blue-600 text-2xl"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">Enable Location Services</h3>
                <p class="text-gray-600 mb-6">
                    Briefly works best with your location to provide accurate weather information and personalized insights.
                </p>
                <div class="flex space-x-3">
                    <button onclick="denyLocation()" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                        Skip
                    </button>
                    <button onclick="requestLocation()" class="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors">
                        Allow
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Header -->
    <header class="gradient-bg text-white shadow-lg">
        <div class="container mx-auto px-4 py-6">
            <div class="flex justify-between items-center mobile-stack">
                <div class="flex items-center space-x-3 mb-4 md:mb-0">
                    <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <i class="fas fa-newspaper text-white"></i>
                    </div>
                    <h1 class="text-2xl font-bold">Briefly</h1>
                    <span class="bg-white/20 px-2 py-1 rounded-full text-sm">Beta</span>
                </div>
                
                <div class="flex space-x-4">
                    <button onclick="showSection('digest')" id="digestTab" class="bg-white text-purple-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2">
                        <i class="fas fa-bolt"></i>
                        <span>Daily Digest</span>
                    </button>
                    <button onclick="showSection('chat')" id="chatTab" class="bg-white/20 text-white px-6 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center space-x-2">
                        <i class="fas fa-comment"></i>
                        <span>Ask AI</span>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
        <!-- Connection Status Bar -->
        <div class="flex flex-wrap gap-4 mb-8">
            <!-- Location Status -->
            <div id="locationStatus" class="flex items-center space-x-3 status-disconnected rounded-xl shadow-sm px-4 py-3">
                <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <i class="fas fa-map-marker-alt"></i>
                </div>
                <div>
                    <p class="text-sm text-white/80">Location</p>
                    <p class="font-medium text-white" id="locationText">Unknown</p>
                </div>
                <button onclick="showLocationModal()" class="ml-4 text-white hover:text-white/80 transition-colors">
                    <i class="fas fa-edit"></i>
                </button>
            </div>

            <!-- Calendar Status -->
            <div id="calendarStatus" class="flex items-center space-x-3 status-disconnected rounded-xl shadow-sm px-4 py-3">
                <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <i class="fas fa-calendar"></i>
                </div>
                <div>
                    <p class="text-sm text-white/80">Calendar</p>
                    <p class="font-medium text-white" id="calendarText">Not connected</p>
                </div>
                <button onclick="connectCalendar()" id="calendarConnectBtn" class="ml-4 px-3 py-1 bg-white text-gray-800 text-sm rounded-lg hover:bg-gray-100 transition-colors">
                    Connect
                </button>
                <button onclick="disconnectCalendar()" id="calendarDisconnectBtn" class="ml-4 px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors hidden">
                    Disconnect
                </button>
            </div>
        </div>

        <!-- Digest Section -->
        <div id="digestSection" class="section-content">
            <!-- Stats Overview -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white rounded-xl shadow-sm p-6 card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Calendar Events</p>
                            <p class="text-2xl font-bold text-gray-800" id="eventCount">--</p>
                        </div>
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-calendar text-blue-600"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-sm p-6 card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Weather</p>
                            <p class="text-2xl font-bold text-gray-800" id="weatherTemp">--°C</p>
                        </div>
                        <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-sun text-orange-600" id="weatherIcon"></i>
                        </div>
                    </div>
                    <div class="mt-2 text-xs text-gray-500" id="weatherLocation">Location needed</div>
                </div>
                
                <div class="bg-white rounded-xl shadow-sm p-6 card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">News Headlines</p>
                            <p class="text-2xl font-bold text-gray-800" id="newsCount">--</p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-newspaper text-green-600"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Digest Output -->
            <div class="bg-white rounded-xl shadow-sm overflow-hidden mb-8 fade-in">
                <div class="border-b border-gray-200 px-6 py-4">
                    <h2 class="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                        <i class="fas fa-robot text-purple-600"></i>
                        <span>Your Daily Digest</span>
                    </h2>
                    <p class="text-gray-500 text-sm">AI-powered summary of your day</p>
                </div>
                
                <div class="p-6">
                    <div id="digestOutput" class="min-h-64 flex items-center justify-center">
                        <div class="text-center text-gray-400">
                            <i class="fas fa-sparkles text-4xl mb-4"></i>
                            <p class="text-lg">Ready to generate your daily digest</p>
                            <p class="text-sm mt-2">Connect your calendar and enable location for personalized insights</p>
                        </div>
                    </div>
                    
                    <div id="digestLoading" class="hidden text-center py-8">
                        <div class="inline-flex items-center space-x-3 text-purple-600">
                            <div class="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                            <span class="font-medium">Crafting your personalized digest...</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div class="flex justify-between items-center text-sm text-gray-500">
                        <span id="lastUpdated">Last updated: Never</span>
                        <div class="flex space-x-3">
                            <button onclick="copyDigest()" class="hover:text-purple-600 transition-colors">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                            <button onclick="triggerDigest()" class="hover:text-purple-600 transition-colors">
                                <i class="fas fa-redo"></i> Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Chat Section -->
        <div id="chatSection" class="section-content hidden">
            <div class="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                <div class="border-b border-gray-200 px-6 py-4">
                    <h2 class="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                        <i class="fas fa-comments text-purple-600"></i>
                        <span>Ask Briefly AI</span>
                    </h2>
                    <p class="text-gray-500 text-sm">Get real-time answers about your schedule, weather, news, and more</p>
                </div>
                
                <!-- Chat Messages -->
                <div class="chat-container flex flex-col">
                    <div id="chatMessages" class="flex-1 p-6 overflow-y-auto scrollbar-thin space-y-4">
                        <div class="message-assistant p-4 rounded-lg shadow-sm slide-up">
                            <div class="flex items-start space-x-3">
                                <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <i class="fas fa-robot text-white text-sm"></i>
                                </div>
                                <div class="flex-1">
                                    <p class="font-medium text-gray-800">Briefly AI</p>
                                    <p class="text-gray-600 mt-1 leading-relaxed">
                                        Hello! I'm your Briefly assistant. I can help you with:
                                    </p>
                                    <ul class="text-gray-600 mt-2 space-y-1 text-sm">
                                        <li>• Your daily schedule and calendar events</li>
                                        <li>• Weather updates based on your location</li>
                                        <li>• Latest news and trends</li>
                                        <li>• Any other questions about your day!</li>
                                    </ul>
                                    <p class="text-gray-600 mt-2">What would you like to know?</p>
                                    <div class="flex flex-wrap gap-2 mt-3">
                                        <button onclick="insertExample('What do I have scheduled today?')" class="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors">
                                            What's on my calendar?
                                        </button>
                                        <button onclick="insertExample('How is the weather looking?')" class="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
                                            How's the weather?
                                        </button>
                                        <button onclick="insertExample('Any important news today?')" class="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full hover:bg-green-100 transition-colors">
                                            Any important news?
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Chat Input -->
                    <div class="border-t border-gray-200 p-4 bg-white">
                        <form id="chatForm" class="flex space-x-3">
                            <div class="flex-1 relative">
                                <input 
                                    type="text" 
                                    id="chatInput"
                                    placeholder="Ask about your schedule, weather, news, or anything else..."
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    maxlength="500"
                                >
                                <div class="absolute right-3 top-3 text-gray-400 text-sm" id="charCount">0/500</div>
                            </div>
                            <button 
                                type="submit"
                                id="sendButton"
                                class="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i class="fas fa-paper-plane"></i>
                                <span class="hidden sm:inline">Send</span>
                            </button>
                        </form>
                        <div class="text-xs text-gray-500 mt-2 text-center">
                            Briefly AI can access your calendar, weather, and news data to provide personalized answers
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        // Global state
        let userLocation = null;
        let calendarConnected = false;

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            document.body.classList.add('fade-in');
            loadUserPreferences();
            checkCalendarStatus();
            scrollToBottom();
            
            // Show location modal if no location is set
            setTimeout(() => {
                if (!userLocation) {
                    showLocationModal();
                }
            }, 1000);
        });

        // Location Management
        function showLocationModal() {
            document.getElementById('locationModal').classList.remove('hidden');
        }

        function hideLocationModal() {
            document.getElementById('locationModal').classList.add('hidden');
        }

        function denyLocation() {
            hideLocationModal();
            // Set default location or keep as unknown
            updateLocationStatus('Location not set', 'Unknown');
        }

        function requestLocation() {
            if (!navigator.geolocation) {
                alert('Geolocation is not supported by this browser.');
                return;
            }

            hideLocationModal();
            
            // Show loading state
            updateLocationStatus('Detecting location...', 'Detecting...');

            navigator.geolocation.getCurrentPosition(
                async function(position) {
                    const { latitude, longitude } = position.coords;
                    
                    try {
                        // Reverse geocoding to get city name
                        const response = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + latitude + '&longitude=' + longitude + '&localityLanguage=en');
                        const data = await response.json();
                        
                        const city = data.city || data.locality || 'Unknown Location';
                        userLocation = { latitude, longitude, city };
                        
                        // Save to cookies and send to server
                        saveLocationToCookie(userLocation);
                        await sendLocationToServer(userLocation);
                        
                        updateLocationStatus(city, 'Connected');
                        showNotification('Location detected successfully!', 'success');
                        
                    } catch (error) {
                        console.error('Error getting location:', error);
                        updateLocationStatus('Error detecting location', 'Error');
                    }
                },
                function(error) {
                    console.error('Error getting location:', error);
                    updateLocationStatus('Location access denied', 'Denied');
                    showNotification('Location access was denied. You can set it manually later.', 'warning');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 600000 // 10 minutes
                }
            );
        }

        function updateLocationStatus(city, status) {
            document.getElementById('locationText').textContent = city;
            const locationStatus = document.getElementById('locationStatus');
            
            // Update styles based on status
            locationStatus.classList.remove('status-connected', 'status-disconnected');
            if (status === 'Connected') {
                locationStatus.classList.add('status-connected');
            } else {
                locationStatus.classList.add('status-disconnected');
            }
        }

        function saveLocationToCookie(location) {
            const expires = new Date();
            expires.setDate(expires.getDate() + 30); // 30 days
            document.cookie = 'userLocation=' + JSON.stringify(location) + '; expires=' + expires.toUTCString() + '; path=/';
        }

        function getLocationFromCookie() {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'userLocation' && value) {
                    return JSON.parse(decodeURIComponent(value));
                }
            }
            return null;
        }

        async function sendLocationToServer(location) {
            try {
                await fetch('/location', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(location)
                });
            } catch (error) {
                console.error('Error sending location to server:', error);
            }
        }

        // Calendar Integration
        async function connectCalendar() {
            try {
                // For demo purposes, we'll simulate calendar connection
                const response = await fetch('/calendar/auth', { method: 'GET' });
                const data = await response.json();
                
                if (data.authUrl) {
                    // Redirect to Google OAuth
                    window.location.href = data.authUrl;
                } else {
                    // Simulate successful connection for demo
                    calendarConnected = true;
                    updateCalendarStatus(true);
                    showNotification('Calendar connected successfully!', 'success');
                    await checkCalendarStatus();
                }
            } catch (error) {
                console.error('Error connecting calendar:', error);
                showNotification('Failed to connect calendar', 'error');
            }
        }

        async function disconnectCalendar() {
            try {
                await fetch('/calendar/disconnect', { method: 'POST' });
                calendarConnected = false;
                updateCalendarStatus(false);
                showNotification('Calendar disconnected', 'info');
            } catch (error) {
                console.error('Error disconnecting calendar:', error);
            }
        }

        async function checkCalendarStatus() {
            try {
                const response = await fetch('/calendar/status');
                const data = await response.json();
                
                calendarConnected = data.connected || false;
                updateCalendarStatus(calendarConnected);
                
                if (calendarConnected && data.events) {
                    document.getElementById('eventCount').textContent = data.events.length;
                }
            } catch (error) {
                console.error('Error checking calendar status:', error);
            }
        }

        function updateCalendarStatus(connected) {
            const calendarText = document.getElementById('calendarText');
            const connectBtn = document.getElementById('calendarConnectBtn');
            const disconnectBtn = document.getElementById('calendarDisconnectBtn');
            
            if (connected) {
                calendarText.textContent = 'Connected';
                connectBtn.classList.add('hidden');
                disconnectBtn.classList.remove('hidden');
                document.getElementById('calendarStatus').classList.add('status-connected');
                document.getElementById('calendarStatus').classList.remove('status-disconnected');
            } else {
                calendarText.textContent = 'Not connected';
                connectBtn.classList.remove('hidden');
                disconnectBtn.classList.add('hidden');
                document.getElementById('calendarStatus').classList.remove('status-connected');
                document.getElementById('calendarStatus').classList.add('status-disconnected');
            }
        }

        // User Preferences
        function loadUserPreferences() {
            // Load location from cookie
            const savedLocation = getLocationFromCookie();
            if (savedLocation) {
                userLocation = savedLocation;
                updateLocationStatus(savedLocation.city, 'Connected');
            }
        }

        // Notification System
        function showNotification(message, type = 'info') {
            // Create notification element
            const notification = document.createElement('div');
            const bgColor = type === 'success' ? 'bg-green-500' : 
                           type === 'error' ? 'bg-red-500' : 
                           type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
            
            notification.className = 'fixed top-4 right-4 ' + bgColor + ' text-white px-6 py-3 rounded-lg shadow-lg z-50 slide-up';
            
            let icon = 'info-circle';
            if (type === 'success') icon = 'check';
            if (type === 'error') icon = 'exclamation-triangle';
            
            notification.innerHTML = '<div class="flex items-center space-x-3"><i class="fas fa-' + icon + '"></i><span>' + message + '</span></div>';
            
            document.body.appendChild(notification);
            
            // Remove after 5 seconds
            setTimeout(() => {
                notification.remove();
            }, 5000);
        }

        // Tab Management
        function showSection(section) {
            document.querySelectorAll('.section-content').forEach(el => el.classList.add('hidden'));
            document.getElementById(section + 'Section').classList.remove('hidden');
            
            const digestTab = document.getElementById('digestTab');
            const chatTab = document.getElementById('chatTab');
            
            if (section === 'digest') {
                digestTab.classList.remove('bg-white/20', 'text-white');
                digestTab.classList.add('bg-white', 'text-purple-700');
                chatTab.classList.remove('bg-white', 'text-purple-700');
                chatTab.classList.add('bg-white/20', 'text-white');
            } else {
                chatTab.classList.remove('bg-white/20', 'text-white');
                chatTab.classList.add('bg-white', 'text-purple-700');
                digestTab.classList.remove('bg-white', 'text-purple-700');
                digestTab.classList.add('bg-white/20', 'text-white');
            }
        }

        // Enhanced Digest Function with Location
        async function triggerDigest() {
            if (!userLocation) {
                showNotification('Please enable location services for personalized weather information', 'warning');
                showLocationModal();
                return;
            }

            const output = document.getElementById('digestOutput');
            const loading = document.getElementById('digestLoading');
            const generateBtn = document.querySelector('button[onclick="triggerDigest()"]');
            
            output.classList.add('hidden');
            loading.classList.remove('hidden');
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fas fa-spinner animate-spin"></i><span> Generating...</span>';
            
            try {
                const response = await fetch('/digest');
                const data = await response.json();
                
                // Update stats with location-based weather
                if (data.stats) {
                    document.getElementById('eventCount').textContent = data.stats.events || '0';
                    document.getElementById('weatherTemp').textContent = data.stats.temperature || '--°C';
                    document.getElementById('newsCount').textContent = data.stats.news || '0';
                    document.getElementById('weatherLocation').textContent = userLocation.city;
                    
                    const weatherIcon = document.getElementById('weatherIcon');
                    if (data.stats.condition) {
                        weatherIcon.className = getWeatherIcon(data.stats.condition);
                    }
                }
                
                output.classList.remove('hidden');
                loading.classList.add('hidden');
                output.innerHTML = formatDigest(data.digest || data.message);
                
                document.getElementById('lastUpdated').textContent = 'Last updated: ' + new Date().toLocaleTimeString();
                
            } catch (error) {
                console.error('Error:', error);
                output.classList.remove('hidden');
                loading.classList.add('hidden');
                output.innerHTML = '<div class="text-center text-red-600"><i class="fas fa-exclamation-triangle text-2xl mb-2"></i><p>Failed to generate digest. Please try again.</p></div>';
            }
            
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-bolt"></i><span> Generate Digest</span>';
        }

        // Helper functions from previous implementation
        function formatDigest(digest) {
            if (typeof digest === 'string') {
                return '<div class="prose max-w-none"><p class="text-gray-700 leading-relaxed">' + digest.replace(/\\n/g, '</p><p class="text-gray-700 leading-relaxed">') + '</p></div>';
            }
            return '<pre class="text-gray-700">' + JSON.stringify(digest, null, 2) + '</pre>';
        }
        
        function getWeatherIcon(condition) {
            const icons = {
                'sunny': 'fas fa-sun text-orange-500',
                'cloudy': 'fas fa-cloud text-gray-500',
                'rainy': 'fas fa-cloud-rain text-blue-500',
                'snow': 'fas fa-snowflake text-blue-300',
                'storm': 'fas fa-bolt text-yellow-500'
            };
            return icons[condition.toLowerCase()] || 'fas fa-cloud text-gray-400';
        }
        
        async function copyDigest() {
            const digestText = document.getElementById('digestOutput').innerText;
            try {
                await navigator.clipboard.writeText(digestText);
                const btn = event.target;
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => { btn.innerHTML = originalText; }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }

        // Chat Functions
        let isProcessing = false;
        
        document.getElementById('chatInput').addEventListener('input', function(e) {
            document.getElementById('charCount').textContent = e.target.value.length + '/500';
        });
        
        function insertExample(text) {
            document.getElementById('chatInput').value = text;
            document.getElementById('charCount').textContent = text.length + '/500';
            document.getElementById('chatInput').focus();
        }
        
        document.getElementById('chatForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (isProcessing) return;
            
            const input = document.getElementById('chatInput');
            const message = input.value.trim();
            
            if (!message) return;
            
            await sendMessage(message);
            input.value = '';
            document.getElementById('charCount').textContent = '0/500';
        });
        
        async function sendMessage(message) {
            if (isProcessing) return;
            
            isProcessing = true;
            const sendButton = document.getElementById('sendButton');
            const chatInput = document.getElementById('chatInput');
            const chatMessages = document.getElementById('chatMessages');
            
            // Disable input
            chatInput.disabled = true;
            sendButton.disabled = true;
            sendButton.innerHTML = '<i class="fas fa-spinner animate-spin"></i><span class="hidden sm:inline">Sending...</span>';
            
            // Add user message
            addMessage('user', message);
            
            // Add typing indicator
            const typingId = addTypingIndicator();
            
            try {
                const response = await fetch('/ask', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ question: message })
                });
                
                const data = await response.json();
                
                // Remove typing indicator
                removeTypingIndicator(typingId);
                
                if (data.error) {
                    addMessage('assistant', 'Sorry, I encountered an error: ' + data.error, true);
                } else {
                    addMessage('assistant', data.response);
                }
                
            } catch (error) {
                console.error('Error:', error);
                removeTypingIndicator(typingId);
                addMessage('assistant', 'Sorry, I encountered an error while processing your request. Please try again.', true);
            } finally {
                // Re-enable input
                chatInput.disabled = false;
                sendButton.disabled = false;
                sendButton.innerHTML = '<i class="fas fa-paper-plane"></i><span class="hidden sm:inline">Send</span>';
                isProcessing = false;
                chatInput.focus();
            }
        }
        
        function addMessage(role, content, isError = false) {
            const chatMessages = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message-' + role + ' p-4 rounded-lg shadow-sm slide-up ' + (isError ? 'border border-red-200 bg-red-50' : '');
            
            if (role === 'user') {
                messageDiv.innerHTML = '<div class="flex items-start space-x-3 justify-end"><div class="flex-1 text-right"><p class="font-medium text-gray-800">You</p><p class="text-gray-700 mt-1 leading-relaxed">' + content + '</p></div><div class="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full flex items-center justify-center flex-shrink-0"><i class="fas fa-user text-white text-sm"></i></div></div>';
            } else {
                const errorHtml = isError ? '<p class="text-red-500 text-xs mt-2"><i class="fas fa-exclamation-triangle"></i> There was an issue processing your request</p>' : '';
                messageDiv.innerHTML = '<div class="flex items-start space-x-3"><div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0"><i class="fas fa-robot text-white text-sm"></i></div><div class="flex-1"><p class="font-medium text-gray-800">Briefly AI</p><p class="text-gray-600 mt-1 leading-relaxed">' + content + '</p>' + errorHtml + '</div></div>';
            }
            
            chatMessages.appendChild(messageDiv);
            scrollToBottom();
        }
        
        function addTypingIndicator() {
            const chatMessages = document.getElementById('chatMessages');
            const typingDiv = document.createElement('div');
            typingDiv.id = 'typing-indicator';
            typingDiv.className = 'message-assistant p-4 rounded-lg shadow-sm';
            typingDiv.innerHTML = '<div class="flex items-start space-x-3"><div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0"><i class="fas fa-robot text-white text-sm"></i></div><div class="flex-1"><p class="font-medium text-gray-800">Briefly AI</p><div class="typing-indicator mt-2"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div></div>';
            
            chatMessages.appendChild(typingDiv);
            scrollToBottom();
            return 'typing-indicator';
        }
        
        function removeTypingIndicator(id) {
            const typingElement = document.getElementById(id);
            if (typingElement) {
                typingElement.remove();
            }
        }
        
        function scrollToBottom() {
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    </script>
</body>
</html>`;