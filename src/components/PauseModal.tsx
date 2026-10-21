/**
 * Pause Modal
 */

import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, BookOpen, Settings } from 'lucide-react';
import type { GameStats } from '../game/types';

interface PauseModalProps {
  stats: GameStats;
  isMuted: boolean;
  onResume: () => void;
  onRestart: () => void;
  onExitToMenu: () => void;
  onToggleMute: () => void;
  onOpenScience: () => void;
  onOpenSettings: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  stats,
  isMuted,
  onResume,
  onRestart,
  onExitToMenu,
  onToggleMute,
  onOpenScience,
  onOpenSettings,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-center text-slate-100">
        <h3 className="text-2xl font-gamer font-bold uppercase tracking-tight text-white mb-1">
          VUELO EN PAUSA
        </h3>
        <p className="text-xs font-mono-code text-slate-400 mb-4">
          Puntaje actual: <strong className="text-cyan-400">{stats.score.toLocaleString()}</strong>
        </p>

        <div className="flex flex-col gap-2.5 my-4">
          <button
            onClick={onResume}
            className="w-full py-2.5 rounded-xl font-gamer font-bold text-xs tracking-wider uppercase bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>REANUDAR MISIÓN</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-gamer text-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REINICIAR PARTIDA</span>
          </button>

          <button
            onClick={onOpenScience}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-gamer text-emerald-400 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>CONSULTAR CÁPSULAS CIENTÍFICAS</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-gamer text-slate-300 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" />
            <span>AJUSTES & MICRÓFONO</span>
          </button>

          <button
            onClick={onExitToMenu}
            className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-gamer text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>VOLVER AL MENÚ PRINCIPAL</span>
          </button>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-center">
          <button
            onClick={onToggleMute}
            className="text-xs font-mono-code text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'Activar sonido' : 'Silenciar sonido'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
