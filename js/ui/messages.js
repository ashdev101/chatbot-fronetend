import { getCurrentTime } from "../utils/time.js";

export class MessageRenderer {
  constructor(dom) {
    this.dom = dom;
  }

  _createMessageElement(content, isUser, time = null) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${isUser ? "user-message" : "bot-message"}`;

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";

    const messageText = document.createElement("p");
    messageText.textContent = content;
    messageContent.appendChild(messageText);

    const messageTime = document.createElement("span");
    messageTime.className = "message-time";
    messageTime.textContent = time || getCurrentTime();

    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(messageTime);

    return messageDiv;
  }

  addMessage(content, isUser = false) {
    if (isUser) {
      this.removeWelcomeMessage();
    }

    const messageDiv = this._createMessageElement(content, isUser);
    this.dom.messages.appendChild(messageDiv);
    this.scrollToBottom();

    return messageDiv;
  }

  removeWelcomeMessage() {
    const welcomeMessage = this.dom.messages.querySelector(".welcome-message");
    if (welcomeMessage) {
      welcomeMessage.remove();
    }
  }

  restoreMessages(messages) {
    if (!Array.isArray(messages) || messages.length === 0) return;

    this.removeWelcomeMessage();

    messages.forEach((msg) => {
      const messageDiv = this._createMessageElement(
        msg.content,
        msg.isUser,
        msg.time
      );
      this.dom.messages.appendChild(messageDiv);
    });

    this.scrollToBottom();
  }

  showTypingIndicator() {
    if (this.dom.typingIndicator) {
      this.dom.typingIndicator.style.display = "block";
      this.scrollToBottom();
    }
  }

  hideTypingIndicator() {
    if (this.dom.typingIndicator) {
      this.dom.typingIndicator.style.display = "none";
    }
  }

  scrollToBottom() {
    if (this.dom.messages) {
      this.dom.messages.scrollTop = this.dom.messages.scrollHeight;
    }
  }
}
