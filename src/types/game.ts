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
  y?: number;
  z: number;
  floor?: number;
  buildingId?: string;
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

export interface BuildingFloorSpec {
  floor: number;
  label: string;
  elevationMeters: number;
  departments: string;
  highlights: string;
}

export interface CampusBuildingZone {
  id: string;
  code: string;
  name: string;
  bounds: [number, number, number, number]; // [x0, z0, x1, z1]
  minFloor: number;
  maxFloor: number;
  floorHeightMeters: number;
  color: string;
  floors: BuildingFloorSpec[];
}

export interface GpsTelemetry3D {
  lat: number;
  lng: number;
  altitudeAsl: number | null;
  accuracyMeters: number;
  altitudeAccuracyMeters: number | null;
  headingDeg: number | null;
  speedMps: number | null;
  x: number;
  y: number;
  z: number;
  detectedFloor: number;
  detectedBuilding: CampusBuildingZone | null;
  insideCampus: boolean;
  source: 'gps_hardware' | 'gps_calibrated' | 'manual_override';
  timestamp: number;
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
  pos?: [number, number] | [number, number, number] | null;
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
