import * as THREE from 'three';
import { Station } from '../types/game';
import { canvasTex } from './threeHelpers';

export interface FogCluster {
  stationId: string;
  group: THREE.Group;
  puffs: { mesh: THREE.Mesh; baseX: number; baseY: number; baseZ: number; phase: number }[];
  groundVeil: THREE.Mesh;
  unlocked: boolean;
  dissolveProgress: number; // 0 = locked (full mist), 1 = completely dissolved
}

export class FogOfWarSystem {
  private scene: THREE.Scene;
  private clusters: Map<string, FogCluster> = new Map();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public buildForStations(stations: Station[], unlockedIds: Record<string, unknown>): void {
    // Clear previous if any
    this.clusters.forEach((c) => {
      this.scene.remove(c.group);
    });
    this.clusters.clear();

    const veilTex = canvasTex(
      128,
      128,
      (g, W, H) => {
        const gr = g.createRadialGradient(W / 2, H / 2, 4, W / 2, H / 2, W / 2);
        gr.addColorStop(0, 'rgba(220, 236, 232, 0.58)');
        gr.addColorStop(0.65, 'rgba(210, 232, 226, 0.35)');
        gr.addColorStop(1, 'rgba(210, 232, 226, 0)');
        g.fillStyle = gr;
        g.fillRect(0, 0, W, H);
      },
      false
    );

    stations.forEach((st, idx) => {
      const isUnlocked = unlockedIds[st.id] != null;
      const group = new THREE.Group();
      const baseY = st.y || 0;
      group.position.set(st.x, baseY, st.z);

      const radius = st.fogRadius || 30;
      const groundVeil = new THREE.Mesh(
        new THREE.CircleGeometry(radius, 32).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({
          map: veilTex,
          transparent: true,
          depthWrite: false,
          opacity: isUnlocked ? 0 : 0.85,
        })
      );
      groundVeil.position.y = 0.25;
      group.add(groundVeil);

      const puffs: FogCluster['puffs'] = [];
      const puffCount = 9;
      for (let i = 0; i < puffCount; i++) {
        const angle = (i / puffCount) * Math.PI * 2 + idx * 0.7;
        const dist = (0.32 + (i % 3) * 0.22) * radius;
        const bx = Math.cos(angle) * dist;
        const bz = Math.sin(angle) * dist;
        const by = 8 + (i % 3) * 4.5;
        const size = 5.5 + (i % 3) * 2.2;

        const mat = new THREE.MeshLambertMaterial({
          color: 0xf2fbf7,
          emissive: 0x7b988e,
          transparent: true,
          depthWrite: false,
          opacity: isUnlocked ? 0 : 0.46,
        });

        const m = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 1), mat);
        m.scale.set(1.35, 0.65, 1.25);
        m.position.set(bx, by, bz);
        group.add(m);
        puffs.push({ mesh: m, baseX: bx, baseY: by, baseZ: bz, phase: i * 1.1 + idx });
      }

      group.visible = !isUnlocked;
      this.scene.add(group);
      this.clusters.set(st.id, {
        stationId: st.id,
        group,
        puffs,
        groundVeil,
        unlocked: isUnlocked,
        dissolveProgress: isUnlocked ? 1 : 0,
      });
    });
  }

  public syncUnlocked(unlockedIds: Record<string, unknown>): void {
    this.clusters.forEach((cluster, id) => {
      const nowUnlocked = unlockedIds[id] != null;
      if (nowUnlocked && !cluster.unlocked) {
        cluster.unlocked = true;
      } else if (!nowUnlocked && cluster.unlocked) {
        cluster.unlocked = false;
        cluster.dissolveProgress = 0;
        cluster.group.visible = true;
      }
    });
  }

  public animate(dt: number, t: number): void {
    this.clusters.forEach((c) => {
      if (!c.group.visible) return;

      if (c.unlocked && c.dissolveProgress < 1) {
        c.dissolveProgress = Math.min(1, c.dissolveProgress + dt * 0.85);
        const rem = 1 - c.dissolveProgress;
        (c.groundVeil.material as THREE.MeshBasicMaterial).opacity = 0.85 * rem;

        c.puffs.forEach((p) => {
          p.mesh.position.y = p.baseY + c.dissolveProgress * 18;
          p.mesh.scale.set(1.35 * (0.4 + 0.6 * rem), 0.65 * rem, 1.25 * (0.4 + 0.6 * rem));
          (p.mesh.material as THREE.MeshLambertMaterial).opacity = 0.46 * rem;
        });

        if (c.dissolveProgress >= 1) {
          c.group.visible = false;
        }
      } else if (!c.unlocked) {
        c.puffs.forEach((p) => {
          p.mesh.position.x = p.baseX + Math.sin(t * 0.55 + p.phase) * 2.1;
          p.mesh.position.y = p.baseY + Math.cos(t * 0.7 + p.phase) * 1.1;
          p.mesh.rotation.y = t * 0.15 + p.phase;
        });
      }
    });
  }
}
