export class ChatWindow {
  constructor(dom) {
    this.dom = dom;
    this.isOpen = false;
  }

  open() {
    this.isOpen = true;
    this.dom.window.classList.add("active");
    this.dom.input.focus();
    this.hideNotification();
    
    // Dispatch event for parent application
    window.dispatchEvent(new CustomEvent('chatbotOpened'));
  }

  close() {
    this.isOpen = false;
    this.dom.window.classList.remove("active");
    
    // Dispatch event for parent application
    window.dispatchEvent(new CustomEvent('chatbotClosed'));
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  showNotification() {
    if (this.dom.notificationBadge) {
      this.dom.notificationBadge.style.display = "flex";
    }
  }

  hideNotification() {
    if (this.dom.notificationBadge) {
      this.dom.notificationBadge.style.display = "none";
    }
  }

  getIsOpen() {
    return this.isOpen;
  }
}
