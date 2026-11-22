import React, { useState } from 'react';
import { Compass, RotateCcw, Shield, Sparkles } from 'lucide-react';
import { AVATARS, TDC_LOGO } from '../data/campusLayout';
import { FACULTIES } from '../data/faculties';
import { getAvatarSvg } from '../engine/chibiBuilder';
import { isFirebaseConfigured } from '../services/firebase';
import { FacultyId, UserProfile } from '../types/game';

interface StartScreenProps {
  existingProfile: UserProfile | null;
  totalStations: number;
  onStartGame: (params: {
    name: string;
    mssv: string;
    email?: string;
    password?: string;
    facultyId: FacultyId;
    avatar: number;
    mode: 'demo' | 'email_login' | 'email_register' | 'google';
  }) => Promise<void>;
  onResetProgress: () => void;
  onOpenAdmin: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  existingProfile,
  totalStations,
  onStartGame,
  onResetProgress,
  onOpenAdmin,
}) => {
  const [name, setName] = useState(existingProfile?.name || '');
  const [mssv, setMssv] = useState(existingProfile?.mssv || '26211TT0102');
  const [facultyId, setFacultyId] = useState<FacultyId>(
    existingProfile?.facultyId || 'cntt'
  );
  const [avatar, setAvatar] = useState<number>(existingProfile?.avatar || 0);
  const [authTab, setAuthTab] = useState<'quick' | 'cloud'>('quick');
  const [email, setEmail] = useState(existingProfile?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlockedCount = Object.keys(existingProfile?.done || {}).length;

  const handleSubmit = async (
    mode: 'demo' | 'email_login' | 'email_register' | 'google'
  ) => {
    setError(null);
    setLoading(true);
    try {
      await onStartGame({
        name: name.trim() || 'Minh Anh',
        mssv: mssv.trim() || '26211TT0102',
        email: email.trim() || undefined,
        password: password || undefined,
        facultyId,
        avatar,
        mode,
      });
    } catch (err) {
      setError((err as Error).message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="start">
      <div className="st-wrap">
        <div className="flex items-center justify-between">
          <div className="logo">
            <div className="seal">
              <svg
                viewBox="118 118 332 332"
                role="img"
                aria-label="Logo Trường Cao đẳng Công nghệ Thủ Đức"
              >
                <path fill="#00AEEF" d={TDC_LOGO} />
              </svg>
            </div>
            <h1>
              TDC<span>Travel</span>
            </h1>
          </div>

          <button
            type="button"
            onClick={onOpenAdmin}
            className="px-3.5 py-2 rounded-2xl bg-white/95 border-2 border-slate-200 shadow-sm text-xs font-extrabold text-slate-700 hover:border-sky-400 flex items-center gap-1.5 cursor-pointer"
            title="Mở Cổng Quản trị Hệ thống (Admin CMS)"
          >
            <Shield className="w-4 h-4 text-sky-600" /> Admin CMS
          </button>
        </div>

        <p className="tag">
          Khám phá bản đồ 3D khuôn viên Trường Cao đẳng Công nghệ Thủ Đức, mở khóa sương mù tại {totalStations} trạm thực địa, kết nối tổ đội liên khoa và sưu tầm huy hiệu!
        </p>

        <div className="st-card card">
          {/* Auth Mode Switcher */}
          <div className="grid grid-cols-2 gap-1.5 bg-[#FFFBEF] p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setAuthTab('quick')}
              className={`py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
                authTab === 'quick'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              ⚡ Hồ sơ Sinh viên / Demo
            </button>
            <button
              type="button"
              onClick={() => setAuthTab('cloud')}
              className={`py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
                authTab === 'cloud'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              ☁️ Tài khoản Email TDC
            </button>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 px-3 py-2 rounded-xl text-xs font-extrabold">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="inName">Họ tên Sinh viên</label>
              <input
                id="inName"
                type="text"
                maxLength={24}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Minh Anh"
              />
            </div>
            <div>
              <label htmlFor="inMssv">Mã số SV (MSSV)</label>
              <input
                id="inMssv"
                type="text"
                maxLength={14}
                value={mssv}
                onChange={(e) => setMssv(e.target.value.toUpperCase())}
                placeholder="26211TT0102"
              />
            </div>
          </div>

          <div>
            <label htmlFor="inFaculty">Khoa / Ngành đào tạo tại TDC</label>
            <select
              id="inFaculty"
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value as FacultyId)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E2EBDA] bg-[#FFFBEF] font-extrabold text-sm text-[#1E3528]"
            >
              {FACULTIES.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.shortName})
                </option>
              ))}
            </select>
          </div>

          {authTab === 'cloud' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-sky-50/70 p-2.5 rounded-xl border border-sky-200">
              <div>
                <label htmlFor="inEmail">Email Sinh viên (@mail.tdc.edu.vn)</label>
                <input
                  id="inEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="26211tt0102@mail.tdc.edu.vn"
                  className="!text-xs !py-2"
                />
              </div>
              <div>
                <label htmlFor="inPass">Mật khẩu</label>
                <input
                  id="inPass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="!text-xs !py-2"
                />
              </div>
            </div>
          )}

          <span className="lbl">Chọn Nhân vật Chibi 3D</span>
          <div className="avas">
            {AVATARS.map((a, i) => (
              <button
                key={a.name}
                type="button"
                className={i === avatar ? 'on' : ''}
                onClick={() => setAvatar(i)}
                aria-pressed={i === avatar}
              >
                <div
                  className="w-14 h-14"
                  dangerouslySetInnerHTML={{ __html: getAvatarSvg(i) }}
                />
                {a.name}
              </button>
            ))}
          </div>

          {authTab === 'quick' ? (
            <button
              type="button"
              disabled={loading}
              className="btn big sun"
              onClick={() => handleSubmit('demo')}
            >
              <Compass className="w-5 h-5" />
              {existingProfile && existingProfile.points > 0
                ? `Tiếp tục Hành trình · ${existingProfile.points.toLocaleString('vi-VN')} điểm (${unlockedCount}/${totalStations} trạm)`
                : 'Bắt đầu Khám phá Khuôn viên 3D'}
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={loading}
                  className="btn blue text-sm"
                  onClick={() => handleSubmit('email_login')}
                >
                  Đăng nhập Email
                </button>
                <button
                  type="button"
                  disabled={loading}
                  className="btn sun text-sm"
                  onClick={() => handleSubmit('email_register')}
                >
                  Đăng ký Mới
                </button>
              </div>
              {isFirebaseConfigured && (
                <button
                  type="button"
                  disabled={loading}
                  className="btn ghost text-xs"
                  onClick={() => handleSubmit('google')}
                >
                  Đăng nhập nhanh với Google (@mail.tdc.edu.vn)
                </button>
              )}
            </div>
          )}

          {existingProfile && (existingProfile.points > 0 || unlockedCount > 0) && (
            <div className="st-row">
              <button
                type="button"
                className="btn ghost text-sm"
                onClick={onResetProgress}
              >
                <RotateCcw className="w-4 h-4" /> Đặt lại tiến độ & Phủ lại sương mù từ đầu
              </button>
            </div>
          )}

          <p className="fine flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Đề tài NCKH 2026–2027: Tích hợp Bản đồ 3D + Sương mù (Fog of War), Quét QR thực địa O2O, Mini-game chuyên ngành các Khoa, Tổ đội Liên khoa & Admin CMS.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
