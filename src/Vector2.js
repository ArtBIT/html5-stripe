// Simple Vector2 implementation
//
class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.isDirty = true;
  }
  magnitude() {
    this.recalc();
    return this.length;
  }
  unit() {
    this.recalc();
    return new Vector2(this.ux, this.uy);
  }
  normalize() {
    this.recalc();
    this.set(this.ux, this.uy);
  }
  set(x, y) {
    /*
    this.x = x;
    this.y = y;
    this.isDirty = true;
    */
    return new Vector2(x, y);
  }
  // allow passing scalar (x), scalar pair (x,y), or a Vector2 object
  _getXY(s) {
    let x, y;
    if (s instanceof Vector2) {
      x = s.x;
      y = s.y;
    } else if (arguments.length === 2) {
      x = arguments[0];
      y = arguments[1];
    } else {
      x = s;
      y = s;
    }
    return { x, y };
  }
  plus(s) {
    const { x, y } = this._getXY.apply(this, arguments);
    return this.set(this.x + x, this.y + y);
  }
  wrap(min, max) {
    const { x: minX, y: minY } = this._getXY(min);
    const { x: maxX, y: maxY } = this._getXY(max);
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;

    const dx = (this.x - minX) / rangeX;
    const dy = (this.y - minY) / rangeY;

    const mx = dx - Math.floor(dx);
    const my = dy - Math.floor(dy);
    const wrappedX = mx < 0 ? 1 + mx : mx;
    const wrappedY = my < 0 ? 1 + my : my;

    return new Vector2(wrappedX * rangeX + minX, wrappedY * rangeY + minY);
  }
  minus(s) {
    const { x, y } = this._getXY.apply(this, arguments);
    return this.set(this.x - x, this.y - y);
  }
  scale(s) {
    const { x, y } = this._getXY.apply(this, arguments);
    return this.set(this.x * x, this.y * y);
  }
  negate() {
    return this.scale(-1);
  }
  distanceTo(v) {
    const { x, y } = this._getXY.apply(this, arguments);
    const dx = x - this.x;
    const dy = y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  dot(v) {
    return this.x * v.y + this.y * v.x;
  }
  normal() {
    this.recalc();
    return new Vector2(-this.uy, this.ux);
  }
  recalc() {
    if (this.isDirty) {
      this.lengthSquared = this.x * this.x + this.y * this.y;
      this.length = Math.sqrt(this.lengthSquared);
      this.ux = this.length ? this.x / this.length : 0;
      this.uy = this.length ? this.y / this.length : 0;
      this.isDirty = false;
    }
  }
  angle() {
    return Math.atan2(-this.y, this.x);
  }
}

export default Vector2;
