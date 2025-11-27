export class Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX = 0;
  targetY = 0;
  fixed = false;
  active = true;
  radius: number;

  constructor(x: number, y: number, vx: number, vy: number, radius: number) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.reset();
  }

  reset() {
    // Use viewport dimensions for positioning instead of canvas internal dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    this.x = Math.random() * viewportWidth;
    this.y = Math.random() * viewportHeight;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.targetX = this.x;
    this.targetY = this.y;
    this.fixed = false;
    this.active = true;
  }

  update() {
    if (!this.active) {return;}
    if (this.fixed) {
      this.x += (this.targetX - this.x) * 0.05;
      this.y += (this.targetY - this.y) * 0.05;
    } else {
      this.x += this.vx;
      this.y += this.vy;

      // Use viewport dimensions instead of canvas internal dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (this.x > viewportWidth || this.x < 0) {this.vx *= -1;}
      if (this.y > viewportHeight || this.y < 0) {this.vy *= -1;}
      
      // Keep node within visible area
      this.x = Math.max(0, Math.min(viewportWidth, this.x));
      this.y = Math.max(0, Math.min(viewportHeight, this.y));
    }
  }

  draw(ctx: CanvasRenderingContext2D, hue: number, getColor: (h: number) => string) {
    if (!this.active) {return;}

    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 3);
    gradient.addColorStop(0, getColor(hue));
    gradient.addColorStop(1, "transparent");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}