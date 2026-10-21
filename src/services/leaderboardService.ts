/**
 * Leaderboard Service
 * Interacts with Firebase Firestore (collection: records_feria) with seamless
 * LocalStorage fallback when credentials are not yet configured or offline.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  type Firestore 
} from 'firebase/firestore';

export interface LeaderboardRecord {
  id?: string;
  playerName: string;
  score: number;
  treesPlanted: number;
  cleanEnergyCollected: number;
  realCity: string;
  realWindSpeed: number;
  createdAt: number | string;
  isFirebase?: boolean;
}

const LOCAL_STORAGE_KEY = 'eco_tormenta_records_feria_v1';
const FIREBASE_CONFIG_KEY = 'eco_tormenta_firebase_config_custom';

const INITIAL_FALLBACK_RECORDS: LeaderboardRecord[] = [
  {
    id: 'rec-1',
    playerName: 'Capitana Gaia 🌿',
    score: 8420,
    treesPlanted: 24,
    cleanEnergyCollected: 52,
    realCity: 'Madrid',
    realWindSpeed: 18.2,
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'rec-2',
    playerName: 'EcoVolt-99 ⚡',
    score: 6950,
    treesPlanted: 19,
    cleanEnergyCollected: 45,
    realCity: 'Ciudad de México',
    realWindSpeed: 21.0,
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'rec-3',
    playerName: 'AeroGuardián 💨',
    score: 5410,
    treesPlanted: 16,
    cleanEnergyCollected: 38,
    realCity: 'Santiago',
    realWindSpeed: 15.4,
    createdAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'rec-4',
    playerName: 'Solaris-Bio ☀️',
    score: 4230,
    treesPlanted: 12,
    cleanEnergyCollected: 29,
    realCity: 'Bogotá',
    realWindSpeed: 12.0,
    createdAt: Date.now() - 3600000 * 24,
  },
  {
    id: 'rec-5',
    playerName: 'BrisaLimpia 🌱',
    score: 3180,
    treesPlanted: 9,
    cleanEnergyCollected: 22,
    realCity: 'Buenos Aires',
    realWindSpeed: 19.8,
    createdAt: Date.now() - 3600000 * 36,
  },
];

class LeaderboardService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private isConnectedToFirebase: boolean = false;

  constructor() {
    this.initFirebaseIfAvailable();
  }

  private initFirebaseIfAvailable() {
    try {
      const storedConfig = localStorage.getItem(FIREBASE_CONFIG_KEY);
      if (storedConfig) {
        const config = JSON.parse(storedConfig);
        if (config.apiKey && config.projectId) {
          if (!getApps().length) {
            this.app = initializeApp(config);
          } else {
            this.app = getApps()[0];
          }
          this.db = getFirestore(this.app);
          this.isConnectedToFirebase = true;
          return;
        }
      }
    } catch (err) {
      console.warn('Firebase initialization skipped, fallback mode active:', err);
      this.isConnectedToFirebase = false;
    }
  }

  public setCustomFirebaseConfig(configJson: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(configJson);
      if (!parsed.projectId || !parsed.apiKey) {
        return { success: false, error: 'Faltan campos obligatorios (apiKey o projectId).' };
      }
      localStorage.setItem(FIREBASE_CONFIG_KEY, configJson);
      this.app = initializeApp(parsed, 'custom-' + Date.now());
      this.db = getFirestore(this.app);
      this.isConnectedToFirebase = true;
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'JSON inválido' };
    }
  }

  public getIsUsingFirebase(): boolean {
    return this.isConnectedToFirebase && this.db !== null;
  }

  /**
   * Fetch Top 5 records from Firebase Firestore collection `records_feria`
   * with automatic fallback to LocalStorage.
   */
  public async getTopRecords(): Promise<LeaderboardRecord[]> {
    if (this.isConnectedToFirebase && this.db) {
      try {
        const colRef = collection(this.db, 'records_feria');
        const q = query(colRef, orderBy('score', 'desc'), limit(5));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const list: LeaderboardRecord[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            list.push({
              id: doc.id,
              playerName: data.playerName || 'Anónimo',
              score: Number(data.score) || 0,
              treesPlanted: Number(data.treesPlanted) || 0,
              cleanEnergyCollected: Number(data.cleanEnergyCollected) || 0,
              realCity: data.realCity || 'Desconocida',
              realWindSpeed: Number(data.realWindSpeed) || 0,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : Date.now(),
              isFirebase: true,
            });
          });
          return list;
        }
      } catch (error) {
        console.warn('Error reading from Firestore collection records_feria, reading LocalStorage:', error);
      }
    }

    // LocalStorage Fallback
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_FALLBACK_RECORDS));
        return INITIAL_FALLBACK_RECORDS;
      }
      const parsed: LeaderboardRecord[] = JSON.parse(raw);
      return parsed.sort((a, b) => b.score - a.score).slice(0, 5);
    } catch {
      return INITIAL_FALLBACK_RECORDS;
    }
  }

  /**
   * Save new record to `records_feria` in Firestore (and LocalStorage).
   */
  public async saveRecord(newRecord: Omit<LeaderboardRecord, 'id' | 'createdAt'>): Promise<{ success: boolean; isFirebase: boolean }> {
    let savedToFirebase = false;

    // 1. Try Firestore if configured
    if (this.isConnectedToFirebase && this.db) {
      try {
        const colRef = collection(this.db, 'records_feria');
        await addDoc(colRef, {
          playerName: newRecord.playerName.slice(0, 30),
          score: Math.round(newRecord.score),
          treesPlanted: Math.round(newRecord.treesPlanted),
          cleanEnergyCollected: Math.round(newRecord.cleanEnergyCollected),
          realCity: newRecord.realCity.slice(0, 50),
          realWindSpeed: Number(newRecord.realWindSpeed),
          createdAt: serverTimestamp(),
        });
        savedToFirebase = true;
      } catch (error) {
        console.warn('Could not write to Firestore records_feria:', error);
      }
    }

    // 2. Always maintain synced backup in LocalStorage
    try {
      const currentList = await this.getTopRecords();
      const entry: LeaderboardRecord = {
        ...newRecord,
        id: 'rec-' + Date.now(),
        createdAt: Date.now(),
        isFirebase: savedToFirebase,
      };

      const updated = [...currentList, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('LocalStorage write error:', err);
    }

    return { success: true, isFirebase: savedToFirebase };
  }
}

export const leaderboardService = new LeaderboardService();
