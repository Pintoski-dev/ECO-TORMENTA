/**
 * Web Audio API Microphone Analyzer & Aerodynamic Blow Detector
 * Accurately detects blowing turbulence into the microphone with real-time dB calculation
 * and sensitivity calibration.
 */

export interface MicState {
  isActive: boolean;
  isPermissionGranted: boolean;
  decibels: number; // e.g. -60 to 0 dB
  levelPercent: number; // 0 to 100%
  sensitivityThreshold: number; // 0 to 100% (default ~45%)
  isBlowing: boolean;
  lastBlowTime: number;
  error: string | null;
}

export type BlowCallback = (intensity: number) => void;

class MicInputManager {
  private audioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private floatArray: Float32Array | null = null;
  private animationFrameId: number | null = null;
  private onBlowListeners: Set<BlowCallback> = new Set();
  
  private sensitivityThreshold: number = 42; // default threshold (0-100)
  private currentDb: number = -60;
  private currentLevelPercent: number = 0;
  private isBlowing: boolean = false;
  private lastBlowTrigger: number = 0;
  private blowCooldownMs: number = 1100; // prevent rapid retrigger
  private isActive: boolean = false;
  private error: string | null = null;

  public async startMicrophone(): Promise<boolean> {
    if (this.isActive && this.mediaStream) {
      return true;
    }

    try {
      this.error = null;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
        video: false,
      });

      this.mediaStream = stream;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtx();
      
      const source = this.audioCtx.createMediaStreamSource(stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.3;

      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      this.floatArray = new Float32Array(this.analyser.fftSize);

      this.isActive = true;
      this.processAudioLoop();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo acceder al micrófono';
      console.warn('Microphone access not available or denied:', msg);
      this.error = msg;
      this.isActive = false;
      return false;
    }
  }

  public stopMicrophone() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }

    this.isActive = false;
    this.currentDb = -60;
    this.currentLevelPercent = 0;
    this.isBlowing = false;
  }

  public setSensitivity(threshold: number) {
    this.sensitivityThreshold = Math.max(10, Math.min(95, threshold));
  }

  public getSensitivity(): number {
    return this.sensitivityThreshold;
  }

  public onBlow(callback: BlowCallback): () => void {
    this.onBlowListeners.add(callback);
    return () => this.onBlowListeners.delete(callback);
  }

  /**
   * Manual fallback trigger (spacebar or screen button)
   */
  public triggerManualBlow(intensity: number = 85) {
    const now = Date.now();
    if (now - this.lastBlowTrigger < this.blowCooldownMs) return;

    this.lastBlowTrigger = now;
    this.isBlowing = true;
    this.onBlowListeners.forEach((cb) => cb(intensity));
    setTimeout(() => {
      this.isBlowing = false;
    }, 400);
  }

  public getState(): MicState {
    return {
      isActive: this.isActive,
      isPermissionGranted: this.mediaStream !== null,
      decibels: Math.round(this.currentDb * 10) / 10,
      levelPercent: Math.round(this.currentLevelPercent),
      sensitivityThreshold: this.sensitivityThreshold,
      isBlowing: this.isBlowing,
      lastBlowTime: this.lastBlowTrigger,
      error: this.error,
    };
  }

  private processAudioLoop = () => {
    if (!this.isActive || !this.analyser || !this.floatArray || !this.dataArray) {
      return;
    }

    // Cast to any to avoid DOM type mismatch between ArrayBuffer and ArrayBufferLike in tsconfig
    (this.analyser.getFloatTimeDomainData as (arr: unknown) => void)(this.floatArray);
    (this.analyser.getByteFrequencyData as (arr: unknown) => void)(this.dataArray);

    // Compute RMS amplitude
    let sumSquares = 0;
    for (let i = 0; i < this.floatArray.length; i++) {
      const val = this.floatArray[i];
      sumSquares += val * val;
    }
    const rms = Math.sqrt(sumSquares / this.floatArray.length);

    // Decibel calculation: 20 * log10(rms) clamped from -65dB to 0dB
    let db = -65;
    if (rms > 0.0001) {
      db = 20 * Math.log10(rms);
    }
    db = Math.max(-65, Math.min(0, db));
    this.currentDb = db;

    // Normalize level to 0-100%
    // -60 dB -> 0%, -10 dB or higher -> 100%
    const normalized = Math.max(0, Math.min(100, ((db + 60) / 50) * 100));
    this.currentLevelPercent = normalized;

    // Blow turbulence signature:
    // When someone blows into a mic, energy is distributed across broadband frequencies (noise)
    // with heavy air friction in low-to-mid bands (100Hz - 2500Hz).
    let bandEnergy = 0;
    const binCount = Math.floor(this.dataArray.length * 0.6);
    for (let i = 2; i < binCount; i++) {
      bandEnergy += this.dataArray[i];
    }
    const avgBand = bandEnergy / (binCount - 2);

    const isAboveThreshold = normalized >= this.sensitivityThreshold && avgBand > 55;
    const now = Date.now();

    if (isAboveThreshold && now - this.lastBlowTrigger > this.blowCooldownMs) {
      this.lastBlowTrigger = now;
      this.isBlowing = true;
      this.onBlowListeners.forEach((cb) => cb(normalized));

      setTimeout(() => {
        this.isBlowing = false;
      }, 450);
    }

    this.animationFrameId = requestAnimationFrame(this.processAudioLoop);
  };
}

export const micInput = new MicInputManager();
