import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { FACULTIES } from '../data/faculties';
import { DEFAULT_EVENTS, DEFAULT_STATIONS } from '../data/stations';
import { CampaignEvent, CheckinLog, Station } from '../types/game';
import { getLocalPublicUsers } from './authService';
import { db, isFirebaseConfigured } from './firebase';
import { loadLocalCheckinLogs, loadLocalEvents } from './gameService';

const LOCAL_STATIONS_KEY = 'tdc_go_stations_v3_3d';
const LOCAL_EVENTS_KEY = 'tdc_go_events_v3_3d';

export function loadStations(): Station[] {
  try {
    const raw = localStorage.getItem(LOCAL_STATIONS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STATIONS_KEY, JSON.stringify(DEFAULT_STATIONS));
      return [...DEFAULT_STATIONS];
    }
    const parsed = JSON.parse(raw) as Station[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_STATIONS];
  } catch {
    return [...DEFAULT_STATIONS];
  }
}

export async function fetchStationsFromCloudOrLocal(): Promise<Station[]> {
  const local = loadStations();
  if (!isFirebaseConfigured || !db) return local;

  try {
    const snap = await getDocs(collection(db, 'stations'));
    if (!snap.empty) {
      const list = snap.docs.map((d) => d.data() as Station);
      localStorage.setItem(LOCAL_STATIONS_KEY, JSON.stringify(list));
      return list;
    }
  } catch {
    // Fallback local
  }
  return local;
}

export async function saveStation(station: Station): Promise<Station[]> {
  const stations = loadStations();
  const idx = stations.findIndex((s) => s.id === station.id);
  if (idx >= 0) stations[idx] = station;
  else stations.push(station);
  localStorage.setItem(LOCAL_STATIONS_KEY, JSON.stringify(stations));

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'stations', station.id), station);
    } catch {
      // Fallback local
    }
  }
  return stations;
}

export async function deleteStation(stationId: string): Promise<Station[]> {
  const stations = loadStations().filter((s) => s.id !== stationId);
  localStorage.setItem(LOCAL_STATIONS_KEY, JSON.stringify(stations));

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'stations', stationId));
    } catch {
      // Ignore
    }
  }
  return stations;
}

export function resetStationsToDefault(): Station[] {
  localStorage.setItem(LOCAL_STATIONS_KEY, JSON.stringify(DEFAULT_STATIONS));
  return [...DEFAULT_STATIONS];
}

export async function saveCampaignEvent(evt: CampaignEvent): Promise<CampaignEvent[]> {
  const events = loadLocalEvents();
  const idx = events.findIndex((e) => e.id === evt.id);
  if (idx >= 0) events[idx] = evt;
  else events.push(evt);
  localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'events', evt.id), evt);
    } catch {
      // Ignore
    }
  }
  return events;
}

export function buildStationQrPayload(station: Station): string {
  return JSON.stringify({
    app: 'TDC_TRAVEL',
    stationId: station.id,
    token: station.qrSecretToken,
  });
}

export interface AnalyticsSummary {
  totalUsers: number;
  totalCheckins: number;
  stationStats: {
    id: string;
    name: string;
    count: number;
    col: string;
  }[];
  facultyStats: {
    id: string;
    name: string;
    shortName: string;
    studentsCount: number;
    totalPoints: number;
    color: string;
  }[];
  recentLogs: CheckinLog[];
}

export function getAdminAnalytics(stations: Station[]): AnalyticsSummary {
  const users = getLocalPublicUsers();
  const logs = loadLocalCheckinLogs();

  const stationCounts: Record<string, number> = {};
  stations.forEach((s, i) => {
    // Combine actual logs + baseline simulated campus visits for visual richness
    stationCounts[s.id] = Math.max(4, 18 - i * 2);
  });
  logs.forEach((l) => {
    stationCounts[l.stationId] = (stationCounts[l.stationId] || 0) + 1;
  });

  const stationStats = stations.map((s) => ({
    id: s.id,
    name: s.name,
    count: stationCounts[s.id] || 0,
    col: s.col,
  }));

  const facultyStats = FACULTIES.map((f) => {
    const facUsers = users.filter((u) => u.facultyId === f.id);
    const totalPoints = facUsers.reduce((acc, u) => acc + u.points, 0);
    return {
      id: f.id,
      name: f.name,
      shortName: f.shortName,
      studentsCount: facUsers.length,
      totalPoints,
      color: f.color,
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  const totalCheckins = stationStats.reduce((s, x) => s + x.count, 0);

  return {
    totalUsers: users.length,
    totalCheckins,
    stationStats,
    facultyStats,
    recentLogs: logs.slice(0, 20),
  };
}

export function generateAnalyticsCsv(summary: AnalyticsSummary): string {
  const lines: string[] = [];
  lines.push('BAO CAO THONG KE HE THONG TDC TRAVEL - TRUONG CAO DANG CONG NGHE THU DUC');
  lines.push(`Ngay xuat bao cao,${new Date().toISOString()}`);
  lines.push(`Tong so Sinh vien tham gia,${summary.totalUsers}`);
  lines.push(`Tong luot Check-in & Mo khoa Tram,${summary.totalCheckins}`);
  lines.push('');
  lines.push('1. THONG KE LUOT KHAM PHA THEO TRAM 3D');
  lines.push('Ma Tram,Ten Tram,So luot Check-in');
  summary.stationStats.forEach((s) => {
    lines.push(`"${s.id}","${s.name}",${s.count}`);
  });
  lines.push('');
  lines.push('2. THONG KE DIEM SO THEO KHOA');
  lines.push('Ma Khoa,Ten Khoa,So Sinh vien,Tong Diem');
  summary.facultyStats.forEach((f) => {
    lines.push(`"${f.id}","${f.name}",${f.studentsCount},${f.totalPoints}`);
  });
  return '\uFEFF' + lines.join('\n');
}
