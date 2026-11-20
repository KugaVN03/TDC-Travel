import React from 'react';
import { Award, Compass, ShieldCheck, X } from 'lucide-react';
import { getFacultyById } from '../../data/faculties';
import { getAvatarSvg } from '../../engine/chibiBuilder';
import { Station, UserProfile } from '../../types/game';
import { StationSticker } from '../StationSticker';

interface ProfileBadgesModalProps {
  profile: UserProfile;
  stations: Station[];
  onClose: () => void;
  onOpenCertificate: () => void;
}

export const ProfileBadgesModal: React.FC<ProfileBadgesModalProps> = ({
  profile,
  stations,
  onClose,
  onOpenCertificate,
}) => {
  const activeStations = stations.filter((s) => s.active !== false);
  const unlockedCount = activeStations.filter((s) => profile.done?.[s.id] != null).length;
  const pct =
    activeStations.length > 0
      ? Math.round((unlockedCount / activeStations.length) * 100)
      : 0;
  const fac = getFacultyById(profile.facultyId);
  const level = 1 + Math.floor(profile.points / 300);

  return (
    <div id="modal">
      <div className="scrim" onClick={onClose} />
      <div className="sheet card" role="dialog" aria-modal="true">
        <div className="sh-head" style={{ '--c': '#FF6F59' } as React.CSSProperties}>
          <span
            className="sticker"
            style={{ '--c': '#fff', color: '#FF6F59', width: 56, height: 56 } as React.CSSProperties}
          >
            <Award className="w-7 h-7" />
          </span>
          <div>
            <h2>Hồ Sơ & Bộ Sưu Tập Huy Hiệu</h2>
            <p>
              TDC Stamp Collection · Đã mở khóa {unlockedCount}/{activeStations.length} ({pct}%)
            </p>
          </div>
          <button type="button" className="sh-x" onClick={onClose} aria-label="Đóng">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="sh-body">
          {/* Student ID Card */}
          <div className="bg-[#FFFBEF] border-2 border-amber-200 rounded-2xl p-3.5 flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-white shadow"
              dangerouslySetInnerHTML={{ __html: getAvatarSvg(profile.avatar) }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <b className="font-extrabold text-base text-slate-900 truncate">
                  {profile.name}
                </b>
                <span className="bg-amber-200 text-amber-950 text-[11px] font-black px-2 py-0.5 rounded-full">
                  Cấp {level}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-600">
                MSSV: <b>{profile.mssv}</b>
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className="text-[11px] font-extrabold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: fac.badgeColor, color: fac.color }}
                >
                  {fac.name}
                </span>
              </div>
            </div>
          </div>

          {/* Fog of War Progress Bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-extrabold">
              <span className="flex items-center gap-1 text-emerald-800">
                <Compass className="w-3.5 h-3.5" /> Tiến độ Mở khóa Sương mù Khuôn viên 3D
              </span>
              <span className="text-emerald-700">{pct}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Stamp Grid */}
          <div className="album">
            {activeStations.map((st) => {
              const record = profile.done?.[st.id];
              const isUnlocked = record != null;
              return (
                <div key={st.id}>
                  <StationSticker
                    col={st.col}
                    type={st.type}
                    size={58}
                    locked={!isUnlocked}
                  />
                  <span>
                    {isUnlocked ? st.badge : '???'}
                    <small>{st.name}</small>
                  </span>
                </div>
              );
            })}
          </div>

          {unlockedCount >= activeStations.length && activeStations.length > 0 ? (
            <button
              type="button"
              className="btn big sun"
              onClick={() => {
                onClose();
                onOpenCertificate();
              }}
            >
              <ShieldCheck className="w-5 h-5" /> Xem Chứng Nhận Nhà Thám Hiểm TDC
            </button>
          ) : (
            <p className="note text-center">
              Sưu tầm đủ {activeStations.length} huy hiệu tại các tòa nhà để nhận Chứng nhận Nhà thám hiểm TDC!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
