// ============================================================================
// Door interaction — press F to open/close the nearest door. Smoothly animates
// every leaf's hinge each frame. Works in both orbit and walk mode.
// ============================================================================
import * as THREE from 'three';

const REACH = 9;          // ft — how close camera must be to toggle a door
const SPEED = 6;          // rad/s ease speed

export function createDoorController(camera, leafGroups) {
  // flatten all door leaves from every floor
  const leaves = leafGroups.flat();
  for (const l of leaves) { l.want = l.closed; l.cur = l.closed; l.isOpen = false; }

  const p = new THREE.Vector2();

  function toggleNearest() {
    p.set(camera.position.x, camera.position.z);
    let best = null, bestD = REACH * REACH;
    for (const l of leaves) {
      const dx = l.hx - p.x, dz = l.hz - p.y;
      const d = dx * dx + dz * dz;
      if (d < bestD) { bestD = d; best = l; }
    }
    if (best) { best.isOpen = !best.isOpen; best.want = best.isOpen ? best.open : best.closed; }
    return !!best;
  }

  function openAll(on) {
    for (const l of leaves) { l.isOpen = on; l.want = on ? l.open : l.closed; }
  }

  function update(dt) {
    const step = Math.min(1, SPEED * dt);
    for (const l of leaves) {
      if (Math.abs(l.cur - l.want) < 0.001) continue;
      l.cur += (l.want - l.cur) * step;
      l.pivot.rotation.y = l.cur;
    }
  }

  function onKey(e) { if (e.code === 'KeyF') toggleNearest(); }
  document.addEventListener('keydown', onKey);

  return { update, toggleNearest, openAll, leaves };
}
