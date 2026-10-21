/**
 * Game Over Screen & Record Submission Modal
 * Integrates dynamic science capsule, match metrics, and record submission to records_feria.
 */

import React, { useState } from 'react';
import { 
  RotateCcw, 
  Trophy, 
  Share2, 
  BookOpen, 
  Sprout, 
  Sun, 
  Wind, 
  CheckCircle2, 
  Sparkles,
  AlertOctagon,
  Clock
} from 'lucide-react';
import type { GameStats } from '../game/types';
import type { WeatherData } from '../services/weatherService';
import { getRandomCapsule, type ScienceCapsule } from '../data/scienceCapsules';
import { leaderboardService } from '../services/leaderboardService';

interface GameOverModalProps {
  stats: GameStats;
  weather: WeatherData;
  onRestart: () => void;
  onOpenLeaderboard: () => void;
  onOpenScience: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  weather,
  onRestart,
  onOpenLeaderboard,
  onOpenScience,
}) => {
  const [capsule] = useState<ScienceCapsule>(() => getRandomCapsule());
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = playerName.trim() || 'Cadete Guardián';
    setIsSubmitting(true);

    try {
      const result = await leaderboardService.saveRecord({
        playerName: cleanName,
        score: stats.score,
        treesPlanted: stats.treesPlanted,
        cleanEnergyCollected: stats.cleanEnergyCollected,
        realCity: weather.city,
        realWindSpeed: weather.windSpeed,
      });

      setIsSubmitted(true);
      if (result.isFirebase) {
        setSubmitMessage('¡Récord guardado exitosamente en Firebase Firestore (records_feria)!');
      } else {
        setSubmitMessage('¡Récord guardado en LocalStorage (respaldo offline)!');
      }
    } catch (err) {
      console.error(err);
      setIsSubmitted(true);
      setSubmitMessage('Récord guardado localmente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const minutes = Math.floor(stats.elapsedSeconds / 60);
  const seconds = Math.floor(stats.elapsedSeconds % 60);
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-100 my-auto">
        {/* Glow header banner */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 font-gamer text-xs mb-2">
            <AlertOctagon className="w-3.5 h-3.5" />
            MISIÓN CONCLUIDA · BARRERA DEGRADADA
          </div>
          <h2 className="text-3xl font-gamer font-bold uppercase tracking-tight text-white text-glow-cyan">
            PUNTAJE FINAL: <span className="text-cyan-400 font-mono-code">{stats.score.toLocaleString()}</span>
          </h2>
        </div>

        {/* Match Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center text-emerald-400 mb-1">
              <Sprout className="w-4 h-4" />
            </div>
            <div className="text-lg font-mono-code font-bold text-white">{stats.treesPlanted}</div>
            <div className="text-[10px] font-gamer text-slate-400">ÁRBOLES SEMBRADOS</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center text-amber-400 mb-1">
              <Sun className="w-4 h-4" />
            </div>
            <div className="text-lg font-mono-code font-bold text-white">{stats.cleanEnergyCollected}</div>
            <div className="text-[10px] font-gamer text-slate-400">ENERGÍAS LIMPIAS</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center text-cyan-400 mb-1">
              <Wind className="w-4 h-4" />
            </div>
            <div className="text-lg font-mono-code font-bold text-white">{stats.smogDispersed}</div>
            <div className="text-[10px] font-gamer text-slate-400">ESMOG DISPERSADO</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center text-purple-400 mb-1">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-lg font-mono-code font-bold text-white">{timeFormatted}</div>
            <div className="text-[10px] font-gamer text-slate-400">TIEMPO DE VUELO</div>
          </div>
        </div>

        {/* Dynamic Science Capsule (Educational Core) */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-950/70 to-cyan-950/40 border border-emerald-500/30 rounded-xl p-4 mb-5 text-left">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-gamer font-bold tracking-widest text-emerald-400 uppercase flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              CÁPSULA CIENTÍFICA: {capsule.badge}
            </span>
            <span className="text-[10px] font-mono-code text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
              CIENCIA AMBIENTAL
            </span>
          </div>

          <h4 className="text-sm font-bold font-gamer text-white mb-1">
            {capsule.title}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed mb-2">
            {capsule.scientificConcept}
          </p>

          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-[11px] text-amber-200/90 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span><strong>Dato clave:</strong> {capsule.didYouKnow}</span>
          </div>
        </div>

        {/* High Score Submission Form (Firebase Firestore: records_feria) */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmitScore} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 mb-5 text-left">
            <div className="text-xs font-gamer font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              REGISTRAR EN EL TOP 5 (RECORDS_FERIA)
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Nombre o alias del Guardián..."
                maxLength={25}
                required
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono-code"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg font-gamer font-bold text-xs tracking-wider uppercase bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shrink-0"
              >
                <Trophy className="w-4 h-4" />
                <span>{isSubmitting ? 'GUARDANDO...' : 'GUARDAR RÉCORD'}</span>
              </button>
            </div>
            <div className="text-[10px] font-mono-code text-slate-400 mt-2 flex items-center justify-between">
              <span>Sincronizado con: {weather.city} ({weather.windSpeed} km/h)</span>
              <span>Firestore / LocalStorage</span>
            </div>
          </form>
        ) : (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3.5 mb-5 flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-mono-code">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{submitMessage}</span>
            </div>
            <button
              onClick={onOpenLeaderboard}
              className="text-xs font-gamer font-bold text-amber-300 hover:text-white underline cursor-pointer shrink-0"
            >
              VER TOP 5 →
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLeaderboard}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-gamer text-slate-200 transition-colors cursor-pointer flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>TABLA TOP 5</span>
            </button>
            <button
              onClick={onOpenScience}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-gamer text-slate-200 transition-colors cursor-pointer flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>ENCICLOPEDIA</span>
            </button>
          </div>

          <button
            onClick={onRestart}
            className="px-6 py-2.5 rounded-xl font-gamer font-bold text-xs tracking-wider uppercase bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 transition-all shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>VOLVER A VOLAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
