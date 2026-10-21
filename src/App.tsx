/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { GameHud } from './components/GameHud';
import { StartScreen } from './components/StartScreen';
import { GameOverModal } from './components/GameOverModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ScienceModal } from './components/ScienceModal';
import { WeatherModal } from './components/WeatherModal';
import { SettingsModal } from './components/SettingsModal';
import { PauseModal } from './components/PauseModal';
import { fetchLiveWeather, CITY_PRESETS, type WeatherData } from './services/weatherService';
import { micInput, type MicState } from './audio/micInput';
import { soundEngine } from './audio/soundEngine';
import type { GameStats } from './game/types';

type GameState = 'title' | 'playing' | 'paused' | 'gameover';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // High-level App States
  const [gameState, setGameState] = useState<GameState>('title');
  const [isMuted, setIsMuted] = useState(false);

  // Modals
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showScience, setShowScience] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWeather, setShowWeather] = useState(false);

  // Live Meteorological Weather
  const [weather, setWeather] = useState<WeatherData>(() => ({
    city: CITY_PRESETS[0].name,
    country: CITY_PRESETS[0].country,
    temperature: 21.5,
    windSpeed: 16.8,
    windDirection: 85,
    humidity: 50,
    weatherCode: 1,
    weatherDescription: 'Parcialmente Nublado',
    isDay: true,
    latitude: CITY_PRESETS[0].lat,
    longitude: CITY_PRESETS[0].lon,
    fetchedAt: 'En vivo',
  }));

  // Microphone state
  const [micState, setMicState] = useState<MicState>(() => micInput.getState());

  // In-Game Stats & Meters
  const [health, setHealth] = useState(100);
  const [turbineEnergy, setTurbineEnergy] = useState(100);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    treesPlanted: 0,
    cleanEnergyCollected: 0,
    smogDispersed: 0,
    maxCombo: 1,
    currentCombo: 1,
    comboTimer: 0,
    elapsedSeconds: 0,
  });

  // Initial Open-Meteo Fetch
  useEffect(() => {
    let isMounted = true;
    fetchLiveWeather(CITY_PRESETS[0].lat, CITY_PRESETS[0].lon, CITY_PRESETS[0].name, CITY_PRESETS[0].country)
      .then((data) => {
        if (isMounted) {
          setWeather(data);
          if (engineRef.current) {
            engineRef.current.updateWeatherImpact(data);
          }
        }
      })
      .catch((err) => console.warn('Weather init err:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Poll mic state for HUD updates
  useEffect(() => {
    const timer = setInterval(() => {
      setMicState(micInput.getState());
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Subscribe to Microphone Blow trigger -> fires superturbine in game!
  useEffect(() => {
    const unsubscribe = micInput.onBlow((intensity) => {
      if (engineRef.current) {
        engineRef.current.triggerSuperTurbine(intensity);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Audio mute toggle
  const handleToggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  }, [isMuted]);

  // Request Microphone Activation
  const handleEnableMic = async () => {
    await micInput.startMicrophone();
    setMicState(micInput.getState());
  };

  // Start / Launch Game
  const handleStartGame = useCallback(async () => {
    // Attempt microphone activation if not started
    if (!micState.isActive) {
      micInput.startMicrophone().catch(() => {});
    }

    if (!canvasRef.current) return;

    // Reset meters
    setHealth(100);
    setTurbineEnergy(100);
    setStats({
      score: 0,
      treesPlanted: 0,
      cleanEnergyCollected: 0,
      smogDispersed: 0,
      maxCombo: 1,
      currentCombo: 1,
      comboTimer: 0,
      elapsedSeconds: 0,
    });

    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current.unbindEvents();
    }

    const engine = new GameEngine(canvasRef.current, weather, {
      onStatsUpdate: (newStats) => setStats({ ...newStats }),
      onHealthUpdate: (h) => setHealth(h),
      onTurbineEnergyUpdate: (e) => setTurbineEnergy(e),
      onGameOver: (finalStats) => {
        setStats({ ...finalStats });
        setGameState('gameover');
      },
    });

    engineRef.current = engine;
    engine.start();
    setGameState('playing');
  }, [micState.isActive, weather]);

  // Pause toggle
  const handleTogglePause = useCallback(() => {
    if (gameState === 'playing') {
      engineRef.current?.setPaused(true);
      setGameState('paused');
    } else if (gameState === 'paused') {
      engineRef.current?.setPaused(false);
      setGameState('playing');
    }
  }, [gameState]);

  // Emergency Superturbine button click
  const handleTriggerTurbine = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.triggerSuperTurbine(100);
    }
  }, []);

  // Weather Selected
  const handleSelectWeather = (newWeather: WeatherData) => {
    setWeather(newWeather);
    if (engineRef.current) {
      engineRef.current.updateWeatherImpact(newWeather);
    }
  };

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showLeaderboard || showScience || showSettings || showWeather) {
          setShowLeaderboard(false);
          setShowScience(false);
          setShowSettings(false);
          setShowWeather(false);
          return;
        }
        if (gameState === 'playing' || gameState === 'paused') {
          handleTogglePause();
        }
      } else if (e.key === 'Enter' && gameState === 'title') {
        handleStartGame();
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [gameState, showLeaderboard, showScience, showSettings, showWeather, handleTogglePause, handleStartGame]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Background Live Canvas Game Viewport */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block z-0"
      />

      {/* CRT Scanline Retro Gamer Overlay */}
      <div className="crt-overlay absolute inset-0 z-10 pointer-events-none opacity-40" />

      {/* UI Screens according to Game State */}
      {gameState === 'title' && (
        <StartScreen
          weather={weather}
          micState={micState}
          onStartGame={handleStartGame}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenScience={() => setShowScience(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenWeatherModal={() => setShowWeather(true)}
          onEnableMic={handleEnableMic}
        />
      )}

      {gameState === 'playing' && (
        <GameHud
          health={health}
          turbineEnergy={turbineEnergy}
          stats={stats}
          weather={weather}
          micState={micState}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onTogglePause={handleTogglePause}
          onTriggerTurbine={handleTriggerTurbine}
          onOpenWeatherModal={() => setShowWeather(true)}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {gameState === 'paused' && (
        <PauseModal
          stats={stats}
          isMuted={isMuted}
          onResume={handleTogglePause}
          onRestart={handleStartGame}
          onExitToMenu={() => {
            engineRef.current?.stop();
            setGameState('title');
          }}
          onToggleMute={handleToggleMute}
          onOpenScience={() => setShowScience(true)}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {gameState === 'gameover' && (
        <GameOverModal
          stats={stats}
          weather={weather}
          onRestart={handleStartGame}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenScience={() => setShowScience(true)}
        />
      )}

      {/* Persistent / Modal Dialogs */}
      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}

      {showScience && (
        <ScienceModal onClose={() => setShowScience(false)} />
      )}

      {showWeather && (
        <WeatherModal
          currentWeather={weather}
          onSelectWeather={handleSelectWeather}
          onClose={() => setShowWeather(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          micState={micState}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
