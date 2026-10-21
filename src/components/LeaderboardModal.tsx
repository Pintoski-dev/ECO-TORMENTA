/**
 * Leaderboard Modal (records_feria Top 5)
 * Displays top scores stored in Firebase Firestore (or LocalStorage fallback).
 */

import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  X, 
  RotateCw, 
  Sprout, 
  Sun, 
  Wind, 
  Database, 
  HardDrive,
  Medal
} from 'lucide-react';
import { leaderboardService, type LeaderboardRecord } from '../services/leaderboardService';

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isUsingFirebase = leaderboardService.getIsUsingFirebase();

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const top = await leaderboardService.getTopRecords();
      setRecords(top);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-gamer font-bold text-white uppercase tracking-tight">
                RÉCORDS DE LA FERIA CIENTÍFICA
              </h3>
              <p className="text-xs font-mono-code text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>Colección: <strong className="text-cyan-400">records_feria</strong></span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 text-[11px] text-amber-300">
                  {isUsingFirebase ? (
                    <>
                      <Database className="w-3 h-3 text-emerald-400" />
                      Firebase Conectado
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-3 h-3 text-cyan-400" />
                      LocalStorage Activo
                    </>
                  )}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top 5 Table */}
        <div className="my-5">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 font-mono-code text-xs flex flex-col items-center gap-2">
              <RotateCw className="w-5 h-5 animate-spin text-cyan-400" />
              <span>Consultando telemetría de records_feria...</span>
            </div>
          ) : records.length === 0 ? (
            <div className="py-8 text-center text-slate-400 font-mono-code text-xs">
              No hay récords registrados todavía. ¡Sé el primer guardián!
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((rec, idx) => {
                const rank = idx + 1;
                const isFirst = rank === 1;
                const isSecond = rank === 2;
                const isThird = rank === 3;

                return (
                  <div
                    key={rec.id || idx}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isFirst
                        ? 'bg-amber-950/30 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : isSecond
                        ? 'bg-slate-800/60 border-slate-600/50'
                        : isThird
                        ? 'bg-amber-950/20 border-amber-700/40'
                        : 'bg-slate-950/50 border-slate-800/80'
                    }`}
                  >
                    {/* Rank & Name */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg font-gamer font-bold text-xs flex items-center justify-center shrink-0 ${
                          isFirst
                            ? 'bg-amber-400 text-slate-950 shadow-md'
                            : isSecond
                            ? 'bg-slate-300 text-slate-950'
                            : isThird
                            ? 'bg-amber-700 text-amber-100'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        #{rank}
                      </div>

                      <div className="text-left">
                        <div className="font-bold text-sm text-white flex items-center gap-1.5 font-gamer">
                          <span>{rec.playerName}</span>
                        </div>
                        <div className="text-[11px] font-mono-code text-slate-400 flex items-center gap-2">
                          <span className="text-cyan-400">{rec.realCity}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Sprout className="w-3 h-3" />
                            {rec.treesPlanted}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-amber-300">
                            <Sun className="w-3 h-3" />
                            {rec.cleanEnergyCollected}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className="text-base font-mono-code font-bold text-white tabular-nums">
                        {rec.score.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-gamer text-cyan-400 tracking-wider">
                        PUNTOS
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info & Reload */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-mono-code text-slate-400">
          <button
            onClick={loadRecords}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar ranking</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-gamer text-xs cursor-pointer"
          >
            CERRAR
          </button>
        </div>
      </div>
    </div>
  );
};
