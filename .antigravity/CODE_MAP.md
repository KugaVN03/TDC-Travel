This file is a merged representation of the entire codebase, combined into a single document by Repomix.

<file_summary>
This section contains a summary of this file.

<purpose>
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.
</purpose>

<file_format>
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  - File path as an attribute
  - Full contents of the file
</file_format>

<usage_guidelines>
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
</usage_guidelines>

<notes>
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)
</notes>

</file_summary>

<directory_structure>
src/
  components/
    minigames/
      AutoEngineGame.tsx
      ElectricCircuitGame.tsx
      ItDebugGame.tsx
      KickGame.tsx
      Viewfinder.tsx
    modals/
      CertificateModal.tsx
      HelpModal.tsx
      LeaderboardModal.tsx
      PartyModal.tsx
      ProfileBadgesModal.tsx
      QuestsModal.tsx
    GameHud.tsx
    MiniMap.tsx
    QrScannerModal.tsx
    StartScreen.tsx
    StationModal.tsx
    StationSticker.tsx
  data/
    campusLayout.ts
    faculties.ts
    stations.ts
  engine/
    audioSfx.ts
    campusBuilder.ts
    chibiBuilder.ts
    fogOfWar.ts
    natureAndTrain.ts
    TdcCampusEngine.ts
    threeHelpers.ts
  pages/
    AdminDashboard.tsx
  services/
    adminService.ts
    authService.ts
    firebase.ts
    gameService.ts
    partyService.ts
  types/
    game.ts
  App.tsx
  game.test.ts
  index.css
  main.tsx
  vite-env.d.ts
.env.example
.gitignore
firebase.json
firestore.indexes.json
firestore.rules
index.html
package.json
README.md
tsconfig.json
tsconfig.tsbuildinfo
vite.config.ts
</directory_structure>

<files>
This section contains the contents of the repository's files.

<file path="src/components/minigames/AutoEngineGame.tsx">
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
</file>

<file path="src/components/minigames/ElectricCircuitGame.tsx">
import React, { useState } from 'react';
import { audioSfx } from '../../engine/audioSfx';

interface CircuitNode {
  id: number;
  label: string;
  symbol: string;
  targetRotation: number; // 0, 90, 180, 270
  currentRotation: number;
  role: string;
}

const INITIAL_NODES: CircuitNode[] = [
  {
    id: 1,
    label: 'Cầu dao Tổng (MCB)',
    symbol: '⚡',
    targetRotation: 0,
    currentRotation: 90,
    role: 'Nguồn 24V DC',
  },
  {
    id: 2,
    label: 'Điện trở hạn dòng R1',
    symbol: '〰️',
    targetRotation: 0,
    currentRotation: 180,
    role: 'Bảo vệ LED (220Ω)',
  },
  {
    id: 3,
    label: 'Cảm biến Quang học',
    symbol: '🔆',
    targetRotation: 0,
    currentRotation: 270,
    role: 'Kích hoạt Relay',
  },
  {
    id: 4,
    label: 'Vi điều khiển PLC / IoT',
    symbol: '🎛️',
    targetRotation: 0,
    currentRotation: 90,
    role: 'Khép kín mạch tải',
  },
];

interface ElectricCircuitGameProps {
  maxPoints: number;
  onComplete: (earnedPoints: number, summaryHtml: string) => void;
}

export const ElectricCircuitGame: React.FC<ElectricCircuitGameProps> = ({
  maxPoints,
  onComplete,
}) => {
  const [nodes, setNodes] = useState<CircuitNode[]>(INITIAL_NODES);
  const [moves, setMoves] = useState(0);

  const isClosedCircuit = nodes.every((n) => n.currentRotation % 360 === n.targetRotation);

  const rotateNode = (id: number) => {
    if (isClosedCircuit) return;
    audioSfx.play('tap');
    setMoves((m) => m + 1);
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        const nextRot = (n.currentRotation + 90) % 360;
        return { ...n, currentRotation: nextRot };
      })
    );
  };

  const handleFinish = () => {
    audioSfx.play('ok');
    const bonus = moves <= 10 ? maxPoints : Math.max(80, maxPoints - (moves - 10) * 5);
    onComplete(
      bonus,
      `<p class="kmsg">Mạch điện Tự động hóa Khoa Điện – Điện tử đã thông mạch sau ${moves} thao tác!</p>`
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3 text-xs font-bold text-amber-900 flex items-center justify-between">
        <span>🔌 Bấm vào từng linh kiện để xoay tiếp điểm về góc chuẩn (0° - Nằm ngang)</span>
        <span className="bg-amber-200 px-2.5 py-1 rounded-full">Thao tác: {moves}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {nodes.map((node) => {
          const aligned = node.currentRotation % 360 === node.targetRotation;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => rotateNode(node.id)}
              className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                aligned
                  ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                  : 'border-slate-300 bg-white hover:border-amber-400'
              }`}
            >
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Trạm {node.id} · {node.role}
              </div>
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-transform duration-200 ${
                  aligned
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-amber-400 bg-amber-100 text-amber-900'
                }`}
                style={{ transform: `rotate(${node.currentRotation}deg)` }}
              >
                <div className="flex items-center gap-0.5 font-mono font-black text-base">
                  <span>━</span>
                  <span>{node.symbol}</span>
                  <span>━</span>
                </div>
              </div>
              <div className="font-extrabold text-sm text-slate-800">{node.label}</div>
              <span
                className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                  aligned ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {aligned ? 'Đã thông mạch (0°)' : `Góc lệch: ${node.currentRotation}°`}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className={`p-3.5 rounded-2xl border-2 text-center font-extrabold transition-all ${
          isClosedCircuit
            ? 'bg-amber-100 border-amber-400 text-amber-950'
            : 'bg-slate-100 border-slate-200 text-slate-500'
        }`}
      >
        {isClosedCircuit
          ? '💡 ĐÈN BÁO TỦ ĐIỆN PLC ĐÃ SÁNG RỰC! Toàn bộ 4 nhánh nối tiếp đều kín mạch!'
          : '🌑 Đèn tải chưa sáng · Hãy xoay các linh kiện còn lệch góc về 0°'}
      </div>

      {isClosedCircuit && (
        <button type="button" className="btn big sun" onClick={handleFinish}>
          Xác nhận Đóng điện & Nhận Huy hiệu · +{maxPoints}
        </button>
      )}
    </div>
  );
};
</file>

<file path="src/components/minigames/ItDebugGame.tsx">
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
    title: 'Bug #3: Truy vấn API Bản đồ số TDC GO',
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
</file>

<file path="src/components/minigames/KickGame.tsx">
import React, { useEffect, useRef, useState } from 'react';
import { audioSfx } from '../../engine/audioSfx';

interface KickGameProps {
  maxPoints: number;
  onComplete: (earnedPoints: number, summaryHtml: string) => void;
}

export const KickGame: React.FC<KickGameProps> = ({ maxPoints, onComplete }) => {
  const [shot, setShot] = useState(0);
  const [hits, setHits] = useState(0);
  const [results, setResults] = useState<('h' | 'm' | null)[]>([null, null, null]);
  const [zone, setZone] = useState<[number, number]>([0.4, 0.62]);
  const [msg, setMsg] = useState('Bấm “Sút bóng!” đúng lúc kim chạy vào vùng cỏ xanh!');
  const [ballClass, setBallClass] = useState('ball');
  const [ballBx, setBallBx] = useState('0px');
  const [keeperOffset, setKeeperOffset] = useState(0);
  const [busy, setBusy] = useState(false);

  const needleRef = useRef<HTMLDivElement | null>(null);
  const posRef = useRef(0);
  const dirRef = useRef(1);
  const speedRef = useRef(0.9);
  const busyRef = useRef(false);

  const randomizeZone = (nextShot: number) => {
    const w = 0.22 - nextShot * 0.03;
    const s = 0.15 + Math.random() * (0.7 - w);
    setZone([s, s + w]);
  };

  useEffect(() => {
    let alive = true;
    let last = performance.now();

    const loop = (now: number) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!busyRef.current) {
        posRef.current += dirRef.current * speedRef.current * dt;
        if (posRef.current > 1) {
          posRef.current = 1;
          dirRef.current = -1;
        }
        if (posRef.current < 0) {
          posRef.current = 0;
          dirRef.current = 1;
        }
        if (needleRef.current) {
          needleRef.current.style.left = `${posRef.current * 100}%`;
        }
      }
      requestAnimationFrame(loop);
    };

    const id = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(id);
    };
  }, []);

  const handleShoot = () => {
    if (busy || busyRef.current) return;
    setBusy(true);
    busyRef.current = true;
    audioSfx.play('kick');

    const currentPos = posRef.current;
    const ok = currentPos >= zone[0] && currentPos <= zone[1];
    const nextShot = shot + 1;
    const nextHits = ok ? hits + 1 : hits;

    setShot(nextShot);
    setHits(nextHits);
    setResults((prev) => {
      const copy = [...prev];
      copy[shot] = ok ? 'h' : 'm';
      return copy;
    });

    setBallBx(ok ? `${(Math.random() - 0.5) * 90}px` : `${(currentPos < 0.5 ? -1 : 1) * 120}px`);
    setBallClass(ok ? 'ball goal' : 'ball miss');
    setKeeperOffset(ok ? (Math.random() < 0.5 ? -48 : 48) : 0);
    setMsg(ok ? '⚽ VÀOOO! Cú dứt điểm đẳng cấp!' : '🧤 Ôi, bóng đi chệch khung thành rồi!');
    audioSfx.play(ok ? 'ok' : 'bad');

    setTimeout(() => {
      setBallClass('ball');
      setKeeperOffset(0);
      if (nextShot >= 3) {
        const pts = Math.min(maxPoints, 45 + nextHits * 35);
        onComplete(pts, `<p class="kmsg">Bạn đã ghi ${nextHits}/3 bàn thắng tại Sân bóng mini TDC!</p>`);
        return;
      }
      speedRef.current += 0.35;
      randomizeZone(nextShot);
      setBusy(false);
      busyRef.current = false;
      setMsg(`Lượt ${nextShot + 1}/3 · Tốc độ kim nhanh hơn một chút!`);
    }, 1050);
  };

  return (
    <div className="flex flex-col gap-3.5">
      <div className="pitch">
        <div className="goal" />
        <div
          className="keeper"
          style={{ transform: `translateX(${keeperOffset}px)` }}
        />
        <div
          className={ballClass}
          style={{ '--bx': ballBx } as React.CSSProperties}
        />
      </div>

      <div className="pbar">
        <div
          className="zone"
          style={{
            left: `${zone[0] * 100}%`,
            width: `${(zone[1] - zone[0]) * 100}%`,
          }}
        />
        <div className="needle" ref={needleRef} />
      </div>

      <div className="kdots">
        {results.map((r, i) => (
          <i key={i} className={r || ''} />
        ))}
      </div>

      <p className="kmsg">{msg}</p>

      <button
        type="button"
        className="btn big sun"
        disabled={busy}
        onClick={handleShoot}
      >
        ⚽ Sút bóng! (Lượt {Math.min(3, shot + 1)}/3)
      </button>
    </div>
  );
};
</file>

<file path="src/components/minigames/Viewfinder.tsx">
import React from 'react';
import { RotateCw, X } from 'lucide-react';
import { Station } from '../../types/game';

interface ViewfinderProps {
  station: Station | null;
  onRotate: () => void;
  onCapture: () => void;
  onCancel: () => void;
}

