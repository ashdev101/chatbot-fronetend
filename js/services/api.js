import { CONFIG } from "../config/config.js";

export function getUserEmail() {
  try {
    return "Shayanta.Chaudhuri@tataplay.com";
  } catch (e) {
    console.error("Failed to get user email:", e);
    return null;
  }
}

export function saveUserEmail(email) {
  try {
    localStorage.setItem(CONFIG.EMAIL_STORAGE_KEY, email);
    return true;
  } catch (e) {
    console.error("Failed to save user email:", e);
    return false;
  }
}

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

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

async function callMockAPI(email, query) {
  await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * 1000 + 500)
  );

  const queryLower = query.toLowerCase();
  let responses;

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

  const response = responses[Math.floor(Math.random() * responses.length)];

  console.log(`[MOCK API] Query: "${query}" | Response: "${response}"`);

  return response;
}

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

async function initSecurityContext(force = false) {
  if (!force && csrfToken) return;

  if (!initPromise) {
    initPromise = (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30_000);

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
      } catch (error) {
        if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
          throw new Error("CORS_ERROR: The API server is not allowing requests from this origin. Please configure CORS headers on the backend API.");
        }
        throw error;
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
    const timeout = setTimeout(() => controller.abort(), 1_800_000); // 30 minutes

    const response = await fetch(`${CONFIG.API_ENDPOINT}/api/secure-query`, {
      method: "POST",
      credentials: "include",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({
        email,
        text: query,
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      let errorMessage = `Server error (${response.status})`;
      
      try {
        const contentType = response.headers.get("content-type") || "";
        const text = await response.text().catch(() => "");
        
        if (text && text.trim()) {
          if (contentType.includes("application/json")) {
            try {
              const errorData = JSON.parse(text);
              errorMessage = errorData.message || errorData.error || errorData.detail || errorData.errorMessage || errorMessage;
            } catch {
              errorMessage = text.length > 200 ? text.substring(0, 200) + "..." : text;
            }
          } else {
            try {
              const parsed = JSON.parse(text);
              errorMessage = parsed.message || parsed.error || parsed.detail || parsed.errorMessage || text;
            } catch {
              errorMessage = text.length > 200 ? text.substring(0, 200) + "..." : text;
            }
          }
        }
      } catch (e) {
        console.error("Error parsing error response:", e);
      }

      if (response.status === 403 && retry) {
        csrfToken = null;
        await initSecurityContext(true);
        return callLambdaAPI(email, query, false);
      }

      const error = new Error(`API_ERROR_${response.status}: ${errorMessage}`);
      error.status = response.status;
      error.message = errorMessage;
      throw error;
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const blob = await response.blob();

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

    const data = await response.json();

    return data.final_output || data.response || data.message || "No response";
  } catch (error) {
    if (error.status) {
      throw error;
    }
    
    if (error.name === "AbortError") {
      const timeoutError = new Error("Request timed out after 30 minutes. The server may still be processing your request. Please try again or contact support.");
      timeoutError.status = 0;
      throw timeoutError;
    }
    
    if (error.message.includes("CORS_ERROR") || error.message.includes("Security context")) {
      throw error;
    }
    
    if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
      if (error.message.includes("timeout") || error.message.includes("network")) {
        const networkError = new Error("Network timeout: The request took too long. This might be due to a slow connection or server processing time. Please try again.");
        networkError.status = 0;
        throw networkError;
      }
      const corsError = new Error("CORS_ERROR: The API server is blocking requests due to CORS policy. The backend needs to include 'Access-Control-Allow-Origin' header.");
      corsError.status = 0;
      throw corsError;
    }
    
    throw error;
  }
}

export async function getBotResponse(message, conversationHistory = []) {
  const email = getUserEmail();

  if (!email) {
    throw new Error("Email not found. Please provide your email address.");
  }

  if (CONFIG.USE_MOCK_API) {
    return await callMockAPI(email, message);
  } else {
    return await callLambdaAPI(email, message);
  }
}

export function getConversationHistory(messagesContainer) {
  const messageElements = Array.from(
    messagesContainer.querySelectorAll(
      ".message:not(.welcome-message .message)"
    )
  );

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
