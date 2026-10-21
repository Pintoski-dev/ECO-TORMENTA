/**
 * Science Encyclopedia Modal
 * Educational explorer with rich environmental science cards.
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Wind, 
  Sun, 
  Sprout, 
  AlertTriangle, 
  CloudRain, 
  Compass, 
  Sparkles,
  Lightbulb
} from 'lucide-react';
import { SCIENCE_CAPSULES, type ScienceCapsule } from '../data/scienceCapsules';

interface ScienceModalProps {
  onClose: () => void;
}

export const ScienceModal: React.FC<ScienceModalProps> = ({ onClose }) => {
  const [selectedId, setSelectedId] = useState<string>(SCIENCE_CAPSULES[0].id);
  const current = SCIENCE_CAPSULES.find((c) => c.id === selectedId) || SCIENCE_CAPSULES[0];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'energia_limpia':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'reforestacion':
        return <Sprout className="w-4 h-4 text-emerald-400" />;
      case 'contaminacion':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      default:
        return <Wind className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-gamer font-bold text-white uppercase tracking-tight">
                ENCICLOPEDIA AMBIENTAL & ENERGÍAS LIMPIAS
              </h3>
              <p className="text-xs font-mono-code text-slate-400">
                Aprende los fundamentos científicos detrás de Eco-Tormenta 2D
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

        {/* Content Body: Tabs + Detail */}
        <div className="flex flex-col md:flex-row gap-4 my-4 overflow-hidden flex-1">
          {/* Capsule Selector List */}
          <div className="w-full md:w-56 shrink-0 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto pr-1">
            {SCIENCE_CAPSULES.map((capsule) => {
              const isSelected = capsule.id === selectedId;
              return (
                <button
                  key={capsule.id}
                  onClick={() => setSelectedId(capsule.id)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 md:shrink ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-500/50 text-white shadow-md'
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                  }`}
                >
                  {getCategoryIcon(capsule.category)}
                  <span className="font-gamer font-bold truncate">{capsule.badge}</span>
                </button>
              );
            })}
          </div>

          {/* Active Capsule Viewer */}
          <div className="flex-1 overflow-y-auto bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-left space-y-3.5">
            <div>
              <span className="text-[10px] font-mono-code text-cyan-400 uppercase tracking-widest bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                {current.badge}
              </span>
              <h4 className="text-base font-gamer font-bold text-white mt-1.5">
                {current.title}
              </h4>
              <p className="text-xs text-slate-300 italic mt-0.5">
                "{current.summary}"
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
              <h5 className="text-[11px] font-gamer font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                CONCEPTO FÍSICO / QUÍMICO
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {current.scientificConcept}
              </p>
            </div>

            <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3">
              <h5 className="text-[11px] font-gamer font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                ¿SABÍAS QUE...?
              </h5>
              <p className="text-xs text-amber-200/90 leading-relaxed font-sans">
                {current.didYouKnow}
              </p>
            </div>

            <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-xl p-3">
              <h5 className="text-[11px] font-gamer font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-cyan-400" />
                ACCIÓN DE IMPACTO REAL
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {current.actionTip}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 shrink-0 text-xs font-mono-code text-slate-400">
          <span>Eco-Tormenta 2D · Divulgación Científica</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-gamer text-xs cursor-pointer"
          >
            ENTENDIDO
          </button>
        </div>
      </div>
    </div>
  );
};