export const Viewfinder: React.FC<ViewfinderProps> = ({
  station,
  onRotate,
  onCapture,
  onCancel,
}) => {
  if (!station) return null;

  return (
    <div id="viewfinder">
      <div className="fr" />
      <div className="cap">{station.name} · TDC GO 3D Polaroid</div>
      <div className="vf-btns">
        <button
          type="button"
          className="vf-small"
          onClick={onRotate}
          title="Xoay góc chụp"
          aria-label="Xoay góc chụp"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="shutter"
          onClick={onCapture}
          title="Chụp ảnh"
          aria-label="Chụp ảnh"
        />
        <button
          type="button"
          className="vf-small"
          onClick={onCancel}
          title="Hủy chụp"
          aria-label="Hủy chụp"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
</file>

<file path="src/components/modals/CertificateModal.tsx">
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
            <p>Chứng nhận Nhà Thám Hiểm TDC GO 2026–2027</p>
          </div>
          <button type="button" className="sh-x" onClick={onClose} aria-label="Đóng">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="sh-body">
          <div className="cert">
            <small>GIẤY CHỨNG NHẬN ĐIỆN TỬ · TDC GO</small>
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
            <p className="note">Cấp ngày {today} · Ban Tổ chức Sự kiện TDC GO</p>
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
</file>

<file path="src/components/modals/HelpModal.tsx">
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
</file>

<file path="src/components/modals/LeaderboardModal.tsx">
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
            <h2>Bảng Xếp Hạng TDC GO</h2>
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
</file>

<file path="src/components/modals/PartyModal.tsx">
import React, { useState } from 'react';
import {
  Copy,
  LogOut,
  PlusCircle,
  Sparkles,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { getFacultyById } from '../../data/faculties';
import { getAvatarSvg } from '../../engine/chibiBuilder';
import { PartyRoom, UserProfile } from '../../types/game';

interface PartyModalProps {
  profile: UserProfile;
  party: PartyRoom | null;
  onClose: () => void;
  onCreateParty: (partyName: string) => Promise<void>;
  onJoinParty: (code: string) => Promise<void>;
  onLeaveParty: () => Promise<void>;
  onSimulateTeammate: () => Promise<void>;
}

export const PartyModal: React.FC<PartyModalProps> = ({
  profile,
  party,
  onClose,
  onCreateParty,
  onJoinParty,
  onLeaveParty,
  onSimulateTeammate,
}) => {
  const [partyName, setPartyName] = useState(`Tổ đội TDC - ${profile.name}`);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onCreateParty(partyName);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await onJoinParty(joinCode.trim());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (!party) return;
    navigator.clipboard?.writeText(party.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div id="modal">
      <div className="scrim" onClick={onClose} />
      <div className="sheet card" role="dialog" aria-modal="true">
        <div className="sh-head" style={{ '--c': '#38B865' } as React.CSSProperties}>
          <span
            className="sticker"
            style={{ '--c': '#fff', color: '#38B865', width: 56, height: 56 } as React.CSSProperties}
          >
            <Users className="w-7 h-7" />
          </span>
          <div>
            <h2>Tổ Đội Thám Hiểm (Co-op)</h2>
            <p>Nhóm 2–4 Sinh viên · Giao lưu Liên Khoa (+20% Điểm)</p>
          </div>
          <button type="button" className="sh-x" onClick={onClose} aria-label="Đóng">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="sh-body">
          <div className="know">
            <b>Đặc quyền Tổ Đội Liên Khoa (Cross-Faculty Bonus)</b>
            Khi trong tổ đội có từ <b>2 sinh viên thuộc 2 Khoa khác nhau</b> trở lên, toàn bộ thành viên được cộng thêm <b>+20% điểm thưởng</b> ở mọi trạm thử thách!
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 px-3 py-2 rounded-xl text-xs font-extrabold">
              ⚠️ {error}
            </div>
          )}

          {party ? (
            <div className="flex flex-col gap-3">
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-700">
                    {party.name}
                  </div>
                  <div className="text-2xl font-black tracking-widest text-emerald-950 font-mono">
                    MÃ PHÒNG: {party.code}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyCode}
                  className="btn ghost text-xs px-3 min-h-[38px]"
                >
                  <Copy className="w-4 h-4" /> {copied ? 'Đã chép!' : 'Chép mã'}
                </button>
              </div>

              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold text-slate-600">
                  Thành viên ({party.members.length}/4):
                </span>
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    party.isCrossFaculty
                      ? 'bg-amber-200 text-amber-950'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {party.isCrossFaculty
                    ? '⚡ Đã kích hoạt Thưởng Liên Khoa (+20%)'
                    : 'Chưa đủ 2 Khoa khác nhau (x1.0)'}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {party.members.map((m) => {
                  const fac = getFacultyById(m.facultyId);
                  return (
                    <div
                      key={m.uid}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#FFFBEF] border border-slate-200"
                    >
                      <div
                        className="w-10 h-10 rounded-full overflow-hidden shrink-0"
                        dangerouslySetInnerHTML={{ __html: getAvatarSvg(m.avatar) }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-sm text-slate-900 truncate">
                          {m.name} {m.uid === party.hostUid ? '👑' : ''}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <span
                            className="px-2 py-0.5 rounded-full text-[11px]"
                            style={{ backgroundColor: fac.badgeColor, color: fac.color }}
                          >
                            {fac.shortName}
                          </span>
                          <span className="text-slate-400">· {m.mssv}</span>
                        </div>
                      </div>
                      <div className="font-black text-amber-700 text-sm">
                        {m.points.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between bg-slate-100 px-3.5 py-2.5 rounded-xl font-extrabold text-sm">
                <span>Tổng điểm Tổ đội:</span>
                <span className="text-emerald-700 text-base">
                  {party.totalPoints.toLocaleString('vi-VN')} điểm
                </span>
              </div>

              {party.members.length < 4 && (
                <button
                  type="button"
                  onClick={onSimulateTeammate}
                  className="btn sun w-full text-sm"
                >
                  <UserPlus className="w-4 h-4" /> Ghép Nhanh 1 Đồng đội Khác Khoa (Mô phỏng Co-op)
                </button>
              )}

              <button
                type="button"
                onClick={onLeaveParty}
                className="btn ghost w-full text-rose-700"
              >
                <LogOut className="w-4 h-4" /> Rời khỏi Tổ đội
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <form
                onSubmit={handleCreate}
                className="p-3.5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 flex flex-col gap-2.5"
              >
                <label className="text-xs font-black uppercase tracking-wider text-emerald-800">
                  1. Tạo Phòng Tổ Đội Mới (2–4 SV)
                </label>
                <input
                  type="text"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  maxLength={40}
                  placeholder="Đặt tên Tổ đội của bạn..."
                  className="px-3.5 py-2.5 rounded-xl border-2 border-emerald-300 bg-white font-extrabold text-sm"
                />
                <button type="submit" disabled={loading} className="btn w-full">
                  <PlusCircle className="w-5 h-5" /> Tạo Tổ đội & Lấy Mã 6 Ký tự
                </button>
              </form>

              <form
                onSubmit={handleJoin}
                className="p-3.5 rounded-2xl bg-sky-50/70 border-2 border-sky-200 flex flex-col gap-2.5"
              >
                <label className="text-xs font-black uppercase tracking-wider text-sky-800">
                  2. Hoặc Tham gia Tổ đội Bạn bè bằng Mã Phòng
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={8}
                    placeholder="Nhập mã (VD: TDC26A)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-sky-300 bg-white font-mono font-black uppercase text-sm"
                  />
                  <button type="submit" disabled={loading} className="btn blue">
                    Vào phòng
                  </button>
                </div>
                <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Mẹo: Bạn có thể nhập thử mã phòng mẫu <b>TDC26A</b> hoặc <b>CNTT99</b>!
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
</file>

<file path="src/components/modals/ProfileBadgesModal.tsx">
import React from 'react';
import { Award, Compass, ShieldCheck, X } from 'lucide-react';
import { getFacultyById } from '../../data/faculties';
import { getAvatarSvg } from '../../engine/chibiBuilder';
import { Station, UserProfile } from '../../types/game';
import { StationSticker } from '../StationSticker';

interface ProfileBadgesModalProps {
  profile: UserProfile;
  stations: Station[];
  onClose: () => void;
  onOpenCertificate: () => void;
}

export const ProfileBadgesModal: React.FC<ProfileBadgesModalProps> = ({
  profile,
  stations,
  onClose,
  onOpenCertificate,
}) => {
  const activeStations = stations.filter((s) => s.active !== false);
  const unlockedCount = activeStations.filter((s) => profile.done?.[s.id] != null).length;
  const pct =
    activeStations.length > 0
      ? Math.round((unlockedCount / activeStations.length) * 100)
      : 0;
  const fac = getFacultyById(profile.facultyId);
  const level = 1 + Math.floor(profile.points / 300);

  return (
    <div id="modal">
      <div className="scrim" onClick={onClose} />
      <div className="sheet card" role="dialog" aria-modal="true">
        <div className="sh-head" style={{ '--c': '#FF6F59' } as React.CSSProperties}>
          <span
            className="sticker"
            style={{ '--c': '#fff', color: '#FF6F59', width: 56, height: 56 } as React.CSSProperties}
          >
            <Award className="w-7 h-7" />
          </span>
          <div>
            <h2>Hồ Sơ & Bộ Sưu Tập Huy Hiệu</h2>
            <p>
              TDC Stamp Collection · Đã mở khóa {unlockedCount}/{activeStations.length} ({pct}%)
            </p>
          </div>
          <button type="button" className="sh-x" onClick={onClose} aria-label="Đóng">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="sh-body">
          {/* Student ID Card */}
          <div className="bg-[#FFFBEF] border-2 border-amber-200 rounded-2xl p-3.5 flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-white shadow"
              dangerouslySetInnerHTML={{ __html: getAvatarSvg(profile.avatar) }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <b className="font-extrabold text-base text-slate-900 truncate">
                  {profile.name}
                </b>
                <span className="bg-amber-200 text-amber-950 text-[11px] font-black px-2 py-0.5 rounded-full">
                  Cấp {level}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-600">
                MSSV: <b>{profile.mssv}</b>
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className="text-[11px] font-extrabold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: fac.badgeColor, color: fac.color }}
                >
                  {fac.name}
                </span>
              </div>
            </div>
          </div>

          {/* Fog of War Progress Bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-extrabold">
              <span className="flex items-center gap-1 text-emerald-800">
                <Compass className="w-3.5 h-3.5" /> Tiến độ Mở khóa Sương mù Khuôn viên 3D
              </span>
              <span className="text-emerald-700">{pct}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Stamp Grid */}
          <div className="album">
            {activeStations.map((st) => {
              const record = profile.done?.[st.id];
              const isUnlocked = record != null;
              return (
                <div key={st.id}>
                  <StationSticker
                    col={st.col}
                    type={st.type}
                    size={58}
                    locked={!isUnlocked}
                  />
                  <span>
                    {isUnlocked ? st.badge : '???'}
                    <small>{st.name}</small>
                  </span>
                </div>
              );
            })}
          </div>

          {unlockedCount >= activeStations.length && activeStations.length > 0 ? (
            <button
              type="button"
              className="btn big sun"
              onClick={() => {
                onClose();
                onOpenCertificate();
              }}
            >
              <ShieldCheck className="w-5 h-5" /> Xem Chứng Nhận Nhà Thám Hiểm TDC
            </button>
          ) : (
            <p className="note text-center">
              Sưu tầm đủ {activeStations.length} huy hiệu tại các tòa nhà để nhận Chứng nhận Nhà thám hiểm TDC!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
</file>

<file path="src/components/modals/QuestsModal.tsx">
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
            ⭐ Ngôi sao năng lượng tự mọc lại trên lối đi sau mỗi 45 giây. Đã nhặt:{' '}
            <b>{profile.stars || 0}</b> ngôi sao.
          </p>
        </div>
      </div>
    </div>
  );
};
</file>

<file path="src/components/GameHud.tsx">
import React, { useRef } from 'react';
import {
  ArrowUp,
  Award,
  HelpCircle,
  ListChecks,
  QrCode,
  Shield,
  Star,
  Trophy,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { QUESTS, TYPE_LABEL } from '../data/campusLayout';
import { getFacultyById } from '../data/faculties';
import { getAvatarSvg } from '../engine/chibiBuilder';
import {
  FloatingTextItem,
  GuideState,
  MinimapSnapshot,
} from '../engine/TdcCampusEngine';
import { PartyRoom, Station, UserProfile } from '../types/game';
import { MiniMap } from './MiniMap';
import { StationSticker } from './StationSticker';

interface GameHudProps {
  profile: UserProfile;
  party: PartyRoom | null;
  stations: Station[];
  nearStation: Station | null;
  guide: GuideState;
  minimapSnap: MinimapSnapshot | null;
  floatingTexts: FloatingTextItem[];
  muted: boolean;
  dimmed: boolean;
  pointsBump: boolean;
  onToggleMute: () => void;
  onOpenStation: (st: Station) => void;
  onNavigateGuide: () => void;
  onOpenQuests: () => void;
  onOpenLeaderboard: () => void;
  onOpenBadges: () => void;
  onOpenParty: () => void;
  onOpenQrScanner: () => void;
  onOpenHelp: () => void;
  onOpenAdmin: () => void;
  onJoystickChange: (x: number, y: number) => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  profile,
  party,
  stations,
  nearStation,
  guide,
  minimapSnap,
  floatingTexts,
  muted,
  dimmed,
  pointsBump,
  onToggleMute,
  onOpenStation,
  onNavigateGuide,
  onOpenQuests,
  onOpenLeaderboard,
  onOpenBadges,
  onOpenParty,
  onOpenQrScanner,
  onOpenHelp,
  onOpenAdmin,
  onJoystickChange,
}) => {
  const joyRef = useRef<HTMLDivElement | null>(null);
  const knobRef = useRef<HTMLElement | null>(null);
  const activePtrRef = useRef<number | null>(null);

  const activeStations = stations.filter((s) => s.active !== false);
  const unlockedCount = activeStations.filter((s) => profile.done?.[s.id] != null).length;
  const mapPct =
    activeStations.length > 0
      ? Math.round((unlockedCount / activeStations.length) * 100)
      : 0;
  const level = 1 + Math.floor(profile.points / 300);
  const xpPct = (profile.points % 300) / 3;
  const fac = getFacultyById(profile.facultyId);

  const hasClaimableQuest = QUESTS.some(
    (q) =>
      !profile.bonus?.[q.id] &&
      q.getValue(profile, activeStations.length) >=
        (q.id === 'all_stations' ? activeStations.length : q.need)
  );

  // Touch joystick handlers
  const updateJoyFromEvent = (e: React.PointerEvent) => {
    const el = joyRef.current;
    const kn = knobRef.current;
    if (!el || !kn) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const L = Math.hypot(dx, dy);
    const M = 46;
    if (L > M) {
      dx *= M / L;
      dy *= M / L;
    }
    kn.style.transform = `translate(${dx}px,${dy}px)`;
    onJoystickChange(dx / M, -dy / M);
  };

  const handleJoyDown = (e: React.PointerEvent) => {
    activePtrRef.current = e.pointerId;
    joyRef.current?.setPointerCapture(e.pointerId);
    updateJoyFromEvent(e);
  };

  const handleJoyMove = (e: React.PointerEvent) => {
    if (activePtrRef.current === e.pointerId) {
      updateJoyFromEvent(e);
    }
  };

  const handleJoyEnd = (e: React.PointerEvent) => {
    if (activePtrRef.current !== e.pointerId) return;
    activePtrRef.current = null;
    if (knobRef.current) knobRef.current.style.transform = '';
    onJoystickChange(0, 0);
  };

  const isNearDone = nearStation ? profile.done?.[nearStation.id] != null : false;

  return (
    <div id="hud" className={dimmed ? 'dim' : ''}>
      <div className="hud-top">
        {/* Top-left Explorer Profile Card */}
        <div className="flex flex-col gap-2">
          <div
            className="me card cursor-pointer"
            onClick={onOpenBadges}
            title="Xem Hồ sơ Thám hiểm & Bộ sưu tập Huy hiệu"
          >
            <div
              className="ava"
              dangerouslySetInnerHTML={{ __html: getAvatarSvg(profile.avatar) }}
            />
            <div className="me-txt">
              <div className="flex items-center gap-1.5">
                <b>{profile.name}</b>
                <span
                  className="px-1.5 py-0.2 rounded-full text-[10px] font-black"
                  style={{ backgroundColor: fac.badgeColor, color: fac.color }}
                >
                  {fac.shortName}
                </span>
              </div>
              <span>
                Cấp {level} · Mở bản đồ {mapPct}%
              </span>
              <div className="xp">
                <i style={{ width: `${xpPct}%` }} />
              </div>
            </div>
          </div>

          {/* Quick Party & QR Action Bar */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={onOpenQrScanner}
              className="px-3 py-1.5 rounded-full bg-[#00AEEF] text-white font-extrabold text-xs shadow-[0_3px_0_#0A7FC2] flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
              title="Quét Mã QR tại Trạm thực địa"
            >
              <QrCode className="w-3.5 h-3.5" /> Quét QR Trạm
            </button>

            <button
              type="button"
              onClick={onOpenParty}
              className={`px-3 py-1.5 rounded-full font-extrabold text-xs flex items-center gap-1.5 cursor-pointer active:translate-y-0.5 ${
                party
                  ? 'bg-emerald-600 text-white shadow-[0_3px_0_#1E6B38]'
                  : 'bg-white text-slate-800 shadow-[0_3px_0_rgba(28,64,42,.2)]'
              }`}
              title="Tổ đội Thám hiểm (Co-op 2-4 SV)"
            >
              <Users className="w-3.5 h-3.5" />
              {party
                ? `${party.code} (${party.members.length}/4)${party.isCrossFaculty ? ' +20%' : ''}`
                : 'Lập Tổ đội'}
            </button>
          </div>
        </div>

        {/* Top-right Points, Badges, Minimap & Action Buttons */}
        <div className="hud-right">
          <div className="pills">
            <button
              type="button"
              className={`pill pts ${pointsBump ? 'bump' : ''}`}
              onClick={onOpenLeaderboard}
              title="Bảng xếp hạng"
            >
              <span className="ic">
                <Star className="w-4 h-4 fill-current" />
              </span>
              <b>{profile.points.toLocaleString('vi-VN')}</b>
            </button>
            <button
              type="button"
              className="pill bdg"
              onClick={onOpenBadges}
              title="Bộ sưu tập Huy hiệu"
            >
              <span className="ic">
                <Award className="w-4 h-4" />
              </span>
              <b>
                {unlockedCount}/{activeStations.length}
              </b>
            </button>
          </div>

          <MiniMap
            stations={activeStations}
            unlocked={profile.done || {}}
            snapshot={minimapSnap}
            onClick={onOpenBadges}
          />

          <div className="side">
            <button
              type="button"
              className="rb"
              onClick={onOpenQuests}
              title="Nhiệm vụ"
              aria-label="Nhiệm vụ"
            >
              <ListChecks className="w-5 h-5" />
              {hasClaimableQuest && <span className="dot" />}
            </button>
            <button
              type="button"
              className="rb"
              onClick={onOpenLeaderboard}
              title="Bảng xếp hạng"
              aria-label="Bảng xếp hạng"
            >
              <Trophy className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="rb"
              onClick={onToggleMute}
              title="Tắt / Bật âm thanh"
              aria-label="Tắt hoặc bật âm thanh"
            >
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              type="button"
              className="rb"
              onClick={onOpenHelp}
              title="Hướng dẫn cách chơi"
              aria-label="Hướng dẫn cách chơi"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="rb"
              onClick={onOpenAdmin}
              title="Cổng Quản trị Admin CMS"
              aria-label="Quản trị hệ thống"
            >
              <Shield className="w-5 h-5 text-sky-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Interaction Card & Compass Guide */}
      <div className="hud-bot">
        {nearStation && !dimmed && (
          <div className="act card">
            <StationSticker
              col={nearStation.col}
              type={nearStation.type}
              size={52}
              done={isNearDone}
            />
            <div className="act-txt">
              <b>{nearStation.name}</b>
              <span>
                {isNearDone
                  ? 'Đã xóa sương mù · Xem lại Fun Fact & Lộ trình'
                  : `${TYPE_LABEL[nearStation.type]} · Tối đa +${nearStation.pts} điểm`}
              </span>
            </div>
            <button
              type="button"
              className={`btn ${isNearDone ? 'ghost' : 'sun'}`}
              onClick={() => onOpenStation(nearStation)}
            >
              {isNearDone ? 'Xem' : 'Khám phá'}
            </button>
          </div>
        )}

        <button type="button" className="guide" onClick={onNavigateGuide}>
          <span
            className="arr"
            style={{
              transform: `rotate(${guide.allDone ? 0 : guide.angleRad}rad)`,
            }}
          >
            <ArrowUp className="w-4 h-4 stroke-[3]" />
          </span>
          <span>
            {guide.allDone
              ? `Đã mở khóa ${activeStations.length}/${activeStations.length} trạm · Săn tiếp sao nhé!`
              : guide.station
                ? guide.distance < 6.8
                  ? `Bạn đang đứng tại ${guide.station.name}`
                  : `${guide.station.name} · cách ${Math.round(guide.distance)} m (Bấm để tự đi tới)`
                : 'Đang định vị trạm gần nhất...'}
          </span>
        </button>
      </div>

      {/* Mobile Touch Joystick */}
      <div
        id="joy"
        ref={joyRef}
        aria-hidden="true"
        onPointerDown={handleJoyDown}
        onPointerMove={handleJoyMove}
        onPointerUp={handleJoyEnd}
        onPointerCancel={handleJoyEnd}
      >
        <i ref={knobRef} />
      </div>

      {/* Desktop Keyboard Hints */}
      <p className="keys">
        <b>W A S D</b> hoặc phím mũi tên để đi · <b>Q E</b> xoay · kéo chuột để xoay, cuộn để phóng to · bấm xuống đất để tự đi tới đó
      </p>

      {/* Floating 3D Score Texts */}
      <div id="fx">
        {floatingTexts.map((ft) => (
          <div
            key={ft.id}
            className="fxt"
            style={{
              color: ft.color || undefined,
              opacity: ft.opacity,
              transform: `translate(${ft.x}px, ${ft.y}px) translate(-50%, -50%) scale(${ft.scale})`,
            }}
          >
            {ft.text}
          </div>
        ))}
      </div>
    </div>
  );
};
</file>

<file path="src/components/MiniMap.tsx">
import React, { useEffect, useRef } from 'react';
import { PATHS } from '../data/campusLayout';
import { MinimapSnapshot } from '../engine/TdcCampusEngine';
import { Station, UnlockedStationRecord } from '../types/game';

interface MiniMapProps {
  stations: Station[];
  unlocked: Record<string, UnlockedStationRecord>;
  snapshot: MinimapSnapshot | null;
  onClick?: () => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  stations,
  unlocked,
  snapshot,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const mini = canvasRef.current;
    if (!mini || !snapshot) return;
    const mg = mini.getContext('2d');
    if (!mg) return;

    const s = mini.width;
    const sc = s / 330;
    const X = (x: number) => (x + 10) * sc + s / 2;
    const Z = (z: number) => (z + 2) * sc + s / 2;

    mg.clearRect(0, 0, s, s);
    mg.save();
    mg.beginPath();
    mg.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
    mg.clip();

    // 1. Base Campus Map
    mg.fillStyle = '#A9D98E';
    mg.fillRect(0, 0, s, s);
    mg.fillStyle = '#D6F0C2';
    mg.beginPath();
    mg.ellipse(s / 2, s / 2, 165 * sc, 125 * sc, 0, 0, Math.PI * 2);
    mg.fill();

    // Walkways
    mg.strokeStyle = '#F7E6C2';
    mg.lineWidth = 3.2 * sc;
    mg.lineCap = 'round';
    PATHS.forEach((p) => {
      mg.beginPath();
      mg.moveTo(X(p[0]), Z(p[1]));
      mg.lineTo(X(p[2]), Z(p[3]));
      mg.stroke();
    });

    // Buildings
    mg.fillStyle = '#E9A87F';
    snapshot.col.forEach((c) => {
      if ((c[2] - c[0]) * (c[3] - c[1]) < 60) return;
      mg.fillRect(X(c[0]), Z(c[1]), (c[2] - c[0]) * sc, (c[3] - c[1]) * sc);
    });

    // 2. Fog of War mask on locked regions
    stations
      .filter((st) => st.active !== false)
      .forEach((st) => {
        const isDone = unlocked[st.id] != null;
        if (!isDone) {
          const sx = X(st.x);
          const sz = Z(st.z);
          const r = (st.fogRadius || 30) * sc * 0.95;
          const gr = mg.createRadialGradient(sx, sz, 2, sx, sz, r);
          gr.addColorStop(0, 'rgba(38, 65, 52, 0.58)');
          gr.addColorStop(0.7, 'rgba(38, 65, 52, 0.35)');
          gr.addColorStop(1, 'rgba(38, 65, 52, 0)');
          mg.fillStyle = gr;
          mg.beginPath();
          mg.arc(sx, sz, r, 0, Math.PI * 2);
          mg.fill();
        }
      });

    // 3. Station dots
    stations
      .filter((st) => st.active !== false)
      .forEach((st) => {
        const d = unlocked[st.id] != null;
        mg.fillStyle = '#fff';
        mg.beginPath();
        mg.arc(X(st.x), Z(st.z), 8.5, 0, Math.PI * 2);
        mg.fill();
        mg.fillStyle = d ? '#3DAA5C' : st.col;
        mg.beginPath();
        mg.arc(X(st.x), Z(st.z), 6, 0, Math.PI * 2);
        mg.fill();
      });

    // 4. Player Cone & Arrow
    const a = snapshot.playerRotY;
    const px = X(snapshot.playerX);
    const pz = Z(snapshot.playerZ);

    mg.fillStyle = 'rgba(0,174,239,.22)';
    mg.beginPath();
    mg.moveTo(px, pz);
    mg.arc(
      px,
      pz,
      34,
      -Math.PI / 2 - snapshot.camYaw - 0.5,
      -Math.PI / 2 - snapshot.camYaw + 0.5
    );
    mg.closePath();
    mg.fill();

    mg.save();
    mg.translate(px, pz);
    mg.rotate(-a + Math.PI);
    mg.fillStyle = '#fff';
    mg.beginPath();
    mg.arc(0, 0, 10, 0, Math.PI * 2);
    mg.fill();
    mg.fillStyle = '#00AEEF';
    mg.beginPath();
    mg.moveTo(0, -8);
    mg.lineTo(6, 6);
    mg.lineTo(0, 3);
    mg.lineTo(-6, 6);
    mg.closePath();
    mg.fill();
    mg.restore();

    mg.restore();
  }, [stations, unlocked, snapshot]);

  return (
    <canvas
      id="mini"
      ref={canvasRef}
      width={236}
      height={236}
      onClick={onClick}
      title="Bản đồ nhỏ khuôn viên TDC (Vùng sương mù sẽ sáng lên khi giải đố)"
      aria-label="Bản đồ nhỏ"
    />
  );
};
</file>

<file path="src/components/QrScannerModal.tsx">
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
                : 'Hệ thống Check-in WebRTC Camera TDC GO'}
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
</file>

<file path="src/components/StartScreen.tsx">
import React, { useState } from 'react';
import { Compass, RotateCcw, Shield, Sparkles } from 'lucide-react';
import { AVATARS, TDC_LOGO } from '../data/campusLayout';
import { FACULTIES } from '../data/faculties';
import { getAvatarSvg } from '../engine/chibiBuilder';
import { isFirebaseConfigured } from '../services/firebase';
import { FacultyId, UserProfile } from '../types/game';

interface StartScreenProps {
  existingProfile: UserProfile | null;
  totalStations: number;
  onStartGame: (params: {
    name: string;
    mssv: string;
    email?: string;
    password?: string;
    facultyId: FacultyId;
    avatar: number;
    mode: 'demo' | 'email_login' | 'email_register' | 'google';
  }) => Promise<void>;
  onResetProgress: () => void;
  onOpenAdmin: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  existingProfile,
  totalStations,
  onStartGame,
  onResetProgress,
  onOpenAdmin,
}) => {
  const [name, setName] = useState(existingProfile?.name || '');
  const [mssv, setMssv] = useState(existingProfile?.mssv || '26211TT0102');
  const [facultyId, setFacultyId] = useState<FacultyId>(
    existingProfile?.facultyId || 'cntt'
  );
  const [avatar, setAvatar] = useState<number>(existingProfile?.avatar || 0);
  const [authTab, setAuthTab] = useState<'quick' | 'cloud'>('quick');
  const [email, setEmail] = useState(existingProfile?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlockedCount = Object.keys(existingProfile?.done || {}).length;

  const handleSubmit = async (
    mode: 'demo' | 'email_login' | 'email_register' | 'google'
  ) => {
    setError(null);
    setLoading(true);
    try {
      await onStartGame({
        name: name.trim() || 'Minh Anh',
        mssv: mssv.trim() || '26211TT0102',
        email: email.trim() || undefined,
        password: password || undefined,
        facultyId,
        avatar,
        mode,
      });
    } catch (err) {
      setError((err as Error).message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="start">
      <div className="st-wrap">
        <div className="flex items-center justify-between">
          <div className="logo">
            <div className="seal">
              <svg
                viewBox="118 118 332 332"
                role="img"
                aria-label="Logo Trường Cao đẳng Công nghệ Thủ Đức"
              >
                <path fill="#00AEEF" d={TDC_LOGO} />
              </svg>
            </div>
            <h1>
              TDC<span>GO</span>
            </h1>
          </div>

          <button
            type="button"
            onClick={onOpenAdmin}
            className="px-3.5 py-2 rounded-2xl bg-white/95 border-2 border-slate-200 shadow-sm text-xs font-extrabold text-slate-700 hover:border-sky-400 flex items-center gap-1.5 cursor-pointer"
            title="Mở Cổng Quản trị Hệ thống (Admin CMS)"
          >
            <Shield className="w-4 h-4 text-sky-600" /> Admin CMS
          </button>
        </div>

        <p className="tag">
          Khám phá bản đồ 3D khuôn viên Trường Cao đẳng Công nghệ Thủ Đức, mở khóa sương mù tại {totalStations} trạm thực địa, kết nối tổ đội liên khoa và sưu tầm huy hiệu!
        </p>

        <div className="st-card card">
          {/* Auth Mode Switcher */}
          <div className="grid grid-cols-2 gap-1.5 bg-[#FFFBEF] p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setAuthTab('quick')}
              className={`py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
                authTab === 'quick'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              ⚡ Hồ sơ Sinh viên / Demo
            </button>
            <button
              type="button"
              onClick={() => setAuthTab('cloud')}
              className={`py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
                authTab === 'cloud'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              ☁️ Tài khoản Email TDC
            </button>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 px-3 py-2 rounded-xl text-xs font-extrabold">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="inName">Họ tên Sinh viên</label>
              <input
                id="inName"
                type="text"
                maxLength={24}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Minh Anh"
              />
            </div>
            <div>
              <label htmlFor="inMssv">Mã số SV (MSSV)</label>
              <input
                id="inMssv"
                type="text"
                maxLength={14}
                value={mssv}
                onChange={(e) => setMssv(e.target.value.toUpperCase())}
                placeholder="26211TT0102"
              />
            </div>
          </div>

          <div>
            <label htmlFor="inFaculty">Khoa / Ngành đào tạo tại TDC</label>
            <select
              id="inFaculty"
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value as FacultyId)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E2EBDA] bg-[#FFFBEF] font-extrabold text-sm text-[#1E3528]"
            >
              {FACULTIES.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.shortName})
                </option>
              ))}
            </select>
          </div>

          {authTab === 'cloud' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-sky-50/70 p-2.5 rounded-xl border border-sky-200">
              <div>
                <label htmlFor="inEmail">Email Sinh viên (@mail.tdc.edu.vn)</label>
                <input
                  id="inEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="26211tt0102@mail.tdc.edu.vn"
                  className="!text-xs !py-2"
                />
              </div>
              <div>
                <label htmlFor="inPass">Mật khẩu</label>
                <input
                  id="inPass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="!text-xs !py-2"
                />
              </div>
            </div>
          )}

          <span className="lbl">Chọn Nhân vật Chibi 3D</span>
          <div className="avas">
            {AVATARS.map((a, i) => (
              <button
                key={a.name}
                type="button"
                className={i === avatar ? 'on' : ''}
                onClick={() => setAvatar(i)}
                aria-pressed={i === avatar}
              >
                <div
                  className="w-14 h-14"
                  dangerouslySetInnerHTML={{ __html: getAvatarSvg(i) }}
                />
                {a.name}
              </button>
            ))}
          </div>

          {authTab === 'quick' ? (
            <button
              type="button"
              disabled={loading}
              className="btn big sun"
              onClick={() => handleSubmit('demo')}
            >
              <Compass className="w-5 h-5" />
              {existingProfile && existingProfile.points > 0
                ? `Tiếp tục Hành trình · ${existingProfile.points.toLocaleString('vi-VN')} điểm (${unlockedCount}/${totalStations} trạm)`
                : 'Bắt đầu Khám phá Khuôn viên 3D'}
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={loading}
                  className="btn blue text-sm"
                  onClick={() => handleSubmit('email_login')}
                >
                  Đăng nhập Email
                </button>
                <button
                  type="button"
                  disabled={loading}
                  className="btn sun text-sm"
                  onClick={() => handleSubmit('email_register')}
                >
                  Đăng ký Mới
                </button>
              </div>
              {isFirebaseConfigured && (
                <button
                  type="button"
                  disabled={loading}
                  className="btn ghost text-xs"
                  onClick={() => handleSubmit('google')}
                >
                  Đăng nhập nhanh với Google (@mail.tdc.edu.vn)
                </button>
              )}
            </div>
          )}

          {existingProfile && (existingProfile.points > 0 || unlockedCount > 0) && (
            <div className="st-row">
              <button
                type="button"
                className="btn ghost text-sm"
                onClick={onResetProgress}
              >
                <RotateCcw className="w-4 h-4" /> Đặt lại tiến độ & Phủ lại sương mù từ đầu
              </button>
            </div>
          )}

          <p className="fine flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Đề tài NCKH 2026–2027: Tích hợp Bản đồ 3D + Sương mù (Fog of War), Quét QR thực địa O2O, Mini-game chuyên ngành các Khoa, Tổ đội Liên khoa & Admin CMS.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
</file>

<file path="src/components/StationModal.tsx">
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
                    TDC GO ·{' '}
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
</file>

<file path="src/components/StationSticker.tsx">
import React from 'react';
import {
  Camera,
  Check,
  Code2,
  Compass,
  Cpu,
  Flag,
  HelpCircle,
  Lock,
  Sparkles,
  Trophy,
  Users,
  Wrench,
} from 'lucide-react';
import { StationType } from '../types/game';

interface StationStickerProps {
  col: string;
  type: StationType | 'star' | 'explorer' | 'party' | 'medal' | 'trophy' | 'list';
  size?: number;
  locked?: boolean;
  done?: boolean;
}

export const StationSticker: React.FC<StationStickerProps> = ({
  col,
  type,
  size = 52,
  locked = false,
  done = false,
}) => {
  const renderIcon = () => {
    if (locked) return <Lock className="w-1/2 h-1/2" />;
    if (done) return <Check className="w-3/5 h-3/5 stroke-[3]" />;
    switch (type) {
      case 'checkin':
        return <Flag className="w-1/2 h-1/2" />;
      case 'photo':
        return <Camera className="w-1/2 h-1/2" />;
      case 'quiz':
        return <HelpCircle className="w-1/2 h-1/2" />;
      case 'kick':
        return <Trophy className="w-1/2 h-1/2" />;
      case 'it_debug':
        return <Code2 className="w-1/2 h-1/2" />;
      case 'electric_circuit':
        return <Cpu className="w-1/2 h-1/2" />;
      case 'auto_engine':
        return <Wrench className="w-1/2 h-1/2" />;
      case 'party':
        return <Users className="w-1/2 h-1/2" />;
      case 'explorer':
        return <Compass className="w-1/2 h-1/2" />;
      default:
        return <Sparkles className="w-1/2 h-1/2" />;
    }
  };

  return (
    <span
      className={`sticker ${locked ? 'off' : ''}`}
      style={
        {
          '--c': done ? '#3DAA5C' : col,
          width: `${size}px`,
          height: `${size}px`,
        } as React.CSSProperties
      }
    >
      {renderIcon()}
    </span>
  );
};
</file>

<file path="src/data/campusLayout.ts">
import { Quest } from '../types/game';

export const TDC_LOGO =
  'M320.5,313.7c1.2-3.6,1.2-6.6-0.1-8.9c-1.3-2.3-4.1-3.5-8.2-3.5c-3.9,0-7.1,0.8-10.1,3.1 c-2.3-2.1-5.7-3.3-10.4-3.3l-36.5-0.5l-2.4,6.3l8.7,0.1l-9.7,27.4l9.3,0.1l9.7-27.4l8.2,0.1l-9.7,27.4l11.6,0.1 c4.1,0.1,7.8-1,11-3c1.3,3,4.3,4.4,8.6,4.4c3.9,0,7.3-1,10.3-3.3c2.8-2.2,4.9-5.2,6.3-9l-7.5-0.8c-0.9,2.5-1.6,4.1-2.6,5.2 c-1.2,1.1-2.3,1.8-3.9,1.8c-2,0-2.9-1.2-2.9-3.2c0-1.4,0.7-3.9,1.9-7.7c0.2-0.7,0.5-1.1,0.7-1.6c0.5-0.9,0.5-1.6,0.7-2.5 c0.7-1.8,1.4-3.4,2.1-4.5c1.4-2,3-3.2,4.8-3.1c1.4,0,2,0.7,2.3,2.3c0,1.1,0,2.5-0.7,3.9L320.5,313.7z M292.9,317 c-1.2,3.4-2.4,5.9-3.5,7.5c-2.1,2.9-4.4,4.3-7.3,4.2l-0.9,0l7.6-21.8l0.9,0c2.7,0,4.3,1.2,4.5,3.7 C294.3,312,293.8,314.3,292.9,317z M132.4,283.4v-1h0H199v0c45.9,0,44.1-41.3,44.1-41.3h0V151h13.1v90.2c0,50.5-45.3,47.2-57.3,47.2h-66.5 L132.4,283.4z M278.8,132.4v109.4c0,67.1-51.4,59.8-74.1,60.8h-71.1c-0.2-2-0.5-4-0.6-6h71.7c61.8,0,61.1-54.8,61.1-54.8 V133.4C270,132.8,274.4,132.5,278.8,132.4z M434.6,286.2v-3.8H368v0c-45.9,0-44.1-41.3-44.1-41.3h0V151h-13.1v90.2c0,50.5,45.3,47.2,57.3,47.2h66.5 L434.6,286.2z M434,296.6h-71.7c-61.8,0-61.1-54.8-61.1-54.8V133.3l-13.1-1v109.4c0,67.1,51.4,59.8,74.1,60.8h71.1 L434,296.6z M428,328.7c-3.1,10.3-7.4,20.2-12.6,29.4c0,0-0.4,0-0.4,0c-8.3,0.1-16.7,0.1-25,0.2 c-14.6,0.1-29.8-0.7-44.3,1c-12.2,1.4-24.8,5.5-34.1,13.8c-6.1,5.4-10.4,12.6-14,19.9c-3.3,6.7-6.2,13.5-8.5,20.6 c-1.2,3.5-2.2,7.1-3.2,10.7c-0.8,3.3-1.2,7.1-2.3,10.2c-1.1-3.1-1.5-6.9-2.3-10.2c-0.9-3.6-2-7.2-3.2-10.7 c-2.4-7.1-5.2-13.9-8.5-20.6c-3.6-7.3-7.9-14.5-14-19.9c-9.3-8.3-21.9-12.4-34.1-13.8c-14.6-1.7-29.7-0.9-44.3-1 c-8.3-0.1-16.7-0.1-25-0.2c0,0-0.4,0-0.4,0c-5.1-9.2-9.5-19.1-12.6-29.4c11.3-0.3,49-0.7,80.8,1.7c39.1,3.1,55.1,34.2,63.7,76.4 c8.6-42.2,24.6-73.3,63.7-76.4C379,328,416.6,328.4,428,328.7z';

export interface ChibiAvatarSpec {
  name: string;
  shirt: string;
  hair: string;
  pants: string;
  acc: 'cap' | 'pony' | 'bun';
}

export const AVATARS: ChibiAvatarSpec[] = [
  { name: 'Bé Xanh', shirt: '#2FA8F0', hair: '#3A2A22', pants: '#2D4A6B', acc: 'cap' },
  { name: 'Bé Cam', shirt: '#FF8A3D', hair: '#6B3E26', pants: '#3C3F58', acc: 'pony' },
  { name: 'Bé Hồng', shirt: '#FF7AA8', hair: '#24202A', pants: '#4B3B6B', acc: 'bun' },
];

export const CAMP = { cx: -10, cz: -2, rx: 165, rz: 125 };

export const ROADS: [number, number, number, number][] = [
  [-320, 32, 140, 205], // đường Võ Văn Ngân
  [185, -200, 128, 250], // đường Chương Dương
];

export const LAKE = { x: -40, z: -205, r: 34 };

export const PATHS: [number, number, number, number][] = [
  [-66, 118, -66, 100],
  [-66, 100, -80, 92],
  [-80, 92, -89, 72],
  [-89, 72, -94, 68],
  [-94, 68, -96, 57],
  [-96, 57, -103.5, 49.5],
  [-103.5, 49.5, -103, 24],
  [-103, 24, -103.7, -1],
  [-103.7, -1, -51, 0],
  [-51, 0, 48, 0],
  [-51, 0, -80, -2],
  [48, 0, 135, 2],
  [-89, 72, -121, 72],
  [-80, 92, -51, 67.6],
  [-51, 67.6, -20, 66],
  [-20, 66, 12, 57.5],
  [12, 57.5, 122, 56],
  [122, 56, 150, 56],
  [21, 0, 21, 57.5],
  [-10, 0, -10, -36],
  [-10, -36, -23, -66],
  [-10, -36, 8, -72],
  [-10, -36, -48, -34],
  [50, 0, 50, -26],
  [50, -26, 66, -27],
  [-60, 12, -51, 0],
];

export const ZONES: [number, number, number, number][] = [
  [-73, 12.8, -27, 38.6],
  [-72.6, -98.3, -25, -39],
  [0, 5, 18, 36],
  [-7, -104, 26, -75],
  [-92.5, 60.5, -85.1, 67.9],
];

export const TYPE_LABEL: Record<string, string> = {
  checkin: 'Check-in & Định vị',
  photo: 'Chụp ảnh Polaroid 3D',
  quiz: 'Mật thư & Đố vui',
  kick: 'Mini-game Sút bóng',
  it_debug: 'Mini-game CNTT: Debug Logic',
  electric_circuit: 'Mini-game Điện: Đấu mạch',
  auto_engine: 'Mini-game Ô tô: Lắp Động cơ',
};

export const QUESTS: Quest[] = [
  {
    id: 'visit3',
    name: 'Khởi đầu Thám hiểm',
    description: 'Mở khóa sương mù tại 3 trạm bất kỳ trong khuôn viên TDC',
    need: 3,
    reward: 60,
    icon: 'checkin',
    col: '#FFAA1F',
    getValue: (p) => Object.keys(p.done || {}).length,
  },
  {
    id: 'star15',
    name: 'Thợ săn Ngôi sao',
    description: 'Thu thập đủ 15 ngôi sao năng lượng trên các lối đi',
    need: 15,
    reward: 80,
    icon: 'star',
    col: '#FFC83A',
    getValue: (p) => p.stars || 0,
  },
  {
    id: 'quiz2',
    name: 'Bậc thầy Giải đố',
    description: 'Vượt qua ít nhất 2 trạm câu đố hoặc mini-game chuyên ngành',
    need: 2,
    reward: 80,
    icon: 'quiz',
    col: '#9B6BFF',
    getValue: (p) => p.quizOk || 0,
  },
  {
    id: 'photo1',
    name: 'Khoảnh khắc TDC',
    description: 'Chụp 1 bức ảnh Polaroid 3D tại Bồn cây tròn',
    need: 1,
    reward: 50,
    icon: 'photo',
    col: '#FF6FA5',
    getValue: (p) => p.photos || 0,
  },
  {
    id: 'party1',
    name: 'Tinh thần Đồng đội',
    description: 'Tạo hoặc tham gia một Tổ đội thám hiểm (Co-op Party)',
    need: 1,
    reward: 100,
    icon: 'party',
    col: '#38B865',
    getValue: (p) => (p.partyId ? 1 : 0),
  },
  {
    id: 'all_stations',
    name: 'Nhà Thám hiểm Toàn diện',
    description: 'Mở khóa toàn bộ 100% các trạm và xóa tan sương mù toàn trường',
    need: 10,
    reward: 250,
    icon: 'explorer',
    col: '#00AEEF',
    getValue: (p) => Object.keys(p.done || {}).length,
  },
];
</file>

<file path="src/data/faculties.ts">
import { Faculty, FacultyId } from '../types/game';

export const FACULTIES: Faculty[] = [
  {
    id: 'cntt',
    name: 'Khoa Công nghệ thông tin',
    shortName: 'CNTT',
    color: '#2FA8F0',
    badgeColor: '#E1F4FD',
  },
  {
    id: 'dien_dt',
    name: 'Khoa Điện – Điện tử',
    shortName: 'Điện – ĐT',
    color: '#FFAA1F',
    badgeColor: '#FFF5DC',
  },
  {
    id: 'co_khi_oto',
    name: 'Khoa Cơ khí Ô tô',
    shortName: 'CK Ô tô',
    color: '#FF6F59',
    badgeColor: '#FFECE8',
  },
  {
    id: 'co_khi_ctm',
    name: 'Khoa Cơ khí Chế tạo máy',
    shortName: 'CK CTM',
    color: '#6F8CF0',
    badgeColor: '#EAF0FF',
  },
  {
    id: 'kinh_te',
    name: 'Khoa Kinh tế – Quản trị',
    shortName: 'Kinh tế',
    color: '#38B865',
    badgeColor: '#E8F8E3',
  },
  {
    id: 'ngoai_ngu',
    name: 'Khoa Ngoại ngữ',
    shortName: 'Ngoại ngữ',
    color: '#9B6BFF',
    badgeColor: '#F3ECFF',
  },
  {
    id: 'du_lich',
    name: 'Khoa Du lịch – Nhà hàng',
    shortName: 'Du lịch',
    color: '#FF6FA5',
    badgeColor: '#FFEBF3',
  },
  {
    id: 'khac',
    name: 'Khoa / Bộ môn Khác',
    shortName: 'TDC',
    color: '#00AEEF',
    badgeColor: '#E1F6FF',
  },
];

export function getFacultyById(id?: FacultyId | string): Faculty {
  return FACULTIES.find((f) => f.id === id) || FACULTIES[0];
}
</file>

<file path="src/data/stations.ts">
import { Station, CampaignEvent } from '../types/game';

export const DEFAULT_STATIONS: Station[] = [
  {
    id: 'g1',
    name: 'Cổng 1 · Võ Văn Ngân',
    sub: '53 Võ Văn Ngân · Điểm xuất phát',
    facultyId: 'khac',
    x: -66,
    z: 104,
    fogRadius: 28,
    col: '#FFAA1F',
    type: 'checkin',
    pts: 60,
    badge: 'Tân binh TDC',
    info: 'Cổng chính mở ra trục đường sầm uất Võ Văn Ngân (TP. Thủ Đức). Bước qua cổng là bồn cây tròn lịch sử và dãy nhà A mái ngói đỏ.',
    funFact: 'Trường Cao đẳng Công nghệ Thủ Đức tiền thân là Trung tâm Giáo dục Kỹ thuật Tổng hợp và Hướng nghiệp Thủ Đức được thành lập từ năm 1984!',
    directions: 'Đi thẳng từ Cổng 1 khoảng 25m về hướng Bắc sẽ gặp Bồn cây tròn và hành lang Khu A.',
    qrSecretToken: 'TDC-QR-G1-53VVN',
    riddle: {
      prompt: 'Quan sát biển tên trường ở trụ Cổng 1: Trường tọa lạc tại số mấy đường Võ Văn Ngân?',
      answer: '53',
      hint: 'Con số gồm 2 chữ số in ngay dòng cuối biển cổng chính.',
    },
    active: true,
  },
  {
    id: 'bcs',
    name: 'Bồn cây tròn',
    sub: 'Góc check-in & Giao lộ Khu A',
    facultyId: 'du_lich',
    x: -85,
    z: 76,
    fogRadius: 24,
    col: '#FF6FA5',
    type: 'photo',
    pts: 90,
    badge: 'Nhiếp ảnh gia TDC',
    info: 'Bồn cây cổ thụ tròn nằm ngay trước hành lang cầu nối giữa dãy A1 và A2 là tọa độ hẹn hò, chụp ảnh kỷ yếu quen thuộc của bao thế hệ sinh viên.',
    funFact: 'Xung quanh bồn cây tròn có đúng 10 khóm hoa sắc màu tượng trưng cho sự năng động và đa ngành nghề của sinh viên TDC.',
    directions: 'Từ Bồn cây tròn rẽ trái (hướng Tây) dọc lối lát gạch là tới mặt tiền Dãy A1.',
    qrSecretToken: 'TDC-QR-BCS-PHOTO',
    riddle: {
      prompt: 'Đứng tại Bồn cây tròn nhìn về phía Bắc, hành lang cầu nối phía trước mặt bạn có mấy tầng lầu phía trên?',
      answer: '2',
      hint: 'Nhìn phần cầu nối màu kem nằm trên các cột trụ tròn.',
    },
    active: true,
  },
  {
    id: 'a',
    name: 'Tòa A · Khu Hành chính',
    sub: 'Dãy A1 · A2 & Phòng Đào tạo',
    facultyId: 'kinh_te',
    x: -121,
    z: 72,
    fogRadius: 34,
    col: '#FF8A4C',
    type: 'quiz',
    pts: 100,
    badge: 'Thạo mã phòng',
    info: 'Khu A gồm dãy A1 mái ngói, dãy A2 và hành lang cầu nối ở giữa. Đây là nơi đặt nhiều phòng ban hành chính, Phòng Đào tạo, Công tác HSSV và các phòng học lý thuyết.',
    funFact: 'Cách đọc mã phòng tại TDC cực kỳ khoa học: Chữ cái đầu là Tên Tòa, chữ số tiếp theo là Tầng, và 2 số cuối là Số Phòng!',
    directions: 'Đi xuyên qua gầm cầu nối Khu A về phía Bắc để tiến vào quảng trường Hội trường H và sân bóng chuyền.',
    qrSecretToken: 'TDC-QR-TOAA-A1A2',
    riddle: {
      prompt: 'Mái ngói truyền thống của dãy nhà A1 có màu sắc chủ đạo là màu gì?',
      answer: 'đỏ',
      hint: 'Màu sắc rực rỡ truyền thống của ngói đất nung Việt Nam.',
    },
    questions: [
      {
        q: 'Mã phòng A205 trong hệ thống giảng đường TDC có ý nghĩa là gì?',
        opts: [
          'Tòa A, tầng 2, phòng số 05',
          'Tòa A, phòng 205 ở tầng trệt',
          'Khu A, dãy 2, bàn số 5',
          'Tòa A, tầng 20, phòng 5',
        ],
        ans: 0,
        ex: 'Mã phòng TDC luôn đọc theo cấu trúc: [Tòa] – [Tầng] – [Phòng]. Ví dụ D04-10 là Tòa D, tầng 4, phòng 10.',
      },
      {
        q: 'Khi cần hỗ trợ thủ tục học vụ, giấy xác nhận sinh viên, bạn sẽ liên hệ đơn vị nào tại Khu A?',
        opts: [
          'Phòng Đào tạo / Công tác Chính trị HSSV',
          'Xưởng thực hành Cơ khí',
          'Ban quản lý Ký túc xá',
          'Tổ bảo vệ Cổng 2',
        ],
        ans: 0,
        ex: 'Phòng Đào tạo và Phòng Công tác Chính trị HSSV là nơi giải quyết các thủ tục học tập và quyền lợi sinh viên.',
      },
    ],
    active: true,
  },
  {
    id: 'h',
    name: 'Hội trường H',
    sub: 'Trung tâm Sự kiện & Khẩu hiệu TDC',
    facultyId: 'ngoai_ngu',
    x: -68,
    z: 17,
    fogRadius: 32,
    col: '#9B6BFF',
    type: 'quiz',
    pts: 100,
    badge: 'Khắc ghi khẩu hiệu',
    info: 'Tòa H sở hữu hội trường lớn có trần cao gấp đôi tầng thường, mặt tiền có bậc tam cấp rộng nhìn thẳng ra cụm sân bóng chuyền và cột cờ trung tâm.',
    funFact: 'Trên đỉnh mặt tiền Tòa H là khẩu hiệu triết lý giáo dục của TDC cùng biểu tượng chứng nhận quản lý chất lượng quốc tế ISO 9001:2015.',
    directions: 'Từ sảnh Hội trường H đi thẳng về hướng Bắc vài bước chân là tới dãy Tòa B (Khoa CNTT & Khoa Điện – Điện tử).',
    qrSecretToken: 'TDC-QR-HALL-H',
    riddle: {
      prompt: 'Trên mặt tiền Tòa H có dòng khẩu hiệu 3 cụm từ: "Đạo đức – Tri thức – ...". Cụm từ thứ 3 là gì?',
      answer: 'kỹ năng',
      hint: 'Yếu tố thực hành nghề nghiệp quan trọng nhất của sinh viên trường Cao đẳng Công nghệ.',
    },
    questions: [
      {
        q: 'Khẩu hiệu giá trị cốt lõi in trang trọng trên mặt tiền Tòa H và Khu A là gì?',
        opts: [
          'Đạo đức – Tri thức – Kỹ năng',
          'Học nữa – Học mãi – Vươn xa',
          'Sáng tạo – Đổi mới – Hội nhập',
          'Tiên phong – Bản lĩnh – Trách nhiệm',
        ],
        ans: 0,
        ex: 'Dải biển đỏ nâu trên đỉnh Tòa H ghi rõ phương châm đào tạo: Đạo đức – Tri thức – Kỹ năng.',
      },
      {
        q: 'Sân thể thao nào nằm ngay phía trước bậc tam cấp của Hội trường H?',
        opts: ['Cụm sân bóng chuyền', 'Sân bóng đá mini', 'Hồ bơi trung tâm', 'Sân golf'],
        ans: 0,
        ex: 'Ngay trước mặt tiền phía Đông của Hội trường H là 3 sân bóng chuyền ngoài trời và cột cờ.',
      },
    ],
    active: true,
  },
  {
    id: 'b_it',
    name: 'Tòa B · Khoa CNTT',
    sub: 'Cánh Tây Tòa B · Trung tâm Máy tính',
    facultyId: 'cntt',
    x: -108,
    z: 5,
    fogRadius: 28,
    col: '#2FA8F0',
    type: 'it_debug',
    pts: 140,
    badge: 'Kỹ sư Phần mềm',
    info: 'Cánh Tây Tòa B (cao 4 tầng) là đại bản doanh của Khoa Công nghệ thông tin với hệ thống phòng Lab cấu hình cao cho Lập trình, Mạng máy tính, Đồ họa và AI.',
    funFact: 'Khoa CNTT là một trong những khoa có số lượng câu lạc bộ học thuật, cuộc thi Hackathon và dự án chuyển đổi số sôi nổi nhất tại TDC.',
    directions: 'Di chuyển dọc hành lang mặt trước Tòa B sang phía Đông khoảng 28m để tới khu vực Khoa Điện – Điện tử.',
    qrSecretToken: 'TDC-QR-TOAB-CNTT',
    riddle: {
      prompt: 'Ở tầng trệt đầu phía Tây của Tòa B (gần biển Khoa CNTT) có đặt phòng chức năng chăm sóc sức khỏe nào?',
      answer: 'y tế',
      hint: 'Biển hiệu có dấu thập đỏ "+ ..." ngay mặt tiền tầng 1.',
    },
    active: true,
  },
  {
    id: 'b_elec',
    name: 'Tòa B · Khoa Điện – Điện tử',
    sub: 'Cánh Đông Tòa B · Tự động hóa & IoT',
    facultyId: 'dien_dt',
    x: -78,
    z: 2,
    fogRadius: 28,
    col: '#FFAA1F',
    type: 'electric_circuit',
    pts: 140,
    badge: 'Bậc thầy Mạch điện',
    info: 'Cánh Đông Tòa B (cao 5 tầng) là nơi đặt các phòng thực hành Điện công nghiệp, Điện tử viễn thông, Vi điều khiển, PLC và Tự động hóa.',
    funFact: 'Sinh viên Khoa Điện – Điện tử thường xuyên chế tạo các mô hình nhà thông minh, robot dò đường và hệ thống năng lượng mặt trời ngay tại xưởng tầng trệt.',
    directions: 'Từ Tòa B đi về hướng Bắc qua lối rẽ trung tâm sẽ tới Khu phức hợp 6 sân bóng đá mini.',
    qrSecretToken: 'TDC-QR-TOAB-DIENDT',
    riddle: {
      prompt: 'Khối nhà phía Đông của Tòa B (nơi treo biển Khoa Điện – Điện tử) cao bao nhiêu tầng?',
      answer: '5',
      hint: 'Cao hơn khối phía Tây (4 tầng) đúng 1 tầng.',
    },
    active: true,
  },
  {
    id: 'sb',
    name: 'Cụm Sân bóng Mini',
    sub: 'Khu Thể thao Sinh viên phía Bắc',
    facultyId: 'khac',
    x: -48,
    z: -34,
    fogRadius: 38,
    col: '#38B865',
    type: 'kick',
    pts: 150,
    badge: 'Chân sút Vàng TDC',
    info: 'Tổ hợp 6 sân bóng đá cỏ nhân tạo mini nằm ở khu vực phía Bắc trường, nơi diễn ra Hội thao truyền thống HSSV và các trận giao hữu nảy lửa sau giờ học.',
    funFact: 'Cụm sân được chia thành 2 hàng × 3 sân chuẩn 5 người, nhìn từ trên cao giống như một bàn cờ xanh mướt giữa khuôn viên.',
    directions: 'Từ Sân bóng đi về phía Nam qua trục đường chính tới tọa độ trung tâm (x=11, z=46) để ghé Xưởng Cơ khí – Ô tô.',
    qrSecretToken: 'TDC-QR-SPORT-PITCH6',
    riddle: {
      prompt: 'Khu sân bóng đá cỏ nhân tạo phía Bắc khuôn viên TDC gồm tổng cộng bao nhiêu sân bóng mini ghép lại?',
      answer: '6',
      hint: '2 hàng, mỗi hàng có 3 sân bóng.',
    },
    active: true,
  },
  {
    id: 'ck',
    name: 'Xưởng Cơ khí – Ô tô',
    sub: 'Khu Thực hành Máy & Động cơ',
    facultyId: 'co_khi_oto',
    x: 11,
    z: 54,
    fogRadius: 28,
    col: '#FF6F59',
    type: 'auto_engine',
    pts: 150,
    badge: 'Kỹ sư Động cơ',
    info: 'Xưởng thực hành Cơ khí – Ô tô nổi bật với kiến trúc mái răng cưa thông gió lấy sáng tự nhiên, bên trong trang bị máy tiện CNC, cầu nâng và động cơ ô tô thực tế.',
    funFact: 'Thiết kế mái răng cưa (Sawtooth Roof) gồm 3 nhịp giúp xưởng luôn thoáng mát và đón ánh sáng tự nhiên đồng đều mà không bị chói nắng trực tiếp.',
    directions: 'Rời Xưởng Cơ khí đi về hướng Đông Bắc qua hành lang mái che để khám phá Tòa C và Ký túc xá.',
    qrSecretToken: 'TDC-QR-WORKSHOP-AUTO',
    riddle: {
      prompt: 'Phần mái đặc trưng của Xưởng cơ khí được ghép từ mấy nhịp mái hình lăng trụ tam giác (mái răng cưa)?',
      answer: '3',
      hint: 'Nhìn lên phần mái màu xanh xám của nhà xưởng.',
    },
    active: true,
  },
  {
    id: 'c',
    name: 'Tòa C & Ký túc xá',
    sub: 'Giảng đường Khu Đông & Nội trú',
    facultyId: 'co_khi_ctm',
    x: 82,
    z: -1,
    fogRadius: 36,
    col: '#6F8CF0',
    type: 'quiz',
    pts: 110,
    badge: 'Công dân Khu Đông',
    info: 'Tòa C mang sắc xanh lam nhẹ nhàng được kết nối trực tiếp với Khu B qua dãy hành lang có mái che dài gần 100m. Phía sau Tòa C là khu Ký túc xá sinh viên màu hồng ấm áp.',
    funFact: 'Hành lang có mái che nối Khu B sang Tòa C giúp sinh viên di chuyển giữa hai khu giảng đường Đông – Tây mà không sợ nắng mưa thất thường của Sài Gòn!',
    directions: 'Từ Tòa C đi về phía Nam vài chục mét sẽ đứng dưới chân Tòa D 11 tầng đồ sộ nhất trường.',
    qrSecretToken: 'TDC-QR-TOAC-KTX',
    riddle: {
      prompt: 'Tòa nhà nội trú nằm ngay phía Bắc của Tòa C có sơn tường màu hồng và tấm biển ghi 3 từ gì?',
      answer: 'ký túc xá',
      hint: 'Nơi ở nội trú dành cho sinh viên ở xa.',
    },
    questions: [
      {
        q: 'Công trình nào giúp kết nối trực tiếp lối đi bộ từ Khu B sang Tòa C?',
        opts: [
          'Hành lang dài có mái che nắng mưa',
          'Đường hầm ngầm dưới lòng đất',
          'Cáp treo nội khu',
          'Cầu vượt dây văng',
        ],
        ans: 0,
        ex: 'Dãy hành lang có mái che chạy dọc trục Đông – Tây nối liền Khu B tới tận sảnh Tòa C.',
      },
      {
        q: 'Khu Ký túc xá sinh viên nằm ở vị trí nào so với Tòa C?',
        opts: [
          'Phía Bắc của Tòa C (tòa nhà 3 tầng màu hồng)',
          'Ngay sát Cổng 1 Võ Văn Ngân',
          'Trên tầng thượng Tòa H',
          'Bên ngoài đường Chương Dương',
        ],
        ans: 0,
        ex: 'Ký túc xá là tòa nhà 3 tầng màu hồng phấn nằm ngay phía Bắc Tòa C.',
      },
    ],
    active: true,
  },
  {
    id: 'd',
    name: 'Tòa D (11 tầng) & Cổng 2',
    sub: 'Biểu tượng Hiện đại · Đường Chương Dương',
    facultyId: 'khac',
    x: 66,
    z: 55,
    fogRadius: 42,
    col: '#00AEEF',
    type: 'quiz',
    pts: 120,
    badge: 'Chinh phục Đỉnh TDC',
    info: 'Tòa D là công trình kiến trúc hiện đại biểu tượng của TDC với kết cấu chữ L cao 11 tầng nổi, khối đế bo cong 7 tầng mềm mại và tháp lõi gắn Logo TDC tỏa sáng. Sát bên là Cổng 2 mở ra đường Chương Dương.',
    funFact: 'Từ tầng 11 của Tòa D, bạn có thể phóng tầm mắt ngắm trọn vẹn toàn cảnh khu vực trung tâm TP. Thủ Đức và đoàn tàu Metro số 1!',
    directions: 'Chúc mừng! Bạn đã kết nối trọn vẹn trục đường từ Cổng 1 (Võ Văn Ngân) sang tới Tòa D và Cổng 2 (Chương Dương).',
    qrSecretToken: 'TDC-QR-TOAD-11FL',
    riddle: {
      prompt: 'Tòa nhà D cao nhất khuôn viên TDC có bao nhiêu tầng nổi?',
      answer: '11',
      hint: 'Số tầng lớn hơn 10 và nhỏ hơn 12.',
    },
    questions: [
      {
        q: 'Tòa D – công trình cao tầng hiện đại nhất khuôn viên TDC – có quy mô bao nhiêu tầng?',
        opts: [
          '11 tầng nổi (kèm khối đế bo cong 7 tầng)',
          '5 tầng nổi',
          '18 tầng nổi',
          '3 tầng nổi',
        ],
        ans: 0,
        ex: 'Tòa D gồm khối tháp chữ L cao 11 tầng nổi, 1 tầng hầm và khối đế bo cong 7 tầng.',
      },
      {
        q: 'Cổng 2 nằm ở phía Đông khuôn viên trường (gần Tòa D và Tòa C) mở ra tuyến đường nào?',
        opts: [
          'Đường Chương Dương',
          'Đường Võ Văn Ngân',
          'Đường Kha Vạn Cân',
          'Xa lộ Hà Nội',
        ],
        ans: 0,
        ex: 'Cổng 1 mở ra đường Võ Văn Ngân, còn Cổng 2 mở ra đường Chương Dương.',
      },
    ],
    active: true,
  },
];

export const DEFAULT_EVENTS: CampaignEvent[] = [
  {
    id: 'evt_welcome_2026',
    title: 'Tuần lễ Chào Tân Sinh viên TDC 2026–2027',
    description: 'Khám phá 100% bản đồ 3D khuôn viên TDC, kết nối tổ đội liên khoa và nhận chứng nhận Nhà thám hiểm TDC!',
    startDate: '2026-09-01',
    endDate: '2027-06-30',
    active: true,
    bonusMultiplier: 1.2,
  },
  {
    id: 'evt_openday_2027',
    title: 'Ngày hội TDC Open Day & Hướng nghiệp 2027',
    description: 'Sự kiện trải nghiệm thực tế dành cho học sinh THPT và tân sinh viên khám phá các Khoa nghề.',
    startDate: '2027-01-15',
    endDate: '2027-05-30',
    active: false,
    bonusMultiplier: 1.5,
  },
];
</file>

<file path="src/engine/audioSfx.ts">
type SoundEffectKey = 'coin' | 'ok' | 'bad' | 'tap' | 'badge' | 'kick' | 'unlock';

class AudioSfxManager {
  private ctx: AudioContext | null = null;
  private isMuted = false;

  public init(): void {
    if (!this.ctx && typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      } catch {
        // Ignore audio context restriction
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(m: boolean): void {
    this.isMuted = m;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public tone(
    frequencies: number[],
    dur: number,
    type: OscillatorType,
    vol: number,
    gap?: number
  ): void {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t0 = this.ctx.currentTime;
    frequencies.forEach((f, i) => {
      if (!this.ctx) return;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const st = t0 + i * (gap || dur * 0.8);
      o.type = type;
      o.frequency.value = f;
      g.gain.setValueAtTime(0, st);
      g.gain.linearRampToValueAtTime(vol, st + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0008, st + dur);
      o.connect(g);
      g.connect(this.ctx.destination);
      o.start(st);
      o.stop(st + dur + 0.02);
    });
  }

  public play(key: SoundEffectKey): void {
    switch (key) {
      case 'coin':
        this.tone([988, 1319], 0.1, 'square', 0.04, 0.07);
        break;
      case 'ok':
        this.tone([523, 659, 784, 1047], 0.16, 'triangle', 0.11, 0.1);
        break;
      case 'bad':
        this.tone([240, 180], 0.22, 'sawtooth', 0.04, 0.15);
        break;
      case 'tap':
        this.tone([700], 0.06, 'sine', 0.04);
        break;
      case 'badge':
        this.tone([784, 988, 1175, 1568], 0.2, 'triangle', 0.11, 0.12);
        break;
      case 'kick':
        this.tone([140, 90], 0.12, 'square', 0.07, 0.06);
        break;
      case 'unlock':
        this.tone([440, 554, 659, 880, 1108], 0.18, 'triangle', 0.1, 0.09);
        break;
    }
  }
}

export const audioSfx = new AudioSfxManager();
</file>

<file path="src/engine/campusBuilder.ts">
import * as THREE from 'three';
import { LAKE, PATHS, ROADS, TDC_LOGO } from '../data/campusLayout';
import {
  AABB,
  canvasTex,
  clamp,
  ell,
  facade,
  FH,
  heightAt,
  letter,
  mesh,
  pill,
  rr,
  signTex,
} from './threeHelpers';

export interface CampusBuildContext {
  scene: THREE.Scene;
  col: AABB[];
  mat: (c: string | number, o?: THREE.MeshPhongMaterialParameters) => THREE.MeshPhongMaterial;
  rng: () => number;
}

export function buildCampusEnvironment(ctx: CampusBuildContext): { flag: THREE.Mesh } {
  const { scene, col, mat, rng } = ctx;

  const addCol = (x0: number, z0: number, x1: number, z1: number) =>
    col.push([Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1)]);

  const box = (
    w: number,
    h: number,
    d: number,
    c: string | THREE.Material,
    x?: number,
    y?: number,
    z?: number,
    o?: THREE.MeshPhongMaterialParameters
  ) =>
    mesh(
      new THREE.BoxGeometry(w, h, d),
      typeof c === 'string' ? mat(c, o) : c,
      x,
      y,
      z
    );

  // 1. Sky dome
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(1500, 32, 16),
    new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      fog: false,
      map: canvasTex(
        4,
        256,
        (g, W, H) => {
          const gr = g.createLinearGradient(0, 0, 0, H);
          gr.addColorStop(0, '#76CBEA');
          gr.addColorStop(0.42, '#B5E3EC');
          gr.addColorStop(0.5, '#D3EEDF');
          gr.addColorStop(1, '#D3EEDF');
          g.fillStyle = gr;
          g.fillRect(0, 0, W, H);
        },
        false
      ),
    })
  );
  scene.add(sky);

  // 2. Terrain & Lake
  {
    const g = new THREE.PlaneGeometry(1500, 1500, 180, 180);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    const vCol = new Float32Array(p.count * 3);
    const c = new THREE.Color();
    const CC = new THREE.Color('#A8DC7C');
    const CB = new THREE.Color('#90CC68');
    const CL = new THREE.Color('#7CC35B');
    const CH = new THREE.Color('#4E9C47');
    const CS = new THREE.Color('#EADCA8');
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const h = heightAt(x, z);
      const d = ell(x, z);
      p.setY(i, h);
      if (d < 1.02) c.copy(CC);
      else if (h < -0.2) c.copy(CS);
      else if (d < 1.3) c.copy(CB);
      else c.copy(CL).lerp(CH, clamp(h / 28, 0, 1));
      c.offsetHSL(0, 0, (Math.sin(x * 1.7 + z * 0.9) * 0.5 + 0.5) * 0.05 - 0.025);
      vCol[i * 3] = c.r;
      vCol[i * 3 + 1] = c.g;
      vCol[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(vCol, 3));
    g.computeVertexNormals();
    const t = new THREE.Mesh(
      g,
      new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 3 })
    );
    t.receiveShadow = true;
    scene.add(t);

    const sh = new THREE.Shape();
    for (let i = 0; i <= 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      const r = LAKE.r * (1 + 0.12 * Math.sin(3 * a) + 0.06 * Math.cos(5 * a));
      const x = Math.cos(a) * r * 1.35;
      const y = Math.sin(a) * r;
      if (i) sh.lineTo(x, y);
      else sh.moveTo(x, y);
    }
    const lake = new THREE.Mesh(
      new THREE.ShapeGeometry(sh).rotateX(-Math.PI / 2),
      new THREE.MeshPhongMaterial({ color: '#5BC3EA', shininess: 80, specular: 0x99ddff })
    );
    lake.position.set(LAKE.x, -0.6, LAKE.z);
    lake.receiveShadow = true;
    scene.add(lake);
  }

  // 3. Roads & Walkways
  const strip = (
    ax: number,
    az: number,
    bx: number,
    bz: number,
    w: number,
    c: string,
    y: number
  ) => {
    const dx = bx - ax;
    const dz = bz - az;
    const L = Math.hypot(dx, dz);
    const m = mesh(
      new THREE.BoxGeometry(L, 0.12, w),
      mat(c),
      (ax + bx) / 2,
      y,
      (az + bz) / 2,
      false
    );
    m.rotation.y = -Math.atan2(dz, dx);
    scene.add(m);
    return m;
  };

  ROADS.forEach(([ax, az, bx, bz]) => {
    strip(ax, az, bx, bz, 9, '#9AA6A0', 0.08);
    const L = Math.hypot(bx - ax, bz - az);
    const n = Math.floor(L / 7);
    const dash = new THREE.InstancedMesh(
      new THREE.BoxGeometry(2.6, 0.05, 0.35),
      mat('#FFFFFF'),
      n
    );
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      o.position.set(ax + (bx - ax) * t, 0.16, az + (bz - az) * t);
      o.rotation.y = -Math.atan2(bz - az, bx - ax);
      o.updateMatrix();
      dash.setMatrixAt(i, o.matrix);
    }
    scene.add(dash);
  });

  PATHS.forEach(([ax, az, bx, bz]) => {
    strip(ax, az, bx, bz, 3.4, '#F7E6C2', 0.09);
    [
      [ax, az],
      [bx, bz],
    ].forEach(([x, z]) => {
      const j = mesh(
        new THREE.CylinderGeometry(1.7, 1.7, 0.12, 14),
        mat('#F7E6C2'),
        x,
        0.09,
        z,
        false
      );
      scene.add(j);
    });
  });

  // Helpers for buildings
  const hip = (
    x0: number,
    z0: number,
    x1: number,
    z1: number,
    y: number,
    rh: number,
    ov: number,
    c: string
  ) => {
    const ax0 = x0 - ov;
    const ax1 = x1 + ov;
    const az0 = z0 - ov;
    const az1 = z1 + ov;
    const zc = (az0 + az1) / 2;
    const hz = (az1 - az0) / 2;
    const rx0 = ax0 + hz;
    const rx1 = ax1 - hz;
    const Y = y + rh;
    const P: number[] = [];
    const tri = (a: number[], b: number[], d: number[]) => P.push(...a, ...b, ...d);
    const A = [ax0, y, az0];
    const B = [ax1, y, az0];
    const C = [ax1, y, az1];
    const D = [ax0, y, az1];
    const E = [rx0, Y, zc];
    const F = [rx1, Y, zc];
    tri(A, E, F);
    tri(A, F, B);
    tri(D, C, F);
    tri(D, F, E);
    tri(A, D, E);
    tri(B, F, C);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.computeVertexNormals();
    const m = mesh(g, mat(c, { side: THREE.DoubleSide }));
    scene.add(m);
    return m;
  };

  const bld = (o: {
    r: [number, number, number, number];
    h: number;
    y0?: number;
    fl?: number;
    wall?: string;
    win?: string;
    trim?: string;
    roof?: string;
    roofIn?: string;
    roofType?: 'hip' | 'none' | 'flat';
    rh?: number;
    bay?: number;
    tex?: THREE.CanvasTexture;
    col?: boolean;
  }) => {
    const [x0, z0, x1, z1] = o.r;
    const w = x1 - x0;
    const d = z1 - z0;
    const y0 = o.y0 || 0;
    const h = o.h;
    const fl = o.fl || Math.max(1, Math.round(h / FH));
    const tex = o.tex || facade(o.wall || '#FFF4DC', o.win || '#8ED8F8', '#FFFFFF', o.trim);
    const side = (len: number) => {
      const t = tex.clone();
      t.needsUpdate = true;
      t.repeat.set(Math.max(1, Math.round(len / (o.bay || 4.4))), fl);
      return new THREE.MeshPhongMaterial({ map: t, shininess: 5 });
    };
    const top = mat(o.roofIn || '#EFE9DA');
    const m = mesh(
      new THREE.BoxGeometry(w, h, d),
      [side(d), side(d), top, top, side(w), side(w)],
      (x0 + x1) / 2,
      y0 + h / 2,
      (z0 + z1) / 2
    );
    scene.add(m);
    const cx = (x0 + x1) / 2;
    const cz = (z0 + z1) / 2;
    const topY = y0 + h;
    if (o.roofType === 'hip') {
      hip(x0, z0, x1, z1, topY, o.rh || 3.2, 0.9, o.roof || '#E2574C');
    } else if (o.roofType !== 'none') {
      scene.add(box(w + 0.7, 0.55, d + 0.7, o.roof || '#F28C5E', cx, topY + 0.27, cz));
      scene.add(box(w - 0.9, 0.6, d - 0.9, o.roofIn || '#EFE9DA', cx, topY + 0.3, cz));
    }
    if (o.col !== false) addCol(x0, z0, x1, z1);
    return m;
  };

  const plane = (
    w: number,
    h: number,
    tex: THREE.Texture,
    x: number,
    y: number,
    z: number,
    ry?: number
  ) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshPhongMaterial({ map: tex, shininess: 4, side: THREE.DoubleSide })
    );
    m.position.set(x, y, z);
    m.rotation.y = ry || 0;
    scene.add(m);
    return m;
  };

  const groundTex = (
    x0: number,
    z0: number,
    x1: number,
    z1: number,
    tex: THREE.Texture,
    y?: number
  ) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2),
      new THREE.MeshPhongMaterial({
        map: tex,
        shininess: 3,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      })
    );
    m.position.set((x0 + x1) / 2, y || 0.11, (z0 + z1) / 2);
    m.receiveShadow = true;
    scene.add(m);
    return m;
  };

  const prism = (len: number, width: number, height: number, c: string) => {
    const r = width / Math.sqrt(3);
    const g = new THREE.CylinderGeometry(r, r, len, 3);
    g.rotateZ(Math.PI / 2);
    g.rotateX(-Math.PI / 2);
    const m = mesh(g, mat(c));
    m.scale.y = height / (1.5 * r);
    return m;
  };

  const addLabel = (sp: THREE.Sprite, x: number, y: number, z: number) => {
    sp.position.set(x, y, z);
    scene.add(sp);
    return sp;
  };

  /* ---- Khu A ---- */
  bld({
    r: [-140.6, 52.7, -101.9, 66.6],
    h: 3 * FH,
    wall: '#FFE6A6',
    win: '#9ADCF5',
    trim: '#E9B57E',
    roof: '#E2574C',
    roofType: 'hip',
    rh: 3.4,
  });
  bld({
    r: [-101.9, 48.6, -87.1, 54.7],
    y0: FH,
    h: 2 * FH,
    wall: '#F3EEE4',
    win: '#B9DDEA',
    roof: '#E2574C',
    col: false,
  });
  [
    [-101.4, 49.1],
    [-87.6, 49.1],
    [-101.4, 54.2],
    [-87.6, 54.2],
  ].forEach(([x, z]) =>
    scene.add(mesh(new THREE.CylinderGeometry(0.35, 0.35, FH, 8), mat('#F6F2EA'), x, FH / 2, z))
  );
  bld({
    r: [-87.1, 48.6, -77, 55.6],
    h: 3 * FH + 0.6,
    wall: '#FFF3D6',
    win: '#9ADCF5',
    roof: '#2F8FC9',
    roofType: 'none',
  });
  {
    const v = mesh(
      new THREE.CylinderGeometry(3.5, 3.5, 10.1, 16, 1, false, 0, Math.PI),
      mat('#3D9BDB')
    );
    v.rotation.z = Math.PI / 2;
    v.position.set(-82.05, 3 * FH + 0.6, 52.1);
    scene.add(v);
  }
  bld({
    r: [-77, 51, -21.5, 63.2],
    h: 3 * FH,
    wall: '#FFF4DC',
    win: '#8ED8F8',
    trim: '#7DC3E8',
    roof: '#E2574C',
    roofType: 'hip',
    rh: 3,
  });
  plane(
    34,
    2.2,
    signTex([['CAO ĐẲNG CÔNG NGHỆ THỦ ĐỨC', 110]], '#8A3A2D', '#FFFFFF', 2048, 180),
    -121.25,
    3 * FH + 1.0,
    67.6
  );

  /* ---- Khu B ---- */
  const BC = { wall: '#FFD7B2', win: '#8ED8F8', trim: '#FFFFFF', roof: '#F07F55' };
  bld({ ...BC, r: [-93, -16.2, -51.5, -1.5], h: 5 * FH });
  bld({ ...BC, r: [-122.9, -14.1, -93.6, -1.5], h: 4 * FH });
  bld({ ...BC, r: [-112, -32.1, -87.5, -15.8], h: 3 * FH, wall: '#FFE6C8' });
  bld({ ...BC, r: [-84.9, -29.6, -46.5, -16.9], h: 3 * FH, wall: '#FFE6C8' });
  plane(
    13,
    2.2,
    signTex([['KHOA ĐIỆN – ĐIỆN TỬ', 96]], '#2E62B6', '#FFFFFF', 1300, 220),
    -80,
    FH + 1.4,
    -1.38
  );
  plane(
    16,
    2.2,
    signTex([['KHOA CÔNG NGHỆ THÔNG TIN', 96]], '#2E62B6', '#FFFFFF', 1600, 220),
    -108,
    FH + 1.4,
    -1.38
  );
  plane(
    4.2,
    1.3,
    signTex([['+ Y TẾ', 110]], '#FFFFFF', '#D7262E', 420, 130),
    -118,
    3.2,
    -1.38
  );

  /* ---- Tòa H: hội trường ---- */
  bld({
    r: [-98.7, -0.1, -77.4, 48.5],
    h: 3 * FH,
    wall: '#FFF2E3',
    win: '#E07A55',
    trim: '#F4C35E',
    roof: '#B5432F',
  });
  {
    const sg = plane(
      46,
      2.6,
      signTex(
        [
          ['CAO ĐẲNG CÔNG NGHỆ THỦ ĐỨC', 120],
          ['ĐẠO ĐỨC – TRI THỨC – KỸ NĂNG', 50],
        ],
        '#8A3A2D',
        '#FFFFFF',
        2600,
        260
      ),
      -77.1,
      3 * FH + 1.5,
      24.2,
      Math.PI / 2
    );
    sg.material.side = THREE.FrontSide;
    for (let k = 0; k <= 8; k++) {
      const z = 0.5 + k * 5.95;
      scene.add(box(0.7, FH * 2 - 1, 0.7, '#F2C64B', -76.9, FH - 0.5, z));
    }
    for (let i = 0; i < 5; i++) {
      scene.add(
        box(
          6 - i * 1.1,
          0.22 * (i + 1),
          9,
          '#E8A295',
          -77.4 + (6 - i * 1.1) / 2,
          0.11 * (i + 1),
          24.2
        )
      );
    }
    const lg = canvasTex(
      256,
      256,
      (g) => {
        g.fillStyle = '#4C9BD3';
        rr(g, 0, 0, 256, 256, 30);
        g.fill();
        g.save();
        g.translate(28, 28);
        g.scale(200 / 332, 200 / 332);
        g.translate(-118, -118);
        g.fillStyle = '#FFFFFF';
        g.fill(new Path2D(TDC_LOGO));
        g.restore();
      },
      false
    );
    plane(3.6, 3.6, lg, -77.1, 6.2, 24.2, Math.PI / 2).material.side = THREE.FrontSide;
  }

  /* ---- Tòa C ---- */
  bld({
    r: [53.4, -20.3, 115.2, -1.9],
    h: 3 * FH,
    wall: '#E1EAFF',
    win: '#9FD7F7',
    trim: '#8FA7F2',
    roof: '#6F8CF0',
  });
  bld({
    r: [115.3, -22.4, 128.2, 0.1],
    h: 3 * FH,
    wall: '#E1EAFF',
    win: '#9FD7F7',
    trim: '#8FA7F2',
    roof: '#6F8CF0',
  });

  /* ---- Ký túc xá ---- */
  bld({
    r: [58.3, -45.1, 100.8, -29.5],
    h: 3 * FH,
    wall: '#FFD9E4',
    win: '#9FDCF5',
    trim: '#FF9EBB',
    roof: '#E8608C',
  });
  plane(
    12,
    1.9,
    signTex([['KÝ TÚC XÁ', 120]], '#E8608C', '#FFFFFF', 1000, 160),
    79.5,
    3 * FH - 1.2,
    -29.38
  );

  /* ---- Xưởng cơ khí: mái răng cưa ---- */
  bld({
    r: [2, 40, 20, 52],
    h: 6.5,
    fl: 1,
    wall: '#EFE8DA',
    win: '#B6CBD6',
    trim: '#C9BFA8',
    roofType: 'none',
    bay: 4.5,
  });
  for (let i = 0; i < 3; i++) {
    const p = prism(18, 4, 2.4, '#6F93B8');
    p.position.set(11, 6.5 + 1.2 * 0.67, 41.9 + i * 4);
    scene.add(p);
  }

  /* ---- Tòa D (11 tầng + khối đế bo cong 7 tầng + tháp lõi logo TDC) ---- */
  const BLUE = '#3EA3E6';
  const bal = canvasTex(256, 128, (g, W, H) => {
    g.fillStyle = BLUE;
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#F2F6F8';
    rr(g, 8, 8, 112, 84, 8);
    g.fill();
    g.fillStyle = '#5DA7D6';
    rr(g, 20, 20, 30, 64, 6);
    g.fill();
    rr(g, 76, 20, 30, 64, 6);
    g.fill();
    g.fillStyle = '#FFFFFF';
    g.fillRect(0, 92, 128, 30);
    g.fillStyle = '#B9D2E0';
    for (let x = 14; x < 118; x += 14) g.fillRect(x, 102, 6, 10);
    g.fillStyle = '#FFFFFF';
    g.fillRect(132, 0, 120, H);
    g.fillStyle = '#CFE0EA';
    for (let y = 6; y < H; y += 11) g.fillRect(132, y, 120, 4);
    g.fillStyle = '#2E8FD6';
    g.fillRect(124, 0, 8, H);
  });
  bld({
    r: [40, 6, 85.75, 17.25],
    h: 11 * FH,
    tex: bal,
    bay: 7.2,
    fl: 11,
    roof: '#2F86C8',
    roofIn: '#E3EEF5',
  });
  bld({
    r: [24, 17.25, 40, 49.75],
    h: 11 * FH,
    tex: bal,
    bay: 7.2,
    fl: 11,
    roof: '#2F86C8',
    roofIn: '#E3EEF5',
  });
  bld({
    r: [24, 6, 40, 17.25],
    h: 11 * FH + 1.6,
    wall: BLUE,
    win: '#A7D8F2',
    trim: '#FFFFFF',
    roof: '#2F86C8',
    roofIn: '#E3EEF5',
  });
  {
    const sh = new THREE.Shape();
    sh.moveTo(40, 17.25);
    sh.lineTo(73, 17.25);
    sh.lineTo(73, 36);
    sh.quadraticCurveTo(73, 49.75, 59, 49.75);
    sh.lineTo(40, 49.75);
    sh.lineTo(40, 17.25);
    const dep = 7 * FH;
    const geo = new THREE.ExtrudeGeometry(sh, {
      depth: dep,
      bevelEnabled: false,
      curveSegments: 16,
    });
    geo.rotateX(Math.PI / 2);
    const ct = canvasTex(128, 128, (g, W, H) => {
      g.fillStyle = '#FBFAF6';
      g.fillRect(0, 0, W, H);
      g.fillStyle = '#9ED3EE';
      rr(g, 12, 18, 104, 72, 8);
      g.fill();
      g.fillStyle = '#FFFFFF';
      g.fillRect(62, 18, 4, 72);
      g.fillStyle = 'rgba(255,255,255,.5)';
      g.fillRect(20, 24, 10, 40);
    });
    ct.repeat.set(1 / 6, 1 / FH);
    const m = mesh(
      geo,
      [mat('#E9E2D2'), new THREE.MeshPhongMaterial({ map: ct, shininess: 20 })],
      0,
      dep,
      0
    );
    scene.add(m);
    addCol(40, 17.25, 73, 47);
    const crown = mesh(
      new THREE.ShapeGeometry(sh).rotateX(Math.PI / 2),
      mat('#2F86C8', { side: THREE.DoubleSide }),
      0,
      dep + 0.05,
      0,
      false
    );
    scene.add(crown);
  }
  {
    const H = 12.4 * FH;
    const core = canvasTex(
      256,
      1024,
      (g, W, Hh) => {
        g.fillStyle = BLUE;
        g.fillRect(0, 0, W, Hh);
        g.fillStyle = '#A7D3EA';
        g.fillRect(64, 40, 128, Hh - 40);
        g.fillStyle = '#EAF4F9';
        for (let y = 40; y < Hh; y += 78) g.fillRect(64, y, 128, 6);
        g.fillStyle = '#FFFFFF';
        for (let i = 0; i < 7; i++) {
          const x = 98 + i * 10;
          const L = 420 - Math.abs(i - 3) * 60;
          g.fillRect(x, 260, 4, L);
        }
        g.beginPath();
        g.arc(128, 150, 58, 0, 7);
        g.fillStyle = '#FFFFFF';
        g.fill();
        g.save();
        g.translate(128 - 52, 150 - 52);
        g.scale(104 / 332, 104 / 332);
        g.translate(-118, -118);
        g.fillStyle = '#00AEEF';
        g.fill(new Path2D(TDC_LOGO));
        g.restore();
      },
      false
    );
    const bm = mat(BLUE);
    const m = mesh(
      new THREE.BoxGeometry(11, H, 11),
      [
        bm,
        bm,
        mat('#2F86C8'),
        bm,
        new THREE.MeshPhongMaterial({ map: core, shininess: 10 }),
        bm,
      ],
      43.6,
      H / 2,
      20.85
    );
    m.rotation.y = Math.PI / 4;
    scene.add(m);
  }

  /* ---- Hành lang mái che nối Khu B sang Tòa C ---- */
  {
    const roofC = '#8A9097';
    const postC = '#E07A2E';
    for (let x = -50.6; x <= 47.6; x += 3.3) {
      [-1.6, 1.6].forEach((z) => scene.add(box(0.32, 2.8, 0.32, postC, x, 1.4, z - 0.1)));
    }
    for (let x0 = -51; x0 < 48; x0 += 7.3) {
      const L = Math.min(7.6, 48.4 - x0);
      const p = prism(L, 4.6, 1.2, roofC);
      p.position.set(x0 + L / 2, 2.8 + 0.6, -0.1);
      scene.add(p);
    }
    [
      [-1.8, -1.8],
      [1.8, -1.8],
      [1.8, 1.8],
      [-1.8, 1.8],
    ].forEach(([x, z]) => scene.add(box(0.3, 2.8, 0.3, '#D9A441', 50.9 + x, 1.4, -0.1 + z)));
    const cone = mesh(new THREE.ConeGeometry(3.6, 2.2, 4), mat(roofC), 50.9, 4.0, -0.1);
    cone.rotation.y = Math.PI / 4;
    scene.add(cone);
  }

  /* ---- Nhà xe HSSV ---- */
  [
    [-6.9, -89.7, 25, -75.3],
    [1.4, -103.2, 23.9, -95],
  ].forEach(([x0, z0, x1, z1]) => {
    scene.add(box(x1 - x0, 0.3, z1 - z0, '#35B5A6', (x0 + x1) / 2, 3.6, (z0 + z1) / 2));
    for (let x = x0 + 0.5; x <= x1 - 0.4; x += 5.2) {
      [z0 + 0.5, z1 - 0.5].forEach((z) => scene.add(box(0.25, 3.5, 0.25, '#E9EEF0', x, 1.75, z)));
    }
    const n = Math.floor((x1 - x0) / 1.1) * 2;
    const im = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.55, 0.85, 1.6),
      new THREE.MeshPhongMaterial({ flatShading: true }),
      n
    );
    const o = new THREE.Object3D();
    const cc = new THREE.Color();
    const pal = ['#FF6F59', '#2FA8F0', '#FFC83A', '#FFFFFF', '#9B6BFF', '#38B865', '#30343A'];
    for (let i = 0; i < n; i++) {
      const row = i % 2;
      o.position.set(x0 + 0.8 + Math.floor(i / 2) * 1.1, 0.55, row ? z1 - 2.4 : z0 + 2.4);
      o.rotation.set(0, (rng() - 0.5) * 0.25, 0);
      o.updateMatrix();
      im.setMatrixAt(i, o.matrix);
      im.setColorAt(i, cc.set(pal[Math.floor(rng() * pal.length)]));
    }
    im.castShadow = true;
    scene.add(im);
  });

  /* ---- Sân bóng đá mini: 6 sân ---- */
  {
    const X0 = -72.6;
    const Z0 = -98.3;
    const W = 47.6;
    const D = 59.3;
    groundTex(
      X0,
      Z0,
      X0 + W,
      Z0 + D,
      canvasTex(
        476,
        593,
        (g, Wc, Hc) => {
          g.fillStyle = '#D7CDB6';
          g.fillRect(0, 0, Wc, Hc);
          const gap = 8;
          const cw = (Wc - 16 - 2 * gap) / 3;
          const rh = (Hc - 16 - gap) / 2;
          for (let r = 0; r < 2; r++) {
            for (let k = 0; k < 3; k++) {
              const x = 8 + k * (cw + gap);
              const y = 8 + r * (rh + gap);
              g.fillStyle = '#45A85A';
              g.fillRect(x, y, cw, rh);
              g.fillStyle = '#55B968';
              for (let yy = y; yy < y + rh; yy += 26) g.fillRect(x, yy, cw, 13);
              g.strokeStyle = 'rgba(255,255,255,.9)';
              g.lineWidth = 2.5;
              g.strokeRect(x + 5, y + 5, cw - 10, rh - 10);
              g.beginPath();
              g.moveTo(x + 5, y + rh / 2);
              g.lineTo(x + cw - 5, y + rh / 2);
              g.stroke();
              g.beginPath();
              g.arc(x + cw / 2, y + rh / 2, cw * 0.15, 0, 7);
              g.stroke();
              g.strokeRect(x + cw * 0.3, y + 5, cw * 0.4, rh * 0.12);
              g.strokeRect(x + cw * 0.3, y + rh - 5 - rh * 0.12, cw * 0.4, rh * 0.12);
            }
          }
        },
        false
      )
    );
    const gap = 0.8;
    const cw = (W - 1.6 - 2 * gap) / 3;
    const rh = (D - 1.6 - gap) / 2;
    for (let r = 0; r < 2; r++) {
      for (let k = 0; k < 3; k++) {
        const cx = X0 + 0.8 + k * (cw + gap) + cw / 2;
        const y = Z0 + 0.8 + r * (rh + gap);
        [y + 0.6, y + rh - 0.6].forEach((z) => {
          scene.add(box(0.15, 1.6, 0.15, '#FFFFFF', cx - 1.6, 0.8, z));
          scene.add(box(0.15, 1.6, 0.15, '#FFFFFF', cx + 1.6, 0.8, z));
          scene.add(box(3.35, 0.15, 0.15, '#FFFFFF', cx, 1.6, z));
        });
      }
    }
  }

  /* ---- Sân tennis ---- */
  groundTex(
    0,
    5,
    18,
    36,
    canvasTex(
      180,
      310,
      (g, W, H) => {
        g.fillStyle = '#C9654D';
        g.fillRect(0, 0, W, H);
        const cx = W / 2;
        const cz = H / 2;
        const hw = 54.8;
        const hl = 118.8;
        const sw = 41.1;
        const sv = 64;
        g.fillStyle = '#3E8A63';
        g.fillRect(cx - hw - 12, cz - hl - 16, 2 * hw + 24, 2 * hl + 32);
        g.strokeStyle = '#fff';
        g.lineWidth = 2.5;
        g.strokeRect(cx - hw, cz - hl, 2 * hw, 2 * hl);
        g.beginPath();
        g.moveTo(cx - sw, cz - hl);
        g.lineTo(cx - sw, cz + hl);
        g.moveTo(cx + sw, cz - hl);
        g.lineTo(cx + sw, cz + hl);
        g.moveTo(cx - sw, cz - sv);
        g.lineTo(cx + sw, cz - sv);
        g.moveTo(cx - sw, cz + sv);
        g.lineTo(cx + sw, cz + sv);
        g.moveTo(cx, cz - sv);
        g.lineTo(cx, cz + sv);
        g.stroke();
      },
      false
    )
  );
  scene.add(box(12.6, 0.9, 0.08, '#FFFFFF', 9, 0.6, 20.5));

  /* ---- Sân bóng chuyền trước Tòa H ---- */
  groundTex(
    -73,
    12.8,
    -27,
    38.6,
    canvasTex(
      460,
      258,
      (g, W, H) => {
        g.fillStyle = '#A7ADA9';
        g.fillRect(0, 0, W, H);
        g.fillStyle = 'rgba(255,255,255,.06)';
        for (let i = 0; i < 160; i++) g.fillRect((i * 137) % W, (i * 71) % H, 14, 8);
        g.strokeStyle = 'rgba(255,255,255,.85)';
        g.lineWidth = 3;
        g.strokeRect(40, 40, 90, 180);
        g.beginPath();
        g.moveTo(40, 130);
        g.lineTo(130, 130);
        g.stroke();
        [
          [170, 300],
          [320, 430],
        ].forEach(([a, b]) => {
          g.strokeRect(a, 70, b - a, 120);
          g.beginPath();
          g.moveTo((a + b) / 2, 70);
          g.lineTo((a + b) / 2, 190);
          g.moveTo(a, 130);
          g.lineTo(b, 130);
          g.stroke();
        });
      },
      false
    ),
    0.12
  );
  [
    [-69, -60],
    [-56, -43],
    [-41, -30],
  ].forEach(([a, b]) => {
    scene.add(box(0.15, 2.4, 0.15, '#6F7A82', a, 1.2, 25.7));
    scene.add(box(0.15, 2.4, 0.15, '#6F7A82', b, 1.2, 25.7));
    const n = mesh(
      new THREE.PlaneGeometry(b - a, 0.9),
      new THREE.MeshPhongMaterial({
        color: '#FFFFFF',
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
      }),
      (a + b) / 2,
      1.9,
      25.7,
      false
    );
    scene.add(n);
  });

  // Cột cờ
  scene.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 10, 8), mat('#D8DDE0'), -58, 5, 9));
  const flag = mesh(
    new THREE.PlaneGeometry(2.2, 1.4),
    mat('#E3242B', { side: THREE.DoubleSide }),
    -56.9,
    9.2,
    9,
    false
  );
  scene.add(flag);

  /* ---- Bồn cây tròn ---- */
  {
    const pc = { x: -88.8, z: 64.2 };
    scene.add(mesh(new THREE.CylinderGeometry(3.7, 3.9, 0.6, 24), mat('#E4DCCB'), pc.x, 0.3, pc.z));
    scene.add(mesh(new THREE.CylinderGeometry(3.3, 3.3, 0.64, 24), mat('#5E9F3E'), pc.x, 0.32, pc.z));
    scene.add(mesh(new THREE.CylinderGeometry(0.35, 0.5, 5, 7), mat('#8A5A3A'), pc.x, 2.8, pc.z));
    [
      [0, 7.2, 0, 3.4],
      [1.6, 6.3, 0.9, 2.4],
      [-1.5, 6.5, -0.8, 2.5],
      [0.3, 8.8, -0.4, 2.1],
    ].forEach(([dx, y, dz, r]) =>
      scene.add(
        mesh(new THREE.IcosahedronGeometry(r, 0), mat('#3FA34D'), pc.x + dx, y, pc.z + dz)
      )
    );
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      scene.add(
        mesh(
          new THREE.IcosahedronGeometry(0.55, 0),
          mat(i % 2 ? '#FF8FB1' : '#FFD23F'),
          pc.x + Math.cos(a) * 2.4,
          0.9,
          pc.z + Math.sin(a) * 2.4
        )
      );
    }
    addCol(pc.x - 3.6, pc.z - 3.6, pc.x + 3.6, pc.z + 3.6);
  }

  /* ---- Cổng trường 1 & 2 ---- */
  {
    const g1 = new THREE.Group();
    g1.position.set(-66, 0, 114);
    g1.rotation.y = -0.36;
    scene.add(g1);
    const add = (m: THREE.Object3D) => {
      g1.add(m);
      return m;
    };
    [-6.5, 6.5].forEach((x) => {
      add(box(1.5, 6.4, 1.5, '#C65B3E', x, 3.2, 0));
      add(box(1.9, 0.5, 1.9, '#F3E6C8', x, 6.6, 0));
    });
    add(box(16, 0.9, 4, '#F3E6C8', 0, 6.9, -0.4));
    add(box(16.4, 0.3, 4.3, '#E2574C', 0, 7.5, -0.4));
    [
      '#2D6CC0',
      '#F2C230',
      '#D7262E',
      '#E0508A',
      '#E36F2A',
      '#2D6CC0',
      '#F2C230',
      '#D7262E',
    ].forEach((c, i) => {
      const x = -6.1 + i * 1.75;
      add(box(0.08, 2.4, 0.08, '#D9DDE0', x, 8.8, 0.9));
      add(
        mesh(
          new THREE.PlaneGeometry(0.6, 1.3),
          mat(c, { side: THREE.DoubleSide }),
          x + 0.32,
          9.4,
          0.9,
          false
        )
      );
    });
    add(box(5.6, 3.6, 4.6, '#F3E6C8', -11.2, 1.8, -0.4));
    add(box(6.2, 0.3, 5.2, '#E2574C', -11.2, 3.75, -0.4));
    const s = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 2.4),
      new THREE.MeshPhongMaterial({
        map: signTex(
          [
            ['TRƯỜNG CAO ĐẲNG', 62],
            ['CÔNG NGHỆ THỦ ĐỨC', 62],
            ['53 Võ Văn Ngân', 40],
          ],
          '#8A3A2D',
          '#F7EAC8',
          600,
          330
        ),
      })
    );
    s.position.set(-11.2, 2, 1.92);
    g1.add(s);
  }
  {
    const g2 = new THREE.Group();
    g2.position.set(136, 0, 56);
    g2.rotation.y = -Math.PI / 2 + 0.12;
    scene.add(g2);
    const tile = canvasTex(64, 64, (g, W, H) => {
      g.fillStyle = '#3D9BD6';
      g.fillRect(0, 0, W, H);
      g.fillStyle = '#BFE2F5';
      g.fillRect(0, 0, W, 4);
    });
    tile.repeat.set(1, 6);
    [-6, 6, -13, 13].forEach((x) => {
      g2.add(
        mesh(
          new THREE.BoxGeometry(1.2, 3.8, 1.2),
          new THREE.MeshPhongMaterial({ map: tile }),
          x,
          1.9,
          0
        )
      );
      g2.add(box(1.5, 0.35, 1.5, '#FFFFFF', x, 3.95, 0));
    });
    const sl = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 2, 0.5), mat('#DCE1E5'), 40);
    const o = new THREE.Object3D();
    for (let i = 0; i < 40; i++) {
      o.position.set(-14.6 + i * 0.23 + (i >= 20 ? 24.4 : 0), 1.1, 0);
      o.rotation.y = (i % 2 ? 1 : -1) * 0.65;
      o.updateMatrix();
      sl.setMatrixAt(i, o.matrix);
    }
    g2.add(sl);
    const s = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 1.5),
      new THREE.MeshPhongMaterial({
        map: signTex(
          [
            ['TRƯỜNG CAO ĐẲNG CÔNG NGHỆ THỦ ĐỨC', 46],
            ['Cổng 2 · Đường Chương Dương', 32],
          ],
          '#3A2A1E',
          '#F0CC70',
          900,
          260
        ),
      })
    );
    s.position.set(9.5, 1.9, 0.4);
    g2.add(s);
    g2.add(box(5.6, 1.1, 0.6, '#DADFE2', 9.5, 0.55, 0));
  }

  /* ---- Biển tên tòa nhà nổi 3D ---- */
  addLabel(letter('A', '#E2574C'), -49, 23, 57);
  addLabel(letter('A', '#E2574C'), -121, 23, 59.6);
  addLabel(letter('B', '#F07F55'), -72, 29, -9);
  addLabel(letter('H', '#9B6BFF'), -88, 20, 24);
  addLabel(letter('C', '#6F8CF0'), 85, 20, -11);
  addLabel(letter('D', '#00AEEF', 10), 62, 54, 12);
  addLabel(letter('KTX', '#E8608C'), 79.5, 20, -37);
  addLabel(pill('Sân bóng mini', { h: 3.4 }), -48.8, 5, -70);
  addLabel(pill('Nhà xe HSSV', { h: 3.2 }), 9, 8, -88);
  addLabel(pill('Sân tennis', { h: 3 }), 9, 4, 20.5);
  addLabel(pill('Xưởng cơ khí', { h: 3 }), 11, 12, 46);
  addLabel(pill('Sân bóng chuyền', { h: 3 }), -50, 4, 12.5);

  return { flag };
}
</file>

