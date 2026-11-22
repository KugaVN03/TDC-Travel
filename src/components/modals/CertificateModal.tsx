import React from 'react';
import { Compass, ExternalLink, Printer, X } from 'lucide-react';
import { getFacultyById } from '../../data/faculties';
import { Station, UserProfile } from '../../types/game';
import { StationSticker } from '../StationSticker';

interface CertificateModalProps {
  profile: UserProfile;
  stations: Station[];
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  profile,
  stations,
  onClose,
}) => {
  const fac = getFacultyById(profile.facultyId);
  const today = new Date().toLocaleDateString('vi-VN');

  return (
    <div id="modal">
      <div className="scrim" onClick={onClose} />
      <div className="sheet card" role="dialog" aria-modal="true">
        <div className="sh-head" style={{ '--c': '#FFAA1F' } as React.CSSProperties}>
          <span
            className="sticker"
            style={{ '--c': '#fff', color: '#FFAA1F', width: 56, height: 56 } as React.CSSProperties}
          >
            <Compass className="w-7 h-7" />
          </span>
          <div>
            <h2>Chinh Phục 100% Khuôn Viên!</h2>
            <p>Chứng nhận Nhà Thám Hiểm TDC Travel 2026–2027</p>
          </div>
          <button type="button" className="sh-x" onClick={onClose} aria-label="Đóng">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="sh-body">
          <div className="cert">
            <small>GIẤY CHỨNG NHẬN ĐIỆN TỬ · TDC TRAVEL</small>
            <h3>{profile.name}</h3>
            <div className="text-xs font-extrabold text-slate-600">
              MSSV: {profile.mssv} · {fac.name}
            </div>
            <p style={{ margin: '4px 0 0', fontWeight: 800, fontSize: 13.5 }}>
              Đã hoàn thành xuất sắc 100% hành trình mở khóa sương mù và khám phá thực địa khuôn viên Trường Cao đẳng Công nghệ Thủ Đức (TDC)
            </p>
            <span
              className="plus"
              style={{
                fontFamily: 'var(--f-display)',
                fontWeight: 800,
                fontSize: 28,
                color: 'var(--sun-d)',
              }}
            >
              {profile.points.toLocaleString('vi-VN')} điểm
            </span>
            <div className="row">
              {stations
                .filter((s) => s.active !== false)
                .map((st) => (
                  <StationSticker key={st.id} col={st.col} type={st.type} size={32} />
                ))}
            </div>
            <p className="note">Cấp ngày {today} · Ban Tổ chức Sự kiện TDC Travel</p>
          </div>

          <p className="note text-center">
            Xuất trình chứng nhận này tại Quầy Đoàn Thanh niên – Hội Sinh viên hoặc Phòng Tư vấn Tuyển sinh để nhận phần quà lưu niệm TDC!
          </p>

          <div className="btns">
            <button
              type="button"
              className="btn sun"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4" /> In / Lưu PDF
            </button>
            <a
              className="btn blue"
              href="https://tdc.edu.vn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4" /> Trang chủ TDC
            </a>
            <button type="button" className="btn ghost" onClick={onClose}>
              Tiếp tục Dạo trường
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
