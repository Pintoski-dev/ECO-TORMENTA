/**
 * Game Types & Interfaces for Eco-Tormenta 2D
 */

export type ItemType = 'solar' | 'wind' | 'seed';

export interface PlayerDrone {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  propellerAngle: number;
  tilt: number;
  health: number; // 0 to 100 (Atmospheric Purity / Shield)
  maxHealth: number;
  turbineEnergy: number; // 0 to 100%
  invincibleTimer: number;
  hitFlashTimer: number;
}

export interface CollectibleItem {
  id: number;
  type: ItemType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  pulse: number;
  value: number;
  markedForRemoval: boolean;
}

export interface SmogClump {
  ox: number;
  oy: number;
  r: number;
  color: string;
}

export interface HazardSmog {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  clumps: SmogClump[];
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  pm25Density: number; // 1 to 3
  isDispersing: boolean;
  disperseProgress: number;
  markedForRemoval: boolean;
}

export interface SuperTurbineShockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  power: number;
}

export interface HolographicTree {
  x: number;
  y: number;
  scale: number;
  maxScale: number;
  hue: number;
  growthProgress: number; // 0 to 1
}

export interface GameStats {
  score: number;
  treesPlanted: number;
  cleanEnergyCollected: number;
  smogDispersed: number;
  maxCombo: number;
  currentCombo: number;
  comboTimer: number;
  elapsedSeconds: number;
}