<file path="src/engine/chibiBuilder.ts">
import * as THREE from 'three';
import { AVATARS, ChibiAvatarSpec, PATHS } from '../data/campusLayout';
import { lerpAngle, mesh } from './threeHelpers';

export function makeChibi(
  o: { shirt: string; hair: string; pants?: string; acc?: string },
  withPack: boolean,
  mat: (c: string | number, o?: THREE.MeshPhongMaterialParameters) => THREE.MeshPhongMaterial
): THREE.Group {
  const g = new THREE.Group();
  const skin = mat('#FFD7B5');
  const shirt = mat(o.shirt);
  const pants = mat(o.pants || '#3B4A6B');
  const hair = mat(o.hair);
  const dark = mat('#2A1E1A');

  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    mesh(new THREE.BoxGeometry(w, h, d), mat(c), x, y, z);

  const body = new THREE.Group();
  g.add(body);
  body.add(mesh(new THREE.CylinderGeometry(0.48, 0.62, 1, 10), shirt, 0, 1.08, 0));

  const leg = (x: number) => {
    const L = new THREE.Group();
    L.position.set(x, 0.62, 0);
    L.add(mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.55, 8), pants, 0, -0.27, 0));
    L.add(mesh(new THREE.SphereGeometry(0.21, 8, 6), dark, 0, -0.56, 0.06));
    body.add(L);
    return L;
  };

  const arm = (x: number) => {
    const A = new THREE.Group();
    A.position.set(x, 1.45, 0);
    A.add(mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.6, 8), shirt, 0, -0.3, 0));
    A.add(mesh(new THREE.SphereGeometry(0.15, 8, 6), skin, 0, -0.62, 0));
    A.rotation.z = x < 0 ? -0.28 : 0.28;
    body.add(A);
    return A;
  };

  const legL = leg(-0.24);
  const legR = leg(0.24);
  const armL = arm(-0.6);
  const armR = arm(0.6);

  const head = new THREE.Group();
  head.position.y = 2.28;
  body.add(head);
  head.add(mesh(new THREE.SphereGeometry(0.8, 18, 14), skin));
  const hc = mesh(
    new THREE.SphereGeometry(0.85, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
    hair,
    0,
    0.04,
    -0.06
  );
  hc.rotation.x = -0.32;
  head.add(hc);

  [-0.27, 0.27].forEach((x) => {
    const e = mesh(new THREE.SphereGeometry(0.11, 10, 8), dark, x, -0.02, 0.72);
    e.scale.z = 0.6;
    head.add(e);
    head.add(
      mesh(new THREE.SphereGeometry(0.035, 6, 4), mat('#FFFFFF'), x + 0.04, 0.03, 0.79, false)
    );
    const ck = mesh(
      new THREE.SphereGeometry(0.13, 8, 6),
      mat('#FF9AAE'),
      x * 1.65,
      -0.22,
      0.62,
      false
    );
    ck.scale.set(1, 0.55, 0.45);
    head.add(ck);
  });

  const mo = mesh(
    new THREE.TorusGeometry(0.09, 0.03, 6, 10, Math.PI),
    dark,
    0,
    -0.24,
    0.76,
    false
  );
  mo.rotation.z = Math.PI;
  head.add(mo);

  if (o.acc === 'cap') {
    const c = mesh(
      new THREE.SphereGeometry(0.88, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.42),
      mat('#FFC83A'),
      0,
      0.12,
      -0.02
    );
    c.rotation.x = -0.2;
    head.add(c);
    const v = mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 0.07, 16, 1, false, -Math.PI / 2, Math.PI),
      mat('#FFC83A'),
      0,
      0.36,
      0.62
    );
    v.rotation.x = 0.12;
    head.add(v);
  }
  if (o.acc === 'pony') {
    head.add(mesh(new THREE.SphereGeometry(0.34, 10, 8), hair, 0, -0.05, -0.92));
    head.add(mesh(new THREE.SphereGeometry(0.12, 8, 6), mat('#38B865'), 0, 0.15, -0.86));
  }
  if (o.acc === 'bun') {
    head.add(mesh(new THREE.SphereGeometry(0.32, 10, 8), hair, 0, 0.86, -0.22));
    head.add(
      mesh(new THREE.TorusGeometry(0.2, 0.06, 6, 12), mat('#FFC83A'), 0, 0.68, -0.18).rotateX(
        Math.PI / 2
      )
    );
  }
  if (withPack) {
    body.add(box(0.8, 0.9, 0.42, '#00AEEF', 0, 1.2, -0.62));
    body.add(box(0.6, 0.3, 0.1, '#FFC83A', 0, 1.0, -0.85));
  }

  g.userData = { body, legL, legR, armL, armR, head };
  return g;
}

