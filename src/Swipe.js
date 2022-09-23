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
    this.element.addEventListener("touchend", (e) => this.onTouchEnd(e), false);
    this.element.addEventListener(
      "mousedown",
      (e) => this.onMouseDown(e),
      false
    );
    this.element.addEventListener(
      "mousemove",
      (e) => this.onMouseMove(e),
      false
    );
    this.element.addEventListener("mouseup", (e) => this.onMouseUp(e), false);
    this.pointerDown = { x: 0, y: 0 };
    this.isPointerDown = false;
  }
  addEventListener(type, callback) {
    this.events.addEventListener(type, callback);
  }
  removeEventListener(type, callback) {
    this.events.removeEventListener(type, callback);
  }
  handlePointerStart(coords) {
    this.pointerDown = coords;
    this.isPointerDown = true;
    this.events.trigger("pointerdown", coords);
  }
  handlePointerMove(coords) {
    if (!this.isPointerDown) {
      return;
    }
    const pointerUp = coords;
    const dx = this.pointerDown.x - pointerUp.x;
    const dy = this.pointerDown.y - pointerUp.y;
    this.events.trigger("pointermove", { ...coords, dx, dy });
  }
  handlePointerUp(coords) {
    if (!this.isPointerDown) {
      return;
    }

    const pointerUp = coords;
    const dx = this.pointerDown.x - pointerUp.x;
    const dy = this.pointerDown.y - pointerUp.y;
    this.events.trigger("pointerup", { ...coords, dx, dy });
    const d = Math.sqrt(dx * dx + dy * dy);
    const unit = {
      x: d ? dx / d : 0,
      y: d ? dy / d : 0,
    };
    if (Math.abs(unit.x) !== 0) {
      if (unit.x > 0.8) {
        this.events.trigger("swipeLeft", unit.x);
      } else if (unit.x < -0.8) {
        this.events.trigger("swipeRight", unit.x);
      }
    }
    if (Math.abs(unit.y) !== 0) {
      if (unit.y > 0.8) {
        this.events.trigger("swipeUp", unit.y);
      } else if (unit.y < -0.8) {
        this.events.trigger("swipeDown", unit.y);
      }
    }
    this.isPointerDown = false;
  }
  onTouchStart(e) {
    this.handlePointerStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  }
  onTouchMove(e) {
    this.handlePointerMove({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  }
  onTouchEnd(e) {
    this.handlePointerUp({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  }
  onMouseDown(e) {
    this.handlePointerStart({
      x: e.clientX,
      y: e.clientY,
    });
  }
  onMouseMove(e) {
    this.handlePointerMove({
      x: e.clientX,
      y: e.clientY,
    });
  }
  onMouseUp(e) {
    this.handlePointerUp({
      x: e.clientX,
      y: e.clientY,
    });
  }
}

export default Swipe;
