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
