import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, KeyRound, QrCode, ShieldCheck, Sparkles, X } from 'lucide-react';
import { Station } from '../types/game';

interface QrScannerModalProps {
  stations: Station[];
  targetStation?: Station | null;
  onClose: () => void;
  onQrDetected: (rawCode: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  stations,
  targetStation,
  onClose,
  onQrDetected,
}) => {
  const [manualToken, setManualToken] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch {
        // Ignore cleanup errors
      }
      scannerRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const qr = new Html5Qrcode('tdc-qr-reader');
      scannerRef.current = qr;
      setCameraActive(true);
      await qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          void stopCamera();
          onQrDetected(decodedText);
        },
        () => {
          // frame scan ignore
        }
      );
    } catch {
      setCameraActive(false);
      setCameraError(
        'Thiết bị chưa cấp quyền Camera hoặc đang chạy trên máy tính không có Webcam. Bạn có thể nhập mã Token trạm hoặc bấm "Mô phỏng Quét QR" bên dưới!'
      );
    }
  };

  useEffect(() => {
    return () => {
      void stopCamera();
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    onQrDetected(manualToken.trim());
  };

  return (
    <div id="modal">
      <div className="scrim" onClick={onClose} />
      <div className="sheet card" role="dialog" aria-modal="true">
        <div className="sh-head" style={{ '--c': '#00AEEF' } as React.CSSProperties}>
          <span
            className="sticker"
            style={{ '--c': '#fff', color: '#00AEEF', width: 54, height: 54 } as React.CSSProperties}
          >
            <QrCode className="w-7 h-7" />
          </span>
          <div>
            <h2>Quét Mã QR Thực Địa</h2>
            <p>
              {targetStation
                ? `Xác thực O2O tại: ${targetStation.name}`
                : 'Hệ thống Check-in WebRTC Camera TDC Travel'}
            </p>
          </div>
          <button type="button" className="sh-x" onClick={onClose} aria-label="Đóng">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="sh-body">
          <div className="know">
            <b>Cơ chế Xác thực Kép (O2O Verification)</b>
            Hướng camera điện thoại vào bảng mã QR đặt tại trạm thực tế trong khuôn viên TDC để mở khóa sương mù và nhận thêm <b>+15 điểm thưởng thực địa</b>.
          </div>

          <div className="rounded-2xl overflow-hidden bg-slate-900 border-2 border-sky-400 min-h-[210px] flex flex-col items-center justify-center relative p-3">
            <div id="tdc-qr-reader" className="w-full max-w-[280px]" />
            {!cameraActive && (
              <div className="flex flex-col items-center text-center gap-2.5 py-4 text-white">
                <Camera className="w-10 h-10 text-sky-400" />
                <p className="text-xs text-slate-300 max-w-xs m-0">
                  Sử dụng Camera trình duyệt (WebRTC) để quét trực tiếp không cần cài App
                </p>
                <button type="button" className="btn blue" onClick={startCamera}>
                  <Camera className="w-4 h-4" /> Bật Camera Quét QR
                </button>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3 rounded-xl text-xs font-bold">
              ℹ️ {cameraError}
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="flex flex-col gap-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" /> Hoặc nhập Mã định danh in dưới bảng QR:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder={
                  targetStation
                    ? `Ví dụ: ${targetStation.qrSecretToken}`
                    : 'Nhập mã TDC-QR-...'
                }
                className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 bg-[#FFFBEF] font-extrabold text-sm"
              />
              <button type="submit" className="btn">
                Xác nhận
              </button>
            </div>
          </form>

          <div className="border-t border-slate-200 pt-3 flex flex-col gap-2">
            <span className="text-xs font-extrabold text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Chế độ Giả lập Quét QR (Dành cho Demo trên PC):
            </span>
            {targetStation ? (
              <button
                type="button"
                className="btn sun w-full"
                onClick={() => onQrDetected(targetStation.qrSecretToken)}
              >
                <ShieldCheck className="w-5 h-5" /> Mô phỏng Quét QR Trạm {targetStation.name}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {stations
                  .filter((s) => s.active !== false)
                  .map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => onQrDetected(st.qrSecretToken)}
                      className="text-left px-2.5 py-2 rounded-xl border border-slate-200 hover:border-sky-400 bg-slate-50 text-xs font-extrabold truncate cursor-pointer"
                    >
                      📲 {st.name}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
