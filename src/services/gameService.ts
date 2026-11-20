import { addDoc, collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { QUESTS } from '../data/campusLayout';
import { DEFAULT_EVENTS } from '../data/stations';
import {
  CampaignEvent,
  CheckinLog,
  PartyRoom,
  PublicLeaderboardUser,
  Station,
  UnlockedStationRecord,
  UserProfile,
  VerificationMethod,
} from '../types/game';
import { getLocalPublicUsers, syncProfileToCloud } from './authService';
import { db, isFirebaseConfigured } from './firebase';
import { loadLocalParties, syncMemberPointsInParty } from './partyService';

const LOCAL_CHECKINS_KEY = 'tdc_go_checkins_v2';
const LOCAL_EVENTS_KEY = 'tdc_go_events_v2';

// Minimum cooldown in ms between real-world QR/Riddle check-ins to prevent automated replay
export const ANTI_CHEAT_COOLDOWN_MS = 4000;

export function normalizeVietnameseAnswer(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}

export function verifyStationRiddle(station: Station, userInput: string): boolean {
  if (!station.riddle) return true;
  const expected = normalizeVietnameseAnswer(station.riddle.answer);
  const actual = normalizeVietnameseAnswer(userInput);
  if (!actual) return false;
  return actual === expected || actual.includes(expected);
}

export function verifyStationQrPayload(
  station: Station,
  scannedCode: string
): { valid: boolean; matchedStationId?: string; message: string } {
  const clean = scannedCode.trim();
  if (!clean) {
    return { valid: false, message: 'Mã QR trống hoặc không hợp lệ.' };
  }

  // Support either JSON payload `{"app":"TDC_GO","stationId":"...","token":"..."}` or direct token string
  try {
    if (clean.startsWith('{')) {
      const obj = JSON.parse(clean) as {
        app?: string;
        stationId?: string;
        token?: string;
      };
      if (obj.token === station.qrSecretToken || obj.stationId === station.id) {
        return {
          valid: true,
          matchedStationId: station.id,
          message: `Xác thực QR thành công tại ${station.name}!`,
        };
      }
      return {
        valid: false,
        matchedStationId: obj.stationId,
        message: 'Mã QR này thuộc về một trạm khác trong khuôn viên.',
      };
    }
  } catch {
    // Plain string check below
  }

  if (
    clean.toUpperCase() === station.qrSecretToken.toUpperCase() ||
    clean.toLowerCase() === station.id.toLowerCase()
  ) {
    return {
      valid: true,
      matchedStationId: station.id,
      message: `Xác thực mã định danh trạm ${station.name} thành công!`,
    };
  }

  return {
    valid: false,
    message: 'Mã QR không khớp với trạm hiện tại. Hãy kiểm tra lại bảng QR tại trạm!',
  };
}

export function checkAntiCheatCooldown(
  profile: UserProfile,
  method: VerificationMethod,
  now = Date.now()
): { allowed: boolean; waitSeconds: number } {
  if (method === 'demo') return { allowed: true, waitSeconds: 0 };

  const timestamps = Object.values(profile.done || {}).map((r) => r.unlockedAt || 0);
  if (timestamps.length === 0) return { allowed: true, waitSeconds: 0 };

  const lastUnlock = Math.max(...timestamps);
  const elapsed = now - lastUnlock;
  if (elapsed < ANTI_CHEAT_COOLDOWN_MS) {
    return {
      allowed: false,
      waitSeconds: Math.ceil((ANTI_CHEAT_COOLDOWN_MS - elapsed) / 1000),
    };
  }
  return { allowed: true, waitSeconds: 0 };
}

export function loadLocalEvents(): CampaignEvent[] {
  try {
    const raw = localStorage.getItem(LOCAL_EVENTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(DEFAULT_EVENTS));
      return [...DEFAULT_EVENTS];
    }
    const list = JSON.parse(raw) as CampaignEvent[];
    return Array.isArray(list) ? list : [...DEFAULT_EVENTS];
  } catch {
    return [...DEFAULT_EVENTS];
  }
}

export function getActiveEventMultiplier(): {
  event: CampaignEvent | null;
  multiplier: number;
} {
  const events = loadLocalEvents();
  const active = events.find((e) => e.active);
  return {
    event: active || null,
    multiplier: active ? active.bonusMultiplier : 1.0,
  };
}

export function calculateStationRewardPoints(params: {
  basePoints: number;
  party: PartyRoom | null;
  method: VerificationMethod;
}): {
  finalPoints: number;
  crossFacultyBonus: number;
  qrBonus: number;
} {
  const qrBonus = params.method === 'qr' ? 15 : params.method === 'riddle' ? 10 : 0;
  const crossMultiplier =
    params.party && params.party.isCrossFaculty ? params.party.bonusMultiplier : 1.0;
  const crossFacultyBonus =
    crossMultiplier > 1 ? Math.round(params.basePoints * (crossMultiplier - 1)) : 0;

  const finalPoints = params.basePoints + qrBonus + crossFacultyBonus;
  return {
    finalPoints,
    crossFacultyBonus,
    qrBonus,
  };
}

