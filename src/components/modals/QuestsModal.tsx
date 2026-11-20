import React from 'react';
import { ListChecks, X } from 'lucide-react';
import { QUESTS } from '../../data/campusLayout';
import { UserProfile } from '../../types/game';
import { StationSticker } from '../StationSticker';

interface QuestsModalProps {
  profile: UserProfile;
  totalStations: number;
  onClose: () => void;
}

export const QuestsModal: React.FC<QuestsModalProps> = ({
  profile,
  totalStations,
  onClose,
}) => {
  return (
    <div id="modal">
      <div className="scrim" onClick={onClose} />
      <div className="sheet card" role="dialog" aria-modal="true">
        <div className="sh-head" style={{ '--c': '#3DAA5C' } as React.CSSProperties}>
          <span
            className="sticker"
            style={{ '--c': '#fff', color: '#3DAA5C', width: 56, height: 56 } as React.CSSProperties}
          >
            <ListChecks className="w-7 h-7" />
          </span>
          <div>
            <h2>Nhiệm Vụ Thám Hiểm</h2>
            <p>Hoàn thành mục tiêu để nhận thưởng XP & Điểm</p>
          </div>
          <button type="button" className="sh-x" onClick={onClose} aria-label="Đóng">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="sh-body">
          <div className="list">
            {QUESTS.map((q) => {
              const need = q.id === 'all_stations' ? totalStations : q.need;
              const rawVal = q.getValue(profile, totalStations);
              const val = Math.min(need, rawVal);
              const isDone = Boolean(profile.bonus?.[q.id]) || val >= need;
              const pct = need > 0 ? Math.min(100, Math.round((val / need) * 100)) : 0;

              return (
                <div key={q.id} className={`qitem ${isDone ? 'done' : ''}`}>
                  <StationSticker col={q.col} type={q.icon} size={42} done={isDone} />
                  <div>
                    <b>{q.name}</b>
                    <div className="text-xs font-bold text-slate-500">
                      {q.description} ({val}/{need})
                    </div>
                    <div className="qbar">
                      <i style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="qrew">{isDone ? 'Đã nhận ✔' : `+${q.reward}`}</span>
                </div>
              );
            })}
          </div>
          <p className="note text-center">
            📡 Định vị GPS 3 trục (X, Y, Z) và khám phá đủ các tòa nhà phân tầng trong trường để hoàn thành trọn bộ nhiệm vụ!
          </p>
        </div>
      </div>
    </div>
  );
};
