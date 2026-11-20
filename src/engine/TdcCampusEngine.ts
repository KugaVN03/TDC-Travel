import * as THREE from 'three';
import { AVATARS } from '../data/campusLayout';
import { GpsTelemetry3D, Station, UnlockedStationRecord } from '../types/game';
import { audioSfx } from './audioSfx';
import { buildCampusEnvironment, FloorHighlightController } from './campusBuilder';
import { animChibi, makeChibi } from './chibiBuilder';
import { FogOfWarSystem } from './fogOfWar';
import { buildNatureAndTrain } from './natureAndTrain';
import {
  AABB,
  canvasTex,
  clamp,
  coinTex,
  createMaterialCache,
  createRng,
  FH,
  lerpAngle,
  mesh,
  pill,
} from './threeHelpers';
import {
  buildTelemetryFromCampus3D,
  clampToCampusBoundary,
  detectBuildingAtPosition,
  distance3D,
  floorToElevationMeters,
  GpsKalmanFilter3D,
  gpsToCampus3D,
  resolveFloorFromElevation,
} from '../services/gpsService';
import { TDC_GEO_ANCHORS } from '../data/campusBuildings';

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
  horizDistance: number;
  deltaFloor: number;
  angleRad: number;
  allDone: boolean;
}

export interface MinimapSnapshot {
  playerX: number;
  playerY: number;
  playerZ: number;
  playerFloor: number;
  accuracyMeters: number;
  playerRotY: number;
  camYaw: number;
  col: AABB[];
}

export interface EngineCallbacks {
  onNearStationChange: (st: Station | null) => void;
  onOpenStationRequest: (st: Station) => void;
  onPlayerMoveSave: (pos: [number, number, number]) => void;
  onFloatingTextsUpdate: (items: FloatingTextItem[]) => void;
  onGuideUpdate: (guide: GuideState) => void;
  onMinimapUpdate: (snap: MinimapSnapshot) => void;
  onGpsTelemetryUpdate?: (telemetry: GpsTelemetry3D) => void;
}

interface Station3DNode {
  g: THREE.Group;
  ring: THREE.Mesh;
  disc: THREE.Mesh;
  beam: THREE.Mesh;
  stem: THREE.Line | null;
  icon: THREE.Sprite;
  lab: THREE.Sprite;
  baseY: number;
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
  private floorController?: FloorHighlightController;

  private stations: Station[] = [];
  private unlockedMap: Record<string, UnlockedStationRecord> = {};
  private st3d: Record<string, Station3DNode> = {};
  private parts: { m: THREE.Mesh; v: THREE.Vector3; life: number }[] = [];
  private fxList: {
    id: number;
    text: string;
    p: THREE.Vector3;
    life: number;
    color?: string;
  }[] = [];
  private fxSeq = 1;

  // Player & 3D GPS Marker (X, Y, Z)
  private player = {
    obj: null as THREE.Group | null,
    pos: new THREE.Vector3(-66, 0, 104),
    targetPos: new THREE.Vector3(-66, 0, 104),
    ph: 0,
    tag: null as THREE.Sprite | null,
    gpsAccuracyDisc: null as THREE.Mesh | null,
    gpsVerticalLine: null as THREE.Line | null,
    gpsGroundShadowRing: null as THREE.Mesh | null,
  };

  // Real-time 3-Axis GPS & Floor state
  private kalman = new GpsKalmanFilter3D();
  private gpsWatchId: number | null = null;
  private gpsActive = false;
  private groundAltitudeRefAsl = TDC_GEO_ANCHORS.GROUND_ALTITUDE_ASL_M;
  private rawAltitudeAsl: number | null = null;
  private lockedFloor: number | null = null;
  private inspectedBuildingId: string | null = null;
  private inspectedFloor: number | null = null;
  private cutawayEnabled = false;
  private currentTelemetry: GpsTelemetry3D;

