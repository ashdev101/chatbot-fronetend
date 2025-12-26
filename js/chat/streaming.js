import { CONFIG } from "../config/config.js";

export class StreamResponse {
  constructor(messageRenderer) {
    this.messageRenderer = messageRenderer;
  }

  async stream(text, messageElement) {
    const messageContent = messageElement?.querySelector(".message-content p");
    if (!messageContent || !text) {
      console.error("Invalid streaming parameters");
      return;
    }

    try {
      messageContent.innerHTML = "";

      const words = text.split(" ");
      let currentText = "";

      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? " " : "") + words[i];
        messageContent.textContent = currentText;

        if (i < words.length - 1) {
          const cursor = document.createElement("span");
          cursor.className = "streaming-cursor";
          messageContent.appendChild(cursor);
        }

        this.messageRenderer.scrollToBottom();

        const delay =
          CONFIG.STREAMING_DELAY_MIN +
          Math.random() *
            (CONFIG.STREAMING_DELAY_MAX - CONFIG.STREAMING_DELAY_MIN);
        await new Promise((resolve) => setTimeout(resolve, delay));

        const cursor = messageContent.querySelector(".streaming-cursor");
        if (cursor) {
          cursor.remove();
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
      messageContent.textContent = text;
    }
  }
}
