// ============================================================================
// ROOF (Phase 7) — flat RCC roof over the first floor with the real accessories:
//   • roof slabs over every roofed first-floor room (skips balcony + voids)
//   • parapet wall (3') around the roof perimeter (from the exterior edges)
//   • overhead water tank on legs
//   • solar-panel provision (tilted panels on a frame)
//   • rainwater drain pipes at corners
// Correct slab edges: the roof only covers the built mass, leaving the balcony
// and the double-height living/stair voids open.
// ============================================================================
import * as THREE from 'three';
import { CFG } from '../../config.js';
import { MAT_ROOF_SLAB, MAT_ROOF_PARA, MAT_ROOF_TANK, MAT_ROOF_STEEL, MAT_ROOF_SOLAR, MAT_ROOF_PIPE } from '../../materials/materials.js';
import { boxFromBounds } from '../../utils/box.js';
import { deriveWallEdges } from '../walls/deriveEdges.js';

const ROOFED = new Set([undefined, 'room', 'stair', 'open']);   // not balcony/void

export function buildRoof(ffRooms) {
  const group = new THREE.Group();
  group.name = 'roof';
  const y = CFG.ROOF_Y;

  // --- roof slabs over roofed rooms ---
  for (const r of ffRooms) {
    if (!ROOFED.has(r.type)) continue;                 // balcony + voids stay open
    if (r.id === 'ff-corridor' || r.id === 'ff-lobby') { /* still roofed */ }
    group.add(boxFromBounds(r.x1, r.x2, y, y + 0.8, r.z1, r.z2, MAT_ROOF_SLAB));
  }

  // --- parapet: 3' wall along the roof's exterior edges ---
  const ext = deriveWallEdges(ffRooms).filter((e) => e.kind === 'ext');
  for (const e of ext) {
    const t = 0.4 / 2;
    if (e.o === 'V') group.add(boxFromBounds(e.a - t, e.a + t, y + 0.8, y + 3.8, e.lo, e.hi, MAT_ROOF_PARA));
    else             group.add(boxFromBounds(e.lo, e.hi, y + 0.8, y + 3.8, e.a - t, e.a + t, MAT_ROOF_PARA));
  }

  // --- overhead water tank on legs (over the service/east side) ---
  const tx = 54, tz = 6;
  for (const [dx, dz] of [[-2, -2], [2, -2], [-2, 2], [2, 2]])
    group.add(boxFromBounds(tx + dx - 0.15, tx + dx + 0.15, y + 0.8, y + 4, tz + dz - 0.15, tz + dz + 0.15, MAT_ROOF_STEEL));
  group.add(boxFromBounds(tx - 2.5, tx + 2.5, y + 4, y + 8, tz - 2.5, tz + 2.5, MAT_ROOF_TANK));

  // --- solar-panel provision (tilted array on the rear roof) ---
  for (let i = 0; i < 3; i++) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(6, 0.15, 3.2), MAT_ROOF_SOLAR);
    panel.position.set(12 + i * 7, y + 2.2, 8);
    panel.rotation.x = -0.35;
    panel.castShadow = true; panel.receiveShadow = true;
    group.add(panel);
  }

  // --- rainwater drain pipes at corners (roof → ground) ---
  for (const [px, pz] of [[4.4, 2.4], [51.6, 2.4], [4.4, 36], [51.6, 36]]) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, y + 0.8, 10), MAT_ROOF_PIPE);
    pipe.position.set(px, (y + 0.8) / 2, pz);
    group.add(pipe);
  }

  return group;
}
