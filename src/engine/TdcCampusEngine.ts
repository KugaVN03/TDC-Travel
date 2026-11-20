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
    const countChanged = stations.length !== this.stations.length;
    this.stations = stations;
    this.unlockedMap = unlocked;

    if (countChanged) {
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
    this.resizeObs.disconnect();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
