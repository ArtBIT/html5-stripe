import Stripe from "./Stripe";
import Swipe from "./Swipe";

export default class App {
  constructor(selector) {
    this.canvas = document.querySelector(selector);
    this.swiper = new Swipe(this.canvas);
    this.stripe = new Stripe({
      canvas: this.canvas,
      stripeWidth: 80,
      stripePadding: 130,
      screenPadding: 40,
      randomizePositionX: 0.4,
      randomizePositionY: 0,
      tint: "random",
      tintAmount: 0.3,
      background: "random",
      stiffness: 0.05,
    });

    this.isRunning = false;
    this.scrollOffset = 0;
    this.bindEvents();
  }
  scroll(amount) {
    this.scrollOffset += amount;
    this.stripe.scroll(amount - 0.02);
  }
  bindEvents() {
    const onSwipe = (amount) => this.scroll(amount);
    this.swiper.addEventListener("swipeUp", onSwipe);
    this.swiper.addEventListener("swipeDown", onSwipe);

    const onWheel = (event) => {
      const wheel = event.deltaY * -0.05;
      this.scroll(wheel);
    };
    let scrollY = window.scrollY;
    const onScroll = (event) => {
      const amount = (window.scrollY - scrollY) * -0.05;
      scrollY = window.scrollY;
      this.scroll(amount);
    };
    window.addEventListener("wheel", onWheel);
    window.addEventListener("scroll", onScroll);
  }
  update() {
    if (!this.isRunning) {
      return;
    }
    console.log("tick");
    this.stripe.update();
    requestAnimationFrame(() => this.update());
  }
  start() {
    this.isRunning = true;
    this.update();
  }
  stop() {
    this.isRunning = false;
  }
}
