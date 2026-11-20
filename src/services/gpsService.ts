import { CAMPUS_BUILDINGS, TDC_GEO_ANCHORS } from '../data/campusBuildings';
import { CAMP } from '../data/campusLayout';
import { ell } from '../engine/threeHelpers';
import { CampusBuildingZone, GpsTelemetry3D } from '../types/game';

/**
 * Chuyển đổi tọa độ GPS thực tế (WGS84 Latitude, Longitude, Altitude ASL)
 * sang hệ tọa độ không gian 3 chiều của khuôn viên TDC (X: Đông/Tây, Y: Cao độ phân tầng, Z: Nam/Bắc)
 */
export function gpsToCampus3D(params: {
  lat: number;
  lng: number;
  altitudeAsl?: number | null;
  groundAltitudeReferenceAsl?: number;
}): {
  x: number;
  y: number;
  z: number;
  insideCampus: boolean;
} {
  const dLat = params.lat - TDC_GEO_ANCHORS.ORIGIN_LAT;
  const dLng = params.lng - TDC_GEO_ANCHORS.ORIGIN_LNG;

  const eastMeters = dLng * TDC_GEO_ANCHORS.METERS_PER_DEG_LNG;
  const northMeters = dLat * TDC_GEO_ANCHORS.METERS_PER_DEG_LAT;

  const cosR = Math.cos(TDC_GEO_ANCHORS.MAP_ROTATION_RAD);
  const sinR = Math.sin(TDC_GEO_ANCHORS.MAP_ROTATION_RAD);

  // Trong Three.js: +X là hướng Đông, -Z là hướng Bắc (+Z là hướng Nam về phía Võ Văn Ngân)
  const x = +(eastMeters * cosR - northMeters * sinR).toFixed(2);
  const z = +(-northMeters * cosR - eastMeters * sinR).toFixed(2);

  const groundRef =
    params.groundAltitudeReferenceAsl ?? TDC_GEO_ANCHORS.GROUND_ALTITUDE_ASL_M;
  const rawY =
    params.altitudeAsl != null && Number.isFinite(params.altitudeAsl)
      ? params.altitudeAsl - groundRef
      : 0;
  // Giới hạn độ cao hợp lệ trong khuôn viên từ tầng hầm (-4.2m) tới đỉnh tháp Tòa D (+50m)
  const y = +Math.max(-TDC_GEO_ANCHORS.FLOOR_HEIGHT_M, Math.min(52, rawY)).toFixed(2);

  const insideCampus = ell(x, z) <= 1.05;

  return { x, y, z, insideCampus };
}

/**
 * Chuyển đổi ngược từ tọa độ 3D khuôn viên TDC (X, Y, Z) sang tọa độ GPS (Lat, Lng, Altitude ASL)
 */
export function campus3DToGps(params: {
  x: number;
  y?: number;
  z: number;
  groundAltitudeReferenceAsl?: number;
}): {
  lat: number;
  lng: number;
  altitudeAsl: number;
} {
  const cosR = Math.cos(-TDC_GEO_ANCHORS.MAP_ROTATION_RAD);
  const sinR = Math.sin(-TDC_GEO_ANCHORS.MAP_ROTATION_RAD);

  const eastMeters = params.x * cosR + params.z * sinR;
  const northMeters = -params.z * cosR + params.x * sinR;

  const lat = +(
    TDC_GEO_ANCHORS.ORIGIN_LAT +
    northMeters / TDC_GEO_ANCHORS.METERS_PER_DEG_LAT
  ).toFixed(6);
  const lng = +(
    TDC_GEO_ANCHORS.ORIGIN_LNG +
    eastMeters / TDC_GEO_ANCHORS.METERS_PER_DEG_LNG
  ).toFixed(6);

  const groundRef =
    params.groundAltitudeReferenceAsl ?? TDC_GEO_ANCHORS.GROUND_ALTITUDE_ASL_M;
  const altitudeAsl = +(groundRef + (params.y || 0)).toFixed(2);

  return { lat, lng, altitudeAsl };
}

/**
 * Nhận diện tòa nhà sinh viên đang đứng (dựa theo mặt phẳng X, Z với dung sai biên GPS)
 */
