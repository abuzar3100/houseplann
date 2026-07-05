// ============================================================================
// Builds glass panes + a thin frame at each scheduled window, and returns the
// matching `openings` list (kind:'window') that buildWalls() uses to leave the
// sill + lintel bands and open the glazed span between them.
// ============================================================================
import { MAT_GLASS, MAT_WIN_FRAME } from '../../materials/materials.js';
import { boxFromBounds } from '../../utils/box.js';

const FRAME = 0.15;   // frame section

// Returns { openings, group }
export function buildWindows(windows, baseY) {
  const group = new THREE.Group();
  group.name = 'windows';
  const openings = [];

  for (const w of windows) {
    openings.push({ o: w.o, a: w.a, at: w.at, width: w.width,
      kind: 'window', sill: w.sill, head: w.head });

    const s0 = w.at, s1 = w.at + w.width;
    const y0 = baseY + w.sill, y1 = baseY + w.head;

    if (w.o === 'V') {                 // wall along Z at X=w.a
      const x = w.a;
      group.add(boxFromBounds(x - 0.03, x + 0.03, y0, y1, s0, s1, MAT_GLASS));
      // frame: head, sill, two jambs, a centre mullion
      group.add(boxFromBounds(x - FRAME, x + FRAME, y1 - FRAME, y1, s0, s1, MAT_WIN_FRAME));
      group.add(boxFromBounds(x - FRAME, x + FRAME, y0, y0 + FRAME, s0, s1, MAT_WIN_FRAME));
      group.add(boxFromBounds(x - FRAME, x + FRAME, y0, y1, s0, s0 + FRAME, MAT_WIN_FRAME));
      group.add(boxFromBounds(x - FRAME, x + FRAME, y0, y1, s1 - FRAME, s1, MAT_WIN_FRAME));
      group.add(boxFromBounds(x - FRAME, x + FRAME, y0, y1, (s0 + s1) / 2 - 0.05, (s0 + s1) / 2 + 0.05, MAT_WIN_FRAME));
    } else {                           // wall along X at Z=w.a
      const z = w.a;
      group.add(boxFromBounds(s0, s1, y0, y1, z - 0.03, z + 0.03, MAT_GLASS));
      group.add(boxFromBounds(s0, s1, y1 - FRAME, y1, z - FRAME, z + FRAME, MAT_WIN_FRAME));
      group.add(boxFromBounds(s0, s1, y0, y0 + FRAME, z - FRAME, z + FRAME, MAT_WIN_FRAME));
      group.add(boxFromBounds(s0, s0 + FRAME, y0, y1, z - FRAME, z + FRAME, MAT_WIN_FRAME));
      group.add(boxFromBounds(s1 - FRAME, s1, y0, y1, z - FRAME, z + FRAME, MAT_WIN_FRAME));
      group.add(boxFromBounds((s0 + s1) / 2 - 0.05, (s0 + s1) / 2 + 0.05, y0, y1, z - FRAME, z + FRAME, MAT_WIN_FRAME));
    }
  }

  return { openings, group };
}
