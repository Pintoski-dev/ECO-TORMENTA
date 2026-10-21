/**
 * Eco-Tormenta 2D: Guardianes de la Atmósfera
 * Core Canvas 2D Game Engine (60 FPS Simulation Loop)
 */

import { soundEngine } from '../audio/soundEngine';
import { ParticlePool } from './particles';
import type { 
  PlayerDrone, 
  CollectibleItem, 
  HazardSmog, 
  SuperTurbineShockwave, 
  HolographicTree, 
  GameStats, 
  ItemType 
} from './types';
import type { WeatherData } from '../services/weatherService';

export interface GameEngineCallbacks {
  onStatsUpdate: (stats: GameStats) => void;
  onHealthUpdate: (health: number) => void;
  onTurbineEnergyUpdate: (energy: number) => void;
  onGameOver: (finalStats: GameStats) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameEngineCallbacks;
  private particles: ParticlePool;

  // Running State
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private lastTime: number = 0;
  private animId: number | null = null;

  // Screen Dimensions
  private width: number = 800;
  private height: number = 600;

  // Weather data
  private weather: WeatherData;
  private windSpeedFactor: number = 1.0;

  // Input states
  private keys: Record<string, boolean> = {};
  private mousePos: { x: number; y: number } | null = null;
  private isPointerDown: boolean = false;

  // Game Entities
  private player: PlayerDrone;
  private collectibles: CollectibleItem[] = [];
  private hazards: HazardSmog[] = [];
  private shockwaves: SuperTurbineShockwave[] = [];
  private plantedTrees: HolographicTree[] = [];

  // Spawners & Timers
  private itemSpawnTimer: number = 0;
  private hazardSpawnTimer: number = 0;
  private nextItemId: number = 1;
  private nextHazardId: number = 1;

  // Game Feel: Camera Shake & Hitstop
  private screenShake: number = 0;
  private hitstopTimer: number = 0;

  // Background Parallax
  private bgStars: Array<{ x: number; y: number; s: number; alpha: number }> = [];
  private windStreaks: Array<{ x: number; y: number; len: number; speed: number; alpha: number }> = [];
  private windTurbineAngle: number = 0;

  // Stats
  private stats: GameStats = {
    score: 0,
    treesPlanted: 0,
    cleanEnergyCollected: 0,
    smogDispersed: 0,
    maxCombo: 1,
    currentCombo: 1,
    comboTimer: 0,
    elapsedSeconds: 0,
  };

  constructor(canvas: HTMLCanvasElement, weather: WeatherData, callbacks: GameEngineCallbacks) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context from canvas');
    this.ctx = ctx;
    this.weather = weather;
    this.callbacks = callbacks;
    this.particles = new ParticlePool(700);

    this.resize();
    this.updateWeatherImpact(weather);

    // Initial player state
    this.player = {
      x: this.width * 0.2,
      y: this.height * 0.5,
      vx: 0,
      vy: 0,
      radius: 20,
      propellerAngle: 0,
      tilt: 0,
      health: 100,
      maxHealth: 100,
      turbineEnergy: 100, // starts fully charged
      invincibleTimer: 0,
      hitFlashTimer: 0,
    };

