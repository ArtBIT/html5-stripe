import Vector2 from "./Vector2";
import LinkedList from "./LinkedList";
import { DEFAULT_FRICTION, DEFAULT_STIFFNESS } from "./constants";

export class Particle {
  constructor({
    system,
    position = { x: 0, y: 0 },
    velocity = { x: 0, y: 0 },
    friction = DEFAULT_FRICTION,
    mass = 1,
    data = {},
  }) {
    this.system = system;
    this.position = new Vector2(position.x, position.y);
    this.velocity = new Vector2(velocity.x, velocity.y);
    this.acceleration = new Vector2(0, 0);
    this.friction = friction;
    this.mass = mass;
    this.data = data;
    this.springs = [];
  }
  removeSprings() {
    this.springs.forEach((spring) => {
      spring.start.removeSpringTo(this);
      spring.end.removeSpringTo(this);
    });
    this.springs = [];
  }
  addSpringTo(particle, stiffness = DEFAULT_STIFFNESS) {
    if (this.hasSpringTo(particle)) {
      return;
    }
    this.springs.push(new Spring(this, particle, stiffness / 2));
    particle.springs.push(new Spring(particle, this, stiffness / 2));
  }
  hasSpringTo(particle) {
    return (
      this.springs.some(
        (spring) => spring.start === particle || spring.end === particle
      ) ||
      particle.springs.some(
        (spring) => spring.start === this || spring.end === this
      )
    );
  }
  removeSpringTo(particle) {
    if (particle === this) {
      return;
    }
    this.springs = this.springs.filter(
      (spring) => spring.start !== particle && spring.end !== particle
    );
    particle.springs = particle.springs.filter(
      (spring) => spring.start !== this && spring.end !== this
    );
  }
  update() {
    this.springs.forEach((spring) => spring.update());
    this.velocity = this.velocity.plus(this.acceleration);
    this.velocity = this.velocity.scale(this.friction);
    this.position = this.position.plus(this.velocity);
    this.acceleration = this.acceleration.scale(0);
  }
  applyForce(v) {
    this.acceleration = this.acceleration.plus(
      v.x / this.mass,
      v.y / this.mass
    );
  }
}

export class Spring {
  constructor(particleA, particleB, stiffness) {
    this.start = particleA;
    this.end = particleB;
    this.stiffness = stiffness;
    this.distanceConstraint = this.getCurrentLengthVector().magnitude();
  }
  getCurrentLengthVector() {
    return this.start.position.minus(this.end.position);
  }
  update() {
    const dv = this.getCurrentLengthVector();
    const dl = dv.magnitude();

    const dd = this.distanceConstraint - dl;

    const force = dv.unit().scale(dd * 0.00001, dd * this.stiffness);

    this.start.applyForce(force);
    this.end.applyForce(force.negate());
  }
}

export class ParticleSystem {
  constructor({
    neighbourDistance = 100,
    friction = DEFAULT_FRICTION,
    stiffness = DEFAULT_STIFFNESS,
  }) {
    this.neighbourDistance = neighbourDistance;
    this.friction = friction;
    this.stiffness = stiffness;
    this.particles = new LinkedList();
  }
  add(props) {
    this.particles.push(new Particle({ ...props, system: this }));
    this.reattachSpringsTo(this.particles.tail);
  }

  reattachSpringsTo(node) {
    node.data.removeSprings();
    const p = node;
    if (p.prev) {
      p.data.addSpringTo(p.prev.data, this.stiffness);
    }
    if (p.next) {
      p.data.addSpringTo(p.next.data, this.stiffness);
    }
    if (p.prev && p.next) {
      p.prev.data.addSpringTo(p.next.data, this.stiffness);
    }
  }
  applyForce(v) {
    this.particles.forEach((p) => p.applyForce(v));
  }
  update() {
    this.particles.forEach((p) => p.update());
  }
  each(cb) {
    this.particles.forEach((p) => cb(p));
  }
  map(cb) {
    return this.particles.map(cb);
  }
}

export default ParticleSystem;
