import React, { useState } from 'react';
import {
  ArrowUp,
  Award,
  Building2,
  Compass,
  Crosshair,
  Eye,
  EyeOff,
  HelpCircle,
  Layers,
  ListChecks,
  Navigation,
  QrCode,
  Shield,
  SlidersHorizontal,
  Star,
  Trophy,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CAMPUS_BUILDINGS } from '../data/campusBuildings';
import { QUESTS, TYPE_LABEL } from '../data/campusLayout';
import { getFacultyById } from '../data/faculties';
import { getAvatarSvg } from '../engine/chibiBuilder';
import {
  FloatingTextItem,
  GuideState,
  MinimapSnapshot,
} from '../engine/TdcCampusEngine';
import { floorToElevationMeters } from '../services/gpsService';
import {
  CampusBuildingZone,
  GpsTelemetry3D,
  PartyRoom,
  Station,
  UserProfile,
} from '../types/game';
import { MiniMap } from './MiniMap';
import { StationSticker } from './StationSticker';

interface GameHudProps {
  profile: UserProfile;
  party: PartyRoom | null;
  stations: Station[];
  nearStation: Station | null;
  guide: GuideState;
  minimapSnap: MinimapSnapshot | null;
  gpsTelemetry: GpsTelemetry3D | null;
  cutawayMode: boolean;
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
  onSelectFloor: (floor: number | null) => void;
  onToggleCutaway: (enabled: boolean) => void;
  onCalibrateGroundZero: () => void;
  onTeleportGps3D: (x: number, y: number, z: number, label: string) => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  profile,
  party,
  stations,
  nearStation,
  guide,
  minimapSnap,
  gpsTelemetry,
  cutawayMode,
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
  onSelectFloor,
  onToggleCutaway,
  onCalibrateGroundZero,
  onTeleportGps3D,
}) => {
  const [showGpsCalibrationPanel, setShowGpsCalibrationPanel] = useState(false);

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

  const isNearDone = nearStation ? profile.done?.[nearStation.id] != null : false;

  const curBuilding: CampusBuildingZone | null = gpsTelemetry?.detectedBuilding || null;
  const curFloor = gpsTelemetry?.detectedFloor ?? 1;
  const curFloorSpec =
    curBuilding?.floors.find((f) => f.floor === curFloor) ||
    curBuilding?.floors[0] ||
    null;

  // Danh sách các tầng có thể chọn: nếu đang đứng tại một tòa nhà thì hiển thị đúng số tầng của tòa đó; ngược lại hiển thị toàn dải tầng của trường (-1..11)
  const floorList: number[] = curBuilding
    ? curBuilding.floors.map((f) => f.floor).sort((a, b) => b - a)
    : [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, -1];

  const handlePickBuildingAndFloor = (b: CampusBuildingZone, floorNum: number) => {
    const [x0, z0, x1, z1] = b.bounds;
    const cx = +((x0 + x1) / 2).toFixed(1);
    const cz = +((z0 + z1) / 2).toFixed(1);
    const cy = floorToElevationMeters(floorNum, b);
    onTeleportGps3D(cx, cy, cz, `${b.code} · Tầng ${floorNum === -1 ? 'Hầm B1' : floorNum}`);
  };

  return (
    <div id="hud" className={dimmed ? 'dim' : ''}>
      <div className="hud-top">
        {/* Top-left Explorer Profile Card + 3-Axis GPS Telemetry Card */}
        <div className="flex flex-col gap-2 max-w-[355px] sm:max-w-[390px]">
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

          {/* 3-Axis GPS (X, Y, Z) & Multi-Floor Telemetry Status Bar */}
          {gpsTelemetry && (
            <div className="bg-slate-900/92 text-white rounded-2xl p-2.5 border-2 border-sky-400/70 shadow-lg pointer-events-auto text-xs flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-black text-sky-300 uppercase tracking-wider text-[11px]">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  Định vị GPS 3 Trục (X · Y · Z)
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    gpsTelemetry.source === 'gps_hardware'
                      ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40'
                      : 'bg-sky-500/25 text-sky-200 border border-sky-400/40'
                  }`}
                >
                  ±{gpsTelemetry.accuracyMeters}m
                </span>
              </div>

              {/* Coordinates Grid: WGS84 Lat/Lng/Alt & Campus 3D X/Y/Z */}
              <div className="grid grid-cols-3 gap-1 bg-slate-800/90 rounded-xl px-2 py-1.5 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px]">TRỤC X (ĐÔNG/TÂY)</span>
                  <b className="text-sky-300">{gpsTelemetry.x >= 0 ? `+${gpsTelemetry.x}` : gpsTelemetry.x}m</b>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">TRỤC Z (NAM/BẮC)</span>
                  <b className="text-emerald-300">{gpsTelemetry.z >= 0 ? `+${gpsTelemetry.z}` : gpsTelemetry.z}m</b>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">CAO ĐỘ Y / TẦNG</span>
                  <b className="text-amber-300">
                    {gpsTelemetry.y >= 0 ? `+${gpsTelemetry.y}` : gpsTelemetry.y}m (
                    {curFloor === -1 ? 'B1' : `T${curFloor}`})
                  </b>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-300 font-semibold px-0.5">
                <span>
                  WGS84: {gpsTelemetry.lat.toFixed(5)}°N, {gpsTelemetry.lng.toFixed(5)}°E
                </span>
                <span>ASL: {gpsTelemetry.altitudeAsl ?? 12.0}m</span>
              </div>

              {/* Current Building & Floor Department Inspector */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-2 flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-extrabold text-amber-300 flex items-center gap-1 truncate">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    {curBuilding
                      ? `${curBuilding.name}`
                      : 'Khuôn viên Ngoài trời · Sân trường TDC'}
                  </span>
                </div>
                {curFloorSpec ? (
                  <>
                    <div className="text-[11px] font-extrabold text-white">
                      📍 {curFloorSpec.label}: {curFloorSpec.departments}
                    </div>
                    <div className="text-[10px] text-slate-300">
                      💡 {curFloorSpec.highlights}
                    </div>
                  </>
                ) : (
                  <div className="text-[10px] text-slate-300">
                    Đang ở độ cao mặt sân chuẩn (Tầng 1 · 0.0m). Tiến vào tòa nhà hoặc chọn tầng bên trái để khám phá phân tầng 3D.
                  </div>
                )}
              </div>

              {/* Action buttons for GPS Calibration & Floor Cutaway */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => onToggleCutaway(!cutawayMode)}
                  className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] flex items-center gap-1 cursor-pointer ${
                    cutawayMode
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-700 hover:bg-slate-600 text-sky-200'
                  }`}
                  title="Cắt lớp mặt bằng 3D của tầng đang chọn để quan sát bên trong"
                >
                  {cutawayMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {cutawayMode ? 'Đang Cắt lớp 3D' : 'Cắt lớp Tầng 3D'}
                </button>

                <button
                  type="button"
                  onClick={onCalibrateGroundZero}
                  className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-emerald-300 font-extrabold text-[11px] flex items-center gap-1 cursor-pointer"
                  title="Hiệu chuẩn áp kế / cao độ GPS mặt đất hiện tại về 0.0m (Tầng 1)"
                >
                  <Crosshair className="w-3.5 h-3.5" /> Chuẩn 0m
                </button>

                <button
                  type="button"
                  onClick={() => setShowGpsCalibrationPanel(!showGpsCalibrationPanel)}
                  className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] flex items-center gap-1 cursor-pointer ${
                    showGpsCalibrationPanel
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  }`}
                  title="Chọn nhanh Tòa nhà & Tầng để khám phá hoặc hiệu chuẩn vị trí GPS trong nhà"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Chọn Tòa/Tầng
                </button>
              </div>
            </div>
          )}

          {/* Expandable Building & Multi-Floor Explorer / Indoor GPS Calibration Panel */}
          {showGpsCalibrationPanel && (
            <div className="bg-white/95 border-2 border-sky-400 rounded-2xl p-3 shadow-xl pointer-events-auto text-xs flex flex-col gap-2 max-h-[42vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <b className="text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-600" />
                  Khám phá Phân tầng Tòa nhà (X · Y · Z)
                </b>
                <button
                  type="button"
                  onClick={() => setShowGpsCalibrationPanel(false)}
                  className="text-slate-500 hover:text-slate-800 font-extrabold cursor-pointer"
                >
                  Đóng ✕
                </button>
              </div>
              <p className="m-0 text-[11px] text-slate-600 font-semibold">
                Khi đi vào trong tòa nhà bê tông nhiều tầng (sóng GPS suy giảm), bạn có thể chọn đúng Tòa nhà & Tầng đang đứng để đồng bộ chính xác trục X-Y-Z:
              </p>
              <div className="flex flex-col gap-2">
                {CAMPUS_BUILDINGS.map((b) => (
                  <div
                    key={b.id}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800">{b.name}</span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                        style={{ backgroundColor: b.color }}
                      >
                        {b.minFloor === -1 ? `Hầm B1 → T${b.maxFloor}` : `${b.maxFloor} Tầng`}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {b.floors.map((fl) => {
                        const isCur =
                          curBuilding?.id === b.id && curFloor === fl.floor;
                        return (
                          <button
                            key={fl.floor}
                            type="button"
                            onClick={() => handlePickBuildingAndFloor(b, fl.floor)}
                            className={`px-2 py-1 rounded-lg font-extrabold text-[11px] cursor-pointer transition-all ${
                              isCur
                                ? 'bg-sky-600 text-white shadow'
                                : 'bg-white border border-slate-300 text-slate-700 hover:border-sky-400'
                            }`}
                            title={`${fl.label}: ${fl.departments}`}
                          >
                            {fl.floor === -1 ? 'Hầm B1 (-4.2m)' : `Tầng ${fl.floor} (+${fl.elevationMeters.toFixed(1)}m)`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              title="Hướng dẫn Định vị GPS 3D & Phân tầng"
              aria-label="Hướng dẫn"
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

      {/* Left-side Vertical 3D Floor Elevator Selector Bar (Z/Y Axis Explorer) */}
      <div className="fixed left-3 bottom-20 z-20 pointer-events-auto flex flex-col items-center bg-slate-900/90 text-white p-1.5 rounded-2xl border-2 border-sky-400/60 shadow-lg gap-1 max-h-[48vh] overflow-y-auto">
        <span className="text-[9px] font-black uppercase tracking-wider text-sky-300 px-1">
          Tầng 3D
        </span>
        {floorList.map((fl) => {
          const isSelected = curFloor === fl;
          return (
            <button
              key={fl}
              type="button"
              onClick={() => onSelectFloor(fl)}
              className={`w-9 h-7 rounded-xl font-black text-xs flex items-center justify-center cursor-pointer transition-all ${
                isSelected
                  ? 'bg-sky-500 text-white shadow-[0_0_10px_#00AEEF] scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={
                fl === -1
                  ? 'Tầng Hầm B1 (-4.2m)'
                  : `Tầng ${fl} (+${((fl - 1) * 4.2).toFixed(1)}m)`
              }
            >
              {fl === -1 ? 'B1' : `T${fl}`}
            </button>
          );
        })}
      </div>

      {/* Bottom Interaction Card & 3D GPS Compass Guide */}
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
              <b>
                {nearStation.name}{' '}
                {nearStation.floor
                  ? `(Tầng ${nearStation.floor === -1 ? 'B1' : nearStation.floor})`
                  : ''}
              </b>
              <span>
                {isNearDone
                  ? 'Đã xóa sương mù · Xem lại thông tin & lộ trình'
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

        <button
          type="button"
          className="guide"
          onClick={onNavigateGuide}
          title="Bấm để đồng bộ định vị GPS 3D tới trạm mục tiêu gần nhất"
        >
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
              ? `Đã định vị & mở khóa 100% (${activeStations.length}/${activeStations.length}) trạm khuôn viên TDC!`
              : guide.station
                ? guide.distance < 9.5
                  ? `Đã định vị tại ${guide.station.name} (Tầng ${guide.station.floor || 1})`
                  : `${guide.station.name} (Tầng ${guide.station.floor || 1}) · cách ${Math.round(guide.distance)}m 3D (${
                      guide.deltaFloor === 0
                        ? 'Cùng tầng'
                        : guide.deltaFloor > 0
                          ? `Lên ${guide.deltaFloor} tầng`
                          : `Xuống ${Math.abs(guide.deltaFloor)} tầng`
                    }) · Bấm để định vị tới`
                : 'Đang quét tọa độ GPS trạm gần nhất...'}
          </span>
        </button>
      </div>

      {/* Desktop / Mobile 3D Camera & GPS Hint */}
      <p className="keys">
        <Compass className="w-3.5 h-3.5 inline mr-1 text-sky-600" />
        <b>Định vị GPS 3 Trục (X-Y-Z):</b> Tự động bám theo vị trí & cao độ GPS · Chọn <b>Tầng 3D (B1 → T11)</b> ở thanh bên trái · Kéo để xoay góc nhìn 3D, cuộn để thu phóng
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
