import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FacultyId, PublicLeaderboardUser, UserProfile } from '../types/game';
import { auth, db, isFirebaseConfigured } from './firebase';

const LOCAL_PROFILE_KEY = 'tdc_go_profile_v2';
const LOCAL_PUBLIC_USERS_KEY = 'tdc_go_public_users_v2';

const SAMPLE_LEADERBOARD_USERS: PublicLeaderboardUser[] = [
  {
    uid: 'sample_1',
    name: 'Minh Anh',
    mssv: '24211TT0124',
    facultyId: 'cntt',
    avatar: 0,
    points: 1420,
    unlockedCount: 10,
    updatedAt: Date.now() - 3600000,
  },
  {
    uid: 'sample_2',
    name: 'Gia Huy',
    mssv: '24211DD0089',
    facultyId: 'dien_dt',
    avatar: 1,
    points: 1280,
    unlockedCount: 9,
    updatedAt: Date.now() - 7200000,
  },
  {
    uid: 'sample_3',
    name: 'Thảo Vy',
    mssv: '24211KT0215',
    facultyId: 'kinh_te',
    avatar: 2,
    points: 1150,
    unlockedCount: 8,
    updatedAt: Date.now() - 8400000,
  },
  {
    uid: 'sample_4',
    name: 'Quốc Bảo',
    mssv: '24211OT0042',
    facultyId: 'co_khi_oto',
    avatar: 0,
    points: 990,
    unlockedCount: 7,
    updatedAt: Date.now() - 9600000,
  },
  {
    uid: 'sample_5',
    name: 'Ngọc Hân',
    mssv: '24211NN0118',
    facultyId: 'ngoai_ngu',
    avatar: 2,
    points: 870,
    unlockedCount: 6,
    updatedAt: Date.now() - 12000000,
  },
  {
    uid: 'sample_6',
    name: 'Tuấn Kiệt',
    mssv: '24211CK0071',
    facultyId: 'co_khi_ctm',
    avatar: 1,
    points: 740,
    unlockedCount: 5,
    updatedAt: Date.now() - 15000000,
  },
  {
    uid: 'sample_7',
    name: 'Bảo Trâm',
    mssv: '24211DL0033',
    facultyId: 'du_lich',
    avatar: 2,
    points: 620,
    unlockedCount: 4,
    updatedAt: Date.now() - 18000000,
  },
];

export function loadLocalProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as UserProfile;
    if (p && typeof p === 'object' && p.uid) return p;
    return null;
  } catch {
    return null;
  }
}

export function saveLocalProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
    syncLocalPublicUser(profile);
  } catch {
    // Ignore storage error
  }
}

export function getLocalPublicUsers(): PublicLeaderboardUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_PUBLIC_USERS_KEY);
    if (!raw) {
      localStorage.setItem(
        LOCAL_PUBLIC_USERS_KEY,
        JSON.stringify(SAMPLE_LEADERBOARD_USERS)
      );
      return [...SAMPLE_LEADERBOARD_USERS];
    }
    const list = JSON.parse(raw) as PublicLeaderboardUser[];
    return Array.isArray(list) ? list : [...SAMPLE_LEADERBOARD_USERS];
  } catch {
    return [...SAMPLE_LEADERBOARD_USERS];
  }
}

export function syncLocalPublicUser(profile: UserProfile): void {
  try {
    const users = getLocalPublicUsers();
    const pub: PublicLeaderboardUser = {
      uid: profile.uid,
      name: profile.name,
      mssv: profile.mssv,
      facultyId: profile.facultyId,
      avatar: profile.avatar,
      points: profile.points,
      unlockedCount: Object.keys(profile.done || {}).length,
      partyId: profile.partyId,
      updatedAt: Date.now(),
    };
    const idx = users.findIndex((u) => u.uid === profile.uid);
    if (idx >= 0) users[idx] = pub;
    else users.push(pub);
    localStorage.setItem(LOCAL_PUBLIC_USERS_KEY, JSON.stringify(users));
  } catch {
    // Ignore storage error
  }
}

