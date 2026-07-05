import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { START_TARGET } from '../camera/camera.js';

export function createOrbit(camera, domElement) {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI * 0.495;   // stay above ground
  controls.target.copy(START_TARGET);
  controls.update();
  return controls;
}