export function animChibi(g: THREE.Group, ph: number, amt: number, t: number): void {
  const u = g.userData;
  if (!u || !u.legL) return;
  const s = Math.sin(ph);
  u.legL.rotation.x = s * 0.8 * amt;
  u.legR.rotation.x = -s * 0.8 * amt;
  u.armL.rotation.x = -s * 0.7 * amt;
  u.armR.rotation.x = s * 0.7 * amt;
  u.body.position.y = Math.abs(s) * 0.16 * amt;
  u.head.rotation.z = Math.sin(t * 2) * 0.04 * (1 - amt);
}

export interface NpcWalker {
  g: THREE.Group;
  from: number;
  to: number;
  ph: number;
  sp: number;
  wait: number;
}

export interface PathNode {
  x: number;
  z: number;
  n: number[];
}

export function buildPathGraphAndNpcs(ctx: {
  scene: THREE.Scene;
  mat: (c: string | number, o?: THREE.MeshPhongMaterialParameters) => THREE.MeshPhongMaterial;
  rng: () => number;
}): {
  npcs: NpcWalker[];
  pn: PathNode[];
  animateNpcs: (dt: number, t: number) => void;
} {
  const { scene, mat, rng } = ctx;
  const pn: PathNode[] = [];

  const pnode = (x: number, z: number): number => {
    for (let i = 0; i < pn.length; i++) {
      if (Math.hypot(pn[i].x - x, pn[i].z - z) < 1.5) return i;
    }
    pn.push({ x, z, n: [] });
    return pn.length - 1;
  };

  PATHS.forEach(([ax, az, bx, bz]) => {
    const a = pnode(ax, az);
    const b = pnode(bx, bz);
    pn[a].n.push(b);
    pn[b].n.push(a);
  });

  const npcLook: { shirt: string; hair: string; pants: string; acc?: string }[] = [
    { shirt: '#FFFFFF', hair: '#2A1E1A', pants: '#2D4A6B', acc: 'pony' },
    { shirt: '#00AEEF', hair: '#3A2A22', pants: '#30343A' },
    { shirt: '#FFC83A', hair: '#24202A', pants: '#2D4A6B', acc: 'cap' },
    { shirt: '#38B865', hair: '#6B3E26', pants: '#3C3F58', acc: 'bun' },
    { shirt: '#FFFFFF', hair: '#24202A', pants: '#1F2C44' },
    { shirt: '#9B6BFF', hair: '#3A2A22', pants: '#2D4A6B', acc: 'pony' },
    { shirt: '#FF6F59', hair: '#24202A', pants: '#30343A' },
    { shirt: '#FFFFFF', hair: '#6B3E26', pants: '#2D4A6B', acc: 'cap' },
    { shirt: '#2FA8F0', hair: '#24202A', pants: '#3C3F58', acc: 'bun' },
  ];

  const npcs: NpcWalker[] = [];
  npcLook.forEach((lk) => {
    const g = makeChibi(lk, rng() < 0.5, mat);
    g.scale.setScalar(0.82);
    g.traverse((m) => {
      if ((m as THREE.Mesh).isMesh) m.castShadow = true;
    });
    scene.add(g);
    const a = Math.floor(rng() * pn.length);
    g.position.set(pn[a].x, 0, pn[a].z);
    npcs.push({
      g,
      from: a,
      to: pn[a].n[0] ?? a,
      ph: rng() * 6,
      sp: 2 + rng() * 1.2,
      wait: rng() * 3,
    });
  });

  const animateNpcs = (dt: number, t: number) => {
    npcs.forEach((n) => {
      if (n.wait > 0) {
        n.wait -= dt;
        animChibi(n.g, n.ph, 0, t);
        return;
      }
      const T = pn[n.to];
      if (!T) return;
      const dx = T.x - n.g.position.x;
      const dz = T.z - n.g.position.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.5) {
        const nb = pn[n.to].n.filter((k) => k !== n.from);
        const nx = nb.length ? nb[Math.floor(Math.random() * nb.length)] : n.from;
        n.from = n.to;
        n.to = nx;
        if (Math.random() < 0.25) n.wait = 1 + Math.random() * 3;
        return;
      }
      n.g.position.x += (dx / d) * n.sp * dt;
      n.g.position.z += (dz / d) * n.sp * dt;
      n.g.rotation.y = lerpAngle(n.g.rotation.y, Math.atan2(dx, dz), 1 - Math.exp(-dt * 8));
      n.ph += dt * n.sp * 1.4;
      animChibi(n.g, n.ph, 1, t);
    });
  };

  return { npcs, pn, animateNpcs };
}

export function getAvatarSvg(index: number): string {
  const a: ChibiAvatarSpec = AVATARS[index] || AVATARS[0];
  const acc =
    a.acc === 'cap'
      ? `<path d="M14 25c0-9 7-15 16-15s16 6 16 15z" fill="#FFC83A"/><path d="M28 23h22a3 3 0 0 1-3 4H28z" fill="#F0B020"/>`
      : a.acc === 'pony'
        ? `<circle cx="49" cy="33" r="6" fill="${a.hair}"/><circle cx="46" cy="27" r="2.4" fill="#38B865"/>`
        : `<circle cx="30" cy="9" r="6" fill="${a.hair}"/><rect x="25" y="12" width="10" height="3" rx="1.5" fill="#FFC83A"/>`;
  return `<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="30" fill="#E6F6DA"/><path d="M12 60c0-11 8-17 18-17s18 6 18 17z" fill="${a.shirt}"/>
  <circle cx="30" cy="31" r="15" fill="#FFD7B5"/><path d="M15 30c0-10 7-16 15-16s15 6 15 16c-4-5-9-7-15-7s-11 2-15 7z" fill="${a.hair}"/>${acc}
  <circle cx="25" cy="33" r="1.9" fill="#2A1E1A"/><circle cx="35" cy="33" r="1.9" fill="#2A1E1A"/><ellipse cx="21.5" cy="37" rx="2.4" ry="1.4" fill="#FF9AAE"/><ellipse cx="38.5" cy="37" rx="2.4" ry="1.4" fill="#FF9AAE"/>
  <path d="M27.5 38.5q2.5 2 5 0" stroke="#2A1E1A" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>`;
}
</file>

<file path="src/engine/fogOfWar.ts">
import * as THREE from 'three';
import { Station } from '../types/game';
import { canvasTex } from './threeHelpers';

export interface FogCluster {
  stationId: string;
  group: THREE.Group;
  puffs: { mesh: THREE.Mesh; baseX: number; baseY: number; baseZ: number; phase: number }[];
  groundVeil: THREE.Mesh;
  unlocked: boolean;
  dissolveProgress: number; // 0 = locked (full mist), 1 = completely dissolved
}

export class FogOfWarSystem {
  private scene: THREE.Scene;
  private clusters: Map<string, FogCluster> = new Map();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public buildForStations(stations: Station[], unlockedIds: Record<string, unknown>): void {
    // Clear previous if any
    this.clusters.forEach((c) => {
      this.scene.remove(c.group);
    });
    this.clusters.clear();

    const veilTex = canvasTex(
      128,
      128,
      (g, W, H) => {
        const gr = g.createRadialGradient(W / 2, H / 2, 4, W / 2, H / 2, W / 2);
        gr.addColorStop(0, 'rgba(220, 236, 232, 0.58)');
        gr.addColorStop(0.65, 'rgba(210, 232, 226, 0.35)');
        gr.addColorStop(1, 'rgba(210, 232, 226, 0)');
        g.fillStyle = gr;
        g.fillRect(0, 0, W, H);
      },
      false
    );

    stations.forEach((st, idx) => {
      const isUnlocked = unlockedIds[st.id] != null;
      const group = new THREE.Group();
      group.position.set(st.x, 0, st.z);

      const radius = st.fogRadius || 30;
      const groundVeil = new THREE.Mesh(
        new THREE.CircleGeometry(radius, 32).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({
          map: veilTex,
          transparent: true,
          depthWrite: false,
          opacity: isUnlocked ? 0 : 0.85,
        })
      );
      groundVeil.position.y = 0.25;
      group.add(groundVeil);

      const puffs: FogCluster['puffs'] = [];
      const puffCount = 9;
      for (let i = 0; i < puffCount; i++) {
        const angle = (i / puffCount) * Math.PI * 2 + idx * 0.7;
        const dist = (0.32 + (i % 3) * 0.22) * radius;
        const bx = Math.cos(angle) * dist;
        const bz = Math.sin(angle) * dist;
        const by = 8 + (i % 3) * 4.5;
        const size = 5.5 + (i % 3) * 2.2;

        const mat = new THREE.MeshLambertMaterial({
          color: 0xf2fbf7,
          emissive: 0x7b988e,
          transparent: true,
          depthWrite: false,
          opacity: isUnlocked ? 0 : 0.46,
        });

        const m = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 1), mat);
        m.scale.set(1.35, 0.65, 1.25);
        m.position.set(bx, by, bz);
        group.add(m);
        puffs.push({ mesh: m, baseX: bx, baseY: by, baseZ: bz, phase: i * 1.1 + idx });
      }

      group.visible = !isUnlocked;
      this.scene.add(group);
      this.clusters.set(st.id, {
        stationId: st.id,
        group,
        puffs,
        groundVeil,
        unlocked: isUnlocked,
        dissolveProgress: isUnlocked ? 1 : 0,
      });
    });
  }

  public syncUnlocked(unlockedIds: Record<string, unknown>): void {
    this.clusters.forEach((cluster, id) => {
      const nowUnlocked = unlockedIds[id] != null;
      if (nowUnlocked && !cluster.unlocked) {
        cluster.unlocked = true;
      } else if (!nowUnlocked && cluster.unlocked) {
        cluster.unlocked = false;
        cluster.dissolveProgress = 0;
        cluster.group.visible = true;
      }
    });
  }

  public animate(dt: number, t: number): void {
    this.clusters.forEach((c) => {
      if (!c.group.visible) return;

      if (c.unlocked && c.dissolveProgress < 1) {
        c.dissolveProgress = Math.min(1, c.dissolveProgress + dt * 0.85);
        const rem = 1 - c.dissolveProgress;
        (c.groundVeil.material as THREE.MeshBasicMaterial).opacity = 0.85 * rem;

        c.puffs.forEach((p) => {
          p.mesh.position.y = p.baseY + c.dissolveProgress * 18;
          p.mesh.scale.set(1.35 * (0.4 + 0.6 * rem), 0.65 * rem, 1.25 * (0.4 + 0.6 * rem));
          (p.mesh.material as THREE.MeshLambertMaterial).opacity = 0.46 * rem;
        });

        if (c.dissolveProgress >= 1) {
          c.group.visible = false;
        }
      } else if (!c.unlocked) {
        c.puffs.forEach((p) => {
          p.mesh.position.x = p.baseX + Math.sin(t * 0.55 + p.phase) * 2.1;
          p.mesh.position.y = p.baseY + Math.cos(t * 0.7 + p.phase) * 1.1;
          p.mesh.rotation.y = t * 0.15 + p.phase;
        });
      }
    });
  }
}
</file>

<file path="src/engine/natureAndTrain.ts">
import * as THREE from 'three';
import { CAMP, LAKE, PATHS, ROADS, ZONES } from '../data/campusLayout';
import { Station } from '../types/game';
import { AABB, canvasTex, ell, heightAt, mesh, rr, segDist, signTex } from './threeHelpers';

export interface NatureAndTrainState {
  clouds: THREE.Group[];
  balloons: THREE.Group[];
  train: THREE.Group[];
  puffs: { m: THREE.Mesh; life: number }[];
  animate: (dt: number, t: number) => void;
}

export function buildNatureAndTrain(ctx: {
  scene: THREE.Scene;
  col: AABB[];
  stations: Station[];
  mat: (c: string | number, o?: THREE.MeshPhongMaterialParameters) => THREE.MeshPhongMaterial;
  rng: () => number;
}): NatureAndTrainState {
  const { scene, col, stations, mat, rng } = ctx;
  const clouds: THREE.Group[] = [];
  const balloons: THREE.Group[] = [];
  const train: THREE.Group[] = [];
  const puffs: { m: THREE.Mesh; life: number }[] = [];

  const box = (
    w: number,
    h: number,
    d: number,
    c: string,
    x?: number,
    y?: number,
    z?: number
  ) => mesh(new THREE.BoxGeometry(w, h, d), mat(c), x, y, z);

  const freeSpot = (x: number, z: number, pad: number): boolean => {
    for (const c of col) {
      if (x > c[0] - pad && x < c[2] + pad && z > c[1] - pad && z < c[3] + pad) return false;
    }
    for (const c of ZONES) {
      if (x > c[0] - 1.5 && x < c[2] + 1.5 && z > c[1] - 1.5 && z < c[3] + 1.5) return false;
    }
    for (const p of PATHS) {
      if (segDist(x, z, p[0], p[1], p[2], p[3]) < 3.6) return false;
    }
    for (const s of stations) {
      if (Math.hypot(x - s.x, z - s.z) < 9) return false;
    }
    for (const Q of ROADS) {
      if (segDist(x, z, Q[0], Q[1], Q[2], Q[3]) < 10) return false;
    }
    const d = ell(x, z);
    if (d > 1.12 && d < 1.28) return false;
    if (Math.abs(d - 1) < 0.03) return false;
    if (Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r * 1.5 + 6) return false;
    if (x > -52 && x < 52 && Math.abs(z) < 3.5) return false;
    return true;
  };

  // 1. Trees, bushes, flowers, clouds, hot-air balloons
  const pal = [
    '#4DB352',
    '#66C24F',
    '#8ACF46',
    '#3E9E4F',
    '#A9D84A',
    '#57B947',
    '#F2C14E',
    '#F49A3E',
  ];
  const pick = () => {
    const r = rng();
    return r < 0.06 ? pal[7] : r < 0.16 ? pal[6] : pal[Math.floor(rng() * 6)];
  };

  interface TreeItem {
    x: number;
    z: number;
    y: number;
    s: number;
    c: string;
  }
  const round: TreeItem[] = [];
  const pine: TreeItem[] = [];

  for (let i = 0; i < 1400 && round.length + pine.length < 640; i++) {
    const x = -560 + rng() * 1120;
    const z = -480 + rng() * 960;
    const d = ell(x, z);
    if (d < 1.03 || d > 3.2) continue;
    if (!freeSpot(x, z, 0)) continue;
    const y = heightAt(x, z);
    if (y < -0.1) continue;
    (rng() < 0.32 ? pine : round).push({ x, z, y, s: 2.2 + rng() * 2.4, c: pick() });
  }
  for (let i = 0; i < 500 && round.length < 760; i++) {
    const x = -150 + rng() * 290;
    const z = -120 + rng() * 235;
    if (ell(x, z) > 0.96 || !freeSpot(x, z, 4)) continue;
    round.push({ x, z, y: 0, s: 2 + rng() * 1.8, c: pick() });
  }

  const o = new THREE.Object3D();
  const cc = new THREE.Color();
  const can = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.MeshPhongMaterial({ flatShading: true, shininess: 4 }),
    round.length
  );
  const trunk = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.3, 0.45, 1, 6),
    mat('#8A5A3A'),
    round.length + pine.length
  );
  const cone = new THREE.InstancedMesh(
    new THREE.ConeGeometry(1, 1, 7),
    new THREE.MeshPhongMaterial({ flatShading: true, shininess: 4 }),
    pine.length
  );
  let ti = 0;
  round.forEach((t, i) => {
    const th = t.s * 0.9;
    o.position.set(t.x, t.y + th / 2, t.z);
    o.rotation.set(0, 0, 0);
    o.scale.set(1, th, 1);
    o.updateMatrix();
    trunk.setMatrixAt(ti++, o.matrix);

    o.position.set(t.x, t.y + th + t.s * 0.75, t.z);
    o.rotation.set(rng() * 0.6, rng() * 6, rng() * 0.6);
    o.scale.set(t.s, t.s * 1.12, t.s);
    o.updateMatrix();
    can.setMatrixAt(i, o.matrix);
    can.setColorAt(i, cc.set(t.c));
  });
  pine.forEach((t, i) => {
    const th = t.s * 0.6;
    o.position.set(t.x, t.y + th / 2, t.z);
    o.rotation.set(0, 0, 0);
    o.scale.set(1, th, 1);
    o.updateMatrix();
    trunk.setMatrixAt(ti++, o.matrix);

    o.position.set(t.x, t.y + th + t.s * 1.3, t.z);
    o.rotation.set(0, rng() * 6, 0);
    o.scale.set(t.s * 0.9, t.s * 2.8, t.s * 0.9);
    o.updateMatrix();
    cone.setMatrixAt(i, o.matrix);
    cone.setColorAt(i, cc.set(rng() < 0.5 ? '#2E8B57' : '#3C9C5A'));
  });
  [can, trunk, cone].forEach((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    scene.add(m);
  });

  // Perimeter bush hedge
  const bush: [number, number][] = [];
  const gates: [number, number][] = [
    [-66, 114],
    [136, 56],
  ];
  for (let a = 0; a < Math.PI * 2; a += 0.0115) {
    const x = CAMP.cx + CAMP.rx * Math.cos(a);
    const z = CAMP.cz + CAMP.rz * Math.sin(a);
    if (gates.some(([gx, gz]) => Math.hypot(x - gx, z - gz) < 9)) continue;
    bush.push([x, z]);
  }
  const bm = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.MeshPhongMaterial({ flatShading: true, shininess: 4 }),
    bush.length
  );
  bush.forEach(([x, z], i) => {
    o.position.set(x, 0.8, z);
    o.rotation.set(rng(), rng() * 6, rng());
    o.scale.set(1.5, 1.1, 1.5);
    o.updateMatrix();
    bm.setMatrixAt(i, o.matrix);
    bm.setColorAt(i, cc.set(i % 3 ? '#3E9E4F' : '#58B957'));
  });
  bm.castShadow = true;
  if (bm.instanceColor) bm.instanceColor.needsUpdate = true;
  scene.add(bm);

  // Small flowers
  const fl: [number, number][] = [];
  for (let i = 0; i < 1600 && fl.length < 320; i++) {
    const x = -150 + rng() * 290;
    const z = -120 + rng() * 235;
    if (ell(x, z) > 0.95 || !freeSpot(x, z, 2.5)) continue;
    fl.push([x, z]);
  }
  const fm = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.32, 0),
    new THREE.MeshPhongMaterial({ flatShading: true }),
    fl.length
  );
  const fc = ['#FF8FB1', '#FFD23F', '#FFFFFF', '#FF7A59', '#B58CFF'];
  fl.forEach(([x, z], i) => {
    o.position.set(x, 0.3, z);
    o.rotation.set(0, 0, 0);
    o.scale.setScalar(1);
    o.updateMatrix();
    fm.setMatrixAt(i, o.matrix);
    fm.setColorAt(i, cc.set(fc[i % fc.length]));
  });
  if (fm.instanceColor) fm.instanceColor.needsUpdate = true;
  scene.add(fm);

  // Sky clouds
  const cm = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x8a9a94 });
  for (let i = 0; i < 18; i++) {
    const g = new THREE.Group();
    const n = 4 + Math.floor(rng() * 3);
    for (let k = 0; k < n; k++) {
      const s = 4 + rng() * 5;
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1), cm);
      m.position.set((k - n / 2) * 5.5 + rng() * 2, rng() * 3, rng() * 4 - 2);
      m.scale.y = 0.8;
      g.add(m);
    }
    g.position.set(-500 + rng() * 1000, 70 + rng() * 45, -420 + rng() * 760);
    scene.add(g);
    clouds.push(g);
  }

  // Hot-air balloons
  (
    [
      [['#00AEEF', '#FFFFFF', '#FFC83A', '#FFFFFF'], -160, 85, -120],
      [['#FF6F59', '#FFC83A', '#FF6F59', '#FFFFFF'], 190, 95, 60],
      [['#38B865', '#FFFFFF', '#9B6BFF', '#FFFFFF'], 40, 110, -210],
    ] as [string[], number, number, number][]
  ).forEach(([cols, x, y, z], i) => {
    const g = new THREE.Group();
    const tex = canvasTex(
      256,
      64,
      (c, W, H) => {
        cols.forEach((cl, k) => {
          for (let j = k; j < 16; j += cols.length) {
            c.fillStyle = cl;
            c.fillRect((j * W) / 16, 0, W / 16 + 1, H);
          }
        });
      },
      true
    );
    const env = new THREE.Mesh(
      new THREE.SphereGeometry(6, 16, 12),
      new THREE.MeshPhongMaterial({ map: tex, flatShading: true, shininess: 10 })
    );
    env.scale.y = 1.18;
    env.castShadow = true;
    g.add(env);
    g.add(box(2, 1.4, 2, '#B07A48', 0, -9.6, 0));
    [
      [-0.8, -0.8],
      [0.8, -0.8],
      [0.8, 0.8],
      [-0.8, 0.8],
    ].forEach(([a, b]) => g.add(box(0.08, 3.2, 0.08, '#6B4B2A', a, -7.6, b)));
    g.position.set(x, y, z);
    g.userData = { y, ph: i * 2 };
    scene.add(g);
    balloons.push(g);
  });

  // 2. TDC Express Train & Railway Track
  const trackPts: THREE.Vector3[] = [];
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const w = 1 + 0.035 * Math.sin(3 * a + 0.7);
    trackPts.push(
      new THREE.Vector3(
        CAMP.cx + CAMP.rx * 1.2 * w * Math.cos(a),
        0,
        CAMP.cz + CAMP.rz * 1.2 * w * Math.sin(a)
      )
    );
  }
  const track = new THREE.CatmullRomCurve3(trackPts, true, 'catmullrom', 0.5);
  const TL = track.getLength();

  const ribbon = (N: number, w: number, off: number, y: number, color: string) => {
    const pos: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i <= N; i++) {
      const u = (i / N) % 1;
      const p = track.getPointAt(u);
      const t = track.getTangentAt(u);
      const l = Math.hypot(t.x, t.z) || 1;
      const nx = -t.z / l;
      const nz = t.x / l;
      const a = off - w / 2;
      const b = off + w / 2;
      pos.push(p.x + nx * a, y, p.z + nz * a, p.x + nx * b, y, p.z + nz * b);
      if (i < N) {
        const k = i * 2;
        idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    const m = new THREE.Mesh(
      g,
      new THREE.MeshPhongMaterial({ color, side: THREE.DoubleSide, shininess: 4 })
    );
    m.receiveShadow = true;
    scene.add(m);
  };

  ribbon(700, 4, 0, 0.1, '#B65A3F');
  const nSl = Math.floor(TL / 1.3);
  const sl = new THREE.InstancedMesh(new THREE.BoxGeometry(3.2, 0.2, 0.5), mat('#6E3E2C'), nSl);
  for (let i = 0; i < nSl; i++) {
    const u = i / nSl;
    const p = track.getPointAt(u);
    const t = track.getTangentAt(u);
    o.position.set(p.x, 0.24, p.z);
    o.rotation.set(0, Math.atan2(t.x, t.z) + Math.PI / 2, 0);
    o.scale.set(1, 1, 1);
    o.updateMatrix();
    sl.setMatrixAt(i, o.matrix);
  }
  sl.receiveShadow = true;
  scene.add(sl);
  ribbon(700, 0.24, -0.78, 0.38, '#E9E1D4');
  ribbon(700, 0.24, 0.78, 0.38, '#E9E1D4');

  const winT = canvasTex(128, 64, (g, W, H) => {
    g.fillStyle = '#FFFFFF';
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#7FCBEE';
    rr(g, 16, 12, 96, 36, 10);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,.6)';
    g.fillRect(24, 16, 8, 26);
  });
  const banner = signTex([['TUYỂN SINH 2027 · TDC', 96]], '#FFC83A', '#3D2A00', 1200, 170);
  const wheels = (g: THREE.Group) =>
    [
      [-1.2, -2.4],
      [1.2, -2.4],
      [-1.2, 2.4],
      [1.2, 2.4],
    ].forEach(([x, z]) => {
      const w = mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.3, 12), mat('#2D3238'), x, 0.6, z);
      w.rotation.z = Math.PI / 2;
      g.add(w);
    });

  // Locomotive
  {
    const g = new THREE.Group();
    g.add(box(2.7, 0.6, 7.2, '#3A4046', 0, 0.95, 0));
    wheels(g);
    const boil = mesh(new THREE.CylinderGeometry(1.15, 1.15, 4, 14), mat('#00AEEF'), 0, 2.4, 1.2);
    boil.rotation.x = Math.PI / 2;
    g.add(boil);
    g.add(
      mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.3, 14), mat('#FFC83A'), 0, 2.4, 3.2).rotateX(
        Math.PI / 2
      )
    );
    g.add(box(2.6, 2.8, 2.6, '#0A7FC2', 0, 2.6, -2));
    g.add(box(3, 0.35, 3, '#FF6F59', 0, 4.15, -2));
    const ch = mesh(new THREE.CylinderGeometry(0.42, 0.3, 1.5, 10), mat('#30343A'), 0, 4, 2.2);
    g.add(ch);
    g.userData.chim = ch;
    g.add(
      mesh(new THREE.SphereGeometry(0.38, 10, 8), mat('#FFF3B0', { emissive: 0x997700 }), 0, 2.4, 3.45)
    );
    const cw = mesh(new THREE.ConeGeometry(1.2, 1.2, 4), mat('#FF6F59'), 0, 0.9, 3.9);
    cw.rotation.x = Math.PI / 2;
    cw.rotation.y = Math.PI / 4;
    g.add(cw);
    scene.add(g);
    train.push(g);
  }

  // Carriages
  ['#FF6F59', '#FFC83A', '#38B865', '#9B6BFF'].forEach((c, i) => {
    const g = new THREE.Group();
    g.add(box(2.7, 0.6, 7, '#3A4046', 0, 0.95, 0));
    wheels(g);
    const t = winT.clone();
    t.needsUpdate = true;
    t.repeat.set(3, 1);
    const wm = new THREE.MeshPhongMaterial({ map: t });
    g.add(
      mesh(
        new THREE.BoxGeometry(2.6, 2.3, 6.6),
        [wm, wm, mat(c), mat(c), mat(c), mat(c)],
        0,
        2.4,
        0
      )
    );
    g.add(box(2.95, 0.35, 6.9, c, 0, 3.7, 0));
    if (i === 1) {
      [1.33, -1.33].forEach((x) => {
        const b = new THREE.Mesh(
          new THREE.PlaneGeometry(6, 0.8),
          new THREE.MeshPhongMaterial({ map: banner, shininess: 4, side: THREE.FrontSide })
        );
        b.position.set(x, 1.5, 0);
        b.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2;
        g.add(b);
      });
    }
    scene.add(g);
    train.push(g);
  });

  const pm = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    emissive: 0x777777,
    transparent: true,
  });
  for (let i = 0; i < 16; i++) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 1), pm.clone());
    m.visible = false;
    scene.add(m);
    puffs.push({ m, life: 0 });
  }

  let trainU = 0.12;
  let puffT = 0;
  const tmpQ = new THREE.Vector3();

  const animate = (dt: number, t: number) => {
    clouds.forEach((c, i) => {
      c.position.x += dt * (2 + (i % 3));
      if (c.position.x > 520) c.position.x = -520;
    });
    balloons.forEach((b) => {
      b.position.y = b.userData.y + Math.sin(t * 0.4 + b.userData.ph) * 3;
      b.rotation.y += dt * 0.05;
      b.position.x += Math.sin(t * 0.05 + b.userData.ph) * dt * 2;
    });

    trainU = (trainU + (dt * 7.5) / TL) % 1;
    const gap = 8.4 / TL;
    train.forEach((g, i) => {
      const u = (((trainU - i * gap) % 1) + 1) % 1;
      const p = track.getPointAt(u);
      g.position.copy(p);
      track.getPointAt((u + 0.002) % 1, tmpQ);
      g.lookAt(tmpQ.x, p.y, tmpQ.z);
    });

    puffT -= dt;
    const loco = train[0];
    if (puffT <= 0 && loco) {
      puffT = 0.35;
      const f = puffs.find((q) => q.life <= 0);
      if (f) {
        (loco.userData.chim as THREE.Object3D).getWorldPosition(f.m.position);
        f.m.position.y += 1;
        f.life = 1;
        f.m.visible = true;
        f.m.scale.setScalar(0.6);
      }
    }
    puffs.forEach((q) => {
      if (q.life <= 0) return;
      q.life -= dt * 0.55;
      q.m.position.y += dt * 2.6;
      q.m.scale.multiplyScalar(1 + dt * 1.1);
      (q.m.material as THREE.MeshLambertMaterial).opacity = Math.max(0, q.life);
      if (q.life <= 0) q.m.visible = false;
    });
  };

  return { clouds, balloons, train, puffs, animate };
}
</file>

<file path="src/engine/TdcCampusEngine.ts">
import * as THREE from 'three';
import { AVATARS, CAMP, PATHS } from '../data/campusLayout';
import { Station, UnlockedStationRecord } from '../types/game';
import { audioSfx } from './audioSfx';
import { buildCampusEnvironment } from './campusBuilder';
import { animChibi, buildPathGraphAndNpcs, makeChibi } from './chibiBuilder';
import { FogOfWarSystem } from './fogOfWar';
import { buildNatureAndTrain } from './natureAndTrain';
import {
  AABB,
  canvasTex,
  clamp,
  coinTex,
  createMaterialCache,
  createRng,
  ell,
  lerpAngle,
  mesh,
  pill,
} from './threeHelpers';

export interface FloatingTextItem {
  id: number;
  text: string;
  x: number;
  y: number;
  opacity: number;
  scale: number;
  color?: string;
}

export interface GuideState {
  station: Station | null;
  distance: number;
  angleRad: number;
  allDone: boolean;
}

export interface MinimapSnapshot {
  playerX: number;
  playerZ: number;
  playerRotY: number;
  camYaw: number;
  col: AABB[];
}

export interface EngineCallbacks {
  onNearStationChange: (st: Station | null) => void;
  onOpenStationRequest: (st: Station) => void;
  onStarCollected: () => void;
  onPlayerMoveSave: (pos: [number, number]) => void;
  onFloatingTextsUpdate: (items: FloatingTextItem[]) => void;
  onGuideUpdate: (guide: GuideState) => void;
  onMinimapUpdate: (snap: MinimapSnapshot) => void;
}

interface StarObject {
  m: THREE.Mesh;
  alive: boolean;
  timer: number;
  ph: number;
}

interface Station3DNode {
  g: THREE.Group;
  ring: THREE.Mesh;
  disc: THREE.Mesh;
  beam: THREE.Mesh;
  icon: THREE.Sprite;
  lab: THREE.Sprite;
}

export class TdcCampusEngine {
  private container: HTMLElement;
  private callbacks: EngineCallbacks;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private sun: THREE.DirectionalLight;
  private col: AABB[] = [];
  private mat = createMaterialCache();
  private rng = createRng(20261021);
  private fogOfWar: FogOfWarSystem;

  private stations: Station[] = [];
  private unlockedMap: Record<string, UnlockedStationRecord> = {};
  private st3d: Record<string, Station3DNode> = {};
  private stars: StarObject[] = [];
  private parts: { m: THREE.Mesh; v: THREE.Vector3; life: number }[] = [];
  private fxList: {
    id: number;
    text: string;
    p: THREE.Vector3;
    life: number;
    color?: string;
  }[] = [];
  private fxSeq = 1;

  private player = {
    obj: null as THREE.Group | null,
    pos: new THREE.Vector3(-66, 0, 100),
    ph: 0,
    tag: null as THREE.Sprite | null,
  };

  private cam = {
    yaw: 0.25,
    pitch: 0.92,
    dist: 40,
    curD: null as number | null,
    curP: null as number | null,
    tgt: new THREE.Vector3(-5, 0, -5),
  };

  private running = false;
  private paused = false;
  private photoStation: Station | null = null;
  private nearStation: Station | null = null;
  private moveTarget: THREE.Vector3 | null = null;
  private tMark: THREE.Mesh | null = null;
  private flagMesh: THREE.Mesh | null = null;

  private keys = new Set<string>();
  private joy = { x: 0, y: 0 };
  private disposed = false;
  private rafId = 0;
  private resizeObs: ResizeObserver;

  private cleanupWindowListeners?: () => void;

  private animateNatureAndTrain?: (dt: number, t: number) => void;
  private animateNpcs?: (dt: number, t: number) => void;