  private cam = {
    yaw: 0.25,
    pitch: 0.86,
    dist: 48,
    curD: null as number | null,
    curP: null as number | null,
    tgt: new THREE.Vector3(-5, 0, -5),
  };

  private running = false;
  private paused = false;
  private photoStation: Station | null = null;
  private nearStation: Station | null = null;
  private flagMesh: THREE.Mesh | null = null;

  private disposed = false;
  private rafId = 0;
  private resizeObs: ResizeObserver;
  private cleanupWindowListeners?: () => void;
  private animateNatureAndTrain?: (dt: number, t: number) => void;

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

    this.currentTelemetry = buildTelemetryFromCampus3D({
      x: -66,
      y: 0,
      z: 104,
      accuracyMeters: 2.4,
      source: 'gps_calibrated',
    });

    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.localClippingEnabled = true;
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
    const { flag, floorController } = buildCampusEnvironment({
      scene: this.scene,
      col: this.col,
      mat: this.mat,
      rng: this.rng,
    });
    this.flagMesh = flag;
    this.floorController = floorController;

    const nat = buildNatureAndTrain({
      scene: this.scene,
      col: this.col,
      stations: this.stations,
      mat: this.mat,
      rng: this.rng,
    });
    this.animateNatureAndTrain = nat.animate;

    // Build 3D station markers (at X, Y, Z elevation) & Fog of War
    this.rebuildStations3D();

    // GPS Accuracy Sphere/Disc & 3-Axis Z-Elevation Drop Line
    const accDisc = new THREE.Mesh(
      new THREE.CircleGeometry(1, 36).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        color: '#00AEEF',
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    accDisc.position.y = 0.14;
    accDisc.visible = false;
    this.scene.add(accDisc);
    this.player.gpsAccuracyDisc = accDisc;

    const shadowRing = new THREE.Mesh(
      new THREE.RingGeometry(1.1, 1.55, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        color: '#00F0FF',
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    shadowRing.position.y = 0.15;
    shadowRing.visible = false;
    this.scene.add(shadowRing);
    this.player.gpsGroundShadowRing = shadowRing;

    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1, 0),
    ]);
    const vertLine = new THREE.Line(
      lineGeo,
      new THREE.LineBasicMaterial({ color: '#00F0FF', transparent: true, opacity: 0.9 })
    );
    vertLine.visible = false;
    this.scene.add(vertLine);
    this.player.gpsVerticalLine = vertLine;

    // Celebration particles
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
        const baseY = st.y || 0;
        const g = new THREE.Group();
        g.position.set(st.x, baseY, st.z);
        this.scene.add(g);

        const ring = new THREE.Mesh(
          new THREE.RingGeometry(2.6, 3.3, 40).rotateX(-Math.PI / 2),
          new THREE.MeshBasicMaterial({
            color: st.col,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
          })
        );
        ring.position.y = 0.16;
        g.add(ring);

        const disc = new THREE.Mesh(
          new THREE.CircleGeometry(2.6, 40).rotateX(-Math.PI / 2),
          new THREE.MeshBasicMaterial({
            color: st.col,
            transparent: true,
            opacity: 0.22,
            side: THREE.DoubleSide,
          })
        );
        disc.position.y = 0.15;
        g.add(disc);

        const beam = new THREE.Mesh(
          new THREE.CylinderGeometry(1.4, 2.2, 20, 20, 1, true),
          new THREE.MeshBasicMaterial({
            color: st.col,
            map: beamT,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            opacity: 0.55,
          })
        );
        beam.position.y = 10;
        g.add(beam);

