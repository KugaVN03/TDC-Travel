import React, { useState } from 'react';
import { audioSfx } from '../../engine/audioSfx';

interface EngineStep {
  order: number;
  name: string;
  part: string;
  desc: string;
  icon: string;
}

const FOUR_STROKE_STEPS: EngineStep[] = [
  {
    order: 1,
    name: 'Kỳ 1: NẠP (Intake)',
    part: 'Xupap nạp mở · Piston đi xuống',
    desc: 'Hút hòa khí (xăng + không khí) hoặc không khí sạch vào buồng đốt xylanh.',
    icon: '⬇️',
  },
  {
    order: 2,
    name: 'Kỳ 2: NÉN (Compression)',
    part: 'Cả 2 Xupap đóng · Piston đi lên',
    desc: 'Nén hòa khí ở áp suất và nhiệt độ cao trước khi đánh lửa.',
    icon: '⬆️',
  },
  {
    order: 3,
    name: 'Kỳ 3: NỔ – SINH CÔNG (Power)',
    part: 'Bugi đánh lửa · Piston bị đẩy xuống',
    desc: 'Khí cháy giãn nở mạnh đẩy piston qua thanh truyền làm quay trục khuỷu.',
    icon: '🔥',
  },
  {
    order: 4,
    name: 'Kỳ 4: XẢ (Exhaust)',
    part: 'Xupap xả mở · Piston đi lên',
    desc: 'Đẩy toàn bộ khí thải sau quá trình cháy ra ống xả để bắt đầu chu kỳ mới.',
    icon: '💨',
  },
];

interface AutoEngineGameProps {
  maxPoints: number;
  onComplete: (earnedPoints: number, summaryHtml: string) => void;
}

export const AutoEngineGame: React.FC<AutoEngineGameProps> = ({ maxPoints, onComplete }) => {
  const [shuffled] = useState<EngineStep[]>(() =>
    [...FOUR_STROKE_STEPS].sort(() => Math.random() - 0.5)
  );
  const [selectedOrder, setSelectedOrder] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const expectedNext = selectedOrder.length + 1;
  const isComplete = selectedOrder.length === 4;

  const handlePickStep = (step: EngineStep) => {
    if (selectedOrder.includes(step.order)) return;

    if (step.order === expectedNext) {
      audioSfx.play('ok');
      setSelectedOrder((prev) => [...prev, step.order]);
      setErrorMsg(null);
    } else {
      audioSfx.play('bad');
      setMistakes((m) => m + 1);
      setErrorMsg(
        `Chưa đúng thứ tự chu trình 4 kỳ! Bạn cần chọn Kỳ số ${expectedNext} trước.`
      );
    }
  };

  const handleFinish = () => {
    const earned = Math.max(75, maxPoints - mistakes * 15);
    onComplete(
      earned,
      `<p class="kmsg">Động cơ 4 kỳ tại Xưởng Cơ khí – Ô tô đã khởi động êm ái (Sai số: ${mistakes} lần)!</p>`
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-3 text-xs font-bold text-orange-950">
        ⚙️ Hãy chọn lần lượt đúng thứ tự <b>4 kỳ hoạt động của Động cơ đốt trong</b> (Nạp → Nén → Nổ → Xả) để khởi động máy!
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 px-3 py-2 rounded-xl text-xs font-extrabold">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2.5">
        {shuffled.map((st) => {
          const pickedIdx = selectedOrder.indexOf(st.order);
          const isPicked = pickedIdx !== -1;

          return (
            <button
              key={st.order}
              type="button"
              disabled={isPicked}
              onClick={() => handlePickStep(st)}
              className={`p-3 rounded-2xl border-2 text-left flex items-center gap-3 transition-all cursor-pointer ${
                isPicked
                  ? 'border-emerald-500 bg-emerald-50 opacity-90'
                  : 'border-slate-200 bg-white hover:border-orange-400'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shrink-0 ${
                  isPicked ? 'bg-emerald-600 text-white' : 'bg-orange-100 text-orange-800'
                }`}
              >
                {isPicked ? `#${pickedIdx + 1}` : st.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-sm text-slate-900">
                  {isPicked ? st.name : st.part}
                </div>
                <div className="text-xs text-slate-600 font-semibold">{st.desc}</div>
              </div>
              <div className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {isPicked ? 'Đã lắp ✔' : 'Chọn'}
              </div>
            </button>
          );
        })}
      </div>

      {isComplete && (
        <button type="button" className="btn big sun mt-1" onClick={handleFinish}>
          Đề nổ Động cơ & Nhận Huy hiệu · +{Math.max(75, maxPoints - mistakes * 15)}
        </button>
      )}
    </div>
  );
};
