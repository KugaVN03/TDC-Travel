# TDC Travel · Web Game 3D Khám phá Khuôn viên Trường Cao đẳng Công nghệ Thủ Đức

Dự án triển khai từ Đề tài Nghiên cứu Khoa học Cấp Cơ sở năm học 2026–2027: **"Phát triển web game “TDC Travel” khám phá khuôn viên Trường Cao đẳng Công nghệ Thủ Đức"**, kế thừa mô hình kiến trúc bản đồ 3D khuôn viên TDC và tích hợp hệ thống Định vị GPS 3 Trục (`X, Y, Z`) độ chính xác cao kèm hiển thị Phân tầng Tòa nhà (`Hầm B1 → Tầng 11`).

## Kiến trúc Công nghệ
- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS v4
- **3D WebGL Engine**: Three.js (Mô hình 3D Khu A1/A2, Khu B Tây/Đông, Hội trường H, Tòa C, KTX, Xưởng Cơ khí, Tòa D 11 tầng + Hầm B1, 6 sân bóng mini, sân tennis, sân bóng chuyền, Cổng 1 & 2, Cắt lớp mặt bằng tầng 3D `localClippingEnabled`)
- **Định vị GPS 3 Trục (`X · Y · Z`)**: Quy đổi WGS84 (`Latitude, Longitude, Altitude ASL`) sang tọa độ mét 3D, lọc nhiễu `GpsKalmanFilter3D`, hiệu chuẩn áp kế `Chuẩn 0m` và nhận diện phân tầng tòa nhà tự động.
- **O2O Camera & QR**: `html5-qrcode` (WebRTC Camera Scanner) + `qrcode` (In Standee QR chống gian lận)
- **Backend & Cloud**: Firebase Authentication + Cloud Firestore Realtime + Firebase Hosting (tích hợp chế độ **Dual-Mode Local Fallback** giúp chạy thử ngay không cần khóa `.env`)

## 06 Phân hệ Cốt lõi đã Triển khai
1. **Đăng nhập & Hồ sơ Thám hiểm (Explorer Profile)**: Đăng nhập Email SV (`@mail.tdc.edu.vn`) / Google / Demo nhanh, lưu MSSV, Khoa, Avatar Chibi, % mở khóa bản đồ, Bộ sưu tập Huy hiệu (TDC Stamp Collection) & Chứng nhận điện tử.
2. **Bản đồ 3D Tương tác & Cơ chế Mở khóa Sương mù (Fog of War)**: Các khu vực chưa khám phá được phủ sương mù 3D (Volumetric Mist Clusters) và lớp tối trên Minimap; hiệu ứng tan sương mù kèm pháo giấy khi giải xong trạm.
3. **Câu đố Thực địa & Check-in Hiện trường (O2O Verification + Anti-cheat)**: Xác thực kép tại trạm bằng Quét mã QR qua Camera hoặc Giải mật thư quan sát thực tế tại chỗ, kèm cơ chế chống gian lận (Cooldown thời gian di chuyển giữa các trạm & ngân hàng câu hỏi ngẫu nhiên).
4. **Kho Mini-game Đặc trưng từng Khoa**:
   - **Khoa CNTT (Tòa B)**: *Debug Terminal* – Tìm và vá 3 lỗi logic code dưới áp lực thời gian.
   - **Khoa Điện – Điện tử (Tòa B)**: *Circuit Connector* – Xoay linh kiện khép kín mạch điện tự động hóa PLC 24V.
   - **Khoa Cơ khí – Ô tô (Xưởng cơ khí)**: *4-Stroke Engine Assembly* – Lắp ráp chu trình động cơ đốt trong 4 kỳ (Nạp – Nén – Nổ – Xả).
   - **Khu Thể thao (6 sân bóng mini)**: *Mini-game Sút bóng 3 lượt*.
   - **Bồn cây tròn**: *Chụp ảnh Polaroid 3D trực tiếp từ cảnh WebGL*.
5. **Tổ đội (Co-op Party 2–4 SV) & Bảng xếp hạng (Leaderboard)**: Tạo/vào phòng bằng mã 6 ký tự, tự động kích hoạt **+20% điểm thưởng Liên khoa (Cross-Faculty Bonus)** khi tổ đội có từ 2 khoa trở lên; BXH theo Cá nhân, Tổ đội và Khoa.
6. **Quản trị Hệ thống (Admin CMS)**: Thêm/sửa/xóa điểm trạm 3D & mật thư, xuất bảng Standee QR Code chuẩn in ấn, quản lý Chiến dịch Sự kiện, xem biểu đồ thống kê và xuất báo cáo `.CSV`.

## Hướng dẫn Chạy Dự án
```bash
# 1. Cài đặt thư viện
npm install

# 2. Chạy môi trường phát triển (http://localhost:5173)
npm run dev

# 3. Kiểm thử Unit Tests (Vitest)
npm test

# 4. Build Production
npm run build
```