export function detectBuildingAtPosition(
  x: number,
  z: number,
  marginMeters = 2.5
): CampusBuildingZone | null {
  let bestMatch: CampusBuildingZone | null = null;
  let bestDist = Infinity;

  for (const b of CAMPUS_BUILDINGS) {
    const [x0, z0, x1, z1] = b.bounds;
    if (
      x >= x0 - marginMeters &&
      x <= x1 + marginMeters &&
      z >= z0 - marginMeters &&
      z <= z1 + marginMeters
    ) {
      // Khoảng cách vào tâm tòa nhà để ưu tiên tòa gần nhất nếu đứng ở ranh giới nối
      const cx = (x0 + x1) / 2;
      const cz = (z0 + z1) / 2;
      const d = Math.hypot(x - cx, z - cz);
      if (d < bestDist) {
        bestDist = d;
        bestMatch = b;
      }
    }
  }
  return bestMatch;
}

/**
 * Tính toán Tầng hiện tại (Floor) từ cao độ tương đối Y (mét so với mặt sân trường)
 * và giới hạn theo số tầng thực tế của tòa nhà đang đứng.
 * - Tầng hầm B1: floor = -1 (y <= -1.8m, chỉ có tại Tòa D)
 * - Tầng trệt (Tầng 1): floor = 1 (0m <= y < 4.2m)
 * - Tầng N (N >= 1): floor = 1 + Math.floor((y + 1.2) / 4.2)
 */
export function resolveFloorFromElevation(
  yMeters: number,
  building: CampusBuildingZone | null
): {
  floor: number;
  clampedY: number;
} {
  const fh = building?.floorHeightMeters || TDC_GEO_ANCHORS.FLOOR_HEIGHT_M;

  let floor: number;
  if (yMeters <= -1.8) {
    floor = -1;
  } else {
    floor = Math.max(1, 1 + Math.floor((yMeters + 1.1) / fh));
  }

  if (building) {
    if (floor < building.minFloor) floor = building.minFloor;
    if (floor > building.maxFloor) floor = building.maxFloor;
  } else {
    // Ngoài sân trường không thuộc tòa nhà nào thì mặc định ở mặt đất (Tầng 1 / y = 0)
    if (floor < 1) floor = 1;
    if (floor > 11) floor = 11;
  }

  const clampedY = floor === -1 ? -fh : (floor - 1) * fh;
  return { floor, clampedY: +clampedY.toFixed(2) };
}

/**
 * Chuyển số tầng (floor) sang độ cao Y (mét) trong không gian 3D
 */
export function floorToElevationMeters(
  floor: number,
  building?: CampusBuildingZone | null
): number {
  const fh = building?.floorHeightMeters || TDC_GEO_ANCHORS.FLOOR_HEIGHT_M;
  if (floor === -1) return -fh;
  return Math.max(0, (floor - 1) * fh);
}

/**
 * Tính khoảng cách không gian 3 chiều thực tế (Euclidean 3D distance) giữa 2 điểm (X, Y, Z)
 */
export function distance3D(
  a: { x: number; y?: number; z: number },
  b: { x: number; y?: number; z: number }
): number {
  const dx = a.x - b.x;
  const dy = (a.y || 0) - (b.y || 0);
  const dz = a.z - b.z;
  return Math.hypot(dx, dy, dz);
}

/**
 * Bộ lọc Kalman 1 chiều đơn giản giúp làm mượt nhiễu GPS thực tế trên thiết bị di động
 * đặc biệt là trục cao độ (Altitude) và tọa độ ngang khi đứng gần các tòa nhà cao tầng như Tòa D.
 */
export class GpsKalmanFilter3D {
  private xEst: number | null = null;
  private yEst: number | null = null;
  private zEst: number | null = null;
  private pX = 1;
  private pY = 1;
  private pZ = 1;

  // Nhiễu quá trình (Process noise Q)
  private readonly qHoriz = 0.35;
  private readonly qVert = 0.2;

  public reset(x?: number, y?: number, z?: number): void {
    this.xEst = x ?? null;
    this.yEst = y ?? null;
    this.zEst = z ?? null;
    this.pX = 1;
    this.pY = 1;
    this.pZ = 1;
  }

