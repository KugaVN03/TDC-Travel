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
            <h3>1. Bản đồ 3D & Cơ chế Mở khóa Sương mù (Fog of War)</h3>
            <p>
              Các phân khu chưa khám phá trong trường được bao phủ bởi làn sương mù 3D và vùng tối trên Minimap. Hãy di chuyển tới các cột sáng trạm thử thách, vượt qua câu đố để xóa tan sương mù và thu thập đủ 10 Huy hiệu.
            </p>
          </div>
          <div>
            <h3>2. Cách Điều khiển Nhân vật</h3>
            <ul>
              <li>
                <b>Trên Máy tính:</b> Dùng phím <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd>{' '}
                <kbd>D</kbd> hoặc phím mũi tên để đi bộ, <kbd>Q</kbd> <kbd>E</kbd> hoặc kéo chuột để xoay góc nhìn, cuộn chuột để phóng to/thu nhỏ.
              </li>
              <li>
                <b>Trên Điện thoại:</b> Kéo cần điều khiển (Joystick) ở góc trái dưới, vuốt 1 ngón để xoay camera, chụm 2 ngón để zoom.
              </li>
              <li>
                <b>Tự động Tìm đường:</b> Bấm trực tiếp xuống mặt đất hoặc bấm vào <b>Thanh la bàn chỉ đường</b> ở dưới đáy màn hình để nhân vật tự chạy tới trạm gần nhất.
              </li>
            </ul>
          </div>
          <div>
            <h3>3. Check-in Thực địa (QR + Mật thư) & Tổ đội Liên khoa</h3>
            <p>
              Tại mỗi trạm, bạn có thể <b>Quét mã QR</b> qua Camera trình duyệt hoặc <b>Giải mật thư quan sát</b> để nhận thêm điểm thưởng O2O. Hãy lập <b>Tổ đội 2–4 sinh viên khác Khoa</b> để kích hoạt <b>+20% điểm thưởng Liên khoa</b>!
            </p>
          </div>
          <button type="button" className="btn big" onClick={onClose}>
            Đã sẵn sàng Khám phá!
          </button>
        </div>
      </div>
    </div>
  );
};
