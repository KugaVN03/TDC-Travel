import React, { useState } from 'react';
import {
  Copy,
  LogOut,
  PlusCircle,
  Sparkles,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { getFacultyById } from '../../data/faculties';
import { getAvatarSvg } from '../../engine/chibiBuilder';
import { PartyRoom, UserProfile } from '../../types/game';

interface PartyModalProps {
  profile: UserProfile;
  party: PartyRoom | null;
  onClose: () => void;
  onCreateParty: (partyName: string) => Promise<void>;
  onJoinParty: (code: string) => Promise<void>;
  onLeaveParty: () => Promise<void>;
  onSimulateTeammate: () => Promise<void>;
}

export const PartyModal: React.FC<PartyModalProps> = ({
  profile,
  party,
  onClose,
  onCreateParty,
  onJoinParty,
  onLeaveParty,
  onSimulateTeammate,
}) => {
  const [partyName, setPartyName] = useState(`Tổ đội TDC - ${profile.name}`);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onCreateParty(partyName);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await onJoinParty(joinCode.trim());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (!party) return;
    navigator.clipboard?.writeText(party.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div id="modal">
      <div className="scrim" onClick={onClose} />
      <div className="sheet card" role="dialog" aria-modal="true">
        <div className="sh-head" style={{ '--c': '#38B865' } as React.CSSProperties}>
          <span
            className="sticker"
            style={{ '--c': '#fff', color: '#38B865', width: 56, height: 56 } as React.CSSProperties}
          >
            <Users className="w-7 h-7" />
          </span>
          <div>
            <h2>Tổ Đội Thám Hiểm (Co-op)</h2>
            <p>Nhóm 2–4 Sinh viên · Giao lưu Liên Khoa (+20% Điểm)</p>
          </div>
          <button type="button" className="sh-x" onClick={onClose} aria-label="Đóng">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="sh-body">
          <div className="know">
            <b>Đặc quyền Tổ Đội Liên Khoa (Cross-Faculty Bonus)</b>
            Khi trong tổ đội có từ <b>2 sinh viên thuộc 2 Khoa khác nhau</b> trở lên, toàn bộ thành viên được cộng thêm <b>+20% điểm thưởng</b> ở mọi trạm thử thách!
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 px-3 py-2 rounded-xl text-xs font-extrabold">
              ⚠️ {error}
            </div>
          )}

          {party ? (
            <div className="flex flex-col gap-3">
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-700">
                    {party.name}
                  </div>
                  <div className="text-2xl font-black tracking-widest text-emerald-950 font-mono">
                    MÃ PHÒNG: {party.code}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyCode}
                  className="btn ghost text-xs px-3 min-h-[38px]"
                >
                  <Copy className="w-4 h-4" /> {copied ? 'Đã chép!' : 'Chép mã'}
                </button>
              </div>

              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold text-slate-600">
                  Thành viên ({party.members.length}/4):
                </span>
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    party.isCrossFaculty
                      ? 'bg-amber-200 text-amber-950'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {party.isCrossFaculty
                    ? '⚡ Đã kích hoạt Thưởng Liên Khoa (+20%)'
                    : 'Chưa đủ 2 Khoa khác nhau (x1.0)'}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {party.members.map((m) => {
                  const fac = getFacultyById(m.facultyId);
                  return (
                    <div
                      key={m.uid}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#FFFBEF] border border-slate-200"
                    >
                      <div
                        className="w-10 h-10 rounded-full overflow-hidden shrink-0"
                        dangerouslySetInnerHTML={{ __html: getAvatarSvg(m.avatar) }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-sm text-slate-900 truncate">
                          {m.name} {m.uid === party.hostUid ? '👑' : ''}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <span
                            className="px-2 py-0.5 rounded-full text-[11px]"
                            style={{ backgroundColor: fac.badgeColor, color: fac.color }}
                          >
                            {fac.shortName}
                          </span>
                          <span className="text-slate-400">· {m.mssv}</span>
                        </div>
                      </div>
                      <div className="font-black text-amber-700 text-sm">
                        {m.points.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between bg-slate-100 px-3.5 py-2.5 rounded-xl font-extrabold text-sm">
                <span>Tổng điểm Tổ đội:</span>
                <span className="text-emerald-700 text-base">
                  {party.totalPoints.toLocaleString('vi-VN')} điểm
                </span>
              </div>

              {party.members.length < 4 && (
                <button
                  type="button"
                  onClick={onSimulateTeammate}
                  className="btn sun w-full text-sm"
                >
                  <UserPlus className="w-4 h-4" /> Ghép Nhanh 1 Đồng đội Khác Khoa (Mô phỏng Co-op)
                </button>
              )}

              <button
                type="button"
                onClick={onLeaveParty}
                className="btn ghost w-full text-rose-700"
              >
                <LogOut className="w-4 h-4" /> Rời khỏi Tổ đội
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <form
                onSubmit={handleCreate}
                className="p-3.5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 flex flex-col gap-2.5"
              >
                <label className="text-xs font-black uppercase tracking-wider text-emerald-800">
                  1. Tạo Phòng Tổ Đội Mới (2–4 SV)
                </label>
                <input
                  type="text"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  maxLength={40}
                  placeholder="Đặt tên Tổ đội của bạn..."
                  className="px-3.5 py-2.5 rounded-xl border-2 border-emerald-300 bg-white font-extrabold text-sm"
                />
                <button type="submit" disabled={loading} className="btn w-full">
                  <PlusCircle className="w-5 h-5" /> Tạo Tổ đội & Lấy Mã 6 Ký tự
                </button>
              </form>

              <form
                onSubmit={handleJoin}
                className="p-3.5 rounded-2xl bg-sky-50/70 border-2 border-sky-200 flex flex-col gap-2.5"
              >
                <label className="text-xs font-black uppercase tracking-wider text-sky-800">
                  2. Hoặc Tham gia Tổ đội Bạn bè bằng Mã Phòng
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={8}
                    placeholder="Nhập mã (VD: TDC26A)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-sky-300 bg-white font-mono font-black uppercase text-sm"
                  />
                  <button type="submit" disabled={loading} className="btn blue">
                    Vào phòng
                  </button>
                </div>
                <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Mẹo: Bạn có thể nhập thử mã phòng mẫu <b>TDC26A</b> hoặc <b>CNTT99</b>!
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