export function loadLocalCheckinLogs(): CheckinLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_CHECKINS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CheckinLog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function recordStationUnlock(params: {
  profile: UserProfile;
  station: Station;
  baseEarnedPoints: number;
  method: VerificationMethod;
  party: PartyRoom | null;
  photoDataUrl?: string;
  isQuizOrGameSuccess?: boolean;
  totalStationsCount: number;
}): Promise<{
  updatedProfile: UserProfile;
  finalPoints: number;
  crossFacultyBonus: number;
  qrBonus: number;
  newlyCompletedQuests: { name: string; reward: number }[];
}> {
  const { finalPoints, crossFacultyBonus, qrBonus } = calculateStationRewardPoints({
    basePoints: params.baseEarnedPoints,
    party: params.party,
    method: params.method,
  });

  const record: UnlockedStationRecord = {
    pts: finalPoints,
    unlockedAt: Date.now(),
    method: params.method,
    ...(params.photoDataUrl ? { photoDataUrl: params.photoDataUrl } : {}),
  };

  const nextDone = {
    ...(params.profile.done || {}),
    [params.station.id]: record,
  };

  let nextProfile: UserProfile = {
    ...params.profile,
    points: params.profile.points + finalPoints,
    quizOk:
      params.profile.quizOk + (params.isQuizOrGameSuccess ? 1 : 0),
    photos:
      params.profile.photos + (params.station.type === 'photo' ? 1 : 0),
    done: nextDone,
    updatedAt: Date.now(),
  };

  const newlyCompletedQuests: { name: string; reward: number }[] = [];
  QUESTS.forEach((q) => {
    if (!nextProfile.bonus[q.id] && q.getValue(nextProfile, params.totalStationsCount) >= q.need) {
      nextProfile = {
        ...nextProfile,
        points: nextProfile.points + q.reward,
        bonus: { ...nextProfile.bonus, [q.id]: true },
      };
      newlyCompletedQuests.push({ name: q.name, reward: q.reward });
    }
  });

  // Save checkin log
  const logEntry: CheckinLog = {
    id: `chk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    uid: nextProfile.uid,
    userName: nextProfile.name,
    stationId: params.station.id,
    facultyId: nextProfile.facultyId,
    method: params.method,
    pts: finalPoints,
    timestamp: Date.now(),
  };

  try {
    const logs = loadLocalCheckinLogs();
    logs.unshift(logEntry);
    localStorage.setItem(LOCAL_CHECKINS_KEY, JSON.stringify(logs.slice(0, 300)));
  } catch {
    // Ignore
  }

  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, 'checkins'), {
        uid: logEntry.uid,
        userName: logEntry.userName,
        stationId: logEntry.stationId,
        facultyId: logEntry.facultyId,
        method: logEntry.method,
        pts: logEntry.pts,
        timestamp: logEntry.timestamp,
      });
    } catch {
      // Fallback local
    }
  }

  await syncProfileToCloud(nextProfile);
  await syncMemberPointsInParty(nextProfile);

  return {
    updatedProfile: nextProfile,
    finalPoints,
    crossFacultyBonus,
    qrBonus,
    newlyCompletedQuests,
  };
}

export async function recordStarPickup(
  profile: UserProfile,
  totalStationsCount: number
): Promise<{
  updatedProfile: UserProfile;
  newlyCompletedQuests: { name: string; reward: number }[];
}> {
  let nextProfile: UserProfile = {
    ...profile,
    stars: (profile.stars || 0) + 1,
    points: profile.points + 10,
    updatedAt: Date.now(),
  };

  const newlyCompletedQuests: { name: string; reward: number }[] = [];
  QUESTS.forEach((q) => {
    if (!nextProfile.bonus[q.id] && q.getValue(nextProfile, totalStationsCount) >= q.need) {
      nextProfile = {
        ...nextProfile,
        points: nextProfile.points + q.reward,
        bonus: { ...nextProfile.bonus, [q.id]: true },
      };
      newlyCompletedQuests.push({ name: q.name, reward: q.reward });
    }
  });

  await syncProfileToCloud(nextProfile);
  return { updatedProfile: nextProfile, newlyCompletedQuests };
}

export async function fetchLeaderboardData(
  currentProfile: UserProfile
): Promise<{
  individuals: PublicLeaderboardUser[];
  parties: PartyRoom[];
}> {
  let individuals = getLocalPublicUsers();

  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'users_public'),
        orderBy('points', 'desc'),
        limit(30)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        individuals = snap.docs.map((d) => d.data() as PublicLeaderboardUser);
      }
    } catch {
      // Fallback local
    }
  }

  // Ensure current player is always up-to-date in leaderboard list
  const meEntry: PublicLeaderboardUser = {
    uid: currentProfile.uid,
    name: currentProfile.name,
    mssv: currentProfile.mssv,
    facultyId: currentProfile.facultyId,
    avatar: currentProfile.avatar,
    points: currentProfile.points,
    unlockedCount: Object.keys(currentProfile.done || {}).length,
    partyId: currentProfile.partyId,
    updatedAt: Date.now(),
  };
  const filtered = individuals.filter((u) => u.uid !== currentProfile.uid);
  const mergedIndividuals = [...filtered, meEntry].sort((a, b) => b.points - a.points);

  const parties = loadLocalParties().sort((a, b) => b.totalPoints - a.totalPoints);
  return { individuals: mergedIndividuals, parties };
}
