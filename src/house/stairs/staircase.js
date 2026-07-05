// ============================================================================
// STAIRCASE — explicit U-return (half-turn) stair with real, walkable steps.
// Fits the plan's stair well (X25-34, Z2-19) and rises the full floor height.
//
// Two flights side-by-side with a half-landing at the back:
//   • Flight A (right half) ascends front → back to the half-landing (½ height)
//   • Half-landing (full width) at the back
//   • Flight B (left half) ascends back → front to the first-floor level
// Real geometric treads (no invisible ramp). Returns { group, stepBoxes } where
// stepBoxes are the walkable top surfaces used later by walk-mode collision.
// ============================================================================
import * as THREE from 'three';
import { MAT_STEP, MAT_LANDING, MAT_RAILING, MAT_NEWEL } from '../../materials/materials.js';
import { boxFromBounds } from '../../utils/box.js';

export function buildStaircase({ x1, x2, z1, z2, baseY = 0, rise = 11 }) {
  const group = new THREE.Group();
  group.name = 'staircase';
  const stepBoxes = [];

  const xMid = (x1 + x2) / 2;          // split into two flights
  const N = 18;                         // total risers (11' / 18 ≈ 7.3")
  const nPer = N / 2;                   // 9 per flight
  const riser = rise / N;
  const tread = 0.92;                   // going per step
  const halfY = nPer * riser;          // landing height

  const front = z2 - 1;                        // bottom step / arrival edge
  const landBackZ = front - nPer * tread;      // where the flights meet the landing

  const addStep = (sx1, sx2, sz1, sz2, yTop) => {
    group.add(boxFromBounds(sx1, sx2, baseY, baseY + yTop, sz1, sz2, MAT_STEP));
    stepBoxes.push({ x1: sx1, x2: sx2, z1: sz1, z2: sz2, top: baseY + yTop });
  };

  // Flight A — right half, ascends front → back
  for (let i = 0; i < nPer; i++) {
    addStep(x1, xMid, front - (i + 1) * tread, front - i * tread, (i + 1) * riser);
  }

  // Half-landing, full width, at the back
  group.add(boxFromBounds(x1, x2, baseY, baseY + halfY, z1 + 0.5, landBackZ, MAT_LANDING));
  stepBoxes.push({ x1, x2, z1: z1 + 0.5, z2: landBackZ, top: baseY + halfY });

  // Flight B — left half, ascends back → front to first-floor level
  for (let i = 0; i < nPer; i++) {
    addStep(xMid, x2, landBackZ + i * tread, landBackZ + (i + 1) * tread, halfY + (i + 1) * riser);
  }

  // Central newel wall between the two flights
  group.add(boxFromBounds(xMid - 0.15, xMid + 0.15, baseY, baseY + halfY + 3, landBackZ, front, MAT_NEWEL));

  // Simple railing along the two open (outer) sides of the flights
  addRail(group, x1 + 0.05, x1 + 0.05, front, landBackZ, baseY, 0, halfY);          // A outer
  addRail(group, x2 - 0.05, x2 - 0.05, landBackZ, front, baseY, halfY, rise);        // B outer

  return { group, stepBoxes };
}

// Diagonal handrail + posts along a flight edge (x fixed, z0→z1, y0→y1)
function addRail(group, xa, xb, z0, z1, baseY, y0, y1) {
  const n = 5;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const z = z0 + (z1 - z0) * t;
    const y = baseY + y0 + (y1 - y0) * t;
    group.add(boxFromBounds(xa - 0.06, xa + 0.06, y, y + 3, z - 0.06, z + 0.06, MAT_RAILING)); // post
  }
  // top rail (approximate as short segments)
  for (let i = 0; i < n; i++) {
    const zA = z0 + (z1 - z0) * (i / n), zB = z0 + (z1 - z0) * ((i + 1) / n);
    const yA = baseY + y0 + (y1 - y0) * (i / n) + 3;
    group.add(boxFromBounds(xa - 0.08, xa + 0.08, yA - 0.08, yA + 0.08, Math.min(zA, zB), Math.max(zA, zB), MAT_RAILING));
  }
}
