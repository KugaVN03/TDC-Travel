import * as THREE from 'three';
import { CAMP, LAKE, PATHS, ROADS, ZONES } from '../data/campusLayout';
import { Station } from '../types/game';
import { AABB, ell, heightAt, segDist } from './threeHelpers';

export interface NatureAndTrainState {
  clouds: THREE.Group[];
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

  const animate = (dt: number) => {
    clouds.forEach((c, i) => {
      c.position.x += dt * (2 + (i % 3));
      if (c.position.x > 520) c.position.x = -520;
    });
  };

  return { clouds, animate };
}
