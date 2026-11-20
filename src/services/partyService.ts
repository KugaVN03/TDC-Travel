import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FACULTIES } from '../data/faculties';
import { FacultyId, PartyMember, PartyRoom, UserProfile } from '../types/game';
import { syncProfileToCloud } from './authService';
import { db, isFirebaseConfigured } from './firebase';

const LOCAL_PARTIES_KEY = 'tdc_go_parties_v2';

const SAMPLE_PARTIES: PartyRoom[] = [
  {
    code: 'TDC26A',
    hostUid: 'sample_1',
    name: 'Biệt đội Liên Khoa TDC',
    memberUids: ['sample_1', 'sample_2', 'sample_3'],
    members: [
      {
        uid: 'sample_1',
        name: 'Minh Anh',
        mssv: '24211TT0124',
        facultyId: 'cntt',
        avatar: 0,
        points: 1420,
      },
      {
        uid: 'sample_2',
        name: 'Gia Huy',
        mssv: '24211DD0089',
        facultyId: 'dien_dt',
        avatar: 1,
        points: 1280,
      },
      {
        uid: 'sample_3',
        name: 'Thảo Vy',
        mssv: '24211KT0215',
        facultyId: 'kinh_te',
        avatar: 2,
        points: 1150,
      },
    ],
    isCrossFaculty: true,
    bonusMultiplier: 1.2,
    totalPoints: 3850,
    createdAt: Date.now() - 7200000,
  },
  {
    code: 'CNTT99',
    hostUid: 'sample_4',
    name: 'Chiến thần Code & Cơ khí',
    memberUids: ['sample_4', 'sample_6'],
    members: [
      {
        uid: 'sample_4',
        name: 'Quốc Bảo',
        mssv: '24211OT0042',
        facultyId: 'co_khi_oto',
        avatar: 0,
        points: 990,
      },
      {
        uid: 'sample_6',
        name: 'Tuấn Kiệt',
        mssv: '24211CK0071',
        facultyId: 'co_khi_ctm',
        avatar: 1,
        points: 740,
      },
    ],
    isCrossFaculty: true,
    bonusMultiplier: 1.2,
    totalPoints: 1730,
    createdAt: Date.now() - 5400000,
  },
];

export function evaluateCrossFacultyBonus(members: PartyMember[]): {
  isCrossFaculty: boolean;
  bonusMultiplier: number;
} {
  const uniqueFaculties = new Set(members.map((m) => m.facultyId));
  const isCross = uniqueFaculties.size >= 2;
  return {
    isCrossFaculty: isCross,
    bonusMultiplier: isCross ? 1.2 : 1.0,
  };
}

export function loadLocalParties(): PartyRoom[] {
  try {
    const raw = localStorage.getItem(LOCAL_PARTIES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_PARTIES_KEY, JSON.stringify(SAMPLE_PARTIES));
      return [...SAMPLE_PARTIES];
    }
    const parsed = JSON.parse(raw) as PartyRoom[];
    return Array.isArray(parsed) ? parsed : [...SAMPLE_PARTIES];
  } catch {
    return [...SAMPLE_PARTIES];
  }
}

export function saveLocalParties(parties: PartyRoom[]): void {
  try {
    localStorage.setItem(LOCAL_PARTIES_KEY, JSON.stringify(parties));
  } catch {
    // Ignore
  }
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export async function getPartyByCode(code: string): Promise<PartyRoom | null> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return null;

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'parties', cleanCode));
      if (snap.exists()) return snap.data() as PartyRoom;
    } catch {
      // Fallback local
    }
  }
  const parties = loadLocalParties();
  return parties.find((p) => p.code === cleanCode) || null;
}

export async function createPartyRoom(
  profile: UserProfile,
  partyName: string
): Promise<{ room: PartyRoom; updatedProfile: UserProfile }> {
  const code = generateRoomCode();
  const hostMember: PartyMember = {
    uid: profile.uid,
    name: profile.name,
    mssv: profile.mssv,
    facultyId: profile.facultyId,
    avatar: profile.avatar,
    points: profile.points,
  };

  const room: PartyRoom = {
    code,
    hostUid: profile.uid,
    name: partyName.trim().slice(0, 45) || `Tổ đội của ${profile.name}`,
    memberUids: [profile.uid],
    members: [hostMember],
    isCrossFaculty: false,
    bonusMultiplier: 1.0,
    totalPoints: profile.points,
    createdAt: Date.now(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'parties', code), room);
    } catch {
      // Fallback local
    }
  }

  const parties = loadLocalParties().filter((p) => p.code !== code);
  parties.unshift(room);
  saveLocalParties(parties);

  const updatedProfile: UserProfile = {
    ...profile,
    partyId: code,
    updatedAt: Date.now(),
  };
  await syncProfileToCloud(updatedProfile);
  return { room, updatedProfile };
}

