export class DOM {
  constructor() {
    this.container = document.getElementById("chatbotContainer");
    this.toggle = document.getElementById("chatbotToggle");
    this.window = document.getElementById("chatbotWindow");
    this.messages = document.getElementById("chatbotMessages");
    this.input = document.getElementById("chatInput");
    this.sendBtn = document.getElementById("sendBtn");
    this.closeBtn = document.getElementById("closeChat");
    this.typingIndicator = document.getElementById("typingIndicator");
    this.notificationBadge = document.getElementById("notificationBadge");
  }

  validate() {
    const required = [
      this.container,
      this.toggle,
      this.window,
      this.messages,
      this.input,
      this.sendBtn,
      this.closeBtn,
      this.typingIndicator,
      this.notificationBadge,
    ];

    return required.every((el) => el !== null);
  }
}
