/**
 * Start Screen / Title Menu
 * Dark gamer style with live sensor badges, mission briefing, mic calibration, and game launch CTA.
 */

import React from 'react';
import { 
  Play, 
  Wind, 
  Sun, 
  Sprout, 
  Mic, 
  Trophy, 
  BookOpen, 
  Settings, 
  Compass, 
  ShieldCheck,
  Activity
} from 'lucide-react';
import type { WeatherData } from '../services/weatherService';
import type { MicState } from '../audio/micInput';

interface StartScreenProps {
  weather: WeatherData;
  micState: MicState;
  onStartGame: () => void;
  onOpenLeaderboard: () => void;
  onOpenScience: () => void;
  onOpenSettings: () => void;
  onOpenWeatherModal: () => void;
  onEnableMic: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  weather,
  micState,
  onStartGame,
  onOpenLeaderboard,
  onOpenScience,
  onOpenSettings,
  onOpenWeatherModal,
  onEnableMic,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center p-6 text-center z-20 overflow-y-auto">
      {/* Background ambient decorative grid */}
      <div className="absolute inset-0 bg-radial from-slate-900/60 via-slate-950/95 to-slate-950 -z-10 pointer-events-none" />

      {/* Header telemetry badges */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Open-Meteo Live Sensor Chip */}
        <button
          onClick={onOpenWeatherModal}
          className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800/90 border border-cyan-500/30 hover:border-cyan-400 rounded-full px-4 py-1.5 text-xs font-mono-code transition-all shadow-md group"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-400">TELEMETRÍA METEOROLÓGICA:</span>
          <span className="font-bold text-white group-hover:text-cyan-300">{weather.city}</span>
          <span className="text-amber-400 font-bold">{weather.temperature}°C</span>
          <span className="text-cyan-400 font-bold">{weather.windSpeed} km/h</span>
          <Wind className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-45 transition-transform" />
        </button>

        {/* Microphone status badge */}
        <div className="flex items-center gap-2">
          {!micState.isActive ? (
            <button
              onClick={onEnableMic}
              className="flex items-center gap-2 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 rounded-full px-3.5 py-1.5 text-xs font-gamer text-cyan-300 hover:text-white transition-all shadow-md"
            >
              <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>ACTIVAR MICRÓFONO (SOPLIDO)</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 rounded-full px-3.5 py-1.5 text-xs font-mono-code text-emerald-300 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>MICRÓFONO CONECTADO ({micState.decibels} dB)</span>
            </div>
          )}
        </div>
      </div>

      {/* Hero Centerpiece: Title Lockup & Mission Briefing */}
      <div className="max-w-2xl my-auto flex flex-col items-center">
        {/* Bespoke SVG Logo Badge */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 via-emerald-500 to-sky-700 p-0.5 shadow-[0_0_35px_rgba(6,182,212,0.5)]">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
              {/* Spinning mini wind turbine inside logo */}
              <Wind className="w-10 h-10 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
              <Sprout className="w-5 h-5 text-emerald-400 absolute bottom-2 right-2" />
            </div>
          </div>
        </div>

        {/* Game Title */}
        <h1 className="text-4xl md:text-5xl font-gamer font-bold tracking-tight text-white uppercase text-glow-cyan">
          ECO-TORMENTA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-lime-300">2D</span>
        </h1>
        <p className="text-xs md:text-sm font-gamer tracking-widest text-cyan-300/90 uppercase mt-1">
          GUARDIANES DE LA ATMÓSFERA · CIENCIA & ENERGÍAS LIMPIAS
        </p>

        {/* Briefing Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 my-5 text-left text-sm text-slate-300 shadow-xl max-w-xl">
          <div className="text-xs font-gamer font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ORDEN DE MISIÓN AMBIENTAL
          </div>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed mb-3">
            Pilota el dron ecológico <strong className="text-cyan-300">Aero-Guardian MK-IV</strong>. 
            Recolecta esferas de energía limpia y semillas para sembrar bosques en el horizonte, 
            mientras esquivas nubes tóxicas de <strong className="text-rose-400">esmog ácido (PM2.5)</strong>.
          </p>

          {/* Double WOW Features highlight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono-code pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-cyan-300 bg-cyan-950/40 p-2 rounded-lg border border-cyan-800/40">
              <Wind className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Viento real Open-Meteo modula la física del juego.</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300 bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/40">
              <Mic className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>¡Sopla al micrófono para activar la superturbina!</span>
            </div>
          </div>
        </div>

        {/* Primary Start CTA */}
        <button
          onClick={onStartGame}
          className="group relative px-8 py-3.5 rounded-xl font-gamer font-bold text-base tracking-wider uppercase bg-gradient-to-r from-emerald-500 via-cyan-500 to-sky-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.8)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-3"
        >
          <Play className="w-5 h-5 fill-slate-950 group-hover:scale-110 transition-transform" />
          <span>INICIAR DESPEGUE [ENTER]</span>
        </button>

        {/* Flat control-hint line */}
        <p className="text-xs font-mono-code text-slate-400 mt-3">
          WASD / Flechas Mover · Soplar o [ESPACIO] Superturbina · [ESC] Pausa
        </p>
      </div>

      {/* Footer Navigation Bar */}
      <div className="w-full max-w-2xl flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-800/60">
        <button
          onClick={onOpenLeaderboard}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-xs font-gamer text-slate-300 hover:text-amber-400 transition-all cursor-pointer"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>RÉCORDS FERIA (TOP 5)</span>
        </button>

        <button
          onClick={onOpenScience}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-xs font-gamer text-slate-300 hover:text-emerald-400 transition-all cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>CÁPSULAS CIENTÍFICAS</span>
        </button>

        <button
          onClick={onOpenWeatherModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs font-gamer text-slate-300 hover:text-cyan-400 transition-all cursor-pointer"
        >
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>CIUDAD & CLIMA REAL</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 text-xs font-gamer text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>AJUSTES & MICRÓFONO</span>
        </button>
      </div>
    </div>
  );
};
