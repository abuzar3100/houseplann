import * as THREE from 'three';
import { CFG } from '../config.js';
import { MAT_GROUND } from '../materials/materials.js';

// Scene with a soft sky gradient background, gentle fog, and a landscaping ground plane.
export function createScene() {
  const scene = new THREE.Scene();

  // vertical sky gradient
  const cnv = document.createElement('canvas');
  cnv.width = 2; cnv.height = 256;
  const ctx = cnv.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0.0, '#aecbe8');
  g.addColorStop(0.5, '#d8e6f2');
  g.addColorStop(1.0, '#eef2f5');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 2, 256);
  const tex = new THREE.CanvasTexture(cnv);
  tex.colorSpace = THREE.SRGBColorSpace;
  scene.background = tex;
  scene.fog = new THREE.Fog('#e6edf3', 160, 320);

  // ground / landscaping
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(240, 240),
    MAT_GROUND,
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(CFG.PLOT_W / 2, -0.5, CFG.PLOT_D / 2);
  ground.receiveShadow = true;
  scene.add(ground);

  return scene;
}
