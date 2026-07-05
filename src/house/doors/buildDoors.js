// ============================================================================
// Builds door frames + leaves at the exact scheduled positions, and returns the
// matching `openings` list that buildWalls() uses to cut the wall gaps.
// Each door is an explicit object (frame jambs + head + a wood leaf).
// ============================================================================
import { MAT_DOOR_LEAF, MAT_DOOR_FRAME, MAT_DOOR_MAIN } from '../../materials/materials.js';
import { boxFromBounds } from '../../utils/box.js';
import { doorHeight } from './doorSchedule.js';

const JAMB = 0.25;      // frame reveal
const LEAF_T = 0.12;    // leaf thickness

// Returns { openings, group }
export function buildDoors(doors, baseY) {
  const group = new THREE.Group();
  group.name = 'doors';
  const openings = [];

  for (const d of doors) {
    const h = doorHeight(d.type);
    openings.push({ o: d.o, a: d.a, at: d.at, width: d.width, kind: 'door', doorH: h });

    const leafMat = d.type === 'main' ? MAT_DOOR_MAIN : MAT_DOOR_LEAF;
    const s0 = d.at, s1 = d.at + d.width;

    if (d.o === 'V') {                 // wall along Z at X=d.a
      const x0 = d.a - LEAF_T / 2, x1 = d.a + LEAF_T / 2;
      group.add(boxFromBounds(x0, x1, baseY + 0.02, baseY + h, s0 + 0.04, s1 - 0.04, leafMat));
      // frame: jambs + head
      group.add(boxFromBounds(d.a - JAMB, d.a + JAMB, baseY, baseY + h, s0 - 0.12, s0, MAT_DOOR_FRAME));
      group.add(boxFromBounds(d.a - JAMB, d.a + JAMB, baseY, baseY + h, s1, s1 + 0.12, MAT_DOOR_FRAME));
      group.add(boxFromBounds(d.a - JAMB, d.a + JAMB, baseY + h, baseY + h + 0.12, s0 - 0.12, s1 + 0.12, MAT_DOOR_FRAME));
    } else {                           // wall along X at Z=d.a
      const z0 = d.a - LEAF_T / 2, z1 = d.a + LEAF_T / 2;
      group.add(boxFromBounds(s0 + 0.04, s1 - 0.04, baseY + 0.02, baseY + h, z0, z1, leafMat));
      group.add(boxFromBounds(s0 - 0.12, s0, baseY, baseY + h, d.a - JAMB, d.a + JAMB, MAT_DOOR_FRAME));
      group.add(boxFromBounds(s1, s1 + 0.12, baseY, baseY + h, d.a - JAMB, d.a + JAMB, MAT_DOOR_FRAME));
      group.add(boxFromBounds(s0 - 0.12, s1 + 0.12, baseY + h, baseY + h + 0.12, d.a - JAMB, d.a + JAMB, MAT_DOOR_FRAME));
    }
  }

  return { openings, group };
}
