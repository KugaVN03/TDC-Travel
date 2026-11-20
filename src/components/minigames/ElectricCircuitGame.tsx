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
