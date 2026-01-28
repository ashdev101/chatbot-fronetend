import { DOM } from "./ui/dom.js";
import { ChatWindow } from "./ui/chatWindow.js";
import { MessageRenderer } from "./ui/messages.js";
import { ChatStorage } from "./storage/storage.js";
import { Chat } from "./chat/chat.js";
import { CONFIG } from "./config/config.js";

class ChatbotApp {
  constructor() {
    this.dom = new DOM();
    this.chatWindow = null;
    this.messageRenderer = null;
    this.storage = null;
    this.chat = null;
    this.lastTooltipChange = 0; // Track last tooltip change time
  }

  init() {
    if (!this.dom.validate()) {
      console.error("Chatbot: Required DOM elements not found");
      return;
    }

    this.chatWindow = new ChatWindow(this.dom);
    this.messageRenderer = new MessageRenderer(this.dom);
    this.storage = new ChatStorage();
    this.chat = new Chat(
      this.dom,
      this.messageRenderer,
      this.chatWindow,
      this.storage,
    );

    this.storage.clear(); // Clear only chat history on page refresh (keep email)
    this.setChatbotInfo();
    this.setupEventListeners();
    this.exportAPI();

    // Initialize chat (show welcome/email prompt) when chat is first opened
    this.initializeChat();

    // Auto-show tooltip after 2 seconds
    this.showTooltipAutomatically();

    // Start random tooltip intervals
    this.startRandomTooltips();

    // Dispatch ready event
    window.dispatchEvent(new CustomEvent("chatbotReady"));
    console.log("Chatbot initialized and ready");
  }

  showTooltipAutomatically() {
    if (!CONFIG.TOOLTIP_ENABLED) return;

    const tooltip = document.querySelector(".tooltip-text");
    if (tooltip && !this.chatWindow.getIsOpen()) {
      const messages = this.getRandomTooltipMessages();
      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)];
      tooltip.textContent = randomMessage;
      this.lastTooltipChange = Date.now();

      setTimeout(() => {
        if (!this.chatWindow.getIsOpen()) {
          tooltip.classList.add("show-auto");
          setTimeout(() => {
            tooltip.classList.remove("show-auto");
          }, CONFIG.TOOLTIP_DISPLAY_DURATION);
        }
      }, 1500);
    }
  }

  getRandomTooltipMessages() {
    return CONFIG.TOOLTIP_MESSAGES;
  }

  startRandomTooltips() {
    if (!CONFIG.TOOLTIP_ENABLED) return;

    const showRandomTooltip = () => {
      if (!this.chatWindow.getIsOpen()) {
        this.showTooltipAutomatically();
      }

      // Schedule next tooltip between min and max interval
      const range =
        CONFIG.TOOLTIP_RANDOM_MAX_INTERVAL - CONFIG.TOOLTIP_RANDOM_MIN_INTERVAL;
      const nextInterval =
        CONFIG.TOOLTIP_RANDOM_MIN_INTERVAL + Math.random() * range;
      setTimeout(showRandomTooltip, nextInterval);
    };

    // Start the cycle after minimum interval
    setTimeout(showRandomTooltip, CONFIG.TOOLTIP_RANDOM_MIN_INTERVAL);
  }

  setChatbotInfo() {
    const chatbotNameEl = document.getElementById("chatbotName");
    const chatbotStatusEl = document.getElementById("chatbotStatus");

    if (chatbotNameEl) {
      chatbotNameEl.textContent = CONFIG.CHATBOT_NAME;
    }

    if (chatbotStatusEl) {
      chatbotStatusEl.textContent = `${CONFIG.CHATBOT_SUBTITLE} • Online`;
    }
  }

  initializeChat() {
    // Track if chat has been initialized
    this.chatInitialized = false;

    // Initialize chat when window is opened for the first time
    const originalOpen = this.chatWindow.open.bind(this.chatWindow);
    this.chatWindow.open = () => {
      originalOpen();
      if (!this.chatInitialized) {
        this.chat.initialize();
        this.chatInitialized = true;
      }
    };
  }

  setupEventListeners() {
    this.dom.toggle.addEventListener("click", () => {
      this.chatWindow.toggle();
    });

    this.dom.closeBtn.addEventListener("click", () => {
      this.chatWindow.close();
    });

    this.dom.sendBtn.addEventListener("click", () => {
      const message = this.dom.input.value.trim();
      this.chat.sendMessage(message);
    });

    this.dom.input.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const message = this.dom.input.value.trim();
        this.chat.sendMessage(message);
      }
    });

    // Close chat when clicking outside
    document.addEventListener("click", (e) => {
      const chatContainer = document.getElementById("chatbotContainer");
      if (
        this.chatWindow.getIsOpen() &&
        chatContainer &&
        !chatContainer.contains(e.target)
      ) {
        this.chatWindow.close();
      }
    });

    // Change tooltip message on hover
    if (CONFIG.TOOLTIP_ENABLED && CONFIG.TOOLTIP_SHOW_ON_HOVER) {
      const tooltip = document.querySelector(".tooltip-text");
      if (tooltip) {
        this.dom.toggle.addEventListener("mouseenter", () => {
          if (!this.chatWindow.getIsOpen()) {
            const now = Date.now();
            // Only change message if 5 seconds have passed
            if (now - this.lastTooltipChange > 5000) {
              const messages = this.getRandomTooltipMessages();
              const randomMessage =
                messages[Math.floor(Math.random() * messages.length)];
              tooltip.textContent = randomMessage;
              this.lastTooltipChange = now;
            }
          }
        });
      }
    }
  }

  exportAPI() {
    window.ChatbotAPI = {
      sendMessage: (message) => this.chat.sendMessage(message),
      openChat: () => this.chatWindow.open(),
      closeChat: () => this.chatWindow.close(),
      toggleChat: () => this.chatWindow.toggle(),
      setUserEmail: (email) => this.setUserEmail(email),
      getUserEmail: () => this.getUserEmail(),
      clearEmail: () => this.storage.clearEmail(),
      clearAll: () => this.storage.clearAll(),
      isOpen: () => this.chatWindow.getIsOpen(),
    };
  }

  /**
   * Helper function to set user email from parent application
   * @param {string} email - User's email address
   * @returns {boolean} - True if email was saved successfully
   */
  setUserEmail(email) {
    if (!email || typeof email !== "string") {
      console.error("Invalid email provided");
      return false;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      console.error("Email cannot be empty");
      return false;
    }

    try {
      localStorage.setItem(CONFIG.EMAIL_STORAGE_KEY, trimmedEmail);
      console.log(`✅ User email set: ${trimmedEmail}`);
      return true;
    } catch (e) {
      console.error("Failed to save user email:", e);
      return false;
    }
  }

  /**
   * Get current user email from localStorage
   * @returns {string|null} - User's email or null if not set
   */
  getUserEmail() {
    try {
      return localStorage.getItem(CONFIG.EMAIL_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to get user email:", e);
      return null;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    const app = new ChatbotApp();
    app.init();
  });
} else {
  const app = new ChatbotApp();
  app.init();
}
