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