  public filter(
    rawX: number,
    rawY: number,
    rawZ: number,
    horizAccuracyMeters = 8,
    vertAccuracyMeters = 10
  ): { x: number; y: number; z: number } {
    const rH = Math.max(0.5, Math.min(50, horizAccuracyMeters * 0.25));
    const rV = Math.max(0.5, Math.min(50, vertAccuracyMeters * 0.35));

    if (this.xEst === null || this.yEst === null || this.zEst === null) {
      this.xEst = rawX;
      this.yEst = rawY;
      this.zEst = rawZ;
      return { x: rawX, y: rawY, z: rawZ };
    }

    // Cập nhật trục X
    this.pX += this.qHoriz;
    const kX = this.pX / (this.pX + rH);
    this.xEst = this.xEst + kX * (rawX - this.xEst);
    this.pX = (1 - kX) * this.pX;

    // Cập nhật trục Z
    this.pZ += this.qHoriz;
    const kZ = this.pZ / (this.pZ + rH);
    this.zEst = this.zEst + kZ * (rawZ - this.zEst);
    this.pZ = (1 - kZ) * this.pZ;

    // Cập nhật trục Y (Cao độ)
    this.pY += this.qVert;
    const kY = this.pY / (this.pY + rV);
    this.yEst = this.yEst + kY * (rawY - this.yEst);
    this.pY = (1 - kY) * this.pY;

    return {
      x: +this.xEst.toFixed(2),
      y: +this.yEst.toFixed(2),
      z: +this.zEst.toFixed(2),
    };
  }
}

/**
 * Kẹp tọa độ (X, Z) vào biên elip của khuôn viên TDC nếu bật chế độ giữ trong khuôn viên
 */
export function clampToCampusBoundary(x: number, z: number): { x: number; z: number } {
  const d = ell(x, z);
  if (d <= 0.985) return { x, z };
  const k = 0.985 / d;
  return {
    x: +(CAMP.cx + (x - CAMP.cx) * k).toFixed(2),
    z: +(CAMP.cz + (z - CAMP.cz) * k).toFixed(2),
  };
}

/**
 * Tạo gói dữ liệu Telemetry 3D đầy đủ từ tọa độ 3D hoặc tín hiệu Geolocation
 */
export function buildTelemetryFromCampus3D(params: {
  x: number;
  y: number;
  z: number;
  accuracyMeters?: number;
  altitudeAccuracyMeters?: number | null;
  headingDeg?: number | null;
  speedMps?: number | null;
  source: GpsTelemetry3D['source'];
  lockedFloor?: number | null;
  groundAltitudeReferenceAsl?: number;
}): GpsTelemetry3D {
  const building = detectBuildingAtPosition(params.x, params.z);
  const clampedLockedFloor =
    params.lockedFloor != null
      ? building
        ? Math.max(building.minFloor, Math.min(building.maxFloor, params.lockedFloor))
        : Math.max(-1, Math.min(11, params.lockedFloor))
      : null;

  const resolved =
    clampedLockedFloor != null
      ? {
          floor: clampedLockedFloor,
          clampedY: floorToElevationMeters(clampedLockedFloor, building),
        }
      : resolveFloorFromElevation(params.y, building);

  const effectiveY = clampedLockedFloor != null ? resolved.clampedY : params.y;
  const gps = campus3DToGps({
    x: params.x,
    y: effectiveY,
    z: params.z,
    groundAltitudeReferenceAsl: params.groundAltitudeReferenceAsl,
  });

  return {
    lat: gps.lat,
    lng: gps.lng,
    altitudeAsl: gps.altitudeAsl,
    accuracyMeters: params.accuracyMeters ?? 2.5,
    altitudeAccuracyMeters: params.altitudeAccuracyMeters ?? 3.0,
    headingDeg: params.headingDeg ?? null,
    speedMps: params.speedMps ?? null,
    x: +params.x.toFixed(2),
    y: +effectiveY.toFixed(2),
    z: +params.z.toFixed(2),
    detectedFloor: resolved.floor,
    detectedBuilding: building,
    insideCampus: ell(params.x, params.z) <= 1.05,
    source: params.source,
    timestamp: Date.now(),
  };
}
