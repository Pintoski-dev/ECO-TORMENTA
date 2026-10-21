/**
 * Open-Meteo Real-Time Weather Selector Modal
 * Allows switching between live world cities or GPS coordinates to alter in-game atmospheric physics.
 */

import React, { useState } from 'react';
import { 
  Wind, 
  MapPin, 
  X, 
  Compass, 
  Thermometer, 
  Droplets, 
  Check, 
  RotateCw,
  Navigation
} from 'lucide-react';
import { 
  CITY_PRESETS, 
  fetchLiveWeather, 
  type WeatherData, 
  type CityPreset 
} from '../services/weatherService';

interface WeatherModalProps {
  currentWeather: WeatherData;
  onSelectWeather: (weather: WeatherData) => void;
  onClose: () => void;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({
  currentWeather,
  onSelectWeather,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(currentWeather.city);

  const handleCityPick = async (preset: CityPreset) => {
    setSelectedCity(preset.name);
    setIsLoading(true);
    try {
      const live = await fetchLiveWeather(preset.lat, preset.lon, preset.name, preset.country);
      onSelectWeather(live);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada por tu navegador.');
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const live = await fetchLiveWeather(lat, lon, 'Tu Ubicación GPS', 'Local');
          setSelectedCity('Tu Ubicación GPS');
          onSelectWeather(live);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err);
        setIsLoading(false);
        alert('No se pudo acceder a tu ubicación GPS. Selecciona una ciudad de la lista.');
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '10s' }} />
            </div>
            <div>
              <h3 className="text-xl font-gamer font-bold text-white uppercase tracking-tight">
                SENSOR METEOROLÓGICO OPEN-METEO
              </h3>
              <p className="text-xs font-mono-code text-slate-400">
                El viento real de la atmósfera modula la física del juego
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

        {/* Live Weather Readout Card */}
        <div className="my-4 p-4 rounded-xl bg-gradient-to-br from-cyan-950/60 to-slate-950/80 border border-cyan-500/30 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-gamer font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {currentWeather.city} {currentWeather.country ? `(${currentWeather.country})` : ''}
            </span>
            <span className="text-[10px] font-mono-code text-slate-400">
              Act: {currentWeather.fetchedAt}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center my-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
              <Thermometer className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-base font-mono-code font-bold text-white">
                {currentWeather.temperature}°C
              </div>
              <div className="text-[9px] font-gamer text-slate-400">TEMPERATURA</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
              <Wind className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <div className="text-base font-mono-code font-bold text-cyan-300">
                {currentWeather.windSpeed} km/h
              </div>
              <div className="text-[9px] font-gamer text-slate-400">VELOCIDAD VIENTO</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
              <Droplets className="w-4 h-4 text-sky-400 mx-auto mb-1" />
              <div className="text-base font-mono-code font-bold text-white">
                {currentWeather.humidity}%
              </div>
              <div className="text-[9px] font-gamer text-slate-400">HUMEDAD</div>
            </div>
          </div>

          <p className="text-[11px] font-mono-code text-slate-300">
            <strong>Impacto en el juego:</strong> {currentWeather.weatherDescription}. Viento de {currentWeather.windSpeed} km/h empuja los obstáculos y orbes a velocidad proporcional.
          </p>
        </div>

        {/* GPS Geolocation Button */}
        <button
          onClick={handleUseGeolocation}
          disabled={isLoading}
          className="w-full mb-3 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-gamer text-cyan-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Navigation className="w-3.5 h-3.5 text-cyan-400" />
          <span>DETECTAR MI CLIMA LOCAL MEDIANTE GPS</span>
        </button>

        {/* City Presets Grid */}
        <div className="overflow-y-auto flex-1 pr-1">
          <div className="text-xs font-gamer font-bold text-slate-400 mb-2 uppercase text-left">
            SELECCIONA UNA CIUDAD GLOBAL:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CITY_PRESETS.map((preset) => {
              const isSelected = selectedCity === preset.name;
              return (
                <button
                  key={preset.name}
                  onClick={() => handleCityPick(preset)}
                  disabled={isLoading}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-500/60 text-white shadow-md'
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="truncate">
                    <div className="font-gamer font-bold truncate">{preset.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono-code truncate">{preset.country}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 shrink-0 text-xs font-mono-code text-slate-400">
          <span>Fuente: api.open-meteo.com (Libre & En Vivo)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-gamer text-xs cursor-pointer"
          >
            CONFIRMAR
          </button>
        </div>
      </div>
    </div>
  );
};
