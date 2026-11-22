import React, { useEffect, useState } from 'react';
import { audioSfx } from '../../engine/audioSfx';

interface DebugQuestion {
  id: number;
  title: string;
  snippet: string;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

const IT_CHALLENGES: DebugQuestion[] = [
  {
    id: 1,
    title: 'Bug #1: Điều kiện Cổng Logic Đăng nhập Sinh viên',
    snippet: `function canAccessLab(isTdcStudent, hasStudentCard) {\n  // Chỉ cho phép vào Lab khi ĐỒNG THỜI là SV TDC VÀ có thẻ SV\n  return isTdcStudent || hasStudentCard; // <-- Dòng nghi vấn\n}`,
    question: 'Cần sửa toán tử ở dòng return như thế nào để đúng yêu cầu bảo mật?',
    options: [
      'Đổi toán tử OR (||) thành AND (&&)',
      'Đổi thành !isTdcStudent || hasStudentCard',
      'Đổi return thành console.log()',
      'Xóa cả hai biến đầu vào',
    ],
    correctIdx: 0,
    explanation: 'Toán tử && (AND) yêu cầu cả hai điều kiện cùng đúng (true).',
  },
  {
    id: 2,
    title: 'Bug #2: Vòng lặp Tính tổng Điểm Rèn luyện',
    snippet: `const scores = [80, 90, 95];\nlet total = 0;\nfor (let i = 0; i <= scores.length; i++) {\n  total += scores[i];\n}`,
    question: 'Vì sao kết quả biến `total` lại bị lỗi `NaN` ở vòng lặp cuối?',
    options: [
      'Điều kiện `i <= scores.length` vượt quá chỉ số mảng, cần sửa thành `i < scores.length`',
      'Mảng trong JavaScript bắt đầu từ chỉ số 1',
      'Không được dùng `total +=` trong vòng lặp `for`',
      'Biến `total` phải khởi tạo bằng chuỗi rỗng `""`',
    ],
    correctIdx: 0,
    explanation: 'Mảng 3 phần tử có chỉ số 0, 1, 2. Khi i = 3 thì scores[3] là undefined.',
  },
  {
    id: 3,
    title: 'Bug #3: Truy vấn API Bản đồ số TDC Travel',
    snippet: `async function fetchStationData(stationId) {\n  const res = fetch('/api/stations/' + stationId);\n  return res.json(); // Lỗi: res.json is not a function\n}`,
    question: 'Thiếu từ khóa nào trước hàm bất đồng bộ `fetch(...)`?',
    options: [
      'Thiếu từ khóa `await` trước `fetch(...)`',
      'Thiếu từ khóa `class` trước `fetch(...)`',
      'Thiếu từ khóa `delete` trước `res.json()`',
      'Hàm `async` không được phép có `return`',
    ],
    correctIdx: 0,
    explanation: '`fetch()` trả về một Promise nên cần `await fetch(...)` để nhận đối tượng Response.',
  },
];

interface ItDebugGameProps {
  maxPoints: number;
  onComplete: (earnedPoints: number, summaryHtml: string) => void;
}

export const ItDebugGame: React.FC<ItDebugGameProps> = ({ maxPoints, onComplete }) => {
  const [step, setStep] = useState(0);
  const [fixedCount, setFixedCount] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(45);

  const current = IT_CHALLENGES[step];

  useEffect(() => {
    if (picked !== null) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [picked, step]);

  const handlePick = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    const ok = idx === current.correctIdx;
    if (ok) {
      setFixedCount((c) => c + 1);
      audioSfx.play('ok');
    } else {
      audioSfx.play('bad');
    }
  };

  const handleNext = () => {
    if (step + 1 < IT_CHALLENGES.length) {
      setStep(step + 1);
      setPicked(null);
    } else {
      const ratio = fixedCount / IT_CHALLENGES.length;
      const earned = Math.max(40, Math.round(maxPoints * (0.35 + 0.65 * ratio)));
      onComplete(
        earned,
        `<p class="kmsg">Đã vá thành công ${fixedCount}/${IT_CHALLENGES.length} lỗi hệ thống Khoa CNTT!</p>`
      );
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between bg-[#1E293B] text-emerald-400 px-3.5 py-2 rounded-xl text-xs font-mono font-bold">
        <span>TDC-IT-LAB://debug_terminal ({step + 1}/3)</span>
        <span className={timeLeft < 10 ? 'text-rose-400 animate-pulse' : 'text-amber-300'}>
          ⏱ {timeLeft}s · Đã fix: {fixedCount}/3
        </span>
      </div>

      <div className="bg-[#0F172A] text-sky-200 p-3.5 rounded-xl font-mono text-xs overflow-x-auto border-2 border-slate-700 leading-relaxed">
        <div className="text-amber-400 font-bold mb-1.5">// {current.title}</div>
        <pre className="m-0 whitespace-pre-wrap">{current.snippet}</pre>
      </div>

      <p className="q text-base">{current.question}</p>

      <div className="opts">
        {current.options.map((opt, idx) => {
          const isCorrect = idx === current.correctIdx;
          const isSelected = picked === idx;
          let cls = 'opt';
          if (picked !== null) {
            if (isCorrect) cls += ' ok';
            else if (isSelected) cls += ' no';
          }
          return (
            <button
              key={idx}
              type="button"
              disabled={picked !== null}
              onClick={() => handlePick(idx)}
              className={cls}
            >
              <i>{String.fromCharCode(65 + idx)}</i>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="flex flex-col gap-2.5 mt-1">
          <p className="explain">
            {picked === current.correctIdx ? '✅ Build Passed! ' : '⚠️ Syntax Warning! '}
            {current.explanation}
          </p>
          <button type="button" className="btn big sun" onClick={handleNext}>
            {step + 1 < IT_CHALLENGES.length ? 'Tiếp tục Vá lỗi tiếp theo →' : 'Hoàn tất Triển khai Code'}
          </button>
        </div>
      )}
    </div>
  );
};
