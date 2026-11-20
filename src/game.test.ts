import { describe, expect, it } from 'vitest';
import { DEFAULT_STATIONS } from './data/stations';
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
import { evaluateCrossFacultyBonus } from './services/partyService';
import { PartyMember, PartyRoom, UserProfile } from './types/game';

describe('TDC GO Core Business Logic & Anti-Cheat Tests', () => {
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

  it('6. Calculates total station reward points with O2O QR bonus and Cross-Faculty bonus', () => {
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

    const reward = calculateStationRewardPoints({
      basePoints: 100,
      party: crossParty,
      method: 'qr',
    });

    expect(reward.qrBonus).toBe(15);
    expect(reward.crossFacultyBonus).toBe(20);
    expect(reward.finalPoints).toBe(135);
  });

  it('7. Generates Admin Analytics and valid CSV report', () => {
    const summary = getAdminAnalytics(DEFAULT_STATIONS);
    expect(summary.stationStats.length).toBe(DEFAULT_STATIONS.length);
    expect(summary.facultyStats.length).toBeGreaterThan(0);

    const csv = generateAnalyticsCsv(summary);
    expect(csv).toContain('BAO CAO THONG KE HE THONG TDC GO');
    expect(csv).toContain('Tòa D (11 tầng) & Cổng 2');
  });
});
