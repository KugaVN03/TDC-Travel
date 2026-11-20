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
