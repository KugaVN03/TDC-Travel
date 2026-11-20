import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GameHud } from './components/GameHud';
import { Viewfinder } from './components/minigames/Viewfinder';
import { CertificateModal } from './components/modals/CertificateModal';
import { HelpModal } from './components/modals/HelpModal';
import { LeaderboardModal } from './components/modals/LeaderboardModal';
import { PartyModal } from './components/modals/PartyModal';
import { ProfileBadgesModal } from './components/modals/ProfileBadgesModal';
import { QuestsModal } from './components/modals/QuestsModal';
import { QrScannerModal } from './components/QrScannerModal';
import { StartScreen } from './components/StartScreen';
import { StationModal } from './components/StationModal';
import { audioSfx } from './engine/audioSfx';
import {
  FloatingTextItem,
  GuideState,
  MinimapSnapshot,
  TdcCampusEngine,
} from './engine/TdcCampusEngine';
import { AdminDashboard } from './pages/AdminDashboard';
import {
  fetchStationsFromCloudOrLocal,
  loadStations,
} from './services/adminService';
import {
  loadLocalProfile,
  loginOrRegisterExplorer,
  resetExplorerProgress,
  saveLocalProfile,
} from './services/authService';
import {
  recordStarPickup,
  recordStationUnlock,
  verifyStationQrPayload,
} from './services/gameService';
import {
  createPartyRoom,
  getPartyByCode,
  joinPartyRoom,
  leavePartyRoom,
  simulateTeammateJoin,
} from './services/partyService';
import {
  FacultyId,
  PartyRoom,
  Station,
  UserProfile,
  VerificationMethod,
} from './types/game';

interface ToastItem {
  id: number;
  text: string;
  gold?: boolean;
}

type ActiveModal =
  | null
  | { type: 'station'; station: Station; preverifiedMethod?: VerificationMethod | null }
  | { type: 'qr'; targetStation?: Station | null }
  | { type: 'quests' }
  | { type: 'leaderboard' }
  | { type: 'badges' }
  | { type: 'party' }
  | { type: 'help' }
  | { type: 'certificate' };

