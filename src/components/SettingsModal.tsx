/**
 * Settings & Microphone Calibration Modal
 * Allows adjusting mic blow sensitivity, testing the blow gauge in real time,
 * managing audio, and configuring Firebase Firestore credentials.
 */

import React, { useState } from 'react';
import { 
  Settings, 
  X, 
  Mic, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import type { MicState } from '../audio/micInput';
import { micInput } from '../audio/micInput';
import { leaderboardService } from '../services/leaderboardService';

interface SettingsModalProps {
  micState: MicState;
  isMuted: boolean;
  onToggleMute: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  micState,
  isMuted,
  onToggleMute,
  onClose,
}) => {
  const [sensitivity, setSensitivity] = useState(micState.sensitivityThreshold);
  const [firebaseConfigText, setFirebaseConfigText] = useState('');
  const [firebaseStatus, setFirebaseStatus] = useState<string | null>(null);
  const isUsingFirebase = leaderboardService.getIsUsingFirebase();

  const handleSensitivityChange = (val: number) => {
    setSensitivity(val);
    micInput.setSensitivity(val);
  };

  const handleApplyFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseConfigText.trim()) return;

    const res = leaderboardService.setCustomFirebaseConfig(firebaseConfigText);
    if (res.success) {
      setFirebaseStatus('¡Configuración de Firebase Firestore guardada y vinculada a records_feria!');
    } else {
      setFirebaseStatus(`Error: ${res.error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-gamer font-bold text-white uppercase tracking-tight">
                AJUSTES & CALIBRACIÓN DE SENSORES
              </h3>
              <p className="text-xs font-mono-code text-slate-400">
                Sensibilidad de soplido, audio sintético y persistencia
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

        {/* Scrollable Body */}
        <div className="my-4 overflow-y-auto space-y-5 pr-1 flex-1 text-left">
          {/* Section 1: Microphone Calibration & Blow Detector */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-gamer font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-cyan-400" />
                CALIBRACIÓN DEL MICRÓFONO (SOPLIDO)
              </span>
              <span className="text-xs font-mono-code text-slate-300 font-bold">
                {micState.isActive ? `${micState.decibels} dB` : 'Desactivado'}
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Al soplar fuerte al micrófono, se activa la superturbina eólica. Ajusta el umbral según tu micrófono o nivel de ruido ambiente.
            </p>

            {/* Slider */}
            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between text-xs font-mono-code text-slate-400">
                <span>Sensible (soplido suave)</span>
                <span className="text-cyan-300 font-bold">{sensitivity}%</span>
                <span>Firme (soplido fuerte)</span>
              </div>
              <input
                type="range"
                min={15}
                max={85}
                value={sensitivity}
                onChange={(e) => handleSensitivityChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Live interactive test gauge */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
              <div className="flex justify-between text-[11px] font-mono-code text-slate-400 mb-1">
                <span>Prueba de soplido en vivo:</span>
                <span className={micState.isBlowing ? 'text-cyan-300 font-bold animate-pulse' : 'text-slate-500'}>
                  {micState.isBlowing ? '¡VÓRTICE DETECTADO!' : 'Sopla para probar'}
                </span>
              </div>
              <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`h-full transition-all duration-75 ${
                    micState.isBlowing 
                      ? 'bg-gradient-to-r from-cyan-400 to-white shadow-[0_0_12px_rgba(6,182,212,1)]' 
                      : 'bg-cyan-500/70'
                  }`}
                  style={{ width: `${Math.min(100, micState.levelPercent)}%` }}
                />
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-rose-400 shadow-[0_0_4px_rgba(244,63,94,0.9)]"
                  style={{ left: `${sensitivity}%` }}
                />
              </div>
            </div>

            <div className="mt-2 text-[10px] font-mono-code text-slate-400">
              * Nota: Si juegas sin micrófono, puedes pulsar la <strong>tecla [ESPACIO]</strong> o el botón de pantalla para disparar la turbina de emergencia.
            </div>
          </div>

          {/* Section 2: Audio FX */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-gamer font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
                EFECTOS DE SONIDO SINTÉTICOS (WEB AUDIO)
              </div>
              <div className="text-xs text-slate-400">
                Sonidos sintetizados por osciladores en tiempo real (0 MP3 externos).
              </div>
            </div>
            <button
              onClick={onToggleMute}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isMuted
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                  : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              }`}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Section 3: Firebase Firestore & LocalStorage Leaderboard */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-gamer font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-amber-400" />
                CONEXIÓN FIREBASE FIRESTORE (RECORDS_FERIA)
              </span>
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                {isUsingFirebase ? '🟢 Firebase En Línea' : '🔵 LocalStorage Activo'}
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Los puntajes se guardan en la colección <strong className="text-cyan-400">records_feria</strong>. Si no se especifican credenciales, el juego funciona al 100% con respaldo automático en <strong className="text-amber-300">LocalStorage</strong>.
            </p>

            <form onSubmit={handleApplyFirebase} className="space-y-2">
              <textarea
                value={firebaseConfigText}
                onChange={(e) => setFirebaseConfigText(e.target.value)}
                placeholder='Opcional: Pega tu firebaseConfig JSON {"apiKey": "...", "projectId": "..."}'
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono-code text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-gamer text-amber-400 cursor-pointer"
              >
                VINCULAR CONFIGURACIÓN FIRESTORE
              </button>
            </form>

            {firebaseStatus && (
              <div className="mt-2 text-xs font-mono-code text-emerald-300 bg-emerald-950/40 p-2 rounded border border-emerald-800/40">
                {firebaseStatus}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-gamer text-xs cursor-pointer"
          >
            GUARDAR Y CERRAR
          </button>
        </div>
      </div>
    </div>
  );
};
