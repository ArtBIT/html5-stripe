import Vector2 from "./Vector2";
import ParticleSystem from "./ParticleSystem";
import { mix, rgba, rgba2hsla, hsla2rgba } from "./colors";

class StripeCanvas {
  constructor({
    canvas,
    stripeWidth = 30,
    friction = 0.965,
    stiffness = 0.1,
    tint = "random",
    background = "transparent",
    tintAmount = 0.5,
    randomizePositionX = 0.1,
    randomizePositionY = 0.3,
    stripePadding = 100,
    screenPadding = 50
  }) {
    this.tint = tint;
    this.tintAmount = tintAmount;
    this.background = background;
    this.bgPrimary = "#888";
    this.bgSecondary = "#444";
    this.fgPrimary = "#DDD";
    this.fgSecondary = "#999";
    this.canvas = canvas;
    this.flipColors = false;
    this.stripeWidth = stripeWidth;
    this.screenPadding = screenPadding;
    this.distanceY = stripeWidth + stripePadding;
    this.stiffness = stiffness;
    const amountOnScreen = this.canvas.height / this.distanceY;
    this.particles = new ParticleSystem({
      neighbourDistance: this.distanceY,
      stiffness: this.stiffness
    });
    this.amountOnScreen = Math.round(amountOnScreen / 2) * 2; // must be even
    this.randomizePositionX = randomizePositionX;
    this.randomizePositionY = randomizePositionY;
    this.friction = friction;
    this.initParticles();
    this.scrollOffset = 0;
  }
  initParticles() {
    new Array(this.amountOnScreen + 6).fill({}).map((value, index) =>
      this.particles.add({
        position: {
          x:
            this.screenPadding +
            (this.canvas.width - 2 * this.screenPadding) *
              (0.5 +
                (index % 2 === 0 ? -1 : 1) *
                  (0.5 - Math.random() * this.randomizePositionX)),
          y:
            this.distanceY *
            (index + (Math.random() - 0.5) * this.randomizePositionY)
        },
        friction: this.friction,
        mass: 1 + Math.random() * 0.5,
        data: { index }
      })
    );
  }
  update() {
    this.particles.update();
    const list = this.particles.particles;
    // WRAP
    if (list.length > 0) {
      const headPositionY = list.head.next?.data.position.y || 0;
      if (headPositionY < -2 * this.distanceY) {
        list.push(list.shift());

        const p1 = list.tail.data.position;
        const p2 = list.tail.prev?.data.position;
        if (p2) {
          p1.y = p2.y + this.distanceY;
        }
        this.particles.reattachSpringsTo(list.tail);
        this.flipColors = !this.flipColors;
      }
      const tailPositionY = list.tail.prev?.data.position.y || 0;
      if (tailPositionY > this.canvas.height + 2 * this.distanceY) {
        list.unshift(list.pop());

        const p1 = list.head.data.position;
        const p2 = list.head.next?.data.position;
        if (p2) {
          p1.y = p2.y - this.distanceY;
        }
        this.particles.reattachSpringsTo(list.head);
        this.flipColors = !this.flipColors;
      }
    }

    this.draw();
  }
  draw() {
    const ctx = this.canvas.getContext("2d");

    let tint = this.tint;
    if (tint === "random") {
      const hue = ((this.scrollOffset % 360) + 360) % 360;
      tint = `hsla(${hue},80%,80%,1)`;
    }

    const amount = this.tintAmount;
    const fg_secondary_tinted = rgba(mix(this.fgSecondary, tint, amount));
    const fg_primary_tinted = rgba(mix(this.fgPrimary, tint, amount));
    const bg_secondary_tinted = rgba(mix(this.bgSecondary, tint, amount));
    const bg_primary_tinted = rgba(mix(this.bgPrimary, tint, amount));
    const fg = ctx.createLinearGradient(0, 0, 1, this.canvas.width);
    fg.addColorStop(0, fg_secondary_tinted);
    fg.addColorStop(0.5, fg_primary_tinted);
    fg.addColorStop(1, fg_secondary_tinted);
    const bg = ctx.createLinearGradient(0, 0, 1, this.canvas.width);
    bg.addColorStop(0, bg_secondary_tinted);
    bg.addColorStop(0.5, bg_primary_tinted);
    bg.addColorStop(1, bg_secondary_tinted);

    if (this.background === "transparent") {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    } else {
      if (this.background === "random") {
        const hsla = rgba2hsla(fg_secondary_tinted);
        // invert the hue by rotating it 180 deg
        hsla[0] = (hsla[0] + 180) % 360;
        hsla[2] = 25;
        const stage_background =
          this.background === "random"
            ? rgba(hsla2rgba(hsla))
            : this.background;
        ctx.fillStyle = rgba(stage_background);
      } else {
        ctx.fillStyle = this.background;
      }
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    this.particles
      .map((p) => p.position)
      .map((pos, index, list, node) => {
        if (this.flipColors && index % 2 !== 0) {
          ctx.fillStyle = this.flipColors ? bg : fg;
          this.drawStripeSegment(node);
        }
        return pos;
      })
      .map((pos, index, list, node) => {
        if (index % 2 === 0) {
          ctx.fillStyle = this.flipColors ? fg : bg;
          this.drawStripeSegment(node);
        }
        return pos;
      })
      .map((pos, index, list, node) => {
        if (!this.flipColors && index % 2 !== 0) {
          ctx.fillStyle = this.flipColors ? bg : fg;
          this.drawStripeSegment(node);
        }
        return pos;
      });
  }
  drawStripeSegment(node) {
    const ctx = this.canvas.getContext("2d");
    const curr = node.data;
    const prev = node.prev?.data;
    const prevprev = node.prev?.prev?.data;

    if (prev) {
      const v = curr.minus(prev);
      const currentNormal = v.normal().scale(this.stripeWidth);

      const previousNormal = prev
        .minus(prevprev)
        .normal()
        .negate()
        .scale(this.stripeWidth);

      if (previousNormal) {
        ctx.beginPath();
        ctx.moveTo(prev.x - previousNormal.x, prev.y - previousNormal.y);
        ctx.lineTo(prev.x + previousNormal.x, prev.y + previousNormal.y);
        ctx.lineTo(curr.x + currentNormal.x, curr.y + currentNormal.y);
        ctx.lineTo(curr.x - currentNormal.x, curr.y - currentNormal.y);
        ctx.lineTo(prev.x - previousNormal.x, prev.y - previousNormal.y);
        ctx.closePath();

        ctx.save();
        ctx.translate(curr.x, curr.y);
        ctx.rotate(-currentNormal.angle());
        ctx.translate(v.x, v.y);
        ctx.fill();
        //ctx.stroke();
        ctx.restore();
      }
    }
  }
  scroll(amount) {
    this.particles.applyForce(new Vector2(0, amount));
    this.scrollOffset += amount;
  }
}

export default StripeCanvas;
