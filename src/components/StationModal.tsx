import React, { useMemo, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Compass,
  Eye,
  Flag,
  HelpCircle,
  Lightbulb,
  QrCode,
  ShieldAlert,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { TYPE_LABEL } from '../data/campusLayout';
import { audioSfx } from '../engine/audioSfx';
import {
  checkAntiCheatCooldown,
  verifyStationQrPayload,
  verifyStationRiddle,
} from '../services/gameService';
import {
  PartyRoom,
  QuizItem,
  Station,
  UnlockedStationRecord,
  UserProfile,
  VerificationMethod,
} from '../types/game';
import { AutoEngineGame } from './minigames/AutoEngineGame';
import { ElectricCircuitGame } from './minigames/ElectricCircuitGame';
import { ItDebugGame } from './minigames/ItDebugGame';
import { KickGame } from './minigames/KickGame';
import { StationSticker } from './StationSticker';

interface StationModalProps {
  station: Station;
  profile: UserProfile;
  party: PartyRoom | null;
  totalStations: number;
  nextStationName?: string;
  preverifiedMethod?: VerificationMethod | null;
  onClose: () => void;
  onOpenQrScanner: (st: Station) => void;
  onRequestPhotoMode: (st: Station, method: VerificationMethod) => void;
  onCompleteStation: (params: {
    station: Station;
    basePoints: number;
    method: VerificationMethod;
    isQuizOrGameSuccess: boolean;
    summaryHtml?: string;
  }) => Promise<{
    finalPoints: number;
    crossFacultyBonus: number;
    qrBonus: number;
  }>;
  onShowCertificate: () => void;
}

export const StationModal: React.FC<StationModalProps> = ({
  station,
  profile,
  party,
  totalStations,
  nextStationName,
  preverifiedMethod,
  onClose,
  onOpenQrScanner,
  onRequestPhotoMode,
  onCompleteStation,
  onShowCertificate,
}) => {
  const existingRecord: UnlockedStationRecord | undefined = profile.done?.[station.id];

  // Step 1: O2O Field Verification ('qr' | 'riddle' | 'demo')
  const [verifiedMethod, setVerifiedMethod] = useState<VerificationMethod | null>(
    preverifiedMethod || (station.id === 'g1' ? 'demo' : null)
  );
  const [riddleInput, setRiddleInput] = useState('');
  const [showRiddleHint, setShowRiddleHint] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [qrTokenInput, setQrTokenInput] = useState('');

  // Step 2: Quiz state (if type === 'quiz')
  const pickedQuiz: QuizItem | null = useMemo(() => {
    if (!station.questions || station.questions.length === 0) return null;
    const idx = Math.floor(Math.random() * station.questions.length);
    return station.questions[idx];
  }, [station]);

  const shuffledOptionIndices = useMemo(() => {
    if (!pickedQuiz) return [0, 1, 2, 3];
    return pickedQuiz.opts.map((_, i) => i).sort(() => Math.random() - 0.5);
  }, [pickedQuiz]);

  const [selectedQuizAns, setSelectedQuizAns] = useState<number | null>(null);

  // Step 3: Completion Reveal state
  const [completionResult, setCompletionResult] = useState<{
    finalPoints: number;
    crossFacultyBonus: number;
    qrBonus: number;
    summaryHtml?: string;
  } | null>(null);

  const unlockedCount = Object.keys(profile.done || {}).length;

  const handleRiddleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const cooldown = checkAntiCheatCooldown(profile, 'riddle');
    if (!cooldown.allowed) {
      setVerifyError(
        `Chống gian lận (Anti-cheat): Bạn di chuyển giữa 2 trạm quá nhanh! Vui lòng đợi ${cooldown.waitSeconds} giây.`
      );
      audioSfx.play('bad');
      return;
    }

    if (verifyStationRiddle(station, riddleInput)) {
      audioSfx.play('ok');
      setVerifyError(null);
      setVerifiedMethod('riddle');
    } else {
      audioSfx.play('bad');
      setVerifyError('Mật thư thực địa chưa chính xác. Hãy quan sát mô hình 3D hoặc bấm xem Gợi ý!');
    }
  };

  const handleInlineQrTokenVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const cooldown = checkAntiCheatCooldown(profile, 'qr');
    if (!cooldown.allowed) {
      setVerifyError(
        `Chống gian lận: Vui lòng chờ ${cooldown.waitSeconds}s trước khi quét trạm tiếp theo.`
      );
      audioSfx.play('bad');
      return;
    }
    const res = verifyStationQrPayload(station, qrTokenInput);
    if (res.valid) {
      audioSfx.play('ok');
      setVerifyError(null);
      setVerifiedMethod('qr');
    } else {
      audioSfx.play('bad');
      setVerifyError(res.message);
    }
  };

  const handleDemoBypass = () => {
    audioSfx.play('tap');
    setVerifyError(null);
    setVerifiedMethod('demo');
  };

  const triggerComplete = async (
    basePoints: number,
    isQuizOrGameSuccess: boolean,
    summaryHtml?: string
  ) => {
    const method = verifiedMethod || 'demo';
    const res = await onCompleteStation({
      station,
      basePoints,
      method,
      isQuizOrGameSuccess,
      summaryHtml,
    });
    setCompletionResult({
      ...res,
      summaryHtml,
    });
  };

  const handleQuizOptionClick = (originalIdx: number) => {
    if (selectedQuizAns !== null || !pickedQuiz) return;
    setSelectedQuizAns(originalIdx);
    const ok = originalIdx === pickedQuiz.ans;
    audioSfx.play(ok ? 'ok' : 'bad');
  };

  // CASE A: Already unlocked previously (Review station info, fun facts & directions)
  if (existingRecord && !completionResult) {
    return (
      <div id="modal">
        <div className="scrim" onClick={onClose} />
        <div className="sheet card" role="dialog" aria-modal="true">
          <div className="sh-head" style={{ '--c': station.col } as React.CSSProperties}>
            <StationSticker col={station.col} type={station.type} size={56} done />
            <div>
              <h2>{station.name}</h2>
              <p>{station.sub}</p>
            </div>
            <button type="button" className="sh-x" onClick={onClose} aria-label="Đóng">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="sh-body">
            <div className="know">
              <b>Thông tin Khu vực</b>
              {station.info}
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs font-bold text-emerald-950 flex flex-col gap-1">
              <span className="uppercase tracking-wider text-emerald-700 font-black">
                🌟 Fun Fact Đã Mở Khóa:
              </span>
              <span>{station.funFact}</span>
            </div>
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs font-bold text-sky-950 flex items-start gap-2">
              <Compass className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <div className="uppercase tracking-wider text-sky-700 font-black">
                  Chỉ dẫn Lộ trình Tiếp theo:
                </div>
                <div>{station.directions}</div>
              </div>
            </div>

            {existingRecord.photoDataUrl && (
              <div className="polar">
                <img
                  src={existingRecord.photoDataUrl}
                  alt={`Ảnh check-in tại ${station.name}`}
                />
                <p>
                  {profile.name} @ {station.name}
                  <small>
                    TDC Travel ·{' '}
                    {new Date(existingRecord.unlockedAt).toLocaleDateString('vi-VN')}
                  </small>
                </p>
              </div>
            )}

            <div className="reveal">
              <StationSticker col={station.col} type={station.type} size={84} />
              <h3>{station.badge}</h3>
              <p className="note">
                Đã mở khóa sương mù với <b>+{existingRecord.pts} điểm</b> (Phương thức:{' '}
                {existingRecord.method.toUpperCase()}).
              </p>
            </div>
            <button type="button" className="btn big" onClick={onClose}>
              Tiếp tục Khám phá
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CASE B: Just completed right now -> Celebration & Badge Reveal
  if (completionResult) {
    const allUnlocked = unlockedCount >= totalStations;
    return (
      <div id="modal">
        <div className="scrim" onClick={onClose} />
        <div className="sheet card" role="dialog" aria-modal="true">
          <div className="sh-head" style={{ '--c': station.col } as React.CSSProperties}>
            <StationSticker col={station.col} type={station.type} size={56} />
            <div>
              <h2>Sương mù Đã Tan!</h2>
              <p>{station.name}</p>
            </div>
            <button type="button" className="sh-x" onClick={onClose} aria-label="Đóng">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="sh-body">
            {completionResult.summaryHtml && (
              <div
                dangerouslySetInnerHTML={{ __html: completionResult.summaryHtml }}
              />
            )}

            <div className="reveal">
              <StationSticker col={station.col} type={station.type} size={104} />
              <h3>{station.badge}</h3>
              <span className="plus">+{completionResult.finalPoints} điểm</span>

              <div className="flex flex-wrap gap-1.5 justify-center text-xs font-extrabold">
                {completionResult.qrBonus > 0 && (
                  <span className="bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                    +{completionResult.qrBonus} Điểm Xác thực Thực địa ({verifiedMethod?.toUpperCase()})
                  </span>
                )}
                {completionResult.crossFacultyBonus > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> +{completionResult.crossFacultyBonus} Thưởng Tổ đội Liên Khoa (+20%)
                  </span>
                )}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs font-bold text-amber-950">
              <div className="uppercase tracking-wider text-amber-700 font-black mb-0.5">
                💡 Kiến thức Thú vị (Fun Fact):
              </div>
              {station.funFact}
            </div>

            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs font-bold text-sky-950">
              <div className="uppercase tracking-wider text-sky-700 font-black mb-0.5">
                🧭 Hướng dẫn Đường đi:
              </div>
              {station.directions}
            </div>

            <p className="note text-center">
              Tiến độ mở khóa bản đồ: <b>{unlockedCount}/{totalStations}</b> trạm ·{' '}
              {allUnlocked
                ? 'Bạn đã mở khóa 100% khuôn viên TDC!'
                : nextStationName
                  ? `Gợi ý tiếp theo: ${nextStationName}`
                  : ''}
            </p>

            <button
              type="button"
              className={`btn big ${allUnlocked ? 'sun' : ''}`}
              onClick={() => {
                onClose();
                if (allUnlocked) {
                  setTimeout(onShowCertificate, 250);
                }
              }}
            >
              {allUnlocked ? '🎓 Xem Chứng nhận Nhà Thám Hiểm TDC' : 'Tiếp tục Hành trình'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CASE C: Step 1 - Real-world O2O Verification (QR Scan or On-site Observation Riddle)
  if (!verifiedMethod) {
    return (
      <div id="modal">
        <div className="scrim" onClick={onClose} />
        <div className="sheet card" role="dialog" aria-modal="true">
          <div className="sh-head" style={{ '--c': station.col } as React.CSSProperties}>
            <StationSticker col={station.col} type={station.type} size={56} />
            <div>
              <h2>{station.name}</h2>
              <p>Bước 1/2: Xác thực Hiện trường (O2O Check-in)</p>
            </div>
            <button type="button" className="sh-x" onClick={onClose} aria-label="Đóng">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="sh-body">
            <div className="know">
              <b>Giới thiệu Trạm</b>
              {station.info}
            </div>

            {verifyError && (
              <div className="bg-rose-50 border-2 border-rose-300 text-rose-800 p-3 rounded-xl text-xs font-extrabold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            {/* Option 1: Observation Riddle */}
            {station.riddle && (
              <form
                onSubmit={handleRiddleVerify}
                className="bg-amber-50/80 border-2 border-amber-200 rounded-2xl p-3.5 flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <Eye className="w-4 h-4" /> Cách 1: Giải Mật thư Quan sát Thực địa (+10đ)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRiddleHint(!showRiddleHint)}
                    className="text-xs font-extrabold text-sky-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5" /> Gợi ý
                  </button>
                </div>
                <p className="m-0 font-extrabold text-sm text-slate-800">
                  {station.riddle.prompt}
                </p>
                {showRiddleHint && (
                  <p className="m-0 text-xs font-bold text-amber-900 bg-amber-100/80 px-2.5 py-1.5 rounded-lg">
                    💡 Gợi ý: {station.riddle.hint} (Đáp án mẫu: <b>{station.riddle.answer}</b>)
                  </p>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={riddleInput}
                    onChange={(e) => setRiddleInput(e.target.value)}
                    placeholder="Nhập câu trả lời quan sát được..."
                    className="flex-1 px-3 py-2 rounded-xl border-2 border-amber-300 bg-white font-extrabold text-sm"
                  />
                  <button type="submit" className="btn sun">
                    Giải mã
                  </button>
                </div>
              </form>
            )}

            {/* Option 2: QR Code Camera / Token */}
            <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-3.5 flex flex-col gap-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
                <QrCode className="w-4 h-4" /> Cách 2: Quét Mã QR Cố định tại Trạm (+15đ)
              </span>
              <button
                type="button"
                className="btn blue w-full"
                onClick={() => onOpenQrScanner(station)}
              >
                <QrCode className="w-5 h-5" /> Mở Camera Quét Mã QR Trạm
              </button>
              <form onSubmit={handleInlineQrTokenVerify} className="flex gap-2">
                <input
                  type="text"
                  value={qrTokenInput}
                  onChange={(e) => setQrTokenInput(e.target.value)}
                  placeholder={`Hoặc nhập mã QR (${station.qrSecretToken})`}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-sky-300 bg-white font-bold text-xs"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-sky-600 text-white font-extrabold text-xs cursor-pointer"
                >
                  Nhập mã
                </button>
              </form>
            </div>

            {/* Option 3: 3D Walk-in Demo Mode */}
            <button
              type="button"
              className="btn ghost w-full"
              onClick={handleDemoBypass}
            >
              <Sparkles className="w-4 h-4" /> Bỏ qua Xác thực Thực địa (Chế độ Trải nghiệm 3D)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CASE D: Step 2 - Station Challenge / Faculty Mini-game
  return (
    <div id="modal">
      <div className="scrim" onClick={onClose} />
      <div className="sheet card" role="dialog" aria-modal="true">
        <div className="sh-head" style={{ '--c': station.col } as React.CSSProperties}>
          <StationSticker col={station.col} type={station.type} size={56} />
          <div>
            <h2>{station.name}</h2>
            <p>
              {TYPE_LABEL[station.type]} · Tối đa +{station.pts} điểm
            </p>
          </div>
          <button type="button" className="sh-x" onClick={onClose} aria-label="Đóng">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="sh-body">
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-extrabold text-emerald-900">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Đã xác thực hiện trường ({verifiedMethod.toUpperCase()})
            </span>
            {party?.isCrossFaculty && (
              <span className="text-emerald-700">⚡ Liên khoa +20%</span>
            )}
          </div>

          {station.type === 'checkin' && (
            <>
              <div className="know">
                <b>Bạn có biết?</b>
                {station.info}
              </div>
              <button
                type="button"
                className="btn big sun"
                onClick={() => triggerComplete(station.pts, true)}
              >
                <Flag className="w-5 h-5" /> Xác nhận Check-in & Mở khóa Sương mù · +{station.pts}
              </button>
            </>
          )}

          {station.type === 'photo' && (
            <>
              <div className="know">
                <b>Góc Sống Ảo 3D</b>
                {station.info}
              </div>
              <button
                type="button"
                className="btn big sun"
                onClick={() => onRequestPhotoMode(station, verifiedMethod)}
              >
                <Camera className="w-5 h-5" /> Mở Khung Máy Ảnh Polaroid 3D
              </button>
            </>
          )}

          {station.type === 'quiz' && pickedQuiz && (
            <>
              <div className="know">
                <b>Khám phá Kiến thức TDC</b>
                {station.info}
              </div>
              <p className="q">{pickedQuiz.q}</p>
              <div className="opts">
                {shuffledOptionIndices.map((origIdx, displayIdx) => {
                  const letterLabel = String.fromCharCode(65 + displayIdx);
                  const isCorrect = origIdx === pickedQuiz.ans;
                  const isPicked = selectedQuizAns === origIdx;
                  let cls = 'opt';
                  if (selectedQuizAns !== null) {
                    if (isCorrect) cls += ' ok';
                    else if (isPicked) cls += ' no';
                  }
                  return (
                    <button
                      key={origIdx}
                      type="button"
                      disabled={selectedQuizAns !== null}
                      onClick={() => handleQuizOptionClick(origIdx)}
                      className={cls}
                    >
                      <i>{letterLabel}</i>
                      <span>{pickedQuiz.opts[origIdx]}</span>
                    </button>
                  );
                })}
              </div>
              {selectedQuizAns !== null && (
                <div className="flex flex-col gap-2.5 mt-1">
                  <p className="explain">
                    {selectedQuizAns === pickedQuiz.ans
                      ? '🎉 Chính xác! '
                      : '💡 Chưa chính xác! '}
                    {pickedQuiz.ex}
                  </p>
                  <button
                    type="button"
                    className={`btn big ${selectedQuizAns === pickedQuiz.ans ? 'sun' : ''}`}
                    onClick={() =>
                      triggerComplete(
                        selectedQuizAns === pickedQuiz.ans ? station.pts : 40,
                        selectedQuizAns === pickedQuiz.ans
                      )
                    }
                  >
                    <HelpCircle className="w-5 h-5" /> Nhận Huy hiệu & Xóa Sương mù · +
                    {selectedQuizAns === pickedQuiz.ans ? station.pts : 40}
                  </button>
                </div>
              )}
            </>
          )}

          {station.type === 'kick' && (
            <KickGame
              maxPoints={station.pts}
              onComplete={(pts, html) => triggerComplete(pts, true, html)}
            />
          )}

          {station.type === 'it_debug' && (
            <ItDebugGame
              maxPoints={station.pts}
              onComplete={(pts, html) => triggerComplete(pts, true, html)}
            />
          )}

          {station.type === 'electric_circuit' && (
            <ElectricCircuitGame
              maxPoints={station.pts}
              onComplete={(pts, html) => triggerComplete(pts, true, html)}
            />
          )}

          {station.type === 'auto_engine' && (
            <AutoEngineGame
              maxPoints={station.pts}
              onComplete={(pts, html) => triggerComplete(pts, true, html)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
