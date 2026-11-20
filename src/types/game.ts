export type FacultyId =
  | 'cntt'
  | 'dien_dt'
  | 'co_khi_oto'
  | 'co_khi_ctm'
  | 'kinh_te'
  | 'ngoai_ngu'
  | 'du_lich'
  | 'khac';

export interface Faculty {
  id: FacultyId;
  name: string;
  shortName: string;
  color: string;
  badgeColor: string;
}

export type StationType =
  | 'checkin'
  | 'photo'
  | 'quiz'
  | 'kick'
  | 'it_debug'
  | 'electric_circuit'
  | 'auto_engine';

export interface QuizItem {
  q: string;
  opts: string[];
  ans: number;
  ex: string;
}

export interface StationRiddle {
  prompt: string;
  answer: string;
  hint: string;
}

export interface Station {
  id: string;
  name: string;
  sub: string;
  facultyId: string;
  x: number;
  z: number;
  fogRadius: number;
  col: string;
  type: StationType;
  pts: number;
  badge: string;
  info: string;
  funFact: string;
  directions: string;
  qrSecretToken: string;
  riddle?: StationRiddle;
  questions?: QuizItem[];
  active: boolean;
}

export type VerificationMethod = 'qr' | 'riddle' | 'demo';

export interface UnlockedStationRecord {
  pts: number;
  unlockedAt: number;
  method: VerificationMethod;
  photoDataUrl?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  mssv: string;
  email: string;
  facultyId: FacultyId;
  role: 'student' | 'admin';
  avatar: number;
  points: number;
  stars: number;
  quizOk: number;
  photos: number;
  done: Record<string, UnlockedStationRecord>;
  bonus: Record<string, boolean>;
  partyId?: string;
  pos?: [number, number] | null;
  certClaimed?: boolean;
  updatedAt: number;
}

export interface PublicLeaderboardUser {
  uid: string;
  name: string;
  mssv: string;
  facultyId: FacultyId;
  avatar: number;
  points: number;
  unlockedCount: number;
  partyId?: string;
  updatedAt: number;
}

export interface PartyMember {
  uid: string;
  name: string;
  mssv: string;
  facultyId: FacultyId;
  avatar: number;
  points: number;
}

export interface PartyRoom {
  code: string;
  hostUid: string;
  name: string;
  memberUids: string[];
  members: PartyMember[];
  isCrossFaculty: boolean;
  bonusMultiplier: number;
  totalPoints: number;
  createdAt: number;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  need: number;
  reward: number;
  icon: StationType | 'star' | 'explorer' | 'party';
  col: string;
  getValue: (profile: UserProfile, totalStations: number) => number;
}

export interface CampaignEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  active: boolean;
  bonusMultiplier: number;
}

export interface CheckinLog {
  id: string;
  uid: string;
  userName: string;
  stationId: string;
  facultyId: FacultyId;
  method: VerificationMethod;
  pts: number;
  timestamp: number;
}
