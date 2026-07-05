// ============================================================================
// Builds wall meshes from the derived wall schedule (deriveEdges.js).
// Exterior = 9" thick, Interior = 4½" thick. Each wall is an independent mesh.
//
// `openings` is an EXPLICIT list (no auto-centering) of:
//   { o:'V'|'H', a, at, width, kind:'door'|'window', doorH?, sill?, head? }
//   - o/a identify the wall line, `at` is the start along the wall, `width` the span.
//   - door   -> full-height gap up to doorH (default 7'), solid lintel above.
//   - window -> solid sill (0..sill) and lintel (head..H), open band between.
// Each opening is placed exactly where the drawing shows it.
// ============================================================================
import { CFG } from '../../config.js';
import { MAT_WALL_EXT, MAT_WALL_INT } from '../../materials/materials.js';
import { boxFromBounds } from '../../utils/box.js';

const DEF_DOOR_H = 7;
const DEF_SILL = 2.5;
const DEF_HEAD = 7.5;

export function buildWalls(edges, baseY, openings = []) {
  const group = new THREE.Group();
  group.name = 'walls';

  for (const e of edges) {
    const t = (e.kind === 'ext' ? CFG.WALL_T_EXT : CFG.WALL_T_INT) / 2;
    const mat = e.kind === 'ext' ? MAT_WALL_EXT : MAT_WALL_INT;
    const H = e.height;

    // openings that live on this exact wall line and fit inside this segment
    const ops = openings
      .filter((op) => op.o === e.o && Math.abs(op.a - e.a) < 0.1
        && op.at >= e.lo - 0.01 && op.at + op.width <= e.hi + 0.01)
      .sort((a, b) => a.at - b.at);

    const panel = (s0, s1, vy0, vy1) => {
      if (s1 - s0 < 0.02 || vy1 - vy0 < 0.02) return;
      const m = e.o === 'V'
        ? boxFromBounds(e.a - t, e.a + t, baseY + vy0, baseY + vy1, s0, s1, mat)
        : boxFromBounds(s0, s1, baseY + vy0, baseY + vy1, e.a - t, e.a + t, mat);
      m.userData.wall = { kind: e.kind };
      group.add(m);
    };

    if (ops.length === 0) { panel(e.lo, e.hi, 0, H); continue; }

    let cursor = e.lo;
    for (const op of ops) {
      const oEnd = op.at + op.width;
      panel(cursor, op.at, 0, H);                          // pier before opening
      if (op.kind === 'window') {
        const sill = op.sill ?? DEF_SILL, head = op.head ?? DEF_HEAD;
        panel(op.at, oEnd, 0, sill);                        // sill band
        panel(op.at, oEnd, Math.min(head, H), H);           // lintel band
      } else {
        const dh = Math.min(op.doorH ?? DEF_DOOR_H, H);
        panel(op.at, oEnd, dh, H);                          // lintel over doorway
      }
      cursor = oEnd;
    }
    panel(cursor, e.hi, 0, H);                              // final pier
  }

  return group;
}
