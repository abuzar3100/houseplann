import * as THREE from 'three';
import { CFG } from '../config.js';

// Isometric start pose looking at the plot centre.
export const START_POS = new THREE.Vector3(105, 82, 108);
export const START_TARGET = new THREE.Vector3(CFG.PLOT_W / 2, 6, CFG.PLOT_D / 2);

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    45, window.innerWidth / window.innerHeight, 0.5, 2000,
  );
  camera.position.copy(START_POS);
  return camera;
}
