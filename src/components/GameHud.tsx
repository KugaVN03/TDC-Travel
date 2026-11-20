import React, { useRef } from 'react';
import {
  ArrowUp,
  Award,
  HelpCircle,
  ListChecks,
  QrCode,
  Shield,
  Star,
  Trophy,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { QUESTS, TYPE_LABEL } from '../data/campusLayout';
import { getFacultyById } from '../data/faculties';
import { getAvatarSvg } from '../engine/chibiBuilder';
import {
  FloatingTextItem,
  GuideState,
  MinimapSnapshot,
} from '../engine/TdcCampusEngine';
import { PartyRoom, Station, UserProfile } from '../types/game';
import { MiniMap } from './MiniMap';
import { StationSticker } from './StationSticker';

interface GameHudProps {
  profile: UserProfile;
  party: PartyRoom | null;
  stations: Station[];
  nearStation: Station | null;
  guide: GuideState;
  minimapSnap: MinimapSnapshot | null;
  floatingTexts: FloatingTextItem[];
  muted: boolean;
  dimmed: boolean;
  pointsBump: boolean;
  onToggleMute: () => void;
  onOpenStation: (st: Station) => void;
  onNavigateGuide: () => void;
  onOpenQuests: () => void;
  onOpenLeaderboard: () => void;
  onOpenBadges: () => void;
  onOpenParty: () => void;
  onOpenQrScanner: () => void;
  onOpenHelp: () => void;
  onOpenAdmin: () => void;
  onJoystickChange: (x: number, y: number) => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  profile,
  party,
  stations,
  nearStation,
  guide,
  minimapSnap,
  floatingTexts,
  muted,
  dimmed,
  pointsBump,
  onToggleMute,
  onOpenStation,
  onNavigateGuide,
  onOpenQuests,
  onOpenLeaderboard,
  onOpenBadges,
  onOpenParty,
  onOpenQrScanner,
  onOpenHelp,
  onOpenAdmin,
  onJoystickChange,
}) => {
  const joyRef = useRef<HTMLDivElement | null>(null);
  const knobRef = useRef<HTMLElement | null>(null);
  const activePtrRef = useRef<number | null>(null);

  const activeStations = stations.filter((s) => s.active !== false);
  const unlockedCount = activeStations.filter((s) => profile.done?.[s.id] != null).length;
  const mapPct =
    activeStations.length > 0
      ? Math.round((unlockedCount / activeStations.length) * 100)
      : 0;
  const level = 1 + Math.floor(profile.points / 300);
  const xpPct = (profile.points % 300) / 3;
  const fac = getFacultyById(profile.facultyId);

  const hasClaimableQuest = QUESTS.some(
    (q) =>
      !profile.bonus?.[q.id] &&
      q.getValue(profile, activeStations.length) >=
        (q.id === 'all_stations' ? activeStations.length : q.need)
  );

  // Touch joystick handlers
  const updateJoyFromEvent = (e: React.PointerEvent) => {
    const el = joyRef.current;
    const kn = knobRef.current;
    if (!el || !kn) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const L = Math.hypot(dx, dy);
    const M = 46;
    if (L > M) {
      dx *= M / L;
      dy *= M / L;
    }
    kn.style.transform = `translate(${dx}px,${dy}px)`;
    onJoystickChange(dx / M, -dy / M);
  };

  const handleJoyDown = (e: React.PointerEvent) => {
    activePtrRef.current = e.pointerId;
    joyRef.current?.setPointerCapture(e.pointerId);
    updateJoyFromEvent(e);
  };

  const handleJoyMove = (e: React.PointerEvent) => {
    if (activePtrRef.current === e.pointerId) {
      updateJoyFromEvent(e);
    }
  };

  const handleJoyEnd = (e: React.PointerEvent) => {
    if (activePtrRef.current !== e.pointerId) return;
    activePtrRef.current = null;
    if (knobRef.current) knobRef.current.style.transform = '';
    onJoystickChange(0, 0);
  };

  const isNearDone = nearStation ? profile.done?.[nearStation.id] != null : false;

  return (
    <div id="hud" className={dimmed ? 'dim' : ''}>
      <div className="hud-top">
        {/* Top-left Explorer Profile Card */}
        <div className="flex flex-col gap-2">
          <div
            className="me card cursor-pointer"
            onClick={onOpenBadges}
            title="Xem Hồ sơ Thám hiểm & Bộ sưu tập Huy hiệu"
          >
            <div
              className="ava"
              dangerouslySetInnerHTML={{ __html: getAvatarSvg(profile.avatar) }}
            />
            <div className="me-txt">
              <div className="flex items-center gap-1.5">
                <b>{profile.name}</b>
                <span
                  className="px-1.5 py-0.2 rounded-full text-[10px] font-black"
                  style={{ backgroundColor: fac.badgeColor, color: fac.color }}
                >
                  {fac.shortName}
                </span>
              </div>
              <span>
                Cấp {level} · Mở bản đồ {mapPct}%
              </span>
              <div className="xp">
                <i style={{ width: `${xpPct}%` }} />
              </div>
            </div>
          </div>

          {/* Quick Party & QR Action Bar */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={onOpenQrScanner}
              className="px-3 py-1.5 rounded-full bg-[#00AEEF] text-white font-extrabold text-xs shadow-[0_3px_0_#0A7FC2] flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
              title="Quét Mã QR tại Trạm thực địa"
            >
              <QrCode className="w-3.5 h-3.5" /> Quét QR Trạm
            </button>

            <button
              type="button"
              onClick={onOpenParty}
              className={`px-3 py-1.5 rounded-full font-extrabold text-xs flex items-center gap-1.5 cursor-pointer active:translate-y-0.5 ${
                party
                  ? 'bg-emerald-600 text-white shadow-[0_3px_0_#1E6B38]'
                  : 'bg-white text-slate-800 shadow-[0_3px_0_rgba(28,64,42,.2)]'
              }`}
              title="Tổ đội Thám hiểm (Co-op 2-4 SV)"
            >
              <Users className="w-3.5 h-3.5" />
              {party
                ? `${party.code} (${party.members.length}/4)${party.isCrossFaculty ? ' +20%' : ''}`
                : 'Lập Tổ đội'}
            </button>
          </div>
        </div>

        {/* Top-right Points, Badges, Minimap & Action Buttons */}
        <div className="hud-right">
          <div className="pills">
            <button
              type="button"
              className={`pill pts ${pointsBump ? 'bump' : ''}`}
              onClick={onOpenLeaderboard}
              title="Bảng xếp hạng"
            >
              <span className="ic">
                <Star className="w-4 h-4 fill-current" />
              </span>
              <b>{profile.points.toLocaleString('vi-VN')}</b>
            </button>
            <button
              type="button"
              className="pill bdg"
              onClick={onOpenBadges}
              title="Bộ sưu tập Huy hiệu"
            >
              <span className="ic">
                <Award className="w-4 h-4" />
              </span>
              <b>
                {unlockedCount}/{activeStations.length}
              </b>
            </button>
          </div>

          <MiniMap
            stations={activeStations}
            unlocked={profile.done || {}}
            snapshot={minimapSnap}
            onClick={onOpenBadges}
          />

          <div className="side">
            <button
              type="button"
              className="rb"
              onClick={onOpenQuests}
              title="Nhiệm vụ"
              aria-label="Nhiệm vụ"
            >
              <ListChecks className="w-5 h-5" />
              {hasClaimableQuest && <span className="dot" />}
            </button>
            <button
              type="button"
              className="rb"
              onClick={onOpenLeaderboard}
              title="Bảng xếp hạng"
              aria-label="Bảng xếp hạng"
            >
              <Trophy className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="rb"
              onClick={onToggleMute}
              title="Tắt / Bật âm thanh"
              aria-label="Tắt hoặc bật âm thanh"
            >
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              type="button"
              className="rb"
              onClick={onOpenHelp}
              title="Hướng dẫn cách chơi"
              aria-label="Hướng dẫn cách chơi"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="rb"
              onClick={onOpenAdmin}
              title="Cổng Quản trị Admin CMS"
              aria-label="Quản trị hệ thống"
            >
              <Shield className="w-5 h-5 text-sky-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Interaction Card & Compass Guide */}
      <div className="hud-bot">
        {nearStation && !dimmed && (
          <div className="act card">
            <StationSticker
              col={nearStation.col}
              type={nearStation.type}
              size={52}
              done={isNearDone}
            />
            <div className="act-txt">
              <b>{nearStation.name}</b>
              <span>
                {isNearDone
                  ? 'Đã xóa sương mù · Xem lại Fun Fact & Lộ trình'
                  : `${TYPE_LABEL[nearStation.type]} · Tối đa +${nearStation.pts} điểm`}
              </span>
            </div>
            <button
              type="button"
              className={`btn ${isNearDone ? 'ghost' : 'sun'}`}
              onClick={() => onOpenStation(nearStation)}
            >
              {isNearDone ? 'Xem' : 'Khám phá'}
            </button>
          </div>
        )}

        <button type="button" className="guide" onClick={onNavigateGuide}>
          <span
            className="arr"
            style={{
              transform: `rotate(${guide.allDone ? 0 : guide.angleRad}rad)`,
            }}
          >
            <ArrowUp className="w-4 h-4 stroke-[3]" />
          </span>
          <span>
            {guide.allDone
              ? `Đã mở khóa ${activeStations.length}/${activeStations.length} trạm · Săn tiếp sao nhé!`
              : guide.station
                ? guide.distance < 6.8
                  ? `Bạn đang đứng tại ${guide.station.name}`
                  : `${guide.station.name} · cách ${Math.round(guide.distance)} m (Bấm để tự đi tới)`
                : 'Đang định vị trạm gần nhất...'}
          </span>
        </button>
      </div>

      {/* Mobile Touch Joystick */}
      <div
        id="joy"
        ref={joyRef}
        aria-hidden="true"
        onPointerDown={handleJoyDown}
        onPointerMove={handleJoyMove}
        onPointerUp={handleJoyEnd}
        onPointerCancel={handleJoyEnd}
      >
        <i ref={knobRef} />
      </div>

      {/* Desktop Keyboard Hints */}
      <p className="keys">
        <b>W A S D</b> hoặc phím mũi tên để đi · <b>Q E</b> xoay · kéo chuột để xoay, cuộn để phóng to · bấm xuống đất để tự đi tới đó
      </p>

      {/* Floating 3D Score Texts */}
      <div id="fx">
        {floatingTexts.map((ft) => (
          <div
            key={ft.id}
            className="fxt"
            style={{
              color: ft.color || undefined,
              opacity: ft.opacity,
              transform: `translate(${ft.x}px, ${ft.y}px) translate(-50%, -50%) scale(${ft.scale})`,
            }}
          >
            {ft.text}
          </div>
        ))}
      </div>
    </div>
  );
};
