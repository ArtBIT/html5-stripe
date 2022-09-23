// Minimalist event system
class Events {
  constructor() {
    this.listeners = {};
  }
  addEventListener(eventName, eventCallback) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push(eventCallback);
  }
  removeEventListener(eventName, eventCallback) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName] = this.listeners[eventName].filter(
      (callback) => callback !== eventCallback
    );
  }
  trigger(type, data) {
    this.listeners[type] &&
      this.listeners[type].forEach((callback) => callback({ type, data }));
  }
}

export default Events;