        // Nếu trạm nằm ở tầng cao (baseY > 0.5) hoặc tầng hầm (baseY < -0.5), vẽ trục đứng nối xuống mặt đất
        let stem: THREE.Line | null = null;
        if (Math.abs(baseY) > 0.5) {
          const stemGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -baseY, 0),
            new THREE.Vector3(0, 0.2, 0),
          ]);
          stem = new THREE.Line(
            stemGeo,
            new THREE.LineBasicMaterial({ color: st.col, transparent: true, opacity: 0.75 })
          );
          g.add(stem);
        }

        const ped = mesh(
          new THREE.CylinderGeometry(0.9, 1.2, 0.8, 12),
          this.mat('#FFFFFF'),
          0,
          0.4,
          0
        );
        g.add(ped);

        const isDone = this.unlockedMap[st.id] != null;
        const icon = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: coinTex(st, isDone), transparent: true })
        );
        icon.scale.setScalar(4.6);
        icon.position.y = 5.5;
        g.add(icon);

        const floorBadge = st.floor
          ? st.floor === -1
            ? ' [Hầm B1]'
            : ` [Tầng ${st.floor}]`
          : '';
        const lab = pill(`${st.name}${floorBadge}`, { h: 2.2, dot: st.col });
        lab.position.y = 9.2;
        g.add(lab);

        this.st3d[st.id] = { g, ring, disc, beam, stem, icon, lab, baseY };
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
      .map(
        (s) =>
          `${s.id}:${s.x}:${s.y || 0}:${s.z}:${s.floor || 1}:${s.fogRadius}:${s.col}:${s.type}:${s.name}:${s.active}`
      )
      .join('|');
    const nextKey = stations
      .map(
        (s) =>
          `${s.id}:${s.x}:${s.y || 0}:${s.z}:${s.floor || 1}:${s.fogRadius}:${s.col}:${s.type}:${s.name}:${s.active}`
      )
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
    savedPos?: [number, number] | [number, number, number] | null,
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
    this.player.tag = pill(`${name || 'Bạn'} · GPS 3D`, {
      h: 1.3,
      fs: 40,
      bg: '#0F172A',
      fg: '#38BDF8',
    });
    this.player.tag.position.y = 4.0;
    this.player.obj.add(this.player.tag);
    this.scene.add(this.player.obj);

    if (savedPos && hasProgress) {
      const sx = savedPos[0];
      const sy = savedPos.length === 3 ? savedPos[1] : 0;
      const sz = savedPos.length === 3 ? savedPos[2] : savedPos[1];
      this.player.pos.set(sx, sy, sz);
      this.player.targetPos.set(sx, sy, sz);
    } else {
      this.player.pos.set(-66, 0, 102);
      this.player.targetPos.set(-66, 0, 102);
    }
    this.kalman.reset(this.player.pos.x, this.player.pos.y, this.player.pos.z);

    this.player.obj.position.copy(this.player.pos);
    this.player.obj.rotation.y = Math.PI;
    this.cam.yaw = 0;
    this.cam.tgt.set(this.player.pos.x, this.player.pos.y + 1.8, this.player.pos.z);
    this.running = true;
    this.paused = false;

    if (this.player.gpsAccuracyDisc) this.player.gpsAccuracyDisc.visible = true;
    if (this.player.gpsGroundShadowRing) this.player.gpsGroundShadowRing.visible = true;
    if (this.player.gpsVerticalLine) this.player.gpsVerticalLine.visible = true;

    this.syncTelemetryFromCurrentTarget('gps_calibrated', 2.2);
    this.startGpsHardwareTracking();
  }

  /**
   * Bật định vị GPS phần cứng thực tế theo chuẩn HTML5 Geolocation API (`enableHighAccuracy: true`)
   * Tự động tính toán 3 trục (X, Y, Z) bao gồm cả Altitude (trục cao độ phân tầng) và Kalman Filter.
   */
  public startGpsHardwareTracking(): void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }
    if (this.gpsWatchId !== null) {
      navigator.geolocation.clearWatch(this.gpsWatchId);
    }
    this.gpsActive = true;
    this.gpsWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!this.gpsActive || this.disposed) return;
        const { latitude, longitude, altitude, accuracy, altitudeAccuracy, heading, speed } =
          pos.coords;

        this.rawAltitudeAsl = altitude;
        const projected = gpsToCampus3D({
          lat: latitude,
          lng: longitude,
          altitudeAsl: altitude,
          groundAltitudeReferenceAsl: this.groundAltitudeRefAsl,
        });

        // Nếu người dùng đang đứng thực tế trong khuôn viên trường hoặc lân cận (< 450m), cập nhật vị trí GPS thực
        if (Math.hypot(projected.x, projected.z) < 450) {
          const clamped = clampToCampusBoundary(projected.x, projected.z);
          const filtered = this.kalman.filter(
            clamped.x,
            projected.y,
            clamped.z,
            accuracy || 6,
            altitudeAccuracy || 10
          );

          const bld = detectBuildingAtPosition(filtered.x, filtered.z);
          const resolved =
            this.lockedFloor !== null
              ? {
                  floor: this.lockedFloor,
                  clampedY: floorToElevationMeters(this.lockedFloor, bld),
                }
              : resolveFloorFromElevation(filtered.y, bld);

          this.player.targetPos.set(filtered.x, resolved.clampedY, filtered.z);
          this.currentTelemetry = {
            lat: +latitude.toFixed(6),
            lng: +longitude.toFixed(6),
            altitudeAsl: altitude != null ? +altitude.toFixed(2) : null,
            accuracyMeters: +(accuracy || 4.0).toFixed(1),
            altitudeAccuracyMeters:
              altitudeAccuracy != null ? +altitudeAccuracy.toFixed(1) : null,
            headingDeg: heading != null && Number.isFinite(heading) ? Math.round(heading) : null,
            speedMps: speed != null && Number.isFinite(speed) ? +speed.toFixed(2) : null,
            x: filtered.x,
            y: resolved.clampedY,
            z: filtered.z,
            detectedFloor: resolved.floor,
            detectedBuilding: bld,
            insideCampus: projected.insideCampus,
            source: 'gps_hardware',
            timestamp: Date.now(),
          };
          this.updateFloorHighlightState();
          this.callbacks.onGpsTelemetryUpdate?.(this.currentTelemetry);
        } else {
          // Người dùng đang mở web từ ngoài khuôn viên trường (> 450m): vẫn ghi nhận tọa độ GPS thật nhưng giữ mô hình ở chế độ Hiệu chuẩn Khuôn viên để khám phá
          this.currentTelemetry = {
            ...this.currentTelemetry,
            lat: +latitude.toFixed(6),
            lng: +longitude.toFixed(6),
            altitudeAsl: altitude != null ? +altitude.toFixed(2) : this.currentTelemetry.altitudeAsl,
            accuracyMeters: +(accuracy || 5.0).toFixed(1),
            insideCampus: false,
            timestamp: Date.now(),
          };
          this.callbacks.onGpsTelemetryUpdate?.(this.currentTelemetry);
        }
      },
      () => {
        // Khi thiết bị từ chối quyền GPS hoặc mất sóng trong nhà kín, giữ chế độ Định vị Hiệu chuẩn 3D
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );
  }

  /**
   * Hiệu chuẩn áp kế / cao độ mặt đất (Tare Ground Altitude = 0.0m / Tầng 1)
   * Giúp loại bỏ sai số độ cao GPS giữa các dòng điện thoại khác nhau.
   */
  public calibrateGroundZeroAltitude(): void {
    if (this.rawAltitudeAsl != null && Number.isFinite(this.rawAltitudeAsl)) {
      this.groundAltitudeRefAsl = this.rawAltitudeAsl;
    }
    this.lockedFloor = 1;
    this.setTargetPosition3D(this.player.targetPos.x, 0, this.player.targetPos.z, 'gps_calibrated');
  }

  /**
   * Đặt tọa độ 3 trục (X, Y, Z) trực tiếp từ bộ định vị GPS / Chọn Tòa nhà & Tầng để khám phá
   */
  public setTargetPosition3D(
    x: number,
    y: number,
    z: number,
    source: GpsTelemetry3D['source'] = 'gps_calibrated'
  ): void {
    const clamped = clampToCampusBoundary(x, z);
    const bld = detectBuildingAtPosition(clamped.x, clamped.z);
    const resolved = resolveFloorFromElevation(y, bld);
    const effectiveY = resolved.clampedY;

    this.lockedFloor = resolved.floor;
    this.player.targetPos.set(clamped.x, effectiveY, clamped.z);
    this.kalman.reset(clamped.x, effectiveY, clamped.z);
    this.inspectedBuildingId = bld?.id || null;
    this.inspectedFloor = resolved.floor;

    this.syncTelemetryFromCurrentTarget(source, source === 'gps_hardware' ? 3.2 : 1.5);
  }

  /**
   * Chọn tầng cụ thể (Trục cao độ Y/Z: Tầng Hầm B1 = -1, Tầng 1..11) để khám phá mặt sàn phân tầng
   */
  public selectFloorLevel(floor: number | null, enableCutaway?: boolean): void {
    this.lockedFloor = floor;
    if (enableCutaway !== undefined) {
      this.cutawayEnabled = enableCutaway;
    }
    if (floor !== null) {
      const bld = detectBuildingAtPosition(this.player.targetPos.x, this.player.targetPos.z);
      const validFloor = bld
        ? clamp(floor, bld.minFloor, bld.maxFloor)
        : clamp(floor, -1, 11);
      this.lockedFloor = validFloor;
      const nextY = floorToElevationMeters(validFloor, bld);
      this.player.targetPos.y = nextY;
      this.inspectedFloor = validFloor;
      this.inspectedBuildingId = bld?.id || null;
    } else {
      this.inspectedFloor = null;
    }
    this.syncTelemetryFromCurrentTarget('manual_override', 1.5);
  }

  /**
   * Bật / Tắt chế độ Cắt lớp Phân tầng 3D (3D Floor Cutaway) để nhìn xuyên vào bên trong tầng đang chọn
   */
  public setCutawayMode(enabled: boolean): void {
    this.cutawayEnabled = enabled;
    this.updateFloorHighlightState();
  }

  public getCutawayMode(): boolean {
    return this.cutawayEnabled;
  }

  private updateFloorHighlightState(): void {
    if (!this.floorController) return;
    const activeFloor =
      this.lockedFloor ?? this.inspectedFloor ?? this.currentTelemetry.detectedFloor;
    const activeBldId =
      this.inspectedBuildingId ?? this.currentTelemetry.detectedBuilding?.id ?? null;

    this.floorController.setFloorView(activeBldId, activeFloor, this.cutawayEnabled);
  }

  private syncTelemetryFromCurrentTarget(
    source: GpsTelemetry3D['source'],
    accuracyMeters: number
  ): void {
    this.currentTelemetry = buildTelemetryFromCampus3D({
      x: this.player.targetPos.x,
      y: this.player.targetPos.y,
      z: this.player.targetPos.z,
      accuracyMeters,
      source,
      lockedFloor: this.lockedFloor,
      groundAltitudeReferenceAsl: this.groundAltitudeRefAsl,
    });
    this.updateFloorHighlightState();
    this.callbacks.onGpsTelemetryUpdate?.(this.currentTelemetry);
  }

  public setPaused(p: boolean): void {
    this.paused = p;
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

  /**
   * Định vị / Đồng bộ ngay tới tọa độ 3D (X, Y, Z) của một trạm hoặc tòa nhà
   */
  public navigateToStation(st: Station): void {
    if (!this.running) return;
    const targetY = st.y ?? (st.floor ? floorToElevationMeters(st.floor) : 0);
    this.lockedFloor = st.floor ?? 1;
    this.setTargetPosition3D(st.x, targetY, st.z, 'gps_calibrated');
  }

  public celebrateStationUnlock(st: Station, ptsText: string): void {
    const sy = st.y || 0;
    this.burst(
      new THREE.Vector3(st.x, sy + 5, st.z),
      ['#FFD23F', '#FF6F59', '#00AEEF', '#38B865', '#FF8FB1', '#9B6BFF'],
      42
    );
    this.spawnFloatText(ptsText, new THREE.Vector3(st.x, sy + 4, st.z));
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

  private bindEvents(): void {
    // Chỉ giữ phím tắt xoay/zoom camera (+ / - / Enter mở trạm), loại bỏ hoàn toàn điều khiển nhân vật bằng WASD/click đất kiểu game giả lập
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
      if (k === '+' || k === '=') this.cam.dist = clamp(this.cam.dist * 0.85, 16, 160);
      if (k === '-') this.cam.dist = clamp(this.cam.dist / 0.85, 16, 160);
    };

    window.addEventListener('keydown', onKeyDown);
    this.cleanupWindowListeners = () => {
      window.removeEventListener('keydown', onKeyDown);
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
        this.cam.dist = clamp((this.cam.dist * pinch) / d, 16, 160);
        pinch = d;
        return;
      }
      if (!drag) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) drag.moved = true;
      if (drag.moved) {
        this.cam.yaw -= dx * 0.006;
        this.cam.pitch = clamp(this.cam.pitch + dy * 0.004, 0.25, 1.42);
      }
    });

    const endPtr = (e: PointerEvent) => {
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
        this.cam.dist = clamp(this.cam.dist * (1 + e.deltaY * 0.0012), 16, 160);
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
        this.updateGpsAvatar3D(dt, T);
        saveT -= dt;
        if (saveT <= 0) {
          saveT = 2.0;
          this.callbacks.onPlayerMoveSave([
            +this.player.pos.x.toFixed(1),
            +this.player.pos.y.toFixed(1),
            +this.player.pos.z.toFixed(1),
          ]);
        }
      } else if (this.running && this.player.obj) {
        animChibi(this.player.obj, this.player.ph, 0, T);
      }

      // Camera tracks full 3D position (X, Y, Z) so rising to Floor 7 or Floor 11 smoothly elevates camera
      let d: number;
      let p: number;
      if (this.running) {
        this.cam.tgt.lerp(
          tmpV.set(this.player.pos.x, this.player.pos.y + 1.8, this.player.pos.z),
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

  /**
   * Nội suy mượt vị trí nhân vật 3D theo tín hiệu GPS 3 trục (X, Y, Z)
   * và cập nhật bán kính sai số GPS, đường chiếu đứng từ tầng cao xuống mặt đất.
   */
  private updateGpsAvatar3D(dt: number, t: number): void {
    const dx = this.player.targetPos.x - this.player.pos.x;
    const dy = this.player.targetPos.y - this.player.pos.y;
    const dz = this.player.targetPos.z - this.player.pos.z;
    const distHoriz = Math.hypot(dx, dz);
    const dist3D = Math.hypot(dx, dy, dz);

    const lerpFactor = 1 - Math.exp(-dt * 8.5);
    this.player.pos.x += dx * lerpFactor;
    this.player.pos.y += dy * lerpFactor;
    this.player.pos.z += dz * lerpFactor;

    const moveAmt = clamp(dist3D * 0.45, 0, 1);
    if (distHoriz > 0.08 && this.player.obj) {
      this.player.obj.rotation.y = lerpAngle(
        this.player.obj.rotation.y,
        Math.atan2(dx, dz),
        1 - Math.exp(-dt * 10)
      );
    }
    this.player.ph += dt * (2.5 + moveAmt * 9);

    if (this.player.obj) {
      animChibi(this.player.obj, this.player.ph, moveAmt > 0.05 ? moveAmt : 0, t);
      this.player.obj.position.copy(this.player.pos);
    }

    // Cập nhật vòng tròn sai số GPS tại độ cao Y của người dùng
    if (this.player.gpsAccuracyDisc) {
      const r = clamp(this.currentTelemetry.accuracyMeters, 1.8, 18);
      const pulse = 1 + Math.sin(t * 3.2) * 0.08;
      this.player.gpsAccuracyDisc.position.set(
        this.player.pos.x,
        this.player.pos.y + 0.14,
        this.player.pos.z
      );
      this.player.gpsAccuracyDisc.scale.set(r * pulse, 1, r * pulse);
    }

    // Cập nhật hình chiếu trên mặt sân trường (y = 0.15) và trục đứng Z-Elevation
    if (this.player.gpsGroundShadowRing) {
      this.player.gpsGroundShadowRing.position.set(
        this.player.pos.x,
        0.15,
        this.player.pos.z
      );
    }

    if (this.player.gpsVerticalLine) {
      const posAttr = this.player.gpsVerticalLine.geometry.getAttribute(
        'position'
      ) as THREE.BufferAttribute;
      posAttr.setXYZ(0, this.player.pos.x, 0.15, this.player.pos.z);
      posAttr.setXYZ(1, this.player.pos.x, this.player.pos.y + 0.2, this.player.pos.z);
      posAttr.needsUpdate = true;
      this.player.gpsVerticalLine.visible = Math.abs(this.player.pos.y) > 0.35;
    }

    // Kiểm tra khoảng cách không gian 3 chiều (X, Y, Z) tới các trạm
    let near: Station | null = null;
    let best = 9.5; // Bán kính nhận diện GPS 3D tại trạm
    this.stations
      .filter((st) => st.active !== false)
      .forEach((st) => {
        const d3 = distance3D(
          { x: st.x, y: st.y || 0, z: st.z },
          { x: this.player.pos.x, y: this.player.pos.y, z: this.player.pos.z }
        );
        if (d3 < best) {
          best = d3;
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

    if (this.flagMesh) {
      this.flagMesh.rotation.y = Math.sin(t * 3) * 0.25;
    }

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
    let bd3 = 1e9;
    let bHoriz = 0;
    const activeStations = this.stations.filter((st) => st.active !== false);
    activeStations.forEach((st) => {
      if (this.unlockedMap[st.id] != null) return;
      const d3 = distance3D(
        { x: st.x, y: st.y || 0, z: st.z },
        { x: this.player.pos.x, y: this.player.pos.y, z: this.player.pos.z }
      );
      if (d3 < bd3) {
        bd3 = d3;
        bHoriz = Math.hypot(st.x - this.player.pos.x, st.z - this.player.pos.z);
        best = st;
      }
    });

    let angleRad = 0;
    let deltaFloor = 0;
    if (best) {
      const target = best as Station;
      const vx = target.x - this.player.pos.x;
      const vz = target.z - this.player.pos.z;
      const fx = -Math.sin(this.cam.yaw);
      const fz = -Math.cos(this.cam.yaw);
      const rx = Math.cos(this.cam.yaw);
      const rz = -Math.sin(this.cam.yaw);
      angleRad = Math.atan2(vx * rx + vz * rz, vx * fx + vz * fz);
      const targetFloor = target.floor || 1;
      deltaFloor = targetFloor - this.currentTelemetry.detectedFloor;
    }

    this.callbacks.onGuideUpdate({
      station: best,
      distance: best ? bd3 : 0,
      horizDistance: best ? bHoriz : 0,
      deltaFloor,
      angleRad,
      allDone: best === null && activeStations.length > 0,
    });

    this.callbacks.onMinimapUpdate({
      playerX: this.player.pos.x,
      playerY: this.player.pos.y,
      playerZ: this.player.pos.z,
      playerFloor: this.currentTelemetry.detectedFloor,
      accuracyMeters: this.currentTelemetry.accuracyMeters,
      playerRotY: this.player.obj ? this.player.obj.rotation.y : 0,
      camYaw: this.cam.yaw,
      col: this.col,
    });
  }

  public dispose(): void {
    this.disposed = true;
    this.gpsActive = false;
    if (this.gpsWatchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.gpsWatchId);
    }
    cancelAnimationFrame(this.rafId);
    this.cleanupWindowListeners?.();
    this.resizeObs.disconnect();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
