import * as THREE from 'three';
import { CFG } from '../../config.js';
import { getFloorMaterial } from '../../materials/materials.js';
import { boxFromBounds, roomCenter } from '../../utils/box.js';
import { makeLabel } from '../../utils/label.js';

// Builds the coloured floor slabs + name labels for one floor.
// Returns { group, labels } — walls are a separate module (Phase 3).
//
// baseY = finished floor level (0 for GF, CFG.FF_LEVEL for FF).
export function buildFloorPlates(rooms, baseY) {
  const group = new THREE.Group();
  const labels = [];
  const SLAB = 0.4;

  rooms.forEach((room, i) => {
    // 'void' = double-height opening → no slab on this floor.
    if (room.type === 'void') return;

    const isPool = room.type === 'pool';
    // tiny per-room Y nudge avoids z-fighting where measured rects abut
    const top = baseY - i * 0.004;

    const mat = getFloorMaterial(room);

    const bottom = isPool ? top - 3.2 : top - SLAB;
    const slab = boxFromBounds(room.x1, room.x2, bottom, top, room.z1, room.z2, mat);
    slab.userData.roomId = room.id;
    group.add(slab);

    // label floats above the slab centre
    const c = roomCenter(room);
    const lbl = makeLabel(room.label, c.x, baseY + 2.4, c.z);
    group.add(lbl);
    labels.push(lbl);
  });

  return { group, labels };
}
