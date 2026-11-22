import React, { useEffect, useState } from 'react';
import { Award, Building2, Trophy, Users, X } from 'lucide-react';
import { FACULTIES, getFacultyById } from '../../data/faculties';
import { fetchLeaderboardData } from '../../services/gameService';
import { PartyRoom, PublicLeaderboardUser, UserProfile } from '../../types/game';

interface LeaderboardModalProps {
  profile: UserProfile;
  totalStations: number;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  profile,
  totalStations,
  onClose,
}) => {
  const [tab, setTab] = useState<'individual' | 'party' | 'faculty'>('individual');
  const [individuals, setIndividuals] = useState<PublicLeaderboardUser[]>([]);
  const [parties, setParties] = useState<PartyRoom[]>([]);

  useEffect(() => {
    void fetchLeaderboardData(profile).then((res) => {
      setIndividuals(res.individuals);
      setParties(res.parties);
    });
  }, [profile]);

  const facultyRanking = FACULTIES.map((f) => {
    const members = individuals.filter((u) => u.facultyId === f.id);
    const totalPoints = members.reduce((sum, u) => sum + u.points, 0);
    return {
      faculty: f,
      studentCount: members.length,
      totalPoints,
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div id="modal">
      <div className="scrim" onClick={onClose} />
      <div className="sheet card" role="dialog" aria-modal="true">
        <div className="sh-head" style={{ '--c': '#FFAA1F' } as React.CSSProperties}>
          <span
            className="sticker"
            style={{ '--c': '#fff', color: '#FFAA1F', width: 56, height: 56 } as React.CSSProperties}
          >
            <Trophy className="w-7 h-7" />
          </span>
          <div>
            <h2>Bảng Xếp Hạng TDC Travel</h2>
            <p>Học kỳ I · Năm học 2026–2027</p>
          </div>
          <button type="button" className="sh-x" onClick={onClose} aria-label="Đóng">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="sh-body">
          {/* 3 Tabs */}
          <div className="grid grid-cols-3 gap-1.5 bg-[#FFFBEF] p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setTab('individual')}
              className={`py-2 px-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1 cursor-pointer ${
                tab === 'individual'
                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> Cá nhân
            </button>
            <button
              type="button"
              onClick={() => setTab('party')}
              className={`py-2 px-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1 cursor-pointer ${
                tab === 'party'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Tổ đội
            </button>
            <button
              type="button"
              onClick={() => setTab('faculty')}
              className={`py-2 px-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1 cursor-pointer ${
                tab === 'faculty'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Theo Khoa
            </button>
          </div>

          {tab === 'individual' && (
            <div className="list max-h-[340px] overflow-y-auto pr-1">
              {individuals.map((u, i) => {
                const isYou = u.uid === profile.uid;
                const fac = getFacultyById(u.facultyId);
                return (
                  <div key={u.uid} className={`rank ${isYou ? 'you' : ''}`}>
                    <span className="n">{i + 1}</span>
                    <div className="min-w-0">
                      <div className="truncate font-extrabold text-sm">
                        {u.name} {isYou ? '(Bạn)' : ''}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                        <span
                          className="px-1.5 py-0.2 rounded-md font-extrabold"
                          style={{ backgroundColor: fac.badgeColor, color: fac.color }}
                        >
                          {fac.shortName}
                        </span>
                        <span>
                          · {u.unlockedCount}/{totalStations} trạm
                        </span>
                      </div>
                    </div>
                    <span>{u.points.toLocaleString('vi-VN')} đ</span>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'party' && (
            <div className="list max-h-[340px] overflow-y-auto pr-1">
              {parties.map((p, i) => {
                const isYourParty = profile.partyId === p.code;
                return (
                  <div key={p.code} className={`rank ${isYourParty ? 'you' : ''}`}>
                    <span className="n">{i + 1}</span>
                    <div className="min-w-0">
                      <div className="truncate font-extrabold text-sm">
                        {p.name} {isYourParty ? '(Đội bạn)' : ''}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                        <span>Mã: {p.code}</span>
                        <span>· {p.members.length}/4 SV</span>
                        {p.isCrossFaculty && (
                          <span className="text-emerald-700 font-extrabold">
                            · Liên khoa +20%
                          </span>
                        )}
                      </div>
                    </div>
                    <span>{p.totalPoints.toLocaleString('vi-VN')} đ</span>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'faculty' && (
            <div className="list max-h-[340px] overflow-y-auto pr-1">
              {facultyRanking.map((row, i) => {
                const isMyFaculty = row.faculty.id === profile.facultyId;
                return (
                  <div key={row.faculty.id} className={`rank ${isMyFaculty ? 'you' : ''}`}>
                    <span className="n">{i + 1}</span>
                    <div className="min-w-0">
                      <div className="truncate font-extrabold text-sm">
                        {row.faculty.name}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500">
                        {row.studentCount} nhà thám hiểm tham gia
                      </div>
                    </div>
                    <span>{row.totalPoints.toLocaleString('vi-VN')} đ</span>
                  </div>
                );
              })}
            </div>
          )}

          <p className="note text-center">
            Điểm số tự động đồng bộ thời gian thực khi hoàn thành trạm & nhiệm vụ.
          </p>
        </div>
      </div>
    </div>
  );
};