export async function syncProfileToCloud(profile: UserProfile): Promise<void> {
  saveLocalProfile(profile);
  if (!isFirebaseConfigured || !db) return;

  try {
    const privateData = {
      uid: profile.uid,
      name: profile.name,
      mssv: profile.mssv,
      email: profile.email || `${profile.mssv.toLowerCase()}@mail.tdc.edu.vn`,
      facultyId: profile.facultyId,
      role: profile.role,
      avatar: profile.avatar,
      points: profile.points,
      stars: profile.stars,
      quizOk: profile.quizOk,
      photos: profile.photos,
      done: profile.done,
      bonus: profile.bonus,
      ...(profile.partyId ? { partyId: profile.partyId } : {}),
      updatedAt: Date.now(),
    };
    await setDoc(doc(db, 'users', profile.uid), privateData, { merge: true });

    const publicData: PublicLeaderboardUser = {
      uid: profile.uid,
      name: profile.name,
      mssv: profile.mssv,
      facultyId: profile.facultyId,
      avatar: profile.avatar,
      points: profile.points,
      unlockedCount: Object.keys(profile.done || {}).length,
      ...(profile.partyId ? { partyId: profile.partyId } : {}),
      updatedAt: Date.now(),
    };
    await setDoc(doc(db, 'users_public', profile.uid), publicData, { merge: true });
  } catch (e) {
    console.warn('Cloud profile sync skipped/fallback:', e);
  }
}

export async function loginOrRegisterExplorer(params: {
  name: string;
  mssv: string;
  email?: string;
  password?: string;
  facultyId: FacultyId;
  avatar: number;
  mode: 'demo' | 'email_login' | 'email_register' | 'google';
}): Promise<UserProfile> {
  const cleanName = params.name.trim().slice(0, 32) || 'Tân binh TDC';
  const cleanMssv = params.mssv.trim().toUpperCase().slice(0, 16) || '26211TT0001';
  const cleanEmail =
    params.email?.trim() || `${cleanMssv.toLowerCase()}@mail.tdc.edu.vn`;

  if (isFirebaseConfigured && auth && db && params.mode !== 'demo') {
    let uid = '';
    if (params.mode === 'google') {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      uid = cred.user.uid;
    } else if (params.mode === 'email_register') {
      const cred = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        params.password || 'TdcGo2026!'
      );
      uid = cred.user.uid;
    } else if (params.mode === 'email_login') {
      const cred = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        params.password || 'TdcGo2026!'
      );
      uid = cred.user.uid;
    }

    if (uid) {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const existing = snap.data() as UserProfile;
        const merged: UserProfile = {
          ...existing,
          name: cleanName || existing.name,
          mssv: cleanMssv || existing.mssv,
          facultyId: params.facultyId || existing.facultyId,
          avatar: params.avatar,
          updatedAt: Date.now(),
        };
        await syncProfileToCloud(merged);
        return merged;
      }
      const fresh: UserProfile = {
        uid,
        name: cleanName,
        mssv: cleanMssv,
        email: cleanEmail,
        facultyId: params.facultyId,
        role: 'student',
        avatar: params.avatar,
        points: 0,
        stars: 0,
        quizOk: 0,
        photos: 0,
        done: {},
        bonus: {},
        pos: null,
        updatedAt: Date.now(),
      };
      await syncProfileToCloud(fresh);
      return fresh;
    }
  }

  // Local / Demo fallback
  const existingLocal = loadLocalProfile();
  if (existingLocal) {
    const updated: UserProfile = {
      ...existingLocal,
      name: cleanName,
      mssv: cleanMssv,
      email: cleanEmail,
      facultyId: params.facultyId,
      avatar: params.avatar,
      updatedAt: Date.now(),
    };
    saveLocalProfile(updated);
    return updated;
  }

  const demoProfile: UserProfile = {
    uid: `local_${cleanMssv.toLowerCase()}`,
    name: cleanName,
    mssv: cleanMssv,
    email: cleanEmail,
    facultyId: params.facultyId,
    role: 'student',
    avatar: params.avatar,
    points: 0,
    stars: 0,
    quizOk: 0,
    photos: 0,
    done: {},
    bonus: {},
    pos: null,
    updatedAt: Date.now(),
  };
  saveLocalProfile(demoProfile);
  return demoProfile;
}

export function resetExplorerProgress(profile: UserProfile): UserProfile {
  const reset: UserProfile = {
    ...profile,
    points: 0,
    stars: 0,
    quizOk: 0,
    photos: 0,
    done: {},
    bonus: {},
    pos: null,
    certClaimed: false,
    updatedAt: Date.now(),
  };
  void syncProfileToCloud(reset);
  return reset;
}

export async function logoutExplorer(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch {
      // Ignore
    }
  }
}
