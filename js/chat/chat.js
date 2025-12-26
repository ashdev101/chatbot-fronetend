import { CONFIG } from "../config/config.js";
import { StreamResponse } from "./streaming.js";
import { getBotResponse, getConversationHistory } from "../services/api.js";

export class Chat {
  constructor(dom, messageRenderer, chatWindow, storage) {
    this.dom = dom;
    this.messageRenderer = messageRenderer;
    this.chatWindow = chatWindow;
    this.storage = storage;
    this.streamResponse = new StreamResponse(messageRenderer);
    this.isTyping = false;
  }

  /**
   * Initialize chat - show welcome message
   */
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

      const botMessageElement = this.messageRenderer.addMessage("", false);
      await this.streamResponse.stream(response, botMessageElement);
    } catch (error) {
      console.error("Error getting bot response:", error);
      this.messageRenderer.hideTypingIndicator();

      const errorMessage =
        "Sorry, I'm having trouble connecting. Please try again.";
      const botMessageElement = this.messageRenderer.addMessage("", false);
      await this.streamResponse.stream(errorMessage, botMessageElement);
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
