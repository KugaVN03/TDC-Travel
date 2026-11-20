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
