import { CONFIG } from "../config/config.js";

/**
 * Get user email from localStorage
 */
export function getUserEmail() {
  try {
    return "Shayanta.Chaudhuri@tataplay.com";
    // return localStorage.getItem(CONFIG.EMAIL_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to get user email:", e);
    return null;
  }
}

/**
 * Save user email to localStorage
 */
export function saveUserEmail(email) {
  try {
    localStorage.setItem(CONFIG.EMAIL_STORAGE_KEY, email);
    return true;
  } catch (e) {
    console.error("Failed to save user email:", e);
    return false;
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Mock API responses for testing
 */
const MOCK_RESPONSES = {
  greeting: [
    "Hello! I'm Stella, your AI assistant. How can I help you today?",
    "Hi there! I'm here to assist you with any questions you might have.",
    "Welcome! I'm Stella. What would you like to know?",
  ],
  help: [
    "I can help you with various tasks like answering questions, providing information, and assisting with your queries. What would you like to know?",
    "I'm here to assist you! Feel free to ask me anything, and I'll do my best to help.",
  ],
  default: [
    "That's an interesting question! Based on the information available, I can provide you with some insights. Would you like me to elaborate further?",
    "I understand your query. Let me help you with that. The key points to consider are the context and specifics of your situation.",
    "Great question! Here's what I know about that topic. The important thing to remember is that every situation is unique and may require different approaches.",
    "I appreciate you asking. Based on common practices and guidelines, here's what I can tell you about this subject.",
    "Thank you for your question. I'd be happy to help you understand this better. Let me provide some relevant information.",
  ],
  tata: [
    "Tata Play is one of India's leading direct-to-home (DTH) service providers, offering a wide range of entertainment channels and services.",
    "Tata Play provides high-quality digital entertainment with hundreds of channels, HD options, and various subscription plans to suit different needs.",
    "As a Tata Play customer, you can enjoy premium content, sports, movies, and much more. Is there something specific about Tata Play services you'd like to know?",
  ],
  channels: [
    "Tata Play offers a wide variety of channels including entertainment, sports, news, movies, kids channels, and regional content. You can customize your plan based on your preferences.",
    "Our channel lineup includes popular networks across different genres. You can choose from various packs or create your own custom channel selection.",
  ],
  plan: [
    "Tata Play offers flexible plans starting from basic packages to premium ones. You can choose monthly or yearly subscriptions based on your viewing preferences.",
    "We have different subscription plans including SD, HD, and 4K options. Each plan can be customized with add-on packs for sports, movies, or regional content.",
  ],
};

/**
 * Generate mock API response with simulated delay
 */
async function callMockAPI(email, query) {
  // Simulate network delay
  await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * 1000 + 500)
  );

  const queryLower = query.toLowerCase();
  let responses;

  // Match query to appropriate response category
  if (queryLower.match(/hello|hi|hey|greet/)) {
    responses = MOCK_RESPONSES.greeting;
  } else if (queryLower.match(/help|assist|support/)) {
    responses = MOCK_RESPONSES.help;
  } else if (queryLower.match(/tata play|tata|dth/)) {
    responses = MOCK_RESPONSES.tata;
  } else if (queryLower.match(/channel|tv|watch/)) {
    responses = MOCK_RESPONSES.channels;
  } else if (queryLower.match(/plan|subscription|package|price/)) {
    responses = MOCK_RESPONSES.plan;
  } else {
    responses = MOCK_RESPONSES.default;
  }

  // Return random response from selected category
  const response = responses[Math.floor(Math.random() * responses.length)];

  console.log(`[MOCK API] Query: "${query}" | Response: "${response}"`);

  return response;
}

/**
 * Call AWS Lambda API
 */

function getCookie(name) {
  const cookies = document.cookie ? document.cookie.split("; ") : [];

  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split("=");
    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

let initPromise = null;
let csrfToken = null;

async function initSecurityContext() {
  if (csrfToken) return;

  if (!initPromise) {
    initPromise = (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      try {
        const response = await fetch(`${CONFIG.API_ENDPOINT}/api/init`, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Init failed: ${response.status}`);
        }

        const data = await response.json();

        if (!data || typeof data.token !== "string") {
          throw new Error("Invalid CSRF init response");
        }

        csrfToken = data.token;
      } finally {
        clearTimeout(timeout);
        initPromise = null;
      }
    })();
  }

  return initPromise;
}

async function callLambdaAPI(email, query, retry = true) {
  try {
    await initSecurityContext();

    if (!csrfToken) {
      throw new Error("Security context not initialized");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000); // 2 minutes

    const response = await fetch(`${CONFIG.API_ENDPOINT}/api/secure-query`, {
      method: "POST",
      credentials: "include",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*", // IMPORTANT: allow file responses
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({
        email,
        text: query,
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const text = await response.text();

      // 🔐 Retry ONLY once and ONLY for CSRF failures
      if (response.status === 403 && retry && text.includes("CSRF")) {
        csrfToken = null;
        return callLambdaAPI(email, query, false);
      }

      throw new Error(`API error ${response.status}: ${text}`);
    }

    // 🔍 Detect response type
    const contentType = response.headers.get("content-type") || "";

    // ===============================
    // 📄 FILE RESPONSE
    // ===============================
    if (!contentType.includes("application/json")) {
      const blob = await response.blob();

      // Try to extract filename
      let filename = "download";
      const disposition = response.headers.get("content-disposition");

      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);

      return "File downloaded successfully";
    }

    // ===============================
    // 📝 TEXT RESPONSE
    // ===============================
    const data = await response.json();

    return data.final_output || data.response || data.message || "No response";
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw error;
  }
}

/**
 * Get bot response - main entry point
 */
export async function getBotResponse(message, conversationHistory = []) {
  const email = getUserEmail();

  if (!email) {
    throw new Error("Email not found. Please provide your email address.");
  }

  // Use mock API or real API based on config
  if (CONFIG.USE_MOCK_API) {
    return await callMockAPI(email, message);
  } else {
    return await callLambdaAPI(email, message);
  }
}

// Excludes the last user message as it's sent separately
export function getConversationHistory(messagesContainer) {
  const messageElements = Array.from(
    messagesContainer.querySelectorAll(
      ".message:not(.welcome-message .message)"
    )
  );

  // Find and remove last user message from array
  const lastUserIndex = messageElements.findLastIndex((msg) =>
    msg.classList.contains("user-message")
  );
  const elementsToProcess =
    lastUserIndex >= 0
      ? messageElements.slice(0, lastUserIndex)
      : messageElements;

  return elementsToProcess
    .map((msg) => {
      const content =
        msg.querySelector(".message-content p")?.textContent || "";
      if (!content) return null;

      return {
        role: msg.classList.contains("user-message") ? "user" : "assistant",
        content: content,
        timestamp: msg.querySelector(".message-time")?.textContent || "",
      };
    })
    .filter((msg) => msg !== null);
}