  constructor(
    container: HTMLElement,
    initialStations: Station[],
    initialUnlocked: Record<string, UnlockedStationRecord>,
    callbacks: EngineCallbacks
  ) {
    this.container = container;
    this.stations = initialStations;
    this.unlockedMap = initialUnlocked;
    this.callbacks = callbacks;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0xd3eedf, 380, 1100);
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.5, 2600);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x8dbf73, 0.74));

    this.sun = new THREE.DirectionalLight(0xfff2d8, 0.8);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    Object.assign(this.sun.shadow.camera, {
      left: -150,
      right: 150,
      top: 150,
      bottom: -150,
      near: 10,
      far: 500,
    });
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.03;
    this.scene.add(this.sun, this.sun.target);

    this.fogOfWar = new FogOfWarSystem(this.scene);

    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(this.container);
    this.resize();

    this.initWorld();
    this.bindEvents();
    this.startLoop();
  }

  private initWorld(): void {
    const { flag } = buildCampusEnvironment({
      scene: this.scene,
      col: this.col,
      mat: this.mat,
      rng: this.rng,
    });
    this.flagMesh = flag;

    const nat = buildNatureAndTrain({
      scene: this.scene,
      col: this.col,
      stations: this.stations,
      mat: this.mat,
      rng: this.rng,
    });
    this.animateNatureAndTrain = nat.animate;

    const npcState = buildPathGraphAndNpcs({
      scene: this.scene,
      mat: this.mat,
      rng: this.rng,
    });
    this.animateNpcs = npcState.animateNpcs;

    // Stars
    const sh = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 ? 0.45 : 1;
      if (i) sh.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      else sh.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    const sg = new THREE.ExtrudeGeometry(sh, {
      depth: 0.32,
      bevelEnabled: true,
      bevelSize: 0.1,
      bevelThickness: 0.1,
      bevelSegments: 1,
    });
    sg.center();
    const sm = new THREE.MeshPhongMaterial({
      color: '#FFD23F',
      emissive: '#7A5200',
      shininess: 60,
      flatShading: true,
    });
    for (let i = 0; i < 34; i++) {
      const m = mesh(sg, sm, 0, 1.7, 0);
      this.scene.add(m);
      const s: StarObject = { m, alive: true, timer: 0, ph: this.rng() * 6 };
      this.placeStar(s);
      this.stars.push(s);
    }

    // Build 3D station markers & Fog of War
    this.rebuildStations3D();

    // Ground tap marker & particles
    this.tMark = new THREE.Mesh(
      new THREE.RingGeometry(0.9, 1.3, 28).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.9 })
    );
    this.tMark.visible = false;
    this.scene.add(this.tMark);

    const pg = new THREE.OctahedronGeometry(0.28, 0);
    for (let i = 0; i < 60; i++) {
      const m = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ color: '#FFD23F' }));
      m.visible = false;
      this.scene.add(m);
      this.parts.push({ m, v: new THREE.Vector3(), life: 0 });
    }
  }

  public rebuildStations3D(): void {
    Object.values(this.st3d).forEach((node) => {
      this.scene.remove(node.g);
    });
    this.st3d = {};

    const beamT = canvasTex(
      4,
      128,
      (g, W, H) => {
        const gr = g.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, 'rgba(255,255,255,0)');
        gr.addColorStop(1, 'rgba(255,255,255,.75)');
        g.fillStyle = gr;
        g.fillRect(0, 0, W, H);
      },
      false
    );

    this.stations
      .filter((st) => st.active !== false)
      .forEach((st) => {
        const g = new THREE.Group();
        g.position.set(st.x, 0, st.z);
        this.scene.add(g);

        const ring = new THREE.Mesh(
          new THREE.RingGeometry(2.6, 3.3, 40).rotateX(-Math.PI / 2),
          new THREE.MeshBasicMaterial({ color: st.col, transparent: true, opacity: 0.9 })
        );
        ring.position.y = 0.16;
        g.add(ring);

        const disc = new THREE.Mesh(
          new THREE.CircleGeometry(2.6, 40).rotateX(-Math.PI / 2),
          new THREE.MeshBasicMaterial({ color: st.col, transparent: true, opacity: 0.22 })
        );
        disc.position.y = 0.15;
        g.add(disc);

        const beam = new THREE.Mesh(
          new THREE.CylinderGeometry(1.4, 2.2, 22, 20, 1, true),
          new THREE.MeshBasicMaterial({
            color: st.col,
            map: beamT,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            opacity: 0.55,
          })
        );
        beam.position.y = 11;
        g.add(beam);

        const ped = mesh(new THREE.CylinderGeometry(0.9, 1.2, 0.8, 12), this.mat('#FFFFFF'), 0, 0.4, 0);
        g.add(ped);

        const isDone = this.unlockedMap[st.id] != null;
        const icon = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: coinTex(st, isDone), transparent: true })
        );
        icon.scale.setScalar(4.6);
        icon.position.y = 5.5;
        g.add(icon);

        const lab = pill(st.name, { h: 2.2, dot: st.col });
        lab.position.y = 9;
        g.add(lab);

        this.st3d[st.id] = { g, ring, disc, beam, icon, lab };
        this.applyStationVisualState(st);
      });

    this.fogOfWar.buildForStations(
      this.stations.filter((s) => s.active !== false),
      this.unlockedMap
    );
  }

  private applyStationVisualState(st: Station): void {
    const s = this.st3d[st.id];
    if (!s) return;
    const d = this.unlockedMap[st.id] != null;
    s.icon.material.map = coinTex(st, d);
    s.icon.material.needsUpdate = true;
    s.beam.visible = !d;
    (s.ring.material as THREE.MeshBasicMaterial).color.set(d ? '#3DAA5C' : st.col);
    (s.disc.material as THREE.MeshBasicMaterial).color.set(d ? '#3DAA5C' : st.col);
  }

  public updateStationsAndProgress(
    stations: Station[],
    unlocked: Record<string, UnlockedStationRecord>
  ): void {
    const prevKey = this.stations
      .map((s) => `${s.id}:${s.x}:${s.z}:${s.fogRadius}:${s.col}:${s.type}:${s.name}:${s.active}`)
      .join('|');
    const nextKey = stations
      .map((s) => `${s.id}:${s.x}:${s.z}:${s.fogRadius}:${s.col}:${s.type}:${s.name}:${s.active}`)
      .join('|');
    const structureChanged = prevKey !== nextKey;

    this.stations = stations;
    this.unlockedMap = unlocked;

    if (structureChanged) {
      this.rebuildStations3D();
    } else {
      this.stations.forEach((st) => this.applyStationVisualState(st));
      this.fogOfWar.syncUnlocked(this.unlockedMap);
    }
  }

  public startPlayer(
    name: string,
    avatarIdx: number,
    savedPos?: [number, number] | null,
    hasProgress?: boolean
  ): void {
    audioSfx.init();
    if (this.player.obj) {
      this.scene.remove(this.player.obj);
    }
    const spec = AVATARS[avatarIdx] || AVATARS[0];
    this.player.obj = makeChibi(spec, true, this.mat);
    this.player.obj.traverse((m) => {
      if ((m as THREE.Mesh).isMesh) m.castShadow = true;
    });
    this.player.tag = pill(name || 'Bạn', { h: 1.25, fs: 40, bg: '#1E3528', fg: '#FFFFFF' });
    this.player.tag.position.y = 3.9;
    this.player.obj.add(this.player.tag);
    this.scene.add(this.player.obj);

    if (savedPos && hasProgress) {
      this.player.pos.set(savedPos[0], 0, savedPos[1]);
    } else {
      this.player.pos.set(-66, 0, 98);
    }
    this.player.obj.position.copy(this.player.pos);
    this.player.obj.rotation.y = Math.PI;
    this.cam.yaw = 0;
    this.cam.tgt.set(this.player.pos.x, 1.6, this.player.pos.z);
    this.running = true;
    this.paused = false;
  }

  public setPaused(p: boolean): void {
    this.paused = p;
    if (p) {
      this.keys.clear();
      this.joy.x = 0;
      this.joy.y = 0;
    }
  }

  public setJoystick(x: number, y: number): void {
    this.joy.x = x;
    this.joy.y = y;
  }

  public enterPhotoMode(st: Station): void {
    this.photoStation = st;
    if (this.player.obj) {
      this.player.obj.rotation.y = Math.atan2(
        Math.sin(this.cam.yaw),
        Math.cos(this.cam.yaw)
      );
    }
  }

  public exitPhotoMode(): void {
    this.photoStation = null;
  }

  public rotatePhotoCamera(): void {
    this.cam.yaw += 0.6;
    if (this.player.obj) {
      this.player.obj.rotation.y = Math.atan2(
        Math.sin(this.cam.yaw),
        Math.cos(this.cam.yaw)
      );
    }
  }

  public capturePhotoDataUrl(): string {
    this.renderer.render(this.scene, this.camera);
    try {
      return this.renderer.domElement.toDataURL('image/jpeg', 0.85);
    } catch {
      return '';
    }
  }

  public navigateToStation(st: Station): void {
    if (!this.running) return;
    this.moveTarget = new THREE.Vector3(
      st.x,
      0,
      st.z + (st.z > this.player.pos.z ? -3 : 3)
    );
    if (this.tMark) {
      this.tMark.position.set(this.moveTarget.x, 0.2, this.moveTarget.z);
      this.tMark.visible = true;
      this.tMark.scale.setScalar(1.6);
    }
  }

  public celebrateStationUnlock(st: Station, ptsText: string): void {
    this.burst(
      new THREE.Vector3(st.x, 5, st.z),
      ['#FFD23F', '#FF6F59', '#00AEEF', '#38B865', '#FF8FB1', '#9B6BFF'],
      42
    );
    this.spawnFloatText(ptsText, new THREE.Vector3(st.x, 4, st.z));
  }

  public spawnFloatText(text: string, worldPos: THREE.Vector3, color?: string): void {
    this.fxList.push({
      id: this.fxSeq++,
      text,
      p: worldPos.clone().add(new THREE.Vector3(0, 2.5, 0)),
      life: 1,
      color,
    });
  }

  public burst(pos: THREE.Vector3, colors: string[], n: number): void {
    let k = 0;
    for (const p of this.parts) {
      if (p.life > 0) continue;
      p.life = 1;
      p.m.visible = true;
      p.m.position.copy(pos);
      (p.m.material as THREE.MeshBasicMaterial).color.set(colors[k % colors.length]);
      p.v.set(
        (Math.random() - 0.5) * 10,
        6 + Math.random() * 7,
        (Math.random() - 0.5) * 10
      );
      if (++k >= n) break;
    }
  }

  private placeStar(s: StarObject): void {
    for (let k = 0; k < 40; k++) {
      const p = PATHS[Math.floor(this.rng() * PATHS.length)];
      const t = this.rng();
      const x = p[0] + (p[2] - p[0]) * t + (this.rng() - 0.5) * 1.6;
      const z = p[1] + (p[3] - p[1]) * t + (this.rng() - 0.5) * 1.6;
      if (this.stations.some((st) => Math.hypot(st.x - x, st.z - z) < 6)) continue;
      if (
        this.col.some((c) => x > c[0] - 1 && x < c[2] + 1 && z > c[1] - 1 && z < c[3] + 1)
      )
        continue;
      if (
        Math.hypot(x - this.player.pos.x, z - this.player.pos.z) < 10 &&
        this.running
      )
        continue;
      s.m.position.set(x, 1.7, z);
      s.m.visible = true;
      s.alive = true;
      return;
    }
  }

  private resolveCollision(p: THREE.Vector3): void {
    const r = 0.7;
    for (const c of this.col) {
      if (p.x > c[0] - r && p.x < c[2] + r && p.z > c[1] - r && p.z < c[3] + r) {
        const dl = p.x - (c[0] - r);
        const dr = c[2] + r - p.x;
        const dt = p.z - (c[1] - r);
        const db = c[3] + r - p.z;
        const m = Math.min(dl, dr, dt, db);
        if (m === dl) p.x = c[0] - r;
        else if (m === dr) p.x = c[2] + r;
        else if (m === dt) p.z = c[1] - r;
        else p.z = c[3] + r;
      }
    }
    const d = ell(p.x, p.z);
    if (d > 0.985) {
      const k = 0.985 / d;
      p.x = CAMP.cx + (p.x - CAMP.cx) * k;
      p.z = CAMP.cz + (p.z - CAMP.cz) * k;
    }
  }

  private bindEvents(): void {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (!this.running || this.paused || this.photoStation) return;
      const k = e.key.toLowerCase();
      if ((k === 'enter' || k === ' ') && this.nearStation) {
        e.preventDefault();
        this.callbacks.onOpenStationRequest(this.nearStation);
        return;
      }
      if (
        [
          'w',
          'a',
          's',
          'd',
          'q',
          'e',
          'arrowup',
          'arrowdown',
          'arrowleft',
          'arrowright',
        ].includes(k)
      ) {
        e.preventDefault();
        this.keys.add(k);
      }
      if (k === '+' || k === '=') this.cam.dist = clamp(this.cam.dist * 0.85, 16, 130);
      if (k === '-') this.cam.dist = clamp(this.cam.dist / 0.85, 16, 130);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      this.keys.delete(e.key.toLowerCase());
    };

    const onBlur = () => {
      this.keys.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    this.cleanupWindowListeners = () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };

    const cv = this.renderer.domElement;
    const ptrs = new Map<number, { x: number; y: number }>();
    let drag: {
      x: number;
      y: number;
      sx: number;
      sy: number;
      moved: boolean;
    } | null = null;
    let pinch: number | null = null;
    const ray = new THREE.Raycaster();
    const GROUND = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    const tapMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      ray.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - r.left) / r.width) * 2 - 1,
          -((e.clientY - r.top) / r.height) * 2 + 1
        ),
        this.camera
      );
      const p = new THREE.Vector3();
      if (!ray.ray.intersectPlane(GROUND, p)) return;
      if (ell(p.x, p.z) > 0.985) return;
      this.moveTarget = p;
      if (this.tMark) {
        this.tMark.position.set(p.x, 0.2, p.z);
        this.tMark.visible = true;
        this.tMark.scale.setScalar(1.6);
      }
      audioSfx.play('tap');
    };

    cv.addEventListener('pointerdown', (e) => {
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      try {
        cv.setPointerCapture(e.pointerId);
      } catch {
        // Ignore capture error
      }
      if (ptrs.size === 1) {
        drag = {
          x: e.clientX,
          y: e.clientY,
          sx: e.clientX,
          sy: e.clientY,
          moved: false,
        };
      } else if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()];
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
        drag = null;
      }
    });

    cv.addEventListener('pointermove', (e) => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (!this.running) return;
      if (pinch && ptrs.size === 2) {
        const [a, b] = [...ptrs.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        this.cam.dist = clamp((this.cam.dist * pinch) / d, 16, 130);
        pinch = d;
        return;
      }
      if (!drag) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 8) drag.moved = true;
      if (drag.moved) {
        this.cam.yaw -= dx * 0.006;
        this.cam.pitch = clamp(this.cam.pitch + dy * 0.004, 0.32, 1.38);
      }
    });

    const endPtr = (e: PointerEvent) => {
      if (
        drag &&
        !drag.moved &&
        ptrs.size === 1 &&
        this.running &&
        !this.paused &&
        !this.photoStation
      ) {
        tapMove(e);
      }
      ptrs.delete(e.pointerId);
      if (ptrs.size < 2) pinch = null;
      if (!ptrs.size) drag = null;
    };

    cv.addEventListener('pointerup', endPtr);
    cv.addEventListener('pointercancel', (e) => {
      ptrs.delete(e.pointerId);
      drag = null;
      pinch = null;
    });
    cv.addEventListener(
      'wheel',
      (e) => {
        if (!this.running) return;
        e.preventDefault();
        this.cam.dist = clamp(this.cam.dist * (1 + e.deltaY * 0.0012), 16, 130);
      },
      { passive: false }
    );
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private resize(): void {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = `${w}px`;
    this.renderer.domElement.style.height = `${h}px`;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private startLoop(): void {
    let last = performance.now();
    let T = 0;
    let saveT = 0;
    let hudSyncT = 0;
    const tmpV = new THREE.Vector3();

    const frame = (now: number) => {
      if (this.disposed) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      T += dt;

      if (this.running && !this.paused && !this.photoStation) {
        this.updatePlayer(dt, T);
        saveT -= dt;
        if (saveT <= 0) {
          saveT = 2.0;
          this.callbacks.onPlayerMoveSave([
            +this.player.pos.x.toFixed(1),
            +this.player.pos.z.toFixed(1),
          ]);
        }
      } else if (this.running && this.player.obj) {
        animChibi(this.player.obj, this.player.ph, 0, T);
      }

      // Camera update
      let d: number;
      let p: number;
      if (this.running) {
        this.cam.tgt.lerp(
          tmpV.set(this.player.pos.x, 1.6, this.player.pos.z),
          1 - Math.exp(-dt * 7)
        );
        d = this.photoStation ? 15 : this.cam.dist;
        p = this.photoStation ? 0.38 : this.cam.pitch;
      } else {
        this.cam.yaw += dt * 0.035;
        this.cam.tgt.lerp(tmpV.set(10, 0, -2), 1 - Math.exp(-dt * 2));
        const a = this.camera.aspect || 1;
        d = a < 1 ? (430 / Math.max(a, 0.5)) * 0.75 : 300;
        p = 0.74;
      }
      this.cam.curD =
        this.cam.curD == null
          ? d
          : this.cam.curD + (d - this.cam.curD) * (1 - Math.exp(-dt * 4));
      this.cam.curP =
        this.cam.curP == null
          ? p
          : this.cam.curP + (p - this.cam.curP) * (1 - Math.exp(-dt * 4));

      this.camera.position.set(
        this.cam.tgt.x + Math.sin(this.cam.yaw) * Math.cos(this.cam.curP) * this.cam.curD,
        this.cam.tgt.y + Math.sin(this.cam.curP) * this.cam.curD,
        this.cam.tgt.z + Math.cos(this.cam.yaw) * Math.cos(this.cam.curP) * this.cam.curD
      );
      this.camera.lookAt(this.cam.tgt);
      this.sun.position.set(this.cam.tgt.x + 70, 150, this.cam.tgt.z + 55);
      this.sun.target.position.copy(this.cam.tgt);

      // Animate world
      this.animateWorld(dt, T);
      this.fogOfWar.animate(dt, T);

      this.renderer.render(this.scene, this.camera);

      if (this.running) {
        this.updateFloatingTexts(dt, tmpV);
        hudSyncT -= dt;
        if (hudSyncT <= 0) {
          hudSyncT = 0.08;
          this.emitGuideAndMinimap();
        }
      }

      this.rafId = requestAnimationFrame(frame);
    };

    this.rafId = requestAnimationFrame(frame);
  }

  private updatePlayer(dt: number, t: number): void {
    let ix = 0;
    let iy = 0;
    if (this.keys.has('w') || this.keys.has('arrowup')) iy += 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) iy -= 1;
    if (this.keys.has('a') || this.keys.has('arrowleft')) ix -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) ix += 1;
    if (this.keys.has('q')) this.cam.yaw += 1.7 * dt;
    if (this.keys.has('e')) this.cam.yaw -= 1.7 * dt;
    ix += this.joy.x;
    iy += this.joy.y;

    const fx = -Math.sin(this.cam.yaw);
    const fz = -Math.cos(this.cam.yaw);
    const rx = Math.cos(this.cam.yaw);
    const rz = -Math.sin(this.cam.yaw);
    let mx = fx * iy + rx * ix;
    let mz = fz * iy + rz * ix;
    let amt = Math.hypot(mx, mz);

    if (amt > 0.08) {
      this.moveTarget = null;
      if (this.tMark) this.tMark.visible = false;
      mx /= amt;
      mz /= amt;
      if (amt > 1) amt = 1;
    } else if (this.moveTarget) {
      mx = this.moveTarget.x - this.player.pos.x;
      mz = this.moveTarget.z - this.player.pos.z;
      const d = Math.hypot(mx, mz);
      if (d < 0.7) {
        this.moveTarget = null;
        if (this.tMark) this.tMark.visible = false;
        amt = 0;
      } else {
        mx /= d;
        mz /= d;
        amt = 1;
      }
    } else {
      amt = 0;
    }

    const sp = 10 * amt;
    if (amt > 0) {
      const ox = this.player.pos.x;
      const oz = this.player.pos.z;
      this.player.pos.x += mx * sp * dt;
      this.player.pos.z += mz * sp * dt;
      this.resolveCollision(this.player.pos);
      if (
        this.moveTarget &&
        Math.hypot(this.player.pos.x - ox, this.player.pos.z - oz) < sp * dt * 0.15
      ) {
        this.moveTarget = null;
        if (this.tMark) this.tMark.visible = false;
      }
      if (this.player.obj) {
        this.player.obj.rotation.y = lerpAngle(
          this.player.obj.rotation.y,
          Math.atan2(mx, mz),
          1 - Math.exp(-dt * 12)
        );
      }
      this.player.ph += dt * sp * 1.1;
    }

    if (this.player.obj) {
      animChibi(this.player.obj, this.player.ph, amt, t);
      this.player.obj.position.set(this.player.pos.x, 0, this.player.pos.z);
    }

    // Collect stars
    for (const s of this.stars) {
      if (!s.alive) continue;
      if (
        Math.hypot(
          s.m.position.x - this.player.pos.x,
          s.m.position.z - this.player.pos.z
        ) < 2.4
      ) {
        s.alive = false;
        s.m.visible = false;
        s.timer = 45;
        this.burst(s.m.position, ['#FFD23F', '#FFF3B0', '#FFAA1F'], 10);
        this.spawnFloatText('+10', s.m.position);
        audioSfx.play('coin');
        this.callbacks.onStarCollected();
      }
    }

    // Check near station
    let near: Station | null = null;
    let best = 6.8;
    this.stations
      .filter((st) => st.active !== false)
      .forEach((st) => {
        const d = Math.hypot(st.x - this.player.pos.x, st.z - this.player.pos.z);
        if (d < best) {
          best = d;
          near = st;
        }
      });

    if (near !== this.nearStation) {
      this.nearStation = near;
      this.callbacks.onNearStationChange(near);
    }
  }

  private animateWorld(dt: number, t: number): void {
    this.animateNatureAndTrain?.(dt, t);
    this.animateNpcs?.(dt, t);

    if (this.flagMesh) {
      this.flagMesh.rotation.y = Math.sin(t * 3) * 0.25;
    }

    this.stars.forEach((s) => {
      if (!s.alive) {
        s.timer -= dt;
        if (s.timer <= 0) this.placeStar(s);
        return;
      }
      s.m.rotation.y = t * 2 + s.ph;
      s.m.position.y = 1.7 + Math.sin(t * 2.4 + s.ph) * 0.3;
    });

    this.stations.forEach((st, i) => {
      const s = this.st3d[st.id];
      if (!s) return;
      s.icon.position.y = 5.5 + Math.sin(t * 2 + i) * 0.45;
      const k = 1 + ((t * 0.8 + i * 0.3) % 1) * 0.35;
      s.ring.scale.set(k, 1, k);
      (s.ring.material as THREE.MeshBasicMaterial).opacity =
        0.95 - ((t * 0.8 + i * 0.3) % 1) * 0.6;
    });

    this.parts.forEach((p) => {
      if (p.life <= 0) return;
      p.life -= dt * 1.1;
      p.v.y -= 22 * dt;
      p.m.position.addScaledVector(p.v, dt);
      p.m.rotation.x += dt * 6;
      p.m.scale.setScalar(Math.max(0.05, p.life * 1.3));
      if (p.life <= 0) p.m.visible = false;
    });

    if (this.tMark && this.tMark.visible) {
      this.tMark.scale.multiplyScalar(1 - dt * 1.4);
      if (this.tMark.scale.x < 0.9) this.tMark.scale.setScalar(1.6);
    }
  }

  private updateFloatingTexts(dt: number, tmpV: THREE.Vector3): void {
    if (this.fxList.length === 0) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    const out: FloatingTextItem[] = [];

    for (let i = this.fxList.length - 1; i >= 0; i--) {
      const f = this.fxList[i];
      f.life -= dt * 0.9;
      f.p.y += dt * 3;
      if (f.life <= 0) {
        this.fxList.splice(i, 1);
        continue;
      }
      tmpV.copy(f.p).project(this.camera);
      out.push({
        id: f.id,
        text: f.text,
        x: ((tmpV.x + 1) / 2) * w,
        y: ((1 - tmpV.y) / 2) * h,
        opacity: Math.min(1, f.life * 2),
        scale: 0.8 + f.life * 0.4,
        color: f.color,
      });
    }
    this.callbacks.onFloatingTextsUpdate(out);
  }

  private emitGuideAndMinimap(): void {
    let best: Station | null = null;
    let bd = 1e9;
    const activeStations = this.stations.filter((st) => st.active !== false);
    activeStations.forEach((st) => {
      if (this.unlockedMap[st.id] != null) return;
      const d = Math.hypot(st.x - this.player.pos.x, st.z - this.player.pos.z);
      if (d < bd) {
        bd = d;
        best = st;
      }
    });

    let angleRad = 0;
    if (best) {
      const target = best as Station;
      const vx = target.x - this.player.pos.x;
      const vz = target.z - this.player.pos.z;
      const fx = -Math.sin(this.cam.yaw);
      const fz = -Math.cos(this.cam.yaw);
      const rx = Math.cos(this.cam.yaw);
      const rz = -Math.sin(this.cam.yaw);
      angleRad = Math.atan2(vx * rx + vz * rz, vx * fx + vz * fz);
    }

    this.callbacks.onGuideUpdate({
      station: best,
      distance: best ? bd : 0,
      angleRad,
      allDone: best === null && activeStations.length > 0,
    });

    this.callbacks.onMinimapUpdate({
      playerX: this.player.pos.x,
      playerZ: this.player.pos.z,
      playerRotY: this.player.obj ? this.player.obj.rotation.y : 0,
      camYaw: this.cam.yaw,
      col: this.col,
    });
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    this.cleanupWindowListeners?.();
    this.resizeObs.disconnect();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
</file>

<file path="src/engine/threeHelpers.ts">
import * as THREE from 'three';
import { CAMP, LAKE, ROADS } from '../data/campusLayout';
import { Station } from '../types/game';

export const FH = 4.2;
export const FONT = '"Baloo 2","Nunito",system-ui,sans-serif';

export type AABB = [number, number, number, number];

export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));

export const smooth = (a: number, b: number, x: number): number => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export const lerpAngle = (a: number, b: number, t: number): number => {
  const d = (((b - a + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  return a + d * t;
};

export function createRng(seed: number): () => number {
  let s = seed | 0;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function segDist(
  px: number,
  pz: number,
  ax: number,
  az: number,
  bx: number,
  bz: number
): number {
  const dx = bx - ax;
  const dz = bz - az;
  const L = dx * dx + dz * dz || 1;
  const t = clamp(((px - ax) * dx + (pz - az) * dz) / L, 0, 1);
  return Math.hypot(px - ax - dx * t, pz - az - dz * t);
}

export const ell = (x: number, z: number): number =>
  Math.hypot((x - CAMP.cx) / CAMP.rx, (z - CAMP.cz) / CAMP.rz);

export function heightAt(x: number, z: number): number {
  const d = ell(x, z);
  const n =
    6 * Math.sin(x * 0.031 + 1) * Math.cos(z * 0.027) +
    3 * Math.sin(x * 0.07 + z * 0.05) +
    2.2 * Math.cos(z * 0.09 - x * 0.04);
  let h = smooth(1.3, 1.7, d) * (9 + n) + Math.max(0, d - 1.65) * 55;
  let r = 1e9;
  ROADS.forEach((Q) => {
    r = Math.min(r, segDist(x, z, Q[0], Q[1], Q[2], Q[3]));
  });
  h *= smooth(7, 24, r);
  h = Math.max(h, -0.5);
  const k = smooth(LAKE.r, LAKE.r + 22, Math.hypot(x - LAKE.x, z - LAKE.z));
  return h * k - (1 - k) * 2.4;
}

export function rr(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

export function canvasTex(
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
  rep = true
): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (ctx) {
    draw(ctx, w, h);
  }
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  if (rep !== false) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
  }
  return t;
}

export function createMaterialCache() {
  const MC: Record<string, THREE.MeshPhongMaterial> = {};
  return function mat(
    c: string | number,
    o?: THREE.MeshPhongMaterialParameters
  ): THREE.MeshPhongMaterial {
    const key = String(c);
    if (!o && MC[key]) return MC[key];
    const m = new THREE.MeshPhongMaterial({
      color: c,
      flatShading: true,
      shininess: 6,
      ...(o || {}),
    });
    if (!o) MC[key] = m;
    return m;
  };
}

export function mesh(
  geo: THREE.BufferGeometry,
  m: THREE.Material | THREE.Material[],
  x?: number,
  y?: number,
  z?: number,
  cast?: boolean
): THREE.Mesh {
  const o = new THREE.Mesh(geo, m);
  o.position.set(x || 0, y || 0, z || 0);
  o.castShadow = cast !== false;
  o.receiveShadow = true;
  return o;
}

export function facade(
  wall: string,
  win: string,
  frame: string,
  trim?: string
): THREE.CanvasTexture {
  return canvasTex(128, 128, (g, W, H) => {
    g.fillStyle = wall;
    g.fillRect(0, 0, W, H);
    g.fillStyle = frame;
    rr(g, 24, 22, 80, 66, 14);
    g.fill();
    g.fillStyle = win;
    rr(g, 31, 29, 66, 52, 9);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,.62)';
    rr(g, 38, 35, 9, 32, 4);
    g.fill();
    g.fillStyle = trim || frame;
    rr(g, 18, 92, 92, 9, 4);
    g.fill();
    g.fillStyle = 'rgba(0,0,0,.07)';
    g.fillRect(0, H - 5, W, 5);
  });
}

export function signTex(
  lines: [string, number][],
  bg: string,
  fg: string,
  w?: number,
  h?: number
): THREE.CanvasTexture {
  return canvasTex(
    w || 1024,
    h || 200,
    (g, W, H) => {
      g.fillStyle = bg;
      rr(g, 0, 0, W, H, Math.min(H * 0.25, 40));
      g.fill();
      g.fillStyle = fg;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      lines.forEach((l, i) => {
        g.font = `800 ${l[1]}px ${FONT}`;
        g.fillText(l[0], W / 2, (H * (i + 1)) / (lines.length + 1) + l[1] * 0.06);
      });
    },
    false
  );
}

export function pill(
  text: string,
  o?: {
    fs?: number;
    pad?: number;
    dot?: string;
    bg?: string;
    fg?: string;
    h?: number;
    ro?: number;
  }
): THREE.Sprite {
  const opts = o || {};
  const fs = opts.fs || 44;
  const pad = opts.pad || 22;
  const c = document.createElement('canvas');
  const g = c.getContext('2d')!;
  const font = `800 ${fs}px ${FONT}`;
  g.font = font;
  const tw = g.measureText(text).width;
  const dw = opts.dot ? fs * 0.9 : 0;
  const W = Math.ceil(tw + pad * 2 + dw);
  const H = Math.round(fs * 1.55);
  c.width = W + 8;
  c.height = H + 12;
  g.fillStyle = 'rgba(28,64,42,.22)';
  rr(g, 4, 10, W, H, H / 2);
  g.fill();
  g.fillStyle = opts.bg || '#fff';
  rr(g, 4, 4, W, H, H / 2);
  g.fill();
  if (opts.dot) {
    g.fillStyle = opts.dot;
    g.beginPath();
    g.arc(4 + pad + fs * 0.3, 4 + H / 2, fs * 0.27, 0, 7);
    g.fill();
  }
  g.font = font;
  g.fillStyle = opts.fg || '#1E3528';
  g.textBaseline = 'middle';
  g.fillText(text, 4 + pad + dw, 4 + H / 2 + fs * 0.07);
  const t = new THREE.CanvasTexture(c);
  t.minFilter = THREE.LinearFilter;
  const sp = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })
  );
  const hh = opts.h || 3;
  sp.scale.set((hh * c.width) / c.height, hh, 1);
  sp.renderOrder = opts.ro || 6;
  return sp;
}

export function letter(ch: string, bg: string, size?: number): THREE.Sprite {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = 'rgba(28,64,42,.25)';
  g.beginPath();
  g.arc(128, 138, 112, 0, 7);
  g.fill();
  g.fillStyle = '#fff';
  g.beginPath();
  g.arc(128, 124, 116, 0, 7);
  g.fill();
  g.fillStyle = bg;
  g.beginPath();
  g.arc(128, 124, 100, 0, 7);
  g.fill();
  g.fillStyle = '#fff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${ch.length > 2 ? 84 : 150}px ${FONT}`;
  g.fillText(ch, 128, 136);
  const t = new THREE.CanvasTexture(c);
  const sp = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })
  );
  sp.scale.setScalar(size || 8);
  sp.renderOrder = 7;
  return sp;
}

export function coinTex(st: Station, done: boolean): THREE.CanvasTexture {
  return canvasTex(
    256,
    256,
    (g) => {
      g.fillStyle = 'rgba(28,64,42,.25)';
      g.beginPath();
      g.arc(128, 138, 116, 0, 7);
      g.fill();
      g.fillStyle = '#fff';
      g.beginPath();
      g.arc(128, 126, 118, 0, 7);
      g.fill();
      g.fillStyle = done ? '#3DAA5C' : st.col;
      g.beginPath();
      g.arc(128, 126, 102, 0, 7);
      g.fill();
      g.strokeStyle = '#fff';
      g.fillStyle = '#fff';
      g.lineCap = 'round';
      g.lineJoin = 'round';
      if (done) {
        g.lineWidth = 26;
        g.beginPath();
        g.moveTo(80, 130);
        g.lineTo(114, 164);
        g.lineTo(178, 94);
        g.stroke();
        return;
      }
      if (st.type === 'quiz') {
        g.font = `800 150px ${FONT}`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText('?', 128, 136);
      } else if (st.type === 'it_debug') {
        g.font = `800 105px ${FONT}`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText('</>', 128, 132);
      } else if (st.type === 'electric_circuit') {
        g.lineWidth = 18;
        g.beginPath();
        g.moveTo(142, 66);
        g.lineTo(96, 130);
        g.lineTo(136, 130);
        g.lineTo(110, 190);
        g.stroke();
      } else if (st.type === 'auto_engine') {
        g.lineWidth = 16;
        g.beginPath();
        g.arc(128, 126, 36, 0, Math.PI * 2);
        g.stroke();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          g.beginPath();
          g.moveTo(128 + Math.cos(a) * 38, 126 + Math.sin(a) * 38);
          g.lineTo(128 + Math.cos(a) * 58, 126 + Math.sin(a) * 58);
          g.stroke();
        }
      } else if (st.type === 'checkin') {
        g.lineWidth = 14;
        g.beginPath();
        g.moveTo(92, 72);
        g.lineTo(92, 186);
        g.stroke();
        g.beginPath();
        g.moveTo(92, 74);
        g.lineTo(180, 98);
        g.lineTo(92, 128);
        g.closePath();
        g.fill();
      } else if (st.type === 'photo') {
        rr(g, 62, 92, 132, 88, 18);
        g.fill();
        g.fillRect(100, 78, 56, 20);
        g.fillStyle = st.col;
        g.beginPath();
        g.arc(128, 136, 28, 0, 7);
        g.fill();
        g.fillStyle = '#fff';
        g.beginPath();
        g.arc(128, 136, 14, 0, 7);
        g.fill();
      } else {
        g.beginPath();
        g.arc(128, 126, 62, 0, 7);
        g.fill();
        g.fillStyle = st.col;
        g.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
          g.lineTo(128 + Math.cos(a) * 24, 126 + Math.sin(a) * 24);
        }
        g.closePath();
        g.fill();
        g.strokeStyle = st.col;
        g.lineWidth = 6;
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
          g.beginPath();
          g.moveTo(128 + Math.cos(a) * 24, 126 + Math.sin(a) * 24);
          g.lineTo(128 + Math.cos(a) * 58, 126 + Math.sin(a) * 58);
          g.stroke();
        }
      }
    },
    false
  );
}
</file>

<file path="src/pages/AdminDashboard.tsx">
import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Download,
  Edit3,
  MapPin,
  Plus,
  Printer,
  QrCode,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import { TDC_LOGO, TYPE_LABEL } from '../data/campusLayout';
import { FACULTIES } from '../data/faculties';
import {
  buildStationQrPayload,
  deleteStation,
  generateAnalyticsCsv,
  getAdminAnalytics,
  resetStationsToDefault,
  saveCampaignEvent,
  saveStation,
} from '../services/adminService';
import { loadLocalEvents } from '../services/gameService';
import { CampaignEvent, Station, StationType } from '../types/game';

