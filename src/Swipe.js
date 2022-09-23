import EventListener from "./EventListener";
// Simple Swipe helper

class Swipe {
  constructor(element) {
    this.element =
      typeof element === "string" ? document.querySelector(element) : element;
    this.events = new EventListener();
    this.element.addEventListener(
      "touchstart",
      (e) => this.onTouchStart(e),
      false
    );
    this.element.addEventListener(
      "touchmove",
      (e) => this.onTouchMove(e),
      false
    );
    this.touchDown = { x: 0, y: 0 };
    this.isPressed = false;
  }
  addEventListener(type, callback) {
    this.events.addEventListener(type, callback);
  }
  removeEventListener(type, callback) {
    this.events.removeEventListener(type, callback);
  }
  onTouchStart(e) {
    this.touchDown = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    this.isPressed = true;
  }
  onTouchMove(e) {
    if (!this.isPressed) {
      return;
    }
    const touchUp = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    const diff = {
      x: this.touchDown.x - touchUp.x,
      y: this.touchDown.y - touchUp.y,
    };
    if (Math.abs(diff.x) !== 0) {
      if (diff.x > 2) {
        this.events.trigger("swipeLeft", diff.x);
      } else if (diff.x < -2) {
        this.events.trigger("swipeRight", diff.x);
      }
    }
    if (Math.abs(diff.y) !== 0) {
      if (diff.y > 2) {
        this.events.trigger("swipeUp", diff.y);
      } else if (diff.y < -2) {
        this.events.trigger("swipeDown", diff.y);
      }
    }
    this.isPressed = false;
  }
}

export default Swipe;