export const App: React.FC = () => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<TdcCampusEngine | null>(null);

  const [stations, setStations] = useState<Station[]>(() => loadStations());
  const [profile, setProfile] = useState<UserProfile | null>(() => loadLocalProfile());
  const [party, setParty] = useState<PartyRoom | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAdmin, setShowAdmin] = useState(
    () => window.location.pathname === '/admin' || window.location.hash === '#admin'
  );

  const [nearStation, setNearStation] = useState<Station | null>(null);
  const [guide, setGuide] = useState<GuideState>({
    station: null,
    distance: 0,
    angleRad: 0,
    allDone: false,
  });
  const [minimapSnap, setMinimapSnap] = useState<MinimapSnapshot | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextItem[]>([]);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const [photoMode, setPhotoMode] = useState<{
    station: Station;
    method: VerificationMethod;
  } | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [muted, setMuted] = useState(false);
  const [pointsBump, setPointsBump] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const profileRef = useRef<UserProfile | null>(profile);
  profileRef.current = profile;
  const stationsRef = useRef<Station[]>(stations);
  stationsRef.current = stations;
  const partyRef = useRef<PartyRoom | null>(party);
  partyRef.current = party;

  const pushToast = useCallback((text: string, gold = false) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev.slice(-2), { id, text, gold }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const triggerPointsBump = useCallback(() => {
    setPointsBump(false);
    setTimeout(() => setPointsBump(true), 15);
  }, []);

  // Load stations & existing party on mount
  useEffect(() => {
    void fetchStationsFromCloudOrLocal().then((list) => {
      setStations(list);
    });
    if (profile?.partyId) {
      void getPartyByCode(profile.partyId).then((r) => {
        if (r) setParty(r);
      });
    }
  }, []);

  // Mount Three.js 3D Engine
  useEffect(() => {
    const container = stageRef.current;
    if (!container) return;

    const engine = new TdcCampusEngine(
      container,
      stationsRef.current,
      profileRef.current?.done || {},
      {
        onNearStationChange: (st) => setNearStation(st),
        onOpenStationRequest: (st) => {
          audioSfx.play('tap');
          setActiveModal({ type: 'station', station: st });
        },
        onStarCollected: () => {
          const cur = profileRef.current;
          if (!cur) return;
          const prevLevel = 1 + Math.floor(cur.points / 300);
          const activeCount = stationsRef.current.filter((s) => s.active !== false).length;
          void recordStarPickup(cur, activeCount).then(
            ({ updatedProfile, newlyCompletedQuests }) => {
              setProfile(updatedProfile);
              triggerPointsBump();
              const nextLevel = 1 + Math.floor(updatedProfile.points / 300);
              if (nextLevel > prevLevel) {
                pushToast(`🎉 Thăng cấp ${nextLevel}!`, true);
                audioSfx.play('badge');
              }
              newlyCompletedQuests.forEach((q) => {
                pushToast(`Hoàn thành nhiệm vụ: ${q.name} · +${q.reward}đ`, true);
              });
            }
          );
        },
        onPlayerMoveSave: (pos) => {
          const cur = profileRef.current;
          if (!cur) return;
          const updated: UserProfile = { ...cur, pos };
          setProfile(updated);
          saveLocalProfile(updated);
        },
        onFloatingTextsUpdate: (items) => setFloatingTexts(items),
        onGuideUpdate: (g) => setGuide(g),
        onMinimapUpdate: (snap) => setMinimapSnap(snap),
      }
    );

    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [pushToast, triggerPointsBump]);

  // Sync stations and unlocked fog of war with 3D engine
  useEffect(() => {
    engineRef.current?.updateStationsAndProgress(stations, profile?.done || {});
  }, [stations, profile?.done]);

  // Pause 3D movement when modal or admin is open
  useEffect(() => {
    engineRef.current?.setPaused(Boolean(activeModal) || showAdmin);
  }, [activeModal, showAdmin]);

  const handleStartGame = async (params: {
    name: string;
    mssv: string;
    email?: string;
    password?: string;
    facultyId: FacultyId;
    avatar: number;
    mode: 'demo' | 'email_login' | 'email_register' | 'google';
  }) => {
    const loggedIn = await loginOrRegisterExplorer(params);
    setProfile(loggedIn);
    if (loggedIn.partyId) {
      const p = await getPartyByCode(loggedIn.partyId);
      setParty(p);
    }
    const unlockedCount = Object.keys(loggedIn.done || {}).length;
    engineRef.current?.startPlayer(
      loggedIn.name,
      loggedIn.avatar,
      loggedIn.pos,
      unlockedCount > 0
    );
    setIsPlaying(true);
    audioSfx.play('ok');
    pushToast(
      unlockedCount > 0
        ? `Chào mừng trở lại, ${loggedIn.name} (${loggedIn.mssv})!`
        : `Chào ${loggedIn.name}! Hãy tiến tới Cổng 1 ngay trước mặt để xóa sương mù đầu tiên.`,
      true
    );
  };

  const handleResetProgress = () => {
    if (!profile) return;
    const reset = resetExplorerProgress(profile);
    setProfile(reset);
    pushToast('Đã đặt lại tiến độ và phủ lại lớp sương mù toàn trường!');
  };

  const handleCompleteStation = async (params: {
    station: Station;
    basePoints: number;
    method: VerificationMethod;
    isQuizOrGameSuccess: boolean;
    summaryHtml?: string;
    photoDataUrl?: string;
  }) => {
    if (!profile) {
      return { finalPoints: params.basePoints, crossFacultyBonus: 0, qrBonus: 0 };
    }
    const prevLevel = 1 + Math.floor(profile.points / 300);
    const activeCount = stations.filter((s) => s.active !== false).length;

    const {
      updatedProfile,
      finalPoints,
      crossFacultyBonus,
      qrBonus,
      newlyCompletedQuests,
    } = await recordStationUnlock({
      profile,
      station: params.station,
      baseEarnedPoints: params.basePoints,
      method: params.method,
      party,
      photoDataUrl: params.photoDataUrl,
      isQuizOrGameSuccess: params.isQuizOrGameSuccess,
      totalStationsCount: activeCount,
    });

    setProfile(updatedProfile);
    if (updatedProfile.partyId) {
      const updatedParty = await getPartyByCode(updatedProfile.partyId);
      if (updatedParty) setParty(updatedParty);
    }

    audioSfx.play('unlock');
    engineRef.current?.celebrateStationUnlock(params.station, `+${finalPoints}`);
    triggerPointsBump();

    const nextLevel = 1 + Math.floor(updatedProfile.points / 300);
    if (nextLevel > prevLevel) {
      pushToast(`🎉 Thăng cấp ${nextLevel}!`, true);
    }
    newlyCompletedQuests.forEach((q) => {
      pushToast(`Hoàn thành nhiệm vụ: ${q.name} · +${q.reward}đ`, true);
    });

    return { finalPoints, crossFacultyBonus, qrBonus };
  };

  const handleRequestPhotoMode = (station: Station, method: VerificationMethod) => {
    setActiveModal(null);
    setPhotoMode({ station, method });
    engineRef.current?.enterPhotoMode(station);
  };

  const handleCapturePhoto = async () => {
    if (!photoMode || !profile) return;
    const dataUrl = engineRef.current?.capturePhotoDataUrl() || '';
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 500);
    audioSfx.tone([1800, 1200], 0.05, 'square', 0.04, 0.04);

    const { station, method } = photoMode;
    engineRef.current?.exitPhotoMode();
    setPhotoMode(null);

    await handleCompleteStation({
      station,
      basePoints: station.pts,
      method,
      isQuizOrGameSuccess: true,
      photoDataUrl: dataUrl,
    });

    setActiveModal({ type: 'station', station });
  };

  const handleQrDetected = (rawCode: string) => {
    const target =
      activeModal?.type === 'qr' && activeModal.targetStation
        ? activeModal.targetStation
        : null;

    if (target) {
      const res = verifyStationQrPayload(target, rawCode);
      if (res.valid) {
        audioSfx.play('ok');
        pushToast(res.message, true);
        setActiveModal({
          type: 'station',
          station: target,
          preverifiedMethod: 'qr',
        });
        return;
      }
    }

    // Try matching across any station on campus
    for (const st of stations) {
      const check = verifyStationQrPayload(st, rawCode);
      if (check.valid) {
        audioSfx.play('ok');
        pushToast(`Đã định vị & xác thực QR trạm: ${st.name}!`, true);
        engineRef.current?.navigateToStation(st);
        setActiveModal({
          type: 'station',
          station: st,
          preverifiedMethod: 'qr',
        });
        return;
      }
    }

    audioSfx.play('bad');
    pushToast('Mã QR không hợp lệ hoặc không khớp với trạm nào tại TDC.');
  };

  const activeStationsCount = stations.filter((s) => s.active !== false).length;

  return (
    <div id="app">
      {/* 3D WebGL Campus Canvas Container */}
      <div id="stage" ref={stageRef} />

      {/* Start Screen */}
      {!isPlaying && !showAdmin && (
        <StartScreen
          existingProfile={profile}
          totalStations={activeStationsCount}
          onStartGame={handleStartGame}
          onResetProgress={handleResetProgress}
          onOpenAdmin={() => setShowAdmin(true)}
        />
      )}

      {/* Main Game HUD */}
      {isPlaying && profile && !showAdmin && (
        <GameHud
          profile={profile}
          party={party}
          stations={stations}
          nearStation={nearStation}
          guide={guide}
          minimapSnap={minimapSnap}
          floatingTexts={floatingTexts}
          muted={muted}
          dimmed={Boolean(photoMode)}
          pointsBump={pointsBump}
          onToggleMute={() => {
            const next = audioSfx.toggleMute();
            setMuted(next);
          }}
          onOpenStation={(st) => {
            audioSfx.play('tap');
            setActiveModal({ type: 'station', station: st });
          }}
          onNavigateGuide={() => {
            if (guide.station) {
              engineRef.current?.navigateToStation(guide.station);
              pushToast(`Đang di chuyển tới ${guide.station.name}...`);
            }
          }}
          onOpenQuests={() => setActiveModal({ type: 'quests' })}
          onOpenLeaderboard={() => setActiveModal({ type: 'leaderboard' })}
          onOpenBadges={() => setActiveModal({ type: 'badges' })}
          onOpenParty={() => setActiveModal({ type: 'party' })}
          onOpenQrScanner={() =>
            setActiveModal({ type: 'qr', targetStation: nearStation })
          }
          onOpenHelp={() => setActiveModal({ type: 'help' })}
          onOpenAdmin={() => setShowAdmin(true)}
          onJoystickChange={(x, y) => engineRef.current?.setJoystick(x, y)}
        />
      )}

      {/* 3D Polaroid Viewfinder */}
      <Viewfinder
        station={photoMode?.station || null}
        onRotate={() => engineRef.current?.rotatePhotoCamera()}
        onCapture={handleCapturePhoto}
        onCancel={() => {
          engineRef.current?.exitPhotoMode();
          setPhotoMode(null);
        }}
      />

      {showFlash && <div id="flash" />}

      {/* Toasts */}
      <div id="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.gold ? 'gold' : ''}`}>
            {t.text}
          </div>
        ))}
      </div>

      {/* Active Modals */}
      {activeModal?.type === 'station' && profile && (
        <StationModal
          station={activeModal.station}
          profile={profile}
          party={party}
          totalStations={activeStationsCount}
          nextStationName={guide.station?.name}
          preverifiedMethod={activeModal.preverifiedMethod}
          onClose={() => setActiveModal(null)}
          onOpenQrScanner={(st) =>
            setActiveModal({ type: 'qr', targetStation: st })
          }
          onRequestPhotoMode={handleRequestPhotoMode}
          onCompleteStation={handleCompleteStation}
          onShowCertificate={() => setActiveModal({ type: 'certificate' })}
        />
      )}

      {activeModal?.type === 'qr' && (
        <QrScannerModal
          stations={stations}
          targetStation={activeModal.targetStation}
          onClose={() => setActiveModal(null)}
          onQrDetected={handleQrDetected}
        />
      )}

      {activeModal?.type === 'quests' && profile && (
        <QuestsModal
          profile={profile}
          totalStations={activeStationsCount}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal?.type === 'leaderboard' && profile && (
        <LeaderboardModal
          profile={profile}
          totalStations={activeStationsCount}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal?.type === 'badges' && profile && (
        <ProfileBadgesModal
          profile={profile}
          stations={stations}
          onClose={() => setActiveModal(null)}
          onOpenCertificate={() => setActiveModal({ type: 'certificate' })}
        />
      )}

      {activeModal?.type === 'party' && profile && (
        <PartyModal
          profile={profile}
          party={party}
          onClose={() => setActiveModal(null)}
          onCreateParty={async (pName) => {
            const { room, updatedProfile } = await createPartyRoom(profile, pName);
            setParty(room);
            setProfile(updatedProfile);
            pushToast(`Đã tạo Tổ đội "${room.name}" (Mã: ${room.code})!`, true);
          }}
          onJoinParty={async (code) => {
            const { room, updatedProfile } = await joinPartyRoom(profile, code);
            setParty(room);
            setProfile(updatedProfile);
            pushToast(
              `Đã gia nhập Tổ đội "${room.name}"${room.isCrossFaculty ? ' · Kích hoạt +20% Điểm Liên Khoa!' : ''}`,
              true
            );
          }}
          onLeaveParty={async () => {
            const updated = await leavePartyRoom(profile);
            setParty(null);
            setProfile(updated);
            pushToast('Đã rời khỏi phòng Tổ đội.');
          }}
          onSimulateTeammate={async () => {
            if (!party) return;
            const updatedRoom = await simulateTeammateJoin(
              party.code,
              profile.facultyId
            );
            setParty(updatedRoom);
            pushToast(
              `Đồng đội mới đã vào phòng! ${updatedRoom.isCrossFaculty ? '⚡ Kích hoạt +20% Điểm Liên Khoa!' : ''}`,
              true
            );
          }}
        />
      )}

      {activeModal?.type === 'help' && (
        <HelpModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal?.type === 'certificate' && profile && (
        <CertificateModal
          profile={profile}
          stations={stations}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Admin CMS Dashboard */}
      {showAdmin && (
        <AdminDashboard
          stations={stations}
          onStationsUpdated={(next) => setStations(next)}
          onBackToGame={() => setShowAdmin(false)}
        />
      )}
    </div>
  );
};
