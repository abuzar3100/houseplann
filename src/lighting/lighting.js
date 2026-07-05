import * as THREE from 'three';
import { CFG } from '../config.js';
import { START_TARGET } from '../camera/camera.js';

// Soft daylight: ambient + sky/ground hemisphere + a warm shadow-casting sun.
// (HDRI + night mode arrive in Phase 11.)
export function addLighting(scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  scene.add(new THREE.HemisphereLight(0xdcecff, 0xb7d9a0, 0.75));

  const sun = new THREE.DirectionalLight(0xfff3e0, 2.1);
  sun.position.set(70, 95, 40);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.radius = 3;
  const sc = sun.shadow.camera;
  sc.left = -90; sc.right = 90; sc.top = 90; sc.bottom = -90; sc.near = 1; sc.far = 300;
  sun.target.position.copy(START_TARGET);
  scene.add(sun, sun.target);

  return { sun };
}