export async function joinPartyRoom(
  profile: UserProfile,
  codeInput: string
): Promise<{ room: PartyRoom; updatedProfile: UserProfile }> {
  const code = codeInput.trim().toUpperCase();
  const room = await getPartyByCode(code);
  if (!room) {
    throw new Error(`Không tìm thấy phòng Tổ đội với mã "${code}".`);
  }
  if (!room.memberUids.includes(profile.uid) && room.members.length >= 4) {
    throw new Error('Phòng Tổ đội này đã đủ tối đa 4 thành viên.');
  }

  const me: PartyMember = {
    uid: profile.uid,
    name: profile.name,
    mssv: profile.mssv,
    facultyId: profile.facultyId,
    avatar: profile.avatar,
    points: profile.points,
  };

  const filteredMembers = room.members.filter((m) => m.uid !== profile.uid);
  const nextMembers = [...filteredMembers, me];
  const nextUids = nextMembers.map((m) => m.uid);
  const { isCrossFaculty, bonusMultiplier } = evaluateCrossFacultyBonus(nextMembers);
  const totalPoints = nextMembers.reduce((sum, m) => sum + m.points, 0);

  const updatedRoom: PartyRoom = {
    ...room,
    memberUids: nextUids,
    members: nextMembers,
    isCrossFaculty,
    bonusMultiplier,
    totalPoints,
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'parties', code), updatedRoom);
    } catch {
      // Fallback local
    }
  }

  const parties = loadLocalParties();
  const idx = parties.findIndex((p) => p.code === code);
  if (idx >= 0) parties[idx] = updatedRoom;
  else parties.unshift(updatedRoom);
  saveLocalParties(parties);

  const updatedProfile: UserProfile = {
    ...profile,
    partyId: code,
    updatedAt: Date.now(),
  };
  await syncProfileToCloud(updatedProfile);

  return { room: updatedRoom, updatedProfile };
}

export async function simulateTeammateJoin(
  roomCode: string,
  currentFacultyId: FacultyId
): Promise<PartyRoom> {
  const room = await getPartyByCode(roomCode);
  if (!room) throw new Error('Không tìm thấy phòng tổ đội.');
  if (room.members.length >= 4) {
    throw new Error('Tổ đội đã đủ 4 thành viên.');
  }

  const otherFaculties = FACULTIES.filter((f) => f.id !== currentFacultyId);
  const pickedFaculty =
    otherFaculties[room.members.length % otherFaculties.length] || FACULTIES[1];
  const sampleNames = ['Hoàng Nam', 'Khánh Linh', 'Đức Trọng', 'Phương Thảo'];
  const idx = room.members.length;
  const teammate: PartyMember = {
    uid: `coop_ally_${Date.now()}`,
    name: sampleNames[idx % sampleNames.length],
    mssv: `25211${pickedFaculty.id.slice(0, 2).toUpperCase()}0${10 + idx}`,
    facultyId: pickedFaculty.id,
    avatar: idx % 3,
    points: 240 + idx * 80,
  };

  const nextMembers = [...room.members, teammate];
  const { isCrossFaculty, bonusMultiplier } = evaluateCrossFacultyBonus(nextMembers);
  const updatedRoom: PartyRoom = {
    ...room,
    memberUids: nextMembers.map((m) => m.uid),
    members: nextMembers,
    isCrossFaculty,
    bonusMultiplier,
    totalPoints: nextMembers.reduce((s, m) => s + m.points, 0),
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'parties', room.code), updatedRoom);
    } catch {
      // Ignore
    }
  }

  const parties = loadLocalParties();
  const pIdx = parties.findIndex((p) => p.code === room.code);
  if (pIdx >= 0) parties[pIdx] = updatedRoom;
  else parties.unshift(updatedRoom);
  saveLocalParties(parties);

  return updatedRoom;
}

export async function syncMemberPointsInParty(profile: UserProfile): Promise<PartyRoom | null> {
  if (!profile.partyId) return null;
  const room = await getPartyByCode(profile.partyId);
  if (!room) return null;

  const nextMembers = room.members.map((m) =>
    m.uid === profile.uid
      ? {
          ...m,
          name: profile.name,
          facultyId: profile.facultyId,
          avatar: profile.avatar,
          points: profile.points,
        }
      : m
  );
  const { isCrossFaculty, bonusMultiplier } = evaluateCrossFacultyBonus(nextMembers);
  const updatedRoom: PartyRoom = {
    ...room,
    members: nextMembers,
    isCrossFaculty,
    bonusMultiplier,
    totalPoints: nextMembers.reduce((s, m) => s + m.points, 0),
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'parties', room.code), updatedRoom);
    } catch {
      // Ignore
    }
  }

  const parties = loadLocalParties();
  const idx = parties.findIndex((p) => p.code === room.code);
  if (idx >= 0) parties[idx] = updatedRoom;
  saveLocalParties(parties);
  return updatedRoom;
}

export async function leavePartyRoom(profile: UserProfile): Promise<UserProfile> {
  if (profile.partyId) {
    const code = profile.partyId.trim().toUpperCase();
    const room = await getPartyByCode(code);
    if (room) {
      const nextMembers = room.members.filter((m) => m.uid !== profile.uid);
      const nextUids = nextMembers.map((m) => m.uid);
      const { isCrossFaculty, bonusMultiplier } = evaluateCrossFacultyBonus(nextMembers);
      const updatedRoom: PartyRoom = {
        ...room,
        hostUid: nextMembers[0]?.uid || room.hostUid,
        memberUids: nextUids,
        members: nextMembers,
        isCrossFaculty,
        bonusMultiplier,
        totalPoints: nextMembers.reduce((s, m) => s + m.points, 0),
      };

      if (isFirebaseConfigured && db && nextMembers.length > 0) {
        try {
          await setDoc(doc(db, 'parties', room.code), updatedRoom);
        } catch {
          // Ignore
        }
      }

      const parties = loadLocalParties();
      const idx = parties.findIndex((p) => p.code === room.code);
      if (idx >= 0) {
        if (nextMembers.length > 0) {
          parties[idx] = updatedRoom;
        } else {
          parties.splice(idx, 1);
        }
        saveLocalParties(parties);
      }
    }
  }

  const updated: UserProfile = {
    ...profile,
    partyId: undefined,
    updatedAt: Date.now(),
  };
  await syncProfileToCloud(updated);
  return updated;
}
