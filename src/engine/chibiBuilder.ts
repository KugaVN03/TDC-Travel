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
