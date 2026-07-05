// ============================================================================
// Builds door frames + hinged leaves at scheduled positions, plus the matching
// `openings` list buildWalls() uses to cut wall gaps.
// Each leaf sits on a PIVOT group hinged at one jamb so it can swing open (F).
// Returns { openings, group, leaves } where leaves = [{ pivot, closed, open, hx, hz }].
// ============================================================================
import * as THREE from 'three';
import { MAT_DOOR_LEAF, MAT_DOOR_FRAME, MAT_DOOR_MAIN } from '../../materials/materials.js';
import { boxFromBounds } from '../../utils/box.js';
import { doorHeight } from './doorSchedule.js';

const JAMB = 0.25;      // frame reveal
const LEAF_T = 0.12;    // leaf thickness

export function buildDoors(doors, baseY) {
  const group = new THREE.Group();
  group.name = 'doors';
  const openings = [];
  const leaves = [];

  for (const d of doors) {
    const h = doorHeight(d.type);
    openings.push({ o: d.o, a: d.a, at: d.at, width: d.width, kind: 'door', doorH: h });

    const leafMat = d.type === 'main' ? MAT_DOOR_MAIN : MAT_DOOR_LEAF;
    const s0 = d.at, s1 = d.at + d.width;
    const w = d.width - 0.08;                 // leaf width (small reveal)

    // pivot hinged at s0 end of the opening
    const pivot = new THREE.Group();
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(w, h - 0.04, LEAF_T), leafMat);
    leaf.castShadow = true; leaf.receiveShadow = true;

    if (d.o === 'V') {                          // wall along Z at X=d.a → leaf spans Z
      pivot.position.set(d.a, baseY + 0.02, s0);
      leaf.rotation.y = Math.PI / 2;            // orient leaf to run along Z
      leaf.position.set(0, (h - 0.04) / 2, w / 2 + 0.04);
      group.add(boxFromBounds(d.a - JAMB, d.a + JAMB, baseY, baseY + h, s0 - 0.12, s0, MAT_DOOR_FRAME));
      group.add(boxFromBounds(d.a - JAMB, d.a + JAMB, baseY, baseY + h, s1, s1 + 0.12, MAT_DOOR_FRAME));
      group.add(boxFromBounds(d.a - JAMB, d.a + JAMB, baseY + h, baseY + h + 0.12, s0 - 0.12, s1 + 0.12, MAT_DOOR_FRAME));
    } else {                                    // wall along X at Z=d.a → leaf spans X
      pivot.position.set(s0, baseY + 0.02, d.a);
      leaf.position.set(w / 2 + 0.04, (h - 0.04) / 2, 0);
      group.add(boxFromBounds(s0 - 0.12, s0, baseY, baseY + h, d.a - JAMB, d.a + JAMB, MAT_DOOR_FRAME));
      group.add(boxFromBounds(s1, s1 + 0.12, baseY, baseY + h, d.a - JAMB, d.a + JAMB, MAT_DOOR_FRAME));
      group.add(boxFromBounds(s0 - 0.12, s1 + 0.12, baseY + h, baseY + h + 0.12, d.a - JAMB, d.a + JAMB, MAT_DOOR_FRAME));
    }

    pivot.add(leaf);
    group.add(pivot);
    leaves.push({ pivot, closed: 0, open: -Math.PI / 2 * 0.95, hx: pivot.position.x, hz: pivot.position.z });
  }

  return { openings, group, leaves };
}
