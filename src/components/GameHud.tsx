/**
 * In-Game Low-Occlusion HUD Overlay
 * Displays atmospheric purity, superturbine power, live Open-Meteo telemetry,
 * real-time dB meter, and quick emergency turbine trigger.
 */

import React from 'react';
import { 
  Wind, 
  Sun, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Pause, 
  Sparkles,
  TreePine,
  Activity,
  AlertTriangle
} from 'lucide-react';
import type { WeatherData } from '../services/weatherService';
import type { GameStats } from '../game/types';
import type { MicState } from '../audio/micInput';

interface GameHudProps {
  health: number; // 0 to 100
  turbineEnergy: number; // 0 to 100
  stats: GameStats;
  weather: WeatherData;
  micState: MicState;
  isMuted: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onTriggerTurbine: () => void;
  onOpenWeatherModal: () => void;
  onOpenSettings: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  health,
  turbineEnergy,
  stats,
  weather,
  micState,
  isMuted,
  onToggleMute,
  onTogglePause,
  onTriggerTurbine,
  onOpenWeatherModal,
  onOpenSettings,
}) => {
  const isHealthCritical = health <= 25;
  const isTurbineReady = turbineEnergy >= 25;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none">
      {/* Top Bar: Telemetry + Score + Controls */}
      <div className="flex items-start justify-between gap-3">
        {/* Left Cluster: Drone Health (Atmospheric Purity) & Superturbine Bar */}
        <div className="pointer-events-auto flex flex-col gap-2 max-w-xs w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-lg">
          {/* Health / Purity */}
          <div>
            <div className="flex items-center justify-between text-xs font-gamer tracking-wider text-slate-300 mb-1">
              <span className="flex items-center gap-1.5 font-bold">
                <Activity className={`w-3.5 h-3.5 ${isHealthCritical ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`} />
                PUREZA ATMOSFÉRICA (SALUD)
              </span>
              <span className={`tabular-nums font-mono-code font-bold ${isHealthCritical ? 'text-rose-400' : 'text-emerald-400'}`}>
                {Math.round(health)}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div 
                className={`h-full rounded-full transition-all duration-150 ${
                  isHealthCritical 
                    ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-pulse' 
                    : health < 50 
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' 
                    : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, health))}%` }}
              />
            </div>
          </div>

          {/* Superturbine Charge Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-gamer tracking-wider text-slate-300 mb-1">
              <span className="flex items-center gap-1.5 font-bold text-cyan-300">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                SUPERTURBINA EÓLICA
              </span>
              <span className="tabular-nums font-mono-code text-cyan-400 font-bold">
                {Math.round(turbineEnergy)}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div 
                className={`h-full rounded-full transition-all duration-150 ${
                  isTurbineReady 
                    ? 'bg-gradient-to-r from-cyan-500 to-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.7)]' 
                    : 'bg-slate-600'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, turbineEnergy))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Live Open-Meteo Meteorology Telemetry */}
        <div 
          onClick={onOpenWeatherModal}
          className="pointer-events-auto cursor-pointer group flex items-center gap-3 bg-slate-900/85 hover:bg-slate-800/90 transition-all border border-cyan-500/30 hover:border-cyan-400/60 rounded-xl px-3.5 py-2 shadow-lg"
          title="Haz clic para cambiar ciudad meteorológica"
        >
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 group-hover:scale-105 transition-transform">
            <Wind className="w-4 h-4 animate-spin" style={{ animationDuration: `${Math.max(1, 10 - weather.windSpeed / 5)}s` }} />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-gamer font-bold tracking-widest text-cyan-400 uppercase">
                OPEN-METEO V4 EN VIVO
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="flex items-center gap-2 text-xs font-mono-code text-slate-200">
              <span className="font-bold text-white">{weather.city}:</span>
              <span className="text-amber-300 font-bold">{weather.temperature}°C</span>
              <span className="text-slate-500">|</span>
              <span className="text-cyan-300 font-bold">{weather.windSpeed} km/h</span>
            </div>
          </div>
        </div>

        {/* Right Cluster: Score + Combo + Game Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Score Box */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl px-4 py-2 flex flex-col items-end shadow-lg">
            <div className="text-[10px] font-gamer tracking-wider text-slate-400">PUNTUAJE</div>
            <div className="text-xl font-mono-code font-bold tabular-nums text-white text-glow-cyan">
              {stats.score.toLocaleString()}
            </div>
            {stats.currentCombo > 1 && (
              <div className="text-[11px] font-gamer font-bold text-amber-400 animate-bounce">
                COMBO x{stats.currentCombo}!
              </div>
            )}
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onToggleMute}
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={onTogglePause}
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Pausar juego"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Real-time dB Meter / Soplido + Quick Emergency Superturbine Trigger */}
      <div className="flex items-end justify-between gap-3">
        {/* Real-time Decibel / Soplido Gauge */}
        <div 
          onClick={onOpenSettings}
          className="pointer-events-auto cursor-pointer bg-slate-900/85 backdrop-blur-md border border-slate-800 hover:border-cyan-500/40 rounded-xl p-3 max-w-sm w-full shadow-lg transition-all"
          title="Haz clic para calibrar sensibilidad del micrófono"
        >
          <div className="flex items-center justify-between text-xs font-gamer tracking-wider mb-1.5">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              {micState.isActive ? (
                <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              ) : (
                <MicOff className="w-3.5 h-3.5 text-slate-500" />
              )}
              SENSOR DE MICRÓFONO (SOPLIDO)
            </span>
            <span className="font-mono-code text-[11px] text-cyan-300 font-bold">
              {micState.isActive ? `${micState.decibels} dB` : 'Inactivo'}
            </span>
          </div>

          {/* Live Level Bar with Threshold Line */}
          <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div 
              className={`h-full transition-all duration-75 ${
                micState.isBlowing 
                  ? 'bg-gradient-to-r from-cyan-400 to-white shadow-[0_0_12px_rgba(6,182,212,1)]' 
                  : micState.levelPercent > micState.sensitivityThreshold 
                  ? 'bg-cyan-400' 
                  : 'bg-slate-600'
              }`}
              style={{ width: `${Math.min(100, micState.levelPercent)}%` }}
            />
            {/* Threshold Marker Indicator */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-rose-400 z-10 shadow-[0_0_6px_rgba(244,63,94,0.9)]"
              style={{ left: `${micState.sensitivityThreshold}%` }}
              title={`Umbral de activación: ${micState.sensitivityThreshold}%`}
            />
          </div>

          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono-code">
            <span>Umbral: {micState.sensitivityThreshold}%</span>
            <span>{micState.isBlowing ? '¡SOPLIDO DETECTADO!' : 'Sopla para dispersar esmog'}</span>
          </div>
        </div>

        {/* Center Prompt: "¡SOPLA AL MICRÓFONO O PULSA [ESPACIO]!" */}
        {micState.isBlowing ? (
          <div className="pointer-events-none bg-cyan-500/20 border border-cyan-400 text-cyan-300 px-5 py-2 rounded-2xl animate-bounce shadow-[0_0_20px_rgba(6,182,212,0.6)] flex items-center gap-2 font-gamer font-bold text-sm tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
            ¡VÓRTICE EÓLICO ACTIVADO POR SOPLIDO!
          </div>
        ) : isHealthCritical ? (
          <div className="pointer-events-none bg-rose-500/20 border border-rose-500 text-rose-300 px-4 py-1.5 rounded-xl animate-pulse flex items-center gap-2 font-gamer text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            ¡ALTA TOXICIDAD PM2.5! SOPLA O PULSA [ESPACIO]
          </div>
        ) : null}

        {/* Right: Emergency Superturbine Button (for accessibility & touch devices) */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={onTriggerTurbine}
            disabled={!isTurbineReady}
            className={`px-4 py-2.5 rounded-xl font-gamer font-bold text-xs tracking-wider flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
              isTurbineReady
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 glow-cyan cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
            }`}
            title="Activar superturbina eólica de emergencia (o pulsa barra espaciadora)"
          >
            <Wind className="w-4 h-4" />
            <span>TURBINA [ESPACIO]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
