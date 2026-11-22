import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_STATIONS } from './data/stations';

const memoryStore = new Map<string, string>();
if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (k: string) => (memoryStore.has(k) ? memoryStore.get(k)! : null),
      setItem: (k: string, v: string) => {
        memoryStore.set(k, String(v));
      },
      removeItem: (k: string) => {
        memoryStore.delete(k);
      },
      clear: () => {
        memoryStore.clear();
      },
    },
    configurable: true,
  });
}

beforeEach(() => {
  memoryStore.clear();
});
import {
  buildStationQrPayload,
  generateAnalyticsCsv,
  getAdminAnalytics,
} from './services/adminService';
import {
  ANTI_CHEAT_COOLDOWN_MS,
  calculateStationRewardPoints,
  checkAntiCheatCooldown,
  normalizeVietnameseAnswer,
  verifyStationQrPayload,
  verifyStationRiddle,
} from './services/gameService';
import {
  createPartyRoom,
  evaluateCrossFacultyBonus,
  getPartyByCode,
  joinPartyRoom,
  leavePartyRoom,
} from './services/partyService';
import {
  buildTelemetryFromCampus3D,
  campus3DToGps,
  detectBuildingAtPosition,
  distance3D,
  floorToElevationMeters,
  GpsKalmanFilter3D,
  gpsToCampus3D,
  resolveFloorFromElevation,
} from './services/gpsService';
import { TDC_GEO_ANCHORS } from './data/campusBuildings';
import { PartyMember, PartyRoom, UserProfile } from './types/game';

