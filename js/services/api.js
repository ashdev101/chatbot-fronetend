import { CONFIG } from "../config/config.js";

/**
 * Get user email from localStorage
 */
export function getUserEmail() {
  try {
    return "ashish.upadhyay@tataplay.com"
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
  console.log("coookies",document.cookie);
  return document.cookie
    .split("; ")
    .find(row => row.startsWith(name + "="))
    ?.split("=")[1];
}


let initDone = false;

async function initSecurityContext() {
  if (initDone) return;

  await fetch(`${CONFIG.API_ENDPOINT}/api/init`, {
    method: "GET",
    credentials: "include"
  });

  initDone = true;
}


async function callLambdaAPI(email, query, responseType = "DOCUMENT") {
  try {
    // 1️⃣ Ensure security context exists
    await initSecurityContext();

    // 2️⃣ Read CSRF token
    const csrfToken = getCookie("csrf_token");
    if (!csrfToken) {
      throw new Error("Security validation failed. Please refresh the page.");
    }

    const response = await fetch(`${CONFIG.API_ENDPOINT}/api/secure-query`, {
      method: "POST",
      mode: "cors",
      credentials: "include", // 🔑 REQUIRED
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-CSRF-Token": csrfToken // 🔐 REQUIRED
      },
      body: JSON.stringify({
        email,
        query,
        response_type: responseType,
      }),
    });

    // --- Existing UX-safe error handling ---
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);

      if (response.status === 403) {
        throw new Error("Your session is not authorized. Please refresh the page.");
      } else if (response.status === 400) {
        throw new Error("Invalid request. Please try again.");
      } else if (response.status === 500) {
        throw new Error("Server error. Please try again later.");
      }

      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "error") {
      throw new Error(data.message || "An error occurred");
    }

    if (data.status === "denied") {
      throw new Error("Access denied.");
    }

    if (data.body) {
      try {
        const bodyData =
          typeof data.body === "string" ? JSON.parse(data.body) : data.body;

        if (bodyData.status === "error") {
          throw new Error(bodyData.message || "An error occurred");
        }

        return (
          bodyData.response ||
          bodyData.message ||
          bodyData.answer ||
          "I received your query but couldn't generate a response."
        );
      } catch {
        return data.body;
      }
    }

    return (
      data.response ||
      data.message ||
      data.answer ||
      data.text ||
      "I received your query but couldn't generate a response."
    );
  } catch (error) {
    console.error("Lambda API call failed:", error);

    if (error.message.includes("Failed to fetch")) {
      throw new Error(
        "Unable to connect to the server. Please check your connection."
      );
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
