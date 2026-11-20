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
