import { CONFIG } from "../config/config.js";
import { getBotResponse, getConversationHistory } from "../services/api.js";

export class Chat {
  constructor(dom, messageRenderer, chatWindow, storage) {
    this.dom = dom;
    this.messageRenderer = messageRenderer;
    this.chatWindow = chatWindow;
    this.storage = storage;
    this.isTyping = false;
  }

  initialize() {
    const welcomeMessage = "Hey there! 👋 I'm Stella, your smart assistant. How can I help you today?";
    this.messageRenderer.addMessage(welcomeMessage, false);
  }

  _validateMessage(message) {
    if (!message || typeof message !== "string") return false;
    if (message.length < CONFIG.MIN_MESSAGE_LENGTH) return false;
    if (message.length > CONFIG.MAX_MESSAGE_LENGTH) return false;
    return true;
  }

  async sendMessage(message) {
    if (!this._validateMessage(message) || this.isTyping) return;

    this.messageRenderer.addMessage(message, true);
    this.dom.input.value = "";

    this.isTyping = true;
    this.dom.input.disabled = true;
    this.dom.sendBtn.disabled = true;

    this.messageRenderer.showTypingIndicator();

    try {
      const conversationHistory = getConversationHistory(this.dom.messages);
      const response = await getBotResponse(message, conversationHistory);

      this.messageRenderer.hideTypingIndicator();
      this.messageRenderer.addMessage(response, false);
    } catch (error) {
      console.error("Error getting bot response:", error);
      console.error("Error details:", { status: error.status, message: error.message, name: error.name });
      this.messageRenderer.hideTypingIndicator();

      let errorMessage = "Sorry, I'm having trouble connecting. Please try again.";
      
      if (error.status === 502) {
        errorMessage = "⚠️ **Bad Gateway**\n\nThe server received an invalid response from an upstream server. This usually means:\n- The backend service is temporarily unavailable\n- There's an issue with the server infrastructure\n\nPlease try again in a few moments.";
      } else if (error.status === 503) {
        errorMessage = "⚠️ **Service Unavailable**\n\nThe server is temporarily unavailable, possibly due to maintenance or overload.\n\nPlease try again later.";
      } else if (error.status === 504) {
        errorMessage = "⚠️ **Gateway Timeout**\n\nThe server did not receive a timely response from an upstream server.\n\nPlease try again.";
      } else if (error.message && error.message.includes("CORS_ERROR")) {
        errorMessage = "⚠️ **Connection Error**\n\nThe API server is not configured to allow requests from this origin. This is a CORS (Cross-Origin Resource Sharing) issue.\n\n**What needs to be fixed:**\n- The backend API needs to include CORS headers\n- Add `Access-Control-Allow-Origin: http://localhost:3000` (or `*` for all origins)\n- Include `Access-Control-Allow-Methods: GET, POST, OPTIONS`\n- Include `Access-Control-Allow-Headers: Content-Type, X-CSRF-Token`\n- Handle OPTIONS preflight requests";
      } else if (error.message && error.message.includes("Security context")) {
        errorMessage = "⚠️ **Initialization Error**\n\nFailed to initialize security context. Please check your API configuration.";
      } else if (error.message && (error.message.includes("timed out") || error.message.includes("timeout"))) {
        errorMessage = "⏱️ **Request Timeout**\n\nThe request took longer than expected to complete. This might be due to:\n- A complex query that requires extensive processing\n- Server processing time\n- Network connectivity issues\n\n**Please try:**\n- Waiting a bit longer (the server may still be processing)\n- Simplifying your query\n- Breaking it into smaller questions\n- Trying again later";
      } else if (error.status === 500) {
        const serverError = error.message || "An internal server error occurred.";
        errorMessage = `⚠️ **Server Error**\n\nThe server encountered an error while processing your request.\n\n**Error:** ${serverError}\n\nPlease try again later or contact support if the issue persists.`;
      } else if (error.status === 400) {
        const badRequestError = error.message || "Invalid request.";
        errorMessage = `⚠️ **Invalid Request**\n\n${badRequestError}\n\nPlease check your input and try again.`;
      } else if (error.status === 401) {
        errorMessage = "⚠️ **Authentication Error**\n\nYou are not authorized to make this request. Please check your credentials.";
      } else if (error.status === 403) {
        errorMessage = "⚠️ **Access Forbidden**\n\nYou don't have permission to perform this action.";
      } else if (error.status === 404) {
        errorMessage = "⚠️ **Not Found**\n\nThe requested resource was not found. Please check the API endpoint.";
      } else if (error.status === 429) {
        errorMessage = "⏱️ **Rate Limit Exceeded**\n\nToo many requests. Please wait a moment and try again.";
      } else if (error.status && error.status >= 400) {
        const statusError = error.message || `HTTP ${error.status} error occurred.`;
        errorMessage = `⚠️ **Error ${error.status}**\n\n${statusError}\n\nPlease try again later.`;
      }
      
      this.messageRenderer.addMessage(errorMessage, false);
    }

    this.isTyping = false;
    this.dom.input.disabled = false;
    this.dom.sendBtn.disabled = false;
    this.dom.input.focus();

    if (!this.chatWindow.getIsOpen()) {
      this.chatWindow.showNotification();
    }
  }
}
