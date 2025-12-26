# Stella - Floating AI Chatbot Widget

A professional, production-ready floating chatbot widget with vibrant UI, streaming responses, and seamless integration capabilities. Perfect for embedding into any web application.

---

## 🚀 Quick Start

**No installation required!** This chatbot is 100% client-side JavaScript. Just copy files and update your HTML.

> **Want the shortest version?** See [QUICK-START.md](QUICK-START.md) for a 3-step guide.

### Step 1: Copy Files

Copy these 3 folders to your website directory:

```
your-website/
├── css/          # Copy entire folder
├── js/           # Copy entire folder  
└── assets/       # Copy entire folder
```

### Step 2: Update Your HTML

Open your `index.html` (or main HTML file) and add the chatbot code.

---

### Add CSS to Your HTML

Add these lines in the `<head>` section:

```html
<head>
    <!-- Your existing code -->
    
    <!-- Chatbot CSS -->
    <link rel="stylesheet" href="css/base/variables.css">
    <link rel="stylesheet" href="css/base/reset.css">
    <link rel="stylesheet" href="css/components/chatbot.css">
    <link rel="stylesheet" href="css/components/messages.css">
    <link rel="stylesheet" href="css/animations/animations.css">
    <link rel="stylesheet" href="css/layout/responsive.css">
</head>
```

### Add Chatbot Widget HTML

Add this code before the closing `</body>` tag:

```html
<body>
    <!-- Your existing website content -->
    
    <!-- Chatbot Widget - Copy from here -->
    <div class="chatbot-container" id="chatbotContainer">
        <!-- Chat Icon Button -->
        <button class="chatbot-toggle" id="chatbotToggle" aria-label="Open chat">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" 
                      fill="currentColor"/>
                <circle cx="8" cy="10" r="1.5" fill="white"/>
                <circle cx="12" cy="10" r="1.5" fill="white"/>
                <circle cx="16" cy="10" r="1.5" fill="white"/>
            </svg>
        </button>

        <!-- Chat Window -->
        <div class="chatbot-window" id="chatbotWindow">
            <!-- Header -->
            <div class="chatbot-header">
                <div class="chatbot-header-info">
                    <h3 id="chatbotName" class="chatbot-name">Stella</h3>
                    <p id="chatbotSubtitle" class="chatbot-subtitle">Your AI Assistant</p>
                </div>
                <button class="chatbot-close" id="chatbotClose" aria-label="Close chat">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" 
                              stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>

            <!-- Messages Container -->
            <div class="chatbot-messages" id="chatbotMessages">
                <div class="welcome-message">
                    <div class="message bot-message">
                        <div class="message-content">
                            <p>👋 Hello! I'm Stella, your AI assistant. How can I help you today?</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Input Area -->
            <div class="chatbot-input-container">
                <input type="text" id="chatbotInput" class="chatbot-input" 
                       placeholder="Type your message..." maxlength="500">
                <button id="chatbotSend" class="chatbot-send" aria-label="Send message">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" 
                              stroke="currentColor" stroke-width="2" 
                              stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
    <!-- Copy till here -->

    <!-- Chatbot JavaScript -->
    <script type="module" src="js/main.js"></script>
</body>
```

### Configure the Chatbot

Edit `js/config/config.js`:

```javascript
export const CONFIG = {
  CHATBOT_NAME: "Stella",
  CHATBOT_SUBTITLE: "Your AI Assistant",
  
  // For testing: use mock API (no backend needed)
  USE_MOCK_API: true,
  
  // For production: set your API endpoint
  // USE_MOCK_API: false,
  // API_ENDPOINT: "https://your-api-endpoint.com/chat",
};
```

**That's it!** Your chatbot is ready. Refresh your website to see it.

---

## 🔧 Advanced Configuration

### Setting User Email (Optional)

If users are already logged into your website, you can pre-set their email so they won't be prompted:

Add this code **before** the chatbot script tag:

```html
<script type="module">
  window.addEventListener('chatbotReady', () => {
    const userEmail = 'user@example.com'; // Get from your login system
    window.ChatbotAPI.setUserEmail(userEmail);
  });
</script>
<script type="module" src="js/main.js"></script>
```

If you don't set an email, the chatbot will ask users for it automatically.

### Chatbot API (Optional)

Control the chatbot programmatically:

```javascript
window.ChatbotAPI.openChat();           // Open chat window
window.ChatbotAPI.closeChat();          // Close chat window
window.ChatbotAPI.sendMessage('Hi');    // Send a message
window.ChatbotAPI.setUserEmail('user@example.com');  // Set user email
```

---

## 🔌 Connecting Your API

### Testing with Mock API

For testing without a backend, use mock mode in `js/config/config.js`:

```javascript
USE_MOCK_API: true,
```

### Connecting Your Real API

Your API should accept POST requests:

**Request:**
```json
{
  "email": "user@example.com",
  "query": "What is Tata Play?",
  "response_type": "DOCUMENT"
}
```

**Response:**
```json
{
  "status": "success",
  "response": "Tata Play is India's leading DTH service provider..."
}
```

Configure your API endpoint in `js/config/config.js`:

```javascript
export const CONFIG = {
  USE_MOCK_API: false,
  API_ENDPOINT: "https://your-api-endpoint.com/chat",
};
```

**Important:** Your API must enable CORS to work in browsers.

---

## 🎨 Customization

### Change Bot Name

Edit `js/config/config.js`:

```javascript
CHATBOT_NAME: "Your Bot Name",
CHATBOT_SUBTITLE: "Your Tagline",
```

### Change Colors

Edit `css/base/variables.css`:

```css
:root {
  --primary-gradient-start: #6366f1;
  --primary-gradient-end: #ec4899;
  --accent-color: #14b8a6;
}
```

---

## 🧪 Testing

To test the demo before integrating:

```bash
python3 -m http.server 3000
```

Open `http://localhost:3000` in your browser.

---

## ✅ Frequently Asked Questions

### Do I need to install Node.js, Bun, or npm packages?
**No!** The chatbot is 100% client-side JavaScript. Just copy the files to your existing web server.

### What files do I need?
Copy these 3 folders: `css/`, `js/`, and `assets/`

### Will it work with my existing website?
**Yes!** It works with any HTML website—WordPress, React, Angular, plain HTML, anything with a web server.

### What do I need to configure?
1. Add the CSS links to your HTML `<head>`
2. Add the chatbot HTML widget to your page
3. Add the script tag: `<script type="module" src="js/main.js"></script>`
4. Configure your API endpoint in `js/config/config.js`

### Does it need a backend server?
The chatbot runs in the browser, but it needs your API endpoint to get responses. Configure it in `js/config/config.js` or use the built-in mock API for testing.

### Can I test it before integrating?
**Yes!** Just run `python3 -m http.server 3000` in the project folder and open `http://localhost:3000`

---

**Made with ❤️ for easy integration**