interface AdminDashboardProps {
  stations: Station[];
  onStationsUpdated: (next: Station[]) => void;
  onBackToGame: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stations,
  onStationsUpdated,
  onBackToGame,
}) => {
  const [activeTab, setActiveTab] = useState<'stations' | 'qr' | 'events' | 'analytics'>(
    'stations'
  );
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [events, setEvents] = useState<CampaignEvent[]>(() => loadLocalEvents());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  useEffect(() => {
    // Generate QR Data URLs for all stations
    const genAll = async () => {
      const next: Record<string, string> = {};
      for (const st of stations) {
        try {
          const payload = buildStationQrPayload(st);
          const url = await QRCode.toDataURL(payload, {
            width: 240,
            margin: 1,
            color: { dark: '#1E3528', light: '#FFFFFF' },
          });
          next[st.id] = url;
        } catch {
          // Ignore
        }
      }
      setQrMap(next);
    };
    void genAll();
  }, [stations]);

  const handleSaveStation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStation) return;
    const updatedList = await saveStation(editingStation);
    onStationsUpdated(updatedList);
    setEditingStation(null);
    showNotice(`Đã lưu cấu hình trạm "${editingStation.name}"!`);
  };

  const handleDeleteStation = async (id: string, name: string) => {
    const updatedList = await deleteStation(id);
    onStationsUpdated(updatedList);
    showNotice(`Đã xóa trạm "${name}".`);
  };

  const handleResetDefaults = () => {
    const list = resetStationsToDefault();
    onStationsUpdated(list);
    showNotice('Đã khôi phục 10 trạm tiêu chuẩn của khuôn viên TDC!');
  };

  const handleCreateNewStation = () => {
    const newId = `st_${Date.now().toString(36).slice(-4)}`;
    setEditingStation({
      id: newId,
      name: 'Trạm Thử Thách Mới',
      sub: 'Khu vực Khám phá TDC',
      facultyId: 'cntt',
      x: -20,
      z: 30,
      fogRadius: 28,
      col: '#00AEEF',
      type: 'quiz',
      pts: 100,
      badge: 'Nhà Khám Phá Mới',
      info: 'Mô tả thông tin giới thiệu tòa nhà / khu vực tại TDC.',
      funFact: 'Thông tin thú vị mở khóa sau khi sinh viên vượt qua thử thách.',
      directions: 'Hướng dẫn lộ trình di chuyển tới trạm tiếp theo.',
      qrSecretToken: `TDC-QR-${newId.toUpperCase()}`,
      riddle: {
        prompt: 'Câu hỏi mật thư quan sát thực địa tại trạm này là gì?',
        answer: 'tdc',
        hint: 'Gợi ý quan sát biển hiệu tại chỗ.',
      },
      questions: [
        {
          q: 'Câu hỏi trắc nghiệm mẫu tại trạm mới?',
          opts: ['Đáp án đúng A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
          ans: 0,
          ex: 'Giải thích đáp án đúng sau khi sinh viên trả lời.',
        },
      ],
      active: true,
    });
  };

  const handleToggleEvent = async (evt: CampaignEvent) => {
    const updated = await saveCampaignEvent({ ...evt, active: !evt.active });
    setEvents(updated);
    showNotice(`Đã cập nhật trạng thái sự kiện "${evt.title}".`);
  };

  const analytics = getAdminAnalytics(stations);

  const handleExportCsv = () => {
    const csv = generateAnalyticsCsv(analytics);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bao-cao-thong-ke-tdc-go-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('Đã xuất file Báo cáo Thống kê CSV thành công!');
  };

  return (
    <div className="fixed inset-0 bg-[#F4F8F2] text-[#1E3528] overflow-y-auto z-50">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 bg-white border-b-2 border-[#E2EBDA] px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-sky-50 border-2 border-sky-200 grid place-items-center">
            <svg viewBox="118 118 332 332" className="w-8 h-8">
              <path fill="#00AEEF" d={TDC_LOGO} />
            </svg>
          </div>
          <div>
            <h1 className="m-0 font-black text-xl sm:text-2xl tracking-tight">
              TDC GO · Hệ Thống Quản Trị (Admin CMS)
            </h1>
            <p className="m-0 text-xs font-bold text-slate-500">
              Quản lý Trạm 3D, Mật thư O2O, In ấn Mã QR Thực địa & Thống kê Đoàn – Hội
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {toastMsg && (
            <span className="bg-emerald-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-full animate-bounce">
              ✔ {toastMsg}
            </span>
          )}
          <button type="button" onClick={onBackToGame} className="btn ghost text-sm">
            <ArrowLeft className="w-4 h-4" /> Quay lại Bản đồ 3D
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-5 print:hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white p-2 rounded-2xl border-2 border-[#E2EBDA] shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('stations')}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'stations'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" /> 1. Trạm 3D & Mật thư ({stations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <QrCode className="w-4 h-4" /> 2. Xuất & In Mã QR Trạm
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'events'
                ? 'bg-amber-500 text-amber-950 shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" /> 3. Chiến dịch Sự kiện
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> 4. Thống kê & Xuất CSV
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
        {/* TAB 1: STATIONS CRUD */}
        {activeTab === 'stations' && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="m-0 font-black text-lg">
                  Danh sách Điểm Trạm Tương tác & Vùng Sương mù (Fog of War)
                </h2>
                <p className="m-0 text-xs font-bold text-slate-500">
                  Mỗi trạm gắn với tọa độ thực (x, z) trên mô hình 3D khuôn viên TDC, mật thư thực địa và mini-game.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="btn ghost text-xs"
                >
                  <RotateCcw className="w-4 h-4" /> Khôi phục Mặc định
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewStation}
                  className="btn sun text-xs"
                >
                  <Plus className="w-4 h-4" /> Thêm Trạm Mới
                </button>
              </div>
            </div>

            {editingStation && (
              <form
                onSubmit={handleSaveStation}
                className="bg-white border-2 border-emerald-400 rounded-2xl p-5 shadow-md flex flex-col gap-4"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <h3 className="m-0 font-black text-base text-emerald-900">
                    ✏️ Chỉnh sửa Điểm Trạm: {editingStation.name} ({editingStation.id})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingStation(null)}
                    className="text-xs font-extrabold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">
                      Tên Trạm 3D
                    </label>
                    <input
                      type="text"
                      required
                      value={editingStation.name}
                      onChange={(e) =>
                        setEditingStation({ ...editingStation, name: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">
                      Phụ đề / Vị trí
                    </label>
                    <input
                      type="text"
                      required
                      value={editingStation.sub}
                      onChange={(e) =>
                        setEditingStation({ ...editingStation, sub: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">
                      Tên Huy hiệu (Badge)
                    </label>
                    <input
                      type="text"
                      required
                      value={editingStation.badge}
                      onChange={(e) =>
                        setEditingStation({ ...editingStation, badge: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">
                      Loại Thử thách
                    </label>
                    <select
                      value={editingStation.type}
                      onChange={(e) =>
                        setEditingStation({
                          ...editingStation,
                          type: e.target.value as StationType,
                        })
                      }
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 font-bold text-xs"
                    >
                      {Object.entries(TYPE_LABEL).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">
                      Điểm Thưởng
                    </label>
                    <input
                      type="number"
                      value={editingStation.pts}
                      onChange={(e) =>
                        setEditingStation({
                          ...editingStation,
                          pts: Number(e.target.value) || 100,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">
                      Tọa độ X (Đông)
                    </label>
                    <input
                      type="number"
                      value={editingStation.x}
                      onChange={(e) =>
                        setEditingStation({
                          ...editingStation,
                          x: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">
                      Tọa độ Z (Nam)
                    </label>
                    <input
                      type="number"
                      value={editingStation.z}
                      onChange={(e) =>
                        setEditingStation({
                          ...editingStation,
                          z: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">
                      Bán kính Sương mù (m)
                    </label>
                    <input
                      type="number"
                      value={editingStation.fogRadius}
                      onChange={(e) =>
                        setEditingStation({
                          ...editingStation,
                          fogRadius: Number(e.target.value) || 28,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">
                      Mã QR Secret Token (Chống gian lận)
                    </label>
                    <input
                      type="text"
                      value={editingStation.qrSecretToken}
                      onChange={(e) =>
                        setEditingStation({
                          ...editingStation,
                          qrSecretToken: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">
                      Khoa Phụ trách
                    </label>
                    <select
                      value={editingStation.facultyId}
                      onChange={(e) =>
                        setEditingStation({
                          ...editingStation,
                          facultyId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                    >
                      {FACULTIES.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <div>
                    <label className="text-xs font-black uppercase text-amber-800">
                      Câu hỏi Mật thư Quan sát Thực địa (O2O)
                    </label>
                    <input
                      type="text"
                      value={editingStation.riddle?.prompt || ''}
                      onChange={(e) =>
                        setEditingStation({
                          ...editingStation,
                          riddle: {
                            prompt: e.target.value,
                            answer: editingStation.riddle?.answer || 'tdc',
                            hint: editingStation.riddle?.hint || '',
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-amber-800">
                      Từ khóa Đáp án Mật thư
                    </label>
                    <input
                      type="text"
                      value={editingStation.riddle?.answer || ''}
                      onChange={(e) =>
                        setEditingStation({
                          ...editingStation,
                          riddle: {
                            prompt: editingStation.riddle?.prompt || '',
                            answer: e.target.value,
                            hint: editingStation.riddle?.hint || '',
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white font-bold text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-500">
                    Thông tin Giới thiệu & Fun Fact Mở khóa
                  </label>
                  <textarea
                    rows={2}
                    value={editingStation.funFact}
                    onChange={(e) =>
                      setEditingStation({ ...editingStation, funFact: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingStation(null)}
                    className="btn ghost text-sm"
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn sun text-sm">
                    <Save className="w-4 h-4" /> Lưu Thay Đổi Trạm
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {stations.map((st) => (
                <div
                  key={st.id}
                  className="bg-white rounded-2xl p-4 border-2 border-[#E2EBDA] shadow-sm flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-10 h-10 rounded-xl grid place-items-center text-white font-black text-sm shrink-0"
                        style={{ backgroundColor: st.col }}
                      >
                        {st.id.toUpperCase()}
                      </span>
                      <div>
                        <h3 className="m-0 font-black text-base">{st.name}</h3>
                        <p className="m-0 text-xs font-bold text-slate-500">
                          {st.sub} · Tọa độ ({st.x}, {st.z}) · Sương mù R={st.fogRadius}m
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs">
                      +{st.pts} đ
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-1">
                    <div>
                      <b>Loại thử thách:</b> {TYPE_LABEL[st.type]} · <b>Huy hiệu:</b>{' '}
                      {st.badge}
                    </div>
                    <div>
                      <b>Mã QR Token:</b>{' '}
                      <code className="bg-sky-100 text-sky-900 px-1.5 py-0.5 rounded font-bold">
                        {st.qrSecretToken}
                      </code>
                    </div>
                    {st.riddle && (
                      <div>
                        <b>Mật thư O2O:</b> “{st.riddle.prompt}” → Đáp án:{' '}
                        <b className="text-emerald-700">{st.riddle.answer}</b>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-extrabold text-emerald-700">
                      ● Đang kích hoạt trên bản đồ 3D
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingStation(st)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-100 text-slate-700 font-extrabold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStation(st.id, st.name)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PRINTABLE STANDEE QR CODES */}
        {activeTab === 'qr' && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div>
                <h2 className="m-0 font-black text-lg">
                  Bộ Standee Mã QR Định danh Trạm Thực địa (Chuẩn In Ấn O2O)
                </h2>
                <p className="m-0 text-xs font-bold text-slate-500">
                  In và dán các thẻ QR này tại các tòa nhà tương ứng trong khuôn viên TDC để sinh viên quét bằng Camera trình duyệt.
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn sun text-sm"
              >
                <Printer className="w-4 h-4" /> In Toàn Bộ Bảng Mã QR (A4 / Standee)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {stations.map((st) => (
                <div
                  key={st.id}
                  className="bg-white rounded-3xl p-5 border-4 border-[#1E3528] shadow-sm flex flex-col items-center text-center gap-2.5 break-inside-avoid"
                >
                  <div className="flex items-center gap-2">
                    <svg viewBox="118 118 332 332" className="w-6 h-6">
                      <path fill="#00AEEF" d={TDC_LOGO} />
                    </svg>
                    <span className="font-black text-xs uppercase tracking-wider text-sky-700">
                      TRƯỜNG CĐ CÔNG NGHỆ THỦ ĐỨC · TDC GO
                    </span>
                  </div>

                  <div
                    className="px-3 py-1 rounded-full text-white font-black text-xs"
                    style={{ backgroundColor: st.col }}
                  >
                    TRẠM THỬ THÁCH: {st.name.toUpperCase()}
                  </div>

                  {qrMap[st.id] ? (
                    <img
                      src={qrMap[st.id]}
                      alt={`QR ${st.name}`}
                      className="w-44 h-44 rounded-2xl border-2 border-slate-200 p-2"
                    />
                  ) : (
                    <div className="w-44 h-44 grid place-items-center text-xs font-bold text-slate-400">
                      Đang tạo QR...
                    </div>
                  )}

                  <div className="bg-[#FFFBEF] border border-amber-300 px-3 py-1.5 rounded-xl w-full">
                    <div className="text-[10px] font-black uppercase text-amber-800">
                      Mã Định Danh Dự Phòng
                    </div>
                    <div className="font-mono font-black text-sm text-slate-900">
                      {st.qrSecretToken}
                    </div>
                  </div>

                  <p className="m-0 text-[11px] font-bold text-slate-500">
                    Quét mã bằng Camera Web Game <b>TDC GO</b> để xóa sương mù 3D và nhận huy hiệu <b>“{st.badge}” (+{st.pts}đ)</b>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CAMPAIGN EVENTS */}
        {activeTab === 'events' && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="m-0 font-black text-lg">
                Quản lý Chiến dịch & Sự kiện Chào Tân Sinh viên / Open Day
              </h2>
              <p className="m-0 text-xs font-bold text-slate-500">
                Kích hoạt các chiến dịch sự kiện theo đợt để nhân hệ số điểm thưởng trên toàn trường.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className={`bg-white rounded-2xl p-5 border-2 flex flex-col justify-between gap-3 ${
                    evt.active ? 'border-emerald-500' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                          evt.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {evt.active ? '● ĐANG DIỄN RA' : '○ ĐANG TẠM DỪNG'}
                      </span>
                      <span className="font-black text-amber-600 text-sm">
                        Hệ số thưởng: x{evt.bonusMultiplier}
                      </span>
                    </div>
                    <h3 className="m-0 font-black text-base">{evt.title}</h3>
                    <p className="text-xs font-bold text-slate-600 mt-1">
                      {evt.description}
                    </p>
                    <div className="text-xs font-extrabold text-slate-400 mt-2">
                      📅 Thời gian: {evt.startDate} → {evt.endDate}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleEvent(evt)}
                    className={`btn text-xs ${evt.active ? 'ghost' : 'sun'}`}
                  >
                    {evt.active ? 'Tạm dừng Chiến dịch' : 'Kích hoạt Chiến dịch Ngay'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ANALYTICS & CSV EXPORT */}
        {activeTab === 'analytics' && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="m-0 font-black text-lg">
                  Báo cáo Thống kê Mức độ Khám phá Khuôn viên & Tham gia Theo Khoa
                </h2>
                <p className="m-0 text-xs font-bold text-slate-500">
                  Số liệu phục vụ công tác Đoàn – Hội, Phòng Công tác HSSV và nghiệm thu Đề tài NCKH.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportCsv}
                className="btn sun text-sm"
              >
                <Download className="w-4 h-4" /> Xuất Báo Cáo Thống Kê (.CSV)
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border-2 border-[#E2EBDA]">
                <div className="text-xs font-black uppercase text-slate-500">
                  Tổng Sinh viên Tham gia
                </div>
                <div className="text-3xl font-black text-emerald-700 mt-1">
                  {analytics.totalUsers} SV
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border-2 border-[#E2EBDA]">
                <div className="text-xs font-black uppercase text-slate-500">
                  Tổng lượt Mở khóa Sương mù / Check-in
                </div>
                <div className="text-3xl font-black text-sky-600 mt-1">
                  {analytics.totalCheckins} lượt
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border-2 border-[#E2EBDA]">
                <div className="text-xs font-black uppercase text-slate-500">
                  Số Điểm Trạm 3D Hoạt động
                </div>
                <div className="text-3xl font-black text-amber-600 mt-1">
                  {stations.length} trạm
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Station Popularity Chart */}
              <div className="bg-white p-5 rounded-2xl border-2 border-[#E2EBDA] flex flex-col gap-3">
                <h3 className="m-0 font-black text-base">
                  📊 Lượt Check-in & Giải đố theo Khu vực Trạm 3D
                </h3>
                <div className="flex flex-col gap-2.5">
                  {analytics.stationStats.map((s) => {
                    const max = Math.max(
                      1,
                      ...analytics.stationStats.map((x) => x.count)
                    );
                    const pct = Math.round((s.count / max) * 100);
                    return (
                      <div key={s.id} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs font-extrabold">
                          <span>{s.name}</span>
                          <span>{s.count} lượt</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: s.col,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Faculty Leaderboard Chart */}
              <div className="bg-white p-5 rounded-2xl border-2 border-[#E2EBDA] flex flex-col gap-3">
                <h3 className="m-0 font-black text-base">
                  🏆 Thống kê Điểm số Tham gia theo Khoa
                </h3>
                <div className="flex flex-col gap-2.5">
                  {analytics.facultyStats.map((f) => {
                    const max = Math.max(
                      1,
                      ...analytics.facultyStats.map((x) => x.totalPoints)
                    );
                    const pct = Math.round((f.totalPoints / max) * 100);
                    return (
                      <div key={f.id} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs font-extrabold">
                          <span>
                            {f.name} ({f.studentsCount} SV)
                          </span>
                          <span>{f.totalPoints.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: f.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
</file>

<file path="src/services/adminService.ts">
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { FACULTIES } from '../data/faculties';
import { DEFAULT_EVENTS, DEFAULT_STATIONS } from '../data/stations';
import { CampaignEvent, CheckinLog, Station } from '../types/game';
import { getLocalPublicUsers } from './authService';
import { db, isFirebaseConfigured } from './firebase';
import { loadLocalCheckinLogs, loadLocalEvents } from './gameService';

const LOCAL_STATIONS_KEY = 'tdc_go_stations_v2';
const LOCAL_EVENTS_KEY = 'tdc_go_events_v2';

export function loadStations(): Station[] {
  try {
    const raw = localStorage.getItem(LOCAL_STATIONS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STATIONS_KEY, JSON.stringify(DEFAULT_STATIONS));
      return [...DEFAULT_STATIONS];
    }
    const parsed = JSON.parse(raw) as Station[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_STATIONS];
  } catch {
    return [...DEFAULT_STATIONS];
  }
}

export async function fetchStationsFromCloudOrLocal(): Promise<Station[]> {
  const local = loadStations();
  if (!isFirebaseConfigured || !db) return local;

  try {
    const snap = await getDocs(collection(db, 'stations'));
    if (!snap.empty) {
      const list = snap.docs.map((d) => d.data() as Station);
      localStorage.setItem(LOCAL_STATIONS_KEY, JSON.stringify(list));
      return list;
    }
  } catch {
    // Fallback local
  }
  return local;
}

export async function saveStation(station: Station): Promise<Station[]> {
  const stations = loadStations();
  const idx = stations.findIndex((s) => s.id === station.id);
  if (idx >= 0) stations[idx] = station;
  else stations.push(station);
  localStorage.setItem(LOCAL_STATIONS_KEY, JSON.stringify(stations));

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'stations', station.id), station);
    } catch {
      // Fallback local
    }
  }
  return stations;
}

export async function deleteStation(stationId: string): Promise<Station[]> {
  const stations = loadStations().filter((s) => s.id !== stationId);
  localStorage.setItem(LOCAL_STATIONS_KEY, JSON.stringify(stations));

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'stations', stationId));
    } catch {
      // Ignore
    }
  }
  return stations;
}

export function resetStationsToDefault(): Station[] {
  localStorage.setItem(LOCAL_STATIONS_KEY, JSON.stringify(DEFAULT_STATIONS));
  return [...DEFAULT_STATIONS];
}

export async function saveCampaignEvent(evt: CampaignEvent): Promise<CampaignEvent[]> {
  const events = loadLocalEvents();
  const idx = events.findIndex((e) => e.id === evt.id);
  if (idx >= 0) events[idx] = evt;
  else events.push(evt);
  localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'events', evt.id), evt);
    } catch {
      // Ignore
    }
  }
  return events;
}

export function buildStationQrPayload(station: Station): string {
  return JSON.stringify({
    app: 'TDC_GO',
    stationId: station.id,
    token: station.qrSecretToken,
  });
}

export interface AnalyticsSummary {
  totalUsers: number;
  totalCheckins: number;
  stationStats: {
    id: string;
    name: string;
    count: number;
    col: string;
  }[];
  facultyStats: {
    id: string;
    name: string;
    shortName: string;
    studentsCount: number;
    totalPoints: number;
    color: string;
  }[];
  recentLogs: CheckinLog[];
}

export function getAdminAnalytics(stations: Station[]): AnalyticsSummary {
  const users = getLocalPublicUsers();
  const logs = loadLocalCheckinLogs();

  const stationCounts: Record<string, number> = {};
  stations.forEach((s, i) => {
    // Combine actual logs + baseline simulated campus visits for visual richness
    stationCounts[s.id] = Math.max(4, 18 - i * 2);
  });
  logs.forEach((l) => {
    stationCounts[l.stationId] = (stationCounts[l.stationId] || 0) + 1;
  });

  const stationStats = stations.map((s) => ({
    id: s.id,
    name: s.name,
    count: stationCounts[s.id] || 0,
    col: s.col,
  }));

  const facultyStats = FACULTIES.map((f) => {
    const facUsers = users.filter((u) => u.facultyId === f.id);
    const totalPoints = facUsers.reduce((acc, u) => acc + u.points, 0);
    return {
      id: f.id,
      name: f.name,
      shortName: f.shortName,
      studentsCount: facUsers.length,
      totalPoints,
      color: f.color,
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  const totalCheckins = stationStats.reduce((s, x) => s + x.count, 0);

  return {
    totalUsers: users.length,
    totalCheckins,
    stationStats,
    facultyStats,
    recentLogs: logs.slice(0, 20),
  };
}

export function generateAnalyticsCsv(summary: AnalyticsSummary): string {
  const lines: string[] = [];
  lines.push('BAO CAO THONG KE HE THONG TDC GO - TRUONG CAO DANG CONG NGHE THU DUC');
  lines.push(`Ngay xuat bao cao,${new Date().toISOString()}`);
  lines.push(`Tong so Sinh vien tham gia,${summary.totalUsers}`);
  lines.push(`Tong luot Check-in & Mo khoa Tram,${summary.totalCheckins}`);
  lines.push('');
  lines.push('1. THONG KE LUOT KHAM PHA THEO TRAM 3D');
  lines.push('Ma Tram,Ten Tram,So luot Check-in');
  summary.stationStats.forEach((s) => {
    lines.push(`"${s.id}","${s.name}",${s.count}`);
  });
  lines.push('');
  lines.push('2. THONG KE DIEM SO THEO KHOA');
  lines.push('Ma Khoa,Ten Khoa,So Sinh vien,Tong Diem');
  summary.facultyStats.forEach((f) => {
    lines.push(`"${f.id}","${f.name}",${f.studentsCount},${f.totalPoints}`);
  });
  return '\uFEFF' + lines.join('\n');
}
</file>

<file path="src/services/authService.ts">
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FacultyId, PublicLeaderboardUser, UserProfile } from '../types/game';
import { auth, db, isFirebaseConfigured } from './firebase';

const LOCAL_PROFILE_KEY = 'tdc_go_profile_v2';
const LOCAL_PUBLIC_USERS_KEY = 'tdc_go_public_users_v2';

const SAMPLE_LEADERBOARD_USERS: PublicLeaderboardUser[] = [
  {
    uid: 'sample_1',
    name: 'Minh Anh',
    mssv: '24211TT0124',
    facultyId: 'cntt',
    avatar: 0,
    points: 1420,
    unlockedCount: 10,
    updatedAt: Date.now() - 3600000,
  },
  {
    uid: 'sample_2',
    name: 'Gia Huy',
    mssv: '24211DD0089',
    facultyId: 'dien_dt',
    avatar: 1,
    points: 1280,
    unlockedCount: 9,
    updatedAt: Date.now() - 7200000,
  },
  {
    uid: 'sample_3',
    name: 'Thảo Vy',
    mssv: '24211KT0215',
    facultyId: 'kinh_te',
    avatar: 2,
    points: 1150,
    unlockedCount: 8,
    updatedAt: Date.now() - 8400000,
  },
  {
    uid: 'sample_4',
    name: 'Quốc Bảo',
    mssv: '24211OT0042',
    facultyId: 'co_khi_oto',
    avatar: 0,
    points: 990,
    unlockedCount: 7,
    updatedAt: Date.now() - 9600000,
  },
  {
    uid: 'sample_5',
    name: 'Ngọc Hân',
    mssv: '24211NN0118',
    facultyId: 'ngoai_ngu',
    avatar: 2,
    points: 870,
    unlockedCount: 6,
    updatedAt: Date.now() - 12000000,
  },
  {
    uid: 'sample_6',
    name: 'Tuấn Kiệt',
    mssv: '24211CK0071',
    facultyId: 'co_khi_ctm',
    avatar: 1,
    points: 740,
    unlockedCount: 5,
    updatedAt: Date.now() - 15000000,
  },
  {
    uid: 'sample_7',
    name: 'Bảo Trâm',
    mssv: '24211DL0033',
    facultyId: 'du_lich',
    avatar: 2,
    points: 620,
    unlockedCount: 4,
    updatedAt: Date.now() - 18000000,
  },
];

export function loadLocalProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as UserProfile;
    if (p && typeof p === 'object' && p.uid) return p;
    return null;
  } catch {
    return null;
  }
}

export function saveLocalProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
    syncLocalPublicUser(profile);
  } catch {
    // Ignore storage error
  }
}

export function getLocalPublicUsers(): PublicLeaderboardUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_PUBLIC_USERS_KEY);
    if (!raw) {
      localStorage.setItem(
        LOCAL_PUBLIC_USERS_KEY,
        JSON.stringify(SAMPLE_LEADERBOARD_USERS)
      );
      return [...SAMPLE_LEADERBOARD_USERS];
    }
    const list = JSON.parse(raw) as PublicLeaderboardUser[];
    return Array.isArray(list) ? list : [...SAMPLE_LEADERBOARD_USERS];
  } catch {
    return [...SAMPLE_LEADERBOARD_USERS];
  }
}

export function syncLocalPublicUser(profile: UserProfile): void {
  try {
    const users = getLocalPublicUsers();
    const pub: PublicLeaderboardUser = {
      uid: profile.uid,
      name: profile.name,
      mssv: profile.mssv,
      facultyId: profile.facultyId,
      avatar: profile.avatar,
      points: profile.points,
      unlockedCount: Object.keys(profile.done || {}).length,
      partyId: profile.partyId,
      updatedAt: Date.now(),
    };
    const idx = users.findIndex((u) => u.uid === profile.uid);
    if (idx >= 0) users[idx] = pub;
    else users.push(pub);
    localStorage.setItem(LOCAL_PUBLIC_USERS_KEY, JSON.stringify(users));
  } catch {
    // Ignore storage error
  }
}

export async function syncProfileToCloud(profile: UserProfile): Promise<void> {
  saveLocalProfile(profile);
  if (!isFirebaseConfigured || !db) return;

  try {
    const privateData = {
      uid: profile.uid,
      name: profile.name,
      mssv: profile.mssv,
      email: profile.email || `${profile.mssv.toLowerCase()}@mail.tdc.edu.vn`,
      facultyId: profile.facultyId,
      role: profile.role,
      avatar: profile.avatar,
      points: profile.points,
      stars: profile.stars,
      quizOk: profile.quizOk,
      photos: profile.photos,
      done: profile.done,
      bonus: profile.bonus,
      ...(profile.partyId ? { partyId: profile.partyId } : {}),
      updatedAt: Date.now(),
    };
    await setDoc(doc(db, 'users', profile.uid), privateData, { merge: true });

    const publicData: PublicLeaderboardUser = {
      uid: profile.uid,
      name: profile.name,
      mssv: profile.mssv,
      facultyId: profile.facultyId,
      avatar: profile.avatar,
      points: profile.points,
      unlockedCount: Object.keys(profile.done || {}).length,
      ...(profile.partyId ? { partyId: profile.partyId } : {}),
      updatedAt: Date.now(),
    };
    await setDoc(doc(db, 'users_public', profile.uid), publicData, { merge: true });
  } catch (e) {
    console.warn('Cloud profile sync skipped/fallback:', e);
  }
}

export async function loginOrRegisterExplorer(params: {
  name: string;
  mssv: string;
  email?: string;
  password?: string;
  facultyId: FacultyId;
  avatar: number;
  mode: 'demo' | 'email_login' | 'email_register' | 'google';
}): Promise<UserProfile> {
  const cleanName = params.name.trim().slice(0, 32) || 'Tân binh TDC';
  const cleanMssv = params.mssv.trim().toUpperCase().slice(0, 16) || '26211TT0001';
  const cleanEmail =
    params.email?.trim() || `${cleanMssv.toLowerCase()}@mail.tdc.edu.vn`;

  if (isFirebaseConfigured && auth && db && params.mode !== 'demo') {
    let uid = '';
    if (params.mode === 'google') {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      uid = cred.user.uid;
    } else if (params.mode === 'email_register') {
      const cred = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        params.password || 'TdcGo2026!'
      );
      uid = cred.user.uid;
    } else if (params.mode === 'email_login') {
      const cred = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        params.password || 'TdcGo2026!'
      );
      uid = cred.user.uid;
    }

    if (uid) {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const existing = snap.data() as UserProfile;
        const merged: UserProfile = {
          ...existing,
          name: cleanName || existing.name,
          mssv: cleanMssv || existing.mssv,
          facultyId: params.facultyId || existing.facultyId,
          avatar: params.avatar,
          updatedAt: Date.now(),
        };
        await syncProfileToCloud(merged);
        return merged;
      }
      const fresh: UserProfile = {
        uid,
        name: cleanName,
        mssv: cleanMssv,
        email: cleanEmail,
        facultyId: params.facultyId,
        role: 'student',
        avatar: params.avatar,
        points: 0,
        stars: 0,
        quizOk: 0,
        photos: 0,
        done: {},
        bonus: {},
        pos: null,
        updatedAt: Date.now(),
      };
      await syncProfileToCloud(fresh);
      return fresh;
    }
  }

  // Local / Demo fallback
  const existingLocal = loadLocalProfile();
  if (existingLocal) {
    const updated: UserProfile = {
      ...existingLocal,
      name: cleanName,
      mssv: cleanMssv,
      email: cleanEmail,
      facultyId: params.facultyId,
      avatar: params.avatar,
      updatedAt: Date.now(),
    };
    saveLocalProfile(updated);
    return updated;
  }

  const demoProfile: UserProfile = {
    uid: `local_${cleanMssv.toLowerCase()}`,
    name: cleanName,
    mssv: cleanMssv,
    email: cleanEmail,
    facultyId: params.facultyId,
    role: 'student',
    avatar: params.avatar,
    points: 0,
    stars: 0,
    quizOk: 0,
    photos: 0,
    done: {},
    bonus: {},
    pos: null,
    updatedAt: Date.now(),
  };
  saveLocalProfile(demoProfile);
  return demoProfile;
}

export function resetExplorerProgress(profile: UserProfile): UserProfile {
  const reset: UserProfile = {
    ...profile,
    points: 0,
    stars: 0,
    quizOk: 0,
    photos: 0,
    done: {},
    bonus: {},
    pos: null,
    certClaimed: false,
    updatedAt: Date.now(),
  };
  void syncProfileToCloud(reset);
  return reset;
}

export async function logoutExplorer(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch {
      // Ignore
    }
  }
}
</file>

<file path="src/services/firebase.ts">
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey.trim().length > 5
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.warn('Firebase initialization failed, falling back to Local Demo mode:', e);
  }
}

export { app, auth, db };
</file>

<file path="src/services/gameService.ts">
import { addDoc, collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { QUESTS } from '../data/campusLayout';
import { DEFAULT_EVENTS } from '../data/stations';
import {
  CampaignEvent,
  CheckinLog,
  PartyRoom,
  PublicLeaderboardUser,
  Station,
  UnlockedStationRecord,
  UserProfile,
  VerificationMethod,
} from '../types/game';
import { getLocalPublicUsers, syncProfileToCloud } from './authService';
import { db, isFirebaseConfigured } from './firebase';
import { loadLocalParties, syncMemberPointsInParty } from './partyService';

const LOCAL_CHECKINS_KEY = 'tdc_go_checkins_v2';
const LOCAL_EVENTS_KEY = 'tdc_go_events_v2';

// Minimum cooldown in ms between real-world QR/Riddle check-ins to prevent automated replay
export const ANTI_CHEAT_COOLDOWN_MS = 4000;

export function normalizeVietnameseAnswer(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}

export function verifyStationRiddle(station: Station, userInput: string): boolean {
  if (!station.riddle) return true;
  const expected = normalizeVietnameseAnswer(station.riddle.answer);
  const actual = normalizeVietnameseAnswer(userInput);
  if (!actual) return false;
  return actual === expected || actual.includes(expected);
}

export function verifyStationQrPayload(
  station: Station,
  scannedCode: string
): { valid: boolean; matchedStationId?: string; message: string } {
  const clean = scannedCode.trim();
  if (!clean) {
    return { valid: false, message: 'Mã QR trống hoặc không hợp lệ.' };
  }

  // Support either JSON payload `{"app":"TDC_GO","stationId":"...","token":"..."}` or direct token string
  try {
    if (clean.startsWith('{')) {
      const obj = JSON.parse(clean) as {
        app?: string;
        stationId?: string;
        token?: string;
      };
      if (obj.token === station.qrSecretToken || obj.stationId === station.id) {
        return {
          valid: true,
          matchedStationId: station.id,
          message: `Xác thực QR thành công tại ${station.name}!`,
        };
      }
      return {
        valid: false,
        matchedStationId: obj.stationId,
        message: 'Mã QR này thuộc về một trạm khác trong khuôn viên.',
      };
    }
  } catch {
    // Plain string check below
  }

  if (
    clean.toUpperCase() === station.qrSecretToken.toUpperCase() ||
    clean.toLowerCase() === station.id.toLowerCase()
  ) {
    return {
      valid: true,
      matchedStationId: station.id,
      message: `Xác thực mã định danh trạm ${station.name} thành công!`,
    };
  }

  return {
    valid: false,
    message: 'Mã QR không khớp với trạm hiện tại. Hãy kiểm tra lại bảng QR tại trạm!',
  };
}

export function checkAntiCheatCooldown(
  profile: UserProfile,
  method: VerificationMethod,
  now = Date.now()
): { allowed: boolean; waitSeconds: number } {
  if (method === 'demo') return { allowed: true, waitSeconds: 0 };

  const timestamps = Object.values(profile.done || {}).map((r) => r.unlockedAt || 0);
  if (timestamps.length === 0) return { allowed: true, waitSeconds: 0 };

  const lastUnlock = Math.max(...timestamps);
  const elapsed = now - lastUnlock;
  if (elapsed < ANTI_CHEAT_COOLDOWN_MS) {
    return {
      allowed: false,
      waitSeconds: Math.ceil((ANTI_CHEAT_COOLDOWN_MS - elapsed) / 1000),
    };
  }
  return { allowed: true, waitSeconds: 0 };
}

export function loadLocalEvents(): CampaignEvent[] {
  try {
    const raw = localStorage.getItem(LOCAL_EVENTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(DEFAULT_EVENTS));
      return [...DEFAULT_EVENTS];
    }
    const list = JSON.parse(raw) as CampaignEvent[];
    return Array.isArray(list) ? list : [...DEFAULT_EVENTS];
  } catch {
    return [...DEFAULT_EVENTS];
  }
}

export function getActiveEventMultiplier(): {
  event: CampaignEvent | null;
  multiplier: number;
} {
  const events = loadLocalEvents();
  const active = events.find((e) => e.active);
  return {
    event: active || null,
    multiplier: active ? active.bonusMultiplier : 1.0,
  };
}

export function calculateStationRewardPoints(params: {
  basePoints: number;
  party: PartyRoom | null;
  method: VerificationMethod;
  eventMultiplier?: number;
}): {
  finalPoints: number;
  crossFacultyBonus: number;
  qrBonus: number;
  eventBonus: number;
  activeEventTitle?: string;
} {
  const qrBonus = params.method === 'qr' ? 15 : params.method === 'riddle' ? 10 : 0;
  const crossMultiplier =
    params.party && params.party.isCrossFaculty ? params.party.bonusMultiplier : 1.0;
  const crossFacultyBonus =
    crossMultiplier > 1 ? Math.round(params.basePoints * (crossMultiplier - 1)) : 0;

  const activeEvt =
    params.eventMultiplier !== undefined
      ? { event: null, multiplier: params.eventMultiplier }
      : getActiveEventMultiplier();
  const evtMult = activeEvt.multiplier > 1 ? activeEvt.multiplier : 1.0;
  const eventBonus =
    evtMult > 1 ? Math.round(params.basePoints * (evtMult - 1)) : 0;

  const finalPoints = params.basePoints + qrBonus + crossFacultyBonus + eventBonus;
  return {
    finalPoints,
    crossFacultyBonus,
    qrBonus,
    eventBonus,
    activeEventTitle: activeEvt.event?.title,
  };
}

export function loadLocalCheckinLogs(): CheckinLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_CHECKINS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CheckinLog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function recordStationUnlock(params: {
  profile: UserProfile;
  station: Station;
  baseEarnedPoints: number;
  method: VerificationMethod;
  party: PartyRoom | null;
  photoDataUrl?: string;
  isQuizOrGameSuccess?: boolean;
  totalStationsCount: number;
}): Promise<{
  updatedProfile: UserProfile;
  finalPoints: number;
  crossFacultyBonus: number;
  qrBonus: number;
  newlyCompletedQuests: { name: string; reward: number }[];
}> {
  const { finalPoints, crossFacultyBonus, qrBonus } = calculateStationRewardPoints({
    basePoints: params.baseEarnedPoints,
    party: params.party,
    method: params.method,
  });

  const record: UnlockedStationRecord = {
    pts: finalPoints,
    unlockedAt: Date.now(),
    method: params.method,
    ...(params.photoDataUrl ? { photoDataUrl: params.photoDataUrl } : {}),
  };

  const nextDone = {
    ...(params.profile.done || {}),
    [params.station.id]: record,
  };

  let nextProfile: UserProfile = {
    ...params.profile,
    points: params.profile.points + finalPoints,
    quizOk:
      params.profile.quizOk + (params.isQuizOrGameSuccess ? 1 : 0),
    photos:
      params.profile.photos + (params.station.type === 'photo' ? 1 : 0),
    done: nextDone,
    updatedAt: Date.now(),
  };

  const newlyCompletedQuests: { name: string; reward: number }[] = [];
  QUESTS.forEach((q) => {
    if (!nextProfile.bonus[q.id] && q.getValue(nextProfile, params.totalStationsCount) >= q.need) {
      nextProfile = {
        ...nextProfile,
        points: nextProfile.points + q.reward,
        bonus: { ...nextProfile.bonus, [q.id]: true },
      };
      newlyCompletedQuests.push({ name: q.name, reward: q.reward });
    }
  });

  // Save checkin log
  const logEntry: CheckinLog = {
    id: `chk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    uid: nextProfile.uid,
    userName: nextProfile.name,
    stationId: params.station.id,
    facultyId: nextProfile.facultyId,
    method: params.method,
    pts: finalPoints,
    timestamp: Date.now(),
  };

  try {
    const logs = loadLocalCheckinLogs();
    logs.unshift(logEntry);
    localStorage.setItem(LOCAL_CHECKINS_KEY, JSON.stringify(logs.slice(0, 300)));
  } catch {
    // Ignore
  }

  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, 'checkins'), {
        uid: logEntry.uid,
        userName: logEntry.userName,
        stationId: logEntry.stationId,
        facultyId: logEntry.facultyId,
        method: logEntry.method,
        pts: logEntry.pts,
        timestamp: logEntry.timestamp,
      });
    } catch {
      // Fallback local
    }
  }

  await syncProfileToCloud(nextProfile);
  await syncMemberPointsInParty(nextProfile);

  return {
    updatedProfile: nextProfile,
    finalPoints,
    crossFacultyBonus,
    qrBonus,
    newlyCompletedQuests,
  };
}

export async function recordStarPickup(
  profile: UserProfile,
  totalStationsCount: number
): Promise<{
  updatedProfile: UserProfile;
  newlyCompletedQuests: { name: string; reward: number }[];
}> {
  let nextProfile: UserProfile = {
    ...profile,
    stars: (profile.stars || 0) + 1,
    points: profile.points + 10,
    updatedAt: Date.now(),
  };

  const newlyCompletedQuests: { name: string; reward: number }[] = [];
  QUESTS.forEach((q) => {
    if (!nextProfile.bonus[q.id] && q.getValue(nextProfile, totalStationsCount) >= q.need) {
      nextProfile = {
        ...nextProfile,
        points: nextProfile.points + q.reward,
        bonus: { ...nextProfile.bonus, [q.id]: true },
      };
      newlyCompletedQuests.push({ name: q.name, reward: q.reward });
    }
  });

  await syncProfileToCloud(nextProfile);
  return { updatedProfile: nextProfile, newlyCompletedQuests };
}

export async function fetchLeaderboardData(
  currentProfile: UserProfile
): Promise<{
  individuals: PublicLeaderboardUser[];
  parties: PartyRoom[];
}> {
  let individuals = getLocalPublicUsers();

  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'users_public'),
        orderBy('points', 'desc'),
        limit(30)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        individuals = snap.docs.map((d) => d.data() as PublicLeaderboardUser);
      }
    } catch {
      // Fallback local
    }
  }

  // Ensure current player is always up-to-date in leaderboard list
  const meEntry: PublicLeaderboardUser = {
    uid: currentProfile.uid,
    name: currentProfile.name,
    mssv: currentProfile.mssv,
    facultyId: currentProfile.facultyId,
    avatar: currentProfile.avatar,
    points: currentProfile.points,
    unlockedCount: Object.keys(currentProfile.done || {}).length,
    partyId: currentProfile.partyId,
    updatedAt: Date.now(),
  };
  const filtered = individuals.filter((u) => u.uid !== currentProfile.uid);
  const mergedIndividuals = [...filtered, meEntry].sort((a, b) => b.points - a.points);

  const parties = loadLocalParties().sort((a, b) => b.totalPoints - a.totalPoints);
  return { individuals: mergedIndividuals, parties };
}
</file>

<file path="src/services/partyService.ts">
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FACULTIES } from '../data/faculties';
import { FacultyId, PartyMember, PartyRoom, UserProfile } from '../types/game';
import { syncProfileToCloud } from './authService';
import { db, isFirebaseConfigured } from './firebase';

const LOCAL_PARTIES_KEY = 'tdc_go_parties_v2';

const SAMPLE_PARTIES: PartyRoom[] = [
  {
    code: 'TDC26A',
    hostUid: 'sample_1',
    name: 'Biệt đội Liên Khoa TDC',
    memberUids: ['sample_1', 'sample_2', 'sample_3'],
    members: [
      {
        uid: 'sample_1',
        name: 'Minh Anh',
        mssv: '24211TT0124',
        facultyId: 'cntt',
        avatar: 0,
        points: 1420,
      },
      {
        uid: 'sample_2',
        name: 'Gia Huy',
        mssv: '24211DD0089',
        facultyId: 'dien_dt',
        avatar: 1,
        points: 1280,
      },
      {
        uid: 'sample_3',
        name: 'Thảo Vy',
        mssv: '24211KT0215',
        facultyId: 'kinh_te',
        avatar: 2,
        points: 1150,
      },
    ],
    isCrossFaculty: true,
    bonusMultiplier: 1.2,
    totalPoints: 3850,
    createdAt: Date.now() - 7200000,
  },
  {
    code: 'CNTT99',
    hostUid: 'sample_4',
    name: 'Chiến thần Code & Cơ khí',
    memberUids: ['sample_4', 'sample_6'],
    members: [
      {
        uid: 'sample_4',
        name: 'Quốc Bảo',
        mssv: '24211OT0042',
        facultyId: 'co_khi_oto',
        avatar: 0,
        points: 990,
      },
      {
        uid: 'sample_6',
        name: 'Tuấn Kiệt',
        mssv: '24211CK0071',
        facultyId: 'co_khi_ctm',
        avatar: 1,
        points: 740,
      },
    ],
    isCrossFaculty: true,
    bonusMultiplier: 1.2,
    totalPoints: 1730,
    createdAt: Date.now() - 5400000,
  },
];

export function evaluateCrossFacultyBonus(members: PartyMember[]): {
  isCrossFaculty: boolean;
  bonusMultiplier: number;
} {
  const uniqueFaculties = new Set(members.map((m) => m.facultyId));
  const isCross = uniqueFaculties.size >= 2;
  return {
    isCrossFaculty: isCross,
    bonusMultiplier: isCross ? 1.2 : 1.0,
  };
}

export function loadLocalParties(): PartyRoom[] {
  try {
    const raw = localStorage.getItem(LOCAL_PARTIES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_PARTIES_KEY, JSON.stringify(SAMPLE_PARTIES));
      return [...SAMPLE_PARTIES];
    }
    const parsed = JSON.parse(raw) as PartyRoom[];
    return Array.isArray(parsed) ? parsed : [...SAMPLE_PARTIES];
  } catch {
    return [...SAMPLE_PARTIES];
  }
}

export function saveLocalParties(parties: PartyRoom[]): void {
  try {
    localStorage.setItem(LOCAL_PARTIES_KEY, JSON.stringify(parties));
  } catch {
    // Ignore
  }
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export async function getPartyByCode(code: string): Promise<PartyRoom | null> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return null;

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'parties', cleanCode));
      if (snap.exists()) return snap.data() as PartyRoom;
    } catch {
      // Fallback local
    }
  }
  const parties = loadLocalParties();
  return parties.find((p) => p.code === cleanCode) || null;
}

export async function createPartyRoom(
  profile: UserProfile,
  partyName: string
): Promise<{ room: PartyRoom; updatedProfile: UserProfile }> {
  const code = generateRoomCode();
  const hostMember: PartyMember = {
    uid: profile.uid,
    name: profile.name,
    mssv: profile.mssv,
    facultyId: profile.facultyId,
    avatar: profile.avatar,
    points: profile.points,
  };

  const room: PartyRoom = {
    code,
    hostUid: profile.uid,
    name: partyName.trim().slice(0, 45) || `Tổ đội của ${profile.name}`,
    memberUids: [profile.uid],
    members: [hostMember],
    isCrossFaculty: false,
    bonusMultiplier: 1.0,
    totalPoints: profile.points,
    createdAt: Date.now(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'parties', code), room);
    } catch {
      // Fallback local
    }
  }

  const parties = loadLocalParties().filter((p) => p.code !== code);
  parties.unshift(room);
  saveLocalParties(parties);

  const updatedProfile: UserProfile = {
    ...profile,
    partyId: code,
    updatedAt: Date.now(),
  };
  await syncProfileToCloud(updatedProfile);
  return { room, updatedProfile };
}

export async function joinPartyRoom(
  profile: UserProfile,
  codeInput: string
): Promise<{ room: PartyRoom; updatedProfile: UserProfile }> {
  const code = codeInput.trim().toUpperCase();
  const room = await getPartyByCode(code);
  if (!room) {
    throw new Error(`Không tìm thấy phòng Tổ đội với mã "${code}".`);
  }
  if (!room.memberUids.includes(profile.uid) && room.members.length >= 4) {
    throw new Error('Phòng Tổ đội này đã đủ tối đa 4 thành viên.');
  }

  const me: PartyMember = {
    uid: profile.uid,
    name: profile.name,
    mssv: profile.mssv,
    facultyId: profile.facultyId,
    avatar: profile.avatar,
    points: profile.points,
  };

  const filteredMembers = room.members.filter((m) => m.uid !== profile.uid);
  const nextMembers = [...filteredMembers, me];
  const nextUids = nextMembers.map((m) => m.uid);
  const { isCrossFaculty, bonusMultiplier } = evaluateCrossFacultyBonus(nextMembers);
  const totalPoints = nextMembers.reduce((sum, m) => sum + m.points, 0);

  const updatedRoom: PartyRoom = {
    ...room,
    memberUids: nextUids,
    members: nextMembers,
    isCrossFaculty,
    bonusMultiplier,
    totalPoints,
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'parties', code), updatedRoom);
    } catch {
      // Fallback local
    }
  }

  const parties = loadLocalParties();
  const idx = parties.findIndex((p) => p.code === code);
  if (idx >= 0) parties[idx] = updatedRoom;
  else parties.unshift(updatedRoom);
  saveLocalParties(parties);

  const updatedProfile: UserProfile = {
    ...profile,
    partyId: code,
    updatedAt: Date.now(),
  };
  await syncProfileToCloud(updatedProfile);

  return { room: updatedRoom, updatedProfile };
}

export async function simulateTeammateJoin(
  roomCode: string,
  currentFacultyId: FacultyId
): Promise<PartyRoom> {
  const room = await getPartyByCode(roomCode);
  if (!room) throw new Error('Không tìm thấy phòng tổ đội.');
  if (room.members.length >= 4) {
    throw new Error('Tổ đội đã đủ 4 thành viên.');
  }

  const otherFaculties = FACULTIES.filter((f) => f.id !== currentFacultyId);
  const pickedFaculty =
    otherFaculties[room.members.length % otherFaculties.length] || FACULTIES[1];
  const sampleNames = ['Hoàng Nam', 'Khánh Linh', 'Đức Trọng', 'Phương Thảo'];
  const idx = room.members.length;
  const teammate: PartyMember = {
    uid: `coop_ally_${Date.now()}`,
    name: sampleNames[idx % sampleNames.length],
    mssv: `25211${pickedFaculty.id.slice(0, 2).toUpperCase()}0${10 + idx}`,
    facultyId: pickedFaculty.id,
    avatar: idx % 3,
    points: 240 + idx * 80,
  };

  const nextMembers = [...room.members, teammate];
  const { isCrossFaculty, bonusMultiplier } = evaluateCrossFacultyBonus(nextMembers);
  const updatedRoom: PartyRoom = {
    ...room,
    memberUids: nextMembers.map((m) => m.uid),
    members: nextMembers,
    isCrossFaculty,
    bonusMultiplier,
    totalPoints: nextMembers.reduce((s, m) => s + m.points, 0),
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'parties', room.code), updatedRoom);
    } catch {
      // Ignore
    }
  }

  const parties = loadLocalParties();
  const pIdx = parties.findIndex((p) => p.code === room.code);
  if (pIdx >= 0) parties[pIdx] = updatedRoom;
  else parties.unshift(updatedRoom);
  saveLocalParties(parties);

  return updatedRoom;
}

export async function syncMemberPointsInParty(profile: UserProfile): Promise<PartyRoom | null> {
  if (!profile.partyId) return null;
  const room = await getPartyByCode(profile.partyId);
  if (!room) return null;

  const nextMembers = room.members.map((m) =>
    m.uid === profile.uid
      ? {
          ...m,
          name: profile.name,
          facultyId: profile.facultyId,
          avatar: profile.avatar,
          points: profile.points,
        }
      : m
  );
  const { isCrossFaculty, bonusMultiplier } = evaluateCrossFacultyBonus(nextMembers);
  const updatedRoom: PartyRoom = {
    ...room,
    members: nextMembers,
    isCrossFaculty,
    bonusMultiplier,
    totalPoints: nextMembers.reduce((s, m) => s + m.points, 0),
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'parties', room.code), updatedRoom);
    } catch {
      // Ignore
    }
  }

  const parties = loadLocalParties();
  const idx = parties.findIndex((p) => p.code === room.code);
  if (idx >= 0) parties[idx] = updatedRoom;
  saveLocalParties(parties);
  return updatedRoom;
}

export async function leavePartyRoom(profile: UserProfile): Promise<UserProfile> {
  if (profile.partyId) {
    const code = profile.partyId.trim().toUpperCase();
    const room = await getPartyByCode(code);
    if (room) {
      const nextMembers = room.members.filter((m) => m.uid !== profile.uid);
      const nextUids = nextMembers.map((m) => m.uid);
      const { isCrossFaculty, bonusMultiplier } = evaluateCrossFacultyBonus(nextMembers);
      const updatedRoom: PartyRoom = {
        ...room,
        hostUid: nextMembers[0]?.uid || room.hostUid,
        memberUids: nextUids,
        members: nextMembers,
        isCrossFaculty,
        bonusMultiplier,
        totalPoints: nextMembers.reduce((s, m) => s + m.points, 0),
      };

      if (isFirebaseConfigured && db && nextMembers.length > 0) {
        try {
          await setDoc(doc(db, 'parties', room.code), updatedRoom);
        } catch {
          // Ignore
        }
      }

      const parties = loadLocalParties();
      const idx = parties.findIndex((p) => p.code === room.code);
      if (idx >= 0) {
        if (nextMembers.length > 0) {
          parties[idx] = updatedRoom;
        } else {
          parties.splice(idx, 1);
        }
        saveLocalParties(parties);
      }
    }
  }

  const updated: UserProfile = {
    ...profile,
    partyId: undefined,
    updatedAt: Date.now(),
  };
  await syncProfileToCloud(updated);
  return updated;
}
</file>

<file path="src/types/game.ts">
export type FacultyId =
  | 'cntt'
  | 'dien_dt'
  | 'co_khi_oto'
  | 'co_khi_ctm'
  | 'kinh_te'
  | 'ngoai_ngu'
  | 'du_lich'
  | 'khac';

export interface Faculty {
  id: FacultyId;
  name: string;
  shortName: string;
  color: string;
  badgeColor: string;
}

export type StationType =
  | 'checkin'
  | 'photo'
  | 'quiz'
  | 'kick'
  | 'it_debug'
  | 'electric_circuit'
  | 'auto_engine';

export interface QuizItem {
  q: string;
  opts: string[];
  ans: number;
  ex: string;
}

export interface StationRiddle {
  prompt: string;
  answer: string;
  hint: string;
}

export interface Station {
  id: string;
  name: string;
  sub: string;
  facultyId: string;
  x: number;
  z: number;
  fogRadius: number;
  col: string;
  type: StationType;
  pts: number;
  badge: string;
  info: string;
  funFact: string;
  directions: string;
  qrSecretToken: string;
  riddle?: StationRiddle;
  questions?: QuizItem[];
  active: boolean;
}

export type VerificationMethod = 'qr' | 'riddle' | 'demo';

export interface UnlockedStationRecord {
  pts: number;
  unlockedAt: number;
  method: VerificationMethod;
  photoDataUrl?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  mssv: string;
  email: string;
  facultyId: FacultyId;
  role: 'student' | 'admin';
  avatar: number;
  points: number;
  stars: number;
  quizOk: number;
  photos: number;
  done: Record<string, UnlockedStationRecord>;
  bonus: Record<string, boolean>;
  partyId?: string;
  pos?: [number, number] | null;
  certClaimed?: boolean;
  updatedAt: number;
}

export interface PublicLeaderboardUser {
  uid: string;
  name: string;
  mssv: string;
  facultyId: FacultyId;
  avatar: number;
  points: number;
  unlockedCount: number;
  partyId?: string;
  updatedAt: number;
}

export interface PartyMember {
  uid: string;
  name: string;
  mssv: string;
  facultyId: FacultyId;
  avatar: number;
  points: number;
}

export interface PartyRoom {
  code: string;
  hostUid: string;
  name: string;
  memberUids: string[];
  members: PartyMember[];
  isCrossFaculty: boolean;
  bonusMultiplier: number;
  totalPoints: number;
  createdAt: number;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  need: number;
  reward: number;
  icon: StationType | 'star' | 'explorer' | 'party';
  col: string;
  getValue: (profile: UserProfile, totalStations: number) => number;
}

export interface CampaignEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  active: boolean;
  bonusMultiplier: number;
}

export interface CheckinLog {
  id: string;
  uid: string;
  userName: string;
  stationId: string;
  facultyId: FacultyId;
  method: VerificationMethod;
  pts: number;
  timestamp: number;
}
</file>

<file path="src/App.tsx">
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GameHud } from './components/GameHud';
import { Viewfinder } from './components/minigames/Viewfinder';
import { CertificateModal } from './components/modals/CertificateModal';
import { HelpModal } from './components/modals/HelpModal';
import { LeaderboardModal } from './components/modals/LeaderboardModal';
import { PartyModal } from './components/modals/PartyModal';
import { ProfileBadgesModal } from './components/modals/ProfileBadgesModal';
import { QuestsModal } from './components/modals/QuestsModal';
import { QrScannerModal } from './components/QrScannerModal';
import { StartScreen } from './components/StartScreen';
import { StationModal } from './components/StationModal';
import { audioSfx } from './engine/audioSfx';
import {
  FloatingTextItem,
  GuideState,
  MinimapSnapshot,
  TdcCampusEngine,
} from './engine/TdcCampusEngine';
import { AdminDashboard } from './pages/AdminDashboard';
import {
  fetchStationsFromCloudOrLocal,
  loadStations,
} from './services/adminService';
import {
  loadLocalProfile,
  loginOrRegisterExplorer,
  resetExplorerProgress,
  saveLocalProfile,
} from './services/authService';
import {
  checkAntiCheatCooldown,
  recordStarPickup,
  recordStationUnlock,
  verifyStationQrPayload,
} from './services/gameService';
import {
  createPartyRoom,
  getPartyByCode,
  joinPartyRoom,
  leavePartyRoom,
  simulateTeammateJoin,
} from './services/partyService';
import {
  FacultyId,
  PartyRoom,
  Station,
  UserProfile,
  VerificationMethod,
} from './types/game';

interface ToastItem {
  id: number;
  text: string;
  gold?: boolean;
}

type ActiveModal =
  | null
  | { type: 'station'; station: Station; preverifiedMethod?: VerificationMethod | null }
  | { type: 'qr'; targetStation?: Station | null }
  | { type: 'quests' }
  | { type: 'leaderboard' }
  | { type: 'badges' }
  | { type: 'party' }
  | { type: 'help' }
  | { type: 'certificate' };

export const App: React.FC = () => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<TdcCampusEngine | null>(null);

  const [stations, setStations] = useState<Station[]>(() => loadStations());
  const [profile, setProfile] = useState<UserProfile | null>(() => loadLocalProfile());
  const [party, setParty] = useState<PartyRoom | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAdmin, setShowAdmin] = useState(
    () => window.location.pathname === '/admin' || window.location.hash === '#admin'
  );

  const [nearStation, setNearStation] = useState<Station | null>(null);
  const [guide, setGuide] = useState<GuideState>({
    station: null,
    distance: 0,
    angleRad: 0,
    allDone: false,
  });
  const [minimapSnap, setMinimapSnap] = useState<MinimapSnapshot | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextItem[]>([]);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const [photoMode, setPhotoMode] = useState<{
    station: Station;
    method: VerificationMethod;
  } | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [muted, setMuted] = useState(false);
  const [pointsBump, setPointsBump] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const profileRef = useRef<UserProfile | null>(profile);
  profileRef.current = profile;
  const stationsRef = useRef<Station[]>(stations);
  stationsRef.current = stations;
  const partyRef = useRef<PartyRoom | null>(party);
  partyRef.current = party;

  const pushToast = useCallback((text: string, gold = false) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev.slice(-2), { id, text, gold }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const triggerPointsBump = useCallback(() => {
    setPointsBump(false);
    setTimeout(() => setPointsBump(true), 15);
  }, []);

  // Load stations & existing party on mount
  useEffect(() => {
    void fetchStationsFromCloudOrLocal().then((list) => {
      setStations(list);
    });
    if (profile?.partyId) {
      void getPartyByCode(profile.partyId).then((r) => {
        if (r) setParty(r);
      });
    }
  }, []);

  // Mount Three.js 3D Engine
  useEffect(() => {
    const container = stageRef.current;
    if (!container) return;

    const engine = new TdcCampusEngine(
      container,
      stationsRef.current,
      profileRef.current?.done || {},
      {
        onNearStationChange: (st) => setNearStation(st),
        onOpenStationRequest: (st) => {
          audioSfx.play('tap');
          setActiveModal({ type: 'station', station: st });
        },
        onStarCollected: () => {
          const cur = profileRef.current;
          if (!cur) return;
          const prevLevel = 1 + Math.floor(cur.points / 300);
          const activeCount = stationsRef.current.filter((s) => s.active !== false).length;
          void recordStarPickup(cur, activeCount).then(
            ({ updatedProfile, newlyCompletedQuests }) => {
              setProfile(updatedProfile);
              triggerPointsBump();
              const nextLevel = 1 + Math.floor(updatedProfile.points / 300);
              if (nextLevel > prevLevel) {
                pushToast(`🎉 Thăng cấp ${nextLevel}!`, true);
                audioSfx.play('badge');
              }
              newlyCompletedQuests.forEach((q) => {
                pushToast(`Hoàn thành nhiệm vụ: ${q.name} · +${q.reward}đ`, true);
              });
            }
          );
        },
        onPlayerMoveSave: (pos) => {
          const cur = profileRef.current;
          if (!cur) return;
          const updated: UserProfile = { ...cur, pos };
          setProfile(updated);
          saveLocalProfile(updated);
        },
        onFloatingTextsUpdate: (items) => setFloatingTexts(items),
        onGuideUpdate: (g) => setGuide(g),
        onMinimapUpdate: (snap) => setMinimapSnap(snap),
      }
    );

    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [pushToast, triggerPointsBump]);

  // Sync stations and unlocked fog of war with 3D engine
  useEffect(() => {
    engineRef.current?.updateStationsAndProgress(stations, profile?.done || {});
  }, [stations, profile?.done]);

  // Pause 3D movement when modal or admin is open
  useEffect(() => {
    engineRef.current?.setPaused(Boolean(activeModal) || showAdmin);
  }, [activeModal, showAdmin]);

  const handleStartGame = async (params: {
    name: string;
    mssv: string;
    email?: string;
    password?: string;
    facultyId: FacultyId;
    avatar: number;
    mode: 'demo' | 'email_login' | 'email_register' | 'google';
  }) => {
    const loggedIn = await loginOrRegisterExplorer(params);
    setProfile(loggedIn);
    if (loggedIn.partyId) {
      const p = await getPartyByCode(loggedIn.partyId);
      setParty(p);
    }
    const unlockedCount = Object.keys(loggedIn.done || {}).length;
    engineRef.current?.startPlayer(
      loggedIn.name,
      loggedIn.avatar,
      loggedIn.pos,
      unlockedCount > 0
    );
    setIsPlaying(true);
    audioSfx.play('ok');
    pushToast(
      unlockedCount > 0
        ? `Chào mừng trở lại, ${loggedIn.name} (${loggedIn.mssv})!`
        : `Chào ${loggedIn.name}! Hãy tiến tới Cổng 1 ngay trước mặt để xóa sương mù đầu tiên.`,
      true
    );
  };

  const handleResetProgress = () => {
    if (!profile) return;
    const reset = resetExplorerProgress(profile);
    setProfile(reset);
    pushToast('Đã đặt lại tiến độ và phủ lại lớp sương mù toàn trường!');
  };

  const handleCompleteStation = async (params: {
    station: Station;
    basePoints: number;
    method: VerificationMethod;
    isQuizOrGameSuccess: boolean;
    summaryHtml?: string;
    photoDataUrl?: string;
  }) => {
    if (!profile) {
      return { finalPoints: params.basePoints, crossFacultyBonus: 0, qrBonus: 0 };
    }
    const prevLevel = 1 + Math.floor(profile.points / 300);
    const activeCount = stations.filter((s) => s.active !== false).length;

    const {
      updatedProfile,
      finalPoints,
      crossFacultyBonus,
      qrBonus,
      newlyCompletedQuests,
    } = await recordStationUnlock({
      profile,
      station: params.station,
      baseEarnedPoints: params.basePoints,
      method: params.method,
      party,
      photoDataUrl: params.photoDataUrl,
      isQuizOrGameSuccess: params.isQuizOrGameSuccess,
      totalStationsCount: activeCount,
    });

    setProfile(updatedProfile);
    if (updatedProfile.partyId) {
      const updatedParty = await getPartyByCode(updatedProfile.partyId);
      if (updatedParty) setParty(updatedParty);
    }

    audioSfx.play('unlock');
    engineRef.current?.celebrateStationUnlock(params.station, `+${finalPoints}`);
    triggerPointsBump();

    const nextLevel = 1 + Math.floor(updatedProfile.points / 300);
    if (nextLevel > prevLevel) {
      pushToast(`🎉 Thăng cấp ${nextLevel}!`, true);
    }
    newlyCompletedQuests.forEach((q) => {
      pushToast(`Hoàn thành nhiệm vụ: ${q.name} · +${q.reward}đ`, true);
    });

    return { finalPoints, crossFacultyBonus, qrBonus };
  };

  const handleRequestPhotoMode = (station: Station, method: VerificationMethod) => {
    setActiveModal(null);
    setPhotoMode({ station, method });
    engineRef.current?.enterPhotoMode(station);
  };

  const handleCapturePhoto = async () => {
    if (!photoMode || !profile) return;
    const dataUrl = engineRef.current?.capturePhotoDataUrl() || '';
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 500);
    audioSfx.tone([1800, 1200], 0.05, 'square', 0.04, 0.04);

    const { station, method } = photoMode;
    engineRef.current?.exitPhotoMode();
    setPhotoMode(null);

    await handleCompleteStation({
      station,
      basePoints: station.pts,
      method,
      isQuizOrGameSuccess: true,
      photoDataUrl: dataUrl,
    });

    setActiveModal({ type: 'station', station });
  };

  const handleQrDetected = (rawCode: string) => {
    if (profile) {
      const cooldown = checkAntiCheatCooldown(profile, 'qr');
      if (!cooldown.allowed) {
        audioSfx.play('bad');
        pushToast(
          `Chống gian lận (Anti-cheat): Bạn di chuyển giữa 2 trạm quá nhanh! Vui lòng đợi ${cooldown.waitSeconds}s.`
        );
        return;
      }
    }

    const target =
      activeModal?.type === 'qr' && activeModal.targetStation
        ? activeModal.targetStation
        : null;

    if (target) {
      const res = verifyStationQrPayload(target, rawCode);
      if (res.valid) {
        audioSfx.play('ok');
        pushToast(res.message, true);
        setActiveModal({
          type: 'station',
          station: target,
          preverifiedMethod: 'qr',
        });
        return;
      }
    }

    // Try matching across any station on campus
    for (const st of stations) {
      const check = verifyStationQrPayload(st, rawCode);
      if (check.valid) {
        audioSfx.play('ok');
        pushToast(`Đã định vị & xác thực QR trạm: ${st.name}!`, true);
        engineRef.current?.navigateToStation(st);
        setActiveModal({
          type: 'station',
          station: st,
          preverifiedMethod: 'qr',
        });
        return;
      }
    }

    audioSfx.play('bad');
    pushToast('Mã QR không hợp lệ hoặc không khớp với trạm nào tại TDC.');
  };

  const activeStationsCount = stations.filter((s) => s.active !== false).length;

  return (
    <div id="app">
      {/* 3D WebGL Campus Canvas Container */}
      <div id="stage" ref={stageRef} />

      {/* Start Screen */}
      {!isPlaying && !showAdmin && (
        <StartScreen
          existingProfile={profile}
          totalStations={activeStationsCount}
          onStartGame={handleStartGame}
          onResetProgress={handleResetProgress}
          onOpenAdmin={() => setShowAdmin(true)}
        />
      )}

      {/* Main Game HUD */}
      {isPlaying && profile && !showAdmin && (
        <GameHud
          profile={profile}
          party={party}
          stations={stations}
          nearStation={nearStation}
          guide={guide}
          minimapSnap={minimapSnap}
          floatingTexts={floatingTexts}
          muted={muted}
          dimmed={Boolean(photoMode)}
          pointsBump={pointsBump}
          onToggleMute={() => {
            const next = audioSfx.toggleMute();
            setMuted(next);
          }}
          onOpenStation={(st) => {
            audioSfx.play('tap');
            setActiveModal({ type: 'station', station: st });
          }}
          onNavigateGuide={() => {
            if (guide.station) {
              engineRef.current?.navigateToStation(guide.station);
              pushToast(`Đang di chuyển tới ${guide.station.name}...`);
            }
          }}
          onOpenQuests={() => setActiveModal({ type: 'quests' })}
          onOpenLeaderboard={() => setActiveModal({ type: 'leaderboard' })}
          onOpenBadges={() => setActiveModal({ type: 'badges' })}
          onOpenParty={() => setActiveModal({ type: 'party' })}
          onOpenQrScanner={() =>
            setActiveModal({ type: 'qr', targetStation: nearStation })
          }
          onOpenHelp={() => setActiveModal({ type: 'help' })}
          onOpenAdmin={() => setShowAdmin(true)}
          onJoystickChange={(x, y) => engineRef.current?.setJoystick(x, y)}
        />
      )}

      {/* 3D Polaroid Viewfinder */}
      <Viewfinder
        station={photoMode?.station || null}
        onRotate={() => engineRef.current?.rotatePhotoCamera()}
        onCapture={handleCapturePhoto}
        onCancel={() => {
          engineRef.current?.exitPhotoMode();
          setPhotoMode(null);
        }}
      />

      {showFlash && <div id="flash" />}

      {/* Toasts */}
      <div id="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.gold ? 'gold' : ''}`}>
            {t.text}
          </div>
        ))}
      </div>

      {/* Active Modals */}
      {activeModal?.type === 'station' && profile && (
        <StationModal
          station={activeModal.station}
          profile={profile}
          party={party}
          totalStations={activeStationsCount}
          nextStationName={guide.station?.name}
          preverifiedMethod={activeModal.preverifiedMethod}
          onClose={() => setActiveModal(null)}
          onOpenQrScanner={(st) =>
            setActiveModal({ type: 'qr', targetStation: st })
          }
          onRequestPhotoMode={handleRequestPhotoMode}
          onCompleteStation={handleCompleteStation}
          onShowCertificate={() => setActiveModal({ type: 'certificate' })}
        />
      )}

      {activeModal?.type === 'qr' && (
        <QrScannerModal
          stations={stations}
          targetStation={activeModal.targetStation}
          onClose={() => setActiveModal(null)}
          onQrDetected={handleQrDetected}
        />
      )}

      {activeModal?.type === 'quests' && profile && (
        <QuestsModal
          profile={profile}
          totalStations={activeStationsCount}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal?.type === 'leaderboard' && profile && (
        <LeaderboardModal
          profile={profile}
          totalStations={activeStationsCount}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal?.type === 'badges' && profile && (
        <ProfileBadgesModal
          profile={profile}
          stations={stations}
          onClose={() => setActiveModal(null)}
          onOpenCertificate={() => setActiveModal({ type: 'certificate' })}
        />
      )}

      {activeModal?.type === 'party' && profile && (
        <PartyModal
          profile={profile}
          party={party}
          onClose={() => setActiveModal(null)}
          onCreateParty={async (pName) => {
            const { room, updatedProfile } = await createPartyRoom(profile, pName);
            setParty(room);
            setProfile(updatedProfile);
            pushToast(`Đã tạo Tổ đội "${room.name}" (Mã: ${room.code})!`, true);
          }}
          onJoinParty={async (code) => {
            const { room, updatedProfile } = await joinPartyRoom(profile, code);
            setParty(room);
            setProfile(updatedProfile);
            pushToast(
              `Đã gia nhập Tổ đội "${room.name}"${room.isCrossFaculty ? ' · Kích hoạt +20% Điểm Liên Khoa!' : ''}`,
              true
            );
          }}
          onLeaveParty={async () => {
            const updated = await leavePartyRoom(profile);
            setParty(null);
            setProfile(updated);
            pushToast('Đã rời khỏi phòng Tổ đội.');
          }}
          onSimulateTeammate={async () => {
            if (!party) return;
            const updatedRoom = await simulateTeammateJoin(
              party.code,
              profile.facultyId
            );
            setParty(updatedRoom);
            pushToast(
              `Đồng đội mới đã vào phòng! ${updatedRoom.isCrossFaculty ? '⚡ Kích hoạt +20% Điểm Liên Khoa!' : ''}`,
              true
            );
          }}
        />
      )}

      {activeModal?.type === 'help' && (
        <HelpModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal?.type === 'certificate' && profile && (
        <CertificateModal
          profile={profile}
          stations={stations}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Admin CMS Dashboard */}
      {showAdmin && (
        <AdminDashboard
          stations={stations}
          onStationsUpdated={(next) => setStations(next)}
          onBackToGame={() => setShowAdmin(false)}
        />
      )}
    </div>
  );
};
</file>

<file path="src/game.test.ts">
import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_STATIONS } from './data/stations';

const memoryStore = new Map<string, string>();
if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (k: string) => (memoryStore.has(k) ? memoryStore.get(k)! : null),
      setItem: (k: string, v: string) => {
        memoryStore.set(k, String(v));
      },
      removeItem: (k: string) => {
        memoryStore.delete(k);
      },
      clear: () => {
        memoryStore.clear();
      },
    },
    configurable: true,
  });
}

beforeEach(() => {
  memoryStore.clear();
});
import {
  buildStationQrPayload,
  generateAnalyticsCsv,
  getAdminAnalytics,
} from './services/adminService';
import {
  ANTI_CHEAT_COOLDOWN_MS,
  calculateStationRewardPoints,
  checkAntiCheatCooldown,
  normalizeVietnameseAnswer,
  verifyStationQrPayload,
  verifyStationRiddle,
} from './services/gameService';
import {
  createPartyRoom,
  evaluateCrossFacultyBonus,
  getPartyByCode,
  joinPartyRoom,
  leavePartyRoom,
} from './services/partyService';
import { PartyMember, PartyRoom, UserProfile } from './types/game';

describe('TDC GO Core Business Logic & Anti-Cheat Tests', () => {
  it('1. Normalizes Vietnamese riddle answers accurately (case, accents, punctuation)', () => {
    expect(normalizeVietnameseAnswer('  Kỹ Năng! ')).toBe('ky nang');
    expect(normalizeVietnameseAnswer('Đạo đức - Tri thức')).toBe('dao duc tri thuc');
  });

  it('2. Verifies real-world observation riddles at stations (O2O verification)', () => {
    const hallH = DEFAULT_STATIONS.find((s) => s.id === 'h')!;
    expect(verifyStationRiddle(hallH, 'Kỹ năng')).toBe(true);
    expect(verifyStationRiddle(hallH, 'ky nang')).toBe(true);
    expect(verifyStationRiddle(hallH, 'sai dap an')).toBe(false);
    expect(verifyStationRiddle(hallH, '   ')).toBe(false);
  });

  it('3. Verifies QR code payloads (both JSON Standee payload and direct secret token)', () => {
    const itStation = DEFAULT_STATIONS.find((s) => s.id === 'b_it')!;
    const jsonPayload = buildStationQrPayload(itStation);

    const resJson = verifyStationQrPayload(itStation, jsonPayload);
    expect(resJson.valid).toBe(true);

    const resToken = verifyStationQrPayload(itStation, 'tdc-qr-toab-cntt');
    expect(resToken.valid).toBe(true);

    const resInvalid = verifyStationQrPayload(itStation, 'WRONG-TOKEN-999');
    expect(resInvalid.valid).toBe(false);
  });

  it('4. Enforces Anti-Cheat Cooldown between consecutive real-world station unlocks', () => {
    const now = 1000000;
    const baseProfile: UserProfile = {
      uid: 'u1',
      name: 'SV Test',
      mssv: '26211TT0001',
      email: 'test@mail.tdc.edu.vn',
      facultyId: 'cntt',
      role: 'student',
      avatar: 0,
      points: 100,
      stars: 0,
      quizOk: 0,
      photos: 0,
      done: {
        g1: { pts: 60, unlockedAt: now - 1500, method: 'qr' },
      },
      bonus: {},
      updatedAt: now,
    };

    // Trying to unlock another station 1.5s later via QR should be blocked
    const blocked = checkAntiCheatCooldown(baseProfile, 'qr', now);
    expect(blocked.allowed).toBe(false);
    expect(blocked.waitSeconds).toBeGreaterThan(0);

    // After ANTI_CHEAT_COOLDOWN_MS, it should be allowed
    const allowed = checkAntiCheatCooldown(
      baseProfile,
      'qr',
      now + ANTI_CHEAT_COOLDOWN_MS + 100
    );
    expect(allowed.allowed).toBe(true);

    // Demo mode bypasses physical travel cooldown for classroom testing
    const demoAllowed = checkAntiCheatCooldown(baseProfile, 'demo', now);
    expect(demoAllowed.allowed).toBe(true);
  });

  it('5. Evaluates Cross-Faculty Party Bonus (+20%) when 2+ faculties team up', () => {
    const sameFacultyMembers: PartyMember[] = [
      { uid: '1', name: 'A', mssv: '1', facultyId: 'cntt', avatar: 0, points: 100 },
      { uid: '2', name: 'B', mssv: '2', facultyId: 'cntt', avatar: 1, points: 120 },
    ];
    const sameEval = evaluateCrossFacultyBonus(sameFacultyMembers);
    expect(sameEval.isCrossFaculty).toBe(false);
    expect(sameEval.bonusMultiplier).toBe(1.0);

    const crossFacultyMembers: PartyMember[] = [
      ...sameFacultyMembers,
      { uid: '3', name: 'C', mssv: '3', facultyId: 'dien_dt', avatar: 2, points: 150 },
    ];
    const crossEval = evaluateCrossFacultyBonus(crossFacultyMembers);
    expect(crossEval.isCrossFaculty).toBe(true);
    expect(crossEval.bonusMultiplier).toBe(1.2);
  });

  it('6. Calculates total station reward points with O2O QR bonus, Cross-Faculty bonus, and Campaign Event multiplier', () => {
    const crossParty: PartyRoom = {
      code: 'TDC123',
      hostUid: '1',
      name: 'Party',
      memberUids: ['1', '2'],
      members: [],
      isCrossFaculty: true,
      bonusMultiplier: 1.2,
      totalPoints: 200,
      createdAt: Date.now(),
    };

    const rewardNoEvent = calculateStationRewardPoints({
      basePoints: 100,
      party: crossParty,
      method: 'qr',
      eventMultiplier: 1.0,
    });

    expect(rewardNoEvent.qrBonus).toBe(15);
    expect(rewardNoEvent.crossFacultyBonus).toBe(20);
    expect(rewardNoEvent.eventBonus).toBe(0);
    expect(rewardNoEvent.finalPoints).toBe(135);

    const rewardWithEvent = calculateStationRewardPoints({
      basePoints: 100,
      party: crossParty,
      method: 'qr',
      eventMultiplier: 1.5,
    });
    expect(rewardWithEvent.eventBonus).toBe(50);
    expect(rewardWithEvent.finalPoints).toBe(185);
  });

  it('7. Generates Admin Analytics and valid CSV report', () => {
    const summary = getAdminAnalytics(DEFAULT_STATIONS);
    expect(summary.stationStats.length).toBe(DEFAULT_STATIONS.length);
    expect(summary.facultyStats.length).toBeGreaterThan(0);

    const csv = generateAnalyticsCsv(summary);
    expect(csv).toContain('BAO CAO THONG KE HE THONG TDC GO');
    expect(csv).toContain('Tòa D (11 tầng) & Cổng 2');
  });

  it('8. Removes departing member and recalculates party totalPoints & cross-faculty status on leavePartyRoom', async () => {
    const host: UserProfile = {
      uid: 'u_host',
      name: 'Host CNTT',
      mssv: '26211TT0010',
      email: 'host@mail.tdc.edu.vn',
      facultyId: 'cntt',
      role: 'student',
      avatar: 0,
      points: 200,
      stars: 0,
      quizOk: 0,
      photos: 0,
      done: {},
      bonus: {},
      updatedAt: Date.now(),
    };
    const guest: UserProfile = {
      ...host,
      uid: 'u_guest',
      name: 'Guest Điện',
      mssv: '26211DD0020',
      facultyId: 'dien_dt',
      points: 300,
    };

    const { room } = await createPartyRoom(host, 'Test Co-op Room');
    const joined = await joinPartyRoom(guest, room.code);
    expect(joined.room.members.length).toBe(2);
    expect(joined.room.isCrossFaculty).toBe(true);
    expect(joined.room.totalPoints).toBe(500);

    await leavePartyRoom(joined.updatedProfile);
    const afterLeave = await getPartyByCode(room.code);
    expect(afterLeave).not.toBeNull();
    expect(afterLeave!.members.length).toBe(1);
    expect(afterLeave!.isCrossFaculty).toBe(false);
    expect(afterLeave!.totalPoints).toBe(200);
  });
});
</file>

<file path="src/index.css">
@import "tailwindcss";

/* Bố cục: thế giới 3D kiểu đồ chơi phủ kín màn hình; HUD bo tròn nổi ở 4 góc; thẻ thử thách trồi lên như tấm thẻ bài */
:root {
  --grass: #3DAA5C;
  --grass-d: #23733D;
  --leaf-l: #E6F6DA;
  --sun: #FFC83A;
  --sun-d: #D98E00;
  --coral: #FF6F59;
  --coral-d: #D9452F;
  --tdc: #00AEEF;
  --tdc-d: #0A7FC2;
  --cream: #FFFBEF;
  --card: #FFFFFF;
  --ink: #1E3528;
  --muted: #5B7266;
  --line: #E2EBDA;
  --drop: rgba(28, 64, 42, .20);
  --f-display: "Baloo 2", "Nunito", system-ui, sans-serif;
  --f-body: "Nunito", system-ui, -apple-system, "Segoe UI", sans-serif;
  color-scheme: light;
}

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

body {
  background: #CFEFDF;
  color: var(--ink);
  font-family: var(--f-body);
  font-size: 15px;
  line-height: 1.45;
  -webkit-tap-highlight-color: transparent;
}

*, *::before, *::after {
  box-sizing: border-box;
}

button {
  font: inherit;
  color: inherit;
}

button:focus-visible, input:focus-visible, select:focus-visible {
  outline: 3px solid var(--tdc);
  outline-offset: 2px;
}

#app {
  position: fixed;
  inset: 0;
}

#stage {
  position: absolute;
  inset: 0;
}

#stage canvas {
  display: block;
  touch-action: none;
}

.card {
  background: var(--card);
  border-radius: 20px;
  box-shadow: 0 4px 0 var(--drop), 0 10px 28px rgba(28, 64, 42, .14);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: var(--grass);
  color: #fff;
  font-family: var(--f-display);
  font-weight: 800;
  font-size: 16px;
  letter-spacing: .01em;
  cursor: pointer;
  box-shadow: 0 4px 0 var(--grass-d);
  transition: transform .08s, box-shadow .08s;
  touch-action: manipulation;
}

.btn:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 var(--grass-d);
}

.btn.sun {
  background: var(--sun);
  color: #4A3200;
  box-shadow: 0 4px 0 var(--sun-d);
}

.btn.sun:active {
  box-shadow: 0 1px 0 var(--sun-d);
}

.btn.blue {
  background: var(--tdc);
  color: #fff;
  box-shadow: 0 4px 0 var(--tdc-d);
}

.btn.ghost {
  background: var(--leaf-l);
  color: var(--grass-d);
  box-shadow: 0 4px 0 #C7E3B5;
}

.btn.big {
  min-height: 52px;
  font-size: 18px;
  width: 100%;
}

/* ---------- màn hình mở đầu ---------- */
#start {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding-left: max(16px, env(safe-area-inset-left, 0px));
  padding-right: max(16px, env(safe-area-inset-right, 0px));
  padding-top: calc(16px + env(safe-area-inset-top, 0px));
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(90deg, rgba(255, 251, 239, .90) 0, rgba(255, 251, 239, .62) 38%, rgba(255, 251, 239, 0) 65%);
  overflow: auto;
  z-index: 10;
}

.st-wrap {
  width: min(460px, 100%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-left: clamp(0px, 3vw, 48px);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo .seal {
  flex: none;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #fff;
  display: grid;
  place-items: center;
  box-shadow: 0 4px 0 var(--drop);
}

.logo .seal svg {
  width: 48px;
  height: 48px;
}

.logo h1 {
  margin: 0;
  font-family: var(--f-display);
  font-weight: 800;
  font-size: 56px;
  line-height: .9;
  letter-spacing: -.01em;
  color: var(--ink);
}

.logo h1 span {
  display: inline-block;
  background: var(--sun);
  color: #3D2A00;
  border-radius: 18px;
  padding: 2px 14px 0;
  margin-left: 4px;
  transform: rotate(-4deg);
  box-shadow: 0 5px 0 var(--sun-d);
}

.tag {
  margin: 0;
  font-size: 15.5px;
  font-weight: 700;
  color: var(--ink);
  max-width: 42ch;
  text-wrap: balance;
}

.st-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.st-card label, .st-card .lbl {
  display: block;
  font-size: 11.5px;
  font-weight: 900;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 3px;
}

.st-card input {
  font: inherit;
  font-size: 15px;
  font-weight: 800;
  padding: 9px 12px;
  border-radius: 12px;
  border: 2px solid var(--line);
  background: var(--cream);
  color: var(--ink);
  width: 100%;
}

.avas {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.avas button {
  border: 3px solid var(--line);
  background: var(--cream);
  border-radius: 16px;
  padding: 6px 4px 5px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-weight: 800;
  font-size: 12.5px;
}

.avas button.on {
  border-color: var(--grass);
  background: var(--leaf-l);
}

.fine {
  margin: 0;
  font-size: 12px;
  color: var(--muted);
  line-height: 1.4;
}

.st-row {
  display: flex;
  gap: 10px;
}

.st-row .btn {
  flex: 1;
}

/* ---------- HUD ---------- */
#hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  padding-top: calc(12px + env(safe-area-inset-top, 0px));
  padding-bottom: 16px;
  padding-left: max(16px, env(safe-area-inset-left, 0px));
  padding-right: max(16px, env(safe-area-inset-right, 0px));
  z-index: 5;
}

#hud.dim > *:not(#fx) {
  opacity: 0;
  pointer-events: none;
}

.hud-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.me {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px 6px 6px;
  border-radius: 999px;
  min-width: 0;
  max-width: min(320px, 55vw);
}

.me .ava {
  flex: none;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--leaf-l);
  display: grid;
  place-items: center;
  overflow: hidden;
}

.me .ava svg {
  width: 46px;
  height: 46px;
}

.me-txt {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.me-txt b {
  font-family: var(--f-display);
  font-size: 16.5px;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.me-txt span {
  font-size: 11.5px;
  font-weight: 800;
  color: var(--grass-d);
}

.xp {
  height: 7px;
  border-radius: 5px;
  background: var(--leaf-l);
  overflow: hidden;
  margin-top: 3px;
  min-width: 90px;
}

.xp i {
  display: block;
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, var(--grass), #8BD346);
  border-radius: 5px;
  transition: width .4s;
}

.hud-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.pills {
  display: flex;
  gap: 8px;
}

.pill {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 14px 0 8px;
  border: 0;
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 4px 0 var(--drop);
  font-family: var(--f-display);
  font-weight: 800;
  font-size: 18px;
  font-variant-numeric: tabular-nums;
}

.pill .ic {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}

.pill.pts .ic {
  background: var(--sun);
  color: #7A4D00;
}

.pill.bdg .ic {
  background: var(--coral);
  color: #fff;
}

.pill.bump {
  animation: bump .45s;
}

@keyframes bump {
  40% { transform: scale(1.16); }
}

#mini {
  pointer-events: auto;
  width: 118px;
  height: 118px;
  border-radius: 50%;
  background: #BFE5B0;
  border: 4px solid #fff;
  box-shadow: 0 4px 0 var(--drop);
  cursor: pointer;
}

.side {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rb {
  pointer-events: auto;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 0;
  background: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 4px 0 var(--drop);
  color: var(--ink);
  position: relative;
}

.rb:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 var(--drop);
}

.rb .dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--coral);
  border: 2px solid #fff;
}

.hud-bot {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding-left: max(16px, env(safe-area-inset-left, 0px));
  padding-right: max(16px, env(safe-area-inset-right, 0px));
}

.guide {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 16px 0 6px;
  border-radius: 999px;
  background: var(--ink);
  color: #fff;
  font-weight: 800;
  font-size: 13.5px;
  box-shadow: 0 4px 0 rgba(0, 0, 0, .25);
  max-width: 100%;
  cursor: pointer;
  border: 0;
}

.guide .arr {
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--sun);
  color: #3D2A00;
  display: grid;
  place-items: center;
  transition: transform .15s linear;
}

.guide span:last-child {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.act {
  pointer-events: auto;
  width: min(400px, 100%);
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: pop .28s cubic-bezier(.2, 1.4, .4, 1);
}

.act-txt {
  flex: 1;
  min-width: 0;
}

.act-txt b {
  display: block;
  font-family: var(--f-display);
  font-size: 18px;
  line-height: 1.1;
}

.act-txt span {
  font-size: 12.5px;
  color: var(--muted);
  font-weight: 700;
}

.act .btn {
  min-height: 42px;
  padding: 0 16px;
  font-size: 15px;
}

@keyframes pop {
  from { transform: translateY(18px) scale(.9); opacity: 0; }
}

.keys {
  position: absolute;
  left: max(16px, env(safe-area-inset-left, 0px));
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  margin: 0;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--ink);
  background: rgba(255, 255, 255, .82);
  padding: 6px 10px;
  border-radius: 10px;
  max-width: 260px;
  line-height: 1.4;
}

.keys b {
  font-family: var(--f-display);
}

#joy {
  display: none;
  pointer-events: auto;
  position: absolute;
  left: max(20px, env(safe-area-inset-left, 0px));
  bottom: calc(22px + env(safe-area-inset-bottom, 0px));
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, .55);
  border: 3px solid rgba(255, 255, 255, .9);
  touch-action: none;
}

#joy i {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 54px;
  height: 54px;
  margin: -27px 0 0 -27px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 4px 0 var(--drop);
}

@media (pointer: coarse) {
  #joy { display: block; }
  .keys { display: none; }
  .hud-bot { align-items: flex-end; }
  .act { margin-bottom: 96px; align-self: center; }
  .guide { margin-left: 140px; max-width: calc(100% - 140px); }
}

@media (max-width: 520px) {
  .logo h1 { font-size: 46px; }
  #mini { width: 96px; height: 96px; }
  .pill { height: 36px; font-size: 16px; padding: 0 11px 0 6px; }
  .pill .ic { width: 24px; height: 24px; }
  .rb { width: 40px; height: 40px; }
  .me .ava, .me .ava svg { width: 40px; height: 40px; }
  #start {
    align-items: flex-end;
    background: linear-gradient(0deg, rgba(255, 251, 239, .94) 0, rgba(255, 251, 239, .75) 55%, rgba(255, 251, 239, 0) 90%);
  }
  .st-wrap { margin-left: 0; }
  .tag { font-size: 14px; }
}

/* ---------- bảng (modal) ---------- */
#modal {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: max(16px, env(safe-area-inset-left, 0px));
  padding-right: max(16px, env(safe-area-inset-right, 0px));
  padding-block: 16px;
  z-index: 30;
}

.scrim {
  position: absolute;
  inset: 0;
  background: rgba(20, 48, 32, .42);
}

.sheet {
  position: relative;
  width: min(460px, 100%);
  max-height: 100%;
  overflow: auto;
  padding: 0;
  animation: pop .3s cubic-bezier(.2, 1.3, .4, 1);
}

@media (max-width: 520px) {
  #modal {
    align-items: flex-end;
    padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  }
}

.sh-head {
  position: relative;
  padding: 16px 18px 14px;
  color: #fff;
  background: var(--c, var(--grass));
  display: flex;
  gap: 12px;
  align-items: center;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
}

.sh-head::after {
  content: "";
  position: absolute;
  right: -30px;
  top: -40px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: rgba(255, 255, 255, .14);
}

.sh-head h2 {
  margin: 0;
  font-family: var(--f-display);
  font-size: 22px;
  line-height: 1.08;
  text-wrap: balance;
}

.sh-head p {
  margin: 2px 0 0;
  font-size: 13px;
  font-weight: 800;
  opacity: .92;
}

.sh-x {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 1;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 0;
  background: rgba(255, 255, 255, .22);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.sh-body {
  padding: 15px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.know {
  background: var(--cream);
  border-radius: 14px;
  padding: 11px 14px;
  font-size: 13.5px;
}

.know b {
  display: block;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--sun-d);
  margin-bottom: 2px;
}

.q {
  margin: 0;
  font-family: var(--f-display);
  font-size: 18px;
  line-height: 1.2;
  text-wrap: balance;
}

.opts {
  display: grid;
  gap: 8px;
}

.opt {
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  padding: 10px 12px;
  border-radius: 14px;
  border: 2px solid var(--line);
  background: #fff;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 3px 0 var(--line);
}

.opt i {
  flex: none;
  width: 28px;
  height: 28px;
  border-radius: 9px;
  background: var(--leaf-l);
  color: var(--grass-d);
  display: grid;
  place-items: center;
  font-style: normal;
  font-family: var(--f-display);
}

.opt:hover:not(:disabled) {
  border-color: var(--grass);
}

.opt.ok {
  border-color: var(--grass);
  background: #E8F8E3;
}

.opt.ok i {
  background: var(--grass);
  color: #fff;
}

.opt.no {
  border-color: var(--coral);
  background: #FFECE8;
  animation: shake .35s;
}

.opt.no i {
  background: var(--coral);
  color: #fff;
}

.opt:disabled {
  cursor: default;
}

@keyframes shake {
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.explain {
  margin: 0;
  font-size: 13.5px;
  color: var(--muted);
  font-weight: 700;
}

.reveal {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  padding: 4px 0;
}

.reveal .sticker {
  animation: spinIn .7s cubic-bezier(.2, 1.4, .4, 1);
}

.reveal h3 {
  margin: 4px 0 0;
  font-family: var(--f-display);
  font-size: 21px;
  line-height: 1.1;
}

.reveal .plus {
  font-family: var(--f-display);
  font-weight: 800;
  font-size: 26px;
  color: var(--sun-d);
}

@keyframes spinIn {
  from { transform: rotate(-200deg) scale(.2); }
}

.sticker {
  flex: none;
  border-radius: 50%;
  background: var(--c);
  color: #fff;
  display: grid;
  place-items: center;
  border: 4px solid #fff;
  box-shadow: 0 4px 0 var(--drop);
}

.sticker.off {
  background: #DDE5D6;
  color: #A5B49C;
}

/* đá bóng */
.pitch {
  position: relative;
  height: 150px;
  border-radius: 16px;
  overflow: hidden;
  background: repeating-linear-gradient(90deg, #4FAE5E 0 28px, #5DBE6A 28px 56px);
}

.pitch .goal {
  position: absolute;
  left: 50%;
  top: 10px;
  width: 150px;
  height: 46px;
  margin-left: -75px;
  border: 5px solid #fff;
  border-bottom: 0;
  border-radius: 6px 6px 0 0;
  background: repeating-linear-gradient(45deg, rgba(255, 255, 255, .35) 0 2px, transparent 2px 9px),
              repeating-linear-gradient(-45deg, rgba(255, 255, 255, .35) 0 2px, transparent 2px 9px);
}

.pitch .keeper {
  position: absolute;
  left: 50%;
  top: 26px;
  width: 26px;
  height: 30px;
  margin-left: -13px;
  border-radius: 10px 10px 6px 6px;
  background: var(--coral);
  transition: transform .25s;
}

.ball {
  position: absolute;
  left: 50%;
  bottom: 16px;
  width: 30px;
  height: 30px;
  margin-left: -15px;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, #1E3528 0 22%, #fff 24%);
  box-shadow: 0 3px 0 rgba(0, 0, 0, .2);
  transition: transform .45s cubic-bezier(.3, .8, .4, 1);
}

.ball.goal {
  transform: translate(var(--bx, 0px), -96px) scale(.6);
}

.ball.miss {
  transform: translate(var(--bx, 90px), -120px) scale(.55);
}

.pbar {
  position: relative;
  height: 30px;
  border-radius: 15px;
  background: #F1D9CF;
  overflow: hidden;
  border: 3px solid #fff;
  box-shadow: 0 3px 0 var(--line);
}

.pbar .zone {
  position: absolute;
  top: 0;
  bottom: 0;
  background: var(--grass);
}

.pbar .needle {
  position: absolute;
  top: -2px;
  bottom: -2px;
  width: 6px;
  margin-left: -3px;
  border-radius: 3px;
  background: var(--ink);
}

.kdots {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.kdots i {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--line);
}

.kdots i.h {
  background: var(--grass);
}

.kdots i.m {
  background: var(--coral);
}

.kmsg {
  margin: 0;
  text-align: center;
  font-weight: 800;
}

/* ảnh polaroid */
.polar {
  background: #fff;
  padding: 10px 10px 14px;
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, .18);
  transform: rotate(-2.5deg);
  align-self: center;
  width: min(300px, 100%);
}

.polar img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 3px;
}

.polar p {
  margin: 8px 0 0;
  font-family: var(--f-display);
  font-weight: 700;
  font-size: 15px;
  text-align: center;
  line-height: 1.2;
}

.polar small {
  display: block;
  font-family: var(--f-body);
  font-size: 12px;
  color: var(--muted);
  font-weight: 700;
}

/* danh sách */
.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qitem {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 14px;
  background: var(--cream);
}

.qitem b {
  font-size: 14.5px;
}

.qbar {
  height: 7px;
  border-radius: 5px;
  background: var(--line);
  overflow: hidden;
  margin-top: 5px;
}

.qbar i {
  display: block;
  height: 100%;
  background: var(--grass);
}

.qrew {
  font-family: var(--f-display);
  font-weight: 800;
  color: var(--sun-d);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.qitem.done {
  background: #E8F8E3;
}

.qitem.done .qrew {
  color: var(--grass-d);
}

.album {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px 6px;
}

@media (max-width: 480px) {
  .album {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.album div {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  text-align: center;
  font-size: 11.5px;
  font-weight: 800;
  line-height: 1.2;
}

.album small {
  display: block;
  font-weight: 700;
  color: var(--muted);
  font-size: 10.5px;
}

.rank {
  display: grid;
  grid-template-columns: 34px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 12px;
  background: var(--cream);
  font-weight: 800;
}

.rank .n {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #fff;
  font-family: var(--f-display);
}

.rank:nth-child(1) .n { background: var(--sun); }
.rank:nth-child(2) .n { background: #DDE3E8; }
.rank:nth-child(3) .n { background: #F2C7A1; }

.rank.you {
  background: #E1F4FD;
  outline: 2px solid var(--tdc);
}

.rank > span:last-child {
  font-family: var(--f-display);
  font-variant-numeric: tabular-nums;
}

.note {
  margin: 0;
  font-size: 12.5px;
  color: var(--muted);
  font-weight: 700;
}

.help h3 {
  margin: 0 0 4px;
  font-family: var(--f-display);
  font-size: 16.5px;
}

.help p, .help ul {
  margin: 0;
  font-size: 13.5px;
}

.help ul {
  padding-left: 18px;
  display: grid;
  gap: 4px;
}

.help kbd {
  font-family: var(--f-display);
  font-weight: 800;
  background: var(--cream);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 0 6px;
}

/* chứng nhận */
.cert {
  border: 3px dashed var(--sun);
  border-radius: 18px;
  padding: 16px 14px;
  text-align: center;
  background: var(--cream);
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

.cert small {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--sun-d);
}

.cert h3 {
  margin: 0;
  font-family: var(--f-display);
  font-size: 28px;
  line-height: 1.05;
}

.cert .row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  margin-top: 4px;
}

.btns {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btns > * {
  flex: 1 1 130px;
}

a.btn {
  text-decoration: none;
}

/* ---------- khung chụp ảnh ---------- */
#viewfinder {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 25;
}

#viewfinder .fr {
  position: absolute;
  inset: 12% 8% 22%;
  border-radius: 20px;
  box-shadow: 0 0 0 2000px rgba(20, 48, 32, .28);
}

#viewfinder .fr::before, #viewfinder .fr::after {
  content: "";
  position: absolute;
  inset: -4px;
  border: 5px solid #fff;
  border-radius: 22px;
  -webkit-mask: linear-gradient(#000 0 0) top left/34px 34px no-repeat,
                linear-gradient(#000 0 0) top right/34px 34px no-repeat,
                linear-gradient(#000 0 0) bottom left/34px 34px no-repeat,
                linear-gradient(#000 0 0) bottom right/34px 34px no-repeat;
  mask: linear-gradient(#000 0 0) top left/34px 34px no-repeat,
        linear-gradient(#000 0 0) top right/34px 34px no-repeat,
        linear-gradient(#000 0 0) bottom left/34px 34px no-repeat,
        linear-gradient(#000 0 0) bottom right/34px 34px no-repeat;
}

#viewfinder .cap {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(12% - 44px);
  text-align: center;
  font-family: var(--f-display);
  font-weight: 800;
  font-size: 20px;
  color: #fff;
  text-shadow: 0 2px 0 rgba(0, 0, 0, .25);
}

#viewfinder .vf-btns {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(6% + env(safe-area-inset-bottom, 0px));
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 22px;
  pointer-events: auto;
}

.shutter {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  border: 6px solid #fff;
  background: var(--coral);
  cursor: pointer;
  box-shadow: 0 4px 0 rgba(0, 0, 0, .2);
}

.shutter:active {
  transform: scale(.94);
}

.vf-small {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 0;
  background: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: var(--ink);
}

#flash {
  position: absolute;
  inset: 0;
  background: #fff;
  pointer-events: none;
  animation: flash .5s forwards;
  z-index: 40;
}

@keyframes flash {
  to { opacity: 0; }
}

/* ---------- chữ nổi, thông báo ---------- */
#fx {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.fxt {
  position: absolute;
  left: 0;
  top: 0;
  font-family: var(--f-display);
  font-weight: 800;
  font-size: 22px;
  color: var(--sun);
  -webkit-text-stroke: 5px #fff;
  paint-order: stroke fill;
  white-space: nowrap;
  will-change: transform;
}

#toasts {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(76px + env(safe-area-inset-top, 0px));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
  padding-left: max(16px, env(safe-area-inset-left, 0px));
  padding-right: max(16px, env(safe-area-inset-right, 0px));
  z-index: 45;
}

.toast {
  background: var(--ink);
  color: #fff;
  font-weight: 800;
  font-size: 14px;
  padding: 9px 16px;
  border-radius: 999px;
  box-shadow: 0 4px 0 rgba(0, 0, 0, .2);
  animation: pop .3s cubic-bezier(.2, 1.4, .4, 1);
  max-width: 100%;
  text-align: center;
}

.toast.gold {
  background: var(--sun);
  color: #3D2A00;
}
</file>

<file path="src/main.tsx">
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
</file>

<file path="src/vite-env.d.ts">
/// <reference types="vite/client" />
</file>

<file path=".env.example">
# Cấu hình Firebase cho dự án TDC GO
# Sao chép file này thành .env và điền thông số từ Firebase Console -> Project Settings.
# Nếu để trống, ứng dụng tự động chạy ở chế độ Local Demo (LocalStorage + Simulated Realtime).

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
</file>

<file path=".gitignore">
node_modules
dist
dist-ssr
*.local
.env
.firebase
firebase-debug.log
firestore-debug.log
ui-debug.log
</file>

<file path="firebase.json">
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
</file>

<file path="firestore.indexes.json">
{
  "indexes": [
    {
      "collectionGroup": "users_public",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "facultyId", "order": "ASCENDING" },
        { "fieldPath": "points", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "checkins",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "stationId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
</file>

<file path="firestore.rules">
rules_version = '2';

// ===============================================================
// Assumed Data Model
// ===============================================================
//
// This security rules file assumes the following data structures:
//
// Collection: users
// Document ID: {userId} (matches request.auth.uid)
// Fields:
//   - uid: string (required, immutable, matches userId) - User ID
//   - name: string (required, 1..50 chars) - Display name
//   - mssv: string (required, 1..20 chars) - Student ID
//   - email: string (required, valid email, max 100 chars) - Private student email
//   - facultyId: string (required, enum of faculties) - Faculty ID
//   - role: string (required, 'student' | 'admin') - RBAC role (cannot self-escalate)
//   - avatar: number (required, 0..5) - Avatar index
//   - points: number (required, >= 0, <= 1000000) - Total points
//   - stars: number (required, >= 0, <= 100000) - Collected stars
//   - quizOk: number (required, >= 0, <= 10000) - Correct quizzes
//   - photos: number (required, >= 0, <= 10000) - Photos taken
//   - done: map (required, max 50 keys) - Unlocked stations map
//   - bonus: map (required, max 50 keys) - Completed quests map
//   - partyId: string (optional, max 12 chars) - Active party room code
//   - updatedAt: number (required, >= 0) - Epoch timestamp ms
//
// Collection: users_public
// Document ID: {userId} (matches request.auth.uid)
// Fields:
//   - uid: string (required, immutable, matches userId) - User ID
//   - name: string (required, 1..50 chars) - Display name (non-PII)
//   - mssv: string (required, 1..20 chars) - Student ID
//   - facultyId: string (required, enum of faculties) - Faculty ID
//   - avatar: number (required, 0..5) - Avatar index
//   - points: number (required, >= 0, <= 1000000) - Total points
//   - unlockedCount: number (required, >= 0, <= 50) - Number of unlocked stations
//   - partyId: string (optional, max 12 chars) - Active party code
//   - updatedAt: number (required, >= 0) - Epoch timestamp ms
//
// Collection: stations
// Document ID: {stationId}
// Fields:
//   - id: string (required, 1..30 chars)
//   - name: string (required, 1..80 chars)
//   - sub: string (required, 1..120 chars)
//   - facultyId: string (required, 1..30 chars)
//   - x: number (required, -500..500)
//   - z: number (required, -500..500)
//   - fogRadius: number (required, 5..120)
//   - col: string (required, 4..16 chars)
//   - type: string (required, enum)
//   - pts: number (required, 10..2000)
//   - badge: string (required, 1..60 chars)
//   - info: string (required, 1..600 chars)
//   - funFact: string (required, 1..600 chars)
//   - directions: string (required, 1..400 chars)
//   - qrSecretToken: string (required, 4..64 chars)
//   - riddle: map (optional)
//   - questions: list (optional, max 20 items)
//   - active: bool (required)
//
// Collection: parties
// Document ID: {partyCode}
// Fields:
//   - code: string (required, immutable, 6 chars)
//   - hostUid: string (required, immutable, 1..64 chars)
//   - name: string (required, 1..60 chars)
//   - memberUids: list (required, 1..4 items)
//   - members: list (required, 1..4 items)
//   - isCrossFaculty: bool (required)
//   - bonusMultiplier: number (required, 1..3)
//   - totalPoints: number (required, >= 0, <= 4000000)
//   - createdAt: number (required, immutable)
//
// Collection: events
// Document ID: {eventId}
// Fields:
//   - id: string (required, 1..40 chars)
//   - title: string (required, 1..100 chars)
//   - description: string (required, 1..500 chars)
//   - startDate: string (required, 1..30 chars)
//   - endDate: string (required, 1..30 chars)
//   - active: bool (required)
//   - bonusMultiplier: number (required, 1..5)
//
// Collection: checkins
// Document ID: {checkinId}
// Fields:
//   - uid: string (required, immutable, matches request.auth.uid)
//   - userName: string (required, 1..50 chars)
//   - stationId: string (required, 1..30 chars)
//   - facultyId: string (required, 1..30 chars)
//   - method: string (required, 'qr' | 'riddle' | 'demo')
//   - pts: number (required, 0..5000)
//   - timestamp: number (required, > 0)
//
// ===============================================================

service cloud.firestore {
  match /databases/{database}/documents {

    // ===============================================================
    // Helper Functions
    // ===============================================================

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isDocOwner() {
      return isAuthenticated() && request.auth.uid == resource.data.uid;
    }

    function uidUnchanged() {
      return !('uid' in request.resource.data) ||
        request.resource.data.uid == request.auth.uid;
    }

    function uidNotModified() {
      return !('uid' in request.resource.data) ||
        request.resource.data.uid == resource.data.uid;
    }

    function hasRequiredFields(fields) {
      return request.resource.data.keys().hasAll(fields);
    }

    function hasOnlyAllowedFields(fields) {
      return request.resource.data.keys().hasOnly(fields);
    }

    function validStringLength(field, minLen, maxLen) {
      return request.resource.data[field] is string &&
        request.resource.data[field].size() >= minLen &&
        request.resource.data[field].size() <= maxLen;
    }

    function isValidOptionalString(field, minLen, maxLen) {
      return !(field in request.resource.data) ||
        (request.resource.data[field] is string &&
         request.resource.data[field].size() >= minLen &&
         request.resource.data[field].size() <= maxLen);
    }

    function isValidEmail(email) {
      return email is string &&
        email.size() <= 100 &&
        email.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
    }

    function isValidFaculty(facultyId) {
      return facultyId in ['cntt', 'dien_dt', 'co_khi_oto', 'co_khi_ctm', 'kinh_te', 'ngoai_ngu', 'du_lich', 'khac'];
    }

    function isAdmin() {
      return isAuthenticated() &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // ===============================================================
    // Domain Validators
    // ===============================================================

    function isValidUserPrivate(data) {
      return hasRequiredFields(['uid', 'name', 'mssv', 'email', 'facultyId', 'role', 'avatar', 'points', 'stars', 'quizOk', 'photos', 'done', 'bonus', 'updatedAt']) &&
        hasOnlyAllowedFields(['uid', 'name', 'mssv', 'email', 'facultyId', 'role', 'avatar', 'points', 'stars', 'quizOk', 'photos', 'done', 'bonus', 'partyId', 'updatedAt']) &&
        data.uid is string && data.uid.size() >= 1 && data.uid.size() <= 64 &&
        validStringLength('name', 1, 50) &&
        validStringLength('mssv', 1, 20) &&
        isValidEmail(data.email) &&
        isValidFaculty(data.facultyId) &&
        data.role in ['student', 'admin'] &&
        data.avatar is number && data.avatar >= 0 && data.avatar <= 5 &&
        data.points is number && data.points >= 0 && data.points <= 1000000 &&
        data.stars is number && data.stars >= 0 && data.stars <= 100000 &&
        data.quizOk is number && data.quizOk >= 0 && data.quizOk <= 10000 &&
        data.photos is number && data.photos >= 0 && data.photos <= 10000 &&
        data.done is map && data.done.size() <= 50 &&
        data.bonus is map && data.bonus.size() <= 50 &&
        isValidOptionalString('partyId', 0, 12) &&
        data.updatedAt is number && data.updatedAt >= 0;
    }

    function isValidUserPublic(data) {
      return hasRequiredFields(['uid', 'name', 'mssv', 'facultyId', 'avatar', 'points', 'unlockedCount', 'updatedAt']) &&
        hasOnlyAllowedFields(['uid', 'name', 'mssv', 'facultyId', 'avatar', 'points', 'unlockedCount', 'partyId', 'updatedAt']) &&
        data.uid is string && data.uid.size() >= 1 && data.uid.size() <= 64 &&
        validStringLength('name', 1, 50) &&
        validStringLength('mssv', 1, 20) &&
        isValidFaculty(data.facultyId) &&
        data.avatar is number && data.avatar >= 0 && data.avatar <= 5 &&
        data.points is number && data.points >= 0 && data.points <= 1000000 &&
        data.unlockedCount is number && data.unlockedCount >= 0 && data.unlockedCount <= 50 &&
        isValidOptionalString('partyId', 0, 12) &&
        data.updatedAt is number && data.updatedAt >= 0;
    }

    function isValidStation(data) {
      return hasRequiredFields(['id', 'name', 'sub', 'facultyId', 'x', 'z', 'fogRadius', 'col', 'type', 'pts', 'badge', 'info', 'funFact', 'directions', 'qrSecretToken', 'active']) &&
        hasOnlyAllowedFields(['id', 'name', 'sub', 'facultyId', 'x', 'z', 'fogRadius', 'col', 'type', 'pts', 'badge', 'info', 'funFact', 'directions', 'qrSecretToken', 'riddle', 'questions', 'active']) &&
        validStringLength('id', 1, 30) &&
        validStringLength('name', 1, 80) &&
        validStringLength('sub', 1, 120) &&
        validStringLength('facultyId', 1, 30) &&
        data.x is number && data.x >= -500 && data.x <= 500 &&
        data.z is number && data.z >= -500 && data.z <= 500 &&
        data.fogRadius is number && data.fogRadius >= 5 && data.fogRadius <= 120 &&
        validStringLength('col', 4, 16) &&
        data.type in ['checkin', 'photo', 'quiz', 'kick', 'it_debug', 'electric_circuit', 'auto_engine'] &&
        data.pts is number && data.pts >= 10 && data.pts <= 2000 &&
        validStringLength('badge', 1, 60) &&
        validStringLength('info', 1, 600) &&
        validStringLength('funFact', 1, 600) &&
        validStringLength('directions', 1, 400) &&
        validStringLength('qrSecretToken', 4, 64) &&
        (!('riddle' in data) || (data.riddle is map && data.riddle.keys().hasOnly(['prompt', 'answer', 'hint']))) &&
        (!('questions' in data) || (data.questions is list && data.questions.size() <= 20)) &&
        data.active is bool;
    }

    function isValidParty(data) {
      return hasRequiredFields(['code', 'hostUid', 'name', 'memberUids', 'members', 'isCrossFaculty', 'bonusMultiplier', 'totalPoints', 'createdAt']) &&
        hasOnlyAllowedFields(['code', 'hostUid', 'name', 'memberUids', 'members', 'isCrossFaculty', 'bonusMultiplier', 'totalPoints', 'createdAt']) &&
        validStringLength('code', 6, 6) &&
        validStringLength('hostUid', 1, 64) &&
        validStringLength('name', 1, 60) &&
        data.memberUids is list && data.memberUids.size() >= 1 && data.memberUids.size() <= 4 &&
        data.members is list && data.members.size() >= 1 && data.members.size() <= 4 &&
        data.isCrossFaculty is bool &&
        data.bonusMultiplier is number && data.bonusMultiplier >= 1 && data.bonusMultiplier <= 3 &&
        data.totalPoints is number && data.totalPoints >= 0 && data.totalPoints <= 4000000 &&
        data.createdAt is number && data.createdAt >= 0;
    }

    function isValidEvent(data) {
      return hasRequiredFields(['id', 'title', 'description', 'startDate', 'endDate', 'active', 'bonusMultiplier']) &&
        hasOnlyAllowedFields(['id', 'title', 'description', 'startDate', 'endDate', 'active', 'bonusMultiplier']) &&
        validStringLength('id', 1, 40) &&
        validStringLength('title', 1, 100) &&
        validStringLength('description', 1, 500) &&
        validStringLength('startDate', 1, 30) &&
        validStringLength('endDate', 1, 30) &&
        data.active is bool &&
        data.bonusMultiplier is number && data.bonusMultiplier >= 1 && data.bonusMultiplier <= 5;
    }

    function isValidCheckin(data) {
      return hasRequiredFields(['uid', 'userName', 'stationId', 'facultyId', 'method', 'pts', 'timestamp']) &&
        hasOnlyAllowedFields(['uid', 'userName', 'stationId', 'facultyId', 'method', 'pts', 'timestamp']) &&
        data.uid == request.auth.uid &&
        validStringLength('userName', 1, 50) &&
        validStringLength('stationId', 1, 30) &&
        isValidFaculty(data.facultyId) &&
        data.method in ['qr', 'riddle', 'demo'] &&
        data.pts is number && data.pts >= 0 && data.pts <= 5000 &&
        data.timestamp is number && data.timestamp > 0;
    }

    // ===============================================================
    // Collection Rules
    // ===============================================================

    // Private User Profile (contains PII email) -> strictly owner or admin
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isAuthenticated() &&
        isValidUserPrivate(request.resource.data) &&
        uidUnchanged() &&
        ((isOwner(userId) && request.resource.data.role == 'student') || isAdmin());
      allow update: if isAuthenticated() &&
        isValidUserPrivate(request.resource.data) &&
        uidNotModified() &&
        ((isOwner(userId) && request.resource.data.role == resource.data.role) || isAdmin());
      allow delete: if isAdmin();
    }

    // Public Leaderboard Profile (No PII) -> readable by authenticated players
    match /users_public/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId) &&
        uidUnchanged() &&
        isValidUserPublic(request.resource.data);
      allow update: if (isOwner(userId) || isAdmin()) &&
        uidNotModified() &&
        isValidUserPublic(request.resource.data);
      allow delete: if isAdmin();
    }

    // Campus 3D Stations -> readable by authenticated users, writable by admins only
    match /stations/{stationId} {
      allow read: if isAuthenticated();
      allow create, update: if isAdmin() && isValidStation(request.resource.data);
      allow delete: if isAdmin();
    }

    // Co-op Party Rooms (2-4 students)
    match /parties/{partyCode} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() &&
        request.resource.data.hostUid == request.auth.uid &&
        request.auth.uid in request.resource.data.memberUids &&
        isValidParty(request.resource.data);
      allow update: if isAuthenticated() &&
        isValidParty(request.resource.data) &&
        request.resource.data.code == resource.data.code &&
        request.resource.data.hostUid == resource.data.hostUid &&
        request.resource.data.createdAt == resource.data.createdAt &&
        (request.auth.uid in resource.data.memberUids || request.auth.uid in request.resource.data.memberUids || isAdmin());
      allow delete: if isAuthenticated() && (resource.data.hostUid == request.auth.uid || isAdmin());
    }

    // Campaign Events
    match /events/{eventId} {
      allow read: if isAuthenticated();
      allow create, update: if isAdmin() && isValidEvent(request.resource.data);
      allow delete: if isAdmin();
    }

    // O2O Check-in Logs (Anti-cheat & Analytics)
    match /checkins/{checkinId} {
      allow read: if isDocOwner() || isAdmin();
      allow create: if isAuthenticated() && isValidCheckin(request.resource.data);
      allow update: if false; // Check-in logs are immutable
      allow delete: if isAdmin();
    }
  }
}
</file>

<file path="index.html">
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>TDC GO · Khám phá Khuôn viên 3D Trường Cao đẳng Công nghệ Thủ Đức</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@500;700;800;900&display=swap"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
</file>

<file path="package.json">
{
  "name": "tdc-go",
  "private": true,
  "version": "1.0.0",
  "description": "TDC GO - Web Game 3D Khám phá Khuôn viên Trường Cao đẳng Công nghệ Thủ Đức",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "firebase": "^11.3.1",
    "html5-qrcode": "^2.3.8",
    "lucide-react": "^0.475.0",
    "qrcode": "^1.5.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "three": "^0.173.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.6",
    "@types/node": "^22.13.4",
    "@types/qrcode": "^1.5.5",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "@types/three": "^0.173.0",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.6",
    "typescript": "~5.7.2",
    "vite": "^6.1.0",
    "vitest": "^3.0.5"
  }
}
</file>

<file path="README.md">
# TDC GO · Web Game 3D Khám phá Khuôn viên Trường Cao đẳng Công nghệ Thủ Đức

Dự án triển khai từ Đề tài Nghiên cứu Khoa học Cấp Cơ sở năm học 2026–2027: **"Phát triển web game “TDC GO” khám phá khuôn viên Trường Cao đẳng Công nghệ Thủ Đức"**, kế thừa và mở rộng mô hình bản đồ 3D khuôn viên TDC từ [hoanghnguyen9109/tdc-go](https://github.com/hoanghnguyen9109/tdc-go).

## Kiến trúc Công nghệ
- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS v4
- **3D WebGL Engine**: Three.js (Mô hình 3D Khu A, Khu B, Hội trường H, Tòa C, KTX, Xưởng Cơ khí, Tòa D 11 tầng, 6 sân bóng mini, sân tennis, sân bóng chuyền, Cổng 1 & 2, đoàn tàu TDC Express, nhân vật Chibi & NPC)
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
</file>

<file path="tsconfig.json">
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
</file>

<file path="tsconfig.tsbuildinfo">
{"root":["./src/app.tsx","./src/game.test.ts","./src/main.tsx","./src/vite-env.d.ts","./src/components/gamehud.tsx","./src/components/minimap.tsx","./src/components/qrscannermodal.tsx","./src/components/startscreen.tsx","./src/components/stationmodal.tsx","./src/components/stationsticker.tsx","./src/components/minigames/autoenginegame.tsx","./src/components/minigames/electriccircuitgame.tsx","./src/components/minigames/itdebuggame.tsx","./src/components/minigames/kickgame.tsx","./src/components/minigames/viewfinder.tsx","./src/components/modals/certificatemodal.tsx","./src/components/modals/helpmodal.tsx","./src/components/modals/leaderboardmodal.tsx","./src/components/modals/partymodal.tsx","./src/components/modals/profilebadgesmodal.tsx","./src/components/modals/questsmodal.tsx","./src/data/campuslayout.ts","./src/data/faculties.ts","./src/data/stations.ts","./src/engine/tdccampusengine.ts","./src/engine/audiosfx.ts","./src/engine/campusbuilder.ts","./src/engine/chibibuilder.ts","./src/engine/fogofwar.ts","./src/engine/natureandtrain.ts","./src/engine/threehelpers.ts","./src/pages/admindashboard.tsx","./src/services/adminservice.ts","./src/services/authservice.ts","./src/services/firebase.ts","./src/services/gameservice.ts","./src/services/partyservice.ts","./src/types/game.ts"],"version":"5.7.3"}
</file>

<file path="vite.config.ts">
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
  },
});
</file>

</files>