    this.initBackgroundDecor();
    this.bindEvents();
  }

  public updateWeatherImpact(newWeather: WeatherData) {
    this.weather = newWeather;
    // Scale real wind speed (km/h) into in-game horizontal movement factor
    // E.g., 5 km/h -> 0.7x, 25 km/h -> 1.4x, 50 km/h -> 2.2x
    const kmh = Math.max(2, newWeather.windSpeed);
    this.windSpeedFactor = 0.6 + (kmh / 25) * 0.7;
  }

  private resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  private initBackgroundDecor() {
    this.bgStars = [];
    for (let i = 0; i < 60; i++) {
      this.bgStars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.75),
        s: 1 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.7,
      });
    }

    this.windStreaks = [];
    for (let i = 0; i < 25; i++) {
      this.windStreaks.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        len: 40 + Math.random() * 90,
        speed: 150 + Math.random() * 250,
        alpha: 0.15 + Math.random() * 0.3,
      });
    }

    // Pre-seed a few horizon trees
    this.plantedTrees = [];
    for (let i = 0; i < 5; i++) {
      this.plantedTrees.push({
        x: (this.width / 5) * i + Math.random() * 40,
        y: this.height - 35,
        scale: 0.8,
        maxScale: 1,
        hue: 140 + Math.random() * 30,
        growthProgress: 1,
      });
    }
  }

  private bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('resize', this.handleWindowResize);

    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('mouseleave', this.handleMouseUp);

    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
  }

  public unbindEvents() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('resize', this.handleWindowResize);

    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('mouseleave', this.handleMouseUp);

    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = true;
    this.keys[e.code] = true;

    // Spacebar emergency trigger for superturbine
    if (e.code === 'Space' && !e.repeat) {
      e.preventDefault();
      this.triggerSuperTurbine(100);
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
    this.keys[e.code] = false;
  };

  private handleWindowResize = () => {
    this.resize();
  };

  private handleMouseMove = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  private handleMouseDown = (e: MouseEvent) => {
    this.isPointerDown = true;
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  private handleMouseUp = () => {
    this.isPointerDown = false;
  };

  private handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    this.isPointerDown = true;
    if (e.touches.length > 0) {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
  };

  private handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
  };

  private handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    this.isPointerDown = false;
  };

  public start() {
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    soundEngine.startDroneHum();
    this.loop(this.lastTime);
  }

  public stop() {
    this.isRunning = false;
    soundEngine.stopDroneHum();
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    if (paused) {
      soundEngine.stopDroneHum();
    } else {
      soundEngine.startDroneHum();
      this.lastTime = performance.now();
    }
  }

  /**
   * Superturbine Activation (Invoked via microphone blow or emergency spacebar)
   */
  public triggerSuperTurbine(powerPercentage: number = 85) {
    if (!this.isRunning || this.isPaused) return;

    // Must have at least 25% charge
    if (this.player.turbineEnergy < 25) {
      soundEngine.playBlowSpool();
      return;
    }

    // Deduct charge
    this.player.turbineEnergy = Math.max(0, this.player.turbineEnergy - 35);
    this.callbacks.onTurbineEnergyUpdate(this.player.turbineEnergy);

    // Audio & Screen Feedback
    soundEngine.playSuperTurbine();
    this.screenShake = 16;

    // Spawn massive expanding shockwave
    this.shockwaves.push({
      x: this.player.x,
      y: this.player.y,
      radius: 20,
      maxRadius: Math.max(this.width, this.height) * 1.1,
      alpha: 1,
      power: powerPercentage,
    });

    // Particle burst from drone
    this.particles.burst(this.player.x, this.player.y, 45, '#38bdf8', '#0284c7', 260, 'clean');

    // Blow all active smog clouds away and purify them!
    let purifiedCount = 0;
    for (const hazard of this.hazards) {
      if (!hazard.isDispersing) {
        hazard.isDispersing = true;
        hazard.disperseProgress = 0;
        purifiedCount++;

        // Burst clean air neon sparkles
        this.particles.burst(hazard.x, hazard.y, 18, '#4ade80', '#22c55e', 180, 'clean');
      }
    }

    if (purifiedCount > 0) {
      const bonusScore = purifiedCount * 120 * this.stats.currentCombo;
      this.stats.score += bonusScore;
      this.stats.smogDispersed += purifiedCount;
      this.callbacks.onStatsUpdate(this.stats);
    }
  }

  private loop = (timestamp: number) => {
    if (!this.isRunning) return;

    const rawDt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    const dt = Math.min(rawDt, 0.05); // clamped delta time

    if (!this.isPaused) {
      if (this.hitstopTimer > 0) {
        this.hitstopTimer -= dt;
      } else {
        this.update(dt);
      }
    }

    this.render();
    this.animId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    this.stats.elapsedSeconds += dt;

    // Screen Shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 28);
    }

    // Invincibility & Flash
    if (this.player.invincibleTimer > 0) {
      this.player.invincibleTimer -= dt;
    }
    if (this.player.hitFlashTimer > 0) {
      this.player.hitFlashTimer -= dt;
    }

    // Passive slow turbine energy recharge (1.5% per second)
    if (this.player.turbineEnergy < 100) {
      this.player.turbineEnergy = Math.min(100, this.player.turbineEnergy + dt * 2.8);
      this.callbacks.onTurbineEnergyUpdate(this.player.turbineEnergy);
    }

    // Combo timer
    if (this.stats.comboTimer > 0) {
      this.stats.comboTimer -= dt;
      if (this.stats.comboTimer <= 0) {
        this.stats.currentCombo = 1;
        this.callbacks.onStatsUpdate(this.stats);
      }
    }

    // Update Player Movement
    this.updatePlayer(dt);

    // Update Collectibles
    this.updateCollectibles(dt);

    // Update Hazards (Smog)
    this.updateHazards(dt);

    // Update Superturbine Shockwaves
    this.updateShockwaves(dt);

    // Update Particles
    const windHorizontalDrift = (this.weather.windSpeed * (Math.cos((this.weather.windDirection * Math.PI) / 180))) * 3.5;
    this.particles.update(dt, windHorizontalDrift);

    // Update Trees growth
    for (const tree of this.plantedTrees) {
      if (tree.growthProgress < 1) {
        tree.growthProgress = Math.min(1, tree.growthProgress + dt * 1.5);
      }
    }

    // Update Wind turbine background spinning angle
    this.windTurbineAngle += dt * (1.8 + (this.weather.windSpeed / 20) * 4.5);

    // Spawning logic
    this.handleSpawning(dt);
  }

  private updatePlayer(dt: number) {
    const moveSpeed = 360;
    let targetVx = 0;
    let targetVy = 0;

    // Keyboard controls
    if (this.keys['arrowleft'] || this.keys['a']) targetVx -= moveSpeed;
    if (this.keys['arrowright'] || this.keys['d']) targetVx += moveSpeed;
    if (this.keys['arrowup'] || this.keys['w']) targetVy -= moveSpeed;
    if (this.keys['arrowdown'] || this.keys['s']) targetVy += moveSpeed;

    // Mouse / Touch follow with spring smoothing
    if (this.isPointerDown && this.mousePos) {
      const dx = this.mousePos.x - this.player.x;
      const dy = this.mousePos.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 8) {
        targetVx = (dx / dist) * Math.min(moveSpeed * 1.25, dist * 6.5);
        targetVy = (dy / dist) * Math.min(moveSpeed * 1.25, dist * 6.5);
      }
    }

    // Atmospheric wind influence on drone
    const atmosphericPushX = -15 * this.windSpeedFactor;
    targetVx += atmosphericPushX;

    // Smooth inertia
    this.player.vx += (targetVx - this.player.vx) * 0.16;
    this.player.vy += (targetVy - this.player.vy) * 0.16;

    this.player.x += this.player.vx * dt;
    this.player.y += this.player.vy * dt;

    // Bounds clamp
    const pad = this.player.radius + 6;
    this.player.x = Math.max(pad, Math.min(this.width - pad, this.player.x));
    this.player.y = Math.max(pad + 30, Math.min(this.height - pad - 20, this.player.y));

    // Propeller spinning & banking tilt
    const speedRatio = Math.sqrt(this.player.vx * this.player.vx + this.player.vy * this.player.vy) / moveSpeed;
    this.player.propellerAngle += dt * (22 + speedRatio * 35);
    this.player.tilt = (this.player.vx / moveSpeed) * 0.35;

    soundEngine.updateDroneSpeed(speedRatio);

    // Emit gentle thruster neon trail
    if (Math.random() < 0.45) {
      this.particles.spawn(
        this.player.x - 14,
        this.player.y + (Math.random() - 0.5) * 8,
        -40 - Math.random() * 30,
        (Math.random() - 0.5) * 20,
        1.8,
        '#38bdf8',
        '#0284c7',
        0.3,
        'glow'
      );
    }
  }

  private handleSpawning(dt: number) {
    this.itemSpawnTimer -= dt;
    this.hazardSpawnTimer -= dt;

    // Dynamic difficulty: hazard frequency ramps up gradually over time
    const difficultyMultiplier = Math.min(2.2, 1 + this.stats.elapsedSeconds / 75);

    // Spawn Collectibles every ~1.2s - 1.8s
    if (this.itemSpawnTimer <= 0) {
      this.itemSpawnTimer = 1.1 + Math.random() * 0.9;
      this.spawnCollectible();
    }

    // Spawn Hazards every ~1.4s - 2.4s (faster as time progresses)
    if (this.hazardSpawnTimer <= 0) {
      const baseInterval = Math.max(0.85, 2.3 / difficultyMultiplier);
      this.hazardSpawnTimer = baseInterval + Math.random() * 0.7;
      this.spawnHazard();
    }
  }

  private spawnCollectible() {
    // Weighted random type: Solar (40%), Wind (35%), Seed (25%)
    const roll = Math.random();
    let type: ItemType = 'solar';
    let value = 100;
    if (roll > 0.4 && roll <= 0.75) {
      type = 'wind';
      value = 150;
    } else if (roll > 0.75) {
      type = 'seed';
      value = 200;
    }

    const radius = type === 'solar' ? 18 : type === 'wind' ? 17 : 19;
    const y = 60 + Math.random() * (this.height - 120);
    // Base speed modified by real Open-Meteo wind!
    const baseSpeed = 120 + Math.random() * 60;
    const vx = -(baseSpeed * this.windSpeedFactor);

    this.collectibles.push({
      id: this.nextItemId++,
      type,
      x: this.width + radius + 10,
      y,
      vx,
      vy: (Math.random() - 0.5) * 35,
      radius,
      rotation: Math.random() * Math.PI * 2,
      pulse: 0,
      value,
      markedForRemoval: false,
    });
  }

  private spawnHazard() {
    const radius = 24 + Math.random() * 16;
    const y = 50 + Math.random() * (this.height - 110);
    // Hazard speed strongly propelled by real wind
    const baseSpeed = 140 + Math.random() * 70;
    const vx = -(baseSpeed * this.windSpeedFactor);

    // Generate organic smoky clumps
    const clumpCount = 5 + Math.floor(Math.random() * 4);
    const clumps = [];
    for (let i = 0; i < clumpCount; i++) {
      const angle = (Math.PI * 2 * i) / clumpCount;
      const dist = Math.random() * (radius * 0.55);
      clumps.push({
        ox: Math.cos(angle) * dist,
        oy: Math.sin(angle) * dist,
        r: radius * (0.45 + Math.random() * 0.4),
        color: Math.random() > 0.4 ? 'rgba(75, 45, 65, 0.75)' : 'rgba(40, 50, 45, 0.75)',
      });
    }

    this.hazards.push({
      id: this.nextHazardId++,
      x: this.width + radius + 20,
      y,
      vx,
      vy: (Math.random() - 0.5) * 40,
      radius,
      clumps,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 1.5,
      alpha: 0.9,
      pm25Density: 1 + Math.random() * 1.5,
      isDispersing: false,
      disperseProgress: 0,
      markedForRemoval: false,
    });
  }

  private updateCollectibles(dt: number) {
    for (const item of this.collectibles) {
      item.x += item.vx * dt;
      item.y += item.vy * dt;
      item.pulse += dt * 4;
      item.rotation += dt * 2;

      // Soft vertical oscillation
      item.vy += Math.sin(item.pulse) * 12 * dt;

      // Check collision with player
      const dx = item.x - this.player.x;
      const dy = item.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < item.radius + this.player.radius) {
        this.collectItem(item);
        item.markedForRemoval = true;
      }

      // Out of bounds
      if (item.x < -item.radius - 20) {
        item.markedForRemoval = true;
      }
    }

    this.collectibles = this.collectibles.filter((c) => !c.markedForRemoval);
  }

  private collectItem(item: CollectibleItem) {
    // Combo multiplier
    this.stats.comboTimer = 2.4;
    this.stats.currentCombo = Math.min(8, this.stats.currentCombo + 1);
    if (this.stats.currentCombo > this.stats.maxCombo) {
      this.stats.maxCombo = this.stats.currentCombo;
    }

    const earned = item.value * this.stats.currentCombo;
    this.stats.score += earned;
    this.stats.cleanEnergyCollected++;

    if (item.type === 'solar') {
      soundEngine.playSolarPickup();
      // Restore +5 health
      this.player.health = Math.min(100, this.player.health + 5);
      this.callbacks.onHealthUpdate(this.player.health);
      this.particles.burst(item.x, item.y, 16, '#facc15', '#f59e0b', 160, 'spark');
    } else if (item.type === 'wind') {
      soundEngine.playWindPickup();
      // Charge +22% turbine energy
      this.player.turbineEnergy = Math.min(100, this.player.turbineEnergy + 22);
      this.callbacks.onTurbineEnergyUpdate(this.player.turbineEnergy);
      this.particles.burst(item.x, item.y, 16, '#38bdf8', '#0284c7', 180, 'spark');
    } else if (item.type === 'seed') {
      soundEngine.playSeedPickup();
      this.stats.treesPlanted++;
      this.particles.burst(item.x, item.y, 18, '#4ade80', '#16a34a', 150, 'leaf');

      // Sprout new holographic tree on the horizon!
      this.plantedTrees.push({
        x: Math.max(20, Math.min(this.width - 20, item.x + (Math.random() - 0.5) * 80)),
        y: this.height - 35,
        scale: 0.2,
        maxScale: 0.8 + Math.random() * 0.4,
        hue: 130 + Math.random() * 40,
        growthProgress: 0,
      });

      // Keep array reasonable
      if (this.plantedTrees.length > 25) {
        this.plantedTrees.shift();
      }
    }

    this.callbacks.onStatsUpdate(this.stats);
  }

  private updateHazards(dt: number) {
    for (const h of this.hazards) {
      if (h.isDispersing) {
        // Being vaporized by superturbine!
        h.disperseProgress += dt * 2.8;
        h.radius += dt * 45;
        h.alpha = Math.max(0, 1 - h.disperseProgress);
        h.x += 180 * dt; // blown backwards

        if (h.disperseProgress >= 1) {
          h.markedForRemoval = true;
        }
        continue;
      }

      h.x += h.vx * dt;
      h.y += h.vy * dt;
      h.rotation += h.rotationSpeed * dt;

      // Check collision with player
      if (this.player.invincibleTimer <= 0) {
        const dx = h.x - this.player.x;
        const dy = h.y - this.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Generous inner core collision radius
        if (dist < (h.radius * 0.75) + (this.player.radius * 0.8)) {
          this.damagePlayer(h);
        }
      }

      // Check out of bounds
      if (h.x < -h.radius - 30) {
        h.markedForRemoval = true;
      }
    }

    this.hazards = this.hazards.filter((h) => !h.markedForRemoval);
  }

  private damagePlayer(hazard: HazardSmog) {
    soundEngine.playSmogHit();
    this.screenShake = 12;
    this.hitstopTimer = 0.05; // 50ms hitstop impact

    // Deduct health
    const damage = Math.round(18 * hazard.pm25Density);
    this.player.health = Math.max(0, this.player.health - damage);
    this.player.invincibleTimer = 1.3; // 1.3 seconds invulnerability
    this.player.hitFlashTimer = 0.35;

    // Reset combo
    this.stats.currentCombo = 1;
    this.stats.comboTimer = 0;

    // Toxic splash particles
    this.particles.burst(this.player.x, this.player.y, 22, '#f43f5e', '#be123c', 170, 'smoke');

    this.callbacks.onHealthUpdate(this.player.health);
    this.callbacks.onStatsUpdate(this.stats);

    // Check Game Over
    if (this.player.health <= 0) {
      this.handlePlayerDefeat();
    }
  }

  private handlePlayerDefeat() {
    this.stop();
    soundEngine.playGameOver();
    this.callbacks.onGameOver(this.stats);
  }

  private updateShockwaves(dt: number) {
    for (const wave of this.shockwaves) {
      wave.radius += dt * 1100; // rapid sonic expansion
      wave.alpha = Math.max(0, 1 - wave.radius / wave.maxRadius);
    }
    this.shockwaves = this.shockwaves.filter((w) => w.alpha > 0.01 && w.radius < w.maxRadius);
  }

  // ================= RENDER PIPELINE =================
  private render() {
    const ctx = this.ctx;
    ctx.save();

    // Camera shake offset
    let offsetX = 0;
    let offsetY = 0;
    if (this.screenShake > 0) {
      offsetX = (Math.random() - 0.5) * this.screenShake;
      offsetY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(offsetX, offsetY);
    }

    // 1. Atmospheric Sky Gradient (Responsive to Purity & Weather)
    this.renderAtmosphere(ctx);

    // 2. Parallax Distant Horizon & Wind Turbines
    this.renderParallaxHorizon(ctx);

    // 3. Holographic Forest
    this.renderHolographicForest(ctx);

    // 4. Collectibles (Solar, Wind, Seed)
    this.renderCollectibles(ctx);

    // 5. Smog Hazards (PM2.5 Clouds)
    this.renderHazards(ctx);

    // 6. Superturbine Blast Shockwaves
    this.renderShockwaves(ctx);

    // 7. Particles
    this.particles.draw(ctx);

    // 8. Player Drone MK-IV
    this.renderPlayer(ctx);

    // 9. Vignette & Toxicity atmosphere warning overlay
    this.renderToxicityVignette(ctx);

    ctx.restore();
  }

  private renderAtmosphere(ctx: CanvasRenderingContext2D) {
    const purity = this.player.health / 100;
    const grad = ctx.createLinearGradient(0, 0, 0, this.height);

    if (purity > 0.6) {
      // Clean, majestic cyan-violet twilight
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.5, '#082f49');
      grad.addColorStop(1, '#0c4a6e');
    } else if (purity > 0.25) {
      // Moderate smog haze
      grad.addColorStop(0, '#09090b');
      grad.addColorStop(0.5, '#1c1917');
      grad.addColorStop(1, '#292524');
    } else {
      // Severe acid inversion haze
      grad.addColorStop(0, '#1c1917');
      grad.addColorStop(0.5, '#2e1065');
      grad.addColorStop(1, '#3b0764');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Dynamic stars / atmospheric motes
    ctx.fillStyle = '#bae6fd';
    for (const star of this.bgStars) {
      ctx.globalAlpha = star.alpha * purity;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Wind streaks animated across the viewport (scaled with Open-Meteo wind speed)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.2;
    for (const streak of this.windStreaks) {
      streak.x -= streak.speed * this.windSpeedFactor * 0.016;
      if (streak.x < -streak.len) {
        streak.x = this.width + 10;
        streak.y = Math.random() * this.height;
      }
      ctx.beginPath();
      ctx.moveTo(streak.x, streak.y);
      ctx.lineTo(streak.x + streak.len, streak.y);
      ctx.stroke();
    }
  }

  private renderParallaxHorizon(ctx: CanvasRenderingContext2D) {
    const groundY = this.height - 35;

    // Distant mountain silhouette
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(0, groundY - 45);
    ctx.lineTo(this.width * 0.25, groundY - 80);
    ctx.lineTo(this.width * 0.55, groundY - 50);
    ctx.lineTo(this.width * 0.8, groundY - 95);
    ctx.lineTo(this.width, groundY - 40);
    ctx.lineTo(this.width, this.height);
    ctx.lineTo(0, this.height);
    ctx.closePath();
    ctx.fill();

    // Horizon ground line
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, this.height);
    groundGrad.addColorStop(0, '#047857');
    groundGrad.addColorStop(1, '#064e3b');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, this.width, this.height - groundY);

    // Glowing clean energy horizon border
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(this.width, groundY);
    ctx.stroke();

    // Draw background wind turbines spinning in sync with Open-Meteo wind!
    const turbinePositions = [this.width * 0.15, this.width * 0.45, this.width * 0.78];
    for (const tx of turbinePositions) {
      this.drawBackgroundTurbine(ctx, tx, groundY - 2, 42, this.windTurbineAngle);
    }
  }

  private drawBackgroundTurbine(ctx: CanvasRenderingContext2D, x: number, y: number, height: number, angle: number) {
    ctx.save();
    // Mast
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - height);
    ctx.stroke();

    // Hub
    const hubY = y - height;
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(x, hubY, 3, 0, Math.PI * 2);
    ctx.fill();

    // 3 Aerodynamic blades
    const bladeLen = height * 0.65;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.8;
    for (let i = 0; i < 3; i++) {
      const bAngle = angle + (i * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.moveTo(x, hubY);
      ctx.lineTo(x + Math.cos(bAngle) * bladeLen, hubY + Math.sin(bAngle) * bladeLen);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderHolographicForest(ctx: CanvasRenderingContext2D) {
    for (const tree of this.plantedTrees) {
      const curScale = tree.scale * tree.growthProgress;
      if (curScale <= 0.05) continue;

      ctx.save();
      ctx.translate(tree.x, tree.y);
      ctx.scale(curScale, curScale);

      // Trunk
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -22);
      ctx.stroke();

      // Holographic foliage tiers
      ctx.fillStyle = `hsla(${tree.hue}, 80%, 55%, 0.75)`;
      ctx.shadowColor = `hsla(${tree.hue}, 90%, 60%, 0.8)`;
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(0, -42);
      ctx.lineTo(-14, -20);
      ctx.lineTo(14, -20);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(-18, -10);
      ctx.lineTo(18, -10);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  private renderCollectibles(ctx: CanvasRenderingContext2D) {
    for (const item of this.collectibles) {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rotation);

      if (item.type === 'solar') {
        // Solar Energy Orb: Golden sunburst
        const rad = item.radius + Math.sin(item.pulse) * 2;
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, rad);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.35, '#fde047');
        grad.addColorStop(0.8, '#eab308');
        grad.addColorStop(1, 'rgba(234, 179, 8, 0)');

        ctx.fillStyle = grad;
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fill();

        // Corona rays
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.8;
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * (rad * 0.75), Math.sin(a) * (rad * 0.75));
          ctx.lineTo(Math.cos(a) * (rad * 1.3), Math.sin(a) * (rad * 1.3));
          ctx.stroke();
        }
      } else if (item.type === 'wind') {
        // Wind Kinetic Orb: Cyan cyclone
        const rad = item.radius;
        ctx.strokeStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2.5;

        // Outer kinetic ring
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.stroke();

        // 3 Curved vortex blades
        ctx.fillStyle = '#7dd3fc';
        for (let i = 0; i < 3; i++) {
          const a = (i * Math.PI * 2) / 3;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * (rad * 0.4), Math.sin(a) * (rad * 0.4), rad * 0.35, a, a + Math.PI * 0.9);
          ctx.fill();
        }
      } else if (item.type === 'seed') {
        // Reforestation Seed: Sprouting emerald seed pod
        const rad = item.radius;
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, rad);
        grad.addColorStop(0, '#bbf7d0');
        grad.addColorStop(0.6, '#22c55e');
        grad.addColorStop(1, '#15803d');

        ctx.fillStyle = grad;
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 14;

        // Organic seed teardrop
        ctx.beginPath();
        ctx.ellipse(0, 2, rad * 0.7, rad * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sprouting leaf crest
        ctx.strokeStyle = '#86efac';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -rad * 0.6);
        ctx.quadraticCurveTo(-6, -rad * 1.3, -10, -rad * 1.1);
        ctx.moveTo(0, -rad * 0.6);
        ctx.quadraticCurveTo(6, -rad * 1.3, 10, -rad * 1.1);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  private renderHazards(ctx: CanvasRenderingContext2D) {
    for (const h of this.hazards) {
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(h.rotation);
      ctx.globalAlpha = h.alpha;

      // Draw smoky clumping spheres
      for (const clump of h.clumps) {
        ctx.fillStyle = clump.color;
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(clump.ox, clump.oy, clump.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Toxic PM2.5 core icon & warning aura
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric PM2.5 indicator label
      ctx.font = 'bold 9px "Chakra Petch", sans-serif';
      ctx.fillStyle = '#f43f5e';
      ctx.textAlign = 'center';
      ctx.fillText('PM2.5', 0, -h.radius - 2);

      ctx.restore();
    }
  }

  private renderShockwaves(ctx: CanvasRenderingContext2D) {
    for (const wave of this.shockwaves) {
      ctx.save();
      ctx.globalAlpha = wave.alpha;
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 16;
      ctx.lineWidth = Math.max(2, 6 * wave.alpha);

      ctx.beginPath();
      ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Secondary expansion ripple
      if (wave.radius > 40) {
        ctx.strokeStyle = '#a5f3fc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  private renderPlayer(ctx: CanvasRenderingContext2D) {
    // If invincible, flash flicker
    if (this.player.invincibleTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(this.player.x, this.player.y);
    ctx.rotate(this.player.tilt);

    // Hit flash
    if (this.player.hitFlashTimer > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(0, 0, this.player.radius * 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // Forward environmental sensor light cone
    const beamGrad = ctx.createRadialGradient(10, 0, 5, 80, 0, 75);
    beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(85, -30);
    ctx.lineTo(85, 30);
    ctx.closePath();
    ctx.fill();

    // Drone Outer Frame (Carbon-fiber aero chassis)
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;

    // Streamlined body
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cockpit sensor dome / core
    const coreGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 8);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.5, '#10b981');
    coreGrad.addColorStop(1, '#047857');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(2, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    // 4 Quadcopter Arms & Spinning Neon Propellers
    const armOffsets = [
      { x: -14, y: -12 },
      { x: 14, y: -12 },
      { x: -14, y: 12 },
      { x: 14, y: 12 },
    ];

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;
    for (const arm of armOffsets) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(arm.x, arm.y);
      ctx.stroke();

      // Spinning propeller disk
      ctx.save();
      ctx.translate(arm.x, arm.y);
      ctx.rotate(this.player.propellerAngle);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.lineTo(9, 0);
      ctx.stroke();

      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Health / Shield protective aura if high purity
    if (this.player.health > 80) {
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, this.player.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderToxicityVignette(ctx: CanvasRenderingContext2D) {
    const purity = this.player.health / 100;
    if (purity < 0.45) {
      // Vignette flashes toxic acidic red-amber around edges
      const intensity = (1 - purity / 0.45) * 0.65;
      const grad = ctx.createRadialGradient(
        this.width * 0.5,
        this.height * 0.5,
        this.width * 0.35,
        this.width * 0.5,
        this.height * 0.5,
        this.width * 0.75
      );
      grad.addColorStop(0, 'rgba(244, 63, 94, 0)');
      grad.addColorStop(1, `rgba(244, 63, 94, ${intensity})`);

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);
    }
  }
}
