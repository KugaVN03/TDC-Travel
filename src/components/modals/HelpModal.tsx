import React from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div id="modal">
      <div className="scrim" onClick={onClose} />
      <div className="sheet card" role="dialog" aria-modal="true">
        <div className="sh-head" style={{ '--c': '#00AEEF' } as React.CSSProperties}>
          <span
            className="sticker"
            style={{ '--c': '#fff', color: '#00AEEF', width: 56, height: 56 } as React.CSSProperties}
          >
            <HelpCircle className="w-7 h-7" />
          </span>
          <div>
            <h2>Hướng Dẫn Khám Phá TDC GO</h2>
            <p>Web Game 3D Tương tác Thực tế (O2O Gamification)</p>
          </div>
          <button type="button" className="sh-x" onClick={onClose} aria-label="Đóng">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="sh-body help">
          <div>
            <h3>1. Bản đồ 3D Khuôn viên TDC & Định vị GPS 3 Trục (X · Y · Z)</h3>
            <p>
              Hệ thống sử dụng tín hiệu <b>GPS độ chính xác cao (High-Accuracy WGS84 + Altitude)</b> kết hợp bộ lọc <b>Kalman 3D</b> để định vị vị trí thực tế của bạn trong khuôn viên Trường Cao đẳng Công nghệ Thủ Đức (53 Võ Văn Ngân) theo cả 3 trục:
            </p>
            <ul>
              <li>
                <b>Trục X (Đông – Tây) & Trục Z (Nam – Bắc):</b> Xác định vị trí của bạn trên mặt bằng khuôn viên và tự động nhận diện tòa nhà bạn đang đứng (Khu A, Khu B, Hội trường H, Tòa C, Tòa D, KTX, Xưởng Cơ khí).
              </li>
              <li>
                <b>Trục Cao độ Y / Phân tầng (Floor Level):</b> Tính toán độ cao so với mặt sân trường (1 tầng = 4.2m) để hiển thị chính xác tầng bạn đang khám phá từ <b>Tầng Hầm B1 (-4.2m)</b> lên tới <b>Tầng 11 (+42.0m tại Tòa D)</b>.
              </li>
            </ul>
          </div>
          <div>
            <h3>2. Khám phá Phân tầng 3D & Chế độ Cắt lớp (3D Floor Cutaway)</h3>
            <ul>
              <li>
                <b>Thanh Chọn Tầng 3D (B1 → T11):</b> Sử dụng thanh thang máy phân tầng ở cạnh trái màn hình hoặc nút <b>Chọn Tòa/Tầng</b> trên bảng GPS để chuyển nhanh giữa các tầng và xem danh sách Phòng ban / Khoa / Phòng Lab tại tầng đó.
              </li>
              <li>
                <b>Cắt lớp Tầng 3D (Cutaway View):</b> Bấm nút <b>Cắt lớp Tầng 3D</b> trên bảng điều khiển GPS để ẩn các tầng phía trên và quan sát trực diện mặt sàn bên trong tầng bạn đang đứng.
              </li>
              <li>
                <b>Chuẩn 0m (Tare Ground Altitude):</b> Khi đứng ở sân trường, bấm <b>Chuẩn 0m</b> để hiệu chuẩn áp kế / độ cao GPS của điện thoại về mốc chuẩn Tầng 1 (0.0m).
              </li>
            </ul>
          </div>
          <div>
            <h3>3. Check-in Thực địa (QR + Mật thư) & Tổ đội Liên khoa</h3>
            <p>
              Tại mỗi trạm, bạn có thể <b>Quét mã QR</b> qua Camera trình duyệt hoặc <b>Giải mật thư quan sát</b> để xóa tan sương mù (Fog of War) và nhận thêm điểm thưởng O2O. Hãy lập <b>Tổ đội 2–4 sinh viên khác Khoa</b> để kích hoạt <b>+20% điểm thưởng Liên khoa</b>!
            </p>
          </div>
          <button type="button" className="btn big" onClick={onClose}>
            Đã sẵn sàng Định vị & Khám phá!
          </button>
        </div>
      </div>
    </div>
  );
};
