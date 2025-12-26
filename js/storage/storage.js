import { CONFIG } from "../config/config.js";

export class ChatStorage {
  constructor() {
    this.storageKey = CONFIG.STORAGE_KEY;
    this.emailKey = CONFIG.EMAIL_STORAGE_KEY;
  }

  save(messagesContainer) {
    const messages = [];
    const messageElements = messagesContainer.querySelectorAll(".message");

    messageElements.forEach((msg) => {
      const isUser = msg.classList.contains("user-message");
      const content =
        msg.querySelector(".message-content p")?.textContent || "";
      const time = msg.querySelector(".message-time")?.textContent || "";

      if (content) {
        messages.push({
          isUser,
          content,
          time,
        });
      }
    });

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save chat history:", e);
    }
  }

  load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) return [];

      const messages = JSON.parse(saved);
      return Array.isArray(messages) ? messages : [];
    } catch (e) {
      console.error("Failed to load chat history:", e);
      return [];
    }
  }

  clear() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      console.error("Failed to clear chat history:", e);
    }
  }

  clearEmail() {
    try {
      localStorage.removeItem(this.emailKey);
    } catch (e) {
      console.error("Failed to clear email:", e);
    }
  }

  clearAll() {
    this.clear();
    this.clearEmail();
  }
}