describe('TDC Travel Core Business Logic & Anti-Cheat Tests', () => {
  it('1. Normalizes Vietnamese riddle answers accurately (case, accents, punctuation)', () => {
    expect(normalizeVietnameseAnswer('  Kỹ Năng! ')).toBe('ky nang');
    expect(normalizeVietnameseAnswer('Đạo đức - Tri thức')).toBe('dao duc tri thuc');
  });

  it('2. Verifies real-world observation riddles at stations (O2O verification)', () => {
    const hallH = DEFAULT_STATIONS.find((s) => s.id === 'h')!;
    expect(verifyStationRiddle(hallH, 'Kỹ năng')).toBe(true);
    expect(verifyStationRiddle(hallH, 'ky nang')).toBe(true);
    expect(verifyStationRiddle(hallH, 'sai dap an')).toBe(false);
    expect(verifyStationRiddle(hallH, '   ')).toBe(false);
  });

  it('3. Verifies QR code payloads (both JSON Standee payload and direct secret token)', () => {
    const itStation = DEFAULT_STATIONS.find((s) => s.id === 'b_it')!;
    const jsonPayload = buildStationQrPayload(itStation);

    const resJson = verifyStationQrPayload(itStation, jsonPayload);
    expect(resJson.valid).toBe(true);

    const resToken = verifyStationQrPayload(itStation, 'tdc-qr-toab-cntt');
    expect(resToken.valid).toBe(true);

    const resInvalid = verifyStationQrPayload(itStation, 'WRONG-TOKEN-999');
    expect(resInvalid.valid).toBe(false);
  });

  it('4. Enforces Anti-Cheat Cooldown between consecutive real-world station unlocks', () => {
    const now = 1000000;
    const baseProfile: UserProfile = {
      uid: 'u1',
      name: 'SV Test',
      mssv: '26211TT0001',
      email: 'test@mail.tdc.edu.vn',
      facultyId: 'cntt',
      role: 'student',
      avatar: 0,
      points: 100,
      stars: 0,
      quizOk: 0,
      photos: 0,
      done: {
        g1: { pts: 60, unlockedAt: now - 1500, method: 'qr' },
      },
      bonus: {},
      updatedAt: now,
    };

    // Trying to unlock another station 1.5s later via QR should be blocked
    const blocked = checkAntiCheatCooldown(baseProfile, 'qr', now);
    expect(blocked.allowed).toBe(false);
    expect(blocked.waitSeconds).toBeGreaterThan(0);

    // After ANTI_CHEAT_COOLDOWN_MS, it should be allowed
    const allowed = checkAntiCheatCooldown(
      baseProfile,
      'qr',
      now + ANTI_CHEAT_COOLDOWN_MS + 100
    );
    expect(allowed.allowed).toBe(true);

    // Demo mode bypasses physical travel cooldown for classroom testing
    const demoAllowed = checkAntiCheatCooldown(baseProfile, 'demo', now);
    expect(demoAllowed.allowed).toBe(true);
  });

  it('5. Evaluates Cross-Faculty Party Bonus (+20%) when 2+ faculties team up', () => {
    const sameFacultyMembers: PartyMember[] = [
      { uid: '1', name: 'A', mssv: '1', facultyId: 'cntt', avatar: 0, points: 100 },
      { uid: '2', name: 'B', mssv: '2', facultyId: 'cntt', avatar: 1, points: 120 },
    ];
    const sameEval = evaluateCrossFacultyBonus(sameFacultyMembers);
    expect(sameEval.isCrossFaculty).toBe(false);
    expect(sameEval.bonusMultiplier).toBe(1.0);

    const crossFacultyMembers: PartyMember[] = [
      ...sameFacultyMembers,
      { uid: '3', name: 'C', mssv: '3', facultyId: 'dien_dt', avatar: 2, points: 150 },
    ];
    const crossEval = evaluateCrossFacultyBonus(crossFacultyMembers);
    expect(crossEval.isCrossFaculty).toBe(true);
    expect(crossEval.bonusMultiplier).toBe(1.2);
  });

  it('6. Calculates total station reward points with O2O QR bonus, Cross-Faculty bonus, and Campaign Event multiplier', () => {
    const crossParty: PartyRoom = {
      code: 'TDC123',
      hostUid: '1',
      name: 'Party',
      memberUids: ['1', '2'],
      members: [],
      isCrossFaculty: true,
      bonusMultiplier: 1.2,
      totalPoints: 200,
      createdAt: Date.now(),
    };

    const rewardNoEvent = calculateStationRewardPoints({
      basePoints: 100,
      party: crossParty,
      method: 'qr',
      eventMultiplier: 1.0,
    });

    expect(rewardNoEvent.qrBonus).toBe(15);
    expect(rewardNoEvent.crossFacultyBonus).toBe(20);
    expect(rewardNoEvent.eventBonus).toBe(0);
    expect(rewardNoEvent.finalPoints).toBe(135);

    const rewardWithEvent = calculateStationRewardPoints({
      basePoints: 100,
      party: crossParty,
      method: 'qr',
      eventMultiplier: 1.5,
    });
    expect(rewardWithEvent.eventBonus).toBe(50);
    expect(rewardWithEvent.finalPoints).toBe(185);
  });

  it('7. Generates Admin Analytics and valid CSV report', () => {
    const summary = getAdminAnalytics(DEFAULT_STATIONS);
    expect(summary.stationStats.length).toBe(DEFAULT_STATIONS.length);
    expect(summary.facultyStats.length).toBeGreaterThan(0);

    const csv = generateAnalyticsCsv(summary);
    expect(csv).toContain('BAO CAO THONG KE HE THONG TDC TRAVEL');
    expect(csv).toContain('Tòa D');
  });

  it('8. Removes departing member and recalculates party totalPoints & cross-faculty status on leavePartyRoom', async () => {
    const host: UserProfile = {
      uid: 'u_host',
      name: 'Host CNTT',
      mssv: '26211TT0010',
      email: 'host@mail.tdc.edu.vn',
      facultyId: 'cntt',
      role: 'student',
      avatar: 0,
      points: 200,
      stars: 0,
      quizOk: 0,
      photos: 0,
      done: {},
      bonus: {},
      updatedAt: Date.now(),
    };
    const guest: UserProfile = {
      ...host,
      uid: 'u_guest',
      name: 'Guest Điện',
      mssv: '26211DD0020',
      facultyId: 'dien_dt',
      points: 300,
    };

    const { room } = await createPartyRoom(host, 'Test Co-op Room');
    const joined = await joinPartyRoom(guest, room.code);
    expect(joined.room.members.length).toBe(2);
    expect(joined.room.isCrossFaculty).toBe(true);
    expect(joined.room.totalPoints).toBe(500);

    await leavePartyRoom(joined.updatedProfile);
    const afterLeave = await getPartyByCode(room.code);
    expect(afterLeave).not.toBeNull();
    expect(afterLeave!.members.length).toBe(1);
    expect(afterLeave!.isCrossFaculty).toBe(false);
    expect(afterLeave!.totalPoints).toBe(200);
  });

  it('9. Converts 3-Axis GPS (WGS84 Lat/Lng/Altitude) to Campus 3D (X, Y, Z) and back with sub-meter precision', () => {
    // Test round-trip conversion at Building D Floor 7 (x=56, y=25.2, z=28)
    const gps = campus3DToGps({ x: 56, y: 25.2, z: 28 });
    expect(gps.altitudeAsl).toBeCloseTo(TDC_GEO_ANCHORS.GROUND_ALTITUDE_ASL_M + 25.2, 2);

    const back3D = gpsToCampus3D({
      lat: gps.lat,
      lng: gps.lng,
      altitudeAsl: gps.altitudeAsl,
    });
    expect(back3D.x).toBeCloseTo(56, 0);
    expect(back3D.y).toBeCloseTo(25.2, 1);
    expect(back3D.z).toBeCloseTo(28, 0);
    expect(back3D.insideCampus).toBe(true);
  });

  it('10. Detects campus buildings and resolves multi-floor levels (B1 Basement to Floor 11) from 3D coordinates', () => {
    // Building D at (56, 28) supports Basement B1 (-1) up to Floor 11
    const bldD = detectBuildingAtPosition(56, 28);
    expect(bldD).not.toBeNull();
    expect(bldD!.id).toBe('bld_d');
    expect(bldD!.minFloor).toBe(-1);
    expect(bldD!.maxFloor).toBe(11);

    // Basement B1 (-4.2m)
    const floorB1 = resolveFloorFromElevation(-4.2, bldD);
    expect(floorB1.floor).toBe(-1);
    expect(floorB1.clampedY).toBeCloseTo(-4.2, 1);

    // Ground Floor 1 (0m)
    const floor1 = resolveFloorFromElevation(0.2, bldD);
    expect(floor1.floor).toBe(1);
    expect(floor1.clampedY).toBe(0);

    // Curved Podium Roof Floor 7 (+25.2m)
    const floor7 = resolveFloorFromElevation(25.2, bldD);
    expect(floor7.floor).toBe(7);
    expect(floor7.clampedY).toBeCloseTo(25.2, 1);

    // Top Floor 11 (+42.0m) - even if noisy GPS says +49m, clamps to maxFloor=11
    const floor11 = resolveFloorFromElevation(49.0, bldD);
    expect(floor11.floor).toBe(11);
    expect(floor11.clampedY).toBeCloseTo(42.0, 1);

    // Building B West Wing (IT Faculty) supports up to Floor 4
    const bldBWest = detectBuildingAtPosition(-108, -7);
    expect(bldBWest?.id).toBe('bld_b_west');
    expect(resolveFloorFromElevation(8.4, bldBWest).floor).toBe(3);
    expect(resolveFloorFromElevation(30.0, bldBWest).floor).toBe(4); // clamped to 4 floors
  });

  it('11. Filters 3-axis GPS noise with GpsKalmanFilter3D and computes 3D Euclidean distance across floors', () => {
    const kf = new GpsKalmanFilter3D();
    const first = kf.filter(56, 25.2, 28, 3, 4);
    expect(first).toEqual({ x: 56, y: 25.2, z: 28 });

    // Sudden GPS spike (+20m error) with poor accuracy (25m) should be strongly damped
    const damped = kf.filter(76, 45.2, 48, 25, 25);
    expect(damped.x).toBeLessThan(65);
    expect(damped.y).toBeLessThan(33);

    // 3D Euclidean distance between Floor 1 (y=0) and Floor 7 (y=25.2) at same (x, z)
    const d3 = distance3D({ x: 56, y: 0, z: 28 }, { x: 56, y: floorToElevationMeters(7), z: 28 });
    expect(d3).toBeCloseTo(25.2, 2);

    const telemetry = buildTelemetryFromCampus3D({
      x: -72,
      y: 12.6,
      z: -8,
      source: 'gps_calibrated',
    });
    expect(telemetry.detectedBuilding?.id).toBe('bld_b_east');
    expect(telemetry.detectedFloor).toBe(4);
  });

  it('12. Clamps lockedFloor to the detected building minFloor..maxFloor when moving between multi-floor buildings', () => {
    // If lockedFloor was 11 at Building D, and user moves to Building A1 (maxFloor = 3),
    // buildTelemetryFromCampus3D must clamp detectedFloor to 3 (+8.4m) instead of leaving avatar floating at Floor 11 (+42.0m)
    const telemetryAtA1 = buildTelemetryFromCampus3D({
      x: -109,
      y: 42.0,
      z: 58,
      lockedFloor: 11,
      source: 'gps_calibrated',
    });
    expect(telemetryAtA1.detectedBuilding?.id).toBe('bld_a1');
    expect(telemetryAtA1.detectedFloor).toBe(3);
    expect(telemetryAtA1.y).toBeCloseTo(8.4, 1);

    // If lockedFloor was -1 (Basement B1 at Building D), and user moves to Building C (minFloor = 1),
    // buildTelemetryFromCampus3D must clamp detectedFloor to 1 (0.0m)
    const telemetryAtC = buildTelemetryFromCampus3D({
      x: 84,
      y: -4.2,
      z: -11,
      lockedFloor: -1,
      source: 'gps_calibrated',
    });
    expect(telemetryAtC.detectedBuilding?.id).toBe('bld_c');
    expect(telemetryAtC.detectedFloor).toBe(1);
    expect(telemetryAtC.y).toBe(0);
  });
});
