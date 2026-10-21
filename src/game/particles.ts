/**
 * High-Performance Pooled Neon Particle System
 * Zero-allocation in main loop for smooth 60 FPS rendering.
 */

export interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  alpha: number;
  decay: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'smoke' | 'leaf' | 'wind' | 'clean' | 'glow';
  rotation: number;
  rotSpeed: number;
}

export class ParticlePool {
  private pool: Particle[] = [];
  private maxParticles: number = 600;

  constructor(size: number = 600) {
    this.maxParticles = size;
    for (let i = 0; i < this.maxParticles; i++) {
      this.pool.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 2,
        color: '#ffffff',
        glowColor: '#38bdf8',
        alpha: 1,
        decay: 0.02,
        life: 1,
        maxLife: 1,
        type: 'spark',
        rotation: 0,
        rotSpeed: 0,
      });
    }
  }

  public spawn(
    x: number,
    y: number,
    vx: number,
    vy: number,
    radius: number,
    color: string,
    glowColor: string,
    lifeSeconds: number,
    type: 'spark' | 'smoke' | 'leaf' | 'wind' | 'clean' | 'glow' = 'spark'
  ) {
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.pool[i];
      if (!p.active) {
        p.active = true;
        p.x = x;
        p.y = y;
        p.vx = vx;
        p.vy = vy;
        p.radius = radius;
        p.color = color;
        p.glowColor = glowColor;
        p.alpha = 1;
        p.life = lifeSeconds;
        p.maxLife = lifeSeconds;
        p.decay = 1 / lifeSeconds;
        p.type = type;
        p.rotation = Math.random() * Math.PI * 2;
        p.rotSpeed = (Math.random() - 0.5) * 5;
        return p;
      }
    }
    return null;
  }

  public burst(
    x: number,
    y: number,
    count: number,
    color: string,
    glowColor: string,
    speed: number = 140,
    type: 'spark' | 'smoke' | 'leaf' | 'clean' = 'spark'
  ) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const spd = (0.4 + Math.random() * 0.8) * speed;
      const vx = Math.cos(angle) * spd;
      const vy = Math.sin(angle) * spd;
      const rad = 2 + Math.random() * 3.5;
      const life = 0.4 + Math.random() * 0.5;
      this.spawn(x, y, vx, vy, rad, color, glowColor, life, type);
    }
  }

  public update(dt: number, windDriftX: number = 0) {
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }

      p.alpha = Math.max(0, p.life / p.maxLife);
      p.x += (p.vx + windDriftX * 0.3) * dt;
      p.y += p.vy * dt;
      p.rotation += p.rotSpeed * dt;

      // Friction
      p.vx *= 0.98;
      p.vy *= 0.98;

      if (p.type === 'leaf') {
        p.vy += 25 * dt; // gravity
        p.vx += Math.sin(p.rotation) * 15 * dt;
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.type === 'leaf') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius * 1.5, p.radius * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'clean' || p.type === 'spark') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.glowColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'smoke') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * (1 + (1 - p.alpha) * 1.5), 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  public clear() {
    for (let i = 0; i < this.maxParticles; i++) {
      this.pool[i].active = false;
    }
  }
}
