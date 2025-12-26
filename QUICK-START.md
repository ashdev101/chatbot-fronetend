# Quick Start Guide

## 3 Simple Steps

### Step 1: Copy Files

Copy these folders to your website:
- `css/`
- `js/`
- `assets/`

### Step 2: Update Your HTML

Add these to your HTML file:

**In the `<head>` section:**

```html
<link rel="stylesheet" href="css/base/variables.css">
<link rel="stylesheet" href="css/base/reset.css">
<link rel="stylesheet" href="css/components/chatbot.css">
<link rel="stylesheet" href="css/components/messages.css">
<link rel="stylesheet" href="css/animations/animations.css">
<link rel="stylesheet" href="css/layout/responsive.css">
```

**Before closing `</body>` tag:**

```html
<!-- Chatbot Widget -->
<div class="chatbot-container" id="chatbotContainer">
    <button class="chatbot-toggle" id="chatbotToggle" aria-label="Open chat">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" 
                  fill="currentColor"/>
            <circle cx="8" cy="10" r="1.5" fill="white"/>
            <circle cx="12" cy="10" r="1.5" fill="white"/>
            <circle cx="16" cy="10" r="1.5" fill="white"/>
        </svg>
    </button>

    <div class="chatbot-window" id="chatbotWindow">
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

        <div class="chatbot-messages" id="chatbotMessages">
            <div class="welcome-message">
                <div class="message bot-message">
                    <div class="message-content">
                        <p>👋 Hello! I'm Stella, your AI assistant. How can I help you today?</p>
                    </div>
                </div>
            </div>
        </div>

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

<!-- Chatbot Script -->
<script type="module" src="js/main.js"></script>
```

### Step 3: Configure

Edit `js/config/config.js`:

```javascript
export const CONFIG = {
  CHATBOT_NAME: "Stella",
  CHATBOT_SUBTITLE: "Your AI Assistant",
  
  // For testing (no backend needed)
  USE_MOCK_API: true,
  
  // For production (add your API)
  // USE_MOCK_API: false,
  // API_ENDPOINT: "https://your-api.com/chat",
};
```

---

## ✅ Done!

Refresh your website. The chatbot icon will appear at the bottom right.

---

## Need Help?

See the complete [README.md](README.md) for:
- API integration details
- Customization options
- Advanced features
- FAQ
